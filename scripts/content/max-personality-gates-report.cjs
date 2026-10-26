/* eslint-disable */
/**
 * Kişilik "max" şartı raporu.
 *
 * Kullanım (repo kökünden):
 *   node scripts/content/max-personality-gates-report.cjs           (yalnızca eksenini yükselten "max" şartları)
 *   node scripts/content/max-personality-gates-report.cjs --all     (düşüren ve etkisiz olanlar da)
 *   node scripts/content/max-personality-gates-report.cjs --json <yol>
 *
 * Yalnızca okur; hiçbir dosyaya yazmaz (--json verilmedikçe).
 *
 * Bir seçenekte `reqPersonality: [{ axis, max: N }]` varsa, ekseni N'yi aşan karakter o
 * seçeneği göremez. Seçeneğin kendi `personalityEffects` değeri aynı ekseni YÜKSELTİYORSA
 * ("pro"), bu bir gelişim seçeneğidir ve yüksek eksenli (karaktere uygun) oyuncudan saklanır:
 * ör. cesur çocuk "Yatağın altına bak" diyemez. "anti" = ekseni düşürür, "none" = etkisi yok.
 */
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const REPO = path.resolve(__dirname, '../..');

require.extensions['.ts'] = function registerTs(module, filename) {
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      jsx: ts.JsxEmit.React,
      esModuleInterop: true,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
    },
    fileName: filename,
  });
  module._compile(compiled.outputText, filename);
};

global.__DEV__ = false;

const { EVENTS } = require(path.join(REPO, 'src/data/events.ts'));

const args = process.argv.slice(2);
const showAll = args.includes('--all');
const jsonIdx = args.indexOf('--json');
const jsonPath = jsonIdx >= 0 ? args[jsonIdx + 1] : null;

// ---------------------------------------------------------------------------
// Kaynak konumu: olay id'sinin geçtiği dosyada, ondan sonraki ilk seçenek id'si
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(REPO, 'src/data');
const sources = fs.readdirSync(DATA_DIR)
  .filter((f) => f.endsWith('.ts'))
  .map((f) => ({ file: `src/data/${f}`, lines: fs.readFileSync(path.join(DATA_DIR, f), 'utf8').split(/\r?\n/) }));

const idLine = (lines, id, from) => {
  const re = new RegExp(`\\bid:\\s*['"\`]${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`);
  for (let i = from; i < lines.length; i++) if (re.test(lines[i])) return i;
  return -1;
};

const locate = (eventId, choiceId) => {
  for (const src of sources) {
    const ev = idLine(src.lines, eventId, 0);
    if (ev < 0) continue;
    const ch = choiceId ? idLine(src.lines, choiceId, ev + 1) : -1;
    return { file: src.file, line: (ch >= 0 ? ch : ev) + 1 };
  }
  return { file: '?', line: 0 };
};

// ---------------------------------------------------------------------------
// Tarama
// ---------------------------------------------------------------------------
const rows = [];
let dynamicChoices = 0;
for (const event of EVENTS) {
  (event.choices || []).forEach((choice, index) => {
    if (typeof choice === 'function') {
      dynamicChoices++;
      return;
    }
    for (const req of choice.reqPersonality || []) {
      if (req.max === undefined) continue;
      const change = (choice.personalityEffects || [])
        .filter((pe) => pe.axis === req.axis)
        .reduce((sum, pe) => sum + pe.change, 0);
      const kind = change > 0 ? 'pro' : change < 0 ? 'anti' : 'none';
      const loc = locate(event.id, choice.id);
      rows.push({
        kind,
        eventId: event.id,
        choiceId: choice.id || `#${index}`,
        axis: req.axis,
        min: req.min,
        max: req.max,
        change,
        choiceType: choice.choiceType || '',
        text: choice.text,
        file: loc.file,
        line: loc.line,
      });
    }
  });
}

// ---------------------------------------------------------------------------
// Çıktı
// ---------------------------------------------------------------------------
const count = (k) => rows.filter((r) => r.kind === k).length;
console.log(`"max" kişilik şartı: ${rows.length} (pro ${count('pro')}, anti ${count('anti')}, none ${count('none')})`);
if (dynamicChoices > 0) console.log(`Not: ${dynamicChoices} dinamik (fonksiyon) seçenek taranmadı.`);
console.log('');

const shown = showAll ? rows : rows.filter((r) => r.kind === 'pro');
console.log('| tür | olay | seçenek | eksen | şart | değişim | tip | metin | konum |');
console.log('|---|---|---|---|---|---|---|---|---|');
for (const r of shown) {
  const range = r.min !== undefined ? `${r.min}..${r.max}` : `≤${r.max}`;
  const sign = r.change > 0 ? `+${r.change}` : `${r.change}`;
  console.log(`| ${r.kind} | ${r.eventId} | ${r.choiceId} | ${r.axis} | ${range} | ${sign} | ${r.choiceType} | ${r.text} | ${r.file}:${r.line} |`);
}

if (jsonPath) {
  fs.writeFileSync(path.resolve(jsonPath), JSON.stringify(rows, null, 2), 'utf8');
  console.log(`\nJSON: ${jsonPath}`);
}
