/**
 * Monetization Service - Pure Ad-Only
 * Yazgi - AdMob rewarded + interstitial ads
 */
import { AppState, Platform } from 'react-native';
import SaveManager from '../save/SaveManager';
import { isPremium as checkPremiumSubscription } from './subscriptionManager';
import { devLog } from '../utils/devLogger';
import { loadAdMobModule } from './adMobModule';

export type AdType = 'rewarded' | 'interstitial';
export type RewardType = 'energy' | 'intelligence' | 'money';
export type RewardedPlacement =
  | 'exam_prep'
  | 'energy_depleted'
  | 'crisis_recovery'
  | 'ending_alternative'
  | 'undo_choice';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string;
  localizedPrice?: string;
  currencyCode?: string;
}

export interface PurchaseResult {
  success: boolean;
  productId: string;
  error?: string;
}

export interface RewardedAdResult {
  success: boolean;
  reward?: {
    type: RewardType;
    amount: number;
  };
  error?: string;
}

export interface ContextualRewardedAdResult {
  success: boolean;
  placement: RewardedPlacement;
  rewardType: RewardType | 'utility';
  amount: number;
  error?: string;
}

export interface RewardedAdShowOptions {
  /**
   * Reklam yüklendiğinde, gösterilmeden hemen önce sorulur. false dönerse reklam açılmaz,
   * sonuç `REWARDED_AD_CANCELLED_ERROR` ile başarısız döner ve günlük hak düşmez
   * (ör. oyuncu reklam yüklenirken sonuç ekranından çıktıysa).
   */
  shouldShow?: () => boolean;
}

export const REWARDED_AD_CANCELLED_ERROR = 'cancelled';
export const REWARDED_AD_LOAD_TIMEOUT_ERROR = 'Rewarded ad load timed out';
/**
 * UMP `canRequestAds` false iken ödüllü reklam istenmez; oyuncu "reklam şu an yok" mesajını görür
 * ("unavailable" geçtiği için `getAdErrorMessage` bunu mevcut Türkçe metne çevirir), günlük hak düşmez.
 */
export const REWARDED_AD_CONSENT_ERROR = 'Ads unavailable: consent not granted';
/**
 * Ödüllü reklam isteğinde LOADED ya da ERROR bu sürede gelmezse istek bırakılır; sonradan gelen
 * LOADED reklam açmaz. Normal bir istek birkaç saniyede biter; 15 sn yavaş mobil bağlantıya pay
 * bırakır ama oyuncuyu "yükleniyor"da bekletmez ve bayat bir reklamın geç açılmasını önler.
 */
export const REWARDED_AD_LOAD_TIMEOUT_MS = 15_000;
/**
 * Geçiş reklamı önceden (arka planda) yüklenir; oyuncu beklemez. LOADED ya da ERROR bu sürede
 * gelmezse istek bırakılır (yükleme "sürüyor"da takılı kalmasın), geç gelen LOADED yok sayılır.
 * Ödüllüden uzun: yavaş bağlantıda istek boşa gitmesin.
 */
export const INTERSTITIAL_AD_LOAD_TIMEOUT_MS = 30_000;
/**
 * Önceden yüklenen reklam bu süreden eskiyse gösterilmez, atılır (yüklenen tam ekran reklamlar
 * zamanla geçersiz olur; sınır ihtiyatlı tutuldu).
 */
export const INTERSTITIAL_AD_MAX_AGE_MS = 55 * 60 * 1000;
/**
 * `show()` sonrası OPENED bu sürede gelmezse gösterim başarısız sayılır ve yuva bırakılır. Kütüphane
 * sessiz gösterim hatasını bildirmeyebiliyor; aksi hâlde yuva oturum boyunca "showing"de takılır ve
 * başka geçiş reklamı yüklenmez. Yalnızca SDK OPENED olayını sağlıyorsa kurulur.
 */
export const INTERSTITIAL_AD_OPEN_TIMEOUT_MS = 10_000;

/**
 * Uygulama arka plandayken (Ana ekran / geri tuşu) tam ekran reklam açılmaz: uygulamayı öne çekip
 * beklenmedik reklam göstermesin. Yalnızca gösterim öncesinde bakılır; reklam açıkken uygulamanın
 * arka plana geçmesi sonucu etkilemez. Ödüllü ve geçiş reklamı ortak kullanır.
 */
const isAppInForeground = (): boolean => (
  AppState.currentState == null || AppState.currentState === 'active'
);

const canShowRewardedAd = (shouldShow?: () => boolean): boolean => {
  if (!isAppInForeground()) return false;
  if (!shouldShow) return true;
  try {
    return shouldShow() === true;
  } catch {
    return false;
  }
};

export type InterstitialBlockReason =
  | 'shown'
  | 'ads_disabled'
  | 'premium_user'
  | 'session_cap'
  | 'cooldown'
  | 'provider_unavailable'
  | 'ad_error'
  /** Doğal arada önceden yüklenmiş reklam hazır değildi: fırsat atlandı, sonradan gösterilmez. */
  | 'not_ready'
  /** Doğal arada uygulama ön planda değildi. */
  | 'background';

export interface InterstitialAdResult {
  shown: boolean;
  reason: InterstitialBlockReason;
  provider: 'admob' | 'mock';
  cooldownRemainingMs?: number;
}

export type AuthTokenProvider = () => Promise<string | null> | string | null;

type AdMobFactory = () => {
  initialize: () => Promise<unknown>;
  setRequestConfiguration: (requestConfiguration: { maxAdContentRating?: string }) => Promise<unknown>;
};

