import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { tRuntime } from '../i18n/strings';

interface AudioSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {tRuntime('app.audioSettingsTitle', undefined, 'Ses Ayarlari')}
          </Text>
          <Text style={styles.description}>
            {tRuntime('app.audioSettingsDescription', undefined, 'Bu ekran mobil surumde kullanilmiyor.')}
          </Text>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>
              {tRuntime('app.audioSettingsClose', undefined, 'Kapat')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
    backgroundColor: '#111827',
    borderWidth: 1,
    borderColor: '#374151',
    gap: 12,
  },
  title: {
    color: '#f9fafb',
    fontSize: 18,
    fontWeight: '700',
  },
  description: {
    color: '#d1d5db',
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    marginTop: 4,
    alignSelf: 'flex-end',
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default AudioSettings;
