import React from 'react';
import { View, Text } from 'react-native';
import { Stats, StatKey } from '../types';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';

interface StatPanelProps {
  stats: Stats;
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  statLabels: Record<StatKey, string>;
}

export const StatPanel: React.FC<StatPanelProps> = ({ stats, theme, metrics, statLabels }) => {
  const cardStyle = {
    backgroundColor: theme.surfaceBase,
    borderRadius: 14,
    borderWidth: 1 as const,
    borderColor: theme.border,
    padding: metrics.pad,
    marginBottom: 12,
  };

  const statKeys: StatKey[] = ['health', 'intelligence', 'charisma', 'discipline', 'money', 'familyRelation'];

  return (
    <View style={cardStyle}>
      <Text style={{ color: theme.textPrimary, fontWeight: '700', marginBottom: 12 }}>İstatistikler</Text>
      {statKeys.map(key => {
        const label = statLabels[key];
        const value = stats[key];
        const displayValue = key === 'money' ? Math.floor(value) : Math.round(value);
        return (
          <View key={key} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: theme.border }}>
            <Text style={{ color: theme.textSecondary, fontSize: 13 }}>{label}</Text>
            <Text style={{ color: theme.accentStat, fontWeight: '700' }}>{displayValue}</Text>
          </View>
        );
      })}
    </View>
  );
};
