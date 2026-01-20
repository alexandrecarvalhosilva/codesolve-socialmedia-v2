import { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Users,
  Bell,
  BellOff,
  Volume2,
  VolumeX,
  Download,
  Trash2,
  List,
  Send,
  Paperclip,
  Smile,
  Mic,
  MoreVertical,
  Bot,
  UserPlus,
  Phone,
  Video,
  Image,
  File,
  Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusFilters = ['Todas', 'Não atribuídas', 'Minhas', 'IA Ativa', 'IA Inativa'];
const typeFilters = ['Todos', 'Grupos', 'Contatos'];

const whatsappAccounts = [
  { id: '1', name: 'SIXBLADES-LO2', active: true },
  { id: '2', name: 'SIXBLADES-LO', active: true },
];

interface Message {
  id: string;
  content: string;
  timestamp: string;
  sender: 'user' | 'contact';
  status?: 'sent' | 'delivered' | 'read';
  isAI?: boolean;
}

interface Conversation {
  id: string;
  name: string;
  initials: string;
  color: string;
  lastMessage: string;
  time: string;
  unread: number;
  type: 'contato' | 'grupo';
  status: 'ia_ativa' | 'ia_inativa' | 'nao_atribuida' | 'minhas';
  assigned: 'me' | 'other' | null;
  whatsapp: string;
  isGroup: boolean;
  online?: boolean;
  attendedBy?: string;
  messages: Message[];
}

// Mock conversations with messages
const mockConversations: Conversation[] = [
  { 
    id: '1', 
    name: 'Alexandre Carvalho', 
    initials: 'AC',
    color: 'bg-amber-500',
    lastMessage: 'pode me passar informações sobre os horários?',
    time: 'há 2 dias',
    unread: 57,
    type: 'contato',
    status: 'ia_ativa',
    assigned: 'me',
    whatsapp: 'SIXBLADES-LO2',
    isGroup: false,
    online: true,
    attendedBy: 'Super Admin',
    messages: [
      { id: '1', content: 'Ola', timestamp: '23:16:56', sender: 'contact' },
      { id: '2', content: 'Olá! Como posso te ajudar hoje? 😊', timestamp: '23:17:31', sender: 'user', isAI: true },
      { id: '3', content: 'Bom dia !!', timestamp: '12:54:48', sender: 'contact' },
      { id: '4', content: 'Tudo bem com vc?', timestamp: '12:54:54', sender: 'contact' },
      { id: '5', content: 'pode me passar informações sobre os horários?', timestamp: '12:55:06', sender: 'contact' },
      { id: '6', content: 'Bom dia! 😊 Como posso ajudar você hoje?', timestamp: '12:55:07', sender: 'user', isAI: true },
      { id: '7', content: 'Tudo ótimo, obrigado por perguntar! E você, como está? Se precisar de alguma informação sobre a academia, é só me avisar! 😊', timestamp: '12:55:09', sender: 'user', isAI: true },
      { id: '8', content: 'Claro! Aqui estão os horários das aulas:\n\n**Treinos:**\n- **Kids:** Segunda, quarta e sexta, das 19:00 às 20:00.\n- **Adulto:** Segunda a sábado\n  - Manhã: 06:15 às 07:15\n  - Noite: 20:00 às 21:00', timestamp: '12:55:15', sender: 'user', isAI: true },
    ]
  },
  { 
    id: '2', 
    name: 'Sixblades kids', 
    initials: 'SK',
    color: 'bg-purple-500',
    lastMessage: 'Tudo bem?',
    time: 'há 3 dias',
    unread: 1,
    type: 'grupo',
    status: 'nao_atribuida',
    assigned: null,
    whatsapp: 'SIXBLADES-LO2',
    isGroup: true,
    online: false,
    messages: [
      { id: '1', content: 'Olá pessoal!', timestamp: '10:00:00', sender: 'contact' },
      { id: '2', content: 'Tudo bem?', timestamp: '10:01:00', sender: 'contact' },
    ]
  },
  { 
    id: '3', 
    name: 'SIX BLADES - Lago Oeste - Admin', 
    initials: 'SB',
    color: 'bg-purple-500',
    lastMessage: 'Confirmado',
    time: 'há 3 dias',
    unread: 1,
    type: 'grupo',
    status: 'ia_ativa',
    assigned: null,
    whatsapp: 'SIXBLADES-LO',
    isGroup: true,
    online: false,
    messages: [
      { id: '1', content: 'Reunião confirmada para amanhã', timestamp: '14:00:00', sender: 'user' },
      { id: '2', content: 'Confirmado', timestamp: '14:05:00', sender: 'contact' },
    ]
  },
  { 
    id: '4', 
    name: 'Angelo Irulegui', 
    initials: 'AI',
    color: 'bg-orange-500',
    lastMessage: 'Obrigado pelo atendimento',
    time: 'há 3 dias',
    unread: 6,
    type: 'contato',
    status: 'ia_ativa',
    assigned: 'me',
    whatsapp: 'SIXBLADES-LO2',
    isGroup: false,
    online: false,
    messages: [
      { id: '1', content: 'Preciso de informações', timestamp: '09:00:00', sender: 'contact' },
      { id: '2', content: 'Claro! Como posso ajudar?', timestamp: '09:01:00', sender: 'user', isAI: true },
      { id: '3', content: 'Obrigado pelo atendimento', timestamp: '09:10:00', sender: 'contact' },
    ]
  },
  { 
    id: '5', 
    name: 'João Silva', 
    initials: 'JS',
    color: 'bg-green-600',
    lastMessage: 'Vamos marcar?',
    time: 'há 3 dias',
    unread: 4,
    type: 'contato',
    status: 'minhas',
    assigned: 'me',
    whatsapp: 'SIXBLADES-LO',
    isGroup: false,
    online: true,
    messages: [
      { id: '1', content: 'E aí, tudo certo?', timestamp: '15:00:00', sender: 'contact' },
      { id: '2', content: 'Vamos marcar?', timestamp: '15:01:00', sender: 'contact' },
    ]
  },
  { 
    id: '6', 
    name: 'Suporte Técnico', 
    initials: 'ST',
    color: 'bg-purple-500',
    lastMessage: 'Ticket resolvido',
    time: 'há 3 dias',
    unread: 10,
    type: 'grupo',
    status: 'nao_atribuida',
    assigned: null,
    whatsapp: 'SIXBLADES-LO',
    isGroup: true,
    online: false,
    messages: [
      { id: '1', content: 'Novo ticket aberto', timestamp: '11:00:00', sender: 'contact' },
      { id: '2', content: 'Ticket resolvido', timestamp: '11:30:00', sender: 'user' },
    ]
  },
];

const mockContacts = [
  { id: '1', name: 'Alunos Descomplica OBS Studio 2', phone: '120363402370399241' },
  { id: '2', name: 'Sixblades kids', phone: '556198597130-1538525371' },
  { id: '3', name: 'Graduação e Confra da Six LO', phone: '120363421974546754' },
  { id: '4', name: 'SIX BLADES - Lago Oeste - Admin', phone: '120363267762999941' },
  { id: '5', name: 'Black Shark - Muay Thai', phone: '120363352077258510' },
  { id: '6', name: 'Cacau Entrega', phone: 'cmkfyn8ua0bq5qf4xmng1pexs' },
  { id: '7', name: 'Concierge Rede D\'Or Marcar Consulta', phone: 'cmkfyn8ua0bq1qf4x9ckvtk4c' },
  { id: '8', name: 'Rodrigo Centro', phone: 'cmkfyn8ub0bslqf4xnzgnrgz2' },
  { id: '9', name: 'Rafael Da Maia Udv', phone: 'cmkfyn8ub0brfqf4x7yzbbnnd' },
  { id: '10', name: 'SEDE - DIOGO', phone: 'cmkfyn8ub0br7qf4xo893bopb' },
];

const mockListas = [
  { id: '1', name: 'Teste lista', count: 2 },
  { id: '2', name: 'Leads Quentes VIP', count: 2 },
  { id: '3', name: 'Clientes VIP', count: 1 },
];

// Simple notification sound using Web Audio API
const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.4);
  } catch (e) {
    console.log('Audio not supported');
  }
};

