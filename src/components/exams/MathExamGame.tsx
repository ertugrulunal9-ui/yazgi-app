import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSequence,
    withSpring,
    Easing,
    runOnJS,
    cancelAnimation,
} from 'react-native-reanimated';
import { Haptics } from '../../utils/haptics';
import { tRuntime } from '../../i18n/strings';
import type { Difficulty, GameState } from './MiniGameContainer';
import {
    clampHorizontalPosition,
    DEFAULT_EXAM_AREA_HEIGHT,
    DEFAULT_EXAM_AREA_WIDTH,
    getRandomHorizontalPosition,
    getVerticalTravelTarget,
} from './layoutHelpers';

interface MathQuestion {
    id: number;
    num1: number;
    num2: number;
    operator: '+' | '-' | '×' | '÷';
    answer: number;
    x: number;
}

const FALL_START_Y = -120;
const BALLOON_WIDTH_ESTIMATE = 132;
const BALLOON_HEIGHT_ESTIMATE = 84;
const BALLOON_SIDE_PADDING = 16;
const BALLOON_BOTTOM_SPACING = 16;
const BALLOON_MIN_TRAVEL_TARGET = 140;

interface MathExamGameProps {
    gameState?: GameState;
    setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
    difficulty?: Difficulty;
    age?: number;
}

// Yaş gruplarına göre matematik ayarları
interface MathConfig {
    maxNum: { EASY: number; MEDIUM: number; HARD: number };
    operators: { EASY: ('+' | '-' | '×' | '÷')[]; MEDIUM: ('+' | '-' | '×' | '÷')[]; HARD: ('+' | '-' | '×' | '÷')[] };
    multiplyMax: number;
    divideMax: number;
}

const MATH_CONFIG_BY_AGE: Record<string, MathConfig> = {
    // 6-8 yaş (ilkokul 1-2)
    YOUNG: {
        maxNum: { EASY: 15, MEDIUM: 25, HARD: 30 },
        operators: { EASY: ['+', '-'], MEDIUM: ['+', '-', '×'], HARD: ['+', '-', '×'] },
        multiplyMax: 7,
        divideMax: 5,
    },
    // 9-11 yaş (ilkokul 3-5)
    MIDDLE: {
        maxNum: { EASY: 30, MEDIUM: 75, HARD: 150 },
        operators: { EASY: ['+', '-'], MEDIUM: ['+', '-', '×'], HARD: ['+', '-', '×', '÷'] },
        multiplyMax: 12,
        divideMax: 12,
    },
    // 12-14 yaş (ortaokul)
    ADVANCED: {
        maxNum: { EASY: 75, MEDIUM: 150, HARD: 300 },
        operators: { EASY: ['+', '-', '×'], MEDIUM: ['+', '-', '×', '÷'], HARD: ['+', '-', '×', '÷'] },
        multiplyMax: 15,
        divideMax: 15,
    },
    // 15+ yaş (lise)
    EXPERT: {
        maxNum: { EASY: 150, MEDIUM: 350, HARD: 750 },
        operators: { EASY: ['+', '-', '×'], MEDIUM: ['+', '-', '×', '÷'], HARD: ['+', '-', '×', '÷'] },
        multiplyMax: 20,
        divideMax: 20,
    },
};

const getMathConfig = (age: number): MathConfig => {
    if (age <= 8) return MATH_CONFIG_BY_AGE.YOUNG;
    if (age <= 11) return MATH_CONFIG_BY_AGE.MIDDLE;
    if (age <= 14) return MATH_CONFIG_BY_AGE.ADVANCED;
    return MATH_CONFIG_BY_AGE.EXPERT;
};

const scaleHardValue = (difficulty: Difficulty, value: number, factor: number, minValue: number): number => {
    if (difficulty !== 'HARD') return value;
    return Math.max(minValue, Math.floor(value * factor));
};

