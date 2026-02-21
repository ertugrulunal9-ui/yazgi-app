import { createAudioPlayer, setAudioModeAsync, AudioPlayer } from 'expo-audio';
import { SoundDefinition, ALL_SOUNDS, getSoundDefinition } from './soundDefinitions';

const STORAGE_KEY = '@yazgi/audio_settings/v1';
const MAX_CONCURRENT_SOUNDS = 3;

interface AudioSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
}

interface SoundInstance {
  sound: AudioPlayer;
  definition: SoundDefinition;
  isPlaying: boolean;
  lastPlayedAt: number;
  subscription: { remove: () => void } | null;
}

class AudioManager {
  private static instance: AudioManager;

  private settings: AudioSettings = {
    masterVolume: 0.7,
    musicVolume: 0.8,
    sfxVolume: 0.8,
    muted: false,
  };

  private soundPool: Map<string, SoundInstance[]> = new Map();
  private activeSounds: Set<AudioPlayer> = new Set();
  private initialized: boolean = false;
  private initializePromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  // Initialize audio system
  async initialize(): Promise<void> {
    if (this.initialized) return;
    if (this.initializePromise) {
      await this.initializePromise;
      return;
    }

    this.initializePromise = (async () => {
      try {
        // Configure audio mode
        await setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
          shouldRouteThroughEarpiece: false,
        });

        // Load settings
        await this.loadSettings();

        // Preload sounds
        await this.preloadSounds();

        this.initialized = true;
      } catch (error) {
        console.error('Audio initialization failed:', error);
      } finally {
        this.initializePromise = null;
      }
    })();

    await this.initializePromise;
  }

  // Preload essential sounds
  private async preloadSounds(): Promise<void> {
    const toPreload = ALL_SOUNDS.filter(s => s.preload);

    const promises = toPreload.map(async (def) => {
      try {
        await this.loadSound(def);
      } catch {
        // Silent fail - sound files may not exist yet
      }
    });

    await Promise.allSettled(promises);
  }

  // Load sound into pool
  private async loadSound(definition: SoundDefinition): Promise<AudioPlayer> {
    try {
      // Check if sound path is null or undefined
      if (!definition.path) {
        throw new Error(`Sound path is null for: ${definition.id}`);
      }

      const player = createAudioPlayer(definition.path);
      player.volume = this.calculateVolume(definition);
      player.loop = definition.loop || false;

      const instance: SoundInstance = {
        sound: player,
        definition,
        isPlaying: false,
        lastPlayedAt: 0,
        subscription: null,
      };

      // Add to pool
      const pool = this.soundPool.get(definition.id) || [];
      pool.push(instance);
      this.soundPool.set(definition.id, pool);

      return player;
    } catch (error) {
      // Silent fail - sound files may not exist yet
      throw error;
    }
  }

  // Get or create sound instance
  private async getSoundInstance(soundId: string): Promise<SoundInstance | null> {
    const definition = getSoundDefinition(soundId);
    if (!definition) {
      return null;
    }

    // Get from pool
    let pool = this.soundPool.get(soundId) || [];

    // Find available instance
    let instance = pool.find(i => !i.isPlaying);

    // Create new if needed (up to pool limit)
    if (!instance && pool.length < 3) {
      try {
        await this.loadSound(definition);
        pool = this.soundPool.get(soundId) || [];
        instance = pool[pool.length - 1]; // Last added
      } catch {
        return null;
      }
    }

    // Force reuse oldest if pool full
    if (!instance) {
      if (pool.length === 0) {
        return null;
      }
      instance = pool.reduce((oldest, current) =>
        current.lastPlayedAt < oldest.lastPlayedAt ? current : oldest
      );
      instance.sound.pause();
      await instance.sound.seekTo(0);
    }

    return instance;
  }

  // Calculate effective volume
  private calculateVolume(definition: SoundDefinition): number {
    if (this.settings.muted) return 0;

    const baseVolume = definition.volume ?? 1;
    const categoryVolume = definition.category === 'music'
      ? this.settings.musicVolume
      : this.settings.sfxVolume;

    return baseVolume * categoryVolume * this.settings.masterVolume;
  }

  // Play sound effect
  async playSFX(soundId: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    if (this.settings.muted) return;

    // Respect concurrent limit
    if (this.activeSounds.size >= MAX_CONCURRENT_SOUNDS) {
      return;
    }

    const instance = await this.getSoundInstance(soundId);
    if (!instance) return;

    try {
      // Update volume (sync setter)
      instance.sound.volume = this.calculateVolume(instance.definition);

      // Reset to start (async, in seconds)
      await instance.sound.seekTo(0);

      // Play
      instance.sound.play();

      instance.isPlaying = true;
      instance.lastPlayedAt = Date.now();
      this.activeSounds.add(instance.sound);

      // Remove any existing listener to avoid duplicates
      if (instance.subscription) {
        instance.subscription.remove();
        instance.subscription = null;
      }

      // Auto-cleanup on finish
      instance.subscription = instance.sound.addListener('playbackStatusUpdate', (status) => {
        if (status.didJustFinish) {
          instance.isPlaying = false;
          this.activeSounds.delete(instance.sound);
          if (instance.subscription) {
            instance.subscription.remove();
            instance.subscription = null;
          }
        }
      });
    } catch {
      // Silent fail - sound files may not exist yet
    }
  }

  // Update volume for all active sounds (now synchronous)
  private updateAllVolumes(): void {
    this.soundPool.forEach((instances) => {
      instances.forEach((instance) => {
        instance.sound.volume = this.calculateVolume(instance.definition);
      });
    });
  }

  // Settings management
  async setMasterVolume(volume: number): Promise<void> {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    await this.saveSettings();
  }

  async setMusicVolume(volume: number): Promise<void> {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    await this.saveSettings();
  }

  async setSFXVolume(volume: number): Promise<void> {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    await this.saveSettings();
  }

  async setMuted(muted: boolean): Promise<void> {
    this.settings.muted = muted;
    this.updateAllVolumes();
    await this.saveSettings();
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  // Persist settings
  private async saveSettings(): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      } else {
        const AsyncStorage = await this.getAsyncStorage();
        if (AsyncStorage) {
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        }
      }
    } catch (error) {
      console.error('Failed to save audio settings:', error);
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      let data: string | null = null;

      if (typeof localStorage !== 'undefined') {
        data = localStorage.getItem(STORAGE_KEY);
      } else {
        const AsyncStorage = await this.getAsyncStorage();
        if (AsyncStorage) {
          data = await AsyncStorage.getItem(STORAGE_KEY);
        }
      }

      if (data) {
        this.settings = { ...this.settings, ...JSON.parse(data) };
      }
    } catch (error) {
      console.error('Failed to load audio settings:', error);
    }
  }

  private async getAsyncStorage(): Promise<any> {
    try {
      const mod = await import('@react-native-async-storage/async-storage');
      return (mod as any).default ?? mod;
    } catch {
      return null;
    }
  }

  // Cleanup
  async dispose(): Promise<void> {
    this.initializePromise = null;

    this.soundPool.forEach((instances) => {
      instances.forEach((instance) => {
        if (instance.subscription) {
          instance.subscription.remove();
          instance.subscription = null;
        }
        try {
          instance.sound.remove();
        } catch {
          // ignore
        }
      });
    });

    this.soundPool.clear();
    this.activeSounds.clear();
    this.initialized = false;
  }
}

export const audioManager = AudioManager.getInstance();

