import React, { useState, useEffect, useCallback } from 'react';

import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    // withTiming,
    // withSpring,
    // Easing,
} from 'react-native-reanimated';


import { Haptics } from '../../utils/haptics';


// Types
export type ExamType = 'MATH' | 'TURKISH' | 'HISTORY' | 'SCIENCE' | 'GEOGRAPHY' | 'ENGLISH' | 'ART' | 'MUSIC';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface ExamResult {
    type: ExamType;
    finalScore: number;
    correctAnswers: number;
    wrongAnswers: number;
    totalQuestions: number;
    timeSpent: number; // seconds
    gradeBonus: number;
    intelligenceBonus: number;
}


export interface MiniGameContainerProps {
    type: ExamType;
    difficulty: Difficulty;
    age: number;
    onComplete: (result: ExamResult) => void;
    onCancel: () => void;
    children: React.ReactNode;
}

export interface GameState {
    phase: 'INTRO' | 'PLAYING' | 'PAUSED' | 'FINISHED';
    score: number;
    correctAnswers: number;
    wrongAnswers: number;
    currentQuestion: number;
    totalQuestions: number;
    timeRemaining: number;
    streak: number;
}

type MiniGameChildProps = {
    gameState: GameState;
    setGameState: React.Dispatch<React.SetStateAction<GameState>>;
    difficulty: Difficulty;
    age: number;
};

// Calculate grade bonus based on performance
export const calculateBonuses = (
    correctAnswers: number,
    totalQuestions: number,
    _timeSpent: number, // Reserved for future speed bonus calculation
    difficulty: Difficulty
): { gradeBonus: number; intelligenceBonus: number } => {

    const accuracy = correctAnswers / totalQuestions;
    const difficultyMultiplier = difficulty === 'HARD' ? 1.5 : difficulty === 'MEDIUM' ? 1.2 : 1;

    // Grade bonus: 0-15 based on accuracy and difficulty
    const gradeBonus = Math.round(accuracy * 10 * difficultyMultiplier);

    // Intelligence bonus: 1-5 based on performance
    const intelligenceBonus = accuracy >= 0.8 ? Math.round(3 * difficultyMultiplier) : accuracy >= 0.5 ? 2 : 1;

    return { gradeBonus, intelligenceBonus };
};

