/**
 * SaveValidation - Zod Schema Validation for Save Data
 *
 * Save dosyalarının yüklenirken doğrulanmasını sağlar.
 * Corrupt veya eksik veriler için auto-repair yapar.
 */

import { z } from 'zod';

// =================================================================
// DEFAULT VALUES (for auto-repair)
// =================================================================

export const DEFAULT_PERSONALITY = {
  openness: 50,
  courage: 50,
  empathy: 50,
  patience: 50,
  conformity: 50,
};

export const DEFAULT_PERSONALITY_STATE = {
  HELPFUL: { count: 0, streak: 0, multiplier: 1 },
  PRAGMATIC: { count: 0, streak: 0, multiplier: 1 },
  AGGRESSIVE: { count: 0, streak: 0, multiplier: 1 },
};

export const DEFAULT_STRESS = {
  current: 0,
  threshold: 70,
  turnsSinceBreakdown: 0,
  sources: [],
};

export const DEFAULT_STATS = {
  health: 50,
  intelligence: 50,
  charisma: 50,
  discipline: 50,
  money: 0,
  energy: 100,
  familyRelation: 50,
};

export const DEFAULT_FAMILY_EVOLUTION = {
  yearsAtHighRelation: 0,
  yearsAtLowRelation: 0,
  strictWarmthTriggered: false,
  familyCrisisTriggered: false,
};

// =================================================================
// ZOD SCHEMAS
// =================================================================

// Core Stats
export const StatsSchema = z.object({
  health: z.number().min(0).max(200),
  intelligence: z.number().min(0).max(200),
  charisma: z.number().min(0).max(200),
  discipline: z.number().min(0).max(200),
  money: z.number().min(0),
  energy: z.number().min(0).max(200),
  familyRelation: z.number().min(0).max(120),

});

// Personality System
export const PersonalitySchema = z.object({
  openness: z.number().min(0).max(100),
  courage: z.number().min(0).max(100),
  empathy: z.number().min(0).max(100),
  patience: z.number().min(0).max(100),
  conformity: z.number().min(0).max(100),
});

export const StressSourceSchema = z.object({
  reason: z.string(),
  amount: z.number(),
  turn: z.number(),
});

export const StressStateSchema = z.object({
  current: z.number().min(0).max(100),
  threshold: z.number().min(0).max(100),
  turnsSinceBreakdown: z.number().min(0),
  sources: z.array(StressSourceSchema),
});

export const PersonalityShiftSchema = z.object({
  axis: z.enum(['openness', 'courage', 'empathy', 'patience', 'conformity']),
  oldValue: z.number(),
  newValue: z.number(),
  reason: z.string(),
  turn: z.number(),
  age: z.number(),
});

export const PersonalityMomentumSchema = z.object({
  count: z.number().min(0),
  streak: z.number().min(0),
  multiplier: z.number().min(1).max(3),
});

export const PersonalityStateSchema = z.object({
  HELPFUL: PersonalityMomentumSchema,
  PRAGMATIC: PersonalityMomentumSchema,
  AGGRESSIVE: PersonalityMomentumSchema,
});

// Memory System
export const EventMemorySchema = z.object({
  id: z.string(),
  eventId: z.string(),
  choiceId: z.string(),
  age: z.number().min(0).max(18),
  emotion: z.enum(['REGRET', 'PRIDE', 'GUILT', 'SATISFACTION', 'NEUTRAL']),
  weight: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  relatedNpcId: z.string().optional(),
  turnTimestamp: z.number(),
});

// Childhood Prolog
export const ChildhoodMemoryCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  emotion: z.enum(['REGRET', 'PRIDE', 'GUILT', 'SATISFACTION', 'NEUTRAL']),
  weight: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

export const ChildhoodStateSchema = z.object({
  completed: z.boolean(),
  sceneIndex: z.number().min(0),
  memories: z.array(ChildhoodMemoryCardSchema),
  selectedMemoryId: z.string().nullable(),
});

// School & Skills
export const SchoolGradesSchema = z.object({
  math: z.number().min(0).max(100),
  science: z.number().min(0).max(100),
  language: z.number().min(0).max(100),
  turkish: z.number().min(0).max(100).optional(),
  history: z.number().min(0).max(100).optional(),
  geography: z.number().min(0).max(100).optional(),
  art: z.number().min(0).max(100).optional(),
  music: z.number().min(0).max(100).optional(),
});

