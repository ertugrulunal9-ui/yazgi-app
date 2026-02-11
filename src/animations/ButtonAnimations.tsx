/**
 * Buton Animasyonları
 * React Native ile basit buton animasyonları
 * Performans için optimize edilmiş
 */

import React, { ReactNode } from 'react';
import { Pressable, StyleSheet, ViewStyle } from 'react-native';
import { triggerHaptic, buttonPress } from './HapticFeedback';

export type ButtonAnimationType =
  | 'pressScale'      // Basınca küçülme
  | 'ripple'          // Ripple efekti
  | 'bounce'          // Zıplama efekti
  | 'pulse'           // Nabız efekti
  | 'shake'           // Sarsma efekti
  | 'none';           // Animasyon yok

interface AnimatedButtonProps {
  children: ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  animationType?: ButtonAnimationType;
  scaleAmount?: number;
  accessibilityRole?: 'button' | 'link' | 'none';
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * Animasyonlu buton bileşeni
 * Performans için memoize edilmiş
 */
export const AnimatedButton: React.FC<AnimatedButtonProps> = React.memo(({
  children,
  onPress,
  onLongPress,
  disabled = false,
  style,
  animationType = 'pressScale',
  scaleAmount = 0.95,
  accessibilityRole,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const [scale, setScale] = React.useState(1);
  const [opacity, setOpacity] = React.useState(1);
  const [translateX, setTranslateX] = React.useState(0);
  const shakeTimersRef = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearShakeTimers = React.useCallback(() => {
    shakeTimersRef.current.forEach(clearTimeout);
    shakeTimersRef.current = [];
  }, []);

  const runShakeAnimation = React.useCallback(() => {
    clearShakeTimers();
    triggerHaptic('error');

    const sequence = [-8, 8, -6, 6, -3, 3, 0];
    sequence.forEach((value, index) => {
      const timer = setTimeout(() => {
        setTranslateX(value);
      }, index * 42);
      shakeTimersRef.current.push(timer);
    });
  }, [clearShakeTimers]);

  React.useEffect(() => () => {
    clearShakeTimers();
  }, [clearShakeTimers]);

  const handlePressIn = () => {
    if (disabled) return;
    
    // Haptic feedback
    buttonPress();
    
    switch (animationType) {
      case 'pressScale':
        setScale(scaleAmount);
        break;
      case 'bounce':
        setScale(scaleAmount);
        setTimeout(() => setScale(1), 150);
        break;
      case 'ripple':
        setOpacity(0.7);
        break;
      case 'shake':
        runShakeAnimation();
        break;
    }
  };

  const handlePressOut = () => {
    if (disabled) return;
    
    switch (animationType) {
      case 'pressScale':
      case 'bounce':
        setScale(1);
        break;
      case 'ripple':
        setOpacity(1);
        break;
      case 'shake':
        clearShakeTimers();
        setTranslateX(0);
        break;
    }
  };

  const buttonStyle: ViewStyle = {
    ...styles.button,
    ...style,
  };

  if (animationType === 'pressScale' || animationType === 'bounce') {
    buttonStyle.transform = [{ scale }];
  } else if (animationType === 'shake') {
    buttonStyle.transform = [{ translateX }];
  }
  
  if (animationType === 'ripple') {
    buttonStyle.opacity = opacity;
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={buttonStyle}
    >
      {children}
    </Pressable>
  );
});
AnimatedButton.displayName = 'AnimatedButton';

/**
 * Pulse animasyonlu buton (sürekli nabız)
 * Performans için memoize edilmiş
 */
export const PulseButton: React.FC<AnimatedButtonProps> = React.memo(({
  children,
  onPress,
  disabled = false,
  style,
}) => {
  const [scale, setScale] = React.useState(1);
  const isAnimatingRef = React.useRef(false);

  React.useEffect(() => {
    if (!disabled && !isAnimatingRef.current) {
      isAnimatingRef.current = true;
      let growing = true;
      const interval = setInterval(() => {
        setScale(growing ? 1.05 : 1);
        growing = !growing;
      }, 1000);
      return () => {
        clearInterval(interval);
        isAnimatingRef.current = false;
      };
    } else if (disabled && isAnimatingRef.current) {
      isAnimatingRef.current = false;
      setScale(1);
    }
    return undefined;
  }, [disabled]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style, { transform: [{ scale }], zIndex: 10 }]}
    >
      {children}
    </Pressable>
  );
});
PulseButton.displayName = 'PulseButton';

/**
 * Shake animasyonlu buton (hata/uyarı için)
 * Performans için memoize edilmiş
 */
export const ShakeButton: React.FC<AnimatedButtonProps & { shake?: boolean }> = React.memo(({
  children,
  onPress,
  disabled = false,
  style,
  shake = false,
}) => {
  const [translateX, setTranslateX] = React.useState(0);

  React.useEffect(() => {
    if (shake && !disabled) {
      triggerHaptic('error');
      let step = 0;
      const interval = setInterval(() => {
        step++;
        switch (step) {
          case 1:
            setTranslateX(-10);
            break;
          case 2:
            setTranslateX(10);
            break;
          case 3:
            setTranslateX(-10);
            break;
          case 4:
            setTranslateX(10);
            break;
          case 5:
            setTranslateX(0);
            clearInterval(interval);
            break;
        }
      }, 50);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [shake, disabled]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style, { transform: [{ translateX }] }]}
    >
      {children}
    </Pressable>
  );
});
ShakeButton.displayName = 'ShakeButton';

/**
 * Shimmer animasyonlu buton (parlama efekti)
 * React 18 uyumlu - basit opacity animasyonu kullanır
 */
export const ShimmerButton: React.FC<AnimatedButtonProps> = React.memo(({
  children,
  onPress,
  disabled = false,
  style,
}) => {
  const [opacity, setOpacity] = React.useState(1);
  const shimmerRef = React.useRef(false);

  React.useEffect(() => {
    if (!disabled && !shimmerRef.current) {
      shimmerRef.current = true;
      const interval = setInterval(() => {
        setOpacity(prev => prev === 1 ? 0.7 : 1);
      }, 800);
      return () => {
        clearInterval(interval);
        shimmerRef.current = false;
      };
    } else if (disabled && shimmerRef.current) {
      shimmerRef.current = false;
      setOpacity(1);
    }
    return undefined;
  }, [disabled]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, style, { opacity }]}
    >
      {children}
    </Pressable>
  );
});
ShimmerButton.displayName = 'ShimmerButton';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedButton;
