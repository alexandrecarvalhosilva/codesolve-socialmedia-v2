/**
 * Mock data para histórico de mudanças de plano
 */

import { PlanChangeHistory, CreditTransaction } from '@/types/billing';

// ============================================================================
// HISTÓRICO DE MUDANÇAS DE PLANO
// ============================================================================
export const mockPlanChangeHistory: PlanChangeHistory[] = [
  {
    id: 'pch-1',
    tenantId: '1',
    tenantName: 'SIX BLADES - LAGO OESTE',
    changeType: 'upgrade',
    fromPlanId: 'plan-starter',
    fromPlanName: 'Starter',
    toPlanId: 'plan-professional',
    toPlanName: 'Professional',
    fromCycle: 'monthly',
    toCycle: 'monthly',
    proratedAmount: 9850, // R$ 98,50
    creditsApplied: 0,
    creditsGenerated: 0,
    effectiveDate: '2025-06-15T10:30:00Z',
    reason: 'Necessidade de mais mensagens e instâncias',
    processedBy: 'admin-1',
    stripePaymentIntentId: 'pi_mock_123456',
    status: 'completed',
    createdAt: '2025-06-15T10:30:00Z',
  },
  {
    id: 'pch-2',
    tenantId: '2',
    tenantName: 'Academia XYZ',
    changeType: 'upgrade',
    fromPlanId: 'plan-professional',
    fromPlanName: 'Professional',
    toPlanId: 'plan-business',
    toPlanName: 'Business',
    fromCycle: 'monthly',
    toCycle: 'annual',
    proratedAmount: 381120, // R$ 3.811,20 (anual com desconto)
    creditsApplied: 8500,
    creditsGenerated: 0,
    effectiveDate: '2025-06-01T00:00:00Z',
    reason: 'Expansão da operação',
    processedBy: 'admin-1',
    stripePaymentIntentId: 'pi_mock_234567',
    status: 'completed',
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'pch-3',
    tenantId: '6',
    tenantName: 'Salão Beauty',
    changeType: 'cancellation',
    fromPlanId: 'plan-starter',
    fromPlanName: 'Starter',
    toPlanId: null,
    toPlanName: null,
    fromCycle: 'monthly',
    toCycle: null,
    proratedAmount: 0,
    creditsApplied: 0,
    creditsGenerated: 2500, // R$ 25,00 de crédito gerado
    effectiveDate: '2025-12-20T00:00:00Z',
    reason: 'Custos altos',
    processedBy: null,
    stripePaymentIntentId: null,
    status: 'completed',
    createdAt: '2025-12-20T00:00:00Z',
  },
  {
    id: 'pch-4',
    tenantId: '4',
    tenantName: 'Clínica 123',
    changeType: 'renewal',
    fromPlanId: 'plan-starter',
    fromPlanName: 'Starter',
    toPlanId: 'plan-starter',
    toPlanName: 'Starter',
    fromCycle: 'monthly',
    toCycle: 'monthly',
    proratedAmount: 9700,
    creditsApplied: 0,
    creditsGenerated: 0,
    effectiveDate: '2026-01-05T00:00:00Z',
    reason: null,
    processedBy: null,
    stripePaymentIntentId: 'pi_mock_345678',
    status: 'completed',
    createdAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'pch-5',
    tenantId: '5',
    tenantName: 'Imobiliária Premium',
    changeType: 'upgrade',
    fromPlanId: 'plan-business',
    fromPlanName: 'Business',
    toPlanId: 'plan-enterprise',
    toPlanName: 'Enterprise',
    fromCycle: 'annual',
    toCycle: 'annual',
    proratedAmount: 450000, // R$ 4.500,00 proporcional
    creditsApplied: 50000,
    creditsGenerated: 0,
    effectiveDate: '2025-07-01T00:00:00Z',
    reason: 'Parceria estratégica',
    processedBy: 'admin-1',
    stripePaymentIntentId: 'pi_mock_456789',
    status: 'completed',
    createdAt: '2025-07-01T00:00:00Z',
  },
  {
    id: 'pch-6',
    tenantId: '3',
    tenantName: 'Pizzaria ABC',
    changeType: 'downgrade',
    fromPlanId: 'plan-business',
    fromPlanName: 'Business',
    toPlanId: 'plan-professional',
    toPlanName: 'Professional',
    fromCycle: 'monthly',
    toCycle: 'monthly',
    proratedAmount: 0,
    creditsApplied: 0,
    creditsGenerated: 15000, // R$ 150,00 de crédito
    effectiveDate: '2025-10-01T00:00:00Z',
    reason: 'Redução de custos',
    processedBy: null,
    stripePaymentIntentId: null,
    status: 'completed',
    createdAt: '2025-10-01T00:00:00Z',
  },
];

