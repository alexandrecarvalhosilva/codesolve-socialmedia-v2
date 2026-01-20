import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';
import { BillingCycleSelector } from '@/components/billing/BillingCycleSelector';
import { getPublicPlans, getPlanFeatures } from '@/config/plansConfig';
import { MODULE_CATALOG } from '@/config/moduleCatalog';
import { BillingCycle, BILLING_CYCLE_DISCOUNTS, formatPrice, calculateCyclePrice } from '@/types/billing';

export function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  // Busca planos diretamente da configuração centralizada do sistema
  const publicPlans = getPublicPlans();
  
  // Busca módulos opcionais do catálogo centralizado
  const addOnModules = MODULE_CATALOG.filter(m => !m.isCore && m.isAvailable);

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-card/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Planos e Preços
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
            Escolha o plano ideal para o seu negócio. Todos incluem suporte e atualizações.
          </p>

          {/* Billing Cycle Selector */}
          <div className="flex justify-center mb-4">
            <BillingCycleSelector value={billingCycle} onChange={setBillingCycle} />
          </div>

          {/* Discount Badge */}
          {BILLING_CYCLE_DISCOUNTS[billingCycle].discount > 0 && (
            <Badge className="bg-cs-success/10 text-cs-success border-cs-success/30">
              🎉 Economize {BILLING_CYCLE_DISCOUNTS[billingCycle].discount}% pagando {BILLING_CYCLE_DISCOUNTS[billingCycle].label.toLowerCase()}
            </Badge>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-16">
          {publicPlans.map((plan) => {
            const cyclePrice = calculateCyclePrice(plan.basePrice, billingCycle);
            const monthlyEquivalent = cyclePrice / BILLING_CYCLE_DISCOUNTS[billingCycle].months;
            const isPopular = plan.isPopular || plan.slug === 'professional';
            const features = getPlanFeatures(plan);

            return (
              <Card 
                key={plan.id} 
                className={`relative bg-cs-bg-card border-border transition-all ${
                  isPopular ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                      <Star className="h-3 w-3" /> Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-2">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Price */}
                  <div className="text-center">
                    {plan.slug === 'enterprise' ? (
                      <div className="text-2xl font-bold text-primary">Sob consulta</div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-gradient">
                          {formatPrice(monthlyEquivalent)}
                        </div>
                        <p className="text-sm text-muted-foreground">/mês</p>
                        {billingCycle !== 'monthly' && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Total: {formatPrice(cyclePrice)}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3">
                    {features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-cs-success flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                    
                    {/* Módulos inclusos */}
                    {plan.modules.slice(0, 3).map((moduleId) => {
                      const module = MODULE_CATALOG.find(m => m.id === moduleId);
                      if (!module) return null;
                      return (
                        <li key={moduleId} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-cs-success flex-shrink-0" />
                          {module.name}
                        </li>
                      );
                    })}
                    
                    {plan.modules.length > 3 && (
                      <li className="text-xs text-muted-foreground pl-6">
                        +{plan.modules.length - 3} módulos inclusos
                      </li>
                    )}
                  </ul>

                  {/* CTA */}
                  <Button 
                    asChild 
                    className={`w-full ${isPopular ? 'btn-gradient' : ''}`}
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    <Link to="/register">
                      {plan.slug === 'enterprise' ? 'Fale Conosco' : 'Começar Agora'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Add-on Modules */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-center mb-6">Módulos Adicionais</h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {addOnModules.slice(0, 6).map((module) => {
              const ModuleIcon = module.icon;
              return (
                <Card key={module.id} className="bg-cs-bg-card border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ModuleIcon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{module.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {module.pricing?.monthlyPrice 
                            ? formatPrice(module.pricing.monthlyPrice) + '/mês'
                            : 'Consulte'
                          }
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Add-on
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="text-center mt-12 text-muted-foreground text-sm">
          <p>💳 Cartão de crédito até 12x • 📱 PIX com 5% de desconto • 📄 Boleto</p>
        </div>
      </div>
    </section>
  );
}
