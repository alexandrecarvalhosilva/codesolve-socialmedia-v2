/**
 * Mock Email Notification Service
 * Simula o envio de notificações por email
 */

export type EmailNotificationType = 
  | 'credits_earned'
  | 'credits_expiring'
  | 'credits_expired'
  | 'plan_upgrade'
  | 'plan_downgrade'
  | 'payment_success'
  | 'payment_failed';

export interface EmailNotification {
  id: string;
  type: EmailNotificationType;
  tenantId: string;
  tenantName: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  body: string;
  data: Record<string, unknown>;
  status: 'pending' | 'sent' | 'failed';
  sentAt: string | null;
  createdAt: string;
}

export interface NotificationPreferences {
  creditsEarned: boolean;
  creditsExpiring: boolean;
  creditsExpiringDaysBefore: number;
  planChanges: boolean;
  paymentSuccess: boolean;
  paymentFailed: boolean;
}

// ============================================================================
// MOCK DATA
// ============================================================================
const mockNotifications: EmailNotification[] = [];
const defaultPreferences: NotificationPreferences = {
  creditsEarned: true,
  creditsExpiring: true,
  creditsExpiringDaysBefore: 7,
  planChanges: true,
  paymentSuccess: true,
  paymentFailed: true,
};

const tenantPreferences: Map<string, NotificationPreferences> = new Map();

// ============================================================================
// EMAIL TEMPLATES
// ============================================================================
const emailTemplates: Record<EmailNotificationType, { 
  subject: (data: Record<string, unknown>) => string;
  body: (data: Record<string, unknown>) => string;
}> = {
  credits_earned: {
    subject: (data) => `Você recebeu ${data.formattedAmount} em créditos!`,
    body: (data) => `
      Olá ${data.recipientName},

      Boas notícias! Você recebeu ${data.formattedAmount} em créditos na sua conta.

      Motivo: ${data.reason}

      Esses créditos serão aplicados automaticamente na sua próxima fatura.
      ${data.expiresAt ? `Válido até: ${data.expiresAt}` : ''}

      Atenciosamente,
      Equipe CodeSolve
    `,
  },
  credits_expiring: {
    subject: (data) => `Seus créditos expiram em ${data.daysRemaining} dias`,
    body: (data) => `
      Olá ${data.recipientName},

      Seus créditos no valor de ${data.formattedAmount} expirarão em ${data.daysRemaining} dias (${data.expiresAt}).

      Para não perder esses créditos, utilize-os antes da data de expiração.

      Atenciosamente,
      Equipe CodeSolve
    `,
  },
  credits_expired: {
    subject: () => `Seus créditos expiraram`,
    body: (data) => `
      Olá ${data.recipientName},

      Infelizmente, seus créditos no valor de ${data.formattedAmount} expiraram em ${data.expiredAt}.

      Se você tiver dúvidas, entre em contato com nosso suporte.

      Atenciosamente,
      Equipe CodeSolve
    `,
  },
  plan_upgrade: {
    subject: (data) => `Upgrade para ${data.newPlanName} confirmado!`,
    body: (data) => `
      Olá ${data.recipientName},

      Seu upgrade de ${data.oldPlanName} para ${data.newPlanName} foi realizado com sucesso!

      Valor cobrado: ${data.formattedAmount}
      Novos recursos já estão disponíveis na sua conta.

      Atenciosamente,
      Equipe CodeSolve
    `,
  },
  plan_downgrade: {
    subject: (data) => `Alteração para ${data.newPlanName} confirmada`,
    body: (data) => `
      Olá ${data.recipientName},

      Sua alteração de plano de ${data.oldPlanName} para ${data.newPlanName} foi processada.

      ${data.creditsGenerated ? `Crédito gerado: ${data.formattedCredits}` : ''}
      
      As mudanças entrarão em vigor imediatamente.

      Atenciosamente,
      Equipe CodeSolve
    `,
  },
  payment_success: {
    subject: (data) => `Pagamento confirmado - ${data.invoiceNumber}`,
    body: (data) => `
      Olá ${data.recipientName},

      Seu pagamento no valor de ${data.formattedAmount} foi confirmado.

      Fatura: ${data.invoiceNumber}
      Data: ${data.paymentDate}
      Método: ${data.paymentMethod}

      Atenciosamente,
      Equipe CodeSolve
    `,
  },
  payment_failed: {
    subject: () => `Problema com seu pagamento`,
    body: (data) => `
      Olá ${data.recipientName},

      Houve um problema ao processar seu pagamento no valor de ${data.formattedAmount}.

      Fatura: ${data.invoiceNumber}
      Erro: ${data.errorMessage}

      Por favor, atualize suas informações de pagamento para evitar interrupção do serviço.

      Atenciosamente,
      Equipe CodeSolve
    `,
  },
};

// ============================================================================
// NOTIFICATION FUNCTIONS
// ============================================================================

