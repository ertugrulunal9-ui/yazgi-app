// Y-037 (kırmızı takım #2 ve #7): UMP cevap vermeden basılan ödüllü reklam SDK'yı başlatıp istek atmaz
// (kapı varsayılan kapalı); izin yeni geldiyse ve SDK başlıyorsa ödüllü reklam başlatmayı bekler;
// izin sonradan kapanırsa yüklenen reklam açılmaz ve hak düşmez.
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { useAppBootstrap } from '../../src/appShell/useAppBootstrap';
import {
  REWARDED_AD_CONSENT_ERROR,
  monetizationService,
} from '../../src/services/monetization';

const mockRequestInfoUpdate = jest.fn();
const mockShowForm = jest.fn();
const mockGetConsentInfo = jest.fn();
const mockSetRequestConfiguration = jest.fn();
const mockSdkInitialize = jest.fn();
const mockCreateRewarded = jest.fn();
const mockCreateInterstitial = jest.fn();

jest.mock('expo-font', () => ({ useFonts: () => [true] }));
jest.mock('expo-google-fonts-inter/400Regular/Inter_400Regular.ttf', () => 1, { virtual: true });
jest.mock('expo-google-fonts-inter/700Bold/Inter_700Bold.ttf', () => 1, { virtual: true });
jest.mock('../../src/config/featureFlags', () => ({
  initializeFeatureFlags: jest.fn(async () => undefined),
  subscribeFeatureFlags: jest.fn(() => () => undefined),
}));
jest.mock('../../src/data/loadingQuotes', () => ({ getLoadingQuoteByAge: () => '' }));
jest.mock('../../src/utils/analyticsEvents', () => ({ logAppOpen: jest.fn() }));
jest.mock('../../src/services/notificationService', () => ({
  restoreNotificationPermission: jest.fn(async () => undefined),
}));
jest.mock('../../src/services/subscriptionManager', () => ({
  initializeSubscriptions: jest.fn(async () => undefined),
  isPremium: () => false,
}));
jest.mock('../../src/appShell/usePrivacyChoicesGate', () => ({
  usePrivacyChoicesGate: () => ({
    checkingPrivacyChoices: false,
    privacyChoicesPending: false,
    markPrivacyChoicesSeen: jest.fn(),
  }),
}));
jest.mock('../../src/services/adMobModule', () => ({
  loadAdMobModule: () => ({
    default: () => ({
      setRequestConfiguration: (...args: unknown[]) => mockSetRequestConfiguration(...args),
      initialize: (...args: unknown[]) => mockSdkInitialize(...args),
    }),
    MaxAdContentRating: { G: 'G', PG: 'PG', T: 'T', MA: 'MA' },
    InterstitialAd: { createForAdRequest: (...args: unknown[]) => mockCreateInterstitial(...args) },
    RewardedAd: { createForAdRequest: (...args: unknown[]) => mockCreateRewarded(...args) },
    AdEventType: { LOADED: 'loaded', ERROR: 'error', CLOSED: 'closed', OPENED: 'opened' },
    RewardedAdEventType: { LOADED: 'rewarded_loaded', EARNED_REWARD: 'earned' },
    TestIds: { REWARDED: 'test-rewarded', INTERSTITIAL: 'test-interstitial' },
  }),
}));
jest.mock('react-native-google-mobile-ads', () => ({
  AdsConsent: {
    requestInfoUpdate: (...args: unknown[]) => mockRequestInfoUpdate(...args),
    showForm: (...args: unknown[]) => mockShowForm(...args),
    showPrivacyOptionsForm: jest.fn(),
    getConsentInfo: (...args: unknown[]) => mockGetConsentInfo(...args),
  },
  AdsConsentStatus: { UNKNOWN: 'UNKNOWN', REQUIRED: 'REQUIRED', NOT_REQUIRED: 'NOT_REQUIRED', OBTAINED: 'OBTAINED' },
  AdsConsentPrivacyOptionsRequirementStatus: { UNKNOWN: 'UNKNOWN', REQUIRED: 'REQUIRED', NOT_REQUIRED: 'NOT_REQUIRED' },
}));

type L = (payload?: unknown) => void;
const fakeAd = () => {
  const listeners = new Map<string, L[]>();
  return {
    loaded: false,
    addAdEventListener: jest.fn((type: string, l: L) => {
      listeners.set(type, [...(listeners.get(type) ?? []), l]);
      return jest.fn();
    }),
    load: jest.fn(),
    show: jest.fn(),
    emit: (type: string, payload?: unknown) => (listeners.get(type) ?? []).forEach((l) => l(payload)),
  };
};

const svc = monetizationService as unknown as {
  __reset__: () => void;
  adProvider: string;
  isInitialized: boolean;
  canRequestAds: boolean;
};

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 20; i += 1) await Promise.resolve();
  });
};

function deferred<T>() {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>((res) => { resolve = res; });
  return { promise, resolve };
}

let rewardedAds: ReturnType<typeof fakeAd>[] = [];
let trees: renderer.ReactTestRenderer[] = [];

beforeEach(() => {
  localStorage.clear();
  svc.__reset__();
  mockRequestInfoUpdate.mockReset();
  mockShowForm.mockReset();
  mockGetConsentInfo.mockReset();
  mockSetRequestConfiguration.mockReset().mockResolvedValue(undefined);
  mockSdkInitialize.mockReset().mockResolvedValue([]);
  rewardedAds = [];
  mockCreateRewarded.mockReset().mockImplementation(() => {
    const ad = fakeAd();
    rewardedAds.push(ad);
    return ad;
  });
  mockCreateInterstitial.mockReset().mockImplementation(() => fakeAd());
});

