import { GameEvent, EventContext, NPC } from '../types';

/**
 * Cliffhanger Event'leri — 12 event
 *
 * Konsept: Seçimin sonucu "bir sonraki tura" ertelenir.
 * Oyuncu "ne olacak?" merakıyla kalır.
 * Her event pendingCliffhanger state'ini doldurur.
 */

const getFriend = (ctx: EventContext): NPC | null =>
  (ctx.npcs || []).find(n => n.role === 'FRIEND' || n.role === 'BEST_FRIEND') || null;

export const CLIFFHANGER_EVENTS: GameEvent[] = [
  // ===============================================================
  // NPC VAADİ
  // ===============================================================
  {
    id: 'cliff_npc_secret_promise',
    continuationEventId: 'cliff_npc_secret_reveal',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const friend = getFriend(ctx);
      return friend
        ? `${friend.name} sana yaklasti. "Yarin sana onemli bir sey soyleyecegim. Simdi olmaz ama... hazir ol."`
        : 'Arkadaslarindan biri seni kenara cekti. "Yarin konusmamiz lazim. Onemli."';
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    reqNPCRole: 'FRIEND',
    choices: [
      {
        text: '🤔 "Tamam, merak ettim!"',
        effect: { charisma: 2 },
        npcRelationChange: 5,
        futureEvents: [{ trigger: 'TURNS', eventId: 'cliff_npc_secret_reveal', turnsLater: 1 }],
        feedback: 'Merak icinde kaldin. Yarin ne soyleyecek acaba?',
      },
      {
        text: '😤 "Simdi soyle, bekleyemem"',
        effect: { charisma: -1 },
        npcRelationChange: -3,
        feedback: 'Sabirsizligin fark edildi. "Yarin" dedi ve gitti.',
      },
    ],
  },
  {
    id: 'cliff_npc_secret_reveal',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const friend = getFriend(ctx);
      const name = friend?.name || 'Arkadasin';
      return `${name} sonunda konusuyor: "Ailem tasinmaya karar verdi. Bu sehirden gidiyoruz..."`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '😢 "Hayir... gitme"',
        effect: { charisma: -6 },
        npcRelationChange: 10,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        memory: { emotion: 'REGRET', weight: 'HIGH', customNote: 'Arkadasinin tasindigi gun' },
        feedback: 'Bazi vedalar hayatin en zor kisimlaridir.',
      },
      {
        text: '💪 "Uzak da olsak arkadas kaliriz"',
        effect: { charisma: 1 },
        npcRelationChange: 15,
        feedback: 'Mesafe dostlugun onundeki tek engel degil.',
      },
    ],
  },

  // ===============================================================
  // SINAV ÖNCESİ GERİLİM
  // ===============================================================
  {
    id: 'cliff_exam_tomorrow',
    continuationEventId: 'cliff_exam_result_good',
    tags: ['exam', 'study', 'school'],
    text: 'Yarin buyuk sinav var. Gece gec saate kadar ders mi calismalsin, yoksa dinlenip zihni tazele?',
    minAge: 7, maxAge: 18,
    rarity: 'COMMON',
    personalityCategory: 'GROWTH',
    choices: [
      {
        text: '📚 Son bir kez daha gozden gecir',
        effect: { intelligence: 3, health: -2 },
        futureEvents: [{ trigger: 'TURNS', eventId: 'cliff_exam_result_good', turnsLater: 1 }],
        feedback: 'Geceyi ders calisarak gecirdin. Umarim sonuc iyi olur...',
      },
      {
        text: '😴 Erken yat — dinlenmis zihin daha iyi calisir',
        effect: { health: 3 },
        futureEvents: [{ trigger: 'TURNS', eventId: 'cliff_exam_result_rested', turnsLater: 1 }],
        feedback: 'Rahat bir uyku cektin. Yarin taze bir kafayla gireceksin.',
      },
    ],
  },
  {
    id: 'cliff_exam_result_good',
    tags: ['exam', 'school'],
    text: 'Sinav sonuclari aciklandi! Gece boyunca calistigi konulardan soru gelmis.',
    minAge: 7, maxAge: 18,
    rarity: 'COMMON',
    personalityCategory: 'GROWTH',
    choices: [
      {
        text: '🎉 Sonuclara bak',
        effect: { intelligence: 4, charisma: 6 },
        gradeUpdates: { math: 5, science: 3 },
        feedback: 'Harika bir not! Gece calismak ise yaramis.',
      },
    ],
  },
  {
    id: 'cliff_exam_result_rested',
    tags: ['exam', 'school'],
    text: 'Sinav sonuclari aciklandi. Dinlenmis bir kafayla girdiginde kendini iyi hissetmistin.',
    minAge: 7, maxAge: 18,
    rarity: 'COMMON',
    personalityCategory: 'GROWTH',
    choices: [
      {
        text: '📊 Sonuclara bak',
        effect: { intelligence: 2, charisma: 4, health: 2 },
        gradeUpdates: { math: 3 },
        feedback: 'Fena degil! Dinlenmek de ise yaramis. Hem sagligindan da olmedin.',
      },
    ],
  },

  // ===============================================================
  // AİLE SÜRPRİZİ
  // ===============================================================
  {
    id: 'cliff_family_announcement',
    continuationEventId: 'cliff_family_news_reveal',
    tags: ['family', 'social'],
    text: (ctx) => {
      const familyDynamic = ctx.gameState?.family?.dynamic;
      return familyDynamic === 'STRICT'
        ? 'Baban aksam yemeginde sert bir yuzle "Konusmamiz lazim" dedi. Annesi de sessiz.'
        : 'Ailen aksam yemeginde "Size bir haberimiz var" dedi. Yuzlerinde garip bir ifade.';
    },
    minAge: 8, maxAge: 16,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '😰 "Ne oldu? Soyleyin..."',
        effect: { charisma: -2 },
        futureEvents: [{ trigger: 'TURNS', eventId: 'cliff_family_news_reveal', turnsLater: 1 }],
        feedback: '"Yarin konusuruz" dediler. Gece uyuyamadin.',
      },
      {
        text: '😊 "Iyi haber mi?"',
        effect: {},
        futureEvents: [{ trigger: 'TURNS', eventId: 'cliff_family_news_reveal', turnsLater: 1 }],
        feedback: 'Gulumsediler ama cevap vermediler. Merak icinde kaldin.',
      },
    ],
  },
  {
    id: 'cliff_family_news_reveal',
    tags: ['family', 'social'],
    text: 'Ailen sonunda haberi verdi: yeni bir kardes yolda! Hayatin degisecek.',
    minAge: 8, maxAge: 16,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '🎉 "Harika! Abi/abla olacagim!"',
        effect: { charisma: 10 },
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Yeni kardes haberi' },
        feedback: 'Heyecanlisin! Buyuk sorumluluk ama buyuk mutluluk da.',
      },
      {
        text: '😰 "Ya dikkat bana azalirsa?"',
        effect: { charisma: -3 },
        personalityEffects: [{ axis: 'openness', change: -2 }],
        feedback: 'Endiselen. Ama zamanla alisacaksiniz.',
      },
    ],
  },

  // ===============================================================
  // KADER ANI
  // ===============================================================
  {
    id: 'cliff_fate_turning_point',
    tags: ['growth', 'identity'],
    text: 'Bugun garip bir gun. Her sey normal gibi ama icinde bir his var — "yarin bir seyler degisecek." Buna hazir misin?',
    minAge: 10, maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'GROWTH',
    choices: [
      {
        text: '🌟 "Degisime hazirim"',
        effect: { charisma: 3 },
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'openness', change: 2 }],
        feedback: 'Icindeki ses guclendi. Yarin ne getirecek bilmiyorsun ama korkun yok.',
      },
      {
        text: '😟 "Umarim kotu bir sey degildir"',
        effect: { charisma: -1 },
        personalityEffects: [{ axis: 'openness', change: -1 }],
        feedback: 'Tedirginsin. Ama bazen en iyi seyler beklenmedik anda gelir.',
      },
    ],
  },

  // ===============================================================
  // GİZEMLİ MEKTUP
  // ===============================================================
  {
    id: 'cliff_mysterious_letter',
    continuationEventId: 'cliff_letter_meetup',
    tags: ['social', 'friend'],
    text: 'Cantanda bir mektup buldun. Uzerinde sadece "Yarin parkta ol, saat 4" yazıyor. El yazisi tanidik ama cikaramadin.',
    minAge: 10, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'RISK',
    choices: [
      {
        text: '🕵️ "Gidecegim — kim oldugunu merak ediyorum"',
        effect: { charisma: 2 },
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'openness', change: 2 }],
        futureEvents: [{ trigger: 'TURNS', eventId: 'cliff_letter_meetup', turnsLater: 1 }],
        feedback: 'Cesur bir karar. Yarin parkta ne bekliyor seni?',
      },
      {
        text: '🗑️ "Tuzak olabilir, gitmem"',
        effect: {},
        personalityEffects: [{ axis: 'conformity', change: 2 }],
        feedback: 'Temkinli davrandin. Belki hakli, belki de bir firsati kacirdin.',
      },
    ],
  },
  {
    id: 'cliff_letter_meetup',
    tags: ['social', 'friend', 'npc'],
    text: 'Parka gittin. Bankta oturan kisiyi gordun — eski bir arkadasin! Yillardir gormemistin. "Seni bulamaya calistim" diyor.',
    minAge: 10, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '🤗 "Inanamiyorum! Gel sarilayim!"',
        effect: { charisma: 11 },
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Eski arkadas tekrar bulundu' },
        feedback: 'Bazen hayat en guzel surprizleri en beklenmedik anda verir.',
      },
      {
        text: '🤔 "Neden simdi?"',
        effect: { charisma: 3, intelligence: 1 },
        feedback: 'Mesafeli ama meraklisin. Hikayesini dinlemeye basladiniz.',
      },
    ],
  },
];
