import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert, ListRenderItemInfo } from 'react-native';
import { NPC, Skills } from '../types';
import { getThemeTokens, getDensityMetrics } from '../utils/themeUtils';
import { selectionHaptic, buttonPress } from '../animations/HapticFeedback';
import { applySkillsToSocialCost } from '../utils/gameUtils';
import {
  getLocalizedInteractionRestriction,
  isInteractionAvailable,
  InteractionType,
} from '../constants/interactionRestrictions';
import { ensureTextContrast } from '../utils/colorContrast';
import { tRuntime } from '../i18n/strings';
import { useRuntimeLocale } from '../i18n/useRuntimeLocale';

interface SocialScreenProps {
  npcs: NPC[];
  currentEnergy: number;
  currentMoney: number;
  playerAge: number;
  playerPersonality: { openness: number; empathy: number; courage: number; conformity: number };
  skills?: Skills;
  onBack: () => void;
  onInteract: (
    npcId: string,
    actionType: 'CHAT' | 'HANGOUT' | 'GIFT' | 'STUDY' | 'FLIRT' | 'HELP' | 'COMPETE' | 'GOSSIP'
  ) => { success: boolean; message: string; cost?: { energy: number; money: number } };
  onMeetNew: () => { success: boolean; npc?: NPC };
  theme?: ReturnType<typeof getThemeTokens>;
  metrics?: ReturnType<typeof getDensityMetrics>;
}

interface SocialHeaderProps {
  onBack: () => void;
  theme: ReturnType<typeof getThemeTokens>;
}

interface SocialResourceBarProps {
  currentEnergy: number;
  currentMoney: number;
  theme: ReturnType<typeof getThemeTokens>;
}

interface InteractionOption {
  type: InteractionType;
  icon: string;
  label: string;
  description: string;
  energy: number;
  money: number;
}

interface SocialNPCCardProps {
  npc: NPC;
  selected: boolean;
  roleConfig: { emoji: string; color: string; name: string };
  theme: ReturnType<typeof getThemeTokens>;
  getRelationshipColor: (value: number) => string;
  onSelect: (npc: NPC) => void;
  availableInteractions: InteractionOption[];
  canAfford: (energy: number, money: number) => boolean;
  skills?: Skills;
  onInteract: (type: InteractionType) => void;
}

const ROLE_META: Record<string, { emoji: string; color: string; key: string; fallback: string }> = {
  ACQUAINTANCE: { emoji: '\u{1F464}', color: '#64748b', key: 'social.roles.ACQUAINTANCE', fallback: 'Tanidik' },
  FRIEND: { emoji: '\u{1F91D}', color: '#047857', key: 'social.roles.FRIEND', fallback: 'Arkadas' },
  BEST_FRIEND: { emoji: '\u{1F48E}', color: '#2563eb', key: 'social.roles.BEST_FRIEND', fallback: 'En Iyi Arkadas' },
  CRUSH: { emoji: '\u{1F495}', color: '#be185d', key: 'social.roles.CRUSH', fallback: 'Hoslandigin' },
  PARTNER: { emoji: '\u2764\uFE0F', color: '#dc2626', key: 'social.roles.PARTNER', fallback: 'Sevgili' },
  RIVAL: { emoji: '\u2694\uFE0F', color: '#b45309', key: 'social.roles.RIVAL', fallback: 'Rakip' },
  ENEMY: { emoji: '\u{1F621}', color: '#b91c1c', key: 'social.roles.ENEMY', fallback: 'Dusman' },
};

const PERSONALITY_EMOJI: Record<string, string> = {
  FRIENDLY: '\u{1F60A}',
  SHY: '\u{1F633}',
  AGGRESSIVE: '\u{1F624}',
  POPULAR: '\u2B50',
  NERDY: '\u{1F913}',
  ARTISTIC: '\u{1F3A8}',
  ATHLETIC: '\u{1F4AA}',
};

