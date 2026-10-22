/* eslint-disable */
/**
 * "Baskın seçenek" (dominant choice) raporu üreticisi.
 *
 * Kullanım (repo kökünden):
 *   node scripts/content/dominant-choices-report.cjs
 *   node scripts/content/dominant-choices-report.cjs --json <yol>   (ham veriyi JSON olarak da yazar)
 *
 * Yalnızca okur: src/ ve __tests__/ altına dokunmaz. Çıktı: reports/dominant-choices-<tarih>.md
 *
 * Tanımlar (yalnızca 2+ statik seçeneği olan olaylar):
 *   - Vektör = health, intelligence, charisma, discipline, money, familyRelation (energy HARİÇ)
 *              + 7. boyut olarak -stressEffect (yüksek stres kötüdür).
 *   - DOMINATED: bir A seçeneği, diğer her B seçeneğine karşı 7 boyutun hepsinde >= ve
 *     tüm vektör farkları içinde en az bir boyutta kesin > ise (A hiçbir yerde kaybetmez).
 *     Ayrıca "tam baskın" (strict) alt kümesi de sayılır: A, diğer HER B'ye karşı en az bir
 *     boyutta kesin > ise (eşit vektörlü kardeş seçenek yok).
 *   - COSTLESS: hiçbir seçeneğin 7 boyutta negatif değeri yok.
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

// Konsol gürültüsünü (varsa) bastır; rapor dosyaya yazılır.
const { EVENTS } = require(path.join(REPO, 'src/data/events.ts'));

// ---------------------------------------------------------------------------
// Sabitler
// ---------------------------------------------------------------------------
const STAT_KEYS = ['health', 'intelligence', 'charisma', 'discipline', 'money', 'familyRelation'];
const DIM_KEYS = [...STAT_KEYS, 'stress']; // stress = -stressEffect
const DIM_KEYS_ENERGY = [...DIM_KEYS, 'energy']; // 'tüm stat' kontrolü (energy dahil)
const SHORT = {
  health: 'hea',
  intelligence: 'int',
  charisma: 'cha',
  discipline: 'dis',
  money: 'mon',
  familyRelation: 'fam',
  stress: 'str', // raporda yazara görünen stressEffect değeri gösterilir (negatif = rahatlama)
};
const RARITY_ORDER = { COMMON: 0, UNCOMMON: 1, RARE: 2 };
const TOP_N = 40;

// ---------------------------------------------------------------------------
// Öneriler (ilk 40 satır için). delta: baskın seçeneğe eklenecek bedel (efekt alan adlarıyla).
// Script, her önerinin baskınlığı gerçekten kırdığını otomatik doğrular.
// ---------------------------------------------------------------------------
const SUGGESTIONS = {
  tr_ilk_dogum_gunu: { delta: { health: -2 }, why: 'Herkese pasta dağıtırken sen de fazla yedin, karnın ağrıdı; paylaşmanın küçük bir bedeli olur.' },
  mem_satisfaction_sharing: { delta: { stressEffect: 2 }, why: 'Oyuncağı elinden bırakmak ilk anda içini burkar; paylaşma kolay bir iyilik olmaz.' },
  mem_fear_overcome: { delta: { energy: -8 }, why: 'Korkuyla yüzleşmek seni yorar; cesaretin enerji harcatması hikâyeye uyar.' },
  mem_guilt_apology: { delta: { energy: -5 }, why: 'Özür dilemek için cesaret toplamak yorucudur.' },
  pers_uyku_saati: { delta: { charisma: -2 }, why: 'Erken yatınca arkadaşlarla oyun/sohbet saatini kaçırırsın; uslu olmanın sosyal bedeli.' },
  mem_regret_second_chance: { delta: { energy: -6 }, why: 'Eski hatayı düzeltmek emek ister; doğru olanı yapmak ücretsiz değildir.' },
  dilemma_oyuncak_calma: { delta: { energy: -5 }, why: 'Cazibeye direnmek iradeni yorar; dürüst seçimin yükü hissedilir.' },
  milestone_friendship_lost: { delta: { charisma: -2 }, why: 'Umursamaz görünmek sosyal çevrede seni soğuk biri gibi gösterir ("içinde bir şey eksik" metniyle uyumlu).' },
  tr_sinav_gunu: { delta: { energy: -6 }, why: 'Sakin kalıp sınavın boyunca odaklanmak zihinsel enerji harcar.' },
  pers_yeni_sinif: { delta: { discipline: -3 }, why: 'Gün boyu herkesle sohbet etmek ders odağını dağıtır.' },
  mem_friendship_guilt_repair: { delta: { stressEffect: 5 }, why: 'Barışmak için yanına gitme anı gergindir; sonuç güzel ama ilk adım rahat değil.' },
  mem_school_pride_challenge: { delta: { stressEffect: 3 }, why: 'Parmak kaldırınca bütün sınıfın sana bakması heyecan ve gerginlik yaratır.' },
  econ_poor_scholarship_offer: { delta: { health: -2 }, why: 'Özenli dosya için geceleri evrak hazırlarken uykusuz kalırsın; ödül büyük, bedeli sağlıkta.' },
  cliff_family_news_reveal: { delta: { stressEffect: 4 }, why: 'Abi/abla olma sorumluluğu ("büyük sorumluluk") sevinçle birlikte kaygı da getirir.' },
  npcq_friend_secret_share: { delta: { stressEffect: 4 }, why: 'Söz verdiğin sırrı taşımak seni geren bir yük olur.' },
  npcq_friend_family_visit: { delta: { stressEffect: 3 }, why: 'Arkadaşının ailesiyle ilk sohbet heyecanlı ve gergin bir sınavdır.' },
  mem_group_project_guilt: { delta: { stressEffect: 5 }, why: 'Grubun yükünü üstlenmek seni sorumluluk baskısı altında bırakır.' },
  npcq_friend_shared_crisis: { delta: { stressEffect: 4 }, why: 'Gizlice kanıt toplamak sinir bozucudur; yakalanma korkusu gerilim yaratır.' },
  cliff_npc_secret_reveal: { delta: { stressEffect: 4 }, why: 'Gülümseyerek vedalaşıp kendi üzüntünü bastırmak içeride gerilim bırakır.' },
  npcq_rival_aftermath: { delta: { stressEffect: 3 }, why: 'Rakibe elini uzatmak gurur yutmayı gerektirir.' },
  pers_balanced_new_student: { delta: { stressEffect: 3 }, why: 'Yabancıyla ilk konuşma kısa ama gergin bir andır.' },
  cliff_npc_secret_promise: { delta: { stressEffect: 3 }, why: 'Merakla bekleyip "yarın" cevabını kabullenmek ("merak içinde kaldın") gerginlik bırakır.' },
  cliff_family_announcement: { delta: { stressEffect: 2 }, why: 'Cevapsız kalan "iyi haber mi?" sorusu merak ve huzursuzluk yaratır.' },
  npcq_rival_group_sides: { delta: { stressEffect: 3 }, why: 'Tarafsız kalmak iki grubun da tepkisini göğüslemeyi gerektirir.' },
  milestone_enemy_made: { delta: { charisma: -2 }, why: 'Meydan okuyan tavır seni çatışmacı biri diye etiketletir.' },
  npcq_rival_showdown: { delta: { discipline: -2 }, why: 'Fair play seçince kazanma hırsındaki keskinlik biraz körelir (all-in seçeneğin karşılığı).' },
  tr_sir_saklama: { delta: { energy: -6 }, why: 'Diğer arkadaşın soruları karşısında sözünü tutmak sürekli direnç ve çaba ister.' },
  npc_checkin_friend_study_02: { delta: { stressEffect: 2 }, why: 'Ortak çalışma takvimi ve beklentisi küçük bir zaman baskısı getirir.' },
  early_toy_keep_boundaries_echo: { delta: { health: -2 }, why: 'Sakin kalmaya çalışırken içine atılan gerginlik karın ağrısı gibi bedene yansır (energy -3 bedeli zaten var).' },
  mem_teacher_conflict_regret: { delta: { stressEffect: 3 }, why: 'Öğretmenle arayı düzeltmeye yaklaşmak ilk anda gergin bir adımdır.' },
  pers_balanced_mediator: { delta: { stressEffect: 4 }, why: 'İki kavgalı arkadaşın arasında kalmak insanı geren bir iştir.' },
  pers_korkunc_film: { delta: { discipline: -3 }, why: 'Film maratonu uyku ve ders düzenini bozar; eğlencenin bedeli düzen kaybı.' },
  npc_checkin_friend_problem_03: { delta: { familyRelation: -2 }, why: 'Uzun dinleme yüzünden eve geç kalırsın, ailen sitem eder.' },
  social_group_best_friend_plan: { delta: { stressEffect: 3 }, why: 'Ders grubunu kurmak plan ve sorumluluk yükü getirir (ertelemenin energy +2 avantajı zaten var).' },
  tr_bayram_sabahi: { delta: { health: -3 }, why: 'Bütün gün şeker, baklava ve ikram yemek midene dokunur (energy -20 bedeli zaten var).' },
  npc_group_exclusion: { delta: { money: -10 }, why: 'Yeni gruba girmek için kantinde ısmarlayıp çevreye uymaya çalışırsın.' },
  npc_secret_revealed: { delta: { charisma: -4 }, why: 'Umursamaz tavır ("arkadaşlığı bitirdi") sınıfta güvenilmez biri olarak anılmana yol açar.' },
  npcq_rival_enemy: { delta: { stressEffect: 3 }, why: 'Öfkeyi bırakmak gururu yutmayı gerektirir, kolay bir karar değildir.' },
  butterfly_friend_farewell_silent_echo: { delta: { stressEffect: 5 }, why: 'Yıllar sonra ilk adımı atmak cesaret ister; mesajı gönderene kadar içini yer (energy -5 zaten var).' },
  pers_balanced_family_talk: { delta: { stressEffect: 3 }, why: 'Açıkça fikrini söylemek, aileyle gerginlik riskini göze almaktır.' },
};

// ---------------------------------------------------------------------------
// Yardımcılar
// ---------------------------------------------------------------------------
const num = v => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

function vectorOf(choice) {
  const eff = choice.effect || {};
  const v = {};
  STAT_KEYS.forEach(k => {
    v[k] = num(eff[k]);
  });
  v.stress = -num(choice.stressEffect);
  v.energy = num(eff.energy);
  return v;
}

function energyOf(choice) {
  return num((choice.effect || {}).energy);
}

/** a, b'yi zayıf biçimde yener mi? (hepsinde >=) ve kesin üstünlük var mı? */
function compare(a, b, dims = DIM_KEYS) {
  let ge = true;
  let gt = false;
  for (const k of dims) {
    if (a[k] < b[k]) ge = false;
    if (a[k] > b[k]) gt = true;
  }
  return { ge, gt };
}

