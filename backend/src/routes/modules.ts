import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, requirePermission } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ============================================================================
// CATÁLOGO DE MÓDULOS DO SISTEMA
// ============================================================================

interface ModuleDefinition {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'communication' | 'ai' | 'automation' | 'analytics' | 'integrations' | 'advanced';
  icon: string;
  isCore: boolean;
  price: number;
  features: string[];
  dependencies: string[];
}

const MODULE_CATALOG: ModuleDefinition[] = [
  // Core - Sempre incluídos
  {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Painel principal com métricas e visão geral',
    category: 'core',
    icon: 'LayoutDashboard',
    isCore: true,
    price: 0,
    features: ['Métricas em tempo real', 'Gráficos de performance', 'Resumo de atividades'],
    dependencies: [],
  },
  {
    id: 'users',
    name: 'Gestão de Usuários',
    description: 'Gerenciamento de usuários e permissões',
    category: 'core',
    icon: 'Users',
    isCore: true,
    price: 0,
    features: ['CRUD de usuários', 'Controle de acesso', 'Perfis e roles'],
    dependencies: [],
  },
  {
    id: 'settings',
    name: 'Configurações',
    description: 'Configurações gerais do sistema',
    category: 'core',
    icon: 'Settings',
    isCore: true,
    price: 0,
    features: ['Preferências do tenant', 'Configurações de notificação', 'Personalização'],
    dependencies: [],
  },
  
  // Communication
  {
    id: 'chat',
    name: 'Chat Unificado',
    description: 'Central de atendimento multicanal',
    category: 'communication',
    icon: 'MessageSquare',
    isCore: false,
    price: 49,
    features: ['Conversas em tempo real', 'Histórico completo', 'Atribuição de operadores'],
    dependencies: [],
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Integração com WhatsApp via Evolution API',
    category: 'communication',
    icon: 'Phone',
    isCore: false,
    price: 99,
    features: ['Múltiplas instâncias', 'QR Code', 'Mensagens automáticas'],
    dependencies: ['chat'],
  },
  {
    id: 'instagram',
    name: 'Instagram Direct',
    description: 'Integração com Instagram Direct Messages',
    category: 'communication',
    icon: 'Instagram',
    isCore: false,
    price: 79,
    features: ['DMs', 'Comentários', 'Stories mentions'],
    dependencies: ['chat'],
  },
  {
    id: 'email',
    name: 'Email Marketing',
    description: 'Campanhas e automação de email',
    category: 'communication',
    icon: 'Mail',
    isCore: false,
    price: 59,
    features: ['Templates', 'Campanhas', 'Métricas de abertura'],
    dependencies: [],
  },
  
  // AI
  {
    id: 'ai-assistant',
    name: 'Assistente IA',
    description: 'Respostas automáticas com inteligência artificial',
    category: 'ai',
    icon: 'Bot',
    isCore: false,
    price: 149,
    features: ['Respostas automáticas', 'Aprendizado contínuo', 'Escalação inteligente'],
    dependencies: ['chat'],
  },
  {
    id: 'ai-analytics',
    name: 'Analytics IA',
    description: 'Análise de sentimento e insights',
    category: 'ai',
    icon: 'Brain',
    isCore: false,
    price: 99,
    features: ['Análise de sentimento', 'Tendências', 'Previsões'],
    dependencies: [],
  },
  {
    id: 'ai-content',
    name: 'Geração de Conteúdo',
    description: 'Criação de conteúdo com IA',
    category: 'ai',
    icon: 'Sparkles',
    isCore: false,
    price: 79,
    features: ['Sugestões de resposta', 'Templates inteligentes', 'Tradução automática'],
    dependencies: [],
  },
  
  // Automation
  {
    id: 'automations',
    name: 'Automações',
    description: 'Fluxos de trabalho automatizados',
    category: 'automation',
    icon: 'Zap',
    isCore: false,
    price: 89,
    features: ['Triggers', 'Ações automáticas', 'Condições'],
    dependencies: [],
  },
  {
    id: 'chatbots',
    name: 'Chatbots',
    description: 'Bots de atendimento configuráveis',
    category: 'automation',
    icon: 'MessageCircle',
    isCore: false,
    price: 119,
    features: ['Fluxos de conversa', 'Menus interativos', 'Integração com IA'],
    dependencies: ['chat'],
  },
  {
    id: 'scheduling',
    name: 'Agendamentos',
    description: 'Sistema de agendamento e calendário',
    category: 'automation',
    icon: 'Calendar',
    isCore: false,
    price: 49,
    features: ['Calendário', 'Lembretes', 'Confirmações automáticas'],
    dependencies: [],
  },
  
  // Analytics
  {
    id: 'reports',
    name: 'Relatórios Avançados',
    description: 'Relatórios detalhados e exportação',
    category: 'analytics',
    icon: 'BarChart3',
    isCore: false,
    price: 69,
    features: ['Relatórios customizados', 'Exportação', 'Agendamento'],
    dependencies: [],
  },
  {
    id: 'realtime-analytics',
    name: 'Analytics em Tempo Real',
    description: 'Métricas e dashboards em tempo real',
    category: 'analytics',
    icon: 'Activity',
    isCore: false,
    price: 89,
    features: ['Dashboards live', 'Alertas', 'Monitoramento'],
    dependencies: [],
  },
  
  // Integrations
  {
    id: 'crm-integration',
    name: 'Integração CRM',
    description: 'Conecte com seu CRM favorito',
    category: 'integrations',
    icon: 'Link',
    isCore: false,
    price: 79,
    features: ['Sincronização de contatos', 'Histórico unificado', 'Automações'],
    dependencies: [],
  },
  {
    id: 'api-access',
    name: 'Acesso API',
    description: 'API completa para integrações customizadas',
    category: 'integrations',
    icon: 'Code',
    isCore: false,
    price: 149,
    features: ['REST API', 'Webhooks', 'Documentação'],
    dependencies: [],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Integração com Zapier',
    category: 'integrations',
    icon: 'Plug',
    isCore: false,
    price: 49,
    features: ['Triggers', 'Actions', '1000+ apps'],
    dependencies: [],
  },
  
  // Advanced
  {
    id: 'multi-tenant',
    name: 'Multi-Tenant',
    description: 'Gestão de múltiplos tenants',
    category: 'advanced',
    icon: 'Building2',
    isCore: false,
    price: 299,
    features: ['Múltiplos ambientes', 'Isolamento de dados', 'Billing separado'],
    dependencies: [],
  },
  {
    id: 'white-label',
    name: 'White Label',
    description: 'Personalização completa da marca',
    category: 'advanced',
    icon: 'Palette',
    isCore: false,
    price: 199,
    features: ['Logo customizado', 'Cores', 'Domínio próprio'],
    dependencies: [],
  },
  {
    id: 'sla-management',
    name: 'Gestão de SLA',
    description: 'Controle de níveis de serviço',
    category: 'advanced',
    icon: 'Shield',
    isCore: false,
    price: 99,
    features: ['Definição de SLAs', 'Alertas', 'Relatórios de compliance'],
    dependencies: [],
  },
];

