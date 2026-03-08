import React, { useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useGame } from '../context/GameContext';
import { useMetaProgression } from '../context/MetaProgressionContext';
import { useUI } from '../context/UIContext';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
import { getTraitName } from '../data/traits';
import {
  EndingGoal,
  calculateAllGoalScores,
  getEndingHints,
  generateFutureVision,
  resolveEnding,
  TOTAL_ENDING_COUNT,
  ENDING_ID_LOOKUP,
} from '../utils/endingResolver';
import { buildLifeStoryNarrative } from '../utils/memoryLogic';
import { buildNarrativeWeightBreakdown } from '../utils/narrativeWeight';
import { calculateLegacyPointsForRun, createInitialMetaProgression } from '../utils/metaProgression';
import {
  getRemainingRewardedAds,
  showContextualRewardedAd,
  showInterstitialAdDetailed,
} from '../services/monetization';
import {
  logInterstitialOpportunity,
  logInterstitialResult,
  logRewardedAdRequested,
  logRewardedAdResult,
  logShareEvent,
} from '../utils/analyticsEvents';
import { LifeGoal, PersonalityTendency } from '../types';
import { normalizePersonalityState } from '../systems/PersonalityMomentumEngine';
import { RunCard } from '../components/RunCard';
import {
  FadeInDownView,
  FadeInUpView,
  FadeInLeftView,
  FadeInRightView,
  StaggeredFadeIn,
  ShimmerButton,
  CountUpText,
  buttonPress,
  successHaptic,
} from '../animations';

const MAX_AGE = 18;

interface GameOverScreenProps {
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  onRestart: () => void;
}

const getTierBadgeColor = (tier: string): string => {
  if (tier === 'LEGENDARY') return '#f59e0b';
  if (tier === 'SUCCESS') return '#22c55e';
  if (tier === 'NORMAL') return '#3b82f6';
  return '#ef4444';
};

const ENDING_GOAL_TO_LIFE_GOAL: Record<EndingGoal, LifeGoal | null> = {
  ACADEMIC: 'ACADEMIC',
  ATHLETIC: 'ATHLETIC',
  CREATIVE: 'CREATIVE',
  SOCIAL: 'SOCIAL',
  ENTERPRISE: 'WEALTH',
  BALANCED: null,
};

const LIFE_GOAL_LABELS: Record<LifeGoal, string> = {
  ACADEMIC: 'Akademik',
  ATHLETIC: 'Atletik',
  CREATIVE: 'Yaratıcı',
  WEALTH: 'Finansal',
  SOCIAL: 'Sosyal',
};

