import { 
  Shield, 
  Users, 
  Building, 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Calendar, 
  Settings, 
  CreditCard, 
  Receipt, 
  Tag, 
  Wallet, 
  Headphones,
  Brain,
  Bell,
  Zap,
  Instagram,
  Facebook,
  Twitter,
  type LucideIcon,
  Image,
  Video,
  LayoutDashboard,
  Link2,
  TrendingUp,
  MessageCircle,
  Heart,
  Eye,
  AlertTriangle,
  Clock,
  Activity,
  Database,
  Lock,
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

// ============================================
// SISTEMA MODULAR COMPLETO
// ============================================
// Cada módulo define TUDO que precisa:
// - Metadados (nome, descrição, ícone)
// - Permissões granulares
// - Rotas e páginas
// - Itens de navegação (sidebar)
// - Funcionalidades/features
// - Configurações disponíveis
// - 🆕 Notificações (triggers e templates)
// - 🆕 Monitoramento/KPIs
// - 🆕 Logs (ações a registrar)
// - 🆕 Tickets (criação automática)
// - 🆕 Auditoria (ações auditáveis)
// ============================================

// ============================================
// INTERFACES BASE
// ============================================

export interface ModulePermission {
  id: string;
  name: string;
  description: string;
  level: 'view' | 'create' | 'edit' | 'delete' | 'manage' | 'admin';
}

export interface ModuleRoute {
  path: string;
  label: string;
  icon?: LucideIcon;
  requiredPermissions?: string[];
  isDefault?: boolean;
}

export interface ModuleNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string | number;
  children?: Omit<ModuleNavItem, 'children'>[];
}

export interface ModuleFeature {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean;
  requiredPermission?: string;
  settings?: ModuleFeatureSetting[];
}

export interface ModuleFeatureSetting {
  key: string;
  label: string;
  type: 'toggle' | 'text' | 'number' | 'select';
  defaultValue: string | number | boolean;
  options?: { label: string; value: string }[];
}

// ============================================
// 🆕 INTERFACES OPERACIONAIS
// ============================================

// 🔔 Sistema de Notificações
export interface ModuleNotificationTrigger {
  id: string;
  event: string;              // Ex: 'instagram:post_failed'
  name: string;               // Nome legível
  description: string;        // Descrição do evento
  template: string;           // Template da mensagem com placeholders
  channels: ('in_app' | 'email' | 'push' | 'sms' | 'webhook')[];
  roles: string[];            // Roles que recebem (vazio = todos)
  priority: 'low' | 'medium' | 'high' | 'urgent';
  icon?: LucideIcon;
  defaultEnabled: boolean;    // Ativo por padrão
  cooldown?: number;          // Segundos entre notificações iguais
}

export interface ModuleNotifications {
  triggers: ModuleNotificationTrigger[];
}

// 📊 Sistema de Monitoramento/KPIs
export interface ModuleMetric {
  id: string;                 // Ex: 'instagram_engagement_rate'
  name: string;               // Nome legível
  description: string;
  type: 'counter' | 'gauge' | 'percentage' | 'currency' | 'duration';
  unit?: string;              // Ex: '%', 'ms', 'R$'
  aggregation: 'sum' | 'avg' | 'max' | 'min' | 'count' | 'last';
  icon?: LucideIcon;
  thresholds?: {
    warning: number;
    critical: number;
    direction: 'above' | 'below'; // Alerta quando acima ou abaixo
  };
  refreshInterval?: number;   // Segundos
}

export interface ModuleDashboardWidget {
  id: string;
  name: string;
  type: 'number' | 'chart' | 'table' | 'list' | 'gauge' | 'timeline';
  metrics: string[];          // IDs das métricas usadas
  size: 'small' | 'medium' | 'large';
  icon?: LucideIcon;
}

export interface ModuleMonitoring {
  metrics: ModuleMetric[];
  dashboardWidgets: ModuleDashboardWidget[];
}

// 📝 Sistema de Logs
export interface ModuleLogAction {
  id: string;                 // Ex: 'instagram:schedule_post'
  action: string;             // Ação legível
  description: string;
  severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  category: string;           // Categoria do log
  dataToCapture: string[];    // Campos a registrar
  retentionDays: number;      // Dias para manter
  searchable: boolean;        // Indexar para busca
}

export interface ModuleLogging {
  actions: ModuleLogAction[];
  defaultRetentionDays: number;
}

// 🎫 Sistema de Tickets Automáticos
export interface ModuleTicketTrigger {
  id: string;
  trigger: string;            // Evento que dispara
  name: string;               // Nome do tipo de ticket
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;           // Categoria do ticket
  slaId?: string;             // ID do SLA a aplicar
  autoAssign?: boolean;       // Auto-atribuir para equipe
  tags: string[];             // Tags automáticas
  escalationMinutes?: number; // Tempo para escalar
}

export interface ModuleTicketing {
  autoCreate: ModuleTicketTrigger[];
}

// 🔍 Sistema de Auditoria
export interface ModuleAuditAction {
  id: string;
  action: string;             // Ação auditável
  description: string;
  captureData: string[];      // Dados a capturar
  requiresReason?: boolean;   // Exigir justificativa
  complianceTags?: ('LGPD' | 'SOC2' | 'HIPAA' | 'GDPR' | 'PCI')[];
  retentionYears: number;     // Anos para manter
  alertOnAction?: boolean;    // Alertar admins
  icon?: LucideIcon;
}

export interface ModuleAudit {
  actions: ModuleAuditAction[];
  defaultRetentionYears: number;
}

// ============================================
// INTERFACE PRINCIPAL DO MÓDULO
// ============================================

export interface ModuleConfig {
  // Metadados
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  category: 'system' | 'tenant' | 'social' | 'billing' | 'support';
  version: string;
  
  // Status
  enabled: boolean;
  isCore: boolean;
  
  // Permissões
  permissions: ModulePermission[];
  
  // Rotas
  routes: ModuleRoute[];
  
  // Navegação (sidebar)
  navigation?: ModuleNavItem;
  
  // Funcionalidades
  features: ModuleFeature[];
  
  // Dependências
  dependencies?: string[];
  
  // 🆕 Campos Operacionais
  notifications?: ModuleNotifications;
  monitoring?: ModuleMonitoring;
  logging?: ModuleLogging;
  ticketing?: ModuleTicketing;
  audit?: ModuleAudit;
}

// ============================================
// DEFINIÇÕES DE MÓDULOS
// ============================================

