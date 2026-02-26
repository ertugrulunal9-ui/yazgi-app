import { GameEvent } from '../types';
import { withEventLocalizationKeysForAll } from '../i18n/events/keyMapper';

// ─────────────────────────────────────────────────────────────
// KRİZ EVENTLERİ
// Burden sistemi stres > %80 olduğunda bu eventlerden birini tetikler.
// Her event farklı bir kriz senaryosunu anlatır.
// ─────────────────────────────────────────────────────────────

/** Orijinal genel çöküş — fallback olarak kalır */
export const BURDEN_BREAKDOWN_EVENT: GameEvent = {
  id: 'evt_burden_breakdown_forced',
  text: 'Risk seviyen kritik eşiği aştı. Zihinsel yorgunluk birikti ve ciddi bir mental çöküş yaşadın.',
  minAge: 7,
  maxAge: 100,
  rarity: 'RARE',
  isRepeatable: true,
  difficulty: 5,
  personalityCategory: 'BREAKDOWN',
  tags: ['burden', 'crisis', 'breakdown'],
  choices: [
    {
      id: 'burden_breakdown_rest',
      text: 'Mecburi mola ver ve toparlan',
      effect: {
        health: -4,
        discipline: -3,
        charisma: -2,
        familyRelation: -1,
        energy: 20,
        money: -35,
      },
      stressEffect: -35,
      feedback: 'Zor bir çöküş yaşadın. Bir adım geri çekilip yeniden denge kurman gerekiyor.',
    },
  ],
};

// ─── SINAV STRESİ ──────────────────────────────────────────

const CRISIS_EXAM_PANIC: GameEvent = {
  id: 'evt_crisis_exam_panic',
  text: 'Sınav haftası geldi ve hiçbir şeye hazır değilsin. Gece boyunca ders çalışmaya çalıştın ama sayfalar bulanıklaştı. Ellerinin titrediğini fark ettin.',
  minAge: 10,
  maxAge: 18,
  rarity: 'RARE',
  isRepeatable: true,
  difficulty: 5,
  personalityCategory: 'BREAKDOWN',
  tags: ['burden', 'crisis', 'exam', 'school'],
  choices: [
    {
      id: 'crisis_exam_accept',
      text: 'Sınavı olduğu gibi kabul et, ne olursa olsun',
      effect: { health: 5, discipline: -5, intelligence: -3, energy: 15 },
      stressEffect: -30,
      feedback: 'Sınava girdin ama kafan bomboştu. Kötü geçti. Ama en azından kendini parçalamayı bıraktın.',
      memory: { emotion: 'NEUTRAL', weight: 'MEDIUM', customNote: 'Sınav panikle başa çıktın' },
    },
    {
      id: 'crisis_exam_allnighter',
      text: 'Son bir gece daha zorla — ya hep ya hiç',
      effect: { intelligence: 3, health: -15, discipline: 5, energy: -25 },
      stressEffect: 10,
      feedback: 'Sabaha kadar çalıştın. Sınavda idare ettin ama vücudun sana ağır bir fatura kesti.',
      memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
    },
  ],
};

// ─── AİLE BASKISI ──────────────────────────────────────────

const CRISIS_FAMILY_PRESSURE: GameEvent = {
  id: 'evt_crisis_family_pressure',
  text: 'Anne-baban arasındaki tartışma bu gece doruk noktasına ulaştı. Kapı çarpma sesleri, bağrışmalar... Odanda yorganın altına saklandın.',
  minAge: 8,
  maxAge: 16,
  rarity: 'RARE',
  isRepeatable: true,
  difficulty: 5,
  personalityCategory: 'BREAKDOWN',
  tags: ['burden', 'crisis', 'family'],
  choices: [
    {
      id: 'crisis_family_intervene',
      text: 'Araya gir ve onları sakinleştirmeye çalış',
      effect: { charisma: 3, health: -5, familyRelation: 5, energy: -10 },
      stressEffect: -15,
      feedback: 'Küçük omuzların büyük bir yük taşıdı. Biraz sakinleştiler ama bu senin taşıman gereken bir yük değildi.',
      memory: { emotion: 'NEUTRAL', weight: 'HIGH', customNote: 'Aile kavgasında arabulucu oldun' },
    },
    {
      id: 'crisis_family_isolate',
      text: 'Kulaklığını tak ve dünyayı kapat',
      effect: { health: -3, charisma: -4, familyRelation: -5, energy: 10 },
      stressEffect: -25,
      feedback: 'Müziğin sesi bağrışmaları bastırdı. Uyuyakaldın. Sabah herkes normal davrandı — sanki hiçbir şey olmamış gibi.',
      memory: { emotion: 'REGRET', weight: 'MEDIUM' },
    },
  ],
};

