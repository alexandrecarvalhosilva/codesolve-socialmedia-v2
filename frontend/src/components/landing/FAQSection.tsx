import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'Preciso de conhecimento técnico para usar?',
    answer: 'Não! O CodeSolve foi feito para ser simples. Você configura tudo pelo painel, sem precisar de programação.',
  },
  {
    question: 'A IA vai substituir minha equipe?',
    answer: 'Não necessariamente. A IA resolve as dúvidas repetitivas (80% dos casos), liberando sua equipe para focar em vendas e casos complexos.',
  },
  {
    question: 'Os clientes vão perceber que é uma IA?',
    answer: 'Na maioria dos casos, não. Nossa IA é treinada para conversar de forma natural e humanizada, usando o tom de voz da sua empresa.',
  },
  {
    question: 'Posso desligar a IA em conversas específicas?',
    answer: 'Sim! Você pode ativar ou desativar a IA por conversa individual. Quando desligada, as mensagens vão para um atendente humano.',
  },
  {
    question: 'Funciona com WhatsApp pessoal ou só Business?',
    answer: 'Funciona com ambos, mas recomendamos o WhatsApp Business para recursos profissionais como catálogo e respostas rápidas.',
  },
  {
    question: 'Quanto tempo leva para configurar?',
    answer: 'Em média, 15-30 minutos. Conectar o WhatsApp leva 2 minutos, o resto é configurar a IA com informações do seu negócio.',
  },
  {
    question: 'Posso testar antes de assinar?',
    answer: 'Sim! Oferecemos 14 dias de teste grátis, sem precisar de cartão de crédito.',
  },
  {
    question: 'E se eu precisar de mais mensagens?',
    answer: 'Você pode fazer upgrade de plano a qualquer momento ou contratar pacotes adicionais de mensagens.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Sim! Usamos criptografia de ponta a ponta e cada empresa tem seu ambiente isolado (multi-tenant).',
  },
  {
    question: 'Vocês oferecem suporte em português?',
    answer: 'Sim! Somos uma empresa brasileira com suporte 100% em português.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 lg:py-32 bg-card/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Perguntas Frequentes
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tire suas dúvidas sobre o CodeSolve Social Media
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-cs-bg-card border border-border rounded-lg px-6 data-[state=open]:border-primary/50"
              >
                <AccordionTrigger className="text-left hover:no-underline py-4">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
