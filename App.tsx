import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, Appearance, ScrollView, TouchableOpacity, Alert, Switch, StyleSheet, Pressable, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Z_INDEX } from './src/constants/zIndex';
import { THEME_OPTION_COLORS, DENSITY_OPTION_COLORS, MOTION_OPTION_COLOR, DANGER_COLOR } from './src/constants/themeColors';
import { GameProvider, useGame } from './src/context/GameContext';
import { CharacterCreationScreen } from './src/screens/CharacterCreationScreen';
import { GameScreen } from './src/screens/GameScreen';
import { EventScreen } from './src/screens/EventScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { getThemeTokens, getDensityMetrics, getSystemTheme, getWeightedSplashDelay, DEFAULT_UI_PREFS, type UIPrefs, type ThemeMode, type DensityMode } from './src/utils/themeUtils';
import { getLoadingQuoteByAge } from './src/data/loadingQuotes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { getCurrentSlotId, setCurrentSlotId, clearSlotSave } from './src/utils/gameUtils';
import SaveSlotPicker from './src/components/SaveSlotPicker';

const UI_PREFS_KEY = '@yazgi_sim/ui_prefs/v1';

interface AppState {
  gameStarted: boolean;
  currentTab: 'hub' | 'character' | 'skilltree' | 'social' | 'settings';
  settingsOpen: boolean;
}

