import { LucideIcon, FileX, Inbox, Search, Users, Calendar, MessageSquare, Bell, CreditCard, TicketCheck } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  variant?: 'default' | 'compact';
  className?: string;
}

const defaultIcons: Record<string, LucideIcon> = {
  data: Inbox,
  search: Search,
  users: Users,
  calendar: Calendar,
  messages: MessageSquare,
  notifications: Bell,
  billing: CreditCard,
  tickets: TicketCheck,
  files: FileX,
};

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  variant = 'default',
  className,
}: EmptyStateProps) {
  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">{title}</p>
        {action && (
          <Button
            variant="link"
            size="sm"
            onClick={action.onClick}
            className="mt-2 text-primary"
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center animate-fade-in', className)}>
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-primary/30">
          <Icon className="w-10 h-10 text-primary" />
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
      )}
      
      {action && (
        <Button
          onClick={action.onClick}
          className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Pre-configured empty states for common use cases
export function EmptySearchState({ onClear }: { onClear?: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="Nenhum resultado encontrado"
      description="Tente ajustar os filtros ou termos de busca"
      action={onClear ? { label: 'Limpar busca', onClick: onClear } : undefined}
    />
  );
}

export function EmptyTableState({ 
  entityName, 
  onAdd 
}: { 
  entityName: string; 
  onAdd?: () => void;
}) {
  return (
    <EmptyState
      icon={Inbox}
      title={`Nenhum ${entityName} encontrado`}
      description={`Quando você adicionar ${entityName}, eles aparecerão aqui`}
      action={onAdd ? { label: `Adicionar ${entityName}`, onClick: onAdd } : undefined}
    />
  );
}

export function EmptyNotificationsState() {
  return (
    <EmptyState
      icon={Bell}
      title="Sem notificações"
      description="Você está em dia! Novas notificações aparecerão aqui"
      variant="compact"
    />
  );
}

export function EmptyTicketsState({ onCreateTicket }: { onCreateTicket?: () => void }) {
  return (
    <EmptyState
      icon={TicketCheck}
      title="Nenhum ticket aberto"
      description="Todos os tickets foram resolvidos ou você ainda não criou nenhum"
      action={onCreateTicket ? { label: 'Abrir ticket', onClick: onCreateTicket } : undefined}
    />
  );
}

export function EmptyCalendarState() {
  return (
    <EmptyState
      icon={Calendar}
      title="Sem eventos"
      description="Nenhum evento agendado para este período"
      variant="compact"
    />
  );
}

export function EmptyMessagesState() {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Nenhuma mensagem"
      description="As conversas aparecerão aqui quando iniciadas"
      variant="compact"
    />
  );
}
