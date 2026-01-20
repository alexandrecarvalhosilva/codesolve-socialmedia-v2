import { BillingCycle, BILLING_CYCLE_DISCOUNTS } from '@/types/billing';
import { cn } from '@/lib/utils';

interface BillingCycleSelectorProps {
  value: BillingCycle;
  onChange: (cycle: BillingCycle) => void;
}

export function BillingCycleSelector({ value, onChange }: BillingCycleSelectorProps) {
  const cycles: BillingCycle[] = ['monthly', 'quarterly', 'semiannual', 'annual'];

  return (
    <div className="flex items-center gap-2 p-1 bg-cs-bg-card border border-border rounded-lg">
      {cycles.map((cycle) => {
        const { label, discount } = BILLING_CYCLE_DISCOUNTS[cycle];
        const isActive = value === cycle;

        return (
          <button
            key={cycle}
            onClick={() => onChange(cycle)}
            className={cn(
              "relative px-4 py-2 rounded-md text-sm font-medium transition-all",
              isActive 
                ? "bg-cs-cyan text-white" 
                : "text-cs-text-secondary hover:text-cs-text-primary hover:bg-cs-bg-primary"
            )}
          >
            {label}
            {discount > 0 && (
              <span 
                className={cn(
                  "absolute -top-2 -right-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full",
                  isActive 
                    ? "bg-cs-success text-white" 
                    : "bg-cs-success/20 text-cs-success"
                )}
              >
                -{discount}%
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
