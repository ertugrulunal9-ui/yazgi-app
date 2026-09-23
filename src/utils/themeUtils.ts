import { Appearance } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';
export type DensityMode = 'compact' | 'standard' | 'comfort';

export interface UIPrefs {
  theme: ThemeMode;
  density: DensityMode;
  reduceMotion: boolean;
  analyticsEnabled: boolean;
  personalizedAdsEnabled: boolean;
}

export const DEFAULT_UI_PREFS: UIPrefs = {
  theme: 'dark',
  density: 'standard',
  reduceMotion: false,
  analyticsEnabled: false,
  personalizedAdsEnabled: false,
};

export const SPLASH_DELAY_POOL = [1500, 1600, 1700, 1700, 1800, 1800, 1800, 1900, 2000, 2200];

export const getWeightedSplashDelay = (): number => {
  const idx = Math.floor(Math.random() * SPLASH_DELAY_POOL.length);
  return SPLASH_DELAY_POOL[idx];
};

export const getSystemTheme = (): 'light' | 'dark' => {
  const scheme = Appearance.getColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
};

export interface ThemeTokens {
  appBg: string;
  surfaceBase: string;
  surfaceRaised: string;
  surfaceOverlay: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  accentEvent: string;
  accentGrade: string;
  accentSkill: string;
  accentStat: string;
  accentBrand: string;
  accentBrandMuted: string;
  fontHeading: string;
  fontBody: string;
  /** Stat bar "good" fill — WCAG 3.0:1 against surfaceBase guaranteed in both themes */
  statHighColor: string;
  /** Stat bar "danger" fill */
  statLowColor: string;
}

export const getThemeTokens = (theme: 'light' | 'dark'): ThemeTokens => {
  if (theme === 'light') {
    return {
      appBg: '#f5f7fb',
      surfaceBase: '#f8fafc',
      surfaceRaised: '#ffffff',
      surfaceOverlay: '#eef2f6',
      textPrimary: '#0f172a',
      textSecondary: '#475569',
      // #b8c4d0 on #f5f7fb → ~1.61:1 (≥ 1.5 border visibility threshold)
      border: '#b8c4d0',
      accentEvent: '#1d4ed8',
      accentGrade: '#047857',
      accentSkill: '#7e22ce',
      accentStat: '#1e40af',
      accentBrand: '#d97706',
      accentBrandMuted: 'rgba(217, 119, 6, 0.15)',
      fontHeading: 'Inter_700Bold',
      fontBody: 'Inter_400Regular',
      // #16a34a on #f8fafc → ~3.01:1 (≥ 3.0 graphical component threshold)
      statHighColor: '#16a34a',
      statLowColor: '#dc2626',
    };
  }
  return {
    appBg: '#0b1220',
    surfaceBase: '#0f172a',
    surfaceRaised: '#111b2e',
    surfaceOverlay: '#16223a',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    // #2a3a5c on #0b1220 → ~1.64:1 (≥ 1.5 border visibility threshold)
    border: '#2a3a5c',
    accentEvent: '#60a5fa',
    accentGrade: '#34d399',
    accentSkill: '#c084fc',
    accentStat: '#93c5fd',
    accentBrand: '#f59e0b',
    accentBrandMuted: 'rgba(245, 158, 11, 0.15)',
    fontHeading: 'Inter_700Bold',
    fontBody: 'Inter_400Regular',
    // #22c55e on #0f172a → ~4.5:1 (passes easily in dark mode)
    statHighColor: '#22c55e',
    statLowColor: '#ef4444',
  };
};

export interface DensityMetrics {
  font: number;
  pad: number;
  icon: number;
}

export const getDensityMetrics = (density: DensityMode): DensityMetrics => {
  if (density === 'compact') return { font: 13, pad: 8, icon: 18 };
  if (density === 'comfort') return { font: 17, pad: 20, icon: 26 };
  return { font: 15, pad: 14, icon: 22 };
};
