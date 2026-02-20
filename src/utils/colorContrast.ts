type RGB = { r: number; g: number; b: number };

const HEX_COLOR_REGEX = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const parseHexColor = (color: string): RGB | null => {
  if (!HEX_COLOR_REGEX.test(color)) return null;
  const normalized = color.startsWith('#') ? color.slice(1) : color;
  const full = normalized.length === 3
    ? normalized.split('').map(ch => `${ch}${ch}`).join('')
    : normalized;
  const numeric = parseInt(full, 16);
  return {
    r: (numeric >> 16) & 255,
    g: (numeric >> 8) & 255,
    b: numeric & 255,
  };
};

const toHexColor = ({ r, g, b }: RGB): string => {
  const segment = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
  return `#${segment(r)}${segment(g)}${segment(b)}`;
};

const srgbToLinear = (channel: number): number => {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
};

const getLuminance = (color: RGB): number =>
  0.2126 * srgbToLinear(color.r) +
  0.7152 * srgbToLinear(color.g) +
  0.0722 * srgbToLinear(color.b);

const mixColors = (from: RGB, to: RGB, ratio: number): RGB => {
  const t = clamp(ratio, 0, 1);
  return {
    r: from.r + (to.r - from.r) * t,
    g: from.g + (to.g - from.g) * t,
    b: from.b + (to.b - from.b) * t,
  };
};

export const getContrastRatio = (foreground: string, background: string): number => {
  const fg = parseHexColor(foreground);
  const bg = parseHexColor(background);
  if (!fg || !bg) return 1;

  const fgLum = getLuminance(fg);
  const bgLum = getLuminance(bg);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
};

export const meetsWcagAa = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  return ratio >= (isLargeText ? 3 : 4.5);
};

export const ensureTextContrast = (
  foreground: string,
  background: string,
  minRatio: number = 4.5
): string => {
  const start = parseHexColor(foreground);
  const bg = parseHexColor(background);
  if (!start || !bg) return foreground;

  const originalRatio = getContrastRatio(foreground, background);
  if (originalRatio >= minRatio) return foreground;

  const fgLum = getLuminance(start);
  const bgLum = getLuminance(bg);
  const primaryTarget = bgLum >= fgLum ? { r: 0, g: 0, b: 0 } : { r: 255, g: 255, b: 255 };
  const secondaryTarget = bgLum >= fgLum ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };

  const sampleDirection = (target: RGB): { color: string; ratio: number } => {
    let bestColor = foreground;
    let bestRatio = originalRatio;

    for (let step = 1; step <= 24; step += 1) {
      const ratio = step / 24;
      const mixed = mixColors(start, target, ratio);
      const candidate = toHexColor(mixed);
      const candidateRatio = getContrastRatio(candidate, background);
      if (candidateRatio > bestRatio) {
        bestRatio = candidateRatio;
        bestColor = candidate;
      }
      if (candidateRatio >= minRatio) {
        return { color: candidate, ratio: candidateRatio };
      }
    }

    return { color: bestColor, ratio: bestRatio };
  };

  const primary = sampleDirection(primaryTarget);
  if (primary.ratio >= minRatio) return primary.color;

  const secondary = sampleDirection(secondaryTarget);
  return secondary.ratio > primary.ratio ? secondary.color : primary.color;
};