// Simple bell sound
const playBellSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(600, audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  } catch (e) {
    console.log('Audio not supported');
  }
};

export function TenantChatTab() {
  const [selectedStatus, setSelectedStatus] = useState('Todas');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedWhatsApps, setSelectedWhatsApps] = useState<string[]>(whatsappAccounts.map(w => w.name));
  const [activeTab, setActiveTab] = useState('mensagens');
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [isAIActive, setIsAIActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Notification and sound toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  // Filter conversations based on selected filters
  const filteredConversations = conversations.filter(conv => {
    // Status filter
    if (selectedStatus !== 'Todas') {
      if (selectedStatus === 'Não atribuídas' && conv.status !== 'nao_atribuida') return false;
      if (selectedStatus === 'Minhas' && conv.assigned !== 'me') return false;
      if (selectedStatus === 'IA Ativa' && conv.status !== 'ia_ativa') return false;
      if (selectedStatus === 'IA Inativa' && conv.status !== 'ia_inativa') return false;
    }
    
    // Type filter
    if (selectedType !== 'Todos') {
      if (selectedType === 'Grupos' && !conv.isGroup) return false;
      if (selectedType === 'Contatos' && conv.isGroup) return false;
    }
    
    // WhatsApp account filter
    if (selectedWhatsApps.length > 0 && !selectedWhatsApps.includes(conv.whatsapp)) {
      return false;
    }
    
    return true;
  });

  // Calculate total unread from filtered conversations
  const totalUnread = filteredConversations.reduce((sum, conv) => sum + conv.unread, 0);

  const filteredContacts = mockContacts.filter(contact =>
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.phone.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const handleSelectAll = () => {
    if (selectedContacts.length === filteredContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(filteredContacts.map(c => c.id));
    }
  };

  const handleSelectContact = (contactId: string) => {
    setSelectedContacts(prev =>
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleImportSelected = () => {
    // TODO: Implementar importação real de contatos via API
    toast.success(`${selectedContacts.length} contato(s) importado(s) com sucesso`);
  };

  const toggleWhatsApp = (whatsappName: string) => {
    setSelectedWhatsApps(prev => {
      if (prev.includes(whatsappName)) {
        if (prev.length === 1) return prev;
        return prev.filter(w => w !== whatsappName);
      } else {
        return [...prev, whatsappName];
      }
    });
  };

  const toggleNotifications = () => {
    const newState = !notificationsEnabled;
    setNotificationsEnabled(newState);
    if (newState) {
      playBellSound();
      toast.success('Notificações ativadas');
    } else {
      toast.info('Notificações desativadas');
    }
  };

  const toggleSound = () => {
    const newState = !soundEnabled;
    setSoundEnabled(newState);
    if (newState) {
      playNotificationSound();
      toast.success('Som ativado');
    } else {
      toast.info('Som desativado');
    }
  };

  const handleConversationClick = (conv: Conversation) => {
    setSelectedConversation(conv);
    setIsAIActive(conv.status === 'ia_ativa');
    // Clear unread count
    setConversations(prev => 
      prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c)
    );
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: String(Date.now()),
      content: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sender: 'user',
      status: 'sent',
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConversation.id
          ? { ...c, messages: [...c.messages, newMessage], lastMessage: messageInput.trim() }
          : c
      )
    );

    setSelectedConversation(prev =>
      prev ? { ...prev, messages: [...prev.messages, newMessage] } : null
    );

    setMessageInput('');

    if (soundEnabled) {
      playNotificationSound();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleAI = () => {
    setIsAIActive(!isAIActive);
    toast.success(isAIActive ? 'IA desativada para esta conversa' : 'IA ativada para esta conversa');
  };

  const handleDeleteConversation = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== convId));
    if (selectedConversation?.id === convId) {
      setSelectedConversation(null);
    }
    toast.success('Conversa removida');
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-cs-bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-center mb-4">
          <Button variant="ghost" className="text-cs-text-secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-cs-text-secondary">Status:</span>
          {statusFilters.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedStatus(status)}
              className={selectedStatus === status 
                ? 'bg-cs-cyan text-white' 
                : 'border-border text-cs-text-secondary hover:text-cs-text-primary'
              }
            >
              {status}
            </Button>
          ))}

          <span className="text-sm text-cs-text-secondary ml-4">Tipo:</span>
          {typeFilters.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
              className={selectedType === type 
                ? 'bg-cs-cyan text-white' 
                : 'border-border text-cs-text-secondary hover:text-cs-text-primary'
              }
            >
              {type}
            </Button>
          ))}

          <span className="text-sm text-cs-text-secondary ml-4">WhatsApp:</span>
          {whatsappAccounts.map((account) => (
            <Button
              key={account.id}
              variant="outline"
              size="sm"
              onClick={() => toggleWhatsApp(account.name)}
              className={`${
                selectedWhatsApps.includes(account.name)
                  ? 'border-cs-success bg-cs-success/10'
                  : 'border-border opacity-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full mr-2 ${
                selectedWhatsApps.includes(account.name) ? 'bg-cs-success' : 'bg-gray-400'
              }`} />
              <span className="text-sm text-cs-text-primary">{account.name}</span>
            </Button>
          ))}

          <div className="flex items-center gap-2 ml-auto">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleNotifications}
              className={`transition-colors ${
                notificationsEnabled 
                  ? 'text-cs-cyan hover:text-cs-cyan/80' 
                  : 'text-cs-text-muted hover:text-cs-text-primary'
              }`}
              title={notificationsEnabled ? 'Desativar notificações' : 'Ativar notificações'}
            >
              {notificationsEnabled ? (
                <Bell className="w-4 h-4" />
              ) : (
                <BellOff className="w-4 h-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSound}
              className={`transition-colors ${
                soundEnabled 
                  ? 'text-cs-cyan hover:text-cs-cyan/80' 
                  : 'text-cs-text-muted hover:text-cs-text-primary'
              }`}
              title={soundEnabled ? 'Desativar som' : 'Ativar som'}
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area - Responsive height based on viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[calc(100vh-320px)] min-h-[400px] max-h-[800px] bg-cs-bg-card border border-border rounded-xl overflow-hidden">
        {/* Conversations/Contacts List - Independent scroll */}
        <div className="border-r border-border flex flex-col bg-cs-bg-primary/50 h-full overflow-hidden">
          <div className="p-3 border-b border-border">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-cs-bg-primary">
                <TabsTrigger 
                  value="mensagens" 
                  className="flex-1 data-[state=active]:bg-cs-bg-card"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Mensagens
                </TabsTrigger>
                <TabsTrigger 
                  value="contatos" 
                  className="flex-1 data-[state=active]:bg-cs-bg-card"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Contatos
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {activeTab === 'mensagens' ? (
            <>
              <div className="p-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cs-text-muted" />
                  <span className="text-sm text-cs-text-primary font-medium">
                    Conversas ({filteredConversations.length})
                  </span>
                  {totalUnread > 0 && (
                    <span className="bg-cs-error text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      {totalUnread}
                    </span>
                  )}
                </div>
              </div>
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="space-y-0">
                  {filteredConversations.length > 0 ? (
                    filteredConversations.map((conv) => (
                      <div key={conv.id}>
                        <div
                          className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-border/50 ${
                            selectedConversation?.id === conv.id
                              ? 'bg-purple-500/20'
                              : 'hover:bg-cs-bg-card'
                          }`}
                          onClick={() => handleConversationClick(conv)}
                        >
                          <div className="relative flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full ${conv.color} flex items-center justify-center text-white font-medium text-sm`}>
                              {conv.initials}
                            </div>
                            {conv.isGroup && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cs-success rounded-full flex items-center justify-center border-2 border-cs-bg-primary">
                                <span className="text-[10px] text-primary-foreground font-bold">G</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-cs-text-primary font-medium truncate">
                                {conv.name}
                              </p>
                              {conv.unread > 0 && (
                                <span className="bg-cs-success text-white text-xs min-w-[24px] h-6 px-1.5 rounded-full flex items-center justify-center font-medium">
                                  {conv.unread}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-cs-text-muted truncate mt-0.5">{conv.lastMessage}</p>
                            <p className="text-xs text-cs-text-muted/70 mt-0.5">{conv.time}</p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-cs-bg-primary/30">
                          <button 
                            className="flex items-center gap-1 text-xs text-cs-text-muted hover:text-cs-error transition-colors"
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                          >
                            <Trash2 className="w-3 h-3" />
                            Deletar
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-cs-text-muted p-8">
                      <p className="text-sm text-center">Nenhuma conversa encontrada com os filtros selecionados</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              {/* Contacts Tab */}
              <div className="p-3 border-b border-border space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-text-muted" />
                  <Input
                    placeholder="Pesquisar contatos..."
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    className="pl-9 bg-cs-bg-primary border-border text-cs-text-primary"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-cs-text-muted data-[state=checked]:bg-cs-cyan data-[state=checked]:border-cs-cyan"
                    />
                    <span className="text-sm text-cs-text-secondary">
                      Selecionar todos
                    </span>
                  </div>
                  {selectedContacts.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handleImportSelected}
                      className="bg-cs-cyan hover:bg-cs-cyan/90 text-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Importar ({selectedContacts.length})
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-cs-text-muted" />
                  <span className="text-sm text-cs-text-primary font-medium">
                    Contatos ({filteredContacts.length})
                  </span>
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="px-3 pb-3 space-y-1">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedContacts.includes(contact.id)
                          ? 'bg-cs-cyan/20 border border-cs-cyan/50'
                          : 'hover:bg-cs-bg-primary'
                      }`}
                      onClick={() => handleSelectContact(contact.id)}
                    >
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={() => handleSelectContact(contact.id)}
                        className="border-cs-text-muted data-[state=checked]:bg-cs-cyan data-[state=checked]:border-cs-cyan"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-cs-text-primary font-medium truncate">
                          {contact.name}
                        </p>
                        <p className="text-xs text-cs-text-muted truncate">
                          {contact.phone}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        {/* Chat Area - Independent scroll */}
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          {activeTab === 'contatos' ? (
            <>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <List className="w-4 h-4 text-cs-text-muted" />
                  <span className="text-sm text-cs-text-primary font-medium">
                    Listas ({mockListas.length})
                  </span>
                </div>
                <Button size="sm" className="bg-cs-cyan hover:bg-cs-cyan/90 text-white">
                  + Criar Lista
                </Button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-2">
                  {mockListas.map((lista) => (
                    <div
                      key={lista.id}
                      className="p-3 rounded-lg border border-border hover:bg-cs-bg-primary cursor-pointer transition-colors"
                    >
                      <p className="text-sm text-cs-text-primary font-medium">{lista.name}</p>
                      <p className="text-xs text-cs-text-muted">{lista.count} contatos</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-cs-bg-card">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full ${selectedConversation.color} flex items-center justify-center text-white font-medium`}>
                      {selectedConversation.initials}
                    </div>
                    {selectedConversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-cs-success rounded-full border-2 border-cs-bg-card" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-cs-text-primary">
                        🔔 {selectedConversation.name} 🔔
                      </h3>
                      {selectedConversation.online && (
                        <span className="flex items-center gap-1 text-xs text-cs-success">
                          <span className="w-2 h-2 rounded-full bg-cs-success" />
                          online
                        </span>
                      )}
                    </div>
                    {selectedConversation.attendedBy && (
                      <p className="text-xs text-cs-text-muted">
                        Atendido por {selectedConversation.attendedBy}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAI}
                    className={`gap-2 ${
                      isAIActive 
                        ? 'bg-purple-500/20 border-purple-500 text-purple-400' 
                        : 'border-border text-cs-text-muted'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    IA {isAIActive ? 'Ativa' : 'Inativa'}
                  </Button>
                  <Button variant="ghost" size="icon" className="text-cs-text-muted hover:text-cs-text-primary">
                    <UserPlus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 overflow-y-auto bg-gradient-to-b from-cs-bg-primary to-cs-bg-card">
                <div className="p-4 space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className="flex items-end gap-2 max-w-[70%]">
                        {message.sender === 'contact' && (
                          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-xs flex-shrink-0">
                            ??
                          </div>
                        )}
                        <div
                          className={`relative px-4 py-2 rounded-2xl ${
                            message.sender === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-br-sm'
                              : 'bg-cs-bg-card border border-border text-cs-text-primary rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className={`flex items-center gap-1 mt-1 ${
                            message.sender === 'user' ? 'justify-end' : 'justify-start'
                          }`}>
                            <span className="text-[10px] opacity-70">{message.timestamp}</span>
                          </div>
                        </div>
                        {message.sender === 'user' && message.isAI && (
                          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                            <Bot className="w-3 h-3 text-accent-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-cs-bg-card">
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-cs-text-muted hover:text-cs-text-primary flex-shrink-0">
                        <Paperclip className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-cs-bg-card border-border">
                      <DropdownMenuItem className="text-cs-text-primary hover:bg-cs-bg-primary">
                        <Image className="w-4 h-4 mr-2" /> Imagem
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-cs-text-primary hover:bg-cs-bg-primary">
                        <File className="w-4 h-4 mr-2" /> Documento
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-cs-text-primary hover:bg-cs-bg-primary">
                        <Camera className="w-4 h-4 mr-2" /> Câmera
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <div className="flex-1 relative">
                    <Input
                      placeholder="Digite uma mensagem..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-cs-bg-primary border-border text-cs-text-primary pr-10 rounded-full"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-cs-text-muted hover:text-cs-text-primary h-8 w-8"
                    >
                      <Smile className="w-5 h-5" />
                    </Button>
                  </div>

                  {messageInput.trim() ? (
                    <Button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90 rounded-full w-10 h-10 p-0 flex-shrink-0"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="text-cs-text-muted hover:text-cs-text-primary rounded-full w-10 h-10 p-0 flex-shrink-0"
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-cs-bg-primary/50">
              <div className="text-center">
                <div className="w-20 h-20 bg-cs-bg-card rounded-2xl flex items-center justify-center mx-auto mb-4 border border-border">
                  <MessageSquare className="w-10 h-10 text-cs-text-muted" />
                </div>
                <h3 className="text-lg font-medium text-cs-text-primary mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-cs-text-muted text-sm">
                  Escolha uma conversa da lista para começar a conversar
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