type AdMobModule = {
  default?: AdMobFactory;
  MaxAdContentRating?: {
    T: string;
  };
  InterstitialAd?: {
    createForAdRequest: (adUnitId: string, requestOptions?: Record<string, unknown>) => any;
  };
  RewardedAd?: {
    createForAdRequest: (adUnitId: string, requestOptions?: Record<string, unknown>) => any;
  };
  AdEventType?: {
    LOADED: string;
    ERROR: string;
    CLOSED: string;
    OPENED?: string;
  };
  RewardedAdEventType?: {
    LOADED: string;
    EARNED_REWARD: string;
  };
  TestIds?: {
    REWARDED: string;
    INTERSTITIAL: string;
  };
};

interface AdMobConfig {
  iosRewardedUnitId?: string;
  androidRewardedUnitId?: string;
  iosInterstitialUnitId?: string;
  androidInterstitialUnitId?: string;
}

interface MonetizationConfig {
  interstitialSessionLimit?: number | string;
  interstitialCooldownMs?: number | string;
}

/** Kütüphanenin geçiş reklamı nesnesinden kullanılan kısım. */
interface InterstitialAdHandle {
  addAdEventListener: (type: string, listener: (payload?: unknown) => void) => () => void;
  load: () => void;
  show: () => unknown;
  /** Kütüphane hata/kapanma sonrası false yapar. */
  loaded?: boolean;
}

/** Önceden yüklenen tek geçiş reklamı. LOADED yalnızca `ready` yapar; reklamı hiçbir zaman açmaz. */
interface InterstitialSlot {
  ad: InterstitialAdHandle;
  state: 'loading' | 'ready' | 'showing';
  /** İstek hangi kişiselleştirme tercihiyle yapıldı (tercih değişirse reklam atılır). */
  personalized: boolean;
  loadedAt: number;
  loadTimer: ReturnType<typeof setTimeout> | null;
  /** `show()` sonrası OPENED bekçisi (bkz. INTERSTITIAL_AD_OPEN_TIMEOUT_MS). */
  openTimer: ReturnType<typeof setTimeout> | null;
  unsubs: (() => void)[];
  /** Gösterim sürerken: reklam kapanınca (true) ya da gösterilemeyince (false) çağrılır. */
  onShowSettled: ((shown: boolean) => void) | null;
}

const STORAGE_AD_COUNT_KEY = '@yazgi/ad_count';
const hasLocalStorage = typeof localStorage !== 'undefined';
const isDevRuntime =
  Boolean((globalThis as { __DEV__?: boolean }).__DEV__) || process.env.NODE_ENV !== 'production';
const isTestRuntime = process.env.NODE_ENV === 'test';
const MOCK_REWARDED_AD_DELAY_MS = isTestRuntime ? 0 : 1200;
const MOCK_INTERSTITIAL_DELAY_MS = isTestRuntime ? 0 : 800;
const DEFAULT_INTERSTITIAL_SESSION_LIMIT = 2;
const DEFAULT_INTERSTITIAL_COOLDOWN_MS = isTestRuntime ? 0 : 3 * 60 * 1000;
const INTERSTITIAL_SESSION_LIMIT_BOUNDS = { min: 0, max: 10 } as const;
const INTERSTITIAL_COOLDOWN_MS_BOUNDS = { min: 0, max: 3_600_000 } as const;
const PLACEHOLDER_AD_IDENTIFIER_PATTERN = /(TODO|REPLACE|YOUR_|CHANGE_ME|<.*>|PLACEHOLDER)/i;
const KNOWN_TEST_AD_UNIT_IDS = new Set([
  'ca-app-pub-3940256099942544/5224354917',
  'ca-app-pub-3940256099942544/1033173712',
  'ca-app-pub-3940256099942544/1712485313',
  'ca-app-pub-3940256099942544/4411468910',
]);
/**
 * Azami reklam içerik derecesi (kullanıcı kararı 2026-11-08, U8): "T" = gençler ve üstü
 * (SDK `MaxAdContentRating.T`). Tüm reklam isteklerine SDK başlatılmadan önce bir kez uygulanır.
 */
export const AD_MAX_CONTENT_RATING = 'T';

let asyncStorageModule: any = null;

const getAsyncStorage = async () => {
  if (asyncStorageModule) return asyncStorageModule;
  try {
    const mod = await import('@react-native-async-storage/async-storage');
    asyncStorageModule = (mod as any).default ?? mod;
    return asyncStorageModule;
  } catch {
    return null;
  }
};

const readStorageItem = async (key: string): Promise<string | null> => {
  if (hasLocalStorage) return localStorage.getItem(key);
  const asyncStorage = await getAsyncStorage();
  if (!asyncStorage) return null;
  return asyncStorage.getItem(key);
};

const writeStorageItem = async (key: string, value: string): Promise<void> => {
  if (hasLocalStorage) {
    localStorage.setItem(key, value);
    return;
  }
  const asyncStorage = await getAsyncStorage();
  if (asyncStorage) {
    await asyncStorage.setItem(key, value);
  }
};

const optionalRequire = (moduleName: string): any => {
  try {
    if (typeof require !== 'function') return null;

    switch (moduleName) {
      case 'expo-constants':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('expo-constants');
      case 'react-native-google-mobile-ads':
        return loadAdMobModule();
      default:
        return null;
    }
  } catch {
    return null;
  }
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeConfigString = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const normalizeAdIdentifier = (value: unknown): string | null => {
  const normalized = normalizeConfigString(value);
  if (!normalized) return null;
  if (PLACEHOLDER_AD_IDENTIFIER_PATTERN.test(normalized)) return null;
  return normalized;
};

const toBoundedInteger = (
  value: unknown,
  bounds: { min: number; max: number }
): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const rounded = Math.floor(value);
    return rounded >= bounds.min && rounded <= bounds.max ? rounded : null;
  }
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (!Number.isFinite(parsed)) return null;
    const rounded = Math.floor(parsed);
    return rounded >= bounds.min && rounded <= bounds.max ? rounded : null;
  }
  return null;
};

