import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { MainMenuScreen } from '../../src/screens/MainMenuScreen';
import { GameScreen } from '../../src/screens/GameScreen';
import { ReportCardScreen } from '../../src/screens/ReportCardScreen';
import { SaveSlotPicker } from '../../src/components/SaveSlotPicker';
import { setRuntimeLocale, t as translateStatic } from '../../src/i18n/strings';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';
import { useGame } from '../../src/context/GameContext';
import { useUI } from '../../src/context/UIContext';
import { useStats } from '../../src/hooks/useStats';
import { useMetaProgression } from '../../src/context/MetaProgressionContext';
import { useLegacyBonuses, useFloatingTexts, useGameActions } from '../../src/hooks/useGameSelectors';
import { useEvents } from '../../src/hooks/useEvents';
import { useNPCs } from '../../src/hooks/useNPCs';
import { useExamHandler } from '../../src/hooks/useExamHandler';
import { useAchievements } from '../../src/hooks/useAchievements';
import SaveManager from '../../src/save/SaveManager';

jest.mock('react-native', () => {
  const baseModule = require('../mocks/ReactNative.mock');
  const base = baseModule.default || baseModule;
  return {
    ...base,
    ActivityIndicator: 'ActivityIndicator',
    BackHandler: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    },
  };
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../src/context/GameContext', () => ({
  useGame: jest.fn(),
}));

jest.mock('../../src/context/UIContext', () => ({
  useUI: jest.fn(),
}));

jest.mock('../../src/context/MetaProgressionContext', () => ({
  useMetaProgression: jest.fn(),
}));

jest.mock('../../src/hooks/useStats', () => ({
  useStats: jest.fn(),
}));

jest.mock('../../src/hooks/useEvents', () => ({
  useEvents: jest.fn(),
}));

jest.mock('../../src/hooks/useNPCs', () => ({
  useNPCs: jest.fn(),
}));

jest.mock('../../src/hooks/useExamHandler', () => ({
  useExamHandler: jest.fn(),
}));

jest.mock('../../src/hooks/useAchievements', () => ({
  useAchievements: jest.fn(),
}));

