import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'João Silva',
    role: 'Proprietário',
    company: 'Academia Power Fit',
    location: 'São Paulo',
    plan: 'Business',
    stats: '8.000 msgs/mês',
    quote: 'Reduzimos 70% dos custos com atendimento e aumentamos as vendas em 40%. A IA responde melhor que muitos atendentes humanos!',
    rating: 5,
  },
  {
    name: 'Maria Santos',
    role: 'Gerente',
    company: 'Pizzaria Del Nonno',
    location: 'Rio de Janeiro',
    plan: 'Professional',
    stats: '3s tempo resposta',
    quote: 'O tempo de resposta caiu de 15 minutos para 3 segundos. Nossos pedidos aumentaram 25% no primeiro mês!',
    rating: 5,
  },
  {
    name: 'Dr. Carlos Lima',
    role: 'Diretor',
    company: 'Clínica Odonto Plus',
    location: 'Belo Horizonte',
    plan: 'Business',
    stats: '-50% no-shows',
    quote: 'Agendamento 24/7 e lembretes automáticos reduziram nossas faltas pela metade. A IA agenda consultas perfeitamente.',
    rating: 5,
  },
  {
    name: 'Ana Oliveira',
    role: 'CEO',
    company: 'Imobiliária Premium',
    location: 'Curitiba',
    plan: 'Enterprise',
    stats: '+60% leads',
    quote: 'A IA qualifica leads automaticamente e encaminha só os interessados reais. Nossa equipe comercial triplicou a produtividade.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            O que nossos clientes dizem
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Empresas reais com resultados reais
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-cs-bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-cs-warning text-cs-warning" />
                  ))}
                </div>

                {/* Quote */}
                <div className="relative">
                  <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                  <p className="text-foreground pl-6 italic">"{testimonial.quote}"</p>
                </div>

                {/* Author */}
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </p>
                    <p className="text-xs text-muted-foreground">{testimonial.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-primary font-medium">Plano {testimonial.plan}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.stats}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
