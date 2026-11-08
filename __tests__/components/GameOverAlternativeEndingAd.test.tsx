/**
 * Alternatif son ödüllü reklamı (Y-016): reklam yüklenirken oyuncu "Yeni Oyun"a bastıysa ya da oyun sonu
 * ekranı kapandıysa reklam açılmaz (shouldShow) ve sonradan gelen ödül uygulanmaz; "Yeni Oyun" kilitlenmez.
 */
import React from 'react';
import { act, fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { GameOverScreen } from '../../src/screens/GameOverScreen';
import { setRuntimeLocale, t as translateStatic } from '../../src/i18n/strings';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';
import { showContextualRewardedAd } from '../../src/services/monetization';
import { logRewardedAdResult } from '../../src/utils/analyticsEvents';

type PendingAd = {
  shouldShow?: () => boolean;
  resolve: (result: Record<string, unknown>) => void;
};
const mockPendingAds: PendingAd[] = [];

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../src/context/GameContext', () => ({
  useGame: jest.fn(),
}));

jest.mock('../../src/context/MetaProgressionContext', () => ({
  useMetaProgression: () => ({ metaProgression: null }),
}));

jest.mock('../../src/context/UIContext', () => ({
  useUI: () => ({
    t: (key: string, params?: Record<string, string | number | boolean>, fallback?: string) => (
      require('../../src/i18n/strings').t('tr', key, params, fallback)
    ),
  }),
}));

jest.mock('../../src/services/monetization', () => ({
  REWARDED_AD_CANCELLED_ERROR: 'cancelled',
  getRemainingRewardedAds: jest.fn(() => 5),
  showContextualRewardedAd: jest.fn((_placement: string, options?: { shouldShow?: () => boolean }) => (
    new Promise(resolve => {
      mockPendingAds.push({ shouldShow: options?.shouldShow, resolve });
    })
  )),
}));

jest.mock('../../src/services/notificationService', () => ({
  requestPermissions: jest.fn(async () => false),
  scheduleReengagement: jest.fn(async () => {}),
}));

jest.mock('../../src/utils/analyticsEvents', () => ({
  logRewardedAdRequested: jest.fn(async () => {}),
  logRewardedAdResult: jest.fn(async () => {}),
  logShareEvent: jest.fn(async () => {}),
}));

jest.mock('../../src/utils/metaProgression', () => ({
  ...jest.requireActual('../../src/utils/metaProgression'),
  incrementCommunityRuns: jest.fn(() => new Promise(() => {})),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(async () => false),
  shareAsync: jest.fn(async () => {}),
}));

jest.mock('../../src/components/RunCard', () => ({ RunCard: () => null }));
jest.mock('../../src/components/Avatar', () => ({ Avatar: () => null }));
jest.mock('../../src/components/EchoTrailList', () => ({ EchoTrailList: () => null }));

jest.mock('../../src/animations', () => {
  const ReactLib = require('react');
  const { View, Text, TouchableOpacity } = require('react-native');
  const Wrap = ({ children }: { children: React.ReactNode }) => ReactLib.createElement(View, null, children);
  return {
    FadeInDownView: Wrap,
    FadeInUpView: Wrap,
    FadeInLeftView: Wrap,
    FadeInRightView: Wrap,
    StaggeredFadeIn: Wrap,
    ShimmerButton: ({ children, onPress, disabled }: { children: React.ReactNode; onPress?: () => void; disabled?: boolean }) => (
      ReactLib.createElement(TouchableOpacity, { onPress, disabled }, children)
    ),
    CountUpText: ({ value }: { value: number }) => ReactLib.createElement(Text, null, String(value)),
    buttonPress: jest.fn(),
    successHaptic: jest.fn(),
  };
});

const { useGame } = jest.requireMock('../../src/context/GameContext') as { useGame: jest.Mock };
const mockedShowAd = showContextualRewardedAd as jest.Mock;
const mockedLogResult = logRewardedAdResult as jest.Mock;
const alertSpy = Alert.alert as jest.Mock;

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
const metrics = { pad: 12, font: 14 };

const tr = (key: string) => translateStatic('tr', key);

