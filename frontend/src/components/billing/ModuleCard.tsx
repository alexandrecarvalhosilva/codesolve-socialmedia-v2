import { Check, Plus, Minus, MessageCircle, Bot, Sparkles, Layers, Calendar, Users, BarChart3, Code, Palette, Headphones, Package } from 'lucide-react';
import { BillingModule, formatPrice } from '@/types/billing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MessageCircle, Bot, Sparkles, Layers, Calendar, Users, BarChart3, Code, Palette, Headphones, Package
};

interface ModuleCardProps {
  module: BillingModule;
  isIncluded?: boolean;
  isAdded?: boolean;
  quantity?: number;
  onAdd?: () => void;
  onRemove?: () => void;
  onQuantityChange?: (quantity: number) => void;
}

export function ModuleCard({ 
  module, 
  isIncluded, 
  isAdded, 
  quantity = 1,
  onAdd, 
  onRemove,
  onQuantityChange 
}: ModuleCardProps) {
  const IconComponent = iconMap[module.iconName] || Package;

  const categoryLabels: Record<string, string> = {
    communication: 'Comunicação',
    ai: 'Inteligência Artificial',
    integration: 'Integrações',
    support: 'Suporte',
    analytics: 'Analytics',
  };

  return (
    <div 
      className={cn(
        "p-4 rounded-xl border transition-all",
        isIncluded 
          ? "border-cs-success/30 bg-cs-success/5" 
          : isAdded 
            ? "border-cs-cyan bg-cs-cyan/5" 
            : "border-border bg-cs-bg-card hover:border-cs-cyan/50"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div 
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
            isIncluded 
              ? "bg-cs-success/20" 
              : "bg-cs-cyan/10"
          )}
        >
          <IconComponent 
            className={cn(
              "w-6 h-6",
              isIncluded ? "text-cs-success" : "text-cs-cyan"
            )} 
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-semibold text-cs-text-primary">{module.name}</h4>
              <p className="text-xs text-cs-text-muted mt-0.5">
                {categoryLabels[module.category] || module.category}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-cs-text-primary">
                {formatPrice(module.price)}
                {module.isPerUnit && <span className="text-xs font-normal">/un</span>}
              </p>
              <p className="text-xs text-cs-text-muted">/mês</p>
            </div>
          </div>
          
          <p className="text-sm text-cs-text-secondary mt-2">
            {module.description}
          </p>

          {/* Actions */}
          <div className="mt-4">
            {isIncluded ? (
              <div className="flex items-center gap-2 text-sm text-cs-success">
                <Check className="w-4 h-4" />
                <span>Incluso no plano</span>
              </div>
            ) : isAdded ? (
              <div className="flex items-center gap-3">
                {module.isPerUnit && onQuantityChange && (
                  <div className="flex items-center gap-2 bg-cs-bg-primary rounded-lg p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onQuantityChange(quantity + 1)}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRemove}
                  className="border-cs-error/50 text-cs-error hover:bg-cs-error/10"
                >
                  Remover
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={onAdd}
                className="bg-cs-cyan hover:bg-cs-cyan/90"
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
