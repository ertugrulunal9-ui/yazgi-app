import React from 'react';
import { Text, View } from 'react-native';
import { getTrait, getTraitName } from '../data/traits';
import { tRuntime } from '../i18n/strings';
import { TraitProgressData, TraitType } from '../types';
import { ensureTextContrast } from '../utils/colorContrast';

interface ThemeTokens {
  textPrimary: string;
  textSecondary: string;
  surfaceOverlay: string;
  border: string;
  surfaceBase: string;
  accentEvent: string;
}

interface TraitProgressPanelProps {
  traitProgress: Record<string, TraitProgressData>;
  theme: ThemeTokens;
}

const getTraitTypeColor = (traitType: TraitType | undefined, theme: ThemeTokens): string => {
  switch (traitType) {
    case 'POSITIVE':
      return ensureTextContrast('#15803d', theme.surfaceBase, 4.5);
    case 'NEGATIVE':
      return ensureTextContrast('#b91c1c', theme.surfaceBase, 4.5);
    default:
      return ensureTextContrast(theme.accentEvent, theme.surfaceBase, 4.5);
  }
};

const clampPercent = (value: number): number => Math.max(0, Math.min(100, value));

export const TraitProgressPanel: React.FC<TraitProgressPanelProps> = ({
  traitProgress,
  theme,
}) => {
  const entries = Object.entries(traitProgress)
    .map(([traitId, progress]) => {
      const safeRequired = Math.max(1, progress.required);
      const safePoints = Math.max(0, progress.points);
      const percentage = clampPercent((safePoints / safeRequired) * 100);
      const trait = getTrait(traitId);

      return {
        traitId,
        traitType: trait?.type,
        points: safePoints,
        required: safeRequired,
        percentage,
        isLocked: progress.isLocked,
      };
    })
    .sort((a, b) => b.percentage - a.percentage || a.traitId.localeCompare(b.traitId));

  if (entries.length === 0) {
    return (
      <Text style={{ color: theme.textSecondary, fontSize: 12, fontStyle: 'italic' }}>
        {tRuntime('traits.progress.empty', undefined, 'Henuz takip edilen bir ozellik formasyonu yok.')}
      </Text>
    );
  }

  return (
    <View style={{ gap: 10 }}>
      {entries.map((entry) => {
        const barColor = getTraitTypeColor(entry.traitType, theme);
        const isNearComplete = !entry.isLocked && entry.percentage >= 80 && entry.points < entry.required;

        return (
          <View
            key={entry.traitId}
            style={{
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              padding: 10,
              backgroundColor: theme.surfaceOverlay,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 12, flexShrink: 1, paddingRight: 8 }}>
                {getTraitName(entry.traitId)}
              </Text>
              <Text style={{ color: barColor, fontWeight: '700', fontSize: 12 }}>
                {Math.round(entry.points)}/{entry.required}
              </Text>
            </View>

            <View
              style={{
                height: 7,
                borderRadius: 999,
                backgroundColor: theme.surfaceBase,
                overflow: 'hidden',
              }}
            >
              <View
                testID={`trait-progress-fill-${entry.traitId}`}
                style={{
                  width: `${entry.percentage}%`,
                  height: '100%',
                  borderRadius: 999,
                  backgroundColor: barColor,
                }}
              />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                %{Math.round(entry.percentage)}
              </Text>
              {entry.isLocked ? (
                <Text
                  testID={`trait-progress-status-${entry.traitId}`}
                  style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '700' }}
                >
                  {tRuntime('traits.progress.locked', undefined, 'Kilitli')}
                </Text>
              ) : isNearComplete ? (
                <Text
                  testID={`trait-progress-status-${entry.traitId}`}
                  style={{ color: barColor, fontSize: 11, fontWeight: '700' }}
                >
                  {tRuntime('traits.progress.nearComplete', undefined, 'Tamamlanmaya yakin')}
                </Text>
              ) : (
                <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                  {entry.traitType ?? 'NEUTRAL'}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default TraitProgressPanel;
