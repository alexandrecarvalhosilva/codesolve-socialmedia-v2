import { useState } from 'react';
import { 
  Instagram, 
  Plus, 
  Users, 
  Image, 
  Video, 
  Calendar, 
  BarChart3,
  MessageCircle,
  Heart,
  Eye,
  TrendingUp,
  Settings,
  RefreshCw,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Mock data
const connectedAccounts = [
  {
    id: '1',
    username: 'sixblades_oficial',
    name: 'Six Blades Oficial',
    avatar: '',
    followers: 15420,
    following: 342,
    posts: 287,
    engagement: 4.2,
    status: 'connected',
    lastSync: new Date(),
  },
  {
    id: '2', 
    username: 'sixblades_store',
    name: 'Six Blades Store',
    avatar: '',
    followers: 8750,
    following: 156,
    posts: 142,
    engagement: 3.8,
    status: 'connected',
    lastSync: new Date(Date.now() - 3600000),
  }
];

const scheduledPosts = [
  {
    id: '1',
    type: 'image',
    caption: 'Nova coleção chegando! 🔥 Prepare-se para o lançamento...',
    scheduledFor: new Date(Date.now() + 86400000),
    account: 'sixblades_oficial',
    status: 'scheduled'
  },
  {
    id: '2',
    type: 'reel',
    caption: 'Behind the scenes do nosso novo projeto 🎬',
    scheduledFor: new Date(Date.now() + 172800000),
    account: 'sixblades_oficial',
    status: 'scheduled'
  },
  {
    id: '3',
    type: 'carousel',
    caption: 'Top 5 produtos mais vendidos da semana 💪',
    scheduledFor: new Date(Date.now() + 259200000),
    account: 'sixblades_store',
    status: 'scheduled'
  }
];

const recentActivity = [
  { type: 'dm', message: 'Nova mensagem de @user123', time: '2 min' },
  { type: 'comment', message: 'Novo comentário no post #287', time: '15 min' },
  { type: 'like', message: '+50 curtidas no Reel mais recente', time: '1h' },
  { type: 'follower', message: '+12 novos seguidores', time: '2h' },
];

const TenantInstagram = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <TenantLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <Instagram className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Instagram</h1>
              <p className="text-muted-foreground">Gerencie suas contas e publicações</p>
            </div>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Conectar Conta
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="accounts" className="gap-2">
              <Users className="h-4 w-4" />
              Contas
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-2">
              <MessageCircle className="h-4 w-4" />
              Mensagens
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Total de Seguidores"
                value="24.170"
                icon={Users}
                trend={{ value: 5.2, isPositive: true }}
              />
              <MetricCard
                label="Engajamento Médio"
                value="4.0%"
                icon={Heart}
                trend={{ value: 0.3, isPositive: true }}
              />
              <MetricCard
                label="Alcance (7 dias)"
                value="45.2K"
                icon={Eye}
                trend={{ value: 12.4, isPositive: true }}
              />
              <MetricCard
                label="Posts Agendados"
                value="3"
                icon={Calendar}
              />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Connected Accounts */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-base">Contas Conectadas</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Sincronizar
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {connectedAccounts.map(account => (
                      <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={account.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                              {account.username[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">@{account.username}</span>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{account.followers.toLocaleString()} seguidores</span>
                              <span>{account.posts} posts</span>
                              <span>{account.engagement}% eng.</span>
                            </div>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Ver analytics</DropdownMenuItem>
                            <DropdownMenuItem>Configurações</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Desconectar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className={cn(
                          "p-1.5 rounded-full",
                          activity.type === 'dm' && 'bg-blue-500/10 text-blue-500',
                          activity.type === 'comment' && 'bg-green-500/10 text-green-500',
                          activity.type === 'like' && 'bg-pink-500/10 text-pink-500',
                          activity.type === 'follower' && 'bg-purple-500/10 text-purple-500',
                        )}>
                          {activity.type === 'dm' && <MessageCircle className="h-3.5 w-3.5" />}
                          {activity.type === 'comment' && <MessageCircle className="h-3.5 w-3.5" />}
                          {activity.type === 'like' && <Heart className="h-3.5 w-3.5" />}
                          {activity.type === 'follower' && <Users className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">{activity.message}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scheduled Posts */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Próximos Agendamentos</CardTitle>
                <Button variant="outline" size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  Novo Post
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scheduledPosts.map(post => (
                    <div key={post.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          post.type === 'image' && 'bg-blue-500/10 text-blue-500',
                          post.type === 'reel' && 'bg-purple-500/10 text-purple-500',
                          post.type === 'carousel' && 'bg-green-500/10 text-green-500',
                        )}>
                          {post.type === 'image' && <Image className="h-4 w-4" />}
                          {post.type === 'reel' && <Video className="h-4 w-4" />}
                          {post.type === 'carousel' && <Image className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium line-clamp-1">{post.caption}</p>
                          <p className="text-xs text-muted-foreground">@{post.account}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {post.scheduledFor.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {post.scheduledFor.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <Badge variant="outline" className="gap-1">
                          <Clock className="h-3 w-3" />
                          Agendado
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Accounts Tab */}
          <TabsContent value="accounts">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Gestão detalhada de contas em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Calendário de agendamentos em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Central de mensagens em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TenantLayout>
  );
};

// Helper component
function MetricCard({ 
  label, 
  value, 
  icon: Icon, 
  trend 
}: { 
  label: string; 
  value: string; 
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-sm mt-1",
                trend.isPositive ? 'text-green-500' : 'text-destructive'
              )}>
                <TrendingUp className={cn("h-3 w-3", !trend.isPositive && 'rotate-180')} />
                <span>{trend.isPositive ? '+' : '-'}{trend.value}%</span>
              </div>
            )}
          </div>
          <div className="p-3 rounded-lg bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TenantInstagram;
