import React, { useCallback, useMemo, useEffect, useRef, useState } from 'react';
import { Alert, Animated, AppState, AppStateStatus, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Onboarding } from '../components/Onboarding';
import { ErrorBoundary } from '../components/ErrorBoundary';
import SaveSlotPicker from '../components/SaveSlotPicker';
import { SessionEndTeaser } from '../components/SessionEndTeaser';
import { SessionStartRecap } from '../components/SessionStartRecap';
import { TutorialTooltip } from '../components/TutorialTooltip';
import { GameProvider, useGame } from '../context/GameContext';
import { UIProvider } from '../context/UIContext';
import { useTutorial } from '../hooks/useTutorial';
import { SaveSlotData } from '../save/SaveSlot';
import { AppNavigationState } from '../types';
import { logTutorialCompleted, logSessionStart, logSessionEnd } from '../utils/analyticsEvents';
import { clearSlotSave, getCurrentSlotId, setCurrentSlotId } from '../utils/gameUtils';
import { stripRuntimeGameStateCaches } from '../utils/gameStateAdapter';
import { AnalyticsTracker } from './AnalyticsTracker';
import { AppNavigator } from './AppNavigator';
import { SettingsPanel } from './SettingsPanel';
import { useAppBootstrap } from './useAppBootstrap';

const AUDIO_SETTINGS_KEY = '@yazgi/audio_settings/v1';

