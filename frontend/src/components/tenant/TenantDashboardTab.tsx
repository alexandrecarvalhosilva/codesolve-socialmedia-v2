import { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/dashboard/StatusPill';
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

interface MetricItem {
  value: string;
  subtitle: string;
  change: string;
}

interface MetricsData {
  conversas: MetricItem;
  mensagens: MetricItem;
  operadores: MetricItem;
  taxaResposta: MetricItem;
  tempoMedio: MetricItem;
}

// Metrics by period
const metricsDataByPeriod: Record<Period, MetricsData> = {
  '7 dias': {
    conversas: { value: '287', subtitle: 'Últimos 7 dias', change: '+12%' },
    mensagens: { value: '2.134', subtitle: 'Processadas', change: '+8%' },
    operadores: { value: '12', subtitle: 'Ativos', change: '0%' },
    taxaResposta: { value: '92%', subtitle: 'Média', change: '-2%' },
    tempoMedio: { value: '2.8min', subtitle: 'Resposta', change: '+0.3min' }
  },
  '30 dias': {
    conversas: { value: '1.250', subtitle: 'Este mês', change: '+18%' },
    mensagens: { value: '8.934', subtitle: 'Processadas', change: '+15%' },
    operadores: { value: '12', subtitle: 'Ativos', change: '+2' },
    taxaResposta: { value: '94%', subtitle: 'Média', change: '+3%' },
    tempoMedio: { value: '2.5min', subtitle: 'Resposta', change: '-0.5min' }
  },
  '3 meses': {
    conversas: { value: '4.520', subtitle: 'Últimos 3 meses', change: '+45%' },
    mensagens: { value: '32.450', subtitle: 'Processadas', change: '+38%' },
    operadores: { value: '14', subtitle: 'Máximo ativo', change: '+4' },
    taxaResposta: { value: '91%', subtitle: 'Média', change: '+5%' },
    tempoMedio: { value: '3.1min', subtitle: 'Resposta', change: '-0.8min' }
  }
};

// Chart data by period
const conversationTrendByPeriod: Record<Period, { day: string; conversas: number }[]> = {
  '7 dias': [
    { day: 'Seg', conversas: 35 },
    { day: 'Ter', conversas: 42 },
    { day: 'Qua', conversas: 38 },
    { day: 'Qui', conversas: 51 },
    { day: 'Sex', conversas: 48 },
    { day: 'Sáb', conversas: 32 },
    { day: 'Dom', conversas: 41 }
  ],
  '30 dias': [
    { day: 'Sem 1', conversas: 280 },
    { day: 'Sem 2', conversas: 320 },
    { day: 'Sem 3', conversas: 295 },
    { day: 'Sem 4', conversas: 355 }
  ],
  '3 meses': [
    { day: 'Jan', conversas: 1200 },
    { day: 'Fev', conversas: 1450 },
    { day: 'Mar', conversas: 1870 }
  ]
};

const timeDistributionByPeriod: Record<Period, { range: string; count: number }[]> = {
  '7 dias': [
    { range: '0-1min', count: 54 },
    { range: '1-2min', count: 42 },
    { range: '2-3min', count: 35 },
    { range: '3-5min', count: 28 },
    { range: '5+min', count: 18 }
  ],
  '30 dias': [
    { range: '0-1min', count: 234 },
    { range: '1-2min', count: 180 },
    { range: '2-3min', count: 150 },
    { range: '3-5min', count: 120 },
    { range: '5+min', count: 80 }
  ],
  '3 meses': [
    { range: '0-1min', count: 890 },
    { range: '1-2min', count: 720 },
    { range: '2-3min', count: 580 },
    { range: '3-5min', count: 450 },
    { range: '5+min', count: 320 }
  ]
};

const topOperadoresByPeriod: Record<Period, { rank: number; name: string; conversations: number; percentage: number }[]> = {
  '7 dias': [
    { rank: 1, name: 'Maria Santos', conversations: 45, percentage: 96 },
    { rank: 2, name: 'João Silva', conversations: 38, percentage: 92 },
    { rank: 3, name: 'Pedro Costa', conversations: 32, percentage: 89 }
  ],
  '30 dias': [
    { rank: 1, name: 'Maria Santos', conversations: 180, percentage: 95 },
    { rank: 2, name: 'João Silva', conversations: 165, percentage: 91 },
    { rank: 3, name: 'Pedro Costa', conversations: 142, percentage: 88 },
    { rank: 4, name: 'Ana Lima', conversations: 128, percentage: 94 },
    { rank: 5, name: 'Carlos Souza', conversations: 110, percentage: 86 }
  ],
  '3 meses': [
    { rank: 1, name: 'Maria Santos', conversations: 520, percentage: 94 },
    { rank: 2, name: 'João Silva', conversations: 485, percentage: 90 },
    { rank: 3, name: 'Pedro Costa', conversations: 410, percentage: 87 },
    { rank: 4, name: 'Ana Lima', conversations: 380, percentage: 93 },
    { rank: 5, name: 'Carlos Souza', conversations: 350, percentage: 85 }
  ]
};

// Integration status
const integrationStatus = [
  { label: 'WhatsApp', status: '3/3', color: 'bg-cs-success' },
  { label: 'MCP', status: '1.250 docs', color: 'bg-cs-cyan' },
  { label: 'RAG', status: '450 FAQs', color: 'bg-cs-cyan' },
  { label: 'Tokens', status: '45%', color: 'bg-cs-warning' }
];

// Critical alerts
const alertsCriticos = [
  { message: 'Taxa de resposta baixa em horário comercial (35%)', action: 'Resolver →' },
  { message: 'Tokens OpenAI em 45% (limite próximo)', action: 'Aumentar →' }
];

// Opportunities
const oportunidades = [
  { value: '+R$ 1.200/mês', description: 'Aumentar FAQ de 450 para 600 itens' },
  { value: '+R$ 850/mês', description: 'Ativar resposta automática para 5 categorias' }
];

// Automations
const automacoes = [
  { name: 'Resposta FAQ', status: 'Ativa' },
  { name: 'Escalação', status: 'Ativa' },
  { name: 'Feedback', status: 'Pausada' }
];

// Quick actions
const quickActions = [
  { label: 'Chat', icon: MessageSquare, to: '/tenant/chat', color: 'text-cs-cyan' },
  { label: 'Calendário', icon: Calendar, to: '/tenant/calendar', color: 'text-purple-400' },
  { label: 'Automações', icon: Bot, to: '/tenant/automations', color: 'text-cs-success' }
];

export function TenantDashboardTab() {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('30 dias');

  // Get data based on selected period
  const metricsData = metricsDataByPeriod[selectedPeriod];
  const conversationTrendData = conversationTrendByPeriod[selectedPeriod];
  const timeDistributionData = timeDistributionByPeriod[selectedPeriod];
  const topOperadores = topOperadoresByPeriod[selectedPeriod];

  return (
    <div className="space-y-6">
      {/* Quick Actions + Integration Status */}
      <div className="bg-cs-bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-cs-text-secondary">Acesso rápido:</span>
            {quickActions.map((action) => (
              <Link key={action.label} to={action.to}>
                <Button variant="outline" size="sm" className="border-border hover:border-cs-cyan/50">
                  <action.icon className={`w-4 h-4 mr-2 ${action.color}`} />
                  {action.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* Integration Status */}
          <div className="flex items-center gap-4 text-sm">
            {integrationStatus.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="text-cs-text-secondary">{item.label}: {item.status}</span>
                <SettingsIcon className="w-3 h-3 text-cs-text-muted cursor-pointer hover:text-cs-cyan" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-cs-text-secondary">Período:</span>
        {periodOptions.map((period) => (
          <Button 
            key={period}
            variant={selectedPeriod === period ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
            className={selectedPeriod === period ? 'bg-cs-cyan text-white' : 'border-border text-cs-text-secondary hover:text-cs-text-primary'}
          >
            {period}
          </Button>
        ))}
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {(Object.entries(metricsData) as [string, MetricItem][]).map(([key, data]) => (
          <div key={key} className="bg-cs-bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-cs-text-secondary capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
            <p className="text-3xl font-bold text-cs-text-primary mt-1">{data.value}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-cs-text-muted">{data.subtitle}</p>
              <p className={`text-xs font-medium ${data.change.startsWith('+') ? 'text-cs-success' : data.change.startsWith('-') ? 'text-cs-error' : 'text-cs-text-muted'}`}>
                {data.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversation Trend */}
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-cs-text-primary mb-2">Tendência de Conversas</h3>
          <p className="text-xs text-cs-text-muted mb-4">Volume no período selecionado</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={conversationTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--cs-text-muted))" fontSize={12} />
              <YAxis stroke="hsl(var(--cs-text-muted))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--cs-bg-card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Line type="monotone" dataKey="conversas" stroke="hsl(var(--cs-cyan))" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Time Distribution */}
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold text-cs-text-primary mb-2">Tempo de Resposta</h3>
          <p className="text-xs text-cs-text-muted mb-4">Distribuição por faixa de tempo</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={timeDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="range" stroke="hsl(var(--cs-text-muted))" fontSize={12} />
              <YAxis stroke="hsl(var(--cs-text-muted))" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--cs-bg-card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="count" fill="hsl(var(--cs-cyan))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts + Opportunities Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts Section */}
        <div className="bg-cs-bg-card border border-cs-error/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-cs-error" />
            <h3 className="font-semibold text-cs-error">Alertas Críticos</h3>
          </div>
          {alertsCriticos.length > 0 ? (
            <ul className="space-y-2">
              {alertsCriticos.map((alert, idx) => (
                <li key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-cs-text-secondary">• {alert.message}</span>
                  <button className="text-cs-cyan hover:underline text-xs">{alert.action}</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-cs-text-muted">Nenhum alerta crítico</p>
          )}
        </div>

        {/* Opportunities Section */}
        <div className="bg-cs-bg-card border border-cs-success/30 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-cs-success" />
            <h3 className="font-semibold text-cs-success">Oportunidades de Ganho</h3>
          </div>
          <ul className="space-y-2">
            {oportunidades.map((item, idx) => (
              <li key={idx} className="text-sm">
                <span className="text-cs-success font-medium">{item.value}:</span>{' '}
                <span className="text-cs-text-secondary">{item.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Top Operators + Automations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Operators */}
        <div className="lg:col-span-2 bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-cs-text-primary">Top Operadores</h3>
            <span className="text-xs text-cs-text-muted">Por taxa de resposta</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {topOperadores.slice(0, 6).map((op) => (
              <div key={op.rank} className="flex items-center gap-3 p-2 rounded-lg bg-cs-bg-primary/50">
                <span className="w-7 h-7 flex items-center justify-center bg-cs-cyan text-white text-xs rounded-full font-bold">
                  {op.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-cs-text-primary truncate">{op.name}</p>
                  <p className="text-xs text-cs-text-muted">{op.conversations} conv</p>
                </div>
                <span className="text-cs-success font-semibold text-sm">{op.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Automations */}
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-cs-cyan" />
              <h3 className="font-semibold text-cs-text-primary">Automações</h3>
            </div>
            <Link to="/tenant/automations">
              <Button variant="ghost" size="sm" className="text-cs-cyan hover:text-cs-cyan/80 h-6 px-2">
                Ver todas <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
          <ul className="space-y-3">
            {automacoes.map((auto) => (
              <li key={auto.name} className="flex items-center justify-between p-2 rounded-lg bg-cs-bg-primary/50">
                <span className="text-sm text-cs-text-primary">{auto.name}</span>
                <StatusPill 
                  status={auto.status === 'Ativa' ? 'success' : 'warning'} 
                  label={auto.status} 
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
