import { TenantLayout } from '@/layouts/TenantLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  ChevronRight,
  Download,
  Calendar,
  Zap,
  History,
  Wallet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from '@/components/billing/StatusBadge';
import { UsageProgressBar } from '@/components/billing/UsageProgressBar';
import { mockSubscriptions, mockInvoices, mockPlans } from '@/data/billingMockData';
import { formatPrice } from '@/types/billing';
import { getTenantCreditBalance } from '@/data/planChangeHistoryMock';

export default function TenantBilling() {
  // Simula a assinatura do tenant atual
  const subscription = mockSubscriptions[0];
  const plan = mockPlans.find(p => p.id === subscription.planId);
  const pendingInvoices = mockInvoices.filter(
    inv => inv.tenantId === subscription.tenantId && inv.status === 'pending'
  );
  const lastPaidInvoice = mockInvoices.find(
    inv => inv.tenantId === subscription.tenantId && inv.status === 'paid'
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
                    Total: {formatPrice(pendingInvoices.reduce((acc, inv) => acc + inv.total, 0))}
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
                <StatusBadge status={subscription.status} type="subscription" size="sm" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{plan?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(plan?.basePrice || 0)}/mês
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Próxima cobrança: {formatDate(subscription.currentPeriodEnd)}</span>
                </div>
              </div>
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
                used={subscription.usage.messagesUsed}
                limit={subscription.usage.messagesLimit}
              />
              <UsageProgressBar
                label="Usuários"
                used={subscription.usage.usersUsed}
                limit={subscription.usage.usersLimit}
              />
              <UsageProgressBar
                label="Instâncias"
                used={subscription.usage.instancesUsed}
                limit={subscription.usage.instancesLimit}
              />
              {subscription.usage.messagesUsed / (subscription.usage.messagesLimit || 1) >= 0.8 && (
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
            <div className="space-y-3">
              {mockInvoices
                .filter(inv => inv.tenantId === subscription.tenantId)
                .slice(0, 3)
                .map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="flex items-center justify-between p-3 bg-cs-bg-primary rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cs-bg-card">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Vencimento: {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <StatusBadge status={invoice.status} type="invoice" size="sm" />
                      <p className="font-semibold text-foreground">{formatPrice(invoice.total)}</p>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
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
