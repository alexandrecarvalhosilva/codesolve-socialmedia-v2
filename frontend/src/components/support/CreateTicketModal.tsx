import { useState } from 'react';
import { Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { TicketCategory, TicketPriority, categoryConfig, priorityConfig } from '@/types/support';
import { useToast } from '@/hooks/use-toast';

interface CreateTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateTicketModal({ open, onOpenChange }: CreateTicketModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as TicketCategory | '',
    priority: 'medium' as TicketPriority,
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast({ title: "Erro", description: "Título é obrigatório", variant: "destructive" });
      return;
    }
    if (!formData.category) {
      toast({ title: "Erro", description: "Selecione uma categoria", variant: "destructive" });
      return;
    }
    if (!formData.description.trim()) {
      toast({ title: "Erro", description: "Descrição é obrigatória", variant: "destructive" });
      return;
    }

    // Mock: In real app, would create ticket via API
    toast({ 
      title: "Ticket criado!", 
      description: `Seu ticket foi aberto com sucesso. Em breve você receberá uma resposta.` 
    });
    
    setFormData({ title: '', description: '', category: '', priority: 'medium' });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" />
            Novo Ticket de Suporte
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Descreva seu problema ou dúvida e nossa equipe entrará em contato
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-muted-foreground">Título</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-muted border-border text-foreground mt-1"
              placeholder="Resumo do problema"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Categoria</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as TicketCategory }))}
              >
                <SelectTrigger className="bg-muted border-border mt-1">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(categoryConfig) as TicketCategory[]).map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {categoryConfig[cat].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-muted-foreground">Prioridade</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as TicketPriority }))}
              >
                <SelectTrigger className="bg-muted border-border mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(priorityConfig) as TicketPriority[]).map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {priorityConfig[priority].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-muted-foreground">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-muted border-border text-foreground mt-1 min-h-[120px]"
              placeholder="Descreva detalhadamente o seu problema ou dúvida..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="border-border"
          >
            Cancelar
          </Button>
          <Button 
            className="bg-gradient-to-r from-primary to-accent"
            onClick={handleSubmit}
          >
            Abrir Ticket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