// ============================================================================
// LISTAR CATÁLOGO DE MÓDULOS
// ============================================================================

router.get('/catalog', authenticate, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        modules: MODULE_CATALOG,
        categories: [
          { id: 'core', name: 'Core', description: 'Módulos essenciais' },
          { id: 'communication', name: 'Comunicação', description: 'Canais de atendimento' },
          { id: 'ai', name: 'Inteligência Artificial', description: 'Recursos de IA' },
          { id: 'automation', name: 'Automação', description: 'Fluxos automatizados' },
          { id: 'analytics', name: 'Analytics', description: 'Relatórios e métricas' },
          { id: 'integrations', name: 'Integrações', description: 'Conexões externas' },
          { id: 'advanced', name: 'Avançado', description: 'Recursos enterprise' },
        ],
      },
    });
  } catch (error) {
    console.error('Erro ao listar catálogo:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao listar catálogo de módulos' },
    });
  }
});

// ============================================================================
// LISTAR MÓDULOS DO TENANT
// ============================================================================

router.get('/tenant', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    
    if (!user.tenantId) {
      // SuperAdmin sem tenant - retorna todos os módulos
      return res.json({
        success: true,
        data: {
          enabledModules: MODULE_CATALOG.map(m => m.id),
          modules: MODULE_CATALOG.map(m => ({
            ...m,
            enabled: true,
            enabledAt: new Date(),
          })),
        },
      });
    }
    
    // Buscar tenant com módulos
    const tenant = await prisma.tenant.findUnique({
      where: { id: user.tenantId },
      select: { modules: true },
    });
    
    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Tenant não encontrado' },
      });
    }
    
    // Módulos habilitados (core + módulos do tenant)
    const enabledModuleIds = [
      ...MODULE_CATALOG.filter(m => m.isCore).map(m => m.id),
      ...(tenant.modules || []),
    ];
    
    const modules = MODULE_CATALOG.map(m => ({
      ...m,
      enabled: enabledModuleIds.includes(m.id),
      enabledAt: enabledModuleIds.includes(m.id) ? new Date() : null,
    }));
    
    res.json({
      success: true,
      data: {
        enabledModules: enabledModuleIds,
        modules,
      },
    });
  } catch (error) {
    console.error('Erro ao listar módulos do tenant:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao listar módulos do tenant' },
    });
  }
});

