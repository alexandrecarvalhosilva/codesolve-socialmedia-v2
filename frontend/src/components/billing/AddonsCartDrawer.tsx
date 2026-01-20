import { useState } from 'react';
import { 
  ShoppingCart, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Tag, 
  CreditCard,
  Check,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useAddonsCart } from '@/contexts/AddonsCartContext';
import { formatModulePrice } from '@/types/modules';
import { toast } from 'sonner';

interface AddonsCartDrawerProps {
  trigger?: React.ReactNode;
}

export function AddonsCartDrawer({ trigger }: AddonsCartDrawerProps) {
  const {
    items,
    isOpen,
    billingCycle,
    couponCode,
    openCart,
    closeCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyCoupon,
    removeCoupon,
    setBillingCycle,
    getSummary,
    itemCount,
  } = useAddonsCart();
  
  const [couponInput, setCouponInput] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  
  const summary = getSummary();

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    
    const success = applyCoupon(couponInput);
    if (success) {
      toast.success('Cupom aplicado com sucesso!');
      setCouponInput('');
    } else {
      toast.error('Cupom inválido ou expirado');
    }
  };

  const handleCheckout = () => {
    toast.success('Pedido realizado com sucesso! Redirecionando para pagamento...');
    clearCart();
    closeCart();
    setShowCheckout(false);
  };

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="icon" 
      className="relative border-border"
      onClick={openCart}
    >
      <ShoppingCart className="h-5 w-5" />
      {itemCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-cs-cyan text-white text-xs">
          {itemCount}
        </Badge>
      )}
    </Button>
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => open ? openCart() : closeCart()}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg bg-cs-bg-card border-border flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-cs-text-primary">
            <ShoppingCart className="h-5 w-5 text-cs-cyan" />
            Carrinho de Add-ons
            {itemCount > 0 && (
              <Badge className="bg-cs-cyan/10 text-cs-cyan text-xs">
                {itemCount} {itemCount === 1 ? 'item' : 'itens'}
              </Badge>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
            <ShoppingCart className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-cs-text-primary mb-2">
              Seu carrinho está vazio
            </h3>
            <p className="text-sm text-cs-text-muted max-w-xs">
              Adicione módulos extras para expandir as funcionalidades do seu sistema
            </p>
          </div>
        ) : (
          <>
            {/* Billing Cycle Toggle */}
            <div className="py-4 border-b border-border">
              <Label className="text-sm font-medium text-cs-text-secondary mb-3 block">
                Ciclo de Cobrança
              </Label>
              <RadioGroup 
                value={billingCycle} 
                onValueChange={(v) => setBillingCycle(v as 'monthly' | 'yearly')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly" className="text-cs-text-primary cursor-pointer">
                    Mensal
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yearly" id="yearly" />
                  <Label htmlFor="yearly" className="text-cs-text-primary cursor-pointer flex items-center gap-2">
                    Anual
                    <Badge className="bg-cs-success/10 text-cs-success text-xs">
                      20% OFF
                    </Badge>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => {
                const ModuleIcon = item.module.icon;
                return (
                  <div 
                    key={item.moduleId} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-cs-bg-primary/50"
                  >
                    <div className="p-2 rounded-lg bg-cs-cyan/10">
                      <ModuleIcon className="h-5 w-5 text-cs-cyan" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-cs-text-primary text-sm">
                            {item.module.name}
                          </h4>
                          <p className="text-xs text-cs-text-muted line-clamp-1">
                            {item.module.description}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-cs-error"
                          onClick={() => removeFromCart(item.moduleId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        {item.module.pricing?.perUnit ? (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 border-border"
                              onClick={() => updateQuantity(item.moduleId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm text-cs-text-primary">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6 border-border"
                              onClick={() => updateQuantity(item.moduleId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs text-cs-text-muted ml-1">
                              {item.module.pricing.unitName}(s)
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-cs-text-muted">1 licença</span>
                        )}
                        
                        <span className="text-sm font-semibold text-cs-text-primary">
                          {formatModulePrice(item.totalPrice)}/mês
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Section */}
            <div className="py-4 border-t border-border">
              {couponCode ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-cs-success/10">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-cs-success" />
                    <span className="text-sm font-medium text-cs-success">
                      {couponCode}
                    </span>
                    <Badge className="bg-cs-success text-white text-xs">
                      -{summary.discountPercent}%
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-cs-error"
                    onClick={removeCoupon}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Cupom de desconto"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="bg-cs-bg-primary border-border"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleApplyCoupon}
                    className="border-border shrink-0"
                  >
                    <Tag className="h-4 w-4 mr-1" />
                    Aplicar
                  </Button>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="py-4 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-cs-text-muted">Subtotal</span>
                <span className="text-cs-text-primary">{formatModulePrice(summary.subtotal)}/mês</span>
              </div>
              
              {summary.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-cs-success">Desconto</span>
                  <span className="text-cs-success">-{formatModulePrice(summary.discount)}</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between">
                <span className="font-semibold text-cs-text-primary">Total</span>
                <div className="text-right">
                  <span className="text-lg font-bold text-cs-cyan">
                    {formatModulePrice(summary.total)}
                  </span>
                  <span className="text-cs-text-muted text-sm">/mês</span>
                  {billingCycle === 'yearly' && (
                    <p className="text-xs text-cs-text-muted">
                      {formatModulePrice(summary.total * 12)}/ano
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {!showCheckout ? (
                <>
                  <Button 
                    className="w-full bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90"
                    onClick={() => setShowCheckout(true)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Finalizar Compra
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground"
                    onClick={clearCart}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Limpar Carrinho
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-cs-bg-primary/50 space-y-3">
                    <h4 className="font-medium text-cs-text-primary flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-cs-cyan" />
                      Resumo do Pedido
                    </h4>
                    <div className="space-y-1 text-sm">
                      {items.map(item => (
                        <div key={item.moduleId} className="flex justify-between">
                          <span className="text-cs-text-muted">
                            {item.module.name} {item.quantity > 1 ? `(x${item.quantity})` : ''}
                          </span>
                          <span className="text-cs-text-primary">
                            {formatModulePrice(item.totalPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span className="text-cs-text-primary">Total Mensal</span>
                      <span className="text-cs-cyan">{formatModulePrice(summary.total)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-cs-success hover:bg-cs-success/90"
                    onClick={handleCheckout}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirmar e Pagar
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-border"
                    onClick={() => setShowCheckout(false)}
                  >
                    Voltar
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
