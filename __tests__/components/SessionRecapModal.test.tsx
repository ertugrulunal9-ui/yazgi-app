import React from 'react';
import { render } from '@testing-library/react-native';
import { SessionRecapModal } from '../../src/components/SessionRecapModal';
import { setRuntimeLocale } from '../../src/i18n/strings';
import { getInitialGameState } from '../../src/utils/gameUtils';
import type { Stats } from '../../src/types';

jest.mock('../../src/context/UIContext', () => {
  const { tRuntime } = require('../../src/i18n/strings');
  return {
    useUI: () => ({
      theme: {
        surfaceBase: '#111827',
        surfaceRaised: '#1f2937',
        surfaceOverlay: '#334155',
        border: '#334155',
        textPrimary: '#f9fafb',
        textSecondary: '#94a3b8',
        accentEvent: '#22c55e',
        accentBrand: '#38bdf8',
      },
      metrics: { pad: 12, font: 15 },
      t: tRuntime,
    }),
  };
});

// Bebeklik başlangıç statları: sağlık 25, disiplin 0 (mutlak eşiklere göre "düşük")
const lowStats: Stats = {
  health: 25,
  intelligence: 0,
  charisma: 5,
  discipline: 0,
  money: 0,
  energy: 10,
  familyRelation: 50,
};

const renderRecap = (age: number) => render(
  <SessionRecapModal
    visible
    gameState={{ ...getInitialGameState(), age }}
    stats={lowStats}
    playerName="Deniz"
    onClose={jest.fn()}
  />,
);

describe('SessionRecapModal warnings by age', () => {
  beforeEach(() => setRuntimeLocale('tr'));

  it('shows no red attention card for a newborn returning to the game', () => {
    [0, 3, 6].forEach(age => {
      const { queryByText, unmount } = renderRecap(age);
      expect(queryByText('Dikkat')).toBeNull();
      expect(queryByText(/Sağlığın düşük/)).toBeNull();
      expect(queryByText(/Disiplin zayıf/)).toBeNull();
      unmount();
    });
  });

  it('keeps the warnings from age 7', () => {
    const { getByText } = renderRecap(7);
    expect(getByText('Dikkat')).toBeTruthy();
    expect(getByText(/Sağlığın düşük/)).toBeTruthy();
    expect(getByText(/Disiplin zayıf/)).toBeTruthy();
    expect(getByText(/Enerji tükeniyor/)).toBeTruthy();
  });
});
