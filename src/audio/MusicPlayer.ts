import { Audio } from 'expo-av';
import { audioManager } from './AudioManager';
import { getMusicForAge, getSoundDefinition } from './soundDefinitions';

class MusicPlayer {
  private static instance: MusicPlayer;
  
  private currentTrack: Audio.Sound | null = null;
  private currentTrackId: string | null = null;
  private nextTrack: Audio.Sound | null = null;
  private isCrossfading: boolean = false;
  private fadeInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): MusicPlayer {
    if (!MusicPlayer.instance) {
      MusicPlayer.instance = new MusicPlayer();
    }
    return MusicPlayer.instance;
  }

  // Play music track with crossfade
  async playMusic(trackId: string, crossfadeDuration: number = 2000): Promise<void> {
    // Already playing
    if (this.currentTrackId === trackId && this.currentTrack) {
      const status = await this.currentTrack.getStatusAsync();
      if (status.isLoaded && status.isPlaying) {
        return;
      }
    }

    // Stop if crossfading
    if (this.isCrossfading) {
      await this.stopCrossfade();
    }

    const definition = getSoundDefinition(trackId);
    if (!definition) {
      console.warn(`Music track not found: ${trackId}`);
      return;
    }

    try {
      // Load new track
      const { sound: newTrack } = await Audio.Sound.createAsync(
        definition.path,
        {
          volume: 0, // Start silent
          isLooping: definition.loop || false,
          shouldPlay: true,
        }
      );

      this.nextTrack = newTrack;

      // Crossfade if there's current track
      if (this.currentTrack) {
        await this.crossfade(this.currentTrack, this.nextTrack, crossfadeDuration);
      } else {
        // No crossfade, just fade in
        await this.fadeIn(this.nextTrack, crossfadeDuration / 2);
      }

      // Swap tracks
      const oldTrack = this.currentTrack;
      this.currentTrack = this.nextTrack;
      this.currentTrackId = trackId;
      this.nextTrack = null;

      // Cleanup old track
      if (oldTrack) {
        await oldTrack.unloadAsync().catch(() => {});
      }

    } catch (error) {
      console.error(`Failed to play music: ${trackId}`, error);
    }
  }

  // Crossfade between two tracks
  private async crossfade(
    fromTrack: Audio.Sound,
    toTrack: Audio.Sound,
    duration: number
  ): Promise<void> {
    this.isCrossfading = true;

    const targetVolume = this.calculateMusicVolume();
    const settings = audioManager.getSettings();

    // Skip crossfade if music is muted
    if (settings.muted || settings.musicVolume === 0) {
      this.isCrossfading = false;
      return Promise.resolve();
    }

    const steps = 50;
    const stepDuration = duration / steps;

    return new Promise((resolve) => {
      let currentStep = 0;

      this.fadeInterval = setInterval(async () => {
        currentStep++;
        const progress = currentStep / steps;

        try {
          // Fade out old track
          await fromTrack.setVolumeAsync(targetVolume * (1 - progress));
          
          // Fade in new track
          await toTrack.setVolumeAsync(targetVolume * progress);

          if (currentStep >= steps) {
            if (this.fadeInterval) {
              clearInterval(this.fadeInterval);
              this.fadeInterval = null;
            }
            this.isCrossfading = false;
            
            // Stop old track
            await fromTrack.stopAsync();
            
            resolve();
          }
        } catch (error) {
          console.error('Crossfade error:', error);
          if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
          }
          this.isCrossfading = false;
          resolve();
        }
      }, stepDuration);
    });
  }

  // Fade in track
  private async fadeIn(track: Audio.Sound, duration: number): Promise<void> {
    const targetVolume = this.calculateMusicVolume();
    const steps = 30;
    const stepDuration = duration / steps;

    return new Promise((resolve) => {
      let currentStep = 0;

      const interval = setInterval(async () => {
        currentStep++;
        const progress = currentStep / steps;

        try {
          await track.setVolumeAsync(targetVolume * progress);

          if (currentStep >= steps) {
            clearInterval(interval);
            resolve();
          }
        } catch (error) {
          console.error('Fade in error:', error);
          clearInterval(interval);
          resolve();
        }
      }, stepDuration);
    });
  }

  // Fade out track
  private async fadeOut(track: Audio.Sound, duration: number): Promise<void> {
    const status = await track.getStatusAsync();
    if (!status.isLoaded) return;

    const currentVolume = status.volume || 0;
    const steps = 30;
    const stepDuration = duration / steps;

    return new Promise((resolve) => {
      let currentStep = 0;

      const interval = setInterval(async () => {
        currentStep++;
        const progress = currentStep / steps;

        try {
          await track.setVolumeAsync(currentVolume * (1 - progress));

          if (currentStep >= steps) {
            clearInterval(interval);
            await track.stopAsync();
            resolve();
          }
        } catch (error) {
          console.error('Fade out error:', error);
          clearInterval(interval);
          resolve();
        }
      }, stepDuration);
    });
  }

  // Stop crossfade immediately
  private async stopCrossfade(): Promise<void> {
    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
    this.isCrossfading = false;
  }

  // Calculate music volume based on settings
  private calculateMusicVolume(): number {
    const settings = audioManager.getSettings();
    if (settings.muted) return 0;
    return settings.masterVolume * settings.musicVolume * 0.6; // 0.6 is base music volume
  }

  // Update volume on settings change
  async updateVolume(): Promise<void> {
    if (!this.currentTrack) return;

    try {
      const volume = this.calculateMusicVolume();
      await this.currentTrack.setVolumeAsync(volume);
    } catch (error) {
      console.error('Failed to update music volume:', error);
    }
  }

  // Stop current music
  async stop(fadeDuration: number = 1000): Promise<void> {
    if (!this.currentTrack) return;

    try {
      if (fadeDuration > 0) {
        await this.fadeOut(this.currentTrack, fadeDuration);
      } else {
        await this.currentTrack.stopAsync();
      }
      
      await this.currentTrack.unloadAsync();
      this.currentTrack = null;
      this.currentTrackId = null;
    } catch (error) {
      console.error('Failed to stop music:', error);
    }
  }

  // Pause current music
  async pause(): Promise<void> {
    if (!this.currentTrack) return;

    try {
      await this.currentTrack.pauseAsync();
    } catch (error) {
      console.error('Failed to pause music:', error);
    }
  }

  // Resume current music
  async resume(): Promise<void> {
    if (!this.currentTrack) return;

    try {
      await this.currentTrack.playAsync();
    } catch (error) {
      console.error('Failed to resume music:', error);
    }
  }

  // Play music based on game age
  async playMusicForAge(age: number, isGameOver: boolean = false): Promise<void> {
    const trackId = getMusicForAge(age, isGameOver);
    await this.playMusic(trackId);
  }

  // Get current track ID
  getCurrentTrackId(): string | null {
    return this.currentTrackId;
  }

  // Cleanup
  async dispose(): Promise<void> {
    await this.stopCrossfade();
    
    if (this.currentTrack) {
      await this.currentTrack.unloadAsync().catch(() => {});
      this.currentTrack = null;
      this.currentTrackId = null;
    }

    if (this.nextTrack) {
      await this.nextTrack.unloadAsync().catch(() => {});
      this.nextTrack = null;
    }

    console.log('🎵 Music Player disposed');
  }
}

export const musicPlayer = MusicPlayer.getInstance();
