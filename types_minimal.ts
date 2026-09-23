
export type StatKey = 'health' | 'intelligence' | 'charisma' | 'discipline' | 'energy' | 'money' | 'familyRelation' | 'karma';

export interface GameStats {
  health: number;
  intelligence: number;
  charisma: number;
  discipline: number;
  energy: number;
  money: number;
  familyRelation: number;
  karma: number;
}

export interface NPC {
  id: string;
  name: string;
  role: 'FRIEND' | 'BEST_FRIEND' | 'RIVAL' | 'ENEMY' | 'PARTNER' | 'ACQUAINTANCE';
  relationship: number;
  romance: number;
  gender: 'MALE' | 'FEMALE';
}

export interface Choice {
  text: string;
  effect: Partial<GameStats>;
  feedback: string;
  gradeUpdates?: {
    math?: number;
    science?: number;
    art?: number;
    language?: number;
  };
}

export interface GameEvent {
  id: string;
  text: string;
  minAge: number;
  maxAge: number;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE';
  choices: Choice[];
}
