import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Users, 
  LayoutDashboard, 
  Settings, 
  CreditCard, 
  TicketCheck,
  Calendar,
  MessageSquare,
  User,
  FileText,
  Command
} from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useAuth } from '@/contexts/AuthContext';
import { sharedTenants } from '@/components/dashboard/Header';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
}

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  // Handle keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const navigateTo = useCallback((path: string) => {
    navigate(path);
    setOpen(false);
  }, [navigate]);

  // Navigation items
  const navigationItems: SearchResult[] = isSuperAdmin ? [
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      subtitle: 'Visão geral do sistema',
      icon: <LayoutDashboard className="h-4 w-4" />,
      action: () => navigateTo('/'),
      category: 'Navegação',
    },
    {
      id: 'nav-tenants',
      title: 'Tenants',
      subtitle: 'Gerenciar clientes',
      icon: <Users className="h-4 w-4" />,
      action: () => navigateTo('/tenants'),
      category: 'Navegação',
    },
    {
      id: 'nav-billing',
      title: 'Faturamento',
      subtitle: 'Dashboard financeiro',
      icon: <CreditCard className="h-4 w-4" />,
      action: () => navigateTo('/billing'),
      category: 'Navegação',
    },
    {
      id: 'nav-support',
      title: 'Suporte',
      subtitle: 'Central de tickets',
      icon: <TicketCheck className="h-4 w-4" />,
      action: () => navigateTo('/support'),
      category: 'Navegação',
    },
    {
      id: 'nav-users',
      title: 'Usuários',
      subtitle: 'Gerenciar usuários',
      icon: <User className="h-4 w-4" />,
      action: () => navigateTo('/usuarios'),
      category: 'Navegação',
    },
    {
      id: 'nav-settings',
      title: 'Configurações',
      subtitle: 'Configurações do sistema',
      icon: <Settings className="h-4 w-4" />,
      action: () => navigateTo('/configuracoes'),
      category: 'Navegação',
    },
  ] : [
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      subtitle: 'Visão geral',
      icon: <LayoutDashboard className="h-4 w-4" />,
      action: () => navigateTo('/tenant/dashboard'),
      category: 'Navegação',
    },
    {
      id: 'nav-chat',
      title: 'Chat',
      subtitle: 'Conversas',
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => navigateTo('/tenant/chat'),
      category: 'Navegação',
    },
    {
      id: 'nav-calendar',
      title: 'Calendário',
      subtitle: 'Agendamentos',
      icon: <Calendar className="h-4 w-4" />,
      action: () => navigateTo('/tenant/calendar'),
      category: 'Navegação',
    },
    {
      id: 'nav-billing',
      title: 'Minha Assinatura',
      subtitle: 'Planos e faturas',
      icon: <CreditCard className="h-4 w-4" />,
      action: () => navigateTo('/tenant/billing'),
      category: 'Navegação',
    },
    {
      id: 'nav-support',
      title: 'Suporte',
      subtitle: 'Meus tickets',
      icon: <TicketCheck className="h-4 w-4" />,
      action: () => navigateTo('/tenant/support'),
      category: 'Navegação',
    },
    {
      id: 'nav-config',
      title: 'Configurações',
      subtitle: 'Configurar minha conta',
      icon: <Settings className="h-4 w-4" />,
      action: () => navigateTo('/tenant/config'),
      category: 'Navegação',
    },
  ];

  // Tenant items (only for SuperAdmin)
  const tenantItems: SearchResult[] = isSuperAdmin ? sharedTenants.slice(0, 5).map(tenant => ({
    id: `tenant-${tenant.id}`,
    title: tenant.name,
    subtitle: tenant.slug,
    icon: <Users className="h-4 w-4" />,
    action: () => navigateTo(`/tenants/${tenant.id}`),
    category: 'Tenants',
  })) : [];

  // Quick actions
  const quickActions: SearchResult[] = [
    {
      id: 'action-profile',
      title: 'Meu Perfil',
      subtitle: 'Editar dados pessoais',
      icon: <User className="h-4 w-4" />,
      action: () => navigateTo('/profile'),
      category: 'Ações Rápidas',
    },
    {
      id: 'action-docs',
      title: 'Documentação',
      subtitle: 'Ver guias e tutoriais',
      icon: <FileText className="h-4 w-4" />,
      action: () => window.open('https://docs.lovable.dev', '_blank'),
      category: 'Ações Rápidas',
    },
  ];

  return (
    <>
      {/* Trigger button - can be placed anywhere */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:border-primary/50 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Busca rápida...</span>
        <kbd className="ml-2 px-1.5 py-0.5 text-xs bg-muted rounded border border-border">
          <Command className="h-3 w-3 inline" />K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar páginas, tenants, ações..." />
        <CommandList>
          <CommandEmpty>
            <div className="py-6 text-center">
              <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum resultado encontrado</p>
            </div>
          </CommandEmpty>
          
          <CommandGroup heading="Navegação">
            {navigationItems.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={item.action}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          
          {isSuperAdmin && tenantItems.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Tenants Recentes">
                {tenantItems.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={item.action}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
          
          <CommandSeparator />
          <CommandGroup heading="Ações Rápidas">
            {quickActions.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={item.action}
                className="flex items-center gap-3 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-md bg-accent/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
