import React, { useMemo, useCallback } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { useEvents } from '../hooks/useEvents';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
import { Z_INDEX } from '../constants/zIndex';
import {
  FadeInUpView,
  StaggeredFadeIn,
  buttonPress,
  importantDecision,
} from '../animations';
import { AnimatedButton } from '../animations/ButtonAnimations';

interface EventScreenProps {
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
}

export const EventScreen: React.FC<EventScreenProps> = React.memo(({ theme, metrics }) => {
  const { gameState } = useGame();
  const { handleEventChoice, resolveEventText, resolveChoice } = useEvents();
  const insets = useSafeAreaInsets();

  // Debug: Log state changes
  console.log('[EventScreen] phase:', gameState.phase, 'hasEvent:', !!gameState.currentEvent);

  const handleChoice = useCallback((choice: any) => {
    buttonPress();
    importantDecision();
    handleEventChoice(choice);
  }, [handleEventChoice]);

  const overlayStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: Z_INDEX.EVENT_OVERLAY,
    backgroundColor: theme.appBg,
  }), [theme.appBg]);

  const scrollContentStyle = useMemo(() => ({
    paddingTop: Math.max(insets.top + 20, 60),
    paddingBottom: Math.max(insets.bottom + 20, 40),
  }), [insets.top, insets.bottom]);

  const scrollViewStyle = useMemo(() => ({
    flex: 1 as const,
    padding: metrics.pad,
  }), [metrics.pad]);

  const eventCardStyle = useMemo(() => ({
    backgroundColor: theme.surfaceBase,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.border,
    padding: metrics.pad,
    marginBottom: 20,
  }), [theme.surfaceBase, theme.border, metrics.pad]);

  const eventTextStyle = useMemo(() => ({
    color: theme.textPrimary,
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 12,
    lineHeight: 22,
  }), [theme.textPrimary]);

  const buttonStyle = useMemo(() => ({
    backgroundColor: theme.surfaceBase,
    padding: metrics.pad,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  }), [theme.surfaceBase, theme.border, metrics.pad]);

  const buttonTextStyle = useMemo(() => ({
    color: theme.textPrimary,
    fontSize: metrics.font,
    fontWeight: '600' as const,
    lineHeight: Math.round(metrics.font * 1.4),
  }), [theme.textPrimary, metrics.font]);

  // Don't render anything if no event or not in EVENT phase
  if (!gameState.currentEvent || gameState.phase !== 'EVENT') {
    console.log('[EventScreen] Returning null - phase:', gameState.phase, 'currentEvent:', gameState.currentEvent?.id);
    return null;
  }

  console.log('[EventScreen] Rendering event:', gameState.currentEvent?.id);

  const evt = gameState.currentEvent;
  const eventText = resolveEventText(evt);

  return (
    <View style={overlayStyle}>
      <ScrollView style={scrollViewStyle} contentContainerStyle={scrollContentStyle}>
        <FadeInUpView>
          <View style={eventCardStyle}>
            <Text style={eventTextStyle}>
              {eventText}
            </Text>
          </View>
        </FadeInUpView>

        <StaggeredFadeIn>
          {evt.choices.map((choice, index) => {
            const resolved = resolveChoice(choice);
            return (
              <AnimatedButton
                key={index}
                onPress={() => handleChoice(choice)}
                animationType="pressScale"
                style={buttonStyle}
              >
                <Text style={buttonTextStyle}>
                  {resolved.text}
                </Text>
              </AnimatedButton>
            );
          })}
        </StaggeredFadeIn>
      </ScrollView>
    </View>
  );
});
