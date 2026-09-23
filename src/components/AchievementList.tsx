import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet, Platform, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ACHIEVEMENTS, getAchievementDescription, getAchievementName } from '../systems/achievementDefinitions';
import { AchievementCard } from './AchievementCard';
import { AchievementRarity, AchievementCategory } from '../types';
import { tRuntime } from '../i18n/strings';

interface AchievementListProps {
  visible?: boolean;
  unlockedAchievementIds: string[];
  getProgress: (achievementId: string) => number;
  onClose: () => void;
  theme: {
    appBg: string;
    surfaceBase: string;
    surfaceRaised: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    accentEvent: string;
  };
}

type FilterType = 'ALL' | 'UNLOCKED' | 'LOCKED' | AchievementRarity | AchievementCategory;

const FILTER_KEYS: { key: string; value: FilterType }[] = [
  { key: 'achievements.filterAll', value: 'ALL' },
  { key: 'achievements.filterUnlocked', value: 'UNLOCKED' },
  { key: 'achievements.filterLocked', value: 'LOCKED' },
  { key: 'achievements.rarityCommon', value: 'COMMON' },
  { key: 'achievements.rarityRare', value: 'RARE' },
  { key: 'achievements.rarityEpic', value: 'EPIC' },
  { key: 'achievements.rarityLegendary', value: 'LEGENDARY' },
];

const RARITY_COUNTS = {
  COMMON: ACHIEVEMENTS.filter(a => a.rarity === 'COMMON').length,
  RARE: ACHIEVEMENTS.filter(a => a.rarity === 'RARE').length,
  EPIC: ACHIEVEMENTS.filter(a => a.rarity === 'EPIC').length,
  LEGENDARY: ACHIEVEMENTS.filter(a => a.rarity === 'LEGENDARY').length,
};

