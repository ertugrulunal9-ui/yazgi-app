import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import { Haptics } from '../../utils/haptics';
import { tRuntime } from '../../i18n/strings';
import { Difficulty, GameState } from './MiniGameContainer';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MusicExamGameProps {
  gameState?: GameState;
  setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
  difficulty?: Difficulty;
  age?: number;
}

interface Note {
  id: number;
  lane: number;
  x: number;
}

const LANE_COUNT = 3;
const NOTE_SIZE = 44;
const GAME_HEIGHT = Math.min(360, SCREEN_HEIGHT * 0.55);
const START_Y = -60;
const HIT_LINE_Y = GAME_HEIGHT - 90;
const HIT_WINDOW = 34;
const GOOD_WINDOW = 18;
const PERFECT_WINDOW = 8;

const LANE_COLORS = ['#22c55e', '#3b82f6', '#f97316'];
const LANE_LABELS = ['DO', 'RE', 'MI'];

const getNoteSpeed = (difficulty: Difficulty, progress: number, age: number) => {
  const base = difficulty === 'HARD' ? 1800 : difficulty === 'MEDIUM' ? 2400 : 3000;
  const ageBuffer = age <= 9 ? 200 : age <= 12 ? 100 : 0;
  const penalty = progress * 75;
  return Math.max(1200, base + ageBuffer - penalty);
};

