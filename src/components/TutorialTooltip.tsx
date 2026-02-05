import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TutorialTooltipProps {
  visible: boolean;
  title: string;
  message: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onDismiss: () => void;
  onNext?: () => void;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: '#00ff88',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00ff88',
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: '#ddd',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  dismissButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#555',
  },
  dismissButtonText: {
    color: '#aaa',
    fontSize: 12,
  },
  nextButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#00ff88',
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextButtonText: {
    color: '#1a1a2e',
    fontWeight: 'bold',
    fontSize: 12,
  },
  closeButton: {
    padding: 4,
  },
});

export const TutorialTooltip: React.FC<TutorialTooltipProps> = ({
  visible,
  title,
  message,
  onDismiss,
  onNext,
}) => {
  if (!visible) {
    return null;
  }

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.tooltipContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <Feather name="x" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          <Text style={styles.message}>{message}</Text>

          <View style={styles.footer}>
            <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
              <Text style={styles.dismissButtonText}>Kapat</Text>
            </TouchableOpacity>

            {onNext && (
              <TouchableOpacity onPress={onNext} style={styles.nextButton}>
                <Text style={styles.nextButtonText}>Sonraki</Text>
                <Feather name="chevron-right" size={14} color="#1a1a2e" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

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