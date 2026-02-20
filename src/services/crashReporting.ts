import { errorLogger } from '../utils/errorLogger';

const isDev = __DEV__;
const isWeb = typeof window !== 'undefined' && typeof navigator !== 'undefined';

interface CrashContext {
  userId?: string;
  gameAge?: number;
  wealth?: number;
  stats?: Record<string, number>;
  action?: string;
  eventId?: string;
  phase?: string;
}

class CrashReportingService {
  private enabled: boolean = !isWeb;
  private initialized: boolean = false;

  constructor() {
    if (isDev) {
      console.log('Crash reporting initialized with local logger backend');
    }
    this.initialized = true;
  }

  isEnabled(): boolean {
    return this.enabled && this.initialized;
  }

  async setUserId(userId: string): Promise<void> {
    if (!this.isEnabled()) return;
    errorLogger.setUserId(userId);
    if (isDev) {
      console.log('Crash reporting user context updated');
    }
  }

  async setAttribute(key: string, value: string | number | boolean): Promise<void> {
    if (isDev) {
      console.log(`[CrashAttr] ${key}=${String(value)}`);
    }
  }

  async setGameStats(stats: Record<string, number>): Promise<void> {
    if (isDev) {
      console.log('[CrashStats]', stats);
    }
  }

  async logError(error: Error, context?: CrashContext): Promise<void> {
    errorLogger.logError(error, context);
  }

  async logNonFatal(error: Error, context?: string): Promise<void> {
    errorLogger.logNonFatal(error, context);
  }

  async logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    errorLogger.logMessage(message, level);
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (isDev) {
      console.log(`Crash reporting ${enabled ? 'enabled' : 'disabled'}`);
    }
  }
}

export const crashReportingService = new CrashReportingService();
