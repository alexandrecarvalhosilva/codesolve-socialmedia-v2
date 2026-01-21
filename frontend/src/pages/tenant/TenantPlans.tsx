import { useState, useEffect, useMemo } from 'react';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Check, ArrowUp, ArrowDown, Sparkles, LayoutGrid, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BillingCycleSelector } from '@/components/billing/BillingCycleSelector';
import { PlanCard } from '@/components/billing/PlanCard';
import { PlanChangeModal } from '@/components/billing/PlanChangeModal';
import { usePlans, useSubscription, useChangePlan } from '@/hooks/useBilling';
import { BillingCycle, BILLING_CYCLE_DISCOUNTS, formatPrice, BillingPlan } from '@/types/billing';
import { SubscriptionPeriod } from '@/lib/billingCalculations';
import { toast } from 'sonner';

export default function TenantPlans() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
  const [showChangeModal, setShowChangeModal] = useState(false);
  
  const { plans, isLoading: plansLoading, fetchPlans } = usePlans();
  const { subscription, isLoading: subscriptionLoading, fetchSubscription } = useSubscription();
  const { changePlan, isChanging } = useChangePlan();

  const isLoading = plansLoading || subscriptionLoading;

  useEffect(() => {
    fetchPlans();
    fetchSubscription();
  }, []);

  const handleRefresh = () => {
    fetchPlans();
    fetchSubscription();
    toast.success('Dados atualizados');
  };

  // Plano atual
  const currentPlan = plans.find(p => p.id === subscription?.planId);
  const publicPlans = plans.filter(p => p.isPublic !== false);
  
  // Período atual da assinatura
  const subscriptionPeriod: SubscriptionPeriod | null = useMemo(() => {
    if (!subscription) return null;
    return {
      startDate: new Date(subscription.currentPeriodStart),
      endDate: new Date(subscription.currentPeriodEnd),
      cycle: subscription.billingCycle
    };
  }, [subscription]);

  const handleSelectPlan = (plan: BillingPlan) => {
    if (plan.id === subscription?.planId) {
      toast.info('Este já é o seu plano atual');
      return;
    }
    setSelectedPlan(plan);
    setShowChangeModal(true);
  };

  const handleConfirmChange = async () => {
    if (!selectedPlan) return;
    
    try {
      await changePlan(selectedPlan.id, billingCycle);
      toast.success('Plano alterado com sucesso!');
      setShowChangeModal(false);
      setSelectedPlan(null);
      fetchSubscription();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar plano');
    }
  };

  const getPlanChangeType = (plan: BillingPlan): 'upgrade' | 'downgrade' | 'current' => {
    if (!currentPlan) return 'current';
    if (plan.id === currentPlan.id) return 'current';
    return (plan.sortOrder || 0) > (currentPlan.sortOrder || 0) ? 'upgrade' : 'downgrade';
  };

  if (isLoading) {
    return (
      <TenantLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link to="/tenant/billing">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Escolher Plano</h1>
              <p className="text-muted-foreground">Compare e escolha o melhor plano para você</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button asChild variant="outline">
              <Link to="/plan-comparison">
                <LayoutGrid className="h-4 w-4 mr-2" />
                Ver Comparativo Completo
              </Link>
            </Button>
          </div>
        </div>

        {/* Plano atual */}
        {currentPlan && (
          <Card className="bg-cs-bg-card border-primary/30">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Plano Atual</p>
                  <p className="text-lg font-semibold text-foreground">{currentPlan.name}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-primary border-primary">
                {subscription?.billingCycle === 'monthly' ? 'Mensal' : 
                 subscription?.billingCycle === 'quarterly' ? 'Trimestral' :
                 subscription?.billingCycle === 'semiannual' ? 'Semestral' : 'Anual'}
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Seletor de ciclo */}
        <div className="flex justify-center">
          <BillingCycleSelector
            value={billingCycle}
            onChange={setBillingCycle}
          />
        </div>

        {/* Lista de planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {publicPlans.map((plan) => {
            const changeType = getPlanChangeType(plan);
            const isCurrent = plan.id === subscription?.planId;
            
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                isCurrent={isCurrent}
                changeType={changeType}
                onSelect={() => handleSelectPlan(plan)}
              />
            );
          })}
        </div>

        {/* Modal de mudança de plano */}
        {selectedPlan && subscriptionPeriod && (
          <PlanChangeModal
            open={showChangeModal}
            onOpenChange={setShowChangeModal}
            currentPlan={currentPlan || null}
            newPlan={selectedPlan}
            billingCycle={billingCycle}
            subscriptionPeriod={subscriptionPeriod}
            onConfirm={handleConfirmChange}
            isLoading={isChanging}
          />
        )}
      </div>
    </TenantLayout>
  );
}
