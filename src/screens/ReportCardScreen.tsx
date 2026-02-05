import React from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useGame } from '../context/GameContext';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
import {
  FadeInDownView,
  FadeInUpView,
  ShimmerButton,
  CountUpText,
  buttonPress,
} from '../animations';

interface ReportCardScreenProps {
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  onClose: () => void;
}

export const ReportCardScreen: React.FC<ReportCardScreenProps> = ({ theme, metrics, onClose }) => {
  const { gameState } = useGame();

  const handleClose = () => {
    buttonPress();
    onClose();
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
      <ScrollView style={{ flex: 1, padding: metrics.pad }}>
        <View style={cardStyle}>
          <FadeInDownView delay={0}>
            <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>📄 Karne</Text>
          </FadeInDownView>

          <View style={{ gap: 8, marginBottom: 16 }}>
            <FadeInUpView delay={100}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ color: theme.textSecondary }}>Matematik</Text>
                <CountUpText
                  value={gameState.schoolGrades.math}
                  style={{ color: theme.accentGrade, fontWeight: '700', fontSize: 16 }}
                />
              </View>
            </FadeInUpView>
            <FadeInUpView delay={200}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ color: theme.textSecondary }}>Fen</Text>
                <CountUpText
                  value={gameState.schoolGrades.science}
                  style={{ color: theme.accentGrade, fontWeight: '700', fontSize: 16 }}
                />
              </View>
            </FadeInUpView>
            <FadeInUpView delay={300}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ color: theme.textSecondary }}>Dil</Text>
                <CountUpText
                  value={gameState.schoolGrades.language}
                  style={{ color: theme.accentGrade, fontWeight: '700', fontSize: 16 }}
                />
              </View>
            </FadeInUpView>
          </View>

          <FadeInUpView delay={400}>
            <ShimmerButton
              onPress={handleClose}
              style={{
                backgroundColor: theme.accentEvent,
                padding: metrics.pad,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#ffffff', fontWeight: '700' }}>Kapat</Text>
            </ShimmerButton>
          </FadeInUpView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
