# Crashlytics Examples

## Basic Setup

```typescript
import { ErrorBoundary } from './components/ErrorBoundary';
import { setupGlobalErrorHandlers } from './utils/crashlyticsSetup';
import { crashReportingService } from './services/crashReporting';

export default function App() {
  useEffect(() => {
    setupGlobalErrorHandlers();
    crashReportingService.setUserId('player-123');
  }, []);

  return (
    <ErrorBoundary>
      <Game />
    </ErrorBoundary>
  );
}
```

## Game Session Tracking

```typescript
const startGame = async (playerName: string, difficulty: string) => {
  await crashReportingService.setUserId(playerName);
  await crashReportingService.setAttribute('difficulty', difficulty);
  await crashReportingService.logMessage(`Game started: ${playerName}`, 'info');
};

const updateGameContext = async (age: number, stats: Stats) => {
  await crashReportingService.setAttribute('age', age);
  await crashReportingService.setGameStats({
    health: stats.health,
    intelligence: stats.intelligence,
    charisma: stats.charisma,
    discipline: stats.discipline,
    money: stats.money,
  });
};

const endGame = async (ending: string) => {
  await crashReportingService.logMessage(`Game ended: ${ending}`, 'info');
};
```

## Event Handling

```typescript
const handleEventChoice = async (event: GameEvent, choiceIndex: number) => {
  try {
    const result = await processChoice(event, choiceIndex);
    return result;
  } catch (error) {
    // Detaylı context ile hata logla
    await crashReportingService.logError(error as Error, {
      eventId: event.id,
      action: 'handle_event_choice',
      phase: 'EVENT',
      gameAge: gameState.age,
    });

    throw error;
  }
};
```

## Data Saving

```typescript
const saveGame = async (gameData: GameState) => {
  try {
    await AsyncStorage.setItem('game_save', JSON.stringify(gameData));
    await crashReportingService.logMessage('Game saved', 'info');
  } catch (error) {
    await crashReportingService.logNonFatal(
      error as Error,
      'Game save failed'
    );

    showErrorToast('Oyun kaydedilemedi');
  }
};

const loadGame = async (): Promise<GameState | null> => {
  try {
    const data = await AsyncStorage.getItem('game_save');
    if (data) {
      const gameData = JSON.parse(data);
      await crashReportingService.logMessage('Game loaded', 'info');
      return gameData;
    }
    return null;
  } catch (error) {
    await crashReportingService.logNonFatal(
      error as Error,
      'Game load failed'
    );

    return null;
  }
};
```

## Analytics Integration

```typescript
import { analyticsService } from './services/analytics';

const trackEvent = async (eventName: string, params?: Record<string, any>) => {
  try {
    await analyticsService.logCustomEvent(eventName, params);
  } catch (error) {
    await crashReportingService.logNonFatal(
      error as Error,
      `Analytics event failed: ${eventName}`
    );
  }
};
```

## Network Operations

```typescript
const fetchGameData = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    await crashReportingService.logNonFatal(
      error as Error,
      `Network request failed: ${url}`
    );

    return null;
  }
};
```

## Testing in Development

```typescript
import { CrashTestingUtils } from './utils/crashTest';

// In dev menu or debug screen
export const DevMenu = () => {
  return (
    <View>
      <Button
        title="Test Crash Reporting"
        onPress={() => CrashTestingUtils.runAllTests()}
      />
      <Button
        title="Test ErrorBoundary"
        onPress={() => CrashTestingUtils.throwTestError()}
      />
    </View>
  );
};
```

## Custom Error Context

```typescript
const processGameTurn = async (turn: GameTurn) => {
  try {
    const result = await executeGameLogic(turn);
    return result;
  } catch (error) {
    await crashReportingService.logError(error as Error, {
      userId: gameState.playerName,
      gameAge: gameState.age,
      wealth: gameState.stats.money,
      stats: {
        health: gameState.stats.health,
        intelligence: gameState.stats.intelligence,
        charisma: gameState.stats.charisma,
        discipline: gameState.stats.discipline,
      },
      action: 'process_game_turn',
      phase: gameState.phase,
      eventId: turn.eventId,
    });

    throw error;
  }
};
```

## Non-Fatal Warning System

```typescript
const checkGameHealth = async () => {
  const warnings: string[] = [];

  if (gameState.stats.health < 20) {
    warnings.push('Low health warning');
  }

  if (gameState.stats.energy === 0) {
    warnings.push('Zero energy - day ending');
  }

  if (gameState.stats.money < 100) {
    warnings.push('Low funds warning');
  }

  for (const warning of warnings) {
    await crashReportingService.logMessage(warning, 'warning');
  }
};
```

## Error Recovery

```typescript
const withErrorRecovery = async <T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    await crashReportingService.logNonFatal(
      error as Error,
      'Operation failed, using fallback'
    );

    return fallback;
  }
};

const stats = await withErrorRecovery(
  () => calculatePlayerStats(),
  DEFAULT_STATS
);
```

## Performance Monitoring

```typescript
const timedOperation = async <T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> => {
  const start = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - start;

    if (duration > 5000) {
      await crashReportingService.logMessage(
        `Slow operation: ${name} took ${duration}ms`,
        'warning'
      );
    }

    return result;
  } catch (error) {
    const duration = Date.now() - start;

    await crashReportingService.logError(error as Error, {
      action: name,
      eventId: `perf_${duration}ms`,
    });

    throw error;
  }
};

const gameState = await timedOperation(
  'load_game_state',
  () => loadGameFromStorage()
);
```
