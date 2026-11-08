// Y-035 (Y-030 #6): Google UMP rehberi reklam isteğini ve SDK başlatmayı yalnızca `canRequestAds`
// true iken ister. AEA'da onay alınamadığı oturumda (çevrimdışı açılış, form yüklenemedi, form
// tamamlanmadı) hiçbir AdMob isteği gitmez; AEA dışı (NOT_REQUIRED, true) akış değişmez.
import { getAdErrorMessage } from '../../src/utils/adErrorMessage';
import {
  REWARDED_AD_CONSENT_ERROR,
  monetizationService,
} from '../../src/services/monetization';

const mockSetRequestConfiguration = jest.fn();
const mockSdkInitialize = jest.fn();
const mockCreateInterstitial = jest.fn();
const mockCreateRewarded = jest.fn();

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
    RewardedAd: {
      createForAdRequest: (...args: unknown[]) => mockCreateRewarded(...args),
    },
    AdEventType: { LOADED: 'loaded', ERROR: 'error', CLOSED: 'closed', OPENED: 'opened' },
    RewardedAdEventType: { LOADED: 'rewarded_loaded', EARNED_REWARD: 'earned' },
    TestIds: { REWARDED: 'test-rewarded', INTERSTITIAL: 'test-interstitial' },
  }),
}));

type Listener = (payload?: unknown) => void;

const createFakeAd = () => {
  const listeners = new Map<string, Listener[]>();
  const unsub = jest.fn();
  return {
    loaded: false,
    unsub,
    addAdEventListener: jest.fn((type: string, listener: Listener) => {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
      return unsub;
    }),
    load: jest.fn(),
    show: jest.fn(),
    emit: (type: string, payload?: unknown) => (listeners.get(type) ?? []).forEach((l) => l(payload)),
  };
};

const svc = monetizationService as unknown as {
  __reset__: () => void;
  adProvider: string;
  rewardedAdCount: number;
};

