import React, { createContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { GameState, Stats } from '../types';
import { getInitialGameState, getInitialStats, saveGame, loadGame } from '../utils/gameUtils';

export interface GameContextType {
  gameState: GameState;
  stats: Stats;
  playerName: string;
  isLoading: boolean;
  
  // Game lifecycle
  startNewGame: (name: string) => void;
  loadSavedGame: () => void;
  resetGame: () => void;
  
  // State updates
  setGameState: (state: GameState | ((prev: GameState) => GameState)) => void;
  setStats: (stats: Stats | ((prev: Stats) => Stats)) => void;
  setPlayerName: (name: string) => void;
  
  // Composite updates
  updateGameState: (updates: Partial<GameState>) => void;
  updateStats: (updates: Partial<Stats>) => void;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [gameState, setGameStateInternal] = useState<GameState>(getInitialGameState());
  const [stats, setStatsInternal] = useState<Stats>(getInitialStats());
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Auto-save on state changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      void saveGame({ gameState, stats, playerName });
    }, 100);
    return () => clearTimeout(timeout);
  }, [gameState, stats, playerName]);

  // Initial load
  useEffect(() => {
    const loadSavedGame = async () => {
      try {
        const saved = await loadGame();
        if (saved) {
          const initial = getInitialGameState();
          const savedState: GameState | undefined = saved.gameState;
          setGameStateInternal({
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
            recentEvents: savedState?.recentEvents || [],
            selectedNpcId: savedState?.selectedNpcId ?? null,
            pendingReportCard: savedState?.pendingReportCard ?? false,
            floatingTexts: savedState?.floatingTexts || [],
            lastInteracted: savedState?.lastInteracted || initial.lastInteracted,
          });
          setStatsInternal(saved.stats || getInitialStats());
          setPlayerName(saved.playerName || '');
        }
      } catch (error) {
        console.error('Failed to load saved game:', error);
      } finally {
        setIsLoading(false);
      }
    };
    void loadSavedGame();
  }, []);

  const startNewGame = useCallback((name: string) => {
    setPlayerName(name);
    setStatsInternal(getInitialStats());
    setGameStateInternal(getInitialGameState());
  }, []);

  const resetGame = useCallback(() => {
    startNewGame('');
  }, [startNewGame]);

  const setGameState = useCallback((update: GameState | ((prev: GameState) => GameState)) => {
    setGameStateInternal(update);
  }, []);

  const setStats = useCallback((update: Stats | ((prev: Stats) => Stats)) => {
    setStatsInternal(update);
  }, []);

  const updateGameState = useCallback((updates: Partial<GameState>) => {
    setGameStateInternal(prev => ({ ...prev, ...updates }));
  }, []);

  const updateStats = useCallback((updates: Partial<Stats>) => {
    setStatsInternal(prev => ({ ...prev, ...updates }));
  }, []);

  const value: GameContextType = {
    gameState,
    stats,
    playerName,
    isLoading,
    startNewGame,
    resetGame,
    loadSavedGame: async () => { await loadGame(); },
    setGameState,
    setStats,
    setPlayerName,
    updateGameState,
    updateStats,
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
