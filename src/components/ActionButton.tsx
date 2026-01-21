import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
import { AnimatedButton, type ButtonAnimationType } from '../animations/ButtonAnimations';

interface ActionButtonProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  animationType?: ButtonAnimationType;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  title,
  subtitle,
  onPress,
  disabled = false,
  theme,
  metrics,
  animationType = 'pressScale',
}) => {
  return (
    <AnimatedButton
      onPress={onPress}
      disabled={disabled}
      animationType={animationType}
      style={{
        backgroundColor: disabled ? theme.surfaceOverlay : theme.surfaceBase,
        padding: metrics.pad,
        borderRadius: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: theme.border,
        opacity: disabled ? 0.6 : 1,
        width: '100%',
      }}
    >
      <Text
        style={{
          color: theme.textPrimary,
          fontWeight: '700',
          fontSize: metrics.font,
          lineHeight: Math.round(metrics.font * 1.45),
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: Math.max(11, metrics.font - 2),
            marginTop: 4,
            lineHeight: Math.round(metrics.font * 1.45),
          }}
        >
          {subtitle}
        </Text>
      ) : null}
    </AnimatedButton>
  );
};
