import { runAdvanceTurn } from '../../src/hooks/useEvents/advanceTurnFlow';
import { createInitialFateState } from '../../src/systems/FateEngine';
import type { EventContext, GameState, GameStateUpdate, Stats } from '../../src/types';
import { resolveEnding } from '../../src/utils/endingResolver';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';

const mockLogGameEnding = jest.fn();

jest.mock('../../src/animations/HapticFeedback', () => ({
  ageTransitionHaptic: jest.fn(),
}));

jest.mock('../../src/utils/analyticsEvents', () => {
  const actual = jest.requireActual('../../src/utils/analyticsEvents');
  return {
    ...actual,
    logGameEnding: (data: unknown) => mockLogGameEnding(data),
  };
});

// 17 yaşın son turu: bir sonraki tur 18'e çıkar ve oyun biter (7-17 yaş yılda 5 tur)
const lastTurnAt17 = (tokens: number): { gameState: GameState; stats: Stats } => {
  const initial = getInitialGameState();
  const stats: Stats = getInitialStats();
  return {
    stats,
    gameState: {
      ...initial,
      age: 17,
      turn: 84,
      totalTurns: 84,
      fate: { ...createInitialFateState('KOC'), tokens },
    } as GameState,
  };
};

describe('game over ending', () => {
  beforeEach(() => mockLogGameEnding.mockReset());

  it('reports the same ending the game-over screen and gallery compute from the committed state', () => {
    // 18 yaşına girerken 10. kader jetonu kazanılır; analitik önceden jetonsuz durumdan hesaplanıyordu
    const { gameState, stats } = lastTurnAt17(9);
    let committed: { newGameState: GameStateUpdate; newStats: Partial<Stats> } | null = null;

    runAdvanceTurn({
      gameState,
      stats,
      advanceTurnInContext: updates => { committed = updates; },
      showFloatingText: jest.fn(),
      buildEventContext: () => ({ age: gameState.age, personality: gameState.personality, stats } as EventContext),
      buildScheduledConditionContext: () => ({}) as never,
      getBurdenRisk: () => 0,
      getCachedEligibleEvents: () => [],
      logSelectedEventAnalytics: jest.fn(),
    });

    expect(committed).not.toBeNull();
    const update = committed!;
    expect(update.newGameState.phase).toBe('GAME_OVER');
    const committedState = { ...gameState, ...update.newGameState } as GameState;
    const committedStats = { ...stats, ...update.newStats } as Stats;
    expect(committedState.fate?.tokens).toBe(10);

    const shown = resolveEnding({
      gameState: committedState,
      stats: committedStats,
      achievements: committedState.unlockedAchievements,
    });
    expect(shown.id).toBe('secret_fate_breaker');
    expect(mockLogGameEnding).toHaveBeenCalledWith(expect.objectContaining({ endingType: shown.id }));
  });
});
