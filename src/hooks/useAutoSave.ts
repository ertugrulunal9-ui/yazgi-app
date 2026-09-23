/**
 * useAutoSave
 *
 * Auto-save orchestration hook — SaveManager callback kaydı,
 * debounced save (3 retry + exponential backoff) ve
 * arka plan (AppState) save mantığını kapsüller.
 *
 * GameContext'e sadece refs + tetikleyici değerler (turn, age, playerName, isLoading)
 * geçirilir; hook kendi iç ref'lerini yönetir.
 */

import { MutableRefObject, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { GameState, Stats } from '../types';
import SaveManager from '../save/SaveManager';
import { saveGame } from '../utils/gameUtils';

export interface AutoSavePayload {
  gameState: GameState;
  stats: Stats;
  playerName: string;
}

export interface UseAutoSaveConfig {
  // Stable refs — always current, safe for async reads
  gameStateRef: MutableRefObject<GameState>;
  statsRef: MutableRefObject<Stats>;
  playerNameRef: MutableRefObject<string>;
  isLoadingRef: MutableRefObject<boolean>;
  hasLoadedOnceRef: MutableRefObject<boolean>;

  // Reactive trigger deps — changing these causes save to be enqueued
  turn: number;
  age: number;
  playerName: string;
  isLoading: boolean;

  // Pure function that strips runtime caches before persistence
  prepareState: (state: GameState) => GameState;
}

const SAVE_CONTEXT = {
  AUTO_SAVE: 'AUTO_SAVE',
  PENDING_SAVE: 'PENDING_SAVE',
  BACKGROUND_SAVE: 'BACKGROUND_SAVE',
} as const;

export function useAutoSave(config: UseAutoSaveConfig): void {
  const {
    gameStateRef,
    statsRef,
    playerNameRef,
    isLoadingRef,
    hasLoadedOnceRef,
    turn,
    age,
    playerName,
    isLoading,
    prepareState,
  } = config;

  // Internal save-queue guards — owned by this hook.
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildPayload = (): AutoSavePayload => ({
    gameState: prepareState(gameStateRef.current),
    stats: statsRef.current,
    playerName: playerNameRef.current,
  });

  const saveWithRetry = async (
    payloadFactory: () => AutoSavePayload,
    contextLabel: string,
    maxRetries: number = 3
  ): Promise<boolean> => {
    let attempt = 0;
    let lastError: unknown;

    while (attempt < maxRetries) {
      try {
        await saveGame(payloadFactory());
        return true;
      } catch (error) {
        lastError = error;
        attempt += 1;

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 200 * Math.pow(2, attempt - 1)));
        }
      }
    }

    console.error(`${contextLabel} failed after ${maxRetries} attempts:`, lastError);
    return false;
  };

  // Register SaveManager auto-save callback (e.g. for timed interval saves).
  useEffect(() => {
    SaveManager.registerAutoSaveCallback(() => {
      if (isLoadingRef.current || !hasLoadedOnceRef.current || !playerNameRef.current) {
        return null;
      }
      return buildPayload();
    });

    return () => {
      SaveManager.unregisterAutoSaveCallback();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced save on meaningful game changes.
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
      await saveWithRetry(buildPayload, SAVE_CONTEXT.AUTO_SAVE);

      if (pendingSaveRef.current) {
        pendingSaveRef.current = false;
        await saveWithRetry(buildPayload, SAVE_CONTEXT.PENDING_SAVE);
      }

      isSavingRef.current = false;
    }, 500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, age, playerName, isLoading]);

  // Eagerly save on app background to capture changes between turn boundaries.
  useEffect(() => {
    const handleAppState = (nextState: string) => {
      if (nextState === 'background' && hasLoadedOnceRef.current && playerNameRef.current) {
        void saveWithRetry(buildPayload, SAVE_CONTEXT.BACKGROUND_SAVE);
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
