import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  X, 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard,
  MessageCircle,
  Calendar,
  Bot,
  CreditCard,
  Sparkles
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  target?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao CodeSolve! 🎉',
    description: 'Vamos fazer um tour rápido pela plataforma para você conhecer tudo que pode fazer aqui.',
    icon: Sparkles,
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'Aqui você acompanha métricas importantes: mensagens enviadas, performance da IA, e status das integrações.',
    icon: LayoutDashboard,
    target: '/tenant/dashboard',
  },
  {
    id: 'chat',
    title: 'Central de Chat',
    description: 'Gerencie todas as conversas do WhatsApp em um só lugar. A IA responde automaticamente, mas você pode intervir quando quiser.',
    icon: MessageCircle,
    target: '/tenant/chat',
  },
  {
    id: 'calendar',
    title: 'Calendário de Agendamentos',
    description: 'Visualize e gerencie todos os agendamentos feitos pela IA. Confirme, remarque ou cancele com facilidade.',
    icon: Calendar,
    target: '/tenant/calendar',
  },
  {
    id: 'automations',
    title: 'Automações',
    description: 'Configure respostas automáticas, fluxos de atendimento e regras de negócio personalizadas.',
    icon: Bot,
    target: '/tenant/automations',
  },
  {
    id: 'billing',
    title: 'Cobrança e Planos',
    description: 'Acompanhe sua assinatura, faturas e faça upgrade quando precisar de mais recursos.',
    icon: CreditCard,
    target: '/tenant/billing',
  },
];

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const step = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    // Save to localStorage that onboarding is complete
    localStorage.setItem('onboarding_completed', 'true');
    onComplete();
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('onboarding_completed', 'true');
    onSkip();
  };

  if (!isVisible) return null;

  const Icon = step.icon;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
      
      {/* Tour Card */}
      <div className="fixed inset-0 flex items-center justify-center z-[101] p-4">
        <Card className="w-full max-w-lg bg-cs-bg-card border-border shadow-2xl animate-in fade-in zoom-in duration-300">
          <CardContent className="p-0">
            {/* Header */}
            <div className="relative p-6 pb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSkip}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
              
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                  <span>Passo {currentStep + 1} de {tourSteps.length}</span>
                  <button onClick={handleSkip} className="hover:text-foreground">
                    Pular tour
                  </button>
                </div>
                <Progress value={progress} className="h-1" />
              </div>

              {/* Icon */}
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                <Icon className="h-8 w-8 text-white" />
              </div>

              {/* Content */}
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {step.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center gap-2 py-4">
              {tourSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep 
                      ? 'w-6 bg-primary' 
                      : index < currentStep 
                        ? 'bg-primary/50' 
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between p-6 pt-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={isFirstStep}
                className="text-muted-foreground"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
              
              <Button onClick={handleNext} className="btn-gradient">
                {isLastStep ? (
                  <>
                    Começar a usar
                    <Sparkles className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

// Hook to check if onboarding should be shown
export function useOnboarding() {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('onboarding_completed');
    const isNewUser = localStorage.getItem('is_new_registration');
    
    // Show onboarding only for new users who haven't completed it
    if (isNewUser === 'true' && completed !== 'true') {
      setShouldShowOnboarding(true);
      // Clear the new registration flag
      localStorage.removeItem('is_new_registration');
    }
  }, []);

  const completeOnboarding = () => {
    setShouldShowOnboarding(false);
    localStorage.setItem('onboarding_completed', 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    setShouldShowOnboarding(true);
  };

  return {
    shouldShowOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
}
