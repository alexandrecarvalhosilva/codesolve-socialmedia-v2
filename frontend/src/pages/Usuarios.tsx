import { useState, useEffect } from 'react';
import { Users, Plus, Search, MoreHorizontal, Edit, Trash2, Power, PowerOff, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { EmptyState, EmptySearchState } from '@/components/ui/empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { PermissionGate } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { api, ApiError } from '@/lib/api';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User, UserRole, Tenant } from '@/lib/apiTypes';

// ============================================================================
// TIPOS
// ============================================================================

interface UsersResponse {
  items: User[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface TenantsResponse {
  items: Tenant[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

const getRoleLabel = (role: UserRole): string => {
  const labels: Record<UserRole, string> = {
    superadmin: 'Super Admin',
    admin: 'Admin',
    operador: 'Operador',
    visualizador: 'Visualizador',
  };
  return labels[role] || role;
};

const getStatusProps = (isActive: boolean) => {
  return isActive 
    ? { status: 'success' as const, label: 'Ativo' }
    : { status: 'error' as const, label: 'Inativo' };
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function Usuarios() {
  const { user: currentUser } = useAuth();
  
  // Estados de dados
  const [users, setUsers] = useState<User[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  
  // Estados de UI
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'operador' as UserRole,
    tenantId: '',
  });

  // ============================================================================
  // CARREGAR DADOS
  // ============================================================================

  const loadUsers = async (page = 1, search = '') => {
    try {
      const params: Record<string, any> = {
        page,
        limit: 10,
      };
      
      if (search) params.search = search;
      
      // Se não for superadmin, filtra pelo tenant do usuário
      if (currentUser?.role !== 'superadmin' && currentUser?.tenantId) {
        params.tenantId = currentUser.tenantId;
      }
      
      const response = await api.get<UsersResponse>('/users', params);
      
      if (response.success && response.data) {
        const items = response.data.items || [];
        setUsers(items);
        setTotalItems(response.data.total || 0);
        const limitValue = response.data.limit || 10;
        setTotalPages(Math.max(1, Math.ceil((response.data.total || 0) / limitValue)));
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao carregar usuários');
    }
  };

  const loadTenants = async () => {
    try {
      const response = await api.get<TenantsResponse>('/tenants', { limit: 100 });
      
      if (response.success && response.data) {
        const items = (response.data.items || []).map((item: any) => ({
          ...item,
          planName: item.planName || item.plan || undefined,
        }));
        setTenants(items);
      }
    } catch (error) {
      console.error('Erro ao carregar tenants:', error);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      await Promise.all([
        loadUsers(1, ''),
        currentUser?.role === 'superadmin' ? loadTenants() : Promise.resolve(),
      ]);
      setIsLoading(false);
    };
    
    loadInitialData();
  }, [currentUser]);

  // Recarregar ao mudar página
  useEffect(() => {
    if (!isLoading) {
      loadUsers(currentPage, searchQuery);
    }
  }, [currentPage]);

  // Debounce na busca
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setCurrentPage(1);
        loadUsers(1, searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadUsers(currentPage, searchQuery);
    setIsRefreshing(false);
    toast.success('Lista atualizada');
  };

  const handleOpenCreate = () => {
    setFormData({ 
      name: '', 
      email: '', 
      password: '',
      role: 'operador',
      tenantId: currentUser?.tenantId || '',
    });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ 
      name: user.name, 
      email: user.email, 
      password: '',
      role: user.role,
      tenantId: user.tenantId || '',
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload: Record<string, any> = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      
      // Adiciona tenantId se for superadmin e selecionou um tenant
      if (currentUser?.role === 'superadmin' && formData.tenantId) {
        payload.tenantId = formData.tenantId;
      }
      
      await api.post('/users', payload);
      
      toast.success('Usuário criado com sucesso!');
      setIsCreateModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'operador', tenantId: '' });
      
      // Recarregar lista
      await loadUsers(1, '');
      setCurrentPage(1);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao criar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !formData.name || !formData.email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const payload: Record<string, any> = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };
      
      // Só envia senha se foi preenchida
      if (formData.password) {
        if (formData.password.length < 6) {
          toast.error('A senha deve ter pelo menos 6 caracteres');
          setIsSubmitting(false);
          return;
        }
        payload.password = formData.password;
      }
      
      await api.put(`/users/${selectedUser.id}`, payload);
      
      toast.success('Usuário atualizado com sucesso!');
      setIsEditModalOpen(false);
      setSelectedUser(null);
      
      // Recarregar lista
      await loadUsers(currentPage, searchQuery);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao atualizar usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    
    try {
      await api.delete(`/users/${selectedUser.id}`);
      
      toast.success('Usuário removido com sucesso!');
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      
      // Recarregar lista
      await loadUsers(currentPage, searchQuery);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao excluir usuário');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      await api.put(`/users/${user.id}`, { isActive: !user.isActive });
      
      toast.success(user.isActive ? 'Usuário desativado!' : 'Usuário ativado!');
      
      // Recarregar lista
      await loadUsers(currentPage, searchQuery);
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao alterar status do usuário');
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
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
          <Skeleton className="h-10 w-80" />
          <div className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
            <div className="bg-muted/30 p-4 flex gap-8 border-b border-border">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12 ml-auto" />
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center gap-8">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-md ml-auto" />
                </div>
              ))}
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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cs-text-primary flex items-center gap-3">
              <Users className="w-7 h-7 text-cs-cyan" />
              Usuários
            </h2>
            <p className="text-cs-text-secondary mt-1">Gerencie os usuários do sistema</p>
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
            
            <PermissionGate permission="users:create">
              <Button 
                className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90"
                onClick={handleOpenCreate}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </PermissionGate>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-text-muted" />
            <Input
              placeholder="Buscar usuários..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-cs-bg-card border-border text-cs-text-primary"
            />
          </div>
        </div>

        <div 
          className="bg-cs-bg-card border border-border rounded-xl overflow-hidden opacity-0 animate-enter"
          style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
        >
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-cs-text-secondary">Nome</TableHead>
                <TableHead className="text-cs-text-secondary">Email</TableHead>
                {currentUser?.role === 'superadmin' && (
                  <TableHead className="text-cs-text-secondary">Tenant</TableHead>
                )}
                <TableHead className="text-cs-text-secondary">Role</TableHead>
                <TableHead className="text-cs-text-secondary">Status</TableHead>
                <TableHead className="text-cs-text-secondary">Último Login</TableHead>
                <TableHead className="text-cs-text-secondary text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={currentUser?.role === 'superadmin' ? 7 : 6} className="h-32">
                    {searchQuery ? (
                      <EmptySearchState onClear={() => setSearchQuery('')} />
                    ) : (
                      <EmptyState
                        icon={Users}
                        title="Nenhum usuário cadastrado"
                        description="Adicione usuários para gerenciar o acesso ao sistema"
                        action={{
                          label: 'Novo Usuário',
                          onClick: handleOpenCreate
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user, index) => {
                  const statusProps = getStatusProps(user.isActive);
                  return (
                    <TableRow 
                      key={user.id} 
                      className="border-border hover:bg-cs-bg-card-hover opacity-0 animate-fade-in"
                      style={{ animationDelay: `${150 + index * 30}ms`, animationFillMode: 'forwards' }}
                    >
                      <TableCell className="font-medium text-cs-text-primary">{user.name}</TableCell>
                      <TableCell className="text-cs-text-secondary">{user.email}</TableCell>
                      {currentUser?.role === 'superadmin' && (
                        <TableCell className="text-cs-text-secondary">
                          {user.tenantName || '-'}
                        </TableCell>
                      )}
                      <TableCell className="text-cs-text-secondary">{getRoleLabel(user.role)}</TableCell>
                      <TableCell>
                        <StatusPill 
                          status={statusProps.status}
                          label={statusProps.label}
                        />
                      </TableCell>
                      <TableCell className="text-cs-text-secondary">{formatDate(user.lastLoginAt)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-cs-text-muted hover:text-cs-text-primary">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-cs-bg-card border-border">
                            <PermissionGate permission="users:edit">
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleOpenEdit(user)}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer"
                                onClick={() => handleToggleStatus(user)}
                              >
                                {user.isActive ? (
                                  <>
                                    <PowerOff className="w-4 h-4 mr-2" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <Power className="w-4 h-4 mr-2" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                            </PermissionGate>
                            <PermissionGate permission="users:delete">
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => handleOpenDelete(user)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </PermissionGate>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              Mostrando {users.length > 0 ? ((currentPage - 1) * 10) + 1 : 0} a {Math.min(currentPage * 10, totalItems)} de {totalItems} usuários
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

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary">Novo Usuário</DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              Adicione um novo usuário ao sistema
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-cs-text-secondary">Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
                className="bg-cs-bg-primary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cs-text-secondary">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="bg-cs-bg-primary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cs-text-secondary">Senha *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="bg-cs-bg-primary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cs-text-secondary">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger className="bg-cs-bg-primary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-cs-bg-card border-border">
                  {currentUser?.role === 'superadmin' && (
                    <SelectItem value="admin">Admin</SelectItem>
                  )}
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {currentUser?.role === 'superadmin' && (
              <div className="space-y-2">
                <Label className="text-cs-text-secondary">Tenant</Label>
                <Select 
                  value={formData.tenantId} 
                  onValueChange={(value) => setFormData({ ...formData, tenantId: value })}
                >
                  <SelectTrigger className="bg-cs-bg-primary border-border">
                    <SelectValue placeholder="Selecione um tenant (opcional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-cs-bg-card border-border">
                    {tenants.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateModalOpen(false)} 
              className="border-border"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateUser} 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Criando...' : 'Criar Usuário'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary">Editar Usuário</DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              Atualize as informações do usuário
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-cs-text-secondary">Nome *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
                className="bg-cs-bg-primary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cs-text-secondary">Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="bg-cs-bg-primary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cs-text-secondary">Nova Senha (deixe em branco para manter)</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Mínimo 6 caracteres"
                className="bg-cs-bg-primary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cs-text-secondary">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger className="bg-cs-bg-primary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-cs-bg-card border-border">
                  {currentUser?.role === 'superadmin' && (
                    <SelectItem value="admin">Admin</SelectItem>
                  )}
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditModalOpen(false)} 
              className="border-border"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdateUser} 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary">Excluir Usuário</AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-secondary">
              Tem certeza que deseja excluir o usuário "{selectedUser?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border" disabled={isSubmitting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
