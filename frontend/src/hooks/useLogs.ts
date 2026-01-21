import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  userId: string;
  tenantId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LogsFilters {
  action?: string;
  entity?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface LogsResponse {
  items: AuditLog[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export function useLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async (filters: LogsFilters = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.entity) params.append('entity', filters.entity);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (user?.tenantId) params.append('tenantId', user.tenantId);

      const response = await api.get<LogsResponse>('/logs/audit', Object.fromEntries(params.entries()));
      
      if (response.success && response.data) {
        const data = response.data;
        const items = data.items || [];
        setLogs(items);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        const limitValue = data.limit || filters.limit || 20;
        setTotalPages(Math.max(1, Math.ceil((data.total || 0) / Number(limitValue))));
      }
    } catch (err) {
      setError('Erro ao carregar logs');
      console.error('Erro ao buscar logs:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.tenantId]);

  const exportLogs = useCallback(async (filters: LogsFilters = {}, format: 'csv' | 'json' = 'csv') => {
    try {
      // Export using current logs (no backend export endpoint)
      const content = format === 'json' 
        ? JSON.stringify(logs, null, 2)
        : logs.map(log => `${log.createdAt},${log.action},${log.entity},${log.user?.name || 'Sistema'}`).join('\n');
      
      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    } catch (err) {
      console.error('Erro ao exportar logs:', err);
      // Fallback - export current logs
      const content = format === 'json' 
        ? JSON.stringify(logs, null, 2)
        : logs.map(log => `${log.createdAt},${log.action},${log.entity},${log.user?.name || 'Sistema'}`).join('\n');
      
      const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return true;
    }
  }, [logs, user?.tenantId]);

  const getLogDetails = useCallback(async (logId: string) => {
    try {
      const response = await api.get(`/logs/audit/${logId}`);
      if (response.success && response.data) {
        return response.data as any;
      }
      return null;
    } catch (err) {
      console.error('Erro ao buscar detalhes do log:', err);
      return logs.find(l => l.id === logId) || null;
    }
  }, [logs]);

  return {
    logs,
    total,
    page,
    totalPages,
    isLoading,
    error,
    fetchLogs,
    exportLogs,
    getLogDetails,
    setPage,
  };
}
