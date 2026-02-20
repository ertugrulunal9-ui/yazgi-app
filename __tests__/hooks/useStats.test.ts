import { calculateDeltaWithMultiplier } from '../../src/hooks/useStats';

describe('useStats delta multiplier logic', () => {
  it('applies multiplier only to positive delta', () => {
    const current = 60;
    const target = 70;
    const multiplier = 1.5;

    const delta = calculateDeltaWithMultiplier(current, target, multiplier);
    expect(delta).toBe(15);
  });

  it('does not multiply negative delta', () => {
    const current = 70;
    const target = 60;
    const multiplier = 2;

    const delta = calculateDeltaWithMultiplier(current, target, multiplier);
    expect(delta).toBe(-10);
  });

  it('does not scale when value is unchanged', () => {
    const delta = calculateDeltaWithMultiplier(42, 42, 3);
    expect(delta).toBe(0);
  });
});

