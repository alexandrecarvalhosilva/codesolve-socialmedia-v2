import { useState, useEffect } from 'react';
import { 
  Headphones, 
  Plus, 
  Search, 
  Filter,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Wrench,
  CreditCard,
  Plug,
  HelpCircle,
  Brain,
  Zap,
  User,
  RefreshCw
} from 'lucide-react';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTickets, useSLAs, useCreateTicket } from '@/hooks/useSupport';
import { 
  Ticket, 
  TicketStatus, 
  priorityConfig, 
  statusConfig, 
  categoryConfig,
  TicketCategory
} from '@/types/support';
import { CreateTicketModal } from '@/components/support/CreateTicketModal';
import { TicketDetailModal } from '@/components/support/TicketDetailModal';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

export default function TenantSupport() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const { tickets, isLoading: ticketsLoading, fetchTickets } = useTickets();
  const { slas, isLoading: slasLoading, fetchSLAs } = useSLAs();
  const { createTicket, isCreating } = useCreateTicket();

  const isLoading = ticketsLoading || slasLoading;

  useEffect(() => {
    fetchTickets({ status: statusFilter !== 'all' ? statusFilter : undefined });
    fetchSLAs();
  }, [statusFilter]);

  const handleRefresh = () => {
    fetchTickets({ status: statusFilter !== 'all' ? statusFilter : undefined });
    toast.success('Lista atualizada');
  };

  const handleCreateTicket = async (data: any) => {
    try {
      await createTicket(data);
      setCreateModalOpen(false);
      toast.success('Ticket criado com sucesso');
      fetchTickets();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar ticket');
    }
  };
  
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  // Get current SLA level for tenant
  const currentSLA = slas.find(s => s.id === 'premium') || slas[0];

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: TicketStatus) => {
    const config = statusConfig[status];
    return (
      <Badge 
        variant="outline" 
        className={cn("text-xs", config.className)}
      >
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <TenantLayout>
        <Header />
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
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
              <Skeleton className="h-10 w-full mb-4" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full mb-2" />
              ))}
            </CardContent>
          </Card>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <Header />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Headphones className="w-7 h-7 text-cs-cyan" />
              Suporte
            </h1>
            <p className="text-muted-foreground">Gerencie seus tickets de suporte</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              className="bg-cs-cyan hover:bg-cs-cyan/90"
              onClick={() => setCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Ticket
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tickets Abertos</p>
                  <p className="text-2xl font-bold text-foreground">{openTickets}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-cs-warning/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-cs-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolvidos</p>
                  <p className="text-2xl font-bold text-foreground">{resolvedTickets}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-cs-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-cs-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Seu SLA</p>
                  <p className="text-2xl font-bold text-foreground">{currentSLA?.name || 'Básico'}</p>
                </div>
                <Badge variant="outline" className="text-cs-cyan border-cs-cyan">
                  {currentSLA?.responseTime || '24h'} resposta
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-cs-bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título ou ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-cs-bg-primary border-border"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-cs-bg-primary border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="open">Aberto</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="waiting">Aguardando</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle>Meus Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTickets.length === 0 ? (
              <div className="text-center py-8">
                <Headphones className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum ticket encontrado</p>
                <Button 
                  className="mt-4 bg-cs-cyan hover:bg-cs-cyan/90"
                  onClick={() => setCreateModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Ticket
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => {
                  const CategoryIcon = categoryIcons[ticket.category] || HelpCircle;
                  const priorityCfg = priorityConfig[ticket.priority];
                  
                  return (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 bg-cs-bg-primary rounded-lg border border-border hover:border-cs-cyan/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          `bg-${priorityCfg.color}/10`
                        )}>
                          <CategoryIcon className={cn("w-5 h-5", `text-${priorityCfg.color}`)} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">{ticket.title}</p>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span>#{ticket.id}</span>
                            <span>•</span>
                            <span>{categoryConfig[ticket.category]?.label}</span>
                            <span>•</span>
                            <span>{formatDate(ticket.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={priorityCfg.className}>
                          {priorityCfg.label}
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

      {/* Create Ticket Modal */}
      <CreateTicketModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateTicket}
        isSubmitting={isCreating}
      />

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
          onUpdate={() => fetchTickets()}
        />
      )}
    </TenantLayout>
  );
}
