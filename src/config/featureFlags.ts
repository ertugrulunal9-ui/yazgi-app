import AsyncStorage from '@react-native-async-storage/async-storage';

type RemoteConfigValue = {
  asBoolean: () => boolean;
};

type RemoteConfigInstance = {
  setDefaults: (defaults: Record<string, string | number | boolean>) => Promise<void>;
  setConfigSettings: (settings: { minimumFetchIntervalMillis: number }) => Promise<void>;
  fetchAndActivate: () => Promise<boolean>;
  getValue: (key: string) => RemoteConfigValue;
};

type RemoteConfigFactory = () => RemoteConfigInstance;

export const FEATURE_FLAGS = {
  PARTIAL_ENERGY_RECOVERY: false,
  VARIETY_BONUS: false,
  REPETITION_PENALTY: false,
  AD_RELATIONSHIP_BOOST: false,
  AD_TRAIT_BOOST: false,
  AD_SHOPPING_DISCOUNT: false,
  AD_REPORT_PREVIEW: false,
  CONSUMABLE_ITEMS: false,
  CAREER_PATH_ACTIONS: false,
  LEGACY_PERKS: false,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;
export type FeatureFlagState = Record<FeatureFlag, boolean>;

const FEATURE_FLAG_KEYS = Object.keys(FEATURE_FLAGS) as FeatureFlag[];
const FEATURE_FLAG_OVERRIDES_KEY = '@yazgi/feature_flags/dev_overrides/v1';
const NORMAL_CACHE_MS = 43_200_000; // 12h
const PROBE_CACHE_MS = 300_000; // 5m
const MIN_REFRESH_INTERVAL_MS = 30_000;

const isDevRuntime = typeof __DEV__ !== 'undefined' && __DEV__;
const isWebRuntime = typeof window !== 'undefined' && typeof navigator !== 'undefined';

let initialized = false;
let lastRefreshAt = 0;
let refreshInFlight: Promise<void> | null = null;
let remoteConfigFactory: RemoteConfigFactory | null | undefined;
let currentFlags: FeatureFlagState = { ...FEATURE_FLAGS };
let devOverrides: Partial<FeatureFlagState> = {};

const listeners = new Set<(flags: FeatureFlagState) => void>();

const cloneFlags = (): FeatureFlagState => ({ ...currentFlags });

const emit = (): void => {
  const snapshot = cloneFlags();
  listeners.forEach(listener => listener(snapshot));
};

const parseBooleanRecord = (value: unknown): Partial<FeatureFlagState> => {
  if (!value || typeof value !== 'object') {
    return {};
  }

  const raw = value as Record<string, unknown>;
  const parsed: Partial<FeatureFlagState> = {};
  for (const key of FEATURE_FLAG_KEYS) {
    if (typeof raw[key] === 'boolean') {
      parsed[key] = raw[key] as boolean;
    }
  }
  return parsed;
};

const getRemoteConfig = (): RemoteConfigInstance | null => {
  if (isWebRuntime) return null;

  if (remoteConfigFactory === undefined) {
    try {
      const mod = require('@react-native-firebase/remote-config') as {
        default?: RemoteConfigFactory;
      };
      remoteConfigFactory = mod.default ?? null;
    } catch {
      remoteConfigFactory = null;
    }
  }

  if (!remoteConfigFactory) return null;
  return remoteConfigFactory();
};

const resolveFlags = (remoteFlags: Partial<FeatureFlagState> = {}): void => {
  const nextFlags: FeatureFlagState = { ...FEATURE_FLAGS };

  for (const key of FEATURE_FLAG_KEYS) {
    const remoteValue = remoteFlags[key];
    if (typeof remoteValue === 'boolean') {
      nextFlags[key] = remoteValue;
    }

    const overrideValue = devOverrides[key];
    if (typeof overrideValue === 'boolean') {
      nextFlags[key] = overrideValue;
    }
  }

  currentFlags = nextFlags;
  emit();
};

const loadDevOverrides = async (): Promise<void> => {
  if (!isDevRuntime) {
    devOverrides = {};
    return;
  }

  try {
    const raw = await AsyncStorage.getItem(FEATURE_FLAG_OVERRIDES_KEY);
    if (!raw) {
      devOverrides = {};
      return;
    }

    devOverrides = parseBooleanRecord(JSON.parse(raw));
  } catch {
    devOverrides = {};
  }
};

const saveDevOverrides = async (): Promise<void> => {
  if (!isDevRuntime) return;

  try {
    await AsyncStorage.setItem(FEATURE_FLAG_OVERRIDES_KEY, JSON.stringify(devOverrides));
  } catch {
    // Best effort persistence only.
  }
};

const readRemoteFlags = (remoteConfig: RemoteConfigInstance): Partial<FeatureFlagState> => {
  const flags: Partial<FeatureFlagState> = {};
  for (const key of FEATURE_FLAG_KEYS) {
    flags[key] = remoteConfig.getValue(key).asBoolean();
  }
  return flags;
};

export const initializeFeatureFlags = async (): Promise<void> => {
  if (initialized) return;
  initialized = true;

  await loadDevOverrides();
  resolveFlags();
  await refreshFeatureFlags({ force: true });
};

export const refreshFeatureFlags = async (
  options: { force?: boolean } = {}
): Promise<void> => {
  const now = Date.now();
  if (!options.force && now - lastRefreshAt < MIN_REFRESH_INTERVAL_MS) {
    return;
  }

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    lastRefreshAt = now;

    const remoteConfig = getRemoteConfig();
    if (!remoteConfig) {
      resolveFlags();
      return;
    }

    try {
      await remoteConfig.setDefaults({
        ...FEATURE_FLAGS,
        _incident_mode: false,
      });

      // Phase 1: short-cache probe for incident mode freshness.
      await remoteConfig.setConfigSettings({
        minimumFetchIntervalMillis: PROBE_CACHE_MS,
      });
      await remoteConfig.fetchAndActivate();

      const isIncidentMode = remoteConfig.getValue('_incident_mode').asBoolean();
      if (isIncidentMode) {
        // Phase 2: force-refresh all flags immediately.
        await remoteConfig.setConfigSettings({
          minimumFetchIntervalMillis: 0,
        });
        await remoteConfig.fetchAndActivate();
      } else {
        // Return to normal long cache for background stability.
        await remoteConfig.setConfigSettings({
          minimumFetchIntervalMillis: NORMAL_CACHE_MS,
        });
      }

      resolveFlags(readRemoteFlags(remoteConfig));
    } catch {
      resolveFlags();
    }
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
};

export const isFeatureEnabled = (flag: FeatureFlag): boolean => currentFlags[flag];

export const getFeatureFlagsSnapshot = (): FeatureFlagState => cloneFlags();

export const getFeatureFlagKeys = (): FeatureFlag[] => [...FEATURE_FLAG_KEYS];

export const subscribeFeatureFlags = (
  listener: (flags: FeatureFlagState) => void
): (() => void) => {
  listeners.add(listener);
  listener(cloneFlags());
  return () => listeners.delete(listener);
};

export const setDevFeatureFlagOverride = async (
  flag: FeatureFlag,
  enabled: boolean
): Promise<void> => {
  if (!isDevRuntime) return;

  devOverrides = {
    ...devOverrides,
    [flag]: enabled,
  };
  await saveDevOverrides();
  resolveFlags();
};

export const clearDevFeatureFlagOverrides = async (): Promise<void> => {
  if (!isDevRuntime) return;

  devOverrides = {};
  try {
    await AsyncStorage.removeItem(FEATURE_FLAG_OVERRIDES_KEY);
  } catch {
    // Best effort persistence only.
  }
  resolveFlags();
};
