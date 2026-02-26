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
import { AppLocale, getRuntimeLocale, tRuntime } from '../../i18n/strings';
import { Difficulty, GameState } from './MiniGameContainer';
import seenQuestionsTracker from '../../utils/seenQuestionsTracker';
import { balanceCorrectAnswerDistribution } from './questionOptionBalancer';
import {
    EnglishQuestion,
    EnglishQuestionType,
    getEnglishQuestionPool,
} from './englishExamContent';

interface EnglishExamGameProps {
    gameState?: GameState;
    setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
    difficulty?: Difficulty;
    age?: number;
}

// Yaş ve Zorluk bazlı soru havuzları - Benzersiz ID'ler ile
const TURKISH_QUESTIONS: Record<string, Record<string, EnglishQuestion[]>> = {
    // 6-8 yaş
    YOUNG: {
        EASY: [
            { id: 'eng_y_e_1', type: 'VOCABULARY', question: '"Rabbit" ne demek?', options: ['Kedi', 'Tavşan', 'Köpek', 'Kuş'], correctIndex: 1 },
            { id: 'eng_y_e_2', type: 'VOCABULARY', question: '"Pencil" ne demek?', options: ['Silgi', 'Defter', 'Kalem', 'Cetvel'], correctIndex: 2 },
            { id: 'eng_y_e_3', type: 'VOCABULARY', question: '"Orange" hangi anlama gelir?', options: ['Elma', 'Portakal', 'Limon', 'Mandalina'], correctIndex: 1 },
            { id: 'eng_y_e_4', type: 'TRANSLATION', question: '"Lütfen" İngilizce\'de ne?', options: ['Thank you', 'Sorry', 'Please', 'Excuse me'], correctIndex: 2 },
            { id: 'eng_y_e_5', type: 'VOCABULARY', question: '"Purple" hangi renk?', options: ['Pembe', 'Mor', 'Mavi', 'Kırmızı'], correctIndex: 1 },
            { id: 'eng_y_e_6', type: 'VOCABULARY', question: '"Cousin" ne demek?', options: ['Kardeş', 'Kuzen', 'Amca', 'Teyze'], correctIndex: 1 },
            { id: 'eng_y_e_7', type: 'VOCABULARY', question: '"Twelve" kaç demek?', options: ['On', 'On bir', 'On iki', 'On üç'], correctIndex: 2 },
            { id: 'eng_y_e_8', type: 'VOCABULARY', question: '"Grandmother" ne demek?', options: ['Anne', 'Teyze', 'Büyükanne', 'Abla'], correctIndex: 2 },
            { id: 'eng_y_e_9', type: 'VOCABULARY', question: '"Kitchen" ne demek?', options: ['Salon', 'Yatak odası', 'Mutfak', 'Banyo'], correctIndex: 2 },
            { id: 'eng_y_e_10', type: 'VOCABULARY', question: '"Autumn" hangi mevsim?', options: ['İlkbahar', 'Yaz', 'Sonbahar', 'Kış'], correctIndex: 2 },
            { id: 'eng_y_e_11', type: 'VOCABULARY', question: '"Butterfly" ne demek?', options: ['Arı', 'Kelebek', 'Böcek', 'Kuş'], correctIndex: 1 },
            { id: 'eng_y_e_12', type: 'VOCABULARY', question: '"Strawberry" ne demek?', options: ['Kiraz', 'Çilek', 'Böğürtlen', 'Ahududu'], correctIndex: 1 },
            { id: 'eng_y_e_13', type: 'TRANSLATION', question: '"Özür dilerim" İngilizce\'de ne?', options: ['Thank you', 'Please', 'Excuse me', 'I\'m sorry'], correctIndex: 3 },
            { id: 'eng_y_e_14', type: 'VOCABULARY', question: '"Thirty" kaç demek?', options: ['On üç', 'Yirmi', 'Otuz', 'Kırk'], correctIndex: 2 },
            { id: 'eng_y_e_15', type: 'VOCABULARY', question: '"Rainy" ne demek?', options: ['Güneşli', 'Bulutlu', 'Yağmurlu', 'Rüzgarlı'], correctIndex: 2 },
        ],
        MEDIUM: [
            { id: 'eng_y_m_1', type: 'VOCABULARY', question: '"Neighbor" ne demek?', options: ['Arkadaş', 'Komşu', 'Akraba', 'Tanıdık'], correctIndex: 1 },
            { id: 'eng_y_m_2', type: 'VOCABULARY', question: '"Thirsty" ne demek?', options: ['Aç', 'Susamış', 'Yorgun', 'Hasta'], correctIndex: 1 },
            { id: 'eng_y_m_3', type: 'TRANSLATION', question: '"Yardım edebilir misiniz?" İngilizce\'de?', options: ['Can you help me?', 'Where are you?', 'What time is it?', 'How much is it?'], correctIndex: 0 },
            { id: 'eng_y_m_4', type: 'VOCABULARY', question: '"Cloud" ne demek?', options: ['Gökyüzü', 'Bulut', 'Rüzgar', 'Yağmur'], correctIndex: 1 },
            { id: 'eng_y_m_5', type: 'FILL_BLANK', question: '"There ___ many books on the table."', options: ['is', 'am', 'are', 'be'], correctIndex: 2 },
            { id: 'eng_y_m_6', type: 'VOCABULARY', question: '"Ceiling" ne demek?', options: ['Duvar', 'Zemin', 'Tavan', 'Pencere'], correctIndex: 2 },
            { id: 'eng_y_m_7', type: 'VOCABULARY', question: '"Angry" ne demek?', options: ['Mutlu', 'Kızgın', 'Üzgün', 'Korkmuş'], correctIndex: 1 },
            { id: 'eng_y_m_8', type: 'TRANSLATION', question: '"Saat kaç?" İngilizce\'de?', options: ['How old are you?', 'How much is it?', 'What time is it?', 'Where is it?'], correctIndex: 2 },
            { id: 'eng_y_m_9', type: 'VOCABULARY', question: '"Island" ne demek?', options: ['Yarımada', 'Ada', 'Kıta', 'Okyanus'], correctIndex: 1 },
            { id: 'eng_y_m_10', type: 'VOCABULARY', question: '"Busy" ne demek?', options: ['Boş', 'Meşgul', 'Serbest', 'Tembel'], correctIndex: 1 },
            { id: 'eng_y_m_11', type: 'VOCABULARY', question: '"Forest" ne demek?', options: ['Bahçe', 'Orman', 'Park', 'Tarla'], correctIndex: 1 },
            { id: 'eng_y_m_12', type: 'FILL_BLANK', question: '"My sister ___ playing in the garden."', options: ['am', 'is', 'are', 'were'], correctIndex: 1 },
            { id: 'eng_y_m_13', type: 'VOCABULARY', question: '"Scared" ne demek?', options: ['Kızgın', 'Üzgün', 'Korkmuş', 'Yorgun'], correctIndex: 2 },
            { id: 'eng_y_m_14', type: 'GRAMMAR', question: '"How ___ oranges do you want?"', options: ['much', 'many', 'some', 'any'], correctIndex: 1 },
            { id: 'eng_y_m_15', type: 'VOCABULARY', question: '"Hundred" kaç demek?', options: ['Bin', 'Yüz', 'Elli', 'On'], correctIndex: 1 },
        ],
        HARD: [
            { id: 'eng_y_h_1', type: 'FILL_BLANK', question: '"The children ___ playing outside now."', options: ['is', 'am', 'are', 'was'], correctIndex: 2 },
            { id: 'eng_y_h_2', type: 'VOCABULARY', question: '"Village" ne demek?', options: ['Şehir', 'Köy', 'Kasaba', 'İlçe'], correctIndex: 1 },
            { id: 'eng_y_h_3', type: 'TRANSLATION', question: '"Nereden geliyorsun?" İngilizce\'de?', options: ['Where do you go?', 'Where do you come from?', 'Where do you live?', 'Where are you going?'], correctIndex: 1 },
            { id: 'eng_y_h_4', type: 'FILL_BLANK', question: '"She ___ her homework every day."', options: ['do', 'does', 'doing', 'did'], correctIndex: 1 },
            { id: 'eng_y_h_5', type: 'VOCABULARY', question: '"Brave" ne demek?', options: ['Güçlü', 'Cesur', 'Akıllı', 'Hızlı'], correctIndex: 1 },
            { id: 'eng_y_h_6', type: 'GRAMMAR', question: 'Hangisi doğru? "___ umbrella"', options: ['A', 'An', 'The', 'Some'], correctIndex: 1 },
            { id: 'eng_y_h_7', type: 'VOCABULARY', question: '"Honest" ne demek?', options: ['Akıllı', 'Dürüst', 'Nazik', 'Güçlü'], correctIndex: 1 },
            { id: 'eng_y_h_8', type: 'FILL_BLANK', question: '"We ___ to the park yesterday."', options: ['go', 'goes', 'went', 'going'], correctIndex: 2 },
            { id: 'eng_y_h_9', type: 'VOCABULARY', question: '"Dangerous" ne demek?', options: ['Güvenli', 'Tehlikeli', 'Dikkatli', 'Korkak'], correctIndex: 1 },
            { id: 'eng_y_h_10', type: 'GRAMMAR', question: '"How ___ milk do you need?"', options: ['many', 'much', 'some', 'any'], correctIndex: 1 },
            { id: 'eng_y_h_11', type: 'GRAMMAR', question: '"___ hour ago" hangisi doğru?', options: ['A hour ago', 'An hour ago', 'One hour before', 'The hour ago'], correctIndex: 1 },
            { id: 'eng_y_h_12', type: 'VOCABULARY', question: '"Already" ne demek?', options: ['Henüz', 'Çoktan', 'Hâlâ', 'Asla'], correctIndex: 1 },
            { id: 'eng_y_h_13', type: 'FILL_BLANK', question: '"My father ___ breakfast at 7 o\'clock."', options: ['have', 'has', 'having', 'had'], correctIndex: 1 },
            { id: 'eng_y_h_14', type: 'VOCABULARY', question: '"Several" ne demek?', options: ['Az', 'Birkaç', 'Çok', 'Hepsi'], correctIndex: 1 },
            { id: 'eng_y_h_15', type: 'TRANSLATION', question: '"Ne sıklıkla?" İngilizce\'de?', options: ['How long?', 'How far?', 'How often?', 'How much?'], correctIndex: 2 },
        ],
    },
    // 9-11 yaş
    MIDDLE: {
        EASY: [
            { id: 'eng_m_e_1', type: 'VOCABULARY', question: '"Curious" ne demek?', options: ['Dikkatli', 'Meraklı', 'Endişeli', 'Sabırsız'], correctIndex: 1 },
            { id: 'eng_m_e_2', type: 'VOCABULARY', question: '"Polite" ne demek?', options: ['Kaba', 'Kibar', 'Sessiz', 'Utangaç'], correctIndex: 1 },
            { id: 'eng_m_e_3', type: 'VOCABULARY', question: '"Borrow" ne demek?', options: ['Vermek', 'Ödünç almak', 'Satmak', 'Almak'], correctIndex: 1 },
            { id: 'eng_m_e_4', type: 'FILL_BLANK', question: '"My parents ___ dinner right now."', options: ['cook', 'cooks', 'are cooking', 'cooked'], correctIndex: 2 },
            { id: 'eng_m_e_5', type: 'VOCABULARY', question: '"Strange" ne demek?', options: ['Normal', 'Garip', 'Güzel', 'Farklı'], correctIndex: 1 },
            { id: 'eng_m_e_6', type: 'TRANSLATION', question: '"Sana katılıyorum" İngilizce\'de?', options: ['I like you', 'I agree with you', 'I believe you', 'I follow you'], correctIndex: 1 },
            { id: 'eng_m_e_7', type: 'VOCABULARY', question: '"Achieve" ne demek?', options: ['Denemek', 'Başarmak', 'Çalışmak', 'Planlamak'], correctIndex: 1 },
            { id: 'eng_m_e_8', type: 'FILL_BLANK', question: '"She usually ___ up at 7 o\'clock."', options: ['wake', 'wakes', 'waking', 'woke'], correctIndex: 1 },
            { id: 'eng_m_e_9', type: 'VOCABULARY', question: '"Prefer" ne demek?', options: ['İstemek', 'Tercih etmek', 'Sevmek', 'Seçmek'], correctIndex: 1 },
            { id: 'eng_m_e_10', type: 'VOCABULARY', question: '"Seldom" ne demek?', options: ['Her zaman', 'Nadiren', 'Sıklıkla', 'Bazen'], correctIndex: 1 },
            { id: 'eng_m_e_11', type: 'VOCABULARY', question: '"Ancient" ne demek?', options: ['Yeni', 'Antik', 'Eski', 'Modern'], correctIndex: 1 },
            { id: 'eng_m_e_12', type: 'GRAMMAR', question: '"I have ___ been to Paris."', options: ['ever', 'never', 'yet', 'already'], correctIndex: 1 },
            { id: 'eng_m_e_13', type: 'VOCABULARY', question: '"Exhausted" ne demek?', options: ['Yorgun', 'Çok yorgun', 'Hasta', 'Üzgün'], correctIndex: 1 },
            { id: 'eng_m_e_14', type: 'FILL_BLANK', question: '"We ___ this movie before."', options: ['see', 'seen', 'have seen', 'seeing'], correctIndex: 2 },
            { id: 'eng_m_e_15', type: 'VOCABULARY', question: '"Ceremony" ne demek?', options: ['Toplantı', 'Tören', 'Parti', 'Gösteri'], correctIndex: 1 },
        ],
        MEDIUM: [
            { id: 'eng_m_m_1', type: 'GRAMMAR', question: 'Doğru cümle hangisi?', options: ['She don\'t like coffee', 'She doesn\'t likes coffee', 'She doesn\'t like coffee', 'She not like coffee'], correctIndex: 2 },
            { id: 'eng_m_m_2', type: 'TRANSLATION', question: '"Keşke daha erken gelseydin" İngilizce\'de?', options: ['I wish you come earlier', 'I wish you came earlier', 'I wish you had come earlier', 'I wish you will come earlier'], correctIndex: 2 },
            { id: 'eng_m_m_3', type: 'VOCABULARY', question: '"Investigate" ne demek?', options: ['Sorgulamak', 'Araştırmak', 'İncelemek', 'Kontrol etmek'], correctIndex: 1 },
            { id: 'eng_m_m_4', type: 'GRAMMAR', question: '"Since" ile hangi zaman kullanılır?', options: ['Past Simple', 'Present Perfect', 'Present Simple', 'Future'], correctIndex: 1 },
            { id: 'eng_m_m_5', type: 'FILL_BLANK', question: '"If it rains, I ___ at home."', options: ['stay', 'will stay', 'stayed', 'would stay'], correctIndex: 1 },
            { id: 'eng_m_m_6', type: 'GRAMMAR', question: '"While" ile hangi yapı kullanılır?', options: ['Past Simple', 'Past Continuous', 'Present Perfect', 'Future'], correctIndex: 1 },
            { id: 'eng_m_m_7', type: 'VOCABULARY', question: '"Consequence" ne demek?', options: ['Neden', 'Sonuç', 'Süreç', 'Etki'], correctIndex: 1 },
            { id: 'eng_m_m_8', type: 'FILL_BLANK', question: '"She ___ English for three years."', options: ['learns', 'learned', 'has been learning', 'is learning'], correctIndex: 2 },
            { id: 'eng_m_m_9', type: 'VOCABULARY', question: '"Approach" ne demek?', options: ['Uzaklaşmak', 'Yaklaşmak', 'Varmak', 'Gitmek'], correctIndex: 1 },
            { id: 'eng_m_m_10', type: 'GRAMMAR', question: '"I was sleeping ___ the phone rang."', options: ['while', 'when', 'during', 'as soon as'], correctIndex: 1 },
            { id: 'eng_m_m_11', type: 'FILL_BLANK', question: '"You ___ study harder if you want to pass."', options: ['can', 'must', 'may', 'might'], correctIndex: 1 },
            { id: 'eng_m_m_12', type: 'TRANSLATION', question: '"Daha önce hiç uçağa bindin mi?" İngilizce\'de?', options: ['Did you fly before?', 'Have you ever flown?', 'Do you ever fly?', 'Were you flying before?'], correctIndex: 1 },
            { id: 'eng_m_m_13', type: 'VOCABULARY', question: '"Obstacle" ne demek?', options: ['Fırsat', 'Engel', 'Yol', 'Amaç'], correctIndex: 1 },
            { id: 'eng_m_m_14', type: 'GRAMMAR', question: '"I ___ my keys. I can\'t find them."', options: ['lose', 'lost', 'have lost', 'am losing'], correctIndex: 2 },
            { id: 'eng_m_m_15', type: 'FILL_BLANK', question: '"The cake ___ by my mother."', options: ['baked', 'was baked', 'is baking', 'has baked'], correctIndex: 1 },
        ],
        HARD: [
            { id: 'eng_m_h_1', type: 'GRAMMAR', question: '"If I ___ you, I would apologize."', options: ['am', 'was', 'were', 'be'], correctIndex: 2 },
            { id: 'eng_m_h_2', type: 'FILL_BLANK', question: '"He asked me where I ___."', options: ['live', 'lived', 'am living', 'have lived'], correctIndex: 1 },
            { id: 'eng_m_h_3', type: 'GRAMMAR', question: 'Past participle of "choose"?', options: ['choosed', 'chose', 'chosen', 'choosing'], correctIndex: 2 },
            { id: 'eng_m_h_4', type: 'VOCABULARY', question: '"Determination" ne demek?', options: ['Karar', 'Kararlılık', 'Sonuç', 'Hedef'], correctIndex: 1 },
            { id: 'eng_m_h_5', type: 'FILL_BLANK', question: '"The letter ___ already ___ when I arrived."', options: ['was/sent', 'had been/sent', 'has been/sent', 'is/sent'], correctIndex: 1 },
            { id: 'eng_m_h_6', type: 'GRAMMAR', question: '"Neither Tom ___ Jerry came to the party."', options: ['or', 'and', 'nor', 'but'], correctIndex: 2 },
            { id: 'eng_m_h_7', type: 'VOCABULARY', question: '"Reputation" ne demek?', options: ['Tanınma', 'İtibar', 'Şöhret', 'Güven'], correctIndex: 1 },
            { id: 'eng_m_h_8', type: 'GRAMMAR', question: 'Past participle of "forbid"?', options: ['forbade', 'forbidden', 'forbidded', 'forbid'], correctIndex: 1 },
            { id: 'eng_m_h_9', type: 'FILL_BLANK', question: '"By the time she arrived, we ___ already left."', options: ['have', 'had', 'were', 'did'], correctIndex: 1 },
            { id: 'eng_m_h_10', type: 'VOCABULARY', question: '"Remarkable" ne demek?', options: ['Normal', 'Dikkat çekici', 'Güzel', 'İlginç'], correctIndex: 1 },
            { id: 'eng_m_h_11', type: 'GRAMMAR', question: '"She said she ___ call me the next day."', options: ['will', 'would', 'shall', 'can'], correctIndex: 1 },
            { id: 'eng_m_h_12', type: 'FILL_BLANK', question: '"The building ___ in 1990."', options: ['built', 'was built', 'has built', 'is built'], correctIndex: 1 },
            { id: 'eng_m_h_13', type: 'VOCABULARY', question: '"Persuade" ne demek?', options: ['Zorlamak', 'İkna etmek', 'Rica etmek', 'Önermek'], correctIndex: 1 },
            { id: 'eng_m_h_14', type: 'GRAMMAR', question: '"Not only ___ she sing, but she also danced."', options: ['does', 'did', 'was', 'had'], correctIndex: 1 },
            { id: 'eng_m_h_15', type: 'FILL_BLANK', question: '"I wish I ___ more time to study."', options: ['have', 'had', 'would have', 'having'], correctIndex: 1 },
        ],
    },
    // 12+ yaş
    ADVANCED: {
        EASY: [
            { id: 'eng_a_e_1', type: 'VOCABULARY', question: '"Elaborate" ne demek?', options: ['Basit', 'Ayrıntılı', 'Karışık', 'Düzenli'], correctIndex: 1 },
            { id: 'eng_a_e_2', type: 'VOCABULARY', question: '"Ambiguous" ne demek?', options: ['Belirsiz', 'Anlaşılmaz', 'Karmaşık', 'Muğlak'], correctIndex: 0 },
            { id: 'eng_a_e_3', type: 'VOCABULARY', question: '"Reluctant" ne demek?', options: ['Kararsız', 'İsteksiz', 'Çekingen', 'Tereddütlü'], correctIndex: 1 },
            { id: 'eng_a_e_4', type: 'GRAMMAR', question: '"I\'d rather ___ than stay home."', options: ['go out', 'going out', 'to go out', 'went out'], correctIndex: 0 },
            { id: 'eng_a_e_5', type: 'VOCABULARY', question: '"Substantially" ne demek?', options: ['Biraz', 'Önemli ölçüde', 'Tamamen', 'Kısmen'], correctIndex: 1 },
            { id: 'eng_a_e_6', type: 'VOCABULARY', question: '"Deteriorate" ne demek?', options: ['Gelişmek', 'Kötüleşmek', 'Değişmek', 'Durmak'], correctIndex: 1 },
            { id: 'eng_a_e_7', type: 'GRAMMAR', question: '"Ought to" ne ifade eder?', options: ['Zorunluluk', 'Ahlaki tavsiye', 'İzin', 'Yetenek'], correctIndex: 1 },
            { id: 'eng_a_e_8', type: 'VOCABULARY', question: '"Obsolete" ne demek?', options: ['Eski', 'Kullanılmayan', 'Nadir', 'Modası geçmiş'], correctIndex: 1 },
            { id: 'eng_a_e_9', type: 'VOCABULARY', question: '"Advocate" ne demek?', options: ['Karşı çıkmak', 'Savunmak', 'Tartışmak', 'Önermek'], correctIndex: 1 },
            { id: 'eng_a_e_10', type: 'FILL_BLANK', question: '"She ___ have left already; her car is gone."', options: ['can', 'must', 'should', 'would'], correctIndex: 1 },
            { id: 'eng_a_e_11', type: 'VOCABULARY', question: '"Coherent" ne demek?', options: ['Karmaşık', 'Tutarlı', 'Açık', 'Anlaşılır'], correctIndex: 1 },
            { id: 'eng_a_e_12', type: 'VOCABULARY', question: '"Scrutinize" ne demek?', options: ['Bakmak', 'Dikkatle incelemek', 'Kontrol etmek', 'Gözlemlemek'], correctIndex: 1 },
            { id: 'eng_a_e_13', type: 'GRAMMAR', question: '"Need" modal olarak kullanıldığında ne ifade eder?', options: ['İstek', 'Gereklilik', 'İzin', 'Yetenek'], correctIndex: 1 },
            { id: 'eng_a_e_14', type: 'VOCABULARY', question: '"Tentative" ne demek?', options: ['Kesin', 'Geçici/Belirsiz', 'Kararlı', 'Son'], correctIndex: 1 },
            { id: 'eng_a_e_15', type: 'VOCABULARY', question: '"Versatile" ne demek?', options: ['Tek yönlü', 'Çok yönlü', 'Esnek', 'Değişken'], correctIndex: 1 },
        ],
        MEDIUM: [
            { id: 'eng_a_m_1', type: 'GRAMMAR', question: '"If I had studied, I ___ the exam."', options: ['pass', 'passed', 'would pass', 'would have passed'], correctIndex: 3 },
            { id: 'eng_a_m_2', type: 'FILL_BLANK', question: '"Not only ___ she smart, but she is also hardworking."', options: ['is', 'does', 'was', 'has'], correctIndex: 0 },
            { id: 'eng_a_m_3', type: 'VOCABULARY', question: '"Exacerbate" ne demek?', options: ['İyileştirmek', 'Kötüleştirmek', 'Önlemek', 'Azaltmak'], correctIndex: 1 },
            { id: 'eng_a_m_4', type: 'GRAMMAR', question: '"Provided that" ne anlama gelir?', options: ['Rağmen', 'Koşuluyla', 'Çünkü', 'Sonuç olarak'], correctIndex: 1 },
            { id: 'eng_a_m_5', type: 'FILL_BLANK', question: '"He denied ___ the window."', options: ['break', 'broke', 'breaking', 'to break'], correctIndex: 2 },
            { id: 'eng_a_m_6', type: 'GRAMMAR', question: '"Supposing" ile cümle kurulursa ne ifade eder?', options: ['Kesinlik', 'Varsayım', 'Sonuç', 'Neden'], correctIndex: 1 },
            { id: 'eng_a_m_7', type: 'VOCABULARY', question: '"Undermine" ne demek?', options: ['Desteklemek', 'Baltalamak', 'Güçlendirmek', 'Korumak'], correctIndex: 1 },
            { id: 'eng_a_m_8', type: 'FILL_BLANK', question: '"___ he known the truth, he wouldn\'t have agreed."', options: ['If', 'Had', 'Should', 'Were'], correctIndex: 1 },
            { id: 'eng_a_m_9', type: 'VOCABULARY', question: '"Plausible" ne demek?', options: ['İmkansız', 'Akla yatkın', 'Kesin', 'Doğru'], correctIndex: 1 },
            { id: 'eng_a_m_10', type: 'GRAMMAR', question: '"Lest" ne anlama gelir?', options: ['Diye (olumsuz)', 'Çünkü', 'Rağmen', 'Eğer'], correctIndex: 0 },
            { id: 'eng_a_m_11', type: 'FILL_BLANK', question: '"She insisted ___ paying for dinner."', options: ['to', 'on', 'for', 'in'], correctIndex: 1 },
            { id: 'eng_a_m_12', type: 'VOCABULARY', question: '"Vindicate" ne demek?', options: ['Suçlamak', 'Haklı çıkarmak', 'Cezalandırmak', 'Affetmek'], correctIndex: 1 },
            { id: 'eng_a_m_13', type: 'GRAMMAR', question: '"Notwithstanding" ne anlama gelir?', options: ['Çünkü', 'Buna rağmen', 'Sonuç olarak', 'Ayrıca'], correctIndex: 1 },
            { id: 'eng_a_m_14', type: 'FILL_BLANK', question: '"It was ___ a difficult test that nobody passed."', options: ['so', 'such', 'very', 'too'], correctIndex: 1 },
            { id: 'eng_a_m_15', type: 'VOCABULARY', question: '"Ponder" ne demek?', options: ['Hızlıca karar vermek', 'Derin düşünmek', 'Tartışmak', 'Sorgulamak'], correctIndex: 1 },
        ],
        HARD: [
            { id: 'eng_a_h_1', type: 'GRAMMAR', question: '"I wish I ___ attended the meeting yesterday."', options: ['have', 'had', 'would have', 'could'], correctIndex: 1 },
            { id: 'eng_a_h_2', type: 'FILL_BLANK', question: '"Seldom ___ such a talented musician."', options: ['I have seen', 'have I seen', 'I saw', 'did I see'], correctIndex: 1 },
            { id: 'eng_a_h_3', type: 'VOCABULARY', question: '"Ostentatious" ne demek?', options: ['Mütevazi', 'Gösterişli', 'Zarif', 'Sade'], correctIndex: 1 },
            { id: 'eng_a_h_4', type: 'GRAMMAR', question: '"Might have done" ne ifade eder?', options: ['Kesin geçmiş', 'Olası geçmiş eylem', 'Yapılmamış tavsiye', 'Gelecek tahmin'], correctIndex: 1 },
            { id: 'eng_a_h_5', type: 'FILL_BLANK', question: '"___ it not been for your help, I would have failed."', options: ['If', 'Had', 'Were', 'Should'], correctIndex: 1 },
            { id: 'eng_a_h_6', type: 'VOCABULARY', question: '"Surreptitious" ne demek?', options: ['Açık', 'Gizli/Sinsi', 'Şüpheli', 'Dikkatli'], correctIndex: 1 },
            { id: 'eng_a_h_7', type: 'GRAMMAR', question: '"Scarcely had I spoken ___ he interrupted me."', options: ['when', 'than', 'before', 'as'], correctIndex: 0 },
            { id: 'eng_a_h_8', type: 'VOCABULARY', question: '"Exonerate" ne demek?', options: ['Suçlamak', 'Aklamak', 'Cezalandırmak', 'Soruşturmak'], correctIndex: 1 },
            { id: 'eng_a_h_9', type: 'FILL_BLANK', question: '"It\'s about time the government ___ action."', options: ['takes', 'took', 'take', 'taken'], correctIndex: 1 },
            { id: 'eng_a_h_10', type: 'VOCABULARY', question: '"Paradoxical" ne demek?', options: ['Mantıklı', 'Çelişkili', 'Tutarsız', 'Karmaşık'], correctIndex: 1 },
            { id: 'eng_a_h_11', type: 'GRAMMAR', question: '"___ to rain, the match would be cancelled."', options: ['If it is', 'Were it', 'Should it', 'Had it'], correctIndex: 1 },
            { id: 'eng_a_h_12', type: 'VOCABULARY', question: '"Vicarious" ne demek?', options: ['Doğrudan', 'Dolaylı/Başkası aracılığıyla', 'Kişisel', 'Gerçek'], correctIndex: 1 },
            { id: 'eng_a_h_13', type: 'FILL_BLANK', question: '"So ___ was the news that everyone was shocked."', options: ['surprising', 'surprised', 'surprisingly', 'surprise'], correctIndex: 0 },
            { id: 'eng_a_h_14', type: 'VOCABULARY', question: '"Truncate" ne demek?', options: ['Uzatmak', 'Kısaltmak', 'Değiştirmek', 'Bölmek'], correctIndex: 1 },
            { id: 'eng_a_h_15', type: 'GRAMMAR', question: '"Little ___ he know what awaited him."', options: ['does', 'did', 'was', 'had'], correctIndex: 1 },
        ],
    },
};

