import { calculateVarietyBonus } from '../../src/utils/gameUtils';

const buildHistory = (actionIds: string[]) => (
  actionIds.map((actionId) => ({ actionId }))
);

describe('calculateVarietyBonus', () => {
  it('returns 0 when feature is disabled', () => {
    const history = buildHistory([
      'study_math',
      'sports_run',
      'arts_draw',
      'work_cafe',
      'computer_code',
    ]);

    expect(calculateVarietyBonus(history, 5, false)).toBe(0);
  });

  it('returns 0 when there are not enough actions in the window', () => {
    const history = buildHistory([
      'study_math',
      'sports_run',
      'arts_draw',
      'work_cafe',
    ]);

    expect(calculateVarietyBonus(history, 5, true)).toBe(0);
  });

  it('returns bonus when last 5 actions include at least 3 categories', () => {
    const history = buildHistory([
      'study_math',
      'sports_run',
      'arts_draw',
      'study_science',
      'computer_code',
    ]);

    expect(calculateVarietyBonus(history, 5, true)).toBe(3);
  });

  it('returns 0 when variety threshold is not reached', () => {
    const history = buildHistory([
      'study_math',
      'study_science',
      'study_language',
      'study_homework',
      'sports_run',
    ]);

    expect(calculateVarietyBonus(history, 5, true)).toBe(0);
  });

  it('uses only the latest window for calculation', () => {
    const history = buildHistory([
      'study_math',
      'sports_run',
      'arts_draw',
      'work_cafe',
      'computer_code',
      'study_science',
      'study_turkish',
      'study_homework',
      'sports_swim',
      'study_book',
    ]);

    expect(calculateVarietyBonus(history, 5, true)).toBe(0);
  });
});
