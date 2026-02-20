import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  SharedValue,
  withRepeat,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Difficulty, GameState } from './MiniGameContainer';

interface ArtExamGameProps {
  gameState?: GameState;
  setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
  difficulty?: Difficulty;
  age?: number;
}

interface ArtQuestion {
  id: number;
  target: string;
  options: string[];
  correctIndex: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BLOB_SIZE = Math.min(260, SCREEN_WIDTH * 0.7);

const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const hslToRgb = (h: number, s: number, l: number) => {
  const sat = s / 100;
  const light = l / 100;

  const c = (1 - Math.abs(2 * light - 1)) * sat;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = light - c / 2;

  let r = 0, g = 0, b = 0;

  if (h < 60) { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const to255 = (val: number) => Math.round((val + m) * 255);
  return `rgb(${to255(r)}, ${to255(g)}, ${to255(b)})`;
};

const generateQuestion = (id: number, difficulty: Difficulty): ArtQuestion => {
  const baseHue = randomInt(0, 359);
  const saturation = difficulty === 'HARD' ? 55 : 65;
  const lightness = difficulty === 'HARD' ? 48 : 52;

  const correct = hslToRgb(baseHue, saturation, lightness);
  const offsets = difficulty === 'HARD' ? [10, 20, 32] : [18, 38, 75];
  const options = [
    correct,
    hslToRgb((baseHue + offsets[0]) % 360, saturation, lightness),
    hslToRgb((baseHue + offsets[1]) % 360, saturation, lightness),
    hslToRgb((baseHue + offsets[2]) % 360, saturation, lightness),
  ];

  const shuffled = options
    .map((color) => ({ color, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map((item) => item.color);

  const correctIndex = shuffled.indexOf(correct);
  return { id, target: correct, options: shuffled, correctIndex };
};

const ColorOption: React.FC<{
  color: string;
  scale: SharedValue<number>;
  isSelected: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  onPress: () => void;
}> = ({ color, scale, isSelected, isCorrect, isWrong, onPress }) => {
  const optionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={optionStyle}>
      <TouchableOpacity
        style={[
          styles.optionButton,
          { backgroundColor: color },
          isSelected && styles.optionSelected,
          isCorrect && styles.optionCorrect,
          isWrong && styles.optionWrong,
        ]}
        onPress={onPress}
        activeOpacity={0.85}
      />
    </Animated.View>
  );
};

const ArtExamGame: React.FC<ArtExamGameProps> = ({
  gameState,
  setGameState,
  difficulty = 'MEDIUM',
}) => {
  if (!gameState || !setGameState) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  const [question, setQuestion] = useState<ArtQuestion | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const feedbackScale = useSharedValue(0);
  const targetPulse = useSharedValue(0);
  const sparkleScale = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  const blobOne = useSharedValue(0);
  const blobTwo = useSharedValue(0);
  const blobThree = useSharedValue(0);
  const optionScale0 = useSharedValue(1);
  const optionScale1 = useSharedValue(1);
  const optionScale2 = useSharedValue(1);
  const optionScale3 = useSharedValue(1);
  const optionScales = useMemo(
    () => [optionScale0, optionScale1, optionScale2, optionScale3],
    [optionScale0, optionScale1, optionScale2, optionScale3]
  );

  const spawnQuestion = useCallback(() => {
    setQuestion(generateQuestion(gameState.currentQuestion + 1, difficulty));
    setSelectedIndex(null);
    setFeedback(null);
  }, [gameState.currentQuestion, difficulty]);

  useEffect(() => {
    spawnQuestion();
  }, [spawnQuestion]);

  useEffect(() => {
    targetPulse.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    blobOne.value = withRepeat(
      withTiming(1, { duration: 9000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
    blobTwo.value = withRepeat(
      withTiming(1, { duration: 11000, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true
    );
    blobThree.value = withRepeat(
      withTiming(1, { duration: 13000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [blobOne, blobTwo, blobThree, targetPulse]);

  const finishQuestion = useCallback((isCorrect: boolean) => {
    const isLast = gameState.currentQuestion + 1 >= gameState.totalQuestions;
    const baseScore = difficulty === 'HARD' ? 90 : difficulty === 'MEDIUM' ? 70 : 50;
    const streakBonus = Math.min(gameState.streak * 6, 30);

    setGameState(prev => ({
      ...prev,
      score: prev.score + (isCorrect ? baseScore + streakBonus : 0),
      correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
      wrongAnswers: prev.wrongAnswers + (isCorrect ? 0 : 1),
      currentQuestion: prev.currentQuestion + 1,
      streak: isCorrect ? prev.streak + 1 : 0,
      ...(isLast ? { phase: 'FINISHED' as const } : {}),
    }));

    if (!isLast) {
      setTimeout(spawnQuestion, 600);
    }
  }, [difficulty, gameState.currentQuestion, gameState.streak, gameState.totalQuestions, setGameState, spawnQuestion]);

  const handleSelect = useCallback((index: number) => {
    if (!question || feedback !== null) return;
    setSelectedIndex(index);

    const isCorrect = index === question.correctIndex;
    if (isCorrect) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setFeedback('correct');
      sparkleScale.value = 0.4;
      sparkleOpacity.value = 0.9;
      sparkleScale.value = withSequence(
        withTiming(1.1, { duration: 240, easing: Easing.out(Easing.quad) }),
        withTiming(1.6, { duration: 260, easing: Easing.out(Easing.quad) })
      );
      sparkleOpacity.value = withTiming(0, { duration: 400 });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setFeedback('wrong');
    }

    optionScales[index].value = withSequence(withSpring(1.1), withTiming(1));
    feedbackScale.value = withSequence(withSpring(1.1), withTiming(0));
    finishQuestion(isCorrect);
  }, [question, feedback, finishQuestion, optionScales, feedbackScale, sparkleOpacity, sparkleScale]);

  const feedbackStyle = useAnimatedStyle(() => ({
    transform: [{ scale: feedbackScale.value }],
    opacity: feedbackScale.value,
  }));

  const targetPulseStyle = useAnimatedStyle(() => {
    const scale = interpolate(targetPulse.value, [0, 1], [0.9, 1.2]);
    const opacity = interpolate(targetPulse.value, [0, 1], [0.25, 0.5]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const sparkleStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
    transform: [
      { scale: sparkleScale.value },
      { rotate: `${interpolate(sparkleScale.value, [0, 1.6], [0, 35])}deg` },
    ],
  }));

  const blobOneStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(blobOne.value, [0, 1], [-60, 80]) },
      { translateY: interpolate(blobOne.value, [0, 1], [-40, 70]) },
      { scale: interpolate(blobOne.value, [0, 1], [0.9, 1.15]) },
    ],
    opacity: interpolate(blobOne.value, [0, 1], [0.35, 0.55]),
  }));

  const blobTwoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(blobTwo.value, [0, 1], [70, -50]) },
      { translateY: interpolate(blobTwo.value, [0, 1], [-10, 60]) },
      { scale: interpolate(blobTwo.value, [0, 1], [1, 0.85]) },
    ],
    opacity: interpolate(blobTwo.value, [0, 1], [0.25, 0.45]),
  }));

  const blobThreeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(blobThree.value, [0, 1], [-40, 30]) },
      { translateY: interpolate(blobThree.value, [0, 1], [60, -40]) },
      { scale: interpolate(blobThree.value, [0, 1], [0.8, 1.1]) },
    ],
    opacity: interpolate(blobThree.value, [0, 1], [0.2, 0.4]),
  }));

  if (!question) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Hazırlanıyor...</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <View style={styles.backgroundLayer} pointerEvents="none">
        <Animated.View style={[styles.blob, styles.blobOne, blobOneStyle]} />
        <Animated.View style={[styles.blob, styles.blobTwo, blobTwoStyle]} />
        <Animated.View style={[styles.blob, styles.blobThree, blobThreeStyle]} />
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Hedef Renk</Text>
          <View style={styles.targetWrapper}>
            <Animated.View style={[styles.targetPulse, targetPulseStyle]} />
            <Animated.View style={[styles.sparkle, sparkleStyle]} />
            <View style={[styles.targetSwatch, { backgroundColor: question.target }]} />
          </View>
          <Text style={styles.subtitle}>Aynı rengi seç</Text>
        </View>

        <View style={styles.options}>
          {question.options.map((color, index) => {
            const isSelected = selectedIndex === index;
            const isCorrect = !!feedback && index === question.correctIndex;
            const isWrong = feedback === 'wrong' && isSelected && index !== question.correctIndex;

            return (
              <ColorOption
                key={`${color}-${index}`}
                color={color}
                scale={optionScales[index]}
                isSelected={isSelected}
                isCorrect={isCorrect}
                isWrong={isWrong}
                onPress={() => handleSelect(index)}
              />
            );
          })}
        </View>

        <Animated.View pointerEvents="none" style={[styles.feedbackOverlay, feedbackStyle]}>
          <Text style={styles.feedbackEmoji}>
            {feedback === 'correct' ? '✅' : feedback === 'wrong' ? '❌' : ''}
          </Text>
        </Animated.View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  blob: {
    position: 'absolute',
    width: BLOB_SIZE,
    height: BLOB_SIZE,
    borderRadius: BLOB_SIZE / 2,
  },
  blobOne: {
    top: -60,
    left: -80,
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
  },
  blobTwo: {
    bottom: -80,
    right: -60,
    backgroundColor: 'rgba(248, 113, 113, 0.3)',
  },
  blobThree: {
    top: 160,
    right: -120,
    backgroundColor: 'rgba(236, 72, 153, 0.25)',
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: 14,
    marginTop: 10,
  },
  targetWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetPulse: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  sparkle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: 'rgba(250, 204, 21, 0.85)',
  },
  targetSwatch: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#1e293b',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  optionButton: {
    width: 70,
    height: 70,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#1e293b',
  },
  optionSelected: {
    borderColor: '#e2e8f0',
  },
  optionCorrect: {
    borderColor: '#22c55e',
  },
  optionWrong: {
    borderColor: '#ef4444',
  },
  feedbackOverlay: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  feedbackEmoji: {
    fontSize: 64,
  },
  progressContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    marginTop: 'auto',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#f97316',
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

export default ArtExamGame;

