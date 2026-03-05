import { GameState, Stats } from '../types';
import { SaveSlotData, SaveSlotMetadata, SAVE_VERSION } from './SaveSlot';
import { createInitialMetaProgression } from '../utils/metaProgression';
import { generateChecksum } from '../utils/checksum';
import { AsyncStorageLike } from './storageTypes';

interface LegacySaveData {
  playerName: string;
  stats: Stats;
  gameState: GameState;
}

export const detectLegacySave = async (storage: AsyncStorageLike): Promise<boolean> => {
  try {
    const legacyKey = 'game_save';
    const data = await storage.getItem(legacyKey);
    return data !== null;
  } catch {
    return false;
  }
};

export const migrateLegacySave = async (storage: AsyncStorageLike): Promise<SaveSlotData | null> => {
  try {
    const legacyKey = 'game_save';
    const rawData = await storage.getItem(legacyKey);
    
    if (!rawData) return null;
    
    const legacyData = JSON.parse(rawData) as LegacySaveData;
    
    const metadata: SaveSlotMetadata = {
      slotId: '1',
      characterName: legacyData.playerName || 'Migrated Save',
      age: legacyData.gameState?.age || 0,
      playtime: legacyData.gameState?.totalTurns ? legacyData.gameState.totalTurns * 5 : 0,
      lastPlayed: Date.now(),
      version: SAVE_VERSION,
      checksum: generateChecksum({ playerName: legacyData.playerName, stats: legacyData.stats, gameState: legacyData.gameState }),
      status: 'active',
      isPremium: false,
    };
    
    const migratedSave: SaveSlotData = {
      metadata,
      playerName: legacyData.playerName,
      stats: legacyData.stats,
      gameState: legacyData.gameState,
    };
    
    await storage.setItem(`@yazgi_save/backup_legacy`, rawData);
    
    return migratedSave;
  } catch (error) {
    console.error('Legacy save migration failed:', error);
    return null;
  }
};

export const migrateToVersion = (saveData: SaveSlotData, targetVersion: number): SaveSlotData => {
  const currentVersion = saveData.metadata.version;
  
  if (currentVersion === targetVersion) {
    return saveData;
  }
  
  let migrated = { ...saveData };
  
  if (currentVersion < 1 && targetVersion >= 1) {
    migrated = migrateV0ToV1(migrated);
  }

  if (currentVersion < 2 && targetVersion >= 2) {
    migrated = migrateV1ToV2(migrated);
  }

  if (currentVersion < 3 && targetVersion >= 3) {
    migrated = migrateV2ToV3(migrated);
  }

  if (currentVersion < 4 && targetVersion >= 4) {
    migrated = migrateV3ToV4(migrated);
  }

  if (currentVersion < 5 && targetVersion >= 5) {
    migrated = migrateV4ToV5(migrated);
  }

  migrated.metadata.version = targetVersion;
  migrated.metadata.checksum = generateChecksum({
    playerName: migrated.playerName,
    stats: migrated.stats,
    gameState: migrated.gameState,
  });
  
  return migrated;
};

const migrateV0ToV1 = (saveData: SaveSlotData): SaveSlotData => {
  return {
    ...saveData,
    gameState: {
      ...saveData.gameState,
      unlockedAchievements: saveData.gameState.unlockedAchievements || [],
      achievementProgress: saveData.gameState.achievementProgress || {},
      eventFrequency: saveData.gameState.eventFrequency || {},
    },
  };
};

const migrateV1ToV2 = (saveData: SaveSlotData): SaveSlotData => {
  const gameState = saveData.gameState;

  return {
    ...saveData,
    gameState: {
      ...gameState,
      activeBuffs: Array.isArray(gameState.activeBuffs) ? gameState.activeBuffs : [],
      consumableCooldowns:
        gameState.consumableCooldowns && typeof gameState.consumableCooldowns === 'object'
          ? gameState.consumableCooldowns
          : {},
      consumableUsageThisTurn:
        gameState.consumableUsageThisTurn && typeof gameState.consumableUsageThisTurn === 'object'
          ? gameState.consumableUsageThisTurn
          : {},
      scars: Array.isArray(gameState.scars) ? gameState.scars : [],
    },
  };
};

const migrateV2ToV3 = (saveData: SaveSlotData): SaveSlotData => {
  const existingMeta = saveData.gameState?.metaProgression;
  return {
    ...saveData,
    gameState: {
      ...saveData.gameState,
      metaProgression: {
        ...createInitialMetaProgression(),
        ...(existingMeta ?? {}),
        goalCompletions: (existingMeta as any)?.goalCompletions ?? {},
        unlockedEventIds: (existingMeta as any)?.unlockedEventIds ?? [],
        unlockedRunModifiers: (existingMeta as any)?.unlockedRunModifiers ?? [],
      },
    },
  };
};

const migrateV3ToV4 = (saveData: SaveSlotData): SaveSlotData => {
  const gs = saveData.gameState;
  return {
    ...saveData,
    gameState: {
      ...gs,
      permanentFlags: (gs as any).permanentFlags ?? {},
      microGoals: Array.isArray((gs as any).microGoals) ? (gs as any).microGoals : [],
      seasonGoal: (gs as any).seasonGoal ?? null,
      savingGoals: Array.isArray((gs as any).savingGoals) ? (gs as any).savingGoals : [],
      ageMilestoneSummaries: Array.isArray((gs as any).ageMilestoneSummaries)
        ? (gs as any).ageMilestoneSummaries
        : [],
      _ageStartStats: (gs as any)._ageStartStats ?? undefined,
      _ageStartNpcs: Array.isArray((gs as any)._ageStartNpcs) ? (gs as any)._ageStartNpcs : undefined,
      _ageStartGrades: (gs as any)._ageStartGrades ?? undefined,
      undoSnapshot: null,
      undosUsedThisAge: (gs as any).undosUsedThisAge ?? 0,
    },
  };
};

const migrateV4ToV5 = (saveData: SaveSlotData): SaveSlotData => {
  const gs = saveData.gameState;
  return {
    ...saveData,
    gameState: {
      ...gs,
      purchasedItems: Array.isArray((gs as any).purchasedItems)
        ? (gs as any).purchasedItems
        : [],
    },
  };
};

export const createMigrationBackup = async (storage: AsyncStorageLike, slotId: string, saveData: SaveSlotData): Promise<void> => {
  try {
    const backupKey = `@yazgi_save/backup_${slotId}_${Date.now()}`;
    await storage.setItem(backupKey, JSON.stringify(saveData));
    
    const maxBackups = 3;
    const backupKeys = await getAllBackupKeys(storage, slotId);
    if (backupKeys.length > maxBackups) {
      const oldestBackups = backupKeys.slice(0, backupKeys.length - maxBackups);
      for (const key of oldestBackups) {
        await storage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Failed to create migration backup:', error);
  }
};

const getAllBackupKeys = async (storage: AsyncStorageLike, slotId: string): Promise<string[]> => {
  try {
    const allKeys = await storage.getAllKeys();
    const backupKeys = allKeys.filter((key: string) => key.startsWith(`@yazgi_save/backup_${slotId}_`));
    return [...backupKeys].sort();
  } catch {
    return [];
  }
};
