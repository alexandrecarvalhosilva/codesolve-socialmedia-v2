import { useState } from 'react';
import { 
  Brain, 
  Zap, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Building2,
  MessageSquare,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import {
  getGlobalAIMetrics,
  tenantAIConsumption,
  getAIConsumptionTrend,
  getModelUsageDistribution,
  getHourlyDistribution,
  getTopIntents,
  formatTokens,
  formatCurrency,
} from '@/data/aiConsumptionMockData';

export default function AIOverview() {
  const [period, setPeriod] = useState('30');
  const metrics = getGlobalAIMetrics();
  const trendData = getAIConsumptionTrend(parseInt(period));
  const modelUsage = getModelUsageDistribution();
  const hourlyData = getHourlyDistribution();
  const topIntents = getTopIntents();

  // Sort tenants by consumption
  const sortedTenants = [...tenantAIConsumption].sort((a, b) => b.totalTokens - a.totalTokens);

  // Calculate trends (mock)
  const tokenTrend = 12.5;
  const costTrend = 8.3;
  const messageTrend = 15.2;

  return (
    <DashboardLayout>
      <Header />
      
      <div className="p-8 space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cs-text-primary flex items-center gap-2">
              <Brain className="w-7 h-7 text-primary" />
              Visão Geral - OpenAI
            </h1>
            <p className="text-cs-text-secondary mt-1">
              Monitoramento de consumo de IA em todos os tenants
            </p>
          </div>
          
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40 bg-cs-bg-card border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="14">Últimos 14 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cs-text-secondary">Tokens Mensais</p>
                  <p className="text-3xl font-bold text-cs-text-primary mt-1">
                    {formatTokens(metrics.totalTokensMonth)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-4 h-4 text-cs-success" />
                    <span className="text-sm text-cs-success">+{tokenTrend}%</span>
                    <span className="text-xs text-cs-text-muted">vs mês anterior</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-primary/10">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cs-bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cs-text-secondary">Custo Mensal</p>
                  <p className="text-3xl font-bold text-cs-success mt-1">
                    {formatCurrency(metrics.estimatedCostMonth)}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-4 h-4 text-cs-warning" />
                    <span className="text-sm text-cs-warning">+{costTrend}%</span>
                    <span className="text-xs text-cs-text-muted">vs mês anterior</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-cs-success/10">
                  <DollarSign className="w-6 h-6 text-cs-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cs-bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cs-text-secondary">Mensagens Mensais</p>
                  <p className="text-3xl font-bold text-cs-text-primary mt-1">
                    {metrics.totalMessagesMonth.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="w-4 h-4 text-cs-success" />
                    <span className="text-sm text-cs-success">+{messageTrend}%</span>
                    <span className="text-xs text-cs-text-muted">vs mês anterior</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-cs-cyan/10">
                  <MessageSquare className="w-6 h-6 text-cs-cyan" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-cs-bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cs-text-secondary">Tempo Médio Resposta</p>
                  <p className="text-3xl font-bold text-cs-text-primary mt-1">
                    {(metrics.avgResponseTime / 1000).toFixed(1)}s
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowDownRight className="w-4 h-4 text-cs-success" />
                    <span className="text-sm text-cs-success">-5.2%</span>
                    <span className="text-xs text-cs-text-muted">mais rápido</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-cs-warning/10">
                  <Clock className="w-6 h-6 text-cs-warning" />
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
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Tendência de Consumo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return `${date.getDate()}/${date.getMonth() + 1}`;
                    }}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => formatTokens(value)}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))"
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'tokens' ? formatTokens(value) : formatCurrency(value),
                      name === 'tokens' ? 'Tokens' : 'Custo'
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="tokens" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                    yAxisId="left"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cost" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={false}
                    yAxisId="right"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Model Distribution */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Uso por Modelo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={modelUsage}
                    dataKey="usage"
                    nameKey="model"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {modelUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {modelUsage.map((item) => (
                  <div key={item.model} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-cs-text-secondary">{item.model}</span>
                    </div>
                    <span className="text-sm font-medium text-cs-text-primary">{item.usage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Tenants Table + Hourly Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Tenants */}
          <Card className="lg:col-span-2 bg-cs-bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cs-cyan" />
                  Consumo por Tenant
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-cs-text-secondary">Tenant</TableHead>
                    <TableHead className="text-cs-text-secondary text-right">Tokens</TableHead>
                    <TableHead className="text-cs-text-secondary text-right">Mensagens</TableHead>
                    <TableHead className="text-cs-text-secondary text-right">Custo Est.</TableHead>
                    <TableHead className="text-cs-text-secondary text-right">Resp. Média</TableHead>
                    <TableHead className="text-cs-text-secondary">Modelo</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTenants.slice(0, 6).map((tenant, index) => (
                    <TableRow key={tenant.tenantId} className="border-border">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                            {index + 1}
                          </span>
                          <span className="font-medium text-cs-text-primary">{tenant.tenantName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-cs-text-primary">
                        {formatTokens(tenant.totalTokens)}
                      </TableCell>
                      <TableCell className="text-right text-cs-text-primary">
                        {tenant.totalMessages.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-cs-success font-medium">
                        {formatCurrency(tenant.estimatedCost)}
                      </TableCell>
                      <TableCell className="text-right text-cs-text-secondary">
                        {(tenant.avgResponseTime / 1000).toFixed(1)}s
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {tenant.model}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link to={`/tenants/${tenant.tenantId}`}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Hourly Distribution */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Hora</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={hourlyData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                  <YAxis 
                    dataKey="hour" 
                    type="category" 
                    stroke="hsl(var(--muted-foreground))"
                    width={50}
                    tickFormatter={(value) => value.split(':')[0] + 'h'}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="messages" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Intents */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              Top Intenções Detectadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {topIntents.map((intent) => (
                <div key={intent.intent} className="bg-cs-bg-primary/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-cs-text-primary">{intent.percentage}%</p>
                  <p className="text-sm text-cs-text-secondary mt-1">{intent.intent}</p>
                  <p className="text-xs text-cs-text-muted">{intent.count.toLocaleString()} msgs</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
