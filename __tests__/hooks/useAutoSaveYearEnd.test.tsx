// @ts-nocheck
// Yıl sonu penceresi kapanınca "gösterildi" bilgisi hemen kaydedilmeli; aksi hâlde uygulama ön planda
// kapanırsa (çökme, sistemin uygulamayı kapatması) pencere açılışta yeniden geliyordu (MEmu, Y-025 H1).
import { renderHook } from '@testing-library/react-native';
import { act } from 'react';
import { useAutoSave } from '../../src/hooks/useAutoSave';
import { saveGame } from '../../src/utils/gameUtils';

jest.mock('../../src/utils/gameUtils', () => ({ saveGame: jest.fn(async () => {}) }));
jest.mock('../../src/save/SaveManager', () => ({
  __esModule: true,
  default: { registerAutoSaveCallback: jest.fn(), unregisterAutoSaveCallback: jest.fn() },
}));

const mockedSave = saveGame as jest.Mock;

const baseState = { turn: 8, age: 4, yearEndWindowsShown: { milestoneAges: [], chapterIds: [] } };

const setup = () => {
  const gameStateRef = { current: { ...baseState } };
  const config = (yearEndWindowsShown) => ({
    gameStateRef,
    statsRef: { current: { health: 50 } },
    playerNameRef: { current: 'Ali' },
    isLoadingRef: { current: false },
    hasLoadedOnceRef: { current: true },
    turn: 8,
    age: 4,
    playerName: 'Ali',
    isLoading: false,
    yearEndWindowsShown,
    prepareState: (state) => state,
  });
  const hook = renderHook((props) => useAutoSave(config(props.shown)), {
    initialProps: { shown: baseState.yearEndWindowsShown },
  });
  return { hook, gameStateRef };
};

const flushSave = async () => {
  await act(async () => {
    jest.advanceTimersByTime(500);
    await Promise.resolve();
  });
};

describe('useAutoSave: yıl sonu penceresi kapanınca kayıt', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockedSave.mockClear();
  });
  afterEach(() => jest.useRealTimers());

  it('pencere "gösterildi" olarak işaretlenince tur değişmeden kaydeder', async () => {
    const { hook, gameStateRef } = setup();
    await flushSave();
    mockedSave.mockClear();

    const shown = { milestoneAges: [3], chapterIds: [1] };
    gameStateRef.current = { ...gameStateRef.current, yearEndWindowsShown: shown };
    hook.rerender({ shown });
    await flushSave();

    expect(mockedSave).toHaveBeenCalledTimes(1);
    expect(mockedSave.mock.calls[0][0].gameState.yearEndWindowsShown).toEqual(shown);
  });

  it('aynı değerle yeniden çizim kayıt tetiklemez', async () => {
    const { hook } = setup();
    await flushSave();
    mockedSave.mockClear();

    hook.rerender({ shown: baseState.yearEndWindowsShown });
    await flushSave();

    expect(mockedSave).not.toHaveBeenCalled();
  });
});
