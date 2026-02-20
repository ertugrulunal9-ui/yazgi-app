import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { InnerThoughtType, LifeGoal, Stats } from '../types';
import { getLifeGoalMeta } from '../utils/lifeGoalSystem';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface StatusHeaderProps {
  playerName: string;
  age: number;
  innerThought?: string;
  innerThoughtType?: InnerThoughtType;
  stats: Stats;
  maxEnergy: number;
  selectedGoal?: LifeGoal | null;
  dreamProgress?: number;
  riskPercent?: number;
  theme: any;
}

interface StatMeterProps {
  icon: IconName;
  barColor: string;
  percent: number;
  theme: any;
}

interface TrackerProps {
  selectedGoal?: LifeGoal | null;
  dreamProgress: number;
  riskPercent: number;
  theme: any;
  isLightTheme: boolean;
}

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const isLightHex = (hex: string): boolean => {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) return false;

  const raw = match[1];
  const r = parseInt(raw.slice(0, 2), 16);
  const g = parseInt(raw.slice(2, 4), 16);
  const b = parseInt(raw.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance >= 0.6;
};

const getPlayerIcon = (age: number): IconName => {
  if (age < 3) return 'baby-face-outline';
  if (age < 7) return 'human-child';
  if (age < 13) return 'account-child-outline';
  return 'account-circle-outline';
};

const StatMeter: React.FC<StatMeterProps> = ({ icon, barColor, percent, theme }) => (
  <View style={styles.statusItem}>
    <MaterialCommunityIcons name={icon} size={18} color={theme.textSecondary} />
    <View style={[styles.miniBar, { backgroundColor: theme.border }]}>
      <View
        style={[
          styles.miniFill,
          {
            backgroundColor: barColor,
            width: `${clamp(percent, 0, 100)}%`,
          },
        ]}
      />
    </View>
  </View>
);

