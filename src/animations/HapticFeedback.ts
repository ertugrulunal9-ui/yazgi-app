/**
 * Haptic Feedback & Audio Wrapper
 * Mobil uyumlu dokunsal geri bildirim ve ses sistemi
 */

import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { audioManager } from '../audio/AudioManager';

export type HapticType = 
  | 'light'      // Hafif dokunsal geri bildirim
  | 'medium'     // Orta seviye
  | 'heavy'       // Güçlü geri bildirim
  | 'success'    // Başarı bildirimi
  | 'warning'    // Uyarı bildirimi
  | 'error'      // Hata bildirimi
  | 'selection'; // Seçim bildirimi

/**
 * Haptic feedback tetikleyici
 * @param type Haptic geri bildirim tipi
 */
export const triggerHaptic = async (type: HapticType): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        await audioManager.playSFX('button_click');
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await audioManager.playSFX('stat_gain');
        break;
      case 'warning':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        await audioManager.playSFX('notification');
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        await audioManager.playSFX('stat_loss');
        break;
      case 'selection':
        await Haptics.selectionAsync();
        await audioManager.playSFX('button_hover');
        break;
    }
  } catch (error) {
    console.warn('Haptic feedback hatası:', error);
    // Haptic desteklenmeyen cihazlarda sessizce geç
  }
};

/**
 * Butona basınca hafif haptic + ses
 */
export const buttonPress = () => triggerHaptic('light');

/**
 * Başarılı işlem sonrası haptic + ses
 */
export const successHaptic = () => triggerHaptic('success');

/**
 * Hata sonrası haptic + ses
 */
export const errorHaptic = () => triggerHaptic('error');

/**
 * Seçim yapıldığında haptic + ses
 */
export const selectionHaptic = () => triggerHaptic('selection');

/**
 * Önemli karar için haptic + ses
 */
export const importantDecision = () => triggerHaptic('heavy');

/**
 * Para kazanma sesi
 */
export const moneyGain = () => audioManager.playSFX('money_gain');

/**
 * Para kaybetme sesi
 */
export const moneyLoss = () => audioManager.playSFX('money_loss');

/**
 * Başarım açma sesi
 */
export const achievementUnlock = () => {
  triggerHaptic('success');
  audioManager.playSFX('achievement_unlock');
};

/**
 * Seviye atlama sesi
 */
export const levelUp = () => {
  triggerHaptic('success');
  audioManager.playSFX('level_up');
};

/**
 * Tur atlama sesi
 */
export const turnAdvance = () => audioManager.playSFX('turn_advance');

/**
 * Olay başlangıç sesi
 */
export const eventStart = () => audioManager.playSFX('event_start');

/**
 * İyi not sesi
 */
export const gradeGood = () => audioManager.playSFX('grade_good');

/**
 * Kötü not sesi
 */
export const gradeBad = () => audioManager.playSFX('grade_bad');

/**
 * Kritik sağlık uyarısı
 */
export const healthCritical = () => {
  triggerHaptic('warning');
  audioManager.playSFX('health_critical');
};
