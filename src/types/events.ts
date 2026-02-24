// =================================================================
// EVENT SYSTEM — GameEvent, Choice, Memory, Story Arcs
// =================================================================

import type {
  Stats, Skills, SchoolGrades, Family,
  LifeGoal, FamilyWealth, FamilyDynamic,
} from './core';
import type {
  Personality, StressState,
  PersonalityEffect, PersonalityRequirement,
  ChoiceType, PersonalityMomentumSignal,
} from './personality';
import type { NPCRole, NPC } from './npc';
import type { FateRollResult } from './fate';
// Circular type import — GameState is optional field in EventContext; TS handles it fine.
import type { GameState } from './game';

// =================================================================
// MEMORY SYSTEM
// =================================================================

export type MemoryEmotion = 'REGRET' | 'PRIDE' | 'GUILT' | 'SATISFACTION' | 'NEUTRAL';
export type MemoryWeight = 'LOW' | 'MEDIUM' | 'HIGH';

export interface EventMemory {
  id: string;
  eventId: string;
  choiceId: string;
  age: number;
  emotion: MemoryEmotion;
  weight: MemoryWeight;
  relatedNpcId?: string;
  turnTimestamp: number;
}

// =================================================================
// CHILDHOOD PROLOG
// =================================================================

export interface ChildhoodMemoryCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  emotion: MemoryEmotion;
  weight: MemoryWeight;
}

export interface ChildhoodState {
  completed: boolean;
  sceneIndex: number;
  memories: ChildhoodMemoryCard[];
  selectedMemoryId: string | null;
}

// =================================================================
// FUTURE EVENTS & STORY ARCS
// =================================================================

export interface FutureEventConfig {
  trigger: 'TURNS' | 'AGE';
  turnsLater?: number;
  age?: number;
  eventId: string;
  condition?: string;
  priority?: 'HIGH' | 'NORMAL' | number;
}

export interface StoryArcEvent {
  eventId: string;
  stage: number;
  requiresPrevious: boolean;
  branchCondition?: (ctx: EventContext) => boolean;
}

export interface StoryArc {
  id: string;
  title: string;
  ageRange: [number, number];
  events: StoryArcEvent[];
  reqPersonality?: PersonalityRequirement[];
  isRepeatable: boolean;
  requiresNPC?: boolean;
  npcRoleRequirement?: NPCRole[];
}

export interface ActiveStoryArc {
  arcId: string;
  stage: number;
  npcId?: string;
}

// =================================================================
// CHOICE & CONDITIONAL OUTCOMES
// =================================================================

export interface ConditionalOutcome {
  id?: string;
  condition: (ctx: EventContext) => boolean;
  weight: number;
  statChanges: Partial<Stats>;
  feedback: string;
  personalityEffects?: PersonalityEffect[];
  momentumTag?: PersonalityMomentumSignal;
  memoryEmotion?: MemoryEmotion;
  memoryWeight?: MemoryWeight;
  scheduleEvent?: FutureEventConfig;
  skillUpdates?: Partial<Skills>;
  gradeUpdates?: Partial<SchoolGrades>;
  stressEffect?: number;
}

export interface Choice {
  id?: string;
  text: string;
  effect: Partial<Stats>;
  icon?: string;
  grantTraits?: string[];
  gradeUpdates?: Partial<SchoolGrades>;
  skillUpdates?: Partial<Skills>;
  inventoryAdd?: string[];
  setSelectedGoal?: LifeGoal | null;
  feedback: string;
  reqStats?: Partial<Stats>;
  reqFamily?: {
    wealth?: FamilyWealth[];
    dynamic?: FamilyDynamic[];
  };
  reqSkills?: Partial<Skills>;
  reqNPCRole?: NPCRole;
  reqEventIds?: string[];
  blockEventIds?: string[];
  npcRelationChange?: number;

  memory?: {
    emotion: MemoryEmotion;
    weight: MemoryWeight;
    relatedNpcId?: string;
    customNote?: string;
  };

  futureEvents?: FutureEventConfig[];

  choiceType?: ChoiceType;
  personalityEffects?: PersonalityEffect[];
  momentumTag?: PersonalityMomentumSignal;
  reqPersonality?: PersonalityRequirement[];
  stressEffect?: number;

  dynamicFeedback?: {
    introvert?: string;
    extrovert?: string;
    brave?: string;
    cautious?: string;
    empathetic?: string;
    selfish?: string;
  };

  conditionalOutcomes?: ConditionalOutcome[];
}

// =================================================================
// EVENT CONTEXT & GAME EVENT
// =================================================================

export type EventRarity = 'COMMON' | 'UNCOMMON' | 'RARE';

export interface EventContext {
  age: number;
  traits: string[];
  stats: Stats;
  family: Family | null;
  memories: EventMemory[];
  npcs?: NPC[];
  inventory?: string[];
  /** Full game state — optional, used in deep event callbacks */
  gameState?: GameState;
  personality: Personality;
  stress: StressState;
  grades?: SchoolGrades;
  skills?: Skills;
}

export interface GameEvent {
  id: string;
  text: string | ((context: EventContext) => string);
  minAge: number;
  maxAge: number;
  continuationEventId?: string;
  milestoneLevel?: 'MINOR' | 'MAJOR';
  isMilestoneEvent?: boolean;
  choices: (Choice | ((context: EventContext) => Choice))[];
  rarity?: EventRarity;
  isRepeatable?: boolean;
  reqStats?: Partial<Stats>;
  reqSkills?: Partial<Skills>;
  reqTraits?: string[];
  reqNoItem?: string[];
  reqFamily?: {
    wealth?: FamilyWealth[];
    dynamic?: FamilyDynamic[];
  };
  reqNPCRole?: NPCRole;
  relatedNpcId?: string;
  reqEventIds?: string[];
  blockEventIds?: string[];
  reqMemory?: {
    emotion: MemoryEmotion;
    minWeight: MemoryWeight;
  };
  tags?: string[];
  difficulty?: number;
  reqPersonality?: PersonalityRequirement[];
  reqStress?: { min?: number; max?: number };
  personalityCategory?: 'SOCIAL' | 'RISK' | 'MORAL' | 'CONFLICT' | 'GROWTH' | 'BREAKDOWN';
  challengesAxis?: keyof Personality;
}

// =================================================================
// RESULT & FEEDBACK
// =================================================================

export type TraitChangeType = 'GAINED' | 'REMOVED';

export interface TraitChangeFeedback {
  traitId: string;
  changeType: TraitChangeType;
  summary: string;
  guidance?: string;
}

export interface ResultData {
  feedback: string;
  changes: Partial<Stats>;
  skillChanges?: Partial<Skills>;
  gradeChanges?: Partial<SchoolGrades>;
  personalityChanges?: Partial<Personality>;
  traitProgressUpdates?: string[];
  traitChanges?: TraitChangeFeedback[];
  fateRoll?: FateRollResult;
  statNarrativeFeedback?: string[];
  /**
   * TurnMediator decides recovery gating. When true, useEvents injects
   * a lightweight recovery mini-event after result continue.
   */
  shouldForceRecovery?: boolean;
}

// =================================================================
// SCHEDULED EVENTS
// =================================================================

export interface ScheduledEvent {
  id: string;
  eventId: string;
  triggerAge?: number;
  remainingTurns?: number;
  condition?: string;
  priority: 'HIGH' | 'NORMAL' | number;
  sourceEventId?: string;
}
