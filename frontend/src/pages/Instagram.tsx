import { useState } from 'react';
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
  Unlink
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
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

// Mock data para contas conectadas
const mockAccounts = [
  {
    id: '1',
    username: '@codesolve_oficial',
    name: 'CodeSolve Brasil',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CS',
    followers: 12500,
    following: 850,
    posts: 234,
    engagement: 4.2,
    status: 'active',
    connectedAt: '2024-01-15',
  },
  {
    id: '2',
    username: '@tech_solutions',
    name: 'Tech Solutions',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=TS',
    followers: 8700,
    following: 420,
    posts: 156,
    engagement: 3.8,
    status: 'active',
    connectedAt: '2024-02-20',
  },
  {
    id: '3',
    username: '@digital_marketing',
    name: 'Digital Marketing BR',
    avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=DM',
    followers: 25000,
    following: 1200,
    posts: 512,
    engagement: 5.1,
    status: 'needs_reauth',
    connectedAt: '2023-11-10',
  },
];

// Mock data para publicações agendadas
const mockScheduledPosts = [
  {
    id: '1',
    account: '@codesolve_oficial',
    type: 'image',
    caption: '🚀 Novidades incríveis chegando! Fique ligado nas próximas atualizações da plataforma. #tech #inovacao',
    scheduledFor: '2024-01-25T14:00:00',
    status: 'scheduled',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=200',
  },
  {
    id: '2',
    account: '@tech_solutions',
    type: 'carousel',
    caption: '5 dicas essenciais para otimizar seu workflow! Arraste para ver todas →',
    scheduledFor: '2024-01-26T10:00:00',
    status: 'scheduled',
    thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=200',
    images: 5,
  },
  {
    id: '3',
    account: '@codesolve_oficial',
    type: 'reel',
    caption: 'Tutorial rápido: Como automatizar suas postagens 📱',
    scheduledFor: '2024-01-27T18:30:00',
    status: 'draft',
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200',
  },
];

// Mock data para analytics
const mockAnalytics = {
  overview: {
    totalReach: 125000,
    reachChange: 12.5,
    impressions: 450000,
    impressionsChange: 8.3,
    engagement: 4.5,
    engagementChange: -2.1,
    followers: 46200,
    followersChange: 15.2,
  },
  topPosts: [
    { id: '1', likes: 1250, comments: 89, reach: 15000, type: 'image' },
    { id: '2', likes: 980, comments: 45, reach: 12000, type: 'reel' },
    { id: '3', likes: 750, comments: 32, reach: 8500, type: 'carousel' },
  ],
  audienceGrowth: [
    { date: 'Seg', followers: 45800 },
    { date: 'Ter', followers: 45950 },
    { date: 'Qua', followers: 46100 },
    { date: 'Qui', followers: 46050 },
    { date: 'Sex', followers: 46200 },
    { date: 'Sáb', followers: 46180 },
    { date: 'Dom', followers: 46200 },
  ],
};

