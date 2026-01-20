import { Link } from 'react-router-dom';
import { 
  Headphones, 
  AlertTriangle, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { slaMetrics } from '@/data/supportMockData';
import { cn } from '@/lib/utils';

export function SupportSummaryCard() {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-foreground flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" />
            Central de Suporte
          </CardTitle>
          <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
            <Link to="/support">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-xs text-muted-foreground">Em Aberto</span>
            </div>
            <p className="text-2xl font-bold text-yellow-400">{slaMetrics.openTickets}</p>
          </div>
          
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-muted-foreground">SLA Violado</span>
            </div>
            <p className="text-2xl font-bold text-red-400">{slaMetrics.breachedTickets}</p>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Taxa de Conformidade SLA
            </span>
            <span className={cn(
              "font-medium",
              slaMetrics.slaComplianceRate >= 90 ? "text-green-400" : "text-yellow-400"
            )}>
              {slaMetrics.slaComplianceRate}%
            </span>
          </div>
          <Progress value={slaMetrics.slaComplianceRate} className="h-2" />
        </div>

        {/* Today's Stats */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span className="text-sm text-muted-foreground">Resolvidos hoje</span>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border-0">
            {slaMetrics.resolvedToday} tickets
          </Badge>
        </div>

        {/* Response Time */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Tempo médio de resposta</span>
          <span className="font-medium text-foreground">{slaMetrics.avgResponseTime}h</span>
        </div>
      </CardContent>
    </Card>
  );
}
