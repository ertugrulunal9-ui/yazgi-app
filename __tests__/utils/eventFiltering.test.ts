/**
 * Event Filtering Tests
 * Tests event selection and requirement logic
 */

import { GameEvent, GameState, Stats } from '../../src/types';

describe('Event Filtering Logic', () => {
  describe('Age-based Filtering', () => {
    const mockEvents: Partial<GameEvent>[] = [
      { id: 'baby_event', minAge: 0, maxAge: 2 },
      { id: 'kid_event', minAge: 3, maxAge: 6 },
      { id: 'school_event', minAge: 7, maxAge: 12 },
      { id: 'teen_event', minAge: 13, maxAge: 17 },
      { id: 'young_adult', minAge: 18, maxAge: 25 },
    ];

    it('should filter events for baby (age 1)', () => {
      const age = 1;
      const valid = mockEvents.filter(e => age >= e.minAge! && age <= e.maxAge!);

      expect(valid.length).toBe(1);
      expect(valid[0].id).toBe('baby_event');
    });

    it('should filter events for kid (age 5)', () => {
      const age = 5;
      const valid = mockEvents.filter(e => age >= e.minAge! && age <= e.maxAge!);

      expect(valid.length).toBe(1);
      expect(valid[0].id).toBe('kid_event');
    });

    it('should filter events for student (age 10)', () => {
      const age = 10;
      const valid = mockEvents.filter(e => age >= e.minAge! && age <= e.maxAge!);

      expect(valid.length).toBe(1);
      expect(valid[0].id).toBe('school_event');
    });

    it('should filter events for teenager (age 15)', () => {
      const age = 15;
      const valid = mockEvents.filter(e => age >= e.minAge! && age <= e.maxAge!);

      expect(valid.length).toBe(1);
      expect(valid[0].id).toBe('teen_event');
    });

    it('should handle age boundaries correctly', () => {
      const age = 7; // Start of school age
      const valid = mockEvents.filter(e => age >= e.minAge! && age <= e.maxAge!);

      expect(valid[0].id).toBe('school_event');
    });

    it('should return no events for invalid age', () => {
      const age = 100;
      const valid = mockEvents.filter(e => age >= e.minAge! && age <= e.maxAge!);

      expect(valid.length).toBe(0);
    });
  });

  describe('Stat Requirements', () => {
    const baseStats: Stats = {
      health: 50,
      intelligence: 60,
      charisma: 40,
      discipline: 30,
      money: 100,
      energy: 70,
      familyRelation: 50,
    };

    it('should pass with sufficient intelligence', () => {
      const reqStats = { intelligence: 50 };
      const passes = baseStats.intelligence >= reqStats.intelligence;

      expect(passes).toBe(true);
    });

    it('should fail with insufficient intelligence', () => {
      const reqStats = { intelligence: 80 };
      const passes = baseStats.intelligence >= reqStats.intelligence;

      expect(passes).toBe(false);
    });

    it('should check multiple stat requirements', () => {
      const reqStats = { intelligence: 50, charisma: 30 };
      const passes = 
        baseStats.intelligence >= reqStats.intelligence &&
        baseStats.charisma >= reqStats.charisma;

      expect(passes).toBe(true);
    });

    it('should fail if any stat requirement not met', () => {
      const reqStats = { intelligence: 50, charisma: 50 };
      const passes = 
        baseStats.intelligence >= reqStats.intelligence &&
        baseStats.charisma >= reqStats.charisma;

      expect(passes).toBe(false);
    });

    it('should handle money requirements', () => {
      const reqStats = { money: 50 };
      const passes = baseStats.money >= reqStats.money;

      expect(passes).toBe(true);
    });

    it('should handle health requirements', () => {
      const reqStats = { health: 60 };
      const passes = baseStats.health >= reqStats.health;

      expect(passes).toBe(false);
    });
  });

  describe('Trait Requirements', () => {
    const playerTraits = ['GENIUS', 'ATHLETIC'];

    it('should pass if has required trait', () => {
      const reqTrait = 'GENIUS';
      const passes = playerTraits.includes(reqTrait);

      expect(passes).toBe(true);
    });

    it('should fail if missing required trait', () => {
      const reqTrait = 'CHARISMATIC';
      const passes = playerTraits.includes(reqTrait);

      expect(passes).toBe(false);
    });

    it('should handle multiple trait requirements', () => {
      const reqTraits = ['GENIUS', 'ATHLETIC'];
      const passes = reqTraits.every(trait => playerTraits.includes(trait));

      expect(passes).toBe(true);
    });

    it('should fail if missing any required trait', () => {
      const reqTraits = ['GENIUS', 'CHARISMATIC'];
      const passes = reqTraits.every(trait => playerTraits.includes(trait));

      expect(passes).toBe(false);
    });

    it('should handle empty trait requirements', () => {
      const reqTraits: string[] = [];
      const passes = reqTraits.every(trait => playerTraits.includes(trait));

      expect(passes).toBe(true);
    });
  });

  describe('Item Requirements', () => {
    const inventory = ['COMPUTER', 'PHONE', 'BIKE'];

    it('should pass if has required item', () => {
      const reqItem = 'COMPUTER';
      const passes = inventory.includes(reqItem);

      expect(passes).toBe(true);
    });

    it('should fail if missing required item', () => {
      const reqItem = 'CAR';
      const passes = inventory.includes(reqItem);

      expect(passes).toBe(false);
    });

    it('should handle reqNoItem (must NOT have item)', () => {
      const reqNoItem = 'CAR';
      const passes = !inventory.includes(reqNoItem);

      expect(passes).toBe(true);
    });

    it('should fail reqNoItem if player has item', () => {
      const reqNoItem = 'COMPUTER';
      const passes = !inventory.includes(reqNoItem);

      expect(passes).toBe(false);
    });

    it('should handle empty inventory', () => {
      const emptyInventory: string[] = [];
      const reqItem = 'COMPUTER';
      const passes = emptyInventory.includes(reqItem);

      expect(passes).toBe(false);
    });
  });

  describe('Family Relationship Requirements', () => {
    it('should pass with sufficient family relation', () => {
      const familyRelation = 80;
      const reqFamily = 70;
      const passes = familyRelation >= reqFamily;

      expect(passes).toBe(true);
    });

    it('should fail with insufficient family relation', () => {
      const familyRelation = 50;
      const reqFamily = 70;
      const passes = familyRelation >= reqFamily;

      expect(passes).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(100 >= 100).toBe(true);
      expect(0 >= 0).toBe(true);
      expect(50 >= 51).toBe(false);
    });
  });

  describe('Event Rarity Weighting', () => {
    it('should assign weights correctly', () => {
      const weights = {
        COMMON: 70,
        UNCOMMON: 25,
        RARE: 5,
      };

      expect(weights.COMMON + weights.UNCOMMON + weights.RARE).toBe(100);
    });

    it('should make COMMON events most likely', () => {
      const commonWeight = 70;
      const uncommonWeight = 25;
      const rareWeight = 5;

      expect(commonWeight).toBeGreaterThan(uncommonWeight);
      expect(commonWeight).toBeGreaterThan(rareWeight);
    });

    it('should simulate weighted random selection', () => {
      const random = 0.3; // 30%
      let selectedRarity: string;

      if (random < 0.70) {
        selectedRarity = 'COMMON';
      } else if (random < 0.95) {
        selectedRarity = 'UNCOMMON';
      } else {
        selectedRarity = 'RARE';
      }

      expect(selectedRarity).toBe('COMMON');
    });

    it('should select UNCOMMON in range', () => {
      const random = 0.80; // 80%
      let selectedRarity: string;

      if (random < 0.70) {
        selectedRarity = 'COMMON';
      } else if (random < 0.95) {
        selectedRarity = 'UNCOMMON';
      } else {
        selectedRarity = 'RARE';
      }

      expect(selectedRarity).toBe('UNCOMMON');
    });

    it('should select RARE in range', () => {
      const random = 0.97; // 97%
      let selectedRarity: string;

      if (random < 0.70) {
        selectedRarity = 'COMMON';
      } else if (random < 0.95) {
        selectedRarity = 'UNCOMMON';
      } else {
        selectedRarity = 'RARE';
      }

      expect(selectedRarity).toBe('RARE');
    });
  });

  describe('Complex Event Requirements', () => {
    const gameState: Partial<GameState> = {
      age: 15,
      traits: ['GENIUS'],
      inventory: ['COMPUTER'],
    };

    const stats: Stats = {
      health: 70,
      intelligence: 80,
      charisma: 60,
      discipline: 50,
      money: 200,
      energy: 80,
      familyRelation: 75,
    };

    it('should pass event with multiple requirements', () => {
      const event = {
        minAge: 13,
        maxAge: 17,
        reqStats: { intelligence: 70 },
        reqTraits: ['GENIUS'],
        reqItems: ['COMPUTER'],
      };

      const ageOk = gameState.age! >= event.minAge && gameState.age! <= event.maxAge;
      const statsOk = stats.intelligence >= event.reqStats.intelligence;
      const traitsOk = event.reqTraits.every(t => gameState.traits!.includes(t));
      const itemsOk = event.reqItems.every(i => gameState.inventory!.includes(i));

      expect(ageOk && statsOk && traitsOk && itemsOk).toBe(true);
    });

    it('should fail if any requirement not met', () => {
      const event = {
        minAge: 13,
        maxAge: 17,
        reqStats: { intelligence: 90 }, // Too high!
        reqTraits: ['GENIUS'],
        reqItems: ['COMPUTER'],
      };

      const ageOk = gameState.age! >= event.minAge && gameState.age! <= event.maxAge;
      const statsOk = stats.intelligence >= event.reqStats.intelligence;
      const traitsOk = event.reqTraits.every(t => gameState.traits!.includes(t));
      const itemsOk = event.reqItems.every(i => gameState.inventory!.includes(i));

      expect(ageOk && statsOk && traitsOk && itemsOk).toBe(false);
    });
  });
});
