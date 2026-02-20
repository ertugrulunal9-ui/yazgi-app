import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAchievement } from '../systems/achievementDefinitions';

interface AchievementToastProps {
  achievementIds: string[];
  onClose: () => void;
  duration?: number;
}

const rarityColors = {
  COMMON: '#94a3b8',
  RARE: '#22d3ee',
  EPIC: '#a855f7',
  LEGENDARY: '#f59e0b',
} as const;

export const AchievementToast: React.FC<AchievementToastProps> = ({
  achievementIds,
  onClose,
  duration = 3500,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [achievementIds]);

  const achievement = useMemo(() => {
    if (achievementIds.length === 0) return null;
    return getAchievement(achievementIds[currentIndex]);
  }, [achievementIds, currentIndex]);

  useEffect(() => {
    if (achievementIds.length === 0) {
      onClose();
      return;
    }

    const timeout = setTimeout(() => {
      if (currentIndex < achievementIds.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onClose();
      }
    }, duration);

    return () => clearTimeout(timeout);
  }, [achievementIds, currentIndex, duration, onClose]);

  if (!achievement) return null;

  const rarityColor = rarityColors[achievement.rarity] ?? '#94a3b8';

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.card, { borderColor: rarityColor }]}
        activeOpacity={0.95}
        onPress={() => {
          if (currentIndex < achievementIds.length - 1) {
            setCurrentIndex(prev => prev + 1);
          } else {
            onClose();
          }
        }}
      >
        <View style={styles.headerRow}>
          <Text style={styles.iconText}>{achievement.icon}</Text>
          <View style={styles.titleWrap}>
            <Text style={styles.titleText}>{achievement.name}</Text>
            <Text style={[styles.rarityText, { color: rarityColor }]}>
              {achievement.rarity.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.descriptionText}>{achievement.description}</Text>

        {achievement.reward && (
          <View style={styles.rewardRow}>
            {achievement.reward.money ? (
              <Text style={styles.rewardText}>+{achievement.reward.money} money</Text>
            ) : null}
            {achievement.reward.stats ? (
              <Text style={styles.rewardText}>+stat bonus</Text>
            ) : null}
            {achievement.reward.item ? (
              <Text style={styles.rewardText}>{achievement.reward.item}</Text>
            ) : null}
          </View>
        )}

        {achievementIds.length > 1 ? (
          <Text style={styles.progressText}>
            {currentIndex + 1}/{achievementIds.length}
          </Text>
        ) : null}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 24,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 520,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#111827',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconText: {
    fontSize: 20,
    marginRight: 10,
  },
  titleWrap: {
    flex: 1,
  },
  titleText: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  rarityText: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  descriptionText: {
    color: '#cbd5e1',
    fontSize: 13,
  },
  rewardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  rewardText: {
    color: '#86efac',
    fontSize: 12,
    fontWeight: '600',
  },
  progressText: {
    marginTop: 8,
    color: '#94a3b8',
    fontSize: 11,
    textAlign: 'right',
    fontWeight: '600',
  },
});

export default AchievementToast;
