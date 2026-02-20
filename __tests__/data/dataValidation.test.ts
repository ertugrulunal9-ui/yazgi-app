import { ACTION_CATEGORIES, ActionCategory, SubAction } from '@/data/actions';
import { ACHIEVEMENTS } from '@/systems/achievementDefinitions';
import { ENDINGS } from '@/data/endings';

// Missing module mocks are in global setup.ts (balanceContract, onboardingGuidance, familyNarrative)

// ==========================================
// ACTION DATA VALIDATION
// ==========================================

describe('Action Categories Data Validation', () => {
  it('ACTION_CATEGORIES is a non-empty array', () => {
    expect(Array.isArray(ACTION_CATEGORIES)).toBe(true);
    expect(ACTION_CATEGORIES.length).toBeGreaterThan(0);
  });

  it('every category has required fields', () => {
    ACTION_CATEGORIES.forEach((category: ActionCategory) => {
      expect(typeof category.id).toBe('string');
      expect(category.id.length).toBeGreaterThan(0);

      expect(typeof category.title).toBe('string');
      expect(category.title.length).toBeGreaterThan(0);

      expect(typeof category.icon).toBe('string');
      expect(typeof category.color).toBe('string');
      expect(typeof category.bgColor).toBe('string');

      expect(Array.isArray(category.subActions)).toBe(true);
      expect(category.subActions.length).toBeGreaterThan(0);
    });
  });

  it('all category IDs are unique', () => {
    const ids = ACTION_CATEGORIES.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every subAction has required fields', () => {
    ACTION_CATEGORIES.forEach(category => {
      category.subActions.forEach((action: SubAction) => {
        expect(typeof action.id).toBe('string');
        expect(action.id.length).toBeGreaterThan(0);

        expect(typeof action.text).toBe('string');
        expect(action.text.length).toBeGreaterThan(0);

        expect(typeof action.icon).toBe('string');

        expect(typeof action.energyCost).toBe('number');
        expect(action.energyCost).toBeGreaterThanOrEqual(0);

        expect(typeof action.feedback).toBe('string');
        expect(action.feedback.length).toBeGreaterThan(0);

        // effect should be an object
        expect(typeof action.effect).toBe('object');
      });
    });
  });

  it('all subAction IDs are unique across all categories', () => {
    const ids: string[] = [];
    ACTION_CATEGORIES.forEach(category => {
      category.subActions.forEach(action => {
        ids.push(action.id);
      });
    });
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
      fail(`Duplicate subAction IDs found: ${[...new Set(duplicates)].join(', ')}`);
    }
  });

  it('minAge is reasonable when specified', () => {
    ACTION_CATEGORIES.forEach(category => {
      category.subActions.forEach(action => {
        if (action.minAge !== undefined) {
          expect(action.minAge).toBeGreaterThanOrEqual(0);
          expect(action.minAge).toBeLessThanOrEqual(18);
        }
      });
    });
  });

  it('category age ranges are valid', () => {
    ACTION_CATEGORIES.forEach(category => {
      if (category.minAge !== undefined && category.maxAge !== undefined) {
        expect(category.minAge).toBeLessThanOrEqual(category.maxAge);
      }
    });
  });
});

// ==========================================
// ACHIEVEMENT DEFINITIONS VALIDATION
// ==========================================