// Generate a math question based on difficulty and age
const generateQuestion = (
    difficulty: Difficulty,
    age: number,
    id: number,
    areaWidth: number
): MathQuestion => {
    let num1: number, num2: number, operator: '+' | '-' | '×' | '÷', answer: number;

    const config = getMathConfig(age);
    const maxNum = scaleHardValue(difficulty, config.maxNum[difficulty], 0.55, 25);
    const multiplyMax = scaleHardValue(difficulty, config.multiplyMax, 0.7, 8);
    const divideMax = scaleHardValue(difficulty, config.divideMax, 0.7, 6);
    const operators = config.operators[difficulty];

    operator = operators[Math.floor(Math.random() * operators.length)];

    switch (operator) {
        case '+':
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * maxNum) + 1;
            answer = num1 + num2;
            break;
        case '-':
            num1 = Math.floor(Math.random() * maxNum) + Math.floor(maxNum / 2);
            num2 = Math.floor(Math.random() * Math.min(num1, maxNum)) + 1;
            answer = num1 - num2;
            break;
        case '×':
            num1 = Math.floor(Math.random() * multiplyMax) + 1;
            num2 = Math.floor(Math.random() * multiplyMax) + 1;
            answer = num1 * num2;
            break;
        case '÷':
            num2 = Math.floor(Math.random() * divideMax) + 1;
            answer = Math.floor(Math.random() * divideMax) + 1;
            num1 = num2 * answer;
            break;
        default:
            num1 = 1; num2 = 1; answer = 2;
    }

    const x = getRandomHorizontalPosition(areaWidth, BALLOON_WIDTH_ESTIMATE, BALLOON_SIDE_PADDING);

    return { id, num1, num2, operator, answer, x };
};

// Falling Balloon Component
const FallingBalloon: React.FC<{
    question: MathQuestion;
    onMissed: () => void;
    speed: number;
    isActive: boolean;
    travelY: number;
}> = ({ question, onMissed, speed, isActive, travelY }) => {
    const translateY = useSharedValue(FALL_START_Y);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    useEffect(() => {
        if (!isActive) return;

        translateY.value = withTiming(
            travelY,
            {
                duration: speed,
                easing: Easing.linear,
            },
            (finished) => {
                if (finished) {
                    runOnJS(onMissed)();
                }
            }
        );

        return () => {
            cancelAnimation(translateY);
        };
    }, [isActive, onMissed, speed, travelY, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value },
        ],
        opacity: opacity.value,
        left: question.x,
    }));

    return (
        <Animated.View style={[styles.balloon, animatedStyle]}>
            <View style={styles.balloonInner}>
                <Text style={styles.questionText}>
                    {question.num1} {question.operator} {question.num2}
                </Text>
            </View>
            <View style={styles.balloonTail} />
        </Animated.View>
    );
};

