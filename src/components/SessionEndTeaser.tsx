import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useUI } from '../context/UIContext';
import { getThemeTokens } from '../utils/themeUtils';
import { MetaProgression } from '../types';

interface SessionEndTeaserProps {
  visible: boolean;
  onClose: () => void;
  pendingCliffhanger?: {
    type: string;
    title: string;
    description: string;
  };
  momentumStreak?: number;
  traitNearUnlock?: string;
  metaProgression?: MetaProgression;
  theme?: ReturnType<typeof getThemeTokens>;
}

export const SessionEndTeaser: React.FC<SessionEndTeaserProps> = ({
  visible,
  onClose,
  pendingCliffhanger,
  momentumStreak,
  traitNearUnlock,
  metaProgression,
  theme: themeOverride,
}) => {
  const { theme: runtimeTheme, t } = useUI();
  const theme = themeOverride || runtimeTheme || getThemeTokens('dark');
  const nextLevelTarget = metaProgression ? (metaProgression.legacyLevel + 1) * 80 : 0;
  const legacyToNext = metaProgression ? Math.max(0, nextLevelTarget - metaProgression.totalLegacyPoints) : 0;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay]}>
        <View style={[styles.card, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {t('sessionEnd.title')}
          </Text>

          {pendingCliffhanger && (
            <View style={styles.section}>
              <Text style={[styles.cliffTitle, { color: theme.accentEvent }]}>
                {pendingCliffhanger.title}
              </Text>
              <Text style={[styles.cliffDesc, { color: theme.textSecondary }]}>
                {pendingCliffhanger.description}
              </Text>
            </View>
          )}

          {momentumStreak != null && momentumStreak >= 3 && (
            <View style={styles.section}>
              <Text style={[styles.streakText, { color: theme.accentGrade }]}>
                {t('sessionEnd.streakActive', { count: momentumStreak })}
              </Text>
            </View>
          )}

          {traitNearUnlock && (
            <View style={styles.section}>
              <Text style={[styles.traitText, { color: theme.textSecondary }]}>
                {t('sessionEnd.traitNearUnlock', { trait: traitNearUnlock })}
              </Text>
            </View>
          )}

          {metaProgression && (
            <View style={styles.section}>
              <Text style={[styles.streakText, { color: theme.textPrimary }]}>
                {t('sessionEnd.legacyProgress', {
                  level: metaProgression.legacyLevel,
                  points: metaProgression.totalLegacyPoints,
                })}
              </Text>
              {legacyToNext > 0 && (
                <Text style={[styles.traitText, { color: theme.textSecondary }]}>
                  {t('sessionEnd.nextLevel', { points: legacyToNext })}
                </Text>
              )}
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.accentEvent }]}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t('sessionEnd.closeAria')}
          >
            <Text style={styles.buttonText}>{t('sessionEnd.cta')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
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
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
  },
  section: {
    marginBottom: 12,
    width: '100%',
    alignItems: 'center',
  },
  cliffTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  cliffDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  traitText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  button: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
