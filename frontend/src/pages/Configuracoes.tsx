import { useState } from 'react';
import { Settings, Bell, Lock, Globe, Mail, MessageSquare, Save, TestTube, Copy, Check, Edit2, Key, Eye, EyeOff, CheckCircle2, XCircle, Loader2, Brain, Puzzle } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { ModulesTab } from '@/components/settings/ModulesTab';

export default function Configuracoes() {
  const { toast } = useToast();
  
  // OpenAI settings
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [openaiStatus, setOpenaiStatus] = useState<'idle' | 'testing' | 'valid' | 'invalid'>('idle');
  const [openaiKeyConfigured, setOpenaiKeyConfigured] = useState(false);
  
  // Email settings
  const [emailProvider, setEmailProvider] = useState('resend');
  const [emailApiKey, setEmailApiKey] = useState('re_**********************');
  const [emailFrom, setEmailFrom] = useState('noreply@codesolve.com.br');
  const [emailFromName, setEmailFromName] = useState('CodeSolve Social');
  
  // WhatsApp settings
  const [evolutionUrl, setEvolutionUrl] = useState('https://api.gandhivati.com.br/');
  const [evolutionApiKey, setEvolutionApiKey] = useState('••••••••••••••••••••••••••••••••');
  const [webhookBaseUrl, setWebhookBaseUrl] = useState('https://3000-iccu6h66sbo1pfzkpze0-f91a623f.us2.manus.computer/api/webhook/evolution');
  
  // Security settings
  const [minPasswordLength, setMinPasswordLength] = useState('8');
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [tokenExpiration, setTokenExpiration] = useState('60');
  const [tempPasswordExpiration, setTempPasswordExpiration] = useState('7');
  
  // General settings
  const [platformName, setPlatformName] = useState('CodeSolve Social Media');
  const [timezone, setTimezone] = useState('America/Sao_Paulo');
  const [language, setLanguage] = useState('pt-BR');
  
  // Domain settings
  const [activeEnvironment, setActiveEnvironment] = useState('staging');
  const [prodUrl, setProdUrl] = useState('https://prod.example.com');
  const [stagingUrl, setStagingUrl] = useState('https://3000-iccu6h66sbo1pfzkpze0-f91a623f.us2.manus.computer');
  const [editDomainOpen, setEditDomainOpen] = useState(false);
  
  // Clipboard
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // OpenAI handlers
  const handleTestOpenAI = async () => {
    if (!openaiApiKey || !openaiApiKey.startsWith('sk-')) {
      toast({ title: "Chave inválida", description: "A API Key deve começar com 'sk-'", variant: "destructive" });
      return;
    }
    
    setOpenaiStatus('testing');
    
    // Simulate API validation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo, assume valid if key starts with sk- and has > 20 chars
    if (openaiApiKey.length > 20) {
      setOpenaiStatus('valid');
      toast({ title: "Chave válida ✓", description: "A API Key da OpenAI foi validada com sucesso." });
    } else {
      setOpenaiStatus('invalid');
      toast({ title: "Chave inválida", description: "Não foi possível validar a API Key.", variant: "destructive" });
    }
  };

  const handleSaveOpenAI = () => {
    if (openaiStatus !== 'valid') {
      toast({ title: "Valide primeiro", description: "Teste a conexão antes de salvar.", variant: "destructive" });
      return;
    }
    setOpenaiKeyConfigured(true);
    toast({ title: "Configurações salvas", description: "A API Key da OpenAI foi salva com sucesso." });
  };

  const handleSaveEmail = () => {
    toast({ title: "Configurações salvas", description: "As configurações de email foram atualizadas." });
  };

  const handleTestEmail = () => {
    toast({ title: "Email de teste enviado", description: "Verifique sua caixa de entrada." });
  };

  const handleSaveWhatsApp = () => {
    toast({ title: "Configurações salvas", description: "As configurações do WhatsApp foram atualizadas." });
  };

  const handleTestConnection = () => {
    toast({ title: "Testando conexão", description: "Verificando conectividade com Evolution API..." });
    setTimeout(() => {
      toast({ title: "Conexão bem sucedida", description: "A Evolution API está respondendo corretamente." });
    }, 1500);
  };

  const handleSaveSecurity = () => {
    toast({ title: "Configurações salvas", description: "As configurações de segurança foram atualizadas." });
  };

  const handleSaveGeneral = () => {
    toast({ title: "Configurações salvas", description: "As configurações gerais foram atualizadas." });
  };

  const handleSaveDomains = () => {
    setEditDomainOpen(false);
    toast({ title: "Domínios atualizados", description: "As configurações de domínios foram salvas." });
  };

  return (
    <DashboardLayout>
      <Header />
      
      <div className="p-8 space-y-6 animate-fade-in">
        <div>
          <h2 className="text-2xl font-bold text-cs-text-primary flex items-center gap-3">
            <Settings className="w-7 h-7 text-cs-cyan" />
            Configurações
          </h2>
          <p className="text-cs-text-secondary mt-1">Gerencie as configurações do sistema (SuperAdmin apenas)</p>
        </div>

        <Tabs defaultValue="openai" className="w-full">
          <TabsList className="bg-cs-bg-card border border-border flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="openai" className="data-[state=active]:bg-cs-cyan data-[state=active]:text-white">
              <Brain className="w-4 h-4 mr-2" />
              OpenAI
            </TabsTrigger>
            <TabsTrigger value="modules" className="data-[state=active]:bg-cs-cyan data-[state=active]:text-white">
              <Puzzle className="w-4 h-4 mr-2" />
              Módulos
            </TabsTrigger>
            <TabsTrigger value="email" className="data-[state=active]:bg-cs-cyan data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" />
              Email
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="data-[state=active]:bg-cs-cyan data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              WhatsApp (Evolution API)
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-cs-cyan data-[state=active]:text-white">
              <Lock className="w-4 h-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="general" className="data-[state=active]:bg-cs-cyan data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="domains" className="data-[state=active]:bg-cs-cyan data-[state=active]:text-white">
              <Globe className="w-4 h-4 mr-2" />
              Domínios
            </TabsTrigger>
          </TabsList>

          {/* OpenAI Tab */}
          <TabsContent value="openai" className="mt-6">
            <div className="bg-cs-bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-cs-text-primary mb-1">Configurações da OpenAI</h3>
                  <p className="text-sm text-cs-text-secondary">Configure a API Key global para todos os tenants</p>
                </div>
                {openaiKeyConfigured && (
                  <Badge className="bg-cs-success/20 text-cs-success border-cs-success/30">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Configurado
                  </Badge>
                )}
              </div>
              
              <div className="space-y-4 max-w-xl">
                <div>
                  <Label className="text-cs-text-secondary">API Key da OpenAI</Label>
                  <div className="relative mt-1">
                    <Input
                      type={showOpenaiKey ? 'text' : 'password'}
                      value={openaiApiKey}
                      onChange={(e) => {
                        setOpenaiApiKey(e.target.value);
                        setOpenaiStatus('idle');
                      }}
                      placeholder="sk-..."
                      className="bg-cs-bg-primary border-border text-cs-text-primary font-mono pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-muted-foreground"
                      onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                    >
                      {showOpenaiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  <p className="text-xs text-cs-text-muted mt-1">
                    Obtenha sua chave em{' '}
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-cs-cyan hover:underline"
                    >
                      platform.openai.com/api-keys
                    </a>
                  </p>
                </div>

                <div>
                  <Label className="text-cs-text-secondary">Modelo Padrão</Label>
                  <Select value={openaiModel} onValueChange={setOpenaiModel}>
                    <SelectTrigger className="bg-cs-bg-primary border-border text-cs-text-primary mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-cs-bg-card border-border">
                      <SelectItem value="gpt-4" className="text-cs-text-primary">GPT-4 (Mais inteligente)</SelectItem>
                      <SelectItem value="gpt-4-turbo" className="text-cs-text-primary">GPT-4 Turbo (Rápido e capaz)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo" className="text-cs-text-primary">GPT-3.5 Turbo (Mais econômico)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-cs-text-muted mt-1">Modelo usado por todos os assistentes virtuais</p>
                </div>

                {/* Status indicator */}
                {openaiStatus !== 'idle' && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    openaiStatus === 'testing' ? 'bg-muted/30' :
                    openaiStatus === 'valid' ? 'bg-cs-success/10 border border-cs-success/30' :
                    'bg-cs-error/10 border border-cs-error/30'
                  }`}>
                    {openaiStatus === 'testing' && (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Validando API Key...</span>
                      </>
                    )}
                    {openaiStatus === 'valid' && (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-cs-success" />
                        <span className="text-sm text-cs-success">API Key válida! Pronta para uso.</span>
                      </>
                    )}
                    {openaiStatus === 'invalid' && (
                      <>
                        <XCircle className="h-4 w-4 text-cs-error" />
                        <span className="text-sm text-cs-error">API Key inválida. Verifique e tente novamente.</span>
                      </>
                    )}
                  </div>
                )}

                <div className="bg-muted/30 rounded-lg p-4 flex items-start gap-3">
                  <Key className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground mb-1">Configuração centralizada</p>
                    <p>Esta API Key será usada por todos os tenants da plataforma. Os custos de uso serão faturados na sua conta OpenAI.</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="border-border text-cs-text-secondary"
                    onClick={handleTestOpenAI}
                    disabled={!openaiApiKey || openaiStatus === 'testing'}
                  >
                    {openaiStatus === 'testing' ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <TestTube className="w-4 h-4 mr-2" />
                    )}
                    Testar Conexão
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-cs-cyan to-cs-blue"
                    onClick={handleSaveOpenAI}
                    disabled={openaiStatus !== 'valid'}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="mt-6">
            <ModulesTab />
          </TabsContent>

          {/* Email Tab */}
          <TabsContent value="email" className="mt-6">
            <div className="bg-cs-bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-cs-text-primary mb-2">Configurações de Email</h3>
              <p className="text-sm text-cs-text-secondary mb-6">Configure o provedor de email para envio de notificações</p>
              
              <div className="space-y-4 max-w-xl">
                <div>
                  <Label className="text-cs-text-secondary">Provedor</Label>
                  <Select value={emailProvider} onValueChange={setEmailProvider}>
                    <SelectTrigger className="bg-cs-bg-primary border-border text-cs-text-primary mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-cs-bg-card border-border">
                      <SelectItem value="resend" className="text-cs-text-primary">Resend</SelectItem>
                      <SelectItem value="sendgrid" className="text-cs-text-primary">SendGrid</SelectItem>
                      <SelectItem value="mailgun" className="text-cs-text-primary">Mailgun</SelectItem>
                      <SelectItem value="smtp" className="text-cs-text-primary">SMTP</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-cs-text-muted mt-1">Provedor de email (resend, sendgrid, mailgun, smtp)</p>
                </div>

                <div>
                  <Label className="text-cs-text-secondary">API Key</Label>
                  <Input
                    type="password"
                    value={emailApiKey}
                    onChange={(e) => setEmailApiKey(e.target.value)}
                    className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                  />
                  <p className="text-xs text-cs-text-muted mt-1">Chave de API do provedor (será criptografada)</p>
                </div>

                <div>
                  <Label className="text-cs-text-secondary">Email Remetente</Label>
                  <Input
                    type="email"
                    value={emailFrom}
                    onChange={(e) => setEmailFrom(e.target.value)}
                    className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                  />
                </div>

                <div>
                  <Label className="text-cs-text-secondary">Nome Remetente</Label>
                  <Input
                    value={emailFromName}
                    onChange={(e) => setEmailFromName(e.target.value)}
                    className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    className="bg-gradient-to-r from-cs-cyan to-cs-blue"
                    onClick={handleSaveEmail}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-border text-cs-text-secondary"
                    onClick={handleTestEmail}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Testar Envio
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* WhatsApp Tab */}
          <TabsContent value="whatsapp" className="mt-6">
            <div className="bg-cs-bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-cs-text-primary mb-2">Configurações Evolution API</h3>
              <p className="text-sm text-cs-text-secondary mb-6">Configure a integração com Evolution API para WhatsApp</p>
              
              <div className="space-y-4 max-w-xl">
                <div>
                  <Label className="text-cs-text-secondary">URL da Evolution API</Label>
                  <Input
                    value={evolutionUrl}
                    onChange={(e) => setEvolutionUrl(e.target.value)}
                    className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                  />
                </div>

                <div>
                  <Label className="text-cs-text-secondary">API Key (Global)</Label>
                  <Input
                    type="password"
                    value={evolutionApiKey}
                    onChange={(e) => setEvolutionApiKey(e.target.value)}
                    className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                  />
                </div>

                <div>
                  <Label className="text-cs-text-secondary">Webhook Base URL</Label>
                  <Input
                    value={webhookBaseUrl}
                    onChange={(e) => setWebhookBaseUrl(e.target.value)}
                    className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                  />
                  <p className="text-xs text-cs-text-muted mt-1">URL pública onde o sistema receberá webhooks da Evolution API</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button 
                    variant="outline" 
                    className="border-border text-cs-text-secondary"
                    onClick={handleTestConnection}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Testar Conexão
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-cs-cyan to-cs-blue"
                    onClick={handleSaveWhatsApp}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-6">
            <div className="bg-cs-bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-cs-text-primary mb-2">Configurações de Segurança</h3>
              <p className="text-sm text-cs-text-secondary mb-6">Configure as regras de senha e expiração de tokens</p>
              
              <div className="space-y-4 max-w-xl">
                <div>
                  <Label className="text-cs-text-secondary">Tamanho Mínimo da Senha</Label>
                  <Input
                    type="number"
                    value={minPasswordLength}
                    onChange={(e) => setMinPasswordLength(e.target.value)}
                    className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                    min="6"
                    max="32"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm text-cs-text-primary">Exigir Letra Maiúscula</span>
                  </div>
                  <Switch checked={requireUppercase} onCheckedChange={setRequireUppercase} />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm text-cs-text-primary">Exigir Número</span>
                  </div>
                  <Switch checked={requireNumber} onCheckedChange={setRequireNumber} />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm text-cs-text-primary">Exigir Caractere Especial</span>
                  </div>
                  <Switch checked={requireSpecial} onCheckedChange={setRequireSpecial} />
                </div>

                <div>
                  <Label className="text-cs-text-secondary">Expiração do Token de Reset (minutos)</Label>
                  <Input
                    type="number"
                    value={tokenExpiration}
                    onChange={(e) => setTokenExpiration(e.target.value)}
                    className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                  />
                </div>

                <div>
                  <Label className="text-cs-text-secondary">Expiração da Senha Temporária (dias)</Label>
                  <Input
                    type="number"
                    value={tempPasswordExpiration}
                    onChange={(e) => setTempPasswordExpiration(e.target.value)}
                    className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    className="bg-gradient-to-r from-cs-cyan to-cs-blue"
                    onClick={handleSaveSecurity}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações de Segurança
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="general" className="mt-6">
            <div className="bg-cs-bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-cs-text-primary mb-2">Configurações Gerais</h3>
              <p className="text-sm text-cs-text-secondary mb-6">Configure informações gerais da plataforma</p>
              
              <div className="space-y-4 max-w-xl">
                <div>
                  <Label className="text-cs-text-secondary">Nome da Plataforma</Label>
                  <Input
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                  />
                </div>

                <div>
                  <Label className="text-cs-text-secondary">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger className="bg-cs-bg-primary border-border text-cs-text-primary mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-cs-bg-card border-border">
                      <SelectItem value="America/Sao_Paulo" className="text-cs-text-primary">America/Sao_Paulo</SelectItem>
                      <SelectItem value="America/New_York" className="text-cs-text-primary">America/New_York</SelectItem>
                      <SelectItem value="Europe/London" className="text-cs-text-primary">Europe/London</SelectItem>
                      <SelectItem value="UTC" className="text-cs-text-primary">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-cs-text-secondary">Idioma</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-cs-bg-primary border-border text-cs-text-primary mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-cs-bg-card border-border">
                      <SelectItem value="pt-BR" className="text-cs-text-primary">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US" className="text-cs-text-primary">English (US)</SelectItem>
                      <SelectItem value="es-ES" className="text-cs-text-primary">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button 
                    className="bg-gradient-to-r from-cs-cyan to-cs-blue"
                    onClick={handleSaveGeneral}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações Gerais
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Domains Tab */}
          <TabsContent value="domains" className="mt-6">
            <div className="bg-cs-bg-card border border-border rounded-xl p-6">
              <h3 className="text-lg font-semibold text-cs-text-primary mb-2">Domínios e Ambiente</h3>
              <p className="text-sm text-cs-text-secondary mb-6">Configure os domínios para produção e staging. O ambiente ativo determina qual URL será usada para webhooks e OAuth.</p>

              <Tabs defaultValue="config" className="w-full">
                <TabsList className="bg-cs-bg-primary border border-border">
                  <TabsTrigger value="config" className="data-[state=active]:bg-cs-bg-card">
                    Configuração
                  </TabsTrigger>
                  <TabsTrigger value="computed" className="data-[state=active]:bg-cs-bg-card">
                    URLs Computadas
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="config" className="mt-4 space-y-4">
                  <div>
                    <Label className="text-cs-text-secondary">Ambiente Ativo</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        activeEnvironment === 'staging' 
                          ? 'bg-yellow-500/20 text-yellow-400' 
                          : 'bg-green-500/20 text-green-400'
                      }`}>
                        {activeEnvironment === 'staging' ? '⚡ Staging' : '✓ Produção'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-cs-text-secondary">Base URL - Produção</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={prodUrl}
                        readOnly
                        className="bg-cs-bg-primary border-border text-cs-text-primary flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCopy(prodUrl, 'prod')}
                        className="text-cs-text-muted hover:text-cs-text-primary"
                      >
                        {copiedField === 'prod' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-cs-text-secondary">Base URL - Staging</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={stagingUrl}
                        readOnly
                        className="bg-cs-bg-primary border-border text-cs-text-primary flex-1"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleCopy(stagingUrl, 'staging')}
                        className="text-cs-text-muted hover:text-cs-text-primary"
                      >
                        {copiedField === 'staging' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      variant="outline"
                      className="border-border text-cs-text-secondary"
                      onClick={() => setEditDomainOpen(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar Configuração
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="computed" className="mt-4 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-cs-text-muted">API Base URL</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-cs-bg-primary px-3 py-2 rounded text-sm text-cs-text-primary font-mono">
                          {activeEnvironment === 'staging' ? stagingUrl : prodUrl}/api
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleCopy(`${activeEnvironment === 'staging' ? stagingUrl : prodUrl}/api`, 'api')}
                          className="text-cs-text-muted hover:text-cs-text-primary"
                        >
                          {copiedField === 'api' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-cs-text-muted">Webhook URL</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-cs-bg-primary px-3 py-2 rounded text-sm text-cs-text-primary font-mono">
                          {activeEnvironment === 'staging' ? stagingUrl : prodUrl}/api/webhook
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleCopy(`${activeEnvironment === 'staging' ? stagingUrl : prodUrl}/api/webhook`, 'webhook')}
                          className="text-cs-text-muted hover:text-cs-text-primary"
                        >
                          {copiedField === 'webhook' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-cs-text-muted">OAuth Callback URL</Label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-cs-bg-primary px-3 py-2 rounded text-sm text-cs-text-primary font-mono">
                          {activeEnvironment === 'staging' ? stagingUrl : prodUrl}/auth/callback
                        </code>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleCopy(`${activeEnvironment === 'staging' ? stagingUrl : prodUrl}/auth/callback`, 'oauth')}
                          className="text-cs-text-muted hover:text-cs-text-primary"
                        >
                          {copiedField === 'oauth' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Domain Modal */}
      <Dialog open={editDomainOpen} onOpenChange={setEditDomainOpen}>
        <DialogContent className="bg-cs-bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary flex items-center gap-2">
              <Globe className="w-5 h-5 text-cs-cyan" />
              Editar Domínios
            </DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              Altere as configurações de domínios e ambiente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-cs-text-secondary">Ambiente Ativo</Label>
              <Select value={activeEnvironment} onValueChange={setActiveEnvironment}>
                <SelectTrigger className="bg-cs-bg-primary border-border text-cs-text-primary mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-cs-bg-card border-border">
                  <SelectItem value="staging" className="text-cs-text-primary">Staging</SelectItem>
                  <SelectItem value="production" className="text-cs-text-primary">Produção</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-cs-text-secondary">URL de Produção</Label>
              <Input
                value={prodUrl}
                onChange={(e) => setProdUrl(e.target.value)}
                className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
              />
            </div>

            <div>
              <Label className="text-cs-text-secondary">URL de Staging</Label>
              <Input
                value={stagingUrl}
                onChange={(e) => setStagingUrl(e.target.value)}
                className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDomainOpen(false)} className="border-border">
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue"
              onClick={handleSaveDomains}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
