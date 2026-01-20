import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  MessageSquare, 
  Calendar, 
  Zap, 
  CreditCard, 
  Plug, 
  Headphones,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  AlertTriangle,
  AlertCircle,
  Building2,
  Clock,
  XCircle,
  Package,
  WifiOff,
  AlertOctagon,
  CalendarX,
  XOctagon,
  CheckCircle,
  MessageCircle,
  Ticket,
  X,
  VolumeX,
  Volume2,
  History,
  BellOff,
  Users,
  Brain
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { TenantLayout } from '@/layouts/TenantLayout';
import { Header } from '@/components/dashboard/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { useNotifications } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Notification, 
  NotificationOrigin, 
  NotificationType,
  notificationOriginConfig,
  notificationTypeConfig,
  priorityConfig 
} from '@/types/notification';
import { actionTypeLabels } from '@/types/notificationActionLog';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { EmptyNotificationsState, EmptySearchState } from '@/components/ui/empty-state';

const iconMap: Record<string, React.ElementType> = {
  AlertTriangle,
  AlertCircle,
  Bell,
  Building2,
  Calendar,
  CalendarX,
  CheckCircle,
  Clock,
  CreditCard,
  Headphones,
  MessageCircle,
  MessageSquare,
  Package,
  Plug,
  Ticket,
  WifiOff,
  XCircle,
  XOctagon,
  AlertOctagon,
  Zap,
};

const originIcons: Record<NotificationOrigin, React.ElementType> = {
  chat: MessageSquare,
  event: Calendar,
  automation: Zap,
  billing: CreditCard,
  integration: Plug,
  support: Headphones,
  system: Bell,
  security: AlertTriangle,
  user: Users,
  ai: Brain,
};

