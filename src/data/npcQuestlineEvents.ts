import { Choice, EventContext, FutureEventConfig, GameEvent, NPC, NPCRole } from '../types';

/**
 * NPC Questline Event'leri — 24 event
 *
 * 4 arc × 6 event = 24 event
 * Her event mevcut GameEvent formatında.
 * Dinamik metin: NPC adı ctx üzerinden alınır.
 */

// Helper: Questline arc'ına bağlı NPC'yi bul
const getQuestNPC = (ctx: EventContext, roles: NPCRole[]): NPC | null => {
  const npcs = ctx.npcs || [];
  for (const role of roles) {
    const found = npcs.find(n => n.role === role);
    if (found) return found;
  }
  return null;
};

const n = (npc: NPC | null): string => npc?.name || 'Arkadaşın';

// =================================================================
// ARC 1: DERİN DOSTLUK (6 event)
// =================================================================

const friendshipEvents: GameEvent[] = [
  {
    id: 'npcq_friend_secret_share',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)} seni kenara çekiyor. Gözleri ciddi. "Sana bir şey söyleyeceğim ama kimseye anlatmayacağına söz ver..." Ailesiyle ilgili zor bir durumu anlatmaya başlıyor.`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'FRIEND',
    choices: [
      {
        text: '🤫 "Söz veriyorum, güvenebilirsin bana"',
        effect: { charisma: 5 },
        npcRelationChange: 15,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Arkadaşının sırrı' },
        feedback: 'Arkadaşın rahatlamış görünüyor. Aranızda derin bir güven bağlandı.',
      },
      {
        text: '😬 "Bu çok ağır... başka birine de söylemeli misin?"',
        effect: { charisma: 0 },
        npcRelationChange: -5,
        personalityEffects: [{ axis: 'conformity', change: 2 }],
        feedback: 'Arkadaşın biraz hayal kırıklığına uğramış gibi. Ama samimiyetini takdir ediyor.',
      },
      {
        text: '🙄 "Herkesin derdi var, çok büyütme"',
        effect: { charisma: -2 },
        npcRelationChange: -15,
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        feedback: 'Arkadaşının yüzü düştü. Belki de bu kadar güvendiği için pişmandır.',
      },
    ],
  },
  {
    id: 'npcq_friend_family_visit',
    tags: ['social', 'friend', 'npc', 'family'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)} seni evine davet etti. Ailesiyle tanışacaksın. Kapıdan girer girmez sıcak yemek kokusu ve kahkaha sesleri duyuyorsun.`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'FRIEND',
    choices: [
      {
        text: '😊 Ailesiyle sıcak bir sohbet kur',
        effect: { charisma: 9 },
        npcRelationChange: 12,
        personalityEffects: [{ axis: 'openness', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Arkadaşının evinde akşamyemeği' },
        feedback: 'Harika bir akşam geçirdin. Arkadaşının ailesi seni çok sevdi.',
      },
      {
        text: '📱 Utanıyorum, telefonuma bakayım',
        effect: { charisma: 0 },
        npcRelationChange: 0,
        personalityEffects: [{ axis: 'openness', change: -2 }],
        feedback: 'Sessiz bir aksam oldu. Firsat kacti ama kotu de gecmedi.',
      },
    ],
  },
  {
    id: 'npcq_friend_casual_hangout',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND']);
      return `${n(npc)} ile okuldan sonra parka gittiniz. "Bugün sadece takılalım, hiç bir şey düşünmeden" diyor.`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'COMMON',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'FRIEND',
    choices: [
      {
        text: '🎉 "Harika fikir! Ne yapalim?"',
        effect: { charisma: 4 },
        npcRelationChange: 8,
        feedback: 'Gülerek vakit geçirdiniz. Bazen en güzel anlar plansız olanlar.',
      },
      {
        text: '📚 "Aslında ders çalışmalıyım..."',
        effect: { intelligence: 2, charisma: -1 },
        npcRelationChange: -3,
        feedback: 'Arkadaşın biraz üzüldü ama anladığından emin.',
      },
    ],
  },
  {
    id: 'npcq_friend_shared_crisis',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `Okulda büyük bir kavga çıktı. Birisi ${n(npc)}'a iftira atıyor — öğretmenler de inanıyor. ${n(npc)} yardım istiyor gibi sana bakıyor.`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    reqNPCRole: 'FRIEND',
    choices: [
      {
        text: '🛡️ "Ben şahit oldum, yanlış anlıyorsunuz!"',
        effect: { charisma: 1 },
        npcRelationChange: 20,
        personalityEffects: [{ axis: 'openness', change: 4 }, { axis: 'empathy', change: 2 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Arkadaşını savundu' },
        feedback: 'Arkadaşın için risk aldın. Bu bağlılığı asla unutmayacak.',
      },
      {
        text: '😰 Karışma, uzak dur',
        effect: { charisma: -3 },
        npcRelationChange: -10,
        personalityEffects: [{ axis: 'openness', change: -2 }],
        feedback: 'Kenara çekildin. Arkadaşın yalnız kaldı ve bunu hissetti.',
      },
      {
        text: '🕵️ Gizlice gerçeği araştır',
        effect: { intelligence: 2, charisma: 1 },
        npcRelationChange: 10,
        personalityEffects: [{ axis: 'openness', change: 1 }],
        futureEvents: [{ trigger: 'TURNS', eventId: 'npcq_friend_adventure', turnsLater: 2 }],
        feedback: 'Kanıtları topluyorsun. Bu cesaretini arkadaşın fark etti.',
      },
    ],
  },
  {
    id: 'npcq_friend_adventure',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)} ile birlikte "yasak bölge"ye — mahallenin terk edilmiş deposuna — girmeye karar verdiniz. Söylentilere göre içerde eski bir hazine var.`;
    },
    minAge: 10, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'RISK',
    reqNPCRole: 'FRIEND',
    choices: [
      {
        text: '🔦 "Hadi birlikte girelim!"',
        effect: { charisma: 5, health: -2 },
        npcRelationChange: 15,
        personalityEffects: [{ axis: 'openness', change: 4 }, { axis: 'openness', change: 2 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Depo macerası' },
        feedback: 'İçerde hazine yoktu ama birlikte yaşadığınız heyecan paha biçilmezdi.',
      },
      {
        text: '🤔 "Fikir değiştirdim, tehlikeli olabilir"',
        effect: { charisma: -1 },
        npcRelationChange: -5,
        personalityEffects: [{ axis: 'conformity', change: 2 }],
        feedback: 'Arkadaşın biraz hayal kırıklığına uğradı. Ama güvenliğinizi korudunuz.',
      },
    ],
  },
  {
    id: 'npcq_friend_loyalty_test',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `Okuldaki popüler grubun lideri sana yaklaştı: "Bizimle takılmak istersen ${n(npc)}'i bırak. O seni aşağı çekiyor." Popüler grup seni kabul edecek ama...`;
    },
    minAge: 10, maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'MORAL',
    reqNPCRole: 'FRIEND',
    choices: [
      {
        text: '💎 "O benim arkadaşım, teşekkürler ama hayır"',
        effect: { charisma: 5 },
        npcRelationChange: 25,
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'conformity', change: -3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Arkadaşını seçti' },
        feedback: 'Popüler grubun teklifini reddetti. Arkadaşın bunun ne kadar zor olduğunu biliyor.',
      },
      {
        text: '🤷 "Düşüneyim..." — iki tarafla da iyi geçin',
        effect: { charisma: 1 },
        npcRelationChange: -8,
        personalityEffects: [{ axis: 'conformity', change: 3 }],
        feedback: 'İki ayak üzerinde duruyorsun ama hiçbir tarafa tam bağlanmadın.',
      },
      {
        text: '⭐ Popüler gruba katıl',
        effect: { charisma: 6 },
        npcRelationChange: -30,
        personalityEffects: [{ axis: 'conformity', change: 5 }, { axis: 'empathy', change: -3 }],
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Arkadaşını bıraktı' },
        feedback: 'Popüler gruba katıldın ama arkadaşının bakışları... bir şey kırıldı.',
      },
    ],
  },
  {
    id: 'npcq_friend_final_bond',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)} ile yılların biriktiği bir akşam. Damların üstünde oturmuş şehri izliyorsunuz. "Sen benim en yakın arkadaşımsın" diyor sessizce.`;
    },
    minAge: 10, maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'FRIEND',
    choices: [
      {
        text: '💎 "Sen de benim. Ne olursa olsun."',
        effect: { charisma: 11 },
        npcRelationChange: 20,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'En yakın arkadaş sözleşti' },
        grantTraits: ['LOYAL_FRIEND'],
        feedback: 'Bu gece asla unutulmayacak. Gerçek bir dostluk mühürlendi.',
      },
    ],
  },
  {
    id: 'npcq_friend_drift_apart',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'ACQUAINTANCE']);
      return `${n(npc)} ile artık eskisi gibi konuşamıyorsunuz. Mesajlarına geç cevap veriyor, planları sürekli iptal ediyor. Bir şeyler değişti.`;
    },
    minAge: 10, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '💬 "Ne oldu aramizda? Konusalim mi?"',
        effect: { charisma: 0 },
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'empathy', change: 2 }, { axis: 'openness', change: 2 }],
        feedback: 'Açık konuştunuz. Belki her şey eskisi gibi olmayacak ama saygı kaldı.',
      },
      {
        text: '🚶 Kabullen ve yoluna devam et',
        effect: { charisma: -3 },
        npcRelationChange: -10,
        personalityEffects: [{ axis: 'openness', change: 1 }],
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM', customNote: 'Bir dostluk sona erdi' },
        feedback: 'Bazı insanlar hayatının bir döneminde kalır. Ve bu da tamam.',
      },
    ],
  },
];

