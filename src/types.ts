
export type InnerThoughtType = 'CRISIS' | 'MISMATCH' | 'TRAIT' | 'MOMENTUM' | 'CLIFFHANGER' | 'IDLE';

export type StatKey = 'health' | 'intelligence' | 'charisma' | 'discipline' | 'money' | 'energy' | 'familyRelation';

export interface Stats {
  health: number;
  intelligence: number;
  charisma: number;
  discipline: number;
  money: number;
  energy: number;
  familyRelation: number;
}

export interface SchoolGrades {
  math: number;
  science: number;
  language: number;
  turkish: number;
  history: number;
  geography: number;
  art: number;
  music: number;
}


export type FamilyWealth = 'POOR' | 'MIDDLE' | 'RICH';
export type FamilyDynamic = 'SUPPORTIVE' | 'STRICT' | 'CHAOTIC';

export interface Skills {
  coding: number;
  music: number;
  sports: number;
  design: number;
  athletics: number;
  logic: number;
  reading: number;
  teamwork: number;
  art: number;
  writing: number;
  work_ethic: number;
  business: number;
}

// =================================================================
// KÄ°ÅÄ°LÄ°K SÄ°STEMÄ° (PERSONALITY SYSTEM)
// "Karakter = Kader" - Her seÃ§im karakteri ÅŸekillendirir
// =================================================================

/**
 * KiÅŸilik Eksenleri (0-100)
 * Bu deÄŸerler oyuncunun seÃ§imlerine gÃ¶re deÄŸiÅŸir ve
 * hangi eventlerin tetikleneceÄŸini, seÃ§eneklerin nasÄ±l gÃ¶rÃ¼neceÄŸini etkiler
 */
export interface Personality {
  // Ä°Ã§e DÃ¶nÃ¼klÃ¼k vs DÄ±ÅŸa DÃ¶nÃ¼klÃ¼k
  // 0 = Tam iÃ§e kapanÄ±k (sosyal kaygÄ±, yalnÄ±zlÄ±k tercihi)
  // 100 = Tam dÄ±ÅŸa dÃ¶nÃ¼k (sosyal kelebek, dikkat Ã§ekme ihtiyacÄ±)
  openness: number;

  // Temkin vs Cesaret
  // 0 = AÅŸÄ±rÄ± temkinli (risk almaz, gÃ¼venli seÃ§imler)
  // 100 = GÃ¶zÃ¼ kara (risk alÄ±r, maceraperest)
  courage: number;

  // Bencillik vs Vicdan
  // 0 = Tam bencil (kendi Ã§Ä±karÄ± Ã¶nce)
  // 100 = AÅŸÄ±rÄ± fedakar (kendi zararÄ±na baÅŸkalarÄ± iÃ§in)
  empathy: number;

  // SabÄ±r vs DÃ¼rtÃ¼sellik
  // 0 = Ã‡ok sabÄ±rsÄ±z (anÄ±nda tatmin, dÃ¼rtÃ¼sel)
  // 100 = Ã‡ok sabÄ±rlÄ± (uzun vadeli dÃ¼ÅŸÃ¼nÃ¼r)
  patience: number;

  // Uyum vs Ä°syan
  // 0 = Tam uyumcu (kurallara boyun eÄŸer)
  // 100 = Tam isyankar (otoriteye karÅŸÄ±)
  conformity: number;
}

/**
 * Stres Sistemi
 * Gizli stat - oyuncuya doÄŸrudan gÃ¶sterilmez
 * YÃ¼ksek stres: breakdown eventleri tetikler
 */
export interface StressState {
  // Mevcut stres seviyesi (0-100)
  current: number;

  // Stres eÅŸiÄŸi - bu deÄŸeri aÅŸÄ±nca breakdown riski
  threshold: number;

  // Son breakdown'dan bu yana geÃ§en tur
  turnsSinceBreakdown: number;

  // Stres kaynaklarÄ± (debug iÃ§in)
  sources: StressSource[];
}

export interface StressSource {
  reason: string;
  amount: number;
  turn: number;
}

/**
 * KiÅŸilik GeÃ§miÅŸi
 * SeÃ§imlerin zaman iÃ§inde kiÅŸiliÄŸi nasÄ±l deÄŸiÅŸtirdiÄŸini izler
 */
export interface PersonalityShift {
  axis: keyof Personality;
  oldValue: number;
  newValue: number;
  reason: string;
  turn: number;
  age: number;
}

