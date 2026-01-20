import { useState } from 'react';
import { 
  Clock, 
  Plus, 
  Edit2, 
  Trash2,
  AlertTriangle,
  Check,
  Timer,
  Shield
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { slaLevels as initialSLAs } from '@/data/supportMockData';
import { SLALevel } from '@/types/support';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ManageSLAs() {
  const { toast } = useToast();
  const [slaLevels, setSlaLevels] = useState<SLALevel[]>(initialSLAs);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteSlaId, setDeleteSlaId] = useState<string | null>(null);
  const [selectedSLA, setSelectedSLA] = useState<SLALevel | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    responseTime: 24,
    resolutionTime: 72,
    price: 0,
  });

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      description: '',
      responseTime: 24,
      resolutionTime: 72,
      price: 0,
    });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (sla: SLALevel) => {
    setSelectedSLA(sla);
    setFormData({
      name: sla.name,
      description: sla.description,
      responseTime: sla.responseTime,
      resolutionTime: sla.resolutionTime,
      price: sla.price || 0,
    });
    setEditModalOpen(true);
  };

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast({ title: "Erro", description: "Nome é obrigatório", variant: "destructive" });
      return;
    }

    const newSLA: SLALevel = {
      id: `sla-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      responseTime: formData.responseTime,
      resolutionTime: formData.resolutionTime,
      price: formData.price > 0 ? formData.price : undefined,
      color: 'text-primary',
    };

    setSlaLevels(prev => [...prev, newSLA]);
    setCreateModalOpen(false);
    toast({ title: "SLA criado", description: `O nível "${formData.name}" foi criado com sucesso.` });
  };

  const handleSave = () => {
    if (!selectedSLA) return;

    setSlaLevels(prev => prev.map(sla => 
      sla.id === selectedSLA.id 
        ? { 
            ...sla, 
            name: formData.name,
            description: formData.description,
            responseTime: formData.responseTime,
            resolutionTime: formData.resolutionTime,
            price: formData.price > 0 ? formData.price : undefined,
          }
        : sla
    ));
    setEditModalOpen(false);
    toast({ title: "SLA atualizado", description: "As alterações foram salvas." });
  };

  const handleDelete = () => {
    if (!deleteSlaId) return;
    setSlaLevels(prev => prev.filter(sla => sla.id !== deleteSlaId));
    setDeleteSlaId(null);
    toast({ title: "SLA removido", description: "O nível de SLA foi removido." });
  };

  const formatHours = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `${days}d`;
    return `${days}d ${remainingHours}h`;
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
            <p className="text-muted-foreground mt-1">Configure os níveis de SLA disponíveis como módulos</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {slaLevels.map(sla => (
            <Card key={sla.id} className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className={cn("w-6 h-6", sla.color)} />
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
                    {sla.id !== 'basic' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-red-400"
                        onClick={() => setDeleteSlaId(sla.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className={cn("text-xl font-bold", sla.color)}>{sla.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{sla.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Resposta:</span>
                    <span className="text-sm font-medium text-foreground">{formatHours(sla.responseTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Resolução:</span>
                    <span className="text-sm font-medium text-foreground">{formatHours(sla.resolutionTime)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border">
                  {sla.price ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">R$ {sla.price}</span>
                      <span className="text-sm text-muted-foreground">/mês</span>
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-green-400 border-green-400/50">
                      Incluído
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                <Label htmlFor="responseTime" className="text-muted-foreground">Tempo de Resposta (horas)</Label>
                <Input
                  id="responseTime"
                  type="number"
                  min="1"
                  value={formData.responseTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, responseTime: parseInt(e.target.value) || 0 }))}
                  className="bg-muted border-border text-foreground mt-1"
                />
              </div>

              <div>
                <Label htmlFor="resolutionTime" className="text-muted-foreground">Tempo de Resolução (horas)</Label>
                <Input
                  id="resolutionTime"
                  type="number"
                  min="1"
                  value={formData.resolutionTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, resolutionTime: parseInt(e.target.value) || 0 }))}
                  className="bg-muted border-border text-foreground mt-1"
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="price" className="text-muted-foreground">Preço Mensal (R$) - Deixe 0 para incluído</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                  className="bg-muted border-border text-foreground mt-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); }} 
              className="border-border"
            >
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-primary to-accent"
              onClick={editModalOpen ? handleSave : handleCreate}
            >
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
              Tem certeza que deseja remover este nível de SLA? Tenants com este SLA serão migrados para o nível básico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border text-muted-foreground hover:bg-card">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDelete}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
