/**
 * Logger Service
 * 
 * Centraliza logs da aplicação com comportamento diferente por ambiente:
 * - Development: Exibe todos os logs no console
 * - Production: Silencia logs de debug/info, mantém apenas errors (pode ser integrado com Sentry/DataDog)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: Date;
}

class Logger {
  private isDev = import.meta.env.DEV;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  private createEntry(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date(),
    };
  }

  private addToHistory(entry: LogEntry) {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  private formatMessage(entry: LogEntry): string {
    const time = entry.timestamp.toLocaleTimeString('pt-BR');
    return `[${time}] [${entry.level.toUpperCase()}] ${entry.message}`;
  }

  /**
   * Debug level - Only shown in development
   */
  debug(message: string, data?: unknown) {
    const entry = this.createEntry('debug', message, data);
    this.addToHistory(entry);

    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.debug(this.formatMessage(entry), data ?? '');
    }
  }

  /**
   * Info level - Only shown in development
   */
  info(message: string, data?: unknown) {
    const entry = this.createEntry('info', message, data);
    this.addToHistory(entry);

    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.info(this.formatMessage(entry), data ?? '');
    }
  }

  /**
   * Warning level - Shown in both environments
   */
  warn(message: string, data?: unknown) {
    const entry = this.createEntry('warn', message, data);
    this.addToHistory(entry);

    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.warn(this.formatMessage(entry), data ?? '');
    }
    // TODO: Em produção, enviar para serviço de monitoramento
  }

  /**
   * Error level - Always logged, sent to monitoring in production
   */
  error(message: string, error?: unknown) {
    const entry = this.createEntry('error', message, error);
    this.addToHistory(entry);

    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.error(this.formatMessage(entry), error ?? '');
    } else {
      // Em produção: enviar para serviço de monitoramento (Sentry, DataDog, etc.)
      // TODO: Integrar com serviço de monitoramento
      // Sentry.captureException(error);
    }
  }

  /**
   * Get log history for debugging purposes
   */
  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  /**
   * Clear log history
   */
  clearHistory() {
    this.logHistory = [];
  }

  /**
   * Group related logs together (dev only)
   */
  group(label: string) {
    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.group(label);
    }
  }

  /**
   * End log group (dev only)
   */
  groupEnd() {
    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.groupEnd();
    }
  }

  /**
   * Log performance timing (dev only)
   */
  time(label: string) {
    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.time(label);
    }
  }

  /**
   * End performance timing (dev only)
   */
  timeEnd(label: string) {
    if (this.isDev) {
      // eslint-disable-next-line no-console
      console.timeEnd(label);
    }
  }
}

// Singleton instance
export const logger = new Logger();

// Named exports for convenience
export const { debug, info, warn, error } = {
  debug: (message: string, data?: unknown) => logger.debug(message, data),
  info: (message: string, data?: unknown) => logger.info(message, data),
  warn: (message: string, data?: unknown) => logger.warn(message, data),
  error: (message: string, err?: unknown) => logger.error(message, err),
};
