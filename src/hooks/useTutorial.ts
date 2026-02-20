import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  TutorialState,
  TutorialContent,
  INITIAL_TUTORIAL_STATE,
  advanceTutorial,
  skipTutorial,
  getTutorialContent,
  shouldShowStep,
  isTutorialComplete,
} from '../systems/OnboardingTutorial';

const TUTORIAL_KEY = '@yazgi/tutorial_v2';

// Legacy keys — if these exist, tutorial is already done
const LEGACY_KEYS = [
  '@yazgi/hub_tutorial_shown',
  '@yazgi/event_tooltip_shown',
  '@yazgi/energy_tutorial_shown',
];

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
  gameContext: {
    phase: string;
    turn: number;
    actionHistory: unknown[];
    eventChoiceHistory: unknown[];
    energy: number;
    maxEnergy: number;
  },
  enabled: boolean
): UseTutorialReturn => {
  const [state, setState] = useState<TutorialState | null>(null);
  const [visible, setVisible] = useState(false);
  const loadedRef = useRef(false);
  const showLockRef = useRef(false);

  // Load tutorial state on mount
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const load = async () => {
      try {
        // Check legacy keys first
        const legacyResults = await Promise.all(
          LEGACY_KEYS.map(k => AsyncStorage.getItem(k))
        );
        const hasLegacy = legacyResults.some(v => v === 'true');

        if (hasLegacy) {
          const completedState = skipTutorial();
          setState(completedState);
          await AsyncStorage.setItem(TUTORIAL_KEY, JSON.stringify(completedState));
          return;
        }

        // Check new key
        const raw = await AsyncStorage.getItem(TUTORIAL_KEY);
        if (raw) {
          setState(JSON.parse(raw));
        } else {
          setState(INITIAL_TUTORIAL_STATE);
        }
      } catch {
        setState(INITIAL_TUTORIAL_STATE);
      }
    };

    void load();
  }, []);

  // Save state changes
  useEffect(() => {
    if (!state) return;
    void AsyncStorage.setItem(TUTORIAL_KEY, JSON.stringify(state));
  }, [state]);

  // Check if current step should show
  useEffect(() => {
    if (!state || !enabled || isTutorialComplete(state)) {
      setVisible(false);
      return;
    }
    if (showLockRef.current) return;

    const shouldShow = shouldShowStep(state.currentStep, gameContext);
    if (shouldShow && !visible) {
      showLockRef.current = true;
      setVisible(true);
    }
  }, [state, enabled, visible, gameContext]);

  const advance = useCallback(() => {
    if (!state) return;
    showLockRef.current = false;
    setVisible(false);
    setState(prev => prev ? advanceTutorial(prev) : prev);

    // Write legacy keys for backward compat
    const step = state.currentStep;
    if (step === 'WELCOME_HUB' || step === 'FIRST_ACTION') {
      void AsyncStorage.setItem('@yazgi/hub_tutorial_shown', 'true');
    } else if (step === 'FIRST_EVENT') {
      void AsyncStorage.setItem('@yazgi/event_tooltip_shown', 'true');
    } else if (step === 'ENERGY_EXPLAIN') {
      void AsyncStorage.setItem('@yazgi/energy_tutorial_shown', 'true');
    }
  }, [state]);

  const skip = useCallback(() => {
    showLockRef.current = false;
    setVisible(false);
    const completed = skipTutorial();
    setState(completed);

    // Write all legacy keys
    void Promise.all(
      LEGACY_KEYS.map(k => AsyncStorage.setItem(k, 'true'))
    );
  }, []);

  const currentStep = state?.currentStep ?? 'COMPLETED';
  const isComplete = !state || isTutorialComplete(state);
  const content = visible && state ? getTutorialContent(state.currentStep) : null;

  return { content, visible, advance, skip, isComplete, currentStep };
};
