import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Settings, Brain, Rocket } from 'lucide-react';

const steps = [
  {
    icon: QrCode,
    number: '01',
    title: 'Conecte seu WhatsApp',
    description: 'Escaneie o QR Code e conecte seu número em segundos',
    time: '2 min',
  },
  {
    icon: Settings,
    number: '02',
    title: 'Configure a IA',
    description: 'Defina o tom de voz (amigável, profissional, etc.)',
    time: '5 min',
  },
  {
    icon: Brain,
    number: '03',
    title: 'Treine com seu conteúdo',
    description: 'Adicione informações do seu negócio e FAQ',
    time: '10 min',
  },
  {
    icon: Rocket,
    number: '04',
    title: 'Ative e relaxe',
    description: 'A IA começa a atender automaticamente',
    time: 'Imediato',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-card/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como Funciona
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Em menos de 20 minutos seu atendimento automatizado está no ar
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
              
              <Card className="bg-cs-bg-card border-border hover:border-primary/50 transition-colors h-full">
                <CardContent className="p-6 text-center">
                  {/* Step Number */}
                  <div className="text-xs font-bold text-primary mb-4">{step.number}</div>
                  
                  {/* Icon */}
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                  
                  {/* Time Badge */}
                  <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {step.time}
                  </span>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
