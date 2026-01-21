import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { hashPassword, verifyPassword, generateToken, getTokenExpiration, getUserPermissions } from '../utils/auth.js';
import { getClientIp } from '../utils/request.js';
import { authenticate } from '../middleware/auth.js';
import { authRateLimit } from '../middleware/rateLimit.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// POST /api/auth/login
// ============================================================================
router.post('/login', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email e senha são obrigatórios',
        },
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { tenant: true },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou senha incorretos',
        },
      });
    }

    // Check if user is active
    if (!user.isActive || user.deletedAt) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'USER_INACTIVE',
          message: 'Usuário inativo ou excluído',
        },
      });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email ou senha incorretos',
        },
      });
    }

    // Check tenant status (if user belongs to a tenant)
    if (user.tenant && user.tenant.status === 'suspended') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_SUSPENDED',
          message: 'Sua conta está suspensa. Entre em contato com o suporte.',
        },
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    const expiresAt = getTokenExpiration();

    // Create session
    await prisma.session.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        token,
        userAgent: req.headers['user-agent'] || null,
        ipAddress: getClientIp(req),
        expiresAt,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Check trial status
    const isTrial = user.tenant?.status === 'trial';
    const trialEndsAt = user.tenant?.trialEndsAt?.toISOString() || null;

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenantName: user.tenant?.name || null,
          avatar: user.avatar,
          isTrial,
          trialEndsAt,
          permissions: getUserPermissions(user.role),
        },
        token,
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Login error:', error);
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
// POST /api/auth/register
// ============================================================================
router.post('/register', authRateLimit, async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, company, niche } = req.body;

    // Validate input
    if (!name || !email || !password || !company) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Nome, email, senha e empresa são obrigatórios',
        },
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Este email já está cadastrado',
        },
      });
    }

    // Create tenant with trial
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14-day trial (Q9)

    const tenant = await prisma.tenant.create({
      data: {
        id: uuidv4(),
        name: company,
        slug: company.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'),
        status: 'trial',
        trialEndsAt,
        niche: niche || null,
      },
    });

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create admin user for the tenant
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email: email.toLowerCase().trim(),
        passwordHash,
        name,
        phone: phone || null,
        role: 'admin',
        tenantId: tenant.id,
        isActive: true,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    const expiresAt = getTokenExpiration();

    // Create session
    await prisma.session.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        token,
        userAgent: req.headers['user-agent'] || null,
        ipAddress: getClientIp(req),
        expiresAt,
      },
    });

    return res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenantId: user.tenantId,
          tenantName: tenant.name,
          avatar: null,
          isTrial: true,
          trialEndsAt: trialEndsAt.toISOString(),
          permissions: getUserPermissions(user.role),
        },
        token,
        expiresAt: expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Register error:', error);
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
// POST /api/auth/logout
// ============================================================================
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      // Delete session
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    return res.json({
      success: true,
      data: { message: 'Logout realizado com sucesso' },
    });
  } catch (error) {
    console.error('Logout error:', error);
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
// GET /api/auth/me
// ============================================================================
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    // Get fresh user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: { tenant: true },
    });

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado',
        },
      });
    }

    const isTrial = userData.tenant?.status === 'trial';
    const trialEndsAt = userData.tenant?.trialEndsAt?.toISOString() || null;

    return res.json({
      success: true,
      data: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        tenantId: userData.tenantId,
        tenantName: userData.tenant?.name || null,
        avatar: userData.avatar,
        phone: userData.phone,
        isTrial,
        trialEndsAt,
        permissions: getUserPermissions(userData.role),
        createdAt: userData.createdAt.toISOString(),
        lastLoginAt: userData.lastLoginAt?.toISOString() || null,
      },
    });
  } catch (error) {
    console.error('Get me error:', error);
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
// PUT /api/auth/profile
// ============================================================================
router.put('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { name, phone, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name || undefined,
        phone: phone || undefined,
        avatar: avatar || undefined,
      },
      include: { tenant: true },
    });

    return res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        tenantId: updatedUser.tenantId,
        tenantName: updatedUser.tenant?.name || null,
        avatar: updatedUser.avatar,
        phone: updatedUser.phone,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
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
// PUT /api/auth/password
// ============================================================================
router.put('/password', authenticate, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Senha atual e nova senha são obrigatórias',
        },
      });
    }

    // Get user with password
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!userData) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'Usuário não encontrado',
        },
      });
    }

    // Verify current password
    const isValidPassword = await verifyPassword(currentPassword, userData.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Senha atual incorreta',
        },
      });
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Invalidate all sessions except current
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const currentToken = authHeader.substring(7);
      await prisma.session.deleteMany({
        where: {
          userId: user.id,
          token: { not: currentToken },
        },
      });
    }

    return res.json({
      success: true,
      data: { message: 'Senha alterada com sucesso' },
    });
  } catch (error) {
    console.error('Change password error:', error);
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
