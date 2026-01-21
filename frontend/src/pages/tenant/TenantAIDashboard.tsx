import { useState, useEffect } from 'react';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Header } from '@/components/dashboard/Header';
import { 
  MessageCircle, 
  Zap, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Bot,
  Users,
  BarChart3,
  Activity,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAIConsumption, useAILimits } from '@/hooks/useAI';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { toast } from 'sonner';

export default function TenantAIDashboard() {
  const [period, setPeriod] = useState('7d');
  const { consumption, isLoading: consumptionLoading, fetchConsumption } = useAIConsumption();
  const { limits, isLoading: limitsLoading, fetchLimits } = useAILimits();

  const isLoading = consumptionLoading || limitsLoading;

  useEffect(() => {
    fetchConsumption(period);
    fetchLimits();
  }, [period]);

  const handleRefresh = () => {
    fetchConsumption(period);
    fetchLimits();
    toast.success('Dados atualizados');
  };

  // Fallback data when loading or no data
  const dailyUsage = consumption?.dailyUsage || [
    { date: '13/01', messages: 0, tokens: 0, cost: 0 },
    { date: '14/01', messages: 0, tokens: 0, cost: 0 },
    { date: '15/01', messages: 0, tokens: 0, cost: 0 },
    { date: '16/01', messages: 0, tokens: 0, cost: 0 },
    { date: '17/01', messages: 0, tokens: 0, cost: 0 },
    { date: '18/01', messages: 0, tokens: 0, cost: 0 },
    { date: '19/01', messages: 0, tokens: 0, cost: 0 },
  ];

  const hourlyDistribution = consumption?.hourlyDistribution || [
    { hour: '00h', messages: 0 },
    { hour: '03h', messages: 0 },
    { hour: '06h', messages: 0 },
    { hour: '09h', messages: 0 },
    { hour: '12h', messages: 0 },
    { hour: '15h', messages: 0 },
    { hour: '18h', messages: 0 },
    { hour: '21h', messages: 0 },
  ];

  const modelUsage = consumption?.modelUsage || [
    { name: 'GPT-4', value: 0, color: 'hsl(var(--primary))' },
    { name: 'GPT-3.5 Turbo', value: 0, color: 'hsl(var(--muted-foreground))' },
  ];

  const topIntents = consumption?.topIntents || [];
  const recentConversations = consumption?.recentConversations || [];

  const stats = {
    totalMessages: consumption?.totalMessages || 0,
    totalTokens: consumption?.totalTokens || 0,
    totalCost: consumption?.totalCost || 0,
    avgResponseTime: consumption?.avgResponseTime || '0s',
    successRate: consumption?.successRate || 0,
    messagesGrowth: consumption?.messagesGrowth || 0,
    tokensGrowth: consumption?.tokensGrowth || 0,
    costGrowth: consumption?.costGrowth || 0,
  };

  const limitUsage = {
    messages: limits?.messagesUsed || 0,
    messagesLimit: limits?.messagesLimit || 1000,
    tokens: limits?.tokensUsed || 0,
    tokensLimit: limits?.tokensLimit || 500000,
    cost: limits?.costUsed || 0,
    costLimit: limits?.costLimit || 100,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-cs-success';
      case 'active': return 'text-cs-cyan';
      case 'failed': return 'text-cs-error';
      default: return 'text-muted-foreground';
    }
  };

  const getSatisfactionIcon = (satisfaction: string) => {
    switch (satisfaction) {
      case 'positive': return <CheckCircle2 className="w-4 h-4 text-cs-success" />;
      case 'negative': return <AlertCircle className="w-4 h-4 text-cs-error" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return (
      <TenantLayout>
        <Header />
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-cs-bg-card border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <Header />
      
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Bot className="w-7 h-7 text-cs-cyan" />
              Dashboard de IA
            </h1>
            <p className="text-muted-foreground">Acompanhe o consumo e desempenho da IA</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-40 bg-cs-bg-card border-border">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Últimas 24h</SelectItem>
                <SelectItem value="7d">Últimos 7 dias</SelectItem>
                <SelectItem value="30d">Últimos 30 dias</SelectItem>
                <SelectItem value="90d">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-cs-cyan/10 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-cs-cyan" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats.messagesGrowth >= 0 ? 'text-cs-success' : 'text-cs-error'}`}>
                  {stats.messagesGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(stats.messagesGrowth)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground mt-3">{stats.totalMessages.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Mensagens processadas</p>
            </CardContent>
          </Card>

          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-500" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats.tokensGrowth >= 0 ? 'text-cs-success' : 'text-cs-error'}`}>
                  {stats.tokensGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(stats.tokensGrowth)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground mt-3">{(stats.totalTokens / 1000).toFixed(0)}k</p>
              <p className="text-sm text-muted-foreground">Tokens utilizados</p>
            </CardContent>
          </Card>

          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${stats.costGrowth >= 0 ? 'text-cs-error' : 'text-cs-success'}`}>
                  {stats.costGrowth >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(stats.costGrowth)}%
                </div>
              </div>
              <p className="text-2xl font-bold text-foreground mt-3">R$ {stats.totalCost.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground">Custo total</p>
            </CardContent>
          </Card>

          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <Badge variant="outline" className="text-cs-success border-cs-success">
                  {stats.successRate}% sucesso
                </Badge>
              </div>
              <p className="text-2xl font-bold text-foreground mt-3">{stats.avgResponseTime}</p>
              <p className="text-sm text-muted-foreground">Tempo médio de resposta</p>
            </CardContent>
          </Card>
        </div>

        {/* Limites de Uso */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cs-cyan" />
              Limites de Uso
            </CardTitle>
            <CardDescription>Consumo atual vs. limite do plano</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mensagens</span>
                  <span className="text-foreground">{limitUsage.messages.toLocaleString()} / {limitUsage.messagesLimit.toLocaleString()}</span>
                </div>
                <Progress 
                  value={(limitUsage.messages / limitUsage.messagesLimit) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {((limitUsage.messages / limitUsage.messagesLimit) * 100).toFixed(1)}% utilizado
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tokens</span>
                  <span className="text-foreground">{(limitUsage.tokens / 1000).toFixed(0)}k / {(limitUsage.tokensLimit / 1000).toFixed(0)}k</span>
                </div>
                <Progress 
                  value={(limitUsage.tokens / limitUsage.tokensLimit) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {((limitUsage.tokens / limitUsage.tokensLimit) * 100).toFixed(1)}% utilizado
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Custo</span>
                  <span className="text-foreground">R$ {limitUsage.cost.toFixed(2)} / R$ {limitUsage.costLimit.toFixed(2)}</span>
                </div>
                <Progress 
                  value={(limitUsage.cost / limitUsage.costLimit) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {((limitUsage.cost / limitUsage.costLimit) * 100).toFixed(1)}% utilizado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Consumo Diário */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle>Consumo Diário</CardTitle>
              <CardDescription>Mensagens e tokens por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis yAxisId="left" stroke="#888" />
                  <YAxis yAxisId="right" orientation="right" stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                  />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="messages" 
                    name="Mensagens"
                    stroke="#00d4ff" 
                    strokeWidth={2}
                    dot={{ fill: '#00d4ff' }}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="tokens" 
                    name="Tokens"
                    stroke="#a855f7" 
                    strokeWidth={2}
                    dot={{ fill: '#a855f7' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Distribuição por Hora */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle>Distribuição por Hora</CardTitle>
              <CardDescription>Mensagens processadas por horário</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="hour" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                  />
                  <Bar dataKey="messages" name="Mensagens" fill="#00d4ff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Modelo e Intenções */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Uso por Modelo */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle>Uso por Modelo</CardTitle>
              <CardDescription>Distribuição de tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={modelUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {modelUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                    formatter={(value: number) => [`${value}%`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Intenções */}
          <Card className="bg-cs-bg-card border-border lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Intenções Detectadas</CardTitle>
              <CardDescription>Principais assuntos das conversas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topIntents.map((intent, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{intent.intent}</span>
                      <span className="text-sm text-muted-foreground">{intent.count} ({intent.percentage}%)</span>
                    </div>
                    <Progress value={intent.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conversas Recentes */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle>Conversas Recentes com IA</CardTitle>
            <CardDescription>Últimas interações processadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuário</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Mensagens</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tokens</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Duração</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Satisfação</th>
                  </tr>
                </thead>
                <tbody>
                  {recentConversations.map((conv: any) => (
                    <tr key={conv.id} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-3 px-4 text-sm text-foreground">{conv.user}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{conv.messages}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{conv.tokens.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{conv.duration}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={getStatusColor(conv.status)}>
                          {conv.status === 'completed' ? 'Concluída' : conv.status === 'active' ? 'Ativa' : 'Falhou'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {getSatisfactionIcon(conv.satisfaction)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </TenantLayout>
  );
}