// Yaş ve zorluğa göre soru havuzu seç
const getTurkishQuestionPool = (age: number, difficulty: Difficulty): EnglishQuestion[] => {
    let ageGroup: string;
    if (age <= 8) ageGroup = 'YOUNG';
    else if (age <= 11) ageGroup = 'MIDDLE';
    else ageGroup = 'ADVANCED';

    return TURKISH_QUESTIONS[ageGroup][difficulty] || TURKISH_QUESTIONS[ageGroup]['MEDIUM'];
};

const getLocalizedQuestionPool = (
    age: number,
    difficulty: Difficulty,
    locale: AppLocale
): EnglishQuestion[] => (
    locale === 'en'
        ? getEnglishQuestionPool(age, difficulty)
        : getTurkishQuestionPool(age, difficulty)
);

const QUESTION_TYPE_EMOJIS: Record<EnglishQuestionType, string> = {
    VOCABULARY: '📚',
    TRANSLATION: '🔄',
    GRAMMAR: '📝',
    FILL_BLANK: '✏️',
};

const QUESTION_TYPE_FALLBACKS: Record<AppLocale, Record<EnglishQuestionType, string>> = {
    tr: {
        VOCABULARY: 'Kelime',
        TRANSLATION: 'Ceviri',
        GRAMMAR: 'Gramer',
        FILL_BLANK: 'Bosluk Doldur',
    },
    en: {
        VOCABULARY: 'Vocabulary',
        TRANSLATION: 'Usage',
        GRAMMAR: 'Grammar',
        FILL_BLANK: 'Fill in the Blank',
    },
};

