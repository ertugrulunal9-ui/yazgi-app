import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Difficulty, GameState } from './MiniGameContainer';
import seenQuestionsTracker from '../../utils/seenQuestionsTracker';

type QuestionType = 'SYNONYM' | 'ANTONYM' | 'MEANING' | 'FILL_BLANK' | 'SPELLING';

interface TurkishQuestion {
    id: string;
    type: QuestionType;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

interface TurkishExamGameProps {
    gameState?: GameState;
    setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
    difficulty?: Difficulty;
    age?: number;
}

// Soru havuzları - Yaşa göre (Genişletilmiş) - Benzersiz ID'ler ile
const QUESTIONS_BY_AGE: Record<string, TurkishQuestion[]> = {
    // 6-8 yaş - Temel seviye
    YOUNG: [
        // Eş anlamlı - daha yakın çeldiriciler
        { id: 'tur_y_1', type: 'SYNONYM', question: '"Güzel" kelimesinin eş anlamlısı nedir?', options: ['Sevimli', 'Hoş', 'Tatlı', 'Şirin'], correctIndex: 1 },
        { id: 'tur_y_2', type: 'SYNONYM', question: '"Büyük" kelimesinin eş anlamlısı nedir?', options: ['Geniş', 'İri', 'Uzun', 'Kocaman'], correctIndex: 1 },
        { id: 'tur_y_3', type: 'SYNONYM', question: '"Hızlı" kelimesinin eş anlamlısı nedir?', options: ['Atik', 'Çabuk', 'Aceleci', 'Koşan'], correctIndex: 1 },
        { id: 'tur_y_4', type: 'SYNONYM', question: '"Mutlu" kelimesinin eş anlamlısı nedir?', options: ['Neşeli', 'Sevinçli', 'Güler yüzlü', 'Şen'], correctIndex: 1 },
        { id: 'tur_y_5', type: 'SYNONYM', question: '"Cesur" kelimesinin eş anlamlısı nedir?', options: ['Güçlü', 'Yürekli', 'Atılgan', 'Sert'], correctIndex: 1 },
        { id: 'tur_y_6', type: 'SYNONYM', question: '"Korkak" kelimesinin eş anlamlısı nedir?', options: ['Çekingen', 'Ürkek', 'Sessiz', 'Sakin'], correctIndex: 1 },
        // Zıt anlamlı - birbirine yakın seçenekler
        { id: 'tur_y_7', type: 'ANTONYM', question: '"Sıcak" kelimesinin zıt anlamlısı nedir?', options: ['Ilık', 'Soğuk', 'Serin', 'Buz gibi'], correctIndex: 1 },
        { id: 'tur_y_8', type: 'ANTONYM', question: '"Dolu" kelimesinin zıt anlamlısı nedir?', options: ['Boş', 'Eksik', 'Az', 'Yarım'], correctIndex: 0 },
        { id: 'tur_y_9', type: 'ANTONYM', question: '"Kalın" kelimesinin zıt anlamlısı nedir?', options: ['İnce', 'Dar', 'Hafif', 'Kısa'], correctIndex: 0 },
        { id: 'tur_y_10', type: 'ANTONYM', question: '"Doğru" kelimesinin zıt anlamlısı nedir?', options: ['Yanlış', 'Eksik', 'Bozuk', 'Farklı'], correctIndex: 0 },
        { id: 'tur_y_11', type: 'ANTONYM', question: '"Tembel" kelimesinin zıt anlamlısı nedir?', options: ['Hızlı', 'Çalışkan', 'Güçlü', 'Akıllı'], correctIndex: 1 },
        { id: 'tur_y_12', type: 'ANTONYM', question: '"Derin" kelimesinin zıt anlamlısı nedir?', options: ['Sığ', 'Kısa', 'Dar', 'Alçak'], correctIndex: 0 },
        // Anlam - daha zorlayıcı
        { id: 'tur_y_13', type: 'MEANING', question: '"Mevsim" ne demektir?', options: ['Ay', 'Yılın dört bölümü', 'Hafta', 'Gün'], correctIndex: 1 },
        { id: 'tur_y_14', type: 'MEANING', question: '"Orman" ne demektir?', options: ['Çiçek bahçesi', 'Ağaçlık alan', 'Yeşil tarla', 'Park'], correctIndex: 1 },
        { id: 'tur_y_15', type: 'MEANING', question: '"Masal" ne demektir?', options: ['Gerçek hikaye', 'Hayal ürünü öykü', 'Şarkı sözü', 'Şiir'], correctIndex: 1 },
        { id: 'tur_y_16', type: 'MEANING', question: '"Ufuk" ne demektir?', options: ['Gökyüzü', 'Gök ile yerin birleştiği çizgi', 'Deniz', 'Bulut'], correctIndex: 1 },
        // Boşluk doldurma - bağlam gerektiren
        { id: 'tur_y_17', type: 'FILL_BLANK', question: '"Bahçedeki çiçekler ___ açtı."', options: ['güzelce', 'yavaşça', 'rengarenk', 'sessizce'], correctIndex: 2 },
        { id: 'tur_y_18', type: 'FILL_BLANK', question: '"Yağmur yağınca sokaklar ___ oldu."', options: ['ıslak', 'soğuk', 'karanlık', 'sessiz'], correctIndex: 0 },
        { id: 'tur_y_19', type: 'FILL_BLANK', question: '"Kardeşim ___ ağladı çünkü oyuncağı kırıldı."', options: ['sessizce', 'hüngür hüngür', 'yavaşça', 'biraz'], correctIndex: 1 },
        { id: 'tur_y_20', type: 'FILL_BLANK', question: '"Öğretmen, öğrencilere sabırla ___ ."', options: ['baktı', 'anlattı', 'sordu', 'güldü'], correctIndex: 1 },
        { id: 'tur_y_21', type: 'SYNONYM', question: '"Güçlü" kelimesinin eş anlamlısı nedir?', options: ['Kuvvetli', 'Sağlam', 'Dayanıklı', 'Sert'], correctIndex: 0 },
        { id: 'tur_y_22', type: 'ANTONYM', question: '"Taze" kelimesinin zıt anlamlısı nedir?', options: ['Bayat', 'Eski', 'Kuru', 'Bozuk'], correctIndex: 0 },
        { id: 'tur_y_23', type: 'MEANING', question: '"Göç" ne demektir?', options: ['Yolculuk', 'Bir yerden başka yere taşınma', 'Gezi', 'Kaçış'], correctIndex: 1 },
        { id: 'tur_y_24', type: 'FILL_BLANK', question: '"Kış gelince ağaçlar yapraklarını ___ ."', options: ['açar', 'döker', 'büyütür', 'saklar'], correctIndex: 1 },
        { id: 'tur_y_25', type: 'SYNONYM', question: '"Sevinmek" kelimesinin eş anlamlısı nedir?', options: ['Gülmek', 'Mutlu olmak', 'Oynamak', 'Şaşırmak'], correctIndex: 1 },
    ],
    // 9-11 yaş - Orta seviye
    MIDDLE: [
        // Eş anlamlı - çok yakın anlamlı çeldiriciler
        { id: 'tur_m_1', type: 'SYNONYM', question: '"Yiğit" kelimesinin eş anlamlısı nedir?', options: ['Kahraman', 'Cesur', 'Güçlü', 'Atılgan'], correctIndex: 1 },
        { id: 'tur_m_2', type: 'SYNONYM', question: '"Keder" kelimesinin eş anlamlısı nedir?', options: ['Acı', 'Hüzün', 'Sızı', 'Pişmanlık'], correctIndex: 1 },
        { id: 'tur_m_3', type: 'SYNONYM', question: '"Tasalanmak" kelimesinin eş anlamlısı nedir?', options: ['Düşünmek', 'Kaygılanmak', 'Korkmak', 'Şüphelenmek'], correctIndex: 1 },
        { id: 'tur_m_4', type: 'SYNONYM', question: '"Uygun" kelimesinin eş anlamlısı nedir?', options: ['Doğru', 'Elverişli', 'Güzel', 'Kolay'], correctIndex: 1 },
        { id: 'tur_m_5', type: 'SYNONYM', question: '"Sitem" kelimesinin eş anlamlısı nedir?', options: ['Kızgınlık', 'Yakınma', 'Hakaret', 'Eleştiri'], correctIndex: 1 },
        { id: 'tur_m_6', type: 'SYNONYM', question: '"Arzu" kelimesinin eş anlamlısı nedir?', options: ['Hayal', 'İstek', 'Umut', 'Beklenti'], correctIndex: 1 },
        // Zıt anlamlı - ince ayrımlar
        { id: 'tur_m_7', type: 'ANTONYM', question: '"Alçakgönüllü" kelimesinin zıt anlamlısı nedir?', options: ['Kendini beğenmiş', 'Kibirli', 'Bencil', 'Gururlu'], correctIndex: 1 },
        { id: 'tur_m_8', type: 'ANTONYM', question: '"Cömert" kelimesinin zıt anlamlısı nedir?', options: ['Tutumlu', 'Cimri', 'Hesaplı', 'Eli sıkı'], correctIndex: 1 },
        { id: 'tur_m_9', type: 'ANTONYM', question: '"Sığ" kelimesinin zıt anlamlısı nedir?', options: ['Uzun', 'Derin', 'Geniş', 'Büyük'], correctIndex: 1 },
        { id: 'tur_m_10', type: 'ANTONYM', question: '"Berrak" kelimesinin zıt anlamlısı nedir?', options: ['Karanlık', 'Bulanık', 'Kirli', 'Soluk'], correctIndex: 1 },
        { id: 'tur_m_11', type: 'ANTONYM', question: '"Zarif" kelimesinin zıt anlamlısı nedir?', options: ['Çirkin', 'Kaba', 'Sert', 'Ağır'], correctIndex: 1 },
        { id: 'tur_m_12', type: 'ANTONYM', question: '"Verimli" kelimesinin zıt anlamlısı nedir?', options: ['Yararsız', 'Verimsiz', 'Boş', 'Zayıf'], correctIndex: 1 },
        // Anlam - daha derin kavramlar
        { id: 'tur_m_13', type: 'MEANING', question: '"Hasret" ne demektir?', options: ['Sevgi', 'Özlem', 'Sadakat', 'Bağlılık'], correctIndex: 1 },
        { id: 'tur_m_14', type: 'MEANING', question: '"Feragat" ne demektir?', options: ['Fedakarlık', 'Vazgeçme', 'Sabır', 'Dayanma'], correctIndex: 1 },
        { id: 'tur_m_15', type: 'MEANING', question: '"Heves" ne demektir?', options: ['İstek', 'Kısa süreli arzu', 'Heyecan', 'Merak'], correctIndex: 1 },
        { id: 'tur_m_16', type: 'MEANING', question: '"Onur" kelimesinin anlamı nedir?', options: ['Şeref', 'Gurur', 'Haysiyet', 'Saygınlık'], correctIndex: 2 },
        // Yazım kuralı - zorlaştırılmış
        { id: 'tur_m_17', type: 'SPELLING', question: 'Hangisi doğru yazılmıştır?', options: ['Geliyomuş', 'Geliyormuş', 'Geliyor muş', 'Geliyör muş'], correctIndex: 1 },
        { id: 'tur_m_18', type: 'SPELLING', question: 'Hangisi doğru yazılmıştır?', options: ['Aldığı halde', 'Aldıgı halde', 'Aldığıhalde', 'Aldıgıhalde'], correctIndex: 0 },
        { id: 'tur_m_19', type: 'SPELLING', question: 'Hangi cümlede "de/da" doğru kullanılmıştır?', options: ['Evdede kaldı', 'Evde de kaldı', 'Evde dede kaldı', 'Evdedde kaldı'], correctIndex: 1 },
        { id: 'tur_m_20', type: 'SPELLING', question: 'Hangisi doğru yazılmıştır?', options: ['Herkez', 'Herkes', 'Her kes', 'Herkess'], correctIndex: 1 },
        // Boşluk doldurma - bağlam analizi
        { id: 'tur_m_21', type: 'FILL_BLANK', question: '"Öğrenciler, sınav sonuçlarını ___ bekliyordu."', options: ['sabırsızca', 'heyecanla', 'merakla', 'endişeyle'], correctIndex: 0 },
        { id: 'tur_m_22', type: 'FILL_BLANK', question: '"Dalgaların sesi geceyi ___ ."', options: ['kaplıyordu', 'dolduruyordu', 'sarıyordu', 'kapatıyordu'], correctIndex: 1 },
        { id: 'tur_m_23', type: 'FILL_BLANK', question: '"Küçük kız, büyüklerinin sözünü ___ dinledi."', options: ['sessizce', 'dikkatle', 'saygıyla', 'usulca'], correctIndex: 1 },
        { id: 'tur_m_24', type: 'FILL_BLANK', question: '"Yazar, romanında toplumsal ___ ele almıştır."', options: ['olayları', 'sorunları', 'değişimleri', 'gelenekleri'], correctIndex: 1 },
        { id: 'tur_m_25', type: 'SYNONYM', question: '"Müjde" kelimesinin eş anlamlısı nedir?', options: ['Haber', 'Sürpriz', 'Sevinç', 'Güzel haber'], correctIndex: 3 },
    ],
    // 12+ yaş - İleri seviye
    ADVANCED: [
        // Eş anlamlı - Osmanlıca kökenli ve edebi kelimeler
        { id: 'tur_a_1', type: 'SYNONYM', question: '"Müstesna" kelimesinin eş anlamlısı nedir?', options: ['Seçkin', 'Ayrıcalıklı', 'Üstün', 'Benzersiz'], correctIndex: 1 },
        { id: 'tur_a_2', type: 'SYNONYM', question: '"Tevekkül" kelimesinin eş anlamlısı nedir?', options: ['Sabır', 'Kadere boyun eğme', 'Umut', 'İnanç'], correctIndex: 1 },
        { id: 'tur_a_3', type: 'SYNONYM', question: '"Muhafazakâr" kelimesinin eş anlamlısı nedir?', options: ['Gelenekçi', 'Tutucu', 'Eski kafalı', 'Değişmez'], correctIndex: 1 },
        { id: 'tur_a_4', type: 'SYNONYM', question: '"Muğlak" kelimesinin eş anlamlısı nedir?', options: ['Karışık', 'Belirsiz', 'Anlaşılmaz', 'Gizli'], correctIndex: 1 },
        { id: 'tur_a_5', type: 'SYNONYM', question: '"Tedirgin" kelimesinin eş anlamlısı nedir?', options: ['Korkmuş', 'Huzursuz', 'Endişeli', 'Çekingen'], correctIndex: 1 },
        { id: 'tur_a_6', type: 'SYNONYM', question: '"İstikrar" kelimesinin eş anlamlısı nedir?', options: ['Denge', 'Kararlılık', 'Güç', 'Düzen'], correctIndex: 1 },
        // Zıt anlamlı - yakın anlamlı çeldiricilerle
        { id: 'tur_a_7', type: 'ANTONYM', question: '"Müsrif" kelimesinin zıt anlamlısı nedir?', options: ['Cimri', 'Tutumlu', 'Hesaplı', 'Eli sıkı'], correctIndex: 1 },
        { id: 'tur_a_8', type: 'ANTONYM', question: '"Müsamahakâr" kelimesinin zıt anlamlısı nedir?', options: ['Katı', 'Hoşgörüsüz', 'Sert', 'Acımasız'], correctIndex: 1 },
        { id: 'tur_a_9', type: 'ANTONYM', question: '"Münzevi" kelimesinin zıt anlamlısı nedir?', options: ['Kalabalık seven', 'Sosyal', 'Dışa dönük', 'Konuşkan'], correctIndex: 1 },
        { id: 'tur_a_10', type: 'ANTONYM', question: '"Müphem" kelimesinin zıt anlamlısı nedir?', options: ['Anlaşılır', 'Açık', 'Net', 'Belirgin'], correctIndex: 1 },
        { id: 'tur_a_11', type: 'ANTONYM', question: '"Kadim" kelimesinin zıt anlamlısı nedir?', options: ['Yeni', 'Çağdaş', 'Modern', 'Güncel'], correctIndex: 1 },
        { id: 'tur_a_12', type: 'ANTONYM', question: '"Mutena" kelimesinin zıt anlamlısı nedir?', options: ['Değersiz', 'Sıradan', 'Basit', 'Adi'], correctIndex: 1 },
        // Anlam - edebi ve felsefi kavramlar
        { id: 'tur_a_13', type: 'MEANING', question: '"Tenakuz" ne demektir?', options: ['Tekrarlama', 'Çelişki', 'Benzetme', 'Karşılaştırma'], correctIndex: 1 },
        { id: 'tur_a_14', type: 'MEANING', question: '"Telmih" ne demektir?', options: ['Doğrudan anlatma', 'Geçmişe gönderme', 'Açıklama', 'Betimleme'], correctIndex: 1 },
        { id: 'tur_a_15', type: 'MEANING', question: '"Tecahül-i arif" ne demektir?', options: ['Gerçek bilgisizlik', 'Bilmezlikten gelme', 'Abartma', 'Küçümseme'], correctIndex: 1 },
        { id: 'tur_a_16', type: 'MEANING', question: '"Hiciv" ne demektir?', options: ['Övgü', 'Yergi', 'Mersiye', 'Mektup'], correctIndex: 1 },
        // Yazım kuralı - ince ayrımlar
        { id: 'tur_a_17', type: 'SPELLING', question: 'Hangisi doğru yazılmıştır?', options: ['Hiçbirzaman', 'Hiçbir zaman', 'Hiç bir zaman', 'Hiç birzaman'], correctIndex: 1 },
        { id: 'tur_a_18', type: 'SPELLING', question: 'Hangisi doğru yazılmıştır?', options: ['Her ne kadar', 'Hernekadar', 'Her nekadar', 'Herne kadar'], correctIndex: 0 },
        { id: 'tur_a_19', type: 'SPELLING', question: 'Hangi cümlede "ki" doğru kullanılmıştır?', options: ['Öyleki herkes şaşırdı', 'Öyle ki herkes şaşırdı', 'Öyleki, herkes şaşırdı', 'Öyle ki, herkes şaşırdı'], correctIndex: 1 },
        { id: 'tur_a_20', type: 'SPELLING', question: 'Hangisi doğru yazılmıştır?', options: ['Müddahale', 'Müdahale', 'Müdehale', 'Müdahele'], correctIndex: 1 },
        { id: 'tur_a_21', type: 'SPELLING', question: 'Hangisi doğru yazılmıştır?', options: ['Teveccüh', 'Tev eccüh', 'Tevecüh', 'Teveccuh'], correctIndex: 0 },
        { id: 'tur_a_22', type: 'SPELLING', question: 'Hangisi doğru yazılmıştır?', options: ['Müteakiben', 'Müteakıben', 'Mütaakiben', 'Müteakkiben'], correctIndex: 0 },
        // Boşluk doldurma - edebi analiz
        { id: 'tur_a_23', type: 'FILL_BLANK', question: '"Şair, doğayı ___ olarak kullanmıştır."', options: ['konu', 'sembol', 'araç', 'tema'], correctIndex: 1 },
        { id: 'tur_a_24', type: 'FILL_BLANK', question: '"Bu romanda anlatıcı ___ bakış açısıyla yazmıştır."', options: ['birinci tekil', 'ilahi', 'ikinci tekil', 'çoğul'], correctIndex: 1 },
        { id: 'tur_a_25', type: 'FILL_BLANK', question: '"Divan edebiyatında gazel, ___ konusunu işler."', options: ['kahramanlık', 'aşk', 'doğa', 'din'], correctIndex: 1 },
    ],
};

// Yaşa göre soru havuzu seç
const getQuestionPool = (age: number): TurkishQuestion[] => {
    if (age <= 8) return QUESTIONS_BY_AGE.YOUNG;
    if (age <= 11) return QUESTIONS_BY_AGE.MIDDLE;
    return QUESTIONS_BY_AGE.ADVANCED;
};

// Soru türüne göre emoji
const getQuestionTypeEmoji = (type: QuestionType): string => {
    switch (type) {
        case 'SYNONYM': return '🔄';
        case 'ANTONYM': return '↔️';
        case 'MEANING': return '📖';
        case 'FILL_BLANK': return '✏️';
        case 'SPELLING': return '📝';
    }
};

// Soru türüne göre başlık
const getQuestionTypeTitle = (type: QuestionType): string => {
    switch (type) {
        case 'SYNONYM': return 'Eş Anlamlı';
        case 'ANTONYM': return 'Zıt Anlamlı';
        case 'MEANING': return 'Anlam';
        case 'FILL_BLANK': return 'Boşluk Doldur';
        case 'SPELLING': return 'Yazım';
    }
};

const TurkishExamGame: React.FC<TurkishExamGameProps> = ({
    gameState,
    setGameState,
    difficulty = 'MEDIUM',
    age = 10,
}) => {
    // Guard: Props injected by MiniGameContainer via cloneElement
    if (!gameState || !setGameState) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        );
    }

    const [currentQuestion, setCurrentQuestion] = useState<TurkishQuestion | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [questions, setQuestions] = useState<TurkishQuestion[]>([]);
    const [questionIndex, setQuestionIndex] = useState(0);

    const shakeX = useSharedValue(0);
    const feedbackScale = useSharedValue(0);
    const optionScales = [useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1)];

    // Soruları başlangıçta ayarla
    useEffect(() => {
        const loadQuestions = async () => {
            const pool = getQuestionPool(age);
            const selected = await seenQuestionsTracker.selectQuestionsForExam(
                'turkish',
                pool,
                gameState.totalQuestions
            );
            setQuestions(selected);
            if (selected.length > 0) {
                setCurrentQuestion(selected[0]);
                await seenQuestionsTracker.markQuestionsAsSeen(
                    'turkish',
                    selected.map(q => q.id)
                );
            }
        };
        loadQuestions();
    }, [age, gameState.totalQuestions]);

    // Cevabı onayla (doğrudan seçilen index ile)
    const confirmAnswer = useCallback((optionIndex: number) => {
        if (!currentQuestion) return;

        const isCorrect = optionIndex === currentQuestion.correctIndex;
        const isLastQuestion = questionIndex + 1 >= questions.length;

        if (isCorrect) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setFeedback('correct');

            // Skor hesapla
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

            feedbackScale.value = withSequence(
                withSpring(1.2),
                withSpring(0)
            );
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setFeedback('wrong');

            // Shake animasyonu
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

        // Sonraki soruya geç
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

    // Seçenek seçildiğinde - Otomatik onayla (mobil UX için daha iyi)
    const handleOptionSelect = useCallback((optionIndex: number) => {
        if (feedback !== null || !currentQuestion) return;

        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedOption(optionIndex);

        // Animasyon
        optionScales[optionIndex].value = withSequence(
            withSpring(0.95),
            withSpring(1)
        );

        // Kısa bir gecikme sonra otomatik onayla
        setTimeout(() => {
            confirmAnswer(optionIndex);
        }, 300);
    }, [feedback, currentQuestion, optionScales, confirmAnswer]);

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
                <Text style={styles.loadingText}>Sorular hazırlanıyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Progress - En üstte göster */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${((questionIndex + 1) / questions.length) * 100}%` }
                        ]}
                    />
                </View>
                <Text style={styles.progressText}>
                    {questionIndex + 1} / {questions.length}
                </Text>
            </View>

            {/* Question Type Badge */}
            <View style={styles.typeBadge}>
                <Text style={styles.typeEmoji}>{getQuestionTypeEmoji(currentQuestion.type)}</Text>
                <Text style={styles.typeText}>{getQuestionTypeTitle(currentQuestion.type)}</Text>
            </View>

            {/* Question */}
            <Animated.View style={[styles.questionContainer, shakeAnimatedStyle]}>
                <Text style={styles.questionText}>{currentQuestion.question}</Text>
            </Animated.View>

            {/* Options */}
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

            {/* Confirm Button - Artık otomatik onaylandığı için gizli */}

            {/* Wrong answer explanation */}
            {feedback === 'wrong' && (
                <View style={styles.explanationContainer}>
                    <Text style={styles.explanationText}>
                        Doğru cevap: {currentQuestion.options[currentQuestion.correctIndex]}
                    </Text>
                </View>
            )}

            {/* Feedback overlay */}
            <Animated.View style={[styles.feedbackOverlay, feedbackAnimatedStyle]}>
                <Text style={styles.feedbackEmoji}>
                    {feedback === 'correct' ? '✅' : '❌'}
                </Text>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 400,
        backgroundColor: '#0f172a',
        padding: 16,
        paddingBottom: 24,
    },
    loadingContainer: {
        flex: 1,
        minHeight: 200,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0f172a',
    },
    loadingText: {
        color: '#94a3b8',
        fontSize: 16,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'center',
        backgroundColor: '#1e293b',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginBottom: 16,
        gap: 8,
    },
    typeEmoji: {
        fontSize: 18,
    },
    typeText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
    },
    questionContainer: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#334155',
    },
    questionText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        lineHeight: 26,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1e293b',
        borderRadius: 12,
        padding: 16,
        borderWidth: 2,
        borderColor: '#334155',
        gap: 12,
    },
    optionSelected: {
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
    },
    optionCorrect: {
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    optionWrong: {
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    optionShowCorrect: {
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
    },
    optionLetter: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
    },
    optionLetterText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '700',
    },
    optionLetterSelected: {
        color: '#3b82f6',
    },
    optionLetterCorrect: {
        color: '#10b981',
    },
    optionLetterWrong: {
        color: '#ef4444',
    },
    optionText: {
        flex: 1,
        color: '#e2e8f0',
        fontSize: 16,
        fontWeight: '500',
    },
    optionTextSelected: {
        color: '#3b82f6',
    },
    optionTextCorrect: {
        color: '#10b981',
    },
    optionTextWrong: {
        color: '#ef4444',
    },
    confirmButton: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        padding: 16,
        marginTop: 20,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },
    explanationContainer: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        padding: 12,
        borderRadius: 8,
        marginTop: 16,
    },
    explanationText: {
        color: '#fca5a5',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: '600',
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
    progressContainer: {
        marginBottom: 12,
    },
    progressBar: {
        height: 8,
        backgroundColor: '#334155',
        borderRadius: 4,
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#8b5cf6',
        borderRadius: 4,
    },
    progressText: {
        color: '#94a3b8',
        textAlign: 'center',
        fontSize: 14,
    },
});

export default TurkishExamGame;
