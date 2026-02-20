import {
  runAutoPlayerSimulation,
  runSideBySideSimulation,
  runWealthEconomyNaturalEndSimulation,
} from '../../src/tests/simulateGame';

describe('simulateGame autoplayer', () => {
  it('runs a small batch and returns consistent aggregate metrics', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const summary = runAutoPlayerSimulation(5);
      const totalTierCount = Object.values(summary.tiers).reduce((sum, value) => sum + value, 0);

      expect(summary.runs).toBe(5);
      expect(totalTierCount).toBe(5);
      expect(summary.averageTierScore).toBeGreaterThanOrEqual(0);
      expect(summary.averageTierScore).toBeLessThanOrEqual(3);
      expect(summary.breakdownRate).toBeGreaterThanOrEqual(0);
      expect(summary.breakdownRate).toBeLessThanOrEqual(100);
      expect(summary.targetSuccessRate).toBeGreaterThanOrEqual(0);
      expect(summary.targetSuccessRate).toBeLessThanOrEqual(100);
      expect(summary.targetSuccessRateAllRuns).toBeGreaterThanOrEqual(0);
      expect(summary.targetSuccessRateAllRuns).toBeLessThanOrEqual(100);
      expect(summary.profile).toBe('BALANCED');
    } finally {
      logSpy.mockRestore();
    }
  });

  it('generates side-by-side report for balanced and risktaker profiles', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const report = runSideBySideSimulation(3);

      expect(report.runs).toBe(3);
      expect(report.balanced.profile).toBe('BALANCED');
      expect(report.risktaker.profile).toBe('RISKTAKER');
      expect(report.balanced.runs).toBe(3);
      expect(report.risktaker.runs).toBe(3);
    } finally {
      logSpy.mockRestore();
    }
  });

  it('generates natural-end wealth economy report', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    try {
      const report = runWealthEconomyNaturalEndSimulation({ runs: 3, profile: 'BALANCED' });

      expect(report.runs).toBe(3);
      expect(report.profile).toBe('BALANCED');
      expect(report.summaries).toHaveLength(3);
      report.summaries.forEach(summary => {
        expect(summary.runs).toBe(3);
        expect(summary.averageTurns).toBeGreaterThan(0);
        expect(summary.maxTurns).toBeGreaterThanOrEqual(summary.minTurns);
      });
    } finally {
      logSpy.mockRestore();
    }
  });
});
