/**
 * FateTokenDisplay — Kader jetonu göstergesi ve "Kaderi Dene" butonu.
 * RESULT fazında negatif sonuçlarda gösterilir.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AnimatedButton } from '../animations/ButtonAnimations';
import { fateTokenHaptic } from '../animations/HapticFeedback';
import { FateRollResult, FateOutcome, FateState, Stats } from '../types';
import { previewFateOdds } from '../systems/FateEngine';
import { tRuntime } from '../i18n/strings';

interface FateTokenDisplayProps {
  tokens: number;
  fateState: FateState;
  fateRoll?: FateRollResult;
  onReroll: () => void;
  canReroll: boolean;
  theme: {
    surfaceBase: string;
    surfaceRaised: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    accentEvent: string;
  };
  metrics: { pad: number; font: number };
}

const FATE_META: Record<FateOutcome, { color: string; icon: string }> = {
  BLESSED:   { color: '#eab308', icon: 'sun' },
  FORTUNATE: { color: '#22c55e', icon: 'trending-up' },
  NEUTRAL:   { color: '#94a3b8', icon: 'minus' },
  UNLUCKY:   { color: '#f97316', icon: 'trending-down' },
  CURSED:    { color: '#ef4444', icon: 'cloud-lightning' },
};

const getFateLabel = (outcome: FateOutcome) => ({
  ...FATE_META[outcome],
  text: tRuntime(`fate.label.${outcome}`, undefined, outcome),
});

export const hasNegativeOutcome = (changes: Partial<Stats> | undefined): boolean => {
  if (!changes) return false;
  return Object.values(changes).some(val => typeof val === 'number' && val < 0);
};

export const FateTokenDisplay: React.FC<FateTokenDisplayProps> = React.memo(({
  tokens,
  fateState,
  fateRoll,
  onReroll,
  canReroll,
  theme,
  metrics,
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const fateLabel = fateRoll ? getFateLabel(fateRoll.outcome) : null;
  const oddsPreview = useMemo(() => (
    previewFateOdds(fateState, { zodiacModifier: fateRoll?.zodiacModifier ?? 0 })
  ), [fateRoll?.zodiacModifier, fateState]);

  const handleConfirmReroll = () => {
    setPreviewVisible(false);
    fateTokenHaptic();
    onReroll();
  };

  return (
    <>
      <View style={[styles.container, {
        backgroundColor: theme.surfaceRaised,
        borderColor: theme.border,
        padding: metrics.pad,
      }]}>
        {/* Fate roll result indicator */}
        {fateLabel && (
          <View style={styles.fateRow}>
            <Feather name={fateLabel.icon as any} size={14} color={fateLabel.color} />
            <Text style={[styles.fateText, { color: fateLabel.color }]}>
              {tRuntime('fate.fatePrefix')} {fateLabel.text}
            </Text>
          </View>
        )}

        {/* Token count + reroll button */}
        <View style={styles.tokenRow}>
          <View style={styles.tokenBadge}>
            <Feather name="compass" size={14} color="#eab308" />
            <Text style={[styles.tokenCount, { color: theme.textPrimary }]}>
              {tokens}
            </Text>
          </View>

          {canReroll && tokens > 0 && (
            <AnimatedButton
              onPress={() => setPreviewVisible(true)}
              animationType="pressScale"
              style={{ ...styles.rerollButton, borderColor: '#eab308' }}
              accessibilityRole="button"
              accessibilityLabel={tRuntime('fate.rerollAria')}
              accessibilityHint={tRuntime('fate.rerollHint')}
            >
              <Feather name="refresh-cw" size={14} color="#eab308" />
              <Text style={styles.rerollText}>
                {tRuntime('fate.rerollButton')}
              </Text>
            </AnimatedButton>
          )}
        </View>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={previewVisible}
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={() => setPreviewVisible(false)} />
          <View style={[styles.modalCard, { backgroundColor: theme.surfaceBase, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{tRuntime('fate.previewTitle')}</Text>
            <Text style={[styles.modalHint, { color: theme.textSecondary }]}>
              {tRuntime('fate.previewHint')}
            </Text>

            <View style={styles.oddsColumns}>
              <View style={styles.oddsColumn}>
                <Text style={[styles.oddsTitle, { color: theme.textPrimary }]}>{tRuntime('fate.oddsWithoutToken')}</Text>
                {oddsPreview.withoutToken.map((entry) => (
                  <View key={`without_${entry.label}`} style={styles.oddsRow}>
                    <Text style={[styles.oddsLabel, { color: theme.textSecondary }]}>{entry.label}</Text>
                    <Text style={[styles.oddsPct, { color: theme.textPrimary }]}>%{entry.pct}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.oddsDivider} />

              <View style={styles.oddsColumn}>
                <Text style={[styles.oddsTitle, { color: theme.textPrimary }]}>{tRuntime('fate.oddsWithToken')}</Text>
                {oddsPreview.withToken.map((entry) => (
                  <View key={`with_${entry.label}`} style={styles.oddsRow}>
                    <Text style={[styles.oddsLabel, { color: theme.textSecondary }]}>{entry.label}</Text>
                    <Text style={[styles.oddsPct, { color: theme.textPrimary }]}>%{entry.pct}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setPreviewVisible(false)}
                style={[styles.modalButton, { borderColor: theme.border, backgroundColor: theme.surfaceRaised }]}
              >
                <Text style={[styles.modalButtonText, { color: theme.textPrimary }]}>{tRuntime('fate.cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmReroll}
                style={[styles.modalButton, styles.modalConfirmButton]}
              >
                <Text style={styles.modalConfirmButtonText}>{tRuntime('fate.spendToken')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
});
FateTokenDisplay.displayName = 'FateTokenDisplay';

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 12,
  },
  fateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  fateText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tokenCount: {
    fontSize: 15,
    fontWeight: '800',
  },
  rerollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  rerollText: {
    color: '#eab308',
    fontSize: 13,
    fontWeight: '700',
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
  },
  modalCard: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  modalHint: {
    fontSize: 12,
    marginBottom: 12,
  },
  oddsColumns: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 14,
  },
  oddsColumn: {
    flex: 1,
    gap: 4,
  },
  oddsDivider: {
    width: 1,
    backgroundColor: 'rgba(148, 163, 184, 0.35)',
    marginHorizontal: 10,
  },
  oddsTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  oddsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  oddsLabel: {
    fontSize: 12,
  },
  oddsPct: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalConfirmButton: {
    backgroundColor: '#eab308',
    borderColor: '#eab308',
  },
  modalConfirmButtonText: {
    color: '#3f2f00',
    fontSize: 13,
    fontWeight: '800',
  },
});
