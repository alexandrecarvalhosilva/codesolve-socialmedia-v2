/**
 * Mock Stripe Service
 * Simula a integração com Stripe para processamento de pagamentos
 */

import { 
  StripePaymentIntent, 
  StripeCheckoutSession, 
  StripeLineItem,
  PaymentMethod,
  BillingCycle,
  formatPrice 
} from '@/types/billing';
import { BillingPlan } from '@/types/billing';
import { BillingModule } from '@/types/billing';

// ============================================================================
// GERAÇÃO DE IDs
// ============================================================================
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================================================
// MOCK DATA STORAGE (simula banco de dados)
// ============================================================================
const paymentIntents: Map<string, StripePaymentIntent> = new Map();
const checkoutSessions: Map<string, StripeCheckoutSession> = new Map();
const paymentMethods: Map<string, PaymentMethod> = new Map();

// ============================================================================
// PAYMENT INTENT
// ============================================================================

export interface CreatePaymentIntentParams {
  amount: number; // Em centavos
  currency?: string;
  customerId: string;
  metadata?: Record<string, string>;
}

export async function createPaymentIntent(
  params: CreatePaymentIntentParams
): Promise<StripePaymentIntent> {
  // Simula delay de API
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const paymentIntent: StripePaymentIntent = {
    id: generateId('pi'),
    amount: params.amount,
    currency: params.currency || 'brl',
    status: 'requires_payment_method',
    clientSecret: generateId('pi_secret'),
    paymentMethodId: null,
    metadata: params.metadata || {},
    createdAt: new Date().toISOString(),
  };
  
  paymentIntents.set(paymentIntent.id, paymentIntent);
  return paymentIntent;
}

export async function confirmPaymentIntent(
  paymentIntentId: string,
  paymentMethodId: string
): Promise<StripePaymentIntent> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const paymentIntent = paymentIntents.get(paymentIntentId);
  if (!paymentIntent) {
    throw new Error('Payment intent not found');
  }
  
  // Simula 95% de sucesso
  const isSuccessful = Math.random() < 0.95;
  
  paymentIntent.paymentMethodId = paymentMethodId;
  paymentIntent.status = isSuccessful ? 'succeeded' : 'canceled';
  
  paymentIntents.set(paymentIntentId, paymentIntent);
  return paymentIntent;
}

export async function getPaymentIntent(paymentIntentId: string): Promise<StripePaymentIntent | null> {
  return paymentIntents.get(paymentIntentId) || null;
}

// ============================================================================
// CHECKOUT SESSION
// ============================================================================

export interface CreateCheckoutSessionParams {
  customerId: string;
  mode: 'payment' | 'subscription';
  lineItems: Array<{
    name: string;
    description: string;
    quantity: number;
    unitAmount: number;
  }>;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<StripeCheckoutSession> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const lineItems: StripeLineItem[] = params.lineItems.map((item, index) => ({
    id: generateId('li'),
    name: item.name,
    description: item.description,
    quantity: item.quantity,
    unitAmount: item.unitAmount,
    totalAmount: item.quantity * item.unitAmount,
  }));
  
  const totalAmount = lineItems.reduce((sum, item) => sum + item.totalAmount, 0);
  
  const session: StripeCheckoutSession = {
    id: generateId('cs'),
    paymentIntentId: null,
    subscriptionId: null,
    customerId: params.customerId,
    mode: params.mode,
    status: 'open',
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
    lineItems,
    totalAmount,
    currency: 'brl',
    createdAt: new Date().toISOString(),
  };
  
  checkoutSessions.set(session.id, session);
  return session;
}

