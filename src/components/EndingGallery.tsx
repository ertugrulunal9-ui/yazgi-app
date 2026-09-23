import React, { useMemo, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { tRuntime } from '../i18n/strings';
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

const TIER_BADGE_COLOR: Record<string, string> = {
  LEGENDARY: '#f59e0b',
  SUCCESS: '#22c55e',
  NORMAL: '#3b82f6',
  FAILURE: '#ef4444',
};

const formatRunDate = (ts: number): string => {
  const d = new Date(ts);
  return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
};

export const EndingGallery: React.FC<EndingGalleryProps> = ({ meta, theme, metrics, hints = [] }) => {
  const [activeTab, setActiveTab] = useState<'collection' | 'runs'>('collection');

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

  const recentRuns = meta?.recentRuns ?? [];

  return (
    <View style={{
      backgroundColor: theme.surfaceBase,
      borderRadius: 14,
      padding: metrics.pad,
      borderWidth: 1,
      borderColor: theme.border,
    }}>
      <Text style={{ color: theme.textPrimary, fontWeight: '800', fontSize: metrics.font + 1, marginBottom: 10 }}>
        {tRuntime('app.tabLives')}
      </Text>

      {/* Tab Switcher */}
      <View style={{ flexDirection: 'row', marginBottom: 12, gap: 8 }}>
        {(['collection', 'runs'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={{
              flex: 1,
              paddingVertical: 7,
              borderRadius: 8,
              alignItems: 'center',
              backgroundColor: activeTab === tab ? theme.accentBrand : theme.surfaceOverlay,
              borderWidth: 1,
              borderColor: activeTab === tab ? theme.accentBrand : theme.border,
            }}
          >
            <Text style={{ color: activeTab === tab ? '#fff' : theme.textSecondary, fontSize: 12, fontWeight: '700' }}>
              {tab === 'collection'
                ? tRuntime('endings.gallery.collectionTab', {
                  discovered: discoveredCount,
                  total: TOTAL_ENDING_COUNT,
                })
                : tRuntime('endings.gallery.runsTab', { count: recentRuns.length })}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Collection Tab */}
      {activeTab === 'collection' && (
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
                <Text style={{ fontSize: 20, marginBottom: 5, color: unlocked ? accent : theme.textSecondary }}>
                  {unlocked ? entry.icon : '???'}
                </Text>
                <Text numberOfLines={2} style={{ textAlign: 'center', fontSize: 11, fontWeight: '700', color: unlocked ? theme.textPrimary : theme.textSecondary }}>
                  {unlocked ? entry.title : '???'}
                </Text>
                {!unlocked && typeof hintProgress === 'number' && (
                  <Text style={{ textAlign: 'center', fontSize: 10, marginTop: 4, color: theme.textSecondary, fontStyle: 'italic' }}>
                    %{hintProgress}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      )}

      {/* Past Runs Tab */}
      {activeTab === 'runs' && (
        <View>
          {recentRuns.length === 0 ? (
            <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', paddingVertical: 20 }}>
              {tRuntime('endings.gallery.emptyRuns')}
            </Text>
          ) : (
            recentRuns.slice().reverse().map((run, i) => {
              const tierColor = TIER_BADGE_COLOR[run.tier] ?? '#9ca3af';
              const endingIcon = ENDING_ID_LOOKUP[run.endingId]?.icon ?? '';
              return (
                <View
                  key={`${run.runId}_${i}`}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: i < recentRuns.length - 1 ? 1 : 0,
                    borderBottomColor: theme.border,
                    gap: 10,
                  }}
                >
                  <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: `${tierColor}22`, borderWidth: 1, borderColor: `${tierColor}66`, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 18 }}>{endingIcon || '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 13 }}>
                      {run.endingTitle}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 1 }}>
                      {tRuntime('endings.gallery.runSummary', {
                        age: run.age,
                        compatibility: Math.round(run.compatibilityScore),
                        date: formatRunDate(run.endedAt),
                      })}
                    </Text>
                  </View>
                  <View style={{ paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, backgroundColor: `${tierColor}22`, borderWidth: 1, borderColor: `${tierColor}66` }}>
                    <Text style={{ color: tierColor, fontSize: 10, fontWeight: '800' }}>{run.tier}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
};
