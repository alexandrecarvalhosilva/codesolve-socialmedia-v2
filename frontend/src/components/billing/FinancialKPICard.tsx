import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinancialKPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'error';
}

export function FinancialKPICard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon,
  trend,
  variant = 'default'
}: FinancialKPICardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-cs-success/30 bg-cs-success/5',
    warning: 'border-cs-warning/30 bg-cs-warning/5',
    error: 'border-cs-error/30 bg-cs-error/5',
  };

  const iconStyles = {
    default: 'bg-cs-cyan/10 text-cs-cyan',
    success: 'bg-cs-success/20 text-cs-success',
    warning: 'bg-cs-warning/20 text-cs-warning',
    error: 'bg-cs-error/20 text-cs-error',
  };

  return (
    <div 
      className={cn(
        "p-5 rounded-xl border bg-cs-bg-card transition-all hover:border-cs-cyan/50",
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-2.5 rounded-lg", iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        
        {trend && (
          <div 
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              trend.isPositive 
                ? "text-cs-success bg-cs-success/10" 
                : "text-cs-error bg-cs-error/10"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend.value}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-cs-text-primary">{value}</p>
        <p className="text-sm text-cs-text-secondary mt-0.5">{title}</p>
        {subtitle && (
          <p className="text-xs text-cs-text-muted mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
