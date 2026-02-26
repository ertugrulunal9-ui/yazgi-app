import React, { useCallback, useMemo, useEffect, useRef, useState, MutableRefObject } from 'react';
import { Alert, Animated, AppState, AppStateStatus, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Onboarding } from '../components/Onboarding';
import { ErrorBoundary } from '../components/ErrorBoundary';
import SaveSlotPicker from '../components/SaveSlotPicker';
import { SessionEndTeaser } from '../components/SessionEndTeaser';
import { SessionStartRecap } from '../components/SessionStartRecap';
import { TutorialTooltip } from '../components/TutorialTooltip';
import { GameProvider, useGame } from '../context/GameContext';
import { MetaProgressionProvider, useMetaProgression } from '../context/MetaProgressionContext';
import { UIProvider, useUI } from '../context/UIContext';
import { useTutorial } from '../hooks/useTutorial';
import { SaveSlotData } from '../save/SaveSlot';
import { INITIAL_TUTORIAL_STATE } from '../systems/OnboardingTutorial';
import { AppNavigationState } from '../types';
import { logTutorialCompleted, logSessionStart, logSessionEnd } from '../utils/analyticsEvents';
import { clearSlotSave, getCurrentSlotId, setCurrentSlotId } from '../utils/gameUtils';
import { stripRuntimeGameStateCaches } from '../utils/gameStateAdapter';
import { getOnboardingCohort, isInOnboardingWindow, getCohortDisplayMeta } from '../utils/onboardingGuidance';
import { AnalyticsTracker } from './AnalyticsTracker';
import { AppNavigator } from './AppNavigator';
import { SettingsPanel } from './SettingsPanel';
import { useAppBootstrap } from './useAppBootstrap';
import { t as translateStatic } from '../i18n/strings';
import {
  FeatureFlag,
  getFeatureFlagsSnapshot,
  refreshFeatureFlags,
  setDevFeatureFlagOverride,
  subscribeFeatureFlags,
} from '../config/featureFlags';

const AUDIO_SETTINGS_KEY = '@yazgi/audio_settings/v1';
const ONBOARDING_KEY = '@yazgi/onboarding_completed';
const TUTORIAL_KEY = '@yazgi/tutorial_v2';
const SESSION_COUNT_KEY = '@yazgi/session_count';
const LEGACY_TUTORIAL_KEYS = [
  '@yazgi/hub_tutorial_shown',
  '@yazgi/event_tooltip_shown',
  '@yazgi/energy_tutorial_shown',
] as const;

/**
 * Küçük bir köprü bileşeni: UIProvider içinde render edilip
 * clearFloatingTexts callback'ini üst katmandaki bir ref'e yazar.
 * Bu sayede GameProvider (UIProvider'ın ebeveyni) oyun yüklendiğinde
 * floating text'leri temizleyebilir.
 */
const FloatingTextBridge: React.FC<{
  clearRef: MutableRefObject<(() => void) | undefined>;
}> = ({ clearRef }) => {
  const { clearFloatingTexts } = useUI();
  clearRef.current = clearFloatingTexts;
  return null;
};

interface AppContentProps {
  clearFloatingTextsRef: MutableRefObject<(() => void) | undefined>;
}