const AppContent: React.FC = () => {
  const { gameState, stats, playerName, isLoading, resetGame, loadSavedGame } = useGame();
  const [appState, setAppState] = useState<AppState>({
    gameStarted: false,
    currentTab: 'hub',
    settingsOpen: false,
  });
  const [savePickerOpen, setSavePickerOpen] = useState(false);

  const [uiPrefs, setUiPrefs] = useState<UIPrefs>(DEFAULT_UI_PREFS);
  const [uiPrefsLoaded, setUiPrefsLoaded] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(getSystemTheme());
  const [splashReady, setSplashReady] = useState(false);
  const splashQuote = getLoadingQuoteByAge(0);
  const [splashProgress, setSplashProgress] = useState(0);
  const [fontsLoaded] = useFonts(Feather.font);

  // Load UI preferences
  useEffect(() => {
    const loadUIPrefs = async () => {
      try {
        const raw = await AsyncStorage.getItem(UI_PREFS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setUiPrefs({ ...DEFAULT_UI_PREFS, ...parsed });
        }
      } catch {
        // ignore
      } finally {
        setUiPrefsLoaded(true);
      }
    };
    void loadUIPrefs();
  }, []);

  // Resolve theme changes
  useEffect(() => {
    if (uiPrefs.theme === 'system') {
      setResolvedTheme(getSystemTheme());
      const sub = Appearance.addChangeListener(({ colorScheme }) => {
        setResolvedTheme(colorScheme === 'dark' ? 'dark' : 'light');
      });
      return () => sub.remove();
    }
    setResolvedTheme(uiPrefs.theme);
    return undefined;
  }, [uiPrefs.theme]);

  // Handle splash screen animation
  useEffect(() => {
    if (!uiPrefsLoaded) return;
    
    const baseDelay = getWeightedSplashDelay();
    const effectiveDelay = uiPrefs.reduceMotion ? Math.round(baseDelay / 2) : baseDelay;
    
    setSplashProgress(0);
    const interval = setInterval(() => {
      setSplashProgress(prev => {
        const next = prev + 0.05;
        return next >= 1 ? 1 : next;
      });
    }, (uiPrefs.reduceMotion ? 1000 : effectiveDelay) / 20);

    const timer = setTimeout(() => {
      clearInterval(interval);
      setSplashReady(true);
    }, effectiveDelay);
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [uiPrefsLoaded, uiPrefs.reduceMotion]);

  // Save UI preferences
  useEffect(() => {
    if (!uiPrefsLoaded) return;
    void AsyncStorage.setItem(UI_PREFS_KEY, JSON.stringify(uiPrefs));
  }, [uiPrefs, uiPrefsLoaded]);

  const theme = useMemo(() => getThemeTokens(resolvedTheme), [resolvedTheme]);
  const metrics = useMemo(() => getDensityMetrics(uiPrefs.density), [uiPrefs.density]);

  const handleSettingsDensityChange = useCallback((density: DensityMode) => {
    setUiPrefs(prev => ({ ...prev, density }));
  }, []);

  const handleSettingsThemeChange = useCallback((theme: ThemeMode) => {
    setUiPrefs(prev => ({ ...prev, theme }));
  }, []);

  const handleSettingsMotionChange = useCallback(() => {
    setUiPrefs(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }));
  }, []);

  const handleGameStart = useCallback(() => {
    setAppState(prev => ({ ...prev, gameStarted: true }));
  }, []);

  const handleResetGame = useCallback(async () => {
    Alert.alert(
      'Emin misin?',
      'Oyun yeniden başlayacak. Kayıt slotların silinmeyecek.',
      [
        { text: 'İptal', onPress: () => {} },
        {
          text: 'Yeni Hayat',
          onPress: async () => {
            await clearSlotSave('auto');
            setCurrentSlotId('auto');
            resetGame();
            setAppState({ gameStarted: false, currentTab: 'hub', settingsOpen: false });
          },
        },
      ]
    );
  }, [resetGame]);

  useEffect(() => {
    if (!isLoading && playerName && !appState.gameStarted) {
      setAppState(prev => ({ ...prev, gameStarted: true }));
    }
  }, [isLoading, playerName, appState.gameStarted]);

  const handleLoadSlot = useCallback(async (slotId: string) => {
    const success = await loadSavedGame(slotId);
    if (success) {
      setAppState(prev => ({ ...prev, gameStarted: true }));
    }
  }, [loadSavedGame]);

  const gameStateForSave = useMemo(() => ({
    ...gameState,
    floatingTexts: [],
  }), [gameState]);

  const closeSettings = useCallback(() => {
    setAppState(prev => ({ ...prev, settingsOpen: false }));
  }, []);

  // Settings panel animation - MUST be before any conditional returns!
  const settingsTranslateX = useSharedValue(400);
  const settingsOverlayOpacity = useSharedValue(0);

  useEffect(() => {
    if (appState.settingsOpen) {
      settingsOverlayOpacity.value = withTiming(1, { duration: 200 });
      settingsTranslateX.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
    } else {
      settingsOverlayOpacity.value = withTiming(0, { duration: 200 });
      settingsTranslateX.value = withTiming(400, { duration: 250 });
    }
  }, [appState.settingsOpen]);

  const settingsOverlayStyle = useAnimatedStyle(() => ({
    opacity: settingsOverlayOpacity.value,
  }));

  const settingsPanelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: settingsTranslateX.value }],
  }));

  const showSplash = !uiPrefsLoaded || !splashReady || !fontsLoaded;

  if (showSplash) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.appBg, justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: '85%', backgroundColor: theme.surfaceRaised, borderRadius: 16, padding: 24, borderWidth: 1, borderColor: theme.border }}>
          <Text style={{ fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 8, color: theme.textPrimary }}>
            Yazgı
          </Text>
          <Text style={{ color: theme.textSecondary, fontSize: 14, textAlign: 'center', marginBottom: 16 }}>
            {splashQuote}
          </Text>
          <View style={{ height: 8, width: '100%', backgroundColor: theme.surfaceOverlay, borderRadius: 999, overflow: 'hidden', borderWidth: 1, borderColor: theme.border }}>
            <View style={{ height: '100%', width: `${splashProgress * 100}%`, backgroundColor: theme.accentEvent }} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const settingsStyles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: Z_INDEX.SETTINGS + 100,
      pointerEvents: appState.settingsOpen ? 'auto' : 'none',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    panel: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: '85%',
      maxWidth: 400,
      backgroundColor: theme.appBg,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: -4, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        android: {
          elevation: 16,
        },
        web: {
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.3)',
        },
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    closeButton: {
      padding: 12,
      borderRadius: 10,
      backgroundColor: theme.surfaceBase,
      minWidth: 48,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    scrollView: {
      flex: 1,
      padding: 16,
    },
    scrollContent: {
      paddingBottom: 20,
    },
    sectionTitle: {
      color: theme.textPrimary,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 12,
    },
    optionRow: {
      flexDirection: 'row',
      gap: 10,
    },
  });

  return (
    <>
      {/* Settings Panel - Absolute positioned instead of Modal */}
      <View style={settingsStyles.container}>
        <Animated.View style={[settingsStyles.overlay, settingsOverlayStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSettings} />
        </Animated.View>

        <Animated.View style={[settingsStyles.panel, settingsPanelStyle]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={settingsStyles.header}>
              <Text style={settingsStyles.headerTitle}>Ayarlar</Text>
              <TouchableOpacity
                onPress={closeSettings}
                style={settingsStyles.closeButton}
                accessibilityLabel="Ayarları kapat"
                accessibilityRole="button"
              >
                <Feather name="x" color={theme.textPrimary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={settingsStyles.scrollView} contentContainerStyle={settingsStyles.scrollContent}>
              {/* Theme Selection */}
              <View style={{ marginBottom: 28 }}>
                <Text style={settingsStyles.sectionTitle}>🎨 Tema Seçin</Text>
                <View style={settingsStyles.optionRow}>
                  {(['light', 'dark', 'system'] as const).map(themeOption => {
                    const isActive = uiPrefs.theme === themeOption;
                    const optionColor = themeOption === 'system'
                      ? theme.accentEvent
                      : THEME_OPTION_COLORS[themeOption];
                    const icons = {
                      light: 'sun',
                      dark: 'moon',
                      system: 'monitor',
                    } as const;
                    const labels = {
                      light: 'Açık',
                      dark: 'Koyu',
                      system: 'Sistem',
                    };
                    return (
                      <TouchableOpacity
                        key={themeOption}
                        onPress={() => handleSettingsThemeChange(themeOption)}
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 16,
                          borderRadius: 16,
                          backgroundColor: isActive ? optionColor + '20' : theme.surfaceBase,
                          borderWidth: 2,
                          borderColor: isActive ? optionColor : 'transparent',
                        }}
                      >
                        <Feather name={icons[themeOption]} color={isActive ? optionColor : theme.textSecondary} size={28} />
                        <Text style={{ color: isActive ? optionColor : theme.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 6 }}>
                          {labels[themeOption]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Density Selection */}
              <View style={{ marginBottom: 28 }}>
                <Text style={settingsStyles.sectionTitle}>📏 Yoğunluk</Text>
                <View style={settingsStyles.optionRow}>
                  {(['compact', 'standard', 'comfort'] as const).map(densityOption => {
                    const isActive = uiPrefs.density === densityOption;
                    const densityColor = DENSITY_OPTION_COLORS[densityOption];
                    const icons = {
                      compact: 'zoom-out',
                      standard: 'maximize-2',
                      comfort: 'zoom-in',
                    } as const;
                    const labels = {
                      compact: 'Küçük',
                      standard: 'Normal',
                      comfort: 'Büyük',
                    };
                    return (
                      <TouchableOpacity
                        key={densityOption}
                        onPress={() => handleSettingsDensityChange(densityOption)}
                        style={{
                          flex: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          paddingVertical: 16,
                          borderRadius: 16,
                          backgroundColor: isActive ? densityColor + '20' : theme.surfaceBase,
                          borderWidth: 2,
                          borderColor: isActive ? densityColor : 'transparent',
                        }}
                      >
                        <Feather name={icons[densityOption]} color={isActive ? densityColor : theme.textSecondary} size={28} />
                        <Text style={{ color: isActive ? densityColor : theme.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 6 }}>
                          {labels[densityOption]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Motion Reduction */}
              <View style={{ marginBottom: 28 }}>
                <Text style={settingsStyles.sectionTitle}>⚡ Hareket</Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 14,
                    backgroundColor: uiPrefs.reduceMotion ? MOTION_OPTION_COLOR + '20' : theme.surfaceBase,
                    borderWidth: 2,
                    borderColor: uiPrefs.reduceMotion ? MOTION_OPTION_COLOR : 'transparent',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Feather name={uiPrefs.reduceMotion ? 'slash' : 'zap'} color={uiPrefs.reduceMotion ? MOTION_OPTION_COLOR : theme.textSecondary} size={24} />
                    <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '600' }}>Geçişleri Azalt</Text>
                  </View>
                  <Switch
                    value={uiPrefs.reduceMotion}
                    onValueChange={handleSettingsMotionChange}
                    trackColor={{ false: theme.surfaceOverlay, true: MOTION_OPTION_COLOR }}
                    thumbColor={theme.surfaceRaised}
                    accessibilityLabel="Geçişleri azalt"
                  />
                </View>
              </View>

              {/* Save / Load */}
              <View style={{ marginBottom: 28 }}>
                <Text style={settingsStyles.sectionTitle}>Kayıtlar</Text>
                <TouchableOpacity
                  onPress={() => {
                    setSavePickerOpen(true);
                    setAppState(prev => ({ ...prev, settingsOpen: false }));
                  }}
                  style={{
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 14,
                    backgroundColor: theme.surfaceBase,
                    borderWidth: 2,
                    borderColor: theme.border,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                  }}
                  accessibilityLabel="Kayıtları yönet"
                  accessibilityRole="button"
                >
                  <Feather name="save" color={theme.textSecondary} size={20} />
                  <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '600' }}>Kaydet / Yükle</Text>
                </TouchableOpacity>
              </View>

              {/* Danger Zone */}
              <View style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 20, marginTop: 8 }}>
                <TouchableOpacity
                  onPress={handleResetGame}
                  style={{
                    marginTop: 20,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 14,
                    backgroundColor: DANGER_COLOR + '20',
                    borderWidth: 2,
                    borderColor: DANGER_COLOR,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: DANGER_COLOR, fontWeight: '700', fontSize: 15 }}>Yeni Hayata Başla</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>

      {!appState.gameStarted ? (
        <CharacterCreationScreen theme={theme} metrics={metrics} onGameStart={handleGameStart} />
      ) : gameState.phase === 'GAME_OVER' ? (
        <GameOverScreen
          theme={theme}
          metrics={metrics}
          onRestart={() => {
            resetGame();
            setAppState({ gameStarted: false, currentTab: 'hub', settingsOpen: false });
          }}
        />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Game Screens */}
          <GameScreen
            key={`game-${gameState.age}`}
            onPhaseChange={(tab) => setAppState(prev => ({ ...prev, currentTab: tab }))}
            onOpenSettings={() => setAppState(prev => ({ ...prev, settingsOpen: true }))}
            currentTab={appState.currentTab}
          />

          {/* Event Screen - Overlay */}
          <EventScreen theme={theme} metrics={metrics} />

          {/* Settings Modal Toggle */}
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              zIndex: Z_INDEX.SETTINGS,
              padding: 12,
              borderRadius: 12,
              backgroundColor: theme.surfaceBase,
              minWidth: 48,
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => setAppState(prev => ({ ...prev, settingsOpen: !prev.settingsOpen }))}
            accessibilityLabel="Ayarları aç"
            accessibilityRole="button"
          >
            <Feather name="settings" color={theme.textPrimary} size={22} />
          </TouchableOpacity>
        </View>
      )}

      <SaveSlotPicker
        isOpen={savePickerOpen}
        onClose={() => setSavePickerOpen(false)}
        currentPlayerName={playerName}
        currentStats={stats}
        currentGameState={gameStateForSave}
        onLoadSlot={handleLoadSlot}
        currentSlotId={getCurrentSlotId()}
        theme={{
          appBg: theme.appBg,
          surfaceBase: theme.surfaceBase,
          surfaceRaised: theme.surfaceRaised,
          textPrimary: theme.textPrimary,
          textSecondary: theme.textSecondary,
          border: theme.border,
          accentEvent: theme.accentEvent,
        }}
      />
    </>
  );
};

const AppContentMemo = React.memo(AppContent);

export default function App() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <GameProvider>
          <AppContentMemo />
        </GameProvider>
      </View>
    </SafeAreaProvider>
  );
}
