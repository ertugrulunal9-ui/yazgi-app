type LoadOptions = {
  premiumEnabled?: boolean;
  killSwitch?: boolean;
  purchasesEnabled?: boolean;
  restoreEnabled?: boolean;
  initialPremium?: boolean;
  apiKeySource?: 'env' | 'env_api_alias' | 'config' | 'none' | 'placeholder';
  revenueCatAvailable?: boolean;
  purchaseOutcome?: 'success' | 'cancelled' | 'no_entitlement' | 'network_error';
  restoreOutcome?: 'success' | 'no_active' | 'network_error';
};

const PRODUCT_ID = 'yazgi_premium_monthly';

const clearPremiumEnv = () => {
  delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY;
  delete process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
  delete process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY;
  delete process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
  delete process.env.EXPO_PUBLIC_PREMIUM_KILL_SWITCH;
  delete process.env.EXPO_PUBLIC_PREMIUM_PURCHASES_ENABLED;
  delete process.env.EXPO_PUBLIC_PREMIUM_RESTORE_ENABLED;
};

const createPurchasesMock = (options: LoadOptions = {}) => {
  const initialEntitlements = options.initialPremium
    ? { premium: { expirationDate: '2099-01-01' } }
    : {};

  const packages = [
    {
      identifier: PRODUCT_ID,
      packageType: 'MONTHLY',
      product: {
        identifier: PRODUCT_ID,
        title: 'Monthly Premium',
        description: 'Desc',
        priceString: '$2.99',
      },
    },
  ];

  const purchasePackage = jest.fn(async () => {
    if (options.purchaseOutcome === 'cancelled') {
      throw { userCancelled: true };
    }
    if (options.purchaseOutcome === 'network_error') {
      throw new Error('Network request failed');
    }
    if (options.purchaseOutcome === 'no_entitlement') {
      return { customerInfo: { entitlements: { active: {} } } };
    }
    return { customerInfo: { entitlements: { active: { premium: { expirationDate: '2099-01-01' } } } } };
  });

  const restorePurchases = jest.fn(async () => {
    if (options.restoreOutcome === 'network_error') {
      throw new Error('Network unavailable');
    }
    if (options.restoreOutcome === 'no_active') {
      return { entitlements: { active: {} } };
    }
    return { entitlements: { active: { premium: { expirationDate: '2099-01-01' } } } };
  });

  return {
    configure: jest.fn(async () => undefined),
    addCustomerInfoUpdateListener: jest.fn(() => undefined),
    getCustomerInfo: jest.fn(async () => ({ entitlements: { active: initialEntitlements } })),
    getOfferings: jest.fn(async () => ({
      current: {
        availablePackages: packages,
      },
    })),
    purchasePackage,
    restorePurchases,
  };
};

const loadSubscriptionManager = async (options: LoadOptions = {}) => {
  jest.resetModules();
  clearPremiumEnv();

  const premiumEnabled = options.premiumEnabled ?? true;

  const apiKeySource = options.apiKeySource ?? 'none';
  if (apiKeySource === 'env') {
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY = 'appl_ios_valid_key';
  }
  if (apiKeySource === 'env_api_alias') {
    process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY = 'appl_ios_valid_key_legacy';
  }

  const extra: Record<string, unknown> = {};
  if (apiKeySource === 'config') {
    extra.revenueCat = {
      iosApiKey: 'appl_ios_config_key',
      androidApiKey: 'goog_android_config_key',
    };
  }
  if (apiKeySource === 'placeholder') {
    extra.revenueCat = {
      iosApiKey: 'TODO_REPLACE_WITH_REVENUECAT_IOS_API_KEY',
      androidApiKey: 'TODO_REPLACE_WITH_REVENUECAT_ANDROID_API_KEY',
    };
  }

  if (
    options.killSwitch !== undefined
    || options.purchasesEnabled !== undefined
    || options.restoreEnabled !== undefined
  ) {
    extra.premiumRollout = {
      killSwitch: options.killSwitch ?? false,
      purchasesEnabled: options.purchasesEnabled ?? true,
      restoreEnabled: options.restoreEnabled ?? true,
    };
  }

  jest.doMock('../../src/config/featureFlags', () => ({
    isFeatureEnabled: jest.fn((flag: string) => {
      if (flag === 'PREMIUM_SUBSCRIPTION') return premiumEnabled;
      return false;
    }),
  }));

  jest.doMock('expo-constants', () => ({
    default: {
      expoConfig: {
        extra,
      },
    },
  }));

  jest.doMock('react-native', () => ({
    Platform: { OS: 'ios' },
  }));

  const purchasesMock = createPurchasesMock(options);
  if (options.revenueCatAvailable === false) {
    jest.doMock('react-native-purchases', () => {
      throw new Error('module unavailable');
    });
  } else {
    jest.doMock('react-native-purchases', () => purchasesMock);
  }

  const subscriptionManager = await import('../../src/services/subscriptionManager');
  return {
    subscriptionManager,
    purchasesMock,
  };
};

