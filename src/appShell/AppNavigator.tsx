import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Platform, TouchableOpacity, View } from 'react-native';
import { Z_INDEX } from '../constants/zIndex';
import { AppNavigationState, AppTab, GameState } from '../types';
import { getDensityMetrics, getThemeTokens } from '../utils/themeUtils';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { EventScreen } from '../screens/EventScreen';
import { GameOverScreen } from '../screens/GameOverScreen';
import { GameScreen } from '../screens/GameScreen';
import { MainMenuScreen } from '../screens/MainMenuScreen';

interface AppNavigatorProps {
  appState: AppNavigationState;
  gameState: GameState;
  theme: ReturnType<typeof getThemeTokens>;
  metrics: ReturnType<typeof getDensityMetrics>;
  onGameStart: () => void;
  onRestart: () => void;
  onTabChange: (tab: AppTab) => void;
  onToggleSettings: () => void;
}

export const AppNavigator: React.FC<AppNavigatorProps> = ({
  appState,
  gameState,
  theme,
  metrics,
  onGameStart,
  onRestart,
  onTabChange,
  onToggleSettings,
}) => {
  if (!appState.gameStarted) {
    return <MainMenuScreen theme={theme} metrics={metrics} onGameStart={onGameStart} />;
  }

  if (gameState.phase === 'GAME_OVER') {
    return <GameOverScreen theme={theme} metrics={metrics} onRestart={onRestart} npcs={gameState.npcs} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ErrorBoundary>
        <GameScreen
          onPhaseChange={onTabChange}
          currentTab={appState.currentTab}
        />
      </ErrorBoundary>

      <ErrorBoundary>
        <EventScreen />
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
        accessibilityLabel="Ayarlari ac"
        accessibilityRole="button"
      >
        <Feather name="settings" color={theme.textPrimary} size={22} />
      </TouchableOpacity>
    </View>
  );
};
