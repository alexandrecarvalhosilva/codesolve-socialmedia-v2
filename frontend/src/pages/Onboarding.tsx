import { useState, useEffect } from 'react';
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
  nicheTemplates, 
  getTemplateById, 
  applyVariablesToPrompt,
  categoryToTemplateMap 
} from '@/data/nicheTemplatesMock';
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
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('whatsapp');
  const [isLoading, setIsLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCodeLoading, setQrCodeLoading] = useState(false);
  const [previewPrompt, setPreviewPrompt] = useState(false);
  
  // Get user's niche from registration
  const userNiche = user?.niche || 'outro';
  const suggestedTemplates = categoryToTemplateMap[userNiche] || ['custom'];
  
  const [onboardingData, setOnboardingData] = useState<TenantOnboardingData>({
    openaiApiKey: '', // Not used anymore - centralized in SuperAdmin
    openaiModel: 'gpt-4',
    whatsappInstances: [],
    selectedNicheId: suggestedTemplates[0] || 'custom',
    variableValues: {},
    faqs: [],
  });
  
  const [newWhatsAppName, setNewWhatsAppName] = useState('');
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: '' });
  
  // Selected template
  const selectedTemplate = getTemplateById(onboardingData.selectedNicheId);
  
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
    
    // Simulate saving onboarding data
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Save to localStorage to mark onboarding as complete
    localStorage.setItem('onboarding_complete', 'true');
    localStorage.setItem('tenant_config', JSON.stringify(onboardingData));
    
    toast.success('Configuração concluída! 🎉', {
      description: 'Seu assistente virtual está pronto para uso.',
    });
    
    navigate('/tenant/dashboard');
  };
  
  const handleSkip = () => {
    localStorage.setItem('onboarding_complete', 'skipped');
    toast.info('Você pode configurar tudo depois em Configurações.');
    navigate('/tenant/dashboard');
  };
  
  const addWhatsAppInstance = () => {
    if (!newWhatsAppName.trim()) {
      toast.error('Digite um nome para a instância');
      return;
    }
    
    const newInstance = {
      id: `wa_${Date.now()}`,
      name: newWhatsAppName,
      phone: '',
      status: 'pending' as const,
    };
    
    setOnboardingData(prev => ({
      ...prev,
      whatsappInstances: [...prev.whatsappInstances, newInstance],
    }));
    setNewWhatsAppName('');
    setShowQrModal(true);
  };
  
  const simulateQrScan = (instanceId: string) => {
    setQrCodeLoading(true);
    setTimeout(() => {
      setOnboardingData(prev => ({
        ...prev,
        whatsappInstances: prev.whatsappInstances.map(inst =>
          inst.id === instanceId
            ? { ...inst, status: 'connected' as const, phone: '+55 11 99999-9999' }
            : inst
        ),
      }));
      setQrCodeLoading(false);
      setShowQrModal(false);
      toast.success('WhatsApp conectado com sucesso!');
    }, 3000);
  };
  
  const removeWhatsAppInstance = (id: string) => {
    setOnboardingData(prev => ({
      ...prev,
      whatsappInstances: prev.whatsappInstances.filter(inst => inst.id !== id),
    }));
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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <CardTitle>Conectar WhatsApp</CardTitle>
                  <CardDescription>
                    Vincule suas instâncias do WhatsApp via Evolution API
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add new instance */}
              <div className="flex gap-3">
                <Input
                  placeholder="Nome da instância (ex: Atendimento Principal)"
                  value={newWhatsAppName}
                  onChange={(e) => setNewWhatsAppName(e.target.value)}
                />
                <Button onClick={addWhatsAppInstance} className="shrink-0">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </div>
              
              {/* Instances list */}
              {onboardingData.whatsappInstances.length > 0 ? (
                <div className="space-y-3">
                  {onboardingData.whatsappInstances.map(instance => (
                    <div 
                      key={instance.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/50"
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{instance.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {instance.phone || 'Aguardando conexão'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {instance.status === 'connected' ? (
                          <Badge className="bg-cs-success/20 text-cs-success border-cs-success/30">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Conectado
                          </Badge>
                        ) : instance.status === 'disconnected' ? (
                          <Badge variant="destructive">
                            <XCircle className="h-3 w-3 mr-1" />
                            Desconectado
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setShowQrModal(true);
                            }}
                          >
                            <QrCode className="h-4 w-4 mr-2" />
                            Escanear QR
                          </Button>
                        )}
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-muted-foreground hover:text-cs-error"
                          onClick={() => removeWhatsAppInstance(instance.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Nenhuma instância configurada</p>
                  <p className="text-sm">Adicione uma instância para conectar seu WhatsApp</p>
                </div>
              )}
              
              <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">💡 Dica</p>
                <p>Você pode adicionar várias instâncias para diferentes departamentos ou números.</p>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Step 3: Niche & Prompt */}
        {currentStep === 'niche' && (
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Personalizar Assistente</CardTitle>
                  <CardDescription>
                    Escolha um template de nicho e customize as variáveis
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Template Selection */}
              <div className="space-y-3">
                <Label>Template de Nicho</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {nicheTemplates.filter(t => t.isActive).map(template => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setOnboardingData(prev => ({ ...prev, selectedNicheId: template.id }))}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        onboardingData.selectedNicheId === template.id
                          ? 'border-primary bg-primary/10 ring-1 ring-primary'
                          : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <span className="text-2xl">{template.icon}</span>
                      <p className="font-medium text-sm mt-2">{template.name}</p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {template.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Variables */}
              {selectedTemplate && (
                <div className="space-y-4 border-t border-border pt-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Personalize seu Assistente</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewPrompt(!previewPrompt)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {previewPrompt ? 'Ocultar Prompt' : 'Ver Prompt'}
                    </Button>
                  </div>
                  
                  <div className="grid gap-4">
                    {selectedTemplate.variables.map(variable => (
                      <div key={variable.key} className="space-y-2">
                        <Label htmlFor={variable.key}>
                          {variable.label}
                          {variable.required && <span className="text-cs-error ml-1">*</span>}
                        </Label>
                        {variable.type === 'textarea' ? (
                          <Textarea
                            id={variable.key}
                            placeholder={variable.placeholder}
                            value={onboardingData.variableValues[variable.key] || ''}
                            onChange={(e) => updateVariableValue(variable.key, e.target.value)}
                            rows={4}
                          />
                        ) : (
                          <Input
                            id={variable.key}
                            placeholder={variable.placeholder}
                            value={onboardingData.variableValues[variable.key] || ''}
                            onChange={(e) => updateVariableValue(variable.key, e.target.value)}
                          />
                        )}
                        <p className="text-xs text-muted-foreground">{variable.description}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Prompt Preview */}
                  {previewPrompt && (
                    <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm">Preview do Prompt</Label>
                        <Badge variant="secondary">Preview</Badge>
                      </div>
                      <pre className="text-xs font-mono whitespace-pre-wrap text-muted-foreground max-h-64 overflow-y-auto">
                        {getGeneratedPrompt()}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Step 4: FAQs */}
        {currentStep === 'faq' && (
          <Card className="bg-cs-bg-card border-border">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                  <HelpCircle className="h-6 w-6 text-amber-500" />
                </div>
                <div>
                  <CardTitle>Base de Conhecimento (FAQ)</CardTitle>
                  <CardDescription>
                    Configure perguntas frequentes para respostas mais precisas
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="list">FAQs Atuais ({onboardingData.faqs.length})</TabsTrigger>
                  <TabsTrigger value="add">Adicionar Novo</TabsTrigger>
                </TabsList>
                
                <TabsContent value="list" className="mt-4 space-y-3">
                  {onboardingData.faqs.length > 0 ? (
                    onboardingData.faqs.map(faq => (
                      <div 
                        key={faq.id}
                        className="p-4 rounded-lg border border-border bg-card/50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium text-sm">{faq.question}</p>
                              {faq.isDefault && (
                                <Badge variant="secondary" className="text-xs">Template</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                            <Badge variant="outline" className="mt-2 text-xs">{faq.category}</Badge>
                          </div>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-muted-foreground hover:text-cs-error shrink-0"
                            onClick={() => removeFaq(faq.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <HelpCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p>Nenhuma FAQ configurada</p>
                      <p className="text-sm">Adicione perguntas frequentes para melhorar as respostas</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="add" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label>Pergunta</Label>
                    <Input
                      placeholder="Ex: Qual o horário de funcionamento?"
                      value={newFaq.question}
                      onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Resposta</Label>
                    <Textarea
                      placeholder="Ex: Funcionamos de segunda a sexta, das 8h às 18h."
                      value={newFaq.answer}
                      onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Input
                      placeholder="Ex: horarios, precos, servicos"
                      value={newFaq.category}
                      onChange={(e) => setNewFaq(prev => ({ ...prev, category: e.target.value }))}
                    />
                  </div>
                  <Button onClick={addFaq} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar FAQ
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
        
        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          
          {currentStepIndex < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="btn-gradient"
            >
              Continuar
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="btn-gradient"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Concluir Configuração
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      {/* QR Code Modal */}
      <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear QR Code</DialogTitle>
            <DialogDescription>
              Abra o WhatsApp no seu celular e escaneie o QR Code abaixo
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-6">
            {qrCodeLoading ? (
              <div className="w-48 h-48 flex items-center justify-center bg-muted rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Simulated QR Code */}
                <div className="w-48 h-48 bg-white p-4 rounded-lg">
                  <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2Ij48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2ZmZiIvPjxwYXRoIGQ9Ik0zMiAzMmg2NHY2NEgzMnptOCA4djQ4aDQ4VjQwem04IDhoMzJ2MzJINDh6bTgwLThoNjR2NjRoLTY0em04IDh2NDhoNDhWNDB6bTggOGgzMnYzMmgtMzJ6TTMyIDE2MGg2NHY2NEgzMnptOCA4djQ4aDQ4di00OHptOCA4aDMydjMySDQ4eiIvPjxwYXRoIGQ9Ik0xMjggMzJoOHYxNmgtOHptMTYgMGg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2OGgtOHptMTYgMGg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2MzJoLTh6bS05NiAxNmg4djhoLTh6bTE2IDBoOHYxNmgtOHptMTYgMGg4djhoLTh6bTMyIDBoOHY4aC04em0tNjQgOGg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2OGgtOHptMTYgMGg4djhoLTh6bS04MCAxNmg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2OGgtOHptMTYgMGg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2OGgtOHptMTYgMGg4djhoLTh6bS0xMTIgOGg4djhoLTh6bTMyIDBoOHY4aC04em0zMiAwaDh2OGgtOHptMzIgMGg4djhoLTh6bS0xMTIgOGg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2OGgtOHptMTYgMGg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2OGgtOHptMTYgMGg4djhoLTh6bS0xMTIgOGg4djhoLTh6bTY0IDBoOHY4aC04em0tNDggOGg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2OGgtOHptMTYgMGg4djhoLTh6bTE2IDBoOHY4aC04em0xNiAwaDh2OGgtOHoiLz48L3N2Zz4=')] bg-contain" />
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  WhatsApp &gt; Menu &gt; Aparelhos conectados &gt; Conectar aparelho
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => {
                    const lastInstance = onboardingData.whatsappInstances[onboardingData.whatsappInstances.length - 1];
                    if (lastInstance) {
                      simulateQrScan(lastInstance.id);
                    }
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Simular Conexão
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
