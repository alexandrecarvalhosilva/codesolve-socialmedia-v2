import { useState, useEffect, useCallback } from 'react';
import { FileText, Search, Filter, Download, Eye, Trash2, AlertTriangle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { EmptyState, EmptySearchState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { useLogs, AuditLog } from '@/hooks/useLogs';

// Map action to status for display
const getStatusFromAction = (action: string): 'success' | 'error' | 'warning' => {
  const errorActions = ['DELETE', 'ERROR', 'FAILED', 'BLOCK'];
  const warningActions = ['WARNING', 'RESET', 'SUSPEND'];
  
  if (errorActions.some(a => action.toUpperCase().includes(a))) return 'error';
  if (warningActions.some(a => action.toUpperCase().includes(a))) return 'warning';
  return 'success';
};

// Format date for display
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return dateString;
  }
};

export default function Logs() {
  const { toast } = useToast();
  const { logs, total, page, totalPages, isLoading, error, fetchLogs, exportLogs, setPage } = useLogs();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null);
  const [clearAllOpen, setClearAllOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  // Filters
  const [actionFilter, setActionFilter] = useState<string>('');
  const [entityFilter, setEntityFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Fetch logs on mount and when filters change
  useEffect(() => {
    const filters: Record<string, string | number> = { page, limit: 20 };
    if (actionFilter) filters.action = actionFilter;
    if (entityFilter) filters.entity = entityFilter;
    if (dateFilter) {
      const now = new Date();
      let startDate: Date;
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        default:
          startDate = new Date(0);
      }
      filters.startDate = startDate.toISOString();
    }
    fetchLogs(filters);
  }, [fetchLogs, page, actionFilter, entityFilter, dateFilter]);

  // Filter logs by search term (client-side)
  const filteredLogs = logs.filter(log => 
    (log.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.entity.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setViewModalOpen(true);
  };

  const handleDeleteLog = (logId: string) => {
    // Note: API doesn't support individual log deletion for audit purposes
    // This is just for UI demonstration
    setDeleteLogId(null);
    toast({
      title: "Operação não permitida",
      description: "Logs de auditoria não podem ser removidos individualmente por questões de compliance.",
      variant: "destructive",
    });
  };

  const handleClearAll = () => {
    setClearAllOpen(false);
    toast({
      title: "Operação não permitida",
      description: "Logs de auditoria não podem ser limpos por questões de compliance.",
      variant: "destructive",
    });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportLogs({
        action: actionFilter,
        entity: entityFilter,
      }, 'csv');
      toast({
        title: "Logs exportados",
        description: "O arquivo CSV foi baixado com sucesso.",
      });
    } catch (err) {
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar os logs.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    fetchLogs({ page, limit: 20 });
  };

  // Get unique actions and entities for filters
  const uniqueActions = [...new Set(logs.map(l => l.action))];
  const uniqueEntities = [...new Set(logs.map(l => l.entity))];

  if (isLoading && logs.length === 0) {
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
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-16 rounded" />
                  <Skeleton className="h-4 w-28" />
                  <div className="flex gap-2 ml-auto">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
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
      
      <div className="p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cs-text-primary flex items-center gap-3">
              <FileText className="w-7 h-7 text-cs-cyan" />
              Logs de Auditoria
            </h2>
            <p className="text-cs-text-secondary mt-1">
              Histórico de ações do sistema ({total} registros)
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="border-border text-cs-text-secondary"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button 
              variant="outline" 
              className="border-border text-cs-text-secondary"
              onClick={handleExport}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cs-text-muted" />
            <Input
              placeholder="Buscar por usuário, ação ou recurso..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-cs-bg-card border-border text-cs-text-primary"
            />
          </div>
          
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-40 bg-cs-bg-card border-border text-cs-text-primary">
              <SelectValue placeholder="Ação" />
            </SelectTrigger>
            <SelectContent className="bg-cs-bg-card border-border">
              <SelectItem value="" className="text-cs-text-primary">Todas as ações</SelectItem>
              {uniqueActions.map(action => (
                <SelectItem key={action} value={action} className="text-cs-text-primary">
                  {action}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-40 bg-cs-bg-card border-border text-cs-text-primary">
              <SelectValue placeholder="Entidade" />
            </SelectTrigger>
            <SelectContent className="bg-cs-bg-card border-border">
              <SelectItem value="" className="text-cs-text-primary">Todas as entidades</SelectItem>
              {uniqueEntities.map(entity => (
                <SelectItem key={entity} value={entity} className="text-cs-text-primary">
                  {entity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40 bg-cs-bg-card border-border text-cs-text-primary">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent className="bg-cs-bg-card border-border">
              <SelectItem value="" className="text-cs-text-primary">Todo período</SelectItem>
              <SelectItem value="today" className="text-cs-text-primary">Hoje</SelectItem>
              <SelectItem value="week" className="text-cs-text-primary">Última semana</SelectItem>
              <SelectItem value="month" className="text-cs-text-primary">Último mês</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <p className="text-red-400">{error}</p>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Table */}
        {filteredLogs.length === 0 && !isLoading ? (
          searchTerm ? (
            <EmptySearchState 
              searchTerm={searchTerm}
              onClear={() => setSearchTerm('')}
            />
          ) : (
            <EmptyState
              icon={FileText}
              title="Nenhum log encontrado"
              description="Os logs de auditoria aparecerão aqui conforme as ações são realizadas no sistema."
            />
          )
        ) : (
          <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border">
                  <TableHead className="text-cs-text-secondary">Data/Hora</TableHead>
                  <TableHead className="text-cs-text-secondary">Usuário</TableHead>
                  <TableHead className="text-cs-text-secondary">Ação</TableHead>
                  <TableHead className="text-cs-text-secondary">Entidade</TableHead>
                  <TableHead className="text-cs-text-secondary">Status</TableHead>
                  <TableHead className="text-cs-text-secondary">IP</TableHead>
                  <TableHead className="text-right text-cs-text-secondary">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id} className="border-border hover:bg-cs-bg-card-hover">
                    <TableCell className="text-cs-text-muted font-mono text-sm">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell className="text-cs-text-primary">
                      {log.user?.name || 'Sistema'}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-cs-bg-primary text-cs-text-secondary">
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="text-cs-text-secondary">
                      {log.entity}
                      {log.entityId && (
                        <span className="text-cs-text-muted ml-1">#{log.entityId.slice(0, 8)}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusPill status={getStatusFromAction(log.action)} />
                    </TableCell>
                    <TableCell className="text-cs-text-muted font-mono text-sm">
                      {log.ipAddress || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-cs-text-muted hover:text-cs-cyan"
                          onClick={() => handleViewLog(log)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-cs-text-muted">
                  Página {page} de {totalPages} ({total} registros)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="border-border"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="border-border"
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* View Log Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary flex items-center gap-2">
              <Eye className="w-5 h-5 text-cs-cyan" />
              Detalhes do Log
            </DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              Informações completas do evento de auditoria
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-cs-text-muted text-xs">Data/Hora</Label>
                  <p className="text-cs-text-primary font-mono text-sm">
                    {formatDate(selectedLog.createdAt)}
                  </p>
                </div>
                <div>
                  <Label className="text-cs-text-muted text-xs">Usuário</Label>
                  <p className="text-cs-text-primary">{selectedLog.user?.name || 'Sistema'}</p>
                </div>
                <div>
                  <Label className="text-cs-text-muted text-xs">Ação</Label>
                  <span className="px-2 py-1 rounded text-xs font-medium bg-cs-bg-primary text-cs-text-secondary">
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <Label className="text-cs-text-muted text-xs">Status</Label>
                  <StatusPill status={getStatusFromAction(selectedLog.action)} />
                </div>
              </div>

              <div>
                <Label className="text-cs-text-muted text-xs">Entidade</Label>
                <p className="text-cs-text-primary">
                  {selectedLog.entity}
                  {selectedLog.entityId && (
                    <span className="text-cs-text-muted ml-1">({selectedLog.entityId})</span>
                  )}
                </p>
              </div>

              <div>
                <Label className="text-cs-text-muted text-xs">Endereço IP</Label>
                <p className="text-cs-text-primary font-mono text-sm">
                  {selectedLog.ipAddress || 'Não disponível'}
                </p>
              </div>

              {selectedLog.userAgent && (
                <div>
                  <Label className="text-cs-text-muted text-xs">User Agent</Label>
                  <p className="text-cs-text-secondary text-sm break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <Label className="text-cs-text-muted text-xs">Metadados</Label>
                  <pre className="bg-cs-bg-primary p-3 rounded-lg text-xs text-cs-text-secondary overflow-auto max-h-32">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
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

      {/* Delete Log Confirmation */}
      <AlertDialog open={!!deleteLogId} onOpenChange={() => setDeleteLogId(null)}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-cs-warning" />
              Remover Log
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-secondary">
              Logs de auditoria são protegidos e não podem ser removidos individualmente por questões de compliance e segurança.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Entendi</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Confirmation */}
      <AlertDialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-cs-warning" />
              Limpar Todos os Logs
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-secondary">
              Logs de auditoria são protegidos e não podem ser limpos por questões de compliance e segurança.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Entendi</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
