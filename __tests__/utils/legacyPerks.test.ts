import {
  getUnlockedLegacyPerks,
  hasLegacyPerk,
  LEGACY_PERKS,
} from '../../src/data/legacyPerks';

describe('legacy perks', () => {
  it('contains the expected canonical perk ids', () => {
    expect(LEGACY_PERKS.map(perk => perk.id)).toEqual([
      'FAST_START',
      'CHOOSE_GENETIC_TRAIT',
      'BONUS_STARTING_NPC',
      'FREE_STARTING_ITEM',
      'UNLOCK_BALANCED_GOAL',
      'PRESTIGE_BADGE',
    ]);
  });

  it('returns empty list at level 0', () => {
    expect(getUnlockedLegacyPerks(0)).toEqual([]);
  });

  it('unlocks perks progressively by required level', () => {
    expect(getUnlockedLegacyPerks(1).map(perk => perk.id)).toEqual(['FAST_START']);
    expect(getUnlockedLegacyPerks(3).map(perk => perk.id)).toEqual([
      'FAST_START',
      'CHOOSE_GENETIC_TRAIT',
      'BONUS_STARTING_NPC',
    ]);
  });

  it('reports perk availability via hasLegacyPerk helper', () => {
    expect(hasLegacyPerk(0, 'FAST_START')).toBe(false);
    expect(hasLegacyPerk(1, 'FAST_START')).toBe(true);
    expect(hasLegacyPerk(6, 'UNLOCK_BALANCED_GOAL')).toBe(false);
    expect(hasLegacyPerk(7, 'UNLOCK_BALANCED_GOAL')).toBe(true);
    expect(hasLegacyPerk(10, 'PRESTIGE_BADGE')).toBe(true);
  });
});

