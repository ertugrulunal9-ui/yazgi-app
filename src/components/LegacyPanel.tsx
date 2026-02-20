import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { MetaProgression } from '../types';
import { getDensityMetrics, getThemeTokens } from '../utils/themeUtils';

interface LegacyPanelProps {
  meta?: MetaProgression | null;
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
}

const getTierColor = (tier: MetaProgression['bestTier'] | undefined): string => {
  if (tier === 'LEGENDARY') return '#f59e0b';
  if (tier === 'SUCCESS') return '#22c55e';
  if (tier === 'NORMAL') return '#3b82f6';
  if (tier === 'FAILURE') return '#ef4444';
  return '#9ca3af';
};

const getTierLabel = (tier: MetaProgression['bestTier'] | undefined): string => {
  if (tier === 'LEGENDARY') return 'EFSANE';
  if (tier === 'SUCCESS') return 'BASARI';
  if (tier === 'NORMAL') return 'ORTA';
  if (tier === 'FAILURE') return 'ZOR';
  return '-';
};

const formatTimeAgo = (endedAt: number): string => {
  const diff = Math.max(0, Date.now() - endedAt);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) return `${days} gun once`;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) return `${hours} saat once`;
  return 'Az once';
};

export const LegacyPanel: React.FC<LegacyPanelProps> = ({ meta, theme, metrics }) => {
  const recentRuns = useMemo(() => meta?.recentRuns?.slice(0, 2) || [], [meta]);
  if (!meta) return null;

  const bestTier = getTierLabel(meta.bestTier || recentRuns[0]?.tier);
  const bestTierColor = getTierColor(meta.bestTier || recentRuns[0]?.tier);
  const bestEndingTitle = recentRuns[0]?.endingTitle || 'Henuz tamamlanan kosu yok';

  return (
    <View style={{
      backgroundColor: theme.surfaceBase,
      borderRadius: 14,
      padding: metrics.pad,
      borderWidth: 1,
      borderColor: theme.border,
      marginBottom: 10,
      gap: 8,
    }}>
      <Text style={{ color: theme.textPrimary, fontSize: metrics.font + 1, fontWeight: '800' }}>
        Seviye {meta.legacyLevel} - {meta.totalLegacyPoints} Miras Puani
      </Text>
      <Text style={{ color: theme.textSecondary, fontSize: metrics.font - 1 }}>
        En Iyi: <Text style={{ color: bestTierColor, fontWeight: '700' }}>{bestTier}</Text> - {bestEndingTitle}
      </Text>
      <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 2 }} />
      {recentRuns.map((run, index) => (
        <View key={run.runId} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ color: theme.textSecondary, fontSize: metrics.font - 2 }}>
            {index === 0 ? 'Son Oyun' : 'Onceki'}
          </Text>
          <Text style={{ color: theme.textPrimary, flex: 1, fontSize: metrics.font - 2 }} numberOfLines={1}>
            {run.endingTitle}
          </Text>
          <View style={{
            borderRadius: 999,
            borderWidth: 1,
            borderColor: getTierColor(run.tier),
            backgroundColor: `${getTierColor(run.tier)}22`,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}>
            <Text style={{ color: getTierColor(run.tier), fontSize: 10, fontWeight: '700' }}>
              {getTierLabel(run.tier)}
            </Text>
          </View>
          <Text style={{ color: theme.textSecondary, fontSize: metrics.font - 3 }}>
            {formatTimeAgo(run.endedAt)}
          </Text>
        </View>
      ))}
    </View>
  );
};