const AppContent: React.FC = () => {
  const { gameState, stats, metaProgression, playerName, isLoading, resetGame, loadSavedGame, updateGameState } = useGame();
  const isTestEnv = process.env.NODE_ENV === 'test'
    || typeof (globalThis as { jest?: unknown }).jest !== 'undefined';
  const [appState, setAppState] = useState<AppNavigationState>({
    gameStarted: false,
    currentTab: 'hub',
    settingsOpen: false,
  });
  const [savePickerOpen, setSavePickerOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [showSessionEndTeaser, setShowSessionEndTeaser] = useState(false);
  const [showSessionStartRecap, setShowSessionStartRecap] = useState(false);
  const sessionStartRef = useRef(Date.now());
  const turnsAtStartRef = useRef(gameState.turn);
  const audioSyncRequestRef = useRef(0);
  const {
    uiPrefs,
    theme,
    metrics,
    locale,
    splashProgress,
    splashQuote,
    showSplash,
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
    setLocale,
    setThemeMode,
    setDensityMode,
    toggleReduceMotion,
    setAnalyticsEnabled,
    setPersonalizedAdsEnabled,
  } = useAppBootstrap();

  useEffect(() => {
    let mounted = true;

    const syncAudioSettings = async () => {
      try {
        const raw = await AsyncStorage.getItem(AUDIO_SETTINGS_KEY);
        if (raw && mounted) {
          const parsed = JSON.parse(raw) as { muted?: boolean };
          setSoundMuted(Boolean(parsed.muted));
        }
      } catch (error) {
        console.warn('Audio settings sync failed:', error);
      }
    };

    void syncAudioSettings();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isTestEnv) return;

    let cancelled = false;
    const syncRequest = ++audioSyncRequestRef.current;

    const syncBackgroundMusic = async () => {
      try {
        const [{ audioManager }, { musicPlayer }] = await Promise.all([
          import('../audio/AudioManager'),
          import('../audio/MusicPlayer'),
        ]);

        if (cancelled || syncRequest !== audioSyncRequestRef.current) return;

        await audioManager.initialize();

        if (cancelled || syncRequest !== audioSyncRequestRef.current) return;

        if (showSplash || !hasCompletedOnboarding) {
          await musicPlayer.stop(0);
          return;
        }

        if (!appState.gameStarted) {
          await musicPlayer.playMusic('menu');
          return;
        }

        await musicPlayer.playMusicForAge(gameState.age, gameState.phase === 'GAME_OVER');
      } catch (error) {
        if (!cancelled) {
          console.warn('Background music sync failed:', error);
        }
      }
    };

    void syncBackgroundMusic();

    return () => {
      cancelled = true;
    };
  }, [appState.gameStarted, gameState.age, gameState.phase, hasCompletedOnboarding, isTestEnv, showSplash]);

  useEffect(() => {
    if (isTestEnv) return;

    return () => {
      const disposeAudio = async () => {
        try {
          const [{ audioManager }, { musicPlayer }] = await Promise.all([
            import('../audio/AudioManager'),
            import('../audio/MusicPlayer'),
          ]);
          await musicPlayer.dispose();
          await audioManager.dispose();
        } catch {
          // Best-effort cleanup; ignore environments without native audio availability.
        }
      };

      void disposeAudio();
    };
  }, [isTestEnv]);

  const tutorialContext = useMemo(() => ({
    phase: gameState.phase,
    turn: gameState.turn,
    actionHistory: gameState.actionHistory ?? [],
    eventChoiceHistory: gameState.eventChoiceHistory ?? [],
    energy: stats?.energy ?? 100,
    maxEnergy: gameState.maxEnergy ?? 100,
  }), [gameState.phase, gameState.turn, gameState.actionHistory, gameState.eventChoiceHistory, stats?.energy, gameState.maxEnergy]);

  const tutorial = useTutorial(
    tutorialContext,
    hasCompletedOnboarding && appState.gameStarted
  );

  // --- Session Tracking: app background/foreground ---
  useEffect(() => {
    if (!appState.gameStarted || !playerName) return;

    // On mount (session start), check if recap should show
    const lastTs = gameState.lastSessionTimestamp;
    if (lastTs) {
      const hoursSince = (Date.now() - lastTs) / (1000 * 60 * 60);
      if (hoursSince >= 4) {
        setShowSessionStartRecap(true);
      }
      void logSessionStart({ hoursSinceLastSession: Math.round(hoursSince) });
    }

    // Update lastSessionTimestamp
    updateGameState({
      lastSessionTimestamp: Date.now(),
    });

    sessionStartRef.current = Date.now();
    turnsAtStartRef.current = gameState.turn;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appState.gameStarted, playerName]);

  useEffect(() => {
    if (!appState.gameStarted) return;

    const handleAppState = (nextState: AppStateStatus) => {
      if (nextState === 'background') {
        // Show session end teaser if cliffhanger exists
        if (gameState.pendingCliffhanger) {
          setShowSessionEndTeaser(true);
        }
        // Log session end
        const durationMinutes = Math.round((Date.now() - sessionStartRef.current) / 60000);
        void logSessionEnd({
          sessionDurationMinutes: durationMinutes,
          turnsPlayed: gameState.turn - turnsAtStartRef.current,
          hadCliffhanger: Boolean(gameState.pendingCliffhanger),
        });
        // Update lastSessionTimestamp
        updateGameState({ lastSessionTimestamp: Date.now() });
      } else if (nextState === 'active') {
        // Reset session start on foreground
        sessionStartRef.current = Date.now();
        turnsAtStartRef.current = gameState.turn;
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);
    return () => sub.remove();
  }, [appState.gameStarted, gameState.pendingCliffhanger, gameState.turn, updateGameState]);

  const handleGameStart = useCallback(() => {
    setAppState(prev => ({ ...prev, gameStarted: true }));
  }, []);

  const handleResetGame = useCallback(() => {
    Alert.alert(
      'Emin misin?',
      'Oyun yeniden baslayacak. Kayit slotlarin silinmeyecek.',
      [
        { text: 'Iptal', onPress: () => {} },
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

  const handleLoadSlot = useCallback(async (slotId: string, saveData: SaveSlotData) => {
    const success = await loadSavedGame(slotId, saveData);
    if (success) {
      setAppState(prev => ({ ...prev, gameStarted: true }));
    }
  }, [loadSavedGame]);

  const gameStateForSave = useMemo(() => (
    stripRuntimeGameStateCaches({
      ...gameState,
      floatingTexts: [],
    })
  ), [gameState]);

  const handleSoundMuteChange = useCallback((muted: boolean) => {
    setSoundMuted(muted);

    void (async () => {
      try {
        const [{ audioManager }, { musicPlayer }] = await Promise.all([
          import('../audio/AudioManager'),
          import('../audio/MusicPlayer'),
        ]);
        await audioManager.setMuted(muted);
        await musicPlayer.updateVolume();
      } catch (error) {
        console.warn('Audio mute toggle failed:', error);

        // Fallback persistence for environments where native audio modules are unavailable.
        try {
          const raw = await AsyncStorage.getItem(AUDIO_SETTINGS_KEY);
          const parsed = raw ? JSON.parse(raw) as Record<string, unknown> : {};
          await AsyncStorage.setItem(AUDIO_SETTINGS_KEY, JSON.stringify({
            masterVolume: parsed.masterVolume ?? 0.7,
            musicVolume: parsed.musicVolume ?? 0.8,
            sfxVolume: parsed.sfxVolume ?? 0.8,
            muted,
          }));
        } catch {
          // Ignore fallback persistence failures.
        }
      }
    })();
  }, []);

  if (showSplash) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.appBg, justifyContent: 'center', alignItems: 'center' }}>
        <SafeAreaView style={{ width: '85%', alignItems: 'center' }}>
          <Text style={{
            fontSize: 36,
            fontWeight: '800',
            fontFamily: theme.fontHeading,
            textAlign: 'center',
            marginBottom: 6,
            color: theme.accentBrand,
            letterSpacing: 2,
          }}>
            Yazgı
          </Text>
          <Text style={{
            color: theme.textSecondary,
            fontFamily: theme.fontBody,
            fontSize: 14,
            textAlign: 'center',
            marginBottom: 6,
            fontStyle: 'italic',
          }}>
            Kaderini sen yaz.
          </Text>
          <Text style={{
            color: theme.textSecondary,
            fontFamily: theme.fontBody,
            fontSize: 13,
            textAlign: 'center',
            marginBottom: 24,
            opacity: 0.7,
          }}>
            {splashQuote}
          </Text>
          <View style={{
            height: 6,
            width: '100%',
            backgroundColor: theme.surfaceOverlay,
            borderRadius: 999,
            overflow: 'hidden',
          }}>
            <Animated.View style={{
              height: '100%',
              width: `${splashProgress * 100}%`,
              backgroundColor: theme.accentBrand,
              borderRadius: 999,
            }} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <Onboarding
        theme={theme}
        metrics={metrics}
        onComplete={() => {
          setHasCompletedOnboarding(true);
          void logTutorialCompleted();
        }}
      />
    );
  }

  return (
    <UIProvider
      theme={theme}
      metrics={metrics}
      uiPrefs={uiPrefs}
      locale={locale}
      setLocale={setLocale}
    >
      <AnalyticsTracker
        gameStarted={appState.gameStarted}
        isLoading={isLoading}
        playerName={playerName}
        gameState={gameState}
        stats={stats}
        updateGameState={updateGameState}
      />

      <SettingsPanel
        open={appState.settingsOpen}
        theme={theme}
        uiPrefs={uiPrefs}
        soundMuted={soundMuted}
        onClose={() => setAppState(prev => ({ ...prev, settingsOpen: false }))}
        onThemeChange={setThemeMode}
        onDensityChange={setDensityMode}
        onToggleMotion={toggleReduceMotion}
        onAnalyticsEnabledChange={setAnalyticsEnabled}
        onPersonalizedAdsEnabledChange={setPersonalizedAdsEnabled}
        onSoundMuteChange={handleSoundMuteChange}
        onOpenSavePicker={() => {
          setSavePickerOpen(true);
          setAppState(prev => ({ ...prev, settingsOpen: false }));
        }}
        onResetGame={handleResetGame}
      />

      <AppNavigator
        appState={appState}
        gameState={gameState}
        theme={theme}
        metrics={metrics}
        onGameStart={handleGameStart}
        onRestart={() => {
          resetGame();
          setAppState({ gameStarted: false, currentTab: 'hub', settingsOpen: false });
        }}
        onTabChange={(tab) => setAppState(prev => ({ ...prev, currentTab: tab }))}
        onToggleSettings={() => setAppState(prev => ({ ...prev, settingsOpen: !prev.settingsOpen }))}
      />

      <ErrorBoundary>
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
      </ErrorBoundary>

      <TutorialTooltip
        visible={tutorial.visible}
        title={tutorial.content?.title ?? ''}
        message={tutorial.content?.message ?? ''}
        stepNumber={tutorial.content?.stepNumber}
        totalSteps={tutorial.content?.totalSteps}
        onDismiss={tutorial.advance}
        onNext={tutorial.advance}
        onSkip={tutorial.skip}
      />

      <SessionStartRecap
        visible={showSessionStartRecap}
        onContinue={() => setShowSessionStartRecap(false)}
        pendingCliffhanger={gameState.pendingCliffhanger}
        playerName={playerName || ''}
        age={gameState.age}
        metaProgression={metaProgression}
        theme={theme}
      />

      <SessionEndTeaser
        visible={showSessionEndTeaser}
        onClose={() => setShowSessionEndTeaser(false)}
        pendingCliffhanger={gameState.pendingCliffhanger}
        momentumStreak={undefined}
        metaProgression={metaProgression}
        theme={theme}
      />
    </UIProvider>
  );
};

const AppContentMemo = React.memo(AppContent);

export const AppShell: React.FC = () => (
  <SafeAreaProvider>
    <View style={{ flex: 1 }}>
      <GameProvider>
        <AppContentMemo />
      </GameProvider>
    </View>
  </SafeAreaProvider>
);

export default AppShell;
