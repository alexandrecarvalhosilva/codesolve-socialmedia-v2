import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Clock, 
  User, 
  Building, 
  Send,
  UserCheck,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ticket, priorityConfig, statusConfig, TicketStatus } from '@/types/support';
import { useSLAs, useTicketActions } from '@/hooks/useSupport';
import { useUsers } from '@/hooks/useUsers';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'tenant' | 'admin';
}

export function TicketDetailModal({ ticket, open, onOpenChange, mode }: TicketDetailModalProps) {
  const { toast } = useToast();
  const [newMessage, setNewMessage] = useState('');
  const [newStatus, setNewStatus] = useState<TicketStatus | ''>('');
  const [assignedAgent, setAssignedAgent] = useState('');
  
  const { slas } = useSLAs();
  const { users: supportAgents } = useUsers({ role: 'support' });
  const { assignTicket, updateStatus, isProcessing } = useTicketActions({
    onSuccess: () => {
      toast({ title: "Ação realizada", description: "Ticket atualizado com sucesso." });
    },
    onError: (error) => {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
    }
  });

  if (!ticket) return null;

  const priority = priorityConfig[ticket.priority];
  const status = statusConfig[ticket.status];
  const sla = slas.find(s => s.id === ticket.slaLevel);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    toast({ 
      title: "Mensagem enviada", 
      description: "Sua resposta foi adicionada ao ticket." 
    });
    setNewMessage('');
  };

  const handleStatusChange = async () => {
    if (!newStatus) return;
    
    await updateStatus(ticket.id, newStatus);
    setNewStatus('');
  };

  const handleAssign = async () => {
    if (!assignedAgent) return;
    
    await assignTicket(ticket.id, assignedAgent);
    setAssignedAgent('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            Ticket #{ticket.id}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-4">
            {/* Ticket Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">{ticket.title}</h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("text-xs", priority.bgColor, priority.color)}>
                  {priority.label}
                </Badge>
                <Badge className={cn("text-xs", status.bgColor, status.color)}>
                  {status.label}
                </Badge>
                {sla && (
                  <Badge className={cn("text-xs border", sla.priority === 'urgent' ? 'text-red-400' : 'text-blue-400')}>
                    SLA: {sla.name}
                  </Badge>
                )}
                {ticket.slaBreached && (
                  <Badge className="text-xs bg-red-500/20 text-red-400">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    SLA Violado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{ticket.description}</p>
            </div>

            {/* Messages */}
            <div className="border border-border rounded-lg">
              <div className="p-3 border-b border-border bg-muted/30">
                <h4 className="text-sm font-medium text-foreground">Histórico de Mensagens</h4>
              </div>
              <ScrollArea className="h-64 p-4">
                {ticket.messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma mensagem ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ticket.messages.map(msg => (
                      <div 
                        key={msg.id}
                        className={cn(
                          "p-3 rounded-lg",
                          msg.authorRole === 'support' 
                            ? 'bg-primary/10 border border-primary/20' 
                            : 'bg-muted border border-border'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                            msg.authorRole === 'support' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted-foreground/20 text-muted-foreground'
                          )}>
                            {msg.authorName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-foreground">{msg.authorName}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(msg.createdAt)}</span>
                          {msg.authorRole === 'support' && (
                            <Badge variant="outline" className="text-xs text-primary">Suporte</Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Reply */}
            <div className="space-y-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="bg-muted border-border text-foreground min-h-[80px]"
              />
              <Button 
                className="bg-gradient-to-r from-primary to-accent"
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Resposta
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Details */}
            <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-3">
              <h4 className="text-sm font-medium text-foreground">Detalhes</h4>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Criado em:</span>
                </div>
                <p className="text-foreground pl-6">{formatDate(ticket.createdAt)}</p>
              </div>

              {mode === 'admin' && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building className="w-4 h-4" />
                    <span>Tenant:</span>
                  </div>
                  <p className="text-foreground pl-6">{ticket.tenantName}</p>
                </div>
              )}

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>Aberto por:</span>
                </div>
                <p className="text-foreground pl-6">{ticket.createdByName}</p>
              </div>

              {ticket.assignedToName && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <UserCheck className="w-4 h-4" />
                    <span>Atribuído a:</span>
                  </div>
                  <p className="text-foreground pl-6">{ticket.assignedToName}</p>
                </div>
              )}

              {ticket.firstResponseAt && (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Primeira resposta:</span>
                  </div>
                  <p className="text-foreground pl-6">{formatDate(ticket.firstResponseAt)}</p>
                </div>
              )}
            </div>

            {/* Admin Actions */}
            {mode === 'admin' && (
              <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-4">
                <h4 className="text-sm font-medium text-foreground">Ações</h4>
                
                {/* Change Status */}
                <div className="space-y-2">
                  <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TicketStatus)}>
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Alterar status..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Aberto</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="waiting_customer">Aguard. Cliente</SelectItem>
                      <SelectItem value="resolved">Resolvido</SelectItem>
                      <SelectItem value="closed">Fechado</SelectItem>
                    </SelectContent>
                  </Select>
                  {newStatus && (
                    <Button size="sm" className="w-full" onClick={handleStatusChange} disabled={isProcessing}>
                      Atualizar Status
                    </Button>
                  )}
                </div>

                {/* Assign Agent */}
                <div className="space-y-2">
                  <Select value={assignedAgent} onValueChange={setAssignedAgent}>
                    <SelectTrigger className="bg-muted border-border">
                      <SelectValue placeholder="Atribuir para..." />
                    </SelectTrigger>
                    <SelectContent>
                      {supportAgents.map(agent => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {assignedAgent && (
                    <Button size="sm" className="w-full" onClick={handleAssign} disabled={isProcessing}>
                      Atribuir Ticket
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
