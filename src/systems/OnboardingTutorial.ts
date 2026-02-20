/**
 * Onboarding Tutorial State Machine
 * Pure functions — no side effects, easily testable.
 */

import { LifeGoal } from '../types';
import { getLifeGoalMeta } from '../utils/lifeGoalSystem';

export type TutorialStep =
  | 'GOAL_VISION'
  | 'WELCOME_HUB'
  | 'FIRST_ACTION'
  | 'STAT_CHANGE'
  | 'FIRST_EVENT'
  | 'ENERGY_EXPLAIN'
  | 'COMPLETED';

export interface TutorialState {
  currentStep: TutorialStep;
  completedSteps: TutorialStep[];
}

export const INITIAL_TUTORIAL_STATE: TutorialState = {
  currentStep: 'GOAL_VISION',
  completedSteps: [],
};

export const TUTORIAL_STEPS_ORDER: TutorialStep[] = [
  'GOAL_VISION',
  'WELCOME_HUB',
  'FIRST_ACTION',
  'STAT_CHANGE',
  'FIRST_EVENT',
  'ENERGY_EXPLAIN',
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

const STEP_CONTENT: Record<Exclude<TutorialStep, 'COMPLETED'>, { title: string; message: string }> = {
  GOAL_VISION: {
    title: 'Hayalin',
    message: 'Bu hayatta {goalName} olmayi hedefliyorsun. Bunun icin {keyStats} gelistirmeni gerekiyor.',
  },
  WELCOME_HUB: {
    title: 'Hayatına Hoş Geldin!',
    message: 'Bu senin yaşam alanın. Aktiviteler seçerek gününü geçirebilirsin. Her aktivite statlarını etkiler.',
  },
  FIRST_ACTION: {
    title: 'İlk Aktiviteni Seç',
    message: 'Bir aktiviteye dokun! Ders çalışma zekanı, spor sağlığını, sosyal etkinlikler karizmayı artırır.',
  },
  STAT_CHANGE: {
    title: 'Statların Değişti!',
    message: 'Gördün mü? Seçimlerin karakterini şekillendiriyor. Dengelemeyi unutma — tek yöne aşırı gitmek riskli!',
  },
  FIRST_EVENT: {
    title: 'Bir Olay Gerçekleşti!',
    message: 'Hayatta rastgele olaylar olur. Seçimlerin karakterini ve geleceğini belirler. Dikkatli karar ver!',
  },
  ENERGY_EXPLAIN: {
    title: 'Enerji Sistemi',
    message: 'Her aktivite enerji harcar. Enerji bittiğinde günü bitirmen gerekir. Yeni gün = yeni enerji!',
  },
};

const TOTAL_STEPS = 6; // Excluding COMPLETED

interface TutorialContentContext {
  selectedGoal?: LifeGoal | null;
}

const getGoalVisionMessage = (context?: TutorialContentContext): string => {
  const goalMeta = getLifeGoalMeta(context?.selectedGoal ?? null);
  const goalName = goalMeta?.shortLabel ?? 'guclu bir rota';
  const keyStats = goalMeta?.statHint ?? 'temel statlarini';

  return `Bu hayatta ${goalName} olmayi hedefliyorsun. Bunun icin ${keyStats} gelistirmeni gerekiyor.`;
};

/**
 * Get the display content for the current tutorial step.
 */
export const getTutorialContent = (step: TutorialStep, context?: TutorialContentContext): TutorialContent | null => {
  if (step === 'COMPLETED') return null;

  const content = STEP_CONTENT[step];
  const stepIndex = TUTORIAL_STEPS_ORDER.indexOf(step);
  const message = step === 'GOAL_VISION'
    ? getGoalVisionMessage(context)
    : content.message;

  return {
    title: content.title,
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
  };
};

/**
 * Skip the entire tutorial.
 */
export const skipTutorial = (): TutorialState => ({
  currentStep: 'COMPLETED',
  completedSteps: [...TUTORIAL_STEPS_ORDER.filter(s => s !== 'COMPLETED')],
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
      return isTutorialHubPhase(gameContext.phase) &&
        gameContext.turn <= 4 &&
        gameContext.energy < gameContext.maxEnergy * 0.7;

    case 'COMPLETED':
      return false;
  }
};

/**
 * Check if tutorial is complete.
 */
export const isTutorialComplete = (state: TutorialState): boolean =>
  state.currentStep === 'COMPLETED';
