import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LifeGoal } from '../types';
import {
  TutorialStep,
  TutorialState,
  TutorialContent,
  INITIAL_TUTORIAL_STATE,
  TUTORIAL_STEPS_ORDER,
  advanceTutorial,
  skipTutorial,
  getTutorialContent,
  shouldShowStep,
  isTutorialComplete,
} from '../systems/OnboardingTutorial';
import {
  logTutorialTooltipShown,
  logTutorialStepAdvanced,
  logTutorialSkipped,
} from '../utils/analyticsEvents';
import { normalizeSessionCount } from '../utils/onboardingGuidance';

const TUTORIAL_KEY = '@yazgi/tutorial_v2';
const SESSION_COUNT_KEY = '@yazgi/session_count';

// Legacy keys - if these exist, tutorial is already done
const LEGACY_KEYS = [
  '@yazgi/hub_tutorial_shown',
  '@yazgi/event_tooltip_shown',
  '@yazgi/energy_tutorial_shown',
];

interface TutorialGameContext {
  phase: string;
  turn: number;
  selectedGoal?: LifeGoal | null;
  actionHistory: unknown[];
  eventChoiceHistory: unknown[];
  energy: number;
  maxEnergy: number;
  fateTokens: number;
  momentumStreak: number;
  npcs: { id: string; role: string }[];
}

const isTutorialStep = (value: unknown): value is TutorialStep =>
  typeof value === 'string'
  && (TUTORIAL_STEPS_ORDER as string[]).includes(value);

const parseSessionCountFromStorage = (raw: string | null): number => {
  if (!raw) return 0;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return 0;
  return normalizeSessionCount(parsed);
};

const parseTutorialState = (raw: string | null, sessionNumber: number): TutorialState | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<TutorialState> | null;
    if (!parsed || !isTutorialStep(parsed.currentStep)) {
      return null;
    }

    const completedSteps = Array.isArray(parsed.completedSteps)
      ? parsed.completedSteps.filter(isTutorialStep)
      : [];

    return {
      currentStep: parsed.currentStep,
      completedSteps,
      sessionNumber: normalizeSessionCount(parsed.sessionNumber) || sessionNumber,
    };
  } catch {
    return null;
  }
};

const shouldForceAdvanceStep = (
  step: TutorialStep,
  gameContext: TutorialGameContext & { sessionNumber: number; npcRoleChanged: boolean }
): boolean => {
  switch (step) {
    case 'GOAL_VISION':
      return gameContext.turn > 1;
    case 'WELCOME_HUB':
      return gameContext.turn > 1;
    case 'FIRST_ACTION':
      return gameContext.actionHistory.length > 0 || gameContext.turn > 2;
    case 'STAT_CHANGE':
      return gameContext.actionHistory.length > 1;
    case 'FIRST_EVENT':
      return gameContext.eventChoiceHistory.length > 0;
    case 'ENERGY_EXPLAIN':
      return gameContext.turn > 4;
    case 'FATE_TOKEN_TUTORIAL':
      return gameContext.turn > 20;
    case 'PERSONALITY_MOMENTUM':
      return gameContext.sessionNumber >= 4;
    case 'NPC_INTRODUCTION':
      return gameContext.sessionNumber >= 4;
    case 'COMPLETED':
      return false;
  }
};

const isFreshRunContext = (gameContext: TutorialGameContext): boolean => (
  (gameContext.phase === 'HUB' || gameContext.phase === 'SETUP')
  && gameContext.turn === 1
  && gameContext.actionHistory.length === 0
  && gameContext.eventChoiceHistory.length === 0
);

interface UseTutorialReturn {
  /** Current step content (null if completed or not ready to show) */
  content: TutorialContent | null;
  /** Whether the tutorial tooltip should be visible */
  visible: boolean;
  /** Dismiss current step and advance */
  advance: () => void;
  /** Skip the entire tutorial */
  skip: () => void;
  /** Whether tutorial is fully complete */
  isComplete: boolean;
  /** Current step ID for conditional UI (e.g., highlight) */
  currentStep: TutorialState['currentStep'];
}

