export type LoadingQuoteCategory = 'INFANT' | 'EARLY' | 'SCHOOL' | 'TEEN' | 'GENERAL';
export type LoadingQuoteLocale = 'tr' | 'en';

type QuoteCatalog = Record<LoadingQuoteCategory, readonly string[]>;

const LOADING_QUOTES_BY_LOCALE: Record<LoadingQuoteLocale, QuoteCatalog> = {
  tr: {
    INFANT: [
      'Emekleme calismalari suruyor...',
      'Biberon servisi hazirlaniyor...',
      'Uykudan yeni ciktim, gozler aciliyor...',
      'Agu bugu dili yukleniyor...',
      'Ilk adim provasina geciliyor...',
      'Oyuncaklar siraya diziliyor...',
      'Mama plani netlesiyor...',
      'Gulucukler parlatiliyor...',
      'Yastiklar kabartiliyor...',
      'Kucaga alinma sirasi ayarlaniyor...'
    ],
    EARLY: [
      'Camur pastasi hazirlaniyor...',
      'Saklambac ekibi toplaniyor...',
      'Makas kullanimi test ediliyor...',
      'Dizler yama bekliyor...',
      'Masal listesi karistiriliyor...',
      'Tebessum kontrolleri yapiliyor...',
      'Uyku oncesi naz duzeni kuruluyor...',
      'Lego parcalari kacisiyor...',
      'Bahce kesif haritasi ciziliyor...',
      'Minik kahraman moduna geciliyor...'
    ],
    SCHOOL: [
      'Kopyalar hazirlaniyor...',
      'Ders zili ayarlaniyor...',
      'Odevler kapaklaniyor...',
      'Sinav stresi paketleniyor...',
      'Defterler siraya diziliyor...',
      'Teneffus plani kuruluyor...',
      'Kalemler sivriliyor...',
      'Tahta silgisi hazir...',
      'Sira arkasi fisiltilar yukleniyor...',
      'Matematikle pazarlik yapiliyor...',
      'Sozluye kisa bir dua gonderiliyor...',
      'Proje teslim tarihi hatirlatiliyor...'
    ],
    TEEN: [
      'Faturalar hesaplaniyor...',
      'Duygusal inis cikislar dengeleniyor...',
      'Hayat plani taslagi cikariliyor...',
      'Uykusuzluk mesaisi yaziliyor...',
      'Sorumluluklar siraya aliniyor...',
      'Kariyer ihtimalleri tartiliyor...',
      'Ask mesajlari filtreleniyor...',
      'Butce tablosu guncelleniyor...',
      'Gelecek kaygisi hafifletiliyor...',
      'Yetiskin moduna gecis yapiliyor...',
      'Kahve dozu ayarlaniyor...',
      'Hafta sonu plani ciziliyor...'
    ],
    GENERAL: [
      'Yazgi hazirlaniyor...',
      'Kader aglari oruluyor...',
      'Hayat sahnesi kuruluyor...',
      'Sans carki isiniyor...'
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
