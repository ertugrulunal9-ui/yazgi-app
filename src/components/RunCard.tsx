import React from 'react';
import { Text, View } from 'react-native';
import ViewShot from 'react-native-view-shot';
import type { CareerResult, Stats } from '../types';
import type { ThemeTokens } from '../utils/themeUtils';

interface RunCardProps {
  theme: ThemeTokens;
  endingTier: CareerResult['type'];
  endingTitle: string;
  summary: string;
  topMemories: string[];
  finalStats: Stats;
  gameTitle?: string;
}

const TIER_COLORS: Record<CareerResult['type'], string> = {
  FAILURE: '#ef4444',
  NORMAL: '#3b82f6',
  SUCCESS: '#22c55e',
  LEGENDARY: '#f59e0b',
};

const TIER_LABELS: Record<CareerResult['type'], string> = {
  FAILURE: 'CHALLENGE',
  NORMAL: 'STEADY',
  SUCCESS: 'SUCCESS',
  LEGENDARY: 'LEGENDARY',
};

const formatStat = (label: string, value: number): string => `${label}: ${Math.round(value)}`;

export const RunCard = React.forwardRef<ViewShot, RunCardProps>(({
  theme,
  endingTier,
  endingTitle,
  summary,
  topMemories,
  finalStats,
  gameTitle = 'Yazgi',
}, ref) => {
  const tierColor = TIER_COLORS[endingTier];
  const memories = topMemories.slice(0, 3);

  return (
    <ViewShot ref={ref} options={{ format: 'png', quality: 1, result: 'tmpfile' }}>
      <View
        style={{
          width: 320,
          height: 480,
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: `${tierColor}88`,
          backgroundColor: theme.surfaceBase,
          padding: 16,
        }}
      >
        <View
          style={{
            alignSelf: 'flex-start',
            borderRadius: 999,
            backgroundColor: `${tierColor}20`,
            borderWidth: 1,
            borderColor: `${tierColor}66`,
            paddingHorizontal: 10,
            paddingVertical: 4,
            marginBottom: 10,
          }}
        >
          <Text style={{ color: tierColor, fontSize: 11, fontWeight: '800' }}>
            {TIER_LABELS[endingTier]}
          </Text>
        </View>

        <Text
          numberOfLines={2}
          style={{
            color: theme.textPrimary,
            fontSize: 20,
            fontWeight: '800',
            marginBottom: 8,
          }}
        >
          {endingTitle}
        </Text>

        <Text
          numberOfLines={3}
          style={{
            color: theme.textSecondary,
            fontSize: 13,
            lineHeight: 18,
            marginBottom: 12,
          }}
        >
          {summary}
        </Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 12,
            backgroundColor: theme.surfaceRaised,
            padding: 10,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
            Top 3 An
          </Text>
          {memories.length > 0 ? memories.map((memory, index) => (
            <Text key={`${memory}_${index}`} numberOfLines={1} style={{ color: theme.textSecondary, fontSize: 12 }}>
              {index + 1}. {memory}
            </Text>
          )) : (
            <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Bu kosuda sakin bir hikaye vardi.</Text>
          )}
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 12,
            backgroundColor: theme.surfaceRaised,
            padding: 10,
          }}
        >
          <Text style={{ color: theme.textPrimary, fontSize: 12, fontWeight: '700', marginBottom: 6 }}>
            Final Ozeti
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            {formatStat('Health', finalStats.health)}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            {formatStat('Intelligence', finalStats.intelligence)}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            {formatStat('Charisma', finalStats.charisma)}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            {formatStat('Discipline', finalStats.discipline)}
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
            {formatStat('Money', finalStats.money)}
          </Text>
        </View>

        <View style={{ marginTop: 'auto', alignItems: 'center' }}>
          <Text style={{ color: tierColor, fontSize: 12, fontWeight: '800' }}>{gameTitle}</Text>
          <Text style={{ color: theme.textSecondary, fontSize: 11 }}>yazgi.app</Text>
        </View>
      </View>
    </ViewShot>
  );
});

RunCard.displayName = 'RunCard';

