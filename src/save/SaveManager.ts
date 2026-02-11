import AsyncStorage from '@react-native-async-storage/async-storage';
import { SaveSlotData, SaveSlotMetadata, SaveManagerState, SaveBackup, CompressedSaveData, SAVE_VERSION, MAX_FREE_SLOTS, MAX_TOTAL_SLOTS, AUTO_SAVE_SLOT_ID, createEmptySlot, getSlotKey, getMetadataKey, getBackupKey, getManagerStateKey } from './SaveSlot';
import { compressSaveData, decompressSaveData } from './SaveCompression';
import { detectLegacySave, migrateLegacySave, migrateToVersion, createMigrationBackup } from './SaveMigration';
import { generateChecksum, validateChecksum } from '../utils/checksum';
import { validateSaveData } from './SaveValidation';

const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;

// Auto-save callback tipi - oyun state'ini döndüren fonksiyon
type AutoSaveCallback = () => { playerName: string; stats: any; gameState: any } | null;

class SaveManager {
  private static instance: SaveManager;
  private storage: any;
  private state: SaveManagerState;
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
  private autoSaveCallback: AutoSaveCallback | null = null;

  // Mutex/lock mechanism to prevent concurrent saves
  private saveLocks: Map<string, boolean> = new Map();
  private saveQueue: Map<string, Array<() => Promise<void>>> = new Map();

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
      adsDisabled: false,
    };
  }

  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  private buildChecksumPayload(playerName: string, stats: any, gameState: any) {
    return { playerName, stats, gameState };
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
      // Check if slot is already being saved
      if (this.saveLocks.get(slotId)) {
        console.log(`Slot ${slotId} is locked, queueing save...`);
        // Queue this save to execute after current save completes
        return new Promise<boolean>((resolve) => {
          const queuedSave = async () => {
            const result = await this.saveToSlot(slotId, playerName, stats, gameState);
            resolve(result);
          };

          if (!this.saveQueue.has(slotId)) {
            this.saveQueue.set(slotId, []);
          }
          this.saveQueue.get(slotId)!.push(queuedSave);
        });
      }

      // Acquire lock
      this.saveLocks.set(slotId, true);

      const isPremium = parseInt(slotId) > MAX_FREE_SLOTS;
      if (isPremium && !this.state.isPremiumUnlocked && slotId !== AUTO_SAVE_SLOT_ID) {
        throw new Error('Premium slot locked');
      }

      const existingMeta = this.state.metadata[slotId];
      const now = Date.now();
      const lastPlayed = existingMeta?.lastPlayed ?? now;
      const prevPlaytime = existingMeta?.playtime ?? 0;
      const previousTurns = this.state.slots[slotId]?.gameState?.totalTurns ?? 0;
      const currentTurns = gameState?.totalTurns ?? 0;
      const turnDelta = Math.max(0, currentTurns - previousTurns);
      const turnMinutes = turnDelta * 5;
      const timeDeltaMinutes = Math.max(0, Math.round((now - lastPlayed) / 60000));
      const playtime = prevPlaytime + (timeDeltaMinutes > 0 ? timeDeltaMinutes : turnMinutes);

      const saveData: SaveSlotData = {
        metadata: {
          slotId,
          characterName: playerName,
          age: gameState.age,
          playtime,
          lastPlayed: now,
          version: SAVE_VERSION,
          checksum: generateChecksum(this.buildChecksumPayload(playerName, stats, gameState)),
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
    } finally {
      // Release lock
      this.saveLocks.delete(slotId);

      // Process queued saves
      const queue = this.saveQueue.get(slotId);
      if (queue && queue.length > 0) {
        const nextSave = queue.shift();
        this.saveQueue.set(slotId, queue);
        if (nextSave) {
          // Execute next queued save asynchronously
          void nextSave();
        }
      }
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

      // Zod Schema Validation (before version check and checksum)
      const validation = validateSaveData(saveData);
      if (!validation.valid) {
        console.error(`Slot ${slotId} schema validation failed:`, validation.errors?.issues.slice(0, 3));
        return await this.restoreFromBackup(slotId);
      }

      // Use repaired data if auto-repair was applied
      let validatedData = validation.data!;
      if (validation.repaired) {
        console.warn(`Slot ${slotId} was auto-repaired:`, validation.repairLog);
        // Recompute checksum for repaired data before persisting/validating
        const repairedChecksum = generateChecksum(
          this.buildChecksumPayload(validatedData.playerName, validatedData.stats, validatedData.gameState)
        );
        validatedData = {
          ...validatedData,
          metadata: { ...validatedData.metadata, checksum: repairedChecksum },
        };
        // Save repaired data back to slot
        const repairPersisted = await this.saveToSlot(
          slotId,
          validatedData.playerName,
          validatedData.stats,
          validatedData.gameState
        );
        if (!repairPersisted) {
          console.error(`Slot ${slotId} repair persist failed, attempting restore`);
          return await this.restoreFromBackup(slotId);
        }
      }

      if (validatedData.metadata.version < SAVE_VERSION) {
        console.log(`Migrating slot ${slotId} from v${validatedData.metadata.version} to v${SAVE_VERSION}`);
        await createMigrationBackup(this.storage, slotId, validatedData as SaveSlotData);
        const migrated = migrateToVersion(validatedData as SaveSlotData, SAVE_VERSION);
        await this.saveToSlot(slotId, migrated.playerName, migrated.stats, migrated.gameState);
        return migrated;
      }

      const checksumPayload = this.buildChecksumPayload(validatedData.playerName, validatedData.stats, validatedData.gameState);
      const expectedChecksum = generateChecksum(checksumPayload);
      const isValid = validateChecksum(checksumPayload, validatedData.metadata.checksum);

      if (!isValid) {
        if (slotId !== AUTO_SAVE_SLOT_ID) {
          console.warn(`Slot ${slotId} checksum mismatch detected, attempting checksum repair`);
        }
        const repairedData: SaveSlotData = {
          ...(validatedData as SaveSlotData),
          metadata: {
            ...(validatedData.metadata as SaveSlotMetadata),
            checksum: expectedChecksum,
            status: 'active',
          },
        };
        const checksumRepaired = await this.saveToSlot(
          slotId,
          repairedData.playerName,
          repairedData.stats,
          repairedData.gameState
        );

        if (!checksumRepaired) {
          console.error(`Slot ${slotId} checksum repair failed, attempting restore`);
          return await this.restoreFromBackup(slotId);
        }

        this.state.slots[slotId] = repairedData;
        this.state.metadata[slotId] = repairedData.metadata;
        return repairedData;
      }

      this.state.slots[slotId] = validatedData as SaveSlotData;
      this.state.metadata[slotId] = validatedData.metadata as SaveSlotMetadata;

      return validatedData as SaveSlotData;
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

  async clearSlot(slotId: string): Promise<boolean> {
    try {
      await this.storage.removeItem(getSlotKey(slotId));
      await this.storage.removeItem(getMetadataKey(slotId));
      await this.storage.removeItem(getBackupKey(slotId));

      delete this.state.slots[slotId];
      delete this.state.metadata[slotId];

      await this.saveManagerState();
      return true;
    } catch (error) {
      console.error(`Clear slot ${slotId} failed:`, error);
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

  setAdsDisabled(disabled: boolean): void {
    this.state.adsDisabled = disabled;
    void this.saveManagerState();
  }

  areAdsDisabled(): boolean {
    return this.state.adsDisabled;
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

  /**
   * Auto-save callback'i kaydet
   * GameContext bu metodu kullanarak mevcut oyun state'ini sağlar
   */
  registerAutoSaveCallback(callback: AutoSaveCallback): void {
    this.autoSaveCallback = callback;
  }

  /**
   * Auto-save callback'i kaldır (cleanup için)
   */
  unregisterAutoSaveCallback(): void {
    this.autoSaveCallback = null;
  }

  private startAutoSave(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }

    this.autoSaveTimer = setInterval(async () => {
      // Callback yoksa veya state alınamıyorsa çık
      if (!this.autoSaveCallback) return;

      const gameData = this.autoSaveCallback();
      if (!gameData) return;

      const { playerName, stats, gameState } = gameData;

      // autoSave zaten throttling yapıyor, direkt çağır
      await this.autoSave(playerName, stats, gameState);
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
