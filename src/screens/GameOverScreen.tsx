import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useGame } from '../context/GameContext';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
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

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ theme, metrics, onRestart }) => {
  const { gameState, playerName } = useGame();

  const handleRestart = () => {
    buttonPress();
    successHaptic();
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.appBg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: metrics.pad }}>
        <View style={cardStyle}>
          <FadeInDownView delay={0}>
            <Text style={{ color: theme.textPrimary, fontSize: 48, fontWeight: '800', textAlign: 'center', marginBottom: 16 }}>
              🏁
            </Text>
          </FadeInDownView>
          
          <FadeInDownView delay={100}>
            <Text style={{ color: theme.textPrimary, fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
              Oyun Bitti
            </Text>
          </FadeInDownView>
          
          <FadeInUpView delay={200}>
            <Text style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 16 }}>
              {playerName} • {MAX_AGE} yaşını tamamladı
            </Text>
          </FadeInUpView>

          <FadeInUpView delay={300}>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>İstatistikler</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 }}>
                <FadeInLeftView delay={350}>
                  <View style={{ alignItems: 'center' }}>
                    <CountUpText
                      value={gameState.turn}
                      style={{ color: theme.accentStat, fontWeight: '700', fontSize: 18 }}
                    />
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Tur</Text>
                  </View>
                </FadeInLeftView>
                <FadeInRightView delay={350}>
                  <View style={{ alignItems: 'center' }}>
                    <CountUpText
                      value={gameState.traits.length}
                      style={{ color: theme.accentGrade, fontWeight: '700', fontSize: 18 }}
                    />
                    <Text style={{ color: theme.textSecondary, fontSize: 11 }}>Özellik</Text>
                  </View>
                </FadeInRightView>
              </View>
            </View>
          </FadeInUpView>

          {/* Kazanılan Özellikler */}
          {gameState.traits.length > 0 && (
            <FadeInUpView delay={400}>
              <View style={{ marginBottom: 16 }}>
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 8 }}>Kazanılan Özellikler</Text>
                <StaggeredFadeIn>
                  {gameState.traits.map((trait) => (
                    <View key={trait} style={{
                      backgroundColor: theme.surfaceOverlay,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      marginBottom: 4,
                      borderWidth: 1,
                      borderColor: theme.border,
                    }}>
                      <Text style={{ color: theme.accentEvent, fontWeight: '600', fontSize: 13 }}>
                        ✨ {trait}
                      </Text>
                    </View>
                  ))}
                </StaggeredFadeIn>
              </View>
            </FadeInUpView>
          )}

          <FadeInUpView delay={500}>
            <ShimmerButton
              onPress={handleRestart}
              style={{
                backgroundColor: theme.accentEvent,
                padding: metrics.pad,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '700' }}>Yeni Oyun</Text>
            </ShimmerButton>
          </FadeInUpView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
