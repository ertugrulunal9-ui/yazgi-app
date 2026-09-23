/**
 * subscriptionManager.ts - RevenueCat premium subscription manager.
 *
 * Sprint 3 hardening goals:
 * - Deterministic behavior for purchase/restore fail paths
 * - Feature-flag + kill-switch safety
 * - Runtime config validation for missing/placeholder keys
 */

import { Platform } from 'react-native';
import { isFeatureEnabled } from '../config/featureFlags';

export interface SubscriptionProduct {
  id: string;
  title: string;
  description: string;
  price: string;
  period: 'monthly' | 'yearly';
}

export interface SubscriptionState {
  isPremium: boolean;
  activeProductId: string | null;
  expiresAt: string | null;
  isLoading: boolean;
  error: string | null;
}

export type PremiumErrorCode =
  | 'premium_disabled'
  | 'premium_kill_switch'
  | 'purchases_disabled'
  | 'restore_disabled'
  | 'billing_unavailable'
  | 'revenuecat_unavailable'
  | 'missing_config'
  | 'not_initialized'
  | 'offerings_unavailable'
  | 'product_not_found'
  | 'entitlement_not_granted'
  | 'no_active_subscription'
  | 'cancelled'
  | 'network_error'
  | 'purchase_failed'
  | 'restore_failed';

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  error?: string;
  code?: PremiumErrorCode;
}

export interface PremiumRuntimeStatus {
  featureEnabled: boolean;
  killSwitchActive: boolean;
  purchasesEnabled: boolean;
  restoreEnabled: boolean;
  hasApiKey: boolean;
  revenueCatAvailable: boolean;
  canMakePayments: boolean | null;
  initialized: boolean;
  cachedPremium: boolean;
  lastInitIssueCode: PremiumErrorCode | null;
}

const ENTITLEMENT_ID = 'premium';
const PLACEHOLDER_SECRET_PATTERN = /(TODO|REPLACE|YOUR_|CHANGE_ME|<.*>)/i;
const BILLING_UNAVAILABLE_MESSAGE = 'Billing is unavailable on this device';

type RevenueCatExtraConfig = {
  iosApiKey?: string;
  androidApiKey?: string;
};

type PremiumRolloutExtraConfig = {
  killSwitch?: boolean | string | number;
  purchasesEnabled?: boolean | string | number;
  restoreEnabled?: boolean | string | number;
};

type PremiumRolloutPolicy = {
  killSwitch: boolean;
  purchasesEnabled: boolean;
  restoreEnabled: boolean;
};

type InitIssue = {
  code: PremiumErrorCode;
  message: string;
};

type PremiumReadinessMode = 'read' | 'purchase' | 'restore';

const normalizeKey = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : '';
};

const parseBoolean = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1 ? true : value === 0 ? false : null;
  if (typeof value !== 'string') return null;

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return null;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeSecret = (value: unknown): string => {
  const normalized = normalizeKey(value);
  if (!normalized) return '';
  return PLACEHOLDER_SECRET_PATTERN.test(normalized) ? '' : normalized;
};

const pickFirstSecret = (...candidates: unknown[]): string => {
  for (const candidate of candidates) {
    const secret = normalizeSecret(candidate);
    if (secret) return secret;
  }
  return '';
};

const getAppExtra = (): Record<string, unknown> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const constantsModule = require('expo-constants');
    const constants = constantsModule?.default ?? constantsModule;
    const expoConfig = constants?.expoConfig ?? constants?.manifest ?? null;
    return isObjectRecord(expoConfig?.extra) ? expoConfig.extra : {};
  } catch {
    return {};
  }
};

const getRevenueCatExtraConfig = (): RevenueCatExtraConfig => {
  const appExtra = getAppExtra();
  const revenueCat = appExtra.revenueCat;
  return isObjectRecord(revenueCat) ? (revenueCat as RevenueCatExtraConfig) : {};
};

const getPremiumRolloutExtraConfig = (): PremiumRolloutExtraConfig => {
  const appExtra = getAppExtra();
  const rollout = appExtra.premiumRollout;
  return isObjectRecord(rollout) ? (rollout as PremiumRolloutExtraConfig) : {};
};