export const SkillsSchema = z.object({
  coding: z.number().min(0).max(100),
  music: z.number().min(0).max(100),
  sports: z.number().min(0).max(100),
  design: z.number().min(0).max(100),
  athletics: z.number().min(0).max(100).optional(),
  logic: z.number().min(0).max(100).optional(),
  reading: z.number().min(0).max(100).optional(),
  teamwork: z.number().min(0).max(100).optional(),
  art: z.number().min(0).max(100).optional(),
  writing: z.number().min(0).max(100).optional(),
  work_ethic: z.number().min(0).max(100).optional(),
  business: z.number().min(0).max(100).optional(),
});

// Family
export const FamilySchema = z.object({
  wealth: z.enum(['POOR', 'MIDDLE', 'RICH']),
  dynamic: z.enum(['SUPPORTIVE', 'STRICT', 'CHAOTIC']),
  allowance: z.number().min(0),
}).nullable();

export const FamilyEvolutionSchema = z.object({
  yearsAtHighRelation: z.number().min(0),
  yearsAtLowRelation: z.number().min(0),
  strictWarmthTriggered: z.boolean(),
  familyCrisisTriggered: z.boolean(),
});

// Character
export const PlayerGenderSchema = z.enum(['MALE', 'FEMALE']);

export const ZodiacSignSchema = z.enum([
  'KOC',
  'BOGA',
  'IKIZLER',
  'YENGEC',
  'ASLAN',
  'BASAK',
  'TERAZI',
  'AKREP',
  'YAY',
  'OGLAK',
  'KOVA',
  'BALIK',
]);

export const CharacterInfoSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  gender: PlayerGenderSchema,
  birthMonth: z.number().min(1).max(12),
  birthDay: z.number().min(1).max(31),
  birthCity: z.string(),
  zodiacSign: ZodiacSignSchema,
});

// NPC
export const NPCSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.enum(['ACQUAINTANCE', 'FRIEND', 'BEST_FRIEND', 'CRUSH', 'PARTNER', 'RIVAL', 'ENEMY']),
  relationship: z.number().min(-100).max(100),
  romance: z.number().min(0).max(100),
  gender: z.enum(['MALE', 'FEMALE']),
  age: z.number().min(0),
  personality: z.enum(['FRIENDLY', 'SHY', 'AGGRESSIVE', 'POPULAR', 'NERDY', 'ARTISTIC', 'ATHLETIC']),
  traits: z.array(z.string()),
  metAge: z.number(),
  metTurn: z.number(),
  lastInteraction: z.number(),
  sharedMemories: z.array(z.string()),
  isInPlayerGroup: z.boolean(),
  groupId: z.string().optional(),
});

// Social Group
export const SocialGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  members: z.array(z.string()),
  leaderId: z.string().optional(),
  type: z.enum(['FRIEND_GROUP', 'CLIQUE', 'CLUB', 'STUDY_GROUP']),
  reputation: z.number().min(0).max(100),
  isPlayerMember: z.boolean(),
  formedAtAge: z.number().optional(),
  formedAtTurn: z.number().optional(),
});

// Scheduled Event
export const ScheduledEventSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  triggerAge: z.number().optional(),
  remainingTurns: z.number().optional(),
  condition: z.string().optional(),
  priority: z.union([z.enum(['HIGH', 'NORMAL']), z.number().int().min(0)]),
  sourceEventId: z.string().optional(),
});

export const ActiveStoryArcSchema = z.object({
  arcId: z.string(),
  stage: z.number().min(0),
});

// Log Entry
export const LogEntrySchema = z.object({
  id: z.string(),
  age: z.number(),
  message: z.string(),
  type: z.enum(['positive', 'negative', 'neutral']),
  eventId: z.string().optional(),
});

// Unlocked Achievement
export const UnlockedAchievementSchema = z.object({
  achievementId: z.string(),
  unlockedAt: z.number(),
  timestamp: z.string(),
});

// Action History Item
export const ActionHistoryItemSchema = z.object({
  actionId: z.string(),
  age: z.number(),
  turn: z.number(),
});

