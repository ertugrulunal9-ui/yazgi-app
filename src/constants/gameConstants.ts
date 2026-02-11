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
