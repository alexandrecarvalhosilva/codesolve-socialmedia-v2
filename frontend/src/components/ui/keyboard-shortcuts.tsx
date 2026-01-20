import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Keyboard, Command } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { useAuth } from '@/contexts/AuthContext';

interface Shortcut {
  keys: string[];
  description: string;
  action: () => void;
  category: string;
}

export function KeyboardShortcuts() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.role === 'superadmin';

  const shortcuts: Shortcut[] = [
    // Global
    {
      keys: ['⌘', 'K'],
      description: 'Abrir busca rápida',
      action: () => {
        // Dispatch event to open command search
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
      },
      category: 'Global',
    },
    {
      keys: ['⌘', '/'],
      description: 'Mostrar atalhos',
      action: () => setIsHelpOpen(true),
      category: 'Global',
    },
    {
      keys: ['Esc'],
      description: 'Fechar modal/dropdown',
      action: () => {},
      category: 'Global',
    },
    // Navigation
    {
      keys: ['G', 'H'],
      description: 'Ir para Dashboard',
      action: () => navigate(isSuperAdmin ? '/' : '/tenant/dashboard'),
      category: 'Navegação',
    },
    {
      keys: ['G', 'P'],
      description: 'Ir para Perfil',
      action: () => navigate('/profile'),
      category: 'Navegação',
    },
    {
      keys: ['G', 'S'],
      description: 'Ir para Configurações',
      action: () => navigate(isSuperAdmin ? '/configuracoes' : '/tenant/config'),
      category: 'Navegação',
    },
    {
      keys: ['G', 'B'],
      description: 'Ir para Faturamento',
      action: () => navigate(isSuperAdmin ? '/billing' : '/tenant/billing'),
      category: 'Navegação',
    },
    // Actions
    {
      keys: ['⌘', 'L'],
      description: 'Sair da conta',
      action: () => logout(),
      category: 'Ações',
    },
  ];

  useEffect(() => {
    let keySequence: string[] = [];
    let sequenceTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Handle modifier + key combinations
      if (e.metaKey || e.ctrlKey) {
        if (e.key === '/') {
          e.preventDefault();
          setIsHelpOpen(true);
          return;
        }
        if (e.key === 'l') {
          e.preventDefault();
          logout();
          return;
        }
      }

      // Handle key sequences (G + H, G + P, etc.)
      const key = e.key.toUpperCase();
      keySequence.push(key);

      // Clear sequence after 1 second
      clearTimeout(sequenceTimeout);
      sequenceTimeout = setTimeout(() => {
        keySequence = [];
      }, 1000);

      // Check for matching shortcuts
      if (keySequence.length >= 2) {
        const sequence = keySequence.slice(-2).join('');
        
        switch (sequence) {
          case 'GH':
            navigate(isSuperAdmin ? '/' : '/tenant/dashboard');
            keySequence = [];
            break;
          case 'GP':
            navigate('/profile');
            keySequence = [];
            break;
          case 'GS':
            navigate(isSuperAdmin ? '/configuracoes' : '/tenant/config');
            keySequence = [];
            break;
          case 'GB':
            navigate(isSuperAdmin ? '/billing' : '/tenant/billing');
            keySequence = [];
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(sequenceTimeout);
    };
  }, [navigate, logout, isSuperAdmin]);

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                {category}
              </h4>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between py-2"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <kbd className="px-2 py-1 text-xs bg-muted rounded border border-border font-mono">
                            {key === '⌘' ? (
                              <Command className="h-3 w-3 inline" />
                            ) : (
                              key
                            )}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground mx-1">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground text-center pt-4 border-t border-border">
          Pressione <kbd className="px-1 py-0.5 bg-muted rounded border border-border mx-1">⌘</kbd>
          <kbd className="px-1 py-0.5 bg-muted rounded border border-border mx-1">/</kbd> 
          para abrir esta ajuda
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Keyboard shortcut indicator component
export function ShortcutHint({ keys }: { keys: string[] }) {
  return (
    <span className="hidden md:flex items-center gap-1 ml-auto">
      {keys.map((key, index) => (
        <span key={index}>
          <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border border-border">
            {key === '⌘' ? <Command className="h-3 w-3 inline" /> : key}
          </kbd>
          {index < keys.length - 1 && (
            <span className="text-muted-foreground text-xs mx-0.5">+</span>
          )}
        </span>
      ))}
    </span>
  );
}
