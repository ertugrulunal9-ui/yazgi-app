// =================================================================
// GAME STATE — GameState, Slices, Achievements, Meta Progression
// =================================================================

import type {
  Stats, Skills, SchoolGrades,
  Family, FamilyEvolutionState,
  Talent, LifeGoal, GamePhase, InnerThoughtType,
  LogEntry, FloatingText, ActionHistoryItem,
  ExamSubject, TraitProgressData,
  CharacterInfo, AvatarConfig,
} from './core';
import type { MemoryEmotion } from './events';
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
import type { ScarEffect } from './scars';

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
// CHAPTER (BÖLÜM) SUMMARY — Faz 1A
// =================================================================

export interface ChapterSummary {
  chapterId: number;
  chapterName: string;
  chapterEmoji: string;
  ageRange: string;
  totalStatDeltas: Partial<Stats>;
  allTraitsGained: string[];
  allTraitsLost: string[];
  keyMemories: Array<{ eventId: string; emotion: MemoryEmotion; summary: string }>;
  topNpcChanges: Array<{ npcId: string; name: string; oldRole: string; newRole: string }>;
}

// =================================================================
// MILESTONE SUMMARY (Paket 4)
// =================================================================

export interface AgeMilestoneSummary {
  age: number;
  traitsGained: string[];
  traitsLost: string[];
  keyMemories: Array<{ eventId: string; emotion: MemoryEmotion; summary: string }>;
  statDeltas: Partial<Stats>;
  npcChanges: Array<{ npcId: string; name: string; oldRole: string; newRole: string }>;
  academicHighlight?: string;
}

// =================================================================
// MICRO / SEASON GOALS (Paket 5)
// =================================================================

export type MicroGoalType = 'ACTION' | 'STAT' | 'SOCIAL' | 'ACADEMIC';

export interface MicroGoal {
  id: string;
  descriptionKey: string;
  type: MicroGoalType;
  condition: {
    actionId?: string;
    statKey?: keyof Stats;
    threshold?: number;
    npcInteraction?: boolean;
    count?: number;
  };
  progress: number;
  target: number;
  turnsRemaining: number;
  reward: { xp?: number; money?: number; statBonus?: Partial<Stats> };
  completed: boolean;
}

export interface SeasonGoal {
  id: string;
  descriptionKey: string;
  targetAge: number;
  condition: {
    statKey?: keyof Stats;
    gradeKey?: keyof SchoolGrades;
    threshold: number;
    npcRole?: string;
  };
  reward: { money?: number; traitProgress?: string; statBonus?: Partial<Stats> };
  completed: boolean;
}

// =================================================================
// ECONOMY — SAVING GOALS (Paket 8)
// =================================================================

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  unlockAge: number;
  reward: {
    item?: string;
    statBonus?: Partial<Stats>;
  };
  completed: boolean;
}

// =================================================================
// UNDO SNAPSHOT (Paket 10)
// =================================================================

export interface TurnSnapshot {
  gameState: GameState;
  stats: Stats;
}

// =================================================================
// NPC REACTION (Paket 2)
// =================================================================

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
  /** Her goal için ulaşılan en iyi tier. Replayability & legacy unlock için kullanılır. */
  goalCompletions: Partial<Record<LifeGoal, CareerResult['type']>>;
  /** Sonraki run'larda aktif olacak ek event ID'leri (legacy unlock sistemi). */
  unlockedEventIds: string[];
  /** Sonraki run'larda geçerli olacak modifier flag'leri ('poor_underdog_bonus' vb.). */
  unlockedRunModifiers: string[];
  /** Daily login tracking — YYYY-MM-DD string */
  lastLoginDate?: string;
  loginStreak?: number;
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

  /** Kalıcı yara izleri — dramatik seçimlerin geri alınamaz sonuçları */
  scars?: ScarEffect[];

  // Geçici: seçilen event'in geçmiş seçimlerle nedensel bağlantısı
  currentCausalLink?: {
    sourceEventId: string;
    narrativeLine: string;
    emotion: string;
  } | null;

  // --- V4 alanları ---

  /** Kalıcı bayraklar — geri dönüşü olmayan kararların sonuçları (Paket 6) */
  permanentFlags?: Record<string, boolean>;

  /** Otomatik atanan mikro-hedefler (Paket 5) */
  microGoals?: MicroGoal[];

  /** Yaş bazlı sezon hedefi (Paket 5) */
  seasonGoal?: SeasonGoal | null;

  /** Biriktirme hedefleri — bisiklet, telefon, bilgisayar (Paket 8) */
  savingGoals?: SavingGoal[];
  purchasedItems?: string[];

  /** Yaş geçişi özet kayıtları (Paket 4) */
  ageMilestoneSummaries?: AgeMilestoneSummary[];

  /** Bölüm (chapter) özet kayıtları — Faz 1A */
  chapterSummaries?: ChapterSummary[];

  /** Aktif bölüm numarası (1-6) — Faz 1A */
  chapter?: number;

  /** Her yaş geçişinde kaydedilen stat snapshot'ları — stat history chart için Faz 6B */
  statSnapshots?: Array<{ age: number; stats: Stats }>;

  /** Minimalist avatar yapılandırması — Faz 6A */
  avatar?: AvatarConfig;

  /** Son oturumun kapanma zamanı (ms) — session recap için Faz 1B */
  lastSessionEndedAt?: number;

  /** Bir sonraki event için kısa merak uyandırıcı metin — session recap teaser */
  nextEventTeaser?: string;

  /** Yaş başında stat snapshot'ı — milestone delta hesabı için (Paket 4) */
  _ageStartStats?: Stats;

  /** Yaş başında NPC snapshot'ı — milestone NPC değişim tespiti için (Paket 4) */
  _ageStartNpcs?: NPC[];

  /** Yaş başında not snapshot'ı — milestone akademik öne çıkan için (Paket 4) */
  _ageStartGrades?: SchoolGrades;

  /** Son seçim öncesi snapshot — undo için (Paket 10) */
  undoSnapshot?: TurnSnapshot | null;

  /** Bu yaşta kullanılan undo sayısı, max 1 (Paket 10) */
  undosUsedThisAge?: number;

  /** Son NPC tepkisi — FeedbackOverlay ve NPCCard'da gösterilir (Paket 2) */
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
