/**
 * Analytics event helpers.
 */

import { devLog } from './devLogger';
import { analyticsService } from '../services/analytics';
import { EventRarity, TraitChangeFeedback } from '../types';
import {
  buildProgressionCohortSnapshot,
  shouldLogRetentionCheckpoint,
} from './progressionAnalytics';

// ============================================================================
// 1. GAME START
// ============================================================================

export const handleGameStart = async (characterName: string, difficulty: 'easy' | 'normal' | 'hard') => {
  await analyticsService.logGameStarted({
    characterName,
    difficulty,
  });

  devLog.log('[analytics] game_started');
};

// ============================================================================
// 2. CHARACTER CREATION
// ============================================================================

interface CharacterData {
  name: string;
  wealth: number;
  talent: number;
  traits: string[];
  familyType: string;
}

export const handleCharacterCreation = async (character: CharacterData) => {
  await analyticsService.logCharacterCreated({
    wealth: character.wealth,
    talent: character.talent,
    traits: character.traits,
    familyType: character.familyType,
  });

  await analyticsService.setUserProperty('starting_wealth', character.wealth);

  devLog.log('[analytics] character_created');
};

// ============================================================================
// 3. EVENT COMPLETION
// ============================================================================

interface GameEvent {
  id: string;
  name: string;
  type: string;
  rarity?: EventRarity;
}

interface Choice {
  index: number;
  text: string;
  energyCost?: number;
}

interface ProgressionMeta {
  turn: number;
  totalTurns: number;
  currentEnergy: number;
  maxEnergy: number;
}

interface TurnProgressMeta {
  turn: number;
  totalTurns: number;
  maxEnergy: number;
  energySpent: number;
}

interface SessionProgressMeta extends ProgressionMeta {
  age: number;
  eventChoices: number;
}

export const handleEventChoice = async (
  event: GameEvent,
  choice: Choice,
  playerAge: number,
  progression?: ProgressionMeta
) => {
  await analyticsService.logEventCompleted({
    eventId: event.id,
    choiceIndex: choice.index,
    age: playerAge,
    eventType: event.type,
  });

  if (progression) {
    const snapshot = await buildProgressionCohortSnapshot({
      eventRarity: event.rarity,
      energyCost: choice.energyCost ?? 0,
      age: playerAge,
      turn: progression.turn,
      totalTurns: progression.totalTurns,
      currentEnergy: progression.currentEnergy,
      maxEnergy: progression.maxEnergy,
    });

    await analyticsService.logProgressionEconomy({
      source: 'event_choice',
      eventId: event.id,
      eventRarity: snapshot.eventRarity,
      energyCost: choice.energyCost ?? 0,
      energyCostBucket: snapshot.energyCostBucket,
      age: playerAge,
      agePacing: snapshot.agePacingBucket,
      turn: progression.turn,
      totalTurns: progression.totalTurns,
      currentEnergy: progression.currentEnergy,
      maxEnergy: progression.maxEnergy,
      daySinceInstall: snapshot.daySinceInstall,
      retentionCheckpoint: snapshot.retentionCheckpoint,
      cohortKey: snapshot.cohortKey,
    });
  }

  devLog.log(`[analytics] event_completed: ${event.name} choice=${choice.index}`);
};

// ============================================================================
// 4. HUB ACTIONS
// ============================================================================

export const logStudyAction = async (
  subject: 'math' | 'science' | 'language',
  playerAge: number,
  skillGain: number
) => {
  await analyticsService.logHubAction({
    actionType: `study_${subject}`,
    cost: 20,
    age: playerAge,
    skillGain,
  });
};

export const logSportsAction = async (
  playerAge: number,
  healthGain: number
) => {
  await analyticsService.logHubAction({
    actionType: 'sports',
    cost: 25,
    age: playerAge,
    skillGain: healthGain,
  });
};

export const logHubAction = async (
  actionType: string,
  energyCost: number,
  playerAge: number,
  skillGain: number = 0,
  progression?: ProgressionMeta
) => {
  await analyticsService.logHubAction({
    actionType,
    cost: energyCost,
    age: playerAge,
    skillGain,
  });

  if (progression) {
    const snapshot = await buildProgressionCohortSnapshot({
      energyCost,
      age: playerAge,
      turn: progression.turn,
      totalTurns: progression.totalTurns,
      currentEnergy: progression.currentEnergy,
      maxEnergy: progression.maxEnergy,
    });

    await analyticsService.logProgressionEconomy({
      source: 'hub_action',
      eventRarity: snapshot.eventRarity,
      energyCost,
      energyCostBucket: snapshot.energyCostBucket,
      age: playerAge,
      agePacing: snapshot.agePacingBucket,
      turn: progression.turn,
      totalTurns: progression.totalTurns,
      currentEnergy: progression.currentEnergy,
      maxEnergy: progression.maxEnergy,
      daySinceInstall: snapshot.daySinceInstall,
      retentionCheckpoint: snapshot.retentionCheckpoint,
      cohortKey: snapshot.cohortKey,
    });
  }
};

