import { createAudioPlayer, AudioPlayer } from 'expo-audio';
import { audioManager } from './AudioManager';
import { getMusicForAge, getSoundDefinition } from './soundDefinitions';

class MusicPlayer {
  private static instance: MusicPlayer;

  private currentTrack: AudioPlayer | null = null;
  private currentTrackId: string | null = null;
  private nextTrack: AudioPlayer | null = null;
  private isCrossfading: boolean = false;
  private fadeInterval: ReturnType<typeof setInterval> | null = null;
  private operationToken = 0;

  private constructor() {}

  static getInstance(): MusicPlayer {
    if (!MusicPlayer.instance) {
      MusicPlayer.instance = new MusicPlayer();
    }
    return MusicPlayer.instance;
  }

  private beginOperation(): number {
    this.operationToken += 1;
    return this.operationToken;
  }

  private isOperationActive(token: number): boolean {
    return token === this.operationToken;
  }

  private clearFadeInterval(): void {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  private isPlayerMissingError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return /player does not exist|player is not available|has been removed/i.test(message);
  }

  // Play music track with optional crossfade
  async playMusic(trackId: string, crossfadeDuration: number = 2000): Promise<void> {
    const operationToken = this.beginOperation();

    // Already playing this track
    if (this.currentTrackId === trackId && this.currentTrack) {
      try {
        if (!this.isOperationActive(operationToken)) return;
        if (this.currentTrack.isLoaded && this.currentTrack.playing) {
          return;
        }
      } catch (error) {
        if (this.isPlayerMissingError(error)) {
          this.currentTrack = null;
          this.currentTrackId = null;
        } else {
          console.warn('Failed to inspect current music track state:', error);
        }
      }
    }

    if (this.isCrossfading) {
      await this.stopCrossfade();
      if (!this.isOperationActive(operationToken)) return;
    }

    const definition = getSoundDefinition(trackId);
    if (!definition) {
      console.warn(`Music track not found: ${trackId}`);
      return;
    }

    try {
      const newTrack = createAudioPlayer(definition.path);
      newTrack.volume = 0;
      newTrack.loop = definition.loop || false;
      newTrack.play(); // Start at volume 0 for fade-in

      if (!this.isOperationActive(operationToken)) {
        try { newTrack.remove(); } catch {}
        return;
      }

      this.nextTrack = newTrack;

      if (this.currentTrack) {
        await this.crossfade(this.currentTrack, newTrack, crossfadeDuration, operationToken);
      } else {
        await this.fadeIn(newTrack, crossfadeDuration / 2, operationToken);
      }

      if (!this.isOperationActive(operationToken)) {
        if (this.nextTrack === newTrack) {
          try { newTrack.remove(); } catch {}
          this.nextTrack = null;
        }
        return;
      }

      const oldTrack = this.currentTrack;
      this.currentTrack = newTrack;
      this.currentTrackId = trackId;
      this.nextTrack = null;

      if (oldTrack && oldTrack !== newTrack) {
        try { oldTrack.remove(); } catch {}
      }
    } catch (error) {
      if (!this.isPlayerMissingError(error)) {
        console.error(`Failed to play music: ${trackId}`, error);
      }
    }
  }

  private async crossfade(
    fromTrack: AudioPlayer,
    toTrack: AudioPlayer,
    duration: number,
    operationToken: number
  ): Promise<void> {
    this.isCrossfading = true;

    if (duration <= 0) {
      try {
        if (this.isOperationActive(operationToken)) {
          toTrack.volume = this.calculateMusicVolume();
          fromTrack.pause();
          await fromTrack.seekTo(0);
        }
      } catch (error) {
        if (!this.isPlayerMissingError(error)) {
          console.error('Crossfade error:', error);
        }
      } finally {
        this.isCrossfading = false;
      }
      return;
    }

    const steps = 50;
    const stepDuration = Math.max(1, Math.round(duration / steps));

    return new Promise((resolve) => {
      let currentStep = 0;

      this.clearFadeInterval();
      this.fadeInterval = setInterval(async () => {
        if (!this.isOperationActive(operationToken)) {
          this.clearFadeInterval();
          this.isCrossfading = false;
          resolve();
          return;
        }

        currentStep += 1;
        const progress = currentStep / steps;

        try {
          const targetVolume = this.calculateMusicVolume();
          fromTrack.volume = targetVolume * (1 - progress);
          toTrack.volume = targetVolume * progress;

          if (currentStep >= steps) {
            this.clearFadeInterval();
            this.isCrossfading = false;
            try {
              fromTrack.pause();
              await fromTrack.seekTo(0);
            } catch {}
            resolve();
          }
        } catch (error) {
          if (!this.isPlayerMissingError(error)) {
            console.error('Crossfade error:', error);
          }
          this.clearFadeInterval();
          this.isCrossfading = false;
          resolve();
        }
      }, stepDuration);
    });
  }

  private async fadeIn(track: AudioPlayer, duration: number, operationToken: number): Promise<void> {
    if (duration <= 0) {
      try {
        if (this.isOperationActive(operationToken)) {
          track.volume = this.calculateMusicVolume();
        }
      } catch (error) {
        if (!this.isPlayerMissingError(error)) {
          console.error('Fade in error:', error);
        }
      }
      return;
    }

    const steps = 30;
    const stepDuration = Math.max(1, Math.round(duration / steps));

    return new Promise((resolve) => {
      let currentStep = 0;

      this.clearFadeInterval();
      this.fadeInterval = setInterval(() => {
        if (!this.isOperationActive(operationToken)) {
          this.clearFadeInterval();
          resolve();
          return;
        }

        currentStep += 1;
        const progress = currentStep / steps;

        try {
          const targetVolume = this.calculateMusicVolume();
          track.volume = targetVolume * progress;

          if (currentStep >= steps) {
            this.clearFadeInterval();
            resolve();
          }
        } catch (error) {
          if (!this.isPlayerMissingError(error)) {
            console.error('Fade in error:', error);
          }
          this.clearFadeInterval();
          resolve();
        }
      }, stepDuration);
    });
  }

