import { Stats } from '../types';
import { clamp } from '../utils/gameUtils';

const STAT_CAP = 100;

export const calculateStudyGain = (currentIntelligence: number): number => {
  return Math.floor(8 + currentIntelligence * 0.05);
};

export const calculateStatGain = (baseGain: number, stat: number, cap: number = STAT_CAP): number => {
  return Math.max(1, Math.floor(baseGain * (1 - stat / cap)));
};

export const clampStats = (stats: Partial<Stats>): Partial<Stats> => {
  const result: Partial<Stats> = {};
  for (const [key, value] of Object.entries(stats)) {
    if (key === 'money') {
      result[key as keyof Stats] = value;
    } else {
      result[key as keyof Stats] = clamp(value as number, 0, STAT_CAP);
    }
  }
  return result;
};

export const applyStatEffect = (current: Stats, effect: Partial<Stats>): Stats => {
  const updated = { ...current, ...effect };
  return {
    health: clamp(updated.health, 0, STAT_CAP),
    intelligence: clamp(updated.intelligence, 0, STAT_CAP),
    charisma: clamp(updated.charisma, 0, STAT_CAP),
    discipline: clamp(updated.discipline, 0, STAT_CAP),
    money: Math.max(0, updated.money),
    energy: clamp(updated.energy, 0, STAT_CAP),
    familyRelation: clamp(updated.familyRelation, 0, STAT_CAP),
  };
};

export const resetDailyEnergy = (stats: Stats, maxEnergy: number): Stats => {
  return { ...stats, energy: maxEnergy };
};
