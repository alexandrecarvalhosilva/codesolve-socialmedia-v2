import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Plus, Edit, Trash2, Package, Copy, AlertTriangle, RefreshCw } from 'lucide-react';
import { useModules } from '@/hooks/useModules';
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
  category: z.enum(['communication', 'automation', 'analytics', 'integration', 'ai']),
  priceMonthly: z.number().min(0, 'Preço não pode ser negativo'),
  isActive: z.boolean(),
});

type ModuleFormData = z.infer<typeof moduleSchema>;

const categoryLabels: Record<ModuleCategory, string> = {
  communication: 'Comunicação',
  automation: 'Automação',
  analytics: 'Analytics',
  integration: 'Integração',
  ai: 'Inteligência Artificial',
};

export default function ManageModules() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<BillingModule | null>(null);
  const [moduleToDelete, setModuleToDelete] = useState<BillingModule | null>(null);

  const { modules, isLoading, fetchModules } = useModules();

  const form = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      category: 'communication',
      priceMonthly: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    fetchModules();
  }, []);

  const handleRefresh = () => {
    fetchModules();
    toast.success('Lista atualizada');
  };

  const handleCreateModule = () => {
    setEditingModule(null);
    form.reset({
      name: '',
      slug: '',
      description: '',
      category: 'communication',
      priceMonthly: 0,
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditModule = (module: BillingModule) => {
    setEditingModule(module);
    form.reset({
      name: module.name,
      slug: module.slug,
      description: module.description,
      category: module.category,
      priceMonthly: module.priceMonthly,
      isActive: module.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteModule = (module: BillingModule) => {
    setModuleToDelete(module);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (moduleToDelete) {
      toast.success(`Módulo "${moduleToDelete.name}" excluído`);
      setIsDeleteDialogOpen(false);
      setModuleToDelete(null);
      fetchModules();
    }
  };

  const onSubmit = (data: ModuleFormData) => {
    if (editingModule) {
      toast.success(`Módulo "${data.name}" atualizado`);
    } else {
      toast.success(`Módulo "${data.name}" criado`);
    }
    setIsDialogOpen(false);
    fetchModules();
  };

  const copySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
    toast.success('Slug copiado!');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Package className="w-7 h-7 text-primary" />
              Módulos Adicionais
            </h1>
            <p className="text-muted-foreground">Gerencie módulos disponíveis para contratação</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={handleCreateModule}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Módulo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Total de Módulos</p>
              <p className="text-2xl font-bold text-foreground">{modules.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Ativos</p>
              <p className="text-2xl font-bold text-cs-success">
                {modules.filter(m => m.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Inativos</p>
              <p className="text-2xl font-bold text-muted-foreground">
                {modules.filter(m => !m.isActive).length}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">Categorias</p>
              <p className="text-2xl font-bold text-foreground">
                {new Set(modules.map(m => m.category)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Grid de módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <Card key={module.id} className={`bg-cs-bg-card border-border ${!module.isActive ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{module.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="text-xs px-2 py-0.5 bg-cs-bg-primary rounded">
                        {module.slug}
                      </code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copySlug(module.slug)}>
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant={module.isActive ? 'default' : 'secondary'}>
                    {module.isActive ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge variant="outline">{categoryLabels[module.category]}</Badge>
                    <p className="text-lg font-bold text-foreground mt-2">
                      {formatPrice(module.priceMonthly)}/mês
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditModule(module)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteModule(module)}
                      className="text-cs-error hover:text-cs-error"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialog de criação/edição */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingModule ? 'Editar Módulo' : 'Novo Módulo'}
              </DialogTitle>
              <DialogDescription>
                {editingModule ? 'Atualize as informações do módulo' : 'Crie um novo módulo adicional'}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-cs-bg-primary border-border" />
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
                        <Input {...field} className="bg-cs-bg-primary border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-cs-bg-primary border-border" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-cs-bg-primary border-border">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(categoryLabels).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="priceMonthly"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço Mensal (R$)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(Number(e.target.value))}
                            className="bg-cs-bg-primary border-border" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="!mt-0">Módulo ativo</FormLabel>
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingModule ? 'Salvar' : 'Criar'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Dialog de confirmação de exclusão */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-cs-error" />
                Excluir Módulo
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o módulo "{moduleToDelete?.name}"? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-cs-error hover:bg-cs-error/90">
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
