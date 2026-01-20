import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageSquare, 
  Bot, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Lock, 
  Calendar, 
  Code 
} from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'WhatsApp Integrado',
    description: 'Conexão direta via Evolution API, a mais robusta do mercado',
  },
  {
    icon: Bot,
    title: 'IA Humanizada',
    description: 'GPT-4 treinada para seu nicho, respostas naturais',
  },
  {
    icon: LayoutDashboard,
    title: 'Chat Unificado',
    description: 'Todas as conversas em um só lugar, com histórico completo',
  },
  {
    icon: Users,
    title: 'Multi-usuários',
    description: 'Equipe inteira com acesso, cada um com suas permissões',
  },
  {
    icon: BarChart3,
    title: 'Relatórios',
    description: 'Métricas de atendimento, volume, satisfação',
  },
  {
    icon: Lock,
    title: 'Multi-tenant',
    description: 'Ambiente isolado e seguro para cada empresa',
  },
  {
    icon: Calendar,
    title: 'Agenda Integrada',
    description: 'Sincronização com Google Calendar para agendamentos',
  },
  {
    icon: Code,
    title: 'API Aberta',
    description: 'Integre com seu CRM, ERP ou qualquer sistema',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Funcionalidades <span className="text-gradient">Poderosas</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tudo que você precisa para automatizar seu atendimento em uma única plataforma
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-cs-bg-card border-border hover:border-primary/50 hover:bg-cs-bg-card-hover transition-all group"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
