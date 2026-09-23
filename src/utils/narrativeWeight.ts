// =================================================================
// NARRATIVE WEIGHT — Memory & Scar impact on ending score
// =================================================================
// Memory'ler ve scar'lar, oyuncunun duygusal yolculuğunu yansıtır.
// Bu ağırlıklar finalScore'u ±6 puan arasında etkiler, böylece
// 83 turluk anlatı kararları ending hesaplamasında görünür hale gelir.

import type { EventMemory } from '../types/events';
import type { ScarEffect } from '../types/scars';

const MEMORY_SCORE: Record<string, number> = {
  LOW: 0,
  MEDIUM: 0.5,
  HIGH: 1.0,
};

const MAX_MEMORIES_COUNTED = 4;
const MAX_MEMORY_BONUS = 4;
const MIN_MEMORY_PENALTY = -4;

/**
 * Oyuncu hafızasının anlatı ağırlığını hesaplar.
 * - HIGH PRIDE/SATISFACTION → pozitif katkı
 * - HIGH REGRET/GUILT       → negatif katkı
 * Toplam etki: [-6, +6]
 */
export const calculateMemoryNarrativeWeight = (memories: EventMemory[]): number => {
  if (!memories || memories.length === 0) return 0;

  const positiveEmotions = new Set(['PRIDE', 'SATISFACTION']);
  const negativeEmotions = new Set(['REGRET', 'GUILT']);

  // HIGH → full weight, MEDIUM → half, LOW → skip
  const scored = memories
    .filter(m => m.weight !== 'LOW')
    .map(m => {
      const base = MEMORY_SCORE[m.weight] ?? 0;
      if (positiveEmotions.has(m.emotion)) return base;
      if (negativeEmotions.has(m.emotion)) return -base;
      return 0; // NEUTRAL
    })
    .filter(score => score !== 0);

  // En etkili anıları (mutlak değerce büyük) öne al
  scored.sort((a, b) => Math.abs(b) - Math.abs(a));
  const topMemories = scored.slice(0, MAX_MEMORIES_COUNTED);

  const total = topMemories.reduce((sum, s) => sum + s, 0);
  return Math.max(MIN_MEMORY_PENALTY, Math.min(MAX_MEMORY_BONUS, Math.round(total * 10) / 10));
};

/**
 * Kalıcı yara izlerinin anlatı ağırlığını hesaplar.
 * Her scar travmatik bir deneyimi temsil eder: -2 puan.
 * Toplam etki: [-6, 0]
 */
export const calculateScarNarrativeWeight = (scars?: ScarEffect[]): number => {
  if (!scars || scars.length === 0) return 0;
  const penalty = scars.length * -2;
  return Math.max(-6, penalty);
};

/**
 * Belirli bir memory listesinden oyuncuya gösterilecek önemli anları döndürür.
 * GameOverScreen'de "Seni Şekillendiren Anlar" için kullanılır.
 */
export interface NarrativeWeightBreakdown {
  positiveMemories: EventMemory[];
  negativeMemories: EventMemory[];
  memoryScore: number;
  scarScore: number;
  totalImpact: number;
}

export const buildNarrativeWeightBreakdown = (
  memories: EventMemory[],
  scars?: ScarEffect[]
): NarrativeWeightBreakdown => {
  const positiveEmotions = new Set(['PRIDE', 'SATISFACTION']);
  const negativeEmotions = new Set(['REGRET', 'GUILT']);

  const highWeightPositive = memories
    .filter(m => m.weight === 'HIGH' && positiveEmotions.has(m.emotion))
    .slice(0, 3);

  const highWeightNegative = memories
    .filter(m => m.weight === 'HIGH' && negativeEmotions.has(m.emotion))
    .slice(0, 3);

  const memoryScore = calculateMemoryNarrativeWeight(memories);
  const scarScore = calculateScarNarrativeWeight(scars);

  return {
    positiveMemories: highWeightPositive,
    negativeMemories: highWeightNegative,
    memoryScore,
    scarScore,
    totalImpact: memoryScore + scarScore,
  };
};