/**
 * Event iÃ§in KiÅŸilik Gereksinimleri
 */
export interface PersonalityRequirement {
  axis: keyof Personality;
  min?: number;
  max?: number;
}

/**
 * SeÃ§eneÄŸin KiÅŸiliÄŸe Etkisi
 */
export interface PersonalityEffect {
  axis: keyof Personality;
  change: number; // + veya - deÄŸer
}

/**
 * SeÃ§enek Tipi - KiÅŸiliÄŸe uyum durumu
 */
export type ChoiceType =
  | 'PASSIVE'      // KiÅŸiliÄŸe uygun, kolay yol (dÃ¼ÅŸÃ¼k stres)
  | 'CHALLENGE'    // KiÅŸiliÄŸe ters, zor yol (yÃ¼ksek stres ama bÃ¼yÃ¼me)
  | 'BREAKDOWN'    // Stres patlamasÄ± seÃ§eneÄŸi
  | 'NEUTRAL';     // KiÅŸilikten baÄŸÄ±msÄ±z

// =================================================================
// DAVRANISSAL IVME (BEHAVIORAL MOMENTUM)
// =================================================================

/**
 * Momentum takibi yapilan ana kisilik egilimleri
 */
export type PersonalityTendency = 'HELPFUL' | 'PRAGMATIC' | 'AGGRESSIVE';

/**
 * Secim sinyali:
 * - Ana egilimler momentum kazanir
 * - Zit sinyaller ilgili streak'i kirar
 */
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


export type Talent = 'NONE' | 'CODING' | 'MUSIC' | 'SPORTS';

export type LifeGoal = 'ACADEMIC' | 'ATHLETIC' | 'CREATIVE' | 'WEALTH' | 'SOCIAL';

// =================================================================
// KARAKTER OLUÅTURMA SÄ°STEMÄ°
// =================================================================

export type PlayerGender = 'MALE' | 'FEMALE';

export type ZodiacSign =
  | 'KOC'      // KoÃ§ (21 Mart - 19 Nisan)
  | 'BOGA'     // BoÄŸa (20 Nisan - 20 MayÄ±s)
  | 'IKIZLER'  // Ä°kizler (21 MayÄ±s - 20 Haziran)
  | 'YENGEC'   // YengeÃ§ (21 Haziran - 22 Temmuz)
  | 'ASLAN'    // Aslan (23 Temmuz - 22 AÄŸustos)
  | 'BASAK'    // BaÅŸak (23 AÄŸustos - 22 EylÃ¼l)
  | 'TERAZI'   // Terazi (23 EylÃ¼l - 22 Ekim)
  | 'AKREP'    // Akrep (23 Ekim - 21 KasÄ±m)
  | 'YAY'      // Yay (22 KasÄ±m - 21 AralÄ±k)
  | 'OGLAK'    // OÄŸlak (22 AralÄ±k - 19 Ocak)
  | 'KOVA'     // Kova (20 Ocak - 18 Åubat)
  | 'BALIK';   // BalÄ±k (19 Åubat - 20 Mart)

export interface CharacterInfo {
  firstName: string;
  lastName: string;
  gender: PlayerGender;
  birthMonth: number;  // 1-12
  birthDay: number;    // 1-31
  birthCity: string;
  zodiacSign: ZodiacSign;
}

export interface Family {
  wealth: FamilyWealth;
  dynamic: FamilyDynamic;
  allowance: number;
}

export interface FamilyEvolutionState {
  yearsAtHighRelation: number;
  yearsAtLowRelation: number;
  strictWarmthTriggered: boolean;
  familyCrisisTriggered: boolean;
}

// --- MEMORY SYSTEM TYPES ---
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

// --- CHILDHOOD PROLOG TYPES ---
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

export interface FutureEventConfig {
  trigger: 'TURNS' | 'AGE';
  turnsLater?: number;
  age?: number;
  eventId: string;
  condition?: string;
  priority?: 'HIGH' | 'NORMAL';
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
  /** NPC questline arc'ları için — bu arc bir NPC ilişkisi gerektiriyor mu */
  requiresNPC?: boolean;
  /** NPC'nin hangi rolde olması gerekli (ör. FRIEND, CRUSH, RIVAL) */
  npcRoleRequirement?: NPCRole[];
}

export interface ActiveStoryArc {
  arcId: string;
  stage: number;
  /** NPC questline arc'ları için — bu arc hangi NPC'ye bağlı */
  npcId?: string;
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

