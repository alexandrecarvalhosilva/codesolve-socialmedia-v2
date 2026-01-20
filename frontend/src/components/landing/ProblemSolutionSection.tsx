import { Card, CardContent } from '@/components/ui/card';
import { X, Check } from 'lucide-react';

const problems = [
  'Clientes esperando horas por uma resposta',
  'Equipe sobrecarregada com perguntas repetitivas',
  'Vendas perdidas fora do horário comercial',
  'Custos altos com atendimento 24/7',
  'Qualidade inconsistente nas respostas',
  'Dificuldade em escalar o atendimento',
];

const solutions = [
  'Respostas instantâneas, 24 horas por dia',
  'IA resolve 80% das dúvidas automaticamente',
  'Atendimento mesmo de madrugada e feriados',
  'Redução de até 70% nos custos operacionais',
  'Padrão de qualidade em todas as interações',
  'Escale de 10 para 10.000 atendimentos sem contratar',
];

export function ProblemSolutionSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Você se identifica com isso?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Milhares de empresas enfrentam os mesmos desafios. O CodeSolve resolve todos eles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Problems */}
          <Card className="bg-cs-error/5 border-cs-error/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-cs-error mb-6 flex items-center gap-2">
                <X className="h-6 w-6" />
                Sem o CodeSolve
              </h3>
              <ul className="space-y-4">
                {problems.map((problem, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-cs-error/20 flex items-center justify-center">
                      <X className="h-3 w-3 text-cs-error" />
                    </div>
                    <span className="text-muted-foreground">{problem}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Solutions */}
          <Card className="bg-cs-success/5 border-cs-success/20">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-cs-success mb-6 flex items-center gap-2">
                <Check className="h-6 w-6" />
                Com o CodeSolve
              </h3>
              <ul className="space-y-4">
                {solutions.map((solution, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-cs-success/20 flex items-center justify-center">
                      <Check className="h-3 w-3 text-cs-success" />
                    </div>
                    <span className="text-foreground">{solution}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
