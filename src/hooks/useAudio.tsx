import { useEffect, useCallback, useRef } from 'react';
import { audioManager } from '../audio/AudioManager';
import { musicPlayer } from '../audio/MusicPlayer';

export const useAudio = () => {
  const initialized = useRef(false);

  // Initialize audio on mount
  useEffect(() => {
    if (!initialized.current) {
      audioManager.initialize();
      initialized.current = true;
    }

    // Cleanup on unmount
    return () => {
      // Don't dispose on every unmount, only on app close
    };
  }, []);

  // Play sound effect
  const playSFX = useCallback(async (soundId: string) => {
    try {
      await audioManager.playSFX(soundId);
    } catch (error) {
      console.error(`Failed to play SFX: ${soundId}`, error);
    }
  }, []);

  // Play music track
  const playMusic = useCallback(async (trackId: string, crossfade: boolean = true) => {
    try {
      await musicPlayer.playMusic(trackId, crossfade ? 2000 : 0);
    } catch (error) {
      console.error(`Failed to play music: ${trackId}`, error);
    }
  }, []);

  // Play music for age
  const playMusicForAge = useCallback(async (age: number, isGameOver: boolean = false) => {
    try {
      await musicPlayer.playMusicForAge(age, isGameOver);
    } catch (error) {
      console.error('Failed to play age music:', error);
    }
  }, []);

  // Stop music
  const stopMusic = useCallback(async (fade: boolean = true) => {
    try {
      await musicPlayer.stop(fade ? 1000 : 0);
    } catch (error) {
      console.error('Failed to stop music:', error);
    }
  }, []);

  // Pause music
  const pauseMusic = useCallback(async () => {
    try {
      await musicPlayer.pause();
    } catch (error) {
      console.error('Failed to pause music:', error);
    }
  }, []);

  // Resume music
  const resumeMusic = useCallback(async () => {
    try {
      await musicPlayer.resume();
    } catch (error) {
      console.error('Failed to resume music:', error);
    }
  }, []);

  // Get settings
  const getSettings = useCallback(() => {
    return audioManager.getSettings();
  }, []);

  // Update volumes
  const setMasterVolume = useCallback(async (volume: number) => {
    await audioManager.setMasterVolume(volume);
    await musicPlayer.updateVolume();
  }, []);

  const setMusicVolume = useCallback(async (volume: number) => {
    await audioManager.setMusicVolume(volume);
    await musicPlayer.updateVolume();
  }, []);

  const setSFXVolume = useCallback(async (volume: number) => {
    await audioManager.setSFXVolume(volume);
  }, []);

  const setMuted = useCallback(async (muted: boolean) => {
    await audioManager.setMuted(muted);
    await musicPlayer.updateVolume();
  }, []);

  return {
    playSFX,
    playMusic,
    playMusicForAge,
    stopMusic,
    pauseMusic,
    resumeMusic,
    getSettings,
    setMasterVolume,
    setMusicVolume,
    setSFXVolume,
    setMuted,
  };
};

// Shorthand hooks for specific sounds
export const useGameSounds = () => {
  const { playSFX } = useAudio();

  return {
    playClick: () => playSFX('button_click'),
    playStatGain: () => playSFX('stat_gain'),
    playStatLoss: () => playSFX('stat_loss'),
    playAchievement: () => playSFX('achievement_unlock'),
    playLevelUp: () => playSFX('level_up'),
    playEvent: () => playSFX('event_start'),
    playTurnAdvance: () => playSFX('turn_advance'),
    playMoneyGain: () => playSFX('money_gain'),
    playMoneyLoss: () => playSFX('money_loss'),
    playMoneyBroke: () => playSFX('money_broke'),
    playHealthCritical: () => playSFX('health_critical'),
    playNotification: () => playSFX('notification'),
    playGradeGood: () => playSFX('grade_good'),
    playGradeBad: () => playSFX('grade_bad'),
  };
};