export const logWorkAction = async (
  jobType: string,
  playerAge: number,
  moneyGain: number
) => {
  if (playerAge < 14) {
    devLog.warn('Too young for work');
    return;
  }

  await analyticsService.logHubAction({
    actionType: `work_${jobType}`,
    cost: 30,
    age: playerAge,
    skillGain: moneyGain,
  });
};

export const logSocialAction = async (
  npcName: string,
  playerAge: number
) => {
  await analyticsService.logHubAction({
    actionType: `social_${npcName}`,
    cost: 15,
    age: playerAge,
  });
};

// ============================================================================
// 5. TURN ADVANCEMENT
// ============================================================================

interface PlayerStats {
  health: number;
  intelligence: number;
  charisma: number;
  discipline: number;
  money: number;
  energy: number;
}

export const logTurnProgress = async (
  playerAge: number,
  stats: PlayerStats,
  meta?: TurnProgressMeta
) => {
  if (playerAge % 5 === 0) {
    await analyticsService.logTurnAdvanced({
      age: playerAge,
      health: stats.health,
      money: stats.money,
      energy: stats.energy,
    });
  }

  if (!meta) return;

  const snapshot = await buildProgressionCohortSnapshot({
    energyCost: meta.energySpent,
    age: playerAge,
    turn: meta.turn,
    totalTurns: meta.totalTurns,
    currentEnergy: stats.energy,
    maxEnergy: meta.maxEnergy,
  });

  await analyticsService.logProgressionEconomy({
    source: 'turn_progress',
    eventRarity: snapshot.eventRarity,
    energyCost: meta.energySpent,
    energyCostBucket: snapshot.energyCostBucket,
    age: playerAge,
    agePacing: snapshot.agePacingBucket,
    turn: meta.turn,
    totalTurns: meta.totalTurns,
    currentEnergy: stats.energy,
    maxEnergy: meta.maxEnergy,
    daySinceInstall: snapshot.daySinceInstall,
    retentionCheckpoint: snapshot.retentionCheckpoint,
    cohortKey: snapshot.cohortKey,
  });
};

// ============================================================================
// 6. GAME ENDING
// ============================================================================

interface GameEndingData {
  age: number;
  stats: PlayerStats;
  playtimeMinutes: number;
  endingType: string;
}

export const logGameEnding = async (data: GameEndingData) => {
  await analyticsService.logGameEnded({
    finalAge: data.age,
    finalStats: {
      health: data.stats.health,
      intelligence: data.stats.intelligence,
      charisma: data.stats.charisma,
      discipline: data.stats.discipline,
      money: data.stats.money,
    },
    playtimeMinutes: data.playtimeMinutes,
    endingType: data.endingType,
  });

  await analyticsService.setUserProperty('final_age', data.age);
  await analyticsService.setUserProperty('playtime_minutes', data.playtimeMinutes);

  devLog.log('[analytics] game_ended');
};

// ============================================================================
// 7. PURCHASES
// ============================================================================

export const logPurchase = async (
  productId: string,
  price: number,
  category?: 'cosmetics' | 'boosts' | 'premium'
) => {
  await analyticsService.logPurchaseMade({
    productId,
    price,
    currency: 'USD',
    category: category || 'general',
  });

  devLog.log(`[analytics] purchase_made: ${productId} $${price}`);
};

export type MonetizationPlacement =
  | 'save_slots'
  | 'game_over_restart'
  | 'exam_prep'
  | 'energy_depleted'
  | 'crisis_recovery'
  | 'ending_alternative'
  | 'undo_choice'
  | 'age_transition'
  | 'settings'
  | 'legacy_bonus'
  | 'unknown';

type MonetizationFunnelStep =
  | 'view'
  | 'click'
  | 'purchase_attempt'
  | 'purchase_success'
  | 'purchase_fail';

const MONETIZATION_DASHBOARD_SCHEMA = {
  funnel: 'monetization_funnel',
  rewarded: 'monetization_rewarded',
  interstitial: 'monetization_interstitial',
} as const;

