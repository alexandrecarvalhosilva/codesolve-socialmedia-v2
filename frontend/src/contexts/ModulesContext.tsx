import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { MODULE_REGISTRY, ModuleConfig, ModuleFeature, getModuleById, checkModuleDependencies } from '@/config/moduleRegistry';

interface ModulesContextType {
  modules: ModuleConfig[];
  toggleModule: (moduleId: string, enabled: boolean) => void;
  isModuleEnabled: (moduleId: string) => boolean;
  getEnabledModules: () => ModuleConfig[];
  resetToDefaults: () => void;
  
  // Feature management
  toggleFeature: (moduleId: string, featureId: string, enabled: boolean) => void;
  isFeatureEnabled: (moduleId: string, featureId: string) => boolean;
  getModuleFeatures: (moduleId: string) => ModuleFeature[];
  
  // Feature settings
  updateFeatureSetting: (moduleId: string, featureId: string, key: string, value: string | number | boolean) => void;
  getFeatureSetting: (moduleId: string, featureId: string, key: string) => string | number | boolean | undefined;
  
  // Dependencies
  getModuleDependencyStatus: (moduleId: string) => { satisfied: boolean; missing: string[] };
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

const STORAGE_KEY = 'cs_modules_config';
const FEATURES_STORAGE_KEY = 'cs_features_config';
const SETTINGS_STORAGE_KEY = 'cs_feature_settings';

export function ModulesProvider({ children }: { children: ReactNode }) {
  // Estado dos módulos (ativado/desativado)
  const [moduleStates, setModuleStates] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return MODULE_REGISTRY.reduce((acc, m) => ({ ...acc, [m.id]: m.enabled }), {});
  });

  // Estado das features por módulo
  const [featureStates, setFeatureStates] = useState<Record<string, Record<string, boolean>>>(() => {
    const saved = localStorage.getItem(FEATURES_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    // Inicializar com defaults de cada módulo
    const defaults: Record<string, Record<string, boolean>> = {};
    MODULE_REGISTRY.forEach(m => {
      defaults[m.id] = {};
      m.features.forEach(f => {
        defaults[m.id][f.id] = f.enabled;
      });
    });
    return defaults;
  });

  // Estado das configurações de features
  const [featureSettings, setFeatureSettings] = useState<Record<string, Record<string, Record<string, string | number | boolean>>>>(() => {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    // Inicializar com defaults
    const defaults: Record<string, Record<string, Record<string, string | number | boolean>>> = {};
    MODULE_REGISTRY.forEach(m => {
      defaults[m.id] = {};
      m.features.forEach(f => {
        defaults[m.id][f.id] = {};
        f.settings?.forEach(s => {
          defaults[m.id][f.id][s.key] = s.defaultValue;
        });
      });
    });
    return defaults;
  });

  // Persistir estados
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(moduleStates));
  }, [moduleStates]);

  useEffect(() => {
    localStorage.setItem(FEATURES_STORAGE_KEY, JSON.stringify(featureStates));
  }, [featureStates]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(featureSettings));
  }, [featureSettings]);

  // Build modules list with current enabled states
  const modules: ModuleConfig[] = useMemo(() => {
    return MODULE_REGISTRY.map(m => ({
      ...m,
      enabled: moduleStates[m.id] ?? m.enabled,
      features: m.features.map(f => ({
        ...f,
        enabled: featureStates[m.id]?.[f.id] ?? f.enabled,
        settings: f.settings?.map(s => ({
          ...s,
          defaultValue: featureSettings[m.id]?.[f.id]?.[s.key] ?? s.defaultValue,
        })),
      })),
    }));
  }, [moduleStates, featureStates, featureSettings]);

  const toggleModule = (moduleId: string, enabled: boolean) => {
    const module = getModuleById(moduleId);
    if (module?.isCore && !enabled) {
      console.warn(`Cannot disable core module: ${moduleId}`);
      return;
    }
    setModuleStates(prev => ({
      ...prev,
      [moduleId]: enabled,
    }));
  };

  const isModuleEnabled = (moduleId: string): boolean => {
    return moduleStates[moduleId] ?? MODULE_REGISTRY.find(m => m.id === moduleId)?.enabled ?? false;
  };

  const getEnabledModules = (): ModuleConfig[] => {
    return modules.filter(m => m.enabled);
  };

  const resetToDefaults = () => {
    const defaults = MODULE_REGISTRY.reduce((acc, m) => ({ ...acc, [m.id]: m.enabled }), {});
    setModuleStates(defaults);
    
    const featureDefaults: Record<string, Record<string, boolean>> = {};
    MODULE_REGISTRY.forEach(m => {
      featureDefaults[m.id] = {};
      m.features.forEach(f => {
        featureDefaults[m.id][f.id] = f.enabled;
      });
    });
    setFeatureStates(featureDefaults);
  };

  // Feature management
  const toggleFeature = (moduleId: string, featureId: string, enabled: boolean) => {
    setFeatureStates(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [featureId]: enabled,
      },
    }));
  };

  const isFeatureEnabled = (moduleId: string, featureId: string): boolean => {
    // Feature só está ativa se o módulo também estiver
    if (!isModuleEnabled(moduleId)) return false;
    return featureStates[moduleId]?.[featureId] ?? 
      MODULE_REGISTRY.find(m => m.id === moduleId)?.features.find(f => f.id === featureId)?.enabled ?? 
      false;
  };

  const getModuleFeatures = (moduleId: string): ModuleFeature[] => {
    const module = modules.find(m => m.id === moduleId);
    return module?.features || [];
  };

  // Feature settings
  const updateFeatureSetting = (moduleId: string, featureId: string, key: string, value: string | number | boolean) => {
    setFeatureSettings(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [featureId]: {
          ...prev[moduleId]?.[featureId],
          [key]: value,
        },
      },
    }));
  };

  const getFeatureSetting = (moduleId: string, featureId: string, key: string): string | number | boolean | undefined => {
    return featureSettings[moduleId]?.[featureId]?.[key];
  };

  // Dependencies
  const getModuleDependencyStatus = (moduleId: string): { satisfied: boolean; missing: string[] } => {
    const enabledIds = Object.entries(moduleStates)
      .filter(([_, enabled]) => enabled)
      .map(([id]) => id);
    
    const module = getModuleById(moduleId);
    const dependencies = module?.dependencies || [];
    const missing = dependencies.filter(dep => !enabledIds.includes(dep));
    
    return {
      satisfied: missing.length === 0,
      missing,
    };
  };

  return (
    <ModulesContext.Provider value={{
      modules,
      toggleModule,
      isModuleEnabled,
      getEnabledModules,
      resetToDefaults,
      toggleFeature,
      isFeatureEnabled,
      getModuleFeatures,
      updateFeatureSetting,
      getFeatureSetting,
      getModuleDependencyStatus,
    }}>
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error('useModules must be used within a ModulesProvider');
  }
  return context;
}

// Hook para verificar se uma feature específica está disponível
export function useFeature(moduleId: string, featureId: string) {
  const { isFeatureEnabled, getFeatureSetting } = useModules();
  
  return {
    enabled: isFeatureEnabled(moduleId, featureId),
    getSetting: (key: string) => getFeatureSetting(moduleId, featureId, key),
  };
}
