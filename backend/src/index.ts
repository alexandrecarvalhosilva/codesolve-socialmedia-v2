import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { env, validateEnv } from './config/env.js';
import { testDatabaseConnection, disconnectDatabase } from './config/database.js';
import { testRedisConnection, disconnectRedis } from './config/redis.js';
import { apiRateLimit } from './middleware/rateLimit.js';
import { setIO } from './config/socket.js';

// Import routes
import authRoutes from './routes/auth.js';
import tenantsRoutes from './routes/tenants.js';
import usersRoutes from './routes/users.js';
import billingRoutes from './routes/billing.js';
import chatRoutes from './routes/chat.js';
import whatsappRoutes from './routes/whatsapp.js';
import automationsRoutes from './routes/automations.js';
import reportsRoutes from './routes/reports.js';
import logsRoutes from './routes/logs.js';
import notificationsRoutes from './routes/notifications.js';
import supportRoutes from './routes/support.js';
import healthRoutes from './routes/health.js';
import webhookRoutes from './routes/webhook.js';
import contactsRoutes from './routes/contacts.js';
import aiRoutes from './routes/ai.js';
import templatesRoutes from './routes/templates.js';

// Validate environment
validateEnv();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Create Socket.IO server
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Set IO for use in other modules
setIO(io);

// ============================================================================
// MIDDLEWARE
// ============================================================================

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Request logging (development)
if (env.NODE_ENV === 'development') {
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
  });
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check (no rate limit)
app.use('/api/health', healthRoutes);

// Webhook routes (no rate limit, no auth - receives events from Evolution API)
app.use('/api/webhook', webhookRoutes);

// Apply rate limiting to API routes
app.use('/api', apiRateLimit);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/automations', automationsRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/templates', templatesRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      name: 'CodeSolve Social Media API',
      version: '1.0.0',
      status: 'running',
    },
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint ${req.method} ${req.path} não encontrado`,
    },
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor',
    },
  });
});

// ============================================================================
// SOCKET.IO
// ============================================================================

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Join tenant room
  socket.on('join:tenant', (tenantId: string) => {
    socket.join(`tenant:${tenantId}`);
    console.log(`Socket ${socket.id} joined tenant:${tenantId}`);
  });

  // Join user room
  socket.on('join:user', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`Socket ${socket.id} joined user:${userId}`);
  });

  // Join conversation room
  socket.on('join:conversation', (conversationId: string) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`Socket ${socket.id} joined conversation:${conversationId}`);
  });

  // Leave conversation room
  socket.on('leave:conversation', (conversationId: string) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`Socket ${socket.id} left conversation:${conversationId}`);
  });

  // Typing indicator
  socket.on('typing:start', (data: { conversationId: string; userId: string; userName: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:start', {
      userId: data.userId,
      userName: data.userName,
    });
  });

  socket.on('typing:stop', (data: { conversationId: string; userId: string }) => {
    socket.to(`conversation:${data.conversationId}`).emit('typing:stop', {
      userId: data.userId,
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Export io for use in other modules
export { io };

// ============================================================================
// SERVER STARTUP
// ============================================================================

async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    if (!dbConnected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    // Test Redis connection
    const redisConnected = await testRedisConnection();
    if (!redisConnected) {
      console.warn('Failed to connect to Redis - some features may be limited');
    }

    // Start HTTP server
    httpServer.listen(env.PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🚀 CodeSolve Social Media API                               ║
║                                                                ║
║   Server running on port ${env.PORT}                              ║
║   Environment: ${env.NODE_ENV.padEnd(15)}                        ║
║   CORS Origin: ${env.CORS_ORIGIN.substring(0, 30).padEnd(30)}    ║
║                                                                ║
║   Endpoints:                                                   ║
║   - Health: GET /api/health                                    ║
║   - Auth: POST /api/auth/login                                 ║
║   - Webhook: POST /api/webhook/evolution                       ║
║   - API Docs: Coming soon...                                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
      `);
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
async function shutdown() {
  console.log('\nShutting down gracefully...');
  
  try {
    await disconnectDatabase();
    await disconnectRedis();
    
    httpServer.close(() => {
      console.log('Server closed');
      process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

// Start the server
startServer();
