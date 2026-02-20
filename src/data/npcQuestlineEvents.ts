import { GameEvent, EventContext, NPC, NPCRole } from '../types';

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

const n = (npc: NPC | null): string => npc?.name || 'Arkadasin';

// =================================================================
// ARC 1: DERİN DOSTLUK (6 event)
// =================================================================

const friendshipEvents: GameEvent[] = [
  {
    id: 'npcq_friend_secret_share',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)} seni kenara cekiyor. Gozleri ciddi. "Sana bir sey soyleyecegim ama kimseye anlatmayacagina soz ver..." Ailesiyle ilgili zor bir durumu anlatmaya basliyor.`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'FRIEND',
    choices: [
      {
        text: '🤫 "Soz veriyorum, guvenebilirsin bana"',
        effect: { charisma: 5 },
        npcRelationChange: 15,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Arkadasinin sirri' },
        feedback: 'Arkadasin rahatlamis gorunuyor. Aranizda derin bir guven baglandi.',
      },
      {
        text: '😬 "Bu cok agir... baska birine de soylemeli misin?"',
        effect: { charisma: 0 },
        npcRelationChange: -5,
        personalityEffects: [{ axis: 'conformity', change: 2 }],
        feedback: 'Arkadasin biraz hayal kirikligina ugramis gibi. Ama samimiyetini takdir ediyor.',
      },
      {
        text: '🙄 "Herkesin derdi var, cok buyutme"',
        effect: { charisma: -2 },
        npcRelationChange: -15,
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        feedback: 'Arkadasinin yuzu dusturdu. Belki de bu kadar guvendigi icin pismandir.',
      },
    ],
  },
  {
    id: 'npcq_friend_family_visit',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)} seni evine davet etti. Ailesiyle tanisacaksin. Kapidan girer girmez sicak yemek kokusu ve kahkaha sesleri duyuyorsun.`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'FRIEND',
    choices: [
      {
        text: '😊 Ailesiyle sicak bir sohbet kur',
        effect: { charisma: 9 },
        npcRelationChange: 12,
        personalityEffects: [{ axis: 'openness', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Arkadasinin evinde aksamyemegi' },
        feedback: 'Harika bir aksam gecirdin. Arkadasinin ailesi seni cok sevdi.',
      },
      {
        text: '📱 Utaniyorum, telefonuma bakayim',
        effect: { charisma: 0 },
        npcRelationChange: 0,
        personalityEffects: [{ axis: 'openness', change: -2 }],
        feedback: 'Sessiz bir aksam oldu. Firsat kacti ama kotu de gecmedi.',
      },
    ],
  },
  {
    id: 'npcq_friend_casual_hangout',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND']);
      return `${n(npc)} ile okuldan sonra parka gittiniz. "Bugun sadece takilalim, hic bir sey dusunmeden" diyor.`;
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
        feedback: 'Gulerek vakit gecirdiniz. Bazen en guzel anlar plansiz olanlar.',
      },
      {
        text: '📚 "Aslinda ders calismaliyim..."',
        effect: { intelligence: 2, charisma: -1 },
        npcRelationChange: -3,
        feedback: 'Arkadasin biraz uzuldu ama anladigindan emin.',
      },
    ],
  },
  {
    id: 'npcq_friend_shared_crisis',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `Okulda buyuk bir kavga cikti. Birisi ${n(npc)}'a iftira atiyor — ogretmenler de inaniyor. ${n(npc)} yardim istiyor gibi sana bakiyor.`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    reqNPCRole: 'FRIEND',
    choices: [
      {
        text: '🛡️ "Ben sahit oldum, yanlis anliyorsunuz!"',
        effect: { charisma: 1 },
        npcRelationChange: 20,
        personalityEffects: [{ axis: 'openness', change: 4 }, { axis: 'empathy', change: 2 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Arkadasini savundu' },
        feedback: 'Arkadasin icin risk aldin. Bu bagliligi asla unutmayacak.',
      },
      {
        text: '😰 Karisma, uzak dur',
        effect: { charisma: -3 },
        npcRelationChange: -10,
        personalityEffects: [{ axis: 'openness', change: -2 }],
        feedback: 'Kenara cekildin. Arkadasin yalniz kaldi ve bunu hissetti.',
      },
      {
        text: '🕵️ Gizlice gercegi arastir',
        effect: { intelligence: 2, charisma: 1 },
        npcRelationChange: 10,
        personalityEffects: [{ axis: 'openness', change: 1 }],
        futureEvents: [{ trigger: 'TURNS', eventId: 'npcq_friend_adventure', turnsLater: 2 }],
        feedback: 'Kanitlari topluyorsun. Bu cesaretini arkadasin fark etti.',
      },
    ],
  },
  {
    id: 'npcq_friend_adventure',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)} ile birlikte "yasak bolge"ye — mahallenin terk edilmis deposuna — girmeye karar verdiniz. Soylentilere gore icerde eski bir hazine var.`;
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
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Depo macerasi' },
        feedback: 'Icerde hazine yoktu ama birlikte yasadiginiz heyecan paha bicilmezdi.',
      },
      {
        text: '🤔 "Fikir degistirdim, tehlikeli olabilir"',
        effect: { charisma: -1 },
        npcRelationChange: -5,
        personalityEffects: [{ axis: 'conformity', change: 2 }],
        feedback: 'Arkadasin biraz hayal kirikligina ugradi. Ama guvenliginizi korudunuz.',
      },
    ],
  },
  {
    id: 'npcq_friend_loyalty_test',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `Okuldaki populer grubun lideri sana yaklasti: "Bizimle takilmak istersen ${n(npc)}'i birak. O seni asagi cekiyor." Populer grup seni kabul edecek ama...`;
    },
    minAge: 10, maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'MORAL',
    reqNPCRole: 'FRIEND',
    choices: [
      {
        text: '💎 "${n} benim arkadasim, tesekkurler ama hayir"',
        effect: { charisma: 5 },
        npcRelationChange: 25,
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'conformity', change: -3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Arkadasini secti' },
        feedback: 'Populer grubun teklifini reddettin. Arkadasin bunun ne kadar zor oldugunu biliyor.',
      },
      {
        text: '🤷 "Dusuneyim..." — iki tarafla da iyi gecin',
        effect: { charisma: 1 },
        npcRelationChange: -8,
        personalityEffects: [{ axis: 'conformity', change: 3 }],
        feedback: 'Iki ayak uzerinde duruyorsun ama hicbir tarafa tam baglanmadin.',
      },
      {
        text: '⭐ Populer gruba katil',
        effect: { charisma: 6 },
        npcRelationChange: -30,
        personalityEffects: [{ axis: 'conformity', change: 5 }, { axis: 'empathy', change: -3 }],
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Arkadasini birakti' },
        feedback: 'Populer gruba katildin ama arkadasinin bakislari... bir sey kirildi.',
      },
    ],
  },
  {
    id: 'npcq_friend_final_bond',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)} ile yillarin biriktigi bir aksam. Damlarin ustunde oturmus sehri izliyorsunuz. "Sen benim en yakin arkadasimsin" diyor sessizce.`;
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
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'En yakin arkadas sozlesti' },
        grantTraits: ['LOYAL_FRIEND'],
        feedback: 'Bu gece asla unutulmayacak. Gercek bir dostluk muyhurlendi.',
      },
    ],
  },
  {
    id: 'npcq_friend_drift_apart',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'ACQUAINTANCE']);
      return `${n(npc)} ile artik eskisi gibi konusamiyorsunuz. Mesajlarina gec cevap veriyor, planlari surekli iptal ediyor. Bir seyler degisti.`;
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
        feedback: 'Acik konustunuz. Belki her sey eskisi gibi olmayacak ama saygi kaldi.',
      },
      {
        text: '🚶 Kabullen ve yoluna devam et',
        effect: { charisma: -3 },
        npcRelationChange: -10,
        personalityEffects: [{ axis: 'openness', change: 1 }],
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM', customNote: 'Bir dostluk sona erdi' },
        feedback: 'Bazi insanlar hayatinin bir doneminde kalir. Ve bu da tamam.',
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
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH']);
      return `${n(npc)} ile gorusleriniz kesisti — bir an icin hic kimse yokmus gibi hissettin. Kalbin hizlandi. Bu his... yeni bir sey.`;
    },
    minAge: 13, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'CRUSH',
    choices: [
      {
        text: '😊 Gulu ve bak — belki o da hissediyordur',
        effect: { charisma: 5 },
        npcRelationChange: 8,
        personalityEffects: [{ axis: 'openness', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Ilk kivilcim' },
        feedback: 'Gulumsedin. O da gulumsedi. Kalbindeki carpinti sessizce buyuyor.',
      },
      {
        text: '😳 Kafani cevir — bu konuda hazirligi deilsin',
        effect: { charisma: -1 },
        personalityEffects: [{ axis: 'openness', change: -2 }],
        feedback: 'Gozlerini kacirdin. Ama o his bir yere gitmiyor...',
      },
    ],
  },
  {
    id: 'npcq_romance_confession',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH']);
      return `Okuldan sonra ${n(npc)} ile bas basasiniz. Icinden bir ses "soyle" diyor. Diger ses "dur, ya reddederse?"`;
    },
    minAge: 13, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'CRUSH',
    choices: [
      {
        text: '💕 "Senden hoslaniyorum..."',
        effect: { charisma: 7 },
        npcRelationChange: 15,
        personalityEffects: [{ axis: 'openness', change: 5 }, { axis: 'openness', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Itiraf ani' },
        feedback: 'Soyledin. Kalbin patlayacak gibi. Ama bir yukten kurtulmus gibi de hissediyorsun.',
      },
      {
        text: '📝 Mektup yaz — yuzyuze soyleyemezsin',
        effect: { intelligence: 1, charisma: 2 },
        npcRelationChange: 10,
        personalityEffects: [{ axis: 'openness', change: 2 }],
        feedback: 'Kelimelerin kagittan daha guclu akmis. Simdi bekleme zamani.',
      },
      {
        text: '🙊 Yutkundun ama soyleyemedin',
        effect: { charisma: -4 },
        personalityEffects: [{ axis: 'openness', change: -2 }],
        feedback: 'An gecti. Belki baska bir gun... ama bugun degil.',
      },
    ],
  },
  {
    id: 'npcq_romance_first_date',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH', 'PARTNER']);
      return `${n(npc)} ile ilk kez bas basa disari cikiyorsunuz. "Nereye gidelim?" diye soruyor.`;
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
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Ilk bulusma — kafe' },
        feedback: 'Saatlerin nasil gectigini anlamadin. Konusmak hic bu kadar kolay olmamisti.',
      },
      {
        text: '🎬 Sinemaya git — klasik secim',
        effect: { charisma: 4 },
        npcRelationChange: 8,
        feedback: 'Film guzeldi ama en guzel kismi yan yana oturmakti.',
      },
      {
        text: '🌳 Parka yuru — dogada vakit gecir',
        effect: { health: 2, charisma: 5 },
        npcRelationChange: 10,
        personalityEffects: [{ axis: 'openness', change: 2 }],
        feedback: 'Gun batiminda yuruyus. Sessizlik bile rahatti.',
      },
    ],
  },
  {
    id: 'npcq_romance_jealousy_jealous',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH', 'PARTNER']);
      return `${n(npc)} baskasiyala komustugun icin sinirli. "O kim? Neden surekli konusuyorsunuz?" Sesi sert, gozleri kirgin.`;
    },
    minAge: 13, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '🤗 "Sadece arkadasim. Sana guveniyorum, sen de bana guven"',
        effect: { charisma: 2 },
        npcRelationChange: 10,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        feedback: 'Sakince acikladin. Bir sure sonra yumusamaya basladi.',
      },
      {
        text: '😠 "Bu kadar kiskanc olma, boguyorsun beni!"',
        effect: { charisma: -4 },
        npcRelationChange: -15,
        personalityEffects: [{ axis: 'openness', change: 2 }],
        feedback: 'Sert konustun. Belki haklisin ama zamanlama kotu.',
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
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH', 'PARTNER']);
      return `${n(npc)} fark ettin ki son zamanlarda biraz mesafeli. Bir gun sonunda soruyorsun: "Bir sorun mu var?"`;
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
        feedback: '"Bazen korkuyorum kaybetmekten" dedi. Durust bir konusma oldu.',
      },
      {
        text: '🎁 Surpriz bir sey yap — hediye veya mektup',
        effect: { charisma: 4 },
        npcRelationChange: 15,
        feedback: 'Gozleri parladi. Bazen kucuk jestler en buyuk seyleri soyler.',
      },
    ],
  },
  {
    id: 'npcq_romance_family_reaction',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH', 'PARTNER']);
      return `Ailen ${n(npc)}'i duydu. ${ctx.gameState?.family?.dynamic === 'STRICT' ? 'Baban sert bir sesle sordu: "Kim bu? Derslerin ne olacak?"' : 'Annen merakla sordu: "Anlat bakalim, nasil biri?"'}`;
    },
    minAge: 13, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '😊 Acikca anlat — gizlemenin anlami yok',
        effect: { charisma: 2 },
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'openness', change: 2 }],
        feedback: 'Ailen sasirdi ama durst oldun. Bu onemli.',
      },
      {
        text: '🤫 "Sadece arkadas" de — henuz hazir degil',
        effect: {},
        personalityEffects: [{ axis: 'conformity', change: 2 }],
        feedback: 'Gercegi sakladin. Simdilik rahat ama sonra zor olabilir.',
      },
      {
        text: '😤 "Bu benim ozel hayatim!"',
        effect: { charisma: -2 },
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'conformity', change: -3 }],
        feedback: 'Sinirlarini koydun. Ailen sasirdi ama mesaji aldi.',
      },
    ],
  },
  {
    id: 'npcq_romance_commitment',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['PARTNER', 'CRUSH']);
      return `${n(npc)} ile ozel bir aksam. "Biz... resmi miyiz?" diye soruyor yumusak bir sesle.`;
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
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Ilk ciddi iliski' },
        grantTraits: ['FIRST_LOVE'],
        feedback: 'Kalbiniz ayni ritimde atiyor. Bu ozel.',
      },
    ],
  },
  {
    id: 'npcq_romance_mature_breakup',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['CRUSH', 'PARTNER']);
      return `${n(npc)} ile bir seyler degisti. Ikiniz de biliyorsunuz ama kimse soyleyemiyor. Sonunda bir aksam konusuyorsunuz.`;
    },
    minAge: 14, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '🤝 "Guzel bir donenemdi. Tesekkur ederim."',
        effect: { charisma: -3 },
        npcRelationChange: -20,
        personalityEffects: [{ axis: 'empathy', change: 3 }, { axis: 'openness', change: 2 }],
        memory: { emotion: 'NEUTRAL', weight: 'HIGH', customNote: 'Olgun bir ayrilik' },
        feedback: 'Aciti ama dogru olani yaptiniz. Bazi seyler bitmeli ki baskasi baslayabilsin.',
      },
      {
        text: '😢 "Gitme... lutfen"',
        effect: { charisma: -8 },
        npcRelationChange: -10,
        personalityEffects: [{ axis: 'openness', change: -2 }],
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Tutamadigi ask' },
        feedback: 'Kalbin kirik. Ama zaman en iyi ilac derler...',
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
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `${n(npc)} sinifin ortasinda sana meydan okudu: "Bahse girerim bu sinavi benden iyi yapamazsin." Herkes size bakiyor.`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    reqNPCRole: 'RIVAL',
    choices: [
      {
        text: '🔥 "Kabul! Goruruz."',
        effect: { intelligence: 1, charisma: 2 },
        npcRelationChange: -5,
        personalityEffects: [{ axis: 'openness', change: 4 }],
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM', customNote: 'Meydan okuma kabul edildi' },
        feedback: 'Meydan okuma kabul edildi. Sinifta heyecan dalga dalga yayiliyor.',
      },
      {
        text: '😏 "Benim kanitlamam gereken bir sey yok"',
        effect: { charisma: 3 },
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'openness', change: 2 }, { axis: 'conformity', change: -2 }],
        feedback: 'Sogukkanli cevap. Rakibin sasirdi ama saygisi artti.',
      },
    ],
  },
  {
    id: 'npcq_rival_group_sides',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `Arkadaslarin ikiye bolundu. Bazilari senin tarafinda, bazilari ${n(npc)} tarafinda. Okul koridorunda gerilim hissediliyor.`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '🤝 "Bu sacmalik, taraf falan yok"',
        effect: { charisma: 4 },
        npcRelationChange: 8,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        feedback: 'Olgunlugun herkesi sasirtti. Gerilim biraz azaldi.',
      },
      {
        text: '💪 Kendi grubunu guclendirmek icin ugras',
        effect: { charisma: 2 },
        npcRelationChange: -10,
        personalityEffects: [{ axis: 'openness', change: 2 }],
        feedback: 'Saflar netlesti. Bu savas buyuyor.',
      },
    ],
  },
  {
    id: 'npcq_rival_showdown',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `Gun geldi. ${n(npc)} ile son karsilasma: spor turnuvasi, sinav sonucu veya sahne performansi — kim daha iyi?`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'CONFLICT',
    reqNPCRole: 'RIVAL',
    choices: [
      {
        text: '🏆 Her seyini ver — kazanmak icin',
        effect: { charisma: 3, health: -3 },
        npcRelationChange: -5,
        personalityEffects: [{ axis: 'openness', change: 4 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Buyuk kapima' },
        feedback: 'Elinden gelenin en iyisini yaptin. Sonuc ne olursa olsun, kendini ashtin.',
      },
      {
        text: '🤝 Fair play — iyi bir yarisma olsun',
        effect: { charisma: 5 },
        npcRelationChange: 10,
        personalityEffects: [{ axis: 'empathy', change: 2 }],
        feedback: 'Sportmen tavrin herkesin takdirini kazandi. Rakibin bile saygi duydu.',
      },
    ],
  },
  {
    id: 'npcq_rival_aftermath',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `Yarisma bitti. ${n(npc)} ile koridorda karsilastiniz. Ikiniznin de yuzunde yorgunluk var. Bir an sessizlik.`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '🤝 Elini uzat: "Iyi yarismaydaki"',
        effect: { charisma: 6 },
        npcRelationChange: 15,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        feedback: 'Elini sikti. Belki dost olamazsiniz ama artik sayginiz var.',
      },
      {
        text: '😤 Yandangecer gibi yap — hicbir sey soyleme',
        effect: { charisma: -1 },
        npcRelationChange: -5,
        feedback: 'Sessizlik devam ediyor. Rekabet henuz bitmedi.',
      },
    ],
  },
  {
    id: 'npcq_rival_peace_offer',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `${n(npc)} sana yaklasti. "Belki... surekli kavga etmek yerine birlikte calisabiliriz?" Samimi gorunuyor.`;
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
        feedback: 'Baris saglamak kazanmaktan zor ama daha degerli.',
      },
      {
        text: '🤔 "Guvenmem zor ama firsati veririm"',
        effect: { charisma: 2 },
        npcRelationChange: 10,
        feedback: 'Temkinli ama acik kapisin. Zaman gosterecek.',
      },
    ],
  },
  {
    id: 'npcq_rival_escalation',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `${n(npc)} arkadaslarindan birine seni kotulemis. Herkes duydu. Bu artik yarisma degil — kisisel.`;
    },
    minAge: 10, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '😡 Karsilik ver — daha sert sekilde',
        effect: { charisma: -5 },
        npcRelationChange: -20,
        personalityEffects: [{ axis: 'openness', change: 2 }, { axis: 'empathy', change: -3 }],
        feedback: 'Kavga buyudu. Simdi ikiniznin de itibarı zedelendi.',
      },
      {
        text: '🧘 Sessiz kal — zamanla herkes gercegi gorur',
        effect: { charisma: 0 },
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'conformity', change: -1 }],
        feedback: 'Sessizligin guclu bir cevap oldu. Insanlar senin tarafina gecmeye basladi.',
      },
    ],
  },
  {
    id: 'npcq_rival_respect',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL']);
      return `Yillar sonra ${n(npc)} ile karsilastiniz. "Seni hep saygiyla hatirlayacagim" diyor. Gercekten oyle gorunuyor.`;
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
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Saygili rakiplik' },
        grantTraits: ['WORTHY_RIVAL'],
        feedback: 'Bazen en iyi dersler rakiplerden gelir.',
      },
    ],
  },
  {
    id: 'npcq_rival_enemy',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['RIVAL', 'ENEMY']);
      return `${n(npc)} ile araniz tamamen bozuldu. Ayni ortamda bile nefes almak zor. Bu nefret seni icten icte yiyor.`;
    },
    minAge: 10, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '🧘 Burakit — nefret seni tuketiyor',
        effect: { charisma: 3, health: 2 },
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'empathy', change: 2 }],
        feedback: 'Icindeki ofkeyi biraktin. Rahatladiniz.',
      },
      {
        text: '💀 "Bu bitmedi..."',
        effect: { charisma: -5 },
        npcRelationChange: -15,
        personalityEffects: [{ axis: 'openness', change: 1 }, { axis: 'empathy', change: -3 }],
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Bitmeyen dusmancalik' },
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
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)}'in soyledikleriyle yaptiklari tutmuyor. Bir gun plana gel dedi, gelmedi. Sonra baska biriyile goruldugu soyleniyor.`;
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
        feedback: 'Hos gorus. Ama icinde kucuk bir suphe kaldi.',
      },
      {
        text: '🕵️ Dikkatli ol ve izle',
        effect: { intelligence: 1 },
        personalityEffects: [{ axis: 'openness', change: 1 }],
        feedback: 'Gozlerini actin. Bir sonraki sefer daha dikkatli olacaksin.',
      },
    ],
  },
  {
    id: 'npcq_betray_gossip_heard',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `Biri sana yaklasti: "${n(npc)} herkese senin sirrini anlatti. Hem de guluyordu." Midena bir sey oturdu.`;
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
        feedback: 'Sinirlisin ve haklisin. Ama once sakince dusunmek belki daha iyi olurdu.',
      },
      {
        text: '🤔 "Emin misin? Once dogrulayayim"',
        effect: { intelligence: 2 },
        personalityEffects: [{ axis: 'openness', change: 1 }, { axis: 'empathy', change: 1 }],
        feedback: 'Sogukkanli kaldin. Kanitlari toplamak icin zaman kazandin.',
      },
      {
        text: '😢 Ici cok aci ama gormezden gel',
        effect: { charisma: -6 },
        personalityEffects: [{ axis: 'openness', change: -2 }],
        feedback: 'Yaralar icine akiyor. Bu dayanilmaz ama sesini cikaramiyorsun.',
      },
    ],
  },
  {
    id: 'npcq_betray_investigation',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)}'in mesajlarini, davranislarini, ortak arkadaslarin soylediklerini birlestiriyorsun. Resim netlesiyor. Ya gercekten ihanet ettiyse?`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '📱 Ortak arkadaslarindan bilgi topla',
        effect: { intelligence: 2, charisma: 1 },
        personalityEffects: [{ axis: 'openness', change: 2 }],
        feedback: 'Parca parca gercek ortaya cikiyor. Simdi ne yapacaksin?',
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
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND']);
      return `${n(npc)} ile yuz yuzesin. "Sirrimi neden anlattín?" Sessizlik. Sonra gozlerini kaciriyor.`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '😤 "Acikla. Simdi."',
        effect: { charisma: -1 },
        npcRelationChange: -10,
        personalityEffects: [{ axis: 'openness', change: 4 }],
        feedback: 'Sesi titriyordu. Belki pismandir, belki korkmustur. Ama gercek ortada.',
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
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND', 'ACQUAINTANCE']);
      return `${n(npc)} inkar ediyor: "Ben oyle bir sey soylemedim, sana yalan soyluyorlar. Belki de gercek arkadaslarin onlar degil!" Masumiyetini savunuyor.`;
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
        feedback: 'Maskesi dustu. Sonunda gercek yuzu gordurun.',
      },
      {
        text: '😰 Belki haklidir... kafam karisti',
        effect: { charisma: -4 },
        npcRelationChange: 5,
        personalityEffects: [{ axis: 'conformity', change: 3 }, { axis: 'openness', change: -3 }],
        feedback: 'Manipulasyona yenildín. Kendi gerceginden suphe ediyorsun.',
      },
    ],
  },
  {
    id: 'npcq_betray_reaction_regret',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'BEST_FRIEND', 'ACQUAINTANCE']);
      return `${n(npc)}'in gozleri dolu: "Yanliş yaptım. Neden yaptigimi bile bilmiyorum. Lutfen..." Samimi gorunuyor.`;
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
        feedback: 'Af hemen gelmez. Ama kapi tamamen kapanmadi.',
      },
      {
        text: '😤 "Sozler yetmez. Ispat et."',
        effect: {},
        npcRelationChange: -5,
        personalityEffects: [{ axis: 'openness', change: 2 }],
        feedback: 'Hakli bir talep. Ama afin bedeli agir.',
      },
    ],
  },
  {
    id: 'npcq_betray_forgive',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'ACQUAINTANCE']);
      return `Haftalar gecti. ${n(npc)} surekli uzaktan bakiyor, mesaj atiyor, kucuk jestler yapiyor. Belki gercekten degismistir.`;
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
        feedback: 'Affetmek gucluler icindir. Yeni bir sayfa acildi.',
      },
    ],
  },
  {
    id: 'npcq_betray_distance',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'ACQUAINTANCE']);
      return `${n(npc)} ile artik arkadas degilsiniz. Ama duysman da degil. Koridorda kibar bir selam, o kadar.`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '🤝 "Selam. Nasilsin?"',
        effect: { charisma: 2 },
        npcRelationChange: 0,
        feedback: 'Mesafeli ama medeni. Olgunlasmak bazen boyle olur.',
      },
    ],
  },
  {
    id: 'npcq_betray_cut_off',
    text: (ctx) => {
      const npc = getQuestNPC(ctx, ['FRIEND', 'ACQUAINTANCE']);
      return `${n(npc)} ile butun ipleri kopardín. Numarasini sildin, ortak gruplari biraktin. Temiz bir kesim.`;
    },
    minAge: 12, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: '🚪 "Ihanet affedilmez. Bitti."',
        effect: { charisma: -1 },
        npcRelationChange: -30,
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'empathy', change: -2 }],
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Bir dostluk tamamen bitti' },
        feedback: 'Sinirlarini korudun. Aciti ama daha guvenli hissediyorsun.',
      },
    ],
  },
];

// =================================================================
// EXPORT
// =================================================================

export const NPC_QUESTLINE_EVENTS: GameEvent[] = [
  ...friendshipEvents,
  ...romanceEvents,
  ...rivalryEvents,
  ...betrayalEvents,
];