// Main Container
const MiniGameContainer: React.FC<MiniGameContainerProps> = ({
    type,
    difficulty,
    age,
    onComplete,
    onCancel,
    children,
}) => {
    const [gameState, setGameState] = useState<GameState>({
        phase: 'INTRO',
        score: 0,
        correctAnswers: 0,
        wrongAnswers: 0,

        currentQuestion: 0,
        totalQuestions: getQuestionCount(difficulty, age),
        timeRemaining: getTimeLimit(difficulty),
        streak: 0,
    });

    const [startTime, setStartTime] = useState<number>(0);


    // Animated values - Start visible for debugging
    const containerScale = useSharedValue(1);
    const containerOpacity = useSharedValue(1);

    // Enter animation (temporarily disabled for debugging)
    useEffect(() => {
        // containerScale.value = withSpring(1, { damping: 15 });
        // containerOpacity.value = withTiming(1, { duration: 300 });
    }, [gameState.phase]);


    // Timer
    useEffect(() => {
        if (gameState.phase !== 'PLAYING') return;

        const timer = setInterval(() => {
            setGameState(prev => {
                if (prev.timeRemaining <= 1) {
                    clearInterval(timer);
                    return { ...prev, phase: 'FINISHED', timeRemaining: 0 };
                }
                return { ...prev, timeRemaining: prev.timeRemaining - 1 };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [gameState.phase]);

    // Start game
    const handleStart = useCallback(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setStartTime(Date.now());
        setGameState(prev => ({ ...prev, phase: 'PLAYING' }));
    }, []);

    // Sonuç hesaplama (FINISHED fazında kullanılacak)
    const [examResult, setExamResult] = useState<ExamResult | null>(null);

    // Handle finish - sonuçları hesapla ama onComplete'i çağırma (kullanıcı butona basınca çağrılacak)
    useEffect(() => {
        if (gameState.phase === 'FINISHED' && !examResult) {
            const timeSpent = Math.round((Date.now() - startTime) / 1000);
            const { gradeBonus, intelligenceBonus } = calculateBonuses(
                gameState.correctAnswers,
                gameState.totalQuestions,
                timeSpent,
                difficulty
            );

            Haptics.notificationAsync(
                gameState.correctAnswers >= gameState.totalQuestions * 0.6
                    ? Haptics.NotificationFeedbackType.Success
                    : Haptics.NotificationFeedbackType.Warning
            );

            setExamResult({
                type,
                finalScore: gameState.score,
                correctAnswers: gameState.correctAnswers,
                wrongAnswers: gameState.wrongAnswers,
                totalQuestions: gameState.totalQuestions,
                timeSpent,
                gradeBonus,
                intelligenceBonus,
            });
        }
    }, [gameState.phase, examResult, startTime, gameState.correctAnswers, gameState.totalQuestions, gameState.score, gameState.wrongAnswers, difficulty, type]);

    // Kullanıcı "Devam Et" butonuna bastığında
    const handleFinish = useCallback(() => {
        if (examResult) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onComplete(examResult);
        }
    }, [examResult, onComplete]);

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: containerScale.value }],
        opacity: containerOpacity.value,
    }));

    const getExamTitle = () => {
        switch (type) {
            case 'MATH': return '🔢 Matematik Sınavı';
            case 'TURKISH': return '📝 Türkçe Sınavı';
            case 'HISTORY': return '📜 Tarih Sınavı';
            case 'SCIENCE': return '🔬 Fen Bilgisi Sınavı';
            case 'GEOGRAPHY': return '🗺️ Coğrafya Sınavı';
            case 'ENGLISH': return '🌍 Yabancı Dil Sınavı';
            case 'ART': return '🎨 Görsel Sanatlar Sınavı';
            case 'MUSIC': return '🎵 Müzik Sınavı';
            default: return '📚 Sınav';
        }
    };

    const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

    return (
        <View style={[styles.container, { paddingTop: statusBarHeight }]}>
            <Animated.View style={[styles.gameContainer, containerAnimatedStyle]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{getExamTitle()}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Süre</Text>
                            <Text style={[styles.statValue, gameState.timeRemaining <= 10 && styles.urgentTime]}>
                                {gameState.timeRemaining}s
                            </Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Skor</Text>
                            <Text style={styles.statValue}>{gameState.score}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Doğru</Text>
                            <Text style={styles.statValue}>{gameState.correctAnswers}/{gameState.totalQuestions}</Text>
                        </View>
                    </View>
                </View>

                {/* Intro Screen */}
                {gameState.phase === 'INTRO' && (
                    <View style={styles.introContainer}>
                        <Text style={styles.introEmoji}>📚</Text>
                        <Text style={styles.introTitle}>Sınava Hazır mısın?</Text>
                        <Text style={styles.introDesc}>
                            {gameState.totalQuestions} soru • {gameState.timeRemaining} saniye
                        </Text>
                        <Text style={styles.difficultyBadge}>
                            {difficulty === 'EASY' ? '⭐ Kolay' : difficulty === 'MEDIUM' ? '⭐⭐ Orta' : '⭐⭐⭐ Zor'}
                        </Text>

                        <TouchableOpacity style={styles.startButton} onPress={handleStart}>
                            <Text style={styles.startButtonText}>Başla! 🚀</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
                            <Text style={styles.cancelButtonText}>Vazgeç</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Game Content */}
                {gameState.phase === 'PLAYING' && (
                    <View style={styles.gameContent}>
                        {React.Children.map(children, child => {
                            if (React.isValidElement<Partial<MiniGameChildProps>>(child)) {
                                const injectedProps: MiniGameChildProps = {
                                    gameState,
                                    setGameState,
                                    difficulty,
                                    age,
                                };
                                return React.cloneElement(child, injectedProps);
                            }
                            return null;
                        })}
                    </View>
                )}


                {/* Finished Screen - Sonuç Ekranı */}
                {gameState.phase === 'FINISHED' && examResult && (
                    <View style={styles.finishedContainer}>
                        <Text style={styles.finishedEmoji}>
                            {examResult.correctAnswers >= examResult.totalQuestions * 0.8 ? '🎉' :
                             examResult.correctAnswers >= examResult.totalQuestions * 0.6 ? '👏' :
                             examResult.correctAnswers >= examResult.totalQuestions * 0.4 ? '😊' : '😔'}
                        </Text>
                        <Text style={styles.finishedTitle}>
                            {examResult.correctAnswers >= examResult.totalQuestions * 0.8 ? 'Harika!' :
                             examResult.correctAnswers >= examResult.totalQuestions * 0.6 ? 'İyi İş!' :
                             examResult.correctAnswers >= examResult.totalQuestions * 0.4 ? 'Fena Değil' : 'Daha Çok Çalış'}
                        </Text>

                        <View style={styles.resultStats}>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Doğru</Text>
                                <Text style={[styles.resultValue, { color: '#10b981' }]}>
                                    {examResult.correctAnswers}
                                </Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Yanlış</Text>
                                <Text style={[styles.resultValue, { color: '#ef4444' }]}>
                                    {examResult.wrongAnswers}
                                </Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Başarı</Text>
                                <Text style={styles.resultValue}>
                                    %{Math.round((examResult.correctAnswers / examResult.totalQuestions) * 100)}
                                </Text>
                            </View>
                            <View style={styles.resultRow}>
                                <Text style={styles.resultLabel}>Not Bonusu</Text>
                                <Text style={[styles.resultValue, { color: '#3b82f6' }]}>
                                    +{examResult.gradeBonus}
                                </Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
                            <Text style={styles.finishButtonText}>Devam Et ✨</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Streak indicator */}
                {gameState.streak >= 3 && gameState.phase === 'PLAYING' && (
                    <View style={styles.streakBadge}>
                        <Text style={styles.streakText}>🔥 {gameState.streak} Seri!</Text>
                    </View>
                )}
            </Animated.View>
        </View>
    );
};

// Helper functions
function getQuestionCount(difficulty: Difficulty, age: number): number {
    // Yaş gruplarına göre soru sayısı:
    // 6-8 yaş (ilkokul 1-2): Daha az soru
    // 9-11 yaş (ilkokul 3-5): Orta seviye
    // 12-14 yaş (ortaokul): Daha fazla soru
    // 15+ yaş (lise): En çok soru

    let base: number;
    if (age <= 8) {
        // İlkokul 1-2
        base = difficulty === 'EASY' ? 4 : difficulty === 'MEDIUM' ? 5 : 6;
    } else if (age <= 11) {
        // İlkokul 3-5
        base = difficulty === 'EASY' ? 5 : difficulty === 'MEDIUM' ? 7 : 8;
    } else if (age <= 14) {
        // Ortaokul
        base = difficulty === 'EASY' ? 6 : difficulty === 'MEDIUM' ? 8 : 10;
    } else {
        // Lise
        base = difficulty === 'EASY' ? 6 : difficulty === 'MEDIUM' ? 10 : 12;
    }

    return base;
}

function getTimeLimit(difficulty: Difficulty): number {
    // Soru başına ortalama süre: EASY ~15sn, MEDIUM ~10sn, HARD ~12sn
    switch (difficulty) {
        case 'EASY': return 90;    // 5-6 soru için 90 saniye
        case 'MEDIUM': return 90;  // 8-9 soru için 90 saniye
        case 'HARD': return 120;   // 10-11 soru için 120 saniye
    }
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        paddingTop: 40,
        paddingBottom: 20,
        paddingHorizontal: 12,
        zIndex: 9999,
    },
    gameContainer: {
        flex: 1,
        width: '100%',
        maxWidth: 420,
        alignSelf: 'center',
        backgroundColor: '#1a1a2e',
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: '#3b82f6',
    },
    header: {
        backgroundColor: '#16213e',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#3b82f6',
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 12,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 2,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    urgentTime: {
        color: '#ef4444',
    },
    introContainer: {
        padding: 32,
        alignItems: 'center',
        minHeight: 300,
    },
    introEmoji: {
        fontSize: 64,
        marginBottom: 16,
    },
    introTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 8,
    },
    introDesc: {
        fontSize: 16,
        color: '#94a3b8',
        marginBottom: 12,
    },
    difficultyBadge: {
        fontSize: 14,
        color: '#fbbf24',
        backgroundColor: 'rgba(251, 191, 36, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        marginBottom: 24,
    },
    startButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 48,
        paddingVertical: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    startButtonText: {
        fontSize: 20,
        fontWeight: '800',
        color: '#fff',
    },
    cancelButton: {
        paddingVertical: 12,
    },
    cancelButtonText: {
        fontSize: 16,
        color: '#94a3b8',
    },
    gameContent: {
        flex: 1,
    },
    gameContentInner: {
        flexGrow: 1,
        minHeight: 350,
        paddingBottom: 16,
    },
    streakBadge: {
        position: 'absolute',
        top: 80,
        right: 16,
        backgroundColor: '#f97316',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    streakText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff',
    },
    // Finished screen styles
    finishedContainer: {
        padding: 24,
        alignItems: 'center',
        minHeight: 350,
    },
    finishedEmoji: {
        fontSize: 64,
        marginBottom: 12,
    },
    finishedTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 24,
    },
    resultStats: {
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
    },
    resultRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    },
    resultLabel: {
        fontSize: 16,
        color: '#94a3b8',
    },
    resultValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    finishButton: {
        backgroundColor: '#10b981',
        paddingHorizontal: 48,
        paddingVertical: 16,
        borderRadius: 16,
    },
    finishButtonText: {
        fontSize: 18,
        fontWeight: '800',
        color: '#fff',
    },
});

export default MiniGameContainer;
