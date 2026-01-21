import { api } from '@/lib/api';

export async function sendPlanChangeNotification(
  tenantId: string,
  tenantName: string,
  email: string,
  userName: string,
  isUpgrade: boolean,
  fromPlan: string,
  toPlan: string,
  amount: number,
  creditsEarned?: number
): Promise<boolean> {
  try {
    await api.post('/notifications/email/plan-change', {
      tenantId,
      tenantName,
      email,
      userName,
      isUpgrade,
      fromPlan,
      toPlan,
      amount,
      creditsEarned,
    });
    return true;
  } catch (error) {
    console.warn('Email notification service not available:', error);
    // Log to console as fallback
    console.log('Plan change notification:', {
      tenantId,
      tenantName,
      email,
      userName,
      isUpgrade,
      fromPlan,
      toPlan,
      amount,
      creditsEarned,
    });
    return true; // Don't fail the operation if email fails
  }
}

export async function sendCreditsEarnedNotification(
  tenantId: string,
  tenantName: string,
  email: string,
  userName: string,
  creditsAmount: number,
  reason: string,
  expiryDate: string
): Promise<boolean> {
  try {
    await api.post('/notifications/email/credits-earned', {
      tenantId,
      tenantName,
      email,
      userName,
      creditsAmount,
      reason,
      expiryDate,
    });
    return true;
  } catch (error) {
    console.warn('Email notification service not available:', error);
    console.log('Credits earned notification:', {
      tenantId,
      tenantName,
      email,
      userName,
      creditsAmount,
      reason,
      expiryDate,
    });
    return true;
  }
}

export async function sendWelcomeEmail(
  email: string,
  userName: string,
  tenantName: string
): Promise<boolean> {
  try {
    await api.post('/notifications/email/welcome', {
      email,
      userName,
      tenantName,
    });
    return true;
  } catch (error) {
    console.warn('Email notification service not available:', error);
    return true;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<boolean> {
  try {
    await api.post('/notifications/email/password-reset', {
      email,
      resetToken,
    });
    return true;
  } catch (error) {
    console.warn('Email notification service not available:', error);
    return true;
  }
}

export async function sendInvoiceEmail(
  email: string,
  invoiceId: string,
  amount: number,
  dueDate: string
): Promise<boolean> {
  try {
    await api.post('/notifications/email/invoice', {
      email,
      invoiceId,
      amount,
      dueDate,
    });
    return true;
  } catch (error) {
    console.warn('Email notification service not available:', error);
    return true;
  }
}
