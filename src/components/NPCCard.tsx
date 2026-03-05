import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NPC } from '../types';
import { tRuntime } from '../i18n/strings';
import { useRuntimeLocale } from '../i18n/useRuntimeLocale';

// =================================================================
// NPC KART BİLEŞENİ (OPTIMIZED)
// Tek bir NPC'yi görsel olarak gösterir
// React.memo ile gereksiz re-render'lar önlenir
// =================================================================

interface NPCCardTheme {
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accent: string;
}

interface NPCCardProps {
    npc: NPC;
    onPress?: (npc: NPC) => void;
    compact?: boolean;
    theme: NPCCardTheme;
}

// Rol emojileri
const ROLE_EMOJI: Record<string, string> = {
    ACQUAINTANCE: '👤',
    FRIEND: '🤝',
    BEST_FRIEND: '💎',
    CRUSH: '💕',
    PARTNER: '❤️',
    RIVAL: '⚔️',
    ENEMY: '😡',
};

// Rol renkleri
const ROLE_COLOR: Record<string, string> = {
    ACQUAINTANCE: '#9ca3af',
    FRIEND: '#10b981',
    BEST_FRIEND: '#3b82f6',
    CRUSH: '#f472b6',
    PARTNER: '#ef4444',
    RIVAL: '#f59e0b',
    ENEMY: '#dc2626',
};

// Rol isimleri - i18n
const getRoleName = (role: string): string =>
    tRuntime(`social.roles.${role}`, undefined, role);

// Kişilik emojileri
const PERSONALITY_EMOJI: Record<string, string> = {
    FRIENDLY: '😊',
    SHY: '😳',
    AGGRESSIVE: '😤',
    POPULAR: '⭐',
    NERDY: '🤓',
    ARTISTIC: '🎨',
    ATHLETIC: '💪',
};

// İlişki yüzdesi rengi - fonksiyon dışında tanımla (her render'da yeniden oluşturulmasın)
const getRelationshipColor = (value: number): string => {
    if (value >= 70) return '#22c55e';
    if (value >= 40) return '#3b82f6';
    if (value >= 0) return '#9ca3af';
    if (value >= -40) return '#f59e0b';
    return '#ef4444';
};

