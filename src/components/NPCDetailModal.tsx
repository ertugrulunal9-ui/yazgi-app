import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Pressable } from 'react-native';
import { NPC } from '../types';
import { Feather } from '@expo/vector-icons';
import { getLocalizedInteractionRestriction, InteractionType } from '../constants/interactionRestrictions';
import { tRuntime } from '../i18n/strings';

interface NPCDetailModalProps {
  npc: NPC | null;
  visible: boolean;
  onClose: () => void;
  onInteract: (npcId: string, actionType: 'CHAT' | 'HANGOUT' | 'GIFT' | 'STUDY') => void;
  currentEnergy: number;
  currentMoney: number;
  theme: {
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accent: string;
    background: string;
  };
}

const getPersonalityLabel = (personality: string): string => (
  tRuntime(`social.personalityLabels.${personality}`, undefined, personality)
);

const getPersonalityHint = (actionType: string, personality: string): string | null => {
  const hint = tRuntime(`social.personalityHints.${actionType}.${personality}`, undefined, '');
  return hint || null;
};

const INTERACTION_OPTIONS: Array<{
  type: InteractionType;
  icon: string;
  energy: number;
  money: number;
}> = [
  { type: 'CHAT', icon: '\u{1F4AC}', energy: 10, money: 0 },
  { type: 'HANGOUT', icon: '\u{1F389}', energy: 15, money: 0 },
  { type: 'GIFT', icon: '\u{1F381}', energy: 5, money: 50 },
  { type: 'STUDY', icon: '\u{1F4DA}', energy: 20, money: 0 },
];

export const NPCDetailModal: React.FC<NPCDetailModalProps> = ({
  npc,
  visible,
  onClose,
  onInteract,
  currentEnergy,
  currentMoney,
  theme,
}) => {
  if (!npc) return null;

  const getRelationshipColor = (value: number) => {
    if (value >= 70) return '#22c55e';
    if (value >= 40) return '#3b82f6';
    if (value >= 0) return '#9ca3af';
    if (value >= -40) return '#f59e0b';
    return '#ef4444';
  };

  const canAfford = (energy: number, money: number) => (
    currentEnergy >= energy && currentMoney >= money
  );

  const personalityLabel = getPersonalityLabel(npc.personality);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.name, { color: theme.textPrimary }]}>{npc.name}</Text>
              <Text style={[styles.age, { color: theme.textSecondary }]}>
                {npc.gender === 'MALE' ? '\u{1F466}' : '\u{1F467}'} {tRuntime('social.npcCard.ageLabel', { age: npc.age })} {'\u2022'} {personalityLabel}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Feather name="x" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={[styles.section, { borderColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                {tRuntime('social.npcDetail.relationshipStatus')}
              </Text>

              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                  {tRuntime('social.screen.relationship')}
                </Text>
                <Text style={[styles.statValue, { color: getRelationshipColor(npc.relationship) }]}>
                  {npc.relationship > 0 ? '+' : ''}{npc.relationship}
                </Text>
              </View>
              <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.abs(npc.relationship)}%`,
                      backgroundColor: getRelationshipColor(npc.relationship),
                    },
                  ]}
                />
              </View>

              {npc.romance > 0 ? (
                <>
                  <View style={[styles.statRow, { marginTop: 12 }]}>
                    <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                      {'\u{1F495}'} {tRuntime('social.npcDetail.romance')}
                    </Text>
                    <Text style={[styles.statValue, { color: '#f472b6' }]}>{npc.romance}</Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${npc.romance}%`, backgroundColor: '#f472b6' },
                      ]}
                    />
                  </View>
                </>
              ) : null}
            </View>

            {npc.traits && npc.traits.length > 0 ? (
              <View style={[styles.section, { borderColor: theme.border }]}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}> 
                  {tRuntime('character.screen.sections.traits')}
                </Text>
                <View style={styles.traitContainer}>
                  {npc.traits.map((trait, index) => (
                    <View
                      key={index}
                      style={[styles.traitBadge, { backgroundColor: `${theme.accent}20`, borderColor: `${theme.accent}40` }]}
                    >
                      <Text style={[styles.traitText, { color: theme.accent }]}>{trait}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            <View style={[styles.section, { borderColor: theme.border }]}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                {tRuntime('social.npcDetail.met')}
              </Text>
              <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                {tRuntime('social.npcDetail.metAtAge', { age: npc.metAge })}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 12 }]}>
                {tRuntime('social.screen.selectInteraction')}
              </Text>
              {INTERACTION_OPTIONS.map((option) => {
                const localized = getLocalizedInteractionRestriction(option.type);
                const affordable = canAfford(option.energy, option.money);

                const personalityHint = getPersonalityHint(option.type, npc.personality);
                return (
                  <TouchableOpacity
                    key={option.type}
                    style={[
                      styles.actionButton,
                      {
                        backgroundColor: affordable ? `${theme.accent}15` : `${theme.border}50`,
                        borderColor: affordable ? theme.accent : theme.border,
                      },
                    ]}
                    onPress={() => {
                      if (affordable) {
                        onInteract(npc.id, option.type as 'CHAT' | 'HANGOUT' | 'GIFT' | 'STUDY');
                        onClose();
                      }
                    }}
                    disabled={!affordable}
                  >
                    <View style={styles.actionLeft}>
                      <Text style={styles.actionIcon}>{option.icon}</Text>
                      <View>
                        <Text style={[styles.actionLabel, { color: affordable ? theme.textPrimary : theme.textSecondary }]}>
                          {localized.label}
                        </Text>
                        <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                          {localized.description}
                        </Text>
                        {personalityHint ? (
                          <Text style={[styles.personalityHint, { color: theme.accent }]}>
                            {personalityHint}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    <View style={styles.actionCost}>
                      {option.energy > 0 ? (
                        <Text style={[styles.costText, { color: affordable ? theme.textSecondary : '#ef4444' }]}>
                          {'\u26A1'}{option.energy}
                        </Text>
                      ) : null}
                      {option.money > 0 ? (
                        <Text style={[styles.costText, { color: affordable ? theme.textSecondary : '#ef4444' }]}>
                          {'\u{1F4B0}'}{'\u20BA'}{option.money}
                        </Text>
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
  },
  age: {
    fontSize: 14,
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  traitContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  traitBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  traitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  personalityHint: {
    fontSize: 11,
    marginTop: 3,
    fontStyle: 'italic',
  },
  actionCost: {
    alignItems: 'flex-end',
    gap: 4,
  },
  costText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
