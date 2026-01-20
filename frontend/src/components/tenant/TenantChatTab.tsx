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
  Bot,
  UserPlus,
  Image,
  File,
  Camera,
  Loader2,
  RefreshCw
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
import { useConversations, useMessages, useSendMessage, useDeleteConversation, useMarkMessagesAsRead } from '@/hooks/useChat';
import { useWhatsappInstances } from '@/hooks/useWhatsApp';
import type { Conversation, Message, ConversationStatus } from '@/lib/apiTypes';

const statusFilters = ['Todas', 'Abertas', 'Pendentes', 'Resolvidas', 'Fechadas'];
const typeFilters = ['Todos', 'WhatsApp', 'Instagram'];

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

// Helper para gerar iniciais
const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

// Helper para gerar cor baseada no nome
const getColorFromName = (name: string) => {
  const colors = [
    'bg-amber-500', 'bg-purple-500', 'bg-green-500', 'bg-blue-500',
    'bg-pink-500', 'bg-orange-500', 'bg-cyan-500', 'bg-red-500'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

// Helper para formatar tempo relativo
const formatRelativeTime = (dateString: string | undefined) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
  return date.toLocaleDateString('pt-BR');
};

// Mapear status do backend para filtros
const statusMap: Record<string, ConversationStatus> = {
  'Abertas': 'open',
  'Pendentes': 'pending',
  'Resolvidas': 'resolved',
  'Fechadas': 'closed',
};

export function TenantChatTab() {
  const [selectedStatus, setSelectedStatus] = useState('Todas');
  const [selectedType, setSelectedType] = useState('Todos');
  const [selectedWhatsApps, setSelectedWhatsApps] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('mensagens');
  const [contactSearch, setContactSearch] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [isAIActive, setIsAIActive] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Notification and sound toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // API Hooks
  const { 
    conversations, 
    isLoading: isLoadingConversations, 
    refetch: refetchConversations,
    meta: conversationsMeta 
  } = useConversations({
    status: selectedStatus !== 'Todas' ? statusMap[selectedStatus] : undefined,
    channel: selectedType === 'WhatsApp' ? 'whatsapp' : selectedType === 'Instagram' ? 'instagram' : undefined,
    whatsappInstanceId: selectedWhatsApps.length === 1 ? selectedWhatsApps[0] : undefined,
    limit: 50,
  });

  const { 
    messages, 
    isLoading: isLoadingMessages, 
    refetch: refetchMessages 
  } = useMessages(selectedConversationId || undefined);

  const { instances: whatsappInstances } = useWhatsappInstances({ status: 'connected' });

  const { sendMessage, isSending } = useSendMessage({
    onSuccess: () => {
      refetchMessages();
      refetchConversations();
      if (soundEnabled) {
        playNotificationSound();
      }
    },
    onError: (error) => {
      toast.error(`Erro ao enviar mensagem: ${error.message}`);
    },
  });

  const { deleteConversation, isDeleting } = useDeleteConversation({
    onSuccess: () => {
      toast.success('Conversa removida');
      setSelectedConversationId(null);
      refetchConversations();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });

  const { markAsRead } = useMarkMessagesAsRead();

  // Encontrar conversa selecionada
  const selectedConversation = conversations.find(c => c.id === selectedConversationId) || null;

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Marcar como lido ao selecionar conversa
  useEffect(() => {
    if (selectedConversationId && selectedConversation?.unreadCount && selectedConversation.unreadCount > 0) {
      markAsRead(selectedConversationId);
    }
  }, [selectedConversationId]);

  // Inicializar WhatsApps selecionados
  useEffect(() => {
    if (whatsappInstances.length > 0 && selectedWhatsApps.length === 0) {
      setSelectedWhatsApps(whatsappInstances.map(w => w.id));
    }
  }, [whatsappInstances]);

  // Polling para novas mensagens
  useEffect(() => {
    const interval = setInterval(() => {
      refetchConversations();
      if (selectedConversationId) {
        refetchMessages();
      }
    }, 10000); // A cada 10 segundos

    return () => clearInterval(interval);
  }, [selectedConversationId]);

  // Calculate total unread
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

  const toggleWhatsApp = (whatsappId: string) => {
    setSelectedWhatsApps(prev => {
      if (prev.includes(whatsappId)) {
        if (prev.length === 1) return prev;
        return prev.filter(w => w !== whatsappId);
      } else {
        return [...prev, whatsappId];
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
    setSelectedConversationId(conv.id);
    setIsAIActive(false); // TODO: Implementar status de IA por conversa
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversationId) return;

    sendMessage(selectedConversationId, {
      content: messageInput.trim(),
      type: 'text',
    });

    setMessageInput('');
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
    if (confirm('Tem certeza que deseja deletar esta conversa?')) {
      deleteConversation(convId);
    }
  };

  const handleRefresh = () => {
    refetchConversations();
    if (selectedConversationId) {
      refetchMessages();
    }
    toast.success('Atualizado');
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-cs-bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" className="text-cs-text-secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRefresh} className="text-cs-text-secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
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

          <span className="text-sm text-cs-text-secondary ml-4">Canal:</span>
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

          {whatsappInstances.length > 0 && (
            <>
              <span className="text-sm text-cs-text-secondary ml-4">WhatsApp:</span>
              {whatsappInstances.map((instance) => (
                <Button
                  key={instance.id}
                  variant="outline"
                  size="sm"
                  onClick={() => toggleWhatsApp(instance.id)}
                  className={`${
                    selectedWhatsApps.includes(instance.id)
                      ? 'border-cs-success bg-cs-success/10'
                      : 'border-border opacity-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    selectedWhatsApps.includes(instance.id) ? 'bg-cs-success' : 'bg-gray-400'
                  }`} />
                  <span className="text-sm text-cs-text-primary">{instance.name}</span>
                </Button>
              ))}
            </>
          )}

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

      {/* Main Chat Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-[calc(100vh-320px)] min-h-[400px] max-h-[800px] bg-cs-bg-card border border-border rounded-xl overflow-hidden">
        {/* Conversations List */}
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
                    Conversas ({conversationsMeta?.total || conversations.length})
                  </span>
                  {totalUnread > 0 && (
                    <span className="bg-cs-error text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      {totalUnread}
                    </span>
                  )}
                  {isLoadingConversations && (
                    <Loader2 className="w-4 h-4 animate-spin text-cs-text-muted" />
                  )}
                </div>
              </div>
              <ScrollArea className="flex-1 overflow-y-auto">
                <div className="space-y-0">
                  {conversations.length > 0 ? (
                    conversations.map((conv) => (
                      <div key={conv.id}>
                        <div
                          className={`flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-border/50 ${
                            selectedConversationId === conv.id
                              ? 'bg-purple-500/20'
                              : 'hover:bg-cs-bg-card'
                          }`}
                          onClick={() => handleConversationClick(conv)}
                        >
                          <div className="relative flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full ${getColorFromName(conv.contactName)} flex items-center justify-center text-white font-medium text-sm`}>
                              {conv.contactAvatar ? (
                                <img src={conv.contactAvatar} alt={conv.contactName} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                getInitials(conv.contactName)
                              )}
                            </div>
                            {conv.channel === 'whatsapp' && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-cs-bg-primary">
                                <span className="text-[10px] text-white font-bold">W</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-cs-text-primary font-medium truncate">
                                {conv.contactName}
                              </p>
                              {(conv.unreadCount || 0) > 0 && (
                                <span className="bg-cs-success text-white text-xs min-w-[24px] h-6 px-1.5 rounded-full flex items-center justify-center font-medium">
                                  {conv.unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-cs-text-muted truncate mt-0.5">
                              {conv.lastMessagePreview || 'Sem mensagens'}
                            </p>
                            <p className="text-xs text-cs-text-muted/70 mt-0.5">
                              {formatRelativeTime(conv.lastMessageAt)}
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-1 bg-cs-bg-primary/30">
                          <button 
                            className="flex items-center gap-1 text-xs text-cs-text-muted hover:text-cs-error transition-colors"
                            onClick={(e) => handleDeleteConversation(conv.id, e)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="w-3 h-3" />
                            Deletar
                          </button>
                        </div>
                      </div>
                    ))
                  ) : isLoadingConversations ? (
                    <div className="flex-1 flex items-center justify-center text-cs-text-muted p-8">
                      <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-cs-text-muted p-8">
                      <p className="text-sm text-center">Nenhuma conversa encontrada</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <>
              {/* Contacts Tab - Placeholder */}
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
              </div>
              <div className="flex-1 flex items-center justify-center text-cs-text-muted p-8">
                <p className="text-sm text-center">Funcionalidade de contatos em desenvolvimento</p>
              </div>
            </>
          )}
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 flex flex-col h-full overflow-hidden">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center justify-between bg-cs-bg-card">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full ${getColorFromName(selectedConversation.contactName)} flex items-center justify-center text-white font-medium`}>
                      {selectedConversation.contactAvatar ? (
                        <img src={selectedConversation.contactAvatar} alt={selectedConversation.contactName} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        getInitials(selectedConversation.contactName)
                      )}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-cs-text-primary">
                        {selectedConversation.contactName}
                      </h3>
                    </div>
                    {selectedConversation.contactPhone && (
                      <p className="text-xs text-cs-text-muted">
                        {selectedConversation.contactPhone}
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
                  {isLoadingMessages ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-cs-text-muted" />
                    </div>
                  ) : messages.length > 0 ? (
                    [...messages].reverse().map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="flex items-end gap-2 max-w-[70%]">
                          {message.direction === 'inbound' && (
                            <div className={`w-8 h-8 rounded-full ${getColorFromName(selectedConversation.contactName)} flex items-center justify-center text-white text-xs flex-shrink-0`}>
                              {getInitials(selectedConversation.contactName)}
                            </div>
                          )}
                          <div
                            className={`relative px-4 py-2 rounded-2xl ${
                              message.direction === 'outbound'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-br-sm'
                                : 'bg-cs-bg-card border border-border text-cs-text-primary rounded-bl-sm'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <div className={`flex items-center gap-1 mt-1 ${
                              message.direction === 'outbound' ? 'justify-end' : 'justify-start'
                            }`}>
                              <span className="text-[10px] opacity-70">
                                {new Date(message.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex justify-center py-8 text-cs-text-muted">
                      <p className="text-sm">Nenhuma mensagem ainda</p>
                    </div>
                  )}
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
                      disabled={isSending}
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
                      disabled={isSending}
                      className="bg-gradient-to-r from-cs-cyan to-cs-blue hover:opacity-90 rounded-full w-10 h-10 p-0 flex-shrink-0"
                    >
                      {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
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
