/**
 * Toast Animasyonları
 * React Native Reanimated ile native toast animasyonları
 * Performans için optimize edilmiş
 */

import React, { ReactNode, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  Easing,
  FadeInDown,
} from 'react-native-reanimated';
import { successHaptic } from './HapticFeedback';

export type ToastPosition = 'top' | 'bottom' | 'center';

export type ToastAnimationType = 
  | 'slideIn'       // Kayarak girme
  | 'popIn'         // Patlama efekti
  | 'scaleIn'       // Ölçekleme efekti
  | 'bounceIn';      // Zıplayarak girme

interface ToastProps {
  visible: boolean;
  children: ReactNode;
  position?: ToastPosition;
  animationType?: ToastAnimationType;
  duration?: number;
  style?: ViewStyle;
  onClose?: () => void;
}

/**
 * Genel toast bileşeni
 */
export const Toast: React.FC<ToastProps> = React.memo(({
  visible,
  children,
  position = 'top',
  animationType = 'slideIn',
  duration = 3000,
  style,
  onClose,
}) => {
  const translateY = useSharedValue(position === 'top' ? -100 : 100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const hasTriggeredHaptic = useRef(false);

  useEffect(() => {
    if (visible) {
      // Haptic feedback - sadece bir kez tetikle
      if (!hasTriggeredHaptic.current) {
        successHaptic();
        hasTriggeredHaptic.current = true;
      }

      // Show animation
      switch (animationType) {
        case 'slideIn':
          translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
          opacity.value = withTiming(1, { duration: 300 });
          break;
        case 'popIn':
          scale.value = withSpring(1, { damping: 15, stiffness: 400 });
          opacity.value = withTiming(1, { duration: 200 });
          break;
        case 'scaleIn':
          scale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
          opacity.value = withTiming(1, { duration: 300 });
          break;
        case 'bounceIn':
          scale.value = withSequence(
            withSpring(1.1, { damping: 8, stiffness: 400 }),
            withSpring(1, { damping: 15, stiffness: 400 })
          );
          translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.ease) });
          opacity.value = withTiming(1, { duration: 300 });
          break;
      }

      // Auto hide
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => {
        clearTimeout(timer);
        hasTriggeredHaptic.current = false;
      };
    }
    
    return undefined;
  }, [visible]);

  const hideToast = () => {
    translateY.value = withTiming(
      position === 'top' ? -100 : 100,
      { duration: 300, easing: Easing.in(Easing.ease) }
    );
    opacity.value = withTiming(0, { duration: 300 });

    const timer = setTimeout(() => {
      onClose?.();
    }, 300);

    return () => clearTimeout(timer);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const transformArray: any[] = [];
    transformArray.push({ translateY: translateY.value });
    if (animationType === 'popIn' || animationType === 'scaleIn' || animationType === 'bounceIn') {
      transformArray.push({ scale: scale.value });
    }
    return {
      transform: transformArray,
      opacity: opacity.value,
    };
  });

  const positionStyle = position === 'top' 
    ? styles.topPosition 
    : position === 'bottom' 
    ? styles.bottomPosition 
    : styles.centerPosition;

  return (
    <Animated.View style={[styles.toastContainer, positionStyle, animatedStyle, style]} pointerEvents="none">
      {children}
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return prevProps.visible === nextProps.visible &&
         prevProps.position === nextProps.position &&
         prevProps.animationType === nextProps.animationType &&
         prevProps.style === nextProps.style;
});

/**
 * Başarı toast bileşeni (native versiyon)
 */
