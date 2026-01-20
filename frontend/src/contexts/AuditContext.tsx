import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useAuth, Permission, UserRole } from './AuthContext';

// Tipos de eventos de auditoria
export type AuditEventType = 
  | 'access_denied'
  | 'permission_denied'
  | 'action_blocked'
  | 'login_success'
  | 'login_failed'
  | 'logout'
  | 'role_change'
  | 'permission_check'
  | 'module_enabled'
  | 'module_disabled';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  eventType: AuditEventType;
  userId?: string;
  userName?: string;
  userRole?: UserRole;
  resource: string;
  action?: string;
  requiredPermissions?: Permission[];
  requiredRoles?: UserRole[];
  userPermissions?: Permission[];
  success: boolean;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  // Module audit fields
  tenantId?: string;
  moduleId?: string;
  moduleName?: string;
  accessSource?: string;
}

interface ModuleAuditData {
  tenantId: string;
  moduleId: string;
  moduleName: string;
  accessSource?: string;
}

interface AuditContextType {
  events: AuditEvent[];
  logAccessDenied: (resource: string, requiredRoles?: UserRole[], requiredPermissions?: Permission[], details?: string) => void;
  logPermissionDenied: (action: string, requiredPermissions: Permission[], details?: string) => void;
  logActionBlocked: (action: string, resource: string, details?: string) => void;
  logLoginAttempt: (email: string, success: boolean, details?: string) => void;
  logLogout: () => void;
  logModuleChange: (action: 'enabled' | 'disabled', moduleData: ModuleAuditData, details?: string) => void;
  clearEvents: () => void;
  getEventsByType: (type: AuditEventType) => AuditEvent[];
  getRecentEvents: (limit?: number) => AuditEvent[];
  getEventStats: () => { total: number; denied: number; blocked: number; success: number; moduleChanges: number };
  getModuleAuditLogs: (tenantId?: string) => AuditEvent[];
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

const AUDIT_STORAGE_KEY = 'codesolve_audit_events';
const MAX_EVENTS = 500;

export function AuditProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Carregar eventos do localStorage
  const loadEvents = (): AuditEvent[] => {
    try {
      const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Array<Omit<AuditEvent, 'timestamp'> & { timestamp: string }>;
        return parsed.map((e) => ({
          ...e,
          timestamp: new Date(e.timestamp)
        }));
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  };

  const [events, setEvents] = useState<AuditEvent[]>(loadEvents);

  // Salvar eventos no localStorage
  const saveEvents = (newEvents: AuditEvent[]) => {
    const limited = newEvents.slice(0, MAX_EVENTS);
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(limited));
    setEvents(limited);
  };

  const createEvent = useCallback((
    eventType: AuditEventType,
    resource: string,
    success: boolean,
    options?: {
      action?: string;
      requiredPermissions?: Permission[];
      requiredRoles?: UserRole[];
      details?: string;
    }
  ): AuditEvent => {
    return {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      eventType,
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      resource,
      action: options?.action,
      requiredPermissions: options?.requiredPermissions,
      requiredRoles: options?.requiredRoles,
      success,
      details: options?.details,
      userAgent: navigator.userAgent
    };
  }, [user]);