export const MODULE_REGISTRY: ModuleConfig[] = [
  // ============ MÓDULOS DE SISTEMA ============
  {
    id: 'system',
    name: 'Sistema',
    description: 'Configurações globais e acesso administrativo',
    icon: Shield,
    category: 'system',
    version: '1.0.0',
    enabled: true,
    isCore: true,
    permissions: [
      { id: 'system:full', name: 'Acesso Total', description: 'Controle total do sistema', level: 'admin' },
      { id: 'system:settings', name: 'Configurações', description: 'Editar configurações globais', level: 'manage' },
    ],
    routes: [
      { path: '/configuracoes', label: 'Configurações', icon: Settings, requiredPermissions: ['system:settings'] },
    ],
    features: [
      {
        id: 'global_settings',
        name: 'Configurações Globais',
        description: 'Gerenciar configurações da plataforma',
        icon: Settings,
        enabled: true,
      },
      {
        id: 'module_management',
        name: 'Gerenciamento de Módulos',
        description: 'Ativar/desativar módulos do sistema',
        icon: Shield,
        enabled: true,
        requiredPermission: 'system:full',
      },
    ],
    notifications: {
      triggers: [
        {
          id: 'system:module_enabled',
          event: 'module.enabled',
          name: 'Módulo Ativado',
          description: 'Notifica quando um módulo é ativado',
          template: 'O módulo {moduleName} foi ativado por {userName}',
          channels: ['in_app'],
          roles: ['super_admin'],
          priority: 'low',
          icon: CheckCircle,
          defaultEnabled: true,
        },
        {
          id: 'system:module_disabled',
          event: 'module.disabled',
          name: 'Módulo Desativado',
          description: 'Notifica quando um módulo é desativado',
          template: 'O módulo {moduleName} foi desativado por {userName}',
          channels: ['in_app', 'email'],
          roles: ['super_admin'],
          priority: 'medium',
          icon: XCircle,
          defaultEnabled: true,
        },
        {
          id: 'system:settings_changed',
          event: 'settings.changed',
          name: 'Configurações Alteradas',
          description: 'Notifica mudanças em configurações críticas',
          template: 'Configuração {settingName} alterada de {oldValue} para {newValue}',
          channels: ['in_app', 'email'],
          roles: ['super_admin'],
          priority: 'high',
          icon: Settings,
          defaultEnabled: true,
        },
      ],
    },
    monitoring: {
      metrics: [
        {
          id: 'system_uptime',
          name: 'Uptime do Sistema',
          description: 'Tempo de disponibilidade',
          type: 'percentage',
          unit: '%',
          aggregation: 'avg',
          icon: Activity,
          thresholds: { warning: 99, critical: 95, direction: 'below' },
        },
        {
          id: 'active_modules',
          name: 'Módulos Ativos',
          description: 'Quantidade de módulos habilitados',
          type: 'counter',
          aggregation: 'last',
          icon: Shield,
        },
      ],
      dashboardWidgets: [
        { id: 'system_health', name: 'Saúde do Sistema', type: 'gauge', metrics: ['system_uptime'], size: 'small', icon: Activity },
      ],
    },
    logging: {
      actions: [
        {
          id: 'system:settings_update',
          action: 'Atualização de Configuração',
          description: 'Alteração em configurações do sistema',
          severity: 'warning',
          category: 'configuration',
          dataToCapture: ['settingKey', 'oldValue', 'newValue', 'userId'],
          retentionDays: 365,
          searchable: true,
        },
        {
          id: 'system:module_toggle',
          action: 'Toggle de Módulo',
          description: 'Ativação ou desativação de módulo',
          severity: 'info',
          category: 'modules',
          dataToCapture: ['moduleId', 'enabled', 'userId'],
          retentionDays: 365,
          searchable: true,
        },
      ],
      defaultRetentionDays: 365,
    },
    audit: {
      actions: [
        {
          id: 'system:critical_settings_change',
          action: 'Alteração de Configuração Crítica',
          description: 'Mudança em configurações sensíveis do sistema',
          captureData: ['settingKey', 'oldValue', 'newValue', 'ipAddress', 'userAgent'],
          requiresReason: true,
          complianceTags: ['SOC2'],
          retentionYears: 7,
          alertOnAction: true,
          icon: AlertTriangle,
        },
      ],
      defaultRetentionYears: 5,
    },
  },

  {
    id: 'tenants',
    name: 'Tenants',
    description: 'Gerenciamento de tenants/clientes',
    icon: Building,
    category: 'system',
    version: '1.0.0',
    enabled: true,
    isCore: true,
    permissions: [
      { id: 'tenants:view', name: 'Visualizar', description: 'Ver lista de tenants', level: 'view' },
      { id: 'tenants:create', name: 'Criar', description: 'Adicionar novos tenants', level: 'create' },
      { id: 'tenants:edit', name: 'Editar', description: 'Modificar configurações de tenants', level: 'edit' },
      { id: 'tenants:delete', name: 'Remover', description: 'Excluir tenants', level: 'delete' },
    ],
    routes: [
      { path: '/tenants', label: 'Tenants', icon: Building, isDefault: true, requiredPermissions: ['tenants:view'] },
      { path: '/tenants/:id', label: 'Detalhes', requiredPermissions: ['tenants:view'] },
    ],
    navigation: {
      label: 'Tenants',
      path: '/tenants',
      icon: Building,
    },
    features: [
      { id: 'tenant_list', name: 'Listagem', description: 'Ver todos os tenants', icon: Building, enabled: true },
      { id: 'tenant_onboarding', name: 'Onboarding', description: 'Fluxo de cadastro de tenants', icon: Users, enabled: true },
    ],
    notifications: {
      triggers: [
        {
          id: 'tenants:created',
          event: 'tenant.created',
          name: 'Novo Tenant',
          description: 'Quando um novo tenant é criado',
          template: 'Novo tenant cadastrado: {tenantName}',
          channels: ['in_app', 'email'],
          roles: ['super_admin', 'admin'],
          priority: 'medium',
          icon: Building,
          defaultEnabled: true,
        },
        {
          id: 'tenants:suspended',
          event: 'tenant.suspended',
          name: 'Tenant Suspenso',
          description: 'Quando um tenant é suspenso',
          template: 'Tenant {tenantName} foi suspenso. Motivo: {reason}',
          channels: ['in_app', 'email'],
          roles: ['super_admin'],
          priority: 'high',
          icon: AlertTriangle,
          defaultEnabled: true,
        },
      ],
    },
    monitoring: {
      metrics: [
        {
          id: 'total_tenants',
          name: 'Total de Tenants',
          description: 'Número total de tenants ativos',
          type: 'counter',
          aggregation: 'last',
          icon: Building,
        },
        {
          id: 'new_tenants_month',
          name: 'Novos Tenants (Mês)',
          description: 'Tenants criados no mês',
          type: 'counter',
          aggregation: 'sum',
          icon: TrendingUp,
        },
        {
          id: 'tenant_churn_rate',
          name: 'Taxa de Churn',
          description: 'Percentual de cancelamentos',
          type: 'percentage',
          unit: '%',
          aggregation: 'avg',
          thresholds: { warning: 5, critical: 10, direction: 'above' },
        },
      ],
      dashboardWidgets: [
        { id: 'tenants_overview', name: 'Visão Geral de Tenants', type: 'number', metrics: ['total_tenants', 'new_tenants_month'], size: 'medium' },
      ],
    },
    logging: {
      actions: [
        {
          id: 'tenants:create',
          action: 'Criação de Tenant',
          description: 'Novo tenant cadastrado',
          severity: 'info',
          category: 'tenants',
          dataToCapture: ['tenantId', 'tenantName', 'planId', 'createdBy'],
          retentionDays: 730,
          searchable: true,
        },
        {
          id: 'tenants:delete',
          action: 'Exclusão de Tenant',
          description: 'Tenant removido do sistema',
          severity: 'warning',
          category: 'tenants',
          dataToCapture: ['tenantId', 'tenantName', 'deletedBy', 'reason'],
          retentionDays: 2555,
          searchable: true,
        },
      ],
      defaultRetentionDays: 365,
    },
    audit: {
      actions: [
        {
          id: 'tenants:delete',
          action: 'Exclusão de Tenant',
          description: 'Remoção permanente de tenant e dados',
          captureData: ['tenantId', 'tenantName', 'dataDeleted', 'backupCreated'],
          requiresReason: true,
          complianceTags: ['LGPD', 'GDPR'],
          retentionYears: 10,
          alertOnAction: true,
          icon: AlertTriangle,
        },
        {
          id: 'tenants:data_export',
          action: 'Exportação de Dados',
          description: 'Exportação de dados do tenant (LGPD)',
          captureData: ['tenantId', 'requestedBy', 'dataTypes', 'format'],
          complianceTags: ['LGPD', 'GDPR'],
          retentionYears: 5,
          icon: Database,
        },
      ],
      defaultRetentionYears: 7,
    },
  },

  {
    id: 'users',
    name: 'Usuários',
    description: 'Gerenciamento de usuários do sistema',
    icon: Users,
    category: 'system',
    version: '1.0.0',
    enabled: true,
    isCore: true,
    permissions: [
      { id: 'users:view', name: 'Visualizar', description: 'Ver lista de usuários', level: 'view' },
      { id: 'users:create', name: 'Criar', description: 'Adicionar novos usuários', level: 'create' },
      { id: 'users:edit', name: 'Editar', description: 'Modificar dados de usuários', level: 'edit' },
      { id: 'users:delete', name: 'Remover', description: 'Excluir usuários', level: 'delete' },
      { id: 'users:invite', name: 'Convidar', description: 'Enviar convites por email', level: 'create' },
    ],
    routes: [
      { path: '/usuarios', label: 'Usuários', icon: Users, isDefault: true, requiredPermissions: ['users:view'] },
    ],
    navigation: {
      label: 'Usuários',
      path: '/usuarios',
      icon: Users,
    },
    features: [
      { id: 'user_management', name: 'Gestão', description: 'CRUD de usuários', icon: Users, enabled: true },
      { id: 'user_invite', name: 'Convites', description: 'Enviar convites por email', icon: MessageSquare, enabled: true },
    ],
    notifications: {
      triggers: [
        {
          id: 'users:invited',
          event: 'user.invited',
          name: 'Convite Enviado',
          description: 'Quando um convite é enviado',
          template: 'Convite enviado para {email} por {invitedBy}',
          channels: ['in_app'],
          roles: ['admin'],
          priority: 'low',
          defaultEnabled: true,
        },
        {
          id: 'users:login_failed',
          event: 'user.login_failed',
          name: 'Falha de Login',
          description: 'Tentativas de login falhadas',
          template: 'Múltiplas tentativas de login falhadas para {email}',
          channels: ['in_app', 'email'],
          roles: ['super_admin', 'admin'],
          priority: 'high',
          icon: AlertTriangle,
          defaultEnabled: true,
          cooldown: 300,
        },
      ],
    },
    audit: {
      actions: [
        {
          id: 'users:permission_change',
          action: 'Alteração de Permissões',
          description: 'Mudança nas permissões de usuário',
          captureData: ['userId', 'userName', 'oldPermissions', 'newPermissions', 'changedBy'],
          requiresReason: false,
          complianceTags: ['SOC2'],
          retentionYears: 5,
          alertOnAction: true,
          icon: Lock,
        },
        {
          id: 'users:delete',
          action: 'Exclusão de Usuário',
          description: 'Remoção de usuário do sistema',
          captureData: ['userId', 'userName', 'email', 'deletedBy'],
          requiresReason: true,
          complianceTags: ['LGPD', 'GDPR'],
          retentionYears: 7,
          icon: XCircle,
        },
      ],
      defaultRetentionYears: 5,
    },
  },

  {
    id: 'roles',
    name: 'Roles',
    description: 'Gerenciamento de papéis e permissões',
    icon: Shield,
    category: 'system',
    version: '1.0.0',
    enabled: true,
    isCore: true,
    permissions: [
      { id: 'roles:view', name: 'Visualizar', description: 'Ver lista de roles', level: 'view' },
      { id: 'roles:create', name: 'Criar', description: 'Adicionar novas roles', level: 'create' },
      { id: 'roles:edit', name: 'Editar', description: 'Modificar permissões de roles', level: 'edit' },
      { id: 'roles:delete', name: 'Remover', description: 'Excluir roles', level: 'delete' },
    ],
    routes: [
      { path: '/roles', label: 'Roles', icon: Shield, isDefault: true, requiredPermissions: ['roles:view'] },
    ],
    navigation: {
      label: 'Roles',
      path: '/roles',
      icon: Shield,
    },
    features: [
      { id: 'role_templates', name: 'Templates', description: 'Templates pré-definidos de roles', icon: FileText, enabled: true },
      { id: 'permission_matrix', name: 'Matriz', description: 'Matriz visual de permissões', icon: BarChart3, enabled: true },
    ],
    audit: {
      actions: [
        {
          id: 'roles:create',
          action: 'Criação de Role',
          description: 'Nova role criada no sistema',
          captureData: ['roleId', 'roleName', 'permissions', 'createdBy'],
          complianceTags: ['SOC2'],
          retentionYears: 5,
        },
        {
          id: 'roles:permission_update',
          action: 'Atualização de Permissões da Role',
          description: 'Mudança nas permissões de uma role',
          captureData: ['roleId', 'roleName', 'addedPermissions', 'removedPermissions', 'updatedBy'],
          requiresReason: true,
          complianceTags: ['SOC2'],
          retentionYears: 7,
          alertOnAction: true,
          icon: Shield,
        },
      ],
      defaultRetentionYears: 5,
    },
  },

  // ============ MÓDULOS DE REDES SOCIAIS ============
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Gerenciamento completo de contas e publicações do Instagram',
    icon: Instagram,
    category: 'social',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    permissions: [
      { id: 'instagram:view', name: 'Visualizar', description: 'Ver contas e publicações', level: 'view' },
      { id: 'instagram:connect', name: 'Conectar Contas', description: 'Vincular novas contas do Instagram', level: 'create' },
      { id: 'instagram:disconnect', name: 'Desconectar', description: 'Remover contas vinculadas', level: 'delete' },
      { id: 'instagram:post', name: 'Publicar', description: 'Criar e agendar publicações', level: 'create' },
      { id: 'instagram:stories', name: 'Stories', description: 'Gerenciar stories', level: 'create' },
      { id: 'instagram:reels', name: 'Reels', description: 'Gerenciar reels', level: 'create' },
      { id: 'instagram:messages', name: 'Mensagens', description: 'Responder mensagens diretas', level: 'manage' },
      { id: 'instagram:analytics', name: 'Analytics', description: 'Ver métricas e insights', level: 'view' },
      { id: 'instagram:comments', name: 'Comentários', description: 'Gerenciar comentários', level: 'manage' },
    ],
    routes: [
      { path: '/instagram', label: 'Instagram', icon: Instagram, isDefault: true, requiredPermissions: ['instagram:view'] },
      { path: '/instagram/accounts', label: 'Contas', icon: Users, requiredPermissions: ['instagram:view'] },
      { path: '/instagram/schedule', label: 'Agendamentos', icon: Calendar, requiredPermissions: ['instagram:post'] },
      { path: '/instagram/analytics', label: 'Analytics', icon: BarChart3, requiredPermissions: ['instagram:analytics'] },
    ],
    navigation: {
      label: 'Redes Sociais',
      path: '/instagram',
      icon: Instagram,
      children: [
        { label: 'Instagram', path: '/instagram', icon: Instagram },
      ],
    },
    features: [
      {
        id: 'instagram_accounts',
        name: 'Gestão de Contas',
        description: 'Conectar e gerenciar múltiplas contas',
        icon: Users,
        enabled: true,
        requiredPermission: 'instagram:connect',
        settings: [
          { key: 'max_accounts', label: 'Máximo de contas', type: 'number', defaultValue: 5 },
          { key: 'auto_refresh_token', label: 'Renovar token automaticamente', type: 'toggle', defaultValue: true },
        ],
      },
      {
        id: 'instagram_posts',
        name: 'Publicações',
        description: 'Criar e agendar posts no feed',
        icon: Image,
        enabled: true,
        requiredPermission: 'instagram:post',
        settings: [
          { key: 'auto_hashtags', label: 'Sugerir hashtags automaticamente', type: 'toggle', defaultValue: true },
          { key: 'max_hashtags', label: 'Máximo de hashtags', type: 'number', defaultValue: 30 },
        ],
      },
      {
        id: 'instagram_stories',
        name: 'Stories',
        description: 'Publicar e agendar stories',
        icon: Eye,
        enabled: true,
        requiredPermission: 'instagram:stories',
      },
      {
        id: 'instagram_reels',
        name: 'Reels',
        description: 'Criar e publicar reels',
        icon: Video,
        enabled: true,
        requiredPermission: 'instagram:reels',
        settings: [
          { key: 'max_duration', label: 'Duração máxima (segundos)', type: 'number', defaultValue: 90 },
        ],
      },
      {
        id: 'instagram_dm',
        name: 'Direct Messages',
        description: 'Gerenciar mensagens diretas',
        icon: MessageCircle,
        enabled: true,
        requiredPermission: 'instagram:messages',
        settings: [
          { key: 'auto_reply', label: 'Resposta automática', type: 'toggle', defaultValue: false },
          { key: 'auto_reply_message', label: 'Mensagem automática', type: 'text', defaultValue: '' },
        ],
      },
      {
        id: 'instagram_comments',
        name: 'Comentários',
        description: 'Moderar e responder comentários',
        icon: MessageSquare,
        enabled: true,
        requiredPermission: 'instagram:comments',
        settings: [
          { key: 'auto_hide_spam', label: 'Ocultar spam automaticamente', type: 'toggle', defaultValue: true },
          { key: 'notify_negative', label: 'Alertar comentários negativos', type: 'toggle', defaultValue: true },
        ],
      },
      {
        id: 'instagram_analytics',
        name: 'Analytics',
        description: 'Métricas de engajamento e alcance',
        icon: BarChart3,
        enabled: true,
        requiredPermission: 'instagram:analytics',
        settings: [
          { key: 'report_frequency', label: 'Frequência de relatórios', type: 'select', defaultValue: 'weekly', options: [
            { label: 'Diário', value: 'daily' },
            { label: 'Semanal', value: 'weekly' },
            { label: 'Mensal', value: 'monthly' },
          ]},
        ],
      },
      {
        id: 'instagram_ai_captions',
        name: 'Legendas com IA',
        description: 'Gerar legendas usando inteligência artificial',
        icon: Brain,
        enabled: true,
        requiredPermission: 'instagram:post',
        settings: [
          { key: 'ai_tone', label: 'Tom das legendas', type: 'select', defaultValue: 'professional', options: [
            { label: 'Profissional', value: 'professional' },
            { label: 'Casual', value: 'casual' },
            { label: 'Divertido', value: 'fun' },
            { label: 'Inspiracional', value: 'inspirational' },
          ]},
        ],
      },
    ],
    dependencies: ['ai'],
    
    // 🔔 NOTIFICAÇÕES DO INSTAGRAM
    notifications: {
      triggers: [
        {
          id: 'instagram:account_connected',
          event: 'instagram.account.connected',
          name: 'Conta Conectada',
          description: 'Nova conta Instagram vinculada',
          template: 'Conta @{username} conectada com sucesso',
          channels: ['in_app'],
          roles: [],
          priority: 'low',
          icon: CheckCircle,
          defaultEnabled: true,
        },
        {
          id: 'instagram:account_disconnected',
          event: 'instagram.account.disconnected',
          name: 'Conta Desconectada',
          description: 'Conta Instagram removida ou token expirado',
          template: 'Conta @{username} foi desconectada. {reason}',
          channels: ['in_app', 'email'],
          roles: [],
          priority: 'high',
          icon: XCircle,
          defaultEnabled: true,
        },
        {
          id: 'instagram:token_expiring',
          event: 'instagram.token.expiring',
          name: 'Token Expirando',
          description: 'Token de acesso próximo da expiração',
          template: 'Token da conta @{username} expira em {daysLeft} dias. Reconecte a conta.',
          channels: ['in_app', 'email'],
          roles: [],
          priority: 'high',
          icon: Clock,
          defaultEnabled: true,
        },
        {
          id: 'instagram:post_published',
          event: 'instagram.post.published',
          name: 'Post Publicado',
          description: 'Publicação feita com sucesso',
          template: 'Post publicado em @{username}: "{caption}"',
          channels: ['in_app'],
          roles: [],
          priority: 'low',
          icon: CheckCircle,
          defaultEnabled: true,
        },
        {
          id: 'instagram:post_failed',
          event: 'instagram.post.failed',
          name: 'Falha na Publicação',
          description: 'Erro ao publicar conteúdo',
          template: 'Falha ao publicar em @{username}: {errorMessage}',
          channels: ['in_app', 'email', 'push'],
          roles: [],
          priority: 'urgent',
          icon: AlertTriangle,
          defaultEnabled: true,
        },
        {
          id: 'instagram:post_scheduled',
          event: 'instagram.post.scheduled',
          name: 'Post Agendado',
          description: 'Publicação agendada com sucesso',
          template: 'Post agendado para @{username} em {scheduledTime}',
          channels: ['in_app'],
          roles: [],
          priority: 'low',
          icon: Calendar,
          defaultEnabled: true,
        },
        {
          id: 'instagram:dm_received',
          event: 'instagram.dm.received',
          name: 'Mensagem Recebida',
          description: 'Nova mensagem direta recebida',
          template: 'Nova DM de @{senderUsername} em @{accountUsername}',
          channels: ['in_app', 'push'],
          roles: [],
          priority: 'medium',
          icon: MessageCircle,
          defaultEnabled: true,
          cooldown: 60,
        },
        {
          id: 'instagram:comment_negative',
          event: 'instagram.comment.negative',
          name: 'Comentário Negativo',
          description: 'Comentário com sentimento negativo detectado',
          template: 'Comentário negativo em @{username}: "{commentPreview}"',
          channels: ['in_app', 'push'],
          roles: [],
          priority: 'high',
          icon: AlertTriangle,
          defaultEnabled: true,
        },
        {
          id: 'instagram:follower_milestone',
          event: 'instagram.follower.milestone',
          name: 'Marco de Seguidores',
          description: 'Conta atingiu um marco de seguidores',
          template: '@{username} atingiu {followerCount} seguidores! 🎉',
          channels: ['in_app', 'email'],
          roles: [],
          priority: 'low',
          icon: TrendingUp,
          defaultEnabled: true,
        },
        {
          id: 'instagram:engagement_drop',
          event: 'instagram.engagement.drop',
          name: 'Queda de Engajamento',
          description: 'Engajamento abaixo do esperado',
          template: 'Engajamento de @{username} caiu {dropPercentage}% esta semana',
          channels: ['in_app', 'email'],
          roles: [],
          priority: 'medium',
          icon: TrendingUp,
          defaultEnabled: true,
        },
        {
          id: 'instagram:api_rate_limit',
          event: 'instagram.api.rate_limit',
          name: 'Limite de API',
          description: 'Limite de requisições atingido',
          template: 'Limite de API do Instagram atingido para @{username}. Aguarde {waitTime}.',
          channels: ['in_app'],
          roles: ['admin'],
          priority: 'high',
          icon: AlertTriangle,
          defaultEnabled: true,
        },
      ],
    },

    // 📊 MONITORAMENTO/KPIs DO INSTAGRAM
    monitoring: {
      metrics: [
        {
          id: 'instagram_total_accounts',
          name: 'Total de Contas',
          description: 'Número de contas conectadas',
          type: 'counter',
          aggregation: 'last',
          icon: Users,
        },
        {
          id: 'instagram_total_followers',
          name: 'Total de Seguidores',
          description: 'Soma de seguidores de todas as contas',
          type: 'counter',
          aggregation: 'sum',
          icon: Users,
        },
        {
          id: 'instagram_engagement_rate',
          name: 'Taxa de Engajamento',
          description: 'Média de engajamento (likes + comments / followers)',
          type: 'percentage',
          unit: '%',
          aggregation: 'avg',
          icon: Heart,
          thresholds: { warning: 2, critical: 1, direction: 'below' },
        },
        {
          id: 'instagram_posts_scheduled',
          name: 'Posts Agendados',
          description: 'Publicações na fila de agendamento',
          type: 'counter',
          aggregation: 'last',
          icon: Calendar,
        },
        {
          id: 'instagram_posts_published_day',
          name: 'Posts Publicados (Dia)',
          description: 'Publicações feitas hoje',
          type: 'counter',
          aggregation: 'sum',
          icon: Image,
          refreshInterval: 300,
        },
        {
          id: 'instagram_dm_pending',
          name: 'DMs Pendentes',
          description: 'Mensagens diretas não respondidas',
          type: 'counter',
          aggregation: 'last',
          icon: MessageCircle,
          thresholds: { warning: 10, critical: 50, direction: 'above' },
        },
        {
          id: 'instagram_reach_week',
          name: 'Alcance (Semana)',
          description: 'Contas alcançadas nos últimos 7 dias',
          type: 'counter',
          aggregation: 'sum',
          icon: Eye,
        },
        {
          id: 'instagram_impressions_week',
          name: 'Impressões (Semana)',
          description: 'Total de visualizações nos últimos 7 dias',
          type: 'counter',
          aggregation: 'sum',
          icon: Eye,
        },
        {
          id: 'instagram_follower_growth',
          name: 'Crescimento de Seguidores',
          description: 'Variação percentual de seguidores',
          type: 'percentage',
          unit: '%',
          aggregation: 'last',
          icon: TrendingUp,
          thresholds: { warning: -5, critical: -10, direction: 'below' },
        },
        {
          id: 'instagram_ai_captions_generated',
          name: 'Legendas IA Geradas',
          description: 'Legendas criadas com IA no período',
          type: 'counter',
          aggregation: 'sum',
          icon: Brain,
        },
        {
          id: 'instagram_post_success_rate',
          name: 'Taxa de Sucesso',
          description: 'Percentual de posts publicados com sucesso',
          type: 'percentage',
          unit: '%',
          aggregation: 'avg',
          icon: CheckCircle,
          thresholds: { warning: 95, critical: 90, direction: 'below' },
        },
        {
          id: 'instagram_avg_response_time',
          name: 'Tempo Médio de Resposta',
          description: 'Tempo médio para responder DMs',
          type: 'duration',
          unit: 'min',
          aggregation: 'avg',
          icon: Clock,
          thresholds: { warning: 60, critical: 180, direction: 'above' },
        },
      ],
      dashboardWidgets: [
        { id: 'instagram_overview', name: 'Visão Geral', type: 'number', metrics: ['instagram_total_accounts', 'instagram_total_followers', 'instagram_engagement_rate'], size: 'large', icon: Instagram },
        { id: 'instagram_engagement_chart', name: 'Engajamento', type: 'chart', metrics: ['instagram_engagement_rate'], size: 'medium', icon: Heart },
        { id: 'instagram_growth', name: 'Crescimento', type: 'chart', metrics: ['instagram_follower_growth'], size: 'medium', icon: TrendingUp },
        { id: 'instagram_content', name: 'Conteúdo', type: 'number', metrics: ['instagram_posts_scheduled', 'instagram_posts_published_day'], size: 'small', icon: Image },
        { id: 'instagram_messages', name: 'Mensagens', type: 'gauge', metrics: ['instagram_dm_pending'], size: 'small', icon: MessageCircle },
        { id: 'instagram_ai_usage', name: 'Uso de IA', type: 'number', metrics: ['instagram_ai_captions_generated'], size: 'small', icon: Brain },
      ],
    },

    // 📝 LOGS DO INSTAGRAM
    logging: {
      actions: [
        {
          id: 'instagram:account_connect',
          action: 'Conexão de Conta',
          description: 'Vinculação de nova conta Instagram',
          severity: 'info',
          category: 'accounts',
          dataToCapture: ['accountId', 'username', 'userId', 'timestamp'],
          retentionDays: 365,
          searchable: true,
        },
        {
          id: 'instagram:account_disconnect',
          action: 'Desconexão de Conta',
          description: 'Remoção de conta vinculada',
          severity: 'warning',
          category: 'accounts',
          dataToCapture: ['accountId', 'username', 'userId', 'reason', 'timestamp'],
          retentionDays: 365,
          searchable: true,
        },
        {
          id: 'instagram:post_create',
          action: 'Criação de Post',
          description: 'Novo post criado/agendado',
          severity: 'info',
          category: 'content',
          dataToCapture: ['postId', 'accountId', 'type', 'scheduledTime', 'userId'],
          retentionDays: 180,
          searchable: true,
        },
        {
          id: 'instagram:post_publish',
          action: 'Publicação de Post',
          description: 'Post publicado no Instagram',
          severity: 'info',
          category: 'content',
          dataToCapture: ['postId', 'accountId', 'instagramPostId', 'publishedAt'],
          retentionDays: 365,
          searchable: true,
        },
        {
          id: 'instagram:post_fail',
          action: 'Falha de Publicação',
          description: 'Erro ao publicar post',
          severity: 'error',
          category: 'content',
          dataToCapture: ['postId', 'accountId', 'errorCode', 'errorMessage', 'retryCount'],
          retentionDays: 365,
          searchable: true,
        },
        {
          id: 'instagram:dm_send',
          action: 'Envio de DM',
          description: 'Mensagem direta enviada',
          severity: 'info',
          category: 'messages',
          dataToCapture: ['accountId', 'recipientId', 'messageType', 'userId'],
          retentionDays: 90,
          searchable: false,
        },
        {
          id: 'instagram:comment_reply',
          action: 'Resposta a Comentário',
          description: 'Resposta a comentário publicada',
          severity: 'info',
          category: 'engagement',
          dataToCapture: ['accountId', 'postId', 'commentId', 'userId'],
          retentionDays: 90,
          searchable: false,
        },
        {
          id: 'instagram:api_error',
          action: 'Erro de API',
          description: 'Erro na comunicação com API do Instagram',
          severity: 'error',
          category: 'api',
          dataToCapture: ['endpoint', 'errorCode', 'errorMessage', 'accountId', 'requestId'],
          retentionDays: 30,
          searchable: true,
        },
        {
          id: 'instagram:ai_caption_generate',
          action: 'Geração de Legenda IA',
          description: 'Legenda gerada com inteligência artificial',
          severity: 'info',
          category: 'ai',
          dataToCapture: ['postId', 'promptType', 'tokensUsed', 'userId'],
          retentionDays: 180,
          searchable: true,
        },
      ],
      defaultRetentionDays: 180,
    },

    // 🎫 TICKETS AUTOMÁTICOS DO INSTAGRAM
    ticketing: {
      autoCreate: [
        {
          id: 'instagram:api_rate_limit_ticket',
          trigger: 'instagram.api.rate_limit',
          name: 'Limite de API Instagram',
          description: 'Limite de requisições da API atingido',
          priority: 'high',
          category: 'integration',
          tags: ['instagram', 'api', 'rate-limit'],
          escalationMinutes: 60,
        },
        {
          id: 'instagram:token_expired_ticket',
          trigger: 'instagram.token.expired',
          name: 'Token Expirado',
          description: 'Token de acesso expirou e precisa renovação',
          priority: 'urgent',
          category: 'integration',
          tags: ['instagram', 'token', 'auth'],
          autoAssign: true,
          escalationMinutes: 30,
        },
        {
          id: 'instagram:repeated_failures_ticket',
          trigger: 'instagram.post.repeated_failures',
          name: 'Falhas Repetidas de Publicação',
          description: 'Múltiplas falhas consecutivas ao publicar',
          priority: 'high',
          category: 'content',
          tags: ['instagram', 'publishing', 'error'],
          escalationMinutes: 120,
        },
        {
          id: 'instagram:account_blocked_ticket',
          trigger: 'instagram.account.blocked',
          name: 'Conta Bloqueada',
          description: 'Conta Instagram bloqueada ou restrita',
          priority: 'urgent',
          category: 'account',
          tags: ['instagram', 'blocked', 'account'],
          autoAssign: true,
          escalationMinutes: 15,
        },
        {
          id: 'instagram:spam_detected_ticket',
          trigger: 'instagram.comment.spam_wave',
          name: 'Onda de Spam Detectada',
          description: 'Grande volume de comentários spam detectados',
          priority: 'medium',
          category: 'moderation',
          tags: ['instagram', 'spam', 'moderation'],
          escalationMinutes: 240,
        },
      ],
    },

    // 🔍 AUDITORIA DO INSTAGRAM
    audit: {
      actions: [
        {
          id: 'instagram:account_connect_audit',
          action: 'Conexão de Conta Instagram',
          description: 'Nova conta vinculada ao sistema',
          captureData: ['accountId', 'username', 'userId', 'ipAddress', 'permissions'],
          complianceTags: ['SOC2'],
          retentionYears: 3,
          icon: Link2,
        },
        {
          id: 'instagram:account_disconnect_audit',
          action: 'Desconexão de Conta Instagram',
          description: 'Conta removida do sistema',
          captureData: ['accountId', 'username', 'userId', 'reason', 'dataRetained'],
          requiresReason: true,
          complianceTags: ['LGPD', 'GDPR'],
          retentionYears: 5,
          icon: XCircle,
        },
        {
          id: 'instagram:mass_delete',
          action: 'Exclusão em Massa',
          description: 'Múltiplos posts ou dados excluídos',
          captureData: ['itemCount', 'itemType', 'userId', 'reason'],
          requiresReason: true,
          complianceTags: ['LGPD'],
          retentionYears: 5,
          alertOnAction: true,
          icon: AlertTriangle,
        },
        {
          id: 'instagram:permission_change',
          action: 'Alteração de Permissões',
          description: 'Mudança nas permissões de acesso à conta',
          captureData: ['accountId', 'userId', 'oldPermissions', 'newPermissions'],
          complianceTags: ['SOC2'],
          retentionYears: 3,
          icon: Lock,
        },
        {
          id: 'instagram:data_export',
          action: 'Exportação de Dados',
          description: 'Dados da conta exportados',
          captureData: ['accountId', 'exportType', 'userId', 'format', 'recordCount'],
          complianceTags: ['LGPD', 'GDPR'],
          retentionYears: 5,
          icon: Database,
        },
      ],
      defaultRetentionYears: 3,
    },
  },

  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Gerenciamento de páginas e publicações do Facebook',
    icon: Facebook,
    category: 'social',
    version: '1.0.0',
    enabled: false,
    isCore: false,
    permissions: [
      { id: 'facebook:view', name: 'Visualizar', description: 'Ver páginas e publicações', level: 'view' },
      { id: 'facebook:connect', name: 'Conectar Páginas', description: 'Vincular novas páginas', level: 'create' },
      { id: 'facebook:post', name: 'Publicar', description: 'Criar publicações', level: 'create' },
      { id: 'facebook:messages', name: 'Mensagens', description: 'Responder mensagens', level: 'manage' },
      { id: 'facebook:analytics', name: 'Analytics', description: 'Ver métricas', level: 'view' },
    ],
    routes: [
      { path: '/facebook', label: 'Facebook', icon: Facebook, isDefault: true },
    ],
    navigation: {
      label: 'Facebook',
      path: '/facebook',
      icon: Facebook,
    },
    features: [
      { id: 'facebook_pages', name: 'Páginas', description: 'Gerenciar páginas', icon: LayoutDashboard, enabled: true },
      { id: 'facebook_posts', name: 'Publicações', description: 'Criar posts', icon: Image, enabled: true },
      { id: 'facebook_analytics', name: 'Analytics', description: 'Métricas', icon: BarChart3, enabled: true },
    ],
  },

  {
    id: 'twitter',
    name: 'Twitter/X',
    description: 'Gerenciamento de contas e tweets',
    icon: Twitter,
    category: 'social',
    version: '1.0.0',
    enabled: false,
    isCore: false,
    permissions: [
      { id: 'twitter:view', name: 'Visualizar', description: 'Ver contas e tweets', level: 'view' },
      { id: 'twitter:connect', name: 'Conectar Contas', description: 'Vincular novas contas', level: 'create' },
      { id: 'twitter:post', name: 'Publicar', description: 'Criar tweets', level: 'create' },
      { id: 'twitter:messages', name: 'Mensagens', description: 'Responder mensagens', level: 'manage' },
      { id: 'twitter:analytics', name: 'Analytics', description: 'Ver métricas', level: 'view' },
    ],
    routes: [
      { path: '/twitter', label: 'Twitter', icon: Twitter, isDefault: true },
    ],
    features: [
      { id: 'twitter_posts', name: 'Tweets', description: 'Criar e agendar tweets', icon: MessageSquare, enabled: true },
      { id: 'twitter_threads', name: 'Threads', description: 'Criar threads', icon: Link2, enabled: true },
    ],
  },

  // ============ MÓDULOS DE TENANT ============
  {
    id: 'chat',
    name: 'Chat',
    description: 'Atendimento e conversas com clientes',
    icon: MessageSquare,
    category: 'tenant',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    permissions: [
      { id: 'chat:view', name: 'Visualizar', description: 'Ver histórico de conversas', level: 'view' },
      { id: 'chat:manage', name: 'Gerenciar', description: 'Atender e transferir conversas', level: 'manage' },
      { id: 'chat:delete', name: 'Excluir', description: 'Remover conversas', level: 'delete' },
    ],
    routes: [
      { path: '/tenant/chat', label: 'Chat', icon: MessageSquare, isDefault: true },
    ],
    features: [
      { id: 'chat_live', name: 'Chat ao Vivo', description: 'Atendimento em tempo real', icon: MessageSquare, enabled: true },
      { id: 'chat_history', name: 'Histórico', description: 'Histórico de conversas', icon: FileText, enabled: true },
      {
        id: 'chat_ai_assistant',
        name: 'Assistente IA',
        description: 'Respostas automáticas com IA',
        icon: Brain,
        enabled: true,
        settings: [
          { key: 'ai_enabled', label: 'Habilitar IA', type: 'toggle', defaultValue: true },
          { key: 'ai_auto_respond', label: 'Responder automaticamente', type: 'toggle', defaultValue: false },
          { key: 'ai_confidence_threshold', label: 'Confiança mínima (%)', type: 'number', defaultValue: 80 },
        ],
      },
      {
        id: 'chat_quick_replies',
        name: 'Respostas Rápidas',
        description: 'Templates de mensagens pré-definidas',
        icon: Zap,
        enabled: true,
      },
    ],
    dependencies: ['ai'],

    // 🔔 NOTIFICAÇÕES DO CHAT
    notifications: {
      triggers: [
        {
          id: 'chat:new_conversation',
          event: 'chat.conversation.new',
          name: 'Nova Conversa',
          description: 'Cliente iniciou nova conversa',
          template: 'Nova conversa de {customerName}: "{messagePreview}"',
          channels: ['in_app', 'push'],
          roles: [],
          priority: 'high',
          icon: MessageSquare,
          defaultEnabled: true,
        },
        {
          id: 'chat:message_received',
          event: 'chat.message.received',
          name: 'Mensagem Recebida',
          description: 'Nova mensagem em conversa existente',
          template: 'Mensagem de {customerName}: "{messagePreview}"',
          channels: ['in_app', 'push'],
          roles: [],
          priority: 'medium',
          icon: MessageCircle,
          defaultEnabled: true,
          cooldown: 30,
        },
        {
          id: 'chat:waiting_too_long',
          event: 'chat.waiting.exceeded',
          name: 'Tempo de Espera Excedido',
          description: 'Cliente aguardando resposta além do SLA',
          template: 'Cliente {customerName} aguardando há {waitTime}. SLA: {slaTime}',
          channels: ['in_app', 'push', 'email'],
          roles: ['admin', 'operator'],
          priority: 'urgent',
          icon: Clock,
          defaultEnabled: true,
        },
        {
          id: 'chat:conversation_assigned',
          event: 'chat.conversation.assigned',
          name: 'Conversa Atribuída',
          description: 'Conversa atribuída para você',
          template: 'Conversa de {customerName} atribuída para você',
          channels: ['in_app', 'push'],
          roles: [],
          priority: 'high',
          icon: Users,
          defaultEnabled: true,
        },
        {
          id: 'chat:conversation_transferred',
          event: 'chat.conversation.transferred',
          name: 'Conversa Transferida',
          description: 'Conversa transferida entre atendentes',
          template: 'Conversa de {customerName} transferida de {fromAgent} para {toAgent}',
          channels: ['in_app'],
          roles: ['admin'],
          priority: 'low',
          icon: RefreshCw,
          defaultEnabled: true,
        },
        {
          id: 'chat:ai_failed',
          event: 'chat.ai.failed',
          name: 'Falha da IA',
          description: 'Assistente IA não conseguiu responder',
          template: 'IA não conseguiu responder {customerName}. Intervenção necessária.',
          channels: ['in_app', 'push'],
          roles: [],
          priority: 'high',
          icon: Brain,
          defaultEnabled: true,
        },
        {
          id: 'chat:customer_rating',
          event: 'chat.rating.received',
          name: 'Avaliação Recebida',
          description: 'Cliente avaliou o atendimento',
          template: 'Avaliação {rating}/5 de {customerName}: "{comment}"',
          channels: ['in_app'],
          roles: [],
          priority: 'low',
          icon: Heart,
          defaultEnabled: true,
        },
        {
          id: 'chat:negative_sentiment',
          event: 'chat.sentiment.negative',
          name: 'Sentimento Negativo',
          description: 'Detectado sentimento negativo na conversa',
          template: 'Sentimento negativo detectado na conversa com {customerName}',
          channels: ['in_app', 'push'],
          roles: ['admin'],
          priority: 'high',
          icon: AlertTriangle,
          defaultEnabled: true,
        },
      ],
    },

    // 📊 MONITORAMENTO/KPIs DO CHAT
    monitoring: {
      metrics: [
        {
          id: 'chat_active_conversations',
          name: 'Conversas Ativas',
          description: 'Número de conversas em andamento',
          type: 'counter',
          aggregation: 'last',
          icon: MessageSquare,
          refreshInterval: 30,
        },
        {
          id: 'chat_waiting_customers',
          name: 'Clientes Aguardando',
          description: 'Clientes na fila de espera',
          type: 'counter',
          aggregation: 'last',
          icon: Clock,
          thresholds: { warning: 5, critical: 15, direction: 'above' },
          refreshInterval: 30,
        },
        {
          id: 'chat_avg_wait_time',
          name: 'Tempo Médio de Espera',
          description: 'Tempo médio até primeiro atendimento',
          type: 'duration',
          unit: 'min',
          aggregation: 'avg',
          icon: Clock,
          thresholds: { warning: 5, critical: 15, direction: 'above' },
        },
        {
          id: 'chat_avg_response_time',
          name: 'Tempo Médio de Resposta',
          description: 'Tempo médio entre mensagens',
          type: 'duration',
          unit: 'sec',
          aggregation: 'avg',
          icon: Zap,
          thresholds: { warning: 120, critical: 300, direction: 'above' },
        },
        {
          id: 'chat_avg_resolution_time',
          name: 'Tempo Médio de Resolução',
          description: 'Tempo médio para resolver conversa',
          type: 'duration',
          unit: 'min',
          aggregation: 'avg',
          icon: CheckCircle,
        },
        {
          id: 'chat_csat_score',
          name: 'CSAT',
          description: 'Customer Satisfaction Score',
          type: 'percentage',
          unit: '%',
          aggregation: 'avg',
          icon: Heart,
          thresholds: { warning: 80, critical: 60, direction: 'below' },
        },
        {
          id: 'chat_conversations_day',
          name: 'Conversas (Dia)',
          description: 'Total de conversas iniciadas hoje',
          type: 'counter',
          aggregation: 'sum',
          icon: MessageSquare,
        },
        {
          id: 'chat_resolved_day',
          name: 'Resolvidas (Dia)',
          description: 'Conversas finalizadas hoje',
          type: 'counter',
          aggregation: 'sum',
          icon: CheckCircle,
        },
        {
          id: 'chat_ai_resolution_rate',
          name: 'Taxa Resolução IA',
          description: 'Percentual resolvido sem humano',
          type: 'percentage',
          unit: '%',
          aggregation: 'avg',
          icon: Brain,
        },
        {
          id: 'chat_first_contact_resolution',
          name: 'FCR',
          description: 'First Contact Resolution',
          type: 'percentage',
          unit: '%',
          aggregation: 'avg',
          icon: CheckCircle,
          thresholds: { warning: 70, critical: 50, direction: 'below' },
        },
        {
          id: 'chat_agent_utilization',
          name: 'Utilização de Agentes',
          description: 'Percentual de capacidade em uso',
          type: 'percentage',
          unit: '%',
          aggregation: 'avg',
          icon: Users,
          thresholds: { warning: 90, critical: 100, direction: 'above' },
        },
      ],
      dashboardWidgets: [
        { id: 'chat_realtime', name: 'Tempo Real', type: 'number', metrics: ['chat_active_conversations', 'chat_waiting_customers', 'chat_avg_wait_time'], size: 'large', icon: Activity },
        { id: 'chat_performance', name: 'Performance', type: 'gauge', metrics: ['chat_csat_score', 'chat_first_contact_resolution'], size: 'medium', icon: TrendingUp },
        { id: 'chat_volume', name: 'Volume', type: 'chart', metrics: ['chat_conversations_day', 'chat_resolved_day'], size: 'medium', icon: BarChart3 },
        { id: 'chat_ai_metrics', name: 'Métricas IA', type: 'number', metrics: ['chat_ai_resolution_rate'], size: 'small', icon: Brain },
        { id: 'chat_agents', name: 'Agentes', type: 'gauge', metrics: ['chat_agent_utilization'], size: 'small', icon: Users },
      ],
    },

    // 📝 LOGS DO CHAT
    logging: {
      actions: [
        {
          id: 'chat:conversation_start',
          action: 'Início de Conversa',
          description: 'Nova conversa iniciada',
          severity: 'info',
          category: 'conversations',
          dataToCapture: ['conversationId', 'customerId', 'channel', 'timestamp'],
          retentionDays: 365,
          searchable: true,
        },
        {
          id: 'chat:conversation_end',
          action: 'Fim de Conversa',
          description: 'Conversa finalizada',
          severity: 'info',
          category: 'conversations',
          dataToCapture: ['conversationId', 'duration', 'resolution', 'rating'],
          retentionDays: 365,
          searchable: true,
        },
        {
          id: 'chat:message_sent',
          action: 'Mensagem Enviada',
          description: 'Mensagem enviada pelo atendente',
          severity: 'debug',
          category: 'messages',
          dataToCapture: ['conversationId', 'agentId', 'messageType'],
          retentionDays: 90,
          searchable: false,
        },
        {
          id: 'chat:transfer',
          action: 'Transferência',
          description: 'Conversa transferida',
          severity: 'info',
          category: 'routing',
          dataToCapture: ['conversationId', 'fromAgentId', 'toAgentId', 'reason'],
          retentionDays: 180,
          searchable: true,
        },
        {
          id: 'chat:ai_response',
          action: 'Resposta IA',
          description: 'IA respondeu automaticamente',
          severity: 'info',
          category: 'ai',
          dataToCapture: ['conversationId', 'confidence', 'tokensUsed', 'responseTime'],
          retentionDays: 180,
          searchable: true,
        },
        {
          id: 'chat:ai_escalation',
          action: 'Escalação de IA',
          description: 'IA escalou para atendente humano',
          severity: 'warning',
          category: 'ai',
          dataToCapture: ['conversationId', 'reason', 'lastConfidence'],
          retentionDays: 180,
          searchable: true,
        },
        {
          id: 'chat:sla_breach',
          action: 'Violação de SLA',
          description: 'SLA de tempo de resposta violado',
          severity: 'error',
          category: 'sla',
          dataToCapture: ['conversationId', 'slaType', 'expectedTime', 'actualTime'],
          retentionDays: 365,
          searchable: true,
        },
      ],
      defaultRetentionDays: 180,
    },

    // 🎫 TICKETS AUTOMÁTICOS DO CHAT
    ticketing: {
      autoCreate: [
        {
          id: 'chat:sla_breach_ticket',
          trigger: 'chat.sla.breach',
          name: 'Violação de SLA de Chat',
          description: 'Cliente não atendido dentro do SLA',
          priority: 'high',
          category: 'sla',
          tags: ['chat', 'sla', 'atendimento'],
          escalationMinutes: 30,
        },
        {
          id: 'chat:repeated_complaints_ticket',
          trigger: 'chat.complaints.repeated',
          name: 'Reclamações Repetidas',
          description: 'Múltiplas reclamações do mesmo cliente',
          priority: 'high',
          category: 'customer-service',
          tags: ['chat', 'reclamacao', 'cliente'],
          autoAssign: true,
          escalationMinutes: 60,
        },
        {
          id: 'chat:low_rating_ticket',
          trigger: 'chat.rating.low',
          name: 'Avaliação Negativa',
          description: 'Cliente deu nota baixa no atendimento',
          priority: 'medium',
          category: 'quality',
          tags: ['chat', 'avaliacao', 'qualidade'],
          escalationMinutes: 240,
        },
        {
          id: 'chat:queue_overflow_ticket',
          trigger: 'chat.queue.overflow',
          name: 'Fila Sobrecarregada',
          description: 'Fila de espera acima do limite',
          priority: 'urgent',
          category: 'capacity',
          tags: ['chat', 'fila', 'capacidade'],
          autoAssign: true,
          escalationMinutes: 15,
        },
      ],
    },

    // 🔍 AUDITORIA DO CHAT
    audit: {
      actions: [
        {
          id: 'chat:conversation_delete',
          action: 'Exclusão de Conversa',
          description: 'Conversa excluída do histórico',
          captureData: ['conversationId', 'customerId', 'deletedBy', 'messageCount'],
          requiresReason: true,
          complianceTags: ['LGPD', 'GDPR'],
          retentionYears: 5,
          alertOnAction: true,
          icon: XCircle,
        },
        {
          id: 'chat:data_export',
          action: 'Exportação de Histórico',
          description: 'Histórico de conversas exportado',
          captureData: ['dateRange', 'exportedBy', 'recordCount', 'format'],
          complianceTags: ['LGPD', 'GDPR'],
          retentionYears: 3,
          icon: Database,
        },
        {
          id: 'chat:ai_settings_change',
          action: 'Alteração de Configurações de IA',
          description: 'Configurações do assistente IA modificadas',
          captureData: ['settingKey', 'oldValue', 'newValue', 'changedBy'],
          complianceTags: ['SOC2'],
          retentionYears: 3,
          icon: Brain,
        },
        {
          id: 'chat:customer_data_access',
          action: 'Acesso a Dados do Cliente',
          description: 'Visualização de dados sensíveis do cliente',
          captureData: ['customerId', 'accessedBy', 'dataTypes', 'purpose'],
          complianceTags: ['LGPD', 'GDPR'],
          retentionYears: 3,
          icon: Eye,
        },
      ],
      defaultRetentionYears: 3,
    },
  },

  {
    id: 'calendar',
    name: 'Calendário',
    description: 'Agendamentos e compromissos',
    icon: Calendar,
    category: 'tenant',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    permissions: [
      { id: 'calendar:view', name: 'Visualizar', description: 'Ver agendamentos', level: 'view' },
      { id: 'calendar:manage', name: 'Gerenciar', description: 'Criar e editar agendamentos', level: 'manage' },
    ],
    routes: [
      { path: '/tenant/calendar', label: 'Calendário', icon: Calendar, isDefault: true },
    ],
    features: [
      { id: 'calendar_events', name: 'Eventos', description: 'Criar e gerenciar eventos', icon: Calendar, enabled: true },
      { id: 'calendar_reminders', name: 'Lembretes', description: 'Notificações de eventos', icon: Bell, enabled: true },
    ],
    notifications: {
      triggers: [
        {
          id: 'calendar:event_reminder',
          event: 'calendar.event.reminder',
          name: 'Lembrete de Evento',
          description: 'Lembrete antes do evento',
          template: 'Evento "{eventName}" em {timeUntil}',
          channels: ['in_app', 'push', 'email'],
          roles: [],
          priority: 'medium',
          icon: Bell,
          defaultEnabled: true,
        },
        {
          id: 'calendar:event_cancelled',
          event: 'calendar.event.cancelled',
          name: 'Evento Cancelado',
          description: 'Evento foi cancelado',
          template: 'Evento "{eventName}" foi cancelado por {cancelledBy}',
          channels: ['in_app', 'email'],
          roles: [],
          priority: 'high',
          icon: XCircle,
          defaultEnabled: true,
        },
      ],
    },
  },

  {
    id: 'automations',
    name: 'Automações',
    description: 'Fluxos automatizados e gatilhos',
    icon: Zap,
    category: 'tenant',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    permissions: [
      { id: 'automations:view', name: 'Visualizar', description: 'Ver automações configuradas', level: 'view' },
      { id: 'automations:create', name: 'Criar', description: 'Adicionar novas automações', level: 'create' },
      { id: 'automations:edit', name: 'Editar', description: 'Modificar automações existentes', level: 'edit' },
      { id: 'automations:delete', name: 'Remover', description: 'Excluir automações', level: 'delete' },
      { id: 'automations:toggle', name: 'Ativar/Desativar', description: 'Ligar ou desligar automações', level: 'manage' },
    ],
    routes: [
      { path: '/tenant/automations', label: 'Automações', icon: Zap, isDefault: true },
    ],
    features: [
      { id: 'automation_triggers', name: 'Gatilhos', description: 'Definir condições de disparo', icon: Zap, enabled: true },
      { id: 'automation_actions', name: 'Ações', description: 'Configurar ações automáticas', icon: Settings, enabled: true },
    ],
    notifications: {
      triggers: [
        {
          id: 'automations:execution_failed',
          event: 'automation.execution.failed',
          name: 'Falha de Execução',
          description: 'Automação falhou ao executar',
          template: 'Automação "{automationName}" falhou: {errorMessage}',
          channels: ['in_app', 'email'],
          roles: ['admin'],
          priority: 'high',
          icon: AlertTriangle,
          defaultEnabled: true,
        },
      ],
    },
    logging: {
      actions: [
        {
          id: 'automations:execute',
          action: 'Execução de Automação',
          description: 'Automação foi executada',
          severity: 'info',
          category: 'automations',
          dataToCapture: ['automationId', 'triggerId', 'executionTime', 'result'],
          retentionDays: 90,
          searchable: true,
        },
        {
          id: 'automations:execute_fail',
          action: 'Falha de Automação',
          description: 'Erro na execução de automação',
          severity: 'error',
          category: 'automations',
          dataToCapture: ['automationId', 'triggerId', 'errorCode', 'errorMessage'],
          retentionDays: 365,
          searchable: true,
        },
      ],
      defaultRetentionDays: 90,
    },
  },

  {
    id: 'ai',
    name: 'IA',
    description: 'Configurações e consumo de IA',
    icon: Brain,
    category: 'tenant',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    permissions: [
      { id: 'ai:view_consumption', name: 'Ver Consumo', description: 'Visualizar métricas de consumo de IA', level: 'view' },
      { id: 'ai:configure', name: 'Configurar', description: 'Alterar configurações de IA do tenant', level: 'manage' },
      { id: 'ai:manage_limits', name: 'Gerenciar Limites', description: 'Definir limites de consumo de IA', level: 'admin' },
    ],
    routes: [
      { path: '/ai-overview', label: 'Visão Geral', icon: BarChart3, isDefault: true },
      { path: '/niche-templates', label: 'Templates', icon: FileText },
    ],
    features: [
      { id: 'ai_assistant', name: 'Assistente Virtual', description: 'Chat com IA', icon: Brain, enabled: true },
      { id: 'ai_content', name: 'Geração de Conteúdo', description: 'Criar textos com IA', icon: FileText, enabled: true },
      { id: 'ai_sentiment', name: 'Análise de Sentimento', description: 'Detectar tom de mensagens', icon: Heart, enabled: true },
    ],
    notifications: {
      triggers: [
        {
          id: 'ai:quota_warning',
          event: 'ai.quota.warning',
          name: 'Quota de IA',
          description: 'Consumo de IA próximo do limite',
          template: 'Consumo de IA em {usagePercentage}% do limite mensal',
          channels: ['in_app', 'email'],
          roles: ['admin'],
          priority: 'high',
          icon: AlertTriangle,
          defaultEnabled: true,
        },
        {
          id: 'ai:quota_exceeded',
          event: 'ai.quota.exceeded',
          name: 'Limite de IA Excedido',
          description: 'Limite de consumo de IA atingido',
          template: 'Limite de IA atingido. Funcionalidades de IA desativadas.',
          channels: ['in_app', 'email', 'push'],
          roles: ['admin'],
          priority: 'urgent',
          icon: XCircle,
          defaultEnabled: true,
        },
      ],
    },
    monitoring: {
      metrics: [
        {
          id: 'ai_tokens_used',
          name: 'Tokens Utilizados',
          description: 'Total de tokens consumidos',
          type: 'counter',
          aggregation: 'sum',
          icon: Brain,
        },
        {
          id: 'ai_quota_usage',
          name: 'Uso da Quota',
          description: 'Percentual da quota mensal utilizada',
          type: 'percentage',
          unit: '%',
          aggregation: 'last',
          icon: BarChart3,
          thresholds: { warning: 80, critical: 95, direction: 'above' },
        },
        {
          id: 'ai_avg_response_time',
          name: 'Tempo de Resposta IA',
          description: 'Tempo médio de resposta da IA',
          type: 'duration',
          unit: 'ms',
          aggregation: 'avg',
          icon: Clock,
          thresholds: { warning: 3000, critical: 10000, direction: 'above' },
        },
        {
          id: 'ai_cost_month',
          name: 'Custo Mensal',
          description: 'Custo estimado de IA no mês',
          type: 'currency',
          unit: 'R$',
          aggregation: 'sum',
          icon: CreditCard,
        },
      ],
      dashboardWidgets: [
        { id: 'ai_usage', name: 'Consumo de IA', type: 'gauge', metrics: ['ai_quota_usage'], size: 'medium', icon: Brain },
        { id: 'ai_costs', name: 'Custos', type: 'number', metrics: ['ai_cost_month'], size: 'small', icon: CreditCard },
      ],
    },
    logging: {
      actions: [
        {
          id: 'ai:request',
          action: 'Requisição de IA',
          description: 'Chamada para API de IA',
          severity: 'debug',
          category: 'ai',
          dataToCapture: ['model', 'tokensInput', 'tokensOutput', 'responseTime', 'cost'],
          retentionDays: 30,
          searchable: false,
        },
        {
          id: 'ai:quota_exceeded',
          action: 'Quota Excedida',
          description: 'Limite de IA atingido',
          severity: 'warning',
          category: 'ai',
          dataToCapture: ['tenantId', 'quotaLimit', 'currentUsage'],
          retentionDays: 365,
          searchable: true,
        },
      ],
      defaultRetentionDays: 30,
    },
  },

  // ============ MÓDULOS DE SUPORTE ============
  {
    id: 'support_tenant',
    name: 'Suporte (Tenant)',
    description: 'Tickets de suporte do tenant',
    icon: Headphones,
    category: 'support',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    permissions: [
      { id: 'support:view', name: 'Visualizar', description: 'Ver tickets de suporte', level: 'view' },
      { id: 'support:create', name: 'Criar', description: 'Abrir novos tickets', level: 'create' },
      { id: 'support:manage', name: 'Gerenciar', description: 'Responder e fechar tickets', level: 'manage' },
    ],
    routes: [
      { path: '/tenant/support', label: 'Suporte', icon: Headphones, isDefault: true },
    ],
    features: [
      { id: 'support_tickets', name: 'Tickets', description: 'Abrir e acompanhar tickets', icon: Headphones, enabled: true },
    ],
    notifications: {
      triggers: [
        {
          id: 'support:ticket_response',
          event: 'support.ticket.response',
          name: 'Resposta no Ticket',
          description: 'Nova resposta no seu ticket',
          template: 'Nova resposta no ticket #{ticketId}: "{responsePreview}"',
          channels: ['in_app', 'email'],
          roles: [],
          priority: 'medium',
          icon: MessageSquare,
          defaultEnabled: true,
        },
        {
          id: 'support:ticket_resolved',
          event: 'support.ticket.resolved',
          name: 'Ticket Resolvido',
          description: 'Seu ticket foi resolvido',
          template: 'Ticket #{ticketId} foi marcado como resolvido',
          channels: ['in_app', 'email'],
          roles: [],
          priority: 'low',
          icon: CheckCircle,
          defaultEnabled: true,
        },
      ],
    },
  },

  {
    id: 'support_admin',
    name: 'Suporte (Admin)',
    description: 'Gestão global de tickets de suporte',
    icon: Headphones,
    category: 'support',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    permissions: [
      { id: 'support:view_all', name: 'Ver Todos', description: 'Visualizar tickets de todos os tenants', level: 'view' },
      { id: 'support:assign', name: 'Atribuir', description: 'Atribuir tickets para agentes', level: 'manage' },
      { id: 'support:manage_slas', name: 'Gerenciar SLAs', description: 'Criar, editar e excluir níveis de SLA', level: 'admin' },
      { id: 'support:respond', name: 'Responder', description: 'Responder tickets como suporte', level: 'manage' },
      { id: 'support:escalate', name: 'Escalar', description: 'Escalar tickets para níveis superiores', level: 'manage' },
    ],
    routes: [
      { path: '/support', label: 'Central de Tickets', icon: Headphones, isDefault: true },
      { path: '/support/slas', label: 'SLAs', icon: Settings },
    ],
    features: [
      { id: 'support_dashboard', name: 'Dashboard', description: 'Visão geral de tickets', icon: LayoutDashboard, enabled: true },
      { id: 'support_sla', name: 'SLAs', description: 'Gerenciar níveis de serviço', icon: TrendingUp, enabled: true },
    ],
    notifications: {
      triggers: [
        {
          id: 'support:sla_breach',
          event: 'support.sla.breach',
          name: 'Violação de SLA',
          description: 'Ticket violou prazo de SLA',
          template: 'SLA violado no ticket #{ticketId}. Prioridade: {priority}',
          channels: ['in_app', 'email', 'push'],
          roles: ['admin'],
          priority: 'urgent',
          icon: AlertTriangle,
          defaultEnabled: true,
        },
        {
          id: 'support:ticket_escalated',
          event: 'support.ticket.escalated',
          name: 'Ticket Escalado',
          description: 'Ticket foi escalado',
          template: 'Ticket #{ticketId} escalado para {escalationLevel}',
          channels: ['in_app', 'email'],
          roles: ['admin'],
          priority: 'high',
          icon: TrendingUp,
          defaultEnabled: true,
        },
      ],
    },
    monitoring: {
      metrics: [
        {
          id: 'support_open_tickets',
          name: 'Tickets Abertos',
          description: 'Total de tickets em aberto',
          type: 'counter',
          aggregation: 'last',
          icon: Headphones,
        },
        {
          id: 'support_avg_resolution_time',
          name: 'Tempo Médio Resolução',
          description: 'Tempo médio para resolver tickets',
          type: 'duration',
          unit: 'hours',
          aggregation: 'avg',
          icon: Clock,
        },
        {
          id: 'support_sla_compliance',
          name: 'Conformidade SLA',
          description: 'Percentual de tickets dentro do SLA',
          type: 'percentage',
          unit: '%',
          aggregation: 'avg',
          icon: CheckCircle,
          thresholds: { warning: 90, critical: 80, direction: 'below' },
        },
      ],
      dashboardWidgets: [
        { id: 'support_overview', name: 'Visão Geral', type: 'number', metrics: ['support_open_tickets', 'support_sla_compliance'], size: 'medium', icon: Headphones },
      ],
    },
  },

  // ============ MÓDULOS DE COBRANÇA ============
  {
    id: 'billing_tenant',
    name: 'Cobrança (Tenant)',
    description: 'Assinatura e pagamentos do tenant',
    icon: CreditCard,
    category: 'billing',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    permissions: [
      { id: 'billing:view', name: 'Visualizar', description: 'Ver plano e módulos contratados', level: 'view' },
      { id: 'billing:manage_plan', name: 'Gerenciar Plano', description: 'Fazer upgrade/downgrade de plano', level: 'manage' },
      { id: 'billing:manage_modules', name: 'Gerenciar Módulos', description: 'Adicionar ou remover módulos extras', level: 'manage' },
      { id: 'billing:view_invoices', name: 'Ver Faturas', description: 'Ver histórico de faturas', level: 'view' },
      { id: 'billing:make_payment', name: 'Pagar', description: 'Efetuar pagamentos de faturas', level: 'manage' },
      { id: 'billing:manage_payment_methods', name: 'Métodos de Pagamento', description: 'Adicionar e remover formas de pagamento', level: 'manage' },
    ],
    routes: [
      { path: '/tenant/billing', label: 'Cobrança', icon: CreditCard, isDefault: true },
      { path: '/tenant/billing/plans', label: 'Planos', icon: Receipt },
      { path: '/tenant/billing/invoices', label: 'Faturas', icon: FileText },
    ],
    features: [
      { id: 'billing_plans', name: 'Planos', description: 'Gerenciar assinatura', icon: Receipt, enabled: true },
      { id: 'billing_invoices', name: 'Faturas', description: 'Histórico de pagamentos', icon: FileText, enabled: true },
    ],

    // 🔔 NOTIFICAÇÕES DO BILLING (TENANT)
    notifications: {
      triggers: [
        {
          id: 'billing:invoice_generated',
          event: 'billing.invoice.generated',
          name: 'Nova Fatura',
          description: 'Nova fatura gerada',
          template: 'Nova fatura #{invoiceNumber} gerada: R$ {amount}',
          channels: ['in_app', 'email'],
          roles: [],
          priority: 'medium',
          icon: Receipt,
          defaultEnabled: true,
        },
        {
          id: 'billing:payment_success',
          event: 'billing.payment.success',
          name: 'Pagamento Confirmado',
          description: 'Pagamento processado com sucesso',
          template: 'Pagamento de R$ {amount} confirmado para fatura #{invoiceNumber}',
          channels: ['in_app', 'email'],
          roles: [],
          priority: 'low',
          icon: CheckCircle,
          defaultEnabled: true,
        },
        {
          id: 'billing:payment_failed',
          event: 'billing.payment.failed',
          name: 'Pagamento Falhou',
          description: 'Falha no processamento do pagamento',
          template: 'Falha no pagamento de R$ {amount}. Motivo: {failureReason}',
          channels: ['in_app', 'email', 'push'],
          roles: [],
          priority: 'urgent',
          icon: AlertTriangle,
          defaultEnabled: true,
        },
        {
          id: 'billing:invoice_overdue',
          event: 'billing.invoice.overdue',
          name: 'Fatura em Atraso',
          description: 'Fatura passou do vencimento',
          template: 'Fatura #{invoiceNumber} está {daysOverdue} dias em atraso',
          channels: ['in_app', 'email', 'push'],
          roles: [],
          priority: 'urgent',
          icon: Clock,
          defaultEnabled: true,
        },
        {
          id: 'billing:plan_upgraded',
          event: 'billing.plan.upgraded',
          name: 'Plano Atualizado',
          description: 'Upgrade de plano realizado',
          template: 'Seu plano foi atualizado de {oldPlan} para {newPlan}',
          channels: ['in_app', 'email'],
          roles: [],
          priority: 'low',
          icon: TrendingUp,
          defaultEnabled: true,
        },
        {
          id: 'billing:subscription_expiring',
          event: 'billing.subscription.expiring',
          name: 'Assinatura Expirando',
          description: 'Assinatura próxima do vencimento',
          template: 'Sua assinatura expira em {daysUntilExpiry} dias',
          channels: ['in_app', 'email'],
          roles: [],
          priority: 'high',
          icon: Clock,
          defaultEnabled: true,
        },
        {
          id: 'billing:card_expiring',
          event: 'billing.card.expiring',
          name: 'Cartão Expirando',
          description: 'Cartão de crédito próximo do vencimento',
          template: 'Seu cartão terminando em {lastFourDigits} expira em {expiryDate}',
          channels: ['in_app', 'email'],
          roles: [],
          priority: 'high',
          icon: CreditCard,
          defaultEnabled: true,
        },
      ],
    },

    // 📊 MONITORAMENTO/KPIs DO BILLING (TENANT)
    monitoring: {
      metrics: [
        {
          id: 'billing_current_plan',
          name: 'Plano Atual',
          description: 'Plano de assinatura ativo',
          type: 'gauge',
          aggregation: 'last',
          icon: Receipt,
        },
        {
          id: 'billing_monthly_cost',
          name: 'Custo Mensal',
          description: 'Valor da mensalidade',
          type: 'currency',
          unit: 'R$',
          aggregation: 'last',
          icon: CreditCard,
        },
        {
          id: 'billing_pending_invoices',
          name: 'Faturas Pendentes',
          description: 'Faturas aguardando pagamento',
          type: 'counter',
          aggregation: 'last',
          icon: FileText,
          thresholds: { warning: 1, critical: 2, direction: 'above' },
        },
        {
          id: 'billing_total_modules',
          name: 'Módulos Contratados',
          description: 'Número de módulos add-on ativos',
          type: 'counter',
          aggregation: 'last',
          icon: Settings,
        },
      ],
      dashboardWidgets: [
        { id: 'billing_subscription', name: 'Assinatura', type: 'number', metrics: ['billing_current_plan', 'billing_monthly_cost'], size: 'medium', icon: CreditCard },
        { id: 'billing_invoices', name: 'Faturas', type: 'number', metrics: ['billing_pending_invoices'], size: 'small', icon: FileText },
      ],
    },

    // 📝 LOGS DO BILLING (TENANT)
    logging: {
      actions: [
        {
          id: 'billing:payment_attempt',
          action: 'Tentativa de Pagamento',
          description: 'Tentativa de processar pagamento',
          severity: 'info',
          category: 'payments',
          dataToCapture: ['invoiceId', 'amount', 'paymentMethod', 'status'],
          retentionDays: 730,
          searchable: true,
        },
        {
          id: 'billing:plan_change',
          action: 'Mudança de Plano',
          description: 'Alteração no plano de assinatura',
          severity: 'info',
          category: 'subscription',
          dataToCapture: ['oldPlan', 'newPlan', 'changedBy', 'effectiveDate'],
          retentionDays: 1825,
          searchable: true,
        },
        {
          id: 'billing:payment_method_add',
          action: 'Método de Pagamento Adicionado',
          description: 'Novo método de pagamento cadastrado',
          severity: 'info',
          category: 'payment-methods',
          dataToCapture: ['methodType', 'lastFourDigits', 'addedBy'],
          retentionDays: 365,
          searchable: true,
        },
      ],
      defaultRetentionDays: 730,
    },

    // 🔍 AUDITORIA DO BILLING (TENANT)
    audit: {
      actions: [
        {
          id: 'billing:payment_made',
          action: 'Pagamento Realizado',
          description: 'Transação de pagamento efetuada',
          captureData: ['invoiceId', 'amount', 'paymentMethod', 'transactionId', 'paidBy'],
          complianceTags: ['PCI'],
          retentionYears: 7,
          icon: CreditCard,
        },
        {
          id: 'billing:refund_issued',
          action: 'Reembolso Emitido',
          description: 'Reembolso processado',
          captureData: ['invoiceId', 'originalAmount', 'refundAmount', 'reason', 'approvedBy'],
          requiresReason: true,
          complianceTags: ['PCI'],
          retentionYears: 7,
          alertOnAction: true,
          icon: RefreshCw,
        },
        {
          id: 'billing:payment_method_delete',
          action: 'Remoção de Método de Pagamento',
          description: 'Método de pagamento removido',
          captureData: ['methodType', 'lastFourDigits', 'removedBy'],
          complianceTags: ['PCI'],
          retentionYears: 3,
          icon: XCircle,
        },
      ],
      defaultRetentionYears: 7,
    },
  },

  {
    id: 'finance_admin',
    name: 'Financeiro (Admin)',
    description: 'Gestão financeira global',
    icon: Wallet,
    category: 'billing',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    permissions: [
      { id: 'finance:view_dashboard', name: 'Painel', description: 'Visualizar KPIs e métricas financeiras', level: 'view' },
      { id: 'finance:view_all_subscriptions', name: 'Ver Assinaturas', description: 'Visualizar assinaturas de todos os tenants', level: 'view' },
      { id: 'finance:manage_plans', name: 'Gerenciar Planos', description: 'Criar, editar e excluir planos', level: 'admin' },
      { id: 'finance:manage_modules', name: 'Gerenciar Módulos', description: 'Criar, editar e excluir módulos do sistema', level: 'admin' },
      { id: 'finance:view_all_invoices', name: 'Ver Faturas', description: 'Visualizar faturas de todos os tenants', level: 'view' },
      { id: 'finance:create_invoice', name: 'Criar Fatura', description: 'Gerar faturas manualmente', level: 'create' },
      { id: 'finance:manage_coupons', name: 'Gerenciar Cupons', description: 'Criar, editar e excluir cupons', level: 'admin' },
      { id: 'finance:apply_discounts', name: 'Aplicar Descontos', description: 'Aplicar descontos manuais', level: 'manage' },
      { id: 'finance:block_tenant', name: 'Bloquear Tenant', description: 'Bloquear/desbloquear tenants', level: 'admin' },
      { id: 'finance:reports', name: 'Relatórios', description: 'Acessar relatórios financeiros', level: 'view' },
    ],
    routes: [
      { path: '/billing', label: 'Dashboard', icon: TrendingUp, isDefault: true },
      { path: '/billing/subscriptions', label: 'Assinaturas', icon: CreditCard },
      { path: '/billing/invoices', label: 'Faturas', icon: FileText },
      { path: '/billing/plans', label: 'Planos', icon: Receipt },
      { path: '/billing/modules', label: 'Módulos', icon: Settings },
      { path: '/billing/coupons', label: 'Cupons', icon: Tag },
    ],
    features: [
      { id: 'finance_dashboard', name: 'Dashboard', description: 'KPIs financeiros', icon: LayoutDashboard, enabled: true },
      { id: 'finance_reports', name: 'Relatórios', description: 'Relatórios detalhados', icon: BarChart3, enabled: true },
    ],

    // 🔔 NOTIFICAÇÕES DO FINANCE (ADMIN)
    notifications: {
      triggers: [
        {
          id: 'finance:large_payment',
          event: 'finance.payment.large',
          name: 'Pagamento Alto',
          description: 'Pagamento acima do valor configurado',
          template: 'Pagamento de R$ {amount} recebido de {tenantName}',
          channels: ['in_app', 'email'],
          roles: ['super_admin'],
          priority: 'medium',
          icon: CreditCard,
          defaultEnabled: true,
        },
        {
          id: 'finance:chargeback',
          event: 'finance.chargeback.received',
          name: 'Chargeback Recebido',
          description: 'Disputa de pagamento aberta',
          template: 'Chargeback de R$ {amount} aberto por {tenantName}. Prazo: {deadline}',
          channels: ['in_app', 'email', 'push'],
          roles: ['super_admin'],
          priority: 'urgent',
          icon: AlertTriangle,
          defaultEnabled: true,
        },
        {
          id: 'finance:mrr_change',
          event: 'finance.mrr.significant_change',
          name: 'Mudança Significativa no MRR',
          description: 'Variação grande na receita recorrente',
          template: 'MRR {changeDirection} {changePercentage}%: R$ {oldMrr} → R$ {newMrr}',
          channels: ['in_app', 'email'],
          roles: ['super_admin'],
          priority: 'high',
          icon: TrendingUp,
          defaultEnabled: true,
        },
        {
          id: 'finance:high_churn',
          event: 'finance.churn.high',
          name: 'Churn Elevado',
          description: 'Taxa de cancelamento acima do normal',
          template: 'Taxa de churn de {churnRate}% ({cancelledCount} cancelamentos este mês)',
          channels: ['in_app', 'email'],
          roles: ['super_admin'],
          priority: 'urgent',
          icon: AlertTriangle,
          defaultEnabled: true,
        },
        {
          id: 'finance:revenue_goal',
          event: 'finance.revenue.goal_reached',
          name: 'Meta de Receita',
          description: 'Meta de receita atingida',
          template: 'Meta de receita de R$ {goalAmount} atingida! 🎉',
          channels: ['in_app', 'email'],
          roles: ['super_admin'],
          priority: 'low',
          icon: CheckCircle,
          defaultEnabled: true,
        },
      ],
    },

    // 📊 MONITORAMENTO/KPIs DO FINANCE (ADMIN)
    monitoring: {
      metrics: [
        {
          id: 'finance_mrr',
          name: 'MRR',
          description: 'Monthly Recurring Revenue',
          type: 'currency',
          unit: 'R$',
          aggregation: 'last',
          icon: TrendingUp,
        },
        {
          id: 'finance_arr',
          name: 'ARR',
          description: 'Annual Recurring Revenue',
          type: 'currency',
          unit: 'R$',
          aggregation: 'last',
          icon: TrendingUp,
        },
        {
          id: 'finance_total_revenue',
          name: 'Receita Total',
          description: 'Receita total no período',
          type: 'currency',
          unit: 'R$',
          aggregation: 'sum',
          icon: Wallet,
        },
        {
          id: 'finance_active_subscriptions',
          name: 'Assinaturas Ativas',
          description: 'Número de assinaturas ativas',
          type: 'counter',
          aggregation: 'last',
          icon: CreditCard,
        },
        {
          id: 'finance_churn_rate',
          name: 'Taxa de Churn',
          description: 'Percentual de cancelamentos',
          type: 'percentage',
          unit: '%',
          aggregation: 'avg',
          icon: AlertTriangle,
          thresholds: { warning: 5, critical: 10, direction: 'above' },
        },
        {
          id: 'finance_avg_ticket',
          name: 'Ticket Médio',
          description: 'Valor médio por cliente',
          type: 'currency',
          unit: 'R$',
          aggregation: 'avg',
          icon: Receipt,
        },
        {
          id: 'finance_ltv',
          name: 'LTV',
          description: 'Lifetime Value médio',
          type: 'currency',
          unit: 'R$',
          aggregation: 'avg',
          icon: Users,
        },
        {
          id: 'finance_cac',
          name: 'CAC',
          description: 'Customer Acquisition Cost',
          type: 'currency',
          unit: 'R$',
          aggregation: 'avg',
          icon: Users,
        },
        {
          id: 'finance_overdue_amount',
          name: 'Valor em Atraso',
          description: 'Total de faturas vencidas',
          type: 'currency',
          unit: 'R$',
          aggregation: 'sum',
          icon: Clock,
          thresholds: { warning: 10000, critical: 50000, direction: 'above' },
        },
        {
          id: 'finance_payment_success_rate',
          name: 'Taxa de Sucesso',
          description: 'Percentual de pagamentos aprovados',
          type: 'percentage',
          unit: '%',
          aggregation: 'avg',
          icon: CheckCircle,
          thresholds: { warning: 95, critical: 90, direction: 'below' },
        },
      ],
      dashboardWidgets: [
        { id: 'finance_revenue', name: 'Receita', type: 'chart', metrics: ['finance_mrr', 'finance_total_revenue'], size: 'large', icon: TrendingUp },
        { id: 'finance_subscribers', name: 'Assinantes', type: 'number', metrics: ['finance_active_subscriptions', 'finance_churn_rate'], size: 'medium', icon: Users },
        { id: 'finance_health', name: 'Saúde Financeira', type: 'number', metrics: ['finance_ltv', 'finance_cac'], size: 'medium', icon: Activity },
        { id: 'finance_overdue', name: 'Inadimplência', type: 'gauge', metrics: ['finance_overdue_amount'], size: 'small', icon: AlertTriangle },
      ],
    },

    // 📝 LOGS DO FINANCE (ADMIN)
    logging: {
      actions: [
        {
          id: 'finance:plan_created',
          action: 'Plano Criado',
          description: 'Novo plano de assinatura criado',
          severity: 'info',
          category: 'plans',
          dataToCapture: ['planId', 'planName', 'price', 'createdBy'],
          retentionDays: 1825,
          searchable: true,
        },
        {
          id: 'finance:plan_updated',
          action: 'Plano Atualizado',
          description: 'Plano de assinatura modificado',
          severity: 'warning',
          category: 'plans',
          dataToCapture: ['planId', 'changes', 'updatedBy'],
          retentionDays: 1825,
          searchable: true,
        },
        {
          id: 'finance:coupon_created',
          action: 'Cupom Criado',
          description: 'Novo cupom de desconto criado',
          severity: 'info',
          category: 'coupons',
          dataToCapture: ['couponId', 'discount', 'validUntil', 'createdBy'],
          retentionDays: 730,
          searchable: true,
        },
        {
          id: 'finance:tenant_blocked',
          action: 'Tenant Bloqueado',
          description: 'Tenant bloqueado por inadimplência',
          severity: 'warning',
          category: 'tenants',
          dataToCapture: ['tenantId', 'tenantName', 'overdueAmount', 'blockedBy'],
          retentionDays: 1825,
          searchable: true,
        },
        {
          id: 'finance:manual_invoice',
          action: 'Fatura Manual',
          description: 'Fatura gerada manualmente',
          severity: 'info',
          category: 'invoices',
          dataToCapture: ['invoiceId', 'tenantId', 'amount', 'reason', 'createdBy'],
          retentionDays: 2555,
          searchable: true,
        },
        {
          id: 'finance:refund_processed',
          action: 'Reembolso Processado',
          description: 'Reembolso emitido para cliente',
          severity: 'warning',
          category: 'refunds',
          dataToCapture: ['invoiceId', 'originalAmount', 'refundAmount', 'reason', 'processedBy'],
          retentionDays: 2555,
          searchable: true,
        },
      ],
      defaultRetentionDays: 1825,
    },

    // 🎫 TICKETS AUTOMÁTICOS DO FINANCE
    ticketing: {
      autoCreate: [
        {
          id: 'finance:chargeback_ticket',
          trigger: 'finance.chargeback.received',
          name: 'Chargeback Recebido',
          description: 'Disputa de pagamento aberta pelo cliente',
          priority: 'urgent',
          category: 'financial',
          slaId: 'sla_urgent',
          tags: ['chargeback', 'financeiro', 'urgente'],
          autoAssign: true,
          escalationMinutes: 60,
        },
        {
          id: 'finance:large_overdue_ticket',
          trigger: 'finance.overdue.large',
          name: 'Inadimplência Alta',
          description: 'Tenant com valor alto em atraso',
          priority: 'high',
          category: 'collections',
          tags: ['inadimplencia', 'cobranca', 'financeiro'],
          escalationMinutes: 1440,
        },
        {
          id: 'finance:fraud_suspected_ticket',
          trigger: 'finance.fraud.suspected',
          name: 'Suspeita de Fraude',
          description: 'Padrão suspeito detectado em transações',
          priority: 'urgent',
          category: 'security',
          tags: ['fraude', 'seguranca', 'financeiro'],
          autoAssign: true,
          escalationMinutes: 30,
        },
      ],
    },

    // 🔍 AUDITORIA DO FINANCE (ADMIN)
    audit: {
      actions: [
        {
          id: 'finance:plan_price_change',
          action: 'Alteração de Preço de Plano',
          description: 'Mudança no preço de um plano',
          captureData: ['planId', 'oldPrice', 'newPrice', 'changedBy', 'effectiveDate'],
          requiresReason: true,
          complianceTags: ['SOC2'],
          retentionYears: 7,
          alertOnAction: true,
          icon: Receipt,
        },
        {
          id: 'finance:manual_discount',
          action: 'Desconto Manual Aplicado',
          description: 'Desconto aplicado manualmente a fatura',
          captureData: ['invoiceId', 'tenantId', 'originalAmount', 'discountAmount', 'reason', 'appliedBy'],
          requiresReason: true,
          complianceTags: ['SOC2'],
          retentionYears: 7,
          alertOnAction: true,
          icon: Tag,
        },
        {
          id: 'finance:refund_approval',
          action: 'Aprovação de Reembolso',
          description: 'Reembolso aprovado e processado',
          captureData: ['invoiceId', 'tenantId', 'refundAmount', 'reason', 'approvedBy'],
          requiresReason: true,
          complianceTags: ['PCI', 'SOC2'],
          retentionYears: 7,
          alertOnAction: true,
          icon: RefreshCw,
        },
        {
          id: 'finance:tenant_block',
          action: 'Bloqueio de Tenant',
          description: 'Tenant bloqueado por inadimplência',
          captureData: ['tenantId', 'overdueAmount', 'daysOverdue', 'blockedBy'],
          requiresReason: true,
          complianceTags: ['SOC2'],
          retentionYears: 5,
          alertOnAction: true,
          icon: Lock,
        },
        {
          id: 'finance:financial_report_export',
          action: 'Exportação de Relatório Financeiro',
          description: 'Relatório financeiro exportado',
          captureData: ['reportType', 'dateRange', 'exportedBy', 'format'],
          complianceTags: ['SOC2'],
          retentionYears: 3,
          icon: FileText,
        },
      ],
      defaultRetentionYears: 7,
    },
  },

  // ============ MÓDULOS AUXILIARES ============
  {
    id: 'reports',
    name: 'Relatórios',
    description: 'Relatórios e análises',
    icon: BarChart3,
    category: 'tenant',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    permissions: [
      { id: 'reports:view', name: 'Visualizar', description: 'Acessar relatórios', level: 'view' },
      { id: 'reports:create', name: 'Criar', description: 'Gerar novos relatórios', level: 'create' },
      { id: 'reports:export', name: 'Exportar', description: 'Baixar relatórios', level: 'view' },
    ],
    routes: [
      { path: '/relatorios', label: 'Relatórios', icon: BarChart3, isDefault: true },
    ],
    features: [
      { id: 'reports_custom', name: 'Personalizados', description: 'Criar relatórios customizados', icon: FileText, enabled: true },
      { id: 'reports_export', name: 'Exportação', description: 'Exportar em PDF/Excel', icon: Receipt, enabled: true },
    ],
    logging: {
      actions: [
        {
          id: 'reports:generate',
          action: 'Geração de Relatório',
          description: 'Relatório gerado',
          severity: 'info',
          category: 'reports',
          dataToCapture: ['reportType', 'filters', 'generatedBy', 'recordCount'],
          retentionDays: 90,
          searchable: true,
        },
        {
          id: 'reports:export',
          action: 'Exportação de Relatório',
          description: 'Relatório exportado',
          severity: 'info',
          category: 'reports',
          dataToCapture: ['reportType', 'format', 'exportedBy'],
          retentionDays: 90,
          searchable: true,
        },
      ],
      defaultRetentionDays: 90,
    },
  },

  {
    id: 'logs',
    name: 'Logs',
    description: 'Logs e auditoria do sistema',
    icon: FileText,
    category: 'tenant',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    permissions: [
      { id: 'logs:view', name: 'Visualizar', description: 'Ver logs do sistema', level: 'view' },
      { id: 'logs:delete', name: 'Remover', description: 'Excluir logs', level: 'delete' },
      { id: 'logs:export', name: 'Exportar', description: 'Baixar logs em CSV', level: 'view' },
    ],
    routes: [
      { path: '/logs', label: 'Logs', icon: FileText, isDefault: true },
    ],
    features: [
      { id: 'logs_search', name: 'Busca', description: 'Buscar nos logs', icon: Eye, enabled: true },
      { id: 'logs_export', name: 'Exportação', description: 'Exportar logs', icon: Receipt, enabled: true },
    ],
    audit: {
      actions: [
        {
          id: 'logs:bulk_delete',
          action: 'Exclusão em Massa de Logs',
          description: 'Múltiplos logs excluídos',
          captureData: ['dateRange', 'recordCount', 'deletedBy'],
          requiresReason: true,
          complianceTags: ['SOC2'],
          retentionYears: 5,
          alertOnAction: true,
          icon: AlertTriangle,
        },
      ],
      defaultRetentionYears: 5,
    },
  },

  {
    id: 'notifications',
    name: 'Notificações',
    description: 'Alertas e notificações do sistema',
    icon: Bell,
    category: 'tenant',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    permissions: [
      { id: 'notifications:view', name: 'Visualizar', description: 'Ver notificações do sistema', level: 'view' },
      { id: 'notifications:manage', name: 'Gerenciar', description: 'Configurar preferências de notificação', level: 'manage' },
      { id: 'notifications:mute', name: 'Silenciar', description: 'Silenciar tipos de notificação', level: 'manage' },
    ],
    routes: [
      { path: '/notificacoes', label: 'Notificações', icon: Bell, isDefault: true },
    ],
    features: [
      { id: 'notifications_push', name: 'Push', description: 'Notificações push', icon: Bell, enabled: true },
      { id: 'notifications_email', name: 'Email', description: 'Notificações por email', icon: MessageSquare, enabled: true },
    ],
  },

  {
    id: 'templates',
    name: 'Templates de Nicho',
    description: 'Templates e prompts de IA por nicho',
    icon: FileText,
    category: 'tenant',
    version: '1.0.0',
    enabled: true,
    isCore: false,
    permissions: [
      { id: 'templates:view', name: 'Visualizar', description: 'Ver templates de nicho', level: 'view' },
      { id: 'templates:create', name: 'Criar', description: 'Adicionar novos templates', level: 'create' },
      { id: 'templates:edit', name: 'Editar', description: 'Modificar templates existentes', level: 'edit' },
      { id: 'templates:delete', name: 'Remover', description: 'Excluir templates', level: 'delete' },
      { id: 'templates:assign', name: 'Atribuir', description: 'Vincular templates a tenants', level: 'manage' },
    ],
    routes: [
      { path: '/niche-templates', label: 'Templates', icon: FileText, isDefault: true },
    ],
    features: [
      { id: 'templates_library', name: 'Biblioteca', description: 'Biblioteca de templates', icon: FileText, enabled: true },
      { id: 'templates_custom', name: 'Personalizados', description: 'Templates customizados', icon: Settings, enabled: true },
    ],
  },

  {
    id: 'profile',
    name: 'Perfil',
    description: 'Perfil do usuário',
    icon: Users,
    category: 'tenant',
    version: '1.0.0',
    enabled: true,
    isCore: true,
    permissions: [
      { id: 'profile:view', name: 'Visualizar', description: 'Ver próprio perfil', level: 'view' },
      { id: 'profile:edit', name: 'Editar', description: 'Modificar dados do próprio perfil', level: 'edit' },
    ],
    routes: [
      { path: '/profile', label: 'Perfil', icon: Users, isDefault: true },
    ],
    features: [
      { id: 'profile_avatar', name: 'Avatar', description: 'Upload de foto', icon: Image, enabled: true },
      { id: 'profile_security', name: 'Segurança', description: 'Configurações de segurança', icon: Shield, enabled: true },
    ],
    audit: {
      actions: [
        {
          id: 'profile:password_change',
          action: 'Alteração de Senha',
          description: 'Senha do usuário alterada',
          captureData: ['userId', 'ipAddress', 'userAgent'],
          complianceTags: ['SOC2'],
          retentionYears: 3,
          alertOnAction: true,
          icon: Lock,
        },
        {
          id: 'profile:email_change',
          action: 'Alteração de Email',
          description: 'Email do usuário alterado',
          captureData: ['userId', 'oldEmail', 'newEmail', 'ipAddress'],
          complianceTags: ['LGPD'],
          retentionYears: 3,
          icon: MessageSquare,
        },
      ],
      defaultRetentionYears: 3,
    },
  },
];