const toErrorCode = (errorMessage?: string | null): string => {
  if (!errorMessage) return 'none';
  const normalized = errorMessage
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!normalized) return 'unknown';
  return normalized.slice(0, 48);
};

const logMonetizationFunnel = async (meta: {
  placement: MonetizationPlacement;
  step: MonetizationFunnelStep;
  productId?: string;
  owned?: boolean;
  price?: number;
  currency?: string;
  category?: string;
  success?: boolean;
  errorMessage?: string | null;
  productCount?: number;
}) => {
  const payload: Record<string, unknown> = {
    placement: meta.placement,
    funnel_step: meta.step,
    product_id: meta.productId ?? 'none',
    product_count: meta.productCount ?? 0,
    price: meta.price ?? 0,
    currency: meta.currency ?? 'TRY',
    category: meta.category ?? 'general',
  };

  if (typeof meta.owned === 'boolean') payload.owned = meta.owned;
  if (typeof meta.success === 'boolean') payload.success = meta.success;
  if (meta.errorMessage !== undefined) payload.error_code = toErrorCode(meta.errorMessage);

  await logCustomEvent(MONETIZATION_DASHBOARD_SCHEMA.funnel, payload);
};

export const logShopViewed = async (meta: {
  placement: MonetizationPlacement;
  productCount?: number;
}) => {
  await logMonetizationFunnel({
    placement: meta.placement,
    step: 'view',
    productCount: meta.productCount,
  });
};

export const logShopProductClicked = async (meta: {
  placement: MonetizationPlacement;
  productId: string;
  owned: boolean;
  price?: number;
  currency?: string;
}) => {
  await logMonetizationFunnel({
    placement: meta.placement,
    step: 'click',
    productId: meta.productId,
    owned: meta.owned,
    price: meta.price,
    currency: meta.currency,
  });
};

export const logPurchaseAttempted = async (meta: {
  placement: MonetizationPlacement;
  productId: string;
  price?: number;
  currency?: string;
  category?: string;
}) => {
  await logMonetizationFunnel({
    placement: meta.placement,
    step: 'purchase_attempt',
    productId: meta.productId,
    price: meta.price,
    currency: meta.currency,
    category: meta.category,
  });
};

export const logPurchaseResult = async (meta: {
  placement: MonetizationPlacement;
  productId: string;
  success: boolean;
  price?: number;
  currency?: string;
  category?: string;
  errorMessage?: string | null;
}) => {
  await logMonetizationFunnel({
    placement: meta.placement,
    step: meta.success ? 'purchase_success' : 'purchase_fail',
    productId: meta.productId,
    price: meta.price,
    currency: meta.currency,
    category: meta.category,
    success: meta.success,
    errorMessage: meta.errorMessage,
  });
};

export const logRewardedAdRequested = async (meta: {
  placement: MonetizationPlacement;
  rewardType: 'energy' | 'intelligence' | 'money' | 'utility';
  remainingBefore?: number;
}) => {
  await logCustomEvent(MONETIZATION_DASHBOARD_SCHEMA.rewarded, {
    action: 'request',
    placement: meta.placement,
    reward_type: meta.rewardType,
    remaining_before: meta.remainingBefore ?? -1,
  });
};

export const logRewardedAdResult = async (meta: {
  placement: MonetizationPlacement;
  rewardType: 'energy' | 'intelligence' | 'money' | 'utility';
  success: boolean;
  amount?: number;
  remainingAfter?: number;
  errorMessage?: string | null;
}) => {
  await logCustomEvent(MONETIZATION_DASHBOARD_SCHEMA.rewarded, {
    action: 'result',
    placement: meta.placement,
    reward_type: meta.rewardType,
    success: meta.success,
    amount: meta.amount ?? 0,
    remaining_after: meta.remainingAfter ?? -1,
    error_code: toErrorCode(meta.errorMessage),
  });
};

export const logInterstitialOpportunity = async (meta: {
  placement: MonetizationPlacement;
}) => {
  await logCustomEvent(MONETIZATION_DASHBOARD_SCHEMA.interstitial, {
    action: 'opportunity',
    placement: meta.placement,
  });
};

export const logInterstitialResult = async (meta: {
  placement: MonetizationPlacement;
  shown: boolean;
  reason?: string;
}) => {
  await logCustomEvent(MONETIZATION_DASHBOARD_SCHEMA.interstitial, {
    action: 'result',
    placement: meta.placement,
    shown: meta.shown,
    reason: meta.reason ?? 'unknown',
  });
};

