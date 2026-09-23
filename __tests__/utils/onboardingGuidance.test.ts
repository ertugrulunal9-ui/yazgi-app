import { getInitialGameState } from '../../src/utils/gameUtils';
import {
  getOnboardingCohort,
  getOnboardingGuidanceAction,
  hasBalancedOnboardingRoutine,
  hasActionPrefix,
  isInOnboardingWindow,
  meetsCohortGuidanceObjective,
} from '../../src/utils/onboardingGuidance';

describe('onboardingGuidance', () => {
  it('detects onboarding window from session count', () => {
    const state = getInitialGameState();
    state.sessionCount = 1;
    expect(isInOnboardingWindow(state)).toBe(true);
    state.sessionCount = 3;
    expect(isInOnboardingWindow(state)).toBe(true);
    state.sessionCount = 4;
    expect(isInOnboardingWindow(state)).toBe(false);
  });

  it('classifies cohort by action tendency', () => {
    const socialState = getInitialGameState();
    socialState.actionHistory = [
      { actionId: 'social_chat', age: 8, turn: 10 },
      { actionId: 'social_hangout', age: 8, turn: 11 },
    ];
    expect(getOnboardingCohort(socialState)).toBe('SOCIALIZER');

    const scholarState = getInitialGameState();
    scholarState.actionHistory = [
      { actionId: 'study_math', age: 8, turn: 10 },
      { actionId: 'study_science', age: 8, turn: 11 },
    ];
    expect(getOnboardingCohort(scholarState)).toBe('SCHOLAR');
  });

  it('maps cohort to guidance action', () => {
    expect(getOnboardingGuidanceAction('SOCIALIZER')).toBe('social');
    expect(getOnboardingGuidanceAction('SCHOLAR')).toBe('study');
    expect(getOnboardingGuidanceAction('STRIVER')).toBe('work');
    expect(getOnboardingGuidanceAction('GENERALIST')).toBe('explore');
  });

  it('checks cohort objective completion', () => {
    const state = getInitialGameState();
    state.actionHistory = [{ actionId: 'study_math', age: 9, turn: 12 }];
    expect(hasActionPrefix(state, ['study_'])).toBe(true);
    expect(meetsCohortGuidanceObjective(state)).toBe(true);
  });

  it('detects balanced onboarding routine', () => {
    const state = getInitialGameState();
    state.actionHistory = [
      { actionId: 'study_math', age: 9, turn: 10 },
      { actionId: 'social_chat', age: 9, turn: 11 },
      { actionId: 'work_shop', age: 9, turn: 12 },
    ];
    state.eventChoiceHistory = ['evt_1', 'evt_2'];
    expect(hasBalancedOnboardingRoutine(state)).toBe(true);
  });
});
