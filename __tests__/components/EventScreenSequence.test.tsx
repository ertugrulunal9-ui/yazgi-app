import React from 'react';
import { render } from '@testing-library/react-native';
import { EventScreen } from '../../src/screens/EventScreen';
import { useEventScreenController } from '../../src/hooks/useEventScreenController';
import type { AgeMilestoneSummary } from '../../src/types/game';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('../../src/context/UIContext', () => ({
  useUI: () => ({
    theme: { appBg: '#000' },
    metrics: { pad: 8 },
    t: (_key: string, _params?: unknown, fallback?: string) => fallback ?? '',
  }),
}));

jest.mock('../../src/hooks/useEventScreenController', () => ({
  useEventScreenController: jest.fn(),
}));

jest.mock('../../src/services/monetization', () => ({ isPremium: () => false }));
jest.mock('../../src/components/SwipeChoiceDeck', () => ({ SwipeChoiceDeck: () => null }));
jest.mock('../../src/components/EventNarrative', () => ({ EventNarrative: () => null }));
jest.mock('../../src/components/FeedbackOverlay', () => ({ FeedbackOverlay: () => null }));
jest.mock('../../src/components/FateIndicator', () => ({ FateIndicator: () => null }));
jest.mock('../../src/components/EventPlayerBar', () => ({
  EventPlayerBar: () => require('react').createElement('Text', null, 'EVENT_CARD_OPEN'),
}));

const mockedController = useEventScreenController as jest.Mock;

const summary: AgeMilestoneSummary = {
  age: 9,
  traitsGained: [],
  traitsLost: [],
  keyMemories: [],
  statDeltas: { health: 4 },
  npcChanges: [],
};

const renderEvent = (overrides: Record<string, unknown>) => {
  mockedController.mockReturnValue({
    gameState: {
      age: 10,
      phase: 'EVENT',
      currentEvent: { id: 'goal', choices: [] },
      stress: { current: 0 },
      isExamPeriod: false,
      ageMilestoneSummaries: [],
      chapterSummaries: [],
      yearEndWindowsShown: undefined,
      ...overrides,
    },
    stats: { health: 50, familyRelation: 50 },
    choicesToRender: [],
    lockedChoices: [],
    eventText: { title: 'Hedef', description: 'Metin' },
    echo: null,
  });
  return render(<EventScreen />);
};

describe('EventScreen overlay sequence', () => {
  it('shows the event card alone when no window is pending', () => {
    const { queryByText } = renderEvent({});
    expect(queryByText('EVENT_CARD_OPEN')).not.toBeNull();
  });

  it('hides the event card while the year summary is pending', () => {
    const { queryByText } = renderEvent({ ageMilestoneSummaries: [summary] });
    expect(queryByText('EVENT_CARD_OPEN')).toBeNull();
  });

  it('hides the event card while the exam period is open', () => {
    const { queryByText } = renderEvent({ isExamPeriod: true });
    expect(queryByText('EVENT_CARD_OPEN')).toBeNull();
  });

  it('shows the event card once the year summary is closed and the exam period is over', () => {
    const { queryByText } = renderEvent({
      ageMilestoneSummaries: [summary],
      yearEndWindowsShown: { milestoneAges: [9], chapterIds: [] },
      isExamPeriod: false,
    });
    expect(queryByText('EVENT_CARD_OPEN')).not.toBeNull();
  });
});
