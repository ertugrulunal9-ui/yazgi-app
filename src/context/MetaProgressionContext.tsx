import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import SaveManager from '../save/SaveManager';
import { MetaProgression } from '../types';
import { stripRuntimeGameStateCaches } from '../utils/gameStateAdapter';
import { createInitialMetaProgression } from '../utils/metaProgression';
import { useMetaRunRecorder } from '../hooks/useMetaRunRecorder';
import { useGame } from './GameContext';

interface MetaProgressionContextType {
  metaProgression: MetaProgression;
  metaProgressionLoaded: boolean;
  refreshMetaProgression: () => Promise<void>;
  updateMetaProgression: (next: MetaProgression) => void;
}

const MetaProgressionContext = createContext<MetaProgressionContextType | undefined>(undefined);

interface MetaProgressionProviderProps {
  children: ReactNode;
}

export const MetaProgressionProvider: React.FC<MetaProgressionProviderProps> = ({ children }) => {
  const {
    gameState,
    stats,
    playerName,
    isLoading,
    setGameState,
    updateGameState,
  } = useGame();

  const metaProgression = useMemo<MetaProgression>(() => (
    gameState.metaProgression ?? createInitialMetaProgression()
  ), [gameState.metaProgression]);
  const [metaProgressionLoaded, setMetaProgressionLoaded] = useState(false);

  const metaProgressionRef = useRef(metaProgression);
  const gameStateRef = useRef(gameState);
  const statsRef = useRef(stats);
  const playerNameRef = useRef(playerName);

  metaProgressionRef.current = metaProgression;
  gameStateRef.current = gameState;
  statsRef.current = stats;
  playerNameRef.current = playerName;

  const setMetaProgression = useCallback((next: MetaProgression) => {
    updateGameState({ metaProgression: next });
  }, [updateGameState]);

  const refreshMetaProgression = useCallback(async () => {
    try {
      const nextMeta = await SaveManager.getMetaProgression();
      setMetaProgression(nextMeta);
    } catch (error) {
      console.error('Failed to refresh meta progression:', error);
    } finally {
      setMetaProgressionLoaded(true);
    }
  }, [setMetaProgression]);

  useEffect(() => {
    void refreshMetaProgression();
  }, [refreshMetaProgression]);

  useMetaRunRecorder({
    gameState,
    stats,
    isLoading,
    metaProgressionRef,
    gameStateRef,
    statsRef,
    playerNameRef,
    setMetaProgression,
    setGameStateInternal: setGameState,
    prepareState: (state) => ({
      ...stripRuntimeGameStateCaches(state),
      floatingTexts: [],
    }),
  });

  const value = useMemo<MetaProgressionContextType>(() => ({
    metaProgression,
    metaProgressionLoaded,
    refreshMetaProgression,
    updateMetaProgression: setMetaProgression,
  }), [metaProgression, metaProgressionLoaded, refreshMetaProgression, setMetaProgression]);

  return (
    <MetaProgressionContext.Provider value={value}>
      {children}
    </MetaProgressionContext.Provider>
  );
};

export const useMetaProgression = (): MetaProgressionContextType => {
  const context = useContext(MetaProgressionContext);
  if (!context) {
    throw new Error('useMetaProgression must be used within MetaProgressionProvider');
  }
  return context;
};
