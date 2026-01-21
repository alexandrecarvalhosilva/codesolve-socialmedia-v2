import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  History, 
  Wallet, 
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  XCircle,
  DollarSign
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { PlanChangeHistoryTable } from '@/components/billing/PlanChangeHistoryTable';
import { CreditsCard } from '@/components/billing/CreditsCard';
import { useBillingHistory, useCredits } from '@/hooks/useBilling';
import { PlanChangeHistory, formatPrice, PLAN_CHANGE_TYPE_CONFIG } from '@/types/billing';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function BillingHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { history, isLoading: historyLoading, fetchHistory } = useBillingHistory();
  const { credits, transactions, isLoading: creditsLoading, fetchCredits } = useCredits();

  const isLoading = historyLoading || creditsLoading;

  useEffect(() => {
    fetchHistory();
    fetchCredits();
  }, []);

  const handleRefresh = () => {
    fetchHistory();
    fetchCredits();
    toast.success('Dados atualizados');
  };

  // Filtrar histórico
  const filteredHistory = history.filter(change => {
    const matchesSearch = (change.tenantName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || change.changeType === typeFilter;
    const matchesStatus = statusFilter === 'all' || change.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calcular estatísticas
  const stats = {
    totalChanges: history.length,
    upgrades: history.filter(h => h.changeType === 'upgrade').length,
    downgrades: history.filter(h => h.changeType === 'downgrade').length,
    cancellations: history.filter(h => h.changeType === 'cancellation').length,
    totalCreditsGenerated: history.reduce((sum, h) => sum + (h.creditsGenerated || 0), 0),
    totalRevenue: history
      .filter(h => (h.proratedAmount || 0) > 0 && h.status === 'completed')
      .reduce((sum, h) => sum + (h.proratedAmount || 0), 0),
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-cs-bg-card border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full mb-2" />
              ))}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link to="/billing">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <History className="w-7 h-7 text-primary" />
                Histórico de Alterações
              </h1>
              <p className="text-muted-foreground">Acompanhe mudanças de plano e transações de créditos</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total de Alterações</p>
              <p className="text-2xl font-bold text-foreground">{stats.totalChanges}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cs-success" />
                <p className="text-sm text-muted-foreground">Upgrades</p>
              </div>
              <p className="text-2xl font-bold text-cs-success">{stats.upgrades}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-cs-warning" />
                <p className="text-sm text-muted-foreground">Downgrades</p>
              </div>
              <p className="text-2xl font-bold text-cs-warning">{stats.downgrades}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-cs-error" />
                <p className="text-sm text-muted-foreground">Cancelamentos</p>
              </div>
              <p className="text-2xl font-bold text-cs-error">{stats.cancellations}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-cs-cyan" />
                <p className="text-sm text-muted-foreground">Créditos Gerados</p>
              </div>
              <p className="text-2xl font-bold text-cs-cyan">{formatPrice(stats.totalCreditsGenerated)}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-cs-success" />
                <p className="text-sm text-muted-foreground">Receita Adicional</p>
              </div>
              <p className="text-2xl font-bold text-cs-success">{formatPrice(stats.totalRevenue)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList>
            <TabsTrigger value="history">Histórico de Planos</TabsTrigger>
            <TabsTrigger value="credits">Créditos</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            {/* Filtros */}
            <Card className="bg-cs-bg-card border-border">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por tenant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-cs-bg-primary border-border"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full md:w-48 bg-cs-bg-primary border-border">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Tipos</SelectItem>
                      <SelectItem value="upgrade">Upgrade</SelectItem>
                      <SelectItem value="downgrade">Downgrade</SelectItem>
                      <SelectItem value="cancellation">Cancelamento</SelectItem>
                      <SelectItem value="reactivation">Reativação</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48 bg-cs-bg-primary border-border">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="failed">Falhou</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tabela */}
            <Card className="bg-cs-bg-card border-border">
              <CardHeader>
                <CardTitle>Alterações de Plano</CardTitle>
                <CardDescription>{filteredHistory.length} registro(s) encontrado(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <PlanChangeHistoryTable history={filteredHistory} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-cs-bg-card border-border">
                  <CardHeader>
                    <CardTitle>Transações de Créditos</CardTitle>
                    <CardDescription>Histórico de uso e adição de créditos</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {transactions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma transação encontrada</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactions.map((tx: any) => (
                          <div key={tx.id} className="flex items-center justify-between p-3 bg-cs-bg-primary rounded-lg">
                            <div>
                              <p className="font-medium text-foreground">{tx.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(tx.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                            <span className={`font-bold ${tx.amount > 0 ? 'text-cs-success' : 'text-cs-error'}`}>
                              {tx.amount > 0 ? '+' : ''}{formatPrice(tx.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div>
                <CreditsCard
                  balance={credits?.balance || 0}
                  expiringCredits={credits?.expiring || 0}
                  expirationDate={credits?.expirationDate}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