export default function Notificacoes() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    notifications, 
    markAsRead, 
    markAllAsRead, 
    removeNotification,
    dismissNotification,
    resolveNotification,
    muteNotificationType,
    unmuteNotificationType,
    mutedTypes,
    actionLogs
  } = useNotifications();
  
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('notifications');
  const [isLoading, setIsLoading] = useState(true);

  // Simula carregamento
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      if (selectedOrigin !== 'all' && n.origin !== selectedOrigin) return false;
      if (selectedPriority !== 'all' && n.priority !== selectedPriority) return false;
      if (selectedStatus === 'unread' && n.read) return false;
      if (selectedStatus === 'read' && !n.read) return false;
      
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          n.title.toLowerCase().includes(search) ||
          n.message.toLowerCase().includes(search) ||
          n.tenantName?.toLowerCase().includes(search)
        );
      }
      
      return true;
    });
  }, [notifications, selectedOrigin, selectedPriority, selectedStatus, searchTerm]);

  // Stats by origin
  const statsByOrigin = useMemo(() => {
    const stats: Record<string, { total: number; unread: number; critical: number }> = {};
    
    notifications.forEach(n => {
      if (!stats[n.origin]) {
        stats[n.origin] = { total: 0, unread: 0, critical: 0 };
      }
      stats[n.origin].total++;
      if (!n.read) stats[n.origin].unread++;
      if (n.priority === 'critical' && !n.read) stats[n.origin].critical++;
    });
    
    return stats;
  }, [notifications]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredNotifications.map(n => n.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(i => i !== id));
    }
  };

  const handleMarkSelectedAsRead = () => {
    selectedIds.forEach(id => markAsRead(id));
    setSelectedIds([]);
  };

  const handleDismissSelected = () => {
    selectedIds.forEach(id => dismissNotification(id));
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    selectedIds.forEach(id => removeNotification(id));
    setSelectedIds([]);
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.linkTo) {
      navigate(notification.linkTo);
    }
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="w-4 h-4" /> : <Bell className="w-4 h-4" />;
  };

  const isSuperAdmin = user?.role === 'superadmin';
  const Layout = isSuperAdmin ? DashboardLayout : TenantLayout;

  return (
    <Layout>
      <Header />

      <div className="p-6 space-y-6 opacity-0 animate-enter" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Central de Notificações</h1>
            <p className="text-muted-foreground">Visualizando alertas para perfil: {user?.role || 'usuário'}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="muted" className="gap-2">
              <BellOff className="w-4 h-4" />
              Silenciados ({mutedTypes.length})
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <History className="w-4 h-4" />
              Histórico de Ações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            {/* Stats Cards by Origin */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(notificationOriginConfig).map(([origin, config]) => {
                const Icon = originIcons[origin as NotificationOrigin];
                const stats = statsByOrigin[origin] || { total: 0, unread: 0, critical: 0 };
                
                return (
                  <Card 
                    key={origin}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50",
                      selectedOrigin === origin && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedOrigin(selectedOrigin === origin ? 'all' : origin)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={cn("w-5 h-5", config.color)} />
                        <span className="text-sm font-medium">{config.label}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{stats.total}</span>
                        {stats.unread > 0 && (
                          <Badge variant="secondary" className="bg-primary/20 text-primary">
                            {stats.unread} novas
                          </Badge>
                        )}
                      </div>
                      {stats.critical > 0 && (
                        <Badge className="mt-2 bg-destructive/20 text-destructive border-destructive/30">
                          {stats.critical} críticas
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Filters and Actions */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-primary" />
                    Filtros e Ações
                  </CardTitle>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedIds.length > 0 && (
                      <>
                        <Button variant="outline" size="sm" onClick={handleMarkSelectedAsRead}>
                          <CheckCheck className="w-4 h-4 mr-2" />
                          Marcar lidas ({selectedIds.length})
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDismissSelected}>
                          <X className="w-4 h-4 mr-2" />
                          Dispensar ({selectedIds.length})
                        </Button>
                        <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Excluir ({selectedIds.length})
                        </Button>
                      </>
                    )}
                    <Button variant="outline" size="sm" onClick={markAllAsRead}>
                      <Check className="w-4 h-4 mr-2" />
                      Marcar todas lidas
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por título, mensagem ou tenant..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Origem" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as origens</SelectItem>
                      {Object.entries(notificationOriginConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>{config.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                      <SelectItem value="warning">Atenção</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="unread">Não lidas</SelectItem>
                      <SelectItem value="read">Lidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notifications Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Notificações ({filteredNotifications.length})</span>
                  {filteredNotifications.filter(n => !n.read).length > 0 && (
                    <Badge variant="secondary">
                      {filteredNotifications.filter(n => !n.read).length} não lidas
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead className="w-24">Prioridade</TableHead>
                        <TableHead className="w-32">Origem</TableHead>
                        <TableHead>Notificação</TableHead>
                        {isSuperAdmin && <TableHead className="w-40">Tenant</TableHead>}
                        <TableHead className="w-32">Quando</TableHead>
                        <TableHead className="w-24">Status</TableHead>
                        <TableHead className="w-16">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNotifications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={isSuperAdmin ? 8 : 7} className="h-32">
                            {searchTerm || selectedOrigin !== 'all' || selectedPriority !== 'all' || selectedStatus !== 'all' ? (
                              <EmptySearchState onClear={() => {
                                setSearchTerm('');
                                setSelectedOrigin('all');
                                setSelectedPriority('all');
                                setSelectedStatus('all');
                              }} />
                            ) : (
                              <EmptyNotificationsState />
                            )}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredNotifications.map((notification) => {
                          const typeConfig = notificationTypeConfig[notification.type];
                          const priority = priorityConfig[notification.priority];
                          const OriginIcon = originIcons[notification.origin];
                          
                          return (
                            <TableRow 
                              key={notification.id}
                              className={cn(
                                "cursor-pointer transition-colors",
                                !notification.read && "bg-primary/5",
                                notification.priority === 'critical' && !notification.read && "bg-destructive/5"
                              )}
                            >
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={selectedIds.includes(notification.id)}
                                  onCheckedChange={(checked) => handleSelectOne(notification.id, checked as boolean)}
                                />
                              </TableCell>
                              <TableCell onClick={() => handleNotificationClick(notification)}>
                                <Badge 
                                  variant="outline" 
                                  className={cn(priority.bg, priority.text, priority.border)}
                                >
                                  {priority.label}
                                </Badge>
                              </TableCell>
                              <TableCell onClick={() => handleNotificationClick(notification)}>
                                <div className="flex items-center gap-2">
                                  <OriginIcon className={cn("w-4 h-4", notificationOriginConfig[notification.origin].color)} />
                                  <span className="text-sm">{notificationOriginConfig[notification.origin].label}</span>
                                </div>
                              </TableCell>
                              <TableCell onClick={() => handleNotificationClick(notification)}>
                                <div className="flex items-start gap-3">
                                  <div className={cn("p-2 rounded-lg", priority.bg)}>
                                    {getIcon(typeConfig?.icon || 'Bell')}
                                  </div>
                                  <div>
                                    <p className={cn("font-medium", !notification.read && "text-foreground")}>
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                      {notification.message}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              {isSuperAdmin && (
                                <TableCell onClick={() => handleNotificationClick(notification)}>
                                  {notification.tenantName ? (
                                    <div className="flex items-center gap-2">
                                      <Building2 className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm">{notification.tenantName}</span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">Global</span>
                                  )}
                                </TableCell>
                              )}
                              <TableCell onClick={() => handleNotificationClick(notification)}>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {formatDistanceToNow(notification.timestamp, { addSuffix: true, locale: ptBR })}
                                </div>
                              </TableCell>
                              <TableCell onClick={() => handleNotificationClick(notification)}>
                                {notification.read ? (
                                  <Badge variant="outline" className="text-muted-foreground">Lida</Badge>
                                ) : (
                                  <Badge className="bg-primary/20 text-primary border-primary/30">Nova</Badge>
                                )}
                              </TableCell>
                              <TableCell onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {!notification.read && (
                                      <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                                        <Check className="w-4 h-4 mr-2" />
                                        Marcar como lida
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => dismissNotification(notification.id)}>
                                      <X className="w-4 h-4 mr-2" />
                                      Dispensar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => resolveNotification(notification.id)}>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Marcar como resolvida
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => muteNotificationType(notification.type)}>
                                      <BellOff className="w-4 h-4 mr-2" />
                                      Silenciar este tipo
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem 
                                      onClick={() => removeNotification(notification.id)}
                                      className="text-destructive"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Muted Types Tab */}
          <TabsContent value="muted" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BellOff className="w-5 h-5 text-muted-foreground" />
                  Tipos de Notificação Silenciados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mutedTypes.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BellOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum tipo de notificação silenciado</p>
                    <p className="text-sm mt-2">
                      Você pode silenciar tipos específicos de notificação clicando no menu de ações
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {mutedTypes.map((type) => {
                      const config = notificationTypeConfig[type];
                      return (
                        <div 
                          key={type}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted">
                              {getIcon(config?.icon || 'Bell')}
                            </div>
                            <div>
                              <p className="font-medium">{config?.label || type}</p>
                              <p className="text-sm text-muted-foreground">
                                Origem: {notificationOriginConfig[config?.origin || 'system']?.label}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => unmuteNotificationType(type)}
                          >
                            <Volume2 className="w-4 h-4 mr-2" />
                            Reativar
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  Histórico de Ações (Auditoria)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {actionLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma ação registrada ainda</p>
                    <p className="text-sm mt-2">
                      As ações de dispensar, silenciar e excluir notificações serão registradas aqui
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data/Hora</TableHead>
                          <TableHead>Usuário</TableHead>
                          <TableHead>Perfil</TableHead>
                          <TableHead>Ação</TableHead>
                          <TableHead>Detalhes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {actionLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-muted-foreground" />
                                {format(log.timestamp, "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{log.userName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{log.userRole}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="secondary"
                                className={cn(
                                  log.action === 'deleted' && "bg-destructive/20 text-destructive",
                                  log.action === 'dismissed' && "bg-yellow-500/20 text-yellow-600",
                                  log.action === 'resolved' && "bg-green-500/20 text-green-600",
                                  log.action === 'muted_type' && "bg-orange-500/20 text-orange-600"
                                )}
                              >
                                {actionTypeLabels[log.action]}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-[300px] truncate text-muted-foreground">
                              {log.details}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
