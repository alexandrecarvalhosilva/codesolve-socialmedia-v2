import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Mail, 
  Users, 
  Percent, 
  Clock,
  Zap,
  AlertTriangle,
  TrendingUp,
  Bot,
  MessageSquare,
  Calendar,
  Settings as SettingsIcon,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardMetrics, useDashboardCharts } from '@/hooks/useDashboard';
import { toast } from 'sonner';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Period options
const periodOptions = ['7 dias', '30 dias', '3 meses'] as const;
type Period = typeof periodOptions[number];

const periodToApi: Record<Period, string> = {
  '7 dias': '7d',
  '30 dias': '30d',
  '3 meses': '90d'
};

export function TenantDashboardTab() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('7 dias');
  const { metrics, isLoading: metricsLoading, fetchMetrics } = useDashboardMetrics();
  const { charts, isLoading: chartsLoading, fetchCharts } = useDashboardCharts();

  const isLoading = metricsLoading || chartsLoading;

  useEffect(() => {
    const period = periodToApi[selectedPeriod];
    fetchMetrics(period);
    fetchCharts(period);
  }, [selectedPeriod]);

  const handleRefresh = () => {
    const period = periodToApi[selectedPeriod];
    fetchMetrics(period);
    fetchCharts(period);
    toast.success('Dashboard atualizado');
  };

  // Fallback data
  const metricsData = {
    conversas: { 
      value: metrics?.conversations?.toString() || '0', 
      subtitle: `Últimos ${selectedPeriod}`, 
      change: metrics?.conversationsChange ? `${metrics.conversationsChange > 0 ? '+' : ''}${metrics.conversationsChange}%` : '0%' 
    },
    mensagens: { 
      value: metrics?.messages?.toLocaleString() || '0', 
      subtitle: 'Processadas', 
      change: metrics?.messagesChange ? `${metrics.messagesChange > 0 ? '+' : ''}${metrics.messagesChange}%` : '0%' 
    },
    operadores: { 
      value: metrics?.operators?.toString() || '0', 
      subtitle: 'Ativos', 
      change: metrics?.operatorsChange ? `${metrics.operatorsChange > 0 ? '+' : ''}${metrics.operatorsChange}` : '0' 
    },
    taxaResposta: { 
      value: `${metrics?.responseRate || 0}%`, 
      subtitle: 'Média', 
      change: metrics?.responseRateChange ? `${metrics.responseRateChange > 0 ? '+' : ''}${metrics.responseRateChange}%` : '0%' 
    },
    tempoMedio: { 
      value: metrics?.avgResponseTime || '0min', 
      subtitle: 'Resposta', 
      change: metrics?.avgResponseTimeChange || '0min' 
    }
  };

  const conversationTrend = charts?.conversationTrend || [
    { day: 'Seg', conversas: 0 },
    { day: 'Ter', conversas: 0 },
    { day: 'Qua', conversas: 0 },
    { day: 'Qui', conversas: 0 },
    { day: 'Sex', conversas: 0 },
    { day: 'Sáb', conversas: 0 },
    { day: 'Dom', conversas: 0 },
  ];

  const channelDistribution = charts?.channelDistribution || [
    { channel: 'WhatsApp', value: 0 },
    { channel: 'Instagram', value: 0 },
    { channel: 'Email', value: 0 },
  ];

  const quickActions = [
    { icon: MessageSquare, label: 'Abrir Chat', to: '/tenant/chat', color: 'text-cs-cyan' },
    { icon: Bot, label: 'Config. IA', to: '/tenant/ai/config', color: 'text-purple-500' },
    { icon: Calendar, label: 'Agenda', to: '/tenant/calendar', color: 'text-green-500' },
    { icon: SettingsIcon, label: 'Configurações', to: '/tenant/config', color: 'text-orange-500' },
  ];

  const alerts = metrics?.alerts || [];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        {/* Period selector skeleton */}
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-28" />
        </div>

        {/* Metrics skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-cs-bg-card border border-border rounded-xl p-4">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-cs-bg-card border border-border rounded-xl p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
          <div className="bg-cs-bg-card border border-border rounded-xl p-6">
            <Skeleton className="h-6 w-40 mb-4" />
            <Skeleton className="h-48 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Period Selector */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {periodOptions.map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
              className={selectedPeriod === period ? 'bg-cs-cyan hover:bg-cs-cyan/90' : ''}
            >
              {period}
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm">Conversas</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{metricsData.conversas.value}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{metricsData.conversas.subtitle}</span>
            <span className={`text-xs ${metricsData.conversas.change.startsWith('+') ? 'text-cs-success' : metricsData.conversas.change.startsWith('-') ? 'text-cs-error' : 'text-muted-foreground'}`}>
              {metricsData.conversas.change}
            </span>
          </div>
        </div>

        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Mail className="w-4 h-4" />
            <span className="text-sm">Mensagens</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{metricsData.mensagens.value}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{metricsData.mensagens.subtitle}</span>
            <span className={`text-xs ${metricsData.mensagens.change.startsWith('+') ? 'text-cs-success' : metricsData.mensagens.change.startsWith('-') ? 'text-cs-error' : 'text-muted-foreground'}`}>
              {metricsData.mensagens.change}
            </span>
          </div>
        </div>

        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">Operadores</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{metricsData.operadores.value}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{metricsData.operadores.subtitle}</span>
            <span className="text-xs text-muted-foreground">{metricsData.operadores.change}</span>
          </div>
        </div>

        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Percent className="w-4 h-4" />
            <span className="text-sm">Taxa Resposta</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{metricsData.taxaResposta.value}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{metricsData.taxaResposta.subtitle}</span>
            <span className={`text-xs ${metricsData.taxaResposta.change.startsWith('+') ? 'text-cs-success' : metricsData.taxaResposta.change.startsWith('-') ? 'text-cs-error' : 'text-muted-foreground'}`}>
              {metricsData.taxaResposta.change}
            </span>
          </div>
        </div>

        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Tempo Médio</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{metricsData.tempoMedio.value}</p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-muted-foreground">{metricsData.tempoMedio.subtitle}</span>
            <span className="text-xs text-muted-foreground">{metricsData.tempoMedio.change}</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversation Trend */}
        <div className="bg-cs-bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Tendência de Conversas</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={conversationTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
              />
              <Line 
                type="monotone" 
                dataKey="conversas" 
                stroke="#00d4ff" 
                strokeWidth={2}
                dot={{ fill: '#00d4ff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Channel Distribution */}
        <div className="bg-cs-bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Distribuição por Canal</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={channelDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="channel" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
              />
              <Bar dataKey="value" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-cs-bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.to}
                className="flex items-center gap-3 p-3 bg-cs-bg-primary rounded-lg border border-border hover:border-cs-cyan/50 transition-colors"
              >
                <action.icon className={`w-5 h-5 ${action.color}`} />
                <span className="text-sm text-foreground">{action.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </Link>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-cs-bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-cs-warning" />
            Alertas
          </h3>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhum alerta no momento</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert: any, index: number) => (
                <div 
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    alert.type === 'error' ? 'bg-cs-error/10 border border-cs-error/30' :
                    alert.type === 'warning' ? 'bg-cs-warning/10 border border-cs-warning/30' :
                    'bg-cs-cyan/10 border border-cs-cyan/30'
                  }`}
                >
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.type === 'error' ? 'text-cs-error' :
                    alert.type === 'warning' ? 'text-cs-warning' :
                    'text-cs-cyan'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
