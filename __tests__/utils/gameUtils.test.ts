/**
 * gameUtils Core Functions Tests
 * Tests fundamental game utility functions
 */

import {
  clamp,
  getInitialStats,
  getInitialGameState,
} from '../../src/utils/gameUtils';

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
      
      expect(stats.health).toBe(70);
      expect(stats.intelligence).toBe(0);
      expect(stats.charisma).toBe(10);
      expect(stats.discipline).toBe(0);
      expect(stats.money).toBe(0);
      expect(stats.energy).toBe(100);
      expect(stats.familyRelation).toBe(50);
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
      expect(state.maxEnergy).toBe(100);
    });

    it('should initialize empty arrays', () => {
      const state = getInitialGameState();
      
      expect(state.traits).toEqual([]);
      expect(state.inventory).toEqual([]);
      expect(state.npcs).toEqual([]);
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

    it('should set null for optional fields', () => {
      const state = getInitialGameState();
      
      expect(state.family).toBeNull();
      expect(state.currentEvent).toBeNull();
      expect(state.lastResult).toBeNull();
      expect(state.selectedNpcId).toBeNull();
    });
  });
});