  private async fadeOut(track: AudioPlayer, duration: number, operationToken: number): Promise<void> {
    if (!track.isLoaded) return;

    const currentVolume = track.volume || 0;

    if (duration <= 0) {
      try {
        if (this.isOperationActive(operationToken)) {
          track.pause();
          await track.seekTo(0);
        }
      } catch (error) {
        if (!this.isPlayerMissingError(error)) {
          console.error('Fade out error:', error);
        }
      }
      return;
    }

    const steps = 30;
    const stepDuration = Math.max(1, Math.round(duration / steps));

    return new Promise((resolve) => {
      let currentStep = 0;

      this.clearFadeInterval();
      this.fadeInterval = setInterval(async () => {
        if (!this.isOperationActive(operationToken)) {
          this.clearFadeInterval();
          resolve();
          return;
        }

        currentStep += 1;
        const progress = currentStep / steps;

        try {
          track.volume = currentVolume * (1 - progress);

          if (currentStep >= steps) {
            this.clearFadeInterval();
            try {
              track.pause();
              await track.seekTo(0);
            } catch {}
            resolve();
          }
        } catch (error) {
          if (!this.isPlayerMissingError(error)) {
            console.error('Fade out error:', error);
          }
          this.clearFadeInterval();
          resolve();
        }
      }, stepDuration);
    });
  }

  private async stopCrossfade(): Promise<void> {
    this.clearFadeInterval();
    this.isCrossfading = false;
  }

  private calculateMusicVolume(): number {
    const settings = audioManager.getSettings();
    if (settings.muted) return 0;
    return settings.masterVolume * settings.musicVolume * 0.6;
  }

  async updateVolume(): Promise<void> {
    const targetVolume = this.calculateMusicVolume();

    if (this.currentTrack) {
      try {
        this.currentTrack.volume = targetVolume;
      } catch (error) {
        if (this.isPlayerMissingError(error)) {
          this.currentTrack = null;
          this.currentTrackId = null;
        } else {
          console.error('Failed to update music volume:', error);
        }
      }
    }

    if (this.nextTrack) {
      try {
        this.nextTrack.volume = targetVolume;
      } catch (error) {
        if (this.isPlayerMissingError(error)) {
          this.nextTrack = null;
        } else {
          console.error('Failed to update next music volume:', error);
        }
      }
    }
  }

  async stop(fadeDuration: number = 1000): Promise<void> {
    const operationToken = this.beginOperation();
    await this.stopCrossfade();

    const activeTrack = this.currentTrack;
    const pendingTrack = this.nextTrack;

    this.currentTrack = null;
    this.currentTrackId = null;
    this.nextTrack = null;

    if (!activeTrack && !pendingTrack) return;

    try {
      if (activeTrack) {
        if (fadeDuration > 0) {
          await this.fadeOut(activeTrack, fadeDuration, operationToken);
        } else {
          try { activeTrack.pause(); await activeTrack.seekTo(0); } catch {}
        }
        try { activeTrack.remove(); } catch {}
      }

      if (pendingTrack && pendingTrack !== activeTrack) {
        try { pendingTrack.pause(); await pendingTrack.seekTo(0); } catch {}
        try { pendingTrack.remove(); } catch {}
      }
    } catch (error) {
      if (!this.isPlayerMissingError(error)) {
        console.error('Failed to stop music:', error);
      }
    }
  }

  async pause(): Promise<void> {
    if (!this.currentTrack) return;

    try {
      this.currentTrack.pause();
    } catch (error) {
      if (this.isPlayerMissingError(error)) {
        this.currentTrack = null;
        this.currentTrackId = null;
        return;
      }
      console.error('Failed to pause music:', error);
    }
  }

  async resume(): Promise<void> {
    if (!this.currentTrack) return;

    try {
      this.currentTrack.play();
    } catch (error) {
      if (this.isPlayerMissingError(error)) {
        this.currentTrack = null;
        this.currentTrackId = null;
        return;
      }
      console.error('Failed to resume music:', error);
    }
  }

  async playMusicForAge(age: number, isGameOver: boolean = false): Promise<void> {
    const trackId = getMusicForAge(age, isGameOver);
    await this.playMusic(trackId);
  }

  getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  async dispose(): Promise<void> {
    this.beginOperation();
    await this.stopCrossfade();

    const activeTrack = this.currentTrack;
    const pendingTrack = this.nextTrack;

    this.currentTrack = null;
    this.currentTrackId = null;
    this.nextTrack = null;

    if (activeTrack) {
      try { activeTrack.pause(); await activeTrack.seekTo(0); } catch {}
      try { activeTrack.remove(); } catch {}
    }

    if (pendingTrack && pendingTrack !== activeTrack) {
      try { pendingTrack.pause(); await pendingTrack.seekTo(0); } catch {}
      try { pendingTrack.remove(); } catch {}
    }
  }
}

export const musicPlayer = MusicPlayer.getInstance();