// ============================================
// FUNÇÕES UTILITÁRIAS
// ============================================

// Retorna todos os módulos
export const getAllModules = (): ModuleConfig[] => MODULE_REGISTRY;

// Retorna módulo por ID
export const getModuleById = (id: string): ModuleConfig | undefined => 
  MODULE_REGISTRY.find(m => m.id === id);

// Retorna módulos ativos (enabled = true)
export const getActiveModules = (): ModuleConfig[] => 
  MODULE_REGISTRY.filter(m => m.enabled);

// Retorna módulos por categoria
export const getModulesByCategory = (category: ModuleConfig['category']): ModuleConfig[] => 
  MODULE_REGISTRY.filter(m => m.category === category);

// Retorna todas as permissões de um módulo
export const getModulePermissions = (moduleId: string): ModulePermission[] => {
  const module = getModuleById(moduleId);
  return module?.permissions || [];
};

// Retorna todas as features de um módulo
export const getModuleFeatures = (moduleId: string): ModuleFeature[] => {
  const module = getModuleById(moduleId);
  return module?.features || [];
};

// Retorna todas as rotas de um módulo
export const getModuleRoutes = (moduleId: string): ModuleRoute[] => {
  const module = getModuleById(moduleId);
  return module?.routes || [];
};

// Verifica dependências de um módulo
export const getModuleDependencies = (moduleId: string): string[] => {
  const module = getModuleById(moduleId);
  return module?.dependencies || [];
};

