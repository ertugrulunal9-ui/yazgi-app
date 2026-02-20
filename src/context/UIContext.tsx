import React, { createContext, useCallback, useContext, useState } from 'react';
import { AppLocale, t as translate } from '../i18n/strings';
import { FloatingText, FloatingTextAnimation } from '../types';
import { DensityMetrics, ThemeTokens, UIPrefs } from '../utils/themeUtils';

interface UIContextValue {
  theme: ThemeTokens;
  metrics: DensityMetrics;
  uiPrefs: UIPrefs;
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: string, params?: Record<string, string | number | boolean>, fallback?: string) => string;

  // Transient UI state — not persisted, intentionally outside GameContext
  floatingTexts: FloatingText[];
  showFloatingText: (
    text: string,
    x: number,
    y: number,
    color: string,
    options?: { animationType?: FloatingTextAnimation; duration?: number }
  ) => void;
  removeFloatingText: (id: number) => void;
  clearFloatingTexts: () => void;
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
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number | boolean>, fallback?: string) =>
      translate(locale, key, params, fallback),
    [locale]
  );

  const showFloatingText = useCallback((
    text: string,
    x: number,
    y: number,
    color: string,
    options?: { animationType?: FloatingTextAnimation; duration?: number }
  ) => {
    const newText: FloatingText = {
      id: Date.now() + Math.random(),
      text,
      x,
      y,
      color,
      animationType: options?.animationType ?? 'arcadeFloat',
      duration: options?.duration ?? 2000,
    };
    setFloatingTexts(prev => [...prev, newText]);
  }, []);

  const removeFloatingText = useCallback((id: number) => {
    setFloatingTexts(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearFloatingTexts = useCallback(() => {
    setFloatingTexts([]);
  }, []);

  return (
    <UIContext.Provider
      value={{
        theme,
        metrics,
        uiPrefs,
        locale,
        setLocale,
        t,
        floatingTexts,
        showFloatingText,
        removeFloatingText,
        clearFloatingTexts,
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
