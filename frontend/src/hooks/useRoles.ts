import { useState, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';

// ============================================================================
// TIPOS
// ============================================================================

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  tenantId: string | null;
  isSystem: boolean;
  usersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionsData {
  all: string[];
  grouped: Record<string, string[]>;
}

interface RolesResponse {
  items: Role[];
  total: number;
}

interface CreateRoleData {
  name: string;
  description?: string;
  permissions: string[];
}

interface UpdateRoleData {
  name?: string;
  description?: string;
  permissions?: string[];
}

// ============================================================================
// HOOK: useRoles
// ============================================================================

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get<RolesResponse>('/api/roles');
      
      if (response.success && response.data) {
        setRoles(response.data.items);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar roles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRole = useCallback(async (data: CreateRoleData): Promise<Role | null> => {
    try {
      const response = await api.post<Role>('/api/roles', data);
      
      if (response.success && response.data) {
        setRoles(prev => [...prev, response.data!]);
        return response.data;
      }
      return null;
    } catch (err) {
      const apiError = err as ApiError;
      throw new Error(apiError.message || 'Erro ao criar role');
    }
  }, []);

  const updateRole = useCallback(async (id: string, data: UpdateRoleData): Promise<Role | null> => {
    try {
      const response = await api.put<Role>(`/api/roles/${id}`, data);
      
      if (response.success && response.data) {
        setRoles(prev => prev.map(r => r.id === id ? { ...r, ...response.data } : r));
        return response.data;
      }
      return null;
    } catch (err) {
      const apiError = err as ApiError;
      throw new Error(apiError.message || 'Erro ao atualizar role');
    }
  }, []);

  const deleteRole = useCallback(async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/api/roles/${id}`);
      setRoles(prev => prev.filter(r => r.id !== id));
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      throw new Error(apiError.message || 'Erro ao deletar role');
    }
  }, []);

  return {
    roles,
    isLoading,
    error,
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
  };
}

// ============================================================================
// HOOK: usePermissions
// ============================================================================

export function usePermissions() {
  const [permissions, setPermissions] = useState<PermissionsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get<PermissionsData>('/api/roles/meta/permissions');
      
      if (response.success && response.data) {
        setPermissions(response.data);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar permissões');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    permissions,
    isLoading,
    error,
    fetchPermissions,
  };
}

// ============================================================================
// HOOK: useRole (single role)
// ============================================================================

export function useRole(roleId: string | undefined) {
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRole = useCallback(async () => {
    if (!roleId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get<Role>(`/api/roles/${roleId}`);
      
      if (response.success && response.data) {
        setRole(response.data);
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Erro ao carregar role');
    } finally {
      setIsLoading(false);
    }
  }, [roleId]);

  return {
    role,
    isLoading,
    error,
    fetchRole,
  };
}
