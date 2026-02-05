import { SaveSlotData } from './SaveSlot';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
type ConflictResolution = 'local' | 'remote' | 'newest';

interface CloudSyncConfig {
  enabled: boolean;
  apiEndpoint?: string;
  userId?: string;
}

class CloudSync {
  private static instance: CloudSync;
  private config: CloudSyncConfig;
  private syncStatus: SyncStatus = 'idle';
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private retryDelay: number = 1000;

  private constructor() {
    this.config = {
      enabled: false,
    };
  }

  static getInstance(): CloudSync {
    if (!CloudSync.instance) {
      CloudSync.instance = new CloudSync();
    }
    return CloudSync.instance;
  }

  configure(config: CloudSyncConfig): void {
    this.config = { ...this.config, ...config };
  }

  async syncSlot(slotId: string, localData: SaveSlotData): Promise<boolean> {
    if (!this.config.enabled || !this.config.apiEndpoint || !this.config.userId) {
      console.log('Cloud sync not configured');
      return false;
    }

    this.syncStatus = 'syncing';

    try {
      const remoteData = await this.fetchRemoteData(slotId);
      
      if (!remoteData) {
        const success = await this.uploadData(slotId, localData);
        this.syncStatus = success ? 'success' : 'error';
        return success;
      }

      const resolution = this.resolveConflict(localData, remoteData);
      
      if (resolution === 'local') {
        const success = await this.uploadData(slotId, localData);
        this.syncStatus = success ? 'success' : 'error';
        return success;
      } else if (resolution === 'remote') {
        this.syncStatus = 'success';
        return true;
      } else {
        const newestData = localData.metadata.lastPlayed > remoteData.metadata.lastPlayed ? localData : remoteData;
        const success = await this.uploadData(slotId, newestData);
        this.syncStatus = success ? 'success' : 'error';
        return success;
      }
    } catch (error) {
      console.error('Cloud sync failed:', error);
      this.syncStatus = 'error';
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        await this.delay(this.retryDelay * this.retryCount);
        return this.syncSlot(slotId, localData);
      }
      
      return false;
    }
  }

  async fetchRemoteData(slotId: string): Promise<SaveSlotData | null> {
    if (!this.config.apiEndpoint || !this.config.userId) return null;

    try {
      const response = await fetch(`${this.config.apiEndpoint}/saves/${this.config.userId}/${slotId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch remote data failed:', error);
      return null;
    }
  }

  async uploadData(slotId: string, data: SaveSlotData): Promise<boolean> {
    if (!this.config.apiEndpoint || !this.config.userId) return false;

    try {
      const response = await fetch(`${this.config.apiEndpoint}/saves/${this.config.userId}/${slotId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      return response.ok;
    } catch (error) {
      console.error('Upload data failed:', error);
      return false;
    }
  }

  private resolveConflict(local: SaveSlotData, remote: SaveSlotData): ConflictResolution {
    // Compare playtime - more playtime means more progress
    if (local.metadata.playtime > remote.metadata.playtime + 5) {
      return 'local';
    }
    if (remote.metadata.playtime > local.metadata.playtime + 5) {
      return 'remote';
    }

    // Compare age - higher age means more progress
    if (local.metadata.age > remote.metadata.age) {
      return 'local';
    }
    if (remote.metadata.age > local.metadata.age) {
      return 'remote';
    }

    // Default: use newest based on timestamp
    return 'newest';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getSyncStatus(): SyncStatus {
    return this.syncStatus;
  }

  resetRetryCount(): void {
    this.retryCount = 0;
  }
}

export default CloudSync.getInstance();
