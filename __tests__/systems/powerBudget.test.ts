import { POWER_BUDGET } from '../../src/config/gameBalance';
import { calculateDiminishingReturns } from '../../src/config/gameBalance';

describe('POWER_BUDGET config', () => {
  it('should have sane max stat gain per run', () => {
    expect(POWER_BUDGET.maxNetStatGainPerRun).toBeGreaterThan(0);
    expect(POWER_BUDGET.maxNetStatGainPerRun).toBeLessThanOrEqual(500);
  });

  it('should have daily net gain cap for age 7+', () => {
    expect(POWER_BUDGET.maxDailyNetGainAfterAge7).toBeGreaterThan(0);
    expect(POWER_BUDGET.maxDailyNetGainAfterAge7).toBeLessThanOrEqual(20);
  });

  it('should have diminishing start threshold below 100', () => {
    expect(POWER_BUDGET.diminishingStartPerStat).toBeGreaterThan(50);
    expect(POWER_BUDGET.diminishingStartPerStat).toBeLessThanOrEqual(100);
  });

  it('should have diminishing factor between 0 and 1', () => {
    expect(POWER_BUDGET.diminishingFactor).toBeGreaterThan(0);
    expect(POWER_BUDGET.diminishingFactor).toBeLessThan(1);
  });
});

describe('calculateDiminishingReturns (gameBalance helper)', () => {
  it('should give full gain below threshold', () => {
    const gain = calculateDiminishingReturns(30, 10, 100);
    expect(gain).toBe(10);
  });

  it('should reduce gain at mid level', () => {
    const gain = calculateDiminishingReturns(75, 10, 100);
    expect(gain).toBeLessThan(10);
    expect(gain).toBeGreaterThan(0);
  });

  it('should further reduce gain at cap', () => {
    const gainMid = calculateDiminishingReturns(75, 10, 100);
    const gainLate = calculateDiminishingReturns(100, 10, 100);
    expect(gainLate).toBeLessThan(gainMid);
    expect(gainLate).toBeGreaterThan(0);
  });

  it('should return negative gains unchanged', () => {
    const gain = calculateDiminishingReturns(80, -5, 100);
    expect(gain).toBe(-5);
  });

  it('should return 0 gain as 0', () => {
    const gain = calculateDiminishingReturns(80, 0, 100);
    expect(gain).toBe(0);
  });
});
