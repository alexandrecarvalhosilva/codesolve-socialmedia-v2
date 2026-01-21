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
  Users,
  RefreshCw
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
import { api, ApiError } from '@/lib/api';
import type { Tenant, TenantStatus, BillingPlan, User } from '@/lib/apiTypes';

// ============================================================================
// TIPOS
// ============================================================================

interface TenantsResponse {
  items: Tenant[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface UsersResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface PlansResponse {
  plans: BillingPlan[];
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

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

// Mapear status do backend para props do StatusPill
const getStatusProps = (status: TenantStatus) => {
  switch (status) {
    case 'active':
      return { status: 'success' as const, label: 'Ativo' };
    case 'suspended':
      return { status: 'error' as const, label: 'Suspenso' };
    case 'trial':
      return { status: 'warning' as const, label: 'Trial' };
    case 'canceled':
      return { status: 'error' as const, label: 'Cancelado' };
    default:
      return { status: 'warning' as const, label: 'Pendente' };
  }
};

// Formatar data
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function Tenants() {
  const navigate = useNavigate();
  
  // Estados de dados
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  
  // Estados de UI
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal de criação
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  
  // Dialog de exclusão
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);

  // ============================================================================
  // CARREGAR DADOS
  // ============================================================================

  const loadTenants = async (page = 1, search = '') => {
    try {
      const response = await api.get<TenantsResponse>('/tenants', {
        page,
        limit: 10,
        search: search || undefined,
      });
      
      if (response.success && response.data) {
        const items = (response.data.items || []).map((item: any) => ({
          ...item,
          planName: item.planName || item.plan || undefined,
          whatsappInstancesCount: item.whatsappInstancesCount ?? item.instancesCount,
        }));
        setTenants(items);
        setTotalItems(response.data.total || 0);
        const limitValue = response.data.limit || 10;
        setTotalPages(Math.max(1, Math.ceil((response.data.total || 0) / limitValue)));
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao carregar tenants');
    }
  };

  const loadUsers = async () => {
    try {
      const response = await api.get<UsersResponse>('/users', {
        limit: 100,
        role: 'admin',
      });
      
      if (response.success && response.data) {
        setUsers(response.data.items || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await api.get<PlansResponse>('/billing/plans');
      
      if (response.success && response.data) {
        if (Array.isArray(response.data)) {
          setPlans(response.data);
        } else {
          setPlans(response.data.plans || []);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([
        loadTenants(1, ''),
        loadUsers(),
        loadPlans(),
      ]);
      setIsLoading(false);
    };
    
    loadInitialData();
  }, []);

  // Recarregar ao mudar página ou busca
  useEffect(() => {
    if (!isLoading) {
      loadTenants(currentPage, searchQuery);
    }
  }, [currentPage]);

  // Debounce na busca
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        loadTenants(1, searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadTenants(currentPage, searchQuery);
    setIsRefreshing(false);
    toast.success('Lista atualizada');
  };

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
  const handleCreateTenant = async () => {
    if (!newTenantName.trim()) {
      toast.error('Nome do tenant é obrigatório');
      return;
    }
    if (!adminEmail.trim()) {
      toast.error('Email do administrador é obrigatório');
      return;
    }
    if (!adminPassword.trim() || adminPassword.length < 6) {
      toast.error('Senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await api.post<{ tenant: Tenant }>('/tenants', {
        name: newTenantName.trim(),
        slug: newTenantSlug || generateSlug(newTenantName),
        planId: selectedPlan || undefined,
        adminName: newTenantName.trim() + ' Admin',
        adminEmail: adminEmail.trim(),
        adminPassword: adminPassword,
      });

      if (response.success && response.data) {
        toast.success('Tenant criado com sucesso!');
        setIsCreateModalOpen(false);
        resetCreateForm();
        
        // Recarregar lista
        await loadTenants(1, '');
        setCurrentPage(1);
        
        // Navegar para a página de gerenciamento do tenant criado
        navigate(`/tenants/${response.data.tenant.id}`);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao criar tenant');
    } finally {
      setIsCreating(false);
    }
  };

  const resetCreateForm = () => {
    setNewTenantName('');
    setNewTenantSlug('');
    setSelectedAdmin('');
    setSelectedPlan('');
    setAdminEmail('');
    setAdminPassword('');
  };

  // Handler para abrir dialog de exclusão
  const handleDeleteClick = (tenant: Tenant) => {
    setTenantToDelete(tenant);
    setIsDeleteDialogOpen(true);
  };

  // Handler para confirmar exclusão
  const handleConfirmDelete = async () => {
    if (!tenantToDelete) return;

    setIsDeleting(true);
    
    try {
      await api.delete(`/tenants/${tenantToDelete.id}`);
      
      toast.success(`Tenant "${tenantToDelete.name}" removido com sucesso!`);
      setTenantToDelete(null);
      setIsDeleteDialogOpen(false);
      
      // Recarregar lista
      await loadTenants(currentPage, searchQuery);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao excluir tenant');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handler para ir para configurações do tenant
  const handleSettingsClick = (tenantId: string) => {
    navigate(`/tenants/${tenantId}`);
  };

  // Handler para toggle de status (ativar/suspender)
  const handleToggleStatus = async (tenant: Tenant) => {
    const action = tenant.status === 'active' ? 'suspend' : 'activate';
    
    try {
      await api.post(`/tenants/${tenant.id}/${action}`);
      
      toast.success(
        action === 'activate' 
          ? `Tenant "${tenant.name}" ativado com sucesso!`
          : `Tenant "${tenant.name}" suspenso com sucesso!`
      );
      
      // Recarregar lista
      await loadTenants(currentPage, searchQuery);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || `Erro ao ${action === 'activate' ? 'ativar' : 'suspender'} tenant`);
    }
  };

  // ============================================================================
  // RENDER - LOADING STATE
  // ============================================================================

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

  // ============================================================================
  // RENDER - MAIN
  // ============================================================================

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
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="border-border text-cs-text-secondary hover:text-cs-text-primary hover:bg-cs-bg-card"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
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
                <TableHead className="text-cs-text-secondary font-medium">Plano</TableHead>
                <TableHead className="text-cs-text-secondary font-medium">Status</TableHead>
                <TableHead className="text-cs-text-secondary font-medium">Criado em</TableHead>
                <TableHead className="text-cs-text-secondary font-medium text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32">
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
                tenants.map((tenant) => {
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
                      <TableCell className="text-cs-text-secondary">
                        {tenant.planName || '-'}
                      </TableCell>
                      <TableCell>
                        <StatusPill 
                          status={statusProps.status} 
                          label={statusProps.label}
                        />
                      </TableCell>
                      <TableCell className="text-cs-text-secondary">
                        {formatDate(tenant.createdAt)}
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
                            title={tenant.status === 'active' ? 'Suspender tenant' : 'Ativar tenant'}
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
              Mostrando {tenants.length > 0 ? ((currentPage - 1) * 10) + 1 : 0} a {Math.min(currentPage * 10, totalItems)} de {totalItems} tenants
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
                Página {currentPage} de {totalPages || 1}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
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
              Crie um novo tenant e configure o administrador inicial
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-name" className="text-cs-text-secondary">
                Nome do Tenant *
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
                Plano
              </Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="bg-cs-bg-primary border-border text-cs-text-primary">
                  <SelectValue placeholder="Selecione um plano (opcional)..." />
                </SelectTrigger>
                <SelectContent className="bg-cs-bg-card border-border">
                  {plans.map((plan) => (
                    <SelectItem 
                      key={plan.id} 
                      value={plan.id}
                      className="text-cs-text-primary hover:bg-cs-bg-card-hover focus:bg-cs-bg-card-hover"
                    >
                      {plan.name} - R$ {plan.priceMonthly.toFixed(2)}/mês
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t border-border pt-4 mt-4">
              <h4 className="text-sm font-medium text-cs-text-primary mb-3">Administrador do Tenant</h4>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-cs-text-secondary">
                    Email do Administrador *
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@empresa.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="bg-cs-bg-primary border-border text-cs-text-primary placeholder:text-cs-text-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="admin-password" className="text-cs-text-secondary">
                    Senha do Administrador *
                  </Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="bg-cs-bg-primary border-border text-cs-text-primary placeholder:text-cs-text-muted"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetCreateForm();
              }}
              className="border-border text-cs-text-secondary hover:text-cs-text-primary"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateTenant}
              disabled={isCreating}
              className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90"
            >
              {isCreating ? 'Criando...' : 'Criar Tenant'}
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
              disabled={isDeleting}
              className="bg-cs-error hover:bg-cs-error/90 text-white"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir Tenant'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
