/**
 * FateTokenDisplay — Kader jetonu göstergesi ve "Kaderi Dene" butonu.
 * RESULT fazında negatif sonuçlarda gösterilir.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { AnimatedButton } from '../animations/ButtonAnimations';
import { fateTokenHaptic } from '../animations/HapticFeedback';
import { FateRollResult, FateOutcome, Stats } from '../types';

interface FateTokenDisplayProps {
  tokens: number;
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

const FATE_LABELS: Record<FateOutcome, { text: string; color: string; icon: string }> = {
  BLESSED:   { text: 'Kutsanmis',  color: '#eab308', icon: 'sun' },
  FORTUNATE: { text: 'Sansli',     color: '#22c55e', icon: 'trending-up' },
  NEUTRAL:   { text: 'Notr',       color: '#94a3b8', icon: 'minus' },
  UNLUCKY:   { text: 'Sanssiz',    color: '#f97316', icon: 'trending-down' },
  CURSED:    { text: 'Lanetli',    color: '#ef4444', icon: 'cloud-lightning' },
};

export const hasNegativeOutcome = (changes: Partial<Stats> | undefined): boolean => {
  if (!changes) return false;
  return Object.values(changes).some(val => typeof val === 'number' && val < 0);
};

export const FateTokenDisplay: React.FC<FateTokenDisplayProps> = React.memo(({
  tokens,
  fateRoll,
  onReroll,
  canReroll,
  theme,
  metrics,
}) => {
  const fateLabel = fateRoll ? FATE_LABELS[fateRoll.outcome] : null;

  return (
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
            Kader: {fateLabel.text}
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
            onPress={() => { fateTokenHaptic(); onReroll(); }}
            animationType="pressScale"
            style={{ ...styles.rerollButton, borderColor: '#eab308' }}
            accessibilityRole="button"
            accessibilityLabel="Kaderi yeniden dene"
            accessibilityHint="1 kader jetonu harcar ve sonucu yeniden belirler"
          >
            <Feather name="refresh-cw" size={14} color="#eab308" />
            <Text style={styles.rerollText}>
              Kaderi Dene
            </Text>
          </AnimatedButton>
        )}
      </View>
    </View>
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
});
