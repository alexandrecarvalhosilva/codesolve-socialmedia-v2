import { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockCoupons } from '@/data/billingMockData';
import { formatPrice } from '@/types/billing';

interface CouponInputProps {
  onApply: (couponCode: string, discountAmount: number) => void;
  onRemove: () => void;
  appliedCoupon: string | null;
  subtotal: number;
}

export function CouponInput({ onApply, onRemove, appliedCoupon, subtotal }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const coupon = mockCoupons.find(
      c => c.code.toUpperCase() === code.toUpperCase() && c.isActive
    );
    
    if (!coupon) {
      setError('Cupom inválido ou expirado');
      setIsLoading(false);
      return;
    }
    
    // Verificar validade
    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      setError('Cupom ainda não está válido');
      setIsLoading(false);
      return;
    }
    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      setError('Cupom expirado');
      setIsLoading(false);
      return;
    }
    
    // Verificar limite de uso
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      setError('Cupom atingiu limite de uso');
      setIsLoading(false);
      return;
    }
    
    // Verificar valor mínimo
    if (coupon.minPurchase && subtotal < coupon.minPurchase) {
      setError(`Valor mínimo: ${formatPrice(coupon.minPurchase)}`);
      setIsLoading(false);
      return;
    }
    
    // Calcular desconto
    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
      discountAmount = Math.round(subtotal * (coupon.discountValue / 100));
    } else {
      discountAmount = coupon.discountValue;
    }
    
    onApply(coupon.code, discountAmount);
    setCode('');
    setIsLoading(false);
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-cs-success/10 border border-cs-success/30 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cs-success/20 flex items-center justify-center">
            <Check className="w-4 h-4 text-cs-success" />
          </div>
          <div>
            <p className="text-sm font-medium text-cs-success">Cupom aplicado</p>
            <p className="text-xs text-cs-text-muted">{appliedCoupon}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-cs-text-muted hover:text-cs-error"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-text-muted" />
          <Input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Código do cupom"
            className="pl-10 bg-cs-bg-primary border-border uppercase"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
        </div>
        <Button
          onClick={handleApply}
          disabled={!code.trim() || isLoading}
          variant="outline"
          className="border-cs-cyan text-cs-cyan hover:bg-cs-cyan/10"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Aplicar'
          )}
        </Button>
      </div>
      {error && (
        <p className="text-xs text-cs-error flex items-center gap-1">
          <X className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
