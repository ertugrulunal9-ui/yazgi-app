import React from 'react';
import {
  Modal as RNModal,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from 'react-native';
import { useUI } from '../../context/UIContext';
import { Card } from './Card';
import { Typography } from './Typography';

interface ModalProps {
  visible: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  contentStyle?: ViewStyle;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  title,
  onClose,
  children,
  footer,
  contentStyle,
}) => {
  const { theme } = useUI();

  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close modal"
      >
        <TouchableWithoutFeedback onPress={() => {}}>
          <Card
            variant="raised"
            style={[
              styles.container,
              {
                borderColor: theme.border,
              },
              contentStyle,
            ]}
          >
            {title ? (
              <Typography variant="h2" tone="primary" style={styles.title}>
                {title}
              </Typography>
            ) : null}

            <View>{children}</View>
            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </Card>
        </TouchableWithoutFeedback>
      </Pressable>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 560,
    borderRadius: 16,
  },
  title: {
    marginBottom: 12,
  },
  footer: {
    marginTop: 16,
  },
});