// =================================================================
// ARC 2: İLK AŞK (6 event)
// =================================================================

const romanceEvents: GameEvent[] = [
  {
    id: 'npcq_romance_first_spark',
    tags: ['social', 'love', 'relationship', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH']);
      return `${n(npc)} ile görüşleriniz kesişti — bir an için hiç kimse yokmuş gibi hissettin. Kalbin hızlandı. Bu his... yeni bir şey.`;
    },
    minAge: 13, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'CRUSH',
    choices: [
      {
        text: '😊 Gül ve bak — belki o da hissediyordur',
        effect: { charisma: 5 },
        npcRelationChange: 8,
        personalityEffects: [{ axis: 'openness', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'İlk kıvılcım' },
        feedback: 'Gülümsedin. O da gülümsedi. Kalbindeki çarpıntı sessizce büyüyor.',
      },
      {
        text: '😳 Kafanı çevir — bu konuda hazır değilsin',
        effect: { charisma: -1 },
        personalityEffects: [{ axis: 'openness', change: -2 }],
        feedback: 'Gözlerini kaçırdın. Ama o his bir yere gitmiyor...',
      },
    ],
  },
  {
    id: 'npcq_romance_confession',
    tags: ['social', 'love', 'relationship', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH']);
      return `Okuldan sonra ${n(npc)} ile baş başasınız. İçinden bir ses "söyle" diyor. Diğer ses "dur, ya reddederse?"`;
    },
    minAge: 13, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'CRUSH',
    choices: [
      {
        text: '💕 "Senden hoşlanıyorum..."',
        effect: { charisma: 7 },
        npcRelationChange: 15,
        personalityEffects: [{ axis: 'openness', change: 5 }, { axis: 'openness', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'İtiraf anı' },
        feedback: 'Söyledin. Kalbin patlayacak gibi. Ama bir yükten kurtulmuş gibi de hissediyorsun.',
      },
      {
        text: '📝 Mektup yaz — yüz yüze söyleyemezsin',
        effect: { intelligence: 1, charisma: 2 },
        npcRelationChange: 10,
        personalityEffects: [{ axis: 'openness', change: 2 }],
        feedback: 'Kelimelerin kâğıttan daha güçlü akmış. Şimdi bekleme zamanı.',
      },
      {
        text: '🙊 Yutkundun ama söyleyemedin',
        effect: { charisma: -4 },
        personalityEffects: [{ axis: 'openness', change: -2 }],
        feedback: 'An geçti. Belki başka bir gün... ama bugün değil.',
      },
    ],
  },
  {
    id: 'npcq_romance_first_date',
    tags: ['social', 'love', 'relationship', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH', 'PARTNER']);
      return `${n(npc)} ile ilk kez baş başa dışarı çıkıyorsunuz. "Nereye gidelim?" diye soruyor.`;
    },
    minAge: 13, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'CRUSH',
    choices: [
      {
        text: '☕ Sakin bir kafeye git — konusalim',
        effect: { charisma: 8 },
        npcRelationChange: 12,
        personalityEffects: [{ axis: 'empathy', change: 2 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'İlk buluşma — kafe' },
        feedback: 'Saatlerin nasıl geçtiğini anlamadın. Konuşmak hiç bu kadar kolay olmamıştı.',
      },
      {
        text: '🎬 Sinemaya git — klasik seçim',
        effect: { charisma: 4 },
        npcRelationChange: 8,
        feedback: 'Film güzeldi ama en güzel kısmı yan yana oturmaktı.',
      },
      {
        text: '🌳 Parka yürü — doğada vakit geçir',
        effect: { health: 2, charisma: 5 },
        npcRelationChange: 10,
        personalityEffects: [{ axis: 'openness', change: 2 }],
        feedback: 'Gün batımında yürüyüş. Sessizlik bile rahattı.',
      },
    ],
  },
  {
    id: 'npcq_romance_jealousy_jealous',
    tags: ['social', 'love', 'relationship', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH', 'PARTNER']);
      return `${n(npc)} başkasıyla konuştuğun için sinirli. "O kim? Neden sürekli konuşuyorsunuz?" Sesi sert, gözleri kırgın.`;
    },
    minAge: 13, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '🤗 "Sadece arkadaşım. Sana güveniyorum, sen de bana güven"',
        effect: { charisma: 2 },
        npcRelationChange: 10,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        feedback: 'Sakince açıkladın. Bir süre sonra yumuşamaya başladı.',
      },
      {
        text: '😠 "Bu kadar kıskanç olma, boğuyorsun beni!"',
        effect: { charisma: -4 },
        npcRelationChange: -15,
        personalityEffects: [{ axis: 'openness', change: 2 }],
        feedback: 'Sert konuştun. Belki haklısın ama zamanlama kötü.',
      },
      {
        text: '😞 "Haklisin, bir daha olmaz"',
        effect: { charisma: -2 },
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'conformity', change: 3 }, { axis: 'openness', change: -2 }],
        feedback: 'Teslim oldun. Kisa vadede rahatladi ama uzun vadede...',
      },
    ],
  },
  {
    id: 'npcq_romance_jealousy_loyal',
    tags: ['social', 'love', 'relationship', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH', 'PARTNER']);
      return `${n(npc)}'nin son zamanlarda biraz mesafeli olduğunu fark ettin. Bir gün sonunda soruyorsun: "Bir sorun mu var?"`;
    },
    minAge: 13, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '💬 Sabırla dinle',
        effect: { charisma: 4 },
        npcRelationChange: 12,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        feedback: '"Bazen korkuyorum kaybetmekten" dedi. Dürüst bir konuşma oldu.',
      },
      {
        text: '🎁 Sürpriz bir şey yap — hediye veya mektup',
        effect: { charisma: 4 },
        npcRelationChange: 15,
        feedback: 'Gözleri parladı. Bazen küçük jestler en büyük şeyleri söyler.',
      },
    ],
  },
  {
    id: 'npcq_romance_family_reaction',
    tags: ['social', 'love', 'relationship', 'family', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH', 'PARTNER']);
      return `Ailen ${n(npc)}'i duydu. ${ctx.gameState?.family?.dynamic === 'STRICT' ? 'Baban sert bir sesle sordu: "Kim bu? Derslerin ne olacak?"' : 'Annen merakla sordu: "Anlat bakalım, nasıl biri?"'}`;
    },
    minAge: 13, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '😊 Açıkça anlat — gizlemenin anlamı yok',
        effect: { charisma: 2 },
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'openness', change: 2 }],
        feedback: 'Ailen şaşırdı ama dürüst oldun. Bu önemli.',
      },
      {
        text: '🤫 "Sadece arkadaş" de — henüz hazır değil',
        effect: {},
        personalityEffects: [{ axis: 'conformity', change: 2 }],
        feedback: 'Gerçeği sakladın. Şimdilik rahat ama sonra zor olabilir.',
      },
      {
        text: '😤 "Bu benim özel hayatım!"',
        effect: { charisma: -2 },
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'conformity', change: -3 }],
        feedback: 'Sınırlarını koydun. Ailen şaşırdı ama mesajı aldı.',
      },
    ],
  },
  {
    id: 'npcq_romance_commitment',
    tags: ['social', 'love', 'relationship', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['PARTNER', 'CRUSH']);
      return `${n(npc)} ile özel bir akşam. "Biz... resmî miyiz?" diye soruyor yumuşak bir sesle.`;
    },
    minAge: 14, maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '❤️ "Evet. Seninleyim."',
        effect: { charisma: 13 },
        npcRelationChange: 25,
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'empathy', change: 2 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'İlk ciddi ilişki' },
        grantTraits: ['FIRST_LOVE'],
        feedback: 'Kalbiniz aynı ritimde atıyor. Bu özel.',
      },
    ],
  },
  {
    id: 'npcq_romance_mature_breakup',
    tags: ['social', 'love', 'relationship', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH', 'PARTNER']);
      return `${n(npc)} ile bir şeyler değişti. İkiniz de biliyorsunuz ama kimse söyleyemiyor. Sonunda bir akşam konuşuyorsunuz.`;
    },
    minAge: 14, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '🤝 "Güzel bir dönemdi. Teşekkür ederim."',
        effect: { charisma: -3 },
        npcRelationChange: -20,
        personalityEffects: [{ axis: 'empathy', change: 3 }, { axis: 'openness', change: 2 }],
        memory: { emotion: 'NEUTRAL', weight: 'HIGH', customNote: 'Olgun bir ayrılık' },
        feedback: 'Acıttı ama doğru olanı yaptınız. Bazı şeyler bitmeli ki başkası başlayabilsin.',
      },
      {
        text: '😢 "Gitme... lütfen"',
        effect: { charisma: -8 },
        npcRelationChange: -10,
        personalityEffects: [{ axis: 'openness', change: -2 }],
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Tutamadığı aşk' },
        feedback: 'Kalbin kırık. Ama zaman en iyi ilaç derler...',
      },
    ],
  },
];

