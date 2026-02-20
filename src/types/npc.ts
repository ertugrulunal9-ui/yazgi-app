// =================================================================
// NPC SYSTEM — Roles, Relationships, Social Groups
// =================================================================

export type NPCRole =
  | 'ACQUAINTANCE' | 'FRIEND' | 'BEST_FRIEND'
  | 'CRUSH' | 'PARTNER' | 'RIVAL' | 'ENEMY';

export type RelationshipMilestone =
  | 'BECAME_FRIEND' | 'BECAME_BEST_FRIEND' | 'BECAME_CRUSH'
  | 'BECAME_PARTNER' | 'BECAME_RIVAL' | 'BECAME_ENEMY'
  | 'LOST_FRIEND' | 'BREAKUP';

export type NPCPersonality =
  | 'FRIENDLY' | 'SHY' | 'AGGRESSIVE' | 'POPULAR'
  | 'NERDY' | 'ARTISTIC' | 'ATHLETIC';

export type NPCTrait =
  | 'LOYAL' | 'JEALOUS' | 'GOSSIPER' | 'SUPPORTIVE'
  | 'COMPETITIVE' | 'ROMANTIC' | 'MANIPULATIVE';

export type SocialGroupType = 'FRIEND_GROUP' | 'CLIQUE' | 'CLUB' | 'STUDY_GROUP';

export interface SocialGroup {
  id: string;
  name: string;
  members: string[];
  leaderId: string | null;
  type: SocialGroupType;
  reputation: number;
  isPlayerMember: boolean;
  formedAtAge: number;
  formedAtTurn: number;
}

export interface NPC {
  id: string;
  name: string;
  role: NPCRole;
  relationship: number;
  romance: number;
  gender: 'MALE' | 'FEMALE';
  age: number;
  personality: NPCPersonality;
  traits: NPCTrait[];
  metAge: number;
  metTurn: number;
  lastInteraction: number;
  sharedMemories: string[];
  isInPlayerGroup: boolean;
  groupId?: string;
}
