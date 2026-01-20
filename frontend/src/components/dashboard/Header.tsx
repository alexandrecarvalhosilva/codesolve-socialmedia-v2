import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationDropdown } from '@/components/notifications/NotificationDropdown';
import { CommandSearch } from '@/components/ui/command-search';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

// Shared tenants data - same as in Tenants.tsx
// In a real app this would come from a context or API
export const sharedTenants = [
  { id: '1', name: 'Test Tenant Contacts 2', slug: 'test-contacts-2-1768755032367', status: 'active' as const, createdAt: '18/01/2026' },
  { id: '2', name: 'Other RAG Tenant', slug: 'other-rag-tenant-1768755031953', status: 'active' as const, createdAt: '18/01/2026' },
  { id: '3', name: 'Test Tenant Contacts 1', slug: 'test-contacts-1768755028908', status: 'active' as const, createdAt: '18/01/2026' },
  { id: '4', name: 'Test Tenant Lists', slug: 'test-lists-1768755025550', status: 'inactive' as const, createdAt: '18/01/2026' },
  { id: '5', name: 'Test RAG Tenant', slug: 'test-rag-tenant-1768755024516', status: 'active' as const, createdAt: '18/01/2026' },
  { id: '6', name: 'Other RAG Tenant', slug: 'other-rag-tenant-1768684979408', status: 'pending' as const, createdAt: '17/01/2026' },
  { id: '7', name: 'Test RAG Tenant', slug: 'test-rag-tenant-1768684974032', status: 'active' as const, createdAt: '17/01/2026' },
  { id: '8', name: 'Test Tenant Contacts 2', slug: 'test-contacts-2-1768684977964', status: 'active' as const, createdAt: '17/01/2026' },
  { id: '9', name: 'Test Tenant Contacts 1', slug: 'test-contacts-1768684975971', status: 'inactive' as const, createdAt: '17/01/2026' },
  { id: '10', name: 'Test Tenant Lists', slug: 'test-lists-1768684974909', status: 'active' as const, createdAt: '17/01/2026' },
];

// Mock users for admin selection
const mockUsers = [
  { id: 'user1', name: 'João Silva', email: 'joao@example.com' },
  { id: 'user2', name: 'Maria Santos', email: 'maria@example.com' },
  { id: 'user3', name: 'Pedro Costa', email: 'pedro@example.com' },
];

// Generate slug from name
const generateSlug = (name: string): string => {
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${baseSlug}-${Date.now()}`;
};

export function Header() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');

  // Filter tenants based on search query
  const filteredTenants = sharedTenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTenantSelect = (tenantId: string) => {
    setSearchQuery('');
    setIsDropdownOpen(false);
    navigate(`/tenants/${tenantId}`);
  };

  const handleSearchFocus = () => {
    if (searchQuery.length > 0 || filteredTenants.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsDropdownOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-cs-success';
      case 'inactive':
        return 'bg-cs-error';
      case 'pending':
        return 'bg-cs-warning';
      default:
        return 'bg-cs-text-disabled';
    }
  };

  // Handler to update slug automatically when name changes
  const handleNameChange = (name: string) => {
    setNewTenantName(name);
    if (name.trim()) {
      setNewTenantSlug(generateSlug(name));
    } else {
      setNewTenantSlug('');
    }
  };

  // Handler to create tenant
  const handleCreateTenant = () => {
    if (!newTenantName.trim()) {
      toast.error('Nome do tenant é obrigatório');
      return;
    }
    if (!selectedAdmin) {
      toast.error('Selecione um administrador');
      return;
    }

    const newTenantId = String(Date.now());
    
    // In a real app, we would add to the database here
    // For now, we just show success and navigate
    
    setIsCreateModalOpen(false);
    setNewTenantName('');
    setNewTenantSlug('');
    setSelectedAdmin('');
    
    toast.success('Tenant criado com sucesso!');
    
    // Navigate to the tenant's config page (tab=config)
    navigate(`/tenants/${newTenantId}?tab=config`);
  };

  return (
    <>
      <header className="h-header bg-cs-bg-primary/80 backdrop-blur-sm border-b border-border sticky top-0 z-40 flex items-center justify-between px-8">
        {/* Brand Presentation */}
        <div className="flex items-center gap-5">
          {/* Brand Name */}
          <div className="flex-shrink-0 flex flex-col items-center">
            <span className="text-2xl font-black tracking-widest text-cs-cyan drop-shadow-[0_0_10px_rgba(0,255,255,0.5)]">
              CODESOLVE
            </span>
            <span className="text-xs font-semibold tracking-[0.3em] text-white -mt-1">
              SOCIAL MEDIA
            </span>
          </div>
          
          <div className="h-10 w-px bg-border" />
          
          {/* Slogan */}
          <div>
            <h1 className="text-base font-semibold text-cs-text-primary">
              A Arte de Resolver Problemas
            </h1>
            <p className="text-sm text-cs-cyan">
              Gestão Inteligente de Redes Sociais
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Command Search (Cmd+K) */}
          <CommandSearch />
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <NotificationDropdown />
          
          {/* Quick Action - Only for SuperAdmin */}
          {isSuperAdmin && (
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-gradient px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Criar Tenant
            </button>
          )}
        </div>
      </header>

      {/* Modal de Criação de Tenant */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border text-cs-text-primary">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Criar Novo Tenant</DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              Crie um novo tenant e vincule um administrador
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="header-tenant-name" className="text-cs-text-secondary">
                Nome do Tenant
              </Label>
              <Input
                id="header-tenant-name"
                placeholder="Empresa XYZ"
                value={newTenantName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="bg-cs-bg-primary border-cs-cyan text-cs-text-primary placeholder:text-cs-text-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="header-tenant-slug" className="text-cs-text-secondary">
                Slug (identificador único)
              </Label>
              <Input
                id="header-tenant-slug"
                placeholder="empresa-xyz"
                value={newTenantSlug}
                onChange={(e) => setNewTenantSlug(e.target.value)}
                className="bg-cs-bg-primary border-border text-cs-text-muted placeholder:text-cs-text-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-cs-text-secondary">
                Administrador do Tenant
              </Label>
              <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                <SelectTrigger className="bg-cs-bg-primary border-border text-cs-text-primary">
                  <SelectValue placeholder="Selecione um usuário..." />
                </SelectTrigger>
                <SelectContent className="bg-cs-bg-card border-border">
                  {mockUsers.map((user) => (
                    <SelectItem 
                      key={user.id} 
                      value={user.id}
                      className="text-cs-text-primary hover:bg-cs-bg-card-hover focus:bg-cs-bg-card-hover"
                    >
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              onClick={handleCreateTenant}
              className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90"
            >
              Criar Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
