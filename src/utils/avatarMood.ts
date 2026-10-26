/**
 * Avatar yüz ifadesi: oyunun o anki durumundan tek bir ruh hâli seçer.
 * Öncelik: stres > düşük sağlık / kötü aile ilişkisi > iyi gidiş > normal.
 */
import { getStatCap } from './gameUtils';

export type AvatarMood = 'HAPPY' | 'NORMAL' | 'SAD' | 'STRESSED';

interface AvatarMoodInput {
  age: number;
  stress?: { current: number; threshold: number } | null;
  health: number;
  familyRelation: number;
}

/** Üst çubuktaki turuncu stres uyarısıyla aynı eşik. */
const STRESSED_RATIO = 0.6;
const CALM_RATIO = 0.3;

export const getAvatarMood = ({ age, stress, health, familyRelation }: AvatarMoodInput): AvatarMood => {
  const threshold = stress && stress.threshold > 0 ? stress.threshold : 70;
  const stressRatio = (stress?.current ?? 0) / threshold;
  // Sağlık üst sınırı yaşa göre değiştiği için (7 yaş altı 30) oran kullanılır.
  const healthRatio = health / Math.max(1, getStatCap(age, 'health'));

  if (stressRatio >= STRESSED_RATIO) return 'STRESSED';
  if (healthRatio < 0.35 || familyRelation < 25) return 'SAD';
  if (stressRatio < CALM_RATIO && healthRatio >= 0.7 && familyRelation >= 60) return 'HAPPY';
  return 'NORMAL';
};
