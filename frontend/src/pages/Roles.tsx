import { useState, useMemo } from 'react';
import { Shield, Plus, Eye, Edit2, Trash2, AlertTriangle, Check, ChevronDown, ChevronRight, Info } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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
import { 
  getModuleCategories, 
  getRoleTemplates,
  type ModuleConfig 
} from '@/config/permissions';

interface Role {
  id: string;
  name: string;
  description: string;
  usersCount: number;
  permissions: string[];
  isSystem?: boolean;
}

export default function Roles() {
  const { toast } = useToast();
  const { getEnabledModules } = useModules();
  
  // Módulos ativos do contexto (respeita toggle de configurações)
  const activeModules = getEnabledModules();
  const moduleCategories = getModuleCategories();
  
  // Gerar templates baseados nos módulos ativos
  const enabledModuleIds = activeModules.map(m => m.id);
  const roleTemplates = getRoleTemplates(enabledModuleIds);
  
  // Gerar roles iniciais a partir dos templates
  const initialRoles: Role[] = roleTemplates.map((template, index) => ({
    id: String(index + 1),
    name: template.name,
    description: template.description,
    usersCount: index === 0 ? 1 : index === 1 ? 3 : index === 2 ? 8 : 5,
    permissions: template.permissions,
    isSystem: true
  }));
  
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteRoleId, setDeleteRoleId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  
  // Form states
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  
  // Agrupar módulos por categoria
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

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setViewModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
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

  const handleCreateRole = () => {
    if (!newRoleName.trim()) {
      toast({ title: "Erro", description: "Nome da role é obrigatório", variant: "destructive" });
      return;
    }
    
    const newRole: Role = {
      id: Date.now().toString(),
      name: newRoleName,
      description: newRoleDescription,
      usersCount: 0,
      permissions: selectedPermissions,
    };
    
    setRoles(prev => [...prev, newRole]);
    setCreateModalOpen(false);
    toast({ title: "Role criada", description: `A role "${newRoleName}" foi criada com sucesso.` });
  };

  const handleSaveEdit = () => {
    if (!selectedRole) return;
    
    setRoles(prev => prev.map(r => 
      r.id === selectedRole.id 
        ? { ...r, name: newRoleName, description: newRoleDescription, permissions: selectedPermissions }
        : r
    ));
    setEditModalOpen(false);
    toast({ title: "Role atualizada", description: "As alterações foram salvas." });
  };

  const handleDeleteRole = () => {
    if (!deleteRoleId) return;
    setRoles(prev => prev.filter(r => r.id !== deleteRoleId));
    setDeleteRoleId(null);
    toast({ title: "Role removida", description: "A role foi removida com sucesso." });
  };

  const getPermissionName = (permId: string) => {
    for (const module of activeModules) {
      const perm = module.permissions.find(p => p.id === permId);
      if (perm) return perm.name;
    }
    return permId;
  };

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
          
          <Button 
            className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90"
            onClick={handleOpenCreate}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Role
          </Button>
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
                    const modulePerms = module.permissions.filter(p => selectedRole?.permissions.includes(p.id));
                    if (modulePerms.length === 0) return null;
                    const Icon = module.icon;
                    
                    return (
                      <div key={module.id}>
                        <h4 className="text-xs font-medium text-cs-text-muted uppercase mb-2 flex items-center gap-2">
                          <Icon className="w-3 h-3" />
                          {module.name}
                        </h4>
                        <div className="space-y-1">
                          {modulePerms.map(perm => (
                            <div key={perm.id} className="flex items-center gap-2 text-sm text-cs-text-primary">
                              <Check className="w-3 h-3 text-cs-success" />
                              {perm.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewModalOpen(false)} className="border-border">
              Fechar
            </Button>
            <Button 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue"
              onClick={() => { setViewModalOpen(false); handleEditRole(selectedRole!); }}
            >
              Editar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Role Modal */}
      <Dialog open={createModalOpen || editModalOpen} onOpenChange={(open) => { setCreateModalOpen(false); setEditModalOpen(false); }}>
        <DialogContent className="bg-cs-bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary flex items-center gap-2">
              <Shield className="w-5 h-5 text-cs-cyan" />
              {editModalOpen ? 'Editar Role' : 'Nova Role'}
            </DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              {editModalOpen ? 'Modifique as configurações da role' : 'Selecione um template ou configure manualmente'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Templates (only for create) */}
            {createModalOpen && (
              <div>
                <Label className="text-cs-text-secondary mb-2 block">Templates de Role</Label>
                <div className="grid grid-cols-3 gap-2">
                  {roleTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedTemplate === template.id 
                          ? 'border-cs-cyan bg-cs-cyan/10' 
                          : 'border-border hover:border-cs-cyan/50'
                      }`}
                    >
                      <h4 className="text-sm font-medium text-cs-text-primary">{template.name}</h4>
                      <p className="text-xs text-cs-text-muted mt-1">{template.permissions.length} permissões</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Name and Description */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="roleName" className="text-cs-text-secondary">Nome</Label>
                <Input
                  id="roleName"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                  placeholder="Ex: Supervisor"
                />
              </div>
              <div>
                <Label htmlFor="roleDescription" className="text-cs-text-secondary">Descrição</Label>
                <Input
                  id="roleDescription"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="bg-cs-bg-primary border-border text-cs-text-primary mt-1"
                  placeholder="Ex: Supervisiona operadores"
                />
              </div>
            </div>

            {/* Permissions */}
            <div>
              <Label className="text-cs-text-secondary mb-2 block">Permissões ({selectedPermissions.length} selecionadas)</Label>
              <ScrollArea className="h-64 border border-border rounded-lg p-3">
                <div className="space-y-4">
                  {moduleCategories.map(category => {
                    const categoryModules = modulesByCategory[category.id] || [];
                    if (categoryModules.length === 0) return null;
                    
                    return (
                      <div key={category.id}>
                        <h4 className="text-sm font-semibold text-cs-text-primary mb-3 pb-2 border-b border-border">
                          {category.label}
                        </h4>
                        <div className="space-y-3">
                          {categoryModules.map(module => {
                            const Icon = module.icon;
                            const isExpanded = expandedModules.includes(module.id);
                            const modulePermCount = module.permissions.filter(p => selectedPermissions.includes(p.id)).length;
                            
                            return (
                              <div key={module.id} className="border border-border rounded-lg overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => toggleModuleExpand(module.id)}
                                  className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon className="w-4 h-4 text-cs-cyan" />
                                    <span className="text-sm font-medium text-cs-text-primary">{module.name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {modulePermCount}/{module.permissions.length}
                                    </Badge>
                                  </div>
                                  {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-cs-text-muted" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-cs-text-muted" />
                                  )}
                                </button>
                                
                                {isExpanded && (
                                  <div className="p-3 pt-0 space-y-2 border-t border-border bg-muted/20">
                                    {module.permissions.map(perm => (
                                      <div key={perm.id} className="flex items-center space-x-2">
                                        <Checkbox
                                          id={perm.id}
                                          checked={selectedPermissions.includes(perm.id)}
                                          onCheckedChange={() => togglePermission(perm.id)}
                                        />
                                        <label 
                                          htmlFor={perm.id} 
                                          className="text-sm text-cs-text-primary cursor-pointer flex-1"
                                        >
                                          {perm.name}
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <Info className="w-3 h-3 inline ml-1 text-cs-text-muted" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>{perm.description}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
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
              onClick={() => { setCreateModalOpen(false); setEditModalOpen(false); }} 
              className="border-border"
            >
              Cancelar
            </Button>
            <Button 
              className="bg-gradient-to-r from-cs-cyan to-cs-blue"
              onClick={editModalOpen ? handleSaveEdit : handleCreateRole}
            >
              {editModalOpen ? 'Salvar Alterações' : 'Criar Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Role Confirmation */}
      <AlertDialog open={!!deleteRoleId} onOpenChange={() => setDeleteRoleId(null)}>
        <AlertDialogContent className="bg-cs-bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-cs-text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Remover Role
            </AlertDialogTitle>
            <AlertDialogDescription className="text-cs-text-secondary">
              Tem certeza que deseja remover esta role? Os usuários associados perderão suas permissões.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-border text-cs-text-secondary hover:bg-cs-bg-card-hover">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteRole}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
