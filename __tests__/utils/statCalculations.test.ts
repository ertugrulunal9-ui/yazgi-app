import {
  calculateStudyGain,
  calculateStatGain,
  clampStats,
  applyStatEffect,
  resetDailyEnergy,
} from '../../src/utils/statCalculations';
import { Stats } from '../../src/types';

describe('statCalculations - Stat Math & Effects', () => {
  describe('calculateStudyGain', () => {
    it('should return base gain for low intelligence', () => {
      const gain = calculateStudyGain(0);
      expect(gain).toBe(8); // Base 8 + 0 * 0.05
    });

    it('should increase gain with higher intelligence', () => {
      const lowGain = calculateStudyGain(20);
      const highGain = calculateStudyGain(80);

      expect(highGain).toBeGreaterThan(lowGain);
    });

    it('should follow formula: 8 + intelligence * 0.05', () => {
      expect(calculateStudyGain(0)).toBe(8);
      expect(calculateStudyGain(20)).toBe(9); // 8 + 1
      expect(calculateStudyGain(100)).toBe(13); // 8 + 5
    });

    it('should return integer values', () => {
      const gain = calculateStudyGain(33);
      expect(Number.isInteger(gain)).toBe(true);
    });
  });

  describe('calculateStatGain', () => {
    it('should apply diminishing returns', () => {
      const gain10 = calculateStatGain(10, 10);
      const gain50 = calculateStatGain(10, 50);
      const gain90 = calculateStatGain(10, 90);

      expect(gain10).toBeGreaterThan(gain50);
      expect(gain50).toBeGreaterThan(gain90);
    });

    it('should never return less than 1', () => {
      const gain = calculateStatGain(1, 99);
      expect(gain).toBeGreaterThanOrEqual(1);
    });

    it('should use custom cap', () => {
      const gain50 = calculateStatGain(10, 25, 50);
      const gain100 = calculateStatGain(10, 25, 100);

      // 25 is 50% of 50 cap, but 25% of 100 cap
      expect(gain50).toBeLessThan(gain100);
    });

    it('should handle zero base gain', () => {
      const gain = calculateStatGain(0, 50);
      expect(gain).toBe(1); // Minimum 1
    });

    it('should handle stat at cap', () => {
      const gain = calculateStatGain(10, 100, 100);
      expect(gain).toBe(1); // Minimum even at cap
    });
  });

  describe('clampStats', () => {
    it('should clamp all stats to 0-100', () => {
      const stats = {
        health: 150,
        intelligence: -20,
        charisma: 50,
      };

      const clamped = clampStats(stats);

      expect(clamped.health).toBe(100);
      expect(clamped.intelligence).toBe(0);
      expect(clamped.charisma).toBe(50);
    });

    it('should not clamp money', () => {
      const stats = { money: 500 };
      const clamped = clampStats(stats);

      expect(clamped.money).toBe(500);
    });

    it('should handle partial stats object', () => {
      const stats = { intelligence: 80 };
      const clamped = clampStats(stats);

      expect(clamped).toHaveProperty('intelligence', 80);
      expect(Object.keys(clamped).length).toBe(1);
    });

    it('should handle empty object', () => {
      const clamped = clampStats({});
      expect(clamped).toEqual({});
    });
  });

  describe('applyStatEffect', () => {
    let baseStats: Stats;

    beforeEach(() => {
      baseStats = {
        health: 70,
        intelligence: 50,
        charisma: 40,
        discipline: 30,
        money: 100,
        energy: 80,
        familyRelation: 60,
      };
    });

    it('should apply single stat change', () => {
      const result = applyStatEffect(baseStats, { intelligence: 20 });

      expect(result.intelligence).toBe(20); // Set to 20, not added
      expect(result.health).toBe(70); // Unchanged
    });

    it('should apply multiple stat changes', () => {
      const result = applyStatEffect(baseStats, {
        health: 80,
        intelligence: 30,
        money: 150,
      });

      expect(result.health).toBe(80);
      expect(result.intelligence).toBe(30);
      expect(result.money).toBe(150);
    });

    it('should clamp stats to 0-100', () => {
      const result = applyStatEffect(baseStats, {
        health: 120, // Should clamp to 100
        intelligence: -10, // Should clamp to 0
      });

      expect(result.health).toBe(100);
      expect(result.intelligence).toBe(0);
    });

    it('should not clamp money below 0', () => {
      const result = applyStatEffect(baseStats, { money: -50 });
      expect(result.money).toBe(0); // Clamped to 0, but not to 100
    });

    it('should allow money > 100', () => {
      const result = applyStatEffect(baseStats, { money: 600 });
      expect(result.money).toBe(600);
    });

    it('should preserve unmodified stats', () => {
      const result = applyStatEffect(baseStats, { intelligence: 10 });

      expect(result.health).toBe(baseStats.health);
      expect(result.charisma).toBe(baseStats.charisma);
      expect(result.discipline).toBe(baseStats.discipline);
      expect(result.money).toBe(baseStats.money);
      expect(result.energy).toBe(baseStats.energy);
      expect(result.familyRelation).toBe(baseStats.familyRelation);
    });
  });

  describe('resetDailyEnergy', () => {
    it('should reset energy to max', () => {
      const stats: Stats = {
        health: 70,
        intelligence: 50,
        charisma: 40,
        discipline: 30,
        money: 100,
        energy: 20,
        familyRelation: 60,
      };

      const result = resetDailyEnergy(stats, 100);
      expect(result.energy).toBe(100);
    });

    it('should preserve other stats', () => {
      const stats: Stats = {
        health: 70,
        intelligence: 50,
        charisma: 40,
        discipline: 30,
        money: 100,
        energy: 20,
        familyRelation: 60,
      };

      const result = resetDailyEnergy(stats, 100);

      expect(result.health).toBe(70);
      expect(result.intelligence).toBe(50);
      expect(result.charisma).toBe(40);
      expect(result.money).toBe(100);
    });

    it('should handle custom max energy', () => {
      const stats: Stats = {
        health: 70,
        intelligence: 50,
        charisma: 40,
        discipline: 30,
        money: 100,
        energy: 50,
        familyRelation: 60,
      };

      const result = resetDailyEnergy(stats, 120);
      expect(result.energy).toBe(120);
    });

    it('should work even if current energy is full', () => {
      const stats: Stats = {
        health: 70,
        intelligence: 50,
        charisma: 40,
        discipline: 30,
        money: 100,
        energy: 100,
        familyRelation: 60,
      };

      const result = resetDailyEnergy(stats, 100);
      expect(result.energy).toBe(100);
    });
  });

  describe('Integration: Complex Stat Scenarios', () => {
    it('should handle stat update chain correctly', () => {
      let stats: Stats = {
        health: 50,
        intelligence: 40,
        charisma: 30,
        discipline: 20,
        money: 0,
        energy: 100,
        familyRelation: 50,
      };

      // Turn 1: Study
      const studyGain = calculateStudyGain(stats.intelligence);
      stats = applyStatEffect(stats, {
        intelligence: stats.intelligence + studyGain,
        energy: stats.energy - 20,
      });

      expect(stats.intelligence).toBeGreaterThan(40);
      expect(stats.energy).toBe(80);

      // Turn 2: Exercise  
      stats = applyStatEffect(stats, {
        health: stats.health + 10,
        energy: stats.energy - 20,
      });

      expect(stats.health).toBe(60);
      expect(stats.energy).toBe(60);

      // Turn 3: Work
      stats = applyStatEffect(stats, {
        money: stats.money + 50,
        energy: stats.energy - 30,
      });

      expect(stats.money).toBe(50);
      expect(stats.energy).toBe(30);

      // New day: Reset energy
      stats = resetDailyEnergy(stats, 100);
      expect(stats.energy).toBe(100);
    });

    it('should handle stat overflow correctly', () => {
      const stats: Stats = {
        health: 95,
        intelligence: 98,
        charisma: 92,
        discipline: 88,
        money: 500,
        energy: 90,
        familyRelation: 96,
      };

      const result = applyStatEffect(stats, {
        health: 120, // Set to 120, will clamp to 100
        intelligence: 115, // Set to 115, will clamp to 100
        charisma: 102, // Set to 102, will clamp to 100
      });

      expect(result.health).toBe(100);
      expect(result.intelligence).toBe(100);
      expect(result.charisma).toBe(100);
    });
  });
});
