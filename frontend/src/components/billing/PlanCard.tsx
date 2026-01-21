import { Check, X, Star } from 'lucide-react';
import { BillingPlan, BillingCycle, formatPrice, calculateCyclePrice, BILLING_CYCLE_DISCOUNTS } from '@/types/billing';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Module definitions
const moduleDefinitions: Record<string, { name: string; description: string }> = {
  whatsapp: { name: 'WhatsApp Business', description: 'Integração com WhatsApp' },
  ai_basic: { name: 'IA Básica', description: 'Respostas automáticas simples' },
  ai_advanced: { name: 'IA Avançada', description: 'IA com contexto e aprendizado' },
  calendar: { name: 'Calendário', description: 'Agendamento de eventos' },
  crm: { name: 'CRM', description: 'Gestão de relacionamento' },
  reports: { name: 'Relatórios', description: 'Relatórios e analytics' },
  multi_instance: { name: 'Multi-Instância', description: 'Múltiplas instâncias WhatsApp' },
  api_access: { name: 'Acesso API', description: 'Acesso à API' },
  white_label: { name: 'White Label', description: 'Personalização de marca' },
  priority_support: { name: 'Suporte Prioritário', description: 'Suporte prioritário' },
};

const getModuleBySlug = (slug: string) => moduleDefinitions[slug] || null;

interface PlanCardProps {
  plan: BillingPlan;
  cycle: BillingCycle;
  isCurrentPlan?: boolean;
  onSelect?: (plan: BillingPlan) => void;
  onContact?: () => void;
}

export function PlanCard({ plan, cycle, isCurrentPlan, onSelect, onContact }: PlanCardProps) {
  const isEnterprise = plan.slug === 'enterprise';
  const isFree = plan.basePrice === 0;
  
  // Calcular preço com desconto do ciclo
  const totalPrice = isEnterprise ? 0 : calculateCyclePrice(plan.basePrice, cycle);
  const monthlyPrice = isEnterprise ? 0 : totalPrice / BILLING_CYCLE_DISCOUNTS[cycle].months;
  
  // Lista de features baseada nos módulos
  const allModuleSlugs = ['whatsapp', 'ai_basic', 'ai_advanced', 'calendar', 'crm', 'reports', 'multi_instance', 'api_access', 'white_label', 'priority_support'];
  
  return (
    <div 
      className={cn(
        "relative flex flex-col p-6 rounded-2xl border transition-all",
        plan.isPopular 
          ? "border-cs-cyan bg-gradient-to-b from-cs-cyan/10 to-transparent" 
          : "border-border bg-cs-bg-card",
        isCurrentPlan && "ring-2 ring-cs-cyan"
      )}
    >
      {/* Popular badge */}
      {plan.isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-cs-cyan text-white rounded-full">
            <Star className="w-3 h-3 fill-current" />
            POPULAR
          </span>
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-cs-text-primary">{plan.name}</h3>
        <p className="text-sm text-cs-text-secondary mt-1">{plan.description}</p>
      </div>

      {/* Price */}
      <div className="text-center mb-6">
        {isEnterprise ? (
          <div>
            <p className="text-3xl font-bold text-cs-text-primary">Sob consulta</p>
            <p className="text-sm text-cs-text-muted">Personalizado para sua empresa</p>
          </div>
        ) : (
          <div>
            <p className="text-4xl font-bold text-cs-text-primary">
              {formatPrice(monthlyPrice)}
              <span className="text-base font-normal text-cs-text-muted">/mês</span>
            </p>
            {cycle !== 'monthly' && (
              <p className="text-sm text-cs-success mt-1">
                {formatPrice(totalPrice)} cobrado {BILLING_CYCLE_DISCOUNTS[cycle].label.toLowerCase()}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Limits */}
      <div className="space-y-2 mb-6 pb-6 border-b border-border">
        <div className="flex justify-between text-sm">
          <span className="text-cs-text-secondary">Mensagens/mês</span>
          <span className="text-cs-text-primary font-medium">
            {plan.maxMessagesPerMonth ? plan.maxMessagesPerMonth.toLocaleString() : 'Ilimitado'}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-cs-text-secondary">Usuários</span>
          <span className="text-cs-text-primary font-medium">
            {plan.maxUsers >= 999 ? 'Ilimitado' : plan.maxUsers}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-cs-text-secondary">Instâncias WhatsApp</span>
          <span className="text-cs-text-primary font-medium">
            {plan.maxInstances >= 999 ? 'Ilimitado' : plan.maxInstances}
          </span>
        </div>
      </div>

      {/* Features */}
      <div className="flex-1 space-y-3 mb-6">
        {allModuleSlugs.slice(0, 7).map((slug) => {
          const module = getModuleBySlug(slug);
          const isIncluded = plan.modules.includes(slug);
          
          if (!module) return null;
          
          return (
            <div key={slug} className="flex items-center gap-2 text-sm">
              {isIncluded ? (
                <Check className="w-4 h-4 text-cs-success flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-cs-text-muted flex-shrink-0" />
              )}
              <span className={isIncluded ? 'text-cs-text-primary' : 'text-cs-text-muted'}>
                {module.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      {isCurrentPlan ? (
        <Button disabled className="w-full bg-cs-bg-primary text-cs-text-muted">
          Plano Atual
        </Button>
      ) : isEnterprise ? (
        <Button 
          onClick={onContact}
          className="w-full bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90"
        >
          Falar com Vendas
        </Button>
      ) : (
        <Button 
          onClick={() => onSelect?.(plan)}
          variant={plan.isPopular ? 'default' : 'outline'}
          className={cn(
            "w-full",
            plan.isPopular 
              ? "bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90" 
              : "border-border hover:border-cs-cyan"
          )}
        >
          {isFree ? 'Começar Grátis' : 'Selecionar'}
        </Button>
      )}
    </div>
  );
}
