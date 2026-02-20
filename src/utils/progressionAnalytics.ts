import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventRarity } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const INSTALL_TIMESTAMP_KEY = '@yazgi/analytics/install_ts';
const RETENTION_CHECKPOINTS_KEY = '@yazgi/analytics/retention_checkpoints';
let cachedInstallTimestamp: number | null = null;
let cachedRetentionCheckpoints: Set<RetentionCheckpoint> | null = null;

export type EnergyCostBucket = 'FREE' | 'LOW' | 'MEDIUM' | 'HIGH';
export type AgePacingBucket = 'EARLY_FAST' | 'SCHOOL_STEADY' | 'ENDGAME';
export type RetentionCheckpoint = 'D0' | 'D1' | 'D3' | 'OTHER';
export type CohortEventRarity = EventRarity | 'UNKNOWN';

export interface ProgressionCohortInput {
  eventRarity?: EventRarity;
  energyCost: number;
  age: number;
  turn: number;
  totalTurns: number;
  currentEnergy: number;
  maxEnergy: number;
}

export interface ProgressionCohortSnapshot extends Omit<ProgressionCohortInput, 'eventRarity'> {
  eventRarity: CohortEventRarity;
  energyCostBucket: EnergyCostBucket;
  agePacingBucket: AgePacingBucket;
  daySinceInstall: number;
  retentionCheckpoint: RetentionCheckpoint;
  cohortKey: string;
}

const parseNumber = (value: string | null): number | null => {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

export const getEnergyCostBucket = (energyCost: number): EnergyCostBucket => {
  const cost = Math.max(0, Math.ceil(energyCost));
  if (cost === 0) return 'FREE';
  if (cost <= 15) return 'LOW';
  if (cost <= 30) return 'MEDIUM';
  return 'HIGH';
};

export const getAgePacingBucket = (age: number): AgePacingBucket => {
  if (age < 7) return 'EARLY_FAST';
  if (age < 18) return 'SCHOOL_STEADY';
  return 'ENDGAME';
};

export const getDaySinceInstall = (installTimestamp: number, now: number = Date.now()): number => {
  const elapsed = Math.max(0, now - installTimestamp);
  return Math.floor(elapsed / MS_PER_DAY);
};

export const getRetentionCheckpoint = (daySinceInstall: number): RetentionCheckpoint => {
  if (daySinceInstall === 0) return 'D0';
  if (daySinceInstall === 1) return 'D1';
  if (daySinceInstall === 3) return 'D3';
  return 'OTHER';
};

export const getOrCreateInstallTimestamp = async (now: number = Date.now()): Promise<number> => {
  if (cachedInstallTimestamp) return cachedInstallTimestamp;

  const stored = await AsyncStorage.getItem(INSTALL_TIMESTAMP_KEY);
  const parsed = parseNumber(stored);
  if (parsed) {
    cachedInstallTimestamp = parsed;
    return parsed;
  }

  await AsyncStorage.setItem(INSTALL_TIMESTAMP_KEY, String(now));
  cachedInstallTimestamp = now;
  return now;
};

const getLoggedRetentionCheckpoints = async (): Promise<Set<RetentionCheckpoint>> => {
  if (cachedRetentionCheckpoints) {
    return new Set(cachedRetentionCheckpoints);
  }

  const raw = await AsyncStorage.getItem(RETENTION_CHECKPOINTS_KEY);
  if (!raw) {
    cachedRetentionCheckpoints = new Set<RetentionCheckpoint>();
    return new Set<RetentionCheckpoint>();
  }
  try {
    const parsed = JSON.parse(raw) as RetentionCheckpoint[];
    cachedRetentionCheckpoints = new Set(parsed);
    return new Set(cachedRetentionCheckpoints);
  } catch {
    cachedRetentionCheckpoints = new Set<RetentionCheckpoint>();
    return new Set<RetentionCheckpoint>();
  }
};

const setLoggedRetentionCheckpoints = async (checkpoints: Set<RetentionCheckpoint>): Promise<void> => {
  cachedRetentionCheckpoints = new Set(checkpoints);
  await AsyncStorage.setItem(
    RETENTION_CHECKPOINTS_KEY,
    JSON.stringify(Array.from(checkpoints))
  );
};

export const shouldLogRetentionCheckpoint = async (
  checkpoint: RetentionCheckpoint
): Promise<boolean> => {
  if (checkpoint !== 'D1' && checkpoint !== 'D3') return false;
  const logged = await getLoggedRetentionCheckpoints();
  if (logged.has(checkpoint)) return false;
  logged.add(checkpoint);
  await setLoggedRetentionCheckpoints(logged);
  return true;
};

export const buildProgressionCohortSnapshot = async (
  input: ProgressionCohortInput
): Promise<ProgressionCohortSnapshot> => {
  const installTimestamp = await getOrCreateInstallTimestamp();
  const daySinceInstall = getDaySinceInstall(installTimestamp);
  const retentionCheckpoint = getRetentionCheckpoint(daySinceInstall);
  const energyCostBucket = getEnergyCostBucket(input.energyCost);
  const agePacingBucket = getAgePacingBucket(input.age);
  const eventRarity = input.eventRarity ?? 'UNKNOWN';
  const cohortKey = `${eventRarity}_${energyCostBucket}_${agePacingBucket}`;

  return {
    ...input,
    eventRarity,
    energyCostBucket,
    agePacingBucket,
    daySinceInstall,
    retentionCheckpoint,
    cohortKey,
  };
};

export const __resetProgressionAnalyticsCache = (): void => {
  cachedInstallTimestamp = null;
  cachedRetentionCheckpoints = null;
};
