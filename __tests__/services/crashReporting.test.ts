type CrashReportingModule = typeof import('../../src/services/crashReporting');

const mockRecordError = jest.fn();
const mockLog = jest.fn();
const mockCrashlyticsFactory = jest.fn(() => ({
  setUserId: jest.fn(),
  setAttribute: jest.fn(),
  setAttributes: jest.fn(),
  recordError: mockRecordError,
  log: mockLog,
  setCrashlyticsCollectionEnabled: jest.fn(),
}));

jest.mock('@react-native-firebase/crashlytics', () => ({
  __esModule: true,
  default: () => mockCrashlyticsFactory(),
}));

const mockLocalLogError = jest.fn();
jest.mock('../../src/utils/errorLogger', () => ({
  errorLogger: {
    logError: (...args: unknown[]) => mockLocalLogError(...args),
    logNonFatal: jest.fn(),
    logMessage: jest.fn(),
    setUserId: jest.fn(),
  },
}));

// Platform kontrolü modül yüklenirken yapılır; her test servisi taze yükler.
const loadFreshService = (): CrashReportingModule => {
  let service!: CrashReportingModule;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    service = require('../../src/services/crashReporting');
  });
  return service;
};

const originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');

const setBrowserLikeGlobals = (product: string) => {
  (globalThis as { window?: unknown }).window = globalThis;
  Object.defineProperty(globalThis, 'navigator', {
    value: { product },
    configurable: true,
    writable: true,
  });
};

const restoreGlobals = () => {
  delete (globalThis as { window?: unknown }).window;
  if (originalNavigator) {
    Object.defineProperty(globalThis, 'navigator', originalNavigator);
  } else {
    delete (globalThis as { navigator?: unknown }).navigator;
  }
};

describe('crashReportingService platform detection', () => {
  beforeEach(() => {
    mockRecordError.mockReset();
    mockLog.mockReset();
    mockCrashlyticsFactory.mockClear();
    mockLocalLogError.mockReset();
  });

  afterEach(() => {
    restoreGlobals();
  });

  it('treats React Native (which defines window and navigator) as native, not web', async () => {
    setBrowserLikeGlobals('ReactNative');
    const { crashReportingService } = loadFreshService();
    const error = new Error('render failed');

    await crashReportingService.logError(error, { phase: 'ErrorBoundary', action: 'Component crashed' });

    expect(crashReportingService.isEnabled()).toBe(true);
    expect(mockCrashlyticsFactory).toHaveBeenCalledTimes(1);
    expect(mockLog).toHaveBeenCalledWith(expect.stringContaining('ErrorBoundary'));
    expect(mockRecordError).toHaveBeenCalledWith(error);
    expect(mockLocalLogError).toHaveBeenCalledTimes(1);
  });

  it('is a safe no-op on web', async () => {
    setBrowserLikeGlobals('Gecko');
    const { crashReportingService } = loadFreshService();

    await crashReportingService.logError(new Error('render failed'));
    await crashReportingService.logNonFatal(new Error('minor'), 'context');

    expect(crashReportingService.isEnabled()).toBe(false);
    expect(mockCrashlyticsFactory).not.toHaveBeenCalled();
    expect(mockRecordError).not.toHaveBeenCalled();
    // Yerel kayıt web'de de çalışır.
    expect(mockLocalLogError).toHaveBeenCalledTimes(1);
  });
});
