/**
 * ReminderOffer — Bebeklik bölüm penceresindeki tek seferlik hatırlatma teklifi.
 *
 * İlk koşuyu yarıda bırakan oyuncu, izin yalnızca oyun sonunda istendiği için hiç geri
 * çağrılmıyordu. İşletim sisteminin izin penceresi yalnızca oyuncu düğmeye basınca açılır;
 * teklif kurulum başına bir kez görülür, oyun sonundaki "Hatırlat" düğmesi yedek olarak kalır.
 */

import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Typography } from './ui/Typography';
import { useUI } from '../context/UIContext';
import {
  isReminderOfferEligible,
  markReminderOfferShown,
  requestPermissions,
  scheduleReengagement,
} from '../services/notificationService';
import { logReminderOffer } from '../utils/analyticsEvents';

type OfferState = 'checking' | 'hidden' | 'idle' | 'requesting' | 'enabled' | 'unavailable';

export const ReminderOffer: React.FC = () => {
  const { theme, t } = useUI();
  const [state, setState] = useState<OfferState>('checking');
  const shownRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void isReminderOfferEligible().then(eligible => {
      if (cancelled) return;
      if (!eligible) {
        setState('hidden');
        return;
      }
      shownRef.current = true;
      setState('idle');
      void logReminderOffer('shown');
    });
    return () => {
      cancelled = true;
      // Yalnızca oyuncunun gerçekten gördüğü teklif harcanır (StrictMode'un deneme sökümü sayılmaz)
      if (shownRef.current) void markReminderOfferShown();
    };
  }, []);

  const handleEnable = async () => {
    if (state !== 'idle') return;
    setState('requesting');

    const granted = await requestPermissions();
    if (!granted) {
      setState('unavailable');
      void logReminderOffer('unavailable');
      return;
    }

    await scheduleReengagement(24);
    setState('enabled');
    void logReminderOffer('enabled');
  };

  if (state === 'checking' || state === 'hidden') return null;

  return (
    <View
      testID="reminder-offer"
      style={[styles.container, { borderColor: theme.border, backgroundColor: theme.surfaceOverlay }]}
    >
      <Typography variant="body" style={[styles.prompt, { color: theme.textPrimary }]}>
        {t('chapter.reminderPrompt')}
      </Typography>

      {state === 'idle' || state === 'requesting' ? (
        <TouchableOpacity
          onPress={handleEnable}
          disabled={state === 'requesting'}
          accessibilityRole="button"
          accessibilityLabel={t('chapter.reminderButton')}
          style={[
            styles.button,
            { borderColor: theme.accentBrand, opacity: state === 'requesting' ? 0.7 : 1 },
          ]}
        >
          <Typography variant="label" style={{ color: theme.accentBrand }}>
            {state === 'requesting' ? t('buttons.enablingReminder') : t('chapter.reminderButton')}
          </Typography>
        </TouchableOpacity>
      ) : (
        <Typography variant="caption" tone="secondary" style={styles.result}>
          {state === 'enabled' ? t('buttons.reminderEnabled') : t('buttons.reminderUnavailable')}
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    gap: 8,
  },
  prompt: {
    textAlign: 'center',
  },
  button: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 9,
    alignItems: 'center',
  },
  result: {
    textAlign: 'center',
  },
});
