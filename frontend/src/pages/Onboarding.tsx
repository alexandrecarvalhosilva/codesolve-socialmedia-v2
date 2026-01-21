import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  MessageSquare, 
  Sparkles, 
  HelpCircle,
  QrCode,
  Loader2,
  Plus,
  Trash2,
  Eye,
  RefreshCw,
  Smartphone,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import logoIcon from '@/assets/codesolve-icon.png';
import { 
  NicheTemplate, 
  NicheFAQ, 
  TenantOnboardingData, 
  OnboardingStep 
} from '@/types/nicheTemplate';
import { 
  fetchNicheTemplates, 
  getTemplateById, 
  applyVariablesToPrompt 
} from '@/services/templateService';
import { useWhatsApp } from '@/hooks/useWhatsApp';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const steps: { id: OnboardingStep; title: string; icon: React.ElementType }[] = [
  { id: 'whatsapp', title: 'WhatsApp', icon: MessageSquare },
  { id: 'niche', title: 'Nicho', icon: Sparkles },
  { id: 'faq', title: 'FAQs', icon: HelpCircle },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { instances, createInstance, getQrCode, disconnectInstance, isLoading: waLoading } = useWhatsApp();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('whatsapp');
  const [isLoading, setIsLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [previewPrompt, setPreviewPrompt] = useState(false);
  const [nicheTemplates, setNicheTemplates] = useState<NicheTemplate[]>([]);
  
  const [onboardingData, setOnboardingData] = useState<TenantOnboardingData>({
    openaiApiKey: '',
    openaiModel: 'gpt-4',
    whatsappInstances: [],
    selectedNicheId: '',
    variableValues: {},
    faqs: [],
  });
  
  const [newWhatsAppName, setNewWhatsAppName] = useState('');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: '' });
  
  // Load templates
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await fetchNicheTemplates();
        setNicheTemplates(data);
        if (data.length > 0 && !onboardingData.selectedNicheId) {
          setOnboardingData(prev => ({ ...prev, selectedNicheId: data[0].id }));
        }
      } catch (error) {
        console.error('Failed to load templates');
      }
    };
    loadTemplates();
  }, []);

  // Selected template
  const selectedTemplate = getTemplateById(nicheTemplates, onboardingData.selectedNicheId);
  
  // Initialize variable values when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const initialValues: Record<string, string> = {};
      selectedTemplate.variables.forEach(v => {
        initialValues[v.key] = onboardingData.variableValues[v.key] || '';
      });
      // Pre-fill nome_empresa with company name from registration
      if (user?.company && !initialValues['nome_empresa']) {
        initialValues['nome_empresa'] = user.company;
      }
      setOnboardingData(prev => ({
        ...prev,
        variableValues: initialValues,
        faqs: selectedTemplate.defaultFAQs.map(f => ({ ...f })),
      }));
    }
  }, [onboardingData.selectedNicheId, selectedTemplate, user?.company]);
  
  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  
  const handleNext = () => {
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    if (stepIndex < steps.length - 1) {
      setCurrentStep(steps[stepIndex + 1].id);
    }
  };
  
  const handleBack = () => {
    const stepIndex = steps.findIndex(s => s.id === currentStep);
    if (stepIndex > 0) {
      setCurrentStep(steps[stepIndex - 1].id);
    }
  };
  
  const handleComplete = async () => {
    setIsLoading(true);
    try {
      // Save onboarding data to backend
      await api.post('/tenants/onboarding', {
        nicheId: onboardingData.selectedNicheId,
        variables: onboardingData.variableValues,
        faqs: onboardingData.faqs,
      });
      
      toast.success('Configuração concluída! 🎉', {
        description: 'Seu assistente virtual está pronto para uso.',
      });
      
      navigate('/tenant/dashboard');
    } catch (error) {
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSkip = () => {
    toast.info('Você pode configurar tudo depois em Configurações.');
    navigate('/tenant/dashboard');
  };
  
  const handleCreateInstance = async () => {
    if (!newWhatsAppName.trim()) {
      toast.error('Digite um nome para a instância');
      return;
    }
    
    try {
      setQrCodeLoading(true);
      const instance = await createInstance(newWhatsAppName);
      setNewWhatsAppName('');
      
      // Get QR Code
      const qr = await getQrCode(instance.id);
      setQrCode(qr);
      setShowQrModal(true);
    } catch (error) {
      toast.error('Erro ao criar instância');
    } finally {
      setQrCodeLoading(false);
    }
  };
  
  const updateVariableValue = (key: string, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      variableValues: { ...prev.variableValues, [key]: value },
    }));
  };
  
  const addFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error('Preencha pergunta e resposta');
      return;
    }
    
    const faq: NicheFAQ = {
      id: `faq_${Date.now()}`,
      question: newFaq.question,
      answer: newFaq.answer,
      category: newFaq.category || 'geral',
      isDefault: false,
    };
    
    setOnboardingData(prev => ({
      ...prev,
      faqs: [...prev.faqs, faq],
    }));
    setNewFaq({ question: '', answer: '', category: '' });
    toast.success('FAQ adicionado!');
  };
  
  const removeFaq = (id: string) => {
    setOnboardingData(prev => ({
      ...prev,
      faqs: prev.faqs.filter(f => f.id !== id),
    }));
  };
  
  const getGeneratedPrompt = (): string => {
    if (!selectedTemplate) return '';
    return applyVariablesToPrompt(selectedTemplate.promptTemplate, onboardingData.variableValues);
  };
  
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'whatsapp':
        return true; // Optional step
      case 'niche':
        if (!selectedTemplate) return false;
        return selectedTemplate.variables
          .filter(v => v.required)
          .every(v => onboardingData.variableValues[v.key]?.trim());
      case 'faq':
        return true; // Optional step
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoIcon} alt="CodeSolve" className="h-10 drop-shadow-[0_0_8px_rgba(0,212,255,0.5)]" />
              <div>
                <h1 className="font-bold text-lg">Configuração Inicial</h1>
                <p className="text-xs text-muted-foreground">Configure seu assistente virtual</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Pular e configurar depois
            </Button>
          </div>
        </div>
      </header>
      
      {/* Progress */}
      <div className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            {steps.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = index < currentStepIndex;
              const Icon = step.icon;
              
              return (
                <div 
                  key={step.id}
                  className={`flex items-center gap-2 ${
                    isActive ? 'text-primary' : isCompleted ? 'text-cs-success' : 'text-muted-foreground'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : isCompleted 
                        ? 'bg-cs-success text-white' 
                        : 'bg-muted'
                  }`}>
                    {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
                </div>
              );
            })}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Step 1: WhatsApp */}
        {currentStep === 'whatsapp' && (
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Conecte seu WhatsApp</CardTitle>
                  <CardDescription>
                    O assistente precisa de uma conexão ativa para responder seus clientes.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input 
                  placeholder="Nome da conexão (ex: Atendimento)" 
                  value={newWhatsAppName}
                  onChange={(e) => setNewWhatsAppName(e.target.value)}
                  className="bg-muted border-border"
                />
                <Button onClick={handleCreateInstance} disabled={qrCodeLoading}>
                  {qrCodeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  Criar Conexão
                </Button>
              </div>

              <div className="space-y-3">
                {instances.map(inst => (
                  <div key={inst.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${inst.status === 'connected' ? 'bg-cs-success/10' : 'bg-cs-warning/10'}`}>
                        <Smartphone className={`w-5 h-5 ${inst.status === 'connected' ? 'text-cs-success' : 'text-cs-warning'}`} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{inst.name}</p>
                        <p className="text-xs text-muted-foreground">{inst.phone || 'Aguardando conexão'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={inst.status === 'connected' ? 'default' : 'secondary'} className={inst.status === 'connected' ? 'bg-cs-success hover:bg-cs-success' : ''}>
                        {inst.status === 'connected' ? 'Conectado' : 'Pendente'}
                      </Badge>
                      {inst.status !== 'connected' && (
                        <Button size="sm" variant="outline" onClick={async () => {
                          const qr = await getQrCode(inst.id);
                          setQrCode(qr);
                          setShowQrModal(true);
                        }}>
                          <QrCode className="w-4 h-4 mr-2" />
                          QR Code
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Niche */}
        {currentStep === 'niche' && (
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Escolha seu Nicho</CardTitle>
                  <CardDescription>
                    Selecione o modelo que melhor se adapta ao seu negócio.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nicheTemplates.map(template => (
                  <div 
                    key={template.id}
                    onClick={() => setOnboardingData(prev => ({ ...prev, selectedNicheId: template.id }))}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      onboardingData.selectedNicheId === template.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border bg-muted/30 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{template.icon}</span>
                      <h4 className="font-bold">{template.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                  </div>
                ))}
              </div>

              {selectedTemplate && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    Personalize as variáveis
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTemplate.variables.map(variable => (
                      <div key={variable.key} className="space-y-1.5">
                        <Label className="text-xs">
                          {variable.label}
                          {variable.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <Input 
                          placeholder={variable.placeholder}
                          value={onboardingData.variableValues[variable.key] || ''}
                          onChange={(e) => updateVariableValue(variable.key, e.target.value)}
                          className="bg-muted border-border h-9 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: FAQ */}
        {currentStep === 'faq' && (
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <HelpCircle className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Perguntas Frequentes (FAQs)</CardTitle>
                  <CardDescription>
                    Adicione informações específicas para treinar sua IA.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/30 p-4 rounded-lg border border-border space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Pergunta</Label>
                  <Input 
                    placeholder="Ex: Qual o valor da mensalidade?" 
                    value={newFaq.question}
                    onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                    className="bg-card border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Resposta</Label>
                  <Textarea 
                    placeholder="Ex: Nossa mensalidade custa R$ 150,00 no plano mensal." 
                    value={newFaq.answer}
                    onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                    className="bg-card border-border min-h-[80px]"
                  />
                </div>
                <Button size="sm" className="w-full" onClick={addFaq}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar FAQ
                </Button>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold">FAQs Adicionados ({onboardingData.faqs.length})</h4>
                <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                  {onboardingData.faqs.map(faq => (
                    <div key={faq.id} className="p-3 rounded-lg border border-border bg-muted/20 group relative">
                      <p className="text-sm font-medium pr-8">{faq.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">{faq.answer}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => removeFaq(faq.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStepIndex === 0 || isLoading}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          {currentStepIndex === steps.length - 1 ? (
            <Button 
              className="bg-gradient-to-r from-primary to-accent px-8"
              onClick={handleComplete}
              disabled={!canProceed() || isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
              Finalizar Configuração
            </Button>
          ) : (
            <Button 
              className="bg-primary px-8"
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
            >
              Próximo Passo
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
            <DialogDescription>
              Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e escaneie o código abaixo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6">
            {qrCode ? (
              <div className="bg-white p-4 rounded-xl">
                <img src={qrCode} alt="QR Code" className="w-64 h-64" />
              </div>
            ) : (
              <div className="w-64 h-64 bg-muted rounded-xl flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-6 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Aguardando leitura do código...
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
