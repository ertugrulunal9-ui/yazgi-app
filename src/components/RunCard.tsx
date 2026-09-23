import React from 'react';
import { Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import type { CareerResult, Stats } from '../types';
import type { ThemeTokens } from '../utils/themeUtils';
import { tRuntime } from '../i18n/strings';

interface RunCardProps {
  theme: ThemeTokens;
  endingTier: CareerResult['type'];
  endingTitle: string;
  summary: string;
  topMemories: string[];
  finalStats: Stats;
  gameTitle?: string;
  endingEmoji?: string;
  finalScore?: number;
  goalLabel?: string;
}

const TIER_COLORS: Record<CareerResult['type'], string> = {
  FAILURE: '#ef4444',
  NORMAL: '#3b82f6',
  SUCCESS: '#22c55e',
  LEGENDARY: '#f59e0b',
};

const STAT_BAR_COLOR: Record<string, string> = {
  health: '#22c55e',
  intelligence: '#3b82f6',
  charisma: '#a855f7',
  discipline: '#f59e0b',
  money: '#10b981',
};

const CORE_STATS: (keyof Stats)[] = ['health', 'intelligence', 'charisma', 'discipline', 'money'];

export const RunCard = React.forwardRef<ViewShot, RunCardProps>(({
  theme,
  endingTier,
  endingTitle,
  summary,
  topMemories,
  finalStats,
  gameTitle = 'Yazgi',
  endingEmoji,
  finalScore,
  goalLabel,
}, ref) => {
  const tierColor = TIER_COLORS[endingTier];
  const memories = topMemories.slice(0, 3);
  const tierLabel = tRuntime(`endings.tiers.${endingTier}`, undefined, endingTier);
  const statLabels: Record<string, string> = {
    health: tRuntime('labels.stats.health', undefined, 'Health'),
    intelligence: tRuntime('labels.stats.intelligence', undefined, 'Intelligence'),
    charisma: tRuntime('labels.stats.charisma', undefined, 'Charisma'),
    discipline: tRuntime('labels.stats.discipline', undefined, 'Discipline'),
    money: tRuntime('labels.stats.money', undefined, 'Money'),
  };
  const labelKeyMoments = tRuntime('endings.shareCard.keyMoments');
  const labelFinalStatus = tRuntime('endings.shareCard.finalStatus');
  const labelScore = tRuntime('endings.shareCard.pointsAbbr');

  return (
    <ViewShot ref={ref} options={{ format: 'png', quality: 1, result: 'tmpfile' }}>
      <View
        style={{
          width: 320,
          height: 500,
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: `${tierColor}66`,
          backgroundColor: theme.surfaceBase,
        }}
      >
        {/* Üst renk bandı */}
        <View style={{ height: 5, backgroundColor: tierColor }} />

        <View style={{ flex: 1, padding: 16 }}>
          {/* Üst başlık satırı */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <View style={{
              borderRadius: 999,
              backgroundColor: `${tierColor}20`,
              borderWidth: 1,
              borderColor: `${tierColor}55`,
              paddingHorizontal: 10,
              paddingVertical: 3,
            }}>
              <Text style={{ color: tierColor, fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>
                {tierLabel}
              </Text>
            </View>
            {finalScore != null && (
              <Text style={{ color: tierColor, fontSize: 13, fontWeight: '800' }}>
                {Math.round(finalScore)} {labelScore}
              </Text>
            )}
          </View>

          {/* Başlık + emoji */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
            {endingEmoji ? (
              <Text style={{ fontSize: 28, lineHeight: 34 }}>{endingEmoji}</Text>
            ) : null}
            <Text
              numberOfLines={2}
              style={{
                flex: 1,
                color: theme.textPrimary,
                fontSize: 18,
                fontWeight: '800',
                lineHeight: 24,
              }}
            >
              {endingTitle}
            </Text>
          </View>

          {goalLabel && (
            <Text style={{ color: tierColor, fontSize: 11, fontWeight: '600', marginBottom: 6, opacity: 0.85 }}>
              {goalLabel}
            </Text>
          )}

          {/* Özet */}
          <Text
            numberOfLines={2}
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              lineHeight: 17,
              marginBottom: 12,
            }}
          >
            {summary}
          </Text>

          {/* Anılar */}
          {memories.length > 0 && (
            <View style={{
              borderRadius: 10,
              backgroundColor: theme.surfaceRaised,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 9,
              marginBottom: 10,
            }}>
              <Text style={{ color: theme.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 5 }}>
                {labelKeyMoments}
              </Text>
              {memories.map((memory, index) => (
                <View key={`${memory}_${index}`} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: index < memories.length - 1 ? 3 : 0 }}>
                  <Text style={{ color: tierColor, fontSize: 9, marginRight: 4 }}>{index === 0 ? '★' : '·'}</Text>
                  <Text numberOfLines={1} style={{ color: theme.textSecondary, fontSize: 11, flex: 1 }}>
                    {memory}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Stat barları */}
          <View style={{
            borderRadius: 10,
            backgroundColor: theme.surfaceRaised,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 9,
            marginBottom: 10,
          }}>
            <Text style={{ color: theme.textSecondary, fontSize: 9, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 7 }}>
              {labelFinalStatus}
            </Text>
            {CORE_STATS.map(key => {
              const val = Math.min(100, Math.max(0, finalStats[key] ?? 0));
              const barColor = STAT_BAR_COLOR[key] ?? '#9ca3af';
              return (
                <View key={key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
                  <Text style={{ color: theme.textSecondary, fontSize: 10, width: 54 }}>
                    {statLabels[key]}
                  </Text>
                  <View style={{ flex: 1, height: 5, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden', marginHorizontal: 6 }}>
                    <View style={{ height: '100%', width: `${val}%`, backgroundColor: barColor, borderRadius: 3 }} />
                  </View>
                  <Text style={{ color: theme.textSecondary, fontSize: 10, width: 24, textAlign: 'right' }}>
                    {Math.round(val)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Footer */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: tierColor, fontSize: 11, fontWeight: '800' }}>{gameTitle}</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 10 }}>yazgi.app</Text>
          </View>
        </View>
      </View>
    </ViewShot>
  );
});

RunCard.displayName = 'RunCard';
