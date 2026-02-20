import { validateSaveData } from '../../src/save/SaveValidation';

const baseMetadata = {
  slotId: '1',
  characterName: 'Test User',
  age: 10,
  playtime: 120,
  lastPlayed: 1700000000000,
  version: 1,
  checksum: 'checksum',
  status: 'active' as const,
  isPremium: false,
};

const baseStats = {
  health: 70,
  intelligence: 60,
  charisma: 55,
  discipline: 50,
  money: 100,
  energy: 80,
  familyRelation: 65,
};

describe('SaveValidation', () => {
  it('preserves characterInfo while validating save data', () => {
    const saveData = {
      metadata: baseMetadata,
      playerName: 'Test User',
      stats: baseStats,
      gameState: {
        age: 10,
        turn: 5,
        phase: 'HUB' as const,
        characterInfo: {
          firstName: 'Ayse',
          lastName: 'Yilmaz',
          gender: 'FEMALE' as const,
          birthMonth: 3,
          birthDay: 12,
          birthCity: 'Istanbul',
          zodiacSign: 'BALIK' as const,
        },
      },
    };

    const result = validateSaveData(saveData);

    expect(result.valid).toBe(true);
    expect(result.data?.gameState.characterInfo).toEqual(saveData.gameState.characterInfo);
    expect(result.data?.gameState.characterInfo?.gender).toBe('FEMALE');
  });

  it('keeps validation backwards compatible when characterInfo is missing', () => {
    const saveData = {
      metadata: baseMetadata,
      playerName: 'Test User',
      stats: baseStats,
      gameState: {
        age: 10,
        turn: 5,
        phase: 'HUB' as const,
      },
    };

    const result = validateSaveData(saveData);

    expect(result.valid).toBe(true);
    expect(result.data?.gameState.characterInfo).toBeUndefined();
  });
});
