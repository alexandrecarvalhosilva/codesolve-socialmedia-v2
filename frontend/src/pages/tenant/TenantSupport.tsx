import { useState } from 'react';
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
  User
} from 'lucide-react';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockTickets, slaLevels } from '@/data/supportMockData';
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

  // Filter tickets for current tenant (mock: tenant1)
  const tenantTickets = mockTickets.filter(t => t.tenantId === 'tenant1');
  
  const filteredTickets = tenantTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openTickets = tenantTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedTickets = tenantTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  // Get current SLA level for tenant (mock)
  const currentSLA = slaLevels.find(s => s.id === 'premium');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <TenantLayout>
      <Header />
      
      <div className="p-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Headphones className="w-7 h-7 text-primary" />
              Suporte
            </h2>
            <p className="text-muted-foreground mt-1">Abra e acompanhe seus tickets de suporte</p>
          </div>
          
          <Button 
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={() => setCreateModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Ticket
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{tenantTickets.length}</p>
                  <p className="text-xs text-muted-foreground">Total de Tickets</p>
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
                  <p className="text-2xl font-bold text-foreground">{openTickets}</p>
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
                  <p className="text-2xl font-bold text-foreground">{resolvedTickets}</p>
                  <p className="text-xs text-muted-foreground">Resolvidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className={cn("text-lg font-bold", currentSLA?.color)}>{currentSLA?.name}</p>
                  <p className="text-xs text-muted-foreground">Seu SLA</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tickets..."
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
        </div>

        {/* Tickets List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Meus Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTickets.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Headphones className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum ticket encontrado</p>
                  <Button 
                    variant="link" 
                    className="text-primary mt-2"
                    onClick={() => setCreateModalOpen(true)}
                  >
                    Criar novo ticket
                  </Button>
                </div>
              ) : (
                filteredTickets.map(ticket => {
                  const CategoryIcon = categoryIcons[ticket.category];
                  const priority = priorityConfig[ticket.priority];
                  const status = statusConfig[ticket.status];
                  
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
                          <Badge className={cn("text-xs", priority.bgColor, priority.color)}>
                            {priority.label}
                          </Badge>
                          <Badge className={cn("text-xs", status.bgColor, status.color)}>
                            {status.label}
                          </Badge>
                          {ticket.slaBreached && (
                            <Badge className="text-xs bg-red-500/20 text-red-400">
                              SLA Violado
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-foreground truncate">{ticket.title}</h4>
                        <p className="text-sm text-muted-foreground truncate">{ticket.description}</p>
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

      <CreateTicketModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />

      <TicketDetailModal
        ticket={selectedTicket}
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
        mode="tenant"
      />
    </TenantLayout>
  );
}
