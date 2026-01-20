import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  AlertTriangle,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { FinancialKPICard } from '@/components/billing/FinancialKPICard';
import { InvoiceTable } from '@/components/billing/InvoiceTable';
import { mockFinancialKPIs, mockInvoices, mockSubscriptions, mockPlans } from '@/data/billingMockData';
import { formatPrice, Invoice } from '@/types/billing';
import { MetricCardSkeleton, ChartSkeleton, TableSkeleton } from '@/components/ui/skeleton-loader';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { toast } from 'sonner';

export default function FinancialDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const kpis = mockFinancialKPIs;

  // Simula carregamento
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  // Dados para gráfico de MRR
  const mrrData = [
    { month: 'Ago', mrr: 45000 },
    { month: 'Set', mrr: 52000 },
    { month: 'Out', mrr: 58000 },
    { month: 'Nov', mrr: 62000 },
    { month: 'Dez', mrr: 68000 },
    { month: 'Jan', mrr: kpis.mrr },
  ];

  // Dados para gráfico de assinaturas por plano
  const subscriptionsByPlan = mockPlans.map(plan => {
    const count = mockSubscriptions.filter(s => s.planId === plan.id && s.status !== 'canceled').length;
    return { name: plan.name, value: count };
  }).filter(item => item.value > 0);

  const COLORS = ['#00d4ff', '#00a8cc', '#0088a3', '#006680', '#004455'];

  // Faturas recentes
  const recentInvoices = mockInvoices.slice(0, 5);
  
  // Tenants em atraso
  const overdueSubscriptions = mockSubscriptions.filter(s => s.status === 'past_due');

  const handleViewInvoice = (invoice: Invoice) => {
    toast.info(`Visualizando fatura ${invoice.invoiceNumber}`);
  };

  const handleDownloadInvoice = (invoice: Invoice) => {
    toast.success(`Baixando fatura ${invoice.invoiceNumber}`);
  };

  const handleSendReminder = (invoice: Invoice) => {
    toast.success(`Lembrete enviado para ${invoice.tenantName}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6 animate-fade-in">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>

          {/* KPIs Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <MetricCardSkeleton key={i} />
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ChartSkeleton />
            </div>
            <ChartSkeleton />
          </div>

          {/* Table Skeleton */}
          <TableSkeleton rows={5} columns={5} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 opacity-0 animate-enter" style={{ animationFillMode: 'forwards' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard Financeiro</h1>
            <p className="text-muted-foreground">Visão geral das finanças do sistema</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/billing/invoices">Ver Faturas</Link>
            </Button>
            <Button asChild className="bg-cs-cyan hover:bg-cs-cyan/90">
              <Link to="/billing/subscriptions">Gerenciar Assinaturas</Link>
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FinancialKPICard
            title="MRR"
            value={formatPrice(kpis.mrr)}
            trend={{ value: kpis.mrrGrowth, isPositive: kpis.mrrGrowth >= 0 }}
            icon={DollarSign}
          />
          <FinancialKPICard
            title="Assinaturas Ativas"
            value={kpis.activeSubscriptions.toString()}
            icon={Users}
          />
          <FinancialKPICard
            title="Pendente"
            value={formatPrice(kpis.pendingAmount)}
            subtitle={`${mockInvoices.filter(i => i.status === 'pending').length} faturas`}
            icon={CreditCard}
            variant="warning"
          />
          <FinancialKPICard
            title="Em Atraso"
            value={formatPrice(kpis.overdueAmount)}
            subtitle={`${kpis.overdueCount} tenants`}
            icon={AlertTriangle}
            variant="error"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Gráfico de MRR */}
          <Card className="bg-cs-bg-card border-border lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Evolução do MRR</CardTitle>
                  <CardDescription>Receita recorrente mensal</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {kpis.mrrGrowth >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-cs-success" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-cs-error" />
                  )}
                  <span className={kpis.mrrGrowth >= 0 ? 'text-cs-success' : 'text-cs-error'}>
                    {kpis.mrrGrowth >= 0 ? '+' : ''}{kpis.mrrGrowth}%
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={mrrData}>
                  <defs>
                    <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis 
                    stroke="#888" 
                    tickFormatter={(value) => `R$${(value/1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatPrice(value), 'MRR']}
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="mrr" 
                    stroke="#00d4ff" 
                    fill="url(#mrrGradient)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Gráfico de Assinaturas por Plano */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle>Assinaturas por Plano</CardTitle>
              <CardDescription>Distribuição atual</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={subscriptionsByPlan}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subscriptionsByPlan.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend 
                    formatter={(value) => <span className="text-cs-text-secondary">{value}</span>}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Alertas de Inadimplência */}
        {overdueSubscriptions.length > 0 && (
          <Card className="bg-cs-error/10 border-cs-error/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-cs-error" />
                  <div>
                    <CardTitle className="text-cs-error">Atenção: Tenants em Atraso</CardTitle>
                    <CardDescription>{overdueSubscriptions.length} tenant(s) com pagamento pendente</CardDescription>
                  </div>
                </div>
                <Button asChild variant="outline" className="border-cs-error text-cs-error hover:bg-cs-error/20">
                  <Link to="/billing/subscriptions?status=past_due">Ver Todos</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {overdueSubscriptions.slice(0, 3).map((sub) => (
                  <div 
                    key={sub.id}
                    className="flex items-center justify-between p-3 bg-cs-bg-card rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{sub.tenantName}</p>
                      <p className="text-sm text-muted-foreground">
                        Vencido desde {new Date(sub.currentPeriodEnd).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-cs-error">
                      Enviar Lembrete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Faturas Recentes */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Faturas Recentes</CardTitle>
                <CardDescription>Últimas faturas geradas</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link to="/billing/invoices" className="flex items-center gap-1">
                  Ver Todas <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <InvoiceTable
              invoices={recentInvoices}
              showTenant={true}
              onView={handleViewInvoice}
              onDownload={handleDownloadInvoice}
              onSendReminder={handleSendReminder}
            />
          </CardContent>
        </Card>

        {/* Links Rápidos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link 
            to="/billing/plans"
            className="flex items-center justify-between p-4 bg-cs-bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <span className="font-medium">Gerenciar Planos</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link 
            to="/billing/modules"
            className="flex items-center justify-between p-4 bg-cs-bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <span className="font-medium">Gerenciar Módulos</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link 
            to="/billing/coupons"
            className="flex items-center justify-between p-4 bg-cs-bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <span className="font-medium">Cupons de Desconto</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
          <Link 
            to="/billing/reports"
            className="flex items-center justify-between p-4 bg-cs-bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
          >
            <span className="font-medium">Relatórios Financeiros</span>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
