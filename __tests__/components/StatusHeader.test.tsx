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
      latestSource: { reason: 'test_stress', amount: 12, turn: 3 },
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

  it('shows current and max energy in the header with an accessibility label', () => {
    const { getByTestId, getByText } = render(
      <StatusHeader
        playerName="Test User"
        age={12}
        stats={stats}
        maxEnergy={100}
        theme={theme}
      />
    );

    const chip = getByTestId('energy-chip');
    expect(chip.props.accessibilityLabel).toBe('Enerji 75/100');
    expect(getByText('75/100')).toBeTruthy();
  });

  it('clamps the header energy to the max and rounds fractional energy', () => {
    const { getByTestId, getByText } = render(
      <StatusHeader
        playerName="Test User"
        age={1}
        stats={{ ...stats, energy: 57.4 }}
        maxEnergy={110}
        theme={theme}
      />
    );

    expect(getByTestId('energy-chip').props.accessibilityLabel).toBe('Enerji 57/110');
    expect(getByText('57/110')).toBeTruthy();
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

  it('shows an open path, not a locked goal or 0%, for a player who chose not to pick a goal', () => {
    const renderTracker = (goalUndecided: boolean) => {
      const view = render(
        <StatusHeader
          playerName="Test User"
          age={12}
          stats={stats}
          maxEnergy={100}
          goalUndecided={goalUndecided}
          theme={theme}
        />
      );
      fireEvent.press(view.getByText('Bildirimler'));
      return view;
    };

    const locked = renderTracker(false);
    // Risk kutusu ve sütunlar da "%0" gösterebilir; takipçinin kendi %0'ı sayılır
    const lockedZeroCount = locked.queryAllByText('%0').length;
    locked.unmount();

    const undecided = renderTracker(true);
    expect(undecided.getByText('Açık yol: her şeyden biraz')).toBeTruthy();
    expect(undecided.getByText('Sonun, en çok geliştirdiğin alana göre belirlenecek.')).toBeTruthy();
    expect(undecided.queryByText('Hedef seçimi 10 yaşında açılır.')).toBeNull();
    expect(undecided.queryAllByText('%0')).toHaveLength(lockedZeroCount - 1);
  });
});

describe('StatusHeader pillar alerts by age', () => {
  // Bebeklik başlangıç statları: zekâ/disiplin 0, karizma 5, sağlık 25
  const infantStats = {
    health: 25,
    intelligence: 0,
    charisma: 5,
    discipline: 0,
    money: 0,
    energy: 57,
    familyRelation: 50,
  };

  const borderOf = (getByLabelText: (label: string) => any, label: string): string => (
    flattenStyle(getByLabelText(label).props.style).borderColor
  );

  beforeEach(() => {
    setRuntimeLocale('tr');
    mockedUseStress.mockReturnValue({
      current: 0,
      threshold: 70,
      ratio: 0,
      latestSource: { reason: 'test_stress', amount: 0, turn: 1 },
      recoveryPerTurn: 3,
    });
    mockedUsePillarStats.mockImplementation((incomingStats: any) => ({
      beden: Math.round((incomingStats.health + incomingStats.energy) / 2),
      zihin: Math.round((incomingStats.intelligence + incomingStats.discipline) / 2),
      ruh: Math.round((incomingStats.charisma + incomingStats.familyRelation) / 2),
      servet: incomingStats.money,
      raw: incomingStats,
    }));
  });

  it('does not mark any pillar red for a newborn with the starting stats', () => {
    [0, 1, 3, 6].forEach(age => {
      const { getByLabelText, unmount } = render(
        <StatusHeader
          playerName="Bebek"
          age={age}
          stats={infantStats}
          maxEnergy={100}
          theme={theme}
        />
      );

      expect(borderOf(getByLabelText, 'Zihin detaylarını aç')).toBe(theme.border);
      expect(borderOf(getByLabelText, 'Ruh detaylarını aç')).toBe(theme.border);
      expect(borderOf(getByLabelText, 'Beden detaylarını aç')).toBe(theme.border);
      unmount();
    });
  });

  it('still marks low pillars red from age 7', () => {
    const { getByLabelText } = render(
      <StatusHeader
        playerName="Öğrenci"
        age={7}
        stats={infantStats}
        maxEnergy={100}
        theme={theme}
      />
    );

    expect(borderOf(getByLabelText, 'Zihin detaylarını aç')).toBe('#ef4444');
    expect(borderOf(getByLabelText, 'Ruh detaylarını aç')).toBe('#ef4444');
  });
});
