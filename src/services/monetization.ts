/**
 * Monetization Service - IAP and Ads Management
 * Yazgi - Mobile integration with RevenueCat and AdMob
 */
import { devLog } from '../utils/devLogger';

import { Platform } from 'react-native';
import SaveManager from '../save/SaveManager';

export type ProductId =
  | 'premium_traits'
  | 'save_slots_premium'
  | 'cosmetics_pack'
  | 'energy_refill'
  | 'season_pass'
  | 'remove_ads';

export type AdType = 'rewarded' | 'interstitial';

export interface Product {
  id: ProductId;
  title: string;
  description: string;
  price: string;
  localizedPrice?: string;
  currencyCode?: string;
}

export interface PurchaseResult {
  success: boolean;
  productId: ProductId;
  error?: string;
}

export interface RewardedAdResult {
  success: boolean;
  reward?: {
    type: 'energy' | 'intelligence' | 'money';
    amount: number;
  };
  error?: string;
}

export type InterstitialBlockReason =
  | 'shown'
  | 'premium'
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

type PurchasesModule = typeof import('react-native-purchases').default;

type RevenueCatProduct = {
  identifier?: string;
  title?: string;
  description?: string;
  priceString?: string;
  price?: number | string;
  currencyCode?: string;
};

type RevenueCatPackage = {
  identifier?: string;
  product?: RevenueCatProduct;
};

type RevenueCatOfferings = {
  current?: {
    availablePackages?: RevenueCatPackage[];
  };
};

type RevenueCatCustomerInfo = {
  allPurchasedProductIdentifiers?: string[];
  activeSubscriptions?: string[];
  entitlements?: {
    active?: Record<string, unknown>;
  };
};

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

type ProductSkuEntry = string | { ios?: string; android?: string };
type AuthTokenProvider = () => Promise<string | null> | string | null;

interface RevenueCatConfig {
  iosApiKey?: string;
  androidApiKey?: string;
  productIds?: Partial<Record<ProductId, ProductSkuEntry>>;
  entitlements?: Record<string, string>;
}

interface AdMobConfig {
  iosRewardedUnitId?: string;
  androidRewardedUnitId?: string;
  iosInterstitialUnitId?: string;
  androidInterstitialUnitId?: string;
}

interface MonetizationConfig {
  interstitialSessionLimit?: number | string;
  interstitialCooldownMs?: number | string;
  remoteConfigUrl?: string;
  entitlementApiBaseUrl?: string;
  entitlementAuthToken?: string;
  requireServerAuthority?: boolean | string;
  entitlementRefreshOnStartup?: boolean | string;
  entitlementRequestTimeoutMs?: number | string;
}

interface InterstitialRuntimeConfig {
  interstitialSessionLimit?: number;
  interstitialCooldownMs?: number;
}

interface ServerEntitlementsResponse {
  products?: unknown[];
  source?: string;
  updatedAt?: string;
}

const STORAGE_PRODUCTS_KEY = '@yazgi/owned_products';
const STORAGE_AD_COUNT_KEY = '@yazgi/ad_count';
const hasLocalStorage = typeof localStorage !== 'undefined';
const isDevRuntime =
  Boolean((globalThis as { __DEV__?: boolean }).__DEV__) || process.env.NODE_ENV !== 'production';
const isTestRuntime = process.env.NODE_ENV === 'test';
const MOCK_PURCHASE_DELAY_MS = isTestRuntime ? 0 : 800;
const MOCK_REWARDED_AD_DELAY_MS = isTestRuntime ? 0 : 1500;
const MOCK_INTERSTITIAL_DELAY_MS = isTestRuntime ? 0 : 1000;
const DEFAULT_INTERSTITIAL_SESSION_LIMIT = 2;
const DEFAULT_INTERSTITIAL_COOLDOWN_MS = isTestRuntime ? 0 : 3 * 60 * 1000;
const DEFAULT_ENTITLEMENT_REQUEST_TIMEOUT_MS = isTestRuntime ? 100 : 2_000;
const INTERSTITIAL_SESSION_LIMIT_BOUNDS = { min: 0, max: 10 } as const;
const INTERSTITIAL_COOLDOWN_MS_BOUNDS = { min: 0, max: 3_600_000 } as const;
const REMOTE_MONETIZATION_TIMEOUT_MS = isTestRuntime ? 50 : 1_500;

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
  if (asyncStorage) return asyncStorage.getItem(key);
  return null;
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
      case 'react-native-purchases':
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        return require('react-native-purchases');
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

const normalizeConfigNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const normalizeConfigBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return null;
};

const warnedMonetizationConfigKeys = new Set<string>();

const warnMonetizationConfigOnce = (key: string, message: string): void => {
  if (warnedMonetizationConfigKeys.has(key)) return;
  warnedMonetizationConfigKeys.add(key);
  devLog.warn(message);
};

const isLoopbackHost = (hostname: string): boolean => (
  hostname === 'localhost'
  || hostname === '127.0.0.1'
  || hostname === '::1'
);

const isAllowedRuntimeNetworkUrl = (candidate: string): boolean => {
  if (typeof URL === 'undefined') {
    if (/^https:\/\//i.test(candidate)) return true;
    if (isDevRuntime && /^http:\/\/(localhost|127\.0\.0\.1|\[::1\]|::1)(:\d+)?(\/|$)/i.test(candidate)) return true;
    return false;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === 'https:') return true;
    return isDevRuntime && parsed.protocol === 'http:' && isLoopbackHost(parsed.hostname);
  } catch {
    return false;
  }
};

