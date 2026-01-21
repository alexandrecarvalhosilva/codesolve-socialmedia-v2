/**
 * useWhatsApp - Hooks para gerenciamento de Instâncias WhatsApp
 * 
 * Fornece hooks para:
 * - Listar instâncias WhatsApp
 * - Criar, atualizar e deletar instâncias
 * - Gerar QR Code para conexão
 * - Verificar status de conexão
 */

import { useCallback } from 'react';
import { api } from '@/lib/api';
import { useQuery, useMutation, usePaginatedQuery } from './useApi';
import type { WhatsappInstance, WhatsappInstanceStatus } from '@/lib/apiTypes';

// ============================================================================
// TIPOS
// ============================================================================

interface InstancesListResponse {
  instances: WhatsappInstance[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface InstanceResponse {
  instance: WhatsappInstance;
}

interface QRCodeResponse {
  qrCode: string | null;
  pairingCode?: string;
  expiresAt: string;
}

interface InstanceFilters {
  tenantId?: string;
  status?: WhatsappInstanceStatus;
  search?: string;
  page?: number;
  limit?: number;
}

interface CreateInstanceData {
  name: string;
  phoneNumber?: string;
  tenantId?: string;
}

interface UpdateInstanceData {
  name?: string;
  phoneNumber?: string;
  webhookUrl?: string;
}

// ============================================================================
// HOOKS DE QUERY
// ============================================================================

/**
 * Hook para listar instâncias WhatsApp com paginação e filtros
 */
export function useWhatsappInstances(filters: InstanceFilters = {}) {
  const { tenantId, status, search, page = 1, limit = 10 } = filters;

  const query = usePaginatedQuery<InstancesListResponse>(
    '/whatsapp/instances',
    { page, limit, tenantId, status, search },
    { immediate: true }
  );

  return {
    instances: query.data?.instances || [],
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
 * Hook para obter detalhes de uma instância específica
 */
export function useWhatsappInstance(instanceId: string | undefined) {
  const query = useQuery<InstanceResponse>(
    `/api/whatsapp/instances/${instanceId}`,
    undefined,
    { immediate: !!instanceId }
  );

  return {
    instance: query.data?.instance || null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para obter QR Code de uma instância
 */
export function useWhatsAppQRCode(instanceId: string | undefined) {
  const query = useQuery<QRCodeResponse>(
    `/api/whatsapp/instances/${instanceId}/qrcode`,
    undefined,
    { immediate: false }
  );

  return {
    qrCode: query.data?.qrCode || null,
    expiresAt: query.data?.expiresAt || null,
    isLoading: query.isLoading,
    error: query.error,
    fetchQRCode: query.refetch,
  };
}

// ============================================================================
// HOOKS DE MUTATION
// ============================================================================

/**
 * Hook para criar uma nova instância WhatsApp
 */
export function useCreateWhatsappInstance(options?: {
  onSuccess?: (instance: WhatsappInstance) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<InstanceResponse, CreateInstanceData>(
    (data) => api.post('/whatsapp/instances', data),
    {
      onSuccess: (data) => {
        if (data?.instance) {
          options?.onSuccess?.(data.instance);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    createInstance: mutation.mutate,
    isCreating: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para atualizar uma instância WhatsApp
 */
export function useUpdateWhatsappInstance(options?: {
  onSuccess?: (instance: WhatsappInstance) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<InstanceResponse, { id: string; data: UpdateInstanceData }>(
    ({ id, data }) => api.put(`/api/whatsapp/instances/${id}`, data),
    {
      onSuccess: (data) => {
        if (data?.instance) {
          options?.onSuccess?.(data.instance);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    updateInstance: useCallback((id: string, data: UpdateInstanceData) => 
      mutation.mutate({ id, data }), [mutation.mutate]),
    isUpdating: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para deletar uma instância WhatsApp
 */
export function useDeleteWhatsappInstance(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<void, string>(
    (id) => api.delete(`/api/whatsapp/instances/${id}`),
    {
      onSuccess: () => options?.onSuccess?.(),
      onError: options?.onError,
    }
  );

  return {
    deleteInstance: mutation.mutate,
    isDeleting: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para conectar uma instância (gerar QR Code)
 */
export function useConnectWhatsappInstance(options?: {
  onSuccess?: (data: QRCodeResponse) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<QRCodeResponse, string>(
    (id) => api.post(`/api/whatsapp/instances/${id}/connect`),
    {
      onSuccess: (data) => {
        if (data) {
          options?.onSuccess?.(data);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    connectInstance: mutation.mutate,
    qrCode: mutation.data?.qrCode || null,
    expiresAt: mutation.data?.expiresAt || null,
    isConnecting: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para desconectar uma instância
 */
export function useDisconnectWhatsappInstance(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<void, string>(
    (id) => api.post(`/api/whatsapp/instances/${id}/disconnect`),
    {
      onSuccess: () => options?.onSuccess?.(),
      onError: options?.onError,
    }
  );

  return {
    disconnectInstance: mutation.mutate,
    isDisconnecting: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para reiniciar uma instância
 */
export function useRestartWhatsappInstance(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<void, string>(
    (id) => api.post(`/api/whatsapp/instances/${id}/restart`),
    {
      onSuccess: () => options?.onSuccess?.(),
      onError: options?.onError,
    }
  );

  return {
    restartInstance: mutation.mutate,
    isRestarting: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para verificar status de uma instância
 */
export function useCheckWhatsAppStatus(options?: {
  onSuccess?: (instance: WhatsappInstance) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<InstanceResponse, string>(
    (id) => api.get(`/api/whatsapp/instances/${id}/status`),
    {
      onSuccess: (data) => {
        if (data?.instance) {
          options?.onSuccess?.(data.instance);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    checkStatus: mutation.mutate,
    instance: mutation.data?.instance || null,
    isChecking: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================================================
// HOOK COMBINADO (usado pelo Onboarding)
// ============================================================================

/**
 * Hook combinado para gerenciamento de WhatsApp
 * Usado principalmente na página de Onboarding
 */
export function useWhatsApp() {
  const { instances, isLoading, refetch } = useWhatsappInstances();
  const { createInstance: doCreate, isCreating } = useCreateWhatsappInstance({
    onSuccess: () => refetch(),
  });
  const { connectInstance, qrCode, isConnecting } = useConnectWhatsappInstance();
  const { disconnectInstance: doDisconnect, isDisconnecting } = useDisconnectWhatsappInstance({
    onSuccess: () => refetch(),
  });

  const createInstance = useCallback(async (data: CreateInstanceData) => {
    return doCreate(data);
  }, [doCreate]);

  const getQrCode = useCallback(async (instanceId: string) => {
    connectInstance(instanceId);
    return qrCode;
  }, [connectInstance, qrCode]);

  const disconnectInstance = useCallback(async (instanceId: string) => {
    doDisconnect(instanceId);
  }, [doDisconnect]);

  return {
    instances,
    isLoading: isLoading || isCreating || isConnecting || isDisconnecting,
    createInstance,
    getQrCode,
    disconnectInstance,
    refetch,
  };
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default useWhatsappInstances;
