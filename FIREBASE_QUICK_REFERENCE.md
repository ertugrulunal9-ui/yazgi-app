# Firebase Analytics Quick Reference

## Installation (Already Done)
```bash
npm install @react-native-firebase/app @react-native-firebase/analytics
```

## Files Created
```
src/
  services/analytics.ts          # Main analytics service
  utils/analyticsEvents.ts       # Event tracking wrappers
  utils/analyticsTest.ts         # Testing utilities

root/
  FIREBASE_SETUP.md              # Complete setup guide
  google-services.json           # Android config (download from Firebase)
  GoogleService-Info.plist       # iOS config (download from Firebase)
```

## 1-Minute Setup in App.tsx

```typescript
import { analyticsService } from './services/analytics';

export default function App() {
  useEffect(() => {
    // Set user ID
    analyticsService.setUserId('user-123');
  }, []);

  // Rest of app...
}
```

## Track Events

```typescript
import * as Analytics from './utils/analyticsEvents';

// When game starts
Analytics.handleGameStart('PlayerName', 'normal');

// When character created
Analytics.handleCharacterCreation({
  name: 'John',
  wealth: 1000,
  talent: 75,
  traits: ['INTELLIGENT'],
  familyType: 'SUPPORTIVE',
});

// During gameplay
Analytics.handleEventChoice(event, choice, age);
Analytics.logStudyAction('math', 10, 5);
Analytics.logSportsAction(15, 10);
Analytics.logWorkAction('cashier', 16, 500);

// When game ends
Analytics.logGameEnding({
  age: 18,
  stats: { health: 85, intelligence: 90, charisma: 70, discipline: 80, money: 10000 },
  playtimeMinutes: 240,
  endingType: 'successful',
});
```

## Dev Mode Testing

```typescript
import { analyticsTests } from './utils/analyticsTest';

// Enable console-only logging
analyticsTests.enable();

// Run all tests
await analyticsTests.full();

// Stress test
await analyticsTests.stress(100);

// Simulate complete game
await analyticsTests.simulate();
```

## Android Setup (Last 2 Steps)

1. **Download google-services.json** from [Firebase Console](https://console.firebase.google.com)
2. **Place in** `android/app/google-services.json`
3. **Update** `android/build.gradle`:
```gradle
classpath 'com.google.gms:google-services:4.3.15'
```
4. **Update** `android/app/build.gradle`:
```gradle
apply plugin: 'com.google.gms.google-services'
```

## iOS Setup (Last 2 Steps)

1. **Download GoogleService-Info.plist** from Firebase Console
2. **Add to Xcode**: Drag & drop into `ios/YazgiApp/`
3. **Update** `ios/Podfile`:
```ruby
pod 'Firebase/Analytics'
```
4. **Run**:
```bash
cd ios && pod install && cd ..
npm run ios
```

## Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project → **Analytics**
3. View events in **DebugView** (real-time)
4. Create custom reports with **Custom Reports**

## Quick Debugging

**Android**: 
```bash
adb shell setprop log.tag.FA VERBOSE
adb logcat | grep FA
```

**View DebugView**:
- Open app on device
- Go to Firebase Console > Analytics > DebugView
- Events appear in real-time

## Event Reference

| Event | When | Example |
|-------|------|---------|
| `game_started` | Game begins | Start button pressed |
| `character_created` | Character made | Character customization done |
| `event_completed` | Event choice made | User picks dialog option |
| `hub_action` | Hub activity | Study, sports, work, social |
| `turn_advanced` | Age increases | Every 5 turns |
| `game_ended` | Game finishes | Age 18 reached or failed |
| `purchase_made` | Item bought | In-app purchase completed |

## Event Parameters

All events auto-send:
- `platform` (iOS/Android)
- `timestamp` (ISO format)

Custom parameters sanitized:
- Max 25 per event
- Max 100 chars per name/value
- Automatically truncated if needed

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Events not appearing | Check DebugView in Firebase Console |
| "Firebase not initialized" | Verify google-services.json location |
| iOS build fails | Run `cd ios && pod install && cd ..` |
| Events to console only | App is in dev mode - use `analyticsTests.disable()` for Firebase |

## Type Safety

All event methods are fully typed:

```typescript
// ❌ Wrong - TypeScript will error
analyticsService.logGameStarted({
  characterName: 'John',
  wrongField: 'test', // Error: unknown field
});

// ✅ Correct
analyticsService.logGameStarted({
  characterName: 'John',
  difficulty: 'normal',
});
```

## Advanced: Custom Events

```typescript
await analyticsService.logCustomEvent('trait_formed', {
  trait_name: 'GENIUS',
  age: 12,
});

await analyticsService.logCustomEvent('achievement_unlocked', {
  achievement_id: 'first_million',
});
```

## User Properties

```typescript
// Track user across sessions
await analyticsService.setUserId('user-unique-id');

// Add custom properties for segmentation
await analyticsService.setUserProperty('player_level', 5);
await analyticsService.setUserProperty('total_playtime', 480);
```

---

**Status**: ✅ Ready for production