export async function completeCheckoutSession(
  sessionId: string,
  paymentMethodId: string
): Promise<{ session: StripeCheckoutSession; paymentIntent: StripePaymentIntent }> {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const session = checkoutSessions.get(sessionId);
  if (!session) {
    throw new Error('Checkout session not found');
  }
  
  // Criar payment intent
  const paymentIntent = await createPaymentIntent({
    amount: session.totalAmount,
    currency: session.currency,
    customerId: session.customerId,
    metadata: { sessionId },
  });
  
  // Confirmar pagamento
  const confirmedIntent = await confirmPaymentIntent(paymentIntent.id, paymentMethodId);
  
  session.paymentIntentId = confirmedIntent.id;
  session.status = confirmedIntent.status === 'succeeded' ? 'complete' : 'expired';
  
  if (session.mode === 'subscription') {
    session.subscriptionId = generateId('sub');
  }
  
  checkoutSessions.set(sessionId, session);
  
  return { session, paymentIntent: confirmedIntent };
}

export async function getCheckoutSession(sessionId: string): Promise<StripeCheckoutSession | null> {
  return checkoutSessions.get(sessionId) || null;
}

// ============================================================================
// PAYMENT METHOD
// ============================================================================

export interface CreatePaymentMethodParams {
  tenantId: string;
  type: 'credit_card' | 'pix' | 'boleto';
  cardNumber?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  cardHolderName?: string;
  pixKey?: string;
}

