// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('./mocks/AsyncStorage.mock')
);
jest.mock('expo-secure-store', () =>
  require('./mocks/SecureStore.mock')
);

// Mock localStorage for browser-based tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();

global.localStorage = localStorageMock as Storage;

// React Native global
(global as typeof global & { __DEV__?: boolean }).__DEV__ = false;

// Mock Firebase/Analytics
jest.mock('../src/services/analytics', () =>
  require('./mocks/Firebase.mock')
);

// Mock Audio
jest.mock('expo-av', () => require('./mocks/Audio.mock'));

// Mock Expo modules
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  selectionAsync: jest.fn(),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

jest.mock('react-native-qrcode-svg', () => 'QRCode');

jest.mock('expo-constants', () => ({
  manifest: {},
}));

// Mock React Native
jest.mock('react-native', () => require('./mocks/ReactNative.mock'));

//Mock React Native Safe Area Context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));

// Suppress console warnings in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Set up fake timers
beforeEach(() => {
  jest.clearAllMocks();
  const secureStore = require('./mocks/SecureStore.mock').default;
  secureStore.__CLEAR__();
});

afterEach(() => {
  jest.useRealTimers();
});

afterAll(async () => {
  try {
    const [{ audioManager }, { musicPlayer }] = await Promise.all([
      import('../src/audio/AudioManager'),
      import('../src/audio/MusicPlayer'),
    ]);

    await musicPlayer.dispose();
    await audioManager.dispose();
  } catch {
    // Test environment might not initialize audio modules in every suite.
  }
});
