import { Request, Response, NextFunction } from 'express';
import { checkRateLimit } from '../config/redis.js';

interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
  message?: string;
}

const defaultConfig: RateLimitConfig = {
  windowSeconds: 60,
  maxRequests: 300, // Q3: 300 req/min per tenant
  message: 'Muitas requisições. Tente novamente em alguns minutos.',
};

// ============================================================================
// RATE LIMIT MIDDLEWARE
// ============================================================================

export function rateLimit(config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Generate rate limit key
      const key = finalConfig.keyGenerator 
        ? finalConfig.keyGenerator(req)
        : generateDefaultKey(req);

      const result = await checkRateLimit(
        `ratelimit:${key}`,
        finalConfig.maxRequests,
        finalConfig.windowSeconds
      );

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', finalConfig.maxRequests);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetAt / 1000));

      if (!result.allowed) {
        res.status(429).json({
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: finalConfig.message,
            retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
          },
        });
        return;
      }

      next();
    } catch (error) {
      // If Redis is down, allow the request but log the error
      console.error('Rate limit check failed:', error);
      next();
    }
  };
}

function generateDefaultKey(req: Request): string {
  // Use tenant ID if available, otherwise use IP
  const tenantId = (req as any).user?.tenantId;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const endpoint = `${req.method}:${req.path}`;
  
  if (tenantId) {
    return `tenant:${tenantId}:${endpoint}`;
  }
  
  return `ip:${ip}:${endpoint}`;
}

// ============================================================================
// PRE-CONFIGURED RATE LIMITERS
// ============================================================================

// API rate limit: 300 req/min per tenant (Q3)
export const apiRateLimit = rateLimit({
  windowSeconds: 60,
  maxRequests: 300,
  keyGenerator: (req) => {
    const tenantId = (req as any).user?.tenantId || 'anonymous';
    return `api:${tenantId}`;
  },
});

// Auth rate limit: 10 attempts per 15 minutes per IP
export const authRateLimit = rateLimit({
  windowSeconds: 900, // 15 minutes
  maxRequests: 10,
  keyGenerator: (req) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    return `auth:${ip}`;
  },
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
});

// Webhook rate limit: 1000 req/min (for Evolution, Stripe, etc.)
export const webhookRateLimit = rateLimit({
  windowSeconds: 60,
  maxRequests: 1000,
  keyGenerator: (req) => {
    const provider = req.params.provider || 'unknown';
    return `webhook:${provider}`;
  },
});

// Heavy operations rate limit: 10 req/min per tenant
export const heavyOperationRateLimit = rateLimit({
  windowSeconds: 60,
  maxRequests: 10,
  keyGenerator: (req) => {
    const tenantId = (req as any).user?.tenantId || 'anonymous';
    return `heavy:${tenantId}`;
  },
  message: 'Operação limitada. Aguarde um momento antes de tentar novamente.',
});

// Report generation rate limit: 5 req/hour per tenant
export const reportRateLimit = rateLimit({
  windowSeconds: 3600, // 1 hour
  maxRequests: 5,
  keyGenerator: (req) => {
    const tenantId = (req as any).user?.tenantId || 'anonymous';
    return `report:${tenantId}`;
  },
  message: 'Limite de geração de relatórios atingido. Tente novamente em 1 hora.',
});
