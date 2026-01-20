import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  CreditCard, 
  Shield, 
  Zap, 
  ArrowLeft, 
  Loader2,
  Lock,
  Calendar,
  Receipt
} from 'lucide-react';
import { toast } from 'sonner';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 97,
    description: 'Ideal para pequenos negócios',
    features: [
      '1.000 mensagens/mês',
      '1 número de WhatsApp',
      'IA básica',
      'Suporte por email',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 197,
    description: 'Para negócios em crescimento',
    popular: true,
    features: [
      '5.000 mensagens/mês',
      '3 números de WhatsApp',
      'IA avançada',
      'Integrações',
      'Suporte prioritário',
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 497,
    description: 'Para grandes operações',
    features: [
      'Mensagens ilimitadas',
      'Números ilimitados',
      'IA personalizada',
      'API completa',
      'Gerente de conta dedicado',
    ],
  },
];

export default function Upgrade() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState('professional');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: '',
  });

  const selectedPlanData = plans.find(p => p.id === selectedPlan)!;
  const discount = billingCycle === 'yearly' ? 0.2 : 0;
  const monthlyPrice = selectedPlanData.price * (1 - discount);
  const totalPrice = billingCycle === 'yearly' ? monthlyPrice * 12 : monthlyPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simular processamento de pagamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast.success('Assinatura realizada com sucesso!', {
      description: `Você agora é assinante do plano ${selectedPlanData.name}.`
    });
    
    setIsProcessing(false);
    navigate('/tenant/dashboard');
  };

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

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <TenantLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link to="/tenant/billing/plans">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos planos
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Finalizar Assinatura</h1>
          <p className="text-muted-foreground mt-2">
            Complete seu pagamento para ativar o plano escolhido
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Plan Selection & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Selection */}
            <Card className="bg-cs-bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Escolha seu plano
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan} className="grid gap-4">
                  {plans.map((plan) => (
                    <div key={plan.id} className="relative">
                      <RadioGroupItem value={plan.id} id={plan.id} className="peer sr-only" />
                      <Label
                        htmlFor={plan.id}
                        className={`
                          flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                          peer-checked:border-primary peer-checked:bg-primary/5
                          ${plan.popular ? 'border-primary/50' : 'border-border'}
                          hover:border-primary/70
                        `}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground">{plan.name}</span>
                            {plan.popular && (
                              <Badge className="bg-primary/20 text-primary border-0">Popular</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-foreground">
                            R$ {Math.round(plan.price * (1 - discount))}
                          </span>
                          <span className="text-muted-foreground">/mês</span>
                          {discount > 0 && (
                            <p className="text-xs text-primary">
                              Economize {discount * 100}%
                            </p>
                          )}
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                {/* Billing Cycle */}
                <div className="mt-6 p-4 rounded-xl bg-muted/30">
                  <p className="text-sm font-medium text-foreground mb-3">Ciclo de cobrança</p>
                  <div className="flex gap-4">
                    <Button
                      variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                      onClick={() => setBillingCycle('monthly')}
                      className="flex-1"
                    >
                      Mensal
                    </Button>
                    <Button
                      variant={billingCycle === 'yearly' ? 'default' : 'outline'}
                      onClick={() => setBillingCycle('yearly')}
                      className="flex-1"
                    >
                      <span>Anual</span>
                      <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary border-0">
                        -20%
                      </Badge>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="bg-cs-bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Dados do cartão
                </CardTitle>
                <CardDescription>
                  Seus dados são criptografados e seguros
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Número do cartão</Label>
                    <div className="relative">
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardData.number}
                        onChange={(e) => setCardData({
                          ...cardData,
                          number: formatCardNumber(e.target.value)
                        })}
                        maxLength={19}
                        className="bg-cs-bg-primary border-border pl-10"
                      />
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cardName">Nome no cartão</Label>
                    <Input
                      id="cardName"
                      placeholder="NOME COMO ESTÁ NO CARTÃO"
                      value={cardData.name}
                      onChange={(e) => setCardData({
                        ...cardData,
                        name: e.target.value.toUpperCase()
                      })}
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Validade</Label>
                      <div className="relative">
                        <Input
                          id="expiry"
                          placeholder="MM/AA"
                          value={cardData.expiry}
                          onChange={(e) => setCardData({
                            ...cardData,
                            expiry: formatExpiry(e.target.value)
                          })}
                          maxLength={5}
                          className="bg-cs-bg-primary border-border pl-10"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <div className="relative">
                        <Input
                          id="cvc"
                          placeholder="123"
                          value={cardData.cvc}
                          onChange={(e) => setCardData({
                            ...cardData,
                            cvc: e.target.value.replace(/\D/g, '')
                          })}
                          maxLength={4}
                          className="bg-cs-bg-primary border-border pl-10"
                        />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <Button 
                    type="submit" 
                    className="w-full btn-gradient h-12 text-lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-5 w-5" />
                        Assinar por R$ {Math.round(totalPrice)}{billingCycle === 'yearly' ? '/ano' : '/mês'}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Pagamento seguro com criptografia SSL</span>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="bg-cs-bg-card border-border sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Resumo do pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano {selectedPlanData.name}</span>
                  <span className="font-medium">R$ {selectedPlanData.price}/mês</span>
                </div>
                
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Desconto anual (-20%)</span>
                    <span>-R$ {Math.round(selectedPlanData.price * discount)}/mês</span>
                  </div>
                )}

                <Separator />
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal mensal</span>
                  <span className="font-medium">R$ {Math.round(monthlyPrice)}/mês</span>
                </div>

                <div className="flex justify-between text-lg font-bold">
                  <span>Total {billingCycle === 'yearly' ? 'anual' : 'mensal'}</span>
                  <span className="text-primary">R$ {Math.round(totalPrice)}</span>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">Incluído no plano:</p>
                  {selectedPlanData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
                  <p className="text-sm text-primary font-medium">
                    🎉 Garantia de 7 dias
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Não ficou satisfeito? Devolvemos 100% do valor.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TenantLayout>
  );
}
