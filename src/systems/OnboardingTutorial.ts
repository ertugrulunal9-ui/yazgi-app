/**
 * Onboarding Tutorial State Machine
 * Pure functions - no side effects, easily testable.
 */

import { tRuntime } from '../i18n/strings';
import { LifeGoal } from '../types';
import { getLifeGoalMeta } from '../utils/lifeGoalSystem';

export type TutorialStep =
  | 'GOAL_VISION'
  | 'WELCOME_HUB'
  | 'FIRST_ACTION'
  | 'STAT_CHANGE'
  | 'FIRST_EVENT'
  | 'ENERGY_EXPLAIN'
  | 'FATE_TOKEN_TUTORIAL'
  | 'PERSONALITY_MOMENTUM'
  | 'NPC_INTRODUCTION'
  | 'COMPLETED';

export interface TutorialState {
  currentStep: TutorialStep;
  completedSteps: TutorialStep[];
  sessionNumber: number;
}

export const INITIAL_TUTORIAL_STATE: TutorialState = {
  currentStep: 'GOAL_VISION',
  completedSteps: [],
  sessionNumber: 1,
};

export const TUTORIAL_STEPS_ORDER: TutorialStep[] = [
  'GOAL_VISION',
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

export interface TutorialContent {
  title: string;
  message: string;
  stepNumber: number;
  totalSteps: number;
}

const isTutorialHubPhase = (phase: string): boolean =>
  phase === 'HUB' || phase === 'SETUP';

const RETURNING_COPY_STEPS = new Set<TutorialStep>(['GOAL_VISION', 'WELCOME_HUB']);
const TOTAL_STEPS = TUTORIAL_STEPS_ORDER.filter(step => step !== 'COMPLETED').length;

interface TutorialContentContext {
  selectedGoal?: LifeGoal | null;
  sessionNumber?: number;
}

const getGoalVisionMessage = (
  context: TutorialContentContext | undefined,
  isReturning: boolean
): string => {
  const goalMeta = getLifeGoalMeta(context?.selectedGoal ?? null);
  const goalName = goalMeta?.shortLabel ?? 'guclu bir rota';
  const keyStats = goalMeta?.statHint ?? 'temel statlarini';

  if (isReturning) {
    return tRuntime(
      'onboardingFlow.tutorial.step.GOAL_VISION.returningMessage',
      { goalName }
    );
  }

  return tRuntime(
    'onboardingFlow.tutorial.step.GOAL_VISION.message',
    { goalName, keyStats }
  );
};

/**
 * Get the display content for the current tutorial step.
 */
export const getTutorialContent = (step: TutorialStep, context?: TutorialContentContext): TutorialContent | null => {
  if (step === 'COMPLETED') return null;

  const i18nBase = `onboardingFlow.tutorial.step.${step}`;
  const stepIndex = TUTORIAL_STEPS_ORDER.indexOf(step);
  const isReturning = (context?.sessionNumber ?? 1) > 1 && RETURNING_COPY_STEPS.has(step);

  const title = tRuntime(
    isReturning ? `${i18nBase}.returningTitle` : `${i18nBase}.title`
  );

  const message = step === 'GOAL_VISION'
    ? getGoalVisionMessage(context, isReturning)
    : tRuntime(isReturning ? `${i18nBase}.returningMessage` : `${i18nBase}.message`);

  return {
    title,
    message,
    stepNumber: stepIndex + 1,
    totalSteps: TOTAL_STEPS,
  };
};

/**
 * Advance the tutorial to the next step.
 */
export const advanceTutorial = (state: TutorialState): TutorialState => {
  if (state.currentStep === 'COMPLETED') return state;

  const currentIndex = TUTORIAL_STEPS_ORDER.indexOf(state.currentStep);
  const nextStep = TUTORIAL_STEPS_ORDER[currentIndex + 1] || 'COMPLETED';

  return {
    currentStep: nextStep,
    completedSteps: [...state.completedSteps, state.currentStep],
    sessionNumber: state.sessionNumber,
  };
};

/**
 * Skip the entire tutorial.
 */
export const skipTutorial = (sessionNumber: number = 1): TutorialState => ({
  currentStep: 'COMPLETED',
  completedSteps: [...TUTORIAL_STEPS_ORDER.filter(s => s !== 'COMPLETED')],
  sessionNumber,
});

/**
 * Check if a specific step should trigger based on game state.
 */
export const shouldShowStep = (
  step: TutorialStep,
  gameContext: {
    phase: string;
    turn: number;
    selectedGoal?: LifeGoal | null;
    actionHistory: unknown[];
    eventChoiceHistory: unknown[];
    energy: number;
    maxEnergy: number;
    sessionNumber: number;
    fateTokens: number;
    momentumStreak: number;
    npcRoleChanged: boolean;
  }
): boolean => {
  switch (step) {
    case 'GOAL_VISION':
      return isTutorialHubPhase(gameContext.phase)
        && gameContext.turn === 1
        && gameContext.selectedGoal != null;

    case 'WELCOME_HUB':
      return isTutorialHubPhase(gameContext.phase) && gameContext.turn <= 1;

    case 'FIRST_ACTION':
      return isTutorialHubPhase(gameContext.phase) && gameContext.turn <= 2 && gameContext.actionHistory.length === 0;

    case 'STAT_CHANGE':
      return isTutorialHubPhase(gameContext.phase) && gameContext.actionHistory.length === 1;

    case 'FIRST_EVENT':
      return gameContext.phase === 'EVENT' && gameContext.eventChoiceHistory.length === 0;

    case 'ENERGY_EXPLAIN':
      return isTutorialHubPhase(gameContext.phase)
        && gameContext.turn <= 4
        && gameContext.energy < gameContext.maxEnergy * 0.7;

    case 'FATE_TOKEN_TUTORIAL':
      return gameContext.sessionNumber >= 1
        && gameContext.fateTokens >= 1
        && gameContext.turn <= 20;

    case 'PERSONALITY_MOMENTUM':
      return (gameContext.sessionNumber >= 2 && gameContext.momentumStreak >= 3)
        || (gameContext.sessionNumber >= 3 && gameContext.momentumStreak >= 1);

    case 'NPC_INTRODUCTION':
      return (gameContext.sessionNumber >= 2 && gameContext.npcRoleChanged)
        || gameContext.sessionNumber >= 3;

    case 'COMPLETED':
      return false;
  }
};

/**
 * Check if tutorial is complete.
 */
export const isTutorialComplete = (state: TutorialState): boolean =>
  state.currentStep === 'COMPLETED';
