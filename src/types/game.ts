// =================================================================
// GAME STATE — GameState, Slices, Achievements, Meta Progression
// =================================================================

import type {
  Stats, Skills, SchoolGrades,
  Family, FamilyEvolutionState,
  Talent, LifeGoal, GamePhase, InnerThoughtType,
  LogEntry, FloatingText, ActionHistoryItem,
  ExamSubject, TraitProgressData,
  CharacterInfo,
} from './core';
import type {
  Personality, StressState,
  PersonalityShift, PersonalityState,
} from './personality';
import type { NPC, SocialGroup } from './npc';
import type { FateState } from './fate';
import type {
  GameEvent, ResultData, EventMemory,
  ScheduledEvent, ActiveStoryArc, ChildhoodState,
} from './events';

// =================================================================
// ACHIEVEMENT SYSTEM
// =================================================================

export type AchievementRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type AchievementCategory =
  | 'STATS' | 'MONEY' | 'EVENTS' | 'SKILLS'
  | 'SCHOOL' | 'SECRET' | 'SOCIAL' | 'SURVIVAL';

export interface AchievementReward {
  money?: number;
  stats?: Partial<Stats>;
  item?: string;
}

export interface AchievementProgress {
  current: number;
  target: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  isSecret: boolean;
  reward?: AchievementReward;
  check: (
    stats: Stats,
    gameState: GameState,
    skills: Skills,
    grades: SchoolGrades,
  ) => boolean | AchievementProgress;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: number;
  timestamp: string;
}

// =================================================================
// CAREER & META PROGRESSION
// =================================================================

export interface CareerResult {
  title: string;
  description: string;
  emoji: string;
  type: 'SUCCESS' | 'NORMAL' | 'FAILURE' | 'LEGENDARY';
  familyReaction: string;
  influences?: string[];
  personalityNarrative?: string;
  memoryInfluence?: string;
}

export interface MetaRunSummary {
  runId: string;
  endedAt: number;
  age: number;
  endingId: string;
  endingTitle: string;
  tier: CareerResult['type'];
  pointsEarned: number;
  compatibilityScore: number;
  selectedGoal: LifeGoal | null;
}

export interface MetaProgression {
  version: number;
  totalRunsCompleted: number;
  totalLegacyPoints: number;
  legacyLevel: number;
  bestTier: CareerResult['type'] | null;
  highestCompatibilityScore: number;
  highestAgeReached: number;
  lifetimeAchievementIds: string[];
  lifetimeEndingIds: string[];
  recentRuns: MetaRunSummary[];
  updatedAt: number;
}

// =================================================================
// DOMAIN SLICES (phased migration bridges)
// =================================================================

export interface CharacterState {
  characterInfo: CharacterInfo | null;
  personality: Personality;
  stress: StressState;
  personalityHistory: PersonalityShift[];
  personalityState: PersonalityState;
  traits: string[];
  traitProgress: { [traitId: string]: TraitProgressData };
}

export interface ProgressState {
  age: number;
  turn: number;
  totalTurns: number;
  phase: GamePhase;
  sessionCount: number;
  adaptivePacingStreak: number;
}

export interface SocialState {
  npcs: NPC[];
  selectedNpcId: string | null;
  socialGroups: SocialGroup[];
  socialReputation: number;
}

export interface AcademicState {
  schoolGrades: SchoolGrades;
  skills: Skills;
  talent: Talent;
  examsTakenThisYear: ExamSubject[];
  isExamPeriod: boolean;
}

export interface EventState {
  currentEvent: GameEvent | null;
  lastResult: ResultData | null;
  recentEvents: string[];
  scheduledEvents: ScheduledEvent[];
  memories: EventMemory[];
  eventChoiceHistory: string[];
  activeArcs: ActiveStoryArc[];
  /** Runtime-only cache, do not persist. */
  _eventChoiceSet?: Set<string>;
}

// =================================================================
// GAME STATE
// =================================================================

export interface GameState {
  age: number;
  turn: number;
  phase: GamePhase;
  currentEvent: GameEvent | null;
  pendingReportCard: boolean;

  characterInfo: CharacterInfo | null;
  lastResult: ResultData | null;
  historyLog: LogEntry[];
  family: Family | null;
  maxEnergy: number;

  schoolGrades: SchoolGrades;
  skills: Skills;
  talent: Talent;
  selectedGoal?: LifeGoal | null;

  streak: {
    actionId: string | null;
    count: number;
  };

  traits: string[];
  traitProgress: { [traitId: string]: TraitProgressData };
  actionCounts: { [key: string]: number };
  actionHistory: ActionHistoryItem[];
  eventChoiceHistory: string[];

  inventory: string[];
  npcs: NPC[];
  selectedNpcId: string | null;
  innerThought: string;
  innerThoughtType: InnerThoughtType;
  floatingTexts: FloatingText[];
  totalTurns: number;
  sessionCount: number;
  adaptivePacingStreak: number;
  lastInteracted: { [key: string]: number };
  recentEvents: string[];

  memories: EventMemory[];
  scheduledEvents: ScheduledEvent[];
  activeArcs?: ActiveStoryArc[];
  familyEvolution?: FamilyEvolutionState;
  eventFrequency?: { [eventId: string]: { count: number; lastSeenTurn: number } };

  unlockedAchievements: UnlockedAchievement[];
  achievementProgress: { [achievementId: string]: number };

  personality: Personality;
  stress: StressState;
  personalityHistory: PersonalityShift[];
  personalityState: PersonalityState;

  socialGroups: SocialGroup[];
  socialReputation: number;

  examsTakenThisYear: ExamSubject[];
  isExamPeriod: boolean;

  lastBurdenRisk?: number;
  childhood: ChildhoodState;

  // Derived grouped slices (compatibility bridge for phased migration)
  progress?: ProgressState;
  character?: CharacterState;
  social?: SocialState;
  academic?: AcademicState;
  events?: EventState;

  stats?: Stats;

  fate?: FateState;

  dailyDecisionCount?: number;
  activeBuffs?: Array<{
    itemId: string;
    turnsRemaining: number;
    effect: Partial<Stats>;
    appliedAt: number;
  }>;
  consumableCooldowns?: Record<string, number>;
  consumableUsageThisTurn?: Record<string, number>;

  lastSessionTimestamp?: number;
  pendingCliffhanger?: {
    type: 'SCHEDULED_EVENT' | 'NPC_PROMISE' | 'MILESTONE_NEAR' | 'EXAM_RESULT';
    title: string;
    description: string;
    continuationEventId?: string;
    sourceEventId?: string;
  };
  metaProgression?: MetaProgression;
  metaRunRecorded?: boolean;
}

export type GameStateUpdate =
  Partial<Omit<GameState, 'progress' | 'character' | 'social' | 'academic' | 'events' | 'stats'>> & {
    progress?: Partial<ProgressState>;
    character?: Partial<CharacterState>;
    social?: Partial<SocialState>;
    academic?: Partial<AcademicState>;
    events?: Partial<EventState>;
    stats?: Stats | Partial<Stats>;
  };
