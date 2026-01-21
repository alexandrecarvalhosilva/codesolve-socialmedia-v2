import { useState } from 'react';
import { Tag, Check, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useValidateCoupon } from '@/hooks/useBilling';
import { formatPrice } from '@/types/billing';

interface CouponInputProps {
  onApply: (couponCode: string, discountAmount?: number) => void;
  onRemove: () => void;
  appliedCoupon: string | null;
  subtotal?: number;
  isValidating?: boolean;
}

export function CouponInput({ onApply, onRemove, appliedCoupon, subtotal = 0, isValidating: externalValidating }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { validateCoupon, isValidating: internalValidating } = useValidateCoupon();
  const isValidating = externalValidating || internalValidating;

  const handleApply = async () => {
    if (!code.trim()) return;
    
    setError(null);
    
    try {
      const result = await validateCoupon(code, subtotal);
      
      if (!result.valid) {
        setError(result.message || 'Cupom inválido ou expirado');
        return;
      }
      
      onApply(code, result.discountValue);
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Erro ao validar cupom');
    }
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
          disabled={!code.trim() || isValidating}
          variant="outline"
          className="border-cs-cyan text-cs-cyan hover:bg-cs-cyan/10"
        >
          {isValidating ? (
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
