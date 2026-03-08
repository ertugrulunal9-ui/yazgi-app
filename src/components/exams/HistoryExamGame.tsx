import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Haptics } from '../../utils/haptics';
import { tRuntime } from '../../i18n/strings';
import { Difficulty, GameState } from './MiniGameContainer';
import seenQuestionsTracker from '../../utils/seenQuestionsTracker';
import { balanceCorrectAnswerDistribution } from './questionOptionBalancer';
import { HistoryQuestion, QuestionType as HistoryQuestionType, getQuestionPool } from '../../i18n/exams/historyQuestions';

type QuestionType = HistoryQuestionType;

interface HistoryExamGameProps {
    gameState?: GameState;
    setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
    difficulty?: Difficulty;
    age?: number;
}

const QUESTION_TYPE_KEY_MAP: Record<QuestionType, string> = {
    DATE: 'date',
    PERSON: 'person',
    EVENT: 'event',
    PLACE: 'place',
    ORDER: 'order',
};
const getQuestionTypeEmoji = (type: QuestionType): string => {
    switch (type) {
        case 'DATE': return '📅';
        case 'PERSON': return '👤';
        case 'EVENT': return '⚔️';
        case 'PLACE': return '📍';
        case 'ORDER': return '🔢';
    }
};

const getQuestionTypeTitle = (type: QuestionType): string => (
    tRuntime(`exams.history.questionTypes.${QUESTION_TYPE_KEY_MAP[type]}`)
);

