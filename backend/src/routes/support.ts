import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission, requireSuperAdmin } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// GET /api/support/tickets - List support tickets
// ============================================================================
router.get('/tickets', authenticate, requirePermission('support:view'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { page = 1, limit = 20, status, priority, tenantId } = req.query;
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

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
          assignedTo: {
            select: { id: true, name: true },
          },
          tenant: {
            select: { id: true, name: true },
          },
          _count: {
            select: { messages: true },
          },
        },
      }),
      prisma.ticket.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: tickets.map(t => ({
          id: t.id,
          ticketNumber: t.ticketNumber,
          subject: t.subject,
          status: t.status,
          priority: t.priority,
          category: t.category,
          createdBy: t.createdBy,
          assignedTo: t.assignedTo,
          tenant: t.tenant,
          messagesCount: t._count.messages,
          updatedAt: t.updatedAt?.toISOString() || null,
          createdAt: t.createdAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + tickets.length < total,
      },
    });
  } catch (error) {
    console.error('List tickets error:', error);
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
// GET /api/support/tickets/:id - Get ticket details
// ============================================================================
router.get('/tickets/:id', authenticate, requirePermission('support:view'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        tenant: {
          select: { id: true, name: true },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: { id: true, name: true, avatar: true, role: true },
            },
          },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Ticket não encontrado',
        },
      });
    }

    // Check tenant access
    if (user.role !== 'superadmin' && ticket.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a este ticket',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        createdBy: ticket.createdBy,
        assignedTo: ticket.assignedTo,
        tenant: ticket.tenant,
        messages: ticket.messages.map(m => ({
          id: m.id,
          content: m.content,
          sender: m.sender,
          isInternal: m.isInternal,
          attachments: m.attachments,
          createdAt: m.createdAt.toISOString(),
        })),
        resolvedAt: ticket.resolvedAt?.toISOString() || null,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Get ticket error:', error);
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
// POST /api/support/tickets - Create ticket
// ============================================================================
router.post('/tickets', authenticate, requirePermission('support:create'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { subject, description, priority = 'medium', category } = req.body;

    if (!subject || !description) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Assunto e descrição são obrigatórios',
        },
      });
    }

    // Generate ticket number
    const count = await prisma.ticket.count();
    const ticketNumber = `TKT-${String(count + 1).padStart(6, '0')}`;

    const ticket = await prisma.ticket.create({
      data: {
        id: uuidv4(),
        tenantId: user.tenantId!,
        ticketNumber,
        subject,
        description,
        priority,
        category: category || 'general',
        status: 'open',
        createdById: user.id,
        updatedAt: new Date(),
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Create initial message
    await prisma.ticketMessage.create({
      data: {
        id: uuidv4(),
        ticketId: ticket.id,
        senderId: user.id,
        content: description,
        isInternal: false,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        subject: ticket.subject,
        status: ticket.status,
        priority: ticket.priority,
        createdBy: ticket.createdBy,
        createdAt: ticket.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Create ticket error:', error);
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
// POST /api/support/tickets/:id/messages - Add message to ticket
// ============================================================================
router.post('/tickets/:id/messages', authenticate, requirePermission('support:respond'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;
    const { content, isInternal = false, attachments } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Conteúdo é obrigatório',
        },
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Ticket não encontrado',
        },
      });
    }

    // Check access
    if (user.role !== 'superadmin' && ticket.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a este ticket',
        },
      });
    }

    // Create message
    const message = await prisma.ticketMessage.create({
      data: {
        id: uuidv4(),
        ticketId: id,
        senderId: user.id,
        content,
        isInternal: user.role === 'superadmin' ? isInternal : false,
        attachments: attachments || [],
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true, role: true },
        },
      },
    });

    // Update ticket
    await prisma.ticket.update({
      where: { id },
      data: {
        updatedAt: new Date(),
        status: ticket.status === 'closed' ? 'open' : ticket.status,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        id: message.id,
        content: message.content,
        sender: message.sender,
        isInternal: message.isInternal,
        attachments: message.attachments,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Add message error:', error);
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
// POST /api/support/tickets/:id/assign - Assign ticket (SuperAdmin only)
// ============================================================================
router.post('/tickets/:id/assign', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assignToId } = req.body;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Ticket não encontrado',
        },
      });
    }

    // Validate assignee
    if (assignToId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assignToId },
      });

      if (!assignee || assignee.role !== 'superadmin') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ASSIGNEE',
            message: 'Usuário inválido para atribuição',
          },
        });
      }
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        assignedToId: assignToId || null,
        status: assignToId ? 'in_progress' : ticket.status,
        updatedAt: new Date(),
      },
      include: {
        assignedTo: {
          select: { id: true, name: true },
        },
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedTicket.id,
        assignedTo: updatedTicket.assignedTo,
        status: updatedTicket.status,
      },
    });
  } catch (error) {
    console.error('Assign ticket error:', error);
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
// POST /api/support/tickets/:id/close - Close ticket
// ============================================================================
router.post('/tickets/:id/close', authenticate, requirePermission('support:manage'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Ticket não encontrado',
        },
      });
    }

    // Check access
    if (user.role !== 'superadmin' && ticket.tenantId !== user.tenantId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a este ticket',
        },
      });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: 'closed',
        resolvedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedTicket.id,
        status: updatedTicket.status,
        resolvedAt: updatedTicket.resolvedAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Close ticket error:', error);
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
// PUT /api/support/tickets/:id/priority - Update ticket priority
// ============================================================================
router.put('/tickets/:id/priority', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prioridade inválida',
        },
      });
    }

    const ticket = await prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TICKET_NOT_FOUND',
          message: 'Ticket não encontrado',
        },
      });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        priority,
        updatedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedTicket.id,
        priority: updatedTicket.priority,
      },
    });
  } catch (error) {
    console.error('Update priority error:', error);
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
