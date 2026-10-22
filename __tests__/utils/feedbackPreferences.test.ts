import * as ExpoHaptics from 'expo-haptics';
import { Platform } from 'react-native';
import { Haptics } from '../../src/utils/haptics';
import {
  isHapticsPreferred,
  isReduceMotionPreferred,
  setFeedbackPreferences,
} from '../../src/utils/feedbackPreferences';

describe('feedbackPreferences', () => {
  const originalOS = Platform.OS;

  beforeEach(() => {
    (Platform as { OS: string }).OS = 'android';
    jest.clearAllMocks();
    setFeedbackPreferences({ reduceMotion: false, hapticsEnabled: true });
  });

  afterAll(() => {
    (Platform as { OS: string }).OS = originalOS;
    setFeedbackPreferences({ reduceMotion: false, hapticsEnabled: true });
  });

  it('defaults to haptics on and motion not reduced', () => {
    expect(isHapticsPreferred()).toBe(true);
    expect(isReduceMotionPreferred()).toBe(false);
  });

  it('updates only the preferences that are passed', () => {
    setFeedbackPreferences({ reduceMotion: true });
    expect(isReduceMotionPreferred()).toBe(true);
    expect(isHapticsPreferred()).toBe(true);
  });

  it('blocks every haptic call when the player turns vibration off in settings', async () => {
    await Haptics.impactAsync('heavy' as ExpoHaptics.ImpactFeedbackStyle);
    expect(ExpoHaptics.impactAsync).toHaveBeenCalledTimes(1);

    setFeedbackPreferences({ hapticsEnabled: false });
    await Haptics.impactAsync('heavy' as ExpoHaptics.ImpactFeedbackStyle);
    await Haptics.notificationAsync('success' as ExpoHaptics.NotificationFeedbackType);
    await Haptics.selectionAsync();

    expect(ExpoHaptics.impactAsync).toHaveBeenCalledTimes(1);
    expect(ExpoHaptics.notificationAsync).not.toHaveBeenCalled();
    expect(ExpoHaptics.selectionAsync).not.toHaveBeenCalled();
  });
});
