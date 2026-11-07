/**
 * Geçiş reklamı: önceden yükleme ve yalnızca doğal arada gösterim (Y-013).
 * Eskiden reklam istek anında yükleniyor ve LOADED gelince (1-3 sn sonra) ekranda ne varsa onun üstüne
 * açılıyordu. Artık LOADED reklamı yalnızca "hazır" yapar; reklam yalnızca arada, o an hazırsa açılır.
 */
import { AppState } from 'react-native';
import {
  INTERSTITIAL_AD_LOAD_TIMEOUT_MS,
  INTERSTITIAL_AD_MAX_AGE_MS,
  INTERSTITIAL_AD_OPEN_TIMEOUT_MS,
  monetizationService,
} from '../../src/services/monetization';

const EVENTS = { loaded: 'loaded', error: 'error', closed: 'closed' } as const;

type Listener = (payload?: unknown) => void;

interface FakeInterstitial {
  options: Record<string, unknown> | undefined;
  loaded: boolean;
  load: jest.Mock;
  show: jest.Mock;
  unsubscribe: jest.Mock;
  emit: (type: string, payload?: unknown) => void;
}

/** Yüklemeyi kendisi bitirmeyen sahte AdMob: LOADED/ERROR/CLOSED testten tetiklenir. */
const installFakeAdMob = (showImpl?: () => unknown) => {
  const ads: FakeInterstitial[] = [];
  const createForAdRequest = jest.fn((_unitId: string, options?: Record<string, unknown>) => {
    const listeners = new Map<string, Listener[]>();
    const ad: FakeInterstitial & { addAdEventListener: jest.Mock } = {
      options,
      loaded: false,
      load: jest.fn(),
      show: jest.fn(showImpl ?? (() => Promise.resolve())),
      unsubscribe: jest.fn(),
      // Kütüphane dinleyiciyi kaldırsa bile kaldırmasa bile olay iletilir: servis kendisi yok saymalı.
      emit: (type, payload) => {
        if (type === EVENTS.loaded) ad.loaded = true;
        if (type === EVENTS.error || type === EVENTS.closed) ad.loaded = false;
        (listeners.get(type) || []).forEach(listener => listener(payload));
      },
      addAdEventListener: jest.fn((type: string, listener: Listener) => {
        listeners.set(type, [...(listeners.get(type) || []), listener]);
        return ad.unsubscribe;
      }),
    };
    ads.push(ad);
    return ad;
  });

  const service = monetizationService as any;
  service.isInitialized = true;
  service.adProvider = 'admob';
  service.adMobModule = {
    InterstitialAd: { createForAdRequest },
    AdEventType: { LOADED: EVENTS.loaded, ERROR: EVENTS.error, CLOSED: EVENTS.closed },
    TestIds: { REWARDED: 'test-rewarded', INTERSTITIAL: 'test-interstitial' },
  };
  service.adsEnabled = true;
  service.personalizedAdsEnabled = false;
  service.interstitialShownThisSession = 0;
  service.interstitialSessionLimit = 2;
  service.interstitialCooldownMs = 0;
  service.lastInterstitialShownAt = 0;

  return { ads, createForAdRequest, latest: () => ads[ads.length - 1] };
};

const flushMicrotasks = async () => {
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
  }
};

const setAppState = (state: string) => {
  (AppState as unknown as { currentState: string }).currentState = state;
};

