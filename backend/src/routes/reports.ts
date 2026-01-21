import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission, requireTenantMembership, requireSuperAdmin } from '../middleware/auth.js';
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
// GET /api/reports/metrics - Get metrics for dashboard charts
// ============================================================================
router.get('/metrics', authenticate, requirePermission('reports:view'), async (req: Request, res: Response) => {
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
    let days = 7;
    switch (period) {
      case '24h': days = 1; break;
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Previous period for comparison
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    // Current period metrics
    const [
      currentMessages,
      currentConversations,
      currentAiMessages,
      prevMessages,
      prevConversations,
    ] = await Promise.all([
      prisma.message.count({
        where: { tenantId: targetTenantId, createdAt: { gte: startDate } },
      }),
      prisma.conversation.count({
        where: { tenantId: targetTenantId, createdAt: { gte: startDate } },
      }),
      prisma.message.count({
        where: { tenantId: targetTenantId, isFromAi: true, createdAt: { gte: startDate } },
      }),
      prisma.message.count({
        where: { tenantId: targetTenantId, createdAt: { gte: prevStartDate, lt: startDate } },
      }),
      prisma.conversation.count({
        where: { tenantId: targetTenantId, createdAt: { gte: prevStartDate, lt: startDate } },
      }),
    ]);

    // Calculate trends
    const messagesTrend = prevMessages > 0 ? ((currentMessages - prevMessages) / prevMessages) * 100 : 0;
    const conversationsTrend = prevConversations > 0 ? ((currentConversations - prevConversations) / prevConversations) * 100 : 0;

    // Messages by day for chart
    const messagesByDay = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") as date,
        COUNT(*)::int as total,
        SUM(CASE WHEN direction = 'inbound' THEN 1 ELSE 0 END)::int as inbound,
        SUM(CASE WHEN direction = 'outbound' THEN 1 ELSE 0 END)::int as outbound,
        SUM(CASE WHEN "isFromAi" = true THEN 1 ELSE 0 END)::int as ai
      FROM messages
      WHERE "tenantId" = ${targetTenantId}
        AND "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // Conversations by day for chart
    const conversationsByDay = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") as date,
        COUNT(*)::int as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END)::int as open,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END)::int as closed
      FROM conversations
      WHERE "tenantId" = ${targetTenantId}
        AND "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    // Response time metrics (simplified)
    const avgResponseTime = 45; // TODO: Calculate real average

    return res.json({
      success: true,
      data: {
        period,
        kpis: {
          messages: {
            value: currentMessages,
            trend: Math.round(messagesTrend * 10) / 10,
            trendDirection: messagesTrend >= 0 ? 'up' : 'down',
          },
          conversations: {
            value: currentConversations,
            trend: Math.round(conversationsTrend * 10) / 10,
            trendDirection: conversationsTrend >= 0 ? 'up' : 'down',
          },
          aiMessages: {
            value: currentAiMessages,
            percentage: currentMessages > 0 ? Math.round((currentAiMessages / currentMessages) * 100) : 0,
          },
          avgResponseTime: {
            value: avgResponseTime,
            unit: 'seconds',
          },
        },
        charts: {
          messagesByDay,
          conversationsByDay,
        },
      },
    });
  } catch (error) {
    console.error('Metrics error:', error);
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
// GET /api/reports/ai-consumption - Get AI consumption data
// ============================================================================
router.get('/ai-consumption', authenticate, requirePermission('reports:view'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { tenantId, period = '30d' } = req.query;

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

    // Get tenant with plan
    const tenant = await prisma.tenant.findUnique({
      where: { id: targetTenantId },
      include: { plan: true },
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

    // Calculate date range
    let days = 30;
    switch (period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get AI messages count
    const aiMessages = await prisma.message.count({
      where: {
        tenantId: targetTenantId,
        isFromAi: true,
        createdAt: { gte: startDate },
      },
    });

    // Get usage records for AI tokens
    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        tenantId: targetTenantId,
        resourceType: 'ai_tokens',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'asc' },
    });

    const totalTokens = usageRecords.reduce((sum, r) => sum + r.usageCount, 0);
    const limit = tenant.plan?.maxAiTokensPerMonth || 10000;

    // Group by day for chart
    const usageByDay = await prisma.$queryRaw`
      SELECT
        DATE("createdAt") as date,
        SUM("usageCount")::int as tokens
      FROM usage_records
      WHERE "tenantId" = ${targetTenantId}
        AND "resourceType" = 'ai_tokens'
        AND "createdAt" >= ${startDate}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return res.json({
      success: true,
      data: {
        period,
        summary: {
          totalTokens,
          limit,
          percentage: Math.round((totalTokens / limit) * 100),
          aiMessages,
          avgTokensPerMessage: aiMessages > 0 ? Math.round(totalTokens / aiMessages) : 0,
        },
        usageByDay,
        plan: tenant.plan ? {
          name: tenant.plan.name,
          hasAi: tenant.plan.hasAi,
          maxTokens: tenant.plan.maxAiTokensPerMonth,
        } : null,
      },
    });
  } catch (error) {
    console.error('AI consumption error:', error);
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
// GET /api/reports/mrr - Get MRR data (SuperAdmin only)
// ============================================================================
router.get('/mrr', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { months = 12 } = req.query;

    // Get all active subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        status: { in: ['active', 'trialing'] },
      },
      include: {
        plan: true,
        tenant: {
          select: { id: true, name: true, billingCycle: true },
        },
      },
    });

    // Calculate current MRR
    let currentMrr = 0;
    for (const sub of subscriptions) {
      if (sub.plan) {
        let monthlyPrice = sub.plan.priceMonthly;
        
        // Convert to monthly based on billing cycle
        switch (sub.tenant.billingCycle) {
          case 'quarterly':
            monthlyPrice = Math.round(sub.plan.priceQuarterly / 3);
            break;
          case 'semiannual':
            monthlyPrice = Math.round(sub.plan.priceSemiannual / 6);
            break;
          case 'annual':
            monthlyPrice = Math.round(sub.plan.priceAnnual / 12);
            break;
        }
        
        // Apply discount
        const discountedPrice = monthlyPrice * (1 - (sub.discountPercent || 0) / 100);
        currentMrr += discountedPrice;
      }
    }

    // Get historical MRR (simplified - based on invoices)
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Number(months));

    const mrrByMonth = await prisma.$queryRaw`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        SUM(total)::int as revenue
      FROM invoices
      WHERE status = 'paid'
        AND "createdAt" >= ${startDate}
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `;

    // Get tenant count by month
    const tenantsByMonth = await prisma.$queryRaw`
      SELECT
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM tenants
      WHERE "createdAt" >= ${startDate}
        AND status != 'canceled'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month ASC
    `;

    return res.json({
      success: true,
      data: {
        currentMrr: currentMrr / 100, // Convert from cents to currency
        activeSubscriptions: subscriptions.length,
        mrrByMonth,
        tenantsByMonth,
        avgRevenuePerTenant: subscriptions.length > 0 ? Math.round(currentMrr / subscriptions.length) / 100 : 0,
      },
    });
  } catch (error) {
    console.error('MRR report error:', error);
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
// GET /api/reports/financial - Get financial dashboard data (SuperAdmin only)
// ============================================================================
router.get('/financial', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    let days = 30;
    switch (period) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      case '365d': days = 365; break;
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get invoice stats
    const [
      totalRevenue,
      pendingRevenue,
      overdueRevenue,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
    ] = await Promise.all([
      prisma.invoice.aggregate({
        where: { status: 'paid', paidAt: { gte: startDate } },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { status: 'pending' },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: { status: 'overdue' },
        _sum: { total: true },
      }),
      prisma.invoice.count({
        where: { status: 'paid', paidAt: { gte: startDate } },
      }),
      prisma.invoice.count({
        where: { status: 'pending' },
      }),
      prisma.invoice.count({
        where: { status: 'overdue' },
      }),
    ]);

    // Revenue by day
    const revenueByDay = await prisma.$queryRaw`
      SELECT
        DATE("paidAt") as date,
        SUM(total)::int as revenue,
        COUNT(*)::int as count
      FROM invoices
      WHERE status = 'paid'
        AND "paidAt" >= ${startDate}
      GROUP BY DATE("paidAt")
      ORDER BY date ASC
    `;

    // Revenue by plan
    const revenueByPlan = await prisma.$queryRaw`
      SELECT
        p.name as plan_name,
        SUM(i.total)::int as revenue,
        COUNT(*)::int as count
      FROM invoices i
      JOIN subscriptions s ON i."subscriptionId" = s.id
      JOIN billing_plans p ON s."planId" = p.id
      WHERE i.status = 'paid'
        AND i."paidAt" >= ${startDate}
      GROUP BY p.name
      ORDER BY revenue DESC
    `;

    // Active subscriptions by plan
    const subscriptionsByPlan = await prisma.subscription.groupBy({
      by: ['planId'],
      where: { status: { in: ['active', 'trialing'] } },
      _count: true,
    });

    const plans = await prisma.billingPlan.findMany({
      where: { id: { in: subscriptionsByPlan.map(s => s.planId) } },
      select: { id: true, name: true },
    });

    const subscriptionsByPlanWithNames = subscriptionsByPlan.map(s => ({
      planId: s.planId,
      planName: plans.find(p => p.id === s.planId)?.name || 'Unknown',
      count: s._count,
    }));

    return res.json({
      success: true,
      data: {
        period,
        kpis: {
          totalRevenue: (totalRevenue._sum.total || 0) / 100,
          pendingRevenue: (pendingRevenue._sum.total || 0) / 100,
          overdueRevenue: (overdueRevenue._sum.total || 0) / 100,
          paidInvoices,
          pendingInvoices,
          overdueInvoices,
        },
        charts: {
          revenueByDay,
          revenueByPlan,
        },
        subscriptionsByPlan: subscriptionsByPlanWithNames,
      },
    });
  } catch (error) {
    console.error('Financial report error:', error);
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
        avgResponseTime,
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
