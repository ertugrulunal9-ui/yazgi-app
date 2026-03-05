/**
 * npcInteractionOutcomes.ts — NPC etkilesim sonuc bankasi (Paket 7)
 *
 * Her (interactionType x npcPersonality) kombinasyonu icin
 * zenginlestirilmis sonuclar. NPC kisiligine gore relationship,
 * stat ve feedback degisir.
 */

import type { Stats } from '../types/core';
import type { NPCPersonality } from '../types/npc';

type SocialActionType = 'CHAT' | 'HANGOUT' | 'GIFT' | 'STUDY' | 'FLIRT' | 'HELP' | 'COMPETE' | 'GOSSIP';

export interface InteractionOutcome {
  relationshipDelta: number;
  romanceDelta?: number;
  statEffects?: Partial<Stats>;
  feedbackKey: string;
  stressEffect?: number;
  personalityEffect?: { axis: string; delta: number };
}

type OutcomeBank = Partial<Record<SocialActionType, Partial<Record<NPCPersonality, InteractionOutcome>>>>;

/**
 * NPC kisiligine gore etkilesim sonuclari.
 * Olmayan kombinasyonlar icin default sonuc kullanilir.
 */
const OUTCOME_BANK: OutcomeBank = {
  CHAT: {
    FRIENDLY:   { relationshipDelta: 8,  feedbackKey: 'npc.outcome.chat.friendly',   statEffects: { charisma: 1 } },
    SHY:        { relationshipDelta: 4,  feedbackKey: 'npc.outcome.chat.shy',        statEffects: { charisma: 1 } },
    AGGRESSIVE: { relationshipDelta: 2,  feedbackKey: 'npc.outcome.chat.aggressive', stressEffect: 3 },
    POPULAR:    { relationshipDelta: 6,  feedbackKey: 'npc.outcome.chat.popular',    statEffects: { charisma: 2 } },
    NERDY:      { relationshipDelta: 5,  feedbackKey: 'npc.outcome.chat.nerdy',      statEffects: { intelligence: 1 } },
    ARTISTIC:   { relationshipDelta: 5,  feedbackKey: 'npc.outcome.chat.artistic',   personalityEffect: { axis: 'openness', delta: 1 } },
    ATHLETIC:   { relationshipDelta: 4,  feedbackKey: 'npc.outcome.chat.athletic',   statEffects: { health: 1 } },
  },
  HANGOUT: {
    FRIENDLY:   { relationshipDelta: 10, feedbackKey: 'npc.outcome.hangout.friendly',   statEffects: { charisma: 2 } },
    SHY:        { relationshipDelta: 6,  feedbackKey: 'npc.outcome.hangout.shy',        personalityEffect: { axis: 'empathy', delta: 1 } },
    AGGRESSIVE: { relationshipDelta: 5,  feedbackKey: 'npc.outcome.hangout.aggressive', stressEffect: 5, statEffects: { discipline: 1 } },
    POPULAR:    { relationshipDelta: 8,  feedbackKey: 'npc.outcome.hangout.popular',    statEffects: { charisma: 3 } },
    NERDY:      { relationshipDelta: 7,  feedbackKey: 'npc.outcome.hangout.nerdy',      statEffects: { intelligence: 2 } },
    ARTISTIC:   { relationshipDelta: 7,  feedbackKey: 'npc.outcome.hangout.artistic',   personalityEffect: { axis: 'openness', delta: 2 } },
    ATHLETIC:   { relationshipDelta: 7,  feedbackKey: 'npc.outcome.hangout.athletic',   statEffects: { health: 2 } },
  },
  GIFT: {
    FRIENDLY:   { relationshipDelta: 12, feedbackKey: 'npc.outcome.gift.friendly' },
    SHY:        { relationshipDelta: 10, feedbackKey: 'npc.outcome.gift.shy' },
    AGGRESSIVE: { relationshipDelta: 8,  feedbackKey: 'npc.outcome.gift.aggressive' },
    POPULAR:    { relationshipDelta: 7,  feedbackKey: 'npc.outcome.gift.popular' },
    NERDY:      { relationshipDelta: 9,  feedbackKey: 'npc.outcome.gift.nerdy' },
    ARTISTIC:   { relationshipDelta: 11, feedbackKey: 'npc.outcome.gift.artistic' },
    ATHLETIC:   { relationshipDelta: 8,  feedbackKey: 'npc.outcome.gift.athletic' },
  },
  STUDY: {
    FRIENDLY:   { relationshipDelta: 5,  feedbackKey: 'npc.outcome.study.friendly',   statEffects: { intelligence: 2 } },
    SHY:        { relationshipDelta: 6,  feedbackKey: 'npc.outcome.study.shy',        statEffects: { intelligence: 2 } },
    AGGRESSIVE: { relationshipDelta: 2,  feedbackKey: 'npc.outcome.study.aggressive', statEffects: { intelligence: 1 }, stressEffect: 3 },
    POPULAR:    { relationshipDelta: 4,  feedbackKey: 'npc.outcome.study.popular',    statEffects: { intelligence: 1, charisma: 1 } },
    NERDY:      { relationshipDelta: 10, feedbackKey: 'npc.outcome.study.nerdy',      statEffects: { intelligence: 4 }, personalityEffect: { axis: 'patience', delta: 1 } },
    ARTISTIC:   { relationshipDelta: 4,  feedbackKey: 'npc.outcome.study.artistic',   statEffects: { intelligence: 1 } },
    ATHLETIC:   { relationshipDelta: 3,  feedbackKey: 'npc.outcome.study.athletic',   statEffects: { intelligence: 1, discipline: 1 } },
  },
  FLIRT: {
    FRIENDLY:   { relationshipDelta: 6,  romanceDelta: 8,  feedbackKey: 'npc.outcome.flirt.friendly' },
    SHY:        { relationshipDelta: 3,  romanceDelta: 4,  feedbackKey: 'npc.outcome.flirt.shy',    personalityEffect: { axis: 'courage', delta: 1 } },
    AGGRESSIVE: { relationshipDelta: 5,  romanceDelta: 6,  feedbackKey: 'npc.outcome.flirt.aggressive', stressEffect: 2 },
    POPULAR:    { relationshipDelta: 4,  romanceDelta: 5,  feedbackKey: 'npc.outcome.flirt.popular' },
    NERDY:      { relationshipDelta: 3,  romanceDelta: 3,  feedbackKey: 'npc.outcome.flirt.nerdy' },
    ARTISTIC:   { relationshipDelta: 5,  romanceDelta: 7,  feedbackKey: 'npc.outcome.flirt.artistic', personalityEffect: { axis: 'openness', delta: 1 } },
    ATHLETIC:   { relationshipDelta: 5,  romanceDelta: 6,  feedbackKey: 'npc.outcome.flirt.athletic' },
  },
  HELP: {
    FRIENDLY:   { relationshipDelta: 10, feedbackKey: 'npc.outcome.help.friendly',   statEffects: { charisma: 1 }, personalityEffect: { axis: 'empathy', delta: 2 } },
    SHY:        { relationshipDelta: 8,  feedbackKey: 'npc.outcome.help.shy',        personalityEffect: { axis: 'empathy', delta: 2 } },
    AGGRESSIVE: { relationshipDelta: 6,  feedbackKey: 'npc.outcome.help.aggressive', personalityEffect: { axis: 'courage', delta: 1 } },
    POPULAR:    { relationshipDelta: 7,  feedbackKey: 'npc.outcome.help.popular',    statEffects: { charisma: 2 } },
    NERDY:      { relationshipDelta: 8,  feedbackKey: 'npc.outcome.help.nerdy',      statEffects: { intelligence: 1 } },
    ARTISTIC:   { relationshipDelta: 7,  feedbackKey: 'npc.outcome.help.artistic',   personalityEffect: { axis: 'empathy', delta: 1 } },
    ATHLETIC:   { relationshipDelta: 6,  feedbackKey: 'npc.outcome.help.athletic',   statEffects: { health: 1 } },
  },
  COMPETE: {
    FRIENDLY:   { relationshipDelta: 3,  feedbackKey: 'npc.outcome.compete.friendly',   statEffects: { discipline: 1 } },
    SHY:        { relationshipDelta: 1,  feedbackKey: 'npc.outcome.compete.shy',        stressEffect: 2 },
    AGGRESSIVE: { relationshipDelta: 8,  feedbackKey: 'npc.outcome.compete.aggressive', statEffects: { discipline: 2 }, stressEffect: 5, personalityEffect: { axis: 'courage', delta: 2 } },
    POPULAR:    { relationshipDelta: 5,  feedbackKey: 'npc.outcome.compete.popular',    statEffects: { charisma: 1, discipline: 1 } },
    NERDY:      { relationshipDelta: 3,  feedbackKey: 'npc.outcome.compete.nerdy',      statEffects: { intelligence: 2 } },
    ARTISTIC:   { relationshipDelta: 2,  feedbackKey: 'npc.outcome.compete.artistic' },
    ATHLETIC:   { relationshipDelta: 7,  feedbackKey: 'npc.outcome.compete.athletic',   statEffects: { health: 2, discipline: 2 }, personalityEffect: { axis: 'courage', delta: 2 } },
  },
  GOSSIP: {
    FRIENDLY:   { relationshipDelta: 4,  feedbackKey: 'npc.outcome.gossip.friendly',   personalityEffect: { axis: 'conformity', delta: 1 } },
    SHY:        { relationshipDelta: 2,  feedbackKey: 'npc.outcome.gossip.shy' },
    AGGRESSIVE: { relationshipDelta: 5,  feedbackKey: 'npc.outcome.gossip.aggressive', personalityEffect: { axis: 'empathy', delta: -1 } },
    POPULAR:    { relationshipDelta: 7,  feedbackKey: 'npc.outcome.gossip.popular',    statEffects: { charisma: 1 }, personalityEffect: { axis: 'conformity', delta: 2 } },
    NERDY:      { relationshipDelta: 2,  feedbackKey: 'npc.outcome.gossip.nerdy' },
    ARTISTIC:   { relationshipDelta: 3,  feedbackKey: 'npc.outcome.gossip.artistic' },
    ATHLETIC:   { relationshipDelta: 3,  feedbackKey: 'npc.outcome.gossip.athletic' },
  },
};

const DEFAULT_OUTCOME: InteractionOutcome = {
  relationshipDelta: 5,
  feedbackKey: 'npc.outcome.default',
};

/**
 * NPC kisiligine gore etkilesim sonucunu coz.
 * Feature flag kontrolu cagiran tarafta yapilir.
 */
export function resolveInteractionOutcome(
  actionType: SocialActionType,
  npcPersonality: NPCPersonality,
): InteractionOutcome {
  const actionOutcomes = OUTCOME_BANK[actionType];
  if (!actionOutcomes) return DEFAULT_OUTCOME;

  return actionOutcomes[npcPersonality] ?? DEFAULT_OUTCOME;
}
