import { GameEvent, RelationshipMilestone, EventContext, NPC } from '../types';

// =================================================================
// İLİŞKİ MİLESTONE EVENTLERİ
// NPC ilişki seviyeleri değiştiğinde tetiklenen özel olaylar
// =================================================================

// Her milestone için tetiklenebilecek event ID'leri
export const MILESTONE_EVENT_MAP: Record<RelationshipMilestone, string[]> = {
  BECAME_FRIEND: ['milestone_new_friendship'],
  BECAME_BEST_FRIEND: ['milestone_best_friend_celebration', 'milestone_bff_promise'],
  BECAME_CRUSH: ['milestone_butterflies', 'milestone_first_crush_feelings'],
  BECAME_PARTNER: ['milestone_new_relationship', 'milestone_first_date'],
  BECAME_RIVAL: ['milestone_rivalry_begins'],
  BECAME_ENEMY: ['milestone_enemy_made'],
  LOST_FRIEND: ['milestone_friendship_lost'],
  BREAKUP: ['milestone_heartbreak'],
};

// Helper: Context'teki son milestone NPC'sini bul
const getRecentMilestoneNPC = (ctx: EventContext, role: string): NPC | null => {
  const npcs = ctx.npcs || [];
  return npcs.find(n => n.role === role) || null;
};

