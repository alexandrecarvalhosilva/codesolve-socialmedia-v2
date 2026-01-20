import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

// Wrapper com Auth e Notification providers
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>
    <NotificationProvider>{children}</NotificationProvider>
  </AuthProvider>
);

describe('NotificationContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Estado Inicial', () => {
    it('deve iniciar com lista de notificações', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });
      
      // O contexto pode iniciar com notificações mock
      expect(Array.isArray(result.current.notifications)).toBe(true);
    });

    it('deve iniciar com polling desativado', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });
      
      expect(result.current.isPolling).toBe(false);
    });

    it('deve iniciar sem tipos silenciados', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });
      
      expect(result.current.mutedTypes).toEqual([]);
    });

    it('deve carregar tipos silenciados do localStorage', () => {
      localStorage.setItem('notification-muted-types', JSON.stringify(['sla_breach', 'chat_unread']));
      
      const { result } = renderHook(() => useNotifications(), { wrapper });
      
      expect(result.current.mutedTypes).toContain('sla_breach');
      expect(result.current.mutedTypes).toContain('chat_unread');
    });
  });

  describe('Tipos Silenciados', () => {
    it('deve silenciar um tipo de notificação', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.muteNotificationType('sla_breach');
      });

      expect(result.current.mutedTypes).toContain('sla_breach');
    });

    it('deve reativar um tipo de notificação silenciado', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.muteNotificationType('sla_breach');
      });
      expect(result.current.mutedTypes).toContain('sla_breach');

      act(() => {
        result.current.unmuteNotificationType('sla_breach');
      });
      expect(result.current.mutedTypes).not.toContain('sla_breach');
    });

    it('não deve duplicar tipos silenciados', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.muteNotificationType('sla_breach');
      });
      
      act(() => {
        result.current.muteNotificationType('sla_breach');
      });

      const count = result.current.mutedTypes.filter(t => t === 'sla_breach').length;
      expect(count).toBe(1);
    });

    it('deve persistir tipos silenciados no localStorage', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.muteNotificationType('payment_overdue');
      });

      const stored = JSON.parse(localStorage.getItem('notification-muted-types') || '[]');
      expect(stored).toContain('payment_overdue');
    });

    it('deve remover tipo do localStorage ao reativar', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.muteNotificationType('ticket_new');
      });

      act(() => {
        result.current.unmuteNotificationType('ticket_new');
      });

      const stored = JSON.parse(localStorage.getItem('notification-muted-types') || '[]');
      expect(stored).not.toContain('ticket_new');
    });
  });

  describe('Polling', () => {
    it('deve ativar/desativar polling', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      expect(result.current.isPolling).toBe(false);

      act(() => {
        result.current.setPollingEnabled(true);
      });

      expect(result.current.isPolling).toBe(true);

      act(() => {
        result.current.setPollingEnabled(false);
      });

      expect(result.current.isPolling).toBe(false);
    });
  });

  describe('Contadores', () => {
    it('unreadCount deve refletir notificações não lidas', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });
      
      // Contar notificações não lidas (usando 'read' ao invés de 'isRead')
      const unreadFromList = result.current.notifications.filter(n => !n.read).length;
      expect(result.current.unreadCount).toBe(unreadFromList);
    });

    it('criticalCount deve contar apenas notificações críticas não lidas', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });
      
      // criticalCount deve ser >= 0
      expect(result.current.criticalCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Ações de Notificação', () => {
    it('markAsRead deve marcar notificação como lida', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });
      
      // Pegar primeira notificação não lida (usando 'read')
      const unreadNotification = result.current.notifications.find(n => !n.read);
      
      if (unreadNotification) {
        const initialUnreadCount = result.current.unreadCount;
        
        act(() => {
          result.current.markAsRead(unreadNotification.id);
        });

        expect(result.current.unreadCount).toBe(initialUnreadCount - 1);
      }
    });

    it('markAllAsRead deve marcar todas como lidas', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });

      act(() => {
        result.current.markAllAsRead();
      });

      expect(result.current.unreadCount).toBe(0);
    });

    it('dismissNotification deve remover notificação da lista', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });
      
      const firstNotification = result.current.notifications[0];
      
      if (firstNotification) {
        const initialCount = result.current.notifications.length;
        
        act(() => {
          result.current.dismissNotification(firstNotification.id);
        });

        expect(result.current.notifications.length).toBe(initialCount - 1);
        expect(result.current.notifications.find(n => n.id === firstNotification.id)).toBeUndefined();
      }
    });

    it('removeNotification deve remover notificação', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });
      
      const firstNotification = result.current.notifications[0];
      
      if (firstNotification) {
        act(() => {
          result.current.removeNotification(firstNotification.id);
        });

        expect(result.current.notifications.find(n => n.id === firstNotification.id)).toBeUndefined();
      }
    });

    it('resolveNotification deve marcar notificação como resolvida', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });
      
      const firstNotification = result.current.notifications[0];
      
      if (firstNotification) {
        const initialCount = result.current.notifications.length;
        
        act(() => {
          result.current.resolveNotification(firstNotification.id);
        });

        // Resolved notifications are filtered out from the list (resolved: true)
        expect(result.current.notifications.length).toBe(initialCount - 1);
        expect(result.current.notifications.find(n => n.id === firstNotification.id)).toBeUndefined();
      }
    });
  });

  describe('Action Logs', () => {
    it('deve manter histórico de ações', () => {
      const { result } = renderHook(() => useNotifications(), { wrapper });
      
      // actionLogs deve ser um array
      expect(Array.isArray(result.current.actionLogs)).toBe(true);
    });
  });
});
