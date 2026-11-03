import React from 'react';
import { render } from '@testing-library/react-native';
import { DaySummaryModal } from '../../src/components/DaySummaryModal';
import { setRuntimeLocale } from '../../src/i18n/strings';
import type { Stats } from '../../src/types';
import { getPillarValues } from '../../src/utils/pillarStats';

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

const renderSummary = (age: number, health: number) => render(
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

// Satır başlıktaki Beden değerini gösterir; rengi sağlığa göre
const healthColor = (age: number, health: number): string => {
  const { getByText } = renderSummary(age, health);
  const beden = getPillarValues(statsWithHealth(health)).beden;
  return flattenStyle(getByText(`%${beden}`).props.style).color as string;
};

describe('DaySummaryModal pillar rows', () => {
  beforeEach(() => setRuntimeLocale('tr'));

  it('uses the header pillar names and values instead of raw health and intelligence', () => {
    // Başlık "Beden %41" derken gün sonu "Sağlık %25" diyordu
    const { getByText, queryByText } = renderSummary(0, 25);
    expect(getByText('Beden')).toBeTruthy();
    expect(getByText('%41')).toBeTruthy();
    expect(getByText('Zihin')).toBeTruthy();
    expect(getByText('%0')).toBeTruthy();
    expect(queryByText('Sağlık')).toBeNull();
    expect(queryByText('%25')).toBeNull();
  });
});

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
