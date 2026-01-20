import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Download, 
  Plus, 
  Settings, 
  Trash2,
  ChevronLeft,
  ChevronRight,
  Power,
  PowerOff,
  Users
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { EmptyState, EmptySearchState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  adminId?: string;
}

// Mock users para seleção de administrador
const mockUsers = [
  { id: 'user1', name: 'João Silva', email: 'joao@example.com' },
  { id: 'user2', name: 'Maria Santos', email: 'maria@example.com' },
  { id: 'user3', name: 'Pedro Costa', email: 'pedro@example.com' },
];

// Mock data inicial
const initialTenants: Tenant[] = [
  { id: '1', name: 'Test Tenant Contacts 2', slug: 'test-contacts-2-1768755032367', status: 'active', createdAt: '18/01/2026' },
  { id: '2', name: 'Other RAG Tenant', slug: 'other-rag-tenant-1768755031953', status: 'active', createdAt: '18/01/2026' },
  { id: '3', name: 'Test Tenant Contacts 1', slug: 'test-contacts-1768755028908', status: 'active', createdAt: '18/01/2026' },
  { id: '4', name: 'Test Tenant Lists', slug: 'test-lists-1768755025550', status: 'inactive', createdAt: '18/01/2026' },
  { id: '5', name: 'Test RAG Tenant', slug: 'test-rag-tenant-1768755024516', status: 'active', createdAt: '18/01/2026' },
  { id: '6', name: 'Other RAG Tenant', slug: 'other-rag-tenant-1768684979408', status: 'pending', createdAt: '17/01/2026' },
  { id: '7', name: 'Test RAG Tenant', slug: 'test-rag-tenant-1768684974032', status: 'active', createdAt: '17/01/2026' },
  { id: '8', name: 'Test Tenant Contacts 2', slug: 'test-contacts-2-1768684977964', status: 'active', createdAt: '17/01/2026' },
  { id: '9', name: 'Test Tenant Contacts 1', slug: 'test-contacts-1768684975971', status: 'inactive', createdAt: '17/01/2026' },
  { id: '10', name: 'Test Tenant Lists', slug: 'test-lists-1768684974909', status: 'active', createdAt: '17/01/2026' },
];

