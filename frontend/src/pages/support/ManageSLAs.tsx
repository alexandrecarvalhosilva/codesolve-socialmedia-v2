import { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Edit2, 
  Trash2,
  AlertTriangle,
  Check,
  Timer,
  Shield,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useSLAs, useCreateSLA, useUpdateSLA, useDeleteSLA } from '@/hooks/useSupport';
import { SLA } from '@/lib/apiTypes';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ManageSLAs() {
  const { toast } = useToast();
  const { slas, isLoading, refetch } = useSLAs();
  const { createSLA, isCreating } = useCreateSLA({
    onSuccess: () => {
      toast({ title: "SLA criado", description: "O nível de SLA foi criado com sucesso." });
      refetch();
      setCreateModalOpen(false);
    },
    onError: (error) => toast({ title: "Erro", description: error.message, variant: "destructive" })
  });
  const { updateSLA, isUpdating } = useUpdateSLA({
    onSuccess: () => {
      toast({ title: "SLA atualizado", description: "As alterações foram salvas." });
      refetch();
      setEditModalOpen(false);
    },
    onError: (error) => toast({ title: "Erro", description: error.message, variant: "destructive" })
  });
  const { deleteSLA, isDeleting } = useDeleteSLA({
    onSuccess: () => {
      toast({ title: "SLA removido", description: "O nível de SLA foi removido." });
      refetch();
      setDeleteSlaId(null);
    },
    onError: (error) => toast({ title: "Erro", description: error.message, variant: "destructive" })
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteSlaId, setDeleteSlaId] = useState<string | null>(null);
  const [selectedSLA, setSelectedSLA] = useState<SLA | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    firstResponseMinutes: 1440, // 24h
    resolutionMinutes: 4320, // 72h
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    isDefault: false,
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      firstResponseMinutes: 1440,
      resolutionMinutes: 4320,
      priority: 'medium',
      isDefault: false,
    });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (sla: SLA) => {
    setSelectedSLA(sla);
    setFormData({
      name: sla.name,
      description: sla.description || '',
      firstResponseMinutes: sla.firstResponseMinutes,
      resolutionMinutes: sla.resolutionMinutes,
      priority: sla.priority as any,
      isDefault: sla.isDefault || false,
    });
    setEditModalOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    await createSLA(formData);
  };

  const handleSave = async () => {
    if (!selectedSLA) return;
    await updateSLA(selectedSLA.id, formData);
  };

  const handleDelete = async () => {
    if (!deleteSlaId) return;
    await deleteSLA(deleteSlaId);
  };

  const formatMinutes = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `${days}d`;
    return `${days}d ${remainingHours}h`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-blue-400';
      default: return 'text-green-400';
    }
  };

  return (
    <DashboardLayout>
      <Header />
      
      <div className="p-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Clock className="w-7 h-7 text-primary" />
              Gerenciar SLAs
            </h2>
            <p className="text-muted-foreground mt-1">Configure os níveis de SLA disponíveis para os tenants</p>
          </div>
          
          <Button 
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
            onClick={handleOpenCreate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo SLA
          </Button>
        </div>

        {/* SLA Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 w-full" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {slas.map(sla => (
              <Card key={sla.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Shield className={cn("w-6 h-6", getPriorityColor(sla.priority))} />
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(sla)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                        onClick={() => setDeleteSlaId(sla.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className={cn("text-xl font-bold", getPriorityColor(sla.priority))}>{sla.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{sla.description || 'Sem descrição'}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Resposta:</span>
                      <span className="text-sm font-medium text-foreground">{formatMinutes(sla.firstResponseMinutes)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Resolução:</span>
                      <span className="text-sm font-medium text-foreground">{formatMinutes(sla.resolutionMinutes)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <Badge variant="outline" className={cn("capitalize", getPriorityColor(sla.priority))}>
                      {sla.priority}
                    </Badge>
                    {sla.isDefault && (
                      <Badge className="bg-primary/20 text-primary border-0">Padrão</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={createModalOpen || editModalOpen} onOpenChange={(open) => { setCreateModalOpen(false); setEditModalOpen(false); }}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {editModalOpen ? 'Editar SLA' : 'Novo SLA'}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Configure os parâmetros do nível de SLA
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name" className="text-muted-foreground">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-muted border-border text-foreground mt-1"
                  placeholder="Ex: Premium"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description" className="text-muted-foreground">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-muted border-border text-foreground mt-1"
                  placeholder="Descreva o nível de suporte oferecido"
                />
              </div>

              <div>
                <Label htmlFor="firstResponseMinutes" className="text-muted-foreground">Tempo de Resposta (minutos)</Label>
                <Input
                  id="firstResponseMinutes"
                  type="number"
                  min="1"
                  value={formData.firstResponseMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstResponseMinutes: parseInt(e.target.value) || 0 }))}
                  className="bg-muted border-border text-foreground mt-1"
                />
              </div>

              <div>
                <Label htmlFor="resolutionMinutes" className="text-muted-foreground">Tempo de Resolução (minutos)</Label>
                <Input
                  id="resolutionMinutes"
                  type="number"
                  min="1"
                  value={formData.resolutionMinutes}
                  onChange={(e) => setFormData(prev => ({ ...prev, resolutionMinutes: parseInt(e.target.value) || 0 }))}
                  className="bg-muted border-border text-foreground mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label className="text-muted-foreground">Prioridade</Label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {['low', 'medium', 'high', 'urgent'].map(p => (
                    <Button
                      key={p}
                      type="button"
                      variant={formData.priority === p ? 'default' : 'outline'}
                      size="sm"
                      className="capitalize"
                      onClick={() => setFormData(prev => ({ ...prev, priority: p as any }))}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); }} 
              className="border-border"
              disabled={isCreating || isUpdating}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-primary to-accent"
              onClick={editModalOpen ? handleSave : handleCreate}
              disabled={isCreating || isUpdating}
            >
              {(isCreating || isUpdating) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editModalOpen ? 'Salvar Alterações' : 'Criar SLA'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteSlaId} onOpenChange={() => setDeleteSlaId(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Remover SLA
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja remover este nível de SLA? Tenants com este SLA serão migrados para o nível padrão.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border text-muted-foreground hover:bg-card">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
