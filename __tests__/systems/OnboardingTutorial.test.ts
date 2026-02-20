import {
  INITIAL_TUTORIAL_STATE,
  advanceTutorial,
  skipTutorial,
  getTutorialContent,
  shouldShowStep,
  isTutorialComplete,
  TutorialState,
} from '../../src/systems/OnboardingTutorial';

describe('OnboardingTutorial', () => {
  describe('INITIAL_TUTORIAL_STATE', () => {
    it('starts at GOAL_VISION with no completed steps', () => {
      expect(INITIAL_TUTORIAL_STATE.currentStep).toBe('GOAL_VISION');
      expect(INITIAL_TUTORIAL_STATE.completedSteps).toEqual([]);
    });
  });

  describe('advanceTutorial', () => {
    it('advances from GOAL_VISION to WELCOME_HUB', () => {
      const next = advanceTutorial(INITIAL_TUTORIAL_STATE);
      expect(next.currentStep).toBe('WELCOME_HUB');
      expect(next.completedSteps).toContain('GOAL_VISION');
    });

    it('advances through all steps to COMPLETED', () => {
      let state: TutorialState = INITIAL_TUTORIAL_STATE;
      const steps = ['WELCOME_HUB', 'FIRST_ACTION', 'STAT_CHANGE', 'FIRST_EVENT', 'ENERGY_EXPLAIN', 'COMPLETED'];

      for (const expectedStep of steps) {
        state = advanceTutorial(state);
        expect(state.currentStep).toBe(expectedStep);
      }
    });

    it('does not advance past COMPLETED', () => {
      const completed = skipTutorial();
      const stillCompleted = advanceTutorial(completed);
      expect(stillCompleted.currentStep).toBe('COMPLETED');
    });
  });

  describe('skipTutorial', () => {
    it('sets currentStep to COMPLETED', () => {
      const result = skipTutorial();
      expect(result.currentStep).toBe('COMPLETED');
    });

    it('marks all steps as completed', () => {
      const result = skipTutorial();
      expect(result.completedSteps).toContain('GOAL_VISION');
      expect(result.completedSteps).toContain('WELCOME_HUB');
      expect(result.completedSteps).toContain('FIRST_ACTION');
      expect(result.completedSteps).toContain('ENERGY_EXPLAIN');
      expect(result.completedSteps).not.toContain('COMPLETED');
    });
  });

  describe('getTutorialContent', () => {
    it('returns dynamic content for GOAL_VISION', () => {
      const content = getTutorialContent('GOAL_VISION', { selectedGoal: 'ACADEMIC' });
      expect(content).not.toBeNull();
      expect(content!.message).toContain('Akademik');
      expect(content!.stepNumber).toBe(1);
      expect(content!.totalSteps).toBe(6);
    });

    it('returns content for WELCOME_HUB', () => {
      const content = getTutorialContent('WELCOME_HUB');
      expect(content).not.toBeNull();
      expect(content!.title).toBeTruthy();
      expect(content!.message).toBeTruthy();
      expect(content!.stepNumber).toBe(2);
      expect(content!.totalSteps).toBe(6);
    });

    it('returns null for COMPLETED', () => {
      expect(getTutorialContent('COMPLETED')).toBeNull();
    });

    it('has correct step numbers for all steps', () => {
      expect(getTutorialContent('GOAL_VISION')!.stepNumber).toBe(1);
      expect(getTutorialContent('WELCOME_HUB')!.stepNumber).toBe(2);
      expect(getTutorialContent('FIRST_ACTION')!.stepNumber).toBe(3);
      expect(getTutorialContent('STAT_CHANGE')!.stepNumber).toBe(4);
      expect(getTutorialContent('FIRST_EVENT')!.stepNumber).toBe(5);
      expect(getTutorialContent('ENERGY_EXPLAIN')!.stepNumber).toBe(6);
    });
  });

  describe('shouldShowStep', () => {
    const baseContext = {
      phase: 'HUB',
      turn: 1,
      selectedGoal: 'ACADEMIC' as const,
      actionHistory: [] as string[],
      eventChoiceHistory: [] as Array<{ eventId: string }>,
      energy: 100,
      maxEnergy: 100,
    };

    it('shows GOAL_VISION only on first hub turn when goal exists', () => {
      expect(shouldShowStep('GOAL_VISION', baseContext)).toBe(true);
      expect(shouldShowStep('GOAL_VISION', { ...baseContext, selectedGoal: null })).toBe(false);
      expect(shouldShowStep('GOAL_VISION', { ...baseContext, turn: 2 })).toBe(false);
    });

    it('shows GOAL_VISION in SETUP phase for a new game', () => {
      expect(shouldShowStep('GOAL_VISION', { ...baseContext, phase: 'SETUP' })).toBe(true);
    });

    it('shows WELCOME_HUB on turn 1 in HUB phase', () => {
      expect(shouldShowStep('WELCOME_HUB', baseContext)).toBe(true);
    });

    it('does not show WELCOME_HUB after turn 1', () => {
      expect(shouldShowStep('WELCOME_HUB', { ...baseContext, turn: 3 })).toBe(false);
    });

    it('shows FIRST_ACTION when no actions taken', () => {
      expect(shouldShowStep('FIRST_ACTION', { ...baseContext, turn: 2 })).toBe(true);
    });

    it('does not show FIRST_ACTION if actions exist', () => {
      expect(shouldShowStep('FIRST_ACTION', { ...baseContext, actionHistory: ['study'] })).toBe(false);
    });

    it('shows STAT_CHANGE after first action', () => {
      expect(shouldShowStep('STAT_CHANGE', { ...baseContext, actionHistory: ['study'] })).toBe(true);
    });

    it('shows FIRST_EVENT in EVENT phase with no choices', () => {
      expect(shouldShowStep('FIRST_EVENT', { ...baseContext, phase: 'EVENT' })).toBe(true);
    });

    it('does not show FIRST_EVENT if choices exist', () => {
      expect(shouldShowStep('FIRST_EVENT', {
        ...baseContext,
        phase: 'EVENT',
        eventChoiceHistory: [{ eventId: 'test' }],
      })).toBe(false);
    });

    it('shows ENERGY_EXPLAIN when energy is low', () => {
      expect(shouldShowStep('ENERGY_EXPLAIN', {
        ...baseContext,
        turn: 3,
        energy: 30,
        maxEnergy: 100,
      })).toBe(true);
    });

    it('does not show ENERGY_EXPLAIN when energy is high', () => {
      expect(shouldShowStep('ENERGY_EXPLAIN', baseContext)).toBe(false);
    });

    it('never shows COMPLETED step', () => {
      expect(shouldShowStep('COMPLETED', baseContext)).toBe(false);
    });
  });

  describe('isTutorialComplete', () => {
    it('returns false for initial state', () => {
      expect(isTutorialComplete(INITIAL_TUTORIAL_STATE)).toBe(false);
    });

    it('returns true for completed state', () => {
      expect(isTutorialComplete(skipTutorial())).toBe(true);
    });
  });
});
