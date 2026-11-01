import React from 'react';
import { render } from '@testing-library/react-native';
import { DaySummaryModal } from '../../src/components/DaySummaryModal';
import { setRuntimeLocale } from '../../src/i18n/strings';
import type { Stats } from '../../src/types';

const theme = {
  surfaceBase: '#111827',
  border: '#334155',
  textPrimary: '#f9fafb',
  textSecondary: '#94a3b8',
  accentEvent: '#22c55e',
};

const RED = '#ef4444';
const GREEN = '#22c55e';

const flattenStyle = (style: any): Record<string, any> => {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce((acc, item) => ({ ...acc, ...flattenStyle(item) }), {});
  }
  return style;
};

const statsWithHealth = (health: number): Stats => ({
  health,
  intelligence: 0,
  charisma: 5,
  discipline: 0,
  money: 0,
  energy: 57,
  familyRelation: 50,
});

const healthColor = (age: number, health: number): string => {
  const { getByText } = render(
    <DaySummaryModal
      visible
      age={age}
      turn={2}
      dailyDecisionCount={2}
      varietyBonus={0}
      energy={57}
      maxEnergy={100}
      stats={statsWithHealth(health)}
      theme={theme}
      onContinue={jest.fn()}
      onCancel={jest.fn()}
    />
  );
  return flattenStyle(getByText(`%${health}`).props.style).color as string;
};

describe('DaySummaryModal health color by age', () => {
  beforeEach(() => setRuntimeLocale('tr'));

  it('does not paint the starting infant health (25 of a 30 cap) red', () => {
    // Sağlık < 50 mutlak eşiği okul öncesinde (tavan 30) hep kırmızı gösteriyordu
    expect(healthColor(0, 25)).toBe(GREEN);
    expect(healthColor(4, 25)).toBe(GREEN);
  });

  it('still paints truly low infant health red (below 30% of the cap)', () => {
    expect(healthColor(2, 5)).toBe(RED);
  });

  it('keeps the absolute threshold from age 7', () => {
    expect(healthColor(8, 45)).toBe(RED);
    expect(healthColor(8, 60)).toBe(GREEN);
  });
});
