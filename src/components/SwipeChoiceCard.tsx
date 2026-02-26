/**
 * SwipeChoiceCard — Tek bir kaydırılabilir seçim kartı.
 * react-native-gesture-handler + react-native-reanimated kullanır.
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Extrapolation,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Choice, PersonalityState, Stats } from '../types';
import { selectionHaptic, importantDecision } from '../animations';
import { getMomentumDialogueTag } from '../utils/momentumDialogue';
import { tRuntime } from '../i18n/strings';
import { useRuntimeLocale } from '../i18n/useRuntimeLocale';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;
const SPRING_CONFIG = { damping: 20, stiffness: 200, mass: 0.8 };

interface SwipeChoiceCardProps {
  choice: Choice;
  index: number;
  totalChoices: number;
  isActive: boolean;
  onSelect: () => void;
  onSkip: () => void;
  theme: {
    surfaceBase: string;
    surfaceRaised: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    accentEvent: string;
  };
  metrics: { pad: number; font: number };
  personalityState?: Partial<PersonalityState>;
}

const CHOICE_TYPE_COLORS: Record<string, string> = {
  PASSIVE: '#22c55e',
  CHALLENGE: '#f97316',
  BREAKDOWN: '#ef4444',
  NEUTRAL: '#94a3b8',
};

const STAT_ICONS: Partial<Record<keyof Stats, { icon: string }>> = {
  health: { icon: 'heart' },
  intelligence: { icon: 'book' },
  charisma: { icon: 'star' },
  discipline: { icon: 'target' },
  money: { icon: 'dollar-sign' },
  energy: { icon: 'zap' },
  familyRelation: { icon: 'home' },
};

export const SwipeChoiceCard: React.FC<SwipeChoiceCardProps> = React.memo(({
  choice,
  index,
  totalChoices,
  isActive,
  onSelect,
  onSkip,
  theme,
  metrics,
  personalityState,
}) => {
  useRuntimeLocale();

  const translateX = useSharedValue(0);
  const isGestureActive = useSharedValue(false);

  const onSwipeRight = () => {
    importantDecision();
    onSelect();
  };

  const onSwipeLeft = () => {
    selectionHaptic();
    onSkip();
  };

  const onThresholdCross = () => {
    selectionHaptic();
  };

  const panGesture = Gesture.Pan()
    .enabled(isActive)
    .onStart(() => {
      isGestureActive.value = true;
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      // Threshold crossing haptic
      if (
        Math.abs(event.translationX) >= SWIPE_THRESHOLD &&
        Math.abs(event.translationX) < SWIPE_THRESHOLD + 10
      ) {
        runOnJS(onThresholdCross)();
      }
    })
    .onEnd((event) => {
      isGestureActive.value = false;
      if (event.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(SCREEN_WIDTH, { duration: 200 });
        runOnJS(onSwipeRight)();
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
        runOnJS(onSwipeLeft)();
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-12, 0, 12],
      Extrapolation.CLAMP,
    );
    const opacity = interpolate(
      Math.abs(translateX.value),
      [0, SCREEN_WIDTH * 0.5],
      [1, 0.5],
      Extrapolation.CLAMP,
    );
    return {
      transform: [
        { translateX: translateX.value },
        { rotate: `${rotate}deg` },
      ],
      opacity,
    };
  });

  const rightIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  const leftIndicatorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const choiceTypeColor = CHOICE_TYPE_COLORS[choice.choiceType || 'NEUTRAL'];
  const dialogueTag = getMomentumDialogueTag(choice, personalityState);
  const swipeHint = tRuntime('events.swipe.swipeHint', undefined, 'kaydir');

  // Stat hints from choice.effect
  const statHints = Object.entries(choice.effect || {}).filter(
    ([, val]) => typeof val === 'number' && val !== 0,
  );

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
        <View style={[styles.card, {
          backgroundColor: theme.surfaceBase,
          borderColor: theme.border,
          padding: metrics.pad,
        }]}>
          {/* Swipe indicators */}
          <Animated.View style={[styles.indicator, styles.rightIndicator, rightIndicatorStyle]}>
            <Feather name="check-circle" size={28} color="#22c55e" />
          </Animated.View>
          <Animated.View style={[styles.indicator, styles.leftIndicator, leftIndicatorStyle]}>
            <Feather name="arrow-right" size={28} color="#94a3b8" />
          </Animated.View>

          {/* Header: choice type + position */}
          <View style={styles.header}>
            <View style={[styles.typeDot, { backgroundColor: choiceTypeColor }]} />
            <Text style={[styles.positionText, { color: theme.textSecondary }]}>
              {index + 1} / {totalChoices}
            </Text>
            <View style={styles.headerSpacer} />
            {dialogueTag && (
              <View
                style={[
                  styles.tagChip,
                  {
                    borderColor: dialogueTag.borderColor,
                    shadowColor: dialogueTag.glowColor,
                  },
                ]}
              >
                <Text style={[styles.tagChipText, { color: dialogueTag.textColor }]}>
                  {dialogueTag.tagText}
                </Text>
              </View>
            )}
          </View>

          {/* Choice text */}
          <Text style={[styles.choiceText, {
            color: theme.textPrimary,
            fontSize: metrics.font,
          }]}>
            {choice.text}
          </Text>
          {dialogueTag && (
            <Text style={[styles.dialogueSubtitle, { color: dialogueTag.textColor }]}>
              {dialogueTag.subtitle}
            </Text>
          )}

          {/* Stat hints */}
          {statHints.length > 0 && (
            <View style={styles.statRow}>
              {statHints.slice(0, 4).map(([key, val]) => {
                const info = STAT_ICONS[key as keyof Stats];
                if (!info) return null;
                const isPositive = (val as number) > 0;
                return (
                  <View key={key} style={[styles.statBadge, {
                    backgroundColor: isPositive ? '#dcfce7' : '#fee2e2',
                  }]}>
                    <Feather
                      name={info.icon as any}
                      size={12}
                      color={isPositive ? '#16a34a' : '#dc2626'}
                    />
                    <Text style={[styles.statBadgeText, {
                      color: isPositive ? '#16a34a' : '#dc2626',
                    }]}>
                      {isPositive ? '+' : ''}{val}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Swipe hint */}
          <View style={styles.swipeHint}>
            <Feather name="chevrons-left" size={14} color={theme.textSecondary} />
            <Text style={[styles.swipeHintText, { color: theme.textSecondary }]}>
              {swipeHint}
            </Text>
            <Feather name="chevrons-right" size={14} color={theme.textSecondary} />
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
});
SwipeChoiceCard.displayName = 'SwipeChoiceCard';

const styles = StyleSheet.create({
  cardContainer: {
    position: 'absolute',
    width: '100%',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  headerSpacer: {
    flex: 1,
  },
  typeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  positionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  choiceText: {
    fontWeight: '600',
    lineHeight: 22,
    flexShrink: 1,
  },
  dialogueSubtitle: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.92,
  },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 14,
    opacity: 0.5,
  },
  swipeHintText: {
    fontSize: 11,
    fontWeight: '500',
  },
  tagChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  tagChipText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  indicator: {
    position: 'absolute',
    top: 12,
    zIndex: 10,
  },
  rightIndicator: {
    right: 12,
  },
  leftIndicator: {
    left: 12,
  },
});
