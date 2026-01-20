import { useState } from 'react';
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
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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

// Mock data for AI consumption
const mockDailyUsage = [
  { date: '13/01', messages: 120, tokens: 45000, cost: 2.25 },
  { date: '14/01', messages: 145, tokens: 52000, cost: 2.60 },
  { date: '15/01', messages: 98, tokens: 38000, cost: 1.90 },
  { date: '16/01', messages: 167, tokens: 61000, cost: 3.05 },
  { date: '17/01', messages: 189, tokens: 72000, cost: 3.60 },
  { date: '18/01', messages: 156, tokens: 58000, cost: 2.90 },
  { date: '19/01', messages: 134, tokens: 49000, cost: 2.45 },
];

const mockHourlyDistribution = [
  { hour: '00h', messages: 5 },
  { hour: '03h', messages: 2 },
  { hour: '06h', messages: 8 },
  { hour: '09h', messages: 45 },
  { hour: '12h', messages: 38 },
  { hour: '15h', messages: 52 },
  { hour: '18h', messages: 67 },
  { hour: '21h', messages: 34 },
];

const mockModelUsage = [
  { name: 'GPT-4', value: 65, color: 'hsl(var(--primary))' },
  { name: 'GPT-3.5 Turbo', value: 35, color: 'hsl(var(--muted-foreground))' },
];

const mockTopIntents = [
  { intent: 'Agendamento', count: 234, percentage: 28 },
  { intent: 'Preços/Valores', count: 189, percentage: 23 },
  { intent: 'Horário de Funcionamento', count: 156, percentage: 19 },
  { intent: 'Informações Gerais', count: 134, percentage: 16 },
  { intent: 'Suporte/Reclamação', count: 87, percentage: 10 },
  { intent: 'Outros', count: 45, percentage: 5 },
];

const mockRecentConversations = [
  { id: 1, user: '+55 61 9****-1234', messages: 12, tokens: 4500, duration: '8min', status: 'completed', satisfaction: 'positive' },
  { id: 2, user: '+55 11 9****-5678', messages: 5, tokens: 1800, duration: '3min', status: 'completed', satisfaction: 'neutral' },
  { id: 3, user: '+55 21 9****-9012', messages: 8, tokens: 3200, duration: '5min', status: 'active', satisfaction: 'pending' },
  { id: 4, user: '+55 31 9****-3456', messages: 15, tokens: 5600, duration: '12min', status: 'completed', satisfaction: 'positive' },
  { id: 5, user: '+55 41 9****-7890', messages: 3, tokens: 900, duration: '2min', status: 'completed', satisfaction: 'negative' },
];

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  variant?: 'default' | 'success' | 'warning' | 'error';
}

