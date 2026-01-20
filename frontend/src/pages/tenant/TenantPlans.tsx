import { useState, useMemo } from 'react';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Check, ArrowUp, ArrowDown, Sparkles, LayoutGrid } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BillingCycleSelector } from '@/components/billing/BillingCycleSelector';
import { PlanCard } from '@/components/billing/PlanCard';
import { PlanChangeModal } from '@/components/billing/PlanChangeModal';
import { getPublicPlans, getPlanById } from '@/config/plansConfig';
import { mockSubscriptions } from '@/data/billingMockData';
import { BillingCycle, BILLING_CYCLE_DISCOUNTS, formatPrice, BillingPlan } from '@/types/billing';
import { SubscriptionPeriod } from '@/lib/billingCalculations';
import { toast } from 'sonner';

export default function TenantPlans() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
  const [showChangeModal, setShowChangeModal] = useState(false);
  
  // Simula a assinatura atual do tenant
  const currentSubscription = mockSubscriptions[0];
  const currentPlan = getPlanById(currentSubscription.planId);
  const publicPlans = getPublicPlans();
  
  // Período atual da assinatura
  const subscriptionPeriod: SubscriptionPeriod = useMemo(() => ({
    startDate: new Date(currentSubscription.currentPeriodStart),
    endDate: new Date(currentSubscription.currentPeriodEnd),
    cycle: currentSubscription.billingCycle
  }), [currentSubscription]);

  const handleSelectPlan = (plan: BillingPlan) => {
    if (plan.id === currentSubscription.planId) {
      toast.info('Este já é o seu plano atual');
      return;
    }
    setSelectedPlan(plan);
    setShowChangeModal(true);
  };

  const handleConfirmChange = () => {
    // Atualizar estado (em produção, chamar API)
    setSelectedPlan(null);
  };

  const getPlanChangeType = (plan: BillingPlan): 'upgrade' | 'downgrade' | 'current' => {
    if (!currentPlan) return 'current';
    if (plan.id === currentPlan.id) return 'current';
    return plan.sortOrder > currentPlan.sortOrder ? 'upgrade' : 'downgrade';
  };

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
          <Button asChild variant="outline">
            <Link to="/plan-comparison">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Ver Comparativo Completo
            </Link>
          </Button>
        </div>

        {/* Plano atual */}
        <Card className="bg-cs-bg-card border-primary/30">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Plano Atual: <span className="text-primary">{currentPlan?.name}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatPrice(currentPlan?.basePrice || 0)}/mês • 
                  Renova em {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-cs-success border-cs-success/30">
              Ativo
            </Badge>
          </CardContent>
        </Card>

        {/* Seletor de ciclo */}
        <div className="flex justify-center">
          <BillingCycleSelector value={billingCycle} onChange={setBillingCycle} />
        </div>

        {/* Desconto do ciclo */}
        {BILLING_CYCLE_DISCOUNTS[billingCycle].discount > 0 && (
          <div className="text-center">
            <Badge className="bg-cs-success/10 text-cs-success border-cs-success/30 py-2 px-4">
              <Sparkles className="h-4 w-4 mr-2" />
              Economize {BILLING_CYCLE_DISCOUNTS[billingCycle].discount}% pagando {BILLING_CYCLE_DISCOUNTS[billingCycle].label.toLowerCase()}
            </Badge>
          </div>
        )}

        {/* Grid de planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {publicPlans.map((plan) => {
            const changeType = getPlanChangeType(plan);
            
            return (
              <div key={plan.id} className="relative">
                {/* Badge de upgrade/downgrade */}
                {changeType !== 'current' && (
                  <Badge 
                    className={`absolute -top-2 -right-2 z-10 ${
                      changeType === 'upgrade' 
                        ? 'bg-cs-success text-white' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {changeType === 'upgrade' ? (
                      <><ArrowUp className="h-3 w-3 mr-1" /> Upgrade</>
                    ) : (
                      <><ArrowDown className="h-3 w-3 mr-1" /> Downgrade</>
                    )}
                  </Badge>
                )}
                
                <PlanCard
                  plan={plan}
                  cycle={billingCycle}
                  isCurrentPlan={plan.id === currentSubscription.planId}
                  onSelect={(p) => handleSelectPlan(p)}
                />
              </div>
            );
          })}
        </div>

        {/* Modal de confirmação de mudança */}
        {selectedPlan && currentPlan && (
          <PlanChangeModal
            open={showChangeModal}
            onOpenChange={setShowChangeModal}
            currentPlan={currentPlan}
            newPlan={selectedPlan}
            subscriptionPeriod={subscriptionPeriod}
            onConfirm={handleConfirmChange}
          />
        )}

        {/* Info adicional */}
        <div className="text-center text-sm text-muted-foreground space-y-2 pt-4">
          <p>💡 Upgrades são aplicados imediatamente com cobrança proporcional.</p>
          <p>Downgrades geram crédito para próximas faturas.</p>
        </div>
      </div>
    </TenantLayout>
  );
}