const parseAppExtras = (): Record<string, unknown> => {
  const constantsModule = optionalRequire('expo-constants');
  const constants = constantsModule?.default ?? constantsModule;
  const expoConfig = constants?.expoConfig ?? constants?.manifest ?? null;
  return isObjectRecord(expoConfig?.extra) ? expoConfig.extra : {};
};

const getAdMobConfig = (): AdMobConfig => {
  const extras = parseAppExtras();
  const config = extras.admob;
  return isObjectRecord(config) ? (config as AdMobConfig) : {};
};

const getMonetizationConfig = (): MonetizationConfig => {
  const extras = parseAppExtras();
  const config = extras.monetization;
  return isObjectRecord(config) ? (config as MonetizationConfig) : {};
};

const getAdUnitIdFromConfig = (kind: AdType): string | null => {
  const envKey =
    kind === 'rewarded'
      ? Platform.OS === 'ios'
        ? 'EXPO_PUBLIC_ADMOB_IOS_REWARDED_UNIT_ID'
        : 'EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID'
      : Platform.OS === 'ios'
        ? 'EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_UNIT_ID'
        : 'EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_UNIT_ID';

  const envValue = normalizeAdIdentifier(process.env[envKey]);
  if (envValue) return envValue;

  const adMobConfig = getAdMobConfig();
  const configKey =
    kind === 'rewarded'
      ? Platform.OS === 'ios'
        ? 'iosRewardedUnitId'
        : 'androidRewardedUnitId'
      : Platform.OS === 'ios'
        ? 'iosInterstitialUnitId'
        : 'androidInterstitialUnitId';

  return normalizeAdIdentifier(adMobConfig[configKey]);
};

const getRuntimeInterstitialConfig = (): { sessionLimit: number; cooldownMs: number } => {
  const config = getMonetizationConfig();

  const fromEnvSessionCap = toBoundedInteger(
    process.env.EXPO_PUBLIC_INTERSTITIAL_SESSION_CAP,
    INTERSTITIAL_SESSION_LIMIT_BOUNDS
  );
  const fromEnvCooldown = toBoundedInteger(
    process.env.EXPO_PUBLIC_INTERSTITIAL_COOLDOWN_MS,
    INTERSTITIAL_COOLDOWN_MS_BOUNDS
  );

  const fromConfigSessionCap = toBoundedInteger(
    config.interstitialSessionLimit,
    INTERSTITIAL_SESSION_LIMIT_BOUNDS
  );
  const fromConfigCooldown = toBoundedInteger(
    config.interstitialCooldownMs,
    INTERSTITIAL_COOLDOWN_MS_BOUNDS
  );

  return {
    sessionLimit: fromEnvSessionCap ?? fromConfigSessionCap ?? DEFAULT_INTERSTITIAL_SESSION_LIMIT,
    cooldownMs: fromEnvCooldown ?? fromConfigCooldown ?? DEFAULT_INTERSTITIAL_COOLDOWN_MS,
  };
};

class MonetizationService {
  private isInitialized = false;
  private adProvider: 'admob' | 'mock' = 'mock';
  private adMobModule: AdMobModule | null = null;
  private adsEnabled = true;
  private personalizedAdsEnabled = false;
  private rewardedAdCount = 0;
  private dailyAdLimit = 8;
  private interstitialShownThisSession = 0;
  private interstitialSessionLimit = DEFAULT_INTERSTITIAL_SESSION_LIMIT;
  private interstitialCooldownMs = DEFAULT_INTERSTITIAL_COOLDOWN_MS;
  private lastInterstitialShownAt = 0;
  private lastAdResetDate: string | null = null;
  private interstitialSlot: InterstitialSlot | null = null;
  /**
   * Başlatma bitmeden istenen ön yükleme başlatma bitince yapılır. Ön yükleme servisi kendisi
   * başlatmaz: açılışta başlatma UMP izin akışından sonra yapılıyor (`useAppBootstrap`).
   */
  private interstitialPreloadRequested = false;
  /** Süren başlatma: eşzamanlı çağrılar aynı başlatmayı bekler (istek yapılandırması bir kez). */
  private initializePromise: Promise<void> | null = null;
  /**
   * UMP `canRequestAds` (Google: reklam isteği ve SDK başlatma yalnızca true iken). Varsayılan false:
   * UMP cevap vermeden basılan ödüllü reklam SDK'yı başlatıp istek atmasın (Y-037 #2). Açılışta
   * `useAppBootstrap` UMP akışı bitince gerçek değeri `setCanRequestAds` ile yazar. Kapı yalnızca gerçek
   * AdMob yolunu etkiler (mock/web/Expo Go reklam istek yapmaz).
   */
  private canRequestAds = false;
  /** Günlük sayaç diskten okundu mu; okunmadan diske yazılmaz (Y-037 #4). */
  private adCountLoaded = false;
  /** AdMob modülü var ama `canRequestAds` false olduğu için SDK başlatılmadı; true olunca başlatılır. */
  private adsAwaitingConsent = false;
  private pendingAdMobImport: AdMobModule | null = null;
  private adsResumePromise: Promise<void> | null = null;
  private readonly allowMockAds = isDevRuntime;

  __reset() {
    if (this.interstitialSlot) this.finishInterstitialSlot(this.interstitialSlot, false);
    this.interstitialPreloadRequested = false;
    this.initializePromise = null;
    this.canRequestAds = false;
    this.adCountLoaded = false;
    this.adsAwaitingConsent = false;
    this.pendingAdMobImport = null;
    this.adsResumePromise = null;
    this.isInitialized = false;
    this.adProvider = 'mock';
    this.adMobModule = null;
    this.adsEnabled = true;
    this.personalizedAdsEnabled = false;
    this.rewardedAdCount = 0;
    this.dailyAdLimit = 8;
    this.interstitialShownThisSession = 0;
    this.interstitialSessionLimit = DEFAULT_INTERSTITIAL_SESSION_LIMIT;
    this.interstitialCooldownMs = DEFAULT_INTERSTITIAL_COOLDOWN_MS;
    this.lastInterstitialShownAt = 0;
    this.lastAdResetDate = null;
    SaveManager.setPremiumUnlocked(false);
    SaveManager.setAdsDisabled(false);
  }