// =================================================================
// ARC 3: REKABET (6 event)
// =================================================================

const rivalryEvents: GameEvent[] = [
  {
    id: 'npcq_rival_first_challenge',
    tags: ['social', 'npc', 'group'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `${n(npc)} sınıfın ortasında sana meydan okudu: "Bahse girerim bu sınavı benden iyi yapamazsın." Herkes size bakıyor.`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    reqNPCRole: 'RIVAL',
    choices: [
      {
        text: '🔥 "Kabul! Görürüz."',
        effect: { intelligence: 1, charisma: 2 },
        npcRelationChange: -5,
        personalityEffects: [{ axis: 'openness', change: 4 }],
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM', customNote: 'Meydan okuma kabul edildi' },
        feedback: 'Meydan okuma kabul edildi. Sınıfta heyecan dalga dalga yayılıyor.',
      },
      {
        text: '😏 "Benim kanıtlamam gereken bir şey yok"',
        effect: { charisma: 3 },
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'openness', change: 2 }, { axis: 'conformity', change: -2 }],
        feedback: 'Soğukkanlı cevap. Rakibin şaşırdı ama saygısı arttı.',
      },
    ],
  },
  {
    id: 'npcq_rival_group_sides',
    tags: ['social', 'npc', 'group'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `Arkadaşların ikiye bölündü. Bazıları senin tarafında, bazıları ${n(npc)} tarafında. Okul koridorunda gerilim hissediliyor.`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '🤝 "Bu saçmalık, taraf falan yok"',
        effect: { charisma: 4 },
        npcRelationChange: 8,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        feedback: 'Olgunlugun herkesi sasirtti. Gerilim biraz azaldi.',
      },
      {
        text: '💪 Kendi grubunu güçlendirmek için uğraş',
        effect: { charisma: 2 },
        npcRelationChange: -10,
        personalityEffects: [{ axis: 'openness', change: 2 }],
        feedback: 'Saflar netlesti. Bu savaş büyüyor.',
      },
    ],
  },
  {
    id: 'npcq_rival_showdown',
    tags: ['social', 'npc', 'group'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `Gün geldi. ${n(npc)} ile son karşılaşma: spor turnuvası, sınav sonucu veya sahne performansı — kim daha iyi?`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'CONFLICT',
    reqNPCRole: 'RIVAL',
    choices: [
      {
        text: '🏆 Her şeyini ver — kazanmak için',
        effect: { charisma: 3, health: -3 },
        npcRelationChange: -5,
        personalityEffects: [{ axis: 'openness', change: 4 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Büyük kapışma' },
        feedback: 'Elinden gelenin en iyisini yaptın. Sonuç ne olursa olsun, kendini aştın.',
      },
      {
        text: '🤝 Fair play — iyi bir yarışma olsun',
        effect: { charisma: 5 },
        npcRelationChange: 10,
        personalityEffects: [{ axis: 'empathy', change: 2 }],
        feedback: 'Sportmen tavrın herkesin takdirini kazandı. Rakibin bile saygı duydu.',
      },
    ],
  },
  {
    id: 'npcq_rival_aftermath',
    tags: ['social', 'npc', 'group'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `Yarışma bitti. ${n(npc)} ile koridorda karşılaştınız. İkiniznin de yüzünde yorgunluk var. Bir an sessizlik.`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '🤝 Elini uzat: "İyi yarışmaydı ki"',
        effect: { charisma: 6 },
        npcRelationChange: 15,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        feedback: 'Elini sıktı. Belki dost olamazsınız ama artık saygınız var.',
      },
      {
        text: '😤 Yandan geçer gibi yap — hiçbir şey söyleme',
        effect: { charisma: -1 },
        npcRelationChange: -5,
        feedback: 'Sessizlik devam ediyor. Rekabet henüz bitmedi.',
      },
    ],
  },
  {
    id: 'npcq_rival_peace_offer',
    tags: ['social', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `${n(npc)} sana yaklaştı. "Belki... sürekli kavga etmek yerine birlikte çalışabiliriz?" Samimi görünüyor.`;
    },
    minAge: 10, maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'MORAL',
    choices: [
      {
        text: '🕊️ "Kabul. Deneyelim."',
        effect: { charisma: 8 },
        npcRelationChange: 25,
        personalityEffects: [{ axis: 'empathy', change: 4 }, { axis: 'openness', change: 2 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Rakiple baris' },
        feedback: 'Barış sağlamak kazanmaktan zor ama daha değerli.',
      },
      {
        text: '🤔 "Güvenmem zor ama fırsatı veririm"',
        effect: { charisma: 2 },
        npcRelationChange: 10,
        feedback: 'Temkinli ama açık kapısın. Zaman gösterecek.',
      },
    ],
  },
  {
    id: 'npcq_rival_escalation',
    tags: ['social', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `${n(npc)} arkadaşlarından birine seni kötülemiş. Herkes duydu. Bu artık yarışma değil — kişisel.`;
    },
    minAge: 10, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '😡 Karşılık ver — daha sert şekilde',
        effect: { charisma: -5 },
        npcRelationChange: -20,
        personalityEffects: [{ axis: 'openness', change: 2 }, { axis: 'empathy', change: -3 }],
        feedback: 'Kavga büyüdü. Şimdi ikiniznin de itibarı zedelendi.',
      },
      {
        text: '🧘 Sessiz kal — zamanla herkes gerçeği görür',
        effect: { charisma: 0 },
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'conformity', change: -1 }],
        feedback: 'Sessizliğin güçlü bir cevap oldu. İnsanlar senin tarafına geçmeye başladı.',
      },
    ],
  },
  {
    id: 'npcq_rival_respect',
    tags: ['social', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `Yıllar sonra ${n(npc)} ile karşılaştınız. "Seni hep saygıyla hatırlayacağım" diyor. Gerçekten öyle görünüyor.`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '🤝 "Ben de. Beni daha guclu yaptin."',
        effect: { charisma: 8 },
        npcRelationChange: 15,
        personalityEffects: [{ axis: 'empathy', change: 2 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Saygılı rakiplik' },
        grantTraits: ['WORTHY_RIVAL'],
        feedback: 'Bazen en iyi dersler rakiplerden gelir.',
      },
    ],
  },
  {
    id: 'npcq_rival_enemy',
    tags: ['social', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL', 'ENEMY']);
      return `${n(npc)} ile aranız tamamen bozuldu. Aynı ortamda bile nefes almak zor. Bu nefret seni içten içe yiyor.`;
    },
    minAge: 10, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '🧘 Bırak — nefret seni tüketiyor',
        effect: { charisma: 3, health: 2 },
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'empathy', change: 2 }],
        feedback: 'İçindeki öfkeyi bıraktın. Rahatladınız.',
      },
      {
        text: '💀 "Bu bitmedi..."',
        effect: { charisma: -5 },
        npcRelationChange: -15,
        personalityEffects: [{ axis: 'openness', change: 1 }, { axis: 'empathy', change: -3 }],
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Bitmeyen düşmancalık' },
        feedback: 'Nefret seni ele geciriyor. Bu yol karanlik.',
      },
    ],
  },
];

