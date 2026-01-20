import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, TrendingUp, TrendingDown, RefreshCw, Bell, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { 
  getMetricsWithThresholds, 
  ModuleMetric,
  getModuleById
} from '@/config/moduleRegistry';

interface MetricAlert {
  metricId: string;
  moduleId: string;
  moduleName: string;
  metricName: string;
  currentValue: number;
  threshold: number;
  thresholdType: 'warning' | 'critical';
  direction: 'above' | 'below';
  unit?: string;
  timestamp: Date;
}

// Simulação de valores atuais das métricas (em produção viria de uma API)
const simulateMetricValues = (): Map<string, number> => {
  const values = new Map<string, number>();
  
  // Instagram
  values.set('instagram_engagement_rate', 1.5); // Critical: below 1%
  values.set('instagram_dm_pending', 65); // Critical: above 50
  values.set('instagram_post_success_rate', 92); // Warning: below 95%
  values.set('instagram_avg_response_time', 200); // Critical: above 180 min
  values.set('instagram_follower_growth', -8); // Warning: below -5%
  
  // Chat
  values.set('chat_waiting_customers', 12); // Warning: above 5
  values.set('chat_avg_wait_time', 18); // Critical: above 15 min
  values.set('chat_csat_score', 72); // Warning: below 80%
  values.set('chat_first_contact_resolution', 55); // Critical: below 50%
  values.set('chat_agent_utilization', 95); // Warning: above 90%
  
  // Finance
  values.set('finance_churn_rate', 7); // Warning: above 5%
  values.set('finance_overdue_amount', 35000); // Warning: above 10000
  values.set('finance_payment_success_rate', 88); // Critical: below 90%
  
  // AI
  values.set('ai_quota_usage', 92); // Warning: above 80%
  values.set('ai_avg_response_time', 12000); // Critical: above 10000 ms
  
  // Support
  values.set('support_sla_compliance', 82); // Warning: below 90%
  
  // System
  values.set('system_uptime', 96); // Warning: below 99%
  
  return values;
};

const checkThreshold = (
  value: number, 
  metric: ModuleMetric & { moduleId: string }
): MetricAlert | null => {
  if (!metric.thresholds) return null;
  
  const { warning, critical, direction } = metric.thresholds;
  const module = getModuleById(metric.moduleId);
  
  let thresholdType: 'warning' | 'critical' | null = null;
  let threshold: number = 0;
  
  if (direction === 'above') {
    if (value >= critical) {
      thresholdType = 'critical';
      threshold = critical;
    } else if (value >= warning) {
      thresholdType = 'warning';
      threshold = warning;
    }
  } else {
    if (value <= critical) {
      thresholdType = 'critical';
      threshold = critical;
    } else if (value <= warning) {
      thresholdType = 'warning';
      threshold = warning;
    }
  }
  
  if (!thresholdType) return null;
  
  return {
    metricId: metric.id,
    moduleId: metric.moduleId,
    moduleName: module?.name || metric.moduleId,
    metricName: metric.name,
    currentValue: value,
    threshold,
    thresholdType,
    direction,
    unit: metric.unit,
    timestamp: new Date(),
  };
};

export function MetricAlertsCard() {
  const [alerts, setAlerts] = useState<MetricAlert[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const refreshAlerts = () => {
    setIsRefreshing(true);
    
    const metricsWithThresholds = getMetricsWithThresholds();
    const currentValues = simulateMetricValues();
    const newAlerts: MetricAlert[] = [];
    
    metricsWithThresholds.forEach(metric => {
      const value = currentValues.get(metric.id);
      if (value !== undefined) {
        const alert = checkThreshold(value, metric);
        if (alert) {
          newAlerts.push(alert);
        }
      }
    });
    
    // Ordenar: critical primeiro, depois warning
    newAlerts.sort((a, b) => {
      if (a.thresholdType === 'critical' && b.thresholdType === 'warning') return -1;
      if (a.thresholdType === 'warning' && b.thresholdType === 'critical') return 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });
    
    setAlerts(newAlerts);
    setLastUpdate(new Date());
    
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    refreshAlerts();
    
    // Atualizar a cada 30 segundos
    const interval = setInterval(refreshAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const criticalCount = alerts.filter(a => a.thresholdType === 'critical').length;
  const warningCount = alerts.filter(a => a.thresholdType === 'warning').length;

  const formatValue = (value: number, unit?: string) => {
    if (unit === '%') return `${value.toFixed(1)}%`;
    if (unit === 'R$') return `R$ ${value.toLocaleString('pt-BR')}`;
    if (unit === 'min') return `${value} min`;
    if (unit === 'ms') return `${value.toLocaleString()} ms`;
    if (unit === 'hours') return `${value}h`;
    if (unit === 'sec') return `${value}s`;
    return value.toString();
  };

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Alertas de Métricas</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {criticalCount} crítico{criticalCount > 1 ? 's' : ''}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="outline" className="gap-1 border-yellow-500/50 text-yellow-600 dark:text-yellow-400">
                <AlertTriangle className="h-3 w-3" />
                {warningCount} aviso{warningCount > 1 ? 's' : ''}
              </Badge>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={refreshAlerts}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Atualizar métricas</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Última atualização: {lastUpdate.toLocaleTimeString('pt-BR')}
        </p>
      </CardHeader>
      
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
              <Bell className="h-6 w-6 text-green-500" />
            </div>
            <p className="text-sm font-medium text-foreground">Tudo em ordem!</p>
            <p className="text-xs text-muted-foreground">Nenhuma métrica com threshold violado</p>
          </div>
        ) : (
          <ScrollArea className="h-[280px] pr-4">
            <div className="space-y-3">
              {alerts.map((alert, index) => (
                <div 
                  key={`${alert.metricId}-${index}`}
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    alert.thresholdType === 'critical' 
                      ? 'bg-destructive/5 border-destructive/30 hover:bg-destructive/10'
                      : 'bg-yellow-500/5 border-yellow-500/30 hover:bg-yellow-500/10'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className={cn(
                        "mt-0.5 p-1 rounded",
                        alert.thresholdType === 'critical' 
                          ? 'bg-destructive/20 text-destructive'
                          : 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                      )}>
                        {alert.thresholdType === 'critical' 
                          ? <AlertCircle className="h-4 w-4" />
                          : <AlertTriangle className="h-4 w-4" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{alert.metricName}</p>
                        <p className="text-xs text-muted-foreground">{alert.moduleName}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        {alert.direction === 'above' 
                          ? <TrendingUp className="h-3 w-3 text-destructive" />
                          : <TrendingDown className="h-3 w-3 text-destructive" />
                        }
                        <span className={cn(
                          "text-sm font-bold",
                          alert.thresholdType === 'critical' ? 'text-destructive' : 'text-yellow-600 dark:text-yellow-400'
                        )}>
                          {formatValue(alert.currentValue, alert.unit)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Limite: {formatValue(alert.threshold, alert.unit)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
