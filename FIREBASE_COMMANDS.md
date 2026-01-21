# Firebase Analytics Installation Commands

## Step 1: Install Firebase Packages ✅
```bash
npm install @react-native-firebase/app @react-native-firebase/analytics
```

## Step 2: Android Configuration

### 2.1 Download google-services.json
Go to: https://console.firebase.google.com
- Select project → Settings → Project Settings
- Download `google-services.json`
- Place in: `android/app/google-services.json`

### 2.2 Update android/build.gradle
```gradle
buildscript {
  repositories {
    google()
    mavenCentral()
  }
  dependencies {
    classpath 'com.android.tools.build:gradle:7.4.2'
    classpath 'com.google.gms:google-services:4.3.15'  // ← ADD THIS
  }
}
```

### 2.3 Update android/app/build.gradle
```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'  // ← ADD THIS (near bottom)

android {
  compileSdkVersion 33
  // ... rest of config
}
```

### 2.4 Build and Test
```bash
# Clear and rebuild
cd android
gradlew clean
gradlew build
cd ..

# Run on emulator/device
npm run android
```

## Step 3: iOS Configuration

### 3.1 Download GoogleService-Info.plist
Go to: https://console.firebase.google.com
- Select project → Settings → Project Settings
- Download `GoogleService-Info.plist`

### 3.2 Add to Xcode
```bash
open ios/YazgiApp.xcodeproj
```
- Drag & drop `GoogleService-Info.plist` into Xcode
- Select targets: YazgiApp, YazgiAppTests
- Check "Copy items if needed"

### 3.3 Update ios/Podfile
```ruby
target 'YazgiApp' do
  # ... existing pods
  
  pod 'Firebase/Analytics'
  pod 'Firebase/Core'
  
  # ... rest of config
end
```

### 3.4 Install Pods and Build
```bash
cd ios
pod install
cd ..

npm run ios
```

## Step 4: Quick Setup in App.tsx

```typescript
import React, { useEffect } from 'react';
import { analyticsService } from './services/analytics';

export default function App() {
  useEffect(() => {
    // Initialize analytics
    analyticsService.setUserId('user-unique-id');
    analyticsService.setUserProperty('app_version', '1.0.0');
  }, []);

  return (
    // Your app JSX...
  );
}
```

## Step 5: Test Analytics

### Quick Test
```typescript
import { analyticsService } from './services/analytics';

// In any component or useEffect:
await analyticsService.logGameStarted({
  characterName: 'TestPlayer',
  difficulty: 'normal',
});
```

### Full Test Suite
```typescript
import { analyticsTests } from './utils/analyticsTest';

// Enable console logging (dev mode)
analyticsTests.enable();

// Run all tests
await analyticsTests.full();
```

### View in Firebase Console
```
https://console.firebase.google.com
→ Project → Analytics → DebugView
→ Run app on device
→ Events appear in real-time
```

## Command Reference

### Run App
```bash
npm run android      # Android emulator/device
npm run ios         # iOS simulator
npm start           # Metro bundler
```

### Reset and Rebuild
```bash
# Android
cd android && gradlew clean && cd ..

# iOS
cd ios && rm -rf Pods && pod install && cd ..
```

### Debug Firebase
```bash
# Android - view Firebase logs
adb shell setprop log.tag.FA VERBOSE
adb logcat | grep FA

# iOS - view in Xcode console
# Run app and check Xcode output panel
```

### Clear Cache
```bash
npm cache clean --force
watchman watch-del-all
rm -rf node_modules
npm install
```

## Minimal Integration Example

```typescript
// App.tsx
import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import * as Analytics from './utils/analyticsEvents';

export default function App() {
  useEffect(() => {
    Analytics.setupUserSegmentation('user-123', '1.0.0');
  }, []);

  const handleGameStart = async () => {
    await Analytics.handleGameStart('PlayerName', 'normal');
    // Navigate to game...
  };

  const handleGameEnd = async () => {
    await Analytics.logGameEnding({
      age: 18,
      stats: {
        health: 85,
        intelligence: 90,
        charisma: 70,
        discipline: 80,
        money: 10000,
      },
      playtimeMinutes: 240,
      endingType: 'successful',
    });
    // Navigate to end screen...
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <Button title="Start Game" onPress={handleGameStart} />
      <Button title="End Game" onPress={handleGameEnd} />
    </View>
  );
}
```

## Troubleshooting Commands

```bash
# Check Firebase is installed
npm list @react-native-firebase/app

# View Firebase version
npm view @react-native-firebase/app version

# Clear React Native cache
npx react-native start --reset-cache

# Rebuild native modules
cd android && gradlew clean && cd ..
cd ios && pod install && cd ..

# Check Android Gradle
cd android && gradlew --version && cd ..
```

## Configuration Files

### google-services.json location
```
yazgi/
└── android/
    └── app/
        └── google-services.json  ← Place here
```

### GoogleService-Info.plist location
```
yazgi/
└── ios/
    └── YazgiApp/
        └── GoogleService-Info.plist  ← Add via Xcode
```

## Verification Checklist

- [ ] `npm install` completed successfully
- [ ] `google-services.json` in `android/app/`
- [ ] `GoogleService-Info.plist` added to Xcode
- [ ] `android/build.gradle` updated with Google Services plugin
- [ ] `android/app/build.gradle` apply plugin added
- [ ] `ios/Podfile` updated with Firebase/Analytics
- [ ] `pod install` completed
- [ ] App.tsx has analytics initialization
- [ ] Test events appear in Firebase DebugView
- [ ] No TypeScript compilation errors

---

**All files created and configured. Ready for Firebase integration!**