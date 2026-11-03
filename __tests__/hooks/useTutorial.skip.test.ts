import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useTutorial } from '../../src/hooks/useTutorial';
import { skipTutorial } from '../../src/systems/OnboardingTutorial';

jest.mock('../../src/utils/analyticsEvents', () => ({
  logTutorialStepAdvanced: jest.fn(),
  logTutorialSkipped: jest.fn(),
  logTutorialTooltipShown: jest.fn(),
}));

const TUTORIAL_KEY = '@yazgi/tutorial_v2';

// Yeni koşunun ilk turu: tamamlanmış tur burada kendini sıfırlar
const freshRunContext = {
  phase: 'HUB',
  turn: 1,
  selectedGoal: null,
  actionHistory: [],
  eventChoiceHistory: [],
  energy: 90,
  maxEnergy: 90,
  fateTokens: 0,
  momentumStreak: 0,
  npcs: [],
};

const storedState = async () => JSON.parse((await AsyncStorage.getItem(TUTORIAL_KEY)) as string);

describe('useTutorial player skip', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('restarts a completed tour on a fresh run when the player did not skip it', async () => {
    await AsyncStorage.setItem(TUTORIAL_KEY, JSON.stringify(skipTutorial(2)));

    const { result } = renderHook(() => useTutorial(freshRunContext, true));

    await waitFor(() => expect(result.current.currentStep).toBe('GOAL_VISION'));
  });

  it('keeps the tour off on a fresh run after the player skipped it', async () => {
    await AsyncStorage.setItem(TUTORIAL_KEY, JSON.stringify({ ...skipTutorial(2), skippedByPlayer: true }));

    const { result } = renderHook(() => useTutorial(freshRunContext, true));

    await waitFor(async () => expect((await storedState()).sessionNumber).toBe(1));
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.currentStep).toBe('COMPLETED');
    expect(result.current.visible).toBe(false);
    expect(await storedState()).toMatchObject({ currentStep: 'COMPLETED', skippedByPlayer: true });
  });

  it('remembers a skip from the tooltip', async () => {
    const { result } = renderHook(() => useTutorial(freshRunContext, true));
    await waitFor(() => expect(result.current.currentStep).toBe('GOAL_VISION'));

    act(() => {
      result.current.skip();
    });

    expect(result.current.currentStep).toBe('COMPLETED');
    await waitFor(async () => expect(await storedState()).toMatchObject({
      currentStep: 'COMPLETED',
      skippedByPlayer: true,
    }));
  });
});