// Verifica se todas as dependências de um módulo estão ativas
export const checkModuleDependencies = (moduleId: string, enabledModules: string[]): boolean => {
  const deps = getModuleDependencies(moduleId);
  return deps.every(dep => enabledModules.includes(dep));
};

// Retorna categorias disponíveis
export const getModuleCategories = (): { id: ModuleConfig['category']; label: string }[] => [
  { id: 'system', label: 'Sistema' },
  { id: 'tenant', label: 'Tenant' },
  { id: 'social', label: 'Redes Sociais' },
  { id: 'billing', label: 'Cobrança' },
  { id: 'support', label: 'Suporte' },
];

// Flatten todas as permissões de todos os módulos
export const getAllPermissions = (): (ModulePermission & { moduleId: string })[] => {
  return MODULE_REGISTRY.flatMap(module => 
    module.permissions.map(perm => ({
      ...perm,
      moduleId: module.id,
    }))
  );
};

// Retorna IDs de todas as permissões
export const getAllPermissionIds = (): string[] => 
  getAllPermissions().map(p => p.id);

// ============================================
// 🆕 FUNÇÕES PARA CAMPOS OPERACIONAIS
// ============================================

// Retorna todas as notificações de um módulo
export const getModuleNotifications = (moduleId: string): ModuleNotificationTrigger[] => {
  const module = getModuleById(moduleId);
  return module?.notifications?.triggers || [];
};

