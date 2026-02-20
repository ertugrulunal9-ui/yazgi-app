import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TutorialTooltipProps {
  visible: boolean;
  title: string;
  message: string;
  stepNumber?: number;
  totalSteps?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onDismiss: () => void;
  onNext?: () => void;
  onSkip?: () => void;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 12000,
    elevation: 12000,
  },
  tooltipContainer: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 18,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  stepBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  stepText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#f59e0b',
  },
  message: {
    fontSize: 14,
    color: '#ddd',
    lineHeight: 21,
    marginBottom: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  skipButtonText: {
    color: '#888',
    fontSize: 12,
  },
  nextButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextButtonText: {
    color: '#0b1220',
    fontWeight: 'bold',
    fontSize: 13,
  },
  closeButton: {
    padding: 4,
  },
});

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  visible,
  title,
  message,
  stepNumber,
  totalSteps,
  onDismiss,
  onNext,
  onSkip,
}) => {
  if (!visible) {
    return null;
  }

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;
  const hasSteps = stepNumber != null && totalSteps != null;

  return (
    <View style={[styles.overlay, { paddingTop: statusBarHeight }]}>
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onDismiss}
      />
      <View style={styles.tooltipContainer}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {hasSteps && (
              <View style={styles.stepBadge}>
                <Text style={styles.stepText}>{stepNumber}/{totalSteps}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Feather name="x" size={20} color="#888" />
          </TouchableOpacity>
        </View>

        <Text style={styles.message}>{message}</Text>

        <View style={styles.footer}>
          {onSkip ? (
            <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Tamamını Atla</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={onDismiss} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Kapat</Text>
            </TouchableOpacity>
          )}

          {onNext && (
            <TouchableOpacity onPress={onNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Anladım</Text>
              <Feather name="chevron-right" size={14} color="#0b1220" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

// Legacy hook — kept for backward compatibility
interface UseTutorialTooltipReturn {
  showTooltip: (title: string, message: string) => void;
  hideTooltip: () => void;
  visible: boolean;
  title: string;
  message: string;
  nextStep: () => void;
}

export const useTutorialTooltip = (): UseTutorialTooltipReturn => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const showTooltip = useCallback((newTitle: string, newMessage: string) => {
    setTitle(newTitle);
    setMessage(newMessage);
    setVisible(true);
  }, []);

  const hideTooltip = useCallback(() => {
    setVisible(false);
  }, []);

  const nextStep = useCallback(() => {
    setVisible(false);
  }, []);

  return {
    showTooltip,
    hideTooltip,
    visible,
    title,
    message,
    nextStep,
  };
};