function fmtVec(v, { showZero = false } = {}) {
  const parts = [];
  for (const k of DIM_KEYS) {
    // stress için yazar değeri (stressEffect) göster: v.stress = -stressEffect
    const val = k === 'stress' ? -v[k] : v[k];
    if (val === 0 && !showZero) continue;
    const s = val > 0 ? `+${val}` : `${val}`;
    parts.push(`${SHORT[k]}${s}`);
  }
  return parts.length ? parts.join(' ') : '(boş)';
}

function fmtEnergy(c) {
  const e = energyOf(c);
  return e === 0 ? '' : ` [ene${e > 0 ? '+' : ''}${e}]`;
}

function oneLine(s, max = 70) {
  const t = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

function mdEscape(s) {
  return String(s).replace(/\|/g, '\\|');
}

function pct(n, d) {
  return d === 0 ? '0%' : `${((n / d) * 100).toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Kaynak dosya atfı
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(REPO, 'src/data');
const dataFiles = fs
  .readdirSync(DATA_DIR)
  .filter(f => f.endsWith('.ts'))
  .map(f => ({ name: f, text: fs.readFileSync(path.join(DATA_DIR, f), 'utf8') }));

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function attributeSource(id) {
  const q = `['"\`]${escapeRe(id)}['"\`]`;
  const defRe = new RegExp(`(?:\\bid\\s*:\\s*${q}|EventBuilder\\(\\s*${q})`);
  const defHits = dataFiles.filter(f => defRe.test(f.text)).map(f => f.name);
  if (defHits.length > 0) return defHits[0];
  const anyRe = new RegExp(q);
  const anyHits = dataFiles
    .filter(f => !['events.ts', 'eventRegistry.ts', 'eventBranchingEnhancer.ts'].includes(f.name))
    .filter(f => anyRe.test(f.text))
    .map(f => f.name);
  if (anyHits.length > 0) return `${anyHits[0]}`;
  return '(bilinmiyor)';
}

// ---------------------------------------------------------------------------
// Analiz
// ---------------------------------------------------------------------------
let functionChoiceCount = 0;
let eventsWithFunctionChoices = 0;
let eventsConsidered = 0;
let eventsSkippedFewStatic = 0;
const results = [];

for (const ev of EVENTS) {
  const choices = Array.isArray(ev.choices) ? ev.choices : [];
  const staticChoices = [];
  let fnCount = 0;
  choices.forEach((c, idx) => {
    if (typeof c === 'function') {
      fnCount += 1;
    } else if (c && typeof c === 'object') {
      staticChoices.push({ c, idx });
    }
  });
  functionChoiceCount += fnCount;
  if (fnCount > 0) eventsWithFunctionChoices += 1;
  if (staticChoices.length < 2) {
    eventsSkippedFewStatic += 1;
    continue;
  }
  eventsConsidered += 1;

  const items = staticChoices.map(({ c, idx }) => ({
    idx,
    id: c.id || `#${idx}`,
    text: c.text,
    vec: vectorOf(c),
    energy: energyOf(c),
    choice: c,
  }));

  // Baskın seçenek(ler)
  const dominants = [];
  for (const a of items) {
    let allGe = true;
    let anyGt = false;
    let strictAll = true;
    const dominated = [];
    const tied = [];
    for (const b of items) {
      if (a === b) continue;
      const { ge, gt } = compare(a.vec, b.vec);
      if (!ge) {
        allGe = false;
        break;
      }
      if (gt) {
        anyGt = true;
        dominated.push(b);
      } else {
        strictAll = false;
        tied.push(b);
      }
    }
    if (allGe && anyGt) {
      dominants.push({ a, dominated, tied, strictAll });
    }
  }

  const isDominated = dominants.length > 0;
  const isCostless = items.every(it => DIM_KEYS.every(k => it.vec[k] >= 0));

  const txt = typeof ev.text === 'string' ? ev.text : '(dinamik metin)';
  results.push({
    id: ev.id,
    text: txt,
    minAge: ev.minAge,
    maxAge: ev.maxAge,
    rarity: ev.rarity || 'COMMON',
    rarityExplicit: !!ev.rarity,
    file: attributeSource(ev.id),
    choiceCount: choices.length,
    staticCount: items.length,
    fnCount,
    items,
    dominants,
    isDominated,
    isCostless,
  });
}

// "Birincil" baskın seçenek (birden fazlaysa marjı en büyük olan)
function margin(d) {
  let total = 0;
  for (const b of d.dominated) {
    for (const k of DIM_KEYS) total += d.a.vec[k] - b.vec[k];
  }
  return total;
}
results.forEach(r => {
  if (!r.isDominated) return;
  r.dominants.sort((x, y) => margin(y) - margin(x));
  r.primary = r.dominants[0];
  r.margin = margin(r.primary);
  // Enerji: baskın seçenek enerjide de diğer her seçenekten kötü değil mi?
  r.energyTradeoff = r.items.some(b => b !== r.primary.a && b.energy > r.primary.a.energy);
  r.gated = !!(
    r.primary.a.choice.reqStats ||
    r.primary.a.choice.reqFamily ||
    r.primary.a.choice.reqSkills ||
    r.primary.a.choice.reqNPCRole ||
    r.primary.a.choice.reqEventIds ||
    r.primary.a.choice.reqPersonality
  );
  r.hasConditional = r.items.some(it => (it.choice.conditionalOutcomes || []).length > 0);
});

const dominated = results.filter(r => r.isDominated);
const costless = results.filter(r => r.isCostless);
const both = results.filter(r => r.isDominated && r.isCostless);
const strictDominated = dominated.filter(r => r.dominants.some(d => d.strictAll));
const energyTradeoffCount = dominated.filter(r => r.energyTradeoff).length;

// ---------------------------------------------------------------------------
// Öncelik sırası
// ---------------------------------------------------------------------------
const prioritized = [...dominated].sort((a, b) => {
  if (a.minAge !== b.minAge) return a.minAge - b.minAge;
  const ra = RARITY_ORDER[a.rarity] ?? 0;
  const rb = RARITY_ORDER[b.rarity] ?? 0;
  if (ra !== rb) return ra - rb;
  if (b.margin !== a.margin) return b.margin - a.margin;
  return a.id.localeCompare(b.id);
});
const top = prioritized.slice(0, TOP_N);
const topIds = new Set(top.map(r => r.id));

// ---------------------------------------------------------------------------
// Öneri doğrulama
// ---------------------------------------------------------------------------
function applyDelta(item, delta) {
  const v = { ...item.vec };
  for (const [k, d] of Object.entries(delta || {})) {
    if (k === 'stressEffect') v.stress -= d;
    else if (k === 'energy') v.energy += d;
    else if (STAT_KEYS.includes(k)) v[k] += d;
  }
  return v;
}

/** Öneri uygulanınca hiçbir seçenek diğerlerine karşı baskın kalmamalı. dims: kontrol edilen boyutlar. */
function suggestionBreaksDominance(r, sug, dims) {
  const items = r.items.map(it =>
    it === r.primary.a ? { ...it, vec: applyDelta(it, sug.delta) } : it
  );
  for (const a of items) {
    let allGe = true;
    let anyGt = false;
    for (const b of items) {
      if (a === b) continue;
      const { ge, gt } = compare(a.vec, b.vec, dims);
      if (!ge) {
        allGe = false;
        break;
      }
      if (gt) anyGt = true;
    }
    if (allGe && anyGt) return false;
  }
  return true;
}

function fmtDelta(delta) {
  return Object.entries(delta || {})
    .map(([k, v]) => `\`${k} ${v > 0 ? '+' : ''}${v}\``)
    .join(' + ');
}

let suggestionsVerified = 0; // 8 boyutta (energy dahil) baskınlığı kıran
let suggestions7D = 0; // 7 boyutlu bayrağı da kaldıran
const suggestionProblems = [];
const suggestionMode = {}; // eventId -> '7B' | 'energy'
top.forEach(r => {
  const sug = SUGGESTIONS[r.id];
  if (!sug) {
    suggestionProblems.push(`${r.id}: öneri tanımlı değil`);
    return;
  }
  const ok7 = suggestionBreaksDominance(r, sug, DIM_KEYS);
  const ok8 = suggestionBreaksDominance(r, sug, DIM_KEYS_ENERGY);
  if (ok7) {
    suggestions7D += 1;
    suggestionsVerified += 1;
    suggestionMode[r.id] = '7B';
  } else if (ok8) {
    suggestionsVerified += 1;
    suggestionMode[r.id] = 'energy';
  } else {
    suggestionProblems.push(`${r.id}: öneri baskınlığı kırmıyor (${JSON.stringify(sug.delta)})`);
  }
});

// ---------------------------------------------------------------------------
// Dosya kırılımı
// ---------------------------------------------------------------------------
const byFile = {};
function bump(file, key) {
  byFile[file] = byFile[file] || { total: 0, dominated: 0, costless: 0, both: 0 };
  byFile[file][key] += 1;
}
results.forEach(r => {
  bump(r.file, 'total');
  if (r.isDominated) bump(r.file, 'dominated');
  if (r.isCostless) bump(r.file, 'costless');
  if (r.isDominated && r.isCostless) bump(r.file, 'both');
});
const fileRows = Object.entries(byFile).sort(
  (a, b) => b[1].dominated - a[1].dominated || b[1].total - a[1].total || a[0].localeCompare(b[0])
);

// ---------------------------------------------------------------------------
// Rapor
// ---------------------------------------------------------------------------
const today = new Date().toISOString().slice(0, 10);
const reportPath = path.join(REPO, 'reports', 'dominant-choices-2026-10-20.md');

const L = [];
L.push('# Baskın seçenek raporu (2026-10-20)');
L.push('');
L.push(
  'Bu rapor yalnızca analizdir; `src/` ve `__tests__/` altında hiçbir dosya değiştirilmedi. ' +
    'Üreten betik: `scripts/content/dominant-choices-report.cjs` (bedel önerileri betiğin içindeki `SUGGESTIONS` tablosundadır). ' +
    'Yeniden üretmek için repo kökünden `node scripts/content/dominant-choices-report.cjs` çalıştırın.'
);
L.push('');
L.push('## Oyuncuya etkisi');
L.push('');
L.push(
  'Baskın seçenekli bir olayda oyuncunun gerçek bir kararı yoktur: bir seçenek hiçbir istatistikte kaybetmeden diğerlerinden iyidir, ' +
    'oyuncu "doğru" olanı hemen bulur ve olay kartı bir karar anı olmaktan çıkıp ödül/ceza dağıtımına dönüşür. ' +
    'Bedelsiz (costless) olaylarda ise hiçbir seçenek bir şey kaybettirmez; seçimler arasındaki fark yalnızca ne kadar kazandığındır. ' +
    'Aşama 1 oynanış hedefi (seçimlerin anlamlı bir bedeli olması) için bu liste içerik turunun girdisidir.'
);
L.push('');

L.push('## Tanımlar');
L.push('');
L.push(
  '- Vektör: `health`, `intelligence`, `charisma`, `discipline`, `money`, `familyRelation` (energy hariç) + 7. boyut `-stressEffect` ' +
    '(stres yükselmesi kötü sayılır).'
);
L.push(
  '- DOMINATED: bir A seçeneği, diğer her B seçeneğine karşı 7 boyutun hepsinde B\'den küçük değil ve en az bir boyutta kesin büyük ise. ' +
    '"Tam baskın (strict)": A, diğer HER seçeneğe karşı en az bir boyutta kesin büyük (eşit vektörlü kardeş seçenek yok).'
);
L.push('- COSTLESS: hiçbir seçeneğin 7 boyutta negatif değeri yok.');
L.push(
  '- Fonksiyon seçenekler `(ctx) => Choice` analiz dışı bırakıldı ve sayıldı. Bir olayda 2\'den az statik seçenek kalıyorsa olay hiç değerlendirilmedi.'
);
L.push(
  '- Tablolardaki kısaltmalar: `hea` health, `int` intelligence, `cha` charisma, `dis` discipline, `mon` money, `fam` familyRelation, ' +
    '`str` yazarın girdiği `stressEffect` değeri (pozitif = stres artar = kötü, negatif = rahatlama). `[ene-5]` energy değeridir; vektöre girmez, bilgi içindir.'
);
L.push(
  '- Bir olay birden çok baskın seçenek içerirse (eşit vektörlü ikizler) marjı en büyük olan "baskın" olarak gösterilir. ' +
    'Yaş sütunu `minAge-maxAge`; rarity belirtilmemişse oyun `COMMON` sayar.'
);
L.push('');

L.push('## 1. Özet');
L.push('');
L.push('| Ölçü | Sayı | Oran |');
L.push('|---|---:|---:|');
L.push(`| Havuzdaki toplam olay (\`EVENTS\`) | ${EVENTS.length} | |`);
L.push(`| Değerlendirilen olay (2+ statik seçenek) | ${eventsConsidered} | 100% |`);
L.push(`| Değerlendirilmeyen (2'den az statik seçenek) | ${eventsSkippedFewStatic} | |`);
L.push(`| DOMINATED (baskın seçenek var) | ${dominated.length} | ${pct(dominated.length, eventsConsidered)} |`);
L.push(`| - bunun "tam baskın (strict)" alt kümesi | ${strictDominated.length} | ${pct(strictDominated.length, eventsConsidered)} |`);
L.push(`| - bunun 8 boyutta (energy dahil) da baskın olanı | ${dominated.length - energyTradeoffCount} | ${pct(dominated.length - energyTradeoffCount, eventsConsidered)} |`);
L.push(`| - bunun baskın seçeneğinin energy'de bedeli olanı (7 boyutta baskın, energy'de ödünleşim var) | ${energyTradeoffCount} | ${pct(energyTradeoffCount, eventsConsidered)} |`);
L.push(`| COSTLESS (hiçbir seçenekte negatif yok) | ${costless.length} | ${pct(costless.length, eventsConsidered)} |`);
L.push(`| Hem DOMINATED hem COSTLESS | ${both.length} | ${pct(both.length, eventsConsidered)} |`);
L.push(`| Atlanan fonksiyon seçenek (toplam) | ${functionChoiceCount} | |`);
L.push(`| - fonksiyon seçeneği olan olay | ${eventsWithFunctionChoices} | |`);
L.push('');
L.push(
  `Not: energy ödünleşimi olan ${energyTradeoffCount} olay betiğin 7 boyutlu tanımına göre "baskın" sayılır ama oyuncu için gerçek bir bedel (energy) vardır; ` +
    "içerik turunda önceliği daha düşüktür (ama sıralama istendiği gibi yalnızca yaş ve rarity'ye göre yapıldı). Bedel önerilerinin çoğu betiğin saydığı 7 boyuttaki alanlara yazıldı; yalnızca `energy` ile çözülenler bölüm 3'te `[energy]` ile işaretli."
);
L.push('');

const fnEvents = EVENTS.filter(e => (e.choices || []).some(c => typeof c === 'function'));
L.push(
  `Fonksiyon seçeneği olan olaylar (${fnEvents.length}): ` +
    fnEvents
      .map(e => {
        const fn = e.choices.filter(c => typeof c === 'function').length;
        const st = e.choices.length - fn;
        return `\`${e.id}\` (${st} statik + ${fn} fonksiyon${st < 2 ? ', değerlendirilmedi' : ''})`;
      })
      .join(', ') +
    '.'
);
L.push('');

L.push('### Kaynak dosyaya göre kırılım');
L.push('');
L.push('Atıf, olay kimliğinin `src/data/*.ts` içinde `id: \'...\'` veya `EventBuilder(\'...\')` olarak geçtiği ilk dosyaya göre yapıldı.');
L.push('');
L.push('| Dosya | Olay | Dominated | % | Costless | % | İkisi birden |');
L.push('|---|---:|---:|---:|---:|---:|---:|');
fileRows.forEach(([file, s]) => {
  L.push(
    `| ${file} | ${s.total} | ${s.dominated} | ${pct(s.dominated, s.total)} | ${s.costless} | ${pct(s.costless, s.total)} | ${s.both} |`
  );
});
L.push('');

// Gözlemler (betik hesaplar)
const allZero = it => DIM_KEYS.every(k => it.vec[k] === 0);
const emptyLoser = dominated.filter(r => r.primary.dominated.some(allZero)).length;
const freeLunch = dominated.filter(r => DIM_KEYS.every(k => r.primary.a.vec[k] >= 0)).length;
const bands = [
  ['0-5 yaş', 0, 5],
  ['6-10 yaş', 6, 10],
  ['11-14 yaş', 11, 14],
  ['15-18 yaş', 15, 18],
];
L.push('### Gözlemler');
L.push('');
L.push(
  `- Baskın olayların ${emptyLoser} tanesinde (${pct(emptyLoser, dominated.length)}) kaybeden seçenek tamamen boştur (7 boyutta hep 0: "görmezden gel", "sessiz kal", "ertele" tipi pasif seçenek). ` +
    'Bu kalıpta oyuncu hiçbir şey kaybetmeden ödül alan seçeneği seçer; pasif seçeneğe küçük bir fayda vermek de çözüm olabilir, ama bu rapor yalnızca baskın seçeneğe bedel önerir.'
);
L.push(
  `- Baskın olayların ${freeLunch} tanesinde (${pct(freeLunch, dominated.length)}) baskın seçeneğin hiçbir negatif değeri yoktur (7 boyutta hiçbir şey kaybettirmez); bedel eklenecek seçenek çoğunlukla "doğru/iyi" seçenektir.`
);
L.push(
  `- Yaş kuşağına göre baskın olay sayısı (\`minAge\`): ${bands
    .map(([label, lo, hi]) => {
      const n = dominated.filter(r => r.minAge >= lo && r.minAge <= hi).length;
      const t = results.filter(r => r.minAge >= lo && r.minAge <= hi).length;
      return `${label} ${n}/${t}`;
    })
    .join(', ')}.`
);
L.push(
  '- Yoğunlaşma: `lateTeenEvents.ts`, `npcQuestlineEvents.ts`, `memoryGatedEvents.ts` ve `cliffhangerEvents.ts` baskın oranı en yüksek dosyalardır; ' +
    '`earlyConsequenceEvents.ts` ise en çok bedelsiz (costless) olay içeren dosyadır. İçerik turunu dosya bazında yapmak bedel dilini tutarlı tutmaya yardım edebilir.'
);
L.push('');

// 2 + 3: ilk 40 tablo
L.push(`## 2. Öncelikli ${top.length} baskın olay`);
L.push('');
L.push(
  'Sıralama: önce düşük `minAge` (erken oyun etkisi), sonra `COMMON` < `UNCOMMON` < `RARE`, sonra baskınlık marjı (büyükten küçüğe), sonra kimlik. ' +
    '"Baskın" sütunu kazanan seçeneği, "Baskın olunan" sütunu ona karşı kesin kaybeden seçenekleri gösterir. ' +
    'Eşit vektörlü ikiz seçenek varsa "(eşit: ...)" ile belirtilir. `F` işareti: olayda atlanan fonksiyon seçenek var (analiz eksik olabilir). ' +
    '`G` işareti: baskın seçenek bir koşula (`reqStats`, `reqFamily`, `reqNPCRole` vb.) bağlı, yani her oyuncu görmeyebilir. ' +
    '`C` işareti: seçeneklerde `conditionalOutcomes` var (olasılıklı ek sonuçlar vektöre dahil değil). ' +
    '`K` işareti: olay aynı zamanda COSTLESS (bölüm 4b listesinde bu yüzden tekrar edilmez).'
);
L.push('');
L.push('| # | Olay | Dosya | Yaş | Rarity | Baskın seçenek | Baskın olunan seçenek(ler) | Vektörler |');
L.push('|---:|---|---|---|---|---|---|---|');
top.forEach((r, i) => {
  const d = r.primary;
  const flags = `${r.fnCount ? ' F' : ''}${r.gated ? ' G' : ''}${r.hasConditional ? ' C' : ''}${r.isCostless ? ' K' : ''}`;
  const domText = `\`${d.a.id}\`: ${mdEscape(oneLine(d.a.text))}`;
  const dominatedText = d.dominated
    .map(b => `\`${b.id}\`: ${mdEscape(oneLine(b.text, 55))}`)
    .join('<br>');
  const tiedText = d.tied.length ? `<br>(eşit: ${d.tied.map(b => `\`${b.id}\``).join(', ')})` : '';
  const vecText = [
    `**${d.a.id}** ${fmtVec(d.a.vec)}${fmtEnergy(d.a.choice)}`,
    ...d.dominated.map(b => `${b.id} ${fmtVec(b.vec)}${fmtEnergy(b.choice)}`),
    ...d.tied.map(b => `${b.id} ${fmtVec(b.vec)}${fmtEnergy(b.choice)} (eşit)`),
  ].join('<br>');
  L.push(
    `| ${i + 1} | \`${r.id}\`${flags ? `<br>${flags.trim()}` : ''} | ${r.file} | ${r.minAge}-${r.maxAge} | ${r.rarity}${r.rarityExplicit ? '' : '*'} | ${domText} | ${dominatedText}${tiedText} | ${vecText} |`
  );
});
L.push('');
L.push('`*` rarity alanı veride yok; oyun varsayılanı `COMMON` uygulanır.');
L.push('');