// Retorna todas as notificações de todos os módulos
export const getAllNotificationTriggers = (): (ModuleNotificationTrigger & { moduleId: string })[] => {
  return MODULE_REGISTRY.flatMap(module => 
    (module.notifications?.triggers || []).map(trigger => ({
      ...trigger,
      moduleId: module.id,
    }))
  );
};

// Retorna métricas de um módulo
export const getModuleMetrics = (moduleId: string): ModuleMetric[] => {
  const module = getModuleById(moduleId);
  return module?.monitoring?.metrics || [];
};

// Retorna todas as métricas de todos os módulos
export const getAllMetrics = (): (ModuleMetric & { moduleId: string })[] => {
  return MODULE_REGISTRY.flatMap(module => 
    (module.monitoring?.metrics || []).map(metric => ({
      ...metric,
      moduleId: module.id,
    }))
  );
};

// Retorna widgets de dashboard de um módulo
export const getModuleDashboardWidgets = (moduleId: string): ModuleDashboardWidget[] => {
  const module = getModuleById(moduleId);
  return module?.monitoring?.dashboardWidgets || [];
};

// Retorna ações de log de um módulo
export const getModuleLogActions = (moduleId: string): ModuleLogAction[] => {
  const module = getModuleById(moduleId);
  return module?.logging?.actions || [];
};

