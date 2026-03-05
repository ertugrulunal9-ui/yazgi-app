import {
  getExperimentBucket,
  getExperimentBucketSync,
  initExperimentBucket,
  buildFlagsBitmask,
  buildExperimentParams,
  __resetBucketCache,
} from '../../src/utils/experimentBucketing';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock featureFlags
jest.mock('../../src/config/featureFlags', () => ({
  FEATURE_FLAGS: {
    PARTIAL_ENERGY_RECOVERY: false,
    VARIETY_BONUS: false,
    REPETITION_PENALTY: false,
    CONSUMABLE_ITEMS: false,
    CAREER_PATH_ACTIONS: false,
    LEGACY_PERKS: false,
    MILESTONE_SUMMARY: true,
    FATE_TRANSPARENCY: true,
    ECONOMY_DEPTH: true,
    MICRO_GOALS: true,
  },
  isFeatureEnabled: jest.fn((flag: string) => false),
}));

const { isFeatureEnabled } = require('../../src/config/featureFlags');

beforeEach(() => {
  __resetBucketCache();
  jest.clearAllMocks();
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
  (isFeatureEnabled as jest.Mock).mockReturnValue(false);
});

describe('Experiment Bucketing', () => {
  describe('getExperimentBucket', () => {
    it('assigns bucket and persists to storage', async () => {
      const bucket = await getExperimentBucket();
      expect(['control', 'treatment']).toContain(bucket);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@yazgi/experiment_bucket/v1',
        bucket,
      );
    });

    it('returns cached bucket on subsequent calls', async () => {
      const first = await getExperimentBucket();
      const second = await getExperimentBucket();
      expect(first).toBe(second);
      // Only one storage write
      expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
    });

    it('restores bucket from storage', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('control');
      const bucket = await getExperimentBucket();
      expect(bucket).toBe('control');
      // No new write since it was restored
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('getExperimentBucketSync', () => {
    it('returns treatment before initialization', () => {
      expect(getExperimentBucketSync()).toBe('treatment');
    });

    it('returns cached bucket after init', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('control');
      await initExperimentBucket();
      expect(getExperimentBucketSync()).toBe('control');
    });
  });

  describe('bucket stability', () => {
    it('same user always gets same bucket (sticky assignment)', async () => {
      // Simulate stored assignment
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('treatment');
      const b1 = await getExperimentBucket();
      __resetBucketCache();
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('treatment');
      const b2 = await getExperimentBucket();
      expect(b1).toBe(b2);
    });
  });
});

describe('Flags Bitmask', () => {
  it('returns 10-char binary string', () => {
    const bitmask = buildFlagsBitmask();
    expect(bitmask).toHaveLength(10);
    expect(bitmask).toMatch(/^[01]{10}$/);
  });

  it('all zeros when no flags enabled', () => {
    const bitmask = buildFlagsBitmask();
    expect(bitmask).toBe('0000000000');
  });

  it('reflects enabled flags in correct positions', () => {
    // Enable PARTIAL_ENERGY_RECOVERY (bit 0 = MSB) and CONSUMABLE_ITEMS (bit 3)
    (isFeatureEnabled as jest.Mock).mockImplementation((flag: string) => {
      return flag === 'PARTIAL_ENERGY_RECOVERY' || flag === 'CONSUMABLE_ITEMS';
    });
    const bitmask = buildFlagsBitmask();
    expect(bitmask[0]).toBe('1'); // PARTIAL_ENERGY_RECOVERY
    expect(bitmask[3]).toBe('1'); // CONSUMABLE_ITEMS
    expect(bitmask[1]).toBe('0'); // VARIETY_BONUS
  });
});

describe('buildExperimentParams', () => {
  it('returns flat GA4-compatible params', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('treatment');
    await initExperimentBucket();

    const params = buildExperimentParams();
    expect(params.experiment_bucket).toBe('treatment');
    expect(params.flags_bitmask).toMatch(/^[01]{10}$/);
    expect(typeof params.flag_energy).toBe('number');
    expect(typeof params.flag_consumable).toBe('number');
    expect(typeof params.flag_variety).toBe('number');
    expect(typeof params.flag_career).toBe('number');
    expect([0, 1]).toContain(params.flag_energy);
  });

  it('flag integers match bitmask positions', async () => {
    (isFeatureEnabled as jest.Mock).mockImplementation((flag: string) => {
      return flag === 'VARIETY_BONUS' || flag === 'CAREER_PATH_ACTIONS';
    });
    await initExperimentBucket();

    const params = buildExperimentParams();
    expect(params.flag_variety).toBe(1);
    expect(params.flag_career).toBe(1);
    expect(params.flag_energy).toBe(0);
    expect(params.flag_consumable).toBe(0);
  });
});
