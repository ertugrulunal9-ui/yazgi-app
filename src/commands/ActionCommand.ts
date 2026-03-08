import {
  ExamGameType,
  SubAction,
  getActionEffectiveMinAge,
  resolveActionEffectForFamily,
} from '../data/actions';
import { getEffectiveOwnedItems, getItem, getItemName } from '../data/items';
import { tRuntime } from '../i18n/strings';
import { applyMomentumSignal, resolveMomentumSignal } from '../systems/PersonalityMomentumEngine';
import { StatEngine } from '../systems/StatEngine';
import { FamilyWealth, GameState, PersonalityShift, SchoolGrades, Skills, Stats, TraitChangeFeedback } from '../types';
import {
  applyBuffSlotPolicy,
  createConsumableBuff,
  getConsumableConfigByItemId,
  isConsumableItemId,
  applySkillUpdates,
  applySkillsToHubAction,
  checkTraitFormation,
  getMaxEnergy,
  resolveTraitChanges,
} from '../utils/gameUtils';
import { calculateEndingErrorDebt } from '../utils/endingResolver';
import { applyPersonalityEffects, getPersonalityAxisName, updateStress } from '../utils/personalitySystem';
import { buildTraitChangeFeedback } from '../utils/traitFeedback';
import { BUFF_RULES, CONSUMABLE_CONFIG } from '../config/gameBalance';
import { isFeatureEnabled } from '../config/featureFlags';

const TURN_LIMITED_ACTIONS = new Set(['baby_eat', 'baby_sleep', 'ask_allowance']);
const BASE_MONEY_GAIN_MULTIPLIER_BY_WEALTH: Record<'MIDDLE' | 'RICH', number> = {
  MIDDLE: 1,
  RICH: 1.15,
};
const POOR_MONEY_GAIN_MULTIPLIER_BY_AGE: Array<{ maxAge: number; multiplier: number }> = [
  { maxAge: 7, multiplier: 0.55 },
  { maxAge: 12, multiplier: 0.57 },
  { maxAge: 99, multiplier: 0.6 },
];
const RICH_DIMINISHING_RETURN_THRESHOLD = 500;
const RICH_DIMINISHING_RETURN_MULTIPLIER = 0.95;
const FORCED_RECOVERY_PRIORITY = 950;
const POOR_RECOVERY_EVENT_IDS = [
  'econ_poor_scholarship_offer',
  'econ_poor_mentor_support',
  'econ_poor_community_aid',
] as const;
type PoorRecoveryEventId = typeof POOR_RECOVERY_EVENT_IDS[number];

const formatSignedAmount = (value: number): string => (
  value > 0 ? `+${value}` : `${value}`
);

const getStatLabel = (key: string): string => {
  const knownStats = new Set([
    'health',
    'energy',
    'intelligence',
    'charisma',
    'discipline',
    'money',
    'familyRelation',
  ]);

  if (!knownStats.has(key)) return key;
  return tRuntime(`labels.stats.${key}`, undefined, key);
};

const getGradeLabel = (subject: keyof SchoolGrades): string => (
  tRuntime(`exams.reportCard.subjects.${subject}`, undefined, String(subject))
);

type ActionResultStatus = 'success' | 'blocked' | 'open_exam';
type ActionErrorType =
  | 'ALREADY_USED_THIS_TURN'
  | 'NOT_ENOUGH_ENERGY'
  | 'NOT_ENOUGH_MONEY'
  | 'MISSING_REQUIRED_ITEM'
  | 'ALREADY_OWNED_ITEM'
  | 'AGE_LOCKED'
  | 'FEATURE_LOCKED'
  | 'CONSUMABLE_COOLDOWN'
  | 'CONSUMABLE_LIMIT_REACHED'
  | 'BUFF_CAP_REACHED';

export interface ActionCommand {
  execute(context: ActionContext): ActionResult;
}

export interface ActionContext {
  action: SubAction;
  currentStats: Stats;
  gameState: GameState;
}

