import { Card, CardContent } from '@/components/ui/card';

const niches = [
  {
    icon: '🥋',
    title: 'Academias',
    examples: ['Jiu-Jitsu', 'CrossFit', 'Pilates'],
  },
  {
    icon: '🏥',
    title: 'Clínicas',
    examples: ['Médicas', 'Odonto', 'Estéticas'],
  },
  {
    icon: '🍕',
    title: 'Delivery',
    examples: ['Restaurantes', 'Pizzarias', 'Lanchonetes'],
  },
  {
    icon: '🛒',
    title: 'E-commerce',
    examples: ['Lojas', 'Marketplaces', 'Dropshipping'],
  },
  {
    icon: '🏠',
    title: 'Imobiliárias',
    examples: ['Vendas', 'Locação', 'Avaliação'],
  },
  {
    icon: '💼',
    title: 'Escritórios',
    examples: ['Advocacia', 'Contábil', 'Arquitetura'],
  },
  {
    icon: '🎓',
    title: 'Educação',
    examples: ['Escolas', 'Cursos', 'Coaching'],
  },
  {
    icon: '💇',
    title: 'Serviços',
    examples: ['Salões', 'Oficinas', 'Assistência'],
  },
];

export function NichesSection() {
  return (
    <section className="py-20 lg:py-32 bg-card/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Nichos Atendidos
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            O CodeSolve é <span className="text-primary font-semibold">agnóstico de contexto</span> - funciona para qualquer tipo de negócio
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {niches.map((niche, index) => (
            <Card 
              key={index} 
              className="bg-cs-bg-card border-border hover:border-primary/50 transition-colors text-center"
            >
              <CardContent className="p-6">
                <div className="text-4xl mb-3">{niche.icon}</div>
                <h3 className="font-semibold mb-2">{niche.title}</h3>
                <p className="text-xs text-muted-foreground">
                  {niche.examples.join(' • ')}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-muted-foreground mt-10">
          Você configura a IA com as informações do seu nicho e ela se torna{' '}
          <span className="text-foreground font-medium">especialista no seu mercado</span>.
        </p>
      </div>
    </section>
  );
}
