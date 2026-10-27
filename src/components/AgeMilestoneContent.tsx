/**
 * AgeMilestoneContent — yaş özetinin gövdesi (değişimler, özellikler, anılar,
 * ilişkiler, akademik). Hem AgeMilestoneModal hem de bölüm penceresi
 * (ChapterTransitionModal) aynı içeriği buradan çizer.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Typography } from './ui/Typography';
import { useUI } from '../context/UIContext';
import type { AgeMilestoneSummary } from '../types/game';
import type { StatKey } from '../types/core';

interface Props {
  milestone: AgeMilestoneSummary;
}

const EMOTION_ICON: Record<string, string> = {
  PRIDE: '★',
  REGRET: '✦',
  GUILT: '◆',
  SATISFACTION: '●',
  NEUTRAL: '○',
};

export const AgeMilestoneContent: React.FC<Props> = ({ milestone }) => {
  const { theme, t } = useUI();

  const statEntries = Object.entries(milestone.statDeltas) as [StatKey, number][];

  return (
    <>
      {statEntries.length > 0 && (
        <View style={styles.section}>
          <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
            {t('milestone.statChanges')}
          </Typography>
          <View style={styles.statRow}>
            {statEntries.map(([key, val]) => (
              <View
                key={key}
                style={[
                  styles.statChip,
                  { backgroundColor: val > 0 ? '#1B5E2010' : '#B7191910' },
                ]}
              >
                <Typography
                  variant="caption"
                  style={{ color: val > 0 ? '#2E7D32' : '#C62828' }}
                >
                  {t(`labels.stats.${key}`, undefined, key)} {val > 0 ? '+' : ''}{val}
                </Typography>
              </View>
            ))}
          </View>
        </View>
      )}

      {milestone.traitsGained.length > 0 && (
        <View style={styles.section}>
          <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
            {t('milestone.traitsGained')}
          </Typography>
          {milestone.traitsGained.map(trait => (
            <Typography key={trait} variant="body" style={[styles.traitLine, { color: '#2E7D32' }]}>
              + {trait}
            </Typography>
          ))}
        </View>
      )}

      {milestone.traitsLost.length > 0 && (
        <View style={styles.section}>
          <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
            {t('milestone.traitsLost')}
          </Typography>
          {milestone.traitsLost.map(trait => (
            <Typography key={trait} variant="body" style={[styles.traitLine, { color: '#C62828' }]}>
              - {trait}
            </Typography>
          ))}
        </View>
      )}

      {milestone.keyMemories.length > 0 && (
        <View style={styles.section}>
          <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
            {t('milestone.keyMemories')}
          </Typography>
          {milestone.keyMemories.map((memory, index) => (
            <Typography key={index} variant="body" style={{ color: '#6A1B9A' }}>
              {EMOTION_ICON[memory.emotion] ?? '○'} {memory.summary}
            </Typography>
          ))}
        </View>
      )}

      {milestone.npcChanges.length > 0 && (
        <View style={styles.section}>
          <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
            {t('milestone.npcChanges')}
          </Typography>
          {milestone.npcChanges.map((npcChange, index) => (
            <Typography key={index} variant="body" style={{ color: theme.textSecondary }}>
              {npcChange.name}: {t(`labels.npcRoles.${npcChange.oldRole}`, undefined, npcChange.oldRole)} →
              {' '}
              {t(`labels.npcRoles.${npcChange.newRole}`, undefined, npcChange.newRole)}
            </Typography>
          ))}
        </View>
      )}

      {milestone.academicHighlight && (
        <View style={styles.section}>
          <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
            {t('milestone.academic')}
          </Typography>
          <Typography variant="body" style={{ color: '#E65100' }}>
            {milestone.academicHighlight}
          </Typography>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    marginBottom: 4,
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  traitLine: {
    marginLeft: 4,
  },
});
