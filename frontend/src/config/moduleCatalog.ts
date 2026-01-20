// ============================================================================
// CATÁLOGO DE MÓDULOS - Definição centralizada de todos os módulos disponíveis
// ============================================================================
// Este arquivo define TODOS os módulos do sistema com suas configurações
// de pricing, planos e metadados. É a fonte de verdade para o sistema.
// ============================================================================

import {
  Shield,
  Users,
  Building,
  MessageSquare,
  BarChart3,
  FileText,
  Calendar,
  Settings,
  CreditCard,
  Headphones,
  Brain,
  Bell,
  Zap,
  Instagram,
  Facebook,
  Twitter,
  LayoutDashboard,
  Bot,
  Share2,
  Linkedin,
  Youtube,
  type LucideIcon,
} from 'lucide-react';
import { ExtendedModuleConfig, ModuleDisplayCategory } from '@/types/modules';

// ============================================================================
// CATÁLOGO PRINCIPAL DE MÓDULOS
// ============================================================================

export const MODULE_CATALOG: ExtendedModuleConfig[] = [
  // ============ MÓDULOS ESSENCIAIS (Core) ============
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Painel principal com métricas e visão geral',
    longDescription: 'Visualize todas as métricas importantes do seu negócio em um único lugar. Inclui gráficos, KPIs e acesso rápido às principais funcionalidades.',
    icon: LayoutDashboard,
    category: 'essential',
    version: '1.0.0',
    enabled: true,
    isCore: true,
    isAvailable: true,
    tabComponent: 'TenantDashboardTab',
    tabPath: 'dashboard',
  },
  {
    id: 'config',
    name: 'Configurações',
    description: 'Configurações gerais do tenant',
    longDescription: 'Gerencie todas as configurações do seu espaço, incluindo integrações, WhatsApp, base de conhecimento e preferências.',
    icon: Settings,
    category: 'essential',
    version: '1.0.0',
    enabled: true,
    isCore: true,
    isAvailable: true,
    tabComponent: 'TenantGeneralConfigTab',
    tabPath: 'config',
  },
  {
    id: 'users',
    name: 'Usuários',
    description: 'Gestão de usuários e permissões',
    longDescription: 'Adicione, edite e gerencie usuários com diferentes níveis de acesso. Controle permissões de forma granular.',
    icon: Users,
    category: 'essential',
    version: '1.0.0',
    enabled: true,
    isCore: true,
    isAvailable: true,
    tabComponent: 'TenantUsersTab',
    tabPath: 'users',
  },

  // ============ MÓDULOS DE COMUNICAÇÃO ============
  {
    id: 'chat',
    name: 'Chat',
    description: 'Central de atendimento e conversas',
    longDescription: 'Gerencie todas as conversas com clientes em um único lugar. Inclui histórico, busca e integração com WhatsApp.',
    icon: MessageSquare,
    category: 'communication',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    isAvailable: true,
    isPopular: true,
    pricing: {
      monthlyPrice: 0,
      yearlyPrice: 0,
      trialDays: 0,
      setupFee: 0,
      perUnit: false,
    },
    planRequirement: {
      minPlan: 'starter',
      includedInPlans: ['starter', 'professional', 'business', 'enterprise'],
    },
    tabComponent: 'TenantChatTab',
    tabPath: 'chat',
  },
  {
    id: 'calendar',
    name: 'Calendário',
    description: 'Agendamentos e eventos',
    longDescription: 'Gerencie sua agenda, agende reuniões e eventos. Sincronize com Google Calendar e outros serviços.',
    icon: Calendar,
    category: 'communication',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    isAvailable: true,
    pricing: {
      monthlyPrice: 2990, // R$ 29,90
      yearlyPrice: 28700, // R$ 287,00 (20% off)
      trialDays: 14,
      setupFee: 0,
      perUnit: false,
    },
    planRequirement: {
      minPlan: 'professional',
      includedInPlans: ['professional', 'business', 'enterprise'],
    },
    tabComponent: 'TenantCalendarTab',
    tabPath: 'calendar',
  },

  // ============ MÓDULOS DE IA ============
  {
    id: 'automations',
    name: 'Automações',
    description: 'Fluxos automatizados e bots',
    longDescription: 'Crie automações para responder clientes, classificar mensagens e executar ações automaticamente.',
    icon: Bot,
    category: 'ai',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    isAvailable: true,
    isPopular: true,
    pricing: {
      monthlyPrice: 4990, // R$ 49,90
      yearlyPrice: 47900, // R$ 479,00 (20% off)
      trialDays: 7,
      setupFee: 0,
      perUnit: false,
    },
    planRequirement: {
      minPlan: 'professional',
      includedInPlans: ['professional', 'business', 'enterprise'],
    },
    tabComponent: 'TenantAutomationsTab',
    tabPath: 'automations',
  },
  {
    id: 'ai-consumption',
    name: 'Consumo IA',
    description: 'Monitoramento de uso de IA',
    longDescription: 'Acompanhe o consumo de tokens, custos e performance das integrações com IA.',
    icon: Brain,
    category: 'ai',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    isAvailable: true,
    pricing: {
      monthlyPrice: 0,
      yearlyPrice: 0,
      trialDays: 0,
      setupFee: 0,
      perUnit: false,
    },
    planRequirement: {
      minPlan: 'professional',
      includedInPlans: ['professional', 'business', 'enterprise'],
    },
    tabComponent: 'TenantAITab',
    tabPath: 'ai-consumption',
  },
  {
    id: 'ai-config',
    name: 'Config IA',
    description: 'Configurações de inteligência artificial',
    longDescription: 'Configure prompts, modelos de IA, limites de tokens e comportamento do assistente.',
    icon: Zap,
    category: 'ai',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    isAvailable: true,
    pricing: {
      monthlyPrice: 0,
      yearlyPrice: 0,
      trialDays: 0,
      setupFee: 0,
      perUnit: false,
    },
    planRequirement: {
      minPlan: 'professional',
      includedInPlans: ['professional', 'business', 'enterprise'],
    },
    tabComponent: 'TenantAIConfigTab',
    tabPath: 'ai-config',
  },

  // ============ MÓDULOS DE REDES SOCIAIS ============
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Integração com Instagram Direct',
    longDescription: 'Conecte contas do Instagram, responda mensagens, agende posts e monitore engajamento.',
    icon: Instagram,
    category: 'social',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    isAvailable: true,
    isNew: true,
    pricing: {
      monthlyPrice: 4990, // R$ 49,90
      yearlyPrice: 47900,
      trialDays: 14,
      setupFee: 0,
      perUnit: true,
      unitName: 'conta',
      maxUnits: 10,
    },
    planRequirement: {
      minPlan: 'professional',
      includedInPlans: ['business', 'enterprise'],
    },
    dependencies: ['chat'],
    tabComponent: 'TenantInstagramTab',
    tabPath: 'social',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Integração com Facebook Messenger',
    longDescription: 'Conecte páginas do Facebook, responda mensagens do Messenger e gerencie comentários.',
    icon: Facebook,
    category: 'social',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    isAvailable: true,
    isNew: true,
    pricing: {
      monthlyPrice: 4990,
      yearlyPrice: 47900,
      trialDays: 14,
      setupFee: 0,
      perUnit: true,
      unitName: 'página',
      maxUnits: 10,
    },
    planRequirement: {
      minPlan: 'professional',
      includedInPlans: ['business', 'enterprise'],
    },
    dependencies: ['chat'],
    tabComponent: 'TenantFacebookTab',
    tabPath: 'facebook',
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    description: 'Integração com Twitter/X',
    longDescription: 'Conecte contas do Twitter/X, responda menções e DMs, agende tweets.',
    icon: Twitter,
    category: 'social',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    isAvailable: false, // Em breve
    isBeta: true,
    pricing: {
      monthlyPrice: 3990,
      yearlyPrice: 38300,
      trialDays: 14,
      setupFee: 0,
      perUnit: true,
      unitName: 'conta',
      maxUnits: 5,
    },
    planRequirement: {
      minPlan: 'business',
      includedInPlans: ['enterprise'],
    },
    dependencies: ['chat'],
    tabComponent: 'TenantTwitterTab',
    tabPath: 'twitter',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Integração com LinkedIn',
    longDescription: 'Conecte perfis e páginas do LinkedIn, gerencie mensagens e agende posts.',
    icon: Linkedin,
    category: 'social',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    isAvailable: false, // Em breve
    isBeta: true,
    pricing: {
      monthlyPrice: 5990,
      yearlyPrice: 57500,
      trialDays: 7,
      setupFee: 0,
      perUnit: true,
      unitName: 'perfil',
      maxUnits: 5,
    },
    planRequirement: {
      minPlan: 'business',
      includedInPlans: ['enterprise'],
    },
    dependencies: ['chat'],
    tabComponent: 'TenantLinkedinTab',
    tabPath: 'linkedin',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Integração com YouTube',
    longDescription: 'Gerencie comentários do YouTube, responda automaticamente e monitore canais.',
    icon: Youtube,
    category: 'social',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    isAvailable: false, // Em breve
    isBeta: true,
    pricing: {
      monthlyPrice: 4990,
      yearlyPrice: 47900,
      trialDays: 7,
      setupFee: 0,
      perUnit: true,
      unitName: 'canal',
      maxUnits: 3,
    },
    planRequirement: {
      minPlan: 'business',
      includedInPlans: ['enterprise'],
    },
    tabComponent: 'TenantYoutubeTab',
    tabPath: 'youtube',
  },

  // ============ MÓDULOS DE BILLING ============
  {
    id: 'billing',
    name: 'Cobrança',
    description: 'Faturas e pagamentos',
    longDescription: 'Visualize faturas, histórico de pagamentos e gerencie métodos de pagamento.',
    icon: CreditCard,
    category: 'billing',
    version: '1.0.0',
    enabled: true,
    isCore: true,
    isAvailable: true,
    tabComponent: 'TenantBillingTab',
    tabPath: 'billing',
  },

  // ============ MÓDULOS DE SUPORTE ============
  {
    id: 'support',
    name: 'Suporte',
    description: 'Tickets e atendimento',
    longDescription: 'Abra tickets de suporte, acompanhe resoluções e acesse a base de conhecimento.',
    icon: Headphones,
    category: 'support',
    version: '1.0.0',
    enabled: true,
    isCore: true,
    isAvailable: true,
    tabComponent: 'TenantSupportTab',
    tabPath: 'support',
  },

  // ============ MÓDULOS DE ANALYTICS ============
  {
    id: 'reports',
    name: 'Relatórios',
    description: 'Relatórios avançados e exportação',
    longDescription: 'Gere relatórios detalhados, exporte dados em CSV/PDF e acompanhe tendências.',
    icon: BarChart3,
    category: 'analytics',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    isAvailable: true,
    pricing: {
      monthlyPrice: 7990, // R$ 79,90
      yearlyPrice: 76700,
      trialDays: 14,
      setupFee: 0,
      perUnit: false,
    },
    planRequirement: {
      minPlan: 'business',
      includedInPlans: ['business', 'enterprise'],
    },
    tabComponent: 'TenantReportsTab',
    tabPath: 'reports',
  },
];

