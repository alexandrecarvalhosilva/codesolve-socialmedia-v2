/**
 * useChat - Hooks para gerenciamento de Conversas e Mensagens
 * 
 * Fornece hooks para:
 * - Listar conversas
 * - Obter mensagens de uma conversa
 * - Enviar mensagens
 * - Atualizar status de conversas
 */

import { useCallback, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { useQuery, useMutation, usePaginatedQuery } from './useApi';
import type { 
  Conversation, 
  Message, 
  ConversationStatus, 
  ConversationChannel,
  SendMessageData 
} from '@/lib/apiTypes';

// ============================================================================
// TIPOS
// ============================================================================

interface ConversationsListResponse {
  conversations: Conversation[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ConversationResponse {
  conversation: Conversation;
}

interface MessagesListResponse {
  messages: Message[];
  meta: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

interface MessageResponse {
  message: Message;
}

interface ConversationFilters {
  tenantId?: string;
  status?: ConversationStatus;
  channel?: ConversationChannel;
  assignedUserId?: string;
  whatsappInstanceId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface UpdateConversationData {
  status?: ConversationStatus;
  assignedUserId?: string | null;
}

// ============================================================================
// HOOKS DE QUERY - CONVERSAS
// ============================================================================

/**
 * Hook para listar conversas com paginação e filtros
 */
export function useConversations(filters: ConversationFilters = {}) {
  const { 
    tenantId, 
    status, 
    channel, 
    assignedUserId, 
    whatsappInstanceId,
    search, 
    page = 1, 
    limit = 20 
  } = filters;

  const query = usePaginatedQuery<ConversationsListResponse>(
    '/api/chat/conversations',
    { page, limit, tenantId, status, channel, assignedUserId, whatsappInstanceId, search },
    { immediate: true }
  );

  return {
    conversations: query.data?.conversations || [],
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
 * Hook para obter detalhes de uma conversa específica
 */
export function useConversation(conversationId: string | undefined) {
  const query = useQuery<ConversationResponse>(
    `/api/chat/conversations/${conversationId}`,
    undefined,
    { immediate: !!conversationId }
  );

  return {
    conversation: query.data?.conversation || null,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// ============================================================================
// HOOKS DE QUERY - MENSAGENS
// ============================================================================

/**
 * Hook para listar mensagens de uma conversa
 */
export function useMessages(conversationId: string | undefined, options?: { limit?: number }) {
  const { limit = 50 } = options || {};
  
  const query = useQuery<MessagesListResponse>(
    `/api/chat/conversations/${conversationId}/messages`,
    { limit },
    { immediate: !!conversationId }
  );

  return {
    messages: query.data?.messages || [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    hasMore: query.data?.meta?.hasMore || false,
  };
}

/**
 * Hook para polling de novas mensagens
 */
export function useMessagesPolling(
  conversationId: string | undefined, 
  options?: { 
    interval?: number; 
    enabled?: boolean;
    onNewMessages?: (messages: Message[]) => void;
  }
) {
  const { interval = 5000, enabled = true, onNewMessages } = options || {};
  const lastMessageIdRef = useRef<string | null>(null);
  
  const query = useQuery<MessagesListResponse>(
    `/api/chat/conversations/${conversationId}/messages`,
    { limit: 50 },
    { immediate: false }
  );

  useEffect(() => {
    if (!conversationId || !enabled) return;

    const poll = async () => {
      await query.refetch();
      
      if (query.data?.messages && query.data.messages.length > 0) {
        const latestMessage = query.data.messages[0];
        
        if (lastMessageIdRef.current && latestMessage.id !== lastMessageIdRef.current) {
          // Encontrar novas mensagens
          const lastIndex = query.data.messages.findIndex(m => m.id === lastMessageIdRef.current);
          if (lastIndex > 0) {
            const newMessages = query.data.messages.slice(0, lastIndex);
            onNewMessages?.(newMessages);
          }
        }
        
        lastMessageIdRef.current = latestMessage.id;
      }
    };

    // Poll inicial
    poll();

    // Configurar intervalo
    const intervalId = setInterval(poll, interval);

    return () => clearInterval(intervalId);
  }, [conversationId, enabled, interval]);

  return {
    messages: query.data?.messages || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

// ============================================================================
// HOOKS DE MUTATION - CONVERSAS
// ============================================================================

/**
 * Hook para atualizar uma conversa (status, atribuição)
 */
export function useUpdateConversation(options?: {
  onSuccess?: (conversation: Conversation) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<ConversationResponse, { id: string; data: UpdateConversationData }>(
    ({ id, data }) => api.patch(`/api/chat/conversations/${id}`, data),
    {
      onSuccess: (data) => {
        if (data?.conversation) {
          options?.onSuccess?.(data.conversation);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    updateConversation: useCallback((id: string, data: UpdateConversationData) => 
      mutation.mutate({ id, data }), [mutation.mutate]),
    isUpdating: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para fechar/resolver uma conversa
 */
export function useCloseConversation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<ConversationResponse, string>(
    (id) => api.patch(`/api/chat/conversations/${id}`, { status: 'closed' }),
    {
      onSuccess: () => options?.onSuccess?.(),
      onError: options?.onError,
    }
  );

  return {
    closeConversation: mutation.mutate,
    isClosing: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para atribuir conversa a um usuário
 */
export function useAssignConversation(options?: {
  onSuccess?: (conversation: Conversation) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<ConversationResponse, { conversationId: string; userId: string | null }>(
    ({ conversationId, userId }) => api.patch(`/api/chat/conversations/${conversationId}`, { assignedUserId: userId }),
    {
      onSuccess: (data) => {
        if (data?.conversation) {
          options?.onSuccess?.(data.conversation);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    assignConversation: useCallback((conversationId: string, userId: string | null) => 
      mutation.mutate({ conversationId, userId }), [mutation.mutate]),
    isAssigning: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para deletar uma conversa
 */
export function useDeleteConversation(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<void, string>(
    (id) => api.delete(`/api/chat/conversations/${id}`),
    {
      onSuccess: () => options?.onSuccess?.(),
      onError: options?.onError,
    }
  );

  return {
    deleteConversation: mutation.mutate,
    isDeleting: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================================================
// HOOKS DE MUTATION - MENSAGENS
// ============================================================================

/**
 * Hook para enviar uma mensagem
 */
export function useSendMessage(options?: {
  onSuccess?: (message: Message) => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<MessageResponse, { conversationId: string; data: SendMessageData }>(
    ({ conversationId, data }) => api.post(`/api/chat/conversations/${conversationId}/messages`, data),
    {
      onSuccess: (data) => {
        if (data?.message) {
          options?.onSuccess?.(data.message);
        }
      },
      onError: options?.onError,
    }
  );

  return {
    sendMessage: useCallback((conversationId: string, data: SendMessageData) => 
      mutation.mutate({ conversationId, data }), [mutation.mutate]),
    isSending: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook para marcar mensagens como lidas
 */
export function useMarkMessagesAsRead(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) {
  const mutation = useMutation<void, string>(
    (conversationId) => api.post(`/api/chat/conversations/${conversationId}/read`),
    {
      onSuccess: () => options?.onSuccess?.(),
      onError: options?.onError,
    }
  );

  return {
    markAsRead: mutation.mutate,
    isMarking: mutation.isLoading,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================================================
// HOOK COMBINADO PARA CHAT
// ============================================================================

/**
 * Hook combinado para gerenciar um chat completo
 */
export function useChatRoom(conversationId: string | undefined) {
  const { conversation, isLoading: isLoadingConversation, refetch: refetchConversation } = useConversation(conversationId);
  const { messages, isLoading: isLoadingMessages, refetch: refetchMessages, hasMore } = useMessages(conversationId);
  const { sendMessage, isSending } = useSendMessage({
    onSuccess: () => {
      refetchMessages();
    },
  });
  const { markAsRead } = useMarkMessagesAsRead();
  const { updateConversation, isUpdating } = useUpdateConversation();
  const { closeConversation, isClosing } = useCloseConversation();

  // Marcar como lido ao abrir
  useEffect(() => {
    if (conversationId && conversation?.unreadCount && conversation.unreadCount > 0) {
      markAsRead(conversationId);
    }
  }, [conversationId, conversation?.unreadCount]);

  return {
    // Dados
    conversation,
    messages,
    hasMore,
    
    // Loading states
    isLoading: isLoadingConversation || isLoadingMessages,
    isSending,
    isUpdating,
    isClosing,
    
    // Actions
    sendMessage: useCallback((data: SendMessageData) => {
      if (conversationId) {
        sendMessage(conversationId, data);
      }
    }, [conversationId, sendMessage]),
    
    updateStatus: useCallback((status: ConversationStatus) => {
      if (conversationId) {
        updateConversation(conversationId, { status });
      }
    }, [conversationId, updateConversation]),
    
    assignTo: useCallback((userId: string | null) => {
      if (conversationId) {
        updateConversation(conversationId, { assignedUserId: userId });
      }
    }, [conversationId, updateConversation]),
    
    close: useCallback(() => {
      if (conversationId) {
        closeConversation(conversationId);
      }
    }, [conversationId, closeConversation]),
    
    refresh: useCallback(() => {
      refetchConversation();
      refetchMessages();
    }, [refetchConversation, refetchMessages]),
  };
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default useConversations;