describe('subscriptionManager hardening', () => {
  afterEach(() => {
    clearPremiumEnv();
  });

  it('returns premium_disabled when feature flag is off', async () => {
    const { subscriptionManager } = await loadSubscriptionManager({
      premiumEnabled: false,
      apiKeySource: 'env',
    });

    const result = await subscriptionManager.purchaseProduct(PRODUCT_ID);
    expect(result.success).toBe(false);
    expect(result.code).toBe('premium_disabled');
  });

  it('returns premium_kill_switch when kill-switch is on', async () => {
    const { subscriptionManager } = await loadSubscriptionManager({
      premiumEnabled: true,
      apiKeySource: 'env',
      killSwitch: true,
    });

    const result = await subscriptionManager.purchaseProduct(PRODUCT_ID);
    expect(result.success).toBe(false);
    expect(result.code).toBe('premium_kill_switch');
  });

  it('keeps entitlement read path available when premium feature flag is off', async () => {
    // When flag is off, RevenueCat is not initialized; paywall stays closed.
    const { subscriptionManager } = await loadSubscriptionManager({
      premiumEnabled: false,
      apiKeySource: 'env',
      initialPremium: true,
    });

    await subscriptionManager.initializeSubscriptions();
    const runtime = subscriptionManager.getPremiumRuntimeStatus();

    expect(runtime.initialized).toBe(false);
    expect(subscriptionManager.canOpenPremiumPaywall()).toBe(false);
  });

  it('keeps entitlement read path available when kill-switch is on', async () => {
    const { subscriptionManager } = await loadSubscriptionManager({
      premiumEnabled: true,
      apiKeySource: 'env',
      killSwitch: true,
      initialPremium: true,
    });

    await subscriptionManager.initializeSubscriptions();
    const premiumNow = await subscriptionManager.refreshPremiumStatus();
    const purchaseAttempt = await subscriptionManager.purchaseProduct(PRODUCT_ID);

    expect(premiumNow).toBe(true);
    expect(purchaseAttempt.success).toBe(false);
    expect(purchaseAttempt.code).toBe('premium_kill_switch');
  });

  it('returns missing_config when api key is absent or placeholder', async () => {
    const { subscriptionManager, purchasesMock } = await loadSubscriptionManager({
      premiumEnabled: true,
      apiKeySource: 'placeholder',
    });

    const result = await subscriptionManager.purchaseProduct(PRODUCT_ID);
    expect(result.success).toBe(false);
    expect(result.code).toBe('missing_config');
    expect(purchasesMock.configure).not.toHaveBeenCalled();
  });

  it('accepts legacy *_API_KEY env alias for RevenueCat key lookup', async () => {
    const { subscriptionManager, purchasesMock } = await loadSubscriptionManager({
      premiumEnabled: true,
      apiKeySource: 'env_api_alias',
    });

    const result = await subscriptionManager.purchaseProduct(PRODUCT_ID);
    expect(purchasesMock.configure).toHaveBeenCalled();
    expect(result.code).not.toBe('missing_config');
  });

  it('maps cancelled purchase deterministically', async () => {
    const { subscriptionManager } = await loadSubscriptionManager({
      premiumEnabled: true,
      apiKeySource: 'env',
      purchaseOutcome: 'cancelled',
    });

    const result = await subscriptionManager.purchaseProduct(PRODUCT_ID);
    expect(result.success).toBe(false);
    expect(result.code).toBe('cancelled');
    expect(result.error).toBe('cancelled');
  });

  it('returns no_active_subscription on restore without entitlement', async () => {
    const { subscriptionManager } = await loadSubscriptionManager({
      premiumEnabled: true,
      apiKeySource: 'env',
      restoreOutcome: 'no_active',
    });

    const result = await subscriptionManager.restorePurchases();
    expect(result.success).toBe(false);
    expect(result.code).toBe('no_active_subscription');
  });

  it('returns success on restore with active entitlement', async () => {
    const { subscriptionManager } = await loadSubscriptionManager({
      premiumEnabled: true,
      apiKeySource: 'env',
      restoreOutcome: 'success',
    });

    const result = await subscriptionManager.restorePurchases();
    expect(result.success).toBe(true);
  });

  it('exposes rollout status snapshot', async () => {
    const { subscriptionManager } = await loadSubscriptionManager({
      premiumEnabled: true,
      apiKeySource: 'env',
      purchasesEnabled: false,
      restoreEnabled: true,
    });

    const status = subscriptionManager.getPremiumRuntimeStatus();
    expect(status.featureEnabled).toBe(true);
    expect(status.purchasesEnabled).toBe(false);
    expect(status.restoreEnabled).toBe(true);
    expect(status.hasApiKey).toBe(true);
  });

  it('canOpenPremiumPaywall returns false when api key is missing', async () => {
    const { subscriptionManager } = await loadSubscriptionManager({
      premiumEnabled: true,
      apiKeySource: 'none',
    });

    expect(subscriptionManager.canOpenPremiumPaywall()).toBe(false);
  });

  it('canOpenPremiumPaywall returns true when runtime gates are open', async () => {
    const { subscriptionManager } = await loadSubscriptionManager({
      premiumEnabled: true,
      apiKeySource: 'env',
      purchasesEnabled: true,
      restoreEnabled: true,
      killSwitch: false,
    });

    expect(subscriptionManager.canOpenPremiumPaywall()).toBe(true);
  });
});