const GoalAndRiskTracker: React.FC<TrackerProps> = ({
  selectedGoal,
  dreamProgress,
  riskPercent,
  theme,
  isLightTheme,
}) => {
  const goalMeta = useMemo(() => getLifeGoalMeta(selectedGoal), [selectedGoal]);
  const safeDreamProgress = clamp(dreamProgress, 0, 100);
  const safeRisk = clamp(riskPercent, 0, 100);
  const shakeX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (safeRisk <= 50) {
      shakeX.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeX, { toValue: -3, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 3, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]),
      { iterations: -1 }
    );

    animation.start();

    return () => {
      animation.stop();
      shakeX.setValue(0);
    };
  }, [safeRisk, shakeX]);

  const trackerBackground = isLightTheme ? theme.surfaceRaised : theme.surfaceOverlay;

  return (
    <View style={styles.goalSection}>
      <View style={[styles.trackerCard, { borderColor: theme.border, backgroundColor: trackerBackground }]}>
        <View style={styles.trackerHeader}>
          <View style={styles.trackerLabelWrap}>
            <MaterialCommunityIcons name="target" size={15} color={goalMeta?.accentColor || theme.textSecondary} />
            <Text style={[styles.trackerLabel, { color: theme.textSecondary }]}>Dream Tracker</Text>
          </View>
          <Text style={[styles.trackerValue, { color: theme.textPrimary }]}>%{Math.round(safeDreamProgress)}</Text>
        </View>
        <Text style={[styles.goalName, { color: theme.textPrimary }]}>
          {goalMeta?.label || 'Hedef secimi 10 yasinda acilir.'}
        </Text>
        <Text style={[styles.goalHint, { color: theme.textSecondary }]}>
          {goalMeta?.statHint || 'Hedef secince izlenecek statlar burada gorunur.'}
        </Text>
        <View style={[styles.trackerBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.trackerFill,
              {
                width: `${safeDreamProgress}%`,
                backgroundColor: goalMeta?.accentColor || theme.accentEvent,
              },
            ]}
          />
        </View>
      </View>

      <View style={[styles.trackerCard, { borderColor: theme.border, backgroundColor: trackerBackground }]}>
        <View style={styles.trackerHeader}>
          <View style={styles.trackerLabelWrap}>
            <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
              <MaterialCommunityIcons
                name={safeRisk >= 50 ? 'alert-octagon' : 'alert-circle-outline'}
                size={15}
                color={safeRisk >= 50 ? '#ef4444' : theme.textSecondary}
              />
            </Animated.View>
            <Text style={[styles.trackerLabel, { color: theme.textSecondary }]}>Risk Alarmi</Text>
          </View>
          <Text style={[styles.trackerValue, { color: safeRisk >= 50 ? '#ef4444' : theme.textPrimary }]}>
            %{Math.round(safeRisk)}
          </Text>
        </View>
        <Text style={[styles.goalName, { color: theme.textPrimary }]}>
          {safeRisk >= 50 ? 'Risk alarmi acik' : 'Risk seviyesi kontrol altinda'}
        </Text>
        <Text style={[styles.goalHint, { color: theme.textSecondary }]}>
          Risk arttikca finalde basari sansin azalir.
        </Text>
        <View style={[styles.trackerBar, { backgroundColor: theme.border }]}>
          <View
            style={[
              styles.trackerFill,
              {
                width: `${safeRisk}%`,
                backgroundColor: safeRisk >= 50 ? '#ef4444' : '#fb7185',
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
};

const THOUGHT_STYLES: Record<InnerThoughtType, {
  icon: IconName;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
}> = {
  CRISIS: {
    icon: 'alert-circle-outline',
    iconColor: '#f97316',
    borderColor: '#ea580c',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
  },
  MISMATCH: {
    icon: 'compass-off-outline' as IconName,
    iconColor: '#f59e0b',
    borderColor: '#d97706',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  TRAIT: {
    icon: 'star-shooting-outline' as IconName,
    iconColor: '#3b82f6',
    borderColor: '#2563eb',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  MOMENTUM: {
    icon: 'fire',
    iconColor: '#f59e0b',
    borderColor: '#d97706',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  CLIFFHANGER: {
    icon: 'help-circle-outline' as IconName,
    iconColor: '#a855f7',
    borderColor: '#9333ea',
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  IDLE: {
    icon: 'lightbulb-on-outline',
    iconColor: '',
    borderColor: '',
    backgroundColor: '',
  },
};

export const StatusHeader: React.FC<StatusHeaderProps> = ({
  playerName,
  age,
  innerThought,
  innerThoughtType,
  stats,
  maxEnergy,
  selectedGoal,
  dreamProgress = 0,
  riskPercent = 0,
  theme,
}) => {
  const safeMaxEnergy = Math.max(1, maxEnergy);
  const energyPercentage = (stats.energy / safeMaxEnergy) * 100;
  const avatarIcon = getPlayerIcon(age);
  const safeRiskPercent = clamp(riskPercent, 0, 100);
  const notificationCount = innerThought ? 3 : 2;

  const isLightTheme = useMemo(() => isLightHex(theme.appBg), [theme.appBg]);
  const accentBg = isLightTheme ? `${theme.accentBrand}1F` : `${theme.accentBrand}26`;
  const thoughtStyle = THOUGHT_STYLES[innerThoughtType ?? 'IDLE'];
  const isThoughtHighlight = innerThoughtType != null && innerThoughtType !== 'IDLE';

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const panelProgress = useRef(new Animated.Value(0)).current;
  const panelMaxHeight = innerThought ? 320 : 250;

  useEffect(() => {
    Animated.timing(panelProgress, {
      toValue: notificationsOpen ? 1 : 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [notificationsOpen, panelProgress]);

  const panelAnimatedStyle = useMemo(() => ({
    maxHeight: panelProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, panelMaxHeight],
    }),
    opacity: panelProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [{
      translateY: panelProgress.interpolate({
        inputRange: [0, 1],
        outputRange: [-8, 0],
      }),
    }],
  }), [panelMaxHeight, panelProgress]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isLightTheme ? theme.surfaceRaised : theme.surfaceBase,
          borderBottomColor: theme.border,
        },
      ]}
    >
      <View style={styles.heroSection}>
        <View style={[styles.avatarContainer, { backgroundColor: accentBg, borderColor: theme.border }]}>
          <MaterialCommunityIcons name={avatarIcon} size={34} color={theme.textPrimary} />
        </View>

        <View style={styles.infoContainer}>
          <Text style={[styles.playerName, { color: theme.textPrimary, fontFamily: theme.fontHeading ?? undefined }]}>
            {playerName || 'Oyuncu'}
          </Text>
          <Text style={[styles.age, { color: theme.accentBrand ?? theme.textSecondary }]}>
            {age} yasinda
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
          <MaterialCommunityIcons name="flash" size={18} color={theme.textSecondary} />
          <View style={[styles.miniBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.miniFill,
                {
                  backgroundColor: '#eab308',
                  width: `${clamp(energyPercentage, 0, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.energyText, { color: theme.textSecondary }]}>
            {Math.round(stats.energy)}/{safeMaxEnergy}
          </Text>
        </View>

        <View style={styles.statusItem}>
          <MaterialCommunityIcons name="sack" size={18} color={theme.textSecondary} />
          <Text style={[styles.moneyText, { color: theme.textPrimary }]}>TL {stats.money}</Text>
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

      <View style={styles.notificationToggleRow}>
        <TouchableOpacity
          onPress={() => setNotificationsOpen(prev => !prev)}
          style={[
            styles.notificationToggle,
            {
              backgroundColor: isLightTheme ? theme.surfaceRaised : theme.surfaceOverlay,
              borderColor: theme.border,
            },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Bildirim panelini ac veya kapat"
        >
          <MaterialCommunityIcons
            name={notificationsOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={theme.textSecondary}
          />
          <MaterialCommunityIcons name="bell-outline" size={16} color={theme.textSecondary} />
          <Text style={[styles.notificationToggleText, { color: theme.textPrimary }]}>
            Bildirimler
          </Text>
          <View style={[styles.notificationCountBadge, { backgroundColor: theme.accentEvent }]}>
            <Text style={styles.notificationCountText}>{notificationCount}</Text>
          </View>
        </TouchableOpacity>

        {safeRiskPercent >= 50 ? (
          <View style={styles.riskBadge}>
            <MaterialCommunityIcons name="alert" size={14} color="#ef4444" />
            <Text style={styles.riskBadgeText}>%{Math.round(safeRiskPercent)} risk</Text>
          </View>
        ) : null}
      </View>

      <Animated.View
        style={[styles.notificationPanel, panelAnimatedStyle]}
        pointerEvents={notificationsOpen ? 'auto' : 'none'}
      >
        <View style={styles.notificationPanelContent}>
          <GoalAndRiskTracker
            selectedGoal={selectedGoal}
            dreamProgress={dreamProgress}
            riskPercent={riskPercent}
            theme={theme}
            isLightTheme={isLightTheme}
          />

          {innerThought ? (
            <View style={[
              styles.thoughtBubble,
              {
                backgroundColor: isThoughtHighlight ? thoughtStyle.backgroundColor : theme.surfaceRaised,
                borderColor: isThoughtHighlight ? thoughtStyle.borderColor : theme.border,
              },
            ]}>
              <View style={styles.thoughtRow}>
                <MaterialCommunityIcons
                  name={thoughtStyle.icon}
                  size={16}
                  color={isThoughtHighlight ? thoughtStyle.iconColor : theme.textSecondary}
                />
                <Text style={[
                  styles.thoughtText,
                  { color: isThoughtHighlight ? thoughtStyle.iconColor : theme.textSecondary },
                ]}>
                  {innerThought}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  heroSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  infoContainer: {
    flex: 1,
  },
  playerName: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 1,
  },
  age: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  miniBar: {
    width: 46,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  miniFill: {
    height: '100%',
    borderRadius: 3,
  },
  moneyText: {
    fontSize: 12,
    fontWeight: '700',
  },
  energyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  notificationToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  notificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flex: 1,
  },
  notificationToggleText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  notificationCountBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  notificationCountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  riskBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  riskBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#ef4444',
  },
  notificationPanel: {
    overflow: 'hidden',
  },
  notificationPanelContent: {
    paddingTop: 8,
    paddingBottom: 2,
  },
  goalSection: {
    gap: 8,
  },
  trackerCard: {
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  trackerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  trackerLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trackerLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  trackerValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  goalName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  goalHint: {
    fontSize: 11,
    marginBottom: 6,
  },
  trackerBar: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },
  trackerFill: {
    height: '100%',
    borderRadius: 999,
  },
  thoughtBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
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
