import { Card, CardContent } from '@/components/ui/card';
import { X, Check, Bot, User } from 'lucide-react';

const comparison = [
  { traditional: 'Respostas prontas', codesolve: 'IA generativa contextual' },
  { traditional: 'Menu de opções', codesolve: 'Conversa natural' },
  { traditional: 'Não entende contexto', codesolve: 'Lembra do histórico' },
  { traditional: 'Robótico e frustrante', codesolve: 'Humanizado e empático' },
  { traditional: 'Genérico', codesolve: 'Treinado para seu nicho' },
  { traditional: 'Limitado', codesolve: 'Aprende e evolui' },
];

const chatExample = [
  { sender: 'user', message: 'Oi, quero saber sobre aulas de jiu jitsu' },
  { 
    sender: 'bot', 
    message: `Oss! 🥋 Tudo bem? Que legal seu interesse no Jiu-Jitsu! Aqui na Academia temos aulas para todos os níveis, do iniciante ao avançado.

Nossos horários são:
• Segunda a Sexta: 07h, 12h, 19h e 20h30
• Sábado: 10h (treino livre)

A primeira aula é GRATUITA! Quer agendar?` 
  },
  { sender: 'user', message: 'Quanto custa?' },
  { 
    sender: 'bot', 
    message: `Nossos planos são bem acessíveis:

💰 Mensal: R$ 150
💰 Trimestral: R$ 400 (economia de R$ 50)
💰 Semestral: R$ 750 (economia de R$ 150)

O kimono não está incluso, mas temos parceria com desconto! Posso agendar sua aula experimental?` 
  },
];

export function AIHumanizedSection() {
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            IA Humanizada - <span className="text-gradient">O Diferencial</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Nossa IA conversa de forma natural, entende contexto e parece um atendente humano
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Comparison Table */}
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6 text-center">Chatbot Tradicional vs CodeSolve IA</h3>
              <div className="space-y-4">
                {comparison.map((item, index) => (
                  <div key={index} className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <X className="h-4 w-4 text-cs-error flex-shrink-0" />
                      {item.traditional}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-cs-success flex-shrink-0" />
                      {item.codesolve}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chat Example */}
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-6 text-center">Exemplo de Conversa Real</h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {chatExample.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      msg.sender === 'user' ? 'bg-accent/20' : 'bg-primary/20'
                    }`}>
                      {msg.sender === 'user' ? (
                        <User className="h-4 w-4 text-accent" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                      msg.sender === 'user' 
                        ? 'bg-accent/10 text-foreground rounded-tr-sm' 
                        : 'bg-muted text-foreground rounded-tl-sm'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
