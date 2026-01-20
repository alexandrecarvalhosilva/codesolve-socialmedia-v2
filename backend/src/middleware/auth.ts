import { Request, Response, NextFunction } from 'express';
import { verifyToken, getUserPermissions, hasPermission, canAccessTenant } from '../utils/auth.js';
import { prisma } from '../config/database.js';
import { getCachedUserPermissions, cacheUserPermissions } from '../config/redis.js';
import { AuthenticatedUser, Permission } from '../types/index.js';
import { UserRole } from '@prisma/client';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token de autenticação não fornecido',
        },
      });
      return;
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token inválido ou expirado',
        },
      });
      return;
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { tenant: true },
    });

    if (!user || !user.isActive || user.deletedAt) {
      res.status(401).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado ou inativo',
        },
      });
      return;
    }

    // Get permissions (from cache or compute)
    let permissions = await getCachedUserPermissions(user.id);
    if (!permissions) {
      permissions = getUserPermissions(user.role);
      await cacheUserPermissions(user.id, permissions);
    }

    // Set user in request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      tenant: user.tenant,
      permissions,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AUTH_ERROR',
        message: 'Erro interno de autenticação',
      },
    });
  }
}

// ============================================================================
// AUTHORIZATION MIDDLEWARE
// ============================================================================

export function requirePermission(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        },
      });
      return;
    }

    // Check if user has any of the required permissions
    const hasRequired = requiredPermissions.some(permission => 
      hasPermission(req.user!.role, permission)
    );

    if (!hasRequired) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem permissão para realizar esta ação',
        },
      });
      return;
    }

    next();
  };
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem permissão para acessar este recurso',
        },
      });
      return;
    }

    next();
  };
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Usuário não autenticado',
      },
    });
    return;
  }

  if (req.user.role !== 'superadmin') {
    res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Apenas SuperAdmin pode acessar este recurso',
      },
    });
    return;
  }

  next();
}

// ============================================================================
// TENANT ACCESS MIDDLEWARE
// ============================================================================

export function requireTenantAccess(tenantIdParam: string = 'tenantId') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Usuário não autenticado',
        },
      });
      return;
    }

    // Get tenant ID from params, body, or query
    const tenantId = req.params[tenantIdParam] || req.body?.tenantId || req.query?.tenantId;

    if (!tenantId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'TENANT_REQUIRED',
          message: 'ID do tenant é obrigatório',
        },
      });
      return;
    }

    // Check if user can access the tenant
    if (!canAccessTenant(req.user.role, req.user.tenantId, tenantId as string)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_ACCESS_DENIED',
          message: 'Você não tem acesso a este tenant',
        },
      });
      return;
    }

    next();
  };
}

// Middleware to ensure user belongs to a tenant (not superadmin without tenant)
export function requireTenantMembership(req: Request, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Usuário não autenticado',
      },
    });
    return;
  }

  // SuperAdmin can operate without tenant
  if (req.user.role === 'superadmin') {
    next();
    return;
  }

  if (!req.user.tenantId) {
    res.status(403).json({
      success: false,
      error: {
        code: 'NO_TENANT',
        message: 'Usuário não está associado a nenhum tenant',
      },
    });
    return;
  }

  next();
}

// ============================================================================
// OPTIONAL AUTHENTICATION
// ============================================================================

export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    
    if (payload) {
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: { tenant: true },
      });

      if (user && user.isActive && !user.deletedAt) {
        const permissions = getUserPermissions(user.role);
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenant: user.tenant,
          permissions,
        };
      }
    }

    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
}