  __reset__() {
    this.__reset();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializePromise) return this.initializePromise;

    const pending = this.runInitialize();
    this.initializePromise = pending;
    const clear = () => {
      if (this.initializePromise === pending) this.initializePromise = null;
    };
    pending.then(clear, clear);
    return pending;
  }

  private async runInitialize(): Promise<void> {
    const interstitialRuntime = getRuntimeInterstitialConfig();
    this.interstitialSessionLimit = interstitialRuntime.sessionLimit;
    this.interstitialCooldownMs = interstitialRuntime.cooldownMs;

    await this.initializeAds();
    await this.loadAdCount();
    this.adCountLoaded = true;
    this.resetDailyAdCountIfNeeded();

    SaveManager.setPremiumUnlocked(checkPremiumSubscription());
    SaveManager.setAdsDisabled(false);

    this.isInitialized = true;
    devLog.log(
      `[monetization] initialized (ads=${this.adProvider}, session_cap=${this.interstitialSessionLimit}, cooldown_ms=${this.interstitialCooldownMs})`
    );

    await this.resumeAdsAfterConsent();
  }

  /**
   * Reklam istekleri UMP `canRequestAds` false olduğu sürece yapılmaz. Mock/web sağlayıcı istek
   * yapmadığı için etkilenmez; AdMob modülü olup SDK başlatma bekliyorsa (`adsAwaitingConsent`) da engel sürer.
   */
  private consentBlocksAds(): boolean {
    return !this.canRequestAds && (this.adsAwaitingConsent || this.adProvider === 'admob');
  }

  /**
   * Başlatma bitti ve istek izni var: bekleyen SDK başlatmayı yapar, sonra bekleyen ön yüklemeyi
   * (gerekiyorsa) mevcut yoldan ister. Eşzamanlı çağrılar aynı işi paylaşır.
   */
  private resumeAdsAfterConsent(): Promise<void> {
    if (this.adsResumePromise) return this.adsResumePromise;
    const run = (async () => {
      if (this.adsAwaitingConsent && this.canRequestAds && this.pendingAdMobImport) {
        const pending = this.pendingAdMobImport;
        this.adsAwaitingConsent = false;
        this.pendingAdMobImport = null;
        await this.startAdMobSdk(pending);
      }
      if (this.interstitialPreloadRequested && !this.consentBlocksAds()) {
        this.interstitialPreloadRequested = false;
        this.preloadInterstitialAd();
      }
    })();
    this.adsResumePromise = run;
    const clear = () => {
      if (this.adsResumePromise === run) this.adsResumePromise = null;
    };
    run.then(clear, clear);
    return run;
  }

  async getProducts(): Promise<Product[]> {
    if (!this.isInitialized) await this.initialize();
    return [];
  }

  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (!this.isInitialized) await this.initialize();
    return {
      success: false,
      productId,
      error: 'IAP disabled: pure ad-only build',
    };
  }

  async restorePurchases(): Promise<string[]> {
    if (!this.isInitialized) await this.initialize();
    return [];
  }

  hasProduct(_productId: string): boolean {
    return false;
  }

  isPremium(): boolean {
    return checkPremiumSubscription();
  }

  async showRewardedAd(rewardType: RewardType, options?: RewardedAdShowOptions): Promise<RewardedAdResult> {
    if (!this.isInitialized) await this.initialize();
    // İzin yeni geldiyse ve SDK başlıyorsa bitmesini bekle ("reklam yok" demesin).
    if (this.adsResumePromise) {
      try {
        await this.adsResumePromise;
      } catch {
        // Başlatma hatası: sağlayıcı mock kalır, aşağıdaki mevcut yollar karar verir.
      }
    }

    if (this.isPremium()) {
      return { success: false, error: 'Premium user — ads disabled' };
    }

    this.resetDailyAdCountIfNeeded();

    if (!this.adsEnabled) {
      return {
        success: false,
        error: 'Ads disabled',
      };
    }

    if ((!this.allowMockAds || isTestRuntime) && this.rewardedAdCount >= this.dailyAdLimit) {
      return {
        success: false,
        error: `Daily ad limit reached (${this.dailyAdLimit})`,
      };
    }

    // Hak düşmeden: izin yokken ne AdMob ne de mock yedek reklam gösterilir.
    if (this.consentBlocksAds()) {
      return { success: false, error: REWARDED_AD_CONSENT_ERROR };
    }

    const fallbackAmount = this.getFallbackRewardAmount(rewardType);

    if (this.adProvider === 'admob' && this.adMobModule) {
      const result = await this.showRewardedAdWithAdMob(rewardType, fallbackAmount, options?.shouldShow);
      if (result.success) {
        this.rewardedAdCount += 1;
        this.saveAdCount();
      }
      return result;
    }

    if (!this.allowMockAds) {
      return {
        success: false,
        error: 'Ads provider unavailable in this build',
      };
    }

    await new Promise(resolve => setTimeout(resolve, MOCK_REWARDED_AD_DELAY_MS));
    if (!canShowRewardedAd(options?.shouldShow)) {
      return { success: false, error: REWARDED_AD_CANCELLED_ERROR };
    }
    this.rewardedAdCount += 1;
    this.saveAdCount();
    return {
      success: true,
      reward: {
        type: rewardType,
        amount: fallbackAmount,
      },
    };
  }

  async showContextualRewardedAd(
    placement: RewardedPlacement,
    options?: RewardedAdShowOptions
  ): Promise<ContextualRewardedAdResult> {
    if (!this.isInitialized) await this.initialize();

    const placementMap: Record<RewardedPlacement, {
      adDriverRewardType: RewardType;
      rewardType: RewardType | 'utility';
      amount: number;
    }> = {
      exam_prep: {
        adDriverRewardType: 'intelligence',
        rewardType: 'intelligence',
        amount: 15,
      },
      energy_depleted: {
        adDriverRewardType: 'energy',
        rewardType: 'energy',
        amount: 25,
      },
      crisis_recovery: {
        adDriverRewardType: 'money',
        rewardType: 'utility',
        amount: 0,
      },
      ending_alternative: {
        adDriverRewardType: 'money',
        rewardType: 'utility',
        amount: 0,
      },
      undo_choice: {
        adDriverRewardType: 'money',
        rewardType: 'utility',
        amount: 0,
      },
    };

    const plan = placementMap[placement];

    // Premium users keep reward utility without ad interruptions.
    if (this.isPremium()) {
      return {
        success: true,
        placement,
        rewardType: plan.rewardType,
        amount: plan.amount,
      };
    }

    const adResult = await this.showRewardedAd(plan.adDriverRewardType, options);
    if (!adResult.success) {
      return {
        success: false,
        placement,
        rewardType: plan.rewardType,
        amount: 0,
        error: adResult.error ?? 'Rewarded ad failed',
      };
    }

    return {
      success: true,
      placement,
      rewardType: plan.rewardType,
      amount: plan.amount,
    };
  }

  /**
   * Geçiş reklamını sıradaki doğal ara için önceden yükler. Reklamı açmaz. Zaten yükleniyorsa,
   * hazırsa ya da gösteriliyorsa bir şey yapmaz; premium, reklam kapalı ya da oturum sınırı
   * dolmuşsa istek yapılmaz. Servis henüz başlatılmadıysa istek başlatma bitince yapılır.
   */
  preloadInterstitialAd(): void {
    if (!this.isInitialized) {
      this.interstitialPreloadRequested = true;
      return;
    }
    if (this.consentBlocksAds()) {
      // İzin gelince (`setCanRequestAds(true)`) mevcut yoldan yapılır.
      this.interstitialPreloadRequested = true;
      return;
    }
    if (this.adProvider !== 'admob' || !this.adMobModule) return;
    if (this.isPremium() || !this.adsEnabled) return;
    if (this.interstitialShownThisSession >= this.interstitialSessionLimit) return;

    const slot = this.interstitialSlot;
    if (slot) {
      if (slot.state === 'loading' || slot.state === 'showing') return;
      if (this.isInterstitialSlotUsable(slot, Date.now())) return;
      this.finishInterstitialSlot(slot, false);
    }
    this.loadInterstitialSlot();
  }

  /**
   * Doğal arada çağrılır (yıl sonu penceresi kapanınca ya da sakin yılda yaş geçişinde). Karar bu
   * çağrının içinde, beklemeden verilir: önceden yüklenmiş reklam şimdi hazırsa hemen açılır, değilse
   * fırsat `not_ready` ile atlanır. Sonradan gelen LOADED reklam açmaz (gecikmeli gösterim yok).
   * Dönen söz reklam kapanınca çözülür.
   */
  async showInterstitialAdDetailed(): Promise<InterstitialAdResult> {
    if (this.isPremium()) {
      return { shown: false, reason: 'premium_user', provider: this.adProvider };
    }

    if (!this.adsEnabled) {
      return {
        shown: false,
        reason: 'ads_disabled',
        provider: this.adProvider,
      };
    }

    if (this.interstitialShownThisSession >= this.interstitialSessionLimit) {
      return {
        shown: false,
        reason: 'session_cap',
        provider: this.adProvider,
      };
    }

    const now = Date.now();
    if (
      this.lastInterstitialShownAt > 0 &&
      now - this.lastInterstitialShownAt < this.interstitialCooldownMs
    ) {
      return {
        shown: false,
        reason: 'cooldown',
        provider: this.adProvider,
        cooldownRemainingMs: Math.max(0, this.interstitialCooldownMs - (now - this.lastInterstitialShownAt)),
      };
    }

    if (!isAppInForeground()) {
      return { shown: false, reason: 'background', provider: this.adProvider };
    }

    // Başlatma beklenmez: beklemek doğal arayı kaçırıp reklamı sonradan açmak olurdu.
    if (!this.isInitialized) {
      return { shown: false, reason: 'not_ready', provider: this.adProvider };
    }

    if (this.consentBlocksAds()) {
      return { shown: false, reason: 'provider_unavailable', provider: this.adProvider };
    }

    if (this.adProvider === 'admob' && this.adMobModule) {
      const slot = this.interstitialSlot;
      if (!slot || slot.state !== 'ready' || !this.isInterstitialSlotUsable(slot, now)) {
        // Eskimiş ya da eski kişiselleştirme tercihiyle istenmiş reklam atılır; yenisini çağıran ister.
        if (slot && slot.state === 'ready') this.finishInterstitialSlot(slot, false);
        return { shown: false, reason: 'not_ready', provider: 'admob' };
      }
      const shown = await this.presentInterstitialSlot(slot);
      if (shown) this.recordInterstitialShown(now);
      return {
        shown,
        reason: shown ? 'shown' : 'ad_error',
        provider: 'admob',
      };
    }

    if (!this.allowMockAds) {
      return {
        shown: false,
        reason: 'provider_unavailable',
        provider: this.adProvider,
      };
    }

    await new Promise(resolve => setTimeout(resolve, MOCK_INTERSTITIAL_DELAY_MS));
    this.recordInterstitialShown(now);
    return {
      shown: true,
      reason: 'shown',
      provider: 'mock',
    };
  }

  async showInterstitialAd(): Promise<boolean> {
    const result = await this.showInterstitialAdDetailed();
    return result.shown;
  }

  getRemainingRewardedAds(): number {
    this.resetDailyAdCountIfNeeded();
    return Math.max(0, this.dailyAdLimit - this.rewardedAdCount);
  }

  setAdsEnabled(enabled: boolean): void {
    this.adsEnabled = enabled;
  }

  /**
   * Etkin kişiselleştirme değerini uygular. `consentChanged`: oyuncu Ayarlar'daki reklam gizlilik
   * seçenekleri formunu kapattı; UMP izni (TCF dizesi) bayrak aynı kalsa bile değişmiş olabilir.
   */
  setPersonalizedAdsEnabled(enabled: boolean, options: { consentChanged?: boolean } = {}): void {
    this.personalizedAdsEnabled = enabled;
    // Önceden yüklenmiş geçiş reklamı eski tercihle ya da eski UMP izniyle istendi: atılır ve yeni
    // değerle bir kez yeniden istenir (oyuncu kişiselleştirmeyi kapattıysa kişiselleştirilmiş reklam
    // gösterilmesin). Hazır reklam yoksa yeni istek başlatılmaz.
    const slot = this.interstitialSlot;
    if (
      slot
      && slot.state !== 'showing'
      && (slot.personalized !== enabled || options.consentChanged === true)
    ) {
      this.finishInterstitialSlot(slot, false);
      this.preloadInterstitialAd();
    }
  }

  /**
   * UMP `canRequestAds` değerini uygular (açılış akışı ve gizlilik seçenekleri formu sonrası).
   * true -> false: hazır/yüklenen geçiş reklamı atılır (gösterilen dokunulmaz), yeni istek yapılmaz.
   * false -> true: bekleyen SDK başlatma ve ön yükleme bu oturumda yapılır.
   */
  setCanRequestAds(canRequestAds: boolean): void {
    const previous = this.canRequestAds;
    this.canRequestAds = canRequestAds === true;
    if (previous === this.canRequestAds) return;

    if (!this.canRequestAds) {
      const slot = this.interstitialSlot;
      if (slot && slot.state !== 'showing') {
        this.finishInterstitialSlot(slot, false);
        // İzin geri gelirse reklam yeniden istensin.
        this.interstitialPreloadRequested = true;
      }
      return;
    }

    if (this.isInitialized) {
      void this.resumeAdsAfterConsent().catch((error) => {
        devLog.warn('[monetization] Resuming ads after consent failed.', error);
      });
    }
    // Başlatma sürüyorsa `runInitialize` sonunda aynı yol çalışır.
  }

  setEntitlementTokenProvider(_provider: AuthTokenProvider | null): void {
    // No-op in ad-only build.
  }

  private async initializeAds(): Promise<void> {
    if (Platform.OS === 'web') {
      this.adProvider = 'mock';
      return;
    }

    const constantsModule = optionalRequire('expo-constants');
    const constants = constantsModule?.default ?? constantsModule;
    const appOwnership = normalizeConfigString(constants?.appOwnership)?.toLowerCase();
    const executionEnvironment = normalizeConfigString(constants?.executionEnvironment)?.toLowerCase();
    const isExpoGoClient = appOwnership === 'expo' || executionEnvironment === 'storeclient';

    if (isExpoGoClient) {
      devLog.log('[monetization] Expo Go detected. Using mock ads.');
      this.adProvider = 'mock';
      this.adMobModule = null;
      return;
    }

    const adMobImport = optionalRequire('react-native-google-mobile-ads') as AdMobModule | null;
    if (!adMobImport?.default) {
      this.adProvider = 'mock';
      this.adMobModule = null;
      return;
    }

    // Google UMP rehberi: Mobile Ads SDK yalnızca `canRequestAds` true iken başlatılır. İzin yoksa
    // (AEA'da onay alınmadı/form yüklenemedi) başlatma ertelenir; sağlayıcı "mock" kalır ama
    // `consentBlocksAds` mock yedek reklamı da engeller. İzin gelince `resumeAdsAfterConsent` başlatır.
    if (!this.canRequestAds) {
      this.adsAwaitingConsent = true;
      this.pendingAdMobImport = adMobImport;
      this.adProvider = 'mock';
      this.adMobModule = null;
      devLog.log('[monetization] AdMob start deferred: canRequestAds is false.');
      return;
    }

    await this.startAdMobSdk(adMobImport);
  }

  private async startAdMobSdk(adMobImport: AdMobModule): Promise<void> {
    try {
      const mobileAdsFactory = adMobImport.default;
      if (!mobileAdsFactory) {
        this.adProvider = 'mock';
        this.adMobModule = null;
        return;
      }

      const mobileAds = mobileAdsFactory();
      // İlk reklam isteğinden önce: azami içerik derecesi T. Uygulanamazsa AdMob kullanılmaz
      // (sınırsız dereceli reklam istenmesin). Başka istek bayrağı bilerek verilmez.
      await mobileAds.setRequestConfiguration({
        maxAdContentRating: adMobImport.MaxAdContentRating?.T ?? AD_MAX_CONTENT_RATING,
      });
      await mobileAds.initialize();
      this.adProvider = 'admob';
      this.adMobModule = adMobImport;
      devLog.log('[monetization] AdMob initialized.');
    } catch (error) {
      devLog.warn('[monetization] AdMob unavailable, using mock ads.', error);
      this.adProvider = 'mock';
      this.adMobModule = null;
    }
  }

  private getAdUnitId(kind: AdType): string | null {
    const testIds = this.adMobModule?.TestIds;
    if (isDevRuntime && testIds) {
      return kind === 'rewarded' ? testIds.REWARDED : testIds.INTERSTITIAL;
    }

    const configured = getAdUnitIdFromConfig(kind);
    if (!configured) return null;
    if (KNOWN_TEST_AD_UNIT_IDS.has(configured)) return null;
    return configured;
  }

  private async showRewardedAdWithAdMob(
    rewardType: RewardType,
    fallbackAmount: number,
    shouldShow?: () => boolean
  ): Promise<RewardedAdResult> {
    const rewardedFactory = this.adMobModule?.RewardedAd;
    const adEventType = this.adMobModule?.AdEventType;
    const rewardedEventType = this.adMobModule?.RewardedAdEventType;
    const adUnitId = this.getAdUnitId('rewarded');

    if (!rewardedFactory || !adEventType || !rewardedEventType || !adUnitId) {
      return { success: false, error: 'Rewarded ad dependencies are unavailable' };
    }

    return new Promise<RewardedAdResult>((resolve) => {
      const rewardedAd = rewardedFactory.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: !this.personalizedAdsEnabled,
      });

      let settled = false;
      let loadTimer: ReturnType<typeof setTimeout> | null = null;
      const unsubs: Array<() => void> = [];
      const clearLoadTimer = () => {
        if (loadTimer) {
          clearTimeout(loadTimer);
          loadTimer = null;
        }
      };
      const settle = (result: RewardedAdResult) => {
        if (settled) return;
        settled = true;
        clearLoadTimer();
        unsubs.forEach((unsub) => {
          try {
            unsub();
          } catch {
            // no-op
          }
        });
        resolve(result);
      };
      const settleShowFailure = (error: unknown) => {
        settle({
          success: false,
          error: (error as { message?: string } | null | undefined)?.message || 'Rewarded ad show failed',
        });
      };

      unsubs.push(
        rewardedAd.addAdEventListener(rewardedEventType.EARNED_REWARD, (reward: any) => {
          const amount = Number(reward?.amount) || fallbackAmount;
          settle({
            success: true,
            reward: { type: rewardType, amount },
          });
        })
      );

      unsubs.push(
        rewardedAd.addAdEventListener(rewardedEventType.LOADED, () => {
          // Zaman aşımından ya da iptalden sonra gelen LOADED reklam açmaz.
          if (settled) return;
          clearLoadTimer();
          // İstek izin gelmeden önce atıldıysa ve izin sonradan kapandıysa reklam açılmaz, hak düşmez.
          if (this.consentBlocksAds()) {
            settle({ success: false, error: REWARDED_AD_CONSENT_ERROR });
            return;
          }
          if (!canShowRewardedAd(shouldShow)) {
            settle({ success: false, error: REWARDED_AD_CANCELLED_ERROR });
            return;
          }
          try {
            const shown = rewardedAd.show();
            if (shown && typeof shown.then === 'function') {
              shown.then(undefined, settleShowFailure);
            }
          } catch (error) {
            settleShowFailure(error);
          }
        })
      );

      unsubs.push(
        rewardedAd.addAdEventListener(adEventType.ERROR, (error: any) => {
          settle({
            success: false,
            error: error?.message || 'Rewarded ad failed',
          });
        })
      );

      unsubs.push(
        rewardedAd.addAdEventListener(adEventType.CLOSED, () => {
          settle({
            success: false,
            error: 'Rewarded ad closed before reward',
          });
        })
      );

      // Yalnızca yükleme beklenir; reklam açıldıktan sonra izleme süresi sınırlanmaz.
      loadTimer = setTimeout(() => {
        settle({ success: false, error: REWARDED_AD_LOAD_TIMEOUT_ERROR });
      }, REWARDED_AD_LOAD_TIMEOUT_MS);

      rewardedAd.load();
    });
  }

  private isInterstitialSlotUsable(slot: InterstitialSlot, now: number): boolean {
    return slot.state === 'ready'
      && slot.ad.loaded !== false
      && now - slot.loadedAt < INTERSTITIAL_AD_MAX_AGE_MS
      && slot.personalized === this.personalizedAdsEnabled;
  }

  /** Yeni geçiş reklamı isteği başlatır. LOADED yalnızca reklamı "hazır" işaretler. */
  private loadInterstitialSlot(): void {
    const interstitialFactory = this.adMobModule?.InterstitialAd;
    const adEventType = this.adMobModule?.AdEventType;
    const adUnitId = this.getAdUnitId('interstitial');

    if (!interstitialFactory || !adEventType || !adUnitId) return;

    let ad: InterstitialAdHandle;
    try {
      ad = interstitialFactory.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: !this.personalizedAdsEnabled,
      });
    } catch (error) {
      devLog.warn('[monetization] Interstitial request could not be created.', error);
      return;
    }

    const slot: InterstitialSlot = {
      ad,
      state: 'loading',
      personalized: this.personalizedAdsEnabled,
      loadedAt: 0,
      loadTimer: null,
      openTimer: null,
      unsubs: [],
      onShowSettled: null,
    };
    this.interstitialSlot = slot;
    // Atılan isteğin olayları (kütüphane dinleyiciyi kaldırmasa bile) yok sayılır.
    const isCurrent = () => this.interstitialSlot === slot;

    try {
      slot.unsubs.push(
        ad.addAdEventListener(adEventType.LOADED, () => {
          if (!isCurrent() || slot.state !== 'loading') return;
          if (slot.loadTimer) {
            clearTimeout(slot.loadTimer);
            slot.loadTimer = null;
          }
          slot.state = 'ready';
          slot.loadedAt = Date.now();
        })
      );
      // Yükleme hatası ya da gösterim hatası (ör. platform reddi) aynı olayla gelir.
      slot.unsubs.push(
        ad.addAdEventListener(adEventType.ERROR, () => {
          if (!isCurrent()) return;
          this.finishInterstitialSlot(slot, false);
        })
      );
      slot.unsubs.push(
        ad.addAdEventListener(adEventType.CLOSED, () => {
          if (!isCurrent()) return;
          this.finishInterstitialSlot(slot, slot.state === 'showing');
        })
      );
      if (adEventType.OPENED) {
        slot.unsubs.push(
          ad.addAdEventListener(adEventType.OPENED, () => {
            if (!isCurrent() || !slot.openTimer) return;
            clearTimeout(slot.openTimer);
            slot.openTimer = null;
          })
        );
      }

      slot.loadTimer = setTimeout(() => {
        slot.loadTimer = null;
        if (isCurrent() && slot.state === 'loading') this.finishInterstitialSlot(slot, false);
      }, INTERSTITIAL_AD_LOAD_TIMEOUT_MS);

      ad.load();
    } catch (error) {
      devLog.warn('[monetization] Interstitial load failed.', error);
      this.finishInterstitialSlot(slot, false);
    }
  }

  /** Hazır reklamı şimdi açar; reklam kapanınca true, gösterilemezse false ile çözülür. */
  private presentInterstitialSlot(slot: InterstitialSlot): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      slot.state = 'showing';
      slot.onShowSettled = resolve;
      const settleShowFailure = () => this.finishInterstitialSlot(slot, false);
      // Bekçi show()'dan önce kurulur: OPENED hiç gelmezse yuva "showing"de takılı kalmasın.
      if (this.adMobModule?.AdEventType?.OPENED) {
        slot.openTimer = setTimeout(() => {
          slot.openTimer = null;
          if (this.interstitialSlot === slot && slot.state === 'showing') settleShowFailure();
        }, INTERSTITIAL_AD_OPEN_TIMEOUT_MS);
      }
      try {
        const shown = slot.ad.show() as Promise<unknown> | undefined;
        if (shown && typeof shown.then === 'function') {
          shown.then(undefined, settleShowFailure);
        }
      } catch {
        settleShowFailure();
      }
    });
  }

  /** Reklamı bırakır: dinleyiciler ve zamanlayıcı kaldırılır, gösterim sürüyorsa sonucu bildirilir. */
  private finishInterstitialSlot(slot: InterstitialSlot, shown: boolean): void {
    if (slot.loadTimer) {
      clearTimeout(slot.loadTimer);
      slot.loadTimer = null;
    }
    if (slot.openTimer) {
      clearTimeout(slot.openTimer);
      slot.openTimer = null;
    }
    const unsubs = slot.unsubs;
    slot.unsubs = [];
    unsubs.forEach((unsub) => {
      try {
        unsub();
      } catch {
        // no-op
      }
    });
    if (this.interstitialSlot === slot) this.interstitialSlot = null;
    const settle = slot.onShowSettled;
    slot.onShowSettled = null;
    settle?.(shown);
  }

  private getFallbackRewardAmount(rewardType: RewardType): number {
    if (rewardType === 'energy') return 20;
    if (rewardType === 'intelligence') return 10;
    return 100;
  }

  private recordInterstitialShown(timestamp: number): void {
    this.interstitialShownThisSession += 1;
    this.lastInterstitialShownAt = timestamp;
  }

  private resetDailyAdCountIfNeeded(): void {
    // Sayaç diskten okunmadan sıfırlama diske yazılmasın (UMP yavaşken günlük sınır silinmesin).
    if (!this.adCountLoaded) return;
    const today = new Date().toISOString().split('T')[0];
    if (this.lastAdResetDate === today) return;

    this.rewardedAdCount = 0;
    this.lastAdResetDate = today;
    this.saveAdCount();
  }

  private saveAdCount(): void {
    void writeStorageItem(
      STORAGE_AD_COUNT_KEY,
      JSON.stringify({
        count: this.rewardedAdCount,
        date: this.lastAdResetDate,
      })
    ).catch((error) => {
      devLog.warn('[monetization] Failed to persist ad count.', error);
    });
  }

  private async loadAdCount(): Promise<void> {
    try {
      const raw = await readStorageItem(STORAGE_AD_COUNT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      this.rewardedAdCount = Number(parsed?.count) || 0;
      this.lastAdResetDate = typeof parsed?.date === 'string' ? parsed.date : null;
    } catch (error) {
      devLog.warn('[monetization] Failed to load ad count.', error);
    }
  }
}