export interface ActionResult {
  status: ActionResultStatus;
  newStats: Stats;
  gameStateUpdates: Partial<GameState>;
  feedbackMessage: string;
  traitProgressUpdates: string[];
  newTraits: string[];
  removedTraits?: string[];
  traitChanges?: TraitChangeFeedback[];
  adjustedEnergyCost: number;
  totalSkillGain: number;
  opensExamGame?: ExamGameType;
  errorType?: ActionErrorType;
}

export class HubActionCommand implements ActionCommand {
  execute(context: ActionContext): ActionResult {
    const { action, currentStats, gameState } = context;

    if (TURN_LIMITED_ACTIONS.has(action.id)) {
      const alreadyUsedThisTurn = (gameState.actionHistory || []).some(
        entry => entry.turn === gameState.turn && entry.actionId === action.id
      );
      if (alreadyUsedThisTurn) {
        return this.createBlockedResult(
          currentStats,
          tRuntime('actions.runtime.blocked.alreadyUsedThisTurn'),
          'ALREADY_USED_THIS_TURN'
        );
      }
    }

    const ownedItems = getEffectiveOwnedItems(gameState.inventory || [], gameState.family?.wealth);
    const requiredAge = getActionEffectiveMinAge(action, ownedItems);

    if (requiredAge !== undefined && gameState.age < requiredAge) {
      return this.createBlockedResult(
        currentStats,
        tRuntime('actions.runtime.blocked.ageLocked', { age: requiredAge }),
        'AGE_LOCKED'
      );
    }

    const missingRequiredItem = (action.requiredItemIds || []).find(itemId => !ownedItems.includes(itemId));
    if (missingRequiredItem) {
      const missingItemName = getItemName(missingRequiredItem);
      return this.createBlockedResult(
        currentStats,
        tRuntime('actions.runtime.blocked.missingRequiredItem', { itemName: missingItemName }),
        'MISSING_REQUIRED_ITEM'
      );
    }

    const purchasedItem = action.purchaseItemId ? getItem(action.purchaseItemId) : undefined;
    const isConsumablePurchase = purchasedItem?.type === 'CONSUMABLE';
    const consumableFeatureEnabled = isFeatureEnabled('CONSUMABLE_ITEMS');

    if (isConsumablePurchase && !consumableFeatureEnabled) {
      return this.createBlockedResult(
        currentStats,
        tRuntime('actions.runtime.blocked.featureLocked'),
        'FEATURE_LOCKED'
      );
    }

    if (
      action.purchaseItemId &&
      purchasedItem?.type !== 'CONSUMABLE' &&
      ownedItems.includes(action.purchaseItemId)
    ) {
      const itemName = action.purchaseItemId ? getItemName(action.purchaseItemId) : tRuntime('actions.sheet.requiredItemFallback');
      return this.createBlockedResult(
        currentStats,
        tRuntime('actions.runtime.blocked.alreadyOwnedItem', { itemName }),
        'ALREADY_OWNED_ITEM'
      );
    }

    const baseEffect = resolveActionEffectForFamily(action, gameState.family?.wealth);
    const adjusted = applySkillsToHubAction(
      action.id,
      baseEffect,
      action.energyCost,
      action.gradeUpdates as Partial<SchoolGrades> | undefined,
      gameState.skills,
      gameState.actionHistory || []
    );
    const adjustedEnergyCost = adjusted.energyCost;
    const adjustedEffect = adjusted.effect;
    const adjustedGrades = adjusted.gradeUpdates;

    const currentActiveBuffs = [...(gameState.activeBuffs || [])];
    const currentCooldowns = { ...(gameState.consumableCooldowns || {}) };
    const currentUsage = { ...(gameState.consumableUsageThisTurn || {}) };
    let nextActiveBuffs = currentActiveBuffs;
    let nextCooldowns = currentCooldowns;
    let nextUsage = currentUsage;
    let consumableFeedback: string | null = null;
    let tutorBoostedSubject: keyof SchoolGrades | null = null;

    if (isConsumablePurchase && action.purchaseItemId && isConsumableItemId(action.purchaseItemId)) {
      const consumableConfig = getConsumableConfigByItemId(action.purchaseItemId);
      const cooldownRemaining = nextCooldowns[action.purchaseItemId] || 0;
      if (cooldownRemaining > 0) {
        const itemName = getItemName(action.purchaseItemId);
        return this.createBlockedResult(
          currentStats,
          tRuntime('actions.runtime.blocked.consumableCooldown', {
            itemName,
            turns: cooldownRemaining,
          }),
          'CONSUMABLE_COOLDOWN'
        );
      }

      if ('maxPerTurn' in consumableConfig) {
        const usedThisTurn = nextUsage[action.purchaseItemId] || 0;
        if (usedThisTurn >= consumableConfig.maxPerTurn) {
          const itemName = getItemName(action.purchaseItemId);
          return this.createBlockedResult(
            currentStats,
            tRuntime('actions.runtime.blocked.consumableLimitReached', { itemName }),
            'CONSUMABLE_LIMIT_REACHED'
          );
        }
      }

      if (action.purchaseItemId === 'item_investment') {
        const activeInvestmentCount = currentActiveBuffs.filter(buff => buff.itemId === 'item_investment').length;
        if (activeInvestmentCount >= BUFF_RULES.investmentMaxActive) {
          return this.createBlockedResult(
            currentStats,
            tRuntime('actions.runtime.blocked.investmentLimitReached'),
            'CONSUMABLE_LIMIT_REACHED'
          );
        }
      }

      const candidateBuff = createConsumableBuff(action.purchaseItemId, gameState.turn);
      if (candidateBuff) {
        const slotResult = applyBuffSlotPolicy(currentActiveBuffs, candidateBuff);
        if (!slotResult.accepted) {
          return this.createBlockedResult(
            currentStats,
            tRuntime('actions.runtime.blocked.buffCapReached', { count: BUFF_RULES.maxActiveBuffs }),
            'BUFF_CAP_REACHED'
          );
        }
        nextActiveBuffs = slotResult.nextActiveBuffs;
      }

      if ('cooldownTurns' in consumableConfig && consumableConfig.cooldownTurns > 0) {
        nextCooldowns = {
          ...nextCooldowns,
          [action.purchaseItemId]: consumableConfig.cooldownTurns,
        };
      }

      nextUsage = {
        ...nextUsage,
        [action.purchaseItemId]: (nextUsage[action.purchaseItemId] || 0) + 1,
      };

      if (action.purchaseItemId === 'item_energy_drink') {
        consumableFeedback = tRuntime('actions.runtime.consumables.energyDrink', {
          amount: CONSUMABLE_CONFIG.energyDrink.effect,
        });
      } else if (action.purchaseItemId === 'item_tutor_session') {
        consumableFeedback = tRuntime('actions.runtime.consumables.tutorSession', {
          amount: CONSUMABLE_CONFIG.tutorSession.gradeBoost,
        });
      } else if (action.purchaseItemId === 'item_gym_pass') {
        consumableFeedback = tRuntime('actions.runtime.consumables.gymPass', {
          duration: CONSUMABLE_CONFIG.gymPass.duration,
        });
      } else if (action.purchaseItemId === 'item_fashion_outfit') {
        consumableFeedback = tRuntime('actions.runtime.consumables.fashionOutfit', {
          duration: CONSUMABLE_CONFIG.fashionOutfit.duration,
        });
      } else if (action.purchaseItemId === 'item_investment') {
        consumableFeedback = tRuntime('actions.runtime.consumables.investment', {
          duration: CONSUMABLE_CONFIG.investment.duration,
          amount: CONSUMABLE_CONFIG.investment.returnAmount,
        });
      }
    }

    if (currentStats.energy < adjustedEnergyCost) {
      return this.createBlockedResult(
        currentStats,
        tRuntime('actions.runtime.blocked.notEnoughEnergy'),
        'NOT_ENOUGH_ENERGY',
        adjustedEnergyCost
      );
    }

    const requiredMoney = adjustedEffect.money !== undefined && adjustedEffect.money < 0
      ? Math.abs(adjustedEffect.money)
      : 0;
    if (requiredMoney > currentStats.money) {
      return this.createBlockedResult(
        currentStats,
        tRuntime('actions.runtime.blocked.notEnoughMoney', { amount: requiredMoney }),
        'NOT_ENOUGH_MONEY',
        adjustedEnergyCost
      );
    }

    if (action.opensExamGame) {
      return {
        status: 'open_exam',
        newStats: currentStats,
        gameStateUpdates: {},
        feedbackMessage: action.feedback,
        traitProgressUpdates: [],
        newTraits: [],
        removedTraits: [],
        traitChanges: [],
        adjustedEnergyCost,
        totalSkillGain: 0,
        opensExamGame: action.opensExamGame,
      };
    }

    const allowanceOutcome = action.id === 'ask_allowance'
      ? this.resolveAllowanceOutcome(currentStats, gameState)
      : null;
    const feedbackBase = allowanceOutcome?.feedback ?? action.feedback;

    let effectiveEffect: Partial<Stats> = { ...adjustedEffect };
    if (allowanceOutcome) {
      effectiveEffect.money = allowanceOutcome.money;
      if (allowanceOutcome.familyRelationDelta !== 0) {
        effectiveEffect.familyRelation = (effectiveEffect.familyRelation ?? 0) + allowanceOutcome.familyRelationDelta;
      }
    }
    if (adjustedEnergyCost > 0 && (effectiveEffect.energy === undefined || effectiveEffect.energy < 0)) {
      effectiveEffect.energy = -adjustedEnergyCost;
    }

    if (isConsumablePurchase && action.purchaseItemId === 'item_energy_drink') {
      effectiveEffect.energy = (effectiveEffect.energy || 0) + CONSUMABLE_CONFIG.energyDrink.effect;
    }

    const bonusAdjusted = this.applyItemBonuses(
      action,
      ownedItems,
      effectiveEffect,
      action.skillUpdates
    );
    effectiveEffect = bonusAdjusted.effect;
    effectiveEffect = this.applyFamilyWealthEconomy(action.id, effectiveEffect, gameState, currentStats.money);
    const effectiveSkillUpdates = bonusAdjusted.skillUpdates;

    const momentumResult = applyMomentumSignal(
      gameState.personalityState,
      resolveMomentumSignal({
        momentumTag: action.momentumTag,
        personalityEffects: action.personalityEffects,
        statEffect: effectiveEffect,
      })
    );

    let statsAfterAction = currentStats;
    const burdenRisk = calculateEndingErrorDebt(gameState, currentStats).total;
    if (Object.keys(effectiveEffect).length > 0) {
      const statResult = StatEngine.applyChanges(currentStats, effectiveEffect, {
        age: gameState.age,
        family: gameState.family,
        traits: gameState.traits,
        personalityState: momentumResult.nextState,
        burdenRisk,
      });
      statsAfterAction = statResult.newStats;
    }

    const skillResult = effectiveSkillUpdates
      ? applySkillUpdates(gameState.skills, effectiveSkillUpdates, gameState.traits)
      : { newSkills: gameState.skills, appliedChanges: {} };
    const nextSkills = skillResult.newSkills;

    const nextStress = action.stressEffect !== undefined
      ? updateStress(gameState.stress, action.stressEffect, tRuntime('ui.statusHeader.stressSourceAction'), gameState.turn)
      : gameState.stress;
    let nextPersonality = gameState.personality;
    let personalityShifts: PersonalityShift[] = [];

    if (action.personalityEffects && action.personalityEffects.length > 0) {
      const personalityResult = applyPersonalityEffects(
        gameState.personality,
        action.personalityEffects,
        gameState.age,
        gameState.turn,
        `Hub Action: ${action.id}`
      );
      nextPersonality = personalityResult.newPersonality;
      personalityShifts = personalityResult.shifts;
    }

    const newGrades = { ...gameState.schoolGrades };
    if (adjustedGrades) {
      Object.entries(adjustedGrades).forEach(([subject, value]) => {
        if (typeof value !== 'number') return;
        const key = subject as keyof SchoolGrades;
        newGrades[key] = Math.min(100, Math.max(0, newGrades[key] + value));
      });
    }
    if (isConsumablePurchase && action.purchaseItemId === 'item_tutor_session') {
      const subjectPool = Object.keys(newGrades) as Array<keyof SchoolGrades>;
      const randomSubject = subjectPool[Math.floor(Math.random() * subjectPool.length)];
      newGrades[randomSubject] = Math.min(
        100,
        Math.max(0, newGrades[randomSubject] + CONSUMABLE_CONFIG.tutorSession.gradeBoost)
      );
      tutorBoostedSubject = randomSubject;
    }
    const nextGrades = newGrades;

    const traitResult = checkTraitFormation(
      action.id,
      null,
      gameState,
      statsAfterAction
    );
    const traitResolution = resolveTraitChanges({
      currentTraits: gameState.traits,
      gainedTraits: traitResult.newTraits,
      removedTraits: traitResult.removedTraits,
    });
    const nextTraitProgress = { ...traitResult.updatedProgress };
    [...traitResolution.gainedTraits, ...traitResolution.removedTraits].forEach(traitId => {
      if (nextTraitProgress[traitId]) {
        delete nextTraitProgress[traitId];
      }
    });
    const nextMaxEnergy = getMaxEnergy(gameState.age, gameState.family, traitResolution.traits);
    const finalStats = statsAfterAction.energy > nextMaxEnergy
      ? { ...statsAfterAction, energy: nextMaxEnergy }
      : statsAfterAction;
    const traitChanges = buildTraitChangeFeedback(
      traitResolution.gainedTraits,
      traitResolution.removedTraits
    );

    const historyEntry = {
      id: `log_${Date.now()}`,
      age: gameState.age,
      message: feedbackBase,
      type: (action.effect?.health ?? 0) > 0 ? 'positive' as const : 'neutral' as const,
    };
    const nextActionHistory = [
      ...(gameState.actionHistory || []),
      { actionId: action.id, age: gameState.age, turn: gameState.turn },
    ];

    const statChanges: string[] = [];
    if (Object.keys(effectiveEffect).length > 0) {
      Object.entries(effectiveEffect).forEach(([key, value]) => {
        if (typeof value !== 'number' || value === 0) return;
        statChanges.push(`${getStatLabel(key)} ${formatSignedAmount(value)}`);
      });
    }
    if (action.stressEffect !== undefined && action.stressEffect !== 0) {
      statChanges.push(
        tRuntime('actions.runtime.stressChange', { amount: formatSignedAmount(action.stressEffect) })
      );
    }
    if (personalityShifts.length > 0) {
      personalityShifts.forEach(shift => {
        const delta = shift.newValue - shift.oldValue;
        if (delta === 0) return;
        statChanges.push(
          `${tRuntime(`labels.personality.${shift.axis}`, undefined, getPersonalityAxisName(shift.axis))} ${formatSignedAmount(delta)}`
        );
      });
    }

    const feedbackMessage = statChanges.length > 0
      ? `${feedbackBase}\n\n${statChanges.join(' | ')}`
      : feedbackBase;
    const recoverySchedule = this.maybeSchedulePoorRecoveryEvent(action.id, gameState, finalStats.money);
    let finalFeedbackMessage = recoverySchedule
      ? `${feedbackMessage}\n\n${recoverySchedule.feedback}`
      : feedbackMessage;
    if (consumableFeedback) {
      finalFeedbackMessage = `${finalFeedbackMessage}\n\n${consumableFeedback}`;
    }
    if (tutorBoostedSubject) {
      finalFeedbackMessage = `${finalFeedbackMessage}\n${tRuntime('actions.runtime.consumables.tutorBoost', {
        subject: getGradeLabel(tutorBoostedSubject),
        amount: CONSUMABLE_CONFIG.tutorSession.gradeBoost,
      })}`;
    }

    const totalSkillGain = effectiveSkillUpdates
      ? Object.values(effectiveSkillUpdates).reduce(
        (sum, value) => sum + (typeof value === 'number' ? value : 0),
        0
      )
      : 0;

    const shouldAddPurchasedItemToInventory = Boolean(
      action.purchaseItemId && purchasedItem?.type !== 'CONSUMABLE'
    );
    const nextInventory = shouldAddPurchasedItemToInventory && action.purchaseItemId
      ? Array.from(new Set([...(gameState.inventory || []), action.purchaseItemId]))
      : gameState.inventory;
    const nextPurchasedItems = shouldAddPurchasedItemToInventory && action.purchaseItemId
      ? Array.from(new Set([...(gameState.purchasedItems || []), action.purchaseItemId]))
      : (gameState.purchasedItems || []);

    return {
      status: 'success',
      newStats: finalStats,
      gameStateUpdates: {
        historyLog: [...gameState.historyLog, historyEntry],
        actionHistory: nextActionHistory,
        skills: nextSkills,
        schoolGrades: nextGrades,
        traits: traitResolution.traits,
        traitProgress: nextTraitProgress,
        maxEnergy: nextMaxEnergy,
        stress: nextStress,
        personality: nextPersonality,
        personalityHistory: [...gameState.personalityHistory, ...personalityShifts],
        personalityState: momentumResult.nextState,
        dailyDecisionCount: (gameState.dailyDecisionCount ?? 0) + 1,
        ...(shouldAddPurchasedItemToInventory ? { inventory: nextInventory } : {}),
        ...(shouldAddPurchasedItemToInventory ? { purchasedItems: nextPurchasedItems } : {}),
        ...(isConsumablePurchase
          ? {
              activeBuffs: nextActiveBuffs,
              consumableCooldowns: nextCooldowns,
              consumableUsageThisTurn: nextUsage,
            }
          : {}),
        ...(recoverySchedule ? { scheduledEvents: recoverySchedule.scheduledEvents } : {}),
      },
      feedbackMessage: finalFeedbackMessage,
      traitProgressUpdates: traitResult.progressUpdates,
      newTraits: traitResolution.gainedTraits,
      removedTraits: traitResolution.removedTraits,
      traitChanges,
      adjustedEnergyCost,
      totalSkillGain,
    };
  }

