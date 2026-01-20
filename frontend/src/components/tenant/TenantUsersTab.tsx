import { useState, useMemo } from 'react';
import { Users, Plus, Pencil, Trash2, Search, MoreHorizontal, Mail, ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StatusPill } from '@/components/dashboard/StatusPill';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

interface TenantUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Operador' | 'Visualizador';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  inviteSentAt?: string;
}

const initialUsers: TenantUser[] = [
  { id: '1', name: 'Admin Tenant', email: 'admin@tenant.com', role: 'Admin', status: 'active', createdAt: '10/01/2026' },
  { id: '2', name: 'Operador Silva', email: 'operador@tenant.com', role: 'Operador', status: 'active', createdAt: '12/01/2026' },
  { id: '3', name: 'Visualizador Costa', email: 'visualizador@tenant.com', role: 'Visualizador', status: 'active', createdAt: '14/01/2026' },
  { id: '4', name: 'Maria Santos', email: 'maria@tenant.com', role: 'Operador', status: 'inactive', createdAt: '15/01/2026' },
  { id: '5', name: 'João Pereira', email: 'joao@tenant.com', role: 'Visualizador', status: 'pending', createdAt: '16/01/2026', inviteSentAt: '16/01/2026' },
  { id: '6', name: 'Ana Oliveira', email: 'ana@tenant.com', role: 'Admin', status: 'active', createdAt: '17/01/2026' },
  { id: '7', name: 'Carlos Mendes', email: 'carlos@tenant.com', role: 'Operador', status: 'active', createdAt: '18/01/2026' },
];

const ITEMS_PER_PAGE = 5;

interface TenantUsersTabProps {
  tenantId?: string;
}

