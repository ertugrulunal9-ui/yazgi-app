import React, { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUI } from '../context/UIContext';
import { Z_INDEX } from '../constants/zIndex';
import { SwipeChoiceDeck } from '../components/SwipeChoiceDeck';
import { EventNarrative } from '../components/EventNarrative';
import { FeedbackOverlay } from '../components/FeedbackOverlay';
import { useEventScreenController } from '../hooks/useEventScreenController';

export const EventScreen: React.FC = React.memo(() => {
  const { theme, metrics, t } = useUI();
  const insets = useSafeAreaInsets();
  const {
    gameState,
    stats,
    choicesToRender,
    resolveChoice,
    handleChoice,
    handleContinue,
    handleCrisisRecoveryAd,
    handleReroll,
    selectedChoice,
    canReroll,
    buttonEnabled,
    hasCrisisRecoveryOption,
    crisisRecoveryLoading,
    breakdownShakeX,
    isBreakdownEvent,
    isDramaticEvent,
    eventText,
  } = useEventScreenController();

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
  }), [insets.bottom, insets.top]);

  const scrollViewStyle = useMemo(() => ({
    flex: 1 as const,
    padding: metrics.pad,
  }), [metrics.pad]);

  if (gameState.phase !== 'EVENT' && gameState.phase !== 'RESULT') return null;

  if (gameState.phase === 'RESULT') {
    return (
      <FeedbackOverlay
        theme={theme}
        metrics={metrics}
        insets={insets}
        t={t}
        lastResult={gameState.lastResult}
        currentEvent={gameState.currentEvent}
        selectedChoice={selectedChoice}
        stats={stats}
        personality={gameState.personality}
        skills={gameState.skills}
        fate={gameState.fate}
        canReroll={canReroll}
        buttonEnabled={buttonEnabled}
        hasCrisisRecoveryOption={hasCrisisRecoveryOption}
        crisisRecoveryLoading={crisisRecoveryLoading}
        onContinue={handleContinue}
        onRecoverWithAd={handleCrisisRecoveryAd}
        onReroll={handleReroll}
      />
    );
  }

  if (!gameState.currentEvent || !eventText) return null;

  return (
    <View style={overlayStyle}>
      <ScrollView
        style={scrollViewStyle}
        contentContainerStyle={scrollContentStyle}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        overScrollMode="never"
        bounces={false}
      >
        <EventNarrative
          event={gameState.currentEvent}
          eventText={eventText}
          theme={theme}
          metrics={metrics}
          isDramaticEvent={isDramaticEvent}
          isBreakdownEvent={isBreakdownEvent}
          breakdownShakeX={breakdownShakeX}
        />

        <SwipeChoiceDeck
          choices={choicesToRender ?? gameState.currentEvent.choices}
          resolveChoice={resolveChoice}
          onChoiceSelected={handleChoice}
          isBreakdownEvent={isBreakdownEvent}
          originalChoices={gameState.currentEvent.choices}
          personalityState={gameState.personalityState}
          eventId={gameState.currentEvent.id}
          eventRarity={gameState.currentEvent.rarity}
        />
      </ScrollView>
    </View>
  );
});

EventScreen.displayName = 'EventScreen';
