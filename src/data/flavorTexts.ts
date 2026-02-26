import { strings, getRuntimeLocale } from '../i18n/strings';

export const FLAVOR_TEXTS = {
  SPORT_SUCCESS: [
    "Tam 90'a taktım golü! İzleyenler mest oldu.",
    "Bacaklarım titriyor ama o son depara değdi.",
    "Bugün Ronaldo gibiyim, kimse beni tutamaz!",
    "Ter attım, kafam boşaldı. Zımba gibiyim.",
    "Koç beni görünce şaşırdı, bugün formumdayım!"
  ],
  CODING_SESSION: [
    "Az önce Matrix'e girdim sandım, kodlar akıyor!",
    "Bir bug çözdüm, kendimi hacker gibi hissediyorum.",
    "Klavye alev aldı resmen, proje uçuyor.",
    "Kahvem bitti ama kod bitmedi...",
    "Noktalı virgül hatası yüzünden 1 saat harcadım ama değdi."
  ],
  MUSIC_PRACTICE: [
    "Komşular biraz kızdı ama solo efsaneydi.",
    "Parmaklarım nasır tuttu, işte sanat bu!",
    "Bu şarkıyı bitirince herkes bana hayran kalacak.",
    "Notalar havada dans ediyor sanki."
  ],
  STUDY_MATH: [
    "Bu integraller hayatta ne işime yarayacak bilmiyorum...",
    "Beynim yandı ama sanırım konuyu anladım.",
    "Einstein görse gurur duyardı (veya gülerdi).",
    "Rakamlar rüyama girecek artık."
  ],
  STUDY_VERBAL: [
    "Tarih çalışırken kendimi o savaşın ortasında hissettim.",
    "Bu şairin dizeleri beni benden aldı...",
    "Kitap okumak, yaşamaktan daha güzel bazen.",
    "Kelimelerin gücünü hissediyorum."
  ],
  GAMING: [
    "Bir el daha atayım, sonra yatarım... (Yatmadı)",
    "Rank atladım! Şimdi onlar düşünsün.",
    "Takımım beni çıldırttı ama maçı taşıdım.",
    "Reflekslerim çok iyi, e-sporcu mu olsam?"
  ],
  WORK_GRIND: [
    "Ayaklarıma kara sular indi ama harçlığı kaptım.",
    "Patron bugün çok gergindi, ucuz atlattım.",
    "Kendi paramı kazanmak gibisi yok.",
    "Zengin olacağım günler için çalışıyorum."
  ],
  SOCIAL_FUN: [
    "Gülmekten karnıma ağrılar girdi.",
    "Dedikodunun dibine vurduk.",
    "Ortam çok iyiydi, keşke bitmeseydi.",
    "Yeni insanlarla tanışmak ufkumu açıyor."
  ],
  ART_CREATION: [
    "Boyalar her yerime bulaştı ama eserim harika.",
    "İlham perisi sonunda geldi!",
    "Çizdikçe kendimi buluyorum.",
    "Bu resmi sergiye koysam yeridir."
  ],
  BABY_FUN: [
    "Bugu bugu! (Çok eğleniyorum)",
    "Oyuncağımı yere attım, annem aldı. Çok komik!",
    "Emeklemek yorucu, kucak istiyorum."
  ]
};

type FlavorCategory = keyof typeof FLAVOR_TEXTS;

export const getRandomFlavor = (category: FlavorCategory): string => {
  const locale = getRuntimeLocale();
  const localeStrings = strings[locale];

  // Try locale-aware flavor texts from i18n domain
  const rawFlavorNode = localeStrings?.flavorTexts;
  const flavorObj = (
    rawFlavorNode
    && typeof rawFlavorNode === 'object'
    && !Array.isArray(rawFlavorNode)
  ) ? (rawFlavorNode as Record<string, unknown>) : undefined;
  const localizedBucket = flavorObj?.[category];
  const bucket = (Array.isArray(localizedBucket) && localizedBucket.length > 0)
    ? (localizedBucket as string[])
    : FLAVOR_TEXTS[category];

  if (!bucket || bucket.length === 0) return '';
  const idx = Math.floor(Math.random() * bucket.length);
  return bucket[idx];
};
