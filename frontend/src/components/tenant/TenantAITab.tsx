import { useState, useEffect } from 'react';
import { 
  Brain, 
  Zap, 
  DollarSign, 
  Clock, 
  TrendingUp,
  MessageSquare,
  ArrowUpRight,
  ArrowDownRight,
  Settings,
  Eye
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { useAIConsumption } from '@/hooks/useAI';

// Format helpers
const formatTokens = (tokens: number): string => {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
  return tokens.toString();
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

interface TenantAITabProps {
  tenantId?: string;
}

export function TenantAITab({ tenantId }: TenantAITabProps) {
  const { id } = useParams();
  const currentTenantId = tenantId || id || '1';
  
  const { consumption, isLoading, error, fetchConsumption } = useAIConsumption(currentTenantId);

  useEffect(() => {
    fetchConsumption();
  }, [fetchConsumption]);

  // Generate trend data from consumption
  const trendData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    return {
      date: date.toISOString().split('T')[0],
      tokens: Math.floor(Math.random() * 50000) + 10000,
    };
  });

  // Top intents (would come from backend)
  const topIntents = [
    { intent: 'Horários', percentage: 32 },
    { intent: 'Preços', percentage: 28 },
    { intent: 'Agendamento', percentage: 22 },
    { intent: 'Dúvidas gerais', percentage: 18 },
  ];

  // Recent conversations (would come from backend)
  const recentConversations = [
    { id: '1', preview: 'Qual o horário de funcionamento?', tokens: 245, time: '14:32', status: 'success' },
    { id: '2', preview: 'Quero agendar uma aula experimental', tokens: 380, time: '14:28', status: 'success' },
    { id: '3', preview: 'Quanto custa a mensalidade?', tokens: 290, time: '14:15', status: 'success' },
    { id: '4', preview: 'Vocês têm estacionamento?', tokens: 185, time: '13:58', status: 'escalated' },
    { id: '5', preview: 'Preciso falar com um atendente', tokens: 120, time: '13:45', status: 'escalated' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const tenantData = consumption || {
    tenantName: 'Tenant',
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    estimatedCost: 0,
    totalMessages: 0,
    avgResponseTime: 0,
    model: 'gpt-4',
    lastActivity: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="border border-border bg-cs-bg-card rounded-lg p-4 text-sm text-cs-text-secondary">
          Não foi possível carregar parte dos dados de consumo de IA. Os demais widgets continuam disponíveis.
        </div>
      )}
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-cs-text-primary flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Consumo de IA - {tenantData.tenantName || 'Tenant'}
          </h3>
          <p className="text-sm text-cs-text-secondary mt-1">
            Métricas de uso da OpenAI para este tenant
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/tenants/${currentTenantId}`}>
              <Eye className="w-4 h-4 mr-2" />
              Ver Config IA
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-cs-bg-card border-border">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-cs-text-secondary">Tokens Totais</p>
                <p className="text-2xl font-bold text-cs-text-primary">
                  {formatTokens(tenantData.totalTokens || 0)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-cs-success" />
                  <span className="text-xs text-cs-success">+8.5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cs-bg-card border-border">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cs-success/10">
                <DollarSign className="w-5 h-5 text-cs-success" />
              </div>
              <div>
                <p className="text-xs text-cs-text-secondary">Custo Estimado</p>
                <p className="text-2xl font-bold text-cs-success">
                  {formatCurrency(tenantData.estimatedCost || 0)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-cs-warning" />
                  <span className="text-xs text-cs-warning">+5.2%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cs-bg-card border-border">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cs-cyan/10">
                <MessageSquare className="w-5 h-5 text-cs-cyan" />
              </div>
              <div>
                <p className="text-xs text-cs-text-secondary">Mensagens</p>
                <p className="text-2xl font-bold text-cs-text-primary">
                  {(tenantData.totalMessages || 0).toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowUpRight className="w-3 h-3 text-cs-success" />
                  <span className="text-xs text-cs-success">+12.3%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-cs-bg-card border-border">
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cs-warning/10">
                <Clock className="w-5 h-5 text-cs-warning" />
              </div>
              <div>
                <p className="text-xs text-cs-text-secondary">Resp. Média</p>
                <p className="text-2xl font-bold text-cs-text-primary">
                  {((tenantData.avgResponseTime || 0) / 1000).toFixed(1)}s
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <ArrowDownRight className="w-3 h-3 text-cs-success" />
                  <span className="text-xs text-cs-success">-3.1%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Usage Trend */}
        <Card className="lg:col-span-2 bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Tendência de Uso (14 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getDate()}/${date.getMonth() + 1}`;
                  }}
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => formatTokens(value)}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [formatTokens(value), 'Tokens']}
                />
                <Area 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="hsl(var(--primary))" 
                  fill="url(#tokenGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Intents */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">Top Intenções</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topIntents.map((intent, index) => (
              <div key={intent.intent} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-cs-text-primary">{intent.intent}</span>
                    <span className="text-sm font-medium text-primary">{intent.percentage}%</span>
                  </div>
                  <div className="w-full bg-cs-bg-primary rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-primary h-1.5 rounded-full" 
                      style={{ width: `${intent.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Conversations */}
      <Card className="bg-cs-bg-card border-border">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cs-cyan" />
            Conversas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentConversations.map((conv) => (
              <div 
                key={conv.id} 
                className="flex items-center justify-between p-3 bg-cs-bg-primary/50 rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-2 h-2 rounded-full ${
                    conv.status === 'success' ? 'bg-cs-success' : 'bg-cs-warning'
                  }`} />
                  <p className="text-sm text-cs-text-primary truncate max-w-md">
                    "{conv.preview}"
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="text-xs font-mono">
                    {conv.tokens} tokens
                  </Badge>
                  <span className="text-xs text-cs-text-muted">{conv.time}</span>
                  {conv.status === 'escalated' && (
                    <Badge variant="secondary" className="text-xs bg-cs-warning/20 text-cs-warning border-cs-warning/30">
                      Escalado
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Token Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-cs-bg-card border-border">
          <CardContent className="pt-5">
            <p className="text-sm text-cs-text-secondary mb-2">Prompt Tokens</p>
            <p className="text-2xl font-bold text-cs-text-primary">
              {formatTokens(tenantData.promptTokens || 0)}
            </p>
            <p className="text-xs text-cs-text-muted mt-1">
              {tenantData.totalTokens ? ((tenantData.promptTokens / tenantData.totalTokens) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-cs-bg-card border-border">
          <CardContent className="pt-5">
            <p className="text-sm text-cs-text-secondary mb-2">Completion Tokens</p>
            <p className="text-2xl font-bold text-cs-text-primary">
              {formatTokens(tenantData.completionTokens || 0)}
            </p>
            <p className="text-xs text-cs-text-muted mt-1">
              {tenantData.totalTokens ? ((tenantData.completionTokens / tenantData.totalTokens) * 100).toFixed(1) : 0}% do total
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-cs-bg-card border-border">
          <CardContent className="pt-5">
            <p className="text-sm text-cs-text-secondary mb-2">Modelo Utilizado</p>
            <p className="text-2xl font-bold text-cs-text-primary">
              {tenantData.model || 'gpt-4'}
            </p>
            <p className="text-xs text-cs-text-muted mt-1">
              Última atividade: {tenantData.lastActivity ? new Date(tenantData.lastActivity).toLocaleString('pt-BR') : '-'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
