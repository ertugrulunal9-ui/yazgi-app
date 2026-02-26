import { getRestedEnergy } from '../../src/utils/gameUtils';

describe('getRestedEnergy', () => {
  it('falls back to full recovery when feature flag is disabled', () => {
    expect(getRestedEnergy(120, 15, 14, false)).toBe(120);
  });

  it('keeps baby phase at full recovery even when feature is enabled', () => {
    expect(getRestedEnergy(100, 12, 6, true)).toBe(100);
  });

  it('recovers 80% of deficit for ages 7-11', () => {
    expect(getRestedEnergy(100, 40, 7, true)).toBe(88);
    expect(getRestedEnergy(100, 40, 11, true)).toBe(88);
  });

  it('recovers 65% of deficit for ages 12-17', () => {
    expect(getRestedEnergy(100, 40, 12, true)).toBe(79);
    expect(getRestedEnergy(100, 10, 17, true)).toBe(69);
  });

  it('never exceeds max energy after recovery', () => {
    expect(getRestedEnergy(100, 99, 10, true)).toBe(100);
  });

  it('clamps current energy into a valid range', () => {
    expect(getRestedEnergy(100, 130, 14, true)).toBe(100);
    expect(getRestedEnergy(100, -20, 14, true)).toBe(65);
  });

  it('keeps zero floor for invalid max energy', () => {
    expect(getRestedEnergy(-20, 10, 10, true)).toBe(0);
  });
});
