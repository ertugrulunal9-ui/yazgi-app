import React, { useState, useEffect } from 'react';
import { View, Text, Animated, SafeAreaView, Appearance, Modal, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { GameProvider } from './src/context/GameContext';
import { MainMenuScreen } from './src/screens/MainMenuScreen';
import { GameScreen } from './src/screens/GameScreen';
import { EventScreen } from './src/screens/EventScreen';
import { ReportCardScreen } from './src/screens/ReportCardScreen';
import { GameOverScreen } from './src/screens/GameOverScreen';
import { getThemeTokens, getDensityMetrics, getSystemTheme, getWeightedSplashDelay, DEFAULT_UI_PREFS, type UIPrefs, type ThemeMode, type DensityMode } from './src/utils/themeUtils';
import { getLoadingQuoteByAge } from './src/data/loadingQuotes';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { getInitialGameState, getInitialStats, resetGameStorage } from './src/utils/gameUtils';

const UI_PREFS_KEY = '@yazgi_sim/ui_prefs/v1';
const SPLASH_DELAY_POOL = [1500, 1600, 1700, 1700, 1800, 1800, 1800, 1900, 2000, 2200];

interface AppState {
  gameStarted: boolean;
  currentTab: 'hub' | 'character' | 'log' | 'settings';
  settingsOpen: boolean;
}

const AppContent: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    gameStarted: false,
    currentTab: 'hub',
    settingsOpen: false,
  });

  const [uiPrefs, setUiPrefs] = useState<UIPrefs>(DEFAULT_UI_PREFS);
  const [uiPrefsLoaded, setUiPrefsLoaded] = useState(false);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(getSystemTheme());
  const [isLoading, setIsLoading] = useState(true);
  const [splashReady, setSplashReady] = useState(false);
  const [splashQuote, setSplashQuote] = useState(getLoadingQuoteByAge(0));
  const [splashProgress, setSplashProgress] = useState(0);

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
  }, [uiPrefs.theme]);

  // Handle splash screen animation
  useEffect(() => {
    if (!uiPrefsLoaded) return;
    
    setIsLoading(false);
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

  const theme = getThemeTokens(resolvedTheme);
  const metrics = getDensityMetrics(uiPrefs.density);

  const showSplash = !uiPrefsLoaded || !splashReady;

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

  const handleSettingsDensityChange = (density: DensityMode) => {
    setUiPrefs(prev => ({ ...prev, density }));
  };

  const handleSettingsThemeChange = (theme: ThemeMode) => {
    setUiPrefs(prev => ({ ...prev, theme }));
  };

  const handleSettingsMotionChange = () => {
    setUiPrefs(prev => ({ ...prev, reduceMotion: !prev.reduceMotion }));
  };

  const handleResetGame = async () => {
    Alert.alert('Emin misin?', 'Tüm veriler silinecek ve oyun yeniden başlayacak.', [
      { text: 'İptal', onPress: () => {} },
      {
        text: '🔥 Sıfırla',
        onPress: async () => {
          await resetGameStorage();
          setAppState({ gameStarted: false, currentTab: 'hub', settingsOpen: false });
        },
      },
    ]);
  };

  return (
    <>
      <Modal visible={appState.settingsOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: theme.appBg }}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.border }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: theme.textPrimary }}>Ayarlar</Text>
              <TouchableOpacity onPress={() => setAppState(prev => ({ ...prev, settingsOpen: false }))} style={{ padding: 8, borderRadius: 10, backgroundColor: theme.surfaceBase }}>
                <Feather name="x" color={theme.textPrimary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, padding: 16 }} contentContainerStyle={{ paddingBottom: 20 }}>
              {/* Theme Selection */}
              <View style={{ marginBottom: 28 }}>
                <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>🎨 Tema Seçin</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {(['light', 'dark', 'system'] as const).map(themeOption => {
                    const isActive = uiPrefs.theme === themeOption;
                    const colors = {
                      light: '#fbbf24',
                      dark: '#8b5cf6',
                      system: theme.accentEvent,
                    };
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
                          backgroundColor: isActive ? colors[themeOption] + '20' : theme.surfaceBase,
                          borderWidth: 2,
                          borderColor: isActive ? colors[themeOption] : 'transparent',
                        }}
                      >
                        <Feather name={icons[themeOption]} color={isActive ? colors[themeOption] : theme.textSecondary} size={28} />
                        <Text style={{ color: isActive ? colors[themeOption] : theme.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 6 }}>
                          {labels[themeOption]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Density Selection */}
              <View style={{ marginBottom: 28 }}>
                <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>📏 Yoğunluk</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {(['compact', 'standard', 'comfort'] as const).map(densityOption => {
                    const isActive = uiPrefs.density === densityOption;
                    const colors = {
                      compact: '#6366f1',
                      standard: '#06b6d4',
                      comfort: '#ec4899',
                    };
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
                          backgroundColor: isActive ? colors[densityOption] + '20' : theme.surfaceBase,
                          borderWidth: 2,
                          borderColor: isActive ? colors[densityOption] : 'transparent',
                        }}
                      >
                        <Feather name={icons[densityOption]} color={isActive ? colors[densityOption] : theme.textSecondary} size={28} />
                        <Text style={{ color: isActive ? colors[densityOption] : theme.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 6 }}>
                          {labels[densityOption]}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Motion Reduction */}
              <View style={{ marginBottom: 28 }}>
                <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>⚡ Hareket</Text>
                <TouchableOpacity
                  onPress={handleSettingsMotionChange}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                    borderRadius: 14,
                    backgroundColor: uiPrefs.reduceMotion ? '#f59e0b20' : theme.surfaceBase,
                    borderWidth: 2,
                    borderColor: uiPrefs.reduceMotion ? '#f59e0b' : 'transparent',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <Feather name={uiPrefs.reduceMotion ? 'slash' : 'zap'} color={uiPrefs.reduceMotion ? '#f59e0b' : theme.textSecondary} size={24} />
                    <Text style={{ color: theme.textPrimary, fontSize: 16, fontWeight: '600' }}>Geçişleri Azalt</Text>
                  </View>
                  <View style={{ width: 50, height: 28, borderRadius: 14, backgroundColor: uiPrefs.reduceMotion ? '#f59e0b' : theme.surfaceOverlay, alignItems: uiPrefs.reduceMotion ? 'flex-end' : 'flex-start', justifyContent: 'center' }}>
                    <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: theme.surfaceRaised, marginHorizontal: 2 }} />
                  </View>
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
                    backgroundColor: '#ef444420',
                    borderWidth: 2,
                    borderColor: '#ef4444',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ color: '#ef4444', fontWeight: '700', fontSize: 15 }}>🔥 Sıfırla ve Başa Dön</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {!appState.gameStarted ? (
        <MainMenuScreen theme={theme} metrics={metrics} onGameStart={() => setAppState(prev => ({ ...prev, gameStarted: true }))} />
      ) : (
        <>
          {/* Game Screens */}
          <GameScreen
            onPhaseChange={(tab) => setAppState(prev => ({ ...prev, currentTab: tab }))}
            onOpenSettings={() => setAppState(prev => ({ ...prev, settingsOpen: true }))}
            currentTab={appState.currentTab}
          />

          {/* Event Screen - Overlay */}
          <EventScreen theme={theme} metrics={metrics} />

          {/* Settings Modal Toggle */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000, padding: 8, borderRadius: 10, backgroundColor: theme.surfaceBase }}
            onPress={() => setAppState(prev => ({ ...prev, settingsOpen: !prev.settingsOpen }))}
          >
            <Feather name="settings" color={theme.textPrimary} size={22} />
          </TouchableOpacity>
        </>
      )}
    </>
  );
};

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </SafeAreaView>
  );
}
