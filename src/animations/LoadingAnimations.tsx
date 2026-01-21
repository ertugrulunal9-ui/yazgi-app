/**
 * Loading Animasyonları
 * Yükleme durumlarını gösteren animasyonlar
 * Performans için optimize edilmiş
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

export type LoadingType = 
  | 'spinner'       // Dönen spinner
  | 'pulse'         // Nabız efekti
  | 'dots'          // Zıplayan noktalar
  | 'bars'          // Dönen çubuklar
  | 'skeleton'      // İskelet yükleme
  | 'bounce';        // Zıplayan top

interface LoadingSpinnerProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

/**
 * Dönen spinner animasyonu
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(({
  size = 40,
  color = '#3b82f6',
  style,
}) => {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.spinner,
          { width: size, height: size, borderColor: color },
          animatedStyle,
        ]}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.size === nextProps.size && prevProps.color === nextProps.color;
});

/**
 * Nabız efekti (pulse)
 */
export const PulseLoader: React.FC<LoadingSpinnerProps> = React.memo(({
  size = 40,
  color = '#3b82f6',
  style,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.5);

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.pulse,
          { width: size, height: size, backgroundColor: color },
          animatedStyle,
        ]}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.size === nextProps.size && prevProps.color === nextProps.color;
});

/**
 * Zıplayan noktalar animasyonu
 */
export const DotsLoader: React.FC<LoadingSpinnerProps> = React.memo(({
  size = 10,
  color = '#3b82f6',
  style,
}) => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  React.useEffect(() => {
    dot1.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    dot2.value = withRepeat(
      withDelay(
        200,
        withSequence(
          withTiming(-10, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
        )
      ),
      -1,
      false
    );
    dot3.value = withRepeat(
      withDelay(
        400,
        withSequence(
          withTiming(-10, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
        )
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2.value }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3.value }],
  }));

  return (
    <View style={[styles.dotsContainer, style]}>
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, backgroundColor: color },
          animatedStyle1,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, backgroundColor: color },
          animatedStyle2,
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { width: size, height: size, backgroundColor: color },
          animatedStyle3,
        ]}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.size === nextProps.size && prevProps.color === nextProps.color;
});

/**
 * Dönen çubuklar animasyonu
 */
export const BarsLoader: React.FC<LoadingSpinnerProps> = React.memo(({
  size = 40,
  color = '#3b82f6',
  style,
}) => {
  const bar1 = useSharedValue(0);
  const bar2 = useSharedValue(0);
  const bar3 = useSharedValue(0);

  React.useEffect(() => {
    bar1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    bar2.value = withRepeat(
      withDelay(
        200,
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
        )
      ),
      -1,
      false
    );
    bar3.value = withRepeat(
      withDelay(
        400,
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.3, { duration: 400, easing: Easing.inOut(Easing.ease) })
        )
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle1 = useAnimatedStyle(() => ({
    opacity: bar1.value,
    transform: [{ scaleY: bar1.value }],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    opacity: bar2.value,
    transform: [{ scaleY: bar2.value }],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    opacity: bar3.value,
    transform: [{ scaleY: bar3.value }],
  }));

  return (
    <View style={[styles.barsContainer, style]}>
      <Animated.View
        style={[
          styles.bar,
          { width: size / 4, height: size, backgroundColor: color },
          animatedStyle1,
        ]}
      />
      <Animated.View
        style={[
          styles.bar,
          { width: size / 4, height: size, backgroundColor: color },
          animatedStyle2,
        ]}
      />
      <Animated.View
        style={[
          styles.bar,
          { width: size / 4, height: size, backgroundColor: color },
          animatedStyle3,
        ]}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.size === nextProps.size && prevProps.color === nextProps.color;
});

/**
 * İskelet yükleme animasyonu
 */
export const SkeletonLoader: React.FC<{
  width?: number;
  height?: number;
  style?: ViewStyle;
}> = React.memo(({
  width = 100,
  height = 20,
  style,
}) => {
  const opacity = useSharedValue(0.5);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, backgroundColor: '#374151' },
        animatedStyle,
        style,
      ]}
    />
  );
}, (prevProps, nextProps) => {
  return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
});

/**
 * Zıplayan top animasyonu
 */
export const BounceLoader: React.FC<LoadingSpinnerProps> = React.memo(({
  size = 40,
  color = '#3b82f6',
  style,
}) => {
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  React.useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-20, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 400, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const transformArray: any[] = [];
    transformArray.push({ translateY: translateY.value });
    transformArray.push({ scale: scale.value });
    return {
      transform: transformArray,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.bounce,
          { width: size, height: size, backgroundColor: color, borderRadius: size / 2 },
          animatedStyle,
        ]}
      />
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.size === nextProps.size && prevProps.color === nextProps.color;
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    borderWidth: 3,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderRadius: 999,
  },
  pulse: {
    borderRadius: 999,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    borderRadius: 999,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bar: {
    borderRadius: 2,
  },
  skeleton: {
    borderRadius: 4,
  },
  bounce: {
    borderRadius: 999,
  },
});

export default LoadingSpinner;
