import { useState, useEffect } from 'react';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Check, ShoppingCart, Lock, Shield, Sparkles, Crown, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MODULE_CATALOG, 
  getModulesGroupedByCategory, 
  getModuleFromCatalog 
} from '@/config/moduleCatalog';
import { useTenantModules } from '@/contexts/TenantModulesContext';
import { useAddonsCart } from '@/contexts/AddonsCartContext';
import { AddonsCartDrawer } from '@/components/billing/AddonsCartDrawer';
import { 
  formatModulePrice, 
  getCategoryLabel,
  getAccessSourceLabel,
  type ExtendedModuleConfig,
  type ModuleDisplayCategory 
} from '@/types/modules';
import { toast } from 'sonner';

export default function TenantModules() {
  const { 
    moduleStates,
    planId,
    isModuleEnabled, 
    canEnableModule,
    enableModule,
    disableModule,
    getModuleAccessSource,
    saveConfiguration,
    setTenantContext
  } = useTenantModules();
  
  const { addToCart } = useAddonsCart();
  const [activeCategory, setActiveCategory] = useState<ModuleDisplayCategory | 'all'>('all');

  // Inicializar contexto do tenant
  useEffect(() => {
    setTenantContext('1', 'professional');
  }, [setTenantContext]);

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
      
      const accessSource = module.pricing && module.pricing.monthlyPrice > 0 ? 'addon' : 'manual';
      enableModule(module.id, accessSource);
      toast.success(`Módulo ${module.name} ativado com sucesso!`);
    } else {
      disableModule(module.id);
      toast.success(`Módulo ${module.name} desativado`);
    }
    
    saveConfiguration();
  };

  const getModulesToShow = () => {
    if (activeCategory === 'all') {
      return MODULE_CATALOG.filter(m => m.isAvailable);
    }
    return groupedModules[activeCategory]?.filter(m => m.isAvailable) || [];
  };

  // Módulos inclusos no plano atual
  const includedModuleIds = moduleStates
    .filter(s => s.accessSource === 'plan' && s.status === 'active')
    .map(s => s.moduleId);

  const renderModuleCard = (module: ExtendedModuleConfig) => {
    const enabled = isModuleEnabled(module.id);
    const accessSource = getModuleAccessSource(module.id);
    const isIncludedInPlan = module.planRequirement?.includedInPlans.includes(planId) || module.isCore;
    const ModuleIcon = module.icon;
    
    return (
      <Card 
        key={module.id} 
        className={`relative overflow-hidden transition-all ${
          enabled 
            ? 'border-primary/50 bg-card' 
            : 'border-border bg-card/50 opacity-80'
        }`}
      >
        {/* Badges */}
        <div className="absolute top-3 right-3 flex gap-1">
          {module.isCore && (
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Essencial
            </Badge>
          )}
          {module.isNew && (
            <Badge className="bg-green-500 text-white text-xs">
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
            <Badge variant="outline" className="border-yellow-500 text-yellow-500 text-xs">
              Beta
            </Badge>
          )}
        </div>

        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${enabled ? 'bg-primary/10' : 'bg-muted'}`}>
              <ModuleIcon className={`w-5 h-5 ${enabled ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base text-foreground">{module.name}</CardTitle>
              <CardDescription className="text-xs mt-1 line-clamp-2">
                {module.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Pricing */}
          {module.pricing && module.pricing.monthlyPrice > 0 && (
            <div className="mb-3 p-2 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {module.pricing.perUnit ? `Por ${module.pricing.unitName}` : 'Mensal'}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {formatModulePrice(module.pricing.monthlyPrice)}
                </span>
              </div>
              {module.pricing.trialDays > 0 && !enabled && (
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-yellow-500">
                    {module.pricing.trialDays} dias grátis
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Plan Requirement */}
          {module.planRequirement && !module.isCore && (
            <div className="mb-3 text-xs text-muted-foreground">
              {isIncludedInPlan ? (
                <span className="text-green-500 flex items-center gap-1">
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
              <span className="text-sm text-muted-foreground">
                {enabled ? 'Ativo' : 'Inativo'}
              </span>
              <Switch
                checked={enabled}
                onCheckedChange={() => handleToggleModule(module)}
                disabled={module.isCore || !module.isAvailable}
              />
            </div>
            {!enabled && !module.isCore && module.pricing && module.pricing.monthlyPrice > 0 && !isIncludedInPlan && (
              <Button
                size="sm"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10"
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
            <div className="mt-2 p-2 rounded bg-yellow-500/10 text-xs text-yellow-600 flex items-start gap-1">
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
    <TenantLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link to="/tenant/billing">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Módulos</h1>
              <p className="text-muted-foreground">Gerencie os módulos ativos da sua assinatura</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              Plano: <span className="font-semibold ml-1 capitalize">{planId}</span>
            </Badge>
            <Badge className="bg-primary text-primary-foreground text-xs">
              {moduleStates.filter(s => s.status === 'active').length} ativos
            </Badge>
            <AddonsCartDrawer />
          </div>
        </div>

        {/* Módulos inclusos no plano */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Módulos do seu Plano
            </CardTitle>
            <CardDescription>Funcionalidades já inclusas no plano {planId}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {moduleStates
                .filter(s => (s.accessSource === 'plan' || getModuleFromCatalog(s.moduleId)?.isCore) && s.status === 'active')
                .map((state) => {
                  const module = getModuleFromCatalog(state.moduleId);
                  return module ? (
                    <Badge key={state.moduleId} variant="secondary" className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      {module.name}
                    </Badge>
                  ) : null;
                })}
            </div>
          </CardContent>
        </Card>

        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={(v) => setActiveCategory(v as ModuleDisplayCategory | 'all')}>
          <TabsList className="bg-card border border-border">
            {categories.map(cat => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
              >
                {cat === 'all' ? 'Todos' : getCategoryLabel(cat)}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getModulesToShow().map(module => renderModuleCard(module))}
            </div>
            
            {getModulesToShow().length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum módulo nesta categoria</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </TenantLayout>
  );
}