  // Memory System
  memory?: {
    emotion: MemoryEmotion;
    weight: MemoryWeight;
    relatedNpcId?: string;
    customNote?: string;
  };

  // Future Events
  futureEvents?: FutureEventConfig[];

  // === KÃ„Â°Ã…ÂÃ„Â°LÃ„Â°K SÃ„Â°STEMÃ„Â° ===

  // SeÃƒÂ§enek tipi: KiÃ…Å¸iliÃ„Å¸e uygun mu, zor mu?
  choiceType?: ChoiceType;

  // Bu seÃƒÂ§enek kiÃ…Å¸iliÃ„Å¸i nasÃ„Â±l deÃ„Å¸iÃ…Å¸tirir?
  personalityEffects?: PersonalityEffect[];

  // Davranissal ivme sinyali (opsiyonel, manuel etiketleme)
  momentumTag?: PersonalityMomentumSignal;

  // Bu seÃƒÂ§eneÃ„Å¸i gÃƒÂ¶rmek iÃƒÂ§in gereken kiÃ…Å¸ilik
  reqPersonality?: PersonalityRequirement[];

  // Stres etkisi (+ stres ekler, - stres azaltÃ„Â±r)
  stressEffect?: number;

  // KiÃ…Å¸iliÃ„Å¸e gÃƒÂ¶re dinamik feedback
  dynamicFeedback?: {
    introvert?: string;   // openness < 30
    extrovert?: string;   // openness > 70
    brave?: string;       // courage > 70
    cautious?: string;    // courage < 30
    empathetic?: string;  // empathy > 70
    selfish?: string;     // empathy < 30
  };

  // === KOÃ…ÂULLU SONUÃƒâ€¡LAR ===
  conditionalOutcomes?: ConditionalOutcome[];
}

export type EventRarity = 'COMMON' | 'UNCOMMON' | 'RARE';

export type NPCRole = 'ACQUAINTANCE' | 'FRIEND' | 'BEST_FRIEND' | 'CRUSH' | 'PARTNER' | 'RIVAL' | 'ENEMY';

/** Ä°liÅŸki milestone tipleri - rol deÄŸiÅŸimlerinde tetiklenen eventler iÃ§in */
export type RelationshipMilestone =
  | 'BECAME_FRIEND'
  | 'BECAME_BEST_FRIEND'
  | 'BECAME_CRUSH'
  | 'BECAME_PARTNER'
  | 'BECAME_RIVAL'
  | 'BECAME_ENEMY'
  | 'LOST_FRIEND'
  | 'BREAKUP';

// =================================================================
// NPC SOSYAL SÄ°STEM TÄ°PLERÄ°
// =================================================================

/** NPC kiÅŸilik tipi - davranÄ±ÅŸlarÄ±nÄ± belirler */
export type NPCPersonality = 'FRIENDLY' | 'SHY' | 'AGGRESSIVE' | 'POPULAR' | 'NERDY' | 'ARTISTIC' | 'ATHLETIC';

/** NPC Ã¶zelliÄŸi - iliÅŸki dinamiklerini etkiler */
export type NPCTrait = 'LOYAL' | 'JEALOUS' | 'GOSSIPER' | 'SUPPORTIVE' | 'COMPETITIVE' | 'ROMANTIC' | 'MANIPULATIVE';

/** Sosyal grup tipi */
export type SocialGroupType = 'FRIEND_GROUP' | 'CLIQUE' | 'CLUB' | 'STUDY_GROUP';

/** Sosyal grup yapÄ±sÄ± */
export interface SocialGroup {
  id: string;
  name: string;
  members: string[];          // NPC id'leri
  leaderId: string | null;    // Lider NPC id
  type: SocialGroupType;
  reputation: number;         // Grubun okuldaki itibarÄ± (0-100)
  isPlayerMember: boolean;
  formedAtAge: number;
  formedAtTurn: number;
}

// 1. EventContext YapÄ±sÄ±
export interface EventContext {
  age: number;
  traits: string[];
  stats: Stats;
  family: Family | null;
  memories: EventMemory[];
  npcs?: NPC[];
  inventory?: string[];
  gameState?: GameState;

  // === KÄ°ÅÄ°LÄ°K SÄ°STEMÄ° ===
  personality: Personality;
  stress: StressState;
  grades?: SchoolGrades;
  skills?: Skills;
}

