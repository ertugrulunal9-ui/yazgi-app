import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useUI } from '../../context/UIContext';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  showValue?: boolean;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color,
  showValue = false,
  label,
  style,
}) => {
  const { theme } = useUI();
  const ratio = max <= 0 ? 0 : Math.max(0, Math.min(1, value / max));

  return (
    <View style={style}>
      {(label || showValue) && (
        <View style={styles.header}>
          {label ? (
            <Text allowFontScaling style={[styles.label, { color: theme.textSecondary }]}>
              {label}
            </Text>
          ) : null}
          {showValue ? (
            <Text allowFontScaling style={[styles.value, { color: theme.textSecondary }]}>
              {Math.round(value)}/{Math.round(max)}
            </Text>
          ) : null}
        </View>
      )}

      <View style={[styles.track, { backgroundColor: theme.surfaceOverlay, borderColor: theme.border }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${ratio * 100}%`,
              backgroundColor: color || theme.accentStat,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});
