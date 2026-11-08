import { useCallback, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { ExamResult, ExamType as ExamGameType } from '../components/exams';
import { useGame } from '../context/GameContext';
import { EXAM_PREP_AD_SKIPPED } from './useAdRewards';
import { useExamHandler } from './useExamHandler';
import { ExamSubject, GameStateUpdate, SchoolGrades, Skills, Stats } from '../types';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type TranslateFn = (
  key: string,
  params?: Record<string, string | number | boolean>,
  fallback?: string
) => string;

interface UseExamFlowOptions {
  age: number;
  intelligence: number;
  schoolGrades: SchoolGrades;
  skills: Skills;
  traitIds: string[];
  markExamTaken: (subject: ExamSubject) => void;
  updateGameState: (updates: GameStateUpdate) => void;
  updateStats: (updates: Partial<Stats>) => void;
  completeExamPeriod: () => void;
  selectNewEvent: () => void;
  enqueueToast: (message: string, type?: ToastType) => void;
  t: TranslateFn;
  examPrepBoostApplied: number;
  clearExamPrepBoost: () => void;
  claimExamPrepBoostAd: (options?: { shouldShow?: () => boolean }) => Promise<number>;
}

interface UseExamFlowResult {
  examGameVisible: boolean;
  currentExamType: ExamGameType | null;
  examDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  handleExamComplete: (result: ExamResult) => void;
  handleExamCancelWithBoostReset: () => void;
  promptExamPrepAndStartExam: (examType: ExamGameType) => void;
  handleReportCardClose: () => void;
  handleExamPeriodExam: (examType: ExamGameType) => void;
  handleExamPeriodClose: () => void;
}

export const useExamFlow = ({
  age,
  intelligence,
  schoolGrades,
  skills,
  traitIds,
  markExamTaken,
  updateGameState,
  updateStats,
  completeExamPeriod,
  selectNewEvent,
  enqueueToast,
  t,
  examPrepBoostApplied,
  clearExamPrepBoost,
  claimExamPrepBoostAd,
}: UseExamFlowOptions): UseExamFlowResult => {
  const {
    examGameVisible,
    currentExamType,
    examDifficulty,
    openExamGame,
    handleExamComplete: examHandlerComplete,
    handleExamCancel,
  } = useExamHandler({
    age,
    intelligence,
    schoolGrades,
    skills,
    traitIds,
    updateSchoolGrades: (grades) => updateGameState({ schoolGrades: grades }),
    updateSkills: (nextSkills) => updateGameState({ skills: nextSkills }),
    updateStats,
    markExamTaken,
    onExamComplete: (result) => {
      const accuracy = Math.round((result.correctAnswers / result.totalQuestions) * 100);
      const gradeEmoji = accuracy >= 85 ? '\uD83C\uDFC6' : accuracy >= 70 ? '\uD83C\uDF89' : accuracy >= 50 ? '\u2705' : '\uD83D\uDE30';
      const correctCount = `${result.correctAnswers}/${result.totalQuestions} (%${accuracy})`;
      const lines = [
        `${gradeEmoji} ${t('messages.examFinished')}`,
        '',
        t('messages.examCorrect', { count: correctCount }),
        t('messages.examGradeBonus', { bonus: result.gradeBonus }),
        t('messages.examScore', { score: result.finalScore }),
      ];
      enqueueToast(
        lines.join('\n'),
        accuracy >= 50 ? 'success' : 'warning'
      );
      if (examPrepBoostApplied > 0) {
        clearExamPrepBoost();
        enqueueToast(t('messages.examFocusEnded'), 'info');
      }
    },
  });

  // Hazırlık reklamı yüklenirken oyuncu ilerlediyse (tur değişti) ya da sınav zaten açıldıysa
  // reklam açılmaz ve sınav sonradan açılmaz.
  const { gameState } = useGame();
  const placeRef = useRef({
    turn: gameState.turn,
    examOpen: examGameVisible,
    isExamPeriod: gameState.isExamPeriod,
    pendingReportCard: gameState.pendingReportCard,
  });
  placeRef.current = {
    turn: gameState.turn,
    examOpen: examGameVisible,
    isExamPeriod: gameState.isExamPeriod,
    pendingReportCard: gameState.pendingReportCard,
  };
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleExamCancelWithBoostReset = useCallback(() => {
    clearExamPrepBoost();
    handleExamCancel();
  }, [clearExamPrepBoost, handleExamCancel]);

  const promptExamPrepAndStartExam = useCallback((examType: ExamGameType) => {
    const startExam = () => {
      clearExamPrepBoost();
      openExamGame(examType);
    };

    Alert.alert(
      t('dialogs.examPrep.title'),
      t('dialogs.examPrep.description'),
      [
        {
          text: t('buttons.startDirect'),
          onPress: startExam,
        },
        {
          text: t('buttons.watchAd'),
          onPress: () => {
            void (async () => {
              clearExamPrepBoost();
              const requestedTurn = placeRef.current.turn;
              const requestedExamPeriod = placeRef.current.isExamPeriod;
              // Sınav Dönemi/karne kapanınca tur değişmez ama yeni olay gelir: bunlar da "ayrıldı" sayılır.
              const isStillHere = () =>
                isMountedRef.current &&
                placeRef.current.turn === requestedTurn &&
                placeRef.current.isExamPeriod === requestedExamPeriod &&
                !placeRef.current.pendingReportCard &&
                !placeRef.current.examOpen;
              const boost = await claimExamPrepBoostAd({ shouldShow: isStillHere });
              // Reklam arka planda iptal olduysa oyuncu geri dönünce Sınav Dönemi penceresi durur: sınavı hazırlıksız açma.
              if (boost === EXAM_PREP_AD_SKIPPED || !isStillHere()) return;
              openExamGame(examType);
            })();
          },
        },
      ]
    );
  }, [claimExamPrepBoostAd, clearExamPrepBoost, openExamGame, t]);

  const handleReportCardClose = useCallback(() => {
    updateGameState({ pendingReportCard: false });
    selectNewEvent();
  }, [selectNewEvent, updateGameState]);

  const handleExamPeriodExam = useCallback((examType: ExamGameType) => {
    promptExamPrepAndStartExam(examType);
  }, [promptExamPrepAndStartExam]);

  const handleExamPeriodClose = useCallback(() => {
    completeExamPeriod();
  }, [completeExamPeriod]);

  return {
    examGameVisible,
    currentExamType,
    examDifficulty,
    handleExamComplete: examHandlerComplete,
    handleExamCancelWithBoostReset,
    promptExamPrepAndStartExam,
    handleReportCardClose,
    handleExamPeriodExam,
    handleExamPeriodClose,
  };
};
