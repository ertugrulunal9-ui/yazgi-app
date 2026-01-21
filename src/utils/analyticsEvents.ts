/**
 * Firebase Analytics Usage Examples
 * Yazgı Game Integration Patterns
 */

import { analyticsService } from '../services/analytics';

// ============================================================================
// 1. GAME START
// ============================================================================

export const handleGameStart = async (characterName: string, difficulty: 'easy' | 'normal' | 'hard') => {
  await analyticsService.logGameStarted({
    characterName,
    difficulty,
  });

  console.log('🎮 Game started - logged to Firebase');
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

  // Also set user properties for segmentation
  await analyticsService.setUserProperty('character_name', character.name);
  await analyticsService.setUserProperty('starting_wealth', character.wealth);

  console.log('👤 Character created - analytics logged');
};

// ============================================================================
// 3. EVENT COMPLETION (Most frequent event)
// ============================================================================

interface GameEvent {
  id: string;
  name: string;
  type: string;
}

interface Choice {
  index: number;
  text: string;
}

export const handleEventChoice = async (
  event: GameEvent,
  choice: Choice,
  playerAge: number
) => {
  await analyticsService.logEventCompleted({
    eventId: event.id,
    choiceIndex: choice.index,
    age: playerAge,
    eventType: event.type,
  });

  console.log(`📖 Event "${event.name}" completed with choice ${choice.index}`);
};

// ============================================================================
// 4. HUB ACTIONS (Study, Sports, Work, etc.)
// ============================================================================

export const logStudyAction = async (
  subject: 'math' | 'science' | 'language',
  playerAge: number,
  skillGain: number
) => {
  await analyticsService.logHubAction({
    actionType: `study_${subject}`,
    cost: 20, // Energy cost
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
    skillGain: moneyGain, // Can track money gained
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
// 5. TURN ADVANCEMENT (Track stats progression)
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
  stats: PlayerStats
) => {
  // Log every 5 turns to reduce data volume
  if (playerAge % 5 === 0) {
    await analyticsService.logTurnAdvanced({
      age: playerAge,
      health: stats.health,
      money: stats.money,
      energy: stats.energy,
    });
  }
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

  // Set final stats as user properties
  await analyticsService.setUserProperty('final_age', data.age);
  await analyticsService.setUserProperty('playtime_minutes', data.playtimeMinutes);

  console.log('🏁 Game ended - final stats logged');
};

// ============================================================================
// 7. PURCHASES (In-app monetization)
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

  console.log(`💳 Purchase logged: ${productId} - $${price}`);
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

// Examples:
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

// ============================================================================
// 9. USER SEGMENTATION
// ============================================================================

export const setupUserSegmentation = async (userId: string, gameVersion: string) => {
  await analyticsService.setUserId(userId);
  await analyticsService.setUserProperty('game_version', gameVersion);
  await analyticsService.setUserProperty('platform', 'mobile');
  await analyticsService.setUserProperty('install_date', new Date().toISOString());
};

// ============================================================================
// 10. INTEGRATION WITH APP.TSX
// ============================================================================

/**
 * Example App.tsx integration:
 * 
 * import React, { useEffect } from 'react';
 * import { NavigationContainer } from '@react-navigation/native';
 * import { analyticsService } from './services/analytics';
 * import * as Analytics from './utils/analyticsEvents';
 * 
 * export default function App() {
 *   useEffect(() => {
 *     // Initialize analytics
 *     Analytics.setupUserSegmentation('user-123', '1.0.0');
 *   }, []);
 * 
 *   const handleStartGame = async () => {
 *     await Analytics.handleGameStart('PlayerName', 'normal');
 *     // Navigate to game...
 *   };
 * 
 *   const handleGameEnd = async (gameData) => {
 *     await Analytics.logGameEnding({
 *       age: gameData.age,
 *       stats: gameData.stats,
 *       playtimeMinutes: gameData.playtime,
 *       endingType: gameData.ending,
 *     });
 *     // Navigate to end screen...
 *   };
 * 
 *   return (
 *     <NavigationContainer>
 *       // Your app UI...
 *     </NavigationContainer>
 *   );
 * }
 */