export const AchievementList: React.FC<AchievementListProps> = ({
  visible = true,
  unlockedAchievementIds,
  getProgress,
  onClose,
  theme,
}) => {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  const safeGetProgress = useCallback((achievementId: string) => {
    try {
      return getProgress(achievementId);
    } catch (error) {
      console.error('Achievement progress failed:', achievementId, error);
      return 0;
    }
  }, [getProgress]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = ACHIEVEMENTS.length;
    const unlocked = unlockedAchievementIds.length;
    const percentage = Math.round((unlocked / total) * 100);
    return { total, unlocked, percentage };
  }, [unlockedAchievementIds]);

  // Filtered achievements
  const filteredAchievements = useMemo(() => {
    return ACHIEVEMENTS.filter(achievement => {
      const isUnlocked = unlockedAchievementIds.includes(achievement.id);
      const localizedName = getAchievementName(achievement.id, achievement.name);
      const localizedDescription = getAchievementDescription(achievement.id, achievement.description);

      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchName = localizedName.toLowerCase().includes(query);
        const matchDesc = localizedDescription.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }

      // Filter
      if (filter === 'ALL') return true;
      if (filter === 'UNLOCKED') return isUnlocked;
      if (filter === 'LOCKED') return !isUnlocked;
      if (['COMMON', 'RARE', 'EPIC', 'LEGENDARY'].includes(filter)) {
        return achievement.rarity === filter;
      }
      if (['STATS', 'MONEY', 'EVENTS', 'SKILLS', 'SCHOOL', 'SECRET', 'SOCIAL', 'SURVIVAL'].includes(filter)) {
        return achievement.category === filter;
      }

      return true;
    });
  }, [filter, searchQuery, unlockedAchievementIds]);

  if (!visible) return null;

  return (
      <View style={[
        styles.overlay,
        {
          paddingTop: statusBarHeight + insets.top,
          paddingBottom: insets.bottom,
        }
      ]}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.container, { backgroundColor: theme.surfaceBase, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={styles.trophyIcon}>🏆</Text>
                <View>
                  <Text style={[styles.title, { color: theme.textPrimary }]}>{tRuntime('achievements.title')}</Text>
                  <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                    {tRuntime('achievements.subtitle', { unlocked: stats.unlocked, total: stats.total, percentage: stats.percentage })}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeButton, { backgroundColor: theme.surfaceRaised }]}
                accessibilityLabel={tRuntime('achievements.closeAria')}
                accessibilityRole="button"
              >
                <Feather name="x" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${stats.percentage}%` }]} />
            </View>
          </View>

          {/* Filters */}
          <View style={[styles.filtersSection, { borderBottomColor: theme.border }]}>
            {/* Search */}
            <TextInput
              style={[styles.searchInput, {
                backgroundColor: theme.surfaceRaised,
                color: theme.textPrimary,
                borderColor: theme.border
              }]}
              placeholder={tRuntime('achievements.searchPlaceholder')}
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              accessibilityLabel={tRuntime('achievements.searchAria')}
            />

            {/* Filter Buttons */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              <View style={styles.filterButtons}>
                {FILTER_KEYS.map(({ key, value }) => {
                  const label = tRuntime(key);
                  return (
                    <TouchableOpacity
                      key={value}
                      onPress={() => setFilter(value)}
                      style={[
                        styles.filterButton,
                        filter === value
                          ? styles.filterButtonActive
                          : { backgroundColor: theme.surfaceRaised }
                      ]}
                      accessibilityLabel={tRuntime('achievements.filterAria', { label })}
                      accessibilityRole="button"
                      accessibilityState={{ selected: filter === value }}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        { color: filter === value ? '#fff' : theme.textSecondary }
                      ]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Achievement List */}
          <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
            {filteredAchievements.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="lock" size={48} color={theme.textSecondary} style={{ opacity: 0.5 }} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {tRuntime('achievements.emptyState')}
                </Text>
              </View>
            ) : (
              filteredAchievements.map(achievement => (
                <View key={achievement.id} style={styles.cardWrapper}>
                  <AchievementCard
                    achievement={achievement}
                    isUnlocked={unlockedAchievementIds.includes(achievement.id)}
                    progress={safeGetProgress(achievement.id)}
                    theme={theme}
                  />
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer Stats */}
          <View style={[styles.footer, { backgroundColor: theme.surfaceRaised, borderTopColor: theme.border }]}>
            <View style={styles.footerStats}>
              <View style={styles.footerStat}>
                <Text style={[styles.footerStatNumber, { color: '#9ca3af' }]}>{RARITY_COUNTS.COMMON}</Text>
                <Text style={[styles.footerStatLabel, { color: theme.textSecondary }]}>{tRuntime('achievements.rarityCommon')}</Text>
              </View>
              <View style={styles.footerStat}>
                <Text style={[styles.footerStatNumber, { color: '#60a5fa' }]}>{RARITY_COUNTS.RARE}</Text>
                <Text style={[styles.footerStatLabel, { color: theme.textSecondary }]}>{tRuntime('achievements.rarityRare')}</Text>
              </View>
              <View style={styles.footerStat}>
                <Text style={[styles.footerStatNumber, { color: '#c084fc' }]}>{RARITY_COUNTS.EPIC}</Text>
                <Text style={[styles.footerStatLabel, { color: theme.textSecondary }]}>{tRuntime('achievements.rarityEpic')}</Text>
              </View>
              <View style={styles.footerStat}>
                <Text style={[styles.footerStatNumber, { color: '#facc15' }]}>{RARITY_COUNTS.LEGENDARY}</Text>
                <Text style={[styles.footerStatLabel, { color: theme.textSecondary }]}>{tRuntime('achievements.rarityLegendary')}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 16,
    zIndex: 10000,
    elevation: 10000,
  },
  container: {
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
    maxWidth: 420,
    height: '90%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    backgroundColor: 'rgba(88, 28, 135, 0.3)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(107, 114, 128, 0.3)',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  trophyIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    padding: 12,
    borderRadius: 12,
    minWidth: 48,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 10,
    backgroundColor: '#1f2937',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 5,
  },
  filtersSection: {
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
  },
  filterScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  footerStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footerStat: {
    alignItems: 'center',
  },
  footerStatNumber: {
    fontSize: 22,
    fontWeight: '700',
  },
  footerStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});
