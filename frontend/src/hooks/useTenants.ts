/**
 * useTenants - Hooks para gerenciamento de Tenants
 * 
 * Fornece hooks para:
 * - Listar tenants com paginação e filtros
 * - Obter detalhes de um tenant
 * - Criar, atualizar e deletar tenants
 * - Suspender e ativar tenants
 */

import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useQuery, useMutation, usePaginatedQuery } from './useApi';
import type { 
  Tenant, 
  CreateTenantData, 
  UpdateTenantData,
  TenantStatus 
} from '@/lib/apiTypes';

// ============================================================================
// TIPOS
// ============================================================================

interface TenantsListResponse {
  tenants: Tenant[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TenantFilters {
  search?: string;
  status?: TenantStatus;
  planId?: string;
  page?: number;
  limit?: number;
}

// ============================================================================
// HOOKS DE QUERY
// ============================================================================

/**
 * Hook para listar tenants com paginação e filtros
 */
export function useTenants(filters: TenantFilters = {}) {
  const { search, status, planId, page = 1, limit = 10 } = filters;

  const query = usePaginatedQuery<TenantsListResponse>(
    '/tenants',
    { page, limit, search, status, planId },
    { immediate: true }
  );

  return {
    tenants: query.data?.tenants || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    // Paginação
    page: query.page,
    limit: query.limit,
    search: query.search,
    goToPage: query.goToPage,
    nextPage: query.nextPage,
    prevPage: query.prevPage,
    changeLimit: query.changeLimit,
    changeSearch: query.changeSearch,
  };
}

/**
 * Hook para obter detalhes de um tenant específico
 */
export function useTenant(tenantId: string | undefined) {
  const query = useQuery<{ tenant: Tenant }>(
    `/api/tenants/${tenantId}`,
    undefined,
    { immediate: !!tenantId }
  );

  return {
    tenant: query.data?.tenant || null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// HOOKS DE MUTATION
// ============================================================================

/**
 * Hook para criar um novo tenant
 */
export function useCreateTenant(options?: {
  onSuccess?: (tenant: Tenant) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<{ tenant: Tenant }, CreateTenantData>(
    (data) => api.post('/tenants', data),
    {
      onSuccess: (data) => {
        if (data?.tenant) {
          options?.onSuccess?.(data.tenant);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    createTenant: mutation.mutate,
    isCreating: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para atualizar um tenant
 */
export function useUpdateTenant(options?: {
  onSuccess?: (tenant: Tenant) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<{ tenant: Tenant }, { id: string; data: UpdateTenantData }>(
    ({ id, data }) => api.put(`/api/tenants/${id}`, data),
    {
      onSuccess: (data) => {
        if (data?.tenant) {
          options?.onSuccess?.(data.tenant);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    updateTenant: useCallback((id: string, data: UpdateTenantData) => 
      mutation.mutate({ id, data }), [mutation.mutate]),
    isUpdating: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para deletar um tenant
 */
export function useDeleteTenant(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<void, string>(
    (id) => api.delete(`/api/tenants/${id}`),
    {
      onSuccess: () => options?.onSuccess?.(),
      onError: options?.onError,
    }
  );

  return {
    deleteTenant: mutation.mutate,
    isDeleting: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para suspender um tenant
 */
export function useSuspendTenant(options?: {
  onSuccess?: (tenant: Tenant) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<{ tenant: Tenant }, string>(
    (id) => api.post(`/api/tenants/${id}/suspend`),
    {
      onSuccess: (data) => {
        if (data?.tenant) {
          options?.onSuccess?.(data.tenant);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    suspendTenant: mutation.mutate,
    isSuspending: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para ativar um tenant
 */
export function useActivateTenant(options?: {
  onSuccess?: (tenant: Tenant) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<{ tenant: Tenant }, string>(
    (id) => api.post(`/api/tenants/${id}/activate`),
    {
      onSuccess: (data) => {
        if (data?.tenant) {
          options?.onSuccess?.(data.tenant);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    activateTenant: mutation.mutate,
    isActivating: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default useTenants;
