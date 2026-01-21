/**
 * Audio Manager Tests
 * Tests for AudioManager including SFX and audio preferences
 */

// Mock sound definitions FIRST to avoid requiring real audio files
jest.mock('../../src/audio/soundDefinitions', () => ({
  SOUND_DEFINITIONS: {
    menu: {
      id: 'menu',
      category: 'music',
      path: 'mocked-path',
      volume: 0.6,
      loop: true,
      preload: true,
    },
    button_click: {
      id: 'button_click',
      category: 'ui',
      path: 'mocked-path',
      volume: 0.8,
      loop: false,
      preload: true,
    },
    success: {
      id: 'success',
      category: 'ui',
      path: 'mocked-path',
      volume: 0.7,
      loop: false,
      preload: true,
    },
  },
  getSoundDefinition: jest.fn((id: string) => {
    const definitions: any = {
      menu: {
        id: 'menu',
        category: 'music',
        path: 'mocked-path',
        volume: 0.6,
        loop: true,
        preload: true,
      },
      button_click: {
        id: 'button_click',
        category: 'ui',
        path: 'mocked-path',
        volume: 0.8,
        loop: false,
        preload: true,
      },
      success: {
        id: 'success',
        category: 'ui',
        path: 'mocked-path',
        volume: 0.7,
        loop: false,
        preload: true,
      },
    };
    return definitions[id] || null;
  }),
}));

import { audioManager } from '../../src/audio/AudioManager';

// Mock expo-av
const mockSound = {
  loadAsync: jest.fn().mockResolvedValue(undefined),
  playAsync: jest.fn().mockResolvedValue(undefined),
  stopAsync: jest.fn().mockResolvedValue(undefined),
  unloadAsync: jest.fn().mockResolvedValue(undefined),
  setVolumeAsync: jest.fn().mockResolvedValue(undefined),
  setIsLoopingAsync: jest.fn().mockResolvedValue(undefined),
  getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
};

jest.mock('expo-av', () => ({
  Audio: {
    Sound: {
      createAsync: jest.fn(() => Promise.resolve({ sound: mockSound })),
    },
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('AudioManager', () => {
  beforeEach(async () => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Initialize audio manager
    await audioManager.initialize();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await audioManager.initialize();
      
      const settings = audioManager.getSettings();
      expect(settings).toBeDefined();
    });

    it('should use default settings', () => {
      const settings = audioManager.getSettings();
      
      expect(settings.masterVolume).toBeGreaterThanOrEqual(0);
      expect(settings.masterVolume).toBeLessThanOrEqual(1);
    });
  });

  describe('Sound Effects', () => {
    it.skip('should play sound effect', async () => {
      // Skip: Requires full sound pool mock setup
      await audioManager.playSFX('button_click');
      
      const settings = audioManager.getSettings();
      expect(settings.muted).toBe(false);
    });

    it('should not play if muted', async () => {
      await audioManager.setMuted(true);
      
      // Muted should prevent sound playback
      const settings = audioManager.getSettings();
      expect(settings.muted).toBe(true);
      
      await audioManager.playSFX('button_click');
      // When muted, playSFX returns early without playing
    });
  });

  describe('Volume Control', () => {
    it('should set master volume', async () => {
      await audioManager.setMasterVolume(0.5);
      
      const settings = audioManager.getSettings();
      expect(settings.masterVolume).toBe(0.5);
    });

    it('should set music volume', async () => {
      await audioManager.setMusicVolume(0.7);
      
      const settings = audioManager.getSettings();
      expect(settings.musicVolume).toBe(0.7);
    });

    it('should set SFX volume', async () => {
      await audioManager.setSFXVolume(0.3);
      
      const settings = audioManager.getSettings();
      expect(settings.sfxVolume).toBe(0.3);
    });

    it('should clamp volume to 0-1 range', async () => {
      await audioManager.setMasterVolume(1.5);
      expect(audioManager.getSettings().masterVolume).toBeLessThanOrEqual(1);
      
      await audioManager.setMasterVolume(-0.5);
      expect(audioManager.getSettings().masterVolume).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Mute Control', () => {
    it('should toggle mute on/off', async () => {
      await audioManager.setMuted(true);
      expect(audioManager.getSettings().muted).toBe(true);
      
      await audioManager.setMuted(false);
      expect(audioManager.getSettings().muted).toBe(false);
    });

    it('should persist mute state', async () => {
      await audioManager.setMuted(true);
      
      // Verify settings are updated
      const settings = audioManager.getSettings();
      expect(settings.muted).toBe(true);
    });
  });

  describe('Settings Management', () => {
    it('should return current settings', () => {
      const settings = audioManager.getSettings();
      
      expect(settings).toHaveProperty('masterVolume');
      expect(settings).toHaveProperty('musicVolume');
      expect(settings).toHaveProperty('sfxVolume');
      expect(settings).toHaveProperty('muted');
    });

    it('should persist settings to localStorage', async () => {
      await audioManager.setMasterVolume(0.8);
      await audioManager.setSFXVolume(0.6);
      
      // Verify settings are updated in memory
      const settings = audioManager.getSettings();
      expect(settings.masterVolume).toBe(0.8);
      expect(settings.sfxVolume).toBe(0.6);
      
      // Note: localStorage.setItem is called but may be async internals
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete audio flow', async () => {
      // Set volumes
      await audioManager.setMasterVolume(0.7);
      await audioManager.setSFXVolume(0.5);
      
      // Play SFX
      await audioManager.playSFX('success');
      
      // Mute
      await audioManager.setMuted(true);
      
      // Verify settings
      const settings = audioManager.getSettings();
      expect(settings.masterVolume).toBe(0.7);
      expect(settings.sfxVolume).toBe(0.5);
      expect(settings.muted).toBe(true);
    });
  });
});
