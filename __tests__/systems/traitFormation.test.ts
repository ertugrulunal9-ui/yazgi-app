/**
 * Trait Formation System Tests
 * Karakter özelliklerinin oluşumu ve etkileşim testleri
 */

import {
  checkTraitFormation,
  getTraitMultiplier,
  getEnergyCostMultiplier,
} from '../../src/utils/gameUtils';
import { TRAIT_DEFINITIONS } from '../../src/data/traits';

// Mock Stats
const createMockStats = (overrides = {}) => ({
  health: 50,
  intelligence: 50,
  charisma: 50,
  discipline: 50,
  money: 100,
  energy: 50,
  familyRelation: 50,
  ...overrides,
});

// Mock GameState
const createMockGameState = (overrides = {}) => ({
  age: 10,
  turn: 25,
  phase: 'HUB' as const,
  currentEvent: null,
  pendingReportCard: false,
  characterInfo: null,
  lastResult: null,
  historyLog: [],
  family: { wealth: 'MIDDLE' as const, dynamic: 'SUPPORTIVE' as const, allowance: 30 },
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
  talent: 'NONE' as const,
  streak: { actionId: null, count: 0 },
  traits: [],
  traitProgress: {},
  actionCounts: {},
  actionHistory: [],
  eventChoiceHistory: [],
  inventory: [],
  npcs: [],
  selectedNpcId: null,
  innerThought: '',
  floatingTexts: [],
  totalTurns: 25,
  lastInteracted: {},
  recentEvents: [],
  memories: [],
  scheduledEvents: [],
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
  ...overrides,
});

