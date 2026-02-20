// =================================================================
// PERSONALITY SYSTEM — Axes, Stress, Momentum, Tendencies
// =================================================================

export interface Personality {
  /** 0 = içe kapanık, 100 = dışa dönük */
  openness: number;
  /** 0 = temkinli, 100 = gözü kara */
  courage: number;
  /** 0 = bencil, 100 = fedakâr */
  empathy: number;
  /** 0 = dürtüsel, 100 = sabırlı */
  patience: number;
  /** 0 = uyumcu, 100 = isyankâr */
  conformity: number;
}

export interface StressSource {
  reason: string;
  amount: number;
  turn: number;
}

export interface StressState {
  current: number;
  threshold: number;
  turnsSinceBreakdown: number;
  sources: StressSource[];
}

export interface PersonalityShift {
  axis: keyof Personality;
  oldValue: number;
  newValue: number;
  reason: string;
  turn: number;
  age: number;
}

export interface PersonalityRequirement {
  axis: keyof Personality;
  min?: number;
  max?: number;
}

export interface PersonalityEffect {
  axis: keyof Personality;
  change: number;
}

export type ChoiceType =
  | 'PASSIVE'    // Kişiliğe uygun, düşük stres
  | 'CHALLENGE'  // Kişiliğe ters, büyüme fırsatı
  | 'BREAKDOWN'  // Stres patlaması
  | 'NEUTRAL';   // Kişilikten bağımsız

export type PersonalityTendency = 'HELPFUL' | 'PRAGMATIC' | 'AGGRESSIVE';

export type PersonalityMomentumSignal =
  | PersonalityTendency
  | 'SELFISH'
  | 'IMPULSIVE'
  | 'PACIFIST';

export interface PersonalityMomentum {
  count: number;
  streak: number;
  multiplier: number;
}

export type PersonalityState = Record<PersonalityTendency, PersonalityMomentum>;

export type MomentumStreakLevel = 'NONE' | 'BUILDING' | 'ACTIVE' | 'POWERFUL';

export interface MomentumVisibility {
  dominantTendency: PersonalityTendency | null;
  streakLevel: MomentumStreakLevel;
  hint: string;
}
