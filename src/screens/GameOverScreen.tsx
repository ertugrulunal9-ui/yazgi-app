import React, { useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
import { getTraitName } from '../data/traits';
import { resolveEnding } from '../utils/endingResolver';
import { calculateLegacyPointsForRun, createInitialMetaProgression } from '../utils/metaProgression';
import { showInterstitialAdDetailed } from '../services/monetization';
import { logInterstitialOpportunity, logInterstitialResult } from '../utils/analyticsEvents';
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

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ theme, metrics, onRestart }) => {
  const { gameState, playerName, stats, metaProgression } = useGame();
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
    errorDebt,
    achievementFlavor,
    tier
  } = endingResolution;

  const runLegacyPoints = useMemo(() => (
    calculateLegacyPointsForRun({
      tier,
      compatibilityScore,
      unlockedAchievementIds: (gameState.unlockedAchievements || []).map(item => item.achievementId),
    })
  ), [compatibilityScore, gameState.unlockedAchievements, tier]);

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
              Yolun Sonu
            </Text>
          </FadeInDownView>

          <FadeInUpView delay={150}>
            <Text style={{ color: theme.textSecondary, fontFamily: theme.fontBody, textAlign: 'center', marginBottom: 8 }}>
              {playerName} - {MAX_AGE} yaşını tamamladı
            </Text>
          </FadeInUpView>

          <FadeInUpView delay={220}>
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={{ backgroundColor: `${tierColor}22`, borderColor: tierColor, borderWidth: 1, borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12, marginBottom: 8 }}>
                <Text style={{ color: tierColor, fontSize: 11, fontWeight: '700' }}>{tier}</Text>
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
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>Sonuc Analizi</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 }}>
                <FadeInLeftView delay={330}>
                  <View style={{ alignItems: 'center' }}>
                    <CountUpText
                      value={Math.round(compatibilityScore)}
                      style={{ color: theme.accentSkill, fontWeight: '700', fontSize: 18 }}
                    />
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Hedef Uyumu</Text>
                  </View>
                </FadeInLeftView>
                <FadeInRightView delay={330}>
                  <View style={{ alignItems: 'center' }}>
                    <CountUpText
                      value={Math.round(errorDebt.total)}
                      style={{ color: theme.accentStat, fontWeight: '700', fontSize: 18 }}
                    />
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Hata Borcu</Text>
                  </View>
                </FadeInRightView>
                <FadeInRightView delay={360}>
                  <View style={{ alignItems: 'center' }}>
                    <CountUpText
                      value={gameState.traits.length}
                      style={{ color: theme.accentGrade, fontWeight: '700', fontSize: 18 }}
                    />
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Ozellik</Text>
                  </View>
                </FadeInRightView>
              </View>
            </View>
          </FadeInUpView>

          <FadeInUpView delay={340}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>Hedef</Text>
              <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>{selectedGoalLabel}</Text>
              {selectedGoalLabel !== goalLabel && (
                <Text style={{ color: theme.textSecondary, marginTop: 2 }}>
                  Aktif hesaplama: {goalLabel}
                </Text>
              )}
              {mismatchFailure && (
                <Text style={{ color: '#ef4444', marginTop: 6, lineHeight: 18 }}>
                  Profilin {inferredGoalLabel} yonune kaydi ve hedef uyumsuzlugu olustu.
                </Text>
              )}
              {errorDebt.reasons.length > 0 && (
                <Text style={{ color: theme.textSecondary, marginTop: 6, lineHeight: 18 }}>
                  Kritik borclar: {errorDebt.reasons.slice(0, 2).join(', ')}
                </Text>
              )}
            </View>
          </FadeInUpView>

          {achievementFlavor.length > 0 && (
            <FadeInUpView delay={380}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>Basarim Etkisi</Text>
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
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>Kazanilan Ozellikler</Text>
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
                        ✨ {getTraitName(traitId)}
                      </Text>
                    </View>
                  ))}
                </StaggeredFadeIn>
              </View>
            </FadeInUpView>
          )}

          <FadeInUpView delay={460}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>Legacy</Text>
              <Text style={{ color: theme.textPrimary, marginBottom: 4 }}>
                Bu kosu: +{runLegacyPoints} legacy puani
              </Text>
              <Text style={{ color: theme.textSecondary, marginBottom: 2 }}>
                Toplam kosu: {safeMeta.totalRunsCompleted} | Seviye: {safeMeta.legacyLevel}
              </Text>
              <Text style={{ color: theme.textSecondary }}>
                Toplam legacy puani: {safeMeta.totalLegacyPoints}
              </Text>
            </View>
          </FadeInUpView>

          <FadeInUpView delay={500}>
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
                Yeni Oyun
              </Text>
            </ShimmerButton>
          </FadeInUpView>
        </View>
      </ScrollView>
    </SafeAreaView>
    </View>
  );
};
