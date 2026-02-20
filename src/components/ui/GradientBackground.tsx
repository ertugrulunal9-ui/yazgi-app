import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { GRADIENT_PRESETS, GradientPreset } from '../../constants/themeColors';

interface GradientBackgroundProps {
  preset: GradientPreset;
  themeMode?: 'dark' | 'light';
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  preset,
  themeMode = 'dark',
  style,
  children,
}) => {
  const colors = GRADIENT_PRESETS[themeMode][preset];
  const backgroundColor = colors[0];

  return (
    <View style={[styles.fill, { backgroundColor }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
