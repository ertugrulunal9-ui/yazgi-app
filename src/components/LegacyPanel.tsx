import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { MetaProgression } from '../types';
import { tRuntime } from '../i18n/strings';
import { useRuntimeLocale } from '../i18n/useRuntimeLocale';
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
  if (!tier) return '-';
  return tRuntime(`endings.tiers.${tier}`);
};

const formatTimeAgo = (endedAt: number): string => {
  const diff = Math.max(0, Date.now() - endedAt);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days > 0) {
    return tRuntime('legacyPanel.timeDays', { count: days });
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours > 0) {
    return tRuntime('legacyPanel.timeHours', { count: hours });
  }

  return tRuntime('legacyPanel.timeJustNow');
};

export const LegacyPanel: React.FC<LegacyPanelProps> = ({ meta, theme, metrics }) => {
  useRuntimeLocale();

  const recentRuns = useMemo(() => meta?.recentRuns?.slice(0, 2) || [], [meta]);
  if (!meta) return null;

  const bestTier = getTierLabel(meta.bestTier || recentRuns[0]?.tier);
  const bestTierColor = getTierColor(meta.bestTier || recentRuns[0]?.tier);
  const bestEndingTitle = recentRuns[0]?.endingTitle || tRuntime('legacyPanel.noCompletedRuns');

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
        {tRuntime(
          'legacyPanel.levelPoints',
          { level: meta.legacyLevel, points: meta.totalLegacyPoints },
        )}
      </Text>
      <Text style={{ color: theme.textSecondary, fontSize: metrics.font - 1 }}>
        {tRuntime('legacyPanel.bestLabel')}
        {' '}
        <Text style={{ color: bestTierColor, fontWeight: '700' }}>{bestTier}</Text>
        {' - '}
        {bestEndingTitle}
      </Text>
      <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 2 }} />
      {recentRuns.map((run, index) => (
        <View key={run.runId} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <Text style={{ color: theme.textSecondary, fontSize: metrics.font - 2 }}>
            {index === 0
              ? tRuntime('legacyPanel.latestRun')
              : tRuntime('legacyPanel.previousRun')}
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