// ============================================================================
// 8. CUSTOM EVENTS
// ============================================================================

export const logCustomEvent = async (eventName: string, data?: Record<string, any>) => {
  await analyticsService.logCustomEvent(eventName, {
    ...data,
    timestamp: new Date().toISOString(),
  });
};

interface GoalAlignmentMeta {
  eventId: string;
  selectedGoal?: string | null;
  alignmentScore: number;
  age: number;
  turn: number;
}

export const logGoalAlignmentScore = async (meta: GoalAlignmentMeta) => {
  await logCustomEvent('goal_alignment_score', {
    event_id: meta.eventId,
    selected_goal: meta.selectedGoal ?? 'NONE',
    alignment_score: meta.alignmentScore,
    age: meta.age,
    turn: meta.turn,
  });
};

interface GoalActionUsedMeta {
  actionId: string;
  categoryId: string;
  selectedGoal?: string | null;
  age: number;
  turn: number;
}

export const logGoalActionUsed = async (meta: GoalActionUsedMeta) => {
  await logCustomEvent('goal_action_used', {
    action_id: meta.actionId,
    category_id: meta.categoryId,
    selected_goal: meta.selectedGoal ?? 'NONE',
    age: meta.age,
    turn: meta.turn,
  });
};

interface BurdenTriggerMeta {
  burdenRisk: number;
  age: number;
  turn: number;
  selectedGoal?: string | null;
}

export const logBurdenTrigger = async (meta: BurdenTriggerMeta) => {
  await logCustomEvent('burden_trigger', {
    burden_risk: meta.burdenRisk,
    age: meta.age,
    turn: meta.turn,
    selected_goal: meta.selectedGoal ?? 'NONE',
  });
};

interface MilestoneMeta {
  arcId: string;
  stage: number;
  selectedGoal?: string | null;
  age: number;
  turn: number;
}

export const logMilestoneReached = async (meta: MilestoneMeta) => {
  await logCustomEvent('milestone_reached', {
    arc_id: meta.arcId,
    stage: meta.stage,
    selected_goal: meta.selectedGoal ?? 'NONE',
    age: meta.age,
    turn: meta.turn,
  });
};

export const logTutorialTooltipShown = async (stepId: string) => {
  await logCustomEvent('tutorial_tooltip_shown', {
    step_id: stepId,
  });
};

export const logTutorialCompleted = async () => {
  await logCustomEvent('tutorial_completed', {
    tutorial_type: 'onboarding',
  });
};

export const logTutorialStepAdvanced = async (stepId: string, stepNumber: number) => {
  await logCustomEvent('tutorial_step_advanced', {
    step_id: stepId,
    step_number: stepNumber,
  });
};

export const logTutorialSkipped = async (atStepId: string, atStepNumber: number) => {
  await logCustomEvent('tutorial_skipped', {
    at_step_id: atStepId,
    at_step_number: atStepNumber,
  });
};

export const logAchievementUnlocked = async (achievementId: string) => {
  await logCustomEvent('achievement_unlocked', {
    achievement_id: achievementId,
  });
};

export const logTraitFormed = async (traitName: string, age: number) => {
  await logCustomEvent('trait_formed', {
    trait_name: traitName,
    age_when_formed: age,
  });
};

type TraitChangeSource = 'event_choice' | 'hub_action' | 'social_action';

interface TraitChangeAnalyticsMeta {
  source: TraitChangeSource;
  sourceId?: string;
  age: number;
  turn?: number;
}

export const logTraitChanges = async (
  changes: TraitChangeFeedback[],
  meta: TraitChangeAnalyticsMeta
) => {
  if (!changes || changes.length === 0) return;

  await Promise.all(
    changes.map(change => logCustomEvent('trait_change', {
      trait_id: change.traitId,
      change_type: change.changeType.toLowerCase(),
      source: meta.source,
      source_id: meta.sourceId ?? 'unknown',
      age: meta.age,
      turn: meta.turn ?? -1,
      guidance_shown: Boolean(change.guidance),
      conflict_resolved: change.changeType === 'REMOVED' && change.summary.includes('cakisma'),
    }))
  );
};

interface OnboardingCohortGuidanceMeta {
  sessionCount: number;
  cohort: string;
  objective: string;
  age: number;
  totalTurns: number;
}

