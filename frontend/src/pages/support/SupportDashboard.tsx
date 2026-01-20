import { useState, useEffect } from 'react';
import { 
  Headphones, 
  Search, 
  Filter,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Users,
  Timer,
  ChevronRight,
  Wrench,
  CreditCard,
  Plug,
  HelpCircle,
  UserCheck,
  Brain,
  Zap,
  User
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockTickets, slaMetrics, slaLevels, supportAgents } from '@/data/supportMockData';
import { 
  Ticket, 
  priorityConfig, 
  statusConfig, 
  TicketCategory,
  TicketPriority,
} from '@/types/support';
import { TicketDetailModal } from '@/components/support/TicketDetailModal';
import { TicketsEvolutionChart } from '@/components/support/TicketsEvolutionChart';
import { SLAUrgentAlerts } from '@/components/support/SLAUrgentAlerts';
import { EmptyTicketsState, EmptySearchState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

const categoryIcons: Record<TicketCategory, React.ElementType> = {
  technical: Wrench,
  billing: CreditCard,
  integration: Plug,
  general: HelpCircle,
  ai: Brain,
  automation: Zap,
  chat: MessageSquare,
  account: User,
};

export default function SupportDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simula carregamento
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredTickets = mockTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.tenantName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header />
        <div className="p-8 space-y-6 animate-fade-in">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>

          {/* KPI Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div>
                      <Skeleton className="h-7 w-12 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Alerts Skeleton */}
          <Card className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 border border-border">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-48 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chart Skeleton */}
          <Card className="bg-card border-border">
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full rounded" />
            </CardContent>
          </Card>

          {/* Distribution Cards Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-card border-border">
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="space-y-2">
                      <div className="flex justify-between">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <Skeleton className="h-2 w-full rounded" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header />
      
      <div className="p-8 space-y-6 opacity-0 animate-enter" style={{ animationFillMode: 'forwards' }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Headphones className="w-7 h-7 text-primary" />
              Central de Suporte
            </h2>
            <p className="text-muted-foreground mt-1">Gerencie todos os tickets e SLAs dos tenants</p>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{slaMetrics.totalTickets}</p>
                  <p className="text-xs text-muted-foreground">Total Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{slaMetrics.openTickets}</p>
                  <p className="text-xs text-muted-foreground">Em Aberto</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{slaMetrics.resolvedToday}</p>
                  <p className="text-xs text-muted-foreground">Resolvidos Hoje</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{slaMetrics.breachedTickets}</p>
                  <p className="text-xs text-muted-foreground">SLA Violado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Timer className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{slaMetrics.avgResponseTime}h</p>
                  <p className="text-xs text-muted-foreground">Tempo Médio Resp.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{slaMetrics.slaComplianceRate}%</p>
                  <p className="text-xs text-muted-foreground">Taxa SLA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Urgent SLA Alerts */}
        <SLAUrgentAlerts />

        {/* Tickets Evolution Chart */}
        <TicketsEvolutionChart />

        {/* SLA Overview and Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SLA Distribution */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Distribuição por SLA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {slaLevels.map(sla => {
                const count = slaMetrics.ticketsBySLA[sla.id as keyof typeof slaMetrics.ticketsBySLA] || 0;
                const percentage = (count / slaMetrics.totalTickets) * 100;
                
                return (
                  <div key={sla.id} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={cn("font-medium", sla.color)}>{sla.name}</span>
                      <span className="text-muted-foreground">{count} tickets</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Priority Distribution */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-primary" />
                Tickets por Prioridade
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(Object.keys(priorityConfig) as TicketPriority[]).map(priority => {
                const config = priorityConfig[priority];
                const count = slaMetrics.ticketsByPriority[priority];
                const percentage = (count / slaMetrics.totalTickets) * 100;
                
                return (
                  <div key={priority} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={cn("font-medium", config.color)}>{config.label}</span>
                      <span className="text-muted-foreground">{count} tickets</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Support Agents */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Agentes de Suporte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {supportAgents.map(agent => (
                <div 
                  key={agent.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">{agent.activeTickets} tickets ativos</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por ticket, tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 bg-card border-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="open">Aberto</SelectItem>
              <SelectItem value="in_progress">Em Andamento</SelectItem>
              <SelectItem value="waiting_customer">Aguard. Cliente</SelectItem>
              <SelectItem value="resolved">Resolvido</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-48 bg-card border-border">
              <AlertCircle className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Prioridades</SelectItem>
              <SelectItem value="low">Baixa</SelectItem>
              <SelectItem value="medium">Média</SelectItem>
              <SelectItem value="high">Alta</SelectItem>
              <SelectItem value="critical">Crítica</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tickets List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Todos os Tickets ({filteredTickets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTickets.length === 0 ? (
                searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' ? (
                  <EmptySearchState onClear={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                    setPriorityFilter('all');
                  }} />
                ) : (
                  <EmptyTicketsState />
                )
              ) : (
                filteredTickets.map(ticket => {
                  const CategoryIcon = categoryIcons[ticket.category];
                  const priority = priorityConfig[ticket.priority];
                  const status = statusConfig[ticket.status];
                  const sla = slaLevels.find(s => s.id === ticket.slaLevel);
                  
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 bg-muted/30 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <CategoryIcon className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground">#{ticket.id}</span>
                          <Badge variant="outline" className="text-xs">
                            {ticket.tenantName}
                          </Badge>
                          <Badge className={cn("text-xs", priority.bgColor, priority.color)}>
                            {priority.label}
                          </Badge>
                          <Badge className={cn("text-xs", status.bgColor, status.color)}>
                            {status.label}
                          </Badge>
                          <Badge className={cn("text-xs border", sla?.color)}>
                            {sla?.name}
                          </Badge>
                          {ticket.slaBreached && (
                            <Badge className="text-xs bg-red-500/20 text-red-400">
                              SLA Violado
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-foreground truncate">{ticket.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          Aberto por {ticket.createdByName}
                          {ticket.assignedToName && ` • Atribuído a ${ticket.assignedToName}`}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</p>
                        {ticket.messages.length > 0 && (
                          <p className="text-xs text-primary mt-1">
                            {ticket.messages.length} mensagens
                          </p>
                        )}
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <TicketDetailModal
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
        mode="admin"
      />
    </DashboardLayout>
  );
}
