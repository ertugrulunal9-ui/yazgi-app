import React, { createContext, useCallback, useEffect, useRef, useState, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { CharacterInfo, FloatingText, FloatingTextAnimation, GameState, GameStateUpdate, MetaProgression, Stats } from '../types';
import { createInitialFateState } from '../systems/FateEngine';
import { getInitialGameState, getInitialStats, initializeSaveSystem, loadGame, saveGame, setCurrentSlotId } from '../utils/gameUtils';
import { trackSpecialProgress } from '../utils/achievementChecker';
import SaveManager from '../save/SaveManager';
import { SaveSlotData } from '../save/SaveSlot';
import { ensureStructuredGameState, mergeGameStateUpdate, stripRuntimeGameStateCaches } from '../utils/gameStateAdapter';
import { DEFAULT_FAMILY_EVOLUTION_STATE } from '../utils/familyNarrative';
import { resolveEnding } from '../utils/endingResolver';
import {
  applyLegacyBonusesToStats,
  applyRunToMetaProgression,
  createInitialMetaProgression,
} from '../utils/metaProgression';
import { devLog } from '../utils/devLogger';

export interface GameContextType {
  gameState: GameState;
  stats: Stats;
  metaProgression: MetaProgression;
  playerName: string;
  isLoading: boolean;

  // Transient UI state (not persisted, does not trigger auto-save)
  floatingTexts: FloatingText[];

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
  refreshMetaProgression: () => Promise<void>;

  // For atomic turn advancement
  advanceTurnInContext: (updates: {
    newStats: Partial<Stats>;
    newGameState: GameStateUpdate;
  }) => void;

  // FloatingText helpers
  showFloatingText: (text: string, x: number, y: number, color: string, options?: {
    animationType?: FloatingTextAnimation;
    duration?: number;
  }) => void;
  removeFloatingText: (id: number) => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
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

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const initialStatsRef = useRef<Stats>(getInitialStats());
  const [gameState, setGameStateInternal] = useState<GameState>(() => buildInitialState(initialStatsRef.current));
  const stats = gameState.stats ?? initialStatsRef.current;
  const [metaProgression, setMetaProgression] = useState<MetaProgression>(() => createInitialMetaProgression());
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // FloatingTexts are transient and do not persist.
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  // Keep refs fresh for async callbacks.
  const gameStateRef = useRef(gameState);
  const statsRef = useRef(stats);
  const playerNameRef = useRef(playerName);
  const isLoadingRef = useRef(isLoading);
  const metaProgressionRef = useRef(metaProgression);
  const hasLoadedOnceRef = useRef(false);
  const prevStatsRef = useRef(stats);
  const recordingMetaRunRef = useRef(false);

  // Save queue guards.
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  useEffect(() => {
    playerNameRef.current = playerName;
  }, [playerName]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  useEffect(() => {
    metaProgressionRef.current = metaProgression;
  }, [metaProgression]);

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

  const refreshMetaProgression = useCallback(async () => {
    try {
      const nextMeta = await SaveManager.getMetaProgression();
      setMetaProgression(nextMeta);
      setGameStateInternal(prev => ensureStructuredGameState(
        {
          ...prev,
          metaProgression: nextMeta,
        },
        prev,
        prev.stats ?? initialStatsRef.current
      ));
    } catch (error) {
      console.error('Failed to refresh meta progression:', error);
    }
  }, []);

  useEffect(() => {
    SaveManager.registerAutoSaveCallback(() => {
      if (isLoadingRef.current || !hasLoadedOnceRef.current || !playerNameRef.current) {
        return null;
      }

      return {
        playerName: playerNameRef.current,
        stats: statsRef.current,
        gameState: prepareStateForPersistence(gameStateRef.current),
      };
    });

    return () => {
      SaveManager.unregisterAutoSaveCallback();
    };
  }, []);

  // Auto-save on meaningful changes only.
  useEffect(() => {
    if (isLoading || !hasLoadedOnceRef.current || !playerName) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      if (isSavingRef.current) {
        pendingSaveRef.current = true;
        return;
      }

      isSavingRef.current = true;
      try {
        const stateToSave = prepareStateForPersistence(gameStateRef.current);
        await saveGame({ gameState: stateToSave, stats: statsRef.current, playerName: playerNameRef.current });
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        isSavingRef.current = false;

        if (pendingSaveRef.current) {
          pendingSaveRef.current = false;
          const stateToSave = prepareStateForPersistence(gameStateRef.current);
          void saveGame({ gameState: stateToSave, stats: statsRef.current, playerName: playerNameRef.current });
        }
      }
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [gameState.turn, gameState.age, playerName, isLoading]);

  // Save on app background (catch stats changes between turn boundaries).
  useEffect(() => {
    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'background' && hasLoadedOnceRef.current && playerNameRef.current) {
        const stateToSave = prepareStateForPersistence(gameStateRef.current);
        void saveGame({ gameState: stateToSave, stats: statsRef.current, playerName: playerNameRef.current });
      }
    };
    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, []);

  const applySavedGame = useCallback((saved: SaveSlotData) => {
    const initial = getInitialGameState();
    const savedState: GameState | undefined = saved.gameState;
    const resolvedStats = savedState?.stats ?? saved.stats ?? initialStatsRef.current;

    initialStatsRef.current = resolvedStats;
    setFloatingTexts([]);

    setGameStateInternal(prev =>
      ensureStructuredGameState(
        {
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
          metaProgression: metaProgressionRef.current,
          metaRunRecorded: savedState?.metaRunRecorded ?? false,
          stats: resolvedStats,
        },
        prev,
        resolvedStats
      )
    );

    setPlayerName(saved.playerName || '');
  }, []);

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
        await refreshMetaProgression();
      } catch (error) {
        console.error('Save system initialization failed:', error);
      } finally {
        await loadSavedGame();
      }
    };

    void bootstrap();
  }, [loadSavedGame, refreshMetaProgression]);

  useEffect(() => {
    if (
      isLoading
      || gameState.phase !== 'GAME_OVER'
      || gameState.metaRunRecorded
      || recordingMetaRunRef.current
    ) {
      return;
    }

    recordingMetaRunRef.current = true;

    const persistRunMeta = async () => {
      try {
        const ending = resolveEnding({
          gameState,
          stats,
          achievements: gameState.unlockedAchievements,
        });
        const unlockedAchievementIds = (gameState.unlockedAchievements || []).map(item => item.achievementId);
        const runId = `${gameState.totalTurns}_${gameState.turn}_${gameState.age}_${ending.id}`;
        const { nextMeta } = applyRunToMetaProgression(metaProgressionRef.current, {
          runId,
          age: gameState.age,
          endingId: ending.id,
          endingTitle: ending.result.title,
          tier: ending.tier,
          compatibilityScore: ending.compatibilityScore,
          selectedGoal: ending.selectedGoal,
          unlockedAchievementIds,
        });

        await SaveManager.setMetaProgression(nextMeta);
        setMetaProgression(nextMeta);

        const stateWithMeta = ensureStructuredGameState(
          {
            ...gameStateRef.current,
            metaProgression: nextMeta,
            metaRunRecorded: true,
          },
          gameStateRef.current,
          statsRef.current
        );

        setGameStateInternal(stateWithMeta);
        await saveGame({
          gameState: prepareStateForPersistence(stateWithMeta),
          stats: statsRef.current,
          playerName: playerNameRef.current,
        });
      } catch (error) {
        console.error('Failed to persist meta progression run:', error);
      } finally {
        recordingMetaRunRef.current = false;
      }
    };

    void persistRunMeta();
  }, [gameState, isLoading, stats]);

  const startNewGame = useCallback((name: string, characterInfo?: CharacterInfo) => {
    setPlayerName(name);

    const newStats = applyLegacyBonusesToStats(getInitialStats(), metaProgressionRef.current);
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
          metaProgression: metaProgressionRef.current,
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

  // Applies deltas, not absolute values.
  const updateStats = useCallback((updates: Partial<Stats>) => {
    setGameStateInternal(prev => {
      const previousStats = prev.stats ?? initialStatsRef.current;
      const nextStats = { ...previousStats };

      (Object.keys(updates) as (keyof Stats)[]).forEach(key => {
        if (updates[key] === undefined) return;

        const delta = updates[key] || 0;
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

  const showFloatingText = useCallback((text: string, x: number, y: number, color: string, options?: {
    animationType?: FloatingTextAnimation;
    duration?: number;
  }) => {
    const newText: FloatingText = {
      id: Date.now() + Math.random(),
      text,
      x,
      y,
      color,
      animationType: options?.animationType || 'arcadeFloat',
      duration: options?.duration || 2000,
    };

    setFloatingTexts(prev => [...prev, newText]);
  }, []);

  const removeFloatingText = useCallback((id: number) => {
    setFloatingTexts(prev => prev.filter(item => item.id !== id));
  }, []);

  const value: GameContextType = {
    gameState,
    stats,
    metaProgression,
    playerName,
    isLoading,
    floatingTexts,
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
    showFloatingText,
    removeFloatingText,
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
