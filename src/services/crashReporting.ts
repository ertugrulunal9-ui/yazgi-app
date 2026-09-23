import { errorLogger } from '../utils/errorLogger';
import { devLog } from '../utils/devLogger';

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

// Local type — top-level import yapılmıyor; native modül Expo Go'da mevcut olmayabilir
interface CrashlyticsInstance {
  setUserId: (id: string) => Promise<void>;
  setAttribute: (name: string, value: string) => Promise<void>;
  setAttributes: (attrs: Record<string, string>) => Promise<void>;
  recordError: (error: Error) => void;
  log: (message: string) => void;
  setCrashlyticsCollectionEnabled: (enabled: boolean) => Promise<void>;
}

class CrashReportingService {
  private enabled: boolean = !isWeb;
  private initialized: boolean = false;
  private crashlytics: CrashlyticsInstance | null = null;
  private loadAttempted: boolean = false;

  constructor() {
    devLog.log('[CrashReporting] initialized');
    this.initialized = true;
  }

  // Firebase Crashlytics modülünü lazy yükle.
  // Expo Go'da veya native build olmadan çalışırsa null döner.
  private async getCrashlytics(): Promise<CrashlyticsInstance | null> {
    if (isWeb) return null;
    if (this.loadAttempted) return this.crashlytics;

    this.loadAttempted = true;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('@react-native-firebase/crashlytics');
      this.crashlytics = mod.default() as CrashlyticsInstance;
      devLog.log('[Crashlytics] modül yüklendi');
      return this.crashlytics;
    } catch {
      devLog.warn('[Crashlytics] modül yüklenemedi — Expo Go veya native build yok');
      return null;
    }
  }

  isEnabled(): boolean {
    return this.enabled && this.initialized;
  }

  async setUserId(userId: string): Promise<void> {
    if (!this.isEnabled()) return;
    errorLogger.setUserId(userId);
    const cl = await this.getCrashlytics();
    if (!cl) return;
    try {
      // Tam kullanıcı adı yerine kısaltılmış anonim ID gönder
      const anonId = userId.length > 0 ? `u_${userId.slice(0, 10)}` : '';
      await cl.setUserId(anonId);
    } catch (e) {
      devLog.warn('[Crashlytics] setUserId başarısız', e);
    }
  }

  async setAttribute(key: string, value: string | number | boolean): Promise<void> {
    devLog.log(`[CrashAttr] ${key}=${String(value)}`);
    const cl = await this.getCrashlytics();
    if (!cl) return;
    try {
      await cl.setAttribute(key, String(value));
    } catch (e) {
      devLog.warn('[Crashlytics] setAttribute başarısız', e);
    }
  }

  async setGameStats(stats: Record<string, number>): Promise<void> {
    devLog.log('[CrashStats]', stats);
    const cl = await this.getCrashlytics();
    if (!cl) return;
    try {
      const attrs: Record<string, string> = {};
      for (const [key, value] of Object.entries(stats)) {
        attrs[key] = String(value);
      }
      await cl.setAttributes(attrs);
    } catch (e) {
      devLog.warn('[Crashlytics] setGameStats başarısız', e);
    }
  }

  async logError(error: Error, context?: CrashContext): Promise<void> {
    // Yerel logger her zaman çalışır (dev console + storage)
    errorLogger.logError(error, context);

    const cl = await this.getCrashlytics();
    if (!cl) return;
    try {
      if (context) {
        // Context'i Crashlytics'e breadcrumb olarak ekle
        const safeCtx = JSON.stringify({
          gameAge: context.gameAge,
          phase: context.phase,
          action: context.action,
          eventId: context.eventId,
        });
        cl.log(`Error context: ${safeCtx}`);
      }
      cl.recordError(error);
    } catch (e) {
      devLog.warn('[Crashlytics] recordError başarısız', e);
    }
  }

  async logNonFatal(error: Error, context?: string): Promise<void> {
    errorLogger.logNonFatal(error, context);

    const cl = await this.getCrashlytics();
    if (!cl) return;
    try {
      if (context) {
        cl.log(`NonFatal: ${context.slice(0, 1024)}`);
      }
      cl.recordError(error);
    } catch (e) {
      devLog.warn('[Crashlytics] recordError (non-fatal) başarısız', e);
    }
  }

  async logMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): Promise<void> {
    errorLogger.logMessage(message, level);

    const cl = await this.getCrashlytics();
    if (!cl) return;
    try {
      // Crashlytics.log() → bir sonraki crash raporuna breadcrumb olarak eklenir
      cl.log(`[${level.toUpperCase()}] ${message}`);
    } catch (e) {
      devLog.warn('[Crashlytics] log başarısız', e);
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    // Crashlytics koleksiyonunu aç/kapat (genellikle sonraki oturumdan geçerli olur)
    void this.getCrashlytics().then(cl => {
      if (!cl) return;
      cl.setCrashlyticsCollectionEnabled(enabled).catch(() => {});
    });
    devLog.log(`[CrashReporting] ${enabled ? 'etkin' : 'devre dışı'}`);
  }
}

export const crashReportingService = new CrashReportingService();
