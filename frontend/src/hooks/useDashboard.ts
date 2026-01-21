import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

// Types
interface DashboardSummary {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  inboundMessages: number;
  outboundMessages: number;
  totalUsers: number;
  activeInstances: number;
}

interface MessagesByDay {
  date: string;
  total: number;
  inbound: number;
  outbound: number;
}

interface ConversationsByStatus {
  status: string;
  count: number;
}

interface TopOperator {
  id: string;
  name: string;
  avatar?: string;
  messageCount: number;
}

interface DashboardData {
  period: string;
  summary: DashboardSummary;
  messagesByDay: MessagesByDay[];
  conversationsByStatus: ConversationsByStatus[];
  topOperators: TopOperator[];
}

interface MetricsKPI {
  value: number;
  trend: number;
  trendDirection: 'up' | 'down';
}

interface MetricsData {
  period: string;
  kpis: {
    messages: MetricsKPI;
    conversations: MetricsKPI;
    aiMessages: {
      value: number;
      percentage: number;
    };
    avgResponseTime: {
      value: number;
      unit: string;
    };
  };
  charts: {
    messagesByDay: any[];
    conversationsByDay: any[];
  };
}

interface AIConsumptionData {
  period: string;
  summary: {
    totalTokens: number;
    limit: number;
    percentage: number;
    aiMessages: number;
    avgTokensPerMessage: number;
  };
  usageByDay: any[];
  plan: {
    name: string;
    hasAi: boolean;
    maxTokens: number;
  } | null;
}

interface MRRData {
  currentMrr: number;
  activeSubscriptions: number;
  mrrByMonth: any[];
  tenantsByMonth: any[];
  avgRevenuePerTenant: number;
}

interface FinancialData {
  period: string;
  kpis: {
    totalRevenue: number;
    pendingRevenue: number;
    overdueRevenue: number;
    paidInvoices: number;
    pendingInvoices: number;
    overdueInvoices: number;
  };
  charts: {
    revenueByDay: any[];
    revenueByPlan: any[];
  };
  subscriptionsByPlan: any[];
}

// Hook for tenant dashboard
export function useDashboard(tenantId?: string) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (period: string = '7d') => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { period };
      if (tenantId) {
        params.tenantId = tenantId;
      }

      const response = await api.get('/reports/dashboard', { params });
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error?.message || 'Erro ao carregar dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
}

// Hook for metrics
export function useMetrics(tenantId?: string) {
  const [data, setData] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async (period: string = '7d') => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { period };
      if (tenantId) {
        params.tenantId = tenantId;
      }

      const response = await api.get('/reports/metrics', { params });
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error?.message || 'Erro ao carregar métricas');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erro ao carregar métricas');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  return {
    data,
    loading,
    error,
    refetch: fetchMetrics,
  };
}

// Hook for AI consumption
export function useAIConsumption(tenantId?: string) {
  const [data, setData] = useState<AIConsumptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAIConsumption = useCallback(async (period: string = '30d') => {
    try {
      setLoading(true);
      setError(null);

      const params: any = { period };
      if (tenantId) {
        params.tenantId = tenantId;
      }

      const response = await api.get('/reports/ai-consumption', { params });
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error?.message || 'Erro ao carregar consumo de IA');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erro ao carregar consumo de IA');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchAIConsumption();
  }, [fetchAIConsumption]);

  return {
    data,
    loading,
    error,
    refetch: fetchAIConsumption,
  };
}

// Hook for MRR (SuperAdmin only)
export function useMRR() {
  const [data, setData] = useState<MRRData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMRR = useCallback(async (months: number = 12) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/reports/mrr', { params: { months } });
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error?.message || 'Erro ao carregar MRR');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erro ao carregar MRR');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMRR();
  }, [fetchMRR]);

  return {
    data,
    loading,
    error,
    refetch: fetchMRR,
  };
}

// Hook for financial dashboard (SuperAdmin only)
export function useFinancialDashboard() {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancial = useCallback(async (period: string = '30d') => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/reports/financial', { params: { period } });
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error?.message || 'Erro ao carregar dados financeiros');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinancial();
  }, [fetchFinancial]);

  return {
    data,
    loading,
    error,
    refetch: fetchFinancial,
  };
}

// Hook for usage report
export function useUsageReport(tenantId?: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (tenantId) {
        params.tenantId = tenantId;
      }

      const response = await api.get('/reports/usage', { params });
      
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.error?.message || 'Erro ao carregar uso');
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Erro ao carregar uso');
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    data,
    loading,
    error,
    refetch: fetchUsage,
  };
}
