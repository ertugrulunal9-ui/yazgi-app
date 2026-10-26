import { act, renderHook } from '@testing-library/react-native';
import { useModalOrchestration } from '../../src/hooks/useModalOrchestration';

jest.mock('../../src/animations', () => ({
  buttonPress: jest.fn(),
  gradeBad: jest.fn(),
  gradeGood: jest.fn(),
  selectionHaptic: jest.fn(),
  turnAdvance: jest.fn(),
}));

const renderOrchestration = (hasSpendableEnergy: boolean) => {
  const advanceTurn = jest.fn();
  const hook = renderHook(() => useModalOrchestration({
    pendingReportCard: false,
    schoolGrades: {} as never,
    actionHistory: [],
    hasSpendableEnergy,
    advanceTurn,
    t: (_key, _params, fallback) => fallback ?? '',
  }));
  return { ...hook, advanceTurn };
};

describe('useModalOrchestration end-of-day prompt', () => {
  it('ends the day straight away when there is no energy left to spend', () => {
    const { result, advanceTurn } = renderOrchestration(false);

    act(() => result.current.handleEndDay());

    expect(result.current.daySummaryVisible).toBe(false);
    expect(advanceTurn).toHaveBeenCalledTimes(1);
  });

  it('asks first when the player would leave usable energy behind', () => {
    const { result, advanceTurn } = renderOrchestration(true);

    act(() => result.current.handleEndDay());

    expect(result.current.daySummaryVisible).toBe(true);
    expect(advanceTurn).not.toHaveBeenCalled();
  });

  it('lets the player go back without ending the day', () => {
    const { result, advanceTurn } = renderOrchestration(true);

    act(() => result.current.handleEndDay());
    act(() => result.current.handleDaySummaryCancel());

    expect(result.current.daySummaryVisible).toBe(false);
    expect(advanceTurn).not.toHaveBeenCalled();
  });

  it('ends the day when the player confirms', () => {
    const { result, advanceTurn } = renderOrchestration(true);

    act(() => result.current.handleEndDay());
    act(() => result.current.handleDaySummaryContinue());

    expect(result.current.daySummaryVisible).toBe(false);
    expect(advanceTurn).toHaveBeenCalledTimes(1);
  });
});