L.push('## 3. Bedel önerileri (ilk ' + top.length + ' olay)');
L.push('');
L.push(
  'Her öneri, baskın seçeneğe eklenecek küçük bir bedeldir ve hikâye mantığını korumaya çalışır; hiçbir seçenek silinmez. ' +
    'Betik her öneriyi baskın seçeneğin vektörüne uygulayıp olayda artık hiçbir seçeneğin diğerlerine baskın olmadığını doğrular. ' +
    `Sonuç: ${suggestionsVerified}/${top.length} öneri baskınlığı kırıyor; bunların ${suggestions7D} tanesi 7 boyutlu bayrağı da kaldırıyor (\`[7B]\`), ` +
    `${suggestionsVerified - suggestions7D} tanesi yalnızca \`energy\` bedeli (\`[energy]\`): oyuncu için gerçek bir bedel, ama bu betiğin 7 boyutlu tanımı energy'yi saymadığı için olay yeniden çalıştırmada yine "dominated" görünür (energy dahil 8 boyutta baskınlık kırılmış olur).`
);
L.push('');
L.push(
  'Değerler yazarın girdiği ham sayıdır (`stressEffect +4` = stres 4 artar, kötü). Başlangıç istatistikleri düşüktür ' +
    '(health 25, charisma 5, intelligence/discipline/money 0) ve değerler 0\'da kırpılır; bu yüzden küçük çocuk olaylarında `money`, `intelligence`, `discipline` bedelleri pratikte etkisiz kalır. ' +
    'Erken yaş olaylarında bu yüzden `stressEffect`, `health`, `familyRelation` ve `energy` tercih edildi.'
);
L.push('');
top.forEach((r, i) => {
  const sug = SUGGESTIONS[r.id];
  const d = r.primary;
  if (!sug) {
    L.push(`${i + 1}. \`${r.id}\` / \`${d.a.id}\`: (öneri tanımlı değil)`);
    return;
  }
  const mode = suggestionMode[r.id] === '7B' ? '[7B]' : suggestionMode[r.id] === 'energy' ? '[energy]' : '[doğrulanamadı]';
  L.push(`${i + 1}. \`${r.id}\` / \`${d.a.id}\`: ${fmtDelta(sug.delta)} ${mode} - ${sug.why}`);
});
L.push('');
if (suggestionProblems.length) {
  L.push('Doğrulama uyarıları:');
  suggestionProblems.forEach(p => L.push(`- ${p}`));
  L.push('');
}

