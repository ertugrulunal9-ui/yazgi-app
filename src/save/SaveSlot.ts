import { GameState, Stats } from '../types';

export const SAVE_VERSION = 2;
export const SAVE_SCHEMA_VERSION = 2;
export const SAVE_EXPORT_VERSION = 2;
export const MAX_TOTAL_SLOTS = 6;
export const MAX_PREMIUM_SLOTS = 0;
export const MAX_FREE_SLOTS = MAX_TOTAL_SLOTS;
export const AUTO_SAVE_SLOT_ID = 'auto';
export const MAX_BACKUP_HISTORY = 5;

export type SlotStatus = 'empty' | 'active' | 'corrupted';
export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'error' | 'offline';

export interface SaveSlotMetadata {
  slotId: string;
  characterName: string;
  age: number;
  playtime: number;
  lastPlayed: number;
  version: number;
  checksum: string;
  schemaVersion?: number;
  saveId?: string;
  deviceId?: string;
  revision?: number;
  clientRevision?: number;
  createdAt?: number;
  updatedAt?: number;
  idempotencyKey?: string;
  migrationState?: 'pending' | 'migrated' | 'conflict';
  thumbnail?: string;
  status: SlotStatus;
  isPremium: boolean;
}

export interface SaveSlotData {
  metadata: SaveSlotMetadata;
  playerName: string;
  stats: Stats;
  gameState: GameState;
}

export interface CompressedSaveData {
  compressed: string;
  checksum: string;
  version: number;
}

export interface SaveBackup {
  slotId: string;
  timestamp: number;
  data: SaveSlotData;
}

export interface SaveExportManifest {
  manifestVersion: number;
  slotIds: string[];
  saveCount: number;
  backupCount: number;
  createdAt: number;
  checksum: string;
}

export interface SaveExportPackage {
  exportVersion: number;
  appVersion: string;
  exportedAt: number;
  manifest: SaveExportManifest;
  saves: SaveSlotData[];
  backups: SaveBackup[];
}

export interface CloudSyncState {
  enabled: boolean;
  lastSync: number;
  status: SyncStatus;
  pendingSlots: string[];
}

export interface SaveManagerState {
  slots: Record<string, SaveSlotData | null>;
  metadata: Record<string, SaveSlotMetadata | null>;
  autoSaveEnabled: boolean;
  lastAutoSave: number;
  cloudSync: CloudSyncState;
  isPremiumUnlocked: boolean;
  adsDisabled: boolean;
}

export const EMPTY_SLOT_METADATA: Omit<SaveSlotMetadata, 'slotId' | 'isPremium'> = {
  characterName: '',
  age: 0,
  playtime: 0,
  lastPlayed: 0,
  version: SAVE_VERSION,
  checksum: '',
  status: 'empty',
};

export const createEmptySlot = (slotId: string, isPremium: boolean = false): SaveSlotMetadata => ({
  ...EMPTY_SLOT_METADATA,
  slotId,
  isPremium,
});

export const getSlotKey = (slotId: string, version: number = SAVE_VERSION): string => `@yazgi_save/slot_${slotId}/v${version}`;
export const getMetadataKey = (slotId: string, version: number = SAVE_VERSION): string => `@yazgi_save/meta_${slotId}/v${version}`;
export const getBackupKey = (slotId: string): string => `@yazgi_save/backup_${slotId}`;
export const getManagerStateKey = (): string => `@yazgi_save/manager_state`;
export const getLegacySaveKey = (): string => 'game_save';
