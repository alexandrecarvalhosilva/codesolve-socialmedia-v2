import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft,
  LayoutDashboard,
  Settings,
  MessageSquare,
  Calendar,
  Bot,
  MessageCircle,
  Users,
  Clock,
  Zap,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Package,
  FileText,
  Headphones,
  Brain,
  Cog,
  Instagram,
  Share2
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { TenantDashboardTab } from '@/components/tenant/TenantDashboardTab';
import { TenantAIConfigTab } from '@/components/tenant/TenantAIConfigTab';
import { TenantAITab } from '@/components/tenant/TenantAITab';
import { TenantGeneralConfigTab } from '@/components/tenant/TenantGeneralConfigTab';
import { TenantChatTab } from '@/components/tenant/TenantChatTab';
import { TenantCalendarTab } from '@/components/tenant/TenantCalendarTab';
import { TenantAutomationsTab } from '@/components/tenant/TenantAutomationsTab';
import { TenantUsersTab } from '@/components/tenant/TenantUsersTab';
import { TenantModulesTab } from '@/components/tenant/TenantModulesTab';
import { BillingSummaryCard } from '@/components/billing/BillingSummaryCard';
import { useTenantModules } from '@/contexts/TenantModulesContext';

// Mock tenant data
const tenantData = {
  id: '1',
  name: 'SIX BLADES - LAGO OESTE',
  status: 'active',
  createdAt: '14/01/2026',
  planId: 'professional'
};

// Tab configuration mapping
interface TabConfigItem {
  icon: typeof LayoutDashboard;
  label: string;
  isCore?: boolean;
  moduleId?: string;
}

const TAB_CONFIG: Record<string, TabConfigItem> = {
  dashboard: { icon: LayoutDashboard, label: 'Dashboard', isCore: true },
  config: { icon: Settings, label: 'Configurações', isCore: true },
  modules: { icon: Package, label: 'Módulos', isCore: true },
  chat: { icon: MessageSquare, label: 'Chat', moduleId: 'chat' },
  calendar: { icon: Calendar, label: 'Calendário', moduleId: 'calendar' },
  automations: { icon: Bot, label: 'Automações', moduleId: 'automations' },
  'ai-consumption': { icon: Brain, label: 'Consumo IA', moduleId: 'ai-consumption' },
  'ai-config': { icon: Cog, label: 'Config IA', moduleId: 'ai-config' },
  users: { icon: Users, label: 'Usuários', isCore: true },
  billing: { icon: CreditCard, label: 'Cobrança', isCore: true },
  support: { icon: Headphones, label: 'Suporte', isCore: true },
  social: { icon: Share2, label: 'Redes Sociais', moduleId: 'instagram' },
};

