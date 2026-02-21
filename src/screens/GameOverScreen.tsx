import React, { useMemo, useRef, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { useGame } from '../context/GameContext';
import { useMetaProgression } from '../context/MetaProgressionContext';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
import { getTraitName } from '../data/traits';
import { calculateAllGoalScores, generateFutureVision, resolveEnding, TOTAL_ENDING_COUNT } from '../utils/endingResolver';
import { calculateLegacyPointsForRun, createInitialMetaProgression } from '../utils/metaProgression';
import { showInterstitialAdDetailed } from '../services/monetization';
import { logInterstitialOpportunity, logInterstitialResult, logShareEvent } from '../utils/analyticsEvents';
import { NPC, PersonalityTendency } from '../types';
import { normalizePersonalityState } from '../systems/PersonalityMomentumEngine';
import { ShareCard } from '../components/ShareCard';
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
  npcs?: NPC[];
}

const getTierBadgeColor = (tier: string): string => {
  if (tier === 'LEGENDARY') return '#f59e0b';
  if (tier === 'SUCCESS') return '#22c55e';
  if (tier === 'NORMAL') return '#3b82f6';
  return '#ef4444';
};

// ── Katman 1: Personality-bazlı anlatı ───────────────────────────────
const PERSONALITY_NARRATIVES: Record<PersonalityTendency, string> = {
  HELPFUL:    'İnsanlarla kurduğun bağlar hayatının her köşesine işledi. Veriverdin, bazen kendine bile fırsat bırakmadan.',
  PRAGMATIC:  'Hesaplı adımlar attın. Her kararında mantık vardı; duygular geride kalırdı.',
  AGGRESSIVE: 'Sınırlarını sert çizdin. Bu sana hem güç hem bedel getirdi.',
};

const getFarewellNarrative = (
  personalityState: Parameters<typeof normalizePersonalityState>[0],
  playerName: string
): string => {
  const normalized = normalizePersonalityState(personalityState);
  const dominant = (['HELPFUL', 'PRAGMATIC', 'AGGRESSIVE'] as PersonalityTendency[])
    .slice()
    .sort((a, b) => normalized[b].multiplier - normalized[a].multiplier)[0];

  const base = dominant ? PERSONALITY_NARRATIVES[dominant] : 'Kendi yolunu kendi biçiminde yürüdün.';
  return `${playerName}... ${base}`;
};