jest.mock('../../src/hooks/useGameSelectors', () => ({
  useLegacyBonuses: jest.fn(),
  useFloatingTexts: jest.fn(),
  useGameActions: jest.fn(),
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

jest.mock('../../src/components/StatusHeader', () => ({
  StatusHeader: () => null,
}));

jest.mock('../../src/components/ActionGrid', () => ({
  ActionGrid: () => null,
}));

jest.mock('../../src/components/ActionBottomSheet', () => ({
  ActionBottomSheet: () => null,
}));

jest.mock('../../src/components/TabBar', () => ({
  TabBar: () => null,
}));

jest.mock('../../src/components/FloatingText', () => ({
  FloatingText: () => null,
}));

jest.mock('../../src/components/SkillTree', () => ({
  SkillTree: () => null,
}));

jest.mock('../../src/components/SocialScreen', () => ({
  SocialScreen: () => null,
}));

jest.mock('../../src/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../src/screens/CharacterScreen', () => ({
  CharacterScreen: () => null,
}));

jest.mock('../../src/components/AchievementList', () => ({
  AchievementList: () => null,
}));

jest.mock('../../src/components/AchievementToast', () => ({
  AchievementToast: () => null,
}));

jest.mock('../../src/components/ReportCard', () => () => null);

jest.mock('../../src/components/ExamPeriodModal', () => ({
  ExamPeriodModal: () => null,
}));

jest.mock('../../src/components/DaySummaryModal', () => ({
  DaySummaryModal: () => null,
}));

jest.mock('../../src/components/TraitProgressChip', () => ({
  TraitProgressChip: () => null,
}));

jest.mock('../../src/components/exams', () => ({
  MiniGameContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  MathExamGame: () => null,
  TurkishExamGame: () => null,
  ScienceExamGame: () => null,
  HistoryExamGame: () => null,
  GeographyExamGame: () => null,
  EnglishExamGame: () => null,
  ArtExamGame: () => null,
  MusicExamGame: () => null,
}));

jest.mock('../../src/components/ui', () => {
  const ReactLib = require('react');
  const { View } = require('react-native');

  const TabContent = ({ activeTab, children }: { activeTab: string; children: React.ReactNode }) => {
    const childArray = ReactLib.Children.toArray(children);
    const activeScreen = childArray.find((child: any) => child?.props?.name === activeTab) ?? childArray[0];
    return ReactLib.createElement(View, null, (activeScreen as any)?.props?.children ?? null);
  };

  TabContent.Screen = ({ children }: { children: React.ReactNode }) => (
    ReactLib.createElement(View, null, children)
  );

  return { TabContent };
});

jest.mock('../../src/animations/ToastAnimations', () => ({
  MessageToast: () => null,
  Toast: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../src/animations', () => {
  const ReactLib = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');

  return {
    FadeInDownView: ({ children }: { children: React.ReactNode }) => ReactLib.createElement(View, null, children),
    FadeInUpView: ({ children }: { children: React.ReactNode }) => ReactLib.createElement(View, null, children),
    ShimmerButton: ({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) => (
      ReactLib.createElement(TouchableOpacity, { onPress }, children)
    ),
    CountUpText: ({ value }: { value: number }) => ReactLib.createElement(Text, null, String(value)),
    achievementUnlock: jest.fn(),
    buttonPress: jest.fn(),
    successHaptic: jest.fn(),
    gradeBad: jest.fn(),
    gradeGood: jest.fn(),
    healthCritical: jest.fn(),
    levelUp: jest.fn(),
    moneyGain: jest.fn(),
    moneyLoss: jest.fn(),
    selectionHaptic: jest.fn(),
    turnAdvance: jest.fn(),
  };
});

jest.mock('../../src/services/monetization', () => ({
  getRemainingRewardedAds: jest.fn(() => 0),
  showContextualRewardedAd: jest.fn(async () => ({ success: false, error: 'not_available' })),
  showInterstitialAdDetailed: jest.fn(async () => ({ shown: false, reason: 'disabled' })),
}));

jest.mock('../../src/utils/analyticsEvents', () => ({
  logAchievementUnlocked: jest.fn(async () => {}),
  logHubAction: jest.fn(async () => {}),
  logInterstitialOpportunity: jest.fn(async () => {}),
  logInterstitialResult: jest.fn(async () => {}),
  logRewardedAdRequested: jest.fn(async () => {}),
  logRewardedAdResult: jest.fn(async () => {}),
  logTraitChanges: jest.fn(async () => {}),
  logTraitFormed: jest.fn(async () => {}),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => false),
}));

jest.mock('../../src/commands/ActionCommand', () => ({
  HubActionCommand: class {
    execute() {
      return {
        status: 'blocked',
        feedbackMessage: 'blocked',
        errorType: 'NOT_ENOUGH_ENERGY',
        traitProgressUpdates: [],
        newTraits: [],
        traitChanges: [],
        adjustedEnergyCost: 0,
        totalSkillGain: 0,
        gameStateUpdates: {},
      };
    }
  },
}));

jest.mock('../../src/data/actions', () => ({
  getLocalizedActionCategories: jest.fn(() => []),
  filterActionCategoriesForContext: jest.fn((categories: unknown[]) => categories),
}));

jest.mock('../../src/components/SaveSlotCard', () => ({
  SaveSlotCard: ({ metadata }: { metadata: { slotId: string } }) => <>{metadata.slotId}</>,
}));

jest.mock('../../src/components/SaveExportModal', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../src/save/SaveManager', () => ({
  __esModule: true,
  default: {
    getAllSlotMetadata: jest.fn(async () => ([
      {
        slotId: 'slot_1',
        characterName: 'Alex',
        age: 12,
        playtime: 1234,
        lastPlayed: Date.now(),
        version: 1,
        checksum: 'checksum',
        status: 'active',
        isPremium: false,
      },
    ])),
    getAvailableSlots: jest.fn(() => 6),
    saveToSlot: jest.fn(async () => true),
    loadFromSlot: jest.fn(async () => null),
    deleteSlot: jest.fn(async () => {}),
  },
}));

const mockedUseGame = useGame as jest.MockedFunction<typeof useGame>;
const mockedUseUI = useUI as jest.MockedFunction<typeof useUI>;
const mockedUseStats = useStats as jest.MockedFunction<typeof useStats>;
const mockedUseMetaProgression = useMetaProgression as jest.MockedFunction<typeof useMetaProgression>;
const mockedUseLegacyBonuses = useLegacyBonuses as jest.MockedFunction<typeof useLegacyBonuses>;
const mockedUseFloatingTexts = useFloatingTexts as jest.MockedFunction<typeof useFloatingTexts>;
const mockedUseGameActions = useGameActions as jest.MockedFunction<typeof useGameActions>;
const mockedUseEvents = useEvents as jest.MockedFunction<typeof useEvents>;
const mockedUseNPCs = useNPCs as jest.MockedFunction<typeof useNPCs>;
const mockedUseExamHandler = useExamHandler as jest.MockedFunction<typeof useExamHandler>;
const mockedUseAchievements = useAchievements as jest.MockedFunction<typeof useAchievements>;

const theme = {
  appBg: '#020617',
  surfaceBase: '#0f172a',
  surfaceRaised: '#1e293b',
  surfaceOverlay: '#334155',
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  border: '#334155',
  accentEvent: '#22c55e',
  accentBrand: '#38bdf8',
  accentGrade: '#f59e0b',
};

const metrics = {
  pad: 12,
  font: 14,
};

describe('Phase 7 screen smoke', () => {
  beforeEach(() => {
    setRuntimeLocale('en');

    const initialGameState = getInitialGameState();
    initialGameState.phase = 'SETUP';
    initialGameState.age = 12;
    initialGameState.pendingReportCard = false;
    initialGameState.isExamPeriod = false;
    initialGameState.examsTakenThisYear = [];
    const initialStats = getInitialStats();

    mockedUseGame.mockReturnValue({
      gameState: initialGameState,
      stats: initialStats,
      playerName: 'Alex',
      startNewGame: jest.fn(),
      updateGameState: jest.fn(),
      setStats: jest.fn(),
      setGameState: jest.fn(),
      updateStats: jest.fn(),
      resetGame: jest.fn(),
      loadSavedGame: jest.fn(async () => true),
      setPlayerName: jest.fn(),
      isLoading: false,
      metaProgression: {} as any,
      refreshMetaProgression: jest.fn(async () => {}),
      advanceTurnInContext: jest.fn(),
    });

    mockedUseUI.mockReturnValue({
      theme: theme as any,
      metrics: metrics as any,
      locale: 'en',
      setLocale: jest.fn(),
      t: (key, params, fallback) => translateStatic('en', key, params, fallback),
      uiPrefs: { locale: 'en', fontScale: 1, reduceMotion: false, density: 'comfortable' } as any,
      floatingTexts: [],
      showFloatingText: jest.fn(),
      removeFloatingText: jest.fn(),
      clearFloatingTexts: jest.fn(),
    });

    mockedUseMetaProgression.mockReturnValue({
      metaProgression: null as any,
      metaProgressionLoaded: true,
      refreshMetaProgression: jest.fn(async () => {}),
      updateMetaProgression: jest.fn(),
    });

    mockedUseStats.mockReturnValue({ stats: initialStats } as any);
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
    mockedUseFloatingTexts.mockReturnValue({
      floatingTexts: [],
      removeFloatingText: jest.fn(),
    } as any);
    mockedUseGameActions.mockReturnValue({
      updateGameState: jest.fn(),
      updateStats: jest.fn(),
      setStats: jest.fn(),
    } as any);
    mockedUseEvents.mockReturnValue({
      advanceTurn: jest.fn(),
      markExamTaken: jest.fn(),
      completeExamPeriod: jest.fn(),
      selectNewEvent: jest.fn(),
    } as any);
    mockedUseNPCs.mockReturnValue({
      interactWithNPC: jest.fn(() => ({ success: false, cost: { energy: 0, money: 0 } })),
      meetNewNPC: jest.fn(() => ({ success: false })),
    } as any);
    mockedUseExamHandler.mockReturnValue({
      examGameVisible: false,
      currentExamType: null,
      examDifficulty: 'MEDIUM',
      openExamGame: jest.fn(),
      handleExamComplete: jest.fn(),
      handleExamCancel: jest.fn(),
    } as any);
    mockedUseAchievements.mockReturnValue({
      unlockedAchievements: [],
      stats: { unlocked: 0, total: 0, percentage: 0 },
      checkAchievements: jest.fn(async () => {}),
      getProgress: jest.fn(() => 0),
      applyRewardsToStats: jest.fn((stats) => stats),
      loading: false,
    } as any);
  });

  afterEach(() => {
    setRuntimeLocale('tr');
    jest.clearAllMocks();
  });

  it('renders MainMenuScreen in EN locale', () => {
    const { getByText } = render(
      <MainMenuScreen
        theme={theme as any}
        metrics={metrics as any}
        locale="en"
        onGameStart={jest.fn()}
        startNewGame={jest.fn()}
        metaProgression={null}
        metaProgressionLoaded
        updateMetaProgression={jest.fn()}
      />
    );

    expect(getByText('Start Life')).toBeTruthy();
  });

  it('renders GameScreen shell in EN locale', () => {
    const { getByText } = render(
      <GameScreen
        onPhaseChange={jest.fn()}
        currentTab="hub"
      />
    );

    expect(getByText('End Day')).toBeTruthy();
  });

  it('renders ReportCardScreen labels in EN locale', () => {
    const { getByText } = render(
      <ReportCardScreen
        theme={theme as any}
        metrics={metrics as any}
        onClose={jest.fn()}
      />
    );

    expect(getByText(/Year-End Report Card/)).toBeTruthy();
    expect(getByText('Mathematics')).toBeTruthy();
  });

  it('renders SaveSlotPicker labels in EN locale', async () => {
    const { getByText } = render(
      <SaveSlotPicker
        isOpen
        onClose={jest.fn()}
        currentPlayerName="Alex"
        currentStats={getInitialStats()}
        currentGameState={getInitialGameState()}
        onLoadSlot={jest.fn()}
        currentSlotId="slot_1"
        theme={{
          appBg: theme.appBg,
          surfaceBase: theme.surfaceBase,
          surfaceRaised: theme.surfaceRaised,
          textPrimary: theme.textPrimary,
          textSecondary: theme.textSecondary,
          border: theme.border,
          accentEvent: theme.accentEvent,
        }}
      />
    );

    await waitFor(() => {
      expect(getByText('Save Slots')).toBeTruthy();
      expect(getByText('Refresh')).toBeTruthy();
    });
  });

  it('handles long EN save title strings without render failure', async () => {
    const raw = require('../../src/i18n/strings');
    const i18nMod = raw.default ?? raw;
    const original = i18nMod.strings.en.save.slotsTitle;

    i18nMod.strings.en.save.slotsTitle =
      'Save Slots for Long Localization Smoke Validation Scenario';

    try {
      const { getByText } = render(
        <SaveSlotPicker
          isOpen
          onClose={jest.fn()}
          currentPlayerName="Alex"
          currentStats={getInitialStats()}
          currentGameState={getInitialGameState()}
          onLoadSlot={jest.fn()}
          currentSlotId="slot_1"
          theme={{
            appBg: theme.appBg,
            surfaceBase: theme.surfaceBase,
            surfaceRaised: theme.surfaceRaised,
            textPrimary: theme.textPrimary,
            textSecondary: theme.textSecondary,
            border: theme.border,
            accentEvent: theme.accentEvent,
          }}
        />
      );

      await waitFor(() => {
        expect(getByText('Save Slots for Long Localization Smoke Validation Scenario')).toBeTruthy();
      });
    } finally {
      i18nMod.strings.en.save.slotsTitle = original;
    }
  });
});
