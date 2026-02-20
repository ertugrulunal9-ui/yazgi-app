export const BALANCE_CONTRACT = {
  initialStats: {
    health: 70,
    intelligence: 0,
    charisma: 10,
    discipline: 0,
    money: 0,
    energy: 100,
    familyRelation: 50,
  },
  DIMINISHING_RETURNS: { START_THRESHOLD: 0.5, STRENGTH: 1.5 },
  STAT_CAPS: { BASE: 100, SOFT_OVERSHOOT: 10 },
  AGE_CAPS: { MIN_AGE: 0, MAX_AGE: 18 },
  TRAIT_MULTIPLIERS: {
    GENIUS: { intelligence: 1.3 },
    ATHLETIC: { health: 1.3, discipline: 1.2 },
    CHARISMATIC: { charisma: 1.3 },
    SICKLY: { health: 0.7 },
  },
  FAMILY_BONUSES: {},
  ENERGY: { BASE_MAX: 100, POOR_PENALTY: 10, ATHLETIC_BONUS: 10, BURNOUT_PENALTY: 15 },
};

export const calculateInitialEnergy = jest.fn((_family: any, _traits?: string[]) => 100);
