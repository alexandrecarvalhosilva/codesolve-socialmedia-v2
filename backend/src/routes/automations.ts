import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission, requireTenantMembership } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// GET /api/automations - List automations
// ============================================================================
router.get('/', authenticate, requirePermission('automations:view'), requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { page = 1, limit = 20, status, tenantId } = req.query;
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
      where.tenantId = user.tenantId;
    }

    if (status === 'active') {
      where.status = 'active';
    } else if (status === 'inactive' || status === 'paused') {
      where.status = 'paused';
    }

    const [automations, total] = await Promise.all([
      prisma.automation.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.automation.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: automations.map(a => ({
          id: a.id,
          name: a.name,
          description: a.description,
          trigger: a.trigger,
          isActive: a.status === 'active',
          executionCount: a.executionCount,
          lastExecutedAt: a.lastExecutedAt?.toISOString() || null,
          createdBy: a.createdBy,
          createdAt: a.createdAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + automations.length < total,
      },
    });
  } catch (error) {
    console.error('List automations error:', error);
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
// GET /api/automations/:id - Get automation details
// ============================================================================
router.get('/:id', authenticate, requirePermission('automations:view'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const automation = await prisma.automation.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        executions: {
          orderBy: { startedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!automation || automation.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AUTOMATION_NOT_FOUND',
          message: 'Automação não encontrada',
        },
      });
    }

    // Check tenant access
    if (user.role !== 'superadmin' && automation.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta automação',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        id: automation.id,
        name: automation.name,
        description: automation.description,
        trigger: automation.trigger,
        actions: automation.actions,
        conditions: automation.conditions,
        isActive: automation.status === 'active',
        executionCount: automation.executionCount,
        lastExecutedAt: automation.lastExecutedAt?.toISOString() || null,
        createdBy: automation.createdBy,
        recentExecutions: automation.executions.map(e => ({
          id: e.id,
          status: e.status,
          startedAt: e.startedAt?.toISOString() || null,
          completedAt: e.completedAt?.toISOString() || null,
          errorMessage: e.errorMessage,
        })),
        createdAt: automation.createdAt.toISOString(),
        updatedAt: automation.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get automation error:', error);
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
// POST /api/automations - Create automation
// ============================================================================
router.post('/', authenticate, requirePermission('automations:create'), requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { name, description, trigger, actions, conditions, tenantId } = req.body;

    // Determine target tenant
    let targetTenantId = tenantId;
    if (user.role !== 'superadmin') {
      targetTenantId = user.tenantId;
    }

    if (!targetTenantId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TENANT_REQUIRED',
          message: 'Tenant é obrigatório',
        },
      });
    }

    // Validate input
    if (!name || !trigger || !actions) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nome, tipo de gatilho e ações são obrigatórios',
        },
      });
    }

    // Check automation limit
    const tenant = await prisma.tenant.findUnique({
      where: { id: targetTenantId },
      include: {
        plan: true,
        _count: {
          select: { automations: { where: { deletedAt: null, status: 'active' } } },
        },
      },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TENANT_NOT_FOUND',
          message: 'Tenant não encontrado',
        },
      });
    }

    if (!tenant.plan?.hasAutomations) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FEATURE_NOT_AVAILABLE',
          message: 'Automações não estão disponíveis no seu plano',
        },
      });
    }

    const maxAutomations = tenant.plan?.maxActiveAutomations || 0;
    if (tenant._count.automations >= maxAutomations) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'AUTOMATION_LIMIT_REACHED',
          message: `Limite de ${maxAutomations} automação(ões) ativas atingido`,
        },
      });
    }

    // Create automation
    const automation = await prisma.automation.create({
      data: {
        id: uuidv4(),
        tenantId: targetTenantId,
        name,
        description: description || null,
        trigger: trigger || {},
        actions,
        conditions: conditions || [],
        status: 'draft',
        createdById: user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: targetTenantId,
        userId: user.id,
        action: 'automation.created',
        entity: 'automation',
        entityId: automation.id,
        newValue: { name, trigger },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: automation.id,
        name: automation.name,
        description: automation.description,
        trigger: automation.trigger,
        isActive: automation.status === 'active',
        createdBy: automation.createdBy,
        createdAt: automation.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create automation error:', error);
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
// PUT /api/automations/:id - Update automation
// ============================================================================
router.put('/:id', authenticate, requirePermission('automations:edit'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { name, description, trigger, actions, conditions } = req.body;

    const automation = await prisma.automation.findUnique({
      where: { id },
    });

    if (!automation || automation.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AUTOMATION_NOT_FOUND',
          message: 'Automação não encontrada',
        },
      });
    }

    // Check tenant access
    if (user.role !== 'superadmin' && automation.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta automação',
        },
      });
    }

    const oldValue = {
      name: automation.name,
      trigger: automation.trigger,
    };

    const updatedAutomation = await prisma.automation.update({
      where: { id },
      data: {
        name: name || undefined,
        description: description !== undefined ? description : undefined,
        trigger: trigger !== undefined ? trigger : undefined,
        actions: actions !== undefined ? actions : undefined,
        conditions: conditions !== undefined ? conditions : undefined,
      },
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: automation.tenantId,
        userId: user.id,
        action: 'automation.updated',
        entity: 'automation',
        entityId: id,
        oldValue,
        newValue: { name, trigger },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedAutomation.id,
        name: updatedAutomation.name,
        description: updatedAutomation.description,
        trigger: updatedAutomation.trigger,
        actions: updatedAutomation.actions,
        conditions: updatedAutomation.conditions,
        isActive: updatedAutomation.status === 'active',
        createdBy: updatedAutomation.createdBy,
        updatedAt: updatedAutomation.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Update automation error:', error);
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
// POST /api/automations/:id/toggle - Toggle automation active status
// ============================================================================
router.post('/:id/toggle', authenticate, requirePermission('automations:edit'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const automation = await prisma.automation.findUnique({
      where: { id },
    });

    if (!automation || automation.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AUTOMATION_NOT_FOUND',
          message: 'Automação não encontrada',
        },
      });
    }

    // Check tenant access
    if (user.role !== 'superadmin' && automation.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta automação',
        },
      });
    }

    // If activating, check limits
    const isCurrentlyActive = automation.status === 'active';
    if (!isCurrentlyActive) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: automation.tenantId },
        include: {
          plan: true,
          _count: {
            select: { automations: { where: { deletedAt: null, status: 'active' } } },
          },
        },
      });

      if (tenant) {
        const maxAutomations = tenant.plan?.maxActiveAutomations || 0;
        if (tenant._count.automations >= maxAutomations) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'AUTOMATION_LIMIT_REACHED',
              message: `Limite de ${maxAutomations} automação(ões) ativas atingido`,
            },
          });
        }
      }
    }

    const newStatus = isCurrentlyActive ? 'paused' : 'active';
    const updatedAutomation = await prisma.automation.update({
      where: { id },
      data: { status: newStatus },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: automation.tenantId,
        userId: user.id,
        action: newStatus === 'active' ? 'automation.activated' : 'automation.deactivated',
        entity: 'automation',
        entityId: id,
        oldValue: { status: automation.status },
        newValue: { status: newStatus },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedAutomation.id,
        isActive: updatedAutomation.status === 'active',
        updatedAt: updatedAutomation.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Toggle automation error:', error);
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
// DELETE /api/automations/:id - Delete automation (soft delete)
// ============================================================================
router.delete('/:id', authenticate, requirePermission('automations:delete'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const automation = await prisma.automation.findUnique({
      where: { id },
    });

    if (!automation || automation.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'AUTOMATION_NOT_FOUND',
          message: 'Automação não encontrada',
        },
      });
    }

    // Check tenant access
    if (user.role !== 'superadmin' && automation.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta automação',
        },
      });
    }

    // Soft delete
    await prisma.automation.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'paused',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: automation.tenantId,
        userId: user.id,
        action: 'automation.deleted',
        entity: 'automation',
        entityId: id,
        oldValue: { name: automation.name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.json({
      success: true,
      data: { message: 'Automação excluída com sucesso' },
    });
  } catch (error) {
    console.error('Delete automation error:', error);
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
