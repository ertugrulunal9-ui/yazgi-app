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
import { balanceCorrectAnswerDistribution } from './questionOptionBalancer';

type QuestionType = 'DATE' | 'PERSON' | 'EVENT' | 'PLACE' | 'ORDER';

interface HistoryQuestion {
    id: string;
    type: QuestionType;
    question: string;
    options: string[];
    correctIndex: number;
}

interface HistoryExamGameProps {
    gameState?: GameState;
    setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
    difficulty?: Difficulty;
    age?: number;
}

// Yaş ve Zorluk bazlı soru havuzları - Benzersiz ID'ler ile
const QUESTIONS: Record<string, Record<string, HistoryQuestion[]>> = {
    // 6-8 yaş
    YOUNG: {
        EASY: [
            { id: 'hist_y_e_1', type: 'PERSON', question: 'Türkiye Cumhuriyeti\'ni kim kurdu?', options: ['İsmet İnönü', 'Mustafa Kemal Atatürk', 'Kazım Karabekir', 'Fevzi Çakmak'], correctIndex: 1 },
            { id: 'hist_y_e_2', type: 'EVENT', question: '23 Nisan\'da hem çocukları hem de neyi kutlarız?', options: ['Zafer Bayramı', 'Ulusal Egemenlik', 'Cumhuriyetin ilanı', 'Gençlik Bayramı'], correctIndex: 1 },
            { id: 'hist_y_e_3', type: 'EVENT', question: '29 Ekim\'de Cumhuriyet ilan edildi. Bu gün neden önemlidir?', options: ['Savaş kazanıldı', 'TBMM açıldı', 'Halkın yönetimi başladı', 'Başkent değişti'], correctIndex: 2 },
            { id: 'hist_y_e_4', type: 'PERSON', question: 'Atatürk\'ün soyadı kanunundan önceki tam adı neydi?', options: ['Kemal Paşa', 'Mustafa Kemal', 'Gazi Mustafa', 'Mareşal Kemal'], correctIndex: 1 },
            { id: 'hist_y_e_5', type: 'EVENT', question: '19 Mayıs 1919\'da Atatürk nereye ayak bastı?', options: ['Ankara\'ya', 'İstanbul\'a', 'Samsun\'a', 'İzmir\'e'], correctIndex: 2 },
            { id: 'hist_y_e_6', type: 'PLACE', question: 'Ankara neden başkent seçildi?', options: ['En büyük şehir olduğu için', 'Güvenli ve merkezi konumu için', 'Deniz kenarı olduğu için', 'En eski şehir olduğu için'], correctIndex: 1 },
            { id: 'hist_y_e_7', type: 'EVENT', question: '30 Ağustos hangi zaferle ilgilidir?', options: ['Çanakkale Zaferi', 'İnönü Zaferi', 'Başkomutanlık Zaferi', 'Sakarya Zaferi'], correctIndex: 2 },
            { id: 'hist_y_e_8', type: 'PERSON', question: 'İstiklal Marşı\'nı yazan Mehmet Akif Ersoy kimdir?', options: ['Bir asker', 'Bir şair', 'Bir padişah', 'Bir bilim insanı'], correctIndex: 1 },
            { id: 'hist_y_e_9', type: 'EVENT', question: 'Türk bayrağındaki ay ve yıldız neyi temsil eder?', options: ['Güneş ve Ay\'ı', 'Bağımsızlık ve Türklüğü', 'Barış ve savaşı', 'Doğu ve batıyı'], correctIndex: 1 },
            { id: 'hist_y_e_10', type: 'EVENT', question: 'Aşağıdakilerden hangisi milli bayramdır?', options: ['23 Nisan', 'Ramazan Bayramı', 'Anneler Günü', 'Yılbaşı'], correctIndex: 0 },
            { id: 'hist_y_e_11', type: 'PLACE', question: 'Atatürk doğduğu zaman Selanik hangi ülkenin sınırlarındaydı?', options: ['Türkiye', 'Osmanlı Devleti', 'Yunanistan', 'Bulgaristan'], correctIndex: 1 },
            { id: 'hist_y_e_12', type: 'PERSON', question: 'Atatürk\'ten sonra cumhurbaşkanı olan kişi kimdir?', options: ['Celal Bayar', 'Fevzi Çakmak', 'İsmet İnönü', 'Kazım Karabekir'], correctIndex: 2 },
            { id: 'hist_y_e_13', type: 'EVENT', question: '10 Kasım\'da neden saygı duruşunda bulunuruz?', options: ['Cumhuriyet ilan edildi', 'Atatürk vefat etti', 'Savaş kazanıldı', 'TBMM açıldı'], correctIndex: 1 },
            { id: 'hist_y_e_14', type: 'PLACE', question: 'Anıtkabir ne amaçla yapılmıştır?', options: ['Müze olarak', 'Atatürk\'ün anıt mezarı olarak', 'Meclis binası olarak', 'Kütüphane olarak'], correctIndex: 1 },
            { id: 'hist_y_e_15', type: 'EVENT', question: '23 Nisan neden "Ulusal Egemenlik" günüdür?', options: ['Savaş kazanıldığı için', 'TBMM açıldığı için', 'Cumhuriyet ilan edildiği için', 'Atatürk doğduğu için'], correctIndex: 1 },
        ],
        MEDIUM: [
            { id: 'hist_y_m_1', type: 'DATE', question: 'Cumhuriyet hangi yıl ilan edildi?', options: ['1922', '1923', '1924', '1925'], correctIndex: 1 },
            { id: 'hist_y_m_2', type: 'PERSON', question: 'İstanbul\'u fetheden padişahın asıl adı nedir?', options: ['Sultan Mehmet', 'II. Mehmet', 'III. Mehmet', 'I. Mehmet'], correctIndex: 1 },
            { id: 'hist_y_m_3', type: 'DATE', question: 'İstanbul hangi yıl fethedildi?', options: ['1451', '1452', '1453', '1454'], correctIndex: 2 },
            { id: 'hist_y_m_4', type: 'PLACE', question: 'Osmanlı Devleti\'nin kurulduğu yer neresidir?', options: ['Bursa', 'Söğüt', 'Bilecik', 'Eskişehir'], correctIndex: 1 },
            { id: 'hist_y_m_5', type: 'PERSON', question: 'Osman Bey\'in babası kimdir?', options: ['Süleyman Şah', 'Ertuğrul Gazi', 'Orhan Gazi', 'Gündüz Alp'], correctIndex: 1 },
            { id: 'hist_y_m_6', type: 'EVENT', question: 'Kurtuluş Savaşı neden yapıldı?', options: ['Toprak kazanmak için', 'Yurdu düşmandan kurtarmak için', 'Osmanlı\'yı yeniden kurmak için', 'Padişahı korumak için'], correctIndex: 1 },
            { id: 'hist_y_m_7', type: 'PLACE', question: 'Osmanlı\'nın başkenti Söğüt\'ten sonra neresi oldu?', options: ['Edirne', 'İstanbul', 'Bursa', 'Ankara'], correctIndex: 2 },
            { id: 'hist_y_m_8', type: 'DATE', question: 'TBMM hangi yıl açıldı?', options: ['1919', '1920', '1921', '1922'], correctIndex: 1 },
            { id: 'hist_y_m_9', type: 'PERSON', question: 'Kanuni Sultan Süleyman hangi dönemde yaşadı?', options: ['Osmanlı kuruluş dönemi', 'Osmanlı yükselme dönemi', 'Osmanlı duraklama dönemi', 'Osmanlı gerileme dönemi'], correctIndex: 1 },
            { id: 'hist_y_m_10', type: 'EVENT', question: 'Çanakkale Savaşı\'nda hangi ülkelere karşı savaşıldı?', options: ['Almanya ve Avusturya', 'İngiltere ve Fransa', 'Rusya ve İtalya', 'Yunanistan ve Bulgaristan'], correctIndex: 1 },
            { id: 'hist_y_m_11', type: 'PLACE', question: 'Edirne, İstanbul\'un fethinden önce neydi?', options: ['Küçük bir köy', 'Osmanlı başkenti', 'Bizans şehri', 'Selçuklu kalesi'], correctIndex: 1 },
            { id: 'hist_y_m_12', type: 'DATE', question: 'Büyük Taarruz hangi yıl yapıldı?', options: ['1921', '1922', '1923', '1924'], correctIndex: 1 },
            { id: 'hist_y_m_13', type: 'PERSON', question: 'II. Mehmet İstanbul\'u fethettiğinde kaç yaşındaydı?', options: ['17', '19', '21', '23'], correctIndex: 2 },
            { id: 'hist_y_m_14', type: 'EVENT', question: '1071 Malazgirt Savaşı neden önemlidir?', options: ['Osmanlı kuruldu', 'Anadolu\'nun kapısı açıldı', 'İstanbul fethedildi', 'Cumhuriyet ilan edildi'], correctIndex: 1 },
            { id: 'hist_y_m_15', type: 'PLACE', question: 'Ankara neden Kurtuluş Savaşı\'nın merkezi oldu?', options: ['Deniz kenarında olduğu için', 'İşgal altında olmadığı için', 'En büyük şehir olduğu için', 'Osmanlı başkenti olduğu için'], correctIndex: 1 },
        ],
        HARD: [
            { id: 'hist_y_h_1', type: 'ORDER', question: 'Bu olaylardan hangisi diğerlerinden ÖNCE gerçekleşti?', options: ['Saltanatın kaldırılması', 'TBMM\'nin açılması', 'Cumhuriyetin ilanı', 'Lozan Antlaşması'], correctIndex: 1 },
            { id: 'hist_y_h_2', type: 'PERSON', question: 'Çanakkale Savaşı\'nda Atatürk hangi rütbedeydi?', options: ['Yüzbaşı', 'Binbaşı', 'Albay', 'Yarbay'], correctIndex: 2 },
            { id: 'hist_y_h_3', type: 'DATE', question: 'Lozan Antlaşması hangi yıl imzalandı?', options: ['1921', '1922', '1923', '1924'], correctIndex: 2 },
            { id: 'hist_y_h_4', type: 'EVENT', question: 'Büyük Taarruz\'un kazanılması neden önemliydi?', options: ['TBMM açıldı', 'Lozan görüşmeleri başladı', 'Düşman yurttan çıkarıldı', 'Cumhuriyet ilan edildi'], correctIndex: 2 },
            { id: 'hist_y_h_5', type: 'PLACE', question: 'Sakarya Meydan Muharebesi nerede yapıldı?', options: ['Ankara yakınlarında', 'Polatlı yakınlarında', 'Eskişehir yakınlarında', 'Kütahya yakınlarında'], correctIndex: 1 },
            { id: 'hist_y_h_6', type: 'DATE', question: 'Saltanat hangi yıl kaldırıldı?', options: ['1921', '1922', '1923', '1924'], correctIndex: 1 },
            { id: 'hist_y_h_7', type: 'ORDER', question: 'Bu olaylardan hangisi en SON gerçekleşti?', options: ['Sakarya Savaşı', 'Büyük Taarruz', 'Cumhuriyetin ilanı', 'Lozan Antlaşması'], correctIndex: 2 },
            { id: 'hist_y_h_8', type: 'EVENT', question: 'I. İnönü Savaşı\'nın kazanılması neyi sağladı?', options: ['Düşman tamamen yenildi', 'TBMM\'ye güven arttı', 'Cumhuriyet ilan edildi', 'Lozan imzalandı'], correctIndex: 1 },
            { id: 'hist_y_h_9', type: 'PERSON', question: 'TBMM\'nin ilk başkanı kimdir?', options: ['İsmet İnönü', 'Mustafa Kemal', 'Fevzi Çakmak', 'Rauf Orbay'], correctIndex: 1 },
            { id: 'hist_y_h_10', type: 'DATE', question: 'Halifelik hangi yıl kaldırıldı?', options: ['1922', '1923', '1924', '1925'], correctIndex: 2 },
            { id: 'hist_y_h_11', type: 'PLACE', question: 'Mudanya Ateşkesi neden Mudanya\'da imzalandı?', options: ['Başkent olduğu için', 'Deniz yoluyla ulaşım kolay olduğu için', 'Savaş orada bittiği için', 'İtilaf Devletleri istediği için'], correctIndex: 1 },
            { id: 'hist_y_h_12', type: 'EVENT', question: 'Büyük Taarruz ile Mudanya Ateşkesi arasında ne kadar süre vardır?', options: ['Yaklaşık 1 ay', 'Yaklaşık 2 ay', 'Yaklaşık 6 ay', 'Yaklaşık 1 yıl'], correctIndex: 1 },
            { id: 'hist_y_h_13', type: 'ORDER', question: 'Kurtuluş Savaşı\'ndaki savaşların doğru sırası hangisidir?', options: ['I.İnönü - II.İnönü - Sakarya - Büyük Taarruz', 'Sakarya - I.İnönü - II.İnönü - Büyük Taarruz', 'II.İnönü - I.İnönü - Büyük Taarruz - Sakarya', 'I.İnönü - Sakarya - II.İnönü - Büyük Taarruz'], correctIndex: 0 },
            { id: 'hist_y_h_14', type: 'PERSON', question: 'İnönü Savaşlarında Batı Cephesi komutanı kimdi?', options: ['Kazım Karabekir', 'İsmet Paşa', 'Ali Fuat Paşa', 'Refet Paşa'], correctIndex: 1 },
            { id: 'hist_y_h_15', type: 'DATE', question: 'İzmir hangi tarihte kurtarıldı?', options: ['26 Ağustos 1922', '30 Ağustos 1922', '9 Eylül 1922', '11 Ekim 1922'], correctIndex: 2 },
        ],
    },
    // 9-11 yaş
    MIDDLE: {
        EASY: [
            { id: 'hist_m_e_1', type: 'DATE', question: 'Malazgirt Savaşı hangi yılda yapıldı?', options: ['1069', '1071', '1073', '1075'], correctIndex: 1 },
            { id: 'hist_m_e_2', type: 'PERSON', question: 'Malazgirt Savaşı\'nda Selçuklu ordusunu kim komuta etti?', options: ['Melikşah', 'Alparslan', 'Kılıçarslan', 'Tuğrul Bey'], correctIndex: 1 },
            { id: 'hist_m_e_3', type: 'EVENT', question: 'Kurtuluş Savaşı\'nın başlamasının temel sebebi nedir?', options: ['Osmanlı\'nın zayıflaması', 'Anadolu\'nun işgal edilmesi', 'Padişahın istifa etmesi', 'Ekonomik çöküş'], correctIndex: 1 },
            { id: 'hist_m_e_4', type: 'PLACE', question: 'TBMM neden İstanbul yerine Ankara\'da açıldı?', options: ['Ankara daha büyüktü', 'İstanbul işgal altındaydı', 'Atatürk Ankara\'da doğdu', 'Ankara başkent olacaktı'], correctIndex: 1 },
            { id: 'hist_m_e_5', type: 'DATE', question: 'TBMM hangi tarihte açıldı?', options: ['19 Mayıs 1919', '23 Nisan 1920', '30 Ağustos 1922', '29 Ekim 1923'], correctIndex: 1 },
            { id: 'hist_m_e_6', type: 'PERSON', question: 'Kanuni Sultan Süleyman\'ın saltanat süresi ne kadardır?', options: ['36 yıl', '40 yıl', '46 yıl', '50 yıl'], correctIndex: 2 },
            { id: 'hist_m_e_7', type: 'PLACE', question: 'İstanbul hangi padişah döneminde Osmanlı başkenti oldu?', options: ['I. Murat', 'Yıldırım Bayezid', 'II. Mehmet (Fatih)', 'II. Bayezid'], correctIndex: 2 },
            { id: 'hist_m_e_8', type: 'EVENT', question: 'Çanakkale Savaşı\'nın en önemli sonucu nedir?', options: ['Osmanlı toprak kazandı', 'I. Dünya Savaşı uzadı', 'Rusya savaştan çekildi', 'Atatürk tanındı'], correctIndex: 1 },
            { id: 'hist_m_e_9', type: 'PERSON', question: 'Osman Gazi\'nin beyliğini devlete dönüştüren oğlu kimdir?', options: ['Süleyman Paşa', 'Orhan Gazi', 'Alaeddin Paşa', 'Murad Bey'], correctIndex: 1 },
            { id: 'hist_m_e_10', type: 'DATE', question: 'Osmanlı Devleti\'nin kuruluş yılı hangisidir?', options: ['1298', '1299', '1300', '1301'], correctIndex: 1 },
            { id: 'hist_m_e_11', type: 'PLACE', question: 'Büyük Selçuklu Devleti\'nin başkenti neresidir?', options: ['Rey', 'İsfahan', 'Bağdat', 'Nişabur'], correctIndex: 1 },
            { id: 'hist_m_e_12', type: 'EVENT', question: 'Haçlı Seferleri\'nin Avrupa\'ya etkisi ne oldu?', options: ['Avrupa fakirleşti', 'Doğu kültürü Avrupa\'ya taşındı', 'Avrupa\'da savaşlar çoğaldı', 'Hristiyanlık zayıfladı'], correctIndex: 1 },
            { id: 'hist_m_e_13', type: 'PERSON', question: 'Yavuz Sultan Selim hangi seferle halifeliği Osmanlı\'ya taşıdı?', options: ['İran Seferi', 'Mısır Seferi', 'Balkan Seferi', 'Anadolu Seferi'], correctIndex: 1 },
            { id: 'hist_m_e_14', type: 'DATE', question: 'Preveze Deniz Savaşı hangi yıl yapıldı?', options: ['1536', '1537', '1538', '1539'], correctIndex: 2 },
            { id: 'hist_m_e_15', type: 'PLACE', question: 'Orhan Gazi Bursa\'yı aldıktan sonra ne yaptı?', options: ['İstanbul\'u kuşattı', 'Bursa\'yı başkent yaptı', 'Edirne\'yi fethetti', 'Söğüt\'e döndü'], correctIndex: 1 },
        ],
        MEDIUM: [
            { id: 'hist_m_m_1', type: 'ORDER', question: 'Kurtuluş Savaşı sürecinde bu olayların doğru sırası nedir?', options: ['Amasya Genelgesi - Erzurum Kongresi - Sivas Kongresi - TBMM', 'Erzurum Kongresi - Amasya Genelgesi - TBMM - Sivas Kongresi', 'Sivas Kongresi - Erzurum Kongresi - Amasya Genelgesi - TBMM', 'TBMM - Amasya Genelgesi - Erzurum Kongresi - Sivas Kongresi'], correctIndex: 0 },
            { id: 'hist_m_m_2', type: 'EVENT', question: 'Sakarya Savaşı\'nın kazanılması Atatürk\'e hangi unvanı kazandırdı?', options: ['Gazi ve Mareşal', 'Başkomutan', 'Cumhurbaşkanı', 'Müşir'], correctIndex: 0 },
            { id: 'hist_m_m_3', type: 'PERSON', question: '"Dur yolcu! Bilmeden gelip bastığın bu toprak..." dizesini kim yazdı?', options: ['Mehmet Akif Ersoy', 'Necmettin Halil Onan', 'Yahya Kemal Beyatlı', 'Tevfik Fikret'], correctIndex: 1 },
            { id: 'hist_m_m_4', type: 'DATE', question: 'Lozan Antlaşması hangi tarihte imzalandı?', options: ['24 Temmuz 1922', '24 Temmuz 1923', '24 Ağustos 1923', '29 Ekim 1923'], correctIndex: 1 },
            { id: 'hist_m_m_5', type: 'ORDER', question: 'Bu inkılaplardan hangisi en son gerçekleşti?', options: ['Saltanatın kaldırılması (1922)', 'Cumhuriyetin ilanı (1923)', 'Halifeliğin kaldırılması (1924)', 'Soyadı Kanunu (1934)'], correctIndex: 3 },
            { id: 'hist_m_m_6', type: 'PERSON', question: 'Yavuz Sultan Selim Mısır Seferi\'nde kimi yendi?', options: ['Safevi Devleti', 'Memlük Devleti', 'Bizans İmparatorluğu', 'Karakoyunlular'], correctIndex: 1 },
            { id: 'hist_m_m_7', type: 'EVENT', question: 'I. İnönü Savaşı\'nın kazanılmasının siyasi sonucu ne oldu?', options: ['Cumhuriyet ilan edildi', 'Londra Konferansı\'na çağrıldık', 'Lozan başladı', 'Saltanat kaldırıldı'], correctIndex: 1 },
            { id: 'hist_m_m_8', type: 'PLACE', question: 'Başkomutanlık Meydan Muharebesi (Büyük Taarruz) nerede yapıldı?', options: ['Dumlupınar - Kütahya', 'Polatlı - Ankara', 'Sakarya - Eskişehir', 'Afyon - İzmir'], correctIndex: 0 },
            { id: 'hist_m_m_9', type: 'DATE', question: 'II. Viyana Kuşatması hangi yıl yapıldı?', options: ['1681', '1682', '1683', '1684'], correctIndex: 2 },
            { id: 'hist_m_m_10', type: 'EVENT', question: 'Osmanlı\'nın duraklama döneminin başlamasının temel nedeni nedir?', options: ['Toprak kaybı', 'İç düzenin bozulması', 'Padişahların güçlenmesi', 'Ordunun büyümesi'], correctIndex: 1 },
            { id: 'hist_m_m_11', type: 'PERSON', question: 'Barbaros Hayrettin Paşa Preveze\'de kimi yendi?', options: ['İspanyol donanmasını', 'Andrea Doria komutasındaki Haçlı donanmasını', 'Venedik donanmasını', 'Portekiz donanmasını'], correctIndex: 1 },
            { id: 'hist_m_m_12', type: 'PLACE', question: 'Mohaç Savaşı hangi ülkenin topraklarında yapıldı?', options: ['Avusturya', 'Macaristan', 'Sırbistan', 'Romanya'], correctIndex: 1 },
            { id: 'hist_m_m_13', type: 'ORDER', question: 'Osmanlı başkentlerinin doğru kronolojik sırası nedir?', options: ['Söğüt - Bursa - Edirne - İstanbul', 'Bursa - Söğüt - Edirne - İstanbul', 'Söğüt - Edirne - Bursa - İstanbul', 'Bursa - Edirne - Söğüt - İstanbul'], correctIndex: 0 },
            { id: 'hist_m_m_14', type: 'EVENT', question: 'Amasya Genelgesi\'nin en önemli kararı nedir?', options: ['Savaş ilan edilmesi', 'Vatanın bütünlüğünün tehlikede olduğunun açıklanması', 'Cumhuriyetin ilan edilmesi', 'Padişahın görevden alınması'], correctIndex: 1 },
            { id: 'hist_m_m_15', type: 'DATE', question: 'Erzurum Kongresi hangi yıl yapıldı?', options: ['1918', '1919', '1920', '1921'], correctIndex: 1 },
        ],
        HARD: [
            { id: 'hist_m_h_1', type: 'DATE', question: 'Osmanlı Devleti\'nin kuruluş tarihi 1299\'dur. Aynı yıl hangi olay olmuştur?', options: ['Söğüt alındı', 'Karacahisar fethedildi', 'Osman Bey bağımsızlığını ilan etti', 'Bursa kuşatıldı'], correctIndex: 2 },
            { id: 'hist_m_h_2', type: 'EVENT', question: 'Mondros Ateşkesi\'nin 7. maddesi neden tehlikeliydi?', options: ['Ordu terhis edilecekti', 'İtilaf Devletleri istedikleri yeri işgal edebilecekti', 'Boğazlar kapatılacaktı', 'Osmanlı toprakları paylaşılacaktı'], correctIndex: 1 },
            { id: 'hist_m_h_3', type: 'PERSON', question: 'Sivas Kongresi\'nde Atatürk\'e karşı çıkan delegelerin temel kaygısı neydi?', options: ['Savaş istemiyorlardı', 'Manda yönetimini savunuyorlardı', 'Padişahı destekliyorlardı', 'Osmanlı\'yı kurtarmak istiyorlardı'], correctIndex: 1 },
            { id: 'hist_m_h_4', type: 'ORDER', question: 'Milli Mücadele\'nin diplomatik adımlarının doğru sırası nedir?', options: ['Amasya Genelgesi - Erzurum Kongresi - Sivas Kongresi', 'Erzurum Kongresi - Amasya Genelgesi - Sivas Kongresi', 'Sivas Kongresi - Amasya Genelgesi - Erzurum Kongresi', 'Amasya Genelgesi - Sivas Kongresi - Erzurum Kongresi'], correctIndex: 0 },
            { id: 'hist_m_h_5', type: 'DATE', question: 'Misakımilli hangi tarihte kabul edildi?', options: ['12 Ocak 1920', '28 Ocak 1920', '23 Nisan 1920', '10 Ağustos 1920'], correctIndex: 1 },
            { id: 'hist_m_h_6', type: 'EVENT', question: 'Tekalif-i Milliye emirleri niçin çıkarıldı?', options: ['Yeni devlet kurmak için', 'Sakarya Savaşı öncesi orduyu donatmak için', 'Vergi toplamak için', 'Halkı savaşa ikna etmek için'], correctIndex: 1 },
            { id: 'hist_m_h_7', type: 'PLACE', question: 'Kıbrıs Barış Harekâtı (1974) hangi olaydan sonra yapıldı?', options: ['Kıbrıs\'ta Türklere saldırı', 'Yunanistan\'ın Kıbrıs\'ı Yunanistan\'a bağlama girişimi', 'BM kararı', 'NATO anlaşması'], correctIndex: 1 },
            { id: 'hist_m_h_8', type: 'PERSON', question: 'Kazım Karabekir Doğu Cephesi\'nde hangi devlete karşı savaştı?', options: ['Rusya', 'Ermenistan', 'Gürcistan', 'İran'], correctIndex: 1 },
            { id: 'hist_m_h_9', type: 'DATE', question: 'Sevr Antlaşması hangi tarihte imzalandı?', options: ['30 Ekim 1918', '10 Ağustos 1920', '20 Ekim 1921', '24 Temmuz 1923'], correctIndex: 1 },
            { id: 'hist_m_h_10', type: 'EVENT', question: 'Kütahya-Eskişehir Savaşları\'ndan sonra TBMM hangi kararı aldı?', options: ['Barış istedi', 'Atatürk\'e Başkomutanlık verdi', 'Lozan\'a delege gönderdi', 'Saltanatı kaldırdı'], correctIndex: 1 },
            { id: 'hist_m_h_11', type: 'ORDER', question: 'Cumhuriyet dönemi inkılaplarının doğru kronolojik sırası hangisidir?', options: ['Harf İnkılabı (1928) - Soyadı Kanunu (1934) - Kadınlara seçme hakkı (1934)', 'Soyadı Kanunu (1934) - Harf İnkılabı (1928) - Kadınlara seçme hakkı (1934)', 'Kadınlara seçme hakkı (1934) - Harf İnkılabı (1928) - Soyadı Kanunu (1934)', 'Harf İnkılabı (1928) - Kadınlara seçme hakkı (1934) - Soyadı Kanunu (1934)'], correctIndex: 0 },
            { id: 'hist_m_h_12', type: 'PERSON', question: 'Ali Fuat Cebesoy Milli Mücadele\'de hangi görevi üstlendi?', options: ['Doğu Cephesi komutanı', 'Batı Cephesi komutanı', 'Moskova büyükelçisi', 'Genelkurmay başkanı'], correctIndex: 2 },
            { id: 'hist_m_h_13', type: 'DATE', question: 'Türk Medeni Kanunu hangi yıl kabul edildi?', options: ['1924', '1925', '1926', '1927'], correctIndex: 2 },
            { id: 'hist_m_h_14', type: 'EVENT', question: 'Takrir-i Sükûn Kanunu hangi olay üzerine çıkarıldı?', options: ['Menemen Olayı', 'Şeyh Said İsyanı', '31 Mart Vakası', 'Çerkez Ethem İsyanı'], correctIndex: 1 },
            { id: 'hist_m_h_15', type: 'PLACE', question: 'Menemen Olayı\'nda isyancılar kimi şehit etti?', options: ['Bir valiyi', 'Asteğmen Kubilay\'ı', 'Bir milletvekilini', 'Bir generali'], correctIndex: 1 },
        ],
    },
    // 12+ yaş
    ADVANCED: {
        EASY: [
            { id: 'hist_a_e_1', type: 'DATE', question: 'I. Dünya Savaşı hangi yıl başladı?', options: ['1913', '1914', '1915', '1916'], correctIndex: 1 },
            { id: 'hist_a_e_2', type: 'EVENT', question: 'Tanzimat Fermanı\'nın temel amacı neydi?', options: ['Askeri güçlenme', 'Hukuki eşitlik ve modernleşme', 'Toprak genişlemesi', 'Ekonomik kalkınma'], correctIndex: 1 },
            { id: 'hist_a_e_3', type: 'PERSON', question: 'Lale Devri hangi padişah dönemindedir?', options: ['II. Mustafa', 'III. Ahmet', 'I. Mahmut', 'III. Osman'], correctIndex: 1 },
            { id: 'hist_a_e_4', type: 'DATE', question: 'Fransız İhtilali hangi yılda oldu?', options: ['1787', '1788', '1789', '1790'], correctIndex: 2 },
            { id: 'hist_a_e_5', type: 'EVENT', question: 'Sanayi Devrimi\'nin başlamasında en etkili buluş hangisiydi?', options: ['Matbaa', 'Buhar makinesi', 'Telgraf', 'Barut'], correctIndex: 1 },
            { id: 'hist_a_e_6', type: 'DATE', question: 'II. Dünya Savaşı\'nda Almanya ne zaman teslim oldu?', options: ['Mayıs 1944', 'Ağustos 1944', 'Mayıs 1945', 'Ağustos 1945'], correctIndex: 2 },
            { id: 'hist_a_e_7', type: 'PERSON', question: 'Kristof Kolomb 1492\'de Amerika\'ya ulaştığında nereye vardığını sanıyordu?', options: ['Afrika', 'Hindistan', 'Çin', 'Japonya'], correctIndex: 1 },
            { id: 'hist_a_e_8', type: 'EVENT', question: 'Rönesans\'ın doğmasının temel nedeni neydi?', options: ['Savaşların artması', 'Antik Yunan ve Roma eserlerinin yeniden keşfi', 'Kilise\'nin güçlenmesi', 'Coğrafi keşifler'], correctIndex: 1 },
            { id: 'hist_a_e_9', type: 'DATE', question: 'Amerikan Bağımsızlık Bildirgesi hangi yıl ilan edildi?', options: ['1774', '1775', '1776', '1777'], correctIndex: 2 },
            { id: 'hist_a_e_10', type: 'PERSON', question: 'Napolyon Savaşları Avrupa\'yı nasıl etkiledi?', options: ['Krallıkları güçlendirdi', 'Milliyetçilik fikrini yaydı', 'Sömürgeciliği bitirdi', 'Feodalizmi geri getirdi'], correctIndex: 1 },
            { id: 'hist_a_e_11', type: 'EVENT', question: 'Soğuk Savaş döneminde iki kutup hangi ideolojileri temsil ediyordu?', options: ['Monarşi ve cumhuriyet', 'Kapitalizm ve komünizm', 'Faşizm ve demokrasi', 'Liberalizm ve muhafazakârlık'], correctIndex: 1 },
            { id: 'hist_a_e_12', type: 'PLACE', question: 'Berlin Duvarı hangi yıl yıkıldı?', options: ['1988', '1989', '1990', '1991'], correctIndex: 1 },
            { id: 'hist_a_e_13', type: 'DATE', question: 'SSCB hangi yıl resmen dağıldı?', options: ['1989', '1990', '1991', '1992'], correctIndex: 2 },
            { id: 'hist_a_e_14', type: 'PERSON', question: 'Martin Luther King Jr. ile Malcolm X arasındaki temel fark neydi?', options: ['Farklı ülkelerdendiler', 'Mücadele yöntemleri farklıydı', 'Farklı dönemlerde yaşadılar', 'Farklı haklar için savaştılar'], correctIndex: 1 },
            { id: 'hist_a_e_15', type: 'EVENT', question: 'Hiroşima\'ya atom bombası atılmasının savaşa etkisi ne oldu?', options: ['Savaş uzadı', 'Japonya teslim oldu', 'Almanya teslim oldu', 'Yeni cephe açıldı'], correctIndex: 1 },
        ],
        MEDIUM: [
            { id: 'hist_a_m_1', type: 'ORDER', question: 'Osmanlı reform hareketlerinin doğru kronolojik sırası hangisidir?', options: ['Tanzimat (1839) - Islahat (1856) - I. Meşrutiyet (1876)', 'Islahat (1856) - Tanzimat (1839) - I. Meşrutiyet (1876)', 'I. Meşrutiyet (1876) - Tanzimat (1839) - Islahat (1856)', 'Tanzimat (1839) - I. Meşrutiyet (1876) - Islahat (1856)'], correctIndex: 0 },
            { id: 'hist_a_m_2', type: 'PERSON', question: 'Büyük Hun Devleti\'ni en güçlü dönemine ulaştıran hükümdar kimdir?', options: ['Teoman', 'Mete Han', 'Attila', 'İstemi Yabgu'], correctIndex: 1 },
            { id: 'hist_a_m_3', type: 'PLACE', question: 'Göktürk Devleti\'nin merkezi olan Ötüken nerededir?', options: ['Kazakistan', 'Moğolistan', 'Özbekistan', 'Kırgızistan'], correctIndex: 1 },
            { id: 'hist_a_m_4', type: 'ORDER', question: 'Bu savaşların kronolojik sırası hangisidir?', options: ['Trablusgarp (1911) - Balkan (1912) - I. Dünya (1914)', 'Balkan (1912) - Trablusgarp (1911) - I. Dünya (1914)', 'I. Dünya (1914) - Trablusgarp (1911) - Balkan (1912)', 'Trablusgarp (1911) - I. Dünya (1914) - Balkan (1912)'], correctIndex: 0 },
            { id: 'hist_a_m_5', type: 'DATE', question: 'I. Meşrutiyet hangi yıl ilan edildi?', options: ['1874', '1875', '1876', '1877'], correctIndex: 2 },
            { id: 'hist_a_m_6', type: 'EVENT', question: 'Islahat Fermanı\'nın Tanzimat\'tan farkı neydi?', options: ['Sadece askeri reformları kapsıyordu', 'Gayrimüslimlere daha fazla hak tanıyordu', 'Padişahın yetkilerini artırıyordu', 'Sadece ekonomik reformları kapsıyordu'], correctIndex: 1 },
            { id: 'hist_a_m_7', type: 'PERSON', question: 'II. Meşrutiyet\'in ilanında İttihat ve Terakki\'nin öne çıkan liderlerinden biri kimdir?', options: ['Mustafa Kemal', 'Enver Paşa', 'Kazım Karabekir', 'Ali Fuat Cebesoy'], correctIndex: 1 },
            { id: 'hist_a_m_8', type: 'DATE', question: 'Trablusgarp Savaşı hangi yıllar arasında yapıldı?', options: ['1910-1911', '1911-1912', '1912-1913', '1913-1914'], correctIndex: 1 },
            { id: 'hist_a_m_9', type: 'EVENT', question: 'Coğrafi keşiflerin Osmanlı\'ya en büyük etkisi ne oldu?', options: ['Askeri güç kaybı', 'Ticaret yollarının önemini yitirmesi', 'Toprak kaybı', 'Nüfus azalması'], correctIndex: 1 },
            { id: 'hist_a_m_10', type: 'PERSON', question: 'Mete Han\'ın en önemli askeri yeniliği neydi?', options: ['Ateşli silahlar', 'Onlu sistem (turan taktiği dahil)', 'Deniz kuvvetleri', 'Kuşatma makineleri'], correctIndex: 1 },
            { id: 'hist_a_m_11', type: 'PLACE', question: 'İpek Yolu hangi iki bölgeyi birbirine bağlıyordu?', options: ['Avrupa ve Afrika', 'Çin ve Akdeniz', 'Hindistan ve Mısır', 'Rusya ve Arabistan'], correctIndex: 1 },
            { id: 'hist_a_m_12', type: 'ORDER', question: 'İlk Türk devletlerinin kuruluş sırası hangisidir?', options: ['Asya Hunları - Göktürkler - Uygurlar', 'Göktürkler - Asya Hunları - Uygurlar', 'Uygurlar - Asya Hunları - Göktürkler', 'Asya Hunları - Uygurlar - Göktürkler'], correctIndex: 0 },
            { id: 'hist_a_m_13', type: 'DATE', question: 'Uygur Devleti hangi yıl kuruldu?', options: ['742', '744', '745', '747'], correctIndex: 1 },
            { id: 'hist_a_m_14', type: 'EVENT', question: 'Moğol İmparatorluğu\'nun dağılmasının temel nedeni neydi?', options: ['Askeri yenilgi', 'Çok geniş toprakların yönetilememesi', 'Ekonomik çöküş', 'Dış baskılar'], correctIndex: 1 },
            { id: 'hist_a_m_15', type: 'PERSON', question: 'Timur, Ankara Savaşı\'nda (1402) kimi yendi?', options: ['II. Murat', 'Yıldırım Bayezid', 'Çelebi Mehmet', 'II. Bayezid'], correctIndex: 1 },
        ],
        HARD: [
            { id: 'hist_a_h_1', type: 'EVENT', question: 'III. Selim\'in Nizam-ı Cedid reformu neden başarısız oldu?', options: ['Halk desteklemedi', 'Yeniçeriler isyan etti', 'Ekonomik kaynak yoktu', 'Avrupa devletleri engelledi'], correctIndex: 1 },
            { id: 'hist_a_h_2', type: 'ORDER', question: 'Osmanlı\'nın son dönemi antlaşmalarının kronolojik sırası hangisidir?', options: ['Mondros (1918) - Sevr (1920) - Mudanya (1922) - Lozan (1923)', 'Sevr (1920) - Mondros (1918) - Lozan (1923) - Mudanya (1922)', 'Mondros (1918) - Mudanya (1922) - Sevr (1920) - Lozan (1923)', 'Sevr (1920) - Mondros (1918) - Mudanya (1922) - Lozan (1923)'], correctIndex: 0 },
            { id: 'hist_a_h_3', type: 'DATE', question: 'Vaka-i Hayriye (Yeniçeri Ocağı\'nın kaldırılması) hangi yıl gerçekleşti?', options: ['1824', '1825', '1826', '1827'], correctIndex: 2 },
            { id: 'hist_a_h_4', type: 'PERSON', question: 'Kanuni döneminde Fransızlara verilen kapitülasyonların asıl amacı neydi?', options: ['Fransızlarla ittifak kurmak', 'Akdeniz ticaretini canlandırmak', 'Habsburg\'lara karşı Fransa\'yı güçlendirmek', 'Avrupa\'ya açılmak'], correctIndex: 2 },
            { id: 'hist_a_h_5', type: 'EVENT', question: 'Vaka-i Hayriye\'nin Osmanlı modernleşmesindeki önemi nedir?', options: ['İlk anayasa ilan edildi', 'Batı tarzı reformların önündeki en büyük engel kalktı', 'Padişahın yetkileri sınırlandırıldı', 'Ayanlarla anlaşma yapıldı'], correctIndex: 1 },
            { id: 'hist_a_h_6', type: 'DATE', question: 'I. Balkan Savaşı hangi yıl başladı?', options: ['1911', '1912', '1913', '1914'], correctIndex: 1 },
            { id: 'hist_a_h_7', type: 'PERSON', question: 'Tanzimat Fermanı\'nı hazırlayan ve okuyan devlet adamı kimdir?', options: ['Âli Paşa', 'Mustafa Reşit Paşa', 'Fuat Paşa', 'Mithat Paşa'], correctIndex: 1 },
            { id: 'hist_a_h_8', type: 'EVENT', question: 'Sened-i İttifak (1808) neden önemlidir?', options: ['İlk anayasa olmasından', 'Padişahın yetkilerinin ilk kez sınırlandırılmasından', 'Yeniçerilerin kaldırılmasından', 'Tanzimat\'ın başlamasından'], correctIndex: 1 },
            { id: 'hist_a_h_9', type: 'DATE', question: 'Kanun-i Esasi (ilk Osmanlı anayasası) hangi yıl ilan edildi?', options: ['1875', '1876', '1877', '1878'], correctIndex: 1 },
            { id: 'hist_a_h_10', type: 'ORDER', question: 'Osmanlı\'nın ilk dört padişahının doğru sırası hangisidir?', options: ['Osman - Orhan - I. Murat - Yıldırım Bayezid', 'Orhan - Osman - I. Murat - Yıldırım Bayezid', 'Osman - I. Murat - Orhan - Yıldırım Bayezid', 'Osman - Orhan - Yıldırım Bayezid - I. Murat'], correctIndex: 0 },
            { id: 'hist_a_h_11', type: 'PLACE', question: 'Karlofça Antlaşması\'nın (1699) önemi nedir?', options: ['Osmanlı ilk kez toprak kazandı', 'Osmanlı ilk kez geniş çaplı toprak kaybetti', 'Osmanlı Avrupa\'dan tamamen çekildi', 'Osmanlı\'nın yükselme dönemi başladı'], correctIndex: 1 },
            { id: 'hist_a_h_12', type: 'EVENT', question: 'Patrona Halil İsyanı\'nın (1730) sonuçlarından biri nedir?', options: ['Lale Devri sona erdi ve III. Ahmet tahttan indirildi', 'Yeniçeri Ocağı kaldırıldı', 'I. Meşrutiyet ilan edildi', 'Tanzimat Fermanı hazırlandı'], correctIndex: 0 },
            { id: 'hist_a_h_13', type: 'PERSON', question: 'Ziya Gökalp\'in "Türkleşmek, İslamlaşmak, Muasırlaşmak" düşüncesi neyi savunuyordu?', options: ['Osmanlıcılık ideolojisini', 'Türk kimliğini koruyarak çağdaşlaşmayı', 'İslam birliğini', 'Batı taklitçiliğini'], correctIndex: 1 },
            { id: 'hist_a_h_14', type: 'DATE', question: '31 Mart Vakası hangi yıl gerçekleşti?', options: ['1908', '1909', '1910', '1911'], correctIndex: 1 },
            { id: 'hist_a_h_15', type: 'EVENT', question: 'Babıali Baskını\'nın (1913) Osmanlı siyasetine etkisi ne oldu?', options: ['Demokrasi güçlendi', 'İttihat ve Terakki tek parti diktatörlüğü kurdu', 'Padişahın yetkileri arttı', 'Meclis güçlendi'], correctIndex: 1 },
        ],
    },
};

// Yaş ve zorluğa göre soru havuzu seç
const getQuestionPool = (age: number, difficulty: Difficulty): HistoryQuestion[] => {
    let ageGroup: string;
    if (age <= 8) ageGroup = 'YOUNG';
    else if (age <= 11) ageGroup = 'MIDDLE';
    else ageGroup = 'ADVANCED';

    return QUESTIONS[ageGroup][difficulty] || QUESTIONS[ageGroup]['MEDIUM'];
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

const getQuestionTypeTitle = (type: QuestionType): string => {
    switch (type) {
        case 'DATE': return 'Tarih';
        case 'PERSON': return 'Kişi';
        case 'EVENT': return 'Olay';
        case 'PLACE': return 'Yer';
        case 'ORDER': return 'Sıralama';
    }
};

const HistoryExamGame: React.FC<HistoryExamGameProps> = ({
    gameState,
    setGameState,
    difficulty = 'MEDIUM',
    age = 10,
}) => {
    if (!gameState || !setGameState) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Yükleniyor...</Text>
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
                <Text style={styles.loadingText}>Sorular hazırlanıyor...</Text>
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
                        Doğru cevap: {currentQuestion.options[currentQuestion.correctIndex]}
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
