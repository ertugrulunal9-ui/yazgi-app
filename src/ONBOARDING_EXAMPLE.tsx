import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Onboarding } from './components/Onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Yazgı Onboarding Integration Example
 * Complete working implementation for App.tsx
 */

interface AppState {
  hasCompletedOnboarding: boolean;
  checkingOnboarding: boolean;
}

const ONBOARDING_KEY = '@yazgi/onboarding_completed_v1';

export const OnboardingExample: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({
    hasCompletedOnboarding: false,
    checkingOnboarding: true,
  });

  // Check if user has completed onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
        setAppState({
          hasCompletedOnboarding: completed === 'true',
          checkingOnboarding: false,
        });
      } catch (error) {
        console.error('Failed to check onboarding:', error);
        setAppState(prev => ({
          ...prev,
          checkingOnboarding: false,
        }));
      }
    };

    checkOnboarding();
  }, []);

  // Show loading while checking
  if (appState.checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a1a2e' }}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Yükleniyor...</Text>
      </View>
    );
  }

  // Show onboarding if first time
  if (!appState.hasCompletedOnboarding) {
    return (
      <Onboarding
        onComplete={async () => {
          try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
            setAppState({
              hasCompletedOnboarding: true,
              checkingOnboarding: false,
            });
          } catch (error) {
            console.error('Failed to save onboarding completion:', error);
            // Still continue even if save fails
            setAppState({
              hasCompletedOnboarding: true,
              checkingOnboarding: false,
            });
          }
        }}
      />
    );
  }

  // Return main app content
  return (
    <View style={{ flex: 1, backgroundColor: '#1a1a2e' }}>
      <Text style={{ color: '#fff', padding: 16 }}>
        Ana uygulama sayfası
      </Text>
    </View>
  );
};

/**
 * Usage in App.tsx:
 *
 * export default function App() {
 *   return <OnboardingExample />;
 * }
 *
 * Or integrate into existing App.tsx:
 *
 * const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
 *
 * if (!hasCompletedOnboarding) {
 *   return (
 *     <Onboarding
 *       onComplete={() => setHasCompletedOnboarding(true)}
 *     />
 *   );
 * }
 *
 * return <YourExistingApp />;
 */