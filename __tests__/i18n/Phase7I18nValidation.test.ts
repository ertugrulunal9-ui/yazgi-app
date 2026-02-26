type FlatEntry = {
  key: string;
  value: string;
};

const resolveI18nModule = (): {
  strings: Record<string, unknown>;
  t: (
    locale: 'tr' | 'en',
    key: string,
    params?: Record<string, string | number | boolean>,
    fallback?: string
  ) => string;
} => {
  const raw = require('../../src/i18n/strings');
  const mod = raw.default ?? raw;
  return {
    strings: mod.strings,
    t: mod.t,
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const flattenStringEntries = (
  value: unknown,
  prefix = ''
): FlatEntry[] => {
  if (typeof value === 'string') {
    return [{ key: prefix, value }];
  }

  if (!isRecord(value)) {
    return [];
  }

  return Object.entries(value).flatMap(([key, child]) => (
    flattenStringEntries(child, prefix ? `${prefix}.${key}` : key)
  ));
};

const setPathValue = (root: Record<string, unknown>, path: string, value: string): void => {
  const segments = path.split('.');
  let cursor: Record<string, unknown> = root;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const segment = segments[i];
    const next = cursor[segment];
    if (!isRecord(next)) {
      cursor[segment] = {};
    }
    cursor = cursor[segment] as Record<string, unknown>;
  }

  cursor[segments[segments.length - 1]] = value;
};

const deletePathValue = (root: Record<string, unknown>, path: string): void => {
  const segments = path.split('.');
  const stack: Array<{ node: Record<string, unknown>; key: string }> = [];
  let cursor: Record<string, unknown> = root;

  for (let i = 0; i < segments.length - 1; i += 1) {
    const key = segments[i];
    const next = cursor[key];
    if (!isRecord(next)) return;
    stack.push({ node: cursor, key });
    cursor = next;
  }

  delete cursor[segments[segments.length - 1]];

  for (let i = stack.length - 1; i >= 0; i -= 1) {
    const { node, key } = stack[i];
    const child = node[key];
    if (isRecord(child) && Object.keys(child).length === 0) {
      delete node[key];
    }
  }
};

describe('Phase 7 i18n validation', () => {
  it('keeps EN leaf-key coverage for all TR leaf keys', () => {
    const { strings } = resolveI18nModule();
    const trEntries = flattenStringEntries(strings.tr);
    const enEntries = flattenStringEntries(strings.en);

    const trLeafKeys = new Set(trEntries.map(entry => entry.key));
    const enLeafKeys = new Set(enEntries.map(entry => entry.key));
    const missingInEn = [...trLeafKeys].filter(key => !enLeafKeys.has(key));

    expect(missingInEn).toEqual([]);
  });

  it('falls back to TR when EN value is missing', () => {
    const { strings, t } = resolveI18nModule();
    const trRoot = strings.tr as Record<string, unknown>;
    const fallbackProbeKey = 'phase7.validationProbe.fallbackText';
    const fallbackProbeValue = 'Phase 7 fallback probe';

    setPathValue(trRoot, fallbackProbeKey, fallbackProbeValue);

    try {
      const resolved = t('en', fallbackProbeKey);
      expect(resolved).toBe(fallbackProbeValue);
    } finally {
      deletePathValue(trRoot, fallbackProbeKey);
    }
  });

  it('emits a single runtime warning when fallback chain is exhausted', () => {
    const previousDev = (global as { __DEV__?: boolean }).__DEV__;
    (global as { __DEV__?: boolean }).__DEV__ = true;
    jest.resetModules();

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    warnSpy.mockClear();

    try {
      const { t } = resolveI18nModule();
      const missingKey = 'phase7.validationProbe.missingKey';

      expect(t('en', missingKey)).toBe(missingKey);
      expect(t('en', missingKey)).toBe(missingKey);

      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(String(warnSpy.mock.calls[0][0])).toContain(missingKey);
    } finally {
      warnSpy.mockRestore();
      (global as { __DEV__?: boolean }).__DEV__ = previousDev;
      jest.resetModules();
    }
  });

  it('keeps high-risk UI EN strings under the overflow threshold', () => {
    const { strings } = resolveI18nModule();
    const enEntries = flattenStringEntries(strings.en);
    const scopedPrefixes = [
      'app.',
      'save.',
      'social.',
      'exams.',
      'game.',
      'dashboard.',
      'header.',
      'eventLog.',
      'errorBoundary.',
      'tutorial.',
      'actions.',
      'messages.',
      'dialogs.',
      'buttons.',
      'character.screen.',
      'npc.',
      'achievements.',
    ];

    const scopedEntries = enEntries.filter(entry => (
      scopedPrefixes.some(prefix => entry.key.startsWith(prefix))
    ));
    const maxLength = scopedEntries.reduce(
      (max, entry) => Math.max(max, entry.value.length),
      0
    );

    expect(maxLength).toBeLessThanOrEqual(90);
  });
});
