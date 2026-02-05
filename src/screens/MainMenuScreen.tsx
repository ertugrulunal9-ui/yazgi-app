import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TextInput, SafeAreaView, TouchableOpacity } from 'react-native';
import { useGame } from '../context/GameContext';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
import {
  FadeInDownView,
  FadeInUpView,
  buttonPress,
  successHaptic,
} from '../animations';

interface MainMenuScreenProps {
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  onGameStart: () => void;
}

// TextInput bileşenini ayrı component olarak çıkarıp optimize et
const NameInput: React.FC<{
  value: string;
  onChangeText: (text: string) => void;
  inputStyle: any;
  inputContainerStyle: any;
}> = React.memo(({ value, onChangeText, inputStyle, inputContainerStyle }) => {
  return (
    <View style={inputContainerStyle}>
      <Text style={{ color: '#ffffff', fontWeight: '700', marginBottom: 8 }}>Adınızı Giriniz</Text>
      <TextInput
        style={inputStyle}
        placeholder="Adı girin..."
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        autoFocus
        selectTextOnFocus
        accessibilityLabel="Karakter adı"
        accessibilityHint="Oyunda kullanılacak karakterinizin adını girin"
      />
    </View>
  );
});

export const MainMenuScreen: React.FC<MainMenuScreenProps> = React.memo(({ theme, metrics, onGameStart }) => {
  const [nameInput, setNameInput] = useState('');
  const { startNewGame } = useGame();

  const handleStartGame = useCallback(() => {
    if (!nameInput.trim()) {
      buttonPress();
      alert('Lütfen adınızı giriniz');
      return;
    }
    
    buttonPress();
    successHaptic();
    startNewGame(nameInput);
    onGameStart();
  }, [nameInput, startNewGame, onGameStart]);

  const inputStyle = useMemo(() => ({
    backgroundColor: '#ffffff',
    color: '#000000',
    padding: metrics.pad,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    fontSize: metrics.font,
  }), [theme.border, metrics.pad, metrics.font]);

  const buttonStyle = useMemo(() => ({
    backgroundColor: nameInput.trim() ? theme.accentEvent : 'rgba(59,130,246,0.3)',
    padding: metrics.pad * 1.5,
    borderRadius: 12,
    alignItems: 'center' as const,
    opacity: nameInput.trim() ? 1 : 0.6,
    zIndex: 999,
    elevation: 5,
  }), [nameInput, theme.accentEvent, metrics.pad]);

  const containerStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: theme.appBg,
  }), [theme.appBg]);

  // Header style - Üst kısım için
  const headerStyle = useMemo(() => ({
    flexShrink: 0,
    paddingHorizontal: metrics.pad * 2,
    paddingTop: metrics.pad * 2,
    paddingBottom: metrics.pad,
  }), [metrics.pad]);

  // Main content style - Ekranın tamamına yayılan orta kısım
  const mainContentStyle = useMemo(() => ({
    flexGrow: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    paddingHorizontal: metrics.pad * 2,
  }), [metrics.pad]);

  // Bottom menu style - Sabit alt kısım
  const bottomMenuStyle = useMemo(() => ({
    flexShrink: 0,
    backgroundColor: theme.surfaceRaised,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingHorizontal: metrics.pad * 2,
    paddingVertical: metrics.pad * 1.5,
    gap: 12,
  }), [theme.surfaceRaised, theme.border, metrics.pad]);

  const inputContainerStyle = useMemo(() => ({
    backgroundColor: theme.surfaceBase,
    borderRadius: 14,
    padding: metrics.pad,
    borderWidth: 1,
    borderColor: theme.border,
  }), [theme.surfaceBase, theme.border, metrics.pad]);

  return (
    <SafeAreaView style={containerStyle}>
      {/* Header - Üst Kısım */}
      <View style={headerStyle}>
        <FadeInDownView delay={0}>
          <Text style={{ fontSize: 28, fontWeight: '800', color: theme.textPrimary, marginBottom: 4, textAlign: 'center' }}>
            Yazgı 🎭
          </Text>
        </FadeInDownView>
        
        <FadeInUpView delay={100}>
          <Text style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center' }}>
            Hayat Simülasyonu
          </Text>
        </FadeInUpView>
      </View>

      {/* Main Content - Ekranın Tamamına Yayılan Orta Kısım */}
      <View style={mainContentStyle}>
        <FadeInUpView delay={200}>
          <Text style={{ fontSize: 48, opacity: 0.15 }}>
            🌙
          </Text>
        </FadeInUpView>
      </View>

      {/* Bottom Menu - Sabit Alt Kısım */}
      <View style={bottomMenuStyle}>
        <NameInput
          key="nameInput"
          value={nameInput}
          onChangeText={setNameInput}
          inputStyle={inputStyle}
          inputContainerStyle={inputContainerStyle}
        />

        <TouchableOpacity
          onPress={handleStartGame}
          style={[buttonStyle, {pointerEvents: !nameInput.trim() ? 'none' : 'auto'}]}
          activeOpacity={0.8}
          accessibilityLabel="Oyuna başla"
          accessibilityRole="button"
          accessibilityState={{ disabled: !nameInput.trim() }}
          accessibilityHint={!nameInput.trim() ? "Önce karakter adı girin" : "Yeni oyun başlatır"}
        >
          <Text style={{ color: '#ffffff', fontSize: metrics.font, fontWeight: '700' }}>Oyuna Başla</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
});
