import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  AlertTriangle, 
  Clock, 
  X,
  ChevronRight,
  Bell,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useSoundNotification } from '@/hooks/useSoundNotification';
import { useUrgentTickets } from '@/hooks/useSupport';

interface UrgentTicket {
  id: string;
  title: string;
  tenantName: string;
  slaLevel: string;
  timeRemaining: number; // in minutes
  priority: 'high' | 'critical';
  type: 'response' | 'resolution';
  isNew?: boolean;
}

export function SLAUrgentAlerts() {
  const { urgentTickets, isLoading, fetchUrgentTickets } = useUrgentTickets();
  const [tickets, setTickets] = useState<UrgentTicket[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const { playSound, isMuted, toggleMute } = useSoundNotification();
  const previousTicketIdsRef = useRef<Set<string>>(new Set());
  const playedAlertsRef = useRef<Set<string>>(new Set());

  // Fetch urgent tickets on mount
  useEffect(() => {
    fetchUrgentTickets();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUrgentTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  // Update local state when data changes
  useEffect(() => {
    if (urgentTickets.length > 0) {
      setTickets(urgentTickets.map(t => ({
        ...t,
        isNew: !previousTicketIdsRef.current.has(t.id)
      })));
      urgentTickets.forEach(t => previousTicketIdsRef.current.add(t.id));
    }
  }, [urgentTickets]);

  // Play sound for new tickets and SLA violations
  useEffect(() => {
    const visibleTickets = tickets.filter(t => !dismissed.includes(t.id) && t.timeRemaining > 0);
    
    visibleTickets.forEach(ticket => {
      // Check for new critical tickets
      if (ticket.isNew && ticket.priority === 'critical' && !playedAlertsRef.current.has(`new-${ticket.id}`)) {
        playSound('critical', `new-${ticket.id}`);
        playedAlertsRef.current.add(`new-${ticket.id}`);
      }
      
      // Check for SLA about to violate (30 minutes or less)
      if (ticket.timeRemaining <= 30 && !playedAlertsRef.current.has(`sla-critical-${ticket.id}`)) {
        playSound('critical', `sla-critical-${ticket.id}`);
        playedAlertsRef.current.add(`sla-critical-${ticket.id}`);
      } 
      // Warning at 60 minutes
      else if (ticket.timeRemaining <= 60 && ticket.timeRemaining > 30 && !playedAlertsRef.current.has(`sla-warning-${ticket.id}`)) {
        playSound('warning', `sla-warning-${ticket.id}`);
        playedAlertsRef.current.add(`sla-warning-${ticket.id}`);
      }
    });
  }, [tickets, dismissed, playSound]);

  // Simulate real-time countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTickets(prev => prev.map(ticket => ({
        ...ticket,
        timeRemaining: Math.max(0, ticket.timeRemaining - 1),
        isNew: false, // Remove new flag after first render
      })));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const visibleTickets = tickets.filter(t => !dismissed.includes(t.id) && t.timeRemaining > 0);

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (visibleTickets.length === 0) return null;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const getUrgencyLevel = (minutes: number) => {
    if (minutes <= 30) return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/50', pulse: true };
    if (minutes <= 60) return { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/50', pulse: true };
    return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/50', pulse: false };
  };

  const getProgressValue = (minutes: number, type: 'response' | 'resolution') => {
    // Assume max times: response = 8h (480min), resolution = 24h (1440min)
    const maxTime = type === 'response' ? 480 : 1440;
    return Math.max(0, (1 - minutes / maxTime) * 100);
  };

  return (
    <TooltipProvider>
      <Card className="bg-card border-red-500/30 shadow-lg shadow-red-500/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground flex items-center gap-2">
              <div className="relative">
                <Bell className="w-5 h-5 text-red-400" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
              </div>
              Alertas de SLA Urgentes
            </CardTitle>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      isMuted ? "text-muted-foreground" : "text-green-400"
                    )}
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isMuted ? 'Ativar notificações sonoras' : 'Silenciar notificações'}
                </TooltipContent>
              </Tooltip>
              <Badge className="bg-red-500/20 text-red-400 border-0">
                {visibleTickets.length} tickets
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
        {visibleTickets.map(ticket => {
          const urgency = getUrgencyLevel(ticket.timeRemaining);
          const progress = getProgressValue(ticket.timeRemaining, ticket.type);
          
          return (
            <div
              key={ticket.id}
              className={cn(
                "relative p-4 rounded-lg border transition-all",
                urgency.bg,
                urgency.border,
                urgency.pulse && "animate-pulse"
              )}
            >
              {/* Dismiss button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setDismissed(prev => [...prev, ticket.id])}
              >
                <X className="w-4 h-4" />
              </Button>

              <div className="pr-8">
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className={cn("w-4 h-4", urgency.color)} />
                  <span className="text-xs text-muted-foreground">#{ticket.id}</span>
                  <Badge variant="outline" className="text-xs">
                    {ticket.tenantName}
                  </Badge>
                  <Badge className={cn("text-xs", urgency.bg, urgency.color)}>
                    {ticket.priority === 'critical' ? 'Crítico' : 'Alta'}
                  </Badge>
                </div>

                {/* Title */}
                <h4 className="font-medium text-foreground text-sm mb-2 truncate">
                  {ticket.title}
                </h4>

                {/* Time remaining */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {ticket.type === 'response' ? 'Primeira resposta' : 'Resolução'}:
                    </span>
                    <span className={cn("font-bold", urgency.color)}>
                      {formatTime(ticket.timeRemaining)} restantes
                    </span>
                  </div>
                  <Progress 
                    value={progress} 
                    className={cn(
                      "h-1.5",
                      progress > 80 && "[&>div]:bg-red-500",
                      progress > 60 && progress <= 80 && "[&>div]:bg-orange-500",
                      progress <= 60 && "[&>div]:bg-yellow-500"
                    )}
                  />
                </div>

                {/* Action */}
                <Link 
                  to="/support"
                  className={cn(
                    "flex items-center gap-1 text-xs mt-3 font-medium hover:underline",
                    urgency.color
                  )}
                >
                  Atender agora
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </CardContent>
      </Card>
    </TooltipProvider>
  );
}
