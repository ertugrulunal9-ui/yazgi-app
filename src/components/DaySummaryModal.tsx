/**
 * DaySummaryModal — Gün sonu özet ekranı.
 * Oyuncu "Günü Bitir" dediğinde kısa bir özet gösterir, ardından tur ilerler.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Stats } from '../types';
import { tRuntime } from '../i18n/strings';

interface DaySummaryModalProps {
  visible: boolean;
  age: number;
  turn: number;
  dailyDecisionCount: number;
  energy: number;
  maxEnergy: number;
  stats: Stats;
  theme: any;
  onContinue: () => void;
}

const getEnergyState = (energy: number, maxEnergy: number): 'energetic' | 'normal' | 'tired' | 'exhausted' => {
  const ratio = energy / Math.max(1, maxEnergy);
  if (ratio >= 0.7) return 'energetic';
  if (ratio >= 0.4) return 'normal';
  if (ratio >= 0.15) return 'tired';
  return 'exhausted';
};

const getEnergyColor = (energy: number, maxEnergy: number): string => {
  const ratio = energy / Math.max(1, maxEnergy);
  if (ratio >= 0.7) return '#22c55e';
  if (ratio >= 0.4) return '#eab308';
  if (ratio >= 0.15) return '#f97316';
  return '#ef4444';
};

export const DaySummaryModal: React.FC<DaySummaryModalProps> = ({
  visible,
  age,
  dailyDecisionCount,
  energy,
  maxEnergy,
  stats,
  theme,
  onContinue,
}) => {
  const energyState = useMemo(() => getEnergyState(energy, maxEnergy), [energy, maxEnergy]);
  const energyColor = useMemo(() => getEnergyColor(energy, maxEnergy), [energy, maxEnergy]);
  const energyLabel = tRuntime(`app.energyState.${energyState}`, undefined, energyState);
  const summaryTitle = tRuntime('app.summaryTitle', undefined, 'Gun Sonu Ozeti');
  const dayCompleted = tRuntime('app.dayCompleted', { age }, `${age} yasinda - gun tamamlandi`);
  const summaryContinue = tRuntime('app.summaryContinue', undefined, 'Devam Et');

  const summaryItems = useMemo(() => {
    const items: { icon: string; label: string; value: string; color: string }[] = [
      {
        icon: 'checkbox-marked-circle-outline',
        label: tRuntime('app.summaryDecisions', undefined, 'Kararlar'),
        value: tRuntime('app.summaryDecisionsCount', { count: dailyDecisionCount }, `${dailyDecisionCount} karar`),
        color: dailyDecisionCount >= 3 ? '#22c55e' : '#eab308',
      },
      {
        icon: 'lightning-bolt',
        label: tRuntime('app.summaryEnergy', undefined, 'Enerji'),
        value: `${Math.round(energy)}/${maxEnergy} (${energyLabel})`,
        color: energyColor,
      },
      {
        icon: 'heart-pulse',
        label: tRuntime('app.summaryHealth', undefined, 'Saglik'),
        value: `%${Math.round(stats.health)}`,
        color: stats.health >= 50 ? '#22c55e' : '#ef4444',
      },
      {
        icon: 'brain',
        label: tRuntime('app.summaryIntelligence', undefined, 'Zeka'),
        value: `%${Math.round(stats.intelligence)}`,
        color: '#3b82f6',
      },
    ];
    return items;
  }, [dailyDecisionCount, energy, maxEnergy, energyLabel, energyColor, stats.health, stats.intelligence]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onContinue}
    >
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onContinue} />
        <View style={[styles.card, { backgroundColor: theme.surfaceBase, borderColor: theme.border }]}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />

          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {'\u{1F319}'} {summaryTitle}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {dayCompleted}
          </Text>

          <View style={styles.itemsContainer}>
            {summaryItems.map((item) => (
              <View key={item.label} style={[styles.itemRow, { borderBottomColor: theme.border }]}>
                <View style={styles.itemLeft}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={18}
                    color={item.color}
                  />
                  <Text style={[styles.itemLabel, { color: theme.textSecondary }]}>
                    {item.label}
                  </Text>
                </View>
                <Text style={[styles.itemValue, { color: item.color }]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={onContinue}
            style={[styles.continueButton, { backgroundColor: theme.accentEvent }]}
            accessibilityRole="button"
            accessibilityLabel={summaryContinue}
          >
            <Text style={styles.continueText}>{summaryContinue}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  card: {
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    opacity: 0.7,
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  continueButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  continueText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
