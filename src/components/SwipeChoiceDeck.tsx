/**
 * SwipeChoiceDeck — Kart yığını yöneticisi.
 * 3+ seçenekte swipe kartlar, 1-2 seçenekte klasik buton fallback.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Reanimated reserved for future card stack animations
import { Choice, EventContext, EventRarity, PersonalityState } from '../types';
import { useUI } from '../context/UIContext';
import { ChoiceCard } from './ChoiceCard';
import { AnimatedButton } from '../animations/ButtonAnimations';
import { StaggeredFadeIn, buttonPress, importantDecision } from '../animations';
import { getMomentumDialogueTag } from '../utils/momentumDialogue';

/** Raritet bazlı minimum okuma süresi (ms). Swipe bu geçmeden kilitli kalır. */
const MIN_READ_TIME_MS: Record<EventRarity | 'BREAKDOWN', number> = {
  COMMON: 1500,
  UNCOMMON: 2500,
  RARE: 4000,
  BREAKDOWN: 3000,
};

interface SwipeChoiceDeckProps {
  choices: (Choice | ((ctx: EventContext) => Choice))[];
  resolveChoice: (c: Choice | ((ctx: EventContext) => Choice)) => Choice;
  onChoiceSelected: (choice: Choice | ((ctx: EventContext) => Choice), index: number) => void;
  isBreakdownEvent: boolean;
  originalChoices: (Choice | ((ctx: EventContext) => Choice))[];
  personalityState?: Partial<PersonalityState>;
  /** Mevcut event'in rarity değeri — swipe kilit süresini belirler */
  eventRarity?: EventRarity;
  /** Event kimliği — event değiştiğinde kilidi sıfırlar */
  eventId?: string;
}

const BACK_CARD_SCALE = 0.95;
const BACK_CARD_OFFSET = 8;