  private applyItemBonuses(
    action: SubAction,
    ownedItems: string[],
    effect: Partial<Stats>,
    skillUpdates?: Partial<Skills>
  ): { effect: Partial<Stats>; skillUpdates?: Partial<Skills> } {
    const nextEffect: Partial<Stats> = { ...effect };
    const nextSkillUpdates = skillUpdates ? { ...skillUpdates } : undefined;

    const scaleSkillGain = (skillKey: keyof Skills, multiplier: number) => {
      if (!nextSkillUpdates) return;
      const value = nextSkillUpdates[skillKey];
      if (typeof value !== 'number' || value <= 0) return;
      nextSkillUpdates[skillKey] = Math.ceil(value * multiplier);
    };

    if (action.id === 'arts_draw' && ownedItems.includes('item_art_set')) {
      scaleSkillGain('art', 1.5);
    }

    if ((action.id === 'study_book' || action.id === 'family_story') && ownedItems.includes('item_story_book')) {
      scaleSkillGain('reading', 2);
    }

    if (ownedItems.includes('item_computer')) {
      scaleSkillGain('coding', 1.5);
      scaleSkillGain('design', 1.5);
    }

    if (ownedItems.includes('item_instrument')) {
      scaleSkillGain('music', 1.5);
    }

    if (action.id.startsWith('sports_') && ownedItems.includes('item_sports_gear')) {
      Object.entries(nextEffect).forEach(([key, value]) => {
        if (typeof value !== 'number' || value <= 0) return;
        if (key === 'energy' || key === 'money') return;
        nextEffect[key as keyof Stats] = Math.ceil(value * 1.2);
      });

      if (nextSkillUpdates) {
        Object.entries(nextSkillUpdates).forEach(([key, value]) => {
          if (typeof value !== 'number' || value <= 0) return;
          nextSkillUpdates[key as keyof Skills] = Math.ceil(value * 1.2);
        });
      }
    }

    return { effect: nextEffect, skillUpdates: nextSkillUpdates };
  }

