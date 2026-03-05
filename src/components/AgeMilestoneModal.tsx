/**
 * AgeMilestoneModal — Yaş geçişi özet modalı (Paket 4)
 *
 * Oyuncuya son yaşta neler olduğunu özetler:
 * kazanımlar, kayıplar, anılar, ilişki değişimleri, akademik öne çıkanlar.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Modal } from './ui/Modal';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { useUI } from '../context/UIContext';
import type { AgeMilestoneSummary } from '../types/game';
import type { StatKey } from '../types/core';

interface Props {
  visible: boolean;
  milestone: AgeMilestoneSummary | null;
  onClose: () => void;
}

const STAT_LABEL: Record<string, string> = {
  health: 'Sağlık',
  intelligence: 'Zeka',
  charisma: 'Karizma',
  discipline: 'Disiplin',
  familyRelation: 'Aile',
};

const EMOTION_ICON: Record<string, string> = {
  PRIDE: '★',
  REGRET: '✦',
  GUILT: '◆',
  SATISFACTION: '●',
  NEUTRAL: '○',
};

export const AgeMilestoneModal: React.FC<Props> = ({ visible, milestone, onClose }) => {
  const { theme } = useUI();

  if (!milestone) return null;

  const statEntries = Object.entries(milestone.statDeltas) as [StatKey, number][];
  const hasContent =
    milestone.traitsGained.length > 0 ||
    milestone.traitsLost.length > 0 ||
    milestone.keyMemories.length > 0 ||
    statEntries.length > 0 ||
    milestone.npcChanges.length > 0 ||
    milestone.academicHighlight;

  return (
    <Modal
      visible={visible}
      title={`Yaş ${milestone.age} Özeti`}
      onClose={onClose}
      footer={<Button variant="primary" onPress={onClose}>Devam Et</Button>}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {!hasContent && (
          <Typography variant="body" tone="secondary" style={styles.emptyText}>
            Bu yaş sakin geçti.
          </Typography>
        )}

        {/* Stat Changes */}
        {statEntries.length > 0 && (
          <View style={styles.section}>
            <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
              Değişimler
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
                    {STAT_LABEL[key] ?? key} {val > 0 ? '+' : ''}{val}
                  </Typography>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Traits Gained */}
        {milestone.traitsGained.length > 0 && (
          <View style={styles.section}>
            <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
              Kazanılan Özellikler
            </Typography>
            {milestone.traitsGained.map(t => (
              <Typography key={t} variant="body" style={[styles.traitLine, { color: '#2E7D32' }]}>
                + {t}
              </Typography>
            ))}
          </View>
        )}

        {/* Traits Lost */}
        {milestone.traitsLost.length > 0 && (
          <View style={styles.section}>
            <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
              Kaybedilen Özellikler
            </Typography>
            {milestone.traitsLost.map(t => (
              <Typography key={t} variant="body" style={[styles.traitLine, { color: '#C62828' }]}>
                - {t}
              </Typography>
            ))}
          </View>
        )}

        {/* Key Memories */}
        {milestone.keyMemories.length > 0 && (
          <View style={styles.section}>
            <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
              Öne Çıkan Anılar
            </Typography>
            {milestone.keyMemories.map((m, i) => (
              <Typography key={i} variant="body" style={{ color: '#6A1B9A' }}>
                {EMOTION_ICON[m.emotion] ?? '○'} {m.summary}
              </Typography>
            ))}
          </View>
        )}

        {/* NPC Changes */}
        {milestone.npcChanges.length > 0 && (
          <View style={styles.section}>
            <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
              İlişki Değişimleri
            </Typography>
            {milestone.npcChanges.map((nc, i) => (
              <Typography key={i} variant="body" style={{ color: theme.textSecondary }}>
                {nc.name}: {nc.oldRole} → {nc.newRole}
              </Typography>
            ))}
          </View>
        )}

        {/* Academic */}
        {milestone.academicHighlight && (
          <View style={styles.section}>
            <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
              Akademik
            </Typography>
            <Typography variant="body" style={{ color: '#E65100' }}>
              {milestone.academicHighlight}
            </Typography>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 360,
  },
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
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
  },
});
