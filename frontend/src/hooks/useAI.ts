import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '../lib/api';

// ============================================================================
// TYPES
// ============================================================================

export interface AIConfig {
  enabled: boolean;
  model: string;
  temperature: number;
  maxTokensPerMessage: number;
  systemPrompt: string;
  usage: {
    tokensUsed: number;
    tokensLimit: number;
    percentage: number;
  };
  plan: {
    name: string;
    maxTokens: number;
  } | null;
}

export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  costPerToken: number;
  isDefault: boolean;
}

export interface AIConsumption {
  period: string;
  summary: {
    totalTokens: number;
    limit: number;
    percentage: number;
    aiMessages: number;
    avgTokensPerMessage: number;
  };
  usageByDay: Array<{
    date: string;
    tokens: number;
  }>;
  plan: {
    name: string;
    maxTokens: number;
  } | null;
  // Optional normalized fields used by dashboards
  totalTokens?: number;
  totalTokensToday?: number;
  totalTokensMonth?: number;
  totalMessages?: number;
  totalMessagesToday?: number;
  estimatedCost?: number;
  estimatedCostToday?: number;
  estimatedCostMonth?: number;
  avgResponseTime?: number | string;
  tokenTrend?: number;
  costTrend?: number;
  messageTrend?: number;
  trendData?: Array<{ date: string; tokens: number }>;
  modelUsage?: Array<{ name: string; value: number; color?: string }>;
  hourlyData?: Array<{ hour: string; messages: number }>;
  topIntents?: Array<unknown>;
  tenantConsumption?: Array<{
    tenantId?: string;
    tenantName?: string;
    totalTokens: number;
    totalMessages?: number;
    estimatedCost?: number;
    avgResponseTime?: number;
  }>;
  dailyUsage?: Array<{ date: string; messages: number; tokens: number; cost: number }>;
  hourlyDistribution?: Array<{ hour: string; messages: number }>;
  recentConversations?: Array<unknown>;
  successRate?: number;
  messagesGrowth?: number;
  tokensGrowth?: number;
  costGrowth?: number;
  totalCost?: number;
  totalTokensUsed?: number;
  limit?: number;
  percentage?: number;
  byModel?: Array<unknown>;
  byDay?: Array<unknown>;
  tenantName?: string;
  promptTokens?: number;
  completionTokens?: number;
  model?: string;
  lastActivity?: string;
  activeTenantsToday?: number;
  topModel?: string;
}

export interface AITestResult {
  response: string;
  tokensUsed: number;
  model: string;
  latencyMs: number;
}

export interface TenantAILimit {
  id: string;
  name: string;
  plan: string;
  tokensUsed: number;
  tokensLimit: number;
  percentage: number;
}

// ============================================================================
// GET AI CONFIG HOOK
// ============================================================================