// Retorna todas as ações de log de todos os módulos
export const getAllLogActions = (): (ModuleLogAction & { moduleId: string })[] => {
  return MODULE_REGISTRY.flatMap(module => 
    (module.logging?.actions || []).map(action => ({
      ...action,
      moduleId: module.id,
    }))
  );
};

// Retorna triggers de ticket de um módulo
export const getModuleTicketTriggers = (moduleId: string): ModuleTicketTrigger[] => {
  const module = getModuleById(moduleId);
  return module?.ticketing?.autoCreate || [];
};

// Retorna todos os triggers de ticket
export const getAllTicketTriggers = (): (ModuleTicketTrigger & { moduleId: string })[] => {
  return MODULE_REGISTRY.flatMap(module => 
    (module.ticketing?.autoCreate || []).map(trigger => ({
      ...trigger,
      moduleId: module.id,
    }))
  );
};

// Retorna ações de auditoria de um módulo
export const getModuleAuditActions = (moduleId: string): ModuleAuditAction[] => {
  const module = getModuleById(moduleId);
  return module?.audit?.actions || [];
};

// Retorna todas as ações de auditoria
export const getAllAuditActions = (): (ModuleAuditAction & { moduleId: string })[] => {
  return MODULE_REGISTRY.flatMap(module => 
    (module.audit?.actions || []).map(action => ({
      ...action,
      moduleId: module.id,
    }))
  );
};

