import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { User, Lock, Bell, Shield, Camera, Loader2, Save, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { AvatarCropModal } from '@/components/profile/AvatarCropModal';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { TenantLayout } from '@/layouts/TenantLayout';
import { useNavigate } from 'react-router-dom';

const AVATAR_STORAGE_KEY = 'user-avatar';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(() => {
    return localStorage.getItem(AVATAR_STORAGE_KEY);
  });
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string>('');
  
  // Determine which layout to use based on user role
  const isSuperAdmin = user?.role === 'superadmin';
  const Layout = isSuperAdmin ? DashboardLayout : TenantLayout;

  // Personal data state
  const [personalData, setPersonalData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '(11) 99999-9999',
    company: user?.company || '',
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Notification preferences state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    weeklyReport: true,
    instantAlerts: true,
    ticketUpdates: true,
    billingAlerts: true,
    securityAlerts: true,
    notificationSound: 'default',
  });

  const handlePersonalDataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Dados pessoais atualizados com sucesso!');
    setIsLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Senha alterada com sucesso!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsLoading(false);
  };

  const handleNotificationsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Preferências de notificação atualizadas!');
    setIsLoading(false);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setTempImageSrc(imageData);
      setCropModalOpen(true);
    };
    reader.onerror = () => {
      toast.error('Erro ao carregar a imagem');
    };
    reader.readAsDataURL(file);
    
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleCropComplete = (croppedImage: string) => {
    setAvatarPreview(croppedImage);
    localStorage.setItem(AVATAR_STORAGE_KEY, croppedImage);
    toast.success('Foto atualizada!', { description: 'Sua foto foi salva.' });
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    localStorage.removeItem(AVATAR_STORAGE_KEY);
    toast.info('Foto removida');
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie suas informações pessoais, segurança e preferências
          </p>
        </div>

      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Dados Pessoais</span>
            <span className="sm:hidden">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
            <span className="sm:hidden">Senha</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
            <span className="sm:hidden">Alertas</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Data Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>
                Atualize suas informações de perfil e contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePersonalDataSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarPreview || ''} />
                      <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                        {getInitials(personalData.name || 'U')}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium">{personalData.name}</h3>
                    <p className="text-sm text-muted-foreground">{user?.role}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Clique no ícone para alterar sua foto
                    </p>
                    {avatarPreview && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs text-destructive"
                        onClick={handleRemoveAvatar}
                      >
                        Remover foto
                      </Button>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                      id="name"
                      value={personalData.name}
                      onChange={(e) => setPersonalData({ ...personalData, name: e.target.value })}
                      placeholder="Seu nome"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalData.email}
                      onChange={(e) => setPersonalData({ ...personalData, email: e.target.value })}
                      placeholder="seu@email.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={personalData.phone}
                      onChange={(e) => setPersonalData({ ...personalData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa</Label>
                    <Input
                      id="company"
                      value={personalData.company}
                      onChange={(e) => setPersonalData({ ...personalData, company: e.target.value })}
                      placeholder="Nome da empresa"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Salvar Alterações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Segurança da Conta
              </CardTitle>
              <CardDescription>
                Altere sua senha e gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Digite sua senha atual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Digite sua nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Mínimo de 6 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirme sua nova senha"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <h4 className="font-medium text-foreground">Dicas de Segurança</h4>
                  <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                    <li>• Use uma combinação de letras, números e símbolos</li>
                    <li>• Evite usar informações pessoais óbvias</li>
                    <li>• Não reutilize senhas de outros serviços</li>
                  </ul>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="mr-2 h-4 w-4" />
                    )}
                    Alterar Senha
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure como e quando você deseja receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationsSubmit} className="space-y-6">
                {/* Channels */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Canais de Notificação</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="emailNotifications">Notificações por E-mail</Label>
                      <p className="text-xs text-muted-foreground">Receba atualizações importantes por e-mail</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pushNotifications">Notificações Push</Label>
                      <p className="text-xs text-muted-foreground">Receba alertas em tempo real no navegador</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smsNotifications">Notificações por SMS</Label>
                      <p className="text-xs text-muted-foreground">Receba alertas críticos por mensagem de texto</p>
                    </div>
                    <Switch
                      id="smsNotifications"
                      checked={notifications.smsNotifications}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, smsNotifications: checked })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Alert Types */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Tipos de Alerta</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="instantAlerts">Alertas Instantâneos</Label>
                      <p className="text-xs text-muted-foreground">Notificações imediatas para eventos críticos</p>
                    </div>
                    <Switch
                      id="instantAlerts"
                      checked={notifications.instantAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, instantAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ticketUpdates">Atualizações de Tickets</Label>
                      <p className="text-xs text-muted-foreground">Notificações sobre mudanças em tickets de suporte</p>
                    </div>
                    <Switch
                      id="ticketUpdates"
                      checked={notifications.ticketUpdates}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, ticketUpdates: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="billingAlerts">Alertas de Cobrança</Label>
                      <p className="text-xs text-muted-foreground">Notificações sobre faturas e pagamentos</p>
                    </div>
                    <Switch
                      id="billingAlerts"
                      checked={notifications.billingAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, billingAlerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="securityAlerts">Alertas de Segurança</Label>
                      <p className="text-xs text-muted-foreground">Notificações sobre atividades suspeitas</p>
                    </div>
                    <Switch
                      id="securityAlerts"
                      checked={notifications.securityAlerts}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, securityAlerts: checked })}
                    />
                  </div>
                </div>

                <Separator />

                {/* Additional Preferences */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Preferências Adicionais</h4>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="weeklyReport">Relatório Semanal</Label>
                      <p className="text-xs text-muted-foreground">Receba um resumo semanal por e-mail</p>
                    </div>
                    <Switch
                      id="weeklyReport"
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="marketingEmails">E-mails de Marketing</Label>
                      <p className="text-xs text-muted-foreground">Novidades, promoções e dicas de uso</p>
                    </div>
                    <Switch
                      id="marketingEmails"
                      checked={notifications.marketingEmails}
                      onCheckedChange={(checked) => setNotifications({ ...notifications, marketingEmails: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notificationSound">Som de Notificação</Label>
                    <Select 
                      value={notifications.notificationSound}
                      onValueChange={(value) => setNotifications({ ...notifications, notificationSound: value })}
                    >
                      <SelectTrigger id="notificationSound">
                        <SelectValue placeholder="Selecione um som" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Padrão</SelectItem>
                        <SelectItem value="chime">Chime</SelectItem>
                        <SelectItem value="bell">Sino</SelectItem>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="none">Sem som</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Salvar Preferências
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AvatarCropModal
        open={cropModalOpen}
        onOpenChange={setCropModalOpen}
        imageSrc={tempImageSrc}
        onCropComplete={handleCropComplete}
      />
      </div>
    </Layout>
  );
}
