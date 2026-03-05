/**
 * goalTracking.ts — Mikro/Sezon Hedef Motoru (Paket 5)
 *
 * Otomatik atanan micro-goals (1-3 turn), sezon hedefleri (1 yas).
 */

import type { Stats, SchoolGrades } from '../types/core';
import type { MicroGoal, MicroGoalType, SeasonGoal } from '../types/game';

// -------------------------------------------------------------------
// Micro-Goal Templates
// -------------------------------------------------------------------

interface MicroGoalTemplate {
  id: string;
  descriptionKey: string;
  type: MicroGoalType;
  minAge: number;
  maxAge: number;
  condition: MicroGoal['condition'];
  target: number;
  turnsToComplete: number;
  reward: MicroGoal['reward'];
}

const MICRO_GOAL_TEMPLATES: MicroGoalTemplate[] = [
  // ACTION goals
  {
    id: 'mg_study_twice',
    descriptionKey: 'goals.micro.studyTwice',
    type: 'ACTION',
    minAge: 6,
    maxAge: 18,
    condition: { actionId: 'study', count: 2 },
    target: 2,
    turnsToComplete: 3,
    reward: { money: 10, statBonus: { intelligence: 1 } },
  },
  {
    id: 'mg_exercise',
    descriptionKey: 'goals.micro.exercise',
    type: 'ACTION',
    minAge: 5,
    maxAge: 18,
    condition: { actionId: 'exercise', count: 1 },
    target: 1,
    turnsToComplete: 2,
    reward: { statBonus: { health: 2 } },
  },
  {
    id: 'mg_read_books',
    descriptionKey: 'goals.micro.readBooks',
    type: 'ACTION',
    minAge: 6,
    maxAge: 18,
    condition: { actionId: 'read', count: 2 },
    target: 2,
    turnsToComplete: 3,
    reward: { statBonus: { intelligence: 2 } },
  },
  {
    id: 'mg_play_music',
    descriptionKey: 'goals.micro.playMusic',
    type: 'ACTION',
    minAge: 7,
    maxAge: 18,
    condition: { actionId: 'play_instrument', count: 1 },
    target: 1,
    turnsToComplete: 2,
    reward: { statBonus: { charisma: 1 } },
  },
  {
    id: 'mg_work_chores',
    descriptionKey: 'goals.micro.doChores',
    type: 'ACTION',
    minAge: 7,
    maxAge: 14,
    condition: { actionId: 'work_chores', count: 1 },
    target: 1,
    turnsToComplete: 2,
    reward: { money: 15, statBonus: { discipline: 1 } },
  },
  // STAT goals
  {
    id: 'mg_health_above_60',
    descriptionKey: 'goals.micro.healthAbove60',
    type: 'STAT',
    minAge: 5,
    maxAge: 18,
    condition: { statKey: 'health', threshold: 60 },
    target: 1,
    turnsToComplete: 3,
    reward: { statBonus: { energy: 10 } },
  },
  {
    id: 'mg_discipline_above_40',
    descriptionKey: 'goals.micro.disciplineAbove40',
    type: 'STAT',
    minAge: 8,
    maxAge: 18,
    condition: { statKey: 'discipline', threshold: 40 },
    target: 1,
    turnsToComplete: 3,
    reward: { money: 20 },
  },
  {
    id: 'mg_charisma_above_50',
    descriptionKey: 'goals.micro.charismaAbove50',
    type: 'STAT',
    minAge: 8,
    maxAge: 18,
    condition: { statKey: 'charisma', threshold: 50 },
    target: 1,
    turnsToComplete: 3,
    reward: { statBonus: { charisma: 1 } },
  },
  // SOCIAL goals
  {
    id: 'mg_social_interact',
    descriptionKey: 'goals.micro.socialInteract',
    type: 'SOCIAL',
    minAge: 5,
    maxAge: 18,
    condition: { npcInteraction: true, count: 1 },
    target: 1,
    turnsToComplete: 2,
    reward: { statBonus: { charisma: 2 } },
  },
  {
    id: 'mg_family_time',
    descriptionKey: 'goals.micro.familyTime',
    type: 'ACTION',
    minAge: 3,
    maxAge: 15,
    condition: { actionId: 'family_time', count: 1 },
    target: 1,
    turnsToComplete: 2,
    reward: { statBonus: { familyRelation: 3 } },
  },
  // ACADEMIC goals
  {
    id: 'mg_pass_exam',
    descriptionKey: 'goals.micro.passExam',
    type: 'ACADEMIC',
    minAge: 7,
    maxAge: 18,
    condition: { actionId: 'take_exam', count: 1 },
    target: 1,
    turnsToComplete: 3,
    reward: { money: 25, statBonus: { intelligence: 1 } },
  },
  {
    id: 'mg_study_three',
    descriptionKey: 'goals.micro.studyThree',
    type: 'ACTION',
    minAge: 10,
    maxAge: 18,
    condition: { actionId: 'study', count: 3 },
    target: 3,
    turnsToComplete: 5,
    reward: { money: 30, statBonus: { intelligence: 2, discipline: 1 } },
  },
];

