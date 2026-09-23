/**
 * butterflyEffectEvents.ts — Geri dönüşü olmayan "point of no return" event'leri (Paket 6)
 *
 * Her yaş diliminde en az 1 kalıcı sonuç üreten event.
 * setPermanentFlags ile bayrak set eder, reqPermanentFlags ile kontrol edilir.
 */

import type { GameEvent } from '../types';

export const BUTTERFLY_EFFECT_EVENTS: GameEvent[] = [
  // ─────────────────────────────────────────────
  // YAŞ 5-7: Yakın arkadaş taşınıyor
  // ─────────────────────────────────────────────
  {
    id: 'butterfly_friend_moving_away',
    text: 'En yakın arkadaşının ailesi başka şehre taşınıyor. Bugün son günü. Parkta oturmuş, ikisi de sessiz.',
    minAge: 5,
    maxAge: 7,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'FRIEND',
    tags: ['butterfly', 'friendship', 'loss'],
    choices: [
      {
        text: 'Sarıl ve ağla, her şeyi söyle',
        effect: { charisma: 3, energy: -10 },
        feedback: 'Gözyaşları arasında veda ettiniz. Bu anı hiç unutmayacaksın.',
        personalityEffects: [{ axis: 'empathy', change: 5 }],
        memory: { emotion: 'REGRET', weight: 'HIGH' },
        setPermanentFlags: { lost_childhood_friend: true },
        futureEvents: [{
          trigger: 'AGE',
          age: 10,
          eventId: 'butterfly_friend_farewell_open_echo',
          priority: 'HIGH',
        }],
      },
      {
        text: 'Normal davran, sanki hiç taşınmıyormuş gibi',
        effect: { discipline: 2, energy: -5 },
        feedback: 'Hiçbir şey olmamış gibi oynadınız. Ama ikimiz de biliyorduk.',
        personalityEffects: [{ axis: 'courage', change: -3 }, { axis: 'patience', change: 3 }],
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM' },
        setPermanentFlags: { lost_childhood_friend: true },
        futureEvents: [{
          trigger: 'AGE',
          age: 10,
          eventId: 'butterfly_friend_farewell_silent_echo',
          priority: 'HIGH',
        }],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // YAŞ 8-10: Okul değişikliği
  // ─────────────────────────────────────────────
  {
    id: 'butterfly_school_change',
    text: 'Ailen yeni bir mahalleye taşındı. Yeni okula başlamak zorundasın. Eski arkadaşlarını bir daha göremeyebilirsin.',
    minAge: 8,
    maxAge: 10,
    rarity: 'RARE',
    personalityCategory: 'GROWTH',
    tags: ['butterfly', 'school', 'change'],
    choices: [
      {
        text: 'Heyecanlan — yeni başlangıçlar güzeldir',
        effect: { charisma: 5, intelligence: 2, energy: -10 },
        feedback: 'Yeni okulda ilk günün. Yeni yüzler, yeni fırsatlar. Geçmişi geride bıraktın.',
        personalityEffects: [{ axis: 'openness', change: 5 }, { axis: 'courage', change: 3 }],
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        setPermanentFlags: { changed_school: true, embraced_change: true },
        futureEvents: [{
          trigger: 'AGE',
          age: 14,
          eventId: 'butterfly_school_change_embraced_echo',
          priority: 'HIGH',
        }],
      },
      {
        text: 'Direnmek istiyorsun ama çaresizsin',
        effect: { health: -3, discipline: 3, energy: -15 },
        feedback: 'Eski arkadaşlarını özlüyorsun. Yeni okulda herkes yabancı. Ama ayakta kalacaksın.',
        personalityEffects: [{ axis: 'patience', change: 5 }, { axis: 'openness', change: -3 }],
        memory: { emotion: 'REGRET', weight: 'HIGH' },
        setPermanentFlags: { changed_school: true, resisted_change: true },
        stressEffect: 10,
        futureEvents: [{
          trigger: 'AGE',
          age: 14,
          eventId: 'butterfly_school_change_resisted_echo',
          priority: 'HIGH',
        }],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // YAŞ 11-13: Aile boşanması
  // ─────────────────────────────────────────────
  {
    id: 'butterfly_family_divorce',
    text: 'Anne ve baba artık ayrı yaşayacak. İkisi de seni seviyor diyorlar ama evde her şey değişiyor.',
    minAge: 11,
    maxAge: 13,
    rarity: 'RARE',
    personalityCategory: 'CONFLICT',
    reqFamily: { dynamic: ['CHAOTIC'] },
    tags: ['butterfly', 'family', 'divorce'],
    choices: [
      {
        text: 'Anne tarafında kal',
        effect: { familyRelation: -5, charisma: -3, discipline: 2 },
        feedback: 'Annenle kalmaya karar verdin. Baban uzaklaştı ama annenle bağın güçlendi.',
        personalityEffects: [{ axis: 'empathy', change: 3 }, { axis: 'conformity', change: 3 }],
        memory: { emotion: 'GUILT', weight: 'HIGH' },
        setPermanentFlags: { family_divorced: true, chose_mother: true },
        grantScars: [{
          id: 'scar_divorce_guilt',
          sourceEventId: 'butterfly_family_divorce',
          label: 'Boşanma Yükü',
          description: 'Aile boşanmasının gölgesi seni takip ediyor.',
          traitProtection: ['withdrawn'],
        }],
      },
      {
        text: 'Baba tarafında kal',
        effect: { familyRelation: -5, intelligence: 2, charisma: -2 },
        feedback: 'Babanla kalmayı seçtin. Annen kırıldı ama baban sana destek oldu.',
        personalityEffects: [{ axis: 'courage', change: 3 }, { axis: 'conformity', change: -3 }],
        memory: { emotion: 'GUILT', weight: 'HIGH' },
        setPermanentFlags: { family_divorced: true, chose_father: true },
        grantScars: [{
          id: 'scar_divorce_guilt',
          sourceEventId: 'butterfly_family_divorce',
          label: 'Boşanma Yükü',
          description: 'Aile boşanmasının gölgesi seni takip ediyor.',
          traitProtection: ['withdrawn'],
        }],
      },
      {
        text: 'İkisiyle de konuş, ortayı bul',
        effect: { familyRelation: -2, charisma: 5, energy: -20 },
        feedback: 'İkisini de dinledin, ikisini de anlamaya çalıştın. Çok zor ama olgunlaştırıcı.',
        personalityEffects: [{ axis: 'empathy', change: 5 }, { axis: 'patience', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH' },
        setPermanentFlags: { family_divorced: true, mediated_divorce: true },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // YAŞ 14-16: Büyük ihanet
  // ─────────────────────────────────────────────
  {
    id: 'butterfly_best_friend_betrayal',
    text: 'En yakın arkadaşın senin sırrını tüm okula yaymış. Herkes biliyor. Koridorda fısıltılar duyuyorsun.',
    minAge: 14,
    maxAge: 16,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    reqNPCRole: 'BEST_FRIEND',
    tags: ['butterfly', 'friendship', 'betrayal'],
    choices: [
      {
        text: 'Affet — herkes hata yapar',
        effect: { charisma: 3, health: -5 },
        feedback: 'Affettin ama unutmadın. İlişkiniz asla eskisi gibi olmayacak.',
        personalityEffects: [{ axis: 'empathy', change: 5 }, { axis: 'patience', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH' },
        setPermanentFlags: { betrayed_by_friend: true, forgave_betrayal: true },
      },
      {
        text: 'Asla affetme — ilişkiyi bitir',
        effect: { discipline: 5, charisma: -3, health: -3 },
        feedback: 'Onu hayatından çıkardın. Acı verdi ama kendine saygını korudun.',
        personalityEffects: [{ axis: 'courage', change: 5 }, { axis: 'empathy', change: -5 }],
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        setPermanentFlags: { betrayed_by_friend: true, cut_off_betrayer: true },
        grantScars: [{
          id: 'scar_betrayal_trust',
          sourceEventId: 'butterfly_best_friend_betrayal',
          label: 'Güven Yarası',
          description: 'Bir daha kimseye o kadar kolay güvenmiyorsun.',
          traitProtection: ['distrustful'],
        }],
      },
      {
        text: 'İntikam al — onun da sırrını yay',
        effect: { charisma: -5, discipline: -3 },
        feedback: 'Misilleme yaptın. Tatmin edici ama ikimiz de yıkıldık.',
        personalityEffects: [
          { axis: 'empathy', change: -7 },
          { axis: 'conformity', change: -5 },
        ],
        memory: { emotion: 'REGRET', weight: 'HIGH' },
        setPermanentFlags: { betrayed_by_friend: true, retaliated_betrayal: true },
        stressEffect: 15,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // YAŞ 17-18: Üniversite vs İş tercihi
  // ─────────────────────────────────────────────
  {
    id: 'butterfly_university_or_work',
    text: 'Lise bitmek üzere. Önünde iki yol var: üniversite sınavına hazırlan ya da hemen iş hayatına atıl.',
    minAge: 17,
    maxAge: 18,
    rarity: 'COMMON',
    personalityCategory: 'GROWTH',
    isMilestoneEvent: true,
    milestoneLevel: 'MAJOR',
    tags: ['butterfly', 'career', 'future'],
    choices: [
      {
        text: 'Üniversiteye hazırlan',
        effect: { intelligence: 5, discipline: 5, energy: -20 },
        feedback: 'Uzun yol ama doğru yol diye düşünüyorsun. Kitaplar masanda, gelecek belirsiz ama umutlu.',
        personalityEffects: [{ axis: 'patience', change: 5 }],
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        setPermanentFlags: { chose_university_path: true },
      },
      {
        text: 'İş hayatına atıl',
        effect: { money: 500, discipline: 3, charisma: 3 },
        feedback: 'Para kazanmaya başladın. Bağımsızlık güzel ama arkadaşların kampüste eğlenirken sen çalışıyorsun.',
        personalityEffects: [{ axis: 'courage', change: 5 }, { axis: 'conformity', change: -5 }],
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        setPermanentFlags: { chose_work_path: true },
      },
    ],
  },

  // ─────────────────────────────────────────────
  // POST-DIVORCE: Boşanma sonrası yeni hayat
  // ─────────────────────────────────────────────
  {
    id: 'butterfly_post_divorce_adaptation',
    text: 'Boşanmadan sonra yeni düzene alışmaya çalışıyorsun. Hafta sonları diğer ebeveynde geçiyor.',
    minAge: 12,
    maxAge: 15,
    rarity: 'UNCOMMON',
    personalityCategory: 'GROWTH',
    reqPermanentFlags: { family_divorced: true },
    tags: ['butterfly', 'family', 'adaptation'],
    choices: [
      {
        text: 'İki ev arasında denge kur',
        effect: { discipline: 3, charisma: 2, familyRelation: 5 },
        feedback: 'Zor ama iki tarafı da mutlu etmeyi öğrendin. Bu seni olgunlaştırdı.',
        personalityEffects: [{ axis: 'patience', change: 3 }, { axis: 'empathy', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        text: 'Durumu kabullenmekte zorlan',
        effect: { health: -5, energy: -10 },
        feedback: 'Hala alışamadın. Bazı geceler ağlıyorsun ama kimseye söylemiyorsun.',
        personalityEffects: [{ axis: 'openness', change: -3 }],
        memory: { emotion: 'REGRET', weight: 'MEDIUM' },
        stressEffect: 8,
      },
    ],
  },

  // ─────────────────────────────────────────────
  // GECİKMELİ SONUÇLAR: Erken seçimler yıllar sonra geri döner
  // Bu olaylar yalnızca source choice tarafından planlanır.
  // ─────────────────────────────────────────────
  {
    id: 'butterfly_friend_farewell_open_echo',
    text: 'Yıllar önce taşınan çocukluk arkadaşından bir mektup geldi. Vedalaşırken söylediklerini hâlâ hatırlıyor ve bağınızı yeniden kurmak istiyor.',
    minAge: 10,
    maxAge: 10,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqEventIds: ['butterfly_friend_moving_away'],
    tags: ['butterfly', 'friendship', 'followup', 'scheduled_only'],
    choices: [
      {
        id: 'friend_open_echo_reply',
        text: 'Uzun bir cevap yaz',
        effect: { charisma: 4, energy: -5 },
        feedback: 'O gün duygularını saklamadığın için aranızdaki bağ yıllara dayanmış. Mektuplaşmaya yeniden başladınız.',
        personalityEffects: [{ axis: 'empathy', change: 3 }, { axis: 'openness', change: 2 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH' },
        setPermanentFlags: { childhood_friend_reconnected: true },
      },
      {
        id: 'friend_open_echo_keep_memory',
        text: 'Mektubu anı kutuna kaldır',
        effect: { discipline: 2, charisma: 1 },
        feedback: 'Cevap vermedin; yine de dürüst vedanızın iyi bir anı olarak kaldığını fark ettin.',
        personalityEffects: [{ axis: 'patience', change: 2 }],
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM' },
      },
    ],
  },
  {
    id: 'butterfly_friend_farewell_silent_echo',
    text: 'Taşınan çocukluk arkadaşının eski bir fotoğrafını buldun. Son gün hiçbir şey söylemeyişiniz, içinde yarım kalmış bir cümle gibi duruyor.',
    minAge: 10,
    maxAge: 10,
    rarity: 'UNCOMMON',
    personalityCategory: 'GROWTH',
    reqEventIds: ['butterfly_friend_moving_away'],
    tags: ['butterfly', 'friendship', 'followup', 'scheduled_only'],
    choices: [
      {
        id: 'friend_silent_echo_reach_out',
        text: 'Ailesinden iletişim adresini iste',
        effect: { charisma: 3, discipline: 2, energy: -5 },
        feedback: 'Yıllar önce sustuğun yerde bu kez ilk adımı attın. Gecikmiş de olsa vedanı tamamladın.',
        personalityEffects: [{ axis: 'courage', change: 4 }, { axis: 'openness', change: 2 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH' },
        setPermanentFlags: { childhood_friend_reconnected: true },
      },
      {
        id: 'friend_silent_echo_avoid',
        text: 'Fotoğrafı yerine koy',
        effect: { discipline: 1, charisma: -1 },
        feedback: 'Konuyu yine kapattın. Söylenmemiş sözlerin ağırlığı azalsa da tamamen kaybolmadı.',
        personalityEffects: [{ axis: 'openness', change: -2 }],
        memory: { emotion: 'REGRET', weight: 'MEDIUM' },
        stressEffect: 4,
      },
    ],
  },
  {
    id: 'butterfly_school_change_embraced_echo',
    text: 'Lisede yeni bir proje ekibi kuruluyor. Yıllar önce okul değiştirirken gösterdiğin merak sayesinde farklı çevrelere girmek artık sana yabancı gelmiyor.',
    minAge: 14,
    maxAge: 14,
    rarity: 'UNCOMMON',
    personalityCategory: 'GROWTH',
    reqEventIds: ['butterfly_school_change'],
    tags: ['butterfly', 'school', 'followup', 'scheduled_only'],
    choices: [
      {
        id: 'school_embraced_echo_lead',
        text: 'Ekibi kurmaya öncülük et',
        effect: { charisma: 5, intelligence: 2, energy: -8 },
        feedback: 'Eski bir değişimi fırsata çevirmiş olman, bugün yabancılar arasında liderlik etmeni kolaylaştırdı.',
        personalityEffects: [{ axis: 'courage', change: 3 }, { axis: 'openness', change: 3 }],
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        setPermanentFlags: { leads_new_groups: true },
      },
      {
        id: 'school_embraced_echo_join',
        text: 'Bir ekibe katıl',
        effect: { charisma: 2, intelligence: 2, energy: -4 },
        feedback: 'Yeni insanlara yaklaşmak kolay geldi. Değişime açık olmanın sessiz avantajını kullandın.',
        personalityEffects: [{ axis: 'openness', change: 2 }],
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
    ],
  },
  {
    id: 'butterfly_school_change_resisted_echo',
    text: 'Lisede sınıflar yeniden dağıtıldı. Yıllar önceki okul değişikliğinde hissettiğin yabancılık geri dönüyor; bu kez nasıl karşılık vereceğini sen seçebilirsin.',
    minAge: 14,
    maxAge: 14,
    rarity: 'UNCOMMON',
    personalityCategory: 'GROWTH',
    reqEventIds: ['butterfly_school_change'],
    tags: ['butterfly', 'school', 'followup', 'scheduled_only'],
    choices: [
      {
        id: 'school_resisted_echo_recover',
        text: 'İlk gün bir kişiyle tanış',
        effect: { charisma: 3, discipline: 2, energy: -6 },
        feedback: 'Bu kez değişimin seni yönetmesine izin vermedin. Küçük bir adımla eski korkunun yönünü değiştirdin.',
        personalityEffects: [{ axis: 'courage', change: 4 }, { axis: 'openness', change: 2 }],
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        setPermanentFlags: { overcame_school_change_fear: true },
        stressEffect: -6,
      },
      {
        id: 'school_resisted_echo_withdraw',
        text: 'Bir süre gözlemci kal',
        effect: { intelligence: 1, charisma: -2, energy: 2 },
        feedback: 'Kendini korumayı seçtin. Eski alışkanlık güvenli hissettirdi ama yeni çevreye uyumunu geciktirdi.',
        personalityEffects: [{ axis: 'patience', change: 2 }, { axis: 'openness', change: -2 }],
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM' },
        stressEffect: 3,
      },
    ],
  },
];
