import { useState, useEffect } from 'react';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight,
  Download,
  Calendar,
  Zap,
  History,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/billing/StatusBadge';
import { UsageProgressBar } from '@/components/billing/UsageProgressBar';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Subscription, Invoice, BillingPlan } from '@/lib/apiTypes';

// Tipos locais para dados adicionais
interface SubscriptionWithUsage extends Subscription {
  usage?: {
    messagesUsed: number;
    messagesLimit: number;
    usersUsed: number;
    usersLimit: number;
    instancesUsed: number;
    instancesLimit: number;
  };
}

const formatPrice = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function TenantBilling() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionWithUsage | null>(null);
  const [plan, setPlan] = useState<BillingPlan | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar assinatura do tenant atual
      const subscriptionResponse = await api.get('/billing/subscriptions', {
        params: { tenantId: user?.tenantId, limit: 1 }
      });

      if (subscriptionResponse.data.success && subscriptionResponse.data.data?.length > 0) {
        const sub = subscriptionResponse.data.data[0];
        setSubscription(sub);

        // Buscar detalhes do plano
        if (sub.planId) {
          const plansResponse = await api.get('/billing/plans');
          if (plansResponse.data.success) {
            const foundPlan = plansResponse.data.data?.find((p: BillingPlan) => p.id === sub.planId);
            setPlan(foundPlan || null);
          }
        }
      }

      // Buscar faturas
      const invoicesResponse = await api.get('/billing/invoices', {
        params: { tenantId: user?.tenantId, limit: 10 }
      });

      if (invoicesResponse.data.success) {
        const allInvoices = invoicesResponse.data.data || [];
        setInvoices(allInvoices);
        setPendingInvoices(allInvoices.filter((inv: Invoice) => inv.status === 'pending' || inv.status === 'overdue'));
      }

    } catch (err) {
      console.error('Erro ao carregar dados de billing:', err);
      setError('Erro ao carregar dados de cobrança');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.tenantId) {
      fetchBillingData();
    }
  }, [user?.tenantId]);

  if (isLoading) {
    return (
      <TenantLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-cs-bg-card border-border">
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TenantLayout>
    );
  }

  if (error) {
    return (
      <TenantLayout>
        <div className="p-6">
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <div>
                  <p className="font-medium text-foreground">{error}</p>
                  <p className="text-sm text-muted-foreground">Tente novamente mais tarde</p>
                </div>
              </div>
              <Button onClick={fetchBillingData} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      </TenantLayout>
    );
  }

  // Uso padrão se não houver dados
  const usage = subscription?.usage || {
    messagesUsed: 0,
    messagesLimit: 1000,
    usersUsed: 1,
    usersLimit: 5,
    instancesUsed: 0,
    instancesLimit: 1,
  };

  return (
    <TenantLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Cobrança</h1>
            <p className="text-muted-foreground">Gerencie sua assinatura e pagamentos</p>
          </div>
          <Button onClick={fetchBillingData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Alerta de fatura pendente */}
        {pendingInvoices.length > 0 && (
          <Card className="border-cs-warning bg-cs-warning/10">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-cs-warning" />
                <div>
                  <p className="font-medium text-foreground">
                    Você tem {pendingInvoices.length} fatura(s) pendente(s)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total: {formatPrice(pendingInvoices.reduce((acc, inv) => acc + inv.amount, 0))}
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="border-cs-warning text-cs-warning hover:bg-cs-warning/20">
                <Link to="/tenant/billing/invoices">Ver Faturas</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Cards principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card do Plano Atual */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Plano Atual</CardTitle>
                {subscription && (
                  <StatusBadge status={subscription.status} type="subscription" size="sm" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {plan?.name || subscription?.planName || 'Sem plano'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {plan ? formatPrice(plan.priceMonthly) + '/mês' : 'Gratuito'}
                  </p>
                </div>
              </div>
              {subscription && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Próxima cobrança: {formatDate(subscription.currentPeriodEnd)}</span>
                  </div>
                </div>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link to="/tenant/billing/plans" className="flex items-center justify-between">
                  Alterar Plano
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Card de Uso */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Uso do Mês</CardTitle>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <UsageProgressBar
                label="Mensagens"
                used={usage.messagesUsed}
                limit={usage.messagesLimit}
              />
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
              {usage.messagesUsed / (usage.messagesLimit || 1) >= 0.8 && (
                <Button asChild variant="default" className="w-full bg-cs-cyan hover:bg-cs-cyan/90">
                  <Link to="/tenant/billing/plans">
                    Aumentar Limites
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Card de Pagamento */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Forma de Pagamento</CardTitle>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-cs-bg-primary rounded-lg">
                <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded flex items-center justify-center">
                  <span className="text-white text-xs font-bold">VISA</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">•••• •••• •••• 4242</p>
                  <p className="text-sm text-muted-foreground">Expira 12/2027</p>
                </div>
                <Badge variant="outline" className="ml-auto">Padrão</Badge>
              </div>
              <Button variant="outline" className="w-full">
                Gerenciar Pagamentos
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Histórico Resumido */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Últimas Faturas</CardTitle>
                <CardDescription>Histórico recente de pagamentos</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link to="/tenant/billing/invoices">Ver Todas</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma fatura encontrada</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 3).map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="flex items-center justify-between p-3 bg-cs-bg-primary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cs-bg-card">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {invoice.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vencimento: {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={invoice.status} type="invoice" size="sm" />
                      <p className="font-semibold text-foreground">{formatPrice(invoice.amount)}</p>
                      {invoice.invoiceUrl && (
                        <Button variant="ghost" size="icon" asChild>
                          <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Links rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/tenant/billing/plans"
            className="flex items-center justify-between p-4 bg-cs-bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-primary" />
              <span className="font-medium">Ver Planos</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link 
            to="/tenant/billing/modules"
            className="flex items-center justify-between p-4 bg-cs-bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-medium">Módulos Extras</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link 
            to="/tenant/billing/invoices"
            className="flex items-center justify-between p-4 bg-cs-bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-medium">Todas as Faturas</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link 
            to="/tenant/billing/history"
            className="flex items-center justify-between p-4 bg-cs-bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <History className="h-5 w-5 text-primary" />
              <span className="font-medium">Histórico e Créditos</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </TenantLayout>
  );
}
