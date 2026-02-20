import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { devLog } from '../utils/devLogger';
import { AccessibilityInfo, View, Text, ScrollView, Animated, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useGame } from '../context/GameContext';
import { useUI } from '../context/UIContext';
import { useEvents } from '../hooks/useEvents';
import { usePlayerStats, useGameActions, useFloatingTexts } from '../hooks/useGameSelectors';
import { Z_INDEX } from '../constants/zIndex';
import { Choice, Family, Skills, Stats, PersonalityRequirement, Personality, NPCRole } from '../types';
import { TraitProgressChip } from '../components/TraitProgressChip';
import {
  FadeInUpView,
  eventStart,
  buttonPress,
  importantDecision,
  badOutcomeHaptic,
  milestoneHaptic,
} from '../animations';
import { AnimatedButton } from '../animations/ButtonAnimations';
import { Card, StatChange, TypewriterText } from '../components/ui';
import { getEventChoiceSet } from '../utils/gameStateAdapter';
import { ensureTextContrast } from '../utils/colorContrast';
import { SwipeChoiceDeck } from '../components/SwipeChoiceDeck';
import { FateTokenDisplay, hasNegativeOutcome } from '../components/FateTokenDisplay';

const SCREEN_WIDTH = Dimensions.get('window').width;

type EventVisual = {
  color: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
};

const EVENT_VISUALS: Record<string, EventVisual> = {
  SOCIAL: { color: '#3b82f6', icon: 'users', label: 'social' },
  RISK: { color: '#ea580c', icon: 'alert-triangle', label: 'risk' },
  MORAL: { color: '#7e22ce', icon: 'shield', label: 'moral' },
  CONFLICT: { color: '#dc2626', icon: 'crosshair', label: 'conflict' },
  BREAKDOWN: { color: '#b91c1c', icon: 'activity', label: 'breakdown' },
  GROWTH: { color: '#15803d', icon: 'trending-up', label: 'growth' },
};

const STAT_LABELS: Record<string, string> = {
  health: 'Saglik',
  energy: 'Enerji',
  intelligence: 'Zeka',
  charisma: 'Karizma',
  discipline: 'Disiplin',
  money: 'Para',
  familyRelation: 'Aile',
};

const SKILL_LABELS: Record<string, string> = {
  coding: 'Yazilim',
  music: 'Muzik',
  sports: 'Spor',
  design: 'Tasarim',
  athletics: 'Atletizm',
  logic: 'Mantik',
  reading: 'Okuma',
  teamwork: 'Takim',
  art: 'Sanat',
  writing: 'Yazarlik',
  work_ethic: 'Caliskanlik',
  business: 'Is',
};

const GRADE_LABELS: Record<string, string> = {
  math: 'Matematik',
  science: 'Fen Bilgisi',
  language: 'Dil',
  turkish: 'Turkce',
  history: 'Tarih',
  geography: 'Cografya',
  art: 'Sanat',
  music: 'Muzik',
};

const PERSONALITY_AXIS_LABELS: Record<keyof Personality, string> = {
  openness: 'Aciklik',
  courage: 'Cesaret',
  empathy: 'Empati',
  patience: 'Sabir',
  conformity: 'Uyum',
};

const CHOICE_TYPE_LABELS: Record<NonNullable<Choice['choiceType']>, string> = {
  PASSIVE: 'Guvenli tercih',
  CHALLENGE: 'Zorlayici tercih',
  BREAKDOWN: 'Stres patlamasi',
  NEUTRAL: 'Notr tercih',
};

const FATE_OUTCOME_LABELS: Record<string, string> = {
  BLESSED: 'Mukemmel sans',
  FORTUNATE: 'Iyi sans',
  NEUTRAL: 'Notr sans',
  UNLUCKY: 'Sanssiz',
  CURSED: 'Kotu sans',
};