const resolveBoolean = (
  envValue: unknown,
  configValue: unknown,
  fallback: boolean
): boolean => {
  const fromEnv = parseBoolean(envValue);
  if (fromEnv !== null) return fromEnv;
  const fromConfig = parseBoolean(configValue);
  if (fromConfig !== null) return fromConfig;
  return fallback;
};

const getPremiumRolloutPolicy = (): PremiumRolloutPolicy => {
  const rollout = getPremiumRolloutExtraConfig();
  return {
    killSwitch: resolveBoolean(process.env.EXPO_PUBLIC_PREMIUM_KILL_SWITCH, rollout.killSwitch, false),
    purchasesEnabled: resolveBoolean(
      process.env.EXPO_PUBLIC_PREMIUM_PURCHASES_ENABLED,
      rollout.purchasesEnabled,
      true
    ),
    restoreEnabled: resolveBoolean(
      process.env.EXPO_PUBLIC_PREMIUM_RESTORE_ENABLED,
      rollout.restoreEnabled,
      true
    ),
  };
};

const getRevenueCatApiKey = (platform: 'ios' | 'android'): string => {
  const fromEnv = platform === 'ios'
    ? pickFirstSecret(
      process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
      process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY
    )
    : pickFirstSecret(
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY
    );
  if (fromEnv) return fromEnv;

  const fromConfig = getRevenueCatExtraConfig();
  return pickFirstSecret(platform === 'ios' ? fromConfig.iosApiKey : fromConfig.androidApiKey);
};

const getPlatformForKey = (): 'ios' | 'android' => (Platform.OS === 'ios' ? 'ios' : 'android');

const isExpoGoRuntime = (): boolean => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const constantsModule = require('expo-constants');
    const constants = constantsModule?.default ?? constantsModule;
    const appOwnership = normalizeKey(constants?.appOwnership).toLowerCase();
    const executionEnvironment = normalizeKey(constants?.executionEnvironment).toLowerCase();
    return appOwnership === 'expo' || executionEnvironment === 'storeclient';
  } catch {
    return false;
  }
};

const buildFailure = (
  code: PremiumErrorCode,
  error: string,
  productId?: string
): PurchaseResult => ({
  success: false,
  code,
  error,
  ...(productId ? { productId } : {}),
});

const formatErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && error.message.trim()) return error.message;
  if (
    typeof error === 'object'
    && error !== null
    && 'message' in error
    && typeof (error as { message?: unknown }).message === 'string'
  ) {
    const message = normalizeKey((error as { message: string }).message);
    if (message) return message;
  }
  return fallback;
};

const isNetworkMessage = (message: string): boolean => /network|internet|timeout|timed out|offline/i.test(message);

const isPremiumFeatureEnabled = (): boolean => isFeatureEnabled('PREMIUM_SUBSCRIPTION');

export const PRODUCTS: SubscriptionProduct[] = [
  {
    id: 'yazgi_premium_monthly',
    title: 'Aylik Premium',
    description: 'Reklamsiz deneyim, sinirsiz geri al, ozel eventler',
    price: '$2.99',
    period: 'monthly',
  },
  {
    id: 'yazgi_premium_yearly',
    title: 'Yillik Premium',
    description: 'Ayliga gore %44 tasarruf',
    price: '$19.99',
    period: 'yearly',
  },
];

let revenueCatModule: any = null;
let revenueCatInitialized = false;
let cachedPremiumState = false;
let customerInfoUnsubscribe: (() => void) | null = null;
let lastInitIssue: InitIssue | null = null;
let initInFlight: Promise<void> | null = null;
let canMakePayments: boolean | null = null;

const listeners = new Set<(isPremium: boolean) => void>();

function emit(isPremium: boolean): void {
  cachedPremiumState = isPremium;
  listeners.forEach(fn => fn(isPremium));
}

const clearInitIssue = (): void => {
  lastInitIssue = null;
};

const setInitIssue = (code: PremiumErrorCode, message: string): void => {
  lastInitIssue = { code, message };
};

const getPurchasesErrorCode = (error: unknown): string => {
  if (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && typeof (error as { code?: unknown }).code === 'string'
  ) {
    return normalizeKey((error as { code: string }).code);
  }
  return '';
};

