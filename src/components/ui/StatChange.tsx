import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useUI } from '../../context/UIContext';
import { Badge } from './Badge';

interface StatChangeProps {
  changes?: Record<string, number | undefined>;
  labels?: Record<string, string>;
  icon?: string;
}

export const StatChange: React.FC<StatChangeProps> = ({
  changes,
  labels,
  icon = 'Δ',
}) => {
  const { theme } = useUI();
  const entries = Object.entries(changes || {}).filter(([, value]) => typeof value === 'number' && value !== 0);

  if (entries.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceOverlay, borderColor: theme.border }]}>
      <View style={styles.grid}>
        {entries.map(([key, raw]) => {
          const value = Number(raw || 0);
          const isPositive = value > 0;
          const label = labels?.[key] ?? key;

          return (
            <View key={key} style={styles.item}>
              <Text
                allowFontScaling
                style={[
                  styles.icon,
                  { color: isPositive ? theme.accentGrade : '#ef4444' },
                ]}
              >
                {icon}
              </Text>

              <Badge
                variant={isPositive ? 'success' : 'danger'}
                label={`${isPositive ? '+' : ''}${value}`}
              />

              <Text allowFontScaling style={[styles.label, { color: theme.textPrimary }]}>
                {label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  icon: {
    fontSize: 13,
    fontWeight: '700',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
