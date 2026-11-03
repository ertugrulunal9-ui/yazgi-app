import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppShell from '../../src/appShell/AppShell';
import { logTutorialCompleted } from '../../src/utils/analyticsEvents';

const mockUseAppBootstrap = jest.fn();
const mockUseGame = jest.fn();
const mockUseMetaProgression = jest.fn();
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

jest.mock('../../src/context/MetaProgressionContext', () => {
  const ReactLocal = require('react');
  return {
    MetaProgressionProvider: ({ children }: { children: React.ReactNode }) =>
      ReactLocal.createElement(ReactLocal.Fragment, null, children),
    useMetaProgression: () => mockUseMetaProgression(),
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

jest.mock('../../src/components/PrivacyChoicesCard', () => {
  const ReactLocal = require('react');
  return {
    PrivacyChoicesCard: (props: any) => ReactLocal.createElement('MockPrivacyChoicesCard', props),
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
  logTutorialSkipped: jest.fn(),
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
    mockUseMetaProgression.mockReturnValue({
      metaProgression: null,
      metaProgressionLoaded: true,
      refreshMetaProgression: jest.fn(async () => {}),
      updateMetaProgression: jest.fn(),
    });
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
    const onboarding = tree.root.findAllByType('MockOnboarding' as any);
    const navigator = tree.root.findAllByType('MockAppNavigator' as any);

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
    const startTutorialButton = tree.root.findByProps({ accessibilityLabel: 'Rehberi başlat' });

    await act(async () => {
      startTutorialButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    const onboarding = tree.root.findByType('MockOnboarding' as any);

    await act(async () => {
      await onboarding.props.onComplete();
    });

    expect(mockSetHasCompletedOnboarding).toHaveBeenCalledWith(true);
    expect(logTutorialCompleted).toHaveBeenCalledTimes(1);
    tree.unmount();
  });

  it('allows first-time users to skip tutorial and continue', async () => {
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

    const skipTutorialButton = tree.root.findByProps({ accessibilityLabel: 'Rehberi atla' });

    await act(async () => {
      skipTutorialButton.props.onPress();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockSetHasCompletedOnboarding).toHaveBeenCalledWith(true);
    expect(logTutorialCompleted).not.toHaveBeenCalled();
    // "Atla" oyun içi ipucu turunu da kapatır; işaret, yeni koşuda turun kendini sıfırlamasını engeller
    const tutorialStateCalls = (AsyncStorage.setItem as jest.Mock).mock.calls.filter(
      ([key]) => key === '@yazgi/tutorial_v2'
    );
    expect(tutorialStateCalls.length).toBeGreaterThan(0);
    expect(JSON.parse(tutorialStateCalls[tutorialStateCalls.length - 1][1] as string)).toMatchObject({
      currentStep: 'COMPLETED',
      skippedByPlayer: true,
    });
    expect((AsyncStorage.setItem as jest.Mock).mock.calls).toEqual(
      expect.arrayContaining([
        ['@yazgi/onboarding_completed', 'true'],
      ])
    );

    tree.unmount();
  });

  it('shows the privacy choices card first, before the tutorial card', async () => {
    mockUseAppBootstrap.mockReturnValue(
      createBootstrapState({
        showSplash: false,
        hasCompletedOnboarding: false,
        privacyChoicesPending: true,
        completePrivacyChoices: jest.fn(),
      })
    );

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<AppShell />);
    });

    const card = tree.root.findByType('MockPrivacyChoicesCard' as any);
    expect(card.props.initialPersonalizedAds).toBe(false);
    expect(card.props.initialAnalytics).toBe(false);
    expect(tree.root.findAllByProps({ accessibilityLabel: 'Rehberi başlat' })).toHaveLength(0);
    expect(tree.root.findAllByType('MockAppNavigator' as any)).toHaveLength(0);
    expect(mockSettingsPanel).not.toHaveBeenCalled();
    tree.unmount();
  });

  it('saves both privacy choices through the existing setters', async () => {
    const setAnalyticsEnabled = jest.fn();
    const setPersonalizedAdsEnabled = jest.fn();
    const completePrivacyChoices = jest.fn();
    mockUseAppBootstrap.mockReturnValue(
      createBootstrapState({
        uiPrefs: {
          theme: 'light',
          density: 'standard',
          reduceMotion: false,
          // Eski oyuncu: analitiği açmış, reklam değeri eski hatadan "açık" kalmış.
          analyticsEnabled: true,
          personalizedAdsEnabled: true,
        },
        privacyChoicesPending: true,
        setAnalyticsEnabled,
        setPersonalizedAdsEnabled,
        completePrivacyChoices,
      })
    );

    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<AppShell />);
    });

    const card = tree.root.findByType('MockPrivacyChoicesCard' as any);
    expect(card.props.initialAnalytics).toBe(true);
    // Reklam anahtarı oyuncunun seçimi olmayan eski değerle önceden işaretlenmez.
    expect(card.props.initialPersonalizedAds).toBe(false);

    await act(async () => {
      card.props.onSubmit({ personalizedAds: true, analytics: false });
    });

    expect(setPersonalizedAdsEnabled).toHaveBeenCalledWith(true);
    expect(setAnalyticsEnabled).toHaveBeenCalledWith(false);
    expect(completePrivacyChoices).toHaveBeenCalledWith({ personalizedAds: true, analytics: false });
    tree.unmount();
  });

  it('does not show the privacy card once it was saved', () => {
    mockUseAppBootstrap.mockReturnValue(createBootstrapState({ privacyChoicesPending: false }));

    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<AppShell />);
    });

    expect(tree.root.findAllByType('MockPrivacyChoicesCard' as any)).toHaveLength(0);
    expect(mockNavigator).toHaveBeenCalledTimes(1);
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
