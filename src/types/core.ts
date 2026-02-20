// =================================================================
// CORE TYPES — Stats, Skills, Grades, Primitives, Items, UI
// =================================================================

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

export type Talent = 'NONE' | 'CODING' | 'MUSIC' | 'SPORTS';
export type LifeGoal = 'ACADEMIC' | 'ATHLETIC' | 'CREATIVE' | 'WEALTH' | 'SOCIAL';
export type PlayerGender = 'MALE' | 'FEMALE';

export type ZodiacSign =
  | 'KOC' | 'BOGA' | 'IKIZLER' | 'YENGEC' | 'ASLAN' | 'BASAK'
  | 'TERAZI' | 'AKREP' | 'YAY' | 'OGLAK' | 'KOVA' | 'BALIK';

export interface CharacterInfo {
  firstName: string;
  lastName: string;
  gender: PlayerGender;
  birthMonth: number;
  birthDay: number;
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

export interface Item {
  id: string;
  name: string;
  price: number;
  description: string;
  type: 'PERMANENT' | 'CONSUMABLE';
  effect?: Partial<Stats>;
  requiredForAction?: string;
}

export type GamePhase =
  | 'SETUP' | 'HUB' | 'EVENT' | 'RESULT' | 'GAME_OVER'
  | 'HUB_STUDY' | 'HUB_SPORTS' | 'HUB_COMPUTER' | 'HUB_ART'
  | 'HUB_SHOP' | 'HUB_INVENTORY' | 'HUB_WORK' | 'HUB_SKILLS'
  | 'HUB_SOCIAL' | 'REPORT_CARD' | 'HUB_INTERACTION';

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

export type FloatingTextAnimation = 'arcadeFloat' | 'bounce' | 'curve';

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  animationType?: FloatingTextAnimation;
  duration?: number;
}

export interface ActionHistoryItem {
  actionId: string;
  age: number;
  turn: number;
}

export type ExamSubject =
  | 'math' | 'turkish' | 'science' | 'language'
  | 'history' | 'geography' | 'art' | 'music';

export const ALL_EXAM_SUBJECTS: ExamSubject[] = [
  'math', 'turkish', 'science', 'language', 'history', 'geography', 'art', 'music',
];

// =================================================================
// TRAIT SYSTEM
// =================================================================

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
    progressCooldownTurns?: number;
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

export interface TraitProgressData {
  points: number;
  required: number;
  isLocked: boolean;
  firstTriggeredAge: number;
  lastProgressTurn?: number;
}
