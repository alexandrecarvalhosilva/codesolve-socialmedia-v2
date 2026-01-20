import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { 
  MODULE_CATALOG, 
  getModuleFromCatalog, 
  getModulesIncludedInPlan,
  checkModuleDependencies 
} from '@/config/moduleCatalog';
import { 
  TenantModuleState, 
  TenantModulesConfig, 
  TenantModuleStatus,
  ModuleAccessSource,
  ExtendedModuleConfig 
} from '@/types/modules';

// ============================================================================
// TYPES
// ============================================================================

interface TenantModulesContextType {
  // Estado atual
  tenantId: string | null;
  planId: string;
  moduleStates: TenantModuleState[];
  
  // Configuração
  setTenantContext: (tenantId: string, planId: string) => void;
  
  // Verificações
  isModuleEnabled: (moduleId: string) => boolean;
  isModuleAvailable: (moduleId: string) => boolean;
  canEnableModule: (moduleId: string) => { canEnable: boolean; reason?: string };
  getModuleAccessSource: (moduleId: string) => ModuleAccessSource | null;
  
  // Ações
  enableModule: (moduleId: string, source: ModuleAccessSource) => void;
  disableModule: (moduleId: string) => void;
  updateModuleQuantity: (moduleId: string, quantity: number) => void;
  
  // Listagens
  getEnabledModules: () => ExtendedModuleConfig[];
  getAvailableAddons: () => ExtendedModuleConfig[];
  getModulesForNavigation: () => ExtendedModuleConfig[];
  
  // Persistência (mock)
  saveConfiguration: () => void;
  loadConfiguration: (config: TenantModulesConfig) => void;
}

const TenantModulesContext = createContext<TenantModulesContextType | undefined>(undefined);

// ============================================================================
// MOCK DATA - Simulação de configurações salvas por tenant
// ============================================================================

