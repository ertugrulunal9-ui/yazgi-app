// @ts-nocheck
// Y-030 regresyon: Sınav Dönemi/karne kapanınca (tur aynı, yeni olay geldi) hazırlık reklamı açılmaz ve sınav açılmaz.
import { act, renderHook } from '@testing-library/react-native';

const mockGame = { gameState: { turn: 50, phase: 'EVENT', isExamPeriod: true, pendingReportCard: false } };
const mockOpenExam = jest.fn();
const mockAlert = jest.fn();

jest.mock('react-native', () => {
  const base = require('../../__tests__/mocks/ReactNative.mock');
  const rn = base.default || base;
  return { ...rn, Alert: { alert: (...a) => mockAlert(...a) } };
});
jest.mock('../../src/context/GameContext', () => ({
  useGame: () => ({ gameState: mockGame.gameState }),
}));
jest.mock('../../src/hooks/useExamHandler', () => ({
  useExamHandler: () => ({
    examGameVisible: false, currentExamType: null, examDifficulty: 'EASY',
    openExamGame: mockOpenExam, handleExamComplete: jest.fn(), handleExamCancel: jest.fn(),
  }),
}));

const { useExamFlow } = require('../../src/hooks/useExamFlow');

it('sınav dönemi kapandı + yeni olay (aynı tur) -> shouldShow false, sınav açılmaz', async () => {
  let release; const gate = new Promise(r => { release = r; });
  let captured;
  const hook = renderHook(() => useExamFlow({
    age: 10, intelligence: 50, schoolGrades: {}, skills: {}, traitIds: [],
    markExamTaken: jest.fn(), updateGameState: jest.fn(), updateStats: jest.fn(),
    completeExamPeriod: jest.fn(), selectNewEvent: jest.fn(), enqueueToast: jest.fn(),
    t: k => k, examPrepBoostApplied: 0, clearExamPrepBoost: jest.fn(),
    claimExamPrepBoostAd: jest.fn(async (o) => { captured = o; await gate; return 15; }),
  }));
  act(() => { hook.result.current.handleExamPeriodExam('MATH'); });
  const watchAd = mockAlert.mock.calls[0][2].find(b => b.text === 'buttons.watchAd');
  await act(async () => {
    watchAd.onPress();
    // Oyuncu reklam yuklenirken "Sinavlara girmeden karneyi gor" + karne "Tamam" -> selectNewEvent (tur ayni)
    mockGame.gameState = { turn: 50, phase: 'EVENT', isExamPeriod: false, pendingReportCard: false };
    hook.rerender({});
  });
  expect(captured.shouldShow()).toBe(false);
  await act(async () => { release(); await gate; await Promise.resolve(); });
  expect(mockOpenExam).not.toHaveBeenCalled();
});

it('reklam arka planda iptal olursa (SKIPPED) sınav açılmaz', async () => {
  mockOpenExam.mockClear(); mockAlert.mockClear();
  mockGame.gameState = { turn: 50, phase: 'HUB', isExamPeriod: true, pendingReportCard: false };
  const hook = renderHook(() => useExamFlow({
    age: 10, intelligence: 50, schoolGrades: {}, skills: {}, traitIds: [],
    markExamTaken: jest.fn(), updateGameState: jest.fn(), updateStats: jest.fn(),
    completeExamPeriod: jest.fn(), selectNewEvent: jest.fn(), enqueueToast: jest.fn(),
    t: k => k, examPrepBoostApplied: 0, clearExamPrepBoost: jest.fn(),
    claimExamPrepBoostAd: jest.fn(async () => -1),
  }));
  act(() => { hook.result.current.handleExamPeriodExam('MATH'); });
  const watchAd = mockAlert.mock.calls[0][2].find(b => b.text === 'buttons.watchAd');
  await act(async () => { watchAd.onPress(); await Promise.resolve(); });
  expect(mockOpenExam).not.toHaveBeenCalled();
});

it('bileşen sökülünce shouldShow false, sınav açılmaz', async () => {
  mockOpenExam.mockClear(); mockAlert.mockClear();
  mockGame.gameState = { turn: 50, phase: 'HUB', isExamPeriod: true, pendingReportCard: false };
  let captured; let release; const gate = new Promise(r => { release = r; });
  const hook = renderHook(() => useExamFlow({
    age: 10, intelligence: 50, schoolGrades: {}, skills: {}, traitIds: [],
    markExamTaken: jest.fn(), updateGameState: jest.fn(), updateStats: jest.fn(),
    completeExamPeriod: jest.fn(), selectNewEvent: jest.fn(), enqueueToast: jest.fn(),
    t: k => k, examPrepBoostApplied: 0, clearExamPrepBoost: jest.fn(),
    claimExamPrepBoostAd: jest.fn(async (o) => { captured = o; await gate; return 0; }),
  }));
  act(() => { hook.result.current.handleExamPeriodExam('MATH'); });
  const watchAd = mockAlert.mock.calls[0][2].find(b => b.text === 'buttons.watchAd');
  await act(async () => { watchAd.onPress(); });
  hook.unmount();
  expect(captured.shouldShow()).toBe(false);
  await act(async () => { release(); await gate; await Promise.resolve(); });
  expect(mockOpenExam).not.toHaveBeenCalled();
});
