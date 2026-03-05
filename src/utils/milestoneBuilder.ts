/**
 * milestoneBuilder.ts — Yaş geçişi milestone özeti oluşturucu (Paket 4)
 *
 * Her yaş geçişinde oyuncuya gösterilecek özeti hesaplar:
 * kazanılan/kaybedilen trait'ler, önemli anılar, stat değişimleri,
 * NPC rol değişiklikleri ve akademik öne çıkanlar.
 */

import type { Stats, SchoolGrades, StatKey } from '../types/core';
import type { EventMemory, MemoryEmotion } from '../types/events';
import type { NPC, NPCRole } from '../types/npc';
import type { AgeMilestoneSummary } from '../types/game';

// -------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------

export const STAT_LABELS: Record<StatKey, { tr: string; en: string }> = {
  health: { tr: 'Sağlık', en: 'Health' },
  intelligence: { tr: 'Zeka', en: 'Intelligence' },
  charisma: { tr: 'Karizma', en: 'Charisma' },
  discipline: { tr: 'Disiplin', en: 'Discipline' },
  money: { tr: 'Para', en: 'Money' },
  energy: { tr: 'Enerji', en: 'Energy' },
  familyRelation: { tr: 'Aile İlişkisi', en: 'Family' },
};

const EMOTION_LABELS: Record<MemoryEmotion, string> = {
  PRIDE: 'gurur',
  REGRET: 'pişmanlık',
  GUILT: 'suçluluk',
  SATISFACTION: 'huzur',
  NEUTRAL: 'anı',
};

const GRADE_LABELS: Record<keyof SchoolGrades, string> = {
  math: 'Matematik',
  science: 'Fen Bilgisi',
  language: 'Yabancı Dil',
  turkish: 'Türkçe',
  history: 'Tarih',
  geography: 'Coğrafya',
  art: 'Sanat',
  music: 'Müzik',
};

/** Computes stat delta, ignoring energy (too volatile) and money (economy fluctuates). */
function computeStatDeltas(prev: Stats, current: Stats): Partial<Stats> {
  const deltas: Partial<Stats> = {};
  const keys: StatKey[] = ['health', 'intelligence', 'charisma', 'discipline', 'familyRelation'];
  for (const key of keys) {
    const diff = current[key] - prev[key];
    if (diff !== 0) {
      deltas[key] = diff;
    }
  }
  return deltas;
}

/** Pick up to 3 most significant memories from a given age. */
function pickKeyMemories(
  memories: EventMemory[],
  age: number,
): AgeMilestoneSummary['keyMemories'] {
  const ageMemories = memories.filter(m => m.age === age);

  // Sort: HIGH > MEDIUM > LOW, then non-NEUTRAL emotions first
  const weightOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  const emotionOrder: Record<string, number> = {
    PRIDE: 4, REGRET: 3, GUILT: 2, SATISFACTION: 1, NEUTRAL: 0,
  };

  ageMemories.sort((a, b) => {
    const wDiff = (weightOrder[b.weight] ?? 0) - (weightOrder[a.weight] ?? 0);
    if (wDiff !== 0) return wDiff;
    return (emotionOrder[b.emotion] ?? 0) - (emotionOrder[a.emotion] ?? 0);
  });

  return ageMemories.slice(0, 3).map(m => ({
    eventId: m.eventId,
    emotion: m.emotion,
    summary: EMOTION_LABELS[m.emotion] ?? 'anı',
  }));
}

/** Detect NPC role changes between previous snapshot and current state. */
function detectNpcChanges(
  prevNpcs: Array<{ id: string; name: string; role: NPCRole }>,
  currentNpcs: NPC[],
): AgeMilestoneSummary['npcChanges'] {
  const changes: AgeMilestoneSummary['npcChanges'] = [];
  const currentMap = new Map(currentNpcs.map(n => [n.id, n]));

  for (const prev of prevNpcs) {
    const curr = currentMap.get(prev.id);
    if (!curr) {
      // NPC removed (isRemoved or gone)
      changes.push({ npcId: prev.id, name: prev.name, oldRole: prev.role, newRole: 'GONE' });
    } else if (curr.role !== prev.role) {
      changes.push({ npcId: prev.id, name: prev.name, oldRole: prev.role, newRole: curr.role });
    }
  }

  // New NPCs met this age
  const prevIds = new Set(prevNpcs.map(n => n.id));
  for (const curr of currentNpcs) {
    if (!prevIds.has(curr.id) && !curr.isRemoved) {
      changes.push({ npcId: curr.id, name: curr.name, oldRole: 'NEW', newRole: curr.role });
    }
  }

  return changes.slice(0, 5);
}

/** Find the best / worst grade change. */
function getAcademicHighlight(
  prevGrades: SchoolGrades | undefined,
  currentGrades: SchoolGrades | undefined,
): string | undefined {
  if (!prevGrades || !currentGrades) return undefined;

  let bestKey: keyof SchoolGrades | null = null;
  let bestDelta = 0;
  let worstKey: keyof SchoolGrades | null = null;
  let worstDelta = 0;

  for (const key of Object.keys(GRADE_LABELS) as (keyof SchoolGrades)[]) {
    const diff = (currentGrades[key] ?? 0) - (prevGrades[key] ?? 0);
    if (diff > bestDelta) { bestDelta = diff; bestKey = key; }
    if (diff < worstDelta) { worstDelta = diff; worstKey = key; }
  }

  const parts: string[] = [];
  if (bestKey && bestDelta >= 5) {
    parts.push(`${GRADE_LABELS[bestKey]} +${bestDelta}`);
  }
  if (worstKey && worstDelta <= -5) {
    parts.push(`${GRADE_LABELS[worstKey]} ${worstDelta}`);
  }

  return parts.length > 0 ? parts.join(' / ') : undefined;
}

// -------------------------------------------------------------------
// Main builder
// -------------------------------------------------------------------

export interface MilestoneBuilderInput {
  age: number;
  prevStats: Stats;
  currentStats: Stats;
  prevTraits: string[];
  currentTraits: string[];
  memories: EventMemory[];
  prevNpcs: Array<{ id: string; name: string; role: NPCRole }>;
  currentNpcs: NPC[];
  prevGrades?: SchoolGrades;
  currentGrades?: SchoolGrades;
}

export function buildAgeMilestone(input: MilestoneBuilderInput): AgeMilestoneSummary {
  const {
    age, prevStats, currentStats,
    prevTraits, currentTraits,
    memories, prevNpcs, currentNpcs,
    prevGrades, currentGrades,
  } = input;

  const prevSet = new Set(prevTraits);
  const currSet = new Set(currentTraits);

  return {
    age,
    traitsGained: currentTraits.filter(t => !prevSet.has(t)),
    traitsLost: prevTraits.filter(t => !currSet.has(t)),
    keyMemories: pickKeyMemories(memories, age),
    statDeltas: computeStatDeltas(prevStats, currentStats),
    npcChanges: detectNpcChanges(prevNpcs, currentNpcs),
    academicHighlight: getAcademicHighlight(prevGrades, currentGrades),
  };
}
