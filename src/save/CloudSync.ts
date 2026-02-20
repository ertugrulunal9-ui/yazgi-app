import { SaveSlotData } from './SaveSlot';

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
type ConflictResolution = 'local' | 'remote' | 'newest';
type AuthTokenProvider = () => Promise<string | null> | string | null;

interface CloudSyncConfig {
  enabled: boolean;
  apiEndpoint?: string;
  userId?: string;
  authToken?: string;
  authTokenProvider?: AuthTokenProvider;
  requireHttps?: boolean;
  requestTimeoutMs?: number;
  maxPayloadBytes?: number;
  legacyUserScopedPath?: boolean;
}

type CryptoLike = {
  subtle?: {
    digest: (algorithm: string, data: Uint8Array) => Promise<ArrayBuffer>;
  };
};

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
      requireHttps: true,
      requestTimeoutMs: 8000,
      maxPayloadBytes: 512 * 1024,
    };
  }

  static getInstance(): CloudSync {
    if (!CloudSync.instance) {
      CloudSync.instance = new CloudSync();
    }
    return CloudSync.instance;
  }

  configure(config: CloudSyncConfig): void {
    const next = { ...this.config, ...config };
    if (next.requireHttps !== false && next.apiEndpoint && !this.isSecureEndpoint(next.apiEndpoint)) {
      throw new Error('CloudSync requires an HTTPS apiEndpoint.');
    }
    this.config = next;
  }

  private isSecureEndpoint(url: string): boolean {
    try {
      if (typeof URL === 'undefined') {
        return /^https:\/\//i.test(url);
      }
      const parsed = new URL(url);
      return parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private isConfigured(): boolean {
    if (!this.config.enabled || !this.config.apiEndpoint) {
      return false;
    }
    if (this.config.legacyUserScopedPath && !this.config.userId) {
      return false;
    }
    if (this.config.requireHttps !== false && !this.isSecureEndpoint(this.config.apiEndpoint)) {
      return false;
    }
    return true;
  }

  private async getAuthToken(): Promise<string | null> {
    const tokenFromConfig = this.config.authToken?.trim();
    if (tokenFromConfig) return tokenFromConfig;
    if (!this.config.authTokenProvider) return null;

    try {
      const provided = await this.config.authTokenProvider();
      const normalized = typeof provided === 'string' ? provided.trim() : '';
      return normalized.length > 0 ? normalized : null;
    } catch {
      return null;
    }
  }

  private buildUrl(slotId: string): string {
    const encodedSlotId = encodeURIComponent(slotId);
    if (this.config.legacyUserScopedPath) {
      return `${this.config.apiEndpoint}/saves/${this.config.userId}/${encodedSlotId}`;
    }
    return `${this.config.apiEndpoint}/v1/saves/${encodedSlotId}`;
  }

  private async buildHeaders(slotId: string, data?: SaveSlotData): Promise<Record<string, string> | null> {
    const token = await this.getAuthToken();
    if (!token) return null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Save-Slot-Id': slotId,
    };

    if (this.config.userId) {
      headers['X-Client-User-Id'] = this.config.userId;
    }

    if (data) {
      headers['X-Save-Version'] = String(data.metadata.version);
      headers['X-Save-Checksum'] = data.metadata.checksum;
    }

    return headers;
  }

  private async computePayloadSha256(payload: string): Promise<string | null> {
    const cryptoCandidate = (globalThis as { crypto?: CryptoLike }).crypto;
    if (cryptoCandidate?.subtle?.digest && typeof TextEncoder !== 'undefined') {
      try {
        const bytes = new TextEncoder().encode(payload);
        const digest = await cryptoCandidate.subtle.digest('SHA-256', bytes);
        return Array.from(new Uint8Array(digest))
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('');
      } catch {
        // Fall back below.
      }
    }

    return null;
  }

  private async fetchWithTimeout(
    input: Parameters<typeof fetch>[0],
    init: Parameters<typeof fetch>[1]
  ): Promise<Response> {
    const timeoutMs = this.config.requestTimeoutMs ?? 8000;
    if (typeof AbortController === 'undefined' || timeoutMs <= 0) {
      return fetch(input, init);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }

  private isPayloadWithinLimit(data: SaveSlotData): boolean {
    const payloadBytes = JSON.stringify(data).length;
    return payloadBytes <= (this.config.maxPayloadBytes ?? 512 * 1024);
  }

  async syncSlot(slotId: string, localData: SaveSlotData): Promise<boolean> {
    if (!this.isConfigured()) {
      console.log('Cloud sync not configured (enabled/apiEndpoint/https/auth required)');
      return false;
    }

    if (!this.isPayloadWithinLimit(localData)) {
      console.warn('Cloud sync payload exceeds configured max size');
      return false;
    }

    const authHeaders = await this.buildHeaders(slotId);
    if (!authHeaders) {
      console.warn('Cloud sync requires auth token');
      return false;
    }

    this.syncStatus = 'syncing';

    try {
      const remoteData = await this.fetchRemoteData(slotId, authHeaders);
      
      if (!remoteData) {
        const success = await this.uploadData(slotId, localData);
        this.syncStatus = success ? 'success' : 'error';
        if (success) this.retryCount = 0;
        return success;
      }

      const resolution = this.resolveConflict(localData, remoteData);
      
      if (resolution === 'local') {
        const success = await this.uploadData(slotId, localData);
        this.syncStatus = success ? 'success' : 'error';
        if (success) this.retryCount = 0;
        return success;
      } else if (resolution === 'remote') {
        this.syncStatus = 'success';
        this.retryCount = 0;
        return true;
      } else {
        const newestData = localData.metadata.lastPlayed > remoteData.metadata.lastPlayed ? localData : remoteData;
        const success = await this.uploadData(slotId, newestData);
        this.syncStatus = success ? 'success' : 'error';
        if (success) this.retryCount = 0;
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

  async fetchRemoteData(slotId: string, headers?: Record<string, string>): Promise<SaveSlotData | null> {
    if (!this.isConfigured()) return null;

    try {
      const resolvedHeaders = headers ?? await this.buildHeaders(slotId);
      if (!resolvedHeaders) return null;

      const response = await this.fetchWithTimeout(this.buildUrl(slotId), {
        method: 'GET',
        headers: resolvedHeaders,
      });

      if (response.status === 404) {
        return null;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(`Unauthorized cloud sync request: ${response.status}`);
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

  async uploadData(slotId: string, data: SaveSlotData, headers?: Record<string, string>): Promise<boolean> {
    if (!this.isConfigured()) return false;
    if (!this.isPayloadWithinLimit(data)) return false;

    try {
      const rawPayload = JSON.stringify(data);
      const resolvedHeaders = headers ?? await this.buildHeaders(slotId, data);
      if (!resolvedHeaders) return false;
      const contentSha = await this.computePayloadSha256(rawPayload);
      if (contentSha) {
        resolvedHeaders['X-Content-SHA256'] = contentSha;
      }

      const response = await this.fetchWithTimeout(this.buildUrl(slotId), {
        method: 'PUT',
        headers: resolvedHeaders,
        body: rawPayload,
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
