/**
 * Analytics event helpers.
 */

import { analyticsService } from '../services/analytics';
import { EventRarity } from '../types';
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

  console.log('[analytics] game_started');
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

  await analyticsService.setUserProperty('character_name', character.name);
  await analyticsService.setUserProperty('starting_wealth', character.wealth);

  console.log('[analytics] character_created');
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

  console.log(`[analytics] event_completed: ${event.name} choice=${choice.index}`);
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
    console.warn('Too young for work');
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

  console.log('[analytics] game_ended');
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

  console.log(`[analytics] purchase_made: ${productId} $${price}`);
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

// ============================================================================
// 9. USER SEGMENTATION
// ============================================================================

export const setupUserSegmentation = async (userId: string, gameVersion: string) => {
  await analyticsService.setUserId(userId);
  await analyticsService.setUserProperty('game_version', gameVersion);
  await analyticsService.setUserProperty('platform', 'mobile');
  await analyticsService.setUserProperty('install_date', new Date().toISOString());
};
