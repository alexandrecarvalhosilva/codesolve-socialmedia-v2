import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission } from '../middleware/auth.js';

const router = Router();

// ============================================================================
// GET /api/logs/audit - List audit logs
// ============================================================================
router.get('/audit', authenticate, requirePermission('logs:view'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { 
      page = 1, 
      limit = 50, 
      tenantId, 
      userId, 
      action, 
      entity, 
      startDate, 
      endDate 
    } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    // Filter by tenant
    if (user.role === 'superadmin') {
      if (tenantId) {
        where.tenantId = tenantId;
      }
    } else {
      where.tenantId = user.tenantId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = { contains: action as string, mode: 'insensitive' };
    }

    if (entity) {
      where.entity = entity;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate as string);
      }
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
          tenant: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: logs.map(log => ({
          id: log.id,
          action: log.action,
          entity: log.entity,
          entityId: log.entityId,
          user: log.user,
          tenant: log.tenant,
          oldValue: log.oldValue,
          newValue: log.newValue,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent,
          createdAt: log.createdAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + logs.length < total,
      },
    });
  } catch (error) {
    console.error('List audit logs error:', error);
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
// GET /api/logs/audit/:id - Get audit log details
// ============================================================================
router.get('/audit/:id', authenticate, requirePermission('logs:view'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const log = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        tenant: {
          select: { id: true, name: true },
        },
      },
    });

    if (!log) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'LOG_NOT_FOUND',
          message: 'Log não encontrado',
        },
      });
    }

    // Check tenant access
    if (user.role !== 'superadmin' && log.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a este log',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        user: log.user,
        tenant: log.tenant,
        oldValue: log.oldValue,
        newValue: log.newValue,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get audit log error:', error);
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
// GET /api/logs/actions - List available action types
// ============================================================================
router.get('/actions', authenticate, requirePermission('logs:view'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const where: any = {};
    if (user.role !== 'superadmin') {
      where.tenantId = user.tenantId;
    }

    const actions = await prisma.auditLog.findMany({
      where,
      select: { action: true },
      distinct: ['action'],
      orderBy: { action: 'asc' },
    });

    return res.json({
      success: true,
      data: actions.map(a => a.action),
    });
  } catch (error) {
    console.error('List actions error:', error);
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
// GET /api/logs/entities - List available entity types
// ============================================================================
router.get('/entities', authenticate, requirePermission('logs:view'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const where: any = {};
    if (user.role !== 'superadmin') {
      where.tenantId = user.tenantId;
    }

    const entities = await prisma.auditLog.findMany({
      where,
      select: { entity: true },
      distinct: ['entity'],
      orderBy: { entity: 'asc' },
    });

    return res.json({
      success: true,
      data: entities.map(e => e.entity),
    });
  } catch (error) {
    console.error('List entities error:', error);
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
