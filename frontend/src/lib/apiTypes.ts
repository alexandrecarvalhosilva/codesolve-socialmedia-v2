/**
 * Tipos de resposta da API do Backend
 * 
 * Este arquivo contém as interfaces que representam os dados
 * retornados pelo backend, mapeados para uso no frontend.
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// TENANTS
// ============================================================================

export type TenantStatus = 'active' | 'suspended' | 'trial' | 'canceled';
export type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  logo?: string;
  status: TenantStatus;
  planId?: string;
  planName?: string;
  billingCycle: BillingCycle;
  trialEndsAt?: string;
  timezone: string;
  language: string;
  niche?: string;
  createdAt: string;
  updatedAt: string;
  // Contagens
  usersCount?: number;
  whatsappInstancesCount?: number;
  conversationsCount?: number;
}

export interface CreateTenantData {
  name: string;
  slug: string;
  domain?: string;
  planId?: string;
  billingCycle?: BillingCycle;
  niche?: string;
  // Dados do admin inicial
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface UpdateTenantData {
  name?: string;
  domain?: string;
  logo?: string;
  timezone?: string;
  language?: string;
  niche?: string;
}

// ============================================================================
// USERS
// ============================================================================

export type UserRole = 'superadmin' | 'admin' | 'operador' | 'visualizador';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  tenantId?: string;
  tenantName?: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
  tenantId?: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
}

// ============================================================================
// WHATSAPP
// ============================================================================

export type WhatsappInstanceStatus = 'disconnected' | 'connecting' | 'connected' | 'qr_code';

export interface WhatsappInstance {
  id: string;
  name: string;
  evolutionInstanceId?: string;
  phoneNumber?: string;
  status: WhatsappInstanceStatus;
  qrCode?: string;
  tenantId: string;
  tenantName?: string;
  conversationsCount?: number;
  connectedAt?: string;
  disconnectedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateWhatsappInstanceData {
  name: string;
}

// ============================================================================
// CHAT / CONVERSATIONS
// ============================================================================

export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type ConversationChannel = 'whatsapp' | 'instagram' | 'webchat' | 'email';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'document' | 'location' | 'sticker';

export interface Conversation {
  id: string;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAvatar?: string;
  channel: ConversationChannel;
  status: ConversationStatus;
  assignedUserId?: string;
  assignedUserName?: string;
  tenantId: string;
  whatsappInstanceId?: string;
  lastMessageAt?: string;
  lastMessagePreview?: string;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: MessageType;
  direction: MessageDirection;
  senderId?: string;
  senderName?: string;
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface SendMessageData {
  content: string;
  type?: MessageType;
  mediaUrl?: string;
}

// ============================================================================
// BILLING
// ============================================================================

export interface BillingPlan {
  id: string;
  slug: string;
  name: string;
  description?: string;
  maxWhatsappInstances: number;
  maxUsers: number;
  maxConversationsPerMonth: number;
  maxMessagesPerMonth: number;
  maxAutomations: number;
  hasAI: boolean;
  hasAdvancedReports: boolean;
  hasAPIAccess: boolean;
  hasPrioritySupport: boolean;
  priceMonthly: number;
  priceQuarterly: number;
  priceSemiannual: number;
  priceAnnual: number;
  isActive: boolean;
  createdAt: string;
}

export interface BillingModule {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  isActive: boolean;
}

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trial';

export interface Subscription {
  id: string;
  tenantId: string;
  tenantName?: string;
  planId: string;
  planName?: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt?: string;
  createdAt: string;
}

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'canceled';

export interface Invoice {
  id: string;
  tenantId: string;
  tenantName?: string;
  subscriptionId?: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  paidAt?: string;
  invoiceUrl?: string;
  createdAt: string;
}

// ============================================================================
// AUTOMATIONS
// ============================================================================

export type AutomationTrigger = 'message_received' | 'keyword' | 'schedule' | 'webhook' | 'conversation_opened' | 'conversation_closed';
export type AutomationStatus = 'active' | 'inactive' | 'draft';

export interface Automation {
  id: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: Record<string, unknown>;
  actions: Record<string, unknown>[];
  status: AutomationStatus;
  tenantId: string;
  createdById: string;
  createdByName?: string;
  executionCount: number;
  lastExecutedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutomationData {
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions?: Record<string, unknown>;
  actions: Record<string, unknown>[];
}

export interface UpdateAutomationData {
  name?: string;
  description?: string;
  trigger?: AutomationTrigger;
  conditions?: Record<string, unknown>;
  actions?: Record<string, unknown>[];
  status?: AutomationStatus;
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationCategory = 'system' | 'chat' | 'billing' | 'support' | 'automation';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  category: NotificationCategory;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  userId: string;
  tenantId?: string;
  createdAt: string;
}

// ============================================================================
// SUPPORT / TICKETS
// ============================================================================

export type TicketStatus = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'technical' | 'billing' | 'feature_request' | 'bug' | 'other';

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  createdById: string;
  createdByName?: string;
  assignedToId?: string;
  assignedToName?: string;
  tenantId?: string;
  tenantName?: string;
  messagesCount: number;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  content: string;
  isInternal: boolean;
  createdById: string;
  createdByName?: string;
  createdByRole?: UserRole;
  createdAt: string;
}

export interface CreateTicketData {
  subject: string;
  description: string;
  priority?: TicketPriority;
  category: TicketCategory;
}

export interface CreateTicketMessageData {
  content: string;
  isInternal?: boolean;
}

// ============================================================================
// REPORTS
// ============================================================================

export interface DashboardStats {
  totalConversations: number;
  conversationsChange: number;
  totalMessages: number;
  messagesChange: number;
  activeUsers: number;
  usersChange: number;
  avgResponseTime: number;
  responseTimeChange: number;
}

export interface ConversationReport {
  date: string;
  total: number;
  resolved: number;
  pending: number;
}

export interface UsageReport {
  resourceType: string;
  usageCount: number;
  limit: number;
  percentage: number;
}

// ============================================================================
// LOGS / AUDIT
// ============================================================================

export type AuditAction = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'export' | 'import';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  tenantId?: string;
  tenantName?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  createdAt: string;
}
