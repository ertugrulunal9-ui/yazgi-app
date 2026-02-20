import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AppShell from '../../src/appShell/AppShell';
import { logTutorialCompleted } from '../../src/utils/analyticsEvents';

const mockUseAppBootstrap = jest.fn();
const mockUseGame = jest.fn();
const mockSetHasCompletedOnboarding = jest.fn();
const mockSettingsPanel = jest.fn();
const mockNavigator = jest.fn();
const mockAnalyticsTracker = jest.fn();
const mockSaveSlotPicker = jest.fn();
const mockTutorialTooltip = jest.fn();

jest.mock('react-native-safe-area-context', () => {
  const ReactLocal = require('react');
  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) =>
      ReactLocal.createElement('SafeAreaProvider', null, children),
    SafeAreaView: ({ children, ...props }: { children?: React.ReactNode }) =>
      ReactLocal.createElement('SafeAreaView', props, children),
  };
});

jest.mock('../../src/appShell/useAppBootstrap', () => ({
  useAppBootstrap: () => mockUseAppBootstrap(),
}));

jest.mock('../../src/context/GameContext', () => {
  const ReactLocal = require('react');
  return {
    GameProvider: ({ children }: { children: React.ReactNode }) =>
      ReactLocal.createElement(ReactLocal.Fragment, null, children),
    useGame: () => mockUseGame(),
  };
});

jest.mock('../../src/utils/gameUtils', () => ({
  clearSlotSave: jest.fn(async () => true),
  getCurrentSlotId: jest.fn(() => '1'),
  setCurrentSlotId: jest.fn(),
}));

jest.mock('../../src/components/Onboarding', () => {
  const ReactLocal = require('react');
  return {
    Onboarding: (props: any) => ReactLocal.createElement('MockOnboarding', props),
  };
});

jest.mock('../../src/components/SaveSlotPicker', () => {
  const ReactLocal = require('react');
  return {
    __esModule: true,
    default: (props: any) => {
      mockSaveSlotPicker(props);
      return ReactLocal.createElement('MockSaveSlotPicker', props);
    },
  };
});

jest.mock('../../src/components/TutorialTooltip', () => {
  const ReactLocal = require('react');
  return {
    TutorialTooltip: (props: any) => {
      mockTutorialTooltip(props);
      return ReactLocal.createElement('MockTutorialTooltip', props);
    },
    useTutorialTooltip: () => ({
      visible: false,
      title: '',
      message: '',
      showTooltip: jest.fn(),
      hideTooltip: jest.fn(),
      nextStep: jest.fn(),
    }),
  };
});

jest.mock('../../src/appShell/SettingsPanel', () => {
  const ReactLocal = require('react');
  return {
    SettingsPanel: (props: any) => {
      mockSettingsPanel(props);
      return ReactLocal.createElement('MockSettingsPanel', props);
    },
  };
});

jest.mock('../../src/appShell/AppNavigator', () => {
  const ReactLocal = require('react');
  return {
    AppNavigator: (props: any) => {
      mockNavigator(props);
      return ReactLocal.createElement('MockAppNavigator', props);
    },
  };
});

jest.mock('../../src/appShell/AnalyticsTracker', () => {
  const ReactLocal = require('react');
  return {
    AnalyticsTracker: (props: any) => {
      mockAnalyticsTracker(props);
      return ReactLocal.createElement('MockAnalyticsTracker', props);
    },
  };
});

jest.mock('../../src/utils/analyticsEvents', () => ({
  logTutorialCompleted: jest.fn(),
  logTutorialTooltipShown: jest.fn(),
}));

