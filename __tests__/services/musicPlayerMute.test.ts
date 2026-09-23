/**
 * MusicPlayer mute behavior tests
 * Ensures muting during an active fade-in does not restore volume.
 */

jest.mock('../../src/audio/soundDefinitions', () => {
  const menuTrack = {
    id: 'menu',
    category: 'music',
    path: 'mocked-menu-path',
    volume: 1,
    loop: true,
    preload: false,
  };

  return {
    ALL_SOUNDS: [],
    getSoundDefinition: jest.fn((id: string) => (id === 'menu' ? menuTrack : null)),
    getMusicForAge: jest.fn(() => 'menu'),
  };
});

jest.mock('expo-audio', () => {
  const players: any[] = [];

  return {
    createAudioPlayer: jest.fn(() => {
      let currentVolume = 1;

      const player = {
        play: jest.fn(),
        pause: jest.fn(),
        seekTo: jest.fn().mockResolvedValue(undefined),
        remove: jest.fn(),
        addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
        loop: false,
        playing: false,
        isLoaded: true,
        get volume() {
          return currentVolume;
        },
        set volume(value: number) {
          currentVolume = value;
        },
      };

      players.push(player);
      return player;
    }),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
    __players: players,
  };
});

import { audioManager } from '../../src/audio/AudioManager';
import { musicPlayer } from '../../src/audio/MusicPlayer';

describe('MusicPlayer mute behavior', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    localStorage.clear();
    jest.clearAllMocks();

    const expoAudio = jest.requireMock('expo-audio') as { __players: any[] };
    expoAudio.__players.length = 0;

    await musicPlayer.dispose();
    await audioManager.dispose();
    await audioManager.initialize();
    await audioManager.setMasterVolume(1);
    await audioManager.setMusicVolume(1);
    await audioManager.setMuted(false);
  });

  afterEach(async () => {
    await musicPlayer.dispose();
    await audioManager.dispose();
    jest.useRealTimers();
  });

  it('keeps track volume at zero when muted during fade-in', async () => {
    const playPromise = musicPlayer.playMusic('menu', 2000);

    // Allow fade-in to begin before muting.
    jest.advanceTimersByTime(150);
    await Promise.resolve();

    await audioManager.setMuted(true);
    await musicPlayer.updateVolume();

    jest.runAllTimers();
    await playPromise;

    const expoAudio = jest.requireMock('expo-audio') as { __players: Array<{ volume: number }> };
    expect(expoAudio.__players.length).toBeGreaterThan(0);
    expect(expoAudio.__players[expoAudio.__players.length - 1].volume).toBe(0);
  });
});
