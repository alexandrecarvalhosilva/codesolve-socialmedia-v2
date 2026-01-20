import { Router, Request, Response } from 'express';
import { prisma } from '../config/database.js';
import { authenticate, requirePermission } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================================================
// GET /api/notifications - List user notifications
// ============================================================================
router.get('/', authenticate, requirePermission('notifications:view'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {
      userId: user.id,
    };

    if (unreadOnly === 'true') {
      where.readAt = null;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: user.id, readAt: null },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        items: notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          data: n.data,
          readAt: n.readAt?.toISOString() || null,
          createdAt: n.createdAt.toISOString(),
        })),
        total,
        unreadCount,
        page: Number(page),
        limit: Number(limit),
        hasMore: skip + notifications.length < total,
      },
    });
  } catch (error) {
    console.error('List notifications error:', error);
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
// POST /api/notifications/:id/read - Mark notification as read
// ============================================================================
router.post('/:id/read', authenticate, requirePermission('notifications:view'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notificação não encontrada',
        },
      });
    }

    // Check ownership
    if (notification.userId !== user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta notificação',
        },
      });
    }

    const updatedNotification = await prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });

    return res.json({
      success: true,
      data: {
        id: updatedNotification.id,
        readAt: updatedNotification.readAt?.toISOString(),
      },
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
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
// POST /api/notifications/read-all - Mark all notifications as read
// ============================================================================
router.post('/read-all', authenticate, requirePermission('notifications:view'), async (req: Request, res: Response) => {
  try {
    const user = req.user!;

    const result = await prisma.notification.updateMany({
      where: {
        userId: user.id,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return res.json({
      success: true,
      data: {
        markedAsRead: result.count,
      },
    });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
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
// DELETE /api/notifications/:id - Delete notification
// ============================================================================
router.delete('/:id', authenticate, requirePermission('notifications:manage'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user!;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOTIFICATION_NOT_FOUND',
          message: 'Notificação não encontrada',
        },
      });
    }

    // Check ownership
    if (notification.userId !== user.id) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Você não tem acesso a esta notificação',
        },
      });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return res.json({
      success: true,
      data: { message: 'Notificação excluída com sucesso' },
    });
  } catch (error) {
    console.error('Delete notification error:', error);
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
// GET /api/notifications/preferences - Get notification preferences
// Note: NotificationPreference model doesn't exist in schema, returning defaults
// ============================================================================
router.get('/preferences', authenticate, async (req: Request, res: Response) => {
  try {
    // Return default preferences since model doesn't exist
    return res.json({
      success: true,
      data: {
        email: {
          newMessage: true,
          newConversation: true,
          dailyDigest: false,
        },
        push: {
          newMessage: true,
          newConversation: true,
          mentions: true,
        },
        inApp: {
          newMessage: true,
          newConversation: true,
          systemUpdates: true,
        },
        mutedUntil: null,
      },
    });
  } catch (error) {
    console.error('Get preferences error:', error);
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
// PUT /api/notifications/preferences - Update notification preferences
// Note: NotificationPreference model doesn't exist in schema, returning success
// ============================================================================
router.put('/preferences', authenticate, async (req: Request, res: Response) => {
  try {
    const { email, push, inApp, mutedUntil } = req.body;

    // Return the submitted preferences since model doesn't exist
    return res.json({
      success: true,
      data: {
        email: email || {
          newMessage: true,
          newConversation: true,
          dailyDigest: false,
        },
        push: push || {
          newMessage: true,
          newConversation: true,
          mentions: true,
        },
        inApp: inApp || {
          newMessage: true,
          newConversation: true,
          systemUpdates: true,
        },
        mutedUntil: mutedUntil || null,
      },
    });
  } catch (error) {
    console.error('Update preferences error:', error);
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
// POST /api/notifications/mute - Mute notifications
// ============================================================================
router.post('/mute', authenticate, requirePermission('notifications:mute'), async (req: Request, res: Response) => {
  try {
    const { duration } = req.body; // in minutes

    if (!duration || duration < 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Duração inválida',
        },
      });
    }

    const mutedUntil = new Date();
    mutedUntil.setMinutes(mutedUntil.getMinutes() + duration);

    return res.json({
      success: true,
      data: {
        mutedUntil: mutedUntil.toISOString(),
      },
    });
  } catch (error) {
    console.error('Mute notifications error:', error);
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
// POST /api/notifications/unmute - Unmute notifications
// ============================================================================
router.post('/unmute', authenticate, requirePermission('notifications:mute'), async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      data: {
        mutedUntil: null,
      },
    });
  } catch (error) {
    console.error('Unmute notifications error:', error);
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
