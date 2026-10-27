/**
 * AgeMilestoneModal — Yaş geçişi özet modalı (Paket 4)
 *
 * Oyuncuya son yaşta neler olduğunu özetler:
 * kazanımlar, kayıplar, anılar, ilişki değişimleri, akademik öne çıkanlar.
 * Gövde AgeMilestoneContent'te; bölüm değişimi olan yıllarda aynı içerik
 * bölüm penceresinin içinde gösterilir (yıl sonunda tek pencere).
 */

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Modal } from './ui/Modal';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { AgeMilestoneContent } from './AgeMilestoneContent';
import { hasMilestoneContent } from '../utils/milestoneBuilder';
import { useUI } from '../context/UIContext';
import type { AgeMilestoneSummary } from '../types/game';

interface Props {
  visible: boolean;
  milestone: AgeMilestoneSummary | null;
  onClose: () => void;
}

export const AgeMilestoneModal: React.FC<Props> = ({ visible, milestone, onClose }) => {
  const { t } = useUI();

  if (!milestone) return null;

  const hasContent = hasMilestoneContent(milestone);

  return (
    <Modal
      visible={visible}
      title={t('milestone.title', { age: milestone.age })}
      onClose={onClose}
      footer={<Button variant="primary" onPress={onClose}>{t('chapter.continueButton')}</Button>}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {!hasContent && (
          <Typography variant="body" tone="secondary" style={styles.emptyText}>
            {t('milestone.quiet')}
          </Typography>
        )}

        <AgeMilestoneContent milestone={milestone} />
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 360,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 20,
  },
});
