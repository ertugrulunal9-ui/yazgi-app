/**
 * İstatistik Animasyonları
 * İstatistik değişimlerini gösteren animasyonlar
 */

import React, { ReactNode, useRef } from 'react';
import { View, Text, StyleSheet, TextStyle, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { triggerHaptic, successHaptic, errorHaptic } from './HapticFeedback';

export type StatChangeType = 'increase' | 'decrease' | 'neutral';

interface FloatingNumberProps {
  value: number;
  type?: StatChangeType;
  onComplete?: () => void;
  color?: string;
}

/**
 * Yukarı süzülen sayı animasyonu (+10, -5 vb.)
 */
export const FloatingNumber: React.FC<FloatingNumberProps> = ({
  value,
  type,
  onComplete,
  color,
}) => {
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.5);

  const displayValue = value > 0 ? `+${value}` : `${value}`;
  const defaultColor =
    type === 'increase'
      ? '#34d399'
      : type === 'decrease'
      ? '#f87171'
      : value > 0
      ? '#34d399'
      : value < 0
      ? '#f87171'
      : '#9ca3af';

  const hasTriggeredHaptic = useRef(false);
  
  React.useEffect(() => {
    // Haptic feedback - sadece bir kez tetikle
    if (!hasTriggeredHaptic.current) {
      if (value > 0) {
        successHaptic();
      } else if (value < 0) {
        errorHaptic();
      }
      hasTriggeredHaptic.current = true;
    }

    // Animasyon başlat
    translateY.value = withTiming(-50, { duration: 1000, easing: Easing.out(Easing.ease) });
    opacity.value = withTiming(0, { duration: 1000 });
    scale.value = withSequence(
      withSpring(1.2, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 400 })
    );

    // Tamamlama callback
    const timer = setTimeout(() => {
      onComplete?.();
    }, 1000);

    return () => {
      clearTimeout(timer);
      hasTriggeredHaptic.current = false;
    };
  }, [value]);

  const animatedStyle = useAnimatedStyle(() => {
    const transformArray: any[] = [];
    transformArray.push({ translateY: translateY.value });
    transformArray.push({ scale: scale.value });
    return {
      transform: transformArray,
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[styles.floatingNumber, animatedStyle]}>
      <Text style={[styles.floatingText, { color: color || defaultColor }]}>
        {displayValue}
      </Text>
    </Animated.View>
  );
};

interface AnimatedStatBarProps {
  value: number;
  maxValue: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  showLabel?: boolean;
  label?: string;
}

/**
 * Animasyonlu stat bar
 */
export const AnimatedStatBar: React.FC<AnimatedStatBarProps> = ({
  value,
  maxValue,
  color = '#3b82f6',
  backgroundColor = '#374151',
  height = 8,
  showLabel = false,
  label,
}) => {
  const width = useSharedValue(0);

  React.useEffect(() => {
    width.value = withSpring((value / maxValue) * 100, {
      damping: 15,
      stiffness: 100,
    });
  }, [value, maxValue]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.statBarContainer}>
      {showLabel && label && (
        <Text style={styles.statLabel}>{label}</Text>
      )}
      <View style={[styles.statBarBackground, { height, backgroundColor }]}>
        <Animated.View
          style={[
            styles.statBarFill,
            { backgroundColor: color },
            animatedStyle,
          ]}
        />
      </View>
      {showLabel && (
        <Text style={styles.statValue}>{Math.round(value)}</Text>
      )}
    </View>
  );
};

interface CountUpTextProps {
  value: number;
  duration?: number;
  style?: TextStyle;
  prefix?: string;
  suffix?: string;
}

/**
 * Sayı yukarı sayma animasyonu
 * Performans için optimize edilmiş versiyon
 */
export const CountUpText: React.FC<CountUpTextProps> = React.memo(({
  value,
  duration = 1000,
  style,
  prefix = '',
  suffix = '',
}) => {
  const animatedValue = useSharedValue(0);
  const prevValueRef = useRef(value);

  React.useEffect(() => {
    // Değer değiştiğinde animasyonu başlat
    if (prevValueRef.current !== value) {
      animatedValue.value = withTiming(value, { duration });
      prevValueRef.current = value;
    }
  }, [value, duration]);

  return (
    <Animated.Text style={style}>
      {prefix}{Math.round(animatedValue.value)}{suffix}
    </Animated.Text>
  );
}, (prevProps, nextProps) => {
  // Memoization için özel karşılaştırma
  return prevProps.value === nextProps.value &&
         prevProps.duration === nextProps.duration &&
         prevProps.prefix === nextProps.prefix &&
         prevProps.suffix === nextProps.suffix;
});

interface StatChangeIndicatorProps {
  oldValue: number;
  newValue: number;
  style?: TextStyle;
  showArrow?: boolean;
}

/**
 * İstatistik değişim göstergesi (yeşil ok yukarı, kırmızı ok aşağı)
 * Performans için memoize edilmiş
 */
export const StatChangeIndicator: React.FC<StatChangeIndicatorProps> = React.memo(({
  oldValue,
  newValue,
  style,
  showArrow = true,
}) => {
  const change = newValue - oldValue;
  const isIncrease = change > 0;
  const isDecrease = change < 0;
  const color = isIncrease ? '#34d399' : isDecrease ? '#f87171' : '#9ca3af';
  const arrow = isIncrease ? '↑' : isDecrease ? '↓' : '→';

  return (
    <Text style={[styles.changeIndicator, { color }, style]}>
      {showArrow && `${arrow} `}
      {change !== 0 && Math.abs(change)}
    </Text>
  );
}, (prevProps, nextProps) => {
  return prevProps.oldValue === nextProps.oldValue &&
         prevProps.newValue === nextProps.newValue;
});

interface FlashTextProps {
  children: ReactNode;
  flash?: boolean;
  color?: string;
  style?: TextStyle;
}

/**
 * Flash efekti (önemli değişim vurgusu)
 * Performans için memoize edilmiş
 */
export const FlashText: React.FC<FlashTextProps> = React.memo(({
  children,
  flash = false,
  color = '#fbbf24',
  style,
}) => {
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (flash) {
      triggerHaptic('success');
      opacity.value = withSequence(
        withTiming(0.5, { duration: 100 }),
        withTiming(1, { duration: 100 }),
        withTiming(0.5, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
      scale.value = withSequence(
        withSpring(1.1, { damping: 15, stiffness: 400 }),
        withSpring(1, { damping: 15, stiffness: 400 })
      );
    }
  }, [flash]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
    color: flash ? color : undefined,
  }));

  return (
    <Animated.Text style={[style, animatedStyle]}>
      {children}
    </Animated.Text>
  );
}, (prevProps, nextProps) => {
  return prevProps.flash === nextProps.flash &&
         prevProps.color === nextProps.color &&
         prevProps.children === nextProps.children;
});

const styles = StyleSheet.create({
  floatingNumber: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  floatingText: {
    fontSize: 20,
    fontWeight: 'bold',
    ...Platform.select({
      web: {
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
      },
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.8)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
      },
    }),
  },
  statBarContainer: {
    width: '100%',
    marginBottom: 4,
  },
  statBarBackground: {
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 2,
  },
  changeIndicator: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default FloatingNumber;
