import { EventMemory, GameState, Stats } from '../types';
import { EndingDefinition } from '../data/endings';
import { resolveEnding } from './endingResolver';

// Legacy compatibility wrapper: delegates to the unified resolver.
export const determineEnding = (gameState: GameState, stats: Stats): EndingDefinition => {
  const ending = resolveEnding({
    gameState,
    stats,
    achievements: gameState.unlockedAchievements,
  });

  return {
    id: ending.id,
    title: ending.result.title,
    description: ending.result.description,
    priority: Math.round(ending.score),
    condition: () => true,
  };
};

// Picks the top 3 memories for compact end summaries.
export const getKeyMemories = (memories: EventMemory[]): EventMemory[] => {
  const weightScore = (weight: string): number => {
    if (weight === 'HIGH') return 3;
    if (weight === 'MEDIUM') return 2;
    return 1;
  };

  return [...memories]
    .sort((a, b) => {
      const scoreDiff = weightScore(b.weight) - weightScore(a.weight);
      if (scoreDiff !== 0) return scoreDiff;
      return b.turnTimestamp - a.turnTimestamp;
    })
    .slice(0, 3);
};

