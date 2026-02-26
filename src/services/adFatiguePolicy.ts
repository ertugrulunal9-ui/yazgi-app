/**
 * Ad Fatigue Policy Service
 *
 * Reklam yorgunlugu yonetimi: placement cap, turn cooldown, decline snooze.
 * Tum degerler gameBalance.ts AD_FATIGUE_POLICY section'dan alinir.
 */

import { AD_FATIGUE_POLICY } from '../config/gameBalance';
import type { RewardedPlacement } from './monetization';

export interface AdFatigueState {
  /** Session boyunca gosterilen toplam ad sayisi */
  totalAdsShownThisSession: number;
  /** Placement bazinda session'da gosterilen ad sayisi */
  placementCounts: Partial<Record<RewardedPlacement, number>>;
  /** Son ad teklifi yapilan tur */
  lastOfferTurn: number;
  /** Son ad'in gosterildigi tur */
  lastShownTurn: number;
  /** Ard arda decline sayisi */
  consecutiveDeclines: number;
  /** Snooze bitene kadar kalan tur */
  snoozeTurnsRemaining: number;
}

export const createInitialAdFatigueState = (): AdFatigueState => ({
  totalAdsShownThisSession: 0,
  placementCounts: {},
  lastOfferTurn: -999,
  lastShownTurn: -999,
  consecutiveDeclines: 0,
  snoozeTurnsRemaining: 0,
});

/**
 * Belirtilen placement icin ad teklifi yapilabilir mi?
 * Tum fatigue kurallarini kontrol eder.
 */
export const canOfferAd = (
  state: AdFatigueState,
  placement: RewardedPlacement,
  currentTurn: number,
): { allowed: boolean; reason?: string } => {
  const policy = AD_FATIGUE_POLICY;

  // 1. Global session cap
  if (state.totalAdsShownThisSession >= policy.globalDailyCap) {
    return { allowed: false, reason: 'GLOBAL_CAP_REACHED' };
  }

  // 2. Per-placement session cap
  const placementCount = state.placementCounts[placement] ?? 0;
  if (placementCount >= policy.perPlacementSessionCap) {
    return { allowed: false, reason: 'PLACEMENT_CAP_REACHED' };
  }

  // 3. Minimum turn araligi
  const turnsSinceLastOffer = currentTurn - state.lastOfferTurn;
  if (turnsSinceLastOffer < policy.minTurnsBetweenOffers) {
    return { allowed: false, reason: 'MIN_TURN_COOLDOWN' };
  }

  // 4. Back-to-back turn engeli
  if (policy.noOfferOnBackToBackTurns && turnsSinceLastOffer <= 1) {
    return { allowed: false, reason: 'BACK_TO_BACK_BLOCKED' };
  }

  // 5. Decline snooze
  if (state.snoozeTurnsRemaining > 0) {
    return { allowed: false, reason: 'DECLINE_SNOOZE_ACTIVE' };
  }

  return { allowed: true };
};

/**
 * Ad teklifi yapildi (gosterilsin ya da gosterilmesin).
 */
export const recordAdOffer = (
  state: AdFatigueState,
  currentTurn: number,
): AdFatigueState => ({
  ...state,
  lastOfferTurn: currentTurn,
});

/**
 * Ad basariyla izlendi.
 */
export const recordAdShown = (
  state: AdFatigueState,
  placement: RewardedPlacement,
  currentTurn: number,
): AdFatigueState => ({
  ...state,
  totalAdsShownThisSession: state.totalAdsShownThisSession + 1,
  placementCounts: {
    ...state.placementCounts,
    [placement]: (state.placementCounts[placement] ?? 0) + 1,
  },
  lastShownTurn: currentTurn,
  lastOfferTurn: currentTurn,
  consecutiveDeclines: 0,
  snoozeTurnsRemaining: 0,
});

/**
 * Oyuncu ad teklifini reddetti.
 */
export const recordAdDeclined = (
  state: AdFatigueState,
  currentTurn: number,
): AdFatigueState => {
  const newDeclines = state.consecutiveDeclines + 1;
  const shouldSnooze = newDeclines >= 2;
  return {
    ...state,
    lastOfferTurn: currentTurn,
    consecutiveDeclines: newDeclines,
    snoozeTurnsRemaining: shouldSnooze ? AD_FATIGUE_POLICY.declineSnoozeTurns : 0,
  };
};

/**
 * Turn gecisinde snooze tick-down.
 * advanceTurn() icinde cagrilir.
 */
export const tickAdFatigue = (state: AdFatigueState): AdFatigueState => {
  if (state.snoozeTurnsRemaining <= 0) return state;
  return {
    ...state,
    snoozeTurnsRemaining: state.snoozeTurnsRemaining - 1,
  };
};