const normalizeNetworkUrl = (
  value: unknown,
  options: {
    settingKey: string;
    settingLabel: string;
    trimTrailingSlash?: boolean;
  }
): string | null => {
  const normalized = normalizeConfigString(value);
  if (!normalized) return null;

  if (!isAllowedRuntimeNetworkUrl(normalized)) {
    warnMonetizationConfigOnce(
      options.settingKey,
      `[monetization] Ignoring insecure ${options.settingLabel}. Use https:// (dev only: http://localhost).`
    );
    return null;
  }

  return options.trimTrailingSlash ? normalized.replace(/\/+$/, '') : normalized;
};

const toBoundedInteger = (
  value: unknown,
  bounds: { min: number; max: number }
): number | null => {
  const normalized = normalizeConfigNumber(value);
  if (normalized === null) return null;
  const rounded = Math.floor(normalized);
  if (rounded < bounds.min || rounded > bounds.max) return null;
  return rounded;
};

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('timeout')), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      }
    );
  });

const PRODUCTS: Record<ProductId, Product> = {
  premium_traits: {
    id: 'premium_traits',
    title: 'Premium Traits',
    description: 'Start with a premium trait option.',
    price: '29.99',
    localizedPrice: '29.99',
    currencyCode: 'TRY',
  },
  save_slots_premium: {
    id: 'save_slots_premium',
    title: '+3 Save Slots',
    description: 'Unlock 3 extra save slots.',
    price: '14.99',
    localizedPrice: '14.99',
    currencyCode: 'TRY',
  },
  cosmetics_pack: {
    id: 'cosmetics_pack',
    title: 'Cosmetics Pack',
    description: 'Unlock additional cosmetic content.',
    price: '24.99',
    localizedPrice: '24.99',
    currencyCode: 'TRY',
  },
  energy_refill: {
    id: 'energy_refill',
    title: 'Energy Refill',
    description: 'Instantly refill your energy.',
    price: '9.99',
    localizedPrice: '9.99',
    currencyCode: 'TRY',
  },
  season_pass: {
    id: 'season_pass',
    title: 'Season Pass',
    description: 'Rewards, boosts and ad-free experience.',
    price: '59.99',
    localizedPrice: '59.99',
    currencyCode: 'TRY',
  },
  remove_ads: {
    id: 'remove_ads',
    title: 'Remove Ads',
    description: 'Disable ads permanently.',
    price: '39.99',
    localizedPrice: '39.99',
    currencyCode: 'TRY',
  },
};

const DEFAULT_PRODUCT_SKUS: Record<ProductId, { ios: string; android: string }> = {
  premium_traits: { ios: 'premium_traits', android: 'premium_traits' },
  save_slots_premium: { ios: 'save_slots_premium', android: 'save_slots_premium' },
  cosmetics_pack: { ios: 'cosmetics_pack', android: 'cosmetics_pack' },
  energy_refill: { ios: 'energy_refill', android: 'energy_refill' },
  season_pass: { ios: 'season_pass', android: 'season_pass' },
  remove_ads: { ios: 'remove_ads', android: 'remove_ads' },
};

const DEFAULT_ENTITLEMENT_TO_PRODUCT: Record<string, ProductId> = {
  premium: 'save_slots_premium',
  premium_slots: 'save_slots_premium',
  no_ads: 'remove_ads',
  season_pass: 'season_pass',
};

const PRODUCT_IDS = Object.keys(PRODUCTS) as ProductId[];
const isKnownProductId = (value: string): value is ProductId =>
  Object.prototype.hasOwnProperty.call(PRODUCTS, value);

const parseAppExtras = (): Record<string, unknown> => {
  const constantsModule = optionalRequire('expo-constants');
  const constants = constantsModule?.default ?? constantsModule;
  const expoConfig = constants?.expoConfig ?? constants?.manifest ?? null;
  return isObjectRecord(expoConfig?.extra) ? expoConfig.extra : {};
};

