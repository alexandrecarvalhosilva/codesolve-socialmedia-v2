import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Plus, Edit, Trash2, Package, Copy, AlertTriangle } from 'lucide-react';
import { mockModules } from '@/data/billingMockData';
import { BillingModule, formatPrice, ModuleCategory } from '@/types/billing';
import { toast } from 'sonner';

// Validation schema
const moduleSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome deve ter no máximo 50 caracteres'),
  slug: z.string()
    .min(2, 'Slug deve ter pelo menos 2 caracteres')
    .max(30, 'Slug deve ter no máximo 30 caracteres')
    .regex(/^[a-z0-9_]+$/, 'Slug deve conter apenas letras minúsculas, números e underscores'),
  description: z.string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(200, 'Descrição deve ter no máximo 200 caracteres'),
  price: z.coerce.number()
    .min(0, 'Preço não pode ser negativo')
    .max(9999999, 'Preço máximo excedido'),
  category: z.enum(['communication', 'ai', 'integration', 'support', 'analytics'], {
    required_error: 'Selecione uma categoria',
  }),
  iconName: z.string()
    .min(1, 'Ícone é obrigatório')
    .max(30, 'Nome do ícone muito longo'),
  dependsOn: z.string().optional(),
  isRecurring: z.boolean(),
  isPerUnit: z.boolean(),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

