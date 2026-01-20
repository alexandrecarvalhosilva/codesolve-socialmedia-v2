import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
}

export function MetricCard({ label, value, icon: Icon, trend, subtitle }: MetricCardProps) {
  return (
    <div className="cs-card p-6 group hover:border-cs-cyan/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-cs-text-secondary">
          {label}
        </span>
        <div className="p-2 rounded-lg bg-cs-cyan/10 group-hover:bg-cs-cyan/20 transition-colors">
          <Icon className="w-5 h-5 text-cs-cyan" />
        </div>
      </div>
      
      <div className="space-y-1">
        <p className="text-cs-4xl font-bold text-cs-text-primary leading-none">
          {value}
        </p>
        
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-sm font-medium ${trend.isPositive ? 'text-cs-success' : 'text-cs-error'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
            <span className="text-xs text-cs-text-secondary">vs mês anterior</span>
          </div>
        )}
        
        {subtitle && (
          <p className="text-sm text-cs-text-secondary mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