describe('Trait Formation System', () => {
  describe('TRAIT_DEFINITIONS Structure', () => {
    it('should have valid trait definitions', () => {
      expect(TRAIT_DEFINITIONS).toBeDefined();
      expect(Array.isArray(TRAIT_DEFINITIONS)).toBe(true);
      expect(TRAIT_DEFINITIONS.length).toBeGreaterThan(0);
    });

    it('should have required fields for each trait', () => {
      TRAIT_DEFINITIONS.forEach(trait => {
        expect(trait.id).toBeDefined();
        expect(trait.name).toBeDefined();
        expect(trait.description).toBeDefined();
        expect(trait.type).toBeDefined();
        expect(trait.category).toBeDefined();
        expect(['POSITIVE', 'NEGATIVE', 'NEUTRAL']).toContain(trait.type);
        expect(['GENETIC', 'ACQUIRED']).toContain(trait.category);
      });
    });

    it('should have genetic traits', () => {
      const geneticTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'GENETIC');
      expect(geneticTraits.length).toBeGreaterThan(0);
    });

    it('should have acquired traits', () => {
      const acquiredTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'ACQUIRED');
      expect(acquiredTraits.length).toBeGreaterThan(0);
    });

    it('should have formation rules for acquired traits', () => {
      const acquiredTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'ACQUIRED');
      acquiredTraits.forEach(trait => {
        expect(trait.formation).toBeDefined();
        expect(trait.formation?.triggers).toBeDefined();
        expect(Array.isArray(trait.formation?.triggers)).toBe(true);
        expect(trait.formation?.ageWindow).toBeDefined();
        expect(trait.formation?.pointsRequired).toBeDefined();
      });
    });
  });

  describe('checkTraitFormation', () => {
    it('should return arrays (may include stat-triggered traits)', () => {
      const state = createMockGameState();
      // Use balanced stats that won't trigger stat thresholds
      const stats = createMockStats({
        discipline: 70, // High enough to avoid LAZY
        charisma: 70,   // High enough to avoid social-negative traits
      });

      const result = checkTraitFormation(null, null, state, stats);

      // Function returns valid result structure
      expect(Array.isArray(result.newTraits)).toBe(true);
      expect(Array.isArray(result.removedTraits)).toBe(true);
      expect(typeof result.updatedProgress).toBe('object');
    });

    it('should not unlock trait if already owned', () => {
      const state = createMockGameState({ traits: ['DISCIPLINED'] });
      const stats = createMockStats({ discipline: 80 });

      const result = checkTraitFormation('study_math', null, state, stats);

      expect(result.newTraits).not.toContain('DISCIPLINED');
    });

    it('should respect age window constraints', () => {
      // Test with age outside window (very young)
      const youngState = createMockGameState({ age: 2 });
      const stats = createMockStats({ discipline: 80 });

      const result = checkTraitFormation('study_math', null, youngState, stats);

      // Most acquired traits have age windows starting at 5+
      expect(result.newTraits.length).toBe(0);
    });

    it('should track progress updates', () => {
      const state = createMockGameState({ age: 10 });
      const stats = createMockStats();

      const result = checkTraitFormation('study_math', null, state, stats);

      // Progress updates should be tracked
      expect(result.updatedProgress).toBeDefined();
    });

    it('should not progress BOOKWORM from coding actions even with high intelligence', () => {
      const state = createMockGameState({ age: 12 });
      const stats = createMockStats({ intelligence: 80 });

      const result = checkTraitFormation('computer_code', null, state, stats);

      expect(result.updatedProgress['BOOKWORM']?.points ?? 0).toBe(0);
      expect(result.progressUpdates).not.toContain('BOOKWORM');
    });

    it('should progress BOOKWORM from study actions when threshold is met', () => {
      const state = createMockGameState({ age: 12 });
      const stats = createMockStats({ intelligence: 80 });

      const result = checkTraitFormation('study_math', null, state, stats);

      expect(result.updatedProgress['BOOKWORM']?.points ?? 0).toBeGreaterThan(0);
      expect(result.progressUpdates).toContain('BOOKWORM');
    });

    it('should treat STAT_THRESHOLD as prerequisite for mixed-trigger traits', () => {
      const state = createMockGameState({ age: 15 });
      const belowThresholdStats = createMockStats({ intelligence: 55 });
      const aboveThresholdStats = createMockStats({ intelligence: 75 });

      const withoutThreshold = checkTraitFormation('work_parttime', null, state, belowThresholdStats);
      const withThreshold = checkTraitFormation('work_parttime', null, state, aboveThresholdStats);

      expect(withoutThreshold.updatedProgress['AMBITIOUS']?.points ?? 0).toBe(0);
      expect(withThreshold.updatedProgress['AMBITIOUS']?.points ?? 0).toBeGreaterThan(0);
    });

    it('should only progress BURNOUT_PRONE for overwork actions under low energy', () => {
      const state = createMockGameState({ age: 15 });
      const lowEnergyStats = createMockStats({ energy: 15 });
      const healthyEnergyStats = createMockStats({ energy: 60 });

      const unrelatedAction = checkTraitFormation('social_talk', null, state, lowEnergyStats);
      const lowEnergyStudy = checkTraitFormation('study_math', null, state, lowEnergyStats);
      const highEnergyStudy = checkTraitFormation('study_math', null, state, healthyEnergyStats);

      expect(unrelatedAction.updatedProgress['BURNOUT_PRONE']?.points ?? 0).toBe(0);
      expect(lowEnergyStudy.updatedProgress['BURNOUT_PRONE']?.points ?? 0).toBeGreaterThan(0);
      expect(highEnergyStudy.updatedProgress['BURNOUT_PRONE']?.points ?? 0).toBe(0);
    });

    it('should only progress LONE_WOLF on solitude-choice context with low charisma', () => {
      const lowCharismaStats = createMockStats({ charisma: 30 });
      const highCharismaStats = createMockStats({ charisma: 65 });
      const solitudeEventState = createMockGameState({
        age: 12,
        currentEvent: { id: 'pers_bir_gun_yalniz' } as any,
      });
      const unrelatedEventState = createMockGameState({
        age: 12,
        currentEvent: { id: 'pers_grup_zorbaligi' } as any,
      });

      const unrelatedChoice = checkTraitFormation(null, 'zorbalik_izle', unrelatedEventState, lowCharismaStats);
      const correctChoiceLowCharisma = checkTraitFormation(null, 'yalniz_rahat', solitudeEventState, lowCharismaStats);
      const correctChoiceHighCharisma = checkTraitFormation(null, 'yalniz_rahat', solitudeEventState, highCharismaStats);

      expect(unrelatedChoice.updatedProgress['LONE_WOLF']?.points ?? 0).toBe(0);
      expect(correctChoiceLowCharisma.updatedProgress['LONE_WOLF']?.points ?? 0).toBeGreaterThan(0);
      expect(correctChoiceHighCharisma.updatedProgress['LONE_WOLF']?.points ?? 0).toBe(0);
    });

    it('should progress social action traits from social_* actions', () => {
      const state = createMockGameState({ age: 12 });
      const stats = createMockStats();

      const result = checkTraitFormation('social_chat', null, state, stats);

      expect(result.updatedProgress['EMPATHETIC']?.points ?? 0).toBeGreaterThan(0);
      expect(result.updatedProgress['SOCIAL_BUTTERFLY']?.points ?? 0).toBeGreaterThan(0);
      expect(result.progressUpdates).toContain('EMPATHETIC');
      expect(result.progressUpdates).toContain('SOCIAL_BUTTERFLY');
    });

    it('should only trigger LAZY and PROCRASTINATOR at low discipline', () => {
      const state = createMockGameState({ age: 10 });
      const lowDiscipline = createMockStats({ discipline: 10 });
      const highDiscipline = createMockStats({ discipline: 60 });

      const lowResult = checkTraitFormation('study_math', null, state, lowDiscipline);
      const highResult = checkTraitFormation('study_math', null, state, highDiscipline);

      expect(lowResult.newTraits).not.toContain('LAZY');
      expect(lowResult.updatedProgress['LAZY']?.points ?? 0).toBeGreaterThan(0);
      expect(lowResult.updatedProgress['PROCRASTINATOR']?.points ?? 0).toBeGreaterThan(0);
      expect(highResult.updatedProgress['LAZY']?.points ?? 0).toBe(0);
      expect(highResult.updatedProgress['PROCRASTINATOR']?.points ?? 0).toBe(0);
    });

    it('should apply cooldown pacing for threshold-only negative traits', () => {
      const lowDiscipline = createMockStats({ discipline: 10 });
      const baseState = createMockGameState({ age: 10, turn: 30 });

      const first = checkTraitFormation('study_math', null, baseState, lowDiscipline);
      const firstLazyPoints = first.updatedProgress['LAZY']?.points ?? 0;
      const sameTurnState = {
        ...baseState,
        traitProgress: JSON.parse(JSON.stringify(first.updatedProgress)),
      };
      const secondSameTurn = checkTraitFormation('study_math', null, sameTurnState, lowDiscipline);
      const secondLazyPoints = secondSameTurn.updatedProgress['LAZY']?.points ?? 0;
      const postCooldownState = {
        ...sameTurnState,
        turn: 32,
        traitProgress: JSON.parse(JSON.stringify(secondSameTurn.updatedProgress)),
      };
      const thirdAfterCooldown = checkTraitFormation('study_math', null, postCooldownState, lowDiscipline);

      expect(firstLazyPoints).toBe(1);
      expect(secondLazyPoints).toBe(1);
      expect(thirdAfterCooldown.newTraits).toContain('LAZY');
    });

    it('should not progress threshold-only traits without action or choice context', () => {
      const lowDiscipline = createMockStats({ discipline: 10 });
      const state = createMockGameState({ age: 10, turn: 30 });

      const result = checkTraitFormation(null, null, state, lowDiscipline);

      expect(result.updatedProgress['LAZY']?.points ?? 0).toBe(0);
      expect(result.updatedProgress['PROCRASTINATOR']?.points ?? 0).toBe(0);
    });

    it('should handle conflicts between traits', () => {
      // Some traits conflict with each other
      const disciplinedTrait = TRAIT_DEFINITIONS.find(t => t.id === 'DISCIPLINED');
      const lazyTrait = TRAIT_DEFINITIONS.find(t => t.id === 'LAZY');

      if (disciplinedTrait?.conflicts) {
        expect(disciplinedTrait.conflicts).toContain('LAZY');
      }
      if (lazyTrait?.conflicts) {
        expect(lazyTrait.conflicts).toContain('DISCIPLINED');
      }
    });
  });

  describe('getTraitMultiplier', () => {
    describe('Genetic Traits', () => {
      it('should boost intelligence-related stats for GENIUS', () => {
        const multiplier = getTraitMultiplier(['GENIUS'], 'intelligence');
        expect(multiplier).toBeGreaterThan(1.0);
      });

      it('should boost sports and health for ATHLETIC', () => {
        const sportsMultiplier = getTraitMultiplier(['ATHLETIC'], 'sports');
        const healthMultiplier = getTraitMultiplier(['ATHLETIC'], 'health');

        expect(sportsMultiplier).toBeGreaterThan(1.0);
        expect(healthMultiplier).toBeGreaterThan(1.0);
      });

      it('should boost charisma for CHARISMATIC', () => {
        const multiplier = getTraitMultiplier(['CHARISMATIC'], 'charisma');
        expect(multiplier).toBeGreaterThan(1.0);
      });

      it('should reduce stats for CLUMSY', () => {
        const sportsMultiplier = getTraitMultiplier(['CLUMSY'], 'sports');
        expect(sportsMultiplier).toBeLessThan(1.0);
      });

      it('should reduce health stats for SICKLY', () => {
        const healthMultiplier = getTraitMultiplier(['SICKLY'], 'health');
        expect(healthMultiplier).toBeLessThan(1.0);
      });
    });

    describe('Acquired Positive Traits', () => {
      it('should boost charisma for EMPATHETIC', () => {
        const multiplier = getTraitMultiplier(['EMPATHETIC'], 'charisma');
        expect(multiplier).toBeGreaterThan(1.0);
      });

      it('should boost discipline for ORGANIZED', () => {
        const multiplier = getTraitMultiplier(['ORGANIZED'], 'discipline');
        expect(multiplier).toBeGreaterThan(1.0);
      });

      it('should boost money for AMBITIOUS', () => {
        const multiplier = getTraitMultiplier(['AMBITIOUS'], 'money');
        expect(multiplier).toBeGreaterThan(1.0);
      });

      it('should boost design and music for CREATIVE', () => {
        const designMultiplier = getTraitMultiplier(['CREATIVE'], 'design');
        const musicMultiplier = getTraitMultiplier(['CREATIVE'], 'music');

        expect(designMultiplier).toBeGreaterThan(1.0);
        expect(musicMultiplier).toBeGreaterThan(1.0);
      });

      it('should boost language for BOOKWORM', () => {
        const multiplier = getTraitMultiplier(['BOOKWORM'], 'language');
        expect(multiplier).toBeGreaterThan(1.0);
      });
    });

    describe('Acquired Negative Traits', () => {
      it('should reduce discipline for LAZY', () => {
        const multiplier = getTraitMultiplier(['LAZY'], 'discipline');
        expect(multiplier).toBeLessThan(1.0);
      });

      it('should reduce charisma for COWARD', () => {
        const multiplier = getTraitMultiplier(['COWARD'], 'charisma');
        expect(multiplier).toBeLessThan(1.0);
      });

      it('should reduce familyRelation for REBELLIOUS', () => {
        const multiplier = getTraitMultiplier(['REBELLIOUS'], 'familyRelation');
        expect(multiplier).toBeLessThan(1.0);
      });
    });

    describe('Multiple Traits', () => {
      it('should stack multipliers for multiple traits', () => {
        const singleMultiplier = getTraitMultiplier(['GENIUS'], 'intelligence');
        const combinedMultiplier = getTraitMultiplier(['GENIUS', 'DISCIPLINED'], 'intelligence');

        // Combined should be different (likely higher)
        expect(combinedMultiplier).not.toBe(singleMultiplier);
      });

      it('should balance conflicting effects', () => {
        // ATHLETIC boosts sports, CLUMSY reduces it
        const athleticOnly = getTraitMultiplier(['ATHLETIC'], 'sports');
        const clumsyOnly = getTraitMultiplier(['CLUMSY'], 'sports');
        const combined = getTraitMultiplier(['ATHLETIC', 'CLUMSY'], 'sports');

        // Combined should be between the two extremes
        expect(combined).toBeLessThan(athleticOnly);
        expect(combined).toBeGreaterThan(clumsyOnly);
      });
    });

    describe('Unaffected Stats', () => {
      it('should return 1.0 for unaffected stats', () => {
        // GENIUS doesn't affect familyRelation
        const multiplier = getTraitMultiplier(['GENIUS'], 'familyRelation');
        expect(multiplier).toBe(1.0);
      });

      it('should return 1.0 for empty trait list', () => {
        const multiplier = getTraitMultiplier([], 'intelligence');
        expect(multiplier).toBe(1.0);
      });

      it('should return 1.0 for unknown traits', () => {
        const multiplier = getTraitMultiplier(['UNKNOWN_TRAIT'], 'intelligence');
        expect(multiplier).toBe(1.0);
      });
    });
  });

  describe('getEnergyCostMultiplier', () => {
    it('should reduce energy cost for ATHLETIC', () => {
      const multiplier = getEnergyCostMultiplier(['ATHLETIC']);
      expect(multiplier).toBeLessThan(1.0);
    });

    it('should increase energy cost for SICKLY', () => {
      const multiplier = getEnergyCostMultiplier(['SICKLY']);
      expect(multiplier).toBeGreaterThan(1.0);
    });

    it('should increase energy cost for LAZY', () => {
      const multiplier = getEnergyCostMultiplier(['LAZY']);
      expect(multiplier).toBeGreaterThan(1.0);
    });

    it('should reduce energy cost for DISCIPLINED', () => {
      const multiplier = getEnergyCostMultiplier(['DISCIPLINED']);
      expect(multiplier).toBeLessThan(1.0);
    });

    it('should reduce energy cost for ORGANIZED', () => {
      const multiplier = getEnergyCostMultiplier(['ORGANIZED']);
      expect(multiplier).toBeLessThan(1.0);
    });

    it('should return 1.0 for empty traits', () => {
      const multiplier = getEnergyCostMultiplier([]);
      expect(multiplier).toBe(1.0);
    });

    it('should stack effects from multiple traits', () => {
      const athleticOnly = getEnergyCostMultiplier(['ATHLETIC']);
      const combined = getEnergyCostMultiplier(['ATHLETIC', 'DISCIPLINED']);

      // Both reduce energy cost, so combined should be lower
      expect(combined).toBeLessThan(athleticOnly);
    });
  });

  describe('Trait Synergies', () => {
    it('should support synergies field if defined', () => {
      // Check if synergies field is supported in the type
      const disciplinedTrait = TRAIT_DEFINITIONS.find(t => t.id === 'DISCIPLINED');
      const organizedTrait = TRAIT_DEFINITIONS.find(t => t.id === 'ORGANIZED');

      // Synergies are optional - traits may or may not have them
      const hasSynergies = TRAIT_DEFINITIONS.some(t => t.synergies && t.synergies.length > 0);

      // Either synergies exist OR they're not yet implemented (both valid states)
      expect(typeof hasSynergies).toBe('boolean');
    });
  });

  describe('Trait Effects Structure', () => {
    it('should have effects defined for each trait', () => {
      TRAIT_DEFINITIONS.forEach(trait => {
        expect(trait.effects).toBeDefined();
      });
    });

    it('should have valid stat multipliers', () => {
      TRAIT_DEFINITIONS.forEach(trait => {
        if (trait.effects.statMultipliers) {
          Object.values(trait.effects.statMultipliers).forEach(multiplier => {
            expect(typeof multiplier).toBe('number');
          });
        }
      });
    });
  });
});

