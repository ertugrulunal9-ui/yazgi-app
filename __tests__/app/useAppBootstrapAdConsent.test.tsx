// Y-028 (U7): Ayarlar'daki reklam gizlilik seçenekleri formu kapanınca UMP durumu yeniden okunur ve
// etkin kişiselleştirme aynı politikayla (UMP izin veriyor VE oyuncu açtı) yeniden hesaplanır.
// Oyuncunun Ayarlar'daki anahtarı hiçbir zaman değişmez. Hazır bekleyen geçiş reklamı eski izinle
// istendiği için tam olarak BİR kez yeniden istenir (Y-030 #4: etkin değer değişince iki kez isteniyordu).
// Gerçek reklam servisi + sahte AdMob SDK: yeniden istek sayısı doğrudan sayılır.
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppBootstrap } from '../../src/appShell/useAppBootstrap';
import { showAdPrivacyOptions } from '../../src/services/consentService';
import { monetizationService } from '../../src/services/monetization';

const mockRequestInfoUpdate = jest.fn();
const mockShowForm = jest.fn();
const mockShowPrivacyOptionsForm = jest.fn();
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
      setRequestConfiguration: jest.fn(async () => undefined),
      initialize: jest.fn(async () => []),
    }),
    MaxAdContentRating: { G: 'G', PG: 'PG', T: 'T', MA: 'MA' },
    InterstitialAd: {
      createForAdRequest: (...args: unknown[]) => mockCreateInterstitial(...args),
    },
    AdEventType: { LOADED: 'loaded', ERROR: 'error', CLOSED: 'closed', OPENED: 'opened' },
    TestIds: { REWARDED: 'test-rewarded', INTERSTITIAL: 'test-interstitial' },
  }),
}));

jest.mock('react-native-google-mobile-ads', () => ({
  AdsConsent: {
    requestInfoUpdate: (...args: unknown[]) => mockRequestInfoUpdate(...args),
    showForm: (...args: unknown[]) => mockShowForm(...args),
    showPrivacyOptionsForm: (...args: unknown[]) => mockShowPrivacyOptionsForm(...args),
    getConsentInfo: jest.fn(() => Promise.reject(new Error('none'))),
  },
  AdsConsentStatus: {
    UNKNOWN: 'UNKNOWN',
    REQUIRED: 'REQUIRED',
    NOT_REQUIRED: 'NOT_REQUIRED',
    OBTAINED: 'OBTAINED',
  },
  AdsConsentPrivacyOptionsRequirementStatus: {
    UNKNOWN: 'UNKNOWN',
    REQUIRED: 'REQUIRED',
    NOT_REQUIRED: 'NOT_REQUIRED',
  },
}));

const UI_PREFS_KEY = '@yazgi_sim/ui_prefs/v1';

const storageMock = AsyncStorage as unknown as {
  __CLEAR__: () => void;
  __GET_STORAGE__: () => Record<string, string>;
};

type Listener = () => void;

const createFakeInterstitial = () => {
  const listeners = new Map<string, Listener[]>();
  return {
    loaded: false,
    addAdEventListener: jest.fn((type: string, listener: Listener) => {
      listeners.set(type, [...(listeners.get(type) ?? []), listener]);
      return jest.fn();
    }),
    load: jest.fn(),
    show: jest.fn(),
    emit: (type: string) => (listeners.get(type) ?? []).forEach((listener) => listener()),
  };
};

const consentInfo = (status: string) => ({
  status,
  privacyOptionsRequirementStatus: 'REQUIRED',
  canRequestAds: status !== 'REQUIRED',
  isConsentFormAvailable: true,
});

const service = monetizationService as unknown as {
  __reset__: () => void;
  isInitialized: boolean;
  adProvider: string;
  personalizedAdsEnabled: boolean;
};

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 10; i += 1) await Promise.resolve();
  });
};

let fakeAds: ReturnType<typeof createFakeInterstitial>[] = [];
let mountedTrees: renderer.ReactTestRenderer[] = [];

/** Uygulamayı açar, reklam servisinin başlamasını bekler ve bir geçiş reklamını hazır hâle getirir. */
const startAppWithReadyInterstitial = async () => {
  const ref: { current: ReturnType<typeof useAppBootstrap> | null } = { current: null };
  const Probe = () => {
    ref.current = useAppBootstrap();
    return null;
  };
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<Probe />);
  });
  mountedTrees.push(tree);
  for (let i = 0; i < 10 && !service.isInitialized; i += 1) await flush();
  expect(service.isInitialized).toBe(true);
  expect(service.adProvider).toBe('admob');

  monetizationService.preloadInterstitialAd();
  expect(mockCreateInterstitial).toHaveBeenCalledTimes(1);
  fakeAds[0].emit('loaded');
  return { ref };
};

const closePrivacyOptionsForm = async (status: string) => {
  mockShowPrivacyOptionsForm.mockResolvedValue(consentInfo(status));
  let result: string | undefined;
  await act(async () => {
    result = await showAdPrivacyOptions();
  });
  await flush();
  return result;
};

