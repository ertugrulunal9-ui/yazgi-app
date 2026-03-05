/**
 * FateIndicator — Kompakt şans göstergesi (EVENT fazında gösterilir)
 *
 * Oyuncuya seçim yapmadan önce mevcut şans durumunu gösterir.
 * Tap'te detay: pity bonus, token sayısı, burç etkisi.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { FateState } from '../types';
import { previewFateOdds, getPityModifier, getZodiacModifier } from '../systems/FateEngine';
import { tRuntime } from '../i18n/strings';

interface FateIndicatorProps {
  fateState: FateState;
  personalityCategory?: string;
  theme: {
    surfaceBase: string;
    surfaceRaised: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
  };
}

const ZODIAC_LABELS: Record<string, string> = {
  KOC: 'Koc',
  BOGA: 'Boga',
  IKIZLER: 'Ikizler',
  YENGEC: 'Yengec',
  ASLAN: 'Aslan',
  BASAK: 'Basak',
  TERAZI: 'Terazi',
  AKREP: 'Akrep',
  YAY: 'Yay',
  OGLAK: 'Oglak',
  KOVA: 'Kova',
  BALIK: 'Balik',
};

const CATEGORY_LABELS: Record<string, string> = {
  SOCIAL: 'Sosyal',
  RISK: 'Risk',
  MORAL: 'Ahlak',
  CONFLICT: 'Catisma',
  GROWTH: 'Gelisim',
  BREAKDOWN: 'Bunalim',
};

type LuckLevel = 'good' | 'normal' | 'bad';

function classifyLuck(fateState: FateState, personalityCategory?: string): LuckLevel {
  const pity = getPityModifier(fateState.consecutiveBadOutcomes);
  const zodiac = getZodiacModifier(fateState.zodiacSign, personalityCategory);
  const totalBonus = pity + zodiac;

  if (totalBonus >= 0.10) return 'good';
  if (totalBonus <= -0.04) return 'bad';
  return 'normal';
}

const LUCK_META: Record<LuckLevel, { color: string; icon: string; labelKey: string }> = {
  good: { color: '#22c55e', icon: 'trending-up', labelKey: 'fate.indicator.good' },
  normal: { color: '#94a3b8', icon: 'minus', labelKey: 'fate.indicator.normal' },
  bad: { color: '#f97316', icon: 'trending-down', labelKey: 'fate.indicator.bad' },
};

function getZodiacEffectDescription(fateState: FateState, personalityCategory?: string): string {
  const zodiacLabel = ZODIAC_LABELS[fateState.zodiacSign] ?? fateState.zodiacSign;
  if (!personalityCategory) {
    return `${zodiacLabel} burcu`;
  }
  const modifier = getZodiacModifier(fateState.zodiacSign, personalityCategory);
  const catLabel = CATEGORY_LABELS[personalityCategory] ?? personalityCategory;
  if (modifier > 0) {
    return `${zodiacLabel}: ${catLabel} olaylarinda +${Math.round(modifier * 100)}% sans`;
  } else if (modifier < 0) {
    return `${zodiacLabel}: ${catLabel} olaylarinda ${Math.round(modifier * 100)}% sans`;
  }
  return `${zodiacLabel}: Bu olay turkune etkisiz`;
}

export const FateIndicator: React.FC<FateIndicatorProps> = React.memo(({
  fateState,
  personalityCategory,
  theme,
}) => {
  const [detailVisible, setDetailVisible] = useState(false);

  const luck = useMemo(
    () => classifyLuck(fateState, personalityCategory),
    [fateState, personalityCategory],
  );

  const meta = LUCK_META[luck];
  const luckLabel = tRuntime(meta.labelKey, undefined,
    luck === 'good' ? 'Iyi' : luck === 'bad' ? 'Kotu' : 'Normal'
  );

  const pityPct = Math.round(getPityModifier(fateState.consecutiveBadOutcomes) * 100);
  const zodiacDesc = useMemo(
    () => getZodiacEffectDescription(fateState, personalityCategory),
    [fateState, personalityCategory],
  );

  const oddsPreview = useMemo(() => (
    previewFateOdds(fateState, { personalityCategory })
  ), [fateState, personalityCategory]);

  return (
    <>
      <Pressable
        onPress={() => setDetailVisible(true)}
        style={[styles.chip, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
        accessibilityRole="button"
        accessibilityLabel={`${tRuntime('fate.indicator.prefix', undefined, 'Sansin')}: ${luckLabel}`}
      >
        <Feather name={meta.icon as any} size={12} color={meta.color} />
        <Text style={[styles.chipText, { color: meta.color }]}>
          {tRuntime('fate.indicator.prefix', undefined, 'Sansin')}: {luckLabel}
        </Text>
        <Feather name="info" size={10} color={theme.textSecondary} />
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={detailVisible}
        onRequestClose={() => setDetailVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setDetailVisible(false)} />
          <View style={[styles.modalCard, { backgroundColor: theme.surfaceBase, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
              {tRuntime('fate.indicator.detailTitle', undefined, 'Sans Detayi')}
            </Text>

            {/* Luck summary */}
            <View style={[styles.summaryRow, { borderBottomColor: theme.border }]}>
              <Feather name={meta.icon as any} size={16} color={meta.color} />
              <Text style={[styles.summaryText, { color: meta.color }]}>
                {tRuntime('fate.indicator.prefix', undefined, 'Sansin')}: {luckLabel}
              </Text>
            </View>

            {/* Tokens */}
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                {tRuntime('fate.indicator.tokens', undefined, 'Kader Jetonu')}
              </Text>
              <View style={styles.tokenBadge}>
                <Feather name="compass" size={12} color="#eab308" />
                <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                  {fateState.tokens}
                </Text>
              </View>
            </View>

            {/* Pity bonus */}
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                {tRuntime('fate.indicator.pity', undefined, 'Telafi Bonusu')}
              </Text>
              <Text style={[styles.detailValue, { color: pityPct > 0 ? '#22c55e' : theme.textPrimary }]}>
                {pityPct > 0 ? `+${pityPct}%` : '%0'}
              </Text>
            </View>

            {/* Zodiac */}
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>
                {tRuntime('fate.indicator.zodiac', undefined, 'Burc Etkisi')}
              </Text>
              <Text style={[styles.detailValue, { color: theme.textPrimary, flex: 1, textAlign: 'right' }]} numberOfLines={2}>
                {zodiacDesc}
              </Text>
            </View>

            {/* Odds preview (without token) */}
            <View style={[styles.oddsSection, { borderTopColor: theme.border }]}>
              <Text style={[styles.oddsTitle, { color: theme.textSecondary }]}>
                {tRuntime('fate.indicator.currentOdds', undefined, 'Mevcut Olasiliklar')}
              </Text>
              {oddsPreview.withoutToken.map((entry) => (
                <View key={entry.outcome} style={styles.oddsRow}>
                  <Text style={[styles.oddsLabel, { color: theme.textSecondary }]}>{entry.label}</Text>
                  <Text style={[styles.oddsPct, { color: theme.textPrimary }]}>%{entry.pct}</Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => setDetailVisible(false)}
              style={[styles.closeButton, { borderColor: theme.border, backgroundColor: theme.surfaceRaised }]}
            >
              <Text style={[styles.closeText, { color: theme.textPrimary }]}>
                {tRuntime('common.close', undefined, 'Kapat')}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
});

FateIndicator.displayName = 'FateIndicator';

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  oddsSection: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  oddsTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  oddsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  oddsLabel: {
    fontSize: 12,
  },
  oddsPct: {
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    marginTop: 14,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
