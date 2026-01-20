import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Notification, NotificationRole, NotificationType } from '@/types/notification';
import { useAuth } from '@/contexts/AuthContext';
import { useSoundNotification } from '@/hooks/useSoundNotification';
import { toast } from 'sonner';
import { 
  logNotificationAction, 
  getActionLogs, 
  NotificationActionLog 
} from '@/types/notificationActionLog';
import { api } from '@/lib/api';

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
  isLoading: boolean;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const POLLING_INTERVAL = 30000; // 30 seconds

// Mapear notificações da API para o formato do frontend
const mapApiNotification = (apiNotification: any): Notification => {
  return {
    id: apiNotification.id,
    type: apiNotification.category as NotificationType,
    origin: apiNotification.category,
    priority: apiNotification.type === 'error' ? 'critical' : 
              apiNotification.type === 'warning' ? 'warning' : 'info',
    title: apiNotification.title,
    message: apiNotification.message,
    timestamp: new Date(apiNotification.createdAt),
    read: apiNotification.isRead,
    linkTo: apiNotification.actionUrl || undefined,
    visibleTo: ['superadmin', 'admin', 'operador', 'visualizador'] as NotificationRole[],
    entityId: apiNotification.id,
    entityType: apiNotification.category,
    tenantId: apiNotification.tenantId || undefined,
    tenantName: undefined,
    resolved: false,
  };
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { playSound } = useSoundNotification();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(true);
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

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const response = await api.get('/notifications', {
        params: { limit: 50 }
      });
      
      if (response.data.success && response.data.data) {
        const mappedNotifications = response.data.data.map(mapApiNotification);
        setNotifications(mappedNotifications);
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Initialize with API data
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

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

  // Add a new notification (local only - for real-time events)
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

  // Mark single notification as read (with API call)
  const markAsRead = useCallback(async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification && !notification.read) {
      try {
        await api.post(`/notifications/${id}/read`);
        
        logNotificationAction('read', id, {
          id: user?.id,
          name: user?.name,
          role: user?.role,
        }, `Notificação "${notification.title}" marcada como lida`, notification.type);
        refreshActionLogs();
        
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
      } catch (err) {
        console.error('Erro ao marcar notificação como lida:', err);
      }
    }
  }, [notifications, user, refreshActionLogs]);

  // Mark all as read for current user (with API call)
  const markAllAsRead = useCallback(async () => {
    try {
      await api.post('/notifications/read-all');
      
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
    } catch (err) {
      console.error('Erro ao marcar todas como lidas:', err);
      toast.error('Erro ao marcar notificações como lidas');
    }
  }, [userRole, user, refreshActionLogs]);

  // Remove notification (with API call)
  const removeNotification = useCallback(async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      try {
        await api.delete(`/notifications/${id}`);
        
        logNotificationAction('deleted', id, {
          id: user?.id,
          name: user?.name,
          role: user?.role,
        }, `Notificação "${notification.title}" excluída`, notification.type);
        refreshActionLogs();
        
        setNotifications(prev => prev.filter(n => n.id !== id));
      } catch (err) {
        console.error('Erro ao excluir notificação:', err);
        toast.error('Erro ao excluir notificação');
      }
    }
  }, [notifications, user, refreshActionLogs]);

  // Dismiss notification (keeps in history but removes from active list)
  const dismissNotification = useCallback(async (id: string, reason?: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      try {
        await api.post(`/notifications/${id}/read`);
        
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
      } catch (err) {
        console.error('Erro ao dispensar notificação:', err);
      }
    }
  }, [notifications, user, refreshActionLogs]);

  // Resolve notification (mark as handled/resolved)
  const resolveNotification = useCallback(async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      try {
        await api.post(`/notifications/${id}/read`);
        
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
      } catch (err) {
        console.error('Erro ao resolver notificação:', err);
      }
    }
  }, [notifications, user, refreshActionLogs]);

  // Mute a notification type (with logging)
  const muteNotificationType = useCallback((type: NotificationType) => {
    setMutedTypes(prev => {
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

  // Polling for new notifications
  useEffect(() => {
    if (!isPolling || !isAuthenticated) return;

    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, POLLING_INTERVAL);

    return () => {
      clearInterval(pollInterval);
    };
  }, [isPolling, isAuthenticated, fetchNotifications]);

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
        isLoading,
        refetch: fetchNotifications,
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