// Retorna ações de auditoria com tags de compliance específicas
export const getAuditActionsByCompliance = (tag: 'LGPD' | 'SOC2' | 'HIPAA' | 'GDPR' | 'PCI'): (ModuleAuditAction & { moduleId: string })[] => {
  return getAllAuditActions().filter(action => 
    action.complianceTags?.includes(tag)
  );
};

// Retorna métricas com thresholds violados (para alertas)
export const getMetricsWithThresholds = (): (ModuleMetric & { moduleId: string })[] => {
  return getAllMetrics().filter(metric => metric.thresholds);
};

// Retorna notificações por prioridade
export const getNotificationsByPriority = (priority: 'low' | 'medium' | 'high' | 'urgent'): (ModuleNotificationTrigger & { moduleId: string })[] => {
  return getAllNotificationTriggers().filter(trigger => trigger.priority === priority);
};

// Retorna resumo operacional de um módulo
export const getModuleOperationalSummary = (moduleId: string) => {
  const module = getModuleById(moduleId);
  if (!module) return null;
  
  return {
    id: module.id,
    name: module.name,
    hasNotifications: (module.notifications?.triggers?.length || 0) > 0,
    notificationCount: module.notifications?.triggers?.length || 0,
    hasMonitoring: (module.monitoring?.metrics?.length || 0) > 0,
    metricCount: module.monitoring?.metrics?.length || 0,
    widgetCount: module.monitoring?.dashboardWidgets?.length || 0,
    hasLogging: (module.logging?.actions?.length || 0) > 0,
    logActionCount: module.logging?.actions?.length || 0,
    hasTicketing: (module.ticketing?.autoCreate?.length || 0) > 0,
    ticketTriggerCount: module.ticketing?.autoCreate?.length || 0,
    hasAudit: (module.audit?.actions?.length || 0) > 0,
    auditActionCount: module.audit?.actions?.length || 0,
  };
};

// Retorna todos os resumos operacionais
export const getAllOperationalSummaries = () => {
  return MODULE_REGISTRY.map(module => getModuleOperationalSummary(module.id));
};
