// Support Ticket Types

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed' | 'escalated';
export type TicketCategory = 'technical' | 'billing' | 'integration' | 'general' | 'ai' | 'automation' | 'chat' | 'account';

export interface SLALevel {
  id: string;
  name: string;
  description: string;
  responseTime: number; // in hours
  resolutionTime: number; // in hours
  color: string;
  price?: number; // monthly price for the module
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: 'customer' | 'support';
  content: string;
  createdAt: Date;
  attachments?: string[];
}

export interface Ticket {
  id: string;
  tenantId: string;
  tenantName: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  slaLevel: string;
  createdBy: string;
  createdByName: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt: Date;
  updatedAt: Date;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  escalatedAt?: Date;
  escalatedTo?: string;
  messages: TicketMessage[];
  slaBreached: boolean;
  tags?: string[];
}

export const priorityConfig: Record<TicketPriority, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Baixa', color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
  medium: { label: 'Média', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  high: { label: 'Alta', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  critical: { label: 'Crítica', color: 'text-red-400', bgColor: 'bg-red-500/20' },
};

export const statusConfig: Record<TicketStatus, { label: string; color: string; bgColor: string }> = {
  open: { label: 'Aberto', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
  in_progress: { label: 'Em Andamento', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' },
  waiting_customer: { label: 'Aguard. Cliente', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
  escalated: { label: 'Escalado', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
  resolved: { label: 'Resolvido', color: 'text-green-400', bgColor: 'bg-green-500/20' },
  closed: { label: 'Fechado', color: 'text-slate-400', bgColor: 'bg-slate-500/20' },
};

export const categoryConfig: Record<TicketCategory, { label: string; icon: string }> = {
  technical: { label: 'Técnico', icon: 'Wrench' },
  billing: { label: 'Financeiro', icon: 'CreditCard' },
  integration: { label: 'Integrações', icon: 'Plug' },
  general: { label: 'Dúvidas Gerais', icon: 'HelpCircle' },
  ai: { label: 'IA / Assistente', icon: 'Brain' },
  automation: { label: 'Automações', icon: 'Zap' },
  chat: { label: 'Chat / WhatsApp', icon: 'MessageSquare' },
  account: { label: 'Conta / Acesso', icon: 'User' },
};
