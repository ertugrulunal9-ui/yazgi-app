// TR ve EN arayüz metinlerinde aynı anahtarın yer tutucuları ({ad}) aynı olmalı. Kod tek bir ad
// gönderir; dillerden birinde farklı yazılırsa oyuncu ham "{yuvaId}" görür (MEmu, Y-025 H2).
import * as fs from 'fs';
import * as path from 'path';

type Tree = Record<string, unknown>;

const flatten = (node: unknown, prefix = '', out: Record<string, string> = {}): Record<string, string> => {
  if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node as Tree)) {
      const full = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string') out[full] = value;
      else flatten(value, full, out);
    }
  }
  return out;
};

const placeholders = (text: string): string =>
  [...text.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort().join(',');

const i18nRoot = path.join(__dirname, '../../src/i18n');
const sources = [
  ...fs.readdirSync(path.join(i18nRoot, 'domains'))
    .filter(file => file.endsWith('.ts') && file !== 'types.ts')
    .map(file => path.join(i18nRoot, 'domains', file)),
  path.join(i18nRoot, 'legacy.ts'),
];

let totalCompared = 0;

describe('i18n yer tutucuları TR/EN aynı', () => {
  it.each(sources.map(source => [path.relative(i18nRoot, source), source]))('%s', (_name, source) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require(source) as Record<string, unknown>;
    const mismatches: string[] = [];

    for (const exported of Object.values(mod)) {
      const tr = (exported as Tree | undefined)?.tr;
      const en = (exported as Tree | undefined)?.en;
      if (!tr || !en) continue;
      const flatTr = flatten(tr);
      const flatEn = flatten(en);
      for (const key of Object.keys(flatTr)) {
        if (!(key in flatEn)) continue;
        totalCompared += 1;
        if (placeholders(flatTr[key]) !== placeholders(flatEn[key])) {
          mismatches.push(`${key}: TR "${flatTr[key]}" / EN "${flatEn[key]}"`);
        }
      }
    }

    expect(mismatches).toEqual([]);
  });

  // Bazı alan dosyaları bilerek boş (ör. core.ts); tarayıcının gerçekten metin bulduğu toplamda denetlenir.
  it('karşılaştırılan anahtar sayısı', () => {
    expect(totalCompared).toBeGreaterThan(1000);
  });
});
