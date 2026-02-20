import { getThemeTokens } from '../../src/utils/themeUtils';
import { ensureTextContrast, getContrastRatio, meetsWcagAa } from '../../src/utils/colorContrast';

describe('color contrast utility', () => {
  it('ensures low-contrast text is adjusted to AA threshold', () => {
    const adjusted = ensureTextContrast('#60a5fa', '#f8fafc', 4.5);
    expect(getContrastRatio(adjusted, '#f8fafc')).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps already accessible colors unchanged', () => {
    const original = '#0f172a';
    const adjusted = ensureTextContrast(original, '#f8fafc', 4.5);
    expect(adjusted.toLowerCase()).toBe(original);
  });

  it('reports WCAG AA correctly for normal text', () => {
    expect(meetsWcagAa('#0f172a', '#f8fafc')).toBe(true);
    expect(meetsWcagAa('#60a5fa', '#f8fafc')).toBe(false);
  });
});

describe('theme token contrast audit', () => {
  it.each(['light', 'dark'] as const)('%s theme key text colors meet AA on surfaceBase', (mode) => {
    const theme = getThemeTokens(mode);
    const textPairs: Array<[string, string]> = [
      ['textPrimary', theme.textPrimary],
      ['textSecondary', theme.textSecondary],
      ['accentEvent', theme.accentEvent],
      ['accentGrade', theme.accentGrade],
      ['accentSkill', theme.accentSkill],
      ['accentStat', theme.accentStat],
    ];

    textPairs.forEach(([, color]) => {
      const ratio = getContrastRatio(color, theme.surfaceBase);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    });
  });
});