// =================================================================
// ARC 4: İHANET (6 event)
// =================================================================

const betrayalEvents: GameEvent[] = [
  {
    id: 'npcq_betray_first_doubt',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)}'in söyledikleriyle yaptıkları tutmuyor. Bir gün plana gel dedi, gelmedi. Sonra başka biriyle görüldüğü söyleniyor.`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'FRIEND',
    choices: [
      {
        text: '🤔 "Herkesin kotu gunu olabilir, gormezden gel"',
        effect: {},
        personalityEffects: [{ axis: 'empathy', change: 2 }],
        feedback: 'Hoş gör. Ama içinde küçük bir şüphe kaldı.',
      },
      {
        text: '🕵️ Dikkatli ol ve izle',
        effect: { intelligence: 1 },
        personalityEffects: [{ axis: 'openness', change: 1 }],
        feedback: 'Gözlerini açtın. Bir sonraki sefer daha dikkatli olacaksın.',
      },
    ],
  },
  {
    id: 'npcq_betray_gossip_heard',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `Biri sana yaklaştı: "${n(npc)} herkese senin sırrını anlattı. Hem de gülüyordu." Miden'e bir şey oturdu.`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '😡 "Ne?! Simdi gidip hesap soracagim!"',
        effect: { charisma: -4 },
        npcRelationChange: -10,
        personalityEffects: [{ axis: 'openness', change: 3 }],
        feedback: 'Sinirlisin ve haklısın. Ama önce sakince düşünmek belki daha iyi olurdu.',
      },
      {
        text: '🤔 "Emin misin? Önce doğrulayayım"',
        effect: { intelligence: 2 },
        personalityEffects: [{ axis: 'openness', change: 1 }, { axis: 'empathy', change: 1 }],
        feedback: 'Soğukkanlı kaldın. Kanıtları toplamak için zaman kazandın.',
      },
      {
        text: '😢 İçi çok acı ama görmezden gel',
        effect: { charisma: -6 },
        personalityEffects: [{ axis: 'openness', change: -2 }],
        feedback: 'Yaralar içine akıyor. Bu dayanılmaz ama sesini çıkaramıyorsun.',
      },
    ],
  },
  {
    id: 'npcq_betray_investigation',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)}'in mesajlarını, davranışlarını, ortak arkadaşların söylediklerini birleştiriyorsun. Resim netleşiyor. Ya gerçekten ihanet ettiyse?`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '📱 Ortak arkadaşlarından bilgi topla',
        effect: { intelligence: 2, charisma: 1 },
        personalityEffects: [{ axis: 'openness', change: 2 }],
        feedback: 'Parça parça gerçek ortaya çıkıyor. Şimdi ne yapacaksın?',
      },
      {
        text: '💔 Yeter, dogrudan konusacagim',
        effect: { charisma: 2 },
        personalityEffects: [{ axis: 'openness', change: 4 }],
        feedback: 'Cesur karar. Dogrudan gidiyorsun.',
      },
    ],
  },
  {
    id: 'npcq_betray_confrontation',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)} ile yüz yüzesin. "Sırrımı neden anlattın?" Sessizlik. Sonra gözlerini kaçırıyor.`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '😤 "Açıkla. Şimdi."',
        effect: { charisma: -1 },
        npcRelationChange: -10,
        personalityEffects: [{ axis: 'openness', change: 4 }],
        feedback: 'Sesi titriyordu. Belki pişmandır, belki korkmuştur. Ama gerçek ortada.',
      },
      {
        text: '😢 "Sana guveniyordum..."',
        effect: { charisma: -6 },
        npcRelationChange: -5,
        personalityEffects: [{ axis: 'empathy', change: 2 }],
        memory: { emotion: 'REGRET', weight: 'HIGH', customNote: 'Arkadasin ihaneti' },
        feedback: 'Kelimeler yumruktan daha sert vurdu. Gozleri doldu.',
      },
    ],
  },
  {
    id: 'npcq_betray_reaction_manipulative',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND', 'ACQUAINTANCE']);
      return `${n(npc)} inkâr ediyor: "Ben öyle bir şey söylemedim, sana yalan söylüyorlar. Belki de gerçek arkadaşların onlar değil!" Masumiyetini savunuyor.`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '🧠 "Kanitlarim var. Oyunu birak."',
        effect: { intelligence: 2, charisma: 2 },
        npcRelationChange: -20,
        personalityEffects: [{ axis: 'openness', change: 4 }],
        feedback: 'Maskesi düştü. Sonunda gerçek yüzü gördün.',
      },
      {
        text: '😰 Belki haklidir... kafam karisti',
        effect: { charisma: -4 },
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'conformity', change: 3 }, { axis: 'openness', change: -3 }],
        feedback: 'Manipülasyona yenildin. Kendi gerçeğinden şüphe ediyorsun.',
      },
    ],
  },
  {
    id: 'npcq_betray_reaction_regret',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND', 'ACQUAINTANCE']);
      return `${n(npc)}'in gözleri dolu: "Yanlış yaptım. Neden yaptığımı bile bilmiyorum. Lütfen..." Samimi görünüyor.`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'MORAL',
    choices: [
      {
        text: '🤝 "Zaman lazim. Ama dinliyorum."',
        effect: { charisma: 2 },
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        feedback: 'Af hemen gelmez. Ama kapı tamamen kapanmadı.',
      },
      {
        text: '😤 "Sözler yetmez. İspat et."',
        effect: {},
        npcRelationChange: -5,
        personalityEffects: [{ axis: 'openness', change: 2 }],
        feedback: 'Haklı bir talep. Ama affın bedeli ağır.',
      },
    ],
  },
  {
    id: 'npcq_betray_forgive',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'ACQUAINTANCE']);
      return `Haftalar geçti. ${n(npc)} sürekli uzaktan bakıyor, mesaj atıyor, küçük jestler yapıyor. Belki gerçekten değişmiştir.`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'MORAL',
    choices: [
      {
        text: '💚 "Herkes hata yapar. Ikinci sans."',
        effect: { charisma: 7 },
        npcRelationChange: 20,
        personalityEffects: [{ axis: 'empathy', change: 4 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Affetmeyi secti' },
        grantTraits: ['FORGIVING_HEART'],
        feedback: 'Affetmek güçlüler içindir. Yeni bir sayfa açıldı.',
      },
    ],
  },
  {
    id: 'npcq_betray_distance',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'ACQUAINTANCE']);
      return `${n(npc)} ile artık arkadaş değilsiniz. Ama düşman da değil. Koridorda kibar bir selam, o kadar.`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '🤝 "Selam. Nasilsin?"',
        effect: { charisma: 2 },
        npcRelationChange: 0,
        feedback: 'Mesafeli ama medenî. Olgunlaşmak bazen böyle olur.',
      },
    ],
  },
  {
    id: 'npcq_betray_cut_off',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'ACQUAINTANCE']);
      return `${n(npc)} ile bütün ipleri kopardın. Numarasını sildin, ortak grupları bıraktın. Temiz bir kesim.`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '🚪 "İhanet affedilmez. Bitti."',
        effect: { charisma: -1 },
        npcRelationChange: -30,
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'empathy', change: -2 }],
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Bir dostluk tamamen bitti' },
        feedback: 'Sınırlarını korudun. Acıttı ama daha güvenli hissediyorsun.',
      },
    ],
  },
];

