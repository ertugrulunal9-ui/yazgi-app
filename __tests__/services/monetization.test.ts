/**
 * Monetization Service Tests (Pure Ad-Only)
 */

import { monetizationService } from '../../src/services/monetization';

describe('MonetizationService (ad-only)', () => {
  beforeEach(async () => {
    localStorage.clear();
    delete process.env.EXPO_PUBLIC_INTERSTITIAL_SESSION_CAP;
    delete process.env.EXPO_PUBLIC_INTERSTITIAL_COOLDOWN_MS;
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
      const relationBoost = await monetizationService.showContextualRewardedAd('relationship_boost');
      const traitBoost = await monetizationService.showContextualRewardedAd('trait_boost');
      const shoppingDiscount = await monetizationService.showContextualRewardedAd('shopping_discount');
      const reportPreview = await monetizationService.showContextualRewardedAd('report_preview');
      const crisisRecovery = await monetizationService.showContextualRewardedAd('crisis_recovery');
      const altEnding = await monetizationService.showContextualRewardedAd('ending_alternative');

      expect(examPrep.success).toBe(true);
      expect(examPrep.rewardType).toBe('intelligence');
      expect(examPrep.amount).toBe(15);

      expect(energyRecovery.success).toBe(true);
      expect(energyRecovery.rewardType).toBe('energy');
      expect(energyRecovery.amount).toBe(25);

      expect(relationBoost.success).toBe(true);
      expect(relationBoost.rewardType).toBe('utility');
      expect(relationBoost.amount).toBe(5);

      expect(traitBoost.success).toBe(true);
      expect(traitBoost.rewardType).toBe('utility');
      expect(traitBoost.amount).toBe(1);

      expect(shoppingDiscount.success).toBe(true);
      expect(shoppingDiscount.rewardType).toBe('utility');
      expect(shoppingDiscount.amount).toBe(20);

      expect(reportPreview.success).toBe(true);
      expect(reportPreview.rewardType).toBe('utility');
      expect(reportPreview.amount).toBe(0);

      expect(crisisRecovery.success).toBe(true);
      expect(crisisRecovery.rewardType).toBe('utility');
      expect(crisisRecovery.amount).toBe(0);

      expect(altEnding.success).toBe(true);
      expect(altEnding.rewardType).toBe('utility');
      expect(altEnding.amount).toBe(0);
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
