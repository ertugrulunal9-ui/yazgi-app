import { Appearance } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';
export type DensityMode = 'compact' | 'standard' | 'comfort';

export interface UIPrefs {
  theme: ThemeMode;
  density: DensityMode;
  reduceMotion: boolean;
}

export const DEFAULT_UI_PREFS: UIPrefs = {
  theme: 'dark',
  density: 'standard',
  reduceMotion: false,
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
      border: '#e2e8f0',
      accentEvent: '#1d4ed8',
      accentGrade: '#047857',
      accentSkill: '#7e22ce',
      accentStat: '#1e40af',
    };
  }
  return {
    appBg: '#0b1220',
    surfaceBase: '#0f172a',
    surfaceRaised: '#111b2e',
    surfaceOverlay: '#16223a',
    textPrimary: '#e2e8f0',
    textSecondary: '#94a3b8',
    border: '#1f2a44',
    accentEvent: '#60a5fa',
    accentGrade: '#34d399',
    accentSkill: '#c084fc',
    accentStat: '#93c5fd',
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
