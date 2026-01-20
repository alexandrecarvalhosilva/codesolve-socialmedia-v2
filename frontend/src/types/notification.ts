// Notification Types - Extended with origins and role-based weights

export type NotificationOrigin = 'chat' | 'event' | 'automation' | 'billing' | 'integration' | 'support' | 'system' | 'security' | 'user' | 'ai';
export type NotificationType = 
  | 'sla_breach' 
  | 'ticket_new' 
  | 'ticket_urgent'
  | 'ticket_resolved'
  | 'ticket_response'
  | 'payment_overdue' 
  | 'payment_failed'
  | 'payment_success'
  | 'chat_unread' 
  | 'chat_unanswered'
  | 'tenant_new'
  | 'tenant_blocked'
  | 'tenant_activated'
  | 'system_alert'
  | 'system_maintenance'
  | 'backup_completed'
  | 'automation_failed'
  | 'automation_success'
  | 'event_reminder'
  | 'event_cancelled'
  | 'event_created'
  | 'integration_offline'
  | 'integration_error'
  | 'integration_connected'
  | 'subscription_expiring'
  | 'plan_upgraded'
  | 'plan_downgraded'
  | 'module_limit_reached'
  | 'module_added'
  | 'module_removed'
  | 'user_created'
  | 'user_deleted'
  | 'user_role_changed'
  | 'user_invite_sent'
  | 'user_invite_accepted'
  | 'security_login'
  | 'security_password_reset'
  | 'security_suspicious_activity'
  | 'ai_limit_reached'
  | 'ai_config_changed'
  | 'template_updated'
  | 'template_assigned';

export type NotificationPriority = 'critical' | 'warning' | 'info';
export type NotificationRole = 'superadmin' | 'admin' | 'operador' | 'visualizador';

export interface Notification {
  id: string;
  type: NotificationType;
  origin: NotificationOrigin;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  resolved?: boolean;
  // Link for navigation
  linkTo?: string;
  // Which roles can see this notification
  visibleTo: NotificationRole[];
  // Associated entity (tenant, ticket, etc.)
  entityId?: string;
  entityType?: 'tenant' | 'ticket' | 'invoice' | 'chat' | 'automation' | 'event' | 'integration' | 'user' | 'template';
  // For tenant-specific notifications
  tenantId?: string;
  tenantName?: string;
}

