export type LoadingQuoteCategory = 'INFANT' | 'EARLY' | 'SCHOOL' | 'TEEN' | 'GENERAL';
export type LoadingQuoteLocale = 'tr' | 'en';

type QuoteCatalog = Record<LoadingQuoteCategory, readonly string[]>;

const LOADING_QUOTES_BY_LOCALE: Record<LoadingQuoteLocale, QuoteCatalog> = {
  tr: {
    INFANT: [
      'Emekleme çalışmaları sürüyor...',
      'Biberon servisi hazırlanıyor...',
      'Uykudan yeni çıktım, gözler açılıyor...',
      'Agu buğu dili yükleniyor...',
      'İlk adım provasına geçiliyor...',
      'Oyuncaklar sıraya diziliyor...',
      'Mama planı netleşiyor...',
      'Gülücükler parlatılıyor...',
      'Yastıklar kabartılıyor...',
      'Kucağa alınma sırası ayarlanıyor...'
    ],
    EARLY: [
      'Çamur pastası hazırlanıyor...',
      'Saklambaç ekibi toplanıyor...',
      'Makas kullanımı test ediliyor...',
      'Dizler yama bekliyor...',
      'Masal listesi karıştırılıyor...',
      'Tebessüm kontrolleri yapılıyor...',
      'Uyku öncesi naz düzeni kuruluyor...',
      'Lego parçaları kaçışıyor...',
      'Bahçe keşif haritası çiziliyor...',
      'Minik kahraman moduna geçiliyor...'
    ],
    SCHOOL: [
      'Kopyalar hazırlanıyor...',
      'Ders zili ayarlanıyor...',
      'Ödevler kapaklanıyor...',
      'Sınav stresi paketleniyor...',
      'Defterler sıraya diziliyor...',
      'Teneffüs planı kuruluyor...',
      'Kalemler sivriliyor...',
      'Tahta silgisi hazır...',
      'Sıra arkası fısıltılar yükleniyor...',
      'Matematikle pazarlık yapılıyor...',
      'Sözlüye kısa bir dua gönderiliyor...',
      'Proje teslim tarihi hatırlatılıyor...'
    ],
    TEEN: [
      'Faturalar hesaplanıyor...',
      'Duygusal iniş çıkışlar dengeleniyor...',
      'Hayat planı taslağı çıkarılıyor...',
      'Uykusuzluk mesaisi yazılıyor...',
      'Sorumluluklar sıraya alınıyor...',
      'Kariyer ihtimalleri tartılıyor...',
      'Aşk mesajları filtreleniyor...',
      'Bütçe tablosu güncelleniyor...',
      'Gelecek kaygısı hafifletiliyor...',
      'Yetişkin moduna geçiş yapılıyor...',
      'Kahve dozu ayarlanıyor...',
      'Hafta sonu planı çiziliyor...'
    ],
    GENERAL: [
      'Yazgı hazırlanıyor...',
      'Kader ağları örülüyor...',
      'Hayat sahnesi kuruluyor...',
      'Şans çarkı ısınıyor...'
    ]
  },
  en: {
    INFANT: [
      'Crawling routine loading...',
      'Bottle service preparing...',
      'Just woke up, eyes opening...',
      'First baby words compiling...',
      'First-step rehearsal in progress...',
      'Toys lining up...',
      'Feeding plan syncing...',
      'Smiles polishing...',
      'Pillows fluffing...',
      'Queueing for cuddle time...'
    ],
    EARLY: [
      'Mud pie workshop starting...',
      'Hide-and-seek squad assembling...',
      'Scissor skills calibrating...',
      'Knees requesting patches...',
      'Story list shuffling...',
      'Smile checks in progress...',
      'Bedtime drama system booting...',
      'Lego pieces escaping...',
      'Backyard map drafting...',
      'Tiny hero mode enabled...'
    ],
    SCHOOL: [
      'Cheat sheets... just kidding, loading...',
      'School bell tuning...',
      'Homework stacks arranging...',
      'Exam stress being packed...',
      'Notebooks lining up...',
      'Break-time strategy planning...',
      'Pencils sharpening...',
      'Board eraser standing by...',
      'Back-row whispers buffering...',
      'Negotiating with math...',
      'Sending a quick oral-exam prayer...',
      'Project deadline reminder queued...'
    ],
    TEEN: [
      'Bills being calculated...',
      'Emotional highs and lows balancing...',
      'Life plan draft generating...',
      'Sleep debt ledger updating...',
      'Responsibilities queuing...',
      'Career possibilities weighing in...',
      'Love messages filtering...',
      'Budget table refreshing...',
      'Future anxiety softening...',
      'Adult mode loading...',
      'Coffee dose adjusting...',
      'Weekend plan sketching...'
    ],
    GENERAL: [
      'Preparing Yazgi...',
      'Weaving threads of fate...',
      'Setting the stage of life...',
      'Warming up the wheel of luck...'
    ]
  }
};

// Backward compatibility: expose top-level category buckets as TR defaults.
export const LOADING_QUOTES: Record<LoadingQuoteLocale, QuoteCatalog> & QuoteCatalog = Object.assign(
  {},
  LOADING_QUOTES_BY_LOCALE,
  LOADING_QUOTES_BY_LOCALE.tr
);

const getCategoryByAge = (age: number): LoadingQuoteCategory => {
  if (age <= 3) return 'INFANT';
  if (age <= 6) return 'EARLY';
  if (age <= 12) return 'SCHOOL';
  if (age <= 18) return 'TEEN';
  return 'GENERAL';
};

const pickRandom = (items: readonly string[]) => items[Math.floor(Math.random() * items.length)];

export const getLoadingQuoteByAge = (age: number, locale: LoadingQuoteLocale = 'tr'): string => {
  const category = getCategoryByAge(age);
  const localeQuotes = LOADING_QUOTES_BY_LOCALE[locale] || LOADING_QUOTES_BY_LOCALE.tr;
  const pool = localeQuotes[category] || localeQuotes.GENERAL;
  return pickRandom(pool.length > 0 ? pool : localeQuotes.GENERAL);
};
