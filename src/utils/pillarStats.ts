import type { Stats } from '../types';

/**
 * Başlıktaki 4 sütun: 7 stat 4 anlamlı değere iner.
 * Gün sonu özeti de aynı ad ve değerleri gösterir (oyuncu "Beden %41" ile "Sağlık %25"i aynı şey sanıyordu).
 */
export const getPillarValues = (stats: Stats) => ({
  beden: Math.round((stats.health + stats.energy) / 2),
  zihin: Math.round((stats.intelligence + stats.discipline) / 2),
  ruh: Math.round((stats.charisma + stats.familyRelation) / 2),
  servet: stats.money,
});
