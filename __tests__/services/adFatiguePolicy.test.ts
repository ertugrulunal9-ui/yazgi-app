import {
  createInitialAdFatigueState,
  canOfferAd,
  recordAdOffer,
  recordAdShown,
  recordAdDeclined,
  tickAdFatigue,
} from '../../src/services/adFatiguePolicy';
import { AD_FATIGUE_POLICY } from '../../src/config/gameBalance';

describe('adFatiguePolicy', () => {
  describe('createInitialAdFatigueState', () => {
    it('starts clean', () => {
      const state = createInitialAdFatigueState();
      expect(state.totalAdsShownThisSession).toBe(0);
      expect(state.consecutiveDeclines).toBe(0);
      expect(state.snoozeTurnsRemaining).toBe(0);
    });
  });

  describe('canOfferAd', () => {
    it('allows first ad offer', () => {
      const state = createInitialAdFatigueState();
      const result = canOfferAd(state, 'hub', 5);
      expect(result.allowed).toBe(true);
    });

    it('blocks when global cap reached', () => {
      const state = {
        ...createInitialAdFatigueState(),
        totalAdsShownThisSession: AD_FATIGUE_POLICY.globalDailyCap,
      };
      const result = canOfferAd(state, 'hub', 100);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('GLOBAL_CAP_REACHED');
    });

    it('blocks when placement cap reached', () => {
      const state = {
        ...createInitialAdFatigueState(),
        placementCounts: { hub: AD_FATIGUE_POLICY.perPlacementSessionCap },
      };
      const result = canOfferAd(state, 'hub', 100);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('PLACEMENT_CAP_REACHED');
    });

    it('allows different placement even if another is capped', () => {
      const state = {
        ...createInitialAdFatigueState(),
        placementCounts: { hub: AD_FATIGUE_POLICY.perPlacementSessionCap },
      };
      const result = canOfferAd(state, 'trait_boost', 100);
      expect(result.allowed).toBe(true);
    });

    it('blocks within min turn cooldown', () => {
      const state = {
        ...createInitialAdFatigueState(),
        lastOfferTurn: 10,
      };
      const result = canOfferAd(state, 'hub', 11); // Only 1 turn apart, need minTurnsBetweenOffers
      expect(result.allowed).toBe(false);
    });

    it('allows after sufficient turns', () => {
      const state = {
        ...createInitialAdFatigueState(),
        lastOfferTurn: 10,
      };
      const result = canOfferAd(state, 'hub', 10 + AD_FATIGUE_POLICY.minTurnsBetweenOffers);
      expect(result.allowed).toBe(true);
    });

    it('blocks during decline snooze', () => {
      const state = {
        ...createInitialAdFatigueState(),
        snoozeTurnsRemaining: 2,
      };
      const result = canOfferAd(state, 'hub', 100);
      expect(result.allowed).toBe(false);
      expect(result.reason).toBe('DECLINE_SNOOZE_ACTIVE');
    });
  });

  describe('recordAdShown', () => {
    it('increments total and placement count', () => {
      const state = createInitialAdFatigueState();
      const next = recordAdShown(state, 'hub', 5);
      expect(next.totalAdsShownThisSession).toBe(1);
      expect(next.placementCounts.hub).toBe(1);
      expect(next.lastShownTurn).toBe(5);
    });

    it('resets consecutive declines', () => {
      const state = { ...createInitialAdFatigueState(), consecutiveDeclines: 2 };
      const next = recordAdShown(state, 'hub', 5);
      expect(next.consecutiveDeclines).toBe(0);
      expect(next.snoozeTurnsRemaining).toBe(0);
    });
  });

  describe('recordAdDeclined', () => {
    it('increments decline counter', () => {
      const state = createInitialAdFatigueState();
      const next = recordAdDeclined(state, 5);
      expect(next.consecutiveDeclines).toBe(1);
      expect(next.snoozeTurnsRemaining).toBe(0);
    });

    it('triggers snooze after 2 consecutive declines', () => {
      let state = createInitialAdFatigueState();
      state = recordAdDeclined(state, 5);
      state = recordAdDeclined(state, 6);
      expect(state.consecutiveDeclines).toBe(2);
      expect(state.snoozeTurnsRemaining).toBe(AD_FATIGUE_POLICY.declineSnoozeTurns);
    });
  });

  describe('tickAdFatigue', () => {
    it('decrements snooze remaining', () => {
      const state = { ...createInitialAdFatigueState(), snoozeTurnsRemaining: 3 };
      const next = tickAdFatigue(state);
      expect(next.snoozeTurnsRemaining).toBe(2);
    });

    it('does nothing when snooze is 0', () => {
      const state = createInitialAdFatigueState();
      const next = tickAdFatigue(state);
      expect(next).toBe(state); // Same reference — no-op
    });

    it('snooze fully expires after enough ticks', () => {
      let state = { ...createInitialAdFatigueState(), snoozeTurnsRemaining: 3 };
      state = tickAdFatigue(state);
      state = tickAdFatigue(state);
      state = tickAdFatigue(state);
      expect(state.snoozeTurnsRemaining).toBe(0);
    });
  });

  describe('AD_FATIGUE_POLICY config sanity', () => {
    it('has reasonable globalDailyCap', () => {
      expect(AD_FATIGUE_POLICY.globalDailyCap).toBeGreaterThanOrEqual(4);
      expect(AD_FATIGUE_POLICY.globalDailyCap).toBeLessThanOrEqual(15);
    });

    it('has per placement cap less than global', () => {
      expect(AD_FATIGUE_POLICY.perPlacementSessionCap).toBeLessThan(AD_FATIGUE_POLICY.globalDailyCap);
    });

    it('has positive snooze turns', () => {
      expect(AD_FATIGUE_POLICY.declineSnoozeTurns).toBeGreaterThan(0);
    });
  });
});
