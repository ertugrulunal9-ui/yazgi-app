import type { GameEvent } from '../types';

/**
 * Kısa vadeli yankılar: ilk oturumda (ilk birkaç dakika) oyuncuya "kararların geri
 * döner" vaadini göstermek için 1-6 yaştaki kaynak seçimlerden 2-3 tur sonra gelir.
 * Rastgele havuzdan seçilmez; yalnızca kaynak seçim TURNS zamanlayıcısıyla ekler
 * (`scheduled_only`). Her dalın kendine özgü bir yankısı ve iki gerçek seçeneği var.
 */
export const SHORT_TERM_ECHO_EVENTS: GameEvent[] = [
  // --- tr_ilk_kelime ---
  {
    id: 'early_first_word_mom_echo',
    text: "Annen artık her akşam seni kucağına alıp aynı şarkıyı mırıldanıyor. 'Anne' dediğin günden beri ikinizin küçük bir ritüeli var.",
    minAge: 1,
    maxAge: 4,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqEventIds: ['tr_ilk_kelime'],
    tags: ['followup', 'scheduled_only', 'short_echo', 'family'],
    choices: [
      {
        id: 'first_word_mom_echo_sing',
        text: 'Sen de şarkıya eşlik et',
        effect: { familyRelation: 6, charisma: 2 },
        feedback: 'Kelimeleri karıştırdın ama annen kahkahalarla güldü. Bu şarkı artık ikinizin.',
        memory: { emotion: 'SATISFACTION', weight: 'HIGH' },
      },
      {
        id: 'first_word_mom_echo_dad',
        text: 'Babanı da çağır',
        effect: { familyRelation: 4, charisma: 3, energy: -3 },
        feedback: 'Babanı da kucağa çektin. Şarkı bu kez üç kişilik oldu; biraz yoruldun ama çok mutluydun.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
    ],
  },
  {
    id: 'early_first_word_dad_echo',
    text: "Baban 'Baba' dediğin günü hâlâ herkese anlatıyor. Bugün seni ilk kez omzuna alıp parka götürdü.",
    minAge: 1,
    maxAge: 4,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqEventIds: ['tr_ilk_kelime'],
    tags: ['followup', 'scheduled_only', 'short_echo', 'family'],
    choices: [
      {
        id: 'first_word_dad_echo_shoulders',
        text: 'Omzunda kalıp etrafı izle',
        effect: { familyRelation: 5, intelligence: 2 },
        feedback: 'Yukarıdan her şey bambaşka görünüyordu! Babanın saçını tutup kuşları saydın.',
        memory: { emotion: 'SATISFACTION', weight: 'HIGH' },
      },
      {
        id: 'first_word_dad_echo_run',
        text: 'İnip çimenlere koşmak iste',
        effect: { health: 3, familyRelation: 3, energy: -4 },
        feedback: 'Omzundan inip çimenlere koştun. Baban peşinden koşarken ikiniz de nefes nefese kaldınız.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
    ],
  },

  // --- tr_kres_ilk_gun ---
  {
    id: 'early_daycare_cry_echo',
    text: 'Kreşte ikinci haftan. Kapıda annenin elini yine bırakmak istemiyorsun ama ilk gün seni teselli eden öğretmen sana el sallıyor.',
    minAge: 2,
    maxAge: 6,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqEventIds: ['tr_kres_ilk_gun'],
    tags: ['followup', 'scheduled_only', 'short_echo', 'school'],
    choices: [
      {
        id: 'daycare_cry_echo_teacher',
        text: 'Öğretmenin elini tut',
        effect: { charisma: 3, discipline: 2 },
        stressEffect: -3,
        feedback: 'Bu kez ilk günkü gibi ağlamadın. Öğretmen seni boyama masasına götürdü, sen de annene el salladın.',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
      {
        id: 'daycare_cry_echo_cling',
        text: 'Annene sıkıca sarıl',
        effect: { familyRelation: 3, charisma: -2 },
        stressEffect: 4,
        feedback: 'Yine ağladın, annen işe geç kaldı. Ama öğle uykusundan sonra biraz daha alıştın.',
        memory: { emotion: 'NEUTRAL', weight: 'LOW' },
      },
    ],
  },
  {
    id: 'early_daycare_play_echo',
    text: "Kreşte oyuncak köşesinde tanıştığın çocuk bugün sana koşarak geldi: 'Doğum günüme gelir misin?'",
    minAge: 2,
    maxAge: 6,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqEventIds: ['tr_kres_ilk_gun'],
    tags: ['followup', 'scheduled_only', 'short_echo', 'friendship'],
    choices: [
      {
        id: 'daycare_play_echo_yes',
        text: 'Sevinçle evet de',
        effect: { charisma: 5, energy: -3 },
        feedback: 'Doğum gününde pasta yüzüne bulaştı, herkes güldü. İlk gerçek arkadaşın oldu!',
        memory: { emotion: 'SATISFACTION', weight: 'HIGH' },
      },
      {
        id: 'daycare_play_echo_shy',
        text: 'Utanıp annenin arkasına saklan',
        effect: { charisma: 1, familyRelation: 2 },
        stressEffect: 2,
        feedback: 'Utandın ama annen davetiyeyi aldı. Partide önce köşede durdun, sonra yavaş yavaş oyuna katıldın.',
        memory: { emotion: 'NEUTRAL', weight: 'LOW' },
      },
    ],
  },

  // --- tr_kardes_gelmis ---
  {
    id: 'early_sibling_love_echo',
    text: 'Kardeşin artık emekliyor. Bugün odada herkes varken doğruca sana geldi ve kollarını uzattı.',
    minAge: 2,
    maxAge: 7,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqEventIds: ['tr_kardes_gelmis'],
    tags: ['followup', 'scheduled_only', 'short_echo', 'family'],
    choices: [
      {
        id: 'sibling_love_echo_hug',
        text: 'Onu kucakla',
        effect: { familyRelation: 6, charisma: 2, energy: -3 },
        feedback: 'Ağır geldi ama bırakmadın. Annen fotoğraf çekti; kardeşinin en sevdiği kişi senmişsin!',
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
      },
      {
        id: 'sibling_love_echo_toy',
        text: 'Ona en sevdiğin oyuncağı ver',
        effect: { familyRelation: 4, charisma: 3 },
        stressEffect: 2,
        feedback: 'En sevdiğin oyuncağı verdin. Kardeşin onu hemen ağzına soktu; biraz içerledin ama sonra güldün.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
    ],
  },
  {
    id: 'early_sibling_jealous_echo',
    text: 'Kardeşin artık emekliyor ve senin oyuncaklarına uzanıyor. Annen yine onunla ilgilenirken içindeki o eski kıskançlık kıpırdadı.',
    minAge: 2,
    maxAge: 7,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqEventIds: ['tr_kardes_gelmis'],
    tags: ['followup', 'scheduled_only', 'short_echo', 'family'],
    choices: [
      {
        id: 'sibling_jealous_echo_share',
        text: 'Oyuncakla onunla birlikte oyna',
        effect: { familyRelation: 5, charisma: 2 },
        stressEffect: 2,
        feedback: 'Kıskançlığı yutmak zordu ama kuleyi birlikte yıktınız, kardeşin kahkahalarla güldü. Annen ikinize birden sarıldı.',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
      {
        id: 'sibling_jealous_echo_grab',
        text: 'Oyuncağı elinden çek',
        effect: { familyRelation: -4 },
        stressEffect: -1,
        feedback: 'Oyuncak sende kaldı ama kardeşin ağlamaya başladı ve annen seni odana gönderdi. İçinde bir burukluk kaldı.',
        memory: { emotion: 'REGRET', weight: 'MEDIUM' },
      },
    ],
  },

  // --- tr_ilk_yalan ---
  {
    id: 'early_lie_confess_echo',
    text: "Bardağı devirdin, süt halıya yayıldı. Annen 'Vazoda doğruyu söylemiştin, yine söyler misin?' der gibi bakıyor.",
    minAge: 3,
    maxAge: 8,
    rarity: 'UNCOMMON',
    personalityCategory: 'MORAL',
    reqEventIds: ['tr_ilk_yalan'],
    tags: ['followup', 'scheduled_only', 'short_echo', 'honesty'],
    choices: [
      {
        id: 'lie_confess_echo_truth',
        text: 'Yine doğruyu söyle',
        effect: { discipline: 4, familyRelation: 4, energy: -3 },
        stressEffect: 2,
        feedback: "'Ben döktüm.' Annen başını okşadı: 'Sana güveniyorum.' Halıyı birlikte temizlediniz.",
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
      },
      {
        id: 'lie_confess_echo_hide',
        text: 'Lekenin üstüne yastık koy',
        effect: { discipline: -3, familyRelation: -2 },
        stressEffect: -2,
        feedback: "O an rahatladın. Ama akşam yastığı kaldıran annen lekeyi gördü: 'Hani doğruyu söylerdin?' Bu kez daha çok üzüldü.",
        memory: { emotion: 'REGRET', weight: 'MEDIUM' },
      },
    ],
  },
  {
    id: 'early_lie_cat_echo',
    text: "Vazoyu kedinin kırdığını söylemiştin. Bugün annen kediyi 'yaramazlık yapıyor' diye balkona çıkardı; kedi camın önünde miyavlıyor.",
    minAge: 3,
    maxAge: 8,
    rarity: 'UNCOMMON',
    personalityCategory: 'MORAL',
    reqEventIds: ['tr_ilk_yalan'],
    tags: ['followup', 'scheduled_only', 'short_echo', 'honesty'],
    choices: [
      {
        id: 'lie_cat_echo_confess',
        text: 'Annene vazonun gerçeğini anlat',
        effect: { discipline: 5, familyRelation: -1 },
        stressEffect: -4,
        feedback: "Sesin titreyerek her şeyi anlattın. Annen önce kızdı, sonra kediyi içeri aldı ve 'Söylediğin için teşekkürler' dedi. İçindeki taş kalktı.",
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
      },
      {
        id: 'lie_cat_echo_silent',
        text: 'Sessiz kal',
        effect: { discipline: -3 },
        stressEffect: 5,
        feedback: 'Kedi akşama kadar balkonda kaldı. Her miyavlamasında içinde bir şey sıkıştı.',
        memory: { emotion: 'GUILT', weight: 'HIGH' },
      },
    ],
  },
  {
    id: 'early_lie_silent_echo',
    text: "Annen halıyı süpürürken vazonun küçük bir parçasını buldu. 'Bunu kimin kırdığını hâlâ merak ediyorum' dedi ve sana baktı.",
    minAge: 3,
    maxAge: 8,
    rarity: 'UNCOMMON',
    personalityCategory: 'MORAL',
    reqEventIds: ['tr_ilk_yalan'],
    tags: ['followup', 'scheduled_only', 'short_echo', 'honesty'],
    choices: [
      {
        id: 'lie_silent_echo_confess',
        text: "'Ben kırmıştım' de",
        effect: { discipline: 4, familyRelation: -1 },
        stressEffect: -3,
        feedback: "Annen derin bir nefes aldı: 'Geç de olsa söyledin.' Biraz kırıldığı belliydi ama o gece rahat uyudun.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
      {
        id: 'lie_silent_echo_shrug',
        text: 'Omuz silk',
        effect: { discipline: -2 },
        stressEffect: 3,
        feedback: 'Annen bir şey demedi ama bakışından anladığını hissettin. Suçluluk biraz daha büyüdü.',
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
      },
    ],
  },
];