// ─── SOSYAL DIŞLANMA ───────────────────────────────────────

const CRISIS_SOCIAL_EXCLUSION: GameEvent = {
  id: 'evt_crisis_social_exclusion',
  text: 'Grup sohbetinde herkesin seni konuştuğunu fark ettin. "O gelmesin" yazmışlar. Ekran karardı, içindeki bir şey de.',
  minAge: 11,
  maxAge: 18,
  rarity: 'RARE',
  isRepeatable: true,
  difficulty: 5,
  personalityCategory: 'BREAKDOWN',
  tags: ['burden', 'crisis', 'social', 'friendship'],
  choices: [
    {
      id: 'crisis_social_confront',
      text: 'Yüzlerine söyle — ne düşündüğünü bilsinler',
      effect: { charisma: -3, discipline: 5, health: -5, energy: -10 },
      stressEffect: -20,
      feedback: 'Cesaretini topladın ve konuştun. Bazıları özür diledi, bazıları arkasını döndü. Ama en azından sessiz kalmadın.',
      memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Dışlanmaya karşı durduğun an' },
    },
    {
      id: 'crisis_social_withdraw',
      text: 'Sessizce uzaklaş — yalnız kalmayı tercih et',
      effect: { charisma: -8, intelligence: 3, health: -3, energy: 5 },
      stressEffect: -25,
      feedback: 'O gece çok kitap okudun. Ama sayfalardaki kelimeler bir türlü anlam ifade etmedi. Yalnızlık sessiz bir ağrıdır.',
      memory: { emotion: 'REGRET', weight: 'HIGH' },
    },
  ],
};

// ─── KİMLİK KRİZİ ──────────────────────────────────────────

const CRISIS_IDENTITY: GameEvent = {
  id: 'evt_crisis_identity',
  text: 'Aynaya baktın ve tanıyamadın. "Ben kimim?" sorusu kafanda yankılanıyor. Herkesin beklediği kişi mi, yoksa gerçekten olmak istediğin kişi mi?',
  minAge: 13,
  maxAge: 18,
  rarity: 'RARE',
  isRepeatable: false,
  difficulty: 5,
  personalityCategory: 'BREAKDOWN',
  challengesAxis: 'conformity',
  tags: ['burden', 'crisis', 'identity', 'growth'],
  choices: [
    {
      id: 'crisis_identity_rebel',
      text: 'Herkesin beklentisini bir kenara koy — kendi yolunu çiz',
      effect: { charisma: 5, discipline: -5, familyRelation: -5, energy: -5 },
      stressEffect: -30,
      feedback: 'Saçını farklı kestirdin, tarzını değiştirdin. Herkes şaşırdı. Ama aynada sonunda tanıdığın birini gördün.',
      memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Kimlik krizi — kendi yolunu seçtin' },
    },
    {
      id: 'crisis_identity_conform',
      text: 'Şimdilik akışa kapıl — herkes böyle yapıyor',
      effect: { discipline: 3, charisma: -3, health: -5, energy: 5 },
      stressEffect: -15,
      feedback: 'Normal davranmaya devam ettin. Maskeyi çıkarmadın. Belki bir gün... ama bugün değil.',
      memory: { emotion: 'NEUTRAL', weight: 'MEDIUM' },
    },
  ],
};

// ─── UYKU BOZUKLUĞU ─────────────────────────────────────────

const CRISIS_INSOMNIA: GameEvent = {
  id: 'evt_crisis_insomnia',
  text: 'Üçüncü gece üst üste uyuyamadın. Gözlerin yanıyor, kafan zonkluyor. Saat 04:00 — tavan boş boş sana bakıyor.',
  minAge: 12,
  maxAge: 100,
  rarity: 'RARE',
  isRepeatable: true,
  difficulty: 5,
  personalityCategory: 'BREAKDOWN',
  tags: ['burden', 'crisis', 'health', 'sleep'],
  choices: [
    {
      id: 'crisis_insomnia_rest',
      text: 'Ertesi gün her şeyi iptal et ve uyu',
      effect: { health: 10, discipline: -8, intelligence: -3, energy: 30 },
      stressEffect: -40,
      feedback: '14 saat uyudun. Dünya döndü, sen kaçırdın. Ama vücudun sonunda nefes aldı.',
      memory: { emotion: 'NEUTRAL', weight: 'MEDIUM', customNote: 'Uykusuzluk krizi' },
    },
    {
      id: 'crisis_insomnia_push',
      text: 'Kahve iç ve güne devam et',
      effect: { discipline: 3, health: -12, intelligence: -5, energy: -15 },
      stressEffect: 5,
      feedback: 'Gün boyunca zombi gibi dolaştın. Her şey bulanık. Birisi sana bir şey söyledi ama ne olduğunu hatırlamıyorsun.',
      memory: { emotion: 'REGRET', weight: 'MEDIUM' },
    },
  ],
};

