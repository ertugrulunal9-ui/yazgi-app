import AsyncStorage from '@react-native-async-storage/async-storage';
import { devLog } from '../utils/devLogger';
import { GameState, MetaProgression, Stats } from '../types';
import { createInitialMetaProgression } from '../utils/metaProgression';
import {
  SaveSlotData,
  SaveSlotMetadata,
  SaveManagerState,
  SaveBackup,
  CompressedSaveData,
  SaveExportPackage,
  SaveExportManifest,
  SAVE_VERSION,
  SAVE_SCHEMA_VERSION,
  SAVE_EXPORT_VERSION,
  MAX_BACKUP_HISTORY,
  MAX_TOTAL_SLOTS,
  AUTO_SAVE_SLOT_ID,
  createEmptySlot,
  getSlotKey,
  getMetadataKey,
  getBackupKey,
  getManagerStateKey,
} from './SaveSlot';
import { compressSaveData, decompressSaveData } from './SaveCompression';
import { detectLegacySave, migrateLegacySave, migrateToVersion, createMigrationBackup } from './SaveMigration';
import { generateChecksum, validateChecksum } from '../utils/checksum';
import { validateSaveData } from './SaveValidation';
import { AsyncStorageLike } from './storageTypes';

const AUTO_SAVE_INTERVAL = 5 * 60 * 1000;
const META_PROGRESS_KEY = '@yazgi_save/meta_progression/v1';
const INTEGRITY_SECRET_KEY = 'yazgi_save.integrity_secret.v1';
const ENCRYPTION_SECRET_KEY = 'yazgi_save.encryption_secret.v1';
const INTEGRITY_SIGNATURE_PREFIX = 'yazgi_save.integrity_signature.';
const INTEGRITY_SCHEME_VERSION = 2;
const ENCRYPTED_STORAGE_PREFIX_V1 = 'enc:v1:';
const ENCRYPTED_STORAGE_PREFIX_V2 = 'enc:v2:';
const ENCRYPTED_STORAGE_VERSION_V1 = 1;
const ENCRYPTED_STORAGE_VERSION_V2 = 2;
const ENCRYPTION_KDF_ITERATIONS = 120_000;
const DEVICE_ID_KEY = '@yazgi_save/device_id/v1';
const MAX_IMPORT_PAYLOAD_BYTES = 2 * 1024 * 1024;
const IS_DEV_RUNTIME =
  Boolean((globalThis as { __DEV__?: boolean }).__DEV__) || process.env.NODE_ENV !== 'production';

type EncryptedStoragePayloadV1 = {
  v: number;
  iv: string;
  ct: string;
};

type EncryptedStoragePayloadV2 = {
  v: number;
  alg: 'AES-GCM';
  kdf: 'PBKDF2-SHA256';
  iter: number;
  salt: string;
  iv: string;
  ct: string;
};

type SignatureVerificationResult =
  | { valid: true; reason: 'disabled' | 'missing' | 'match' | 'resealed_dev_autosave' }
  | { valid: false; reason: 'mismatch' };

type WebCryptoSubtleLike = {
  digest: (algorithm: string, data: Uint8Array) => Promise<ArrayBuffer>;
  importKey: (
    format: 'raw',
    keyData: Uint8Array,
    algorithm: string | { name: string; hash?: string | { name: string } },
    extractable: boolean,
    keyUsages: string[]
  ) => Promise<unknown>;
  deriveKey: (
    algorithm: { name: 'PBKDF2'; salt: Uint8Array; iterations: number; hash: 'SHA-256' },
    baseKey: unknown,
    derivedKeyType: { name: 'AES-GCM'; length: number },
    extractable: boolean,
    keyUsages: string[]
  ) => Promise<unknown>;
  encrypt: (
    algorithm: { name: 'AES-GCM'; iv: Uint8Array },
    key: unknown,
    data: Uint8Array
  ) => Promise<ArrayBuffer>;
  decrypt: (
    algorithm: { name: 'AES-GCM'; iv: Uint8Array },
    key: unknown,
    data: Uint8Array
  ) => Promise<ArrayBuffer>;
  sign: (
    algorithm: 'HMAC',
    key: unknown,
    data: Uint8Array
  ) => Promise<ArrayBuffer>;
};

type CryptoLike = {
  subtle?: WebCryptoSubtleLike;
  getRandomValues?: (array: Uint8Array) => Uint8Array;
};

type SecureStoreModule = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync?: (key: string) => Promise<void>;
};

type CryptoWordArrayLike = {
  toString: (encoder?: unknown) => string;
};

type CryptoCipherParamsLike = {
  ciphertext: CryptoWordArrayLike;
};

type CryptoJsLike = {
  SHA256: (input: string) => CryptoWordArrayLike;
  HmacSHA256?: (message: string, key: string) => CryptoWordArrayLike;
  AES: {
    encrypt: (
      value: string,
      key: CryptoWordArrayLike,
      options: {
        iv: CryptoWordArrayLike;
        mode: unknown;
        padding: unknown;
      }
    ) => CryptoCipherParamsLike;
    decrypt: (
      value: CryptoCipherParamsLike,
      key: CryptoWordArrayLike,
      options: {
        iv: CryptoWordArrayLike;
        mode: unknown;
        padding: unknown;
      }
    ) => CryptoWordArrayLike;
  };
  lib: {
    WordArray: {
      random: (size: number) => CryptoWordArrayLike;
    };
    CipherParams: {
      create: (params: { ciphertext: CryptoWordArrayLike }) => CryptoCipherParamsLike;
    };
  };
  enc: {
    Hex: {
      parse: (value: string) => CryptoWordArrayLike;
    };
    Base64: {
      parse: (value: string) => CryptoWordArrayLike;
    };
    Utf8: unknown;
  };
  mode: {
    CBC: unknown;
  };
  pad: {
    Pkcs7: unknown;
  };
};

type SaveSnapshot = {
  playerName: string;
  stats: Stats;
  gameState: GameState;
};