// =================================================================
// EXPORT
// =================================================================

interface QuestlineChoiceChainPatch {
  eventId: string;
  choiceIndex: number;
  futureEvent: FutureEventConfig;
}

interface QuestlineEventGatePatch {
  eventId: string;
  reqEventIds?: string[];
  blockEventIds?: string[];
  tags?: string[];
}

const QUESTLINE_DELAYED_CHAIN_PATCHES: QuestlineChoiceChainPatch[] = [
  {
    eventId: 'npcq_friend_shared_crisis',
    choiceIndex: 0,
    futureEvent: { trigger: 'TURNS', turnsLater: 3, eventId: 'npcq_friend_loyalty_test', priority: 'HIGH' },
  },
  {
    eventId: 'npcq_friend_shared_crisis',
    choiceIndex: 1,
    futureEvent: { trigger: 'TURNS', turnsLater: 3, eventId: 'npcq_friend_drift_apart', priority: 'HIGH' },
  },
  {
    eventId: 'npcq_friend_shared_crisis',
    choiceIndex: 2,
    futureEvent: { trigger: 'TURNS', turnsLater: 3, eventId: 'npcq_friend_adventure', priority: 'HIGH' },
  },
  {
    eventId: 'npcq_romance_confession',
    choiceIndex: 0,
    futureEvent: { trigger: 'TURNS', turnsLater: 3, eventId: 'npcq_romance_first_date', priority: 'HIGH' },
  },
  {
    eventId: 'npcq_romance_confession',
    choiceIndex: 2,
    futureEvent: { trigger: 'TURNS', turnsLater: 3, eventId: 'npcq_romance_mature_breakup', priority: 'HIGH' },
  },
  {
    eventId: 'npcq_rival_first_challenge',
    choiceIndex: 0,
    futureEvent: { trigger: 'TURNS', turnsLater: 3, eventId: 'npcq_rival_showdown', priority: 'HIGH' },
  },
  {
    eventId: 'npcq_betray_first_doubt',
    choiceIndex: 1,
    futureEvent: { trigger: 'TURNS', turnsLater: 3, eventId: 'npcq_betray_gossip_heard', priority: 'HIGH' },
  },
];

