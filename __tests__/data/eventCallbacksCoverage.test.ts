import { EVENTS } from '../../src/data/events';
import { EventContext, GameState, NPC } from '../../src/types';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';

const buildNpc = (
  id: string,
  name: string,
  role: NPC['role'],
  relationship: number
): NPC => ({
  id,
  name,
  role,
  relationship,
  romance: role === 'CRUSH' || role === 'PARTNER' ? 60 : 0,
  gender: id.endsWith('f') ? 'FEMALE' : 'MALE',
  age: 16,
  personality: 'FRIENDLY',
  traits: ['LOYAL'],
  metAge: 10,
  metTurn: 20,
  lastInteraction: 40,
  sharedMemories: [],
  isInPlayerGroup: role !== 'ENEMY',
});

const createContext = (
  overrides: Partial<EventContext> = {},
  personalityOverrides: Partial<EventContext['personality']> = {}
): EventContext => {
  const baseState = getInitialGameState();
  const stats = { ...getInitialStats(), health: 65, intelligence: 68, charisma: 62, discipline: 59, money: 320, energy: 80, familyRelation: 64 };
  const personality = {
    ...baseState.personality,
    ...personalityOverrides,
  };
  const npcs = [
    buildNpc('npc_friend_m', 'Ali', 'FRIEND', 60),
    buildNpc('npc_best_m', 'Mert', 'BEST_FRIEND', 85),
    buildNpc('npc_crush_f', 'Elif', 'CRUSH', 40),
    buildNpc('npc_partner_f', 'Zeynep', 'PARTNER', 72),
    buildNpc('npc_rival_m', 'Can', 'RIVAL', -35),
  ];

  const gameState: GameState = {
    ...baseState,
    age: overrides.age ?? 15,
    turn: 77,
    totalTurns: 120,
    phase: 'EVENT',
    family: overrides.family ?? { wealth: 'MIDDLE', dynamic: 'SUPPORTIVE', allowance: 35 },
    traits: overrides.traits ?? ['DISCIPLINED', 'EMPATHETIC'],
    eventChoiceHistory: ['evt_a', 'evt_b'],
    actionHistory: [
      { actionId: 'study_math', age: 14, turn: 70 },
      { actionId: 'social_chat', age: 15, turn: 75 },
    ],
    selectedGoal: 'ACADEMIC',
    npcs: overrides.npcs ?? npcs,
    inventory: overrides.inventory ?? ['item_notebook'],
    stats,
    personality,
    schoolGrades: { ...baseState.schoolGrades, math: 76, science: 73, language: 70, turkish: 79, history: 67, geography: 66, art: 61, music: 63 },
    skills: { ...baseState.skills, coding: 42, music: 37, sports: 34, design: 28, athletics: 30, logic: 45, reading: 40, teamwork: 35, art: 27, writing: 32, work_ethic: 44, business: 26 },
    stress: overrides.stress ?? { ...baseState.stress, current: 42 },
    memories: overrides.memories ?? [],
  };

  return {
    age: gameState.age,
    traits: gameState.traits,
    stats,
    family: gameState.family,
    memories: gameState.memories,
    npcs: gameState.npcs,
    inventory: gameState.inventory,
    gameState,
    personality,
    stress: gameState.stress,
    grades: gameState.schoolGrades,
    skills: gameState.skills,
  };
};

describe('event callback coverage', () => {
  const contexts = [
    createContext(),
    createContext({}, { openness: 15, courage: 20, empathy: 85, patience: 75, conformity: 80 }),
    createContext(
      {
        family: { wealth: 'POOR', dynamic: 'STRICT', allowance: 4 },
        traits: ['REBELLIOUS', 'COWARD'],
      },
      { openness: 85, courage: 88, empathy: 18, patience: 25, conformity: 22 }
    ),
  ];

  it('resolves dynamic event texts, dynamic choices and conditional outcomes', () => {
    expect(EVENTS.length).toBeGreaterThan(0);

    for (const event of EVENTS) {
      for (const context of contexts) {
        if (typeof event.text === 'function') {
          const text = event.text(context);
          expect(typeof text).toBe('string');
        } else {
          expect(typeof event.text).toBe('string');
        }

        for (const choiceCandidate of event.choices) {
          const choice = typeof choiceCandidate === 'function'
            ? choiceCandidate(context)
            : choiceCandidate;

          expect(choice).toBeDefined();
          expect(typeof choice.text).toBe('string');
          expect(typeof choice.feedback).toBe('string');

          if (choice.conditionalOutcomes) {
            for (const outcome of choice.conditionalOutcomes) {
              expect(typeof outcome.condition(context)).toBe('boolean');
            }
          }
        }
      }
    }
  });
});