afterEach(() => {
  act(() => { trees.forEach((t) => t.unmount()); });
  trees = [];
  svc.__reset__();
});

describe('rewarded tap while the startup UMP request is still pending', () => {
  it('makes no request and starts no SDK before UMP answers; UMP false keeps it closed', async () => {
    const info = deferred<unknown>();
    mockRequestInfoUpdate.mockReturnValueOnce(info.promise);
    mockShowForm.mockRejectedValue(new Error('form failed'));
    mockGetConsentInfo.mockResolvedValue({
      status: 'REQUIRED',
      canRequestAds: false,
      privacyOptionsRequirementStatus: 'UNKNOWN',
      isConsentFormAvailable: true,
    });

    await act(async () => {
      trees.push(renderer.create(React.createElement(() => { useAppBootstrap(); return null; })));
    });
    await flush();
    expect(svc.isInitialized).toBe(false);
    expect(svc.canRequestAds).toBe(false);

    const early = await monetizationService.showContextualRewardedAd('undo_choice');
    expect(early.success).toBe(false);
    expect(early.error).toBe(REWARDED_AD_CONSENT_ERROR);
    expect(mockSetRequestConfiguration).not.toHaveBeenCalled();
    expect(mockSdkInitialize).not.toHaveBeenCalled();
    expect(mockCreateRewarded).not.toHaveBeenCalled();

    await act(async () => {
      info.resolve({ status: 'REQUIRED', canRequestAds: false, privacyOptionsRequirementStatus: 'UNKNOWN' });
    });
    await flush();

    expect(svc.canRequestAds).toBe(false);
    await expect(monetizationService.showRewardedAd('energy')).resolves.toEqual({
      success: false,
      error: REWARDED_AD_CONSENT_ERROR,
    });
    expect(mockSdkInitialize).not.toHaveBeenCalled();
    expect(mockCreateRewarded).not.toHaveBeenCalled();
  });

  it('UMP later says true: the SDK starts once', async () => {
    monetizationService.setCanRequestAds(false);
    const res = await monetizationService.showContextualRewardedAd('undo_choice');
    expect(res.error).toBe(REWARDED_AD_CONSENT_ERROR);

    monetizationService.setCanRequestAds(true);
    await flush();
    expect(mockSdkInitialize).toHaveBeenCalledTimes(1);
    expect(svc.adProvider).toBe('admob');
  });

  it('web-like path keeps mock ads with the gate closed (no SDK)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rn = require('react-native');
    const prevOS = rn.Platform.OS;
    rn.Platform.OS = 'web';
    try {
      const res = await monetizationService.showRewardedAd('energy');
      expect(res.success).toBe(true);
      expect(mockSdkInitialize).not.toHaveBeenCalled();
    } finally {
      rn.Platform.OS = prevOS;
    }
  });
});

describe('consent changes around a rewarded request', () => {
  it('request made while allowed, consent closes before LOADED: ad is not shown, error, allowance untouched', async () => {
    monetizationService.setCanRequestAds(true);
    await monetizationService.initialize();
    const before = monetizationService.getRemainingRewardedAds();

    const pending = monetizationService.showRewardedAd('energy');
    await flush();
    expect(mockCreateRewarded).toHaveBeenCalledTimes(1);

    monetizationService.setCanRequestAds(false);
    rewardedAds[0].emit('rewarded_loaded');

    await expect(pending).resolves.toEqual({ success: false, error: REWARDED_AD_CONSENT_ERROR });
    expect(rewardedAds[0].show).not.toHaveBeenCalled();
    expect(monetizationService.getRemainingRewardedAds()).toBe(before);
  });

  it('consent just granted while the SDK is starting: a rewarded tap waits for the start and requests a real ad', async () => {
    const cfg = deferred<void>();
    mockSetRequestConfiguration.mockReset().mockReturnValueOnce(cfg.promise);
    monetizationService.setCanRequestAds(false);
    await monetizationService.initialize();
    monetizationService.setCanRequestAds(true);
    await flush();
    expect(svc.adProvider).toBe('mock');

    const pending = monetizationService.showRewardedAd('energy');
    await flush();
    await act(async () => { cfg.resolve(); });
    await flush();

    expect(svc.adProvider).toBe('admob');
    expect(mockCreateRewarded).toHaveBeenCalledTimes(1);
    rewardedAds[0].emit('rewarded_loaded');
    expect(rewardedAds[0].show).toHaveBeenCalledTimes(1);
    rewardedAds[0].emit('earned', { amount: 1 });
    await expect(pending).resolves.toMatchObject({ success: true });
  });
});

describe('races while the SDK start runs', () => {
  it('true -> false -> true quickly: SDK started exactly once and the pending preload happens', async () => {
    const cfg = deferred<void>();
    mockSetRequestConfiguration.mockReset().mockReturnValueOnce(cfg.promise);
    monetizationService.setCanRequestAds(false);
    await monetizationService.initialize();
    monetizationService.preloadInterstitialAd();
    monetizationService.setCanRequestAds(true);
    monetizationService.setCanRequestAds(false);
    monetizationService.setCanRequestAds(true);
    await act(async () => { cfg.resolve(); });
    await flush();
    expect(mockSdkInitialize).toHaveBeenCalledTimes(1);
    expect(mockCreateInterstitial).toHaveBeenCalledTimes(1);
  });
});
