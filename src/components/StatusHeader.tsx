import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Modal, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { InnerThoughtType, LifeGoal, Stats } from '../types';
import { MessageToast } from '../animations/ToastAnimations';
import { usePillarStats, useStress } from '../hooks/useGameSelectors';
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
  label: string;
  barColor: string;
  percent: number;
  valueText: string;
  onPress: () => void;
  theme: any;
  alertDot?: boolean;
}

interface TrackerProps {
  selectedGoal?: LifeGoal | null;
  dreamProgress: number;
  riskPercent: number;
  theme: any;
  isLightTheme: boolean;
}

type PillarKey = 'beden' | 'zihin' | 'ruh' | 'servet';
type StressBand = 'HIDDEN' | 'YELLOW' | 'ORANGE' | 'RED';

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const formatMoneyDisplay = (money: number): string => {
  if (Math.abs(money) >= 1000) {
    return `${(money / 1000).toFixed(1)}K TL`;
  }
  return `${money} TL`;
};

const getStressBand = (ratio: number): StressBand => {
  if (ratio < 0.3) return 'HIDDEN';
  if (ratio < 0.6) return 'YELLOW';
  if (ratio < 0.85) return 'ORANGE';
  return 'RED';
};

const getStressHint = (band: StressBand): string | null => {
  if (band === 'YELLOW') return 'Yorgunluk birikmeye başlıyor.';
  if (band === 'ORANGE') return 'Dikkat: Yükünü hafiflet.';
  if (band === 'RED') return 'Kriz eşiğindesin! Dur ve nefes al.';
  return null;
};

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