// ============================================================================
// HELPERS DO CATÁLOGO
// ============================================================================

/**
 * Obtém um módulo pelo ID
 */
export function getModuleFromCatalog(moduleId: string): ExtendedModuleConfig | undefined {
  return MODULE_CATALOG.find(m => m.id === moduleId);
}

/**
 * Obtém todos os módulos de uma categoria
 */
export function getModulesByCategory(category: ModuleDisplayCategory): ExtendedModuleConfig[] {
  return MODULE_CATALOG.filter(m => m.category === category);
}

/**
 * Obtém módulos incluídos em um plano
 */
export function getModulesIncludedInPlan(planSlug: string): ExtendedModuleConfig[] {
  return MODULE_CATALOG.filter(m => 
    m.isCore || m.planRequirement?.includedInPlans.includes(planSlug)
  );
}

/**
 * Obtém módulos disponíveis como add-on para um plano
 */
export function getAddonsForPlan(planSlug: string): ExtendedModuleConfig[] {
  return MODULE_CATALOG.filter(m => 
    !m.isCore && 
    m.isAvailable && 
    m.pricing && 
    !m.planRequirement?.includedInPlans.includes(planSlug)
  );
}

/**
 * Obtém todos os módulos core (essenciais)
 */
export function getCoreModules(): ExtendedModuleConfig[] {
  return MODULE_CATALOG.filter(m => m.isCore);
}