const QUESTION_TYPE_KEY_MAP: Record<EnglishQuestionType, string> = {
    VOCABULARY: 'vocabulary',
    TRANSLATION: 'translation',
    GRAMMAR: 'grammar',
    FILL_BLANK: 'fillBlank',
};

const getQuestionTypeEmoji = (type: EnglishQuestionType): string => QUESTION_TYPE_EMOJIS[type];

const getQuestionTypeTitle = (type: EnglishQuestionType, locale: AppLocale): string => (
    tRuntime(
        `exams.english.questionTypes.${QUESTION_TYPE_KEY_MAP[type]}`,
        undefined,
        QUESTION_TYPE_FALLBACKS[locale][type]
    )
);

const getLoadingFallback = (locale: AppLocale): string => (
    locale === 'en' ? 'Loading...' : 'Yukleniyor...'
);

const getPreparingFallback = (locale: AppLocale): string => (
    locale === 'en' ? 'Preparing questions...' : 'Sorular hazirlaniyor...'
);

const getCorrectAnswerFallback = (locale: AppLocale): string => (
    locale === 'en' ? 'Correct answer: {answer}' : 'Dogru cevap: {answer}'
);

const getLoadingText = (locale: AppLocale): string => (
    tRuntime('exams.english.loading', undefined, getLoadingFallback(locale))
);