// ============================================================================
// HABILITAR/DESABILITAR MÓDULO PARA TENANT
// ============================================================================

router.post('/tenant/:moduleId/toggle', authenticate, requirePermission('modules:manage'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { moduleId } = req.params;
    const { enabled, tenantId: targetTenantId } = req.body;
    
    // Determinar tenant alvo
    const tenantId = user.role === 'superadmin' && targetTenantId ? targetTenantId : user.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Tenant não especificado' },
      });
    }
    
    // Verificar se módulo existe
    const module = MODULE_CATALOG.find(m => m.id === moduleId);
    if (!module) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Módulo não encontrado' },
      });
    }
    
    // Módulos core não podem ser desabilitados
    if (module.isCore && !enabled) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Módulos core não podem ser desabilitados' },
      });
    }
    
    // Verificar dependências
    if (enabled && module.dependencies.length > 0) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { modules: true },
      });
      
      const currentModules = tenant?.modules || [];
      const missingDeps = module.dependencies.filter(dep => !currentModules.includes(dep));
      
      if (missingDeps.length > 0) {
        return res.status(400).json({
          success: false,
          error: { 
            code: 'MISSING_DEPENDENCIES', 
            message: `Módulos necessários não habilitados: ${missingDeps.join(', ')}` 
          },
        });
      }
    }
    
    // Atualizar módulos do tenant
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { modules: true },
    });
    
    let newModules = tenant?.modules || [];
    
    if (enabled) {
      if (!newModules.includes(moduleId)) {
        newModules.push(moduleId);
      }
    } else {
      newModules = newModules.filter(m => m !== moduleId);
      
      // Remover módulos que dependem deste
      const dependentModules = MODULE_CATALOG.filter(m => m.dependencies.includes(moduleId));
      dependentModules.forEach(dep => {
        newModules = newModules.filter(m => m !== dep.id);
      });
    }
    
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { modules: newModules },
    });
    
    res.json({
      success: true,
      data: {
        moduleId,
        enabled,
        enabledModules: [
          ...MODULE_CATALOG.filter(m => m.isCore).map(m => m.id),
          ...newModules,
        ],
      },
    });
  } catch (error) {
    console.error('Erro ao toggle módulo:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao atualizar módulo' },
    });
  }
});

// ============================================================================
// ATUALIZAR MÓDULOS DO TENANT EM LOTE
// ============================================================================

router.put('/tenant/bulk', authenticate, requirePermission('modules:manage'), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const { modules, tenantId: targetTenantId } = req.body;
    
    const tenantId = user.role === 'superadmin' && targetTenantId ? targetTenantId : user.tenantId;
    
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Tenant não especificado' },
      });
    }
    
    if (!Array.isArray(modules)) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Lista de módulos inválida' },
      });
    }
    
    // Validar módulos
    const validModuleIds = MODULE_CATALOG.filter(m => !m.isCore).map(m => m.id);
    const invalidModules = modules.filter(m => !validModuleIds.includes(m));
    
    if (invalidModules.length > 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: `Módulos inválidos: ${invalidModules.join(', ')}` },
      });
    }
    
    // Verificar dependências
    for (const moduleId of modules) {
      const module = MODULE_CATALOG.find(m => m.id === moduleId);
      if (module && module.dependencies.length > 0) {
        const missingDeps = module.dependencies.filter(dep => !modules.includes(dep));
        if (missingDeps.length > 0) {
          return res.status(400).json({
            success: false,
            error: { 
              code: 'MISSING_DEPENDENCIES', 
              message: `Módulo ${moduleId} requer: ${missingDeps.join(', ')}` 
            },
          });
        }
      }
    }
    
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { modules },
    });
    
    res.json({
      success: true,
      data: {
        enabledModules: [
          ...MODULE_CATALOG.filter(m => m.isCore).map(m => m.id),
          ...modules,
        ],
      },
    });
  } catch (error) {
    console.error('Erro ao atualizar módulos:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Erro ao atualizar módulos' },
    });
  }
});

export default router;
