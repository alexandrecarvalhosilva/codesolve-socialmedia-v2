import { useState } from 'react';
import { 
  Shield, 
  Package, 
  Check, 
  X, 
  Lock, 
  Plus,
  Minus,
  Crown,
  Sparkles,
  Clock,
  AlertCircle,
  ShoppingCart,
  AlertTriangle,
  EyeOff,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { useTenantModules } from '@/contexts/TenantModulesContext';
import { useAddonsCart } from '@/contexts/AddonsCartContext';
import { useAudit } from '@/contexts/AuditContext';
import { AddonsCartDrawer } from '@/components/billing/AddonsCartDrawer';
import { 
  MODULE_CATALOG, 
  getModulesGroupedByCategory, 
  getModuleFromCatalog 
} from '@/config/moduleCatalog';
import { 
  formatModulePrice, 
  getCategoryLabel, 
  getAccessSourceLabel,
  type ExtendedModuleConfig,
  type ModuleDisplayCategory 
} from '@/types/modules';
import { toast } from 'sonner';

interface TenantModulesTabProps {
  tenantId?: string;
}

export function TenantModulesTab({ tenantId }: TenantModulesTabProps) {
  const { 
    moduleStates,
    planId,
    tenantId: contextTenantId,
    isModuleEnabled, 
    canEnableModule,
    enableModule,
    disableModule,
    updateModuleQuantity,
    getModuleAccessSource,
    saveConfiguration
  } = useTenantModules();
  
  const { addToCart, itemCount } = useAddonsCart();
  const { logModuleChange } = useAudit();
  
  const effectiveTenantId = tenantId || contextTenantId || '1';
  
  const [activeCategory, setActiveCategory] = useState<ModuleDisplayCategory | 'all'>('all');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    module: ExtendedModuleConfig | null;
    action: 'enable' | 'disable';
  }>({ open: false, module: null, action: 'enable' });

  const groupedModules = getModulesGroupedByCategory();
  const categories: (ModuleDisplayCategory | 'all')[] = ['all', 'essential', 'communication', 'ai', 'social', 'billing', 'support', 'analytics'];

  const handleToggleModule = (module: ExtendedModuleConfig) => {
    const enabled = isModuleEnabled(module.id);
    
    if (module.isCore) {
      toast.error('Módulos essenciais não podem ser desativados');
      return;
    }
    
    if (!enabled) {
      const check = canEnableModule(module.id);
      if (!check.canEnable) {
        toast.error(check.reason || 'Não é possível ativar este módulo');
        return;
      }
    }
    
    setConfirmDialog({
      open: true,
      module,
      action: enabled ? 'disable' : 'enable',
    });
  };

  const confirmModuleAction = () => {
    const { module, action } = confirmDialog;
    if (!module) return;
    
    if (action === 'enable') {
      const accessSource = module.pricing && module.pricing.monthlyPrice > 0 ? 'addon' : 'manual';
      enableModule(module.id, accessSource);
      
      // Log de auditoria
      logModuleChange('enabled', {
        tenantId: effectiveTenantId,
        moduleId: module.id,
        moduleName: module.name,
        accessSource,
      });
      
      toast.success(`Módulo ${module.name} ativado com sucesso!`);
    } else {
      disableModule(module.id);
      
      // Log de auditoria
      logModuleChange('disabled', {
        tenantId: effectiveTenantId,
        moduleId: module.id,
        moduleName: module.name,
      });
      
      toast.success(`Módulo ${module.name} desativado`);
    }
    
    saveConfiguration();
    setConfirmDialog({ open: false, module: null, action: 'enable' });
  };

  const handleQuantityChange = (moduleId: string, delta: number) => {
    const state = moduleStates.find(s => s.moduleId === moduleId);
    const module = getModuleFromCatalog(moduleId);
    if (!state || !module) return;
    
    const newQty = Math.max(1, Math.min(state.quantity + delta, module.pricing?.maxUnits || 99));
    updateModuleQuantity(moduleId, newQty);
    saveConfiguration();
  };

  const getModulesToShow = () => {
    if (activeCategory === 'all') {
      return MODULE_CATALOG.filter(m => m.isAvailable);
    }
    return groupedModules[activeCategory]?.filter(m => m.isAvailable) || [];
  };

  const renderModuleCard = (module: ExtendedModuleConfig) => {
    const enabled = isModuleEnabled(module.id);
    const accessSource = getModuleAccessSource(module.id);
    const state = moduleStates.find(s => s.moduleId === module.id);
    const ModuleIcon = module.icon;
    
    return (
      <Card 
        key={module.id} 
        className={`relative overflow-hidden transition-all ${
          enabled 
            ? 'border-cs-cyan/50 bg-cs-bg-card' 
            : 'border-border bg-cs-bg-card/50 opacity-80'
        }`}
      >
        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-1">
          {module.isCore && (
            <Badge variant="outline" className="bg-cs-bg-primary border-cs-cyan/50 text-cs-cyan text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Essencial
            </Badge>
          )}
          {module.isNew && (
            <Badge className="bg-cs-success text-white text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Novo
            </Badge>
          )}
          {module.isPopular && (
            <Badge className="bg-purple-500 text-white text-xs">
              <Crown className="w-3 h-3 mr-1" />
              Popular
            </Badge>
          )}
          {module.isBeta && (
            <Badge variant="outline" className="border-cs-warning text-cs-warning text-xs">
              Beta
            </Badge>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${enabled ? 'bg-cs-cyan/10' : 'bg-muted'}`}>
              <ModuleIcon className={`w-5 h-5 ${enabled ? 'text-cs-cyan' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base text-cs-text-primary">{module.name}</CardTitle>
              <CardDescription className="text-xs mt-1 line-clamp-2">
                {module.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Pricing */}
          {module.pricing && module.pricing.monthlyPrice > 0 && (
            <div className="mb-3 p-2 rounded-lg bg-cs-bg-primary/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-cs-text-muted">
                  {module.pricing.perUnit ? `Por ${module.pricing.unitName}` : 'Mensal'}
                </span>
                <span className="text-sm font-semibold text-cs-text-primary">
                  {formatModulePrice(module.pricing.monthlyPrice)}
                </span>
              </div>
              {module.pricing.trialDays > 0 && !enabled && (
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-cs-warning" />
                  <span className="text-xs text-cs-warning">
                    {module.pricing.trialDays} dias grátis
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Plan Requirement */}
          {module.planRequirement && !module.isCore && (
            <div className="mb-3 text-xs text-cs-text-muted">
              {module.planRequirement.includedInPlans.includes(planId) ? (
                <span className="text-cs-success flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Incluso no seu plano
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Requer plano {module.planRequirement.minPlan}+
                </span>
              )}
            </div>
          )}

          {/* Quantity Control (for per-unit modules) */}
          {enabled && module.pricing?.perUnit && state && (
            <div className="flex items-center justify-between mb-3 p-2 rounded-lg bg-cs-bg-primary/50">
              <span className="text-xs text-cs-text-secondary">
                {module.pricing.unitName}s contratadas
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6"
                  onClick={() => handleQuantityChange(module.id, -1)}
                  disabled={state.quantity <= 1}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-sm font-semibold w-6 text-center">{state.quantity}</span>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6"
                  onClick={() => handleQuantityChange(module.id, 1)}
                  disabled={state.quantity >= (module.pricing?.maxUnits || 99)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Access Source Badge */}
          {enabled && accessSource && (
            <div className="mb-3">
              <Badge variant="outline" className="text-xs">
                {getAccessSourceLabel(accessSource)}
              </Badge>
            </div>
          )}

          {/* Toggle and Add to Cart */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm text-cs-text-secondary">
                {enabled ? 'Ativo' : 'Inativo'}
              </span>
              <Switch
                checked={enabled}
                onCheckedChange={() => handleToggleModule(module)}
                disabled={module.isCore || !module.isAvailable}
              />
            </div>
            {!enabled && !module.isCore && module.pricing && module.pricing.monthlyPrice > 0 && (
              <Button
                size="sm"
                variant="outline"
                className="border-cs-cyan text-cs-cyan hover:bg-cs-cyan/10"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(module.id);
                  toast.success(`${module.name} adicionado ao carrinho!`);
                }}
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                Adicionar
              </Button>
            )}
          </div>

          {/* Dependencies Warning */}
          {!enabled && module.dependencies && module.dependencies.length > 0 && (
            <div className="mt-2 p-2 rounded bg-cs-warning/10 text-xs text-cs-warning flex items-start gap-1">
              <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" />
              <span>
                Requer: {module.dependencies.map(id => getModuleFromCatalog(id)?.name).filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-gradient-to-br from-cs-cyan/20 to-cs-blue/20">
            <Package className="w-6 h-6 text-cs-cyan" />
          </div>
          <div>
            <h3 className="font-semibold text-cs-text-primary text-lg">Módulos</h3>
            <p className="text-cs-text-muted text-sm">
              Gerencie os módulos ativos para este tenant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-xs">
            Plano: <span className="font-semibold ml-1 capitalize">{planId}</span>
          </Badge>
          <Badge className="bg-cs-cyan text-white text-xs">
            {moduleStates.filter(s => s.status === 'active').length} ativos
          </Badge>
          {/* Cart Button */}
          <AddonsCartDrawer />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as ModuleDisplayCategory | 'all')}>
        <TabsList className="bg-cs-bg-card border border-border">
          {categories.map(cat => (
            <TabsTrigger 
              key={cat} 
              value={cat}
              className="data-[state=active]:bg-cs-cyan/10 data-[state=active]:text-cs-cyan"
            >
              {cat === 'all' ? 'Todos' : getCategoryLabel(cat)}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {getModulesToShow().map(module => renderModuleCard(module))}
          </div>
          
          {getModulesToShow().length === 0 && (
            <div className="text-center py-12 text-cs-text-muted">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum módulo nesta categoria</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={(open) => !open && setConfirmDialog({ open: false, module: null, action: 'enable' })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmDialog.action === 'enable' ? (
                <Check className="w-5 h-5 text-cs-success" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-cs-warning" />
              )}
              {confirmDialog.action === 'enable' ? 'Ativar' : 'Desativar'} Módulo
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-4 pt-2">
                {confirmDialog.action === 'enable' ? (
                  <>
                    <p>
                      Deseja ativar o módulo <strong className="text-cs-text-primary">{confirmDialog.module?.name}</strong>?
                    </p>
                    {confirmDialog.module?.pricing && confirmDialog.module.pricing.monthlyPrice > 0 && (
                      <div className="p-3 rounded-lg bg-cs-warning/10 border border-cs-warning/20">
                        <span className="text-sm text-cs-warning">
                          💰 Este módulo tem custo adicional de {formatModulePrice(confirmDialog.module.pricing.monthlyPrice)}/mês
                        </span>
                      </div>
                    )}
                    {confirmDialog.module?.pricing?.trialDays ? (
                      <div className="p-3 rounded-lg bg-cs-success/10 border border-cs-success/20">
                        <span className="text-sm text-cs-success">
                          🎁 Inclui {confirmDialog.module.pricing.trialDays} dias de teste grátis
                        </span>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <>
                    <p>
                      Tem certeza que deseja desativar o módulo <strong className="text-cs-text-primary">{confirmDialog.module?.name}</strong>?
                    </p>
                    
                    {/* Impact Warnings */}
                    <div className="space-y-2">
                      <div className="p-3 rounded-lg bg-cs-warning/10 border border-cs-warning/20">
                        <div className="flex items-start gap-2">
                          <EyeOff className="w-4 h-4 text-cs-warning mt-0.5 shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-cs-warning">Menu oculto</p>
                            <p className="text-cs-text-muted">O link deste módulo será removido da navegação do tenant.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-cs-blue/10 border border-cs-blue/20">
                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-cs-blue mt-0.5 shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-cs-blue">Usuários afetados</p>
                            <p className="text-cs-text-muted">Todos os usuários do tenant perderão acesso imediato a este módulo.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 rounded-lg bg-muted border border-border">
                        <div className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-cs-text-secondary mt-0.5 shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-cs-text-secondary">Dados preservados</p>
                            <p className="text-cs-text-muted">Os dados serão mantidos e você pode reativar a qualquer momento.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialog({ open: false, module: null, action: 'enable' })}
            >
              Cancelar
            </Button>
            <Button 
              onClick={confirmModuleAction}
              className={confirmDialog.action === 'enable' 
                ? 'bg-gradient-to-r from-cs-cyan to-cs-blue' 
                : 'bg-cs-error hover:bg-cs-error/90'
              }
            >
              {confirmDialog.action === 'enable' ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Ativar Módulo
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Confirmar Desativação
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
