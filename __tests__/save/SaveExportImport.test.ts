import AsyncStorage from '@react-native-async-storage/async-storage';
import SaveManager from '../../src/save/SaveManager';
import { getSlotKey, getMetadataKey } from '../../src/save/SaveSlot';

const baseStats = {
  health: 60,
  intelligence: 55,
  charisma: 40,
  discipline: 45,
  money: 120,
  energy: 90,
  familyRelation: 50,
};

const makeGameState = (age: number, totalTurns: number) =>
  ({
    age,
    totalTurns,
  } as any);

describe('SaveManager export/import compatibility', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();

    const manager = SaveManager as any;
    manager.state = {
      ...manager.state,
      slots: {},
      metadata: {},
      lastAutoSave: 0,
      cloudSync: {
        ...manager.state.cloudSync,
        enabled: false,
        pendingSlots: [],
      },
    };
    manager.saveLocks?.clear?.();
    manager.saveQueue?.clear?.();
    manager.deviceId = null;
  });

  it('exports v2 package with manifest, saves and backups', async () => {
    const saved = await SaveManager.saveToSlot('1', 'Alice', baseStats, makeGameState(12, 3));
    expect(saved).toBe(true);

    const rawExport = await SaveManager.exportSlot('1');
    expect(rawExport).not.toBeNull();

    const exported = JSON.parse(rawExport!);
    expect(exported.exportVersion).toBe(2);
    expect(exported.version).toBe(1);
    expect(Array.isArray(exported.saves)).toBe(true);
    expect(exported.saves[0].playerName).toBe('Alice');
    expect(Array.isArray(exported.backups)).toBe(true);
    expect(exported.backups.length).toBeGreaterThan(0);
    expect(exported.manifest.backupCount).toBe(exported.backups.length);
  });

  it('imports legacy format { version, data }', async () => {
    await SaveManager.saveToSlot('1', 'LegacyUser', baseStats, makeGameState(11, 2));
    const rawExport = await SaveManager.exportSlot('1');
    const exported = JSON.parse(rawExport!);

    const legacyPayload = JSON.stringify({
      version: exported.version,
      exported: exported.exported,
      data: exported.data,
    });

    const imported = await SaveManager.importSlot('2', legacyPayload);
    expect(imported).toBe(true);

    const loaded = await SaveManager.loadFromSlot('2');
    expect(loaded).not.toBeNull();
    expect(loaded?.playerName).toBe('LegacyUser');
    expect(loaded?.metadata.slotId).toBe('2');
    expect(loaded?.metadata.migrationState).toBe('migrated');
  });

  it('imports v2 package and keeps backup history bounded', async () => {
    await SaveManager.saveToSlot('1', 'BackupUser', baseStats, makeGameState(10, 1));
    await SaveManager.saveToSlot('1', 'BackupUser', baseStats, makeGameState(10, 2));
    await SaveManager.saveToSlot('1', 'BackupUser', baseStats, makeGameState(10, 3));

    const sourceExport = await SaveManager.exportSlot('1');
    const sourcePackage = JSON.parse(sourceExport!);
    expect(sourcePackage.backups.length).toBeGreaterThan(0);

    const imported = await SaveManager.importSlot('3', sourceExport!);
    expect(imported).toBe(true);

    const targetExport = await SaveManager.exportSlot('3');
    const targetPackage = JSON.parse(targetExport!);
    expect(targetPackage.exportVersion).toBe(2);
    expect(targetPackage.backups.length).toBeGreaterThan(0);
    expect(targetPackage.backups.length).toBeLessThanOrEqual(5);
  });

  it('stores save payloads encrypted at rest', async () => {
    const saved = await SaveManager.saveToSlot('1', 'EncryptedUser', baseStats, makeGameState(12, 4));
    expect(saved).toBe(true);

    const rawSlot = await AsyncStorage.getItem(getSlotKey('1'));
    const rawMeta = await AsyncStorage.getItem(getMetadataKey('1'));
    expect(rawSlot).toBeTruthy();
    expect(rawMeta).toBeTruthy();
    expect(rawSlot?.startsWith('enc:v1:')).toBe(true);
    expect(rawMeta?.startsWith('enc:v1:')).toBe(true);
    expect(rawSlot).not.toContain('EncryptedUser');
    expect(rawMeta).not.toContain('EncryptedUser');

    const loaded = await SaveManager.loadFromSlot('1');
    expect(loaded?.playerName).toBe('EncryptedUser');
  });
});
