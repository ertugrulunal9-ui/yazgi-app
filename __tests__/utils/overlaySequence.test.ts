import { resolveOverlayStage } from '../../src/utils/overlaySequence';

describe('resolveOverlayStage', () => {
  it('puts the year-end window first, then the exam period, then the event card', () => {
    expect(resolveOverlayStage({ yearEndPending: true, examPeriodActive: true, eventActive: true })).toBe('YEAR_END');
    expect(resolveOverlayStage({ yearEndPending: false, examPeriodActive: true, eventActive: true })).toBe('EXAM_PERIOD');
    expect(resolveOverlayStage({ yearEndPending: false, examPeriodActive: false, eventActive: true })).toBe('EVENT');
  });

  it('keeps the exam period alone even without an event (hub)', () => {
    expect(resolveOverlayStage({ yearEndPending: false, examPeriodActive: true, eventActive: false })).toBe('EXAM_PERIOD');
  });

  it('shows nothing when no window or event is active', () => {
    expect(resolveOverlayStage({ yearEndPending: false, examPeriodActive: false, eventActive: false })).toBe('NONE');
  });

  it('leaves a plain year-end window without exam or event unchanged', () => {
    expect(resolveOverlayStage({ yearEndPending: true, examPeriodActive: false, eventActive: false })).toBe('YEAR_END');
  });
});
