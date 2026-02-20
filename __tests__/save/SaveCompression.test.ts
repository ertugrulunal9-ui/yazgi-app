import { compressSaveData, decompressSaveData, estimateCompressedSize } from '@/save/SaveCompression';
import { SaveSlotData, SAVE_VERSION } from '@/save/SaveSlot';
import { calculateChecksum } from '@/utils/checksum';

// Minimal valid SaveSlotData for testing
function createMockSaveData(): SaveSlotData {
  return {
    metadata: {
      slotId: 'slot_1',
      characterName: 'TestChar',
      age: 12,
      playtime: 5000,
      lastPlayed: 1700000000000,
      version: SAVE_VERSION,
      checksum: 'abc',
      status: 'active',
      isPremium: false,
    },
    playerName: 'Player1',
    stats: {
      health: 75,
      intelligence: 60,
      charisma: 45,
      discipline: 50,
      money: 2500,
      energy: 90,
      familyRelation: 70,
    },
    gameState: {
      age: 12,
      turn: 24,
    } as any,
  };
}

describe('compressSaveData', () => {
  it('returns compressed data with checksum and version', () => {
    const saveData = createMockSaveData();
    const result = compressSaveData(saveData);

    expect(result).toHaveProperty('compressed');
    expect(result).toHaveProperty('checksum');
    expect(result).toHaveProperty('version');
    expect(result.version).toBe(SAVE_VERSION);
    expect(typeof result.compressed).toBe('string');
    expect(typeof result.checksum).toBe('string');
    expect(result.compressed.length).toBeGreaterThan(0);
  });

  it('produces consistent checksum for same input', () => {
    const saveData = createMockSaveData();
    const result1 = compressSaveData(saveData);
    const result2 = compressSaveData(saveData);

    expect(result1.checksum).toBe(result2.checksum);
  });

  it('produces different checksum for different input', () => {
    const saveData1 = createMockSaveData();
    const saveData2 = createMockSaveData();
    saveData2.stats.health = 10;

    const result1 = compressSaveData(saveData1);
    const result2 = compressSaveData(saveData2);

    expect(result1.checksum).not.toBe(result2.checksum);
  });
});

describe('decompressSaveData', () => {
  it('correctly round-trips save data', () => {
    const original = createMockSaveData();
    const compressed = compressSaveData(original);
    const decompressed = decompressSaveData(compressed);

    expect(decompressed).not.toBeNull();
    expect(decompressed!.playerName).toBe(original.playerName);
    expect(decompressed!.stats.health).toBe(original.stats.health);
    expect(decompressed!.stats.money).toBe(original.stats.money);
    expect(decompressed!.metadata.slotId).toBe(original.metadata.slotId);
  });

  it('returns null for corrupted data (checksum mismatch)', () => {
    const original = createMockSaveData();
    const compressed = compressSaveData(original);

    // Tamper with checksum
    const tampered = { ...compressed, checksum: 'wrong_checksum' };
    const result = decompressSaveData(tampered);

    expect(result).toBeNull();
  });

  it('returns null for invalid compressed string', () => {
    const result = decompressSaveData({
      compressed: '!!!invalid-base64!!!',
      checksum: 'abc',
      version: SAVE_VERSION,
    });

    expect(result).toBeNull();
  });

  it('returns null for empty compressed string', () => {
    const result = decompressSaveData({
      compressed: '',
      checksum: '',
      version: SAVE_VERSION,
    });

    // Empty string base64 decoded is empty string, JSON.parse('') throws
    expect(result).toBeNull();
  });
});

describe('compress/decompress integrity', () => {
  it('preserves all fields through round-trip', () => {
    const original = createMockSaveData();
    original.stats.money = 999999;
    original.stats.energy = 0;
    original.playerName = 'Türkçe İsim Özel Karakterler: çğışöü';

    const compressed = compressSaveData(original);
    const decompressed = decompressSaveData(compressed);

    expect(decompressed).toEqual(original);
  });

  it('handles Unicode characters in save data', () => {
    const original = createMockSaveData();
    original.playerName = '日本語テスト 🎮 Émoji';

    const compressed = compressSaveData(original);
    const decompressed = decompressSaveData(compressed);

    expect(decompressed).not.toBeNull();
    expect(decompressed!.playerName).toBe(original.playerName);
  });
});
