// =================================================================
// TRADE-OFF HİNTLERİ
// Seçim kartlarında, karar öncesi bedeli gösterir.
// Statik (event data'dan gelen tradeoffHint) veya dinamik (effect analizi).
// =================================================================

import { Choice, Stats } from '../types';
import { getRuntimeLocale } from '../i18n/strings';

type StatKey = keyof Stats;

// Stat çifti → narratif template
// Anahtar format: "pozitif_stat:negatif_stat"
const TRADEOFF_TEMPLATES_TR: Record<string, string[]> = {
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

const TRADEOFF_TEMPLATES_EN: Record<string, string[]> = {
  'discipline:charisma': [
    'You gain discipline but your social life takes a hit.',
    'Following rules can leave you feeling isolated.',
  ],
  'discipline:health': [
    'You work hard but your body pays the price.',
    'Success comes at the cost of your health.',
  ],
  'discipline:familyRelation': [
    'You stay disciplined but family bonds grow strained.',
  ],
  'charisma:discipline': [
    'You become popular but focusing gets harder.',
    'Your social life grows but structure fades.',
  ],
  'charisma:intelligence': [
    'You connect with people but learning time shrinks.',
  ],
  'charisma:health': [
    'You thrive socially but may not care for yourself enough.',
  ],
  'intelligence:health': [
    'You feed your mind but neglect your body.',
    'You learn but sacrifice health to do it.',
  ],
  'intelligence:energy': [
    'You grow mentally stronger but drain your energy.',
  ],
  'intelligence:familyRelation': [
    'You learn a great deal but family bonds may weaken.',
  ],
  'health:discipline': [
    'Your body strengthens but focus pays the price.',
  ],
  'health:intelligence': [
    'You grow physically but mental development may slow.',
  ],
  'money:familyRelation': [
    'You earn money but family bonds suffer.',
    'You gain wealth but connections loosen.',
  ],
  'money:health': [
    'You earn but put your health at risk.',
  ],
  'money:discipline': [
    'You earn money but your routine breaks.',
  ],
  'familyRelation:discipline': [
    'You stay close to family but drift from your own goals.',
  ],
  'familyRelation:charisma': [
    'Family bonds strengthen but your social circle may shrink.',
  ],
};

// Pick locale-appropriate template
const getTemplate = (pos: StatKey, neg: StatKey): string | null => {
  const key = `${pos}:${neg}`;
  const isEn = getRuntimeLocale() === 'en';
  const templates = (isEn ? TRADEOFF_TEMPLATES_EN[key] : TRADEOFF_TEMPLATES_TR[key])
    ?? TRADEOFF_TEMPLATES_TR[key];
  if (!templates || templates.length === 0) return null;
  return templates[Math.floor(Math.random() * templates.length)];
};

// Kişilik ekseni eklemeleri
const PERSONALITY_TRADEOFF_PREFIX_TR: Partial<Record<string, string>> = {
  'empathy:positive': 'Empatik bir seçim ama bedeli var: ',
  'courage:positive': 'Cesur bir adım ama riski var: ',
  'conformity:negative': 'Kurallara başkaldırmak serbest hissettirir ama bedeli var: ',
};

const PERSONALITY_TRADEOFF_PREFIX_EN: Partial<Record<string, string>> = {
  'empathy:positive': 'An empathetic choice, but it has a cost: ',
  'courage:positive': 'A bold step, but risk comes with it: ',
  'conformity:negative': 'Breaking the rules feels freeing, but there is a price: ',
};

const getPersonalityPrefix = (axisKey: string): string | undefined => {
  const isEn = getRuntimeLocale() === 'en';
  return (isEn ? PERSONALITY_TRADEOFF_PREFIX_EN : PERSONALITY_TRADEOFF_PREFIX_TR)[axisKey];
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

  // Sadece küçük etkiler için hint gösterme (threshold: 3)
  if (Math.abs(bigPos[1]) < 3 && Math.abs(bigNeg[1]) < 3) return null;

  // Kişilik efekti varsa önce ona bak
  const personalityEffects = choice.personalityEffects || [];
  for (const pe of personalityEffects) {
    const axisKey = `${pe.axis}:${pe.change > 0 ? 'positive' : 'negative'}`;
    const prefix = getPersonalityPrefix(axisKey);
    if (prefix) {
      const template = getTemplate(bigPos[0], bigNeg[0]);
      if (template) return prefix + template.toLowerCase();
    }
  }

  return getTemplate(bigPos[0], bigNeg[0]);
};
