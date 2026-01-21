import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requireSuperAdmin, requireTenantAccess } from '../middleware/auth.js';
import { hashPassword, getUserPermissions } from '../utils/auth.js';
import { getClientIp } from '../utils/request.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// GET /api/tenants - List all tenants (SuperAdmin only)
// ============================================================================
router.get('/', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      deletedAt: null,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          plan: true,
          _count: {
            select: {
              users: true,
              whatsappInstances: true,
              conversations: true,
            },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: tenants.map(t => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          status: t.status,
          plan: t.plan?.name || 'Free',
          planId: t.planId,
          billingCycle: t.billingCycle,
          trialEndsAt: t.trialEndsAt?.toISOString() || null,
          usersCount: t._count.users,
          instancesCount: t._count.whatsappInstances,
          conversationsCount: t._count.conversations,
          createdAt: t.createdAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + tenants.length < total,
      },
    });
  } catch (error) {
    console.error('List tenants error:', error);
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
// GET /api/tenants/:id - Get tenant details
// ============================================================================
router.get('/:id', authenticate, requireTenantAccess('id'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        plan: true,
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            users: true,
            whatsappInstances: true,
            conversations: true,
            messages: true,
            automations: true,
          },
        },
      },
    });

    if (!tenant || tenant.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant não encontrado',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        domain: tenant.domain,
        logo: tenant.logo,
        status: tenant.status,
        plan: tenant.plan,
        billingCycle: tenant.billingCycle,
        trialEndsAt: tenant.trialEndsAt?.toISOString() || null,
        timezone: tenant.timezone,
        language: tenant.language,
        niche: tenant.niche,
        subscription: tenant.subscriptions[0] || null,
        counts: tenant._count,
        createdAt: tenant.createdAt.toISOString(),
        updatedAt: tenant.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get tenant error:', error);
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
// POST /api/tenants - Create tenant (SuperAdmin only)
// ============================================================================
router.post('/', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { name, slug, domain, adminEmail, adminName, adminPassword, planId, niche } = req.body;

    // Validate input
    if (!name || !adminEmail || !adminName || !adminPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nome, email do admin, nome do admin e senha são obrigatórios',
        },
      });
    }

    // Check if slug already exists
    const tenantSlug = slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (existingTenant) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'SLUG_EXISTS',
          message: 'Este slug já está em uso',
        },
      });
    }

    // Check if admin email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail.toLowerCase().trim() },
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

    // Set trial period (14 days - Q9)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    // Create tenant
    const tenant = await prisma.tenant.create({
      data: {
        id: uuidv4(),
        name,
        slug: tenantSlug,
        domain: domain || null,
        status: 'trial',
        planId: planId || null,
        trialEndsAt,
        niche: niche || null,
      },
    });

    // Hash password
    const passwordHash = await hashPassword(adminPassword);

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: adminEmail.toLowerCase().trim(),
        passwordHash,
        name: adminName,
        role: 'admin',
        tenantId: tenant.id,
        isActive: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: tenant.id,
        userId: req.user!.id,
        action: 'tenant.created',
        entity: 'tenant',
        entityId: tenant.id,
        newValue: { name, slug: tenantSlug, adminEmail },
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          status: tenant.status,
          trialEndsAt: tenant.trialEndsAt?.toISOString(),
        },
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          name: adminUser.name,
        },
      },
    });
  } catch (error) {
    console.error('Create tenant error:', error);
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
// PUT /api/tenants/:id - Update tenant
// ============================================================================
router.put('/:id', authenticate, requireTenantAccess('id'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { name, domain, logo, timezone, language, niche } = req.body;

    // Only admin or superadmin can update tenant
    if (user.role !== 'superadmin' && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem permissão para atualizar este tenant',
        },
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant || tenant.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant não encontrado',
        },
      });
    }

    const oldValue = { name: tenant.name, domain: tenant.domain, logo: tenant.logo };

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: {
        name: name || undefined,
        domain: domain !== undefined ? domain : undefined,
        logo: logo !== undefined ? logo : undefined,
        timezone: timezone || undefined,
        language: language || undefined,
        niche: niche !== undefined ? niche : undefined,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: id,
        userId: user.id,
        action: 'tenant.updated',
        entity: 'tenant',
        entityId: id,
        oldValue,
        newValue: { name, domain, logo },
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedTenant.id,
        name: updatedTenant.name,
        slug: updatedTenant.slug,
        domain: updatedTenant.domain,
        logo: updatedTenant.logo,
        timezone: updatedTenant.timezone,
        language: updatedTenant.language,
        niche: updatedTenant.niche,
        updatedAt: updatedTenant.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update tenant error:', error);
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
// POST /api/tenants/:id/suspend - Suspend tenant (SuperAdmin only)
// ============================================================================
router.post('/:id/suspend', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant || tenant.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant não encontrado',
        },
      });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: { status: 'suspended' },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: id,
        userId: req.user!.id,
        action: 'tenant.suspended',
        entity: 'tenant',
        entityId: id,
        oldValue: { status: tenant.status },
        newValue: { status: 'suspended', reason },
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedTenant.id,
        status: updatedTenant.status,
        message: 'Tenant suspenso com sucesso',
      },
    });
  } catch (error) {
    console.error('Suspend tenant error:', error);
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
// POST /api/tenants/:id/activate - Activate tenant (SuperAdmin only)
// ============================================================================
router.post('/:id/activate', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant || tenant.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant não encontrado',
        },
      });
    }

    const updatedTenant = await prisma.tenant.update({
      where: { id },
      data: { status: 'active' },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: id,
        userId: req.user!.id,
        action: 'tenant.activated',
        entity: 'tenant',
        entityId: id,
        oldValue: { status: tenant.status },
        newValue: { status: 'active' },
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedTenant.id,
        status: updatedTenant.status,
        message: 'Tenant ativado com sucesso',
      },
    });
  } catch (error) {
    console.error('Activate tenant error:', error);
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
// DELETE /api/tenants/:id - Delete tenant (SuperAdmin only, soft delete)
// ============================================================================
router.delete('/:id', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tenant = await prisma.tenant.findUnique({
      where: { id },
    });

    if (!tenant || tenant.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant não encontrado',
        },
      });
    }

    // Soft delete
    await prisma.tenant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'canceled',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: id,
        userId: req.user!.id,
        action: 'tenant.deleted',
        entity: 'tenant',
        entityId: id,
        oldValue: { name: tenant.name, status: tenant.status },
        ipAddress: getClientIp(req),
        userAgent: req.headers['user-agent'],
      },
    });

    return res.json({
      success: true,
      data: { message: 'Tenant excluído com sucesso' },
    });
  } catch (error) {
    console.error('Delete tenant error:', error);
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
