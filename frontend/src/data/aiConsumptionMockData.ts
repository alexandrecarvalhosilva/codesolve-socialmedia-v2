// Mock data for OpenAI consumption metrics

export interface TenantAIConsumption {
  tenantId: string;
  tenantName: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  estimatedCost: number;
  totalMessages: number;
  avgResponseTime: number; // ms
  model: string;
  lastActivity: string;
}

export interface AIConsumptionTrend {
  date: string;
  tokens: number;
  messages: number;
  cost: number;
}

export interface GlobalAIMetrics {
  totalTokensToday: number;
  totalTokensMonth: number;
  estimatedCostToday: number;
  estimatedCostMonth: number;
  totalMessagesToday: number;
  totalMessagesMonth: number;
  avgResponseTime: number;
  activeTenantsToday: number;
  topModel: string;
}

// Token pricing (per 1K tokens)
export const TOKEN_PRICING = {
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
};

// Mock tenant consumption data
export const tenantAIConsumption: TenantAIConsumption[] = [
  {
    tenantId: '1',
    tenantName: 'SIX BLADES - LAGO OESTE',
    totalTokens: 458750,
    promptTokens: 285000,
    completionTokens: 173750,
    estimatedCost: 15.45,
    totalMessages: 1250,
    avgResponseTime: 1200,
    model: 'gpt-4-turbo',
    lastActivity: '2026-01-19T14:32:00',
  },
  {
    tenantId: '2',
    tenantName: 'Academia Fitness Plus',
    totalTokens: 325000,
    promptTokens: 195000,
    completionTokens: 130000,
    estimatedCost: 10.85,
    totalMessages: 890,
    avgResponseTime: 980,
    model: 'gpt-4-turbo',
    lastActivity: '2026-01-19T13:45:00',
  },
  {
    tenantId: '3',
    tenantName: 'Clínica Odonto Sorriso',
    totalTokens: 275500,
    promptTokens: 165000,
    completionTokens: 110500,
    estimatedCost: 9.20,
    totalMessages: 720,
    avgResponseTime: 1100,
    model: 'gpt-3.5-turbo',
    lastActivity: '2026-01-19T12:15:00',
  },
  {
    tenantId: '4',
    tenantName: 'Restaurante Sabor & Arte',
    totalTokens: 198000,
    promptTokens: 118800,
    completionTokens: 79200,
    estimatedCost: 6.60,
    totalMessages: 540,
    avgResponseTime: 850,
    model: 'gpt-3.5-turbo',
    lastActivity: '2026-01-19T11:30:00',
  },
  {
    tenantId: '5',
    tenantName: 'Salão Beauty Hair',
    totalTokens: 156000,
    promptTokens: 93600,
    completionTokens: 62400,
    estimatedCost: 5.20,
    totalMessages: 425,
    avgResponseTime: 920,
    model: 'gpt-3.5-turbo',
    lastActivity: '2026-01-19T10:45:00',
  },
  {
    tenantId: '6',
    tenantName: 'Pet Shop Animal Care',
    totalTokens: 142500,
    promptTokens: 85500,
    completionTokens: 57000,
    estimatedCost: 4.75,
    totalMessages: 380,
    avgResponseTime: 1050,
    model: 'gpt-3.5-turbo',
    lastActivity: '2026-01-19T09:20:00',
  },
  {
    tenantId: '7',
    tenantName: 'Escola de Idiomas Global',
    totalTokens: 128000,
    promptTokens: 76800,
    completionTokens: 51200,
    estimatedCost: 4.25,
    totalMessages: 350,
    avgResponseTime: 1150,
    model: 'gpt-4-turbo',
    lastActivity: '2026-01-18T18:30:00',
  },
  {
    tenantId: '8',
    tenantName: 'Imobiliária Casa Nova',
    totalTokens: 98500,
    promptTokens: 59100,
    completionTokens: 39400,
    estimatedCost: 3.30,
    totalMessages: 265,
    avgResponseTime: 1300,
    model: 'gpt-3.5-turbo',
    lastActivity: '2026-01-18T16:45:00',
  },
];

// Calculate global metrics from tenant data
export const getGlobalAIMetrics = (): GlobalAIMetrics => {
  const totalTokensMonth = tenantAIConsumption.reduce((acc, t) => acc + t.totalTokens, 0);
  const totalMessagesMonth = tenantAIConsumption.reduce((acc, t) => acc + t.totalMessages, 0);
  const estimatedCostMonth = tenantAIConsumption.reduce((acc, t) => acc + t.estimatedCost, 0);
  const avgResponseTime = Math.round(
    tenantAIConsumption.reduce((acc, t) => acc + t.avgResponseTime, 0) / tenantAIConsumption.length
  );

  return {
    totalTokensToday: Math.round(totalTokensMonth * 0.08), // ~8% of monthly
    totalTokensMonth,
    estimatedCostToday: Number((estimatedCostMonth * 0.08).toFixed(2)),
    estimatedCostMonth: Number(estimatedCostMonth.toFixed(2)),
    totalMessagesToday: Math.round(totalMessagesMonth * 0.08),
    totalMessagesMonth,
    avgResponseTime,
    activeTenantsToday: 6,
    topModel: 'gpt-4-turbo',
  };
};

// Generate trend data for charts
export const getAIConsumptionTrend = (days: number = 30): AIConsumptionTrend[] => {
  const trend: AIConsumptionTrend[] = [];
  const baseTokens = 50000;
  const baseMessages = 150;
  const baseCost = 1.5;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some variance
    const variance = 0.7 + Math.random() * 0.6; // 70% to 130%
    const weekendFactor = [0, 6].includes(date.getDay()) ? 0.6 : 1; // Less on weekends
    
    trend.push({
      date: date.toISOString().split('T')[0],
      tokens: Math.round(baseTokens * variance * weekendFactor),
      messages: Math.round(baseMessages * variance * weekendFactor),
      cost: Number((baseCost * variance * weekendFactor).toFixed(2)),
    });
  }

  return trend;
};

// Model usage distribution
export const getModelUsageDistribution = () => [
  { model: 'GPT-4 Turbo', usage: 45, color: 'hsl(var(--primary))' },
  { model: 'GPT-3.5 Turbo', usage: 48, color: 'hsl(var(--accent))' },
  { model: 'GPT-4', usage: 7, color: 'hsl(var(--muted))' },
];

// Hourly distribution
export const getHourlyDistribution = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    let messages = 10;
    // Business hours peak
    if (i >= 8 && i <= 18) {
      messages = 80 + Math.round(Math.random() * 40);
    } else if (i >= 19 && i <= 22) {
      messages = 40 + Math.round(Math.random() * 20);
    } else {
      messages = 5 + Math.round(Math.random() * 10);
    }
    hours.push({ hour: `${i.toString().padStart(2, '0')}:00`, messages });
  }
  return hours;
};

// Top intents detected
export const getTopIntents = () => [
  { intent: 'Informações de Preço', count: 1250, percentage: 28 },
  { intent: 'Agendamento', count: 980, percentage: 22 },
  { intent: 'Horário de Funcionamento', count: 750, percentage: 17 },
  { intent: 'Dúvidas Gerais', count: 620, percentage: 14 },
  { intent: 'Reclamações', count: 450, percentage: 10 },
  { intent: 'Outros', count: 400, percentage: 9 },
];

// Format token count
export const formatTokens = (tokens: number): string => {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(2)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
};

// Format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};
