import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const env = {
  // Server
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || '',
  
  // Redis
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'default_secret_change_in_production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Evolution API (WhatsApp)
  EVOLUTION_API_URL: process.env.EVOLUTION_API_URL || process.env.EVOLUTION_BASE_URL || 'https://api.gandhivati.com.br',
  EVOLUTION_API_KEY: process.env.EVOLUTION_API_KEY || process.env.EVOLUTION_GLOBAL_API_KEY || '6f40d224053ebc24fbf8de801b3ab429',
  EVOLUTION_WEBHOOK_URL: process.env.EVOLUTION_WEBHOOK_URL || '',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  
  // Stripe
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET || '',
  
  // Asaas
  ASAAS_API_KEY: process.env.ASAAS_API_KEY || '',
  ASAAS_WEBHOOK_TOKEN: process.env.ASAAS_WEBHOOK_TOKEN || '',
  ASAAS_ENVIRONMENT: process.env.ASAAS_ENVIRONMENT || 'sandbox',
  
  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  
  // Encryption
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || '',
};

// Validate required environment variables
export function validateEnv(): void {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(', ')}`);
  }
}
