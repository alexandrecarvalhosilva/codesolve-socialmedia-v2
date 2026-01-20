import { useState, useMemo } from 'react';
import { 
  Shield, 
  ShieldOff, 
  LogIn, 
  LogOut, 
  AlertTriangle, 
  Ban,
  Search,
  Trash2,
  Download,
  Filter,
  RefreshCw,
  Clock,
  User,
  FileText,
  Package
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { useAudit, AuditEventType, AuditEvent } from '@/contexts/AuditContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

const eventTypeConfig: Record<AuditEventType, { 
  label: string; 
  icon: React.ElementType; 
  color: string;
  bgColor: string;
}> = {
  access_denied: { 
    label: 'Acesso Negado', 
    icon: ShieldOff, 
    color: 'text-destructive',
    bgColor: 'bg-destructive/10'
  },
  permission_denied: { 
    label: 'Permissão Negada', 
    icon: Ban, 
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10'
  },
  action_blocked: { 
    label: 'Ação Bloqueada', 
    icon: AlertTriangle, 
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10'
  },
  login_success: { 
    label: 'Login Sucesso', 
    icon: LogIn, 
    color: 'text-cs-success',
    bgColor: 'bg-cs-success/10'
  },
  login_failed: { 
    label: 'Login Falhou', 
    icon: LogIn, 
    color: 'text-destructive',
    bgColor: 'bg-destructive/10'
  },
  logout: { 
    label: 'Logout', 
    icon: LogOut, 
    color: 'text-cs-text-secondary',
    bgColor: 'bg-muted'
  },
  role_change: { 
    label: 'Alteração de Role', 
    icon: Shield, 
    color: 'text-cs-cyan',
    bgColor: 'bg-cs-cyan/10'
  },
  permission_check: { 
    label: 'Verificação', 
    icon: Shield, 
    color: 'text-cs-text-secondary',
    bgColor: 'bg-muted'
  },
  module_enabled: { 
    label: 'Módulo Ativado', 
    icon: Package, 
    color: 'text-cs-success',
    bgColor: 'bg-cs-success/10'
  },
  module_disabled: { 
    label: 'Módulo Desativado', 
    icon: Package, 
    color: 'text-cs-warning',
    bgColor: 'bg-cs-warning/10'
  },
};

export default function AuditLog() {
  const { events, clearEvents, getEventStats } = useAudit();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSuccess, setFilterSuccess] = useState<string>('all');
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);

  const stats = getEventStats();

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      // Filtro por tipo
      if (filterType !== 'all' && event.eventType !== filterType) return false;
      
      // Filtro por sucesso/falha
      if (filterSuccess === 'success' && !event.success) return false;
      if (filterSuccess === 'failed' && event.success) return false;
      
      // Filtro por busca
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.resource.toLowerCase().includes(query) ||
          event.userName?.toLowerCase().includes(query) ||
          event.details?.toLowerCase().includes(query) ||
          event.userRole?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [events, filterType, filterSuccess, searchQuery]);

  const handleClearEvents = () => {
    clearEvents();
    setIsClearDialogOpen(false);
    toast.success('Histórico de auditoria limpo com sucesso!');
  };

  const handleExport = () => {
    const headers = ['Data/Hora', 'Tipo', 'Usuário', 'Role', 'Recurso', 'Sucesso', 'Detalhes'];
    const rows = filteredEvents.map(event => [
      format(event.timestamp, "dd/MM/yyyy HH:mm:ss"),
      eventTypeConfig[event.eventType]?.label || event.eventType,
      event.userName || '-',
      event.userRole || '-',
      event.resource,
      event.success ? 'Sim' : 'Não',
      event.details || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `auditoria_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.csv`;
    link.click();
    
    toast.success('Relatório exportado com sucesso!');
  };

  return (
    <DashboardLayout>
      <Header />
      
      <div className="p-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cs-text-primary flex items-center gap-3">
              <Shield className="w-7 h-7 text-cs-cyan" />
              Auditoria de Segurança
            </h2>
            <p className="text-cs-text-secondary mt-1">
              Monitore tentativas de acesso negado e ações bloqueadas
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-border"
              onClick={handleExport}
              disabled={filteredEvents.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
            <Button
              variant="outline"
              className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setIsClearDialogOpen(true)}
              disabled={events.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-cs-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cs-text-primary">{stats.total}</p>
                <p className="text-sm text-cs-text-secondary">Total de Eventos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-cs-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <ShieldOff className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-destructive">{stats.denied}</p>
                <p className="text-sm text-cs-text-secondary">Acessos Negados</p>
              </div>
            </div>
          </div>
          
          <div className="bg-cs-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">{stats.blocked}</p>
                <p className="text-sm text-cs-text-secondary">Ações Bloqueadas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-cs-bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cs-success/10 rounded-lg">
                <Shield className="w-5 h-5 text-cs-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-cs-success">{stats.success}</p>
                <p className="text-sm text-cs-text-secondary">Operações Válidas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-text-muted" />
            <Input
              placeholder="Buscar por recurso, usuário ou detalhes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-cs-bg-card border-border"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] bg-cs-bg-card border-border">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Tipo de evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="access_denied">Acesso Negado</SelectItem>
              <SelectItem value="permission_denied">Permissão Negada</SelectItem>
              <SelectItem value="action_blocked">Ação Bloqueada</SelectItem>
              <SelectItem value="login_success">Login Sucesso</SelectItem>
              <SelectItem value="login_failed">Login Falhou</SelectItem>
              <SelectItem value="logout">Logout</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterSuccess} onValueChange={setFilterSuccess}>
            <SelectTrigger className="w-[150px] bg-cs-bg-card border-border">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="failed">Falha</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Events Table */}
        <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-cs-text-secondary">Data/Hora</TableHead>
                <TableHead className="text-cs-text-secondary">Tipo</TableHead>
                <TableHead className="text-cs-text-secondary">Usuário</TableHead>
                <TableHead className="text-cs-text-secondary">Recurso</TableHead>
                <TableHead className="text-cs-text-secondary">Status</TableHead>
                <TableHead className="text-cs-text-secondary text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32">
                    <EmptyState
                      icon={Shield}
                      title="Nenhum evento de auditoria"
                      description="Os eventos de segurança serão registrados aqui automaticamente"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.slice(0, 100).map((event, index) => {
                  const config = eventTypeConfig[event.eventType];
                  const Icon = config?.icon || Shield;
                  
                  return (
                    <TableRow 
                      key={event.id}
                      className="border-border hover:bg-cs-bg-card-hover cursor-pointer"
                      onClick={() => setSelectedEvent(event)}
                    >
                      <TableCell className="text-cs-text-secondary">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {format(event.timestamp, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full ${config?.bgColor}`}>
                          <Icon className={`w-4 h-4 ${config?.color}`} />
                          <span className={`text-sm font-medium ${config?.color}`}>
                            {config?.label}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-cs-text-muted" />
                          <div>
                            <p className="text-cs-text-primary">{event.userName || 'Anônimo'}</p>
                            {event.userRole && (
                              <p className="text-xs text-cs-text-muted capitalize">{event.userRole}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-cs-text-secondary font-mono text-sm">
                        {event.resource}
                      </TableCell>
                      <TableCell>
                        <Badge variant={event.success ? 'default' : 'destructive'}>
                          {event.success ? 'Sucesso' : 'Falha'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                        >
                          Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Clear Dialog */}
      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary">
              Limpar histórico de auditoria?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-secondary">
              Esta ação é irreversível. Todos os {events.length} eventos de auditoria serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearEvents}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Limpar Histórico
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent className="bg-cs-bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary flex items-center gap-2">
              {selectedEvent && (
                <>
                  {(() => {
                    const config = eventTypeConfig[selectedEvent.eventType];
                    const Icon = config?.icon || Shield;
                    return <Icon className={`w-5 h-5 ${config?.color}`} />;
                  })()}
                  Detalhes do Evento
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              Informações completas do evento de auditoria
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-cs-text-muted">Tipo</p>
                    <p className="text-cs-text-primary font-medium">
                      {eventTypeConfig[selectedEvent.eventType]?.label}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-cs-text-muted">Status</p>
                    <Badge variant={selectedEvent.success ? 'default' : 'destructive'}>
                      {selectedEvent.success ? 'Sucesso' : 'Falha'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-cs-text-muted">Data/Hora</p>
                    <p className="text-cs-text-primary">
                      {format(selectedEvent.timestamp, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-cs-text-muted">Usuário</p>
                    <p className="text-cs-text-primary">
                      {selectedEvent.userName || 'Anônimo'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-cs-text-muted">Role</p>
                    <p className="text-cs-text-primary capitalize">
                      {selectedEvent.userRole || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-cs-text-muted">Recurso</p>
                    <p className="text-cs-text-primary font-mono text-sm">
                      {selectedEvent.resource}
                    </p>
                  </div>
                </div>
                
                {selectedEvent.requiredRoles && selectedEvent.requiredRoles.length > 0 && (
                  <div>
                    <p className="text-sm text-cs-text-muted mb-2">Roles Requeridas</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.requiredRoles.map(role => (
                        <Badge key={role} variant="outline" className="capitalize">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedEvent.requiredPermissions && selectedEvent.requiredPermissions.length > 0 && (
                  <div>
                    <p className="text-sm text-cs-text-muted mb-2">Permissões Requeridas</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.requiredPermissions.map(perm => (
                        <Badge key={perm} variant="outline" className="font-mono text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedEvent.details && (
                  <div>
                    <p className="text-sm text-cs-text-muted mb-2">Detalhes</p>
                    <p className="text-cs-text-primary bg-muted/30 p-3 rounded-lg text-sm">
                      {selectedEvent.details}
                    </p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-cs-text-muted mb-2">User Agent</p>
                  <p className="text-cs-text-secondary text-xs font-mono break-all">
                    {selectedEvent.userAgent || '-'}
                  </p>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
