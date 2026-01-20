import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PrivacyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrivacyModal({ open, onOpenChange }: PrivacyModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Política de Privacidade</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm text-muted-foreground">
            <p className="text-foreground font-medium">
              Última atualização: Janeiro de 2026
            </p>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">1. Introdução</h3>
              <p>
                A CodeSolve está comprometida em proteger sua privacidade. Esta Política de Privacidade 
                explica como coletamos, usamos, divulgamos e protegemos suas informações pessoais quando 
                você utiliza nossa plataforma CodeSolve Social Media.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">2. Dados que Coletamos</h3>
              <p>Coletamos os seguintes tipos de informações:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Dados de cadastro:</strong> nome, email, telefone, nome da empresa</li>
                <li><strong>Dados de uso:</strong> logs de acesso, funcionalidades utilizadas, interações</li>
                <li><strong>Dados de pagamento:</strong> informações de cartão (processadas por terceiros seguros)</li>
                <li><strong>Dados de conversas:</strong> mensagens trocadas através da plataforma</li>
                <li><strong>Dados técnicos:</strong> endereço IP, tipo de navegador, dispositivo</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">3. Como Usamos seus Dados</h3>
              <p>Utilizamos suas informações para:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Fornecer e manter nossos serviços</li>
                <li>Processar pagamentos e gerenciar sua conta</li>
                <li>Enviar comunicações sobre o serviço</li>
                <li>Melhorar e personalizar a experiência do usuário</li>
                <li>Treinar e melhorar nossos modelos de IA</li>
                <li>Cumprir obrigações legais</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">4. Compartilhamento de Dados</h3>
              <p>Podemos compartilhar suas informações com:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Processadores de pagamento:</strong> para processar transações financeiras</li>
                <li><strong>Provedores de infraestrutura:</strong> para hospedagem e armazenamento</li>
                <li><strong>Parceiros de IA:</strong> para processamento de linguagem natural</li>
                <li><strong>Autoridades legais:</strong> quando exigido por lei</li>
              </ul>
              <p className="mt-2">
                Não vendemos suas informações pessoais a terceiros para fins de marketing.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">5. Segurança dos Dados</h3>
              <p>
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Criptografia de dados em trânsito e em repouso</li>
                <li>Controle de acesso baseado em funções</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Backups regulares</li>
                <li>Ambiente multi-tenant isolado</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">6. Retenção de Dados</h3>
              <p>
                Mantemos suas informações pelo tempo necessário para fornecer nossos serviços ou 
                conforme exigido por lei. Dados de conta são mantidos enquanto sua conta estiver 
                ativa. Após o encerramento, os dados são excluídos em até 90 dias, exceto quando 
                a retenção for legalmente exigida.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">7. Seus Direitos (LGPD)</h3>
              <p>De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem direito a:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Acesso:</strong> solicitar cópia dos seus dados pessoais</li>
                <li><strong>Correção:</strong> corrigir dados incompletos ou incorretos</li>
                <li><strong>Exclusão:</strong> solicitar a exclusão dos seus dados</li>
                <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
                <li><strong>Oposição:</strong> opor-se ao processamento dos seus dados</li>
                <li><strong>Revogação:</strong> revogar consentimento previamente dado</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">8. Cookies</h3>
              <p>
                Utilizamos cookies e tecnologias similares para melhorar sua experiência. 
                Cookies essenciais são necessários para o funcionamento do serviço. Cookies 
                de análise nos ajudam a entender como você usa a plataforma. Você pode 
                gerenciar suas preferências de cookies nas configurações do navegador.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">9. Transferência Internacional</h3>
              <p>
                Seus dados podem ser processados em servidores localizados fora do Brasil. 
                Garantimos que qualquer transferência internacional de dados seja realizada 
                em conformidade com a LGPD, utilizando cláusulas contratuais padrão ou 
                outros mecanismos legais apropriados.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">10. Alterações nesta Política</h3>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos 
                você sobre alterações significativas por email ou através de aviso em nossa 
                plataforma. Recomendamos revisar esta política regularmente.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-foreground font-semibold">11. Encarregado de Dados (DPO)</h3>
              <p>
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em 
                contato com nosso Encarregado de Proteção de Dados:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> privacidade@codesolve.com.br<br />
                <strong>Endereço:</strong> Brasília - DF, Brasil
              </p>
            </section>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
