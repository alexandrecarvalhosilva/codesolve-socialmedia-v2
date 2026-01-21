import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import type { 
  BillingPlan, 
  BillingModule, 
  Subscription, 
  Invoice,
  PaginationMeta 
} from '@/lib/apiTypes';

// ============================================================================
// PLANS HOOK
// ============================================================================

interface UsePlansOptions {
  includeInactive?: boolean;
}

interface UsePlansReturn {
  plans: BillingPlan[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePlans(options: UsePlansOptions = {}): UsePlansReturn {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/billing/plans', {
        params: {
          includeInactive: options.includeInactive,
        },
      });
      if (response.data.success) {
        setPlans(response.data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar planos'));
    } finally {
      setIsLoading(false);
    }
  }, [options.includeInactive]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, isLoading, error, refetch: fetchPlans };
}

// ============================================================================
// MODULES HOOK
// ============================================================================

interface UseModulesOptions {
  category?: string;
  includeInactive?: boolean;
}

interface UseModulesReturn {
  modules: BillingModule[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useModules(options: UseModulesOptions = {}): UseModulesReturn {
  const [modules, setModules] = useState<BillingModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/billing/modules', {
        params: {
          category: options.category,
          includeInactive: options.includeInactive,
        },
      });
      if (response.data.success) {
        setModules(response.data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar módulos'));
    } finally {
      setIsLoading(false);
    }
  }, [options.category, options.includeInactive]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return { modules, isLoading, error, refetch: fetchModules };
}

// ============================================================================
// SUBSCRIPTIONS HOOK
// ============================================================================

interface UseSubscriptionsOptions {
  tenantId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface UseSubscriptionsReturn {
  subscriptions: Subscription[];
  isLoading: boolean;
  error: Error | null;
  meta: PaginationMeta | null;
  refetch: () => void;
}

export function useSubscriptions(options: UseSubscriptionsOptions = {}): UseSubscriptionsReturn {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/billing/subscriptions', {
        params: {
          tenantId: options.tenantId,
          status: options.status,
          page: options.page || 1,
          limit: options.limit || 20,
        },
      });
      if (response.data.success) {
        setSubscriptions(response.data.data || []);
        setMeta(response.data.meta || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar assinaturas'));
    } finally {
      setIsLoading(false);
    }
  }, [options.tenantId, options.status, options.page, options.limit]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  return { subscriptions, isLoading, error, meta, refetch: fetchSubscriptions };
}