export async function createPaymentMethod(
  params: CreatePaymentMethodParams
): Promise<PaymentMethod> {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let cardBrand: string | null = null;
  let cardLast4: string | null = null;
  
  if (params.type === 'credit_card' && params.cardNumber) {
    cardLast4 = params.cardNumber.slice(-4);
    // Detectar bandeira
    if (params.cardNumber.startsWith('4')) {
      cardBrand = 'Visa';
    } else if (params.cardNumber.startsWith('5')) {
      cardBrand = 'Mastercard';
    } else if (params.cardNumber.startsWith('3')) {
      cardBrand = 'Amex';
    } else {
      cardBrand = 'Outro';
    }
  }
  
  const paymentMethod: PaymentMethod = {
    id: generateId('pm'),
    tenantId: params.tenantId,
    type: params.type,
    isDefault: true,
    cardBrand,
    cardLast4,
    cardExpMonth: params.cardExpMonth || null,
    cardExpYear: params.cardExpYear || null,
    cardHolderName: params.cardHolderName || null,
    pixKey: params.pixKey || null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  paymentMethods.set(paymentMethod.id, paymentMethod);
  return paymentMethod;
}

export async function getPaymentMethods(tenantId: string): Promise<PaymentMethod[]> {
  return Array.from(paymentMethods.values()).filter(pm => pm.tenantId === tenantId);
}

// ============================================================================
// CHECKOUT HELPERS
// ============================================================================

export interface ProcessUpgradeParams {
  tenantId: string;
  tenantName: string;
  currentPlan: BillingPlan | null;
  newPlan: BillingPlan;
  billingCycle: BillingCycle;
  addons: Array<{ module: BillingModule; quantity: number }>;
  proratedAmount: number;
  creditsToApply: number;
  paymentMethod: CreatePaymentMethodParams;
}

export interface ProcessUpgradeResult {
  success: boolean;
  paymentIntentId: string | null;
  subscriptionId: string | null;
  invoiceId: string | null;
  error: string | null;
  receipt: {
    subtotal: number;
    creditsApplied: number;
    total: number;
    items: Array<{ description: string; amount: number }>;
  };
}

export async function processUpgrade(
  params: ProcessUpgradeParams
): Promise<ProcessUpgradeResult> {
  try {
    // 1. Criar método de pagamento
    const paymentMethod = await createPaymentMethod(params.paymentMethod);
    
    // 2. Calcular valores
    const planAmount = params.proratedAmount;
    const addonsAmount = params.addons.reduce(
      (sum, addon) => sum + (addon.module.price * addon.quantity), 
      0
    );
    const subtotal = planAmount + addonsAmount;
    const creditsApplied = Math.min(params.creditsToApply, subtotal);
    const total = Math.max(0, subtotal - creditsApplied);
    
    // 3. Criar itens do recibo
    const items: Array<{ description: string; amount: number }> = [];
    
    if (params.currentPlan && params.proratedAmount !== params.newPlan.basePrice) {
      items.push({
        description: `Upgrade para ${params.newPlan.name} (proporcional)`,
        amount: planAmount,
      });
    } else {
      items.push({
        description: `Plano ${params.newPlan.name}`,
        amount: planAmount,
      });
    }
    
    params.addons.forEach(addon => {
      items.push({
        description: `${addon.module.name} x${addon.quantity}`,
        amount: addon.module.price * addon.quantity,
      });
    });
    
    if (creditsApplied > 0) {
      items.push({
        description: 'Créditos aplicados',
        amount: -creditsApplied,
      });
    }
    
    // 4. Processar pagamento se necessário
    let paymentIntentId: string | null = null;
    
    if (total > 0) {
      const paymentIntent = await createPaymentIntent({
        amount: total,
        customerId: params.tenantId,
        metadata: {
          tenantId: params.tenantId,
          planId: params.newPlan.id,
          type: 'upgrade',
        },
      });
      
      const confirmedIntent = await confirmPaymentIntent(paymentIntent.id, paymentMethod.id);
      
      if (confirmedIntent.status !== 'succeeded') {
        return {
          success: false,
          paymentIntentId: confirmedIntent.id,
          subscriptionId: null,
          invoiceId: null,
          error: 'Pagamento falhou. Por favor, tente novamente.',
          receipt: { subtotal, creditsApplied, total, items },
        };
      }
      
      paymentIntentId = confirmedIntent.id;
    }
    
    // 5. Gerar IDs
    const subscriptionId = generateId('sub');
    const invoiceId = generateId('inv');
    
    return {
      success: true,
      paymentIntentId,
      subscriptionId,
      invoiceId,
      error: null,
      receipt: { subtotal, creditsApplied, total, items },
    };
  } catch (error) {
    return {
      success: false,
      paymentIntentId: null,
      subscriptionId: null,
      invoiceId: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      receipt: { subtotal: 0, creditsApplied: 0, total: 0, items: [] },
    };
  }
}

// ============================================================================
// REFUND / CANCEL
// ============================================================================

export interface ProcessCancellationParams {
  tenantId: string;
  subscriptionId: string;
  reason: string;
  refundAmount: number;
}

export interface ProcessCancellationResult {
  success: boolean;
  creditsGenerated: number;
  effectiveDate: string;
  error: string | null;
}

export async function processCancellation(
  params: ProcessCancellationParams
): Promise<ProcessCancellationResult> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Em vez de reembolso, geramos créditos
  const creditsGenerated = params.refundAmount;
  
  return {
    success: true,
    creditsGenerated,
    effectiveDate: new Date().toISOString(),
    error: null,
  };
}

// ============================================================================
// WEBHOOKS MOCK
// ============================================================================

export type StripeWebhookEvent = 
  | { type: 'payment_intent.succeeded'; data: StripePaymentIntent }
  | { type: 'payment_intent.failed'; data: StripePaymentIntent }
  | { type: 'checkout.session.completed'; data: StripeCheckoutSession }
  | { type: 'customer.subscription.updated'; data: { subscriptionId: string; status: string } }
  | { type: 'customer.subscription.deleted'; data: { subscriptionId: string } };

const webhookListeners: Array<(event: StripeWebhookEvent) => void> = [];

export function subscribeToWebhooks(listener: (event: StripeWebhookEvent) => void): () => void {
  webhookListeners.push(listener);
  return () => {
    const index = webhookListeners.indexOf(listener);
    if (index > -1) {
      webhookListeners.splice(index, 1);
    }
  };
}

function emitWebhook(event: StripeWebhookEvent): void {
  webhookListeners.forEach(listener => listener(event));
}