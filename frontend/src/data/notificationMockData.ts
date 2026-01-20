import { Notification, NotificationRole, NotificationOrigin } from '@/types/notification';

// Mock notifications data based on user roles
export const mockNotifications: Notification[] = [
  // Critical - SLA Breach (visible to superadmin, admin)
  {
    id: 'notif-1',
    type: 'sla_breach',
    origin: 'support',
    priority: 'critical',
    title: 'SLA Violado - Ticket #1234',
    message: 'Tempo de resposta excedido em 2h. Cliente: Test Tenant Contacts 2',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    linkTo: '/support',
    visibleTo: ['superadmin', 'admin'],
    entityId: 'ticket-1234',
    entityType: 'ticket',
    tenantId: '1',
    tenantName: 'Test Tenant Contacts 2',
  },
  {
    id: 'notif-2',
    type: 'payment_overdue',
    origin: 'billing',
    priority: 'critical',
    title: 'Pagamento Atrasado',
    message: 'Fatura #INV-2025-003 vencida há 5 dias. Tenant: Other RAG Tenant',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    linkTo: '/billing/invoices',
    visibleTo: ['superadmin'],
    entityId: 'inv-003',
    entityType: 'invoice',
    tenantId: '2',
    tenantName: 'Other RAG Tenant',
  },
  {
    id: 'notif-3',
    type: 'ticket_urgent',
    origin: 'support',
    priority: 'warning',
    title: 'Ticket Crítico Aberto',
    message: 'Problema de integração com API. Aguardando resposta há 45min.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    read: false,
    linkTo: '/support',
    visibleTo: ['superadmin', 'admin', 'operador'],
    entityId: 'ticket-1235',
    entityType: 'ticket',
    tenantId: '3',
    tenantName: 'Test Tenant Contacts 1',
  },
  {
    id: 'notif-4',
    type: 'chat_unread',
    origin: 'chat',
    priority: 'info',
    title: '5 mensagens não lidas',
    message: 'Canal WhatsApp - Cliente aguardando resposta',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    linkTo: '/tenant/chat',
    visibleTo: ['admin', 'operador'],
    entityId: 'chat-001',
    entityType: 'chat',
    tenantId: '1',
    tenantName: 'Test Tenant Contacts 2',
  },
  {
    id: 'notif-5',
    type: 'tenant_new',
    origin: 'system',
    priority: 'info',
    title: 'Novo Tenant Cadastrado',
    message: 'Empresa XYZ criou uma conta. Aguardando ativação.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    linkTo: '/tenants/11',
    visibleTo: ['superadmin'],
    entityId: '11',
    entityType: 'tenant',
  },
  {
    id: 'notif-6',
    type: 'sla_breach',
    origin: 'support',
    priority: 'critical',
    title: 'SLA Crítico - Resolução',
    message: 'Prazo de resolução expira em 30 minutos. Ticket #1240.',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    read: false,
    linkTo: '/support',
    visibleTo: ['superadmin', 'admin'],
    entityId: 'ticket-1240',
    entityType: 'ticket',
    tenantId: '5',
    tenantName: 'Test RAG Tenant',
  },
  {
    id: 'notif-7',
    type: 'ticket_new',
    origin: 'support',
    priority: 'info',
    title: 'Novo Ticket Recebido',
    message: 'Dúvida sobre configuração de automação.',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    read: true,
    linkTo: '/tenant/support',
    visibleTo: ['admin', 'operador'],
    entityId: 'ticket-1241',
    entityType: 'ticket',
    tenantId: '1',
    tenantName: 'Test Tenant Contacts 2',
  },
  {
    id: 'notif-8',
    type: 'system_alert',
    origin: 'system',
    priority: 'warning',
    title: 'Manutenção Programada',
    message: 'Sistema entrará em manutenção às 02:00. Duração: 30min.',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: false,
    linkTo: undefined,
    visibleTo: ['superadmin', 'admin', 'operador', 'visualizador'],
  },
  {
    id: 'notif-9',
    type: 'integration_offline',
    origin: 'integration',
    priority: 'critical',
    title: 'WhatsApp Desconectado',
    message: 'Instância perdeu conexão há 30 minutos.',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    read: false,
    linkTo: '/tenant/config',
    visibleTo: ['superadmin', 'admin'],
    entityId: 'whatsapp-1',
    entityType: 'integration',
    tenantId: '1',
    tenantName: 'Test Tenant Contacts 2',
  },
  {
    id: 'notif-10',
    type: 'automation_failed',
    origin: 'automation',
    priority: 'warning',
    title: 'Automação Falhou',
    message: 'Fluxo "Boas-vindas" parou por erro de template.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    linkTo: '/tenant/automations',
    visibleTo: ['superadmin', 'admin', 'operador'],
    entityId: 'auto-123',
    entityType: 'automation',
    tenantId: '3',
    tenantName: 'Test Tenant Contacts 1',
  },
];

// Helper to get notifications for a specific role
export const getNotificationsForRole = (role: string, tenantId?: string): Notification[] => {
  return mockNotifications.filter(n => {
    if (!n.visibleTo.includes(role as NotificationRole)) return false;
    if (role === 'superadmin') return true;
    if (tenantId && n.tenantId && n.tenantId !== tenantId) return false;
    return true;
  });
};

// Helper to get unread count for a role
export const getUnreadCountForRole = (role: string): number => {
  return mockNotifications.filter(n => n.visibleTo.includes(role as NotificationRole) && !n.read).length;
};

// Helper to get critical notifications for a role
export const getCriticalNotificationsForRole = (role: string): Notification[] => {
  return mockNotifications.filter(
    n => n.visibleTo.includes(role as NotificationRole) && n.priority === 'critical' && !n.read
  );
};