// -------------------------------------------------------------------
// Season Goal Templates
// -------------------------------------------------------------------

interface SeasonGoalTemplate {
  id: string;
  descriptionKey: string;
  minAge: number;
  maxAge: number;
  condition: SeasonGoal['condition'];
  reward: SeasonGoal['reward'];
}

const SEASON_GOAL_TEMPLATES: SeasonGoalTemplate[] = [
  {
    id: 'sg_health_70',
    descriptionKey: 'goals.season.healthAbove70',
    minAge: 5,
    maxAge: 18,
    condition: { statKey: 'health', threshold: 70 },
    reward: { money: 50, statBonus: { health: 3 } },
  },
  {
    id: 'sg_intelligence_60',
    descriptionKey: 'goals.season.intelligenceAbove60',
    minAge: 7,
    maxAge: 18,
    condition: { statKey: 'intelligence', threshold: 60 },
    reward: { money: 50, statBonus: { intelligence: 3 } },
  },
  {
    id: 'sg_discipline_50',
    descriptionKey: 'goals.season.disciplineAbove50',
    minAge: 8,
    maxAge: 18,
    condition: { statKey: 'discipline', threshold: 50 },
    reward: { money: 50, statBonus: { discipline: 3 } },
  },
  {
    id: 'sg_charisma_55',
    descriptionKey: 'goals.season.charismaAbove55',
    minAge: 8,
    maxAge: 18,
    condition: { statKey: 'charisma', threshold: 55 },
    reward: { money: 50, statBonus: { charisma: 3 } },
  },
  {
    id: 'sg_math_grade_80',
    descriptionKey: 'goals.season.mathGrade80',
    minAge: 7,
    maxAge: 18,
    condition: { gradeKey: 'math', threshold: 80 },
    reward: { money: 75, statBonus: { intelligence: 2 } },
  },
  {
    id: 'sg_family_relation_70',
    descriptionKey: 'goals.season.familyRelation70',
    minAge: 5,
    maxAge: 18,
    condition: { statKey: 'familyRelation', threshold: 70 },
    reward: { money: 40, statBonus: { familyRelation: 5 } },
  },
];

// -------------------------------------------------------------------
// Goal Generation
// -------------------------------------------------------------------

let microGoalCounter = 0;

/**
 * Duruma gore otomatik micro-goal olustur.
 * Mevcut stat'lere gore zaten saglanan goalleri filtreler.
 */