export default function TenantDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { 
    setTenantContext, 
    isModuleEnabled, 
    planId,
    moduleStates 
  } = useTenantModules();

  // Initialize tenant context on mount
  useEffect(() => {
    if (id) {
      setTenantContext(id, tenantData.planId);
    }
  }, [id, setTenantContext]);

  // Check if a tab should be visible
  const isTabVisible = (tabKey: string): boolean => {
    const config = TAB_CONFIG[tabKey as keyof typeof TAB_CONFIG];
    if (!config) return false;
    
    // Core tabs are always visible
    if (config.isCore) return true;
    
    // Check if the module is enabled
    if (config.moduleId) {
      return isModuleEnabled(config.moduleId);
    }
    
    return true;
  };

  // Get visible tabs
  const visibleTabs = Object.entries(TAB_CONFIG).filter(([key]) => isTabVisible(key));

  // Count active modules
  const activeModulesCount = moduleStates.filter(s => s.status === 'active').length;

  return (
    <DashboardLayout>
      <Header />
      
      <div className="p-8 space-y-6 animate-fade-in">
        {/* Breadcrumb */}
        <div className="text-sm text-cs-text-muted flex items-center gap-2">
          <span>Tenants</span>
          <span>/</span>
          <span>{tenantData.name}</span>
          <span>/</span>
          <span className="text-cs-cyan">Configurações</span>
        </div>

        {/* Page Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/tenants')}
              className="p-2 hover:bg-cs-bg-card rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-cs-text-secondary" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-cs-text-primary">Gerenciar Tenants</h1>
              <p className="text-cs-text-secondary mt-1">{tenantData.name}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <span className="text-sm text-cs-text-secondary">Status:</span>
              <StatusPill status="success" label="Ativo" />
            </div>
            <div className="flex items-center gap-2 mt-1 justify-end">
              <Badge variant="outline" className="text-xs capitalize">{planId}</Badge>
              <Badge className="bg-cs-cyan/10 text-cs-cyan text-xs">
                {activeModulesCount} módulos
              </Badge>
            </div>
            <p className="text-sm text-cs-text-muted mt-1">
              Criado em: {tenantData.createdAt}
            </p>
          </div>
        </div>

        {/* Tabs - Dynamic based on enabled modules */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start bg-cs-bg-card border border-border rounded-xl p-1 h-auto gap-1 flex-wrap">
            {visibleTabs.map(([key, config]) => {
              const TabIcon = config.icon;
              return (
                <TabsTrigger 
                  key={key}
                  value={key}
                  className="flex items-center gap-2 px-4 py-2.5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cs-cyan data-[state=active]:to-cs-blue data-[state=active]:text-white rounded-lg transition-all text-sm"
                >
                  <TabIcon className="w-4 h-4" />
                  {config.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            {/* Same layout as TenantDashboard */}
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
                    <p className="text-xl font-bold text-cs-text-primary">78%</p>
                  </div>
                  <div className="bg-cs-bg-primary/50 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3 text-cs-cyan" />
                      <p className="text-xs text-cs-text-secondary">Tempo Economizado</p>
                    </div>
                    <p className="text-xl font-bold text-cs-text-primary">8.5h</p>
                  </div>
                  <div className="bg-cs-bg-primary/50 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingUp className="w-3 h-3 text-cs-success" />
                      <p className="text-xs text-cs-text-secondary">Economia</p>
                    </div>
                    <p className="text-xl font-bold text-cs-success">R$ 2.550</p>
                  </div>
                  <div className="bg-cs-bg-primary/50 rounded-lg p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <TrendingDown className="w-3 h-3 text-cs-error" />
                      <p className="text-xs text-cs-text-secondary">Escalação</p>
                    </div>
                    <p className="text-xl font-bold text-cs-text-primary">2%</p>
                  </div>
                </div>
              </div>
              
              {/* Integrations Card */}
              <div className="bg-cs-bg-card border border-border rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-cs-cyan/10">
                      <Settings className="w-5 h-5 text-cs-cyan" />
                    </div>
                    <h3 className="font-semibold text-cs-text-primary">Integrações</h3>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  {[
                    { name: 'WhatsApp', status: 'connected', detail: '3/3 ativos', color: 'bg-cs-success' },
                    { name: 'MCP', status: 'connected', detail: '1.250 docs', color: 'bg-cs-cyan' },
                    { name: 'RAG', status: 'connected', detail: '450 FAQs', color: 'bg-cs-cyan' },
                    { name: 'OpenAI', status: 'warning', detail: '45% tokens', color: 'bg-cs-warning' }
                  ].map((integration) => (
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
                    <Button variant="outline" size="sm" className="flex-1 border-border hover:border-cs-cyan/50" onClick={() => setActiveTab('chat')}>
                      <MessageSquare className="w-4 h-4 mr-1 text-cs-cyan" />
                      Chat
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-border hover:border-purple-500/50" onClick={() => setActiveTab('modules')}>
                      <Package className="w-4 h-4 mr-1 text-purple-400" />
                      Módulos
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <TenantDashboardTab />
          </TabsContent>
          
          <TabsContent value="config" className="mt-6">
            <TenantGeneralConfigTab />
          </TabsContent>

          <TabsContent value="modules" className="mt-6">
            <TenantModulesTab tenantId={id} />
          </TabsContent>
          
          {isModuleEnabled('chat') && (
            <TabsContent value="chat" className="mt-6">
              <TenantChatTab />
            </TabsContent>
          )}
          
          {isModuleEnabled('calendar') && (
            <TabsContent value="calendar" className="mt-6">
              <TenantCalendarTab />
            </TabsContent>
          )}
          
          {isModuleEnabled('automations') && (
            <TabsContent value="automations" className="mt-6">
              <TenantAutomationsTab />
            </TabsContent>
          )}

          {isModuleEnabled('ai-consumption') && (
            <TabsContent value="ai-consumption" className="mt-6">
              <TenantAITab tenantId={id} />
            </TabsContent>
          )}

          {isModuleEnabled('ai-config') && (
            <TabsContent value="ai-config" className="mt-6">
              <TenantAIConfigTab />
            </TabsContent>
          )}

          <TabsContent value="users" className="mt-6">
            <TenantUsersTab tenantId={id} />
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <BillingSummaryCard variant="tenant" />
              <div className="md:col-span-2 bg-cs-bg-card border border-border rounded-xl p-6">
                <h3 className="font-semibold text-cs-text-primary mb-4">Histórico de Faturas</h3>
                <p className="text-cs-text-secondary text-sm">Acesse as faturas deste tenant através da aba de cobrança do Tenant Admin.</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="support" className="mt-6">
            <div className="bg-cs-bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Headphones className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-cs-text-primary text-lg">Tickets de Suporte</h3>
                  <p className="text-cs-text-muted text-sm">Histórico de tickets deste tenant</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-cs-bg-primary/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-cs-text-primary">12</p>
                  <p className="text-xs text-cs-text-muted">Total de Tickets</p>
                </div>
                <div className="bg-cs-bg-primary/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-cs-warning">3</p>
                  <p className="text-xs text-cs-text-muted">Em Andamento</p>
                </div>
                <div className="bg-cs-bg-primary/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-cs-success">9</p>
                  <p className="text-xs text-cs-text-muted">Resolvidos</p>
                </div>
              </div>
              
              <Link to="/support">
                <Button className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90">
                  Ver na Central de Suporte
                </Button>
              </Link>
            </div>
          </TabsContent>

          {isModuleEnabled('instagram') && (
            <TabsContent value="social" className="mt-6">
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                      <Instagram className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-cs-text-primary text-lg">Redes Sociais</h3>
                      <p className="text-cs-text-muted text-sm">Gerencie as contas conectadas deste tenant</p>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90">
                    <Instagram className="w-4 h-4 mr-2" />
                    Conectar Instagram
                  </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-cs-bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Instagram className="w-4 h-4 text-pink-400" />
                      <span className="text-sm text-cs-text-secondary">Contas Conectadas</span>
                    </div>
                    <p className="text-2xl font-bold text-cs-text-primary">2</p>
                  </div>
                  <div className="bg-cs-bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageCircle className="w-4 h-4 text-cs-cyan" />
                      <span className="text-sm text-cs-text-secondary">Mensagens/Mês</span>
                    </div>
                    <p className="text-2xl font-bold text-cs-text-primary">1.234</p>
                  </div>
                  <div className="bg-cs-bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="w-4 h-4 text-purple-400" />
                      <span className="text-sm text-cs-text-secondary">Resp. Automáticas</span>
                    </div>
                    <p className="text-2xl font-bold text-cs-success">89%</p>
                  </div>
                  <div className="bg-cs-bg-card border border-border rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-cs-warning" />
                      <span className="text-sm text-cs-text-secondary">Tempo Resposta</span>
                    </div>
                    <p className="text-2xl font-bold text-cs-text-primary">2.5s</p>
                  </div>
                </div>

                {/* Connected Accounts */}
                <div className="bg-cs-bg-card border border-border rounded-xl p-6">
                  <h4 className="font-semibold text-cs-text-primary mb-4">Contas Conectadas</h4>
                  <div className="space-y-3">
                    {[
                      { username: '@sixblades_oficial', followers: '15.2K', status: 'active', lastSync: 'Há 5 min' },
                      { username: '@sixblades_promo', followers: '8.7K', status: 'active', lastSync: 'Há 12 min' }
                    ].map((account) => (
                      <div key={account.username} className="flex items-center justify-between p-4 bg-cs-bg-primary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center">
                            <Instagram className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-cs-text-primary">{account.username}</p>
                            <p className="text-xs text-cs-text-muted">{account.followers} seguidores</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-cs-success" />
                              <span className="text-xs text-cs-success">Conectado</span>
                            </div>
                            <p className="text-xs text-cs-text-muted">{account.lastSync}</p>
                          </div>
                          <Button variant="outline" size="sm" className="border-border">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scheduled Posts */}
                <div className="bg-cs-bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-cs-text-primary">Posts Agendados</h4>
                    <Button variant="outline" size="sm" className="border-border">
                      Ver Todos
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: 'Promoção de Verão', date: '22/01/2026 14:00', account: '@sixblades_promo' },
                      { title: 'Novo corte disponível', date: '23/01/2026 10:00', account: '@sixblades_oficial' },
                      { title: 'Dicas de cuidados', date: '24/01/2026 16:30', account: '@sixblades_oficial' }
                    ].map((post, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-cs-bg-primary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-cs-bg-card flex items-center justify-center">
                            <FileText className="w-4 h-4 text-cs-text-muted" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-cs-text-primary">{post.title}</p>
                            <p className="text-xs text-cs-text-muted">{post.account}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-cs-text-secondary">{post.date}</span>
                          <Button variant="ghost" size="sm">
                            <Settings className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
