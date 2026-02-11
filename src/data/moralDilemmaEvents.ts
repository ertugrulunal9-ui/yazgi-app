
import { GameEvent, EventContext } from '../types';

// =================================================================
// AHLAKI İKİLEM EVENTLERİ - KİŞİLİK SİSTEMİ ENTEGRE
// "Her seçim bir vazgeçiştir" - Hiçbir seçenek tamamen iyi değil
// Karakter = Kader: Seçimler kişiliği şekillendirir
// =================================================================

export const MORAL_DILEMMA_EVENTS: GameEvent[] = [

  // =================================================================
  // DÜRÜSTLÜK vs KİŞİSEL ÇIKAR
  // =================================================================

  {
    id: 'dilemma_sinav_kopya_gorme',
    text: (ctx: EventContext) => {
      const isStrict = ctx.family?.dynamic === 'STRICT';
      const p = ctx.personality;

      let base = "Sınavda en yakın arkadaşın kopya çekiyor. Öğretmen tam o anda sana döndü: 'Bir şey mi gördün?'";

      if (isStrict) {
        base = "Sınavda en yakın arkadaşın kopya çekiyor. Öğretmen sana bakıyor - 'Bir şey mi gördün?' diye soruyor. Arkadaşın sana yalvaran gözlerle bakıyor. Ama baban kötü not getirirsen...";
      }

      if (p.empathy > 70) {
        return base + " Arkadaşının yalvaran gözleri yüreğini burkuyor. Onu ele veremezsin... değil mi?";
      } else if (p.empathy < 30) {
        return base + " Neden senin problemin olsun ki? Herkes kendi yoluna baksın.";
      } else if (p.conformity > 70) {
        return base + " Kurallar açık: kopya çekmek yasak. Ama bu arkadaşın...";
      }

      return base + " Arkadaşın sana yalvaran gözlerle bakıyor.";
    },
    minAge: 10, maxAge: 18, difficulty: 4, rarity: 'UNCOMMON', isRepeatable: false,
    tags: ['moral', 'friendship', 'honesty'],
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'tell_truth',
        text: "Doğruyu söyle (Arkadaşını sat)",
        effect: { discipline: 10, charisma: -15, intelligence: 3 },
        feedback: "Öğretmen arkadaşını disipline gönderdi. 'Dürüst çocuk' dedin ama koridorda herkes senden uzak duruyor. Arkadaşın bir daha seninle konuşmadı.",
        choiceType: 'CHALLENGE',
        stressEffect: 15,
        personalityEffects: [
          { axis: 'empathy', change: -8 },
          { axis: 'conformity', change: 5 }
        ],
        dynamicFeedback: {
          empathetic: "Doğruyu söyledin ama içini kemiren bir suçluluk var. Arkadaşının yüzü gözlerinin önünden gitmiyor.",
          selfish: "Herkes kendi yoluna baksın. Kuralları çiğneyen sonuçlarına katlanır."
        },
        memory: { emotion: 'GUILT', weight: 'HIGH', customNote: 'Arkadaşını ihbar ettin' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 10, eventId: 'dilemma_ispiyoncu_damgasi', priority: 'HIGH' }
        ]
      },
      {
        id: 'protect_friend',
        text: "Yalan söyle: 'Görmedim hocam'",
        effect: { charisma: 8, discipline: -10, familyRelation: -5 },
        feedback: "Arkadaşın kurtuldu ve sana minnettar. Ama öğretmen şüpheleniyor, ailen de senin 'o çocukla' takılmanı sorguluyor.",
        choiceType: 'PASSIVE',
        stressEffect: 5,
        personalityEffects: [
          { axis: 'empathy', change: 5 },
          { axis: 'conformity', change: -5 }
        ],
        dynamicFeedback: {
          brave: "Yalan söylemek kolay değildi ama arkadaşlık bunu gerektiriyordu.",
          cautious: "Risk aldın. Ya öğretmen anlarsa? Ama arkadaşın için değdi... umarım."
        },
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM', customNote: 'Arkadaşını korudun ama yalan söyledin' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 15, eventId: 'dilemma_arkadaslik_testi', priority: 'NORMAL' }
        ]
      },
      {
        id: 'stay_silent',
        text: "Sessiz kal, omuz silk",
        effect: { discipline: -5, charisma: -5, intelligence: -3 },
        feedback: "Öğretmen ikna olmadı. 'Sen de biliyordun' dedi. Ne arkadaşını korudun, ne de dürüst oldun. İkisi de sana kırgın.",
        choiceType: 'PASSIVE',
        stressEffect: 10,
        personalityEffects: [
          { axis: 'courage', change: -5 },
          { axis: 'patience', change: 3 }
        ],
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Karar veremedin' }
      }
    ]
  },

  {
    id: 'dilemma_ispiyoncu_damgasi',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "Sınıfta yeni bir olay oldu. Herkes sana bakıyor - 'Bu ispiyoncuya söylemeyin' diye fısıldaşıyorlar.";

      if (p.openness < 30) {
        return base + " Zaten insanlardan uzak duruyordun, şimdi tamamen dışlandın.";
      } else if (p.openness > 70) {
        return base + " Sosyal hayatın paramparça. Bu duruma dayanamıyorsun.";
      }

      return base + " Geçmişte arkadaşını ihbar ettiğin herkesin aklında.";
    },
    minAge: 11, maxAge: 18, difficulty: 3, rarity: 'RARE',
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        text: "Kendini savun: 'Doğru olanı yaptım'",
        effect: { discipline: 8, charisma: -10, health: -5 },
        feedback: "Sınıf ikiye bölündü. Bazıları sana hak verdi ama çoğunluk hâlâ mesafeli. Yalnızlık ağır geliyor.",
        choiceType: 'CHALLENGE',
        stressEffect: 15,
        personalityEffects: [
          { axis: 'courage', change: 8 },
          { axis: 'conformity', change: -5 }
        ],
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' }
      },
      {
        text: "Özür dile ve pişmanlık göster",
        effect: { charisma: 5, discipline: -8, familyRelation: -3 },
        feedback: "Herkesin önünde 'Hata yaptım' dedin. Bazıları affetti ama 'zayıf' göründün. Baban duyunca kızdı.",
        choiceType: 'PASSIVE',
        stressEffect: -5,
        personalityEffects: [
          { axis: 'courage', change: -5 },
          { axis: 'empathy', change: 5 }
        ],
        memory: { emotion: 'REGRET', weight: 'HIGH' }
      },
      {
        text: "Yeni arkadaş grubu bul",
        effect: { charisma: 3, intelligence: 5, discipline: 3 },
        feedback: "Eski grubu bıraktın. Yeni arkadaşlar farklı - daha çalışkan ama daha sıkıcı. Geçmişi geride bıraktın.",
        choiceType: 'NEUTRAL',
        stressEffect: -10,
        personalityEffects: [
          { axis: 'openness', change: 5 },
          { axis: 'patience', change: 5 }
        ],
        grantTraits: ['LONE_WOLF']
      }
    ]
  },

  {
    id: 'dilemma_arkadaslik_testi',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "O gün kopya çekerken koruduğun arkadaşın şimdi popüler grubun lideri. Sen ise hâlâ aynı yerdesin.";

      if (p.empathy > 70) {
        return base + " Bir gün seni 'loser' diye çağırdığını duydun. Yüreğin sızladı - iyilik bu mu?";
      } else if (p.empathy < 30) {
        return base + " Bir gün seni 'loser' diye çağırdığını duydun. Hah! Demek karşılık bu.";
      }

      return base + " Bir gün seni 'loser' diye çağırdığını duydun.";
    },
    minAge: 12, maxAge: 18, difficulty: 3, rarity: 'RARE',
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        text: "Yüzleş: 'O gün seni kurtardım!'",
        effect: { charisma: 5, discipline: 5, health: -5 },
        feedback: "'Evet, teşekkürler ama artık farklı dünyalardayız' dedi. Acı gerçek: İyilik her zaman karşılık bulmaz.",
        choiceType: 'CHALLENGE',
        stressEffect: 10,
        personalityEffects: [
          { axis: 'courage', change: 5 },
          { axis: 'empathy', change: -3 }
        ],
        memory: { emotion: 'REGRET', weight: 'HIGH', customNote: 'İyiliğin karşılıksız kaldı' }
      },
      {
        text: "Sessiz kal, ders al",
        effect: { intelligence: 8, charisma: -5, discipline: 5 },
        feedback: "Acı bir ders öğrendin: Bazı insanlar sadece ihtiyaçları olduğunda yanında. Bu seni daha temkinli yaptı.",
        choiceType: 'PASSIVE',
        stressEffect: 5,
        personalityEffects: [
          { axis: 'patience', change: 8 },
          { axis: 'empathy', change: -5 }
        ],
        grantTraits: ['PRAGMATIC'],
        memory: { emotion: 'NEUTRAL', weight: 'HIGH' }
      },
      {
        text: "O günkü sırrı ifşa et",
        effect: { charisma: -10, discipline: -10, money: 0 },
        feedback: "İntikam aldın ama herkes seni 'güvenilmez' olarak gördü. İki yüzlü damgası yedin.",
        choiceType: 'CHALLENGE',
        stressEffect: 20,
        personalityEffects: [
          { axis: 'empathy', change: -10 },
          { axis: 'conformity', change: -8 }
        ],
        grantTraits: ['REBELLIOUS'],
        memory: { emotion: 'GUILT', weight: 'HIGH' }
      }
    ]
  },

  // =================================================================
  // AİLE vs KİŞİSEL ÖZGÜRLÜK
  // =================================================================

  {
    id: 'dilemma_aile_beklentisi',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      const isStrict = ctx.family?.dynamic === 'STRICT';

      if (isStrict) {
        if (p.conformity > 70) {
          return "Baban seninle ciddi bir konuşma yaptı: 'Sen doktor olacaksın. Başka yol yok.' İçinden bir ses karşı çıkmak istiyor ama... baba sözü dinlenir.";
        } else if (p.conformity < 30) {
          return "Baban seninle ciddi bir konuşma yaptı: 'Sen doktor olacaksın. Başka yol yok.' İçinden bir isyan ateşi yükseliyor. Kimse sana ne yapacağını söyleyemez!";
        }
        return "Baban seninle ciddi bir konuşma yaptı: 'Sen doktor olacaksın. Başka yol yok.' Ama senin hayalin müzik... Gitar çalmak istiyorsun.";
      }

      if (p.courage > 70) {
        return "Ailen senin için planlar yapıyor - iyi bir üniversite, güvenli bir meslek. Ama sen farklı bir şey istiyorsun ve bunu söylemekten korkmuyorsun.";
      }

      return "Ailen senin için planlar yapıyor - iyi bir üniversite, güvenli bir meslek. Ama sen farklı bir şey istiyorsun. Sanat, müzik, belki de seyahat...";
    },
    minAge: 14, maxAge: 17, difficulty: 4, rarity: 'UNCOMMON', isRepeatable: false,
    milestoneLevel: 'MAJOR',
    personalityCategory: 'CONFLICT',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'obey_family',
        text: "Aileye itaat et (Hayallerinden vazgeç)",
        effect: { familyRelation: 20, discipline: 10, charisma: -10, health: -5 },
        gradeUpdates: { math: 5, science: 5 },
        feedback: "Baban gururla baktı. Ama geceleri yatakta, gitarın duvarda asılı duruyor - hiç çalmıyorsun artık. İçinde bir şey söndü.",
        choiceType: 'PASSIVE',
        stressEffect: 15,
        personalityEffects: [
          { axis: 'conformity', change: 10 },
          { axis: 'courage', change: -8 }
        ],
        dynamicFeedback: {
          brave: "Her gün içinden bir ses 'Neden boyun eğdin?' diye soruyor. Bu seçim sana ağır geliyor.",
          cautious: "Güvenli yolu seçtin. Aile desteği önemli. Ama ya hayallerin?"
        },
        memory: { emotion: 'REGRET', weight: 'HIGH', customNote: 'Hayallerinden vazgeçtin' },
        futureEvents: [
          { trigger: 'AGE', age: 17, eventId: 'dilemma_supressed_dreams', priority: 'HIGH' }
        ]
      },
      {
        id: 'follow_dreams',
        text: "Hayallerinin peşinden git (Aileyle çatış)",
        effect: { familyRelation: -25, charisma: 15, discipline: -5, health: 5 },
        skillUpdates: { music: 10 },
        feedback: "Baban kapıyı çarptı. Annen ağladı. Ama gitar eline aldığında, parmaklarından dökülen notalar sana 'Doğru yoldasın' diyor.",
        choiceType: 'CHALLENGE',
        stressEffect: 20,
        personalityEffects: [
          { axis: 'courage', change: 10 },
          { axis: 'conformity', change: -10 }
        ],
        dynamicFeedback: {
          introvert: "Yalnız kaldın ama müziğin var. Belki bu yeterli.",
          extrovert: "Aile desteği olmadan zor ama kendi yolunu çiziyorsun. Yeni insanlar, yeni fırsatlar bekliyor."
        },
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Kendi yolunu seçtin' },
        grantTraits: ['BRAVE'],
        futureEvents: [
          { trigger: 'AGE', age: 17, eventId: 'dilemma_family_reconciliation', priority: 'NORMAL' }
        ]
      },
      {
        id: 'compromise',
        text: "Orta yol ara (İkisini de yarım yap)",
        effect: { familyRelation: 5, discipline: 5, charisma: 5, intelligence: -5 },
        skillUpdates: { music: 3 },
        gradeUpdates: { math: 2 },
        feedback: "Hem ders çalışıyorsun hem gitar. Ama ikisinde de 'ortalama'sın. Ne ailen tam mutlu, ne sen tam tatmin.",
        choiceType: 'NEUTRAL',
        stressEffect: 10,
        personalityEffects: [
          { axis: 'patience', change: 5 }
        ],
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM' }
      }
    ]
  },

  {
    id: 'dilemma_supressed_dreams',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "17 yaşındasın. Tıp fakültesine hazırlanıyorsun - ailenin istediği gibi.";

      if (p.conformity < 30) {
        return base + " Ama her gece aynı rüyayı görüyorsun: Sahnede, elinde gitar, binlerce kişi alkışlıyor... İsyan ruhu içinde yanıyor.";
      } else if (p.patience > 70) {
        return base + " Hayallerin ertelendi, yok olmadı. Belki bir gün... Sabır.";
      }

      return base + " Ama her gece aynı rüyayı görüyorsun: Sahnede, elinde gitar, binlerce kişi alkışlıyor...";
    },
    minAge: 17, maxAge: 17, difficulty: 4, rarity: 'RARE',
    personalityCategory: 'GROWTH',
    challengesAxis: 'courage',
    reqStress: { min: 30 },
    choices: [
      {
        text: "Devam et, artık çok geç",
        effect: { discipline: 10, health: -15, charisma: -5, familyRelation: 5 },
        feedback: "Kitaplara gömüldün. Notların iyi ama içindeki ses hiç susmadı. Belki bir gün... belki asla.",
        choiceType: 'PASSIVE',
        stressEffect: 20,
        personalityEffects: [
          { axis: 'conformity', change: 8 },
          { axis: 'courage', change: -5 }
        ],
        memory: { emotion: 'REGRET', weight: 'HIGH' },
        grantTraits: ['DISCIPLINED']
      },
      {
        text: "Son bir şans: Gizlice yarışmaya katıl",
        effect: { charisma: 15, familyRelation: -15, discipline: -10, money: -50 },
        skillUpdates: { music: 8 },
        feedback: "Yarışmada sahneye çıktın. Kazanamadın ama jüri 'Potansiyel var' dedi. Baban öğrenince çıldırdı. Değdi mi?",
        choiceType: 'CHALLENGE',
        stressEffect: 25,
        personalityEffects: [
          { axis: 'courage', change: 10 },
          { axis: 'conformity', change: -8 }
        ],
        memory: { emotion: 'SATISFACTION', weight: 'HIGH' }
      }
    ]
  },

  {
    id: 'dilemma_family_reconciliation',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "Hayallerinin peşinden gittiğin için ailen seninle soğuk. Ama annenin doğum günü yaklaşıyor.";

      if (p.empathy > 70) {
        return base + " Annenin yüzünü gözlerinin önüne getiriyorsun. O hep yanındaydı, şimdi sen neredesin?";
      } else if (p.empathy < 30) {
        return base + " Neden sen adım atmalısın? Onlar seni anlamadı.";
      }

      return base + " Bir karar vermelisin.";
    },
    minAge: 16, maxAge: 18, difficulty: 3, rarity: 'RARE',
    personalityCategory: 'SOCIAL',
    challengesAxis: 'empathy',
    choices: [
      {
        text: "Git ve özür dile",
        effect: { familyRelation: 15, charisma: 5, discipline: -5 },
        feedback: "Annen seni kucakladı, baban hâlâ mesafeli. Ama en azından kapı aralandı.",
        choiceType: 'CHALLENGE',
        stressEffect: -15,
        personalityEffects: [
          { axis: 'empathy', change: 8 },
          { axis: 'courage', change: 5 }
        ],
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' }
      },
      {
        text: "Gitme, gururunu koru",
        effect: { familyRelation: -10, discipline: 10, health: -10 },
        feedback: "Doğum gününde evde oturup duvara baktın. Haklı olsan bile, yalnızlık ağır.",
        choiceType: 'PASSIVE',
        stressEffect: 15,
        personalityEffects: [
          { axis: 'empathy', change: -5 },
          { axis: 'conformity', change: -5 }
        ],
        memory: { emotion: 'REGRET', weight: 'HIGH' }
      },
      {
        text: "Hediye gönder ama gitme",
        effect: { familyRelation: 5, money: -30, charisma: 3 },
        feedback: "Annen hediyeyi aldı ve ağladı. Baban 'Kendisi gelseydi' dedi. Yarım adım.",
        choiceType: 'NEUTRAL',
        stressEffect: 5,
        personalityEffects: [
          { axis: 'patience', change: 3 }
        ],
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM' }
      }
    ]
  },

  // =================================================================
  // ADALET vs SADAKAT
  // =================================================================

  {
    id: 'dilemma_kardes_hirsizlik',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "Küçük kardeşinin çantasından komşunun kaybolan telefonu düştü.";

      if (p.empathy > 70) {
        return base + " Kardeşin ağlayarak 'Söyleme' diyor. Gözleri korkuyla dolu. Onu koruman lazım... ama bu doğru mu?";
      } else if (p.conformity > 70) {
        return base + " Kardeşin ağlayarak 'Söyleme' diyor. Hırsızlık yanlış. Kurallar açık. Ama bu senin kardeşin...";
      }

      return base + " Kardeşin ağlayarak 'Söyleme' diyor. Komşu kapı kapı soruyor.";
    },
    minAge: 10, maxAge: 18, difficulty: 5, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        text: "Kardeşini koru, sessiz kal",
        effect: { familyRelation: 10, discipline: -15, charisma: -5 },
        feedback: "Kardeşin rahat bir nefes aldı. Ama sen rahat uyuyamıyorsun. Komşu hâlâ arıyor...",
        choiceType: 'PASSIVE',
        stressEffect: 20,
        personalityEffects: [
          { axis: 'empathy', change: 5 },
          { axis: 'conformity', change: -8 }
        ],
        memory: { emotion: 'GUILT', weight: 'HIGH', customNote: 'Hırsızlığı örttün' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 8, eventId: 'dilemma_truth_comes_out', priority: 'HIGH' }
        ]
      },
      {
        text: "Kardeşini zorlayarak itiraf ettir",
        effect: { familyRelation: -10, discipline: 15, charisma: 5 },
        feedback: "Kardeşin özür diledi, telefon iade edildi. Komşu anlayışlıydı. Ama kardeşin sana 'Hain' diyor.",
        choiceType: 'CHALLENGE',
        stressEffect: 10,
        personalityEffects: [
          { axis: 'conformity', change: 8 },
          { axis: 'empathy', change: -3 }
        ],
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Doğru olanı yaptın' }
      },
      {
        text: "Kendin götür, kardeşini ele verme",
        effect: { money: -100, discipline: 5, familyRelation: 5, charisma: -10 },
        feedback: "'Yolda buldum' dedin. Komşu teşekkür etti. Ama yalan söyledin ve cebinden para çıktı.",
        choiceType: 'NEUTRAL',
        stressEffect: 8,
        personalityEffects: [
          { axis: 'empathy', change: 3 },
          { axis: 'courage', change: -3 }
        ],
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM' }
      }
    ]
  },

  {
    id: 'dilemma_truth_comes_out',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.courage < 30) {
        return "Komşu sonunda öğrendi - kardeşinin çaldığını. Şimdi hem kardeşin hem sen töhmet altındasın. 'Sen biliyordun değil mi?' diye soruyorlar. Panik içindesin.";
      } else if (p.courage > 70) {
        return "Komşu sonunda öğrendi - kardeşinin çaldığını. 'Sen biliyordun değil mi?' diye soruyorlar. Artık kaçacak yer yok. Yüzleşme zamanı.";
      }
      return "Komşu sonunda öğrendi - kardeşinin çaldığını. Şimdi hem kardeşin hem sen töhmet altındasın. 'Sen biliyordun değil mi?' diye soruyorlar.";
    },
    minAge: 11, maxAge: 18, difficulty: 4, rarity: 'RARE',
    personalityCategory: 'CONFLICT',
    challengesAxis: 'courage',
    choices: [
      {
        text: "Tamamen itiraf et",
        effect: { discipline: 10, familyRelation: -20, charisma: -10, health: -5 },
        feedback: "Her şey ortaya çıktı. Ailen utandı, komşularla ilişkiler bozuldu. Ama en azından yük kalktı.",
        choiceType: 'CHALLENGE',
        stressEffect: -20,
        personalityEffects: [
          { axis: 'courage', change: 10 },
          { axis: 'conformity', change: 5 }
        ],
        memory: { emotion: 'REGRET', weight: 'HIGH' }
      },
      {
        text: "Bilmiyordum de",
        effect: { charisma: -5, discipline: -10, familyRelation: 5 },
        feedback: "Bir yalan daha... Kimse tam inanmadı. Güvenilirliğin azaldı.",
        choiceType: 'PASSIVE',
        stressEffect: 15,
        personalityEffects: [
          { axis: 'courage', change: -8 },
          { axis: 'empathy', change: -3 }
        ],
        memory: { emotion: 'GUILT', weight: 'HIGH' }
      }
    ]
  },

  // =================================================================
  // BAŞARI vs ETİK
  // =================================================================

  {
    id: 'dilemma_yarisma_sabotaj',
    text: (ctx: EventContext) => {
      const skill = (ctx.skills?.coding ?? 0) > 50 ? 'kodlama' : (ctx.skills?.sports ?? 0) > 50 ? 'spor' : 'bilgi';
      const p = ctx.personality;

      let base = `Büyük ${skill} yarışmasının finalisin. Rakibin - aynı zamanda arkadaşın - çok iyi.`;

      if (p.empathy < 30) {
        return base + " Onun hazırlık dosyasını/stratejisini çalabilirsin. Kazanmak tek önemli şey, değil mi?";
      } else if (p.courage > 70) {
        return base + " Ama onun hazırlık dosyasını çalabilirsin. Risk var ama... kazanç da büyük.";
      }

      return base + " Ama onun hazırlık dosyasını/stratejisini çalabilirsin. Kimse bilmez.";
    },
    minAge: 12, maxAge: 18, difficulty: 5, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        text: "Dosyayı çal ve kazan",
        effect: { money: 200, discipline: -20, charisma: -5, intelligence: 5 },
        feedback: "Yarışmayı kazandın! Kupa elinde, herkes alkışlıyor. Ama arkadaşın ağlıyor ve sen nedenini biliyorsun.",
        choiceType: 'CHALLENGE',
        stressEffect: 25,
        personalityEffects: [
          { axis: 'empathy', change: -15 },
          { axis: 'courage', change: 5 }
        ],
        memory: { emotion: 'GUILT', weight: 'HIGH', customNote: 'Hileyle kazandın' },
        grantTraits: ['CHEATER'],
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 12, eventId: 'dilemma_hollow_victory', priority: 'NORMAL' }
        ]
      },
      {
        text: "Adil yarış, ne olursa olsun",
        effect: { discipline: 15, charisma: 10, money: 0 },
        feedback: "İkinci oldun. Kupa onun. Ama tokalaştığınızda gözlerinin içine bakabildin.",
        choiceType: 'PASSIVE',
        stressEffect: -5,
        personalityEffects: [
          { axis: 'empathy', change: 8 },
          { axis: 'conformity', change: 5 }
        ],
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Dürüstçe kaybettin' },
        grantTraits: ['HONEST']
      },
      {
        text: "Yarışmadan çekil",
        effect: { charisma: 5, discipline: -5, health: 5 },
        feedback: "Baskı çok fazlaydı. Çekildin. Rahatladın mı? Yoksa kaçtın mı?",
        choiceType: 'PASSIVE',
        stressEffect: -10,
        personalityEffects: [
          { axis: 'courage', change: -10 },
          { axis: 'patience', change: 3 }
        ],
        memory: { emotion: 'REGRET', weight: 'MEDIUM' }
      }
    ]
  },

  {
    id: 'dilemma_hollow_victory',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 50) {
        return "Aylar sonra, o yarışmada kazandığın kupaya bakıyorsun. Parlak ama... içi boş gibi hissettiriyor. Arkadaşın hâlâ seninle konuşmuyor. Vicdanın sızlıyor.";
      }
      return "Aylar sonra, o yarışmada kazandığın kupaya bakıyorsun. Parlak ama... arkadaşın hâlâ seninle konuşmuyor. Belki de önemli değil?";
    },
    minAge: 13, maxAge: 18, difficulty: 3, rarity: 'RARE',
    personalityCategory: 'GROWTH',
    challengesAxis: 'courage',
    reqStress: { min: 20 },
    choices: [
      {
        text: "İtiraf et ve kupayı iade et",
        effect: { discipline: 15, money: -200, charisma: 10, familyRelation: -10 },
        feedback: "Herkesin önünde gerçeği söyledin. Kupa gitti, itibarın zedelendi. Ama içindeki yük kalktı. Arkadaşın şok oldu ama... belki bir gün affeder.",
        choiceType: 'CHALLENGE',
        stressEffect: -30,
        personalityEffects: [
          { axis: 'courage', change: 15 },
          { axis: 'empathy', change: 10 }
        ],
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        grantTraits: ['BRAVE']
      },
      {
        text: "Sessiz kal, geçmişte kalsın",
        effect: { health: -10, discipline: 5, charisma: -5 },
        feedback: "Kupayı dolaba kaldırdın. Kimse bilmiyor. Ama sen biliyorsun ve bu düşünce seni her gece ziyaret ediyor.",
        choiceType: 'PASSIVE',
        stressEffect: 10,
        personalityEffects: [
          { axis: 'empathy', change: -5 },
          { axis: 'patience', change: -5 }
        ],
        memory: { emotion: 'GUILT', weight: 'HIGH' }
      }
    ]
  },

  // =================================================================
  // POPÜLARITE vs DEĞERLER
  // =================================================================

  {
    id: 'dilemma_zorbalik_populer',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "Sınıfın 'cool' grubu seni aralarına almak istiyor. Tek şart: Onlarla birlikte 'garip' çocukla dalga geçeceksin.";

      if (p.openness > 70) {
        return base + " Popüler olmak harika olurdu! Ama o çocuk aslında zararsız, sadece farklı... tıpkı sen gibi mi?";
      } else if (p.empathy > 70) {
        return base + " O çocuk aslında zararsız, sadece farklı. Ona zarar vermeyi düşünmek bile içini acıtıyor.";
      } else if (p.empathy < 30) {
        return base + " O çocuk zaten 'loser'. Popüler olma şansını neden kaçırasın?";
      }

      return base + " O çocuk aslında zararsız, sadece farklı.";
    },
    minAge: 10, maxAge: 16, difficulty: 4, rarity: 'COMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'join_bullies',
        text: "Gruba katıl ve dalga geç",
        effect: { charisma: 15, discipline: -10, health: 5 },
        feedback: "Artık 'cool' grubun bir parçasısın. Herkes seninle takılmak istiyor. Ama o çocuğun yüzündeki ifadeyi unutamıyorsun.",
        choiceType: 'PASSIVE',
        stressEffect: 10,
        personalityEffects: [
          { axis: 'empathy', change: -15 },
          { axis: 'openness', change: 5 }
        ],
        memory: { emotion: 'GUILT', weight: 'HIGH', customNote: 'Zorbalığa ortak oldun' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 20, eventId: 'dilemma_bully_karma', priority: 'HIGH' }
        ]
      },
      {
        id: 'reject_group',
        text: "Reddet: 'Bu benim tarzım değil'",
        effect: { charisma: -10, discipline: 15, health: -5 },
        feedback: "'Ezik' dediler ve gittiler. Yalnızsın ama vicdanın rahat. O 'garip' çocuk sana teşekkür etti.",
        choiceType: 'CHALLENGE',
        stressEffect: 15,
        personalityEffects: [
          { axis: 'empathy', change: 10 },
          { axis: 'courage', change: 10 },
          { axis: 'conformity', change: -8 }
        ],
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Doğru olanı seçtin' },
        grantTraits: ['EMPATHETIC'],
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 25, eventId: 'dilemma_outcast_friendship', priority: 'NORMAL' }
        ]
      },
      {
        id: 'passive_observer',
        text: "Gruba katıl ama dalga geçme",
        effect: { charisma: 5, discipline: -5 },
        feedback: "Grupta sessiz takıldın. Ne tam içlerinden oldun, ne de dışarıda. Herkes için 'o garip sessiz çocuk' oldun.",
        choiceType: 'PASSIVE',
        stressEffect: 8,
        personalityEffects: [
          { axis: 'courage', change: -5 },
          { axis: 'patience', change: 3 }
        ],
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM' }
      }
    ]
  },

  {
    id: 'dilemma_bully_karma',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 50) {
        return "Yıllar sonra, o 'garip' çocuk şimdi başarılı bir girişimci. Sosyal medyada herkes onu övüyor. Sen ise hâlâ o 'cool' grubun gölgesindesin - ve onlar bile dağıldı. Vicdan azabı daha da ağırlaştı.";
      }
      return "Yıllar sonra, o 'garip' çocuk şimdi başarılı bir girişimci. Sosyal medyada herkes onu övüyor. Sen ise hâlâ o 'cool' grubun gölgesindesin - ve onlar bile dağıldı.";
    },
    minAge: 15, maxAge: 18, difficulty: 3, rarity: 'RARE',
    personalityCategory: 'GROWTH',
    challengesAxis: 'empathy',
    choices: [
      {
        text: "Özür mesajı at",
        effect: { charisma: 5, discipline: 10, health: 5 },
        feedback: "Uzun bir özür yazdın. Cevap gelmedi ama en azından içini döktün. Geçmişi değiştiremezsin, sadece kabul edebilirsin.",
        choiceType: 'CHALLENGE',
        stressEffect: -15,
        personalityEffects: [
          { axis: 'empathy', change: 10 },
          { axis: 'courage', change: 8 }
        ],
        memory: { emotion: 'REGRET', weight: 'HIGH' }
      },
      {
        text: "Hiçbir şey yapma",
        effect: { discipline: -5, health: -5 },
        feedback: "Sessiz kaldın. Başarısını izledin. İçinden 'keşke' diye geçirdin ama harekete geçmedin.",
        choiceType: 'PASSIVE',
        stressEffect: 10,
        personalityEffects: [
          { axis: 'courage', change: -5 }
        ],
        memory: { emotion: 'REGRET', weight: 'MEDIUM' }
      }
    ]
  },

  {
    id: 'dilemma_outcast_friendship',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.courage > 70) {
        return "O gün koruduğun 'garip' çocuk artık en yakın arkadaşın. Ama 'cool' grup ona hâlâ zor zamanlar yaşatıyor. Bu sefer daha ağır: eşyalarını saklıyorlar. Müdahale etme zamanı!";
      } else if (p.conformity > 70) {
        return "O gün koruduğun 'garip' çocuk artık en yakın arkadaşın. Ama 'cool' grup ona hâlâ zor zamanlar yaşatıyor. Öğretmene söylemek en doğrusu... değil mi?";
      }
      return "O gün koruduğun 'garip' çocuk artık en yakın arkadaşın. Ama 'cool' grup ona hâlâ zor zamanlar yaşatıyor. Bu sefer daha ağır: eşyalarını saklıyorlar.";
    },
    minAge: 12, maxAge: 18, difficulty: 4, rarity: 'RARE',
    personalityCategory: 'CONFLICT',
    challengesAxis: 'courage',
    choices: [
      {
        text: "Müdahale et, kavga çıkar",
        effect: { health: -15, charisma: 10, discipline: 5, familyRelation: -5 },
        feedback: "Kavga çıktı, ikisine de ceza verildi. Ama arkadaşın sana sarıldı: 'Kimse benim için böyle bir şey yapmamıştı.'",
        choiceType: 'CHALLENGE',
        stressEffect: 20,
        personalityEffects: [
          { axis: 'courage', change: 15 },
          { axis: 'empathy', change: 8 }
        ],
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        grantTraits: ['BRAVE']
      },
      {
        text: "Öğretmene söyle",
        effect: { discipline: 10, charisma: -5 },
        feedback: "Öğretmen müdahale etti. Zorbalık durdu ama 'ispiyoncu' damgası yine geldi. Her doğru yolun bir bedeli var.",
        choiceType: 'PASSIVE',
        stressEffect: 5,
        personalityEffects: [
          { axis: 'conformity', change: 8 },
          { axis: 'courage', change: -3 }
        ],
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM' }
      },
      {
        text: "Arkadaşına 'kendini savun' de",
        effect: { discipline: 5, charisma: -10, health: 5 },
        feedback: "Arkadaşın yalnız kaldığını hissetti. 'Senin de onlar gibi olduğunu düşünmüştüm' dedi. Güveniniz sarsıldı.",
        choiceType: 'PASSIVE',
        stressEffect: 10,
        personalityEffects: [
          { axis: 'empathy', change: -8 },
          { axis: 'courage', change: -5 }
        ],
        memory: { emotion: 'GUILT', weight: 'MEDIUM' }
      }
    ]
  },

  // =================================================================
  // KISA VADE vs UZUN VADE
  // =================================================================

  {
    id: 'dilemma_parti_sinav',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "Yarın büyük sınav var. Ama bu gece yılın partisi - herkes orada olacak ve hoşlandığın kişi de.";

      if (p.patience < 30) {
        return base + " YOLO! Hayat kısa, parti uzun. Sınav yarın düşünülür... belki.";
      } else if (p.patience > 70) {
        return base + " Uzun vadeli düşünmelisin. Bir parti için geleceğini riske atar mısın?";
      } else if (p.openness > 70) {
        return base + " Sosyal hayatın önemli! Ama notlar da... İkisini aynı anda yapmak imkansız.";
      }

      return base + " İkisini aynı anda yapmak imkansız.";
    },
    minAge: 14, maxAge: 18, difficulty: 3, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'RISK',
    challengesAxis: 'patience',
    choices: [
      {
        text: "Partiye git (YOLO!)",
        effect: { charisma: 15, energy: -30, discipline: -15, health: 5 },
        gradeUpdates: { math: -15, science: -10 },
        feedback: "Muhteşem bir geceydi! Dans ettin, güldün, hoşlandığın kişiyle konuştun. Ama sınav... felaket geçti.",
        choiceType: 'PASSIVE',
        stressEffect: -10,
        personalityEffects: [
          { axis: 'patience', change: -10 },
          { axis: 'openness', change: 5 }
        ],
        dynamicFeedback: {
          introvert: "Partide eğlendin ama yoruldun. Çok fazla insan, çok fazla gürültü.",
          extrovert: "En güzel gece! Herkes seninle konuşmak istedi. Sınav mı? Eh, bir dahakine..."
        },
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' }
      },
      {
        text: "Evde çalış (Fedakarlık)",
        effect: { intelligence: 10, discipline: 10, charisma: -10, energy: -20 },
        gradeUpdates: { math: 10, science: 10 },
        feedback: "Sınav çok iyi geçti! Ama herkes partiyi konuşurken sen dışarıda kaldın. Hoşlandığın kişi başkasıyla dans etmiş.",
        choiceType: 'CHALLENGE',
        stressEffect: 15,
        personalityEffects: [
          { axis: 'patience', change: 10 },
          { axis: 'openness', change: -5 }
        ],
        dynamicFeedback: {
          extrovert: "Parti fotoğraflarına bakarak çalıştın. FOMO çok ağır. Ama notlar önemli... önemli... önemli...",
          introvert: "Sessiz bir gece, verimli çalışma. Parti zaten çok kalabalık olurdu."
        },
        memory: { emotion: 'REGRET', weight: 'LOW' }
      },
      {
        text: "Biraz git, erken dön",
        effect: { charisma: 5, discipline: -5, energy: -25 },
        gradeUpdates: { math: -5 },
        feedback: "İkisini de yarım yaptın. Partide 'erken giden' oldun, sınavda da 'ortalama'. Dengeyi buldun mu, yoksa ikisini de mi kaçırdın?",
        choiceType: 'NEUTRAL',
        stressEffect: 5,
        personalityEffects: [
          { axis: 'patience', change: 3 }
        ],
        memory: { emotion: 'NEUTRAL', weight: 'LOW' }
      }
    ]
  },

  // =================================================================
  // PARA vs DEĞERLER
  // =================================================================

  {
    id: 'dilemma_para_bulma',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "Okul kantininde yerde 500 TL buldun. Etrafta kimse yok.";

      if (p.empathy < 30) {
        return base + " Biraz önce üst sınıftan birinin cüzdanını düşürdüğünü gördün - o kişi zengin ve kibirli. Hak etti!";
      } else if (p.conformity > 70) {
        return base + " Biraz önce üst sınıftan birinin cüzdanını düşürdüğünü gördün. Doğru olan sahibine vermek... ama o kişi kibirli.";
      }

      return base + " Biraz önce üst sınıftan birinin cüzdanını düşürdüğünü gördün - o kişi zengin ve kibirli.";
    },
    minAge: 10, maxAge: 18, difficulty: 4, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        text: "Parayı sahibine ver",
        effect: { money: 0, discipline: 15, charisma: 5 },
        feedback: "Parayı verdin. 'Teşekkürler' bile demedi, sadece aldı ve gitti. Hiçbir ödül yok. Ama doğru olanı yaptın... değil mi?",
        choiceType: 'CHALLENGE',
        stressEffect: -5,
        personalityEffects: [
          { axis: 'empathy', change: 8 },
          { axis: 'conformity', change: 5 }
        ],
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Karşılık beklemeden iyilik yaptın' },
        grantTraits: ['HONEST']
      },
      {
        text: "Parayı al (Hak etti)",
        effect: { money: 500, discipline: -15, charisma: -5 },
        feedback: "500 TL cebinde! Zengin kibirli tip fark etmedi bile. Ama 'hak etti' demek seni haklı çıkarır mı?",
        choiceType: 'PASSIVE',
        stressEffect: 10,
        personalityEffects: [
          { axis: 'empathy', change: -10 },
          { axis: 'conformity', change: -5 }
        ],
        memory: { emotion: 'GUILT', weight: 'MEDIUM', customNote: 'Başkasının parasını aldın' }
      },
      {
        text: "İhbar kutusuna at",
        effect: { money: 0, discipline: 10, charisma: 0 },
        feedback: "Okul idaresine verdin. Kim alır bilinmez ama en azından sen almadın.",
        choiceType: 'NEUTRAL',
        stressEffect: 0,
        personalityEffects: [
          { axis: 'conformity', change: 5 }
        ],
        memory: { emotion: 'NEUTRAL', weight: 'LOW' }
      }
    ]
  },

  {
    id: 'dilemma_freelance_etik',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "Freelance iş aldın. Müşteri, rakip firmanın verilerini 'araştırmanı' istiyor. Yasal değil ama 2000 TL teklif ediyor.";

      if (p.courage > 70) {
        return base + " Riskli ama para iyi. Yeteneklerin var, kullan!";
      } else if (p.conformity > 70) {
        return base + " Bu yasa dışı. Yakalanırsan her şey biter.";
      }

      return base;
    },
    minAge: 15, maxAge: 18, difficulty: 4, rarity: 'UNCOMMON', isRepeatable: false,
    reqSkills: { coding: 40 },
    personalityCategory: 'MORAL',
    challengesAxis: 'conformity',
    choices: [
      {
        text: "Kabul et, para önemli",
        effect: { money: 2000, discipline: -15, intelligence: 5, charisma: -10 },
        skillUpdates: { coding: 5 },
        feedback: "İşi yaptın, parayı aldın. Ama şimdi bu müşteri seni 'o işler için' tanıyor. Gelecekte daha karanlık teklifler gelebilir.",
        choiceType: 'CHALLENGE',
        stressEffect: 20,
        personalityEffects: [
          { axis: 'conformity', change: -15 },
          { axis: 'courage', change: 5 }
        ],
        memory: { emotion: 'GUILT', weight: 'HIGH', customNote: 'Etik dışı iş yaptın' },
        grantTraits: ['PRAGMATIC'],
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 15, eventId: 'dilemma_dark_job_offer', priority: 'NORMAL' }
        ]
      },
      {
        text: "Reddet, etik önemli",
        effect: { money: 0, discipline: 15, charisma: 5 },
        feedback: "Müşteri kızdı ve başkasını buldu. 2000 TL gitti ama uyuyabiliyorsun geceleri.",
        choiceType: 'PASSIVE',
        stressEffect: -5,
        personalityEffects: [
          { axis: 'conformity', change: 8 },
          { axis: 'empathy', change: 5 }
        ],
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
        grantTraits: ['HONEST']
      }
    ]
  },

  {
    id: 'dilemma_dark_job_offer',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.courage > 70) {
        return "O eski müşteri geri döndü. Bu sefer 10.000 TL teklif ediyor - ama iş çok daha riskli. Büyük risk, büyük kazanç?";
      } else if (p.patience > 70) {
        return "O eski müşteri geri döndü. Bu sefer 10.000 TL teklif ediyor - ama iş çok daha riskli. Sabırlı ol, temiz para daha değerli.";
      }
      return "O eski müşteri geri döndü. Bu sefer 10.000 TL teklif ediyor - ama iş çok daha riskli. Yakalanırsan ciddi sorun.";
    },
    minAge: 16, maxAge: 18, difficulty: 5, rarity: 'RARE',
    personalityCategory: 'RISK',
    challengesAxis: 'courage',
    reqStress: { min: 20 },
    choices: [
      {
        text: "Kabul et, bu son olsun",
        effect: { money: 10000, discipline: -20, health: -15, charisma: -10 },
        feedback: "İşi yaptın ama paranoya başladı. Her gelen mesajda 'yakalandım mı' diye düşünüyorsun. Para var ama huzur yok.",
        choiceType: 'CHALLENGE',
        stressEffect: 40,
        personalityEffects: [
          { axis: 'courage', change: 5 },
          { axis: 'conformity', change: -15 },
          { axis: 'patience', change: -10 }
        ],
        memory: { emotion: 'REGRET', weight: 'HIGH' },
        grantTraits: ['CHEATER']
      },
      {
        text: "Bu sefer kesinlikle hayır",
        effect: { discipline: 20, charisma: 10, money: 0 },
        feedback: "'Bir daha arama' dedin. Müşteri tehdit etti ama bluf yapıyor. Geçmişi geride bırakmak cesaret ister.",
        choiceType: 'CHALLENGE',
        stressEffect: -20,
        personalityEffects: [
          { axis: 'courage', change: 10 },
          { axis: 'conformity', change: 10 },
          { axis: 'empathy', change: 5 }
        ],
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        grantTraits: ['BRAVE']
      }
    ]
  },

  // =================================================================
  // ROMANTİK İKİLEMLER
  // =================================================================

  {
    id: 'dilemma_iki_kisi',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "İki kişi sana ilgi gösteriyor. Biri güvenilir ve sıkıcı, diğeri heyecanlı ama güvenilmez.";

      if (p.courage > 70) {
        return base + " Macera seni çağırıyor! Heyecanlı olan çok çekici...";
      } else if (p.patience > 70) {
        return base + " Uzun vadede kim seni mutlu eder? Heyecan geçici, güven kalıcı.";
      } else if (p.openness > 70) {
        return base + " İkisi de ilginç! Ama ikisini de seçemezsin...";
      }

      return base + " İkisi de senden cevap bekliyor.";
    },
    minAge: 14, maxAge: 18, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'RISK',
    challengesAxis: 'courage',
    choices: [
      {
        text: "Güvenilir olanı seç",
        effect: { familyRelation: 10, discipline: 5, charisma: -5, health: 5 },
        feedback: "Sakin, istikrarlı bir ilişki. Ailen onaylıyor. Ama bazen 'ya diğerini seçseydim' diye düşünüyorsun.",
        choiceType: 'PASSIVE',
        stressEffect: -10,
        personalityEffects: [
          { axis: 'patience', change: 8 },
          { axis: 'courage', change: -5 }
        ],
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' }
      },
      {
        text: "Heyecanlı olanı seç",
        effect: { charisma: 10, discipline: -10, familyRelation: -5, health: 5 },
        feedback: "Her gün macera! Ama bir o kadar da kavga, kıskançlık, belirsizlik. Kalbin hem dolu hem yorgun.",
        choiceType: 'CHALLENGE',
        stressEffect: 15,
        personalityEffects: [
          { axis: 'courage', change: 10 },
          { axis: 'patience', change: -8 }
        ],
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 10, eventId: 'dilemma_toxic_relationship', priority: 'NORMAL' }
        ]
      },
      {
        text: "İkisini de reddet",
        effect: { discipline: 10, charisma: -10, health: 10 },
        feedback: "Yalnız kaldın ama bağımsızsın. Belki doğru kişi henüz gelmedi.",
        choiceType: 'NEUTRAL',
        stressEffect: 0,
        personalityEffects: [
          { axis: 'patience', change: 5 },
          { axis: 'openness', change: -5 }
        ],
        memory: { emotion: 'NEUTRAL', weight: 'LOW' }
      }
    ]
  },

  {
    id: 'dilemma_toxic_relationship',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "İlişkin yoğun ama yıpratıcı. Sürekli kavgalar, barışmalar, drama. Arkadaşların 'bu sağlıklı değil' diyor. Ama onu bırakmak ona zarar verir mi?";
      } else if (p.courage < 30) {
        return "İlişkin yoğun ama yıpratıcı. Sürekli kavgalar, barışmalar, drama. Arkadaşların 'bu sağlıklı değil' diyor. Ama ayrılmak çok zor, çok korkutucu...";
      }
      return "İlişkin yoğun ama yıpratıcı. Sürekli kavgalar, barışmalar, drama. Arkadaşların 'bu sağlıklı değil' diyor ama ayrılmak çok zor.";
    },
    minAge: 15, maxAge: 18, difficulty: 4, rarity: 'RARE',
    personalityCategory: 'GROWTH',
    challengesAxis: 'courage',
    reqStress: { min: 40 },
    choices: [
      {
        text: "Ayrıl, kendini koru",
        effect: { health: 15, discipline: 10, charisma: -10, energy: -30 },
        feedback: "Ayrılık acı verdi. Haftalarca ağladın. Ama zamanla, içindeki fırtına dindi. Kendine ait bir huzur buldun.",
        choiceType: 'CHALLENGE',
        stressEffect: -30,
        personalityEffects: [
          { axis: 'courage', change: 15 },
          { axis: 'patience', change: 10 }
        ],
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Zor ama doğru kararı verdin' }
      },
      {
        text: "Bir şans daha ver",
        effect: { charisma: 5, health: -15, discipline: -10, energy: -20 },
        feedback: "Barıştınız. Bir hafta güzel geçti, sonra yine aynı döngü. Ne zaman çıkacaksın bu çarktan?",
        choiceType: 'PASSIVE',
        stressEffect: 20,
        personalityEffects: [
          { axis: 'courage', change: -8 },
          { axis: 'patience', change: -5 }
        ],
        memory: { emotion: 'REGRET', weight: 'MEDIUM' }
      }
    ]
  },

  // =================================================================
  // TOPLUMSAL BASKI vs BİREYSELLİK
  // =================================================================

  {
    id: 'dilemma_farkli_olmak',
    text: (ctx: EventContext) => {
      const p = ctx.personality;

      if (ctx.traits.includes('REBELLIOUS')) {
        return "Herkes aynı kıyafetleri giyiyor, aynı müzikleri dinliyor. Sen farklısın ve bunu göstermek istiyorsun. İsyankar ruhun özgürlük istiyor!";
      }

      if (p.conformity > 70) {
        return "Okulda herkes belirli bir 'kalıba' uyuyor. Sen tam uymuyorsun. Uyum sağlamak hayatı kolaylaştırır... ama sen kim olursun?";
      } else if (p.conformity < 30) {
        return "Okulda herkes belirli bir 'kalıba' uyuyor. Sen tam uymuyorsun ve umurunda da değil. Neden başkalarının beklentilerine göre yaşayasın?";
      }

      return "Okulda herkes belirli bir 'kalıba' uyuyor. Sen tam uymuyorsun. Değişmeli misin, yoksa kendin mi kalmalısın?";
    },
    minAge: 12, maxAge: 18, difficulty: 3, rarity: 'COMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    challengesAxis: 'conformity',
    choices: [
      {
        text: "Kendin ol, ne derlerse desinler",
        effect: { charisma: -10, discipline: 10, health: 10, intelligence: 5 },
        feedback: "Bazıları garip buldu, bazıları hayranlık duydu. Yalnız kaldın ama özgürsün. Kendi yolun senin.",
        choiceType: 'CHALLENGE',
        stressEffect: 10,
        personalityEffects: [
          { axis: 'conformity', change: -15 },
          { axis: 'courage', change: 10 }
        ],
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        grantTraits: ['BRAVE']
      },
      {
        text: "Uyum sağla, hayat kolaylaşsın",
        effect: { charisma: 10, discipline: -5, health: -5 },
        feedback: "Herkes gibi oldun. Kabul gördün, arkadaşlar arttı. Ama aynaya baktığında, tanıdığın kişiyi görüyor musun?",
        choiceType: 'PASSIVE',
        stressEffect: 5,
        personalityEffects: [
          { axis: 'conformity', change: 10 },
          { axis: 'courage', change: -5 }
        ],
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Kendinden vazgeçtin' }
      },
      {
        text: "Dengeyi bul: özünü koru, keskin köşeleri yumuşat",
        effect: { charisma: 5, discipline: 5, intelligence: 3 },
        feedback: "Tam kendin değilsin ama tamamen de başkası değil. Pratik bir çözüm. Ama bu 'gerçek sen' mi?",
        choiceType: 'NEUTRAL',
        stressEffect: 0,
        personalityEffects: [
          { axis: 'patience', change: 5 }
        ],
        memory: { emotion: 'NEUTRAL', weight: 'LOW' }
      }
    ]
  },

  // =================================================================
  // FEDAKARLIK TEMELLİ İKİLEMLER
  // =================================================================

  {
    id: 'dilemma_kardes_firsati',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "Hayalindeki yaz kampına kabul edildin! Ama aynı hafta küçük kardeşinin ameliyatı var.";

      if (p.empathy > 70) {
        return base + " Ailen 'Sen git' diyor ama kardeşin seni istiyor yanında. Gözleri sana dönük... gidemezsin, değil mi?";
      } else if (p.empathy < 30) {
        return base + " Ailen 'Sen git' diyor. Zaten sen hastanede ne yapacaksın? Kamp daha önemli.";
      }

      return base + " Ailen 'Sen git' diyor ama kardeşin seni istiyor yanında.";
    },
    minAge: 12, maxAge: 18, difficulty: 5, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        text: "Kampa git (Kendi hayatın)",
        effect: { intelligence: 10, charisma: 5, familyRelation: -15, health: -10 },
        skillUpdates: { coding: 5 },
        feedback: "Kamp muhteşemdi, çok şey öğrendin. Ama kardeşinin ameliyat sonrası 'Neredeydin?' sorusu hâlâ kulaklarında çınlıyor.",
        choiceType: 'PASSIVE',
        stressEffect: 20,
        personalityEffects: [
          { axis: 'empathy', change: -10 },
          { axis: 'courage', change: 3 }
        ],
        memory: { emotion: 'GUILT', weight: 'HIGH', customNote: 'Kardeşini yalnız bıraktın' }
      },
      {
        text: "Kal, kardeşin yanında (Fedakarlık)",
        effect: { familyRelation: 20, health: 5, intelligence: -5 },
        feedback: "Kardeşin elini tutarken gözleri doldu. 'Teşekkür ederim abi/abla' dedi. Fırsatı kaçırdın ama ailenin minneti büyük.",
        choiceType: 'CHALLENGE',
        stressEffect: -10,
        personalityEffects: [
          { axis: 'empathy', change: 15 },
          { axis: 'patience', change: 5 }
        ],
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Ailen için fedakarlık yaptın' },
        grantTraits: ['EMPATHETIC']
      }
    ]
  },

  {
    id: 'dilemma_arkadas_vs_basari',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "Proje grubundasın. Arkadaşın hiç çalışmadı ama sen çok çalıştın. Öğretmen 'bireysel katkıları değerlendirecek' dedi.";

      if (p.empathy > 70) {
        return base + " Arkadaşın senden onu kurtarmanı istiyor. Zor durumda, yardım etmeli misin?";
      } else if (p.conformity > 70) {
        return base + " Arkadaşın senden onu kurtarmanı istiyor. Ama bu adaletsiz olur...";
      }

      return base + " Arkadaşın senden onu kurtarmanı istiyor.";
    },
    minAge: 12, maxAge: 18, difficulty: 4, rarity: 'COMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        text: "Gerçeği söyle (Adalet)",
        effect: { discipline: 10, charisma: -10, intelligence: 5 },
        gradeUpdates: { science: 10 },
        feedback: "Öğretmene gerçeği söyledin. Yüksek not aldın, arkadaşın düşük. Artık 'arkadaş' mısınız emin değilsin.",
        choiceType: 'CHALLENGE',
        stressEffect: 10,
        personalityEffects: [
          { axis: 'conformity', change: 8 },
          { axis: 'empathy', change: -5 }
        ],
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM' }
      },
      {
        text: "Onu da koru (Sadakat)",
        effect: { charisma: 10, discipline: -10, intelligence: -3 },
        gradeUpdates: { science: 3 },
        feedback: "'Beraber yaptık' dedin. İkiniz de ortalama not aldınız. Arkadaşın minnettar ama sen hak ettiğini alamadın.",
        choiceType: 'PASSIVE',
        stressEffect: 5,
        personalityEffects: [
          { axis: 'empathy', change: 8 },
          { axis: 'conformity', change: -5 }
        ],
        memory: { emotion: 'REGRET', weight: 'LOW' }
      },
      {
        text: "Öğretmenle özel konuş",
        effect: { intelligence: 8, discipline: 5, charisma: 3 },
        gradeUpdates: { science: 7 },
        feedback: "Öğretmenle gizlice konuştun. O anladı, sana daha yüksek not verdi. Arkadaşın bilmiyor ama... bu da bir tür yalan değil mi?",
        choiceType: 'NEUTRAL',
        stressEffect: 5,
        personalityEffects: [
          { axis: 'courage', change: -3 },
          { axis: 'patience', change: 5 }
        ],
        memory: { emotion: 'GUILT', weight: 'LOW' }
      }
    ]
  },

  // =================================================================
  // SIRADIŞI AHLAKI İKILEMLER
  // =================================================================

  {
    id: 'dilemma_kayip_hayvan',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "Yolda yaralı bir köpek buldun. Veteriner pahalı ve ailen hayvan istemiyor.";

      if (p.empathy > 70) {
        return base + " Köpeğin gözleri sana bakıyor, yalvarıyor. Bırakamazsın onu!";
      } else if (p.empathy < 30) {
        return base + " Ama köpeği bırakırsan muhtemelen ölecek. Senin problemin mi gerçekten?";
      }

      return base + " Ama köpeği bırakırsan muhtemelen ölecek.";
    },
    minAge: 8, maxAge: 18, difficulty: 4, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        text: "Veterinere götür, ne pahasına olursa olsun",
        effect: { money: -300, familyRelation: -10, health: 5, discipline: 5 },
        feedback: "Biriktirdiğin tüm para gitti. Ailen kızdı. Ama köpek iyileşti ve şimdi bir barınakta yeni aile bekliyor. Değdi mi?",
        choiceType: 'CHALLENGE',
        stressEffect: 10,
        personalityEffects: [
          { axis: 'empathy', change: 15 },
          { axis: 'courage', change: 5 }
        ],
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Bir hayat kurtardın' },
        grantTraits: ['EMPATHETIC']
      },
      {
        text: "Bırak, doğanın işi",
        effect: { money: 0, discipline: 5, health: -10 },
        feedback: "Döndün ve baktığında köpek hâlâ oradaydı. Gözleri sana bakıyordu. O gece uyuyamadın.",
        choiceType: 'PASSIVE',
        stressEffect: 20,
        personalityEffects: [
          { axis: 'empathy', change: -10 },
          { axis: 'patience', change: 3 }
        ],
        memory: { emotion: 'GUILT', weight: 'HIGH', customNote: 'Yardım etmedin' }
      },
      {
        text: "Sosyal medyada paylaş, yardım iste",
        effect: { charisma: 5, discipline: 3 },
        feedback: "Post viral oldu! Birisi gelip köpeği aldı ve tedavi ettirdi. Sen doğrudan yardım etmedin ama köprü oldun.",
        choiceType: 'NEUTRAL',
        stressEffect: -5,
        personalityEffects: [
          { axis: 'openness', change: 5 },
          { axis: 'empathy', change: 5 }
        ],
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' }
      }
    ]
  },

  {
    id: 'dilemma_sinif_hirsizi',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      let base = "Sınıfta hırsızlık oluyor. Sen hırsızın kim olduğunu biliyorsun - fakir bir aileden gelen, zorluk çeken bir çocuk. Çaldığı şey: yemek parası.";

      if (p.empathy > 70) {
        return base + " Açlık... nasıl suçlarsın bu çocuğu? Ama diğerleri de mağdur.";
      } else if (p.conformity > 70) {
        return base + " Hırsızlık yanlış, sebep ne olursa olsun. Kurallar var.";
      }

      return base;
    },
    minAge: 10, maxAge: 18, difficulty: 5, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        text: "Sessiz kal (Empati)",
        effect: { discipline: -10, charisma: 5, health: -5 },
        feedback: "Hırsızlık devam etti, herkes birbirinden şüpheleniyor. Sınıfın ortamı bozuldu. Ama o çocuk aç kalmadı.",
        choiceType: 'PASSIVE',
        stressEffect: 15,
        personalityEffects: [
          { axis: 'empathy', change: 5 },
          { axis: 'conformity', change: -8 }
        ],
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM' }
      },
      {
        text: "Öğretmene söyle (Kural)",
        effect: { discipline: 10, charisma: -15 },
        feedback: "Çocuk disipline gitti. Durumu öğrenince aile yardımı aldı. Ama sen 'ispiyoncu' oldun ve çocuk sana nefret dolu bakıyor.",
        choiceType: 'CHALLENGE',
        stressEffect: 10,
        personalityEffects: [
          { axis: 'conformity', change: 10 },
          { axis: 'empathy', change: -5 }
        ],
        memory: { emotion: 'GUILT', weight: 'HIGH' }
      },
      {
        text: "Çocukla konuş, yardım teklif et",
        effect: { charisma: 10, money: -50, discipline: 5 },
        feedback: "Gizlice konuştun ve kendi harçlığından verdin. Hırsızlık durdu. İkiniz arasında garip ama derin bir bağ oluştu.",
        choiceType: 'CHALLENGE',
        stressEffect: -10,
        personalityEffects: [
          { axis: 'empathy', change: 15 },
          { axis: 'courage', change: 8 }
        ],
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Sessizce yardım ettin' },
        grantTraits: ['EMPATHETIC']
      }
    ]
  },

  // =================================================================
  // YENİ ÇOCUKLUK AHLAKI İKİLEMLERİ (6-12 YAŞ)
  // =================================================================

  {
    id: 'dilemma_kirik_vazo',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Top oynarken annenin en sevdiği vazoyu kırdın. Kimse görmedi. Kardeşin odada uyuyor... Onu suçlasan kimse anlamaz.";
      } else if (p.empathy < 30) {
        return "Top oynarken vazoyu kırdın. Kimse görmedi. Kardeşin odada - suçu ona at, çok kolay.";
      }
      return "Top oynarken annenin en sevdiği vazoyu kırdın. Kimse görmedi. Kardeşin odada uyuyor...";
    },
    minAge: 6, maxAge: 12, difficulty: 3, rarity: 'COMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'vazo_itiraf',
        text: "İtiraf et",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { familyRelation: 5, discipline: 10 },
        personalityEffects: [{ axis: 'empathy', change: 8 }],
        stressEffect: 15,
        feedback: "Annen kızdı ama 'en azından dürüst oldun' dedi. Ceza hafif geçti.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Dürüst oldun' },
        grantTraits: ['HONEST'],
      },
      {
        id: 'vazo_kardes',
        text: "Kardeşini suçla",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -15, discipline: -10 },
        personalityEffects: [{ axis: 'empathy', change: -10 }],
        stressEffect: 5,
        feedback: "Kardeşin ağladı, ceza aldı. Ama sen biliyorsun gerçeği. Her bakışında suçluluk...",
        memory: { emotion: 'GUILT', weight: 'HIGH', customNote: 'Kardeşini suçladın' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 20, eventId: 'dilemma_vazo_gerçek', priority: 'NORMAL' }
        ],
      },
      {
        id: 'vazo_gizle',
        text: "Parçaları sakla, kimse bilmesin",
        choiceType: 'NEUTRAL',
        effect: { intelligence: 3, discipline: -5 },
        stressEffect: 10,
        feedback: "Parçaları çöpe attın. Annen 'vazo nerde?' diye sordu ama bulamadı. Sır seninle...",
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'dilemma_vazo_gerçek',
    text: "Yıllar sonra, kardeşin hâlâ 'o vazo olayını' hatırlıyor. 'Ben kırmamıştım' diyor hep. Gerçeği söyleyecek misin?",
    minAge: 10, maxAge: 18, difficulty: 3, rarity: 'RARE',
    personalityCategory: 'MORAL',
    choices: [
      {
        text: "Gerçeği söyle, özür dile",
        effect: { familyRelation: 10, discipline: 10 },
        personalityEffects: [{ axis: 'empathy', change: 10 }, { axis: 'courage', change: 8 }],
        stressEffect: -20,
        feedback: "Kardeşin şaşırdı, sonra sarıldı. 'Biliyordum' dedi. Yük kalktı.",
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        grantTraits: ['HONEST'],
      },
      {
        text: "Sus, çok geç artık",
        effect: { familyRelation: -5 },
        personalityEffects: [{ axis: 'courage', change: -5 }],
        stressEffect: 10,
        feedback: "Sustun. Kardeşin yine kırgın bakışlarla gitti. Bu sır seninle gidecek.",
        memory: { emotion: 'REGRET', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'dilemma_oyuncak_calma',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Arkadaşının evinde muhteşem bir oyuncak gördün. Eline aldın... Cebine sığar. Ama bu çalmak...";
      }
      return "Arkadaşının evinde çok istediğin bir oyuncak var. Kimse bakmazken alabilirsin...";
    },
    minAge: 6, maxAge: 10, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'oyuncak_birak',
        text: "Yerine koy, doğru olan bu",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { discipline: 10 },
        personalityEffects: [{ axis: 'empathy', change: 8 }],
        stressEffect: 10,
        feedback: "Zor oldu ama koydun. Belki bir gün kendin alırsın.",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'oyuncak_al',
        text: "Cebine koy, kimse görmedi",
        choiceType: 'PASSIVE',
        effect: { discipline: -15, charisma: -5 },
        personalityEffects: [{ axis: 'empathy', change: -10 }],
        stressEffect: 15,
        feedback: "Aldın. Eve geldin. Ama artık o oyuncakla oynamak eğlenceli değil...",
        memory: { emotion: 'GUILT', weight: 'HIGH', customNote: 'Arkadaşından çaldın' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 5, eventId: 'dilemma_calinti_bulundu', priority: 'HIGH' }
        ],
      },
    ],
  },

  {
    id: 'dilemma_calinti_bulundu',
    text: "Arkadaşın oyuncağını arıyor. Annesi herkese soruyor. Şimdi ne yapacaksın?",
    minAge: 6, maxAge: 12, difficulty: 4, rarity: 'RARE',
    personalityCategory: 'MORAL',
    choices: [
      {
        text: "Geri ver ve özür dile",
        effect: { charisma: -10, discipline: 15, familyRelation: -10 },
        personalityEffects: [{ axis: 'empathy', change: 10 }, { axis: 'courage', change: 10 }],
        stressEffect: -15,
        feedback: "Herkes şok oldu. Ceza aldın. Ama içindeki yük kalktı.",
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        grantTraits: ['HONEST'],
      },
      {
        text: "Oyuncağı at, kimse bilmesin",
        effect: { discipline: -5 },
        stressEffect: 20,
        feedback: "Çöpe attın. Kimse bulamadı. Ama o oyuncak her gece rüyana giriyor.",
        memory: { emotion: 'GUILT', weight: 'HIGH' },
      },
    ],
  },

  {
    id: 'dilemma_arkadaslik_sirri',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "En yakın arkadaşın sana bir sır verdi: evden kaçmayı planlıyor. Tehlikeli ama sana güveniyor...";
      }
      return "Arkadaşın sana bir sır verdi: evden kaçmayı planlıyor. Anne babasına söylemeli misin?";
    },
    minAge: 12, maxAge: 18, difficulty: 5, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'sir_anlat',
        text: "Ailesine söyle, güvenliği önemli",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', min: 50 }],
        effect: { charisma: -15, discipline: 10, familyRelation: 5 },
        personalityEffects: [{ axis: 'empathy', change: 5 }, { axis: 'conformity', change: 5 }],
        stressEffect: 20,
        feedback: "Arkadaşın sana çok kızdı. 'İhanetçi!' dedi. Ama güvende. Belki bir gün anlayacak.",
        memory: { emotion: 'REGRET', weight: 'HIGH', customNote: 'Arkadaşını korudun ama güvenini kaybettin' },
      },
      {
        id: 'sir_sakla',
        text: "Sırrı sakla, güvenini koruma",
        choiceType: 'PASSIVE',
        effect: { charisma: 5, discipline: -10 },
        personalityEffects: [{ axis: 'empathy', change: -3 }, { axis: 'conformity', change: -5 }],
        stressEffect: 25,
        feedback: "Sustun. Arkadaşın kaçtı. 3 gün sonra bulundu. Polis sorgusu... Her şey karıştı.",
        memory: { emotion: 'GUILT', weight: 'HIGH' },
      },
      {
        id: 'sir_ikna',
        text: "Arkadaşını vazgeçirmeye çalış",
        choiceType: 'NEUTRAL',
        effect: { charisma: 8, intelligence: 5 },
        personalityEffects: [{ axis: 'courage', change: 5 }],
        stressEffect: 15,
        feedback: "Saatlerce konuştun. Sonunda vazgeçti. Kimse bilmiyor ama sen bir hayat kurtardın.",
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        grantTraits: ['EMPATHETIC'],
      },
    ],
  },

  {
    id: 'dilemma_sosyal_medya_ifsa',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Birisi sınıftan bir çocuğun utanç verici fotoğrafını paylaştı. Herkes gülüyor. O çocuk ağlıyor.";
      }
      return "Sınıftan birinin utanç verici fotoğrafı paylaşıldı. Herkes gülüyor, beğeniyor. Sen?";
    },
    minAge: 12, maxAge: 18, difficulty: 4, rarity: 'COMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'ifsa_savun',
        text: "O çocuğu savun, paylaşımı şikayet et",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { charisma: -10, discipline: 10 },
        personalityEffects: [{ axis: 'courage', change: 10 }, { axis: 'empathy', change: 8 }],
        stressEffect: 20,
        feedback: "'White knight' dediler, dalga geçtiler. Ama o çocuk teşekkür etti. Belki tek sen dost oldun.",
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        grantTraits: ['BRAVE'],
      },
      {
        id: 'ifsa_gul',
        text: "Sen de beğen ve gül",
        choiceType: 'PASSIVE',
        effect: { charisma: 5, discipline: -10 },
        personalityEffects: [{ axis: 'empathy', change: -8 }],
        stressEffect: 0,
        feedback: "Grupta kaldın. Popülersin. Ama o çocuğun gözlerini hatırlıyorsun...",
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
      },
      {
        id: 'ifsa_sessiz',
        text: "Sessiz kal, karışma",
        choiceType: 'NEUTRAL',
        effect: { discipline: -3 },
        personalityEffects: [{ axis: 'courage', change: -3 }],
        stressEffect: 5,
        feedback: "Beğenmedin ama savunmadın da. Ortada kaldın. Rahat mısın?",
        memory: { emotion: 'NEUTRAL', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'dilemma_kopya_satin_alma',
    text: "Yarınki sınavın cevap anahtarı satılıyor. 100 TL. Herkes alıyor. Sen?",
    minAge: 14, maxAge: 18, difficulty: 4, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'kopya_al',
        text: "Al, herkes alıyor zaten",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', min: 40 }],
        effect: { money: -100, intelligence: -5, discipline: -15 },
        gradeUpdates: { math: 15 },
        personalityEffects: [{ axis: 'conformity', change: 5 }, { axis: 'empathy', change: -5 }],
        stressEffect: 15,
        feedback: "Sınav çok kolay geçti. Ama o not senin değil. Ve şimdi satıcı senden 'iyilik' bekliyor...",
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 10, eventId: 'dilemma_santaj', priority: 'HIGH' }
        ],
      },
      {
        id: 'kopya_alma',
        text: "Hayır, kendi gücümle",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'conformity', max: 60 }],
        effect: { discipline: 15, charisma: -5 },
        gradeUpdates: { math: -5 },
        personalityEffects: [{ axis: 'conformity', change: -5 }, { axis: 'courage', change: 8 }],
        stressEffect: 15,
        feedback: "Notun düşük geldi. Herkes yüksek aldı. Ama senin notun gerçek.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
        grantTraits: ['HONEST'],
      },
    ],
  },

  {
    id: 'dilemma_santaj',
    text: "O 'cevap anahtarı' satan kişi şimdi senden iyilik istiyor. 'Ödevimi yap, yoksa öğretmene söylerim.'",
    minAge: 14, maxAge: 18, difficulty: 5, rarity: 'RARE',
    personalityCategory: 'CONFLICT',
    challengesAxis: 'courage',
    choices: [
      {
        text: "Ödevini yap, risk alma",
        effect: { energy: -30, discipline: -10, intelligence: 3 },
        personalityEffects: [{ axis: 'courage', change: -10 }],
        stressEffect: 25,
        feedback: "Yaptın. Ama bu bitmeyecek. Şimdi kölesin.",
        memory: { emotion: 'REGRET', weight: 'HIGH' },
      },
      {
        text: "Hayır de, ne olursa olsun",
        effect: { discipline: 10, charisma: -10 },
        personalityEffects: [{ axis: 'courage', change: 15 }],
        stressEffect: 30,
        feedback: "'Söyle bakalım' dedin. O da söyledi. Disipline gittin. Ama özgürsün.",
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
        grantTraits: ['BRAVE'],
      },
      {
        text: "Ona karşı kanıt topla",
        effect: { intelligence: 10 },
        personalityEffects: [{ axis: 'courage', change: 5 }],
        stressEffect: 20,
        feedback: "Mesajları sakladın. O seni ihbar ettiğinde, sen de onu ihbar ettin. İkiniz de ceza aldınız ama artık eşitsiniz.",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'dilemma_yasli_komsu',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Yaşlı komşunuz düştü, yardıma ihtiyacı var. Ama arkadaşlarınla buluşacaktın, geç kalıyorsun...";
      }
      return "Yaşlı komşunuz yardım istiyor. Ama arkadaşların bekliyor.";
    },
    minAge: 10, maxAge: 18, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'komsu_yardim',
        text: "Yardım et, arkadaşlar beklesin",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { charisma: -5, familyRelation: 10, discipline: 5 },
        personalityEffects: [{ axis: 'empathy', change: 8 }],
        stressEffect: 10,
        feedback: "Yarım saat geçti. Arkadaşlar kızdı ama yaşlı komşunuz size çay ısmarladı ve teşekkür etti.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
      {
        id: 'komsu_gec',
        text: "Özür dile ve geç, acelin var",
        choiceType: 'PASSIVE',
        effect: { charisma: 5, familyRelation: -5 },
        personalityEffects: [{ axis: 'empathy', change: -5 }],
        stressEffect: 0,
        feedback: "Arkadaşlarla eğlendin ama eve gelince yaşlı komşunun ambulansla götürüldüğünü duydun.",
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'dilemma_cevre_kirliligi',
    text: "Piknikte herkes çöplerini yere atıyor. Sen ne yapacaksın?",
    minAge: 8, maxAge: 18, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'cevre_topla',
        text: "Kendi çöpünü topla, hatta başkalarınınkini de",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'conformity', max: 50 }],
        effect: { discipline: 8, charisma: -5 },
        personalityEffects: [{ axis: 'empathy', change: 5 }, { axis: 'conformity', change: -5 }],
        stressEffect: 10,
        feedback: "'Temizlikçi mi oldun?' dediler. Ama doğayı korudun. Bir gün anlayacaklar.",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'cevre_ayni',
        text: "Sen de at, herkes atıyor",
        choiceType: 'PASSIVE',
        effect: { charisma: 3, discipline: -5 },
        personalityEffects: [{ axis: 'conformity', change: 5 }, { axis: 'empathy', change: -3 }],
        stressEffect: 0,
        feedback: "Attın. Kolaydı. Ama geri döndüğünde o güzel yerin çöplük olduğunu gördün.",
        memory: { emotion: 'GUILT', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'dilemma_dedikodu',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Arkadaş grubunda birinin sırrını konuşuyorlar. Sen de biliyorsun o sırrı... Paylaşırsan popüler olursun.";
      }
      return "Birinin sırrını biliyorsun. Paylaşırsan herkes seni ilgi çekici bulacak.";
    },
    minAge: 10, maxAge: 18, difficulty: 3, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'dedikodu_paylas',
        text: "Sırrı paylaş, ilgi çekici ol",
        choiceType: 'PASSIVE',
        effect: { charisma: 10, discipline: -10 },
        personalityEffects: [{ axis: 'empathy', change: -8 }],
        stressEffect: 0,
        feedback: "Anlattın. Herkes dinledi. Popülersin. Ama o kişi öğrenirse?",
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 10, eventId: 'dilemma_dedikodu_sonuc', priority: 'NORMAL' }
        ],
      },
      {
        id: 'dedikodu_sus',
        text: "Sus, sır sırdır",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { charisma: -5, discipline: 8 },
        personalityEffects: [{ axis: 'empathy', change: 5 }],
        stressEffect: 5,
        feedback: "'Neden anlatmıyorsun?' diye sordular. 'Sır' dedin. Güvenilir biri oldun.",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'dilemma_dedikodu_sonuc',
    text: "O kişi sırrın yayıldığını öğrendi. Senin anlattığını biliyor. Yüz yüze geldiniz.",
    minAge: 10, maxAge: 18, difficulty: 4, rarity: 'RARE',
    personalityCategory: 'CONFLICT',
    choices: [
      {
        text: "Özür dile, kabul et",
        effect: { charisma: -5, discipline: 10 },
        personalityEffects: [{ axis: 'courage', change: 8 }, { axis: 'empathy', change: 5 }],
        stressEffect: -10,
        feedback: "'Söylememeliyim' dedin. Affetmedi ama en azından yüzleştin.",
        memory: { emotion: 'REGRET', weight: 'MEDIUM' },
      },
      {
        text: "Inkar et: 'Ben söylemedim'",
        effect: { charisma: -10, discipline: -10 },
        personalityEffects: [{ axis: 'courage', change: -5 }, { axis: 'empathy', change: -5 }],
        stressEffect: 15,
        feedback: "İnkar ettin ama ikna olmadı. Şimdi hem dedikoducu hem yalancısın.",
        memory: { emotion: 'GUILT', weight: 'HIGH' },
      },
    ],
  },

  {
    id: 'dilemma_hayvan_bulma',
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Sokakta yaralı bir kedi buldun. Veteriner pahalı, ailen izin vermez. Ama bırakamazsın...";
      }
      return "Sokakta yaralı bir kedi var. Ne yapacaksın?";
    },
    minAge: 8, maxAge: 18, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'kedi_veteriner',
        text: "Kumbaranı boşalt, veterinere götür",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { money: -200, health: 5, familyRelation: -5 },
        personalityEffects: [{ axis: 'empathy', change: 15 }],
        stressEffect: 15,
        feedback: "Param bitti, aile kızdı. Ama kedi iyileşti ve birisi sahiplendi. Bir hayat kurtardın.",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Bir hayvan kurtardın' },
        grantTraits: ['EMPATHETIC'],
      },
      {
        id: 'kedi_birak',
        text: "Üzüldüm ama yapacak bir şey yok",
        choiceType: 'PASSIVE',
        effect: { discipline: 3 },
        personalityEffects: [{ axis: 'empathy', change: -5 }],
        stressEffect: 10,
        feedback: "Devam ettin. Ama o gece rüyanda o kediyi gördün.",
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
      },
      {
        id: 'kedi_sosyal',
        text: "Sosyal medyada yardım iste",
        choiceType: 'NEUTRAL',
        effect: { charisma: 5 },
        personalityEffects: [{ axis: 'openness', change: 3 }],
        stressEffect: 5,
        feedback: "Post paylaştın. Birisi gelip kediyi aldı ve tedavi ettirdi. Köprü oldun.",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'dilemma_yemek_paylasimi',
    text: "Okulda öğle yemeği vakti. Yanındaki çocuğun yemeği yok, parasız. Sen fazla getirdin...",
    minAge: 7, maxAge: 15, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'yemek_ver',
        text: "Yarısını ver",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 60 }],
        effect: { health: -3, charisma: 8, familyRelation: 5 },
        personalityEffects: [{ axis: 'empathy', change: 8 }],
        stressEffect: 5,
        feedback: "Sandviçin yarısını verdin. Çocuk utangaç bir teşekkür etti. Karnın az aç ama kalbin tok.",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'yemek_tut',
        text: "Annem bana hazırladı, paylaşamam",
        choiceType: 'PASSIVE',
        effect: { health: 5 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: 0,
        feedback: "Yedin. Lezzetliydi. Ama yanındaki çocuk boş oturdu.",
        memory: { emotion: 'NEUTRAL', weight: 'LOW' },
      },
    ],
  },

  // =================================================================
  // ROMANTİK İLİŞKİ AHLAKI İKİLEMLERİ
  // Sevgili/flört varken tetiklenen ikilemler
  // =================================================================

  {
    id: 'dilemma_romantic_jealousy_test',
    text: (ctx: EventContext) => {
      const partner = ctx.npcs?.find(n => n.role === 'PARTNER');
      const name = partner?.name || 'Sevgilin';
      const p = ctx.personality;

      let base = `${name} son günlerde sınıftan biriyle çok fazla vakit geçiriyor. "Sadece arkadaşız" diyor ama içinde bir şüphe var...`;

      if (p.empathy > 70) {
        return base + " Belki gerçekten öyledir. Ama içindeki şüphe seni kemiriyor.";
      } else if (p.empathy < 30) {
        return base + " Kimse seni aptal yerine koyamaz. Bir şeyler dönüyor.";
      } else if (p.patience > 70) {
        return base + " Sakin olmalısın. Belki yanlış anlıyorsun.";
      }

      return base + " Bu durumu nasıl ele alacaksın?";
    },
    minAge: 13,
    maxAge: 18,
    rarity: 'UNCOMMON',
    isRepeatable: false,
    reqNPCRole: 'PARTNER',
    personalityCategory: 'CONFLICT',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'jealousy_confront',
        text: '😤 Yüzleş ve hesap sor',
        effect: { charisma: -5, discipline: 3 },
        feedback: "Tartıştınız. 'Güvenmiyorsan bu ilişki yürümez' dedi. Belki haklı...",
        choiceType: 'CHALLENGE',
        npcRelationChange: -20,
        stressEffect: 20,
        personalityEffects: [
          { axis: 'patience', change: -8 },
          { axis: 'courage', change: 3 }
        ],
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Kıskançlık kavgası' },
      },
      {
        id: 'jealousy_trust',
        text: '🤝 Güven: "Sana inanıyorum"',
        effect: { charisma: 5 },
        feedback: "Güvendiğini gösterdin. Gülümsedi ve 'Sen en iyisisin' dedi.",
        choiceType: 'PASSIVE',
        npcRelationChange: 10,
        stressEffect: -5,
        personalityEffects: [
          { axis: 'patience', change: 5 },
          { axis: 'empathy', change: 3 }
        ],
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: 'jealousy_spy',
        text: '🕵️ Gizlice araştır',
        effect: { intelligence: 3, charisma: -3 },
        feedback: "Takip ettin, mesajlarına baktın... Paranoya seni ele geçiriyor.",
        choiceType: 'PASSIVE',
        stressEffect: 15,
        personalityEffects: [
          { axis: 'empathy', change: -5 },
          { axis: 'patience', change: -3 }
        ],
        memory: { emotion: 'GUILT', weight: 'MEDIUM', customNote: 'Gizlice takip ettin' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 5, eventId: 'dilemma_caught_spying', priority: 'NORMAL' }
        ],
      },
    ],
  },

  {
    id: 'dilemma_caught_spying',
    text: (ctx: EventContext) => {
      const partner = ctx.npcs?.find(n => n.role === 'PARTNER');
      const name = partner?.name || 'Sevgilin';

      return `${name} senin onu takip ettiğini, mesajlarına baktığını öğrendi. Yüzü kıpkırmızı: "Sen nasıl bunu yaparsın?! Bu güvensizlik mi?!"`;
    },
    minAge: 13,
    maxAge: 18,
    rarity: 'UNCOMMON',
    isRepeatable: false,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'spy_apologize',
        text: '😔 Özür dile: "Hata yaptım"',
        effect: { charisma: 3 },
        feedback: "Samimi özrün kabul gördü. Ama güven zedelendi. İyileşmesi zaman alacak.",
        choiceType: 'PASSIVE',
        npcRelationChange: -10,
        stressEffect: 10,
        personalityEffects: [
          { axis: 'courage', change: 3 },
          { axis: 'empathy', change: 5 }
        ],
        memory: { emotion: 'REGRET', weight: 'HIGH' },
      },
      {
        id: 'spy_justify',
        text: '😤 Kendini savun: "Şüphelenecek şeyler vardı!"',
        effect: { discipline: 3, charisma: -5 },
        feedback: "'Sen hâlâ anlamamışsın' dedi ve gitti. İlişki tehlikede.",
        choiceType: 'CHALLENGE',
        npcRelationChange: -25,
        stressEffect: 20,
        personalityEffects: [
          { axis: 'empathy', change: -5 },
          { axis: 'conformity', change: -3 }
        ],
      },
    ],
  },

  {
    id: 'dilemma_temptation',
    text: (ctx: EventContext) => {
      const partner = ctx.npcs?.find(n => n.role === 'PARTNER');
      const partnerName = partner?.name || 'Sevgilin';
      const p = ctx.personality;

      let base = `${partnerName} ile birlikteyken sınıftan çok çekici biri seninle flört etmeye başladı. "${partnerName} duyarsa ne olur?" diye düşünüyorsun ama... Bu ilgi hoşuna gidiyor.`;

      if (p.empathy > 70) {
        return base + " Ama ${partnerName}'e ihanet etmek... Bunu yapabilir misin?";
      } else if (p.courage > 70) {
        return base + " Risk almak heyecan verici, değil mi?";
      }

      return base;
    },
    minAge: 13,
    maxAge: 18,
    rarity: 'RARE',
    isRepeatable: false,
    reqNPCRole: 'PARTNER',
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'temptation_loyal',
        text: '❤️ Sadık kal: "Sevgilim var"',
        effect: { discipline: 8, charisma: 3 },
        feedback: "Net bir şekilde sınır çizdin. Bazıları buna saygı duyar, bazıları ısrar eder.",
        choiceType: 'CHALLENGE',
        personalityEffects: [
          { axis: 'empathy', change: 5 },
          { axis: 'conformity', change: 3 }
        ],
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Sadık kaldın' },
        grantTraits: ['LOYAL'],
      },
      {
        id: 'temptation_flirt_back',
        text: '😏 Flörte karşılık ver',
        effect: { charisma: 5, discipline: -10 },
        feedback: "Zararsız bir flört... değil mi? Ama içinde bir suçluluk var.",
        choiceType: 'PASSIVE',
        npcRelationChange: -10,
        stressEffect: 10,
        personalityEffects: [
          { axis: 'empathy', change: -5 },
          { axis: 'courage', change: 3 }
        ],
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
        futureEvents: [
          { trigger: 'TURNS', turnsLater: 8, eventId: 'dilemma_partner_finds_out', priority: 'HIGH' }
        ],
      },
      {
        id: 'temptation_question',
        text: '🤔 İlişkini sorgula',
        effect: { intelligence: 5 },
        feedback: "Belki bu bir işaret. Gerçekten mutlu musun? Düşünmelisin.",
        choiceType: 'NEUTRAL',
        stressEffect: 5,
        personalityEffects: [
          { axis: 'patience', change: 5 },
          { axis: 'openness', change: 3 }
        ],
      },
    ],
  },

  {
    id: 'dilemma_partner_finds_out',
    text: (ctx: EventContext) => {
      const partner = ctx.npcs?.find(n => n.role === 'PARTNER');
      const name = partner?.name || 'Sevgilin';

      return `${name} senin başkasıyla flört ettiğini duymuş. Gözleri dolu, sesi titriyor: "Bu doğru mu? Beni aldattın mı?"`;
    },
    minAge: 13,
    maxAge: 18,
    rarity: 'RARE',
    isRepeatable: false,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'found_out_lie',
        text: '🙈 Yalan söyle: "Hayır, iftira!"',
        effect: { charisma: -5, discipline: -5 },
        feedback: "'Gözlerinin içine bakıyorum... İnanmak istiyorum' dedi. Ama şüphe kaldı.",
        choiceType: 'PASSIVE',
        npcRelationChange: -15,
        stressEffect: 20,
        personalityEffects: [
          { axis: 'empathy', change: -8 },
          { axis: 'courage', change: -5 }
        ],
        memory: { emotion: 'GUILT', weight: 'HIGH', customNote: 'Yalan söyledin' },
      },
      {
        id: 'found_out_confess',
        text: '😔 İtiraf et: "Evet, hata yaptım"',
        effect: { discipline: 5, charisma: -10 },
        feedback: "Dürüst oldun ama kalpleri kırdın. İlişki belki bitti, belki kırık devam edecek.",
        choiceType: 'CHALLENGE',
        npcRelationChange: -30,
        stressEffect: 25,
        personalityEffects: [
          { axis: 'courage', change: 8 },
          { axis: 'empathy', change: 3 }
        ],
        memory: { emotion: 'REGRET', weight: 'HIGH', customNote: 'Sadakatsizliği itiraf ettin' },
      },
      {
        id: 'found_out_breakup',
        text: '💔 Bitir: "Belki de bu ilişki bitmeli"',
        effect: { discipline: 3 },
        feedback: "Karmaşık durumu bitirerek temizledin. Acı verici ama belki doğru karar.",
        choiceType: 'NEUTRAL',
        npcRelationChange: -50,
        stressEffect: 20,
        personalityEffects: [
          { axis: 'courage', change: 5 },
          { axis: 'patience', change: -3 }
        ],
        memory: { emotion: 'REGRET', weight: 'HIGH', customNote: 'İlişkiyi bitirdin' },
      },
    ],
  },

  {
    id: 'dilemma_loyalty_test',
    text: (ctx: EventContext) => {
      const partner = ctx.npcs?.find(n => n.role === 'PARTNER');
      const crush = ctx.npcs?.find(n => n.role === 'CRUSH');
      const partnerName = partner?.name || 'Sevgilin';
      const crushName = crush?.name || 'Hoşlandığın kişi';

      return `${crushName} sana yaklaştı: "Ben senden hoşlanıyorum, ${partnerName}'den ayrılsan olmaz mı?" diyor. Kalbin ikiye bölündü. Ne yapacaksın?`;
    },
    minAge: 13,
    maxAge: 18,
    rarity: 'RARE',
    isRepeatable: false,
    reqNPCRole: 'PARTNER',
    personalityCategory: 'MORAL',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'loyalty_stay',
        text: '❤️ Sevgiline sadık kal',
        effect: { discipline: 10 },
        feedback: "'Hayır, ben mutluyum' dedin. İçinde bir şüphe kaldı mı?",
        choiceType: 'CHALLENGE',
        npcRelationChange: 5,
        personalityEffects: [
          { axis: 'conformity', change: 5 },
          { axis: 'empathy', change: 3 }
        ],
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
      {
        id: 'loyalty_breakup',
        text: '💔 Sevgilinden ayrıl',
        effect: { charisma: -5, health: -5 },
        feedback: "Ayrılık acı verdi. Yeni bir başlangıç ama geçmiş acıtıyor.",
        choiceType: 'PASSIVE',
        npcRelationChange: -50,
        stressEffect: 25,
        personalityEffects: [
          { axis: 'courage', change: 8 },
          { axis: 'empathy', change: -3 }
        ],
        memory: { emotion: 'REGRET', weight: 'HIGH', customNote: 'Başkası için ayrıldın' },
      },
      {
        id: 'loyalty_indecisive',
        text: '😔 "Karar veremiyorum" de',
        effect: { discipline: -5 },
        feedback: "Kararsızlık her iki tarafı da kırdı. Arada kaldın.",
        choiceType: 'NEUTRAL',
        stressEffect: 15,
        personalityEffects: [
          { axis: 'patience', change: -5 },
          { axis: 'courage', change: -3 }
        ],
      },
    ],
  },

  {
    id: 'dilemma_best_friend_vs_partner',
    text: (ctx: EventContext) => {
      const partner = ctx.npcs?.find(n => n.role === 'PARTNER');
      const bestFriend = ctx.npcs?.find(n => n.role === 'BEST_FRIEND');
      const partnerName = partner?.name || 'Sevgilin';
      const bffName = bestFriend?.name || 'En iyi arkadaşın';

      return `${bffName} ve ${partnerName} birbirinden hoşlanmıyor. ${bffName}: "O ya da ben! Seç." ${partnerName}: "O arkadaşınla görüşme." İkisi de ultimatom veriyor.`;
    },
    minAge: 13,
    maxAge: 18,
    rarity: 'RARE',
    isRepeatable: false,
    reqNPCRole: 'PARTNER',
    personalityCategory: 'CONFLICT',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'bff_vs_partner_bff',
        text: '💎 En iyi arkadaşını seç',
        effect: { charisma: -3 },
        feedback: "Yıllardır süren dostluğu seçtin. Ama aşk... acıttı.",
        choiceType: 'CHALLENGE',
        npcRelationChange: -40,
        stressEffect: 20,
        personalityEffects: [
          { axis: 'empathy', change: 5 },
          { axis: 'courage', change: 3 }
        ],
        memory: { emotion: 'REGRET', weight: 'HIGH', customNote: 'Arkadaşlığı seçtin' },
      },
      {
        id: 'bff_vs_partner_partner',
        text: '❤️ Sevgilini seç',
        effect: { charisma: 3 },
        feedback: "Aşkı seçtin. En iyi arkadaşın çok kırıldı, belki bir daha konuşmazsınız.",
        choiceType: 'PASSIVE',
        stressEffect: 15,
        personalityEffects: [
          { axis: 'empathy', change: -3 },
          { axis: 'openness', change: -3 }
        ],
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Arkadaşını bıraktın' },
      },
      {
        id: 'bff_vs_partner_neither',
        text: '🚶 İkisini de reddet',
        effect: { discipline: 8, health: -5 },
        feedback: "'Ultimatom veren kimseyle olmam' dedin. Cesur ama yalnız kaldın.",
        choiceType: 'NEUTRAL',
        npcRelationChange: -20,
        stressEffect: 25,
        personalityEffects: [
          { axis: 'courage', change: 10 },
          { axis: 'conformity', change: -8 }
        ],
        grantTraits: ['LONE_WOLF'],
      },
    ],
  },

];

export default MORAL_DILEMMA_EVENTS;
