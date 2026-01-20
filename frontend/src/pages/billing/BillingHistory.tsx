import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { 
  mockPlanChangeHistory, 
  mockCreditTransactions,
  mockTenantCredits 
} from '@/data/planChangeHistoryMock';
import { PlanChangeHistory, formatPrice, PLAN_CHANGE_TYPE_CONFIG } from '@/types/billing';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function BillingHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filtrar histórico
  const filteredHistory = mockPlanChangeHistory.filter(change => {
    const matchesSearch = change.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || change.changeType === typeFilter;
    const matchesStatus = statusFilter === 'all' || change.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calcular estatísticas
  const stats = {
    totalChanges: mockPlanChangeHistory.length,
    upgrades: mockPlanChangeHistory.filter(h => h.changeType === 'upgrade').length,
    downgrades: mockPlanChangeHistory.filter(h => h.changeType === 'downgrade').length,
    cancellations: mockPlanChangeHistory.filter(h => h.changeType === 'cancellation').length,
    totalCreditsGenerated: mockPlanChangeHistory.reduce((sum, h) => sum + h.creditsGenerated, 0),
    totalRevenue: mockPlanChangeHistory
      .filter(h => h.proratedAmount > 0 && h.status === 'completed')
      .reduce((sum, h) => sum + h.proratedAmount, 0),
  };

  // Calcular saldo total de créditos ativos
  const totalActiveCredits = Object.values(mockTenantCredits).reduce(
    (sum, c) => sum + c.balance, 
    0
  );

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link to="/billing">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Histórico de Planos</h1>
            <p className="text-muted-foreground">
              Visualize todas as mudanças de planos e créditos dos tenants
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <History className="h-4 w-4" />
                <span className="text-xs">Total Alterações</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalChanges}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-xs">Upgrades</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{stats.upgrades}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingDown className="h-4 w-4 text-orange-500" />
                <span className="text-xs">Downgrades</span>
              </div>
              <p className="text-2xl font-bold text-orange-500">{stats.downgrades}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs">Cancelamentos</span>
              </div>
              <p className="text-2xl font-bold text-red-500">{stats.cancellations}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-xs">Receita (Upgrades)</span>
              </div>
              <p className="text-2xl font-bold text-primary">{formatPrice(stats.totalRevenue)}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Wallet className="h-4 w-4 text-purple-500" />
                <span className="text-xs">Créditos Ativos</span>
              </div>
              <p className="text-2xl font-bold text-purple-500">{formatPrice(totalActiveCredits)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList className="bg-cs-bg-card border border-border">
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Histórico de Planos
            </TabsTrigger>
            <TabsTrigger value="credits" className="gap-2">
              <Wallet className="h-4 w-4" />
              Créditos por Tenant
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por tenant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-cs-bg-card border-border"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-cs-bg-card border-border">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="upgrade">Upgrades</SelectItem>
                  <SelectItem value="downgrade">Downgrades</SelectItem>
                  <SelectItem value="cancellation">Cancelamentos</SelectItem>
                  <SelectItem value="renewal">Renovações</SelectItem>
                  <SelectItem value="reactivation">Reativações</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-cs-bg-card border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredHistory.length} de {mockPlanChangeHistory.length} alterações
            </p>

            {/* History table */}
            <PlanChangeHistoryTable history={filteredHistory} showTenantName />
          </TabsContent>

          <TabsContent value="credits" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(mockTenantCredits)
                .filter(([_, credits]) => credits.balance > 0)
                .map(([tenantId, credits]) => {
                  const tenantTransactions = mockCreditTransactions.filter(
                    t => t.tenantId === tenantId
                  );
                  const tenantName = mockPlanChangeHistory.find(
                    h => h.tenantId === tenantId
                  )?.tenantName || `Tenant ${tenantId}`;
                  
                  return (
                    <Card key={tenantId} className="bg-cs-bg-card border-border">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{tenantName}</CardTitle>
                        <CardDescription>ID: {tenantId}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Saldo</span>
                            <span className="text-xl font-bold text-primary">
                              {formatPrice(credits.balance)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Última atualização</span>
                            <span className="text-foreground">
                              {format(new Date(credits.lastUpdated), 'dd/MM/yyyy', { locale: ptBR })}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-border">
                            <p className="text-sm text-muted-foreground">
                              {tenantTransactions.length} transação(ões) registrada(s)
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              
              {Object.values(mockTenantCredits).every(c => c.balance === 0) && (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground">Nenhum crédito ativo</p>
                  <p className="text-muted-foreground mt-1">
                    Créditos são gerados em downgrades e cancelamentos
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}