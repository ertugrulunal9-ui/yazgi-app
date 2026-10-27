import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { AgeMilestoneModal } from '../../src/components/AgeMilestoneModal';
import { ChapterTransitionModal } from '../../src/components/ChapterTransitionModal';
import { setRuntimeLocale } from '../../src/i18n/strings';
import type { AgeMilestoneSummary, ChapterSummary } from '../../src/types/game';

jest.mock('../../src/context/UIContext', () => {
  const { tRuntime } = require('../../src/i18n/strings');
  return {
    useUI: () => ({
      theme: {
        surfaceBase: '#111827',
        surfaceRaised: '#1f2937',
        surfaceOverlay: '#334155',
        border: '#334155',
        textPrimary: '#f9fafb',
        textSecondary: '#94a3b8',
        accentEvent: '#22c55e',
      },
      metrics: { pad: 12, font: 15 },
      t: tRuntime,
    }),
  };
});

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

const yearSummary: AgeMilestoneSummary = {
  age: 3,
  traitsGained: ['MERAKLI'],
  traitsLost: [],
  keyMemories: [{ eventId: 'tr_dis_bugdayi', emotion: 'PRIDE', summary: 'gurur' }],
  statDeltas: { health: 4 },
  npcChanges: [],
  academicHighlight: 'Matematik +6',
};

const hostModals = (root: { findAll: (predicate: (node: { type: unknown }) => boolean) => unknown[] }) => (
  root.findAll(node => node.type === 'Modal')
);

describe('year-end windows', () => {
  beforeEach(() => setRuntimeLocale('tr'));

  it('shows the year summary inside the chapter window as one window', () => {
    const { getByText, UNSAFE_root } = render(
      <ChapterTransitionModal
        visible
        summary={chapter}
        yearMilestone={yearSummary}
        nextChapterId={2}
        nextChapterEmoji="🧸"
        onClose={jest.fn()}
      />,
    );

    expect(hostModals(UNSAFE_root)).toHaveLength(1);
    expect(getByText('🍼 Bebeklik Bitti')).toBeTruthy();
    expect(getByText('Bu Bölümde Değişimler')).toBeTruthy();
    // Yıl özeti başlığı ve içeriği
    expect(getByText('Yaş 3 Özeti')).toBeTruthy();
    expect(getByText('+ MERAKLI')).toBeTruthy();
    expect(getByText('★ gurur')).toBeTruthy();
    expect(getByText('Matematik +6')).toBeTruthy();
    // Sonraki bölüm teaser'ı hâlâ var
    expect(getByText('🧸 Çocukluk')).toBeTruthy();
  });

  it('has a single continue button that closes the window', () => {
    const onClose = jest.fn();
    const { getAllByText } = render(
      <ChapterTransitionModal visible summary={chapter} yearMilestone={yearSummary} onClose={onClose} />,
    );

    const buttons = getAllByText('Devam Et');
    expect(buttons).toHaveLength(1);
    fireEvent.press(buttons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows only the chapter content when the year was quiet', () => {
    const { getByText, queryByText } = render(
      <ChapterTransitionModal visible summary={chapter} onClose={jest.fn()} />,
    );

    expect(getByText('🍼 Bebeklik Bitti')).toBeTruthy();
    expect(queryByText('Yaş 3 Özeti')).toBeNull();
    expect(queryByText('+ MERAKLI')).toBeNull();
  });

  it('keeps the age summary window working on its own', () => {
    const { getByText, queryByText, UNSAFE_root } = render(
      <AgeMilestoneModal visible milestone={yearSummary} onClose={jest.fn()} />,
    );

    expect(hostModals(UNSAFE_root)).toHaveLength(1);
    expect(getByText('Yaş 3 Özeti')).toBeTruthy();
    expect(getByText('+ MERAKLI')).toBeTruthy();
    expect(getByText('Matematik +6')).toBeTruthy();
    expect(queryByText('Bu yaş sakin geçti.')).toBeNull();
  });

  it('uses English labels in the combined window', () => {
    setRuntimeLocale('en');
    const { getByText } = render(
      <ChapterTransitionModal
        visible
        summary={{ ...chapter, chapterName: 'Infancy' }}
        yearMilestone={yearSummary}
        onClose={jest.fn()}
      />,
    );

    expect(getByText('Age 3 Summary')).toBeTruthy();
    expect(getByText('Continue')).toBeTruthy();
  });
});
