import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  MessageCircle, 
  Calendar, 
  Bot,
  Sparkles,
  History,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LogOut,
  Building2,
  CreditCard,
  FileText,
  Package,
  Headphones,
  Bell,
  Instagram,
  Share2,
  Brain,
  Zap
} from 'lucide-react';
import { SidebarProvider, useSidebarContext } from '@/contexts/SidebarContext';
import { useAuth, roleConfig, UserRole } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useTenantModules } from '@/contexts/TenantModulesContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import codeSolveIcon from '@/assets/codesolve-icon.png';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';

interface TenantLayoutProps {
  children: ReactNode;
}

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  allowedRoles: UserRole[];
  children?: NavItem[];
  badge?: number;
  moduleId?: string; // ID do módulo para verificar se está ativo
}

const tenantNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/tenant/dashboard', allowedRoles: ['admin', 'operador'] },
  { 
    icon: Share2, 
    label: 'Redes Sociais', 
    path: '/tenant/instagram',
    allowedRoles: ['admin', 'operador'],
    moduleId: 'instagram', // Só mostra se módulo instagram está ativo
    children: [
      { icon: Instagram, label: 'Instagram', path: '/tenant/instagram', allowedRoles: ['admin', 'operador'], moduleId: 'instagram' },
    ]
  },
  { 
    icon: Sparkles, 
    label: 'IA Humanizada', 
    path: '/tenant/ai/config',
    allowedRoles: ['admin'],
    moduleId: 'ai-config',
    children: [
      { icon: Zap, label: 'Configurações', path: '/tenant/ai/config', allowedRoles: ['admin'], moduleId: 'ai-config' },
      { icon: Brain, label: 'Dashboard Consumo', path: '/tenant/ai/dashboard', allowedRoles: ['admin'], moduleId: 'ai-consumption' },
    ]
  },
  { icon: Settings, label: 'Configurações Gerais', path: '/tenant/config', allowedRoles: ['admin'] },
  { icon: MessageCircle, label: 'Chat', path: '/tenant/chat', allowedRoles: ['admin', 'operador', 'visualizador'], moduleId: 'chat' },
  { icon: Calendar, label: 'Calendário', path: '/tenant/calendar', allowedRoles: ['admin', 'operador'], moduleId: 'calendar' },
  { icon: Bot, label: 'Automações', path: '/tenant/automations', allowedRoles: ['admin'], moduleId: 'automations' },
  { icon: Headphones, label: 'Suporte', path: '/tenant/support', allowedRoles: ['admin', 'operador'] },
  { icon: Bell, label: 'Notificações', path: '/notificacoes', allowedRoles: ['admin', 'operador'] },
  { 
    icon: CreditCard, 
    label: 'Cobrança', 
    path: '/tenant/billing',
    allowedRoles: ['admin'],
    children: [
      { icon: CreditCard, label: 'Minha Assinatura', path: '/tenant/billing', allowedRoles: ['admin'] },
      { icon: Package, label: 'Planos', path: '/tenant/billing/plans', allowedRoles: ['admin'] },
      { icon: Package, label: 'Módulos', path: '/tenant/billing/modules', allowedRoles: ['admin'] },
      { icon: FileText, label: 'Faturas', path: '/tenant/billing/invoices', allowedRoles: ['admin'] },
      { icon: History, label: 'Histórico', path: '/tenant/billing/history', allowedRoles: ['admin'] },
    ]
  },
];

// Função para filtrar itens baseado nos módulos ativos
const filterNavItemsByModules = (
  items: NavItem[], 
  userRole: UserRole | undefined, 
  isModuleEnabled: (id: string) => boolean
): NavItem[] => {
  return items
    .filter(item => {
      // Verifica role
      if (!userRole || !item.allowedRoles.includes(userRole)) return false;
      // Verifica módulo (se definido)
      if (item.moduleId && !isModuleEnabled(item.moduleId)) return false;
      return true;
    })
    .map(item => ({
      ...item,
      children: item.children 
        ? filterNavItemsByModules(item.children, userRole, isModuleEnabled)
        : undefined
    }))
    .filter(item => !item.children || item.children.length > 0);
};

