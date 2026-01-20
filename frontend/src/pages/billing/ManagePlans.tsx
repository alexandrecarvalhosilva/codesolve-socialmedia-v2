import { useState } from 'react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, EyeOff, Star, Package, Check, X } from 'lucide-react';
import { mockPlans } from '@/data/billingMockData';
import { BillingPlan, formatPrice } from '@/types/billing';
import { MODULE_CATALOG, getModulesGroupedByCategory } from '@/config/moduleCatalog';
import { getCategoryLabel, formatModulePrice } from '@/types/modules';
import { toast } from 'sonner';

export default function ManagePlans() {
  const [plans, setPlans] = useState(mockPlans);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BillingPlan | null>(null);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [activeDialogTab, setActiveDialogTab] = useState('details');

  const groupedModules = getModulesGroupedByCategory();

  const handleCreatePlan = () => {
    setEditingPlan(null);
    setSelectedModules([]);
    setActiveDialogTab('details');
    setIsDialogOpen(true);
  };

  const handleEditPlan = (plan: BillingPlan) => {
    setEditingPlan(plan);
    setSelectedModules(plan.modules || []);
    setActiveDialogTab('details');
    setIsDialogOpen(true);
  };

  const handleToggleActive = (planId: string) => {
    setPlans(plans.map(p => 
      p.id === planId ? { ...p, isActive: !p.isActive } : p
    ));
    toast.success('Status do plano atualizado');
  };

  const handleTogglePublic = (planId: string) => {
    setPlans(plans.map(p => 
      p.id === planId ? { ...p, isPublic: !p.isPublic } : p
    ));
    toast.success('Visibilidade do plano atualizada');
  };

  const handleDeletePlan = (planId: string) => {
    setPlans(plans.filter(p => p.id !== planId));
    toast.success('Plano excluído');
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

  const handleSavePlan = () => {
    if (editingPlan) {
      setPlans(plans.map(p => 
        p.id === editingPlan.id 
          ? { ...p, modules: selectedModules }
          : p
      ));
    }
    toast.success(editingPlan ? 'Plano atualizado!' : 'Plano criado!');
    setIsDialogOpen(false);
  };

  const getModuleCountByPlan = (planModules: string[]) => {
    const included = planModules.length;
    const total = MODULE_CATALOG.filter(m => !m.isCore).length;
    return `${included}/${total}`;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerenciar Planos</h1>
            <p className="text-muted-foreground">Configure os planos de assinatura e seus módulos inclusos</p>
          </div>
          <Button onClick={handleCreatePlan} className="bg-cs-cyan hover:bg-cs-cyan/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Plano
          </Button>
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
                      onClick={() => handleTogglePublic(plan.id)}
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
                      onCheckedChange={() => handleToggleActive(plan.id)}
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

            <Tabs value={activeDialogTab} onValueChange={setActiveDialogTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Detalhes do Plano</TabsTrigger>
                <TabsTrigger value="modules" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Módulos Inclusos
                  <Badge className="bg-cs-cyan/10 text-cs-cyan text-xs ml-1">
                    {selectedModules.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-4">
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input 
                      defaultValue={editingPlan?.name}
                      placeholder="Ex: Professional"
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug</Label>
                    <Input 
                      defaultValue={editingPlan?.slug}
                      placeholder="Ex: professional"
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Descrição</Label>
                    <Input 
                      defaultValue={editingPlan?.description}
                      placeholder="Descrição do plano"
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço Base (centavos)</Label>
                    <Input 
                      type="number"
                      defaultValue={editingPlan?.basePrice}
                      placeholder="9700"
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mensagens/Mês</Label>
                    <Input 
                      type="number"
                      defaultValue={editingPlan?.maxMessagesPerMonth || ''}
                      placeholder="Vazio = ilimitado"
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Máx. Usuários</Label>
                    <Input 
                      type="number"
                      defaultValue={editingPlan?.maxUsers}
                      placeholder="5"
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Máx. Instâncias</Label>
                    <Input 
                      type="number"
                      defaultValue={editingPlan?.maxInstances}
                      placeholder="2"
                      className="bg-cs-bg-primary border-border"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="modules" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-6">
                    {Object.entries(groupedModules).map(([category, modules]) => {
                      if (modules.length === 0) return null;
                      
                      const categoryIds = modules.map(m => m.id);
                      const selectedCount = categoryIds.filter(id => selectedModules.includes(id)).length;
                      const allSelected = selectedCount === categoryIds.length;
                      
                      return (
                        <div key={category} className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-cs-text-primary flex items-center gap-2">
                              {getCategoryLabel(category as any)}
                              <Badge variant="outline" className="text-xs">
                                {selectedCount}/{modules.length}
                              </Badge>
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSelectAllInCategory(category)}
                              className="text-xs"
                            >
                              {allSelected ? (
                                <>
                                  <X className="h-3 w-3 mr-1" />
                                  Desmarcar todos
                                </>
                              ) : (
                                <>
                                  <Check className="h-3 w-3 mr-1" />
                                  Selecionar todos
                                </>
                              )}
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            {modules.map(module => {
                              const isSelected = selectedModules.includes(module.id);
                              const ModuleIcon = module.icon;
                              
                              return (
                                <div
                                  key={module.id}
                                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                    isSelected 
                                      ? 'border-cs-cyan bg-cs-cyan/5' 
                                      : 'border-border bg-cs-bg-primary/50 hover:border-cs-cyan/50'
                                  } ${module.isCore ? 'opacity-60' : ''}`}
                                  onClick={() => !module.isCore && handleToggleModule(module.id)}
                                >
                                  <Checkbox 
                                    checked={isSelected || module.isCore}
                                    disabled={module.isCore}
                                    onCheckedChange={() => handleToggleModule(module.id)}
                                  />
                                  <div className="p-1.5 rounded bg-cs-bg-card">
                                    <ModuleIcon className="h-4 w-4 text-cs-cyan" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-cs-text-primary flex items-center gap-1">
                                      {module.name}
                                      {module.isCore && (
                                        <Badge variant="outline" className="text-[10px] py-0">Core</Badge>
                                      )}
                                    </p>
                                    <p className="text-xs text-cs-text-muted line-clamp-1">
                                      {module.pricing && module.pricing.monthlyPrice > 0 
                                        ? `Valor: ${formatModulePrice(module.pricing.monthlyPrice)}/mês`
                                        : 'Sem custo adicional'
                                      }
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSavePlan} className="bg-cs-cyan hover:bg-cs-cyan/90">
                {editingPlan ? 'Salvar Alterações' : 'Criar Plano'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
