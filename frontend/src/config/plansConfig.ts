/**
 * Configuração centralizada de planos de assinatura
 * Esta é a fonte única de verdade para planos em todo o sistema
 * A landing page e outras partes do sistema importam daqui
 */

import { BillingPlan, BillingCycle } from '@/types/billing';

// ============================================================================
// PLANOS DISPONÍVEIS - Fonte Única de Verdade
// ============================================================================
export const PLANS_CONFIG: BillingPlan[] = [
  {
    id: 'plan-free',
    name: 'Free',
    slug: 'free',
    description: 'Para começar a testar',
    basePrice: 0,
    currency: 'BRL',
    billingCycle: 'monthly',
    maxUsers: 1,
    maxInstances: 1,
    maxMessagesPerMonth: 100,
    modules: ['chat'], // Apenas chat básico
    isActive: true,
    isPublic: true,
    sortOrder: 0,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'plan-starter',
    name: 'Starter',
    slug: 'starter',
    description: 'Ideal para pequenos negócios',
    basePrice: 9700, // R$ 97,00
    currency: 'BRL',
    billingCycle: 'monthly',
    maxUsers: 2,
    maxInstances: 1,
    maxMessagesPerMonth: 1000,
    modules: ['chat', 'ai-consumption', 'calendar'],
    isActive: true,
    isPublic: true,
    sortOrder: 1,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'plan-professional',
    name: 'Professional',
    slug: 'professional',
    description: 'Para negócios em crescimento',
    basePrice: 19700, // R$ 197,00
    currency: 'BRL',
    billingCycle: 'monthly',
    maxUsers: 5,
    maxInstances: 2,
    maxMessagesPerMonth: 5000,
    modules: ['chat', 'ai-consumption', 'ai-config', 'calendar', 'automations', 'instagram'],
    isActive: true,
    isPublic: true,
    isPopular: true,
    sortOrder: 2,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'plan-business',
    name: 'Business',
    slug: 'business',
    description: 'Para empresas estabelecidas',
    basePrice: 39700, // R$ 397,00
    currency: 'BRL',
    billingCycle: 'monthly',
    maxUsers: 15,
    maxInstances: 5,
    maxMessagesPerMonth: 20000,
    modules: [
      'chat', 'ai-consumption', 'ai-config', 'calendar', 'automations',
      'instagram', 'facebook', 'twitter', 'reports'
    ],
    isActive: true,
    isPublic: true,
    sortOrder: 3,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'plan-enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Solução completa e personalizada',
    basePrice: 0, // Sob consulta
    currency: 'BRL',
    billingCycle: 'monthly',
    maxUsers: 999,
    maxInstances: 999,
    maxMessagesPerMonth: null, // Ilimitado
    modules: [
      'chat', 'ai-consumption', 'ai-config', 'calendar', 'automations',
      'instagram', 'facebook', 'twitter', 'linkedin', 'youtube',
      'reports', 'billing', 'support'
    ],
    isActive: true,
    isPublic: true,
    sortOrder: 4,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Retorna todos os planos públicos e ativos (para landing page)
 */
export function getPublicPlans(): BillingPlan[] {
  return PLANS_CONFIG
    .filter(plan => plan.isPublic && plan.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Retorna todos os planos (para admin)
 */
export function getAllPlans(): BillingPlan[] {
  return [...PLANS_CONFIG].sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Retorna um plano pelo slug
 */
export function getPlanBySlug(slug: string): BillingPlan | undefined {
  return PLANS_CONFIG.find(plan => plan.slug === slug);
}

/**
 * Retorna um plano pelo ID
 */
export function getPlanById(id: string): BillingPlan | undefined {
  return PLANS_CONFIG.find(plan => plan.id === id);
}

/**
 * Verifica se um módulo está incluído em um plano
 */
export function isModuleIncludedInPlan(planSlug: string, moduleId: string): boolean {
  const plan = getPlanBySlug(planSlug);
  return plan?.modules.includes(moduleId) ?? false;
}

/**
 * Retorna os planos que incluem um determinado módulo
 */
export function getPlansWithModule(moduleId: string): BillingPlan[] {
  return PLANS_CONFIG.filter(plan => plan.modules.includes(moduleId));
}

/**
 * Retorna o plano mínimo necessário para acessar um módulo
 */
export function getMinPlanForModule(moduleId: string): BillingPlan | undefined {
  const plansWithModule = getPlansWithModule(moduleId);
  return plansWithModule.sort((a, b) => a.sortOrder - b.sortOrder)[0];
}

/**
 * Formata características do plano para exibição
 */
export function getPlanFeatures(plan: BillingPlan): string[] {
  const features: string[] = [];
  
  // WhatsApp/Instâncias
  features.push(
    plan.maxInstances >= 999 
      ? 'WhatsApp ilimitado' 
      : `${plan.maxInstances} instância${plan.maxInstances > 1 ? 's' : ''} WhatsApp`
  );
  
  // Usuários
  features.push(
    plan.maxUsers >= 999 
      ? 'Usuários ilimitados' 
      : `${plan.maxUsers} usuário${plan.maxUsers > 1 ? 's' : ''}`
  );
  
  // Mensagens
  features.push(
    plan.maxMessagesPerMonth === null 
      ? 'Mensagens ilimitadas' 
      : `${plan.maxMessagesPerMonth.toLocaleString('pt-BR')} msgs/mês`
  );
  
  return features;
}

/**
 * Compara dois planos e retorna se o primeiro é superior
 */
export function isPlanSuperior(planA: string, planB: string): boolean {
  const a = getPlanBySlug(planA);
  const b = getPlanBySlug(planB);
  if (!a || !b) return false;
  return a.sortOrder > b.sortOrder;
}