// Trait Progress
export const TraitProgressSchema = z.object({
  points: z.number(),
  required: z.number(),
  isLocked: z.boolean(),
  firstTriggeredAge: z.number(),
  lastProgressTurn: z.number().optional(),
});

export const ActiveBuffSchema = z.object({
  itemId: z.string(),
  turnsRemaining: z.number().min(0),
  effect: z.record(z.string(), z.number()),
  appliedAt: z.number().min(0).optional(),
});

// Game Phase
export const GamePhaseSchema = z.enum([
  'SETUP',
  'HUB',
  'HUB_STUDY',
  'HUB_SPORTS',
  'HUB_COMPUTER',
  'HUB_ART',
  'HUB_SHOP',
  'HUB_INVENTORY',
  'HUB_WORK',
  'HUB_SKILLS',
  'HUB_INTERACTION',
  'HUB_CHARACTER',
  'HUB_SKILLTREE',
  'HUB_SOCIAL',
  'EVENT',
  'RESULT',
  'REPORT_CARD',
  'GAME_OVER',
]);

export const FateRollSchema = z.object({
  outcome: z.enum(['BLESSED', 'FORTUNATE', 'NEUTRAL', 'UNLUCKY', 'CURSED']),
  rawRoll: z.number(),
  modifiedRoll: z.number(),
  zodiacModifier: z.number(),
  pityModifier: z.number(),
});

export const MetaRunSummarySchema = z.object({
  runId: z.string(),
  endedAt: z.number(),
  age: z.number(),
  endingId: z.string(),
  endingTitle: z.string(),
  tier: z.enum(['FAILURE', 'NORMAL', 'SUCCESS', 'LEGENDARY']),
  pointsEarned: z.number(),
  compatibilityScore: z.number(),
  selectedGoal: z.enum(['ACADEMIC', 'ATHLETIC', 'CREATIVE', 'WEALTH', 'SOCIAL']).nullable(),
});

export const MetaProgressionSchema = z.object({
  version: z.number(),
  totalRunsCompleted: z.number(),
  totalLegacyPoints: z.number(),
  legacyLevel: z.number(),
  bestTier: z.enum(['FAILURE', 'NORMAL', 'SUCCESS', 'LEGENDARY']).nullable(),
  highestCompatibilityScore: z.number(),
  highestAgeReached: z.number(),
  lifetimeAchievementIds: z.array(z.string()),
  lifetimeEndingIds: z.array(z.string()).optional().default([]),
  recentRuns: z.array(MetaRunSummarySchema),
  updatedAt: z.number(),
});

// Last Result
export const LastResultSchema = z.object({
  feedback: z.string(),
  changes: z.record(z.string(), z.number()),
  skillChanges: z.record(z.string(), z.number()).optional(),
  gradeChanges: z.record(z.string(), z.number()).optional(),
  personalityChanges: z.record(z.string(), z.number()).optional(),
  traitProgressUpdates: z.array(z.string()).optional(),
  traitChanges: z.array(z.object({
    traitId: z.string(),
    changeType: z.enum(['GAINED', 'REMOVED']),
    summary: z.string(),
    guidance: z.string().optional(),
  })).optional(),
  fateRoll: FateRollSchema.optional(),
}).nullable();

// =================================================================
// MAIN GAME STATE SCHEMA
// =================================================================

