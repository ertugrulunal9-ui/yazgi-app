const mockPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn().mockResolvedValue(undefined),
  remove: jest.fn(),
  addListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  volume: 1,
  loop: false,
  playing: false,
  isLoaded: true,
  currentTime: 0,
  duration: 0,
  muted: false,
  paused: false,
};

export const createAudioPlayer = jest.fn().mockReturnValue(mockPlayer);
export const setAudioModeAsync = jest.fn();
