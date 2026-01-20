import { useState, useEffect, useCallback } from 'react';
import { 
  Bot,
  Play,
  Pause,
  Settings,
  Plus,
  Trash2,
  Clock,
  Zap,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import type { Automation } from '@/lib/apiTypes';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export function TenantAutomationsTab() {
  const { user } = useAuth();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Estatísticas calculadas
  const stats = {
    active: automations.filter(a => a.status === 'active').length,
    paused: automations.filter(a => a.status === 'inactive').length,
    totalExecutions: automations.reduce((sum, a) => sum + (a.executionCount || 0), 0),
    lastExecution: automations.length > 0 
      ? Math.min(...automations.map(a => Date.now() - new Date(a.updatedAt).getTime()))
      : 0,
  };

  const formatLastExecution = (ms: number) => {
    if (ms === 0) return '-';
    const minutes = Math.floor(ms / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const fetchAutomations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/automations', {
        params: { tenantId: user?.tenantId },
      });
      if (response.data.success) {
        setAutomations(response.data.data || []);
      }
    } catch (err) {
      setError('Erro ao carregar automações');
      console.error('Erro ao buscar automações:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.tenantId]);

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  const handleToggle = async (id: string) => {
    try {
      setTogglingId(id);
      const response = await api.post(`/automations/${id}/toggle`);
      if (response.data.success) {
        setAutomations(prev => prev.map(a => 
          a.id === id ? { ...a, status: response.data.data.status } : a
        ));
        toast.success('Status da automação atualizado');
      }
    } catch (err) {
      toast.error('Erro ao alterar status da automação');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await api.delete(`/automations/${deleteId}`);
      if (response.data.success) {
        setAutomations(prev => prev.filter(a => a.id !== deleteId));
        toast.success('Automação excluída com sucesso');
      }
    } catch (err) {
      toast.error('Erro ao excluir automação');
    } finally {
      setDeleteId(null);
    }
  };

  const formatDate = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min atrás`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h atrás`;
    return `${Math.floor(hours / 24)} dias atrás`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-cs-text-secondary mb-4">{error}</p>
        <Button onClick={fetchAutomations} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cs-text-primary">Automações</h2>
          <p className="text-sm text-cs-text-secondary">Gerencie fluxos automatizados para este tenant</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchAutomations} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button className="bg-cs-cyan text-white">
            <Plus className="w-4 h-4 mr-2" />
            Nova Automação
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-cs-cyan" />
            <span className="text-sm text-cs-text-secondary">Total Ativas</span>
          </div>
          <p className="text-2xl font-bold text-cs-text-primary">{stats.active}</p>
        </div>
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Pause className="w-4 h-4 text-cs-warning" />
            <span className="text-sm text-cs-text-secondary">Pausadas</span>
          </div>
          <p className="text-2xl font-bold text-cs-text-primary">{stats.paused}</p>
        </div>
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-cs-success" />
            <span className="text-sm text-cs-text-secondary">Execuções (24h)</span>
          </div>
          <p className="text-2xl font-bold text-cs-text-primary">{stats.totalExecutions.toLocaleString()}</p>
        </div>
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-cs-text-muted" />
            <span className="text-sm text-cs-text-secondary">Última Execução</span>
          </div>
          <p className="text-2xl font-bold text-cs-text-primary">{formatLastExecution(stats.lastExecution)}</p>
        </div>
      </div>

      {/* Automations List */}
      {automations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-cs-bg-card border border-border rounded-xl">
          <Bot className="w-12 h-12 text-cs-text-muted mb-4" />
          <p className="text-cs-text-secondary mb-4">Nenhuma automação encontrada</p>
          <Button className="bg-cs-cyan text-white">
            <Plus className="w-4 h-4 mr-2" />
            Criar primeira automação
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {automations.map((automation) => (
            <div 
              key={automation.id}
              className="bg-cs-bg-card border border-border rounded-xl p-4 hover:border-cs-cyan/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    automation.status === 'active' ? 'bg-cs-success/10' : 'bg-cs-warning/10'
                  }`}>
                    <Bot className={`w-5 h-5 ${
                      automation.status === 'active' ? 'text-cs-success' : 'text-cs-warning'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-cs-text-primary">{automation.name}</h3>
                    <p className="text-sm text-cs-text-secondary">{automation.description || 'Sem descrição'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-cs-text-secondary">
                      {(automation.executionCount || 0).toLocaleString()} execuções
                    </p>
                    <p className="text-xs text-cs-text-muted">
                      Última: {formatDate(automation.updatedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={automation.status === 'active'}
                      disabled={togglingId === automation.id}
                      onCheckedChange={() => handleToggle(automation.id)}
                      className="data-[state=checked]:bg-cs-success"
                    />
                    <Button variant="ghost" size="icon" className="text-cs-text-muted hover:text-cs-text-primary">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-cs-text-muted hover:text-cs-error"
                      onClick={() => setDeleteId(automation.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir automação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A automação será permanentemente excluída.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
