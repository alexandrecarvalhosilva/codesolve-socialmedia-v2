import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Save, 
  Plus,
  Trash2,
  Eye,
  RotateCcw,
  X,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Send,
  Bot,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { fetchNicheTemplates, getTemplateById, applyVariablesToPrompt } from '@/services/templateService';
import { NicheTemplate, NicheFAQ } from '@/types/nicheTemplate';

// LocalStorage key for persisting IA config
const IA_CONFIG_STORAGE_KEY = 'tenant_ia_config';

// Interface for stored config
interface IAConfigStorage {
  useTemplate: boolean;
  useCustom: boolean;
  selectedTemplateId: string;
  variableValues: Record<string, string>;
  customPrompt: string;
  customFaqs: NicheFAQ[];
  tomVoz: string;
  idioma: string;
  usarEmojis: boolean;
}

// Chat message interface for preview
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Normalize text for matching (remove accents, lowercase)
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .trim();
};

// Calculate similarity score between two strings (0-1)
const calculateSimilarity = (str1: string, str2: string): number => {
  const words1 = normalizeText(str1).split(/\s+/).filter(w => w.length > 2);
  const words2 = normalizeText(str2).split(/\s+/).filter(w => w.length > 2);
  
  if (words1.length === 0 || words2.length === 0) return 0;
  
  let matches = 0;
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
        matches++;
        break;
      }
    }
  }
  
  return matches / Math.max(words1.length, words2.length);
};

// Find best FAQ match with improved algorithm
const findBestFaqMatch = (userMessage: string, faqs: NicheFAQ[]): NicheFAQ | null => {
  if (faqs.length === 0) return null;
  
  let bestMatch: NicheFAQ | null = null;
  let bestScore = 0;
  const threshold = 0.3;
  
  for (const faq of faqs) {
    const questionScore = calculateSimilarity(userMessage, faq.question);
    const answerScore = calculateSimilarity(userMessage, faq.answer) * 0.3;
    const categoryScore = normalizeText(userMessage).includes(normalizeText(faq.category)) ? 0.2 : 0;
    const totalScore = questionScore + answerScore + categoryScore;
    
    if (totalScore > bestScore && totalScore >= threshold) {
      bestScore = totalScore;
      bestMatch = faq;
    }
  }
  
  return bestMatch;
};

// Mock AI responses based on prompt and FAQs
const generateMockAIResponse = (userMessage: string, prompt: string, faqs: NicheFAQ[], settings: { tomVoz: string; usarEmojis: boolean }): string => {
  const lowerMessage = userMessage.toLowerCase();
  
  const matchedFaq = findBestFaqMatch(userMessage, faqs);
  if (matchedFaq) {
    const response = settings.usarEmojis ? `${matchedFaq.answer} 😊` : matchedFaq.answer;
    return response;
  }
  
  if (lowerMessage.includes('olá') || lowerMessage.includes('oi') || lowerMessage.includes('bom dia') || lowerMessage.includes('boa tarde') || lowerMessage.includes('boa noite')) {
    const greeting = settings.tomVoz === 'Formal' 
      ? 'Olá! Seja bem-vindo. Como posso auxiliá-lo hoje?' 
      : 'Oi! Tudo bem? Como posso te ajudar?';
    return settings.usarEmojis ? `${greeting} 👋` : greeting;
  }
  
  if (lowerMessage.includes('preço') || lowerMessage.includes('valor') || lowerMessage.includes('quanto') || lowerMessage.includes('custo') || lowerMessage.includes('mensalidade')) {
    const priceResponse = settings.tomVoz === 'Formal'
      ? 'Para informações sobre valores e planos, recomendo verificar nossa tabela de preços ou entrar em contato conosco diretamente.'
      : 'Sobre valores, a gente tem várias opções! Quer que eu te passe mais detalhes?';
    return settings.usarEmojis ? `${priceResponse} 💰` : priceResponse;
  }
  
  if (lowerMessage.includes('horário') || lowerMessage.includes('funciona') || lowerMessage.includes('abre') || lowerMessage.includes('fecha') || lowerMessage.includes('expediente')) {
    const scheduleResponse = settings.tomVoz === 'Formal'
      ? 'Nosso horário de funcionamento pode variar. Posso verificar para você.'
      : 'Sobre horários, deixa eu ver aqui pra você!';
    return settings.usarEmojis ? `${scheduleResponse} 🕐` : scheduleResponse;
  }
  
  if (lowerMessage.includes('agendar') || lowerMessage.includes('marcar') || lowerMessage.includes('reservar') || lowerMessage.includes('consulta') || lowerMessage.includes('atendimento')) {
    const bookingResponse = settings.tomVoz === 'Formal'
      ? 'Ficarei feliz em ajudá-lo a realizar um agendamento. Qual seria a data e horário de sua preferência?'
      : 'Claro! Posso te ajudar a agendar. Qual dia e horário ficam melhor pra você?';
    return settings.usarEmojis ? `${bookingResponse} 📅` : bookingResponse;
  }
  
  if (lowerMessage.includes('obrigado') || lowerMessage.includes('obrigada') || lowerMessage.includes('valeu') || lowerMessage.includes('agradeço')) {
    const thanksResponse = settings.tomVoz === 'Formal'
      ? 'Por nada! Estou à disposição para qualquer outra dúvida.'
      : 'Imagina! Qualquer coisa é só chamar!';
    return settings.usarEmojis ? `${thanksResponse} 🙏` : thanksResponse;
  }
  
  const defaultResponse = settings.tomVoz === 'Formal'
    ? 'Agradeço pelo contato. Posso ajudá-lo com informações sobre nossos serviços, agendamentos ou outras dúvidas que possa ter.'
    : 'Entendi! Posso te ajudar com várias coisas por aqui. O que você precisa saber?';
  return settings.usarEmojis ? `${defaultResponse} 😊` : defaultResponse;
};

