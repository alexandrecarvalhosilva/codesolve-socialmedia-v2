import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
}

// Route to label mapping
const routeLabels: Record<string, string> = {
  '': 'Dashboard',
  'tenants': 'Tenants',
  'billing': 'Faturamento',
  'support': 'Suporte',
  'usuarios': 'Usuários',
  'roles': 'Permissões',
  'logs': 'Logs',
  'relatorios': 'Relatórios',
  'configuracoes': 'Configurações',
  'notificacoes': 'Notificações',
  'profile': 'Perfil',
  'upgrade': 'Upgrade',
  // Tenant routes
  'tenant': 'Minha Conta',
  'dashboard': 'Dashboard',
  'chat': 'Chat',
  'calendar': 'Calendário',
  'automations': 'Automações',
  'config': 'Configurações',
  'invoices': 'Faturas',
  'modules': 'Módulos',
  'payment': 'Pagamento',
  'plans': 'Planos',
  // Billing sub-routes
  'all-invoices': 'Todas Faturas',
  'all-subscriptions': 'Assinaturas',
  'manage-coupons': 'Cupons',
  'manage-modules': 'Módulos',
  'manage-plans': 'Planos',
  // Support sub-routes
  'manage-slas': 'SLAs',
};

export function Breadcrumbs({ items, className, showHome = true }: BreadcrumbsProps) {
  const location = useLocation();

  // Generate breadcrumbs from current path if items not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Skip numeric IDs in the breadcrumb display
      if (/^\d+$/.test(segment)) {
        breadcrumbs.push({
          label: 'Detalhes',
          href: index === pathSegments.length - 1 ? undefined : currentPath,
        });
      } else {
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        breadcrumbs.push({
          label,
          href: index === pathSegments.length - 1 ? undefined : currentPath,
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  // Don't render if only home would be shown
  if (breadcrumbItems.length === 0 && !showHome) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn('flex items-center text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center gap-1">
        {showHome && (
          <li className="flex items-center">
            <Link 
              to={location.pathname.startsWith('/tenant') ? '/tenant/dashboard' : '/'}
              className="flex items-center hover:text-foreground transition-colors"
            >
              <Home className="h-4 w-4" />
            </Link>
            {breadcrumbItems.length > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 text-border" />
            )}
          </li>
        )}
        
        {breadcrumbItems.map((item, index) => (
          <li key={index} className="flex items-center">
            {item.href ? (
              <Link 
                to={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium">{item.label}</span>
            )}
            
            {index < breadcrumbItems.length - 1 && (
              <ChevronRight className="h-4 w-4 mx-1 text-border" />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
