type RemoteScenario = {
  incidentMode?: boolean;
  flags?: Partial<Record<string, boolean>>;
};

const createRemoteConfigMock = (scenario: RemoteScenario = {}) => {
  const getValue = jest.fn((key: string) => ({
    asBoolean: () => {
      if (key === '_incident_mode') {
        return scenario.incidentMode ?? false;
      }
      return scenario.flags?.[key] ?? false;
    },
  }));

  const remoteConfigInstance = {
    setDefaults: jest.fn(async () => undefined),
    setConfigSettings: jest.fn(async () => undefined),
    fetchAndActivate: jest.fn(async () => true),
    getValue,
  };

  return {
    remoteConfigFactory: jest.fn(() => remoteConfigInstance),
    remoteConfigInstance,
  };
};

const loadFeatureFlagsModule = async (
  isDev: boolean,
  scenario?: RemoteScenario
) => {
  jest.resetModules();
  (global as typeof globalThis & { __DEV__?: boolean }).__DEV__ = isDev;

  const asyncStorageMock = require('../mocks/AsyncStorage.mock').default;
  asyncStorageMock.__CLEAR__();

  if (scenario) {
    const { remoteConfigFactory, remoteConfigInstance } = createRemoteConfigMock(scenario);
    jest.doMock('@react-native-firebase/remote-config', () => ({
      default: remoteConfigFactory,
    }));

    const featureFlags = await import('../../src/config/featureFlags');
    return { featureFlags, remoteConfigInstance, asyncStorageMock };
  }

  jest.doMock('@react-native-firebase/remote-config', () => ({}));
  const featureFlags = await import('../../src/config/featureFlags');
  return { featureFlags, remoteConfigInstance: null, asyncStorageMock };
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

describe('featureFlags', () => {
  afterEach(() => {
    restoreGlobals();
  });

  it('treats React Native (which defines window and navigator) as native, not web', async () => {
    setBrowserLikeGlobals('ReactNative');
    const { featureFlags, remoteConfigInstance } = await loadFeatureFlagsModule(false, {
      flags: { PARTIAL_ENERGY_RECOVERY: true },
    });

    await featureFlags.initializeFeatureFlags();

    expect(remoteConfigInstance?.fetchAndActivate).toHaveBeenCalled();
    expect(featureFlags.isFeatureEnabled('PARTIAL_ENERGY_RECOVERY')).toBe(true);
  });

  it('keeps local defaults on web without touching remote config', async () => {
    setBrowserLikeGlobals('Gecko');
    const { featureFlags, remoteConfigInstance } = await loadFeatureFlagsModule(false, {
      flags: { PARTIAL_ENERGY_RECOVERY: true },
    });

    await featureFlags.initializeFeatureFlags();

    expect(remoteConfigInstance?.fetchAndActivate).not.toHaveBeenCalled();
    expect(featureFlags.isFeatureEnabled('PARTIAL_ENERGY_RECOVERY')).toBe(false);
  });

  it('applies remote config values when available', async () => {
    const { featureFlags, remoteConfigInstance } = await loadFeatureFlagsModule(false, {
      incidentMode: false,
      flags: {
        PARTIAL_ENERGY_RECOVERY: true,
        MICRO_GOALS: false,
      },
    });

    await featureFlags.initializeFeatureFlags();

    expect(featureFlags.isFeatureEnabled('PARTIAL_ENERGY_RECOVERY')).toBe(true);
    expect(featureFlags.isFeatureEnabled('MICRO_GOALS')).toBe(false);
    expect(featureFlags.isFeatureEnabled('VARIETY_BONUS')).toBe(false);
    expect(remoteConfigInstance?.setConfigSettings).toHaveBeenCalledWith({
      minimumFetchIntervalMillis: 300000,
      fetchTimeMillis: 5000,
    });
    expect(remoteConfigInstance?.setConfigSettings).toHaveBeenCalledWith({
      minimumFetchIntervalMillis: 43200000,
    });
  });

  it('keeps dev overrides above remote values', async () => {
    const { featureFlags } = await loadFeatureFlagsModule(true, {
      incidentMode: false,
      flags: {
        PARTIAL_ENERGY_RECOVERY: false,
      },
    });

    await featureFlags.initializeFeatureFlags();
    await featureFlags.setDevFeatureFlagOverride('PARTIAL_ENERGY_RECOVERY', true);
    await featureFlags.refreshFeatureFlags({ force: true });

    expect(featureFlags.isFeatureEnabled('PARTIAL_ENERGY_RECOVERY')).toBe(true);
  });

  it('falls back to local defaults when remote config is unavailable', async () => {
    const { featureFlags } = await loadFeatureFlagsModule(false);

    await featureFlags.initializeFeatureFlags();

    expect(featureFlags.getFeatureFlagsSnapshot()).toEqual({
      PARTIAL_ENERGY_RECOVERY: false,
      VARIETY_BONUS: false,
      REPETITION_PENALTY: false,
      CONSUMABLE_ITEMS: false,
      CAREER_PATH_ACTIONS: false,
      LEGACY_PERKS: false,
      MILESTONE_SUMMARY: true,
      CHAPTER_SYSTEM: true,
      PERMANENT_FLAGS: false,
      FATE_TRANSPARENCY: true,
      ECONOMY_DEPTH: true,
      MICRO_GOALS: true,
      NPC_RICH_FEEDBACK: true,
      UNDO_MECHANIC: true,
      PREMIUM_SUBSCRIPTION: false,
    });
  });
});
