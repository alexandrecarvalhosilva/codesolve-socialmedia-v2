import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission, requireTenantMembership } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// GET /api/chat/conversations - List conversations
// ============================================================================
router.get('/conversations', authenticate, requirePermission('chat:view'), requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { page = 1, limit = 20, status, channel, search, assignedToMe } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    // Filter by tenant (superadmin can see all if no tenantId specified)
    if (user.role !== 'superadmin') {
      where.tenantId = user.tenantId;
    } else if (req.query.tenantId) {
      where.tenantId = req.query.tenantId;
    }

    if (status) {
      where.status = status;
    }

    if (channel) {
      where.channel = channel;
    }

    if (assignedToMe === 'true') {
      where.assignedToId = user.id;
    }

    if (search) {
      where.OR = [
        { contactName: { contains: search as string, mode: 'insensitive' } },
        { contactPhone: { contains: search as string, mode: 'insensitive' } },
        { contactEmail: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { lastMessageAt: 'desc' },
        include: {
          assignedTo: {
            select: { id: true, name: true, avatar: true },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: conversations.map(c => ({
          id: c.id,
          tenantId: c.tenantId,
          channel: c.channel,
          contactPhone: c.contactPhone,
          contactName: c.contactName,
          contactEmail: c.contactEmail,
          contactAvatar: c.contactAvatar,
          status: c.status,
          priority: c.priority,
          assignedTo: c.assignedTo,
          aiEnabled: c.aiEnabled,
          tags: c.tags,
          lastMessage: c.messages[0] || null,
          messagesCount: c._count.messages,
          lastMessageAt: c.lastMessageAt?.toISOString() || null,
          createdAt: c.createdAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + conversations.length < total,
      },
    });
  } catch (error) {
    console.error('List conversations error:', error);
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
// GET /api/chat/conversations/:id - Get conversation details
// ============================================================================
router.get('/conversations/:id', authenticate, requirePermission('chat:view'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        tenant: true,
        assignedTo: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        whatsappInstance: {
          select: { id: true, name: true, phoneNumber: true },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: 'Conversa não encontrada',
        },
      });
    }

    // Check tenant access
    if (user.role !== 'superadmin' && conversation.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta conversa',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        id: conversation.id,
        tenantId: conversation.tenantId,
        tenantName: conversation.tenant.name,
        channel: conversation.channel,
        contactPhone: conversation.contactPhone,
        contactName: conversation.contactName,
        contactEmail: conversation.contactEmail,
        contactAvatar: conversation.contactAvatar,
        status: conversation.status,
        priority: conversation.priority,
        assignedTo: conversation.assignedTo,
        whatsappInstance: conversation.whatsappInstance,
        aiEnabled: conversation.aiEnabled,
        aiEscalationCount: conversation.aiEscalationCount,
        tags: conversation.tags,
        lastMessageAt: conversation.lastMessageAt?.toISOString() || null,
        closedAt: conversation.closedAt?.toISOString() || null,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get conversation error:', error);
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
// GET /api/chat/conversations/:id/messages - Get conversation messages
// ============================================================================
router.get('/conversations/:id/messages', authenticate, requirePermission('chat:view'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { page = 1, limit = 50, before } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Check conversation access
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: 'Conversa não encontrada',
        },
      });
    }

    if (user.role !== 'superadmin' && conversation.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta conversa',
        },
      });
    }

    const where: any = { conversationId: id };
    if (before) {
      where.createdAt = { lt: new Date(before as string) };
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          sender: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      prisma.message.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: messages.reverse().map(m => ({
          id: m.id,
          conversationId: m.conversationId,
          content: m.content,
          type: m.type,
          direction: m.direction,
          sender: m.sender,
          senderName: m.senderName,
          isFromAi: m.isFromAi,
          status: m.status,
          mediaUrl: m.mediaUrl,
          mediaType: m.mediaType,
          readAt: m.readAt?.toISOString() || null,
          deliveredAt: m.deliveredAt?.toISOString() || null,
          createdAt: m.createdAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + messages.length < total,
      },
    });
  } catch (error) {
    console.error('Get messages error:', error);
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
// POST /api/chat/conversations/:id/messages - Send message
// ============================================================================
router.post('/conversations/:id/messages', authenticate, requirePermission('chat:send'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { content, type = 'text', mediaUrl } = req.body;

    if (!content && !mediaUrl) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Conteúdo ou mídia é obrigatório',
        },
      });
    }

    // Check conversation access
    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: 'Conversa não encontrada',
        },
      });
    }

    if (user.role !== 'superadmin' && conversation.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta conversa',
        },
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        id: uuidv4(),
        tenantId: conversation.tenantId,
        conversationId: id,
        content: content || '',
        type,
        direction: 'outbound',
        senderId: user.id,
        senderName: user.name,
        isFromAi: false,
        status: 'pending',
        mediaUrl: mediaUrl || null,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Update conversation
    await prisma.conversation.update({
      where: { id },
      data: {
        lastMessageAt: new Date(),
        status: conversation.status === 'closed' ? 'open' : conversation.status,
      },
    });

    // TODO: Queue message for sending via WhatsApp/Evolution API

    return res.status(201).json({
      success: true,
      data: {
        id: message.id,
        conversationId: message.conversationId,
        content: message.content,
        type: message.type,
        direction: message.direction,
        sender: message.sender,
        senderName: message.senderName,
        status: message.status,
        mediaUrl: message.mediaUrl,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Send message error:', error);
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
// POST /api/chat/conversations/:id/assign - Assign conversation
// ============================================================================
router.post('/conversations/:id/assign', authenticate, requirePermission('chat:manage'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { assignToId } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: 'Conversa não encontrada',
        },
      });
    }

    if (user.role !== 'superadmin' && conversation.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta conversa',
        },
      });
    }

    // Validate assignee
    if (assignToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assignToId },
      });

      if (!assignee || assignee.tenantId !== conversation.tenantId) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ASSIGNEE',
            message: 'Usuário inválido para atribuição',
          },
        });
      }
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: {
        assignedToId: assignToId || null,
        status: assignToId ? 'pending' : conversation.status,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedConversation.id,
        assignedTo: updatedConversation.assignedTo,
        status: updatedConversation.status,
      },
    });
  } catch (error) {
    console.error('Assign conversation error:', error);
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
// POST /api/chat/conversations/:id/close - Close conversation
// ============================================================================
router.post('/conversations/:id/close', authenticate, requirePermission('chat:manage'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: 'Conversa não encontrada',
        },
      });
    }

    if (user.role !== 'superadmin' && conversation.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta conversa',
        },
      });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: {
        status: 'closed',
        closedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedConversation.id,
        status: updatedConversation.status,
        closedAt: updatedConversation.closedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Close conversation error:', error);
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
// PUT /api/chat/conversations/:id/tags - Update conversation tags
// ============================================================================
router.put('/conversations/:id/tags', authenticate, requirePermission('chat:manage'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { tags } = req.body;

    if (!Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tags deve ser um array',
        },
      });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CONVERSATION_NOT_FOUND',
          message: 'Conversa não encontrada',
        },
      });
    }

    if (user.role !== 'superadmin' && conversation.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta conversa',
        },
      });
    }

    const updatedConversation = await prisma.conversation.update({
      where: { id },
      data: { tags },
    });

    return res.json({
      success: true,
      data: {
        id: updatedConversation.id,
        tags: updatedConversation.tags,
      },
    });
  } catch (error) {
    console.error('Update tags error:', error);
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
