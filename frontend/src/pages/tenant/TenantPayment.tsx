import { useState } from 'react';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  ArrowLeft, 
  CreditCard, 
  QrCode, 
  FileText,
  Check,
  Copy,
  Loader2
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { CouponInput } from '@/components/billing/CouponInput';
import { mockInvoices } from '@/data/billingMockData';
import { formatPrice, PaymentMethodType } from '@/types/billing';
import { toast } from 'sonner';

export default function TenantPayment() {
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoice');
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('credit_card');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  // Mock invoice
  const invoice = invoiceId 
    ? mockInvoices.find(inv => inv.id === invoiceId)
    : mockInvoices.find(inv => inv.status === 'pending');

  if (!invoice) {
    return (
      <TenantLayout>
        <div className="p-6">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Nenhuma fatura pendente encontrada.</p>
              <Button asChild className="mt-4">
                <Link to="/tenant/billing/invoices">Ver Faturas</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </TenantLayout>
    );
  }

  const subtotal = invoice.total;
  const discount = appliedDiscount;
  const total = subtotal - discount;

  const handleApplyCoupon = (couponCode: string, discountValue: number) => {
    setAppliedCoupon(couponCode);
    setAppliedDiscount(discountValue);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setAppliedDiscount(0);
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    // Simula processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setIsPaid(true);
    toast.success('Pagamento realizado com sucesso!');
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix...');
    toast.success('Código PIX copiado!');
  };

  if (isPaid) {
    return (
      <TenantLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <Card className="bg-cs-bg-card border-cs-success max-w-md w-full">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-cs-success/10 flex items-center justify-center">
                <Check className="h-8 w-8 text-cs-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Pagamento Confirmado!</h2>
              <p className="text-muted-foreground">
                O pagamento de {formatPrice(total)} foi processado com sucesso.
              </p>
              <div className="pt-4 space-y-2">
                <Button asChild className="w-full">
                  <Link to="/tenant/billing/invoices">Ver Faturas</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/tenant/billing">Voltar para Cobrança</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/tenant/billing">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Realizar Pagamento</h1>
            <p className="text-muted-foreground">Fatura {invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Método de pagamento */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-cs-bg-card border-border">
              <CardHeader>
                <CardTitle>Método de Pagamento</CardTitle>
                <CardDescription>Escolha como deseja pagar</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethodType)}
                  className="space-y-3"
                >
                  <label 
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === 'credit_card' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="credit_card" />
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Cartão de Crédito</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, Elo</p>
                    </div>
                  </label>

                  <label 
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === 'pix' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="pix" />
                    <QrCode className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">PIX</p>
                      <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                    </div>
                  </label>

                  <label 
                    className={`flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                      paymentMethod === 'boleto' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <RadioGroupItem value="boleto" />
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">Boleto Bancário</p>
                      <p className="text-sm text-muted-foreground">Vence em 3 dias úteis</p>
                    </div>
                  </label>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Formulário específico do método */}
            {paymentMethod === 'credit_card' && (
              <Card className="bg-cs-bg-card border-border">
                <CardHeader>
                  <CardTitle>Dados do Cartão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Número do Cartão</Label>
                    <Input 
                      placeholder="0000 0000 0000 0000" 
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Validade</Label>
                      <Input 
                        placeholder="MM/AA" 
                        className="bg-cs-bg-primary border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input 
                        placeholder="123" 
                        className="bg-cs-bg-primary border-border"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Nome no Cartão</Label>
                    <Input 
                      placeholder="NOME COMPLETO" 
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentMethod === 'pix' && (
              <Card className="bg-cs-bg-card border-border">
                <CardHeader>
                  <CardTitle>Pague com PIX</CardTitle>
                  <CardDescription>Escaneie o QR Code ou copie o código</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center p-6 bg-white rounded-lg">
                    <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                      <QrCode className="h-32 w-32 text-gray-400" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value="00020126580014br.gov.bcb.pix..." 
                      readOnly 
                      className="bg-cs-bg-primary border-border"
                    />
                    <Button variant="outline" onClick={copyPixCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentMethod === 'boleto' && (
              <Card className="bg-cs-bg-card border-border">
                <CardHeader>
                  <CardTitle>Boleto Bancário</CardTitle>
                  <CardDescription>O boleto será gerado após confirmar</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Após confirmar, você receberá o boleto por e-mail e poderá baixá-lo aqui.
                    O pagamento será confirmado em até 3 dias úteis após o pagamento.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumo do pedido */}
          <div className="space-y-6">
            <Card className="bg-cs-bg-card border-border sticky top-6">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {invoice.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.description}</span>
                      <span className="text-foreground">{formatPrice(item.total)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <CouponInput 
                    onApply={handleApplyCoupon}
                    onRemove={handleRemoveCoupon}
                    appliedCoupon={appliedCoupon}
                    subtotal={subtotal}
                  />
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">{formatPrice(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-cs-success">Desconto</span>
                      <span className="text-cs-success">-{formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-cs-cyan hover:bg-cs-cyan/90" 
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    `Pagar ${formatPrice(total)}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </TenantLayout>
  );
}