// Função para gerar slug a partir do nome
const generateSlug = (name: string): string => {
  const baseSlug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${baseSlug}-${Date.now()}`;
};

export default function Tenants() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [isLoading, setIsLoading] = useState(true);
  
  // Simula carregamento
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  // Modal de criação
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  
  // Dialog de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  
  const totalPages = Math.ceil(tenants.length / 10) || 1;
  const totalItems = tenants.length;

  const filteredTenants = tenants.filter(
    tenant => 
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler para atualizar slug automaticamente quando nome muda
  const handleNameChange = (name: string) => {
    setNewTenantName(name);
    if (name.trim()) {
      setNewTenantSlug(generateSlug(name));
    } else {
      setNewTenantSlug('');
    }
  };

  // Handler para criar tenant
  const handleCreateTenant = () => {
    if (!newTenantName.trim()) {
      toast.error('Nome do tenant é obrigatório');
      return;
    }
    if (!selectedAdmin) {
      toast.error('Selecione um administrador');
      return;
    }

    const newTenant: Tenant = {
      id: String(Date.now()),
      name: newTenantName.trim(),
      slug: newTenantSlug || generateSlug(newTenantName),
      status: 'active',
      createdAt: new Date().toLocaleDateString('pt-BR'),
      adminId: selectedAdmin,
    };

    setTenants(prev => [newTenant, ...prev]);
    setIsCreateModalOpen(false);
    setNewTenantName('');
    setNewTenantSlug('');
    setSelectedAdmin('');
    
    toast.success('Tenant criado com sucesso!');
    
    // Navegar para a página de gerenciamento do tenant criado
    navigate(`/tenants/${newTenant.id}`);
  };

  // Handler para abrir dialog de exclusão
  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setIsDeleteDialogOpen(true);
  };

  // Handler para confirmar exclusão
  const handleConfirmDelete = () => {
    if (tenantToDelete) {
      setTenants(prev => prev.filter(t => t.id !== tenantToDelete.id));
      toast.success(`Tenant "${tenantToDelete.name}" removido com sucesso!`);
      setTenantToDelete(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Handler para ir para configurações do tenant
  const handleSettingsClick = (tenantId: string) => {
    navigate(`/tenants/${tenantId}`);
  };

  // Handler para toggle de status (ativar/desativar)
  const handleToggleStatus = (tenant: Tenant) => {
    const newStatus = tenant.status === 'active' ? 'inactive' : 'active';
    setTenants(prev => 
      prev.map(t => 
        t.id === tenant.id ? { ...t, status: newStatus } : t
      )
    );
    toast.success(
      newStatus === 'active' 
        ? `Tenant "${tenant.name}" ativado com sucesso!`
        : `Tenant "${tenant.name}" desativado com sucesso!`
    );
  };

  const getStatusProps = (status: string) => {
    switch (status) {
      case 'active':
        return { status: 'success' as const, label: 'Ativo' };
      case 'inactive':
        return { status: 'error' as const, label: 'Inativo' };
      default:
        return { status: 'warning' as const, label: 'Pendente' };
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header />
        <div className="p-8 space-y-6 animate-fade-in">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-80" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-muted/30 p-4 flex gap-8 border-b border-border">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16 ml-auto" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-8">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <div className="ml-auto flex gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <Skeleton className="h-8 w-8 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-4 py-4 border-t border-border">
              <Skeleton className="h-4 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header />
      
      <div className="p-8 space-y-6 opacity-0 animate-enter" style={{ animationFillMode: 'forwards' }}>
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Search className="w-4 h-4 text-cs-text-muted" />
            <Input
              placeholder="Buscar por nome ou slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-80 bg-cs-bg-card border-border text-cs-text-primary placeholder:text-cs-text-muted focus:border-cs-cyan"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              className="border-border text-cs-text-secondary hover:text-cs-text-primary hover:bg-cs-bg-card"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>
            <Button 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Tenant
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-cs-text-secondary font-medium">Nome</TableHead>
                <TableHead className="text-cs-text-secondary font-medium">Slug</TableHead>
                <TableHead className="text-cs-text-secondary font-medium">Status</TableHead>
                <TableHead className="text-cs-text-secondary font-medium">Criado em</TableHead>
                <TableHead className="text-cs-text-secondary font-medium text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32">
                    {searchQuery ? (
                      <EmptySearchState onClear={() => setSearchQuery('')} />
                    ) : (
                      <EmptyState
                        icon={Users}
                        title="Nenhum tenant cadastrado"
                        description="Crie seu primeiro tenant para começar a gerenciar seus clientes"
                        action={{
                          label: 'Criar Tenant',
                          onClick: () => setIsCreateModalOpen(true)
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTenants.map((tenant) => {
                  const statusProps = getStatusProps(tenant.status);
                  return (
                    <TableRow 
                      key={tenant.id} 
                      className="border-border hover:bg-cs-bg-card-hover transition-colors"
                    >
                      <TableCell className="font-medium text-cs-text-primary">
                        {tenant.name}
                      </TableCell>
                      <TableCell className="text-cs-text-secondary font-mono text-sm">
                        {tenant.slug}
                      </TableCell>
                      <TableCell>
                        <StatusPill 
                          status={statusProps.status} 
                          label={statusProps.label}
                        />
                      </TableCell>
                      <TableCell className="text-cs-text-secondary">
                        {tenant.createdAt}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 ${
                              tenant.status === 'active' 
                                ? 'text-cs-success hover:text-cs-error hover:bg-cs-error/10' 
                                : 'text-cs-text-muted hover:text-cs-success hover:bg-cs-success/10'
                            }`}
                            onClick={() => handleToggleStatus(tenant)}
                            title={tenant.status === 'active' ? 'Desativar tenant' : 'Ativar tenant'}
                          >
                            {tenant.status === 'active' ? (
                              <Power className="w-4 h-4" />
                            ) : (
                              <PowerOff className="w-4 h-4" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-cs-text-muted hover:text-cs-text-primary hover:bg-cs-bg-card"
                            onClick={() => handleSettingsClick(tenant.id)}
                            title="Configurações do tenant"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-cs-text-muted hover:text-cs-error hover:bg-cs-error/10"
                            onClick={() => handleDeleteClick(tenant)}
                            title="Excluir tenant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-border">
            <p className="text-sm text-cs-text-secondary">
              Mostrando 1 a {Math.min(10, totalItems)} de {totalItems} tenants
            </p>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="border-border text-cs-text-secondary hover:text-cs-text-primary"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              
              <span className="text-sm text-cs-text-secondary px-3">
                Página {currentPage} de {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="border-border text-cs-text-secondary hover:text-cs-text-primary"
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>

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
              <Label htmlFor="tenant-name" className="text-cs-text-secondary">
                Nome do Tenant
              </Label>
              <Input
                id="tenant-name"
                placeholder="Empresa XYZ"
                value={newTenantName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="bg-cs-bg-primary border-cs-cyan text-cs-text-primary placeholder:text-cs-text-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tenant-slug" className="text-cs-text-secondary">
                Slug (identificador único)
              </Label>
              <Input
                id="tenant-slug"
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

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary">
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-secondary">
              Tem certeza que deseja excluir o tenant "{tenantToDelete?.name}"? 
              Esta ação não pode ser desfeita e todos os dados associados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-cs-bg-primary border-border text-cs-text-secondary hover:bg-cs-bg-card-hover hover:text-cs-text-primary">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-cs-error hover:bg-cs-error/90 text-white"
            >
              Excluir Tenant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
