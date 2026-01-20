import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// URL da API do backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Tipos de roles disponíveis
export type UserRole = 'superadmin' | 'admin' | 'operador' | 'visualizador';

// Tipo de permissão
export type Permission = string;

// Mapeamento de permissões por role
export const rolePermissions: Record<UserRole, Permission[]> = {
  superadmin: [
    // Sistema
    'system:full', 'system:settings',
    // Tenants
    'tenants:view', 'tenants:create', 'tenants:edit', 'tenants:delete',
    // Usuários
    'users:view', 'users:create', 'users:edit', 'users:delete', 'users:invite',
    // Roles
    'roles:view', 'roles:create', 'roles:edit', 'roles:delete',
    // Chat
    'chat:view', 'chat:manage', 'chat:delete',
    // Relatórios
    'reports:view', 'reports:create', 'reports:export',
    // Logs
    'logs:view', 'logs:delete', 'logs:export',
    // Calendário
    'calendar:view', 'calendar:manage',
    // Templates
    'templates:view', 'templates:create', 'templates:edit', 'templates:delete', 'templates:assign',
    // IA
    'ai:view_consumption', 'ai:configure', 'ai:manage_limits',
    // Notificações
    'notifications:view', 'notifications:manage', 'notifications:mute',
    // Perfil
    'profile:view', 'profile:edit',
    // Automações
    'automations:view', 'automations:create', 'automations:edit', 'automations:delete', 'automations:toggle',
    // Suporte Tenant
    'support:view', 'support:create', 'support:manage',
    // Suporte Admin
    'support:view_all', 'support:assign', 'support:manage_slas', 'support:respond', 'support:escalate',
    // Cobrança Tenant
    'billing:view', 'billing:manage_plan', 'billing:manage_modules', 'billing:view_invoices', 'billing:make_payment', 'billing:manage_payment_methods',
    // Financeiro SuperAdmin
    'finance:view_dashboard', 'finance:view_all_subscriptions', 'finance:manage_plans', 'finance:manage_modules',
    'finance:view_all_invoices', 'finance:create_invoice', 'finance:manage_coupons', 'finance:apply_discounts',
    'finance:block_tenant', 'finance:reports',
    // Onboarding
    'onboarding:manage', 'onboarding:skip',
    // WhatsApp
    'whatsapp:instances:view', 'whatsapp:instances:create', 'whatsapp:instances:delete', 'whatsapp:qrcode:generate',
    // Instagram
    'instagram:view', 'instagram:manage', 'instagram:posts', 'instagram:dms',
  ],
  admin: [
    // Perfil
    'profile:view', 'profile:edit',
    'notifications:view', 'notifications:manage', 'notifications:mute',
    // Usuários do Tenant
    'users:view', 'users:create', 'users:edit', 'users:delete', 'users:invite',
    // Roles dentro do Tenant
    'roles:view', 'roles:create', 'roles:edit', 'roles:delete',
    // Chat
    'chat:view', 'chat:manage', 'chat:delete',
    // Calendário
    'calendar:view', 'calendar:manage',
    // Automações
    'automations:view', 'automations:create', 'automations:edit', 'automations:delete', 'automations:toggle',
    // IA
    'ai:view_consumption', 'ai:configure', 'ai:manage_limits',
    // Relatórios
    'reports:view', 'reports:create', 'reports:export',
    // Logs do Tenant
    'logs:view', 'logs:export',
    // Suporte - Tenant
    'support:view', 'support:create', 'support:manage',
    // Cobrança
    'billing:view', 'billing:manage_plan', 'billing:manage_modules',
    'billing:view_invoices', 'billing:make_payment', 'billing:manage_payment_methods',
    // WhatsApp
    'whatsapp:instances:view', 'whatsapp:instances:create', 'whatsapp:instances:delete', 'whatsapp:qrcode:generate',
    // Instagram
    'instagram:view', 'instagram:manage', 'instagram:posts', 'instagram:dms',
  ],
  operador: [
    // Perfil próprio
    'profile:view', 'profile:edit',
    'notifications:view', 'notifications:manage',
    // Chat
    'chat:view', 'chat:manage',
    // Calendário
    'calendar:view', 'calendar:manage',
    // Relatórios
    'reports:view',
    // Suporte
    'support:view', 'support:create',
    // WhatsApp
    'whatsapp:instances:view', 'whatsapp:qrcode:generate',
  ],
  visualizador: [
    // Perfil próprio
    'profile:view',
    'notifications:view',
    // Chat
    'chat:view',
    // Relatórios
    'reports:view',
    // Calendário
    'calendar:view',
    // Suporte
    'support:view',
  ],
};

// Interface do usuário
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  tenantName?: string;
  avatar?: string;
  permissions?: Permission[];
  // Trial info
  isTrial?: boolean;
  trialEndsAt?: string;
  company?: string;
  niche?: string;
}

// Dados de registro
export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  company: string;
  niche: string;
  password: string;
}