const getPreparingText = (locale: AppLocale): string => (
    tRuntime('exams.english.preparing', undefined, getPreparingFallback(locale))
);

const getCorrectAnswerText = (locale: AppLocale, answer: string): string => (
    tRuntime('exams.english.correctAnswer', { answer }, getCorrectAnswerFallback(locale))
);

const EnglishExamGame: React.FC<EnglishExamGameProps> = ({
    gameState,
    setGameState,
    difficulty = 'MEDIUM',
    age = 10,
}) => {
    const runtimeLocale = getRuntimeLocale();

    if (!gameState || !setGameState) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{getLoadingText(runtimeLocale)}</Text>
            </View>
        );
    }

    const [currentQuestion, setCurrentQuestion] = useState<EnglishQuestion | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [questions, setQuestions] = useState<EnglishQuestion[]>([]);
    const [questionIndex, setQuestionIndex] = useState(0);

    const shakeX = useSharedValue(0);
    const feedbackScale = useSharedValue(0);

    useEffect(() => {
        const loadQuestions = async () => {
            const pool = getLocalizedQuestionPool(age, difficulty, runtimeLocale);
            const selected = await seenQuestionsTracker.selectQuestionsForExam(
                'english',
                pool,
                gameState.totalQuestions
            );
            const balancedQuestions = balanceCorrectAnswerDistribution(selected);
            setQuestions(balancedQuestions);
            if (balancedQuestions.length > 0) {
                setCurrentQuestion(balancedQuestions[0]);
                await seenQuestionsTracker.markQuestionsAsSeen(
                    'english',
                    selected.map(q => q.id)
                );
            }
        };
        loadQuestions();
    }, [age, difficulty, gameState.totalQuestions, runtimeLocale]);

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

    const handleOptionSelect = useCallback((optionIndex: number) => {
        if (feedback !== null || !currentQuestion) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedOption(optionIndex);
        setTimeout(() => {
            confirmAnswer(optionIndex);
        }, 300);
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
                <Text style={styles.loadingText}>{getPreparingText(runtimeLocale)}</Text>
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
                <Text style={styles.typeText}>{getQuestionTypeTitle(currentQuestion.type, runtimeLocale)}</Text>
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

            {feedback === 'wrong' && (
                <View style={styles.explanationContainer}>
                    <Text style={styles.explanationText}>
                        {getCorrectAnswerText(runtimeLocale, currentQuestion.options[currentQuestion.correctIndex])}
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
    optionSelected: { borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.1)' },
    optionCorrect: { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    optionWrong: { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    optionShowCorrect: { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.15)' },
    optionLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
    optionLetterText: { color: '#94a3b8', fontSize: 14, fontWeight: '700' },
    optionLetterSelected: { color: '#f59e0b' },
    optionLetterCorrect: { color: '#10b981' },
    optionLetterWrong: { color: '#ef4444' },
    optionText: { flex: 1, color: '#e2e8f0', fontSize: 16, fontWeight: '500' },
    optionTextSelected: { color: '#f59e0b' },
    optionTextCorrect: { color: '#10b981' },
    optionTextWrong: { color: '#ef4444' },
    explanationContainer: { backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 12, borderRadius: 8, marginTop: 16 },
    explanationText: { color: '#fca5a5', fontSize: 14, textAlign: 'center', fontWeight: '600' },
    feedbackOverlay: { position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center' },
    feedbackEmoji: { fontSize: 64 },
    progressContainer: { marginBottom: 12 },
    progressBar: { height: 8, backgroundColor: '#334155', borderRadius: 4, marginBottom: 8 },
    progressFill: { height: '100%', backgroundColor: '#f59e0b', borderRadius: 4 },
    progressText: { color: '#94a3b8', textAlign: 'center', fontSize: 14 },
});

export default EnglishExamGame;