// ============================================================================
// TRANSAÇÕES DE CRÉDITO
// ============================================================================
export const mockCreditTransactions: CreditTransaction[] = [
  {
    id: 'ct-1',
    tenantId: '2',
    type: 'earned',
    amount: 8500,
    balanceBefore: 0,
    balanceAfter: 8500,
    description: 'Crédito promocional de boas-vindas',
    referenceType: 'promotion',
    referenceId: null,
    expiresAt: '2026-06-01T00:00:00Z',
    createdAt: '2025-05-01T00:00:00Z',
  },
  {
    id: 'ct-2',
    tenantId: '2',
    type: 'spent',
    amount: -8500,
    balanceBefore: 8500,
    balanceAfter: 0,
    description: 'Crédito aplicado no upgrade para Business anual',
    referenceType: 'plan_change',
    referenceId: 'pch-2',
    expiresAt: null,
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'ct-3',
    tenantId: '6',
    type: 'earned',
    amount: 2500,
    balanceBefore: 0,
    balanceAfter: 2500,
    description: 'Crédito por cancelamento (dias restantes)',
    referenceType: 'cancellation',
    referenceId: 'pch-3',
    expiresAt: '2026-12-20T00:00:00Z',
    createdAt: '2025-12-20T00:00:00Z',
  },
  {
    id: 'ct-4',
    tenantId: '5',
    type: 'earned',
    amount: 50000,
    balanceBefore: 0,
    balanceAfter: 50000,
    description: 'Crédito promocional parceria estratégica',
    referenceType: 'promotion',
    referenceId: null,
    expiresAt: '2026-07-01T00:00:00Z',
    createdAt: '2025-06-15T00:00:00Z',
  },
  {
    id: 'ct-5',
    tenantId: '5',
    type: 'spent',
    amount: -50000,
    balanceBefore: 50000,
    balanceAfter: 0,
    description: 'Crédito aplicado no upgrade para Enterprise',
    referenceType: 'plan_change',
    referenceId: 'pch-5',
    expiresAt: null,
    createdAt: '2025-07-01T00:00:00Z',
  },
  {
    id: 'ct-6',
    tenantId: '3',
    type: 'earned',
    amount: 15000,
    balanceBefore: 0,
    balanceAfter: 15000,
    description: 'Crédito por downgrade (valor proporcional)',
    referenceType: 'plan_change',
    referenceId: 'pch-6',
    expiresAt: '2026-10-01T00:00:00Z',
    createdAt: '2025-10-01T00:00:00Z',
  },
  {
    id: 'ct-7',
    tenantId: '3',
    type: 'spent',
    amount: -15000,
    balanceBefore: 15000,
    balanceAfter: 0,
    description: 'Crédito aplicado em fatura mensal',
    referenceType: 'plan_change',
    referenceId: null,
    expiresAt: null,
    createdAt: '2025-11-01T00:00:00Z',
  },
];

// ============================================================================
// SALDOS DE CRÉDITO POR TENANT
// ============================================================================
export const mockTenantCredits: Record<string, { balance: number; currency: string; lastUpdated: string }> = {
  '1': { balance: 0, currency: 'BRL', lastUpdated: '2026-01-01T00:00:00Z' },
  '2': { balance: 0, currency: 'BRL', lastUpdated: '2025-06-01T00:00:00Z' },
  '3': { balance: 0, currency: 'BRL', lastUpdated: '2025-11-01T00:00:00Z' },
  '4': { balance: 0, currency: 'BRL', lastUpdated: '2026-01-05T00:00:00Z' },
  '5': { balance: 0, currency: 'BRL', lastUpdated: '2025-07-01T00:00:00Z' },
  '6': { balance: 2500, currency: 'BRL', lastUpdated: '2025-12-20T00:00:00Z' },
};

// ============================================================================
// HELPERS
// ============================================================================
export function getPlanChangeHistoryByTenant(tenantId: string): PlanChangeHistory[] {
  return mockPlanChangeHistory
    .filter(h => h.tenantId === tenantId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getCreditTransactionsByTenant(tenantId: string): CreditTransaction[] {
  return mockCreditTransactions
    .filter(t => t.tenantId === tenantId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getTenantCreditBalance(tenantId: string): number {
  return mockTenantCredits[tenantId]?.balance || 0;
}

export function addCreditTransaction(
  tenantId: string,
  type: CreditTransaction['type'],
  amount: number,
  description: string,
  referenceType: CreditTransaction['referenceType'],
  referenceId: string | null = null,
  expiresAt: string | null = null
): CreditTransaction {
  const currentBalance = getTenantCreditBalance(tenantId);
  const newBalance = currentBalance + amount;
  
  const transaction: CreditTransaction = {
    id: `ct-${Date.now()}`,
    tenantId,
    type,
    amount,
    balanceBefore: currentBalance,
    balanceAfter: newBalance,
    description,
    referenceType,
    referenceId,
    expiresAt,
    createdAt: new Date().toISOString(),
  };
  
  mockCreditTransactions.unshift(transaction);
  mockTenantCredits[tenantId] = {
    balance: newBalance,
    currency: 'BRL',
    lastUpdated: new Date().toISOString(),
  };
  
  return transaction;
}

export function addPlanChangeHistory(history: Omit<PlanChangeHistory, 'id' | 'createdAt'>): PlanChangeHistory {
  const newHistory: PlanChangeHistory = {
    ...history,
    id: `pch-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  mockPlanChangeHistory.unshift(newHistory);
  return newHistory;
}