const AppContent: React.FC<AppContentProps> = ({ clearFloatingTextsRef }) => {
  const { gameState, stats, playerName, isLoading, resetGame, loadSavedGame, updateGameState } = useGame();
  const { metaProgression } = useMetaProgression();
  const isTestEnv = process.env.NODE_ENV === 'test'
    || typeof (globalThis as { jest?: unknown }).jest !== 'undefined';
  const [appState, setAppState] = useState<AppNavigationState>({
    gameStarted: false,
    currentTab: 'hub',
    settingsOpen: false,
  });
  const [savePickerOpen, setSavePickerOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [devFeatureFlags, setDevFeatureFlags] = useState(() => getFeatureFlagsSnapshot());
  const [showSessionEndTeaser, setShowSessionEndTeaser] = useState(false);
  const [showSessionStartRecap, setShowSessionStartRecap] = useState(false);
  const [showOnboardingFlow, setShowOnboardingFlow] = useState(false);
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
  const tStatic = useCallback(
    (key: string, params?: Record<string, string | number | boolean>, fallback?: string) =>
      translateStatic(locale, key, params, fallback),
    [locale]
  );

  useEffect(() => {
    const unsubscribe = subscribeFeatureFlags((nextFlags) => {
      setDevFeatureFlags((prevFlags) => {
        const hasDiff = (Object.keys(prevFlags) as FeatureFlag[])
          .some((key) => prevFlags[key] !== nextFlags[key]);

        return hasDiff ? nextFlags : prevFlags;
      });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshFeatureFlags();
      }
    });

    return () => sub.remove();
  }, []);

  useEffect(() => {
    let mounted = true;

    const syncAudioSettings = async () => {
      try {
        const { audioManager } = await import('../audio/AudioManager');
        await audioManager.initialize();
        if (!mounted) return;

        const settings = audioManager.getSettings();
        setSoundMuted(Boolean(settings.muted));
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

        if (soundMuted) {
          await musicPlayer.stop(0);
          return;
        }

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
  }, [appState.gameStarted, gameState.age, gameState.phase, hasCompletedOnboarding, isTestEnv, showSplash, soundMuted]);

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
    selectedGoal: gameState.selectedGoal ?? null,
    actionHistory: gameState.actionHistory ?? [],
    eventChoiceHistory: gameState.eventChoiceHistory ?? [],
    energy: stats?.energy ?? 100,
    maxEnergy: gameState.maxEnergy ?? 100,
    fateTokens: gameState.fate?.tokens ?? 0,
    momentumStreak: Math.max(
      0,
      ...Object.values(gameState.personalityState ?? {}).map(entry => entry?.streak ?? 0)
    ),
    npcs: (gameState.npcs ?? []).map(npc => ({ id: npc.id, role: npc.role })),
  }), [
    gameState.phase,
    gameState.turn,
    gameState.selectedGoal,
    gameState.actionHistory,
    gameState.eventChoiceHistory,
    stats?.energy,
    gameState.maxEnergy,
    gameState.fate?.tokens,
    gameState.personalityState,
    gameState.npcs,
  ]);

  const cohortMeta = useMemo(() => {
    if (!isInOnboardingWindow(gameState)) return null;
    const cohort = getOnboardingCohort(gameState);
    return getCohortDisplayMeta(cohort);
  }, [gameState]);

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
      tStatic('app.resetConfirmTitle', undefined, 'Emin misin?'),
      tStatic('app.resetConfirmDescription', undefined, 'Oyun yeniden baslayacak. Kayit slotlarin silinmeyecek.'),
      [
        { text: tStatic('app.cancel', undefined, 'Iptal'), onPress: () => {} },
        {
          text: tStatic('settings.newLife', undefined, 'Yeni Hayat'),
          onPress: async () => {
            await clearSlotSave('auto');
            setCurrentSlotId('auto');
            resetGame();
            setAppState({ gameStarted: false, currentTab: 'hub', settingsOpen: false });
          },
        },
      ]
    );
  }, [resetGame, tStatic]);

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

  const handleDevFeatureFlagToggle = useCallback((flag: FeatureFlag, enabled: boolean) => {
    void setDevFeatureFlagOverride(flag, enabled);
  }, []);

  const handleOnboardingComplete = useCallback(() => {
    setHasCompletedOnboarding(true);
    void logTutorialCompleted();
  }, [setHasCompletedOnboarding]);

  const prepareTutorialForNewPlayer = useCallback(async () => {
    await AsyncStorage.setItem(TUTORIAL_KEY, JSON.stringify(INITIAL_TUTORIAL_STATE));
    await Promise.all([
      AsyncStorage.setItem(SESSION_COUNT_KEY, '0'),
      ...LEGACY_TUTORIAL_KEYS.map(key => AsyncStorage.removeItem(key)),
    ]);
  }, []);

  const handleStartOnboarding = useCallback(() => {
    void (async () => {
      try {
        await prepareTutorialForNewPlayer();
      } catch {
        // Ignore persistence failures and continue.
      } finally {
        setShowOnboardingFlow(true);
      }
    })();
  }, [prepareTutorialForNewPlayer]);

  const handleSkipOnboarding = useCallback(() => {
    void (async () => {
      try {
        await prepareTutorialForNewPlayer();
        await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
      } catch {
        // Ignore persistence failures and continue to game setup.
      } finally {
        setHasCompletedOnboarding(true);
      }
    })();
  }, [prepareTutorialForNewPlayer, setHasCompletedOnboarding]);

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
            {tStatic('app.title', undefined, 'Yazgi')}
          </Text>
          <Text style={{
            color: theme.textSecondary,
            fontFamily: theme.fontBody,
            fontSize: 14,
            textAlign: 'center',
            marginBottom: 6,
            fontStyle: 'italic',
          }}>
            {tStatic('app.tagline', undefined, 'Kaderini sen yaz.')}
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
    if (!showOnboardingFlow) {
      return (
        <View style={{ flex: 1, backgroundColor: theme.appBg }}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={{
              flex: 1,
              justifyContent: 'center',
              paddingHorizontal: metrics.pad * 1.5,
            }}>
              <View style={{
                backgroundColor: theme.surfaceBase,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: theme.border,
                padding: metrics.pad * 1.4,
              }}>
                <Text style={{
                  color: theme.textPrimary,
                  fontFamily: theme.fontHeading,
                  fontSize: 26,
                  fontWeight: '800',
                  textAlign: 'center',
                }}>
                  {tStatic('app.tutorial.title', undefined, 'Tutorial')}
                </Text>
                <Text style={{
                  color: theme.textSecondary,
                  fontFamily: theme.fontBody,
                  fontSize: 14,
                  lineHeight: 21,
                  textAlign: 'center',
                  marginTop: 10,
                  marginBottom: 16,
                }}>
                  {tStatic(
                    'app.tutorial.intro',
                    undefined,
                    'Ilk kez oynuyorsan kisa tutorial ile mekanikleri hizlica ogrenebilirsin.'
                  )}
                </Text>

                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={tStatic('app.tutorial.startAria', undefined, 'Tutorialu baslat')}
                  onPress={handleStartOnboarding}
                  style={{
                    minHeight: 50,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.accentBrand,
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={{
                    color: '#0b1220',
                    fontFamily: theme.fontHeading,
                    fontSize: 15,
                    fontWeight: '700',
                  }}>
                    {tStatic('app.tutorial.start', undefined, "Tutorial'u Baslat")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={tStatic('app.tutorial.skipAria', undefined, 'Tutorialu atla')}
                  onPress={handleSkipOnboarding}
                  style={{
                    minHeight: 48,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.surfaceOverlay,
                    borderWidth: 1,
                    borderColor: theme.border,
                    marginTop: 10,
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={{
                    color: theme.textPrimary,
                    fontFamily: theme.fontBody,
                    fontSize: 14,
                    fontWeight: '600',
                  }}>
                    {tStatic('app.tutorial.skip', undefined, 'Skip ve Oyuna Gec')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      );
    }

    return (
      <Onboarding
        theme={theme}
        metrics={metrics}
        locale={locale}
        onComplete={handleOnboardingComplete}
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
      <FloatingTextBridge clearRef={clearFloatingTextsRef} />
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
        devFeatureFlags={devFeatureFlags}
        onDevFeatureFlagToggle={handleDevFeatureFlagToggle}
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
        locale={locale}
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
        cohortLabel={cohortMeta?.label}
        cohortMessage={cohortMeta?.message}
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

export const AppShell: React.FC = () => {
  const clearFloatingTextsRef = useRef<(() => void) | undefined>(undefined);

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <GameProvider onLoadGame={() => clearFloatingTextsRef.current?.()}>
          <MetaProgressionProvider>
            <AppContentMemo clearFloatingTextsRef={clearFloatingTextsRef} />
          </MetaProgressionProvider>
        </GameProvider>
      </View>
    </SafeAreaProvider>
  );
};

export default AppShell;
