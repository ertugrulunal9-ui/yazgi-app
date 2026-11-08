/**
 * Yıl başı pencere sırası: aynı anda tek pencere. 10 yaşın başında yıl sonu özeti, Sınav Dönemi ve
 * hedef olayı üst üste açılıyor, üstteki pencere dokunmayı yutuyordu. Zaman sırası:
 * yıl sonu penceresi -> Sınav Dönemi -> olay kartı.
 */

export type OverlayStage = 'YEAR_END' | 'EXAM_PERIOD' | 'EVENT' | 'NONE';

export interface OverlaySequenceInput {
  /** Kapatılmamış yıl sonu penceresi var (açık ya da açılmak üzere). */
  yearEndPending: boolean;
  /** Oyun durumunda sınav dönemi açık (sınav mini oyunu sürerken de true). */
  examPeriodActive: boolean;
  /** Oyun olay aşamasında (olay kartı gösterilecek). */
  eventActive: boolean;
}

/** Şu an tek başına görünmesi gereken katman. */
export const resolveOverlayStage = ({
  yearEndPending,
  examPeriodActive,
  eventActive,
}: OverlaySequenceInput): OverlayStage => {
  if (yearEndPending) return 'YEAR_END';
  if (examPeriodActive) return 'EXAM_PERIOD';
  return eventActive ? 'EVENT' : 'NONE';
};
