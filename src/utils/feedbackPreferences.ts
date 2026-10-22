/**
 * Kullanıcı tercihlerinin (Ayarlar) animasyon/titreşim yardımcılarına ulaştığı yer.
 * Bu yardımcılar React ağacı dışında da çağrıldığı için tercihler AppShell'den
 * buraya senkronlanır (setFeedbackPreferences).
 */
let reduceMotion = false;
let hapticsEnabled = true;

export const setFeedbackPreferences = (prefs: { reduceMotion?: boolean; hapticsEnabled?: boolean }): void => {
  if (typeof prefs.reduceMotion === 'boolean') reduceMotion = prefs.reduceMotion;
  if (typeof prefs.hapticsEnabled === 'boolean') hapticsEnabled = prefs.hapticsEnabled;
};

export const isReduceMotionPreferred = (): boolean => reduceMotion;

export const isHapticsPreferred = (): boolean => hapticsEnabled;
