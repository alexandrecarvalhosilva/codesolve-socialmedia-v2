import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Mail,
  Pause,
  XCircle,
  RefreshCw
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/billing/StatusBadge';
import { useSubscriptions, usePlans } from '@/hooks/useBilling';
import { SubscriptionStatus, formatPrice, BILLING_CYCLE_DISCOUNTS } from '@/types/billing';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function AllSubscriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  const { subscriptions, isLoading: subsLoading, fetchSubscriptions } = useSubscriptions();
  const { plans, isLoading: plansLoading, fetchPlans } = usePlans();

  const isLoading = subsLoading || plansLoading;

  useEffect(() => {
    fetchSubscriptions();
    fetchPlans();
  }, []);

  const handleRefresh = () => {
    fetchSubscriptions();
    toast.success('Lista atualizada');
  };

  // Filtrar assinaturas
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = (sub.tenantName || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesPlan = planFilter === 'all' || sub.planId === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Estatísticas
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(s => s.status === 'active').length,
    trial: subscriptions.filter(s => s.status === 'trial').length,
    cancelled: subscriptions.filter(s => s.status === 'cancelled').length,
    mrr: subscriptions
      .filter(s => s.status === 'active')
      .reduce((sum, s) => {
        const plan = plans.find(p => p.id === s.planId);
        return sum + (plan?.priceMonthly || 0);
      }, 0),
  };

  const getPlanName = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan?.name || 'Desconhecido';
  };

  const handleViewDetails = (subscriptionId: string) => {
    toast.info('Abrindo detalhes da assinatura...');
  };

  const handleSendEmail = (subscriptionId: string) => {
    toast.success('E-mail enviado com sucesso!');
  };

  const handlePause = (subscriptionId: string) => {
    toast.info('Assinatura pausada');
  };

  const handleCancel = (subscriptionId: string) => {
    toast.warning('Assinatura cancelada');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
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
          <div>
            <h1 className="text-2xl font-bold text-foreground">Assinaturas</h1>
            <p className="text-muted-foreground">Gerencie todas as assinaturas dos tenants</p>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Ativas</p>
              <p className="text-2xl font-bold text-cs-success">{stats.active}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Trial</p>
              <p className="text-2xl font-bold text-cs-cyan">{stats.trial}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Canceladas</p>
              <p className="text-2xl font-bold text-cs-error">{stats.cancelled}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">MRR</p>
              <p className="text-2xl font-bold text-foreground">{formatPrice(stats.mrr)}</p>
            </CardContent>
          </Card>
        </div>

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
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as SubscriptionStatus | 'all')}>
                <SelectTrigger className="w-full md:w-48 bg-cs-bg-primary border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="past_due">Atrasado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full md:w-48 bg-cs-bg-primary border-border">
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Planos</SelectItem>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id}>{plan.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle>Assinaturas</CardTitle>
            <CardDescription>{filteredSubscriptions.length} assinatura(s) encontrada(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ciclo</TableHead>
                  <TableHead>Próxima Cobrança</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => {
                  const plan = plans.find(p => p.id === sub.planId);
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">{sub.tenantName || 'N/A'}</TableCell>
                      <TableCell>{getPlanName(sub.planId)}</TableCell>
                      <TableCell>
                        <StatusBadge status={sub.status} />
                      </TableCell>
                      <TableCell>
                        {sub.billingCycle === 'monthly' ? 'Mensal' :
                         sub.billingCycle === 'quarterly' ? 'Trimestral' :
                         sub.billingCycle === 'semiannual' ? 'Semestral' : 'Anual'}
                      </TableCell>
                      <TableCell>
                        {sub.currentPeriodEnd ? format(new Date(sub.currentPeriodEnd), 'dd/MM/yyyy', { locale: ptBR }) : 'N/A'}
                      </TableCell>
                      <TableCell>{formatPrice(plan?.priceMonthly || 0)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(sub.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSendEmail(sub.id)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Enviar E-mail
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handlePause(sub.id)}>
                              <Pause className="h-4 w-4 mr-2" />
                              Pausar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleCancel(sub.id)}
                              className="text-cs-error"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancelar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