const QUESTLINE_EVENT_GATE_PATCHES: QuestlineEventGatePatch[] = [
  {
    eventId: 'npcq_friend_adventure',
    reqEventIds: ['npcq_friend_shared_crisis'],
    tags: ['scheduled_only'],
  },
  {
    eventId: 'npcq_friend_loyalty_test',
    reqEventIds: ['npcq_friend_shared_crisis'],
    blockEventIds: ['npcq_friend_drift_apart'],
    tags: ['scheduled_only'],
  },
  {
    eventId: 'npcq_friend_drift_apart',
    reqEventIds: ['npcq_friend_shared_crisis'],
    blockEventIds: ['npcq_friend_loyalty_test'],
    tags: ['scheduled_only'],
  },
  {
    eventId: 'npcq_romance_first_date',
    reqEventIds: ['npcq_romance_confession'],
    blockEventIds: ['npcq_romance_mature_breakup'],
    tags: ['scheduled_only'],
  },
  {
    eventId: 'npcq_romance_mature_breakup',
    reqEventIds: ['npcq_romance_confession'],
    blockEventIds: ['npcq_romance_first_date'],
    tags: ['scheduled_only'],
  },
  {
    eventId: 'npcq_rival_showdown',
    reqEventIds: ['npcq_rival_first_challenge'],
    tags: ['scheduled_only'],
  },
  {
    eventId: 'npcq_betray_gossip_heard',
    reqEventIds: ['npcq_betray_first_doubt'],
    tags: ['scheduled_only'],
  },
];

