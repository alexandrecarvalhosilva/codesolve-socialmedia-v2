import { cn } from '@/lib/utils';

interface UsageProgressBarProps {
  label: string;
  used: number;
  limit: number | null;
  unit?: string;
  showPercentage?: boolean;
}

export function UsageProgressBar({ 
  label, 
  used, 
  limit, 
  unit = '',
  showPercentage = true 
}: UsageProgressBarProps) {
  const isUnlimited = limit === null;
  const percentage = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
  
  const getBarColor = () => {
    if (isUnlimited) return 'bg-cs-cyan';
    if (percentage >= 90) return 'bg-cs-error';
    if (percentage >= 70) return 'bg-cs-warning';
    return 'bg-cs-cyan';
  };

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-cs-text-secondary">{label}</span>
        <span className="text-cs-text-primary font-medium">
          {formatValue(used)}{unit} / {isUnlimited ? '∞' : `${formatValue(limit)}${unit}`}
          {showPercentage && !isUnlimited && (
            <span className="text-cs-text-muted ml-1">({percentage.toFixed(0)}%)</span>
          )}
        </span>
      </div>
      <div className="h-2 bg-cs-bg-primary rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", getBarColor())}
          style={{ width: isUnlimited ? '10%' : `${percentage}%` }}
        />
      </div>
    </div>
  );
}
