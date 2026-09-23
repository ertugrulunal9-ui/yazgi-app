/**
 * Ad Fatigue Policy
 *
 * Basit reklam yorgunlugu: global session limiti + turn cooldown.
 */

const GLOBAL_DAILY_LIMIT = 5;
const COOLDOWN_TURNS = 1;

export interface AdFatigueState {
  totalAdsShownThisSession: number;
  lastShownTurn: number;
}

export const createInitialAdFatigueState = (): AdFatigueState => ({
  totalAdsShownThisSession: 0,
  lastShownTurn: -999,
});

export const canOfferAd = (
  state: AdFatigueState,
  currentTurn: number,
): boolean => {
  if (state.totalAdsShownThisSession >= GLOBAL_DAILY_LIMIT) return false;
  if (currentTurn - state.lastShownTurn <= COOLDOWN_TURNS) return false;
  return true;
};

export const recordAdShown = (
  state: AdFatigueState,
  currentTurn: number,
): AdFatigueState => ({
  totalAdsShownThisSession: state.totalAdsShownThisSession + 1,
  lastShownTurn: currentTurn,
});

// No-op kept for call-site compatibility
export const tickAdFatigue = (state: AdFatigueState): AdFatigueState => state;
