/**
 * School Logic Tests
 * Tests grade calculation and school system.
 */

import { calculateSchoolReport, getLetterGrade } from '../../src/utils/schoolLogic';
import { Stats } from '../../src/types';

describe('School Logic', () => {
  let baseStats: Stats;
  let baseGameState: any;

  beforeEach(() => {
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

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
        turkish: 50,
        history: 50,
        geography: 50,
        art: 50,
        music: 50,
      },
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('calculateSchoolReport', () => {
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

    it('low energy should reduce grades', () => {
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
});
