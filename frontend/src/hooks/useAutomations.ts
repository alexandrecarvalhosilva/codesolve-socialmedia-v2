import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Automation, PaginationMeta } from '@/lib/apiTypes';

// ============================================================================
// AUTOMATIONS LIST HOOK
// ============================================================================

interface UseAutomationsOptions {
  tenantId?: string;
  status?: string;
  trigger?: string;
  page?: number;
  limit?: number;
}

interface UseAutomationsReturn {
  automations: Automation[];
  isLoading: boolean;
  error: Error | null;
  meta: PaginationMeta | null;
  refetch: () => void;
}

export function useAutomations(options: UseAutomationsOptions = {}): UseAutomationsReturn {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchAutomations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/automations', {
        params: {
          tenantId: options.tenantId,
          status: options.status,
          trigger: options.trigger,
          page: options.page || 1,
          limit: options.limit || 20,
        },
      });
      if (response.data.success) {
        setAutomations(response.data.data || []);
        setMeta(response.data.meta || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar automações'));
    } finally {
      setIsLoading(false);
    }
  }, [options.tenantId, options.status, options.trigger, options.page, options.limit]);

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  return { automations, isLoading, error, meta, refetch: fetchAutomations };
}

// ============================================================================
// SINGLE AUTOMATION HOOK
// ============================================================================

interface UseAutomationReturn {
  automation: Automation | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAutomation(automationId: string | undefined): UseAutomationReturn {
  const [automation, setAutomation] = useState<Automation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAutomation = useCallback(async () => {
    if (!automationId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/automations/${automationId}`);
      if (response.data.success) {
        setAutomation(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar automação'));
    } finally {
      setIsLoading(false);
    }
  }, [automationId]);

  useEffect(() => {
    fetchAutomation();
  }, [fetchAutomation]);

  return { automation, isLoading, error, refetch: fetchAutomation };
}

// ============================================================================
// CREATE AUTOMATION HOOK
// ============================================================================

interface CreateAutomationData {
  name: string;
  description?: string;
  trigger: string;
  conditions?: Record<string, any>;
  actions: Record<string, any>;
  tenantId?: string;
}

interface UseCreateAutomationOptions {
  onSuccess?: (automation: Automation) => void;
  onError?: (error: Error) => void;
}

interface UseCreateAutomationReturn {
  createAutomation: (data: CreateAutomationData) => Promise<Automation | null>;
  isCreating: boolean;
}

export function useCreateAutomation(options: UseCreateAutomationOptions = {}): UseCreateAutomationReturn {
  const [isCreating, setIsCreating] = useState(false);

  const createAutomation = useCallback(async (data: CreateAutomationData) => {
    try {
      setIsCreating(true);
      const response = await api.post('/automations', data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar automação');
      options.onError?.(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [options]);

  return { createAutomation, isCreating };
}

// ============================================================================
// UPDATE AUTOMATION HOOK
// ============================================================================

interface UpdateAutomationData {
  name?: string;
  description?: string;
  trigger?: string;
  conditions?: Record<string, any>;
  actions?: Record<string, any>;
  status?: 'active' | 'inactive';
}

interface UseUpdateAutomationOptions {
  onSuccess?: (automation: Automation) => void;
  onError?: (error: Error) => void;
}

interface UseUpdateAutomationReturn {
  updateAutomation: (id: string, data: UpdateAutomationData) => Promise<Automation | null>;
  isUpdating: boolean;
}

export function useUpdateAutomation(options: UseUpdateAutomationOptions = {}): UseUpdateAutomationReturn {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateAutomation = useCallback(async (id: string, data: UpdateAutomationData) => {
    try {
      setIsUpdating(true);
      const response = await api.patch(`/automations/${id}`, data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar automação');
      options.onError?.(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [options]);

  return { updateAutomation, isUpdating };
}

// ============================================================================
// DELETE AUTOMATION HOOK
// ============================================================================

interface UseDeleteAutomationOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseDeleteAutomationReturn {
  deleteAutomation: (id: string) => Promise<boolean>;
  isDeleting: boolean;
}

export function useDeleteAutomation(options: UseDeleteAutomationOptions = {}): UseDeleteAutomationReturn {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteAutomation = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await api.delete(`/automations/${id}`);
      if (response.data.success) {
        options.onSuccess?.();
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao excluir automação');
      options.onError?.(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [options]);

  return { deleteAutomation, isDeleting };
}

// ============================================================================
// TOGGLE AUTOMATION HOOK
// ============================================================================

interface UseToggleAutomationOptions {
  onSuccess?: (automation: Automation) => void;
  onError?: (error: Error) => void;
}

interface UseToggleAutomationReturn {
  toggleAutomation: (id: string) => Promise<Automation | null>;
  isToggling: boolean;
}

export function useToggleAutomation(options: UseToggleAutomationOptions = {}): UseToggleAutomationReturn {
  const [isToggling, setIsToggling] = useState(false);

  const toggleAutomation = useCallback(async (id: string) => {
    try {
      setIsToggling(true);
      const response = await api.post(`/automations/${id}/toggle`);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao alternar automação');
      options.onError?.(error);
      throw error;
    } finally {
      setIsToggling(false);
    }
  }, [options]);

  return { toggleAutomation, isToggling };
}

// ============================================================================
// AUTOMATION STATS HOOK
// ============================================================================

interface AutomationStats {
  total: number;
  active: number;
  inactive: number;
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
}

interface UseAutomationStatsReturn {
  stats: AutomationStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useAutomationStats(tenantId?: string): UseAutomationStatsReturn {
  const [stats, setStats] = useState<AutomationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/automations/stats', {
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