// Weight matrix: defines priority per role for each notification type
// Higher weight = higher priority for that role
export const notificationWeightMatrix: Record<NotificationType, Record<NotificationRole, NotificationPriority | null>> = {
  // Support
  sla_breach: { superadmin: 'critical', admin: 'critical', operador: 'warning', visualizador: null },
  ticket_new: { superadmin: 'info', admin: 'warning', operador: 'warning', visualizador: null },
  ticket_urgent: { superadmin: 'warning', admin: 'critical', operador: 'critical', visualizador: null },
  ticket_resolved: { superadmin: 'info', admin: 'info', operador: 'info', visualizador: null },
  ticket_response: { superadmin: null, admin: 'info', operador: 'warning', visualizador: null },
  
  // Billing
  payment_overdue: { superadmin: 'critical', admin: 'critical', operador: 'info', visualizador: null },
  payment_failed: { superadmin: 'critical', admin: 'critical', operador: null, visualizador: null },
  payment_success: { superadmin: 'info', admin: 'info', operador: null, visualizador: null },
  subscription_expiring: { superadmin: 'warning', admin: 'critical', operador: null, visualizador: null },
  plan_upgraded: { superadmin: 'info', admin: 'info', operador: null, visualizador: null },
  plan_downgraded: { superadmin: 'warning', admin: 'warning', operador: null, visualizador: null },
  module_limit_reached: { superadmin: 'info', admin: 'warning', operador: 'info', visualizador: null },
  module_added: { superadmin: 'info', admin: 'info', operador: null, visualizador: null },
  module_removed: { superadmin: 'info', admin: 'warning', operador: null, visualizador: null },
  
  // Chat
  chat_unread: { superadmin: 'info', admin: 'warning', operador: 'critical', visualizador: 'info' },
  chat_unanswered: { superadmin: 'warning', admin: 'critical', operador: 'critical', visualizador: null },
  
  // Automation
  automation_failed: { superadmin: 'warning', admin: 'critical', operador: 'warning', visualizador: null },
  automation_success: { superadmin: null, admin: 'info', operador: 'info', visualizador: null },
  
  // Events
  event_reminder: { superadmin: null, admin: 'info', operador: 'warning', visualizador: 'info' },
  event_cancelled: { superadmin: null, admin: 'warning', operador: 'warning', visualizador: 'info' },
  event_created: { superadmin: null, admin: 'info', operador: 'info', visualizador: 'info' },
  
  // Integrations
  integration_offline: { superadmin: 'critical', admin: 'critical', operador: null, visualizador: null },
  integration_error: { superadmin: 'warning', admin: 'warning', operador: null, visualizador: null },
  integration_connected: { superadmin: 'info', admin: 'info', operador: null, visualizador: null },
  
  // Tenant
  tenant_new: { superadmin: 'info', admin: null, operador: null, visualizador: null },
  tenant_blocked: { superadmin: 'warning', admin: 'critical', operador: null, visualizador: null },
  tenant_activated: { superadmin: 'info', admin: 'info', operador: null, visualizador: null },
  
  // System
  system_alert: { superadmin: 'warning', admin: 'warning', operador: 'info', visualizador: 'info' },
  system_maintenance: { superadmin: 'warning', admin: 'warning', operador: 'info', visualizador: 'info' },
  backup_completed: { superadmin: 'info', admin: null, operador: null, visualizador: null },
  
  // User Management
  user_created: { superadmin: 'info', admin: 'info', operador: null, visualizador: null },
  user_deleted: { superadmin: 'warning', admin: 'warning', operador: null, visualizador: null },
  user_role_changed: { superadmin: 'info', admin: 'info', operador: null, visualizador: null },
  user_invite_sent: { superadmin: null, admin: 'info', operador: null, visualizador: null },
  user_invite_accepted: { superadmin: null, admin: 'info', operador: null, visualizador: null },
  
  // Security
  security_login: { superadmin: 'info', admin: 'info', operador: null, visualizador: null },
  security_password_reset: { superadmin: 'warning', admin: 'warning', operador: null, visualizador: null },
  security_suspicious_activity: { superadmin: 'critical', admin: 'critical', operador: null, visualizador: null },
  
  // AI
  ai_limit_reached: { superadmin: 'warning', admin: 'critical', operador: 'warning', visualizador: null },
  ai_config_changed: { superadmin: 'info', admin: 'info', operador: null, visualizador: null },
  
  // Templates
  template_updated: { superadmin: 'info', admin: 'info', operador: null, visualizador: null },
  template_assigned: { superadmin: 'info', admin: 'info', operador: null, visualizador: null },
};

export const notificationOriginConfig: Record<NotificationOrigin, { 
  label: string; 
  icon: string;
  color: string;
}> = {
  chat: { label: 'Chat', icon: 'MessageSquare', color: 'text-blue-400' },
  event: { label: 'Eventos', icon: 'Calendar', color: 'text-purple-400' },
  automation: { label: 'Automações', icon: 'Zap', color: 'text-yellow-400' },
  billing: { label: 'Cobrança', icon: 'CreditCard', color: 'text-green-400' },
  integration: { label: 'Integrações', icon: 'Plug', color: 'text-orange-400' },
  support: { label: 'Suporte', icon: 'Headphones', color: 'text-pink-400' },
  system: { label: 'Sistema', icon: 'Bell', color: 'text-gray-400' },
  security: { label: 'Segurança', icon: 'Shield', color: 'text-red-400' },
  user: { label: 'Usuários', icon: 'Users', color: 'text-cyan-400' },
  ai: { label: 'IA', icon: 'Brain', color: 'text-violet-400' },
};

