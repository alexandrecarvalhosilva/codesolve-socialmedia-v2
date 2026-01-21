import { useState, useEffect } from 'react';
import { 
  Instagram as InstagramIcon, 
  Plus, 
  MoreHorizontal, 
  TrendingUp, 
  Users, 
  Heart, 
  MessageCircle,
  Image,
  Video,
  Calendar,
  Clock,
  ExternalLink,
  RefreshCw,
  BarChart3,
  Eye,
  Send,
  Trash2,
  Edit2,
  Link2,
  Unlink,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PermissionGate } from '@/components/ProtectedRoute';
import { api } from '@/lib/api';

interface InstagramAccount {
  id: string;
  username: string;
  name: string;
  avatar: string;
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
}

interface InstagramPost {
  id: string;
  type: 'image' | 'video' | 'carousel';
  thumbnail: string;
  caption: string;
  likes: number;
  comments: number;
  reach: number;
  engagement: number;
  publishedAt: string;
  status: 'published' | 'scheduled' | 'draft';
}

export default function Instagram() {
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAccount, setSelectedAccount] = useState<InstagramAccount | null>(null);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [isCreatePostDialogOpen, setIsCreatePostDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/instagram/accounts');
      setAccounts(response.data.accounts || []);
      if (response.data.accounts?.length > 0) {
        setSelectedAccount(response.data.accounts[0]);
        fetchPosts(response.data.accounts[0].id);
      }
    } catch (error) {
      // Se não houver endpoint, mostrar estado vazio
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPosts = async (accountId: string) => {
    try {
      const response = await api.get(`/instagram/accounts/${accountId}/posts`);
      setPosts(response.data.posts || []);
    } catch (error) {
      setPosts([]);
    }
  };

  const handleRefresh = () => {
    fetchAccounts();
    toast({
      title: "Atualizando",
      description: "Sincronizando dados do Instagram...",
    });
  };

  const handleConnectAccount = () => {
    setIsConnectDialogOpen(true);
  };

  const handleDisconnectAccount = async (accountId: string) => {
    try {
      await api.delete(`/instagram/accounts/${accountId}`);
      toast({
        title: "Conta desconectada",
        description: "A conta foi desconectada com sucesso.",
      });
      fetchAccounts();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível desconectar a conta.",
        variant: "destructive",
      });
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Header />
        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
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
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-cs-text-primary flex items-center gap-2">
              <InstagramIcon className="w-7 h-7 text-pink-500" />
              Instagram
            </h1>
            <p className="text-cs-text-secondary mt-1">
              Gerencie suas contas e publicações do Instagram
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRefresh}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <PermissionGate permissions={['instagram:write']}>
              <Button onClick={handleConnectAccount}>
                <Plus className="w-4 h-4 mr-2" />
                Conectar Conta
              </Button>
            </PermissionGate>
          </div>
        </div>

        {accounts.length === 0 ? (
          /* Empty State */
          <Card className="bg-cs-bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center mb-4">
                <InstagramIcon className="w-8 h-8 text-pink-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Nenhuma conta conectada
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">
                Conecte sua conta do Instagram para começar a gerenciar suas publicações e acompanhar métricas.
              </p>
              <Button onClick={handleConnectAccount}>
                <Link2 className="w-4 h-4 mr-2" />
                Conectar Conta do Instagram
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Account Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <Card 
                  key={account.id} 
                  className={`bg-cs-bg-card border-border cursor-pointer transition-all ${
                    selectedAccount?.id === account.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => {
                    setSelectedAccount(account);
                    fetchPosts(account.id);
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={account.avatar} />
                          <AvatarFallback>{account.username.slice(1, 3).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{account.name}</p>
                          <p className="text-sm text-muted-foreground">{account.username}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Ver Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Sincronizar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-cs-error"
                            onClick={() => handleDisconnectAccount(account.id)}
                          >
                            <Unlink className="w-4 h-4 mr-2" />
                            Desconectar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{formatNumber(account.followers)}</p>
                        <p className="text-xs text-muted-foreground">Seguidores</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{formatNumber(account.following)}</p>
                        <p className="text-xs text-muted-foreground">Seguindo</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-foreground">{account.posts}</p>
                        <p className="text-xs text-muted-foreground">Posts</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <Badge variant={account.status === 'connected' ? 'default' : 'destructive'}>
                        {account.status === 'connected' ? 'Conectado' : 'Desconectado'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Última sync: {account.lastSync}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Metrics */}
            {selectedAccount && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-cs-bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Seguidores</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(selectedAccount.followers)}</p>
                  </CardContent>
                </Card>
                <Card className="bg-cs-bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-pink-500" />
                      <span className="text-sm text-muted-foreground">Engajamento</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{selectedAccount.engagement}%</p>
                  </CardContent>
                </Card>
                <Card className="bg-cs-bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Image className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">Publicações</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{selectedAccount.posts}</p>
                  </CardContent>
                </Card>
                <Card className="bg-cs-bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-cs-success" />
                      <span className="text-sm text-muted-foreground">Alcance</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(selectedAccount.followers * 0.3)}</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Posts */}
            {selectedAccount && (
              <Card className="bg-cs-bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Publicações Recentes</CardTitle>
                  <Button onClick={() => setIsCreatePostDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Publicação
                  </Button>
                </CardHeader>
                <CardContent>
                  {posts.length === 0 ? (
                    <div className="text-center py-8">
                      <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Nenhuma publicação encontrada</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {posts.map((post) => (
                        <div key={post.id} className="relative group">
                          <img 
                            src={post.thumbnail} 
                            alt={post.caption}
                            className="w-full aspect-square object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-4">
                            <div className="text-center">
                              <Heart className="w-5 h-5 text-white mx-auto" />
                              <span className="text-white text-sm">{formatNumber(post.likes)}</span>
                            </div>
                            <div className="text-center">
                              <MessageCircle className="w-5 h-5 text-white mx-auto" />
                              <span className="text-white text-sm">{formatNumber(post.comments)}</span>
                            </div>
                          </div>
                          {post.type === 'video' && (
                            <Video className="absolute top-2 right-2 w-4 h-4 text-white" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Connect Account Dialog */}
        <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Conectar Conta do Instagram</DialogTitle>
              <DialogDescription>
                Conecte sua conta do Instagram Business para gerenciar publicações e acompanhar métricas.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-cs-bg-primary rounded-lg">
                <AlertCircle className="w-5 h-5 text-cs-warning" />
                <p className="text-sm text-muted-foreground">
                  Você será redirecionado para o Facebook para autorizar o acesso à sua conta do Instagram Business.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsConnectDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Funcionalidade em desenvolvimento",
                  description: "A integração com Instagram será disponibilizada em breve.",
                });
                setIsConnectDialogOpen(false);
              }}>
                <InstagramIcon className="w-4 h-4 mr-2" />
                Conectar com Instagram
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Post Dialog */}
        <Dialog open={isCreatePostDialogOpen} onOpenChange={setIsCreatePostDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nova Publicação</DialogTitle>
              <DialogDescription>
                Crie uma nova publicação para o Instagram
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Imagem/Vídeo</Label>
                <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center">
                  <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Arraste uma imagem ou clique para selecionar</p>
                </div>
              </div>
              <div>
                <Label htmlFor="caption">Legenda</Label>
                <Textarea 
                  id="caption" 
                  placeholder="Escreva a legenda da sua publicação..."
                  className="mt-2 bg-cs-bg-primary border-border"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data de Publicação</Label>
                  <Input 
                    id="date" 
                    type="date" 
                    className="mt-2 bg-cs-bg-primary border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="time">Horário</Label>
                  <Input 
                    id="time" 
                    type="time" 
                    className="mt-2 bg-cs-bg-primary border-border"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreatePostDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Agendar
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Funcionalidade em desenvolvimento",
                  description: "A publicação no Instagram será disponibilizada em breve.",
                });
                setIsCreatePostDialogOpen(false);
              }}>
                <Send className="w-4 h-4 mr-2" />
                Publicar Agora
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
