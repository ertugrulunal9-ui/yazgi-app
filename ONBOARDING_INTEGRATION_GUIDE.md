/**
 * ONBOARDING INTEGRATION GUIDE
 * =============================
 * 
 * React Native Yazgı Onboarding Sistemi Entegrasyonu
 * 
 * @version 1.0
 * @date January 2026
 */

# Onboarding Sistemi - Integration Guide

## 📁 Dosyalar

```
src/components/
├── Onboarding.tsx          ← 3 slide swipeable onboarding
├── TutorialTooltip.tsx     ← Reusable tooltip component
└── [...existing components]
```

---

## 1️⃣ App.tsx'e Entegre Et

### Step 1: Import ve State

```typescript
import { Onboarding } from './components/Onboarding';
import { TutorialTooltip, useTutorialTooltip } from './components/TutorialTooltip';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = '@yazgi/onboarding_completed';

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const tooltip = useTutorialTooltip();

  // Check if user completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        setHasCompletedOnboarding(completed === 'true');
      } catch (error) {
        console.error('Onboarding check failed:', error);
      } finally {
        setCheckingOnboarding(false);
      }
    };
    checkOnboarding();
  }, []);

  if (checkingOnboarding) {
    return <LoadingScreen />; // Your existing loading screen
  }

  if (!hasCompletedOnboarding) {
    return (
      <Onboarding
        onComplete={async () => {
          try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            setHasCompletedOnboarding(true);
          } catch (error) {
            console.error('Failed to save onboarding state:', error);
          }
        }}
        onSkip={async () => {
          try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            setHasCompletedOnboarding(true);
          } catch (error) {
            console.error('Failed to save onboarding state:', error);
          }
        }}
      />
    );
  }

  // Rest of your existing app code...
  return (
    <View className="flex-1 bg-slate-900">
      {/* Your existing game UI */}
      
      {/* Tooltip overlay */}
      <TutorialTooltip
        visible={tooltip.visible}
        title={tooltip.title}
        message={tooltip.message}
        onDismiss={tooltip.hideTooltip}
        onNext={tooltip.nextStep}
      />
    </View>
  );
}
```

---

## 2️⃣ İlk Event'te Tooltip Kullan

### Hub Actions'dan Event seçildiğinde:

```typescript
const handleEventStart = (event: GameEvent) => {
  // Check if first event
  const isFirstEvent = gameState.historyLog.length === 0;

  if (isFirstEvent && !sessionStorage.getItem('event_tooltip_shown')) {
    tooltip.showTooltip(
      '🎬 Bir Event Başladı!',
      'Seçimler yaparak karakterini geliştirirsin. Her seçim farklı sonuçlar doğurur.'
    );
    sessionStorage.setItem('event_tooltip_shown', 'true');
  }

  // Start event normally
  setGameState(prev => ({
    ...prev,
    phase: 'EVENT',
    currentEvent: event,
  }));
};
```

---

## 3️⃣ Hub Menu İlk Kullanımda Tooltip

```typescript
const showHubTutorial = async () => {
  const hubTutorialShown = await AsyncStorage.getItem('@yazgi/hub_tutorial_shown');
  
  if (!hubTutorialShown && gameState.age >= 7) {
    tooltip.showTooltip(
      '📚 Hub Menu',
      'Burada ders çalışma, spor yapma, sosyal etkinlik gibi aktiviteleri seçebilirsin. Enerjine dikkat et!'
    );
    await AsyncStorage.setItem('@yazgi/hub_tutorial_shown', 'true');
  }
};

// Call in useEffect when phase changes to HUB
useEffect(() => {
  if (gameState.phase === 'HUB' && gameState.age === 7 && stats.energy > 0) {
    showHubTutorial();
  }
}, [gameState.phase, gameState.age]);
```

---

## 4️⃣ Dashboard Stats İlk Görülmede Tooltip

```typescript
// In Dashboard.tsx
import { useTutorialTooltip } from '../components/TutorialTooltip';
import { useRef } from 'react';

export const Dashboard = ({ stats, gameState }: DashboardProps) => {
  const tooltip = useTutorialTooltip();
  const energyRef = useRef<View>(null);

  useEffect(() => {
    const showEnergyTutorial = async () => {
      const shown = await AsyncStorage.getItem('@yazgi/energy_tutorial_shown');
      if (!shown && gameState.turn === 1) {
        // Delay to ensure layout is ready
        setTimeout(() => {
          tooltip.showTooltip(
            '⚡ Enerji Önemli',
            'Enerji sıfırlandığında gün biter. Her gün enerji sıfırlanır.'
          );
        }, 500);
        await AsyncStorage.setItem('@yazgi/energy_tutorial_shown', 'true');
      }
    };
    showEnergyTutorial();
  }, [gameState.turn]);

  return (
    <View>
      {/* Your dashboard */}
      <View ref={energyRef} className="...">
        {/* Energy display */}
      </View>
      
      {/* Pass tooltip to parent or use context */}
    </View>
  );
};
```

---

## 5️⃣ İn-Game Reachable Tooltips

