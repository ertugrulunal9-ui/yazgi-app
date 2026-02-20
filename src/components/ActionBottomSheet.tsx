import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  Platform,
  Pressable,
  BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { devLog } from '../utils/devLogger';
import {
  ActionCategory,
  SubAction,
  getActionEffectiveMinAge,
  resolveActionEffectForFamily,
} from '../data/actions';
import { getEffectiveOwnedItems, getItem } from '../data/items';
import { FamilyWealth, Skills } from '../types';
import { applySkillsToHubAction } from '../utils/gameUtils';

interface ActionBottomSheetProps {
  visible: boolean;
  category: ActionCategory | null;
  onClose: () => void;
  onSelectAction: (action: SubAction) => void;
  theme: any;
  currentAge: number;
  currentEnergy: number;
  currentMoney: number;
  skills: Skills;
  inventory: string[];
  familyWealth?: FamilyWealth | null;
}

type MaterialIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const CATEGORY_ICON_MAP: Record<string, MaterialIconName> = {
  baby: 'baby-face-outline',
  explore: 'compass-outline',
  family: 'account-group-outline',
  study: 'book-education-outline',
  sports: 'soccer',
  arts: 'palette-outline',
  computer: 'laptop',
  work: 'briefcase-outline',
  shopping: 'cart-outline',
};

const ACTION_PREFIX_ICON_MAP: Record<string, MaterialIconName> = {
  baby: 'baby-face-outline',
  explore: 'compass-outline',
  family: 'account-group-outline',
  study: 'book-open-variant',
  sports: 'soccer',
  arts: 'palette-outline',
  coding: 'code-tags',
  computer: 'laptop',
  work: 'briefcase-outline',
  shopping: 'cart-outline',
  ask: 'hand-coin-outline',
};

const getCategoryIconName = (categoryId: string): MaterialIconName => {
  return CATEGORY_ICON_MAP[categoryId] || 'star-four-points-outline';
};

const getActionIconName = (categoryId: string, actionId: string): MaterialIconName => {
  const prefix = actionId.split('_')[0];
  return ACTION_PREFIX_ICON_MAP[prefix] || getCategoryIconName(categoryId);
};