// Default config for reset
const getDefaultConfig = (): IAConfigStorage => ({
  useTemplate: true,
  useCustom: false,
  selectedTemplateId: 'academia-jiu-jitsu',
  variableValues: {},
  customPrompt: '',
  customFaqs: [],
  tomVoz: 'Amigável',
  idioma: 'Português (BR)',
  usarEmojis: true
});

export function TenantAIConfigTab() {
  // Templates loaded from backend
  const [nicheTemplates, setNicheTemplates] = useState<NicheTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templates = await fetchNicheTemplates();
        setNicheTemplates(templates);
      } catch (error) {
        console.error('Failed to load templates:', error);
      } finally {
        setTemplatesLoading(false);
      }
    };
    loadTemplates();
  }, []);

  // Checkbox toggles for Template and Custom
  const [useTemplate, setUseTemplate] = useState(true);
  const [useCustom, setUseCustom] = useState(false);
  
  // Template mode state
  const [selectedTemplateId, setSelectedTemplateId] = useState('academia-jiu-jitsu');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [templateFaqs, setTemplateFaqs] = useState<NicheFAQ[]>([]);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  
  // Custom mode state
  const [customPrompt, setCustomPrompt] = useState('');
  const [customFaqs, setCustomFaqs] = useState<NicheFAQ[]>([]);
  
  // Common settings
  const [tomVoz, setTomVoz] = useState('Amigável');
  const [idioma, setIdioma] = useState('Português (BR)');
  const [usarEmojis, setUsarEmojis] = useState(true);
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Chat preview modal state
  const [showChatPreview, setShowChatPreview] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Saved config state for dirty checking
  const [savedConfig, setSavedConfig] = useState<IAConfigStorage | null>(null);
  
  // Reset confirmation modal
  const [showResetModal, setShowResetModal] = useState(false);
  
  // FAQ Modal
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', category: '' });

  // Selected template
  const selectedTemplate = getTemplateById(nicheTemplates, selectedTemplateId);
  
  // Active templates only
  const activeTemplates = nicheTemplates.filter(t => t.isActive);

  // Load config from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(IA_CONFIG_STORAGE_KEY);
      if (stored) {
        const config: IAConfigStorage = JSON.parse(stored);
        setUseTemplate(config.useTemplate);
        setUseCustom(config.useCustom);
        setSelectedTemplateId(config.selectedTemplateId);
        setVariableValues(config.variableValues);
        setCustomPrompt(config.customPrompt);
        setCustomFaqs(config.customFaqs);
        setTomVoz(config.tomVoz);
        setIdioma(config.idioma);
        setUsarEmojis(config.usarEmojis);
        setSavedConfig(config);
        toast.success('Configurações carregadas do armazenamento local');
      } else {
        setSavedConfig(getDefaultConfig());
      }
    } catch (error) {
      console.error('Error loading IA config from localStorage:', error);
      setSavedConfig(getDefaultConfig());
    }
  }, []);

  // Current config for dirty checking
  const currentConfig = useMemo((): IAConfigStorage => ({
    useTemplate,
    useCustom,
    selectedTemplateId,
    variableValues: useTemplate ? variableValues : {},
    customPrompt: useCustom ? customPrompt : '',
    customFaqs,
    tomVoz,
    idioma,
    usarEmojis
  }), [useTemplate, useCustom, selectedTemplateId, variableValues, customPrompt, customFaqs, tomVoz, idioma, usarEmojis]);

  // Check if config has unsaved changes
  const isDirty = useMemo(() => {
    if (!savedConfig) return false;
    return JSON.stringify(currentConfig) !== JSON.stringify(savedConfig);
  }, [currentConfig, savedConfig]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Initialize template FAQs when template changes
  useEffect(() => {
    if (selectedTemplate && useTemplate) {
      const initialValues: Record<string, string> = {};
      selectedTemplate.variables.forEach(v => {
        initialValues[v.key] = variableValues[v.key] || '';
      });
      if (Object.keys(variableValues).length === 0) {
        setVariableValues(initialValues);
      }
      if (templateFaqs.length === 0) {
        setTemplateFaqs(selectedTemplate.defaultFAQs.map(f => ({ ...f })));
      }
    }
  }, [selectedTemplateId, selectedTemplate, useTemplate]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setVariableValues({});
    setTemplateFaqs([]);
    setValidationErrors({});
  };

  const updateVariableValue = (key: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [key]: value }));
  };

  const getGeneratedPrompt = (): string => {
    if (!selectedTemplate) return '';
    return applyVariablesToPrompt(selectedTemplate.promptTemplate, variableValues);
  };

  const getFinalPrompt = (): string => {
    let parts: string[] = [];
    
    if (useTemplate && selectedTemplate) {
      parts.push(applyVariablesToPrompt(selectedTemplate.promptTemplate, variableValues));
    }
    
    if (useCustom && customPrompt.trim()) {
      parts.push(customPrompt.trim());
    }
    
    return parts.join('\n\n---\n\n');
  };

  const getFinalFaqs = (): NicheFAQ[] => {
    let faqs: NicheFAQ[] = [];
    
    if (useTemplate) {
      faqs = [...faqs, ...templateFaqs];
    }
    
    faqs = [...faqs, ...customFaqs];
    
    return faqs;
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
    
    setCustomFaqs(prev => [...prev, faq]);
    
    setNewFaq({ question: '', answer: '', category: '' });
    setShowFaqModal(false);
    toast.success('FAQ adicionada!');
  };

  const removeFaq = (id: string, isFromTemplate: boolean) => {
    if (isFromTemplate) {
      setTemplateFaqs(prev => prev.filter(f => f.id !== id));
    } else {
      setCustomFaqs(prev => prev.filter(f => f.id !== id));
    }
  };

  const validateRequiredVariables = useCallback((): boolean => {
    if (!useTemplate || !selectedTemplate) return true;
    
    const errors: Record<string, string> = {};
    let hasErrors = false;
    
    selectedTemplate.variables.forEach(variable => {
      if (variable.required && (!variableValues[variable.key] || !variableValues[variable.key].trim())) {
        errors[variable.key] = `${variable.label} é obrigatório`;
        hasErrors = true;
      }
    });
    
    setValidationErrors(errors);
    return !hasErrors;
  }, [useTemplate, selectedTemplate, variableValues]);

  const saveIAConfig = () => {
    if (!useTemplate && !useCustom) {
      toast.error('Selecione pelo menos uma opção: Template ou Customizado');
      return;
    }
    
    if (!validateRequiredVariables()) {
      toast.error('Preencha todos os campos obrigatórios antes de salvar');
      return;
    }
    
    if (useCustom && !useTemplate && !customPrompt.trim()) {
      toast.error('Digite um prompt customizado');
      return;
    }
    
    const config: IAConfigStorage = {
      useTemplate,
      useCustom,
      selectedTemplateId,
      variableValues: useTemplate ? variableValues : {},
      customPrompt: useCustom ? customPrompt : '',
      customFaqs,
      tomVoz,
      idioma,
      usarEmojis
    };
    
    try {
      localStorage.setItem(IA_CONFIG_STORAGE_KEY, JSON.stringify(config));
      setSavedConfig(config);
      console.log('Saving IA config:', config);
      toast.success('Configuração de IA salva com sucesso!');
    } catch (error) {
      console.error('Error saving IA config to localStorage:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const resetConfig = () => {
    const defaults = getDefaultConfig();
    setUseTemplate(defaults.useTemplate);
    setUseCustom(defaults.useCustom);
    setSelectedTemplateId(defaults.selectedTemplateId);
    setVariableValues({});
    setTemplateFaqs([]);
    setCustomPrompt(defaults.customPrompt);
    setCustomFaqs([]);
    setTomVoz(defaults.tomVoz);
    setIdioma(defaults.idioma);
    setUsarEmojis(defaults.usarEmojis);
    setValidationErrors({});
    
    localStorage.removeItem(IA_CONFIG_STORAGE_KEY);
    setSavedConfig(defaults);
    
    setShowResetModal(false);
    toast.success('Configurações resetadas para os valores padrão');
  };

  const openChatPreview = () => {
    if (!validateRequiredVariables()) {
      toast.error('Preencha os campos obrigatórios antes de testar');
      return;
    }
    setChatMessages([]);
    setChatInput('');
    setShowChatPreview(true);
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    
    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: chatInput.trim(),
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsTyping(true);
    
    setTimeout(() => {
      const aiResponse = generateMockAIResponse(
        userMessage.content,
        getFinalPrompt(),
        getFinalFaqs(),
        { tomVoz, usarEmojis }
      );
      
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const getModeDescription = (): string => {
    if (useTemplate && useCustom) return 'Template + Customizado';
    if (useTemplate) return 'Somente Template';
    if (useCustom) return 'Somente Customizado';
    return 'Nenhum modo selecionado';
  };

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-cs-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Configuração de IA Humanizada
              {isDirty && (
                <Badge variant="secondary" className="ml-2 bg-warning/20 text-warning-foreground border-warning/30 text-xs">
                  Não salvo
                </Badge>
              )}
            </h3>
            <p className="text-sm text-cs-text-secondary">
              Configure o comportamento da IA para responder automaticamente às mensagens WhatsApp
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setShowResetModal(true)}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetar
          </Button>
        </div>

        {/* Mode Selection with Checkboxes */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Modo de Operação</Label>
            <Badge variant="outline" className="text-xs">
              {getModeDescription()}
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Use Template Checkbox */}
            <div 
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                useTemplate 
                  ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                  : 'border-border bg-cs-bg-primary hover:border-muted-foreground'
              }`}
              onClick={() => setUseTemplate(!useTemplate)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                  useTemplate ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`}>
                  {useTemplate && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Usar Template de Nicho</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Utilize um template pré-configurado com variáveis personalizáveis
                  </p>
                </div>
              </div>
            </div>

            {/* Use Custom Checkbox */}
            <div 
              className={`p-4 rounded-lg border transition-all cursor-pointer ${
                useCustom 
                  ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                  : 'border-border bg-cs-bg-primary hover:border-muted-foreground'
              }`}
              onClick={() => setUseCustom(!useCustom)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                  useCustom ? 'border-primary bg-primary' : 'border-muted-foreground'
                }`}>
                  {useCustom && <CheckCircle2 className="w-4 h-4 text-primary-foreground" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">Adicionar Prompt Customizado</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Escreva instruções adicionais para complementar ou substituir o template
                  </p>
                </div>
              </div>
            </div>
          </div>

          {!useTemplate && !useCustom && (
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive">Selecione pelo menos uma opção para configurar a IA</p>
            </div>
          )}
        </div>

        {/* Template Section - Only if useTemplate is checked */}
        {useTemplate && (
          <div className="space-y-6 border-t border-border pt-6 mb-6">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <Label className="text-base font-medium">Configuração do Template</Label>
            </div>

            {/* Template Selection */}
            <div className="space-y-3">
              <Label className="text-sm">Selecione o Template de Nicho</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {activeTemplates.map(template => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => handleTemplateChange(template.id)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      selectedTemplateId === template.id
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground bg-cs-bg-primary'
                    }`}
                  >
                    <span className="text-2xl">{template.icon}</span>
                    <p className="font-medium text-sm mt-2 text-foreground">{template.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  </button>
                ))}
              </div>
              {activeTemplates.length === 0 && (
                <div className="text-center py-8 text-muted-foreground bg-cs-bg-primary rounded-lg">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum template de nicho disponível</p>
                  <p className="text-sm">Entre em contato com o suporte</p>
                </div>
              )}
            </div>

            {/* Variables for selected template */}
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Personalize as Variáveis</Label>
                    <p className="text-xs text-muted-foreground">Preencha os campos para personalizar o prompt</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPromptPreview(!showPromptPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {showPromptPreview ? 'Ocultar Prompt' : 'Ver Prompt'}
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {selectedTemplate.variables.map(variable => (
                    <div key={variable.key} className="space-y-2">
                      <Label htmlFor={variable.key}>
                        {variable.label}
                        {variable.required && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {variable.type === 'textarea' ? (
                        <Textarea
                          id={variable.key}
                          value={variableValues[variable.key] || ''}
                          onChange={(e) => {
                            updateVariableValue(variable.key, e.target.value);
                            if (validationErrors[variable.key]) {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[variable.key];
                                return newErrors;
                              });
                            }
                          }}
                          placeholder={variable.placeholder}
                          className={`bg-cs-bg-primary border-border min-h-[100px] ${
                            validationErrors[variable.key] ? 'border-destructive ring-1 ring-destructive' : ''
                          }`}
                        />
                      ) : (
                        <Input
                          id={variable.key}
                          value={variableValues[variable.key] || ''}
                          onChange={(e) => {
                            updateVariableValue(variable.key, e.target.value);
                            if (validationErrors[variable.key]) {
                              setValidationErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[variable.key];
                                return newErrors;
                              });
                            }
                          }}
                          placeholder={variable.placeholder}
                          className={`bg-cs-bg-primary border-border ${
                            validationErrors[variable.key] ? 'border-destructive ring-1 ring-destructive' : ''
                          }`}
                        />
                      )}
                      {validationErrors[variable.key] ? (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {validationErrors[variable.key]}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">{variable.description}</p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Prompt Preview */}
                {showPromptPreview && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium mb-2 block">Preview do Prompt do Template</Label>
                    <pre className="p-4 bg-cs-bg-primary rounded-lg text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto border border-border">
                      {getGeneratedPrompt()}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Template FAQs */}
            {templateFaqs.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  FAQs do Template ({templateFaqs.length})
                </p>
                <div className="space-y-2">
                  {templateFaqs.map(faq => (
                    <div key={faq.id} className="p-3 bg-cs-bg-primary rounded-lg border border-border flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-foreground">{faq.question}</p>
                          <Badge variant="secondary" className="text-xs">Template</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFaq(faq.id, true)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Custom Prompt Section - Only if useCustom is checked */}
        {useCustom && (
          <div className="space-y-4 border-t border-border pt-6 mb-6">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <Label className="text-base font-medium">Prompt Customizado</Label>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground mb-2">
                {useTemplate 
                  ? 'Estas instruções serão adicionadas após o prompt do template'
                  : 'Escreva seu próprio prompt para definir o comportamento da IA'
                }
              </p>
              <Textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={useTemplate 
                  ? "Adicione instruções complementares aqui..."
                  : "Digite o prompt personalizado do seu assistente virtual..."
                }
                className="bg-cs-bg-primary border-border min-h-[200px] font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* Combined Settings - Always visible if at least one option is selected */}
        {(useTemplate || useCustom) && (
          <>
            {/* Voice Settings */}
            <div className="space-y-4 border-t border-border pt-6">
              <Label className="text-base font-medium">Configurações de Tom</Label>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm">Tom de Voz</Label>
                  <Select value={tomVoz} onValueChange={setTomVoz}>
                    <SelectTrigger className="bg-cs-bg-primary border-border mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Amigável">Amigável</SelectItem>
                      <SelectItem value="Profissional">Profissional</SelectItem>
                      <SelectItem value="Casual">Casual</SelectItem>
                      <SelectItem value="Formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Idioma</Label>
                  <Select value={idioma} onValueChange={setIdioma}>
                    <SelectTrigger className="bg-cs-bg-primary border-border mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Português (BR)">Português (BR)</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Español">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Usar Emojis</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <Switch 
                      checked={usarEmojis} 
                      onCheckedChange={setUsarEmojis}
                    />
                    <span className="text-sm text-muted-foreground">{usarEmojis ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Custom FAQs Section - Always visible */}
            <div className="space-y-4 border-t border-border pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">FAQs Personalizadas</Label>
                  <p className="text-xs text-muted-foreground">
                    {useTemplate 
                      ? 'Adicione FAQs além das herdadas do template'
                      : 'Crie sua própria base de conhecimento'
                    }
                  </p>
                </div>
                <Button onClick={() => setShowFaqModal(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar FAQ
                </Button>
              </div>

              {customFaqs.length > 0 ? (
                <div className="space-y-2">
                  {customFaqs.map(faq => (
                    <div key={faq.id} className="p-3 bg-cs-bg-primary rounded-lg border border-primary/30 flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm text-foreground">{faq.question}</p>
                          <Badge className="text-xs bg-primary/20 text-primary border-primary/30">Personalizada</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{faq.answer}</p>
                        {faq.category && (
                          <Badge variant="outline" className="mt-2 text-xs">{faq.category}</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeFaq(faq.id, false)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground bg-cs-bg-primary rounded-lg">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma FAQ personalizada</p>
                  <p className="text-xs">Adicione perguntas e respostas para a IA consultar</p>
                </div>
              )}
            </div>

            {/* Final Prompt Preview */}
            {(useTemplate && useCustom) && (
              <div className="space-y-4 border-t border-border pt-6">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Preview do Prompt Final</Label>
                  <Badge variant="outline" className="text-xs">Template + Customizado</Badge>
                </div>
                <pre className="p-4 bg-cs-bg-primary rounded-lg text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto border border-border">
                  {getFinalPrompt()}
                </pre>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button onClick={openChatPreview} variant="outline" className="flex-1">
                <MessageCircle className="w-4 h-4 mr-2" />
                Testar Conversa
              </Button>
              <Button onClick={saveIAConfig} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                Salvar Configuração
              </Button>
            </div>
          </>
        )}
      </div>

      {/* FAQ Modal */}
      <Dialog open={showFaqModal} onOpenChange={setShowFaqModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Adicionar FAQ</DialogTitle>
            <DialogDescription>
              Adicione uma pergunta frequente e sua resposta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pergunta</Label>
              <Input
                value={newFaq.question}
                onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                placeholder="Ex: Qual o horário de funcionamento?"
                className="bg-cs-bg-primary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label>Resposta</Label>
              <Textarea
                value={newFaq.answer}
                onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="Ex: Funcionamos de segunda a sexta, das 8h às 18h."
                className="bg-cs-bg-primary border-border min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria (opcional)</Label>
              <Input
                value={newFaq.category}
                onChange={(e) => setNewFaq(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Ex: horários, preços, localização..."
                className="bg-cs-bg-primary border-border"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFaqModal(false)}>
              Cancelar
            </Button>
            <Button onClick={addFaq}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Chat Preview Modal */}
      <Dialog open={showChatPreview} onOpenChange={setShowChatPreview}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-primary" />
              Testar Conversa com IA
            </DialogTitle>
            <DialogDescription>
              Simule uma conversa para testar o comportamento da IA com as configurações atuais.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-[300px] max-h-[400px]">
            {chatMessages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Envie uma mensagem para iniciar a conversa</p>
                <p className="text-xs mt-2">Experimente: "Olá", "Qual o preço?", "Quero agendar"</p>
              </div>
            )}
            
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                )}
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-cs-bg-primary border border-border'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-cs-bg-primary border border-border p-3 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t border-border">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendChatMessage()}
              placeholder="Digite sua mensagem..."
              className="bg-cs-bg-primary border-border"
              disabled={isTyping}
            />
            <Button onClick={sendChatMessage} disabled={isTyping || !chatInput.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <DialogFooter className="pt-4">
            <p className="text-xs text-muted-foreground flex-1">
              💡 Esta é uma simulação. Em produção, as respostas serão geradas pela IA com base no prompt configurado.
            </p>
            <Button variant="outline" onClick={() => setShowChatPreview(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Modal */}
      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Confirmar Reset
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja resetar todas as configurações de IA para os valores padrão? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-sm text-destructive">
                Isso irá limpar:
              </p>
              <ul className="text-sm text-destructive mt-2 space-y-1 list-disc list-inside">
                <li>Template selecionado e variáveis</li>
                <li>Prompt customizado</li>
                <li>FAQs personalizadas</li>
                <li>Configurações de tom, idioma e emojis</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetModal(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={resetConfig}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar Tudo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
