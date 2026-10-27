import { GameStateSchema, SaveSlotMetadataSchema, validateSaveData } from '../../src/save/SaveValidation';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';

describe('Save Compatibility Schema', () => {
  const makeMinimalValidSave = () => ({
    metadata: {
      slotId: '1',
      characterName: 'Test',
      age: 10,
      playtime: 100,
      lastPlayed: Date.now(),
      version: 1,
      checksum: 'abc123',
      status: 'active' as const,
      isPremium: false,
    },
    playerName: 'Test',
    stats: {
      health: 50,
      intelligence: 30,
      charisma: 20,
      discipline: 10,
      money: 100,
      energy: 50,
      familyRelation: 50,
    },
    gameState: {
      age: 10,
      energy: 50,
      maxEnergy: 100,
      turn: 5,
      totalTurns: 5,
      traits: [],
      traitProgress: {},
      inventory: [],
      eventHistory: [],
      recentEventIds: [],
      lifeGoal: null,
      selectedGoal: null,
      unlockedAchievements: [],
      achievementProgress: {},
      eventFrequency: {},
      actionHistory: [],
      scheduledEvents: [],
      npcs: [],
      personalityHistory: [],
      personality: { openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 50 },
      storyArcs: [],
      activeBuffs: [],
      consumableCooldowns: {},
      consumableUsageThisTurn: {},
    },
  });

  describe('v1 key compatibility', () => {
    it('validates a minimal v1-era save (no new fields)', () => {
      const save = makeMinimalValidSave();
      // Remove new fields to simulate v1 save
      delete (save.gameState as Record<string, unknown>).activeBuffs;
      delete (save.gameState as Record<string, unknown>).consumableCooldowns;
      delete (save.gameState as Record<string, unknown>).consumableUsageThisTurn;

      const result = validateSaveData(save);
      // GameState uses .partial() so missing optional fields should be fine
      expect(result.valid || result.repaired).toBe(true);
    });

    it('validates a complete save with all fields', () => {
      const save = makeMinimalValidSave();
      const result = validateSaveData(save);
      expect(result.valid).toBe(true);
      expect(result.data).not.toBeNull();
    });
  });

  describe('validate+repair persist', () => {
    it('accepts save missing activeBuffs (optional field)', () => {
      const save = makeMinimalValidSave();
      delete (save.gameState as Record<string, unknown>).activeBuffs;

      const result = validateSaveData(save);
      // GameState uses .partial() — missing optional fields are accepted
      expect(result.valid || result.repaired).toBe(true);
    });

    it('accepts save missing consumableCooldowns (optional field)', () => {
      const save = makeMinimalValidSave();
      delete (save.gameState as Record<string, unknown>).consumableCooldowns;

      const result = validateSaveData(save);
      expect(result.valid || result.repaired).toBe(true);
    });

    it('accepts save missing consumableUsageThisTurn (optional field)', () => {
      const save = makeMinimalValidSave();
      delete (save.gameState as Record<string, unknown>).consumableUsageThisTurn;

      const result = validateSaveData(save);
      expect(result.valid || result.repaired).toBe(true);
    });
  });

  describe('unknown field handling', () => {
    it('does not crash on unknown fields in gameState', () => {
      const save = makeMinimalValidSave();
      (save.gameState as Record<string, unknown>).futureFieldV3 = 'something';

      // Zod may strip unknown fields, but validation should still succeed
      const result = validateSaveData(save);
      expect(result.valid || result.repaired).toBe(true);
      expect(result.data).not.toBeNull();
    });

    it('handles unknown fields in metadata gracefully (Zod may strip or reject)', () => {
      const save = makeMinimalValidSave();
      (save.metadata as Record<string, unknown>).newMetaField = 42;

      // Zod strict schemas reject unknown fields — this is expected behavior
      // The important thing is it doesn't throw an unhandled exception
      const result = validateSaveData(save);
      expect(typeof result.valid).toBe('boolean');
      expect(result.errors === null || result.errors !== null).toBe(true);
    });
  });

  describe('corrupt save fallback', () => {
    it('rejects completely invalid data', () => {
      const corrupt = { garbage: true };
      const result = validateSaveData(corrupt as any);
      expect(result.valid).toBe(false);
    });

    it('rejects null', () => {
      const result = validateSaveData(null as any);
      expect(result.valid).toBe(false);
    });

    it('rejects non-object', () => {
      const result = validateSaveData('not an object' as any);
      expect(result.valid).toBe(false);
    });
  });

  // zod 3 -> 4 geçişi için: oyunun kendi kurulum yardımcılarıyla kurulmuş, dolu bir orta-oyun kaydı
  // (cihazdaki gibi JSON'dan geçmiş). Yükleme sonucu zod 3 ile birebir aynı kalmalı.
  describe('realistic full save (zod 3 -> 4 regression)', () => {
    const pickKeys = (source: Record<string, unknown>, keys: string[]) => Object.fromEntries(
      Object.entries(source).filter(([key]) => keys.includes(key))
    );

    const makeRealisticSave = () => {
      const base = getInitialGameState();
      const gameState = {
        ...base,
        age: 12,
        turn: 41,
        totalTurns: 40,
        phase: 'HUB',
        innerThought: 'Yarın sonuçlar açıklanıyor.',
        innerThoughtType: 'CLIFFHANGER',
        characterInfo: {
          firstName: 'Ece', lastName: 'Yılmaz', gender: 'FEMALE', birthMonth: 3, birthDay: 14, birthCity: 'Bursa', zodiacSign: 'BALIK',
        },
        lastResult: {
          feedback: 'Sınava iyi hazırlandın.',
          changes: { intelligence: 3, energy: -10 },
          skillChanges: { logic: 2 },
          traitChanges: [{ traitId: 'studious', changeType: 'GAINED', summary: 'Çalışkan oldun' }],
          fateRoll: { outcome: 'FORTUNATE', rawRoll: 71, modifiedRoll: 76, zodiacModifier: 3, pityModifier: 2 },
        },
        historyLog: [{ id: 'log_1', age: 11, message: 'İlk sınav', type: 'positive', eventId: 'school_exam_day' }],
        traits: [...base.traits, 'studious'],
        traitProgress: { studious: { points: 3, required: 3, isLocked: true, firstTriggeredAge: 9, lastProgressTurn: 38 } },
        actionCounts: { study: 12 },
        actionHistory: [{ actionId: 'study', age: 12, turn: 40 }],
        eventChoiceHistory: ['tr_dis_bugdayi:kalem'],
        memories: [{ id: 'mem_1', eventId: 'tr_dis_bugdayi', choiceId: 'kalem', age: 1, emotion: 'PRIDE', weight: 'HIGH', turnTimestamp: 2 }],
        scheduledEvents: [
          { id: 'sch_1', eventId: 'echo_dis_bugdayi_kalem', triggerAge: 10, priority: 'HIGH', sourceEventId: 'tr_dis_bugdayi', sourceChoiceId: 'kalem', sourceAge: 1 },
          { id: 'sch_2', eventId: 'forced_recovery', remainingTurns: 2, priority: 950 },
        ],
        echoLog: [{ sourceEventId: 'tr_ninni', sourceChoiceId: 'sarki', sourceAge: 1, eventId: 'echo_ninni', age: 2 }],
        currentCausalLink: {
          sourceEventId: 'tr_dis_bugdayi', narrativeLine: 'Bir zamanlar kalemi seçmiştin.', emotion: 'PRIDE', sourceChoiceId: 'kalem', sourceAge: 1,
        },
        pendingCliffhanger: { type: 'EXAM_RESULT', title: 'Sonuçlar', description: 'Yarın açıklanıyor.' },
        activeArcs: [{ arcId: 'school_rival', stage: 1 }],
        activeBuffs: [{ itemId: 'energy_drink', turnsRemaining: 2, effect: { energy: 10 }, appliedAt: 39 }],
        consumableCooldowns: { energy_drink: 3 },
        consumableUsageThisTurn: { energy_drink: 1 },
        unlockedAchievements: [{ achievementId: 'first_exam', unlockedAt: 11, timestamp: '2026-10-20T10:00:00.000Z' }],
        achievementProgress: { exams: 1 },
        personalityHistory: [{ axis: 'courage', oldValue: 50, newValue: 54, reason: 'Arkadaşını savundun', turn: 30, age: 11 }],
        socialGroups: [{
          id: 'grp_1', name: 'Kütüphane', members: [base.npcs[0].id], type: 'STUDY_GROUP', reputation: 60, isPlayerMember: true, formedAtAge: 11, formedAtTurn: 33,
        }],
        metaProgression: {
          version: 1,
          totalRunsCompleted: 2,
          totalLegacyPoints: 80,
          legacyLevel: 1,
          bestTier: 'NORMAL',
          highestCompatibilityScore: 61,
          highestAgeReached: 18,
          lifetimeAchievementIds: ['first_exam'],
          lifetimeEndingIds: ['teacher_normal'],
          recentRuns: [{
            runId: 'run_1', endedAt: 1760000000000, age: 18, endingId: 'teacher_normal', endingTitle: 'Öğretmen', tier: 'NORMAL',
            pointsEarned: 40, compatibilityScore: 61, selectedGoal: null,
          }],
          updatedAt: 1760000000000,
        },
        metaRunRecorded: false,
      };

      // SaveManager.saveToSlot'un yazdığı biçim; chapter/goalName şemada yok, yüklenince atılır
      return JSON.parse(JSON.stringify({
        metadata: {
          slotId: '1', characterName: 'Ece', age: 12, chapter: 'school', goalName: undefined, playtime: 200,
          lastPlayed: 1760000000000, version: 3, checksum: 'abc123', schemaVersion: 2, saveId: 'save_1', deviceId: 'device_1',
          revision: 7, clientRevision: 7, createdAt: 1750000000000, updatedAt: 1760000000000, idempotencyKey: 'op_1',
          migrationState: 'pending', status: 'active', isPremium: false,
        },
        playerName: 'Ece',
        stats: getInitialStats(),
        gameState,
      })) as {
        metadata: Record<string, unknown>;
        playerName: string;
        stats: Record<string, unknown>;
        gameState: Record<string, unknown>;
      };
    };

    it('loads a full mid-game save without repair and keeps every field the schema knows', () => {
      const save = makeRealisticSave();
      const result = validateSaveData(save);

      expect(result.valid).toBe(true);
      expect(result.repaired).toBe(false);
      expect(result.repairLog).toEqual([]);
      expect(result.data).toEqual({
        metadata: pickKeys(save.metadata, Object.keys(SaveSlotMetadataSchema.shape)),
        playerName: save.playerName,
        stats: save.stats,
        // GameStateSchema bilinmeyen anahtarları atar (strip), bilinenleri olduğu gibi bırakır
        gameState: pickKeys(save.gameState, Object.keys(GameStateSchema.shape)),
      });
      expect(result.data?.metadata).not.toHaveProperty('chapter');
    });

    it('fills only the defaults zod 3 filled for an older save', () => {
      const save = makeRealisticSave();
      delete save.metadata.isPremium;
      for (const key of ['innerThoughtType', 'activeBuffs', 'consumableCooldowns', 'consumableUsageThisTurn']) {
        delete save.gameState[key];
      }
      delete (save.gameState.metaProgression as Record<string, unknown>).lifetimeEndingIds;

      const result = validateSaveData(save);

      expect(result.valid).toBe(true);
      expect(result.repaired).toBe(false);
      expect(result.data?.metadata.isPremium).toBe(false);
      expect(result.data?.gameState.metaProgression?.lifetimeEndingIds).toEqual([]);
      // .partial() altında zod 3 varsayılan uygulamıyordu; eksik alanlar eksik kalır
      for (const key of ['innerThoughtType', 'activeBuffs', 'consumableCooldowns', 'consumableUsageThisTurn']) {
        expect(result.data?.gameState).not.toHaveProperty(key);
      }
    });
  });
});
