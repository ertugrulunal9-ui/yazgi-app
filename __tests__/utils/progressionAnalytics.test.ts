import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  __resetProgressionAnalyticsCache,
  buildProgressionCohortSnapshot,
  getAgePacingBucket,
  getEnergyCostBucket,
  getRetentionCheckpoint,
  shouldLogRetentionCheckpoint,
} from '../../src/utils/progressionAnalytics';

const INSTALL_TIMESTAMP_KEY = '@yazgi/analytics/install_ts';
const DAY_MS = 24 * 60 * 60 * 1000;

describe('progressionAnalytics', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    __resetProgressionAnalyticsCache();
  });

  it('maps energy cost to correct buckets', () => {
    expect(getEnergyCostBucket(0)).toBe('FREE');
    expect(getEnergyCostBucket(10)).toBe('LOW');
    expect(getEnergyCostBucket(30)).toBe('MEDIUM');
    expect(getEnergyCostBucket(45)).toBe('HIGH');
  });

  it('maps age to pacing buckets', () => {
    expect(getAgePacingBucket(3)).toBe('EARLY_FAST');
    expect(getAgePacingBucket(12)).toBe('SCHOOL_STEADY');
    expect(getAgePacingBucket(18)).toBe('ENDGAME');
  });

  it('maps day index to retention checkpoints', () => {
    expect(getRetentionCheckpoint(0)).toBe('D0');
    expect(getRetentionCheckpoint(1)).toBe('D1');
    expect(getRetentionCheckpoint(3)).toBe('D3');
    expect(getRetentionCheckpoint(2)).toBe('OTHER');
  });

  it('builds cohort snapshot with combined key', async () => {
    const now = Date.now();
    await AsyncStorage.setItem(INSTALL_TIMESTAMP_KEY, String(now - (3 * DAY_MS)));
    __resetProgressionAnalyticsCache();

    const snapshot = await buildProgressionCohortSnapshot({
      eventRarity: 'RARE',
      energyCost: 28,
      age: 9,
      turn: 12,
      totalTurns: 45,
      currentEnergy: 62,
      maxEnergy: 100,
    });

    expect(snapshot.daySinceInstall).toBe(3);
    expect(snapshot.retentionCheckpoint).toBe('D3');
    expect(snapshot.energyCostBucket).toBe('MEDIUM');
    expect(snapshot.agePacingBucket).toBe('SCHOOL_STEADY');
    expect(snapshot.cohortKey).toBe('RARE_MEDIUM_SCHOOL_STEADY');
  });

  it('logs D1 and D3 checkpoints only once', async () => {
    const firstD1 = await shouldLogRetentionCheckpoint('D1');
    const secondD1 = await shouldLogRetentionCheckpoint('D1');
    const firstD3 = await shouldLogRetentionCheckpoint('D3');
    const other = await shouldLogRetentionCheckpoint('OTHER');

    expect(firstD1).toBe(true);
    expect(secondD1).toBe(false);
    expect(firstD3).toBe(true);
    expect(other).toBe(false);
  });
});