export const MILESTONE_EVENTS: GameEvent[] = [

  // =================================================================
  // ARKADAŞLIK MİLESTONE'LARI
  // =================================================================

  {
    id: 'milestone_new_friendship',
    text: (ctx: EventContext) => {
      const friend = getRecentMilestoneNPC(ctx, 'FRIEND');
      const name = friend?.name || 'Yeni arkadaşın';
      return `${name} artık gerçek bir arkadaşın oldu! Teneffüslerde birlikte takılıyor, sırlarınızı paylaşıyorsunuz. "Seninle arkadaş olmak çok güzel!" diyor.`;
    },
    minAge: 5,
    maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    isMilestoneEvent: true,
    choices: [
      {
        text: '🤝 "Sen de benim için özelsin!"',
        effect: { charisma: 3 },
        feedback: 'Arkadaşlığınız güçlendi. Birbirinize güvenebilirsiniz.',
        npcRelationChange: 5,
        stressEffect: -5,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
      },
      {
        text: '😊 Gülümse ve sarıl',
        effect: { charisma: 2, health: 2 },
        feedback: 'Sıcak bir kucaklaşma. Arkadaşlık bağları kuvvetlendi.',
        npcRelationChange: 8,
        stressEffect: -8,
      },
    ],
  },

  {
    id: 'milestone_best_friend_celebration',
    text: (ctx: EventContext) => {
      const bestFriend = getRecentMilestoneNPC(ctx, 'BEST_FRIEND');
      const name = bestFriend?.name || 'En iyi arkadaşın';
      return `${name} ile artık en iyi arkadaşsınız! Yıllar içinde kurduğunuz bağ çok özel. "Sen benim kardeşimsin, hayatımdaki en önemli insanlardan birisin!" diyor gözleri parlayarak.`;
    },
    minAge: 8,
    maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'SOCIAL',
    isMilestoneEvent: true,
    choices: [
      {
        text: '🤗 Sıkıca sarıl: "Sen de benim için öylesin!"',
        effect: { charisma: 5, health: 5 },
        feedback: 'Birbirinize sıkıca sarıldınız. Bu dostluk ömür boyu sürecek.',
        npcRelationChange: 10,
        stressEffect: -15,
        personalityEffects: [{ axis: 'empathy', change: 5 }],
      },
      {
        text: '💎 Özel bir hediye ver',
        effect: { charisma: 8, money: -50 },
        feedback: 'Arkadaşlığınızın simgesi olacak bir hediye verdin. Gözleri doldu.',
        npcRelationChange: 15,
        stressEffect: -10,
      },
      {
        text: '📝 "Ömür boyu arkadaş kalacağız" sözü ver',
        effect: { discipline: 3, charisma: 3 },
        feedback: 'Birbirinize söz verdiniz. Bu söz her şeyden değerli.',
        npcRelationChange: 12,
        personalityEffects: [{ axis: 'empathy', change: 3 }, { axis: 'courage', change: 2 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'En iyi arkadaşlık sözü' },
      },
    ],
  },

  {
    id: 'milestone_bff_promise',
    text: (ctx: EventContext) => {
      const bestFriend = getRecentMilestoneNPC(ctx, 'BEST_FRIEND');
      const name = bestFriend?.name || 'En iyi arkadaşın';
      return `${name} sana küçük bir kutu uzattı. İçinde iki parça halinde bölünmüş bir kolye var. "Yarısı sende, yarısı bende. Nerede olursak olalım, hep bağlı kalacağız."`;
    },
    minAge: 10,
    maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'SOCIAL',
    isMilestoneEvent: true,
    choices: [
      {
        text: '💝 Kolyenin yarısını tak',
        effect: { charisma: 5 },
        feedback: 'Kolyeyi boynuna taktın. Bu sembol, aranızdaki bağın simgesi.',
        npcRelationChange: 15,
        stressEffect: -10,
        inventoryAdd: ['bff_necklace_half'],
      },
      {
        text: '🙏 Teşekkür et ama kabul etme',
        effect: { discipline: 2 },
        feedback: 'Nazikçe reddetttin. Arkadaşın biraz hayal kırıklığına uğradı.',
        npcRelationChange: -5,
        personalityEffects: [{ axis: 'empathy', change: -2 }],
      },
    ],
  },

  // =================================================================
  // ROMANTİK MİLESTONE'LAR
  // =================================================================

  {
    id: 'milestone_butterflies',
    text: (ctx: EventContext) => {
      const crush = getRecentMilestoneNPC(ctx, 'CRUSH');
      const name = crush?.name || 'O kişi';
      return `${name}'a bakarken kalbinin hızlandığını, yüzünün kızardığını fark ettin. ${name} her güldüğünde içinde kelebekler uçuşuyor. İlk defa birinden bu kadar hoşlanıyorsun...`;
    },
    minAge: 12,
    maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    isMilestoneEvent: true,
    choices: [
      {
        text: '💕 Bu hisleri kabullen',
        effect: { charisma: 2 },
        feedback: 'Hoşlandığını kabul ettin. Şimdi ne yapacağına karar vermelisin.',
        stressEffect: 5,
        personalityEffects: [{ axis: 'courage', change: 3 }],
      },
      {
        text: '📓 Günlüğüne yaz',
        effect: { intelligence: 2 },
        feedback: 'Tüm hislerini günlüğüne döktün. Rahatladın ama hâlâ kafan karışık.',
        stressEffect: -5,
        personalityEffects: [{ axis: 'patience', change: 2 }],
      },
      {
        text: '🙈 Bu hisleri bastır',
        effect: { discipline: 3 },
        feedback: 'Hislerini görmezden gelmeye çalıştın. Ama görmezden gelmek çözüm mü?',
        stressEffect: 10,
        personalityEffects: [{ axis: 'courage', change: -3 }],
      },
    ],
  },

  {
    id: 'milestone_first_crush_feelings',
    text: (ctx: EventContext) => {
      const crush = getRecentMilestoneNPC(ctx, 'CRUSH');
      const name = crush?.name || 'Hoşlandığın kişi';
      return `${name} bugün sana farklı baktı. Yoksa o da mı...? Kalbin yerinden çıkacak gibi atıyor. Arkadaşların fark etti: "Neden yüzün bu kadar kırmızı?"`;
    },
    minAge: 12,
    maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    isMilestoneEvent: true,
    choices: [
      {
        text: '😳 "Hiçbir şey, sıcak geldi" de',
        effect: {},
        feedback: 'Geçiştirdin ama herkes anladı. Artık bir sırrın var.',
        stressEffect: 5,
        personalityEffects: [{ axis: 'courage', change: -2 }],
      },
      {
        text: '😊 Arkadaşlarına itiraf et',
        effect: { charisma: 3 },
        feedback: 'Arkadaşların heyecanlandı! Artık yardımcıların var.',
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'openness', change: 5 }],
      },
    ],
  },

  {
    id: 'milestone_new_relationship',
    text: (ctx: EventContext) => {
      const partner = getRecentMilestoneNPC(ctx, 'PARTNER');
      const name = partner?.name || 'Sevgilin';
      return `${name} ile artık resmi olarak birlikteisiniz! İlk ilişkin... El ele tutuştuğunuzda tüm dünya duruyor sanki. "Seninle olmak çok güzel" diyor ${name}.`;
    },
    minAge: 13,
    maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'SOCIAL',
    isMilestoneEvent: true,
    choices: [
      {
        text: '❤️ "Ben de çok mutluyum"',
        effect: { charisma: 5, health: 5 },
        feedback: 'İlk ilişkiniz başladı. Hayat çok güzel!',
        npcRelationChange: 15,
        stressEffect: -20,
        personalityEffects: [{ axis: 'courage', change: 5 }, { axis: 'openness', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'İlk ilişki başlangıcı' },
      },
      {
        text: '😊 Utanarak gülümse',
        effect: { charisma: 3 },
        feedback: 'Utangaç ama mutlu bir başlangıç.',
        npcRelationChange: 10,
        stressEffect: -10,
      },
    ],
  },

  {
    id: 'milestone_first_date',
    text: (ctx: EventContext) => {
      const partner = getRecentMilestoneNPC(ctx, 'PARTNER');
      const name = partner?.name || 'Sevgilin';
      return `${name} ile ilk buluşmanız! Nereye gideceksiniz?`;
    },
    minAge: 13,
    maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'SOCIAL',
    isMilestoneEvent: true,
    choices: [
      {
        text: '🎬 Sinemaya git',
        effect: { money: -30, charisma: 3 },
        feedback: 'Harika bir film izlediniz. El ele tutuştunuz!',
        npcRelationChange: 10,
        stressEffect: -10,
      },
      {
        text: '🌳 Parkta yürüyüş yap',
        effect: { health: 3, charisma: 2 },
        feedback: 'Doğada güzel bir vakit geçirdiniz. Sohbet çok akıcıydı.',
        npcRelationChange: 8,
        stressEffect: -8,
      },
      {
        text: '☕ Kafede buluş',
        effect: { money: -20, intelligence: 2 },
        feedback: 'Saatlerce sohbet ettiniz. Birbirinizi daha iyi tanıdınız.',
        npcRelationChange: 12,
        stressEffect: -5,
        personalityEffects: [{ axis: 'openness', change: 3 }],
      },
    ],
  },

  // =================================================================
  // OLUMSUZ MİLESTONE'LAR
  // =================================================================

  {
    id: 'milestone_rivalry_begins',
    text: (ctx: EventContext) => {
      const rival = getRecentMilestoneNPC(ctx, 'RIVAL');
      const name = rival?.name || 'O kişi';
      return `${name} ile aranızda bir rekabet başladı. Her fırsatta birbirinizi alt etmeye çalışıyorsunuz. "Seni yeneceğim" diyor gözlerindeki ateşle.`;
    },
    minAge: 8,
    maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    isMilestoneEvent: true,
    choices: [
      {
        text: '🔥 "Ben daha iyiyim!"',
        effect: { discipline: 3 },
        feedback: 'Rekabeti kabul ettin. Bu seni daha çok çalışmaya itecek.',
        npcRelationChange: -5,
        stressEffect: 10,
        personalityEffects: [{ axis: 'courage', change: 3 }],
      },
      {
        text: '🤝 Barış teklif et',
        effect: { charisma: 5 },
        feedback: '"Düşman olmak zorunda değiliz" dedin. Belki işe yarar.',
        npcRelationChange: 10,
        personalityEffects: [{ axis: 'empathy', change: 5 }],
      },
      {
        text: '🙄 Aldırma',
        effect: { discipline: 2 },
        feedback: 'Umursamaz davrandın. Ama o vazgeçmeyecek gibi görünüyor.',
        stressEffect: 5,
      },
    ],
  },

  {
    id: 'milestone_enemy_made',
    text: (ctx: EventContext) => {
      const enemy = getRecentMilestoneNPC(ctx, 'ENEMY');
      const name = enemy?.name || 'O kişi';
      return `${name} artık senden nefret ediyor. Gözlerindeki soğukluk çok belirgin. "Senden intikam alacağım" der gibi bakıyor.`;
    },
    minAge: 8,
    maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'CONFLICT',
    isMilestoneEvent: true,
    choices: [
      {
        text: '😰 Tedirgin ol',
        effect: { health: -3 },
        feedback: 'Bir düşman kazandın. Arkana dikkat etmelisin.',
        stressEffect: 15,
        personalityEffects: [{ axis: 'courage', change: -3 }],
      },
      {
        text: '💪 "Korkumuyorum!"',
        effect: { discipline: 3 },
        feedback: 'Cesur duruyorsun ama bu savaş kolay olmayacak.',
        stressEffect: 10,
        personalityEffects: [{ axis: 'courage', change: 5 }],
      },
    ],
  },

  {
    id: 'milestone_friendship_lost',
    text: (_ctx: EventContext) => {
      return 'Bir zamanlar arkadaşın olan kişi artık senden uzaklaşmış. Selam bile vermeden geçiyor yanından. Ne oldu böyle?';
    },
    minAge: 6,
    maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    isMilestoneEvent: true,
    choices: [
      {
        text: '😢 Üzül',
        effect: { health: -3 },
        feedback: 'Arkadaşlıklar bazen biter. Ama bu acıtıyor.',
        stressEffect: 15,
        personalityEffects: [{ axis: 'empathy', change: 2 }],
      },
      {
        text: '🤷 Hayat böyle',
        effect: { discipline: 2 },
        feedback: 'Pragmatik davrandın. Ama içinde bir şey eksik.',
        stressEffect: 5,
        personalityEffects: [{ axis: 'patience', change: 3 }],
      },
    ],
  },

  {
    id: 'milestone_heartbreak',
    text: (_ctx: EventContext) => {
      return 'İlişkin sona erdi. Kalbin kırık, gözlerin dolu. "Neden?" diye soruyorsun kendine. Ama cevap yok.';
    },
    minAge: 13,
    maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'CONFLICT',
    isMilestoneEvent: true,
    choices: [
      {
        text: '😭 Ağla',
        effect: { health: -5 },
        feedback: 'Gözyaşları akıyor. Ama zamanla geçecek... belki.',
        stressEffect: 25,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        memory: { emotion: 'REGRET', weight: 'HIGH', customNote: 'İlk kalp kırıklığı' },
      },
      {
        text: '😤 Öfkelen',
        effect: { discipline: -3 },
        feedback: 'Öfke içini yakıyor. Belki de hak etmişti.',
        stressEffect: 20,
        personalityEffects: [{ axis: 'patience', change: -5 }],
      },
      {
        text: '🎧 Müzik dinle ve içine kapat',
        effect: { intelligence: 2 },
        feedback: 'Acıyı müzikle bastırdın. Ama hâlâ orada.',
        stressEffect: 15,
        personalityEffects: [{ axis: 'openness', change: -3 }],
      },
    ],
  },
];
