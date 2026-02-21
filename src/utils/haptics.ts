import * as ExpoHaptics from 'expo-haptics';
import { Platform } from 'react-native';
import { HAPTICS_ENABLED } from '../constants/featureFlags';

type ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle;
type NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType;

const canUseHaptics = (): boolean => HAPTICS_ENABLED && Platform.OS !== 'web';

export const Haptics = {
  ImpactFeedbackStyle: ExpoHaptics.ImpactFeedbackStyle,
  NotificationFeedbackType: ExpoHaptics.NotificationFeedbackType,
  impactAsync: async (style: ImpactFeedbackStyle): Promise<void> => {
    if (!canUseHaptics()) return;
    await ExpoHaptics.impactAsync(style);
  },
  notificationAsync: async (type: NotificationFeedbackType): Promise<void> => {
    if (!canUseHaptics()) return;
    await ExpoHaptics.notificationAsync(type);
  },
  selectionAsync: async (): Promise<void> => {
    if (!canUseHaptics()) return;
    await ExpoHaptics.selectionAsync();
  },
};
