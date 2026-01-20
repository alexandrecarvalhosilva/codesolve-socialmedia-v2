import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MessageCircle, Zap, Shield } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="outline" className="bg-cs-success/10 border-cs-success/30 text-cs-success px-4 py-1.5">
              <Zap className="h-3.5 w-3.5 mr-1.5" />
              Setup em 5 minutos
            </Badge>
            <Badge variant="outline" className="bg-primary/10 border-primary/30 text-primary px-4 py-1.5">
              <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
              Suporte em português
            </Badge>
            <Badge variant="outline" className="bg-accent/10 border-accent/30 text-accent px-4 py-1.5">
              <Shield className="h-3.5 w-3.5 mr-1.5" />
              Sem cartão de crédito
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Automatize seu atendimento no WhatsApp com{' '}
            <span className="text-gradient">IA que parece humana</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Plataforma completa de atendimento automatizado com Inteligência Artificial humanizada. 
            Configure uma vez, atenda para sempre.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="btn-gradient text-lg px-8 py-6 h-auto glow-cyan">
              <Link to="/register">
                Teste Grátis por 14 Dias
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 h-auto">
              <a href="#how-it-works">
                Veja Como Funciona
              </a>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-8 border-t border-border">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-gradient">+2M</p>
              <p className="text-sm text-muted-foreground mt-1">Mensagens/mês</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-gradient">3s</p>
              <p className="text-sm text-muted-foreground mt-1">Tempo de resposta</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-gradient">70%</p>
              <p className="text-sm text-muted-foreground mt-1">Redução de custos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-gradient">4.8/5</p>
              <p className="text-sm text-muted-foreground mt-1">Satisfação</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
