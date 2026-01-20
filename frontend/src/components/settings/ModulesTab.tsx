import { useState } from 'react';
import { Puzzle, RotateCcw, Check, AlertTriangle, ChevronDown, ChevronRight, Settings, Info, Link2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useModules } from '@/contexts/ModulesContext';
import { useToast } from '@/hooks/use-toast';
import { getModuleCategories, getModuleById } from '@/config/moduleRegistry';
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const categoryLabels: Record<string, { label: string; color: string }> = {
  system: { label: 'Sistema', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  tenant: { label: 'Tenant', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  social: { label: 'Redes Sociais', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
  billing: { label: 'Cobrança', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  support: { label: 'Suporte', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
};

export function ModulesTab() {
  const { modules, toggleModule, toggleFeature, isFeatureEnabled, getModuleDependencyStatus, resetToDefaults } = useModules();
  const { toast } = useToast();
  const [confirmReset, setConfirmReset] = useState(false);
  const [pendingToggle, setPendingToggle] = useState<{ id: string; enabled: boolean } | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const handleToggle = (moduleId: string, newValue: boolean) => {
    const module = getModuleById(moduleId);
    
    if (module?.isCore) {
      toast({
        title: "Módulo essencial",
        description: "Este módulo não pode ser desativado pois é essencial para o funcionamento do sistema.",
        variant: "destructive"
      });
      return;
    }

    // Verificar dependências ao ativar
    if (newValue) {
      const depStatus = getModuleDependencyStatus(moduleId);
      if (!depStatus.satisfied) {
        toast({
          title: "Dependências não satisfeitas",
          description: `Este módulo depende de: ${depStatus.missing.join(', ')}. Ative-os primeiro.`,
          variant: "destructive"
        });
        return;
      }
    }

    // Se estiver desativando, mostrar confirmação
    if (!newValue) {
      setPendingToggle({ id: moduleId, enabled: newValue });
    } else {
      toggleModule(moduleId, newValue);
      toast({
        title: "Módulo ativado",
        description: `O módulo foi ativado com sucesso.`,
      });
    }
  };

  const confirmToggle = () => {
    if (pendingToggle) {
      toggleModule(pendingToggle.id, pendingToggle.enabled);
      toast({
        title: "Módulo desativado",
        description: "O módulo foi desativado. As permissões relacionadas não aparecerão mais na gestão de roles.",
      });
      setPendingToggle(null);
    }
  };

  const handleReset = () => {
    resetToDefaults();
    setConfirmReset(false);
    toast({
      title: "Configurações restauradas",
      description: "Os módulos foram restaurados para a configuração padrão.",
    });
  };

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId) 
        : [...prev, moduleId]
    );
  };

  // Agrupar por categoria
  const categories = getModuleCategories();
  const modulesByCategory = categories.map(cat => ({
    ...cat,
    ...categoryLabels[cat.id],
    modules: modules.filter(m => m.category === cat.id),
  }));

  return (
    <div className="bg-cs-bg-card border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-cs-text-primary mb-1 flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-cs-cyan" />
            Gerenciamento de Módulos
          </h3>
          <p className="text-sm text-cs-text-secondary">
            Ative módulos e configure suas funcionalidades. Cada módulo traz permissões e features pré-definidas.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setConfirmReset(true)}
          className="border-border text-cs-text-secondary"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar Padrões
        </Button>
      </div>

      <div className="space-y-8">
        {modulesByCategory.map(category => (
          <div key={category.id}>
            <div className="flex items-center gap-2 mb-4">
              <Badge className={category.color}>
                {category.label}
              </Badge>
              <span className="text-xs text-cs-text-muted">
                {category.modules.filter(m => m.enabled).length} de {category.modules.length} ativos
              </span>
            </div>

            <div className="grid gap-3">
              {category.modules.map(module => {
                const Icon = module.icon;
                const isExpanded = expandedModules.includes(module.id);
                const depStatus = getModuleDependencyStatus(module.id);
                
                return (
                  <Collapsible key={module.id} open={isExpanded} onOpenChange={() => toggleModuleExpand(module.id)}>
                    <div
                      className={`rounded-lg border transition-colors ${
                        module.enabled 
                          ? 'bg-cs-bg-primary border-border' 
                          : 'bg-muted/20 border-border/50'
                      }`}
                    >
                      {/* Header do módulo */}
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${
                            module.enabled 
                              ? 'bg-cs-cyan/20 text-cs-cyan' 
                              : 'bg-muted/30 text-muted-foreground'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`font-medium ${
                                module.enabled ? 'text-cs-text-primary' : 'text-cs-text-muted'
                              }`}>
                                {module.name}
                              </h4>
                              {module.isCore && (
                                <Badge variant="outline" className="text-xs border-cs-cyan/30 text-cs-cyan">
                                  Essencial
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs border-border text-cs-text-muted">
                                v{module.version}
                              </Badge>
                              {module.dependencies && module.dependencies.length > 0 && (
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Link2 className={`w-3 h-3 ${depStatus.satisfied ? 'text-cs-success' : 'text-cs-error'}`} />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Depende de: {module.dependencies.join(', ')}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                            <p className="text-sm text-cs-text-muted">
                              {module.description}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-cs-text-muted">
                              <span>{module.permissions.length} permissões</span>
                              <span>{module.features.length} funcionalidades</span>
                              <span>{module.routes.length} rotas</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-cs-text-muted">
                              <Settings className="w-4 h-4 mr-1" />
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </Button>
                          </CollapsibleTrigger>
                          
                          {module.enabled && (
                            <Check className="w-4 h-4 text-cs-success" />
                          )}
                          <Switch
                            checked={module.enabled}
                            onCheckedChange={(checked) => handleToggle(module.id, checked)}
                            disabled={module.isCore}
                            className="data-[state=checked]:bg-cs-cyan"
                          />
                        </div>
                      </div>

                      {/* Features do módulo */}
                      <CollapsibleContent>
                        <div className="px-4 pb-4 border-t border-border pt-4">
                          <h5 className="text-sm font-medium text-cs-text-primary mb-3">Funcionalidades</h5>
                          <div className="grid gap-2">
                            {module.features.map(feature => {
                              const FeatureIcon = feature.icon;
                              const featureEnabled = isFeatureEnabled(module.id, feature.id);
                              
                              return (
                                <div 
                                  key={feature.id}
                                  className={`flex items-center justify-between p-3 rounded-lg ${
                                    featureEnabled ? 'bg-muted/30' : 'bg-muted/10'
                                  }`}
                                >
                                  <div className="flex items-center gap-3">
                                    <FeatureIcon className={`w-4 h-4 ${featureEnabled ? 'text-cs-cyan' : 'text-muted-foreground'}`} />
                                    <div>
                                      <p className={`text-sm font-medium ${featureEnabled ? 'text-cs-text-primary' : 'text-cs-text-muted'}`}>
                                        {feature.name}
                                      </p>
                                      <p className="text-xs text-cs-text-muted">{feature.description}</p>
                                      {feature.requiredPermission && (
                                        <p className="text-xs text-cs-cyan mt-1">
                                          Requer: {feature.requiredPermission}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {feature.settings && feature.settings.length > 0 && (
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="w-3 h-3 text-cs-text-muted" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>{feature.settings.length} configurações disponíveis</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    )}
                                    <Switch
                                      checked={featureEnabled}
                                      onCheckedChange={(checked) => toggleFeature(module.id, feature.id, checked)}
                                      disabled={!module.enabled}
                                      className="data-[state=checked]:bg-cs-cyan scale-90"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Info box */}
      <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
          <div className="text-sm text-cs-text-secondary">
            <p className="font-medium text-cs-text-primary mb-1">Como funciona</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Cada módulo traz suas permissões, rotas e funcionalidades pré-definidas</li>
              <li>Desativar um módulo oculta suas permissões da gestão de roles</li>
              <li>Funcionalidades podem ser ativadas/desativadas individualmente</li>
              <li>Alguns módulos dependem de outros para funcionar</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <AlertDialog open={!!pendingToggle} onOpenChange={() => setPendingToggle(null)}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary">Desativar módulo?</AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-secondary">
              Ao desativar este módulo, as permissões relacionadas não aparecerão mais 
              na gestão de roles e as funcionalidades serão ocultadas na interface.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-cs-text-secondary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmToggle}
              className="bg-cs-error hover:bg-cs-error/90"
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary">Restaurar configurações padrão?</AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-secondary">
              Isso irá restaurar todos os módulos e funcionalidades para a configuração padrão do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-cs-text-secondary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-cs-cyan hover:bg-cs-cyan/90"
            >
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
