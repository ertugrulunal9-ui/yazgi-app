
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
}

export interface ChoiceEffect {
  [key: string]: number;
}

export type FamilyWealth = 'POOR' | 'MIDDLE' | 'RICH';
export type FamilyDynamic = 'SUPPORTIVE' | 'STRICT' | 'CHAOTIC';

export interface Skills {
  coding: number;
  music: number;
  sports: number;
  design: number;
}

export type Talent = 'NONE' | 'CODING' | 'MUSIC' | 'SPORTS';

export interface Family {
  wealth: FamilyWealth;
  dynamic: FamilyDynamic;
  allowance: number;
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

export interface FutureEventConfig {
  trigger: 'TURNS' | 'AGE';
  turnsLater?: number;
  age?: number;
  eventId: string;
  condition?: string;
  priority?: 'HIGH' | 'NORMAL';
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
}

export type EventRarity = 'COMMON' | 'UNCOMMON' | 'RARE';

export type NPCRole = 'ACQUAINTANCE' | 'FRIEND' | 'BEST_FRIEND' | 'CRUSH' | 'PARTNER' | 'RIVAL' | 'ENEMY';

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
}

// 2. GameEvent Yapısı (Dinamik Metin Desteği ile)
export interface GameEvent {
  id: string;
  // Text: Düz yazı (string) veya Duruma göre değişen fonksiyon
  text: string | ((context: EventContext) => string);
  minAge: number;
  maxAge: number;
  milestoneLevel?: 'MINOR' | 'MAJOR';
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
  tags?: string[];
  difficulty?: number;
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
}

export interface NPC {
  id: string;
  name: string;
  role: NPCRole;
  relationship: number;
  romance: number;
  gender: 'MALE' | 'FEMALE';
  age?: number;
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
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

export interface GameState {
  age: number;
  turn: number;
  phase: GamePhase;
  currentEvent: GameEvent | null;
  pendingReportCard: boolean;
  lastResult: {
    feedback: string;
    changes: Partial<Stats>;
  } | null;
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
  lastInteracted: { [key: string]: number };
  recentEvents: string[];
  
  memories: EventMemory[];
  scheduledEvents: ScheduledEvent[];
  
  // Achievement System
  unlockedAchievements: UnlockedAchievement[];
  achievementProgress: { [achievementId: string]: number };
}
