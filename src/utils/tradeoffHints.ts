// =================================================================
// TRADE-OFF HİNTLERİ
// Seçim kartlarında, karar öncesi bedeli gösterir.
// Statik (event data'dan gelen tradeoffHint) veya dinamik (effect analizi).
// =================================================================

import { Choice, Stats } from '../types';

type StatKey = keyof Stats;

// Stat çifti → narratif template
// Anahtar format: "pozitif_stat:negatif_stat"
const TRADEOFF_TEMPLATES: Record<string, string[]> = {
  'discipline:charisma': [
    'Disiplin kazanırsın ama sosyal hayatın darbe alır.',
    'Kurallara uymak seni yalnızlaştırabilir.',
  ],
  'discipline:health': [
    'Sıkı çalışırsın ama bedenin bedel öder.',
    'Başarı için sağlığından taviz veriyorsun.',
  ],
  'discipline:familyRelation': [
    'Disiplinli olursun ama aile ilişkilerin gerilir.',
  ],
  'charisma:discipline': [
    'Popüler olursun ama odaklanman zorlaşır.',
    'Sosyal hayatın gelişir ama düzen bozulur.',
  ],
  'charisma:intelligence': [
    'İnsanlarla bağ kurarsın ama öğrenmeye zaman kalmaz.',
  ],
  'charisma:health': [
    'Sosyal olursun ama kendinle yeterince ilgilenemeyebilirsin.',
  ],
  'intelligence:health': [
    'Zihni beslersin ama bedeni ihmal ediyorsun.',
    'Öğrenmek için sağlığından ödün veriyorsun.',
  ],
  'intelligence:energy': [
    'Zihinsel olarak güçlenirsin ama enerjini tüketirsin.',
  ],
  'intelligence:familyRelation': [
    'Çok öğrenirsin ama aile bağların zayıflayabilir.',
  ],
  'health:discipline': [
    'Bedenin güçlenir ama odaklanma bedelini öder.',
  ],
  'health:intelligence': [
    'Fiziksel olarak güçlenirsin ama zihinsel gelişim yavaşlayabilir.',
  ],
  'money:familyRelation': [
    'Para kazanırsın ama aile ilişkilerin zarar görür.',
    'Zenginlik kazanırsın ama bağların kopar.',
  ],
  'money:health': [
    'Kazanç sağlarsın ama sağlığını riske atıyorsun.',
  ],
  'money:discipline': [
    'Para kazanırsın ama düzenini bozuyorsun.',
  ],
  'familyRelation:discipline': [
    'Aileye yakın olursun ama kendi hedeflerinden uzaklaşırsın.',
  ],
  'familyRelation:charisma': [
    'Aile bağın güçlenir ama sosyal çevren daralabilir.',
  ],
};

// Tersine de bak
const getTemplate = (pos: StatKey, neg: StatKey): string | null => {
  const key = `${pos}:${neg}`;
  const templates = TRADEOFF_TEMPLATES[key];
  if (templates && templates.length > 0) {
    return templates[Math.floor(Math.random() * templates.length)];
  }
  return null;
};

// Kişilik ekseni eklemeleri
const PERSONALITY_TRADEOFF_PREFIX: Partial<Record<string, string>> = {
  'empathy:positive': 'Empatik bir seçim ama bedeli var: ',
  'courage:positive': 'Cesur bir adım ama riski var: ',
  'conformity:negative': 'Kurallara başkaldırmak serbest hissettirir ama bedeli var: ',
};

/**
 * Seçim için trade-off hint üretir.
 * 1. choice.tradeoffHint varsa onu döner (statik override)
 * 2. Yoksa effect'ten dinamik üretir
 * 3. Trivial (tek küçük değişim) için null döner
 */
export const generateTradeoffHint = (choice: Choice): string | null => {
  // Statik override
  if (choice.tradeoffHint) return choice.tradeoffHint;

  const effect = choice.effect || {};
  const entries = Object.entries(effect).filter(([, v]) => typeof v === 'number' && v !== 0) as [StatKey, number][];

  if (entries.length < 2) return null;

  const positives = entries.filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a);
  const negatives = entries.filter(([, v]) => v < 0).sort(([, a], [, b]) => a - b);

  if (positives.length === 0 || negatives.length === 0) return null;

  // En büyük pozitif ve en büyük negatif (mutlak değerce)
  const bigPos = positives[0];
  const bigNeg = negatives[0];

  // Sadece küçük etkiler için hint gösterme (threshold: 5)
  if (Math.abs(bigPos[1]) < 5 && Math.abs(bigNeg[1]) < 5) return null;

  // Kişilik efekti varsa önce ona bak
  const personalityEffects = choice.personalityEffects || [];
  for (const pe of personalityEffects) {
    const axisKey = `${pe.axis}:${pe.change > 0 ? 'positive' : 'negative'}`;
    const prefix = PERSONALITY_TRADEOFF_PREFIX[axisKey];
    if (prefix) {
      const template = getTemplate(bigPos[0], bigNeg[0]);
      if (template) return prefix + template.toLowerCase();
    }
  }

  return getTemplate(bigPos[0], bigNeg[0]);
};