const MOCK_TENANT_CONFIGS: Record<string, TenantModulesConfig> = {
  '1': {
    tenantId: '1',
    planId: 'professional',
    modules: [
      { moduleId: 'dashboard', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'config', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'users', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'chat', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'calendar', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'automations', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'ai-consumption', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'ai-config', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'instagram', status: 'active', accessSource: 'addon', activatedAt: '2024-02-15', quantity: 2 },
      { moduleId: 'billing', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'support', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
    ],
    updatedAt: '2024-02-15T10:00:00Z',
    updatedBy: 'admin',
  },
  '2': {
    tenantId: '2',
    planId: 'starter',
    modules: [
      { moduleId: 'dashboard', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'config', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'users', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'chat', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'billing', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
      { moduleId: 'support', status: 'active', accessSource: 'plan', activatedAt: '2024-01-01', quantity: 1 },
    ],
    updatedAt: '2024-01-01T10:00:00Z',
    updatedBy: 'admin',
  },
};

const STORAGE_KEY = 'cs_tenant_modules';

// ============================================================================
// PROVIDER
// ============================================================================

export function TenantModulesProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [planId, setPlanId] = useState<string>('professional');
  const [moduleStates, setModuleStates] = useState<TenantModuleState[]>([]);

  // Carrega configuração do tenant
  const setTenantContext = useCallback((newTenantId: string, newPlanId: string) => {
    setTenantId(newTenantId);
    setPlanId(newPlanId);
    
    // Tenta carregar do localStorage primeiro
    const storageKey = `${STORAGE_KEY}_${newTenantId}`;
    const saved = localStorage.getItem(storageKey);
    
    if (saved) {
      try {
        const config: TenantModulesConfig = JSON.parse(saved);
        setModuleStates(config.modules);
        setPlanId(config.planId);
        return;
      } catch {
        // Fallback para mock
      }
    }
    
    // Fallback para mock data
    const mockConfig = MOCK_TENANT_CONFIGS[newTenantId];
    if (mockConfig) {
      setModuleStates(mockConfig.modules);
      setPlanId(mockConfig.planId);
    } else {
      // Inicializa com módulos core apenas
      const coreModules: TenantModuleState[] = MODULE_CATALOG
        .filter(m => m.isCore)
        .map(m => ({
          moduleId: m.id,
          status: 'active' as TenantModuleStatus,
          accessSource: 'plan' as ModuleAccessSource,
          activatedAt: new Date().toISOString(),
          quantity: 1,
        }));
      setModuleStates(coreModules);
    }
  }, []);

  // Verifica se módulo está ativo
  const isModuleEnabled = useCallback((moduleId: string): boolean => {
    const state = moduleStates.find(s => s.moduleId === moduleId);
    return state?.status === 'active' || state?.status === 'trial';
  }, [moduleStates]);

  // Verifica se módulo está disponível (pode ser ativado)
  const isModuleAvailable = useCallback((moduleId: string): boolean => {
    const module = getModuleFromCatalog(moduleId);
    return module?.isAvailable ?? false;
  }, []);

  // Obtém fonte de acesso do módulo
  const getModuleAccessSource = useCallback((moduleId: string): ModuleAccessSource | null => {
    const state = moduleStates.find(s => s.moduleId === moduleId);
    return state?.accessSource ?? null;
  }, [moduleStates]);

  // Verifica se pode habilitar módulo
  const canEnableModule = useCallback((moduleId: string): { canEnable: boolean; reason?: string } => {
    const module = getModuleFromCatalog(moduleId);
    
    if (!module) {
      return { canEnable: false, reason: 'Módulo não encontrado' };
    }
    
    if (!module.isAvailable) {
      return { canEnable: false, reason: 'Módulo não disponível' };
    }
    
    // Verifica dependências
    const enabledIds = moduleStates.filter(s => s.status === 'active').map(s => s.moduleId);
    const deps = checkModuleDependencies(moduleId, enabledIds);
    
    if (!deps.satisfied) {
      const missingNames = deps.missing
        .map(id => getModuleFromCatalog(id)?.name)
        .filter(Boolean)
        .join(', ');
      return { canEnable: false, reason: `Requer: ${missingNames}` };
    }
    
    return { canEnable: true };
  }, [moduleStates]);

  // Habilita módulo
  const enableModule = useCallback((moduleId: string, source: ModuleAccessSource) => {
    const module = getModuleFromCatalog(moduleId);
    if (!module) return;
    
    setModuleStates(prev => {
      const existing = prev.find(s => s.moduleId === moduleId);
      
      if (existing) {
        return prev.map(s => 
          s.moduleId === moduleId 
            ? { ...s, status: 'active' as TenantModuleStatus, accessSource: source }
            : s
        );
      }
      
      return [...prev, {
        moduleId,
        status: 'active' as TenantModuleStatus,
        accessSource: source,
        activatedAt: new Date().toISOString(),
        quantity: 1,
      }];
    });
  }, []);

  // Desabilita módulo
  const disableModule = useCallback((moduleId: string) => {
    const module = getModuleFromCatalog(moduleId);
    
    // Não pode desabilitar módulos core
    if (module?.isCore) {
      console.warn(`Cannot disable core module: ${moduleId}`);
      return;
    }
    
    setModuleStates(prev => 
      prev.map(s => 
        s.moduleId === moduleId 
          ? { ...s, status: 'inactive' as TenantModuleStatus }
          : s
      )
    );
  }, []);

  // Atualiza quantidade de um módulo
  const updateModuleQuantity = useCallback((moduleId: string, quantity: number) => {
    setModuleStates(prev => 
      prev.map(s => 
        s.moduleId === moduleId 
          ? { ...s, quantity: Math.max(1, quantity) }
          : s
      )
    );
  }, []);

  // Lista módulos habilitados
  const getEnabledModules = useCallback((): ExtendedModuleConfig[] => {
    const enabledIds = moduleStates
      .filter(s => s.status === 'active' || s.status === 'trial')
      .map(s => s.moduleId);
    
    return MODULE_CATALOG.filter(m => enabledIds.includes(m.id));
  }, [moduleStates]);

  // Lista add-ons disponíveis
  const getAvailableAddons = useCallback((): ExtendedModuleConfig[] => {
    const enabledIds = moduleStates.filter(s => s.status === 'active').map(s => s.moduleId);
    
    return MODULE_CATALOG.filter(m => 
      !m.isCore && 
      m.isAvailable && 
      !enabledIds.includes(m.id)
    );
  }, [moduleStates]);

  // Módulos para navegação (abas)
  const getModulesForNavigation = useCallback((): ExtendedModuleConfig[] => {
    const enabledIds = moduleStates
      .filter(s => s.status === 'active' || s.status === 'trial')
      .map(s => s.moduleId);
    
    return MODULE_CATALOG
      .filter(m => enabledIds.includes(m.id) && m.tabComponent)
      .sort((a, b) => {
        // Ordenação: essenciais primeiro, depois por categoria
        if (a.isCore && !b.isCore) return -1;
        if (!a.isCore && b.isCore) return 1;
        return 0;
      });
  }, [moduleStates]);

  // Salva configuração
  const saveConfiguration = useCallback(() => {
    if (!tenantId) return;
    
    const config: TenantModulesConfig = {
      tenantId,
      planId,
      modules: moduleStates,
      updatedAt: new Date().toISOString(),
      updatedBy: 'current_user',
    };
    
    localStorage.setItem(`${STORAGE_KEY}_${tenantId}`, JSON.stringify(config));
  }, [tenantId, planId, moduleStates]);

  // Carrega configuração
  const loadConfiguration = useCallback((config: TenantModulesConfig) => {
    setTenantId(config.tenantId);
    setPlanId(config.planId);
    setModuleStates(config.modules);
  }, []);

  const value = useMemo(() => ({
    tenantId,
    planId,
    moduleStates,
    setTenantContext,
    isModuleEnabled,
    isModuleAvailable,
    canEnableModule,
    getModuleAccessSource,
    enableModule,
    disableModule,
    updateModuleQuantity,
    getEnabledModules,
    getAvailableAddons,
    getModulesForNavigation,
    saveConfiguration,
    loadConfiguration,
  }), [
    tenantId,
    planId,
    moduleStates,
    setTenantContext,
    isModuleEnabled,
    isModuleAvailable,
    canEnableModule,
    getModuleAccessSource,
    enableModule,
    disableModule,
    updateModuleQuantity,
    getEnabledModules,
    getAvailableAddons,
    getModulesForNavigation,
    saveConfiguration,
    loadConfiguration,
  ]);

  return (
    <TenantModulesContext.Provider value={value}>
      {children}
    </TenantModulesContext.Provider>
  );
}

// ============================================================================
// HOOKS
// ============================================================================

export function useTenantModules() {
  const context = useContext(TenantModulesContext);
  if (!context) {
    throw new Error('useTenantModules must be used within a TenantModulesProvider');
  }
  return context;
}

/**
 * Hook para verificar se um módulo específico está disponível
 */
export function useModule(moduleId: string) {
  const { isModuleEnabled, isModuleAvailable, getModuleAccessSource } = useTenantModules();
  
  return {
    enabled: isModuleEnabled(moduleId),
    available: isModuleAvailable(moduleId),
    accessSource: getModuleAccessSource(moduleId),
    module: getModuleFromCatalog(moduleId),
  };
}
