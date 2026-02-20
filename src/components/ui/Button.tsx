import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { useUI } from '../../context/UIContext';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label?: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  accessibilityRole = 'button',
  ...rest
}) => {
  const { theme, metrics } = useUI();
  const isDisabled = disabled || loading;

  const colors = useMemo(() => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.surfaceBase,
          borderColor: theme.border,
          textColor: theme.textPrimary,
        };
      case 'danger':
        return {
          backgroundColor: '#ef4444',
          borderColor: '#ef4444',
          textColor: '#ffffff',
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.border,
          textColor: theme.textSecondary,
        };
      case 'primary':
      default:
        return {
          backgroundColor: theme.accentEvent,
          borderColor: theme.accentEvent,
          textColor: '#ffffff',
        };
    }
  }, [theme, variant]);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={isDisabled}
      accessibilityRole={accessibilityRole}
      style={[
        styles.base,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
          opacity: isDisabled ? 0.6 : 1,
          minHeight: Math.max(46, metrics.pad * 2.8),
          paddingHorizontal: Math.max(14, metrics.pad * 1.1),
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.textColor} />
      ) : (
        <Text
          allowFontScaling
          style={[
            styles.text,
            {
              color: colors.textColor,
              fontSize: Math.max(13, metrics.font),
            },
            textStyle,
          ]}
        >
          {label ?? children}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontWeight: '700',
    textAlign: 'center',
  },
});