describe('Geçiş reklamı: önceden yükleme ve doğal ara', () => {
  beforeEach(async () => {
    localStorage.clear();
    (monetizationService as any).__reset__();
    await monetizationService.initialize();
  });

  afterEach(() => {
    setAppState('active');
    (monetizationService as any).__reset__();
    jest.useRealTimers();
  });

  it('önceden yükleme reklamı ister ama LOADED reklamı açmaz', () => {
    const fake = installFakeAdMob();

    monetizationService.preloadInterstitialAd();
    expect(fake.createForAdRequest).toHaveBeenCalledTimes(1);
    expect(fake.latest().load).toHaveBeenCalledTimes(1);
    expect(fake.latest().options).toEqual({ requestNonPersonalizedAdsOnly: true });

    fake.latest().emit(EVENTS.loaded);
    expect(fake.latest().show).not.toHaveBeenCalled();
  });

  it('yükleniyor ya da hazırken ikinci istek yapılmaz', () => {
    const fake = installFakeAdMob();

    monetizationService.preloadInterstitialAd();
    monetizationService.preloadInterstitialAd();
    fake.latest().emit(EVENTS.loaded);
    monetizationService.preloadInterstitialAd();

    expect(fake.createForAdRequest).toHaveBeenCalledTimes(1);
  });

  it('arada reklam hazırsa beklemeden açılır; kapanınca gösterildi sayılır', async () => {
    const fake = installFakeAdMob();
    monetizationService.preloadInterstitialAd();
    fake.latest().emit(EVENTS.loaded);

    const pending = monetizationService.showInterstitialAdDetailed();
    // show() aynı çağrının içinde (await'siz) istenir: ara geçmeden açılır
    expect(fake.latest().show).toHaveBeenCalledTimes(1);

    fake.latest().emit(EVENTS.closed);
    await expect(pending).resolves.toEqual({ shown: true, reason: 'shown', provider: 'admob' });
    expect((monetizationService as any).interstitialShownThisSession).toBe(1);
  });

  it('show() sonrası OPENED gelmezse gösterim başarısız sayılır ve yuva bırakılır (takılı kalmaz)', async () => {
    jest.useFakeTimers();
    const fake = installFakeAdMob();
    (monetizationService as any).adMobModule.AdEventType.OPENED = 'opened';
    monetizationService.preloadInterstitialAd();
    fake.latest().emit(EVENTS.loaded);

    const pending = monetizationService.showInterstitialAdDetailed();
    expect(fake.latest().show).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(INTERSTITIAL_AD_OPEN_TIMEOUT_MS);

    await expect(pending).resolves.toEqual({ shown: false, reason: 'ad_error', provider: 'admob' });
    expect((monetizationService as any).interstitialShownThisSession).toBe(0);
    monetizationService.preloadInterstitialAd();
    expect(fake.createForAdRequest).toHaveBeenCalledTimes(2);
  });

  it('OPENED gelirse bekçi kapanır; uzun izlemeden sonra kapanınca gösterildi sayılır', async () => {
    jest.useFakeTimers();
    const fake = installFakeAdMob();
    (monetizationService as any).adMobModule.AdEventType.OPENED = 'opened';
    monetizationService.preloadInterstitialAd();
    fake.latest().emit(EVENTS.loaded);

    const pending = monetizationService.showInterstitialAdDetailed();
    fake.latest().emit('opened');
    jest.advanceTimersByTime(INTERSTITIAL_AD_OPEN_TIMEOUT_MS * 3);
    fake.latest().emit(EVENTS.closed);

    await expect(pending).resolves.toEqual({ shown: true, reason: 'shown', provider: 'admob' });
    expect((monetizationService as any).interstitialShownThisSession).toBe(1);
  });

  it('arada reklam hazır değilse fırsat atlanır; ara geçtikten sonra gelen LOADED reklam açmaz', async () => {
    const fake = installFakeAdMob();
    monetizationService.preloadInterstitialAd();

    const result = await monetizationService.showInterstitialAdDetailed();
    expect(result).toEqual({ shown: false, reason: 'not_ready', provider: 'admob' });

    fake.latest().emit(EVENTS.loaded);
    await flushMicrotasks();
    expect(fake.latest().show).not.toHaveBeenCalled();
    expect((monetizationService as any).interstitialShownThisSession).toBe(0);

    // Geç gelen reklam kaybolmaz: bir sonraki arada hazırdır
    const next = monetizationService.showInterstitialAdDetailed();
    expect(fake.latest().show).toHaveBeenCalledTimes(1);
    fake.latest().emit(EVENTS.closed);
    await expect(next).resolves.toMatchObject({ shown: true, reason: 'shown' });
  });

  it('hiç yükleme yoksa arada not_ready döner ve istek yapılmaz', async () => {
    const fake = installFakeAdMob();

    const result = await monetizationService.showInterstitialAdDetailed();

    expect(result).toMatchObject({ shown: false, reason: 'not_ready' });
    expect(fake.createForAdRequest).not.toHaveBeenCalled();
  });

  it('uygulama arka plandayken hazır reklam açılmaz ve harcanmaz', async () => {
    const fake = installFakeAdMob();
    monetizationService.preloadInterstitialAd();
    fake.latest().emit(EVENTS.loaded);

    setAppState('background');
    const result = await monetizationService.showInterstitialAdDetailed();
    expect(result).toMatchObject({ shown: false, reason: 'background' });
    expect(fake.latest().show).not.toHaveBeenCalled();

    setAppState('active');
    const next = monetizationService.showInterstitialAdDetailed();
    expect(fake.latest().show).toHaveBeenCalledTimes(1);
    fake.latest().emit(EVENTS.closed);
    await expect(next).resolves.toMatchObject({ shown: true });
  });

  it(`LOADED ${INTERSTITIAL_AD_LOAD_TIMEOUT_MS} ms içinde gelmezse istek bırakılır; geç LOADED yok sayılır`, async () => {
    jest.useFakeTimers();
    const fake = installFakeAdMob();
    monetizationService.preloadInterstitialAd();
    const stale = fake.latest();

    jest.advanceTimersByTime(INTERSTITIAL_AD_LOAD_TIMEOUT_MS - 1);
    expect(stale.unsubscribe).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(stale.unsubscribe).toHaveBeenCalled();

    stale.emit(EVENTS.loaded);
    const result = await monetizationService.showInterstitialAdDetailed();
    expect(result).toMatchObject({ shown: false, reason: 'not_ready' });
    expect(stale.show).not.toHaveBeenCalled();

    // Takılı kalmaz: yeni ön yükleme yeni istek açar
    monetizationService.preloadInterstitialAd();
    expect(fake.createForAdRequest).toHaveBeenCalledTimes(2);
  });

  it('yükleme hatasından sonra yeni ön yükleme yeni istek açar', () => {
    const fake = installFakeAdMob();
    monetizationService.preloadInterstitialAd();
    fake.latest().emit(EVENTS.error, new Error('no fill'));

    monetizationService.preloadInterstitialAd();

    expect(fake.createForAdRequest).toHaveBeenCalledTimes(2);
  });

  it('çok eski hazır reklam gösterilmez, atılır', async () => {
    jest.useFakeTimers();
    const fake = installFakeAdMob();
    monetizationService.preloadInterstitialAd();
    const old = fake.latest();
    old.emit(EVENTS.loaded);

    jest.setSystemTime(Date.now() + INTERSTITIAL_AD_MAX_AGE_MS);
    const result = await monetizationService.showInterstitialAdDetailed();

    expect(result).toMatchObject({ shown: false, reason: 'not_ready' });
    expect(old.show).not.toHaveBeenCalled();
    monetizationService.preloadInterstitialAd();
    expect(fake.createForAdRequest).toHaveBeenCalledTimes(2);
  });

  it('kişiselleştirme tercihi değişince eski tercihle yüklenen reklam atılır ve yenisi istenir', async () => {
    const fake = installFakeAdMob();
    (monetizationService as any).personalizedAdsEnabled = true;
    monetizationService.preloadInterstitialAd();
    const personalized = fake.latest();
    personalized.emit(EVENTS.loaded);
    expect(personalized.options).toEqual({ requestNonPersonalizedAdsOnly: false });

    monetizationService.setPersonalizedAdsEnabled(false);

    expect(personalized.unsubscribe).toHaveBeenCalled();
    expect(fake.createForAdRequest).toHaveBeenCalledTimes(2);
    expect(fake.latest().options).toEqual({ requestNonPersonalizedAdsOnly: true });
    const result = await monetizationService.showInterstitialAdDetailed();
    expect(result).toMatchObject({ shown: false, reason: 'not_ready' });
    expect(personalized.show).not.toHaveBeenCalled();
  });

  it('show() reddedilirse ya da hata atarsa gösterilmedi sayılır', async () => {
    const rejecting = installFakeAdMob(() => Promise.reject(new Error('show failed')));
    monetizationService.preloadInterstitialAd();
    rejecting.latest().emit(EVENTS.loaded);
    await expect(monetizationService.showInterstitialAdDetailed())
      .resolves.toMatchObject({ shown: false, reason: 'ad_error' });

    const throwing = installFakeAdMob(() => {
      throw new Error('not loaded');
    });
    monetizationService.preloadInterstitialAd();
    throwing.latest().emit(EVENTS.loaded);
    await expect(monetizationService.showInterstitialAdDetailed())
      .resolves.toMatchObject({ shown: false, reason: 'ad_error' });
    expect((monetizationService as any).interstitialShownThisSession).toBe(0);
  });

  it('gösterim sırasında ERROR gelirse gösterilmedi sayılır', async () => {
    const fake = installFakeAdMob();
    monetizationService.preloadInterstitialAd();
    fake.latest().emit(EVENTS.loaded);

    const pending = monetizationService.showInterstitialAdDetailed();
    fake.latest().emit(EVENTS.error, new Error('failed to show'));

    await expect(pending).resolves.toMatchObject({ shown: false, reason: 'ad_error' });
  });

  it('oturum sınırı dolunca ön yükleme istek yapmaz; sınır ve bekleme süresi aynı', async () => {
    const fake = installFakeAdMob();
    const service = monetizationService as any;
    service.interstitialSessionLimit = 1;
    service.interstitialCooldownMs = 60_000;

    monetizationService.preloadInterstitialAd();
    fake.latest().emit(EVENTS.loaded);
    const first = monetizationService.showInterstitialAdDetailed();
    fake.latest().emit(EVENTS.closed);
    await expect(first).resolves.toMatchObject({ shown: true });

    monetizationService.preloadInterstitialAd();
    expect(fake.createForAdRequest).toHaveBeenCalledTimes(1);
    await expect(monetizationService.showInterstitialAdDetailed())
      .resolves.toMatchObject({ shown: false, reason: 'session_cap' });

    service.interstitialSessionLimit = 5;
    await expect(monetizationService.showInterstitialAdDetailed())
      .resolves.toMatchObject({ shown: false, reason: 'cooldown' });
  });

  it('servis başlatılmadan istenen ön yükleme başlatma bitince yapılır; arada başlatma beklenmez', async () => {
    const service = monetizationService as any;
    service.__reset__();

    monetizationService.preloadInterstitialAd();
    const result = await monetizationService.showInterstitialAdDetailed();
    expect(result).toMatchObject({ shown: false, reason: 'not_ready' });
    expect(service.isInitialized).toBe(false);
    expect(service.interstitialPreloadRequested).toBe(true);

    const preloadSpy = jest.spyOn(monetizationService, 'preloadInterstitialAd');
    await monetizationService.initialize();
    expect(preloadSpy).toHaveBeenCalledTimes(1);
    expect(service.interstitialPreloadRequested).toBe(false);
    preloadSpy.mockRestore();
  });
});
