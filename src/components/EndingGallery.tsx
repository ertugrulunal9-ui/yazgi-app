import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import type { LifeGoal, MetaProgression } from '../types';
import { ENDING_ID_LIST, ENDING_ID_LOOKUP, TOTAL_ENDING_COUNT } from '../utils/endingResolver';
import { getDensityMetrics, getThemeTokens } from '../utils/themeUtils';

interface EndingGalleryProps {
  meta?: MetaProgression | null;
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  hints?: Array<{ goalPath: LifeGoal; tier: string; progressPercent: number }>;
}

const getEndingColor = (tier: 'FAILURE' | 'NORMAL' | 'SUCCESS' | 'LEGENDARY' | 'MISMATCH' | 'SECRET') => {
  if (tier === 'LEGENDARY') return '#f59e0b';
  if (tier === 'SUCCESS') return '#22c55e';
  if (tier === 'NORMAL') return '#3b82f6';
  if (tier === 'FAILURE') return '#ef4444';
  if (tier === 'MISMATCH') return '#f97316';
  return '#a855f7';
};

const GOAL_PREFIX_BY_PATH: Record<LifeGoal, string> = {
  ACADEMIC: 'academic',
  ATHLETIC: 'athletic',
  CREATIVE: 'creative',
  WEALTH: 'enterprise',
  SOCIAL: 'social',
};

export const EndingGallery: React.FC<EndingGalleryProps> = ({ meta, theme, metrics, hints = [] }) => {
  const discoveredIds = useMemo(
    () => new Set(meta?.lifetimeEndingIds || []),
    [meta?.lifetimeEndingIds]
  );

  const discoveredCount = discoveredIds.size;

  const galleryEntries = useMemo(
    () => ENDING_ID_LIST.map(id => ENDING_ID_LOOKUP[id]).filter(Boolean),
    []
  );

  const hintByEndingId = useMemo(() => {
    const lookup: Record<string, number> = {};
    hints.forEach(hint => {
      const prefix = GOAL_PREFIX_BY_PATH[hint.goalPath];
      if (!prefix) return;
      const endingId = `${prefix}_${String(hint.tier).toLowerCase()}`;
      lookup[endingId] = hint.progressPercent;
    });
    return lookup;
  }, [hints]);

  return (
    <View style={{
      backgroundColor: theme.surfaceBase,
      borderRadius: 14,
      padding: metrics.pad,
      borderWidth: 1,
      borderColor: theme.border,
    }}>
      <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: metrics.font + 1 }}>
        Hayatlar
      </Text>
      <Text style={{ color: theme.textSecondary, marginTop: 4, marginBottom: 10 }}>
        {'\u{1F5DD}\uFE0F'} {discoveredCount} / {TOTAL_ENDING_COUNT} son kesfedildi
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {galleryEntries.map(entry => {
          const unlocked = discoveredIds.has(entry.id);
          const accent = getEndingColor(entry.tier);
          const hintProgress = hintByEndingId[entry.id];

          return (
            <View
              key={entry.id}
              style={{
                width: '31.5%',
                minHeight: 96,
                borderRadius: 10,
                paddingVertical: 9,
                paddingHorizontal: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: unlocked ? `${accent}AA` : theme.border,
                backgroundColor: unlocked ? `${accent}22` : theme.surfaceOverlay,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{
                fontSize: 20,
                marginBottom: 5,
                color: unlocked ? accent : theme.textSecondary,
              }}>
                {unlocked ? entry.icon : '???'}
              </Text>
              <Text
                numberOfLines={2}
                style={{
                  textAlign: 'center',
                  fontSize: 11,
                  fontWeight: '700',
                  color: unlocked ? theme.textPrimary : theme.textSecondary,
                }}
              >
                {unlocked ? entry.title : '???'}
              </Text>
              {!unlocked && typeof hintProgress === 'number' && (
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 10,
                    marginTop: 4,
                    color: theme.textSecondary,
                    fontStyle: 'italic',
                  }}
                >
                  Hint: %{hintProgress}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};
