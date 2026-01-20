import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Check, Sparkles } from 'lucide-react';
import logoIcon from '@/assets/codesolve-icon.png';
import { z } from 'zod';
import { TermsModal } from '@/components/legal/TermsModal';
import { PrivacyModal } from '@/components/legal/PrivacyModal';

// Schema de validação
const registerSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres').max(100),
  email: z.string().email('Email inválido').max(255),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  company: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres').max(100),
  niche: z.string().min(1, 'Selecione um nicho'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Você deve aceitar os termos' }) }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const niches = [
  { value: 'academia', label: '🥋 Academias & Fitness', icon: '🥋' },
  { value: 'clinica', label: '🏥 Clínicas & Saúde', icon: '🏥' },
  { value: 'delivery', label: '🍕 Delivery & Restaurantes', icon: '🍕' },
  { value: 'ecommerce', label: '🛒 E-commerce & Lojas', icon: '🛒' },
  { value: 'imobiliaria', label: '🏠 Imobiliárias', icon: '🏠' },
  { value: 'escritorio', label: '💼 Escritórios & Serviços', icon: '💼' },
  { value: 'educacao', label: '🎓 Educação & Cursos', icon: '🎓' },
  { value: 'beleza', label: '💇 Beleza & Estética', icon: '💇' },
  { value: 'outro', label: '📦 Outro', icon: '📦' },
];

const trialBenefits = [
  '14 dias grátis para testar',
  'Sem cartão de crédito',
  'Acesso a todas as funcionalidades',
  'Suporte em português',
  'Cancele quando quiser',
];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    niche: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo ao digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validar com Zod
    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        niche: formData.niche,
        password: formData.password,
      });

      if (response.success) {
        toast.success('Conta criada com sucesso! Seu trial de 14 dias começou.', {
          description: 'Vamos configurar seu assistente virtual!',
        });
        navigate('/onboarding');
      } else {
        toast.error(response.error || 'Erro ao criar conta');
      }
    } catch (error) {
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-lg">
          {/* Back Link */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para o site
          </Link>

          <Card className="bg-cs-bg-card border-border">
            <CardHeader className="text-center pb-2">
              {/* Logo */}
              <div className="flex justify-center mb-4">
                <img 
                  src={logoIcon} 
                  alt="CodeSolve" 
                  className="h-16 drop-shadow-[0_0_12px_rgba(0,212,255,0.6)]" 
                />
              </div>
              <CardTitle className="text-2xl font-bold">
                Comece seu <span className="text-gradient">Trial Grátis</span>
              </CardTitle>
              <CardDescription>
                14 dias para testar todas as funcionalidades
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={errors.name ? 'border-cs-error' : ''}
                  />
                  {errors.name && <p className="text-xs text-cs-error">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email corporativo</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@empresa.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={errors.email ? 'border-cs-error' : ''}
                  />
                  {errors.email && <p className="text-xs text-cs-error">{errors.email}</p>}
                </div>

                {/* Telefone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">WhatsApp</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={errors.phone ? 'border-cs-error' : ''}
                  />
                  {errors.phone && <p className="text-xs text-cs-error">{errors.phone}</p>}
                </div>

                {/* Empresa */}
                <div className="space-y-2">
                  <Label htmlFor="company">Nome da empresa</Label>
                  <Input
                    id="company"
                    placeholder="Sua Empresa LTDA"
                    value={formData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                    className={errors.company ? 'border-cs-error' : ''}
                  />
                  {errors.company && <p className="text-xs text-cs-error">{errors.company}</p>}
                </div>

                {/* Nicho */}
                <div className="space-y-2">
                  <Label>Nicho do negócio</Label>
                  <Select value={formData.niche} onValueChange={(v) => handleChange('niche', v)}>
                    <SelectTrigger className={errors.niche ? 'border-cs-error' : ''}>
                      <SelectValue placeholder="Selecione seu nicho" />
                    </SelectTrigger>
                    <SelectContent>
                      {niches.map((niche) => (
                        <SelectItem key={niche.value} value={niche.value}>
                          {niche.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.niche && <p className="text-xs text-cs-error">{errors.niche}</p>}
                </div>

                {/* Senha */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={errors.password ? 'border-cs-error' : ''}
                    />
                    {errors.password && <p className="text-xs text-cs-error">{errors.password}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => handleChange('confirmPassword', e.target.value)}
                      className={errors.confirmPassword ? 'border-cs-error' : ''}
                    />
                    {errors.confirmPassword && <p className="text-xs text-cs-error">{errors.confirmPassword}</p>}
                  </div>
                </div>

                {/* Termos */}
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox
                    id="terms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked) => handleChange('acceptTerms', checked as boolean)}
                    className={errors.acceptTerms ? 'border-cs-error' : ''}
                  />
                  <span className="text-sm text-muted-foreground leading-tight">
                    Li e aceito os{' '}
                    <button 
                      type="button"
                      onClick={() => setShowTerms(true)} 
                      className="text-primary hover:underline"
                    >
                      Termos de Uso
                    </button>
                    {' '}e{' '}
                    <button 
                      type="button"
                      onClick={() => setShowPrivacy(true)} 
                      className="text-primary hover:underline"
                    >
                      Política de Privacidade
                    </button>
                  </span>
                </div>
                {errors.acceptTerms && <p className="text-xs text-cs-error">{errors.acceptTerms}</p>}

                {/* Modals */}
                <TermsModal open={showTerms} onOpenChange={setShowTerms} />
                <PrivacyModal open={showPrivacy} onOpenChange={setShowPrivacy} />

                {/* Submit */}
                <Button 
                  type="submit" 
                  className="w-full btn-gradient text-lg py-6 h-auto glow-cyan"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Começar Trial Grátis
                    </>
                  )}
                </Button>

                {/* Login Link */}
                <p className="text-center text-sm text-muted-foreground pt-2">
                  Já tem uma conta?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Fazer login
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Benefits (Desktop only) */}
      <div className="hidden lg:flex flex-1 bg-cs-bg-sidebar items-center justify-center p-12 relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold mb-2">
            Teste <span className="text-gradient">grátis</span> por 14 dias
          </h2>
          <p className="text-muted-foreground mb-8">
            Automatize seu atendimento no WhatsApp com IA humanizada. Veja resultados em menos de 1 hora.
          </p>

          {/* Benefits List */}
          <ul className="space-y-4">
            {trialBenefits.map((benefit, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-cs-success/20 flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4 text-cs-success" />
                </div>
                <span className="text-foreground">{benefit}</span>
              </li>
            ))}
          </ul>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-gradient">+500</p>
              <p className="text-xs text-muted-foreground">Empresas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gradient">2M+</p>
              <p className="text-xs text-muted-foreground">Mensagens/mês</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gradient">4.8/5</p>
              <p className="text-xs text-muted-foreground">Satisfação</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
