import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Check } from 'lucide-react';

const benefits = [
  'Setup em 5 minutos',
  'Suporte incluído',
  'Sem fidelidade',
  'Cancele quando quiser',
];

export function CTASection() {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            🚀 Pronto para automatizar seu atendimento?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Comece agora mesmo e veja resultados em menos de 1 hora
          </p>

          {/* CTA Button */}
          <Button asChild size="lg" className="btn-gradient text-lg px-10 py-7 h-auto glow-cyan mb-8">
            <Link to="/register">
              Teste Grátis por 14 Dias
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <p className="text-sm text-muted-foreground mb-6">Sem cartão de crédito</p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-cs-success" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          {/* Alternative CTA */}
          <div className="mt-10 pt-8 border-t border-border">
            <p className="text-muted-foreground mb-4">Ou prefere uma demonstração personalizada?</p>
            <Button asChild variant="outline" size="lg">
              <Link to="/register">Agendar Demo com Especialista</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