export const GameStateSchema = z.object({
  age: z.number().min(0).max(100),
  turn: z.number().min(1),
  phase: GamePhaseSchema,
  currentEvent: z.any().nullable(),
  pendingReportCard: z.boolean(),
  characterInfo: CharacterInfoSchema.nullable(),
  lastResult: LastResultSchema,
  historyLog: z.array(LogEntrySchema),
  family: FamilySchema,
  maxEnergy: z.number().min(50).max(150),

  schoolGrades: SchoolGradesSchema,
  skills: SkillsSchema,
  talent: z.enum(['NONE', 'CODING', 'MUSIC', 'SPORTS']),

  streak: z.object({
    actionId: z.string().nullable(),
    count: z.number(),
  }),

  traits: z.array(z.string()),
  traitProgress: z.record(z.string(), TraitProgressSchema),

  actionCounts: z.record(z.string(), z.number()),
  actionHistory: z.array(ActionHistoryItemSchema),
  eventChoiceHistory: z.array(z.string()),

  inventory: z.array(z.string()),
  npcs: z.array(NPCSchema),
  selectedNpcId: z.string().nullable(),
  innerThought: z.string(),
  innerThoughtType: z.enum(['CRISIS', 'MISMATCH', 'TRAIT', 'MOMENTUM', 'CLIFFHANGER', 'IDLE']).default('IDLE'),
  floatingTexts: z.array(z.any()), // Transient, don't validate strictly
  totalTurns: z.number(),
  sessionCount: z.number().min(0),
  adaptivePacingStreak: z.number().min(-5).max(5),
  lastInteracted: z.record(z.string(), z.number()),
  recentEvents: z.array(z.string()),

  memories: z.array(EventMemorySchema),
  scheduledEvents: z.array(ScheduledEventSchema),
  activeArcs: z.array(ActiveStoryArcSchema),
  familyEvolution: FamilyEvolutionSchema.optional(),
  activeBuffs: z.array(ActiveBuffSchema).optional().default([]),
  consumableCooldowns: z.record(z.string(), z.number().min(0)).optional().default({}),
  consumableUsageThisTurn: z.record(z.string(), z.number().min(0)).optional().default({}),

  // Achievement System
  unlockedAchievements: z.array(UnlockedAchievementSchema),
  achievementProgress: z.record(z.string(), z.number()),

  // Personality System
  personality: PersonalitySchema,
  stress: StressStateSchema,
  personalityHistory: z.array(PersonalityShiftSchema),
  personalityState: PersonalityStateSchema.optional(),

  // Social System
  socialGroups: z.array(SocialGroupSchema),
  socialReputation: z.number().min(0).max(100),

  // Childhood Prolog
  childhood: ChildhoodStateSchema,

  pendingCliffhanger: z.object({
    type: z.enum(['SCHEDULED_EVENT', 'NPC_PROMISE', 'MILESTONE_NEAR', 'EXAM_RESULT']),
    title: z.string(),
    description: z.string(),
    continuationEventId: z.string().optional(),
    sourceEventId: z.string().optional(),
  }).optional(),

  // Meta progression (cross-run)
  metaProgression: MetaProgressionSchema.optional(),
  metaRunRecorded: z.boolean().optional(),
}).partial(); // Make all fields optional for flexible validation

// =================================================================
// SAVE SLOT DATA SCHEMA
// =================================================================

export const SaveSlotMetadataSchema = z.object({
  slotId: z.string(),
  characterName: z.string(),
  age: z.number().min(0).max(100),
  playtime: z.number().min(0),
  lastPlayed: z.number(),
  version: z.number(),
  checksum: z.string(),
  schemaVersion: z.number().min(1).optional(),
  saveId: z.string().min(1).optional(),
  deviceId: z.string().min(1).optional(),
  revision: z.number().min(0).optional(),
  clientRevision: z.number().min(0).optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
  idempotencyKey: z.string().min(1).optional(),
  migrationState: z.enum(['pending', 'migrated', 'conflict']).optional(),
  status: z.enum(['empty', 'active', 'corrupted']),
  isPremium: z.boolean().default(false),
});

export const SaveSlotDataSchema = z.object({
  metadata: SaveSlotMetadataSchema,
  playerName: z.string(),
  stats: StatsSchema,
  gameState: GameStateSchema,
});

// =================================================================
// VALIDATION FUNCTIONS
// =================================================================

export interface ValidationResult {
  valid: boolean;
  data: z.infer<typeof SaveSlotDataSchema> | null;
  errors: z.ZodError | null;
  repaired: boolean;
  repairLog: string[];
}

/**
 * Validate and optionally repair save data
 */
