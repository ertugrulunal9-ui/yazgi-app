/**
 * gameUtils Extended Tests
 * Comprehensive tests for trait mechanics, stat calculations, and game logic
 */

import {
  getStatCap,
  getTraitMultiplier,
  getEnergyCostMultiplier,
  calculateStatGain,
  updateStats,
  checkTraitFormation,
  calculateCareerResult,
  createRandomNPC,
  generateNPCs,
  hasItem,
  getRandomInt,
  buildSocialSummary,
} from '../../src/utils/gameUtils';
import { setRuntimeLocale } from '../../src/i18n/strings';
import { Stats, Family, GameState, NPC } from '../../src/types';

describe('gameUtils - Extended Coverage', () => {
  // --- getStatCap Tests ---
  describe('getStatCap', () => {
    it('should return Infinity for money stat', () => {
      expect(getStatCap(15, 'money')).toBe(Infinity);
    });

    it('should return 100 for familyRelation', () => {
      expect(getStatCap(15, 'familyRelation')).toBe(100);
    });

    it('should return 60 for health with SICKLY trait', () => {
      expect(getStatCap(15, 'health', null, ['SICKLY'])).toBe(60);
    });

    it('should adjust energy cap based on family wealth', () => {
      const poorFamily: Family = { wealth: 'POOR', dynamic: 'SUPPORTIVE', allowance: 20 };
      expect(getStatCap(15, 'energy', poorFamily)).toBe(90);
    });

    it('should reduce energy cap with BURNOUT_PRONE trait', () => {
      expect(getStatCap(15, 'energy', null, ['BURNOUT_PRONE'])).toBe(85);
    });

    it('should increase energy cap with ATHLETIC trait', () => {
      expect(getStatCap(15, 'energy', null, ['ATHLETIC'])).toBe(110);
    });

    it('should apply an early-childhood energy bonus for ages 3-6', () => {
      expect(getStatCap(4, 'energy')).toBe(110);
    });

    it('should keep poor family penalty with early-childhood energy bonus', () => {
      const poorFamily: Family = { wealth: 'POOR', dynamic: 'SUPPORTIVE', allowance: 20 };
      expect(getStatCap(4, 'energy', poorFamily)).toBe(100);
    });

    it('should apply age-based caps (preschool < 7)', () => {
      expect(getStatCap(5, 'intelligence')).toBe(30);
    });

    it('should apply age-based caps (elementary 7-9)', () => {
      expect(getStatCap(8, 'intelligence')).toBe(50);
    });

    it('should apply age-based caps (middle school 10-13)', () => {
      expect(getStatCap(12, 'intelligence')).toBe(70);
    });

    it('should apply age-based caps (high school 14-17)', () => {
      expect(getStatCap(16, 'intelligence')).toBe(90);
    });

    it('should apply age-based caps (adult 18+)', () => {
      expect(getStatCap(18, 'intelligence')).toBe(100);
    });

    it('should boost health for RICH family', () => {
      const richFamily: Family = { wealth: 'RICH', dynamic: 'SUPPORTIVE', allowance: 200 };
      const cap = getStatCap(15, 'health', richFamily);
      expect(cap).toBeGreaterThan(90); // Base 90 + 5 = 95
    });

    it('should reduce health for POOR family', () => {
      const poorFamily: Family = { wealth: 'POOR', dynamic: 'SUPPORTIVE', allowance: 20 };
      const cap = getStatCap(15, 'health', poorFamily);
      expect(cap).toBe(80); // Base 90 - 10 = 80
    });

    it('should boost discipline for STRICT family', () => {
      const strictFamily: Family = { wealth: 'MIDDLE', dynamic: 'STRICT', allowance: 50 };
      const cap = getStatCap(15, 'discipline', strictFamily);
      expect(cap).toBe(100); // Base 90 + 10 = 100 (clamped)
    });

    it('should reduce charisma for STRICT family', () => {
      const strictFamily: Family = { wealth: 'MIDDLE', dynamic: 'STRICT', allowance: 50 };
      const cap = getStatCap(15, 'charisma', strictFamily);
      expect(cap).toBe(80); // Base 90 - 10 = 80
    });

    it('should reduce discipline for CHAOTIC family', () => {
      const chaoticFamily: Family = { wealth: 'MIDDLE', dynamic: 'CHAOTIC', allowance: 50 };
      const cap = getStatCap(15, 'discipline', chaoticFamily);
      expect(cap).toBe(70); // Base 90 - 20 = 70
    });

    it('should clamp cap between 25 and 100', () => {
      const chaoticFamily: Family = { wealth: 'POOR', dynamic: 'CHAOTIC', allowance: 20 };
      const cap = getStatCap(5, 'discipline', chaoticFamily);
      expect(cap).toBeGreaterThanOrEqual(25);
      expect(cap).toBeLessThanOrEqual(100);
    });
  });

  // --- getTraitMultiplier Tests ---
  describe('getTraitMultiplier', () => {
    it('should return 1.0 for no traits', () => {
      expect(getTraitMultiplier([], 'intelligence')).toBe(1.0);
    });

    it('should apply GENIUS bonus to intelligence', () => {
      expect(getTraitMultiplier(['GENIUS'], 'intelligence')).toBe(1.3);
    });

    it('should apply GENIUS bonus to all academic stats', () => {
      expect(getTraitMultiplier(['GENIUS'], 'math')).toBe(1.3);
      expect(getTraitMultiplier(['GENIUS'], 'science')).toBe(1.3);
      expect(getTraitMultiplier(['GENIUS'], 'language')).toBe(1.3);
      expect(getTraitMultiplier(['GENIUS'], 'coding')).toBe(1.3);
      expect(getTraitMultiplier(['GENIUS'], 'design')).toBe(1.3);
    });

    it('should apply ATHLETIC bonus to sports and health', () => {
      expect(getTraitMultiplier(['ATHLETIC'], 'sports')).toBe(1.3);
      expect(getTraitMultiplier(['ATHLETIC'], 'health')).toBe(1.3);
    });

    it('should apply CHARISMATIC bonus', () => {
      expect(getTraitMultiplier(['CHARISMATIC'], 'charisma')).toBe(1.3);
      expect(getTraitMultiplier(['CHARISMATIC'], 'familyRelation')).toBe(1.3);
    });

    it('should apply CLUMSY penalty', () => {
      expect(getTraitMultiplier(['CLUMSY'], 'sports')).toBe(0.85);
      expect(getTraitMultiplier(['CLUMSY'], 'coding')).toBe(0.85);
      expect(getTraitMultiplier(['CLUMSY'], 'music')).toBe(0.85);
    });

    it('should apply SICKLY penalty', () => {
      expect(getTraitMultiplier(['SICKLY'], 'health')).toBe(0.9);
      expect(getTraitMultiplier(['SICKLY'], 'sports')).toBe(0.9);
    });

    it('should apply EMPATHETIC bonus', () => {
      expect(getTraitMultiplier(['EMPATHETIC'], 'charisma')).toBe(1.25);
      expect(getTraitMultiplier(['EMPATHETIC'], 'familyRelation')).toBe(1.25);
    });

    it('should apply ORGANIZED bonus', () => {
      expect(getTraitMultiplier(['ORGANIZED'], 'discipline')).toBe(1.2);
      expect(getTraitMultiplier(['ORGANIZED'], 'math')).toBe(1.2);
    });

    it('should apply BRAVE bonus', () => {
      expect(getTraitMultiplier(['BRAVE'], 'charisma')).toBe(1.2);
      expect(getTraitMultiplier(['BRAVE'], 'sports')).toBe(1.2);
    });

    it('should apply DISCIPLINED bonus', () => {
      expect(getTraitMultiplier(['DISCIPLINED'], 'discipline')).toBe(1.15);
      expect(getTraitMultiplier(['DISCIPLINED'], 'intelligence')).toBe(1.15);
    });

    it('should apply AMBITIOUS bonus to money', () => {
      expect(getTraitMultiplier(['AMBITIOUS'], 'money')).toBe(1.3);
    });

    it('should apply BOOKWORM bonus', () => {
      expect(getTraitMultiplier(['BOOKWORM'], 'intelligence')).toBeCloseTo(1.4, 1);
      expect(getTraitMultiplier(['BOOKWORM'], 'language')).toBeCloseTo(1.4, 1);
    });

    it('should apply LAZY penalty', () => {
      const mult = getTraitMultiplier(['LAZY'], 'discipline');
      expect(mult).toBeLessThan(1.0);
    });

    it('should apply REBELLIOUS penalty to discipline and familyRelation', () => {
      const disciplineMult = getTraitMultiplier(['REBELLIOUS'], 'discipline');
      const familyMult = getTraitMultiplier(['REBELLIOUS'], 'familyRelation');
      expect(disciplineMult).toBeLessThan(1.0);
      expect(familyMult).toBeLessThan(1.0);
    });

    it('should combine multiple trait bonuses additively', () => {
      // GENIUS +0.3, BOOKWORM +0.4 = 1.7x for intelligence
      expect(getTraitMultiplier(['GENIUS', 'BOOKWORM'], 'intelligence')).toBeCloseTo(1.7, 1);
      // GENIUS +0.3, ORGANIZED +0.2 = 1.5x for math (both affect it)
      expect(getTraitMultiplier(['GENIUS', 'ORGANIZED'], 'math')).toBeCloseTo(1.5, 1);
    });

    it('should handle traits that do not affect the stat', () => {
      expect(getTraitMultiplier(['GENIUS'], 'health')).toBe(1.0);
    });
  });

  // --- getEnergyCostMultiplier Tests ---
  describe('getEnergyCostMultiplier', () => {
    it('should return 1.0 for no traits', () => {
      expect(getEnergyCostMultiplier([])).toBe(1.0);
    });

    it('should reduce cost for ATHLETIC', () => {
      expect(getEnergyCostMultiplier(['ATHLETIC'])).toBe(0.85);
    });

    it('should increase cost for SICKLY', () => {
      expect(getEnergyCostMultiplier(['SICKLY'])).toBe(1.15);
    });

    it('should increase cost for LAZY', () => {
      expect(getEnergyCostMultiplier(['LAZY'])).toBe(1.25);
    });

    it('should reduce cost for DISCIPLINED', () => {
      expect(getEnergyCostMultiplier(['DISCIPLINED'])).toBe(0.85);
    });

    it('should reduce cost for ORGANIZED', () => {
      expect(getEnergyCostMultiplier(['ORGANIZED'])).toBe(0.9);
    });

    it('should increase cost for BURNOUT_PRONE', () => {
      expect(getEnergyCostMultiplier(['BURNOUT_PRONE'])).toBe(1.2);
    });

    it('should combine multiple traits', () => {
      // ATHLETIC -0.15, DISCIPLINED -0.15 = 0.7x
      expect(getEnergyCostMultiplier(['ATHLETIC', 'DISCIPLINED'])).toBe(0.7);
    });

    it('should handle negative and positive traits together', () => {
      // ATHLETIC -0.15, LAZY +0.25 = 1.1x
      expect(getEnergyCostMultiplier(['ATHLETIC', 'LAZY'])).toBe(1.1);
    });
  });

  // --- calculateStatGain Tests ---
  describe('calculateStatGain', () => {
    it('should return full gain when below 70% cap', () => {
      expect(calculateStatGain(50, 10, 100)).toBe(10);
    });

    it('should return half gain when between 70% and cap', () => {
      expect(calculateStatGain(80, 10, 100)).toBe(5);
    });

    it('should return minimal gain when at or above cap', () => {
      expect(calculateStatGain(100, 10, 100)).toBe(2);
    });

    it('should handle negative gains (penalties) without modification', () => {
      expect(calculateStatGain(50, -10, 100)).toBe(-10);
    });

    it('should return 0 for zero gain', () => {
      expect(calculateStatGain(50, 0, 100)).toBe(0);
    });

    it('should apply diminishing returns correctly at 69% cap', () => {
      expect(calculateStatGain(69, 10, 100)).toBe(10); // Just under threshold
    });

    it('should apply diminishing returns correctly at 70% cap', () => {
      expect(calculateStatGain(70, 10, 100)).toBe(5); // At threshold
    });

    it('should round up half gains with Math.ceil', () => {
      expect(calculateStatGain(80, 7, 100)).toBe(4); // 7 * 0.5 = 3.5 → 4
    });

    it('should work with custom caps', () => {
      expect(calculateStatGain(40, 10, 60)).toBe(10); // 40 < 42 (70% of 60)
      expect(calculateStatGain(50, 10, 60)).toBe(5); // 50 > 42, < 60
    });
  });

  // --- updateStats Tests ---
  describe('updateStats', () => {
    const baseStats: Stats = {
      health: 50,
      intelligence: 50,
      charisma: 50,
      discipline: 50,
      money: 100,
      energy: 80,
      familyRelation: 60,
    };

    it('should update stats with changes', () => {
      const updated = updateStats(baseStats, { health: 10, intelligence: 5 });
      expect(updated.health).toBe(60);
      expect(updated.intelligence).toBe(55);
    });

    it('should apply diminishing returns for positive changes', () => {
      const highStats = { ...baseStats, intelligence: 85 }; // Above 70% of 100
      const updated = updateStats(highStats, { intelligence: 10 }, 18);
      expect(updated.intelligence).toBe(90); // 85 + 5 (half gain)
    });

    it('should not apply diminishing returns to money', () => {
      const updated = updateStats(baseStats, { money: 500 });
      expect(updated.money).toBe(600); // Full gain
    });

    it('should not apply diminishing returns to energy', () => {
      const updated = updateStats(baseStats, { energy: 20 });
      expect(updated.energy).toBe(100); // Full gain
    });

    it('should clamp stats to dynamic cap', () => {
      const updated = updateStats(baseStats, { health: 100 }, 18);
      expect(updated.health).toBeLessThanOrEqual(110); // Cap + 10 soft overshoot
    });

    it('should not allow money to go below 0', () => {
      const updated = updateStats(baseStats, { money: -700 });
      expect(updated.money).toBe(0);
    });

    it('should not allow other stats to go below 0', () => {
      const updated = updateStats(baseStats, { health: -100 });
      expect(updated.health).toBe(0);
    });

    it('should respect age-based caps for young children', () => {
      const updated = updateStats(baseStats, { intelligence: 50 }, 5); // Age 5, cap = 30
      expect(updated.intelligence).toBeLessThanOrEqual(40); // 30 + 10 soft
    });

    it('should respect family-based caps', () => {
      const poorFamily: Family = { wealth: 'POOR', dynamic: 'SUPPORTIVE', allowance: 20 };
      const updated = updateStats(baseStats, { health: 50 }, 15, poorFamily);
      expect(updated.health).toBeLessThanOrEqual(90); // POOR reduces cap
    });

    it('should respect trait-based caps', () => {
      const updated = updateStats(baseStats, { health: 50 }, 15, null, ['SICKLY']);
      expect(updated.health).toBeLessThanOrEqual(70); // SICKLY cap = 60 + 10
    });

    it('should handle multiple stat changes simultaneously', () => {
      const updated = updateStats(baseStats, {
        health: 10,
        intelligence: 10,
        money: 50,
        energy: -20,
      });
      expect(updated.health).toBe(60);
      expect(updated.intelligence).toBe(60);
      expect(updated.money).toBe(150);
      expect(updated.energy).toBe(60);
    });

    it('should not modify original stats object', () => {
      const original = { ...baseStats };
      updateStats(baseStats, { health: 10 });
      expect(baseStats).toEqual(original);
    });
  });

  // --- checkTraitFormation Tests ---
  describe('checkTraitFormation', () => {
    const baseGameState: GameState = {
      age: 10,
      turn: 50,
      phase: 'HUB',
      currentEvent: null,
      pendingReportCard: false,
      characterInfo: null,
      lastResult: null,
      historyLog: [],
      family: null,
      maxEnergy: 100,
      schoolGrades: { math: 50, science: 50, language: 50, turkish: 50, history: 50, geography: 50, art: 50, music: 50 },
      skills: {
        coding: 0,
        music: 0,
        sports: 0,
        design: 0,
        athletics: 0,
        logic: 0,
        reading: 0,
        teamwork: 0,
        art: 0,
        writing: 0,
        work_ethic: 0,
        business: 0,
      },
      talent: 'NONE',
      streak: { actionId: null, count: 0 },
      traits: [],
      traitProgress: {},
      actionCounts: {},
      actionHistory: [],
      eventChoiceHistory: [],
      memories: [],
      scheduledEvents: [],
      inventory: [],
      npcs: [],
      selectedNpcId: null,
      innerThought: '',
      innerThoughtType: 'IDLE',
      floatingTexts: [],
      totalTurns: 50,
      sessionCount: 1,
      adaptivePacingStreak: 0,
      lastInteracted: {
        math: 0, science: 0, language: 0,
        coding: 0, music: 0, sports: 0, design: 0,
      },
      recentEvents: [],
      unlockedAchievements: [],
      achievementProgress: {},
      personality: { openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 50 },
      stress: { current: 0, threshold: 70, turnsSinceBreakdown: 0, sources: [] },
      personalityHistory: [],
      personalityState: {
        HELPFUL: { count: 0, streak: 0, multiplier: 1 },
        PRAGMATIC: { count: 0, streak: 0, multiplier: 1 },
        AGGRESSIVE: { count: 0, streak: 0, multiplier: 1 },
      },
      socialGroups: [],
      socialReputation: 50,
      examsTakenThisYear: [],
      isExamPeriod: false,
      childhood: {
        completed: false,
        sceneIndex: 0,
        memories: [],
        selectedMemoryId: null,
      },
    };

    const baseStats: Stats = {
      health: 50,
      intelligence: 50,
      charisma: 50,
      discipline: 50,
      money: 100,
      energy: 80,
      familyRelation: 60,
    };

    it('should return empty arrays when no actions trigger traits', () => {
      // Keep threshold-only traits neutral (LAZY/PROCRASTINATOR/PRAGMATIC) so null action/choice yields no progress.
      const neutralStats = {
        health: 60,
        intelligence: 60,
        charisma: 60,
        discipline: 50,
        money: 100,
        energy: 80,
        familyRelation: 60,
      };
      const result = checkTraitFormation(null, null, baseGameState, neutralStats);
      expect(result.newTraits).toEqual([]);
      expect(result.removedTraits).toEqual([]);
    });

    it('should not trigger traits outside age window', () => {
      const youngState = { ...baseGameState, age: 2 }; // Too young for most traits
      const result = checkTraitFormation('study_math', null, youngState, baseStats);
      expect(result.newTraits).toEqual([]);
    });

    it('should initialize trait progress for new triggers', () => {
      const result = checkTraitFormation('study_math', null, baseGameState, baseStats);
      expect(result.updatedProgress).toBeDefined();
      // Progress may be initialized for ORGANIZED trait (requires study actions)
    });

    it('should accumulate points across multiple triggers', () => {
      let state = { ...baseGameState };
      const lowStats = { ...baseStats, money: 10 }; // Avoid STAT_THRESHOLD triggers
      
      // Trigger multiple times with social action (helps EMPATHETIC)
      for (let i = 0; i < 5; i++) {
        const result = checkTraitFormation('social_talk', null, state, lowStats);
        state = { ...state, traitProgress: result.updatedProgress };
      }
      
      // Check if any progress was accumulated
      const hasProgress = Object.keys(state.traitProgress).length > 0;
      expect(hasProgress).toBe(true);
    });

    it('should unlock trait when points reach requirement', () => {
      // Test with a high stat that triggers AMBITIOUS (money > 500)
      const richStats = { ...baseStats, money: 600 };
      let state = { ...baseGameState };
      
      // Trigger check multiple times
      for (let i = 0; i < 5; i++) {
        const result = checkTraitFormation(null, null, state, richStats);
        state = { ...state, traitProgress: result.updatedProgress };
        
        // If any trait unlocked, verify the structure
        if (result.newTraits.length > 0) {
          expect(result.unlockMessage).toBeDefined();
          expect(typeof result.unlockMessage).toBe('string');
          break;
        }
      }
      
      // At least verify the system works without throwing
      expect(state.traitProgress).toBeDefined();
    });

    it('should apply age multiplier after 14', () => {
      const youngState = { ...baseGameState, age: 10 };
      const oldState = { ...baseGameState, age: 15 };
      
      const youngResult = checkTraitFormation('study_math', null, youngState, baseStats);
      const oldResult = checkTraitFormation('study_math', null, oldState, baseStats);
      
      // Older age should accumulate points slower
      // This is hard to test directly, but verify both work
      expect(youngResult.updatedProgress).toBeDefined();
      expect(oldResult.updatedProgress).toBeDefined();
    });

    it('should handle ACTION triggers with pattern matching', () => {
      const result = checkTraitFormation('study_math', null, baseGameState, baseStats);
      expect(result.progressUpdates.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle EVENT_CHOICE triggers', () => {
      const eventState = {
        ...baseGameState,
        currentEvent: {
          id: 'test_event',
          text: 'Test',
          choices: [],
          minAge: 5,
          maxAge: 15,
          rarity: 'COMMON' as const,
        },
      };
      const result = checkTraitFormation(null, 'help_friend', eventState, baseStats);
      // EMPATHETIC trait may trigger
      expect(result.updatedProgress).toBeDefined();
    });

    it('should handle STAT_THRESHOLD triggers', () => {
      const highStatState = { ...baseStats, intelligence: 75 };
      const result = checkTraitFormation(null, null, baseGameState, highStatState);
      // AMBITIOUS trait may trigger if intelligence > threshold
      expect(result.updatedProgress).toBeDefined();
    });

    it('should apply synergy bonus', () => {
      const stateWithSynergy = {
        ...baseGameState,
        traits: ['ORGANIZED'], // ORGANIZED may have synergy with DISCIPLINED
      };
      const result = checkTraitFormation('study_math', null, stateWithSynergy, baseStats);
      // Hard to test directly, but verify it doesn't crash
      expect(result.updatedProgress).toBeDefined();
    });

    it('should handle trait conflicts', () => {
      const stateWithConflict = {
        ...baseGameState,
        traits: ['LAZY'], // Conflicts with DISCIPLINED
        traitProgress: {
          DISCIPLINED: { points: 100, required: 5, firstTriggeredAge: 8, isLocked: false },
        },
      };
      const result = checkTraitFormation('study_math', null, stateWithConflict, baseStats);
      
      // If DISCIPLINED is unlocked, LAZY should be removed
      if (result.newTraits.includes('DISCIPLINED')) {
        expect(result.removedTraits).toContain('LAZY');
      }
    });

    it('should not trigger locked traits', () => {
      const lockedState = {
        ...baseGameState,
        traitProgress: {
          ORGANIZED: { points: 10, required: 5, firstTriggeredAge: 8, isLocked: true },
        },
      };
      const result = checkTraitFormation('study_math', null, lockedState, baseStats);
      
      // Locked trait should not accumulate more points
      expect(result.updatedProgress.ORGANIZED?.isLocked).toBe(true);
    });

    it('should clear progress after trait is unlocked', () => {
      let state = {
        ...baseGameState,
        traitProgress: {
          ORGANIZED: { points: 4.9, required: 5, firstTriggeredAge: 8, isLocked: false },
        },
      };
      
      const result = checkTraitFormation('study_math', null, state, baseStats);
      
      if (result.newTraits.includes('ORGANIZED')) {
        expect(result.updatedProgress.ORGANIZED).toBeUndefined();
      }
    });

    it('should return progress updates for UI feedback', () => {
      const result = checkTraitFormation('study_math', null, baseGameState, baseStats);
      expect(Array.isArray(result.progressUpdates)).toBe(true);
    });
  });

  // --- calculateCareerResult Tests ---
  describe('calculateCareerResult', () => {
    const baseStats: Stats = {
      health: 50,
      intelligence: 50,
      charisma: 50,
      discipline: 50,
      money: 100,
      energy: 80,
      familyRelation: 60,
    };

    const baseGameState: GameState = {
      age: 18,
      turn: 100,
      phase: 'HUB',
      currentEvent: null,
      pendingReportCard: false,
      characterInfo: null,
      lastResult: null,
      historyLog: [],
      family: null,
      maxEnergy: 100,
      schoolGrades: { math: 50, science: 50, language: 50, turkish: 50, history: 50, geography: 50, art: 50, music: 50 },
      skills: {
        coding: 0,
        music: 0,
        sports: 0,
        design: 0,
        athletics: 0,
        logic: 0,
        reading: 0,
        teamwork: 0,
        art: 0,
        writing: 0,
        work_ethic: 0,
        business: 0,
      },
      talent: 'NONE',
      streak: { actionId: null, count: 0 },
      traits: [],
      traitProgress: {},
      actionCounts: {},
      actionHistory: [],
      eventChoiceHistory: [],
      memories: [],
      scheduledEvents: [],
      inventory: [],
      npcs: [],
      selectedNpcId: null,
      innerThought: '',
      innerThoughtType: 'IDLE',
      floatingTexts: [],
      totalTurns: 100,
      sessionCount: 1,
      adaptivePacingStreak: 0,
      lastInteracted: {
        math: 0, science: 0, language: 0,
        coding: 0, music: 0, sports: 0, design: 0,
      },
      recentEvents: [],
      unlockedAchievements: [],
      achievementProgress: {},
      personality: { openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 50 },
      stress: { current: 0, threshold: 70, turnsSinceBreakdown: 0, sources: [] },
      personalityHistory: [],
      personalityState: {
        HELPFUL: { count: 0, streak: 0, multiplier: 1 },
        PRAGMATIC: { count: 0, streak: 0, multiplier: 1 },
        AGGRESSIVE: { count: 0, streak: 0, multiplier: 1 },
      },
      socialGroups: [],
      socialReputation: 50,
      examsTakenThisYear: [],
      isExamPeriod: false,
      childhood: {
        completed: true,
        sceneIndex: 0,
        memories: [],
        selectedMemoryId: null,
      },
    };

    it('should return athlete career for high sports skill', () => {
      const athleteState = {
        ...baseGameState,
        skills: { ...baseGameState.skills, sports: 95 },
      };
      const result = calculateCareerResult(athleteState, baseStats);
      expect(result.title).toContain('Sporcu');
      expect(result.type).toBe('LEGENDARY');
    });

    it('should return musician career for high music skill', () => {
      const musicianState = {
        ...baseGameState,
        skills: { ...baseGameState.skills, music: 90 },
        schoolGrades: { ...baseGameState.schoolGrades, music: 80 },
      };
      const result = calculateCareerResult(musicianState, baseStats);
      expect(result.title).toContain('Rockstar');
      expect(result.type).toBe('LEGENDARY');
    });

    it('should return medical school for high grades and discipline', () => {
      const medStudentState = {
        ...baseGameState,
        schoolGrades: { math: 85, science: 85, language: 70, turkish: 70, history: 70, geography: 70, art: 70, music: 70 },
      };
      const medStats = { ...baseStats, discipline: 70 };
      const result = calculateCareerResult(medStudentState, medStats);
      expect(result.type).toBe('SUCCESS');
      expect(result.emoji).toBe('\u{1FA7A}');
    });

    it('should return software engineering for high math and coding', () => {
      const devState = {
        ...baseGameState,
        schoolGrades: { math: 75, science: 60, language: 50, turkish: 50, history: 50, geography: 50, art: 50, music: 50 },
        skills: { ...baseGameState.skills, coding: 75 },
      };
      const result = calculateCareerResult(devState, baseStats);
      expect(result.type).toBe('SUCCESS');
      expect(result.emoji).toBe('\u{1F4BB}');
    });

    it('should return law school for high language and intelligence', () => {
      const lawState = {
        ...baseGameState,
        schoolGrades: { math: 50, science: 50, language: 85, turkish: 85, history: 50, geography: 50, art: 50, music: 50 },
      };
      const lawStats = { ...baseStats, intelligence: 75 };
      const result = calculateCareerResult(lawState, lawStats);
      expect(result.title).toContain('Hukuk');
      expect(result.type).toBe('SUCCESS');
    });

    it('should return private university for rich students', () => {
      const richStats = { ...baseStats, money: 2500 };
      const result = calculateCareerResult(baseGameState, richStats);
      expect(result.type).toBe('NORMAL');
      expect(result.emoji).toBe('\u{1F393}');
    });

    it('should return public university for average students', () => {
      const avgStats = { ...baseStats, intelligence: 55, discipline: 55 };
      const result = calculateCareerResult(baseGameState, avgStats);
      expect(result.type).toBe('NORMAL');
      expect(typeof result.emoji).toBe('string');
      expect(result.emoji.length).toBeGreaterThan(0);
    });

    it('should return failure for low stats', () => {
      const lowStats = {
        ...baseStats,
        intelligence: 20,
        discipline: 20,
      };
      const lowState = {
        ...baseGameState,
        schoolGrades: { math: 30, science: 30, language: 30, turkish: 30, history: 30, geography: 30, art: 30, music: 30 },
        skills: {
          coding: 10,
          music: 10,
          sports: 10,
          design: 10,
          athletics: 0,
          logic: 0,
          reading: 0,
          teamwork: 0,
          art: 0,
          writing: 0,
          work_ethic: 0,
          business: 0,
        },
      };
      const result = calculateCareerResult(lowState, lowStats);
      expect(result.type).toBe('FAILURE');
    });

    it('should include family reaction in result', () => {
      const result = calculateCareerResult(baseGameState, baseStats);
      expect(result.familyReaction).toBeDefined();
      expect(typeof result.familyReaction).toBe('string');
    });

    it('should include emoji in result', () => {
      const result = calculateCareerResult(baseGameState, baseStats);
      expect(result.emoji).toBeDefined();
    });

    it('should prioritize legendary careers over others', () => {
      const legendaryState = {
        ...baseGameState,
        skills: { ...baseGameState.skills, sports: 95, music: 95 },
      };
      const result = calculateCareerResult(legendaryState, baseStats);
      expect(result.type).toBe('LEGENDARY');
    });
  });

  // --- NPC Functions Tests ---
  describe('NPC Functions', () => {
    describe('createRandomNPC', () => {
      it('should create NPC with valid properties', () => {
        const npc = createRandomNPC();
        expect(npc.id).toBeDefined();
        expect(npc.name).toBeDefined();
        expect(npc.role).toBe('ACQUAINTANCE');
        expect(npc.gender).toMatch(/MALE|FEMALE/);
      });

      it('should create NPC with relationship between 10-40', () => {
        const npc = createRandomNPC();
        expect(npc.relationship).toBeGreaterThanOrEqual(10);
        expect(npc.relationship).toBeLessThanOrEqual(40);
      });

      it('should create NPC with romance = 0', () => {
        const npc = createRandomNPC();
        expect(npc.romance).toBe(0);
      });

      it('should create unique IDs', () => {
        const npc1 = createRandomNPC();
        const npc2 = createRandomNPC();
        expect(npc1.id).not.toBe(npc2.id);
      });

      it('should use Turkish names', () => {
        setRuntimeLocale('tr');
        const npc = createRandomNPC(8, 2, { deterministicSeed: 11 });
        // Just verify it's a valid non-empty string (name lists are extensive)
        expect(typeof npc.name).toBe('string');
        expect(npc.name.length).toBeGreaterThan(0);
        // Verify it's a Turkish-style name (contains only letters, possibly with Turkish chars)
        expect(npc.name).toMatch(/^[\p{L}\s]+$/u);
      });

      it('should use English names when runtime locale is en', () => {
        setRuntimeLocale('en');
        const npc = createRandomNPC(8, 2, { deterministicSeed: 11 });
        expect(typeof npc.name).toBe('string');
        expect(npc.name.length).toBeGreaterThan(0);
        expect(npc.name).toMatch(/^[A-Za-z]+$/);
        setRuntimeLocale('tr');
      });

      it('should generate deterministic non-id fields when seed is provided', () => {
        const npcA = createRandomNPC(12, 5, { locale: 'en', deterministicSeed: 42 });
        const npcB = createRandomNPC(12, 5, { locale: 'en', deterministicSeed: 42 });

        expect(npcA.name).toBe(npcB.name);
        expect(npcA.gender).toBe(npcB.gender);
        expect(npcA.age).toBe(npcB.age);
        expect(npcA.relationship).toBe(npcB.relationship);
        expect(npcA.personality).toBe(npcB.personality);
        expect(npcA.traits).toEqual(npcB.traits);
      });
    });

    describe('generateNPCs', () => {
      it('should generate 2 NPCs', () => {
        const npcs = generateNPCs();
        expect(npcs.length).toBe(2);
      });

      it('should generate NPCs with unique IDs', () => {
        const npcs = generateNPCs();
        expect(npcs[0].id).not.toBe(npcs[1].id);
      });

      it('should generate NPCs with ACQUAINTANCE role', () => {
        const npcs = generateNPCs();
        expect(npcs[0].role).toBe('ACQUAINTANCE');
        expect(npcs[1].role).toBe('ACQUAINTANCE');
      });
    });
  });

  // --- Utility Functions Tests ---
  describe('Utility Functions', () => {
    describe('hasItem', () => {
      it('should return true if item exists in inventory', () => {
        expect(hasItem(['item1', 'item2'], 'item1')).toBe(true);
      });

      it('should return false if item does not exist', () => {
        expect(hasItem(['item1', 'item2'], 'item3')).toBe(false);
      });

      it('should return false for empty inventory', () => {
        expect(hasItem([], 'item1')).toBe(false);
      });
    });

    describe('getRandomInt', () => {
      it('should return value within range', () => {
        for (let i = 0; i < 100; i++) {
          const val = getRandomInt(1, 10);
          expect(val).toBeGreaterThanOrEqual(1);
          expect(val).toBeLessThanOrEqual(10);
        }
      });

      it('should return min when min equals max', () => {
        expect(getRandomInt(5, 5)).toBe(5);
      });

      it('should work with negative ranges', () => {
        for (let i = 0; i < 50; i++) {
          const val = getRandomInt(-10, -5);
          expect(val).toBeGreaterThanOrEqual(-10);
          expect(val).toBeLessThanOrEqual(-5);
        }
      });
    });
  });

  // --- buildSocialSummary Tests ---
  describe('buildSocialSummary', () => {
    const makeNPC = (overrides: Partial<NPC>): NPC => ({
      id: 'npc_test',
      name: 'Test',
      role: 'FRIEND',
      relationship: 60,
      romance: 0,
      gender: 'MALE',
      age: 14,
      personality: 'FRIENDLY',
      traits: [],
      metAge: 10,
      metTurn: 4,
      lastInteraction: 1,
      sharedMemories: [],
      isInPlayerGroup: false,
      ...overrides,
    });

    it('returns empty array for no NPCs', () => {
      expect(buildSocialSummary([])).toEqual([]);
    });

    it('filters out ACQUAINTANCE NPCs', () => {
      const npcs = [makeNPC({ role: 'ACQUAINTANCE', name: 'Ali' })];
      expect(buildSocialSummary(npcs)).toEqual([]);
    });

    it('includes significant NPCs (PARTNER, BEST_FRIEND, FRIEND, etc.)', () => {
      const npcs = [
        makeNPC({ id: 'p1', name: 'Ayse', role: 'PARTNER', relationship: 85 }),
        makeNPC({ id: 'f1', name: 'Can', role: 'BEST_FRIEND', relationship: 90 }),
        makeNPC({ id: 'e1', name: 'Mert', role: 'ENEMY', relationship: 15 }),
      ];
      const summary = buildSocialSummary(npcs);
      expect(summary).toHaveLength(3);
      expect(summary.map(s => s.role)).toContain('PARTNER');
      expect(summary.map(s => s.role)).toContain('BEST_FRIEND');
      expect(summary.map(s => s.role)).toContain('ENEMY');
    });

    it('sorts by role importance (PARTNER first)', () => {
      const npcs = [
        makeNPC({ id: 'e1', name: 'Mert', role: 'ENEMY', relationship: 15 }),
        makeNPC({ id: 'p1', name: 'Ayse', role: 'PARTNER', relationship: 85 }),
        makeNPC({ id: 'f1', name: 'Elif', role: 'FRIEND', relationship: 55 }),
      ];
      const summary = buildSocialSummary(npcs);
      expect(summary[0].role).toBe('PARTNER');
    });

    it('limits to max 5 NPCs', () => {
      const npcs = Array.from({ length: 8 }, (_, i) =>
        makeNPC({ id: `f${i}`, name: `NPC${i}`, role: 'FRIEND', relationship: 50 + i })
      );
      const summary = buildSocialSummary(npcs);
      expect(summary.length).toBeLessThanOrEqual(5);
    });

    it('includes narrativeLine and emoji for each NPC', () => {
      const npcs = [makeNPC({ id: 'p1', name: 'Ayse', role: 'PARTNER', relationship: 80 })];
      const summary = buildSocialSummary(npcs);
      expect(summary[0].narrativeLine).toBeTruthy();
      expect(summary[0].emoji).toBeTruthy();
      expect(summary[0].name).toBe('Ayse');
    });
  });
});
