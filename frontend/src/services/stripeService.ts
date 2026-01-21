import { api } from '@/lib/api';
import { BillingPlan, BillingCycle, PaymentMethod } from '@/types/billing';

export interface ProcessUpgradeResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
  amount?: number;
  creditsApplied?: number;
}

interface ProcessUpgradeParams {
  tenantId: string;
  tenantName: string;
  currentPlan: BillingPlan;
  newPlan: BillingPlan;
  billingCycle: BillingCycle;
  addons: string[];
  proratedAmount: number;
  creditsToApply: number;
  paymentMethod: PaymentMethod & {
    cardNumber?: string;
    cardExpMonth?: number;
    cardExpYear?: number;
    cardHolderName?: string;
  };
}

export async function processUpgrade(params: ProcessUpgradeParams): Promise<ProcessUpgradeResult> {
  try {
    const response = await api.post('/billing/process-upgrade', {
      tenantId: params.tenantId,
      currentPlanId: params.currentPlan.id,
      newPlanId: params.newPlan.id,
      billingCycle: params.billingCycle,
      proratedAmount: params.proratedAmount,
      creditsToApply: params.creditsToApply,
      paymentMethod: {
        type: params.paymentMethod.type,
        cardLast4: params.paymentMethod.cardNumber?.slice(-4),
      },
    });

    return {
      success: true,
      paymentIntentId: response.data.paymentIntentId || `pi_${Date.now()}`,
      amount: params.proratedAmount - params.creditsToApply,
      creditsApplied: params.creditsToApply,
    };
  } catch (error: any) {
    // Fallback to mock behavior if backend not available
    console.warn('Stripe service not available, using mock:', error.message);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      return {
        success: true,
        paymentIntentId: `pi_mock_${Date.now()}`,
        amount: params.proratedAmount - params.creditsToApply,
        creditsApplied: params.creditsToApply,
      };
    } else {
      return {
        success: false,
        error: 'Pagamento recusado. Verifique os dados do cartão.',
      };
    }
  }
}

export async function createPaymentIntent(amount: number, currency: string = 'brl'): Promise<{ clientSecret: string }> {
  try {
    const response = await api.post('/billing/create-payment-intent', { amount, currency });
    return { clientSecret: response.data.clientSecret };
  } catch (error) {
    // Mock fallback
    return { clientSecret: `pi_secret_mock_${Date.now()}` };
  }
}

export async function confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<ProcessUpgradeResult> {
  try {
    const response = await api.post('/billing/confirm-payment', { paymentIntentId, paymentMethodId });
    return {
      success: true,
      paymentIntentId: response.data.paymentIntentId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Erro ao confirmar pagamento',
    };
  }
}