// 2. GameEvent YapÄ±sÄ± (Dinamik Metin DesteÄŸi ile)
export interface GameEvent {
  id: string;
  // Text: DÃ¼z yazÄ± (string) veya Duruma gÃ¶re deÄŸiÅŸen fonksiyon
  text: string | ((context: EventContext) => string);
  minAge: number;
  maxAge: number;
  milestoneLevel?: 'MINOR' | 'MAJOR';
  // Bu event bir iliÅŸki milestone event'i mi?
  isMilestoneEvent?: boolean;
  // Choices: SeÃ§enekler de dinamik olabilir
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

  // === KÄ°ÅÄ°LÄ°K SÄ°STEMÄ° ===

  // Bu event iÃ§in gereken kiÅŸilik profili
  reqPersonality?: PersonalityRequirement[];

  // Stres eÅŸiÄŸi gereksinimi (Ã¶rn: sadece stres > 70 iken tetiklenir)
  reqStress?: { min?: number; max?: number };

  // Event kategorisi - kiÅŸilik sisteminde nasÄ±l ele alÄ±nacaÄŸÄ±nÄ± belirler
  personalityCategory?: 'SOCIAL' | 'RISK' | 'MORAL' | 'CONFLICT' | 'GROWTH' | 'BREAKDOWN';

  // Bu event kiÅŸiliÄŸin hangi eksenini test ediyor?
  challengesAxis?: keyof Personality;
}

export interface Item {
  id: string;
  name: string;
  price: number;
  description: string;
  type: 'PERMANENT' | 'CONSUMABLE';
  effect?: Partial<Stats>;
  requiredForAction?: string;
}

export type GamePhase = 'SETUP' | 'HUB' | 'EVENT' | 'RESULT' | 'GAME_OVER' | 'HUB_STUDY' | 'HUB_SPORTS' | 'HUB_COMPUTER' | 'HUB_ART' | 'HUB_SHOP' | 'HUB_INVENTORY' | 'HUB_WORK' | 'HUB_SKILLS' | 'HUB_SOCIAL' | 'REPORT_CARD' | 'HUB_INTERACTION';

export type AppTab = 'hub' | 'character' | 'skilltree' | 'social' | 'settings';

export interface AppNavigationState {
  gameStarted: boolean;
  currentTab: AppTab;
  settingsOpen: boolean;
}

export interface LogEntry {
  id: string;
  age: number;
  message: string;
  type: 'positive' | 'negative' | 'neutral' | 'achievement';
  eventId?: string;
}

// --- TRAIT SYSTEM V2 ---
export type TraitType = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
export type TraitCategory = 'GENETIC' | 'ACQUIRED';

export interface TraitTrigger {
  type: 'ACTION' | 'EVENT' | 'STAT_THRESHOLD' | 'EVENT_CHOICE';
  pattern?: string;
  actionId?: string;
  eventId?: string;
  choice?: string | number;
  statKey?: StatKey;
  threshold?: number;
  ageWindow?: [number, number];
  statCondition?: { stat: string; operator: '>' | '<'; value: number };
  count?: number;
}

export type TraitFormationTrigger = TraitTrigger;

export interface TraitDefinition {
  id: string;
  name: string;
  description: string;
  type: TraitType;
  category: TraitCategory;

  formation?: {
    triggers: TraitTrigger[];
    ageWindow: [number, number];
    pointsRequired: number;
    lockAge?: number;
  };

  effects: {
    statMultipliers?: { [key: string]: number };
    energyCostMultiplier?: number;
    unlocksActions?: string[];
    unlocksEvents?: string[];
    modifiesNarrative?: boolean;
  };

  conflicts?: string[];
  synergies?: string[];
}

export type Trait = TraitDefinition;

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
  recentRuns: MetaRunSummary[];
  updatedAt: number;
}

export interface NPC {
  id: string;
  name: string;
  role: NPCRole;
  relationship: number;         // -100 to 100 (negatif = dÃ¼ÅŸman)
  romance: number;              // 0-100
  gender: 'MALE' | 'FEMALE';
  age: number;

  // === SOSYAL SÄ°STEM ALANLARI ===
  personality: NPCPersonality;  // NPC kiÅŸiliÄŸi
  traits: NPCTrait[];           // NPC Ã¶zellikleri
  metAge: number;               // TanÄ±ÅŸma yaÅŸÄ±
  metTurn: number;              // TanÄ±ÅŸma turu
  lastInteraction: number;      // Son etkileÅŸim turu
  sharedMemories: string[];     // Ortak anÄ±lar (event id'leri)
  isInPlayerGroup: boolean;     // Oyuncu grubunda mÄ±?
  groupId?: string;             // Hangi gruptaysa
}

