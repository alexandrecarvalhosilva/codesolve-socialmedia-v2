import { cn } from '@/lib/utils';

type StatusType = 'success' | 'warning' | 'error' | 'info';

interface StatusPillProps {
  status: StatusType;
  label: string;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  success: 'status-success',
  warning: 'status-warning',
  error: 'status-error',
  info: 'status-info',
};

export function StatusPill({ status, label, className }: StatusPillProps) {
  return (
    <span 
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      <span className={cn(
        'w-1.5 h-1.5 rounded-full mr-2',
        status === 'success' && 'bg-cs-success',
        status === 'warning' && 'bg-cs-warning',
        status === 'error' && 'bg-cs-error',
        status === 'info' && 'bg-cs-info'
      )} />
      {label}
    </span>
  );
}