export const monetizationService = new MonetizationService();

export const initMonetization = () => monetizationService.initialize();
export const getProducts = () => monetizationService.getProducts();
export const purchaseProduct = (id: string) => monetizationService.purchaseProduct(id);
export const hasProduct = (id: string) => monetizationService.hasProduct(id);
export const isPremium = () => monetizationService.isPremium();
export const showRewardedAd = (type: RewardType, options?: RewardedAdShowOptions) =>
  monetizationService.showRewardedAd(type, options);
export const showContextualRewardedAd = (placement: RewardedPlacement, options?: RewardedAdShowOptions) =>
  monetizationService.showContextualRewardedAd(placement, options);
export const showInterstitialAd = () => monetizationService.showInterstitialAd();
export const showInterstitialAdDetailed = () => monetizationService.showInterstitialAdDetailed();
export const preloadInterstitialAd = () => monetizationService.preloadInterstitialAd();
export const getRemainingRewardedAds = () => monetizationService.getRemainingRewardedAds();
export const restorePurchases = () => monetizationService.restorePurchases();
export const setCanRequestAds = (canRequestAds: boolean) =>
  monetizationService.setCanRequestAds(canRequestAds);
export const setPersonalizedAdsEnabled = (enabled: boolean, options?: { consentChanged?: boolean }) =>
  monetizationService.setPersonalizedAdsEnabled(enabled, options);
export const setEntitlementTokenProvider = (provider: AuthTokenProvider | null) =>
  monetizationService.setEntitlementTokenProvider(provider);
