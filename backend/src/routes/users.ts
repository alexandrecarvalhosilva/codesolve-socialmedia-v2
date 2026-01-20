import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission, requireTenantAccess } from '../middleware/auth.js';
import { hashPassword, canManageRole, getUserPermissions } from '../utils/auth.js';
import { invalidateUserPermissionsCache } from '../config/redis.js';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@prisma/client';

const router = Router();

// ============================================================================
// GET /api/users - List users
// ============================================================================
router.get('/', authenticate, requirePermission('users:view'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { page = 1, limit = 20, search, role, tenantId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      deletedAt: null,
    };

    // Filter by tenant
    if (user.role === 'superadmin') {
      if (tenantId) {
        where.tenantId = tenantId;
      }
    } else {
      // Non-superadmin can only see users from their tenant
      where.tenantId = user.tenantId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (role) {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: { tenant: true },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: users.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          avatar: u.avatar,
          phone: u.phone,
          tenantId: u.tenantId,
          tenantName: u.tenant?.name || null,
          isActive: u.isActive,
          lastLoginAt: u.lastLoginAt?.toISOString() || null,
          createdAt: u.createdAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + users.length < total,
      },
    });
  } catch (error) {
    console.error('List users error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
  }
});

// ============================================================================
// GET /api/users/:id - Get user details
// ============================================================================
router.get('/:id', authenticate, requirePermission('users:view'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { tenant: true },
    });

    if (!user || user.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado',
        },
      });
    }

    // Check tenant access
    if (currentUser.role !== 'superadmin' && user.tenantId !== currentUser.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a este usuário',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name || null,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        permissions: getUserPermissions(user.role),
        lastLoginAt: user.lastLoginAt?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
  }
});

// ============================================================================
// POST /api/users - Create user
// ============================================================================
router.post('/', authenticate, requirePermission('users:create'), async (req: Request, res: Response) => {
  try {
    const currentUser = req.user!;
    const { email, name, password, role, phone, tenantId } = req.body;

    // Validate input
    if (!email || !name || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, nome e senha são obrigatórios',
        },
      });
    }

    // Determine target tenant
    let targetTenantId = tenantId;
    if (currentUser.role !== 'superadmin') {
      // Non-superadmin can only create users in their own tenant
      targetTenantId = currentUser.tenantId;
    }

    // Validate role
    const targetRole = (role as UserRole) || 'operador';
    
    // Check if current user can assign this role
    if (currentUser.role !== 'superadmin') {
      if (targetRole === 'superadmin') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Você não pode criar um SuperAdmin',
          },
        });
      }
      
      if (!canManageRole(currentUser.role, targetRole)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Você não pode criar um usuário com este role',
          },
        });
      }
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Este email já está cadastrado',
        },
      });
    }

    // Check user limit for tenant
    if (targetTenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: targetTenantId },
        include: {
          plan: true,
          _count: { select: { users: true } },
        },
      });

      if (tenant?.plan && tenant._count.users >= tenant.plan.maxUsers) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'USER_LIMIT_REACHED',
            message: 'Limite de usuários do plano atingido',
          },
        });
      }
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: email.toLowerCase().trim(),
        passwordHash,
        name,
        phone: phone || null,
        role: targetRole,
        tenantId: targetTenantId || null,
        isActive: true,
      },
      include: { tenant: true },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: targetTenantId,
        userId: currentUser.id,
        action: 'user.created',
        entity: 'user',
        entityId: newUser.id,
        newValue: { email, name, role: targetRole },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        tenantId: newUser.tenantId,
        tenantName: newUser.tenant?.name || null,
        createdAt: newUser.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
  }
});

// ============================================================================
// PUT /api/users/:id - Update user
// ============================================================================
router.put('/:id', authenticate, requirePermission('users:edit'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;
    const { name, phone, role, isActive } = req.body;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado',
        },
      });
    }

    // Check tenant access
    if (currentUser.role !== 'superadmin' && user.tenantId !== currentUser.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a este usuário',
        },
      });
    }

    // Check role change permission
    if (role && role !== user.role) {
      if (currentUser.role !== 'superadmin') {
        if (role === 'superadmin') {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Você não pode promover para SuperAdmin',
            },
          });
        }
        
        if (!canManageRole(currentUser.role, role as UserRole)) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: 'Você não pode alterar para este role',
            },
          });
        }
      }
    }

    const oldValue = { name: user.name, role: user.role, isActive: user.isActive };

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: name || undefined,
        phone: phone !== undefined ? phone : undefined,
        role: role || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      include: { tenant: true },
    });

    // Invalidate permissions cache if role changed
    if (role && role !== user.role) {
      await invalidateUserPermissionsCache(id);
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: user.tenantId,
        userId: currentUser.id,
        action: 'user.updated',
        entity: 'user',
        entityId: id,
        oldValue,
        newValue: { name, role, isActive },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        phone: updatedUser.phone,
        tenantId: updatedUser.tenantId,
        tenantName: updatedUser.tenant?.name || null,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
  }
});

// ============================================================================
// DELETE /api/users/:id - Delete user (soft delete)
// ============================================================================
router.delete('/:id', authenticate, requirePermission('users:delete'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUser = req.user!;

    // Cannot delete yourself
    if (id === currentUser.id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_DELETE_SELF',
          message: 'Você não pode excluir sua própria conta',
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado',
        },
      });
    }

    // Check tenant access
    if (currentUser.role !== 'superadmin' && user.tenantId !== currentUser.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a este usuário',
        },
      });
    }

    // Check role hierarchy
    if (currentUser.role !== 'superadmin' && !canManageRole(currentUser.role, user.role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não pode excluir um usuário com este role',
        },
      });
    }

    // Soft delete
    await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });

    // Delete sessions
    await prisma.session.deleteMany({
      where: { userId: id },
    });

    // Invalidate cache
    await invalidateUserPermissionsCache(id);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: user.tenantId,
        userId: currentUser.id,
        action: 'user.deleted',
        entity: 'user',
        entityId: id,
        oldValue: { email: user.email, name: user.name, role: user.role },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.json({
      success: true,
      data: { message: 'Usuário excluído com sucesso' },
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Erro interno do servidor',
      },
    });
  }
});

export default router;
