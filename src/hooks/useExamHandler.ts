import { useState, useEffect, useCallback } from 'react';
import { BackHandler } from 'react-native';
import { ExamType as ExamGameType, Difficulty, ExamResult } from '../components/exams';
import { ExamSubject, Stats, SchoolGrades, Skills } from '../types';
import { EXAM_DIFFICULTY } from '../constants/gameConstants';
import { applySkillUpdates } from '../utils/gameUtils';

interface UseExamHandlerOptions {
  age: number;
  intelligence: number;
  schoolGrades: SchoolGrades;
  skills?: Skills;
  traitIds?: string[];
  updateSchoolGrades: (grades: SchoolGrades) => void;
  updateSkills?: (skills: Skills) => void;
  updateStats: (updates: Partial<Stats>) => void;
  markExamTaken: (subject: ExamSubject) => void;
  onExamComplete?: (result: ExamResult) => void;
}

interface UseExamHandlerReturn {
  // State
  examGameVisible: boolean;
  currentExamType: ExamGameType | null;
  examDifficulty: Difficulty;

  // Actions
  openExamGame: (examType: ExamGameType) => void;
  handleExamComplete: (result: ExamResult) => void;
  handleExamCancel: () => void;
}

const GRADE_SUBJECT_MAP: Record<string, ExamSubject> = {
  'MATH': 'math',
  'TURKISH': 'turkish',
  'HISTORY': 'history',
  'SCIENCE': 'science',
  'GEOGRAPHY': 'geography',
  'ENGLISH': 'language',
  'ART': 'art',
  'MUSIC': 'music',
};

const SKILL_BONUS_MAP: Partial<Record<ExamGameType, keyof Skills>> = {
  ART: 'art',
  MUSIC: 'music',
};

export const useExamHandler = (options: UseExamHandlerOptions): UseExamHandlerReturn => {
  const {
    age,
    intelligence,
    schoolGrades,
    skills,
    traitIds,
    updateSchoolGrades,
    updateSkills,
    updateStats,
    markExamTaken,
    onExamComplete,
  } = options;

  // Exam game state
  const [examGameVisible, setExamGameVisible] = useState(false);
  const [currentExamType, setCurrentExamType] = useState<ExamGameType | null>(null);
  const [examDifficulty, setExamDifficulty] = useState<Difficulty>('MEDIUM');

  // Calculate difficulty based on age and intelligence
  const calculateDifficulty = useCallback((): Difficulty => {
    if (age >= EXAM_DIFFICULTY.HARD_MIN_AGE && intelligence >= EXAM_DIFFICULTY.HARD_MIN_INTELLIGENCE) {
      return 'HARD';
    } else if (age >= EXAM_DIFFICULTY.MEDIUM_MIN_AGE || intelligence >= EXAM_DIFFICULTY.MEDIUM_MIN_INTELLIGENCE) {
      return 'MEDIUM';
    }
    return 'EASY';
  }, [age, intelligence]);

  // Handle Android back button for exam overlay
  useEffect(() => {
    if (!examGameVisible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleExamCancel();
      return true;
    });

    return () => backHandler.remove();
  }, [examGameVisible]);

  // Open exam game
  const openExamGame = useCallback((examType: ExamGameType) => {
    console.log('[useExamHandler] Opening exam game:', examType);
    const difficulty = calculateDifficulty();
    console.log('[useExamHandler] Setting exam state:', { type: examType, difficulty, age });

    setCurrentExamType(examType);
    setExamDifficulty(difficulty);
    setExamGameVisible(true);
  }, [calculateDifficulty, age]);

  // Handle exam completion
  const handleExamComplete = useCallback((result: ExamResult) => {
    setExamGameVisible(false);
    setCurrentExamType(null);

    // Map exam type to grade subject
    const subject = GRADE_SUBJECT_MAP[result.type] || 'math';

    // Update school grades
    const newGrades = { ...schoolGrades };
    newGrades[subject] = Math.min(100, Math.max(0, newGrades[subject] + result.gradeBonus));
    updateSchoolGrades(newGrades);

    // Mark exam as taken
    markExamTaken(subject);

    // Update intelligence if bonus exists
    if (result.intelligenceBonus > 0) {
      updateStats({ intelligence: result.intelligenceBonus });
    }

    // Skill bonus for art/music exams
    const skillKey = SKILL_BONUS_MAP[result.type];
    if (skillKey && skills && updateSkills) {
      const accuracy = result.correctAnswers / Math.max(1, result.totalQuestions);
      const baseSkillGain = accuracy >= 0.8 ? 4 : accuracy >= 0.6 ? 3 : accuracy >= 0.4 ? 2 : 1;
      const { newSkills } = applySkillUpdates(skills, { [skillKey]: baseSkillGain }, traitIds || []);
      updateSkills(newSkills);
    }

    // Call optional callback
    if (onExamComplete) {
      onExamComplete(result);
    }

    console.log('[useExamHandler] Exam completed:', {
      type: result.type,
      subject,
      gradeBonus: result.gradeBonus,
      correctAnswers: result.correctAnswers,
      totalQuestions: result.totalQuestions,
    });
  }, [schoolGrades, updateSchoolGrades, markExamTaken, updateStats, onExamComplete, skills, updateSkills, traitIds]);

  // Handle exam cancellation
  const handleExamCancel = useCallback(() => {
    console.log('[useExamHandler] Exam cancelled');
    setExamGameVisible(false);
    setCurrentExamType(null);
  }, []);

  return {
    examGameVisible,
    currentExamType,
    examDifficulty,
    openExamGame,
    handleExamComplete,
    handleExamCancel,
  };
};
