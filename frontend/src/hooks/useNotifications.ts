import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Notification, PaginationMeta } from '@/lib/apiTypes';

// ============================================================================
// NOTIFICATIONS LIST HOOK
// ============================================================================

interface UseNotificationsOptions {
  category?: string;
  unreadOnly?: boolean;
  page?: number;
  limit?: number;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  isLoading: boolean;
  error: Error | null;
  meta: PaginationMeta | null;
  unreadCount: number;
  refetch: () => void;
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/notifications', {
        params: {
          category: options.category,
          unreadOnly: options.unreadOnly,
          page: options.page || 1,
          limit: options.limit || 20,
        },
      });
      if (response.data.success) {
        setNotifications(response.data.data || []);
        setMeta(response.data.meta || null);
        // Contar não lidas
        const unread = (response.data.data || []).filter((n: Notification) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar notificações'));
    } finally {
      setIsLoading(false);
    }
  }, [options.category, options.unreadOnly, options.page, options.limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, isLoading, error, meta, unreadCount, refetch: fetchNotifications };
}

// ============================================================================
// UNREAD COUNT HOOK
// ============================================================================

interface UseUnreadCountReturn {
  count: number;
  isLoading: boolean;
  refetch: () => void;
}

export function useUnreadNotificationsCount(): UseUnreadCountReturn {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCount = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/notifications/unread-count');
      if (response.data.success) {
        setCount(response.data.data?.count || 0);
      }
    } catch (err) {
      console.error('Erro ao buscar contagem de notificações:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCount();
    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return { count, isLoading, refetch: fetchCount };
}

// ============================================================================
// MARK AS READ HOOK
// ============================================================================

interface UseMarkAsReadOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseMarkAsReadReturn {
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isMarking: boolean;
}

export function useMarkAsRead(options: UseMarkAsReadOptions = {}): UseMarkAsReadReturn {
  const [isMarking, setIsMarking] = useState(false);

  const markAsRead = useCallback(async (id: string) => {
    try {
      setIsMarking(true);
      const response = await api.post(`/notifications/${id}/read`);
      if (response.data.success) {
        options.onSuccess?.();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao marcar como lida');
      options.onError?.(error);
      throw error;
    } finally {
      setIsMarking(false);
    }
  }, [options]);

  const markAllAsRead = useCallback(async () => {
    try {
      setIsMarking(true);
      const response = await api.post('/notifications/read-all');
      if (response.data.success) {
        options.onSuccess?.();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao marcar todas como lidas');
      options.onError?.(error);
      throw error;
    } finally {
      setIsMarking(false);
    }
  }, [options]);

  return { markAsRead, markAllAsRead, isMarking };
}

// ============================================================================
// DELETE NOTIFICATION HOOK
// ============================================================================

interface UseDeleteNotificationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseDeleteNotificationReturn {
  deleteNotification: (id: string) => Promise<void>;
  isDeleting: boolean;
}

export function useDeleteNotification(options: UseDeleteNotificationOptions = {}): UseDeleteNotificationReturn {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await api.delete(`/notifications/${id}`);
      if (response.data.success) {
        options.onSuccess?.();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao excluir notificação');
      options.onError?.(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [options]);

  return { deleteNotification, isDeleting };
}