export const SwipeChoiceDeck: React.FC<SwipeChoiceDeckProps> = React.memo(({
  choices,
  resolveChoice,
  onChoiceSelected,
  isBreakdownEvent,
  originalChoices,
  personalityState,
  eventRarity,
  eventId,
}) => {
  const { theme, metrics } = useUI();
  const [activeIndex, setActiveIndex] = useState(0);

  // RARE/BREAKDOWN event'lerde seçimi klasik butonlara düşür
  const forceButtonFallback = isBreakdownEvent || eventRarity === 'RARE';

  // Swipe kilidi: event gösterildiğinden bu yana MIN_READ_TIME geçmeden swipe kapalı
  const [swipeLocked, setSwipeLocked] = useState(true);
  const [lockRemainingMs, setLockRemainingMs] = useState(0);
  useEffect(() => {
    setSwipeLocked(true);
    const rarityKey: EventRarity | 'BREAKDOWN' = isBreakdownEvent
      ? 'BREAKDOWN'
      : (eventRarity ?? 'COMMON');
    const delay = MIN_READ_TIME_MS[rarityKey];
    setLockRemainingMs(delay);
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, delay - elapsed);
      setLockRemainingMs(remaining);
      if (remaining <= 0) {
        setSwipeLocked(false);
        clearInterval(interval);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [eventId, isBreakdownEvent, eventRarity]);
  const lockCountdownText = swipeLocked ? `${Math.ceil(lockRemainingMs / 1000)}s` : '';

  const resolvedChoices = useMemo(
    () => choices.map(c => resolveChoice(c)),
    [choices, resolveChoice],
  );

  const handleSelect = useCallback((deckIndex: number) => {
    const originalIndex = originalChoices.indexOf(choices[deckIndex]);
    const choiceIndex = originalIndex >= 0 ? originalIndex : deckIndex;
    onChoiceSelected(choices[deckIndex], choiceIndex);
  }, [choices, originalChoices, onChoiceSelected]);

  const handleSkip = useCallback(() => {
    setActiveIndex(prev =>
      prev < resolvedChoices.length - 1 ? prev + 1 : 0,
    );
  }, [resolvedChoices.length]);

  // Fallback: 2 veya daha az seçenek YA DA RARE/BREAKDOWN → klasik butonlar
  if (resolvedChoices.length <= 2 || forceButtonFallback) {
    return (
      <StaggeredFadeIn>
        {choices.map((choice, index) => {
          const resolved = resolveChoice(choice);
          const dialogueTag = getMomentumDialogueTag(resolved, personalityState);
          const originalIndex = originalChoices.indexOf(choice);
          const choiceIndex = originalIndex >= 0 ? originalIndex : index;
          return (
            <AnimatedButton
              key={index}
              onPress={() => {
                buttonPress();
                importantDecision();
                onChoiceSelected(choice, choiceIndex);
              }}
              animationType={isBreakdownEvent ? 'shake' : 'pressScale'}
              style={{
                ...buttonFallbackStyles.button,
                backgroundColor: theme.surfaceBase,
                padding: metrics.pad,
                borderColor: theme.border,
              }}
              accessibilityRole="button"
              accessibilityLabel={resolved.text}
              accessibilityHint="Bu secim karakterini etkiler"
            >
              <View>
                <Text style={[buttonFallbackStyles.buttonText, {
                  color: theme.textPrimary,
                  fontSize: metrics.font,
                }]}>
                  {dialogueTag ? `${dialogueTag.tagText} ${resolved.text}` : resolved.text}
                </Text>
                {dialogueTag && (
                  <Text style={[buttonFallbackStyles.tagSubtitle, { color: dialogueTag.textColor }]}>
                    {dialogueTag.subtitle}
                  </Text>
                )}
              </View>
            </AnimatedButton>
          );
        })}
      </StaggeredFadeIn>
    );
  }

  // Swipe kart yığını
  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.deckContainer}>
        {resolvedChoices.map((resolved, index) => {
          const isActive = index === activeIndex;
          const isBehind = index === (activeIndex + 1) % resolvedChoices.length;
          const isVisible = isActive || isBehind;

          if (!isVisible) return null;

          return (
            <View
              key={index}
              style={[
                styles.cardWrapper,
                {
                  zIndex: isActive ? 10 : 5,
                  transform: isBehind
                    ? [{ scale: BACK_CARD_SCALE }, { translateY: BACK_CARD_OFFSET }]
                    : [],
                  opacity: isBehind ? 0.6 : 1,
                },
              ]}
            >
              <ChoiceCard
                choice={resolved}
                index={activeIndex}
                totalChoices={resolvedChoices.length}
                isActive={isActive}
                onSelect={swipeLocked ? () => {} : () => handleSelect(index)}
                onSkip={swipeLocked ? () => {} : handleSkip}
                theme={theme}
                metrics={metrics}
                personalityState={personalityState}
              />
            </View>
          );
        })}
      </View>

      {/* Dokunarak seçim fallback (accessibility) */}
      <View style={styles.tapFallback}>
        <AnimatedButton
          onPress={() => {
            if (swipeLocked) return;
            buttonPress();
            importantDecision();
            handleSelect(activeIndex);
          }}
          animationType="pressScale"
          style={{
            ...styles.selectButton,
            backgroundColor: swipeLocked ? theme.border : theme.accentEvent,
          }}
          accessibilityRole="button"
          accessibilityLabel={swipeLocked ? `Karar vermek icin ${lockCountdownText} bekle` : `Sec: ${resolvedChoices[activeIndex]?.text}`}
          accessibilityHint="Bu secimi onayla"
        >
          <Text style={styles.selectButtonText}>
            {swipeLocked ? lockCountdownText : 'Seç'}
          </Text>
        </AnimatedButton>
      </View>
    </GestureHandlerRootView>
  );
});
SwipeChoiceDeck.displayName = 'SwipeChoiceDeck';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deckContainer: {
    height: 220,
    position: 'relative',
  },
  cardWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  tapFallback: {
    marginTop: 12,
    alignItems: 'center',
  },
  selectButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});

const buttonFallbackStyles = StyleSheet.create({
  button: {
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  buttonText: {
    fontWeight: '600',
    lineHeight: 22,
  },
  tagSubtitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
});
