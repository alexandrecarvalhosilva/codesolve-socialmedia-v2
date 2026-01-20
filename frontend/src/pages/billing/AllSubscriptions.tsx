import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  XCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { StatusBadge } from '@/components/billing/StatusBadge';
import { mockSubscriptions, mockPlans } from '@/data/billingMockData';
import { SubscriptionStatus, formatPrice, BILLING_CYCLE_DISCOUNTS } from '@/types/billing';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function AllSubscriptions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);

  // Filtrar assinaturas
  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.tenantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;
    const matchesPlan = planFilter === 'all' || sub.planId === planFilter;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Estatísticas
  const stats = {
    total: mockSubscriptions.length,
    active: mockSubscriptions.filter(s => s.status === 'active').length,
    pastDue: mockSubscriptions.filter(s => s.status === 'past_due').length,
    canceled: mockSubscriptions.filter(s => s.status === 'canceled').length,
  };

  const getPlanName = (planId: string) => {
    return mockPlans.find(p => p.id === planId)?.name || 'Desconhecido';
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
  };

  const handleViewDetails = (sub: typeof mockSubscriptions[0]) => {
    toast.info(`Assinatura: ${sub.tenantName} - Plano: ${sub.plan?.name || 'N/A'} - Status: ${sub.status}`);
  };

  const handleSendReminder = (subId: string) => {
    setSubscriptions(prev => prev.map(s => 
      s.id === subId ? { ...s } : s
    ));
    toast.success('Lembrete de pagamento enviado!');
  };

  const handlePauseSubscription = (subId: string) => {
    setSubscriptions(prev => prev.map(s => 
      s.id === subId ? { ...s, status: s.status === 'paused' ? 'active' : 'paused' as any } : s
    ));
    toast.info('Status da assinatura atualizado');
  };

  const handleCancelSubscription = (subId: string) => {
    setSubscriptions(prev => prev.map(s => 
      s.id === subId ? { ...s, status: 'canceled' as any } : s
    ));
    toast.warning('Assinatura cancelada');
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Todas as Assinaturas</h1>
            <p className="text-muted-foreground">Gerencie as assinaturas de todos os tenants</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-sm text-muted-foreground">Em Atraso</p>
              <p className="text-2xl font-bold text-cs-error">{stats.pastDue}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Canceladas</p>
              <p className="text-2xl font-bold text-muted-foreground">{stats.canceled}</p>
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
                  placeholder="Buscar por nome do tenant..."
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
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="past_due">Em Atraso</SelectItem>
                  <SelectItem value="canceled">Cancelado</SelectItem>
                  <SelectItem value="trialing">Trial</SelectItem>
                  <SelectItem value="paused">Pausado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={planFilter} onValueChange={setPlanFilter}>
                <SelectTrigger className="w-full md:w-48 bg-cs-bg-primary border-border">
                  <SelectValue placeholder="Plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Planos</SelectItem>
                  {mockPlans.map(plan => (
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
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-cs-bg-primary/50 hover:bg-cs-bg-primary/50">
                    <TableHead className="text-cs-text-secondary">Tenant</TableHead>
                    <TableHead className="text-cs-text-secondary">Plano</TableHead>
                    <TableHead className="text-cs-text-secondary">Ciclo</TableHead>
                    <TableHead className="text-cs-text-secondary">Valor</TableHead>
                    <TableHead className="text-cs-text-secondary">Próximo Venc.</TableHead>
                    <TableHead className="text-cs-text-secondary">Status</TableHead>
                    <TableHead className="text-cs-text-secondary text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhuma assinatura encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubscriptions.map((sub) => {
                      const plan = mockPlans.find(p => p.id === sub.planId);
                      return (
                        <TableRow key={sub.id} className="hover:bg-cs-bg-primary/30">
                          <TableCell className="font-medium text-foreground">
                            {sub.tenantName}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{getPlanName(sub.planId)}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {BILLING_CYCLE_DISCOUNTS[sub.billingCycle].label}
                          </TableCell>
                          <TableCell className="font-medium text-foreground">
                            {formatPrice(plan?.basePrice || 0)}
                            {sub.discountPercent > 0 && (
                              <span className="text-xs text-cs-success ml-1">
                                -{sub.discountPercent}%
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatDate(sub.currentPeriodEnd)}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={sub.status} type="subscription" size="sm" />
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-cs-bg-card border-border">
                                <DropdownMenuItem onClick={() => handleViewDetails(sub)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalhes
                                </DropdownMenuItem>
                                {sub.status === 'past_due' && (
                                  <DropdownMenuItem onClick={() => handleSendReminder(sub.id)}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Enviar Lembrete
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handlePauseSubscription(sub.id)}>
                                  <Pause className="w-4 h-4 mr-2" />
                                  Pausar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleCancelSubscription(sub.id)}
                                  className="text-cs-error"
                                >
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Cancelar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