describe('AdMob requests are gated by UMP canRequestAds', () => {
  let interstitials: ReturnType<typeof createFakeAd>[];

  beforeEach(() => {
    localStorage.clear();
    svc.__reset__();
    mockSetRequestConfiguration.mockReset().mockResolvedValue(undefined);
    mockSdkInitialize.mockReset().mockResolvedValue([]);
    interstitials = [];
    mockCreateInterstitial.mockReset().mockImplementation(() => {
      const ad = createFakeAd();
      interstitials.push(ad);
      return ad;
    });
    mockCreateRewarded.mockReset().mockImplementation(() => createFakeAd());
  });

  afterEach(() => {
    svc.__reset__();
  });

  it('canRequestAds false at launch: SDK is not started and no request is made (interstitial and rewarded)', async () => {
    monetizationService.setCanRequestAds(false);
    await monetizationService.initialize();
    monetizationService.preloadInterstitialAd();
    const result = await monetizationService.showRewardedAd('energy');
    const contextual = await monetizationService.showContextualRewardedAd('undo_choice');
    const interstitial = await monetizationService.showInterstitialAdDetailed();

    expect(mockSetRequestConfiguration).not.toHaveBeenCalled();
    expect(mockSdkInitialize).not.toHaveBeenCalled();
    expect(mockCreateInterstitial).not.toHaveBeenCalled();
    expect(mockCreateRewarded).not.toHaveBeenCalled();
    expect(result).toEqual({ success: false, error: REWARDED_AD_CONSENT_ERROR });
    expect(contextual.success).toBe(false);
    expect(interstitial.shown).toBe(false);
  });

  it('rewarded blocked by consent: the daily allowance is untouched and the player sees the Turkish "unavailable" message', async () => {
    monetizationService.setCanRequestAds(false);
    await monetizationService.initialize();
    const before = monetizationService.getRemainingRewardedAds();

    const result = await monetizationService.showRewardedAd('energy');

    expect(result.success).toBe(false);
    expect(monetizationService.getRemainingRewardedAds()).toBe(before);
    expect(svc.rewardedAdCount).toBe(0);
    // Yeni metin yok: "unavailable" mevcut mesaja düşer (genel hata değil).
    expect(getAdErrorMessage(result.error)).toBe(getAdErrorMessage('Ads unavailable'));
    expect(getAdErrorMessage(result.error)).not.toBe(getAdErrorMessage('something else'));
  });

  it('canRequestAds true (outside the EEA): order setRequestConfiguration -> initialize -> first request is kept', async () => {
    monetizationService.setCanRequestAds(true);
    monetizationService.preloadInterstitialAd();
    await monetizationService.initialize();

    expect(mockSetRequestConfiguration).toHaveBeenCalledTimes(1);
    expect(mockSdkInitialize).toHaveBeenCalledTimes(1);
    expect(mockCreateInterstitial).toHaveBeenCalledTimes(1);
    expect(mockSetRequestConfiguration.mock.invocationCallOrder[0])
      .toBeLessThan(mockSdkInitialize.mock.invocationCallOrder[0]);
    expect(mockSdkInitialize.mock.invocationCallOrder[0])
      .toBeLessThan(mockCreateInterstitial.mock.invocationCallOrder[0]);
  });

  it('false -> true after the form: SDK starts once in this session and the pending preload is requested', async () => {
    monetizationService.setCanRequestAds(false);
    await monetizationService.initialize();
    monetizationService.preloadInterstitialAd();
    expect(mockCreateInterstitial).not.toHaveBeenCalled();

    monetizationService.setCanRequestAds(true);
    monetizationService.setCanRequestAds(true);
    await new Promise((resolve) => setImmediate(resolve));
    await new Promise((resolve) => setImmediate(resolve));

    expect(svc.adProvider).toBe('admob');
    expect(mockSetRequestConfiguration).toHaveBeenCalledTimes(1);
    expect(mockSdkInitialize).toHaveBeenCalledTimes(1);
    expect(mockCreateInterstitial).toHaveBeenCalledTimes(1);
    expect(mockSetRequestConfiguration.mock.invocationCallOrder[0])
      .toBeLessThan(mockCreateInterstitial.mock.invocationCallOrder[0]);
  });

  it('true during a running initialize (race): the SDK still starts exactly once', async () => {
    monetizationService.setCanRequestAds(false);
    const init = monetizationService.initialize();
    monetizationService.setCanRequestAds(true);
    await init;
    await new Promise((resolve) => setImmediate(resolve));

    expect(mockSdkInitialize).toHaveBeenCalledTimes(1);
    expect(svc.adProvider).toBe('admob');
  });

  it('true -> false: the ready interstitial is dropped, no new request, rewarded is blocked', async () => {
    monetizationService.setCanRequestAds(true);
    await monetizationService.initialize();
    monetizationService.preloadInterstitialAd();
    interstitials[0].emit('loaded');
    expect(mockCreateInterstitial).toHaveBeenCalledTimes(1);

    monetizationService.setCanRequestAds(false);

    expect(interstitials[0].unsub).toHaveBeenCalled();
    const shown = await monetizationService.showInterstitialAdDetailed();
    expect(shown.shown).toBe(false);
    expect(interstitials[0].show).not.toHaveBeenCalled();
    monetizationService.preloadInterstitialAd();
    expect(mockCreateInterstitial).toHaveBeenCalledTimes(1);
    await expect(monetizationService.showRewardedAd('energy')).resolves.toEqual({
      success: false,
      error: REWARDED_AD_CONSENT_ERROR,
    });
    expect(mockCreateRewarded).not.toHaveBeenCalled();

    // İzin geri gelince atılan reklam yeniden istenir.
    monetizationService.setCanRequestAds(true);
    await new Promise((resolve) => setImmediate(resolve));
    expect(mockCreateInterstitial).toHaveBeenCalledTimes(2);
  });

  it('player personalization changes while blocked do not start a request', async () => {
    monetizationService.setCanRequestAds(false);
    await monetizationService.initialize();

    monetizationService.setPersonalizedAdsEnabled(true, { consentChanged: true });

    expect(mockCreateInterstitial).not.toHaveBeenCalled();
  });

  it('dev mock ads keep working when the native module is absent (gate does not apply)', async () => {
    // Mock sağlayıcı AdMob isteği yapmaz; kapı yalnızca gerçek AdMob yolunda.
    svc.__reset__();
    (monetizationService as unknown as { isInitialized: boolean }).isInitialized = true;
    monetizationService.setCanRequestAds(false);

    const result = await monetizationService.showRewardedAd('energy');

    expect(result.success).toBe(true);
    expect(mockCreateRewarded).not.toHaveBeenCalled();
  });
});
