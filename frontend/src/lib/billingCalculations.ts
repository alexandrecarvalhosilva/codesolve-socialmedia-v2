/**
 * Cálculos de faturamento para upgrade/downgrade de planos
 */

import { BillingPlan, BillingCycle, BILLING_CYCLE_DISCOUNTS } from '@/types/billing';
import { getPlanBySlug } from '@/config/plansConfig';

// ============================================================================
// TIPOS
// ============================================================================

export interface PlanChangeResult {
  type: 'upgrade' | 'downgrade' | 'same';
  currentPlan: BillingPlan;
  newPlan: BillingPlan;
  
  // Cálculos de período restante
  daysRemaining: number;
  daysInPeriod: number;
  percentRemaining: number;
  
  // Valores
  currentPlanValue: number;        // Valor pago pelo período atual
  remainingValue: number;          // Valor não utilizado (crédito)
  newPlanValue: number;            // Valor do novo plano para o período restante
  
  // Resultado final
  proratedAmount: number;          // Valor a cobrar (positivo) ou creditar (negativo)
  effectiveDate: Date;             // Data efetiva da mudança
  nextBillingDate: Date;           // Próxima cobrança
  
  // Detalhamento
  breakdown: ProratedBreakdownItem[];
}

export interface ProratedBreakdownItem {
  description: string;
  amount: number;
  type: 'credit' | 'charge' | 'info';
}

export interface SubscriptionPeriod {
  startDate: Date;
  endDate: Date;
  cycle: BillingCycle;
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Calcula o número de dias entre duas datas
 */
export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.ceil((end.getTime() - start.getTime()) / msPerDay);
}

/**
 * Calcula o preço do plano considerando o ciclo de cobrança
 */
export function getPlanPriceForCycle(plan: BillingPlan, cycle: BillingCycle): number {
  const { discount, months } = BILLING_CYCLE_DISCOUNTS[cycle];
  const totalBeforeDiscount = plan.basePrice * months;
  const discountAmount = totalBeforeDiscount * (discount / 100);
  return totalBeforeDiscount - discountAmount;
}

/**
 * Calcula o preço diário de um plano
 */
export function getDailyPrice(plan: BillingPlan, cycle: BillingCycle): number {
  const totalPrice = getPlanPriceForCycle(plan, cycle);
  const { months } = BILLING_CYCLE_DISCOUNTS[cycle];
  const daysInPeriod = months * 30; // Aproximação
  return totalPrice / daysInPeriod;
}

// ============================================================================
// CÁLCULO DE PRORATION
// ============================================================================

/**
 * Calcula o valor proporcional para mudança de plano
 */
export function calculatePlanChange(
  currentPlanSlug: string,
  newPlanSlug: string,
  period: SubscriptionPeriod,
  changeDate: Date = new Date()
): PlanChangeResult | null {
  const currentPlan = getPlanBySlug(currentPlanSlug);
  const newPlan = getPlanBySlug(newPlanSlug);
  
  if (!currentPlan || !newPlan) {
    return null;
  }
  
  // Determinar tipo de mudança
  let type: 'upgrade' | 'downgrade' | 'same' = 'same';
  if (newPlan.sortOrder > currentPlan.sortOrder) {
    type = 'upgrade';
  } else if (newPlan.sortOrder < currentPlan.sortOrder) {
    type = 'downgrade';
  }
  
  // Calcular dias restantes no período
  const daysInPeriod = daysBetween(period.startDate, period.endDate);
  const daysUsed = daysBetween(period.startDate, changeDate);
  const daysRemaining = Math.max(0, daysInPeriod - daysUsed);
  const percentRemaining = daysRemaining / daysInPeriod;
  
  // Valor pago pelo período atual
  const currentPlanValue = getPlanPriceForCycle(currentPlan, period.cycle);
  
  // Valor não utilizado (crédito)
  const remainingValue = Math.round(currentPlanValue * percentRemaining);
  
  // Valor do novo plano para o período restante
  const newPlanTotal = getPlanPriceForCycle(newPlan, period.cycle);
  const newPlanValue = Math.round(newPlanTotal * percentRemaining);
  
  // Valor a cobrar ou creditar
  const proratedAmount = newPlanValue - remainingValue;
  
  // Breakdown detalhado
  const breakdown: ProratedBreakdownItem[] = [
    {
      description: `Crédito do plano ${currentPlan.name} (${daysRemaining} dias restantes)`,
      amount: -remainingValue,
      type: 'credit'
    },
    {
      description: `Novo plano ${newPlan.name} (${daysRemaining} dias)`,
      amount: newPlanValue,
      type: 'charge'
    }
  ];
  
  // Próxima data de cobrança
  const nextBillingDate = new Date(period.endDate);
  
  return {
    type,
    currentPlan,
    newPlan,
    daysRemaining,
    daysInPeriod,
    percentRemaining,
    currentPlanValue,
    remainingValue,
    newPlanValue,
    proratedAmount,
    effectiveDate: changeDate,
    nextBillingDate,
    breakdown
  };
}

