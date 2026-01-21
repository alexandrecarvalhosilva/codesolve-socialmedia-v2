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

export function useSubscription(id: string | undefined): UseSubscriptionReturn {
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

  return { subscription, isLoading, error, refetch: fetchSubscription };
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
