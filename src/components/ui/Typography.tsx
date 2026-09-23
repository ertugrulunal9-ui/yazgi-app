import React from 'react';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { useUI } from '../../context/UIContext';

type TypographyVariant = 'h1' | 'h2' | 'body' | 'caption' | 'label';
type TypographyTone = 'primary' | 'secondary' | 'accent' | 'success' | 'danger';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  variant?: TypographyVariant;
  tone?: TypographyTone;
  style?: StyleProp<TextStyle>;
  allowFontScaling?: boolean;
}

const BASE_STYLES: Record<TypographyVariant, TextStyle> = {
  h1: { fontSize: 28, fontWeight: '800', lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18, letterSpacing: 0.2 },
};

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  tone = 'primary',
  style,
  allowFontScaling = true,
  ...rest
}) => {
  const { theme, metrics } = useUI();

  const toneColor: Record<TypographyTone, string> = {
    primary: theme.textPrimary,
    secondary: theme.textSecondary,
    accent: theme.accentEvent,
    success: theme.accentGrade,
    danger: '#ef4444',
  };

  const variantStyle = BASE_STYLES[variant];
  const scale = metrics.font / 15;
  const isHeading = variant === 'h1' || variant === 'h2';
  const fontFamily = isHeading ? theme.fontHeading : theme.fontBody;

  return (
    <Text
      allowFontScaling={allowFontScaling}
      style={[
        styles.base,
        {
          color: toneColor[tone],
          fontSize: Math.round((variantStyle.fontSize ?? 15) * scale),
          lineHeight: Math.round((variantStyle.lineHeight ?? 22) * scale),
          fontWeight: variantStyle.fontWeight,
          fontFamily,
          letterSpacing: variantStyle.letterSpacing,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