const getPurchasesReadableCode = (error: unknown): string => {
  if (
    typeof error === 'object'
    && error !== null
    && 'userInfo' in error
    && isObjectRecord((error as { userInfo?: unknown }).userInfo)
  ) {
    const fromUserInfo = normalizeKey((error as { userInfo: { readableErrorCode?: unknown } }).userInfo.readableErrorCode);
    if (fromUserInfo) return fromUserInfo.toUpperCase();
  }

  if (
    typeof error === 'object'
    && error !== null
    && 'readableErrorCode' in error
    && typeof (error as { readableErrorCode?: unknown }).readableErrorCode === 'string'
  ) {
    return normalizeKey((error as { readableErrorCode: string }).readableErrorCode).toUpperCase();
  }

  return '';
};

const getPurchasesUnderlyingMessage = (error: unknown): string => {
  if (
    typeof error === 'object'
    && error !== null
    && 'underlyingErrorMessage' in error
    && typeof (error as { underlyingErrorMessage?: unknown }).underlyingErrorMessage === 'string'
  ) {
    return normalizeKey((error as { underlyingErrorMessage: string }).underlyingErrorMessage);
  }
  return '';
};

const isBillingUnavailableError = (error: unknown): boolean => {
  const code = getPurchasesErrorCode(error);
  const readableCode = getPurchasesReadableCode(error);
  const details = `${formatErrorMessage(error, '')} ${getPurchasesUnderlyingMessage(error)}`.toLowerCase();

  if (code === '3') return true;
  if (readableCode.includes('PURCHASE_NOT_ALLOWED')) return true;
  return /billing.*unavailable|purchase not allowed|not allowed to make the purchase/.test(details);
};

const isOfferingsConfigurationError = (error: unknown): boolean => {
  const code = getPurchasesErrorCode(error);
  const readableCode = getPurchasesReadableCode(error);
  const details = `${formatErrorMessage(error, '')} ${getPurchasesUnderlyingMessage(error)}`.toLowerCase();

  if (code === '23') return true;
  if (readableCode.includes('CONFIGURATION')) return true;
  return /there is an issue with your configuration|offerings.*empty|no play store products/.test(details);
};

async function getRevenueCat(): Promise<any | null> {
  if (revenueCatModule !== null) {
    return revenueCatModule === false ? null : revenueCatModule;
  }

  try {
    const mod = await import('react-native-purchases');
    revenueCatModule = mod.default ?? mod;
    return revenueCatModule;
  } catch {
    revenueCatModule = false;
    return null;
  }
}

const getGuardFailure = (
  mode: PremiumReadinessMode,
  productId?: string
): PurchaseResult | null => {
  if (mode !== 'read' && !isPremiumFeatureEnabled()) {
    return buildFailure('premium_disabled', 'Premium feature is disabled', productId);
  }

  const rollout = getPremiumRolloutPolicy();
  if (mode !== 'read' && rollout.killSwitch) {
    return buildFailure('premium_kill_switch', 'Premium is temporarily unavailable', productId);
  }

  if (mode === 'purchase' && !rollout.purchasesEnabled) {
    return buildFailure('purchases_disabled', 'Purchases are temporarily disabled', productId);
  }

  if (mode === 'restore' && !rollout.restoreEnabled) {
    return buildFailure('restore_disabled', 'Restore is temporarily disabled', productId);
  }

  return null;
};

const ensurePremiumRuntimeReady = async (
  mode: PremiumReadinessMode,
  productId?: string
): Promise<{ ok: true; Purchases: any } | { ok: false; result: PurchaseResult }> => {
  const guardFailure = getGuardFailure(mode, productId);
  if (guardFailure) {
    return { ok: false, result: guardFailure };
  }

  await initializeSubscriptions();

  const Purchases = await getRevenueCat();
  if (!Purchases || !revenueCatInitialized) {
    if (lastInitIssue) {
      return {
        ok: false,
        result: buildFailure(lastInitIssue.code, lastInitIssue.message, productId),
      };
    }
    return {
      ok: false,
      result: buildFailure('not_initialized', 'RevenueCat not initialized', productId),
    };
  }

  if (mode !== 'read' && canMakePayments === false) {
    return {
      ok: false,
      result: buildFailure('billing_unavailable', BILLING_UNAVAILABLE_MESSAGE, productId),
    };
  }

  return { ok: true, Purchases };
};

