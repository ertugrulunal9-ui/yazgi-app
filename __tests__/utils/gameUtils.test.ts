/**
 * gameUtils Core Functions Tests
 * Tests fundamental game utility functions
 */

import {
  clamp,
  getInitialStats,
  getInitialGameState,
  getMaxEnergy,
} from '../../src/utils/gameUtils';
import { BALANCE_CONTRACT, calculateInitialEnergy } from '../../src/config/balanceContract';

describe('gameUtils - Core Functions', () => {
  describe('clamp', () => {
    it('should limit value to max', () => {
      expect(clamp(150, 0, 100)).toBe(100);
    });

    it('should limit value to min', () => {
      expect(clamp(-10, 0, 100)).toBe(0);
    });

    it('should return value if within range', () => {
      expect(clamp(50, 0, 100)).toBe(50);
    });

    it('should handle edge cases', () => {
      expect(clamp(0, 0, 100)).toBe(0);
      expect(clamp(100, 0, 100)).toBe(100);
    });

    it('should work with negative ranges', () => {
      expect(clamp(-50, -100, 0)).toBe(-50);
      expect(clamp(-150, -100, 0)).toBe(-100);
      expect(clamp(50, -100, 0)).toBe(0);
    });
  });

  describe('getInitialStats', () => {
    it('should return valid initial stats', () => {
      const stats = getInitialStats();

      expect(stats.health).toBe(BALANCE_CONTRACT.initialStats.health);
      expect(stats.intelligence).toBe(BALANCE_CONTRACT.initialStats.intelligence);
      expect(stats.charisma).toBe(BALANCE_CONTRACT.initialStats.charisma);
      expect(stats.discipline).toBe(BALANCE_CONTRACT.initialStats.discipline);
      expect(stats.money).toBe(BALANCE_CONTRACT.initialStats.money);
      const expectedEnergy = calculateInitialEnergy(stats.health);
      expect(stats.energy).toBe(expectedEnergy);
      expect(stats.familyRelation).toBe(BALANCE_CONTRACT.initialStats.familyRelation);
    });

    it('should return stats within valid ranges', () => {
      const stats = getInitialStats();
      
      expect(stats.health).toBeGreaterThanOrEqual(0);
      expect(stats.health).toBeLessThanOrEqual(100);
      expect(stats.energy).toBeGreaterThanOrEqual(0);
      expect(stats.energy).toBeLessThanOrEqual(100);
      expect(stats.familyRelation).toBeGreaterThanOrEqual(0);
      expect(stats.familyRelation).toBeLessThanOrEqual(100);
    });

    it('should return consistent stats on multiple calls', () => {
      const stats1 = getInitialStats();
      const stats2 = getInitialStats();
      
      expect(stats1).toEqual(stats2);
    });
  });

  describe('getInitialGameState', () => {
    it('should set correct initial values', () => {
      const state = getInitialGameState();
      
      expect(state.age).toBe(0);
      expect(state.turn).toBe(1);
      expect(state.phase).toBe('SETUP');
      expect(state.maxEnergy).toBe(getMaxEnergy(state.age, state.family, state.traits));
    });

    it('should initialize arrays appropriately', () => {
      const state = getInitialGameState();

      // Genetic traits may be assigned at birth (5-15% chance each)
      expect(Array.isArray(state.traits)).toBe(true);
      expect(state.inventory).toEqual([]);
      // NPCs are generated at start for age 0
      expect(Array.isArray(state.npcs)).toBe(true);
      expect(state.memories).toEqual([]);
      expect(state.scheduledEvents).toEqual([]);
      expect(state.historyLog).toEqual([]);
      expect(state.actionHistory).toEqual([]);
      expect(state.eventChoiceHistory).toEqual([]);
    });

    it('should initialize school grades to 50', () => {
      const state = getInitialGameState();
      
      expect(state.schoolGrades.math).toBe(50);
      expect(state.schoolGrades.science).toBe(50);
      expect(state.schoolGrades.language).toBe(50);
    });

    it('should initialize all skills to 0', () => {
      const state = getInitialGameState();
      
      expect(state.skills.coding).toBe(0);
      expect(state.skills.music).toBe(0);
      expect(state.skills.sports).toBe(0);
      expect(state.skills.design).toBe(0);
    });

    it('should set talent to NONE', () => {
      const state = getInitialGameState();
      
      expect(state.talent).toBe('NONE');
    });

    it('should initialize empty objects', () => {
      const state = getInitialGameState();
      
      expect(state.traitProgress).toEqual({});
      expect(state.actionCounts).toEqual({});
    });

    it('should set appropriate values for fields', () => {
      const state = getInitialGameState();

      // Family is created at initialization
      expect(state.family).toBeDefined();
      expect(state.family?.wealth).toBeDefined();
      expect(state.family?.dynamic).toBeDefined();
      // These remain null until set later
      expect(state.currentEvent).toBeNull();
      expect(state.lastResult).toBeNull();
      expect(state.selectedNpcId).toBeNull();
    });
  });
});

