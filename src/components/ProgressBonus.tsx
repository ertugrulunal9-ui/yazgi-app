import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { PersonalityState, PersonalityTendency } from '../types';
import { tRuntime } from '../i18n/strings';
import { useRuntimeLocale } from '../i18n/useRuntimeLocale';
import {
  getSpecialPathProgress,
  HIGH_MOMENTUM_THRESHOLD,
  isSpecialPathUnlocked,
  normalizePersonalityState,
} from '../systems/PersonalityMomentumEngine';

interface ProgressBonusProps {
  personalityState: Partial<PersonalityState> | undefined;
  tendency: PersonalityTendency;
  threshold?: number;
}

const TENDENCY_LABELS: Record<PersonalityTendency, string> = {
  HELPFUL: 'Helpful',
  PRAGMATIC: 'Pragmatic',
  AGGRESSIVE: 'Aggressive',
};

const TENDENCY_TONES: Record<PersonalityTendency, {
  barColor: string;
  textColor: string;
  glowColor: string;
}> = {
  HELPFUL: {
    barColor: '#34d399',
    textColor: '#a7f3d0',
    glowColor: 'rgba(16, 185, 129, 0.55)',
  },
  PRAGMATIC: {
    barColor: '#38bdf8',
    textColor: '#bae6fd',
    glowColor: 'rgba(14, 165, 233, 0.55)',
  },
  AGGRESSIVE: {
    barColor: '#fb7185',
    textColor: '#fecdd3',
    glowColor: 'rgba(244, 63, 94, 0.55)',
  },
};

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

export const ProgressBonus: React.FC<ProgressBonusProps> = ({
  personalityState,
  tendency,
  threshold = HIGH_MOMENTUM_THRESHOLD,
}) => {
  useRuntimeLocale();

  const normalizedState = normalizePersonalityState(personalityState);
  const data = normalizedState[tendency];
  const tone = TENDENCY_TONES[tendency];
  const progress = getSpecialPathProgress(normalizedState, tendency, threshold);
  const unlocked = isSpecialPathUnlocked(normalizedState, tendency, threshold);
  const glowIntensity = useMemo(() => clamp((data.multiplier - 1) / 0.6, 0.1, 1), [data.multiplier]);
  const tendencyLabel = tRuntime(
    `feedback.momentum.tendencies.${tendency}`,
    undefined,
    TENDENCY_LABELS[tendency]
  );

  const shakeX = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const bonusOpacity = useRef(new Animated.Value(0)).current;
  const prevRef = useRef({ multiplier: data.multiplier, streak: data.streak });
  const [bonusText, setBonusText] = useState<string | null>(null);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => {
      loop.stop();
    };
  }, [glowPulse]);

  useEffect(() => {
    const previous = prevRef.current;
    const multiplierRaised = data.multiplier > previous.multiplier;
    const streakBroken = previous.streak > 0 && data.streak < previous.streak;

    if (multiplierRaised) {
      const bonusPercent = Math.max(0, Math.round((data.multiplier - 1) * 100));
      setBonusText(
        tRuntime(
          'feedback.momentum.highMomentum',
          { percent: bonusPercent },
          `+${bonusPercent}% Momentum Bonus!`
        )
      );
      bonusOpacity.setValue(0);
      Animated.sequence([
        Animated.timing(bonusOpacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.delay(700),
        Animated.timing(bonusOpacity, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setBonusText(null);
        }
      });
    }

    if (streakBroken) {
      Animated.sequence([
        Animated.timing(shakeX, { toValue: -8, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 8, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -6, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 6, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 0, duration: 35, useNativeDriver: true }),
      ]).start();
      Animated.sequence([
        Animated.timing(cardOpacity, { toValue: 0.62, duration: 110, useNativeDriver: true }),
        Animated.timing(cardOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    }

    prevRef.current = { multiplier: data.multiplier, streak: data.streak };
  }, [bonusOpacity, cardOpacity, data.multiplier, data.streak, shakeX]);

  const glowOpacity = useMemo(
    () => glowPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [
        0.07 + glowIntensity * 0.18,
        0.17 + glowIntensity * 0.38,
      ],
    }),
    [glowIntensity, glowPulse]
  );
  const glowScale = useMemo(
    () => glowPulse.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.01 + glowIntensity * 0.06],
    }),
    [glowIntensity, glowPulse]
  );

  return (
    <Animated.View
      style={{
        transform: [{ translateX: shakeX }],
        opacity: cardOpacity,
      }}
      className="relative overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950/90 p-3"
    >
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          styles.glowLayer,
          {
            backgroundColor: tone.glowColor,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
      />

      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-zinc-100">
          {tRuntime(
            'character.screen.momentumCard.title',
            { tendency: tendencyLabel },
            `${tendencyLabel} Momentum`
          )}
        </Text>
        <Text
          className="text-xs font-bold"
          style={{ color: tone.textColor }}
        >
          x{data.multiplier.toFixed(2)}
        </Text>
      </View>

      <View className="mb-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <View
          className="h-full rounded-full"
          style={{
            width: `${Math.round(progress * 100)}%`,
            backgroundColor: tone.barColor,
          }}
        />
      </View>

      <View className="flex-row items-center justify-between">
        <Text className="text-xs text-zinc-300">
          {tRuntime('character.screen.momentumCard.streak', { count: data.streak }, `Streak: ${data.streak}`)}
        </Text>
        <Text
          className="text-xs font-semibold"
          style={{ color: unlocked ? tone.textColor : '#71717a' }}
        >
          {unlocked
            ? tRuntime('character.screen.momentumCard.specialPathUnlocked', undefined, 'Special Path Unlocked')
            : tRuntime('character.screen.momentumCard.specialPathLocked', undefined, 'Path Locked')}
        </Text>
      </View>

      {bonusText && (
        <Animated.View
          pointerEvents="none"
          style={{ opacity: bonusOpacity }}
          className="mt-2"
        >
          <Text className="text-xs font-extrabold" style={{ color: tone.textColor }}>
            {bonusText}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  glowLayer: {
    borderRadius: 16,
  },
});

export default ProgressBonus;
