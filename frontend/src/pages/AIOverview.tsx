import { useState, useEffect } from 'react';
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
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useAIConsumption, useAIModels } from '@/hooks/useAI';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const formatTokens = (tokens: number) => {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
  return tokens.toString();
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function AIOverview() {
  const [period, setPeriod] = useState('30');
  
  const { consumption, isLoading: consumptionLoading, fetchConsumption } = useAIConsumption();
  const { models, isLoading: modelsLoading, fetchModels } = useAIModels();

  const isLoading = consumptionLoading || modelsLoading;

  useEffect(() => {
    fetchConsumption(parseInt(period));
    fetchModels();
  }, [period]);

  const handleRefresh = () => {
    fetchConsumption(parseInt(period));
    fetchModels();
    toast.success('Dados atualizados');
  };

  // Calcular métricas a partir dos dados
  const metrics = {
    totalTokens: consumption?.totalTokens || 0,
    totalCost: consumption?.totalCost || 0,
    totalMessages: consumption?.totalMessages || 0,
    avgResponseTime: consumption?.avgResponseTime || 0,
    tokenTrend: consumption?.tokenTrend || 0,
    costTrend: consumption?.costTrend || 0,
    messageTrend: consumption?.messageTrend || 0,
  };

  const trendData = consumption?.trendData || [];
  const modelUsage = consumption?.modelUsage || [];
  const hourlyData = consumption?.hourlyData || [];
  const topIntents = consumption?.topIntents || [];
  const tenantConsumption = consumption?.tenantConsumption || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header />
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-cs-bg-card border-border">
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
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
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cs-text-secondary">Tokens Totais</p>
                  <p className="text-2xl font-bold text-foreground">{formatTokens(metrics.totalTokens)}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm ${metrics.tokenTrend >= 0 ? 'text-cs-success' : 'text-cs-error'}`}>
                  {metrics.tokenTrend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(metrics.tokenTrend).toFixed(1)}%
                </div>
              </div>
              <Zap className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
            </CardContent>
          </Card>

          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cs-text-secondary">Custo Total</p>
                  <p className="text-2xl font-bold text-foreground">{formatCurrency(metrics.totalCost)}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm ${metrics.costTrend >= 0 ? 'text-cs-error' : 'text-cs-success'}`}>
                  {metrics.costTrend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(metrics.costTrend).toFixed(1)}%
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
            </CardContent>
          </Card>

          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cs-text-secondary">Mensagens IA</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.totalMessages.toLocaleString()}</p>
                </div>
                <div className={`flex items-center gap-1 text-sm ${metrics.messageTrend >= 0 ? 'text-cs-success' : 'text-cs-error'}`}>
                  {metrics.messageTrend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                  {Math.abs(metrics.messageTrend).toFixed(1)}%
                </div>
              </div>
              <MessageSquare className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
            </CardContent>
          </Card>

          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-cs-text-secondary">Tempo Médio</p>
                  <p className="text-2xl font-bold text-foreground">{metrics.avgResponseTime.toFixed(1)}s</p>
                </div>
              </div>
              <Clock className="w-8 h-8 text-primary/20 absolute top-4 right-4" />
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Trend Chart */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Consumo ao Longo do Tempo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="tokens" stroke="#0088FE" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="cost" stroke="#00C49F" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Model Distribution */}
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Modelo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={modelUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {modelUsage.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Distribution */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Distribuição por Hora</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="hour" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                />
                <Bar dataKey="messages" fill="#0088FE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tenant Consumption Table */}
        <Card className="bg-cs-bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Consumo por Tenant
            </CardTitle>
            <Button asChild variant="outline" size="sm">
              <Link to="/ai/config">
                Ver Detalhes <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Tokens</TableHead>
                  <TableHead>Custo</TableHead>
                  <TableHead>Mensagens</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenantConsumption.slice(0, 10).map((tenant: any) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell>{formatTokens(tenant.tokens)}</TableCell>
                    <TableCell>{formatCurrency(tenant.cost)}</TableCell>
                    <TableCell>{tenant.messages.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={tenant.status === 'active' ? 'default' : 'secondary'}>
                        {tenant.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Intents */}
        {topIntents.length > 0 && (
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Principais Intenções</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topIntents.map((intent: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-foreground">{intent.name}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-cs-bg-primary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${intent.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {intent.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
