
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
// KİŞİLİK SİSTEMİ (PERSONALITY SYSTEM)
// "Karakter = Kader" - Her seçim karakteri şekillendirir
// =================================================================

/**
 * Kişilik Eksenleri (0-100)
 * Bu değerler oyuncunun seçimlerine göre değişir ve
 * hangi eventlerin tetikleneceğini, seçeneklerin nasıl görüneceğini etkiler
 */
export interface Personality {
  // İçe Dönüklük vs Dışa Dönüklük
  // 0 = Tam içe kapanık (sosyal kaygı, yalnızlık tercihi)
  // 100 = Tam dışa dönük (sosyal kelebek, dikkat çekme ihtiyacı)
  openness: number;

  // Temkin vs Cesaret
  // 0 = Aşırı temkinli (risk almaz, güvenli seçimler)
  // 100 = Gözü kara (risk alır, maceraperest)
  courage: number;

  // Bencillik vs Vicdan
  // 0 = Tam bencil (kendi çıkarı önce)
  // 100 = Aşırı fedakar (kendi zararına başkaları için)
  empathy: number;

  // Sabır vs Dürtüsellik
  // 0 = Çok sabırsız (anında tatmin, dürtüsel)
  // 100 = Çok sabırlı (uzun vadeli düşünür)
  patience: number;

  // Uyum vs İsyan
  // 0 = Tam uyumcu (kurallara boyun eğer)
  // 100 = Tam isyankar (otoriteye karşı)
  conformity: number;
}

/**
 * Stres Sistemi
 * Gizli stat - oyuncuya doğrudan gösterilmez
 * Yüksek stres: breakdown eventleri tetikler
 */
export interface StressState {
  // Mevcut stres seviyesi (0-100)
  current: number;

  // Stres eşiği - bu değeri aşınca breakdown riski
  threshold: number;

  // Son breakdown'dan bu yana geçen tur
  turnsSinceBreakdown: number;

  // Stres kaynakları (debug için)
  sources: StressSource[];
}

export interface StressSource {
  reason: string;
  amount: number;
  turn: number;
}

/**
 * Kişilik Geçmişi
 * Seçimlerin zaman içinde kişiliği nasıl değiştirdiğini izler
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
 * Event için Kişilik Gereksinimleri
 */
export interface PersonalityRequirement {
  axis: keyof Personality;
  min?: number;
  max?: number;
}

/**
 * Seçeneğin Kişiliğe Etkisi
 */
export interface PersonalityEffect {
  axis: keyof Personality;
  change: number; // + veya - değer
}

/**
 * Seçenek Tipi - Kişiliğe uyum durumu
 */
export type ChoiceType =
  | 'PASSIVE'      // Kişiliğe uygun, kolay yol (düşük stres)
  | 'CHALLENGE'    // Kişiliğe ters, zor yol (yüksek stres ama büyüme)
  | 'BREAKDOWN'    // Stres patlaması seçeneği
  | 'NEUTRAL';     // Kişilikten bağımsız

export type Talent = 'NONE' | 'CODING' | 'MUSIC' | 'SPORTS';

// =================================================================
// KARAKTER OLUŞTURMA SİSTEMİ
// =================================================================

export type PlayerGender = 'MALE' | 'FEMALE';

export type ZodiacSign =
  | 'KOC'      // Koç (21 Mart - 19 Nisan)
  | 'BOGA'     // Boğa (20 Nisan - 20 Mayıs)
  | 'IKIZLER'  // İkizler (21 Mayıs - 20 Haziran)
  | 'YENGEC'   // Yengeç (21 Haziran - 22 Temmuz)
  | 'ASLAN'    // Aslan (23 Temmuz - 22 Ağustos)
  | 'BASAK'    // Başak (23 Ağustos - 22 Eylül)
  | 'TERAZI'   // Terazi (23 Eylül - 22 Ekim)
  | 'AKREP'    // Akrep (23 Ekim - 21 Kasım)
  | 'YAY'      // Yay (22 Kasım - 21 Aralık)
  | 'OGLAK'    // Oğlak (22 Aralık - 19 Ocak)
  | 'KOVA'     // Kova (20 Ocak - 18 Şubat)
  | 'BALIK';   // Balık (19 Şubat - 20 Mart)

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
}

export interface ActiveStoryArc {
  arcId: string;
  stage: number;
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

  // === KİŞİLİK SİSTEMİ ===

  // Seçenek tipi: Kişiliğe uygun mu, zor mu?
  choiceType?: ChoiceType;

  // Bu seçenek kişiliği nasıl değiştirir?
  personalityEffects?: PersonalityEffect[];

  // Bu seçeneği görmek için gereken kişilik
  reqPersonality?: PersonalityRequirement[];

  // Stres etkisi (+ stres ekler, - stres azaltır)
  stressEffect?: number;

  // Kişiliğe göre dinamik feedback
  dynamicFeedback?: {
    introvert?: string;   // openness < 30
    extrovert?: string;   // openness > 70
    brave?: string;       // courage > 70
    cautious?: string;    // courage < 30
    empathetic?: string;  // empathy > 70
    selfish?: string;     // empathy < 30
  };
}

export type EventRarity = 'COMMON' | 'UNCOMMON' | 'RARE';