const firstSentence = (value: string): string => {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  const match = normalized.match(/^[^.!?]+[.!?]?/);
  return match ? match[0].trim() : normalized;
};

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ theme, metrics, onRestart }) => {
  const { gameState, playerName, stats } = useGame();
  const { t } = useUI();
  const { metaProgression } = useMetaProgression();
  const safeMeta = metaProgression ?? createInitialMetaProgression();

  const endingResolution = useMemo(() => (
    resolveEnding({
      gameState,
      stats,
      achievements: gameState.unlockedAchievements,
    })
  ), [gameState, stats]);

  const {
    result,
    goalLabel,
    selectedGoalLabel,
    inferredGoalLabel,
    mismatchFailure,
    compatibilityScore,
    score: finalScore,
    errorDebt,
    achievementFlavor,
    tier,
    socialSummary,
    scoreBreakdown,
  } = endingResolution;
  const socialEpilogue = socialSummary ?? [];

  const runLegacyPoints = useMemo(() => (
    calculateLegacyPointsForRun({
      tier,
      compatibilityScore,
      unlockedAchievementIds: (gameState.unlockedAchievements || []).map(item => item.achievementId),
    })
  ), [compatibilityScore, gameState.unlockedAchievements, tier]);

  const farewellNarrative = useMemo(() => {
    const normalized = normalizePersonalityState(gameState.personalityState);
    const dominant = (['HELPFUL', 'PRAGMATIC', 'AGGRESSIVE'] as PersonalityTendency[])
      .slice()
      .sort((a, b) => normalized[b].multiplier - normalized[a].multiplier)[0];
    const base = dominant
      ? t(`endings.personalities.${dominant}`, undefined, '')
      : t('endings.personalities.DEFAULT', undefined, 'You walked your own path in your own way.');
    return `${playerName}... ${base}`;
  }, [gameState.personalityState, playerName, t]);

  const activeScars = gameState.scars ?? [];

  const narrativeBreakdown = useMemo(() => (
    buildNarrativeWeightBreakdown(gameState.memories ?? [], gameState.scars)
  ), [gameState.memories, gameState.scars]);

  const lifeStory = useMemo(() => {
    const normalized = normalizePersonalityState(gameState.personalityState);
    const dominant = (['HELPFUL', 'PRAGMATIC', 'AGGRESSIVE'] as PersonalityTendency[])
      .slice()
      .sort((a, b) => normalized[b].streak - normalized[a].streak)[0] ?? null;
    return buildLifeStoryNarrative(
      gameState.memories,
      gameState.personality,
      dominant,
      gameState.family,
      gameState.traits,
      playerName,
    );
  }, [gameState.memories, gameState.personality, gameState.personalityState, gameState.family, gameState.traits, playerName]);

  const bestAlternativeGoal = useMemo(() => {
    const allScores = calculateAllGoalScores(gameState, stats);
    const selectedEndingGoal = endingResolution.goal;
    return allScores.find(s => s.goal !== selectedEndingGoal) ?? null;
  }, [gameState, stats, endingResolution.goal]);

  const alternativeSuggestion = useMemo(() => {
    if (!bestAlternativeGoal) return null;
    return t(`endings.suggestions.${bestAlternativeGoal.goal}`, undefined, '');
  }, [bestAlternativeGoal, t]);

  const alternativeEndingPreview = useMemo(() => {
    if (!bestAlternativeGoal) return null;
    const mappedGoal = ENDING_GOAL_TO_LIFE_GOAL[bestAlternativeGoal.goal];
    const simulatedState = { ...gameState, selectedGoal: mappedGoal };
    return resolveEnding({
      gameState: simulatedState,
      stats,
      achievements: gameState.unlockedAchievements,
    });
  }, [bestAlternativeGoal, gameState, stats]);
  const futureVision = useMemo(() => (
    generateFutureVision(stats, endingResolution, playerName)
  ), [endingResolution, playerName, stats]);
  const futureMoodIcon = useMemo(() => {
    if (futureVision.mood === 'optimistic') return '\u{1F31F}';
    if (futureVision.mood === 'somber') return '\u{1F327}\uFE0F';
    return '\u{1F325}\uFE0F';
  }, [futureVision.mood]);

  const shareCardRef = useRef<ViewShot | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [altEndingUnlocked, setAltEndingUnlocked] = useState(false);
  const [altEndingUnlocking, setAltEndingUnlocking] = useState(false);

  const discoveredEndingCount = useMemo(() => {
    const discovered = new Set(safeMeta.lifetimeEndingIds || []);
    discovered.add(endingResolution.id);
    return discovered.size;
  }, [endingResolution.id, safeMeta.lifetimeEndingIds]);

  const dominantGoalPath = useMemo<LifeGoal>(() => {
    const mapped = ENDING_GOAL_TO_LIFE_GOAL[endingResolution.goal];
    return mapped ?? gameState.selectedGoal ?? 'SOCIAL';
  }, [endingResolution.goal, gameState.selectedGoal]);

  const endingHints = useMemo(() => (
    getEndingHints(safeMeta, compatibilityScore, dominantGoalPath)
  ), [safeMeta, compatibilityScore, dominantGoalPath]);

  const lifeStorySummary = useMemo(() => {
    const firstParagraph = lifeStory.paragraphs[0] || '';
    const sentence = firstSentence(firstParagraph);
    return sentence || t('endings.shareCard.defaultSummary');
  }, [lifeStory.paragraphs, t]);

  const handleShareLife = async () => {
    if (isSharing) return;

    setIsSharing(true);
    try {
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        Alert.alert(
          t('messages.sharingUnavailable'),
          t('messages.sharingNotSupported')
        );
        return;
      }

      const uri = await shareCardRef.current?.capture?.();
      if (!uri) {
        Alert.alert(
          t('messages.sharingNotReady'),
          t('messages.cardCreationFailed')
        );
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: t('messages.shareTitle'),
      });

      void logShareEvent({
        tier,
        endingId: endingResolution.id,
        legacyLevel: safeMeta.legacyLevel,
      });
    } catch (error) {
      console.error('Failed to share life card:', error);
      Alert.alert(
        t('messages.sharingFailed'),
        t('messages.cardSharingFailed')
      );
    } finally {
      setIsSharing(false);
    }
  };

  const handleUnlockAlternativeEnding = async () => {
    if (altEndingUnlocking || !bestAlternativeGoal) return;

    setAltEndingUnlocking(true);
    const remainingBefore = getRemainingRewardedAds();
    void logRewardedAdRequested({
      placement: 'ending_alternative',
      rewardType: 'utility',
      remainingBefore,
    });

    try {
      const adResult = await showContextualRewardedAd('ending_alternative');
      const remainingAfter = getRemainingRewardedAds();

      if (!adResult.success) {
        void logRewardedAdResult({
          placement: 'ending_alternative',
          rewardType: 'utility',
          success: false,
          remainingAfter,
          errorMessage: adResult.error,
        });
        Alert.alert(
          t('messages.adNotShown'),
          adResult.error || t('messages.tryAgain')
        );
        return;
      }

      setAltEndingUnlocked(true);
      void logRewardedAdResult({
        placement: 'ending_alternative',
        rewardType: 'utility',
        success: true,
        amount: 1,
        remainingAfter,
      });
    } finally {
      setAltEndingUnlocking(false);
    }
  };

  const handleRestart = async () => {
    buttonPress();
    successHaptic();
    void logInterstitialOpportunity({ placement: 'game_over_restart' });
    const interstitial = await showInterstitialAdDetailed();
    void logInterstitialResult({
      placement: 'game_over_restart',
      shown: interstitial.shown,
      reason: interstitial.reason,
    });
    onRestart();
  };

  const cardStyle = {
    backgroundColor: theme.surfaceBase,
    borderRadius: 14,
    borderWidth: 1 as const,
    borderColor: theme.border,
    padding: metrics.pad,
    marginBottom: 12,
  };

  const tierColor = getTierBadgeColor(tier);

  return (
    <View style={{ flex: 1, backgroundColor: theme.appBg }}>
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: metrics.pad }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        overScrollMode="never"
        bounces={false}
      >
        <View style={cardStyle}>
          <FadeInDownView delay={0}>
            <Text style={{ color: theme.textPrimary, fontSize: 48, fontWeight: '800', textAlign: 'center', marginBottom: 16 }}>
              {result.emoji}
            </Text>
          </FadeInDownView>

          <FadeInDownView delay={80}>
            <Text style={{
              color: theme.textPrimary,
              fontSize: 26,
              fontWeight: '800',
              fontFamily: theme.fontHeading,
              textAlign: 'center',
              marginBottom: 6,
            }}>
              {t('endings.title')}
            </Text>
          </FadeInDownView>

          <FadeInUpView delay={95}>
            <Text style={{
              color: theme.accentBrand,
              fontFamily: theme.fontBody,
              textAlign: 'center',
              marginBottom: 10,
              fontWeight: '700',
            }}>
              {'\u{1F5DD}\uFE0F'} {t(
                'endings.discoveredCount',
                { discovered: discoveredEndingCount, total: TOTAL_ENDING_COUNT },
                '{discovered} / {total} son kesfedildi'
              )}
            </Text>
          </FadeInUpView>

          <FadeInUpView delay={100}>
            <ShimmerButton
              onPress={handleShareLife}
              disabled={isSharing}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 14,
                borderRadius: 12,
                alignItems: 'center',
                overflow: 'hidden',
                backgroundColor: `${tierColor}22`,
                borderWidth: 1,
                borderColor: tierColor,
                marginBottom: 12,
                opacity: isSharing ? 0.7 : 1,
              }}
            >
              <Text style={{
                color: tierColor,
                fontWeight: '800',
                fontFamily: theme.fontHeading,
                fontSize: 14,
              }}>
                {isSharing
                  ? t('ui.cardPreparing')
                  : t('buttons.shareLife')}
              </Text>
            </ShimmerButton>
          </FadeInUpView>

          <FadeInUpView delay={110}>
            <Text style={{
              color: theme.textSecondary,
              fontFamily: theme.fontBody,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 12,
              fontStyle: 'italic',
            }}>
              {farewellNarrative}
            </Text>
          </FadeInUpView>

          <FadeInUpView delay={150}>
            <Text style={{ color: theme.textSecondary, fontFamily: theme.fontBody, textAlign: 'center', marginBottom: 8 }}>
              {t('endings.completedAge', { name: playerName, age: MAX_AGE }, '{name} {age} yasini tamamladi')}
            </Text>
          </FadeInUpView>

          <FadeInUpView delay={220}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={{ backgroundColor: `${tierColor}22`, borderColor: tierColor, borderWidth: 1, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 8 }}>
                <Text style={{ color: tierColor, fontSize: 11, fontWeight: '700' }}>
                  {t(`endings.tiers.${tier}`, undefined, tier)}
                </Text>
              </View>
              <Text style={{ color: theme.textPrimary, fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
                {result.title}
              </Text>
              <Text style={{ color: theme.textSecondary, textAlign: 'center', lineHeight: 20 }}>
                {result.description}
              </Text>
            </View>
          </FadeInUpView>

          <FadeInUpView delay={280}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                  {t('endings.analysisTitle')}
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 }}>
                <FadeInLeftView delay={330}>
                  <View style={{ alignItems: 'center' }}>
                    <CountUpText
                      value={Math.round(compatibilityScore)}
                      style={{ color: theme.accentSkill, fontWeight: '700', fontSize: 18 }}
                    />
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                      {t('endings.compatibilityScore')}
                    </Text>
                  </View>
                </FadeInLeftView>
                <FadeInRightView delay={330}>
                  <View style={{ alignItems: 'center' }}>
                    <CountUpText
                      value={Math.round(errorDebt.total)}
                      style={{ color: theme.accentStat, fontWeight: '700', fontSize: 18 }}
                    />
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                      {t('endings.errorDebt')}
                    </Text>
                  </View>
                </FadeInRightView>
                <FadeInRightView delay={360}>
                  <View style={{ alignItems: 'center' }}>
                    <CountUpText
                      value={gameState.traits.length}
                      style={{ color: theme.accentGrade, fontWeight: '700', fontSize: 18 }}
                    />
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>
                      {t('endings.traits')}
                    </Text>
                  </View>
                </FadeInRightView>
              </View>
            </View>
          </FadeInUpView>

          {scoreBreakdown && (
            <FadeInUpView delay={315}>
              <View style={{
                marginBottom: 16,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.surfaceOverlay,
                padding: metrics.pad,
              }}>
                <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14, marginBottom: 10 }}>
                  {t('endings.scoreBreakdown.title')}
                </Text>
                {([
                  { label: t('endings.scoreBreakdown.rawScore'), value: scoreBreakdown.rawScore, positive: true },
                  scoreBreakdown.achievementBonus > 0 && { label: t('endings.scoreBreakdown.achievements'), value: scoreBreakdown.achievementBonus, positive: true },
                  scoreBreakdown.difficultyModifier !== 0 && { label: t('endings.scoreBreakdown.difficulty'), value: scoreBreakdown.difficultyModifier, positive: scoreBreakdown.difficultyModifier > 0 },
                  scoreBreakdown.memoryBonus > 0 && { label: t('endings.scoreBreakdown.memories'), value: scoreBreakdown.memoryBonus, positive: true },
                  scoreBreakdown.debtPenalty > 0 && { label: t('endings.scoreBreakdown.debt'), value: -scoreBreakdown.debtPenalty, positive: false },
                  scoreBreakdown.scarPenalty > 0 && { label: t('endings.scoreBreakdown.scars'), value: -scoreBreakdown.scarPenalty, positive: false },
                  scoreBreakdown.mismatchPenalty > 0 && { label: t('endings.scoreBreakdown.mismatch'), value: -scoreBreakdown.mismatchPenalty, positive: false },
                  scoreBreakdown.versatilityPenalty > 0 && { label: t('endings.scoreBreakdown.versatility'), value: -scoreBreakdown.versatilityPenalty, positive: false },
                ] as const).filter(Boolean).map((item, i) => {
                  if (!item) return null;
                  const barWidth = Math.min(100, Math.abs(item.value));
                  return (
                    <View key={i} style={{ marginBottom: 8 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
                        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{item.label}</Text>
                        <Text style={{ color: item.positive ? '#22c55e' : '#ef4444', fontSize: 12, fontWeight: '700' }}>
                          {item.value > 0 ? '+' : ''}{Math.round(item.value)}
                        </Text>
                      </View>
                      <View style={{ height: 4, backgroundColor: theme.border, borderRadius: 2, overflow: 'hidden' }}>
                        <View style={{ height: '100%', width: `${barWidth}%`, backgroundColor: item.positive ? '#22c55e' : '#ef4444', borderRadius: 2 }} />
                      </View>
                    </View>
                  );
                })}
                <View style={{ height: 1, backgroundColor: theme.border, marginVertical: 8 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 13 }}>
                    {t('endings.scoreBreakdown.total')}
                  </Text>
                  <Text style={{ color: getTierBadgeColor(tier), fontWeight: '800', fontSize: 15 }}>
                    {Math.round(finalScore)}
                  </Text>
                </View>
              </View>
            </FadeInUpView>
          )}

          {endingHints.length > 0 && (
            <FadeInUpView delay={320}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                  {t('endings.discoveryHints')}
                </Text>
                {endingHints.map((hint, index) => (
                  <View
                    key={`${hint.goalPath}_${hint.tier}_${index}`}
                    style={{
                      borderWidth: 1,
                      borderColor: theme.border,
                      backgroundColor: theme.surfaceOverlay,
                      borderRadius: 10,
                      paddingVertical: 8,
                      paddingHorizontal: 10,
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 13 }}>
                      {LIFE_GOAL_LABELS[hint.goalPath]} {hint.tier}
                    </Text>
                    <Text style={{ color: theme.textSecondary, marginTop: 2, fontSize: 12 }}>
                      {t('endings.progressHint', { percent: hint.progressPercent }, `%${hint.progressPercent} yaklaştın`)}
                    </Text>
                  </View>
                ))}
              </View>
            </FadeInUpView>
          )}

          <FadeInUpView delay={340}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                {t('endings.goalLabel')}
              </Text>
              <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{selectedGoalLabel}</Text>
              {selectedGoalLabel !== goalLabel && (
                <Text style={{ color: theme.textSecondary, marginTop: 2 }}>
                  {`${t('endings.activeCalculation')}${goalLabel}`}
                </Text>
              )}
              {mismatchFailure && (
                <Text style={{ color: '#f97316', marginTop: 6, lineHeight: 18 }}>
                  {t(
                    'endings.unexpectedPath',
                    { inferred: inferredGoalLabel },
                    'Beklenmedik Yol: secilen hedeften farkli olarak {inferred} rotasinda daha guclu bir profil olusturdun.'
                  )}
                </Text>
              )}
              {errorDebt.reasons.length > 0 && (
                <Text style={{ color: theme.textSecondary, marginTop: 6, lineHeight: 18 }}>
                  {`${t('endings.criticalDebts')}${errorDebt.reasons.slice(0, 2).join(', ')}`}
                </Text>
              )}
            </View>
          </FadeInUpView>

          {achievementFlavor.length > 0 && (
            <FadeInUpView delay={380}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                  {t('endings.achievementImpact')}
                </Text>
                {achievementFlavor.slice(0, 2).map((line, index) => (
                  <Text key={`${line}_${index}`} style={{ color: theme.textPrimary, marginBottom: 4, lineHeight: 18 }}>
                    - {line}
                  </Text>
                ))}
              </View>
            </FadeInUpView>
          )}

          {gameState.traits.length > 0 && (
            <FadeInUpView delay={420}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                  {t('endings.gainedTraits')}
                </Text>
                <StaggeredFadeIn>
                  {gameState.traits.map((traitId) => (
                    <View key={traitId} style={{
                      backgroundColor: theme.surfaceOverlay,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      marginBottom: 4,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}>
                      <Text style={{ color: theme.accentEvent, fontWeight: '600', fontSize: 13 }}>
                        {'\u2728'} {getTraitName(traitId)}
                      </Text>
                    </View>
                  ))}
                </StaggeredFadeIn>
              </View>
            </FadeInUpView>
          )}

          {socialEpilogue.length > 0 && (
            <FadeInUpView delay={440}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                  {t('social.epilogue.title')}
                </Text>
                <View style={{ borderTopWidth: 1, borderTopColor: theme.border }}>
                  {socialEpilogue.map((summary) => {
                    return (
                      <View
                        key={`${summary.name}_${summary.role}`}
                        style={{
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: theme.border,
                        }}
                      >
                        <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
                          {summary.emoji} {summary.name}
                        </Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                          {summary.narrativeLine}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            </FadeInUpView>
          )}

          {lifeStory.paragraphs.length > 0 && (
            <FadeInUpView delay={450}>
              <View style={{
                marginBottom: 16,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: theme.border,
                backgroundColor: theme.surfaceOverlay,
                padding: metrics.pad,
              }}>
                <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 10 }}>
                  {'\u{1F4DC}'} {t('endings.lifeStory.title')}
                </Text>
                {lifeStory.paragraphs.map((para, i) => (
                  <Text
                    key={i}
                    style={{
                      color: theme.textSecondary,
                      fontSize: 13,
                      lineHeight: 20,
                      marginBottom: i < lifeStory.paragraphs.length - 1 ? 10 : 0,
                    }}
                  >
                    {para}
                  </Text>
                ))}
              </View>
            </FadeInUpView>
          )}

          {(() => {
            const EMOTION_EMOJI: Record<string, string> = { PRIDE: '\u{1F31F}', GUILT: '\uD83D\uDE14', REGRET: '\u{1F4AD}', SATISFACTION: '\u2705', NEUTRAL: '\u25CB' };
            const EMOTION_LABEL: Record<string, string> = { PRIDE: 'Gurur', GUILT: 'Pişmanlık', REGRET: 'Üzüntü', SATISFACTION: 'Tatmin', NEUTRAL: 'Nötr' };
            const turningPoints = (gameState.memories ?? [])
              .filter(m => m.weight === 'HIGH')
              .sort((a, b) => a.age - b.age);
            if (turningPoints.length === 0) return null;
            return (
              <FadeInUpView delay={448}>
                <View style={{
                  marginBottom: 16,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceOverlay,
                  padding: metrics.pad,
                }}>
                  <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 10 }}>
                    {t('endings.turningPoints.title')}
                  </Text>
                  {turningPoints.map((mem, i) => (
                    <View key={mem.id} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: i < turningPoints.length - 1 ? 10 : 0, gap: 10 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: theme.surfaceRaised, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 18 }}>{EMOTION_EMOJI[mem.emotion] ?? '\u25CB'}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={{ color: theme.textPrimary, fontWeight: '600', fontSize: 13 }}>
                          {mem.eventId.replace(/_/g, ' ')}
                        </Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 1 }}>
                          {mem.age} {t('character.ageUnit')} — {EMOTION_LABEL[mem.emotion] ?? mem.emotion}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </FadeInUpView>
            );
          })()}

          {(narrativeBreakdown.positiveMemories.length > 0 || narrativeBreakdown.negativeMemories.length > 0) && (
            <FadeInUpView delay={450}>
              <View style={{
                marginBottom: 16,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(139, 92, 246, 0.35)',
                backgroundColor: 'rgba(139, 92, 246, 0.06)',
                padding: metrics.pad,
              }}>
                <Text style={{ color: '#a78bfa', fontWeight: '700', fontSize: 15, marginBottom: 10 }}>
                  {'\u2728'} {t('endings.narrativeWeight.title')}
                </Text>
                {narrativeBreakdown.positiveMemories.map(mem => (
                  <View key={mem.id} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                    <Text style={{ color: '#4ade80', fontSize: 13, marginRight: 6 }}>{'\u2B50'}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, flex: 1, lineHeight: 17 }}>
                      {t(`events.${mem.eventId}.memory`, undefined, mem.eventId.replace(/_/g, ' '))}
                      {mem.age ? ` — ${mem.age} ${t('character.ageUnit', undefined, 'ya\u015f\u0131nda')}` : ''}
                    </Text>
                  </View>
                ))}
                {narrativeBreakdown.negativeMemories.map(mem => (
                  <View key={mem.id} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                    <Text style={{ color: '#fb923c', fontSize: 13, marginRight: 6 }}>{'\u26A0\uFE0F'}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, flex: 1, lineHeight: 17 }}>
                      {t(`events.${mem.eventId}.memory`, undefined, mem.eventId.replace(/_/g, ' '))}
                      {mem.age ? ` — ${mem.age} ${t('character.ageUnit', undefined, 'ya\u015f\u0131nda')}` : ''}
                    </Text>
                  </View>
                ))}
                {narrativeBreakdown.scarScore < 0 && (
                  <Text style={{ color: '#ef4444', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>
                    {t('endings.narrativeWeight.scarPenalty', { points: Math.abs(narrativeBreakdown.scarScore) }, 'Yara izleri sonu\u00e7lar\u0131n\u0131 {points} puan a\u015fa\u011f\u0131 \u00e7ekti.')}
                  </Text>
                )}
                <Text style={{ color: '#a78bfa', fontSize: 11, marginTop: 8, opacity: 0.75 }}>
                  {narrativeBreakdown.totalImpact >= 0
                    ? t('endings.narrativeWeight.positiveImpact', { points: narrativeBreakdown.totalImpact }, 'Anlat\u0131 etkisi: +{points} puan')
                    : t('endings.narrativeWeight.negativeImpact', { points: Math.abs(narrativeBreakdown.totalImpact) }, 'Anlat\u0131 etkisi: -{points} puan')
                  }
                </Text>
              </View>
            </FadeInUpView>
          )}

          {activeScars.length > 0 && (
            <FadeInUpView delay={455}>
              <View style={{
                marginBottom: 16,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: 'rgba(239, 68, 68, 0.35)',
                backgroundColor: 'rgba(239, 68, 68, 0.06)',
                padding: metrics.pad,
              }}>
                <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 15, marginBottom: 10 }}>
                  {'\uD83D\uDC94'} {t('endings.scars.title', undefined, 'Yara \u0130zleri')}
                </Text>
                {activeScars.map((scar, i) => (
                  <View
                    key={scar.id}
                    style={{ marginBottom: i < activeScars.length - 1 ? 10 : 0 }}
                  >
                    <Text style={{ color: '#ef4444', fontWeight: '600', fontSize: 13 }}>
                      {scar.label}
                      {scar.sourceAge ? t('endings.shareCard.scarAgeLabel', { age: scar.sourceAge }) : ''}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2, lineHeight: 17 }}>
                      {scar.description}
                    </Text>
                  </View>
                ))}
              </View>
            </FadeInUpView>
          )}

          <FadeInUpView delay={460}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>
                {t('endings.legacy')}
              </Text>
              <Text style={{ color: theme.textPrimary, marginBottom: 4 }}>
                {t('endings.runLegacyPoints', { points: runLegacyPoints }, 'Bu kosu: +{points} miras puani')}
              </Text>
              <Text style={{ color: theme.textSecondary, marginBottom: 2 }}>
                {t(
                  'endings.totalRunsLevel',
                  { runs: safeMeta.totalRunsCompleted, level: safeMeta.legacyLevel },
                  'Toplam kosu: {runs} | Seviye: {level}'
                )}
              </Text>
              <Text style={{ color: theme.textSecondary }}>
                {`${t('endings.totalLegacyPoints')}${safeMeta.totalLegacyPoints}`}
              </Text>
            </View>
          </FadeInUpView>

          <FadeInUpView delay={470}>
            <View style={{
              marginBottom: 16,
              borderRadius: 10,
              borderWidth: 1,
              borderColor: theme.border,
              backgroundColor: theme.surfaceOverlay,
              padding: metrics.pad,
            }}>
              <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 15, marginBottom: 8 }}>
                {'\u{1F4D6}'} {t('endings.remainingLife')}
              </Text>
              <Text style={{ color: theme.textSecondary, lineHeight: 20, marginBottom: 10 }}>
                {futureVision.at30}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
                <Text style={{ color: theme.textSecondary, fontSize: 11, marginHorizontal: 8 }}>
                  {t('endings.in20Years')}
                </Text>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
              </View>

              <Text style={{ color: theme.textPrimary, lineHeight: 20, marginBottom: 8 }}>
                {futureVision.at50}
              </Text>

              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                {`${futureMoodIcon} ${t('endings.futureMood')}${futureVision.mood}`}
              </Text>
            </View>
          </FadeInUpView>

          {alternativeSuggestion && (
            <FadeInUpView delay={480}>
              <View style={{
                marginBottom: 16,
                backgroundColor: theme.surfaceOverlay,
                borderRadius: 10,
                padding: metrics.pad,
                borderWidth: 1,
                borderColor: theme.border,
              }}>
                <Text style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 4 }}>
                  {t('endings.whatIfDifferent')}
                </Text>
                <Text style={{ color: theme.textPrimary, fontWeight: '600', lineHeight: 20 }}>
                  {alternativeSuggestion}
                </Text>

                {!altEndingUnlocked && (
                  <ShimmerButton
                    onPress={handleUnlockAlternativeEnding}
                    disabled={altEndingUnlocking}
                    style={{
                      marginTop: 12,
                      paddingVertical: 10,
                      borderRadius: 10,
                      alignItems: 'center',
                      overflow: 'hidden',
                      backgroundColor: theme.surfaceBase,
                      borderWidth: 1,
                      borderColor: '#22c55e',
                      opacity: altEndingUnlocking ? 0.7 : 1,
                    }}
                  >
                    <Text style={{ color: '#22c55e', fontWeight: '700', fontSize: 13 }}>
                      {altEndingUnlocking
                        ? t('ui.adLoading')
                        : t('buttons.watchAdAlternativeEnding')}
                    </Text>
                  </ShimmerButton>
                )}

                {altEndingUnlocked && alternativeEndingPreview && bestAlternativeGoal && (
                  <View style={{
                    marginTop: 12,
                    borderWidth: 1,
                    borderColor: '#22c55e55',
                    borderRadius: 10,
                    padding: 10,
                    backgroundColor: '#052e16',
                  }}>
                    <Text style={{ color: '#86efac', fontWeight: '700', marginBottom: 4 }}>
                      {t(
                        'endings.alternativeEndingTitle',
                        { goal: bestAlternativeGoal.label },
                        'Alternatif Son ({goal})'
                      )}
                    </Text>
                    <Text style={{ color: '#dcfce7', fontWeight: '700', marginBottom: 4 }}>
                      {alternativeEndingPreview.result.emoji} {alternativeEndingPreview.result.title}
                    </Text>
                    <Text style={{ color: '#bbf7d0', lineHeight: 18 }}>
                      {alternativeEndingPreview.result.description}
                    </Text>
                  </View>
                )}
              </View>
            </FadeInUpView>
          )}

          <FadeInUpView delay={540}>
            <ShimmerButton
              onPress={handleRestart}
              style={{
                padding: metrics.pad,
                borderRadius: 12,
                alignItems: 'center',
                overflow: 'hidden',
                backgroundColor: theme.accentEvent,
                borderWidth: 1,
                borderColor: theme.accentEvent,
              }}
            >
              <Text style={{
                color: '#ffffff',
                fontWeight: '700',
                fontFamily: theme.fontHeading,
                fontSize: 16,
              }}>
                {t('buttons.newGame')}
              </Text>
            </ShimmerButton>
          </FadeInUpView>
        </View>
      </ScrollView>
    </SafeAreaView>

    <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
      <RunCard
        ref={shareCardRef}
        theme={theme}
        endingTier={tier}
        endingTitle={result.title}
        summary={lifeStorySummary}
        topMemories={(gameState.memories || [])
          .filter(memory => memory.weight === 'HIGH' || memory.weight === 'MEDIUM')
          .slice(0, 3)
          .map(memory => memory.eventId.replace(/_/g, ' '))}
        finalStats={stats}
        endingEmoji={ENDING_ID_LOOKUP[endingResolution.id]?.icon}
        finalScore={finalScore}
        goalLabel={goalLabel}
      />
    </View>
    </View>
  );
};
