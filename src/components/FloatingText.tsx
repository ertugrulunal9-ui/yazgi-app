import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { FloatingText as FloatingTextType } from '../types';
import { selectionHaptic } from '../animations/HapticFeedback';

interface Props {
  texts: FloatingTextType[];
  onTextComplete?: (id: number) => void;
}

/**
 * FloatingText - React Native Version with Reanimated
 * 
 * Displays animated floating text that rises up and fades out.
 * Supports multiple animation types: arcadeFloat, bounce, curve.
 * 
 * Animation Types:
 * - arcadeFloat: Classic arcade-style (scale punch + linear float)
 * - bounce: Bouncy elastic float
 * - curve: Curved bezier path
 * 
 * Usage:
 * ```tsx
 * // In GameContext or component state
 * const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
 * 
 * // Trigger a floating text
 * const addFloatingText = (text: string, x: number, y: number, color: string) => {
 *   setFloatingTexts(prev => [...prev, {
 *     id: Date.now(),
 *     text,
 *     x,
 *     y,
 *     color,
 *     animationType: 'arcadeFloat', // or 'bounce', 'curve'
 *     duration: 2000
 *   }]);
 * };
 * 
 * // Remove completed text (auto-called by component)
 * const removeFloatingText = (id: number) => {
 *   setFloatingTexts(prev => prev.filter(t => t.id !== id));
 * };
 * 
 * // Render
 * <FloatingText texts={floatingTexts} onTextComplete={removeFloatingText} />
 * ```
 */
export const FloatingText: React.FC<Props> = ({ texts, onTextComplete }) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {texts.map((text, index) => (
        <FloatingTextItem key={`${text.id}-${index}`} item={text} onComplete={onTextComplete} />
      ))}
    </View>
  );
};

interface FloatingTextItemProps {
  item: FloatingTextType;
  onComplete?: (id: number) => void;
}

const FloatingTextItem: React.FC<FloatingTextItemProps> = ({ item, onComplete }) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0.5);

  const animationType = item.animationType || 'arcadeFloat';
  const duration = item.duration || 2000;

  const animateArcadeFloat = useCallback(() => {
    // Classic arcade-style floating animation sequence
    const fadeInDuration = duration * 0.15; // 15%
    const sustainDuration = duration * 0.4; // 40%
    const fadeOutDuration = duration * 0.3; // 30%

    opacity.value = withSequence(
      withTiming(1, { duration: fadeInDuration, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: sustainDuration }),
      withTiming(0, {
        duration: fadeOutDuration,
        easing: Easing.in(Easing.quad)
      }, (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)(item.id);
        }
      })
    );

    translateY.value = withSequence(
      withTiming(-25, { duration: fadeInDuration, easing: Easing.out(Easing.cubic) }),
      withTiming(-35, { duration: fadeInDuration, easing: Easing.inOut(Easing.quad) }),
      withTiming(-80, { duration: sustainDuration, easing: Easing.linear }),
      withTiming(-120, { duration: fadeOutDuration, easing: Easing.in(Easing.quad) })
    );

    scale.value = withSequence(
      withTiming(1.3, { duration: fadeInDuration, easing: Easing.out(Easing.back(1.5)) }),
      withTiming(1.0, { duration: fadeInDuration, easing: Easing.out(Easing.quad) })
    );
  }, [duration, item.id, onComplete, opacity, scale, translateY]);

  const animateBounce = useCallback(() => {
    // Bouncy elastic float
    const totalDuration = duration;

    opacity.value = withSequence(
      withTiming(1, { duration: totalDuration * 0.1, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: totalDuration * 0.6 }),
      withTiming(0, {
        duration: totalDuration * 0.3,
        easing: Easing.in(Easing.quad)
      }, (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)(item.id);
        }
      })
    );

    translateY.value = withTiming(-100, {
      duration: totalDuration,
      easing: Easing.out(Easing.elastic(1.2)),
    });

    scale.value = withSequence(
      withTiming(1.4, {
        duration: totalDuration * 0.15,
        easing: Easing.out(Easing.back(2))
      }),
      withTiming(1.0, {
        duration: totalDuration * 0.15,
        easing: Easing.inOut(Easing.quad)
      })
    );
  }, [duration, item.id, onComplete, opacity, scale, translateY]);

  const animateCurve = useCallback(() => {
    // Curved path animation (bezier-like)
    const totalDuration = duration;

    opacity.value = withSequence(
      withTiming(1, { duration: totalDuration * 0.1, easing: Easing.out(Easing.quad) }),
      withTiming(1, { duration: totalDuration * 0.6 }),
      withTiming(0, {
        duration: totalDuration * 0.3,
        easing: Easing.in(Easing.quad)
      }, (finished) => {
        if (finished && onComplete) {
          runOnJS(onComplete)(item.id);
        }
      })
    );

    // Curved path: move up and to the right
    translateY.value = withTiming(-120, {
      duration: totalDuration,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    translateX.value = withTiming(40, {
      duration: totalDuration,
      easing: Easing.bezier(0.5, 0, 0.5, 1),
    });

    scale.value = withSequence(
      withTiming(1.2, { duration: totalDuration * 0.1, easing: Easing.out(Easing.cubic) }),
      withTiming(1.0, { duration: totalDuration * 0.1, easing: Easing.out(Easing.quad) })
    );
  }, [duration, item.id, onComplete, opacity, scale, translateX, translateY]);

  useEffect(() => {
    // Trigger haptic feedback on appearance
    selectionHaptic();

    // Choose animation based on type
    switch (animationType) {
      case 'bounce':
        animateBounce();
        break;
      case 'curve':
        animateCurve();
        break;
      case 'arcadeFloat':
      default:
        animateArcadeFloat();
        break;
    }
  }, [animateArcadeFloat, animateBounce, animateCurve, animationType]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.textContainer,
        {
          left: item.x,
          top: item.y,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: item.color,
          },
        ]}
      >
        {item.text}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  textContainer: {
    position: 'absolute',
    zIndex: 50,
  },
  text: {
    fontSize: 28,
    fontWeight: '900',
    // Text shadow for better visibility (arcade-style stroke effect)
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
});

export default FloatingText;
