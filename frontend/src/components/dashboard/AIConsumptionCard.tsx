import { Brain, Zap, DollarSign, Clock, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getGlobalAIMetrics, formatTokens, formatCurrency } from '@/data/aiConsumptionMockData';

export function AIConsumptionCard() {
  const metrics = getGlobalAIMetrics();

  return (
    <div className="bg-cs-bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-cs-text-primary">Consumo OpenAI</h3>
            <p className="text-xs text-cs-text-muted">Visão Global</p>
          </div>
        </div>
        <Link 
          to="/ai-overview" 
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          Ver detalhes
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-cs-bg-primary/50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-primary" />
            <p className="text-xs text-cs-text-secondary">Tokens Hoje</p>
          </div>
          <p className="text-xl font-bold text-cs-text-primary">{formatTokens(metrics.totalTokensToday)}</p>
          <p className="text-xs text-cs-text-muted">de {formatTokens(metrics.totalTokensMonth)} mês</p>
        </div>
        
        <div className="bg-cs-bg-primary/50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="w-3 h-3 text-cs-success" />
            <p className="text-xs text-cs-text-secondary">Custo Hoje</p>
          </div>
          <p className="text-xl font-bold text-cs-success">{formatCurrency(metrics.estimatedCostToday)}</p>
          <p className="text-xs text-cs-text-muted">de {formatCurrency(metrics.estimatedCostMonth)} mês</p>
        </div>
        
        <div className="bg-cs-bg-primary/50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-cs-cyan" />
            <p className="text-xs text-cs-text-secondary">Mensagens Hoje</p>
          </div>
          <p className="text-xl font-bold text-cs-text-primary">{metrics.totalMessagesToday}</p>
          <p className="text-xs text-cs-text-muted">{metrics.activeTenantsToday} tenants ativos</p>
        </div>
        
        <div className="bg-cs-bg-primary/50 rounded-lg p-3">
          <div className="flex items-center gap-1 mb-1">
            <Clock className="w-3 h-3 text-cs-warning" />
            <p className="text-xs text-cs-text-secondary">Resp. Média</p>
          </div>
          <p className="text-xl font-bold text-cs-text-primary">{(metrics.avgResponseTime / 1000).toFixed(1)}s</p>
          <p className="text-xs text-cs-text-muted">Modelo: {metrics.topModel}</p>
        </div>
      </div>
    </div>
  );
}
