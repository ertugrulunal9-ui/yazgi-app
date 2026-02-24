import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getThemeTokens } from '../utils/themeUtils';
import { tRuntime } from '../i18n/strings';

interface MilestoneDetailModalProps {
  visible: boolean;
  milestone?: {
    level: number;
    benefits: string[];
    unlocked: boolean;
    skillName: string;
  } | null;
  onClose: () => void;
  theme: ReturnType<typeof getThemeTokens>;
}

export const MilestoneDetailModal: React.FC<MilestoneDetailModalProps> = ({
  visible,
  milestone,
  onClose,
  theme,
}) => {
  if (!milestone) return null;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContainer: {
      backgroundColor: theme.surfaceRaised,
      borderRadius: 20,
      width: '100%',
      maxWidth: 400,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.surfaceBase,
    },
    headerTitle: {
      color: theme.textPrimary,
      fontSize: 18,
      fontWeight: '700',
    },
    content: {
      padding: 24,
      alignItems: 'center',
    },
    badgeContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: milestone.unlocked ? theme.accentSkill : theme.surfaceOverlay,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      borderWidth: 4,
      borderColor: milestone.unlocked ? theme.surfaceBase : theme.border,
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    levelText: {
      color: milestone.unlocked ? '#fff' : theme.textSecondary,
      fontSize: 24,
      fontWeight: '800',
    },
    statusText: {
      color: milestone.unlocked ? theme.accentSkill : theme.textSecondary,
      fontSize: 14,
      fontWeight: '700',
      textTransform: 'uppercase',
      marginBottom: 24,
      letterSpacing: 1,
    },
    benefitContainer: {
      width: '100%',
      backgroundColor: theme.surfaceBase,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    benefitTitle: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: 12,
      letterSpacing: 0.5,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
      gap: 10,
    },
    benefitText: {
      color: theme.textPrimary,
      fontSize: 15,
      lineHeight: 20,
      flex: 1,
    },
    closeButton: {
      marginTop: 24,
      backgroundColor: theme.surfaceOverlay,
      paddingVertical: 12,
      paddingHorizontal: 32,
      borderRadius: 12,
    },
    closeButtonText: {
      color: theme.textPrimary,
      fontWeight: '600',
      fontSize: 15,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {milestone.skillName} {tRuntime('skillTree.modal.detailSuffix', undefined, 'Detay')}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.badgeContainer}>
              <Text style={styles.levelText}>{milestone.level}</Text>
            </View>

            <Text style={styles.statusText}>
              {milestone.unlocked
                ? tRuntime('skillTree.modal.statusOpen', undefined, 'Acik')
                : tRuntime('skillTree.modal.statusLocked', undefined, 'Kilitli')}
            </Text>

            <View style={styles.benefitContainer}>
              <Text style={styles.benefitTitle}>
                {tRuntime('skillTree.modal.rewards', undefined, 'Kazanc')}
              </Text>
              {milestone.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Feather
                    name={milestone.unlocked ? 'check-circle' : 'lock'}
                    size={18}
                    color={milestone.unlocked ? theme.accentSkill : theme.textSecondary}
                    style={{ marginTop: 1 }}
                  />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>{tRuntime('buttons.close', undefined, 'Kapat')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
