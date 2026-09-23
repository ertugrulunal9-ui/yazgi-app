/**
 * economySystem.ts — Ekonomi derinligi (Paket 8)
 *
 * Otomatik harclik, yasa gore is firsatlari, biriktirme hedefleri.
 */

import type { Family, Stats } from '../types/core';
import type { SavingGoal } from '../types/game';

// -------------------------------------------------------------------
// Otomatik Harclik
// -------------------------------------------------------------------

const ALLOWANCE_RANGES: Record<string, { min: number; max: number }> = {
  POOR:   { min: 2, max: 5 },
  MIDDLE: { min: 8, max: 15 },
  RICH:   { min: 20, max: 35 },
};

/**
 * Her tur otomatik harclik hesapla.
 * Aile zenginligi + yas + aile iliskisi etkiler.
 */
export function calculateTurnAllowance(
  family: Family,
  age: number,
  familyRelation: number,
): number {
  if (age < 5) return 0; // Bebek/okul oncesi harclik yok

  const range = ALLOWANCE_RANGES[family.wealth] ?? ALLOWANCE_RANGES.MIDDLE;
  const ageFactor = Math.min(1, (age - 4) / 14); // 5 yasindan itibaren lineer artar
  const base = range.min + (range.max - range.min) * ageFactor;

  // Aile iliskisi modifikatoru: 0-100 arasi, 50 notr
  const relationMod = familyRelation >= 50
    ? 1 + (familyRelation - 50) * 0.005 // max +25%
    : 1 - (50 - familyRelation) * 0.008; // max -40%

  return Math.max(0, Math.round(base * relationMod));
}

// -------------------------------------------------------------------
// Yasa Gore Is Firsatlari
// -------------------------------------------------------------------

export interface JobAction {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  moneyReward: number;
  energyCost: number;
  statEffects?: Partial<Stats>;
  skillUpdates?: Record<string, number>;
}

export const JOB_CATALOG: JobAction[] = [
  {
    id: 'job_lemonade',
    name: 'Limonata Sat',
    minAge: 8,
    maxAge: 12,
    moneyReward: 15,
    energyCost: 15,
    statEffects: { charisma: 1 },
    skillUpdates: { business: 1 },
  },
  {
    id: 'job_dog_walking',
    name: 'Komsu Kopegini Gezdir',
    minAge: 10,
    maxAge: 14,
    moneyReward: 20,
    energyCost: 10,
    statEffects: { health: 1 },
  },
  {
    id: 'job_market_cashier',
    name: 'Market Kasiyerligi',
    minAge: 13,
    maxAge: 18,
    moneyReward: 40,
    energyCost: 25,
    statEffects: { discipline: 2 },
    skillUpdates: { work_ethic: 2 },
  },
  {
    id: 'job_tutoring',
    name: 'Ders Ver',
    minAge: 14,
    maxAge: 18,
    moneyReward: 50,
    energyCost: 20,
    statEffects: { intelligence: 2 },
    skillUpdates: { teamwork: 1 },
  },
  {
    id: 'job_internship',
    name: 'Staj',
    minAge: 16,
    maxAge: 18,
    moneyReward: 80,
    energyCost: 30,
    statEffects: { discipline: 3, intelligence: 1 },
    skillUpdates: { work_ethic: 3 },
  },
];

/** Yasa uygun is firsatlarini dondur. */
export function getAvailableJobs(age: number): JobAction[] {
  return JOB_CATALOG.filter(j => age >= j.minAge && age <= j.maxAge);
}

// -------------------------------------------------------------------
// Biriktirme Hedefleri
// -------------------------------------------------------------------

export function getDefaultSavingGoals(): SavingGoal[] {
  return [
    {
      id: 'saving_bicycle',
      name: 'Bisiklet',
      targetAmount: 300,
      unlockAge: 7,
      reward: { statBonus: { health: 5, energy: 10 } },
      completed: false,
    },
    {
      id: 'saving_phone',
      name: 'Telefon',
      targetAmount: 800,
      unlockAge: 10,
      reward: { statBonus: { charisma: 3, intelligence: 2 } },
      completed: false,
    },
    {
      id: 'saving_computer',
      name: 'Bilgisayar',
      targetAmount: 2000,
      unlockAge: 12,
      reward: { statBonus: { intelligence: 5 } },
      completed: false,
    },
    {
      id: 'saving_guitar',
      name: 'Gitar',
      targetAmount: 500,
      unlockAge: 9,
      reward: { statBonus: { charisma: 3 } },
      completed: false,
    },
    {
      id: 'saving_camera',
      name: 'Kamera',
      targetAmount: 1200,
      unlockAge: 13,
      reward: { statBonus: { intelligence: 2, charisma: 2 } },
      completed: false,
    },
  ];
}

export interface CompletedGoalResult {
  goal: SavingGoal;
  statBonus: Partial<Stats>;
}

/**
 * Para biriktirme hedeflerini kontrol et.
 * Tamamlanan hedefleri dondurur ve goalleri gunceller.
 */
export function checkSavingGoalCompletion(
  money: number,
  age: number,
  goals: SavingGoal[],
): { updatedGoals: SavingGoal[]; completed: CompletedGoalResult[] } {
  const completed: CompletedGoalResult[] = [];
  const updatedGoals = goals.map(g => {
    if (g.completed) return g;
    if (age < g.unlockAge) return g;
    if (money >= g.targetAmount) {
      completed.push({
        goal: g,
        statBonus: g.reward.statBonus ?? {},
      });
      return { ...g, completed: true };
    }
    return g;
  });
  return { updatedGoals, completed };
}
