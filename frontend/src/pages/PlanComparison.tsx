import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, 
  X, 
  ArrowLeft, 
  Star, 
  Zap,
  Info
} from 'lucide-react';
import { getPublicPlans, getPlanFeatures } from '@/config/plansConfig';
import { MODULE_CATALOG, getModulesGroupedByCategory } from '@/config/moduleCatalog';
import { getCategoryLabel } from '@/types/modules';
import { BillingCycleSelector } from '@/components/billing/BillingCycleSelector';
import { BillingCycle, BILLING_CYCLE_DISCOUNTS, formatPrice, calculateCyclePrice } from '@/types/billing';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function PlanComparison() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  
  const plans = getPublicPlans();
  const groupedModules = getModulesGroupedByCategory();

  // Features gerais para comparar
  const generalFeatures = [
    { key: 'maxUsers', label: 'Usuários inclusos', description: 'Número de usuários que podem acessar o sistema' },
    { key: 'maxInstances', label: 'Instâncias WhatsApp', description: 'Números de WhatsApp conectados simultaneamente' },
    { key: 'maxMessagesPerMonth', label: 'Mensagens/mês', description: 'Limite de mensagens enviadas por mês' },
    { key: 'support', label: 'Suporte', description: 'Tipo de suporte incluído' },
    { key: 'sla', label: 'SLA de resposta', description: 'Tempo máximo de resposta do suporte' },
    { key: 'api', label: 'Acesso à API', description: 'Acesso à API REST para integrações' },
    { key: 'whitelabel', label: 'White Label', description: 'Remover marca CodeSolve' },
    { key: 'dedicatedManager', label: 'Gerente dedicado', description: 'Gerente de conta exclusivo' },
  ];

  const getFeatureValue = (planSlug: string, featureKey: string) => {
    const plan = plans.find(p => p.slug === planSlug);
    if (!plan) return null;

    switch (featureKey) {
      case 'maxUsers':
        return plan.maxUsers >= 999 ? 'Ilimitados' : `${plan.maxUsers}`;
      case 'maxInstances':
        return plan.maxInstances >= 999 ? 'Ilimitadas' : `${plan.maxInstances}`;
      case 'maxMessagesPerMonth':
        return plan.maxMessagesPerMonth === null ? 'Ilimitadas' : plan.maxMessagesPerMonth.toLocaleString('pt-BR');
      case 'support':
        if (planSlug === 'enterprise') return 'Prioritário 24/7';
        if (planSlug === 'business') return 'Prioritário';
        if (planSlug === 'professional') return 'Email + Chat';
        return 'Email';
      case 'sla':
        if (planSlug === 'enterprise') return '1 hora';
        if (planSlug === 'business') return '4 horas';
        if (planSlug === 'professional') return '12 horas';
        return '48 horas';
      case 'api':
        return ['business', 'enterprise'].includes(planSlug);
      case 'whitelabel':
        return planSlug === 'enterprise';
      case 'dedicatedManager':
        return planSlug === 'enterprise';
      default:
        return null;
    }
  };

  const renderFeatureValue = (value: string | number | boolean | null) => {
    if (value === true) {
      return <Check className="h-5 w-5 text-cs-success mx-auto" />;
    }
    if (value === false) {
      return <X className="h-5 w-5 text-muted-foreground/50 mx-auto" />;
    }
    if (value === null) {
      return <span className="text-muted-foreground">-</span>;
    }
    return <span className="font-medium text-foreground">{value}</span>;
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link to="/billing/plans">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Comparar Planos</h1>
              <p className="text-muted-foreground">Veja todas as diferenças entre os planos</p>
            </div>
          </div>
          <BillingCycleSelector value={billingCycle} onChange={setBillingCycle} />
        </div>

        {/* Discount Badge */}
        {BILLING_CYCLE_DISCOUNTS[billingCycle].discount > 0 && (
          <div className="flex justify-center">
            <Badge className="bg-cs-success/10 text-cs-success border-cs-success/30 py-2 px-4">
              🎉 Economize {BILLING_CYCLE_DISCOUNTS[billingCycle].discount}% no ciclo {BILLING_CYCLE_DISCOUNTS[billingCycle].label.toLowerCase()}
            </Badge>
          </div>
        )}

        {/* Plan Headers */}
        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-1" /> {/* Empty cell for feature labels */}
          {plans.slice(0, 4).map((plan) => {
            const cyclePrice = calculateCyclePrice(plan.basePrice, billingCycle);
            const monthlyEquivalent = cyclePrice / BILLING_CYCLE_DISCOUNTS[billingCycle].months;
            const isPopular = plan.isPopular;

            return (
              <Card 
                key={plan.id} 
                className={`text-center ${isPopular ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
              >
                <CardHeader className="pb-2">
                  {isPopular && (
                    <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" /> Popular
                    </Badge>
                  )}
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  {plan.slug === 'enterprise' ? (
                    <p className="text-2xl font-bold text-primary">Sob consulta</p>
                  ) : (
                    <>
                      <p className="text-3xl font-bold text-foreground">
                        {formatPrice(monthlyEquivalent)}
                      </p>
                      <p className="text-sm text-muted-foreground">/mês</p>
                    </>
                  )}
                  <Button 
                    asChild 
                    className={`mt-4 w-full ${isPopular ? 'btn-gradient' : ''}`}
                    variant={isPopular ? 'default' : 'outline'}
                  >
                    <Link to="/upgrade">
                      {plan.slug === 'enterprise' ? 'Falar com vendas' : 'Escolher plano'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparison Tabs */}
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="features">
              <Zap className="h-4 w-4 mr-2" />
              Recursos
            </TabsTrigger>
            <TabsTrigger value="modules">
              Módulos Inclusos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="features" className="mt-6">
            <Card className="bg-cs-bg-card border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground w-1/5">Recurso</th>
                      {plans.slice(0, 4).map(plan => (
                        <th key={plan.id} className="p-4 font-medium text-foreground text-center w-1/5">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {generalFeatures.map((feature, idx) => (
                      <tr 
                        key={feature.key} 
                        className={idx % 2 === 0 ? 'bg-muted/30' : ''}
                      >
                        <td className="p-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger className="flex items-center gap-2 text-sm text-foreground">
                                {feature.label}
                                <Info className="h-3 w-3 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{feature.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                        {plans.slice(0, 4).map(plan => (
                          <td key={plan.id} className="p-4 text-center">
                            {renderFeatureValue(getFeatureValue(plan.slug, feature.key))}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="modules" className="mt-6 space-y-6">
            {Object.entries(groupedModules).map(([category, modules]) => {
              if (modules.length === 0) return null;
              
              return (
                <Card key={category} className="bg-cs-bg-card border-border overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">
                      {getCategoryLabel(category as any)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left p-4 font-medium text-muted-foreground w-1/5">Módulo</th>
                            {plans.slice(0, 4).map(plan => (
                              <th key={plan.id} className="p-4 font-medium text-foreground text-center w-1/5">
                                {plan.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {modules.map((module, idx) => {
                            const ModuleIcon = module.icon;
                            return (
                              <tr 
                                key={module.id} 
                                className={idx % 2 === 0 ? 'bg-muted/30' : ''}
                              >
                                <td className="p-4">
                                  <div className="flex items-center gap-3">
                                    <div className="p-1.5 rounded bg-cs-bg-primary">
                                      <ModuleIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium text-foreground">{module.name}</p>
                                      {module.isNew && (
                                        <Badge variant="secondary" className="text-xs mt-0.5">Novo</Badge>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                {plans.slice(0, 4).map(plan => {
                                  const isIncluded = plan.modules.includes(module.id) || module.isCore;
                                  return (
                                    <td key={plan.id} className="p-4 text-center">
                                      {isIncluded ? (
                                        <Check className="h-5 w-5 text-cs-success mx-auto" />
                                      ) : (
                                        <span className="text-xs text-muted-foreground">Add-on</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">Precisa de ajuda para escolher?</p>
          <Button variant="outline" size="lg">
            Falar com um especialista
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
