import {
  createInitialAdFatigueState,
  canOfferAd,
  recordAdShown,
  tickAdFatigue,
} from '../../src/services/adFatiguePolicy';

describe('adFatiguePolicy (simplified)', () => {
  describe('createInitialAdFatigueState', () => {
    it('starts clean', () => {
      const state = createInitialAdFatigueState();
      expect(state.totalAdsShownThisSession).toBe(0);
      expect(state.lastShownTurn).toBe(-999);
    });
  });

  describe('canOfferAd', () => {
    it('allows first ad offer', () => {
      const state = createInitialAdFatigueState();
      expect(canOfferAd(state, 5)).toBe(true);
    });

    it('blocks when global daily limit reached', () => {
      const state = { ...createInitialAdFatigueState(), totalAdsShownThisSession: 5 };
      expect(canOfferAd(state, 100)).toBe(false);
    });

    it('allows when just under global limit', () => {
      const state = { ...createInitialAdFatigueState(), totalAdsShownThisSession: 4 };
      expect(canOfferAd(state, 100)).toBe(true);
    });

    it('blocks within cooldown turns', () => {
      const state = { ...createInitialAdFatigueState(), lastShownTurn: 10 };
      expect(canOfferAd(state, 11)).toBe(false); // 1 turn apart <= cooldown of 1
    });

    it('allows after cooldown expires', () => {
      const state = { ...createInitialAdFatigueState(), lastShownTurn: 10 };
      expect(canOfferAd(state, 12)).toBe(true); // 2 turns apart > cooldown of 1
    });
  });

  describe('recordAdShown', () => {
    it('increments total and updates last shown turn', () => {
      const state = createInitialAdFatigueState();
      const next = recordAdShown(state, 5);
      expect(next.totalAdsShownThisSession).toBe(1);
      expect(next.lastShownTurn).toBe(5);
    });

    it('accumulates across multiple shows', () => {
      let state = createInitialAdFatigueState();
      state = recordAdShown(state, 3);
      state = recordAdShown(state, 7);
      expect(state.totalAdsShownThisSession).toBe(2);
      expect(state.lastShownTurn).toBe(7);
    });
  });

  describe('tickAdFatigue', () => {
    it('is a no-op (returns same state)', () => {
      const state = createInitialAdFatigueState();
      const next = tickAdFatigue(state);
      expect(next).toBe(state);
    });
  });
});