export type NPCRole = 'ACQUAINTANCE' | 'FRIEND' | 'BEST_FRIEND' | 'CRUSH' | 'PARTNER' | 'RIVAL' | 'ENEMY';

/** İlişki milestone tipleri - rol değişimlerinde tetiklenen eventler için */
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
// NPC SOSYAL SİSTEM TİPLERİ
// =================================================================

/** NPC kişilik tipi - davranışlarını belirler */
export type NPCPersonality = 'FRIENDLY' | 'SHY' | 'AGGRESSIVE' | 'POPULAR' | 'NERDY' | 'ARTISTIC' | 'ATHLETIC';

/** NPC özelliği - ilişki dinamiklerini etkiler */
export type NPCTrait = 'LOYAL' | 'JEALOUS' | 'GOSSIPER' | 'SUPPORTIVE' | 'COMPETITIVE' | 'ROMANTIC' | 'MANIPULATIVE';

/** Sosyal grup tipi */
export type SocialGroupType = 'FRIEND_GROUP' | 'CLIQUE' | 'CLUB' | 'STUDY_GROUP';

/** Sosyal grup yapısı */
export interface SocialGroup {
  id: string;
  name: string;
  members: string[];          // NPC id'leri
  leaderId: string | null;    // Lider NPC id
  type: SocialGroupType;
  reputation: number;         // Grubun okuldaki itibarı (0-100)
  isPlayerMember: boolean;
  formedAtAge: number;
  formedAtTurn: number;
}

// 1. EventContext Yapısı
export interface EventContext {
  age: number;
  traits: string[];
  stats: Stats;
  family: Family | null;
  memories: EventMemory[];
  npcs?: NPC[];
  inventory?: string[];
  gameState?: GameState;

  // === KİŞİLİK SİSTEMİ ===
  personality: Personality;
  stress: StressState;
  grades?: SchoolGrades;
  skills?: Skills;
}

// 2. GameEvent Yapısı (Dinamik Metin Desteği ile)
export interface GameEvent {
  id: string;
  // Text: Düz yazı (string) veya Duruma göre değişen fonksiyon
  text: string | ((context: EventContext) => string);
  minAge: number;
  maxAge: number;
  milestoneLevel?: 'MINOR' | 'MAJOR';
  // Bu event bir ilişki milestone event'i mi?
  isMilestoneEvent?: boolean;
  // Choices: Seçenekler de dinamik olabilir
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

  // === KİŞİLİK SİSTEMİ ===

  // Bu event için gereken kişilik profili
  reqPersonality?: PersonalityRequirement[];

  // Stres eşiği gereksinimi (örn: sadece stres > 70 iken tetiklenir)
  reqStress?: { min?: number; max?: number };

  // Event kategorisi - kişilik sisteminde nasıl ele alınacağını belirler
  personalityCategory?: 'SOCIAL' | 'RISK' | 'MORAL' | 'CONFLICT' | 'GROWTH' | 'BREAKDOWN';

  // Bu event kişiliğin hangi eksenini test ediyor?
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

export interface NPC {
  id: string;
  name: string;
  role: NPCRole;
  relationship: number;         // -100 to 100 (negatif = düşman)
  romance: number;              // 0-100
  gender: 'MALE' | 'FEMALE';
  age: number;

  // === SOSYAL SİSTEM ALANLARI ===
  personality: NPCPersonality;  // NPC kişiliği
  traits: NPCTrait[];           // NPC özellikleri
  metAge: number;               // Tanışma yaşı
  metTurn: number;              // Tanışma turu
  lastInteraction: number;      // Son etkileşim turu
  sharedMemories: string[];     // Ortak anılar (event id'leri)
  isInPlayerGroup: boolean;     // Oyuncu grubunda mı?
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
}

export interface CharacterState {
  characterInfo: CharacterInfo | null;
  personality: Personality;
  stress: StressState;
  personalityHistory: PersonalityShift[];
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

  // === KARAKTER BİLGİLERİ ===
  characterInfo: CharacterInfo | null;
  lastResult: ResultData | null;
  historyLog: LogEntry[];
  family: Family | null;
  maxEnergy: number;

  schoolGrades: SchoolGrades;
  skills: Skills;
  talent: Talent;

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

  // === KİŞİLİK SİSTEMİ ===
  personality: Personality;
  stress: StressState;
  personalityHistory: PersonalityShift[];

  // === SOSYAL SİSTEM ===
  socialGroups: SocialGroup[];    // Oyuncunun dahil olduğu gruplar
  socialReputation: number;       // Genel sosyal itibar (0-100)

  // === SINAV SİSTEMİ ===
  examsTakenThisYear: ExamSubject[];  // Bu yıl girilen sınavlar
  isExamPeriod: boolean;              // Sınav dönemi aktif mi

  // === CHILDHOOD PROLOG ===
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

// Sınav dersleri
export type ExamSubject = 'math' | 'turkish' | 'science' | 'language' | 'history' | 'geography' | 'art' | 'music';

// Tüm sınav dersleri listesi
export const ALL_EXAM_SUBJECTS: ExamSubject[] = ['math', 'turkish', 'science', 'language', 'history', 'geography', 'art', 'music'];

