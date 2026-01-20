import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission, requireSuperAdmin, requireTenantAccess } from '../middleware/auth.js';
import { getCachedPlans, cachePlans, invalidatePlansCache } from '../config/redis.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// GET /api/billing/plans - List all plans
// ============================================================================
router.get('/plans', async (req: Request, res: Response) => {
  try {
    // Try cache first
    let plans = await getCachedPlans();
    
    if (!plans) {
      plans = await prisma.billingPlan.findMany({
        where: { isActive: true, isPublic: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          planModules: {
            include: { module: true },
          },
        },
      });
      
      // Cache for 1 hour
      await cachePlans(plans);
    }

    return res.json({
      success: true,
      data: plans.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        priceMonthly: p.priceMonthly,
        priceQuarterly: p.priceQuarterly,
        priceSemiannual: p.priceSemiannual,
        priceAnnual: p.priceAnnual,
        maxWhatsappInstances: p.maxWhatsappInstances,
        maxMessagesPerMonth: p.maxMessagesPerMonth,
        maxUsers: p.maxUsers,
        maxAiTokensPerMonth: p.maxAiTokensPerMonth,
        maxActiveAutomations: p.maxActiveAutomations,
        maxStorageBytes: Number(p.maxStorageBytes),
        hasAi: p.hasAi,
        hasAutomations: p.hasAutomations,
        hasCalendarSync: p.hasCalendarSync,
        hasPrioritySupport: p.hasPrioritySupport,
        modules: (p as any).planModules?.map((pm: any) => pm.module) || [],
      })),
    });
  } catch (error) {
    console.error('List plans error:', error);
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
// GET /api/billing/plans/:id - Get plan details
// ============================================================================
router.get('/plans/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const plan = await prisma.billingPlan.findUnique({
      where: { id },
      include: {
        planModules: {
          include: { module: true },
        },
      },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PLAN_NOT_FOUND',
          message: 'Plano não encontrado',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        id: plan.id,
        slug: plan.slug,
        name: plan.name,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        priceQuarterly: plan.priceQuarterly,
        priceSemiannual: plan.priceSemiannual,
        priceAnnual: plan.priceAnnual,
        maxWhatsappInstances: plan.maxWhatsappInstances,
        maxMessagesPerMonth: plan.maxMessagesPerMonth,
        maxUsers: plan.maxUsers,
        maxAiTokensPerMonth: plan.maxAiTokensPerMonth,
        maxActiveAutomations: plan.maxActiveAutomations,
        maxStorageBytes: Number(plan.maxStorageBytes),
        hasAi: plan.hasAi,
        hasAutomations: plan.hasAutomations,
        hasCalendarSync: plan.hasCalendarSync,
        hasPrioritySupport: plan.hasPrioritySupport,
        modules: plan.planModules.map(pm => pm.module),
      },
    });
  } catch (error) {
    console.error('Get plan error:', error);
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
// POST /api/billing/plans - Create plan (SuperAdmin only)
// ============================================================================
router.post('/plans', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const {
      slug, name, description,
      priceMonthly, priceQuarterly, priceSemiannual, priceAnnual,
      maxWhatsappInstances, maxMessagesPerMonth, maxUsers,
      maxAiTokensPerMonth, maxActiveAutomations, maxStorageBytes,
      hasAi, hasAutomations, hasCalendarSync, hasPrioritySupport,
      isPublic, sortOrder,
    } = req.body;

    // Validate input
    if (!slug || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Slug e nome são obrigatórios',
        },
      });
    }

    // Check if slug exists
    const existingPlan = await prisma.billingPlan.findUnique({
      where: { slug },
    });

    if (existingPlan) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'SLUG_EXISTS',
          message: 'Este slug já está em uso',
        },
      });
    }

    const plan = await prisma.billingPlan.create({
      data: {
        id: uuidv4(),
        slug,
        name,
        description: description || null,
        priceMonthly: priceMonthly || 0,
        priceQuarterly: priceQuarterly || 0,
        priceSemiannual: priceSemiannual || 0,
        priceAnnual: priceAnnual || 0,
        maxWhatsappInstances: maxWhatsappInstances || 1,
        maxMessagesPerMonth: maxMessagesPerMonth || 500,
        maxUsers: maxUsers || 2,
        maxAiTokensPerMonth: maxAiTokensPerMonth || 10000,
        maxActiveAutomations: maxActiveAutomations || 0,
        maxStorageBytes: BigInt(maxStorageBytes || 524288000),
        hasAi: hasAi || false,
        hasAutomations: hasAutomations || false,
        hasCalendarSync: hasCalendarSync || false,
        hasPrioritySupport: hasPrioritySupport || false,
        isPublic: isPublic !== false,
        sortOrder: sortOrder || 0,
      },
    });

    // Invalidate cache
    await invalidatePlansCache();

    return res.status(201).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    console.error('Create plan error:', error);
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
// GET /api/billing/subscription - Get current subscription
// ============================================================================
router.get('/subscription', authenticate, requirePermission('billing:view'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    
    if (!user.tenantId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_TENANT',
          message: 'Usuário não está associado a um tenant',
        },
      });
    }

    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      include: {
        plan: true,
        subscriptions: {
          where: { status: { in: ['active', 'trialing', 'past_due'] } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            users: true,
            whatsappInstances: true,
            messages: true,
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

    const subscription = tenant.subscriptions[0];
    const plan = tenant.plan;

    return res.json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          name: tenant.name,
          status: tenant.status,
          trialEndsAt: tenant.trialEndsAt?.toISOString() || null,
        },
        plan: plan ? {
          id: plan.id,
          slug: plan.slug,
          name: plan.name,
          priceMonthly: plan.priceMonthly,
        } : null,
        subscription: subscription ? {
          id: subscription.id,
          status: subscription.status,
          billingCycle: subscription.billingCycle,
          currentPeriodStart: subscription.currentPeriodStart.toISOString(),
          currentPeriodEnd: subscription.currentPeriodEnd.toISOString(),
          discountPercent: subscription.discountPercent,
        } : null,
        usage: {
          users: {
            used: tenant._count.users,
            limit: plan?.maxUsers || 2,
          },
          instances: {
            used: tenant._count.whatsappInstances,
            limit: plan?.maxWhatsappInstances || 1,
          },
          messages: {
            used: tenant._count.messages,
            limit: plan?.maxMessagesPerMonth || 500,
          },
        },
      },
    });
  } catch (error) {
    console.error('Get subscription error:', error);
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
// POST /api/billing/checkout - Create checkout session
// ============================================================================
router.post('/checkout', authenticate, requirePermission('billing:manage_plan'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { planId, cycle, paymentMethod, successUrl, cancelUrl, couponCode } = req.body;

    if (!user.tenantId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_TENANT',
          message: 'Usuário não está associado a um tenant',
        },
      });
    }

    // Validate input
    if (!planId || !cycle || !paymentMethod) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Plano, ciclo e método de pagamento são obrigatórios',
        },
      });
    }

    // Get plan
    const plan = await prisma.billingPlan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PLAN_NOT_FOUND',
          message: 'Plano não encontrado ou inativo',
        },
      });
    }

    // Calculate price based on cycle
    let price = plan.priceMonthly;
    let months = 1;
    switch (cycle) {
      case 'quarterly':
        price = plan.priceQuarterly;
        months = 3;
        break;
      case 'semiannual':
        price = plan.priceSemiannual;
        months = 6;
        break;
      case 'annual':
        price = plan.priceAnnual;
        months = 12;
        break;
    }

    // Apply coupon if provided
    let discount = 0;
    let coupon = null;
    if (couponCode) {
      coupon = await prisma.discountCoupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });

      if (coupon && coupon.isActive) {
        const now = new Date();
        const isValid = (!coupon.validFrom || coupon.validFrom <= now) &&
                       (!coupon.validUntil || coupon.validUntil >= now) &&
                       (!coupon.maxUses || coupon.usedCount < coupon.maxUses);

        if (isValid) {
          if (coupon.discountType === 'percent') {
            discount = Math.floor(price * coupon.discountValue / 100);
          } else {
            discount = coupon.discountValue;
          }
        }
      }
    }

    const total = Math.max(0, price - discount);

    // For now, return a mock checkout response
    // In production, integrate with Stripe/Asaas
    const checkoutId = uuidv4();

    return res.json({
      success: true,
      data: {
        checkoutId,
        provider: paymentMethod === 'credit_card' ? 'stripe' : 'asaas',
        plan: {
          id: plan.id,
          name: plan.name,
          price,
        },
        cycle,
        months,
        discount,
        couponApplied: coupon ? coupon.code : null,
        total,
        // Mock checkout URL - in production, this would be Stripe/Asaas URL
        checkoutUrl: `${successUrl}?checkout=${checkoutId}&status=success`,
      },
    });
  } catch (error) {
    console.error('Create checkout error:', error);
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
// GET /api/billing/invoices - List invoices
// ============================================================================
router.get('/invoices', authenticate, requirePermission('billing:view_invoices'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { page = 1, limit = 20, status, tenantId } = req.query;
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

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: true,
          items: true,
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: invoices.map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoiceNumber,
          tenantId: inv.tenantId,
          tenantName: inv.tenant.name,
          status: inv.status,
          subtotal: inv.subtotal,
          discount: inv.discount,
          tax: inv.tax,
          total: inv.total,
          currency: inv.currency,
          dueDate: inv.dueDate.toISOString(),
          paidAt: inv.paidAt?.toISOString() || null,
          paymentMethod: inv.paymentMethod,
          items: inv.items,
          createdAt: inv.createdAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + invoices.length < total,
      },
    });
  } catch (error) {
    console.error('List invoices error:', error);
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
// GET /api/billing/modules - List available modules
// ============================================================================
router.get('/modules', async (req: Request, res: Response) => {
  try {
    const modules = await prisma.billingModule.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return res.json({
      success: true,
      data: modules.map(m => ({
        id: m.id,
        slug: m.slug,
        name: m.name,
        description: m.description,
        price: m.price,
        isRecurring: m.isRecurring,
        isPerUnit: m.isPerUnit,
        category: m.category,
        iconName: m.iconName,
        dependsOn: m.dependsOn,
      })),
    });
  } catch (error) {
    console.error('List modules error:', error);
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
// GET /api/billing/coupons - List coupons (SuperAdmin only)
// ============================================================================
router.get('/coupons', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, active } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const [coupons, total] = await Promise.all([
      prisma.discountCoupon.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.discountCoupon.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: coupons,
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + coupons.length < total,
      },
    });
  } catch (error) {
    console.error('List coupons error:', error);
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
// POST /api/billing/coupons/validate - Validate coupon code
// ============================================================================
router.post('/coupons/validate', authenticate, async (req: Request, res: Response) => {
  try {
    const { code, planId } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Código do cupom é obrigatório',
        },
      });
    }

    const coupon = await prisma.discountCoupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'COUPON_NOT_FOUND',
          message: 'Cupom não encontrado',
        },
      });
    }

    const now = new Date();
    const isValid = coupon.isActive &&
                   (!coupon.validFrom || coupon.validFrom <= now) &&
                   (!coupon.validUntil || coupon.validUntil >= now) &&
                   (!coupon.maxUses || coupon.usedCount < coupon.maxUses) &&
                   (!coupon.applicablePlans.length || !planId || coupon.applicablePlans.includes(planId));

    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_COUPON',
          message: 'Cupom inválido ou expirado',
        },
      });
    }

    return res.json({
      success: true,
      data: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
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
