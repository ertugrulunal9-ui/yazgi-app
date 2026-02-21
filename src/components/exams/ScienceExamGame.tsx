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
import { Difficulty, GameState } from './MiniGameContainer';
import seenQuestionsTracker from '../../utils/seenQuestionsTracker';
import { balanceCorrectAnswerDistribution } from './questionOptionBalancer';

type QuestionType = 'EXPERIMENT' | 'BODY' | 'NATURE' | 'PHYSICS' | 'CHEMISTRY';

interface ScienceQuestion {
    id: string;
    type: QuestionType;
    question: string;
    options: string[];
    correctIndex: number;
}

interface ScienceExamGameProps {
    gameState?: GameState;
    setGameState?: React.Dispatch<React.SetStateAction<GameState>>;
    difficulty?: Difficulty;
    age?: number;
}

// Soru havuzları - Yaşa göre (Genişletilmiş) - Benzersiz ID'ler ile
const QUESTIONS_BY_AGE: Record<string, ScienceQuestion[]> = {
    // 6-8 yaş - Temel bilim (anlamlı çeldiriciler, "which/what" soruları)
    YOUNG: [
        { id: 'sci_y_1', type: 'NATURE', question: 'Güneş ne tür bir gök cismidir?', options: ['Gezegen', 'Yıldız', 'Uydu', 'Kuyruklu yıldız'], correctIndex: 1 },
        { id: 'sci_y_2', type: 'BODY', question: 'Vücudumuzda kemikleri birbirine ne bağlar?', options: ['Kaslar', 'Damarlar', 'Eklemler', 'Sinirler'], correctIndex: 2 },
        { id: 'sci_y_3', type: 'NATURE', question: 'Bitkiler havadan hangi gazı alır?', options: ['Oksijen', 'Azot', 'Karbondioksit', 'Hidrojen'], correctIndex: 2 },
        { id: 'sci_y_4', type: 'BODY', question: 'Kanımızın kırmızı rengini ne verir?', options: ['Kalsiyum', 'Demir', 'Tuz', 'Şeker'], correctIndex: 1 },
        { id: 'sci_y_5', type: 'NATURE', question: 'Su 0°C\'de ne olur?', options: ['Buharlaşır', 'Donar', 'Kaynar', 'Kurur'], correctIndex: 1 },
        { id: 'sci_y_6', type: 'EXPERIMENT', question: 'Mıknatıs aşağıdakilerden hangisini çeker?', options: ['Bakır tel', 'Demir çivi', 'Alüminyum folyo', 'Pirinç düğme'], correctIndex: 1 },
        { id: 'sci_y_7', type: 'NATURE', question: 'Dünya\'nın Güneş etrafındaki bir tam turu ne kadar sürer?', options: ['Bir gün', 'Bir ay', 'Bir yıl', 'Bir hafta'], correctIndex: 2 },
        { id: 'sci_y_8', type: 'BODY', question: 'Kalp vücutta hangi görevi yapar?', options: ['Havayı temizler', 'Yemeği sindirir', 'Kanı pompalar', 'Kemikleri korur'], correctIndex: 2 },
        { id: 'sci_y_9', type: 'NATURE', question: 'Bulutlardaki su damlaları yere düşünce ne olur?', options: ['Kar yağar', 'Yağmur yağar', 'Dolu yağar', 'Sis oluşur'], correctIndex: 1 },
        { id: 'sci_y_10', type: 'EXPERIMENT', question: 'Işık en hızlı hangi ortamda ilerler?', options: ['Suda', 'Havada', 'Camda', 'Boşlukta (uzayda)'], correctIndex: 3 },
        { id: 'sci_y_11', type: 'NATURE', question: 'Gökkuşağı ne zaman oluşur?', options: ['Sadece kışın', 'Gece karanlığında', 'Güneşle yağmur birlikte olduğunda', 'Rüzgâr estiğinde'], correctIndex: 2 },
        { id: 'sci_y_12', type: 'BODY', question: 'Nefes alırken hava ilk nereye gider?', options: ['Mideye', 'Kalbe', 'Akciğerlere', 'Beyine'], correctIndex: 2 },
        { id: 'sci_y_13', type: 'NATURE', question: 'Ay neden parlar?', options: ['Kendi ışığı vardır', 'Güneş ışığını yansıtır', 'Yıldızlardan ışık alır', 'Dünya onu aydınlatır'], correctIndex: 1 },
        { id: 'sci_y_14', type: 'EXPERIMENT', question: 'Buz eriyince hangi hâle geçer?', options: ['Gaz hâli', 'Sıvı hâli', 'Katı hâli', 'Plazma hâli'], correctIndex: 1 },
        { id: 'sci_y_15', type: 'BODY', question: 'Gözümüzün hangi kısmı renkleri görür?', options: ['Göz kapağı', 'Göz bebeği', 'Retina (ağ tabaka)', 'Kirpikler'], correctIndex: 2 },
        { id: 'sci_y_16', type: 'NATURE', question: 'Yaprak döken ağaçlar neden sonbaharda yapraklarını döker?', options: ['Rüzgâr koparır', 'Su kaybını azaltmak için', 'Soğuktan donarlar', 'Böcekler yer'], correctIndex: 1 },
        { id: 'sci_y_17', type: 'EXPERIMENT', question: 'Tahta neden suda yüzer?', options: ['İçi boştur', 'Sudan hafiftir', 'Su onu iter', 'Düz şekildedir'], correctIndex: 1 },
        { id: 'sci_y_18', type: 'BODY', question: 'Yediğimiz yiyecekler mideden sonra nereye geçer?', options: ['Kalbe', 'Akciğere', 'İnce bağırsağa', 'Beyine'], correctIndex: 2 },
        { id: 'sci_y_19', type: 'NATURE', question: 'Karın beyaz görünmesinin sebebi nedir?', options: ['Buzdan yapılmıştır', 'Suyun doğal rengidir', 'Işığı her yöne yansıtır', 'Havadaki tozdan dolayıdır'], correctIndex: 2 },
        { id: 'sci_y_20', type: 'BODY', question: 'Kulağımızda sesi titreşime çeviren kısım hangisidir?', options: ['Kulak memesi', 'Kulak zarı', 'Kulak kıkırdağı', 'Kulak kanalı'], correctIndex: 1 },
        { id: 'sci_y_21', type: 'EXPERIMENT', question: 'Elektrik bir devrede ne boyunca akar?', options: ['Plastik boru', 'İplik', 'Metal tel', 'Lastik bant'], correctIndex: 2 },
        { id: 'sci_y_22', type: 'NATURE', question: 'Balıkların solungaçları ne işe yarar?', options: ['Yiyecek toplar', 'Sudaki oksijeni alır', 'Yüzmeye yardım eder', 'Sıcaklığı hisseder'], correctIndex: 1 },
        { id: 'sci_y_23', type: 'BODY', question: 'Burnumuzdaki koku algılayan kısım nerededir?', options: ['Burun ucunda', 'Burun deliğinin girişinde', 'Burun boşluğunun üst kısmında', 'Burun kemiğinin içinde'], correctIndex: 2 },
        { id: 'sci_y_24', type: 'EXPERIMENT', question: 'Su 100°C\'de kaynadığında ne olur?', options: ['Buz olur', 'Buhar olur', 'Yoğunlaşır', 'Rengi değişir'], correctIndex: 1 },
        { id: 'sci_y_25', type: 'NATURE', question: 'Gezegenler neden Güneş\'in etrafında döner?', options: ['Güneş\'in manyetik alanı', 'Güneş\'in çekim kuvveti', 'Uzaydaki rüzgâr', 'Diğer gezegenlerin itmesi'], correctIndex: 1 },
    ],
    // 9-11 yaş - Orta seviye (süreç ve anlama soruları, "neden/nasıl" soruları)
    MIDDLE: [
        { id: 'sci_m_1', type: 'PHYSICS', question: 'Ses dalgaları neden uzayda (boşlukta) yayılamaz?', options: ['Çok soğuk olduğu için', 'Titreşecek madde olmadığı için', 'Yerçekimi olmadığı için', 'Işık engellediği için'], correctIndex: 1 },
        { id: 'sci_m_2', type: 'CHEMISTRY', question: 'Suyun (H2O) formülündeki "2" neyi ifade eder?', options: ['2 oksijen atomu', '2 su molekülü', '2 hidrojen atomu', '2 kimyasal bağ'], correctIndex: 2 },
        { id: 'sci_m_3', type: 'BODY', question: 'Sindirim ağızda başlar çünkü tükürük ne içerir?', options: ['Asit', 'Enzim', 'Vitamin', 'Mineral'], correctIndex: 1 },
        { id: 'sci_m_4', type: 'NATURE', question: 'Fotosentezde bitkiler ışık enerjisini neye dönüştürür?', options: ['Isı enerjisine', 'Hareket enerjisine', 'Kimyasal enerjiye (besin)', 'Elektrik enerjisine'], correctIndex: 2 },
        { id: 'sci_m_5', type: 'PHYSICS', question: 'Ses katı maddede mi yoksa havada mı daha hızlı yayılır?', options: ['Havada daha hızlı', 'Katıda daha hızlı', 'İkisinde eşit hızda', 'Katıda hiç yayılmaz'], correctIndex: 1 },
        { id: 'sci_m_6', type: 'CHEMISTRY', question: 'Havadaki azot oranı yaklaşık yüzde kaçtır?', options: ['%21', '%50', '%78', '%90'], correctIndex: 2 },
        { id: 'sci_m_7', type: 'BODY', question: 'Sinir hücreleri (nöronlar) bilgiyi nasıl iletir?', options: ['Kan yoluyla', 'Elektriksel sinyallerle', 'Hormonlarla', 'Sıvı basıncıyla'], correctIndex: 1 },
        { id: 'sci_m_8', type: 'EXPERIMENT', question: 'Bakır neden elektrik iletir ama plastik iletmez?', options: ['Bakır daha ağırdır', 'Bakırda serbest elektronlar vardır', 'Bakır manyetiktir', 'Plastik çok kalındır'], correctIndex: 1 },
        { id: 'sci_m_9', type: 'NATURE', question: 'Ay\'ın Dünya\'dan hep aynı yüzünü görmemizin sebebi nedir?', options: ['Ay dönmez', 'Ay ve Dünya aynı hızda döner', 'Ay kendi etrafında ve Dünya etrafında aynı sürede döner', 'Dünya\'nın atmosferi engeller'], correctIndex: 2 },
        { id: 'sci_m_10', type: 'PHYSICS', question: 'Newton\'un hangi yasası "her etkiye eşit ve zıt bir tepki vardır" der?', options: ['Birinci yasa (Eylemsizlik)', 'İkinci yasa (F=ma)', 'Üçüncü yasa (Etki-Tepki)', 'Kütle çekim yasası'], correctIndex: 2 },
        { id: 'sci_m_11', type: 'CHEMISTRY', question: 'Demir neden paslanır?', options: ['Sıcaklık arttığı için', 'Hava ve su ile tepkimeye girdiği için', 'Manyetik alan bozulduğu için', 'Güneş ışığına maruz kaldığı için'], correctIndex: 1 },
        { id: 'sci_m_12', type: 'BODY', question: 'Böbrekler kanı temizlerken oluşan atık sıvıya ne denir?', options: ['Ter', 'İdrar', 'Safra', 'Lenf'], correctIndex: 1 },
        { id: 'sci_m_13', type: 'PHYSICS', question: 'Bir cisim suya bırakıldığında neden yüzer veya batar?', options: ['Şekline bağlıdır', 'Rengine bağlıdır', 'Yoğunluğuna bağlıdır', 'Sıcaklığına bağlıdır'], correctIndex: 2 },
        { id: 'sci_m_14', type: 'NATURE', question: 'Güneş tutulmasında Ay, Güneş ve Dünya nasıl sıralanır?', options: ['Güneş - Dünya - Ay', 'Güneş - Ay - Dünya', 'Ay - Güneş - Dünya', 'Dünya - Güneş - Ay'], correctIndex: 1 },
        { id: 'sci_m_15', type: 'EXPERIMENT', question: 'Metal bir kaşık sıcak çorbaya konduğunda sapı neden ısınır?', options: ['Işınım ile', 'Konveksiyon ile', 'İletim (kondüksiyon) ile', 'Buharlaşma ile'], correctIndex: 2 },
        { id: 'sci_m_16', type: 'BODY', question: 'Egzersiz sırasında kaslar neden daha fazla oksijene ihtiyaç duyar?', options: ['Büyümek için', 'Enerji üretmek için', 'Kanı temizlemek için', 'Kemikleri güçlendirmek için'], correctIndex: 1 },
        { id: 'sci_m_17', type: 'CHEMISTRY', question: 'Karbondioksit (CO2) hangi olayda açığa çıkar?', options: ['Fotosentez', 'Solunum (yanma)', 'Buharlaşma', 'Erime'], correctIndex: 1 },
        { id: 'sci_m_18', type: 'NATURE', question: 'Dünya\'nın Güneş\'e en yakın gezegen olmamasına rağmen yaşam olmasının temel sebebi nedir?', options: ['Manyetik alanı var', 'Sıvı su bulunabilecek mesafede', 'En büyük gezegen', 'Ay\'ı var'], correctIndex: 1 },
        { id: 'sci_m_19', type: 'PHYSICS', question: 'Beyaz ışık bir prizmadan geçince neden renklere ayrılır?', options: ['Prizma ışığı boyar', 'Her renk farklı hızda kırılır', 'Prizma enerji ekler', 'Hava sıcaklığı etkiler'], correctIndex: 1 },
        { id: 'sci_m_20', type: 'BODY', question: 'Refleksler (istemsiz hareketler) neden çok hızlı gerçekleşir?', options: ['Kaslar çok güçlüdür', 'Sinyal beyne gitmeden omurilikten döner', 'Kalp hızlanır', 'Hormonlar salgılanır'], correctIndex: 1 },
        { id: 'sci_m_21', type: 'CHEMISTRY', question: 'Periyodik tabloda aynı sütundaki elementlerin ortak özelliği nedir?', options: ['Aynı kütleye sahiptirler', 'Aynı renktedirler', 'Benzer kimyasal özellikleri vardır', 'Aynı sayıda nötronu vardır'], correctIndex: 2 },
        { id: 'sci_m_22', type: 'EXPERIMENT', question: 'Barometre hangi büyüklüğü ölçer?', options: ['Sıcaklık', 'Nem oranı', 'Hava basıncı', 'Rüzgâr hızı'], correctIndex: 2 },
        { id: 'sci_m_23', type: 'NATURE', question: 'Yunus balığı bir memeli midir yoksa balık mıdır?', options: ['Balıktır, çünkü suda yaşar', 'Memeli, çünkü akciğerle nefes alır ve yavrusunu emzirir', 'Sürüngendir, çünkü pul derisi vardır', 'İki yaşamlıdır, çünkü hem karada hem suda yaşar'], correctIndex: 1 },
        { id: 'sci_m_24', type: 'PHYSICS', question: 'Uzaya giden bir astronot neden ağırlıksız hisseder?', options: ['Uzayda hava yoktur', 'Dünya\'nın çekim alanı dışındadır', 'Sürekli serbest düşüş hâlindedir', 'Uzay kıyafeti hafiftir'], correctIndex: 2 },
        { id: 'sci_m_25', type: 'BODY', question: 'Alyuvarlar (kırmızı kan hücreleri) oksijeni hangi molekül sayesinde taşır?', options: ['Glikoz', 'Hemoglobin', 'Keratin', 'Melanin'], correctIndex: 1 },
    ],
    // 12+ yaş - İleri seviye (mekanizma, süreç ve kavram bağlantısı soruları)
    ADVANCED: [
        { id: 'sci_a_1', type: 'CHEMISTRY', question: 'Periyodik tabloda elementler artan neye göre sıralanır?', options: ['Kütle numarası', 'Atom numarası (proton sayısı)', 'Elektron sayısı', 'Nötron sayısı'], correctIndex: 1 },
        { id: 'sci_a_2', type: 'PHYSICS', question: 'E=mc² formülüne göre küçük bir kütle neden çok büyük enerji verir?', options: ['m çok büyük olduğu için', 'c (ışık hızı) çok büyük olup karesi alındığı için', 'E sabittir', 'Enerji kütleye bağlı değildir'], correctIndex: 1 },
        { id: 'sci_a_3', type: 'BODY', question: 'DNA\'nın çift sarmal yapısındaki iki zinciri birbirine ne bağlar?', options: ['Kovalent bağlar', 'İyonik bağlar', 'Hidrojen bağları (bazlar arası)', 'Van der Waals kuvvetleri'], correctIndex: 2 },
        { id: 'sci_a_4', type: 'CHEMISTRY', question: 'pH değeri 3 olan bir çözelti, pH değeri 5 olan çözeltiden kaç kat daha asidiktir?', options: ['2 kat', '10 kat', '100 kat', '1000 kat'], correctIndex: 2 },
        { id: 'sci_a_5', type: 'PHYSICS', question: 'Çift yarık deneyinde ışığın girişim deseni oluşturması onun hangi özelliğini kanıtlar?', options: ['Parçacık özelliği', 'Dalga özelliği', 'Kütle taşıdığını', 'Elektrik yüklü olduğunu'], correctIndex: 1 },
        { id: 'sci_a_6', type: 'BODY', question: 'Nöronlar arası sinaptik boşlukta sinyal nasıl iletilir?', options: ['Doğrudan elektriksel atlama ile', 'Nörotransmitter (kimyasal madde) ile', 'Kan dolaşımı ile', 'Manyetik alan ile'], correctIndex: 1 },
        { id: 'sci_a_7', type: 'CHEMISTRY', question: 'Karbonun 4 kovalent bağ yapabilmesinin sebebi nedir?', options: ['4 proton içerir', 'Dış kabuğunda 4 elektron vardır', 'Atom kütlesi 12\'dir', '6 nötron içerir'], correctIndex: 1 },
        { id: 'sci_a_8', type: 'NATURE', question: 'Ozon tabakasını incelten ana kimyasal madde grubu hangisidir?', options: ['Karbondioksit gazları', 'Kloroflorokarbonlar (CFC)', 'Azot oksitler', 'Kükürt dioksit'], correctIndex: 1 },
        { id: 'sci_a_9', type: 'PHYSICS', question: 'Mutlak sıfır (-273.15°C) sıcaklığında madde taneciklerinin durumu nedir?', options: ['En yüksek hızda hareket ederler', 'Minimum enerji seviyesindedirler', 'Tamamen yok olurlar', 'Plazma hâline geçerler'], correctIndex: 1 },
        { id: 'sci_a_10', type: 'EXPERIMENT', question: 'Suyun elektrolizinde katotta (negatif elektrot) hangi gaz oluşur?', options: ['Oksijen', 'Hidrojen', 'Karbondioksit', 'Klor'], correctIndex: 1 },
        { id: 'sci_a_11', type: 'PHYSICS', question: 'Planck\'ın kuantum teorisine göre enerji nasıl yayılır?', options: ['Sürekli bir akış olarak', 'Kesikli paketler (kuantumlar) hâlinde', 'Sadece dalga olarak', 'Sadece yüksek sıcaklıkta'], correctIndex: 1 },
        { id: 'sci_a_12', type: 'CHEMISTRY', question: 'Soy gazlar (He, Ne, Ar) neden kararlıdır ve tepkimeye girmez?', options: ['Çok düşük yoğunlukları var', 'Değerlik elektron kabukları tamamen doludur', 'Proton ve nötron sayıları eşittir', 'Atom çapları çok küçüktür'], correctIndex: 1 },
        { id: 'sci_a_13', type: 'BODY', question: 'Tip 1 diyabette insülin üretemeyen hücreler hangileridir?', options: ['Karaciğerdeki hepatositler', 'Pankreastaki beta hücreleri', 'Böbrekteki nefronlar', 'Pankreastaki alfa hücreleri'], correctIndex: 1 },
        { id: 'sci_a_14', type: 'PHYSICS', question: 'Bir yıldız kara deliğe dönüşmek için ne olmalıdır?', options: ['Çok sıcak olmalıdır', 'Kütlesi yeterince büyük olup çekirdek çökmeli', 'Başka bir yıldızla çarpışmalı', 'Galaksinin merkezine yakın olmalı'], correctIndex: 1 },
        { id: 'sci_a_15', type: 'NATURE', question: 'Sera etkisinde CO2 hangi mekanizma ile Dünya\'yı ısıtır?', options: ['Güneş ışığını yoğunlaştırır', 'Dünya\'dan yansıyan kızılötesi ışınımı hapseder', 'Atmosferdeki oksijeni yakar', 'Ozon tabakasını inceltir'], correctIndex: 1 },
        { id: 'sci_a_16', type: 'CHEMISTRY', question: 'İzotoplar aynı elementin atomları olup nesi farklıdır?', options: ['Proton sayısı', 'Elektron sayısı', 'Nötron sayısı', 'Değerlik elektron sayısı'], correctIndex: 2 },
        { id: 'sci_a_17', type: 'BODY', question: 'Mitokondride ATP üretimi sırasında son elektron alıcısı nedir?', options: ['Karbondioksit', 'NADH', 'Oksijen', 'Glikoz'], correctIndex: 2 },
        { id: 'sci_a_18', type: 'PHYSICS', question: 'Bir ışık yılı yaklaşık kaç trilyon kilometredir?', options: ['3,26 trilyon km', '5,88 trilyon km', '9,46 trilyon km', '15,2 trilyon km'], correctIndex: 2 },
        { id: 'sci_a_19', type: 'EXPERIMENT', question: 'Asit-baz titrasyonunda dönüm noktasını belirlemek için ne kullanılır?', options: ['Termometre', 'İndikatör (belirteç)', 'Spektrometre', 'Barometre'], correctIndex: 1 },
        { id: 'sci_a_20', type: 'NATURE', question: 'Besin zincirinde enerji bir basamaktan diğerine geçerken yaklaşık yüzde kaçı aktarılır?', options: ['%1', '%10', '%50', '%90'], correctIndex: 1 },
        { id: 'sci_a_21', type: 'CHEMISTRY', question: 'Tampon çözeltiler ne işe yarar?', options: ['Çözünürlüğü artırır', 'pH değişimini minimize eder', 'Tepkime hızını artırır', 'Çökelme oluşturur'], correctIndex: 1 },
        { id: 'sci_a_22', type: 'PHYSICS', question: 'Ambulans yaklaşırken siren sesinin tizleşmesi hangi olayla açıklanır?', options: ['Rezonans', 'Doppler etkisi', 'Girişim (interferans)', 'Kırınım (difraksiyon)'], correctIndex: 1 },
        { id: 'sci_a_23', type: 'BODY', question: 'mRNA, DNA\'daki genetik bilgiyi nereye taşır?', options: ['Çekirdeğe', 'Mitokondri\'ye', 'Ribozoma', 'Lizozoma'], correctIndex: 2 },
        { id: 'sci_a_24', type: 'EXPERIMENT', question: 'Kütle spektrometresi bir maddenin ne özelliğini belirler?', options: ['Renk ve parlaklık', 'Moleküler kütle ve bileşim', 'Sıcaklık ve basınç', 'Yoğunluk ve hacim'], correctIndex: 1 },
        { id: 'sci_a_25', type: 'NATURE', question: 'Karbon döngüsünde fosil yakıtların yanması dengeyi nasıl bozar?', options: ['Oksijeni tüketip azotu artırır', 'Milyonlarca yıllık depolanmış karbonu hızla atmosfere salar', 'Karbon döngüsünü tamamen durdurur', 'Bitkilerin fotosentez yapmasını engeller'], correctIndex: 1 },
    ],
};