describe('AppShell integration', () => {
  const baseTheme = {
    appBg: '#111',
    surfaceBase: '#222',
    surfaceRaised: '#333',
    surfaceOverlay: '#444',
    textPrimary: '#fff',
    textSecondary: '#aaa',
    border: '#555',
    accentEvent: '#09f',
    accentGrade: '#0f9',
    accentSkill: '#c8f',
    accentStat: '#8cf',
  };

  const baseMetrics = {
    font: 15,
    pad: 14,
    icon: 22,
  };

  const baseGameState = {
    phase: 'SETUP',
    currentEvent: null,
    age: 7,
    turn: 1,
    totalTurns: 1,
    maxEnergy: 100,
    eventChoiceHistory: ['event_a'],
    floatingTexts: [{ id: 1, text: 'x' }],
    events: {
      currentEvent: null,
      lastResult: null,
      recentEvents: [],
      scheduledEvents: [],
      memories: [],
      eventChoiceHistory: ['event_a'],
      _eventChoiceSet: new Set(['event_a']),
    },
  };

  const createBootstrapState = (overrides?: Partial<ReturnType<typeof mockUseAppBootstrap>>) => ({
    uiPrefs: {
      theme: 'light',
      density: 'standard',
      reduceMotion: false,
      analyticsEnabled: false,
      personalizedAdsEnabled: false,
    },
    theme: baseTheme,
    metrics: baseMetrics,
    splashQuote: 'Yukleniyor...',
    splashProgress: 0.4,
    showSplash: false,
    hasCompletedOnboarding: true,
    setHasCompletedOnboarding: mockSetHasCompletedOnboarding,
    setThemeMode: jest.fn(),
    setDensityMode: jest.fn(),
    toggleReduceMotion: jest.fn(),
    setAnalyticsEnabled: jest.fn(),
    setPersonalizedAdsEnabled: jest.fn(),
    ...overrides,
  });

  const createGameContext = (overrides?: Record<string, unknown>) => ({
    gameState: baseGameState,
    stats: {
      health: 50,
      intelligence: 50,
      charisma: 50,
      discipline: 50,
      money: 0,
      energy: 80,
      familyRelation: 50,
    },
    playerName: '',
    isLoading: true,
    resetGame: jest.fn(),
    loadSavedGame: jest.fn(async () => true),
    updateGameState: jest.fn(),
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppBootstrap.mockReturnValue(createBootstrapState());
    mockUseGame.mockReturnValue(createGameContext());
  });

  it('renders splash branch before app flow', () => {
    mockUseAppBootstrap.mockReturnValue(
      createBootstrapState({
        showSplash: true,
        hasCompletedOnboarding: false,
      })
    );

    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<AppShell />);
    });
    const onboarding = tree.root.findAllByType('MockOnboarding');
    const navigator = tree.root.findAllByType('MockAppNavigator');

    expect(onboarding).toHaveLength(0);
    expect(navigator).toHaveLength(0);
    expect(mockSaveSlotPicker).not.toHaveBeenCalled();
    tree.unmount();
  });

  it('renders onboarding and completes it through callback', async () => {
    mockUseAppBootstrap.mockReturnValue(
      createBootstrapState({
        showSplash: false,
        hasCompletedOnboarding: false,
      })
    );

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<AppShell />);
    });
    const onboarding = tree.root.findByType('MockOnboarding');

    await act(async () => {
      await onboarding.props.onComplete();
    });

    expect(mockSetHasCompletedOnboarding).toHaveBeenCalledWith(true);
    expect(logTutorialCompleted).toHaveBeenCalledTimes(1);
    tree.unmount();
  });

  it('renders main app shell and strips runtime caches before save picker', () => {
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<AppShell />);
    });

    expect(mockAnalyticsTracker).toHaveBeenCalledTimes(1);
    expect(mockSettingsPanel).toHaveBeenCalledTimes(1);
    expect(mockNavigator).toHaveBeenCalledTimes(1);
    expect(mockSaveSlotPicker).toHaveBeenCalledTimes(1);
    expect(mockTutorialTooltip).toHaveBeenCalledTimes(1);

    const savePickerProps = mockSaveSlotPicker.mock.calls[0][0];
    expect(savePickerProps.currentGameState.floatingTexts).toEqual([]);
    expect(savePickerProps.currentGameState.events._eventChoiceSet).toBeUndefined();
    tree.unmount();
  });
});