// ─── BAŞARISIZLIK HİSSİ ────────────────────────────────────

const CRISIS_FAILURE_SPIRAL: GameEvent = {
  id: 'evt_crisis_failure_spiral',
  text: 'Her şey ters gidiyor. Sınavlar kötü, arkadaşlıklar soğuk, aile gergin. "Ben hiçbir şeyi beceremiyorum" düşüncesi kafana yerleşti.',
  minAge: 10,
  maxAge: 18,
  rarity: 'RARE',
  isRepeatable: true,
  difficulty: 5,
  personalityCategory: 'BREAKDOWN',
  tags: ['burden', 'crisis', 'self-esteem'],
  choices: [
    {
      id: 'crisis_failure_talk',
      text: 'Birine açıl — belki bir öğretmen, belki bir arkadaş',
      effect: { charisma: 5, health: 5, familyRelation: 3, energy: -5 },
      stressEffect: -35,
      feedback: '"Herkes bazen böyle hisseder" dedi. Klişe geldi ama... gözlerindeki samimiyet gerçekti. Biraz rahatladın.',
      memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Zor anında birine açıldın' },
    },
    {
      id: 'crisis_failure_bottle',
      text: 'Kimseye bir şey belli etme — kendin halledeceksin',
      effect: { discipline: 3, charisma: -5, health: -8, energy: -5 },
      stressEffect: -10,
      feedback: 'Dışarıdan güçlü görünüyorsun. İçerideyse bir fırtına var. Ne kadar daha taşıyabilirsin?',
      memory: { emotion: 'REGRET', weight: 'HIGH' },
    },
  ],
};

// ─── PERFORMANS BASKISI ─────────────────────────────────────

const CRISIS_PERFECTIONISM: GameEvent = {
  id: 'evt_crisis_perfectionism',
  text: 'Ödevini beşinci kez sildin ve baştan yazdın. Hâlâ yeterince iyi değil. Saat gece 2, gözlerinden yaşlar akıyor — neden bu kadar zor?',
  minAge: 11,
  maxAge: 18,
  rarity: 'RARE',
  isRepeatable: true,
  difficulty: 5,
  personalityCategory: 'BREAKDOWN',
  challengesAxis: 'patience',
  tags: ['burden', 'crisis', 'perfectionism', 'school'],
  choices: [
    {
      id: 'crisis_perfect_submit',
      text: '"Yeterince iyi" de ve gönder',
      effect: { health: 5, discipline: -3, intelligence: -2, energy: 15 },
      stressEffect: -30,
      feedback: 'Mükemmel değildi. Ama teslim ettin. Dünya yıkılmadı. Belki mükemmel olmak zorunda değilsin.',
      memory: { emotion: 'NEUTRAL', weight: 'MEDIUM', customNote: 'Mükemmeliyetçilik krizinden vazgeçtin' },
    },
    {
      id: 'crisis_perfect_redo',
      text: 'Bir kez daha dene — bu sefer olacak',
      effect: { intelligence: 5, discipline: 5, health: -15, energy: -20 },
      stressEffect: 10,
      feedback: 'Altıncı versiyon... yedinci... Sonunda bitirdin. Mükemmel mi? Bilmiyorsun. Ama artık umursamıyorsun bile.',
      memory: { emotion: 'NEUTRAL', weight: 'HIGH' },
    },
  ],
};

// ─── FİZİKSEL ÇÖKÜŞ ────────────────────────────────────────

const CRISIS_PHYSICAL_COLLAPSE: GameEvent = {
  id: 'evt_crisis_physical_collapse',
  text: 'Okul merdivenlerinde aniden başın döndü ve tutunmak zorunda kaldın. Yemek yemeyi, su içmeyi ne zaman bıraktığını hatırlamıyorsun.',
  minAge: 12,
  maxAge: 100,
  rarity: 'RARE',
  isRepeatable: true,
  difficulty: 5,
  personalityCategory: 'BREAKDOWN',
  tags: ['burden', 'crisis', 'health', 'physical'],
  choices: [
    {
      id: 'crisis_physical_hospital',
      text: 'Revire git ve yardım iste',
      effect: { health: 15, money: -50, discipline: -5, energy: 20 },
      stressEffect: -35,
      feedback: 'Revirde serum taktılar. "Düzgün beslenmen lazım" dedi hemşire. Basit bir cümle ama içine işledi.',
      memory: { emotion: 'NEUTRAL', weight: 'HIGH', customNote: 'Fiziksel çöküş — revire kaldırıldın' },
    },
    {
      id: 'crisis_physical_ignore',
      text: 'Geçer, sadece biraz yorgunum',
      effect: { discipline: 3, health: -15, energy: -10, charisma: -3 },
      stressEffect: 5,
      feedback: 'Güne devam ettin ama herkes solgun yüzünü fark etti. "İyi misin?" sorularına "iyiyim" dedin. Değildin.',
      memory: { emotion: 'REGRET', weight: 'HIGH' },
    },
  ],
};

