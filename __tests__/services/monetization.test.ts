/**
 * Monetization Service Tests (Pure Ad-Only)
 */

import { monetizationService } from '../../src/services/monetization';

describe('MonetizationService (ad-only)', () => {
  beforeEach(async () => {
    localStorage.clear();
    delete process.env.EXPO_PUBLIC_INTERSTITIAL_SESSION_CAP;
    delete process.env.EXPO_PUBLIC_INTERSTITIAL_COOLDOWN_MS;
    delete process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID;
    delete process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_UNIT_ID;
    (monetizationService as any).__reset__();
    await monetizationService.initialize();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('IAP compatibility stubs', () => {
    it('returns empty products list', async () => {
      await expect(monetizationService.getProducts()).resolves.toEqual([]);
    });

    it('disables purchases explicitly', async () => {
      const result = await monetizationService.purchaseProduct('premium_traits');
      expect(result.success).toBe(false);
      expect(result.productId).toBe('premium_traits');
      expect(result.error).toContain('IAP disabled');
    });

    it('always reports no ownership / no premium', () => {
      expect(monetizationService.hasProduct('anything')).toBe(false);
      expect(monetizationService.isPremium()).toBe(false);
    });

    it('restores no purchases', async () => {
      await expect(monetizationService.restorePurchases()).resolves.toEqual([]);
    });

    it('keeps ads unaffected after purchase attempts', async () => {
      await monetizationService.purchaseProduct('remove_ads');
      const interstitial = await monetizationService.showInterstitialAdDetailed();
      expect(interstitial.shown).toBe(true);
    });
  });

  describe('Rewarded ads', () => {
    it('serves base rewarded ad and decrements daily quota', async () => {
      const before = monetizationService.getRemainingRewardedAds();
      const result = await monetizationService.showRewardedAd('energy');
      const after = monetizationService.getRemainingRewardedAds();

      expect(result.success).toBe(true);
      expect(result.reward?.type).toBe('energy');
      expect(after).toBe(before - 1);
    });

    it('enforces daily 8-ad limit', async () => {
      for (let i = 0; i < 8; i += 1) {
        const result = await monetizationService.showRewardedAd('money');
        expect(result.success).toBe(true);
      }

      const blocked = await monetizationService.showRewardedAd('money');
      expect(blocked.success).toBe(false);
      expect(blocked.error).toContain('Daily ad limit');
      expect(monetizationService.getRemainingRewardedAds()).toBe(0);
    });

    it('maps contextual rewarded placements to expected rewards', async () => {
      const examPrep = await monetizationService.showContextualRewardedAd('exam_prep');
      const energyRecovery = await monetizationService.showContextualRewardedAd('energy_depleted');
      const crisisRecovery = await monetizationService.showContextualRewardedAd('crisis_recovery');
      const altEnding = await monetizationService.showContextualRewardedAd('ending_alternative');
      const undoChoice = await monetizationService.showContextualRewardedAd('undo_choice');

      expect(examPrep.success).toBe(true);
      expect(examPrep.rewardType).toBe('intelligence');
      expect(examPrep.amount).toBe(15);

      expect(energyRecovery.success).toBe(true);
      expect(energyRecovery.rewardType).toBe('energy');
      expect(energyRecovery.amount).toBe(25);

      expect(crisisRecovery.success).toBe(true);
      expect(crisisRecovery.rewardType).toBe('utility');
      expect(crisisRecovery.amount).toBe(0);

      expect(altEnding.success).toBe(true);
      expect(altEnding.rewardType).toBe('utility');
      expect(altEnding.amount).toBe(0);

      expect(undoChoice.success).toBe(true);
      expect(undoChoice.rewardType).toBe('utility');
      expect(undoChoice.amount).toBe(0);
    });

    it('uses RewardedAdEventType.LOADED for rewarded ads with AdMob provider', async () => {
      const service = monetizationService as any;
      const listeners = new Map<string, ((payload?: any) => void)[]>();
      const registeredTypes: string[] = [];

      const eventNames = {
        adLoaded: 'loaded',
        adError: 'error',
        adClosed: 'closed',
        rewardedLoaded: 'rewarded_loaded',
        earnedReward: 'rewarded_earned_reward',
      } as const;

      const rewardedAd = {
        addAdEventListener: (type: string, listener: (payload?: any) => void) => {
          registeredTypes.push(type);
          listeners.set(type, [...(listeners.get(type) || []), listener]);
          return () => {};
        },
        show: () => {
          const earnedListeners = listeners.get(eventNames.earnedReward) || [];
          earnedListeners.forEach(listener => listener({ amount: 20 }));
        },
        load: () => {
          const loadedListeners = listeners.get(eventNames.rewardedLoaded) || [];
          loadedListeners.forEach(listener => listener());
        },
      };

      service.isInitialized = true;
      service.adProvider = 'admob';
      service.adMobModule = {
        RewardedAd: {
          createForAdRequest: () => rewardedAd,
        },
        AdEventType: {
          LOADED: eventNames.adLoaded,
          ERROR: eventNames.adError,
          CLOSED: eventNames.adClosed,
        },
        RewardedAdEventType: {
          LOADED: eventNames.rewardedLoaded,
          EARNED_REWARD: eventNames.earnedReward,
        },
        TestIds: {
          REWARDED: 'test-rewarded',
          INTERSTITIAL: 'test-interstitial',
        },
      };
      service.adsEnabled = true;
      service.personalizedAdsEnabled = false;
      service.rewardedAdCount = 0;
      service.dailyAdLimit = 8;

      const result = await service.showRewardedAd('energy');

      expect(result.success).toBe(true);
      expect(registeredTypes).toContain(eventNames.rewardedLoaded);
      expect(registeredTypes).not.toContain(eventNames.adLoaded);
    });

    it('blocks placeholder AdMob unit IDs before ad request creation', async () => {
      process.env.EXPO_PUBLIC_ADMOB_ANDROID_REWARDED_UNIT_ID = 'TODO_REPLACE_WITH_ADMOB_ANDROID_REWARDED_UNIT_ID';

      const service = monetizationService as any;
      const createForAdRequest = jest.fn();
      service.isInitialized = true;
      service.adProvider = 'admob';
      service.adMobModule = {
        RewardedAd: { createForAdRequest },
        AdEventType: { LOADED: 'loaded', ERROR: 'error', CLOSED: 'closed' },
        RewardedAdEventType: { LOADED: 'rewarded_loaded', EARNED_REWARD: 'earned_reward' },
      };
      service.adsEnabled = true;
      service.rewardedAdCount = 0;
      service.dailyAdLimit = 8;

      const result = await service.showRewardedAd('energy');

      expect(result.success).toBe(false);
      expect(result.error).toContain('dependencies');
      expect(createForAdRequest).not.toHaveBeenCalled();
    });
  });

  describe('Interstitial ads', () => {
    it('uses default session cap of 2', async () => {
      const first = await monetizationService.showInterstitialAdDetailed();
      const second = await monetizationService.showInterstitialAdDetailed();
      const third = await monetizationService.showInterstitialAdDetailed();

      expect(first.shown).toBe(true);
      expect(second.shown).toBe(true);
      expect(third.shown).toBe(false);
      expect(third.reason).toBe('session_cap');
    });

    it('applies env runtime config for session cap', async () => {
      process.env.EXPO_PUBLIC_INTERSTITIAL_SESSION_CAP = '1';
      process.env.EXPO_PUBLIC_INTERSTITIAL_COOLDOWN_MS = '0';

      (monetizationService as any).__reset__();
      await monetizationService.initialize();

      const first = await monetizationService.showInterstitialAdDetailed();
      const second = await monetizationService.showInterstitialAdDetailed();

      expect(first.shown).toBe(true);
      expect(second.shown).toBe(false);
      expect(second.reason).toBe('session_cap');
    });

    it('applies env runtime config for cooldown', async () => {
      process.env.EXPO_PUBLIC_INTERSTITIAL_SESSION_CAP = '5';
      process.env.EXPO_PUBLIC_INTERSTITIAL_COOLDOWN_MS = '60000';

      (monetizationService as any).__reset__();
      await monetizationService.initialize();

      const first = await monetizationService.showInterstitialAdDetailed();
      const second = await monetizationService.showInterstitialAdDetailed();

      expect(first.shown).toBe(true);
      expect(second.shown).toBe(false);
      expect(second.reason).toBe('cooldown');
      expect(typeof second.cooldownRemainingMs).toBe('number');
      expect((second.cooldownRemainingMs ?? 0) > 0).toBe(true);
    });
  });

  describe('Utility safety', () => {
    it('allows no-op entitlement provider wiring', () => {
      expect(() => monetizationService.setEntitlementTokenProvider(async () => null)).not.toThrow();
      expect(() => monetizationService.setEntitlementTokenProvider(null)).not.toThrow();
    });
  });
});
