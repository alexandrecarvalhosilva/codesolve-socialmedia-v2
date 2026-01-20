import { CreditCard, Package, TrendingUp, AlertTriangle, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { UsageProgressBar } from './UsageProgressBar';
import { formatPrice } from '@/types/billing';
import { getCurrentTenantSubscription, getPlanById, mockFinancialKPIs } from '@/data/billingMockData';

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
  const kpis = mockFinancialKPIs;
  
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
            {formatPrice(kpis.mrr)}
          </p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3 text-cs-success" />
            <span className="text-xs text-cs-success">+{kpis.mrrGrowth}% vs mês anterior</span>
          </div>
        </div>

        {/* Inadimplência */}
        <div className="bg-cs-bg-primary/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm text-cs-text-secondary">Inadimplência</p>
            {kpis.overdueAmount > 0 && (
              <AlertTriangle className="w-3 h-3 text-cs-warning" />
            )}
          </div>
          <p className="text-2xl font-bold text-cs-text-primary">
            {formatPrice(kpis.overdueAmount)}
          </p>
          <p className="text-xs text-cs-text-muted mt-1">
            {kpis.overdueCount} faturas pendentes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
        <div className="text-center">
          <p className="text-lg font-semibold text-cs-text-primary">{kpis.activeSubscriptions}</p>
          <p className="text-xs text-cs-text-muted">Assinaturas ativas</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-cs-success">{formatPrice(kpis.billedThisMonth)}</p>
          <p className="text-xs text-cs-text-muted">Faturado este mês</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-semibold text-cs-warning">{kpis.churnRate}%</p>
          <p className="text-xs text-cs-text-muted">Taxa de churn</p>
        </div>
      </div>
    </div>
  );
}

function TenantBillingCard() {
  const subscription = getCurrentTenantSubscription();
  const plan = subscription ? getPlanById(subscription.planId) : null;

  if (!subscription || !plan) {
    return (
      <div className="bg-cs-bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-lg bg-cs-cyan/10">
            <CreditCard className="w-5 h-5 text-cs-cyan" />
          </div>
          <h3 className="font-semibold text-cs-text-primary">Assinatura</h3>
        </div>
        <p className="text-cs-text-muted">Nenhuma assinatura ativa</p>
        <Link to="/tenant/billing/plans">
          <Button className="mt-4 bg-cs-cyan text-white hover:bg-cs-cyan/90">
            Ver planos disponíveis
          </Button>
        </Link>
      </div>
    );
  }

  const usage = subscription.usage;
  const basePrice = plan.basePrice;

  return (
    <div className="bg-cs-bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cs-cyan/10">
            <Package className="w-5 h-5 text-cs-cyan" />
          </div>
          <div>
            <h3 className="font-semibold text-cs-text-primary">Plano {plan.name}</h3>
            <p className="text-xs text-cs-text-muted">
              Renova em {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
        <Link to="/tenant/billing">
          <Button variant="ghost" size="sm" className="text-cs-cyan hover:text-cs-cyan/80">
            Gerenciar <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </div>

      {/* Current Plan Value */}
      <div className="bg-cs-bg-primary/50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-cs-text-secondary">Valor mensal</p>
            <p className="text-xl font-bold text-cs-text-primary">
              {formatPrice(basePrice)}
            </p>
          </div>
          {subscription.extraModules && subscription.extraModules.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-cs-text-muted">Módulos adicionais</p>
              <p className="text-sm font-medium text-cs-cyan">
                +{subscription.extraModules.length} módulos
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Bars */}
      <div className="space-y-3">
        <UsageProgressBar 
          label="Usuários"
          used={usage.usersUsed}
          limit={usage.usersLimit}
        />
        <UsageProgressBar 
          label="Instâncias"
          used={usage.instancesUsed}
          limit={usage.instancesLimit}
        />
        <UsageProgressBar 
          label="Mensagens"
          used={usage.messagesUsed}
          limit={usage.messagesLimit}
        />
      </div>
    </div>
  );
}
