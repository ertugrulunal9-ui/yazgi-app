import { Feather } from '@expo/vector-icons';
import React, { Suspense } from 'react';
import { ActivityIndicator, Platform, TouchableOpacity, View } from 'react-native';
import { Z_INDEX } from '../constants/zIndex';
import { AppNavigationState, AppTab, CharacterInfo, GameState, MetaProgression } from '../types';
import type { NewGameBootstrapOptions } from '../utils/gameUtils';
import { getDensityMetrics, getThemeTokens } from '../utils/themeUtils';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { AppLocale, t as translateStatic } from '../i18n/strings';

// Heavy game screens are lazy-loaded so they don't block the main menu startup
const GameScreen = React.lazy(() =>
  import('../screens/GameScreen').then(m => ({ default: m.GameScreen }))
);
const EventScreen = React.lazy(() =>
  import('../screens/EventScreen').then(m => ({ default: m.EventScreen }))
);
const GameOverScreen = React.lazy(() =>
  import('../screens/GameOverScreen').then(m => ({ default: m.GameOverScreen }))
);

interface AppNavigatorProps {
  appState: AppNavigationState;
  gameState: GameState;
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  locale: AppLocale;
  onGameStart: () => void;
  onRestart: () => void;
  onTabChange: (tab: AppTab) => void;
  onToggleSettings: () => void;
  startNewGame: (name: string, characterInfo?: CharacterInfo, options?: NewGameBootstrapOptions) => void;
  metaProgression: MetaProgression | null;
  metaProgressionLoaded: boolean;
  updateMetaProgression: (next: MetaProgression) => void;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({
  appState,
  gameState,
  theme,
  metrics,
  locale,
  onGameStart,
  onRestart,
  onTabChange,
  onToggleSettings,
  startNewGame,
  metaProgression,
  metaProgressionLoaded,
  updateMetaProgression,
}) => {
  const tStatic = (key: string, fallback: string): string => (
    translateStatic(locale, key, undefined, fallback)
  );

  if (!appState.gameStarted) {
    return (
      <MainMenuScreen
        theme={theme}
        metrics={metrics}
        locale={locale}
        onGameStart={onGameStart}
        startNewGame={startNewGame}
        metaProgression={metaProgression}
        metaProgressionLoaded={metaProgressionLoaded}
        updateMetaProgression={updateMetaProgression}
      />
    );
  }

  if (gameState.phase === 'GAME_OVER') {
    return (
      <ErrorBoundary>
        <Suspense fallback={<ActivityIndicator style={{ flex: 1 }} />}>
          <GameOverScreen theme={theme} metrics={metrics} onRestart={onRestart} />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ErrorBoundary>
        <Suspense fallback={null}>
          <GameScreen
            onPhaseChange={onTabChange}
            currentTab={appState.currentTab}
          />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary>
        <Suspense fallback={null}>
          <EventScreen />
        </Suspense>
      </ErrorBoundary>

      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: Z_INDEX.SETTINGS,
          padding: 12,
          borderRadius: 12,
          backgroundColor: theme.surfaceRaised,
          borderWidth: 1,
          borderColor: theme.border,
          minWidth: 48,
          minHeight: 48,
          alignItems: 'center',
          justifyContent: 'center',
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.12,
              shadowRadius: 5,
            },
            android: {
              elevation: 3,
            },
            web: {
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            },
          }),
        }}
        onPress={onToggleSettings}
        accessibilityLabel={tStatic('app.openSettings', 'Ayarlari ac')}
        accessibilityRole="button"
      >
        <Feather name="settings" color={theme.textPrimary} size={22} />
      </TouchableOpacity>
    </View>
  );
};
