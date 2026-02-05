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
  private enabled: boolean = !isDev && !isWeb;
  private initialized: boolean = false;

  constructor() {
    console.log('🚨 Using simple error logger (Firebase removed)');
    this.initialized = true;
  }

  isEnabled(): boolean {
    return this.enabled && this.initialized;
  }

  async setUserId(userId: string): Promise<void> {
    if (!this.isEnabled()) return;
    errorLogger.setUserId(userId);
    if (isDev) {
      console.log(`👤 User ID: ${userId}`);
    }
  }

  async setAttribute(key: string, value: string | number | boolean): Promise<void> {
    if (isDev) {
      console.log(`📝 ${key} = ${value}`);
    }
  }

  async setGameStats(stats: Record<string, number>): Promise<void> {
    if (isDev) {
      console.log('📊 Game Stats:', stats);
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
    console.log(`🚨 Error logging ${enabled ? 'enabled' : 'disabled'}`);
  }
}

export const crashReportingService = new CrashReportingService();