/**
 * ChapterTransitionModal — Bölüm geçişi özet modalı (Faz 1A)
 *
 * Bir bölüm tamamlandığında (Bebeklik, Çocukluk, İlkokul, Ortaokul, Lise, Son Yıl)
 * oyuncuya o bölümün özetini gösterir: stat değişimleri, trait kazanımlar/kayıplar,
 * öne çıkan anılar ve ilişki değişimleri.
 *
 * Bölümü kapatan yılın yaş özeti de varsa (`yearMilestone`) pencerenin içinde
 * gösterilir; böylece yıl sonunda ayrı ikinci bir pencere açılmaz.
 */

import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Modal } from './ui/Modal';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { AgeMilestoneContent } from './AgeMilestoneContent';
import { useUI } from '../context/UIContext';
import type { AgeMilestoneSummary, ChapterSummary } from '../types/game';
import type { StatKey } from '../types/core';
import { getChapterNameKey } from '../utils/gameUtils';
import { hasMilestoneContent } from '../utils/milestoneBuilder';

interface Props {
  visible: boolean;
  summary: ChapterSummary | null;
  /** Bölümü kapatan yılın yaş özeti; varsa pencerenin içinde gösterilir. */
  yearMilestone?: AgeMilestoneSummary | null;
  nextChapterId?: number;
  nextChapterEmoji?: string;
  onClose: () => void;
}

const EMOTION_ICON: Record<string, string> = {
  PRIDE: '★',
  REGRET: '✦',
  GUILT: '◆',
  SATISFACTION: '●',
  NEUTRAL: '○',
};

export const ChapterTransitionModal: React.FC<Props> = ({
  visible,
  summary,
  yearMilestone,
  nextChapterId,
  nextChapterEmoji,
  onClose,
}) => {
  const { theme, t } = useUI();

  if (!summary) return null;

  const chapterName = t(getChapterNameKey(summary.chapterId), undefined, summary.chapterName);
  const nextChapterName = nextChapterId != null
    ? t(getChapterNameKey(nextChapterId))
    : undefined;

  const statEntries = Object.entries(summary.totalStatDeltas) as [StatKey, number][];
  const hasContent =
    summary.allTraitsGained.length > 0 ||
    summary.allTraitsLost.length > 0 ||
    summary.keyMemories.length > 0 ||
    statEntries.length > 0 ||
    summary.topNpcChanges.length > 0 ||
    (yearMilestone ? hasMilestoneContent(yearMilestone) : false);

  return (
    <Modal
      visible={visible}
      title={t('chapter.title', {
        chapterEmoji: summary.chapterEmoji,
        chapterName,
      })}
      onClose={onClose}
      footer={<Button variant="primary" onPress={onClose}>{t('chapter.continueButton')}</Button>}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Yaş aralığı */}
        <Typography variant="caption" tone="secondary" style={styles.ageRange}>
          {summary.ageRange}
        </Typography>

        {!hasContent && (
          <Typography variant="body" tone="secondary" style={styles.emptyText}>
            {t('chapter.quietChapter')}
          </Typography>
        )}

        {/* Stat Değişimleri */}
        {statEntries.length > 0 && (
          <View style={styles.section}>
            <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
              {t('chapter.statChanges')}
            </Typography>
            <View style={styles.statRow}>
              {statEntries.map(([key, val]) => val !== 0 && (
                <View
                  key={key}
                  style={[
                    styles.statChip,
                    { backgroundColor: val > 0 ? '#1B5E2015' : '#B7191915' },
                  ]}
                >
                  <Typography
                    variant="caption"
                    style={{ color: val > 0 ? '#2E7D32' : '#C62828' }}
                  >
                    {t(`labels.stats.${key}`) ?? key} {val > 0 ? '+' : ''}{Math.round(val)}
                  </Typography>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Kazanılan Özellikler */}
        {summary.allTraitsGained.length > 0 && (
          <View style={styles.section}>
            <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
              {t('chapter.traitsGained')}
            </Typography>
            {summary.allTraitsGained.map(trait => (
              <Typography key={trait} variant="body" style={[styles.traitLine, { color: '#2E7D32' }]}>
                + {trait}
              </Typography>
            ))}
          </View>
        )}

        {/* Kaybedilen Özellikler */}
        {summary.allTraitsLost.length > 0 && (
          <View style={styles.section}>
            <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
              {t('chapter.traitsLost')}
            </Typography>
            {summary.allTraitsLost.map(trait => (
              <Typography key={trait} variant="body" style={[styles.traitLine, { color: '#C62828' }]}>
                - {trait}
              </Typography>
            ))}
          </View>
        )}

        {/* Öne Çıkan Anılar */}
        {summary.keyMemories.length > 0 && (
          <View style={styles.section}>
            <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
              {t('chapter.keyMemories')}
            </Typography>
            {summary.keyMemories.map((m, i) => (
              <Typography key={i} variant="body" style={{ color: '#6A1B9A' }}>
                {EMOTION_ICON[m.emotion] ?? '○'} {m.summary}
              </Typography>
            ))}
          </View>
        )}

        {/* İlişki Değişimleri */}
        {summary.topNpcChanges.length > 0 && (
          <View style={styles.section}>
            <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
              {t('chapter.npcChanges')}
            </Typography>
            {summary.topNpcChanges.map((nc, i) => (
              <Typography key={i} variant="body" style={{ color: theme.textSecondary }}>
                {nc.name}: {nc.oldRole} → {nc.newRole}
              </Typography>
            ))}
          </View>
        )}

        {/* Bölümü kapatan yılın özeti */}
        {yearMilestone && (
          <View style={[styles.yearSummary, { borderTopColor: theme.border }]}>
            <Typography variant="label" style={styles.yearSummaryTitle}>
              {t('milestone.title', { age: yearMilestone.age })}
            </Typography>
            <AgeMilestoneContent milestone={yearMilestone} />
          </View>
        )}

        {/* Sonraki Bölüm Teaserı */}
        {nextChapterName && (
          <View style={[styles.nextChapter, { borderColor: theme.border, backgroundColor: theme.surfaceOverlay }]}>
            <Typography variant="caption" tone="secondary" style={styles.sectionTitle}>
              {t('chapter.nextChapter')}
            </Typography>
            <Typography variant="body" style={{ color: theme.textPrimary }}>
              {nextChapterEmoji} {nextChapterName}
            </Typography>
          </View>
        )}
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 420,
  },
  ageRange: {
    marginBottom: 12,
    textAlign: 'center',
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
  yearSummary: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginBottom: 2,
  },
  yearSummaryTitle: {
    marginBottom: 8,
  },
  nextChapter: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
});
