import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
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
import { api } from '@/lib/api';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

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

  // Data state
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');

  // Fetch tenants from backend
  const fetchTenants = async () => {
    setIsLoadingTenants(true);
    try {
      const response = await api.get('/tenants');
      setTenants(response.data.tenants || []);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      setTenants([]);
    } finally {
      setIsLoadingTenants(false);
    }
  };

  // Fetch users from backend
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    if (isSuperAdmin) {
      fetchTenants();
      fetchUsers();
    }
  }, [isSuperAdmin]);

  // Filter tenants based on search query
  const filteredTenants = tenants.filter(tenant =>
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
  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) {
      toast.error('Nome do tenant é obrigatório');
      return;
    }
    if (!selectedAdmin) {
      toast.error('Selecione um administrador');
      return;
    }

    try {
      const response = await api.post('/tenants', {
        name: newTenantName,
        slug: newTenantSlug,
        adminId: selectedAdmin,
      });
      
      const newTenantId = response.data.tenant?.id || String(Date.now());
      
      setIsCreateModalOpen(false);
      setNewTenantName('');
      setNewTenantSlug('');
      setSelectedAdmin('');
      
      toast.success('Tenant criado com sucesso!');
      fetchTenants(); // Refresh list
      navigate(`/tenants/${newTenantId}`);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar tenant');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-cs-bg-primary/95 backdrop-blur supports-[backdrop-filter]:bg-cs-bg-primary/60">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Breadcrumbs */}
        <Breadcrumbs />
        
        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Search */}
          {isSuperAdmin && (
            <div ref={searchRef} className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-cs-text-muted" />
                <Input
                  type="text"
                  placeholder="Buscar tenant..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  className="w-64 pl-10 bg-cs-bg-card border-border"
                />
              </div>
              
              {/* Dropdown */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-cs-bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto z-50">
                  {isLoadingTenants ? (
                    <div className="p-4 space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : filteredTenants.length > 0 ? (
                    filteredTenants.map(tenant => (
                      <button
                        key={tenant.id}
                        onClick={() => handleTenantSelect(tenant.id)}
                        className="w-full px-4 py-3 text-left hover:bg-cs-bg-primary flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-cs-text-primary">{tenant.name}</p>
                          <p className="text-xs text-cs-text-muted">{tenant.slug}</p>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(tenant.status)}`} />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-cs-text-muted">
                      Nenhum tenant encontrado
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Create Tenant Button */}
          {isSuperAdmin && (
            <Button onClick={() => setIsCreateModalOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Novo Tenant
            </Button>
          )}
          
          {/* Command Search */}
          <CommandSearch />
          
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <NotificationDropdown />
        </div>
      </div>
      
      {/* Create Tenant Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Tenant</DialogTitle>
            <DialogDescription>
              Preencha as informações para criar um novo tenant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="tenantName">Nome do Tenant</Label>
              <Input
                id="tenantName"
                value={newTenantName}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ex: Empresa XYZ"
                className="mt-2 bg-cs-bg-primary border-border"
              />
            </div>
            <div>
              <Label htmlFor="tenantSlug">Slug</Label>
              <Input
                id="tenantSlug"
                value={newTenantSlug}
                onChange={(e) => setNewTenantSlug(e.target.value)}
                placeholder="empresa-xyz"
                className="mt-2 bg-cs-bg-primary border-border"
              />
              <p className="text-xs text-cs-text-muted mt-1">
                Identificador único para URLs
              </p>
            </div>
            <div>
              <Label htmlFor="admin">Administrador</Label>
              <Select value={selectedAdmin} onValueChange={setSelectedAdmin}>
                <SelectTrigger className="mt-2 bg-cs-bg-primary border-border">
                  <SelectValue placeholder="Selecione um administrador" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingUsers ? (
                    <div className="p-2">
                      <Skeleton className="h-8 w-full" />
                    </div>
                  ) : users.length > 0 ? (
                    users.map(u => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground">
                      Nenhum usuário disponível
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateTenant}>
              Criar Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

// Export for backward compatibility
export const sharedTenants: Tenant[] = [];
