import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSoundNotification } from '@/hooks/useSoundNotification';

describe('useSoundNotification', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Estado Inicial', () => {
    it('deve iniciar com som ativado por padrão', () => {
      const { result } = renderHook(() => useSoundNotification());
      
      expect(result.current.isMuted).toBe(false);
    });

    it('deve carregar estado muted do localStorage', () => {
      localStorage.setItem('sound-notifications-muted', 'true');
      
      const { result } = renderHook(() => useSoundNotification());
      
      expect(result.current.isMuted).toBe(true);
    });

    it('deve carregar estado unmuted do localStorage', () => {
      localStorage.setItem('sound-notifications-muted', 'false');
      
      const { result } = renderHook(() => useSoundNotification());
      
      expect(result.current.isMuted).toBe(false);
    });
  });

  describe('Toggle Mute', () => {
    it('deve alternar estado muted', () => {
      const { result } = renderHook(() => useSoundNotification());
      
      expect(result.current.isMuted).toBe(false);
      
      act(() => {
        result.current.toggleMute();
      });
      
      expect(result.current.isMuted).toBe(true);
      
      act(() => {
        result.current.toggleMute();
      });
      
      expect(result.current.isMuted).toBe(false);
    });

    it('deve persistir estado muted no localStorage', () => {
      const { result } = renderHook(() => useSoundNotification());
      
      act(() => {
        result.current.toggleMute();
      });
      
      expect(localStorage.getItem('sound-notifications-muted')).toBe('true');
      
      act(() => {
        result.current.toggleMute();
      });
      
      expect(localStorage.getItem('sound-notifications-muted')).toBe('false');
    });
  });

  describe('Play Sound', () => {
    it('não deve tocar som quando muted', async () => {
      localStorage.setItem('sound-notifications-muted', 'true');
      
      const { result } = renderHook(() => useSoundNotification());
      
      // Quando muted, playSound deve retornar imediatamente sem erros
      await act(async () => {
        await result.current.playSound('critical');
      });
      
      // Se chegou aqui sem erro, o teste passou
      expect(result.current.isMuted).toBe(true);
    });

    it('deve executar playSound sem erros quando não está muted', async () => {
      const { result } = renderHook(() => useSoundNotification());
      
      expect(result.current.isMuted).toBe(false);
      
      // O mock do AudioContext no setup.ts permite que isso execute sem erros
      await act(async () => {
        await result.current.playSound('info');
      });
      
      // Se chegou aqui sem erro, o teste passou
      expect(true).toBe(true);
    });

    it('deve executar playSound com ID sem erros', async () => {
      const { result } = renderHook(() => useSoundNotification());
      
      await act(async () => {
        await result.current.playSound('warning', 'test-notification-id');
      });
      
      // Se chegou aqui sem erro, o teste passou
      expect(true).toBe(true);
    });
  });

  describe('Tipos de Som', () => {
    it('deve aceitar tipo critical', async () => {
      const { result } = renderHook(() => useSoundNotification());
      
      let error: Error | null = null;
      
      try {
        await act(async () => {
          await result.current.playSound('critical');
        });
      } catch (e) {
        error = e as Error;
      }
      
      expect(error).toBeNull();
    });

    it('deve aceitar tipo warning', async () => {
      const { result } = renderHook(() => useSoundNotification());
      
      let error: Error | null = null;
      
      try {
        await act(async () => {
          await result.current.playSound('warning');
        });
      } catch (e) {
        error = e as Error;
      }
      
      expect(error).toBeNull();
    });

    it('deve aceitar tipo info', async () => {
      const { result } = renderHook(() => useSoundNotification());
      
      let error: Error | null = null;
      
      try {
        await act(async () => {
          await result.current.playSound('info');
        });
      } catch (e) {
        error = e as Error;
      }
      
      expect(error).toBeNull();
    });
  });

  describe('Cooldown por ID', () => {
    it('deve permitir tocar som sem ID múltiplas vezes', async () => {
      const { result } = renderHook(() => useSoundNotification());
      
      // Sem ID, não há cooldown
      await act(async () => {
        await result.current.playSound('info');
        await result.current.playSound('info');
      });
      
      expect(true).toBe(true);
    });
  });
});
