import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import logoIcon from '@/assets/codesolve-icon.png';

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Main Header Row */}
        <div className="flex items-center justify-between h-24 lg:h-32">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <img 
              src={logoIcon} 
              alt="CodeSolve" 
              className="h-20 lg:h-28 drop-shadow-[0_0_15px_rgba(0,212,255,0.6)] group-hover:drop-shadow-[0_0_20px_rgba(0,212,255,0.8)] transition-all" 
            />
            <div className="flex flex-col items-center">
              <span className="text-2xl lg:text-3xl font-bold text-primary drop-shadow-[0_0_12px_rgba(0,212,255,0.5)]">
                CODESOLVE
              </span>
              <span className="text-xs lg:text-sm text-foreground/90 tracking-[0.3em] text-center">
                SOCIAL MEDIA
              </span>
            </div>
          </Link>

          {/* Desktop Navigation + Slogan */}
          <div className="hidden lg:flex flex-col items-center gap-3">
            <nav className="flex items-center gap-8">
              <button onClick={() => scrollToSection('features')} className="text-muted-foreground hover:text-foreground transition-colors">
                Funcionalidades
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-muted-foreground hover:text-foreground transition-colors">
                Como Funciona
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-muted-foreground hover:text-foreground transition-colors">
                Planos
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </button>
            </nav>
            <span className="text-sm text-gradient italic mt-1 font-medium">
              ✨ A arte de resolver problemas
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-4">
            <Button asChild variant="ghost">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="btn-gradient">
              <Link to="/register">Teste Grátis</Link>
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <button onClick={() => scrollToSection('features')} className="text-left text-muted-foreground hover:text-foreground transition-colors py-2">
                Funcionalidades
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left text-muted-foreground hover:text-foreground transition-colors py-2">
                Como Funciona
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-left text-muted-foreground hover:text-foreground transition-colors py-2">
                Planos
              </button>
              <button onClick={() => scrollToSection('faq')} className="text-left text-muted-foreground hover:text-foreground transition-colors py-2">
                FAQ
              </button>
              <p className="text-center text-xs text-muted-foreground italic py-2">
                A arte de resolver problemas
              </p>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild className="btn-gradient w-full">
                  <Link to="/login">Teste Grátis</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
