import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { StatusHeader } from '../../src/components/StatusHeader';
import { usePillarStats, useStress } from '../../src/hooks/useGameSelectors';
import { setRuntimeLocale } from '../../src/i18n/strings';

jest.mock('../../src/hooks/useGameSelectors', () => ({
  useStress: jest.fn(),
  usePillarStats: jest.fn((stats: any) => ({
    beden: Math.round((stats.health + stats.energy) / 2),
    zihin: Math.round((stats.intelligence + stats.discipline) / 2),
    ruh: Math.round((stats.charisma + stats.familyRelation) / 2),
    servet: stats.money,
    raw: stats,
  })),
}));

jest.mock('../../src/animations/ToastAnimations', () => {
  const ReactLib = require('react');
  const { Text } = require('react-native');
  return {
    MessageToast: ({ visible, message }: { visible: boolean; message: string }) => (
      visible ? ReactLib.createElement(Text, { testID: 'stress-critical-toast' }, message) : null
    ),
  };
});

const mockedUseStress = useStress as jest.MockedFunction<typeof useStress>;
const mockedUsePillarStats = usePillarStats as jest.MockedFunction<typeof usePillarStats>;

const theme = {
  appBg: '#0f172a',
  border: '#334155',
  surfaceBase: '#111827',
  surfaceOverlay: '#1f2937',
  surfaceRaised: '#374151',
  textPrimary: '#f9fafb',
  textSecondary: '#94a3b8',
  accentBrand: '#38bdf8',
  accentEvent: '#22c55e',
  fontHeading: 'System',
};

const stats = {
  health: 80,
  intelligence: 70,
  charisma: 55,
  discipline: 65,
  money: 450,
  energy: 75,
  familyRelation: 40,
};

const flattenStyle = (style: any): Record<string, any> => {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce((acc, item) => ({ ...acc, ...flattenStyle(item) }), {});
  }
  return style;
};

describe('StatusHeader stress indicator', () => {
  beforeEach(() => {
    setRuntimeLocale('tr');
    mockedUseStress.mockReturnValue({
      current: 65,
      threshold: 70,
      ratio: 65 / 70,
      recoveryPerTurn: 8,
    });
    mockedUsePillarStats.mockImplementation((incomingStats: any) => ({
      beden: Math.round((incomingStats.health + incomingStats.energy) / 2),
      zihin: Math.round((incomingStats.intelligence + incomingStats.discipline) / 2),
      ruh: Math.round((incomingStats.charisma + incomingStats.familyRelation) / 2),
      servet: incomingStats.money,
      raw: incomingStats,
    }));
  });

  it('shows red stress bar and critical toast for high stress ratio', async () => {
    const { getByTestId, getByText } = render(
      <StatusHeader
        playerName="Test User"
        age={12}
        stats={stats}
        maxEnergy={100}
        theme={theme}
      />
    );

    expect(getByTestId('stress-bar-container')).toBeTruthy();
    expect(getByText('65/70 (%93)')).toBeTruthy();

    const stressFillStyle = flattenStyle(getByTestId('stress-bar-fill').props.style);
    expect(stressFillStyle.backgroundColor).toBe('#ef4444');

    await waitFor(() => {
      expect(getByTestId('stress-critical-toast')).toBeTruthy();
    });
    expect(getByText('Kriz yaklaşıyor!')).toBeTruthy();
  });

  it('renders localized goal tracker copy inside the notifications panel', () => {
    const { getByText } = render(
      <StatusHeader
        playerName="Test User"
        age={12}
        stats={stats}
        maxEnergy={100}
        theme={theme}
      />
    );

    fireEvent.press(getByText('Bildirimler'));

    expect(getByText('Hedef seçimi 10 yaşında açılır.')).toBeTruthy();
    expect(getByText('Hedef seçince izlenecek statlar burada görünür.')).toBeTruthy();
  });
});