export function validateSaveData(data: unknown): ValidationResult {
  const repairLog: string[] = [];

  // First, try strict validation
  const strictResult = SaveSlotDataSchema.safeParse(data);
  if (strictResult.success) {
    return {
      valid: true,
      data: strictResult.data,
      errors: null,
      repaired: false,
      repairLog: [],
    };
  }

  // If strict validation fails, try to repair
  const repaired = attemptAutoRepair(data, strictResult.error, repairLog);
  if (repaired) {
    // Re-validate repaired data
    const revalidation = SaveSlotDataSchema.safeParse(repaired);
    if (revalidation.success) {
      return {
        valid: true,
        data: revalidation.data,
        errors: null,
        repaired: true,
        repairLog,
      };
    }
  }

  // Repair failed
  return {
    valid: false,
    data: null,
    errors: strictResult.error,
    repaired: false,
    repairLog,
  };
}

const VALID_PERSONALITY_AXES = ['openness', 'courage', 'empathy', 'patience', 'conformity'] as const;
const clampNumber = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));
const STATS_BOUNDS: Record<keyof typeof DEFAULT_STATS, { min: number; max?: number; fallback: number }> = {
  health: { min: 0, max: 200, fallback: DEFAULT_STATS.health },
  intelligence: { min: 0, max: 200, fallback: DEFAULT_STATS.intelligence },
  charisma: { min: 0, max: 200, fallback: DEFAULT_STATS.charisma },
  discipline: { min: 0, max: 200, fallback: DEFAULT_STATS.discipline },
  money: { min: 0, fallback: DEFAULT_STATS.money },
  energy: { min: 0, max: 200, fallback: DEFAULT_STATS.energy },
  familyRelation: { min: 0, max: 120, fallback: DEFAULT_STATS.familyRelation },
};

/**
 * Attempt to auto-repair common issues
 */