// ── Katman 3: Alternatif yol önerisi ─────────────────────────────────
const ALTERNATIVE_SUGGESTIONS: Record<string, string> = {
  ACADEMIC:   '"Sanatçı" yolunu denemeyi düşündün mü hiç?',
  CREATIVE:   '"Sporcu" ruhuyla bambaşka bir hikaye seni bekliyor.',
  ATHLETIC:   '"Akademisyen" gözlükleriyle dünyayı nasıl görürdün acaba?',
  SOCIAL:     '"Girişimci" modunda ne kadar farklı olurdun?',
  ENTERPRISE: '"Sosyal" önceliklerle ne değişirdi?',
  BALANCED:   'Bir hedefi tüm kalbinle benimseseydin?',
};

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ theme, metrics, onRestart, npcs: npcsProp }) => {
  const { gameState, playerName, stats } = useGame();
  const { metaProgression } = useMetaProgression();
  const safeMeta = metaProgression ?? createInitialMetaProgression();
  const npcs = npcsProp ?? gameState.npcs;

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

  // Katman 1: Kişilik bazlı veda anlatısı
  const farewellNarrative = useMemo(() => (
    getFarewellNarrative(gameState.personalityState, playerName)
  ), [gameState.personalityState, playerName]);

  // Katman 3: En yüksek skorlu alternatif hedef önerisi
  const alternativeSuggestion = useMemo(() => {
    const allScores = calculateAllGoalScores(gameState, stats);
    const selectedEndingGoal = endingResolution.goal;
    const best = allScores.find(s => s.goal !== selectedEndingGoal);
    if (!best) return null;
    return ALTERNATIVE_SUGGESTIONS[best.goal] ?? null;
  }, [gameState, stats, endingResolution.goal]);
  const futureVision = useMemo(() => (
    generateFutureVision(stats, endingResolution, playerName)
  ), [endingResolution, playerName, stats]);
  const futureMoodIcon = useMemo(() => {
    if (futureVision.mood === 'optimistic') return '\u{1F31F}';
    if (futureVision.mood === 'somber') return '\u{1F327}\uFE0F';
    return '\u{1F325}\uFE0F';
  }, [futureVision.mood]);

  const highlightedRelations = useMemo(() => {
    const partners = npcs.filter(npc => npc.role === 'PARTNER');
    const bestFriends = npcs.filter(npc => npc.role === 'BEST_FRIEND');
    const enemies = npcs.filter(npc => npc.role === 'ENEMY');
    return [...partners, ...bestFriends, ...enemies].slice(0, 4);
  }, [npcs]);

  const shareCardRef = useRef<ViewShot | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const discoveredEndingCount = useMemo(() => {
    const discovered = new Set(safeMeta.lifetimeEndingIds || []);
    discovered.add(endingResolution.id);
    return discovered.size;
  }, [endingResolution.id, safeMeta.lifetimeEndingIds]);

  const handleShareLife = async () => {
    if (isSharing) return;

    setIsSharing(true);
    try {
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (!sharingAvailable) {
        Alert.alert('Paylasim kullanilamiyor', 'Bu cihazda paylasim desteklenmiyor.');
        return;
      }

      const uri = await shareCardRef.current?.capture?.();
      if (!uri) {
        Alert.alert('Paylasim hazir degil', 'Kart olusturulamadi, tekrar dene.');
        return;
      }

      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: 'Yazgi - Hayatimi Paylas',
      });

      void logShareEvent({
        tier,
        endingId: endingResolution.id,
        legacyLevel: safeMeta.legacyLevel,
      });
    } catch (error) {
      console.error('Failed to share life card:', error);
      Alert.alert('Paylasim basarisiz', 'Kart paylasimi tamamlanamadi.');
    } finally {
      setIsSharing(false);
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
              Yolun Sonu
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
              {'\u{1F5DD}\uFE0F'} {discoveredEndingCount} / {TOTAL_ENDING_COUNT} son kesfedildi
            </Text>
          </FadeInUpView>

          {/* Katman 1 — Kişilik anlatısı */}
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

          {highlightedRelations.length > 0 && (
            <FadeInUpView delay={440}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>Iliskiler</Text>
                <View style={{ borderTopWidth: 1, borderTopColor: theme.border }}>
                  {highlightedRelations.map((npc) => {
                    const roleLabel = npc.role === 'PARTNER'
                      ? 'Sevgili'
                      : (npc.role === 'BEST_FRIEND' ? 'En Iyi Arkadas' : 'Dusman');
                    const roleEmoji = npc.role === 'PARTNER'
                      ? '💑'
                      : (npc.role === 'BEST_FRIEND' ? '👥' : '⚔️');
                    const relationLine = npc.role === 'PARTNER'
                      ? `${npc.metAge} yasinda tanistin`
                      : (npc.role === 'BEST_FRIEND'
                        ? `${Math.max(1, gameState.age - npc.metAge)} yillik dostluk`
                        : 'hic barismadin');

                    return (
                      <View
                        key={npc.id}
                        style={{
                          paddingVertical: 8,
                          borderBottomWidth: 1,
                          borderBottomColor: theme.border,
                        }}
                      >
                        <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>
                          {roleEmoji} {npc.name} ({roleLabel})
                        </Text>
                        <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                          {relationLine}
                        </Text>
                      </View>
                    );
                  })}
                </View>
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

          {/* Katman 2 - Gelecege bakis */}
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
                {'\u{1F4D6}'} Hayatinin Geri Kalani
              </Text>
              <Text style={{ color: theme.textSecondary, lineHeight: 20, marginBottom: 10 }}>
                {futureVision.at30}
              </Text>

              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
                <Text style={{ color: theme.textSecondary, fontSize: 11, marginHorizontal: 8 }}>20 yil sonra</Text>
                <View style={{ flex: 1, height: 1, backgroundColor: theme.border }} />
              </View>

              <Text style={{ color: theme.textPrimary, lineHeight: 20, marginBottom: 8 }}>
                {futureVision.at50}
              </Text>

              <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                {futureMoodIcon} Gelecek ruh hali: {futureVision.mood}
              </Text>
            </View>
          </FadeInUpView>

          {/* Katman 3 - Yeniden oynama kancasi */}
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
                <Text style={{ color: theme.textSecondary, fontSize: 11, marginBottom: 4 }}>Peki ya farklı seçseydin?</Text>
                <Text style={{ color: theme.textPrimary, fontWeight: '600', lineHeight: 20 }}>
                  {alternativeSuggestion}
                </Text>
              </View>
            </FadeInUpView>
          )}

          <FadeInUpView delay={500}>
            <ShimmerButton
              onPress={handleShareLife}
              disabled={isSharing}
              style={{
                padding: metrics.pad,
                borderRadius: 12,
                alignItems: 'center',
                overflow: 'hidden',
                backgroundColor: theme.surfaceOverlay,
                borderWidth: 1,
                borderColor: theme.border,
                marginBottom: 10,
                opacity: isSharing ? 0.7 : 1,
              }}
            >
              <Text style={{
                color: theme.textPrimary,
                fontWeight: '700',
                fontFamily: theme.fontHeading,
                fontSize: 15,
              }}>
                {isSharing ? 'Kart Hazirlaniyor...' : 'Hayatimi Paylas'}
              </Text>
            </ShimmerButton>
          </FadeInUpView>

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
                Yeni Oyun
              </Text>
            </ShimmerButton>
          </FadeInUpView>
        </View>
      </ScrollView>
    </SafeAreaView>

    <View style={{ position: 'absolute', left: -9999, top: -9999 }}>
      <ViewShot
        ref={shareCardRef}
        options={{ format: 'png', quality: 1, result: 'tmpfile' }}
      >
        <ShareCard
          theme={theme}
          playerName={playerName}
          age={gameState.age}
          zodiacSign={gameState.characterInfo?.zodiacSign}
          tier={tier}
          endingTitle={result.title}
          traitIds={gameState.traits}
          legacyLevel={safeMeta.legacyLevel}
        />
      </ViewShot>
    </View>
    </View>
  );
};
