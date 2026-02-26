import { useSyncExternalStore } from 'react';
import type { AppLocale } from './strings';
import { getRuntimeLocale, subscribeRuntimeLocale } from './strings';

export const useRuntimeLocale = (): AppLocale => (
  useSyncExternalStore(
    subscribeRuntimeLocale,
    getRuntimeLocale,
    getRuntimeLocale
  )
);