function attemptAutoRepair(
  data: unknown,
  errors: z.ZodError,
  repairLog: string[]
): unknown | null {
  if (!data || typeof data !== 'object') return null;

  const repaired = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;

  // First, proactively fix personalityHistory if it exists
  if (repaired.gameState && typeof repaired.gameState === 'object') {
    const gs = repaired.gameState as Record<string, unknown>;

    if (Array.isArray(gs.personalityHistory)) {
      const originalLength = gs.personalityHistory.length;
      gs.personalityHistory = (gs.personalityHistory as Record<string, unknown>[]).filter(entry => {
        // Filter out entries with invalid axis
        if (!entry || typeof entry !== 'object') return false;
        if (!VALID_PERSONALITY_AXES.includes(entry.axis as typeof VALID_PERSONALITY_AXES[number])) return false;
        if (typeof entry.oldValue !== 'number') return false;
        if (typeof entry.newValue !== 'number') return false;
        return true;
      });
      const removedCount = originalLength - (gs.personalityHistory as unknown[]).length;
      if (removedCount > 0) {
        repairLog.push(`Removed ${removedCount} invalid personalityHistory entries`);
      }
    }
  }

  for (const issue of errors.issues) {
    const path = issue.path.join('.');

    // Repair gameState fields
    if (path.startsWith('gameState.')) {
      const field = path.replace('gameState.', '').split('.')[0];

      if (!repaired.gameState || typeof repaired.gameState !== 'object') {
        repairLog.push(`Created missing gameState object`);
        repaired.gameState = {};
      }

      const gs = repaired.gameState as Record<string, unknown>;

      if (path.startsWith('gameState.schoolGrades.')) {
        const subject = path.split('.')[2];
        if (!gs.schoolGrades || typeof gs.schoolGrades !== 'object') {
          gs.schoolGrades = {};
        }

        const schoolGrades = gs.schoolGrades as Record<string, unknown>;
        const existingValue = schoolGrades[subject];
        if (typeof existingValue === 'number') {
          const clamped = clampNumber(existingValue, 0, 100);
          if (clamped !== existingValue) {
            schoolGrades[subject] = clamped;
            repairLog.push(`Repaired ${path}: clamped to ${clamped}`);
          }
        } else {
          schoolGrades[subject] = 50;
          repairLog.push(`Repaired ${path}: set to default 50`);
        }
      }

      if (path.startsWith('gameState.skills.')) {
        const skill = path.split('.')[2];
        if (!gs.skills || typeof gs.skills !== 'object') {
          gs.skills = {};
        }

        const skills = gs.skills as Record<string, unknown>;
        const existingValue = skills[skill];
        if (typeof existingValue === 'number') {
          const clamped = clampNumber(existingValue, 0, 100);
          if (clamped !== existingValue) {
            skills[skill] = clamped;
            repairLog.push(`Repaired ${path}: clamped to ${clamped}`);
          }
        } else {
          skills[skill] = 0;
          repairLog.push(`Repaired ${path}: set to default 0`);
        }
      }

      // Missing array fields
      if (issue.code === 'invalid_type' && issue.expected === 'array') {
        gs[field] = [];
        repairLog.push(`Repaired ${path}: set to empty array`);
      }

      // Missing personality
      if (field === 'personality') {
        gs.personality = DEFAULT_PERSONALITY;
        repairLog.push(`Repaired ${path}: set to default personality`);
      }

      // Missing stress
      if (field === 'stress') {
        gs.stress = DEFAULT_STRESS;
        repairLog.push(`Repaired ${path}: set to default stress`);
      }

      // Missing personalityState
      if (field === 'personalityState') {
        gs.personalityState = DEFAULT_PERSONALITY_STATE;
        repairLog.push(`Repaired ${path}: set to default personality momentum state`);
      }

      // Missing memories
      if (field === 'memories') {
        gs.memories = [];
        repairLog.push(`Repaired ${path}: set to empty array`);
      }

      // Missing story arc state
      if (field === 'activeArcs') {
        gs.activeArcs = [];
        repairLog.push(`Repaired ${path}: set to empty array`);
      }

      if (field === 'familyEvolution') {
        gs.familyEvolution = DEFAULT_FAMILY_EVOLUTION;
        repairLog.push(`Repaired ${path}: set to default family evolution state`);
      }

      if (field === 'activeBuffs') {
        gs.activeBuffs = [];
        repairLog.push(`Repaired ${path}: set to empty array`);
      }

      if (field === 'consumableCooldowns') {
        gs.consumableCooldowns = {};
        repairLog.push(`Repaired ${path}: set to empty object`);
      }

      if (field === 'consumableUsageThisTurn') {
        gs.consumableUsageThisTurn = {};
        repairLog.push(`Repaired ${path}: set to empty object`);
      }

      // Invalid personalityHistory entries - clear the array
      if (field === 'personalityHistory' || path.includes('personalityHistory')) {
        // Already handled above, but ensure it exists
        if (!Array.isArray(gs.personalityHistory)) {
          gs.personalityHistory = [];
          repairLog.push(`Repaired ${path}: set to empty array`);
        }
      }
    }

    // Repair stats fields
    if (path.startsWith('stats.')) {
      if (!repaired.stats || typeof repaired.stats !== 'object') {
        repaired.stats = DEFAULT_STATS;
        repairLog.push(`Repaired stats: set to defaults`);
      }

      const statsObj = repaired.stats as Record<string, unknown>;
      const statKey = path.split('.')[1] as keyof typeof DEFAULT_STATS;
      const bounds = STATS_BOUNDS[statKey];
      if (bounds) {
        const currentValue = statsObj[statKey];
        if (typeof currentValue === 'number' && Number.isFinite(currentValue)) {
          const clamped = bounds.max === undefined
            ? Math.max(bounds.min, currentValue)
            : clampNumber(currentValue, bounds.min, bounds.max);
          if (clamped !== currentValue) {
            statsObj[statKey] = clamped;
            repairLog.push(`Repaired ${path}: clamped to ${clamped}`);
          }
        } else {
          statsObj[statKey] = bounds.fallback;
          repairLog.push(`Repaired ${path}: set to default ${bounds.fallback}`);
        }
      }
    }
  }

  return repaired;
}

/**
 * Validate just the stats object
 */
export function validateStats(data: unknown): z.infer<typeof StatsSchema> | null {
  const result = StatsSchema.safeParse(data);
  return result.success ? result.data : null;
}

/**
 * Validate just the gameState object
 */
export function validateGameState(data: unknown): z.infer<typeof GameStateSchema> | null {
  const result = GameStateSchema.safeParse(data);
  return result.success ? result.data : null;
}

export default {
  validateSaveData,
  validateStats,
  validateGameState,
  DEFAULT_PERSONALITY,
  DEFAULT_PERSONALITY_STATE,
  DEFAULT_STRESS,
  DEFAULT_STATS,
};
