import { useCallback, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { StatKey } from '../types';
import { getTraitMultiplier } from '../utils/gameUtils';

export const calculateDeltaWithMultiplier = (
  currentValue: number,
  nextValue: number,
  traitMultiplier: number
): number => {
  const rawDelta = nextValue - currentValue;
  if (rawDelta <= 0) return rawDelta;
  return Math.ceil(rawDelta * traitMultiplier);
};

export const useStats = () => {
  const { stats, gameState, updateStats } = useGame();

  const updateStatValue = useCallback((key: StatKey, value: number) => {
    const currentValue = stats[key];
    if (value === currentValue) return;

    const traitMultiplier = getTraitMultiplier(gameState.traits, key);
    const adjustedDelta = calculateDeltaWithMultiplier(currentValue, value, traitMultiplier);

    const updates: Partial<Record<StatKey, number>> = { [key]: adjustedDelta };
    updateStats(updates);
  }, [stats, gameState.traits, updateStats]);

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