const MusicExamGame: React.FC<MusicExamGameProps> = ({
  gameState,
  setGameState,
  difficulty = 'MEDIUM',
  age = 10,
}) => {
  if (!gameState || !setGameState) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{tRuntime('exams.music.loading')}</Text>
      </View>
    );
  }

  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [hitText, setHitText] = useState<string | null>(null);
  const [hitTextColor, setHitTextColor] = useState('#22c55e');
  const [hitLaneIndex, setHitLaneIndex] = useState<number | null>(null);
  const [noteStartMs, setNoteStartMs] = useState(0);
  const [noteDurationMs, setNoteDurationMs] = useState(0);
  const noteIdRef = useRef(0);
  const didSpawnInitial = useRef(false);
  const handleMissRef = useRef<() => void>(() => {});
  const spawnNoteRef = useRef<() => void>(() => {});

  const noteY = useSharedValue(START_Y);
  const noteScale = useSharedValue(1);
  const noteOpacity = useSharedValue(1);
  const feedbackScale = useSharedValue(0);
  const beatPulse = useSharedValue(0);
  const hitFlash = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);

  useEffect(() => {
    beatPulse.value = withRepeat(
      withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [beatPulse]);

  const triggerMiss = useCallback(() => {
    handleMissRef.current();
  }, []);

  const spawnNote = useCallback(() => {
    if (gameState.currentQuestion >= gameState.totalQuestions) {
      setGameState(prev => ({ ...prev, phase: 'FINISHED' }));
      return;
    }

    const lane = Math.floor(Math.random() * LANE_COUNT);
    const laneWidth = SCREEN_WIDTH / LANE_COUNT;
    const x = lane * laneWidth + (laneWidth - NOTE_SIZE) / 2;
    const duration = getNoteSpeed(difficulty, gameState.currentQuestion, age);

    noteIdRef.current += 1;
    setCurrentNote({ id: noteIdRef.current, lane, x });
    setFeedback(null);
    setHitText(null);
    setNoteStartMs(Date.now());
    setNoteDurationMs(duration);

    cancelAnimation(noteY);
    noteY.value = START_Y;
    noteScale.value = 1;
    noteOpacity.value = 1;

    noteY.value = withTiming(
      HIT_LINE_Y,
      { duration, easing: Easing.linear },
      (finished) => {
        if (finished) {
          runOnJS(triggerMiss)();
        }
      }
    );
  }, [
    age,
    difficulty,
    gameState.currentQuestion,
    gameState.totalQuestions,
    noteOpacity,
    noteScale,
    noteY,
    setGameState,
    triggerMiss,
  ]);

  useEffect(() => {
    spawnNoteRef.current = spawnNote;
  }, [spawnNote]);

  useEffect(() => {
    if (didSpawnInitial.current) return;
    didSpawnInitial.current = true;
    spawnNote();
  }, [spawnNote]);

  const finishQuestion = useCallback((isCorrect: boolean, scoreBonus: number = 0) => {
    const isLast = gameState.currentQuestion + 1 >= gameState.totalQuestions;
    const baseScore = difficulty === 'HARD' ? 90 : difficulty === 'MEDIUM' ? 70 : 50;
    const streakBonus = Math.min(gameState.streak * 8, 40);

    setGameState(prev => ({
      ...prev,
      score: prev.score + (isCorrect ? baseScore + streakBonus + scoreBonus : 0),
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      wrongAnswers: prev.wrongAnswers + (isCorrect ? 0 : 1),
      currentQuestion: prev.currentQuestion + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
      ...(isLast ? { phase: 'FINISHED' as const } : {}),
    }));

    if (!isLast) {
      setTimeout(() => {
        spawnNoteRef.current();
      }, 500);
    }
  }, [difficulty, gameState.currentQuestion, gameState.streak, gameState.totalQuestions, setGameState]);

  const handleMiss = useCallback(() => {
    if (feedback !== null) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setFeedback('wrong');
    setHitText(tRuntime('exams.music.missed'));
    setHitTextColor('#ef4444');
    hitFlash.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 260 })
    );
    finishQuestion(false);
  }, [feedback, finishQuestion, hitFlash]);

  useEffect(() => {
    handleMissRef.current = handleMiss;
  }, [handleMiss]);

  const handleLanePress = useCallback((laneIndex: number) => {
    if (!currentNote || feedback !== null) return;

    const elapsed = Date.now() - noteStartMs;
    const progress = Math.min(1, Math.max(0, elapsed / Math.max(1, noteDurationMs)));
    const currentY = START_Y + (HIT_LINE_Y - START_Y) * progress;
    const delta = Math.abs(currentY - HIT_LINE_Y);
    const inWindow = delta <= HIT_WINDOW;
    const isCorrectLane = laneIndex === currentNote.lane;

    cancelAnimation(noteY);

    if (inWindow && isCorrectLane) {
      const isPerfect = delta <= PERFECT_WINDOW;
      const isGood = delta <= GOOD_WINDOW;
      const scoreBonus = isPerfect ? 30 : isGood ? 15 : 5;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback('correct');
      setHitText(
        isPerfect
          ? tRuntime('exams.music.perfect')
          : isGood
            ? tRuntime('exams.music.good')
            : tRuntime('exams.music.okay')
      );
      setHitTextColor(isPerfect ? '#facc15' : isGood ? '#22c55e' : '#60a5fa');
      setHitLaneIndex(laneIndex);
      noteScale.value = withSequence(withSpring(1.2), withTiming(0.95));
      noteOpacity.value = withTiming(0, { duration: 220 });
      hitFlash.value = withSequence(
        withTiming(1, { duration: 80 }),
        withTiming(0, { duration: 260 })
      );
      rippleScale.value = 0.2;
      rippleOpacity.value = 0.9;
      rippleScale.value = withTiming(1.6, { duration: 260, easing: Easing.out(Easing.quad) });
      rippleOpacity.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.quad) });
      feedbackScale.value = withSequence(withSpring(1.1), withTiming(0));
      finishQuestion(true, scoreBonus);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFeedback('wrong');
      setHitText(inWindow ? tRuntime('exams.music.wrong') : tRuntime('exams.music.missed'));
      setHitTextColor('#ef4444');
      setHitLaneIndex(laneIndex);
      hitFlash.value = withSequence(
        withTiming(1, { duration: 80 }),
        withTiming(0, { duration: 260 })
      );
      rippleScale.value = 0.2;
      rippleOpacity.value = 0.6;
      rippleScale.value = withTiming(1.4, { duration: 240, easing: Easing.out(Easing.quad) });
      rippleOpacity.value = withTiming(0, { duration: 240, easing: Easing.out(Easing.quad) });
      feedbackScale.value = withSequence(withSpring(1.1), withTiming(0));
      finishQuestion(false);
    }
  }, [currentNote, feedback, noteStartMs, noteDurationMs, noteY, noteScale, noteOpacity, feedbackScale, finishQuestion, hitFlash, rippleOpacity, rippleScale]);

  const noteStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: noteY.value }, { scale: noteScale.value }],
    opacity: noteOpacity.value,
    left: currentNote?.x ?? 0,
  }));

  const hitLineStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + beatPulse.value * 0.35,
    transform: [{ scaleY: 1 + beatPulse.value * 0.35 }],
  }));

  const hitFlashStyle = useAnimatedStyle(() => ({
    opacity: hitFlash.value,
  }));

  const feedbackStyle = useAnimatedStyle(() => ({
    transform: [{ scale: feedbackScale.value }],
    opacity: feedbackScale.value,
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
  }));

  const laneWidth = SCREEN_WIDTH / LANE_COUNT;
  const rippleLeft = hitLaneIndex !== null
    ? hitLaneIndex * laneWidth + (laneWidth - NOTE_SIZE) / 2
    : -999;

  return (
    <View style={styles.container}>
      <View style={styles.gameArea}>
        <View style={styles.lanes}>
          {LANE_COLORS.map((color) => (
            <View key={color} style={[styles.lane, { borderColor: color }]} />
          ))}
        </View>

        <Animated.View style={[styles.hitLine, hitLineStyle]} />
        <Animated.View style={[styles.hitGlow, hitFlashStyle]} />
        <Animated.View style={[styles.hitRipple, rippleStyle, { left: rippleLeft }]} />

        {currentNote && (
          <Animated.View style={[styles.note, noteStyle, { backgroundColor: LANE_COLORS[currentNote.lane] }]}>
            <Text style={styles.noteText}>♪</Text>
          </Animated.View>
        )}

        <Animated.View pointerEvents="none" style={[styles.feedbackOverlay, feedbackStyle]}>
          <Text style={styles.feedbackEmoji}>
            {feedback === 'correct' ? '✅' : feedback === 'wrong' ? '❌' : ''}
          </Text>
          {hitText ? (
            <Text style={[styles.hitText, { color: hitTextColor }]}>{hitText}</Text>
          ) : null}
        </Animated.View>
      </View>

      <View style={styles.controls}>
        {LANE_LABELS.map((label, idx) => (
          <TouchableOpacity
            key={label}
            style={[styles.laneButton, { borderColor: LANE_COLORS[idx] }]}
            onPress={() => handleLanePress(idx)}
            activeOpacity={0.85}
          >
            <Text style={[styles.laneButtonText, { color: LANE_COLORS[idx] }]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${(gameState.currentQuestion / gameState.totalQuestions) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {gameState.currentQuestion} / {gameState.totalQuestions}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  gameArea: {
    height: GAME_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
  },
  lanes: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  lane: {
    flex: 1,
    borderRightWidth: 1,
    borderLeftWidth: 1,
    opacity: 0.25,
  },
  hitLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: HIT_LINE_Y,
    height: 4,
    backgroundColor: '#94a3b8',
    opacity: 0.5,
  },
  hitGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: HIT_LINE_Y - 10,
    height: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
    opacity: 0,
  },
  hitRipple: {
    position: 'absolute',
    top: HIT_LINE_Y - 20,
    width: NOTE_SIZE + 10,
    height: NOTE_SIZE + 10,
    borderRadius: (NOTE_SIZE + 10) / 2,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    opacity: 0,
  },
  note: {
    position: 'absolute',
    top: 0,
    width: NOTE_SIZE,
    height: NOTE_SIZE,
    borderRadius: NOTE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  noteText: {
    color: '#0f172a',
    fontSize: 20,
    fontWeight: '900',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '40%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  feedbackEmoji: {
    fontSize: 64,
  },
  hitText: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1e293b',
  },
  laneButton: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  laneButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: '#1e293b',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#22c55e',
    borderRadius: 4,
  },
  progressText: {
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 16,
  },
});

export default MusicExamGame;