// ============================================================================
// SUBSCRIPTION BY ID HOOK
// ============================================================================

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useSubscriptionById(id: string | undefined): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    if (!id) {
      setSubscription(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get(`/billing/subscriptions/${id}`);
      if (response.data.success) {
        setSubscription(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar assinatura'));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return { subscription, isLoading, error, refetch: fetchSubscription, fetchSubscription };
}

// ============================================================================
// CURRENT TENANT SUBSCRIPTION HOOK (for BillingSummaryCard)
// ============================================================================

interface CurrentSubscription {
  planName: string;
  amount: number;
  nextBillingDate?: string;
  usage?: {
    messages: number;
    messagesLimit: number;
    instances: number;
    instancesLimit: number;
  };
}

interface UseCurrentSubscriptionReturn {
  subscription: CurrentSubscription | null;
  isLoading: boolean;
  error: Error | null;
  fetchSubscription: () => void;
}

export function useSubscription(): UseCurrentSubscriptionReturn {
  const [subscription, setSubscription] = useState<CurrentSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/billing/my-subscription');
      if (response.success && response.data) {
        const data = response.data as any;
        setSubscription({
          planName: data.plan?.name || 'N/A',
          amount: data.plan?.priceMonthly || 0,
          nextBillingDate: data.currentPeriodEnd,
          usage: data.usage,
        });
      }
    } catch (err) {
      // Fallback - no subscription
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  return { subscription, isLoading, error, fetchSubscription };
}

// ============================================================================
// INVOICES HOOK
// ============================================================================

interface UseInvoicesOptions {
  tenantId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface UseInvoicesReturn {
  invoices: Invoice[];
  isLoading: boolean;
  error: Error | null;
  meta: PaginationMeta | null;
  refetch: () => void;
}

export function useInvoices(options: UseInvoicesOptions = {}): UseInvoicesReturn {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/billing/invoices', {
        params: {
          tenantId: options.tenantId,
          status: options.status,
          page: options.page || 1,
          limit: options.limit || 20,
        },
      });
      if (response.data.success) {
        setInvoices(response.data.data || []);
        setMeta(response.data.meta || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar faturas'));
    } finally {
      setIsLoading(false);
    }
  }, [options.tenantId, options.status, options.page, options.limit]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, isLoading, error, meta, refetch: fetchInvoices };
}

// ============================================================================
// CREATE SUBSCRIPTION HOOK
// ============================================================================

interface CreateSubscriptionData {
  tenantId: string;
  planId: string;
  billingCycle: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
}

interface UseCreateSubscriptionOptions {
  onSuccess?: (subscription: Subscription) => void;
  onError?: (error: Error) => void;
}

interface UseCreateSubscriptionReturn {
  createSubscription: (data: CreateSubscriptionData) => Promise<void>;
  isCreating: boolean;
}

export function useCreateSubscription(options: UseCreateSubscriptionOptions = {}): UseCreateSubscriptionReturn {
  const [isCreating, setIsCreating] = useState(false);

  const createSubscription = useCallback(async (data: CreateSubscriptionData) => {
    try {
      setIsCreating(true);
      const response = await api.post('/billing/subscriptions', data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar assinatura');
      options.onError?.(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [options]);

  return { createSubscription, isCreating };
}

// ============================================================================
// CANCEL SUBSCRIPTION HOOK
// ============================================================================

interface UseCancelSubscriptionOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseCancelSubscriptionReturn {
  cancelSubscription: (id: string) => Promise<void>;
  isCanceling: boolean;
}

export function useCancelSubscription(options: UseCancelSubscriptionOptions = {}): UseCancelSubscriptionReturn {
  const [isCanceling, setIsCanceling] = useState(false);

  const cancelSubscription = useCallback(async (id: string) => {
    try {
      setIsCanceling(true);
      const response = await api.post(`/billing/subscriptions/${id}/cancel`);
      if (response.data.success) {
        options.onSuccess?.();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao cancelar assinatura');
      options.onError?.(error);
      throw error;
    } finally {
      setIsCanceling(false);
    }
  }, [options]);

  return { cancelSubscription, isCanceling };
}

// ============================================================================
// CHANGE PLAN HOOK
// ============================================================================

interface ChangePlanData {
  planId: string;
  billingCycle?: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
}

interface UseChangePlanOptions {
  onSuccess?: (subscription: Subscription) => void;
  onError?: (error: Error) => void;
}

interface UseChangePlanReturn {
  changePlan: (subscriptionId: string, data: ChangePlanData) => Promise<void>;
  isChanging: boolean;
}

export function useChangePlan(options: UseChangePlanOptions = {}): UseChangePlanReturn {
  const [isChanging, setIsChanging] = useState(false);

  const changePlan = useCallback(async (subscriptionId: string, data: ChangePlanData) => {
    try {
      setIsChanging(true);
      const response = await api.post(`/billing/subscriptions/${subscriptionId}/change-plan`, data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao alterar plano');
      options.onError?.(error);
      throw error;
    } finally {
      setIsChanging(false);
    }
  }, [options]);

  return { changePlan, isChanging };
}

// ============================================================================
// TENANT USAGE HOOK
// ============================================================================

interface TenantUsage {
  conversations: { used: number; limit: number; percentage: number };
  messages: { used: number; limit: number; percentage: number };
  whatsappInstances: { used: number; limit: number; percentage: number };
  users: { used: number; limit: number; percentage: number };
  automations: { used: number; limit: number; percentage: number };
}

interface UseTenantUsageReturn {
  usage: TenantUsage | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useTenantUsage(tenantId?: string): UseTenantUsageReturn {
  const [usage, setUsage] = useState<TenantUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsage = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const endpoint = tenantId 
        ? `/billing/tenants/${tenantId}/usage`
        : '/billing/usage';
      const response = await api.get(endpoint);
      if (response.data.success) {
        setUsage(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar uso'));
    } finally {
      setIsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return { usage, isLoading, error, refetch: fetchUsage };
}

// ============================================================================
// COUPONS HOOK (SuperAdmin)
// ============================================================================

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  validFrom?: string;
  validUntil?: string;
  applicablePlans: string[];
  isActive: boolean;
  createdAt: string;
}

interface UseCouponsOptions {
  page?: number;
  limit?: number;
  active?: boolean;
}

interface UseCouponsReturn {
  coupons: Coupon[];
  isLoading: boolean;
  error: Error | null;
  meta: PaginationMeta | null;
  refetch: () => void;
  createCoupon: (data: Partial<Coupon>) => Promise<Coupon>;
  updateCoupon: (id: string, data: Partial<Coupon>) => Promise<Coupon>;
  deleteCoupon: (id: string) => Promise<void>;
  validateCoupon: (code: string, planId?: string) => Promise<any>;
}

export function useCoupons(options: UseCouponsOptions = {}): UseCouponsReturn {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchCoupons = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/billing/coupons', {
        params: {
          page: options.page || 1,
          limit: options.limit || 20,
          active: options.active,
        },
      });
      if (response.data.success) {
        setCoupons(response.data.data?.items || []);
        setMeta({
          total: response.data.data?.total || 0,
          page: response.data.data?.page || 1,
          limit: response.data.data?.limit || 20,
          hasMore: response.data.data?.hasMore || false,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar cupons'));
    } finally {
      setIsLoading(false);
    }
  }, [options.page, options.limit, options.active]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const createCoupon = useCallback(async (data: Partial<Coupon>) => {
    const response = await api.post('/billing/coupons', data);
    if (response.data.success) {
      await fetchCoupons();
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Erro ao criar cupom');
  }, [fetchCoupons]);

  const updateCoupon = useCallback(async (id: string, data: Partial<Coupon>) => {
    const response = await api.put(`/billing/coupons/${id}`, data);
    if (response.data.success) {
      await fetchCoupons();
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Erro ao atualizar cupom');
  }, [fetchCoupons]);

  const deleteCoupon = useCallback(async (id: string) => {
    const response = await api.delete(`/billing/coupons/${id}`);
    if (response.data.success) {
      await fetchCoupons();
      return;
    }
    throw new Error(response.data.error?.message || 'Erro ao remover cupom');
  }, [fetchCoupons]);

  const validateCoupon = useCallback(async (code: string, planId?: string) => {
    const response = await api.post('/billing/coupons/validate', { code, planId });
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Cupom inválido');
  }, []);

  return { coupons, isLoading, error, meta, refetch: fetchCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
}

// ============================================================================
// PAYMENT METHODS HOOK
// ============================================================================

interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

interface UsePaymentMethodsReturn {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  addPaymentMethod: (type: string, token: string, setAsDefault?: boolean) => Promise<PaymentMethod>;
  removePaymentMethod: (id: string) => Promise<void>;
}

export function usePaymentMethods(): UsePaymentMethodsReturn {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/billing/payment-methods');
      if (response.data.success) {
        setPaymentMethods(response.data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar métodos de pagamento'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const addPaymentMethod = useCallback(async (type: string, token: string, setAsDefault?: boolean) => {
    const response = await api.post('/billing/payment-methods', { type, token, setAsDefault });
    if (response.data.success) {
      await fetchPaymentMethods();
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Erro ao adicionar método de pagamento');
  }, [fetchPaymentMethods]);

  const removePaymentMethod = useCallback(async (id: string) => {
    const response = await api.delete(`/billing/payment-methods/${id}`);
    if (response.data.success) {
      await fetchPaymentMethods();
      return;
    }
    throw new Error(response.data.error?.message || 'Erro ao remover método de pagamento');
  }, [fetchPaymentMethods]);

  return { paymentMethods, isLoading, error, refetch: fetchPaymentMethods, addPaymentMethod, removePaymentMethod };
}

// ============================================================================
// CHECKOUT HOOK
// ============================================================================

interface CheckoutData {
  planId: string;
  cycle: string;
  paymentMethod: string;
  successUrl: string;
  cancelUrl: string;
  couponCode?: string;
}

interface CheckoutResult {
  checkoutId: string;
  provider: string;
  plan: { id: string; name: string; price: number };
  cycle: string;
  months: number;
  discount: number;
  couponApplied: string | null;
  total: number;
  checkoutUrl: string;
}

interface UseCheckoutReturn {
  createCheckout: (data: CheckoutData) => Promise<CheckoutResult>;
  isCreating: boolean;
  error: Error | null;
}

export function useCheckout(): UseCheckoutReturn {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createCheckout = useCallback(async (data: CheckoutData): Promise<CheckoutResult> => {
    try {
      setIsCreating(true);
      setError(null);
      const response = await api.post('/billing/checkout', data);
      if (response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data.error?.message || 'Erro ao criar checkout');
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar checkout');
      setError(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return { createCheckout, isCreating, error };
}

// ============================================================================
// ALL PLANS HOOK (SuperAdmin)
// ============================================================================

interface UseAllPlansReturn {
  plans: BillingPlan[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createPlan: (data: Partial<BillingPlan>) => Promise<BillingPlan>;
  updatePlan: (id: string, data: Partial<BillingPlan>) => Promise<BillingPlan>;
}

export function useAllPlans(): UseAllPlansReturn {
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/billing/plans/all');
      if (response.data.success) {
        setPlans(response.data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar planos'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = useCallback(async (data: Partial<BillingPlan>) => {
    const response = await api.post('/billing/plans', data);
    if (response.data.success) {
      await fetchPlans();
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Erro ao criar plano');
  }, [fetchPlans]);

  const updatePlan = useCallback(async (id: string, data: Partial<BillingPlan>) => {
    const response = await api.put(`/billing/plans/${id}`, data);
    if (response.data.success) {
      await fetchPlans();
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Erro ao atualizar plano');
  }, [fetchPlans]);

  return { plans, isLoading, error, refetch: fetchPlans, createPlan, updatePlan };
}

// ============================================================================
// ALL MODULES HOOK (SuperAdmin)
// ============================================================================

interface UseAllModulesReturn {
  modules: BillingModule[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  createModule: (data: Partial<BillingModule>) => Promise<BillingModule>;
  updateModule: (id: string, data: Partial<BillingModule>) => Promise<BillingModule>;
}

export function useAllModules(): UseAllModulesReturn {
  const [modules, setModules] = useState<BillingModule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/billing/modules/all');
      if (response.data.success) {
        setModules(response.data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar módulos'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  const createModule = useCallback(async (data: Partial<BillingModule>) => {
    const response = await api.post('/billing/modules', data);
    if (response.data.success) {
      await fetchModules();
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Erro ao criar módulo');
  }, [fetchModules]);

  const updateModule = useCallback(async (id: string, data: Partial<BillingModule>) => {
    const response = await api.put(`/billing/modules/${id}`, data);
    if (response.data.success) {
      await fetchModules();
      return response.data.data;
    }
    throw new Error(response.data.error?.message || 'Erro ao atualizar módulo');
  }, [fetchModules]);

  return { modules, isLoading, error, refetch: fetchModules, createModule, updateModule };
}


// ============================================================================
// FINANCIAL KPIs HOOK
// ============================================================================

interface FinancialKPIs {
  mrr: number;
  mrrGrowth: number;
  activeSubscriptions: number;
  trialSubscriptions: number;
  churnRate: number;
  pendingRevenue: number;
}

interface UseFinancialKPIsReturn {
  kpis: FinancialKPIs | null;
  isLoading: boolean;
  fetchKPIs: () => Promise<void>;
}

export function useFinancialKPIs(): UseFinancialKPIsReturn {
  const [kpis, setKpis] = useState<FinancialKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchKPIs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/reports/financial');
      if (response.success && response.data) {
        const data = response.data as any;
        setKpis({
          mrr: data.kpis?.mrr || 0,
          mrrGrowth: data.kpis?.mrrGrowth || 0,
          activeSubscriptions: data.kpis?.activeSubscriptions || 0,
          trialSubscriptions: data.kpis?.trialSubscriptions || 0,
          churnRate: data.kpis?.churnRate || 0,
          pendingRevenue: data.kpis?.pendingRevenue || 0,
        });
      }
    } catch (error) {
      // Fallback data
      setKpis({
        mrr: 0,
        mrrGrowth: 0,
        activeSubscriptions: 0,
        trialSubscriptions: 0,
        churnRate: 0,
        pendingRevenue: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { kpis, isLoading, fetchKPIs };
}

// ============================================================================
// MRR DATA HOOK
// ============================================================================

interface MrrDataPoint {
  month: string;
  revenue: number;
}

interface UseMrrDataReturn {
  data: MrrDataPoint[];
  isLoading: boolean;
  fetchMrrData: () => Promise<void>;
}

export function useMrrData(): UseMrrDataReturn {
  const [data, setData] = useState<MrrDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMrrData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/reports/mrr');
      if (response.success && response.data) {
        const mrrData = (response.data as any).mrrByMonth || [];
        setData(mrrData.map((item: any) => ({
          month: item.month,
          revenue: item.mrr || 0,
        })));
      }
    } catch (error) {
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, fetchMrrData };
}

// ============================================================================
// VALIDATE COUPON HOOK
// ============================================================================

interface ValidateCouponResult {
  valid: boolean;
  message?: string;
  discountValue?: number;
  discountType?: 'percent' | 'fixed';
}

interface UseValidateCouponReturn {
  validateCoupon: (code: string, subtotal?: number) => Promise<ValidateCouponResult>;
  isValidating: boolean;
}

export function useValidateCoupon(): UseValidateCouponReturn {
  const [isValidating, setIsValidating] = useState(false);

  const validateCoupon = useCallback(async (code: string, subtotal?: number): Promise<ValidateCouponResult> => {
    setIsValidating(true);
    try {
      const response = await api.post('/billing/coupons/validate', { code, subtotal });
      if (response.data.success) {
        return {
          valid: true,
          discountValue: response.data.data.discountValue,
          discountType: response.data.data.discountType,
        };
      }
      return {
        valid: false,
        message: response.data.error?.message || 'Cupom inválido',
      };
    } catch (error: any) {
      return {
        valid: false,
        message: error.response?.data?.error?.message || 'Erro ao validar cupom',
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  return { validateCoupon, isValidating };
}

// ============================================================================
// PAY INVOICE HOOK
// ============================================================================

interface UsePayInvoiceOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UsePayInvoiceReturn {
  payInvoice: (invoiceId: string, paymentMethodId?: string) => Promise<void>;
  isPaying: boolean;
}

export function usePayInvoice(options: UsePayInvoiceOptions = {}): UsePayInvoiceReturn {
  const [isPaying, setIsPaying] = useState(false);

  const payInvoice = useCallback(async (invoiceId: string, paymentMethodId?: string) => {
    try {
      setIsPaying(true);
      const response = await api.post(`/billing/invoices/${invoiceId}/pay`, { paymentMethodId });
      if (response.data.success) {
        options.onSuccess?.();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao pagar fatura');
      options.onError?.(error);
      throw error;
    } finally {
      setIsPaying(false);
    }
  }, [options]);

  return { payInvoice, isPaying };
}

// ============================================================================
// CREATE/UPDATE/DELETE COUPON HOOKS
// ============================================================================

interface UseCreateCouponOptions {
  onSuccess?: (coupon: any) => void;
  onError?: (error: Error) => void;
}

export function useCreateCoupon(options: UseCreateCouponOptions = {}) {
  const [isCreating, setIsCreating] = useState(false);

  const createCoupon = useCallback(async (data: any) => {
    try {
      setIsCreating(true);
      const response = await api.post('/billing/coupons', data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar cupom');
      options.onError?.(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [options]);

  return { createCoupon, isCreating };
}

interface UseUpdateCouponOptions {
  onSuccess?: (coupon: any) => void;
  onError?: (error: Error) => void;
}

export function useUpdateCoupon(options: UseUpdateCouponOptions = {}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateCoupon = useCallback(async (id: string, data: any) => {
    try {
      setIsUpdating(true);
      const response = await api.put(`/billing/coupons/${id}`, data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar cupom');
      options.onError?.(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [options]);

  return { updateCoupon, isUpdating };
}

interface UseDeleteCouponOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDeleteCoupon(options: UseDeleteCouponOptions = {}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteCoupon = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await api.delete(`/billing/coupons/${id}`);
      if (response.data.success) {
        options.onSuccess?.();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao deletar cupom');
      options.onError?.(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [options]);

  return { deleteCoupon, isDeleting };
}

// ============================================================================
// CREATE/UPDATE/DELETE PLAN HOOKS
// ============================================================================

interface UseCreatePlanOptions {
  onSuccess?: (plan: BillingPlan) => void;
  onError?: (error: Error) => void;
}

export function useCreatePlan(options: UseCreatePlanOptions = {}) {
  const [isCreating, setIsCreating] = useState(false);

  const createPlan = useCallback(async (data: Partial<BillingPlan>) => {
    try {
      setIsCreating(true);
      const response = await api.post('/billing/plans', data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao criar plano');
      options.onError?.(error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [options]);

  return { createPlan, isCreating };
}

interface UseUpdatePlanOptions {
  onSuccess?: (plan: BillingPlan) => void;
  onError?: (error: Error) => void;
}

export function useUpdatePlan(options: UseUpdatePlanOptions = {}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePlan = useCallback(async (id: string, data: Partial<BillingPlan>) => {
    try {
      setIsUpdating(true);
      const response = await api.put(`/billing/plans/${id}`, data);
      if (response.data.success) {
        options.onSuccess?.(response.data.data);
        return response.data.data;
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao atualizar plano');
      options.onError?.(error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [options]);

  return { updatePlan, isUpdating };
}

interface UseDeletePlanOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useDeletePlan(options: UseDeletePlanOptions = {}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deletePlan = useCallback(async (id: string) => {
    try {
      setIsDeleting(true);
      const response = await api.delete(`/billing/plans/${id}`);
      if (response.data.success) {
        options.onSuccess?.();
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Erro ao deletar plano');
      options.onError?.(error);
      throw error;
    } finally {
      setIsDeleting(false);
    }
  }, [options]);

  return { deletePlan, isDeleting };
}

// ============================================================================
// BILLING HISTORY HOOK
// ============================================================================

interface BillingHistoryItem {
  id: string;
  type: 'invoice' | 'payment' | 'credit' | 'refund';
  description: string;
  amount: number;
  status: string;
  createdAt: string;
}

interface UseBillingHistoryOptions {
  page?: number;
  limit?: number;
}

interface UseBillingHistoryReturn {
  history: BillingHistoryItem[];
  isLoading: boolean;
  error: Error | null;
  meta: PaginationMeta | null;
  refetch: () => void;
}

export function useBillingHistory(options: UseBillingHistoryOptions = {}): UseBillingHistoryReturn {
  const [history, setHistory] = useState<BillingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/billing/history', {
        params: {
          page: options.page || 1,
          limit: options.limit || 20,
        },
      });
      if (response.data.success) {
        setHistory(response.data.data || []);
        setMeta(response.data.meta || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar histórico'));
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [options.page, options.limit]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, isLoading, error, meta, refetch: fetchHistory };
}

// ============================================================================
// CREDITS HOOK
// ============================================================================

interface Credits {
  balance: number;
  currency: string;
  history: Array<{
    id: string;
    amount: number;
    type: 'add' | 'use';
    description: string;
    createdAt: string;
  }>;
}

interface UseCreditsReturn {
  credits: Credits | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useCredits(): UseCreditsReturn {
  const [credits, setCredits] = useState<Credits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchCredits = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/billing/credits');
      if (response.data.success) {
        setCredits(response.data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao carregar créditos'));
      setCredits({ balance: 0, currency: 'BRL', history: [] });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { credits, isLoading, error, refetch: fetchCredits };
}
