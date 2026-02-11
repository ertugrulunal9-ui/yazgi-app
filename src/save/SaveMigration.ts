import { GameState, Stats } from '../types';
import { SaveSlotData, SaveSlotMetadata, SAVE_VERSION } from './SaveSlot';
import { generateChecksum } from '../utils/checksum';

interface LegacySaveData {
  playerName: string;
  stats: Stats;
  gameState: GameState;
}

export const detectLegacySave = async (storage: any): Promise<boolean> => {
  try {
    const legacyKey = 'game_save';
    const data = await storage.getItem(legacyKey);
    return data !== null;
  } catch {
    return false;
  }
};

export const migrateLegacySave = async (storage: any): Promise<SaveSlotData | null> => {
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

export const createMigrationBackup = async (storage: any, slotId: string, saveData: SaveSlotData): Promise<void> => {
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

const getAllBackupKeys = async (storage: any, slotId: string): Promise<string[]> => {
  try {
    const allKeys = await storage.getAllKeys();
    const backupKeys = allKeys.filter((key: string) => key.startsWith(`@yazgi_save/backup_${slotId}_`));
    return backupKeys.sort();
  } catch {
    return [];
  }
};
