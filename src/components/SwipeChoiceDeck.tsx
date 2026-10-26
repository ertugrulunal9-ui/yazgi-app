/**
 * SwipeChoiceDeck manages swipe card stacks.
 * Uses swipe cards for 3+ options and button fallback for 1-2 options.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from './ui/LocaleText';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Reanimated reserved for future card stack animations
import { Choice, EventContext, EventRarity, PersonalityState } from '../types';
import { useUI } from '../context/UIContext';
import { ChoiceCard } from './ChoiceCard';
import { getChoiceTypeBadge, STAT_ICONS, UNCERTAIN_COLOR } from './SwipeChoiceCard';
import { AnimatedButton } from '../animations/ButtonAnimations';
import { StaggeredFadeIn } from '../animations';
import { getMomentumDialogueTag } from '../utils/momentumDialogue';
import { generateTradeoffHint } from '../utils/tradeoffHints';
import { describeLockReason, LockedChoice } from '../utils/eventChoiceFilter';
import { tRuntime } from '../i18n/strings';
import { useRuntimeLocale } from '../i18n/useRuntimeLocale';
import { Feather } from '@expo/vector-icons';

/** Minimum read time by rarity (ms). Swipe stays locked until this elapses. */
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
  /** Current event rarity for swipe lock duration */
  eventRarity?: EventRarity;
  /** Event id resets lock state when event changes */
  eventId?: string;
  /** Kişilik/stat şartı yüzünden seçilemeyen seçenekler; gri ve kilitli gösterilir */
  lockedChoices?: LockedChoice[];
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
  lockedChoices,
}) => {
  useRuntimeLocale();

  const { theme, metrics } = useUI();
  const [activeIndex, setActiveIndex] = useState(0);

  // Force button fallback for RARE/BREAKDOWN events
  const forceButtonFallback = isBreakdownEvent || eventRarity === 'RARE';

  // Swipe lock: disabled until MIN_READ_TIME has passed since event display
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
  const swipeChoiceHint = tRuntime('events.swipe.choiceHint', undefined, 'Bu seçim karakterini etkiler');
  const selectHint = tRuntime('events.swipe.selectHint', undefined, 'Bu seçimi onayla');
  const selectText = tRuntime('events.swipe.select', undefined, 'Seç');

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

  const lockedSection = lockedChoices && lockedChoices.length > 0 ? (
    <View style={lockedStyles.container}>
      <Text style={[lockedStyles.title, { color: theme.textSecondary }]}>
        {tRuntime('ui.event.locked.title')}
      </Text>
      {lockedChoices.map((item, i) => {
        const reason = describeLockReason(item.reason);
        return (
          <View
            key={`locked-${i}`}
            style={[lockedStyles.row, { borderColor: theme.border }]}
            accessible
            accessibilityLabel={`${tRuntime('ui.event.locked.a11yPrefix')}: ${item.choice.text}. ${reason}`}
          >
            <Feather name="lock" size={13} color={theme.textSecondary} />
            <View style={lockedStyles.textWrap}>
              <Text style={[lockedStyles.text, { color: theme.textSecondary }]}>{item.choice.text}</Text>
              <Text style={[lockedStyles.reason, { color: theme.textSecondary }]}>{reason}</Text>
            </View>
          </View>
        );
      })}
    </View>
  ) : null;

  // Fallback: <=2 choices or RARE/BREAKDOWN -> classic buttons
  if (resolvedChoices.length <= 2 || forceButtonFallback) {
    return (
      <>
      <StaggeredFadeIn>
        {choices.map((choice, index) => {
          const resolved = resolveChoice(choice);
          const dialogueTag = getMomentumDialogueTag(resolved, personalityState);
          const originalIndex = originalChoices.indexOf(choice);
          const choiceIndex = originalIndex >= 0 ? originalIndex : index;
          const buttonTradeoffHint = dialogueTag ? null : generateTradeoffHint(resolved);
          const typeBadge = getChoiceTypeBadge(resolved);
          const isUncertain = (resolved.conditionalOutcomes?.length ?? 0) > 0;
          // Kaydırmalı kartla aynı kural: yalnızca hangi statların etkileneceği, yön/miktar değil
          const statKeys = Object.entries(resolved.effect || {})
            .filter(([key, val]) => typeof val === 'number' && val !== 0 && STAT_ICONS[key as keyof typeof STAT_ICONS])
            .slice(0, 4)
            .map(([key]) => key as keyof typeof STAT_ICONS);
          const hasMeta = Boolean(typeBadge.label) || isUncertain || statKeys.length > 0;
          return (
            <AnimatedButton
              key={index}
              onPress={() => onChoiceSelected(choice, choiceIndex)}
              animationType={isBreakdownEvent ? 'shake' : 'pressScale'}
              style={{
                ...buttonFallbackStyles.button,
                backgroundColor: theme.surfaceBase,
                padding: metrics.pad,
                borderColor: theme.border,
              }}
              accessibilityRole="button"
              accessibilityLabel={resolved.text}
              accessibilityHint={swipeChoiceHint}
            >
              <View style={buttonFallbackStyles.row}>
                <View style={[buttonFallbackStyles.letter, {
                  borderColor: `${typeBadge.color}88`,
                  backgroundColor: `${typeBadge.color}1f`,
                }]}>
                  <Text style={[buttonFallbackStyles.letterText, { color: typeBadge.color }]}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <View style={buttonFallbackStyles.body}>
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
                  {buttonTradeoffHint && (
                    <Text style={[buttonFallbackStyles.tradeoffHint, { color: theme.textSecondary }]}>
                      {buttonTradeoffHint}
                    </Text>
                  )}
                  {hasMeta && (
                    <View style={buttonFallbackStyles.metaRow}>
                      {typeBadge.label && (
                        <View style={[buttonFallbackStyles.chip, {
                          borderColor: `${typeBadge.color}66`,
                          backgroundColor: `${typeBadge.color}1f`,
                        }]}>
                          <Text style={[buttonFallbackStyles.chipText, { color: typeBadge.color }]}>{typeBadge.label}</Text>
                        </View>
                      )}
                      {isUncertain && (
                        <View style={[buttonFallbackStyles.chip, {
                          borderColor: `${UNCERTAIN_COLOR}66`,
                          backgroundColor: `${UNCERTAIN_COLOR}1f`,
                        }]}>
                          <Feather name="shuffle" size={10} color={UNCERTAIN_COLOR} />
                          <Text style={[buttonFallbackStyles.chipText, { color: UNCERTAIN_COLOR }]}>
                            {tRuntime('events.swipe.uncertain', undefined, 'Şansa bağlı')}
                          </Text>
                        </View>
                      )}
                      {statKeys.map(key => (
                        <View
                          key={key}
                          style={[buttonFallbackStyles.statBadge, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}
                        >
                          <Feather name={STAT_ICONS[key]?.icon as any} size={12} color={theme.textSecondary} />
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <Feather name="chevron-right" size={18} color={theme.textSecondary} />
              </View>
            </AnimatedButton>
          );
        })}
      </StaggeredFadeIn>
      {lockedSection}
      </>
    );
  }

  // Swipe card stack
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

      {/* Tap-to-select fallback (accessibility) */}
      <View style={styles.tapFallback}>
        <AnimatedButton
          onPress={() => {
            if (swipeLocked) return;
            handleSelect(activeIndex);
          }}
          animationType="pressScale"
          style={{
            ...styles.selectButton,
            backgroundColor: swipeLocked ? theme.border : theme.accentEvent,
          }}
          accessibilityRole="button"
          accessibilityLabel={swipeLocked
            ? tRuntime(
              'events.swipe.waitToDecide',
              { seconds: lockCountdownText },
              `Karar vermek için ${lockCountdownText} bekle`
            )
            : tRuntime(
              'events.swipe.selectAria',
              { text: resolvedChoices[activeIndex]?.text ?? '' },
              `Seç: ${resolvedChoices[activeIndex]?.text ?? ''}`
            )}
          accessibilityHint={selectHint}
        >
          <Text style={styles.selectButtonText}>
            {swipeLocked ? lockCountdownText : selectText}
          </Text>
        </AnimatedButton>
      </View>
      {lockedSection}
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

const lockedStyles = StyleSheet.create({
  container: {
    marginTop: 14,
    gap: 6,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    opacity: 0.6,
  },
  textWrap: {
    flex: 1,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
  reason: {
    marginTop: 2,
    fontSize: 11,
    fontStyle: 'italic',
  },
});

const buttonFallbackStyles = StyleSheet.create({
  button: {
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    minHeight: 72,
  },
  row: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  letter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterText: {
    fontSize: 14,
    fontWeight: '800',
  },
  body: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  statBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
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
  tradeoffHint: {
    marginTop: 6,
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.75,
  },
});