/**
 * Formata o resultado do cálculo para exibição
 */
export function formatPlanChangeResult(result: PlanChangeResult): {
  summary: string;
  action: string;
  amount: string;
  details: string[];
} {
  const formatCents = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(cents / 100);
  };
  
  let summary = '';
  let action = '';
  
  if (result.type === 'upgrade') {
    summary = `Upgrade de ${result.currentPlan.name} para ${result.newPlan.name}`;
    action = result.proratedAmount > 0 
      ? `Cobrar ${formatCents(result.proratedAmount)} proporcional`
      : `Crédito de ${formatCents(Math.abs(result.proratedAmount))}`;
  } else if (result.type === 'downgrade') {
    summary = `Downgrade de ${result.currentPlan.name} para ${result.newPlan.name}`;
    action = `Crédito de ${formatCents(Math.abs(result.proratedAmount))} para próximas faturas`;
  } else {
    summary = 'Sem alteração de plano';
    action = 'Nenhuma ação necessária';
  }
  
  const details = [
    `${result.daysRemaining} dias restantes no período atual`,
    `Crédito do plano atual: ${formatCents(result.remainingValue)}`,
    `Valor proporcional do novo plano: ${formatCents(result.newPlanValue)}`,
    `Próxima cobrança: ${result.nextBillingDate.toLocaleDateString('pt-BR')}`
  ];
  
  return {
    summary,
    action,
    amount: formatCents(Math.abs(result.proratedAmount)),
    details
  };
}

/**
 * Calcula estimativa de economia ao mudar para ciclo anual
 */
export function calculateAnnualSavings(plan: BillingPlan): {
  monthlyCost: number;
  annualCost: number;
  savings: number;
  savingsPercent: number;
} {
  const monthlyTotal = plan.basePrice * 12;
  const annualCost = getPlanPriceForCycle(plan, 'annual');
  const savings = monthlyTotal - annualCost;
  const savingsPercent = (savings / monthlyTotal) * 100;
  
  return {
    monthlyCost: monthlyTotal,
    annualCost,
    savings,
    savingsPercent
  };
}

/**
 * Verifica se um upgrade é elegível (sem período de carência)
 */
export function isUpgradeEligible(
  currentPlanSlug: string,
  newPlanSlug: string,
  subscriptionCreatedAt: Date,
  minDaysForUpgrade: number = 0
): { eligible: boolean; reason?: string } {
  const currentPlan = getPlanBySlug(currentPlanSlug);
  const newPlan = getPlanBySlug(newPlanSlug);
  
  if (!currentPlan || !newPlan) {
    return { eligible: false, reason: 'Plano não encontrado' };
  }
  
  if (newPlan.sortOrder <= currentPlan.sortOrder) {
    // Para downgrade, verificar período mínimo
    const daysSinceCreation = daysBetween(subscriptionCreatedAt, new Date());
    if (daysSinceCreation < minDaysForUpgrade) {
      return { 
        eligible: false, 
        reason: `Aguarde ${minDaysForUpgrade - daysSinceCreation} dias para fazer downgrade` 
      };
    }
  }
  
  return { eligible: true };
}
