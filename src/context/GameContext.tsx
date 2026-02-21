import React, { createContext, useCallback, useEffect, useRef, useState, ReactNode } from 'react';
import { CharacterInfo, GameState, GameStateUpdate, MetaProgression, ScheduledEvent, Stats } from '../types';
import { createInitialFateState } from '../systems/FateEngine';
import { getInitialGameState, getInitialStats, initializeSaveSystem, loadGame, setCurrentSlotId } from '../utils/gameUtils';
import { trackSpecialProgress } from '../utils/achievementChecker';
import SaveManager from '../save/SaveManager';
import { SaveSlotData } from '../save/SaveSlot';
import { useAutoSave } from '../hooks/useAutoSave';
import { ensureStructuredGameState, mergeGameStateUpdate, stripRuntimeGameStateCaches } from '../utils/gameStateAdapter';
import { DEFAULT_FAMILY_EVOLUTION_STATE } from '../utils/familyNarrative';
import {
  applyLegacyBonusesToStats,
  createInitialMetaProgression,
} from '../utils/metaProgression';
import { devLog } from '../utils/devLogger';

export interface GameContextType {
  gameState: GameState;
  stats: Stats;
  /** @deprecated MetaProgressionContext kullanimi tercih edilmelidir. */
  metaProgression: MetaProgression;
  playerName: string;
  isLoading: boolean;

  // Game lifecycle
  startNewGame: (name: string, characterInfo?: CharacterInfo) => void;
  loadSavedGame: (slotId?: string, saveData?: SaveSlotData) => Promise<boolean>;
  resetGame: () => void;

  // State updates
  setGameState: (state: GameState | ((prev: GameState) => GameState)) => void;
  setStats: (stats: Stats | ((prev: Stats) => Stats)) => void;
  setPlayerName: (name: string) => void;

  // Composite updates
  updateGameState: (updates: GameStateUpdate) => void;
  updateStats: (updates: Partial<Stats>) => void;
  /** @deprecated MetaProgressionContext.refreshMetaProgression kullanimi tercih edilmelidir. */
  refreshMetaProgression: () => Promise<void>;

  // For atomic turn advancement
  advanceTurnInContext: (updates: {
    newStats: Partial<Stats>;
    newGameState: GameStateUpdate;
  }) => void;

}

export const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
  /** Called after a saved game is loaded — use to clear transient UI state (e.g. floating texts) */
  onLoadGame?: () => void;
}

const buildInitialState = (initialStats: Stats): GameState =>
  ensureStructuredGameState(
    {
      ...getInitialGameState(),
      stats: initialStats,
      metaProgression: createInitialMetaProgression(),
      metaRunRecorded: false,
    },
    undefined,
    initialStats
  );

const prepareStateForPersistence = (state: GameState): GameState => ({
  ...stripRuntimeGameStateCaches(state),
  floatingTexts: [],
});

const CLIFFHANGER_CONTINUATION_PRIORITY = 999;

const getScheduledPriorityValue = (priority: ScheduledEvent['priority']): number => {
  if (typeof priority === 'number') return priority;
  return priority === 'HIGH' ? 100 : 0;
};

