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
// GET /api/billing/plans/all - List all plans including inactive (SuperAdmin)
// ============================================================================
router.get('/plans/all', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const plans = await prisma.billingPlan.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        planModules: {
          include: { module: true },
        },
        _count: {
          select: { tenants: true, subscriptions: true },
        },
      },
    });

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
        isActive: p.isActive,
        isPublic: p.isPublic,
        sortOrder: p.sortOrder,
        modules: p.planModules.map(pm => pm.module),
        tenantsCount: p._count.tenants,
        subscriptionsCount: p._count.subscriptions,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('List all plans error:', error);
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
// PUT /api/billing/plans/:id - Update plan (SuperAdmin only)
// ============================================================================
router.put('/plans/:id', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name, description,
      priceMonthly, priceQuarterly, priceSemiannual, priceAnnual,
      maxWhatsappInstances, maxMessagesPerMonth, maxUsers,
      maxAiTokensPerMonth, maxActiveAutomations, maxStorageBytes,
      hasAi, hasAutomations, hasCalendarSync, hasPrioritySupport,
      isActive, isPublic, sortOrder,
    } = req.body;

    const plan = await prisma.billingPlan.findUnique({
      where: { id },
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

    const updatedPlan = await prisma.billingPlan.update({
      where: { id },
      data: {
        name: name ?? plan.name,
        description: description ?? plan.description,
        priceMonthly: priceMonthly ?? plan.priceMonthly,
        priceQuarterly: priceQuarterly ?? plan.priceQuarterly,
        priceSemiannual: priceSemiannual ?? plan.priceSemiannual,
        priceAnnual: priceAnnual ?? plan.priceAnnual,
        maxWhatsappInstances: maxWhatsappInstances ?? plan.maxWhatsappInstances,
        maxMessagesPerMonth: maxMessagesPerMonth ?? plan.maxMessagesPerMonth,
        maxUsers: maxUsers ?? plan.maxUsers,
        maxAiTokensPerMonth: maxAiTokensPerMonth ?? plan.maxAiTokensPerMonth,
        maxActiveAutomations: maxActiveAutomations ?? plan.maxActiveAutomations,
        maxStorageBytes: maxStorageBytes ? BigInt(maxStorageBytes) : plan.maxStorageBytes,
        hasAi: hasAi ?? plan.hasAi,
        hasAutomations: hasAutomations ?? plan.hasAutomations,
        hasCalendarSync: hasCalendarSync ?? plan.hasCalendarSync,
        hasPrioritySupport: hasPrioritySupport ?? plan.hasPrioritySupport,
        isActive: isActive ?? plan.isActive,
        isPublic: isPublic ?? plan.isPublic,
        sortOrder: sortOrder ?? plan.sortOrder,
      },
    });

    // Invalidate cache
    await invalidatePlansCache();

    return res.json({
      success: true,
      data: updatedPlan,
    });
  } catch (error) {
    console.error('Update plan error:', error);
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
// GET /api/billing/subscriptions - List all subscriptions (SuperAdmin)
// ============================================================================
router.get('/subscriptions', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, planId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (planId) {
      where.planId = planId;
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          tenant: {
            select: { id: true, name: true, slug: true, status: true },
          },
          plan: {
            select: { id: true, name: true, slug: true, priceMonthly: true },
          },
        },
      }),
      prisma.subscription.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        items: subscriptions.map(sub => ({
          id: sub.id,
          tenantId: sub.tenantId,
          tenantName: sub.tenant.name,
          tenantSlug: sub.tenant.slug,
          tenantStatus: sub.tenant.status,
          planId: sub.planId,
          planName: sub.plan.name,
          planSlug: sub.plan.slug,
          status: sub.status,
          billingCycle: sub.billingCycle,
          currentPeriodStart: sub.currentPeriodStart.toISOString(),
          currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
          discountPercent: sub.discountPercent,
          discountReason: sub.discountReason,
          canceledAt: sub.canceledAt?.toISOString() || null,
          cancelReason: sub.cancelReason,
          createdAt: sub.createdAt.toISOString(),
        })),
        total,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + subscriptions.length < total,
      },
    });
  } catch (error) {
    console.error('List subscriptions error:', error);
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
// GET /api/billing/modules/all - List all modules including inactive (SuperAdmin)
// ============================================================================
router.get('/modules/all', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const modules = await prisma.billingModule.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { tenantModules: true, planModules: true },
        },
      },
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
        isActive: m.isActive,
        sortOrder: m.sortOrder,
        tenantsCount: m._count.tenantModules,
        plansCount: m._count.planModules,
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('List all modules error:', error);
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
// POST /api/billing/modules - Create module (SuperAdmin only)
// ============================================================================
router.post('/modules', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { slug, name, description, price, isRecurring, isPerUnit, category, iconName, dependsOn, sortOrder } = req.body;

    if (!slug || !name || !category) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Slug, nome e categoria são obrigatórios',
        },
      });
    }

    const existingModule = await prisma.billingModule.findUnique({
      where: { slug },
    });

    if (existingModule) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'SLUG_EXISTS',
          message: 'Este slug já está em uso',
        },
      });
    }

    const module = await prisma.billingModule.create({
      data: {
        id: uuidv4(),
        slug,
        name,
        description: description || null,
        price: price || 0,
        isRecurring: isRecurring !== false,
        isPerUnit: isPerUnit || false,
        category,
        iconName: iconName || null,
        dependsOn: dependsOn || null,
        sortOrder: sortOrder || 0,
      },
    });

    return res.status(201).json({
      success: true,
      data: module,
    });
  } catch (error) {
    console.error('Create module error:', error);
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
// PUT /api/billing/modules/:id - Update module (SuperAdmin only)
// ============================================================================
router.put('/modules/:id', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, price, isRecurring, isPerUnit, category, iconName, dependsOn, isActive, sortOrder } = req.body;

    const module = await prisma.billingModule.findUnique({
      where: { id },
    });

    if (!module) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'MODULE_NOT_FOUND',
          message: 'Módulo não encontrado',
        },
      });
    }

    const updatedModule = await prisma.billingModule.update({
      where: { id },
      data: {
        name: name ?? module.name,
        description: description ?? module.description,
        price: price ?? module.price,
        isRecurring: isRecurring ?? module.isRecurring,
        isPerUnit: isPerUnit ?? module.isPerUnit,
        category: category ?? module.category,
        iconName: iconName ?? module.iconName,
        dependsOn: dependsOn ?? module.dependsOn,
        isActive: isActive ?? module.isActive,
        sortOrder: sortOrder ?? module.sortOrder,
      },
    });

    return res.json({
      success: true,
      data: updatedModule,
    });
  } catch (error) {
    console.error('Update module error:', error);
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
        items: coupons.map(c => ({
          id: c.id,
          code: c.code,
          description: c.description,
          discountType: c.discountType,
          discountValue: c.discountValue,
          maxUses: c.maxUses,
          usedCount: c.usedCount,
          validFrom: c.validFrom?.toISOString() || null,
          validUntil: c.validUntil?.toISOString() || null,
          applicablePlans: c.applicablePlans,
          isActive: c.isActive,
          createdAt: c.createdAt.toISOString(),
        })),
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
// POST /api/billing/coupons - Create coupon (SuperAdmin only)
// ============================================================================
router.post('/coupons', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { code, description, discountType, discountValue, maxUses, validFrom, validUntil, applicablePlans } = req.body;

    if (!code || !discountType || discountValue === undefined) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Código, tipo de desconto e valor são obrigatórios',
        },
      });
    }

    const existingCoupon = await prisma.discountCoupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CODE_EXISTS',
          message: 'Este código já está em uso',
        },
      });
    }

    const coupon = await prisma.discountCoupon.create({
      data: {
        id: uuidv4(),
        code: code.toUpperCase(),
        description: description || null,
        discountType,
        discountValue,
        maxUses: maxUses || null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        applicablePlans: applicablePlans || [],
      },
    });

    return res.status(201).json({
      success: true,
      data: coupon,
    });
  } catch (error) {
    console.error('Create coupon error:', error);
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
// PUT /api/billing/coupons/:id - Update coupon (SuperAdmin only)
// ============================================================================
router.put('/coupons/:id', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { description, discountType, discountValue, maxUses, validFrom, validUntil, applicablePlans, isActive } = req.body;

    const coupon = await prisma.discountCoupon.findUnique({
      where: { id },
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

    const updatedCoupon = await prisma.discountCoupon.update({
      where: { id },
      data: {
        description: description ?? coupon.description,
        discountType: discountType ?? coupon.discountType,
        discountValue: discountValue ?? coupon.discountValue,
        maxUses: maxUses ?? coupon.maxUses,
        validFrom: validFrom ? new Date(validFrom) : coupon.validFrom,
        validUntil: validUntil ? new Date(validUntil) : coupon.validUntil,
        applicablePlans: applicablePlans ?? coupon.applicablePlans,
        isActive: isActive ?? coupon.isActive,
      },
    });

    return res.json({
      success: true,
      data: updatedCoupon,
    });
  } catch (error) {
    console.error('Update coupon error:', error);
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
// DELETE /api/billing/coupons/:id - Delete coupon (SuperAdmin only)
// ============================================================================
router.delete('/coupons/:id', authenticate, requireSuperAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const coupon = await prisma.discountCoupon.findUnique({
      where: { id },
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

    await prisma.discountCoupon.delete({
      where: { id },
    });

    return res.json({
      success: true,
      data: { message: 'Cupom removido com sucesso' },
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
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

// ============================================================================
// GET /api/billing/payment-methods - List payment methods for tenant
// ============================================================================
router.get('/payment-methods', authenticate, requirePermission('billing:view'), async (req: Request, res: Response) => {
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

    // For now, return mock payment methods
    // In production, integrate with Stripe/Asaas to get real payment methods
    const paymentMethods = [
      {
        id: 'pm_mock_1',
        type: 'credit_card',
        brand: 'visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2027,
        isDefault: true,
      },
    ];

    return res.json({
      success: true,
      data: paymentMethods,
    });
  } catch (error) {
    console.error('List payment methods error:', error);
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
// POST /api/billing/payment-methods - Add payment method
// ============================================================================
router.post('/payment-methods', authenticate, requirePermission('billing:manage_plan'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { type, token, setAsDefault } = req.body;

    if (!user.tenantId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_TENANT',
          message: 'Usuário não está associado a um tenant',
        },
      });
    }

    if (!type || !token) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Tipo e token são obrigatórios',
        },
      });
    }

    // For now, return mock response
    // In production, integrate with Stripe/Asaas
    const paymentMethod = {
      id: `pm_${uuidv4().substring(0, 8)}`,
      type,
      brand: 'visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2027,
      isDefault: setAsDefault || false,
    };

    return res.status(201).json({
      success: true,
      data: paymentMethod,
    });
  } catch (error) {
    console.error('Add payment method error:', error);
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
// DELETE /api/billing/payment-methods/:id - Remove payment method
// ============================================================================
router.delete('/payment-methods/:id', authenticate, requirePermission('billing:manage_plan'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { id } = req.params;

    if (!user.tenantId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_TENANT',
          message: 'Usuário não está associado a um tenant',
        },
      });
    }

    // For now, return mock response
    // In production, integrate with Stripe/Asaas

    return res.json({
      success: true,
      data: { message: 'Método de pagamento removido com sucesso' },
    });
  } catch (error) {
    console.error('Remove payment method error:', error);
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
