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

// ============================================================================
// GET /api/support/slas - List SLAs
// ============================================================================
router.get('/slas', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const slas = await prisma.sLA.findMany({
      orderBy: { priority: 'asc' },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    return res.json({
      success: true,
      data: slas.map(s => ({
        id: s.id,
        name: s.name,
        description: s.description,
        firstResponseMinutes: s.firstResponseMinutes,
        resolutionMinutes: s.resolutionMinutes,
        priority: s.priority,
        isDefault: s.isDefault,
        isActive: s.isActive,
        ticketsCount: s._count.tickets,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('List SLAs error:', error);
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
// POST /api/support/slas - Create SLA
// ============================================================================
router.post('/slas', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { name, description, firstResponseMinutes, resolutionMinutes, priority, isDefault } = req.body;

    if (!name || !firstResponseMinutes || !resolutionMinutes || !priority) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nome, tempo de primeira resposta, tempo de resolução e prioridade são obrigatórios',
        },
      });
    }

    // If this is default, unset other defaults for same priority
    if (isDefault) {
      await prisma.sLA.updateMany({
        where: { priority, isDefault: true },
        data: { isDefault: false },
      });
    }

    const sla = await prisma.sLA.create({
      data: {
        id: uuidv4(),
        name,
        description: description || null,
        firstResponseMinutes,
        resolutionMinutes,
        priority,
        isDefault: isDefault || false,
      },
    });

    return res.status(201).json({
      success: true,
      data: sla,
    });
  } catch (error) {
    console.error('Create SLA error:', error);
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
// PUT /api/support/slas/:id - Update SLA
// ============================================================================
router.put('/slas/:id', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, firstResponseMinutes, resolutionMinutes, priority, isDefault, isActive } = req.body;

    const sla = await prisma.sLA.findUnique({
      where: { id },
    });

    if (!sla) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SLA_NOT_FOUND',
          message: 'SLA não encontrado',
        },
      });
    }

    // If setting as default, unset other defaults for same priority
    if (isDefault && !sla.isDefault) {
      const targetPriority = priority || sla.priority;
      await prisma.sLA.updateMany({
        where: { priority: targetPriority, isDefault: true },
        data: { isDefault: false },
      });
    }

    const updatedSla = await prisma.sLA.update({
      where: { id },
      data: {
        name: name ?? sla.name,
        description: description ?? sla.description,
        firstResponseMinutes: firstResponseMinutes ?? sla.firstResponseMinutes,
        resolutionMinutes: resolutionMinutes ?? sla.resolutionMinutes,
        priority: priority ?? sla.priority,
        isDefault: isDefault ?? sla.isDefault,
        isActive: isActive ?? sla.isActive,
      },
    });

    return res.json({
      success: true,
      data: updatedSla,
    });
  } catch (error) {
    console.error('Update SLA error:', error);
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
// DELETE /api/support/slas/:id - Delete SLA
// ============================================================================
router.delete('/slas/:id', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const sla = await prisma.sLA.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tickets: true },
        },
      },
    });

    if (!sla) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SLA_NOT_FOUND',
          message: 'SLA não encontrado',
        },
      });
    }

    if (sla._count.tickets > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'SLA_IN_USE',
          message: 'Este SLA está sendo usado por tickets e não pode ser removido',
        },
      });
    }

    await prisma.sLA.delete({
      where: { id },
    });

    return res.json({
      success: true,
      data: { message: 'SLA removido com sucesso' },
    });
  } catch (error) {
    console.error('Delete SLA error:', error);
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
// GET /api/support/stats - Get support statistics
// ============================================================================
router.get('/stats', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get ticket counts by status
    const ticketsByStatus = await prisma.ticket.groupBy({
      by: ['status'],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
      },
    });

    // Get ticket counts by priority
    const ticketsByPriority = await prisma.ticket.groupBy({
      by: ['priority'],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
      },
    });

    // Get total tickets
    const totalTickets = await prisma.ticket.count({
      where: {
        createdAt: { gte: startDate },
      },
    });

    // Get resolved tickets
    const resolvedTickets = await prisma.ticket.count({
      where: {
        createdAt: { gte: startDate },
        status: { in: ['resolved', 'closed'] },
      },
    });

    // Get open tickets
    const openTickets = await prisma.ticket.count({
      where: {
        status: { in: ['open', 'in_progress', 'waiting_customer', 'waiting_internal'] },
      },
    });

    // Calculate average resolution time (for resolved tickets)
    const resolvedTicketsWithTime = await prisma.ticket.findMany({
      where: {
        createdAt: { gte: startDate },
        resolvedAt: { not: null },
      },
      select: {
        createdAt: true,
        resolvedAt: true,
      },
    });

    let avgResolutionMinutes = 0;
    if (resolvedTicketsWithTime.length > 0) {
      const totalMinutes = resolvedTicketsWithTime.reduce((sum, t) => {
        const diff = t.resolvedAt!.getTime() - t.createdAt.getTime();
        return sum + diff / (1000 * 60);
      }, 0);
      avgResolutionMinutes = Math.round(totalMinutes / resolvedTicketsWithTime.length);
    }

    // Get tickets by category
    const ticketsByCategory = await prisma.ticket.groupBy({
      by: ['category'],
      _count: { id: true },
      where: {
        createdAt: { gte: startDate },
      },
    });

    return res.json({
      success: true,
      data: {
        period,
        summary: {
          totalTickets,
          openTickets,
          resolvedTickets,
          resolutionRate: totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0,
          avgResolutionMinutes,
        },
        byStatus: ticketsByStatus.map(s => ({
          status: s.status,
          count: s._count.id,
        })),
        byPriority: ticketsByPriority.map(p => ({
          priority: p.priority,
          count: p._count.id,
        })),
        byCategory: ticketsByCategory.map(c => ({
          category: c.category || 'general',
          count: c._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Get support stats error:', error);
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
// POST /api/support/tickets/:id/reopen - Reopen ticket
// ============================================================================
router.post('/tickets/:id/reopen', authenticate, requirePermission('support:manage'), async (req: Request, res: Response) => {
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

    if (ticket.status !== 'closed' && ticket.status !== 'resolved') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: 'Apenas tickets fechados ou resolvidos podem ser reabertos',
        },
      });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: 'open',
        resolvedAt: null,
        updatedAt: new Date(),
      },
    });

    return res.json({
      success: true,
      data: {
        id: updatedTicket.id,
        status: updatedTicket.status,
      },
    });
  } catch (error) {
    console.error('Reopen ticket error:', error);
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
// PUT /api/support/tickets/:id/status - Update ticket status
// ============================================================================
router.put('/tickets/:id/status', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['open', 'in_progress', 'waiting_customer', 'waiting_internal', 'resolved', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Status inválido',
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

    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    // Set resolvedAt if status is resolved or closed
    if ((status === 'resolved' || status === 'closed') && !ticket.resolvedAt) {
      updateData.resolvedAt = new Date();
    }

    // Clear resolvedAt if reopening
    if (status === 'open' || status === 'in_progress') {
      updateData.resolvedAt = null;
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      data: {
        id: updatedTicket.id,
        status: updatedTicket.status,
        resolvedAt: updatedTicket.resolvedAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Update ticket status error:', error);
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
