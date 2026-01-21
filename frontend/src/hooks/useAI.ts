import { useState, useEffect, useCallback } from 'react';
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
  refetch: () => void;
}

export function useAIConsumption(period: string = '30d', tenantId?: string): UseAIConsumptionReturn {
  const [consumption, setConsumption] = useState<AIConsumption | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConsumption = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: Record<string, string> = { period };
      if (tenantId) params.tenantId = tenantId;

      const response = await api.get('/ai/consumption', params);
      if (response.success && response.data) {
        setConsumption(response.data as AIConsumption);
      }
    } catch (err: any) {
      // For superadmin without tenant context, return fallback data silently
      const isTenantRequired = err?.code === 'TENANT_REQUIRED' || err?.status === 400;
      if (!isTenantRequired) {
        setError(err instanceof Error ? err : new Error('Erro ao carregar consumo de AI'));
      }
      // Set fallback data
      setConsumption({
        totalTokensUsed: 0,
        totalCost: 0,
        limit: 100000,
        percentage: 0,
        byModel: [],
        byDay: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, [period, tenantId]);

  useEffect(() => {
    fetchConsumption();
  }, [fetchConsumption]);

  return { consumption, isLoading, error, refetch: fetchConsumption };
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
