import { Appearance } from 'react-native';
import {
  DEFAULT_UI_PREFS,
  SPLASH_DELAY_POOL,
  getDensityMetrics,
  getSystemTheme,
  getThemeTokens,
  getWeightedSplashDelay,
} from '../../src/utils/themeUtils';

describe('themeUtils', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exposes expected default UI preferences', () => {
    expect(DEFAULT_UI_PREFS).toEqual({
      theme: 'dark',
      density: 'standard',
      reduceMotion: false,
      analyticsEnabled: false,
      personalizedAdsEnabled: false,
    });
  });

  it('returns a weighted splash delay from the pool', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    expect(getWeightedSplashDelay()).toBe(SPLASH_DELAY_POOL[0]);

    randomSpy.mockReturnValue(0.9999);
    expect(getWeightedSplashDelay()).toBe(SPLASH_DELAY_POOL[SPLASH_DELAY_POOL.length - 1]);
  });

  it('maps system color scheme to dark', () => {
    (Appearance.getColorScheme as jest.Mock).mockReturnValue('dark');
    expect(getSystemTheme()).toBe('dark');
  });

  it('maps non-dark scheme to light', () => {
    (Appearance.getColorScheme as jest.Mock).mockReturnValue('light');
    expect(getSystemTheme()).toBe('light');

    (Appearance.getColorScheme as jest.Mock).mockReturnValue(null);
    expect(getSystemTheme()).toBe('light');
  });

  it('returns light theme token palette', () => {
    const light = getThemeTokens('light');
    expect(light.appBg).toBe('#f5f7fb');
    expect(light.textPrimary).toBe('#0f172a');
    expect(light.statHighColor).toBe('#16a34a');
    expect(light.statLowColor).toBe('#dc2626');
  });

  it('returns dark theme token palette', () => {
    const dark = getThemeTokens('dark');
    expect(dark.appBg).toBe('#0b1220');
    expect(dark.textPrimary).toBe('#e2e8f0');
    expect(dark.statHighColor).toBe('#22c55e');
    expect(dark.statLowColor).toBe('#ef4444');
  });

  it('returns compact density metrics', () => {
    expect(getDensityMetrics('compact')).toEqual({ font: 13, pad: 8, icon: 18 });
  });

  it('returns comfort density metrics', () => {
    expect(getDensityMetrics('comfort')).toEqual({ font: 17, pad: 20, icon: 26 });
  });

  it('returns standard density metrics', () => {
    expect(getDensityMetrics('standard')).toEqual({ font: 15, pad: 14, icon: 22 });
  });
});