  private resolveAllowanceOutcome(
    currentStats: Stats,
    gameState: GameState
  ): { money: number; familyRelationDelta: number; feedback: string } {
    const family = gameState.family;
    if (!family) {
      return {
        money: 0,
        familyRelationDelta: 0,
        feedback: tRuntime('actions.runtime.allowance.noFamily'),
      };
    }

    const wealthAllowanceMultiplier = family.wealth === 'POOR'
      ? 0.4
      : family.wealth === 'RICH'
        ? 1.15
        : 1;
    const baseAllowance = Math.max(0, Math.round((family.allowance || 0) * wealthAllowanceMultiplier));
    const charismaBonus = currentStats.charisma > 60 ? 1.2 : 1;
    const relationPenalty = currentStats.familyRelation < 30
      ? (family.wealth === 'POOR' ? 0.3 : 0.5)
      : 1;
    const roll = Math.random();
    const hardshipRollBlocked = family.wealth === 'POOR' && roll < 0.4;

    if (hardshipRollBlocked) {
      return {
        money: 0,
        familyRelationDelta: -1,
        feedback: tRuntime('actions.runtime.allowance.poorBlocked'),
      };
    }

    if (family.dynamic === 'STRICT') {
      if (roll < (family.wealth === 'POOR' ? 0.75 : 0.5)) {
        return {
          money: 0,
          familyRelationDelta: -1,
          feedback: tRuntime('actions.runtime.allowance.strictRejected'),
        };
      }

      return {
        money: Math.max(0, Math.round(baseAllowance * 0.8 * relationPenalty)),
        familyRelationDelta: 0,
        feedback: tRuntime('actions.runtime.allowance.strictGranted'),
      };
    }

    if (family.dynamic === 'SUPPORTIVE') {
      if (roll < 0.8) {
        return {
          money: Math.max(0, Math.round(baseAllowance * charismaBonus * relationPenalty)),
          familyRelationDelta: 1,
          feedback: tRuntime('actions.runtime.allowance.supportiveGranted'),
        };
      }

      return {
        money: 0,
        familyRelationDelta: 0,
        feedback: tRuntime('actions.runtime.allowance.supportiveNoMoney'),
      };
    }

    if (roll < 0.3) {
      return {
        money: Math.max(0, Math.round(baseAllowance * 1.5 * relationPenalty)),
        familyRelationDelta: 0,
        feedback: tRuntime('actions.runtime.allowance.chaoticHigh'),
      };
    }

    if (roll < 0.7) {
      return {
        money: Math.max(0, Math.round(baseAllowance * 0.5 * relationPenalty)),
        familyRelationDelta: 0,
        feedback: tRuntime('actions.runtime.allowance.chaoticLow'),
      };
    }

    return {
      money: 0,
      familyRelationDelta: -1,
      feedback: tRuntime('actions.runtime.allowance.chaoticForgot'),
    };
  }

