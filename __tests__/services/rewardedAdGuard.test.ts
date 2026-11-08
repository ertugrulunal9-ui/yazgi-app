/**
 * Ödüllü reklam: gösterim öncesi kontrol (shouldShow) ve yükleme zaman aşımı.
 * Oyuncu reklam yüklenirken sonuç ekranından çıktıysa reklam hiç açılmamalı (AdMob: beklenmedik
 * tam ekran reklam yasak); yükleme takılırsa istek bırakılmalı ve sonradan gelen LOADED reklam açmamalı.
 */
import { AppState } from 'react-native';
import {
  monetizationService,
  REWARDED_AD_CANCELLED_ERROR,
  REWARDED_AD_LOAD_TIMEOUT_ERROR,
  REWARDED_AD_LOAD_TIMEOUT_MS,
} from '../../src/services/monetization';

const EVENTS = {
  adLoaded: 'loaded',
  adError: 'error',
  adClosed: 'closed',
  rewardedLoaded: 'rewarded_loaded',
  earnedReward: 'rewarded_earned_reward',
} as const;

type Listener = (payload?: any) => void;

/** Yüklemeyi kendisi bitirmeyen sahte AdMob reklamı: LOADED/ERROR/ödül testten tetiklenir. */
const installFakeAdMob = (showImpl?: () => unknown) => {
  const listeners = new Map<string, Listener[]>();
  const unsubscribe = jest.fn();
  const emit = (type: string, payload?: unknown) => {
    (listeners.get(type) || []).forEach(listener => listener(payload));
  };
  const rewardedAd = {
    addAdEventListener: jest.fn((type: string, listener: Listener) => {
      listeners.set(type, [...(listeners.get(type) || []), listener]);
      return unsubscribe;
    }),
    show: jest.fn(showImpl ?? (() => Promise.resolve())),
    load: jest.fn(),
  };

  const service = monetizationService as any;
  service.isInitialized = true;
  service.adProvider = 'admob';
  service.canRequestAds = true;
  service.adMobModule = {
    RewardedAd: { createForAdRequest: () => rewardedAd },
    AdEventType: { LOADED: EVENTS.adLoaded, ERROR: EVENTS.adError, CLOSED: EVENTS.adClosed },
    RewardedAdEventType: { LOADED: EVENTS.rewardedLoaded, EARNED_REWARD: EVENTS.earnedReward },
    TestIds: { REWARDED: 'test-rewarded', INTERSTITIAL: 'test-interstitial' },
  };
  service.adsEnabled = true;
  service.personalizedAdsEnabled = false;
  service.rewardedAdCount = 0;
  service.dailyAdLimit = 8;

  return {
    rewardedAd,
    unsubscribe,
    loaded: () => emit(EVENTS.rewardedLoaded),
    earnReward: () => emit(EVENTS.earnedReward, { amount: 20 }),
  };
};

const flushMicrotasks = async () => {
  for (let i = 0; i < 5; i += 1) {
    await Promise.resolve();
  }
};