describe('Achievement Definitions Data Validation', () => {
  it('ACHIEVEMENTS is a non-empty array', () => {
    expect(Array.isArray(ACHIEVEMENTS)).toBe(true);
    expect(ACHIEVEMENTS.length).toBeGreaterThan(0);
  });

  it('every achievement has required fields', () => {
    ACHIEVEMENTS.forEach(achievement => {
      expect(typeof achievement.id).toBe('string');
      expect(achievement.id.length).toBeGreaterThan(0);

      expect(typeof achievement.name).toBe('string');
      expect(achievement.name.length).toBeGreaterThan(0);

      expect(typeof achievement.description).toBe('string');
      expect(achievement.description.length).toBeGreaterThan(0);

      expect(['STATS', 'MONEY', 'EVENTS', 'SKILLS', 'SCHOOL', 'SECRET', 'SOCIAL', 'SURVIVAL'])
        .toContain(achievement.category);

      expect(['COMMON', 'RARE', 'EPIC', 'LEGENDARY']).toContain(achievement.rarity);

      expect(typeof achievement.icon).toBe('string');
      expect(typeof achievement.isSecret).toBe('boolean');
      expect(typeof achievement.check).toBe('function');
    });
  });

  it('all achievement IDs are unique', () => {
    const ids = ACHIEVEMENTS.map(a => a.id);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
      fail(`Duplicate achievement IDs: ${[...new Set(duplicates)].join(', ')}`);
    }
  });

  it('achievement check functions do not throw with default values', () => {
    const defaultStats = {
      health: 50, intelligence: 50, charisma: 50,
      discipline: 50, money: 1000, energy: 80, familyRelation: 50,
    };
    const defaultGameState = {
      age: 10, turn: 20, traits: [], eventChoiceHistory: [],
      unlockedAchievements: [], achievementProgress: {},
      actionCounts: {}, actionHistory: [], npcs: [],
      memories: [], skills: {} as any, schoolGrades: {} as any,
      sessionCount: 1, socialGroups: [], inventory: [],
      streak: { actionId: null, count: 0 },
      recentEvents: [], scheduledEvents: [], activeArcs: [],
      personalityHistory: [], totalTurns: 20,
      personality: { openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 50 },
      stress: { current: 0, threshold: 70, turnsSinceBreakdown: 0, sources: [] },
    } as any;
    const defaultSkills = {
      coding: 0, music: 0, sports: 0, design: 0,
      athletics: 0, logic: 0, reading: 0, teamwork: 0,
      art: 0, writing: 0, work_ethic: 0, business: 0,
    };
    const defaultGrades = {
      math: 50, science: 50, language: 50, turkish: 50,
      history: 50, geography: 50, art: 50, music: 50,
    };

    ACHIEVEMENTS.forEach(achievement => {
      expect(() => {
        achievement.check(defaultStats, defaultGameState, defaultSkills, defaultGrades);
      }).not.toThrow();
    });
  });

  it('rewards have valid structure when present', () => {
    ACHIEVEMENTS.forEach(achievement => {
      if (achievement.reward) {
        if (achievement.reward.money !== undefined) {
          expect(typeof achievement.reward.money).toBe('number');
          expect(achievement.reward.money).toBeGreaterThan(0);
        }
        if (achievement.reward.stats !== undefined) {
          expect(typeof achievement.reward.stats).toBe('object');
        }
      }
    });
  });
});

// ==========================================
// ENDINGS DATA VALIDATION
// ==========================================

describe('Endings Data Validation', () => {
  it('ENDINGS is a non-empty array', () => {
    expect(Array.isArray(ENDINGS)).toBe(true);
    expect(ENDINGS.length).toBeGreaterThan(0);
  });

  it('every ending has required fields', () => {
    ENDINGS.forEach(ending => {
      expect(typeof ending.id).toBe('string');
      expect(ending.id.length).toBeGreaterThan(0);

      expect(typeof ending.title).toBe('string');
      expect(ending.title.length).toBeGreaterThan(0);

      expect(typeof ending.description).toBe('string');
      expect(ending.description.length).toBeGreaterThan(0);

      expect(typeof ending.priority).toBe('number');
      expect(ending.priority).toBeGreaterThanOrEqual(0);

      expect(typeof ending.condition).toBe('function');
    });
  });

  it('all ending IDs are unique', () => {
    const ids = ENDINGS.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all priorities are unique', () => {
    const priorities = ENDINGS.map(e => e.priority);
    expect(new Set(priorities).size).toBe(priorities.length);
  });

  it('has a fallback ending (always true condition)', () => {
    const mockGs = { traits: [], age: 18 } as any;
    const mockStats = { intelligence: 50, charisma: 50 } as any;
    const fallback = ENDINGS.find(e => e.condition(mockGs, mockStats));
    expect(fallback).toBeDefined();
  });

  it('condition functions do not throw with default values', () => {
    const defaultGameState = { traits: [], age: 18 } as any;
    const defaultStats = { intelligence: 50, charisma: 50 } as any;

    ENDINGS.forEach(ending => {
      expect(() => {
        ending.condition(defaultGameState, defaultStats);
      }).not.toThrow();
    });
  });
});