  private applyFamilyWealthEconomy(
    actionId: string,
    effect: Partial<Stats>,
    gameState: GameState,
    currentMoney: number
  ): Partial<Stats> {
    const family = gameState.family;
    if (!family) return effect;
    const baseMoneyDelta = typeof effect.money === 'number' ? effect.money : 0;
    const upkeepCost = this.resolvePoorUpkeepCost(family.wealth, gameState.age, actionId);
    let adjustedMoney = baseMoneyDelta - upkeepCost;

    if (adjustedMoney > 0) {
      const wealthMultiplier = this.resolveMoneyGainMultiplier(
        family.wealth,
        gameState.age,
        currentMoney
      );
      const sourceMultiplier = actionId.startsWith('work_') ? 1 : 0.85;
      adjustedMoney = Math.max(1, Math.round(adjustedMoney * wealthMultiplier * sourceMultiplier));
    }

    if (typeof effect.money !== 'number' && adjustedMoney === 0) {
      return effect;
    }

    return {
      ...effect,
      money: adjustedMoney,
    };
  }

  private resolveMoneyGainMultiplier(
    wealth: FamilyWealth,
    age: number,
    currentMoney: number
  ): number {
    if (wealth === 'POOR') {
      return this.resolvePoorMoneyGainMultiplier(age);
    }

    if (wealth === 'RICH') {
      if (currentMoney >= RICH_DIMINISHING_RETURN_THRESHOLD) {
        return RICH_DIMINISHING_RETURN_MULTIPLIER;
      }
      return BASE_MONEY_GAIN_MULTIPLIER_BY_WEALTH.RICH;
    }

    return BASE_MONEY_GAIN_MULTIPLIER_BY_WEALTH.MIDDLE;
  }

