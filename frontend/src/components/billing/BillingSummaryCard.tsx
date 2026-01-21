import { TrendingUp, ChevronRight, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UsageProgressBar } from './UsageProgressBar';
import { formatPrice } from '@/types/billing';
import { useFinancialKPIs, useSubscription } from '@/hooks/useBilling';
import { useEffect } from 'react';

interface BillingSummaryCardProps {
  variant: 'superadmin' | 'tenant';
}

export function BillingSummaryCard({ variant }: BillingSummaryCardProps) {
  if (variant === 'superadmin') {
    return <SuperAdminBillingCard />;
  }
  return <TenantBillingCard />;
}

function SuperAdminBillingCard() {
  const { kpis, isLoading, fetchKPIs } = useFinancialKPIs();

  useEffect(() => {
    fetchKPIs();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-cs-bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  
  return (
    <div className="bg-cs-bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cs-cyan/10">
            <TrendingUp className="w-5 h-5 text-cs-cyan" />
          </div>
          <h3 className="font-semibold text-cs-text-primary">Resumo Financeiro</h3>
        </div>
        <Link to="/billing">
          <Button variant="ghost" size="sm" className="text-cs-cyan hover:text-cs-cyan/80">
            Ver detalhes <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* MRR */}
        <div className="bg-cs-bg-primary/50 rounded-lg p-4">
          <p className="text-sm text-cs-text-secondary mb-1">MRR Atual</p>
          <p className="text-2xl font-bold text-cs-text-primary">
            {formatPrice(kpis?.mrr || 0)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-cs-success" />
            <span className="text-xs text-cs-success">+{kpis?.mrrGrowth || 0}% vs mês anterior</span>
          </div>
        </div>

        {/* Assinaturas Ativas */}
        <div className="bg-cs-bg-primary/50 rounded-lg p-4">
          <p className="text-sm text-cs-text-secondary mb-1">Assinaturas Ativas</p>
          <p className="text-2xl font-bold text-cs-text-primary">
            {kpis?.activeSubscriptions || 0}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs text-cs-text-secondary">
              {kpis?.trialSubscriptions || 0} em trial
            </span>
          </div>
        </div>
      </div>

      {/* Churn Rate */}
      <div className="bg-cs-bg-primary/50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-cs-text-secondary mb-1">Taxa de Churn</p>
            <p className="text-xl font-bold text-cs-text-primary">{kpis?.churnRate || 0}%</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-cs-text-secondary mb-1">Receita Pendente</p>
            <p className="text-xl font-bold text-cs-warning">{formatPrice(kpis?.pendingRevenue || 0)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TenantBillingCard() {
  const { subscription, isLoading, fetchSubscription } = useSubscription();

  useEffect(() => {
    fetchSubscription();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-cs-bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <Skeleton className="h-20 w-full mb-4" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-cs-bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-cs-warning/10">
            <AlertCircle className="w-5 h-5 text-cs-warning" />
          </div>
          <h3 className="font-semibold text-cs-text-primary">Sem Assinatura</h3>
        </div>
        <p className="text-sm text-cs-text-secondary mb-4">
          Você ainda não possui uma assinatura ativa.
        </p>
        <Link to="/tenant/billing/plans">
          <Button className="w-full">
            Ver Planos Disponíveis
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-cs-bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cs-cyan/10">
            <CreditCard className="w-5 h-5 text-cs-cyan" />
          </div>
          <h3 className="font-semibold text-cs-text-primary">Minha Assinatura</h3>
        </div>
        <Link to="/tenant/billing">
          <Button variant="ghost" size="sm" className="text-cs-cyan hover:text-cs-cyan/80">
            Ver detalhes <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Plano atual */}
      <div className="bg-cs-bg-primary/50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-cs-text-secondary mb-1">Plano Atual</p>
            <p className="text-xl font-bold text-cs-text-primary">{subscription.planName || 'N/A'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-cs-text-secondary mb-1">Valor</p>
            <p className="text-xl font-bold text-cs-cyan">{formatPrice(subscription.amount || 0)}/mês</p>
          </div>
        </div>
      </div>

      {/* Uso */}
      {subscription.usage && (
        <div className="space-y-3">
          <UsageProgressBar
            label="Mensagens"
            current={subscription.usage.messages || 0}
            max={subscription.usage.messagesLimit || 1000}
          />
          <UsageProgressBar
            label="Instâncias"
            current={subscription.usage.instances || 0}
            max={subscription.usage.instancesLimit || 1}
          />
        </div>
      )}

      {/* Próxima cobrança */}
      {subscription.nextBillingDate && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-cs-text-secondary">Próxima cobrança</span>
            <span className="text-cs-text-primary font-medium">
              {new Date(subscription.nextBillingDate).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