function generateId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function sendEmailNotification(
  type: EmailNotificationType,
  tenantId: string,
  tenantName: string,
  recipientEmail: string,
  recipientName: string,
  data: Record<string, unknown>
): Promise<EmailNotification> {
  // Simula delay de envio
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const template = emailTemplates[type];
  
  const notification: EmailNotification = {
    id: generateId(),
    type,
    tenantId,
    tenantName,
    recipientEmail,
    recipientName,
    subject: template.subject(data),
    body: template.body({ ...data, recipientName }),
    data,
    status: 'sent',
    sentAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  
  mockNotifications.unshift(notification);
  
  console.log(`[Mock Email] Sent ${type} to ${recipientEmail}:`, notification.subject);
  
  return notification;
}

export async function sendCreditsEarnedNotification(
  tenantId: string,
  tenantName: string,
  recipientEmail: string,
  recipientName: string,
  amount: number,
  reason: string,
  expiresAt?: string
): Promise<EmailNotification | null> {
  const prefs = getNotificationPreferences(tenantId);
  if (!prefs.creditsEarned) return null;
  
  return sendEmailNotification(
    'credits_earned',
    tenantId,
    tenantName,
    recipientEmail,
    recipientName,
    {
      amount,
      formattedAmount: formatCurrency(amount),
      reason,
      expiresAt: expiresAt ? new Date(expiresAt).toLocaleDateString('pt-BR') : null,
    }
  );
}

export async function sendCreditsExpiringNotification(
  tenantId: string,
  tenantName: string,
  recipientEmail: string,
  recipientName: string,
  amount: number,
  expiresAt: string,
  daysRemaining: number
): Promise<EmailNotification | null> {
  const prefs = getNotificationPreferences(tenantId);
  if (!prefs.creditsExpiring || daysRemaining > prefs.creditsExpiringDaysBefore) return null;
  
  return sendEmailNotification(
    'credits_expiring',
    tenantId,
    tenantName,
    recipientEmail,
    recipientName,
    {
      amount,
      formattedAmount: formatCurrency(amount),
      expiresAt: new Date(expiresAt).toLocaleDateString('pt-BR'),
      daysRemaining,
    }
  );
}

export async function sendPlanChangeNotification(
  tenantId: string,
  tenantName: string,
  recipientEmail: string,
  recipientName: string,
  isUpgrade: boolean,
  oldPlanName: string,
  newPlanName: string,
  amount: number,
  creditsGenerated?: number
): Promise<EmailNotification | null> {
  const prefs = getNotificationPreferences(tenantId);
  if (!prefs.planChanges) return null;
  
  return sendEmailNotification(
    isUpgrade ? 'plan_upgrade' : 'plan_downgrade',
    tenantId,
    tenantName,
    recipientEmail,
    recipientName,
    {
      oldPlanName,
      newPlanName,
      amount,
      formattedAmount: formatCurrency(amount),
      creditsGenerated,
      formattedCredits: creditsGenerated ? formatCurrency(creditsGenerated) : null,
    }
  );
}

export async function sendPaymentNotification(
  tenantId: string,
  tenantName: string,
  recipientEmail: string,
  recipientName: string,
  success: boolean,
  invoiceNumber: string,
  amount: number,
  paymentMethod?: string,
  errorMessage?: string
): Promise<EmailNotification | null> {
  const prefs = getNotificationPreferences(tenantId);
  
  if (success && !prefs.paymentSuccess) return null;
  if (!success && !prefs.paymentFailed) return null;
  
  return sendEmailNotification(
    success ? 'payment_success' : 'payment_failed',
    tenantId,
    tenantName,
    recipientEmail,
    recipientName,
    {
      invoiceNumber,
      amount,
      formattedAmount: formatCurrency(amount),
      paymentMethod,
      paymentDate: new Date().toLocaleDateString('pt-BR'),
      errorMessage,
    }
  );
}

// ============================================================================
// PREFERENCES
// ============================================================================

export function getNotificationPreferences(tenantId: string): NotificationPreferences {
  return tenantPreferences.get(tenantId) || { ...defaultPreferences };
}

export function updateNotificationPreferences(
  tenantId: string, 
  prefs: Partial<NotificationPreferences>
): NotificationPreferences {
  const current = getNotificationPreferences(tenantId);
  const updated = { ...current, ...prefs };
  tenantPreferences.set(tenantId, updated);
  return updated;
}

// ============================================================================
// HISTORY
// ============================================================================

export function getNotificationHistory(tenantId?: string): EmailNotification[] {
  if (tenantId) {
    return mockNotifications.filter(n => n.tenantId === tenantId);
  }
  return [...mockNotifications];
}

// ============================================================================
// HELPERS
// ============================================================================

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

// ============================================================================
// CRON JOB SIMULATION - Check expiring credits
// ============================================================================

export async function checkExpiringCredits(): Promise<void> {
  // This would be called by a cron job in production
  // TODO: Implement credit expiration check via real API
}