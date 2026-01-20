import { PlanChangeHistory, formatPrice, PLAN_CHANGE_TYPE_CONFIG } from '@/types/billing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUp, 
  ArrowDown, 
  RefreshCw, 
  XCircle, 
  Play,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PlanChangeHistoryTableProps {
  history: PlanChangeHistory[];
  showTenantName?: boolean;
}

const changeTypeIcons = {
  upgrade: ArrowUp,
  downgrade: ArrowDown,
  renewal: RefreshCw,
  cancellation: XCircle,
  reactivation: Play,
};

const statusConfig = {
  pending: { label: 'Pendente', icon: Clock, color: 'bg-yellow-500' },
  completed: { label: 'Concluído', icon: CheckCircle, color: 'bg-green-500' },
  failed: { label: 'Falhou', icon: AlertTriangle, color: 'bg-red-500' },
  refunded: { label: 'Reembolsado', icon: RefreshCw, color: 'bg-purple-500' },
};

export function PlanChangeHistoryTable({ history, showTenantName = false }: PlanChangeHistoryTableProps) {
  if (history.length === 0) {
    return (
      <Card className="bg-cs-bg-card border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <RefreshCw className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nenhuma alteração de plano registrada</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-cs-bg-card border-border">
      <CardHeader>
        <CardTitle>Histórico de Alterações de Plano</CardTitle>
        <CardDescription>Todas as mudanças de plano, upgrades, downgrades e cancelamentos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((change) => {
            const typeConfig = PLAN_CHANGE_TYPE_CONFIG[change.changeType];
            const TypeIcon = changeTypeIcons[change.changeType];
            const StatusConfig = statusConfig[change.status];
            const StatusIcon = StatusConfig.icon;

            return (
              <div
                key={change.id}
                className="flex items-start gap-4 p-4 bg-cs-bg-primary rounded-lg border border-border"
              >
                {/* Ícone do tipo */}
                <div className={`p-2 rounded-lg ${typeConfig.color}/20`}>
                  <TypeIcon className={`h-5 w-5 ${typeConfig.color.replace('bg-', 'text-')}`} />
                </div>

                {/* Conteúdo principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`${typeConfig.color} text-white`}>
                      {typeConfig.label}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <StatusIcon className="h-3 w-3" />
                      {StatusConfig.label}
                    </Badge>
                    {showTenantName && (
                      <span className="text-sm font-medium text-foreground">
                        {change.tenantName}
                      </span>
                    )}
                  </div>

                  {/* Descrição da mudança */}
                  <div className="mt-2">
                    {change.changeType === 'cancellation' ? (
                      <p className="text-foreground">
                        Cancelamento do plano <span className="font-semibold">{change.fromPlanName}</span>
                      </p>
                    ) : change.changeType === 'renewal' ? (
                      <p className="text-foreground">
                        Renovação do plano <span className="font-semibold">{change.fromPlanName}</span>
                      </p>
                    ) : (
                      <p className="text-foreground">
                        De <span className="font-semibold">{change.fromPlanName}</span>
                        {' → '}
                        <span className="font-semibold">{change.toPlanName}</span>
                      </p>
                    )}

                    {change.reason && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Motivo: {change.reason}
                      </p>
                    )}
                  </div>

                  {/* Valores */}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    {change.proratedAmount !== 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Valor proporcional:</span>
                        <span className={change.proratedAmount > 0 ? 'text-green-500 font-medium' : 'text-orange-500 font-medium'}>
                          {change.proratedAmount > 0 ? '+' : ''}{formatPrice(change.proratedAmount)}
                        </span>
                      </div>
                    )}
                    {change.creditsApplied > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Créditos aplicados:</span>
                        <span className="text-blue-500 font-medium">
                          -{formatPrice(change.creditsApplied)}
                        </span>
                      </div>
                    )}
                    {change.creditsGenerated > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Créditos gerados:</span>
                        <span className="text-purple-500 font-medium">
                          +{formatPrice(change.creditsGenerated)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Data */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-foreground">
                    {format(new Date(change.effectiveDate), 'dd MMM yyyy', { locale: ptBR })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(change.effectiveDate), 'HH:mm', { locale: ptBR })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}