export const ActionBottomSheet: React.FC<ActionBottomSheetProps> = ({
  visible,
  category,
  onClose,
  onSelectAction,
  theme,
  currentAge,
  currentEnergy,
  currentMoney,
  skills,
  inventory,
  familyWealth,
}) => {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [internalVisible, setInternalVisible] = useState(false);
  const [overlayEnabled, setOverlayEnabled] = useState(false);

  const SHEET_HEIGHT = Math.min(windowHeight * 0.6, 500);

  const resolveActionState = useCallback((action: SubAction) => {
    const ownedItems = getEffectiveOwnedItems(inventory, familyWealth);
    const baseEffect = resolveActionEffectForFamily(action, familyWealth);
    const adjusted = applySkillsToHubAction(
      action.id,
      baseEffect || {},
      action.energyCost,
      action.gradeUpdates as any,
      skills
    );
    const effectiveEnergyCost = adjusted.energyCost;
    const effectiveMinAge = getActionEffectiveMinAge(action, ownedItems);
    const missingItemId = (action.requiredItemIds || []).find(itemId => !ownedItems.includes(itemId));
    const missingItemName = missingItemId ? (getItem(missingItemId)?.name || missingItemId) : null;
    const isOwnedItem = Boolean(action.purchaseItemId && ownedItems.includes(action.purchaseItemId));
    const requiredMoney = adjusted.effect.money !== undefined && adjusted.effect.money < 0
      ? Math.abs(adjusted.effect.money)
      : 0;
    const moneyDelta = typeof adjusted.effect.money === 'number' ? adjusted.effect.money : 0;

    const isAgeLocked = effectiveMinAge !== undefined && currentAge < effectiveMinAge;
    const isEnergyLocked = currentEnergy < effectiveEnergyCost;
    const isMoneyLocked = requiredMoney > currentMoney;
    const isItemLocked = Boolean(missingItemId);
    const isLocked = isAgeLocked || isEnergyLocked || isMoneyLocked || isItemLocked || isOwnedItem;

    let lockReason: 'age' | 'energy' | 'money' | 'item' | 'owned' | null = null;
    if (isOwnedItem) lockReason = 'owned';
    else if (isItemLocked) lockReason = 'item';
    else if (isAgeLocked) lockReason = 'age';
    else if (isMoneyLocked) lockReason = 'money';
    else if (isEnergyLocked) lockReason = 'energy';

    return {
      isLocked,
      lockReason,
      missingItemName,
      requiredMoney,
      moneyDelta,
      effectiveEnergyCost,
      effectiveMinAge,
    };
  }, [currentAge, currentEnergy, currentMoney, familyWealth, inventory, skills]);

  const getActionAccessibilityHint = useCallback((
    action: SubAction,
    lockReason: 'age' | 'energy' | 'money' | 'item' | 'owned' | null,
    effectiveEnergyCost: number,
    effectiveMinAge?: number,
    requiredMoney?: number,
    moneyDelta?: number,
    missingItemName?: string | null
  ): string => {
    if (action.accessibilityHint && !lockReason) {
      return action.accessibilityHint;
    }
    if (lockReason === 'age') {
      return `${effectiveMinAge || action.minAge} yasindan sonra acilir`;
    }
    if (lockReason === 'item') {
      return `${missingItemName || 'Gerekli esya'} olmadan bu aksiyon acilmaz`;
    }
    if (lockReason === 'owned') {
      return 'Bu esya zaten sende var';
    }
    if (lockReason === 'money') {
      return `Bu aksiyon icin en az ${requiredMoney || 0} para gerekir`;
    }
    if (lockReason === 'energy') {
      return `Bu aksiyon icin en az ${effectiveEnergyCost} enerji gerekir`;
    }
    if (typeof moneyDelta === 'number' && moneyDelta !== 0) {
      const moneyText = moneyDelta < 0
        ? `${Math.abs(moneyDelta)} para harcar`
        : `${moneyDelta} para kazandirir`;
      return `${effectiveEnergyCost} enerji harcar, ${moneyText} ve karakterini etkiler`;
    }
    return `${effectiveEnergyCost} enerji harcar ve karakterini etkiler`;
  }, []);

  // Debug log on every render
  devLog.log('[ActionBottomSheet] RENDER - visible:', visible, 'category:', category?.title, 'internalVisible:', internalVisible);

  // Sync internal state with props
  useEffect(() => {
    devLog.log('[ActionBottomSheet] useEffect - visible changed to:', visible);
    if (visible) {
      setInternalVisible(true);
      setOverlayEnabled(false);
      const enableTimer = setTimeout(() => setOverlayEnabled(true), 150);
      return () => clearTimeout(enableTimer);
    } else {
      // Delay hiding for animation (if we had one)
      const timer = setTimeout(() => setInternalVisible(false), 100);
      setOverlayEnabled(false);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  // Handle Android back button
  useEffect(() => {
    if (!visible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      devLog.log('[ActionBottomSheet] Back button pressed');
      onClose();
      return true;
    });

    return () => backHandler.remove();
  }, [visible, onClose]);

  const handleActionPress = useCallback((action: SubAction) => {
    devLog.log('[ActionBottomSheet] ========== PRESS ==========');
    devLog.log('[ActionBottomSheet] Action:', action.text);

    const state = resolveActionState(action);

    devLog.log('[ActionBottomSheet] Age:', currentAge, 'Required:', state.effectiveMinAge);
    devLog.log('[ActionBottomSheet] Energy:', currentEnergy, 'Cost:', state.effectiveEnergyCost);

    if (!state.isLocked) {
      devLog.log('[ActionBottomSheet] >>> Calling onSelectAction <<<');
      onSelectAction(action);
    } else {
      devLog.log('[ActionBottomSheet] LOCKED');
    }
  }, [currentAge, currentEnergy, onSelectAction, resolveActionState]);

  // Don't render if not visible
  if (!internalVisible || !category) {
    devLog.log('[ActionBottomSheet] Not rendering - internalVisible:', internalVisible, 'category:', !!category);
    return null;
  }

  const renderActionItem = ({ item: action }: { item: SubAction }) => {
    const state = resolveActionState(action);
    const lockLabel = state.lockReason === 'age'
      ? `Kilitli: ${state.effectiveMinAge || action.minAge} yasindan sonra acilir`
      : state.lockReason === 'item'
        ? `Kilitli: Gerekli esya ${state.missingItemName}`
        : state.lockReason === 'owned'
          ? 'Bu esya zaten sende var'
          : state.lockReason === 'money'
            ? `En az ${state.requiredMoney} para gerekli`
            : state.lockReason === 'energy'
              ? 'Yetersiz enerji'
              : '';
    const actionPriceLabel = state.moneyDelta < 0
      ? `${action.text} (₺${Math.abs(state.moneyDelta)})`
      : action.text;
    const showMoneyBadge = state.moneyDelta !== 0;
    const moneyBadgeColor = state.moneyDelta < 0
      ? (state.lockReason === 'money' ? '#ef4444' : '#f59e0b')
      : '#22c55e';

    return (
      <Pressable
        onPress={() => {
          devLog.log('[ActionBottomSheet] Pressable onPress:', action.text);
          handleActionPress(action);
        }}
        style={({ pressed }) => [
          styles.actionCard,
          {
            backgroundColor: pressed
              ? (theme.surfaceOverlay || '#374151')
              : (theme.surfaceBase || '#111827'),
            borderColor: theme.border || '#374151',
            opacity: state.isLocked ? 0.5 : 1,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={action.text}
        accessibilityHint={getActionAccessibilityHint(
          action,
          state.lockReason,
          state.effectiveEnergyCost,
          state.effectiveMinAge,
          state.requiredMoney,
          state.moneyDelta,
          state.missingItemName
        )}
        accessibilityState={{ disabled: state.isLocked }}
      >
        <View style={styles.actionRow}>
          <View style={styles.actionLeft}>
            <MaterialCommunityIcons
              name={getActionIconName(category.id, action.id)}
              size={20}
              color={theme.textSecondary || '#9ca3af'}
              style={styles.actionIcon}
            />
            <Text style={[styles.actionText, { color: theme.textPrimary || '#fff' }]}>
              {actionPriceLabel}
            </Text>
          </View>
          <View style={styles.costBadges}>
            <View style={[
              styles.energyBadge,
              { backgroundColor: state.isLocked ? 'rgba(239, 68, 68, 0.2)' : (theme.surfaceOverlay || '#374151') }
            ]}>
              <Text style={styles.energyIcon}>
                {state.isLocked ? (state.lockReason === 'age' || state.lockReason === 'item' ? 'L' : 'E') : 'E'}
              </Text>
              <Text style={[
                styles.energyCost,
                { color: state.isLocked ? '#ef4444' : (theme.textSecondary || '#9ca3af') }
              ]}>
                {state.effectiveEnergyCost}
              </Text>
            </View>
            {showMoneyBadge && (
              <View style={[
                styles.moneyBadge,
                { backgroundColor: theme.surfaceOverlay || '#374151' }
              ]}>
                <Text style={[styles.moneySymbol, { color: moneyBadgeColor }]}>₺</Text>
                <Text style={[styles.moneyAmount, { color: moneyBadgeColor }]}>
                  {state.moneyDelta > 0 ? `+${state.moneyDelta}` : `-${Math.abs(state.moneyDelta)}`}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Text style={[styles.description, { color: theme.textSecondary || '#9ca3af' }]}>
          {action.feedback}
        </Text>
        {state.isLocked && lockLabel.length > 0 && (
          <View style={styles.lockMessage}>
            <Text style={styles.lockText}>{lockLabel}</Text>
          </View>
        )}
      </Pressable>
    );
  };

  devLog.log('[ActionBottomSheet] Rendering full component');

  return (
    <View style={styles.container}>
      {/* Overlay - tap to close */}
      <Pressable
        style={styles.overlay}
        pointerEvents={overlayEnabled ? 'auto' : 'none'}
        onPress={() => {
          devLog.log('[ActionBottomSheet] Overlay pressed - closing');
          onClose();
        }}
        accessibilityRole="button"
        accessibilityLabel="Aksiyon listesini kapat"
        accessibilityHint="Alt paneli kapatip oyun ekranina geri doner"
      />

      {/* Bottom Sheet */}
      <View
        style={[
          styles.bottomSheet,
          {
            height: SHEET_HEIGHT,
            backgroundColor: theme.surfaceRaised || '#1f2937',
          }
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: theme.border || '#374151' }]}>
          <View style={styles.headerLeft}>
            <View style={[
              styles.iconContainer,
              { backgroundColor: category.bgColor, borderColor: category.color }
            ]}>
              <MaterialCommunityIcons
                name={getCategoryIconName(category.id)}
                size={18}
                color={category.color || theme.textPrimary || '#fff'}
              />
            </View>
            <Text style={[styles.titleText, { color: theme.textPrimary || '#fff' }]}>
              {category.title}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              devLog.log('[ActionBottomSheet] Close button pressed');
              onClose();
            }}
            style={[styles.closeButton, { backgroundColor: theme.surfaceBase || '#111827' }]}
            accessibilityRole="button"
            accessibilityLabel="Aksiyon panelini kapat"
            accessibilityHint="Secim yapmadan onceki ekrana geri doner"
          >
            <Feather name="x" color={theme.textPrimary || '#fff'} size={18} />
          </TouchableOpacity>
        </View>

        {/* Actions List */}
        <FlatList
          data={category.subActions}
          renderItem={renderActionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="always"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 50,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  listContent: {
    padding: 14,
  },
  actionCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  costBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionIcon: {
    marginRight: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  energyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  energyIcon: {
    fontSize: 12,
  },
  energyCost: {
    fontSize: 12,
    fontWeight: '600',
  },
  moneyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  moneySymbol: {
    fontSize: 11,
    fontWeight: '700',
  },
  moneyAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 12,
    lineHeight: 16,
  },
  lockMessage: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  lockText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '600',
  },
});
