import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TermsModal({ open, onOpenChange }: TermsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Termos de Uso</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-muted-foreground">
            <p className="text-foreground font-medium">
              Última atualização: Janeiro de 2026
            </p>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">1. Aceitação dos Termos</h3>
              <p>
                Ao acessar e usar a plataforma CodeSolve Social Media, você concorda em cumprir e estar vinculado 
                a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não poderá 
                acessar o serviço.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">2. Descrição do Serviço</h3>
              <p>
                O CodeSolve Social Media é uma plataforma SaaS de gerenciamento centralizado de redes sociais 
                com Inteligência Artificial humanizada. O serviço permite que empresas automatizem o atendimento 
                ao cliente através de mensagens instantâneas no WhatsApp.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">3. Conta do Usuário</h3>
              <p>
                Para utilizar nossos serviços, você deve criar uma conta fornecendo informações verdadeiras, 
                precisas e completas. Você é responsável por manter a confidencialidade de sua senha e por 
                todas as atividades que ocorram em sua conta.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">4. Período de Teste (Trial)</h3>
              <p>
                Oferecemos um período de teste gratuito de 14 dias. Durante este período, você terá acesso 
                a todas as funcionalidades do plano selecionado. Ao final do período de teste, será necessário 
                escolher um plano pago para continuar utilizando o serviço.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">5. Pagamentos e Faturamento</h3>
              <p>
                Os planos são cobrados de acordo com o ciclo de faturamento escolhido (mensal, trimestral, 
                semestral ou anual). Os pagamentos são processados automaticamente na data de renovação. 
                Aceitamos cartão de crédito, PIX e boleto bancário.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">6. Uso Aceitável</h3>
              <p>Você concorda em não:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Usar o serviço para enviar spam ou mensagens não solicitadas</li>
                <li>Violar leis aplicáveis ou direitos de terceiros</li>
                <li>Tentar acessar contas de outros usuários</li>
                <li>Interferir no funcionamento adequado da plataforma</li>
                <li>Revender ou redistribuir o serviço sem autorização</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">7. Propriedade Intelectual</h3>
              <p>
                Todo o conteúdo, marcas, logos e software da plataforma são propriedade exclusiva da 
                CodeSolve ou de seus licenciadores. É proibida a reprodução, distribuição ou modificação 
                sem autorização prévia por escrito.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">8. Limitação de Responsabilidade</h3>
              <p>
                O serviço é fornecido "como está". Não garantimos que o serviço será ininterrupto ou 
                livre de erros. Nossa responsabilidade está limitada ao valor pago pelo serviço nos 
                últimos 12 meses.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">9. Cancelamento</h3>
              <p>
                Você pode cancelar sua assinatura a qualquer momento através do painel de controle. 
                O cancelamento será efetivo ao final do período de faturamento atual. Não há reembolso 
                proporcional para cancelamentos antecipados.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">10. Alterações nos Termos</h3>
              <p>
                Reservamo-nos o direito de modificar estes termos a qualquer momento. Alterações 
                significativas serão comunicadas por email com 30 dias de antecedência. O uso 
                continuado do serviço após as alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">11. Contato</h3>
              <p>
                Para dúvidas sobre estes Termos de Uso, entre em contato conosco através do email 
                legal@codesolve.com.br ou pelo chat de suporte disponível na plataforma.
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