export const notificationTypeConfig: Record<NotificationType, { 
  label: string; 
  icon: string;
  origin: NotificationOrigin;
}> = {
  sla_breach: { label: 'SLA Violado', icon: 'AlertTriangle', origin: 'support' },
  ticket_new: { label: 'Novo Ticket', icon: 'Ticket', origin: 'support' },
  ticket_urgent: { label: 'Ticket Urgente', icon: 'AlertCircle', origin: 'support' },
  ticket_resolved: { label: 'Ticket Resolvido', icon: 'CheckCircle', origin: 'support' },
  ticket_response: { label: 'Resposta ao Ticket', icon: 'MessageCircle', origin: 'support' },
  payment_overdue: { label: 'Pagamento Atrasado', icon: 'CreditCard', origin: 'billing' },
  payment_failed: { label: 'Pagamento Falhou', icon: 'XCircle', origin: 'billing' },
  payment_success: { label: 'Pagamento Confirmado', icon: 'CheckCircle', origin: 'billing' },
  subscription_expiring: { label: 'Assinatura Expirando', icon: 'Clock', origin: 'billing' },
  plan_upgraded: { label: 'Plano Atualizado', icon: 'TrendingUp', origin: 'billing' },
  plan_downgraded: { label: 'Plano Rebaixado', icon: 'TrendingDown', origin: 'billing' },
  module_limit_reached: { label: 'Limite de Módulo', icon: 'Package', origin: 'billing' },
  module_added: { label: 'Módulo Adicionado', icon: 'Plus', origin: 'billing' },
  module_removed: { label: 'Módulo Removido', icon: 'Minus', origin: 'billing' },
  chat_unread: { label: 'Chat Não Lido', icon: 'MessageSquare', origin: 'chat' },
  chat_unanswered: { label: 'Chat Sem Resposta', icon: 'MessageCircle', origin: 'chat' },
  automation_failed: { label: 'Automação Falhou', icon: 'XOctagon', origin: 'automation' },
  automation_success: { label: 'Automação OK', icon: 'CheckCircle', origin: 'automation' },
  event_reminder: { label: 'Lembrete de Evento', icon: 'Calendar', origin: 'event' },
  event_cancelled: { label: 'Evento Cancelado', icon: 'CalendarX', origin: 'event' },
  event_created: { label: 'Evento Criado', icon: 'CalendarPlus', origin: 'event' },
  integration_offline: { label: 'Integração Offline', icon: 'WifiOff', origin: 'integration' },
  integration_error: { label: 'Erro de Integração', icon: 'AlertOctagon', origin: 'integration' },
  integration_connected: { label: 'Integração Conectada', icon: 'Plug', origin: 'integration' },
  tenant_new: { label: 'Novo Tenant', icon: 'Building2', origin: 'system' },
  tenant_blocked: { label: 'Tenant Bloqueado', icon: 'Ban', origin: 'system' },
  tenant_activated: { label: 'Tenant Ativado', icon: 'CheckCircle', origin: 'system' },
  system_alert: { label: 'Alerta do Sistema', icon: 'Bell', origin: 'system' },
  system_maintenance: { label: 'Manutenção Programada', icon: 'Wrench', origin: 'system' },
  backup_completed: { label: 'Backup Concluído', icon: 'HardDrive', origin: 'system' },
  user_created: { label: 'Usuário Criado', icon: 'UserPlus', origin: 'user' },
  user_deleted: { label: 'Usuário Removido', icon: 'UserMinus', origin: 'user' },
  user_role_changed: { label: 'Papel Alterado', icon: 'Shield', origin: 'user' },
  user_invite_sent: { label: 'Convite Enviado', icon: 'Mail', origin: 'user' },
  user_invite_accepted: { label: 'Convite Aceito', icon: 'UserCheck', origin: 'user' },
  security_login: { label: 'Login Detectado', icon: 'LogIn', origin: 'security' },
  security_password_reset: { label: 'Senha Redefinida', icon: 'KeyRound', origin: 'security' },
  security_suspicious_activity: { label: 'Atividade Suspeita', icon: 'AlertTriangle', origin: 'security' },
  ai_limit_reached: { label: 'Limite IA Atingido', icon: 'Brain', origin: 'ai' },
  ai_config_changed: { label: 'Config IA Alterada', icon: 'Settings', origin: 'ai' },
  template_updated: { label: 'Template Atualizado', icon: 'FileText', origin: 'system' },
  template_assigned: { label: 'Template Atribuído', icon: 'Link', origin: 'system' },
};

export const priorityConfig: Record<NotificationPriority, { 
  label: string;
  bg: string; 
  text: string; 
  border: string;
  weight: number;
}> = {
  critical: { label: 'Crítico', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50', weight: 3 },
  warning: { label: 'Atenção', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50', weight: 2 },
  info: { label: 'Info', bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50', weight: 1 },
};

// Helper to get priority for a notification based on user role
export function getPriorityForRole(type: NotificationType, role: NotificationRole): NotificationPriority | null {
  return notificationWeightMatrix[type]?.[role] ?? null;
}

// Helper to check if notification is visible to role
export function isVisibleToRole(notification: Notification, role: NotificationRole): boolean {
  return notification.visibleTo.includes(role);
}
