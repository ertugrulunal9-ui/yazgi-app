import { Audio } from 'expo-av';
import { audioManager } from './AudioManager';
import { getMusicForAge, getSoundDefinition } from './soundDefinitions';

class MusicPlayer {
  private static instance: MusicPlayer;

  private currentTrack: Audio.Sound | null = null;
  private currentTrackId: string | null = null;
  private nextTrack: Audio.Sound | null = null;
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
    return /player does not exist/i.test(message);
  }

  // Play music track with optional crossfade
  async playMusic(trackId: string, crossfadeDuration: number = 2000): Promise<void> {
    const operationToken = this.beginOperation();

    // Already playing this track
    if (this.currentTrackId === trackId && this.currentTrack) {
      try {
        const status = await this.currentTrack.getStatusAsync();
        if (!this.isOperationActive(operationToken)) return;
        if (status.isLoaded && status.isPlaying) {
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
      const { sound: newTrack } = await Audio.Sound.createAsync(
        definition.path,
        {
          volume: 0,
          isLooping: definition.loop || false,
          shouldPlay: true,
        }
      );

      if (!this.isOperationActive(operationToken)) {
        await newTrack.unloadAsync().catch(() => {});
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
          await newTrack.unloadAsync().catch(() => {});
          this.nextTrack = null;
        }
        return;
      }

      const oldTrack = this.currentTrack;
      this.currentTrack = newTrack;
      this.currentTrackId = trackId;
      this.nextTrack = null;

      if (oldTrack && oldTrack !== newTrack) {
        await oldTrack.unloadAsync().catch(() => {});
      }
    } catch (error) {
      if (!this.isPlayerMissingError(error)) {
        console.error(`Failed to play music: ${trackId}`, error);
      }
    }
  }

  private async crossfade(
    fromTrack: Audio.Sound,
    toTrack: Audio.Sound,
    duration: number,
    operationToken: number
  ): Promise<void> {
    this.isCrossfading = true;

    const targetVolume = this.calculateMusicVolume();
    const settings = audioManager.getSettings();

    if (settings.muted || settings.musicVolume === 0) {
      this.isCrossfading = false;
      return;
    }

    if (duration <= 0) {
      try {
        if (this.isOperationActive(operationToken)) {
          await toTrack.setVolumeAsync(targetVolume);
          await fromTrack.stopAsync().catch(() => {});
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
          await fromTrack.setVolumeAsync(targetVolume * (1 - progress));
          await toTrack.setVolumeAsync(targetVolume * progress);

          if (currentStep >= steps) {
            this.clearFadeInterval();
            this.isCrossfading = false;
            await fromTrack.stopAsync().catch(() => {});
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

  private async fadeIn(track: Audio.Sound, duration: number, operationToken: number): Promise<void> {
    const targetVolume = this.calculateMusicVolume();

    if (duration <= 0) {
      try {
        if (this.isOperationActive(operationToken)) {
          await track.setVolumeAsync(targetVolume);
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
      this.fadeInterval = setInterval(async () => {
        if (!this.isOperationActive(operationToken)) {
          this.clearFadeInterval();
          resolve();
          return;
        }

        currentStep += 1;
        const progress = currentStep / steps;

        try {
          await track.setVolumeAsync(targetVolume * progress);

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

  private async fadeOut(track: Audio.Sound, duration: number, operationToken: number): Promise<void> {
    let status;
    try {
      status = await track.getStatusAsync();
    } catch (error) {
      if (!this.isPlayerMissingError(error)) {
        console.error('Fade out error:', error);
      }
      return;
    }

    if (!status.isLoaded) return;

    const currentVolume = status.volume || 0;

    if (duration <= 0) {
      try {
        if (this.isOperationActive(operationToken)) {
          await track.stopAsync().catch(() => {});
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
          await track.setVolumeAsync(currentVolume * (1 - progress));

          if (currentStep >= steps) {
            this.clearFadeInterval();
            await track.stopAsync().catch(() => {});
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
    if (!this.currentTrack) return;

    try {
      const volume = this.calculateMusicVolume();
      await this.currentTrack.setVolumeAsync(volume);
    } catch (error) {
      if (this.isPlayerMissingError(error)) {
        this.currentTrack = null;
        this.currentTrackId = null;
        return;
      }
      console.error('Failed to update music volume:', error);
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
          await activeTrack.stopAsync().catch(() => {});
        }
        await activeTrack.unloadAsync().catch(() => {});
      }

      if (pendingTrack && pendingTrack !== activeTrack) {
        await pendingTrack.stopAsync().catch(() => {});
        await pendingTrack.unloadAsync().catch(() => {});
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
      await this.currentTrack.pauseAsync();
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
      await this.currentTrack.playAsync();
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
      await activeTrack.stopAsync().catch(() => {});
      await activeTrack.unloadAsync().catch(() => {});
    }

    if (pendingTrack && pendingTrack !== activeTrack) {
      await pendingTrack.stopAsync().catch(() => {});
      await pendingTrack.unloadAsync().catch(() => {});
    }

    console.log('Music Player disposed');
  }
}

export const musicPlayer = MusicPlayer.getInstance();