/**
 * Obtém todos os módulos não-core (opcionais)
 */
export function getOptionalModules(): ExtendedModuleConfig[] {
  return MODULE_CATALOG.filter(m => !m.isCore && m.isAvailable);
}

/**
 * Agrupa módulos por categoria
 */
export function getModulesGroupedByCategory(): Record<ModuleDisplayCategory, ExtendedModuleConfig[]> {
  const grouped: Record<ModuleDisplayCategory, ExtendedModuleConfig[]> = {
    essential: [],
    communication: [],
    ai: [],
    social: [],
    billing: [],
    support: [],
    analytics: [],
  };
  
  MODULE_CATALOG.forEach(m => {
    if (grouped[m.category]) {
      grouped[m.category].push(m);
    }
  });
  
  return grouped;
}

/**
 * Verifica se as dependências de um módulo estão satisfeitas
 */
export function checkModuleDependencies(
  moduleId: string, 
  enabledModules: string[]
): { satisfied: boolean; missing: string[] } {
  const module = getModuleFromCatalog(moduleId);
  if (!module?.dependencies) {
    return { satisfied: true, missing: [] };
  }
  
  const missing = module.dependencies.filter(dep => !enabledModules.includes(dep));
  return {
    satisfied: missing.length === 0,
    missing,
  };
}

/**
 * Calcula preço de um módulo com desconto anual
 */
export function calculateModulePrice(
  moduleId: string, 
  billingCycle: 'monthly' | 'yearly',
  quantity: number = 1
): number {
  const module = getModuleFromCatalog(moduleId);
  if (!module?.pricing) return 0;
  
  const basePrice = billingCycle === 'yearly' 
    ? module.pricing.yearlyPrice 
    : module.pricing.monthlyPrice;
  
  return basePrice * quantity;
}
