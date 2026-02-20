import React, { createContext, useCallback, useContext } from 'react';
import { AppLocale, t as translate } from '../i18n/strings';
import { DensityMetrics, ThemeTokens, UIPrefs } from '../utils/themeUtils';

interface UIContextValue {
  theme: ThemeTokens;
  metrics: DensityMetrics;
  uiPrefs: UIPrefs;
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: string, params?: Record<string, string | number | boolean>, fallback?: string) => string;
}

const UIContext = createContext<UIContextValue | undefined>(undefined);

interface UIProviderProps {
  theme: ThemeTokens;
  metrics: DensityMetrics;
  uiPrefs: UIPrefs;
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  children: React.ReactNode;
}

export const UIProvider: React.FC<UIProviderProps> = ({
  theme,
  metrics,
  uiPrefs,
  locale,
  setLocale,
  children,
}) => {
  const t = useCallback(
    (key: string, params?: Record<string, string | number | boolean>, fallback?: string) =>
      translate(locale, key, params, fallback),
    [locale]
  );

  return (
    <UIContext.Provider
      value={{
        theme,
        metrics,
        uiPrefs,
        locale,
        setLocale,
        t,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextValue => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within UIProvider');
  }
  return context;
};

export const useThemeTokens = (): ThemeTokens => {
  return useUI().theme;
};

export const useDensityMetrics = (): DensityMetrics => {
  return useUI().metrics;
};
