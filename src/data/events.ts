
import { GameEvent, EventContext } from '../types';
import { analyzeMemories, getRandomMemoryText } from '../utils/memoryLogic';

// 3. GÖREV: HASTANE MEKANİĞİ
export const HOSPITAL_EVENT: GameEvent = {
  id: 'evt_hastane',
  text: "Gözlerini beyaz ışıklar altında, hastane odasında açtın. Doktorlar aşırı yorgunluk ve sağlık sorunları nedeniyle çöktüğünü söylüyor.",
  minAge: 0, maxAge: 100, difficulty: 1, rarity: 'RARE',
  choices: [
    { 
      text: "Dinlen ve iyileş", 
      effect: { health: 30, money: -50, energy: 0, charisma: -10 }, 
      feedback: "Birkaç gün serum yedin. Sağlığın toparladı ama masraflar ve moral bozukluğu seni geriletti." 
    }
  ]
};

export const EVENTS: GameEvent[] = [
  // =================================================================
  // 0-6 AGE EVENTS (BEBEKLİK & ÇOCUKLUK)
  // =================================================================
  {
    id: 'evt_first_steps',
    text: "Bacakların titriyor ama ayakta durabiliyorsun. Karşında annen kollarını açmış bekliyor, yerde ise en sevdiğin oyuncak var.",
    minAge: 1, maxAge: 2, difficulty: 1, rarity: 'COMMON', isRepeatable: false,
    choices: [
      {
        text: "Annene yürü",
        effect: { familyRelation: 10, health: 2, charisma: 2 },
        feedback: "Paytak adımlarla annene ulaştın. Seni kucağına alıp öpücüklere boğdu."
      },
      {
        text: "Oyuncağa git",
        effect: { intelligence: 2, discipline: 2, health: 2 },
        feedback: "Hedefine odaklandın ve oyuncağı kaptın. Bağımsız bir ruhun var!"
      }
    ]
  },
  {
    id: 'evt_first_words',
    text: "Ailen heyecanla ağzının içine bakıyor. Bir şeyler söylemeye çalışıyorsun.",
    minAge: 1, maxAge: 3, difficulty: 1, rarity: 'COMMON', isRepeatable: false,
    choices: [
      {
        text: "'Anne' / 'Baba'",
        effect: { familyRelation: 15, charisma: 5 },
        feedback: "Evde bayram havası esti! Herkes alkışlıyor."
      },
      {
        text: "'Hayır!'",
        effect: { discipline: 5, intelligence: 2 },
        feedback: "Şimdiden itiraz etmeye başladın. Karakterin oturuyor."
      }
    ]
  },
  {
    id: 'evt_food_war',
    text: "Önündeki mama brokoli püresi. Rengi iğrenç, kokusu daha da iğrenç.",
    minAge: 1, maxAge: 4, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    choices: [
      {
        text: "Tabağı fırlat!",
        effect: { discipline: -2, health: -1, familyRelation: -2 },
        feedback: "Mutfak savaş alanına döndü. Annen pek mutlu görünmüyor."
      },
      {
        text: "Zorla ye",
        effect: { health: 5, discipline: 2 },
        feedback: "Tadın kaçtı ama vücuduna vitamin girdi."
      }
    ]
  },
  {
    id: 'evt_playground_bully',
    text: "Parkta kumdan kale yapıyorsun. Başka bir çocuk gelip kaleni tekmeledi!",
    minAge: 3, maxAge: 6, difficulty: 2, rarity: 'COMMON', isRepeatable: false,
    choices: [
      {
        text: "Onu it",
        effect: { discipline: -2, health: -2 },
        skillUpdates: { sports: 2 },
        feedback: "Çocuğu kuma ittirdin. Biraz ağladı ama kaleni korudun."
      },
      {
        text: "Ağlayarak annene koş",
        effect: { familyRelation: 5, charisma: -2 },
        feedback: "Annen gelip çocuğu uyardı. Güvendesin."
      }
    ]
  },
  {
    id: 'evt_kindergarten_share',
    text: "Anaokulunda elinde sadece bir tane kırmızı boya kalemi var. Yanındaki arkadaşın onu istiyor.",
    minAge: 4, maxAge: 6, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    choices: [
      {
        text: "Paylaş",
        effect: { charisma: 5, familyRelation: 2 },
        feedback: "Kalemi verdin. Arkadaşın sana gülümsedi."
      },
      {
        text: "Vermem!",
        effect: { discipline: -1, intelligence: 1 },
        feedback: "Kalem senin, resim senin. Paylaşmak zorunda değilsin."
      }
    ]
  },
  {
    id: 'evt_curiosity_bug',
    text: "Bahçede garip, çok bacaklı bir böcek gördün.",
    minAge: 3, maxAge: 6, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    choices: [
      {
        text: "İncele",
        effect: { intelligence: 5 },
        feedback: "Böceğin hareketlerini izledin. Doğa çok ilginç."
      },
      {
        text: "Ez!",
        effect: { discipline: -2 },
        skillUpdates: { sports: 1 },
        feedback: "Artık böcek yok."
      }
    ]
  },

  // =================================================================
  // 7-18 AGE EVENTS (SCHOOL & TEENAGER)
  // =================================================================
  
  // --- TEST EVENT: MEMORY SYSTEM ---
  {
    id: "found_wallet",
    text: "Okul bahçesinde şişkin bir cüzdan buldun. İçinde epey harçlık var.",
    minAge: 7,
    maxAge: 18,
    difficulty: 2,
    rarity: 'COMMON',
    choices: [
      {
        id: "keep_money",
        text: "Parayı al ve cüzdanı at",
        effect: { money: 50, health: 5, discipline: -5 },
        feedback: "Parayı cebe indirdin. Kimse görmedi... ama vicdanın rahat mı?",
        memory: { 
          emotion: 'GUILT', 
          weight: 'MEDIUM',   
          customNote: 'Hırsızlık yaptın.'
        }
      },
      {
        id: "return_wallet",
        text: "Müdüre teslim et",
        effect: { discipline: 5, charisma: 5 },
        feedback: "Müdür dürüstlüğünü takdir etti.",
        memory: { 
          emotion: 'PRIDE',
          weight: 'LOW',
          customNote: 'Dürüst davrandın.'
        }
      }
    ]
  },

  // --- MEMORY REFLECTION EVENT (17 YAŞ ÖZEL) ---
  {
    id: "reflection_day",
    // Bu olay rastgele çıkmaz, kodla tetiklenir (veya rarity sistemiyle nadir çıkar)
    text: (ctx) => {
      const memories = ctx.memories || [];
      const { regretScore, prideScore } = analyzeMemories(memories);
      
      let story = "📅 17. Doğum Günün. Aynadaki yansımına bakıyorsun. Çocukluk geride kaldı. ";

      if (memories.length === 0) {
        return story + "Sakin ve olaysız bir gençlik geçirdin. Hafızanda iz bırakan pek bir şey yok.";
      }

      if (regretScore > prideScore) {
        story += "Yüzünde hüzünlü bir ifade var. Geçmişe dönüp bazı şeyleri değiştirmek isterdin. ";
        story += getRandomMemoryText(memories, 'NEGATIVE');
        story += " Keşke o gün farklı davransaydın.";
      } else if (prideScore >= regretScore) {
        story += "Gözlerin parlıyor. Verdiğin kararlardan memnunsun. ";
        story += getRandomMemoryText(memories, 'POSITIVE');
        story += " Seni bugünkü sen yapan o andı.";
      }

      return story;
    },
    minAge: 17, maxAge: 17, difficulty: 1, rarity: 'RARE',
    choices: [
      { 
        id: "accept_past", 
        text: "Geçmişi kabullen ve geleceğe bak", 
        effect: { health: 10, energy: 10 },
        feedback: "Kendinle barışıksın. Yetişkinliğe hazırsın." 
      },
      { 
        id: "dwell_past", 
        text: "Derin düşüncelere dal", 
        effect: { intelligence: 5, health: -5 },
        feedback: "Hayatı sorguladın. Biraz canın sıkıldı ama olgunlaştın."
      }
    ]
  },

  // --- CHAIN START: BULLYING CONSEQUENCES ---
  {
    id: 'bullying_witness',
    text: (ctx: EventContext) => {
        if (ctx.traits.includes('EMPATHETIC')) return "🥺 Sınıfın arkasında arkadaşının zorbalığa uğradığını gördün. Kalbin sıkıştı, içinden ona sarılmak geliyor.";
        if (ctx.traits.includes('COWARD')) return "😰 Arkadaşın zorbalığa uğruyor. Bacakların titremeye başladı, ya sana da bulaşırlarsa?";
        if (ctx.traits.includes('BRAVE')) return "😡 Arkadaşın zorbalığa uğruyor. Yumruklarını sıktın, buna izin veremezsin!";
        return "😐 Sınıf arkadaşının zorbalığa uğradığını gördün. Zor bir durum.";
    },
    minAge: 7, maxAge: 16, difficulty: 3, tags: ['social', 'moral'], rarity: 'COMMON',
    choices: [
      {
        id: 'brave_choice', 
        text: "Araya gir ve koru",
        reqStats: { health: 30 },
        effect: { charisma: 10, health: -5, discipline: 5 },
        feedback: "Zorbayı ittin! Biraz hırpalandın ama herkes cesaretine hayran kaldı.",
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        // FUTURE EVENT: Grateful friend returns later
        futureEvents: [
            { trigger: 'TURNS', turnsLater: 8, eventId: 'grateful_friend_returns', priority: 'NORMAL' }
        ]
      },
      {
        id: 'help_teacher',
        text: "Öğretmene söyle",
        effect: { intelligence: 2, charisma: -5 },
        feedback: "Öğretmen olayı çözdü. Güvenli ama 'ispiyoncu' damgası yiyebilirsin."
      },
      {
        id: 'avoid_conflict',
        text: "Görmezden gel",
        effect: { discipline: -5, charisma: -5 },
        feedback: "Kafanı çevirip uzaklaştın. Vicdanın rahat değil.",
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
        // FUTURE EVENT: Guilt trip if empathetic
        futureEvents: [
            { trigger: 'AGE', age: 15, eventId: 'evt_guilt_trip', condition: 'if_trait_EMPATHETIC', priority: 'HIGH' }
        ]
      }
    ]
  },
  
  // --- CHAIN RESULT: GRATEFUL FRIEND ---
  {
    id: 'grateful_friend_returns',
    text: "Yolda yürürken biri seni durdurdu. Bu, yıllar önce okulda zorbalara karşı savunduğun arkadaşın! Şimdi okul temsilcisi olmuş.",
    minAge: 12, maxAge: 18, difficulty: 1, rarity: 'RARE', // Rarity high because it's mostly triggered via chain
    choices: [
      {
        text: "Sarıl ve konuş",
        effect: { charisma: 10, familyRelation: 2, money: 50 },
        feedback: "'O günü hiç unutmadım. Cesaretin bana ilham verdi.' dedi ve sana bir hediye verdi.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' }
      },
      {
        text: "Gülümse ve geç",
        effect: { charisma: 5 },
        feedback: "Kısa bir selamlaşma. İyilik yap denize at..."
      }
    ]
  },

  // --- CHAIN RESULT: GUILT TRIP ---
  {
    id: 'evt_guilt_trip',
    text: "Gece yatağında dönüp duruyorsun. Yıllar önce o çocuğa yardım etmediğin, sadece izlediğin an aklına geliyor. Vicdanın sızlıyor.",
    minAge: 14, maxAge: 18, difficulty: 1, rarity: 'RARE',
    choices: [
      {
        text: "Ders çıkarmaya çalış",
        effect: { health: -10, energy: -20, discipline: 5 },
        feedback: "Sabaha kadar uyuyamadın ama kendine söz verdin: Bir daha asla sessiz kalmayacaksın.",
        memory: { emotion: 'REGRET', weight: 'HIGH' }
      },
      {
        text: "Unutmaya çalış",
        effect: { health: -5, charisma: -5 },
        feedback: "Kafanı yastığa gömdün. Bastırılmış duygular seni içten içe yiyor."
      }
    ]
  },

  {
    id: 'evt_exam_stress',
    text: (ctx: EventContext) => {
        if (ctx.traits.includes('DISCIPLINED')) return "📚 Yarın büyük sınav var. Çalışma masan düzenli, notların hazır. Plana sadık kalma zamanı.";
        if (ctx.traits.includes('PROCRASTINATOR')) return "😱 Yarın büyük sınav var! Yine son dakikaya bıraktın. Notlar nerede? Kitap nerede?!";
        if (ctx.traits.includes('GENIUS')) return "🧠 Yarın sınav var ama konular sana çerez gibi geliyor. Yine de tekrar yapmakta fayda var.";
        return "📝 Yarın önemli bir sınav var. Bugün ne yapacaksın?";
    },
    minAge: 7, maxAge: 18, difficulty: 2, tags: ['academic', 'stress'], rarity: 'COMMON', isRepeatable: true,
    choices: [
      {
        text: "Sabahla ve çalış",
        effect: { intelligence: 5, energy: -30, health: -2 },
        gradeUpdates: { math: 5, science: 5 },
        feedback: "Gözlerin kan çanağı ama konuları bitirdin.",
        memory: { emotion: 'SATISFACTION', weight: 'LOW' }
      },
      {
        text: "Erken uyu",
        effect: { health: 2, energy: 10 },
        gradeUpdates: { math: -2 },
        feedback: "Zihnin dinç ama bazı konular eksik kaldı."
      }
    ]
  },

  // --- CHAIN START: CHEATING ---
  {
    id: 'evt_cheat_opportunity',
    text: (ctx: EventContext) => {
        if (ctx.traits.includes('HONEST')) return "🚫 Sınavda önündeki kağıt apaçık duruyor. Kopya çekebilirsin ama... bu sana çok yanlış hissettiriyor.";
        if (ctx.traits.includes('CHEATER')) return "😏 Sınavda önündeki kağıt apaçık duruyor. İşte fırsat! Bu senin uzmanlık alanın.";
        return "👀 Sınavda önündeki arkadaşın kağıdını hiç kapatmamış. Cevapları görebiliyorsun.";
    },
    minAge: 8, maxAge: 18, difficulty: 3, tags: ['academic', 'moral'], rarity: 'UNCOMMON',
    choices: [
      {
        id: 'cheat_choice',
        text: "Cevaplara bak (Riskli)",
        reqStats: { energy: 20 },
        effect: { intelligence: -2, charisma: -5 },
        gradeUpdates: { math: 20, science: 20 },
        feedback: "Hoca görmeden cevapları geçirdin. Notun tavan yapacak ama risk aldın.",
        memory: { emotion: 'GUILT', weight: 'HIGH' },
        futureEvents: [
            // Short term consequence: Teacher Suspicion
            { trigger: 'TURNS', turnsLater: 3, eventId: 'evt_teacher_suspicious', priority: 'NORMAL' },
            // Long term consequence: University Ethics Check (Only if cheater trait is formed or maintained)
            { trigger: 'AGE', age: 17, eventId: 'evt_uni_ethics', condition: 'if_trait_CHEATER', priority: 'HIGH' }
        ]
      },
      {
        id: 'refuse_cheat',
        text: "Kendi bildiğini yap",
        effect: { discipline: 5, intelligence: 2 },
        feedback: "Zorlandın ama alın terinle yaptın.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' }
      }
    ]
  },

  // --- CHAIN RESULT: TEACHER SUSPICION ---
  {
    id: 'evt_teacher_suspicious',
    text: "Matematik öğretmeni seni odasına çağırdı. Masada son sınav kağıdın duruyor. 'Notların şüpheli derecede yükseldi' diyor ve gözlerini sana dikiyor.",
    minAge: 8, maxAge: 18, difficulty: 2, rarity: 'RARE',
    choices: [
      {
        text: "İnkar et ve sinirlen",
        effect: { discipline: -10, charisma: 5, familyRelation: -5 },
        feedback: "'Bana iftira atamazsınız!' diye çıkıştın. Öğretmen geri adım attı ama artık seni göz hapsinde tutacak."
      },
      {
        text: "Çok çalıştım de",
        reqStats: { charisma: 40 },
        effect: { intelligence: 2, charisma: 2 },
        feedback: "İkna edici bir konuşma yaptın. Şüpheleri dağıttın."
      },
      {
        text: "İtiraf et",
        effect: { discipline: 5 },
        gradeUpdates: { math: -30 },
        feedback: "Dürüstlüğün takdir edildi ama sınavın iptal oldu."
      }
    ]
  },

  // --- CHAIN RESULT: UNI ETHICS ---
  {
    id: 'evt_uni_ethics',
    text: "Üniversite mülakatında Etik Kurul başkanı dosyanı inceliyor. 'Akademik geçmişinde bazı tutarsızlıklar görüyoruz. Baskı altındayken dürüstlüğünü koruyabilir misin?'",
    minAge: 17, maxAge: 18, difficulty: 4, rarity: 'RARE',
    choices: [
      {
        text: "Dürüstçe geçmişi anlat",
        effect: { discipline: 10, intelligence: 5 },
        feedback: "Eski hatalarını ve onlardan aldığın dersleri anlattın. Kurul etkilendi: 'Herkes hata yapar, önemli olan derstir.'"
      },
      {
        text: "Mükemmel öğrenciyi oyna",
        reqStats: { charisma: 70 }, // High charisma needed to lie effectively
        effect: { charisma: 5 },
        feedback: "Profesyonelce yalan söyledin. Mülakatı geçtin ama için hiç rahat değil."
      },
      {
        text: "Panikle ve kekele",
        effect: { health: -10, intelligence: -5 },
        feedback: "Cevap veremedin. Mülakat kötü geçti."
      }
    ]
  },

  {
    id: 'evt_family_conflict_dynamic',
    text: (ctx: EventContext) => {
        const strict = ctx.family?.dynamic === 'STRICT';
        if (ctx.traits.includes('REBELLIOUS')) return `🔥 Baban yine emirler yağdırıyor. ${strict ? 'Sert kuralları canına tak etti!' : 'Söyledikleri mantıklı olsa bile içinden karşı çıkmak geliyor.'}`;
        if (ctx.traits.includes('EMPATHETIC')) return "😔 Baban biraz gergin görünüyor ve sana bağırıyor. Belki de zor bir gün geçirmiştir?";
        return "😠 Baban odanı toplamadığın için sana kızıyor. Sesi epey yüksek.";
    },
    minAge: 10, maxAge: 18, difficulty: 2, tags: ['family'], rarity: 'COMMON', isRepeatable: true,
    choices: [
      {
        id: 'fam_conflict_rebel',
        text: "Kapıyı çarp ve çık",
        effect: { familyRelation: -15, discipline: -5, charisma: 2 },
        feedback: "Evi terk ettin! Özgür hissediyorsun ama geri dönüşün zor olacak.",
        memory: { emotion: 'REGRET', weight: 'MEDIUM' }
      },
      {
        text: "Alttan al",
        effect: { familyRelation: 5, discipline: 2, energy: -5 },
        feedback: "Haklı olsan bile sustun. Ortam yumuşadı."
      }
    ]
  },
  {
    id: 'evt_social_party_dynamic',
    text: (ctx: EventContext) => {
        if (ctx.traits.includes('SOCIAL_BUTTERFLY')) return "✨ Telefonun titredi: Cuma akşamı büyük parti var! Tam senlik, parlayacağın yer!";
        if (ctx.traits.includes('LONE_WOLF')) return "📱 Telefonun titredi: Cuma akşamı parti varmış. Kalabalık, gürültü... Düşüncesi bile yorucu.";
        if (ctx.traits.includes('CHARISMATIC')) return "😎 Arkadaşların seni partiye çağırıyor. Sensiz tadı olmazmış.";
        return "📨 Okul grubundan mesaj geldi. Cuma akşamı bir ev partisi var.";
    },
    minAge: 14, maxAge: 18, difficulty: 1, tags: ['social', 'fun'], rarity: 'COMMON', isRepeatable: true,
    choices: [
      {
        text: "Tabii ki git!",
        effect: { charisma: 10, energy: -20, money: -20 },
        feedback: "Müziğin ritmine kapıldın. Harika bir geceydi."
      },
      {
        text: "Bahane uydur",
        effect: { energy: 10, familyRelation: 2 },
        feedback: "Evde kalıp film izledin. Kafan rahat."
      }
    ]
  },
  {
    id: 'evt_npc_concert',
    text: ({ traits }) => {
        if (traits.includes('MUSIC')) return "Sevgilin {npcName} heyecanla yanına geldi: 'Bu hafta sonu efsane bir grubun konseri var! Müzik zevkine güveniyorum, gidelim mi?'";
        if (traits.includes('LONE_WOLF')) return "Sevgilin {npcName} konserden bahsediyor. Kalabalık, ter, gürültü... İçin daralıyor ama o çok istiyor.";
        return "Sevgilin {npcName} heyecanla yanına geldi: 'Bu hafta sonu en sevdiğim grubun konseri var! Biletler biraz pahalı ama lütfen gidelim!'";
    },
    minAge: 14, maxAge: 18, difficulty: 2, rarity: 'COMMON', isRepeatable: true, tags: ['social', 'emotional'],
    reqNPCRole: 'PARTNER',
    choices: [
      { 
        text: "Gidelim aşkım! (-150 TL)", 
        reqStats: { money: 150 }, 
        effect: { money: -150, energy: -20, charisma: 5 }, 
        npcRelationChange: 15,
        feedback: "{npcName} boynuna sarıldı. Konserde çılgınlar gibi eğlendiniz, harika bir anı oldu.",
        memory: { emotion: 'SATISFACTION', weight: 'HIGH' }
      },
      { 
        text: "Param yok / İstemiyorum", 
        effect: { money: 0 }, 
        npcRelationChange: -20,
        feedback: "{npcName} dudak büktü. 'Tamam, başkasıyla giderim o zaman' dedi. Aranızda soğuk rüzgarlar esiyor.",
        memory: { emotion: 'REGRET', weight: 'MEDIUM' }
      }
    ]
  },
  {
    id: 'evt_pc_istegi',
    text: ({ traits }) => {
        if (traits.includes('GAMER')) return "Eski bilgisayarın artık yeni oyunları kaldırmıyor. FPS dropları canına tak etti. Babana konuyu açma vakti.";
        if (traits.includes('GENIUS')) return "Projelerin ve araştırmaların için daha güçlü bir iş istasyonuna ihtiyacın var. Mevcut bilgisayarın seni yavaşlatıyor.";
        return "Derslerin ve projelerin için bir bilgisayara ihtiyacın var. Konuyu babana açmaya karar verdin.";
    },
    minAge: 7, maxAge: 14, difficulty: 3, rarity: 'COMMON', tags: ['financial', 'academic', 'family'],
    reqNoItem: ['item_pc_basic', 'item_pc_gaming'], 
    choices: [
        {
            text: "Ders çalışacağım söz! (Sadece Orta/Zengin)",
            reqStats: { intelligence: 30 }, 
            reqFamily: { wealth: ['MIDDLE', 'RICH'] },
            effect: { familyRelation: 5, discipline: 5 },
            inventoryAdd: ['item_pc_basic'],
            feedback: "Babana karneni ve çalışma planını gösterdin. İkna oldu! Ertesi gün masanda 'Ofis Bilgisayarı' seni bekliyordu."
        },
        {
            text: "Yarı yarıya ödeyelim? (Sadece Orta/Zengin)",
            reqFamily: { wealth: ['MIDDLE', 'RICH'] },
            effect: { money: 200, familyRelation: 2 },
            feedback: "Baban teklifi makul buldu ve sana 200 TL destek verdi. Üstünü sen tamamlayıp alabilirsin."
        },
        {
            text: "Ben biriktirip alırım (Fakir Aile Seçeneği)",
            reqFamily: { wealth: ['POOR'] },
            effect: { discipline: 15, money: 5 }, 
            feedback: "Babanın gözleri doldu. 'Paramız yok oğlum/kızım, affet' dedi. Gururla 'Ben hallederim' dedin ve sana cebindeki son 5 lirayı verdi.",
            memory: { emotion: 'PRIDE', weight: 'HIGH' }
        },
        {
            text: "Vazgeç",
            effect: { discipline: 2 }, 
            feedback: "Şimdilik bu hayali erteledin."
        }
    ]
  },
  {
    id: 'evt_freelance_deadline',
    text: ({ traits }) => {
        if (traits.includes('PROCRASTINATOR')) return "😱 Eyvah! Freelance işin teslim tarihi YARIN! Yine son dakikaya bıraktın. Müşteri mesaj atıp duruyor.";
        if (traits.includes('DISCIPLINED')) return "📅 Freelance işin teslim tarihi yarın. Planına göre bu gece son rötuşları yapıp bitirmen gerekiyor. Biraz yorucu olacak.";
        return "Freelance aldığın bir işin teslim tarihi yarın! Müşteri çok sinirli. Sabaha kadar çalışman gerekiyor.";
    },
    minAge: 12, maxAge: 18, difficulty: 4, rarity: 'COMMON', tags: ['career', 'academic'],
    reqSkills: { coding: 30 }, 
    choices: [
        {
            text: "Sabahla ve bitir",
            effect: { money: 300, energy: -90, health: -10 },
            skillUpdates: { coding: 2 },
            feedback: "Gözlerin kan çanağına döndü, enerjin bitti ama işi teslim ettin ve iyi para kazandın. (O tur başka bir şey yapamadın)",
            memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' }
        },
        {
            text: "İşi iptal et",
            effect: { money: -50, charisma: -10 },
            feedback: "Müşteriye yapamayacağını söyledin. Kapora yandı ve itibarın zedelendi.",
            memory: { emotion: 'GUILT', weight: 'MEDIUM' }
        }
    ]
  },
  {
    id: 'evt_found_money',
    text: "Okul dönüşü yolda yürürken yerde parlayan bir şey gördün. Bu bir 50 TL!",
    minAge: 7, maxAge: 18, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    choices: [
        {
            text: "Cebine at",
            effect: { money: 50 },
            feedback: "Bugün şanslı günündesin!"
        },
        {
            text: "Görmezden gel",
            effect: { discipline: 2 },
            feedback: "Belki sahibi geri döner diye dokunmadın."
        }
    ]
  },
  {
    id: 'evt_stray_cat',
    text: "Kapının önünde sırılsıklam olmuş yavru bir kedi miyavlıyor.",
    minAge: 5, maxAge: 18, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    choices: [
        {
            text: "Besle ve sev",
            effect: { health: 5, money: -10, charisma: 2 },
            feedback: "Kediye biraz süt ve mama verdin. Sana sürtünüp mırıldandı."
        },
        {
            text: "Eve al",
            reqFamily: { dynamic: ['SUPPORTIVE', 'CHAOTIC'] }, // Strict parents won't allow
            effect: { familyRelation: -5, health: 10 },
            feedback: "Ailen önce kızdı ama sonra onlar da sevdi. Artık bir kedin var!",
            memory: { emotion: 'SATISFACTION', weight: 'HIGH' }
        }
    ]
  },

  // --- CHAIN START: BURNOUT ---
  {
    id: 'evt_overwork_warning',
    text: "Son günlerde gözlerin kararıyor ve sürekli başın ağrıyor. Vücudun sana 'Dur artık' diye bağırıyor. Ama yapacak çok işin var.",
    minAge: 14, maxAge: 18, difficulty: 2, rarity: 'COMMON',
    reqStats: { energy: 30 }, // Only appears if energy is somewhat low (but Logic usually filters based on low stats anyway)
    choices: [
        {
            id: 'ignore_warning',
            text: "Devam et (Uyarıyı yoksay)",
            effect: { intelligence: 5, health: -15, energy: -20 },
            feedback: "Bir kahve daha içip çalışmaya devam ettin. Verimli geçti ama kalbin tekliyor gibi.",
            futureEvents: [
                { trigger: 'TURNS', turnsLater: 2, eventId: 'evt_burnout_crisis', priority: 'HIGH' }
            ]
        },
        {
            id: 'rest',
            text: "Her şeyi bırak ve uyu",
            effect: { energy: 40, health: 10, intelligence: -2 },
            feedback: "Dünya yıkılsa umrunda değil. Deliksiz bir uyku çektin."
        }
    ]
  },

  // --- CHAIN RESULT: BURNOUT CRISIS ---
  {
    id: 'evt_burnout_crisis',
    text: "TÜKENMİŞLİK KRİZİ! Sabah yataktan kalkmaya çalıştın ama bacakların seni taşımadı. Gözlerin karardı ve yere yığıldın.",
    minAge: 14, maxAge: 18, difficulty: 5, rarity: 'RARE',
    choices: [
        {
            text: "Hastaneye git ve tedavi ol",
            effect: { health: 20, energy: 20, intelligence: -10, money: -100 },
            feedback: "Doktor 'Aşırı stres ve yorgunluk' dedi. Bir süre derslerden ve işlerden uzak kalmak zorundasın. (Zeka ve Para kaybı)"
        }
    ]
  },

  // =================================================================
  // MILESTONE EVENTS (KADER MATRİSİ)
  // =================================================================
  {
    id: 'ms_age5_share',
    text: "Anaokulunda herkes aynı oyuncağı istiyor. Elindeki tek oyuncağı ne yapacaksın?",
    minAge: 5, maxAge: 5, difficulty: 1, rarity: 'RARE', isRepeatable: false,
    milestoneLevel: 'MINOR',
    choices: [
      {
        text: "Cömertçe paylaş",
        effect: { charisma: 5, familyRelation: 2 },
        grantTraits: ['EMPATHETIC'],
        feedback: "Paylaşınca herkes mutlu oldu. Küçük kalbin büyüdü."
      },
      {
        text: "Sadece kendin al",
        effect: { intelligence: 2, discipline: -2 },
        grantTraits: ['LONE_WOLF'],
        feedback: "Oyuncağı kimseye vermedin. Bağımsızlık hoşuna gidiyor."
      },
      {
        text: "Liderlik tasla",
        effect: { charisma: 3, discipline: 2 },
        grantTraits: ['BRAVE'],
        feedback: "Herkesi organize ettin. Sesin duyuldu."
      }
    ]
  },
  {
    id: 'ms_age9_bully',
    text: "Okulda zorbalığa uğruyorsun. Bu an kişiliğini şekillendirecek bir eşik.",
    minAge: 9, maxAge: 9, difficulty: 2, rarity: 'RARE', isRepeatable: false,
    milestoneLevel: 'MINOR',
    choices: [
      {
        text: "Karşı çık / dövüş",
        effect: { health: -5, discipline: 3, charisma: 4 },
        grantTraits: ['BRAVE'],
        feedback: "Cesaretinle dikkat çektin. Bedeli oldu ama geri adım atmadın."
      },
      {
        text: "Alttan al / sessiz kal",
        effect: { charisma: -3, intelligence: 2 },
        grantTraits: ['COWARD'],
        feedback: "Kendini korudun ama içten içe küçüldün."
      },
      {
        text: "Şikayet et (yetişkin)",
        effect: { discipline: 4, intelligence: 2 },
        grantTraits: ['DISCIPLINED'],
        feedback: "Sorunu büyüklerin çözmesini istedin. Kurallar seni korudu."
      }
    ]
  },
  {
    id: 'ms_age11_hobby',
    text: "Bir hobi seni çağırıyor. Hangisine tüm kalbini vereceksin?",
    minAge: 11, maxAge: 11, difficulty: 2, rarity: 'RARE', isRepeatable: false,
    milestoneLevel: 'MINOR',
    choices: [
      {
        text: "Ekran başı (Yazılım)",
        effect: { intelligence: 5, discipline: 1 },
        skillUpdates: { coding: 4 },
        grantTraits: ['GAMER'],
        feedback: "Kodlar dünyasında yeni bir kapı açıldı."
      },
      {
        text: "Sahada spor (Fizik)",
        effect: { health: 5, discipline: 2 },
        skillUpdates: { sports: 4 },
        feedback: "Terledikçe güçlendin. Vücudun konuşuyor."
      },
      {
        text: "Enstrüman (Sanat)",
        effect: { charisma: 3, intelligence: 1 },
        skillUpdates: { music: 4 },
        feedback: "Notalar sana ait bir dil oldu."
      }
    ]
  },
  {
    id: 'ms_age14_firstlove',
    text: "Mezuniyet balosu yaklaşıyor. İlk aşkın kalbini hızlandırıyor. Ne yapacaksın?",
    minAge: 14, maxAge: 14, difficulty: 2, rarity: 'RARE', isRepeatable: false,
    milestoneLevel: 'MINOR',
    choices: [
      {
        text: "İlan-ı aşk et",
        effect: { charisma: 6, discipline: -1 },
        feedback: "Cesaretin konuştu. Kalbinin sesini dinledin."
      },
      {
        text: "Cool / uzak dur",
        effect: { discipline: 3, charisma: -2 },
        feedback: "Duygularını sakladın. Güçlü görünmek güven verdi."
      },
      {
        text: "Arkadaş kal",
        effect: { charisma: 2, intelligence: 1 },
        feedback: "Sınırlarını korudun. Güvenli bir yol seçtin."
      }
    ]
  },
  {
    id: 'ms_age15_highschool',
    text: "Lise tercihin geleceğini şekillendirecek. Hangi yola gireceksin?",
    minAge: 15, maxAge: 15, difficulty: 3, rarity: 'RARE', isRepeatable: false,
    milestoneLevel: 'MAJOR',
    choices: [
      {
        text: "Fen Lisesi (Akademik)",
        icon: 'atom',
        effect: { intelligence: 8, discipline: 4 },
        skillUpdates: { coding: 2 },
        feedback: "Bilim ve disiplin seni çağırıyor."
      },
      {
        text: "Meslek Lisesi (Zanaat)",
        icon: 'wrench',
        effect: { discipline: 6, money: 5 },
        skillUpdates: { design: 2 },
        feedback: "Ellerinle üretmek seni güçlendiriyor."
      },
      {
        text: "Özel Kolej (Networking)",
        icon: 'users',
        effect: { charisma: 10, intelligence: 2 },
        feedback: "Doğru çevre, geleceğin anahtarı olabilir."
      },
      {
        text: "Sanat / Spor Lisesi",
        icon: 'palette',
        effect: { health: 4, charisma: 6 },
        skillUpdates: { music: 2, sports: 2 },
        feedback: "Yeteneklerin sahneye çıkıyor."
      }
    ]
  },
  {
    id: 'ms_age16_crime',
    text: "Bir grup sana yasadışı iş teklif ediyor. Bu karar seni bambaşka bir yola sokabilir.",
    minAge: 16, maxAge: 16, difficulty: 3, rarity: 'RARE', isRepeatable: false,
    milestoneLevel: 'MINOR',
    choices: [
      {
        text: "Kesin reddet",
        effect: { discipline: 6, health: 2 },
        grantTraits: ['DISCIPLINED'],
        feedback: "Hayır demek kolay değildi ama doğru hissettin."
      },
      {
        text: "Gruba katıl",
        effect: { money: 50, discipline: -8, health: -3 },
        grantTraits: ['REBELLIOUS'],
        feedback: "Tehlikeli bir yola adım attın."
      },
      {
        text: "İhbar et",
        effect: { discipline: 4, charisma: -2 },
        grantTraits: ['EMPATHETIC'],
        feedback: "Toplumu korumayı seçtin, ama bedeli var."
      },
      {
        text: "Aracı / haberci ol",
        effect: { money: 20, intelligence: 3, discipline: -3 },
        grantTraits: ['PRAGMATIC'],
        feedback: "Riskli ama kurnaz bir yol tuttun."
      }
    ]
  },
  {
    id: 'ms_age17_parttime',
    text: "Yarı zamanlı iş zamanı. Hayatın gerçek yüzüyle tanışıyorsun.",
    minAge: 17, maxAge: 17, difficulty: 2, rarity: 'RARE', isRepeatable: false,
    milestoneLevel: 'MINOR',
    choices: [
      {
        text: "Garsonluk (Zor yol)",
        effect: { money: 60, health: -2, discipline: 2 },
        feedback: "Ayakta geçen uzun saatler seni sertleştirdi."
      },
      {
        text: "Aile şirketi (Hazır)",
        effect: { money: 40, familyRelation: 6 },
        feedback: "Ailenin desteğiyle güvenli ilerliyorsun."
      },
      {
        text: "Freelance (Bireysel)",
        effect: { money: 50, intelligence: 3 },
        skillUpdates: { coding: 2, design: 1 },
        feedback: "Kendi emeğinle kazandın."
      }
    ]
  },
  {
    id: 'ms_age18_final',
    text: "18 yaş finali. Şimdi vereceğin karar geleceğini mühürleyecek.",
    minAge: 18, maxAge: 18, difficulty: 4, rarity: 'RARE', isRepeatable: false,
    milestoneLevel: 'MAJOR',
    choices: [
      {
        text: "Hayaller (Risk)",
        icon: 'star',
        effect: { charisma: 8, intelligence: 4, money: -20 },
        grantTraits: ['BRAVE'],
        skillUpdates: { design: 2 },
        feedback: "Risk aldın. Yolun parlak ama belirsiz."
      },
      {
        text: "Mantık (Garanti)",
        icon: 'shieldCheck',
        effect: { discipline: 8, money: 30, intelligence: 2 },
        grantTraits: ['PRAGMATIC'],
        feedback: "Güvenli bir yol seçtin. İstikrar seninle."
      },
      {
        text: "Girişimcilik (Özgür)",
        icon: 'rocket',
        effect: { charisma: 6, money: 40, discipline: -2 },
        skillUpdates: { coding: 2, design: 2 },
        feedback: "Kendi yolunu çizdin. Yüksek risk, yüksek ödül."
      },
      {
        text: "Akademik Sabatikal",
        icon: 'bookOpen',
        effect: { intelligence: 10, discipline: 4, money: -10 },
        grantTraits: ['ORGANIZED'],
        feedback: "Bilgiye adandın. Derinleşme zamanı."
      }
    ]
  }
];

export const FALLBACK_EVENT: GameEvent = {
  id: 'fallback_generic',
  text: "Bugün sıradan bir gündü. Kayda değer bir şey olmadı.",
  minAge: 0, maxAge: 100, difficulty: 1, rarity: 'COMMON',
  choices: [
    { text: "Günü bitir", effect: { energy: 5 }, feedback: "Bazen olaysız günler en iyisidir." }
  ]
};
