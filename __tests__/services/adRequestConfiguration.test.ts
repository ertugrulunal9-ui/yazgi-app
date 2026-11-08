// Y-028 (U8, kullanıcı kararı 2026-11-08): tüm reklam istekleri azami içerik derecesi "T" ile
// sınırlanır. Yapılandırma AdMob SDK başlatılmadan ve ilk reklam isteğinden önce, bir kez uygulanır.
import { AD_MAX_CONTENT_RATING, monetizationService } from '../../src/services/monetization';

const mockSetRequestConfiguration = jest.fn();
const mockSdkInitialize = jest.fn();
const mockCreateInterstitial = jest.fn();

jest.mock('../../src/services/adMobModule', () => ({
  loadAdMobModule: () => ({
    default: () => ({
      setRequestConfiguration: (...args: unknown[]) => mockSetRequestConfiguration(...args),
      initialize: (...args: unknown[]) => mockSdkInitialize(...args),
    }),
    MaxAdContentRating: { G: 'G', PG: 'PG', T: 'T', MA: 'MA' },
    InterstitialAd: {
      createForAdRequest: (...args: unknown[]) => mockCreateInterstitial(...args),
    },
    AdEventType: { LOADED: 'loaded', ERROR: 'error', CLOSED: 'closed', OPENED: 'opened' },
    TestIds: { REWARDED: 'test-rewarded', INTERSTITIAL: 'test-interstitial' },
  }),
}));

type Listener = (payload?: unknown) => void;

const createFakeInterstitial = () => {
  const listeners = new Map<string, Listener[]>();
  const unsubs: jest.Mock[] = [];
  const ad = {
    loaded: false,
    addAdEventListener: jest.fn((type: string, listener: Listener) => {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
      const unsub = jest.fn();
      unsubs.push(unsub);
      return unsub;
    }),
    load: jest.fn(),
    show: jest.fn(),
    emit: (type: string) => (listeners.get(type) ?? []).forEach((listener) => listener()),
    unsubs,
  };
  return ad;
};

describe('AdMob request configuration (max ad content rating)', () => {
  let fakeAds: ReturnType<typeof createFakeInterstitial>[];

  beforeEach(() => {
    localStorage.clear();
    (monetizationService as any).__reset__();
    mockSetRequestConfiguration.mockReset().mockResolvedValue(undefined);
    mockSdkInitialize.mockReset().mockResolvedValue([]);
    fakeAds = [];
    mockCreateInterstitial.mockReset().mockImplementation(() => {
      const ad = createFakeInterstitial();
      fakeAds.push(ad);
      return ad;
    });
  });

  afterEach(() => {
    (monetizationService as any).__reset__();
  });

  it('is the teen rating chosen by the user', () => {
    expect(AD_MAX_CONTENT_RATING).toBe('T');
  });

  it('sets only maxAdContentRating = T, before the SDK starts', async () => {
    await monetizationService.initialize();

    expect(mockSetRequestConfiguration).toHaveBeenCalledTimes(1);
    // Yalnızca içerik derecesi: tagForChildDirectedTreatment / tagForUnderAgeOfConsent verilmez.
    expect(mockSetRequestConfiguration).toHaveBeenCalledWith({ maxAdContentRating: 'T' });
    expect(mockSdkInitialize).toHaveBeenCalledTimes(1);
    expect(mockSetRequestConfiguration.mock.invocationCallOrder[0])
      .toBeLessThan(mockSdkInitialize.mock.invocationCallOrder[0]);
    expect((monetizationService as any).adProvider).toBe('admob');
  });

  it('applies the configuration before the first ad request', async () => {
    monetizationService.preloadInterstitialAd();
    expect(mockCreateInterstitial).not.toHaveBeenCalled();

    await monetizationService.initialize();

    expect(mockCreateInterstitial).toHaveBeenCalledTimes(1);
    expect(mockSetRequestConfiguration.mock.invocationCallOrder[0])
      .toBeLessThan(mockCreateInterstitial.mock.invocationCallOrder[0]);
  });

  it('configures once, also when initialize is called again or concurrently', async () => {
    await Promise.all([
      monetizationService.initialize(),
      monetizationService.initialize(),
      monetizationService.showRewardedAd('energy', { shouldShow: () => false }),
    ]);
    await monetizationService.initialize();

    expect(mockSetRequestConfiguration).toHaveBeenCalledTimes(1);
    expect(mockSdkInitialize).toHaveBeenCalledTimes(1);
  });

  it('does not use AdMob (no unrated ads) when the configuration cannot be applied', async () => {
    mockSetRequestConfiguration.mockRejectedValue(new Error('native'));

    await monetizationService.initialize();
    monetizationService.preloadInterstitialAd();

    expect(mockSdkInitialize).not.toHaveBeenCalled();
    expect((monetizationService as any).adProvider).toBe('mock');
    expect(mockCreateInterstitial).not.toHaveBeenCalled();
  });
});

describe('setPersonalizedAdsEnabled after the UMP privacy options form', () => {
  let fakeAds: ReturnType<typeof createFakeInterstitial>[];

  beforeEach(async () => {
    localStorage.clear();
    (monetizationService as any).__reset__();
    mockSetRequestConfiguration.mockReset().mockResolvedValue(undefined);
    mockSdkInitialize.mockReset().mockResolvedValue([]);
    fakeAds = [];
    mockCreateInterstitial.mockReset().mockImplementation(() => {
      const ad = createFakeInterstitial();
      fakeAds.push(ad);
      return ad;
    });
    await monetizationService.initialize();
  });

  afterEach(() => {
    (monetizationService as any).__reset__();
  });

  const preloadReady = (personalized: boolean) => {
    monetizationService.setPersonalizedAdsEnabled(personalized);
    monetizationService.preloadInterstitialAd();
    fakeAds[0].emit('loaded');
    expect(mockCreateInterstitial).toHaveBeenCalledTimes(1);
  };
  const reRequests = () => mockCreateInterstitial.mock.calls.slice(1).map((call) => call[1]);

  it('consent changed, same value: drops the ready ad and requests it once again', () => {
    preloadReady(false);

    monetizationService.setPersonalizedAdsEnabled(false, { consentChanged: true });

    fakeAds[0].unsubs.forEach((unsub) => expect(unsub).toHaveBeenCalled());
    expect(reRequests()).toEqual([{ requestNonPersonalizedAdsOnly: true }]);
  });

  it('consent changed and value changed: still exactly one new request, with the new value', () => {
    preloadReady(false);

    monetizationService.setPersonalizedAdsEnabled(true, { consentChanged: true });

    expect(reRequests()).toEqual([{ requestNonPersonalizedAdsOnly: false }]);
  });

  it('value changed without a consent change: one new request (existing behaviour)', () => {
    preloadReady(true);

    monetizationService.setPersonalizedAdsEnabled(false);

    expect(reRequests()).toEqual([{ requestNonPersonalizedAdsOnly: true }]);
  });

  it('same value and no consent change: keeps the ready ad', () => {
    preloadReady(false);

    monetizationService.setPersonalizedAdsEnabled(false);
    monetizationService.setPersonalizedAdsEnabled(false, { consentChanged: false });

    expect(reRequests()).toEqual([]);
  });

  it('consent changed with no preloaded ad: starts no request', () => {
    monetizationService.setPersonalizedAdsEnabled(false, { consentChanged: true });

    expect(mockCreateInterstitial).not.toHaveBeenCalled();
  });
});
