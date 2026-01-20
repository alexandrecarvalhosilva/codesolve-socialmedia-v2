import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth, mockUsers, rolePermissions } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

// Wrapper para os hooks
const wrapper = ({ children }: { children: ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Estado Inicial', () => {
    it('deve iniciar sem usuário autenticado', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('deve carregar usuário do localStorage se existir', () => {
      const savedUser = { id: '1', name: 'Test', email: 'test@test.com', role: 'admin' as const };
      localStorage.setItem('codesolve_auth_user', JSON.stringify(savedUser));

      const { result } = renderHook(() => useAuth(), { wrapper });
      
      // Aguardar o useEffect carregar
      expect(result.current.user?.email).toBe('test@test.com');
    });
  });

  describe('Login', () => {
    it('deve fazer login com sucesso usando credenciais válidas', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.login('superadmin@codesolve.com', '123456');
        expect(response.success).toBe(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.role).toBe('superadmin');
    });

    it('deve retornar erro para usuário não encontrado', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.login('naoexiste@test.com', '123456');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Usuário não encontrado');
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('deve retornar erro para senha incorreta', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.login('superadmin@codesolve.com', 'senhaerrada');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Senha incorreta');
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('deve normalizar email para lowercase', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.login('SuperAdmin@CodeSolve.COM', '123456');
        expect(response.success).toBe(true);
      });

      expect(result.current.user?.email).toBe('superadmin@codesolve.com');
    });
  });

  describe('Logout', () => {
    it('deve fazer logout corretamente', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Primeiro faz login
      await act(async () => {
        await result.current.login('superadmin@codesolve.com', '123456');
      });
      expect(result.current.isAuthenticated).toBe(true);

      // Depois faz logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('codesolve_auth_user')).toBeNull();
    });
  });

  describe('loginAsRole', () => {
    it('deve fazer login rápido como superadmin', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.loginAsRole('superadmin');
      });

      expect(result.current.user?.role).toBe('superadmin');
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('deve fazer login rápido como admin', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.loginAsRole('admin');
      });

      expect(result.current.user?.role).toBe('admin');
      expect(result.current.user?.tenantId).toBe('1');
    });

    it('deve fazer login rápido como operador', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.loginAsRole('operador');
      });

      expect(result.current.user?.role).toBe('operador');
    });

    it('deve fazer login rápido como visualizador', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      act(() => {
        result.current.loginAsRole('visualizador');
      });

      expect(result.current.user?.role).toBe('visualizador');
    });
  });

  describe('Permissões', () => {
    it('superadmin deve ter system:full', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('superadmin@codesolve.com', '123456');
      });

      expect(result.current.hasPermission('system:full')).toBe(true);
    });

    it('superadmin deve ter todas as permissões via system:full', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('superadmin@codesolve.com', '123456');
      });

      expect(result.current.hasPermission('qualquer:permissao')).toBe(true);
      expect(result.current.hasPermission('billing:view')).toBe(true);
      expect(result.current.hasPermission('tenants:delete')).toBe(true);
    });

    it('admin não deve ter permissões de superadmin', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('admin@tenant.com', '123456');
      });

      expect(result.current.hasPermission('system:full')).toBe(false);
      expect(result.current.hasPermission('tenants:delete')).toBe(false);
    });

    it('admin deve ter permissões de billing', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('admin@tenant.com', '123456');
      });

      expect(result.current.hasPermission('billing:view')).toBe(true);
      expect(result.current.hasPermission('billing:manage_plan')).toBe(true);
    });

    it('operador deve ter permissões limitadas', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('operador@tenant.com', '123456');
      });

      expect(result.current.hasPermission('chat:view')).toBe(true);
      expect(result.current.hasPermission('chat:manage')).toBe(true);
      expect(result.current.hasPermission('billing:view')).toBe(false);
    });

    it('visualizador deve ter apenas permissões de leitura', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('visualizador@tenant.com', '123456');
      });

      expect(result.current.hasPermission('chat:view')).toBe(true);
      expect(result.current.hasPermission('chat:manage')).toBe(false);
      expect(result.current.hasPermission('reports:view')).toBe(true);
    });

    it('hasAnyPermission deve retornar true se tiver pelo menos uma', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('operador@tenant.com', '123456');
      });

      expect(result.current.hasAnyPermission(['chat:view', 'billing:view'])).toBe(true);
      expect(result.current.hasAnyPermission(['billing:view', 'tenants:delete'])).toBe(false);
    });

    it('hasAllPermissions deve retornar true apenas se tiver todas', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('admin@tenant.com', '123456');
      });

      expect(result.current.hasAllPermissions(['chat:view', 'chat:manage'])).toBe(true);
      expect(result.current.hasAllPermissions(['chat:view', 'system:full'])).toBe(false);
    });

    it('getUserPermissions deve retornar lista de permissões do role', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('admin@tenant.com', '123456');
      });

      const permissions = result.current.getUserPermissions();
      expect(permissions).toEqual(rolePermissions.admin);
    });
  });

  describe('Redirecionamento', () => {
    it('superadmin deve ser redirecionado para /dashboard', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.getRedirectPath('superadmin')).toBe('/dashboard');
    });

    it('admin deve ser redirecionado para /tenant/dashboard', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.getRedirectPath('admin')).toBe('/tenant/dashboard');
    });

    it('operador deve ser redirecionado para /tenant/dashboard', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.getRedirectPath('operador')).toBe('/tenant/dashboard');
    });
  });

  describe('Registro', () => {
    it('deve registrar novo usuário com trial de 14 dias', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.register({
          name: 'Novo Usuário',
          email: 'novo@teste.com',
          phone: '11999999999',
          company: 'Empresa Teste',
          niche: 'Barbearia',
          password: 'senha123',
        });
        expect(response.success).toBe(true);
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.isTrial).toBe(true);
      expect(result.current.user?.role).toBe('admin');
    });

    it('deve rejeitar email já existente', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        const response = await result.current.register({
          name: 'Teste',
          email: 'superadmin@codesolve.com', // Email já existe nos mocks
          phone: '11999999999',
          company: 'Empresa',
          niche: 'Barbearia',
          password: 'senha123',
        });
        expect(response.success).toBe(false);
        expect(response.error).toBe('Este email já está cadastrado');
      });
    });
  });

  describe('Trial', () => {
    it('deve calcular dias restantes do trial corretamente', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Simular usuário com trial
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7); // 7 dias no futuro

      const savedUser = {
        id: '1',
        name: 'Trial User',
        email: 'trial@test.com',
        role: 'admin' as const,
        isTrial: true,
        trialEndsAt: trialEndDate.toISOString(),
      };
      localStorage.setItem('codesolve_auth_user', JSON.stringify(savedUser));

      // Re-renderizar para pegar o usuário do localStorage
      const { result: newResult } = renderHook(() => useAuth(), { wrapper });
      
      const daysRemaining = newResult.current.getTrialDaysRemaining();
      expect(daysRemaining).toBeGreaterThanOrEqual(6);
      expect(daysRemaining).toBeLessThanOrEqual(8);
    });

    it('deve retornar 0 se trial expirado', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5); // 5 dias atrás

      const savedUser = {
        id: '1',
        name: 'Trial User',
        email: 'trial@test.com',
        role: 'admin' as const,
        isTrial: true,
        trialEndsAt: pastDate.toISOString(),
      };
      localStorage.setItem('codesolve_auth_user', JSON.stringify(savedUser));

      const { result: newResult } = renderHook(() => useAuth(), { wrapper });
      
      expect(newResult.current.getTrialDaysRemaining()).toBe(0);
    });
  });
});

describe('mockUsers', () => {
  it('deve ter os 4 tipos de usuários definidos', () => {
    expect(Object.keys(mockUsers)).toHaveLength(4);
    expect(mockUsers['superadmin@codesolve.com']).toBeDefined();
    expect(mockUsers['admin@tenant.com']).toBeDefined();
    expect(mockUsers['operador@tenant.com']).toBeDefined();
    expect(mockUsers['visualizador@tenant.com']).toBeDefined();
  });

  it('todos os usuários mock devem ter senha 123456', () => {
    Object.values(mockUsers).forEach((user) => {
      expect(user.password).toBe('123456');
    });
  });
});

describe('rolePermissions', () => {
  it('superadmin deve ter mais permissões que admin', () => {
    expect(rolePermissions.superadmin.length).toBeGreaterThan(rolePermissions.admin.length);
  });

  it('admin deve ter mais permissões que operador', () => {
    expect(rolePermissions.admin.length).toBeGreaterThan(rolePermissions.operador.length);
  });

  it('operador deve ter mais permissões que visualizador', () => {
    expect(rolePermissions.operador.length).toBeGreaterThan(rolePermissions.visualizador.length);
  });
});
