import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { NPC } from '../types';
import { NPCCard } from './NPCCard';
import { tRuntime } from '../i18n/strings';
import { useRuntimeLocale } from '../i18n/useRuntimeLocale';

// =================================================================
// NPC LİSTESİ BİLEŞENİ (OPTIMIZED)
// FlashList ile virtualized rendering
// =================================================================

interface NPCListTheme {
    surface: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accent: string;
    background: string;
}

interface NPCListProps {
    npcs: NPC[];
    onNPCPress?: (npc: NPC) => void;
    theme: NPCListTheme;
}

// Grup meta verileri (emoji + renk sabit, title i18n'den gelir)
const GROUP_META: Record<string, { emoji: string; color: string }> = {
    partners: { emoji: '❤️', color: '#ef4444' },
    bestFriends: { emoji: '💎', color: '#3b82f6' },
    crushes: { emoji: '💕', color: '#f472b6' },
    friends: { emoji: '🤝', color: '#10b981' },
    acquaintances: { emoji: '👤', color: '#9ca3af' },
    rivals: { emoji: '⚔️', color: '#f59e0b' },
};

const getGroupTitle = (key: string): string =>
    tRuntime(`social.npcList.groups.${key}`, undefined, key);

// FlashList için item tipleri
type ListItem =
    | { type: 'summary'; friendCount: number; loveCount: number; rivalCount: number; totalCount: number }
    | { type: 'header'; key: string; title: string; emoji: string; color: string; count: number }
    | { type: 'npc'; npc: NPC };

// Grup sıralaması
const GROUP_ORDER = ['partners', 'bestFriends', 'crushes', 'friends', 'acquaintances', 'rivals'] as const;

const NPCListComponent: React.FC<NPCListProps> = ({ npcs, onNPCPress, theme }) => {
    useRuntimeLocale();

    // NPC'leri grupla ve FlashList için düz listeye çevir
    const listData = useMemo<ListItem[]>(() => {
        if (npcs.length === 0) return [];

        // Grupla
        const groups: Record<string, NPC[]> = {
            partners: [],
            bestFriends: [],
            crushes: [],
            friends: [],
            acquaintances: [],
            rivals: [],
        };

        npcs.forEach(npc => {
            switch (npc.role) {
                case 'PARTNER': groups.partners.push(npc); break;
                case 'BEST_FRIEND': groups.bestFriends.push(npc); break;
                case 'CRUSH': groups.crushes.push(npc); break;
                case 'FRIEND': groups.friends.push(npc); break;
                case 'RIVAL':
                case 'ENEMY': groups.rivals.push(npc); break;
                default: groups.acquaintances.push(npc);
            }
        });

        // Özet item
        const data: ListItem[] = [{
            type: 'summary',
            totalCount: npcs.length,
            friendCount: groups.friends.length + groups.bestFriends.length,
            loveCount: groups.crushes.length + groups.partners.length,
            rivalCount: groups.rivals.length,
        }];

        // Grupları sırayla ekle
        GROUP_ORDER.forEach(groupKey => {
            const groupNpcs = groups[groupKey];
            if (groupNpcs.length > 0) {
                const meta = GROUP_META[groupKey];
                data.push({
                    type: 'header',
                    key: groupKey,
                    title: getGroupTitle(groupKey),
                    emoji: meta.emoji,
                    color: meta.color,
                    count: groupNpcs.length,
                });
                groupNpcs.forEach(npc => data.push({ type: 'npc', npc }));
            }
        });

        return data;
    }, [npcs]);

    // renderItem - useCallback ile stable referans
    const renderItem: ListRenderItem<ListItem> = useCallback(({ item }) => {
        if (item.type === 'summary') {
            return (
                <View style={[styles.summaryCard, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.summaryTitle, { color: theme.textPrimary }]}>
                        {tRuntime('social.npcList.socialCircle')}
                    </Text>
                    <View style={styles.summaryStats}>
                        <View style={styles.summaryStat}>
                            <Text style={styles.summaryNumber}>{item.totalCount}</Text>
                            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{tRuntime('social.npcList.total')}</Text>
                        </View>
                        <View style={styles.summaryStat}>
                            <Text style={[styles.summaryNumber, { color: '#10b981' }]}>{item.friendCount}</Text>
                            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{tRuntime('social.npcList.friends')}</Text>
                        </View>
                        <View style={styles.summaryStat}>
                            <Text style={[styles.summaryNumber, { color: '#f472b6' }]}>{item.loveCount}</Text>
                            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{tRuntime('social.npcList.love')}</Text>
                        </View>
                        <View style={styles.summaryStat}>
                            <Text style={[styles.summaryNumber, { color: '#f59e0b' }]}>{item.rivalCount}</Text>
                            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{tRuntime('social.npcList.rival')}</Text>
                        </View>
                    </View>
                </View>
            );
        }

        if (item.type === 'header') {
            return (
                <View style={styles.groupHeader}>
                    <Text style={styles.groupEmoji}>{item.emoji}</Text>
                    <Text style={[styles.groupTitle, { color: item.color }]}>{item.title}</Text>
                    <Text style={[styles.groupCount, { color: theme.textSecondary }]}>({item.count})</Text>
                </View>
            );
        }

        // type === 'npc'
        return <NPCCard npc={item.npc} onPress={onNPCPress} theme={theme} />;
    }, [theme, onNPCPress]);

    // keyExtractor - stable referans
    const keyExtractor = useCallback((item: ListItem): string => {
        if (item.type === 'summary') return 'summary';
        if (item.type === 'header') return `header-${item.key}`;
        return item.npc.id;
    }, []);

    // getItemType - FlashList optimizasyonu için
    const getItemType = useCallback((item: ListItem): string => item.type, []);

    // Empty state
    if (npcs.length === 0) {
        return (
            <View style={[styles.emptyContainer, { backgroundColor: theme.surface }]}>
                <Text style={styles.emptyEmoji}>👥</Text>
                <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
                    {tRuntime('social.npcList.emptyTitle')}
                </Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    {tRuntime('social.npcList.emptySubtitle')}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlashList
                data={listData}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                getItemType={getItemType}
                // Performans optimizasyonları
                drawDistance={200}
            />
        </View>
    );
};

// React.memo ile sarılmış export
export const NPCList = React.memo(NPCListComponent);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 200,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        borderRadius: 16,
        marginVertical: 20,
    },
    emptyEmoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
    },
    summaryCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    summaryStat: {
        alignItems: 'center',
    },
    summaryNumber: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    summaryLabel: {
        fontSize: 11,
        marginTop: 2,
    },
    groupHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 4,
        marginTop: 12,
        gap: 6,
    },
    groupEmoji: {
        fontSize: 18,
    },
    groupTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    groupCount: {
        fontSize: 12,
    },
});
