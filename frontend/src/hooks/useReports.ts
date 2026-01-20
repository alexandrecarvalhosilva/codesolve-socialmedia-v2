import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';

// ============================================================================
// DASHBOARD STATS HOOK
// ============================================================================

interface DashboardStats {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  avgResponseTime: number;
  satisfactionRate: number;
  conversionsToday: number;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useDashboardStats(tenantId?: string): UseDashboardStatsReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/reports/dashboard', {
        params: { tenantId },
      });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar estatísticas'));
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

// ============================================================================
// CONVERSATIONS REPORT HOOK
// ============================================================================

interface ConversationsReportOptions {
  tenantId?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

interface ConversationsReportData {
  period: string;
  total: number;
  active: number;
  closed: number;
  avgDuration: number;
}

interface UseConversationsReportReturn {
  data: ConversationsReportData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useConversationsReport(options: ConversationsReportOptions = {}): UseConversationsReportReturn {
  const [data, setData] = useState<ConversationsReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/reports/conversations', {
        params: {
          tenantId: options.tenantId,
          startDate: options.startDate,
          endDate: options.endDate,
          groupBy: options.groupBy || 'day',
        },
      });
      if (response.data.success) {
        setData(response.data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar relatório'));
    } finally {
      setIsLoading(false);
    }
  }, [options.tenantId, options.startDate, options.endDate, options.groupBy]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { data, isLoading, error, refetch: fetchReport };
}

// ============================================================================
// MESSAGES REPORT HOOK
// ============================================================================

interface MessagesReportOptions {
  tenantId?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: 'day' | 'week' | 'month';
}

interface MessagesReportData {
  period: string;
  sent: number;
  received: number;
  total: number;
}

interface UseMessagesReportReturn {
  data: MessagesReportData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMessagesReport(options: MessagesReportOptions = {}): UseMessagesReportReturn {
  const [data, setData] = useState<MessagesReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/reports/messages', {
        params: {
          tenantId: options.tenantId,
          startDate: options.startDate,
          endDate: options.endDate,
          groupBy: options.groupBy || 'day',
        },
      });
      if (response.data.success) {
        setData(response.data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar relatório'));
    } finally {
      setIsLoading(false);
    }
  }, [options.tenantId, options.startDate, options.endDate, options.groupBy]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { data, isLoading, error, refetch: fetchReport };
}

// ============================================================================
// USAGE REPORT HOOK
// ============================================================================

interface UsageReportOptions {
  tenantId?: string;
  startDate?: string;
  endDate?: string;
}

interface UsageReportData {
  resourceType: string;
  usageCount: number;
  limit: number;
  percentage: number;
}

interface UseUsageReportReturn {
  data: UsageReportData[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useUsageReport(options: UsageReportOptions = {}): UseUsageReportReturn {
  const [data, setData] = useState<UsageReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchReport = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/reports/usage', {
        params: {
          tenantId: options.tenantId,
          startDate: options.startDate,
          endDate: options.endDate,
        },
      });
      if (response.data.success) {
        setData(response.data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar relatório'));
    } finally {
      setIsLoading(false);
    }
  }, [options.tenantId, options.startDate, options.endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return { data, isLoading, error, refetch: fetchReport };
}

// ============================================================================
// PERFORMANCE METRICS HOOK
// ============================================================================

interface PerformanceMetrics {
  avgFirstResponseTime: number;
  avgResolutionTime: number;
  messagesPerConversation: number;
  automationRate: number;
  humanInterventionRate: number;
}

interface UsePerformanceMetricsReturn {
  metrics: PerformanceMetrics | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePerformanceMetrics(tenantId?: string): UsePerformanceMetricsReturn {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/reports/performance', {
        params: { tenantId },
      });
      if (response.data.success) {
        setMetrics(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar métricas'));
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return { metrics, isLoading, error, refetch: fetchMetrics };
}

// ============================================================================
// EXPORT REPORT HOOK
// ============================================================================

interface ExportReportOptions {
  type: 'conversations' | 'messages' | 'usage' | 'performance';
  format: 'csv' | 'xlsx' | 'pdf';
  tenantId?: string;
  startDate?: string;
  endDate?: string;
}

interface UseExportReportReturn {
  exportReport: (options: ExportReportOptions) => Promise<void>;
  isExporting: boolean;
}

export function useExportReport(): UseExportReportReturn {
  const [isExporting, setIsExporting] = useState(false);

  const exportReport = useCallback(async (options: ExportReportOptions) => {
    try {
      setIsExporting(true);
      const response = await api.get('/reports/export', {
        params: options,
        responseType: 'blob',
      });
      
      // Criar link para download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${options.type}-${Date.now()}.${options.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Erro ao exportar relatório');
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportReport, isExporting };
}
