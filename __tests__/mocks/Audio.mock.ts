export const Audio = {
  Sound: {
    createAsync: jest.fn().mockResolvedValue({
      sound: {
        playAsync: jest.fn(),
        stopAsync: jest.fn(),
        unloadAsync: jest.fn(),
        setVolumeAsync: jest.fn(),
        setIsLoopingAsync: jest.fn(),
      },
      status: { isLoaded: true },
    }),
  },
  setAudioModeAsync: jest.fn(),
};

export default Audio;