type EncryptionProvider = 'none' | 'webcrypto' | 'cryptojs';

let secureStoreModule: SecureStoreModule | null = null;
let secureStoreResolveAttempted = false;
let cryptoJsModule: CryptoJsLike | null = null;
let cryptoJsResolveAttempted = false;

const getSecureStore = async (): Promise<SecureStoreModule | null> => {
  if (secureStoreResolveAttempted) return secureStoreModule;
  secureStoreResolveAttempted = true;
  try {
    const mod = await import('expo-secure-store');
    secureStoreModule = mod as unknown as SecureStoreModule;
  } catch {
    secureStoreModule = null;
  }
  return secureStoreModule;
};

const getCryptoJs = async (): Promise<CryptoJsLike | null> => {
  if (cryptoJsResolveAttempted) return cryptoJsModule;
  cryptoJsResolveAttempted = true;
  try {
    const mod = await import('crypto-js');
    cryptoJsModule = (mod as unknown as { default?: CryptoJsLike }).default
      ?? (mod as unknown as CryptoJsLike);
  } catch {
    cryptoJsModule = null;
  }
  return cryptoJsModule;
};

// Auto-save callback tipi - oyun state'ini döndüren fonksiyon
type AutoSaveCallback = () => SaveSnapshot | null;

class SaveManager {
  private static instance: SaveManager;
  private storage: AsyncStorageLike;
  private state: SaveManagerState;
  private metaProgression: MetaProgression;
  private autoSaveTimer: ReturnType<typeof setInterval> | null = null;
  private autoSaveCallback: AutoSaveCallback | null = null;
  private integritySecret: string | null = null;
  private encryptionSecret: string | null = null;
  private deviceId: string | null = null;
  private integrityInitAttempted = false;
  private integrityActive = false;
  private encryptionInitAttempted = false;
  private encryptionActive = false;
  private encryptionProvider: EncryptionProvider = 'none';