const getRevenueCatConfig = (): RevenueCatConfig => {
  const extras = parseAppExtras();
  const config = extras.revenueCat;
  return isObjectRecord(config) ? (config as RevenueCatConfig) : {};
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

const extractInterstitialRuntimeConfig = (source: unknown): InterstitialRuntimeConfig => {
  if (!isObjectRecord(source)) return {};
  const nested = isObjectRecord(source.interstitial) ? source.interstitial : {};
  const sessionLimit =
    toBoundedInteger(source.interstitialSessionLimit, INTERSTITIAL_SESSION_LIMIT_BOUNDS)
    ?? toBoundedInteger(nested.sessionLimit, INTERSTITIAL_SESSION_LIMIT_BOUNDS);
  const cooldownMs =
    toBoundedInteger(source.interstitialCooldownMs, INTERSTITIAL_COOLDOWN_MS_BOUNDS)
    ?? toBoundedInteger(nested.cooldownMs, INTERSTITIAL_COOLDOWN_MS_BOUNDS);

  return {
    interstitialSessionLimit: sessionLimit ?? undefined,
    interstitialCooldownMs: cooldownMs ?? undefined,
  };
};

const getLocalInterstitialRuntimeConfig = (): InterstitialRuntimeConfig => {
  const config = getMonetizationConfig();
  const envSessionCap = toBoundedInteger(
    process.env.EXPO_PUBLIC_INTERSTITIAL_SESSION_CAP,
    INTERSTITIAL_SESSION_LIMIT_BOUNDS
  );
  const envCooldownMs = toBoundedInteger(
    process.env.EXPO_PUBLIC_INTERSTITIAL_COOLDOWN_MS,
    INTERSTITIAL_COOLDOWN_MS_BOUNDS
  );

  const localConfig = extractInterstitialRuntimeConfig(config);

  return {
    interstitialSessionLimit: envSessionCap ?? localConfig.interstitialSessionLimit,
    interstitialCooldownMs: envCooldownMs ?? localConfig.interstitialCooldownMs,
  };
};

const getMonetizationRemoteConfigUrl = (): string | null => {
  const envUrl = normalizeNetworkUrl(process.env.EXPO_PUBLIC_MONETIZATION_REMOTE_CONFIG_URL, {
    settingKey: 'remote_config_env',
    settingLabel: 'EXPO_PUBLIC_MONETIZATION_REMOTE_CONFIG_URL',
  });
  if (envUrl) return envUrl;

  const config = getMonetizationConfig();
  return normalizeNetworkUrl(config.remoteConfigUrl, {
    settingKey: 'remote_config_extra',
    settingLabel: 'extra.monetization.remoteConfigUrl',
  });
};

const getMonetizationEntitlementApiBaseUrl = (): string | null => {
  const envUrl = normalizeNetworkUrl(process.env.EXPO_PUBLIC_ENTITLEMENT_API_BASE_URL, {
    settingKey: 'entitlement_base_env',
    settingLabel: 'EXPO_PUBLIC_ENTITLEMENT_API_BASE_URL',
    trimTrailingSlash: true,
  });
  if (envUrl) return envUrl;

  const config = getMonetizationConfig();
  return normalizeNetworkUrl(config.entitlementApiBaseUrl, {
    settingKey: 'entitlement_base_extra',
    settingLabel: 'extra.monetization.entitlementApiBaseUrl',
    trimTrailingSlash: true,
  });
};

const getMonetizationEntitlementAuthToken = (): string | null => {
  const envToken = normalizeConfigString(process.env.EXPO_PUBLIC_ENTITLEMENT_AUTH_TOKEN);
  const config = getMonetizationConfig();
  const configToken = normalizeConfigString(config.entitlementAuthToken);
  if (envToken || configToken) {
    warnMonetizationConfigOnce(
      'entitlement_token_bundled',
      '[monetization] Ignoring bundled entitlement auth token. Use setEntitlementTokenProvider() for runtime-only tokens.'
    );
  }
  return null;
};

const shouldRequireServerAuthority = (): boolean => {
  const envOverride = normalizeConfigBoolean(process.env.EXPO_PUBLIC_ENTITLEMENT_REQUIRE_SERVER_AUTHORITY);
  const config = getMonetizationConfig();
  const configValue = normalizeConfigBoolean(config.requireServerAuthority);
  if (!isDevRuntime) {
    if (envOverride === false || configValue === false) {
      warnMonetizationConfigOnce(
        'require_server_authority_forced_prod',
        '[monetization] Ignoring requireServerAuthority=false in production. Server authority is forced on.'
      );
    }
    return true;
  }

  if (envOverride !== null) return envOverride;
  if (configValue !== null) return configValue;

  return false;
};

const shouldRefreshEntitlementsOnStartup = (): boolean => {
  const envOverride = normalizeConfigBoolean(process.env.EXPO_PUBLIC_ENTITLEMENT_REFRESH_ON_STARTUP);
  if (envOverride !== null) return envOverride;

  const config = getMonetizationConfig();
  const configValue = normalizeConfigBoolean(config.entitlementRefreshOnStartup);
  if (configValue !== null) return configValue;

  return true;
};

const getEntitlementRequestTimeoutMs = (): number => {
  const envValue = normalizeConfigNumber(process.env.EXPO_PUBLIC_ENTITLEMENT_TIMEOUT_MS);
  if (envValue !== null && envValue > 0) return Math.floor(envValue);

  const config = getMonetizationConfig();
  const configValue = normalizeConfigNumber(config.entitlementRequestTimeoutMs);
  if (configValue !== null && configValue > 0) return Math.floor(configValue);

  return DEFAULT_ENTITLEMENT_REQUEST_TIMEOUT_MS;
};

const getRevenueCatApiKey = (): string | null => {
  const config = getRevenueCatConfig();
  const envKey =
    Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
      : process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  const configKey = Platform.OS === 'ios' ? config.iosApiKey : config.androidApiKey;

  return normalizeConfigString(envKey) ?? normalizeConfigString(configKey);
};

const getConfiguredProductSkus = (): Record<ProductId, { ios: string; android: string }> => {
  const config = getRevenueCatConfig();
  const configuredProductIds = isObjectRecord(config.productIds) ? config.productIds : {};
  const merged = { ...DEFAULT_PRODUCT_SKUS };

  for (const productId of PRODUCT_IDS) {
    const entry = configuredProductIds[productId];
    if (typeof entry === 'string') {
      const normalized = normalizeConfigString(entry);
      if (normalized) {
        merged[productId] = { ios: normalized, android: normalized };
      }
      continue;
    }

    if (!isObjectRecord(entry)) continue;

    const fallback = merged[productId];
    const ios = normalizeConfigString(entry.ios) ?? fallback.ios;
    const android = normalizeConfigString(entry.android) ?? fallback.android;
    merged[productId] = { ios, android };
  }

  return merged;
};

const getEntitlementToProductMap = (): Record<string, ProductId> => {
  const config = getRevenueCatConfig();
  const configured = isObjectRecord(config.entitlements) ? config.entitlements : {};
  const merged: Record<string, ProductId> = { ...DEFAULT_ENTITLEMENT_TO_PRODUCT };

  for (const [entitlementId, targetProduct] of Object.entries(configured)) {
    const normalizedEntitlement = normalizeConfigString(entitlementId);
    const normalizedTarget = normalizeConfigString(targetProduct)?.toLowerCase();
    if (!normalizedEntitlement || !normalizedTarget) continue;
    if (!isKnownProductId(normalizedTarget)) continue;
    merged[normalizedEntitlement.toLowerCase()] = normalizedTarget;
  }

  return merged;
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

const fetchRemoteInterstitialRuntimeConfig = async (
  remoteConfigUrl: string
): Promise<InterstitialRuntimeConfig | null> => {
  if (typeof fetch !== 'function') return null;

  try {
    const response = await withTimeout(
      fetch(remoteConfigUrl, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      }),
      REMOTE_MONETIZATION_TIMEOUT_MS
    );

    if (!response.ok) {
      devLog.warn(`Monetization remote config request failed: ${response.status}`);
      return null;
    }

    const payload = await response.json();
    const config = extractInterstitialRuntimeConfig(payload);
    const hasAnyOverride =
      typeof config.interstitialSessionLimit === 'number'
      || typeof config.interstitialCooldownMs === 'number';

    return hasAnyOverride ? config : null;
  } catch (error) {
    devLog.warn('Monetization remote config unavailable, using local defaults.', error);
    return null;
  }
};

class MonetizationService {
  private isInitialized = false;
  private ownedProducts: Set<ProductId> = new Set();
  private authoritativeProducts: Set<ProductId> | null = null;
  private entitlementTokenProvider: AuthTokenProvider | null = null;
  private adProvider: 'admob' | 'mock' = 'mock';
  private adsEnabled = true;
  private rewardedAdCount = 0;
  private dailyAdLimit = 5;
  private interstitialShownThisSession = 0;
  private interstitialSessionLimit = DEFAULT_INTERSTITIAL_SESSION_LIMIT;
  private interstitialCooldownMs = DEFAULT_INTERSTITIAL_COOLDOWN_MS;
  private lastInterstitialShownAt = 0;
  private lastAdResetDate: string | null = null;
  private iapProvider: 'revenuecat' | 'mock' = 'mock';
  private purchasesModule: PurchasesModule | null = null;
  private offeringsCache: RevenueCatOfferings | null = null;
  private adMobModule: AdMobModule | null = null;
  private personalizedAdsEnabled = false;
  private readonly entitlementApiBaseUrl = getMonetizationEntitlementApiBaseUrl();
  private readonly requireServerAuthority = shouldRequireServerAuthority();
  private readonly refreshEntitlementsOnStartup = shouldRefreshEntitlementsOnStartup();
  private readonly entitlementTimeoutMs = getEntitlementRequestTimeoutMs();
  private readonly allowMockBilling = isDevRuntime;
  private readonly allowMockAds = isDevRuntime;
  private readonly productSkus = getConfiguredProductSkus();
  private readonly entitlementToProduct = getEntitlementToProductMap();

  __reset() {
    this.isInitialized = false;
    this.ownedProducts.clear();
    this.authoritativeProducts = null;
    this.entitlementTokenProvider = null;
    this.rewardedAdCount = 0;
    this.interstitialShownThisSession = 0;
    this.interstitialSessionLimit = DEFAULT_INTERSTITIAL_SESSION_LIMIT;
    this.interstitialCooldownMs = DEFAULT_INTERSTITIAL_COOLDOWN_MS;
    this.lastInterstitialShownAt = 0;
    this.lastAdResetDate = null;
    this.iapProvider = 'mock';
    this.adProvider = 'mock';
    this.purchasesModule = null;
    this.adMobModule = null;
    this.offeringsCache = null;
    this.personalizedAdsEnabled = false;
  }

  __reset__() {
    this.__reset();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      devLog.log('Initializing monetization service...');
      await Promise.all([
        this.initializeIap(),
        this.initializeAds(),
        this.initializeInterstitialRuntimeConfig(),
      ]);
      if (this.iapProvider !== 'revenuecat' && this.allowMockBilling) {
        await this.loadOwnedProducts();
      }
      await this.loadAdCount();
      await this.refreshAuthoritativeEntitlements({
        forceRemoteRefresh: this.refreshEntitlementsOnStartup,
        context: 'startup',
      });
      await this.syncEntitlements();
      this.resetDailyAdCountIfNeeded();
      this.isInitialized = true;

      if (this.iapProvider === 'mock' && !this.allowMockBilling) {
        devLog.warn('Running in production without a real IAP provider.');
      }
      if (this.adProvider === 'mock' && !this.allowMockAds) {
        devLog.warn('Running in production without a real ads provider.');
      }

      devLog.log(`Monetization service initialized (iap: ${this.iapProvider}, ads: ${this.adProvider})`);
    } catch (error) {
      console.error('Monetization initialization failed:', error);
      this.isInitialized = false;
    }
  }

  private applyInterstitialRuntimeConfig(
    config: InterstitialRuntimeConfig,
    source: 'local' | 'remote'
  ): void {
    let updated = false;

    if (typeof config.interstitialSessionLimit === 'number') {
      this.interstitialSessionLimit = config.interstitialSessionLimit;
      updated = true;
    }

    if (typeof config.interstitialCooldownMs === 'number') {
      this.interstitialCooldownMs = config.interstitialCooldownMs;
      updated = true;
    }

    if (!updated) return;

    devLog.log(
      `[monetization] interstitial config (${source}) -> session_cap=${this.interstitialSessionLimit}, cooldown_ms=${this.interstitialCooldownMs}`
    );
  }

  private async initializeInterstitialRuntimeConfig(): Promise<void> {
    const localOverrides = getLocalInterstitialRuntimeConfig();
    this.applyInterstitialRuntimeConfig(localOverrides, 'local');

    const remoteConfigUrl = getMonetizationRemoteConfigUrl();
    if (!remoteConfigUrl) return;

    const remoteOverrides = await fetchRemoteInterstitialRuntimeConfig(remoteConfigUrl);
    if (!remoteOverrides) return;

    this.applyInterstitialRuntimeConfig(remoteOverrides, 'remote');
  }

  async getProducts(): Promise<Product[]> {
    if (!this.isInitialized) await this.initialize();

    if (this.iapProvider === 'revenuecat' && this.purchasesModule?.getOfferings) {
      try {
        const offerings = await this.purchasesModule.getOfferings();
        this.offeringsCache = offerings as RevenueCatOfferings;
        const packages = offerings?.current?.availablePackages ?? [];

        const mappedProducts = packages
          .map((pkg: RevenueCatPackage) => this.mapRevenueCatPackage(pkg))
          .filter((product: Product | null): product is Product => product !== null);

        if (mappedProducts.length > 0) {
          return mappedProducts;
        }
      } catch (error) {
        devLog.warn('RevenueCat offerings fetch failed, using fallback catalog:', error);
      }
    }

    return Object.values(PRODUCTS);
  }

  async purchaseProduct(productId: ProductId): Promise<PurchaseResult> {
    if (!this.isInitialized) await this.initialize();

    try {
      devLog.log(`Purchasing: ${productId}`);
      const productIdCandidate = String(productId);
      const knownProduct = isKnownProductId(productIdCandidate);

      if (!knownProduct && !this.allowMockBilling) {
        return {
          success: false,
          productId,
          error: 'Unknown product id',
        };
      }

      if (this.iapProvider === 'revenuecat' && this.purchasesModule && knownProduct) {
        const sku = this.getSkuForPlatform(productIdCandidate);
        await this.purchaseViaRevenueCat(productIdCandidate, sku);
        await this.refreshOwnedProductsFromRevenueCat();
      } else {
        if (!this.allowMockBilling) {
          return {
            success: false,
            productId,
            error: 'IAP provider unavailable in this build',
          };
        }

        await new Promise(resolve => setTimeout(resolve, MOCK_PURCHASE_DELAY_MS));
        if (knownProduct) {
          this.ownedProducts.add(productIdCandidate);
        }
      }

      await this.saveOwnedProducts();
      await this.refreshAuthoritativeEntitlements({
        forceRemoteRefresh: true,
        context: 'purchase',
      });
      await this.syncEntitlements();
      devLog.log(`Purchase successful: ${productId}`);
      return {
        success: true,
        productId,
      };
    } catch (error: any) {
      console.error('Purchase failed:', error);
      return {
        success: false,
        productId,
        error: error?.message || 'Purchase failed',
      };
    }
  }

  async restorePurchases(): Promise<ProductId[]> {
    if (!this.isInitialized) await this.initialize();

    try {
      devLog.log('Restoring purchases...');

      if (this.iapProvider === 'revenuecat' && this.purchasesModule?.restorePurchases) {
        const customerInfo = await this.purchasesModule.restorePurchases();
        this.applyCustomerInfo(customerInfo, true);
      } else if (!this.allowMockBilling) {
        return [];
      }

      await this.saveOwnedProducts();
      await this.refreshAuthoritativeEntitlements({
        forceRemoteRefresh: true,
        context: 'restore',
      });
      await this.syncEntitlements();
      const restored = Array.from(this.ownedProducts);
      devLog.log(`Restored ${restored.length} purchases`);
      return restored;
    } catch (error) {
      console.error('Restore failed:', error);
      return [];
    }
  }

  hasProduct(productId: ProductId): boolean {
    return this.getEffectiveOwnedProducts().has(productId);
  }

  isPremium(): boolean {
    return this.getEffectiveOwnedProducts().size > 0;
  }

  async showRewardedAd(rewardType: 'energy' | 'intelligence' | 'money'): Promise<RewardedAdResult> {
    if (!this.isInitialized) await this.initialize();

    if (!this.adsEnabled || this.hasProduct('remove_ads') || this.hasProduct('season_pass')) {
      return {
        success: false,
        error: 'Ads disabled for Premium users',
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
        this.rewardedAdCount++;
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
    this.rewardedAdCount++;
    this.saveAdCount();
    return {
      success: true,
      reward: { type: rewardType, amount: fallbackAmount },
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

    if (this.hasProduct('remove_ads') || this.hasProduct('season_pass')) {
      return {
        shown: false,
        reason: 'premium',
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
      this.lastInterstitialShownAt > 0
      && now - this.lastInterstitialShownAt < this.interstitialCooldownMs
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
    return Math.max(0, this.dailyAdLimit - this.rewardedAdCount);
  }

  setAdsEnabled(enabled: boolean): void {
    this.adsEnabled = enabled;
  }

  setPersonalizedAdsEnabled(enabled: boolean): void {
    this.personalizedAdsEnabled = enabled;
  }

  setEntitlementTokenProvider(provider: AuthTokenProvider | null): void {
    this.entitlementTokenProvider = provider;
  }

  private async initializeIap(): Promise<void> {
    if (Platform.OS === 'web') {
      this.iapProvider = 'mock';
      return;
    }

    try {
      const purchasesImport = optionalRequire('react-native-purchases');
      const purchases = (purchasesImport?.default ?? purchasesImport) as PurchasesModule | null;
      const apiKey = getRevenueCatApiKey();

      if (!apiKey) {
        if (!this.allowMockBilling) {
          devLog.warn(
            'RevenueCat API key missing. Set EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY / EXPO_PUBLIC_REVENUECAT_IOS_API_KEY or app.json extra.revenueCat.'
          );
        }
        this.iapProvider = 'mock';
        this.purchasesModule = null;
        return;
      }

      if (!purchases?.configure) {
        if (!this.allowMockBilling) {
          devLog.warn('react-native-purchases native module is unavailable in this build.');
        }
        this.iapProvider = 'mock';
        this.purchasesModule = null;
        return;
      }

      this.purchasesModule = purchases;
      if (purchases.setLogLevel && purchases.LOG_LEVEL?.DEBUG) {
        purchases.setLogLevel(purchases.LOG_LEVEL.DEBUG);
      }

      purchases.configure({ apiKey });
      this.iapProvider = 'revenuecat';
      await this.refreshOwnedProductsFromRevenueCat();
      devLog.log('RevenueCat configured successfully.');
    } catch (error) {
      devLog.warn('RevenueCat unavailable, using mock billing.', error);
      this.iapProvider = 'mock';
      this.purchasesModule = null;
    }
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
      devLog.log('Expo Go detected. Skipping AdMob native module and using mock ads.');
      this.adProvider = 'mock';
      this.adMobModule = null;
      return;
    }

    try {
      const adMobImport = optionalRequire('react-native-google-mobile-ads') as AdMobModule | null;
      const mobileAdsFactory = adMobImport?.default;
      if (!mobileAdsFactory) {
        if (!this.allowMockAds) {
          devLog.warn('react-native-google-mobile-ads native module is unavailable in this build.');
        }
        this.adProvider = 'mock';
        this.adMobModule = null;
        return;
      }

      if (!this.allowMockAds) {
        const missingRewardedId = !getAdUnitIdFromConfig('rewarded');
        const missingInterstitialId = !getAdUnitIdFromConfig('interstitial');
        if (missingRewardedId || missingInterstitialId) {
          devLog.warn(
            'AdMob ad unit IDs are missing for production. Set EXPO_PUBLIC_ADMOB_* env vars or app.json extra.admob.'
          );
        }
      }

      await mobileAdsFactory().initialize();
      this.adProvider = 'admob';
      this.adMobModule = adMobImport;
      devLog.log('AdMob initialized successfully.');
    } catch (error) {
      devLog.warn('AdMob unavailable, using mock ads.', error);
      this.adProvider = 'mock';
      this.adMobModule = null;
    }
  }

  private async purchaseViaRevenueCat(productId: ProductId, sku: string): Promise<void> {
    const purchases = this.purchasesModule;
    if (!purchases) {
      throw new Error('RevenueCat is not initialized');
    }

    const packageToPurchase = await this.getRevenueCatPackage(productId, sku);

    if (packageToPurchase && purchases.purchasePackage) {
      await purchases.purchasePackage(packageToPurchase as any);
      return;
    }

    if (purchases.purchaseProduct) {
      await purchases.purchaseProduct(sku);
      return;
    }

    if (purchases.getProducts && purchases.purchaseStoreProduct) {
      const products = await purchases.getProducts([sku]);
      if (Array.isArray(products) && products.length > 0) {
        await purchases.purchaseStoreProduct(products[0]);
        return;
      }
    }

    throw new Error(`RevenueCat product not found for ${productId}`);
  }

  private async getRevenueCatPackage(productId: ProductId, sku: string): Promise<RevenueCatPackage | null> {
    const purchases = this.purchasesModule;
    if (!purchases) return null;

    const offerings = this.offeringsCache ?? (await purchases.getOfferings?.());
    this.offeringsCache = (offerings as RevenueCatOfferings | null) ?? null;
    const packages = offerings?.current?.availablePackages ?? [];

    const bySku = packages.find((pkg: RevenueCatPackage) => pkg?.product?.identifier === sku);
    if (bySku) return bySku;

    const byPackageId = packages.find((pkg: RevenueCatPackage) => {
      const packageId = String(pkg?.identifier ?? '').toLowerCase();
      return packageId === productId;
    });
    return byPackageId ?? null;
  }

  private async refreshOwnedProductsFromRevenueCat(): Promise<void> {
    if (this.iapProvider !== 'revenuecat' || !this.purchasesModule?.getCustomerInfo) return;
    const customerInfo = await this.purchasesModule.getCustomerInfo();
    this.applyCustomerInfo(customerInfo as RevenueCatCustomerInfo, true);
  }

  private applyCustomerInfo(
    customerInfo: RevenueCatCustomerInfo | null | undefined,
    replaceExisting: boolean = false
  ): void {
    const collected = new Set<ProductId>();

    const addCandidate = (candidate: string | null | undefined) => {
      if (!candidate) return;
      const productId = this.resolveProductId(candidate);
      if (productId) {
        collected.add(productId);
      }
    };

    const purchased = customerInfo?.allPurchasedProductIdentifiers ?? [];
    const activeSubscriptions = customerInfo?.activeSubscriptions ?? [];
    const activeEntitlements = Object.keys(customerInfo?.entitlements?.active ?? {});

    purchased.forEach((id: string) => addCandidate(id));
    activeSubscriptions.forEach((id: string) => addCandidate(id));
    activeEntitlements.forEach((id: string) => {
      addCandidate(id);
      addCandidate(this.entitlementToProduct[id.toLowerCase()]);
    });

    if (replaceExisting) {
      this.ownedProducts = collected;
      return;
    }

    for (const productId of collected) {
      this.ownedProducts.add(productId);
    }
  }

  private resolveProductId(candidate: string): ProductId | null {
    if (isKnownProductId(candidate)) return candidate;

    const normalized = candidate.trim().toLowerCase();
    if (isKnownProductId(normalized)) return normalized;

    for (const productId of PRODUCT_IDS) {
      const sku = this.productSkus[productId];
      if (candidate === sku.ios || candidate === sku.android) {
        return productId;
      }
      if (normalized === sku.ios.toLowerCase() || normalized === sku.android.toLowerCase()) {
        return productId;
      }
    }

    return this.entitlementToProduct[normalized] ?? null;
  }

  private mapRevenueCatPackage(pkg: RevenueCatPackage): Product | null {
    const storeProduct = pkg?.product;
    if (!storeProduct) return null;

    const packageIdentifier = String(pkg?.identifier ?? '');
    const storeIdentifier = String(storeProduct?.identifier ?? '');
    const productId =
      this.resolveProductId(storeIdentifier) ??
      this.resolveProductId(packageIdentifier) ??
      null;

    if (!productId) return null;

    const fallback = PRODUCTS[productId];
    return {
      id: productId,
      title: String(storeProduct?.title ?? fallback.title),
      description: String(storeProduct?.description ?? fallback.description),
      price: String(storeProduct?.priceString ?? fallback.price),
      localizedPrice:
        storeProduct?.price !== undefined && storeProduct?.price !== null
          ? String(storeProduct.price)
          : fallback.localizedPrice,
      currencyCode: String(storeProduct?.currencyCode ?? fallback.currencyCode ?? ''),
    };
  }

  private getSkuForPlatform(productId: ProductId): string {
    return Platform.OS === 'ios' ? this.productSkus[productId].ios : this.productSkus[productId].android;
  }

  private getAdUnitId(kind: AdType): string | null {
    const testIds = this.adMobModule?.TestIds;
    if (isDevRuntime && testIds) {
      return kind === 'rewarded' ? testIds.REWARDED : testIds.INTERSTITIAL;
    }

    const fromConfig = getAdUnitIdFromConfig(kind);
    if (fromConfig) return fromConfig;

    return null;
  }

  private async showRewardedAdWithAdMob(
    rewardType: 'energy' | 'intelligence' | 'money',
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
      const unsubs: (() => void)[] = [];
      const settle = (result: RewardedAdResult) => {
        if (settled) return;
        settled = true;
        unsubs.forEach(unsub => {
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
      const unsubs: (() => void)[] = [];
      const settle = (result: boolean) => {
        if (settled) return;
        settled = true;
        unsubs.forEach(unsub => {
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

  private getFallbackRewardAmount(rewardType: 'energy' | 'intelligence' | 'money'): number {
    if (rewardType === 'energy') return 20;
    if (rewardType === 'intelligence') return 10;
    return 100;
  }

  private recordInterstitialShown(timestamp: number): void {
    this.interstitialShownThisSession += 1;
    this.lastInterstitialShownAt = timestamp;
  }

  private async loadOwnedProducts(): Promise<void> {
    try {
      const saved = await readStorageItem(STORAGE_PRODUCTS_KEY);
      if (!saved) return;

      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return;

      const validated = parsed
        .map((item: unknown) => (typeof item === 'string' ? item : ''))
        .filter((id: string): id is ProductId => isKnownProductId(id));

      validated.forEach(productId => this.ownedProducts.add(productId));
    } catch (error) {
      console.error('Failed to load owned products:', error);
    }
  }

  private async saveOwnedProducts(): Promise<void> {
    try {
      const products = Array.from(this.ownedProducts);
      await writeStorageItem(STORAGE_PRODUCTS_KEY, JSON.stringify(products));
    } catch (error) {
      console.error('Failed to save owned products:', error);
    }
  }

  private resetDailyAdCountIfNeeded(): void {
    const today = new Date().toISOString().split('T')[0];
    if (this.lastAdResetDate === today) return;

    this.rewardedAdCount = 0;
    this.lastAdResetDate = today;
    this.saveAdCount();
  }

  private saveAdCount(): void {
    try {
      void writeStorageItem(
        STORAGE_AD_COUNT_KEY,
        JSON.stringify({
          count: this.rewardedAdCount,
          date: this.lastAdResetDate,
        })
      );
    } catch (error) {
      console.error('Failed to save ad count:', error);
    }
  }

  private async loadAdCount(): Promise<void> {
    try {
      const raw = await readStorageItem(STORAGE_AD_COUNT_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      this.rewardedAdCount = Number(parsed?.count) || 0;
      this.lastAdResetDate = typeof parsed?.date === 'string' ? parsed.date : null;
    } catch (error) {
      console.error('Failed to load ad count:', error);
    }
  }

  private getEffectiveOwnedProducts(): Set<ProductId> {
    if (this.authoritativeProducts) {
      return this.authoritativeProducts;
    }

    if (this.requireServerAuthority && this.entitlementApiBaseUrl && !isDevRuntime) {
      return new Set<ProductId>();
    }

    return this.ownedProducts;
  }

  private isSecureEntitlementEndpoint(url: string): boolean {
    if (!url) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private async resolveEntitlementAuthToken(): Promise<string | null> {
    if (this.entitlementTokenProvider) {
      try {
        const provided = await this.entitlementTokenProvider();
        const normalized = typeof provided === 'string' ? provided.trim() : '';
        if (normalized.length > 0) return normalized;
      } catch (error) {
        devLog.warn('Entitlement token provider failed.', error);
      }
    }

    return getMonetizationEntitlementAuthToken();
  }

  private parseServerProducts(payload: ServerEntitlementsResponse): Set<ProductId> {
    const serverProducts = Array.isArray(payload?.products) ? payload.products : [];
    const resolved = new Set<ProductId>();

    for (const candidate of serverProducts) {
      if (typeof candidate !== 'string') continue;
      const productId = this.resolveProductId(candidate);
      if (productId) {
        resolved.add(productId);
      }
    }

    return resolved;
  }

  private async fetchServerEntitlements(shouldRefresh: boolean): Promise<Set<ProductId> | null> {
    if (!this.entitlementApiBaseUrl) {
      return null;
    }

    if (!isDevRuntime && !this.isSecureEntitlementEndpoint(this.entitlementApiBaseUrl)) {
      devLog.warn('Entitlement API must use HTTPS in production builds.');
      return null;
    }

    const token = await this.resolveEntitlementAuthToken();
    if (!token) {
      devLog.warn('Entitlement API token is missing.');
      return null;
    }

    const base = this.entitlementApiBaseUrl;
    const headers = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    if (shouldRefresh) {
      try {
        await withTimeout(
          fetch(`${base}/v1/entitlements/refresh`, {
            method: 'POST',
            headers,
          }),
          this.entitlementTimeoutMs
        );
      } catch {
        // Continue with cached backend state if refresh endpoint fails.
      }
    }

    try {
      const response = await withTimeout(
        fetch(`${base}/v1/entitlements`, {
          method: 'GET',
          headers,
        }),
        this.entitlementTimeoutMs
      );

      if (!response.ok) {
        devLog.warn(`Entitlement API returned ${response.status}`);
        return null;
      }

      const payload = (await response.json()) as ServerEntitlementsResponse;
      return this.parseServerProducts(payload);
    } catch (error) {
      devLog.warn('Failed to fetch entitlements from backend authority.', error);
      return null;
    }
  }

  private async refreshAuthoritativeEntitlements(
    options: { forceRemoteRefresh?: boolean; context: 'startup' | 'purchase' | 'restore' }
  ): Promise<void> {
    if (!this.entitlementApiBaseUrl) {
      this.authoritativeProducts = null;
      return;
    }

    const authoritative = await this.fetchServerEntitlements(Boolean(options.forceRemoteRefresh));
    if (authoritative) {
      this.authoritativeProducts = authoritative;
      return;
    }

    if (this.requireServerAuthority && !isDevRuntime) {
      this.authoritativeProducts = new Set<ProductId>();
      devLog.warn(`[monetization] server authority required; entitlements fail-closed (${options.context}).`);
      return;
    }

    this.authoritativeProducts = null;
  }

  private async syncEntitlements(): Promise<void> {
    const effectiveProducts = this.getEffectiveOwnedProducts();
    const hasPremiumSlots = effectiveProducts.has('save_slots_premium') || effectiveProducts.has('season_pass');
    const hasRemoveAds = effectiveProducts.has('remove_ads') || effectiveProducts.has('season_pass');

    SaveManager.setPremiumUnlocked(hasPremiumSlots);
    SaveManager.setAdsDisabled(hasRemoveAds);
    this.adsEnabled = !hasRemoveAds;
  }
}

export const monetizationService = new MonetizationService();

export const initMonetization = () => monetizationService.initialize();
export const getProducts = () => monetizationService.getProducts();
export const purchaseProduct = (id: ProductId) => monetizationService.purchaseProduct(id);
export const hasProduct = (id: ProductId) => monetizationService.hasProduct(id);
export const isPremium = () => monetizationService.isPremium();
export const showRewardedAd = (type: 'energy' | 'intelligence' | 'money') =>
  monetizationService.showRewardedAd(type);
export const showInterstitialAd = () => monetizationService.showInterstitialAd();
export const showInterstitialAdDetailed = () => monetizationService.showInterstitialAdDetailed();
export const getRemainingRewardedAds = () => monetizationService.getRemainingRewardedAds();
export const restorePurchases = () => monetizationService.restorePurchases();
export const setPersonalizedAdsEnabled = (enabled: boolean) =>
  monetizationService.setPersonalizedAdsEnabled(enabled);
export const setEntitlementTokenProvider = (provider: AuthTokenProvider | null) =>
  monetizationService.setEntitlementTokenProvider(provider);
