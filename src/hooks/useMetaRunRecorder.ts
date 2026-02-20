/**
 * useMetaRunRecorder
 *
 * GAME_OVER aşamasında meta progression'ı kalıcı hale getirir:
 *   1. resolveEnding ile oyun sonucunu hesapla
 *   2. applyRunToMetaProgression ile meta state'i güncelle
 *   3. SaveManager.setMetaProgression ile kaydet
 *   4. Son oyun state'ini persist et
 *
 * GameContext'ten çıkarılan effect — recordingMetaRunRef bu hook'a aittir.
 */

import { MutableRefObject, useEffect, useRef } from 'react';
import { GameState, MetaProgression, Stats } from '../types';
import SaveManager from '../save/SaveManager';
import { saveGame } from '../utils/gameUtils';
import { resolveEnding } from '../utils/endingResolver';
import { applyRunToMetaProgression } from '../utils/metaProgression';
import { ensureStructuredGameState } from '../utils/gameStateAdapter';

export interface UseMetaRunRecorderConfig {
  // Reactive trigger values
  gameState: GameState;
  stats: Stats;
  isLoading: boolean;

  // Stable refs
  metaProgressionRef: MutableRefObject<MetaProgression>;
  gameStateRef: MutableRefObject<GameState>;
  statsRef: MutableRefObject<Stats>;
  playerNameRef: MutableRefObject<string>;

  // Setters (stable — from useState/useCallback)
  setMetaProgression: (mp: MetaProgression) => void;
  setGameStateInternal: (s: GameState) => void;

  // Pure function that strips runtime caches before persistence
  prepareState: (state: GameState) => GameState;
}

export function useMetaRunRecorder(config: UseMetaRunRecorderConfig): void {
  const {
    gameState,
    stats,
    isLoading,
    metaProgressionRef,
    gameStateRef,
    statsRef,
    playerNameRef,
    setMetaProgression,
    setGameStateInternal,
    prepareState,
  } = config;

  const recordingMetaRunRef = useRef(false);

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
          gameState: prepareState(stateWithMeta),
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
  }, [gameState, isLoading, stats]); // eslint-disable-line react-hooks/exhaustive-deps
}
