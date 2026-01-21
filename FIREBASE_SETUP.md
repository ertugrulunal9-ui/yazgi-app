# Firebase Analytics Setup Guide - Yazgı

Complete step-by-step Firebase Analytics integration for React Native.

## 1. Installation

### Packages (Already Installed)
```bash
npm install @react-native-firebase/app @react-native-firebase/analytics
```

### Android Setup

#### Step 1: Add google-services.json
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project or select existing
3. Go to **Settings > Project Settings**
4. Download `google-services.json`
5. Place in: `android/app/google-services.json`

#### Step 2: Update build.gradle files

**android/build.gradle** (project level):
```gradle
buildscript {
  repositories {
    google()
    mavenCentral()
  }
  dependencies {
    classpath 'com.android.tools.build:gradle:7.x.x'
    classpath 'com.google.gms:google-services:4.3.15'  // Add this
  }
}
```

**android/app/build.gradle** (app level):
```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'  // Add this at bottom

android {
  compileSdkVersion 33
  // ... rest of config
}

dependencies {
  // Already managed by React Native Firebase
}
```

#### Step 3: Update AndroidManifest.xml

**android/app/src/main/AndroidManifest.xml**:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
  package="com.yazgi">
  
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  
  <!-- Analytics will auto-initialize -->
  
</manifest>
```

### iOS Setup

#### Step 1: Add GoogleService-Info.plist
1. Download `GoogleService-Info.plist` from Firebase Console
2. Open Xcode: `ios/YazgiApp.xcodeproj`
3. Add file to project
4. Select targets: **YazgiApp**, **YazgiAppTests**
5. Ensure `Copy items if needed` is checked

#### Step 2: Update Podfile

**ios/Podfile**:
```ruby
target 'YazgiApp' do
  # ... existing pods
  
  # Firebase Analytics (auto-linked via React Native Firebase)
  pod 'Firebase/Analytics'
  
  # ... rest of config
end
```

Then run:
```bash
cd ios
pod install
cd ..
```

#### Step 3: Build iOS
```bash
npm run ios
# or
react-native run-ios
```

## 2. Configuration Files

### Firebase Config Files Locations
```
project-root/
├── google-services.json        # Android config (download from Firebase)
├── GoogleService-Info.plist    # iOS config (download from Firebase)
├── android/app/                # google-services.json here
└── ios/YazgiApp/              # GoogleService-Info.plist here
```

## 3. Native Linking (if auto-linking doesn't work)

### Manual Android Linking
```bash
npx react-native link @react-native-firebase/app
npx react-native link @react-native-firebase/analytics
```

### Manual iOS Linking
```bash
cd ios && pod install && cd ..
```

## 4. Using Analytics Service

### Basic Setup in App.tsx

```typescript
import { analyticsService } from './services/analytics';

export default function App() {
  useEffect(() => {
    // Initialize user
    analyticsService.setUserId('user-id-123');
    
    // Set user properties
    analyticsService.setUserProperty('player_level', 1);
  }, []);

  return (
    // Your app...
  );
}
```

### Tracking Game Events

```typescript
// Game started
analyticsService.logGameStarted({
  characterName: 'John',
  difficulty: 'normal',
});

// Character created
analyticsService.logCharacterCreated({
  wealth: 1000,
  talent: 75,
  traits: ['INTELLIGENT', 'ATHLETIC'],
  familyType: 'SUPPORTIVE',
});

// Event completed
analyticsService.logEventCompleted({
  eventId: 'evt_001',
  choiceIndex: 1,
  age: 12,
  eventType: 'school',
});

// Hub action
analyticsService.logHubAction({
  actionType: 'study',
  cost: 20,
  age: 10,
  skillGain: 5,
});

// Turn advanced
analyticsService.logTurnAdvanced({
  age: 15,
  health: 85,
  money: 5000,
  energy: 60,
});

// Game ended
analyticsService.logGameEnded({
  finalAge: 18,
  finalStats: {
    health: 78,
    intelligence: 92,
    charisma: 65,
    discipline: 88,
    money: 12500,
  },
  playtimeMinutes: 245,
  endingType: 'successful',
});

