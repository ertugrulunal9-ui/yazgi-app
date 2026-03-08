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
        ? `${friend.name} sana yaklaştı. "Yarın sana önemli bir şey söyleyeceğim. Şimdi olmaz ama... hazır ol."`
        : 'Arkadaşlarından biri seni kenara çekti. "Yarın konuşmamız lazım. Önemli."';
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
        feedback: 'Merak içinde kaldın. Yarın ne söyleyecek acaba?',
      },
      {
        text: '😤 "Şimdi söyle, bekleyemem"',
        effect: { charisma: -1 },
        npcRelationChange: -3,
        feedback: 'Sabırsızlığın fark edildi. "Yarın" dedi ve gitti.',
      },
    ],
  },
  {
    id: 'cliff_npc_secret_reveal',
    tags: ['social', 'friend', 'npc'],
    text: (ctx) => {
      const friend = getFriend(ctx);
      const name = friend?.name || 'Arkadaşın';
      return `${name} sonunda konuşuyor: "Ailem taşınmaya karar verdi. Bu şehirden gidiyoruz..."`;
    },
    minAge: 8, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '😢 "Hayır... gitme"',
        effect: { charisma: -6 },
        npcRelationChange: 10,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        memory: { emotion: 'REGRET', weight: 'HIGH', customNote: 'Arkadaşının taşındığı gün' },
        feedback: 'Bazı vedalar hayatın en zor kısımlarıdır.',
      },
      {
        text: '💪 "Uzak da olsak arkadaş kalırız"',
        effect: { charisma: 1 },
        npcRelationChange: 15,
        feedback: 'Mesafe dostluğun önündeki tek engel değil.',
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
    text: 'Yarın büyük sınav var. Gece geç saate kadar ders mi çalışmalısın, yoksa dinlenip zihni tazele?',
    minAge: 7, maxAge: 18,
    rarity: 'COMMON',
    personalityCategory: 'GROWTH',
    choices: [
      {
        text: '📚 Son bir kez daha gözden geçir',
        effect: { intelligence: 3, health: -2 },
        futureEvents: [{ trigger: 'TURNS', eventId: 'cliff_exam_result_good', turnsLater: 1 }],
        feedback: 'Geceyi ders çalışarak geçirdin. Umarım sonuç iyi olur...',
      },
      {
        text: '😴 Erken yat — dinlenmiş zihin daha iyi çalışır',
        effect: { health: 3 },
        futureEvents: [{ trigger: 'TURNS', eventId: 'cliff_exam_result_rested', turnsLater: 1 }],
        feedback: 'Rahat bir uyku çektin. Yarın taze bir kafayla gireceksin.',
      },
    ],
  },
  {
    id: 'cliff_exam_result_good',
    tags: ['exam', 'school'],
    text: 'Sınav sonuçları açıklandı! Gece boyunca çalıştığı konulardan soru gelmiş.',
    minAge: 7, maxAge: 18,
    rarity: 'COMMON',
    personalityCategory: 'GROWTH',
    choices: [
      {
        text: '🎉 Sonuclara bak',
        effect: { intelligence: 4, charisma: 6 },
        gradeUpdates: { math: 5, science: 3 },
        feedback: 'Harika bir not! Gece çalışmak işe yaramış.',
      },
    ],
  },
  {
    id: 'cliff_exam_result_rested',
    tags: ['exam', 'school'],
    text: 'Sınav sonuçları açıklandı. Dinlenmiş bir kafayla girdiğinde kendini iyi hissetmiştin.',
    minAge: 7, maxAge: 18,
    rarity: 'COMMON',
    personalityCategory: 'GROWTH',
    choices: [
      {
        text: '📊 Sonuclara bak',
        effect: { intelligence: 2, charisma: 4, health: 2 },
        gradeUpdates: { math: 3 },
        feedback: 'Fena değil! Dinlenmek de işe yaramış. Hem sağlığından da olmadın.',
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
        ? 'Baban akşam yemeğinde sert bir yüzle "Konuşmamız lazım" dedi. Annesi de sessiz.'
        : 'Ailen akşam yemeğinde "Size bir haberimiz var" dedi. Yüzlerinde garip bir ifade.';
    },
    minAge: 8, maxAge: 16,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '😰 "Ne oldu? Söyleyin..."',
        effect: { charisma: -2 },
        futureEvents: [{ trigger: 'TURNS', eventId: 'cliff_family_news_reveal', turnsLater: 1 }],
        feedback: '"Yarın konuşuruz" dediler. Gece uyuyamadın.',
      },
      {
        text: '😊 "Iyi haber mi?"',
        effect: {},
        futureEvents: [{ trigger: 'TURNS', eventId: 'cliff_family_news_reveal', turnsLater: 1 }],
        feedback: 'Güldümsediler ama cevap vermediler. Merak içinde kaldın.',
      },
    ],
  },
  {
    id: 'cliff_family_news_reveal',
    tags: ['family', 'social'],
    text: 'Ailen sonunda haberi verdi: yeni bir kardeş yolda! Hayatın değişecek.',
    minAge: 8, maxAge: 16,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '🎉 "Harika! Abi/abla olacağım!"',
        effect: { charisma: 10 },
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Yeni kardeş haberi' },
        feedback: 'Heyecanlısın! Büyük sorumluluk ama büyük mutluluk da.',
      },
      {
        text: '😰 "Ya dikkat bana azalırsa?"',
        effect: { charisma: -3 },
        personalityEffects: [{ axis: 'openness', change: -2 }],
        feedback: 'Endişelen. Ama zamanla alışacaksınız.',
      },
    ],
  },

  // ===============================================================
  // KADER ANI
  // ===============================================================
  {
    id: 'cliff_fate_turning_point',
    tags: ['growth', 'identity'],
    text: 'Bugün garip bir gün. Her şey normal gibi ama içinde bir his var — "yarın bir şeyler değişecek." Buna hazır mısın?',
    minAge: 10, maxAge: 18,
    rarity: 'RARE',
    personalityCategory: 'GROWTH',
    choices: [
      {
        text: '🌟 "Değişime hazırım"',
        effect: { charisma: 3 },
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'openness', change: 2 }],
        feedback: 'İçindeki ses güçlendi. Yarın ne getireceğini bilmiyorsun ama korkun yok.',
      },
      {
        text: '😟 "Umarim kotu bir sey degildir"',
        effect: { charisma: -1 },
        personalityEffects: [{ axis: 'openness', change: -1 }],
        feedback: 'Tedirginsin. Ama bazen en iyi şeyler beklenmedik anda gelir.',
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
    text: 'Çantanda bir mektup buldun. Üzerinde sadece "Yarın parkta ol, saat 4" yazıyor. El yazısı tanıdık ama çıkaramadın.',
    minAge: 10, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'RISK',
    choices: [
      {
        text: '🕵️ "Gidecegim — kim oldugunu merak ediyorum"',
        effect: { charisma: 2 },
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'openness', change: 2 }],
        futureEvents: [{ trigger: 'TURNS', eventId: 'cliff_letter_meetup', turnsLater: 1 }],
        feedback: 'Cesur bir karar. Yarın parkta ne bekliyor seni?',
      },
      {
        text: '🗑️ "Tuzak olabilir, gitmem"',
        effect: {},
        personalityEffects: [{ axis: 'conformity', change: 2 }],
        feedback: 'Temkinli davrandın. Belki haklı, belki de bir fırsatı kaçırdın.',
      },
    ],
  },
  {
    id: 'cliff_letter_meetup',
    tags: ['social', 'friend', 'npc'],
    text: 'Parka gittin. Bankta oturan kişiyi gördün — eski bir arkadaşın! Yıllardır görmemiştin. "Seni bulmaya çalıştım" diyor.',
    minAge: 10, maxAge: 18,
    rarity: 'UNCOMMON',
    personalityCategory: 'SOCIAL',
    choices: [
      {
        text: '🤗 "Inanamiyorum! Gel sarilayim!"',
        effect: { charisma: 11 },
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Eski arkadaş tekrar bulundu' },
        feedback: 'Bazen hayat en güzel sürprizleri en beklenmedik anda verir.',
      },
      {
        text: '🤔 "Neden şimdi?"',
        effect: { charisma: 3, intelligence: 1 },
        feedback: 'Mesafeli ama meraklısın. Hikayesini dinlemeye başladınız.',
      },
    ],
  },
];
