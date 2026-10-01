jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: () => mockNativeAnalytics,
}));

const receivedEvents: string[] = [];
const mockNativeAnalytics = {
  logEvent: jest.fn(async (name: string) => { receivedEvents.push(name); }),
  setAnalyticsCollectionEnabled: jest.fn(async (_enabled: boolean) => {}),
  setUserId: jest.fn(async () => {}),
  setUserProperty: jest.fn(async () => {}),
  resetAnalyticsData: jest.fn(async () => {}),
};

function loadAnalyticsService(): typeof import('../../src/services/analytics').analyticsService {
  let service: typeof import('../../src/services/analytics').analyticsService;
  jest.isolateModules(() => {
    service = jest.requireActual('../../src/services/analytics').analyticsService;
  });
  return service!;
}

function pendingOptIn() {
  let markStarted!: () => void;
  let complete!: () => void;
  const started = new Promise<void>(resolve => { markStarted = resolve; });
  const completed = new Promise<void>(resolve => { complete = resolve; });
  mockNativeAnalytics.setAnalyticsCollectionEnabled.mockImplementation(async enabled => {
    if (enabled) {
      markStarted();
      await completed;
    }
  });
  return { started, complete };
}

describe('analytics consent at the native boundary', () => {
  beforeEach(() => {
    receivedEvents.length = 0;
    mockNativeAnalytics.setAnalyticsCollectionEnabled.mockImplementation(async () => {});
  });

  it('waits for native opt-in before submitting the opening event', async () => {
    const optIn = pendingOptIn();
    const service = loadAnalyticsService();
    service.setEnabled(true);
    const logging = service.logCustomEvent('app_open');
    await optIn.started;
    try {
      expect(receivedEvents).toEqual([]);
    } finally {
      optIn.complete();
      await logging;
    }
    expect(receivedEvents).toEqual(['app_open']);
  });

  it('drops an event waiting for opt-in when consent is revoked', async () => {
    const optIn = pendingOptIn();
    const service = loadAnalyticsService();
    service.setEnabled(true);
    const logging = service.logCustomEvent('app_open');
    await optIn.started;
    service.setEnabled(false);
    optIn.complete();
    await logging;
    expect(receivedEvents).toEqual([]);
  });

  it('does not submit custom events without opt-in', async () => {
    const service = loadAnalyticsService();
    await service.logCustomEvent('quick_start');
    expect(receivedEvents).toEqual([]);
  });
});