describe('Ödüllü reklam: gösterim öncesi kontrol ve zaman aşımı', () => {
  beforeEach(async () => {
    localStorage.clear();
    (monetizationService as any).__reset__();
    await monetizationService.initialize();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('AdMob', () => {
    it('shouldShow yüklenince sorulur; false ise reklam açılmaz, iptal döner ve hak düşmez', async () => {
      const ad = installFakeAdMob();
      const shouldShow = jest.fn(() => false);
      const remainingBefore = monetizationService.getRemainingRewardedAds();

      const pending = monetizationService.showContextualRewardedAd('undo_choice', { shouldShow });
      expect(shouldShow).not.toHaveBeenCalled();
      expect(ad.rewardedAd.load).toHaveBeenCalledTimes(1);

      ad.loaded();
      const result = await pending;

      expect(shouldShow).toHaveBeenCalledTimes(1);
      expect(ad.rewardedAd.show).not.toHaveBeenCalled();
      expect(result).toMatchObject({ success: false, error: REWARDED_AD_CANCELLED_ERROR, amount: 0 });
      expect(monetizationService.getRemainingRewardedAds()).toBe(remainingBefore);
      expect(ad.unsubscribe).toHaveBeenCalled();
    });

    it('shouldShow true ise reklam açılır, ödül gelir ve hak bir düşer', async () => {
      const ad = installFakeAdMob();
      const remainingBefore = monetizationService.getRemainingRewardedAds();

      const pending = monetizationService.showContextualRewardedAd('undo_choice', { shouldShow: () => true });
      ad.loaded();
      expect(ad.rewardedAd.show).toHaveBeenCalledTimes(1);
      ad.earnReward();
      const result = await pending;

      expect(result.success).toBe(true);
      expect(monetizationService.getRemainingRewardedAds()).toBe(remainingBefore - 1);
    });

    it('shouldShow verilmezse davranış aynı: yüklenince açılır', async () => {
      const ad = installFakeAdMob();

      const pending = monetizationService.showContextualRewardedAd('energy_depleted');
      ad.loaded();
      expect(ad.rewardedAd.show).toHaveBeenCalledTimes(1);
      ad.earnReward();

      await expect(pending).resolves.toMatchObject({ success: true, rewardType: 'energy', amount: 25 });
    });

    it('uygulama arka plandayken yüklenen reklam açılmaz (shouldShow verilmese de) ve hak düşmez', async () => {
      const ad = installFakeAdMob();
      const appState = AppState as unknown as { currentState: string };
      const remainingBefore = monetizationService.getRemainingRewardedAds();

      const pending = monetizationService.showContextualRewardedAd('energy_depleted');
      appState.currentState = 'background';
      try {
        ad.loaded();
        const result = await pending;

        expect(ad.rewardedAd.show).not.toHaveBeenCalled();
        expect(result).toMatchObject({ success: false, error: REWARDED_AD_CANCELLED_ERROR });
        expect(monetizationService.getRemainingRewardedAds()).toBe(remainingBefore);
      } finally {
        appState.currentState = 'active';
      }
    });

    it('shouldShow hata fırlatırsa reklam açılmaz', async () => {
      const ad = installFakeAdMob();

      const pending = monetizationService.showRewardedAd('money', {
        shouldShow: () => {
          throw new Error('bileşen yok');
        },
      });
      ad.loaded();

      await expect(pending).resolves.toMatchObject({ success: false, error: REWARDED_AD_CANCELLED_ERROR });
      expect(ad.rewardedAd.show).not.toHaveBeenCalled();
    });

    it(`LOADED ${REWARDED_AD_LOAD_TIMEOUT_MS} ms içinde gelmezse başarısız döner; geç gelen LOADED reklam açmaz`, async () => {
      jest.useFakeTimers();
      const ad = installFakeAdMob();
      const remainingBefore = monetizationService.getRemainingRewardedAds();
      let settled = false;

      const pending = monetizationService.showRewardedAd('money').then(result => {
        settled = true;
        return result;
      });

      jest.advanceTimersByTime(REWARDED_AD_LOAD_TIMEOUT_MS - 1);
      await flushMicrotasks();
      expect(settled).toBe(false);

      jest.advanceTimersByTime(1);
      const result = await pending;
      expect(result).toMatchObject({ success: false, error: REWARDED_AD_LOAD_TIMEOUT_ERROR });
      expect(ad.unsubscribe).toHaveBeenCalled();

      // Kütüphane dinleyiciyi kaldırmasa bile geç gelen LOADED reklam açmamalı.
      ad.loaded();
      ad.earnReward();
      expect(ad.rewardedAd.show).not.toHaveBeenCalled();
      expect(monetizationService.getRemainingRewardedAds()).toBe(remainingBefore);
    });

    it('reklam açıldıktan sonra izleme süresi zaman aşımına girmez', async () => {
      jest.useFakeTimers();
      const ad = installFakeAdMob();

      const pending = monetizationService.showRewardedAd('money');
      ad.loaded();
      jest.advanceTimersByTime(REWARDED_AD_LOAD_TIMEOUT_MS * 3);
      ad.earnReward();

      await expect(pending).resolves.toMatchObject({ success: true });
    });

    it('show() reddedilirse istek takılı kalmaz, başarısız döner', async () => {
      const ad = installFakeAdMob(() => Promise.reject(new Error('show failed')));

      const pending = monetizationService.showRewardedAd('money');
      ad.loaded();

      await expect(pending).resolves.toMatchObject({ success: false, error: 'show failed' });
    });
  });

  describe('Sahte reklam (geliştirme/web)', () => {
    it('shouldShow false ise iptal döner ve hak düşmez', async () => {
      const remainingBefore = monetizationService.getRemainingRewardedAds();

      const result = await monetizationService.showContextualRewardedAd('crisis_recovery', {
        shouldShow: () => false,
      });

      expect(result).toMatchObject({ success: false, error: REWARDED_AD_CANCELLED_ERROR });
      expect(monetizationService.getRemainingRewardedAds()).toBe(remainingBefore);
    });
  });
});