```typescript
// Create a hook for guided tours
export const useGuidedTour = () => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const completeStep = async (stepId: string) => {
    setCompletedSteps(prev => [...prev, stepId]);
    await AsyncStorage.setItem(
      '@yazgi/completed_tours',
      JSON.stringify([...completedSteps, stepId])
    );
  };

  const isStepCompleted = (stepId: string) => completedSteps.includes(stepId);

  return { completeStep, isStepCompleted };
};

// Usage in App.tsx
const tour = useGuidedTour();

// Show tooltip only once
const showFirstStudyTutorial = () => {
  if (!tour.isStepCompleted('first_study') && stats.intelligence < 5) {
    tooltip.showTooltip(
      '📚 İlk Ders',
      'Ders çalışmak Zeka kazandırır. Okul notlarını da etkiler!'
    );
    tour.completeStep('first_study');
  }
};
```

---

## 6️⃣ TypeScript Types

```typescript
// types.ts
declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      accessible?: boolean;
      accessibilityLabel?: string;
      accessibilityRole?: 'button' | 'header' | 'alert' | 'tab';
      accessibilityState?: Record<string, boolean>;
      accessibilityHint?: string;
    }
  }
}
```

---

## 📱 Testing Onboarding

### Reset onboarding locally:
```typescript
// Dev menu
const resetOnboarding = async () => {
  await AsyncStorage.removeItem(ONBOARDING_KEY);
  await AsyncStorage.removeItem('@yazgi/event_tooltip_shown');
  await AsyncStorage.removeItem('@yazgi/hub_tutorial_shown');
  await AsyncStorage.removeItem('@yazgi/energy_tutorial_shown');
  // Restart app
};
```

### Test on different devices:
```bash
# Web
npm run web

# iOS
npm run ios

# Android
npm run android
```

---

## ⚙️ Customization

### Change Onboarding Colors
```typescript
// Onboarding.tsx - slides array
const slides: Slide[] = [
  {
    backgroundColor: 'bg-gradient-to-br from-purple-900 to-indigo-900', // Change here
  },
  // ...
];
```

### Add More Slides
```typescript
// Onboarding.tsx
slides.push({
  id: 'custom',
  title: 'Custom Title',
  subtitle: 'Custom Subtitle',
  backgroundColor: 'bg-gradient-to-br from-slate-900 to-slate-800',
  content: (
    <View className="flex-1 justify-center items-center">
      {/* Your custom content */}
    </View>
  ),
});
```

### Change Tooltip Position
```typescript
<TutorialTooltip
  position="left"  // 'top' | 'bottom' | 'left' | 'right'
  highlightOverlay={false}  // Disable highlight
  showArrow={false}  // Hide arrow
/>
```

---

## 🎯 Best Practices

### ✅ DO
- Show tooltips after user action (not immediately)
- Use AsyncStorage to track completion
- Provide skip option for experienced users
- Keep messages short and actionable
- Test on both iOS and Android

### ❌ DON'T
- Show too many tooltips (max 1-2 per session)
- Block gameplay with mandatory tutorials
- Use confusing terminology
- Show tooltips on loading screens
- Forget accessibility labels

---

## 🔗 Dependencies

```json
{
  "dependencies": {
    "react": "^18.x",
    "react-native": "^0.71.x",
    "@react-native-async-storage/async-storage": "^1.17.x",
    "nativewind": "^2.x",
    "lucide-react": "^0.x"
  }
}
```

Already installed ✅

---

## 📊 Accessibility

All components include:
- ✅ `accessibilityLabel` props
- ✅ `accessibilityRole` definitions
- ✅ `accessibilityHint` for buttons
- ✅ Screen reader support
- ✅ Keyboard navigation (web)

---

## 🐛 Troubleshooting

### Onboarding not showing
```typescript
// Check AsyncStorage
const value = await AsyncStorage.getItem(ONBOARDING_KEY);
console.log('Onboarding completed:', value);

// Reset if stuck
await AsyncStorage.removeItem(ONBOARDING_KEY);
```

### Tooltip position incorrect
```typescript
// Ensure targetRef is passed and measured
if (targetRef?.current) {
  targetRef.current.measureInWindow((x, y, w, h) => {
    console.log('Target layout:', { x, y, w, h });
  });
}
```

### Animation janky
```typescript
// Check if you're on slow device
// Reduce animation duration in TutorialTooltip.tsx:
Animated.timing(opacity, {
  toValue: 1,
  duration: 200,  // Reduce from 300
  useNativeDriver: true,
}).start();
```

---

## 📈 Analytics Integration (Optional)

```typescript
// Track onboarding completion
const handleOnboardingComplete = async () => {
  analytics.logEvent('onboarding_completed', {
    timestamp: new Date(),
    platform: Platform.OS,
  });

  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  setHasCompletedOnboarding(true);
};

// Track tooltip views
const showTooltip = (stepId: string) => {
  analytics.logEvent('tutorial_tooltip_shown', {
    step_id: stepId,
    timestamp: new Date(),
  });
  // ... show tooltip
};
```

---

## ✨ Next Steps

1. Copy components to `src/components/`
2. Add imports to `App.tsx`
3. Wrap existing UI with onboarding check
4. Test on device/emulator
5. Customize colors/text as needed
6. Add more tooltips throughout game

---

**Version:** 1.0  
**Status:** Ready to integrate  
**Compatibility:** React Native (Expo) + Web  