const INTERACTION_BASE_OPTIONS: Array<{
  type: InteractionType;
  icon: string;
  energy: number;
  money: number;
}> = [
  { type: 'CHAT', icon: '\u{1F4AC}', energy: 10, money: 0 },
  { type: 'HANGOUT', icon: '\u{1F389}', energy: 15, money: 0 },
  { type: 'GIFT', icon: '\u{1F381}', energy: 5, money: 50 },
  { type: 'STUDY', icon: '\u{1F4DA}', energy: 20, money: 0 },
  { type: 'FLIRT', icon: '\u{1F618}', energy: 12, money: 0 },
  { type: 'HELP', icon: '\u{1F91D}', energy: 18, money: 0 },
  { type: 'COMPETE', icon: '\u{1F3C6}', energy: 15, money: 0 },
  { type: 'GOSSIP', icon: '\u{1F5E3}\uFE0F', energy: 8, money: 0 },
];

const resolveRoleConfig = (role: string): { emoji: string; color: string; name: string } => {
  const meta = ROLE_META[role] || ROLE_META.ACQUAINTANCE;
  return {
    emoji: meta.emoji,
    color: meta.color,
    name: tRuntime(meta.key, undefined, meta.fallback),
  };
};

const SocialHeader: React.FC<SocialHeaderProps> = ({ onBack, theme }) => (
  <View style={styles.header}>
    <TouchableOpacity
      onPress={onBack}
      style={[
        styles.backButton,
        {
          backgroundColor: theme.surfaceRaised,
          borderColor: theme.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={tRuntime('social.screen.backAria', undefined, 'Hub ekranina don')}
      accessibilityHint={tRuntime('social.screen.backHint', undefined, 'Sosyal ekrandan cikarak ana oyun ekranina doner')}
    >
      <Text style={[styles.backButtonText, { color: theme.textPrimary }]}>
        {'\u2190'} {tRuntime('social.screen.back', undefined, 'Geri')}
      </Text>
    </TouchableOpacity>

    <View style={styles.titleContainer}>
      <View style={[styles.titleBadge, { backgroundColor: theme.surfaceRaised, borderColor: theme.border }]}>
        <Text style={[styles.titleText, { color: theme.textPrimary }]}>
          {'\u{1F465}'} {tRuntime('social.screen.title', undefined, 'Sosyal Cevre')}
        </Text>
      </View>
    </View>
  </View>
);

const SocialResourceBar: React.FC<SocialResourceBarProps> = ({ currentEnergy, currentMoney, theme }) => (
  <View style={[styles.resourceBar, { backgroundColor: theme.surfaceBase, borderColor: theme.border }]}>
    <Text style={[styles.resourceText, { color: theme.textPrimary }]}>
      {'\u26A1'} {currentEnergy}
    </Text>
    <Text style={[styles.resourceText, { color: theme.textPrimary }]}>
      {'\u{1F4B0}'} \u20BA{currentMoney}
    </Text>
  </View>
);

const SocialNPCCard: React.FC<SocialNPCCardProps> = React.memo(({
  npc,
  selected,
  roleConfig,
  theme,
  getRelationshipColor,
  onSelect,
  availableInteractions,
  canAfford,
  skills,
  onInteract,
}) => {
  useRuntimeLocale();

  const roleColor = ensureTextContrast(roleConfig.color, theme.surfaceBase, 4.5);
  const relationColor = ensureTextContrast(getRelationshipColor(npc.relationship), theme.surfaceBase, 4.5);

  return (
    <TouchableOpacity
      key={npc.id}
      style={[
        styles.npcCard,
        {
          backgroundColor: theme.surfaceBase,
          borderColor: selected ? roleColor : theme.border,
          borderWidth: selected ? 2 : 1,
        },
      ]}
      onPress={() => onSelect(npc)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${npc.name}, ${roleConfig.name}`}
      accessibilityHint={selected
        ? tRuntime('social.screen.npcSelectedHint', undefined, 'Kart acik, etkilesim secenekleri asagida')
        : tRuntime('social.screen.npcDefaultHint', undefined, 'Detaylari ve etkilesim seceneklerini acar')}
      accessibilityState={{ selected }}
    >
      <View style={styles.npcHeader}>
        <View style={styles.npcNameRow}>
          <Text style={styles.npcEmoji}>{roleConfig.emoji}</Text>
          <View>
            <Text style={[styles.npcName, { color: theme.textPrimary }]}>{npc.name}</Text>
            <Text style={[styles.npcRole, { color: roleColor }]}>{roleConfig.name}</Text>
          </View>
        </View>
        <View style={styles.npcInfo}>
          <Text style={styles.personalityEmoji}>{PERSONALITY_EMOJI[npc.personality] || '\u{1F642}'}</Text>
          <Text style={[styles.npcAge, { color: theme.textSecondary }]}>
            {npc.gender === 'MALE' ? '\u{1F466}' : '\u{1F467}'} {npc.age}
          </Text>
        </View>
      </View>

      <View style={styles.relationRow}>
        <Text style={[styles.relationLabel, { color: theme.textSecondary }]}>
          {tRuntime('social.screen.relationship', undefined, 'Iliski')}
        </Text>
        <Text style={[styles.relationValue, { color: relationColor }]}>
          {npc.relationship > 0 ? '+' : ''}{npc.relationship}
        </Text>
      </View>
      <View style={[styles.relationBar, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.relationFill,
            {
              width: `${Math.min(100, Math.abs(npc.relationship))}%`,
              backgroundColor: relationColor,
            },
          ]}
        />
      </View>

      {selected ? (
        <View style={styles.actionButtons}>
          <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>
            {tRuntime('social.screen.selectInteraction', undefined, 'Etkilesim Sec:')}
          </Text>
          {availableInteractions.length === 0 ? (
            <Text style={[styles.noInteractionsText, { color: theme.textSecondary }]}>
              {tRuntime('social.screen.noInteractions', undefined, 'Henuz etkilesim seceneklerin yok. Biraz daha buyumelisin.')}
            </Text>
          ) : (
            <View style={styles.actionGrid}>
              {availableInteractions.map(option => {
                const adjustedCost = applySkillsToSocialCost(
                  { energy: option.energy, money: option.money },
                  skills
                );
                const affordable = canAfford(option.energy, option.money);
                const actionColor = affordable
                  ? ensureTextContrast(roleConfig.color, theme.surfaceBase, 4.5)
                  : theme.border;

                const energyCostText = adjustedCost.energy > 0
                  ? tRuntime('social.screen.energyCost', { value: adjustedCost.energy }, `${adjustedCost.energy} enerji`)
                  : tRuntime('social.screen.energyCostZero', undefined, '0 enerji');
                const moneyCostText = adjustedCost.money > 0
                  ? tRuntime('social.screen.moneyCost', { value: adjustedCost.money }, `${adjustedCost.money} para`)
                  : '';

                return (
                  <TouchableOpacity
                    key={option.type}
                    style={[
                      styles.actionBtn,
                      {
                        backgroundColor: affordable ? `${actionColor}20` : `${theme.border}50`,
                        borderColor: affordable ? actionColor : theme.border,
                        opacity: affordable ? 1 : 0.5,
                      },
                    ]}
                    onPress={() => onInteract(option.type)}
                    disabled={!affordable}
                    accessibilityRole="button"
                    accessibilityLabel={tRuntime(
                      'social.screen.actionAria',
                      { npcName: npc.name, action: option.label },
                      `${npc.name} ile ${option.label}`
                    )}
                    accessibilityHint={affordable
                      ? tRuntime(
                        'social.screen.actionHintAffordable',
                        {
                          description: option.description,
                          energyCost: energyCostText,
                          moneyCost: moneyCostText ? ` ${moneyCostText}` : '',
                        },
                        `${option.description}. ${energyCostText}${moneyCostText ? ` ${moneyCostText}` : ''} harcar`
                      )
                      : tRuntime('social.screen.actionHintLocked', undefined, 'Bu etkilesim su an kilitli, kaynaklarin yetersiz')}
                    accessibilityState={{ disabled: !affordable }}
                  >
                    <Text style={styles.actionIcon}>{option.icon}</Text>
                    <Text style={[styles.actionLabel, { color: affordable ? theme.textPrimary : theme.textSecondary }]}>
                      {option.label}
                    </Text>
                    <Text
                      style={[
                        styles.actionCost,
                        { color: affordable ? theme.textSecondary : ensureTextContrast('#b91c1c', theme.surfaceBase, 4.5) },
                      ]}
                    >
                      {adjustedCost.energy > 0 && `\u26A1${adjustedCost.energy}`}
                      {adjustedCost.money > 0 && ` \u{1F4B0}\u20BA${adjustedCost.money}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}) as React.FC<SocialNPCCardProps>;
SocialNPCCard.displayName = 'SocialNPCCard';

const SocialScreenRoot: React.FC<SocialScreenProps> = ({
  npcs,
  currentEnergy,
  currentMoney,
  playerAge,
  skills,
  onBack,
  onInteract,
  onMeetNew,
  theme: themeOverride,
  metrics: metricsOverride,
}) => {
  useRuntimeLocale();

  const theme = themeOverride || getThemeTokens('dark');
  const metrics = metricsOverride || getDensityMetrics('standard');
  const [selectedNPC, setSelectedNPC] = useState<NPC | null>(null);

  const interactionOptions = useMemo<InteractionOption[]>(() => (
    INTERACTION_BASE_OPTIONS.map(base => {
      const localized = getLocalizedInteractionRestriction(base.type);
      return {
        ...base,
        label: localized.label,
        description: localized.description,
      };
    })
  ), []);

  const availableInteractions = useMemo(
    () => interactionOptions.filter(option => isInteractionAvailable(option.type, playerAge)),
    [interactionOptions, playerAge]
  );

  const canAfford = useCallback((energy: number, money: number) => {
    const adjusted = applySkillsToSocialCost({ energy, money }, skills);
    const hasEnergy = currentEnergy >= adjusted.energy;
    const hasMoney = adjusted.money <= 0 || currentMoney >= adjusted.money;
    return hasEnergy && hasMoney;
  }, [currentEnergy, currentMoney, skills]);

  const getRelationshipColor = useCallback((value: number) => {
    if (value >= 70) return '#15803d';
    if (value >= 40) return '#2563eb';
    if (value >= 0) return '#64748b';
    if (value >= -40) return '#b45309';
    return '#b91c1c';
  }, []);

  const handleNPCSelect = useCallback((npc: NPC) => {
    selectionHaptic();
    setSelectedNPC(prev => (prev?.id === npc.id ? null : npc));
  }, []);

  const handleInteraction = useCallback((actionType: InteractionType) => {
    if (!selectedNPC) return;

    buttonPress();
    const result = onInteract(selectedNPC.id, actionType);
    if (result.success) {
      Alert.alert(tRuntime('social.screen.successTitle', undefined, 'Basarili'), result.message);
    } else {
      Alert.alert(tRuntime('social.screen.errorTitle', undefined, 'Hata'), result.message);
    }
  }, [selectedNPC, onInteract]);

  const handleMeetNew = useCallback(() => {
    buttonPress();
    const result = onMeetNew();
    if (result.success && result.npc) {
      Alert.alert(
        tRuntime('social.screen.newContactTitle', undefined, 'Yeni Tanisma'),
        tRuntime('social.screen.newContactMessage', { npcName: result.npc.name }, '{npcName} ile tanistin!')
      );
    }
  }, [onMeetNew]);

  const meetColor = ensureTextContrast('#047857', theme.surfaceBase, 4.5);

  const renderNPCItem = useCallback(({ item: npc }: ListRenderItemInfo<NPC>) => {
    const roleConfig = resolveRoleConfig(npc.role);
    const isSelected = selectedNPC?.id === npc.id;

    return (
      <SocialNPCCard
        npc={npc}
        selected={isSelected}
        roleConfig={roleConfig}
        theme={theme}
        getRelationshipColor={getRelationshipColor}
        onSelect={handleNPCSelect}
        availableInteractions={availableInteractions}
        canAfford={canAfford}
        skills={skills}
        onInteract={handleInteraction}
      />
    );
  }, [selectedNPC?.id, theme, getRelationshipColor, handleNPCSelect, availableInteractions, canAfford, skills, handleInteraction]);

  const npcKeyExtractor = useCallback((item: NPC) => item.id, []);

  const listHeader = useMemo(() => (
    <>
      <SocialHeader onBack={onBack} theme={theme} />
      <SocialResourceBar currentEnergy={currentEnergy} currentMoney={currentMoney} theme={theme} />

      <TouchableOpacity
        style={[styles.meetNewButton, { backgroundColor: meetColor }]}
        onPress={handleMeetNew}
        disabled={currentEnergy < 12}
        accessibilityRole="button"
        accessibilityLabel={tRuntime('social.screen.meetNewAria', undefined, 'Yeni biri ile tanis')}
        accessibilityHint={currentEnergy < 12
          ? tRuntime('social.screen.meetNewHintDisabled', undefined, 'Bu aksiyon icin en az 12 enerji gerekir')
          : tRuntime('social.screen.meetNewHintEnabled', undefined, 'Yeni bir NPC ile tanismani saglar')}
        accessibilityState={{ disabled: currentEnergy < 12 }}
      >
        <Text style={styles.meetNewIcon}>{'\u{1F44B}'}</Text>
        <View>
          <Text style={styles.meetNewText}>{tRuntime('social.screen.meetNewLabel', undefined, 'Yeni Biri ile Tanis')}</Text>
          <Text style={styles.meetNewCost}>{tRuntime('social.screen.meetNewCost', undefined, '\u26A112 enerji')}</Text>
        </View>
      </TouchableOpacity>
    </>
  ), [onBack, theme, currentEnergy, currentMoney, meetColor, handleMeetNew]);

  const emptyComponent = useMemo(() => (
    <View style={[styles.emptyState, { backgroundColor: theme.surfaceBase }]}>
      <Text style={styles.emptyEmoji}>{'\u{1F465}'}</Text>
      <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
        {tRuntime('social.screen.emptyTitle', undefined, 'Henuz kimseyi tanimiyorsun')}
      </Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        {tRuntime('social.screen.emptySubtitle', undefined, '"Yeni Biri ile Tanis" butonuna tikla.')}
      </Text>
    </View>
  ), [theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.appBg }]}>
      <FlatList
        data={npcs}
        keyExtractor={npcKeyExtractor}
        renderItem={renderNPCItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={emptyComponent}
        contentContainerStyle={[styles.contentContainer, { padding: metrics.pad }]}
        keyboardShouldPersistTaps="handled"
        overScrollMode="never"
        bounces={false}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </View>
  );
};

type SocialScreenCompound = React.MemoExoticComponent<React.FC<SocialScreenProps>> & {
  Header: React.FC<SocialHeaderProps>;
  ResourceBar: React.FC<SocialResourceBarProps>;
  NPCCard: React.FC<SocialNPCCardProps>;
};

const SocialScreenComponent = React.memo(SocialScreenRoot);

export const SocialScreen = Object.assign(SocialScreenComponent, {
  Header: SocialHeader,
  ResourceBar: SocialResourceBar,
  NPCCard: SocialNPCCard,
}) as SocialScreenCompound;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    position: 'relative',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  titleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  titleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  resourceBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  resourceText: {
    fontSize: 16,
    fontWeight: '700',
  },
  meetNewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  meetNewIcon: {
    fontSize: 32,
  },
  meetNewText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  meetNewCost: {
    fontSize: 12,
    color: '#d1fae5',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
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
  npcList: {
    gap: 12,
  },
  npcCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  npcHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  npcNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  npcEmoji: {
    fontSize: 28,
  },
  npcName: {
    fontSize: 16,
    fontWeight: '700',
  },
  npcRole: {
    fontSize: 12,
    fontWeight: '600',
  },
  npcInfo: {
    alignItems: 'flex-end',
  },
  personalityEmoji: {
    fontSize: 20,
  },
  npcAge: {
    fontSize: 11,
    marginTop: 2,
  },
  relationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  relationLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
  },
  relationValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  relationBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  relationFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionButtons: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionCost: {
    fontSize: 10,
    marginTop: 2,
  },
  noInteractionsText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
});

export default SocialScreen;
