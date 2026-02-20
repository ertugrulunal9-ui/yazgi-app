/**
 * Game-wide constants for difficulty, thresholds, and gameplay mechanics.
 * Centralizes magic numbers for maintainability.
 */

/** Exam difficulty calculation thresholds */
export const EXAM_DIFFICULTY = {
  /** Minimum age for HARD difficulty */
  HARD_MIN_AGE: 12,
  /** Minimum intelligence for HARD difficulty */
  HARD_MIN_INTELLIGENCE: 60,
  /** Minimum age for MEDIUM difficulty (alternative condition) */
  MEDIUM_MIN_AGE: 9,
  /** Minimum intelligence for MEDIUM difficulty (alternative condition) */
  MEDIUM_MIN_INTELLIGENCE: 40,
} as const;

/** Age-based avatar thresholds */
export const AVATAR_AGE_THRESHOLDS = {
  BABY: 3,
  CHILD: 7,
  PRETEEN: 13,
} as const;

/** Default difficulty levels */
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

/** Momentum system tuning constants */
export const MOMENTUM_CONSTANTS = {
  /** Special momentum threshold for advanced momentum events and effects */
  HIGH_MOMENTUM_THRESHOLD: 1.25,
} as const;

/** Goal-oriented event selection tuning */
export const GOAL_EVENT_WEIGHTING = {
  /** Weight multiplier for events aligned with selected life goal */
  ALIGNED_MULTIPLIER: 1.8,
  /** Weight multiplier for events not aligned with selected life goal */
  UNALIGNED_MULTIPLIER: 0.7,
  /** Every N turns, force pure random selection to preserve "life happens" surprise */
  CHAOS_INTERVAL: 5,
  /** Chaos mode uses neutral weighting (all candidates equally likely) */
  CHAOS_MULTIPLIER: 1.0,
} as const;

/** Burden and risk system tuning */
export const BURDEN_CONSTANTS = {
  /** Increase action-derived burden contribution */
  ACTION_DEBT_MULTIPLIER: 1.2,
  /** Recent action window used for burden pressure estimation */
  ACTION_PRESSURE_WINDOW: 24,
} as const;

/** Daily pacing guard — prevents energy-cost asymmetry from starving players of decisions */
export const PACING_CONSTANTS = {
  /**
   * Minimum event-choice decisions guaranteed per game-day.
   * If energy hits 0 before this many decisions, the caller should
   * inject a lightweight recovery event rather than advancing the day.
   */
  MIN_DECISIONS_PER_DAY: 3,
} as const;
