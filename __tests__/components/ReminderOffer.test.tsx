import React from 'react';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { ReminderOffer } from '../../src/components/ReminderOffer';
import { ChapterTransitionModal } from '../../src/components/ChapterTransitionModal';
import { setRuntimeLocale } from '../../src/i18n/strings';
import type { ChapterSummary } from '../../src/types/game';

const mockIsEligible = jest.fn();
const mockMarkShown = jest.fn();
const mockRequestPermissions = jest.fn();
const mockScheduleReengagement = jest.fn();
const mockLogReminderOffer = jest.fn();

jest.mock('../../src/services/notificationService', () => ({
  isReminderOfferEligible: () => mockIsEligible(),
  markReminderOfferShown: () => mockMarkShown(),
  requestPermissions: () => mockRequestPermissions(),
  scheduleReengagement: (hours: number) => mockScheduleReengagement(hours),
}));

jest.mock('../../src/utils/analyticsEvents', () => ({
  logReminderOffer: (result: string) => mockLogReminderOffer(result),
}));

jest.mock('../../src/context/UIContext', () => {
  const { tRuntime } = require('../../src/i18n/strings');
  return {
    useUI: () => ({
      theme: {
        surfaceBase: '#111827',
        surfaceOverlay: '#334155',
        border: '#334155',
        textPrimary: '#f9fafb',
        textSecondary: '#94a3b8',
        accentBrand: '#d97706',
      },
      metrics: { pad: 12, font: 15 },
      t: tRuntime,
    }),
  };
});

const PROMPT = 'Hikayen yarın da devam etsin mi?';
const BUTTON = '🔔 Yarın hatırlat';

const chapter: ChapterSummary = {
  chapterId: 1,
  chapterName: 'Bebeklik',
  chapterEmoji: '🍼',
  ageRange: '0-3 yaş',
  totalStatDeltas: { health: 9 },
  allTraitsGained: [],
  allTraitsLost: [],
  keyMemories: [],
  topNpcChanges: [],
};

describe('ReminderOffer', () => {
  beforeEach(() => {
    setRuntimeLocale('tr');
    mockIsEligible.mockReset().mockResolvedValue(true);
    mockMarkShown.mockReset().mockResolvedValue(undefined);
    mockRequestPermissions.mockReset();
    mockScheduleReengagement.mockReset().mockResolvedValue(undefined);
    mockLogReminderOffer.mockReset().mockResolvedValue(undefined);
  });

  it('asks for permission only when the player taps, then schedules the reminder', async () => {
    mockRequestPermissions.mockResolvedValue(true);
    const { findByText, getByText } = render(<ReminderOffer />);

    await findByText(PROMPT);
    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockLogReminderOffer).toHaveBeenCalledWith('shown');

    await act(async () => {
      fireEvent.press(getByText(BUTTON));
    });

    expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
    expect(mockScheduleReengagement).toHaveBeenCalledWith(24);
    expect(getByText('Hatırlatıcı açıldı')).toBeTruthy();
    expect(mockLogReminderOffer).toHaveBeenCalledWith('enabled');
  });

  it('says reminders are unavailable when the OS denies, without scheduling', async () => {
    mockRequestPermissions.mockResolvedValue(false);
    const { findByText, getByText } = render(<ReminderOffer />);
    const button = await findByText(BUTTON);

    await act(async () => {
      fireEvent.press(button);
    });

    expect(mockScheduleReengagement).not.toHaveBeenCalled();
    expect(getByText('Hatırlatıcı bu cihazda açılamadı')).toBeTruthy();
    expect(mockLogReminderOffer).toHaveBeenCalledWith('unavailable');
  });

  it('renders nothing when the player already opted in or saw the offer', async () => {
    mockIsEligible.mockResolvedValue(false);
    const { queryByText, unmount } = render(<ReminderOffer />);

    await waitFor(() => expect(mockIsEligible).toHaveBeenCalled());
    expect(queryByText(PROMPT)).toBeNull();
    unmount();
    expect(mockMarkShown).not.toHaveBeenCalled();
    expect(mockLogReminderOffer).not.toHaveBeenCalled();
  });

  it('spends the offer once the player has seen it and the window closes', async () => {
    const { findByText, unmount } = render(<ReminderOffer />);
    await findByText(PROMPT);
    expect(mockMarkShown).not.toHaveBeenCalled();

    unmount();

    expect(mockMarkShown).toHaveBeenCalledTimes(1);
  });

  it('appears in the chapter window only when the screen asks for it', async () => {
    const withOffer = render(
      <ChapterTransitionModal visible summary={chapter} reminderOffer onClose={jest.fn()} />
    );
    await withOffer.findByText(PROMPT);
    withOffer.unmount();

    mockIsEligible.mockClear();
    const withoutOffer = render(<ChapterTransitionModal visible summary={chapter} onClose={jest.fn()} />);
    expect(withoutOffer.queryByText(PROMPT)).toBeNull();
    expect(mockIsEligible).not.toHaveBeenCalled();
  });
});
