import { useState, useMemo, useEffect } from 'react';
import { Shield, Plus, Eye, Edit2, Trash2, AlertTriangle, Check, ChevronDown, ChevronRight, Info, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useModules } from '@/contexts/ModulesContext';
import { useRoles, usePermissions } from '@/hooks/useRoles';
import { 
  getModuleCategories, 
  getRoleTemplates,
  type ModuleConfig 
} from '@/config/permissions';

export default function Roles() {
  const { toast } = useToast();
  const { getEnabledModules } = useModules();
  const { roles, isLoading, error, fetchRoles, createRole, updateRole, deleteRole } = useRoles();
  const { permissions: permissionsData, fetchPermissions } = usePermissions();
  
  const activeModules = getEnabledModules();
  const moduleCategories = getModuleCategories();
  
  const enabledModuleIds = activeModules.map(m => m.id);
  const roleTemplates = getRoleTemplates(enabledModuleIds);
  
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);
  
  const modulesByCategory = useMemo(() => {
    const grouped: Record<string, ModuleConfig[]> = {};
    moduleCategories.forEach(cat => {
      grouped[cat.id] = activeModules.filter(m => m.category === cat.id);
    });
    return grouped;
  }, [activeModules, moduleCategories]);

  const toggleModuleExpand = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleViewRole = (role: any) => {
    setSelectedRole(role);
    setViewModalOpen(true);
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setNewRoleName(role.name);
    setNewRoleDescription(role.description);
    setSelectedPermissions(role.permissions);
    setEditModalOpen(true);
  };

  const handleOpenCreate = () => {
    setNewRoleName('');
    setNewRoleDescription('');
    setSelectedPermissions([]);
    setSelectedTemplate(null);
    setCreateModalOpen(true);
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = roleTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setNewRoleName(template.name);
      setNewRoleDescription(template.description);
      setSelectedPermissions(template.permissions);
    }
  };

  const togglePermission = (permId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permId) 
        ? prev.filter(p => p !== permId)
        : [...prev, permId]
    );
  };

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast({ title: "Erro", description: "Nome da role é obrigatório", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createRole({
        name: newRoleName,
        description: newRoleDescription,
        permissions: selectedPermissions,
      });
      
      setCreateModalOpen(false);
      toast({ title: "Role criada", description: `A role "${newRoleName}" foi criada com sucesso.` });
      fetchRoles();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Erro ao criar role", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedRole) return;
    
    setIsSubmitting(true);
    try {
      await updateRole(selectedRole.id, {
        name: newRoleName,
        description: newRoleDescription,
        permissions: selectedPermissions,
      });
      
      setEditModalOpen(false);
      toast({ title: "Role atualizada", description: "As alterações foram salvas." });
      fetchRoles();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Erro ao atualizar role", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!deleteRoleId) return;
    
    setIsSubmitting(true);
    try {
      await deleteRole(deleteRoleId);
      setDeleteRoleId(null);
      toast({ title: "Role removida", description: "A role foi removida com sucesso." });
      fetchRoles();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message || "Erro ao remover role", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPermissionName = (permId: string) => {
    for (const module of activeModules) {
      const perm = module.permissions.find(p => p.id === permId);
      if (perm) return perm.name;
    }
    return permId;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header />
        <div className="p-8 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-cs-bg-card border border-border rounded-xl p-6">
                <Skeleton className="h-12 w-12 rounded-xl mb-4" />
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-4" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Header />
      
      <div className="p-8 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cs-text-primary flex items-center gap-3">
              <Shield className="w-7 h-7 text-cs-cyan" />
              Roles & Permissões
            </h2>
            <p className="text-cs-text-secondary mt-1">Gerencie os papéis e permissões do sistema</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchRoles()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90"
              onClick={handleOpenCreate}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Role
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div 
              key={role.id}
              className="bg-cs-bg-card border border-border rounded-xl p-6 hover:border-cs-cyan/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-cs-cyan/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-cs-cyan" />
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-cs-text-muted hover:text-cs-cyan"
                    onClick={() => handleViewRole(role)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-cs-text-muted hover:text-cs-text-primary"
                    onClick={() => handleEditRole(role)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {!role.isSystem && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-cs-text-muted hover:text-red-400"
                      onClick={() => setDeleteRoleId(role.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-cs-text-primary mb-1">{role.name}</h3>
              <p className="text-sm text-cs-text-secondary mb-4">{role.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-cs-text-muted">{role.usersCount} usuários</span>
                <span className="text-cs-cyan">{role.permissions.length} permissões</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Role Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary flex items-center gap-2">
              <Shield className="w-5 h-5 text-cs-cyan" />
              {selectedRole?.name}
            </DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              {selectedRole?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-cs-text-muted">{selectedRole?.usersCount} usuários</span>
              <span className="text-cs-cyan">{selectedRole?.permissions.length} permissões</span>
            </div>

            <div>
              <Label className="text-cs-text-secondary mb-2 block">Permissões atribuídas</Label>
              <ScrollArea className="h-64 border border-border rounded-lg p-3">
                <div className="space-y-3">
                  {activeModules.map(module => {
                    const modulePerms = module.permissions.filter(p => 
                      selectedRole?.permissions.includes(p.id)
                    );
                    if (modulePerms.length === 0) return null;
                    
                    return (
                      <div key={module.id} className="space-y-1">
                        <p className="text-xs font-medium text-cs-cyan">{module.name}</p>
                        <div className="flex flex-wrap gap-1">
                          {modulePerms.map(perm => (
                            <Badge key={perm.id} variant="secondary" className="text-xs">
                              {perm.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Role Modal */}
      <Dialog open={createModalOpen || editModalOpen} onOpenChange={(open) => {
        if (!open) {
          setCreateModalOpen(false);
          setEditModalOpen(false);
        }
      }}>
        <DialogContent className="bg-cs-bg-card border-border max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary">
              {editModalOpen ? 'Editar Role' : 'Nova Role'}
            </DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              {editModalOpen ? 'Atualize as informações da role' : 'Configure a nova role e suas permissões'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {createModalOpen && (
              <div>
                <Label className="text-cs-text-secondary mb-2 block">Usar Template</Label>
                <div className="flex flex-wrap gap-2">
                  {roleTemplates.map(template => (
                    <Button
                      key={template.id}
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSelectTemplate(template.id)}
                      className={selectedTemplate === template.id ? "bg-cs-cyan" : ""}
                    >
                      {template.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-cs-text-secondary">Nome</Label>
                <Input
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Nome da role"
                  className="bg-cs-bg-primary border-border"
                />
              </div>
              <div>
                <Label className="text-cs-text-secondary">Descrição</Label>
                <Input
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  placeholder="Descrição da role"
                  className="bg-cs-bg-primary border-border"
                />
              </div>
            </div>

            <div>
              <Label className="text-cs-text-secondary mb-2 block">Permissões</Label>
              <ScrollArea className="h-64 border border-border rounded-lg p-3">
                <div className="space-y-4">
                  {moduleCategories.map(category => {
                    const categoryModules = modulesByCategory[category.id] || [];
                    if (categoryModules.length === 0) return null;
                    
                    return (
                      <div key={category.id} className="space-y-2">
                        <p className="text-sm font-medium text-cs-text-primary">{category.name}</p>
                        {categoryModules.map(module => (
                          <div key={module.id} className="ml-2 space-y-1">
                            <div 
                              className="flex items-center gap-2 cursor-pointer"
                              onClick={() => toggleModuleExpand(module.id)}
                            >
                              {expandedModules.includes(module.id) ? (
                                <ChevronDown className="w-4 h-4 text-cs-text-muted" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-cs-text-muted" />
                              )}
                              <span className="text-sm text-cs-cyan">{module.name}</span>
                            </div>
                            {expandedModules.includes(module.id) && (
                              <div className="ml-6 space-y-1">
                                {module.permissions.map(perm => (
                                  <div key={perm.id} className="flex items-center gap-2">
                                    <Checkbox
                                      checked={selectedPermissions.includes(perm.id)}
                                      onCheckedChange={() => togglePermission(perm.id)}
                                    />
                                    <span className="text-sm text-cs-text-secondary">{perm.name}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setCreateModalOpen(false);
                setEditModalOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={editModalOpen ? handleSaveEdit : handleCreateRole}
              className="bg-cs-cyan hover:bg-cs-cyan/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              Confirmar Exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-secondary">
              Tem certeza que deseja excluir esta role? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteRole}
              className="bg-red-500 hover:bg-red-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
