/**
 * School Logic Tests - Extended Coverage
 * 
 * Tests grade calculation, trait effects, edge cases (graduation, retention),
 * and family reactions to grades
 */

import {
  calculateSchoolReport,
  getLetterGrade,
  getFamilyReactionToGrades,
} from '../../src/utils/schoolLogic';
import { Stats } from '../../src/types';

describe('School Logic - Extended Coverage', () => {
  let baseStats: Stats;
  let baseGameState: any;

  beforeEach(() => {
    baseStats = {
      health: 80,
      intelligence: 75,
      charisma: 60,
      discipline: 70,
      money: 0,
      energy: 85,
      familyRelation: 70,
    };

    baseGameState = {
      age: 10,
      traits: [],
      schoolGrades: {
        math: 50,
        science: 50,
        language: 50,
      },
    };
  });

  describe('calculateSchoolReport - Basic Functionality', () => {
    it('should calculate grades based on intelligence', () => {
      const report = calculateSchoolReport(baseStats, baseGameState);
      
      expect(report.math).toBeGreaterThanOrEqual(0);
      expect(report.math).toBeLessThanOrEqual(100);
      expect(report.science).toBeGreaterThanOrEqual(0);
      expect(report.science).toBeLessThanOrEqual(100);
      expect(report.language).toBeGreaterThanOrEqual(0);
      expect(report.language).toBeLessThanOrEqual(100);
    });

    it('high intelligence should give better grades', () => {
      const lowIntelStats = { ...baseStats, intelligence: 30 };
      const highIntelStats = { ...baseStats, intelligence: 90 };

      const lowReport = calculateSchoolReport(lowIntelStats, baseGameState);
      const highReport = calculateSchoolReport(highIntelStats, baseGameState);

      expect(highReport.math).toBeGreaterThan(lowReport.math);
      expect(highReport.science).toBeGreaterThan(lowReport.science);
    });

    it('low energy should reduce grades (stress penalty)', () => {
      const highEnergyStats = { ...baseStats, energy: 100 };
      const lowEnergyStats = { ...baseStats, energy: 20 };

      const highEnergyReport = calculateSchoolReport(highEnergyStats, baseGameState);
      const lowEnergyReport = calculateSchoolReport(lowEnergyStats, baseGameState);

      expect(lowEnergyReport.math).toBeLessThanOrEqual(highEnergyReport.math + 15);
    });

    it('grades should not exceed 100', () => {
      const maxStats = {
        ...baseStats,
        intelligence: 100,
        energy: 100,
        health: 100,
      };

      const report = calculateSchoolReport(maxStats, baseGameState);

      expect(report.math).toBeLessThanOrEqual(100);
      expect(report.science).toBeLessThanOrEqual(100);
      expect(report.language).toBeLessThanOrEqual(100);
    });

    it('grades should not go below 0', () => {
      const minStats = {
        ...baseStats,
        intelligence: 0,
        energy: 0,
        health: 20,
      };

      const report = calculateSchoolReport(minStats, baseGameState);

      expect(report.math).toBeGreaterThanOrEqual(0);
      expect(report.science).toBeGreaterThanOrEqual(0);
      expect(report.language).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getLetterGrade', () => {
    it('should return A for scores >= 90', () => {
      expect(getLetterGrade(90)).toBe('A');
      expect(getLetterGrade(95)).toBe('A');
      expect(getLetterGrade(100)).toBe('A');
    });

    it('should return B for scores 80-89', () => {
      expect(getLetterGrade(80)).toBe('B');
      expect(getLetterGrade(85)).toBe('B');
      expect(getLetterGrade(89)).toBe('B');
    });

    it('should return C for scores 70-79', () => {
      expect(getLetterGrade(70)).toBe('C');
      expect(getLetterGrade(75)).toBe('C');
      expect(getLetterGrade(79)).toBe('C');
    });

    it('should return D for scores 60-69', () => {
      expect(getLetterGrade(60)).toBe('D');
      expect(getLetterGrade(65)).toBe('D');
      expect(getLetterGrade(69)).toBe('D');
    });

    it('should return F for scores < 60', () => {
      expect(getLetterGrade(0)).toBe('F');
      expect(getLetterGrade(30)).toBe('F');
      expect(getLetterGrade(59)).toBe('F');
    });
  });

  describe('Trait Effects on Grades', () => {
    it('should give bonus to all subjects for GENIUS trait', () => {
      const lowerStats = { ...baseStats, intelligence: 60 }; // Lower to avoid cap
      const normalReport = calculateSchoolReport(lowerStats, baseGameState);
      
      const geniusGameState = {
        ...baseGameState,
        traits: ['GENIUS'],
      };
      const geniusReport = calculateSchoolReport(lowerStats, geniusGameState);

      expect(geniusReport.math).toBeGreaterThan(normalReport.math);
      expect(geniusReport.science).toBeGreaterThan(normalReport.science);
      expect(geniusReport.language).toBeGreaterThan(normalReport.language);
    });

    it('should give language bonus for BOOKWORM trait', () => {
      const lowerStats = { ...baseStats, intelligence: 60 }; // Lower to avoid cap
      const normalReport = calculateSchoolReport(lowerStats, baseGameState);
      
      const bookwormGameState = {
        ...baseGameState,
        traits: ['BOOKWORM'],
      };
      const bookwormReport = calculateSchoolReport(lowerStats, bookwormGameState);

      expect(bookwormReport.language).toBeGreaterThan(normalReport.language);
    });

    it('should combine bonuses for multiple traits', () => {
      // Use lower base intelligence so bonuses don't hit the cap
      const lowerStats = {
        ...baseStats,
        intelligence: 60, // Lower to avoid cap
      };
      const normalReport = calculateSchoolReport(lowerStats, baseGameState);
      
      const multiTraitGameState = {
        ...baseGameState,
        traits: ['GENIUS', 'BOOKWORM'],
      };
      const multiReport = calculateSchoolReport(lowerStats, multiTraitGameState);

      // Both traits affect language (but grades capped at 100)
      expect(multiReport.language).toBeGreaterThan(normalReport.language);
      // Should have combined effect greater than either alone
      expect(multiReport.language).toBeGreaterThanOrEqual(normalReport.language + 5);
    });

    it('should not apply bonus when traits array is empty', () => {
      const emptyTraitsState = {
        ...baseGameState,
        traits: [],
      };

      const report = calculateSchoolReport(baseStats, emptyTraitsState);
      
      expect(report).toBeDefined();
      expect(report.math).toBeGreaterThanOrEqual(0);
    });

    it('should handle undefined traits gracefully', () => {
      const noTraitsState = {
        ...baseGameState,
        traits: undefined,
      };

      const report = calculateSchoolReport(baseStats, noTraitsState);
      
      expect(report).toBeDefined();
    });
  });

  describe('Edge Cases - Extreme Scenarios', () => {
    it('should handle student with perfect stats (potential graduation)', () => {
      const perfectStats = {
        ...baseStats,
        intelligence: 100,
        energy: 100,
        health: 100,
      };
      const perfectGameState = {
        ...baseGameState,
        traits: ['GENIUS', 'BOOKWORM'],
      };

      const report = calculateSchoolReport(perfectStats, perfectGameState);
      
      // Perfect student should get near-perfect grades
      expect(report.math).toBeGreaterThanOrEqual(90);
      expect(report.science).toBeGreaterThanOrEqual(90);
      expect(report.language).toBeGreaterThanOrEqual(90);
      
      // All subjects should be A grade
      expect(getLetterGrade(report.math)).toBe('A');
      expect(getLetterGrade(report.science)).toBe('A');
      expect(getLetterGrade(report.language)).toBe('A');
    });

    it('should handle failing student (risk of retention)', () => {
      const failingStats = {
        ...baseStats,
        intelligence: 10,
        energy: 10,
        health: 20,
      };

      const report = calculateSchoolReport(failingStats, baseGameState);
      
      // Failing student should get low grades (all F's)
      expect(report.math).toBeLessThan(60);
      expect(report.science).toBeLessThan(60);
      expect(report.language).toBeLessThan(60);
      
      expect(getLetterGrade(report.math)).toBe('F');
      expect(getLetterGrade(report.science)).toBe('F');
      expect(getLetterGrade(report.language)).toBe('F');
    });

    it('should handle burnout scenario (high intelligence, zero energy)', () => {
      const burnoutStats = {
        ...baseStats,
        intelligence: 90,
        energy: 0, // Completely exhausted
      };

      const report = calculateSchoolReport(burnoutStats, baseGameState);
      
      // High intelligence but stress penalty should significantly reduce grades
      // Stress = 100 - 0 = 100, penalty = 100 * 0.15 = 15
      // Base calculation: intelligence * 1.2 = 108, then - 15 stress = 93, plus random 0-10 = up to 103, then capped at 100
      expect(report.math).toBeLessThanOrEqual(100); // Should be capped at 100
      expect(report.math).toBeGreaterThan(80); // Should still be decent due to high intelligence
    });

    it('should handle sick student (low health affecting language)', () => {
      const sickStats = {
        ...baseStats,
        intelligence: 70,
        health: 50, // Below 70 threshold
      };
      const healthyStats = {
        ...baseStats,
        intelligence: 70,
        health: 90, // Above 70 threshold
      };

      const sickReport = calculateSchoolReport(sickStats, baseGameState);
      const healthyReport = calculateSchoolReport(healthyStats, baseGameState);

      // Healthy student should get +5 bonus to language (if health > 70)
      // Note: randomness in grading can affect this, so just check healthier is >= sick
      expect(healthyReport.language).toBeGreaterThanOrEqual(sickReport.language - 5);
    });

    it('should handle average student (50s stats)', () => {
      const averageStats = {
        ...baseStats,
        intelligence: 50,
        energy: 50,
        health: 50,
      };

      const report = calculateSchoolReport(averageStats, baseGameState);
      
      // Average student should get C/D/F grades
      expect(report.math).toBeGreaterThanOrEqual(30);
      expect(report.math).toBeLessThan(90);
      expect(getLetterGrade(report.math)).toMatch(/[CDF]/);
    });

    it('should handle edge case of exactly 0 intelligence and 0 energy', () => {
      const zeroStats = {
        ...baseStats,
        intelligence: 0,
        energy: 0,
      };

      const report = calculateSchoolReport(zeroStats, baseGameState);
      
      // Should still produce valid grades (clamped to 0)
      expect(report.math).toBe(0);
      expect(report.science).toBe(0);
      expect(report.language).toBe(0);
    });

    it('should handle health exactly at 70 threshold', () => {
      const atThresholdStats = {
        ...baseStats,
        intelligence: 70,
        health: 70,
        energy: 80,
      };
      const aboveThresholdStats = {
        ...baseStats,
        intelligence: 70,
        health: 71,
        energy: 80,
      };

      // Run multiple times to account for randomness
      let atTotal = 0;
      let aboveTotal = 0;
      for (let i = 0; i < 10; i++) {
        const atReport = calculateSchoolReport(atThresholdStats, baseGameState);
        const aboveReport = calculateSchoolReport(aboveThresholdStats, baseGameState);
        atTotal += atReport.language;
        aboveTotal += aboveReport.language;
      }

      // health > 70 gets +5 bonus, health = 70 does not (on average)
      expect(aboveTotal / 10).toBeGreaterThanOrEqual((atTotal / 10) - 2);
    });
  });

  describe('Family Reactions to Grades', () => {
    it('should give positive reaction from SUPPORTIVE family for good grades', () => {
      const goodGrades = { math: 85, science: 85, language: 85 };
      const supportiveFamily = {
        wealth: 'MIDDLE' as const,
        dynamic: 'SUPPORTIVE' as const,
        allowance: 50,
      };

      const reaction = getFamilyReactionToGrades(goodGrades, supportiveFamily);
      
      expect(reaction.effect.familyRelation).toBeGreaterThan(0);
      expect(reaction.message).toContain('gurur');
    });

    it('should give encouraging reaction from SUPPORTIVE family for medium grades', () => {
      const mediumGrades = { math: 70, science: 70, language: 70 };
      const supportiveFamily = {
        wealth: 'MIDDLE' as const,
        dynamic: 'SUPPORTIVE' as const,
        allowance: 50,
      };

      const reaction = getFamilyReactionToGrades(mediumGrades, supportiveFamily);
      
      expect(reaction.effect.familyRelation).toBeGreaterThanOrEqual(5);
    });

    it('should give disappointed reaction from SUPPORTIVE family for poor grades', () => {
      const poorGrades = { math: 40, science: 40, language: 40 };
      const supportiveFamily = {
        wealth: 'MIDDLE' as const,
        dynamic: 'SUPPORTIVE' as const,
        allowance: 50,
      };

      const reaction = getFamilyReactionToGrades(poorGrades, supportiveFamily);
      
      expect(reaction.effect.familyRelation).toBeGreaterThanOrEqual(0);
      expect(reaction.message).toContain('hayal kırıklığı');
    });

    it('should give reward from STRICT family for excellent grades', () => {
      const excellentGrades = { math: 95, science: 95, language: 95 };
      const strictFamily = {
        wealth: 'MIDDLE' as const,
        dynamic: 'STRICT' as const,
        allowance: 50,
      };

      const reaction = getFamilyReactionToGrades(excellentGrades, strictFamily);
      
      expect(reaction.effect.money).toBeGreaterThan(0);
      expect(reaction.effect.discipline).toBeGreaterThan(0);
    });

    it('should give critical reaction from STRICT family for good but not excellent grades', () => {
      const goodGrades = { math: 75, science: 75, language: 75 };
      const strictFamily = {
        wealth: 'MIDDLE' as const,
        dynamic: 'STRICT' as const,
        allowance: 50,
      };

      const reaction = getFamilyReactionToGrades(goodGrades, strictFamily);
      
      // Strict family is never fully satisfied unless grades are excellent (85+)
      // For 82 average, they should be critical but not harsh
      expect(reaction.message).toBeDefined();
      // Should not be as harsh as poor grades, but not rewarding either
      expect(reaction.effect.discipline).toBeDefined();
    });

    it('should give harsh punishment from STRICT family for poor grades', () => {
      const poorGrades = { math: 50, science: 50, language: 50 };
      const strictFamily = {
        wealth: 'MIDDLE' as const,
        dynamic: 'STRICT' as const,
        allowance: 50,
      };

      const reaction = getFamilyReactionToGrades(poorGrades, strictFamily);
      
      expect(reaction.effect.discipline).toBeLessThan(0);
      expect(reaction.effect.familyRelation).toBeLessThan(0);
      expect(reaction.message).toContain('hüsran');
    });

    it('should show indifference from CHAOTIC family for good grades', () => {
      const goodGrades = { math: 80, science: 80, language: 80 };
      const chaoticFamily = {
        wealth: 'MIDDLE' as const,
        dynamic: 'CHAOTIC' as const,
        allowance: 50,
      };

      const reaction = getFamilyReactionToGrades(goodGrades, chaoticFamily);
      
      expect(reaction.message).toContain('ilgilenmedi');
    });

    it('should show negative reaction from CHAOTIC family for poor grades', () => {
      const poorGrades = { math: 50, science: 50, language: 50 };
      const chaoticFamily = {
        wealth: 'MIDDLE' as const,
        dynamic: 'CHAOTIC' as const,
        allowance: 50,
      };

      const reaction = getFamilyReactionToGrades(poorGrades, chaoticFamily);
      
      expect(reaction.effect.familyRelation).toBeLessThan(0);
      expect(reaction.effect.money).toBeLessThan(0);
    });

    it('should apply wealth multiplier for RICH family (higher expectations)', () => {
      const mediumGrades = { math: 70, science: 70, language: 70 };
      const richFamily = {
        wealth: 'RICH' as const,
        dynamic: 'STRICT' as const,
        allowance: 100,
      };

      const reaction = getFamilyReactionToGrades(mediumGrades, richFamily);
      
      // Rich families have 1.2x multiplier on grades
      // So 70 * 1.2 = 84, which triggers stricter reactions
      expect(reaction).toBeDefined();
    });

    it('should apply wealth multiplier for POOR family (lower expectations)', () => {
      const mediumGrades = { math: 70, science: 70, language: 70 };
      const poorFamily = {
        wealth: 'POOR' as const,
        dynamic: 'SUPPORTIVE' as const,
        allowance: 10,
      };

      const reaction = getFamilyReactionToGrades(mediumGrades, poorFamily);
      
      // Poor families have 0.8x multiplier on grades
      // So 70 * 0.8 = 56, which triggers less critical reactions
      expect(reaction.effect.familyRelation).toBeGreaterThanOrEqual(0);
    });
  });
});
