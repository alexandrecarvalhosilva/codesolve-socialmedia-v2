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
  slaComplianceRate?: number;
}

interface UseTicketStatsReturn {
  stats: TicketStats | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTicketStats(period: string = '30d'): UseTicketStatsReturn & { fetchStats: () => void } {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/support/stats', { period });
      if (response.success && response.data) {
        // Map backend response to frontend format
        const data = response.data as any;
        setStats({
          total: data.summary?.totalTickets || 0,
          open: data.summary?.openTickets || 0,
          inProgress: data.byStatus?.find((s: any) => s.status === 'in_progress')?.count || 0,
          resolved: data.summary?.resolvedTickets || 0,
          closed: data.byStatus?.find((s: any) => s.status === 'closed')?.count || 0,
          avgResponseTime: 0,
          avgResolutionTime: data.summary?.avgResolutionMinutes || 0,
          slaComplianceRate: 95, // Default placeholder
        });
      }
    } catch (err) {
      // Fallback data
      setStats({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        avgResponseTime: 0,
        avgResolutionTime: 0,
        slaComplianceRate: 100,
      });
    } finally {
      setIsLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats, fetchStats };
}

// ============================================================================
// SLA TYPES
// ============================================================================

export interface SLA {
  id: string;
  name: string;
  description?: string;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isDefault: boolean;
  isActive: boolean;
  ticketsCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SLAs HOOK
// ============================================================================

interface UseSLAsReturn {
  slas: SLA[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSLAs(): UseSLAsReturn {
  const [slas, setSLAs] = useState<SLA[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSLAs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/support/slas');
      if (response.data.success) {
        setSLAs(response.data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar SLAs'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSLAs();
  }, [fetchSLAs]);

  return { slas, isLoading, error, refetch: fetchSLAs };
}

// ============================================================================
// CREATE SLA HOOK
// ============================================================================

interface CreateSLAData {
  name: string;
  description?: string;
  firstResponseMinutes: number;
  resolutionMinutes: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isDefault?: boolean;
}

interface UseCreateSLAOptions {
  onSuccess?: (sla: SLA) => void;
  onError?: (error: Error) => void;
}

interface UseCreateSLAReturn {
  createSLA: (data: CreateSLAData) => Promise<SLA | null>;
  isCreating: boolean;
}

export function useCreateSLA(options: UseCreateSLAOptions = {}): UseCreateSLAReturn {
  const [isCreating, setIsCreating] = useState(false);

  const createSLA = useCallback(async (data: CreateSLAData) => {
    try {
      setIsCreating(true);
      const response = await api.post('/support/slas', data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar SLA');
      options.onError?.(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [options]);

  return { createSLA, isCreating };
}

// ============================================================================
// UPDATE SLA HOOK
// ============================================================================

interface UseUpdateSLAOptions {
  onSuccess?: (sla: SLA) => void;
  onError?: (error: Error) => void;
}

interface UseUpdateSLAReturn {
  updateSLA: (id: string, data: Partial<SLA>) => Promise<SLA | null>;
  isUpdating: boolean;
}

export function useUpdateSLA(options: UseUpdateSLAOptions = {}): UseUpdateSLAReturn {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateSLA = useCallback(async (id: string, data: Partial<SLA>) => {
    try {
      setIsUpdating(true);
      const response = await api.put(`/support/slas/${id}`, data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar SLA');
      options.onError?.(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [options]);

  return { updateSLA, isUpdating };
}

// ============================================================================
// DELETE SLA HOOK
// ============================================================================

interface UseDeleteSLAOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseDeleteSLAReturn {
  deleteSLA: (id: string) => Promise<boolean>;
  isDeleting: boolean;
}

export function useDeleteSLA(options: UseDeleteSLAOptions = {}): UseDeleteSLAReturn {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteSLA = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await api.delete(`/support/slas/${id}`);
      if (response.data.success) {
        options.onSuccess?.();
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao remover SLA');
      options.onError?.(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [options]);

  return { deleteSLA, isDeleting };
}

// ============================================================================
// TICKET ACTIONS HOOK
// ============================================================================

interface UseTicketActionsOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseTicketActionsReturn {
  assignTicket: (ticketId: string, assignToId: string | null) => Promise<boolean>;
  closeTicket: (ticketId: string) => Promise<boolean>;
  reopenTicket: (ticketId: string) => Promise<boolean>;
  updateStatus: (ticketId: string, status: string) => Promise<boolean>;
  updatePriority: (ticketId: string, priority: string) => Promise<boolean>;
  isProcessing: boolean;
}

export function useTicketActions(options: UseTicketActionsOptions = {}): UseTicketActionsReturn {
  const [isProcessing, setIsProcessing] = useState(false);

  const assignTicket = useCallback(async (ticketId: string, assignToId: string | null) => {
    try {
      setIsProcessing(true);
      const response = await api.post(`/support/tickets/${ticketId}/assign`, { assignToId });
      if (response.data.success) {
        options.onSuccess?.();
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atribuir ticket');
      options.onError?.(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  const closeTicket = useCallback(async (ticketId: string) => {
    try {
      setIsProcessing(true);
      const response = await api.post(`/support/tickets/${ticketId}/close`);
      if (response.data.success) {
        options.onSuccess?.();
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao fechar ticket');
      options.onError?.(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  const reopenTicket = useCallback(async (ticketId: string) => {
    try {
      setIsProcessing(true);
      const response = await api.post(`/support/tickets/${ticketId}/reopen`);
      if (response.data.success) {
        options.onSuccess?.();
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao reabrir ticket');
      options.onError?.(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  const updateStatus = useCallback(async (ticketId: string, status: string) => {
    try {
      setIsProcessing(true);
      const response = await api.put(`/support/tickets/${ticketId}/status`, { status });
      if (response.data.success) {
        options.onSuccess?.();
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar status');
      options.onError?.(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  const updatePriority = useCallback(async (ticketId: string, priority: string) => {
    try {
      setIsProcessing(true);
      const response = await api.put(`/support/tickets/${ticketId}/priority`, { priority });
      if (response.data.success) {
        options.onSuccess?.();
        return true;
      }
      return false;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar prioridade');
      options.onError?.(error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [options]);

  return {
    assignTicket,
    closeTicket,
    reopenTicket,
    updateStatus,
    updatePriority,
    isProcessing,
  };
}


// ============================================================================
// URGENT TICKETS HOOK (for SLA alerts)
// ============================================================================

interface UrgentTicket {
  id: string;
  title: string;
  tenantName: string;
  slaLevel: string;
  timeRemaining: number; // in minutes
  priority: 'high' | 'critical';
  type: 'response' | 'resolution';
  isNew?: boolean;
}

interface UseUrgentTicketsReturn {
  urgentTickets: UrgentTicket[];
  isLoading: boolean;
  error: Error | null;
  fetchUrgentTickets: () => Promise<void>;
}

export function useUrgentTickets(): UseUrgentTicketsReturn {
  const [urgentTickets, setUrgentTickets] = useState<UrgentTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUrgentTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/support/tickets/urgent');
      if (response.data.success) {
        setUrgentTickets(response.data.data || []);
      }
    } catch (err) {
      // Fallback to empty array if endpoint not available
      setUrgentTickets([]);
      setError(err instanceof Error ? err : new Error('Erro ao carregar tickets urgentes'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { urgentTickets, isLoading, error, fetchUrgentTickets };
}

