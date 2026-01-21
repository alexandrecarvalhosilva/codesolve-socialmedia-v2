import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ArrowUp, 
  ArrowDown, 
  CreditCard, 
  Calendar, 
  AlertCircle,
  Check,
  Loader2,
  Wallet,
  Lock,
  CheckCircle
} from 'lucide-react';
import { BillingPlan, formatPrice, PaymentMethodType } from '@/types/billing';
import { 
  calculatePlanChange, 
  formatPlanChangeResult,
  SubscriptionPeriod 
} from '@/lib/billingCalculations';
import { processUpgrade, ProcessUpgradeResult } from '@/services/stripeService';
import { 
  sendPlanChangeNotification, 
  sendCreditsEarnedNotification 
} from '@/services/emailNotificationService';
import { 
  addPlanChangeHistory, 
  addCreditTransaction,
  getTenantCreditBalance 
} from '@/services/billingService';
import { toast } from 'sonner';

interface PlanChangeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: BillingPlan;
  newPlan: BillingPlan;
  subscriptionPeriod: SubscriptionPeriod;
  onConfirm: () => void;
  tenantId?: string;
  tenantName?: string;
  tenantEmail?: string;
}

type Step = 'review' | 'payment' | 'processing' | 'success';

export function PlanChangeModal({
  open,
  onOpenChange,
  currentPlan,
  newPlan,
  subscriptionPeriod,
  onConfirm,
  tenantId = '1',
  tenantName = 'SIX BLADES - LAGO OESTE',
  tenantEmail = 'admin@tenant.com'
}: PlanChangeModalProps) {
  const [step, setStep] = useState<Step>('review');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [useCredits, setUseCredits] = useState(true);
  const [result, setResult] = useState<ProcessUpgradeResult | null>(null);
  
  // Get available credits
  const availableCredits = getTenantCreditBalance(tenantId);
  
  // Calcular proration
  const changeResult = useMemo(() => {
    return calculatePlanChange(
      currentPlan.slug,
      newPlan.slug,
      subscriptionPeriod
    );
  }, [currentPlan.slug, newPlan.slug, subscriptionPeriod]);
  
  const formattedResult = useMemo(() => {
    if (!changeResult) return null;
    return formatPlanChangeResult(changeResult);
  }, [changeResult]);
  
  if (!changeResult || !formattedResult) {
    return null;
  }
  
  const isUpgrade = changeResult.type === 'upgrade';
  const isDowngrade = changeResult.type === 'downgrade';
  
  // Calculate final amount after credits
  const creditsToApply = useCredits ? Math.min(availableCredits, Math.max(0, changeResult.proratedAmount)) : 0;
  const finalAmount = Math.max(0, changeResult.proratedAmount - creditsToApply);
  
  const resetModal = () => {
    setStep('review');
    setCardNumber('');
    setCardExpiry('');
    setCardCvc('');
    setCardName('');
    setResult(null);
  };
  
  const handleClose = () => {
    resetModal();
    onOpenChange(false);
  };
  
  const handleProceedToPayment = () => {
    if (isDowngrade || finalAmount === 0) {
      // No payment needed, process directly
      handleProcessChange();
    } else {
      setStep('payment');
    }
  };
  
  const handleProcessChange = async () => {
    setStep('processing');
    
    try {
      // Parse card expiry
      const [expMonth, expYear] = cardExpiry.split('/').map(s => parseInt(s.trim()));
      
      // Process payment via Stripe service
      const upgradeResult = await processUpgrade({
        tenantId,
        tenantName,
        currentPlan,
        newPlan,
        billingCycle: subscriptionPeriod.cycle,
        addons: [],
        proratedAmount: changeResult.proratedAmount,
        creditsToApply,
        paymentMethod: {
          tenantId,
          type: paymentMethod,
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardExpMonth: expMonth || 12,
          cardExpYear: expYear ? 2000 + expYear : 2027,
          cardHolderName: cardName,
        },
      });
      
      setResult(upgradeResult);
      
      if (upgradeResult.success) {
        // Record plan change history
        addPlanChangeHistory({
          tenantId,
          tenantName,
          changeType: isUpgrade ? 'upgrade' : 'downgrade',
          fromPlanId: currentPlan.id,
          fromPlanName: currentPlan.name,
          toPlanId: newPlan.id,
          toPlanName: newPlan.name,
          fromCycle: subscriptionPeriod.cycle,
          toCycle: subscriptionPeriod.cycle,
          proratedAmount: isUpgrade ? finalAmount : 0,
          creditsApplied: creditsToApply,
          creditsGenerated: isDowngrade ? Math.abs(changeResult.proratedAmount) : 0,
          effectiveDate: new Date().toISOString(),
          reason: null,
          processedBy: null,
          stripePaymentIntentId: upgradeResult.paymentIntentId,
          status: 'completed',
        });
        
        // Handle credits for downgrade
        if (isDowngrade && changeResult.proratedAmount < 0) {
          const creditsGenerated = Math.abs(changeResult.proratedAmount);
          addCreditTransaction(
            tenantId,
            'earned',
            creditsGenerated,
            `Crédito por downgrade de ${currentPlan.name} para ${newPlan.name}`,
            'plan_change',
            null,
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year expiry
          );
          
          // Send email notification for credits earned
          await sendCreditsEarnedNotification(
            tenantId,
            tenantName,
            tenantEmail,
            'Administrador',
            creditsGenerated,
            `Downgrade de ${currentPlan.name} para ${newPlan.name}`,
            new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
          );
        }
        
        // Deduct used credits
        if (creditsToApply > 0) {
          addCreditTransaction(
            tenantId,
            'spent',
            -creditsToApply,
            `Crédito aplicado no upgrade para ${newPlan.name}`,
            'plan_change'
          );
        }
        
        // Send plan change email notification
        await sendPlanChangeNotification(
          tenantId,
          tenantName,
          tenantEmail,
          'Administrador',
          isUpgrade,
          currentPlan.name,
          newPlan.name,
          finalAmount,
          isDowngrade ? Math.abs(changeResult.proratedAmount) : undefined
        );
        
        setStep('success');
      } else {
        toast.error('Falha no pagamento', {
          description: upgradeResult.error || 'Tente novamente ou use outro método de pagamento.',
        });
        setStep('payment');
      }
    } catch (error) {
      toast.error('Erro ao processar', {
        description: 'Ocorreu um erro inesperado. Tente novamente.',
      });
      setStep('review');
    }
  };
  
  const handleFinish = () => {
    toast.success(
      isUpgrade 
        ? `Upgrade para ${newPlan.name} realizado com sucesso!`
        : `Alteração para ${newPlan.name} realizada!`,
      {
        description: isUpgrade
          ? 'Os novos recursos já estão disponíveis.'
          : 'Créditos foram adicionados à sua conta.'
      }
    );
    
    onConfirm();
    handleClose();
  };
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-cs-bg-card border-border max-w-lg">
        {step === 'review' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {isUpgrade ? (
                  <ArrowUp className="h-5 w-5 text-green-500" />
                ) : (
                  <ArrowDown className="h-5 w-5 text-orange-500" />
                )}
                {isUpgrade ? 'Confirmar Upgrade' : 'Confirmar Alteração de Plano'}
              </DialogTitle>
              <DialogDescription>
                {formattedResult.summary}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Plan comparison */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div className="text-center flex-1">
                  <p className="text-sm text-muted-foreground">Plano atual</p>
                  <p className="font-semibold text-foreground">{currentPlan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(currentPlan.basePrice)}/mês
                  </p>
                </div>
                
                <div className="px-4">
                  {isUpgrade ? (
                    <ArrowUp className="h-6 w-6 text-green-500" />
                  ) : (
                    <ArrowDown className="h-6 w-6 text-orange-500" />
                  )}
                </div>
                
                <div className="text-center flex-1">
                  <p className="text-sm text-muted-foreground">Novo plano</p>
                  <p className="font-semibold text-primary">{newPlan.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(newPlan.basePrice)}/mês
                  </p>
                </div>
              </div>
              
              <Separator />
              
              {/* Proration details */}
              <div className="space-y-3">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Cálculo Proporcional
                </h4>
                
                {changeResult.breakdown.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-muted-foreground">{item.description}</span>
                    <span className={
                      item.type === 'credit' 
                        ? 'text-green-500 font-medium' 
                        : 'text-foreground font-medium'
                    }>
                      {item.type === 'credit' ? '-' : '+'}{formatPrice(Math.abs(item.amount))}
                    </span>
                  </div>
                ))}
                
                {/* Credits section */}
                {availableCredits > 0 && changeResult.proratedAmount > 0 && (
                  <>
                    <Separator />
                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-purple-500" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Usar créditos disponíveis</p>
                          <p className="text-xs text-muted-foreground">
                            Saldo: {formatPrice(availableCredits)}
                          </p>
                        </div>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useCredits}
                          onChange={(e) => setUseCredits(e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className="text-sm text-purple-500 font-medium">
                          -{formatPrice(creditsToApply)}
                        </span>
                      </label>
                    </div>
                  </>
                )}
                
                <Separator />
                
                <div className="flex justify-between items-center">
                  <span className="font-medium text-foreground">
                    {changeResult.proratedAmount >= 0 ? 'Total a pagar' : 'Crédito gerado'}
                  </span>
                  <Badge 
                    variant="default"
                    className={changeResult.proratedAmount >= 0 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-green-500/10 text-green-500 border-green-500/20'
                    }
                  >
                    {formatPrice(Math.abs(isUpgrade ? finalAmount : changeResult.proratedAmount))}
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              {/* Additional info */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Próxima cobrança: {changeResult.nextBillingDate.toLocaleDateString('pt-BR')}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>
                    {isUpgrade 
                      ? 'Novos recursos disponíveis imediatamente' 
                      : 'Crédito aplicado na próxima fatura'
                    }
                  </span>
                </div>
              </div>
              
              {/* Downgrade warning */}
              {isDowngrade && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-500">Atenção ao fazer downgrade</p>
                    <p className="text-muted-foreground mt-1">
                      Você perderá acesso a recursos do plano atual. Dados não serão excluídos, 
                      mas ficarão inacessíveis até fazer upgrade novamente.
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleProceedToPayment}
                className={isUpgrade ? 'btn-gradient' : 'bg-cs-cyan hover:bg-cs-cyan/90'}
              >
                {isUpgrade && finalAmount > 0 ? 'Continuar para Pagamento' : 'Confirmar Alteração'}
              </Button>
            </DialogFooter>
          </>
        )}
        
        {step === 'payment' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Pagamento Seguro
              </DialogTitle>
              <DialogDescription>
                Total a pagar: {formatPrice(finalAmount)}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* Payment method selection */}
              <div className="space-y-3">
                <Label>Método de pagamento</Label>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethodType)}
                  className="grid grid-cols-3 gap-3"
                >
                  <Label
                    htmlFor="credit_card"
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'credit_card' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <RadioGroupItem value="credit_card" id="credit_card" className="sr-only" />
                    <CreditCard className="h-5 w-5 mr-2" />
                    Cartão
                  </Label>
                  <Label
                    htmlFor="pix"
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <RadioGroupItem value="pix" id="pix" className="sr-only" />
                    PIX
                  </Label>
                  <Label
                    htmlFor="boleto"
                    className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'boleto' ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <RadioGroupItem value="boleto" id="boleto" className="sr-only" />
                    Boleto
                  </Label>
                </RadioGroup>
              </div>
              
              {paymentMethod === 'credit_card' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do cartão</Label>
                    <Input
                      id="cardNumber"
                      placeholder="0000 0000 0000 0000"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      maxLength={19}
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardExpiry">Validade</Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/AA"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                        className="bg-cs-bg-primary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardCvc">CVC</Label>
                      <Input
                        id="cardCvc"
                        placeholder="123"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        maxLength={4}
                        type="password"
                        className="bg-cs-bg-primary border-border"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nome no cartão</Label>
                    <Input
                      id="cardName"
                      placeholder="NOME COMPLETO"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                </div>
              )}
              
              {paymentMethod === 'pix' && (
                <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg">
                  <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center mb-4">
                    <p className="text-xs text-gray-500 text-center">QR Code PIX<br/>(simulado)</p>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Escaneie o QR Code ou copie o código PIX
                  </p>
                </div>
              )}
              
              {paymentMethod === 'boleto' && (
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">
                    O boleto será gerado após a confirmação e enviado por email.
                    <br />
                    Prazo de compensação: até 3 dias úteis.
                  </p>
                </div>
              )}
              
              {/* Security badge */}
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Lock className="h-3 w-3" />
                Pagamento processado com segurança via Stripe
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('review')}>
                Voltar
              </Button>
              <Button 
                onClick={handleProcessChange}
                className="btn-gradient"
                disabled={paymentMethod === 'credit_card' && (!cardNumber || !cardExpiry || !cardCvc || !cardName)}
              >
                Pagar {formatPrice(finalAmount)}
              </Button>
            </DialogFooter>
          </>
        )}
        
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium text-foreground">Processando pagamento...</p>
            <p className="text-sm text-muted-foreground mt-1">Por favor, aguarde</p>
          </div>
        )}
        
        {step === 'success' && result && (
          <>
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {isUpgrade ? 'Upgrade Realizado!' : 'Alteração Confirmada!'}
              </h3>
              <p className="text-muted-foreground text-center">
                {isUpgrade 
                  ? `Seu plano foi atualizado para ${newPlan.name}`
                  : `Você receberá ${formatPrice(Math.abs(changeResult.proratedAmount))} em créditos`
                }
              </p>
              
              {/* Receipt summary */}
              <div className="w-full mt-6 p-4 bg-muted/30 rounded-lg space-y-2">
                {result.receipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{item.description}</span>
                    <span className={item.amount < 0 ? 'text-green-500' : 'text-foreground'}>
                      {formatPrice(item.amount)}
                    </span>
                  </div>
                ))}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total pago</span>
                  <span className="text-primary">{formatPrice(result.receipt.total)}</span>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleFinish} className="w-full btn-gradient">
                Concluir
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}