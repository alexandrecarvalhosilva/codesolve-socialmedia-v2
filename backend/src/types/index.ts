import { User, Tenant, UserRole } from '@prisma/client';

// ============================================================================
// AUTH TYPES
// ============================================================================

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  tenantId: string | null;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string | null;
  tenant?: Tenant | null;
  permissions: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company: string;
  niche?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string | null;
    tenantName: string | null;
    avatar: string | null;
    isTrial: boolean;
    trialEndsAt: string | null;
  };
  token: string;
  expiresAt: string;
}

// ============================================================================
// PERMISSION TYPES
// ============================================================================

export type Permission = string;

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  superadmin: [
    'system:full', 'system:settings',
    'tenants:view', 'tenants:create', 'tenants:edit', 'tenants:delete',
    'users:view', 'users:create', 'users:edit', 'users:delete', 'users:invite',
    'roles:view', 'roles:create', 'roles:edit', 'roles:delete',
    'chat:view', 'chat:manage', 'chat:delete',
    'reports:view', 'reports:create', 'reports:export',
    'logs:view', 'logs:delete', 'logs:export',
    'calendar:view', 'calendar:manage',
    'templates:view', 'templates:create', 'templates:edit', 'templates:delete', 'templates:assign',
    'ai:view_consumption', 'ai:configure', 'ai:manage_limits',
    'notifications:view', 'notifications:manage', 'notifications:mute',
    'profile:view', 'profile:edit',
    'automations:view', 'automations:create', 'automations:edit', 'automations:delete', 'automations:toggle',
    'support:view', 'support:create', 'support:manage',
    'support:view_all', 'support:assign', 'support:manage_slas', 'support:respond', 'support:escalate',
    'billing:view', 'billing:manage_plan', 'billing:manage_modules', 'billing:view_invoices', 'billing:make_payment', 'billing:manage_payment_methods',
    'finance:view_dashboard', 'finance:view_all_subscriptions', 'finance:manage_plans', 'finance:manage_modules',
    'finance:view_all_invoices', 'finance:create_invoice', 'finance:manage_coupons', 'finance:apply_discounts',
    'finance:block_tenant', 'finance:reports',
    'onboarding:manage', 'onboarding:skip',
    'whatsapp:instances:view', 'whatsapp:instances:create', 'whatsapp:instances:delete', 'whatsapp:qrcode:generate',
    'instagram:view', 'instagram:manage', 'instagram:posts', 'instagram:dms',
  ],
  admin: [
    'profile:view', 'profile:edit',
    'notifications:view', 'notifications:manage', 'notifications:mute',
    'users:view', 'users:create', 'users:edit', 'users:delete', 'users:invite',
    'roles:view', 'roles:create', 'roles:edit', 'roles:delete',
    'chat:view', 'chat:manage', 'chat:delete',
    'calendar:view', 'calendar:manage',
    'automations:view', 'automations:create', 'automations:edit', 'automations:delete', 'automations:toggle',
    'ai:view_consumption', 'ai:configure', 'ai:manage_limits',
    'reports:view', 'reports:create', 'reports:export',
    'logs:view', 'logs:export',
    'support:view', 'support:create', 'support:manage',
    'billing:view', 'billing:manage_plan', 'billing:manage_modules',
    'billing:view_invoices', 'billing:make_payment', 'billing:manage_payment_methods',
    'whatsapp:instances:view', 'whatsapp:instances:create', 'whatsapp:instances:delete', 'whatsapp:qrcode:generate',
    'instagram:view', 'instagram:manage', 'instagram:posts', 'instagram:dms',
  ],
  operador: [
    'profile:view', 'profile:edit',
    'notifications:view', 'notifications:manage',
    'chat:view', 'chat:manage',
    'calendar:view', 'calendar:manage',
    'reports:view',
    'support:view', 'support:create',
    'whatsapp:instances:view',
    'instagram:view', 'instagram:dms',
  ],
  visualizador: [
    'profile:view',
    'notifications:view',
    'chat:view',
    'reports:view',
    'calendar:view',
    'support:view',
    'whatsapp:instances:view',
    'instagram:view',
  ],
};

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// BILLING TYPES
// ============================================================================

export interface PlanLimits {
  maxWhatsappInstances: number;
  maxMessagesPerMonth: number;
  maxUsers: number;
  maxAiTokensPerMonth: number;
  maxActiveAutomations: number;
  maxStorageBytes: bigint;
}

export interface UsageInfo {
  messagesUsed: number;
  messagesLimit: number;
  usersUsed: number;
  usersLimit: number;
  instancesUsed: number;
  instancesLimit: number;
  aiTokensUsed: number;
  aiTokensLimit: number;
  storageUsed: number;
  storageLimit: number;
}

// ============================================================================
// WEBSOCKET TYPES
// ============================================================================

export interface WebSocketMessage {
  type: string;
  payload: any;
  tenantId?: string;
  userId?: string;
  timestamp: string;
}

export type WebSocketEventType = 
  | 'message:new'
  | 'message:status'
  | 'conversation:new'
  | 'conversation:updated'
  | 'whatsapp:status'
  | 'whatsapp:qrcode'
  | 'notification:new'
  | 'typing:start'
  | 'typing:stop';

// ============================================================================
// QUEUE TYPES
// ============================================================================

export interface QueueJob<T = any> {
  id: string;
  name: string;
  data: T;
  attempts: number;
  timestamp: number;
}

export interface WhatsAppOutboundJob {
  tenantId: string;
  instanceId: string;
  conversationId: string;
  content: string;
  type: 'text' | 'image' | 'audio' | 'video' | 'document';
  mediaUrl?: string;
}

export interface WhatsAppInboundJob {
  tenantId: string;
  instanceId: string;
  evolutionPayload: any;
}

export interface EmailJob {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export interface AutomationExecuteJob {
  tenantId: string;
  automationId: string;
  triggerEvent: any;
}
