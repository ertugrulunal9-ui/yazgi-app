import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { buttonPress, gradeBad, gradeGood, selectionHaptic, turnAdvance } from '../animations';
import { SchoolGrades } from '../types';
import { calculateVarietyBonus } from '../utils/gameUtils';

type TranslateFn = (
  key: string,
  params?: Record<string, string | number | boolean>,
  fallback?: string
) => string;

interface UseModalOrchestrationOptions {
  pendingReportCard: boolean;
  schoolGrades: SchoolGrades;
  actionHistory: Array<{ actionId: string; turn: number }>;
  /** Oyuncu harcayabileceği enerjiyi bırakıyorsa gün özeti onay olarak açılır. */
  hasSpendableEnergy: boolean;
  advanceTurn: () => void;
  t: TranslateFn;
}

interface UseModalOrchestrationResult {
  daySummaryVisible: boolean;
  daySummaryVarietyBonus: number;
  handleEndDay: () => void;
  handleDaySummaryContinue: () => void;
  handleDaySummaryCancel: () => void;
}

export const useModalOrchestration = ({
  pendingReportCard,
  schoolGrades,
  actionHistory,
  hasSpendableEnergy,
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

  const finishDay = useCallback(() => {
    turnAdvance();
    try {
      advanceTurn();
    } catch (error) {
      console.error(t('errors.turnAdvanceError', undefined, 'Tur ilerliyor: HATA - advanceTurn sirasinda bir sorun olustu'), error);
    }
  }, [advanceTurn, t]);

  const handleEndDay = useCallback(() => {
    buttonPress();
    if (!hasSpendableEnergy) {
      finishDay();
      return;
    }
    selectionHaptic();
    setDaySummaryVisible(true);
  }, [finishDay, hasSpendableEnergy]);

  const handleDaySummaryContinue = useCallback(() => {
    setDaySummaryVisible(false);
    finishDay();
  }, [finishDay]);

  const handleDaySummaryCancel = useCallback(() => {
    setDaySummaryVisible(false);
  }, []);

  return {
    daySummaryVisible,
    daySummaryVarietyBonus,
    handleEndDay,
    handleDaySummaryContinue,
    handleDaySummaryCancel,
  };
};