// Main Math Exam Game
const MathExamGame: React.FC<MathExamGameProps> = ({
    gameState,
    setGameState,
    difficulty = 'MEDIUM',
    age = 10,
}) => {
    // Guard: Props injected by MiniGameContainer via cloneElement
    if (!gameState || !setGameState) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{tRuntime('exams.math.loading')}</Text>
            </View>
        );
    }

    const [currentQuestion, setCurrentQuestion] = useState<MathQuestion | null>(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [questionId, setQuestionId] = useState(0);
    const hasInitialized = useRef(false);
    const [gameAreaSize, setGameAreaSize] = useState({
        width: DEFAULT_EXAM_AREA_WIDTH,
        height: DEFAULT_EXAM_AREA_HEIGHT,
    });

    const inputRef = useRef<TextInput>(null);
    const shakeX = useSharedValue(0);
    const feedbackScale = useSharedValue(0);
    const balloonTravelTarget = getVerticalTravelTarget(
        gameAreaSize.height,
        BALLOON_HEIGHT_ESTIMATE,
        BALLOON_BOTTOM_SPACING,
        BALLOON_MIN_TRAVEL_TARGET
    );

    const handleGameAreaLayout = useCallback((event: { nativeEvent: { layout: { width: number; height: number } } }) => {
        const { width, height } = event.nativeEvent.layout;
        setGameAreaSize(prev => {
            if (Math.abs(prev.width - width) < 1 && Math.abs(prev.height - height) < 1) {
                return prev;
            }
            return { width, height };
        });
    }, []);

    // Calculate balloon speed based on difficulty
    const getBalloonSpeed = useCallback(() => {
        const baseSpeed = difficulty === 'EASY' ? 6500 : difficulty === 'MEDIUM' ? 5000 : 4200;
        // Speed up as game progresses
        const progressPenalty = gameState.currentQuestion * (difficulty === 'HARD' ? 60 : 110);
        const minSpeed = difficulty === 'HARD' ? 3400 : 2600;
        return Math.max(baseSpeed - progressPenalty, minSpeed);
    }, [difficulty, gameState.currentQuestion]);

    // Generate new question
    const generateNewQuestion = useCallback(() => {
        if (gameState.currentQuestion >= gameState.totalQuestions) {
            setGameState(prev => ({ ...prev, phase: 'FINISHED' }));
            return;
        }

        const newQuestion = generateQuestion(difficulty, age, questionId, gameAreaSize.width);
        setCurrentQuestion(newQuestion);
        setQuestionId(prev => prev + 1);
        setUserAnswer('');
        setFeedback(null);
        // Focus is handled by useEffect when feedback becomes null
    }, [gameAreaSize.width, gameState.currentQuestion, gameState.totalQuestions, difficulty, age, questionId, setGameState]);

    // Start with first question
    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;
        generateNewQuestion();
    }, [generateNewQuestion]);

    // Re-focus input when feedback is cleared and we have a new question
    useEffect(() => {
        if (feedback !== null || !currentQuestion) return;

        const timer = setTimeout(() => {
            inputRef.current?.focus();
        }, 150);
        return () => clearTimeout(timer);
    }, [feedback, currentQuestion]);

    useEffect(() => {
        setCurrentQuestion(prev => {
            if (!prev) return prev;
            const nextX = clampHorizontalPosition(
                prev.x,
                gameAreaSize.width,
                BALLOON_WIDTH_ESTIMATE,
                BALLOON_SIDE_PADDING
            );
            return nextX === prev.x ? prev : { ...prev, x: nextX };
        });
    }, [gameAreaSize.width]);

    // Handle answer submission
    const handleSubmit = useCallback(() => {
        if (!currentQuestion || !userAnswer.trim()) return;

        const numAnswer = parseInt(userAnswer, 10);
        const isCorrect = numAnswer === currentQuestion.answer;
        const isLastQuestion = gameState.currentQuestion + 1 >= gameState.totalQuestions;

        if (isCorrect) {
            // Correct answer!
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setFeedback('correct');

            // Calculate score with streak bonus
            const streakBonus = Math.min(gameState.streak * 10, 50);
            const baseScore = difficulty === 'HARD' ? 100 : difficulty === 'MEDIUM' ? 75 : 50;

            setGameState(prev => ({
                ...prev,
                score: prev.score + baseScore + streakBonus,
                correctAnswers: prev.correctAnswers + 1,
                currentQuestion: prev.currentQuestion + 1,
                streak: prev.streak + 1,
                ...(isLastQuestion ? { phase: 'FINISHED' as const } : {}),
            }));

            // Feedback animation
            feedbackScale.value = withSequence(
                withSpring(1.2),
                withSpring(0)
            );

            // Next question (only if not last)
            if (!isLastQuestion) {
                setTimeout(generateNewQuestion, 800);
            }

        } else {
            // Wrong answer
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setFeedback('wrong');

            // Shake animation
            shakeX.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );

            setGameState(prev => ({
                ...prev,
                wrongAnswers: prev.wrongAnswers + 1,
                currentQuestion: prev.currentQuestion + 1,
                streak: 0,
                ...(isLastQuestion ? { phase: 'FINISHED' as const } : {}),
            }));

            // Next question after showing correct answer (only if not last)
            if (!isLastQuestion) {
                setTimeout(generateNewQuestion, 1200);
            }
        }
    }, [currentQuestion, userAnswer, gameState.streak, gameState.currentQuestion, gameState.totalQuestions, difficulty, feedbackScale, generateNewQuestion, setGameState, shakeX]);

    // Handle balloon missed (time out)
    const handleBalloonMissed = useCallback(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setFeedback('wrong');
        const isLastQuestion = gameState.currentQuestion + 1 >= gameState.totalQuestions;

        setGameState(prev => ({
            ...prev,
            wrongAnswers: prev.wrongAnswers + 1,
            currentQuestion: prev.currentQuestion + 1,
            streak: 0,
            ...(isLastQuestion ? { phase: 'FINISHED' as const } : {}),
        }));

        if (!isLastQuestion) {
            setTimeout(generateNewQuestion, 500);
        }
    }, [gameState.currentQuestion, gameState.totalQuestions, generateNewQuestion, setGameState]);

    const shakeAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: shakeX.value }],
    }));

    const feedbackAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: feedbackScale.value }],
        opacity: feedbackScale.value,
    }));

    if (!currentQuestion) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{tRuntime('exams.math.preparing')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Game Area */}
            <View style={styles.gameArea} onLayout={handleGameAreaLayout}>
                <FallingBalloon
                    key={currentQuestion.id}
                    question={currentQuestion}
                    onMissed={handleBalloonMissed}
                    speed={getBalloonSpeed()}
                    isActive={feedback === null}
                    travelY={balloonTravelTarget}
                />

                {/* Feedback overlay */}
                <Animated.View pointerEvents="none" style={[styles.feedbackOverlay, feedbackAnimatedStyle]}>
                    <Text style={styles.feedbackEmoji}>
                        {feedback === 'correct' ? '✅' : '❌'}
                    </Text>
                </Animated.View>
            </View>

            {/* Answer Input */}
            <Animated.View style={[styles.inputContainer, shakeAnimatedStyle]}>
                <TextInput
                    ref={inputRef}
                    style={[
                        styles.input,
                        feedback === 'correct' && styles.inputCorrect,
                        feedback === 'wrong' && styles.inputWrong,
                    ]}
                    value={userAnswer}
                    onChangeText={setUserAnswer}
                    keyboardType="number-pad"
                    placeholder={tRuntime('exams.math.placeholder')}
                    placeholderTextColor="#64748b"
                    onSubmitEditing={handleSubmit}
                    editable={feedback === null}
                    autoFocus
                />

                <TouchableOpacity
                    style={[styles.submitButton, !userAnswer.trim() && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={!userAnswer.trim() || feedback !== null}
                >
                    <Text style={styles.submitButtonText}>✓</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Wrong answer feedback */}
            {feedback === 'wrong' && (
                <View style={styles.wrongAnswerContainer}>
                    <Text style={styles.wrongAnswerText}>
                        {tRuntime('exams.math.correctAnswer', { answer: currentQuestion.answer })}
                    </Text>
                </View>
            )}

            {/* Progress bar */}
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
        height: '100%',
    },
    gameArea: {
        flex: 1,
        minHeight: 200,
        position: 'relative',
        overflow: 'hidden',
    },
    balloon: {
        position: 'absolute',
        alignItems: 'center',
    },
    balloonInner: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 50,
        minWidth: 100,
        alignItems: 'center',
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 8,
    },
    questionText: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
    },
    balloonTail: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#3b82f6',
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        backgroundColor: '#1e293b',
    },
    input: {
        flex: 1,
        backgroundColor: '#0f172a',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        borderWidth: 2,
        borderColor: '#334155',
        textAlign: 'center',
    },
    inputCorrect: {
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    inputWrong: {
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    submitButton: {
        backgroundColor: '#10b981',
        width: 60,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#334155',
    },
    submitButtonText: {
        fontSize: 28,
        color: '#fff',
    },
    wrongAnswerContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        padding: 12,
        alignItems: 'center',
    },
    wrongAnswerText: {
        color: '#ef4444',
        fontSize: 16,
        fontWeight: '600',
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
        backgroundColor: '#3b82f6',
        borderRadius: 4,
    },
    progressText: {
        color: '#94a3b8',
        textAlign: 'center',
        fontSize: 14,
    },
    feedbackOverlay: {
        position: 'absolute',
        top: '40%',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    feedbackEmoji: {
        fontSize: 80,
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

export default MathExamGame;
