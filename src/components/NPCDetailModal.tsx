import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet, Pressable } from 'react-native';
import { NPC } from '../types';
import { Feather } from '@expo/vector-icons';

// =================================================================
// NPC DETAY MODAL BİLEŞENİ
// NPC'ye tıklandığında açılır, etkileşim seçenekleri sunar
// =================================================================

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

// Kişilik Türkçe isimleri
const PERSONALITY_NAMES: Record<string, string> = {
    FRIENDLY: 'Arkadaş Canlısı',
    SHY: 'Utangaç',
    AGGRESSIVE: 'Agresif',
    POPULAR: 'Popüler',
    NERDY: 'İntellektüel',
    ARTISTIC: 'Sanatçı',
    ATHLETIC: 'Atletik',
};

// Etkileşim tipleri
const INTERACTION_OPTIONS = [
    { type: 'CHAT' as const, icon: '💬', label: 'Sohbet Et', energy: 10, money: 0, desc: 'Dostça sohbet et' },
    { type: 'HANGOUT' as const, icon: '🎉', label: 'Takıl', energy: 15, money: 0, desc: 'Birlikte vakit geçir' },
    { type: 'GIFT' as const, icon: '🎁', label: 'Hediye Ver', energy: 5, money: 50, desc: 'Özel bir hediye ver' },
    { type: 'STUDY' as const, icon: '📚', label: 'Ders Çalış', energy: 20, money: 0, desc: 'Birlikte ders çalış' },
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

    const canAfford = (energy: number, money: number) => {
        return currentEnergy >= energy && currentMoney >= money;
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <Pressable
                style={styles.overlay}
                onPress={onClose}
            >
                <Pressable style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={[styles.name, { color: theme.textPrimary }]}>{npc.name}</Text>
                            <Text style={[styles.age, { color: theme.textSecondary }]}>
                                {npc.gender === 'MALE' ? '👦' : '👧'} {npc.age} yaş • {PERSONALITY_NAMES[npc.personality]}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Feather name="x" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {/* İlişki Durumu */}
                        <View style={[styles.section, { borderColor: theme.border }]}>
                            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>İlişki Durumu</Text>

                            <View style={styles.statRow}>
                                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>İlişki</Text>
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

                            {npc.romance > 0 && (
                                <>
                                    <View style={[styles.statRow, { marginTop: 12 }]}>
                                        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>💕 Romantik</Text>
                                        <Text style={[styles.statValue, { color: '#f472b6' }]}>{npc.romance}</Text>
                                    </View>
                                    <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                                        <View
                                            style={[styles.progressFill, { width: `${npc.romance}%`, backgroundColor: '#f472b6' }]}
                                        />
                                    </View>
                                </>
                            )}
                        </View>

                        {/* Özellikler */}
                        {npc.traits && npc.traits.length > 0 && (
                            <View style={[styles.section, { borderColor: theme.border }]}>
                                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Özellikler</Text>
                                <View style={styles.traitContainer}>
                                    {npc.traits.map((trait, index) => (
                                        <View key={index} style={[styles.traitBadge, { backgroundColor: theme.accent + '20', borderColor: theme.accent + '40' }]}>
                                            <Text style={[styles.traitText, { color: theme.accent }]}>{trait}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Tanışma Bilgisi */}
                        <View style={[styles.section, { borderColor: theme.border }]}>
                            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Tanışma</Text>
                            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                                {npc.metAge} yaşında tanıştınız
                            </Text>
                        </View>

                        {/* Etkileşim Seçenekleri */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.textPrimary, marginBottom: 12 }]}>
                                Etkileşim
                            </Text>
                            {INTERACTION_OPTIONS.map((option) => {
                                const affordable = canAfford(option.energy, option.money);
                                return (
                                    <TouchableOpacity
                                        key={option.type}
                                        style={[
                                            styles.actionButton,
                                            {
                                                backgroundColor: affordable ? theme.accent + '15' : theme.border + '50',
                                                borderColor: affordable ? theme.accent : theme.border,
                                            },
                                        ]}
                                        onPress={() => {
                                            if (affordable) {
                                                onInteract(npc.id, option.type);
                                                onClose();
                                            }
                                        }}
                                        disabled={!affordable}
                                    >
                                        <View style={styles.actionLeft}>
                                            <Text style={styles.actionIcon}>{option.icon}</Text>
                                            <View>
                                                <Text style={[styles.actionLabel, { color: affordable ? theme.textPrimary : theme.textSecondary }]}>
                                                    {option.label}
                                                </Text>
                                                <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                                                    {option.desc}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.actionCost}>
                                            {option.energy > 0 && (
                                                <Text style={[styles.costText, { color: affordable ? theme.textSecondary : '#ef4444' }]}>
                                                    ⚡{option.energy}
                                                </Text>
                                            )}
                                            {option.money > 0 && (
                                                <Text style={[styles.costText, { color: affordable ? theme.textSecondary : '#ef4444' }]}>
                                                    💰₺{option.money}
                                                </Text>
                                            )}
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
    actionCost: {
        alignItems: 'flex-end',
        gap: 4,
    },
    costText: {
        fontSize: 12,
        fontWeight: '600',
    },
});
