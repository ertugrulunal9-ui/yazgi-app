import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getTraitName } from '../data/traits';
import { traitGainHaptic } from '../animations/HapticFeedback';

interface ThemeTokens {
  textPrimary: string;
  textSecondary: string;
  surfaceRaised: string;
  border: string;
  accentEvent: string;
}

interface TraitProgressChipProps {
  traits: string[];
  theme: ThemeTokens;
}

const formatTraitList = (traitIds: string[]): string => {
  const names = traitIds.map(getTraitName);
  if (names.length <= 2) {
    return names.join(', ');
  }
  const [first, second, ...rest] = names;
  return `${first}, ${second} +${rest.length}`;
};

export const TraitProgressChip: React.FC<TraitProgressChipProps> = ({ traits, theme }) => {
  useEffect(() => {
    if (traits && traits.length > 0) {
      traitGainHaptic();
    }
  }, [traits]);

  if (!traits || traits.length === 0) return null;

  const label = formatTraitList(traits);

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: theme.surfaceRaised,
          borderColor: theme.accentEvent,
        },
      ]}
    >
      <Text style={[styles.icon, { color: theme.accentEvent }]}>✨</Text>
      <Text style={[styles.text, { color: theme.textPrimary }]}>
        Özellik ilerledi: {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    fontSize: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default TraitProgressChip;
