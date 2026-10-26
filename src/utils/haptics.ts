import * as ExpoHaptics from 'expo-haptics';
import { Platform } from 'react-native';
import { HAPTICS_ENABLED } from '../constants/featureFlags';
import { isHapticsPreferred } from './feedbackPreferences';

type ImpactFeedbackStyle = ExpoHaptics.ImpactFeedbackStyle;
type NotificationFeedbackType = ExpoHaptics.NotificationFeedbackType;

// Ayarlar'daki "Titreşim" kapalıysa hiçbir titreşim çalışmaz
const canUseHaptics = (): boolean => HAPTICS_ENABLED && isHapticsPreferred() && Platform.OS !== 'web';

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
