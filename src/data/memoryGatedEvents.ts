import { GameEvent, EventContext } from '../types';

// =================================================================
// HAFIZA-KAPILI EVENTLER
// Bu eventler oyuncunun gecmis secimlerinden olusan anilara gore tetiklenir.
// reqMemory alani belirli bir duygu ve agirlik esigi gerektirir.
// =================================================================

export const MEMORY_GATED_EVENTS: GameEvent[] = [

  // =================================================================
  // YAS 3-7: ERKEN COCUKLUK YANKILARI (5 event)
  // =================================================================

  {
    id: 'mem_guilt_apology',
    tags: ['social', 'family'],
    text: (ctx: EventContext) => {
      const mem = ctx.memories.find(m => m.emotion === 'GUILT');
      return mem
        ? `${mem.age} yaşında birini üzmüştün. Bugün parkta onu gördün. İçinde bir şey kıpırdadı...`
        : 'Geçmişte yaptığın bir şey seni hâlâ rahatsız ediyor.';
    },
    minAge: 4, maxAge: 7, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    reqMemory: { emotion: 'GUILT', minWeight: 'LOW' },
    choices: [
      {
        id: 'guilt_apologize',
        text: 'Özür dile',
        choiceType: 'CHALLENGE',
        effect: { charisma: 5 },
        personalityEffects: [{ axis: 'empathy', change: 4 }, { axis: 'courage', change: 2 }],
        stressEffect: -5,
        feedback: 'Özür diledin. Karşındaki gülümsedi. İçindeki yük hafifledi.',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Geçmiş bir hatanı telafi ettin' },
      },
      {
        id: 'guilt_avoid',
        text: 'Görmezden gel',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'empathy', change: -2 }],
        stressEffect: 3,
        feedback: 'Gözlerini kaçırdın. Ama içindeki his gitmedi...',
        memory: { emotion: 'REGRET', weight: 'LOW', customNote: 'Özür dileme fırsatını kaçırdın' },
      },
    ],
  },

  {
    id: 'mem_pride_confidence',
    tags: ['growth', 'social'],
    text: (ctx: EventContext) => {
      const mem = ctx.memories.find(m => m.emotion === 'PRIDE');
      return mem
        ? `${mem.age} yaşındaki o başarıyı hatırladın. Bugün yeni bir şeye cesaret edebilirsin!`
        : 'Geçmişte başardığın bir şey sana güven veriyor.';
    },
    minAge: 4, maxAge: 7, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    reqMemory: { emotion: 'PRIDE', minWeight: 'LOW' },
    choices: [
      {
        id: 'pride_try_new',
        text: 'Yeni bir şey dene',
        choiceType: 'CHALLENGE',
        effect: { intelligence: 3 },
        personalityEffects: [{ axis: 'courage', change: 3 }, { axis: 'openness', change: 2 }],
        feedback: 'Geçmiş başarın sana cesaret verdi. Yeni bir şey öğrendin!',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Cesaretle yeni bir adım attın' },
      },
      {
        id: 'pride_stay_safe',
        text: 'Bildiğin şeylere devam et',
        choiceType: 'PASSIVE',
        effect: { discipline: 2 },
        personalityEffects: [{ axis: 'conformity', change: 2 }],
        feedback: 'Bildiklerinde ustalaşmaya devam ettin.',
      },
    ],
  },

  {
    id: 'mem_regret_second_chance',
    tags: ['growth', 'social'],
    text: (ctx: EventContext) => {
      const mem = ctx.memories.find(m => m.emotion === 'REGRET');
      return mem
        ? `Geçen sefer yanlış seçim yaptığını biliyorsun. Şimdi benzer bir durumdasın...`
        : 'Hayat sana ikinci bir şans veriyor.';
    },
    minAge: 5, maxAge: 8, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    reqMemory: { emotion: 'REGRET', minWeight: 'LOW' },
    choices: [
      {
        id: 'regret_fix',
        text: 'Bu sefer doğrusunu yap',
        choiceType: 'CHALLENGE',
        effect: { discipline: 4, charisma: 2 },
        personalityEffects: [{ axis: 'courage', change: 3 }, { axis: 'empathy', change: 2 }],
        stressEffect: -3,
        feedback: 'Geçmişten ders aldın. Bu sefer doğru olanı seçtin.',
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Geçmişin pişmanlığını telafi ettin' },
      },
      {
        id: 'regret_repeat',
        text: 'Aynı şeyi yap',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'conformity', change: 2 }],
        stressEffect: 5,
        feedback: 'Aynı hatayı tekrarladın. İçinde bir burukluk var...',
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Aynı hatayı tekrar ettin' },
      },
    ],
  },

  {
    id: 'mem_satisfaction_sharing',
    tags: ['social', 'friend'],
    text: (ctx: EventContext) => {
      const mem = ctx.memories.find(m => m.emotion === 'SATISFACTION');
      return mem
        ? `Daha önce paylaşmanın verdiği o güzel hissi hatırlıyorsun. Bir arkadaşın oyuncağını istiyor...`
        : 'Paylaşmak güzel bir his...';
    },
    minAge: 3, maxAge: 6, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    reqMemory: { emotion: 'SATISFACTION', minWeight: 'LOW' },
    choices: [
      {
        id: 'share_yes',
        text: 'Oyuncağını paylaş',
        choiceType: 'CHALLENGE',
        effect: { charisma: 4 },
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        feedback: 'Paylaştın! Arkadaşın çok sevindi. Birlikte oynadınız.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM', customNote: 'Paylaşmanın mutluluğunu tekrar yaşadın' },
      },
      {
        id: 'share_no',
        text: 'Bu sefer paylaşma',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'empathy', change: -1 }],
        feedback: 'Oyuncağını kendine sakladın. Arkadaşın biraz üzüldü.',
      },
    ],
  },

  {
    id: 'mem_fear_overcome',
    tags: ['growth', 'social'],
    text: (ctx: EventContext) => {
      const mem = ctx.memories.find(m => m.emotion === 'REGRET' || m.emotion === 'GUILT');
      return mem
        ? `O günden beri bazı şeylerden korkuyorsun. Ama bugün cesaretini toplayabilirsin...`
        : 'Korkuların seni durdurmak istiyor ama sen daha güçlüsün.';
    },
    minAge: 4, maxAge: 7, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'RISK',
    reqMemory: { emotion: 'REGRET', minWeight: 'LOW' },
    choices: [
      {
        id: 'fear_face',
        text: 'Korkuyla yüzleş',
        choiceType: 'CHALLENGE',
        effect: { health: 3 },
        personalityEffects: [{ axis: 'courage', change: 5 }],
        stressEffect: -8,
        feedback: 'Korkunu yendin! Artık daha cesursun.',
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Korkunu yendin' },
      },
      {
        id: 'fear_retreat',
        text: 'Geri çekil',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'courage', change: -2 }],
        stressEffect: 3,
        feedback: 'Bu sefer geri çekildin. Belki başka zaman...',
      },
    ],
  },

  // =================================================================
  // YAS 7-11: OKUL YANKILARI (8 event)
  // =================================================================

  {
    id: 'mem_school_pride_challenge',
    tags: ['study', 'school'],
    text: (ctx: EventContext) => {
      const mem = ctx.memories.find(m => m.emotion === 'PRIDE' && (m.weight === 'HIGH' || m.weight === 'MEDIUM'));
      return mem
        ? `Öğretmenin sınıfa zor bir soru sordu. ${mem.age} yaşında başardığın o anı hatırlıyorsun... Parmağını kaldırabilirsin.`
        : 'Öğretmen zor bir soru sordu. Cevabı bildiğini düşünüyorsun.';
    },
    minAge: 7, maxAge: 11, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    reqMemory: { emotion: 'PRIDE', minWeight: 'MEDIUM' },
    choices: [
      {
        id: 'school_answer',
        text: 'Parmağını kaldır',
        choiceType: 'CHALLENGE',
        effect: { intelligence: 4, charisma: 3 },
        personalityEffects: [{ axis: 'courage', change: 3 }],
        feedback: 'Doğru cevap! Sınıf sana hayretle baktı. Öğretmen gururlandı.',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Sınıfta cesurca cevap verdin' },
        gradeUpdates: { turkish: 3 },
      },
      {
        id: 'school_silent',
        text: 'Sessiz kal',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'courage', change: -1 }],
        feedback: 'Cevabı biliyordun ama söyleyemedin...',
      },
    ],
  },

  {
    id: 'mem_friendship_guilt_repair',
    tags: ['social', 'friend'],
    text: (ctx: EventContext) => {
      const mem = ctx.memories.find(m => m.emotion === 'GUILT');
      return mem
        ? `Bir arkadaşınla tartışmıştın. ${mem.age} yaşındaki o olayı hatırlıyorsun. Bugün onu teneffüste yalnız gördün...`
        : 'Bir arkadaşın yalnız oturuyor. Yanına gidebilirsin.';
    },
    minAge: 7, maxAge: 11, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    reqMemory: { emotion: 'GUILT', minWeight: 'LOW' },
    choices: [
      {
        id: 'friend_repair',
        text: 'Yanına git ve konuş',
        choiceType: 'CHALLENGE',
        effect: { charisma: 5 },
        personalityEffects: [{ axis: 'empathy', change: 3 }, { axis: 'courage', change: 2 }],
        stressEffect: -4,
        feedback: 'Konuştunuz. Barıştınız. İkisinin de yüzü güldü.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM', customNote: 'Kırılan bir dostluğu onardın' },
        npcRelationChange: 15,
      },
      {
        id: 'friend_ignore',
        text: 'Görmezden gel',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'empathy', change: -2 }],
        feedback: 'Görmezden geldin. Ama aklından çıkmadı.',
        memory: { emotion: 'REGRET', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'mem_exam_regret_study',
    tags: ['exam', 'study', 'school'],
    text: (ctx: EventContext) => {
      const mem = ctx.memories.find(m => m.emotion === 'REGRET');
      return mem
        ? `Geçen sınavda çalışmamıştın ve pişman olmuştun. Yarın yine sınav var...`
        : 'Yarın sınav var. Hazırlanmalısın.';
    },
    minAge: 8, maxAge: 12, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    reqMemory: { emotion: 'REGRET', minWeight: 'LOW' },
    choices: [
      {
        id: 'study_hard',
        text: 'Bu sefer ciddi çalış',
        choiceType: 'CHALLENGE',
        effect: { intelligence: 5, discipline: 3 },
        personalityEffects: [{ axis: 'patience', change: 3 }],
        stressEffect: 5,
        feedback: 'Geçmişten ders aldın. Saatlerce çalıştın. Bu sefer hazırsın!',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Pişmanlıktan ders alıp çalıştın' },
        gradeUpdates: { math: 5, science: 3 },
      },
      {
        id: 'study_skip',
        text: 'Yine erteleme',
        choiceType: 'PASSIVE',
        effect: { discipline: -3 },
        personalityEffects: [{ axis: 'patience', change: -2 }],
        feedback: 'Yine ertelidin. Tarih tekerrür ediyor...',
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Aynı hatayı tekrarladın - çalışmadın' },
      },
    ],
  },

  {
    id: 'mem_bully_pride_stand',
    tags: ['social', 'friend', 'school'],
    text: (ctx: EventContext) => {
      const mem = ctx.memories.find(m => m.emotion === 'PRIDE');
      return mem
        ? `Bir çocuk sınıfta birini zorbalıyor. ${mem.age} yaşında cesurca davrandığını hatırlıyorsun...`
        : 'Birisi sınıfta zorbalığa uğruyor. Müdahale edebilirsin.';
    },
    minAge: 8, maxAge: 12, difficulty: 4, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    reqMemory: { emotion: 'PRIDE', minWeight: 'MEDIUM' },
    choices: [
      {
        id: 'bully_intervene',
        text: 'Araya gir',
        choiceType: 'CHALLENGE',
        effect: { charisma: 5, health: -3 },
        personalityEffects: [{ axis: 'courage', change: 5 }, { axis: 'empathy', change: 3 }],
        stressEffect: 8,
        feedback: 'Cesaretinle zorbalığı durdurdun. Sınıftan alkış aldın!',
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Zorbalığa karşı durdun' },
      },
      {
        id: 'bully_tell_teacher',
        text: 'Öğretmene söyle',
        choiceType: 'NEUTRAL',
        effect: { charisma: 2 },
        personalityEffects: [{ axis: 'conformity', change: 2 }],
        feedback: 'Öğretmene söyledin. Doğru olanı yaptın ama sessizce.',
      },
      {
        id: 'bully_ignore',
        text: 'Karışma',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'courage', change: -2 }, { axis: 'empathy', change: -2 }],
        stressEffect: 5,
        feedback: 'Karışmadın. Ama vicdanın rahat değil...',
        memory: { emotion: 'GUILT', weight: 'MEDIUM', customNote: 'Zorbalığa sessiz kaldın' },
      },
    ],
  },

  {
    id: 'mem_talent_show_fear',
    tags: ['creative', 'art', 'music'],
    text: (ctx: EventContext) => {
      const regret = ctx.memories.find(m => m.emotion === 'REGRET');
      return regret
        ? `Okulda yetenek gösterisi var. Geçen sefer kaçırdığın fırsatı hatırlıyorsun...`
        : 'Okulda yetenek gösterisi var. Sahneye çıkabilirsin.';
    },
    minAge: 8, maxAge: 11, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'RISK',
    reqMemory: { emotion: 'REGRET', minWeight: 'LOW' },
    choices: [
      {
        id: 'talent_perform',
        text: 'Bu sefer sahneye çık',
        choiceType: 'CHALLENGE',
        effect: { charisma: 6 },
        personalityEffects: [{ axis: 'courage', change: 4 }, { axis: 'openness', change: 3 }],
        stressEffect: 10,
        feedback: 'Sahneye çıktın! Eller titriyordu ama başardın!',
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Korkunu yenip sahneye çıktın' },
        skillUpdates: { music: 3 },
      },
      {
        id: 'talent_skip',
        text: 'Yine vazgeç',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'courage', change: -3 }],
        stressEffect: 5,
        feedback: 'Yine sahneye çıkamadın. Pişmanlık büyüyor...',
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Yetenek gösterisinden yine kaçtın' },
      },
    ],
  },

  {
    id: 'mem_honesty_reward',
    tags: ['social', 'growth'],
    text: (ctx: EventContext) => {
      const pride = ctx.memories.find(m => m.emotion === 'PRIDE');
      return pride
        ? `Yerde para buldun. ${pride.age} yaşında doğru olanı seçtiğini hatırlıyorsun...`
        : 'Yerde para buldun. Ne yapacaksın?';
    },
    minAge: 7, maxAge: 10, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    reqMemory: { emotion: 'PRIDE', minWeight: 'LOW' },
    choices: [
      {
        id: 'money_return',
        text: 'Sahibini bul',
        choiceType: 'CHALLENGE',
        effect: { charisma: 4, discipline: 2 },
        personalityEffects: [{ axis: 'empathy', change: 3 }, { axis: 'conformity', change: 2 }],
        feedback: 'Parayı sahibine verdin. Çok teşekkür etti! Dürüstlüğün ödüllendirildi.',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Dürüstlükle parayı geri verdin' },
      },
      {
        id: 'money_keep',
        text: 'Cebine at',
        choiceType: 'PASSIVE',
        effect: { money: 10 },
        personalityEffects: [{ axis: 'empathy', change: -2 }],
        feedback: 'Parayı aldın. Ama vicdanın biraz sızladı...',
        memory: { emotion: 'GUILT', weight: 'LOW', customNote: 'Bulduğun parayı sahibine vermedin' },
      },
    ],
  },

  {
    id: 'mem_group_project_guilt',
    tags: ['study', 'school', 'group'],
    text: (ctx: EventContext) => {
      const guilt = ctx.memories.find(m => m.emotion === 'GUILT');
      return guilt
        ? `Grup ödevi var. Geçen sefer üstüne düşeni yapmamıştın ve vicdanın rahat değildi. Bu sefer?`
        : 'Grup ödevi yapmanız gerekiyor.';
    },
    minAge: 8, maxAge: 12, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    reqMemory: { emotion: 'GUILT', minWeight: 'LOW' },
    choices: [
      {
        id: 'group_lead',
        text: 'Grubu yönet ve çalış',
        choiceType: 'CHALLENGE',
        effect: { intelligence: 3, charisma: 3, discipline: 2 },
        personalityEffects: [{ axis: 'empathy', change: 2 }, { axis: 'patience', change: 2 }],
        feedback: 'Bu sefer herkesin payını aldın. Grup başarılı oldu!',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Grup ödevinde liderlik ettin' },
        skillUpdates: { teamwork: 4 },
      },
      {
        id: 'group_slack',
        text: 'Yine başkalarına bırak',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'empathy', change: -2 }],
        feedback: 'Yine kaytardın. Arkadaşların sinirli...',
        memory: { emotion: 'GUILT', weight: 'MEDIUM', customNote: 'Grup ödevinde yine payını yapmadın' },
      },
    ],
  },

  {
    id: 'mem_teacher_conflict_regret',
    tags: ['study', 'school'],
    text: (ctx: EventContext) => {
      const regret = ctx.memories.find(m => m.emotion === 'REGRET');
      return regret
        ? `Öğretmenle daha önce ters düşmüştün. Bugün aynı öğretmen senden yardım istedi...`
        : 'Öğretmen senden sınıfta yardım etmeni istiyor.';
    },
    minAge: 9, maxAge: 12, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    reqMemory: { emotion: 'REGRET', minWeight: 'LOW' },
    choices: [
      {
        id: 'teacher_help',
        text: 'Yardım et',
        choiceType: 'CHALLENGE',
        effect: { charisma: 4, discipline: 2 },
        personalityEffects: [{ axis: 'empathy', change: 2 }, { axis: 'conformity', change: 2 }],
        feedback: 'Yardım ettin. Öğretmenin gözleri gülümsedi. Aranız düzeldi.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM', customNote: 'Öğretmenle aranı düzelttin' },
      },
      {
        id: 'teacher_refuse',
        text: 'Reddet',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'conformity', change: -2 }],
        feedback: 'Reddettsin. Öğretmen üzgün görünüyordu.',
      },
    ],
  },

  // =================================================================
  // YAS 12-15: KİMLİK KRİZİ VE AHLAKI YANKILAR (7 event)
  // =================================================================

  {
    id: 'mem_identity_pride_path',
    tags: ['growth', 'social'],
    text: (ctx: EventContext) => {
      const prideCount = ctx.memories.filter(m => m.emotion === 'PRIDE').length;
      return prideCount >= 3
        ? `Hayatında birçok şeyi başardın. İnsanlar seni "başarılı çocuk" olarak tanıyor. Ama bu baskı yapıyor mu?`
        : 'İnsanlar senin hakkında konuşuyor. Seni nasıl tanımladıklarını merak ediyorsun.';
    },
    minAge: 12, maxAge: 15, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    reqMemory: { emotion: 'PRIDE', minWeight: 'MEDIUM' },
    choices: [
      {
        id: 'identity_embrace',
        text: 'Bu kimliği kucakla',
        choiceType: 'NEUTRAL',
        effect: { discipline: 3 },
        personalityEffects: [{ axis: 'conformity', change: 3 }],
        feedback: 'Başarılı olmak seni tanımlıyor. Bu sorumluluğu kabul ettin.',
      },
      {
        id: 'identity_question',
        text: 'Kendini sorgula',
        choiceType: 'CHALLENGE',
        effect: { intelligence: 3 },
        personalityEffects: [{ axis: 'openness', change: 4 }, { axis: 'courage', change: 2 }],
        stressEffect: 5,
        feedback: 'Kim olduğunu sorguladın. Rahatsız edici ama büyüten bir süreç.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM', customNote: 'Kimliğini cesurca sorguladın' },
      },
    ],
  },

  {
    id: 'mem_regret_chain_moral',
    tags: ['growth', 'social'],
    text: (ctx: EventContext) => {
      const regrets = ctx.memories.filter(m => m.emotion === 'REGRET');
      return regrets.length >= 2
        ? `Birden fazla pişmanlığın var. Geçmişte yaptığın hatalar bir desen oluşturuyor. Değişmek istiyor musun?`
        : 'Geçmişte yaptığın hatalar seni rahatsız ediyor. Değişim zamanı mı?';
    },
    minAge: 12, maxAge: 16, difficulty: 4, rarity: 'RARE', isRepeatable: false,
    personalityCategory: 'MORAL',
    reqMemory: { emotion: 'REGRET', minWeight: 'MEDIUM' },
    choices: [
      {
        id: 'change_commit',
        text: 'Değişmeye karar ver',
        choiceType: 'CHALLENGE',
        effect: { discipline: 5, charisma: 3 },
        personalityEffects: [{ axis: 'courage', change: 4 }, { axis: 'empathy', change: 3 }],
        stressEffect: -10,
        feedback: 'Bu bir dönüm noktası. Geçmişi geride bırakıp yeni bir sayfa açtın.',
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Geçmiş hatalarından ders alıp değişmeye karar verdin' },
      },
      {
        id: 'change_deny',
        text: '"Ben böyleyim" de',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'conformity', change: -2 }],
        stressEffect: 5,
        feedback: 'Değişimi reddettsin. Ama huzursuzluk devam ediyor...',
      },
    ],
  },

  {
    id: 'mem_betrayal_trust',
    tags: ['social', 'friend', 'relationship'],
    text: (ctx: EventContext) => {
      const guilt = ctx.memories.find(m => m.emotion === 'GUILT' && m.weight === 'HIGH');
      return guilt
        ? `Birinin güvenini sarsmıştın. Şimdi sen de birine güvenmek zorundasın...`
        : 'Birine güvenmek kolay değil. Ama bazen gerekli.';
    },
    minAge: 12, maxAge: 15, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    reqMemory: { emotion: 'GUILT', minWeight: 'HIGH' },
    choices: [
      {
        id: 'trust_give',
        text: 'Güven ver',
        choiceType: 'CHALLENGE',
        effect: { charisma: 4 },
        personalityEffects: [{ axis: 'empathy', change: 3 }, { axis: 'courage', change: 2 }],
        feedback: 'Güveni yeniden inşa ettin. Hem karşındakine hem kendine.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM', customNote: 'Güveni yeniden inşa ettin' },
        npcRelationChange: 10,
      },
      {
        id: 'trust_withhold',
        text: 'Mesafeni koru',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'empathy', change: -2 }],
        feedback: 'Mesafeni korudun. Güvenilmez olmanın bedelini ödüyorsun.',
      },
    ],
  },

  {
    id: 'mem_leadership_echo',
    tags: ['social', 'group'],
    text: (ctx: EventContext) => {
      const pride = ctx.memories.find(m => m.emotion === 'PRIDE' && m.weight !== 'LOW');
      return pride
        ? `Sınıf başkanı seçimleri yaklaşıyor. ${pride.age} yaşındaki başarın sana güç veriyor.`
        : 'Sınıf başkanı seçimleri var. Aday olabilirsin.';
    },
    minAge: 11, maxAge: 14, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    reqMemory: { emotion: 'PRIDE', minWeight: 'MEDIUM' },
    choices: [
      {
        id: 'leader_run',
        text: 'Aday ol',
        choiceType: 'CHALLENGE',
        effect: { charisma: 5 },
        personalityEffects: [{ axis: 'courage', change: 3 }, { axis: 'openness', change: 2 }],
        stressEffect: 8,
        feedback: 'Aday oldun! Seçim kampanyası heyecan vericiydi.',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Sınıf başkanlığına aday oldun' },
        skillUpdates: { teamwork: 3 },
      },
      {
        id: 'leader_support',
        text: 'Başka birini destekle',
        choiceType: 'NEUTRAL',
        effect: { charisma: 2 },
        personalityEffects: [{ axis: 'empathy', change: 2 }],
        feedback: 'Arkadaşını destekledin. Takım oyuncususun.',
      },
    ],
  },

  {
    id: 'mem_creative_expression',
    tags: ['art', 'creative', 'sergi'],
    text: (ctx: EventContext) => {
      const satisfaction = ctx.memories.find(m => m.emotion === 'SATISFACTION');
      return satisfaction
        ? `Geçmişte bir şey yarattığında nasıl hissettiğini hatırlıyorsun. Resim yarışması var...`
        : 'Okulda resim yarışması var. Katılabilirsin.';
    },
    minAge: 10, maxAge: 14, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    reqMemory: { emotion: 'SATISFACTION', minWeight: 'LOW' },
    choices: [
      {
        id: 'art_compete',
        text: 'Yarışmaya katıl',
        choiceType: 'CHALLENGE',
        effect: { charisma: 3 },
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'courage', change: 2 }],
        feedback: 'Yarışmaya katıldın. Resmin herkesin beğenisini topladı!',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Resim yarışmasında yeteneklerini gösterdin' },
        skillUpdates: { art: 4 },
      },
      {
        id: 'art_skip',
        text: 'Katılma',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'openness', change: -1 }],
        feedback: 'Bu sefer katılmadın. Belki bir dahaki sefere.',
      },
    ],
  },

  {
    id: 'mem_peer_pressure_guilt',
    tags: ['social', 'friend', 'group'],
    text: (ctx: EventContext) => {
      const guilt = ctx.memories.find(m => m.emotion === 'GUILT');
      return guilt
        ? `Arkadaşların senden kural dışı bir şey yapmanı istiyor. ${guilt.age} yaşındaki hatanı hatırlıyorsun...`
        : 'Arkadaşların senden risk alman isteniyor.';
    },
    minAge: 12, maxAge: 15, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    reqMemory: { emotion: 'GUILT', minWeight: 'LOW' },
    choices: [
      {
        id: 'peer_resist',
        text: 'Hayır de',
        choiceType: 'CHALLENGE',
        effect: { discipline: 4 },
        personalityEffects: [{ axis: 'courage', change: 4 }, { axis: 'conformity', change: -3 }],
        feedback: '"Hayır" dedin. Arkadaşların şaşırdı ama sana saygı duydular.',
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Akran baskısına direndin' },
      },
      {
        id: 'peer_give_in',
        text: 'Kabul et',
        choiceType: 'PASSIVE',
        effect: { charisma: 2 },
        personalityEffects: [{ axis: 'conformity', change: 3 }, { axis: 'courage', change: -2 }],
        stressEffect: 5,
        feedback: 'Kabul ettin. Eğlendin ama vicdanın rahat değil.',
        memory: { emotion: 'GUILT', weight: 'LOW', customNote: 'Akran baskısına boyun eğdin' },
      },
    ],
  },

  {
    id: 'mem_family_conflict_growth',
    tags: ['family', 'social'],
    text: (ctx: EventContext) => {
      const regret = ctx.memories.find(m => m.emotion === 'REGRET');
      return regret
        ? `Ailenle tartışıyorsun. Daha önce yaptığın bir hata hâlâ gündeme geliyor...`
        : 'Ailenle bir anlaşmazlığın var.';
    },
    minAge: 13, maxAge: 16, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'CONFLICT',
    reqMemory: { emotion: 'REGRET', minWeight: 'LOW' },
    choices: [
      {
        id: 'family_talk',
        text: 'Sakin konuş ve anla',
        choiceType: 'CHALLENGE',
        effect: { familyRelation: 8, discipline: 2 },
        personalityEffects: [{ axis: 'patience', change: 4 }, { axis: 'empathy', change: 2 }],
        stressEffect: -5,
        feedback: 'Ailenle sakin konuştun. Birbirinizi daha iyi anladınız.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM', customNote: 'Aile tartışmasını olgunca çözdün' },
      },
      {
        id: 'family_argue',
        text: 'Bağır ve kapıyı çarp',
        choiceType: 'PASSIVE',
        effect: { familyRelation: -10 },
        personalityEffects: [{ axis: 'patience', change: -3 }, { axis: 'conformity', change: -2 }],
        stressEffect: 10,
        feedback: 'Kapıyı çarptın. Ailenle arandaki mesafe büyüdü.',
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Aile tartışmasında patladın' },
      },
    ],
  },

  // =================================================================
  // YAS 15-18: KARİYER VE İLİŞKİ YANKILARI (5 event)
  // =================================================================

  {
    id: 'mem_career_pride_vision',
    tags: ['work', 'business'],
    text: (ctx: EventContext) => {
      const prideCount = ctx.memories.filter(m => m.emotion === 'PRIDE' && m.weight !== 'LOW').length;
      return prideCount >= 3
        ? `Hayatında birçok şeyi başardın. Gelecek senin elinde. Ne olmak istiyorsun?`
        : 'Gelecek hakkında düşünme zamanı geldi.';
    },
    minAge: 15, maxAge: 17, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    reqMemory: { emotion: 'PRIDE', minWeight: 'MEDIUM' },
    choices: [
      {
        id: 'career_dream_big',
        text: 'Büyük hayal kur',
        choiceType: 'CHALLENGE',
        effect: { intelligence: 3, discipline: 3 },
        personalityEffects: [{ axis: 'openness', change: 3 }, { axis: 'courage', change: 3 }],
        feedback: 'Hayallerin büyük! Bu motivasyon seni ileri taşıyacak.',
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Geleceğin için büyük bir vizyon kurdun' },
      },
      {
        id: 'career_play_safe',
        text: 'Güvenli bir yol seç',
        choiceType: 'NEUTRAL',
        effect: { discipline: 4 },
        personalityEffects: [{ axis: 'conformity', change: 3 }],
        feedback: 'Güvenli yolu seçtin. Ailen memnun.',
      },
    ],
  },

  {
    id: 'mem_regret_last_chance',
    tags: ['study', 'school'],
    text: (ctx: EventContext) => {
      const regrets = ctx.memories.filter(m => m.emotion === 'REGRET');
      const heaviest = regrets.find(m => m.weight === 'HIGH') || regrets[0];
      return heaviest
        ? `Lise bitiyor. ${heaviest.age} yaşındaki o pişmanlık hâlâ aklında. Son bir şans var...`
        : 'Lise bitiyor. Geçmişe bakıyorsun.';
    },
    minAge: 16, maxAge: 18, difficulty: 4, rarity: 'RARE', isRepeatable: false,
    personalityCategory: 'MORAL',
    reqMemory: { emotion: 'REGRET', minWeight: 'MEDIUM' },
    choices: [
      {
        id: 'last_redemption',
        text: 'Son bir hamle yap',
        choiceType: 'CHALLENGE',
        effect: { charisma: 5, discipline: 3 },
        personalityEffects: [{ axis: 'courage', change: 5 }, { axis: 'empathy', change: 3 }],
        stressEffect: -15,
        feedback: 'Geçmişin yükünü omuzlarından attın. Yeni bir insan olarak mezun oluyorsun.',
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Hayatının en büyük pişmanlığını telafi ettin' },
      },
      {
        id: 'last_accept',
        text: 'Geçmişi kabul et',
        choiceType: 'NEUTRAL',
        effect: { discipline: 2 },
        personalityEffects: [{ axis: 'patience', change: 3 }],
        stressEffect: -5,
        feedback: 'Geçmişi değiştiremezsin. Ama ondan öğrenebilirsin.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM', customNote: 'Geçmişinle barıştın' },
      },
    ],
  },

  {
    id: 'mem_friendship_satisfaction_deep',
    tags: ['social', 'friend', 'relationship'],
    text: (ctx: EventContext) => {
      const satisfaction = ctx.memories.find(m => m.emotion === 'SATISFACTION' && m.weight !== 'LOW');
      return satisfaction
        ? `En yakın arkadaşınla yıllar içinde çok şey paylaştın. Birlikte büyüdünüz.`
        : 'En yakın arkadaşınla geçirdiğin zamanları düşünüyorsun.';
    },
    minAge: 15, maxAge: 18, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    reqMemory: { emotion: 'SATISFACTION', minWeight: 'MEDIUM' },
    reqNPCRole: 'FRIEND' as any,
    choices: [
      {
        id: 'friend_deep_talk',
        text: 'Derin bir sohbet et',
        choiceType: 'CHALLENGE',
        effect: { charisma: 4 },
        personalityEffects: [{ axis: 'empathy', change: 3 }, { axis: 'openness', change: 2 }],
        stressEffect: -8,
        feedback: 'Saatlerce konuştunuz. Gerçek dostluk budur.',
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'En yakın arkadaşınla derin bir sohbet ettin' },
        npcRelationChange: 10,
      },
      {
        id: 'friend_casual',
        text: 'Takıl',
        choiceType: 'NEUTRAL',
        effect: { charisma: 2 },
        feedback: 'Güzel vakit geçirdiniz. Her zamanki gibi.',
      },
    ],
  },

  {
    id: 'mem_guilt_confession',
    tags: ['social', 'friend'],
    text: (ctx: EventContext) => {
      const guilts = ctx.memories.filter(m => m.emotion === 'GUILT');
      return guilts.length >= 2
        ? `İçindeki suçluluk duyguları birikti. Birine açılmak istiyorsun...`
        : 'Bazı şeyler seni içten içe kemiriyor.';
    },
    minAge: 14, maxAge: 17, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    reqMemory: { emotion: 'GUILT', minWeight: 'MEDIUM' },
    choices: [
      {
        id: 'confess_open',
        text: 'Birine itiraf et',
        choiceType: 'CHALLENGE',
        effect: { charisma: 3 },
        personalityEffects: [{ axis: 'courage', change: 4 }, { axis: 'empathy', change: 2 }],
        stressEffect: -15,
        feedback: 'İtiraf ettin. Ağır bir yük omuzlarından kalktı.',
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Suçluluk duygularını paylaştın ve rahatladın' },
      },
      {
        id: 'confess_hide',
        text: 'İçinde tut',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'patience', change: -2 }],
        stressEffect: 8,
        feedback: 'Her şeyi içinde tuttun. Yük ağırlaşıyor...',
      },
    ],
  },

  {
    id: 'mem_exam_stress_pride',
    tags: ['exam', 'study', 'school', 'yks', 'sinav'],
    text: (ctx: EventContext) => {
      const pride = ctx.memories.find(m => m.emotion === 'PRIDE' && m.weight === 'HIGH');
      return pride
        ? `Üniversite sınavı yaklaşıyor. ${pride.age} yaşındaki o büyük başarıyı hatırlıyorsun. O gücü tekrar bulabilirsin.`
        : 'Üniversite sınavı yaklaşıyor. Kendine güvenmelisin.';
    },
    minAge: 16, maxAge: 18, difficulty: 4, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    reqMemory: { emotion: 'PRIDE', minWeight: 'HIGH' },
    choices: [
      {
        id: 'exam_focus',
        text: 'O gücü hatırla ve çalış',
        choiceType: 'CHALLENGE',
        effect: { intelligence: 5, discipline: 4 },
        personalityEffects: [{ axis: 'patience', change: 3 }, { axis: 'courage', change: 2 }],
        stressEffect: 5,
        feedback: 'Geçmiş başarıların sana güç verdi. Saatlerce çalıştın!',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Sınav için geçmişin gücüyle çalıştın' },
        gradeUpdates: { math: 5, science: 3, turkish: 2 },
      },
      {
        id: 'exam_panic',
        text: 'Panikle',
        choiceType: 'PASSIVE',
        effect: { health: -3 },
        personalityEffects: [{ axis: 'patience', change: -2 }],
        stressEffect: 15,
        feedback: 'Panik yaptın. Geçmiş başarıların bile seni sakinleştiremedi.',
      },
    ],
  },
];