  const addEvent = useCallback((event: AuditEvent) => {
    setEvents(prev => {
      const newEvents = [event, ...prev].slice(0, MAX_EVENTS);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(newEvents));
      return newEvents;
    });
  }, []);

  const logAccessDenied = useCallback((
    resource: string,
    requiredRoles?: UserRole[],
    requiredPermissions?: Permission[],
    details?: string
  ) => {
    const event = createEvent('access_denied', resource, false, {
      requiredRoles,
      requiredPermissions,
      details: details || `Acesso negado à rota ${resource}`
    });
    addEvent(event);
  }, [createEvent, addEvent]);

  const logPermissionDenied = useCallback((
    action: string,
    requiredPermissions: Permission[],
    details?: string
  ) => {
    const event = createEvent('permission_denied', action, false, {
      action,
      requiredPermissions,
      details: details || `Permissão negada para ação: ${action}`
    });
    addEvent(event);
  }, [createEvent, addEvent]);

  const logActionBlocked = useCallback((
    action: string,
    resource: string,
    details?: string
  ) => {
    const event = createEvent('action_blocked', resource, false, {
      action,
      details: details || `Ação bloqueada: ${action} em ${resource}`
    });
    addEvent(event);
  }, [createEvent, addEvent]);

  const logLoginAttempt = useCallback((
    email: string,
    success: boolean,
    details?: string
  ) => {
    const event: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      eventType: success ? 'login_success' : 'login_failed',
      resource: 'auth/login',
      success,
      details: details || (success ? `Login bem-sucedido: ${email}` : `Tentativa de login falhou: ${email}`),
      userAgent: navigator.userAgent
    };
    addEvent(event);
  }, [addEvent]);

  const logLogout = useCallback(() => {
    const event = createEvent('logout', 'auth/logout', true, {
      details: 'Usuário realizou logout'
    });
    addEvent(event);
  }, [createEvent, addEvent]);

  const logModuleChange = useCallback((
    action: 'enabled' | 'disabled',
    moduleData: ModuleAuditData,
    details?: string
  ) => {
    const eventType = action === 'enabled' ? 'module_enabled' : 'module_disabled';
    const event: AuditEvent = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      eventType,
      userId: user?.id,
      userName: user?.name,
      userRole: user?.role,
      resource: `tenant/${moduleData.tenantId}/modules/${moduleData.moduleId}`,
      action: action === 'enabled' ? 'Ativação de módulo' : 'Desativação de módulo',
      success: true,
      details: details || `Módulo "${moduleData.moduleName}" ${action === 'enabled' ? 'ativado' : 'desativado'} para tenant ${moduleData.tenantId}`,
      userAgent: navigator.userAgent,
      tenantId: moduleData.tenantId,
      moduleId: moduleData.moduleId,
      moduleName: moduleData.moduleName,
      accessSource: moduleData.accessSource,
    };
    addEvent(event);
  }, [user, addEvent]);

  const clearEvents = useCallback(() => {
    localStorage.removeItem(AUDIT_STORAGE_KEY);
    setEvents([]);
  }, []);

  const getEventsByType = useCallback((type: AuditEventType): AuditEvent[] => {
    return events.filter(e => e.eventType === type);
  }, [events]);

  const getRecentEvents = useCallback((limit: number = 50): AuditEvent[] => {
    return events.slice(0, limit);
  }, [events]);

  const getEventStats = useCallback(() => {
    const denied = events.filter(e => 
      e.eventType === 'access_denied' || e.eventType === 'permission_denied'
    ).length;
    const blocked = events.filter(e => e.eventType === 'action_blocked').length;
    const success = events.filter(e => e.success).length;
    const moduleChanges = events.filter(e => 
      e.eventType === 'module_enabled' || e.eventType === 'module_disabled'
    ).length;
    
    return {
      total: events.length,
      denied,
      blocked,
      success,
      moduleChanges
    };
  }, [events]);

  const getModuleAuditLogs = useCallback((tenantId?: string): AuditEvent[] => {
    return events.filter(e => 
      (e.eventType === 'module_enabled' || e.eventType === 'module_disabled') &&
      (!tenantId || e.tenantId === tenantId)
    );
  }, [events]);

  return (
    <AuditContext.Provider
      value={{
        events,
        logAccessDenied,
        logPermissionDenied,
        logActionBlocked,
        logLoginAttempt,
        logLogout,
        logModuleChange,
        clearEvents,
        getEventsByType,
        getRecentEvents,
        getEventStats,
        getModuleAuditLogs
      }}
    >
      {children}
    </AuditContext.Provider>
  );
}

export function useAudit() {
  const context = useContext(AuditContext);
  if (!context) {
    throw new Error('useAudit must be used within an AuditProvider');
  }
  return context;
}
