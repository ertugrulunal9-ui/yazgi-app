import { DEFAULT_LOCALE as LEGACY_DEFAULT_LOCALE, strings as legacyStrings } from './legacy';
import type { AppLocale } from './legacy';
import { coreStrings } from './domains/core';
import { uiStrings } from './domains/ui';
import { endingsStrings } from './domains/endings';
import { onboardingDomainStrings } from './domains/onboarding';
import { actionsStrings } from './domains/actions';
import { achievementDataStrings } from './domains/achievementData';
import { eventsDomainStrings } from './domains/events';
import { traitsStrings } from './domains/traits';
import { examsStrings } from './domains/exams';
import { socialStrings } from './domains/social';
import { characterStrings } from './domains/character';
import { narrativeStrings } from './domains/narrative';
import type { DomainStrings, NestedRecord, Primitive, PrimitiveArray } from './domains/types';

export type { AppLocale };

const DOMAIN_BUNDLES: DomainStrings[] = [
  coreStrings,
  uiStrings,
  endingsStrings,
  onboardingDomainStrings,
  actionsStrings,
  achievementDataStrings,
  eventsDomainStrings,
  traitsStrings,
  examsStrings,
  socialStrings,
  characterStrings,
  narrativeStrings,
];

const isRecord = (value: unknown): value is NestedRecord => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const cloneRecord = (record: NestedRecord): NestedRecord => {
  const cloned: NestedRecord = {};

  Object.entries(record).forEach(([key, value]) => {
    if (isRecord(value)) {
      cloned[key] = cloneRecord(value);
      return;
    }

    cloned[key] = value;
  });

  return cloned;
};

const mergeInto = (target: NestedRecord, source: NestedRecord): NestedRecord => {
  Object.entries(source).forEach(([key, incomingValue]) => {
    const existingValue = target[key];

    if (isRecord(existingValue) && isRecord(incomingValue)) {
      mergeInto(existingValue, incomingValue);
      return;
    }

    if (isRecord(incomingValue)) {
      target[key] = cloneRecord(incomingValue);
      return;
    }

    target[key] = incomingValue;
  });

  return target;
};

const composeStrings = (): Record<AppLocale, NestedRecord> => {
  const composed: Record<AppLocale, NestedRecord> = {
    tr: cloneRecord(legacyStrings.tr),
    en: cloneRecord(legacyStrings.en),
  };

  DOMAIN_BUNDLES.forEach(bundle => {
    mergeInto(composed.tr, bundle.tr);
    mergeInto(composed.en, bundle.en);
  });

  return composed;
};

export const DEFAULT_LOCALE: AppLocale = LEGACY_DEFAULT_LOCALE;

export const strings: Record<AppLocale, NestedRecord> = composeStrings();

const getByPath = (record: NestedRecord, path: string): Primitive | PrimitiveArray | NestedRecord | undefined => {
  const parts = path.split('.');
  let current: Primitive | PrimitiveArray | NestedRecord | undefined = record;

  for (const part of parts) {
    if (!current || typeof current !== 'object' || Array.isArray(current) || !(part in current)) {
      return undefined;
    }
    current = (current as NestedRecord)[part];
  }

  return current;
};

const interpolate = (value: string, params?: Record<string, Primitive>): string => {
  if (!params) return value;

  return value.replace(/\{(\w+)\}/g, (_, token: string) => {
    const raw = params[token];
    return raw === undefined ? `{${token}}` : String(raw);
  });
};

const isDevelopmentRuntime = (() => {
  const runtimeGlobal = globalThis as { __DEV__?: boolean };
  if (typeof runtimeGlobal.__DEV__ === 'boolean') {
    return runtimeGlobal.__DEV__;
  }
  return process.env.NODE_ENV !== 'production';
})();

const missingKeyWarnings = new Set<string>();

const warnMissingKey = (locale: AppLocale, key: string): void => {
  if (!isDevelopmentRuntime) return;

  const warningKey = `${locale}:${key}`;
  if (missingKeyWarnings.has(warningKey)) return;

  missingKeyWarnings.add(warningKey);
  console.warn(`[i18n] Missing key "${key}" for locale "${locale}" (fallback chain exhausted).`);
};

export const t = (
  locale: AppLocale,
  key: string,
  params?: Record<string, Primitive>,
  fallback?: string
): string => {
  const localizedValue = getByPath(strings[locale], key);
  if (typeof localizedValue === 'string') {
    return interpolate(localizedValue, params);
  }

  const fallbackValue = getByPath(strings[DEFAULT_LOCALE], key);
  if (typeof fallbackValue === 'string') {
    return interpolate(fallbackValue, params);
  }

  if (fallback) return interpolate(fallback, params);

  warnMissingKey(locale, key);
  return key;
};

let runtimeLocale: AppLocale = DEFAULT_LOCALE;

const runtimeLocaleListeners = new Set<() => void>();

const notifyRuntimeLocaleListeners = (): void => {
  runtimeLocaleListeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.error('[i18n] runtime locale listener failed:', error);
    }
  });
};

export const subscribeRuntimeLocale = (listener: () => void): (() => void) => {
  runtimeLocaleListeners.add(listener);
  return () => {
    runtimeLocaleListeners.delete(listener);
  };
};

export const setRuntimeLocale = (locale: AppLocale): void => {
  if (runtimeLocale === locale) return;
  runtimeLocale = locale;
  notifyRuntimeLocaleListeners();
};

export const getRuntimeLocale = (): AppLocale => runtimeLocale;

export const tRuntime = (
  key: string,
  params?: Record<string, Primitive>,
  fallback?: string
): string => t(runtimeLocale, key, params, fallback);

export const getRuntimeValue = (
  key: string
): Primitive | PrimitiveArray | NestedRecord | undefined => {
  const localizedValue = getByPath(strings[runtimeLocale], key);
  if (localizedValue !== undefined) return localizedValue;
  return getByPath(strings[DEFAULT_LOCALE], key);
};

export const getRuntimeStringArray = (key: string): string[] => {
  const value = getRuntimeValue(key);
  if (!Array.isArray(value)) return [];
  if (!value.every(entry => typeof entry === 'string')) return [];
  return value as string[];
};
