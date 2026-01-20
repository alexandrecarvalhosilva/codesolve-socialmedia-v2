import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  ChevronLeft,
  LogOut,
  FileText,
  Shield,
  DollarSign,
  CreditCard,
  Package,
  Tag,
  TrendingUp,
  ChevronDown,
  Headphones,
  Clock,
  Bell,
  Boxes,
  Brain,
  Sparkles,
  ShieldCheck,
  Instagram
} from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { useModules } from '@/contexts/ModulesContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import logoIcon from '@/assets/codesolve-icon.png';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { useAuth, roleConfig } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
  children?: NavItem[];
  moduleId?: string; // ID do módulo para verificar se está ativo
}

const getNavItems = (unreadCount: number): NavItem[] => [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Building2, label: 'Tenants', path: '/tenants', badge: 12, moduleId: 'tenants' },
  { 
    icon: Brain, 
    label: 'IA Humanizada', 
    path: '/ai-overview',
    moduleId: 'ai',
    children: [
      { icon: BarChart3, label: 'Visão Geral', path: '/ai-overview' },
      { icon: Boxes, label: 'Templates de Nicho', path: '/niche-templates', moduleId: 'templates' },
    ]
  },
  { icon: Users, label: 'Usuários', path: '/usuarios', moduleId: 'users' },
  { icon: Shield, label: 'Roles', path: '/roles', moduleId: 'roles' },
  { 
    icon: DollarSign, 
    label: 'Financeiro', 
    path: '/billing',
    moduleId: 'finance_admin',
    children: [
      { icon: TrendingUp, label: 'Dashboard', path: '/billing' },
      { icon: CreditCard, label: 'Assinaturas', path: '/billing/subscriptions' },
      { icon: FileText, label: 'Faturas', path: '/billing/invoices' },
      { icon: Clock, label: 'Histórico', path: '/billing/history' },
      { icon: Package, label: 'Planos', path: '/billing/plans' },
      { icon: Package, label: 'Módulos', path: '/billing/modules' },
      { icon: Tag, label: 'Cupons', path: '/billing/coupons' },
    ]
  },
  { 
    icon: Headphones, 
    label: 'Suporte', 
    path: '/support',
    moduleId: 'support_admin',
    children: [
      { icon: Headphones, label: 'Central de Tickets', path: '/support' },
      { icon: Clock, label: 'Gerenciar SLAs', path: '/support/slas' },
    ]
  },
  { icon: Bell, label: 'Notificações', path: '/notificacoes', badge: unreadCount > 0 ? unreadCount : undefined, moduleId: 'notifications' },
  { icon: FileText, label: 'Logs', path: '/logs', moduleId: 'logs' },
  { icon: ShieldCheck, label: 'Auditoria', path: '/audit' },
  { icon: BarChart3, label: 'Relatórios', path: '/relatorios', moduleId: 'reports' },
  { icon: Sparkles, label: 'Config. Operacional', path: '/module-operations' },
  { icon: Settings, label: 'Configurações', path: '/configuracoes' },
];

// Função para filtrar itens baseado nos módulos ativos
const filterNavItems = (items: NavItem[], isModuleEnabled: (id: string) => boolean): NavItem[] => {
  return items
    .filter(item => !item.moduleId || isModuleEnabled(item.moduleId))
    .map(item => ({
      ...item,
      children: item.children ? filterNavItems(item.children, isModuleEnabled) : undefined
    }))
    .filter(item => !item.children || item.children.length > 0);
};

const AVATAR_STORAGE_KEY = 'user-avatar';