// NavGroup component for expandable menu items
function NavGroup({ 
  item, 
  collapsed, 
  location, 
  userRole 
}: { 
  item: NavItem; 
  collapsed: boolean; 
  location: ReturnType<typeof useLocation>;
  userRole?: UserRole;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;
  
  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path);
  const isChildActive = item.children?.some(
    child => location.pathname === child.path
  );
  
  const showChildren = (isOpen || isChildActive) && !collapsed;
  
  // Filter children by role
  const filteredChildren = item.children?.filter(
    child => userRole && child.allowedRoles.includes(userRole)
  ) || [];

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            to={item.path}
            className={cn(
              "flex items-center justify-center h-12 w-full rounded-lg transition-colors",
              isActive || isChildActive
                ? 'bg-primary text-primary-foreground'
                : 'text-cs-text-secondary hover:bg-cs-bg-card hover:text-cs-text-primary'
            )}
          >
            <Icon className="h-5 w-5" />
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-cs-bg-card border-border">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-4 h-12 rounded-lg transition-colors",
          isActive || isChildActive
            ? 'bg-primary/20 text-primary'
            : 'text-cs-text-secondary hover:bg-cs-bg-card hover:text-cs-text-primary'
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="font-medium flex-1 text-left">{item.label}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", showChildren && 'rotate-180')} />
      </button>
      
      {showChildren && (
        <div className="ml-4 pl-4 border-l border-border space-y-1">
          {filteredChildren.map((child) => {
            const ChildIcon = child.icon;
            const childIsActive = location.pathname === child.path;
            
            return (
              <Link
                key={child.path}
                to={child.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm",
                  childIsActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-cs-text-secondary hover:bg-cs-bg-card hover:text-cs-text-primary'
                )}
              >
                <ChildIcon className="h-4 w-4" />
                <span>{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

const AVATAR_STORAGE_KEY = 'user-avatar';

function TenantSidebar() {
  const { collapsed, toggle } = useSidebarContext();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { isModuleEnabled, setTenantContext } = useTenantModules();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Inicializar contexto do tenant (simula tenant ID 1 com plano professional)
  useEffect(() => {
    setTenantContext('1', 'professional');
  }, [setTenantContext]);
  
  // Get avatar from localStorage
  const avatarFromStorage = localStorage.getItem(AVATAR_STORAGE_KEY);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user?.name?.substring(0, 2).toUpperCase() || 'U';
  const roleLabel = user?.role ? roleConfig[user.role].label : 'Usuário';
  
  // Filtrar itens de navegação baseado no role do usuário E módulos ativos
  const filteredNavItems = filterNavItemsByModules(tenantNavItems, user?.role, isModuleEnabled)
    .map(item => {
      // Adicionar badge de notificações não lidas
      if (item.path === '/notificacoes' && unreadCount > 0) {
        return { ...item, badge: unreadCount };
      }
      return item;
    });

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-sidebar-background border-r border-border transition-all duration-300 z-50 flex flex-col",
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Logo Section */}
      <div className="flex flex-col items-center py-10 px-4 border-b border-border">
        <Link to="/tenant/dashboard" className="relative group">
          <div className="absolute inset-[-12px] bg-primary/30 rounded-full blur-3xl group-hover:bg-primary/50 transition-all duration-500 animate-pulse" />
          <img 
            src={codeSolveIcon} 
            alt="CodeSolve" 
            className={cn(
              "relative z-10 transition-all duration-300 drop-shadow-[0_0_35px_rgba(0,212,255,0.6)]",
              collapsed ? 'w-14 h-14' : 'w-32 h-32'
            )}
          />
        </Link>
        
        {!collapsed && (
          <Link to="/tenant/dashboard" className="mt-6 text-center animate-fade-in">
            <h1 className="text-2xl font-bold tracking-wide">
              <span className="text-foreground">Code</span>
              <span className="text-primary">Solve</span>
            </h1>
            <p className="text-primary text-base font-medium">Social Media</p>
          </Link>
        )}
      </div>

      {/* Tenant Info */}
      {!collapsed && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-cs-text-primary truncate">SIX BLADES</p>
              <p className="text-xs text-cs-text-secondary">LAGO OESTE</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full border border-border bg-cs-bg-sidebar hover:bg-cs-bg-card"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-cs-text-secondary" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-cs-text-secondary" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/tenant/dashboard' && location.pathname.startsWith(item.path));
          const Icon = item.icon;
          const hasChildren = item.children && item.children.length > 0;

          if (hasChildren) {
            return (
              <NavGroup 
                key={item.path} 
                item={item} 
                collapsed={collapsed} 
                location={location}
                userRole={user?.role}
              />
            );
          }

          if (collapsed) {
            return (
              <Tooltip key={item.path} delayDuration={0}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center justify-center h-12 w-full rounded-lg transition-colors",
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-cs-text-secondary hover:bg-cs-bg-card hover:text-cs-text-primary'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-cs-bg-card border-border">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 h-12 rounded-lg transition-colors",
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-cs-text-secondary hover:bg-cs-bg-card hover:text-cs-text-primary'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium flex-1">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-primary/20 text-primary">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-border">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="w-full h-12 text-muted-foreground hover:text-destructive hover:bg-card"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-card border-border">
              Sair
            </TooltipContent>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-3">
            <Link to="/profile" className="relative group">
              {avatarFromStorage ? (
                <img 
                  src={avatarFromStorage} 
                  alt={user?.name || 'Avatar'} 
                  className="w-10 h-10 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary/50 transition-all"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-semibold group-hover:ring-2 group-hover:ring-primary/50 transition-all">
                  {userInitials}
                </div>
              )}
            </Link>
            <Link to="/profile" className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
              <p className="text-sm font-medium text-foreground truncate">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-card"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}

function TenantContent({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebarContext();
  
  return (
    <div className="min-h-screen bg-cs-bg-primary">
      <TenantSidebar />
      <main className={cn("transition-all duration-300", collapsed ? 'ml-20' : 'ml-64')}>
        {children}
      </main>
    </div>
  );
}

export function TenantLayout({ children }: TenantLayoutProps) {
  return (
    <SidebarProvider>
      <TenantContent>{children}</TenantContent>
    </SidebarProvider>
  );
}
