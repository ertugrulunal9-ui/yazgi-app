import type { Difficulty } from '../../components/exams/MiniGameContainer';
import { buildFriendlyHardPool } from '../../components/exams/difficultyTuning';

export type QuestionType = 'SYNONYM' | 'ANTONYM' | 'MEANING' | 'FILL_BLANK' | 'SPELLING';


export interface TurkishQuestion {
    id: string;
    type: QuestionType;
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

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
export const getQuestionPool = (age: number, difficulty: Difficulty): TurkishQuestion[] => {
    if (age <= 8) {
        return QUESTIONS_BY_AGE.YOUNG;
    }

    if (age <= 11) {
        return buildFriendlyHardPool(
            difficulty,
            QUESTIONS_BY_AGE.YOUNG,
            QUESTIONS_BY_AGE.MIDDLE
        );
    }

    return buildFriendlyHardPool(
        difficulty,
        QUESTIONS_BY_AGE.MIDDLE,
        QUESTIONS_BY_AGE.ADVANCED
    );
};