  // Mutex/lock mechanism to prevent concurrent saves
  private saveLocks: Map<string, boolean> = new Map();
  private saveQueue: Map<string, (() => Promise<void>)[]> = new Map();

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
      isPremiumUnlocked: true,
      adsDisabled: false,
    };
    this.metaProgression = createInitialMetaProgression();
  }

  static getInstance(): SaveManager {
    if (!SaveManager.instance) {
      SaveManager.instance = new SaveManager();
    }
    return SaveManager.instance;
  }

  private buildChecksumPayload(playerName: string, stats: Stats, gameState: GameState): SaveSnapshot {
    return { playerName, stats, gameState };
  }

  private generateId(prefix: string): string {
    const randomPart = Math.random().toString(36).slice(2, 10);
    return `${prefix}_${Date.now().toString(36)}_${randomPart}`;
  }

  private async getOrCreateDeviceId(): Promise<string> {
    if (this.deviceId) return this.deviceId;

    try {
      const existing = await this.readProtectedStorageItem(DEVICE_ID_KEY);
      if (existing && existing.trim().length > 0) {
        this.deviceId = existing;
        return existing;
      }

      const created = this.generateId('device');
      await this.writeProtectedStorageItem(DEVICE_ID_KEY, created);
      this.deviceId = created;
      return created;
    } catch {
      const fallback = this.generateId('device_fallback');
      this.deviceId = fallback;
      return fallback;
    }
  }

  private getBackupHistoryKey(slotId: string): string {
    return `${getBackupKey(slotId)}_history`;
  }

  private async getBackupHistory(slotId: string): Promise<SaveBackup[]> {
    try {
      const raw = await this.readProtectedStorageItem(this.getBackupHistoryKey(slotId));
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .filter((item: unknown): item is SaveBackup => {
          if (!item || typeof item !== 'object') return false;
          const candidate = item as Partial<SaveBackup>;
          return typeof candidate.slotId === 'string'
            && typeof candidate.timestamp === 'number'
            && Boolean(candidate.data);
        })
        .sort((a, b) => b.timestamp - a.timestamp);
    } catch {
      return [];
    }
  }

  private async persistBackupHistory(slotId: string, backups: SaveBackup[]): Promise<void> {
    await this.writeProtectedStorageItem(this.getBackupHistoryKey(slotId), JSON.stringify(backups));
  }

  private async getExportBackups(slotId: string): Promise<SaveBackup[]> {
    const history = await this.getBackupHistory(slotId);
    if (history.length > 0) {
      return history.slice(0, MAX_BACKUP_HISTORY);
    }

    try {
      const rawBackup = await this.readProtectedStorageItem(getBackupKey(slotId));
      if (!rawBackup) return [];

      const parsed = JSON.parse(rawBackup) as Partial<SaveBackup>;
      if (!parsed || typeof parsed !== 'object' || !parsed.data) return [];

      return [{
        slotId,
        timestamp: typeof parsed.timestamp === 'number' ? parsed.timestamp : Date.now(),
        data: parsed.data as SaveSlotData,
      }];
    } catch {
      return [];
    }
  }

  private buildExportManifest(slotId: string, saveData: SaveSlotData, backups: SaveBackup[]): SaveExportManifest {
    const checksum = generateChecksum({
      slotId,
      saveChecksum: saveData.metadata.checksum,
      backupCount: backups.length,
      latestBackupTs: backups[0]?.timestamp ?? 0,
    });

    return {
      manifestVersion: 1,
      slotIds: [slotId],
      saveCount: 1,
      backupCount: backups.length,
      createdAt: Date.now(),
      checksum,
    };
  }

  private isManifestValidForImport(
    sourceSlotId: string,
    saveData: SaveSlotData,
    backups: SaveBackup[],
    manifestCandidate: unknown
  ): boolean {
    if (!manifestCandidate || typeof manifestCandidate !== 'object') return true;

    const manifest = manifestCandidate as Partial<SaveExportManifest>;
    if (typeof manifest.checksum !== 'string') return true;

    if (Array.isArray(manifest.slotIds) && manifest.slotIds.length > 0 && !manifest.slotIds.includes(sourceSlotId)) {
      return false;
    }

    const expectedChecksum = this.buildExportManifest(sourceSlotId, saveData, backups).checksum;
    return expectedChecksum === manifest.checksum;
  }

  private sanitizeImportedBackups(slotId: string, rawBackups: unknown): SaveBackup[] {
    if (!Array.isArray(rawBackups)) return [];

    const sanitized: SaveBackup[] = [];
    for (const rawBackup of rawBackups) {
      if (!rawBackup || typeof rawBackup !== 'object') {
        continue;
      }

      const candidate = rawBackup as Record<string, unknown>;
      const extractedSave = this.extractImportedSave(candidate.data ?? candidate);
      if (!extractedSave) {
        continue;
      }

      const validation = validateSaveData(extractedSave);
      if (!validation.valid || !validation.data) {
        continue;
      }

      let normalizedSave = validation.data as SaveSlotData;
      if (normalizedSave.metadata.version < SAVE_VERSION) {
        normalizedSave = migrateToVersion(normalizedSave, SAVE_VERSION);
      }

      const timestamp =
        typeof candidate.timestamp === 'number' && Number.isFinite(candidate.timestamp)
          ? candidate.timestamp
          : Date.now();

      sanitized.push({
        slotId,
        timestamp,
        data: normalizedSave,
      });
    }

    return sanitized
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_BACKUP_HISTORY);
  }

  private async mergeImportedBackups(slotId: string, importedBackups: SaveBackup[]): Promise<void> {
    if (importedBackups.length === 0) return;

    const existing = await this.getBackupHistory(slotId);
    const normalizedImported = importedBackups.map((backup) => ({
      slotId,
      timestamp: backup.timestamp,
      data: {
        ...backup.data,
        metadata: {
          ...backup.data.metadata,
          slotId,
        },
      },
    }));

    const combined = [...existing, ...normalizedImported].sort((a, b) => b.timestamp - a.timestamp);
    const deduped: SaveBackup[] = [];
    const seen = new Set<string>();

    for (const backup of combined) {
      const dedupeKey = `${backup.timestamp}:${backup.data.metadata.checksum}`;
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      deduped.push(backup);
      if (deduped.length >= MAX_BACKUP_HISTORY) break;
    }

    await this.persistBackupHistory(slotId, deduped);
    if (deduped[0]) {
      await this.writeProtectedStorageItem(getBackupKey(slotId), JSON.stringify(deduped[0]));
    }
  }

  private extractImportedSave(importData: unknown): SaveSlotData | null {
    if (!importData || typeof importData !== 'object') return null;

    const candidate = importData as Record<string, unknown>;

    if (candidate.data && typeof candidate.data === 'object') {
      return candidate.data as SaveSlotData;
    }

    if (Array.isArray(candidate.saves) && candidate.saves.length > 0) {
      const first = candidate.saves[0];
      if (first && typeof first === 'object') {
        return first as SaveSlotData;
      }
    }

    if (candidate.metadata && candidate.playerName && candidate.stats && candidate.gameState) {
      return candidate as unknown as SaveSlotData;
    }

    return null;
  }

  private getIntegritySignatureKey(slotId: string): string {
    const normalizedSlotId = slotId.trim().length > 0 ? slotId : 'default_slot';
    const encodedSlotId = Array.from(normalizedSlotId)
      .map(char => char.charCodeAt(0).toString(16).padStart(4, '0'))
      .join('');
    return `${INTEGRITY_SIGNATURE_PREFIX}${encodedSlotId}.v${INTEGRITY_SCHEME_VERSION}`;
  }

  private getSupportedSaveVersions(): number[] {
    const versions: number[] = [];
    for (let version = SAVE_VERSION; version >= 1; version--) {
      versions.push(version);
    }
    return versions;
  }

  private async readSlotDataWithFallback(slotId: string): Promise<{ rawData: string | null; keyVersion: number }> {
    for (const version of this.getSupportedSaveVersions()) {
      const rawData = await this.readProtectedStorageItem(getSlotKey(slotId, version));
      if (rawData) {
        return { rawData, keyVersion: version };
      }
    }

    return { rawData: null, keyVersion: SAVE_VERSION };
  }

  private async readMetadataWithFallback(slotId: string): Promise<{ rawMeta: string | null; keyVersion: number }> {
    for (const version of this.getSupportedSaveVersions()) {
      const rawMeta = await this.readProtectedStorageItem(getMetadataKey(slotId, version));
      if (rawMeta) {
        return { rawMeta, keyVersion: version };
      }
    }

    return { rawMeta: null, keyVersion: SAVE_VERSION };
  }

  private async removeVersionedSlotKeys(slotId: string): Promise<void> {
    for (const version of this.getSupportedSaveVersions()) {
      await this.storage.removeItem(getSlotKey(slotId, version));
      await this.storage.removeItem(getMetadataKey(slotId, version));
    }
  }

  private getCryptoCandidate(): CryptoLike | undefined {
    return (globalThis as { crypto?: CryptoLike }).crypto;
  }

  private getWebCryptoSubtle(): WebCryptoSubtleLike | null {
    const subtle = this.getCryptoCandidate()?.subtle;
    if (!subtle) return null;

    const isSupported = typeof subtle.importKey === 'function'
      && typeof subtle.deriveKey === 'function'
      && typeof subtle.encrypt === 'function'
      && typeof subtle.decrypt === 'function'
      && typeof subtle.sign === 'function';

    return isSupported ? subtle : null;
  }

  private getRandomBytes(byteLength: number): Uint8Array | null {
    const bytes = new Uint8Array(byteLength);
    const cryptoCandidate = this.getCryptoCandidate();
    if (cryptoCandidate?.getRandomValues) {
      cryptoCandidate.getRandomValues(bytes);
      return bytes;
    }
    return null;
  }

  private bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private hexToBytes(hex: string): Uint8Array | null {
    if (hex.length % 2 !== 0) return null;
    if (!/^[0-9a-fA-F]+$/.test(hex)) return null;

    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }

  private encodeUtf8(value: string): Uint8Array | null {
    if (typeof TextEncoder === 'undefined') return null;
    return new TextEncoder().encode(value);
  }

  private decodeUtf8(value: Uint8Array): string | null {
    if (typeof TextDecoder === 'undefined') return null;
    try {
      return new TextDecoder().decode(value);
    } catch {
      return null;
    }
  }

  private async deriveAesGcmKey(secret: string, salt: Uint8Array): Promise<unknown | null> {
    const subtle = this.getWebCryptoSubtle();
    const secretBytes = this.encodeUtf8(secret);
    if (!subtle || !secretBytes) return null;

    try {
      const keyMaterial = await subtle.importKey('raw', secretBytes, 'PBKDF2', false, ['deriveKey']);
      return await subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt,
          iterations: ENCRYPTION_KDF_ITERATIONS,
          hash: 'SHA-256',
        },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
      );
    } catch {
      return null;
    }
  }

  private generateIntegritySecret(): string {
    const bytes = this.getRandomBytes(32);
    if (bytes) {
      return this.bytesToHex(bytes);
    }

    return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}_${Math.random().toString(36).slice(2)}`;
  }

  private async ensureIntegrityInitialized(): Promise<void> {
    if (this.integrityInitAttempted) return;
    this.integrityInitAttempted = true;

    const secureStore = await getSecureStore();
    if (!secureStore) {
      this.integrityActive = false;
      devLog.warn('SecureStore unavailable, save anti-tamper signatures are disabled.');
      return;
    }

    try {
      let secret = await secureStore.getItemAsync(INTEGRITY_SECRET_KEY);
      if (!secret || secret.trim().length < 24) {
        secret = this.generateIntegritySecret();
        await secureStore.setItemAsync(INTEGRITY_SECRET_KEY, secret);
      }
      this.integritySecret = secret;
      this.integrityActive = true;
    } catch (error) {
      this.integrityActive = false;
      console.error('Failed to initialize save integrity secret:', error);
    }
  }

  private isEncryptedStoragePayload(value: string): boolean {
    return value.startsWith(ENCRYPTED_STORAGE_PREFIX_V1) || value.startsWith(ENCRYPTED_STORAGE_PREFIX_V2);
  }

  private async ensureEncryptionInitialized(): Promise<void> {
    if (this.encryptionInitAttempted) return;
    this.encryptionInitAttempted = true;

    const [secureStore, cryptoJs] = await Promise.all([getSecureStore(), getCryptoJs()]);
    if (!secureStore) {
      this.encryptionActive = false;
      this.encryptionProvider = 'none';
      devLog.warn('Secure save encryption unavailable, local save payloads use plaintext storage.');
      return;
    }

    try {
      let secret = await secureStore.getItemAsync(ENCRYPTION_SECRET_KEY);
      if (!secret || secret.trim().length < 24) {
        secret = this.generateIntegritySecret();
        await secureStore.setItemAsync(ENCRYPTION_SECRET_KEY, secret);
      }
      this.encryptionSecret = secret;

      if (this.getWebCryptoSubtle() && typeof TextEncoder !== 'undefined' && typeof TextDecoder !== 'undefined') {
        this.encryptionProvider = 'webcrypto';
        this.encryptionActive = true;
        return;
      }

      if (cryptoJs) {
        this.encryptionProvider = 'cryptojs';
        this.encryptionActive = true;
        return;
      }

      this.encryptionProvider = 'none';
      this.encryptionActive = false;
      devLog.warn('No supported crypto provider found for secure save encryption.');
    } catch (error) {
      this.encryptionActive = false;
      this.encryptionProvider = 'none';
      console.error('Failed to initialize save encryption secret:', error);
    }
  }

  private async encryptWithWebCrypto(rawValue: string, secret: string): Promise<string | null> {
    const subtle = this.getWebCryptoSubtle();
    const plainBytes = this.encodeUtf8(rawValue);
    const salt = this.getRandomBytes(16);
    const iv = this.getRandomBytes(12);
    if (!subtle || !plainBytes || !salt || !iv) {
      return null;
    }

    const key = await this.deriveAesGcmKey(secret, salt);
    if (!key) return null;

    try {
      const cipherBuffer = await subtle.encrypt({ name: 'AES-GCM', iv }, key, plainBytes);
      const payload: EncryptedStoragePayloadV2 = {
        v: ENCRYPTED_STORAGE_VERSION_V2,
        alg: 'AES-GCM',
        kdf: 'PBKDF2-SHA256',
        iter: ENCRYPTION_KDF_ITERATIONS,
        salt: this.bytesToHex(salt),
        iv: this.bytesToHex(iv),
        ct: this.bytesToHex(new Uint8Array(cipherBuffer)),
      };
      return `${ENCRYPTED_STORAGE_PREFIX_V2}${JSON.stringify(payload)}`;
    } catch {
      return null;
    }
  }

  private async decryptWithWebCrypto(rawValue: string, secret: string): Promise<string | null> {
    const subtle = this.getWebCryptoSubtle();
    if (!subtle) return null;

    try {
      const encoded = rawValue.slice(ENCRYPTED_STORAGE_PREFIX_V2.length);
      const payload = JSON.parse(encoded) as Partial<EncryptedStoragePayloadV2>;
      if (
        payload.v !== ENCRYPTED_STORAGE_VERSION_V2
        || payload.alg !== 'AES-GCM'
        || payload.kdf !== 'PBKDF2-SHA256'
        || payload.iter !== ENCRYPTION_KDF_ITERATIONS
        || typeof payload.salt !== 'string'
        || typeof payload.iv !== 'string'
        || typeof payload.ct !== 'string'
      ) {
        return null;
      }

      const salt = this.hexToBytes(payload.salt);
      const iv = this.hexToBytes(payload.iv);
      const cipherBytes = this.hexToBytes(payload.ct);
      if (!salt || !iv || !cipherBytes) return null;

      const key = await this.deriveAesGcmKey(secret, salt);
      if (!key) return null;

      const plainBuffer = await subtle.decrypt({ name: 'AES-GCM', iv }, key, cipherBytes);
      return this.decodeUtf8(new Uint8Array(plainBuffer));
    } catch {
      return null;
    }
  }

  private async encryptWithCryptoJs(rawValue: string, secret: string): Promise<string | null> {
    const cryptoJs = await getCryptoJs();
    if (!cryptoJs) return null;

    try {
      const key = cryptoJs.SHA256(secret);
      const iv = cryptoJs.lib.WordArray.random(16);
      const encrypted = cryptoJs.AES.encrypt(rawValue, key, {
        iv,
        mode: cryptoJs.mode.CBC,
        padding: cryptoJs.pad.Pkcs7,
      });

      const payload: EncryptedStoragePayloadV1 = {
        v: ENCRYPTED_STORAGE_VERSION_V1,
        iv: iv.toString(cryptoJs.enc.Hex),
        ct: encrypted.ciphertext.toString(cryptoJs.enc.Base64),
      };

      return `${ENCRYPTED_STORAGE_PREFIX_V1}${JSON.stringify(payload)}`;
    } catch {
      return null;
    }
  }

  private async decryptWithCryptoJs(rawValue: string, secret: string): Promise<string | null> {
    const cryptoJs = await getCryptoJs();
    if (!cryptoJs) return null;

    try {
      const encoded = rawValue.slice(ENCRYPTED_STORAGE_PREFIX_V1.length);
      const payload = JSON.parse(encoded) as Partial<EncryptedStoragePayloadV1>;
      if (
        payload.v !== ENCRYPTED_STORAGE_VERSION_V1
        || typeof payload.iv !== 'string'
        || typeof payload.ct !== 'string'
      ) {
        return null;
      }

      const key = cryptoJs.SHA256(secret);
      const iv = cryptoJs.enc.Hex.parse(payload.iv);
      const ciphertext = cryptoJs.enc.Base64.parse(payload.ct);
      const cipherParams = cryptoJs.lib.CipherParams.create({ ciphertext });
      const decrypted = cryptoJs.AES.decrypt(cipherParams, key, {
        iv,
        mode: cryptoJs.mode.CBC,
        padding: cryptoJs.pad.Pkcs7,
      });
      const plainText = decrypted.toString(cryptoJs.enc.Utf8);
      if (plainText.length === 0 && payload.ct.length > 0) {
        return null;
      }

      return plainText;
    } catch {
      return null;
    }
  }

  private async encryptForStorage(rawValue: string): Promise<string> {
    await this.ensureEncryptionInitialized();
    if (!this.encryptionActive || !this.encryptionSecret) {
      return rawValue;
    }

    try {
      if (this.encryptionProvider === 'webcrypto') {
        const encrypted = await this.encryptWithWebCrypto(rawValue, this.encryptionSecret);
        if (encrypted) return encrypted;
      }

      if (this.encryptionProvider === 'cryptojs' || this.encryptionProvider === 'webcrypto') {
        const encrypted = await this.encryptWithCryptoJs(rawValue, this.encryptionSecret);
        if (encrypted) return encrypted;
      }
    } catch (error) {
      console.error('Save payload encryption failed:', error);
    }

    return rawValue;
  }

  private async decryptFromStorage(rawValue: string): Promise<string | null> {
    if (!this.isEncryptedStoragePayload(rawValue)) {
      return rawValue;
    }

    await this.ensureEncryptionInitialized();
    if (!this.encryptionSecret) {
      return null;
    }

    if (rawValue.startsWith(ENCRYPTED_STORAGE_PREFIX_V2)) {
      const decryptedV2 = await this.decryptWithWebCrypto(rawValue, this.encryptionSecret);
      if (decryptedV2 !== null) return decryptedV2;
      const decryptedFallback = await this.decryptWithCryptoJs(rawValue, this.encryptionSecret);
      return decryptedFallback;
    }

    if (rawValue.startsWith(ENCRYPTED_STORAGE_PREFIX_V1)) {
      return this.decryptWithCryptoJs(rawValue, this.encryptionSecret);
    }

    return null;
  }

  private async writeProtectedStorageItem(key: string, value: string): Promise<void> {
    const storedValue = await this.encryptForStorage(value);
    if (!this.isEncryptedStoragePayload(storedValue) && !IS_DEV_RUNTIME) {
      throw new Error(`Encrypted storage required in production for key: ${key}`);
    }
    await this.storage.setItem(key, storedValue);
  }

  private async readProtectedStorageItem(key: string): Promise<string | null> {
    const rawValue = await this.storage.getItem(key);
    if (typeof rawValue !== 'string') {
      return null;
    }

    const plainValue = await this.decryptFromStorage(rawValue);
    if (plainValue === null) {
      return null;
    }

    if (!this.isEncryptedStoragePayload(rawValue) && this.encryptionActive) {
      try {
        await this.writeProtectedStorageItem(key, plainValue);
      } catch (error) {
        devLog.warn(`Failed to migrate plaintext storage item to encrypted key: ${key}`, error);
      }
    }

    return plainValue;
  }

  private async computeIntegritySignature(
    slotId: string,
    serializedCompressed: string,
    compressedChecksum: string
  ): Promise<string | null> {
    await this.ensureIntegrityInitialized();
    if (!this.integrityActive || !this.integritySecret) return null;

    const payload = `v${INTEGRITY_SCHEME_VERSION}:${slotId}:${compressedChecksum}:${serializedCompressed}`;
    const subtle = this.getWebCryptoSubtle();
    const payloadBytes = this.encodeUtf8(payload);
    const secretBytes = this.encodeUtf8(this.integritySecret);
    if (subtle && payloadBytes && secretBytes) {
      try {
        const key = await subtle.importKey(
          'raw',
          secretBytes,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );
        const signature = await subtle.sign('HMAC', key, payloadBytes);
        return this.bytesToHex(new Uint8Array(signature));
      } catch {
        // Fall back below.
      }
    }

    const cryptoJs = await getCryptoJs();
    if (cryptoJs?.HmacSHA256) {
      try {
        return cryptoJs.HmacSHA256(payload, this.integritySecret).toString();
      } catch {
        // Fall back below.
      }
    }

    return generateChecksum({ payload, secret: this.integritySecret });
  }

  private async readSlotSignature(slotId: string): Promise<string | null> {
    await this.ensureIntegrityInitialized();
    if (!this.integrityActive) return null;
    const secureStore = await getSecureStore();
    if (!secureStore) return null;

    try {
      return await secureStore.getItemAsync(this.getIntegritySignatureKey(slotId));
    } catch {
      return null;
    }
  }

  private async persistSlotSignature(slotId: string, signature: string | null): Promise<void> {
    if (!signature) return;
    await this.ensureIntegrityInitialized();
    if (!this.integrityActive) return;
    const secureStore = await getSecureStore();
    if (!secureStore) return;

    try {
      await secureStore.setItemAsync(this.getIntegritySignatureKey(slotId), signature);
    } catch (error) {
      console.error(`Failed to persist signature for slot ${slotId}:`, error);
    }
  }

  private async deleteSlotSignature(slotId: string): Promise<void> {
    await this.ensureIntegrityInitialized();
    if (!this.integrityActive) return;
    const secureStore = await getSecureStore();
    if (!secureStore?.deleteItemAsync) return;

    try {
      await secureStore.deleteItemAsync(this.getIntegritySignatureKey(slotId));
    } catch (error) {
      console.error(`Failed to delete signature for slot ${slotId}:`, error);
    }
  }

  private async verifySlotSignature(
    slotId: string,
    serializedCompressed: string,
    compressedChecksum: string
  ): Promise<SignatureVerificationResult> {
    const expected = await this.computeIntegritySignature(slotId, serializedCompressed, compressedChecksum);
    if (!expected) return { valid: true, reason: 'disabled' };

    const stored = await this.readSlotSignature(slotId);
    if (!stored) {
      // Upgrade path: existing saves from older versions get signed on first trusted read.
      await this.persistSlotSignature(slotId, expected);
      return { valid: true, reason: 'missing' };
    }

    if (stored === expected) {
      return { valid: true, reason: 'match' };
    }

    // Development migration safety: autosave signature drift can occur after local secret/key changes.
    if (IS_DEV_RUNTIME && slotId === AUTO_SAVE_SLOT_ID) {
      await this.persistSlotSignature(slotId, expected);
      return { valid: true, reason: 'resealed_dev_autosave' };
    }

    return { valid: false, reason: 'mismatch' };
  }

  async initialize(): Promise<void> {
    try {
      await this.ensureIntegrityInitialized();
      await this.ensureEncryptionInitialized();
      await this.loadManagerState();
      await this.loadMetaProgression();

      const hasLegacy = await detectLegacySave(this.storage);
      if (hasLegacy) {
        devLog.log('Legacy save detected, migrating...');
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
    const maxSlots = MAX_TOTAL_SLOTS;

    for (let i = 1; i <= maxSlots; i++) {
      const slotId = i.toString();
      const meta = this.state.metadata[slotId] || createEmptySlot(slotId, false);
      metadata.push(meta);
    }

    const autoSaveMeta = this.state.metadata[AUTO_SAVE_SLOT_ID];
    if (autoSaveMeta) {
      metadata.unshift(autoSaveMeta);
    }

    return metadata;
  }

  async getMetaProgression(): Promise<MetaProgression> {
    if (!this.metaProgression) {
      await this.loadMetaProgression();
    }

    return {
      ...this.metaProgression,
      lifetimeAchievementIds: [...(this.metaProgression.lifetimeAchievementIds || [])],
      lifetimeEndingIds: [...(this.metaProgression.lifetimeEndingIds || [])],
      recentRuns: [...(this.metaProgression.recentRuns || [])],
    };
  }

  async setMetaProgression(nextMeta: MetaProgression): Promise<boolean> {
    try {
      this.metaProgression = {
        ...createInitialMetaProgression(),
        ...nextMeta,
        lifetimeAchievementIds: [...(nextMeta.lifetimeAchievementIds || [])],
        lifetimeEndingIds: [...(nextMeta.lifetimeEndingIds || [])],
        recentRuns: [...(nextMeta.recentRuns || [])],
        updatedAt: Date.now(),
      };
      await this.saveMetaProgression();
      return true;
    } catch (error) {
      console.error('Failed to persist meta progression:', error);
      return false;
    }
  }

  async updateMetaProgression(
    updater: (current: MetaProgression) => MetaProgression
  ): Promise<MetaProgression> {
    const current = await this.getMetaProgression();
    const next = updater(current);
    await this.setMetaProgression(next);
    return this.getMetaProgression();
  }

  async saveToSlot(
    slotId: string,
    playerName: string,
    stats: Stats,
    gameState: GameState,
    options?: { importedMetadata?: Partial<SaveSlotMetadata> }
  ): Promise<boolean> {
    try {
      // Check if slot is already being saved
      if (this.saveLocks.get(slotId)) {
        devLog.log(`Slot ${slotId} is locked, queueing save...`);
        // Queue this save to execute after current save completes
        return new Promise<boolean>((resolve) => {
          const queuedSave = async () => {
            const result = await this.saveToSlot(slotId, playerName, stats, gameState, options);
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

      const isPremium = false;

      const existingMeta = {
        ...(this.state.metadata[slotId] || {}),
        ...(options?.importedMetadata || {}),
      } as Partial<SaveSlotMetadata>;
      const now = Date.now();
      const lastPlayed = existingMeta?.lastPlayed ?? now;
      const prevPlaytime = existingMeta?.playtime ?? 0;
      const previousTurns = this.state.slots[slotId]?.gameState?.totalTurns ?? 0;
      const currentTurns = gameState?.totalTurns ?? 0;
      const turnDelta = Math.max(0, currentTurns - previousTurns);
      const turnMinutes = turnDelta * 5;
      const timeDeltaMinutes = Math.max(0, Math.round((now - lastPlayed) / 60000));
      const playtime = prevPlaytime + (timeDeltaMinutes > 0 ? timeDeltaMinutes : turnMinutes);
      const checksum = generateChecksum(this.buildChecksumPayload(playerName, stats, gameState));
      const deviceId = await this.getOrCreateDeviceId();
      const revision = (existingMeta.revision ?? 0) + 1;
      const createdAt = existingMeta.createdAt ?? now;
      const saveId = existingMeta.saveId ?? this.generateId('save');
      const migrationState =
        existingMeta.migrationState === 'conflict' || existingMeta.migrationState === 'migrated'
          ? existingMeta.migrationState
          : 'pending';

      const saveData: SaveSlotData = {
        metadata: {
          slotId,
          characterName: playerName,
          age: gameState.age,
          playtime,
          lastPlayed: now,
          version: SAVE_VERSION,
          checksum,
          schemaVersion: SAVE_SCHEMA_VERSION,
          saveId,
          deviceId,
          revision,
          clientRevision: revision,
          createdAt,
          updatedAt: now,
          idempotencyKey: this.generateId('op'),
          migrationState,
          status: 'active',
          isPremium,
        },
        playerName,
        stats,
        gameState,
      };

      const compressed = compressSaveData(saveData);
      const serializedCompressed = JSON.stringify(compressed);
      const integritySignature = await this.computeIntegritySignature(
        slotId,
        serializedCompressed,
        compressed.checksum
      );

      await this.writeProtectedStorageItem(getSlotKey(slotId), serializedCompressed);
      await this.writeProtectedStorageItem(getMetadataKey(slotId), JSON.stringify(saveData.metadata));
      await this.persistSlotSignature(slotId, integritySignature);

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
      const { rawData, keyVersion } = await this.readSlotDataWithFallback(slotId);
      if (!rawData) return null;

      const compressed = JSON.parse(rawData) as CompressedSaveData;
      const signatureCheck = await this.verifySlotSignature(
        slotId,
        rawData,
        typeof compressed?.checksum === 'string' ? compressed.checksum : ''
      );
      if (!signatureCheck.valid) {
        console.error(`Slot ${slotId} integrity signature mismatch, attempting restore from backup`);
        return await this.restoreFromBackup(slotId);
      }
      if (signatureCheck.reason === 'resealed_dev_autosave') {
        devLog.warn('Autosave integrity signature drift detected and resealed in development runtime.');
      }

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
      let validatedData = validation.data as SaveSlotData;
      if (validation.repaired) {
        devLog.warn(`Slot ${slotId} was auto-repaired:`, validation.repairLog);
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
        devLog.log(`Migrating slot ${slotId} from v${validatedData.metadata.version} to v${SAVE_VERSION}`);
        await createMigrationBackup(this.storage, slotId, validatedData as SaveSlotData);
        const migrated = migrateToVersion(validatedData as SaveSlotData, SAVE_VERSION);
        await this.saveToSlot(slotId, migrated.playerName, migrated.stats, migrated.gameState);
        if (keyVersion < SAVE_VERSION) {
          await this.storage.removeItem(getSlotKey(slotId, keyVersion));
          await this.storage.removeItem(getMetadataKey(slotId, keyVersion));
        }
        return migrated;
      }

      const checksumPayload = this.buildChecksumPayload(validatedData.playerName, validatedData.stats, validatedData.gameState);
      const expectedChecksum = generateChecksum(checksumPayload);
      const isValid = validateChecksum(checksumPayload, validatedData.metadata.checksum);

      if (!isValid) {
        if (slotId !== AUTO_SAVE_SLOT_ID) {
          devLog.warn(`Slot ${slotId} checksum mismatch detected, attempting checksum repair`);
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

      const deviceId = await this.getOrCreateDeviceId();
      const normalizedMetadata: SaveSlotMetadata = {
        ...(validatedData.metadata as SaveSlotMetadata),
        schemaVersion: validatedData.metadata.schemaVersion ?? SAVE_SCHEMA_VERSION,
        saveId: validatedData.metadata.saveId ?? this.generateId('save'),
        deviceId: validatedData.metadata.deviceId ?? deviceId,
        revision: validatedData.metadata.revision ?? 1,
        clientRevision: validatedData.metadata.clientRevision ?? validatedData.metadata.revision ?? 1,
        createdAt: validatedData.metadata.createdAt ?? validatedData.metadata.lastPlayed ?? Date.now(),
        updatedAt: validatedData.metadata.updatedAt ?? validatedData.metadata.lastPlayed ?? Date.now(),
        migrationState: validatedData.metadata.migrationState ?? 'pending',
      };

      const normalizedData: SaveSlotData = {
        ...(validatedData as SaveSlotData),
        metadata: normalizedMetadata,
      };

      this.state.slots[slotId] = normalizedData;
      this.state.metadata[slotId] = normalizedMetadata;

      return normalizedData;
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

      await this.removeVersionedSlotKeys(slotId);
      await this.deleteSlotSignature(slotId);
      await this.storage.removeItem(this.getBackupHistoryKey(slotId));
      await this.storage.removeItem(getBackupKey(slotId));

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
      await this.removeVersionedSlotKeys(slotId);
      await this.storage.removeItem(getBackupKey(slotId));
      await this.storage.removeItem(this.getBackupHistoryKey(slotId));
      await this.deleteSlotSignature(slotId);

      delete this.state.slots[slotId];
      delete this.state.metadata[slotId];

      await this.saveManagerState();
      return true;
    } catch (error) {
      console.error(`Clear slot ${slotId} failed:`, error);
      return false;
    }
  }

  async autoSave(playerName: string, stats: Stats, gameState: GameState): Promise<boolean> {
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
      const backups = await this.getExportBackups(slotId);
      const exportedAt = Date.now();
      const manifest = this.buildExportManifest(slotId, saveData, backups);

      const exportData: SaveExportPackage & {
        version: number;
        exported: number;
        data: SaveSlotData;
      } = {
        exportVersion: SAVE_EXPORT_VERSION,
        appVersion: `save-v${SAVE_VERSION}`,
        exportedAt,
        manifest,
        saves: [saveData],
        backups,
        version: SAVE_VERSION,
        exported: exportedAt,
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
      if (typeof jsonData !== 'string' || jsonData.trim().length === 0) {
        throw new Error('Import payload is empty');
      }

      const payloadBytes =
        typeof TextEncoder !== 'undefined'
          ? new TextEncoder().encode(jsonData).length
          : jsonData.length;
      if (payloadBytes > MAX_IMPORT_PAYLOAD_BYTES) {
        throw new Error(`Import payload too large (${payloadBytes} bytes)`);
      }

      const importData = JSON.parse(jsonData) as unknown;
      const importRecord = importData as Record<string, unknown>;

      const extractedSave = this.extractImportedSave(importData);
      if (!extractedSave) {
        throw new Error('Invalid import format');
      }

      const validation = validateSaveData(extractedSave);
      if (!validation.valid || !validation.data) {
        throw new Error('Imported save failed validation');
      }

      if (validation.repaired) {
        devLog.warn('Imported save was auto-repaired:', validation.repairLog);
      }

      let saveData = validation.data as SaveSlotData;
      if (saveData.metadata.version < SAVE_VERSION) {
        saveData = migrateToVersion(saveData, SAVE_VERSION);
      }

      const importedBackups = this.sanitizeImportedBackups(slotId, importRecord.backups);
      const sourceSlotId = saveData.metadata.slotId || slotId;
      if (!this.isManifestValidForImport(sourceSlotId, saveData, importedBackups, importRecord.manifest)) {
        throw new Error('Import manifest checksum mismatch');
      }

      const importedMetadata: Partial<SaveSlotMetadata> = {
        ...saveData.metadata,
        schemaVersion: saveData.metadata.schemaVersion ?? SAVE_SCHEMA_VERSION,
        migrationState: 'migrated',
        updatedAt: Date.now(),
      };

      const saved = await this.saveToSlot(
        slotId,
        saveData.playerName,
        saveData.stats,
        saveData.gameState,
        { importedMetadata }
      );

      if (!saved) return false;

      await this.mergeImportedBackups(slotId, importedBackups);
      return true;
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
    return MAX_TOTAL_SLOTS;
  }

  private async createBackup(slotId: string, saveData: SaveSlotData): Promise<void> {
    try {
      const backup: SaveBackup = {
        slotId,
        timestamp: Date.now(),
        data: saveData,
      };

      const history = await this.getBackupHistory(slotId);
      const nextHistory = [backup, ...history].slice(0, MAX_BACKUP_HISTORY);

      await this.writeProtectedStorageItem(getBackupKey(slotId), JSON.stringify(backup));
      await this.persistBackupHistory(slotId, nextHistory);
    } catch (error) {
      console.error(`Backup creation for slot ${slotId} failed:`, error);
    }
  }

  private async restoreFromBackup(slotId: string): Promise<SaveSlotData | null> {
    try {
      const history = await this.getBackupHistory(slotId);
      let backup: SaveBackup | null = history[0] ?? null;

      if (!backup) {
        const rawBackup = await this.readProtectedStorageItem(getBackupKey(slotId));
        if (!rawBackup) return null;
        backup = JSON.parse(rawBackup) as SaveBackup;
      }

      if (this.state.metadata[slotId]) {
        this.state.metadata[slotId]!.status = 'corrupted';
      }

      await this.saveToSlot(slotId, backup.data.playerName, backup.data.stats, backup.data.gameState, {
        importedMetadata: backup.data.metadata,
      });

      return backup.data;
    } catch (error) {
      console.error(`Restore from backup for slot ${slotId} failed:`, error);
      return null;
    }
  }

  private async loadManagerState(): Promise<void> {
    try {
      const rawState = await this.readProtectedStorageItem(getManagerStateKey());
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
      await this.writeProtectedStorageItem(getManagerStateKey(), JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save manager state:', error);
    }
  }

  private async loadMetaProgression(): Promise<void> {
    try {
      const rawMeta = await this.readProtectedStorageItem(META_PROGRESS_KEY);
      if (!rawMeta) {
        this.metaProgression = createInitialMetaProgression();
        return;
      }

      const parsed = JSON.parse(rawMeta) as Partial<MetaProgression>;
      this.metaProgression = {
        ...createInitialMetaProgression(),
        ...parsed,
        lifetimeAchievementIds: [...(parsed.lifetimeAchievementIds || [])],
        lifetimeEndingIds: [...(parsed.lifetimeEndingIds || [])],
        recentRuns: [...(parsed.recentRuns || [])],
      };
    } catch (error) {
      console.error('Failed to load meta progression:', error);
      this.metaProgression = createInitialMetaProgression();
    }
  }

  private async saveMetaProgression(): Promise<void> {
    try {
      await this.writeProtectedStorageItem(META_PROGRESS_KEY, JSON.stringify(this.metaProgression));
    } catch (error) {
      console.error('Failed to save meta progression:', error);
    }
  }

  private async loadAllSlotMetadata(): Promise<void> {
    try {
      const maxSlots = MAX_TOTAL_SLOTS;

      for (let i = 1; i <= maxSlots; i++) {
        const slotId = i.toString();
        const { rawMeta } = await this.readMetadataWithFallback(slotId);
        if (rawMeta) {
          this.state.metadata[slotId] = JSON.parse(rawMeta);
        }
      }

      const { rawMeta: autoSaveMeta } = await this.readMetadataWithFallback(AUTO_SAVE_SLOT_ID);
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
        devLog.log('Legacy save migrated to slot 1');
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
