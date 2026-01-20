import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission, requireTenantMembership } from '../middleware/auth.js';
import { cacheQRCode, getCachedQRCode } from '../config/redis.js';
import { v4 as uuidv4 } from 'uuid';
import evolutionApi, { 
  createInstance as createEvolutionInstance,
  connectInstance as connectEvolutionInstance,
  deleteInstance as deleteEvolutionInstance,
  logoutInstance as logoutEvolutionInstance,
  getConnectionState,
  fetchInstance,
  sendTextMessage,
  sendMediaMessage,
  formatPhoneNumber,
  extractPhoneFromJid,
} from '../services/evolutionApi.js';
import { env } from '../config/env.js';

const router = Router();

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Gera um nome único para a instância no Evolution API
 * Formato: {tenantSlug}_{instanceName}_{shortId}
 */
function generateEvolutionInstanceName(tenantSlug: string, instanceName: string): string {
  const shortId = uuidv4().substring(0, 8);
  const cleanName = instanceName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const cleanSlug = tenantSlug.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${cleanSlug}_${cleanName}_${shortId}`;
}

// ============================================================================
// GET /api/whatsapp/instances - List WhatsApp instances
// ============================================================================
router.get('/instances', authenticate, requirePermission('whatsapp:instances:view'), async (req: Request, res: Response) => {
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
            select: { id: true, name: true, slug: true },
          },
          _count: {
            select: { conversations: true },
          },
        },
      }),
      prisma.whatsappInstance.count({ where }),
    ]);

    // Verificar status real de cada instância na Evolution API
    const instancesWithRealStatus = await Promise.all(
      instances.map(async (instance) => {
        let realStatus = instance.status;
        
        // Tentar obter status real da Evolution API
        if (instance.evolutionInstanceId) {
          try {
            const connectionState = await getConnectionState(instance.evolutionInstanceId);
            if (connectionState.state === 'open') {
              realStatus = 'connected';
            } else if (connectionState.state === 'connecting') {
              realStatus = 'connecting';
            } else {
              realStatus = 'disconnected';
            }
            
            // Atualizar status no banco se diferente
            if (realStatus !== instance.status) {
              await prisma.whatsappInstance.update({
                where: { id: instance.id },
                data: { 
                  status: realStatus,
                  connectedAt: realStatus === 'connected' ? new Date() : instance.connectedAt,
                  disconnectedAt: realStatus === 'disconnected' ? new Date() : instance.disconnectedAt,
                },
              });
            }
          } catch (error) {
            // Se falhar ao obter status, manter o do banco
            console.warn(`Failed to get status for instance ${instance.evolutionInstanceId}:`, error);
          }
        }
        
        return {
          id: instance.id,
          name: instance.name,
          evolutionInstanceId: instance.evolutionInstanceId,
          phoneNumber: instance.phoneNumber,
          status: realStatus,
          tenantId: instance.tenantId,
          tenantName: instance.tenant.name,
          conversationsCount: instance._count.conversations,
          connectedAt: instance.connectedAt?.toISOString() || null,
          disconnectedAt: instance.disconnectedAt?.toISOString() || null,
          createdAt: instance.createdAt.toISOString(),
        };
      })
    );

    return res.json({
      success: true,
      data: {
        instances: instancesWithRealStatus,
        meta: {
          total,
          page: Number(page),
          limit: Number(limit),
          hasMore: skip + instances.length < total,
        },
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
          select: { id: true, name: true, slug: true },
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

    // Obter status real da Evolution API
    let realStatus = instance.status;
    let evolutionData = null;
    
    if (instance.evolutionInstanceId) {
      try {
        const connectionState = await getConnectionState(instance.evolutionInstanceId);
        if (connectionState.state === 'open') {
          realStatus = 'connected';
        } else if (connectionState.state === 'connecting') {
          realStatus = 'connecting';
        } else {
          realStatus = 'disconnected';
        }
        
        // Buscar mais detalhes da instância
        try {
          evolutionData = await fetchInstance(instance.evolutionInstanceId);
        } catch (e) {
          // Ignorar erro ao buscar detalhes
        }
      } catch (error) {
        console.warn(`Failed to get status for instance ${instance.evolutionInstanceId}:`, error);
      }
    }

    return res.json({
      success: true,
      data: {
        instance: {
          id: instance.id,
          name: instance.name,
          evolutionInstanceId: instance.evolutionInstanceId,
          phoneNumber: instance.phoneNumber,
          status: realStatus,
          tenantId: instance.tenantId,
          tenantName: instance.tenant.name,
          conversationsCount: instance._count.conversations,
          connectedAt: instance.connectedAt?.toISOString() || null,
          disconnectedAt: instance.disconnectedAt?.toISOString() || null,
          createdAt: instance.createdAt.toISOString(),
          evolutionData,
        },
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
router.post('/instances', authenticate, requirePermission('whatsapp:instances:create'), async (req: Request, res: Response) => {
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

    // Gerar nome único para Evolution API
    const evolutionInstanceId = generateEvolutionInstanceName(tenant.slug, name);

    // Criar instância na Evolution API
    let evolutionInstance;
    try {
      // Configurar webhook URL se disponível
      const webhookUrl = env.EVOLUTION_WEBHOOK_URL 
        ? `${env.EVOLUTION_WEBHOOK_URL}/api/webhooks/evolution/${targetTenantId}`
        : undefined;

      evolutionInstance = await createEvolutionInstance(evolutionInstanceId, {
        webhookUrl,
        webhookByEvents: true,
        webhookBase64: true,
        alwaysOnline: true,
        readMessages: true,
        readStatus: true,
      });
      
      console.log('Evolution instance created:', evolutionInstance);
    } catch (evolutionError: any) {
      console.error('Failed to create Evolution instance:', evolutionError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'EVOLUTION_API_ERROR',
          message: evolutionError.message || 'Erro ao criar instância na Evolution API',
        },
      });
    }

    // Create instance in database
    const instance = await prisma.whatsappInstance.create({
      data: {
        id: uuidv4(),
        tenantId: targetTenantId,
        name,
        evolutionInstanceId,
        apiKeyEncrypted: evolutionInstance.hash?.apikey,
        status: 'disconnected',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: targetTenantId,
        userId: user.id,
        action: 'whatsapp.instance.created',
        entity: 'whatsapp_instance',
        entityId: instance.id,
        newValue: { name, evolutionInstanceId },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        instance: {
          id: instance.id,
          name: instance.name,
          evolutionInstanceId: instance.evolutionInstanceId,
          status: instance.status,
          tenantId: instance.tenantId,
          createdAt: instance.createdAt.toISOString(),
        },
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

    if (!instance.evolutionInstanceId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EVOLUTION_INSTANCE_NOT_FOUND',
          message: 'Instância não está configurada na Evolution API',
        },
      });
    }

    // Update status to connecting
    await prisma.whatsappInstance.update({
      where: { id },
      data: { status: 'connecting' },
    });

    // Conectar na Evolution API para obter QR Code
    let qrCodeData;
    try {
      qrCodeData = await connectEvolutionInstance(instance.evolutionInstanceId);
      console.log('QR Code received:', qrCodeData.base64 ? 'base64 present' : 'no base64');
    } catch (evolutionError: any) {
      console.error('Failed to connect Evolution instance:', evolutionError);
      
      // Reverter status
      await prisma.whatsappInstance.update({
        where: { id },
        data: { status: 'disconnected' },
      });
      
      return res.status(500).json({
        success: false,
        error: {
          code: 'EVOLUTION_API_ERROR',
          message: evolutionError.message || 'Erro ao gerar QR Code',
        },
      });
    }

    // Cache QR code for 60 seconds
    if (qrCodeData.base64) {
      await cacheQRCode(id, qrCodeData.base64, 60);
    }

    // Calcular tempo de expiração (60 segundos)
    const expiresAt = new Date(Date.now() + 60 * 1000).toISOString();

    return res.json({
      success: true,
      data: {
        qrCode: qrCodeData.base64 ? `data:image/png;base64,${qrCodeData.base64}` : null,
        pairingCode: qrCodeData.pairingCode,
        expiresAt,
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

    // Desconectar na Evolution API
    if (instance.evolutionInstanceId) {
      try {
        await logoutEvolutionInstance(instance.evolutionInstanceId);
      } catch (evolutionError: any) {
        console.warn('Failed to logout Evolution instance:', evolutionError);
        // Continuar mesmo se falhar no Evolution
      }
    }

    // Update status
    const updatedInstance = await prisma.whatsappInstance.update({
      where: { id },
      data: {
        status: 'disconnected',
        disconnectedAt: new Date(),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: instance.tenantId,
        userId: user.id,
        action: 'whatsapp.instance.disconnected',
        entity: 'whatsapp_instance',
        entityId: instance.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

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

    // Deletar na Evolution API
    if (instance.evolutionInstanceId) {
      try {
        await deleteEvolutionInstance(instance.evolutionInstanceId);
      } catch (evolutionError: any) {
        console.warn('Failed to delete Evolution instance:', evolutionError);
        // Continuar mesmo se falhar no Evolution
      }
    }

    // Soft delete
    await prisma.whatsappInstance.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: 'disconnected',
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        tenantId: instance.tenantId,
        userId: user.id,
        action: 'whatsapp.instance.deleted',
        entity: 'whatsapp_instance',
        entityId: instance.id,
        oldValue: { name: instance.name },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.json({
      success: true,
      data: {
        message: 'Instância removida com sucesso',
      },
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
// POST /api/whatsapp/instances/:id/send - Send message
// ============================================================================
router.post('/instances/:id/send', authenticate, requirePermission('chat:manage'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { to, text, mediaType, mediaUrl, caption } = req.body;

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

    if (instance.status !== 'connected') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INSTANCE_NOT_CONNECTED',
          message: 'Instância não está conectada',
        },
      });
    }

    if (!instance.evolutionInstanceId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EVOLUTION_INSTANCE_NOT_FOUND',
          message: 'Instância não está configurada na Evolution API',
        },
      });
    }

    if (!to) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Destinatário é obrigatório',
        },
      });
    }

    let response;
    
    if (mediaType && mediaUrl) {
      // Enviar mídia
      response = await sendMediaMessage(
        instance.evolutionInstanceId,
        to,
        mediaType,
        mediaUrl,
        { caption }
      );
    } else if (text) {
      // Enviar texto
      response = await sendTextMessage(instance.evolutionInstanceId, to, text);
    } else {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Texto ou mídia é obrigatório',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        messageId: response.key.id,
        to: extractPhoneFromJid(response.key.remoteJid),
        timestamp: response.messageTimestamp,
      },
    });
  } catch (error: any) {
    console.error('Send message error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'SEND_MESSAGE_ERROR',
        message: error.message || 'Erro ao enviar mensagem',
      },
    });
  }
});

// ============================================================================
// GET /api/whatsapp/instances/:id/status - Get connection status
// ============================================================================
router.get('/instances/:id/status', authenticate, requirePermission('whatsapp:instances:view'), async (req: Request, res: Response) => {
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

    let status = instance.status;
    let connectionState = null;

    if (instance.evolutionInstanceId) {
      try {
        connectionState = await getConnectionState(instance.evolutionInstanceId);
        
        if (connectionState.state === 'open') {
          status = 'connected';
        } else if (connectionState.state === 'connecting') {
          status = 'connecting';
        } else {
          status = 'disconnected';
        }

        // Atualizar no banco se diferente
        if (status !== instance.status) {
          await prisma.whatsappInstance.update({
            where: { id },
            data: { 
              status,
              connectedAt: status === 'connected' ? new Date() : instance.connectedAt,
              disconnectedAt: status === 'disconnected' ? new Date() : instance.disconnectedAt,
            },
          });
        }
      } catch (error) {
        console.warn('Failed to get connection state:', error);
      }
    }

    return res.json({
      success: true,
      data: {
        status,
        connectionState,
      },
    });
  } catch (error) {
    console.error('Get status error:', error);
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
