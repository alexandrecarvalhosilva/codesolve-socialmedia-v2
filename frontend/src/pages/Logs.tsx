import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { EmptyState, EmptySearchState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useToast } from '@/hooks/use-toast';

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  status: 'success' | 'error' | 'warning';
  ip: string;
  details?: string;
  userAgent?: string;
  duration?: string;
}

const initialLogs: LogEntry[] = [
  { 
    id: '1', 
    timestamp: '19/01/2026 14:32:15', 
    user: 'João Silva', 
    action: 'LOGIN', 
    resource: 'Sistema', 
    status: 'success', 
    ip: '192.168.1.100',
    details: 'Login realizado com sucesso via autenticação JWT',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    duration: '245ms'
  },
  { 
    id: '2', 
    timestamp: '19/01/2026 14:30:45', 
    user: 'Maria Santos', 
    action: 'TENANT_CREATE', 
    resource: 'Tenant: Empresa XYZ', 
    status: 'success', 
    ip: '192.168.1.101',
    details: 'Novo tenant criado com configurações padrão',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
    duration: '1.2s'
  },
  { 
    id: '3', 
    timestamp: '19/01/2026 14:28:22', 
    user: 'Sistema', 
    action: 'SYNC', 
    resource: 'Google Calendar', 
    status: 'success', 
    ip: '-',
    details: 'Sincronização automática de 45 eventos concluída',
    duration: '3.5s'
  },
  { 
    id: '4', 
    timestamp: '19/01/2026 14:25:10', 
    user: 'Pedro Costa', 
    action: 'ROLE_CHANGE', 
    resource: 'Usuário: Ana Lima', 
    status: 'success', 
    ip: '192.168.1.102',
    details: 'Alteração de permissões: Operador → Admin',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Firefox/121.0',
    duration: '189ms'
  },
  { 
    id: '5', 
    timestamp: '19/01/2026 14:20:33', 
    user: 'API', 
    action: 'WEBHOOK', 
    resource: 'WhatsApp', 
    status: 'error', 
    ip: '-',
    details: 'Erro 500: Falha na conexão com Evolution API - Timeout após 30s',
    duration: '30.1s'
  },
  { 
    id: '6', 
    timestamp: '19/01/2026 14:15:00', 
    user: 'Sistema', 
    action: 'BACKUP', 
    resource: 'Database', 
    status: 'success', 
    ip: '-',
    details: 'Backup completo do banco de dados (2.3GB)',
    duration: '45.2s'
  },
  { 
    id: '7', 
    timestamp: '19/01/2026 14:10:22', 
    user: 'Carlos Souza', 
    action: 'USER_DELETE', 
    resource: 'Usuário: João Teste', 
    status: 'warning', 
    ip: '192.168.1.103',
    details: 'Usuário removido - histórico de ações preservado para auditoria',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile/15E148',
    duration: '312ms'
  },
  { 
    id: '8', 
    timestamp: '19/01/2026 14:05:11', 
    user: 'Ana Lima', 
    action: 'EXPORT', 
    resource: 'Relatório Mensal', 
    status: 'success', 
    ip: '192.168.1.104',
    details: 'Relatório exportado em formato PDF (1.2MB)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    duration: '2.8s'
  },
  { 
    id: '9', 
    timestamp: '19/01/2026 13:55:00', 
    user: 'Admin Master', 
    action: 'PLAN_UPGRADE', 
    resource: 'Tenant: SIX BLADES', 
    status: 'success', 
    ip: '192.168.1.100',
    details: 'Upgrade de plano: Professional → Business',
    duration: '1.5s'
  },
  { 
    id: '10', 
    timestamp: '19/01/2026 13:50:30', 
    user: 'Sistema', 
    action: 'AI_CONFIG', 
    resource: 'Config IA: SIX BLADES', 
    status: 'success', 
    ip: '-',
    details: 'Limite de tokens alterado: 50.000 → 100.000/mês',
    duration: '89ms'
  },
  { 
    id: '11', 
    timestamp: '19/01/2026 13:45:15', 
    user: 'Maria Santos', 
    action: 'MODULE_ADD', 
    resource: 'Módulo: SLA Premium', 
    status: 'success', 
    ip: '192.168.1.101',
    details: 'Módulo SLA Premium adicionado ao tenant TECH CORP',
    duration: '456ms'
  },
  { 
    id: '12', 
    timestamp: '19/01/2026 13:40:00', 
    user: 'João Silva', 
    action: 'INVITE_SENT', 
    resource: 'Usuário: novo@email.com', 
    status: 'success', 
    ip: '192.168.1.100',
    details: 'Convite enviado para novo usuário com perfil Operador',
    duration: '890ms'
  },
  { 
    id: '13', 
    timestamp: '19/01/2026 13:35:22', 
    user: 'Sistema', 
    action: 'TEMPLATE_SELECT', 
    resource: 'Template: Academia Jiu-Jitsu', 
    status: 'success', 
    ip: '-',
    details: 'Template de nicho selecionado durante onboarding',
    duration: '123ms'
  },
  { 
    id: '14', 
    timestamp: '19/01/2026 13:30:00', 
    user: 'Pedro Costa', 
    action: 'PASSWORD_RESET', 
    resource: 'Usuário: ana.lima@empresa.com', 
    status: 'warning', 
    ip: '192.168.1.102',
    details: 'Solicitação de reset de senha enviada por email',
    duration: '567ms'
  },
  { 
    id: '15', 
    timestamp: '19/01/2026 13:25:45', 
    user: 'API', 
    action: 'AUTOMATION_RUN', 
    resource: 'Automação: Boas-vindas', 
    status: 'success', 
    ip: '-',
    details: 'Fluxo de boas-vindas executado para 12 novos contatos',
    duration: '2.3s'
  },
];

