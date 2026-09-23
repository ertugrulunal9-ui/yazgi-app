import {
  applyLegacyBonusesToStats,
  applyRunToMetaProgression,
  calculateLegacyPointsForRun,
  createInitialMetaProgression,
  getLegacyBonusBreakdown,
} from '../../src/utils/metaProgression';
import { Stats } from '../../src/types';

const baseStats: Stats = {
  health: 50,
  intelligence: 50,
  charisma: 50,
  discipline: 50,
  money: 100,
  energy: 80,
  familyRelation: 50,
};

describe('metaProgression', () => {
  it('creates deterministic initial state with custom timestamp', () => {
    const meta = createInitialMetaProgression(123456);

    expect(meta.version).toBe(1);
    expect(meta.totalRunsCompleted).toBe(0);
    expect(meta.totalLegacyPoints).toBe(0);
    expect(meta.bestTier).toBeNull();
    expect(meta.updatedAt).toBe(123456);
    expect(meta.recentRuns).toEqual([]);
  });

  it('calculates run points with tier, compatibility and achievement caps', () => {
    const points = calculateLegacyPointsForRun({
      tier: 'LEGENDARY',
      compatibilityScore: 100,
      unlockedAchievementIds: new Array(20).fill('ach'),
    });

    expect(points).toBe(64); // 36 + 8 + capped 20
  });

  it('applies run to meta progression and tracks best tier/recent runs/achievements', () => {
    const current = createInitialMetaProgression(1);
    const { nextMeta, runSummary } = applyRunToMetaProgression(current, {
      runId: 'run_1',
      age: 18,
      endingId: 'ending_success',
      endingTitle: 'Parlak Gelecek',
      tier: 'SUCCESS',
      compatibilityScore: 74.4,
      selectedGoal: 'ACADEMIC',
      unlockedAchievementIds: ['a1', 'a2'],
      endedAt: 999,
    });

    expect(runSummary.pointsEarned).toBe(34); // 24 + 6 + 4
    expect(runSummary.compatibilityScore).toBe(74);
    expect(nextMeta.totalRunsCompleted).toBe(1);
    expect(nextMeta.totalLegacyPoints).toBe(34);
    expect(nextMeta.legacyLevel).toBe(0);
    expect(nextMeta.bestTier).toBe('SUCCESS');
    expect(nextMeta.highestCompatibilityScore).toBe(74);
    expect(nextMeta.highestAgeReached).toBe(18);
    expect(nextMeta.lifetimeAchievementIds.sort()).toEqual(['a1', 'a2']);
    expect(nextMeta.recentRuns[0].runId).toBe('run_1');
    expect(nextMeta.recentRuns[0].endedAt).toBe(999);
  });

  it('keeps only last 6 runs and updates legacy level from accumulated points', () => {
    let meta = createInitialMetaProgression(1);

    for (let i = 0; i < 8; i += 1) {
      const result = applyRunToMetaProgression(meta, {
        runId: `run_${i}`,
        age: 18,
        endingId: 'ending_leg',
        endingTitle: 'Efsane',
        tier: 'LEGENDARY',
        compatibilityScore: 100,
        selectedGoal: 'ATHLETIC',
        unlockedAchievementIds: [],
      });
      meta = result.nextMeta;
    }

    expect(meta.totalRunsCompleted).toBe(8);
    expect(meta.recentRuns).toHaveLength(6);
    expect(meta.recentRuns[0].runId).toBe('run_7');
    expect(meta.recentRuns[5].runId).toBe('run_2');
    expect(meta.legacyLevel).toBeGreaterThan(0);
  });

  it('returns unchanged stats when legacy level is zero', () => {
    const unchanged = applyLegacyBonusesToStats(baseStats, createInitialMetaProgression());
    expect(unchanged).toEqual(baseStats);
  });

  it('applies bounded stat bonuses for high legacy progression', () => {
    const boosted = applyLegacyBonusesToStats(baseStats, {
      ...createInitialMetaProgression(),
      totalLegacyPoints: 1600,
      legacyLevel: 25, // should be clamped in bonus logic
    });

    expect(boosted.health).toBe(60);
    expect(boosted.intelligence).toBe(60);
    expect(boosted.charisma).toBe(60);
    expect(boosted.discipline).toBe(60);
    expect(boosted.familyRelation).toBe(58);
    expect(boosted.money).toBe(350);
  });

  it('derives legacy bonus breakdown from level', () => {
    const bonus = getLegacyBonusBreakdown({
      ...createInitialMetaProgression(),
      legacyLevel: 4,
    });

    expect(bonus.level).toBe(4);
    expect(bonus.statBonus).toBe(4);
    expect(bonus.relationBonus).toBe(2);
    expect(bonus.moneyBonus).toBe(40);
  });
});
