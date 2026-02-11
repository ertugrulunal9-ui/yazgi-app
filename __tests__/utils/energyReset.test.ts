import { getRestedEnergy } from '../../src/utils/gameUtils';

describe('Energy Reset', () => {
  it('should return rounded max energy', () => {
    expect(getRestedEnergy(120)).toBe(120);
    expect(getRestedEnergy(120.4)).toBe(120);
    expect(getRestedEnergy(120.6)).toBe(121);
  });

  it('should never return negative energy', () => {
    expect(getRestedEnergy(-10)).toBe(0);
  });
});
