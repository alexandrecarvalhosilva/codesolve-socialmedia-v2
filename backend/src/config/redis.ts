import Redis from 'ioredis';

// Redis client singleton
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
          return true;
        }
        return false;
      },
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected');
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });

    redisClient.on('close', () => {
      console.log('Redis connection closed');
    });
  }

  return redisClient;
}

// Test Redis connection
export async function testRedisConnection(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    console.log('✅ Redis connection successful');
    return true;
  } catch (error) {
    console.error('❌ Redis connection failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis disconnected');
  }
}

// ============================================================================
// REDIS HELPERS
// ============================================================================

// Session management
export async function setSession(userId: string, token: string, expiresInSeconds: number): Promise<void> {
  const client = getRedisClient();
  await client.setex(`session:${userId}:${token}`, expiresInSeconds, JSON.stringify({ userId, token }));
}

export async function getSession(userId: string, token: string): Promise<any | null> {
  const client = getRedisClient();
  const data = await client.get(`session:${userId}:${token}`);
  return data ? JSON.parse(data) : null;
}

export async function deleteSession(userId: string, token: string): Promise<void> {
  const client = getRedisClient();
  await client.del(`session:${userId}:${token}`);
}

// Tenant cache
export async function cacheTenant(tenantId: string, data: any, ttlSeconds: number = 300): Promise<void> {
  const client = getRedisClient();
  await client.setex(`tenant:${tenantId}`, ttlSeconds, JSON.stringify(data));
}

export async function getCachedTenant(tenantId: string): Promise<any | null> {
  const client = getRedisClient();
  const data = await client.get(`tenant:${tenantId}`);
  return data ? JSON.parse(data) : null;
}

export async function invalidateTenantCache(tenantId: string): Promise<void> {
  const client = getRedisClient();
  await client.del(`tenant:${tenantId}`);
}

// User permissions cache
export async function cacheUserPermissions(userId: string, permissions: string[], ttlSeconds: number = 3600): Promise<void> {
  const client = getRedisClient();
  await client.setex(`permissions:${userId}`, ttlSeconds, JSON.stringify(permissions));
}

export async function getCachedUserPermissions(userId: string): Promise<string[] | null> {
  const client = getRedisClient();
  const data = await client.get(`permissions:${userId}`);
  return data ? JSON.parse(data) : null;
}

export async function invalidateUserPermissionsCache(userId: string): Promise<void> {
  const client = getRedisClient();
  await client.del(`permissions:${userId}`);
}

// Rate limiting
export async function checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const client = getRedisClient();
  const now = Date.now();
  const windowStart = now - (windowSeconds * 1000);
  
  // Remove old entries
  await client.zremrangebyscore(key, 0, windowStart);
  
  // Count current entries
  const count = await client.zcard(key);
  
  if (count >= limit) {
    const oldestEntry = await client.zrange(key, 0, 0, 'WITHSCORES');
    const resetAt = oldestEntry.length > 1 ? parseInt(oldestEntry[1]) + (windowSeconds * 1000) : now + (windowSeconds * 1000);
    return { allowed: false, remaining: 0, resetAt };
  }
  
  // Add new entry
  await client.zadd(key, now, `${now}`);
  await client.expire(key, windowSeconds);
  
  return { allowed: true, remaining: limit - count - 1, resetAt: now + (windowSeconds * 1000) };
}

// Usage counters
export async function incrementUsageCounter(tenantId: string, metric: string, period: string, amount: number = 1): Promise<number> {
  const client = getRedisClient();
  const key = `usage:${tenantId}:${metric}:${period}`;
  const newValue = await client.incrby(key, amount);
  
  // Set expiry for 35 days (to cover monthly period + buffer)
  await client.expire(key, 35 * 24 * 60 * 60);
  
  return newValue;
}

export async function getUsageCounter(tenantId: string, metric: string, period: string): Promise<number> {
  const client = getRedisClient();
  const key = `usage:${tenantId}:${metric}:${period}`;
  const value = await client.get(key);
  return value ? parseInt(value) : 0;
}

// QR Code cache (WhatsApp)
export async function cacheQRCode(instanceId: string, qrCode: string, ttlSeconds: number = 60): Promise<void> {
  const client = getRedisClient();
  await client.setex(`qrcode:${instanceId}`, ttlSeconds, qrCode);
}

export async function getCachedQRCode(instanceId: string): Promise<string | null> {
  const client = getRedisClient();
  return await client.get(`qrcode:${instanceId}`);
}

// Plans cache
export async function cachePlans(plans: any[], ttlSeconds: number = 3600): Promise<void> {
  const client = getRedisClient();
  // Convert BigInt to string for JSON serialization
  const serializable = plans.map(p => ({
    ...p,
    maxStorageBytes: p.maxStorageBytes?.toString() || '0',
  }));
  await client.setex('plans:all', ttlSeconds, JSON.stringify(serializable));
}

export async function getCachedPlans(): Promise<any[] | null> {
  const client = getRedisClient();
  const data = await client.get('plans:all');
  return data ? JSON.parse(data) : null;
}

export async function invalidatePlansCache(): Promise<void> {
  const client = getRedisClient();
  await client.del('plans:all');
}

// Distributed locks
export async function acquireLock(resource: string, ttlSeconds: number = 30): Promise<boolean> {
  const client = getRedisClient();
  const key = `lock:${resource}`;
  const result = await client.set(key, '1', 'EX', ttlSeconds, 'NX');
  return result === 'OK';
}

export async function releaseLock(resource: string): Promise<void> {
  const client = getRedisClient();
  await client.del(`lock:${resource}`);
}