const NPCCardComponent: React.FC<NPCCardProps> = ({ npc, onPress, compact = false, theme }) => {
    useRuntimeLocale();

    const roleEmoji = ROLE_EMOJI[npc.role] || '👤';
    const roleColor = ROLE_COLOR[npc.role] || '#9ca3af';
    const roleName = getRoleName(npc.role);
    const personalityEmoji = PERSONALITY_EMOJI[npc.personality] || '😊';

    // Stable callback - her render'da yeni fonksiyon oluşturmasın
    const handlePress = useCallback(() => {
        onPress?.(npc);
    }, [npc, onPress]);

    if (compact) {
        return (
            <TouchableOpacity
                style={[styles.compactCard, { backgroundColor: theme.surface, borderColor: roleColor }]}
                onPress={handlePress}
                activeOpacity={0.7}
            >
                <Text style={styles.compactEmoji}>{roleEmoji}</Text>
                <Text style={[styles.compactName, { color: theme.textPrimary }]} numberOfLines={1}>
                    {npc.name}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.surface, borderLeftColor: roleColor }]}
            onPress={handlePress}
            activeOpacity={0.7}
        >
            {/* Üst Kısım: İsim ve Rol */}
            <View style={styles.header}>
                <View style={styles.nameContainer}>
                    <Text style={styles.mainEmoji}>{roleEmoji}</Text>
                    <View>
                        <Text style={[styles.name, { color: theme.textPrimary }]}>{npc.name}</Text>
                        <Text style={[styles.role, { color: roleColor }]}>{roleName}</Text>
                    </View>
                </View>
                <Text style={styles.personalityEmoji}>{personalityEmoji}</Text>
            </View>

            {/* İlişki Barı */}
            <View style={styles.relationContainer}>
                <View style={styles.relationHeader}>
                    <Text style={[styles.relationLabel, { color: theme.textSecondary }]}>{tRuntime('social.npcCard.relationship')}</Text>
                    <Text style={[styles.relationValue, { color: getRelationshipColor(npc.relationship) }]}>
                        {npc.relationship > 0 ? '+' : ''}{npc.relationship}
                    </Text>
                </View>
                <View style={[styles.relationBarBg, { backgroundColor: theme.border }]}>
                    <View
                        style={[
                            styles.relationBarFill,
                            {
                                width: `${Math.abs(npc.relationship)}%`,
                                backgroundColor: getRelationshipColor(npc.relationship),
                                alignSelf: npc.relationship >= 0 ? 'flex-start' : 'flex-end',
                            },
                        ]}
                    />
                </View>
            </View>

            {/* Romantik İlişki (varsa) */}
            {npc.romance > 0 && (
                <View style={styles.romanceContainer}>
                    <Text style={[styles.romanceLabel, { color: theme.textSecondary }]}>{tRuntime('social.npcCard.romantic')}</Text>
                    <View style={[styles.romanceBarBg, { backgroundColor: theme.border }]}>
                        <View
                            style={[
                                styles.romanceBarFill,
                                { width: `${npc.romance}%`, backgroundColor: '#f472b6' },
                            ]}
                        />
                    </View>
                </View>
            )}

            {/* Alt Bilgiler */}
            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                    {npc.gender === 'MALE' ? '👦' : '👧'} {tRuntime('social.npcCard.ageLabel', { age: npc.age })}
                </Text>
                {npc.traits && npc.traits.length > 0 && (
                    <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                        {npc.traits.slice(0, 2).join(', ')}
                    </Text>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    compactCard: {
        borderRadius: 8,
        padding: 10,
        marginRight: 10,
        marginBottom: 8,
        borderWidth: 2,
        alignItems: 'center',
        minWidth: 80,
    },
    compactEmoji: {
        fontSize: 24,
        marginBottom: 4,
    },
    compactName: {
        fontSize: 12,
        fontWeight: '600',
        maxWidth: 70,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    nameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    mainEmoji: {
        fontSize: 28,
    },
    name: {
        fontSize: 16,
        fontWeight: '700',
    },
    role: {
        fontSize: 12,
        fontWeight: '600',
    },
    personalityEmoji: {
        fontSize: 20,
    },
    relationContainer: {
        marginBottom: 8,
    },
    relationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    relationLabel: {
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    relationValue: {
        fontSize: 12,
        fontWeight: '700',
    },
    relationBarBg: {
        height: 6,
        borderRadius: 3,
        overflow: 'hidden',
    },
    relationBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    romanceContainer: {
        marginBottom: 8,
    },
    romanceLabel: {
        fontSize: 11,
        marginBottom: 4,
    },
    romanceBarBg: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
    },
    romanceBarFill: {
        height: '100%',
        borderRadius: 2,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    footerText: {
        fontSize: 11,
    },
});

// Custom comparator - sadece önemli değişikliklerde re-render
const arePropsEqual = (prev: NPCCardProps, next: NPCCardProps): boolean => {
    // Theme referans karşılaştırması
    if (prev.theme !== next.theme) return false;

    // Compact mode değişti mi?
    if (prev.compact !== next.compact) return false;

    // NPC'nin görsel olarak değişen alanları
    if (prev.npc.id !== next.npc.id) return false;
    if (prev.npc.name !== next.npc.name) return false;
    if (prev.npc.role !== next.npc.role) return false;
    if (prev.npc.relationship !== next.npc.relationship) return false;
    if (prev.npc.romance !== next.npc.romance) return false;
    if (prev.npc.personality !== next.npc.personality) return false;
    if (prev.npc.age !== next.npc.age) return false;
    if (prev.npc.gender !== next.npc.gender) return false;
    // Traits array comparison (shallow)
    if (prev.npc.traits.length !== next.npc.traits.length) return false;
    for (let i = 0; i < prev.npc.traits.length; i++) {
        if (prev.npc.traits[i] !== next.npc.traits[i]) return false;
    }

    return true;
};

// React.memo ile sarılmış export
export const NPCCard = React.memo(NPCCardComponent, arePropsEqual);
