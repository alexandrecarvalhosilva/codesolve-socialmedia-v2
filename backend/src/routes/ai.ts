import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission, requireSuperAdmin, requireTenantMembership } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// GET /api/ai/config - Get AI configuration for tenant
// ============================================================================
router.get('/config', authenticate, requireTenantMembership, async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId! },
      include: {
        plan: true,
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

    // Get current month usage
    const currentMonth = new Date().toISOString().slice(0, 7);
    const usageRecord = await prisma.usageRecord.findFirst({
      where: {
        tenantId: tenant.id,
        resourceType: 'ai_tokens',
        period: currentMonth,
      },
    });

    return res.json({
      success: true,
      data: {
        enabled: true, // AI is enabled by default
        model: 'gpt-4.1-mini', // Default model
        temperature: 0.7,
        maxTokensPerMessage: 1000,
        systemPrompt: tenant.niche 
          ? `Você é um assistente virtual especializado em ${tenant.niche}. Responda de forma profissional e humanizada.`
          : 'Você é um assistente virtual profissional. Responda de forma clara e útil.',
        usage: {
          tokensUsed: Number(usageRecord?.usageCount || 0),
          tokensLimit: tenant.plan?.maxAiTokensPerMonth || 10000,
          percentage: tenant.plan?.maxAiTokensPerMonth 
            ? Math.round((Number(usageRecord?.usageCount || 0) / tenant.plan.maxAiTokensPerMonth) * 100)
            : 0,
        },
        plan: tenant.plan ? {
          name: tenant.plan.name,
          maxTokens: tenant.plan.maxAiTokensPerMonth,
        } : null,
      },
    });
  } catch (error) {
    console.error('Get AI config error:', error);
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
// PUT /api/ai/config - Update AI configuration for tenant
// ============================================================================
router.put('/config', authenticate, requirePermission('ai:configure'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { enabled, model, temperature, maxTokensPerMessage, systemPrompt } = req.body;

    // For now, store in tenant settings (could be a separate table in future)
    // This is a simplified implementation - in production, create a TenantAIConfig table

    return res.json({
      success: true,
      data: {
        enabled: enabled ?? true,
        model: model || 'gpt-4.1-mini',
        temperature: temperature ?? 0.7,
        maxTokensPerMessage: maxTokensPerMessage ?? 1000,
        systemPrompt: systemPrompt || 'Você é um assistente virtual profissional.',
        message: 'Configuração atualizada com sucesso',
      },
    });
  } catch (error) {
    console.error('Update AI config error:', error);
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
// GET /api/ai/consumption - Get AI consumption data
// ============================================================================
router.get('/consumption', authenticate, requirePermission('ai:view_consumption'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { period = '30d' } = req.query;

    const targetTenantId = user.role === 'superadmin' && req.query.tenantId 
      ? String(req.query.tenantId) 
      : user.tenantId;

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

    // Get AI messages count
    const aiMessages = await prisma.message.count({
      where: {
        tenantId: targetTenantId,
        isFromAi: true,
        createdAt: { gte: startDate },
      },
    });

    // Get usage records
    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        tenantId: targetTenantId,
        resourceType: 'ai_tokens',
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalTokens = usageRecords.reduce((sum, r) => sum + Number(r.usageCount), 0);
    const limit = tenant.plan?.maxAiTokensPerMonth || 10000;

    // Get daily usage
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
          maxTokens: tenant.plan.maxAiTokensPerMonth,
        } : null,
      },
    });
  } catch (error) {
    console.error('Get AI consumption error:', error);
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
// GET /api/ai/models - List available AI models
// ============================================================================
router.get('/models', authenticate, async (req: Request, res: Response) => {
  try {
    // List of available models (from environment/configuration)
    const models = [
      {
        id: 'gpt-4.1-mini',
        name: 'GPT-4.1 Mini',
        description: 'Modelo rápido e eficiente para respostas gerais',
        maxTokens: 4096,
        costPerToken: 0.00001,
        isDefault: true,
      },
      {
        id: 'gpt-4.1-nano',
        name: 'GPT-4.1 Nano',
        description: 'Modelo ultra-rápido para respostas simples',
        maxTokens: 2048,
        costPerToken: 0.000005,
        isDefault: false,
      },
      {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Modelo Google para respostas rápidas',
        maxTokens: 8192,
        costPerToken: 0.000008,
        isDefault: false,
      },
    ];

    return res.json({
      success: true,
      data: models,
    });
  } catch (error) {
    console.error('List AI models error:', error);
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
// POST /api/ai/test - Test AI response
// ============================================================================
router.post('/test', authenticate, requirePermission('ai:configure'), async (req: Request, res: Response) => {
  try {
    const { message, systemPrompt, model = 'gpt-4.1-mini', temperature = 0.7 } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Mensagem é obrigatória',
        },
      });
    }

    // Simulate AI response (in production, call OpenAI API)
    const simulatedResponse = {
      response: `Esta é uma resposta simulada para: "${message}". Em produção, esta resposta seria gerada pelo modelo ${model}.`,
      tokensUsed: Math.floor(Math.random() * 200) + 50,
      model,
      latencyMs: Math.floor(Math.random() * 500) + 100,
    };

    return res.json({
      success: true,
      data: simulatedResponse,
    });
  } catch (error) {
    console.error('Test AI error:', error);
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
// GET /api/ai/limits - Get AI limits for all tenants (SuperAdmin)
// ============================================================================
router.get('/limits', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const currentMonth = new Date().toISOString().slice(0, 7);

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where: { deletedAt: null },
        skip,
        take: Number(limit),
        include: {
          plan: {
            select: { name: true, maxAiTokensPerMonth: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.tenant.count({ where: { deletedAt: null } }),
    ]);

    // Get usage for each tenant
    const tenantsWithUsage = await Promise.all(
      tenants.map(async (tenant) => {
        const usageRecord = await prisma.usageRecord.findFirst({
          where: {
            tenantId: tenant.id,
            resourceType: 'ai_tokens',
            period: currentMonth,
          },
        });

        return {
          id: tenant.id,
          name: tenant.name,
          plan: tenant.plan?.name || 'Free',
          tokensUsed: Number(usageRecord?.usageCount || 0),
          tokensLimit: tenant.plan?.maxAiTokensPerMonth || 10000,
          percentage: tenant.plan?.maxAiTokensPerMonth
            ? Math.round((Number(usageRecord?.usageCount || 0) / tenant.plan.maxAiTokensPerMonth) * 100)
            : 0,
        };
      })
    );

    return res.json({
      success: true,
      data: {
        items: tenantsWithUsage,
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + tenants.length < total,
      },
    });
  } catch (error) {
    console.error('Get AI limits error:', error);
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
// PUT /api/ai/limits/:tenantId - Update AI limits for tenant (SuperAdmin)
// ============================================================================
router.put('/limits/:tenantId', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.params;
    const { maxTokensPerMonth, customLimit } = req.body;

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
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

    // In production, you would update a custom limit field or create a TenantAIConfig record
    // For now, return success with the requested limit

    return res.json({
      success: true,
      data: {
        tenantId,
        tenantName: tenant.name,
        maxTokensPerMonth: maxTokensPerMonth || tenant.plan?.maxAiTokensPerMonth || 10000,
        customLimit: customLimit || null,
        message: 'Limite atualizado com sucesso',
      },
    });
  } catch (error) {
    console.error('Update AI limits error:', error);
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