export const logOnboardingCohortGuidance = async (meta: OnboardingCohortGuidanceMeta) => {
  await logCustomEvent('onboarding_cohort_guidance', {
    session_count: meta.sessionCount,
    cohort: meta.cohort,
    objective: meta.objective,
    age: meta.age,
    total_turns: meta.totalTurns,
  });
};

export const logSessionRetentionSnapshot = async (meta: SessionProgressMeta) => {
  const snapshot = await buildProgressionCohortSnapshot({
    energyCost: 0,
    age: meta.age,
    turn: meta.turn,
    totalTurns: meta.totalTurns,
    currentEnergy: meta.currentEnergy,
    maxEnergy: meta.maxEnergy,
  });

  await analyticsService.logProgressionEconomy({
    source: 'session_start',
    eventRarity: snapshot.eventRarity,
    energyCost: 0,
    energyCostBucket: snapshot.energyCostBucket,
    age: meta.age,
    agePacing: snapshot.agePacingBucket,
    turn: meta.turn,
    totalTurns: meta.totalTurns,
    currentEnergy: meta.currentEnergy,
    maxEnergy: meta.maxEnergy,
    daySinceInstall: snapshot.daySinceInstall,
    retentionCheckpoint: snapshot.retentionCheckpoint,
    cohortKey: snapshot.cohortKey,
  });

  const shouldLog = await shouldLogRetentionCheckpoint(snapshot.retentionCheckpoint);
  if (!shouldLog) return;
  if (snapshot.retentionCheckpoint !== 'D1' && snapshot.retentionCheckpoint !== 'D3') return;

  await analyticsService.logRetentionCheckpoint({
    checkpoint: snapshot.retentionCheckpoint,
    daySinceInstall: snapshot.daySinceInstall,
    age: meta.age,
    turn: meta.turn,
    totalTurns: meta.totalTurns,
    eventChoices: meta.eventChoices,
    cohortKey: snapshot.cohortKey,
  });
};

export const logSessionDropAnchor = async (meta: SessionProgressMeta) => {
  const snapshot = await buildProgressionCohortSnapshot({
    energyCost: 0,
    age: meta.age,
    turn: meta.turn,
    totalTurns: meta.totalTurns,
    currentEnergy: meta.currentEnergy,
    maxEnergy: meta.maxEnergy,
  });

  await analyticsService.logProgressionEconomy({
    source: 'session_end',
    eventRarity: snapshot.eventRarity,
    energyCost: 0,
    energyCostBucket: snapshot.energyCostBucket,
    age: meta.age,
    agePacing: snapshot.agePacingBucket,
    turn: meta.turn,
    totalTurns: meta.totalTurns,
    currentEnergy: meta.currentEnergy,
    maxEnergy: meta.maxEnergy,
    daySinceInstall: snapshot.daySinceInstall,
    retentionCheckpoint: snapshot.retentionCheckpoint,
    cohortKey: snapshot.cohortKey,
  });

  await analyticsService.logCustomEvent('retention_drop_anchor', {
    day_since_install: snapshot.daySinceInstall,
    retention_checkpoint: snapshot.retentionCheckpoint,
    cohort_key: snapshot.cohortKey,
    age: meta.age,
    turn: meta.turn,
    total_turns: meta.totalTurns,
    event_choices: meta.eventChoices,
    current_energy: meta.currentEnergy,
    max_energy: meta.maxEnergy,
  });
};

interface ShareEventMeta {
  tier: 'FAILURE' | 'NORMAL' | 'SUCCESS' | 'LEGENDARY';
  endingId: string;
  legacyLevel: number;
}

export const logShareEvent = async (meta: ShareEventMeta) => {
  await logCustomEvent('life_share_card', {
    tier: meta.tier,
    ending_id: meta.endingId,
    legacy_level: meta.legacyLevel,
  });
};

// ============================================================================
// 9. SESSION TRACKING
// ============================================================================

export const logSessionStart = async (params: {
  hoursSinceLastSession: number;
}) => {
  await logCustomEvent('session_start', params);
};

export const logSessionEnd = async (params: {
  sessionDurationMinutes: number;
  turnsPlayed: number;
  hadCliffhanger: boolean;
}) => {
  await logCustomEvent('session_end', params);
};

// ============================================================================
// 10. USER SEGMENTATION
// ============================================================================

export const setupUserSegmentation = async (userId: string, gameVersion: string) => {
  await analyticsService.setUserId(userId);
  await analyticsService.setUserProperty('game_version', gameVersion);
  await analyticsService.setUserProperty('platform', 'mobile');
  await analyticsService.setUserProperty('install_date', new Date().toISOString());
};
