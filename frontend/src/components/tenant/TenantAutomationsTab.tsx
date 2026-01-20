import { 
  Bot,
  Play,
  Pause,
  Settings,
  Plus,
  Trash2,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const automations = [
  {
    id: '1',
    name: 'Resposta FAQ',
    description: 'Responde automaticamente perguntas frequentes usando a base RAG',
    status: 'active',
    triggers: 12450,
    lastRun: '2 min atrás'
  },
  {
    id: '2',
    name: 'Escalação Automática',
    description: 'Escala conversas para operadores quando a IA não consegue resolver',
    status: 'active',
    triggers: 234,
    lastRun: '15 min atrás'
  },
  {
    id: '3',
    name: 'Feedback de Satisfação',
    description: 'Envia pesquisa de satisfação após encerramento da conversa',
    status: 'paused',
    triggers: 890,
    lastRun: '1 dia atrás'
  },
  {
    id: '4',
    name: 'Lembrete de Agendamento',
    description: 'Envia lembretes 24h e 1h antes de eventos agendados',
    status: 'active',
    triggers: 456,
    lastRun: '30 min atrás'
  },
  {
    id: '5',
    name: 'Boas-vindas Novo Contato',
    description: 'Mensagem de boas-vindas para novos contatos',
    status: 'active',
    triggers: 89,
    lastRun: '5 min atrás'
  }
];

export function TenantAutomationsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-cs-text-primary">Automações</h2>
          <p className="text-sm text-cs-text-secondary">Gerencie fluxos automatizados para este tenant</p>
        </div>
        <Button className="bg-cs-cyan text-white">
          <Plus className="w-4 h-4 mr-2" />
          Nova Automação
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-cs-cyan" />
            <span className="text-sm text-cs-text-secondary">Total Ativas</span>
          </div>
          <p className="text-2xl font-bold text-cs-text-primary">4</p>
        </div>
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Pause className="w-4 h-4 text-cs-warning" />
            <span className="text-sm text-cs-text-secondary">Pausadas</span>
          </div>
          <p className="text-2xl font-bold text-cs-text-primary">1</p>
        </div>
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-cs-success" />
            <span className="text-sm text-cs-text-secondary">Execuções (24h)</span>
          </div>
          <p className="text-2xl font-bold text-cs-text-primary">14.119</p>
        </div>
        <div className="bg-cs-bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-cs-text-muted" />
            <span className="text-sm text-cs-text-secondary">Última Execução</span>
          </div>
          <p className="text-2xl font-bold text-cs-text-primary">2 min</p>
        </div>
      </div>

      {/* Automations List */}
      <div className="space-y-4">
        {automations.map((automation) => (
          <div 
            key={automation.id}
            className="bg-cs-bg-card border border-border rounded-xl p-4 hover:border-cs-cyan/30 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  automation.status === 'active' ? 'bg-cs-success/10' : 'bg-cs-warning/10'
                }`}>
                  <Bot className={`w-5 h-5 ${
                    automation.status === 'active' ? 'text-cs-success' : 'text-cs-warning'
                  }`} />
                </div>
                <div>
                  <h3 className="font-medium text-cs-text-primary">{automation.name}</h3>
                  <p className="text-sm text-cs-text-secondary">{automation.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-cs-text-secondary">{automation.triggers.toLocaleString()} execuções</p>
                  <p className="text-xs text-cs-text-muted">Última: {automation.lastRun}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch 
                    checked={automation.status === 'active'}
                    className="data-[state=checked]:bg-cs-success"
                  />
                  <Button variant="ghost" size="icon" className="text-cs-text-muted hover:text-cs-text-primary">
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-cs-text-muted hover:text-cs-error">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
