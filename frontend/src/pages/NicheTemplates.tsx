import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Copy,
  Power,
  Eye,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Building2,
  ExternalLink
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { StatusPill } from '@/components/dashboard/StatusPill';
import { fetchNicheTemplates } from '@/services/templateService';
import { NicheTemplate, NicheVariable, NicheFAQ } from '@/types/nicheTemplate';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';

const categories = [
  { value: 'academia', label: 'Academia' },
  { value: 'clinica', label: 'Clínica/Saúde' },
  { value: 'delivery', label: 'Delivery/Restaurante' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'educacao', label: 'Educação' },
  { value: 'servicos', label: 'Serviços' },
  { value: 'outros', label: 'Outros' },
];

export default function NicheTemplates() {
  const [templates, setTemplates] = useState<NicheTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load templates on mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const data = await fetchNicheTemplates();
        setTemplates(data);
      } catch (error) {
        toast.error('Erro ao carregar templates');
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplates();
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NicheTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<NicheTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<NicheTemplate | null>(null);
  const [expandedFAQs, setExpandedFAQs] = useState(false);
  const [expandedVariables, setExpandedVariables] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    icon: '📋',
    category: '',
    description: '',
    promptTemplate: '',
    isActive: true,
  });
  const [formVariables, setFormVariables] = useState<NicheVariable[]>([]);
  const [formFAQs, setFormFAQs] = useState<NicheFAQ[]>([]);

  // Filtered templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      icon: '📋',
      category: '',
      description: '',
      promptTemplate: '',
      isActive: true,
    });
    setFormVariables([]);
    setFormFAQs([]);
    setExpandedFAQs(false);
    setExpandedVariables(false);
  };

  const openCreateModal = () => {
    resetForm();
    setEditingTemplate(null);
    setShowModal(true);
  };

  const openEditModal = (template: NicheTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      icon: template.icon,
      category: template.category,
      description: template.description,
      promptTemplate: template.promptTemplate,
      isActive: template.isActive,
    });
    setFormVariables([...template.variables]);
    setFormFAQs([...template.defaultFAQs]);
    setShowModal(true);
  };

  const openPreviewModal = (template: NicheTemplate) => {
    setPreviewTemplate(template);
    setShowPreviewModal(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.category || !formData.promptTemplate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    const now = new Date().toISOString();

    if (editingTemplate) {
      // Update existing
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id 
          ? {
              ...t,
              ...formData,
              variables: formVariables,
              defaultFAQs: formFAQs,
              updatedAt: now,
            }
          : t
      ));
      toast.success('Template atualizado com sucesso!');
    } else {
      // Create new
      const newTemplate: NicheTemplate = {
        id: `template-${Date.now()}`,
        ...formData,
        variables: formVariables,
        defaultFAQs: formFAQs,
        createdBy: 'superadmin',
        createdAt: now,
        updatedAt: now,
      };
      setTemplates(prev => [...prev, newTemplate]);
      toast.success('Template criado com sucesso!');
    }

    setShowModal(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!deletingTemplate) return;
    setTemplates(prev => prev.filter(t => t.id !== deletingTemplate.id));
    toast.success('Template excluído com sucesso!');
    setShowDeleteModal(false);
    setDeletingTemplate(null);
  };

  const toggleTemplateStatus = (template: NicheTemplate) => {
    setTemplates(prev => prev.map(t => 
      t.id === template.id ? { ...t, isActive: !t.isActive } : t
    ));
    toast.success(`Template ${template.isActive ? 'desativado' : 'ativado'}!`);
  };

  const duplicateTemplate = (template: NicheTemplate) => {
    const now = new Date().toISOString();
    const newTemplate: NicheTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Cópia)`,
      createdAt: now,
      updatedAt: now,
    };
    setTemplates(prev => [...prev, newTemplate]);
    toast.success('Template duplicado com sucesso!');
  };

  // Variable management
  const addVariable = () => {
    setFormVariables(prev => [...prev, {
      key: '',
      label: '',
      placeholder: '',
      description: '',
      type: 'text',
      required: true,
    }]);
  };

  const updateVariable = (index: number, field: keyof NicheVariable, value: string | boolean) => {
    setFormVariables(prev => prev.map((v, i) => 
      i === index ? { ...v, [field]: value } : v
    ));
  };

  const removeVariable = (index: number) => {
    setFormVariables(prev => prev.filter((_, i) => i !== index));
  };

  // FAQ management
  const addFAQ = () => {
    setFormFAQs(prev => [...prev, {
      id: `faq-${Date.now()}`,
      question: '',
      answer: '',
      category: '',
      isDefault: true,
    }]);
  };

  const updateFAQ = (index: number, field: keyof NicheFAQ, value: string | boolean) => {
    setFormFAQs(prev => prev.map((f, i) => 
      i === index ? { ...f, [field]: value } : f
    ));
  };

  const removeFAQ = (index: number) => {
    setFormFAQs(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <DashboardLayout>
      <Header />
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Templates de Nicho</h1>
            <p className="text-muted-foreground">Gerencie os templates de prompts e FAQs para cada nicho</p>
          </div>
          <Button onClick={openCreateModal} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Novo Template
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 bg-card border-border">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Templates Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-muted-foreground font-medium">Template</TableHead>
                <TableHead className="text-muted-foreground font-medium">Categoria</TableHead>
                <TableHead className="text-muted-foreground font-medium text-center">Tenants</TableHead>
                <TableHead className="text-muted-foreground font-medium text-center">Variáveis</TableHead>
                <TableHead className="text-muted-foreground font-medium text-center">FAQs</TableHead>
                <TableHead className="text-muted-foreground font-medium text-center">Status</TableHead>
                <TableHead className="text-muted-foreground font-medium text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-12 h-12 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Nenhum template encontrado</p>
                      <Button onClick={openCreateModal} variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Template
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTemplates.map((template) => (
                  <TableRow 
                    key={template.id} 
                    className="border-border hover:bg-muted/20 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{template.icon}</span>
                        <div>
                          <p className="font-medium text-foreground">{template.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{template.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                        {categories.find(c => c.value === template.category)?.label || template.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center justify-center gap-1.5 cursor-help">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground font-medium">{template.tenantsUsing || 0}</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs p-3">
                            {template.tenantNames && template.tenantNames.length > 0 ? (
                              <div className="space-y-1.5">
                                <p className="font-semibold text-xs text-muted-foreground mb-2">Tenants usando:</p>
                                {template.tenantNames.map((name, idx) => (
                                  <Link 
                                    key={idx} 
                                    to={`/tenants/${template.tenantIds?.[idx] || idx + 1}`}
                                    className="flex items-center gap-2 text-sm text-primary hover:underline py-0.5"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    {name}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">Nenhum tenant usando</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-foreground font-medium">{template.variables.length}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-foreground font-medium">{template.defaultFAQs.length}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusPill 
                        status={template.isActive ? 'success' : 'warning'} 
                        label={template.isActive ? 'Ativo' : 'Inativo'}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => openPreviewModal(template)}
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => openEditModal(template)}
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => duplicateTemplate(template)}
                          title="Duplicar"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-8 w-8 ${template.isActive ? 'text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10' : 'text-muted-foreground hover:text-green-500 hover:bg-green-500/10'}`}
                          onClick={() => toggleTemplateStatus(template)}
                          title={template.isActive ? 'Desativar' : 'Ativar'}
                        >
                          <Power className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => {
                            setDeletingTemplate(template);
                            setShowDeleteModal(true);
                          }}
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Create/Edit Modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Template' : 'Novo Template de Nicho'}
              </DialogTitle>
              <DialogDescription>
                {editingTemplate 
                  ? 'Atualize as informações do template' 
                  : 'Crie um novo template com prompt e FAQs padrão'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Template *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Academia de Jiu-Jitsu"
                    className="bg-background"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2">
                    <Label>Ícone</Label>
                    <Input
                      value={formData.icon}
                      onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                      placeholder="🥋"
                      className="bg-background text-center text-xl"
                      maxLength={2}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Categoria *</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descrição do template..."
                  className="bg-background"
                />
              </div>

              {/* Prompt Template */}
              <div className="space-y-2">
                <Label>Prompt do Sistema *</Label>
                <p className="text-xs text-muted-foreground">
                  Use {"{{variavel}}"} para criar campos customizáveis. Ex: {"{{nome_agente}}"}, {"{{nome_empresa}}"}
                </p>
                <Textarea
                  value={formData.promptTemplate}
                  onChange={(e) => setFormData(prev => ({ ...prev, promptTemplate: e.target.value }))}
                  placeholder="Digite o prompt do sistema..."
                  className="bg-background font-mono text-sm min-h-[200px]"
                />
              </div>

              {/* Variables Section */}
              <div className="space-y-3">
                <button 
                  onClick={() => setExpandedVariables(!expandedVariables)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Label className="cursor-pointer">Variáveis Customizáveis ({formVariables.length})</Label>
                  </div>
                  {expandedVariables ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {expandedVariables && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    {formVariables.map((variable, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-start p-3 bg-background rounded-lg">
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Chave</Label>
                          <Input
                            value={variable.key}
                            onChange={(e) => updateVariable(index, 'key', e.target.value)}
                            placeholder="nome_agente"
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-3 space-y-1">
                          <Label className="text-xs">Label</Label>
                          <Input
                            value={variable.label}
                            onChange={(e) => updateVariable(index, 'label', e.target.value)}
                            placeholder="Nome do Agente"
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-3 space-y-1">
                          <Label className="text-xs">Placeholder</Label>
                          <Input
                            value={variable.placeholder}
                            onChange={(e) => updateVariable(index, 'placeholder', e.target.value)}
                            placeholder="AKIRA"
                            className="text-sm"
                          />
                        </div>
                        <div className="col-span-2 space-y-1">
                          <Label className="text-xs">Tipo</Label>
                          <Select value={variable.type} onValueChange={(v) => updateVariable(index, 'type', v as 'text' | 'textarea')}>
                            <SelectTrigger className="text-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">Texto</SelectItem>
                              <SelectItem value="textarea">Área de Texto</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-1 space-y-1">
                          <Label className="text-xs">Obrig.</Label>
                          <div className="flex items-center h-9">
                            <Switch 
                              checked={variable.required}
                              onCheckedChange={(v) => updateVariable(index, 'required', v)}
                            />
                          </div>
                        </div>
                        <div className="col-span-1 flex items-end h-full">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:bg-destructive/10"
                            onClick={() => removeVariable(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addVariable} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar Variável
                    </Button>
                  </div>
                )}
              </div>

              {/* FAQs Section */}
              <div className="space-y-3">
                <button 
                  onClick={() => setExpandedFAQs(!expandedFAQs)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div className="flex items-center gap-2">
                    <Label className="cursor-pointer">FAQs Padrão ({formFAQs.length})</Label>
                  </div>
                  {expandedFAQs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {expandedFAQs && (
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    {formFAQs.map((faq, index) => (
                      <div key={index} className="p-3 bg-background rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-2">
                            <Input
                              value={faq.question}
                              onChange={(e) => updateFAQ(index, 'question', e.target.value)}
                              placeholder="Pergunta..."
                              className="text-sm"
                            />
                            <Textarea
                              value={faq.answer}
                              onChange={(e) => updateFAQ(index, 'answer', e.target.value)}
                              placeholder="Resposta..."
                              className="text-sm min-h-[60px]"
                            />
                            <Input
                              value={faq.category}
                              onChange={(e) => updateFAQ(index, 'category', e.target.value)}
                              placeholder="Categoria (ex: precos, horarios)"
                              className="text-sm"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => removeFAQ(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addFAQ} className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar FAQ
                    </Button>
                  </div>
                )}
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div>
                  <Label>Template Ativo</Label>
                  <p className="text-xs text-muted-foreground">Templates inativos não aparecem no onboarding</p>
                </div>
                <Switch 
                  checked={formData.isActive}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, isActive: v }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} className="bg-primary text-primary-foreground">
                {editingTemplate ? 'Salvar Alterações' : 'Criar Template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o template "{deletingTemplate?.name}"? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Excluir Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Preview Modal */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="text-2xl">{previewTemplate?.icon}</span>
                {previewTemplate?.name}
              </DialogTitle>
              <DialogDescription>{previewTemplate?.description}</DialogDescription>
            </DialogHeader>

            {previewTemplate && (
              <div className="space-y-6">
                {/* Variables */}
                <div>
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Variáveis ({previewTemplate.variables.length})
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {previewTemplate.variables.map((v, i) => (
                      <div key={i} className="p-2 bg-muted/30 rounded text-sm">
                        <span className="font-mono text-primary">{`{{${v.key}}}`}</span>
                        <span className="text-muted-foreground ml-2">- {v.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Prompt Preview */}
                <div>
                  <h4 className="font-medium text-foreground mb-3">Prompt do Sistema</h4>
                  <pre className="p-4 bg-muted/30 rounded-lg text-sm font-mono whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                    {previewTemplate.promptTemplate}
                  </pre>
                </div>

                {/* FAQs Preview */}
                <div>
                  <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    FAQs Padrão ({previewTemplate.defaultFAQs.length})
                  </h4>
                  <div className="space-y-2">
                    {previewTemplate.defaultFAQs.map((faq, i) => (
                      <div key={i} className="p-3 bg-muted/30 rounded-lg">
                        <p className="font-medium text-foreground text-sm">{faq.question}</p>
                        <p className="text-muted-foreground text-sm mt-1">{faq.answer}</p>
                        <Badge variant="outline" className="mt-2 text-xs">{faq.category}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                setShowPreviewModal(false);
                if (previewTemplate) openEditModal(previewTemplate);
              }}>
                <Pencil className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
