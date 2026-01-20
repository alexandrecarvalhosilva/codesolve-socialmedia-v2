import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Ticket, TicketMessage, PaginationMeta } from '@/lib/apiTypes';

// ============================================================================
// TICKETS LIST HOOK
// ============================================================================

interface UseTicketsOptions {
  status?: string;
  priority?: string;
  assignedToId?: string;
  page?: number;
  limit?: number;
}

interface UseTicketsReturn {
  tickets: Ticket[];
  isLoading: boolean;
  error: Error | null;
  meta: PaginationMeta | null;
  refetch: () => void;
}

export function useTickets(options: UseTicketsOptions = {}): UseTicketsReturn {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/support/tickets', {
        params: {
          status: options.status,
          priority: options.priority,
          assignedToId: options.assignedToId,
          page: options.page || 1,
          limit: options.limit || 20,
        },
      });
      if (response.data.success) {
        setTickets(response.data.data || []);
        setMeta(response.data.meta || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar tickets'));
    } finally {
      setIsLoading(false);
    }
  }, [options.status, options.priority, options.assignedToId, options.page, options.limit]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, isLoading, error, meta, refetch: fetchTickets };
}

// ============================================================================
// SINGLE TICKET HOOK
// ============================================================================

interface UseTicketReturn {
  ticket: Ticket | null;
  messages: TicketMessage[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTicket(ticketId: string | undefined): UseTicketReturn {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTicket = useCallback(async () => {
    if (!ticketId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Buscar ticket
      const ticketResponse = await api.get(`/support/tickets/${ticketId}`);
      if (ticketResponse.data.success) {
        setTicket(ticketResponse.data.data);
      }
      
      // Buscar mensagens do ticket
      const messagesResponse = await api.get(`/support/tickets/${ticketId}/messages`);
      if (messagesResponse.data.success) {
        setMessages(messagesResponse.data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar ticket'));
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  return { ticket, messages, isLoading, error, refetch: fetchTicket };
}

// ============================================================================
// CREATE TICKET HOOK
// ============================================================================

interface CreateTicketData {
  subject: string;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: string;
}

interface UseCreateTicketOptions {
  onSuccess?: (ticket: Ticket) => void;
  onError?: (error: Error) => void;
}

interface UseCreateTicketReturn {
  createTicket: (data: CreateTicketData) => Promise<Ticket | null>;
  isCreating: boolean;
}

export function useCreateTicket(options: UseCreateTicketOptions = {}): UseCreateTicketReturn {
  const [isCreating, setIsCreating] = useState(false);

  const createTicket = useCallback(async (data: CreateTicketData) => {
    try {
      setIsCreating(true);
      const response = await api.post('/support/tickets', data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar ticket');
      options.onError?.(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [options]);

  return { createTicket, isCreating };
}

// ============================================================================
// UPDATE TICKET HOOK
// ============================================================================

interface UpdateTicketData {
  status?: string;
  priority?: string;
  assignedToId?: string;
}

interface UseUpdateTicketOptions {
  onSuccess?: (ticket: Ticket) => void;
  onError?: (error: Error) => void;
}

interface UseUpdateTicketReturn {
  updateTicket: (id: string, data: UpdateTicketData) => Promise<Ticket | null>;
  isUpdating: boolean;
}

export function useUpdateTicket(options: UseUpdateTicketOptions = {}): UseUpdateTicketReturn {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTicket = useCallback(async (id: string, data: UpdateTicketData) => {
    try {
      setIsUpdating(true);
      const response = await api.patch(`/support/tickets/${id}`, data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar ticket');
      options.onError?.(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [options]);

  return { updateTicket, isUpdating };
}

// ============================================================================
// SEND MESSAGE HOOK
// ============================================================================

interface SendMessageData {
  content: string;
  isInternal?: boolean;
}

interface UseSendMessageOptions {
  onSuccess?: (message: TicketMessage) => void;
  onError?: (error: Error) => void;
}

interface UseSendMessageReturn {
  sendMessage: (ticketId: string, data: SendMessageData) => Promise<TicketMessage | null>;
  isSending: boolean;
}

export function useSendTicketMessage(options: UseSendMessageOptions = {}): UseSendMessageReturn {
  const [isSending, setIsSending] = useState(false);

  const sendMessage = useCallback(async (ticketId: string, data: SendMessageData) => {
    try {
      setIsSending(true);
      const response = await api.post(`/support/tickets/${ticketId}/messages`, data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao enviar mensagem');
      options.onError?.(error);
      throw error;
    } finally {
      setIsSending(false);
    }
  }, [options]);

  return { sendMessage, isSending };
}

// ============================================================================
// TICKET STATS HOOK
// ============================================================================

interface TicketStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  avgResponseTime: number;
  avgResolutionTime: number;
}

interface UseTicketStatsReturn {
  stats: TicketStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTicketStats(): UseTicketStatsReturn {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/support/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar estatísticas'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}