// 4: tam liste
function groupedIds(list) {
  const groups = {};
  list.forEach(r => {
    groups[r.file] = groups[r.file] || [];
    groups[r.file].push(r.id);
  });
  return Object.entries(groups).sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]));
}

const restDominated = dominated.filter(r => !topIds.has(r.id));
const restCostless = costless.filter(r => !topIds.has(r.id));

L.push('## 4. Tam liste (ilk ' + top.length + ' dışında kalanlar)');
L.push('');
L.push(`### 4a. Diğer DOMINATED olaylar (${restDominated.length})`);
L.push('');
groupedIds(restDominated).forEach(([file, ids]) => {
  L.push(`**${file}** (${ids.length}): ${ids.map(i => `\`${i}\``).join(', ')}`);
  L.push('');
});
L.push(`### 4b. COSTLESS olaylar (${restCostless.length}; ilk ${top.length} dışındakiler, DOMINATED olanlar dahil)`);
L.push('');
groupedIds(restCostless).forEach(([file, ids]) => {
  L.push(`**${file}** (${ids.length}): ${ids.map(i => `\`${i}\``).join(', ')}`);
  L.push('');
});

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, `${L.join('\n').replace(/\n{3,}/g, '\n\n')}\n`, 'utf8');

// Ham veri (isteğe bağlı)
const jsonIdx = process.argv.indexOf('--json');
if (jsonIdx !== -1 && process.argv[jsonIdx + 1]) {
  const out = prioritized.map((r, i) => ({
    rank: i + 1,
    id: r.id,
    file: r.file,
    minAge: r.minAge,
    maxAge: r.maxAge,
    rarity: r.rarity,
    text: r.text,
    energyTradeoff: r.energyTradeoff,
    items: r.items.map(it => ({
      id: it.id,
      text: it.text,
      vec: fmtVec(it.vec),
      energy: it.energy,
      raw: { effect: it.choice.effect, stressEffect: it.choice.stressEffect, feedback: it.choice.feedback },
    })),
    dominant: r.primary.a.id,
    dominated: r.primary.dominated.map(b => b.id),
    tied: r.primary.tied.map(b => b.id),
  }));
  fs.writeFileSync(process.argv[jsonIdx + 1], JSON.stringify(out, null, 2), 'utf8');
}

// Konsol özeti
console.log(`Olay (EVENTS): ${EVENTS.length}`);
console.log(`Degerlendirilen (2+ statik secenek): ${eventsConsidered}`);
console.log(`DOMINATED: ${dominated.length} (${pct(dominated.length, eventsConsidered)}), strict: ${strictDominated.length}`);
console.log(`COSTLESS: ${costless.length} (${pct(costless.length, eventsConsidered)})`);
console.log(`Ikisi birden: ${both.length}`);
console.log(`Fonksiyon secenek atlandi: ${functionChoiceCount} (${eventsWithFunctionChoices} olayda)`);
console.log(`Oneri dogrulama: ${suggestionsVerified}/${top.length} (7B bayragini kaldiran: ${suggestions7D})`);
if (suggestionProblems.length) suggestionProblems.forEach(p => console.log(`UYARI: ${p}`));
console.log(`Rapor: ${path.relative(REPO, reportPath)}`);
