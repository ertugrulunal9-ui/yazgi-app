// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('./mocks/AsyncStorage.mock')
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

jest.mock('expo-constants', () => ({
  manifest: {},
}));

// Mock React Native
jest.mock('react-native', () => require('./mocks/ReactNative.mock'));

//Mock React Native Safe Area Context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
}));

// Missing module stubs (balanceContract, familyNarrative, onboardingGuidance)
// are handled via moduleNameMapper in jest.config.js

// Selectively suppress known noisy warnings, but keep real errors visible
const originalWarn = console.warn;
const originalError = console.error;

global.console = {
  ...console,
  warn: (...args: any[]) => {
    // Suppress known React Native / Expo noise
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (
      msg.includes('Animated:') ||
      msg.includes('NativeModule') ||
      msg.includes('Require cycle') ||
      msg.includes('ViewPropTypes')
    ) {
      return;
    }
    originalWarn(...args);
  },
  error: (...args: any[]) => {
    // Suppress known test environment noise
    const msg = typeof args[0] === 'string' ? args[0] : '';
    if (
      msg.includes('NativeModule') ||
      msg.includes('Invariant Violation') ||
      msg.includes('not wrapped in act')
    ) {
      return;
    }
    originalError(...args);
  },
};

// Set up fake timers
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});
