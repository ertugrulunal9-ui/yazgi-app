export type LoadingQuoteCategory = 'INFANT' | 'EARLY' | 'SCHOOL' | 'TEEN' | 'GENERAL';

export const LOADING_QUOTES = {
  INFANT: [
    "Emekleme çalışmaları sürüyor...",
    "Biberon servisi hazırlanıyor...",
    "Uykudan yeni çıktım, gözler açılıyor...",
    "Agu bugu dili yükleniyor...",
    "İlk adım provasına geçiliyor...",
    "Oyuncaklar sıraya diziliyor...",
    "Mama planı netleşiyor...",
    "Gülücükler parlatılıyor...",
    "Yastıklar kabartılıyor...",
    "Kucağa alınma sırası ayarlanıyor..."
  ],
  EARLY: [
    "Çamur pastası hazırlanıyor...",
    "Saklambaç ekibi toplanıyor...",
    "Makas kullanımı test ediliyor...",
    "Dizler yama bekliyor...",
    "Masal listesi karıştırılıyor...",
    "Tebessüm kontrolleri yapılıyor...",
    "Uyku öncesi naz düzeni kuruluyor...",
    "Lego parçaları kaçışıyor...",
    "Bahçe keşif haritası çiziliyor...",
    "Minik kahraman moduna geçiliyor..."
  ],
  SCHOOL: [
    "Kopyalar hazırlanıyor...",
    "Ders zili ayarlanıyor...",
    "Ödevler kapaklanıyor...",
    "Sınav stresi paketleniyor...",
    "Defterler sıraya diziliyor...",
    "Teneffüs planı kuruluyor...",
    "Kalemler sivriliyor...",
    "Tahta silgisi hazır...",
    "Sıra arkası fısıltılar yükleniyor...",
    "Matematikle pazarlık yapılıyor...",
    "Sözlüye kısa bir dua gönderiliyor...",
    "Proje teslim tarihi hatırlatılıyor..."
  ],
  TEEN: [
    "Faturalar hesaplanıyor...",
    "Duygusal iniş çıkışlar dengeleniyor...",
    "Hayat planı taslağı çıkarılıyor...",
    "Uykusuzluk mesaisi yazılıyor...",
    "Sorumluluklar sıraya alınıyor...",
    "Kariyer ihtimalleri tartılıyor...",
    "Aşk mesajları filtreleniyor...",
    "Bütçe tablosu güncelleniyor...",
    "Gelecek kaygısı hafifletiliyor...",
    "Yetişkin moduna geçiş yapılıyor...",
    "Kahve dozu ayarlanıyor...",
    "Hafta sonu planı çiziliyor..."
  ],
  GENERAL: [
    "Yazgı hazırlanıyor...",
    "Kader ağları örülüyor...",
    "Hayat sahnesi kuruluyor...",
    "Şans çarkı ısınıyor..."
  ]
} as const;

const getCategoryByAge = (age: number): LoadingQuoteCategory => {
  if (age <= 3) return 'INFANT';
  if (age <= 6) return 'EARLY';
  if (age <= 12) return 'SCHOOL';
  if (age <= 18) return 'TEEN';
  return 'GENERAL';
};

const pickRandom = (items: readonly string[]) => items[Math.floor(Math.random() * items.length)];

export const getLoadingQuoteByAge = (age: number): string => {
  const category = getCategoryByAge(age);
  const pool = LOADING_QUOTES[category] || LOADING_QUOTES.GENERAL;
  return pickRandom(pool.length > 0 ? pool : LOADING_QUOTES.GENERAL);
};
