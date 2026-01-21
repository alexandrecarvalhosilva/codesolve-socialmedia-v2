/**
 * useUsers - Hooks para gerenciamento de Usuários
 * 
 * Fornece hooks para:
 * - Listar usuários com paginação e filtros
 * - Obter detalhes de um usuário
 * - Criar, atualizar e deletar usuários
 * - Ativar e desativar usuários
 */

import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useQuery, useMutation, usePaginatedQuery } from './useApi';
import type { 
  User, 
  CreateUserData, 
  UpdateUserData,
  UserRole 
} from '@/lib/apiTypes';

// ============================================================================
// TIPOS
// ============================================================================

interface UsersListResponse {
  users: User[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UserFilters {
  search?: string;
  role?: UserRole;
  tenantId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// ============================================================================
// HOOKS DE QUERY
// ============================================================================

/**
 * Hook para listar usuários com paginação e filtros
 */
export function useUsers(filters: UserFilters = {}) {
  const { search, role, tenantId, isActive, page = 1, limit = 10 } = filters;

  const query = usePaginatedQuery<UsersListResponse>(
    '/users',
    { page, limit, search, role, tenantId, isActive },
    { immediate: true }
  );

  return {
    users: query.data?.users || [],
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
 * Hook para obter detalhes de um usuário específico
 */
export function useUser(userId: string | undefined) {
  const query = useQuery<{ user: User }>(
    `/api/users/${userId}`,
    undefined,
    { immediate: !!userId }
  );

  return {
    user: query.data?.user || null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obter o usuário atual (me)
 */
export function useCurrentUser() {
  const query = useQuery<{ user: User }>(
    '/auth/me',
    undefined,
    { immediate: true }
  );

  return {
    user: query.data?.user || null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// HOOKS DE MUTATION
// ============================================================================

/**
 * Hook para criar um novo usuário
 */
export function useCreateUser(options?: {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<{ user: User }, CreateUserData>(
    (data) => api.post('/users', data),
    {
      onSuccess: (data) => {
        if (data?.user) {
          options?.onSuccess?.(data.user);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    createUser: mutation.mutate,
    isCreating: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para atualizar um usuário
 */
export function useUpdateUser(options?: {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<{ user: User }, { id: string; data: UpdateUserData }>(
    ({ id, data }) => api.put(`/api/users/${id}`, data),
    {
      onSuccess: (data) => {
        if (data?.user) {
          options?.onSuccess?.(data.user);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    updateUser: useCallback((id: string, data: UpdateUserData) => 
      mutation.mutate({ id, data }), [mutation.mutate]),
    isUpdating: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para deletar um usuário
 */
export function useDeleteUser(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<void, string>(
    (id) => api.delete(`/api/users/${id}`),
    {
      onSuccess: () => options?.onSuccess?.(),
      onError: options?.onError,
    }
  );

  return {
    deleteUser: mutation.mutate,
    isDeleting: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para ativar um usuário
 */
export function useActivateUser(options?: {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<{ user: User }, string>(
    (id) => api.post(`/api/users/${id}/activate`),
    {
      onSuccess: (data) => {
        if (data?.user) {
          options?.onSuccess?.(data.user);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    activateUser: mutation.mutate,
    isActivating: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para desativar um usuário
 */
export function useDeactivateUser(options?: {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<{ user: User }, string>(
    (id) => api.post(`/api/users/${id}/deactivate`),
    {
      onSuccess: (data) => {
        if (data?.user) {
          options?.onSuccess?.(data.user);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    deactivateUser: mutation.mutate,
    isDeactivating: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para alterar senha do usuário
 */
export function useChangePassword(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<void, { id: string; currentPassword?: string; newPassword: string }>(
    ({ id, currentPassword, newPassword }) => 
      api.post(`/api/users/${id}/change-password`, { currentPassword, newPassword }),
    {
      onSuccess: () => options?.onSuccess?.(),
      onError: options?.onError,
    }
  );

  return {
    changePassword: mutation.mutate,
    isChanging: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default useUsers;