const mapPurchaseFailure = (
  error: unknown,
  fallbackCode: PremiumErrorCode,
  fallbackMessage: string,
  productId?: string
): PurchaseResult => {
  if (typeof error === 'object' && error !== null && (error as { userCancelled?: boolean }).userCancelled) {
    return buildFailure('cancelled', 'cancelled', productId);
  }

  const message = formatErrorMessage(error, fallbackMessage);
  if (isNetworkMessage(message)) {
    return buildFailure('network_error', message, productId);
  }
  if (isBillingUnavailableError(error)) {
    return buildFailure('billing_unavailable', BILLING_UNAVAILABLE_MESSAGE, productId);
  }
  if (isOfferingsConfigurationError(error)) {
    return buildFailure('offerings_unavailable', 'No purchasable offerings available', productId);
  }
  return buildFailure(fallbackCode, message, productId);
};

export function getPremiumRuntimeStatus(): PremiumRuntimeStatus {
  const rollout = getPremiumRolloutPolicy();
  const hasApiKey = Boolean(getRevenueCatApiKey(getPlatformForKey()));
  const revenueCatAvailable = revenueCatModule !== false && !isExpoGoRuntime();

  return {
    featureEnabled: isPremiumFeatureEnabled(),
    killSwitchActive: rollout.killSwitch,
    purchasesEnabled: rollout.purchasesEnabled,
    restoreEnabled: rollout.restoreEnabled,
    hasApiKey,
    revenueCatAvailable,
    canMakePayments,
    initialized: revenueCatInitialized,
    cachedPremium: cachedPremiumState,
    lastInitIssueCode: lastInitIssue?.code ?? null,
  };
}

export function canOpenPremiumPaywall(): boolean {
  const runtimeStatus = getPremiumRuntimeStatus();
  if (!runtimeStatus.featureEnabled) return false;
  if (runtimeStatus.killSwitchActive) return false;
  if (!runtimeStatus.hasApiKey) return false;
  if (!runtimeStatus.revenueCatAvailable) return false;
  if (runtimeStatus.canMakePayments === false) return false;
  return runtimeStatus.purchasesEnabled || runtimeStatus.restoreEnabled;
}

export async function initializeSubscriptions(): Promise<void> {
  if (revenueCatInitialized) return;
  if (initInFlight) return initInFlight;

  initInFlight = (async () => {
    if (!isPremiumFeatureEnabled()) {
      setInitIssue('premium_disabled', 'Premium feature is disabled');
      return;
    }

    if (isExpoGoRuntime()) {
      setInitIssue('revenuecat_unavailable', 'RevenueCat native purchases are unavailable in Expo Go');
      return;
    }

    const Purchases = await getRevenueCat();
    if (!Purchases) {
      setInitIssue('revenuecat_unavailable', 'RevenueCat SDK is unavailable in this build');
      return;
    }

    const apiKey = getRevenueCatApiKey(getPlatformForKey());
    if (!apiKey) {
      setInitIssue('missing_config', 'RevenueCat API key is missing');
      return;
    }

    try {
      await Purchases.configure({ apiKey });
      revenueCatInitialized = true;
      canMakePayments = null;
      clearInitIssue();

      if (typeof Purchases.canMakePayments === 'function') {
        try {
          canMakePayments = await Purchases.canMakePayments();
        } catch {
          canMakePayments = null;
        }
      }

      await refreshPremiumStatus();

      if (!customerInfoUnsubscribe && typeof Purchases.addCustomerInfoUpdateListener === 'function') {
        const unsubscribe = Purchases.addCustomerInfoUpdateListener((info: any) => {
          const isPremium = Boolean(info?.entitlements?.active?.[ENTITLEMENT_ID]);
          emit(isPremium);
        });

        if (typeof unsubscribe === 'function') {
          customerInfoUnsubscribe = unsubscribe;
        }
      }
    } catch (error) {
      revenueCatInitialized = false;
      const message = formatErrorMessage(error, 'RevenueCat initialization failed');
      setInitIssue('not_initialized', message);
      console.warn('[SubscriptionManager] Init failed:', message);
    }
  })().finally(() => {
    initInFlight = null;
  });

  return initInFlight;
}

export async function refreshPremiumStatus(): Promise<boolean> {
  const readiness = await ensurePremiumRuntimeReady('read');
  if (!readiness.ok) return cachedPremiumState;

  try {
    const info = await readiness.Purchases.getCustomerInfo();
    const isPremium = Boolean(info?.entitlements?.active?.[ENTITLEMENT_ID]);
    emit(isPremium);
    return isPremium;
  } catch {
    return cachedPremiumState;
  }
}

