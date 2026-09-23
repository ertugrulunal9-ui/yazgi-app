import type { Difficulty } from '../../components/exams/MiniGameContainer';
import { buildFriendlyHardPool } from '../../components/exams/difficultyTuning';

export type QuestionType = 'COUNTRY' | 'CITY' | 'LANDFORM' | 'CLIMATE' | 'MAP';


export interface GeographyQuestion {
    id: string;
    type: QuestionType;
    question: string;
    options: string[];
    correctIndex: number;
}

const QUESTIONS: Record<string, Record<string, GeographyQuestion[]>> = {
    // 6-8 yaş
    YOUNG: {
        EASY: [
            { id: 'geo_y_e_1', type: 'COUNTRY', question: 'Türkiye hangi kıtada?', options: ['Afrika', 'Avrupa ve Asya', 'Amerika', 'Avustralya'], correctIndex: 1 },
            { id: 'geo_y_e_2', type: 'CITY', question: 'Türkiye\'nin başkenti neresidir?', options: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'], correctIndex: 1 },
            { id: 'geo_y_e_3', type: 'MAP', question: 'Haritada kuzey hangi yöndedir?', options: ['Yukarı', 'Aşağı', 'Sağ', 'Sol'], correctIndex: 0 },
            { id: 'geo_y_e_4', type: 'LANDFORM', question: 'Denize ne denir?', options: ['Tuzlu su kütlesi', 'Tatlı su', 'Dağ', 'Orman'], correctIndex: 0 },
            { id: 'geo_y_e_5', type: 'CLIMATE', question: 'Kar hangi mevsimde yağar?', options: ['Yaz', 'İlkbahar', 'Kış', 'Sonbahar'], correctIndex: 2 },
            { id: 'geo_y_e_6', type: 'CITY', question: 'İstanbul hangi denizin kenarındadır?', options: ['Karadeniz', 'Akdeniz', 'Ege', 'Marmara'], correctIndex: 3 },
            { id: 'geo_y_e_7', type: 'LANDFORM', question: 'Dağ nedir?', options: ['Düz alan', 'Yüksek yer şekli', 'Su kütlesi', 'Orman'], correctIndex: 1 },
            { id: 'geo_y_e_8', type: 'COUNTRY', question: 'Hangi ülkede yaşıyoruz?', options: ['Almanya', 'Fransa', 'Türkiye', 'İngiltere'], correctIndex: 2 },
            { id: 'geo_y_e_9', type: 'MAP', question: 'Güneş hangi yönden doğar?', options: ['Batı', 'Kuzey', 'Doğu', 'Güney'], correctIndex: 2 },
            { id: 'geo_y_e_10', type: 'LANDFORM', question: 'Nehir nedir?', options: ['Tuzlu su', 'Akan tatlı su', 'Dağ', 'Orman'], correctIndex: 1 },
            { id: 'geo_y_e_11', type: 'CLIMATE', question: 'Yaz mevsiminde hava nasıldır?', options: ['Soğuk', 'Sıcak', 'Karlı', 'Dondurucu'], correctIndex: 1 },
            { id: 'geo_y_e_12', type: 'CITY', question: 'En kalabalık şehrimiz hangisidir?', options: ['Ankara', 'İzmir', 'İstanbul', 'Bursa'], correctIndex: 2 },
            { id: 'geo_y_e_13', type: 'COUNTRY', question: 'Türkiye\'nin kaç komşusu var?', options: ['5', '6', '7', '8'], correctIndex: 3 },
            { id: 'geo_y_e_14', type: 'LANDFORM', question: 'Orman nedir?', options: ['Su kütlesi', 'Ağaçlık alan', 'Dağ', 'Ova'], correctIndex: 1 },
            { id: 'geo_y_e_15', type: 'MAP', question: 'Harita ne gösterir?', options: ['Zaman', 'Yer', 'Hava durumu', 'Tarih'], correctIndex: 1 },
        ],
        MEDIUM: [
            { id: 'geo_y_m_1', type: 'LANDFORM', question: 'Türkiye\'nin en yüksek dağı hangisidir?', options: ['Uludağ', 'Erciyes', 'Ağrı Dağı', 'Kaçkar'], correctIndex: 2 },
            { id: 'geo_y_m_2', type: 'CLIMATE', question: 'Yazın sıcak, kışın soğuk olan iklim hangisidir?', options: ['Tropikal', 'Karasal', 'Akdeniz', 'Kutup'], correctIndex: 1 },
            { id: 'geo_y_m_3', type: 'CITY', question: 'İstanbul hangi boğazın kenarındadır?', options: ['Çanakkale', 'İstanbul', 'Süveyş', 'Cebelitarık'], correctIndex: 1 },
            { id: 'geo_y_m_4', type: 'LANDFORM', question: 'Ova nedir?', options: ['Yüksek dağ', 'Düz arazi', 'Deniz', 'Orman'], correctIndex: 1 },
            { id: 'geo_y_m_5', type: 'MAP', question: 'Türkiye\'de kaç deniz var?', options: ['2', '3', '4', '5'], correctIndex: 2 },
            { id: 'geo_y_m_6', type: 'COUNTRY', question: 'Yunanistan Türkiye\'nin hangi tarafında?', options: ['Doğu', 'Batı', 'Kuzey', 'Güney'], correctIndex: 1 },
            { id: 'geo_y_m_7', type: 'CLIMATE', question: 'Akdeniz\'de yaz nasıldır?', options: ['Soğuk', 'Sıcak ve kurak', 'Yağmurlu', 'Karlı'], correctIndex: 1 },
            { id: 'geo_y_m_8', type: 'LANDFORM', question: 'Göl nedir?', options: ['Tuzlu su', 'Karayla çevrili su', 'Okyanus', 'Nehir'], correctIndex: 1 },
            { id: 'geo_y_m_9', type: 'CITY', question: 'Ankara hangi bölgededir?', options: ['Marmara', 'İç Anadolu', 'Ege', 'Akdeniz'], correctIndex: 1 },
            { id: 'geo_y_m_10', type: 'MAP', question: 'Türkiye\'nin en büyük ili hangisidir?', options: ['İstanbul', 'Ankara', 'Konya', 'Sivas'], correctIndex: 2 },
            { id: 'geo_y_m_11', type: 'COUNTRY', question: 'Bulgaristan Türkiye\'nin hangi tarafında?', options: ['Doğu', 'Batı', 'Kuzeybatı', 'Güneydoğu'], correctIndex: 2 },
            { id: 'geo_y_m_12', type: 'LANDFORM', question: 'Plaj nerede bulunur?', options: ['Dağda', 'Deniz kenarında', 'Ormanda', 'Çölde'], correctIndex: 1 },
            { id: 'geo_y_m_13', type: 'CLIMATE', question: 'Karadeniz\'de yağış çok mu azdır mı?', options: ['Çok', 'Az', 'Hiç yok', 'Sadece kışın'], correctIndex: 0 },
            { id: 'geo_y_m_14', type: 'CITY', question: 'Antalya hangi denizin kıyısındadır?', options: ['Karadeniz', 'Marmara', 'Ege', 'Akdeniz'], correctIndex: 3 },
            { id: 'geo_y_m_15', type: 'LANDFORM', question: 'Ada nedir?', options: ['Dağ', 'Suyla çevrili kara', 'Nehir', 'Göl'], correctIndex: 1 },
        ],
        HARD: [
            { id: 'geo_y_h_1', type: 'COUNTRY', question: 'Hangi ülke Türkiye\'nin komşusu değildir?', options: ['Yunanistan', 'İran', 'Mısır', 'Suriye'], correctIndex: 2 },
            { id: 'geo_y_h_2', type: 'LANDFORM', question: 'Yayla nedir?', options: ['Deniz kenarı', 'Yüksek düzlük', 'Derin vadi', 'Orman'], correctIndex: 1 },
            { id: 'geo_y_h_3', type: 'MAP', question: 'Pusula ne gösterir?', options: ['Sıcaklık', 'Yön', 'Hız', 'Mesafe'], correctIndex: 1 },
            { id: 'geo_y_h_4', type: 'CLIMATE', question: 'Karadeniz\'de yağış neden çok?', options: ['Çöl var', 'Dağlar nemi tutar', 'Sıcak', 'Soğuk'], correctIndex: 1 },
            { id: 'geo_y_h_5', type: 'CITY', question: 'Ege Bölgesi\'nin en büyük şehri?', options: ['Antalya', 'İzmir', 'Bursa', 'Ankara'], correctIndex: 1 },
            { id: 'geo_y_h_6', type: 'LANDFORM', question: 'Vadi nasıl oluşur?', options: ['Volkan', 'Akarsu aşındırması', 'Deprem', 'Rüzgar'], correctIndex: 1 },
            { id: 'geo_y_h_7', type: 'COUNTRY', question: 'Gürcistan Türkiye\'nin hangi tarafında?', options: ['Batı', 'Güney', 'Kuzeydoğu', 'Güneybatı'], correctIndex: 2 },
            { id: 'geo_y_h_8', type: 'MAP', question: 'Türkiye kaç bölgeye ayrılır?', options: ['5', '6', '7', '8'], correctIndex: 2 },
            { id: 'geo_y_h_9', type: 'LANDFORM', question: 'Boğaz nedir?', options: ['Geniş deniz', 'İki kara arasındaki dar su yolu', 'Dağ geçidi', 'Göl'], correctIndex: 1 },
            { id: 'geo_y_h_10', type: 'CLIMATE', question: 'İç Anadolu\'da yağış neden az?', options: ['Denize yakın', 'Dağlarla çevrili', 'Çok sıcak', 'Çok soğuk'], correctIndex: 1 },
            { id: 'geo_y_h_11', type: 'CITY', question: 'Trabzon hangi denizin kıyısındadır?', options: ['Akdeniz', 'Ege', 'Marmara', 'Karadeniz'], correctIndex: 3 },
            { id: 'geo_y_h_12', type: 'COUNTRY', question: 'Irak Türkiye\'nin hangi tarafında?', options: ['Kuzey', 'Batı', 'Güneydoğu', 'Kuzeybatı'], correctIndex: 2 },
            { id: 'geo_y_h_13', type: 'LANDFORM', question: 'Kanyon nedir?', options: ['Düz alan', 'Derin ve dar vadi', 'Yüksek dağ', 'Geniş ova'], correctIndex: 1 },
            { id: 'geo_y_h_14', type: 'MAP', question: 'Ölçek ne gösterir?', options: ['Yön', 'Küçültme oranı', 'Hava durumu', 'Nüfus'], correctIndex: 1 },
            { id: 'geo_y_h_15', type: 'CLIMATE', question: 'Marmara Bölgesi\'nin iklimi nasıldır?', options: ['Karasal', 'Akdeniz', 'Geçiş iklimi', 'Kutup'], correctIndex: 2 },
        ],
    },
    // 9-11 yaş
    MIDDLE: {
        EASY: [
            { id: 'geo_m_e_1', type: 'COUNTRY', question: 'Dünya\'nın en kalabalık ülkesi hangisidir?', options: ['Hindistan', 'ABD', 'Çin', 'Rusya'], correctIndex: 2 },
            { id: 'geo_m_e_2', type: 'LANDFORM', question: 'Türkiye\'nin en uzun nehri hangisidir?', options: ['Sakarya', 'Kızılırmak', 'Fırat', 'Dicle'], correctIndex: 1 },
            { id: 'geo_m_e_3', type: 'MAP', question: 'Ekvator nedir?', options: ['Bir ülke', 'Hayali çizgi', 'Okyanus', 'Dağ sırası'], correctIndex: 1 },
            { id: 'geo_m_e_4', type: 'COUNTRY', question: 'Hangi ülke bir ada devletidir?', options: ['Fransa', 'Japonya', 'Almanya', 'Rusya'], correctIndex: 1 },
            { id: 'geo_m_e_5', type: 'LANDFORM', question: 'Van Gölü hangi bölgemizdedir?', options: ['Marmara', 'Akdeniz', 'Doğu Anadolu', 'Karadeniz'], correctIndex: 2 },
            { id: 'geo_m_e_6', type: 'MAP', question: 'Türkiye kaç coğrafi bölgeye ayrılır?', options: ['5', '6', '7', '8'], correctIndex: 2 },
            { id: 'geo_m_e_7', type: 'CLIMATE', question: 'Muson iklimi nerede görülür?', options: ['Avrupa', 'Asya', 'Afrika', 'Amerika'], correctIndex: 1 },
            { id: 'geo_m_e_8', type: 'CITY', question: 'Pamukkale hangi ildedir?', options: ['Muğla', 'Denizli', 'Aydın', 'İzmir'], correctIndex: 1 },
            { id: 'geo_m_e_9', type: 'COUNTRY', question: 'Dünya\'nın en büyük okyanusu hangisidir?', options: ['Atlantik', 'Hint', 'Pasifik', 'Arktik'], correctIndex: 2 },
            { id: 'geo_m_e_10', type: 'LANDFORM', question: 'Tuz Gölü hangi bölgemizdedir?', options: ['Marmara', 'İç Anadolu', 'Ege', 'Akdeniz'], correctIndex: 1 },
            { id: 'geo_m_e_11', type: 'MAP', question: 'Dünya\'da kaç kıta vardır?', options: ['5', '6', '7', '8'], correctIndex: 2 },
            { id: 'geo_m_e_12', type: 'CLIMATE', question: 'Çöl ikliminde yağış nasıldır?', options: ['Çok', 'Az', 'Orta', 'Yoğun'], correctIndex: 1 },
            { id: 'geo_m_e_13', type: 'CITY', question: 'Efes antik kenti hangi ildedir?', options: ['Muğla', 'Aydın', 'İzmir', 'Denizli'], correctIndex: 2 },
            { id: 'geo_m_e_14', type: 'LANDFORM', question: 'Türkiye\'nin en derin gölü hangisidir?', options: ['Tuz Gölü', 'Van Gölü', 'Beyşehir', 'Eğirdir'], correctIndex: 1 },
            { id: 'geo_m_e_15', type: 'COUNTRY', question: 'İngiltere hangi kıtada?', options: ['Amerika', 'Asya', 'Avrupa', 'Afrika'], correctIndex: 2 },
        ],
        MEDIUM: [
            { id: 'geo_m_m_1', type: 'CLIMATE', question: 'Akdeniz ikliminde yaz mevsimi nasıldır?', options: ['Yağışlı ve serin', 'Kurak ve sıcak', 'Karlı', 'Ilıman'], correctIndex: 1 },
            { id: 'geo_m_m_2', type: 'CITY', question: 'Kapadokya hangi ilimizdedir?', options: ['Konya', 'Nevşehir', 'Ankara', 'Sivas'], correctIndex: 1 },
            { id: 'geo_m_m_3', type: 'CLIMATE', question: 'Karadeniz bölgesinde yağış neden boldur?', options: ['Çöl olduğu için', 'Dağlar nemi tuttuğu için', 'Deniz olmadığı için', 'Sıcak olduğu için'], correctIndex: 1 },
            { id: 'geo_m_m_4', type: 'COUNTRY', question: 'Avrupa Birliği\'nin merkezi hangi şehirdedir?', options: ['Paris', 'Berlin', 'Brüksel', 'Roma'], correctIndex: 2 },
            { id: 'geo_m_m_5', type: 'LANDFORM', question: 'Türkiye\'nin en büyük ovası?', options: ['Çukurova', 'Konya', 'Gediz', 'Bafra'], correctIndex: 1 },
            { id: 'geo_m_m_6', type: 'MAP', question: 'Enlem ne belirler?', options: ['Doğu-batı', 'Kuzey-güney konumu', 'Yükseklik', 'Derinlik'], correctIndex: 1 },
            { id: 'geo_m_m_7', type: 'CLIMATE', question: 'İç Anadolu\'da yağış neden azdır?', options: ['Denize yakın', 'Dağlarla çevrili', 'Tropik bölge', 'Kutuplara yakın'], correctIndex: 1 },
            { id: 'geo_m_m_8', type: 'COUNTRY', question: 'BM\'nin merkezi nerededir?', options: ['Londra', 'Paris', 'New York', 'Tokyo'], correctIndex: 2 },
            { id: 'geo_m_m_9', type: 'LANDFORM', question: 'Mendereslerin en ünlüsü hangi nehirdir?', options: ['Sakarya', 'Büyük Menderes', 'Kızılırmak', 'Yeşilırmak'], correctIndex: 1 },
            { id: 'geo_m_m_10', type: 'MAP', question: 'İzoterm haritası neyi gösterir?', options: ['Yağış', 'Sıcaklık', 'Basınç', 'Rüzgar'], correctIndex: 1 },
            { id: 'geo_m_m_11', type: 'CLIMATE', question: 'Güneydoğu Anadolu\'nun iklimi nasıldır?', options: ['Akdeniz', 'Karasal', 'Yarı kurak', 'Okyanusal'], correctIndex: 2 },
            { id: 'geo_m_m_12', type: 'CITY', question: 'Göbeklitepe hangi ildedir?', options: ['Mardin', 'Şanlıurfa', 'Diyarbakır', 'Gaziantep'], correctIndex: 1 },
            { id: 'geo_m_m_13', type: 'COUNTRY', question: 'NATO\'nun merkezi nerededir?', options: ['Washington', 'Brüksel', 'Londra', 'Paris'], correctIndex: 1 },
            { id: 'geo_m_m_14', type: 'LANDFORM', question: 'Toroslar hangi bölgededir?', options: ['Marmara', 'Akdeniz', 'Karadeniz', 'Ege'], correctIndex: 1 },
            { id: 'geo_m_m_15', type: 'MAP', question: 'İzohips haritası neyi gösterir?', options: ['Sıcaklık', 'Yağış', 'Yükseklik', 'Basınç'], correctIndex: 2 },
        ],
        HARD: [
            { id: 'geo_m_h_1', type: 'LANDFORM', question: 'Türkiye\'nin en büyük gölü hangisidir?', options: ['Tuz Gölü', 'Van Gölü', 'Beyşehir', 'Eğirdir'], correctIndex: 1 },
            { id: 'geo_m_h_2', type: 'CLIMATE', question: 'Fön rüzgarı nedir?', options: ['Soğuk rüzgar', 'Dağdan inen sıcak rüzgar', 'Deniz rüzgarı', 'Kutup rüzgarı'], correctIndex: 1 },
            { id: 'geo_m_h_3', type: 'COUNTRY', question: 'Dünya\'nın yüzölçümü en büyük ülkesi?', options: ['Kanada', 'ABD', 'Çin', 'Rusya'], correctIndex: 3 },
            { id: 'geo_m_h_4', type: 'LANDFORM', question: 'Delta nasıl oluşur?', options: ['Volkanla', 'Depremle', 'Nehrin denize döküldüğü yerde', 'Buzullarla'], correctIndex: 2 },
            { id: 'geo_m_h_5', type: 'MAP', question: 'Boylam ne belirler?', options: ['Kuzey-güney', 'Doğu-batı konumu', 'Yükseklik', 'İklim'], correctIndex: 1 },
            { id: 'geo_m_h_6', type: 'CLIMATE', question: 'Türkiye\'de en fazla yağış hangi bölgede görülür?', options: ['Marmara', 'Akdeniz', 'Karadeniz', 'İç Anadolu'], correctIndex: 2 },
            { id: 'geo_m_h_7', type: 'LANDFORM', question: 'Falezler nasıl oluşur?', options: ['Rüzgar', 'Dalga aşındırması', 'Deprem', 'Volkan'], correctIndex: 1 },
            { id: 'geo_m_h_8', type: 'COUNTRY', question: 'Dünya\'nın en uzun nehri hangisidir?', options: ['Amazon', 'Nil', 'Missisippi', 'Ganj'], correctIndex: 1 },
            { id: 'geo_m_h_9', type: 'MAP', question: 'Türkiye hangi yarımkürelerdedir?', options: ['Kuzey-Doğu', 'Güney-Batı', 'Kuzey-Batı', 'Güney-Doğu'], correctIndex: 0 },
            { id: 'geo_m_h_10', type: 'CLIMATE', question: 'Poyraz hangi yönden esen rüzgardır?', options: ['Güneybatı', 'Kuzeydoğu', 'Kuzeybatı', 'Güneydoğu'], correctIndex: 1 },
            { id: 'geo_m_h_11', type: 'LANDFORM', question: 'Traverten nasıl oluşur?', options: ['Volkan', 'Kireçli su birikimi', 'Deprem', 'Buzul'], correctIndex: 1 },
            { id: 'geo_m_h_12', type: 'CITY', question: 'Nemrut Dağı hangi ildedir?', options: ['Malatya', 'Adıyaman', 'Elazığ', 'Diyarbakır'], correctIndex: 1 },
            { id: 'geo_m_h_13', type: 'COUNTRY', question: 'Dünya\'nın en büyük adası hangisidir?', options: ['Madagaskar', 'Grönland', 'Borneo', 'Sumatra'], correctIndex: 1 },
            { id: 'geo_m_h_14', type: 'MAP', question: 'Türkiye\'nin deniz sınırı uzunluğu kaç km civarındadır?', options: ['5000', '6500', '8333', '10000'], correctIndex: 2 },
            { id: 'geo_m_h_15', type: 'CLIMATE', question: 'Lodos hangi yönden esen rüzgardır?', options: ['Kuzeydoğu', 'Güneybatı', 'Kuzeybatı', 'Güneydoğu'], correctIndex: 1 },
        ],
    },
    // 12+ yaş
    ADVANCED: {
        EASY: [
            { id: 'geo_a_e_1', type: 'MAP', question: 'Greenwich meridyeni hangi ülkeden geçer?', options: ['Fransa', 'İngiltere', 'İspanya', 'Almanya'], correctIndex: 1 },
            { id: 'geo_a_e_2', type: 'COUNTRY', question: 'Hangi ülke hem Avrupa hem Asya\'da toprak sahibidir?', options: ['Yunanistan', 'Türkiye', 'İran', 'Mısır'], correctIndex: 1 },
            { id: 'geo_a_e_3', type: 'MAP', question: 'GPS neyin kısaltmasıdır?', options: ['Global Phone System', 'Global Positioning System', 'Geographic Point Service', 'Ground Power Station'], correctIndex: 1 },
            { id: 'geo_a_e_4', type: 'LANDFORM', question: 'Kıta sahanlığı nedir?', options: ['Dağ sırası', 'Deniz altı düzlüğü', 'Vadi', 'Yayla'], correctIndex: 1 },
            { id: 'geo_a_e_5', type: 'CLIMATE', question: 'Tropikal iklim nerede görülür?', options: ['Kutuplarda', 'Ekvator çevresinde', 'Dağlarda', 'Çöllerde'], correctIndex: 1 },
            { id: 'geo_a_e_6', type: 'COUNTRY', question: 'OPEC ülkeleri neyle ünlü?', options: ['Turizm', 'Petrol', 'Tarım', 'Teknoloji'], correctIndex: 1 },
            { id: 'geo_a_e_7', type: 'LANDFORM', question: 'Okyanus çukuru nedir?', options: ['Sığ alan', 'En derin yer', 'Ada', 'Kıyı'], correctIndex: 1 },
            { id: 'geo_a_e_8', type: 'MAP', question: 'UTM nedir?', options: ['Bir ülke', 'Koordinat sistemi', 'Dağ', 'Nehir'], correctIndex: 1 },
            { id: 'geo_a_e_9', type: 'CLIMATE', question: 'Subtropikal iklim nerede görülür?', options: ['Kutuplarda', 'Ekvator yakınında', '30-40 derece enlemler', 'Dağ zirvelerinde'], correctIndex: 2 },
            { id: 'geo_a_e_10', type: 'COUNTRY', question: 'AB\'nin en kalabalık ülkesi hangisidir?', options: ['Fransa', 'İtalya', 'Almanya', 'İspanya'], correctIndex: 2 },
            { id: 'geo_a_e_11', type: 'LANDFORM', question: 'Fjord nasıl oluşur?', options: ['Volkan', 'Buzul aşındırması', 'Deprem', 'Rüzgar'], correctIndex: 1 },
            { id: 'geo_a_e_12', type: 'MAP', question: 'Türkiye\'nin koordinatları yaklaşık nelerdir?', options: ['26-45 D, 36-42 K', '20-30 D, 30-40 K', '30-50 D, 40-50 K', '35-55 D, 35-45 K'], correctIndex: 0 },
            { id: 'geo_a_e_13', type: 'CLIMATE', question: 'Maki bitki örtüsü hangi iklimde görülür?', options: ['Karasal', 'Akdeniz', 'Okyanusal', 'Kutup'], correctIndex: 1 },
            { id: 'geo_a_e_14', type: 'COUNTRY', question: 'BRICS ülkeleri hangileridir?', options: ['Avrupa ülkeleri', 'Gelişmekte olan büyük ekonomiler', 'Petrol ülkeleri', 'Ada devletleri'], correctIndex: 1 },
            { id: 'geo_a_e_15', type: 'LANDFORM', question: 'Atol nedir?', options: ['Volkanik dağ', 'Halka şeklinde mercan adası', 'Derin vadi', 'Buzul gölü'], correctIndex: 1 },
        ],
        MEDIUM: [
            { id: 'geo_a_m_1', type: 'LANDFORM', question: 'Karstik arazi yapısı hangi kayaçta oluşur?', options: ['Granit', 'Kireçtaşı', 'Bazalt', 'Mermer'], correctIndex: 1 },
            { id: 'geo_a_m_2', type: 'CLIMATE', question: 'El Nino nedir?', options: ['Bir kasırga', 'Okyanus akıntısı değişikliği', 'Bir dağ', 'Bir rüzgar'], correctIndex: 1 },
            { id: 'geo_a_m_3', type: 'MAP', question: 'Mercator projeksiyonu nedir?', options: ['Bir ülke', 'Harita çizim yöntemi', 'Bir nehir', 'Bir dağ'], correctIndex: 1 },
            { id: 'geo_a_m_4', type: 'COUNTRY', question: 'G7 ülkeleri hangileridir?', options: ['En fakir 7 ülke', 'En zengin 7 sanayi ülkesi', 'En kalabalık 7 ülke', 'En büyük 7 ülke'], correctIndex: 1 },
            { id: 'geo_a_m_5', type: 'LANDFORM', question: 'Plato ile yayla arasındaki fark nedir?', options: ['Yükseklik', 'Oluşum şekli', 'İklim', 'Hiç fark yok'], correctIndex: 1 },
            { id: 'geo_a_m_6', type: 'CLIMATE', question: 'Termik basınç nedir?', options: ['Soğuk hava basıncı', 'Sıcaklıktan kaynaklanan basınç', 'Rüzgar basıncı', 'Deniz basıncı'], correctIndex: 1 },
            { id: 'geo_a_m_7', type: 'MAP', question: 'CBS ne demektir?', options: ['Coğrafi Bilgi Sistemi', 'Coğrafi Bölge Sınıfı', 'Coğrafi Birim Sayısı', 'Coğrafi Bütünlük Standartı'], correctIndex: 0 },
            { id: 'geo_a_m_8', type: 'LANDFORM', question: 'Graben nedir?', options: ['Yükselmiş alan', 'Çökmüş alan', 'Volkan', 'Buzul'], correctIndex: 1 },
            { id: 'geo_a_m_9', type: 'CLIMATE', question: 'La Nina nedir?', options: ['El Nino\'nun tersi', 'Bir kasırga', 'Bir dağ', 'Bir nehir'], correctIndex: 0 },
            { id: 'geo_a_m_10', type: 'COUNTRY', question: 'G20 neyi temsil eder?', options: ['20 ada devleti', '20 büyük ekonomi', '20 Avrupa ülkesi', '20 petrol ülkesi'], correctIndex: 1 },
            { id: 'geo_a_m_11', type: 'MAP', question: 'Topoğrafik harita neyi gösterir?', options: ['Sadece şehirler', 'Yer şekillerini', 'Sadece nehirler', 'Sadece sınırlar'], correctIndex: 1 },
            { id: 'geo_a_m_12', type: 'LANDFORM', question: 'Peribacası nasıl oluşur?', options: ['Deprem', 'Diferansiyel aşınma', 'Buzul', 'Volkan'], correctIndex: 1 },
            { id: 'geo_a_m_13', type: 'CLIMATE', question: 'Subtropikal yüksek basınç kuşağı neye neden olur?', options: ['Yağış', 'Çöller', 'Ormanlar', 'Buzullar'], correctIndex: 1 },
            { id: 'geo_a_m_14', type: 'COUNTRY', question: 'IMF\'nin merkezi nerededir?', options: ['New York', 'Londra', 'Washington', 'Cenevre'], correctIndex: 2 },
            { id: 'geo_a_m_15', type: 'MAP', question: 'Kadastro haritası neyi gösterir?', options: ['İklimi', 'Mülkiyet sınırlarını', 'Yüksekliği', 'Nüfusu'], correctIndex: 1 },
        ],
        HARD: [
            { id: 'geo_a_h_1', type: 'CLIMATE', question: 'Coriolis kuvveti neyi etkiler?', options: ['Deprem', 'Rüzgar yönü', 'Yağış', 'Sıcaklık'], correctIndex: 1 },
            { id: 'geo_a_h_2', type: 'LANDFORM', question: 'Horst nedir?', options: ['Çökmüş blok', 'Yükselmiş blok', 'Volkanik dağ', 'Kıvrımlı dağ'], correctIndex: 1 },
            { id: 'geo_a_h_3', type: 'MAP', question: 'Batimetri ne ölçer?', options: ['Yükseklik', 'Deniz derinliği', 'Sıcaklık', 'Basınç'], correctIndex: 1 },
            { id: 'geo_a_h_4', type: 'CLIMATE', question: 'Albedo nedir?', options: ['Nem oranı', 'Yansıtma oranı', 'Basınç', 'Rüzgar hızı'], correctIndex: 1 },
            { id: 'geo_a_h_5', type: 'COUNTRY', question: 'Münhasır ekonomik bölge kaç deniz mili?', options: ['12', '24', '200', '350'], correctIndex: 2 },
            { id: 'geo_a_h_6', type: 'LANDFORM', question: 'Peneplen nedir?', options: ['Genç dağ', 'Aşınmış düzlük', 'Volkan', 'Buzul vadisi'], correctIndex: 1 },
            { id: 'geo_a_h_7', type: 'CLIMATE', question: 'ITCZ nedir?', options: ['Bir ülke', 'Tropikal yakınsama kuşağı', 'Bir dağ', 'Bir nehir'], correctIndex: 1 },
            { id: 'geo_a_h_8', type: 'MAP', question: 'Azimutal projeksiyon neyi korur?', options: ['Alan', 'Şekil', 'Yön', 'Mesafe'], correctIndex: 2 },
            { id: 'geo_a_h_9', type: 'LANDFORM', question: 'Morfolojik bölge nedir?', options: ['İklim bölgesi', 'Yer şekilleri bölgesi', 'Bitki bölgesi', 'Nüfus bölgesi'], correctIndex: 1 },
            { id: 'geo_a_h_10', type: 'COUNTRY', question: 'Karasuları kaç deniz milidir?', options: ['3', '6', '12', '24'], correctIndex: 2 },
            { id: 'geo_a_h_11', type: 'CLIMATE', question: 'Hadley hücresi nedir?', options: ['Bir ülke', 'Atmosferik dolaşım hücresi', 'Bir dağ', 'Bir göl'], correctIndex: 1 },
            { id: 'geo_a_h_12', type: 'MAP', question: 'Robinson projeksiyonu neyi minimize eder?', options: ['Distorsiyon', 'Alanı', 'Mesafeyi', 'Yönü'], correctIndex: 0 },
            { id: 'geo_a_h_13', type: 'LANDFORM', question: 'Epirojenik hareket nedir?', options: ['Yatay hareket', 'Dikey yükselme/çökme', 'Volkanik patlama', 'Deprem'], correctIndex: 1 },
            { id: 'geo_a_h_14', type: 'COUNTRY', question: 'Bitişik bölge kaç deniz milidir?', options: ['12', '24', '200', '350'], correctIndex: 1 },
            { id: 'geo_a_h_15', type: 'CLIMATE', question: 'Ferrel hücresi hangi enlemlerde bulunur?', options: ['0-30', '30-60', '60-90', '0-90'], correctIndex: 1 },
        ],
    },
};

// Yaş ve zorluğa göre soru havuzu seç
export const getQuestionPool = (age: number, difficulty: Difficulty): GeographyQuestion[] => {
    let ageGroup: string;
    if (age <= 8) ageGroup = 'YOUNG';
    else if (age <= 11) ageGroup = 'MIDDLE';
    else ageGroup = 'ADVANCED';

    const pools = QUESTIONS[ageGroup];

    if (difficulty !== 'HARD') {
        return pools[difficulty] || pools.MEDIUM;
    }

    return buildFriendlyHardPool(
        difficulty,
        pools.MEDIUM || pools.EASY,
        pools.HARD || pools.MEDIUM
    );
};
