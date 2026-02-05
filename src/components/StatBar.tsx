import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatKey } from '../types';

interface StatBarProps {
  label: string;
  value: number;
  statKey: StatKey;
  cap?: number;
  theme?: any;
}

const StatBar = React.memo<StatBarProps>(({ label, value, statKey, cap = 100, theme }) => {
  const isMoney = statKey === 'money';
  const isCapped = !isMoney && value >= cap;

  // Width Percentage
  let widthPercentage = 0;
  if (isMoney) {
    widthPercentage = Math.min(100, (value / 2000) * 100);
  } else {
    widthPercentage = Math.min(100, (value / cap) * 100);
  }

  const isMastered = !isMoney && value >= 100;

  const styles = useMemo(() => StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    label: {
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontWeight: '600',
      color: theme?.textSecondary || '#9ca3af',
    },
    value: {
      fontSize: 11,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontWeight: '600',
      color: theme?.textSecondary || '#9ca3af',
    },
    masteredLabel: {
      color: '#fbbf24',
      fontWeight: 'bold',
    },
    cappedValue: {
      color: '#facc15',
      fontWeight: 'bold',
    },
    barContainer: {
      height: 8,
      width: '100%',
      backgroundColor: theme?.surfaceBase || '#1f2937',
      borderWidth: 1,
      borderColor: theme?.border || '#374151',
      borderRadius: 999,
      overflow: 'hidden',
      position: 'relative',
    },
    barFill: {
      height: '100%',
      backgroundColor: isMastered ? '#fbbf24' : theme?.accentStat || '#3b82f6',
    },
    capIndicator: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 2,
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
      zIndex: 10,
    },
    cappedText: {
      fontSize: 9,
      color: '#eab308',
      marginTop: 4,
      fontWeight: '500',
    },
  }), [theme?.textSecondary, theme?.surfaceBase, theme?.border, theme?.accentStat]);

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, isMastered && styles.masteredLabel]}>
          {label} {isMastered && '👑'}
        </Text>
        <Text style={[styles.value, isCapped && styles.cappedValue]}>
          {Math.floor(value)}
          {!isMoney && <Text style={styles.value}>/{cap}</Text>}
        </Text>
      </View>
      <View style={styles.barContainer}>
        <View
          style={[styles.barFill, { width: `${widthPercentage}%` }]}
        />
        {!isMoney && cap < 100 && (
          <View
            style={[styles.capIndicator, { left: `${(cap / 100) * 100}%` }]}
          />
        )}
      </View>
      {isCapped && !isMoney && (
        <Text style={styles.cappedText}>
          * Sınıf düzeyinin üzerindesin! Gelişim yavaşladı.
        </Text>
      )}
    </View>
  );
});

export default StatBar;
