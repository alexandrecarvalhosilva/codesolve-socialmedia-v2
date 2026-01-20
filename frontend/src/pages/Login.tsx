import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, Lock, Mail, Shield, User, Users, Eye as EyeIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth, UserRole, roleConfig } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import logoIcon from '@/assets/codesolve-icon.png';

type ViewMode = 'login' | 'forgot-password';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginAsRole, getRedirectPath } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    const result = await login(email, password);
    
    setIsLoading(false);
    
    if (result.success) {
      toast.success('Login realizado com sucesso!');
      // Pegar o role do usuário logado para redirecionar
      const normalizedEmail = email.toLowerCase().trim();
      const roleMap: Record<string, UserRole> = {
        'superadmin@codesolve.com': 'superadmin',
        'admin@tenant.com': 'admin',
        'operador@tenant.com': 'operador',
        'visualizador@tenant.com': 'visualizador'
      };
      const role = roleMap[normalizedEmail] || 'operador';
      navigate(getRedirectPath(role));
    } else {
      setError(result.error || 'Erro ao fazer login');
      toast.error(result.error || 'Erro ao fazer login');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    loginAsRole(role);
    toast.success(`Logado como ${roleConfig[role].label}`);
    navigate(getRedirectPath(role));
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular envio de email
    setTimeout(() => {
      setIsLoading(false);
      setRecoverySent(true);
      toast.success('Email de recuperação enviado!');
    }, 1500);
  };

  const quickLoginButtons: { role: UserRole; icon: React.ElementType }[] = [
    { role: 'superadmin', icon: Shield },
    { role: 'admin', icon: User },
    { role: 'operador', icon: Users },
    { role: 'visualizador', icon: EyeIcon }
  ];

  return (
    <div className="min-h-screen bg-cs-bg-primary flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section - Bigger with branding */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            {/* Glow effect */}
            <div className="absolute inset-[-12px] bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-all duration-500 animate-pulse" />
            <img 
              src={logoIcon} 
              alt="CodeSolve" 
              className="relative z-10 w-28 h-28 drop-shadow-[0_0_35px_rgba(0,212,255,0.6)]"
            />
          </div>
          
          {/* Branding Text */}
          <div className="mt-6 text-center">
            <h1 className="text-3xl font-bold tracking-wider">
              <span className="text-primary drop-shadow-[0_0_10px_rgba(0,212,255,0.5)]">CODESOLVE</span>
            </h1>
            <p className="text-xl font-semibold text-white mt-1 tracking-wide">SOCIAL MEDIA</p>
            <p className="mt-2 text-muted-foreground text-sm">Gestão Inteligente de Redes Sociais</p>
          </div>
        </div>

        {/* Forgot Password View */}
        {viewMode === 'forgot-password' ? (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-foreground">Esqueceu sua senha?</h2>
              <p className="text-muted-foreground text-sm mt-2">
                Digite seu email para receber instruções de recuperação
              </p>
            </div>

            {recoverySent ? (
              <div className="space-y-6">
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                  <p className="text-green-400 text-sm">
                    ✓ Email enviado! Verifique sua caixa de entrada.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setViewMode('login');
                    setRecoverySent(false);
                    setRecoveryEmail('');
                  }}
                  className="w-full h-12 border-border hover:border-primary/50 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="recovery-email" className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <div className="relative">
                    <Input
                      id="recovery-email"
                      type="email"
                      placeholder="seu@email.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="bg-background border-border pl-4 pr-10 py-3 h-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                      required
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold rounded-lg transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Enviar Link de Recuperação'
                  )}
                </Button>

                {/* Back to login */}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setViewMode('login')}
                  className="w-full h-10 text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Voltar para Login
                </Button>
              </form>
            )}
          </div>
        ) : (
          /* Login Card */
          <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Bem-vindo de volta</h2>
              <p className="text-muted-foreground text-sm mt-1">Faça login para acessar sua conta</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-border pl-4 pr-10 py-3 h-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                    required
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Senha
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background border-border pl-4 pr-10 py-3 h-12 text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Lembrar-me
                  </label>
                </div>
                <Link 
                  to="/forgot-password"
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-3 text-muted-foreground">Acesso rápido para testes</span>
              </div>
            </div>

            {/* Quick Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {quickLoginButtons.map(({ role, icon: Icon }) => (
                <Button
                  key={role}
                  type="button"
                  variant="outline"
                  onClick={() => handleQuickLogin(role)}
                  className={`h-auto py-3 px-4 flex flex-col items-center gap-2 border-border hover:border-primary/50 transition-all group`}
                >
                  <div className={`w-10 h-10 rounded-full ${roleConfig[role].color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{roleConfig[role].label}</p>
                    <p className="text-xs text-muted-foreground">{roleConfig[role].description}</p>
                  </div>
                </Button>
              ))}
            </div>

            {/* Credentials hint */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Dica:</strong> Use qualquer email acima com senha <code className="bg-muted px-1.5 py-0.5 rounded">123456</code>
              </p>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 bg-card/50 border border-border rounded-xl p-4 flex items-start gap-3">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Sua conexão é segura e criptografada. Nunca compartilhe sua senha com ninguém.
          </p>
        </div>
      </div>
    </div>
  );
}