// Interface do contexto de autenticação
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  getRedirectPath: (role: UserRole) => string;
  getTrialDaysRemaining: () => number;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  getUserPermissions: () => Permission[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Chave para localStorage
const AUTH_STORAGE_KEY = 'codesolve_auth_user';
const AUTH_TOKEN_KEY = 'codesolve_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Salvar usuário e token no localStorage
  const saveAuth = (userData: User | null, authToken: string | null) => {
    if (userData && authToken) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    setUser(userData);
    setToken(authToken);
  };

  // Calcular dias restantes do trial
  const getTrialDaysRemaining = (): number => {
    if (!user?.trialEndsAt) return 0;
    const endDate = new Date(user.trialEndsAt);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Obter permissões do usuário atual
  const getUserPermissions = (): Permission[] => {
    // Se o backend retornou permissões, usar elas
    if (user?.permissions && user.permissions.length > 0) {
      return user.permissions;
    }
    // Fallback para permissões baseadas no role
    if (!user?.role) return [];
    return rolePermissions[user.role] || [];
  };

  // Verificar se usuário tem uma permissão específica
  const hasPermission = (permission: Permission): boolean => {
    const permissions = getUserPermissions();
    // SuperAdmin com system:full tem todas as permissões
    if (permissions.includes('system:full')) return true;
    return permissions.includes(permission);
  };

  // Verificar se usuário tem pelo menos uma das permissões
  const hasAnyPermission = (permissions: Permission[]): boolean => {
    const userPermissions = getUserPermissions();
    // SuperAdmin com system:full tem todas as permissões
    if (userPermissions.includes('system:full')) return true;
    return permissions.some(p => userPermissions.includes(p));
  };

  // Verificar se usuário tem todas as permissões
  const hasAllPermissions = (permissions: Permission[]): boolean => {
    const userPermissions = getUserPermissions();
    // SuperAdmin com system:full tem todas as permissões
    if (userPermissions.includes('system:full')) return true;
    return permissions.every(p => userPermissions.includes(p));
  };

  // Determinar caminho de redirecionamento baseado no role
  const getRedirectPath = (role: UserRole): string => {
    if (role === 'superadmin') {
      return '/dashboard';
    }
    return '/tenant/dashboard';
  };

  // Login com email e senha - CONECTA AO BACKEND REAL
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { 
          success: false, 
          error: data.error || data.message || 'Erro ao fazer login' 
        };
      }

      // Mapear dados do backend para o formato do frontend
      const userData: User = {
        id: data.data.user.id,
        name: data.data.user.name,
        email: data.data.user.email,
        role: data.data.user.role as UserRole,
        tenantId: data.data.user.tenantId || undefined,
        tenantName: data.data.user.tenantName || undefined,
        avatar: data.data.user.avatar || data.data.user.name?.substring(0, 2).toUpperCase(),
        permissions: data.data.user.permissions || [],
        isTrial: data.data.user.isTrial || false,
        trialEndsAt: data.data.user.trialEndsAt || undefined,
      };

      saveAuth(userData, data.data.token);
      return { success: true };

    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão com o servidor. Verifique se o backend está rodando.' 
      };
    }
  };

  // Registro de novo usuário (trial) - CONECTA AO BACKEND REAL
  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          company: data.company,
          niche: data.niche,
          password: data.password,
        }),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        return { 
          success: false, 
          error: responseData.error || responseData.message || 'Erro ao registrar' 
        };
      }

      // Se o registro retornar token, fazer login automático
      if (responseData.data?.token && responseData.data?.user) {
        const userData: User = {
          id: responseData.data.user.id,
          name: responseData.data.user.name,
          email: responseData.data.user.email,
          role: responseData.data.user.role as UserRole,
          tenantId: responseData.data.user.tenantId || undefined,
          tenantName: responseData.data.user.tenantName || undefined,
          avatar: responseData.data.user.avatar || responseData.data.user.name?.substring(0, 2).toUpperCase(),
          permissions: responseData.data.user.permissions || [],
          isTrial: true,
          trialEndsAt: responseData.data.user.trialEndsAt || undefined,
          company: data.company,
          niche: data.niche,
        };

        saveAuth(userData, responseData.data.token);
      }

      return { success: true };

    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: 'Erro de conexão com o servidor. Verifique se o backend está rodando.' 
      };
    }
  };

  // Login rápido por role (para testes/desenvolvimento)
  const loginAsRole = async (role: UserRole) => {
    // Usuários de teste do backend
    const testUsers: Record<UserRole, { email: string; password: string }> = {
      superadmin: { email: 'admin@codesolve.com.br', password: 'Admin@123' },
      admin: { email: 'admin@techsolutions.com.br', password: 'Tech@123' },
      operador: { email: 'operador@codesolve.com.br', password: 'Operador@123' },
      visualizador: { email: 'visualizador@tenant.com', password: '123456' }
    };

    const testUser = testUsers[role];
    if (testUser) {
      await login(testUser.email, testUser.password);
    }
  };

  // Logout
  const logout = () => {
    saveAuth(null, null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        loginAsRole,
        logout,
        getRedirectPath,
        getTrialDaysRemaining,
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
        getUserPermissions
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Labels e cores para cada role
export const roleConfig: Record<UserRole, { label: string; color: string; description: string }> = {
  superadmin: {
    label: 'Super Admin',
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    description: 'Acesso total ao sistema'
  },
  admin: {
    label: 'Admin',
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    description: 'Gerenciamento completo do tenant'
  },
  operador: {
    label: 'Operador',
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
    description: 'Acesso operacional ao tenant'
  },
  visualizador: {
    label: 'Visualizador',
    color: 'bg-gradient-to-r from-gray-500 to-slate-500',
    description: 'Apenas visualização'
  }
};