const renderGameOver = (onRestart = jest.fn()) => {
  const view = render(<GameOverScreen theme={theme as any} metrics={metrics as any} onRestart={onRestart} />);
  fireEvent.press(view.getByText('Hikaye'));
  return { ...view, onRestart };
};

const requestAlternativeEnding = (view: ReturnType<typeof renderGameOver>) => {
  fireEvent.press(view.getByText(tr('buttons.watchAdAlternativeEnding')));
  expect(mockedShowAd).toHaveBeenCalledWith('ending_alternative', expect.objectContaining({
    shouldShow: expect.any(Function),
  }));
  return mockPendingAds[mockPendingAds.length - 1];
};

const unlockedTitle = /Alternatif Son/;

describe('GameOverScreen: alternatif son reklamı', () => {
  beforeEach(() => {
    setRuntimeLocale('tr');
    mockPendingAds.length = 0;
    const gameState = getInitialGameState();
    gameState.phase = 'GAME_OVER';
    gameState.age = 18;
    useGame.mockReturnValue({ gameState, playerName: 'Deniz', stats: getInitialStats() });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('oyuncu ekranda kalırsa reklam açılabilir ve ödül alternatif sonu açar', async () => {
    const view = renderGameOver();
    const ad = requestAlternativeEnding(view);

    expect(ad.shouldShow?.()).toBe(true);
    await act(async () => {
      ad.resolve({ success: true, placement: 'ending_alternative', rewardType: 'utility', amount: 0 });
    });

    expect(view.getByText(unlockedTitle)).toBeTruthy();
    expect(mockedLogResult).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('reklam yüklenirken "Yeni Oyun"a basılırsa reklam açılmaz ve sonradan gelen ödül uygulanmaz', async () => {
    const view = renderGameOver();
    const ad = requestAlternativeEnding(view);

    // "Yeni Oyun" kilitli değil: reklam takılsa da oyuncu çıkabilir
    fireEvent.press(view.getByText(tr('buttons.newGame')));
    expect(view.onRestart).toHaveBeenCalledTimes(1);
    expect(ad.shouldShow?.()).toBe(false);

    await act(async () => {
      ad.resolve({ success: true, placement: 'ending_alternative', rewardType: 'utility', amount: 0 });
    });

    expect(view.queryByText(unlockedTitle)).toBeNull();
    expect(alertSpy).not.toHaveBeenCalled();
    expect(mockedLogResult).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    expect(mockedLogResult).not.toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('ekran kapanınca reklam açılmaz; geç gelen sonuç hata penceresi açmaz', async () => {
    const view = renderGameOver();
    const ad = requestAlternativeEnding(view);

    view.unmount();
    expect(ad.shouldShow?.()).toBe(false);

    await act(async () => {
      ad.resolve({ success: false, placement: 'ending_alternative', rewardType: 'utility', amount: 0, error: 'cancelled' });
    });

    expect(alertSpy).not.toHaveBeenCalled();
  });

  it('reklam iptal olursa (uygulama arka plandaydı) hata penceresi açılmaz, düğme yeniden kullanılabilir', async () => {
    const view = renderGameOver();
    const ad = requestAlternativeEnding(view);

    await act(async () => {
      ad.resolve({ success: false, placement: 'ending_alternative', rewardType: 'utility', amount: 0, error: 'cancelled' });
    });

    expect(alertSpy).not.toHaveBeenCalled();
    expect(view.getByText(tr('buttons.watchAdAlternativeEnding'))).toBeTruthy();
  });
  it('gerçek reklam hatasında ham İngilizce SDK metni değil Türkçe mesaj gösterilir', async () => {
    const view = renderGameOver();
    const ad = requestAlternativeEnding(view);

    await act(async () => {
      ad.resolve({ success: false, placement: 'ending_alternative', rewardType: 'utility', amount: 0, error: 'Rewarded ad failed to load: no-fill' });
    });

    expect(alertSpy).toHaveBeenCalledTimes(1);
    expect(alertSpy).toHaveBeenCalledWith(tr('messages.adNotShown'), tr('messages.adErrorGeneric'));
    expect(JSON.stringify(alertSpy.mock.calls)).not.toContain('no-fill');
  });
});
