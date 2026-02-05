import AsyncStorage from '@react-native-async-storage/async-storage';
import { SaveSlotData, SaveSlotMetadata, SaveManagerState, SaveBackup, CompressedSaveData, SAVE_VERSION, MAX_FREE_SLOTS, MAX_TOTAL_SLOTS, AUTO_SAVE_SLOT_ID, createEmptySlot, getSlotKey, getMetadataKey, getBackupKey, getManagerStateKey } from './SaveSlot';
import { compressSaveData, decompressSaveData } from './SaveCompression';
import { detectLegacySave, migrateLegacySave, migrateToVersion, createMigrationBackup } from './SaveMigration';
import { generateChecksum, validateChecksum } from '../utils/checksum';

const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;

class SaveManager {
  private static instance: SaveManager;
  private storage: any;
  private state: SaveManagerState;
  private autoSaveTimer: NodeJS.Timeout | null = null;

  private constructor() {
    this.storage = AsyncStorage;
    this.state = {
      slots: {},
      metadata: {},
      autoSaveEnabled: true,
      lastAutoSave: 0,
      cloudSync: {
        enabled: false,
        lastSync: 0,
        status: 'offline',
        pendingSlots: [],
      },
      isPremiumUnlocked: false,
    };
  }

  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      await this.loadManagerState();
      
      const hasLegacy = await detectLegacySave(this.storage);
      if (hasLegacy) {
        console.log('Legacy save detected, migrating...');
        await this.migrateLegacySaveToSlot();
      }
      
      await this.loadAllSlotMetadata();
      