export function TenantUsersTab({ tenantId }: TenantUsersTabProps) {
  const [users, setUsers] = useState<TenantUser[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TenantUser | null>(null);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [emailError, setEmailError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Operador' as TenantUser['role'],
    status: 'active' as TenantUser['status'],
    sendInvite: true,
  });

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', role: 'Operador', status: 'active', sendInvite: true });
    setEmailError('');
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if email is unique (excluding current user when editing)
  const isEmailUnique = (email: string, excludeUserId?: string): boolean => {
    return !users.some(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.id !== excludeUserId
    );
  };

  // Validate form data
  const validateForm = (excludeUserId?: string): boolean => {
    setEmailError('');

    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return false;
    }

    if (!formData.email.trim()) {
      toast.error('E-mail é obrigatório');
      return false;
    }

    if (!validateEmail(formData.email)) {
      setEmailError('Formato de e-mail inválido');
      return false;
    }

    if (!isEmailUnique(formData.email, excludeUserId)) {
      setEmailError('Este e-mail já está cadastrado');
      return false;
    }

    return true;
  };

  // Simulate sending invite email
  const sendInviteEmail = async (user: TenantUser): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate 95% success rate
    return Math.random() > 0.05;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    const newUser: TenantUser = {
      id: String(Date.now()),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.sendInvite ? 'pending' : formData.status,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      inviteSentAt: formData.sendInvite ? new Date().toLocaleDateString('pt-BR') : undefined,
    };

    if (formData.sendInvite) {
      setIsSendingInvite(true);
      const success = await sendInviteEmail(newUser);
      setIsSendingInvite(false);

      if (success) {
        setUsers([...users, newUser]);
        setIsCreateModalOpen(false);
        resetForm();
        toast.success('Usuário criado e convite enviado com sucesso!', {
          description: `E-mail enviado para ${newUser.email}`,
        });
      } else {
        toast.error('Erro ao enviar convite', {
          description: 'Usuário criado, mas o convite não foi enviado. Tente reenviar.',
        });
        newUser.status = 'inactive';
        newUser.inviteSentAt = undefined;
        setUsers([...users, newUser]);
        setIsCreateModalOpen(false);
        resetForm();
      }
    } else {
      setUsers([...users, newUser]);
      setIsCreateModalOpen(false);
      resetForm();
      toast.success('Usuário criado com sucesso!');
    }
  };

  const handleEditUser = () => {
    if (!selectedUser || !validateForm(selectedUser.id)) return;

    setUsers(users.map(user => 
      user.id === selectedUser.id 
        ? { ...user, name: formData.name, email: formData.email, role: formData.role, status: formData.status }
        : user
    ));
    setIsEditModalOpen(false);
    setSelectedUser(null);
    resetForm();
    toast.success('Usuário atualizado com sucesso!');
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;

    setUsers(users.filter(user => user.id !== selectedUser.id));
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
    
    // Adjust current page if necessary
    const newTotal = users.length - 1;
    const newTotalPages = Math.ceil(newTotal / ITEMS_PER_PAGE);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
    
    toast.success('Usuário excluído com sucesso!');
  };

  const handleToggleStatus = (user: TenantUser) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(users.map(u => 
      u.id === user.id 
        ? { ...u, status: newStatus }
        : u
    ));
    toast.success(`Usuário ${newStatus === 'active' ? 'ativado' : 'desativado'} com sucesso!`);
  };

  const handleResendInvite = async (user: TenantUser) => {
    setSelectedUser(user);
    setIsInviteModalOpen(true);
  };

  const confirmResendInvite = async () => {
    if (!selectedUser) return;

    setIsSendingInvite(true);
    const success = await sendInviteEmail(selectedUser);
    setIsSendingInvite(false);

    if (success) {
      setUsers(users.map(u => 
        u.id === selectedUser.id 
          ? { ...u, inviteSentAt: new Date().toLocaleDateString('pt-BR'), status: 'pending' }
          : u
      ));
      toast.success('Convite reenviado com sucesso!', {
        description: `E-mail enviado para ${selectedUser.email}`,
      });
    } else {
      toast.error('Erro ao reenviar convite', {
        description: 'Tente novamente em alguns instantes.',
      });
    }

    setIsInviteModalOpen(false);
    setSelectedUser(null);
  };

  const openEditModal = (user: TenantUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status === 'pending' ? 'active' : user.status,
      sendInvite: false,
    });
    setEmailError('');
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (user: TenantUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getStatusConfig = (status: TenantUser['status']) => {
    switch (status) {
      case 'active':
        return { status: 'success' as const, label: 'Ativo' };
      case 'inactive':
        return { status: 'error' as const, label: 'Inativo' };
      case 'pending':
        return { status: 'warning' as const, label: 'Pendente' };
    }
  };

  return (
    <div className="bg-cs-bg-card border border-border rounded-xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <Users className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-cs-text-primary text-lg">Usuários do Tenant</h3>
            <p className="text-cs-text-muted text-sm">
              {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-text-muted" />
            <Input 
              placeholder="Buscar usuário..." 
              className="pl-9 bg-cs-bg-primary border-border w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Button 
            className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90"
            onClick={() => {
              resetForm();
              setIsCreateModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Usuário
          </Button>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3">
        {paginatedUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-cs-text-muted mx-auto mb-3" />
            <p className="text-cs-text-secondary">
              {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
            </p>
            {!searchTerm && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar primeiro usuário
              </Button>
            )}
          </div>
        ) : (
          paginatedUsers.map((user) => {
            const statusConfig = getStatusConfig(user.status);
            return (
              <div 
                key={user.id} 
                className="flex items-center justify-between p-4 bg-cs-bg-primary/50 rounded-lg hover:bg-cs-bg-primary/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold">
                    {user.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-cs-text-primary">{user.name}</p>
                    <p className="text-sm text-cs-text-muted">{user.email}</p>
                    {user.status === 'pending' && user.inviteSentAt && (
                      <p className="text-xs text-cs-warning flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" />
                        Convite enviado em {user.inviteSentAt}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary hidden sm:inline-block">
                    {user.role}
                  </span>
                  <StatusPill 
                    status={statusConfig.status} 
                    label={statusConfig.label} 
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-cs-bg-card border-border">
                      <DropdownMenuItem 
                        onClick={() => openEditModal(user)}
                        className="cursor-pointer"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      {user.status !== 'pending' && (
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(user)}
                          className="cursor-pointer"
                        >
                          {user.status === 'active' ? 'Desativar' : 'Ativar'}
                        </DropdownMenuItem>
                      )}
                      {(user.status === 'pending' || user.status === 'inactive') && (
                        <DropdownMenuItem 
                          onClick={() => handleResendInvite(user)}
                          className="cursor-pointer"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          {user.status === 'pending' ? 'Reenviar Convite' : 'Enviar Convite'}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => openDeleteDialog(user)}
                        className="cursor-pointer text-cs-error focus:text-cs-error"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <p className="text-sm text-cs-text-muted">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="border-border"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={page === currentPage ? 'bg-primary text-primary-foreground' : ''}
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="border-border"
            >
              Próximo
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary">Adicionar Usuário</DialogTitle>
            <DialogDescription className="text-cs-text-muted">
              Preencha os dados do novo usuário para este tenant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input 
                id="name"
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-cs-bg-primary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail *</Label>
              <Input 
                id="email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setEmailError('');
                }}
                className={`bg-cs-bg-primary border-border ${emailError ? 'border-cs-error' : ''}`}
              />
              {emailError && (
                <p className="text-sm text-cs-error">{emailError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Perfil</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: TenantUser['role']) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="bg-cs-bg-primary border-border">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent className="bg-cs-bg-card border-border">
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Operador">Operador</SelectItem>
                  <SelectItem value="Visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="sendInvite" 
                checked={formData.sendInvite}
                onCheckedChange={(checked) => setFormData({ ...formData, sendInvite: checked as boolean })}
              />
              <Label htmlFor="sendInvite" className="text-sm font-normal cursor-pointer">
                Enviar convite por e-mail ao criar
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isSendingInvite}>
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90"
              onClick={handleCreateUser}
              disabled={isSendingInvite}
            >
              {isSendingInvite ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Enviando...
                </>
              ) : (
                <>
                  {formData.sendInvite && <Mail className="w-4 h-4 mr-2" />}
                  {formData.sendInvite ? 'Criar e Enviar Convite' : 'Criar Usuário'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary">Editar Usuário</DialogTitle>
            <DialogDescription className="text-cs-text-muted">
              Atualize os dados do usuário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input 
                id="edit-name"
                placeholder="Nome completo"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-cs-bg-primary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">E-mail *</Label>
              <Input 
                id="edit-email"
                type="email"
                placeholder="email@exemplo.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setEmailError('');
                }}
                className={`bg-cs-bg-primary border-border ${emailError ? 'border-cs-error' : ''}`}
              />
              {emailError && (
                <p className="text-sm text-cs-error">{emailError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Perfil</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value: TenantUser['role']) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="bg-cs-bg-primary border-border">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent className="bg-cs-bg-card border-border">
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Operador">Operador</SelectItem>
                  <SelectItem value="Visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: TenantUser['status']) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="bg-cs-bg-primary border-border">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent className="bg-cs-bg-card border-border">
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90"
              onClick={handleEditUser}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary">Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-muted">
              Tem certeza que deseja excluir o usuário <strong className="text-cs-text-primary">{selectedUser?.name}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-cs-error hover:bg-cs-error/90"
              onClick={handleDeleteUser}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Resend Invite Confirmation */}
      <AlertDialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary flex items-center gap-2">
              <Mail className="w-5 h-5 text-cs-cyan" />
              Enviar Convite
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-muted">
              Deseja enviar um convite por e-mail para <strong className="text-cs-text-primary">{selectedUser?.name}</strong> ({selectedUser?.email})?
              {selectedUser?.inviteSentAt && (
                <span className="block mt-2 text-cs-warning">
                  Último convite enviado em: {selectedUser.inviteSentAt}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border" disabled={isSendingInvite}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90"
              onClick={confirmResendInvite}
              disabled={isSendingInvite}
            >
              {isSendingInvite ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Convite
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
