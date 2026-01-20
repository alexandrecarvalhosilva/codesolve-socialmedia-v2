import { Router, Request, Response } from 'express';
import { testDatabaseConnection } from '../config/database.js';
import { testRedisConnection } from '../config/redis.js';

const router = Router();

// ============================================================================
// GET /api/health - Basic health check
// ============================================================================
router.get('/', async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// ============================================================================
// GET /api/health/ready - Readiness check
// ============================================================================
router.get('/ready', async (req: Request, res: Response) => {
  try {
    const [dbOk, redisOk] = await Promise.all([
      testDatabaseConnection(),
      testRedisConnection(),
    ]);

    const isReady = dbOk && redisOk;

    return res.status(isReady ? 200 : 503).json({
      success: isReady,
      data: {
        status: isReady ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        services: {
          database: dbOk ? 'ok' : 'error',
          redis: redisOk ? 'ok' : 'error',
        },
      },
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      data: {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      },
    });
  }
});

// ============================================================================
// GET /api/health/live - Liveness check
// ============================================================================
router.get('/live', async (req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      status: 'alive',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;
