import { useState, useEffect } from 'react';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Header } from '@/components/dashboard/Header';
import { TenantDashboardTab } from '@/components/tenant/TenantDashboardTab';
import { BillingSummaryCard } from '@/components/billing/BillingSummaryCard';
import { TrialBanner } from '@/components/dashboard/TrialBanner';
import { OnboardingTour, useOnboarding } from '@/components/onboarding/OnboardingTour';
import { Bot, Zap, Clock, TrendingUp, MessageSquare, Calendar, Settings, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useDashboardMetrics, useIntegrationStatus } from '@/hooks/useDashboard';



export default function TenantDashboard() {
  const { shouldShowOnboarding, completeOnboarding } = useOnboarding();
  const { metrics, isLoading: metricsLoading, fetchMetrics } = useDashboardMetrics();
  const { integrations, isLoading: integrationsLoading, fetchIntegrationStatus } = useIntegrationStatus();

  useEffect(() => {
    fetchMetrics();
    fetchIntegrationStatus();
  }, []);

  // AI Performance from metrics or defaults
  const aiPerformance = {
    autoResponseRate: metrics?.aiResponseRate || 0,
    timeSaved: metrics?.timeSaved ? `${metrics.timeSaved}h` : '0h',
    moneySaved: metrics?.moneySaved ? `R$ ${metrics.moneySaved.toLocaleString('pt-BR')}` : 'R$ 0',
    escalationRate: metrics?.escalationRate || 0
  };

  // Map integrations to display format
  const integrationsList = integrations.length > 0 ? integrations.map(i => ({
    name: i.name,
    status: i.status,
    detail: i.detail,
    color: i.status === 'connected' ? 'bg-cs-success' : i.status === 'warning' ? 'bg-cs-warning' : 'bg-cs-error'
  })) : [
    { name: 'WhatsApp', status: 'disconnected', detail: 'Não configurado', color: 'bg-cs-text-muted' },
    { name: 'OpenAI', status: 'disconnected', detail: 'Não configurado', color: 'bg-cs-text-muted' }
  ];

  const handleOnboardingComplete = () => {
    completeOnboarding();
    toast.success('Onboarding concluído!', {
      description: 'Você está pronto para usar a plataforma.'
    });
  };

  return (
    <TenantLayout>
      {/* Onboarding Tour */}
      {shouldShowOnboarding && (
        <OnboardingTour 
          onComplete={handleOnboardingComplete} 
          onSkip={completeOnboarding} 
        />
      )}
      
      <Header />
      <div className="p-6">
        {/* Trial Banner */}
        <TrialBanner />
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-cs-text-primary">Dashboard</h1>
          <p className="text-cs-text-secondary">Visão geral do seu tenant</p>
        </div>
        
        {/* Top Row: 3 cards side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
          {/* Billing Card */}
          <BillingSummaryCard variant="tenant" />
          
          {/* AI Performance Card */}
          <div className="bg-cs-bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-cs-text-primary">Performance IA</h3>
                <p className="text-xs text-cs-text-muted">Últimos 30 dias</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cs-bg-primary/50 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3 text-cs-warning" />
                  <p className="text-xs text-cs-text-secondary">Resp. Automática</p>
                </div>
                <p className="text-xl font-bold text-cs-text-primary">{aiPerformance.autoResponseRate}%</p>
              </div>
              <div className="bg-cs-bg-primary/50 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-cs-cyan" />
                  <p className="text-xs text-cs-text-secondary">Tempo Economizado</p>
                </div>
                <p className="text-xl font-bold text-cs-text-primary">{aiPerformance.timeSaved}</p>
              </div>
              <div className="bg-cs-bg-primary/50 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-cs-success" />
                  <p className="text-xs text-cs-text-secondary">Economia</p>
                </div>
                <p className="text-xl font-bold text-cs-success">{aiPerformance.moneySaved}</p>
              </div>
              <div className="bg-cs-bg-primary/50 rounded-lg p-3">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-cs-error" />
                  <p className="text-xs text-cs-text-secondary">Escalação</p>
                </div>
                <p className="text-xl font-bold text-cs-text-primary">{aiPerformance.escalationRate}%</p>
              </div>
            </div>
          </div>
          
          {/* Integrations + Quick Actions Card */}
          <div className="bg-cs-bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cs-cyan/10">
                  <Settings className="w-5 h-5 text-cs-cyan" />
                </div>
                <h3 className="font-semibold text-cs-text-primary">Integrações</h3>
              </div>
              <Link to="/tenant/config">
                <Button variant="ghost" size="sm" className="text-cs-cyan hover:text-cs-cyan/80 h-6 px-2 text-xs">
                  Configurar
                </Button>
              </Link>
            </div>
            
            <div className="space-y-2 mb-4">
              {integrationsList.map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-2 rounded-lg bg-cs-bg-primary/50">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${integration.color}`} />
                    <span className="text-sm text-cs-text-primary">{integration.name}</span>
                  </div>
                  <span className="text-xs text-cs-text-muted">{integration.detail}</span>
                </div>
              ))}
            </div>
            
            {/* Quick Actions */}
            <div className="pt-3 border-t border-border">
              <p className="text-xs text-cs-text-muted mb-2">Acesso rápido</p>
              <div className="flex gap-2">
                <Link to="/tenant/chat" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-border hover:border-cs-cyan/50">
                    <MessageSquare className="w-4 h-4 mr-1 text-cs-cyan" />
                    Chat
                  </Button>
                </Link>
                <Link to="/tenant/calendar" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full border-border hover:border-purple-500/50">
                    <Calendar className="w-4 h-4 mr-1 text-purple-400" />
                    Calendário
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <TenantDashboardTab />
      </div>
    </TenantLayout>
  );
}
