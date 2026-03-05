/**
 * Experiment Bucketing + GA4 Flag Params
 *
 * - Kullanicilari control/treatment bucket'larina atar (sticky, device-id bazli)
 * - Feature flag state'ini GA4-uyumlu flat params'a donusturur
 * - flags_bitmask: 10-bit binary string
 * - Kritik 4 flag ayri 0/1 integer
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { type FeatureFlag, isFeatureEnabled } from '../config/featureFlags';

// ============================================================================
// EXPERIMENT BUCKETING
// ============================================================================

export type ExperimentBucket = 'control' | 'treatment';

const BUCKET_STORAGE_KEY = '@yazgi/experiment_bucket/v1';
const CONTROL_RATIO = 0.10; // %10 holdout

let cachedBucket: ExperimentBucket | null = null;

/**
 * Deterministic bucket assignment.
 * Device-id bazli hash ile stabil atama yapar.
 * Bir kez atandiktan sonra AsyncStorage'da saklanir.
 */
export const getExperimentBucket = async (): Promise<ExperimentBucket> => {
  if (cachedBucket) return cachedBucket;

  try {
    const stored = await AsyncStorage.getItem(BUCKET_STORAGE_KEY);
    if (stored === 'control' || stored === 'treatment') {
      cachedBucket = stored;
      return stored;
    }
  } catch {
    // Fallback to assignment
  }

  // Yeni assignment
  const bucket: ExperimentBucket = Math.random() < CONTROL_RATIO ? 'control' : 'treatment';
  cachedBucket = bucket;

  try {
    await AsyncStorage.setItem(BUCKET_STORAGE_KEY, bucket);
  } catch {
    // Non-critical, next launch will re-assign
  }

  return bucket;
};

/**
 * Sync version — sadece cache'den okur.
 * initExperimentBucket() cagrilmadan once 'treatment' doner.
 */
export const getExperimentBucketSync = (): ExperimentBucket => cachedBucket ?? 'treatment';

/**
 * App baslangicinda bir kez cagrilir.
 */
export const initExperimentBucket = async (): Promise<ExperimentBucket> => {
  return getExperimentBucket();
};

// ============================================================================
// FLAGS BITMASK (GA4 uyumlu)
// ============================================================================

/** Flag sirasi — MSB'den LSB'ye (bitmask string icin) */
const FLAG_ORDER: FeatureFlag[] = [
  'PARTIAL_ENERGY_RECOVERY',
  'VARIETY_BONUS',
  'REPETITION_PENALTY',
  'CONSUMABLE_ITEMS',
  'CAREER_PATH_ACTIONS',
  'LEGACY_PERKS',
  'MILESTONE_SUMMARY',
  'FATE_TRANSPARENCY',
  'ECONOMY_DEPTH',
  'MICRO_GOALS',
];

/**
 * Mevcut flag state'ini 10-bit binary string olarak doner.
 * Ornek: "1010001100"
 */
export const buildFlagsBitmask = (): string => {
  return FLAG_ORDER.map(flag => isFeatureEnabled(flag) ? '1' : '0').join('');
};

/**
 * GA4 event'lerine eklenecek ortak experiment + flag parametreleri.
 * Tum degerler flat (nested object yok).
 */
export interface ExperimentParams {
  experiment_bucket: string;
  flags_bitmask: string;
  flag_energy: number;
  flag_consumable: number;
  flag_variety: number;
  flag_career: number;
}

export const buildExperimentParams = (): ExperimentParams => ({
  experiment_bucket: getExperimentBucketSync(),
  flags_bitmask: buildFlagsBitmask(),
  flag_energy: isFeatureEnabled('PARTIAL_ENERGY_RECOVERY') ? 1 : 0,
  flag_consumable: isFeatureEnabled('CONSUMABLE_ITEMS') ? 1 : 0,
  flag_variety: isFeatureEnabled('VARIETY_BONUS') ? 1 : 0,
  flag_career: isFeatureEnabled('CAREER_PATH_ACTIONS') ? 1 : 0,
});

// ============================================================================
// FOR TESTING
// ============================================================================

export const __resetBucketCache = (): void => {
  cachedBucket = null;
};
