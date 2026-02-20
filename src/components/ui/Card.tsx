import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useUI } from '../../context/UIContext';

export type CardVariant = 'surface' | 'raised' | 'overlay';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'surface',
  style,
  padded = true,
}) => {
  const { theme, metrics } = useUI();

  const backgroundColor = {
    surface: theme.surfaceBase,
    raised: theme.surfaceRaised,
    overlay: theme.surfaceOverlay,
  }[variant];

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor,
          borderColor: theme.border,
          padding: padded ? metrics.pad : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    borderWidth: 1,
  },
});
