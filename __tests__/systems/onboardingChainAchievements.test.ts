import { getAchievement } from '../../src/systems/achievementDefinitions';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';

const noopSkills = getInitialGameState().skills;
const noopGrades = getInitialGameState().schoolGrades;

describe('onboarding chain achievements', () => {
  it('unlocks first chain step after first event choice in first 3 sessions', () => {
    const achievement = getAchievement('onboarding_chain_first_choice');
    expect(achievement).toBeDefined();

    const state = getInitialGameState();
    state.sessionCount = 1;
    state.eventChoiceHistory = ['evt_intro'];

    const result = achievement!.check(getInitialStats(), state, noopSkills, noopGrades);
    expect(result).toBe(true);
  });

  it('requires step1 and cohort objective for second step', () => {
    const achievement = getAchievement('onboarding_chain_cohort_path');
    expect(achievement).toBeDefined();

    const state = getInitialGameState();
    state.sessionCount = 2;
    state.actionHistory = [{ actionId: 'social_chat', age: 8, turn: 4 }];
    state.unlockedAchievements = [
      {
        achievementId: 'onboarding_chain_first_choice',
        unlockedAt: 8,
        timestamp: new Date().toISOString(),
      },
    ];

    const result = achievement!.check(getInitialStats(), state, noopSkills, noopGrades);
    expect(result).toBe(true);
  });

  it('requires step2 and balanced routine for third step', () => {
    const achievement = getAchievement('onboarding_chain_routine_builder');
    expect(achievement).toBeDefined();

    const state = getInitialGameState();
    state.sessionCount = 3;
    state.actionHistory = [
      { actionId: 'study_math', age: 9, turn: 10 },
      { actionId: 'social_chat', age: 9, turn: 11 },
      { actionId: 'work_shop', age: 9, turn: 12 },
    ];
    state.eventChoiceHistory = ['evt_1', 'evt_2'];
    state.unlockedAchievements = [
      {
        achievementId: 'onboarding_chain_cohort_path',
        unlockedAt: 9,
        timestamp: new Date().toISOString(),
      },
    ];

    const result = achievement!.check(getInitialStats(), state, noopSkills, noopGrades);
    expect(result).toBe(true);
  });
});
