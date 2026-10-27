import AsyncStorage from '@react-native-async-storage/async-storage';
import SaveManager from '../../src/save/SaveManager';
import { validateSaveData } from '../../src/save/SaveValidation';

// Kayıtta saklanan ama GameStateSchema'da tanımlı olmayan alanlar yüklemede silinmemeli.
const baseStats = {
  health: 60,
  intelligence: 55,
  charisma: 40,
  discipline: 45,
  money: 120,
  energy: 90,
  familyRelation: 50,
};

const fieldsOutsideSchema = {
  avatar: { hairStyle: 2, skinTone: 1, accessory: 1 },
  selectedGoal: 'ACADEMIC',
  fate: {
    seed: 42,
    tokens: 2,
    totalRolls: 5,
    outcomeHistory: [],
    zodiacSign: 'KOC',
    consecutiveBadOutcomes: 1,
  },
  purchasedItems: ['bike'],
  savingGoals: [{
    id: 'phone',
    name: 'Telefon',
    targetAmount: 500,
    unlockAge: 12,
    reward: { item: 'phone' },
    completed: false,
  }],
  scars: [{
    id: 'scar_trust',
    label: 'Güven Yara İzi',
    description: 'Arkadaşına güvenmek zor geliyor.',
    sourceEventId: 'tr_ihanet',
    sourceAge: 11,
  }],
  permanentFlags: { left_team: true },
  examsTakenThisYear: ['math'],
  isExamPeriod: true,
  lastBurdenRisk: 0.4,
  eventFrequency: { tr_ninni: { count: 1, lastSeenTurn: 3 } },
  _ageStartStats: { ...baseStats, health: 50 },
  undosUsedThisAge: 1,
};

const makeGameState = () =>
  ({
    age: 12,
    totalTurns: 30,
    ...fieldsOutsideSchema,
  } as any);

describe('kayıt yüklemede alan korunumu', () => {
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

  it('validateSaveData şemada olmayan gameState alanlarını silmez', () => {
    const result = validateSaveData({
      metadata: {
        slotId: '1',
        characterName: 'Ada',
        age: 12,
        playtime: 10,
        lastPlayed: Date.now(),
        version: 1,
        checksum: 'abc',
        status: 'active',
        isPremium: false,
      },
      playerName: 'Ada',
      stats: baseStats,
      gameState: makeGameState(),
    });

    expect(result.valid).toBe(true);
    expect(result.data?.gameState).toMatchObject(fieldsOutsideSchema);
  });

  it('kaydet → yükle döngüsünde alanlar korunur ve diske eksik hâli yazılmaz', async () => {
    const saved = await SaveManager.saveToSlot('1', 'Ada', baseStats, makeGameState());
    expect(saved).toBe(true);

    const firstLoad = await SaveManager.loadFromSlot('1');
    expect(firstLoad?.gameState).toMatchObject(fieldsOutsideSchema);

    // İlk yükleme kaydı yeniden yazabiliyor (sağlama onarımı); ikinci yükleme diskteki hâli gösterir.
    const secondLoad = await SaveManager.loadFromSlot('1');
    expect(secondLoad?.gameState).toMatchObject(fieldsOutsideSchema);
  });
});
