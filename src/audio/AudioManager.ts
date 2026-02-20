import { Audio, AVPlaybackStatus } from 'expo-av';
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
  sound: Audio.Sound;
  definition: SoundDefinition;
  isPlaying: boolean;
  lastPlayedAt: number;
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
  private activeSounds: Set<Audio.Sound> = new Set();
  private initialized: boolean = false;

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

    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load settings
      await this.loadSettings();

      // Preload sounds
      await this.preloadSounds();

      this.initialized = true;
      console.log('🔊 Audio Manager initialized');
    } catch (error) {
      console.error('Audio initialization failed:', error);
    }
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
  private async loadSound(definition: SoundDefinition): Promise<Audio.Sound> {
    try {
      // Check if sound path is null or undefined
      if (!definition.path) {
        throw new Error(`Sound path is null for: ${definition.id}`);
      }

      const { sound } = await Audio.Sound.createAsync(
        definition.path,
        {
          volume: this.calculateVolume(definition),
          isLooping: definition.loop || false,
          shouldPlay: false,
        }
      );

      const instance: SoundInstance = {
        sound,
        definition,
        isPlaying: false,
        lastPlayedAt: 0,
      };

      // Add to pool
      const pool = this.soundPool.get(definition.id) || [];
      pool.push(instance);
      this.soundPool.set(definition.id, pool);

      return sound;
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
      await instance.sound.stopAsync();
      await instance.sound.setPositionAsync(0);
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
      // Update volume
      await instance.sound.setVolumeAsync(this.calculateVolume(instance.definition));
      
      // Reset to start
      await instance.sound.setPositionAsync(0);
      
      // Play
      await instance.sound.playAsync();
      
      instance.isPlaying = true;
      instance.lastPlayedAt = Date.now();
      this.activeSounds.add(instance.sound);

      // Auto-cleanup on finish
      instance.sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (status.isLoaded && status.didJustFinish) {
          instance.isPlaying = false;
          this.activeSounds.delete(instance.sound);
        }
      });
    } catch {
      // Silent fail - sound files may not exist yet
    }
  }

  // Update volume for all active sounds
  private async updateAllVolumes(): Promise<void> {
    const updatePromises: Promise<any>[] = [];

    this.soundPool.forEach((instances) => {
      instances.forEach((instance) => {
        const promise = instance.sound.setVolumeAsync(
          this.calculateVolume(instance.definition)
        );
        updatePromises.push(promise);
      });
    });

    await Promise.allSettled(updatePromises);
  }

  // Settings management
  async setMasterVolume(volume: number): Promise<void> {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    await this.updateAllVolumes();
    await this.saveSettings();
  }

  async setMusicVolume(volume: number): Promise<void> {
    this.settings.musicVolume = Math.max(0, Math.min(1, volume));
    await this.updateAllVolumes();
    await this.saveSettings();
  }

  async setSFXVolume(volume: number): Promise<void> {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    await this.updateAllVolumes();
    await this.saveSettings();
  }

  async setMuted(muted: boolean): Promise<void> {
    this.settings.muted = muted;
    await this.updateAllVolumes();
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
    const disposePromises: Promise<any>[] = [];

    this.soundPool.forEach((instances) => {
      instances.forEach((instance) => {
        disposePromises.push(
          instance.sound.unloadAsync().catch(() => {})
        );
      });
    });

    await Promise.allSettled(disposePromises);
    
    this.soundPool.clear();
    this.activeSounds.clear();
    this.initialized = false;
    
    console.log('🔇 Audio Manager disposed');
  }
}

export const audioManager = AudioManager.getInstance();
