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
import type { AgeMilestoneSummary, ChapterSummary } from '../types/game';
import { type ChapterData } from '../config/gameBalance';
import { getRuntimeLocale, tRuntime } from '../i18n/strings';
import { getLocalizedChapterName } from './gameUtils';

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

const EMOTION_LABELS_TR: Record<MemoryEmotion, string> = {
  PRIDE: 'gurur',
  REGRET: 'pişmanlık',
  GUILT: 'suçluluk',
  SATISFACTION: 'huzur',
  NEUTRAL: 'anı',
};

const EMOTION_LABELS_EN: Record<MemoryEmotion, string> = {
  PRIDE: 'pride',
  REGRET: 'regret',
  GUILT: 'guilt',
  SATISFACTION: 'peace',
  NEUTRAL: 'memory',
};

const GRADE_LABELS_TR: Record<keyof SchoolGrades, string> = {
  math: 'Matematik',
  science: 'Fen Bilgisi',
  language: 'Yabancı Dil',
  turkish: 'Türkçe',
  history: 'Tarih',
  geography: 'Coğrafya',
  art: 'Sanat',
  music: 'Müzik',
};

const GRADE_LABELS_EN: Record<keyof SchoolGrades, string> = {
  math: 'Math',
  science: 'Science',
  language: 'Foreign Language',
  turkish: 'Turkish',
  history: 'History',
  geography: 'Geography',
  art: 'Art',
  music: 'Music',
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

  const emotionLabels = getRuntimeLocale() === 'en' ? EMOTION_LABELS_EN : EMOTION_LABELS_TR;
  return ageMemories.slice(0, 3).map(m => ({
    eventId: m.eventId,
    emotion: m.emotion,
    summary: emotionLabels[m.emotion] ?? 'memory',
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

  const gradeLabels = getRuntimeLocale() === 'en' ? GRADE_LABELS_EN : GRADE_LABELS_TR;
  for (const key of Object.keys(GRADE_LABELS_TR) as (keyof SchoolGrades)[]) {
    const diff = (currentGrades[key] ?? 0) - (prevGrades[key] ?? 0);
    if (diff > bestDelta) { bestDelta = diff; bestKey = key; }
    if (diff < worstDelta) { worstDelta = diff; worstKey = key; }
  }

  const parts: string[] = [];
  if (bestKey && bestDelta >= 5) {
    parts.push(`${gradeLabels[bestKey]} +${bestDelta}`);
  }
  if (worstKey && worstDelta <= -5) {
    parts.push(`${gradeLabels[worstKey]} ${worstDelta}`);
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

// -------------------------------------------------------------------
// Chapter Summary Builder — Faz 1A
// -------------------------------------------------------------------

/**
 * Tamamlanan bir bölümün (chapter) tüm yaş milestone'larını birleştirir
 * ve tek bir ChapterSummary döner.
 */
export function buildChapterSummary(
  chapter: ChapterData,
  milestones: AgeMilestoneSummary[],
): ChapterSummary {
  const totalStatDeltas: Partial<Stats> = {};
  const gainedSet = new Set<string>();
  const lostSet = new Set<string>();
  const allMemories: AgeMilestoneSummary['keyMemories'] = [];
  const npcChangeMap = new Map<string, AgeMilestoneSummary['npcChanges'][number]>();

  for (const m of milestones) {
    // Stat deltalarını topla
    for (const [key, val] of Object.entries(m.statDeltas) as [keyof Stats, number][]) {
      totalStatDeltas[key] = (totalStatDeltas[key] ?? 0) + val;
    }
    // Trait değişimleri — net kazanım/kayıp
    m.traitsGained.forEach(t => { gainedSet.add(t); lostSet.delete(t); });
    m.traitsLost.forEach(t => { lostSet.add(t); gainedSet.delete(t); });
    // Anılar
    allMemories.push(...m.keyMemories);
    // NPC değişimleri — sadece en son role transition'ı tut
    m.npcChanges.forEach(nc => npcChangeMap.set(nc.npcId, nc));
  }

  // En önemli 4 anıyı seç (PRIDE > GUILT > REGRET > diğerleri)
  const emotionPriority: Record<string, number> = { PRIDE: 4, GUILT: 3, REGRET: 2, SATISFACTION: 1, NEUTRAL: 0 };
  const topMemories = [...allMemories]
    .sort((a, b) => (emotionPriority[b.emotion] ?? 0) - (emotionPriority[a.emotion] ?? 0))
    .slice(0, 4);

  return {
    chapterId: chapter.id,
    chapterName: getLocalizedChapterName(chapter.id),
    chapterEmoji: chapter.emoji,
    ageRange: tRuntime('chapter.ageRange', {
      startAge: chapter.ageStart,
      endAge: chapter.ageEnd,
    }, `${chapter.ageStart}-${chapter.ageEnd} yaş`),
    totalStatDeltas,
    allTraitsGained: [...gainedSet],
    allTraitsLost: [...lostSet],
    keyMemories: topMemories,
    topNpcChanges: [...npcChangeMap.values()].slice(0, 3),
  };
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
