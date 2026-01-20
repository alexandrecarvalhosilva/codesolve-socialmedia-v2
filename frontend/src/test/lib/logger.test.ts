import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('Logger Service', () => {
  const originalEnv = import.meta.env.DEV;
  
  beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'group').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    vi.spyOn(console, 'time').mockImplementation(() => {});
    vi.spyOn(console, 'timeEnd').mockImplementation(() => {});
    logger.clearHistory();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Log History', () => {
    it('deve adicionar logs ao histórico', () => {
      logger.info('Test message');
      logger.warn('Warning message');
      logger.error('Error message');

      const history = logger.getHistory();
      expect(history).toHaveLength(3);
    });

    it('deve manter no máximo 100 logs no histórico', () => {
      for (let i = 0; i < 150; i++) {
        logger.info(`Message ${i}`);
      }

      const history = logger.getHistory();
      expect(history.length).toBeLessThanOrEqual(100);
    });

    it('deve limpar histórico corretamente', () => {
      logger.info('Test');
      logger.warn('Test');
      expect(logger.getHistory()).toHaveLength(2);

      logger.clearHistory();
      expect(logger.getHistory()).toHaveLength(0);
    });

    it('deve incluir timestamp nos logs', () => {
      logger.info('Test message');
      
      const history = logger.getHistory();
      expect(history[0].timestamp).toBeInstanceOf(Date);
    });

    it('deve incluir nível correto nos logs', () => {
      logger.debug('Debug');
      logger.info('Info');
      logger.warn('Warn');
      logger.error('Error');

      const history = logger.getHistory();
      expect(history[0].level).toBe('debug');
      expect(history[1].level).toBe('info');
      expect(history[2].level).toBe('warn');
      expect(history[3].level).toBe('error');
    });

    it('deve incluir dados adicionais nos logs', () => {
      const data = { userId: '123', action: 'login' };
      logger.info('User logged in', data);

      const history = logger.getHistory();
      expect(history[0].data).toEqual(data);
    });
  });

  describe('Console Output (Development)', () => {
    it('debug deve chamar console.debug em dev', () => {
      logger.debug('Debug message');
      expect(console.debug).toHaveBeenCalled();
    });

    it('info deve chamar console.info em dev', () => {
      logger.info('Info message');
      expect(console.info).toHaveBeenCalled();
    });

    it('warn deve chamar console.warn em dev', () => {
      logger.warn('Warning message');
      expect(console.warn).toHaveBeenCalled();
    });

    it('error deve chamar console.error em dev', () => {
      logger.error('Error message');
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Grouping', () => {
    it('group deve chamar console.group em dev', () => {
      logger.group('Test Group');
      expect(console.group).toHaveBeenCalledWith('Test Group');
    });

    it('groupEnd deve chamar console.groupEnd em dev', () => {
      logger.groupEnd();
      expect(console.groupEnd).toHaveBeenCalled();
    });
  });

  describe('Performance Timing', () => {
    it('time deve chamar console.time em dev', () => {
      logger.time('operation');
      expect(console.time).toHaveBeenCalledWith('operation');
    });

    it('timeEnd deve chamar console.timeEnd em dev', () => {
      logger.timeEnd('operation');
      expect(console.timeEnd).toHaveBeenCalledWith('operation');
    });
  });

  describe('Log Entry Structure', () => {
    it('deve criar entrada de log com estrutura correta', () => {
      logger.info('Test message', { key: 'value' });

      const history = logger.getHistory();
      const entry = history[0];

      expect(entry).toHaveProperty('level');
      expect(entry).toHaveProperty('message');
      expect(entry).toHaveProperty('data');
      expect(entry).toHaveProperty('timestamp');
    });

    it('deve preservar mensagem original', () => {
      const message = 'This is a test message';
      logger.info(message);

      const history = logger.getHistory();
      expect(history[0].message).toBe(message);
    });
  });

  describe('Error Handling', () => {
    it('deve logar erros com objeto Error', () => {
      const error = new Error('Test error');
      logger.error('Something failed', error);

      const history = logger.getHistory();
      expect(history[0].data).toBe(error);
    });

    it('deve logar erros com string', () => {
      logger.error('Something failed', 'Error details');

      const history = logger.getHistory();
      expect(history[0].data).toBe('Error details');
    });
  });
});