export const AchievementToastNative: React.FC<{
  visible: boolean;
  icon: string;
  title: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  onClose?: () => void;
}> = React.memo(({
  visible,
  icon,
  title,
  description,
  rarity,
  onClose,
}) => {
  const rarityColors = {
    COMMON: { bg: '#374151', border: '#4b5563', glow: '#6b7280' },
    RARE: { bg: '#1d4ed8', border: '#3b82f6', glow: '#60a5fa' },
    EPIC: { bg: '#7c3aed', border: '#8b5cf6', glow: '#a78bfa' },
    LEGENDARY: { bg: '#d97706', border: '#f59e0b', glow: '#fbbf24' },
  };

  const colors = rarityColors[rarity];

  return (
    <Toast
      visible={visible}
      animationType="bounceIn"
      position="top"
      onClose={onClose}
      style={StyleSheet.flatten([
        styles.achievementToast,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          ...Platform.select({
            web: {
              boxShadow: `0 4px 10px ${colors.glow}`,
            },
            ios: {
              shadowColor: colors.glow,
            },
          }),
        },
      ])}
    >
      <View style={styles.achievementContent}>
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={styles.achievementIcon}
        >
          <Text style={styles.achievementIconText}>{icon}</Text>
        </Animated.View>
        
        <View style={styles.achievementText}>
          <Text style={styles.achievementTitle}>{title}</Text>
          <Text style={styles.achievementDescription}>{description}</Text>
        </View>

        <View style={styles.achievementBadge}>
          <Text style={styles.achievementBadgeText}>{rarity}</Text>
        </View>
      </View>
    </Toast>
  );
}, (prevProps, nextProps) => {
  return prevProps.visible === nextProps.visible &&
         prevProps.rarity === nextProps.rarity &&
         prevProps.title === nextProps.title;
});

/**
 * Basit mesaj toast bileşeni
 */
export const MessageToast: React.FC<{
  visible: boolean;
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
  style?: ViewStyle;
}> = React.memo(({
  visible,
  message,
  type = 'info',
  onClose,
  style,
}) => {
  const typeColors = {
    success: { bg: '#065f46', border: '#059669', text: '#34d399' },
    error: { bg: '#7f1d1d', border: '#dc2626', text: '#f87171' },
    info: { bg: '#1e3a8a', border: '#2563eb', text: '#60a5fa' },
    warning: { bg: '#78350f', border: '#d97706', text: '#fbbf24' },
  };

  const colors = typeColors[type];

  return (
    <Toast
      visible={visible}
      animationType="slideIn"
      position="top"
      onClose={onClose}
      style={StyleSheet.flatten([
        styles.messageToast,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
        },
        style,
      ])}
    >
      <Text style={[styles.messageText, { color: colors.text }]}>
        {message}
      </Text>
    </Toast>
  );
}, (prevProps, nextProps) => {
  return prevProps.visible === nextProps.visible &&
         prevProps.type === nextProps.type &&
         prevProps.message === nextProps.message &&
         prevProps.style === nextProps.style;
});

/**
 * Progress toast bileşeni (yükleniyor gösterimi)
 */
export const ProgressToast: React.FC<{
  visible: boolean;
  message: string;
  progress: number; // 0-100
}> = React.memo(({ visible, message, progress }) => {
  const progressWidth = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      progressWidth.value = withTiming(progress, { duration: 300 });
    }
  }, [visible, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return (
    <Toast
      visible={visible}
      animationType="slideIn"
      position="center"
      style={styles.progressToast}
    >
      <Text style={styles.progressText}>{message}</Text>
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, animatedStyle]} />
      </View>
      <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
    </Toast>
  );
}, (prevProps, nextProps) => {
  return prevProps.visible === nextProps.visible &&
         prevProps.progress === nextProps.progress &&
         prevProps.message === nextProps.message;
});

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  topPosition: {
    top: 60,
  },
  bottomPosition: {
    bottom: 100,
  },
  centerPosition: {
    top: '50%',
    marginTop: -50,
  },
  achievementToast: {
    minWidth: 320,
    maxWidth: 400,
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)',
      },
      ios: {
        shadowOpacity: 0.5,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIconText: {
    fontSize: 24,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  achievementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  achievementBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
  },
  messageToast: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressToast: {
    minWidth: 280,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  progressText: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  progressPercent: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default Toast;
