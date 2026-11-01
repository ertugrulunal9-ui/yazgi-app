import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

/**
 * İlk açılış gizlilik tercihleri kartı bir kez gösterilir.
 * Bayrak ayrı tutulur; tercihlerin kendisi `uiPrefs` içinde yaşar.
 */
export const PRIVACY_CHOICES_KEY = '@yazgi/privacy_choices/v1';

export interface PrivacyChoices {
  personalizedAds: boolean;
  analytics: boolean;
}

interface PrivacyChoicesGate {
  /** Bayrak okunurken true (açılış ekranı bu sürede kalır). */
  checkingPrivacyChoices: boolean;
  /** Kart henüz hiç kaydedilmediyse true. */
  privacyChoicesPending: boolean;
  /** Kart kaydedildi: bayrağı yazar ve kartı kapatır. */
  markPrivacyChoicesSeen: (choices: PrivacyChoices) => void;
}

export const usePrivacyChoicesGate = (): PrivacyChoicesGate => {
  const [checkingPrivacyChoices, setCheckingPrivacyChoices] = useState(true);
  const [privacyChoicesPending, setPrivacyChoicesPending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkPrivacyChoices = async () => {
      let seen = false;
      try {
        seen = (await AsyncStorage.getItem(PRIVACY_CHOICES_KEY)) !== null;
      } catch {
        // Okunamazsa kartı yeniden göster; tercihler varsayılan kapalı kalır.
        seen = false;
      }
      if (cancelled) return;
      setPrivacyChoicesPending(!seen);
      setCheckingPrivacyChoices(false);
    };

    void checkPrivacyChoices();
    return () => {
      cancelled = true;
    };
  }, []);

  const markPrivacyChoicesSeen = useCallback((choices: PrivacyChoices) => {
    setPrivacyChoicesPending(false);
    void AsyncStorage.setItem(
      PRIVACY_CHOICES_KEY,
      JSON.stringify({
        personalizedAds: choices.personalizedAds,
        analytics: choices.analytics,
        decidedAt: new Date().toISOString(),
      })
    ).catch(() => {
      // Yazılamazsa kart bir sonraki açılışta yeniden çıkar; zararsız.
    });
  }, []);

  return { checkingPrivacyChoices, privacyChoicesPending, markPrivacyChoicesSeen };
};