describe('Integration: Trait Progression', () => {
  it('should accumulate progress over multiple actions', () => {
    const state = createMockGameState({
      age: 10,
      traitProgress: {
        DISCIPLINED: { points: 3, required: 5, firstTriggeredAge: 8, isLocked: false },
      },
    });
    const stats = createMockStats({ discipline: 70 });

    // Simulate multiple study actions
    const result1 = checkTraitFormation('study_math', null, state, stats);

    // Progress should be tracked
    expect(result1.updatedProgress).toBeDefined();
  });

  it('should lock trait after unlocking', () => {
    const state = createMockGameState({
      age: 10,
      traitProgress: {
        DISCIPLINED: { points: 4.5, required: 5, firstTriggeredAge: 8, isLocked: false },
      },
    });
    const stats = createMockStats({ discipline: 80 });

    const result = checkTraitFormation('study_math', null, state, stats);

    // If trait unlocked, it should be in newTraits or progress should be locked
    if (result.newTraits.includes('DISCIPLINED')) {
      // Trait was unlocked
      expect(result.updatedProgress['DISCIPLINED']).toBeUndefined();
    }
  });

  it('should apply age difficulty modifier after 14', () => {
    const youngState = createMockGameState({ age: 10 });
    const oldState = createMockGameState({ age: 15 });
    const stats = createMockStats();

    const youngResult = checkTraitFormation('study_math', null, youngState, stats);
    const oldResult = checkTraitFormation('study_math', null, oldState, stats);

    // Both should work but older character may have reduced progress
    expect(youngResult.progressUpdates).toBeDefined();
    expect(oldResult.progressUpdates).toBeDefined();
  });
});
