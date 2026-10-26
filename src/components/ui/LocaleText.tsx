/**
 * React Native `Text` yerine kullanılabilen ince sarmalayıcı: stilde
 * `textTransform: 'uppercase'` varsa metni oyun diline göre kendisi büyütür
 * (Türkçede "i" → "İ"); diğer durumlarda `Text` ile birebir aynıdır.
 */

import React from 'react';
import { StyleSheet, Text as RNText, TextProps } from 'react-native';
import { toUpperLocale } from '../../utils/localeText';

const upperChildren = (children: React.ReactNode): React.ReactNode => React.Children.map(
  children,
  child => (typeof child === 'string' ? toUpperLocale(child) : child)
);

export const Text = React.forwardRef<RNText, TextProps>(({ style, children, ...rest }, ref) => {
  const flat = StyleSheet.flatten(style);
  if (flat?.textTransform !== 'uppercase') {
    return <RNText ref={ref} style={style} {...rest}>{children}</RNText>;
  }
  return (
    <RNText ref={ref} style={[style, { textTransform: 'none' }]} {...rest}>
      {upperChildren(children)}
    </RNText>
  );
});

Text.displayName = 'LocaleText';