export function isPremium(): boolean {
  return cachedPremiumState;
}

export function subscribePremiumState(listener: (isPremium: boolean) => void): () => void {
  listeners.add(listener);
  listener(cachedPremiumState);
  return () => listeners.delete(listener);
}

export async function getOfferings(): Promise<SubscriptionProduct[]> {
  const guardFailure = getGuardFailure('read');
  if (guardFailure) return [];

  const readiness = await ensurePremiumRuntimeReady('read');
  if (!readiness.ok) return [];

  try {
    const offerings = await readiness.Purchases.getOfferings();
    const current = offerings?.current;
    const packages = current?.availablePackages;

    if (!Array.isArray(packages) || packages.length === 0) {
      return [];
    }

    return packages
      .map((pkg: any) => ({
        id: pkg?.product?.identifier ?? pkg?.identifier ?? '',
        title: pkg?.product?.title ?? 'Premium',
        description: pkg?.product?.description ?? '',
        price: pkg?.product?.priceString ?? '',
        period: pkg?.packageType === 'ANNUAL' ? 'yearly' as const : 'monthly' as const,
      }))
      .filter((item: SubscriptionProduct) => item.id.length > 0);
  } catch (error) {
    if (isOfferingsConfigurationError(error)) {
      return [];
    }
    return [];
  }
}

export async function purchaseProduct(productId: string): Promise<PurchaseResult> {
  const readiness = await ensurePremiumRuntimeReady('purchase', productId);
  if (!readiness.ok) return readiness.result;

  try {
    const offerings = await readiness.Purchases.getOfferings();
    const current = offerings?.current;
    const packages = Array.isArray(current?.availablePackages) ? current.availablePackages : [];

    if (packages.length === 0) {
      return buildFailure('offerings_unavailable', 'No purchasable offerings available', productId);
    }

    const pkg = packages.find((candidate: any) =>
      (candidate?.product?.identifier ?? candidate?.identifier) === productId
    );
    if (!pkg) {
      return buildFailure('product_not_found', 'Product not found in active offerings', productId);
    }

    const result = await readiness.Purchases.purchasePackage(pkg);
    const isPremiumNow = Boolean(result?.customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]);
    emit(isPremiumNow);

    return isPremiumNow
      ? { success: true, productId }
      : buildFailure('entitlement_not_granted', 'Entitlement not granted after purchase', productId);
  } catch (error) {
    return mapPurchaseFailure(error, 'purchase_failed', 'Purchase failed', productId);
  }
}

export async function restorePurchases(): Promise<PurchaseResult> {
  const readiness = await ensurePremiumRuntimeReady('restore');
  if (!readiness.ok) return readiness.result;

  try {
    const info = await readiness.Purchases.restorePurchases();
    const isPremiumNow = Boolean(info?.entitlements?.active?.[ENTITLEMENT_ID]);
    emit(isPremiumNow);

    return isPremiumNow
      ? { success: true }
      : buildFailure('no_active_subscription', 'No active subscription found');
  } catch (error) {
    return mapPurchaseFailure(error, 'restore_failed', 'Restore failed');
  }
}

export async function checkSubscriptionStatus(): Promise<{ isPremium: boolean; expiresAt: number | null }> {
  const readiness = await ensurePremiumRuntimeReady('read');
  if (!readiness.ok) {
    return { isPremium: cachedPremiumState, expiresAt: null };
  }

  try {
    const info = await readiness.Purchases.getCustomerInfo();
    const entitlement = info?.entitlements?.active?.[ENTITLEMENT_ID];
    const isPremiumNow = Boolean(entitlement);
    emit(isPremiumNow);

    const expiresAt = entitlement?.expirationDate
      ? Date.parse(entitlement.expirationDate)
      : null;
    return {
      isPremium: isPremiumNow,
      expiresAt: Number.isFinite(expiresAt) ? expiresAt : null,
    };
  } catch {
    return { isPremium: cachedPremiumState, expiresAt: null };
  }
}

export function onSubscriptionChange(callback: (isPremium: boolean) => void): () => void {
  return subscribePremiumState(callback);
}

export const initializePurchases = initializeSubscriptions;
export const purchasePackage = purchaseProduct;