export const EventScreen: React.FC = React.memo(() => {
  const { theme, metrics, t } = useUI();
  const { gameState } = useGame();
  const { stats } = usePlayerStats();
  const { updateGameState } = useGameActions();
  const { showFloatingText } = useFloatingTexts();
  const { handleEventChoice, rerollChoice, resolveEventText, resolveChoice } = useEvents();
  const insets = useSafeAreaInsets();
  const continueHandledRef = React.useRef(false);
  const resultPhaseEnteredAtRef = React.useRef<number>(0);
  const lastSelectedChoiceRef = useRef<{ choice: Choice; index: number } | null>(null);
  const breakdownShakeX = React.useRef(new Animated.Value(0)).current;
  const [buttonEnabled, setButtonEnabled] = React.useState(false);
  const MIN_RESULT_DISPLAY_TIME = 1000; // Minimum 1 second display time for user to read

  // Debug: Log state changes
  devLog.log('[EventScreen] Render - phase:', gameState.phase, 'hasEvent:', !!gameState.currentEvent, 'lastResult:', !!gameState.lastResult);

  // Reset the ref and enable button after delay when we enter RESULT phase
  React.useEffect(() => {
    if (gameState.phase === 'RESULT') {
      continueHandledRef.current = false;
      resultPhaseEnteredAtRef.current = Date.now();
      setButtonEnabled(false); // Disable immediately
      devLog.log('[EventScreen] RESULT phase entered - button will be enabled after delay');

      // Enable button after delay to prevent accidental clicks
      const timer = setTimeout(() => {
        setButtonEnabled(true);
        devLog.log('[EventScreen] Continue button is now enabled');
      }, MIN_RESULT_DISPLAY_TIME);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [gameState.phase]);

  React.useEffect(() => {
    if (gameState.phase !== 'RESULT') return;

    const feedback = gameState.lastResult?.feedback;
    if (!feedback) return;

    AccessibilityInfo?.announceForAccessibility?.(feedback);

    const changeCount = Object.values(gameState.lastResult?.changes || {}).filter(value => Number(value) !== 0).length;
    if (changeCount > 0) {
      AccessibilityInfo?.announceForAccessibility?.(`${changeCount} stat degisti`);
    }
  }, [gameState.phase, gameState.lastResult]);

  const handleChoice = useCallback((choice: any, choiceIndex: number) => {
    const resolved = typeof choice === 'function' ? resolveChoice(choice) : choice;
    lastSelectedChoiceRef.current = { choice: resolved, index: choiceIndex };
    buttonPress();
    importantDecision();
    const turnResult = handleEventChoice(choice, choiceIndex);
    const momentumFeedback = turnResult.momentumFeedback;

    if (momentumFeedback) {
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
    }
  }, [handleEventChoice, resolveChoice, showFloatingText]);

  const handleReroll = useCallback(() => {
    if (!lastSelectedChoiceRef.current) return;
    const { choice, index } = lastSelectedChoiceRef.current;
    rerollChoice(choice, index);
  }, [rerollChoice]);

  const handleContinue = useCallback((source: string = 'UNKNOWN') => {
    // Log call stack to debug auto-triggering
    devLog.log(`[EventScreen] handleContinue called from: ${source}`);
    devLog.log('[EventScreen] Stack trace:', new Error().stack);

    // Check if minimum display time has elapsed
    const timeElapsed = Date.now() - resultPhaseEnteredAtRef.current;
    if (timeElapsed < MIN_RESULT_DISPLAY_TIME) {
      devLog.log(`[EventScreen] handleContinue - BLOCKED! Only ${timeElapsed}ms elapsed, need ${MIN_RESULT_DISPLAY_TIME}ms minimum`);
      return;
    }

    // Prevent double-triggering
    if (continueHandledRef.current) {
      devLog.log('[EventScreen] handleContinue - already handled, ignoring duplicate call');
      return;
    }

    continueHandledRef.current = true;
    devLog.log('[EventScreen] handleContinue executing - transitioning to HUB');
    buttonPress();
    updateGameState({
      phase: 'HUB',
      lastResult: null,
      currentEvent: null  // Clear the event to prevent hasEvent from staying true
    });
  }, [updateGameState]);

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

  const eventChoiceSet = useMemo(
    () => getEventChoiceSet(gameState),
    [gameState]
  );

  const isBreakdownEvent = gameState.phase === 'EVENT' && gameState.currentEvent?.personalityCategory === 'BREAKDOWN';
  const isDramaticEvent = gameState.phase === 'EVENT' && gameState.currentEvent != null && (
    (gameState.currentEvent.difficulty ?? 0) >= 4 ||
    (gameState.currentEvent.tags ?? []).some(t => t === 'milestone' || t === 'turning_point')
  );

  // Dramatic event haptic feedback
  React.useEffect(() => {
    if (isDramaticEvent && !isBreakdownEvent) {
      milestoneHaptic();
    }
  }, [isDramaticEvent, isBreakdownEvent, gameState.currentEvent?.id]);

  React.useEffect(() => {
    if (gameState.phase === 'EVENT' && gameState.currentEvent?.id) {
      eventStart();
    }
  }, [gameState.phase, gameState.currentEvent?.id]);

  React.useEffect(() => {
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

  // Kötü sonuçlarda güçlü haptic
  useEffect(() => {
    if (gameState.phase === 'RESULT' && gameState.lastResult?.changes) {
      const isNegative = Object.values(gameState.lastResult.changes)
        .some(v => typeof v === 'number' && v < 0);
      if (isNegative) {
        badOutcomeHaptic();
      }
    }
  }, [gameState.phase, gameState.lastResult]);

  const meetsPersonality = (requirements: PersonalityRequirement[] | undefined, personality: Personality): boolean => {
    if (!requirements || requirements.length === 0) return true;
    return requirements.every(req => {
      const value = personality[req.axis];
      if (req.min !== undefined && value < req.min) return false;
      if (req.max !== undefined && value > req.max) return false;
      return true;
    });
  };

  const meetsStats = (reqStats: Partial<Stats> | undefined, currentStats: Stats): boolean => {
    if (!reqStats) return true;
    return Object.entries(reqStats).every(([key, value]) => {
      if (typeof value !== 'number') return true;
      const statValue = currentStats[key as keyof Stats] ?? 0;
      return statValue >= value;
    });
  };

  const meetsFamily = (
    reqFamily: { wealth?: Family['wealth'][]; dynamic?: Family['dynamic'][] } | undefined,
    family: Family | null
  ): boolean => {
    if (!reqFamily) return true;
    if (!family) return false;
    if (reqFamily.wealth && !reqFamily.wealth.includes(family.wealth)) return false;
    if (reqFamily.dynamic && !reqFamily.dynamic.includes(family.dynamic)) return false;
    return true;
  };

  const meetsSkills = (reqSkills: Partial<Skills> | undefined, skills: Skills): boolean => {
    if (!reqSkills) return true;
    return Object.entries(reqSkills).every(([key, value]) => {
      if (typeof value !== 'number') return true;
      return (skills[key as keyof Skills] ?? 0) >= value;
    });
  };

  const meetsNpcRole = useCallback((reqNPCRole: NPCRole | undefined): boolean => {
    if (!reqNPCRole) return true;
    return gameState.npcs.some(npc => npc.role === reqNPCRole);
  }, [gameState.npcs]);

  const meetsEventHistory = useCallback((
    reqEventIds: string[] | undefined,
    blockEventIds: string[] | undefined
  ): boolean => {
    if (reqEventIds && !reqEventIds.every(id => eventChoiceSet.has(id))) return false;
    if (blockEventIds && blockEventIds.some(id => eventChoiceSet.has(id))) return false;
    return true;
  }, [eventChoiceSet]);

  const choicesToRender = useMemo(() => {
    if (!gameState.currentEvent) return null;
    const filtered = gameState.currentEvent.choices.filter(choice => {
      const resolved = resolveChoice(choice);
      if (resolved.reqPersonality && !meetsPersonality(resolved.reqPersonality, gameState.personality)) return false;
      if (resolved.reqStats && !meetsStats(resolved.reqStats, stats)) return false;
      if (resolved.reqFamily && !meetsFamily(resolved.reqFamily, gameState.family)) return false;
      if (resolved.reqSkills && !meetsSkills(resolved.reqSkills, gameState.skills)) return false;
      if (resolved.reqNPCRole && !meetsNpcRole(resolved.reqNPCRole)) return false;
      if (!meetsEventHistory(resolved.reqEventIds, resolved.blockEventIds)) return false;
      return true;
    });
    return filtered.length > 0 ? filtered : gameState.currentEvent.choices;
  }, [gameState.currentEvent, gameState.family, gameState.personality, gameState.skills, meetsEventHistory, meetsNpcRole, resolveChoice, stats]);

  const outcomeDrivers = useMemo(() => {
    if (gameState.phase !== 'RESULT') return [];

    const selectedChoice = lastSelectedChoiceRef.current?.choice;
    const event = gameState.currentEvent;
    const drivers: string[] = [];

    if (event?.personalityCategory) {
      const label = EVENT_VISUALS[event.personalityCategory]?.label ?? event.personalityCategory.toLowerCase();
      drivers.push(`Event tipi: ${label}`);
    }

    if (event?.challengesAxis) {
      const axis = event.challengesAxis;
      const axisValue = gameState.personality[axis];
      drivers.push(`${PERSONALITY_AXIS_LABELS[axis]} ekseni (${Math.round(axisValue)}) sonucu etkiledi`);
    }

    if (selectedChoice?.choiceType && selectedChoice.choiceType !== 'NEUTRAL') {
      drivers.push(`Secim tipi: ${CHOICE_TYPE_LABELS[selectedChoice.choiceType]}`);
    }

    if (selectedChoice?.reqStats) {
      const matchedStatReqs = Object.entries(selectedChoice.reqStats)
        .filter(([, value]) => typeof value === 'number')
        .map(([key, value]) => {
          const current = stats[key as keyof Stats] ?? 0;
          return `${STAT_LABELS[key] ?? key} ${current}/${value}`;
        });
      if (matchedStatReqs.length > 0) {
        drivers.push(`Stat kosulu: ${matchedStatReqs.slice(0, 2).join(', ')}`);
      }
    }

    if (selectedChoice?.reqSkills) {
      const matchedSkillReqs = Object.entries(selectedChoice.reqSkills)
        .filter(([, value]) => typeof value === 'number')
        .map(([key, value]) => {
          const current = gameState.skills[key as keyof Skills] ?? 0;
          return `${SKILL_LABELS[key] ?? key} ${current}/${value}`;
        });
      if (matchedSkillReqs.length > 0) {
        drivers.push(`Beceri kosulu: ${matchedSkillReqs.slice(0, 2).join(', ')}`);
      }
    }

    if (selectedChoice?.reqPersonality?.length) {
      const reqPreview = selectedChoice.reqPersonality
        .slice(0, 2)
        .map((req) => {
          const axisLabel = PERSONALITY_AXIS_LABELS[req.axis];
          const current = gameState.personality[req.axis];
          if (req.min !== undefined) return `${axisLabel} ${Math.round(current)}/${req.min}+`;
          if (req.max !== undefined) return `${axisLabel} ${Math.round(current)}/${req.max}-`;
          return axisLabel;
        })
        .join(', ');

      if (reqPreview) {
        drivers.push(`Kisilik kosulu: ${reqPreview}`);
      }
    }

    const fateRoll = gameState.lastResult?.fateRoll;
    if (fateRoll) {
      const outcomeLabel = FATE_OUTCOME_LABELS[fateRoll.outcome] ?? fateRoll.outcome;
      drivers.push(`Kader etkisi: ${outcomeLabel} (rulo ${fateRoll.modifiedRoll})`);
    }

    return drivers.slice(0, 4);
  }, [gameState.currentEvent, gameState.lastResult?.fateRoll, gameState.personality, gameState.phase, gameState.skills, stats]);

  // Don't render anything if not in EVENT or RESULT phase
  if (gameState.phase !== 'EVENT' && gameState.phase !== 'RESULT') {
    devLog.log('[EventScreen] Returning null - phase:', gameState.phase);
    return null;
  }

    // RESULT phase - Show feedback and continue button
  if (gameState.phase === 'RESULT') {
    const rawFeedback = gameState.lastResult?.feedback || t('event.defaultFeedback', undefined, 'Devam ediyorsun...');
    const wasDramatic = (gameState.currentEvent?.difficulty ?? 0) >= 4;
    const feedbackText = wasDramatic ? `Bu kararın hayatını değiştirdi. ${rawFeedback}` : rawFeedback;

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
          <Card style={{ marginBottom: 20, borderRadius: 16 }} padded>
            <TypewriterText
              text={feedbackText}
              speed={26}
              accessibilityLabel="Event sonucu"
              style={{
                color: theme.textPrimary,
                fontSize: 17,
                fontWeight: '500',
                lineHeight: 26,
              }}
            />
          </Card>

          {outcomeDrivers.length > 0 && (
            <Card style={{ marginBottom: 16, borderRadius: 14 }} padded>
              <Text style={{ color: theme.textPrimary, fontSize: 14, fontWeight: '700', marginBottom: 8 }}>
                Neden bu sonuc?
              </Text>
              {outcomeDrivers.map((line, index) => (
                <Text
                  key={`${line}_${index}`}
                  style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 19, marginBottom: index === outcomeDrivers.length - 1 ? 0 : 4 }}
                >
                  - {line}
                </Text>
              ))}
            </Card>
          )}

          {gameState.lastResult?.traitProgressUpdates && gameState.lastResult.traitProgressUpdates.length > 0 && (
            <View style={{ marginBottom: 16 }}>
              <TraitProgressChip
                traits={gameState.lastResult.traitProgressUpdates}
                theme={theme}
              />
            </View>
          )}

          <AnimatedButton
            onPress={() => {
              handleContinue('BUTTON');
            }}
            disabled={!buttonEnabled}
            animationType="pressScale"
            style={{ ...buttonStyle, opacity: buttonEnabled ? 1 : 0.7 }}
            accessibilityRole="button"
            accessibilityLabel={t('common.continue', undefined, 'Devam Et')}
            accessibilityHint="Sonraki tura gecer"
          >
            <Text style={buttonTextStyle}>
              {buttonEnabled
                ? t('common.continue', undefined, 'Devam Et')
                : t('common.reading', undefined, 'Okunuyor...')}
            </Text>
          </AnimatedButton>

          {/* Kader Jetonu — negatif sonuçlarda göster */}
          {gameState.fate && gameState.fate.tokens > 0 && hasNegativeOutcome(gameState.lastResult?.changes) && (
            <FateTokenDisplay
              tokens={gameState.fate.tokens}
              fateRoll={gameState.lastResult?.fateRoll}
              onReroll={handleReroll}
              canReroll={!!lastSelectedChoiceRef.current}
              theme={theme}
              metrics={metrics}
            />
          )}

          <FadeInUpView delay={100}>
            {gameState.lastResult?.changes && Object.keys(gameState.lastResult.changes).length > 0 && (
              <View style={{ marginTop: 16 }}>
                <Text style={{ color: theme.accentStat, fontSize: 13, marginBottom: 8, fontWeight: '700' }}>
                  [Stat] {t('event.statChanges', undefined, 'Istatistikler')}
                </Text>
                <StatChange icon="S" changes={gameState.lastResult.changes} labels={STAT_LABELS} />
              </View>
            )}

            {gameState.lastResult?.skillChanges && Object.keys(gameState.lastResult.skillChanges).length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: theme.accentSkill, fontSize: 13, marginBottom: 8, fontWeight: '700' }}>
                  [Skill] {t('event.skillChanges', undefined, 'Beceriler')}
                </Text>
                <StatChange
                  icon="K"
                  changes={gameState.lastResult.skillChanges as Record<string, number>}
                  labels={SKILL_LABELS}
                />
              </View>
            )}

            {gameState.lastResult?.gradeChanges && Object.keys(gameState.lastResult.gradeChanges).length > 0 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: theme.accentSkill, fontSize: 13, marginBottom: 8, fontWeight: '700' }}>
                  [Grade] {t('event.gradeChanges', undefined, 'Okul Notlari')}
                </Text>
                <StatChange
                  icon="N"
                  changes={gameState.lastResult.gradeChanges as Record<string, number>}
                  labels={GRADE_LABELS}
                />
              </View>
            )}
          </FadeInUpView>
        </ScrollView>
      </View>
    );
  }

  // EVENT phase - Show event and choices
  if (!gameState.currentEvent) {
    devLog.log('[EventScreen] Returning null - no currentEvent');
    return null;
  }

  devLog.log('[EventScreen] Rendering event:', gameState.currentEvent?.id);

  const evt = gameState.currentEvent;
  const eventText = resolveEventText(evt);
  const eventVisual = EVENT_VISUALS[evt.personalityCategory || ''] || { color: theme.accentEvent, icon: 'bell', label: 'event' };
  const eventColor = ensureTextContrast(eventVisual.color, theme.surfaceBase, 4.5);

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
        <FadeInUpView>
          <Animated.View style={isBreakdownEvent ? { transform: [{ translateX: breakdownShakeX }] } : undefined}>
            <Card
              style={[
                eventCardStyle,
                {
                  borderColor: isDramaticEvent ? '#d97706' : eventColor,
                  borderLeftWidth: isDramaticEvent ? 3 : 4,
                  borderWidth: isDramaticEvent ? 2 : 1,
                  overflow: 'hidden',
                },
              ]}
            >
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 44,
                  backgroundColor: `${eventColor}12`,
                }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
                <Feather name={eventVisual.icon} size={14} color={eventColor} />
                <Text
                  allowFontScaling
                  style={{
                    color: eventColor,
                    fontSize: 12,
                    fontWeight: '700',
                    fontFamily: theme.fontHeading,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {eventVisual.label}
                </Text>
              </View>

              {isDramaticEvent && (
                <View style={{
                  backgroundColor: 'rgba(217, 119, 6, 0.12)',
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  marginBottom: 10,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <Text style={{ fontSize: 14 }}>
                    {(evt.tags ?? []).includes('turning_point') ? '\uD83C\uDF1F' : '\u26A1'}
                  </Text>
                  <Text style={{
                    color: '#d97706',
                    fontSize: 12,
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}>
                    {(evt.tags ?? []).includes('turning_point') ? 'Dönüm Noktası' : 'Kritik Karar'}
                  </Text>
                </View>
              )}

              <TypewriterText
                text={eventText}
                speed={28}
                accessibilityLabel="Event metni"
                style={eventTextStyle}
              />
            </Card>
          </Animated.View>
        </FadeInUpView>

        <SwipeChoiceDeck
          choices={choicesToRender ?? evt.choices}
          resolveChoice={resolveChoice}
          onChoiceSelected={handleChoice}
          isBreakdownEvent={isBreakdownEvent}
          originalChoices={evt.choices}
          personalityState={gameState.personalityState}
        />
      </ScrollView>
    </View>
  );
});
EventScreen.displayName = 'EventScreen';
