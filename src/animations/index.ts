/**
 * Animasyonlar - Ana Export Dosyası
 * Tüm animasyon bileşenlerini tek bir yerden export eder
 */

// Haptic Feedback & Audio
export {
  triggerHaptic,
  buttonPress,
  successHaptic,
  errorHaptic,
  selectionHaptic,
  importantDecision,
  moneyGain,
  moneyLoss,
  achievementUnlock,
  levelUp,
  turnAdvance,
  eventStart,
  gradeGood,
  gradeBad,
  healthCritical,
  traitGainHaptic,
  badOutcomeHaptic,
  fateTokenHaptic,
  ageTransitionHaptic,
  milestoneHaptic,
  type HapticType,
} from './HapticFeedback';

// Screen Transitions
export {
  ScreenTransition,
  FadeInDownView,
  FadeInUpView,
  FadeInLeftView,
  FadeInRightView,
  FadeView,
  StaggeredFadeIn,
  type TransitionType,
} from './ScreenTransitions';

// Button Animations
export {
  AnimatedButton,
  PulseButton,
  ShakeButton,
  ShimmerButton,
  type ButtonAnimationType,
} from './ButtonAnimations';

// Stat Animations
export {
  FloatingNumber,
  AnimatedStatBar,
  CountUpText,
  StatChangeIndicator,
  FlashText,
  type StatChangeType,
} from './StatAnimations';

// Loading Animations
export {
  LoadingSpinner,
  PulseLoader,
  DotsLoader,
  BarsLoader,
  SkeletonLoader,
  BounceLoader,
  type LoadingType,
} from './LoadingAnimations';

// Toast Animations
export {
  Toast,
  AchievementToastNative,
  MessageToast,
  ProgressToast,
  type ToastPosition,
  type ToastAnimationType,
} from './ToastAnimations';