/** Önceden yüklenen reklamdan sonra yapılan istekler (her biri yeniden istek). */
const reRequests = () => mockCreateInterstitial.mock.calls.slice(1).map((call) => call[1]);

describe('useAppBootstrap after the UMP privacy options form', () => {
  beforeEach(() => {
    storageMock.__CLEAR__();
    localStorage.clear();
    service.__reset__();
    mockRequestInfoUpdate.mockReset();
    mockShowForm.mockReset();
    mockShowPrivacyOptionsForm.mockReset();
    fakeAds = [];
    mockCreateInterstitial.mockReset().mockImplementation(() => {
      const ad = createFakeInterstitial();
      fakeAds.push(ad);
      return ad;
    });
  });

  afterEach(() => {
    // Başarısız bir test de kancayı söker: eski abonelik sonraki testin reklam servisine yazmasın.
    act(() => {
      mountedTrees.forEach((tree) => tree.unmount());
    });
    mountedTrees = [];
    service.__reset__();
  });

  it('(b) effective value unchanged: player keeps it off, one re-request, switch untouched', async () => {
    await AsyncStorage.setItem(UI_PREFS_KEY, JSON.stringify({ personalizedAdsEnabled: false }));
    mockRequestInfoUpdate.mockResolvedValue(consentInfo('OBTAINED'));
    const { ref } = await startAppWithReadyInterstitial();
    expect(service.personalizedAdsEnabled).toBe(false);

    await expect(closePrivacyOptionsForm('OBTAINED')).resolves.toBe('closed');

    expect(service.personalizedAdsEnabled).toBe(false);
    // TCF izni değişmiş olabilir: hazır reklam yine de tam bir kez, kişiselleştirilmemiş istenir.
    expect(reRequests()).toEqual([{ requestNonPersonalizedAdsOnly: true }]);
    expect(ref.current?.uiPrefs.personalizedAdsEnabled).toBe(false);
    expect(JSON.parse(storageMock.__GET_STORAGE__()[UI_PREFS_KEY]).personalizedAdsEnabled).toBe(false);
  });

  it('(a) effective value turns on: exactly one re-request, already personalized', async () => {
    await AsyncStorage.setItem(UI_PREFS_KEY, JSON.stringify({ personalizedAdsEnabled: true }));
    // Açılışta form cevaplanmadı: UMP "required" → kişiselleştirme kapalı (oyuncu açmış olsa bile).
    mockRequestInfoUpdate.mockResolvedValue(consentInfo('REQUIRED'));
    mockShowForm.mockResolvedValue(consentInfo('REQUIRED'));
    const { ref } = await startAppWithReadyInterstitial();
    expect(service.personalizedAdsEnabled).toBe(false);

    await closePrivacyOptionsForm('OBTAINED');

    expect(service.personalizedAdsEnabled).toBe(true);
    expect(reRequests()).toEqual([{ requestNonPersonalizedAdsOnly: false }]);
    expect(ref.current?.uiPrefs.personalizedAdsEnabled).toBe(true);
  });

  it('(a) effective value turns off: exactly one re-request, not personalized', async () => {
    await AsyncStorage.setItem(UI_PREFS_KEY, JSON.stringify({ personalizedAdsEnabled: true }));
    mockRequestInfoUpdate.mockResolvedValue(consentInfo('OBTAINED'));
    const { ref } = await startAppWithReadyInterstitial();
    expect(service.personalizedAdsEnabled).toBe(true);

    await closePrivacyOptionsForm('UNKNOWN');

    expect(service.personalizedAdsEnabled).toBe(false);
    expect(reRequests()).toEqual([{ requestNonPersonalizedAdsOnly: true }]);
    expect(ref.current?.uiPrefs.personalizedAdsEnabled).toBe(true);
  });

  it('a later switch change after the form is a normal single re-request', async () => {
    await AsyncStorage.setItem(UI_PREFS_KEY, JSON.stringify({ personalizedAdsEnabled: false }));
    mockRequestInfoUpdate.mockResolvedValue(consentInfo('OBTAINED'));
    const { ref } = await startAppWithReadyInterstitial();
    await closePrivacyOptionsForm('OBTAINED');
    fakeAds[1].emit('loaded');

    await act(async () => {
      ref.current?.setPersonalizedAdsEnabled(true);
    });
    await flush();

    expect(reRequests()).toEqual([
      { requestNonPersonalizedAdsOnly: true },
      { requestNonPersonalizedAdsOnly: false },
    ]);
  });

  it('does not recompute or re-request when the form fails', async () => {
    await AsyncStorage.setItem(UI_PREFS_KEY, JSON.stringify({ personalizedAdsEnabled: true }));
    mockRequestInfoUpdate.mockResolvedValue(consentInfo('OBTAINED'));
    await startAppWithReadyInterstitial();

    mockShowPrivacyOptionsForm.mockRejectedValue(new Error('form'));
    await act(async () => {
      await expect(showAdPrivacyOptions()).resolves.toBe('error');
    });
    await flush();

    expect(service.personalizedAdsEnabled).toBe(true);
    expect(reRequests()).toEqual([]);
  });
});
