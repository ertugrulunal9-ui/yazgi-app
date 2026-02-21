import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Dimensions } from 'react-native';
import { eventStart, buttonPress, importantDecision, badOutcomeHaptic, milestoneHaptic } from '../animations';
import { Choice, EventContext } from '../types';
import { useGame } from '../context/GameContext';
import { useEvents } from './useEvents';
import { useGameActions, useFloatingTexts, usePlayerStats } from './useGameSelectors';
import { getEventChoiceSet } from '../utils/gameStateAdapter';
import { getChoicesToRender } from '../utils/eventChoiceFilter';
import { devLog } from '../utils/devLogger';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MIN_RESULT_DISPLAY_TIME = 1000;

export const useEventScreenController = () => {
  const { gameState } = useGame();
  const { stats } = usePlayerStats();
  const { updateGameState } = useGameActions();
  const { showFloatingText } = useFloatingTexts();
  const { handleEventChoice, rerollChoice, resolveEventText, resolveChoice } = useEvents();

  const continueHandledRef = useRef(false);
  const resultPhaseEnteredAtRef = useRef(0);
  const lastSelectedChoiceRef = useRef<{ choice: Choice; index: number } | null>(null);
  const breakdownShakeX = useRef(new Animated.Value(0)).current;
  const [buttonEnabled, setButtonEnabled] = useState(false);

  devLog.log('[EventScreen] Render - phase:', gameState.phase, 'hasEvent:', !!gameState.currentEvent, 'lastResult:', !!gameState.lastResult);

  useEffect(() => {
    if (gameState.phase !== 'RESULT') return undefined;

    continueHandledRef.current = false;
    resultPhaseEnteredAtRef.current = Date.now();
    setButtonEnabled(false);

    const timer = setTimeout(() => {
      setButtonEnabled(true);
      devLog.log('[EventScreen] Continue button is now enabled');
    }, MIN_RESULT_DISPLAY_TIME);

    return () => clearTimeout(timer);
  }, [gameState.phase]);

  useEffect(() => {
    if (gameState.phase !== 'RESULT') return;
    const feedback = gameState.lastResult?.feedback;
    if (!feedback) return;

    AccessibilityInfo?.announceForAccessibility?.(feedback);
    const changeCount = Object.values(gameState.lastResult?.changes || {}).filter(value => Number(value) !== 0).length;
    if (changeCount > 0) {
      AccessibilityInfo?.announceForAccessibility?.(`${changeCount} stat degisti`);
    }
  }, [gameState.phase, gameState.lastResult]);

  const handleChoice = useCallback((choice: Choice | ((ctx: EventContext) => Choice), choiceIndex: number) => {
    const resolved = typeof choice === 'function' ? resolveChoice(choice) : choice;
    lastSelectedChoiceRef.current = { choice: resolved, index: choiceIndex };

    buttonPress();
    importantDecision();

    const turnResult = handleEventChoice(choice, choiceIndex);
    const momentumFeedback = turnResult.momentumFeedback;
    if (!momentumFeedback) return;

    const x = SCREEN_WIDTH * 0.2 + Math.random() * 28;
    const y = 130 + Math.random() * 18;
    const color = momentumFeedback.streakBroken ? '#fda4af' : '#86efac';
    showFloatingText(
      momentumFeedback.feedbackText,
      x,
      y,
      color,
      {
        animationType: momentumFeedback.streakBroken ? 'bounce' : 'curve',
        duration: 1900,
      }
    );

    if (momentumFeedback.unlockedNow) {
      showFloatingText(
        `${momentumFeedback.tendencyLabel} yolu acildi!`,
        SCREEN_WIDTH * 0.22,
        165,
        '#fcd34d',
        {
          animationType: 'bounce',
          duration: 2200,
        }
      );
    }
  }, [handleEventChoice, resolveChoice, showFloatingText]);

  const handleReroll = useCallback(() => {
    if (!lastSelectedChoiceRef.current) return;
    const { choice, index } = lastSelectedChoiceRef.current;
    rerollChoice(choice, index);
  }, [rerollChoice]);

  const handleContinue = useCallback(() => {
    const elapsed = Date.now() - resultPhaseEnteredAtRef.current;
    if (elapsed < MIN_RESULT_DISPLAY_TIME || continueHandledRef.current) return;

    continueHandledRef.current = true;
    buttonPress();
    updateGameState({
      phase: 'HUB',
      lastResult: null,
      currentEvent: null,
    });
  }, [updateGameState]);

  const isBreakdownEvent = gameState.phase === 'EVENT' && gameState.currentEvent?.personalityCategory === 'BREAKDOWN';
  const isDramaticEvent = gameState.phase === 'EVENT' && gameState.currentEvent != null && (
    (gameState.currentEvent.difficulty ?? 0) >= 4 ||
    (gameState.currentEvent.tags ?? []).some(tag => tag === 'milestone' || tag === 'turning_point')
  );

  useEffect(() => {
    if (isDramaticEvent && !isBreakdownEvent) milestoneHaptic();
  }, [gameState.currentEvent?.id, isBreakdownEvent, isDramaticEvent]);

  useEffect(() => {
    if (gameState.phase === 'EVENT' && gameState.currentEvent?.id) {
      eventStart();
    }
  }, [gameState.currentEvent?.id, gameState.phase]);

  useEffect(() => {
    if (!isBreakdownEvent) {
      breakdownShakeX.setValue(0);
      return;
    }

    const animation = Animated.sequence([
      Animated.timing(breakdownShakeX, { toValue: -8, duration: 45, useNativeDriver: true }),
      Animated.timing(breakdownShakeX, { toValue: 8, duration: 45, useNativeDriver: true }),
      Animated.timing(breakdownShakeX, { toValue: -6, duration: 40, useNativeDriver: true }),
      Animated.timing(breakdownShakeX, { toValue: 6, duration: 40, useNativeDriver: true }),
      Animated.timing(breakdownShakeX, { toValue: -3, duration: 35, useNativeDriver: true }),
      Animated.timing(breakdownShakeX, { toValue: 3, duration: 35, useNativeDriver: true }),
      Animated.timing(breakdownShakeX, { toValue: 0, duration: 35, useNativeDriver: true }),
    ]);
    animation.start();

    return () => {
      animation.stop();
      breakdownShakeX.setValue(0);
    };
  }, [breakdownShakeX, gameState.currentEvent?.id, isBreakdownEvent]);

  useEffect(() => {
    if (gameState.phase !== 'RESULT' || !gameState.lastResult?.changes) return;
    const hasNegative = Object.values(gameState.lastResult.changes).some(v => typeof v === 'number' && v < 0);
    if (hasNegative) badOutcomeHaptic();
  }, [gameState.phase, gameState.lastResult]);

  const eventChoiceSet = useMemo(() => getEventChoiceSet(gameState), [gameState]);

  const choicesToRender = useMemo(() => getChoicesToRender({
    currentEvent: gameState.currentEvent,
    resolveChoice,
    personality: gameState.personality,
    stats,
    family: gameState.family,
    skills: gameState.skills,
    npcRoles: gameState.npcs.map(npc => npc.role),
    eventChoiceSet,
  }), [eventChoiceSet, gameState.currentEvent, gameState.family, gameState.npcs, gameState.personality, gameState.skills, resolveChoice, stats]);

  const eventText = useMemo(() => (
    gameState.currentEvent ? resolveEventText(gameState.currentEvent) : null
  ), [gameState.currentEvent, resolveEventText]);

  return {
    gameState,
    stats,
    choicesToRender,
    resolveChoice,
    handleChoice,
    handleContinue,
    handleReroll,
    selectedChoice: lastSelectedChoiceRef.current?.choice ?? null,
    canReroll: !!lastSelectedChoiceRef.current,
    buttonEnabled,
    breakdownShakeX,
    isBreakdownEvent,
    isDramaticEvent,
    eventText,
  };
};

