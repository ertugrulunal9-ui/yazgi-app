/**
 * Yaş geçişi geçiş reklamı: yalnızca doğal arada ve önceden yüklenmiş reklamla (AdMob "beklenmedik
 * geçiş reklamı" yasağı). Eskiden reklam yaş artınca istenip 1-3 sn sonra ekranda ne varsa (yıl sonu
 * penceresi, yeni olay) onun üstüne açılıyordu.
 *
 * 1. İlk koşu bittikten sonra reklam önceden yüklenir (oyun ekranı açılınca ve her aradan sonra).
 * 2. Yaş artınca fırsat kaydedilir; ilk koşuda `first_run_grace` ile atlanır.
 * 3. O yıl yıl sonu penceresi açılıyorsa ara, oyuncunun pencereyi KAPATTIĞI andır; açılmıyorsa
 *    (sakin yıl) ara yaş geçişinin kendisidir.
 * 4. Arada reklam hazırsa hemen açılır; değilse fırsat atlanır (`not_ready`), sonradan açılmaz.
 */
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { preloadInterstitialAd, showInterstitialAdDetailed } from '../services/monetization';
import { logInterstitialOpportunity, logInterstitialResult } from '../utils/analyticsEvents';

interface UseAgeTransitionInterstitialOptions {
  age: number;
  /** İlk koşu (hiç tamamlanmış hayat yok): geçiş reklamı gösterilmez ve önceden yüklenmez. */
  isFirstRun: boolean;
  /** Bu render'da açık olması gereken (henüz kapatılmamış) yıl sonu penceresi var mı. */
  yearEndWindowPending: boolean;
}

export const useAgeTransitionInterstitial = ({
  age,
  isFirstRun,
  yearEndWindowPending,
}: UseAgeTransitionInterstitialOptions) => {
  const previousAgeRef = useRef(age);
  // Yaş geçişinde yıl sonu penceresi açıldıysa fırsat pencere kapanana kadar bekler.
  const breakAtWindowCloseRef = useRef(false);
  // Yaş geçişi etkisi yalnızca yaşa bağlı; diğer değerler bu render'ınkiler olmalı.
  const latestRef = useRef({ isFirstRun, yearEndWindowPending });
  latestRef.current = { isFirstRun, yearEndWindowPending };

  useEffect(() => {
    if (isFirstRun) return;
    preloadInterstitialAd();
  }, [isFirstRun]);

  const runAdBreak = useCallback(async () => {
    const result = await showInterstitialAdDetailed();
    void logInterstitialResult({
      placement: 'age_transition',
      shown: result.shown,
      reason: result.reason,
    });
    // Gösterildiyse de atlandıysa da sıradaki ara için yeniden yükle.
    if (!latestRef.current.isFirstRun) preloadInterstitialAd();
  }, []);

  // Yerleşim etkisi: sakin yılda reklam, yaş geçişinin işlendiği aynı karede istenir (önceden
  // yüklendiği için bekleme yok); oyuncu "Günü Bitir"e bastığı an doğal aradır.
  useLayoutEffect(() => {
    const previousAge = previousAgeRef.current;
    previousAgeRef.current = age;
    // Yalnızca tek yıllık ilerleme yaş geçişidir; oyun içinde kayıt yükleme (ör. 5 → 12) ya da yeni
    // hayat (yaş geriye) bir ara değildir, reklam açılmaz.
    if (age !== previousAge + 1) return;

    void logInterstitialOpportunity({ placement: 'age_transition' });
    const { isFirstRun: firstRun, yearEndWindowPending: windowPending } = latestRef.current;
    if (firstRun) {
      void logInterstitialResult({
        placement: 'age_transition',
        shown: false,
        reason: 'first_run_grace',
      });
      return;
    }
    if (windowPending) {
      breakAtWindowCloseRef.current = true;
      return;
    }
    void runAdBreak();
  }, [age, runAdBreak]);

  /** Oyuncu yıl sonu penceresini kapatınca çağrılır; o yaş geçişinin fırsatı varsa şimdi denenir. */
  const handleYearEndWindowClosed = useCallback(() => {
    if (!breakAtWindowCloseRef.current) return;
    breakAtWindowCloseRef.current = false;
    void runAdBreak();
  }, [runAdBreak]);

  return { handleYearEndWindowClosed };
};
