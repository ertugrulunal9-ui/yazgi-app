import React from 'react';
import { render } from '@testing-library/react-native';
import { MainMenuScreen } from '../../src/screens/MainMenuScreen';
import { zodiacInfo, zodiacInfoEn } from '../../src/utils/gameUtils';
import { useGame } from '../../src/context/GameContext';
import { useMetaProgression } from '../../src/context/MetaProgressionContext';
import { useLegacyBonuses } from '../../src/hooks/useGameSelectors';

jest.mock('../../src/context/GameContext', () => ({
  useGame: jest.fn(),
}));

jest.mock('../../src/context/MetaProgressionContext', () => ({
  useMetaProgression: jest.fn(),
}));

jest.mock('../../src/hooks/useGameSelectors', () => ({
  useLegacyBonuses: jest.fn(),
}));

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

const mockedUseGame = useGame as jest.MockedFunction<typeof useGame>;
const mockedUseMetaProgression = useMetaProgression as jest.MockedFunction<typeof useMetaProgression>;
const mockedUseLegacyBonuses = useLegacyBonuses as jest.MockedFunction<typeof useLegacyBonuses>;

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
  beforeEach(() => {
    mockedUseGame.mockReturnValue({
      startNewGame: jest.fn(),
      updateGameState: jest.fn(),
    } as any);
    mockedUseMetaProgression.mockReturnValue({
      metaProgression: null as any,
      refreshMetaProgression: jest.fn(async () => {}),
    });
    mockedUseLegacyBonuses.mockReturnValue({
      visible: false,
      level: 0,
      health: 0,
      intelligence: 0,
      charisma: 0,
      discipline: 0,
      familyRelation: 0,
      money: 0,
    });
  });

  it('renders zodiac personality, strength and challenge text', () => {
    const expectedZodiac = zodiacInfo.OGLAK;
    const { getByText } = render(
      <MainMenuScreen
        theme={theme as any}
        metrics={metrics as any}
        locale="tr"
        onGameStart={jest.fn()}
      />
    );

    expect(getByText(new RegExp(escapeRegExp(expectedZodiac.dateRange)))).toBeTruthy();
    expect(getByText(new RegExp(escapeRegExp(expectedZodiac.personality)))).toBeTruthy();
    expect(getByText(/Guclu:/)).toBeTruthy();
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
      />
    );

    expect(getByText(new RegExp(escapeRegExp(expectedZodiac.dateRange)))).toBeTruthy();
    expect(getByText(new RegExp(escapeRegExp(expectedZodiac.personality)))).toBeTruthy();
    expect(getByText(/Strength:/)).toBeTruthy();
    expect(getByText(/Challenge:/)).toBeTruthy();
  });
});
