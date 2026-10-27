/**
 * Yıl sonu penceresi kararı: bir yaş bitince oyuncuya en fazla TEK pencere gösterilir.
 *
 * - Bölüm değişimi + içeriği olan yaş özeti → bölüm penceresi, yaş özeti içinde.
 * - Bölüm değişimi + sakin yıl → yalnızca bölüm penceresi.
 * - Bölüm değişimi yok → yalnızca yaş özeti (sakin yıllar atlanır).
 * İki özellik bayrağı birbirinden bağımsızdır: biri kapalıysa öbürü tek başına çalışır.
 */

import { CHAPTERS } from '../config/gameBalance';
import type { AgeMilestoneSummary, ChapterSummary } from '../types/game';
import { hasMilestoneContent } from './milestoneBuilder';

export interface YearEndWindow {
  /** Bölüm geçişi varsa: bölüm penceresi açılır (yaş özeti varsa içinde gösterilir). */
  chapter: ChapterSummary | null;
  /** Gösterilecek yaş özeti: bölüm penceresinin içinde ya da tek başına. */
  milestone: AgeMilestoneSummary | null;
}

export interface YearEndWindowInput {
  milestones?: readonly AgeMilestoneSummary[];
  chapters?: readonly ChapterSummary[];
  milestoneEnabled: boolean;
  chapterEnabled: boolean;
  /** Daha önce gösterilmiş (kapatılmış) yaş özetlerinin yaşları. */
  shownMilestoneAges: ReadonlySet<number>;
  /** Daha önce gösterilmiş (kapatılmış) bölümlerin numaraları. */
  shownChapterIds: ReadonlySet<number>;
}

/** Bölüm özetinin kapandığı yıl: bu yaştaki özet, bölümle aynı yıl sonuna aittir. */
const getChapterClosingAge = (chapter: ChapterSummary): number | undefined => (
  CHAPTERS.find(candidate => candidate.id === chapter.chapterId)?.ageEnd
);

/**
 * Şu an açılması gereken yıl sonu penceresini döner; gösterilecek bir şey yoksa `null`.
 * Yalnızca en son yaş özeti ve en son bölüm özeti değerlendirilir.
 */
export const resolveYearEndWindow = ({
  milestones,
  chapters,
  milestoneEnabled,
  chapterEnabled,
  shownMilestoneAges,
  shownChapterIds,
}: YearEndWindowInput): YearEndWindow | null => {
  const lastMilestone = milestoneEnabled ? milestones?.[milestones.length - 1] : undefined;
  const pendingMilestone = lastMilestone
    && !shownMilestoneAges.has(lastMilestone.age)
    // Sakin geçen yıllar için pencere açılmaz; olay akışı kesilmesin
    && hasMilestoneContent(lastMilestone)
    ? lastMilestone
    : null;

  const lastChapter = chapterEnabled ? chapters?.[chapters.length - 1] : undefined;
  const pendingChapter = lastChapter && !shownChapterIds.has(lastChapter.chapterId)
    ? lastChapter
    : null;

  if (pendingChapter) {
    // Yaş özeti yalnızca bölümü kapatan yılın özetiyse birleştirilir; eski bir özet
    // (ör. kayıt yüklenince) bölüm penceresine yanlış yılı sokmasın.
    const sameYear = pendingMilestone !== null
      && pendingMilestone.age === getChapterClosingAge(pendingChapter);
    return { chapter: pendingChapter, milestone: sameYear ? pendingMilestone : null };
  }

  return pendingMilestone ? { chapter: null, milestone: pendingMilestone } : null;
};
