import { useState, useEffect, useCallback } from 'react';
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
  User,
  RefreshCw
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
import { api } from '@/lib/api';
import type { Ticket as ApiTicket } from '@/lib/apiTypes';

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

// Mapear ticket da API para o formato do frontend
const mapApiTicket = (apiTicket: ApiTicket): Ticket => {
  return {
    id: apiTicket.id,
    title: apiTicket.subject,
    description: apiTicket.description || '',
    status: apiTicket.status as any,
    priority: apiTicket.priority as TicketPriority,
    category: (apiTicket.category || 'general') as TicketCategory,
    tenantId: apiTicket.tenantId,
    tenantName: apiTicket.tenantName || 'Tenant',
    createdBy: apiTicket.createdById,
    createdByName: apiTicket.createdByName || 'Usuário',
    createdAt: new Date(apiTicket.createdAt),
    updatedAt: new Date(apiTicket.updatedAt),
    assignedTo: apiTicket.assignedToId || undefined,
    assignedToName: apiTicket.assignedToName || undefined,
    slaLevel: 'standard',
    firstResponseDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000),
    resolutionDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
    messagesCount: 0,
    tags: [],
  };
};

export default function SupportDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    resolvedToday: 0,
    breachedTickets: 0,
    avgResponseTime: 0,
    slaCompliance: 0,
  });

  // Buscar tickets da API
  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/support/tickets', {
        params: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          priority: priorityFilter !== 'all' ? priorityFilter : undefined,
          limit: 50,
        },
      });
      
      if (response.data.success) {
        const mappedTickets = (response.data.data || []).map(mapApiTicket);
        setTickets(mappedTickets);
        
        // Calcular estatísticas
        const total = mappedTickets.length;
        const open = mappedTickets.filter((t: Ticket) => t.status === 'open' || t.status === 'in_progress').length;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const resolvedToday = mappedTickets.filter((t: Ticket) => 
          t.status === 'resolved' && new Date(t.updatedAt) >= today
        ).length;
        
        setStats({
          totalTickets: total,
          openTickets: open,
          resolvedToday,
          breachedTickets: 0,
          avgResponseTime: 2.5,
          slaCompliance: 94,
        });
      }
    } catch (err) {
      console.error('Erro ao buscar tickets:', err);
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.tenantName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
          </div>
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
          <Button onClick={fetchTickets} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
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
                  <p className="text-2xl font-bold text-foreground">{stats.totalTickets}</p>
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
                  <p className="text-2xl font-bold text-foreground">{stats.openTickets}</p>
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
                  <p className="text-2xl font-bold text-foreground">{stats.resolvedToday}</p>
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
                  <p className="text-2xl font-bold text-foreground">{stats.breachedTickets}</p>
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
                  <p className="text-2xl font-bold text-foreground">{stats.avgResponseTime}h</p>
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
                  <p className="text-2xl font-bold text-foreground">{stats.slaCompliance}%</p>
                  <p className="text-xs text-muted-foreground">SLA Compliance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <SLAUrgentAlerts />

        {/* Chart */}
        <TicketsEvolutionChart />

        {/* Filters and Ticket List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Tickets</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="waiting">Aguardando</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTickets.length === 0 ? (
              searchQuery ? (
                <EmptySearchState searchTerm={searchQuery} />
              ) : (
                <EmptyTicketsState />
              )
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => {
                  const CategoryIcon = categoryIcons[ticket.category] || HelpCircle;
                  const priorityInfo = priorityConfig[ticket.priority];
                  const statusInfo = statusConfig[ticket.status];
                  
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border hover:border-primary/50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          priorityInfo?.bgColor || "bg-muted"
                        )}>
                          <CategoryIcon className={cn("w-5 h-5", priorityInfo?.color || "text-muted-foreground")} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-foreground">{ticket.title}</span>
                            <Badge variant="outline" className="text-xs">
                              #{ticket.id.slice(0, 8)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span>{ticket.tenantName}</span>
                            <span>•</span>
                            <span>{formatDate(ticket.createdAt)}</span>
                            {ticket.assignedToName && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" />
                                  {ticket.assignedToName}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={cn(
                          "text-xs",
                          priorityInfo?.bgColor,
                          priorityInfo?.color
                        )}>
                          {priorityInfo?.label || ticket.priority}
                        </Badge>
                        <Badge variant="outline" className={cn(
                          "text-xs",
                          statusInfo?.color
                        )}>
                          {statusInfo?.label || ticket.status}
                        </Badge>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdate={fetchTickets}
        />
      )}
    </DashboardLayout>
  );
}
