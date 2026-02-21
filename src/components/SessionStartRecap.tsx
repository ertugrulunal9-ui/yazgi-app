import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { getThemeTokens } from '../utils/themeUtils';
import { MetaProgression } from '../types';

interface SessionStartRecapProps {
  visible: boolean;
  onContinue: () => void;
  pendingCliffhanger?: {
    type: string;
    title: string;
    description: string;
  };
  playerName: string;
  age: number;
  metaProgression?: MetaProgression;
  theme?: ReturnType<typeof getThemeTokens>;
  cohortLabel?: string;
  cohortMessage?: string;
}

export const SessionStartRecap: React.FC<SessionStartRecapProps> = ({
  visible,
  onContinue,
  pendingCliffhanger,
  playerName,
  age,
  metaProgression,
  theme: themeOverride,
  cohortLabel,
  cohortMessage,
}) => {
  const theme = themeOverride || getThemeTokens('dark');

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
          <Text style={[styles.greeting, { color: theme.textPrimary }]}>
            Hos Geldin, {playerName}!
          </Text>

          <Text style={[styles.ageInfo, { color: theme.textSecondary }]}>
            {age} yasinda kaldin.
          </Text>

          {cohortLabel && (
            <View style={[styles.metaBox, { borderColor: theme.border, backgroundColor: theme.surfaceBase }]}>
              <Text style={[styles.metaTitle, { color: theme.textPrimary }]}>{cohortLabel}</Text>
              {cohortMessage && (
                <Text style={[styles.metaLine, { color: theme.textSecondary }]}>{cohortMessage}</Text>
              )}
            </View>
          )}

          {metaProgression && metaProgression.totalRunsCompleted > 0 && (
            <View style={[styles.metaBox, { borderColor: theme.border, backgroundColor: theme.surfaceBase }]}>
              <Text style={[styles.metaTitle, { color: theme.textPrimary }]}>
                Legacy Ozeti
              </Text>
              <Text style={[styles.metaLine, { color: theme.textSecondary }]}>
                Toplam kosu: {metaProgression.totalRunsCompleted} | Seviye: {metaProgression.legacyLevel}
              </Text>
              <Text style={[styles.metaLine, { color: theme.textSecondary }]}>
                Legacy puani: {metaProgression.totalLegacyPoints}
              </Text>
              {metaProgression.recentRuns[0] && (
                <Text style={[styles.metaLine, { color: theme.textSecondary }]}>
                  Son sonuc: {metaProgression.recentRuns[0].endingTitle}
                </Text>
              )}
            </View>
          )}

          {pendingCliffhanger && (
            <View style={[styles.recapBox, { backgroundColor: `${theme.accentEvent}15`, borderColor: theme.accentEvent }]}>
              <Text style={[styles.recapLabel, { color: theme.accentEvent }]}>
                Kaldigin Yer:
              </Text>
              <Text style={[styles.recapTitle, { color: theme.textPrimary }]}>
                {pendingCliffhanger.title}
              </Text>
              <Text style={[styles.recapDesc, { color: theme.textSecondary }]}>
                {pendingCliffhanger.description}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.accentEvent }]}
            onPress={onContinue}
            accessibilityRole="button"
            accessibilityLabel="Devam et"
          >
            <Text style={styles.buttonText}>Devam Et</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
    textAlign: 'center',
  },
  ageInfo: {
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  recapBox: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  metaBox: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  metaTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  metaLine: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 2,
  },
  recapLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  recapTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  recapDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