export default function Instagram() {
  const { toast } = useToast();
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleConnect = () => {
    toast({
      title: "Conectando ao Instagram",
      description: "Você será redirecionado para autorizar a conexão.",
    });
    setConnectModalOpen(false);
  };

  const handleDisconnect = (accountId: string) => {
    toast({
      title: "Conta desconectada",
      description: "A conta foi removida com sucesso.",
    });
  };

  const handleRefreshToken = (accountId: string) => {
    toast({
      title: "Reautenticando...",
      description: "Redirecionando para renovar permissões.",
    });
  };

  return (
    <DashboardLayout>
      <Header />
      
      <div className="p-8 space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-cs-text-primary flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500">
                <InstagramIcon className="w-6 h-6 text-white" />
              </div>
              Instagram
            </h2>
            <p className="text-cs-text-secondary mt-1">
              Gerencie contas, publicações e analytics do Instagram
            </p>
          </div>
          
          <div className="flex gap-2">
            <PermissionGate permissions={['instagram:post']}>
              <Button
                onClick={() => setCreatePostModalOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Publicação
              </Button>
            </PermissionGate>
            <PermissionGate permissions={['instagram:connect']}>
              <Button
                variant="outline"
                onClick={() => setConnectModalOpen(true)}
                className="border-border"
              >
                <Link2 className="w-4 h-4 mr-2" />
                Conectar Conta
              </Button>
            </PermissionGate>
          </div>
        </div>

        <Tabs defaultValue="accounts" className="w-full">
          <TabsList className="bg-cs-bg-card border border-border">
            <TabsTrigger value="accounts" className="data-[state=active]:bg-cs-cyan data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Contas Conectadas
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-cs-cyan data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-cs-cyan data-[state=active]:text-white">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Contas Conectadas */}
          <TabsContent value="accounts" className="mt-6">
            <div className="grid gap-4">
              {mockAccounts.map(account => (
                <Card key={account.id} className="bg-cs-bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-2 border-primary">
                          <AvatarImage src={account.avatar} />
                          <AvatarFallback>{account.username.slice(1, 3).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-cs-text-primary">{account.name}</h3>
                            <Badge 
                              variant={account.status === 'active' ? 'default' : 'destructive'}
                              className={account.status === 'active' 
                                ? 'bg-cs-success/20 text-cs-success border-cs-success/30' 
                                : 'bg-cs-error/20 text-cs-error border-cs-error/30'
                              }
                            >
                              {account.status === 'active' ? 'Ativo' : 'Reautenticar'}
                            </Badge>
                          </div>
                          <p className="text-sm text-cs-text-muted">{account.username}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-lg font-bold text-cs-text-primary">{formatNumber(account.followers)}</p>
                          <p className="text-xs text-cs-text-muted">Seguidores</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-cs-text-primary">{formatNumber(account.following)}</p>
                          <p className="text-xs text-cs-text-muted">Seguindo</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-cs-text-primary">{account.posts}</p>
                          <p className="text-xs text-cs-text-muted">Posts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-cs-cyan">{account.engagement}%</p>
                          <p className="text-xs text-cs-text-muted">Engajamento</p>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-cs-bg-card border-border">
                            <DropdownMenuItem className="text-cs-text-primary">
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Ver no Instagram
                            </DropdownMenuItem>
                            {account.status === 'needs_reauth' && (
                              <DropdownMenuItem 
                                className="text-warning"
                                onClick={() => handleRefreshToken(account.id)}
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Reautenticar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-border" />
                            <PermissionGate permissions={['instagram:disconnect']}>
                              <DropdownMenuItem 
                                className="text-cs-error"
                                onClick={() => handleDisconnect(account.id)}
                              >
                                <Unlink className="w-4 h-4 mr-2" />
                                Desconectar
                              </DropdownMenuItem>
                            </PermissionGate>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Publicações Agendadas */}
          <TabsContent value="scheduled" className="mt-6">
            <div className="grid gap-4">
              {mockScheduledPosts.map(post => (
                <Card key={post.id} className="bg-cs-bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={post.thumbnail} 
                          alt="Post thumbnail" 
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 p-1 bg-black/60 rounded">
                          {post.type === 'image' && <Image className="w-3 h-3 text-white" />}
                          {post.type === 'carousel' && (
                            <div className="flex items-center gap-0.5">
                              <Image className="w-3 h-3 text-white" />
                              <span className="text-[10px] text-white">{post.images}</span>
                            </div>
                          )}
                          {post.type === 'reel' && <Video className="w-3 h-3 text-white" />}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-cs-text-primary">{post.account}</span>
                          <Badge 
                            variant="outline"
                            className={post.status === 'scheduled' 
                              ? 'bg-cs-cyan/20 text-cs-cyan border-cs-cyan/30' 
                              : 'bg-muted text-muted-foreground'
                            }
                          >
                            {post.status === 'scheduled' ? 'Agendado' : 'Rascunho'}
                          </Badge>
                        </div>
                        <p className="text-sm text-cs-text-secondary line-clamp-2">
                          {post.caption}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-cs-text-muted">
                          <Clock className="w-3 h-3" />
                          {new Date(post.scheduledFor).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <PermissionGate permissions={['instagram:post']}>
                          <Button variant="ghost" size="icon">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-cs-error">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </PermissionGate>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="mt-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-cs-bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-cs-text-muted">Alcance Total</p>
                      <p className="text-2xl font-bold text-cs-text-primary">
                        {formatNumber(mockAnalytics.overview.totalReach)}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      mockAnalytics.overview.reachChange >= 0 ? 'text-cs-success' : 'text-cs-error'
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                      {mockAnalytics.overview.reachChange >= 0 ? '+' : ''}{mockAnalytics.overview.reachChange}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={75} className="h-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cs-bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-cs-text-muted">Impressões</p>
                      <p className="text-2xl font-bold text-cs-text-primary">
                        {formatNumber(mockAnalytics.overview.impressions)}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      mockAnalytics.overview.impressionsChange >= 0 ? 'text-cs-success' : 'text-cs-error'
                    }`}>
                      <Eye className="w-4 h-4" />
                      {mockAnalytics.overview.impressionsChange >= 0 ? '+' : ''}{mockAnalytics.overview.impressionsChange}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={82} className="h-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cs-bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-cs-text-muted">Taxa de Engajamento</p>
                      <p className="text-2xl font-bold text-cs-text-primary">
                        {mockAnalytics.overview.engagement}%
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      mockAnalytics.overview.engagementChange >= 0 ? 'text-cs-success' : 'text-cs-error'
                    }`}>
                      <Heart className="w-4 h-4" />
                      {mockAnalytics.overview.engagementChange >= 0 ? '+' : ''}{mockAnalytics.overview.engagementChange}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={45} className="h-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cs-bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-cs-text-muted">Seguidores</p>
                      <p className="text-2xl font-bold text-cs-text-primary">
                        {formatNumber(mockAnalytics.overview.followers)}
                      </p>
                    </div>
                    <div className={`flex items-center gap-1 text-sm ${
                      mockAnalytics.overview.followersChange >= 0 ? 'text-cs-success' : 'text-cs-error'
                    }`}>
                      <Users className="w-4 h-4" />
                      {mockAnalytics.overview.followersChange >= 0 ? '+' : ''}{mockAnalytics.overview.followersChange}%
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={68} className="h-1" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Posts */}
            <Card className="bg-cs-bg-card border-border">
              <CardHeader>
                <CardTitle className="text-cs-text-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cs-cyan" />
                  Posts com Melhor Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {mockAnalytics.topPosts.map((post, index) => (
                    <div 
                      key={post.id}
                      className="p-4 rounded-lg bg-cs-bg-primary border border-border"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge className="bg-cs-cyan/20 text-cs-cyan border-cs-cyan/30">
                          #{index + 1}
                        </Badge>
                        <Badge variant="outline" className="border-border text-cs-text-muted">
                          {post.type === 'image' ? 'Imagem' : post.type === 'reel' ? 'Reel' : 'Carrossel'}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-cs-text-muted flex items-center gap-1">
                            <Heart className="w-4 h-4" /> Curtidas
                          </span>
                          <span className="font-medium text-cs-text-primary">{formatNumber(post.likes)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-cs-text-muted flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" /> Comentários
                          </span>
                          <span className="font-medium text-cs-text-primary">{post.comments}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-cs-text-muted flex items-center gap-1">
                            <Eye className="w-4 h-4" /> Alcance
                          </span>
                          <span className="font-medium text-cs-text-primary">{formatNumber(post.reach)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Conectar Conta */}
      <Dialog open={connectModalOpen} onOpenChange={setConnectModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary flex items-center gap-2">
              <InstagramIcon className="w-5 h-5 text-pink-500" />
              Conectar Conta do Instagram
            </DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              Autorize o acesso à sua conta do Instagram para gerenciar publicações e analytics.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="font-medium text-cs-text-primary mb-2">Permissões necessárias:</h4>
              <ul className="text-sm text-cs-text-secondary space-y-1">
                <li>• Acesso ao perfil da conta</li>
                <li>• Publicar e agendar posts</li>
                <li>• Visualizar insights e analytics</li>
                <li>• Gerenciar comentários e mensagens</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConnectModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConnect}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              <InstagramIcon className="w-4 h-4 mr-2" />
              Conectar com Instagram
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Nova Publicação */}
      <Dialog open={createPostModalOpen} onOpenChange={setCreatePostModalOpen}>
        <DialogContent className="bg-cs-bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cs-text-primary flex items-center gap-2">
              <Plus className="w-5 h-5 text-cs-cyan" />
              Nova Publicação
            </DialogTitle>
            <DialogDescription className="text-cs-text-secondary">
              Crie e agende uma nova publicação para o Instagram.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-cs-text-secondary">Conta</Label>
              <select className="w-full mt-1 p-2 rounded-md bg-cs-bg-primary border border-border text-cs-text-primary">
                {mockAccounts.filter(a => a.status === 'active').map(account => (
                  <option key={account.id} value={account.id}>{account.name} ({account.username})</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-cs-text-secondary">Tipo de Publicação</Label>
              <div className="flex gap-2 mt-1">
                <Button variant="outline" className="flex-1 border-cs-cyan bg-cs-cyan/10 text-cs-cyan">
                  <Image className="w-4 h-4 mr-2" />
                  Imagem
                </Button>
                <Button variant="outline" className="flex-1 border-border">
                  <Image className="w-4 h-4 mr-2" />
                  Carrossel
                </Button>
                <Button variant="outline" className="flex-1 border-border">
                  <Video className="w-4 h-4 mr-2" />
                  Reel
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-cs-text-secondary">Mídia</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-lg p-8 text-center bg-muted/10">
                <Image className="w-8 h-8 mx-auto text-cs-text-muted mb-2" />
                <p className="text-sm text-cs-text-muted">
                  Arraste arquivos ou clique para selecionar
                </p>
              </div>
            </div>

            <div>
              <Label className="text-cs-text-secondary">Legenda</Label>
              <Textarea 
                className="mt-1 bg-cs-bg-primary border-border text-cs-text-primary"
                placeholder="Escreva a legenda da sua publicação..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-cs-text-secondary">Data</Label>
                <Input 
                  type="date" 
                  className="mt-1 bg-cs-bg-primary border-border text-cs-text-primary"
                />
              </div>
              <div>
                <Label className="text-cs-text-secondary">Horário</Label>
                <Input 
                  type="time" 
                  className="mt-1 bg-cs-bg-primary border-border text-cs-text-primary"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreatePostModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="outline" className="border-border">
              <Clock className="w-4 h-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button className="bg-gradient-to-r from-cs-cyan to-cs-blue">
              <Send className="w-4 h-4 mr-2" />
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
