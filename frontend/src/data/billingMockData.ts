import { 
  BillingPlan, 
  BillingModule, 
  TenantSubscription, 
  Invoice, 
  DiscountCoupon,
  PaymentMethod,
  FinancialKPIs,
  InvoiceItem
} from '@/types/billing';

// ============================================================================
// MÓDULOS DISPONÍVEIS
// ============================================================================
export const mockModules: BillingModule[] = [
  {
    id: 'mod-1',
    name: 'WhatsApp Business',
    slug: 'whatsapp',
    description: 'Integração com WhatsApp via Evolution API',
    price: 4990, // R$ 49,90
    currency: 'BRL',
    isRecurring: true,
    isPerUnit: false,
    dependsOn: null,
    category: 'communication',
    iconName: 'MessageCircle',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'mod-2',
    name: 'IA Básica',
    slug: 'ai_basic',
    description: 'Respostas automáticas com GPT-3.5',
    price: 2990,
    currency: 'BRL',
    isRecurring: true,
    isPerUnit: false,
    dependsOn: 'whatsapp',
    category: 'ai',
    iconName: 'Bot',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'mod-3',
    name: 'IA Avançada',
    slug: 'ai_advanced',
    description: 'Respostas com GPT-4 + contexto avançado',
    price: 7990,
    currency: 'BRL',
    isRecurring: true,
    isPerUnit: false,
    dependsOn: 'ai_basic',
    category: 'ai',
    iconName: 'Sparkles',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'mod-4',
    name: 'Multi-Instância',
    slug: 'multi_instance',
    description: 'Múltiplas linhas de WhatsApp',
    price: 3990,
    currency: 'BRL',
    isRecurring: true,
    isPerUnit: true,
    dependsOn: 'whatsapp',
    category: 'communication',
    iconName: 'Layers',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'mod-5',
    name: 'Calendário',
    slug: 'calendar',
    description: 'Integração com Google Calendar',
    price: 1990,
    currency: 'BRL',
    isRecurring: true,
    isPerUnit: false,
    dependsOn: 'whatsapp',
    category: 'integration',
    iconName: 'Calendar',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'mod-6',
    name: 'CRM Básico',
    slug: 'crm',
    description: 'Gestão de contatos e leads',
    price: 2990,
    currency: 'BRL',
    isRecurring: true,
    isPerUnit: false,
    dependsOn: null,
    category: 'integration',
    iconName: 'Users',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'mod-7',
    name: 'Relatórios Avançados',
    slug: 'reports',
    description: 'Dashboards e exportações detalhadas',
    price: 2490,
    currency: 'BRL',
    isRecurring: true,
    isPerUnit: false,
    dependsOn: null,
    category: 'analytics',
    iconName: 'BarChart3',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'mod-8',
    name: 'Acesso à API',
    slug: 'api_access',
    description: 'Integração via API REST/tRPC',
    price: 4990,
    currency: 'BRL',
    isRecurring: true,
    isPerUnit: false,
    dependsOn: null,
    category: 'integration',
    iconName: 'Code',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'mod-9',
    name: 'White Label',
    slug: 'white_label',
    description: 'Marca própria, sem CodeSolve',
    price: 9990,
    currency: 'BRL',
    isRecurring: true,
    isPerUnit: false,
    dependsOn: null,
    category: 'support',
    iconName: 'Palette',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'mod-10',
    name: 'Suporte Prioritário',
    slug: 'priority_support',
    description: 'Atendimento em até 2 horas',
    price: 4990,
    currency: 'BRL',
    isRecurring: true,
    isPerUnit: false,
    dependsOn: null,
    category: 'support',
    iconName: 'Headphones',
    isActive: true,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// ============================================================================
// PLANOS DISPONÍVEIS
// Nota: Use src/config/plansConfig.ts como fonte única de verdade
// Este mock é mantido para compatibilidade com código legado
// ============================================================================
import { PLANS_CONFIG } from '@/config/plansConfig';

export const mockPlans: BillingPlan[] = PLANS_CONFIG;

// ============================================================================
// ASSINATURAS DOS TENANTS (para SuperAdmin ver todos)
// ============================================================================
export const mockSubscriptions: TenantSubscription[] = [
  {
    id: 'sub-1',
    tenantId: '1',
    tenantName: 'SIX BLADES - LAGO OESTE',
    planId: 'plan-professional',
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-01-01T00:00:00Z',
    currentPeriodEnd: '2026-02-01T00:00:00Z',
    canceledAt: null,
    cancelReason: null,
    trialEndsAt: null,
    discountPercent: 0,
    discountReason: null,
    extraModules: [],
    usage: {
      messagesUsed: 3500,
      messagesLimit: 5000,
      usersUsed: 4,
      usersLimit: 5,
      instancesUsed: 2,
      instancesLimit: 2,
    },
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-2',
    tenantId: '2',
    tenantName: 'Academia XYZ',
    planId: 'plan-business',
    status: 'active',
    billingCycle: 'annual',
    currentPeriodStart: '2025-06-01T00:00:00Z',
    currentPeriodEnd: '2026-06-01T00:00:00Z',
    canceledAt: null,
    cancelReason: null,
    trialEndsAt: null,
    discountPercent: 20,
    discountReason: 'Desconto anual',
    extraModules: [
      {
        id: 'tm-1',
        tenantId: '2',
        moduleId: 'mod-10',
        quantity: 1,
        status: 'active',
        activatedAt: '2025-06-01T00:00:00Z',
        deactivatedAt: null,
      }
    ],
    usage: {
      messagesUsed: 15200,
      messagesLimit: 20000,
      usersUsed: 12,
      usersLimit: 15,
      instancesUsed: 3,
      instancesLimit: 5,
    },
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-3',
    tenantId: '3',
    tenantName: 'Pizzaria ABC',
    planId: 'plan-professional',
    status: 'past_due',
    billingCycle: 'monthly',
    currentPeriodStart: '2025-12-10T00:00:00Z',
    currentPeriodEnd: '2026-01-10T00:00:00Z',
    canceledAt: null,
    cancelReason: null,
    trialEndsAt: null,
    discountPercent: 0,
    discountReason: null,
    extraModules: [],
    usage: {
      messagesUsed: 4800,
      messagesLimit: 5000,
      usersUsed: 3,
      usersLimit: 5,
      instancesUsed: 1,
      instancesLimit: 2,
    },
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'sub-4',
    tenantId: '4',
    tenantName: 'Clínica 123',
    planId: 'plan-starter',
    status: 'active',
    billingCycle: 'monthly',
    currentPeriodStart: '2026-01-05T00:00:00Z',
    currentPeriodEnd: '2026-02-05T00:00:00Z',
    canceledAt: null,
    cancelReason: null,
    trialEndsAt: null,
    discountPercent: 0,
    discountReason: null,
    extraModules: [],
    usage: {
      messagesUsed: 450,
      messagesLimit: 1000,
      usersUsed: 1,
      usersLimit: 2,
      instancesUsed: 1,
      instancesLimit: 1,
    },
    createdAt: '2025-11-01T00:00:00Z',
    updatedAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'sub-5',
    tenantId: '5',
    tenantName: 'Imobiliária Premium',
    planId: 'plan-enterprise',
    status: 'active',
    billingCycle: 'annual',
    currentPeriodStart: '2025-07-01T00:00:00Z',
    currentPeriodEnd: '2026-07-01T00:00:00Z',
    canceledAt: null,
    cancelReason: null,
    trialEndsAt: null,
    discountPercent: 15,
    discountReason: 'Parceria estratégica',
    extraModules: [],
    usage: {
      messagesUsed: 45000,
      messagesLimit: null,
      usersUsed: 25,
      usersLimit: 999,
      instancesUsed: 8,
      instancesLimit: 999,
    },
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'sub-6',
    tenantId: '6',
    tenantName: 'Salão Beauty',
    planId: 'plan-starter',
    status: 'canceled',
    billingCycle: 'monthly',
    currentPeriodStart: '2025-11-28T00:00:00Z',
    currentPeriodEnd: '2025-12-28T00:00:00Z',
    canceledAt: '2025-12-20T00:00:00Z',
    cancelReason: 'Custos altos',
    trialEndsAt: null,
    discountPercent: 0,
    discountReason: null,
    extraModules: [],
    usage: {
      messagesUsed: 0,
      messagesLimit: 1000,
      usersUsed: 0,
      usersLimit: 2,
      instancesUsed: 0,
      instancesLimit: 1,
    },
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-12-20T00:00:00Z',
  },
];

// ============================================================================
// FATURAS
// ============================================================================
export const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    tenantId: '1',
    tenantName: 'SIX BLADES - LAGO OESTE',
    subscriptionId: 'sub-1',
    invoiceNumber: 'INV-2026-001',
    status: 'paid',
    subtotal: 19700,
    discount: 0,
    tax: 0,
    total: 19700,
    currency: 'BRL',
    dueDate: '2026-01-15T00:00:00Z',
    paidAt: '2026-01-14T10:30:00Z',
    paymentMethod: 'credit_card',
    paymentReference: 'ch_1234567890',
    notes: null,
    items: [
      {
        id: 'item-1',
        invoiceId: 'inv-1',
        description: 'Plano Professional - Janeiro/2026',
        quantity: 1,
        unitPrice: 19700,
        total: 19700,
        moduleId: null,
        periodStart: '2026-01-01T00:00:00Z',
        periodEnd: '2026-02-01T00:00:00Z',
      }
    ],
    creditsApplied: 0,
    planChangeId: null,
    createdBy: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-14T10:30:00Z',
  },
  {
    id: 'inv-2',
    tenantId: '1',
    tenantName: 'SIX BLADES - LAGO OESTE',
    subscriptionId: 'sub-1',
    invoiceNumber: 'INV-2025-012',
    status: 'paid',
    subtotal: 19700,
    discount: 0,
    tax: 0,
    total: 19700,
    currency: 'BRL',
    dueDate: '2025-12-15T00:00:00Z',
    paidAt: '2025-12-12T14:20:00Z',
    paymentMethod: 'pix',
    paymentReference: 'pix_9876543210',
    notes: null,
    items: [
      {
        id: 'item-2',
        invoiceId: 'inv-2',
        description: 'Plano Professional - Dezembro/2025',
        quantity: 1,
        unitPrice: 19700,
        total: 19700,
        moduleId: null,
        periodStart: '2025-12-01T00:00:00Z',
        periodEnd: '2026-01-01T00:00:00Z',
      }
    ],
    creditsApplied: 0,
    planChangeId: null,
    createdBy: null,
    createdAt: '2025-12-01T00:00:00Z',
    updatedAt: '2025-12-12T14:20:00Z',
  },
  {
    id: 'inv-3',
    tenantId: '3',
    tenantName: 'Pizzaria ABC',
    subscriptionId: 'sub-3',
    invoiceNumber: 'INV-2026-002',
    status: 'overdue',
    subtotal: 19700,
    discount: 0,
    tax: 0,
    total: 19700,
    currency: 'BRL',
    dueDate: '2026-01-10T00:00:00Z',
    paidAt: null,
    paymentMethod: null,
    paymentReference: null,
    notes: 'Tentativa de cobrança falhou',
    items: [
      {
        id: 'item-3',
        invoiceId: 'inv-3',
        description: 'Plano Professional - Janeiro/2026',
        quantity: 1,
        unitPrice: 19700,
        total: 19700,
        moduleId: null,
        periodStart: '2026-01-10T00:00:00Z',
        periodEnd: '2026-02-10T00:00:00Z',
      }
    ],
    creditsApplied: 0,
    planChangeId: null,
    createdBy: null,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'inv-4',
    tenantId: '2',
    tenantName: 'Academia XYZ',
    subscriptionId: 'sub-2',
    invoiceNumber: 'INV-2025-006',
    status: 'paid',
    subtotal: 476400,
    discount: 95280,
    tax: 0,
    total: 381120,
    currency: 'BRL',
    dueDate: '2025-06-15T00:00:00Z',
    paidAt: '2025-06-10T09:00:00Z',
    paymentMethod: 'credit_card',
    paymentReference: 'ch_0987654321',
    notes: 'Plano anual com 20% de desconto',
    items: [
      {
        id: 'item-4',
        invoiceId: 'inv-4',
        description: 'Plano Business - Anual (Jun/2025 - Jun/2026)',
        quantity: 1,
        unitPrice: 381120,
        total: 381120,
        moduleId: null,
        periodStart: '2025-06-01T00:00:00Z',
        periodEnd: '2026-06-01T00:00:00Z',
      }
    ],
    creditsApplied: 8500,
    planChangeId: 'pch-2',
    createdBy: null,
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-10T09:00:00Z',
  },
  {
    id: 'inv-5',
    tenantId: '4',
    tenantName: 'Clínica 123',
    subscriptionId: 'sub-4',
    invoiceNumber: 'INV-2026-003',
    status: 'pending',
    subtotal: 9700,
    discount: 0,
    tax: 0,
    total: 9700,
    currency: 'BRL',
    dueDate: '2026-02-05T00:00:00Z',
    paidAt: null,
    paymentMethod: null,
    paymentReference: null,
    notes: null,
    items: [
      {
        id: 'item-5',
        invoiceId: 'inv-5',
        description: 'Plano Starter - Fevereiro/2026',
        quantity: 1,
        unitPrice: 9700,
        total: 9700,
        moduleId: null,
        periodStart: '2026-02-05T00:00:00Z',
        periodEnd: '2026-03-05T00:00:00Z',
      }
    ],
    creditsApplied: 0,
    planChangeId: null,
    createdBy: null,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
];

// ============================================================================
// CUPONS
// ============================================================================
export const mockCoupons: DiscountCoupon[] = [
  {
    id: 'coupon-1',
    code: 'PROMO20',
    description: 'Promoção de início de ano - 20% off',
    discountType: 'percent',
    discountValue: 20,
    maxUses: 100,
    usedCount: 45,
    minPurchase: 9700,
    validFrom: '2026-01-01T00:00:00Z',
    validUntil: '2026-01-31T23:59:59Z',
    applicablePlans: null,
    isActive: true,
    createdBy: 'superadmin',
    createdAt: '2025-12-20T00:00:00Z',
  },
  {
    id: 'coupon-2',
    code: 'BEMVINDO',
    description: 'Desconto para novos clientes',
    discountType: 'fixed',
    discountValue: 5000, // R$ 50
    maxUses: null,
    usedCount: 12,
    minPurchase: null,
    validFrom: null,
    validUntil: null,
    applicablePlans: ['plan-starter', 'plan-professional'],
    isActive: true,
    createdBy: 'superadmin',
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'coupon-3',
    code: 'BLACK2025',
    description: 'Black Friday 2025',
    discountType: 'percent',
    discountValue: 30,
    maxUses: 100,
    usedCount: 100,
    minPurchase: null,
    validFrom: '2025-11-20T00:00:00Z',
    validUntil: '2025-11-30T23:59:59Z',
    applicablePlans: null,
    isActive: false,
    createdBy: 'superadmin',
    createdAt: '2025-11-15T00:00:00Z',
  },
  {
    id: 'coupon-4',
    code: 'ANUAL50',
    description: '50% off no primeiro mês para planos anuais',
    discountType: 'percent',
    discountValue: 50,
    maxUses: 10,
    usedCount: 5,
    minPurchase: 19700,
    validFrom: '2026-01-01T00:00:00Z',
    validUntil: '2026-02-28T23:59:59Z',
    applicablePlans: ['plan-professional', 'plan-business'],
    isActive: true,
    createdBy: 'superadmin',
    createdAt: '2025-12-28T00:00:00Z',
  },
];

// ============================================================================
// MÉTODOS DE PAGAMENTO (do tenant atual)
// ============================================================================
export const mockPaymentMethods: PaymentMethod[] = [
  {
    id: 'pm-1',
    tenantId: '1',
    type: 'credit_card',
    isDefault: true,
    cardBrand: 'Visa',
    cardLast4: '4242',
    cardExpMonth: 12,
    cardExpYear: 2027,
    cardHolderName: 'ADMIN TENANT',
    pixKey: null,
    isActive: true,
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'pm-2',
    tenantId: '1',
    type: 'pix',
    isDefault: false,
    cardBrand: null,
    cardLast4: null,
    cardExpMonth: null,
    cardExpYear: null,
    cardHolderName: null,
    pixKey: 'admin@tenant.com',
    isActive: true,
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z',
  },
];

// ============================================================================
// KPIs FINANCEIROS (SuperAdmin)
// ============================================================================
export const mockFinancialKPIs: FinancialKPIs = {
  mrr: 4532000, // R$ 45.320
  arr: 54384000, // R$ 543.840
  billedThisMonth: 5210000, // R$ 52.100
  pendingAmount: 875000, // R$ 8.750
  overdueAmount: 234000, // R$ 2.340
  overdueCount: 3,
  activeSubscriptions: 106,
  churnRate: 2.5,
  mrrGrowth: 12.3,
};

// ============================================================================
// DADOS PARA GRÁFICOS (SuperAdmin)
// ============================================================================
export const mockRevenueByMonth = [
  { month: 'Fev', revenue: 3200000 },
  { month: 'Mar', revenue: 3450000 },
  { month: 'Abr', revenue: 3680000 },
  { month: 'Mai', revenue: 3920000 },
  { month: 'Jun', revenue: 4100000 },
  { month: 'Jul', revenue: 4280000 },
  { month: 'Ago', revenue: 4150000 },
  { month: 'Set', revenue: 4350000 },
  { month: 'Out', revenue: 4480000 },
  { month: 'Nov', revenue: 4620000 },
  { month: 'Dez', revenue: 4890000 },
  { month: 'Jan', revenue: 5210000 },
];

export const mockSubscriptionsByPlan = [
  { name: 'Free', value: 45, color: '#6B7280' },
  { name: 'Starter', value: 32, color: '#3B82F6' },
  { name: 'Professional', value: 18, color: '#00D4FF' },
  { name: 'Business', value: 8, color: '#8B5CF6' },
  { name: 'Enterprise', value: 3, color: '#F59E0B' },
];

// ============================================================================
// HELPER: Obter assinatura do tenant atual (para Admin)
// ============================================================================
export function getCurrentTenantSubscription(tenantId: string = '1'): TenantSubscription | undefined {
  return mockSubscriptions.find(sub => sub.tenantId === tenantId);
}

// ============================================================================
// HELPER: Obter faturas do tenant atual (para Admin)
// ============================================================================
export function getTenantInvoices(tenantId: string = '1'): Invoice[] {
  return mockInvoices.filter(inv => inv.tenantId === tenantId);
}

// ============================================================================
// HELPER: Obter plano por ID
// ============================================================================
export function getPlanById(planId: string): BillingPlan | undefined {
  return mockPlans.find(plan => plan.id === planId);
}

// ============================================================================
// HELPER: Obter módulo por ID
// ============================================================================
export function getModuleById(moduleId: string): BillingModule | undefined {
  return mockModules.find(mod => mod.id === moduleId);
}

// ============================================================================
// HELPER: Obter módulo por slug
// ============================================================================
export function getModuleBySlug(slug: string): BillingModule | undefined {
  return mockModules.find(mod => mod.slug === slug);
}
