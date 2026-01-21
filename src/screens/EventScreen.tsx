import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useGame } from '../context/GameContext';
import { useEvents } from '../hooks/useEvents';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
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

export const EventScreen: React.FC<EventScreenProps> = ({ theme, metrics }) => {
  const { gameState } = useGame();
  const { handleEventChoice, resolveEventText, resolveChoice } = useEvents();

  const handleChoice = (choice: any, index: number) => {
    buttonPress();
    importantDecision();
    handleEventChoice(choice, index);
  };

  if (!gameState.currentEvent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.appBg, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: theme.textPrimary }}>Olay bulunamadı</Text>
      </SafeAreaView>
    );
  }

  const evt = gameState.currentEvent;
  const eventText = resolveEventText(evt);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.appBg }}>
      <ScrollView style={{ flex: 1, padding: metrics.pad }}>
        <FadeInUpView>
          <View style={{ backgroundColor: theme.surfaceBase, borderRadius: 14, borderWidth: 1, borderColor: theme.border, padding: metrics.pad, marginBottom: 20 }}>
            <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 12, lineHeight: 22 }}>
              {eventText}
            </Text>
          </View>
        </FadeInUpView>

        <StaggeredFadeIn staggerDelay={100}>
          {evt.choices.map((choice, index) => {
            const resolved = resolveChoice(choice);
            return (
              <AnimatedButton
                key={index}
                onPress={() => handleChoice(choice, index)}
                animationType="pressScale"
                style={{
                  backgroundColor: theme.surfaceBase,
                  padding: metrics.pad,
                  borderRadius: 12,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Text style={{ color: theme.textPrimary, fontSize: metrics.font, fontWeight: '600', lineHeight: Math.round(metrics.font * 1.4) }}>
                  {resolved.text}
                </Text>
              </AnimatedButton>
            );
          })}
        </StaggeredFadeIn>
      </ScrollView>
    </SafeAreaView>
  );
};
