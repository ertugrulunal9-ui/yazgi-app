import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts } from 'expo-font';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import { getLoadingQuoteByAge } from '../data/loadingQuotes';
import { AppLocale, DEFAULT_LOCALE } from '../i18n/strings';
import { analyticsService } from '../services/analytics';
import { initMonetization, setPersonalizedAdsEnabled as setMonetizationPersonalizedAdsEnabled } from '../services/monetization';
import {
  DEFAULT_UI_PREFS,
  DensityMode,
  getDensityMetrics,
  getSystemTheme,
  getThemeTokens,
  getWeightedSplashDelay,
  ThemeMode,
  UIPrefs,
} from '../utils/themeUtils';

const UI_PREFS_KEY = '@yazgi_sim/ui_prefs/v1';
const ONBOARDING_KEY = '@yazgi/onboarding_completed';
const LOCALE_KEY = '@yazgi/locale/v1';

interface UseAppBootstrapResult {
  uiPrefs: UIPrefs;
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  locale: AppLocale;
  splashQuote: string;
  splashProgress: number;
  showSplash: boolean;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  setLocale: (locale: AppLocale) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setDensityMode: (densityMode: DensityMode) => void;
  toggleReduceMotion: () => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  setPersonalizedAdsEnabled: (enabled: boolean) => void;
}

export const useAppBootstrap = (): UseAppBootstrapResult => {
  const [uiPrefs, setUiPrefs] = useState<UIPrefs>(DEFAULT_UI_PREFS);
  const [uiPrefsLoaded, setUiPrefsLoaded] = useState(false);
  const [locale, setLocaleState] = useState<AppLocale>(DEFAULT_LOCALE);
  const [localeLoaded, setLocaleLoaded] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(getSystemTheme());
  const [splashReady, setSplashReady] = useState(false);
  const [splashProgress, setSplashProgress] = useState(0);
  const [fontsLoaded] = useFonts({
    ...Feather.font,
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Inter_400Regular: require('expo-google-fonts-inter/400Regular/Inter_400Regular.ttf'),
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Inter_700Bold: require('expo-google-fonts-inter/700Bold/Inter_700Bold.ttf'),
  });
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const splashQuote = useMemo(() => getLoadingQuoteByAge(0, locale), [locale]);

  useEffect(() => {
    const loadUIPrefs = async () => {
      try {
        const raw = await AsyncStorage.getItem(UI_PREFS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setUiPrefs({ ...DEFAULT_UI_PREFS, ...parsed });
        }
      } catch {
        // Ignore malformed UI prefs.
      } finally {
        setUiPrefsLoaded(true);
      }
    };

    void loadUIPrefs();
  }, []);

  useEffect(() => {
    const loadLocale = async () => {
      try {
        const raw = await AsyncStorage.getItem(LOCALE_KEY);
        if (raw === 'tr' || raw === 'en') {
          setLocaleState(raw);
        }
      } catch {
        // Ignore locale parse failures.
      } finally {
        setLocaleLoaded(true);
      }
    };

    void loadLocale();
  }, []);

  useEffect(() => {
    initMonetization().catch((error) => {
      console.warn('Monetization init failed:', error);
    });
  }, []);

  useEffect(() => {
    analyticsService.setEnabled(uiPrefs.analyticsEnabled);
  }, [uiPrefs.analyticsEnabled]);

  useEffect(() => {
    setMonetizationPersonalizedAdsEnabled(uiPrefs.personalizedAdsEnabled);
  }, [uiPrefs.personalizedAdsEnabled]);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(completed === 'true');
      } catch {
        setHasCompletedOnboarding(false);
      } finally {
        setCheckingOnboarding(false);
      }
    };

    void checkOnboarding();
  }, []);

  useEffect(() => {
    if (uiPrefs.theme === 'system') {
      setResolvedTheme(getSystemTheme());
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        setResolvedTheme(colorScheme === 'dark' ? 'dark' : 'light');
      });
      return () => subscription.remove();
    }

    setResolvedTheme(uiPrefs.theme);
    return undefined;
  }, [uiPrefs.theme]);

  useEffect(() => {
    if (!uiPrefsLoaded) return;

    const baseDelay = getWeightedSplashDelay();
    const effectiveDelay = uiPrefs.reduceMotion ? Math.round(baseDelay / 2) : baseDelay;

    setSplashProgress(0);
    const interval = setInterval(() => {
      setSplashProgress(prev => {
        const next = prev + 0.05;
        return next >= 1 ? 1 : next;
      });
    }, (uiPrefs.reduceMotion ? 1000 : effectiveDelay) / 20);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setSplashReady(true);
    }, effectiveDelay);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [uiPrefsLoaded, uiPrefs.reduceMotion]);

  useEffect(() => {
    if (!uiPrefsLoaded) return;
    void AsyncStorage.setItem(UI_PREFS_KEY, JSON.stringify(uiPrefs));
  }, [uiPrefs, uiPrefsLoaded]);

  useEffect(() => {
    if (!localeLoaded) return;
    void AsyncStorage.setItem(LOCALE_KEY, locale);
  }, [locale, localeLoaded]);

  const theme = useMemo(() => getThemeTokens(resolvedTheme), [resolvedTheme]);
  const metrics = useMemo(() => getDensityMetrics(uiPrefs.density), [uiPrefs.density]);
  const showSplash = !uiPrefsLoaded || !localeLoaded || !splashReady || !fontsLoaded || checkingOnboarding;

  const setLocale = useCallback((nextLocale: AppLocale) => {
    setLocaleState(nextLocale);
  }, []);

  const setThemeMode = useCallback((themeMode: ThemeMode) => {
    setUiPrefs(prev => ({ ...prev, theme: themeMode }));
  }, []);

  const setDensityMode = useCallback((densityMode: DensityMode) => {
    setUiPrefs(prev => ({ ...prev, density: densityMode }));
  }, []);

  const toggleReduceMotion = useCallback(() => {
    setUiPrefs(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }));
  }, []);

  const setAnalyticsEnabled = useCallback((enabled: boolean) => {
    setUiPrefs(prev => ({ ...prev, analyticsEnabled: enabled }));
  }, []);

  const setPersonalizedAdsEnabled = useCallback((enabled: boolean) => {
    setUiPrefs(prev => ({ ...prev, personalizedAdsEnabled: enabled }));
  }, []);

  return {
    uiPrefs,
    theme,
    metrics,
    locale,
    splashQuote,
    splashProgress,
    showSplash,
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
    setLocale,
    setThemeMode,
    setDensityMode,
    toggleReduceMotion,
    setAnalyticsEnabled,
    setPersonalizedAdsEnabled,
  };
};
