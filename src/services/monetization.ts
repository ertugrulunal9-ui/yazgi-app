/**
 * Monetization Service - Pure Ad-Only
 * Yazgi - AdMob rewarded + interstitial ads
 */
import { Platform } from 'react-native';
import SaveManager from '../save/SaveManager';
import { devLog } from '../utils/devLogger';

export type AdType = 'rewarded' | 'interstitial';
export type RewardType = 'energy' | 'intelligence' | 'money';
export type RewardedPlacement =
  | 'hub'
  | 'exam_prep'
  | 'energy_depleted'
  | 'crisis_recovery'
  | 'ending_alternative';

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

export type InterstitialBlockReason =
  | 'shown'
  | 'ads_disabled'
  | 'session_cap'
  | 'cooldown'
  | 'provider_unavailable'
  | 'ad_error';

export interface InterstitialAdResult {
  shown: boolean;
  reason: InterstitialBlockReason;
  provider: 'admob' | 'mock';
  cooldownRemainingMs?: number;
}

export type AuthTokenProvider = () => Promise<string | null> | string | null;

type AdMobFactory = () => {
  initialize: () => Promise<unknown>;
};

type AdMobModule = {
  default?: AdMobFactory;
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
  };
  RewardedAdEventType?: {
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
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('react-native-google-mobile-ads');
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

  const envValue = normalizeConfigString(process.env[envKey]);
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

  return normalizeConfigString(adMobConfig[configKey]);
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
  private dailyAdLimit = 5;
  private interstitialShownThisSession = 0;
  private interstitialSessionLimit = DEFAULT_INTERSTITIAL_SESSION_LIMIT;
  private interstitialCooldownMs = DEFAULT_INTERSTITIAL_COOLDOWN_MS;
  private lastInterstitialShownAt = 0;
  private lastAdResetDate: string | null = null;
  private readonly allowMockAds = isDevRuntime;

  __reset() {
    this.isInitialized = false;
    this.adProvider = 'mock';
    this.adMobModule = null;
    this.adsEnabled = true;
    this.personalizedAdsEnabled = false;
    this.rewardedAdCount = 0;
    this.dailyAdLimit = 5;
    this.interstitialShownThisSession = 0;
    this.interstitialSessionLimit = DEFAULT_INTERSTITIAL_SESSION_LIMIT;
    this.interstitialCooldownMs = DEFAULT_INTERSTITIAL_COOLDOWN_MS;
    this.lastInterstitialShownAt = 0;
    this.lastAdResetDate = null;
    SaveManager.setPremiumUnlocked(true);
    SaveManager.setAdsDisabled(false);
  }

  __reset__() {
    this.__reset();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const interstitialRuntime = getRuntimeInterstitialConfig();
    this.interstitialSessionLimit = interstitialRuntime.sessionLimit;
    this.interstitialCooldownMs = interstitialRuntime.cooldownMs;

    await this.initializeAds();
    await this.loadAdCount();
    this.resetDailyAdCountIfNeeded();

    // Ad-only: save slots fully unlocked, ads never disabled by purchases.
    SaveManager.setPremiumUnlocked(true);
    SaveManager.setAdsDisabled(false);

    this.isInitialized = true;
    devLog.log(
      `[monetization] initialized (ads=${this.adProvider}, session_cap=${this.interstitialSessionLimit}, cooldown_ms=${this.interstitialCooldownMs})`
    );
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
    return false;
  }

  async showRewardedAd(rewardType: RewardType): Promise<RewardedAdResult> {
    if (!this.isInitialized) await this.initialize();
    this.resetDailyAdCountIfNeeded();

    if (!this.adsEnabled) {
      return {
        success: false,
        error: 'Ads disabled',
      };
    }

    if (this.rewardedAdCount >= this.dailyAdLimit) {
      return {
        success: false,
        error: `Daily ad limit reached (${this.dailyAdLimit})`,
      };
    }

    const fallbackAmount = this.getFallbackRewardAmount(rewardType);

    if (this.adProvider === 'admob' && this.adMobModule) {
      const result = await this.showRewardedAdWithAdMob(rewardType, fallbackAmount);
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

  async showContextualRewardedAd(placement: RewardedPlacement): Promise<ContextualRewardedAdResult> {
    if (!this.isInitialized) await this.initialize();

    const placementMap: Record<RewardedPlacement, {
      adDriverRewardType: RewardType;
      rewardType: RewardType | 'utility';
      amount: number;
    }> = {
      hub: {
        adDriverRewardType: 'energy',
        rewardType: 'energy',
        amount: 20,
      },
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
    };

    const plan = placementMap[placement];
    const adResult = await this.showRewardedAd(plan.adDriverRewardType);
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

  async showInterstitialAdDetailed(): Promise<InterstitialAdResult> {
    if (!this.isInitialized) await this.initialize();

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

    if (this.adProvider === 'admob' && this.adMobModule) {
      const shown = await this.showInterstitialWithAdMob();
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

  setPersonalizedAdsEnabled(enabled: boolean): void {
    this.personalizedAdsEnabled = enabled;
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

    try {
      const adMobImport = optionalRequire('react-native-google-mobile-ads') as AdMobModule | null;
      const mobileAdsFactory = adMobImport?.default;

      if (!mobileAdsFactory) {
        this.adProvider = 'mock';
        this.adMobModule = null;
        return;
      }

      await mobileAdsFactory().initialize();
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
    return configured ?? null;
  }

  private async showRewardedAdWithAdMob(
    rewardType: RewardType,
    fallbackAmount: number
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
      const unsubs: Array<() => void> = [];
      const settle = (result: RewardedAdResult) => {
        if (settled) return;
        settled = true;
        unsubs.forEach((unsub) => {
          try {
            unsub();
          } catch {
            // no-op
          }
        });
        resolve(result);
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
        rewardedAd.addAdEventListener(adEventType.LOADED, () => {
          try {
            void rewardedAd.show();
          } catch (error: any) {
            settle({
              success: false,
              error: error?.message || 'Rewarded ad show failed',
            });
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

      rewardedAd.load();
    });
  }

  private async showInterstitialWithAdMob(): Promise<boolean> {
    const interstitialFactory = this.adMobModule?.InterstitialAd;
    const adEventType = this.adMobModule?.AdEventType;
    const adUnitId = this.getAdUnitId('interstitial');

    if (!interstitialFactory || !adEventType || !adUnitId) {
      return false;
    }

    return new Promise<boolean>((resolve) => {
      const interstitialAd = interstitialFactory.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: !this.personalizedAdsEnabled,
      });

      let settled = false;
      const unsubs: Array<() => void> = [];
      const settle = (result: boolean) => {
        if (settled) return;
        settled = true;
        unsubs.forEach((unsub) => {
          try {
            unsub();
          } catch {
            // no-op
          }
        });
        resolve(result);
      };

      unsubs.push(
        interstitialAd.addAdEventListener(adEventType.LOADED, () => {
          try {
            void interstitialAd.show();
          } catch {
            settle(false);
          }
        })
      );

      unsubs.push(
        interstitialAd.addAdEventListener(adEventType.ERROR, () => {
          settle(false);
        })
      );

      unsubs.push(
        interstitialAd.addAdEventListener(adEventType.CLOSED, () => {
          settle(true);
        })
      );

      interstitialAd.load();
    });
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
export const showRewardedAd = (type: RewardType) => monetizationService.showRewardedAd(type);
export const showContextualRewardedAd = (placement: RewardedPlacement) =>
  monetizationService.showContextualRewardedAd(placement);
export const showInterstitialAd = () => monetizationService.showInterstitialAd();
export const showInterstitialAdDetailed = () => monetizationService.showInterstitialAdDetailed();
export const getRemainingRewardedAds = () => monetizationService.getRemainingRewardedAds();
export const restorePurchases = () => monetizationService.restorePurchases();
export const setPersonalizedAdsEnabled = (enabled: boolean) =>
  monetizationService.setPersonalizedAdsEnabled(enabled);
export const setEntitlementTokenProvider = (provider: AuthTokenProvider | null) =>
  monetizationService.setEntitlementTokenProvider(provider);
