import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Package, Check, X, RefreshCw } from 'lucide-react';
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '@/hooks/useBilling';
import { BillingPlan, formatPrice } from '@/types/billing';
import { MODULE_CATALOG, getModulesGroupedByCategory } from '@/config/moduleCatalog';
import { getCategoryLabel, formatModulePrice } from '@/types/modules';
import { toast } from 'sonner';

export default function ManagePlans() {
  const { plans, isLoading, error, fetchPlans } = usePlans();
  const { createPlan, isCreating } = useCreatePlan();
  const { updatePlan, isUpdating } = useUpdatePlan();
  const { deletePlan, isDeleting } = useDeletePlan();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BillingPlan | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [activeDialogTab, setActiveDialogTab] = useState('details');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    maxUsers: 5,
    maxInstances: 1,
    maxMessagesPerMonth: 1000,
    isActive: true,
    isPublic: true,
    isPopular: false,
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const groupedModules = getModulesGroupedByCategory();

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setSelectedModules([]);
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      maxUsers: 5,
      maxInstances: 1,
      maxMessagesPerMonth: 1000,
      isActive: true,
      isPublic: true,
      isPopular: false,
    });
    setActiveDialogTab('details');
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: BillingPlan) => {
    setEditingPlan(plan);
    setSelectedModules(plan.modules || []);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      basePrice: plan.basePrice,
      maxUsers: plan.maxUsers,
      maxInstances: plan.maxInstances,
      maxMessagesPerMonth: plan.maxMessagesPerMonth || 0,
      isActive: plan.isActive,
      isPublic: plan.isPublic,
      isPopular: plan.isPopular || false,
    });
    setActiveDialogTab('details');
    setIsDialogOpen(true);
  };

  const handleToggleActive = async (plan: BillingPlan) => {
    try {
      await updatePlan(plan.id, { isActive: !plan.isActive });
      toast.success('Status do plano atualizado');
      fetchPlans();
    } catch (err) {
      toast.error('Erro ao atualizar status do plano');
    }
  };

  const handleTogglePublic = async (plan: BillingPlan) => {
    try {
      await updatePlan(plan.id, { isPublic: !plan.isPublic });
      toast.success('Visibilidade do plano atualizada');
      fetchPlans();
    } catch (err) {
      toast.error('Erro ao atualizar visibilidade do plano');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano?')) return;
    
    try {
      await deletePlan(planId);
      toast.success('Plano excluído');
      fetchPlans();
    } catch (err) {
      toast.error('Erro ao excluir plano');
    }
  };

  const handleToggleModule = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleSelectAllInCategory = (category: string) => {
    const categoryModules = groupedModules[category as keyof typeof groupedModules] || [];
    const categoryIds = categoryModules.map(m => m.id);
    const allSelected = categoryIds.every(id => selectedModules.includes(id));
    
    if (allSelected) {
      setSelectedModules(prev => prev.filter(id => !categoryIds.includes(id)));
    } else {
      setSelectedModules(prev => [...new Set([...prev, ...categoryIds])]);
    }
  };

  const handleSavePlan = async () => {
    try {
      const planData = {
        ...formData,
        modules: selectedModules,
      };
      
      if (editingPlan) {
        await updatePlan(editingPlan.id, planData);
        toast.success('Plano atualizado!');
      } else {
        await createPlan(planData);
        toast.success('Plano criado!');
      }
      
      setIsDialogOpen(false);
      fetchPlans();
    } catch (err) {
      toast.error(editingPlan ? 'Erro ao atualizar plano' : 'Erro ao criar plano');
    }
  };

  const getModuleCountByPlan = (planModules: string[]) => {
    const included = planModules.length;
    const total = MODULE_CATALOG.filter(m => !m.isCore).length;
    return `${included}/${total}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-cs-bg-card border-border">
                <CardHeader>
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-12 w-full mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerenciar Planos</h1>
            <p className="text-muted-foreground">Configure os planos de assinatura e seus módulos inclusos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchPlans()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={handleCreatePlan} className="bg-cs-cyan hover:bg-cs-cyan/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Plano
            </Button>
          </div>
        </div>

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`bg-cs-bg-card border-border relative ${
                !plan.isActive ? 'opacity-60' : ''
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-cs-cyan text-white">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePublic(plan)}
                      title={plan.isPublic ? 'Tornar privado' : 'Tornar público'}
                    >
                      {plan.isPublic ? (
                        <Eye className="h-4 w-4 text-cs-success" />
                      ) : (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-center py-4 border-y border-border">
                  {plan.slug === 'enterprise' ? (
                    <p className="text-2xl font-bold text-foreground">Sob consulta</p>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-foreground">
                        {formatPrice(plan.basePrice)}
                      </p>
                      <p className="text-sm text-muted-foreground">/mês</p>
                    </>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Usuários</span>
                    <span className="text-foreground">
                      {plan.maxUsers >= 999 ? 'Ilimitado' : plan.maxUsers}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Instâncias</span>
                    <span className="text-foreground">
                      {plan.maxInstances >= 999 ? 'Ilimitado' : plan.maxInstances}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mensagens/mês</span>
                    <span className="text-foreground">
                      {plan.maxMessagesPerMonth ? plan.maxMessagesPerMonth.toLocaleString() : 'Ilimitado'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      Módulos Inclusos
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {getModuleCountByPlan(plan.modules)}
                    </Badge>
                  </div>
                </div>

                {/* Module Preview */}
                <div className="pt-2">
                  <p className="text-xs text-muted-foreground mb-2">Módulos inclusos:</p>
                  <div className="flex flex-wrap gap-1">
                    {plan.modules.slice(0, 5).map(moduleId => {
                      const module = MODULE_CATALOG.find(m => m.id === moduleId);
                      if (!module) return null;
                      return (
                        <Badge key={moduleId} variant="secondary" className="text-xs">
                          {module.name}
                        </Badge>
                      );
                    })}
                    {plan.modules.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{plan.modules.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={plan.isActive}
                      onCheckedChange={() => handleToggleActive(plan)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {plan.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeletePlan(plan.id)}
                      className="text-cs-error hover:text-cs-error"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialog de Edição/Criação */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-cs-bg-card border-border max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Editar Plano' : 'Novo Plano'}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes do plano e selecione os módulos inclusos
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeDialogTab} onValueChange={setActiveDialogTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="modules">Módulos</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome do Plano</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Starter"
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço Base (R$)</Label>
                    <Input
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descrição do plano"
                    className="bg-cs-bg-primary border-border"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Máx. Usuários</Label>
                    <Input
                      type="number"
                      value={formData.maxUsers}
                      onChange={(e) => setFormData({ ...formData, maxUsers: Number(e.target.value) })}
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Máx. Instâncias</Label>
                    <Input
                      type="number"
                      value={formData.maxInstances}
                      onChange={(e) => setFormData({ ...formData, maxInstances: Number(e.target.value) })}
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mensagens/mês</Label>
                    <Input
                      type="number"
                      value={formData.maxMessagesPerMonth}
                      onChange={(e) => setFormData({ ...formData, maxMessagesPerMonth: Number(e.target.value) })}
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                </div>

                <div className="flex gap-6 pt-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label>Ativo</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                    />
                    <Label>Público</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.isPopular}
                      onCheckedChange={(checked) => setFormData({ ...formData, isPopular: checked })}
                    />
                    <Label>Popular</Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="modules" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    {Object.entries(groupedModules).map(([category, modules]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-foreground">
                            {getCategoryLabel(category)}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectAllInCategory(category)}
                            className="text-xs"
                          >
                            Selecionar Todos
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {modules.map((module) => (
                            <div
                              key={module.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                selectedModules.includes(module.id)
                                  ? 'border-cs-cyan bg-cs-cyan/10'
                                  : 'border-border hover:border-muted-foreground'
                              }`}
                              onClick={() => handleToggleModule(module.id)}
                            >
                              <Checkbox
                                checked={selectedModules.includes(module.id)}
                                onCheckedChange={() => handleToggleModule(module.id)}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {module.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatModulePrice(module.price)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSavePlan} 
                className="bg-cs-cyan hover:bg-cs-cyan/90"
                disabled={isCreating || isUpdating}
              >
                {isCreating || isUpdating ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
