import { GOAL_CHAIN_ARC, GOAL_CHAIN_EVENTS, getGoalChainStage } from '../../src/data/goalChainEvents';
import { EventContext, GameState } from '../../src/types';
import { getInitialGameState } from '../../src/utils/gameUtils';

const buildContext = (selectedGoal: GameState['selectedGoal']): EventContext => {
  const gameState = {
    ...getInitialGameState(),
    selectedGoal,
  };

  return {
    age: 15,
    traits: [],
    stats: gameState.stats ?? {
      health: 60,
      intelligence: 60,
      charisma: 60,
      discipline: 60,
      money: 100,
      energy: 60,
      familyRelation: 60,
    },
    family: gameState.family,
    memories: [],
    inventory: [],
    gameState,
    personality: gameState.personality,
    stress: gameState.stress,
    skills: gameState.skills,
    grades: gameState.schoolGrades,
    npcs: [],
  };
};

describe('goalChainEvents', () => {
  it('maps chain event ids to milestone stages', () => {
    expect(getGoalChainStage('goal_chain_stage1_discovery')).toBe(1);
    expect(getGoalChainStage('goal_chain_stage2_first_competition')).toBe(2);
    expect(getGoalChainStage('goal_chain_stage3_grand_final')).toBe(3);
    expect(getGoalChainStage('unknown_event')).toBeNull();
  });

  it('renders goal-specific stage text after goal selection', () => {
    const stage1 = GOAL_CHAIN_EVENTS[0];
    const stage2 = GOAL_CHAIN_EVENTS[1];
    const stage3 = GOAL_CHAIN_EVENTS[2];
    const athleticText = typeof stage1.text === 'function'
      ? stage1.text(buildContext('ATHLETIC'))
      : stage1.text;
    const academicText = typeof stage1.text === 'function'
      ? stage1.text(buildContext('ACADEMIC'))
      : stage1.text;

    expect(athleticText).toContain('Antrenor');
    expect(academicText).toContain('Ogretmenin');
    expect(stage2.reqEventIds).toEqual(['goal_chain_stage1_discovery']);
    expect(stage3.reqEventIds).toEqual(['goal_chain_stage2_first_competition']);
    expect(GOAL_CHAIN_ARC.events).toHaveLength(3);
  });
});

