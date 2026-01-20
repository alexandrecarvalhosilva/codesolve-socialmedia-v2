import { CreditTransaction, formatPrice } from '@/types/billing';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Clock, 
  RotateCcw,
  Settings,
  Gift,
  Wallet
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CreditsCardProps {
  balance: number;
  currency?: string;
  transactions: CreditTransaction[];
  showFullHistory?: boolean;
}

const typeConfig = {
  earned: { label: 'Recebido', icon: ArrowUpCircle, color: 'text-green-500' },
  spent: { label: 'Utilizado', icon: ArrowDownCircle, color: 'text-orange-500' },
  expired: { label: 'Expirado', icon: Clock, color: 'text-gray-500' },
  refund: { label: 'Reembolso', icon: RotateCcw, color: 'text-purple-500' },
  adjustment: { label: 'Ajuste', icon: Settings, color: 'text-blue-500' },
};

const referenceTypeLabels = {
  plan_change: 'Mudança de Plano',
  cancellation: 'Cancelamento',
  refund: 'Reembolso',
  manual: 'Ajuste Manual',
  promotion: 'Promoção',
};

export function CreditsCard({ 
  balance, 
  currency = 'BRL', 
  transactions,
  showFullHistory = false 
}: CreditsCardProps) {
  const displayTransactions = showFullHistory ? transactions : transactions.slice(0, 5);

  return (
    <Card className="bg-cs-bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Créditos
            </CardTitle>
            <CardDescription>Saldo disponível para uso em próximas faturas</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-foreground">
              {formatPrice(balance, currency)}
            </p>
            <p className="text-sm text-muted-foreground">Saldo disponível</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Gift className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Nenhuma transação de crédito</p>
            <p className="text-sm text-muted-foreground mt-1">
              Créditos são gerados em downgrades e cancelamentos
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              {showFullHistory ? 'Histórico Completo' : 'Transações Recentes'}
            </h4>
            {displayTransactions.map((transaction) => {
              const config = typeConfig[transaction.type];
              const Icon = config.icon;
              const isPositive = transaction.amount > 0;

              return (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 p-3 bg-cs-bg-primary rounded-lg"
                >
                  <div className={`p-2 rounded-lg bg-background`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">
                        {transaction.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs">
                        {referenceTypeLabels[transaction.referenceType]}
                      </Badge>
                      {transaction.expiresAt && (
                        <span className="text-xs text-muted-foreground">
                          Expira em {format(new Date(transaction.expiresAt), 'dd/MM/yyyy')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`font-semibold ${isPositive ? 'text-green-500' : 'text-orange-500'}`}>
                      {isPositive ? '+' : ''}{formatPrice(transaction.amount)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.createdAt), 'dd/MM/yy', { locale: ptBR })}
                    </p>
                  </div>
                </div>
              );
            })}

            {!showFullHistory && transactions.length > 5 && (
              <p className="text-sm text-center text-muted-foreground pt-2">
                Mostrando 5 de {transactions.length} transações
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}