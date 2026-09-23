export const BALANCE_CONTRACT = Object.freeze({
  initialStats: {
    health: 25,
    intelligence: 0,
    charisma: 5,
    discipline: 0,
    money: 0,
    familyRelation: 50,
  },
  initialEnergy: {
    base: 50,
    healthFactor: 0.3,
  },
});

export const calculateInitialEnergy = (health: number): number => {
  return Math.floor(BALANCE_CONTRACT.initialEnergy.base + (health * BALANCE_CONTRACT.initialEnergy.healthFactor));
};
