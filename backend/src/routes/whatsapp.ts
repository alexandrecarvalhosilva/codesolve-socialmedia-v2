import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission, requireTenantMembership } from '../middleware/auth.js';
import { cacheQRCode, getCachedQRCode } from '../config/redis.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// GET /api/whatsapp/instances - List WhatsApp instances
// ============================================================================
router.get('/instances', authenticate, requirePermission('whatsapp:instances:view'), requireTenantMembership, async (req: Request, res: Response) => {
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

    if (status) {
      where.status = status;
    }

    const [instances, total] = await Promise.all([
      prisma.whatsappInstance.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: {
            select: { id: true, name: true },
          },
          _count: {
            select: { conversations: true },
          },
        },
      }),
      prisma.whatsappInstance.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: instances.map(i => ({
          id: i.id,
          name: i.name,
          phoneNumber: i.phoneNumber,
          status: i.status,
          tenantId: i.tenantId,
          tenantName: i.tenant.name,
          conversationsCount: i._count.conversations,
          connectedAt: i.connectedAt?.toISOString() || null,
          disconnectedAt: i.disconnectedAt?.toISOString() || null,
          createdAt: i.createdAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + instances.length < total,
      },
    });
  } catch (error) {
    console.error('List instances error:', error);
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
// GET /api/whatsapp/instances/:id - Get instance details
// ============================================================================
router.get('/instances/:id', authenticate, requirePermission('whatsapp:instances:view'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const instance = await prisma.whatsappInstance.findUnique({
      where: { id },
      include: {
        tenant: {
          select: { id: true, name: true },
        },
        _count: {
          select: { conversations: true },
        },
      },
    });

    if (!instance || instance.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INSTANCE_NOT_FOUND',
          message: 'Instância não encontrada',
        },
      });
    }

    // Check tenant access
    if (user.role !== 'superadmin' && instance.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta instância',
        },
      });
    }

    // Get QR code from cache if connecting
    let qrCode = null;
    if (instance.status === 'connecting') {
      qrCode = await getCachedQRCode(id);
    }

    return res.json({
      success: true,
      data: {
        id: instance.id,
        name: instance.name,
        phoneNumber: instance.phoneNumber,
        status: instance.status,
        qrCode,
        tenantId: instance.tenantId,
        tenantName: instance.tenant.name,
        evolutionInstanceId: instance.evolutionInstanceId,
        conversationsCount: instance._count.conversations,
        connectedAt: instance.connectedAt?.toISOString() || null,
        disconnectedAt: instance.disconnectedAt?.toISOString() || null,
        createdAt: instance.createdAt.toISOString(),
        updatedAt: instance.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get instance error:', error);
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
// POST /api/whatsapp/instances - Create instance
// ============================================================================
router.post('/instances', authenticate, requirePermission('whatsapp:instances:create'), requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { name, tenantId } = req.body;

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

    if (!name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nome da instância é obrigatório',
        },
      });
    }

    // Check instance limit
    const tenant = await prisma.tenant.findUnique({
      where: { id: targetTenantId },
      include: {
        plan: true,
        _count: {
          select: { whatsappInstances: { where: { deletedAt: null } } },
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

    const maxInstances = tenant.plan?.maxWhatsappInstances || 1;
    if (tenant._count.whatsappInstances >= maxInstances) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSTANCE_LIMIT_REACHED',
          message: `Limite de ${maxInstances} instância(s) WhatsApp atingido`,
        },
      });
    }

    // Create instance
    const instance = await prisma.whatsappInstance.create({
      data: {
        id: uuidv4(),
        tenantId: targetTenantId,
        name,
        status: 'disconnected',
      },
    });

    // TODO: Create instance in Evolution API

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: targetTenantId,
        userId: user.id,
        action: 'whatsapp.instance.created',
        entity: 'whatsapp_instance',
        entityId: instance.id,
        newValue: { name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: instance.id,
        name: instance.name,
        status: instance.status,
        tenantId: instance.tenantId,
        createdAt: instance.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create instance error:', error);
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
// POST /api/whatsapp/instances/:id/connect - Generate QR code
// ============================================================================
router.post('/instances/:id/connect', authenticate, requirePermission('whatsapp:qrcode:generate'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const instance = await prisma.whatsappInstance.findUnique({
      where: { id },
    });

    if (!instance || instance.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INSTANCE_NOT_FOUND',
          message: 'Instância não encontrada',
        },
      });
    }

    // Check tenant access
    if (user.role !== 'superadmin' && instance.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta instância',
        },
      });
    }

    if (instance.status === 'connected') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_CONNECTED',
          message: 'Instância já está conectada',
        },
      });
    }

    // Update status to connecting
    await prisma.whatsappInstance.update({
      where: { id },
      data: { status: 'connecting' },
    });

    // TODO: Call Evolution API to get QR code
    // For now, generate a mock QR code
    const mockQRCode = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`;
    
    // Cache QR code for 60 seconds
    await cacheQRCode(id, mockQRCode, 60);

    return res.json({
      success: true,
      data: {
        id: instance.id,
        status: 'connecting',
        qrCode: mockQRCode,
        expiresIn: 60,
      },
    });
  } catch (error) {
    console.error('Connect instance error:', error);
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
// POST /api/whatsapp/instances/:id/disconnect - Disconnect instance
// ============================================================================
router.post('/instances/:id/disconnect', authenticate, requirePermission('whatsapp:instances:create'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const instance = await prisma.whatsappInstance.findUnique({
      where: { id },
    });

    if (!instance || instance.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INSTANCE_NOT_FOUND',
          message: 'Instância não encontrada',
        },
      });
    }

    // Check tenant access
    if (user.role !== 'superadmin' && instance.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta instância',
        },
      });
    }

    // Update status
    const updatedInstance = await prisma.whatsappInstance.update({
      where: { id },
      data: {
        status: 'disconnected',
        disconnectedAt: new Date(),
      },
    });

    // TODO: Call Evolution API to disconnect

    return res.json({
      success: true,
      data: {
        id: updatedInstance.id,
        status: updatedInstance.status,
        disconnectedAt: updatedInstance.disconnectedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Disconnect instance error:', error);
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
// DELETE /api/whatsapp/instances/:id - Delete instance
// ============================================================================
router.delete('/instances/:id', authenticate, requirePermission('whatsapp:instances:delete'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const instance = await prisma.whatsappInstance.findUnique({
      where: { id },
    });

    if (!instance || instance.deletedAt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'INSTANCE_NOT_FOUND',
          message: 'Instância não encontrada',
        },
      });
    }

    // Check tenant access
    if (user.role !== 'superadmin' && instance.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta instância',
        },
      });
    }

    // Soft delete
    await prisma.whatsappInstance.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'disconnected',
      },
    });

    // TODO: Delete instance from Evolution API

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: instance.tenantId,
        userId: user.id,
        action: 'whatsapp.instance.deleted',
        entity: 'whatsapp_instance',
        entityId: id,
        oldValue: { name: instance.name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.json({
      success: true,
      data: { message: 'Instância excluída com sucesso' },
    });
  } catch (error) {
    console.error('Delete instance error:', error);
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
// POST /api/whatsapp/webhook - Evolution API webhook
// ============================================================================
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    
    console.log('WhatsApp webhook received:', JSON.stringify(payload, null, 2));

    // TODO: Process webhook events
    // - message.received
    // - message.status
    // - connection.update
    // - qrcode.updated

    return res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
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
