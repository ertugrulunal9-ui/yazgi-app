// =================================================================
// FATE SYSTEM — Outcomes, Rolls, Tokens
// =================================================================

import type { ZodiacSign } from './core';

export type FateOutcome = 'BLESSED' | 'FORTUNATE' | 'NEUTRAL' | 'UNLUCKY' | 'CURSED';

export interface FateRollResult {
  outcome: FateOutcome;
  rawRoll: number;
  modifiedRoll: number;
  zodiacModifier: number;
  pityModifier: number;
}

export interface FateState {
  seed: number;
  tokens: number;
  totalRolls: number;
  outcomeHistory: FateOutcome[];
  zodiacSign: ZodiacSign;
  consecutiveBadOutcomes: number;
}