export type FloatingTextAnimation = 'arcadeFloat' | 'bounce' | 'curve';

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  animationType?: FloatingTextAnimation;
  duration?: number; // milliseconds, default 2000
}

export interface ActionHistoryItem {
  actionId: string;
  age: number;
  turn: number;
}

export interface TraitProgressData {
  points: number;
  required: number;
  isLocked: boolean;
  firstTriggeredAge: number;
}

// --- FUTURE EVENTS SYSTEM ---
export interface ScheduledEvent {
  id: string;
  eventId: string;
  triggerAge?: number;
  remainingTurns?: number;
  condition?: string;
  priority: 'HIGH' | 'NORMAL';
  sourceEventId?: string;
}

// --- ACHIEVEMENT SYSTEM ---
export type AchievementRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export type AchievementCategory = 'STATS' | 'MONEY' | 'EVENTS' | 'SKILLS' | 'SCHOOL' | 'SECRET' | 'SOCIAL' | 'SURVIVAL';

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
  // Check function returns progress or boolean
  check: (stats: Stats, gameState: GameState, skills: Skills, grades: SchoolGrades) => boolean | AchievementProgress;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: number;
  timestamp: string;
}

export interface ResultData {
  feedback: string;
  changes: Partial<Stats>;
  skillChanges?: Partial<Skills>;
  gradeChanges?: Partial<SchoolGrades>;
  personalityChanges?: Partial<Personality>;
  traitProgressUpdates?: string[];
  fateRoll?: FateRollResult;
}

// ===== KADER SÄ°STEMÄ° (FATE SYSTEM) =====

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

// ===== KOÅULLU SONUÃ‡LAR (CONDITIONAL OUTCOMES) =====

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
  // Runtime-only cache, do not persist.
  _eventChoiceSet?: Set<string>;
}

export interface GameState {
  age: number;
  turn: number;
  phase: GamePhase;
  currentEvent: GameEvent | null;
  pendingReportCard: boolean;

  // === KARAKTER BÄ°LGÄ°LERÄ° ===
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

  // Achievement System
  unlockedAchievements: UnlockedAchievement[];
  achievementProgress: { [achievementId: string]: number };

  // === KÄ°ÅÄ°LÄ°K SÄ°STEMÄ° ===
  personality: Personality;
  stress: StressState;
  personalityHistory: PersonalityShift[];
  personalityState: PersonalityState;

  // === SOSYAL SÄ°STEM ===
  socialGroups: SocialGroup[];    // Oyuncunun dahil olduÄŸu gruplar
  socialReputation: number;       // Genel sosyal itibar (0-100)

  // === SINAV SÄ°STEMÄ° ===
  examsTakenThisYear: ExamSubject[];  // Bu yÄ±l girilen sÄ±navlar
  isExamPeriod: boolean;              // SÄ±nav dÃ¶nemi aktif mi

  // === CHILDHOOD PROLOG ===
  // === RISK TAKIBI ===
  lastBurdenRisk?: number;
  childhood: ChildhoodState;

  // Derived grouped slices (compatibility bridge for phased migration)
  progress?: ProgressState;
  character?: CharacterState;
  social?: SocialState;
  academic?: AcademicState;
  events?: EventState;

  // Single-source stats field for staged migration.
  // Existing code can still use context.stats accessor.
  stats?: Stats;

  // === KADER SÄ°STEMÄ° ===
  fate?: FateState;

  // === OTURUM TAKİBİ ===
  lastSessionTimestamp?: number;
  pendingCliffhanger?: {
    type: 'SCHEDULED_EVENT' | 'NPC_PROMISE' | 'MILESTONE_NEAR' | 'EXAM_RESULT';
    title: string;
    description: string;
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

// SÄ±nav dersleri
export type ExamSubject = 'math' | 'turkish' | 'science' | 'language' | 'history' | 'geography' | 'art' | 'music';

// TÃ¼m sÄ±nav dersleri listesi
export const ALL_EXAM_SUBJECTS: ExamSubject[] = ['math', 'turkish', 'science', 'language', 'history', 'geography', 'art', 'music'];