const withForcedCliffhangerContinuation = (state: GameState): GameState => {
  const continuationEventId = state.pendingCliffhanger?.continuationEventId;
  if (!continuationEventId) return state;

  const scheduledEvents = state.scheduledEvents || [];
  const hasForcedContinuation = scheduledEvents.some(evt => (
    evt.eventId === continuationEventId && getScheduledPriorityValue(evt.priority) > 900
  ));
  if (hasForcedContinuation) return state;

  const filteredScheduledEvents = scheduledEvents.filter(evt => evt.eventId !== continuationEventId);

  const forcedContinuationEvent: ScheduledEvent = {
    id: `scheduled_cliff_resume_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    eventId: continuationEventId,
    remainingTurns: 0,
    priority: CLIFFHANGER_CONTINUATION_PRIORITY,
    sourceEventId: state.pendingCliffhanger?.sourceEventId ?? `cliff_resume_${continuationEventId}`,
  };

  return {
    ...state,
    scheduledEvents: [forcedContinuationEvent, ...filteredScheduledEvents],
  };
};

export const GameProvider: React.FC<GameProviderProps> = ({ children, onLoadGame }) => {
  const initialStatsRef = useRef<Stats>(getInitialStats());
  const [gameState, setGameStateInternal] = useState<GameState>(() => buildInitialState(initialStatsRef.current));
  const stats = gameState.stats ?? initialStatsRef.current;
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const metaProgression = gameState.metaProgression ?? createInitialMetaProgression();

  // Refs for async callbacks — updated inline each render (safe: only read after event loop tick).
  const gameStateRef = useRef(gameState);
  const statsRef = useRef(stats);
  const playerNameRef = useRef(playerName);
  const isLoadingRef = useRef(isLoading);
  const hasLoadedOnceRef = useRef(false);
  const prevStatsRef = useRef(stats);

  gameStateRef.current = gameState;
  statsRef.current = stats;
  playerNameRef.current = playerName;
  isLoadingRef.current = isLoading;

  useEffect(() => {
    if (isLoading) {
      prevStatsRef.current = stats;
      return;
    }

    const previousStats = prevStatsRef.current;
    if (previousStats !== stats) {
      setGameStateInternal(prev => {
        const trackedState = trackSpecialProgress(prev, stats, previousStats);
        if (trackedState === prev) return prev;
        return ensureStructuredGameState(trackedState, prev, initialStatsRef.current);
      });
      prevStatsRef.current = stats;
    }
  }, [stats, isLoading]);

  useAutoSave({
    gameStateRef,
    statsRef,
    playerNameRef,
    isLoadingRef,
    hasLoadedOnceRef,
    turn: gameState.turn,
    age: gameState.age,
    playerName,
    isLoading,
    prepareState: prepareStateForPersistence,
  });

  const applySavedGame = useCallback((saved: SaveSlotData) => {
    const initial = getInitialGameState();
    const savedState: GameState | undefined = saved.gameState;
    const resolvedStats = savedState?.stats ?? saved.stats ?? initialStatsRef.current;

    initialStatsRef.current = resolvedStats;
    onLoadGame?.();

    setGameStateInternal(prev =>
      ensureStructuredGameState(
        withForcedCliffhangerContinuation({
          ...initial,
          ...(savedState || {}),
          schoolGrades: { ...initial.schoolGrades, ...(savedState?.schoolGrades || {}) },
          skills: { ...initial.skills, ...(savedState?.skills || {}) },
          traitProgress: savedState?.traitProgress || {},
          streak: savedState?.streak || initial.streak,
          actionCounts: savedState?.actionCounts || {},
          actionHistory: savedState?.actionHistory || [],
          eventChoiceHistory: savedState?.eventChoiceHistory || [],
          inventory: savedState?.inventory || [],
          npcs: savedState?.npcs || initial.npcs,
          memories: savedState?.memories || [],
          scheduledEvents: savedState?.scheduledEvents || [],
          activeArcs: savedState?.activeArcs || [],
          familyEvolution: {
            ...DEFAULT_FAMILY_EVOLUTION_STATE,
            ...(savedState?.familyEvolution || {}),
          },
          recentEvents: savedState?.recentEvents || [],
          sessionCount: savedState?.sessionCount ?? initial.sessionCount,
          adaptivePacingStreak: savedState?.adaptivePacingStreak ?? initial.adaptivePacingStreak,
          selectedNpcId: savedState?.selectedNpcId ?? null,
          pendingReportCard: savedState?.pendingReportCard ?? false,
          floatingTexts: savedState?.floatingTexts || [],
          lastInteracted: savedState?.lastInteracted || initial.lastInteracted,
          personality: savedState?.personality || initial.personality,
          stress: savedState?.stress || initial.stress,
          personalityHistory: savedState?.personalityHistory || initial.personalityHistory,
          personalityState: savedState?.personalityState || initial.personalityState,
          socialGroups: savedState?.socialGroups || initial.socialGroups,
          socialReputation: savedState?.socialReputation ?? initial.socialReputation,
          childhood: {
            ...initial.childhood,
            ...(savedState?.childhood || {}),
            completed: (savedState?.age ?? 0) >= 7
              ? true
              : (savedState?.childhood?.completed ?? initial.childhood.completed),
          },
          characterInfo: savedState?.characterInfo ?? null,
          fate: savedState?.fate ?? undefined,
          metaProgression: savedState?.metaProgression ?? prev.metaProgression ?? createInitialMetaProgression(),
          metaRunRecorded: savedState?.metaRunRecorded ?? false,
          stats: resolvedStats,
        }),
        prev,
        resolvedStats
      )
    );

    setPlayerName(saved.playerName || '');
  }, [onLoadGame]);

  const loadSavedGame = useCallback(async (slotId?: string, saveData?: SaveSlotData): Promise<boolean> => {
    setIsLoading(true);
    try {
      const resolvedSlotId = slotId ?? saveData?.metadata?.slotId;
      if (resolvedSlotId) {
        setCurrentSlotId(resolvedSlotId);
      }

      const saved = saveData ?? await loadGame();
      if (saved) {
        applySavedGame(saved);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to load saved game:', error);
      return false;
    } finally {
      setIsLoading(false);
      hasLoadedOnceRef.current = true;
    }
  }, [applySavedGame]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await initializeSaveSystem();
      } catch (error) {
        console.error('Save system initialization failed:', error);
      } finally {
        await loadSavedGame();
      }
    };

    void bootstrap();
  }, [loadSavedGame]);

  useEffect(() => {
    if (isLoading) return;

    setGameStateInternal(prev => {
      const nextState = withForcedCliffhangerContinuation(prev);
      if (nextState === prev) return prev;
      return ensureStructuredGameState(nextState, prev, prev.stats ?? initialStatsRef.current);
    });
  }, [isLoading]);

  const startNewGame = useCallback((name: string, characterInfo?: CharacterInfo) => {
    setPlayerName(name);

    const currentMeta = gameStateRef.current.metaProgression ?? createInitialMetaProgression();
    const newStats = applyLegacyBonusesToStats(getInitialStats(), currentMeta);
    initialStatsRef.current = newStats;

    const newGameState = getInitialGameState();
    if (characterInfo) {
      newGameState.characterInfo = characterInfo;
      // Kader sistemi — burç bilgisiyle başlat
      if (characterInfo.zodiacSign) {
        newGameState.fate = createInitialFateState(characterInfo.zodiacSign);
      }
    }

    setGameStateInternal(prev =>
      ensureStructuredGameState(
        {
          ...newGameState,
          stats: newStats,
          metaProgression: currentMeta,
          metaRunRecorded: false,
        },
        prev,
        newStats
      )
    );
  }, []);

  const resetGame = useCallback(() => {
    startNewGame('');
  }, [startNewGame]);

  const setGameState = useCallback((update: GameState | ((prev: GameState) => GameState)) => {
    setGameStateInternal(prev => {
      const nextState = typeof update === 'function'
        ? (update as (previous: GameState) => GameState)(prev)
        : update;

      const resolvedStats = nextState.stats ?? prev.stats ?? initialStatsRef.current;
      initialStatsRef.current = resolvedStats;

      return ensureStructuredGameState(
        {
          ...nextState,
          stats: resolvedStats,
        },
        prev,
        resolvedStats
      );
    });
  }, []);

  const setStats = useCallback((update: Stats | ((prev: Stats) => Stats)) => {
    setGameStateInternal(prev => {
      const previousStats = prev.stats ?? initialStatsRef.current;
      const nextStats = typeof update === 'function'
        ? (update as (current: Stats) => Stats)(previousStats)
        : update;

      initialStatsRef.current = nextStats;
      return ensureStructuredGameState(
        {
          ...prev,
          stats: nextStats,
        },
        prev,
        nextStats
      );
    });
  }, []);

  const updateGameState = useCallback((updates: GameStateUpdate) => {
    setGameStateInternal(prev => {
      const nextState = mergeGameStateUpdate(prev, updates, initialStatsRef.current);
      if (nextState.stats) {
        initialStatsRef.current = nextState.stats;
      }
      return nextState;
    });
  }, []);

  const refreshMetaProgression = useCallback(async () => {
    try {
      const nextMeta = await SaveManager.getMetaProgression();
      updateGameState({ metaProgression: nextMeta });
    } catch (error) {
      console.error('Failed to refresh meta progression:', error);
    }
  }, [updateGameState]);

  // Applies deltas, not absolute values.
  const updateStats = useCallback((updates: Partial<Stats>) => {
    setGameStateInternal(prev => {
      const previousStats = prev.stats ?? initialStatsRef.current;
      const nextStats = { ...previousStats };

      (Object.keys(updates) as (keyof Stats)[]).forEach(key => {
        if (updates[key] === undefined) return;

        const delta = updates[key] ?? 0;
        let newValue = previousStats[key] + delta;

        if (key === 'money') {
          newValue = Math.max(0, newValue);
        } else if (key === 'energy') {
          const maxEnergy = prev.maxEnergy || 100;
          newValue = Math.max(0, Math.min(maxEnergy, newValue));
        } else {
          newValue = Math.max(0, Math.min(100, newValue));
        }

        nextStats[key] = newValue;
      });

      initialStatsRef.current = nextStats;
      return ensureStructuredGameState(
        {
          ...prev,
          stats: nextStats,
        },
        prev,
        nextStats
      );
    });
  }, []);

  const advanceTurnInContext = useCallback((updates: {
    newStats: Partial<Stats>;
    newGameState: GameStateUpdate;
  }) => {
    const incomingPhase = updates.newGameState.phase ?? updates.newGameState.progress?.phase;
    const incomingEvent = updates.newGameState.currentEvent ?? updates.newGameState.events?.currentEvent;

    devLog.log('[GameContext] advanceTurnInContext called with:', {
      phase: incomingPhase,
      hasEvent: !!incomingEvent,
      eventId: incomingEvent?.id,
    });

    setGameStateInternal(prev => {
      const mergedState = mergeGameStateUpdate(prev, updates.newGameState, initialStatsRef.current);
      const previousStats = mergedState.stats ?? prev.stats ?? initialStatsRef.current;
      const nextStats = { ...previousStats, ...updates.newStats };

      initialStatsRef.current = nextStats;
      const nextState = ensureStructuredGameState(
        {
          ...mergedState,
          stats: nextStats,
        },
        prev,
        nextStats
      );

      devLog.log('[GameContext] New gameState set:', {
        phase: nextState.phase,
        hasEvent: !!nextState.currentEvent,
      });

      return nextState;
    });
  }, []);

  const value: GameContextType = {
    gameState,
    stats,
    metaProgression,
    playerName,
    isLoading,
    startNewGame,
    resetGame,
    loadSavedGame,
    setGameState,
    setStats,
    setPlayerName,
    updateGameState,
    updateStats,
    refreshMetaProgression,
    advanceTurnInContext,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextType => {
  const context = React.useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};
