import { 
  SubscriptionStatus, 
  InvoiceStatus, 
  SUBSCRIPTION_STATUS_CONFIG, 
  INVOICE_STATUS_CONFIG 
} from '@/types/billing';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: SubscriptionStatus | InvoiceStatus;
  type: 'subscription' | 'invoice';
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, type, size = 'md' }: StatusBadgeProps) {
  const config = type === 'subscription' 
    ? SUBSCRIPTION_STATUS_CONFIG[status as SubscriptionStatus]
    : INVOICE_STATUS_CONFIG[status as InvoiceStatus];

  return (
    <span 
      className={cn(
        "inline-flex items-center gap-1.5 font-medium rounded-full",
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      )}
    >
      <span className={cn("w-2 h-2 rounded-full", config.color)} />
      {config.label}
    </span>
  );
}
