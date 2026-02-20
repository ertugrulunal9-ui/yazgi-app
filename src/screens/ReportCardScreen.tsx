import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const subjects = [
    { key: 'math', label: 'Matematik' },
    { key: 'science', label: 'Fen' },
    { key: 'language', label: 'Dil' },
    { key: 'turkish', label: 'Türkçe' },
    { key: 'history', label: 'Tarih' },
    { key: 'geography', label: 'Coğrafya' },
    { key: 'art', label: 'Görsel Sanatlar' },
    { key: 'music', label: 'Müzik' },
  ] as const;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.appBg }}>
      <ScrollView style={{ flex: 1, padding: metrics.pad }}>
        <View style={cardStyle}>
          <FadeInDownView delay={0}>
            <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>📄 Karne</Text>
          </FadeInDownView>

          <View style={{ gap: 8, marginBottom: 16 }}>
            {subjects.map((subject, index) => (
              <FadeInUpView key={subject.key} delay={100 + index * 60}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 }}>
                  <Text style={{ color: theme.textSecondary }}>{subject.label}</Text>
                  <CountUpText
                    value={gameState.schoolGrades[subject.key]}
                    style={{ color: theme.accentGrade, fontWeight: '700', fontSize: 16 }}
                  />
                </View>
              </FadeInUpView>
            ))}
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
