import { useState, useEffect } from 'react';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useInvoices, useValidateCoupon, usePayInvoice } from '@/hooks/useBilling';
import { formatPrice, PaymentMethodType } from '@/types/billing';
import { toast } from 'sonner';

export default function TenantPayment() {
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get('invoice');
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('credit_card');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isPaid, setIsPaid] = useState(false);

  const { invoices, isLoading, fetchInvoices } = useInvoices();
  const { validateCoupon, isValidating } = useValidateCoupon();
  const { payInvoice, isPaying } = usePayInvoice();

  useEffect(() => {
    fetchInvoices({ status: 'pending' });
  }, []);

  // Encontrar a fatura
  const invoice = invoiceId 
    ? invoices.find(inv => inv.id === invoiceId)
    : invoices.find(inv => inv.status === 'pending');

  if (isLoading) {
    return (
      <TenantLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </TenantLayout>
    );
  }

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

  const subtotal = invoice.total || 0;
  const discount = appliedDiscount;
  const total = subtotal - discount;

  const handleApplyCoupon = async (couponCode: string) => {
    try {
      const result = await validateCoupon(couponCode, subtotal);
      if (result.valid) {
        setAppliedCoupon(couponCode);
        setAppliedDiscount(result.discountValue || 0);
        toast.success('Cupom aplicado com sucesso!');
      } else {
        toast.error(result.message || 'Cupom inválido');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao validar cupom');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setAppliedDiscount(0);
  };

  const handlePayment = async () => {
    try {
      await payInvoice(invoice.id, paymentMethod, appliedCoupon || undefined);
      setIsPaid(true);
      toast.success('Pagamento realizado com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao processar pagamento');
    }
  };

  const copyPixCode = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    toast.success('Código PIX copiado!');
  };

  if (isPaid) {
    return (
      <TenantLayout>
        <div className="p-6">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-cs-success/10 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-cs-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Pagamento Confirmado!</h2>
              <p className="text-muted-foreground mb-6">
                Seu pagamento de {formatPrice(total)} foi processado com sucesso.
              </p>
              <div className="flex gap-4 justify-center">
                <Button asChild variant="outline">
                  <Link to="/tenant/billing/invoices">Ver Faturas</Link>
                </Button>
                <Button asChild>
                  <Link to="/tenant/dashboard">Ir para Dashboard</Link>
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
            <h1 className="text-2xl font-bold text-foreground">Pagamento</h1>
            <p className="text-muted-foreground">Fatura #{invoice.invoiceNumber || invoice.id}</p>
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
                <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethodType)}>
                  <div className="space-y-4">
                    <div className={`flex items-center space-x-4 p-4 rounded-lg border ${paymentMethod === 'credit_card' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="flex items-center gap-3 cursor-pointer flex-1">
                        <CreditCard className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Cartão de Crédito</p>
                          <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                        </div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-4 p-4 rounded-lg border ${paymentMethod === 'pix' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex items-center gap-3 cursor-pointer flex-1">
                        <QrCode className="w-5 h-5" />
                        <div>
                          <p className="font-medium">PIX</p>
                          <p className="text-sm text-muted-foreground">Pagamento instantâneo via QR Code</p>
                        </div>
                      </Label>
                    </div>
                    
                    <div className={`flex items-center space-x-4 p-4 rounded-lg border ${paymentMethod === 'boleto' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <RadioGroupItem value="boleto" id="boleto" />
                      <Label htmlFor="boleto" className="flex items-center gap-3 cursor-pointer flex-1">
                        <FileText className="w-5 h-5" />
                        <div>
                          <p className="font-medium">Boleto Bancário</p>
                          <p className="text-sm text-muted-foreground">Compensação em até 3 dias úteis</p>
                        </div>
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Detalhes do método selecionado */}
            {paymentMethod === 'credit_card' && (
              <Card className="bg-cs-bg-card border-border">
                <CardHeader>
                  <CardTitle>Dados do Cartão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cardNumber">Número do Cartão</Label>
                    <Input id="cardNumber" placeholder="0000 0000 0000 0000" className="bg-cs-bg-primary border-border" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry">Validade</Label>
                      <Input id="expiry" placeholder="MM/AA" className="bg-cs-bg-primary border-border" />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input id="cvv" placeholder="000" className="bg-cs-bg-primary border-border" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cardName">Nome no Cartão</Label>
                    <Input id="cardName" placeholder="Como está no cartão" className="bg-cs-bg-primary border-border" />
                  </div>
                </CardContent>
              </Card>
            )}

            {paymentMethod === 'pix' && (
              <Card className="bg-cs-bg-card border-border">
                <CardHeader>
                  <CardTitle>Pagamento via PIX</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center p-4 bg-white rounded-lg">
                    <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
                      <QrCode className="w-32 h-32 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value="00020126580014br.gov.bcb.pix..." 
                      readOnly 
                      className="bg-cs-bg-primary border-border"
                    />
                    <Button variant="outline" onClick={copyPixCode}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Escaneie o QR Code ou copie o código PIX para pagar
                  </p>
                </CardContent>
              </Card>
            )}

            {paymentMethod === 'boleto' && (
              <Card className="bg-cs-bg-card border-border">
                <CardHeader>
                  <CardTitle>Boleto Bancário</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    O boleto será gerado após a confirmação. O prazo de compensação é de até 3 dias úteis.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Resumo */}
          <div className="space-y-6">
            <Card className="bg-cs-bg-card border-border">
              <CardHeader>
                <CardTitle>Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">{formatPrice(subtotal)}</span>
                </div>
                
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-cs-success">
                    <span>Desconto ({appliedCoupon})</span>
                    <span>-{formatPrice(appliedDiscount)}</span>
                  </div>
                )}
                
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <CouponInput
                  onApply={handleApplyCoupon}
                  onRemove={handleRemoveCoupon}
                  appliedCoupon={appliedCoupon}
                  isValidating={isValidating}
                />

                <Button 
                  className="w-full bg-cs-cyan hover:bg-cs-cyan/90" 
                  onClick={handlePayment}
                  disabled={isPaying}
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
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
