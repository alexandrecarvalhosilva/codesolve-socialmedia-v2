import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Notification, NotificationRole, NotificationType } from '@/types/notification';
import { mockNotifications } from '@/data/notificationMockData';
import { useAuth } from '@/contexts/AuthContext';
import { useSoundNotification } from '@/hooks/useSoundNotification';
import { toast } from 'sonner';
import { 
  logNotificationAction, 
  getActionLogs, 
  NotificationActionLog 
} from '@/types/notificationActionLog';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  criticalCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  dismissNotification: (id: string, reason?: string) => void;
  resolveNotification: (id: string) => void;
  muteNotificationType: (type: NotificationType) => void;
  unmuteNotificationType: (type: NotificationType) => void;
  mutedTypes: NotificationType[];
  isPolling: boolean;
  setPollingEnabled: (enabled: boolean) => void;
  actionLogs: NotificationActionLog[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Simulated new notifications that will "arrive" during polling
const simulatedIncomingNotifications: Omit<Notification, 'id' | 'timestamp' | 'read'>[] = [
  {
    type: 'chat_unread',
    origin: 'chat',
    priority: 'info',
    title: 'Nova mensagem no chat',
    message: 'Cliente João enviou uma mensagem no WhatsApp.',
    linkTo: '/tenant/chat',
    visibleTo: ['admin', 'operador'],
    entityId: 'chat-new-001',
    entityType: 'chat',
    tenantId: '1',
    tenantName: 'Test Tenant Contacts 2',
  },
  {
    type: 'ticket_urgent',
    origin: 'support',
    priority: 'warning',
    title: 'Ticket escalado para urgente',
    message: 'O ticket #1250 foi escalado para prioridade crítica.',
    linkTo: '/support',
    visibleTo: ['superadmin', 'admin', 'operador'],
    entityId: 'ticket-1250',
    entityType: 'ticket',
    tenantId: '2',
    tenantName: 'Other RAG Tenant',
  },
  {
    type: 'sla_breach',
    origin: 'support',
    priority: 'critical',
    title: 'SLA Violado - Ticket #1255',
    message: 'Tempo de primeira resposta excedido. Cliente: Test RAG Tenant',
    linkTo: '/support',
    visibleTo: ['superadmin', 'admin'],
    entityId: 'ticket-1255',
    entityType: 'ticket',
    tenantId: '5',
    tenantName: 'Test RAG Tenant',
  },
  {
    type: 'payment_overdue',
    origin: 'billing',
    priority: 'critical',
    title: 'Novo pagamento atrasado',
    message: 'Fatura #INV-2025-010 venceu hoje. Tenant: Test Tenant Lists',
    linkTo: '/billing/invoices',
    visibleTo: ['superadmin'],
    entityId: 'inv-010',
    entityType: 'invoice',
    tenantId: '4',
    tenantName: 'Test Tenant Lists',
  },
  {
    type: 'ticket_new',
    origin: 'support',
    priority: 'info',
    title: 'Novo ticket recebido',
    message: 'Solicitação de suporte técnico para integração.',
    linkTo: '/tenant/support',
    visibleTo: ['admin', 'operador'],
    entityId: 'ticket-1260',
    entityType: 'ticket',
    tenantId: '1',
    tenantName: 'Test Tenant Contacts 2',
  },
];

const POLLING_INTERVAL = 30000; // 30 seconds
const SIMULATION_CHANCE = 0.3; // 30% chance of new notification per poll

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { playSound, isMuted } = useSoundNotification();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [mutedTypes, setMutedTypes] = useState<NotificationType[]>(() => {
    const stored = localStorage.getItem('notification-muted-types');
    if (stored) {
      try {
        return JSON.parse(stored) as NotificationType[];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [actionLogs, setActionLogs] = useState<NotificationActionLog[]>([]);
  const simulationIndexRef = useRef(0);
  const lastCriticalCountRef = useRef(0);

  const userRole = (user?.role || 'visualizador') as NotificationRole;

  // Filter notifications for current user role (excluding dismissed and muted types)
  const userNotifications = notifications.filter(n => 
    n.visibleTo.includes(userRole) && 
    !n.resolved && 
    !mutedTypes.includes(n.type)
  );

  const unreadCount = userNotifications.filter(n => !n.read).length;
  const criticalCount = userNotifications.filter(n => n.priority === 'critical' && !n.read).length;

  // Refresh action logs
  const refreshActionLogs = useCallback(() => {
    setActionLogs(getActionLogs());
  }, []);

  // Initialize with mock data
  useEffect(() => {
    setNotifications(mockNotifications);
  }, []);

  // Persist muted types to localStorage
  useEffect(() => {
    localStorage.setItem('notification-muted-types', JSON.stringify(mutedTypes));
  }, [mutedTypes]);

  // Play sound when new critical notifications arrive
  useEffect(() => {
    if (criticalCount > lastCriticalCountRef.current) {
      playSound('critical');
      const newCritical = userNotifications.find(
        n => n.priority === 'critical' && !n.read
      );
      if (newCritical) {
        toast.error(newCritical.title, {
          description: newCritical.message,
          duration: 5000,
        });
      }
    } else if (unreadCount > 0 && criticalCount === 0 && unreadCount > lastCriticalCountRef.current) {
      playSound('info');
    }
    lastCriticalCountRef.current = criticalCount;
  }, [criticalCount, unreadCount, playSound, userNotifications]);

  // Add a new notification
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    console.log('[Notifications] New notification added:', newNotification.title);
  }, []);

  // Mark single notification as read (with logging)
  const markAsRead = useCallback((id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      logNotificationAction('read', id, {
        id: user?.id,
        name: user?.name,
        role: user?.role,
      }, `Notificação "${notification.title}" marcada como lida`, notification.type);
      refreshActionLogs();
    }
    
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, [notifications, user, refreshActionLogs]);

  // Mark all as read for current user (with logging)
  const markAllAsRead = useCallback(() => {
    logNotificationAction('marked_all_read', 'all', {
      id: user?.id,
      name: user?.name,
      role: user?.role,
    }, `Todas as notificações marcadas como lidas`);
    refreshActionLogs();
    
    setNotifications(prev => 
      prev.map(n => 
        n.visibleTo.includes(userRole) ? { ...n, read: true } : n
      )
    );
    toast.success('Todas as notificações marcadas como lidas');
  }, [userRole, user, refreshActionLogs]);

  // Remove notification (with logging)
  const removeNotification = useCallback((id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      logNotificationAction('deleted', id, {
        id: user?.id,
        name: user?.name,
        role: user?.role,
      }, `Notificação "${notification.title}" excluída`, notification.type);
      refreshActionLogs();
    }
    
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, [notifications, user, refreshActionLogs]);

  // Dismiss notification (keeps in history but removes from active list)
  const dismissNotification = useCallback((id: string, reason?: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      logNotificationAction('dismissed', id, {
        id: user?.id,
        name: user?.name,
        role: user?.role,
      }, reason || `Notificação "${notification.title}" dispensada`, notification.type);
      refreshActionLogs();
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, resolved: true, read: true } : n)
      );
      
      toast.success('Notificação dispensada');
    }
  }, [notifications, user, refreshActionLogs]);

  // Resolve notification (mark as handled/resolved)
  const resolveNotification = useCallback((id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      logNotificationAction('resolved', id, {
        id: user?.id,
        name: user?.name,
        role: user?.role,
      }, `Notificação "${notification.title}" marcada como resolvida`, notification.type);
      refreshActionLogs();
      
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, resolved: true, read: true } : n)
      );
      
      toast.success('Notificação marcada como resolvida');
    }
  }, [notifications, user, refreshActionLogs]);

  // Mute a notification type (with logging)
  const muteNotificationType = useCallback((type: NotificationType) => {
    setMutedTypes(prev => {
      // Prevent duplicates
      if (prev.includes(type)) return prev;
      
      logNotificationAction('muted_type', type, {
        id: user?.id,
        name: user?.name,
        role: user?.role,
      }, `Tipo de notificação "${type}" silenciado`, type);
      refreshActionLogs();
      toast.success('Tipo de notificação silenciado');
      
      return [...prev, type];
    });
  }, [user, refreshActionLogs]);

  // Unmute a notification type (with logging)
  const unmuteNotificationType = useCallback((type: NotificationType) => {
    logNotificationAction('unmuted_type', type, {
      id: user?.id,
      name: user?.name,
      role: user?.role,
    }, `Tipo de notificação "${type}" reativado`, type);
    refreshActionLogs();
    
    setMutedTypes(prev => prev.filter(t => t !== type));
    toast.success('Tipo de notificação reativado');
  }, [user, refreshActionLogs]);

  // Polling simulation
  useEffect(() => {
    if (!isPolling) return;

    const pollInterval = setInterval(() => {
      if (Math.random() < SIMULATION_CHANCE) {
        const nextNotification = simulatedIncomingNotifications[
          simulationIndexRef.current % simulatedIncomingNotifications.length
        ];
        
        // Only add if visible to current user and type not muted
        if (nextNotification.visibleTo.includes(userRole) && !mutedTypes.includes(nextNotification.type)) {
          addNotification(nextNotification);
          // Polling simulation - remove in production
        }
        
        simulationIndexRef.current++;
      }
    }, POLLING_INTERVAL);

    return () => {
      clearInterval(pollInterval);
    };
  }, [isPolling, userRole, addNotification, mutedTypes]);

  const setPollingEnabled = useCallback((enabled: boolean) => {
    setIsPolling(enabled);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications: userNotifications,
        unreadCount,
        criticalCount,
        markAsRead,
        markAllAsRead,
        addNotification,
        removeNotification,
        dismissNotification,
        resolveNotification,
        muteNotificationType,
        unmuteNotificationType,
        mutedTypes,
        isPolling,
        setPollingEnabled,
        actionLogs,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
