import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Achievement } from '../types';
import { tRuntime } from '../i18n/strings';
import { getAchievementDescription, getAchievementName } from '../systems/achievementDefinitions';

interface AchievementCardProps {
  achievement: Achievement;
  isUnlocked: boolean;
  progress: number;
  onPress?: () => void;
  theme: {
    surfaceBase: string;
    surfaceRaised: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
  };
}

const RARITY_COLORS = {
  COMMON: { border: 'rgba(107, 114, 128, 0.3)', bg: 'rgba(31, 41, 55, 0.3)', text: '#9ca3af' },
  RARE: { border: 'rgba(59, 130, 246, 0.3)', bg: 'rgba(30, 58, 138, 0.2)', text: '#60a5fa' },
  EPIC: { border: 'rgba(168, 85, 247, 0.3)', bg: 'rgba(88, 28, 135, 0.2)', text: '#c084fc' },
  LEGENDARY: { border: 'rgba(234, 179, 8, 0.3)', bg: 'rgba(113, 63, 18, 0.2)', text: '#facc15' },
};

const getRarityLabel = (rarity: string) => {
  const key = `achievements.rarity${rarity.charAt(0) + rarity.slice(1).toLowerCase()}`;
  return tRuntime(key);
};

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  isUnlocked,
  progress,
  onPress,
  theme,
}) => {
  const rarityStyle = RARITY_COLORS[achievement.rarity];
  const displayName = achievement.isSecret && !isUnlocked
    ? '???'
    : getAchievementName(achievement.id, achievement.name);
  const displayDescription = achievement.isSecret && !isUnlocked
    ? '???'
    : getAchievementDescription(achievement.id, achievement.description);

  const cardStyle = useMemo(() => ({
    backgroundColor: rarityStyle.bg,
    borderColor: rarityStyle.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    opacity: isUnlocked ? 1 : 0.6,
  }), [rarityStyle, isUnlocked]);

  const showProgress = !isUnlocked && progress > 0 && progress < 100;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={cardStyle}
      activeOpacity={0.8}
      accessibilityLabel={tRuntime('achievements.achievementAria', { name: displayName, status: isUnlocked ? tRuntime('achievements.ariaUnlocked') : tRuntime('achievements.ariaLocked') })}
      accessibilityRole="button"
    >
      <View style={styles.row}>
        {/* Icon */}
        <View style={[styles.iconContainer, !isUnlocked && styles.iconLocked]}>
          <Text style={styles.iconText}>
            {isUnlocked ? achievement.icon : '🔒'}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: isUnlocked ? theme.textPrimary : theme.textSecondary }]}>
              {displayName}
            </Text>
            <Text style={[styles.rarity, { color: rarityStyle.text }]}>
              {getRarityLabel(achievement.rarity)}
            </Text>
          </View>

          <Text style={[styles.description, { color: isUnlocked ? theme.textSecondary : '#6b7280' }]}>
            {displayDescription}
          </Text>

          {/* Progress Bar */}
          {showProgress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>{tRuntime('achievements.progress')}</Text>
                <Text style={styles.progressLabel}>{Math.round(progress)}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>
          )}

          {/* Reward */}
          {achievement.reward && isUnlocked && (
            <View style={styles.rewardRow}>
              {achievement.reward.money && (
                <View style={[styles.rewardBadge, { backgroundColor: 'rgba(22, 101, 52, 0.3)' }]}>
                  <Text style={[styles.rewardText, { color: '#4ade80' }]}>
                    💰 +{achievement.reward.money}₺
                  </Text>
                </View>
              )}
              {achievement.reward.stats && (
                <View style={[styles.rewardBadge, { backgroundColor: 'rgba(30, 58, 138, 0.3)' }]}>
                  <Text style={[styles.rewardText, { color: '#60a5fa' }]}>
                    {tRuntime('achievements.statBoost')}
                  </Text>
                </View>
              )}
              {achievement.reward.item && (
                <View style={[styles.rewardBadge, { backgroundColor: 'rgba(88, 28, 135, 0.3)' }]}>
                  <Text style={[styles.rewardText, { color: '#c084fc' }]}>
                    {tRuntime('achievements.item')}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Locked State */}
          {!isUnlocked && progress === 0 && (
            <View style={styles.statusRow}>
              <Feather name="lock" size={12} color="#6b7280" />
              <Text style={styles.statusLocked}>{tRuntime('achievements.locked')}</Text>
            </View>
          )}

          {/* Unlocked State */}
          {isUnlocked && (
            <View style={styles.statusRow}>
              <Feather name="trending-up" size={12} color="#4ade80" />
              <Text style={styles.statusUnlocked}>{tRuntime('achievements.unlocked')}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLocked: {
    opacity: 0.5,
  },
  iconText: {
    fontSize: 32,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  rarity: {
    fontSize: 11,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 3,
  },
  rewardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  rewardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statusLocked: {
    fontSize: 11,
    color: '#6b7280',
  },
  statusUnlocked: {
    fontSize: 11,
    color: '#4ade80',
  },
});
