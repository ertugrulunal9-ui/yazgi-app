import { CHAPTERS } from '../../src/config/gameBalance';
import type { AgeMilestoneSummary, ChapterSummary } from '../../src/types/game';
import { buildChapterSummary } from '../../src/utils/milestoneBuilder';
import { isChapterTransition } from '../../src/utils/gameUtils';
import { resolveYearEndWindow, type YearEndWindowInput } from '../../src/utils/yearEndWindow';

const milestone = (age: number, overrides: Partial<AgeMilestoneSummary> = {}): AgeMilestoneSummary => ({
  age,
  traitsGained: [],
  traitsLost: [],
  keyMemories: [],
  statDeltas: { health: 4 },
  npcChanges: [],
  ...overrides,
});

const quietMilestone = (age: number): AgeMilestoneSummary => milestone(age, { statDeltas: {} });

/** Gerçek bölüm kurucusuyla: `chapterId` bölümünü kapatan yılın özetleriyle birlikte. */
const chapterSummary = (chapterId: number, milestones: AgeMilestoneSummary[]): ChapterSummary => {
  const chapter = CHAPTERS.find(candidate => candidate.id === chapterId)!;
  return buildChapterSummary(chapter, milestones);
};

const input = (overrides: Partial<YearEndWindowInput>): YearEndWindowInput => ({
  milestones: [],
  chapters: [],
  milestoneEnabled: true,
  chapterEnabled: true,
  shownMilestoneAges: new Set<number>(),
  shownChapterIds: new Set<number>(),
  ...overrides,
});

describe('resolveYearEndWindow', () => {
  // Bebeklik 0-3: 3 → 4 yaşında hem bölüm değişir hem yaş özeti oluşur
  const closingMilestone = milestone(3);
  const closingChapter = chapterSummary(1, [milestone(2), closingMilestone]);

  it('combines the chapter window with the year summary when both have something to show', () => {
    const result = resolveYearEndWindow(input({
      milestones: [milestone(2), closingMilestone],
      chapters: [closingChapter],
    }));

    expect(result).toEqual({ chapter: closingChapter, milestone: closingMilestone });
  });

  it('shows the chapter window alone when the closing year was quiet', () => {
    const quiet = quietMilestone(3);
    const result = resolveYearEndWindow(input({
      milestones: [milestone(2), quiet],
      chapters: [chapterSummary(1, [milestone(2), quiet])],
    }));

    expect(result?.chapter?.chapterId).toBe(1);
    expect(result?.milestone).toBeNull();
  });

  it('shows the year summary alone when there is no chapter change', () => {
    const result = resolveYearEndWindow(input({
      milestones: [milestone(4)],
      chapters: [closingChapter],
      shownChapterIds: new Set([1]),
    }));

    expect(result).toEqual({ chapter: null, milestone: milestone(4) });
  });

  it('still skips quiet years when there is no chapter change', () => {
    expect(resolveYearEndWindow(input({ milestones: [quietMilestone(4)] }))).toBeNull();
    expect(resolveYearEndWindow(input({
      milestones: [quietMilestone(4)],
      chapters: [closingChapter],
      shownChapterIds: new Set([1]),
    }))).toBeNull();
  });

  it('opens nothing before any summary exists', () => {
    expect(resolveYearEndWindow(input({ milestones: undefined, chapters: undefined }))).toBeNull();
    expect(resolveYearEndWindow(input({}))).toBeNull();
  });

  it('opens nothing once both summaries were shown', () => {
    expect(resolveYearEndWindow(input({
      milestones: [closingMilestone],
      chapters: [closingChapter],
      shownMilestoneAges: new Set([3]),
      shownChapterIds: new Set([1]),
    }))).toBeNull();
  });

  it('only looks at the latest summaries', () => {
    const result = resolveYearEndWindow(input({
      milestones: [milestone(2), quietMilestone(3)],
      chapters: [],
    }));

    expect(result).toBeNull();
  });

  describe('feature flags work independently', () => {
    const base = { milestones: [closingMilestone], chapters: [closingChapter] };

    it('with the chapter system off, the year summary opens alone', () => {
      expect(resolveYearEndWindow(input({ ...base, chapterEnabled: false })))
        .toEqual({ chapter: null, milestone: closingMilestone });
    });

    it('with the milestone summary off, the chapter window opens without a year summary', () => {
      expect(resolveYearEndWindow(input({ ...base, milestoneEnabled: false })))
        .toEqual({ chapter: closingChapter, milestone: null });
    });

    it('with both off, nothing opens', () => {
      expect(resolveYearEndWindow(input({ ...base, milestoneEnabled: false, chapterEnabled: false })))
        .toBeNull();
    });
  });

  it('does not put an older year summary into the chapter window (e.g. after loading a save)', () => {
    // Bölüm 1 (0-3 yaş) bitmişti ama en son özet 7 yaşına ait
    const result = resolveYearEndWindow(input({
      milestones: [milestone(7)],
      chapters: [closingChapter],
    }));

    expect(result?.chapter?.chapterId).toBe(1);
    expect(result?.milestone).toBeNull();
  });

  it('pairs the year summary with the chapter for every real chapter change', () => {
    const closingAges = Array.from({ length: 18 }, (_, age) => age)
      .filter(age => isChapterTransition(age, age + 1));

    // 3→4, 6→7, 10→11, 13→14, 16→17: bu yaşlarda yıl sonunda iki pencere birden açılırdı
    expect(closingAges).toEqual([3, 6, 10, 13, 16]);

    for (const age of closingAges) {
      const chapter = CHAPTERS.find(candidate => candidate.ageEnd === age)!;
      const yearSummary = milestone(age);
      const result = resolveYearEndWindow(input({
        milestones: [yearSummary],
        chapters: [chapterSummary(chapter.id, [yearSummary])],
      }));

      expect(result?.chapter?.chapterId).toBe(chapter.id);
      expect(result?.milestone).toBe(yearSummary);
    }
  });
});
