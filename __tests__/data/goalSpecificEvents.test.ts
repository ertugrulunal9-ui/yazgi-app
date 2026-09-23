import { GOAL_SPECIFIC_EVENTS } from '../../src/data/goalSpecificEvents';
import { EventContext, LifeGoal } from '../../src/types';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';

const buildContext = (selectedGoal: LifeGoal): EventContext => {
  const gameState = {
    ...getInitialGameState(),
    selectedGoal,
  };

  return {
    age: 14,
    traits: gameState.traits,
    stats: getInitialStats(),
    family: gameState.family,
    memories: gameState.memories,
    inventory: gameState.inventory,
    gameState,
    personality: gameState.personality,
    stress: gameState.stress,
    skills: gameState.skills,
    grades: gameState.schoolGrades,
    npcs: gameState.npcs,
  };
};

describe('goalSpecificEvents', () => {
  it('registers 15 goal-gated events (3 per goal)', () => {
    expect(GOAL_SPECIFIC_EVENTS).toHaveLength(15);
  });

  it('evaluates condition callbacks against selectedGoal', () => {
    const socialContext = buildContext('SOCIAL');
    const academicContext = buildContext('ACADEMIC');
    const socialOnlyEvents = GOAL_SPECIFIC_EVENTS.filter(event => event.id.startsWith('goal_social_'));

    expect(socialOnlyEvents.length).toBeGreaterThanOrEqual(3);
    socialOnlyEvents.forEach(event => {
      expect(event.condition?.(socialContext)).toBe(true);
      expect(event.condition?.(academicContext)).toBe(false);
    });
  });
});