function KPICard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: KPICardProps) {
  const variantStyles = {
    default: 'border-border',
    success: 'border-l-4 border-l-green-500',
    warning: 'border-l-4 border-l-yellow-500',
    error: 'border-l-4 border-l-red-500',
  };

  return (
    <Card className={`bg-cs-bg-card ${variantStyles[variant]}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
        {trend && (
          <div className={`flex items-center gap-1 mt-3 text-sm ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {trend.isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span>{trend.value}% vs período anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TenantAIDashboard() {
  const [period, setPeriod] = useState('7d');

  // Calculate totals from mock data
  const totalMessages = mockDailyUsage.reduce((acc, day) => acc + day.messages, 0);
  const totalTokens = mockDailyUsage.reduce((acc, day) => acc + day.tokens, 0);
  const totalCost = mockDailyUsage.reduce((acc, day) => acc + day.cost, 0);
  const avgResponseTime = 1.8; // seconds
  const successRate = 94.5;

  return (
    <TenantLayout>
      <Header />
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-cs-text-primary">Dashboard de Consumo IA</h1>
            <p className="text-cs-text-secondary">Monitore o uso e custos da IA humanizada</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] bg-cs-bg-card border-border">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Últimas 24 horas</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <KPICard
            title="Total de Mensagens"
            value={totalMessages.toLocaleString()}
            subtitle="conversas processadas"
            icon={MessageCircle}
            trend={{ value: 12, isPositive: true }}
          />
          <KPICard
            title="Tokens Consumidos"
            value={`${(totalTokens / 1000).toFixed(1)}K`}
            subtitle="input + output"
            icon={Zap}
            trend={{ value: 8, isPositive: true }}
          />
          <KPICard
            title="Custo Estimado"
            value={`R$ ${totalCost.toFixed(2)}`}
            subtitle="no período"
            icon={DollarSign}
            trend={{ value: 5, isPositive: false }}
            variant="warning"
          />
          <KPICard
            title="Tempo Médio Resposta"
            value={`${avgResponseTime}s`}
            subtitle="latência média"
            icon={Clock}
            trend={{ value: 15, isPositive: true }}
            variant="success"
          />
          <KPICard
            title="Taxa de Sucesso"
            value={`${successRate}%`}
            subtitle="respostas válidas"
            icon={CheckCircle2}
            variant="success"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Usage Trend Chart */}
          <Card className="lg:col-span-2 bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Evolução de Uso
              </CardTitle>
              <CardDescription>Mensagens e tokens consumidos por dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockDailyUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="left" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="messages" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                    name="Mensagens"
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={{ fill: 'hsl(var(--muted-foreground))' }}
                    name="Tokens"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Model Usage Pie Chart */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Uso por Modelo
              </CardTitle>
              <CardDescription>Distribuição de requisições</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={mockModelUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockModelUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {mockModelUsage.map((model) => (
                  <div key={model.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: model.color }} />
                      <span className="text-muted-foreground">{model.name}</span>
                    </div>
                    <span className="font-medium">{model.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hourly Distribution */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Distribuição por Horário
              </CardTitle>
              <CardDescription>Volume de mensagens ao longo do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockHourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="messages" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Mensagens" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Intents */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Top Intenções Detectadas
              </CardTitle>
              <CardDescription>Principais assuntos das conversas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTopIntents.map((intent, index) => (
                  <div key={intent.intent} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground w-4">{index + 1}.</span>
                        <span className="font-medium">{intent.intent}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{intent.count}</span>
                        <Badge variant="secondary" className="text-xs">{intent.percentage}%</Badge>
                      </div>
                    </div>
                    <Progress value={intent.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Conversations Table */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Conversas Recentes
            </CardTitle>
            <CardDescription>Últimas interações processadas pela IA</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Usuário</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Mensagens</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Tokens</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Duração</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Satisfação</th>
                  </tr>
                </thead>
                <tbody>
                  {mockRecentConversations.map((conv) => (
                    <tr key={conv.id} className="border-b border-border/50 hover:bg-cs-bg-primary/50">
                      <td className="py-3 px-4 text-sm font-medium">{conv.user}</td>
                      <td className="py-3 px-4 text-sm text-center">{conv.messages}</td>
                      <td className="py-3 px-4 text-sm text-center text-muted-foreground">{conv.tokens.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm text-center text-muted-foreground">{conv.duration}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={conv.status === 'active' ? 'default' : 'secondary'}>
                          {conv.status === 'active' ? 'Ativa' : 'Finalizada'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {conv.satisfaction === 'positive' && <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />}
                        {conv.satisfaction === 'neutral' && <AlertCircle className="h-5 w-5 text-yellow-500 mx-auto" />}
                        {conv.satisfaction === 'negative' && <AlertCircle className="h-5 w-5 text-red-500 mx-auto" />}
                        {conv.satisfaction === 'pending' && <Clock className="h-5 w-5 text-muted-foreground mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Detalhamento de Custos
            </CardTitle>
            <CardDescription>Breakdown de custos por tipo de token (valores em USD)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-lg bg-cs-bg-primary border border-border">
                <p className="text-sm text-muted-foreground">Tokens de Entrada (Prompt)</p>
                <p className="text-2xl font-bold mt-1">~{((totalTokens * 0.6) / 1000).toFixed(1)}K</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ≈ ${((totalTokens * 0.6 / 1000) * 0.03).toFixed(2)} (GPT-4)
                </p>
              </div>
              <div className="p-4 rounded-lg bg-cs-bg-primary border border-border">
                <p className="text-sm text-muted-foreground">Tokens de Saída (Completion)</p>
                <p className="text-2xl font-bold mt-1">~{((totalTokens * 0.4) / 1000).toFixed(1)}K</p>
                <p className="text-sm text-muted-foreground mt-1">
                  ≈ ${((totalTokens * 0.4 / 1000) * 0.06).toFixed(2)} (GPT-4)
                </p>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-sm text-primary">Custo Total Estimado</p>
                <p className="text-2xl font-bold mt-1 text-primary">
                  ${(((totalTokens * 0.6 / 1000) * 0.03) + ((totalTokens * 0.4 / 1000) * 0.06)).toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ≈ R$ {((((totalTokens * 0.6 / 1000) * 0.03) + ((totalTokens * 0.4 / 1000) * 0.06)) * 5).toFixed(2)}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              * Valores estimados com base na tabela de preços da OpenAI para GPT-4 (março 2024). 
              Cotação USD/BRL: R$ 5,00. Os custos reais podem variar.
            </p>
          </CardContent>
        </Card>
      </div>
    </TenantLayout>
  );
}
