import { useState } from 'react';
import { Link } from 'react-router-dom';
import logoHeader from '@/assets/codesolve-header.png';
import { Linkedin, Instagram, Facebook, Twitter } from 'lucide-react';
import { TermsModal } from '@/components/legal/TermsModal';
import { PrivacyModal } from '@/components/legal/PrivacyModal';

const footerLinks = {
  produto: [
    { label: 'Funcionalidades', href: '#features' },
    { label: 'Planos', href: '#pricing' },
    { label: 'Integrações', href: '#' },
    { label: 'Segurança', href: '#' },
  ],
  empresa: [
    { label: 'Sobre nós', href: '#' },
    { label: 'Carreiras', href: '#' },
    { label: 'Parceiros', href: '#' },
    { label: 'Imprensa', href: '#' },
  ],
  recursos: [
    { label: 'Blog', href: '#' },
    { label: 'Documentação', href: '#' },
    { label: 'API', href: '#' },
    { label: 'Status', href: '#' },
  ],
  contato: [
    { label: 'WhatsApp', href: '#' },
    { label: 'Email', href: '#' },
    { label: 'Suporte', href: '#' },
    { label: 'Chat', href: '#' },
  ],
};

const socialLinks = [
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
];

export function LandingFooter() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <footer className="bg-cs-bg-sidebar border-t border-border">
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Logo & Description */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img src={logoHeader} alt="CodeSolve Social Media" className="h-8" />
            </Link>
            <p className="text-muted-foreground text-sm mb-6">
              Automatize seu atendimento com IA humanizada. Disponível 24/7, treinada para o seu nicho.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Produto</h4>
            <ul className="space-y-3">
              {footerLinks.produto.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Empresa</h4>
            <ul className="space-y-3">
              {footerLinks.empresa.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Recursos</h4>
            <ul className="space-y-3">
              {footerLinks.recursos.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Contato</h4>
            <ul className="space-y-3">
              {footerLinks.contato.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2026 CodeSolve. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button 
              onClick={() => setShowTerms(true)} 
              className="hover:text-foreground transition-colors"
            >
              Termos de Uso
            </button>
            <button 
              onClick={() => setShowPrivacy(true)} 
              className="hover:text-foreground transition-colors"
            >
              Política de Privacidade
            </button>
            <button 
              onClick={() => setShowPrivacy(true)} 
              className="hover:text-foreground transition-colors"
            >
              LGPD
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <TermsModal open={showTerms} onOpenChange={setShowTerms} />
      <PrivacyModal open={showPrivacy} onOpenChange={setShowPrivacy} />
    </footer>
  );
}