// ─── ÇOCUKLUK KRİZİ (Küçük yaşlar için) ────────────────────

const CRISIS_CHILDHOOD_OVERWHELM: GameEvent = {
  id: 'evt_crisis_childhood_overwhelm',
  text: 'Bugün okuldaki her şey çok fazla oldu. Öğretmen bağırdı, arkadaşın kırdı, ödev zor geldi. Eve gelince kapıyı kapatıp ağladın.',
  minAge: 7,
  maxAge: 11,
  rarity: 'RARE',
  isRepeatable: true,
  difficulty: 3,
  personalityCategory: 'BREAKDOWN',
  tags: ['burden', 'crisis', 'childhood'],
  choices: [
    {
      id: 'crisis_child_parent',
      text: 'Anne/babana koş ve sarıl',
      effect: { health: 8, familyRelation: 8, charisma: 3, energy: 15 },
      stressEffect: -40,
      feedback: 'Sıcak bir kucak, bir bardak süt ve "her şey düzelecek" sözü. Küçük kalbin biraz rahatladı.',
      memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Zor günde ailene sığındın' },
    },
    {
      id: 'crisis_child_hide',
      text: 'Yatağının altına saklan ve yalnız kal',
      effect: { health: -3, charisma: -3, familyRelation: -3, energy: 5 },
      stressEffect: -20,
      feedback: 'Yatağın altında karanlıkta bekledin. Sonunda uyuyakaldın. Sabah biraz daha iyi hissettin ama kimseye anlatmadın.',
      memory: { emotion: 'REGRET', weight: 'MEDIUM' },
    },
  ],
};

// ─── TÜM KRİZ EVENTLERİ ────────────────────────────────────

const CRISIS_EVENTS_BASE: GameEvent[] = [
  BURDEN_BREAKDOWN_EVENT,
  CRISIS_EXAM_PANIC,
  CRISIS_FAMILY_PRESSURE,
  CRISIS_SOCIAL_EXCLUSION,
  CRISIS_IDENTITY,
  CRISIS_INSOMNIA,
  CRISIS_FAILURE_SPIRAL,
  CRISIS_PERFECTIONISM,
  CRISIS_PHYSICAL_COLLAPSE,
  CRISIS_CHILDHOOD_OVERWHELM,
];

export const ALL_CRISIS_EVENTS: GameEvent[] = withEventLocalizationKeysForAll(CRISIS_EVENTS_BASE);

const FALLBACK_CRISIS_EVENT_ID = BURDEN_BREAKDOWN_EVENT.id;

const getFallbackCrisisEvent = (): GameEvent => (
  ALL_CRISIS_EVENTS.find(event => event.id === FALLBACK_CRISIS_EVENT_ID)
  || ALL_CRISIS_EVENTS[0]
  || BURDEN_BREAKDOWN_EVENT
);

/**
 * Oyuncunun yaşına ve son gördüğü eventlere göre uygun bir kriz eventi seçer.
 * Aynı krizi üst üste göstermez, yaş aralığına dikkat eder.
 */
export const selectCrisisEvent = (
  age: number,
  recentEvents: string[],
): GameEvent => {
  const eligible = ALL_CRISIS_EVENTS.filter(e => {
    if (age < e.minAge || age > e.maxAge) return false;
    if (!e.isRepeatable && recentEvents.includes(e.id)) return false;
    // Son 5 event içinde aynısını gösterme
    const lastFive = recentEvents.slice(-5);
    if (lastFive.includes(e.id)) return false;
    return true;
  });

  const fallbackEvent = getFallbackCrisisEvent();
  if (eligible.length === 0) return fallbackEvent;

  // Basit rastgele seçim — orijinal breakdown'a daha düşük ağırlık ver
  const weighted = eligible.flatMap(e =>
    e.id === fallbackEvent.id ? [e] : [e, e]
  );

  return weighted[Math.floor(Math.random() * weighted.length)] || fallbackEvent;
};
