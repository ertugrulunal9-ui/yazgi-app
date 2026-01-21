/**
 * ONBOARDING INTEGRATION - 5 MINUTE QUICKSTART
 * ==============================================
 * See ONBOARDING_INTEGRATION_GUIDE.md for detailed setup
 *
 * This is a reference guide, not executable code.
 * Copy the patterns shown to App.tsx.
 */

// STEP 1: Add imports to App.tsx
// ============================================================================
// import { Onboarding } from './components/Onboarding';
// import AsyncStorage from '@react-native-async-storage/async-storage';
//
// const ONBOARDING_KEY = '@yazgi/onboarding_completed_v1';

// STEP 2: Add state management
// ============================================================================
// const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
// const [checkingOnboarding, setCheckingOnboarding] = useState(true);

// STEP 3: Check on mount
// ============================================================================
// useEffect(() => {
//   const checkStoredOnboarding = async () => {
//     try {
//       const completed = await AsyncStorage.getItem(ONBOARDING_KEY);
//       setHasCompletedOnboarding(completed === 'true');
//     } catch (error) {
//       console.error('Onboarding check failed:', error);
//     } finally {
//       setCheckingOnboarding(false);
//     }
//   };
//   checkStoredOnboarding();
// }, []);

// STEP 4: Conditional rendering
// ============================================================================
// if (checkingOnboarding) {
//   return <LoadingScreen />; // Your existing loading component
// }
//
// if (!hasCompletedOnboarding) {
//   return (
//     <Onboarding
//       onComplete={async () => {
//         await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
//         setHasCompletedOnboarding(true);
//       }}
//     />
//   );
// }

// STEP 5: Return main app
// ============================================================================
// return (
//   // Your existing app JSX...
// );

// ============================================================================
// OPTIONAL: Add Tutorial Tooltips
// ============================================================================
// import { TutorialTooltip, useTutorialTooltip } from './components/TutorialTooltip';
//
// const tooltip = useTutorialTooltip();
//
// // In JSX:
// <TutorialTooltip
//   visible={tooltip.visible}
//   title={tooltip.title}
//   message={tooltip.message}
//   onDismiss={tooltip.hideTooltip}
//   onNext={tooltip.nextStep}
// />
//
// // Show tooltip:
// tooltip.showTooltip(
//   'Başlık',
//   'Bu mesajı göster'
// );
