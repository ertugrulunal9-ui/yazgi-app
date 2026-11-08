// @ts-nocheck
// Sınav hazırlığı reklamı yüklenirken oyuncu ilerlerse sınav sonradan açılmaz; gerçek reklam hatasında açılır.
import { act, renderHook } from '@testing-library/react-native';

const mockGame = { gameState: { turn: 5 } };
const mockOpenExam = jest.fn();
const mockAlert = jest.fn();

jest.mock('react-native', () => {
  const base = require('../mocks/ReactNative.mock');
  const rn = base.default || base;
  return { ...rn, Alert: { alert: (...a) => mockAlert(...a) } };
});
jest.mock('../../src/context/GameContext', () => ({
  useGame: () => ({ gameState: mockGame.gameState }),
}));
jest.mock('../../src/hooks/useExamHandler', () => ({
  useExamHandler: () => ({
    examGameVisible: false,
    currentExamType: null,
    examDifficulty: 'EASY',
    openExamGame: mockOpenExam,
    handleExamComplete: jest.fn(),
    handleExamCancel: jest.fn(),
  }),
}));

const { useExamFlow } = require('../../src/hooks/useExamFlow');

const run = async (claimImpl, moveOn) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  const hook = renderHook(() => useExamFlow({
    age: 15, intelligence: 50, schoolGrades: {}, skills: {}, traitIds: [],
    markExamTaken: jest.fn(), updateGameState: jest.fn(), updateStats: jest.fn(),
    completeExamPeriod: jest.fn(), selectNewEvent: jest.fn(), enqueueToast: jest.fn(),
    t: k => k, examPrepBoostApplied: 0, clearExamPrepBoost: jest.fn(),
    claimExamPrepBoostAd: jest.fn(async options => { await gate; return claimImpl(options); }),
  }));
  act(() => { hook.result.current.promptExamPrepAndStartExam('MATH'); });
  const buttons = mockAlert.mock.calls[0][2];
  const watchAd = buttons.find(b => b.text === 'buttons.watchAd');
  await act(async () => {
    watchAd.onPress();
    if (moveOn) {
      mockGame.gameState = { turn: 6 };
      hook.rerender({});
    }
  });
  await act(async () => {
    release();
    await gate;
    await Promise.resolve();
  });
};

describe('useExamFlow: hazırlık reklamı ve sınav açılışı', () => {
  beforeEach(() => {
    mockOpenExam.mockClear();
    mockAlert.mockClear();
    mockGame.gameState = { turn: 5 };
  });

  it('oyuncu tur ilerlettiyse sınav açılmaz ve shouldShow false döner', async () => {
    let captured;
    await run(async options => { captured = options; return 0; }, true);
    expect(captured.shouldShow()).toBe(false);
    expect(mockOpenExam).not.toHaveBeenCalled();
  });

  it('aynı yerde reklam hatası olsa da sınav açılır', async () => {
    await run(async () => 0, false);
    expect(mockOpenExam).toHaveBeenCalledWith('MATH');
  });
});
