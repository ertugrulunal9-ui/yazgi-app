/**
 * Haptic feedback and audio wrappers.
 * On web, haptics are skipped but SFX playback stays active.
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { devLog } from '../utils/devLogger';
import { audioManager } from '../audio/AudioManager';

export type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

/**
 * Trigger haptic feedback and matching SFX.
 */
export const triggerHaptic = async (type: HapticType): Promise<void> => {
  const isWeb = Platform.OS === 'web';

  try {
    switch (type) {
      case 'light':
        if (!isWeb) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        await audioManager.playSFX('button_click');
        break;
      case 'medium':
        if (!isWeb) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        break;
      case 'heavy':
        if (!isWeb) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        }
        break;
      case 'success':
        if (!isWeb) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        await audioManager.playSFX('stat_gain');
        break;
      case 'warning':
        if (!isWeb) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        await audioManager.playSFX('notification');
        break;
      case 'error':
        if (!isWeb) {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
        await audioManager.playSFX('stat_loss');
        break;
      case 'selection':
        if (!isWeb) {
          await Haptics.selectionAsync();
        }
        await audioManager.playSFX('button_hover');
        break;
      default:
        break;
    }
  } catch (error) {
    devLog.warn('Haptic feedback failed:', error);
  }
};

/** Light haptic + click SFX. */
export const buttonPress = () => triggerHaptic('light');

/** Success haptic + gain SFX. */
export const successHaptic = () => triggerHaptic('success');

/** Error haptic + loss SFX. */
export const errorHaptic = () => triggerHaptic('error');

/** Selection haptic + hover SFX. */
export const selectionHaptic = () => triggerHaptic('selection');

/** Important decision haptic. */
export const importantDecision = () => triggerHaptic('heavy');

/** Money gain SFX. */
export const moneyGain = () => audioManager.playSFX('money_gain');

/** Money loss SFX. */
export const moneyLoss = () => audioManager.playSFX('money_loss');

/** Achievement unlock haptic + SFX. */
export const achievementUnlock = () => {
  void triggerHaptic('success');
  void audioManager.playSFX('achievement_unlock');
};

/** Level up haptic + SFX. */
export const levelUp = () => {
  void triggerHaptic('success');
  void audioManager.playSFX('level_up');
};

/** Turn advance SFX. */
export const turnAdvance = () => audioManager.playSFX('turn_advance');

/** Event start SFX. */
export const eventStart = () => audioManager.playSFX('event_start');

/** Positive grade SFX. */
export const gradeGood = () => audioManager.playSFX('grade_good');

/** Negative grade SFX. */
export const gradeBad = () => audioManager.playSFX('grade_bad');

/** Critical health warning haptic + SFX. */
export const healthCritical = () => {
  void triggerHaptic('warning');
  void audioManager.playSFX('health_critical');
};

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

/** Trait gain pattern. */
export const traitGainHaptic = async (): Promise<void> => {
  try {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    await audioManager.playSFX('stat_gain');
  } catch (error) {
    devLog.warn('Haptic feedback failed:', error);
  }
};

/** Bad outcome pattern. */
export const badOutcomeHaptic = async (): Promise<void> => {
  try {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    await audioManager.playSFX('stat_loss');
  } catch (error) {
    devLog.warn('Haptic feedback failed:', error);
  }
};

/** Fate token pattern (haptics only). */
export const fateTokenHaptic = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await delay(100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await delay(100);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    devLog.warn('Haptic feedback failed:', error);
  }
};

/** Age transition pattern (haptics only). */
export const ageTransitionHaptic = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await delay(150);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    devLog.warn('Haptic feedback failed:', error);
  }
};

/** Milestone pattern (haptics only). */
export const milestoneHaptic = async (): Promise<void> => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await delay(150);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await delay(150);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await delay(50);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    await delay(50);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    devLog.warn('Haptic feedback failed:', error);
  }
};
