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
import { selectionHaptic } from '../animations';
import { getMomentumDialogueTag } from '../utils/momentumDialogue';
import { generateTradeoffHint } from '../utils/tradeoffHints';
import { tRuntime, getRuntimeLocale } from '../i18n/strings';
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

const CHOICE_TYPE_LABELS: Record<string, { tr: string; en: string }> = {
  PASSIVE:    { tr: 'Güvenli',  en: 'Safe'    },
  CHALLENGE:  { tr: 'Cesur',   en: 'Bold'    },
  BREAKDOWN:  { tr: 'Kriz',    en: 'Crisis'  },
};

export const UNCERTAIN_COLOR = '#facc15';

/** Seçim türünün rengi ve (nötr değilse) kısa etiketi; düğme ve kaydırmalı kart ortak kullanır. */
export const getChoiceTypeBadge = (choice: Choice): { color: string; label: string | null } => {
  const choiceType = choice.choiceType || 'NEUTRAL';
  return {
    color: CHOICE_TYPE_COLORS[choiceType] ?? CHOICE_TYPE_COLORS.NEUTRAL,
    label: choiceType !== 'NEUTRAL'
      ? (CHOICE_TYPE_LABELS[choiceType]?.[getRuntimeLocale() === 'tr' ? 'tr' : 'en'] ?? choiceType)
      : null,
  };
};

export const STAT_ICONS: Partial<Record<keyof Stats, { icon: string }>> = {
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

  // Onay titreşimi tek yerden (useEventScreenController.handleChoice) gelir
  const onSwipeRight = () => {
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

  const { color: choiceTypeColor, label: choiceTypeLabel } = getChoiceTypeBadge(choice);
  // Sonucu şansa ve karaktere bağlı seçenek (conditionalOutcomes)
  const isUncertain = (choice.conditionalOutcomes?.length ?? 0) > 0;
  const uncertainLabel = tRuntime('events.swipe.uncertain', undefined, 'Şansa bağlı');
  const dialogueTag = getMomentumDialogueTag(choice, personalityState);
  const tradeoffHint = dialogueTag ? null : generateTradeoffHint(choice);
  const swipeHint = tRuntime('events.swipe.swipeHint', undefined, 'kaydır');

  // Stat ipuçları: yalnızca hangi statların etkileneceği gösterilir; yön ve miktar
  // sonuç ekranına kadar gizli kalır (seçim "yeşil olana bas"a dönüşmesin diye).
  const statHints = Object.entries(choice.effect || {}).filter(
    ([, val]) => typeof val === 'number' && val !== 0,
  );
  const affectedStatsLabel = statHints
    .slice(0, 4)
    .map(([key]) => tRuntime(`labels.stats.${key}`, undefined, key))
    .join(', ');

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.cardContainer, cardAnimatedStyle]}>
        <View style={[styles.card, {
          backgroundColor: theme.surfaceBase,
          borderColor: choiceTypeLabel ? `${choiceTypeColor}66` : theme.border,
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
            {choiceTypeLabel ? (
              <View style={[styles.typeChip, { backgroundColor: `${choiceTypeColor}22`, borderColor: `${choiceTypeColor}66` }]}>
                <Text style={[styles.typeChipText, { color: choiceTypeColor }]}>{choiceTypeLabel}</Text>
              </View>
            ) : (
              <View style={[styles.typeDot, { backgroundColor: choiceTypeColor }]} />
            )}
            {isUncertain && (
              <View style={[styles.typeChip, styles.uncertainChip, { borderColor: `${UNCERTAIN_COLOR}66`, backgroundColor: `${UNCERTAIN_COLOR}1f` }]}>
                <Feather name="shuffle" size={10} color={UNCERTAIN_COLOR} />
                <Text style={[styles.typeChipText, { color: UNCERTAIN_COLOR }]}>{uncertainLabel}</Text>
              </View>
            )}
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
                {dialogueTag.streak >= 3 && (
                  <Text style={[styles.tagChipText, { color: dialogueTag.textColor, opacity: 0.85 }]}>
                    {` 🔥×${dialogueTag.streak}`}
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Choice text */}
          <Text style={[styles.choiceText, {
            color: theme.textPrimary,
            fontSize: metrics.font + 2,
            lineHeight: metrics.font + 9,
          }]}>
            {choice.text}
          </Text>
          {dialogueTag && (
            <Text style={[styles.dialogueSubtitle, { color: dialogueTag.textColor }]}>
              {dialogueTag.subtitle}
            </Text>
          )}
          {tradeoffHint && (
            <Text style={[styles.tradeoffHint, { color: theme.textSecondary }]}>
              {tradeoffHint}
            </Text>
          )}

          {/* Stat hints */}
          {statHints.length > 0 && (
            <View
              style={styles.statRow}
              accessible
              accessibilityLabel={tRuntime(
                'events.swipe.affectedStats',
                { stats: affectedStatsLabel },
                `Etkilenir: ${affectedStatsLabel}`,
              )}
            >
              {statHints.slice(0, 4).map(([key]) => {
                const info = STAT_ICONS[key as keyof Stats];
                if (!info) return null;
                return (
                  <View key={key} style={[styles.statBadge, {
                    backgroundColor: theme.surfaceRaised,
                    borderColor: theme.border,
                  }]}>
                    <Feather
                      name={info.icon as any}
                      size={13}
                      color={theme.textSecondary}
                    />
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
  typeChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeChipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  uncertainChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
  tradeoffHint: {
    marginTop: 7,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
    opacity: 0.75,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
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