export default function Logs() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simula carregamento
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredLogs = logs.filter(log => 
    log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewLog = (log: LogEntry) => {
    setSelectedLog(log);
    setViewModalOpen(true);
  };

  const handleDeleteLog = (logId: string) => {
    setLogs(prev => prev.filter(l => l.id !== logId));
    setDeleteLogId(null);
    toast({
      title: "Log removido",
      description: "O evento foi removido do histórico.",
    });
  };

  const handleClearAll = () => {
    setLogs([]);
    setClearAllOpen(false);
    toast({
      title: "Logs limpos",
      description: "Todos os eventos foram removidos do histórico.",
    });
  };

  const handleExport = () => {
    // Gera CSV real dos logs
    const headers = ['Timestamp', 'Usuário', 'Ação', 'Recurso', 'Status', 'IP', 'Detalhes'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.timestamp,
        log.user,
        log.action,
        log.resource,
        log.status,
        log.ip,
        log.details || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `logs_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast({
      title: "Logs exportados",
      description: "O arquivo CSV foi baixado com sucesso.",
    });
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
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-28" />
            </div>
          </div>

          {/* Search Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 flex-1 max-w-md" />
            <Skeleton className="h-10 w-28" />
          </div>

          {/* Table Skeleton */}
          <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-muted/30 p-4 flex gap-6 border-b border-border">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-6">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16 rounded" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                  <div className="ml-auto flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header />
      
      <div className="p-8 space-y-6 opacity-0 animate-enter" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cs-text-primary flex items-center gap-3">
              <FileText className="w-7 h-7 text-cs-cyan" />
              Logs do Sistema
            </h2>
            <p className="text-cs-text-secondary mt-1">Histórico de atividades e eventos</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => setClearAllOpen(true)}
              disabled={logs.length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Todos
            </Button>
            <Button 
              variant="outline" 
              className="border-border text-cs-text-secondary"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-text-muted" />
            <Input
              placeholder="Buscar logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-cs-bg-card border-border text-cs-text-primary"
            />
          </div>
          <Button variant="outline" className="border-border text-cs-text-secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-cs-text-secondary">Timestamp</TableHead>
                <TableHead className="text-cs-text-secondary">Usuário</TableHead>
                <TableHead className="text-cs-text-secondary">Ação</TableHead>
                <TableHead className="text-cs-text-secondary">Recurso</TableHead>
                <TableHead className="text-cs-text-secondary">Status</TableHead>
                <TableHead className="text-cs-text-secondary">IP</TableHead>
                <TableHead className="text-cs-text-secondary text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32">
                    {searchTerm ? (
                      <EmptySearchState onClear={() => setSearchTerm('')} />
                    ) : (
                      <EmptyState
                        icon={FileText}
                        title="Nenhum log registrado"
                        description="Eventos do sistema aparecerão aqui quando ocorrerem"
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-cs-bg-card-hover">
                    <TableCell className="font-mono text-sm text-cs-text-muted">{log.timestamp}</TableCell>
                    <TableCell className="text-cs-text-primary">{log.user}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-cs-bg-primary text-cs-text-secondary">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-cs-text-secondary">{log.resource}</TableCell>
                    <TableCell>
                      <StatusPill 
                        status={log.status === 'success' ? 'success' : log.status === 'error' ? 'error' : 'warning'}
                        label={log.status === 'success' ? 'OK' : log.status === 'error' ? 'Erro' : 'Aviso'}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm text-cs-text-muted">{log.ip}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-cs-text-muted hover:text-cs-cyan"
                          onClick={() => handleViewLog(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-cs-text-muted hover:text-red-400"
                          onClick={() => setDeleteLogId(log.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* View Log Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary flex items-center gap-2">
              <Eye className="w-5 h-5 text-cs-cyan" />
              Detalhes do Evento
            </DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              Informações completas do log
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-cs-text-muted">Timestamp</label>
                  <p className="text-sm text-cs-text-primary font-mono">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <label className="text-xs text-cs-text-muted">Usuário</label>
                  <p className="text-sm text-cs-text-primary">{selectedLog.user}</p>
                </div>
                <div>
                  <label className="text-xs text-cs-text-muted">Ação</label>
                  <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-cs-bg-primary text-cs-text-secondary">
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-cs-text-muted">Status</label>
                  <div className="mt-1">
                    <StatusPill 
                      status={selectedLog.status === 'success' ? 'success' : selectedLog.status === 'error' ? 'error' : 'warning'}
                      label={selectedLog.status === 'success' ? 'OK' : selectedLog.status === 'error' ? 'Erro' : 'Aviso'}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs text-cs-text-muted">Recurso</label>
                <p className="text-sm text-cs-text-primary">{selectedLog.resource}</p>
              </div>

              <div>
                <label className="text-xs text-cs-text-muted">IP de Origem</label>
                <p className="text-sm text-cs-text-primary font-mono">{selectedLog.ip}</p>
              </div>

              {selectedLog.duration && (
                <div>
                  <label className="text-xs text-cs-text-muted">Duração</label>
                  <p className="text-sm text-cs-text-primary">{selectedLog.duration}</p>
                </div>
              )}

              {selectedLog.userAgent && (
                <div>
                  <label className="text-xs text-cs-text-muted">User Agent</label>
                  <p className="text-xs text-cs-text-secondary font-mono break-all">{selectedLog.userAgent}</p>
                </div>
              )}

              {selectedLog.details && (
                <div>
                  <label className="text-xs text-cs-text-muted">Detalhes</label>
                  <p className="text-sm text-cs-text-secondary bg-cs-bg-primary p-3 rounded-lg">{selectedLog.details}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)} className="border-border">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Single Log Confirmation */}
      <AlertDialog open={!!deleteLogId} onOpenChange={() => setDeleteLogId(null)}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Remover Evento
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-secondary">
              Tem certeza que deseja remover este evento do histórico? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border text-cs-text-secondary hover:bg-cs-bg-card-hover">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={() => deleteLogId && handleDeleteLog(deleteLogId)}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Logs Confirmation */}
      <AlertDialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Limpar Todos os Logs
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-secondary">
              Tem certeza que deseja remover TODOS os eventos do histórico? Esta ação é irreversível e removerá {logs.length} registros.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border text-cs-text-secondary hover:bg-cs-bg-card-hover">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleClearAll}
            >
              Limpar Todos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
