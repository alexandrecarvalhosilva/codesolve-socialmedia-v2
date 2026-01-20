// ============================================================================
// TYPES - Sistema de Módulos por Tenant
// ============================================================================

import { type LucideIcon } from 'lucide-react';

// Status de um módulo para o tenant
export type TenantModuleStatus = 'active' | 'inactive' | 'trial' | 'expired';

// Fonte de acesso ao módulo
export type ModuleAccessSource = 'plan' | 'addon' | 'trial' | 'manual';

// Categoria de módulos para exibição
export type ModuleDisplayCategory = 'essential' | 'communication' | 'ai' | 'social' | 'billing' | 'support' | 'analytics';

// ============================================================================
// CONFIGURAÇÃO DE MÓDULO PARA VENDA
// ============================================================================

export interface ModulePricing {
  monthlyPrice: number;      // Preço mensal em centavos (R$ 49,90 = 4990)
  yearlyPrice: number;       // Preço anual em centavos (com desconto)
  trialDays: number;         // Dias de trial (0 = sem trial)
  setupFee: number;          // Taxa de setup em centavos
  perUnit: boolean;          // Cobrança por unidade (ex: por instância)
  unitName?: string;         // Nome da unidade (ex: "instância", "usuário")
  maxUnits?: number;         // Máximo de unidades
}

export interface ModulePlanRequirement {
  minPlan: string;           // Plano mínimo (slug): 'starter' | 'professional' | 'business' | 'enterprise'
  includedInPlans: string[]; // Planos que incluem este módulo
}

// ============================================================================
// MÓDULO ESTENDIDO COM INFORMAÇÕES DE VENDA
// ============================================================================

export interface ExtendedModuleConfig {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  icon: LucideIcon;
  category: ModuleDisplayCategory;
  version: string;
  
  // Flags de status
  enabled: boolean;          // Habilitado globalmente no sistema
  isCore: boolean;           // Módulo essencial (não pode desativar)
  isAvailable: boolean;      // Disponível para compra/ativação
  isBeta?: boolean;          // Em beta
  isNew?: boolean;           // Novo (badge)
  isPopular?: boolean;       // Popular (badge)
  
  // Pricing e planos
  pricing?: ModulePricing;
  planRequirement?: ModulePlanRequirement;
  
  // Dependências
  dependencies?: string[];
  
  // Componente de aba (para renderização dinâmica)
  tabComponent?: string;     // Nome do componente da aba
  tabPath?: string;          // Path na navegação
}

// ============================================================================
// ESTADO DO MÓDULO PARA UM TENANT
// ============================================================================

export interface TenantModuleState {
  moduleId: string;
  status: TenantModuleStatus;
  accessSource: ModuleAccessSource;
  activatedAt: string;
  expiresAt?: string;
  quantity: number;
  settings?: Record<string, unknown>;
}

// ============================================================================
// CONFIGURAÇÃO DE MÓDULOS DO TENANT
// ============================================================================

export interface TenantModulesConfig {
  tenantId: string;
  planId: string;
  modules: TenantModuleState[];
  updatedAt: string;
  updatedBy: string;
}

// ============================================================================
// HELPERS
// ============================================================================

export function formatModulePrice(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

export function getModuleStatusLabel(status: TenantModuleStatus): string {
  const labels: Record<TenantModuleStatus, string> = {
    active: 'Ativo',
    inactive: 'Inativo',
    trial: 'Trial',
    expired: 'Expirado',
  };
  return labels[status];
}

export function getModuleStatusColor(status: TenantModuleStatus): string {
  const colors: Record<TenantModuleStatus, string> = {
    active: 'bg-cs-success',
    inactive: 'bg-muted',
    trial: 'bg-cs-warning',
    expired: 'bg-cs-error',
  };
  return colors[status];
}

export function getAccessSourceLabel(source: ModuleAccessSource): string {
  const labels: Record<ModuleAccessSource, string> = {
    plan: 'Incluso no Plano',
    addon: 'Add-on',
    trial: 'Período de Teste',
    manual: 'Ativação Manual',
  };
  return labels[source];
}

export function getCategoryLabel(category: ModuleDisplayCategory): string {
  const labels: Record<ModuleDisplayCategory, string> = {
    essential: 'Essenciais',
    communication: 'Comunicação',
    ai: 'Inteligência Artificial',
    social: 'Redes Sociais',
    billing: 'Faturamento',
    support: 'Suporte',
    analytics: 'Analytics',
  };
  return labels[category];
}

export function getCategoryIcon(category: ModuleDisplayCategory): string {
  const icons: Record<ModuleDisplayCategory, string> = {
    essential: 'Shield',
    communication: 'MessageSquare',
    ai: 'Brain',
    social: 'Share2',
    billing: 'CreditCard',
    support: 'Headphones',
    analytics: 'BarChart3',
  };
  return icons[category];
}