const getQuestionPool = (age: number): ScienceQuestion[] => {
    if (age <= 8) return QUESTIONS_BY_AGE.YOUNG;
    if (age <= 11) return QUESTIONS_BY_AGE.MIDDLE;
    return QUESTIONS_BY_AGE.ADVANCED;
};

const getQuestionTypeEmoji = (type: QuestionType): string => {
    switch (type) {
        case 'EXPERIMENT': return '🧪';
        case 'BODY': return '🫀';
        case 'NATURE': return '🌱';
        case 'PHYSICS': return '⚡';
        case 'CHEMISTRY': return '🧬';
    }
};

const getQuestionTypeTitle = (type: QuestionType): string => {
    switch (type) {
        case 'EXPERIMENT': return 'Deney';
        case 'BODY': return 'İnsan Vücudu';
        case 'NATURE': return 'Doğa';
        case 'PHYSICS': return 'Fizik';
        case 'CHEMISTRY': return 'Kimya';
    }
};

const ScienceExamGame: React.FC<ScienceExamGameProps> = ({
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

    const [currentQuestion, setCurrentQuestion] = useState<ScienceQuestion | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [questions, setQuestions] = useState<ScienceQuestion[]>([]);
    const [questionIndex, setQuestionIndex] = useState(0);

    const shakeX = useSharedValue(0);
    const feedbackScale = useSharedValue(0);

    useEffect(() => {
        const loadQuestions = async () => {
            const pool = getQuestionPool(age);
            const selected = await seenQuestionsTracker.selectQuestionsForExam(
                'science',
                pool,
                gameState.totalQuestions
            );
            const balancedQuestions = balanceCorrectAnswerDistribution(selected);
            setQuestions(balancedQuestions);
            if (balancedQuestions.length > 0) {
                setCurrentQuestion(balancedQuestions[0]);
                await seenQuestionsTracker.markQuestionsAsSeen(
                    'science',
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
        // Kısa bir gecikme sonra otomatik onayla
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
    optionSelected: { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    optionCorrect: { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    optionWrong: { borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    optionShowCorrect: { borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.15)' },
    optionLetter: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center' },
    optionLetterText: { color: '#94a3b8', fontSize: 14, fontWeight: '700' },
    optionLetterSelected: { color: '#10b981' },
    optionLetterCorrect: { color: '#10b981' },
    optionLetterWrong: { color: '#ef4444' },
    optionText: { flex: 1, color: '#e2e8f0', fontSize: 16, fontWeight: '500' },
    optionTextSelected: { color: '#10b981' },
    optionTextCorrect: { color: '#10b981' },
    optionTextWrong: { color: '#ef4444' },
    confirmButton: { backgroundColor: '#10b981', borderRadius: 12, padding: 16, marginTop: 20, alignItems: 'center' },
    confirmButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    explanationContainer: { backgroundColor: 'rgba(239, 68, 68, 0.2)', padding: 12, borderRadius: 8, marginTop: 16 },
    explanationText: { color: '#fca5a5', fontSize: 14, textAlign: 'center', fontWeight: '600' },
    feedbackOverlay: { position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center' },
    feedbackEmoji: { fontSize: 64 },
    progressContainer: { marginBottom: 12 },
    progressBar: { height: 8, backgroundColor: '#334155', borderRadius: 4, marginBottom: 8 },
    progressFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 4 },
    progressText: { color: '#94a3b8', textAlign: 'center', fontSize: 14 },
});

export default ScienceExamGame;
