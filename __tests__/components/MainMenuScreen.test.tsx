import React from 'react';
import { render } from '@testing-library/react-native';
import { MainMenuScreen } from '../../src/screens/MainMenuScreen';
import { zodiacInfo, zodiacInfoEn } from '../../src/utils/gameUtils';
import { createInitialMetaProgression } from '../../src/utils/metaProgression';

jest.mock('../../src/components/LegacyPanel', () => ({
  LegacyPanel: () => null,
}));

jest.mock('../../src/components/EndingGallery', () => ({
  EndingGallery: () => null,
}));

jest.mock('../../src/components/Onboarding', () => ({
  GoalVisionOnboarding: () => null,
}));

jest.mock('../../src/animations', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');
  return {
    FadeInDownView: ({ children }: { children: React.ReactNode }) => ReactLib.createElement(View, null, children),
    FadeInUpView: ({ children }: { children: React.ReactNode }) => ReactLib.createElement(View, null, children),
    buttonPress: jest.fn(),
    successHaptic: jest.fn(),
  };
});

const theme = {
  appBg: '#0f172a',
  textPrimary: '#f9fafb',
  textSecondary: '#94a3b8',
  border: '#334155',
  surfaceBase: '#111827',
  surfaceOverlay: '#1f2937',
  surfaceRaised: '#374151',
  accentEvent: '#22c55e',
  accentBrand: '#38bdf8',
};

const metrics = {
  pad: 12,
  font: 14,
};

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('MainMenuScreen zodiac panel', () => {
  it('renders zodiac personality, strength and challenge text', () => {
    const expectedZodiac = zodiacInfo.OGLAK;
    const { getByText } = render(
      <MainMenuScreen
        theme={theme as any}
        metrics={metrics as any}
        locale="tr"
        onGameStart={jest.fn()}
        startNewGame={jest.fn()}
        metaProgression={createInitialMetaProgression()}
        metaProgressionLoaded
        updateMetaProgression={jest.fn()}
      />
    );

    expect(getByText(new RegExp(escapeRegExp(expectedZodiac.dateRange)))).toBeTruthy();
    expect(getByText(new RegExp(escapeRegExp(expectedZodiac.personality)))).toBeTruthy();
    expect(getByText(/Güçlü:/)).toBeTruthy();
    expect(getByText(/Zorluk:/)).toBeTruthy();
  });

  it('renders localized zodiac content in English locale', () => {
    const expectedZodiac = zodiacInfoEn.OGLAK;
    const { getByText } = render(
      <MainMenuScreen
        theme={theme as any}
        metrics={metrics as any}
        locale="en"
        onGameStart={jest.fn()}
        startNewGame={jest.fn()}
        metaProgression={createInitialMetaProgression()}
        metaProgressionLoaded
        updateMetaProgression={jest.fn()}
      />
    );

    expect(getByText(new RegExp(escapeRegExp(expectedZodiac.dateRange)))).toBeTruthy();
    expect(getByText(new RegExp(escapeRegExp(expectedZodiac.personality)))).toBeTruthy();
    expect(getByText(/Strength:/)).toBeTruthy();
    expect(getByText(/Challenge:/)).toBeTruthy();
  });

  it('waits for persisted meta progression before applying daily login rewards', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-03-08T12:00:00Z'));
    const updateMetaProgression = jest.fn();
    const staleMeta = createInitialMetaProgression(0);
    const persistedMeta = {
      ...createInitialMetaProgression(0),
      lastLoginDate: '2026-03-07',
      loginStreak: 2,
      totalLegacyPoints: 40,
      recentRuns: [{
        runId: 'run_1',
        endedAt: 1,
        age: 19,
        endingId: 'ending_1',
        endingTitle: 'Ending',
        tier: 'SUCCESS' as const,
        pointsEarned: 20,
        compatibilityScore: 80,
        selectedGoal: 'SOCIAL' as const,
      }],
    };

    const { queryByText, rerender } = render(
      <MainMenuScreen
        theme={theme as any}
        metrics={metrics as any}
        locale="en"
        onGameStart={jest.fn()}
        startNewGame={jest.fn()}
        metaProgression={staleMeta}
        metaProgressionLoaded={false}
        updateMetaProgression={updateMetaProgression}
      />
    );

    expect(updateMetaProgression).not.toHaveBeenCalled();
    expect(queryByText(/Welcome back!/)).toBeNull();

    rerender(
      <MainMenuScreen
        theme={theme as any}
        metrics={metrics as any}
        locale="en"
        onGameStart={jest.fn()}
        startNewGame={jest.fn()}
        metaProgression={persistedMeta}
        metaProgressionLoaded
        updateMetaProgression={updateMetaProgression}
      />
    );

    expect(updateMetaProgression).toHaveBeenCalledTimes(1);
    expect(updateMetaProgression.mock.calls[0][0]).toMatchObject({
      lastLoginDate: '2026-03-08',
      loginStreak: 3,
      totalLegacyPoints: 45,
    });
    expect(queryByText('Welcome back! +5 Legacy Points (3-day streak!)')).toBeTruthy();
    jest.useRealTimers();
  });
});
