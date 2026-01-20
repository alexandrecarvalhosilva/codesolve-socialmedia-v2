import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  CreditCard, 
  MessageSquare, 
  Building2, 
  Ticket,
  Volume2,
  VolumeX,
  Check,
  X,
  RefreshCw,
  Pause,
  Zap,
  Calendar,
  Plug,
  WifiOff,
  XCircle,
  Clock,
  Package
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSoundNotification } from '@/hooks/useSoundNotification';
import { useNotifications } from '@/contexts/NotificationContext';
import { NotificationType, priorityConfig } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const iconMap: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  sla_breach: AlertTriangle,
  ticket_new: Ticket,
  ticket_urgent: AlertCircle,
  ticket_resolved: Check,
  ticket_response: MessageSquare,
  payment_overdue: CreditCard,
  payment_failed: XCircle,
  payment_success: Check,
  subscription_expiring: Clock,
  plan_upgraded: Bell,
  plan_downgraded: Bell,
  module_limit_reached: Package,
  module_added: Bell,
  module_removed: Bell,
  chat_unread: MessageSquare,
  chat_unanswered: MessageSquare,
  automation_failed: Zap,
  automation_success: Zap,
  event_reminder: Calendar,
  event_cancelled: Calendar,
  event_created: Calendar,
  integration_offline: WifiOff,
  integration_error: Plug,
  integration_connected: Plug,
  tenant_new: Building2,
  tenant_blocked: AlertTriangle,
  tenant_activated: Check,
  system_alert: Bell,
  system_maintenance: Bell,
  backup_completed: Check,
  user_created: Bell,
  user_deleted: AlertTriangle,
  user_role_changed: Bell,
  user_invite_sent: Bell,
  user_invite_accepted: Check,
  security_login: Bell,
  security_password_reset: AlertTriangle,
  security_suspicious_activity: AlertTriangle,
  ai_limit_reached: AlertTriangle,
  ai_config_changed: Bell,
  template_updated: Bell,
  template_assigned: Bell,
};

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMuted, toggleMute } = useSoundNotification();
  const { 
    notifications, 
    unreadCount, 
    criticalCount, 
    markAsRead, 
    markAllAsRead,
    isPolling,
    setPollingEnabled 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notificationId: string, linkTo?: string) => {
    markAsRead(notificationId);
    if (linkTo) {
      setIsOpen(false);
      navigate(linkTo);
    }
  };

  const getIcon = (type: NotificationType) => {
    const Icon = iconMap[type];
    return Icon ? <Icon className="w-4 h-4" /> : <Bell className="w-4 h-4" />;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-lg transition-colors",
          isOpen ? "bg-card" : "hover:bg-card",
          criticalCount > 0 && "animate-pulse"
        )}
      >
        <Bell className={cn("w-5 h-5", criticalCount > 0 ? "text-destructive" : "text-muted-foreground")} />
        {unreadCount > 0 && (
          <span className={cn(
            "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-xs font-bold flex items-center justify-center",
            criticalCount > 0 ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"
          )}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-background/50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">Notificações</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                  {unreadCount} não lidas
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPollingEnabled(!isPolling)}
                className={cn("p-1.5 rounded-lg hover:bg-muted transition-colors", isPolling && "text-cs-success")}
                title={isPolling ? 'Pausar' : 'Iniciar'}
              >
                {isPolling ? <RefreshCw className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} /> : <Pause className="w-4 h-4 text-muted-foreground" />}
              </button>
              <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title={isMuted ? 'Ativar som' : 'Silenciar'}>
                {isMuted ? <VolumeX className="w-4 h-4 text-muted-foreground" /> : <Volume2 className="w-4 h-4 text-primary" />}
              </button>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="p-1.5 rounded-lg hover:bg-muted transition-colors" title="Marcar todas como lidas">
                  <Check className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              <ul>
                {notifications.slice(0, 10).map((notification) => {
                  const colors = priorityConfig[notification.priority];
                  return (
                    <li key={notification.id}>
                      <button
                        onClick={() => handleNotificationClick(notification.id, notification.linkTo)}
                        className={cn(
                          "w-full px-4 py-3 flex items-start gap-3 hover:bg-muted transition-colors text-left border-l-2",
                          notification.read ? "opacity-60 border-transparent" : colors.border
                        )}
                      >
                        <div className={cn("p-2 rounded-lg flex-shrink-0", colors.bg, colors.text)}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium truncate", notification.read ? "text-muted-foreground" : "text-foreground")}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}
                          </span>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-border bg-background/50">
              <button
                onClick={() => { setIsOpen(false); navigate('/notificacoes'); }}
                className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors py-1"
              >
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