export function Sidebar() {
  const { collapsed, toggle } = useSidebarContext();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { isModuleEnabled } = useModules();
  const navigate = useNavigate();
  
  // Filtrar itens de navegação baseado nos módulos ativos
  const allNavItems = getNavItems(unreadCount);
  const navItems = filterNavItems(allNavItems, isModuleEnabled);
  
  // Get avatar from localStorage
  const avatarFromStorage = localStorage.getItem(AVATAR_STORAGE_KEY);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitials = user?.name?.substring(0, 2).toUpperCase() || 'U';
  const roleLabel = user?.role ? roleConfig[user.role].label : 'Usuário';

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-screen bg-cs-bg-sidebar border-r border-border flex flex-col transition-all duration-300 z-50",
        collapsed ? 'w-20' : 'w-sidebar'
      )}
    >
      {/* Logo Section */}
      <div className="flex flex-col items-center py-10 px-4 border-b border-border">
        <Link to="/" className="relative group">
          <div className="absolute inset-[-12px] bg-primary/30 rounded-full blur-3xl group-hover:bg-primary/50 transition-all duration-500 animate-pulse" />
          <img 
            src={logoIcon} 
            alt="CodeSolve" 
            className={cn(
              "relative z-10 transition-all duration-300 drop-shadow-[0_0_35px_rgba(0,212,255,0.6)]",
              collapsed ? 'w-14 h-14' : 'w-48 h-48'
            )}
          />
        </Link>
        
        {!collapsed && (
          <Link to="/" className="mt-6 text-center animate-fade-in">
            <h1 className="text-2xl font-bold tracking-wide">
              <span className="text-foreground">Code</span>
              <span className="text-primary">Solve</span>
            </h1>
            <p className="text-primary text-base font-medium">Social Media</p>
          </Link>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={toggle}
        className="absolute -right-3 top-28 bg-card border border-border rounded-full p-1.5 hover:bg-muted hover:border-primary/50 transition-all duration-200"
      >
        <ChevronLeft className={cn("w-4 h-4 text-muted-foreground transition-transform", collapsed && 'rotate-180')} />
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavButton key={item.label} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-border">
        <div className={cn("p-3 rounded-xl bg-card/50 flex items-center gap-3", collapsed && 'justify-center')}>
          <Link to="/profile" className="relative group">
            {avatarFromStorage ? (
              <img 
                src={avatarFromStorage} 
                alt={user?.name || 'Avatar'} 
                className="w-10 h-10 rounded-full object-cover group-hover:ring-2 group-hover:ring-primary/50 transition-all"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground group-hover:ring-2 group-hover:ring-primary/50 transition-all">
                {userInitials}
              </div>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-sidebar-background" />
          </Link>
          
          {!collapsed && (
            <>
              <Link to="/profile" className="flex-1 min-w-0 hover:opacity-80 transition-opacity">
                <p className="text-sm font-semibold text-foreground truncate">{user?.name || 'Usuário'}</p>
                <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-muted rounded-lg transition-colors group"
                title="Sair do sistema"
              >
                <LogOut className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}

function NavButton({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const Icon = item.icon;
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  const isActive = location.pathname === item.path || 
    (item.path !== '/' && location.pathname.startsWith(item.path));
  
  const hasChildren = item.children && item.children.length > 0;
  
  // Auto-expand if child is active
  const isChildActive = hasChildren && item.children?.some(
    child => location.pathname === child.path || location.pathname.startsWith(child.path)
  );
  
  const showChildren = (isOpen || isChildActive) && !collapsed;
  
  if (hasChildren) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
            isActive || isChildActive
              ? 'bg-gradient-to-r from-card to-muted text-primary' 
              : 'text-muted-foreground hover:bg-card hover:text-foreground',
            collapsed && 'justify-center'
          )}
        >
          {(isActive || isChildActive) && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-r-full" />
          )}
          
          <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", (isActive || isChildActive) ? 'text-primary' : 'group-hover:text-primary')} />
          
          {!collapsed && (
            <>
              <span className="text-[15px] font-medium flex-1 text-left">{item.label}</span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", showChildren && 'rotate-180')} />
            </>
          )}
        </button>
        
        {showChildren && (
          <div className="ml-4 pl-4 border-l border-border space-y-1">
            {item.children?.map((child) => (
              <NavButton key={child.path} item={child} collapsed={collapsed} />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <Link
      to={item.path}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
        isActive 
          ? 'bg-gradient-to-r from-card to-muted text-primary' 
          : 'text-muted-foreground hover:bg-card hover:text-foreground',
        collapsed && 'justify-center'
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-primary to-accent rounded-r-full" />
      )}
      
      <Icon className={cn("w-5 h-5 flex-shrink-0 transition-colors", isActive ? 'text-primary' : 'group-hover:text-primary')} />
      
      {!collapsed && (
        <>
          <span className="text-[15px] font-medium flex-1 text-left">{item.label}</span>
          {item.badge && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-primary/15 text-primary border border-primary/20">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
