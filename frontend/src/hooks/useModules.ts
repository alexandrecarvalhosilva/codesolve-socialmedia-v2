import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';

// ============================================================================
// TIPOS
// ============================================================================

export interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'communication' | 'ai' | 'automation' | 'analytics' | 'integrations' | 'advanced';
  icon: string;
  isCore: boolean;
  price: number;
  features: string[];
  dependencies: string[];
  enabled?: boolean;
  enabledAt?: string | null;
}

export interface ModuleCategory {
  id: string;
  name: string;
  description: string;
}

interface CatalogResponse {
  modules: ModuleDefinition[];
  categories: ModuleCategory[];
}

interface TenantModulesResponse {
  enabledModules: string[];
  modules: ModuleDefinition[];
}

interface ToggleModuleResponse {
  moduleId: string;
  enabled: boolean;
  enabledModules: string[];
}

// ============================================================================
// HOOK: useModuleCatalog
// ============================================================================

export function useModuleCatalog() {
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [categories, setCategories] = useState<ModuleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get<CatalogResponse>('/api/modules/catalog');
      
      if (response.success && response.data) {
        setModules(response.data.modules);
        setCategories(response.data.categories);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar catálogo de módulos');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    modules,
    categories,
    isLoading,
    error,
    fetchCatalog,
  };
}

// ============================================================================
// HOOK: useTenantModules
// ============================================================================

export function useTenantModules() {
  const [modules, setModules] = useState<ModuleDefinition[]>([]);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTenantModules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get<TenantModulesResponse>('/api/modules/tenant');
      
      if (response.success && response.data) {
        setModules(response.data.modules);
        setEnabledModules(response.data.enabledModules);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar módulos do tenant');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleModule = useCallback(async (moduleId: string, enabled: boolean, tenantId?: string): Promise<boolean> => {
    try {
      const response = await api.post<ToggleModuleResponse>(`/api/modules/tenant/${moduleId}/toggle`, {
        enabled,
        tenantId,
      });
      
      if (response.success && response.data) {
        setEnabledModules(response.data.enabledModules);
        setModules(prev => prev.map(m => ({
          ...m,
          enabled: response.data!.enabledModules.includes(m.id),
        })));
        return true;
      }
      return false;
    } catch (err) {
      const apiError = err as ApiError;
      throw new Error(apiError.message || 'Erro ao atualizar módulo');
    }
  }, []);

  const updateModulesBulk = useCallback(async (moduleIds: string[], tenantId?: string): Promise<boolean> => {
    try {
      const response = await api.put<{ enabledModules: string[] }>('/api/modules/tenant/bulk', {
        modules: moduleIds,
        tenantId,
      });
      
      if (response.success && response.data) {
        setEnabledModules(response.data.enabledModules);
        setModules(prev => prev.map(m => ({
          ...m,
          enabled: response.data!.enabledModules.includes(m.id),
        })));
        return true;
      }
      return false;
    } catch (err) {
      const apiError = err as ApiError;
      throw new Error(apiError.message || 'Erro ao atualizar módulos');
    }
  }, []);

  const isModuleEnabled = useCallback((moduleId: string): boolean => {
    return enabledModules.includes(moduleId);
  }, [enabledModules]);

  const getModulesByCategory = useCallback((category: string): ModuleDefinition[] => {
    return modules.filter(m => m.category === category);
  }, [modules]);

  return {
    modules,
    enabledModules,
    isLoading,
    error,
    fetchTenantModules,
    toggleModule,
    updateModulesBulk,
    isModuleEnabled,
    getModulesByCategory,
  };
}

// ============================================================================
// HOOK: useModuleAccess
// ============================================================================

export function useModuleAccess() {
  const { enabledModules, fetchTenantModules } = useTenantModules();
  
  const hasAccess = useCallback((moduleId: string): boolean => {
    return enabledModules.includes(moduleId);
  }, [enabledModules]);

  const hasAnyAccess = useCallback((moduleIds: string[]): boolean => {
    return moduleIds.some(id => enabledModules.includes(id));
  }, [enabledModules]);

  const hasAllAccess = useCallback((moduleIds: string[]): boolean => {
    return moduleIds.every(id => enabledModules.includes(id));
  }, [enabledModules]);

  return {
    enabledModules,
    hasAccess,
    hasAnyAccess,
    hasAllAccess,
    refresh: fetchTenantModules,
  };
}
