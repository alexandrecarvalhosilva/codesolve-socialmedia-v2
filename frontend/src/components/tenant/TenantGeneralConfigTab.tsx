import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Plus,
  Trash2,
  Power,
  Calendar,
  Mail,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ExternalLink,
  QrCode,
  Smartphone,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { api, ApiError } from '@/lib/api';
import type { WhatsAppInstance } from '@/lib/apiTypes';

// ============================================================================
// TIPOS
// ============================================================================

interface InstancesResponse {
  instances: WhatsAppInstance[];
  meta?: {
    total: number;
  };
}

interface QRCodeResponse {
  qrCode: string;
  expiresAt: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function TenantGeneralConfigTab() {
  const { id: tenantId } = useParams();
  
  // WhatsApp instances state
  const [instances, setInstances] = useState<WhatsAppInstance[]>([]);
  const [isLoadingInstances, setIsLoadingInstances] = useState(true);
  
  // WhatsApp modal states
  const [showCreateInstanceModal, setShowCreateInstanceModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WhatsAppInstance | null>(null);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeExpiry, setQrCodeExpiry] = useState<string | null>(null);

  // MCP modal states
  const [showMcpModal, setShowMcpModal] = useState(false);
  const [mcpName, setMcpName] = useState('');
  const [mcpUrl, setMcpUrl] = useState('');
  const [mcpApiKey, setMcpApiKey] = useState('');
  const [mcpDescricao, setMcpDescricao] = useState('');

  // RAG modal states
  const [showRagModal, setShowRagModal] = useState(false);
  const [ragName, setRagName] = useState('');
  const [ragUrl, setRagUrl] = useState('');
  const [ragApiKey, setRagApiKey] = useState('');
  const [ragChunkSize, setRagChunkSize] = useState('1000');
  const [ragChunkOverlap, setRagChunkOverlap] = useState('200');
  const [ragTopK, setRagTopK] = useState('3');

  // ============================================================================
  // CARREGAR INSTÂNCIAS
  // ============================================================================

  const loadInstances = async () => {
    try {
      setIsLoadingInstances(true);
      const params: Record<string, any> = { limit: 100 };
      if (tenantId) params.tenantId = tenantId;
      
      const response = await api.get<InstancesResponse>('/api/whatsapp/instances', params);
      
      if (response.success && response.data) {
        setInstances(response.data.instances);
      }
    } catch (error) {
      const apiError = error as ApiError;
      console.error('Erro ao carregar instâncias:', apiError.message);
      toast.error('Erro ao carregar instâncias WhatsApp');
    } finally {
      setIsLoadingInstances(false);
    }
  };

  useEffect(() => {
    loadInstances();
  }, [tenantId]);

  // ============================================================================
  // HANDLERS WHATSAPP
  // ============================================================================

  const handleCreateInstance = async () => {
    if (!newInstanceName.trim()) {
      toast.error('Digite o nome da instância');
      return;
    }

    setIsCreating(true);
    
    try {
      const payload: Record<string, any> = {
        name: newInstanceName.trim(),
      };
      
      if (tenantId) {
        payload.tenantId = tenantId;
      }
      
      const response = await api.post<{ instance: WhatsAppInstance }>('/api/whatsapp/instances', payload);
      
      if (response.success && response.data) {
        toast.success('Instância criada! Agora conecte escaneando o QR Code.');
        setShowCreateInstanceModal(false);
        setNewInstanceName('');
        setSelectedInstance(response.data.instance);
        
        // Recarregar lista e abrir modal de QR Code
        await loadInstances();
        handleConnectInstance(response.data.instance);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao criar instância');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectInstance = async (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
    setIsConnecting(true);
    setQrCode(null);
    setShowQRCodeModal(true);
    
    try {
      const response = await api.post<QRCodeResponse>(`/api/whatsapp/instances/${instance.id}/connect`);
      
      if (response.success && response.data) {
        setQrCode(response.data.qrCode);
        setQrCodeExpiry(response.data.expiresAt);
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao gerar QR Code');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleRefreshQRCode = async () => {
    if (!selectedInstance) return;
    
    setIsConnecting(true);
    setQrCode(null);
    
    try {
      const response = await api.post<QRCodeResponse>(`/api/whatsapp/instances/${selectedInstance.id}/connect`);
      
      if (response.success && response.data) {
        setQrCode(response.data.qrCode);
        setQrCodeExpiry(response.data.expiresAt);
        toast.success('QR Code atualizado!');
      }
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao atualizar QR Code');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectInstance = async (instance: WhatsAppInstance) => {
    try {
      await api.post(`/api/whatsapp/instances/${instance.id}/disconnect`);
      toast.success('Instância desconectada!');
      await loadInstances();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao desconectar instância');
    }
  };

  const handleOpenDeleteDialog = (instance: WhatsAppInstance) => {
    setSelectedInstance(instance);
    setShowDeleteDialog(true);
  };

  const handleDeleteInstance = async () => {
    if (!selectedInstance) return;
    
    setIsDeleting(true);
    
    try {
      await api.delete(`/api/whatsapp/instances/${selectedInstance.id}`);
      toast.success('Instância removida com sucesso!');
      setShowDeleteDialog(false);
      setSelectedInstance(null);
      await loadInstances();
    } catch (error) {
      const apiError = error as ApiError;
      toast.error(apiError.message || 'Erro ao remover instância');
    } finally {
      setIsDeleting(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={['whatsapp', 'integracoes', 'google-calendar']} className="space-y-4">

        {/* WhatsApp Instances Section */}
        <AccordionItem value="whatsapp" className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-cs-bg-card-hover">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-cs-success" />
              <span className="font-semibold text-cs-text-primary">Instâncias WhatsApp</span>
              {!isLoadingInstances && (
                <span className="text-sm text-cs-text-muted">({instances.length})</span>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-sm text-cs-text-secondary mb-4">
              Instâncias Evolution API conectadas a este tenant
            </p>

            {/* Loading State */}
            {isLoadingInstances ? (
              <div className="space-y-3 mb-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-cs-bg-primary border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-9 w-28" />
                        <Skeleton className="h-9 w-24" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : instances.length === 0 ? (
              <div className="bg-cs-bg-primary border border-border rounded-lg p-8 text-center mb-4">
                <Smartphone className="w-12 h-12 text-cs-text-muted mx-auto mb-3" />
                <p className="text-cs-text-secondary font-medium">Nenhuma instância WhatsApp</p>
                <p className="text-sm text-cs-text-muted">Adicione uma instância para conectar seu número</p>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {instances.map((instance) => (
                  <div key={instance.id} className="bg-cs-bg-primary border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-cs-text-primary">{instance.name}</h4>
                        <p className="text-sm text-cs-text-secondary">
                          Status: {' '}
                          <span className={instance.status === 'connected' ? 'text-cs-success' : 'text-cs-error'}>
                            {instance.status === 'connected' ? 'Conectado' : 
                             instance.status === 'connecting' ? 'Conectando...' : 'Desconectado'}
                          </span>
                        </p>
                        {instance.phoneNumber && (
                          <p className="text-sm text-cs-text-muted">{instance.phoneNumber}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {instance.status === 'connected' ? (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-border text-cs-text-secondary"
                            onClick={() => handleDisconnectInstance(instance)}
                          >
                            <Power className="w-4 h-4 mr-2" />
                            Desconectar
                          </Button>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-primary text-primary hover:bg-primary/10"
                            onClick={() => handleConnectInstance(instance)}
                          >
                            <QrCode className="w-4 h-4 mr-2" />
                            Conectar
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-destructive text-destructive hover:bg-destructive/10"
                          onClick={() => handleOpenDeleteDialog(instance)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Button 
              className="w-full bg-cs-bg-primary border border-primary text-primary hover:bg-primary/10"
              onClick={() => setShowCreateInstanceModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Instância
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* Integrations Section */}
        <AccordionItem value="integracoes" className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-cs-bg-card-hover">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-cs-text-primary">Integrações (MCP + RAG)</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-6">
            {/* MCP */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-cs-text-primary">MCP (Model Context Protocol)</h4>
                  <p className="text-sm text-cs-text-secondary">Gerencie as configurações de MCP para este tenant</p>
                </div>
                <Button onClick={() => setShowMcpModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar MCP
                </Button>
              </div>
              <div className="bg-cs-bg-primary rounded-lg p-8 text-center">
                <p className="text-cs-text-muted">Nenhum MCP configurado para este tenant.</p>
                <p className="text-sm text-cs-text-muted">Clique em "Adicionar MCP" para começar.</p>
              </div>
            </div>

            {/* RAG */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-medium text-cs-text-primary">RAG (Retrieval-Augmented Generation)</h4>
                  <p className="text-sm text-cs-text-secondary">Gerencie as configurações de RAG para este tenant</p>
                </div>
                <Button onClick={() => setShowRagModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar RAG
                </Button>
              </div>
              <div className="bg-cs-bg-primary rounded-lg p-8 text-center">
                <p className="text-cs-text-muted">Nenhum RAG configurado para este tenant.</p>
                <p className="text-sm text-cs-text-muted">Clique em "Adicionar RAG" para começar.</p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Google Calendar Section */}
        <AccordionItem value="google-calendar" className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-cs-bg-card-hover">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-cs-text-primary">Google Calendar</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h4 className="font-medium text-cs-text-primary">Integração Google Calendar</h4>
              </div>
              <p className="text-sm text-cs-text-secondary">
                Sincronize eventos automaticamente entre seu sistema e Google Calendar
              </p>
            </div>

            {/* Etapa 1 */}
            <div className="border-l-2 border-primary pl-4">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-cs-text-primary">Etapa 1: Configurar Credenciais Google OAuth</h5>
                <Button variant="outline" size="sm" className="text-primary border-primary">
                  Configurado
                </Button>
              </div>
              <p className="text-sm text-cs-text-muted">Cada tenant precisa de suas próprias credenciais do Google Cloud Console</p>
              <p className="text-sm text-cs-success mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Credenciais configuradas com sucesso
              </p>
            </div>

            {/* Etapa 2 */}
            <div className="border-l-2 border-cs-success pl-4">
              <div className="flex items-center justify-between">
                <h5 className="font-medium text-cs-text-primary">Etapa 2: Conectar ao Google Calendar</h5>
                <Button variant="outline" size="sm" className="text-cs-success border-cs-success">
                  Conectado
                </Button>
              </div>
              <p className="text-sm text-cs-text-muted">Autorize o acesso ao seu Google Calendar</p>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-cs-success text-sm">
                  <span className="w-2 h-2 rounded-full bg-cs-success" />
                  Conectado
                </div>
                <div className="flex items-center gap-2 text-sm text-cs-text-secondary">
                  <Mail className="w-4 h-4" />
                  sixbladeslagooeste@gmail.com
                </div>
                <p className="text-xs text-cs-text-muted">Última sincronização: 18/01/2026, 14:47:27</p>
              </div>

              <div className="flex items-center justify-between mt-4">
                <div>
                  <p className="text-sm font-medium text-cs-text-primary">Sincronização Automática</p>
                  <p className="text-xs text-cs-text-muted">Sincronizar eventos automaticamente em tempo real</p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button className="w-full mt-4" variant="destructive">
                Desconectar do Google Calendar
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Create WhatsApp Instance Modal */}
      <Dialog open={showCreateInstanceModal} onOpenChange={setShowCreateInstanceModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Instância WhatsApp</DialogTitle>
            <DialogDescription>
              Crie uma nova instância para conectar seu número
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Instância *</Label>
              <Input
                value={newInstanceName}
                onChange={(e) => setNewInstanceName(e.target.value)}
                placeholder="meu-whatsapp"
                className="bg-background"
              />
              <p className="text-xs text-muted-foreground">
                Use um nome único para identificar esta instância
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCreateInstanceModal(false)}
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateInstance}
              disabled={isCreating || !newInstanceName.trim()}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code Scanner Modal */}
      <Dialog open={showQRCodeModal} onOpenChange={setShowQRCodeModal}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Escanear QR Code</DialogTitle>
            <DialogDescription>
              Abra o WhatsApp no seu celular e escaneie este QR Code para conectar
              {selectedInstance && (
                <span className="block mt-1 font-medium text-foreground">
                  Instância: {selectedInstance.name}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-8">
            {isConnecting ? (
              <div className="w-64 h-64 bg-muted rounded-lg flex flex-col items-center justify-center border border-border">
                <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground mt-3">Gerando QR Code...</p>
              </div>
            ) : qrCode ? (
              <div className="space-y-4">
                <div className="w-64 h-64 bg-white rounded-lg flex items-center justify-center p-4">
                  <img 
                    src={qrCode} 
                    alt="QR Code WhatsApp" 
                    className="w-full h-full object-contain"
                  />
                </div>
                {qrCodeExpiry && (
                  <p className="text-xs text-center text-muted-foreground">
                    Expira em: {new Date(qrCodeExpiry).toLocaleTimeString('pt-BR')}
                  </p>
                )}
              </div>
            ) : (
              <div className="w-64 h-64 bg-muted rounded-lg flex flex-col items-center justify-center border border-border">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <p className="text-sm text-muted-foreground mt-3">Erro ao gerar QR Code</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={handleRefreshQRCode}
                >
                  Tentar novamente
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleRefreshQRCode}
              disabled={isConnecting}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="outline" onClick={() => {
              setShowQRCodeModal(false);
              setQrCode(null);
              setSelectedInstance(null);
              loadInstances(); // Recarregar para ver se conectou
            }}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Instância</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover a instância "{selectedInstance?.name}"? 
              Esta ação não pode ser desfeita e a conexão com o WhatsApp será perdida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInstance}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* MCP Modal */}
      <Dialog open={showMcpModal} onOpenChange={setShowMcpModal}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar MCP</DialogTitle>
            <DialogDescription>
              Configure uma integração MCP (Model Context Protocol)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={mcpName}
                onChange={(e) => setMcpName(e.target.value)}
                placeholder="Nome do MCP"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={mcpUrl}
                onChange={(e) => setMcpUrl(e.target.value)}
                placeholder="https://..."
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                value={mcpApiKey}
                onChange={(e) => setMcpApiKey(e.target.value)}
                type="password"
                placeholder="Chave de API"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={mcpDescricao}
                onChange={(e) => setMcpDescricao(e.target.value)}
                placeholder="Descrição do MCP..."
                className="bg-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMcpModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('MCP adicionado com sucesso!');
              setShowMcpModal(false);
            }}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* RAG Modal */}
      <Dialog open={showRagModal} onOpenChange={setShowRagModal}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Adicionar RAG</DialogTitle>
            <DialogDescription>
              Configure uma integração RAG (Retrieval-Augmented Generation)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={ragName}
                onChange={(e) => setRagName(e.target.value)}
                placeholder="Nome do RAG"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={ragUrl}
                onChange={(e) => setRagUrl(e.target.value)}
                placeholder="https://..."
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                value={ragApiKey}
                onChange={(e) => setRagApiKey(e.target.value)}
                type="password"
                placeholder="Chave de API"
                className="bg-background"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Chunk Size</Label>
                <Input
                  value={ragChunkSize}
                  onChange={(e) => setRagChunkSize(e.target.value)}
                  placeholder="1000"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Overlap</Label>
                <Input
                  value={ragChunkOverlap}
                  onChange={(e) => setRagChunkOverlap(e.target.value)}
                  placeholder="200"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Top K</Label>
                <Input
                  value={ragTopK}
                  onChange={(e) => setRagTopK(e.target.value)}
                  placeholder="3"
                  className="bg-background"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRagModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('RAG adicionado com sucesso!');
              setShowRagModal(false);
            }}>
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
