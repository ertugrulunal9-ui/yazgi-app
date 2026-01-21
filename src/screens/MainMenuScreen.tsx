import React, { useState } from 'react';
import { View, Text, TextInput, SafeAreaView } from 'react-native';
import { useGame } from '../context/GameContext';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
import {
  FadeInDownView,
  FadeInUpView,
  PulseButton,
  buttonPress,
  successHaptic,
} from '../animations';

interface MainMenuScreenProps {
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  onGameStart: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ theme, metrics, onGameStart }) => {
  console.log('[MainMenuScreen] Rendering...', { theme, metrics });
  const [nameInput, setNameInput] = useState('');
  const { startNewGame } = useGame();

  const handleStartGame = () => {
    if (!nameInput.trim()) {
      buttonPress();
      alert('Lütfen adınızı giriniz');
      return;
    }
    buttonPress();
    successHaptic();
    startNewGame(nameInput);
    onGameStart();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.appBg }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: metrics.pad * 2 }}>
        <FadeInDownView delay={0}>
          <Text style={{ fontSize: 32, fontWeight: '800', color: theme.textPrimary, marginBottom: 8, textAlign: 'center' }}>
            Yazgı 🎭
          </Text>
        </FadeInDownView>
        
        <FadeInUpView delay={100}>
          <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', marginBottom: 32 }}>
            Hayat Simülasyonu
          </Text>
        </FadeInUpView>

        <FadeInUpView delay={200}>
          <View style={{ backgroundColor: theme.surfaceBase, borderRadius: 14, padding: metrics.pad, marginBottom: 20, borderWidth: 1, borderColor: theme.border }}>
            <Text style={{ color: theme.textPrimary, fontWeight: '700', marginBottom: 8 }}>Adınızı Giriniz</Text>
          </View>
        </FadeInUpView>
        <View style={{ backgroundColor: theme.surfaceBase, borderRadius: 14, padding: metrics.pad, marginBottom: 20, borderWidth: 1, borderColor: theme.border }}>
          <TextInput
            style={{
              backgroundColor: theme.surfaceRaised,
              color: theme.textPrimary,
              padding: metrics.pad,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: theme.border,
              fontSize: metrics.font,
            }}
            placeholder="Adı girin..."
            placeholderTextColor={theme.textSecondary}
            value={nameInput}
            onChangeText={setNameInput}
          />
        </View>

        <FadeInUpView delay={300}>
          <PulseButton
            onPress={handleStartGame}
            disabled={!nameInput.trim()}
            style={{
              backgroundColor: nameInput.trim() ? theme.accentEvent : 'rgba(59,130,246,0.3)',
              padding: metrics.pad * 1.5,
              borderRadius: 12,
              alignItems: 'center',
              opacity: nameInput.trim() ? 1 : 0.6,
            }}
          >
            <Text style={{ color: '#ffffff', fontSize: metrics.font, fontWeight: '700' }}>Oyuna Başla</Text>
          </PulseButton>
        </FadeInUpView>
      </View>
    </SafeAreaView>
  );
};
