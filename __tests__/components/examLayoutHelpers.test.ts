import {
  clampHorizontalPosition,
  getHitLineY,
  getLaneItemX,
  getRandomHorizontalPosition,
  getVerticalTravelTarget,
} from '../../src/components/exams/layoutHelpers';

describe('exam layout helpers', () => {
  test('random horizontal position stays inside the math game area', () => {
    for (let index = 0; index < 50; index += 1) {
      const x = getRandomHorizontalPosition(296, 132, 16);
      expect(x).toBeGreaterThanOrEqual(16);
      expect(x).toBeLessThanOrEqual(148);
    }
  });

  test('clampHorizontalPosition keeps math balloons inside the card', () => {
    expect(clampHorizontalPosition(240, 296, 132, 16)).toBe(148);
    expect(clampHorizontalPosition(-20, 296, 132, 16)).toBe(16);
  });

  test('music lane positions and hit line use the measured play area', () => {
    expect(getLaneItemX(336, 3, 0, 44)).toBe(34);
    expect(getLaneItemX(336, 3, 1, 44)).toBe(146);
    expect(getLaneItemX(336, 3, 2, 44)).toBe(258);
    expect(getHitLineY(320, 90, 140)).toBe(230);
    expect(getVerticalTravelTarget(320, 84, 16, 140)).toBe(220);
  });
});
