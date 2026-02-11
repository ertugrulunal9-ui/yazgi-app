
import { GameEvent, EventContext } from '../types';

// =================================================================
// KİŞİLİK ODAKLI EVENTLER
// Her event bir kişilik eksenini test eder
// PASSIVE = Kişiliğe uygun, rahat seçim (düşük büyüme, düşük stres)
// CHALLENGE = Kişiliğe ters, zor seçim (yüksek büyüme, yüksek stres)
// =================================================================

export const PERSONALITY_EVENTS: GameEvent[] = [

  // =================================================================
  // OPENNESS (İÇE/DIŞA DÖNÜKLÜK) TEST EVENTLERİ
  // =================================================================

  {
    id: 'pers_sosyal_davet',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.openness < 30) {
        return "Sınıftan biri doğum günü partisine çağırdı. Miğden bulanıyor. Kalabalık, gürültü, tanımadığın insanlar... Ama gitmezsen 'antisosyal' damgası yersin.";
      } else if (p.openness > 70) {
        return "Sınıftan biri doğum günü partisine çağırdı! Sonunda! Yeni insanlarla tanışmak, dans etmek, gece boyu eğlenmek... Hemen ne giyeceğimi düşünmeliyim!";
      }
      return "Sınıftan biri doğum günü partisine çağırdı. Gitmek mi, kalmak mı? İkisi de makul görünüyor.";
    },
    minAge: 10, maxAge: 18, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'go_party_introvert',
        text: "Git ve sosyalleş (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 40 }], // Sadece içe kapanıklara göster
        effect: { charisma: 8, energy: -30, health: -5 },
        personalityEffects: [
          { axis: 'openness', change: 5 }, // İçe kapanık biraz açılır
        ],
        stressEffect: 25, // Yüksek stres
        feedback: "Gittin. Her dakika işkence gibiydi. Köşede durdun, zoraki gülümsedin. Ama... birkaç kişiyle konuştun. Belki o kadar da kötü değildi?",
        dynamicFeedback: {
          introvert: "Partiden çıktığında derin bir nefes aldın. Hayatta kaldın! Ve aslında... iki kişiyle gerçek bir sohbet ettin.",
        },
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Konfor alanından çıktın' },
      },
      {
        id: 'stay_home_introvert',
        text: "Evde kal (Rahat seçim)",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { energy: 20, charisma: -5 },
        personalityEffects: [
          { axis: 'openness', change: -2 }, // Biraz daha içe kapanır
        ],
        stressEffect: -10, // Stres azalır
        feedback: "Bahaneler uydurdun ve evde kaldın. Rahat bir gece geçirdin. Ama partinin fotoğraflarını görünce içinde bir şey sızladı.",
        memory: { emotion: 'REGRET', weight: 'LOW', customNote: 'Kaçırdın mı acaba?' },
      },
      {
        id: 'go_party_extrovert',
        text: "Tabii ki git!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', min: 60 }], // Sadece dışa dönüklere göster
        effect: { charisma: 10, energy: -20, money: -30 },
        stressEffect: -5, // Stres azalır, bu onun doğal ortamı
        feedback: "Parti muhteşemdi! Herkes seninle konuşmak istiyordu. Yeni numaralar aldın, dans ettin, gece yarısına kadar kaldın!",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: 'skip_party_extrovert',
        text: "Bu sefer pas (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', min: 60 }],
        effect: { energy: 15, discipline: 5, charisma: -8 },
        personalityEffects: [
          { axis: 'patience', change: 3 }, // Sabır gelişir
        ],
        stressEffect: 15, // FOMO stresi
        feedback: "Evde kaldın. Sürekli telefonu kontrol ettin. Herkes eğlenirken sen... bekledin. Ama yarınki sınava hazırsın.",
        memory: { emotion: 'REGRET', weight: 'LOW' },
      },
      {
        id: 'go_party_neutral',
        text: "Gideyim biraz",
        choiceType: 'NEUTRAL',
        reqPersonality: [{ axis: 'openness', min: 35, max: 65 }],
        effect: { charisma: 5, energy: -15 },
        stressEffect: 5,
        feedback: "Gidip bir saat takıldın, sonra sessizce ayrıldın. Ne çok sosyalleştin ne de kaçırdın. Dengeli bir gece.",
      },
    ],
  },

  {
    id: 'pers_sinif_sunumu',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.openness < 30) {
        return "Öğretmen 'Yarın herkes sunum yapacak' dedi. Kalbin durdu. 30 çift göz sana bakacak. Sesini duyacaklar. Yanlış bir şey söylersen...";
      } else if (p.openness > 70) {
        return "Öğretmen 'Yarın herkes sunum yapacak' dedi. Sonunda! Sahne senin. Hazırladığın sunumu herkese gösterme vakti!";
      }
      return "Öğretmen 'Yarın herkes sunum yapacak' dedi. Biraz gerginsin ama hazırlanırsan iyi geçer.";
    },
    minAge: 10, maxAge: 18, difficulty: 3, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'presentation_brave',
        text: "Hazırlan ve parlak bir sunum yap",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { intelligence: 5, charisma: 10, energy: -25 },
        personalityEffects: [
          { axis: 'openness', change: 8 },
          { axis: 'courage', change: 5 },
        ],
        stressEffect: 30,
        gradeUpdates: { language: 10 },
        feedback: "Ellerin titredi, sesin kısıldı başta. Ama devam ettin. Bitirdiğinde alkış koptu. 'Vay, konuşabiliyor!' diye fısıldaştılar.",
        dynamicFeedback: {
          introvert: "Yerine oturduğunda bacakların titriyordu. Ama başardın. BU SEN MIYDIN?",
        },
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Korkunu yendin' },
        grantTraits: ['BRAVE'],
      },
      {
        id: 'presentation_avoid',
        text: "Hasta numarası yap / Kaç",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { discipline: -10, charisma: -5, health: 5 },
        personalityEffects: [
          { axis: 'openness', change: -5 },
          { axis: 'courage', change: -3 },
        ],
        stressEffect: -15,
        gradeUpdates: { language: -15 },
        feedback: "O gün okula gitmedin. Karnın ağrıyordu (gerçekten mi?). Sunum ertelendi ama... bir gün yine yapman gerekecek.",
        memory: { emotion: 'GUILT', weight: 'MEDIUM', customNote: 'Kaçtın' },
      },
      {
        id: 'presentation_extrovert',
        text: "Sahneye çık ve gösterisini yap!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', min: 60 }],
        effect: { charisma: 15, intelligence: 3, energy: -15 },
        gradeUpdates: { language: 15 },
        feedback: "Muhteşem bir performans! Espri yaptın, sınıf güldü, öğretmen etkilendi. Bu senin doğal ortamın.",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
    ],
  },

  // =================================================================
  // COURAGE (CESARET/TEMKİN) TEST EVENTLERİ
  // =================================================================

  {
    id: 'pers_tehlikeli_teklif',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.courage < 30) {
        return "Arkadaşların inşaat halindeki binaya girmeyi planlıyor. 'Hadi, korkaklık yapma!' diyorlar. İçinden alarm çanları çalıyor. Ya bir şey olursa?";
      } else if (p.courage > 70) {
        return "Arkadaşların inşaat halindeki binaya girmeyi planlıyor. Mükemmel! Macera zamanı! Yukarıdan manzara efsane olmalı!";
      }
      return "Arkadaşların inşaat halindeki binaya girmeyi planlıyor. Riskli ama heyecanlı görünüyor.";
    },
    minAge: 12, maxAge: 18, difficulty: 4, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'RISK',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'risk_take_cautious',
        text: "Git, korkunu yen (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 40 }],
        effect: { health: -10, charisma: 10 },
        personalityEffects: [
          { axis: 'courage', change: 10 },
        ],
        stressEffect: 35,
        feedback: "Her adımda 'geri dön' diye düşündün. Ama çatıya çıktığında... şehir ayaklarının altındaydı. Korkutucu ama muhteşem.",
        dynamicFeedback: {
          cautious: "Ellerin terlemişti, dizlerin titriyordu. Ama başardın. Belki her risk ölümcül değilmiş.",
        },
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Risk aldın ve kazandın' },
      },
      {
        id: 'risk_refuse_cautious',
        text: "Hayır de, mantıklı ol (Rahat seçim)",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'courage', max: 40 }],
        effect: { discipline: 10, charisma: -10, health: 5 },
        personalityEffects: [
          { axis: 'courage', change: -3 },
        ],
        stressEffect: -5,
        feedback: "'Korkak' dediler ve gittiler. Evde kaldın. Güvendesin. Ama... her zaman güvende olmak yaşamak mı?",
        memory: { emotion: 'NEUTRAL', weight: 'LOW' },
      },
      {
        id: 'risk_take_brave',
        text: "Hadi gidelim!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'courage', min: 60 }],
        effect: { charisma: 10, health: -5, discipline: -5 },
        stressEffect: 5,
        feedback: "Efsane bir macera! Çatıda selfie çektiniz, hikayeler anlattınız. Hayat böyle yaşanır!",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 5, eventId: 'pers_risk_consequence', priority: 'NORMAL' }
        ],
      },
      {
        id: 'risk_refuse_brave',
        text: "Bu sefer pas (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', min: 60 }],
        effect: { discipline: 8, charisma: -5 },
        personalityEffects: [
          { axis: 'patience', change: 5 },
        ],
        stressEffect: 10,
        feedback: "İçinden 'git' diye bağırıyordu ama dururdun kendini. Bazen en cesur şey hayır demektir.",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'pers_risk_consequence',
    text: "Hatırlıyor musun o inşaata girdiğinizi? Birisi polise şikayet etmiş. İsimler soruluyor.",
    minAge: 12, maxAge: 18, difficulty: 3, rarity: 'RARE',
    choices: [
      {
        text: "İtiraf et",
        effect: { discipline: 10, familyRelation: -15, charisma: -5 },
        feedback: "Doğruyu söyledin. Ceza aldın ama vicdan rahat.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
      {
        text: "İnkar et",
        effect: { discipline: -10, charisma: 5 },
        personalityEffects: [{ axis: 'empathy', change: -5 }],
        feedback: "Kimse kanıtlayamadı. Ama şimdi bir sır taşıyorsun.",
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
      },
    ],
  },

  // =================================================================
  // EMPATHY (VİCDAN/BENCİLLİK) TEST EVENTLERİ
  // =================================================================

  {
    id: 'pers_dilenci_cocuk',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Sokakta küçük bir çocuk mendil satıyor. Gözleri yorgun, elleri kirli. Yanından geçerken sana baktı. Kalbinde bir şey kırıldı.";
      } else if (p.empathy < 30) {
        return "Sokakta yine bir dilenci. Muhtemelen organize işler. Herkes kandırmaya çalışıyor.";
      }
      return "Sokakta küçük bir çocuk mendil satıyor. Durmalı mısın, geçmeli misin?";
    },
    minAge: 8, maxAge: 18, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'help_empath',
        text: "Dur ve yardım et",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', min: 60 }],
        effect: { money: -20, charisma: 5 },
        stressEffect: -5,
        feedback: "Mendil aldın, biraz sohbet ettin. Çocuk gülümsedi. Belki dünyayı değiştirmedin ama bir anı güzelleştirdin.",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: 'ignore_empath',
        text: "Geç, yapabileceğin bir şey yok (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', min: 60 }],
        effect: { discipline: 5 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: 15,
        feedback: "Geçtin ama o gözler aklından çıkmadı. Gece yatakta düşündün. Neden durmsadın?",
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
      },
      {
        id: 'ignore_selfish',
        text: "Geç, senin sorunun değil",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', max: 40 }],
        effect: { energy: 5 },
        stressEffect: 0,
        feedback: "Devam ettin. Herkesin kendi derdi var. Sen de kendi hayatını yaşıyorsun.",
        memory: { emotion: 'NEUTRAL', weight: 'LOW' },
      },
      {
        id: 'help_selfish',
        text: "Dur ve bir şey al (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 40 }],
        effect: { money: -10, charisma: 3 },
        personalityEffects: [{ axis: 'empathy', change: 5 }],
        stressEffect: 5,
        feedback: "Neden durduğunu bilmiyorsun. Mendil aldın. Çocuk 'teşekkürler' dedi. Garip bir sıcaklık hissettin.",
        memory: { emotion: 'SATISFACTION', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'pers_kopya_verme',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Sınavda yanındaki çaresizce sana bakıyor. Yardım istemeye cesaret edemiyor ama gözleri yalvarıyor. Cevapları biliyorsun...";
      } else if (p.empathy < 30) {
        return "Sınavda yanındaki kağıdına bakıyor. Kendi çalışsaydı. Senin emeğini çalmasına izin mi vereceksin?";
      }
      return "Sınavda yanındaki kopya çekmek istiyor. Ne yapacaksın?";
    },
    minAge: 10, maxAge: 18, difficulty: 3, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'give_copy_empath',
        text: "Kağıdını aç, görsün",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', min: 60 }],
        effect: { charisma: 5, discipline: -10 },
        stressEffect: 10,
        feedback: "Kağıdını hafifçe açtın. Gördü ve rahatladı. Öğretmen fark etmedi... bu sefer. Ama ya yakalansaydın?",
        memory: { emotion: 'GUILT', weight: 'LOW' },
      },
      {
        id: 'refuse_copy_empath',
        text: "Hayır, risk alamam (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', min: 60 }],
        effect: { discipline: 10, charisma: -5 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: 15,
        feedback: "Başını çevirdin. Yanındaki hayal kırıklığı içinde kaldı. Doğru olanı yaptın ama... içinde bir şey acıdı.",
        memory: { emotion: 'REGRET', weight: 'LOW' },
      },
      {
        id: 'refuse_copy_selfish',
        text: "Kendi kağıdını kapa",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', max: 40 }],
        effect: { discipline: 10, intelligence: 2, charisma: -8 },
        stressEffect: 0,
        feedback: "Kağıdını kapattın ve konsantre oldun. Senin emeğin, senin notun. Adil olan bu.",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'give_copy_selfish',
        text: "Tamam ama borcunu öde (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 40 }],
        effect: { money: 20, discipline: -5, charisma: 3 },
        personalityEffects: [{ axis: 'empathy', change: 2 }],
        stressEffect: 5,
        feedback: "Fısıldadın: 'Teneffüste 20 lira.' Kabul etti. İş tamam. Yardım ettin... bir nevi.",
        memory: { emotion: 'NEUTRAL', weight: 'LOW' },
      },
    ],
  },

  // =================================================================
  // PATIENCE (SABIR/DÜRTÜSELLIK) TEST EVENTLERİ
  // =================================================================

  {
    id: 'pers_uzun_kuyruk',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.patience < 30) {
        return "Kantinde kuyruk inanılmaz uzun. 15 dakika beklemelisin. Her saniye eziyetgibi. İnsanlar neden bu kadar yavaş?!";
      } else if (p.patience > 70) {
        return "Kantinde kuyruk uzun. Beklerken düşünmeye vakit var. Belki yanındakiyle sohbet edersin.";
      }
      return "Kantinde uzun bir kuyruk var. Beklemeli misin?";
    },
    minAge: 8, maxAge: 18, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'GROWTH',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'wait_impatient',
        text: "Dişini sık ve bekle (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 40 }],
        effect: { discipline: 8, energy: -10 },
        personalityEffects: [{ axis: 'patience', change: 5 }],
        stressEffect: 15,
        feedback: "Her dakika bir saat gibi geçti. Ama bekledin. Sonunda sıra sana geldi. Belki sabır öğrenilebilir bir şeydir.",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'skip_impatient',
        text: "Sıradan atla / Vazgeç",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'patience', max: 40 }],
        effect: { discipline: -5, charisma: -3, energy: 5 },
        stressEffect: -5,
        feedback: "Ya araya girdin ya da vazgeçtin. Zaman kazandın ama birinin hakkını yedin veya aç kaldın.",
        personalityEffects: [{ axis: 'patience', change: -2 }],
      },
      {
        id: 'wait_patient',
        text: "Bekle, acele yok",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'patience', min: 60 }],
        effect: { discipline: 3, charisma: 3 },
        stressEffect: 0,
        feedback: "Beklerken müzik dinledin, etrafı izledin. Zaman geçti, sıra geldi. Hayat bu kadar basit.",
        memory: { emotion: 'NEUTRAL', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'pers_ani_firsat',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.patience < 30) {
        return "Arkadaşın 'Şu an gel, konser bedava!' diye aradı. Yarın sınavın var ama... BU FIRSAT BİR DAHA GELMEZ!";
      } else if (p.patience > 70) {
        return "Arkadaşın 'Şu an gel, konser bedava!' diye aradı. Yarın sınavın var. Öncelikler belli.";
      }
      return "Arkadaşın 'Şu an gel, konser bedava!' diye aradı. Yarın sınavın var. Ne yapacaksın?";
    },
    minAge: 14, maxAge: 18, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'GROWTH',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'go_concert_impulsive',
        text: "Hemen git! YOLO!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'patience', max: 40 }],
        effect: { charisma: 10, energy: -30, discipline: -15 },
        gradeUpdates: { math: -10, science: -10 },
        personalityEffects: [{ axis: 'patience', change: -3 }],
        stressEffect: -10,
        feedback: "Konser muhteşemdi! Sabaha kadar eğlendin. Ama sınav... felaket geçti. Değdi mi? O an değdi.",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: 'study_impulsive',
        text: "Hayır, sınav önemli (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 40 }],
        effect: { discipline: 15, intelligence: 5, charisma: -5 },
        gradeUpdates: { math: 10, science: 10 },
        personalityEffects: [{ axis: 'patience', change: 8 }],
        stressEffect: 20,
        feedback: "Telefonu kapattın ve ders çalıştın. Konser fotoğraflarını görünce içinde bir şey koptu. Ama not yüksek geldi.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Dürtülerine karşı koydun' },
        grantTraits: ['DISCIPLINED'],
      },
      {
        id: 'study_patient',
        text: "Sınav önce",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'patience', min: 60 }],
        effect: { discipline: 10, intelligence: 3 },
        gradeUpdates: { math: 8, science: 8 },
        stressEffect: 5,
        feedback: "Rahat bir kararla ders çalıştın. Konser kaçtı ama gelecekte daha çok fırsat olacak.",
        memory: { emotion: 'NEUTRAL', weight: 'LOW' },
      },
    ],
  },

  // =================================================================
  // CONFORMITY (UYUM/İSYAN) TEST EVENTLERİ
  // =================================================================

  {
    id: 'pers_kural_ihlali',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.conformity > 70) {
        return "Öğretmen sınıfı terk etti. Herkes gürültü yapıyor, kural ihlali var. İçinden 'yanlış!' diye bağırıyor. Ama müdahale edersen 'yalaka' olursun.";
      } else if (p.conformity < 30) {
        return "Öğretmen sınıfı terk etti. Özgürlük! Herkes eğleniyor. Neden sen katılmayasın?";
      }
      return "Öğretmen sınıfı terk etti. Herkes gürültü yapıyor. Ne yapacaksın?";
    },
    minAge: 8, maxAge: 18, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'enforce_rules_conformist',
        text: "Sessiz ol de, kural kural",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', min: 60 }],
        effect: { discipline: 8, charisma: -10 },
        stressEffect: 5,
        feedback: "Herkes sana ters ters baktı. 'Müdür müsün sen?' dediler. Ama içinden kurallar senin için önemli.",
        memory: { emotion: 'NEUTRAL', weight: 'LOW' },
      },
      {
        id: 'join_chaos_conformist',
        text: "Bu sefer katıl (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'conformity', min: 60 }],
        effect: { charisma: 8, discipline: -10 },
        personalityEffects: [{ axis: 'conformity', change: -5 }],
        stressEffect: 15,
        feedback: "Katıldın ve... eğlendin. Kuralları çiğnemek bu kadar iyi hissettirmemeli değil mi? Kafan karışık.",
        memory: { emotion: 'GUILT', weight: 'LOW' },
      },
      {
        id: 'join_chaos_rebel',
        text: "Partiye katıl!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', max: 40 }],
        effect: { charisma: 10, discipline: -5 },
        stressEffect: -5,
        feedback: "En çok gürültüyü sen yaptın. Özgürlük güzel! Kurallar... kim takar?",
        memory: { emotion: 'SATISFACTION', weight: 'LOW' },
      },
      {
        id: 'stay_quiet_rebel',
        text: "Kendi halinde kal (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'conformity', max: 40 }],
        effect: { discipline: 8, intelligence: 3 },
        personalityEffects: [{ axis: 'conformity', change: 5 }],
        stressEffect: 10,
        feedback: "Katılmadın. Neden bilmiyorsun. Belki her isyana katılmak zorunda değilsin.",
        memory: { emotion: 'NEUTRAL', weight: 'LOW' },
      },
    ],
  },

  // =================================================================
  // STRES / BREAKDOWN EVENTLERİ
  // =================================================================

  {
    id: 'pers_breakdown_warning',
    text: (ctx: EventContext) => {
      const archetype = ctx.personality.openness < 40 ? 'içe kapanık' : ctx.personality.courage > 60 ? 'hırslı' : 'normal';
      return `Son günlerde çok yıprandın. Uyuyamıyorsun, iştahın yok. ${archetype === 'içe kapanık' ? 'İnsanlardan tamamen kaçıyorsun.' : 'Her şeye sinirleniyorsun.'} Bir şeyler değişmeli.`;
    },
    minAge: 12, maxAge: 18, difficulty: 4, rarity: 'UNCOMMON',
    reqStress: { min: 60 }, // Sadece stres yüksekken tetiklenir
    personalityCategory: 'BREAKDOWN',
    choices: [
      {
        text: "Yardım iste (aile/arkadaş)",
        effect: { health: 15, familyRelation: 10, energy: 20 },
        personalityEffects: [{ axis: 'openness', change: 5 }],
        stressEffect: -30,
        feedback: "Birine açıldın. Ağladın belki. Ama yük hafiflerdi. Yalnız değilsin.",
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Yardım istedin' },
      },
      {
        text: "Kendi başına çöz",
        effect: { discipline: 10, health: -10, energy: -20 },
        personalityEffects: [{ axis: 'patience', change: 3 }],
        stressEffect: -10,
        feedback: "Dişini sıktın ve devam ettin. Güçlü görünüyorsun ama... ne kadar daha dayanabilirsin?",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 8, eventId: 'pers_breakdown_crisis', priority: 'HIGH' }
        ],
      },
    ],
  },

  {
    id: 'pers_breakdown_crisis',
    text: "PATLAMA. Bugün her şey çok fazla oldu. Gözyaşları, öfke, çaresizlik... Vücudun 'dur' diyor.",
    minAge: 12, maxAge: 18, difficulty: 5, rarity: 'RARE',
    reqStress: { min: 80 },
    personalityCategory: 'BREAKDOWN',
    choices: [
      {
        text: "Tamamen çök ve dinlen",
        effect: { health: 20, intelligence: -5, energy: 30 },
        stressEffect: -50,
        feedback: "Bir gün hiçbir şey yapmadın. Sadece yattın. Dünya dönmeye devam etti. Belki her şey o kadar acil değildi.",
        memory: { emotion: 'NEUTRAL', weight: 'HIGH', customNote: 'Tükenmişlik krizi geçirdin' },
      },
      {
        text: "Zorla devam et",
        effect: { discipline: 5, health: -25, energy: -30 },
        stressEffect: 20,
        feedback: "Devam ettin. Robotik hareketlerle. Kimse fark etmedi. Ama içindeki bir şey kırıldı.",
        memory: { emotion: 'REGRET', weight: 'HIGH' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 5, eventId: 'pers_hospital_stress', priority: 'HIGH' }
        ],
      },
    ],
  },

  {
    id: 'pers_hospital_stress',
    text: "Sabah kalkmaya çalıştın ama vücudun izin vermedi. Ailenne haber verdin. Hastanedesin. Doktor 'aşırı stres ve tükenmişlik' diyor.",
    minAge: 12, maxAge: 18, difficulty: 5, rarity: 'RARE',
    personalityCategory: 'BREAKDOWN',
    choices: [
      {
        text: "Tedaviyi kabul et",
        effect: { health: 30, intelligence: -10, money: -200, energy: 40 },
        stressEffect: -60,
        feedback: "Birkaç gün hastanede kaldın. İlaçlar, terapi, dinlenme. Yavaş yavaş toparlanıyorsun. Hayat hız değilmiş.",
        memory: { emotion: 'NEUTRAL', weight: 'HIGH' },
        personalityEffects: [
          { axis: 'patience', change: 10 },
        ],
      },
    ],
  },

  // =================================================================
  // KARMA / SONUÇ EVENTLERİ
  // =================================================================

  {
    id: 'pers_personality_reflection',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      const archetype =
        p.openness < 35 ? 'içe kapanık biri' :
          p.openness > 65 ? 'sosyal bir kelebek' :
            p.courage > 65 ? 'cesur biri' :
              p.courage < 35 ? 'temkinli biri' :
                p.empathy > 65 ? 'duyarlı biri' :
                  p.empathy < 35 ? 'pragmatik biri' :
                    'dengeli biri';

      return `17. yaş günün. Aynaya bakıyorsun. Artık ${archetype} olduğunu biliyorsun. Peki bu sen olmak istemiştin mi?`;
    },
    minAge: 17, maxAge: 17, difficulty: 3, rarity: 'RARE', isRepeatable: false,
    personalityCategory: 'GROWTH',
    choices: [
      {
        text: "Evet, bu benim",
        effect: { health: 10, charisma: 5 },
        stressEffect: -20,
        feedback: "Kendini kabul etmek güçtür. Kim olduğunu biliyorsun. Bu özgürlük.",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Kendini kabul ettin' },
      },
      {
        text: "Hayır, değişmek istiyorum",
        effect: { discipline: 10, health: -5 },
        personalityEffects: [
          { axis: 'courage', change: 5 },
        ],
        stressEffect: 10,
        feedback: "Değişim zordur, özellikle 17 yaşında. Ama ilk adım farkındalıktır. Şimdi ne yapacaksın?",
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'Değişime karar verdin' },
      },
    ],
  },

  // =================================================================
  // EK KİŞİLİK OLAYLARI - YAŞ ÇEŞİTLİLİĞİ
  // =================================================================

  {
    id: 'pers_yeni_sinif',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.openness < 30) {
        return "Yeni bir sınıfa/okula geçtin. Kimseyi tanımıyorsun. Herkes birbirini tanıyor, gruplar oluşmuş. Sen dışarıda kaldın...";
      } else if (p.openness > 70) {
        return "Yeni bir sınıfa/okula geçtin! Yeni insanlar, yeni fırsatlar! Herkesle tanışmalısın!";
      }
      return "Yeni bir sınıfa/okula geçtin. Kimseyi tanımıyorsun. Nasıl yaklaşacaksın?";
    },
    minAge: 7, maxAge: 16, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'sinif_cesur',
        text: "İlk sen merhaba de",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { charisma: 12, energy: -20 },
        personalityEffects: [{ axis: 'openness', change: 8 }],
        stressEffect: 25,
        feedback: "Kalbin güm güm attı ama 'Merhaba, ben yeni öğrenci' dedin. Birkaç kişi seninle konuştu!",
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
      },
      {
        id: 'sinif_bekle',
        text: "Birinin sana gelmesini bekle",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { charisma: -5 },
        personalityEffects: [{ axis: 'openness', change: -2 }],
        stressEffect: 15,
        feedback: "Köşede bekledin. Kimse gelmedi. Yalnız bir başlangıç.",
        memory: { emotion: 'REGRET', weight: 'LOW' },
      },
      {
        id: 'sinif_sosyal',
        text: "Herkesle tanış!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', min: 60 }],
        effect: { charisma: 15, energy: -25 },
        stressEffect: -5,
        feedback: "Gün sonunda herkesin adını öğrendin. Popüler yeni öğrenci sensin!",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'pers_oyun_kaybetme',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.patience < 30) {
        return "Oyun oynuyorsun ve kaybediyorsun. Sinirlendin! Oyunu devirmek istiyorsun!";
      }
      return "Oyun oynuyorsun ve kaybettin. Ne yapacaksın?";
    },
    minAge: 5, maxAge: 12, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'GROWTH',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'oyun_sakin',
        text: "Sakin ol, tebrik et",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 40 }],
        effect: { discipline: 10, charisma: 5 },
        personalityEffects: [{ axis: 'patience', change: 8 }],
        stressEffect: 15,
        feedback: "'Tebrikler' dedin, elini sıktın. İçinden patlıyordun ama centilmen oldun.",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'oyun_sinirlen',
        text: "Sinirlen ve oyunu devir",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'patience', max: 40 }],
        effect: { charisma: -10, familyRelation: -5 },
        personalityEffects: [{ axis: 'patience', change: -5 }],
        stressEffect: -10,
        feedback: "Masayı devirdin! Herkes sana baktı. Kötü kaybedensin.",
        memory: { emotion: 'REGRET', weight: 'LOW' },
      },
      {
        id: 'oyun_yeniden',
        text: "Bir daha oynayalım!",
        choiceType: 'NEUTRAL',
        effect: { energy: -10, discipline: 3 },
        feedback: "Hemen yeniden başladın. Azimlisin!",
      },
    ],
  },

  {
    id: 'pers_kardesle_paylasim',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Son dondurma kalmış. Kardeşin de istiyor. O da senin kadar hak ediyor...";
      } else if (p.empathy < 30) {
        return "Son dondurma kalmış. Kardeşin de istiyor. Ama önce sen gördün!";
      }
      return "Son dondurma kalmış. Kardeşin de istiyor. Ne yapacaksın?";
    },
    minAge: 5, maxAge: 12, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'dondurma_paylas',
        text: "Paylaş",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { familyRelation: 10, health: -3 },
        personalityEffects: [{ axis: 'empathy', change: 5 }],
        stressEffect: 10,
        feedback: "Yarısını verdin. Kardeşin mutlu oldu. Sen de... biraz?",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'dondurma_al',
        text: "Hepsini ye, önce gören alır",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', max: 40 }],
        effect: { health: 5, familyRelation: -8 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: -5,
        feedback: "Hepsini yedin. Kardeşin ağladı. Annen seni azarladı ama dondurma güzeldi.",
      },
      {
        id: 'dondurma_ver',
        text: "Ona ver",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', min: 60 }],
        effect: { familyRelation: 15, health: -5 },
        stressEffect: -5,
        feedback: "'Al sen ye' dedin. Kardeşin sana sarıldı. Fedakarlık.",
        memory: { emotion: 'SATISFACTION', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'pers_korkunc_film',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.courage < 30) {
        return "Arkadaşların korku filmi izliyor. Davet ediyorlar. Ama sen... korku filmlerinden nefret ediyorsun!";
      }
      return "Arkadaşların korku filmi izliyor. Katılacak mısın?";
    },
    minAge: 10, maxAge: 16, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'RISK',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'film_izle',
        text: "İzle, korkma",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 40 }],
        effect: { charisma: 8, health: -5 },
        personalityEffects: [{ axis: 'courage', change: 5 }],
        stressEffect: 20,
        feedback: "Tüm film boyunca gözlerini kapattın ama dayanın! Arkadaşların 'cesursun' dedi.",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'film_red',
        text: "Korku filmi izlemem",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'courage', max: 40 }],
        effect: { charisma: -5, energy: 10 },
        stressEffect: -5,
        feedback: "Eve gittin. Rahat uyudun. Arkadaşların sonra filmi anlattı.",
      },
      {
        id: 'film_heyecan',
        text: "Tabii, korkulu filmler harika!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'courage', min: 60 }],
        effect: { charisma: 10, energy: -15 },
        stressEffect: -10,
        feedback: "Filmi çok sevdin! En çok bağıran sendin ama eğlencesine!",
        memory: { emotion: 'SATISFACTION', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'pers_sira_beklemek',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.conformity > 70) {
        return "Birisi sırana atladı. Bu çok yanlış! Kurallar var!";
      } else if (p.conformity < 30) {
        return "Birisi sırana atladı. Kural mı? Güçlü olan kazanır!";
      }
      return "Birisi sırana atladı. Ne yapacaksın?";
    },
    minAge: 7, maxAge: 16, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'sira_itiraz',
        text: "İtiraz et, sıra var",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', min: 50 }],
        effect: { discipline: 8, charisma: 3 },
        stressEffect: 10,
        feedback: "'Sıra var!' dedin. Kişi utanarak geri gitti. Adalet!",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'sira_kabul',
        text: "Ses çıkarma",
        choiceType: 'PASSIVE',
        effect: { charisma: -3 },
        stressEffect: 5,
        feedback: "Bir şey demedin. Bekledin. Biraz sinirlisin ama kavga olmadı.",
      },
      {
        id: 'sira_atla',
        text: "Sen de birine atla",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', max: 40 }],
        effect: { charisma: -5, discipline: -5 },
        personalityEffects: [{ axis: 'conformity', change: -3 }],
        stressEffect: 0,
        feedback: "Misliyle ödedin! Başka birine sen de atladın. Kaos!",
      },
    ],
  },

  {
    id: 'pers_yaratici_proje',
    text: "Serbest proje ödevi var. Farklı ve cesur bir fikrin var ama riskli. Klasik yapsan güvenli not alırsın.",
    minAge: 10, maxAge: 18, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'GROWTH',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'proje_cesur',
        text: "Risklı ama yaratıcı olanı yap",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { intelligence: 8, charisma: 10, energy: -20 },
        personalityEffects: [{ axis: 'courage', change: 8 }],
        gradeUpdates: { language: 5 },
        stressEffect: 20,
        feedback: "Projen çok farklıydı! Öğretmen şaşırdı. Alkış aldın!",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
      {
        id: 'proje_guvenli',
        text: "Klasik ve güvenli olanı yap",
        choiceType: 'PASSIVE',
        effect: { discipline: 5 },
        gradeUpdates: { language: 3 },
        stressEffect: 0,
        feedback: "Standart bir proje yaptın. Güvenli not aldın. Ama kimse hatırlamayacak.",
      },
    ],
  },

  {
    id: 'pers_yalanla_kurtulma',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Bir hata yaptın. Yalan söylersen kimse bilmeyecek. Ama... doğru olan bu mu?";
      }
      return "Bir hata yaptın. Yalan söylersen kurtulursun. Ne yapacaksın?";
    },
    minAge: 8, maxAge: 16, difficulty: 3, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'yalan_doğru',
        text: "Doğruyu söyle",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { discipline: 10, familyRelation: 3, charisma: 5 },
        personalityEffects: [{ axis: 'empathy', change: 5 }],
        stressEffect: 15,
        feedback: "Doğruyu söyledin. Ceza aldın ama herkes sana güveniyor artık.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
        grantTraits: ['HONEST'],
      },
      {
        id: 'yalan_yalan',
        text: "Yalan söyle ve kurtur",
        choiceType: 'PASSIVE',
        effect: { discipline: -10, familyRelation: -3 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: 10,
        feedback: "Yalan işe yaradı. Ama vicdanın rahat değil...",
        memory: { emotion: 'GUILT', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'pers_uyku_saati',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.conformity > 70) {
        return "Uyku saatin geldi. Annen 'yat' dedi. Kurallar kural!";
      } else if (p.conformity < 30) {
        return "Uyku saatin geldi. Annen 'yat' dedi. Ama sen uykulu değilsin!";
      }
      return "Uyku saatin geldi. Yatacak mısın?";
    },
    minAge: 5, maxAge: 12, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'uyku_yat',
        text: "Tamam anne, iyi geceler",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', min: 50 }],
        effect: { health: 10, familyRelation: 5, energy: 20 },
        stressEffect: -5,
        feedback: "Uslu çocuk! Ertesi gün dinlenmiş kalktın.",
      },
      {
        id: 'uyku_kac',
        text: "Gizlice oyun oyna",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', max: 40 }],
        effect: { health: -5, familyRelation: -5, energy: -10 },
        personalityEffects: [{ axis: 'conformity', change: -2 }],
        stressEffect: 5,
        feedback: "Battaniyenin altında telefon oynadın. Annene yakalandın!",
        memory: { emotion: 'GUILT', weight: 'LOW' },
      },
      {
        id: 'uyku_pazarlik',
        text: "10 dakika daha?",
        choiceType: 'NEUTRAL',
        effect: { familyRelation: -2, energy: 5 },
        feedback: "'5 dakika' dedi annen. Kabul!",
      },
    ],
  },

  {
    id: 'pers_grup_zorbaligi',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Popüler çocuklar bir öğrenciyle dalga geçiyor. O çocuk çaresiz. Kalbin sızlıyor...";
      } else if (p.courage < 30) {
        return "Popüler çocuklar bir öğrenciyle dalga geçiyor. Araya girsen sana da dönerler...";
      }
      return "Popüler çocuklar bir öğrenciyle dalga geçiyor. Ne yapacaksın?";
    },
    minAge: 8, maxAge: 16, difficulty: 4, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'zorbalik_mudahale',
        text: "Araya gir, onu savun",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { charisma: -5, health: -5, discipline: 8 },
        personalityEffects: [
          { axis: 'courage', change: 10 },
          { axis: 'empathy', change: 5 },
        ],
        stressEffect: 25,
        feedback: "'Bırakın onu!' dedin. Sana da laf attılar. Ama o çocuk teşekkür etti. Değdi.",
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        grantTraits: ['BRAVE'],
      },
      {
        id: 'zorbalik_izle',
        text: "Bir şey yapma, riskli",
        choiceType: 'PASSIVE',
        effect: { charisma: -3 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: 10,
        feedback: "İzledin. O çocuğun gözleri seni buldu. Yardım etmedin...",
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
      },
      {
        id: 'zorbalik_ogretmen',
        text: "Öğretmene söyle",
        choiceType: 'NEUTRAL',
        effect: { discipline: 5, charisma: -3 },
        stressEffect: 5,
        feedback: "Öğretmen geldi, zorbalık durdu. Ama 'ispiyoncu' damgası mı yedin?",
      },
    ],
  },

  {
    id: 'pers_bir_gun_yalniz',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.openness < 30) {
        return "Bugün kimseyle konuşmadın. Tek başına geçti gün. Aslında... fena değildi.";
      } else if (p.openness > 70) {
        return "Bugün kimseyle konuşmadın. Telefonun çalmadı. Yalnızlık boğuyor...";
      }
      return "Bugün kimseyle konuşmadın. Nasıl hissediyorsun?";
    },
    minAge: 10, maxAge: 18, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'GROWTH',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'yalniz_rahat',
        text: "Yalnızlık benim için iyi",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { energy: 20, intelligence: 5 },
        stressEffect: -15,
        feedback: "Kendinle baş başa kaldın. Düşündün, dinlendin. Huzur.",
        memory: { emotion: 'SATISFACTION', weight: 'LOW' },
      },
      {
        id: 'yalniz_zor',
        text: "Çok zor, insanları özledim",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', min: 60 }],
        effect: { energy: -10, health: -5 },
        stressEffect: 15,
        feedback: "Sosyal medyayı açıp herkesin eğlendiğini gördün. FOMO acı veriyor.",
        memory: { emotion: 'REGRET', weight: 'LOW' },
      },
      {
        id: 'yalniz_mesaj',
        text: "Birine mesaj at",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { charisma: 8, energy: -10 },
        personalityEffects: [{ axis: 'openness', change: 5 }],
        stressEffect: 10,
        feedback: "'Naber?' yazdın. Sohbet başladı. Belki yalnızlık o kadar da iyi değildir.",
      },
    ],
  },

  // =================================================================
  // DENGELİ KİŞİLİK EVENTLERİ (openness/courage/empathy 30-70 arası)
  // Dengeli karakterler için özel içerik - "her işten anlayan" anlar
  // =================================================================

  {
    id: 'pers_balanced_mediator',
    text: 'İki arkadaşın kavga ediyor. İkisini de anlıyorsun çünkü her iki tarafı da görebiliyorsun.',
    minAge: 9, maxAge: 14, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    reqPersonality: [
      { axis: 'empathy', min: 30, max: 70 },
      { axis: 'courage', min: 30, max: 70 },
    ],
    choices: [
      {
        id: 'balanced_mediate',
        text: 'Arabulucu ol',
        choiceType: 'CHALLENGE',
        effect: { charisma: 5 },
        personalityEffects: [{ axis: 'empathy', change: 3 }, { axis: 'courage', change: 2 }],
        feedback: 'Her iki tarafı da dinledin ve barıştırdın. Dengeli bakış açın çok işe yaradı!',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Arabulucu olarak iki arkadaşını barıştırdın' },
        skillUpdates: { teamwork: 3 },
      },
      {
        id: 'balanced_stay_out',
        text: 'Karışma',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'patience', change: 1 }],
        feedback: 'Karışmadın. Bazen en iyi hamle hiçbir şey yapmamaktır.',
      },
    ],
  },

  {
    id: 'pers_balanced_allrounder',
    text: 'Okulda proje yarışması var. Hangi alanda yarışacağını seçmelisin ama sen her konuda idare ediyorsun...',
    minAge: 10, maxAge: 14, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    reqPersonality: [
      { axis: 'openness', min: 30, max: 70 },
      { axis: 'patience', min: 30, max: 70 },
    ],
    choices: [
      {
        id: 'allrounder_combine',
        text: 'Disiplinler arası proje yap',
        choiceType: 'CHALLENGE',
        effect: { intelligence: 4, charisma: 3 },
        personalityEffects: [{ axis: 'openness', change: 3 }],
        feedback: 'Farklı alanları birleştiren projen jüriyi etkiledi! Çok yönlülüğün senin gücün.',
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Çok yönlülüğünle proje yarışmasında öne çıktın' },
      },
      {
        id: 'allrounder_pick_one',
        text: 'Tek bir alan seç',
        choiceType: 'NEUTRAL',
        effect: { discipline: 3 },
        personalityEffects: [{ axis: 'conformity', change: 2 }],
        feedback: 'Bir alana odaklandın. Güvenli bir seçim.',
      },
    ],
  },

  {
    id: 'pers_balanced_leadership',
    text: 'Grup projesinde kimse liderlik yapmak istemiyor. Sen ne yaparsın?',
    minAge: 11, maxAge: 16, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    reqPersonality: [
      { axis: 'courage', min: 30, max: 70 },
      { axis: 'conformity', min: 30, max: 70 },
    ],
    choices: [
      {
        id: 'balanced_lead',
        text: 'Sessizce organize et',
        choiceType: 'CHALLENGE',
        effect: { charisma: 4, discipline: 2 },
        personalityEffects: [{ axis: 'courage', change: 2 }],
        feedback: 'Dikkat çekmeden grubu organize ettin. Sessiz liderliğin çok etkili oldu.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM', customNote: 'Sessiz liderlikle grubu yönlendirdin' },
        skillUpdates: { teamwork: 3 },
      },
      {
        id: 'balanced_delegate',
        text: 'Görev dağıt ve çekil',
        choiceType: 'NEUTRAL',
        effect: { charisma: 2 },
        personalityEffects: [{ axis: 'patience', change: 2 }],
        feedback: 'Herkes payını aldı. Pratik bir çözüm.',
      },
    ],
  },

  {
    id: 'pers_balanced_moral_gray',
    text: 'Arkadaşın kopya çekiyor. Sana da kopya veriyor. Ne doğru ne yanlış tam olarak net değil...',
    minAge: 10, maxAge: 15, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    reqPersonality: [
      { axis: 'empathy', min: 30, max: 70 },
      { axis: 'conformity', min: 30, max: 70 },
    ],
    choices: [
      {
        id: 'gray_refuse_quietly',
        text: 'Sessizce reddet',
        choiceType: 'CHALLENGE',
        effect: { discipline: 4 },
        personalityEffects: [{ axis: 'courage', change: 2 }],
        feedback: 'Kopya almadın ama arkadaşını da ele vermedin. Kendi yolunu çizdin.',
        memory: { emotion: 'SATISFACTION', weight: 'LOW', customNote: 'Kendi değerlerini sessizce korudun' },
      },
      {
        id: 'gray_accept',
        text: 'Kopyayı al',
        choiceType: 'PASSIVE',
        effect: { intelligence: -2 },
        personalityEffects: [{ axis: 'conformity', change: 2 }, { axis: 'courage', change: -1 }],
        feedback: 'Kopyayı aldın. Not iyi geldi ama vicdanın biraz sızladı.',
        memory: { emotion: 'GUILT', weight: 'LOW', customNote: 'Arkadaşından kopya çektin' },
      },
    ],
  },

  {
    id: 'pers_balanced_hobby_dilemma',
    text: 'Birden fazla hobinle ilgileniyorsun ama hepsine zaman yetmiyor. Uzmanlaşmalı mısın yoksa çeşitlilik mi korumalısın?',
    minAge: 12, maxAge: 16, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    reqPersonality: [
      { axis: 'openness', min: 35, max: 65 },
    ],
    choices: [
      {
        id: 'hobby_diversify',
        text: 'Çeşitliliği koru',
        choiceType: 'NEUTRAL',
        effect: { intelligence: 2, charisma: 2 },
        personalityEffects: [{ axis: 'openness', change: 3 }],
        feedback: 'Her şeyden biraz bilmek de bir yetenek! Çok yönlülüğünü korudun.',
      },
      {
        id: 'hobby_specialize',
        text: 'Bir tanesine odaklan',
        choiceType: 'CHALLENGE',
        effect: { discipline: 4 },
        personalityEffects: [{ axis: 'patience', change: 3 }],
        feedback: 'Bir alana odaklandın. Derinleşmek seni uzman yapıyor.',
      },
    ],
  },

  {
    id: 'pers_balanced_family_talk',
    text: 'Ailen sana "Sen ne düşünüyorsun?" diye soruyor. Genelde herkesin fikrini dinlersin...',
    minAge: 10, maxAge: 16, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    reqPersonality: [
      { axis: 'conformity', min: 30, max: 70 },
      { axis: 'empathy', min: 35, max: 65 },
    ],
    choices: [
      {
        id: 'family_honest_opinion',
        text: 'Düşünceni açıkça söyle',
        choiceType: 'CHALLENGE',
        effect: { familyRelation: 5, charisma: 3 },
        personalityEffects: [{ axis: 'courage', change: 3 }],
        feedback: 'Ailenle açıkça konuştun. Seni dinlediler ve fikrini ciddiye aldılar.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM', customNote: 'Ailene düşüncelerini açıkça ifade ettin' },
      },
      {
        id: 'family_agree',
        text: '"Siz bilirsiniz" de',
        choiceType: 'PASSIVE',
        effect: { familyRelation: 2 },
        personalityEffects: [{ axis: 'conformity', change: 2 }],
        feedback: 'Ailenin kararına uyum sağladın.',
      },
    ],
  },

  {
    id: 'pers_balanced_new_student',
    text: 'Sınıfa yeni bir öğrenci geldi. Kimse yanına gitmedi. Sen hem merak ediyorsun hem de rahatın yerinde...',
    minAge: 8, maxAge: 13, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    reqPersonality: [
      { axis: 'openness', min: 30, max: 70 },
      { axis: 'empathy', min: 30, max: 70 },
    ],
    choices: [
      {
        id: 'new_student_approach',
        text: 'Yanına git',
        choiceType: 'CHALLENGE',
        effect: { charisma: 4 },
        personalityEffects: [{ axis: 'openness', change: 2 }, { axis: 'empathy', change: 2 }],
        feedback: 'Yeni öğrenciyle tanıştın. Çok sevindi! Yeni bir arkadaşlık başlayabilir.',
        memory: { emotion: 'SATISFACTION', weight: 'LOW', customNote: 'Yeni öğrenciye ilk uzanan sen oldun' },
        npcRelationChange: 10,
      },
      {
        id: 'new_student_wait',
        text: 'Bekle, o sana gelsin',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'patience', change: 1 }],
        feedback: 'Bekledin. Belki yarın konuşursunuz.',
      },
    ],
  },

  {
    id: 'pers_balanced_competition',
    text: 'Bir yarışmada ikincilik kazandın. Birinciye çok yakındın. Nasıl hissediyorsun?',
    minAge: 9, maxAge: 15, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    reqPersonality: [
      { axis: 'patience', min: 30, max: 70 },
      { axis: 'courage', min: 30, max: 70 },
    ],
    choices: [
      {
        id: 'competition_motivated',
        text: 'Daha çok çalış',
        choiceType: 'CHALLENGE',
        effect: { discipline: 4 },
        personalityEffects: [{ axis: 'patience', change: 2 }, { axis: 'courage', change: 2 }],
        feedback: 'İkincilik seni motive etti. Gelecek sefer birinci olacaksın!',
        memory: { emotion: 'PRIDE', weight: 'LOW', customNote: 'İkincilikten ders çıkarıp daha çok çalıştın' },
      },
      {
        id: 'competition_content',
        text: 'İkincilikle mutlu ol',
        choiceType: 'NEUTRAL',
        effect: { health: 3 },
        personalityEffects: [{ axis: 'patience', change: 3 }],
        feedback: 'İkincilik de güzel bir başarı. Kendini yorma, zaten iyisin.',
      },
    ],
  },

  {
    id: 'pers_balanced_career_talk',
    text: 'Herkes ne olmak istediğini biliyor gibi görünüyor. Sen ise birçok şeyle ilgileniyorsun...',
    minAge: 14, maxAge: 17, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    reqPersonality: [
      { axis: 'openness', min: 35, max: 65 },
      { axis: 'conformity', min: 35, max: 65 },
    ],
    choices: [
      {
        id: 'career_explore',
        text: 'Tüm seçenekleri araştır',
        choiceType: 'CHALLENGE',
        effect: { intelligence: 3 },
        personalityEffects: [{ axis: 'openness', change: 3 }],
        feedback: 'Her alanı araştırdın. Çok yönlülüğün bir avantaj — doğru zamanı bekle.',
        memory: { emotion: 'SATISFACTION', weight: 'LOW', customNote: 'Kariyerini düşünürken tüm seçenekleri değerlendirdin' },
      },
      {
        id: 'career_follow_crowd',
        text: 'Popüler olanı seç',
        choiceType: 'PASSIVE',
        effect: { discipline: 2 },
        personalityEffects: [{ axis: 'conformity', change: 3 }],
        feedback: 'Herkesin gittiği yolu seçtin. Güvenli ama sıkıcı olabilir.',
      },
    ],
  },

  {
    id: 'pers_balanced_conflict_resolve',
    text: 'Bir tartışmada hem haklı hem haksız olduğunu hissediyorsun. İki bakış açısını da görüyorsun.',
    minAge: 12, maxAge: 18, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    reqPersonality: [
      { axis: 'empathy', min: 35, max: 65 },
      { axis: 'courage', min: 35, max: 65 },
    ],
    choices: [
      {
        id: 'conflict_compromise',
        text: 'Uzlaşma yolu bul',
        choiceType: 'CHALLENGE',
        effect: { charisma: 4, discipline: 2 },
        personalityEffects: [{ axis: 'empathy', change: 2 }, { axis: 'patience', change: 2 }],
        feedback: 'Her iki tarafı da dinledin ve orta yolu buldun. Diplomatik yeteneklerin parlıyor.',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM', customNote: 'Çatışmayı uzlaşmayla çözdün' },
      },
      {
        id: 'conflict_withdraw',
        text: 'Tartışmadan çekil',
        choiceType: 'PASSIVE',
        effect: {},
        personalityEffects: [{ axis: 'patience', change: 1 }],
        feedback: 'Çekildin. Bazen en akıllıca hamle savaşmamaktır.',
      },
    ],
  },

];

export default PERSONALITY_EVENTS;
