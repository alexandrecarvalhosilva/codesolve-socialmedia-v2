// ============================================================================
// BILLING TYPES - Sistema de Cobrança CodeSolve
// ============================================================================

// Status de assinatura
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'paused';

// Status de fatura
export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'canceled' | 'refunded';

// Status de transação
export type TransactionStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'refunded';

// Ciclo de cobrança
export type BillingCycle = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

// Tipo de método de pagamento
export type PaymentMethodType = 'credit_card' | 'pix' | 'boleto';

// Tipo de desconto
export type DiscountType = 'percent' | 'fixed';

// Categoria de módulo
export type ModuleCategory = 'communication' | 'ai' | 'integration' | 'support' | 'analytics';

// Tipo de mudança de plano
export type PlanChangeType = 'upgrade' | 'downgrade' | 'renewal' | 'cancellation' | 'reactivation';

// ============================================================================
// PLANOS
// ============================================================================
export interface BillingPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number; // Em centavos (R$ 97,00 = 9700)
  currency: string;
  billingCycle: BillingCycle;
  maxUsers: number;
  maxInstances: number;
  maxMessagesPerMonth: number | null; // null = ilimitado
  modules: string[]; // IDs dos módulos inclusos
  isActive: boolean;
  isPublic: boolean;
  isPopular?: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// MÓDULOS
// ============================================================================
export interface BillingModule {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number; // Em centavos
  currency: string;
  isRecurring: boolean;
  isPerUnit: boolean; // Preço por unidade (ex: por instância)
  dependsOn: string | null; // Slug do módulo dependente
  category: ModuleCategory;
  iconName: string; // Nome do ícone Lucide
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ASSINATURA DO TENANT
// ============================================================================
export interface TenantSubscription {
  id: string;
  tenantId: string;
  tenantName: string;
  planId: string;
  plan?: BillingPlan;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt: string | null;
  cancelReason: string | null;
  trialEndsAt: string | null;
  discountPercent: number;
  discountReason: string | null;
  // Módulos extras contratados (além do plano)
  extraModules: TenantModule[];
  // Uso atual
  usage: TenantUsage;
  // Créditos acumulados
  credits?: TenantCredits;
  createdAt: string;
  updatedAt: string;
}

// Módulos extras do tenant
export interface TenantModule {
  id: string;
  tenantId: string;
  moduleId: string;
  module?: BillingModule;
  quantity: number;
  status: 'active' | 'inactive';
  activatedAt: string;
  deactivatedAt: string | null;
}

// Uso do tenant
export interface TenantUsage {
  messagesUsed: number;
  messagesLimit: number | null;
  usersUsed: number;
  usersLimit: number;
  instancesUsed: number;
  instancesLimit: number;
}

// Créditos acumulados do tenant
export interface TenantCredits {
  balance: number; // Em centavos
  currency: string;
  lastUpdated: string;
}

// ============================================================================
// HISTÓRICO DE MUDANÇAS DE PLANO
// ============================================================================
export interface PlanChangeHistory {
  id: string;
  tenantId: string;
  tenantName: string;
  changeType: PlanChangeType;
  fromPlanId: string | null;
  fromPlanName: string | null;
  toPlanId: string | null;
  toPlanName: string | null;
  fromCycle: BillingCycle | null;
  toCycle: BillingCycle | null;
  proratedAmount: number; // Valor proporcional (positivo = cobrança, negativo = crédito)
  creditsApplied: number; // Créditos utilizados na transação
  creditsGenerated: number; // Créditos gerados pela transação
  effectiveDate: string;
  reason: string | null;
  processedBy: string | null; // ID do usuário que processou
  stripePaymentIntentId: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: string;
}

// ============================================================================
// CRÉDITOS
// ============================================================================
export interface CreditTransaction {
  id: string;
  tenantId: string;
  type: 'earned' | 'spent' | 'expired' | 'refund' | 'adjustment';
  amount: number; // Em centavos (positivo = entrada, negativo = saída)
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  referenceType: 'plan_change' | 'cancellation' | 'refund' | 'manual' | 'promotion';
  referenceId: string | null;
  expiresAt: string | null;
  createdAt: string;
}

// ============================================================================
// STRIPE MOCK
// ============================================================================
export interface StripePaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'succeeded' | 'canceled';
  clientSecret: string;
  paymentMethodId: string | null;
  metadata: Record<string, string>;
  createdAt: string;
}

export interface StripeCheckoutSession {
  id: string;
  paymentIntentId: string | null;
  subscriptionId: string | null;
  customerId: string;
  mode: 'payment' | 'subscription';
  status: 'open' | 'complete' | 'expired';
  successUrl: string;
  cancelUrl: string;
  lineItems: StripeLineItem[];
  totalAmount: number;
  currency: string;
  createdAt: string;
}

export interface StripeLineItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
}

