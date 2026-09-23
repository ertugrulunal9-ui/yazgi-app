import React from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { useUI } from '../../context/UIContext';

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'danger';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  style,
  textStyle,
}) => {
  const { theme } = useUI();

  const palette: Record<BadgeVariant, { bg: string; border: string; text: string }> = {
    neutral: { bg: theme.surfaceOverlay, border: theme.border, text: theme.textSecondary },
    accent: { bg: `${theme.accentEvent}20`, border: theme.accentEvent, text: theme.accentEvent },
    success: { bg: `${theme.accentGrade}20`, border: theme.accentGrade, text: theme.accentGrade },
    warning: { bg: 'rgba(245, 158, 11, 0.2)', border: '#f59e0b', text: '#f59e0b' },
    danger: { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#ef4444' },
  };

  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: palette[variant].bg,
          borderColor: palette[variant].border,
        },
        style,
      ]}
    >
      <Text
        allowFontScaling
        style={[
          styles.text,
          {
            color: palette[variant].text,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