interface UseAIConfigReturn {
  config: AIConfig | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAIConfig(): UseAIConfigReturn {
  const [config, setConfig] = useState<AIConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/ai/config');
      if (response.data.success) {
        setConfig(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar configuração de AI'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return { config, isLoading, error, refetch: fetchConfig };
}

// ============================================================================
// UPDATE AI CONFIG HOOK
// ============================================================================

interface UseUpdateAIConfigOptions {
  onSuccess?: (config: AIConfig) => void;
  onError?: (error: Error) => void;
}

interface UseUpdateAIConfigReturn {
  updateConfig: (data: Partial<AIConfig>) => Promise<AIConfig | null>;
  isUpdating: boolean;
}

export function useUpdateAIConfig(options: UseUpdateAIConfigOptions = {}): UseUpdateAIConfigReturn {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateConfig = useCallback(async (data: Partial<AIConfig>) => {
    try {
      setIsUpdating(true);
      const response = await api.put('/ai/config', data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar configuração');
      options.onError?.(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [options]);

  return { updateConfig, isUpdating };
}

// ============================================================================
// AI CONSUMPTION HOOK
// ============================================================================

interface UseAIConsumptionReturn {
  consumption: AIConsumption | null;
  isLoading: boolean;
  error: Error | null;
  refetch: (period?: string) => void;
  fetchConsumption: (period?: string) => void;
}

export function useAIConsumption(tenantId?: string, period: string = '30d'): UseAIConsumptionReturn {
  const { user } = useAuth();
  const [consumption, setConsumption] = useState<AIConsumption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const normalizeConsumption = useCallback((data: any, isGlobal: boolean): AIConsumption => {
    const summary = data?.summary || {};
    const usageByDay = (data?.usageByDay || []).map((item: any) => ({
      ...item,
      tokens: Number(item.tokens || 0),
    }));
    const totalTokens = summary.totalTokens || data?.totalTokens || 0;
    const totalMessages = summary.aiMessages || data?.totalMessages || 0;
    const lastDayTokens = usageByDay.length > 0 ? usageByDay[usageByDay.length - 1]?.tokens || 0 : 0;
    const normalizedTenants = (data?.tenantConsumption || data?.tenants || []).map((tenant: any) => {
      const tokens = Number(tenant.totalTokens ?? tenant.tokens ?? 0);
      const cost = Number(tenant.estimatedCost ?? tenant.cost ?? 0);
      const messages = Number(tenant.totalMessages ?? tenant.messages ?? 0);

      return {
        tenantId: tenant.tenantId ?? tenant.id,
        tenantName: tenant.tenantName ?? tenant.name,
        totalTokens: tokens,
        totalMessages: messages,
        estimatedCost: cost,
        avgResponseTime: tenant.avgResponseTime ?? 0,
        tokens,
        cost,
        messages,
      };
    });

    return {
      ...data,
      totalTokens,
      totalTokensMonth: totalTokens,
      totalTokensToday: lastDayTokens,
      totalMessages,
      totalMessagesToday: 0,
      totalCost: data?.totalCost || data?.estimatedCost || 0,
      estimatedCost: data?.estimatedCost || data?.totalCost || 0,
      estimatedCostToday: 0,
      estimatedCostMonth: 0,
      avgResponseTime: data?.avgResponseTime || 0,
      tokenTrend: data?.tokenTrend || 0,
      costTrend: data?.costTrend || 0,
      messageTrend: data?.messageTrend || 0,
      trendData: data?.trendData || usageByDay.map((item: any) => ({
        date: item.date,
        tokens: Number(item.tokens || 0),
      })),
      modelUsage: data?.modelUsage || [],
      hourlyData: data?.hourlyData || [],
      topIntents: data?.topIntents || [],
      tenantConsumption: normalizedTenants,
      dailyUsage: data?.dailyUsage || usageByDay.map((item: any) => ({
        date: item.date,
        messages: 0,
        tokens: Number(item.tokens || 0),
        cost: 0,
      })),
      hourlyDistribution: data?.hourlyDistribution || [],
      recentConversations: data?.recentConversations || [],
      successRate: data?.successRate || 0,
      messagesGrowth: data?.messagesGrowth || 0,
      tokensGrowth: data?.tokensGrowth || 0,
      costGrowth: data?.costGrowth || 0,
      totalTokensUsed: data?.totalTokensUsed || totalTokens,
      limit: summary.limit || data?.limit || 0,
      percentage: summary.percentage || data?.percentage || 0,
      byModel: data?.byModel || [],
      byDay: data?.byDay || [],
      activeTenantsToday: isGlobal ? summary.activeTenants || data?.activeTenantsToday || normalizedTenants.length : undefined,
      topModel: data?.topModel || 'gpt-4',
    } as AIConsumption;
  }, []);

  const fetchConsumption = useCallback(async (customPeriod?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const params: Record<string, string> = { period: customPeriod || period };
      if (tenantId) params.tenantId = tenantId;

      const isGlobal = user?.role === 'superadmin' && !tenantId;
      const endpoint = isGlobal ? '/reports/ai-consumption/global' : '/ai/consumption';
      const response = await api.get(endpoint, params);
      if (response.success && response.data) {
        setConsumption(normalizeConsumption(response.data, isGlobal));
      }
    } catch (err: any) {
      // For superadmin without tenant context, return fallback data silently
      const isTenantRequired = err?.code === 'TENANT_REQUIRED' || err?.status === 400;
      if (!isTenantRequired) {
        setError(err instanceof Error ? err : new Error('Erro ao carregar consumo de AI'));
      }
      // Set fallback data
      setConsumption(normalizeConsumption({
        summary: {
          totalTokens: 0,
          limit: 100000,
          percentage: 0,
          aiMessages: 0,
          avgTokensPerMessage: 0,
        },
        usageByDay: [],
      }, user?.role === 'superadmin' && !tenantId));
    } finally {
      setIsLoading(false);
    }
  }, [normalizeConsumption, period, tenantId, user?.role]);

  useEffect(() => {
    fetchConsumption();
  }, [fetchConsumption]);

  return { consumption, isLoading, error, refetch: fetchConsumption, fetchConsumption };
}

// ============================================================================
// AI MODELS HOOK
// ============================================================================

interface UseAIModelsReturn {
  models: AIModel[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAIModels(): UseAIModelsReturn {
  const [models, setModels] = useState<AIModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchModels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/ai/models');
      if (response.data.success) {
        setModels(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar modelos'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return { models, isLoading, error, refetch: fetchModels };
}

// ============================================================================
// TEST AI HOOK
// ============================================================================

interface UseTestAIOptions {
  onSuccess?: (result: AITestResult) => void;
  onError?: (error: Error) => void;
}

interface UseTestAIReturn {
  testAI: (message: string, options?: { systemPrompt?: string; model?: string; temperature?: number }) => Promise<AITestResult | null>;
  isTesting: boolean;
  result: AITestResult | null;
}

export function useTestAI(options: UseTestAIOptions = {}): UseTestAIReturn {
  const [isTesting, setIsTesting] = useState(false);
  const [result, setResult] = useState<AITestResult | null>(null);

  const testAI = useCallback(async (
    message: string,
    testOptions?: { systemPrompt?: string; model?: string; temperature?: number }
  ) => {
    try {
      setIsTesting(true);
      const response = await api.post('/ai/test', {
        message,
        ...testOptions,
      });
      if (response.data.success) {
        setResult(response.data.data);
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao testar AI');
      options.onError?.(error);
      throw error;
    } finally {
      setIsTesting(false);
    }
  }, [options]);

  return { testAI, isTesting, result };
}

// ============================================================================
// AI LIMITS HOOK (SuperAdmin)
// ============================================================================

interface UseAILimitsReturn {
  limits: TenantAILimit[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAILimits(page: number = 1, limit: number = 20): UseAILimitsReturn {
  const [limits, setLimits] = useState<TenantAILimit[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchLimits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/ai/limits', { params: { page, limit } });
      if (response.data.success) {
        setLimits(response.data.data.items);
        setTotal(response.data.data.total);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar limites'));
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  return { limits, total, isLoading, error, refetch: fetchLimits };
}

// ============================================================================
// UPDATE AI LIMIT HOOK (SuperAdmin)
// ============================================================================

interface UseUpdateAILimitOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseUpdateAILimitReturn {
  updateLimit: (tenantId: string, maxTokensPerMonth: number) => Promise<boolean>;
  isUpdating: boolean;
}

export function useUpdateAILimit(options: UseUpdateAILimitOptions = {}): UseUpdateAILimitReturn {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateLimit = useCallback(async (tenantId: string, maxTokensPerMonth: number) => {
    try {
      setIsUpdating(true);
      const response = await api.put(`/ai/limits/${tenantId}`, { maxTokensPerMonth });
      if (response.data.success) {
        options.onSuccess?.();
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar limite');
      options.onError?.(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [options]);

  return { updateLimit, isUpdating };
}
