import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stats } from '../types';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface StatusHeaderProps {
  playerName: string;
  age: number;
  innerThought?: string;
  stats: Stats;
  maxEnergy: number;
  theme: any;
}

interface StatMeterProps {
  icon: IconName;
  barColor: string;
  percent: number;
  theme: any;
}

const getPlayerIcon = (age: number): IconName => {
  if (age < 3) return 'baby-face-outline';
  if (age < 7) return 'human-child';
  if (age < 13) return 'account-child-outline';
  return 'account-circle-outline';
};

const StatMeter: React.FC<StatMeterProps> = ({ icon, barColor, percent, theme }) => (
  <View style={styles.statusItem}>
    <MaterialCommunityIcons name={icon} size={19} color={theme.textSecondary} />
    <View style={[styles.miniBar, { backgroundColor: theme.border }]}>
      <View
        style={[
          styles.miniFill,
          {
            backgroundColor: barColor,
            width: `${Math.min(100, Math.max(0, percent))}%`,
          },
        ]}
      />
    </View>
  </View>
);

export const StatusHeader: React.FC<StatusHeaderProps> = ({
  playerName,
  age,
  innerThought,
  stats,
  maxEnergy,
  theme,
}) => {
  const safeMaxEnergy = Math.max(1, maxEnergy);
  const energyPercentage = (stats.energy / safeMaxEnergy) * 100;
  const avatarIcon = getPlayerIcon(age);

  return (
    <View style={[styles.container, { backgroundColor: theme.surfaceBase }]}>
      <View style={styles.heroSection}>
        <View style={[styles.avatarContainer, { backgroundColor: `${theme.accentEvent}20` }]}>
          <MaterialCommunityIcons name={avatarIcon} size={36} color={theme.textPrimary} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.playerName, { color: theme.textPrimary }]}>
            {playerName || 'Oyuncu'}
          </Text>
          <Text style={[styles.age, { color: theme.textSecondary }]}>
            {age} yaşında
          </Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <StatMeter
          icon="heart-pulse"
          barColor="#ef4444"
          percent={(stats.health / 100) * 100}
          theme={theme}
        />

        <View style={styles.statusItem}>
          <MaterialCommunityIcons name="flash" size={19} color={theme.textSecondary} />
          <View style={[styles.miniBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.miniFill,
                {
                  backgroundColor: '#eab308',
                  width: `${Math.min(100, Math.max(0, energyPercentage))}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.energyText, { color: theme.textSecondary }]}>
            {Math.round(stats.energy)}/{safeMaxEnergy}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <MaterialCommunityIcons name="sack" size={19} color={theme.textSecondary} />
          <Text style={[styles.moneyText, { color: theme.textPrimary }]}>₺{stats.money}</Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <StatMeter
          icon="brain"
          barColor="#3b82f6"
          percent={(stats.intelligence / 100) * 100}
          theme={theme}
        />
        <StatMeter
          icon="star-four-points-outline"
          barColor="#a855f7"
          percent={(stats.charisma / 100) * 100}
          theme={theme}
        />
        <StatMeter
          icon="book-education-outline"
          barColor="#14b8a6"
          percent={(stats.discipline / 100) * 100}
          theme={theme}
        />
      </View>

      {innerThought && (
        <View style={[styles.thoughtBubble, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
          <View style={styles.thoughtRow}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={16} color={theme.textSecondary} />
            <Text style={[styles.thoughtText, { color: theme.textSecondary }]}>{innerThought}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniBar: {
    width: 50,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 3,
  },
  moneyText: {
    fontSize: 13,
    fontWeight: '700',
  },
  energyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  age: {
    fontSize: 14,
    fontWeight: '500',
  },
  thoughtBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  thoughtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  thoughtText: {
    fontSize: 13,
    flex: 1,
  },
});