const mergeUniqueStrings = (...groups: (string[] | undefined)[]): string[] | undefined => {
  const merged = groups.flatMap(group => group ?? []);
  if (merged.length === 0) return undefined;
  return Array.from(new Set(merged));
};

const upsertFutureEvent = (
  futureEvents: FutureEventConfig[] | undefined,
  patch: FutureEventConfig
): FutureEventConfig[] => {
  const next = [...(futureEvents ?? [])];
  const index = next.findIndex(event => event.eventId === patch.eventId && event.trigger === patch.trigger);
  if (index >= 0) {
    next[index] = { ...next[index], ...patch };
  } else {
    next.push(patch);
  }
  return next;
};

const patchChoiceFutureEvent = (
  choice: Choice | ((context: EventContext) => Choice),
  futureEvent: FutureEventConfig
): Choice | ((context: EventContext) => Choice) => {
  if (typeof choice === 'function') return choice;
  return {
    ...choice,
    futureEvents: upsertFutureEvent(choice.futureEvents, futureEvent),
  };
};

const applyQuestlineBranching = (events: GameEvent[]): GameEvent[] => {
  const choicePatches = new Map<string, QuestlineChoiceChainPatch[]>();
  QUESTLINE_DELAYED_CHAIN_PATCHES.forEach(patch => {
    const current = choicePatches.get(patch.eventId) ?? [];
    choicePatches.set(patch.eventId, [...current, patch]);
  });

  const gatePatches = new Map<string, QuestlineEventGatePatch>();
  QUESTLINE_EVENT_GATE_PATCHES.forEach(patch => {
    gatePatches.set(patch.eventId, patch);
  });

  return events.map(event => {
    const gatePatch = gatePatches.get(event.id);
    let nextEvent: GameEvent = event;

    if (gatePatch) {
      const reqEventIds = mergeUniqueStrings(event.reqEventIds, gatePatch.reqEventIds);
      const blockEventIds = mergeUniqueStrings(event.blockEventIds, gatePatch.blockEventIds);
      const tags = mergeUniqueStrings(event.tags, gatePatch.tags);
      nextEvent = {
        ...event,
        ...(reqEventIds ? { reqEventIds } : {}),
        ...(blockEventIds ? { blockEventIds } : {}),
        ...(tags ? { tags } : {}),
      };
    }

    const eventChoicePatches = choicePatches.get(event.id);
    if (!eventChoicePatches || eventChoicePatches.length === 0) return nextEvent;

    const choices = nextEvent.choices.map((choice, choiceIndex) => {
      const matchingPatches = eventChoicePatches.filter(patch => patch.choiceIndex === choiceIndex);
      if (matchingPatches.length === 0) return choice;
      return matchingPatches.reduce(
        (patchedChoice, patch) => patchChoiceFutureEvent(patchedChoice, patch.futureEvent),
        choice
      );
    });

    return {
      ...nextEvent,
      choices,
    };
  });
};

const NPC_QUESTLINE_BASE_EVENTS: GameEvent[] = [
  ...friendshipEvents,
  ...romanceEvents,
  ...rivalryEvents,
  ...betrayalEvents,
];

export const NPC_QUESTLINE_EVENTS: GameEvent[] = applyQuestlineBranching(NPC_QUESTLINE_BASE_EVENTS);
