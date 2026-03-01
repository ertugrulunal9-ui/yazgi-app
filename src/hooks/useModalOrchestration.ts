import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buttonPress, gradeBad, gradeGood, selectionHaptic, turnAdvance } from '../animations';
import { SchoolGrades } from '../types';
import { calculateVarietyBonus } from '../utils/gameUtils';
import { logInterstitialOpportunity, logInterstitialResult } from '../utils/analyticsEvents';
import { showInterstitialAdDetailed } from '../services/monetization';

type TranslateFn = (
  key: string,
  params?: Record<string, string | number | boolean>,
  fallback?: string
) => string;

interface UseModalOrchestrationOptions {
  pendingReportCard: boolean;
  schoolGrades: SchoolGrades;
  actionHistory: Array<{ actionId: string; turn: number }>;
  advanceTurn: () => void;
  t: TranslateFn;
}

interface UseModalOrchestrationResult {
  daySummaryVisible: boolean;
  daySummaryVarietyBonus: number;
  handleEndDay: () => void;
  handleDaySummaryContinue: () => Promise<void>;
}

export const useModalOrchestration = ({
  pendingReportCard,
  schoolGrades,
  actionHistory,
  advanceTurn,
  t,
}: UseModalOrchestrationOptions): UseModalOrchestrationResult => {
  const previousReportCardRef = useRef(pendingReportCard);
  const [daySummaryVisible, setDaySummaryVisible] = useState(false);

  const daySummaryVarietyBonus = useMemo(
    () => calculateVarietyBonus(actionHistory || []),
    [actionHistory]
  );

  useEffect(() => {
    if (pendingReportCard && !previousReportCardRef.current) {
      const gradeValues = Object.values(schoolGrades).filter(
        (value): value is number => typeof value === 'number'
      );
      const averageGrade = gradeValues.length > 0
        ? gradeValues.reduce((sum, value) => sum + value, 0) / gradeValues.length
        : 0;

      if (averageGrade >= 70) {
        gradeGood();
      } else {
        gradeBad();
      }
    }

    previousReportCardRef.current = pendingReportCard;
  }, [pendingReportCard, schoolGrades]);

  const handleEndDay = useCallback(() => {
    buttonPress();
    selectionHaptic();
    setDaySummaryVisible(true);
  }, []);

  const handleDaySummaryContinue = useCallback(async () => {
    setDaySummaryVisible(false);
    void logInterstitialOpportunity({ placement: 'day_summary' });
    const interstitial = await showInterstitialAdDetailed();
    void logInterstitialResult({
      placement: 'day_summary',
      shown: interstitial.shown,
      reason: interstitial.reason,
    });
    turnAdvance();
    try {
      advanceTurn();
    } catch (error) {
      console.error(t('errors.turnAdvanceError', undefined, 'Tur ilerliyor: HATA - advanceTurn sirasinda bir sorun olustu'), error);
    }
  }, [advanceTurn, t]);

  return {
    daySummaryVisible,
    daySummaryVarietyBonus,
    handleEndDay,
    handleDaySummaryContinue,
  };
};
