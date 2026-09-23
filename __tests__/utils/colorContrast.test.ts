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

// ── WCAG AA: Tüm surface kombinasyonları ──────────────────────────────

describe('WCAG AA — multi-surface coverage', () => {
  it.each(['light', 'dark'] as const)(
    "%s: textPrimary ve textSecondary tüm surface'lerde AA karşılar",
    (mode) => {
      const theme = getThemeTokens(mode);
      const surfaces = [
        theme.appBg,
        theme.surfaceBase,
        theme.surfaceRaised,
        theme.surfaceOverlay,
      ];
      const textColors = [theme.textPrimary, theme.textSecondary];

      for (const text of textColors) {
        for (const bg of surfaces) {
          const ratio = getContrastRatio(text, bg);
          expect(ratio).toBeGreaterThanOrEqual(4.5);
        }
      }
    }
  );

  it.each(['light', 'dark'] as const)(
    '%s: accentBrand surfaceBase üzerinde AA karşılar (büyük metin = 3.0)',
    (mode) => {
      const theme = getThemeTokens(mode);
      // accentBrand (f.ex. buton label) büyük metin eşiği: 3.0
      const ratio = getContrastRatio(theme.accentBrand, theme.surfaceBase);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    }
  );

  it.each(['light', 'dark'] as const)(
    '%s: border rengi appBg ile en az görünür ayrım sağlar (1.5+)',
    (mode) => {
      const theme = getThemeTokens(mode);
      const ratio = getContrastRatio(theme.border, theme.appBg);
      // Border için WCAG belirli bir eşik tanımlamaz; görsel ayrım için 1.5 yeterli
      expect(ratio).toBeGreaterThanOrEqual(1.5);
    }
  );
});

// ── WCAG AA: Stat renkleri ────────────────────────────────────────────

// statHighColor / statLowColor theme token'larından alınır;
// bileşenler de theme.statHighColor kullanmalı.
describe('WCAG AA — stat health/danger colors', () => {
  it.each(['light', 'dark'] as const)(
    '%s: stat kritik rengi (statLowColor) surfaceBase üzerinde okunaklı',
    (mode) => {
      const theme = getThemeTokens(mode);
      const ratio = getContrastRatio(theme.statLowColor, theme.surfaceBase);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    }
  );

  it.each(['light', 'dark'] as const)(
    '%s: stat iyi rengi (statHighColor) surfaceBase üzerinde okunaklı',
    (mode) => {
      const theme = getThemeTokens(mode);
      const ratio = getContrastRatio(theme.statHighColor, theme.surfaceBase);
      expect(ratio).toBeGreaterThanOrEqual(3.0);
    }
  );
});

// ── WCAG AA: ensureTextContrast edge case'leri ────────────────────────

describe('ensureTextContrast — edge cases', () => {
  it('siyah arka plan üzerinde beyaz metin AA karşılar', () => {
    const ratio = getContrastRatio('#ffffff', '#000000');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('aynı renk çifti için kontrastı iyileştirir', () => {
    const adjusted = ensureTextContrast('#1e40af', '#1e40af', 4.5);
    const ratio = getContrastRatio(adjusted, '#1e40af');
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('geçersiz hex renk girişi için 1 döndürür', () => {
    const ratio = getContrastRatio('not-a-color', '#ffffff');
    expect(ratio).toBe(1);
  });

  it('3 haneli hex kısaltmaları doğru parse eder', () => {
    const ratio = getContrastRatio('#000', '#fff');
    expect(ratio).toBeGreaterThan(20); // siyah/beyaz ~21:1
  });
});

