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
      expect(INITIAL_TUTORIAL_STATE.sessionNumber).toBe(1);
    });
  });

  describe('advanceTutorial', () => {
    it('advances from GOAL_VISION to WELCOME_HUB', () => {
      const next = advanceTutorial(INITIAL_TUTORIAL_STATE);
      expect(next.currentStep).toBe('WELCOME_HUB');
      expect(next.completedSteps).toContain('GOAL_VISION');
      expect(next.sessionNumber).toBe(1);
    });

    it('advances through all steps to COMPLETED', () => {
      let state: TutorialState = INITIAL_TUTORIAL_STATE;
      const steps = [
        'WELCOME_HUB',
        'FIRST_ACTION',
        'STAT_CHANGE',
        'FIRST_EVENT',
        'ENERGY_EXPLAIN',
        'FATE_TOKEN_TUTORIAL',
        'PERSONALITY_MOMENTUM',
        'NPC_INTRODUCTION',
        'COMPLETED',
      ];

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
      expect(result.completedSteps).toContain('FATE_TOKEN_TUTORIAL');
      expect(result.completedSteps).toContain('PERSONALITY_MOMENTUM');
      expect(result.completedSteps).toContain('NPC_INTRODUCTION');
      expect(result.completedSteps).not.toContain('COMPLETED');
    });

    it('preserves provided session number', () => {
      const result = skipTutorial(3);
      expect(result.sessionNumber).toBe(3);
    });
  });

  describe('getTutorialContent', () => {
    it('returns dynamic content for GOAL_VISION', () => {
      const content = getTutorialContent('GOAL_VISION', { selectedGoal: 'ACADEMIC' });
      expect(content).not.toBeNull();
      expect(content!.message).toContain('Akademik');
      expect(content!.stepNumber).toBe(1);
      expect(content!.totalSteps).toBe(9);
    });

    it('returns content for WELCOME_HUB', () => {
      const content = getTutorialContent('WELCOME_HUB');
      expect(content).not.toBeNull();
      expect(content!.title).toBeTruthy();
      expect(content!.message).toBeTruthy();
      expect(content!.stepNumber).toBe(2);
      expect(content!.totalSteps).toBe(9);
    });

    it('returns null for COMPLETED', () => {
      expect(getTutorialContent('COMPLETED')).toBeNull();
    });

    it('returns returning text for GOAL_VISION when sessionNumber > 1', () => {
      const content = getTutorialContent('GOAL_VISION', {
        selectedGoal: 'ACADEMIC',
        sessionNumber: 2,
      });
      expect(content).not.toBeNull();
      expect(content!.title).toBe('Yeni Bir Hayat');
      expect(content!.message).toContain('Akademik');
    });

    it('returns original text for GOAL_VISION when sessionNumber is 1', () => {
      const content = getTutorialContent('GOAL_VISION', {
        selectedGoal: 'ACADEMIC',
        sessionNumber: 1,
      });
      expect(content).not.toBeNull();
      expect(content!.title).toBe('Hayalin');
    });

    it('returns returning text for WELCOME_HUB when sessionNumber > 1', () => {
      const content = getTutorialContent('WELCOME_HUB', { sessionNumber: 2 });
      expect(content).not.toBeNull();
      expect(content!.title).toBe('Tekrar Merhaba!');
    });

    it('returns original text for WELCOME_HUB when sessionNumber is 1', () => {
      const content = getTutorialContent('WELCOME_HUB', { sessionNumber: 1 });
      expect(content).not.toBeNull();
      expect(content!.title).toBe('Hayatina Hos Geldin!');
    });

    it('has correct step numbers for all steps', () => {
      expect(getTutorialContent('GOAL_VISION')!.stepNumber).toBe(1);
      expect(getTutorialContent('WELCOME_HUB')!.stepNumber).toBe(2);
      expect(getTutorialContent('FIRST_ACTION')!.stepNumber).toBe(3);
      expect(getTutorialContent('STAT_CHANGE')!.stepNumber).toBe(4);
      expect(getTutorialContent('FIRST_EVENT')!.stepNumber).toBe(5);
      expect(getTutorialContent('ENERGY_EXPLAIN')!.stepNumber).toBe(6);
      expect(getTutorialContent('FATE_TOKEN_TUTORIAL')!.stepNumber).toBe(7);
      expect(getTutorialContent('PERSONALITY_MOMENTUM')!.stepNumber).toBe(8);
      expect(getTutorialContent('NPC_INTRODUCTION')!.stepNumber).toBe(9);
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
      sessionNumber: 1,
      fateTokens: 0,
      momentumStreak: 0,
      npcRoleChanged: false,
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

    it('shows FATE_TOKEN_TUTORIAL in first session when token is earned early', () => {
      expect(shouldShowStep('FATE_TOKEN_TUTORIAL', {
        ...baseContext,
        turn: 12,
        fateTokens: 1,
      })).toBe(true);
    });

    it('does not show FATE_TOKEN_TUTORIAL after the early turn window', () => {
      expect(shouldShowStep('FATE_TOKEN_TUTORIAL', {
        ...baseContext,
        turn: 21,
        fateTokens: 1,
      })).toBe(false);
    });

    it('hides PERSONALITY_MOMENTUM in session 1 even with streak', () => {
      expect(shouldShowStep('PERSONALITY_MOMENTUM', {
        ...baseContext,
        momentumStreak: 3,
        sessionNumber: 1,
      })).toBe(false);
    });

    it('shows PERSONALITY_MOMENTUM in session 2 when streak reaches 3', () => {
      expect(shouldShowStep('PERSONALITY_MOMENTUM', {
        ...baseContext,
        sessionNumber: 2,
        momentumStreak: 3,
      })).toBe(true);
    });

    it('shows PERSONALITY_MOMENTUM in session 3 with streak >= 1 (fallback)', () => {
      expect(shouldShowStep('PERSONALITY_MOMENTUM', {
        ...baseContext,
        sessionNumber: 3,
        momentumStreak: 1,
      })).toBe(true);
    });

    it('does not show PERSONALITY_MOMENTUM in session 2 with streak < 3 and no fallback', () => {
      expect(shouldShowStep('PERSONALITY_MOMENTUM', {
        ...baseContext,
        sessionNumber: 2,
        momentumStreak: 1,
      })).toBe(false);
    });

    it('shows NPC_INTRODUCTION in session 2 when an NPC role changes', () => {
      expect(shouldShowStep('NPC_INTRODUCTION', {
        ...baseContext,
        sessionNumber: 2,
        npcRoleChanged: true,
      })).toBe(true);
    });

    it('shows NPC_INTRODUCTION in session 3 regardless of role change (fallback)', () => {
      expect(shouldShowStep('NPC_INTRODUCTION', {
        ...baseContext,
        sessionNumber: 3,
        npcRoleChanged: false,
      })).toBe(true);
    });

    it('does not show NPC_INTRODUCTION in session 2 without role change', () => {
      expect(shouldShowStep('NPC_INTRODUCTION', {
        ...baseContext,
        sessionNumber: 2,
        npcRoleChanged: false,
      })).toBe(false);
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