export default function ManageModules() {
  const [modules, setModules] = useState(mockModules);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<BillingModule | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<BillingModule | null>(null);

  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      category: 'communication',
      iconName: 'Package',
      dependsOn: 'none',
      isRecurring: true,
      isPerUnit: false,
    },
  });

  const categoryLabels: Record<ModuleCategory, string> = {
    communication: 'Comunicação',
    ai: 'Inteligência Artificial',
    integration: 'Integrações',
    support: 'Suporte',
    analytics: 'Analytics',
  };

  const resetFormWithModule = (module: BillingModule | null, isDuplicate = false) => {
    if (module) {
      form.reset({
        name: isDuplicate ? `${module.name} (Cópia)` : module.name,
        slug: isDuplicate ? `${module.slug}_copy` : module.slug,
        description: module.description,
        price: module.price,
        category: module.category,
        iconName: module.iconName || 'Package',
        dependsOn: module.dependsOn || 'none',
        isRecurring: module.isRecurring,
        isPerUnit: module.isPerUnit,
      });
    } else {
      form.reset({
        name: '',
        slug: '',
        description: '',
        price: 0,
        category: 'communication',
        iconName: 'Package',
        dependsOn: 'none',
        isRecurring: true,
        isPerUnit: false,
      });
    }
  };

  const handleCreateModule = () => {
    setEditingModule(null);
    resetFormWithModule(null);
    setIsDialogOpen(true);
  };

  const handleEditModule = (module: BillingModule) => {
    setEditingModule(module);
    resetFormWithModule(module);
    setIsDialogOpen(true);
  };

  const handleDuplicateModule = (module: BillingModule) => {
    setEditingModule(null);
    resetFormWithModule(module, true);
    setIsDialogOpen(true);
    toast.info('Módulo duplicado. Edite os campos e salve.');
  };

  const handleToggleActive = (moduleId: string) => {
    setModules(modules.map(m => 
      m.id === moduleId ? { ...m, isActive: !m.isActive } : m
    ));
    toast.success('Status do módulo atualizado');
  };

  const handleDeleteModule = (module: BillingModule) => {
    setModuleToDelete(module);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteModule = () => {
    if (moduleToDelete) {
      setModules(modules.filter(m => m.id !== moduleToDelete.id));
      toast.success('Módulo excluído');
      setModuleToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const onSubmit = (data: ModuleFormData) => {
    // Check for duplicate slug
    const slugExists = modules.some(m => 
      m.slug === data.slug && (!editingModule || m.id !== editingModule.id)
    );
    
    if (slugExists) {
      form.setError('slug', { message: 'Este slug já está em uso' });
      return;
    }

    const now = new Date().toISOString();
    
    if (editingModule) {
      // Update existing module
      setModules(modules.map(m => 
        m.id === editingModule.id 
          ? { 
              ...m, 
              ...data, 
              dependsOn: data.dependsOn === 'none' ? null : data.dependsOn,
              updatedAt: now,
            } 
          : m
      ));
      toast.success('Módulo atualizado!');
    } else {
      // Create new module
      const newModule: BillingModule = {
        id: `mod_${Date.now()}`,
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        category: data.category,
        iconName: data.iconName,
        dependsOn: data.dependsOn === 'none' ? null : data.dependsOn ?? null,
        isRecurring: data.isRecurring,
        isPerUnit: data.isPerUnit,
        currency: 'BRL',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };
      setModules([...modules, newModule]);
      toast.success('Módulo criado!');
    }
    
    setIsDialogOpen(false);
  };

  // Group by category
  const groupedModules = modules.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<ModuleCategory, BillingModule[]>);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gerenciar Módulos</h1>
            <p className="text-muted-foreground">Configure os módulos extras disponíveis</p>
          </div>
          <Button onClick={handleCreateModule} className="bg-cs-cyan hover:bg-cs-cyan/90">
            <Plus className="h-4 w-4 mr-2" />
            Novo Módulo
          </Button>
        </div>

        {/* Modules by Category */}
        {Object.entries(groupedModules).map(([category, categoryModules]) => (
          <Card key={category} className="bg-cs-bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {categoryLabels[category as ModuleCategory]}
              </CardTitle>
              <CardDescription>{categoryModules.length} módulo(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryModules.map((module) => (
                  <div 
                    key={module.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      module.isActive 
                        ? 'border-border bg-cs-bg-primary' 
                        : 'border-border/50 bg-cs-bg-primary/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground">{module.name}</h4>
                        <p className="text-sm text-muted-foreground">{module.slug}</p>
                      </div>
                      <div className="flex gap-1">
                        {module.isPerUnit && (
                          <Badge variant="outline" className="text-xs">Por unidade</Badge>
                        )}
                        {module.isRecurring && (
                          <Badge variant="outline" className="text-xs">Recorrente</Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {module.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <p className="font-bold text-primary">
                        {formatPrice(module.price)}
                        {module.isPerUnit && <span className="text-xs font-normal">/un</span>}
                        <span className="text-xs text-muted-foreground font-normal">/mês</span>
                      </p>
                      <div className="flex items-center gap-1">
                        <Switch
                          checked={module.isActive}
                          onCheckedChange={() => handleToggleActive(module.id)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDuplicateModule(module)}
                          title="Duplicar módulo"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditModule(module)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteModule(module)}
                          className="text-cs-error hover:text-cs-error"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {module.dependsOn && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Requer: {module.dependsOn}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-cs-bg-card border-border max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes do módulo extra
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="Ex: IA Avançada"
                            className="bg-cs-bg-primary border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="Ex: ai_advanced"
                            className="bg-cs-bg-primary border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="Descrição do módulo (10-200 caracteres)"
                            className="bg-cs-bg-primary border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (centavos)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            type="number"
                            placeholder="4990"
                            className="bg-cs-bg-primary border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-cs-bg-primary border-border">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="communication">Comunicação</SelectItem>
                            <SelectItem value="ai">Inteligência Artificial</SelectItem>
                            <SelectItem value="integration">Integrações</SelectItem>
                            <SelectItem value="support">Suporte</SelectItem>
                            <SelectItem value="analytics">Analytics</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="iconName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ícone (Lucide)</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="Ex: Bot"
                            className="bg-cs-bg-primary border-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="dependsOn"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Depende de</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-cs-bg-primary border-border">
                              <SelectValue placeholder="Nenhum" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {modules.map(m => (
                              <SelectItem key={m.id} value={m.slug}>{m.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center gap-6 col-span-2 pt-2">
                    <FormField
                      control={form.control}
                      name="isRecurring"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Recorrente</FormLabel>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isPerUnit"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Por Unidade</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-cs-cyan hover:bg-cs-cyan/90">
                    {editingModule ? 'Salvar' : 'Criar Módulo'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent className="bg-cs-bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-cs-error" />
                Confirmar Exclusão
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o módulo <strong>"{moduleToDelete?.name}"</strong>?
                <br /><br />
                Esta ação não pode ser desfeita. Tenants que utilizam este módulo perderão acesso imediatamente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDeleteModule}
                className="bg-cs-error hover:bg-cs-error/90"
              >
                Excluir Módulo
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
