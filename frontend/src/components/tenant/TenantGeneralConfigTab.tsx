import { useState } from 'react';
import { 
  Plus,
  Trash2,
  Power,
  Calendar,
  Mail,
  RefreshCw,
  Loader2,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Mock WhatsApp instances
const mockWhatsAppInstances = [
  { id: '1', name: 'SIXBLADES-LO2', status: 'disconnected', phone: null },
  { id: '2', name: 'SIXBLADES-LO', status: 'connected', phone: '556194439915' },
];

export function TenantGeneralConfigTab() {
  // WhatsApp modal states
  const [showCreateInstanceModal, setShowCreateInstanceModal] = useState(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState(false);
  const [newInstanceName, setNewInstanceName] = useState('');
  const [newInstanceKey, setNewInstanceKey] = useState('');

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

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={['whatsapp', 'integracoes', 'google-calendar']} className="space-y-4">

        {/* WhatsApp Instances Section */}
        <AccordionItem value="whatsapp" className="bg-cs-bg-card border border-border rounded-xl overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-cs-bg-card-hover">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-cs-text-primary">Instâncias WhatsApp</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <p className="text-sm text-cs-text-secondary mb-4">
              Instâncias Evolution API conectadas a este tenant
            </p>

            {/* WhatsApp Instances List */}
            <div className="space-y-3 mb-4">
              {mockWhatsAppInstances.map((instance) => (
                <div key={instance.id} className="bg-cs-bg-primary border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-cs-text-primary">{instance.name}</h4>
                      <p className="text-sm text-cs-text-secondary">
                        Status: {' '}
                        <span className={instance.status === 'connected' ? 'text-cs-success' : 'text-cs-error'}>
                          {instance.status === 'connected' ? 'Conectado' : 'Desconectado'}
                        </span>
                      </p>
                      {instance.phone && (
                        <p className="text-sm text-cs-text-muted">{instance.phone}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {instance.status === 'connected' ? (
                        <Button variant="outline" size="sm" className="border-border text-cs-text-secondary">
                          <Power className="w-4 h-4 mr-2" />
                          Desconectar
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="border-primary text-primary hover:bg-primary/10"
                          onClick={() => setShowQRCodeModal(true)}
                        >
                          <Power className="w-4 h-4 mr-2" />
                          Conectar
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="border-destructive text-destructive hover:bg-destructive/10">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

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
              <Label>Nome da Instância</Label>
              <Input
                value={newInstanceName}
                onChange={(e) => setNewInstanceName(e.target.value)}
                placeholder="meu-whatsapp"
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Chave da Instância</Label>
              <Input
                value={newInstanceKey}
                onChange={(e) => setNewInstanceKey(e.target.value)}
                placeholder="chave-unica-123"
                className="bg-background"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateInstanceModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              toast.success('Instância criada! Escaneie o QR Code para conectar.');
              setShowCreateInstanceModal(false);
              setShowQRCodeModal(true);
            }}>
              Criar
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
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-48 h-48 bg-muted rounded-lg flex flex-col items-center justify-center border border-border">
              <Loader2 className="w-12 h-12 text-muted-foreground animate-spin" />
              <p className="text-sm text-muted-foreground mt-3">Gerando QR Code...</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={() => setShowQRCodeModal(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Overlap</Label>
                <Input
                  value={ragChunkOverlap}
                  onChange={(e) => setRagChunkOverlap(e.target.value)}
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label>Top K</Label>
                <Input
                  value={ragTopK}
                  onChange={(e) => setRagTopK(e.target.value)}
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