export const useTutorial = (
  gameContext: TutorialGameContext,
  enabled: boolean
): UseTutorialReturn => {
  const [state, setState] = useState<TutorialState | null>(null);
  const [visible, setVisible] = useState(false);
  const [npcRoleChanged, setNpcRoleChanged] = useState(false);
  const loadedRef = useRef(false);
  const showLockRef = useRef(false);
  const prevNpcRolesRef = useRef<Map<string, string>>(new Map());

  // Track NPC role transitions for progressive tutorial gating.
  useEffect(() => {
    const currentRoles = new Map(gameContext.npcs.map(npc => [npc.id, npc.role]));

    if (prevNpcRolesRef.current.size > 0) {
      const hasRoleChange = gameContext.npcs.some(npc => {
        const previousRole = prevNpcRolesRef.current.get(npc.id);
        return previousRole != null && previousRole !== npc.role;
      });

      if (hasRoleChange) {
        setNpcRoleChanged(true);
      }
    }

    prevNpcRolesRef.current = currentRoles;
  }, [gameContext.npcs]);

  const gateContext = useMemo(() => ({
    ...gameContext,
    sessionNumber: state?.sessionNumber ?? 1,
    npcRoleChanged,
  }), [gameContext, npcRoleChanged, state?.sessionNumber]);

  // Load tutorial state on mount.
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const load = async () => {
      try {
        const [rawSessionCount, rawTutorialState] = await Promise.all([
          AsyncStorage.getItem(SESSION_COUNT_KEY),
          AsyncStorage.getItem(TUTORIAL_KEY),
        ]);

        const previousSessionCount = parseSessionCountFromStorage(rawSessionCount);
        const sessionNumber = previousSessionCount + 1;
        await AsyncStorage.setItem(SESSION_COUNT_KEY, sessionNumber.toString());

        // Prefer the current key.
        const parsedState = parseTutorialState(rawTutorialState, sessionNumber);
        if (parsedState) {
          setState({ ...parsedState, sessionNumber });
          return;
        }

        // Legacy migration: only treat as completed when all legacy tutorial keys are true.
        const legacyResults = await Promise.all(
          LEGACY_KEYS.map(key => AsyncStorage.getItem(key))
        );
        const hasLegacyCompleted = legacyResults.every(value => value === 'true');

        if (hasLegacyCompleted) {
          const completedState = skipTutorial(sessionNumber);
          setState(completedState);
          await AsyncStorage.setItem(TUTORIAL_KEY, JSON.stringify(completedState));
          return;
        }

        const initialState: TutorialState = {
          ...INITIAL_TUTORIAL_STATE,
          sessionNumber,
        };
        setState(initialState);
      } catch {
        setState(INITIAL_TUTORIAL_STATE);
      }
    };

    void load();
  }, []);

  // Save state changes.
  useEffect(() => {
    if (!state) return;
    void AsyncStorage.setItem(TUTORIAL_KEY, JSON.stringify(state));
  }, [state]);

  // Check if current step should show.
  useEffect(() => {
    if (!state || !enabled || isTutorialComplete(state)) {
      setVisible(false);
      return;
    }
    if (showLockRef.current) return;

    const shouldShow = shouldShowStep(state.currentStep, gateContext);
    if (shouldShow && !visible) {
      showLockRef.current = true;
      setVisible(true);
      void logTutorialTooltipShown(state.currentStep);
    }
  }, [state, enabled, visible, gateContext]);

  // If a step window is permanently missed, auto-advance to prevent lock-ups.
  useEffect(() => {
    if (!state || !enabled || isTutorialComplete(state)) return;
    if (!shouldForceAdvanceStep(state.currentStep, gateContext)) return;

    showLockRef.current = false;
    setVisible(false);
    setState(prev => prev ? advanceTutorial(prev) : prev);
  }, [state, enabled, gateContext]);

  // Self-heal stale completion flags when a fresh run starts.
  useEffect(() => {
    if (!state || !enabled) return;
    if (state.currentStep !== 'COMPLETED') return;
    if (!isFreshRunContext(gameContext)) return;

    showLockRef.current = false;
    setVisible(false);
    setNpcRoleChanged(false);
    setState(prev => prev
      ? { ...INITIAL_TUTORIAL_STATE, sessionNumber: prev.sessionNumber }
      : INITIAL_TUTORIAL_STATE);
  }, [state, enabled, gameContext]);

  const advance = useCallback(() => {
    if (!state) return;
    showLockRef.current = false;
    setVisible(false);

    const stepNumber = TUTORIAL_STEPS_ORDER.indexOf(state.currentStep) + 1;
    void logTutorialStepAdvanced(state.currentStep, stepNumber);

    setState(prev => prev ? advanceTutorial(prev) : prev);
  }, [state]);

  const skip = useCallback(() => {
    if (state) {
      const stepNumber = TUTORIAL_STEPS_ORDER.indexOf(state.currentStep) + 1;
      void logTutorialSkipped(state.currentStep, stepNumber);
    }
    showLockRef.current = false;
    setVisible(false);
    const completed = skipTutorial(state?.sessionNumber ?? 1);
    setState(completed);
  }, [state]);

  const currentStep = state?.currentStep ?? 'COMPLETED';
  const isComplete = !state || isTutorialComplete(state);
  const content = visible && state
    ? getTutorialContent(state.currentStep, {
        selectedGoal: gameContext.selectedGoal ?? null,
        sessionNumber: state.sessionNumber,
      })
    : null;

  return { content, visible, advance, skip, isComplete, currentStep };
};