const HistoryExamGame: React.FC<HistoryExamGameProps> = ({
    gameState,
    setGameState,
    difficulty = 'MEDIUM',
    age = 10,
}) => {
    if (!gameState || !setGameState) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{tRuntime('exams.history.loading')}</Text>
            </View>
        );
    }

    const [currentQuestion, setCurrentQuestion] = useState<HistoryQuestion | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [questions, setQuestions] = useState<HistoryQuestion[]>([]);
    const [questionIndex, setQuestionIndex] = useState(0);

    const shakeX = useSharedValue(0);
    const feedbackScale = useSharedValue(0);

    useEffect(() => {
        const loadQuestions = async () => {
            const pool = getQuestionPool(age, difficulty);
            // Görülmemiş sorulardan seç, yetmezse görülmüşlerden tamamla
            const selected = await seenQuestionsTracker.selectQuestionsForExam(
                'history',
                pool,
                gameState.totalQuestions
            );
            const balancedQuestions = balanceCorrectAnswerDistribution(selected);
            setQuestions(balancedQuestions);
            if (balancedQuestions.length > 0) {
                setCurrentQuestion(balancedQuestions[0]);
                // Seçilen soruları görüldü olarak işaretle
                await seenQuestionsTracker.markQuestionsAsSeen(
                    'history',
                    selected.map(q => q.id)
                );
            }
        };
        loadQuestions();
    }, [age, difficulty, gameState.totalQuestions]);

    // Cevabı onayla (doğrudan seçilen index ile)
    const confirmAnswer = useCallback((optionIndex: number) => {
        if (!currentQuestion) return;

        const isCorrect = optionIndex === currentQuestion.correctIndex;
        const isLastQuestion = questionIndex + 1 >= questions.length;

        if (isCorrect) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setFeedback('correct');

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

            feedbackScale.value = withSequence(withSpring(1.2), withSpring(0));
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setFeedback('wrong');

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
        }

        if (!isLastQuestion) {
            setTimeout(() => {
                const nextIndex = questionIndex + 1;
                setQuestionIndex(nextIndex);
                setCurrentQuestion(questions[nextIndex]);
                setSelectedOption(null);
                setFeedback(null);
            }, isCorrect ? 800 : 1200);
        }
    }, [currentQuestion, questionIndex, questions, gameState.streak, difficulty, setGameState, feedbackScale, shakeX]);

    // Seçenek seçildiğinde - Otomatik onayla
    const handleOptionSelect = useCallback((optionIndex: number) => {
        if (feedback !== null || !currentQuestion) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedOption(optionIndex);
        setTimeout(() => { confirmAnswer(optionIndex); }, 300);
    }, [feedback, currentQuestion, confirmAnswer]);

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
                <Text style={styles.loadingText}>{tRuntime('exams.history.preparing')}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Progress - En üstte göster */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${((questionIndex + 1) / questions.length) * 100}%` }]} />
                </View>
                <Text style={styles.progressText}>{questionIndex + 1} / {questions.length}</Text>
            </View>

            <View style={styles.typeBadge}>
                <Text style={styles.typeEmoji}>{getQuestionTypeEmoji(currentQuestion.type)}</Text>
                <Text style={styles.typeText}>{getQuestionTypeTitle(currentQuestion.type)}</Text>
            </View>

            <Animated.View style={[styles.questionContainer, shakeAnimatedStyle]}>
                <Text style={styles.questionText}>{currentQuestion.question}</Text>
            </Animated.View>

            <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedOption === index;
                    const isCorrectOption = currentQuestion.correctIndex === index;
                    const showCorrect = feedback === 'wrong' && isCorrectOption;
                    const showWrong = feedback === 'wrong' && isSelected && !isCorrectOption;
                    const showSuccess = feedback === 'correct' && isSelected;

                    return (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.optionButton,
                                isSelected && !feedback && styles.optionSelected,
                                showSuccess && styles.optionCorrect,
                                showWrong && styles.optionWrong,
                                showCorrect && styles.optionShowCorrect,
                            ]}
                            onPress={() => handleOptionSelect(index)}
                            disabled={feedback !== null}
                        >
                            <View style={styles.optionLetter}>
                                <Text style={[
                                    styles.optionLetterText,
                                    isSelected && !feedback && styles.optionLetterSelected,
                                    (showSuccess || showCorrect) && styles.optionLetterCorrect,
                                    showWrong && styles.optionLetterWrong,
                                ]}>
                                    {String.fromCharCode(65 + index)}
                                </Text>
                            </View>
                            <Text style={[
                                styles.optionText,
                                isSelected && !feedback && styles.optionTextSelected,
                                (showSuccess || showCorrect) && styles.optionTextCorrect,
                                showWrong && styles.optionTextWrong,
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* Onayla butonu kaldırıldı - otomatik onaylama */}

            {feedback === 'wrong' && (
                <View style={styles.explanationContainer}>
                    <Text style={styles.explanationText}>
                        {tRuntime('exams.history.correctAnswer', { answer: currentQuestion.options[currentQuestion.correctIndex] })}
                    </Text>
                </View>
            )}

            <Animated.View pointerEvents="none" style={[styles.feedbackOverlay, feedbackAnimatedStyle]}>
                <Text style={styles.feedbackEmoji}>
                    {feedback === 'correct' ? '✅' : '❌'}
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, minHeight: 400, backgroundColor: '#0f172a', padding: 16, paddingBottom: 24 },
    loadingContainer: { flex: 1, minHeight: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' },
    loadingText: { color: '#94a3b8', fontSize: 16 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', backgroundColor: '#1e293b', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 16, gap: 8 },
    typeEmoji: { fontSize: 18 },
    typeText: { color: '#94a3b8', fontSize: 14, fontWeight: '600' },
    questionContainer: { backgroundColor: '#1e293b', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
    questionText: { color: '#fff', fontSize: 18, fontWeight: '600', textAlign: 'center', lineHeight: 26 },
    optionsContainer: { gap: 12 },
    optionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', borderRadius: 12, padding: 16, borderWidth: 2, borderColor: '#334155', gap: 12 },
    optionSelected: { borderColor: '#ec4899', backgroundColor: 'rgba(236, 72, 153, 0.1)' },
    optionCorrect: { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    optionWrong: { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    optionShowCorrect: { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.15)' },
    optionLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
    optionLetterText: { color: '#94a3b8', fontSize: 14, fontWeight: '700' },
    optionLetterSelected: { color: '#ec4899' },
    optionLetterCorrect: { color: '#10b981' },
    optionLetterWrong: { color: '#ef4444' },
    optionText: { flex: 1, color: '#e2e8f0', fontSize: 16, fontWeight: '500' },
    optionTextSelected: { color: '#ec4899' },
    optionTextCorrect: { color: '#10b981' },
    optionTextWrong: { color: '#ef4444' },
    confirmButton: { backgroundColor: '#ec4899', borderRadius: 12, padding: 16, marginTop: 20, alignItems: 'center' },
    confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    explanationContainer: { backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 12, borderRadius: 8, marginTop: 16 },
    explanationText: { color: '#fca5a5', fontSize: 14, textAlign: 'center', fontWeight: '600' },
    feedbackOverlay: { position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center' },
    feedbackEmoji: { fontSize: 64 },
    progressContainer: { marginBottom: 12 },
    progressBar: { height: 8, backgroundColor: '#334155', borderRadius: 4, marginBottom: 8 },
    progressFill: { height: '100%', backgroundColor: '#ec4899', borderRadius: 4 },
    progressText: { color: '#94a3b8', textAlign: 'center', fontSize: 14 },
});

export default HistoryExamGame;
