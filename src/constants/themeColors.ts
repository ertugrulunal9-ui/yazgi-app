/**
 * Centralized color constants for settings and UI options.
 * These are used for selection indicators and option styling.
 */

/** Theme option accent colors */
export const THEME_OPTION_COLORS = {
  light: '#fbbf24',
  dark: '#8b5cf6',
} as const;

/** Density option accent colors */
export const DENSITY_OPTION_COLORS = {
  compact: '#6366f1',
  standard: '#06b6d4',
  comfort: '#ec4899',
} as const;

/** Motion option accent color */
export const MOTION_OPTION_COLOR = '#f59e0b';

/** Danger zone / destructive action color */
export const DANGER_COLOR = '#ef4444';

/** Gradient preset types */
export type GradientPreset = 'screen' | 'hero' | 'splash' | 'accent';
type GradientColors = readonly [string, string, ...string[]];

/** Gradient color presets per theme */
export const GRADIENT_PRESETS: Record<'dark' | 'light', Record<GradientPreset, GradientColors>> = {
  dark: {
    screen: ['#0b1220', '#0f1a30', '#0b1220'],
    hero: ['#0b1220', '#1a1040', '#0b1220'],
    splash: ['#0d0d2b', '#1a0a3e', '#0b1220'],
    accent: ['#3b82f6', '#8b5cf6'],
  },
  light: {
    screen: ['#f5f7fb', '#eef2f8', '#f5f7fb'],
    hero: ['#f5f7fb', '#ede4f7', '#f5f7fb'],
    splash: ['#e8e0f0', '#d4c4e8', '#f5f7fb'],
    accent: ['#1d4ed8', '#7e22ce'],
  },
};