export function generateMicroGoal(
  age: number,
  stats: Stats,
  recentGoalIds: string[],
): MicroGoal | null {
  const eligible = MICRO_GOAL_TEMPLATES.filter(t => {
    if (age < t.minAge || age > t.maxAge) return false;
    if (recentGoalIds.includes(t.id)) return false;
    // STAT goals: only assign if stat is currently below threshold
    if (t.type === 'STAT' && t.condition.statKey && t.condition.threshold) {
      const current = stats[t.condition.statKey] ?? 0;
      if (current >= t.condition.threshold) return false;
    }
    return true;
  });

  if (eligible.length === 0) return null;

  // Weighted random: prefer goals matching weaker stats
  const pick = eligible[Math.floor(Math.random() * eligible.length)];
  microGoalCounter++;

  return {
    id: `${pick.id}_${microGoalCounter}`,
    descriptionKey: pick.descriptionKey,
    type: pick.type,
    condition: { ...pick.condition },
    progress: 0,
    target: pick.target,
    turnsRemaining: pick.turnsToComplete,
    reward: { ...pick.reward },
    completed: false,
  };
}

/**
 * Micro-goal progress guncelle.
 * ACTION tipi: actionId eslesirse progress++
 * STAT tipi: stat >= threshold ise tamamla
 * SOCIAL tipi: NPC etkilesimi varsa progress++
 */
export function updateMicroGoalProgress(
  goal: MicroGoal,
  context: {
    lastActionId?: string;
    stats: Stats;
    hadNpcInteraction?: boolean;
  },
): MicroGoal {
  if (goal.completed) return goal;

  let newProgress = goal.progress;

  switch (goal.type) {
    case 'ACTION':
    case 'ACADEMIC':
      if (context.lastActionId && goal.condition.actionId === context.lastActionId) {
        newProgress = goal.progress + 1;
      }
      break;
    case 'STAT':
      if (goal.condition.statKey && goal.condition.threshold) {
        const current = context.stats[goal.condition.statKey] ?? 0;
        if (current >= goal.condition.threshold) {
          newProgress = goal.target;
        }
      }
      break;
    case 'SOCIAL':
      if (context.hadNpcInteraction) {
        newProgress = goal.progress + 1;
      }
      break;
  }

  const completed = newProgress >= goal.target;
  return {
    ...goal,
    progress: Math.min(newProgress, goal.target),
    turnsRemaining: completed ? 0 : goal.turnsRemaining - 1,
    completed,
  };
}

/**
 * Yas basinda sezon hedefi ata.
 */
export function generateSeasonGoal(
  age: number,
  stats: Stats,
  previousGoalId?: string,
): SeasonGoal | null {
  const eligible = SEASON_GOAL_TEMPLATES.filter(t => {
    if (age < t.minAge || age > t.maxAge) return false;
    if (t.id === previousGoalId) return false;
    // Only assign if not already meeting the condition
    if (t.condition.statKey) {
      const current = stats[t.condition.statKey] ?? 0;
      if (current >= t.condition.threshold) return false;
    }
    return true;
  });

  if (eligible.length === 0) return null;

  const pick = eligible[Math.floor(Math.random() * eligible.length)];

  return {
    id: pick.id,
    descriptionKey: pick.descriptionKey,
    targetAge: age,
    condition: { ...pick.condition },
    reward: { ...pick.reward },
    completed: false,
  };
}

/**
 * Sezon hedefi tamamlanma kontrolu.
 */
export function checkSeasonGoalCompletion(
  goal: SeasonGoal,
  stats: Stats,
  grades?: SchoolGrades,
): boolean {
  if (goal.completed) return true;

  if (goal.condition.statKey) {
    const current = stats[goal.condition.statKey] ?? 0;
    return current >= goal.condition.threshold;
  }

  if (goal.condition.gradeKey && grades) {
    const current = grades[goal.condition.gradeKey] ?? 0;
    return current >= goal.condition.threshold;
  }

  return false;
}

/**
 * Expired (turnsRemaining <= 0) micro-goalleri temizle.
 */
export function cleanupExpiredMicroGoals(goals: MicroGoal[]): MicroGoal[] {
  return goals.filter(g => g.completed || g.turnsRemaining > 0);
}
