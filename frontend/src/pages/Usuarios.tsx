import { useState, useEffect } from 'react';
import { Users, Plus, Search, MoreHorizontal, Edit, Trash2, Power, PowerOff } from 'lucide-react';
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
import { useAudit } from '@/contexts/AuditContext';
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
}

const initialUsers: User[] = [
  { id: '1', name: 'João Silva', email: 'joao@example.com', role: 'Admin', status: 'active', lastLogin: '19/01/2026' },
  { id: '2', name: 'Maria Santos', email: 'maria@example.com', role: 'Operador', status: 'active', lastLogin: '19/01/2026' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@example.com', role: 'Operador', status: 'inactive', lastLogin: '15/01/2026' },
  { id: '4', name: 'Ana Lima', email: 'ana@example.com', role: 'Visualizador', status: 'active', lastLogin: '18/01/2026' },
  { id: '5', name: 'Carlos Souza', email: 'carlos@example.com', role: 'Operador', status: 'pending', lastLogin: '-' },
];

export default function Usuarios() {
  const { logActionBlocked } = useAudit();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Operador',
  });
  
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);
  
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenCreate = () => {
    setFormData({ name: '', email: '', role: 'Operador' });
    setIsCreateModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setIsEditModalOpen(true);
  };

  const handleOpenDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateUser = () => {
    if (!formData.name || !formData.email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const newUser: User = {
      id: String(Date.now()),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'pending',
      lastLogin: '-',
    };

    setUsers(prev => [newUser, ...prev]);
    setIsCreateModalOpen(false);
    setFormData({ name: '', email: '', role: 'Operador' });
    toast.success('Usuário criado com sucesso!');
  };

  const handleUpdateUser = () => {
    if (!selectedUser || !formData.name || !formData.email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setUsers(prev => prev.map(u => 
      u.id === selectedUser.id 
        ? { ...u, name: formData.name, email: formData.email, role: formData.role }
        : u
    ));
    setIsEditModalOpen(false);
    setSelectedUser(null);
    toast.success('Usuário atualizado com sucesso!');
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    
    setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
    toast.success('Usuário removido com sucesso!');
  };

  const handleToggleStatus = (user: User) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    setUsers(prev => prev.map(u => 
      u.id === user.id ? { ...u, status: newStatus } : u
    ));
    toast.success(newStatus === 'active' ? 'Usuário ativado!' : 'Usuário desativado!');
  };
  
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

        {isLoading ? (
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
        ) : (
          <div 
            className="bg-cs-bg-card border border-border rounded-xl overflow-hidden opacity-0 animate-enter"
            style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
          >
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-cs-text-secondary">Nome</TableHead>
                  <TableHead className="text-cs-text-secondary">Email</TableHead>
                  <TableHead className="text-cs-text-secondary">Role</TableHead>
                  <TableHead className="text-cs-text-secondary">Status</TableHead>
                  <TableHead className="text-cs-text-secondary">Último Login</TableHead>
                  <TableHead className="text-cs-text-secondary text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32">
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
                  filteredUsers.map((user, index) => (
                    <TableRow 
                      key={user.id} 
                      className="border-border hover:bg-cs-bg-card-hover opacity-0 animate-fade-in"
                      style={{ animationDelay: `${150 + index * 30}ms`, animationFillMode: 'forwards' }}
                    >
                      <TableCell className="font-medium text-cs-text-primary">{user.name}</TableCell>
                      <TableCell className="text-cs-text-secondary">{user.email}</TableCell>
                      <TableCell className="text-cs-text-secondary">{user.role}</TableCell>
                      <TableCell>
                        <StatusPill 
                          status={user.status === 'active' ? 'success' : user.status === 'inactive' ? 'error' : 'warning'}
                          label={user.status === 'active' ? 'Ativo' : user.status === 'inactive' ? 'Inativo' : 'Pendente'}
                        />
                      </TableCell>
                      <TableCell className="text-cs-text-secondary">{user.lastLogin}</TableCell>
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
                                {user.status === 'active' ? (
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
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
              <Label className="text-cs-text-secondary">Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
                className="bg-cs-bg-primary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cs-text-secondary">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="bg-cs-bg-primary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cs-text-secondary">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="bg-cs-bg-primary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Operador">Operador</SelectItem>
                  <SelectItem value="Visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-border">
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} className="bg-gradient-to-r from-cs-cyan to-cs-blue">
              Criar Usuário
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
              <Label className="text-cs-text-secondary">Nome</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nome completo"
                className="bg-cs-bg-primary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cs-text-secondary">Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                className="bg-cs-bg-primary border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-cs-text-secondary">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                <SelectTrigger className="bg-cs-bg-primary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Operador">Operador</SelectItem>
                  <SelectItem value="Visualizador">Visualizador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-border">
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} className="bg-gradient-to-r from-cs-cyan to-cs-blue">
              Salvar Alterações
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
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}