      if (this.state.autoSaveEnabled) {
        this.startAutoSave();
      }
    } catch (error) {
      console.error('SaveManager initialization failed:', error);
    }
  }

  async getAllSlotMetadata(): Promise<SaveSlotMetadata[]> {
    const metadata: SaveSlotMetadata[] = [];
    const maxSlots = this.state.isPremiumUnlocked ? MAX_TOTAL_SLOTS : MAX_FREE_SLOTS;
    
    for (let i = 1; i <= maxSlots; i++) {
      const slotId = i.toString();
      const meta = this.state.metadata[slotId] || createEmptySlot(slotId, i > MAX_FREE_SLOTS);
      metadata.push(meta);
    }
    
    const autoSaveMeta = this.state.metadata[AUTO_SAVE_SLOT_ID];
    if (autoSaveMeta) {
      metadata.unshift(autoSaveMeta);
    }
    
    return metadata;
  }

  async saveToSlot(slotId: string, playerName: string, stats: any, gameState: any): Promise<boolean> {
    try {
      const isPremium = parseInt(slotId) > MAX_FREE_SLOTS;
      if (isPremium && !this.state.isPremiumUnlocked && slotId !== AUTO_SAVE_SLOT_ID) {
        throw new Error('Premium slot locked');
      }

      const existingMeta = this.state.metadata[slotId];
      const playtime = existingMeta ? existingMeta.playtime + 1 : 0;

      const saveData: SaveSlotData = {
        metadata: {
          slotId,
          characterName: playerName,
          age: gameState.age,
          playtime,
          lastPlayed: Date.now(),
          version: SAVE_VERSION,
          checksum: generateChecksum({ playerName, stats, gameState }),
          status: 'active',
          isPremium,
        },
        playerName,
        stats,
        gameState,
      };

      const compressed = compressSaveData(saveData);
      
      await this.storage.setItem(getSlotKey(slotId), JSON.stringify(compressed));
      await this.storage.setItem(getMetadataKey(slotId), JSON.stringify(saveData.metadata));
      
      this.state.metadata[slotId] = saveData.metadata;
      this.state.slots[slotId] = saveData;
      
      await this.saveManagerState();
      
      await this.createBackup(slotId, saveData);
      
      if (this.state.cloudSync.enabled && slotId !== AUTO_SAVE_SLOT_ID) {
        this.state.cloudSync.pendingSlots.push(slotId);
      }
      
      return true;
    } catch (error) {
      console.error(`Save to slot ${slotId} failed:`, error);
      return false;
    }
  }

  async loadFromSlot(slotId: string): Promise<SaveSlotData | null> {
    try {
      const rawData = await this.storage.getItem(getSlotKey(slotId));
      if (!rawData) return null;

      const compressed = JSON.parse(rawData) as CompressedSaveData;
      const saveData = decompressSaveData(compressed);
      
      if (!saveData) {
        console.error(`Slot ${slotId} corrupted, attempting restore from backup`);
        return await this.restoreFromBackup(slotId);
      }

      if (saveData.metadata.version < SAVE_VERSION) {
        console.log(`Migrating slot ${slotId} from v${saveData.metadata.version} to v${SAVE_VERSION}`);
        await createMigrationBackup(this.storage, slotId, saveData);
        const migrated = migrateToVersion(saveData, SAVE_VERSION);
        await this.saveToSlot(slotId, migrated.playerName, migrated.stats, migrated.gameState);
        return migrated;
      }

      const isValid = validateChecksum(
        { playerName: saveData.playerName, stats: saveData.stats, gameState: saveData.gameState },
        saveData.metadata.checksum
      );

      if (!isValid) {
        console.error(`Slot ${slotId} checksum invalid, attempting restore`);
        return await this.restoreFromBackup(slotId);
      }

      this.state.slots[slotId] = saveData;
      this.state.metadata[slotId] = saveData.metadata;
      
      return saveData;
    } catch (error) {
      console.error(`Load from slot ${slotId} failed:`, error);
      return await this.restoreFromBackup(slotId);
    }
  }

  async deleteSlot(slotId: string): Promise<boolean> {
    try {
      if (slotId === AUTO_SAVE_SLOT_ID) {
        throw new Error('Cannot delete auto-save slot');
      }

      await this.storage.removeItem(getSlotKey(slotId));
      await this.storage.removeItem(getMetadataKey(slotId));
      
      delete this.state.slots[slotId];
      delete this.state.metadata[slotId];
      
      await this.saveManagerState();
      
      return true;
    } catch (error) {
      console.error(`Delete slot ${slotId} failed:`, error);
      return false;
    }
  }

  async autoSave(playerName: string, stats: any, gameState: any): Promise<boolean> {
    if (!this.state.autoSaveEnabled) return false;
    
    const now = Date.now();
    if (now - this.state.lastAutoSave < AUTO_SAVE_INTERVAL) return false;
    
    const success = await this.saveToSlot(AUTO_SAVE_SLOT_ID, playerName, stats, gameState);
    if (success) {
      this.state.lastAutoSave = now;
      await this.saveManagerState();
    }
    
    return success;
  }

  async exportSlot(slotId: string): Promise<string | null> {
    try {
      const saveData = await this.loadFromSlot(slotId);
      if (!saveData) return null;
      
      const exportData = {
        version: SAVE_VERSION,
        exported: Date.now(),
        data: saveData,
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error(`Export slot ${slotId} failed:`, error);
      return null;
    }
  }

  async importSlot(slotId: string, jsonData: string): Promise<boolean> {
    try {
      const importData = JSON.parse(jsonData);
      
      if (!importData.version || !importData.data) {
        throw new Error('Invalid import format');
      }

      let saveData = importData.data as SaveSlotData;
      
      if (saveData.metadata.version < SAVE_VERSION) {
        saveData = migrateToVersion(saveData, SAVE_VERSION);
      }

      saveData.metadata.slotId = slotId;
      saveData.metadata.lastPlayed = Date.now();
      
      return await this.saveToSlot(slotId, saveData.playerName, saveData.stats, saveData.gameState);
    } catch (error) {
      console.error(`Import to slot ${slotId} failed:`, error);
      return false;
    }
  }

  async copySlot(fromSlotId: string, toSlotId: string): Promise<boolean> {
    try {
      const saveData = await this.loadFromSlot(fromSlotId);
      if (!saveData) return false;
      
      return await this.saveToSlot(toSlotId, saveData.playerName, saveData.stats, saveData.gameState);
    } catch (error) {
      console.error(`Copy slot ${fromSlotId} to ${toSlotId} failed:`, error);
      return false;
    }
  }

  setAutoSaveEnabled(enabled: boolean): void {
    this.state.autoSaveEnabled = enabled;
    if (enabled) {
      this.startAutoSave();
    } else {
      this.stopAutoSave();
    }
    void this.saveManagerState();
  }

  setPremiumUnlocked(unlocked: boolean): void {
    this.state.isPremiumUnlocked = unlocked;
    void this.saveManagerState();
  }

  getAvailableSlots(): number {
    return this.state.isPremiumUnlocked ? MAX_TOTAL_SLOTS : MAX_FREE_SLOTS;
  }

  private async createBackup(slotId: string, saveData: SaveSlotData): Promise<void> {
    try {
      const backup: SaveBackup = {
        slotId,
        timestamp: Date.now(),
        data: saveData,
      };
      
      await this.storage.setItem(getBackupKey(slotId), JSON.stringify(backup));
    } catch (error) {
      console.error(`Backup creation for slot ${slotId} failed:`, error);
    }
  }

  private async restoreFromBackup(slotId: string): Promise<SaveSlotData | null> {
    try {
      const rawBackup = await this.storage.getItem(getBackupKey(slotId));
      if (!rawBackup) return null;

      const backup = JSON.parse(rawBackup) as SaveBackup;
      
      if (this.state.metadata[slotId]) {
        this.state.metadata[slotId]!.status = 'corrupted';
      }
      
      await this.saveToSlot(slotId, backup.data.playerName, backup.data.stats, backup.data.gameState);
      
      return backup.data;
    } catch (error) {
      console.error(`Restore from backup for slot ${slotId} failed:`, error);
      return null;
    }
  }

  private async loadManagerState(): Promise<void> {
    try {
      const rawState = await this.storage.getItem(getManagerStateKey());
      if (rawState) {
        const savedState = JSON.parse(rawState) as Partial<SaveManagerState>;
        this.state = { ...this.state, ...savedState };
      }
    } catch (error) {
      console.error('Failed to load manager state:', error);
    }
  }

  private async saveManagerState(): Promise<void> {
    try {
      await this.storage.setItem(getManagerStateKey(), JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save manager state:', error);
    }
  }

  private async loadAllSlotMetadata(): Promise<void> {
    try {
      const maxSlots = this.state.isPremiumUnlocked ? MAX_TOTAL_SLOTS : MAX_FREE_SLOTS;
      
      for (let i = 1; i <= maxSlots; i++) {
        const slotId = i.toString();
        const rawMeta = await this.storage.getItem(getMetadataKey(slotId));
        if (rawMeta) {
          this.state.metadata[slotId] = JSON.parse(rawMeta);
        }
      }

      const autoSaveMeta = await this.storage.getItem(getMetadataKey(AUTO_SAVE_SLOT_ID));
      if (autoSaveMeta) {
        this.state.metadata[AUTO_SAVE_SLOT_ID] = JSON.parse(autoSaveMeta);
      }
    } catch (error) {
      console.error('Failed to load slot metadata:', error);
    }
  }

  private async migrateLegacySaveToSlot(): Promise<void> {
    try {
      const legacySave = await migrateLegacySave(this.storage);
      if (legacySave) {
        await this.saveToSlot('1', legacySave.playerName, legacySave.stats, legacySave.gameState);
        console.log('Legacy save migrated to slot 1');
      }
    } catch (error) {
      console.error('Legacy save migration failed:', error);
    }
  }

  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    
    this.autoSaveTimer = setInterval(() => {
    }, AUTO_SAVE_INTERVAL);
  }

  private stopAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  dispose(): void {
    this.stopAutoSave();
  }
}

export default SaveManager.getInstance();
