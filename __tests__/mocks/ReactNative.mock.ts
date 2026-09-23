// React Native mock for Node environment

export const View = 'View';
export const Text = 'Text';
export const TouchableOpacity = 'TouchableOpacity';
export const TouchableWithoutFeedback = 'TouchableWithoutFeedback';
export const Pressable = 'Pressable';
export const ScrollView = 'ScrollView';
export const FlatList = 'FlatList';
export const TextInput = 'TextInput';
export const Modal = 'Modal';
export const ActivityIndicator = 'ActivityIndicator';
export const SafeAreaView = 'SafeAreaView';
export const StyleSheet = {
  create: <T extends Record<string, unknown> | Record<string, unknown>[]>(
    styles: T
  ): T => styles,
  flatten: (style: any) => style,
  compose: (style1: any, style2: any) => {
    if (!style1) return style2;
    if (!style2) return style1;
    return [style1, style2];
  },
  hairlineWidth: 1,
};
export const Animated = {
  Value: class MockAnimatedValue {
    constructor(value: number) {}
    setValue(value: number) {}
    stopAnimation(callback?: (value: number) => void) {
      callback?.(1);
    }
    interpolate(config: any) { return '100%'; }
  },
  timing: jest.fn(() => ({
    start: jest.fn((callback?: () => void) => callback && callback()),
    stop: jest.fn(),
  })),
  sequence: jest.fn((animations: Array<{ start?: (callback?: () => void) => void }>) => ({
    start: jest.fn((callback?: () => void) => {
      animations.forEach(animation => animation?.start?.());
      callback?.();
    }),
    stop: jest.fn(),
  })),
  loop: jest.fn((animation: { start?: (callback?: () => void) => void }, _config?: unknown) => ({
    start: jest.fn((callback?: () => void) => {
      animation?.start?.();
      callback?.();
    }),
    stop: jest.fn(),
  })),
  View: 'Animated.View',
};

export const Appearance = {
  getColorScheme: jest.fn(() => 'light'),
  addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
};

export const Alert = {
  alert: jest.fn(),
};

export const AppState = {
  currentState: 'active' as const,
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
};

export const Platform = {
  OS: 'ios',
  select: jest.fn((obj) => obj.ios || obj.default),
};

export default {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Pressable,
  ScrollView,
  FlatList,
  TextInput,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Animated,
  Appearance,
  Alert,
  AppState,
  Platform,
};