// Purchase made
analyticsService.logPurchaseMade({
  productId: 'premium_pack_1',
  price: 4.99,
  currency: 'USD',
  category: 'cosmetics',
});
```

### Dev Mode (Local Testing)

By default, analytics is **disabled in dev mode** (logs to console only).

```typescript
// Enable analytics in dev
import { enableAnalyticsDebug, disableAnalyticsDebug } from './services/analytics';

enableAnalyticsDebug();   // Shows console logs
disableAnalyticsDebug();  // Disable logging
```

## 5. Testing & Debugging

### View Real-time Events (Android)

```bash
# Enable debug logging
adb shell setprop log.tag.FA VERBOSE
adb shell setprop log.tag.FA-SVC VERBOSE

# Monitor logs
adb logcat | grep FA
```

### Test Events in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select project → Analytics
3. Go to **DebugView** tab
4. Run app: `npm run android`
5. Events appear real-time in DebugView

### Local Testing Script

Create `src/utils/analyticsTest.ts`:

```typescript
import { analyticsService } from '../services/analytics';

export const runAnalyticsTest = async () => {
  console.log('🧪 Running analytics test...');

  try {
    // Test 1: Game started
    await analyticsService.logGameStarted({
      characterName: 'TestCharacter',
      difficulty: 'hard',
    });

    // Test 2: Character created
    await analyticsService.logCharacterCreated({
      wealth: 2000,
      talent: 85,
      traits: ['GENIUS', 'ATHLETIC'],
      familyType: 'CHAOTIC',
    });

    // Test 3: Custom event
    await analyticsService.logCustomEvent('test_event', {
      test_param: 'test_value',
      timestamp: new Date().toISOString(),
    });

    console.log('✅ Analytics test completed');
  } catch (error) {
    console.error('❌ Analytics test failed:', error);
  }
};
```

### Run Test

```typescript
// In App.tsx
import { runAnalyticsTest } from './utils/analyticsTest';

useEffect(() => {
  runAnalyticsTest();
}, []);
```

## 6. Firebase Console Config

### Recommended Settings

1. **Analytics Settings**:
   - Go to Project Settings → Analytics
   - Enable Google Analytics

2. **Data Retention**:
   - Default: 2 months
   - Recommended: 14 months (for longer analysis)

3. **Events**:
   - Automatic events enabled (screen_view, session_start, etc.)
   - Custom events: game_started, character_created, etc.

4. **Custom User Properties**:
   - Add custom user properties in console
   - Example: `player_level`, `total_playtime`, etc.

## 7. Environment Variables (Optional)

Create `.env`:
```
FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
FIREBASE_API_KEY=YOUR_API_KEY
ANALYTICS_ENABLED=true
```

Update `services/analytics.ts`:
```typescript
const ANALYTICS_ENABLED = process.env.ANALYTICS_ENABLED === 'true';

class AnalyticsService {
  private enabled: boolean = ANALYTICS_ENABLED && !isDev;
  // ...
}
```

## 8. Troubleshooting

| Issue | Solution |
|-------|----------|
| Events not appearing | Check Firebase Console > Analytics > DebugView |
| "Firebase app not initialized" | Ensure google-services.json is in android/app/ |
| iOS build fails | Run `cd ios && pod install && cd ..` |
| Module not found | Run `npm install` again, clear cache `npm cache clean --force` |
| Analytics disabled in dev | Use `enableAnalyticsDebug()` to test locally |

## 9. Security Best Practices

1. **Never commit config files**:
   ```bash
   echo "google-services.json" >> .gitignore
   echo "GoogleService-Info.plist" >> .gitignore
   ```

2. **Use Firebase Security Rules** for backend data

3. **Sanitize user data** before logging (already done in service)

4. **Rate limit analytics calls** in high-frequency events

5. **Use User ID only with consent**

## 10. Advanced: Custom Analytics Dashboard

Track KPIs in Firebase Console:
- Average session duration
- User retention rate
- Game completion rate
- Purchase conversion rate

Create custom reports:
1. Analytics > Custom reports
2. Add dimensions: age, difficulty, ending_type
3. Add metrics: event count, user count

---

**Status**: ✅ Firebase Analytics ready for production