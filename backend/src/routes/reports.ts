import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission, requireTenantMembership } from '../middleware/auth.js';
import { reportRateLimit } from '../middleware/rateLimit.js';

const router = Router();

// ============================================================================
// GET /api/reports/dashboard - Get dashboard data
// ============================================================================
router.get('/dashboard', authenticate, requirePermission('reports:view'), requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { tenantId, period = '7d' } = req.query;

    // Determine target tenant
    let targetTenantId = tenantId as string;
    if (user.role !== 'superadmin') {
      targetTenantId = user.tenantId!;
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

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Get counts
    const [
      totalConversations,
      activeConversations,
      totalMessages,
      inboundMessages,
      outboundMessages,
      totalUsers,
      activeInstances,
    ] = await Promise.all([
      prisma.conversation.count({
        where: { tenantId: targetTenantId },
      }),
      prisma.conversation.count({
        where: { tenantId: targetTenantId, status: { in: ['open', 'pending'] } },
      }),
      prisma.message.count({
        where: { tenantId: targetTenantId, createdAt: { gte: startDate } },
      }),
      prisma.message.count({
        where: { tenantId: targetTenantId, direction: 'inbound', createdAt: { gte: startDate } },
      }),
      prisma.message.count({
        where: { tenantId: targetTenantId, direction: 'outbound', createdAt: { gte: startDate } },
      }),
      prisma.user.count({
        where: { tenantId: targetTenantId, isActive: true, deletedAt: null },
      }),
      prisma.whatsappInstance.count({
        where: { tenantId: targetTenantId, status: 'connected', deletedAt: null },
      }),
    ]);

    // Get messages by day
    const messagesByDay = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") as date,
        COUNT(*)::int as total,
        SUM(CASE WHEN direction = 'inbound' THEN 1 ELSE 0 END)::int as inbound,
        SUM(CASE WHEN direction = 'outbound' THEN 1 ELSE 0 END)::int as outbound
      FROM messages
      WHERE "tenantId" = ${targetTenantId}
        AND "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // Get conversations by status
    const conversationsByStatus = await prisma.conversation.groupBy({
      by: ['status'],
      where: { tenantId: targetTenantId },
      _count: true,
    });

    // Get top operators by messages
    const topOperators = await prisma.message.groupBy({
      by: ['senderId'],
      where: {
        tenantId: targetTenantId,
        direction: 'outbound',
        senderId: { not: null },
        createdAt: { gte: startDate },
      },
      _count: {
        senderId: true,
      },
      orderBy: {
        _count: {
          senderId: 'desc',
        },
      },
      take: 5,
    });

    // Get operator details
    const operatorIds = topOperators.map(o => o.senderId).filter(Boolean) as string[];
    const operators = await prisma.user.findMany({
      where: { id: { in: operatorIds } },
      select: { id: true, name: true, avatar: true },
    });

    const topOperatorsWithDetails = topOperators.map(o => {
      const operator = operators.find(op => op.id === o.senderId);
      return {
        id: o.senderId,
        name: operator?.name || 'Desconhecido',
        avatar: operator?.avatar,
        messageCount: o._count.senderId,
      };
    });

    return res.json({
      success: true,
      data: {
        period,
        summary: {
          totalConversations,
          activeConversations,
          totalMessages,
          inboundMessages,
          outboundMessages,
          totalUsers,
          activeInstances,
        },
        messagesByDay,
        conversationsByStatus: conversationsByStatus.map(c => ({
          status: c.status,
          count: c._count,
        })),
        topOperators: topOperatorsWithDetails,
      },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
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
// GET /api/reports/messages - Get messages report
// ============================================================================
router.get('/messages', authenticate, requirePermission('reports:view'), reportRateLimit, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { tenantId, startDate, endDate, groupBy = 'day' } = req.query;

    // Determine target tenant
    let targetTenantId = tenantId as string;
    if (user.role !== 'superadmin') {
      targetTenantId = user.tenantId!;
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

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    let dateFormat = '%Y-%m-%d';
    if (groupBy === 'hour') {
      dateFormat = '%Y-%m-%d %H:00';
    } else if (groupBy === 'month') {
      dateFormat = '%Y-%m';
    }

    const data = await prisma.$queryRaw`
      SELECT
        TO_CHAR("createdAt", ${dateFormat}) as period,
        COUNT(*)::int as total,
        SUM(CASE WHEN direction = 'inbound' THEN 1 ELSE 0 END)::int as inbound,
        SUM(CASE WHEN direction = 'outbound' THEN 1 ELSE 0 END)::int as outbound,
        SUM(CASE WHEN "isFromAi" = true THEN 1 ELSE 0 END)::int as ai_messages
      FROM messages
      WHERE "tenantId" = ${targetTenantId}
        AND "createdAt" >= ${start}
        AND "createdAt" <= ${end}
      GROUP BY TO_CHAR("createdAt", ${dateFormat})
      ORDER BY period ASC
    `;

    return res.json({
      success: true,
      data: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        groupBy,
        items: data,
      },
    });
  } catch (error) {
    console.error('Messages report error:', error);
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
// GET /api/reports/conversations - Get conversations report
// ============================================================================
router.get('/conversations', authenticate, requirePermission('reports:view'), reportRateLimit, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { tenantId, startDate, endDate } = req.query;

    // Determine target tenant
    let targetTenantId = tenantId as string;
    if (user.role !== 'superadmin') {
      targetTenantId = user.tenantId!;
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

    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Conversations by day
    const byDay = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") as date,
        COUNT(*)::int as total,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END)::int as closed
      FROM conversations
      WHERE "tenantId" = ${targetTenantId}
        AND "createdAt" >= ${start}
        AND "createdAt" <= ${end}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // By channel
    const byChannel = await prisma.conversation.groupBy({
      by: ['channel'],
      where: {
        tenantId: targetTenantId,
        createdAt: { gte: start, lte: end },
      },
      _count: true,
    });

    // Average response time (simplified)
    const avgResponseTime = await prisma.$queryRaw`
      SELECT
        AVG(EXTRACT(EPOCH FROM (
          SELECT MIN(m2."createdAt")
          FROM messages m2
          WHERE m2."conversationId" = c.id
            AND m2.direction = 'outbound'
            AND m2."createdAt" > (
              SELECT MAX(m3."createdAt")
              FROM messages m3
              WHERE m3."conversationId" = c.id
                AND m3.direction = 'inbound'
                AND m3."createdAt" < m2."createdAt"
            )
        ) - (
          SELECT MAX(m3."createdAt")
          FROM messages m3
          WHERE m3."conversationId" = c.id
            AND m3.direction = 'inbound'
        ))) as avg_seconds
      FROM conversations c
      WHERE c."tenantId" = ${targetTenantId}
        AND c."createdAt" >= ${start}
        AND c."createdAt" <= ${end}
    `;

    return res.json({
      success: true,
      data: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        byDay,
        byChannel: byChannel.map(c => ({
          channel: c.channel,
          count: c._count,
        })),
        avgResponseTimeSeconds: (avgResponseTime as any)[0]?.avg_seconds || null,
      },
    });
  } catch (error) {
    console.error('Conversations report error:', error);
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
// GET /api/reports/usage - Get usage report
// ============================================================================
router.get('/usage', authenticate, requirePermission('reports:view'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { tenantId } = req.query;

    // Determine target tenant
    let targetTenantId = tenantId as string;
    if (user.role !== 'superadmin') {
      targetTenantId = user.tenantId!;
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

    const tenant = await prisma.tenant.findUnique({
      where: { id: targetTenantId },
      include: {
        plan: true,
        _count: {
          select: {
            users: { where: { isActive: true, deletedAt: null } },
            whatsappInstances: { where: { deletedAt: null } },
            automations: { where: { status: 'active', deletedAt: null } },
          },
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

    // Get current month messages
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const messagesThisMonth = await prisma.message.count({
      where: {
        tenantId: targetTenantId,
        createdAt: { gte: startOfMonth },
      },
    });

    // Get AI tokens used (from usage records)
    const aiTokensUsed = await prisma.usageRecord.aggregate({
      where: {
        tenantId: targetTenantId,
        resourceType: 'ai_tokens',
        period: { startsWith: new Date().toISOString().slice(0, 7) }, // Current month
      },
      _sum: { usageCount: true },
    });

    const plan = tenant.plan;

    return res.json({
      success: true,
      data: {
        users: {
          used: tenant._count.users,
          limit: plan?.maxUsers || 2,
          percentage: plan ? Math.round((tenant._count.users / plan.maxUsers) * 100) : 0,
        },
        whatsappInstances: {
          used: tenant._count.whatsappInstances,
          limit: plan?.maxWhatsappInstances || 1,
          percentage: plan ? Math.round((tenant._count.whatsappInstances / plan.maxWhatsappInstances) * 100) : 0,
        },
        messages: {
          used: messagesThisMonth,
          limit: plan?.maxMessagesPerMonth || 500,
          percentage: plan ? Math.round((messagesThisMonth / plan.maxMessagesPerMonth) * 100) : 0,
        },
        automations: {
          used: tenant._count.automations,
          limit: plan?.maxActiveAutomations || 0,
          percentage: plan?.maxActiveAutomations ? Math.round((tenant._count.automations / plan.maxActiveAutomations) * 100) : 0,
        },
        aiTokens: {
          used: Number(aiTokensUsed._sum.usageCount || 0) || 0,
          limit: plan?.maxAiTokensPerMonth || 0,
          percentage: plan?.maxAiTokensPerMonth ? Math.round(((Number(aiTokensUsed._sum.usageCount || 0) || 0) / plan.maxAiTokensPerMonth) * 100) : 0,
        },
        plan: plan ? {
          id: plan.id,
          name: plan.name,
          slug: plan.slug,
        } : null,
      },
    });
  } catch (error) {
    console.error('Usage report error:', error);
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
