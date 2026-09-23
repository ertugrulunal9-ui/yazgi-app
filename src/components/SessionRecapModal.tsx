/**
 * SessionRecapModal — Oturum devam özeti (Faz 1B)
 *
 * Oyuncu en son oturumun üzerinden 5+ dakika geçmişse
 * geri döndüğünde kısa bir "nerede kalmıştın?" ekranı gösterir.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal } from './ui/Modal';
import { Typography } from './ui/Typography';
import { Button } from './ui/Button';
import { useUI } from '../context/UIContext';
import type { GameState, Stats } from '../types';

interface SessionRecapProps {
  visible: boolean;
  gameState: GameState;
  stats: Stats;
  playerName: string;
  onClose: () => void;
}

export const SessionRecapModal: React.FC<SessionRecapProps> = ({
  visible,
  gameState,
  stats,
  playerName,
  onClose,
}) => {
  const { theme, t } = useUI();

  const chapterName = gameState.chapter != null
    ? t(`recap.chapterNames.${gameState.chapter}`)
    : null;
  const goalName = gameState.selectedGoal
    ? t(`recap.goalNames.${gameState.selectedGoal}`)
    : null;

  // Kritik uyarılar
  const warnings = useMemo(() => {
    const list: string[] = [];
    if (stats.health < 30) list.push(t('recap.healthLow', { value: Math.round(stats.health) }));
    if (stats.discipline < 25) list.push(t('recap.disciplineWeak', { value: Math.round(stats.discipline) }));
    if (stats.energy < 15) list.push(t('recap.energyLow', { value: Math.round(stats.energy) }));
    return list;
  }, [stats, t]);

  // Aktif NPC arkadaş/partner
  const closeFriend = useMemo(() => {
    const npcs = gameState.npcs ?? [];
    return npcs.find(n => n.role === 'BEST_FRIEND' || n.role === 'PARTNER' || n.role === 'FRIEND');
  }, [gameState.npcs]);

  return (
    <Modal
      visible={visible}
      title={t('recap.title')}
      onClose={onClose}
      footer={<Button variant="primary" onPress={onClose}>{t('recap.continueButton')}</Button>}
    >
      <View style={styles.content}>
        {/* Kim, kaç yaşında, hangi bölüm */}
        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surfaceOverlay }]}>
          <Typography variant="body" style={{ color: theme.textPrimary, fontWeight: '700', marginBottom: 4 }}>
            {t('recap.playerAge', { playerName, age: gameState.age })}
          </Typography>
          {chapterName ? (
            <Typography variant="caption" tone="secondary">
              {t('recap.chapter', { chapterName })}
            </Typography>
          ) : null}
          {goalName ? (
            <Typography variant="caption" tone="secondary">
              {t('recap.goal', { goalName })}
            </Typography>
          ) : null}
        </View>

        {/* Güncel stat özeti */}
        <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surfaceOverlay }]}>
          <Typography variant="caption" tone="secondary" style={styles.label}>
            {t('recap.currentStatus')}
          </Typography>
          <View style={styles.statRow}>
            {(['health', 'intelligence', 'discipline', 'charisma'] as const).map(key => (
              <View key={key} style={[styles.statChip, { borderColor: theme.border }]}>
                <Typography variant="caption" style={{ color: theme.textSecondary }}>
                  {t(`labels.stats.${key}`)}
                </Typography>
                <Typography
                  variant="body"
                  style={{
                    color: stats[key] < 30 ? '#ef4444' : theme.textPrimary,
                    fontWeight: '700',
                  }}
                >
                  {Math.round(stats[key])}
                </Typography>
              </View>
            ))}
          </View>
        </View>

        {/* Yakın NPC */}
        {closeFriend ? (
          <View style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surfaceOverlay }]}>
            <Typography variant="caption" tone="secondary" style={styles.label}>
              {t('recap.relationships')}
            </Typography>
            <Typography variant="body" style={{ color: theme.textPrimary }}>
              {t('recap.npcWaiting', { npcName: closeFriend.name })}
            </Typography>
          </View>
        ) : null}

        {/* Uyarılar */}
        {warnings.length > 0 ? (
          <View style={[styles.card, { borderColor: '#ef444460', backgroundColor: '#ef44440d' }]}>
            <Typography variant="caption" style={{ color: '#ef4444', marginBottom: 4 }}>
              {t('recap.attention')}
            </Typography>
            {warnings.map((w, i) => (
              <Typography key={i} variant="body" style={{ color: '#ef4444' }}>
                • {w}
              </Typography>
            ))}
          </View>
        ) : null}

        {/* Sonraki olay teaserı */}
        {gameState.nextEventTeaser ? (
          <View style={[styles.card, { borderColor: theme.accentBrand + '50', backgroundColor: theme.surfaceOverlay }]}>
            <Typography variant="caption" tone="secondary" style={styles.label}>
              {t('recap.upcoming')}
            </Typography>
            <Typography variant="body" style={{ color: theme.textPrimary, fontStyle: 'italic' }}>
              {gameState.nextEventTeaser}
            </Typography>
          </View>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 10,
    paddingBottom: 4,
  },
  card: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  label: {
    marginBottom: 6,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  statChip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignItems: 'center',
    minWidth: 60,
  },
});