  private resolvePoorMoneyGainMultiplier(age: number): number {
    const ageBand = POOR_MONEY_GAIN_MULTIPLIER_BY_AGE.find(entry => age <= entry.maxAge);
    return ageBand?.multiplier ?? 0.55;
  }

  private resolvePoorUpkeepCost(
    wealth: FamilyWealth,
    age: number,
    actionId: string
  ): number {
    if (wealth !== 'POOR' || actionId === 'ask_allowance') return 0;
    if (age <= 12) return 0;
    if (age <= 15) return 1;
    return 2;
  }

  private maybeSchedulePoorRecoveryEvent(
    actionId: string,
    gameState: GameState,
    moneyAfterAction: number
  ): { scheduledEvents: GameState['scheduledEvents']; feedback: string } | null {
    const family = gameState.family;
    if (!family || family.wealth !== 'POOR') return null;
    if (gameState.age < 8) return null;
    if (moneyAfterAction > this.resolvePoorRecoveryMoneyThreshold(gameState.age)) return null;

    const scheduledEvents = gameState.scheduledEvents || [];
    const hasPendingRecovery = scheduledEvents.some(evt =>
      POOR_RECOVERY_EVENT_IDS.includes(evt.eventId as PoorRecoveryEventId)
    );
    if (hasPendingRecovery) return null;

    const seenEvents = new Set(gameState.eventChoiceHistory || []);
    const nextRecoveryEventId = POOR_RECOVERY_EVENT_IDS.find(eventId => !seenEvents.has(eventId));
    if (!nextRecoveryEventId) return null;

    const triggerChance = this.resolvePoorRecoveryTriggerChance(gameState.age, moneyAfterAction);
    if (Math.random() > triggerChance) return null;

    return {
      scheduledEvents: [
        ...scheduledEvents,
        {
          id: `scheduled_${nextRecoveryEventId}_${gameState.turn}_${Date.now().toString(36)}`,
          eventId: nextRecoveryEventId,
          remainingTurns: 0,
          priority: FORCED_RECOVERY_PRIORITY,
          sourceEventId: actionId,
        },
      ],
      feedback: tRuntime('actions.runtime.poorRecoveryOpened'),
    };
  }

  private resolvePoorRecoveryTriggerChance(age: number, moneyAfterAction: number): number {
    let chance = age <= 11 ? 0.24 : age <= 15 ? 0.2 : 0.16;
    if (moneyAfterAction <= 30) {
      chance += 0.14;
    } else if (moneyAfterAction <= 70) {
      chance += 0.08;
    }
    return Math.min(0.45, chance);
  }

  private resolvePoorRecoveryMoneyThreshold(age: number): number {
    if (age <= 11) return 110;
    if (age <= 15) return 150;
    return 190;
  }

  private createBlockedResult(
    stats: Stats,
    feedbackMessage: string,
    errorType: ActionErrorType,
    adjustedEnergyCost = 0
  ): ActionResult {
    return {
      status: 'blocked',
      newStats: stats,
      gameStateUpdates: {},
      feedbackMessage,
      traitProgressUpdates: [],
      newTraits: [],
      removedTraits: [],
      traitChanges: [],
      adjustedEnergyCost,
      totalSkillGain: 0,
      errorType,
    };
  }
}