// ============================================================================
// FATURAS
// ============================================================================
export interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  subscriptionId: string | null;
  invoiceNumber: string;
  status: InvoiceStatus;
  subtotal: number; // Em centavos
  discount: number;
  tax: number;
  total: number;
  currency: string;
  dueDate: string;
  paidAt: string | null;
  paymentMethod: PaymentMethodType | null;
  paymentReference: string | null;
  notes: string | null;
  items: InvoiceItem[];
  creditsApplied: number; // Créditos aplicados nesta fatura
  planChangeId: string | null; // Referência à mudança de plano, se aplicável
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  description: string;
  quantity: number;
  unitPrice: number; // Em centavos
  total: number;
  moduleId: string | null;
  periodStart: string | null;
  periodEnd: string | null;
}

// ============================================================================
// MÉTODOS DE PAGAMENTO
// ============================================================================
export interface PaymentMethod {
  id: string;
  tenantId: string;
  type: PaymentMethodType;
  isDefault: boolean;
  // Para cartão
  cardBrand: string | null;
  cardLast4: string | null;
  cardExpMonth: number | null;
  cardExpYear: number | null;
  cardHolderName: string | null;
  // Para PIX
  pixKey: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// TRANSAÇÕES
// ============================================================================
export interface PaymentTransaction {
  id: string;
  invoiceId: string;
  tenantId: string;
  paymentMethodId: string | null;
  amount: number;
  currency: string;
  status: TransactionStatus;
  gatewayTransactionId: string | null;
  errorMessage: string | null;
  processedAt: string | null;
  createdAt: string;
}

// ============================================================================
// CUPONS
// ============================================================================
export interface DiscountCoupon {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: number; // Percentual ou valor em centavos
  maxUses: number | null; // null = ilimitado
  usedCount: number;
  minPurchase: number | null;
  validFrom: string | null;
  validUntil: string | null;
  applicablePlans: string[] | null; // null = todos
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  tenantId: string;
  invoiceId: string | null;
  discountApplied: number;
  usedAt: string;
}

// ============================================================================
// KPIs FINANCEIROS (SuperAdmin)
// ============================================================================
export interface FinancialKPIs {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  billedThisMonth: number;
  pendingAmount: number;
  overdueAmount: number;
  overdueCount: number;
  activeSubscriptions: number;
  churnRate: number;
  mrrGrowth: number; // Percentual de crescimento
}

// ============================================================================
// CARRINHO DE PAGAMENTO
// ============================================================================
export interface CartItem {
  type: 'plan' | 'module';
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  total: number;
}

// ============================================================================
// DESCONTOS POR CICLO
// ============================================================================
export const BILLING_CYCLE_DISCOUNTS: Record<BillingCycle, { label: string; discount: number; months: number }> = {
  monthly: { label: 'Mensal', discount: 0, months: 1 },
  quarterly: { label: 'Trimestral', discount: 10, months: 3 },
  semiannual: { label: 'Semestral', discount: 15, months: 6 },
  annual: { label: 'Anual', discount: 20, months: 12 },
};

// ============================================================================
// HELPERS
// ============================================================================

// Formatar preço em centavos para exibição
export function formatPrice(cents: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

// Calcular preço com desconto de ciclo
export function calculateCyclePrice(basePrice: number, cycle: BillingCycle): number {
  const { discount, months } = BILLING_CYCLE_DISCOUNTS[cycle];
  const totalBeforeDiscount = basePrice * months;
  const discountAmount = totalBeforeDiscount * (discount / 100);
  return totalBeforeDiscount - discountAmount;
}

// Status labels e cores
export const SUBSCRIPTION_STATUS_CONFIG: Record<SubscriptionStatus, { label: string; color: string }> = {
  active: { label: 'Ativo', color: 'bg-green-500' },
  canceled: { label: 'Cancelado', color: 'bg-gray-500' },
  past_due: { label: 'Em Atraso', color: 'bg-red-500' },
  trialing: { label: 'Trial', color: 'bg-blue-500' },
  paused: { label: 'Pausado', color: 'bg-yellow-500' },
};

export const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: 'bg-yellow-500' },
  paid: { label: 'Pago', color: 'bg-green-500' },
  overdue: { label: 'Atrasado', color: 'bg-red-500' },
  canceled: { label: 'Cancelado', color: 'bg-gray-500' },
  refunded: { label: 'Reembolsado', color: 'bg-purple-500' },
};

export const PLAN_CHANGE_TYPE_CONFIG: Record<PlanChangeType, { label: string; color: string; icon: string }> = {
  upgrade: { label: 'Upgrade', color: 'bg-green-500', icon: 'ArrowUp' },
  downgrade: { label: 'Downgrade', color: 'bg-orange-500', icon: 'ArrowDown' },
  renewal: { label: 'Renovação', color: 'bg-blue-500', icon: 'RefreshCw' },
  cancellation: { label: 'Cancelamento', color: 'bg-red-500', icon: 'XCircle' },
  reactivation: { label: 'Reativação', color: 'bg-purple-500', icon: 'Play' },
};