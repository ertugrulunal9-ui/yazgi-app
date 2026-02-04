# Firebase Crashlytics Integration Guide

## Quick Setup (App.tsx)

```typescript
import React, { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { setupGlobalErrorHandlers } from './utils/crashlyticsSetup';
import { crashReportingService } from './services/crashReporting';

export default function App() {
  useEffect(() => {
    setupGlobalErrorHandlers();

    crashReportingService.setUserId('user-unique-id');
    crashReportingService.setAttribute('app_version', '1.0.0');
  }, []);

  return (
    <ErrorBoundary>
      <YourAppComponent />
    </ErrorBoundary>
  );
}
```

## Track Errors During Gameplay

```typescript
import { crashReportingService } from './services/crashReporting';

try {
  await saveGame(gameData);
} catch (error) {
  await crashReportingService.logError(error, {
    userId: player.name,
    gameAge: gameData.age,
    wealth: gameData.wealth,
    stats: gameData.stats,
    action: 'save_game',
    phase: 'HUB',
  });
}
```

## Set Game Context

```typescript
await crashReportingService.setGameStats({
  health: 85,
  intelligence: 90,
  charisma: 70,
  discipline: 80,
  money: 5000,
});
```

## Log Non-Fatal Errors

```typescript
try {
  processEvent();
} catch (error) {
  await crashReportingService.logNonFatal(
    error,
    'Event processing failed'
  );
}
```

## Testing

```typescript
import { CrashTestingUtils } from './utils/crashTest';

// Run all tests
await CrashTestingUtils.runAllTests();

// Test specific scenarios
await CrashTestingUtils.testWithGameContext();
await CrashTestingUtils.throwTestError(); // Triggers ErrorBoundary
```

## Firebase Console View

1. Go to Firebase Console
2. Project > Crashlytics
3. View crash reports in real-time
4. See custom attributes and user context

## Dev vs Production

**Dev Mode**: Logs to console, errors shown in ErrorBoundary  
**Production**: Silent failures, crash reports sent to Firebase

Set with: `crashReportingService.setEnabled(true/false)`

## Error Boundary Behavior

When a component crashes:
1. ErrorBoundary catches it
2. Sends to Crashlytics (production only)
3. Shows error UI with restart button
4. Dev mode shows full error details

## Best Practices

✅ Set user ID for tracking sessions  
✅ Add game context before operations  
✅ Use logNonFatal for expected errors  
✅ Use logError for unexpected crashes  
✅ Wrap ErrorBoundary at app root  
✅ Call setupGlobalErrorHandlers early  

## Android Setup

Update `android/build.gradle`:
```gradle
buildscript {
  dependencies {
    classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.9'
  }
}
```

Update `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.firebase.crashlytics'
```

## iOS Setup

Update `ios/Podfile`:
```ruby
pod 'Firebase/Crashlytics'
```

Run:
```bash
cd ios && pod install && cd ..
```

## Disable in Testing

```typescript
crashReportingService.setEnabled(false);
```

All errors will log to console only.
