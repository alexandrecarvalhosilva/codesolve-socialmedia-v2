import { api } from '@/lib/api';

interface PlanChangeHistory {
  tenantId: string;
  tenantName: string;
  changeType: 'upgrade' | 'downgrade';
  fromPlanId: string;
  fromPlanName: string;
  toPlanId: string;
  toPlanName: string;
  fromCycle: string;
  toCycle: string;
  proratedAmount: number;
  creditsApplied: number;
  creditsGenerated: number;
  effectiveDate: string;
  reason: string | null;
  processedBy: string | null;
  stripePaymentIntentId?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface CreditTransaction {
  tenantId: string;
  type: 'earned' | 'spent';
  amount: number;
  description: string;
  source: string;
  referenceId?: string | null;
  expiresAt?: string;
}

// In-memory storage for fallback
const planChangeHistoryStore: PlanChangeHistory[] = [];
const creditTransactionsStore: CreditTransaction[] = [];
const creditBalanceStore: Record<string, number> = {};

export async function addPlanChangeHistory(history: PlanChangeHistory): Promise<void> {
  try {
    await api.post('/billing/plan-change-history', history);
  } catch (error) {
    console.warn('Billing service not available, using local storage:', error);
    planChangeHistoryStore.push(history);
  }
}

export async function getPlanChangeHistory(tenantId: string): Promise<PlanChangeHistory[]> {
  try {
    const response = await api.get(`/billing/plan-change-history?tenantId=${tenantId}`);
    return response.data.history || [];
  } catch (error) {
    console.warn('Billing service not available, using local storage:', error);
    return planChangeHistoryStore.filter(h => h.tenantId === tenantId);
  }
}

export async function addCreditTransaction(
  tenantId: string,
  type: 'earned' | 'spent',
  amount: number,
  description: string,
  source: string,
  referenceId?: string | null,
  expiresAt?: string
): Promise<void> {
  const transaction: CreditTransaction = {
    tenantId,
    type,
    amount,
    description,
    source,
    referenceId,
    expiresAt,
  };

  try {
    await api.post('/billing/credit-transactions', transaction);
    
    // Update local balance
    if (!creditBalanceStore[tenantId]) {
      creditBalanceStore[tenantId] = 0;
    }
    creditBalanceStore[tenantId] += amount;
  } catch (error) {
    console.warn('Billing service not available, using local storage:', error);
    creditTransactionsStore.push(transaction);
    
    // Update local balance
    if (!creditBalanceStore[tenantId]) {
      creditBalanceStore[tenantId] = 0;
    }
    creditBalanceStore[tenantId] += amount;
  }
}

export async function getCreditTransactions(tenantId: string): Promise<CreditTransaction[]> {
  try {
    const response = await api.get(`/billing/credit-transactions?tenantId=${tenantId}`);
    return response.data.transactions || [];
  } catch (error) {
    console.warn('Billing service not available, using local storage:', error);
    return creditTransactionsStore.filter(t => t.tenantId === tenantId);
  }
}

export function getTenantCreditBalance(tenantId: string): number {
  // Try to get from local cache first
  if (creditBalanceStore[tenantId] !== undefined) {
    return creditBalanceStore[tenantId];
  }
  
  // Calculate from transactions
  const transactions = creditTransactionsStore.filter(t => t.tenantId === tenantId);
  const balance = transactions.reduce((sum, t) => sum + t.amount, 0);
  creditBalanceStore[tenantId] = balance;
  
  return balance;
}

export async function fetchTenantCreditBalance(tenantId: string): Promise<number> {
  try {
    const response = await api.get(`/billing/credit-balance?tenantId=${tenantId}`);
    const balance = response.data.balance || 0;
    creditBalanceStore[tenantId] = balance;
    return balance;
  } catch (error) {
    console.warn('Billing service not available, using local storage:', error);
    return getTenantCreditBalance(tenantId);
  }
}