const StatMeter: React.FC<StatMeterProps> = ({
  icon,
  label,
  barColor,
  percent,
  valueText,
  onPress,
  theme,
  alertDot,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={[
      styles.statusItem,
      {
        borderColor: alertDot ? '#ef4444' : theme.border,
        backgroundColor: theme.surfaceOverlay,
      },
    ]}
    accessibilityRole="button"
    accessibilityLabel={`${label} detaylarini ac`}
  >
    {alertDot && <View style={styles.alertDot} />}
    <View style={styles.statLabelRow}>
      <MaterialCommunityIcons name={icon} size={15} color={theme.textSecondary} />
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
    <Text style={[styles.statValue, { color: theme.textPrimary }]}>{valueText}</Text>
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
  </TouchableOpacity>
);

const getDreamHint = (progress: number, statHint: string): string => {
  if (progress >= 100) return 'Hayalin sana açık!';
  if (progress >= 71) return 'Hedefe çok yakınsın. Son hamleyi dikkatli yap.';
  if (progress >= 31) return `İyi gidiyorsun! ${statHint} biraz daha güçlendir.`;
  return `Yolun başındasın. ${statHint} geliştirmeye odaklan.`;
};

const getRiskName = (risk: number): string => {
  if (risk >= 85) return '⚠️ Kritik Risk Alarmı';
  if (risk >= 50) return 'Risk Alarmı Açık';
  return 'Risk Seviyesi Normal';
};

const getRiskHint = (risk: number): string => {
  if (risk >= 85) return 'Kritik risk! Son hamlen çok önemli.';
  if (risk >= 50) return 'Risk artıyor. Kararlarını yavaşlat.';
  return 'Risk seviyesi kontrol altında.';
};

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
          {goalMeta
            ? getDreamHint(safeDreamProgress, goalMeta.statHint)
            : 'Hedef secince izlenecek statlar burada gorunur.'}
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
          {getRiskName(safeRisk)}
        </Text>
        <Text style={[styles.goalHint, { color: theme.textSecondary }]}>
          {getRiskHint(safeRisk)}
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
  const avatarIcon = getPlayerIcon(age);
  const safeRiskPercent = clamp(riskPercent, 0, 100);
  const notificationCount = 1 + (safeRiskPercent >= 50 ? 1 : 0) + (innerThought ? 1 : 0);
  const badgeIsUrgent = innerThoughtType === 'CRISIS' || innerThoughtType === 'CLIFFHANGER';
  const stress = useStress();
  const [selectedPillar, setSelectedPillar] = useState<PillarKey | null>(null);
  const [stressToastVisible, setStressToastVisible] = useState(false);
  const stressScale = useRef(new Animated.Value(1)).current;
  const wasCriticalRef = useRef(false);

  const isLightTheme = useMemo(() => isLightHex(theme.appBg), [theme.appBg]);
  const accentBg = isLightTheme ? `${theme.accentBrand}1F` : `${theme.accentBrand}26`;
  const thoughtStyle = THOUGHT_STYLES[innerThoughtType ?? 'IDLE'];
  const isThoughtHighlight = innerThoughtType != null && innerThoughtType !== 'IDLE';
  const pillarStats = usePillarStats(stats);
  const moneyDisplay = useMemo(() => formatMoneyDisplay(pillarStats.servet), [pillarStats.servet]);
  const pillarAlerts = useMemo(() => ({
    beden: pillarStats.raw.health < 25 || pillarStats.raw.energy < 25,
    zihin: pillarStats.raw.intelligence < 25 || pillarStats.raw.discipline < 25,
    ruh: pillarStats.raw.charisma < 25 || pillarStats.raw.familyRelation < 25,
    servet: false,
  }), [pillarStats.raw]);
  const selectedPillarContent = useMemo(() => {
    if (!selectedPillar) return null;

    if (selectedPillar === 'beden') {
      return {
        title: 'Beden',
        rows: [
          { label: 'Saglik', value: Math.round(pillarStats.raw.health).toString() },
          { label: 'Enerji', value: `${Math.round(pillarStats.raw.energy)}/${safeMaxEnergy}` },
        ],
      };
    }

    if (selectedPillar === 'zihin') {
      return {
        title: 'Zihin',
        rows: [
          { label: 'Zeka', value: Math.round(pillarStats.raw.intelligence).toString() },
          { label: 'Disiplin', value: Math.round(pillarStats.raw.discipline).toString() },
        ],
      };
    }

    if (selectedPillar === 'ruh') {
      return {
        title: 'Ruh',
        rows: [
          { label: 'Karizma', value: Math.round(pillarStats.raw.charisma).toString() },
          { label: 'Aile Iliskisi', value: Math.round(pillarStats.raw.familyRelation).toString() },
        ],
      };
    }

    return {
      title: 'Servet',
      rows: [
        { label: 'Para', value: moneyDisplay },
      ],
    };
  }, [moneyDisplay, pillarStats.raw, safeMaxEnergy, selectedPillar]);
  const stressRatio = useMemo(() => (
    Number.isFinite(stress.ratio) ? clamp(stress.ratio, 0, 2) : 0
  ), [stress.ratio]);
  const stressBand = useMemo(() => getStressBand(stressRatio), [stressRatio]);
  const stressColor = useMemo(() => {
    if (stressBand === 'RED') return '#ef4444';
    if (stressBand === 'ORANGE') return '#f97316';
    return '#eab308';
  }, [stressBand]);
  const stressPercent = useMemo(() => Math.round(clamp(stressRatio, 0, 1) * 100), [stressRatio]);

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

  useEffect(() => {
    if (stressBand !== 'ORANGE' && stressBand !== 'RED') {
      stressScale.stopAnimation();
      stressScale.setValue(1);
      return;
    }

    const pulseMax = stressBand === 'RED' ? 1.07 : 1.03;
    const pulseDuration = stressBand === 'RED' ? 420 : 760;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(stressScale, { toValue: pulseMax, duration: pulseDuration, useNativeDriver: true }),
        Animated.timing(stressScale, { toValue: 1, duration: pulseDuration, useNativeDriver: true }),
      ]),
      { iterations: -1 }
    );

    animation.start();
    return () => {
      animation.stop();
      stressScale.setValue(1);
    };
  }, [stressBand, stressScale]);

  useEffect(() => {
    const isCritical = stressBand === 'RED';

    if (isCritical && !wasCriticalRef.current) {
      setStressToastVisible(true);
    }

    if (!isCritical) {
      setStressToastVisible(false);
    }

    wasCriticalRef.current = isCritical;
  }, [stressBand]);

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
          label="Beden"
          barColor="#ef4444"
          percent={pillarStats.beden}
          valueText={`%${pillarStats.beden}`}
          onPress={() => setSelectedPillar('beden')}
          theme={theme}
          alertDot={pillarAlerts.beden}
        />
        <StatMeter
          icon="brain"
          label="Zihin"
          barColor="#3b82f6"
          percent={pillarStats.zihin}
          valueText={`%${pillarStats.zihin}`}
          onPress={() => setSelectedPillar('zihin')}
          theme={theme}
          alertDot={pillarAlerts.zihin}
        />
        <StatMeter
          icon="star-four-points-outline"
          label="Ruh"
          barColor="#a855f7"
          percent={pillarStats.ruh}
          valueText={`%${pillarStats.ruh}`}
          onPress={() => setSelectedPillar('ruh')}
          theme={theme}
          alertDot={pillarAlerts.ruh}
        />
        <StatMeter
          icon="sack"
          label="Servet"
          barColor="#22c55e"
          percent={Math.min(100, Math.max(0, pillarStats.servet / 10))}
          valueText={moneyDisplay}
          onPress={() => setSelectedPillar('servet')}
          theme={theme}
          alertDot={pillarAlerts.servet}
        />
      </View>

      {stressBand !== 'HIDDEN' ? (
        <Animated.View
          testID="stress-bar-container"
          style={[
            styles.stressContainer,
            {
              borderColor: theme.border,
              backgroundColor: isLightTheme ? theme.surfaceRaised : theme.surfaceOverlay,
              transform: [{ scale: stressScale }],
            },
          ]}
        >
          <View style={styles.stressHeader}>
            <Text style={[styles.stressLabel, { color: stressColor }]}>{'\u{1F321}\uFE0F'} Stres</Text>
            <Text style={[styles.stressValue, { color: stressColor }]}>
              {stress.current}/{stress.threshold} (%{stressPercent})
            </Text>
          </View>
          <View style={[styles.stressTrack, { backgroundColor: theme.border }]}>
            <View
              testID="stress-bar-fill"
              style={[
                styles.stressFill,
                {
                  width: `${clamp(stressRatio * 100, 0, 100)}%`,
                  backgroundColor: stressColor,
                },
              ]}
            />
          </View>
          {getStressHint(stressBand) != null && (
            <Text style={[styles.stressHint, { color: stressColor }]}>
              {getStressHint(stressBand)}
            </Text>
          )}
        </Animated.View>
      ) : null}

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
          <View style={[styles.notificationCountBadge, { backgroundColor: badgeIsUrgent ? '#ef4444' : theme.accentEvent }]}>
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

      {!notificationsOpen && isThoughtHighlight &&
       (innerThoughtType === 'CRISIS' || innerThoughtType === 'CLIFFHANGER') && (
        <TouchableOpacity
          onPress={() => setNotificationsOpen(true)}
          style={[
            styles.thoughtPeek,
            { borderColor: thoughtStyle.borderColor, backgroundColor: thoughtStyle.backgroundColor },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Kriz bildirimini görüntüle"
        >
          <MaterialCommunityIcons name={thoughtStyle.icon} size={13} color={thoughtStyle.iconColor} />
          <Text style={[styles.thoughtPeekText, { color: thoughtStyle.iconColor }]} numberOfLines={1}>
            {innerThought}
          </Text>
        </TouchableOpacity>
      )}

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

      <Modal
        transparent
        animationType="slide"
        visible={selectedPillarContent != null}
        onRequestClose={() => setSelectedPillar(null)}
      >
        <View style={styles.sheetRoot}>
          <Pressable style={styles.sheetBackdrop} onPress={() => setSelectedPillar(null)} />
          <View
            style={[
              styles.sheetCard,
              {
                backgroundColor: theme.surfaceBase,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={[styles.sheetHandle, { backgroundColor: theme.border }]} />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: theme.textPrimary }]}>
                {selectedPillarContent?.title ?? ''} Detaylari
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedPillar(null)}
                accessibilityRole="button"
                accessibilityLabel="Detay panelini kapat"
              >
                <MaterialCommunityIcons name="close" size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedPillarContent?.rows.map(row => (
              <View key={row.label} style={[styles.sheetRow, { borderBottomColor: theme.border }]}>
                <Text style={[styles.sheetLabel, { color: theme.textSecondary }]}>{row.label}</Text>
                <Text style={[styles.sheetValue, { color: theme.textPrimary }]}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </Modal>

      <MessageToast
        visible={stressToastVisible}
        message="Kriz yaklasiyor!"
        type="error"
        onClose={() => setStressToastVisible(false)}
        style={styles.stressToast}
      />
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
    alignItems: 'stretch',
    gap: 8,
    marginBottom: 10,
  },
  stressContainer: {
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
  },
  stressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stressLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  stressValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  stressTrack: {
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },
  stressFill: {
    height: '100%',
    borderRadius: 999,
  },
  stressToast: {
    top: 20,
  },
  stressHint: {
    fontSize: 11,
    marginTop: 4,
  },
  statusItem: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 7,
    justifyContent: 'space-between',
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  statValue: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  miniBar: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 6,
  },
  miniFill: {
    height: '100%',
    borderRadius: 3,
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
  alertDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ef4444',
  },
  thoughtPeek: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
  },
  thoughtPeekText: {
    fontSize: 12,
    flex: 1,
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
  sheetRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
  },
  sheetCard: {
    borderWidth: 1,
    borderBottomWidth: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 8,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    opacity: 0.7,
    marginBottom: 10,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sheetTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sheetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  sheetLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});

