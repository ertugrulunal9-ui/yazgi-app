/**
 * Event Mix Guardrails
 *
 * Goal-event eklenince mevcut event havuzunun seyrelmesini onler.
 * Oran limitleri + duplicate cooldown + cesitlilik olcumu saglar.
 * Tum degerler gameBalance.ts EVENT_MIX_GUARDRAILS section'dan alinir.
 */

import { EVENT_MIX_GUARDRAILS } from '../config/gameBalance';
import type { GameEvent, LifeGoal } from '../types';

export type EventMixCategory = 'goal' | 'relationship' | 'general';

/**
 * Bir eventi mix kategorisine siniflandirir.
 * - goal: goal-specific veya goal-chain eventi
 * - relationship: NPC, iliski, sosyal eventi
 * - general: diger hersey
 */
export const classifyEventMixCategory = (
  event: GameEvent,
  selectedGoal?: LifeGoal | null,
): EventMixCategory => {
  const tags = event.tags ?? [];
  const id = event.id.toLowerCase();

  // Goal event tespiti
  if (tags.includes('goal_specific') || tags.includes('goal_chain')) return 'goal';
  if (id.startsWith('goal_')) return 'goal';
  if (event.reqGoal && event.reqGoal === selectedGoal) return 'goal';

  // Relationship event tespiti
  if (tags.includes('npc') || tags.includes('relationship') || tags.includes('social')) return 'relationship';
  if (event.reqNPCRole) return 'relationship';
  if (id.startsWith('npc_') || id.includes('relationship') || id.includes('milestone')) return 'relationship';
  if (event.personalityCategory === 'SOCIAL') return 'relationship';

  return 'general';
};

export interface EventMixDistribution {
  goal: number;
  relationship: number;
  general: number;
  total: number;
}

/**
 * Son N event'in kategori dagilimini hesaplar.
 */
export const calculateEventMixDistribution = (
  recentEvents: GameEvent[],
  selectedGoal?: LifeGoal | null,
): EventMixDistribution => {
  const dist: EventMixDistribution = { goal: 0, relationship: 0, general: 0, total: 0 };

  for (const event of recentEvents) {
    const category = classifyEventMixCategory(event, selectedGoal);
    dist[category]++;
    dist.total++;
  }

  return dist;
};

/**
 * Mevcut dagilima gore bir kategorinin secilip secilemeyecegini kontrol eder.
 * Guardrail'i ihlal edecekse false doner.
 */
export const isEventCategoryAllowed = (
  candidateCategory: EventMixCategory,
  distribution: EventMixDistribution,
): boolean => {
  const { minGeneralEventShare, maxGoalEventShare, minRelationshipEventShare } = EVENT_MIX_GUARDRAILS;

  // Yeterli veri yoksa (ilk birkac tur) her kategori serbest
  if (distribution.total < 5) return true;

  const total = distribution.total + 1; // +1 cunku yeni event eklenecek

  if (candidateCategory === 'goal') {
    const newGoalShare = (distribution.goal + 1) / total;
    if (newGoalShare > maxGoalEventShare) return false;
  }

  // Goal secilecekse, general ve relationship minimum oranlarini kontrol et
  if (candidateCategory === 'goal') {
    const generalShare = distribution.general / total;
    const relationshipShare = distribution.relationship / total;
    if (generalShare < minGeneralEventShare && distribution.general < distribution.total * minGeneralEventShare) {
      return false;
    }
    if (relationshipShare < minRelationshipEventShare && distribution.relationship < distribution.total * minRelationshipEventShare) {
      return false;
    }
  }

  return true;
};

/**
 * Duplicate event cooldown kontrolu.
 * Ayni event son N tur icinde gosterildiyse false doner.
 */
export const isEventDuplicateCooldownClear = (
  eventId: string,
  recentEventIds: string[],
): boolean => {
  const cooldownWindow = EVENT_MIX_GUARDRAILS.duplicateEventCooldownTurns;
  const recentWindow = recentEventIds.slice(-cooldownWindow);
  return !recentWindow.includes(eventId);
};

/**
 * Event listesini guardrail'lere gore filtreler.
 * Ana event selection pipeline'inda kullanilir.
 */
export const applyEventMixGuardrails = (
  candidates: GameEvent[],
  recentEvents: GameEvent[],
  recentEventIds: string[],
  selectedGoal?: LifeGoal | null,
): GameEvent[] => {
  const distribution = calculateEventMixDistribution(recentEvents, selectedGoal);

  return candidates.filter(event => {
    // Duplicate cooldown
    if (!isEventDuplicateCooldownClear(event.id, recentEventIds)) return false;

    // Mix category guardrail
    const category = classifyEventMixCategory(event, selectedGoal);
    if (!isEventCategoryAllowed(category, distribution)) return false;

    return true;
  });
};

/**
 * Cesitlilik metrigi: son N event'in Shannon entropy'si.
 * Deger ne kadar yuksekse o kadar cesitli.
 * Max = log2(3) ≈ 1.585 (uc kategori esit dagilim)
 */
export const calculateEventMixEntropy = (distribution: EventMixDistribution): number => {
  if (distribution.total === 0) return 0;

  const shares = [
    distribution.goal / distribution.total,
    distribution.relationship / distribution.total,
    distribution.general / distribution.total,
  ];

  return -shares.reduce((sum, p) => {
    if (p <= 0) return sum;
    return sum + p * Math.log2(p);
  }, 0);
};
