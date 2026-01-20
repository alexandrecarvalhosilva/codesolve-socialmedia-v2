import { ReactNode, useEffect, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole, Permission } from '@/contexts/AuthContext';
import { useAudit } from '@/contexts/AuditContext';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  anyPermissions?: Permission[];
  redirectTo?: string;
  showAccessDenied?: boolean;
}

function AccessDeniedPage({ redirectTo }: { redirectTo: string }) {
  return (
    <div className="min-h-screen bg-cs-bg-primary flex items-center justify-center">
      <div className="text-center space-y-6 p-8 max-w-md">
        <div className="w-16 h-16 mx-auto bg-destructive/20 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-cs-text-primary">Acesso Negado</h1>
          <p className="text-cs-text-secondary">
            Você não tem permissão para acessar esta página. Entre em contato com o administrador se acredita que isso é um erro.
          </p>
        </div>
        <Button 
          onClick={() => window.location.href = redirectTo}
          className="bg-gradient-to-r from-cs-cyan to-cs-blue"
        >
          Voltar ao Início
        </Button>
      </div>
    </div>
  );
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  requiredPermissions,
  anyPermissions,
  redirectTo,
  showAccessDenied = false 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();
  const { logAccessDenied } = useAudit();
  const location = useLocation();
  const hasLoggedDenial = useRef(false);

  // Verificar role se especificado
  const hasRequiredRole = !allowedRoles || (user?.role && allowedRoles.includes(user.role));

  // Verificar permissões específicas (todas devem estar presentes)
  const hasRequiredPermissions = !requiredPermissions || hasAllPermissions(requiredPermissions);

  // Verificar permissões alternativas (pelo menos uma deve estar presente)
  const hasAnyRequiredPermission = !anyPermissions || hasAnyPermission(anyPermissions);

  // Acesso negado se qualquer verificação falhar
  const isAccessDenied = isAuthenticated && (!hasRequiredRole || !hasRequiredPermissions || !hasAnyRequiredPermission);

  // Registrar evento de acesso negado na auditoria
  useEffect(() => {
    if (isAccessDenied && !hasLoggedDenial.current && !isLoading) {
      hasLoggedDenial.current = true;
      logAccessDenied(
        location.pathname,
        allowedRoles,
        requiredPermissions || anyPermissions,
        `Usuário ${user?.name} (${user?.role}) tentou acessar ${location.pathname}`
      );
    }
  }, [isAccessDenied, isLoading, location.pathname, allowedRoles, requiredPermissions, anyPermissions, user, logAccessDenied]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cs-bg-primary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isAccessDenied) {
    const fallbackPath = redirectTo || (user?.role === 'superadmin' ? '/dashboard' : '/tenant/dashboard');
    
    if (showAccessDenied) {
      return <AccessDeniedPage redirectTo={fallbackPath} />;
    }
    
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
}

// Hook para verificar permissões em componentes
export function usePermission(permission: Permission): boolean {
  const { hasPermission } = useAuth();
  return hasPermission(permission);
}

// Hook para verificar múltiplas permissões
export function usePermissions(permissions: Permission[], mode: 'all' | 'any' = 'all'): boolean {
  const { hasAllPermissions, hasAnyPermission } = useAuth();
  return mode === 'all' ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
}

// Componente para renderizar condicionalmente baseado em permissão
interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  mode?: 'all' | 'any';
  fallback?: ReactNode;
  onDenied?: (action: string) => void;
}

export function PermissionGate({ 
  children, 
  permission, 
  permissions, 
  mode = 'all',
  fallback = null,
  onDenied
}: PermissionGateProps) {
  const { hasPermission, hasAllPermissions, hasAnyPermission } = useAuth();

  let hasAccess = true;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions) {
    hasAccess = mode === 'all' ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
