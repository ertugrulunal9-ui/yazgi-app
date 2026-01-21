import { useCallback, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Stats, StatKey } from '../types';
import { getTraitMultiplier, clamp } from '../utils/gameUtils';

export const useStats = () => {
  const { stats, gameState, updateStats } = useGame();

  const updateStatValue = useCallback((key: StatKey, value: number) => {
    const trait = gameState.traits;
    const baseValue = value;
    const multiplied = baseValue * getTraitMultiplier(trait, key);
    updateStats({ [key]: clamp(multiplied, 0, key === 'money' ? Infinity : 100) } as Partial<Stats>);
  }, [gameState.traits, updateStats]);

  const incrementStat = useCallback((key: StatKey, amount: number) => {
    const currentValue = stats[key];
    const newValue = currentValue + amount;
    updateStatValue(key, newValue);
  }, [stats, updateStatValue]);

  const statLabels: Record<StatKey, string> = useMemo(() => ({
    health: 'Sağlık',
    intelligence: 'Zeka',
    charisma: 'Karizma',
    discipline: 'Disiplin',
    money: 'Para',
    energy: 'Enerji',
    familyRelation: 'Aile',
  }), []);

  const getStatPercentage = useCallback((key: StatKey): number => {
    if (key === 'money') return Math.min(stats.money / 1000, 100);
    return stats[key];
  }, [stats]);

  return {
    stats,
    updateStatValue,
    incrementStat,
    statLabels,
    getStatPercentage,
  };
};
