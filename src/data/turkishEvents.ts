
import { GameEvent, EventContext } from '../types';

// =================================================================
// TÜRKİYE'YE ÖZGÜ EVENTLER - KİŞİLİK SİSTEMİ ENTEGRELİ
// Her event kişilik eksenlerini test eder ve geliştirir
// =================================================================

export const TURKISH_EVENTS: GameEvent[] = [

  // =================================================================
  // ERKEN ÇOCUKLUK (0-4 YAŞ)
  // =================================================================

  {
    id: 'tr_ilk_adim',
    tags: ['family', 'social'],
    text: "Ayaklarının üstünde duruyorsun. Bir adım... iki adım... YÜRÜYORSUN! Annen sevinçten ağlıyor!",
    minAge: 1, maxAge: 2, difficulty: 1, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    choices: [
      {
        id: 'adim_devam',
        text: "Koşmaya çalış!",
        choiceType: 'NEUTRAL',
        effect: { health: 5 },
        feedback: "Düştün ama hemen kalktın! Azimlisin küçük kahraman!",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'İlk adımlarını attın' },
      },
    ],
  },

  {
    id: 'tr_ilk_kelime',
    tags: ['family', 'social'],
    text: "Ağzından bir ses çıkıyor... 'Anne!' mı 'Baba!' mı? Ev halkı nefesini tutmuş bekliyor!",
    minAge: 1, maxAge: 2, difficulty: 1, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    choices: [
      {
        id: 'kelime_anne',
        text: "Anne!",
        choiceType: 'NEUTRAL',
        effect: { familyRelation: 10 },
        feedback: "ANNE! Annen seni havaya kaldırdı, gözleri doldu!",
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'İlk kelimeniz: Anne' },
      },
      {
        id: 'kelime_baba',
        text: "Baba!",
        choiceType: 'NEUTRAL',
        effect: { familyRelation: 10 },
        feedback: "BABA! Baban gururdan patladı, herkese anlattı!",
        memory: { emotion: 'SATISFACTION', weight: 'HIGH', customNote: 'İlk kelimeniz: Baba' },
      },
    ],
  },

  {
    id: 'tr_kreş_ilk_gun',
    tags: ['school', 'social'],
    text: "Bugün kreşe ilk gidişin. Annen seni bırakıp gidecek. Yabancı yüzler, garip sesler...",
    minAge: 2, maxAge: 4, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'kres_agla',
        text: "Ağla ve anneye sarıl",
        choiceType: 'PASSIVE',
        effect: { familyRelation: 5 },
        stressEffect: -10,
        feedback: "Biraz ağladın ama öğretmen teselli etti. Yavaş yavaş alışacaksın.",
      },
      {
        id: 'kres_oyun',
        text: "Oyuncaklara koş",
        choiceType: 'NEUTRAL',
        effect: { charisma: 5 },
        personalityEffects: [{ axis: 'openness', change: 3 }],
        stressEffect: 5,
        feedback: "Oyuncaklar dikkatini çekti! Annen gittiğini fark etmedin bile.",
        memory: { emotion: 'SATISFACTION', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'tr_oyuncak_paylasim',
    tags: ['social', 'family'],
    text: "Parkta bir çocuk senin oyuncağını istiyor. Vermek istemiyorsun ama annen bakıyor...",
    minAge: 2, maxAge: 5, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'oyuncak_paylas',
        text: "Paylaş",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { charisma: 5, familyRelation: 5 },
        personalityEffects: [{ axis: 'empathy', change: 5 }],
        stressEffect: 10,
        feedback: "Zor oldu ama verdin. Çocuk mutlu oldu, sen de biraz...",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'oyuncak_tutma',
        text: "HAYIR! BENİM!",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -5 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: -5,
        feedback: "Çocuk ağladı, annen utandı. Ama oyuncak senin!",
      },
    ],
  },

  {
    id: 'tr_gece_korkusu',
    tags: ['family', 'social'],
    text: "Gece karanlık çok korkunç. Yatağın altında bir şey var gibi...",
    minAge: 3, maxAge: 6, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'RISK',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'korku_anne',
        text: "Anneee! Babaaaa!",
        choiceType: 'PASSIVE',
        effect: { familyRelation: 5, energy: 10 },
        stressEffect: -10,
        feedback: "Anne geldi, sarıldı, şarkı söyledi. Rahatladın, uyudun.",
      },
      {
        id: 'korku_cesur',
        text: "Yatağın altına bak",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { discipline: 5 },
        personalityEffects: [{ axis: 'courage', change: 8 }],
        stressEffect: 15,
        feedback: "Baktın... toz ve eski oyuncaklar! Korkulacak bir şey yok. Cesur oldun!",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Korkunu yendin' },
      },
    ],
  },

  {
    id: 'tr_sebze_yemek',
    tags: ['family', 'social'],
    text: "Annen tabağına brokoli koydu. Yeşil, garip görünüyor. Yemelisin ama...",
    minAge: 2, maxAge: 6, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'sebze_ye',
        text: "Ye (yüzünü buruşturarak)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        effect: { health: 10, familyRelation: 8, discipline: 5 },
        personalityEffects: [{ axis: 'patience', change: 5 }],
        stressEffect: 10,
        feedback: "İğrenç değildi aslında... Annen çok mutlu oldu!",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'sebze_tukur',
        text: "TÜKÜÜÜR!",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -10 },
        personalityEffects: [{ axis: 'patience', change: -3 }],
        stressEffect: -5,
        feedback: "Brokoli duvarda! Annen çıldırdı. Ama en azından yemedin.",
      },
      {
        id: 'sebze_gizle',
        text: "Peçetenin altına sakla",
        choiceType: 'NEUTRAL',
        effect: { intelligence: 3 },
        feedback: "Kimse görmedi... sanıyorsun. Zeki misin yoksa kurnaz mı?",
      },
    ],
  },

  {
    id: 'tr_tuvalet_egitimi',
    tags: ['family', 'social'],
    text: "Artık bez yok! Tuvaleti kullanma zamanı. Lazımlık hazır...",
    minAge: 2, maxAge: 4, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    choices: [
      {
        id: 'tuvalet_basari',
        text: "Lazımlığı kullan",
        choiceType: 'NEUTRAL',
        effect: { familyRelation: 15, discipline: 10 },
        feedback: "BRAVO! Alkış, şarkı, ödül! Artık büyük çocuksun!",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Tuvalet eğitimi başarılı' },
      },
    ],
  },

  {
    id: 'tr_kardes_gelmis',
    tags: ['family', 'social'],
    text: "Eve yeni bir bebek geldi. Artık tek çocuk değilsin. Annen ona çok bakıyor...",
    minAge: 2, maxAge: 5, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'kardes_sev',
        text: "Bebeğe sarıl",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { familyRelation: 15, charisma: 5 },
        personalityEffects: [{ axis: 'empathy', change: 8 }],
        stressEffect: 10,
        feedback: "Yavaşça dokundun. Bebek sana baktı! Yeni en iyi arkadaşın olabilir.",
        memory: { emotion: 'SATISFACTION', weight: 'HIGH' },
      },
      {
        id: 'kardes_kiskan',
        text: "Ben de bebek istiyorum!",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -5 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: 5,
        feedback: "Kıskanmak normal. Ama annen seni de çok seviyor.",
      },
    ],
  },

  {
    id: 'tr_el_opme_zorlanma',
    tags: ['family', 'social'],
    text: "Akraba ziyareti. Annen 'Gel hala/dayının elini öp' diyor. Ama onları pek sevmiyorsun...",
    minAge: 3, maxAge: 7, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'el_op_zorla',
        text: "Öp (istemeye istemeye)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'conformity', max: 50 }],
        effect: { familyRelation: 10, charisma: 3 },
        personalityEffects: [{ axis: 'conformity', change: 5 }, { axis: 'empathy', change: -2 }],
        stressEffect: 10,
        feedback: "Zoraki öptün. Hala 'Maşallah büyümüş!' dedi, yanağını sıktı. İçin sıkıldı ama ailen memnun.",
        memory: { emotion: 'REGRET', weight: 'LOW' },
      },
      {
        id: 'el_opme_reddet',
        text: "HAYIR, İSTEMİYORUM!",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -15, discipline: -5 },
        personalityEffects: [{ axis: 'conformity', change: -3 }, { axis: 'courage', change: 5 }],
        stressEffect: -5,
        feedback: "Direnebildin! Ama hala kırıldı, annen utandı. 'Terbiyesiz çocuk' dediler.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'tr_misafir_oyuncak',
    tags: ['social', 'family'],
    text: "Misafir geldi. Küçük bir çocuk var ve en sevdiğin oyuncağı istiyor. Annen bakıyor...",
    minAge: 3, maxAge: 6, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'misafir_ver',
        text: "Ver (gönülsüzce)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { familyRelation: 12, charisma: 5 },
        personalityEffects: [{ axis: 'empathy', change: 8 }],
        stressEffect: 15,
        feedback: "Verdin ama için acıdı. Çocuk çok mutlu oldu. Annen sana sarıldı - 'Ne kadar cömert çocuk!'",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
      {
        id: 'misafir_gizle',
        text: "Oyuncağı gizle",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -8, intelligence: 3 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: -5,
        feedback: "Oyuncağı yastığın altına sakladın. Çocuk ağladı, annen kızdı ama oyuncak seninle kaldı.",
      },
      {
        id: 'misafir_baska',
        text: "Başka oyuncak öner",
        choiceType: 'NEUTRAL',
        effect: { familyRelation: 5, intelligence: 5, charisma: 3 },
        feedback: "'Bu daha güzel!' dedin ve başka oyuncak verdin. İkisi de mutlu - çözüm buldun!",
        memory: { emotion: 'SATISFACTION', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'tr_market_inat',
    tags: ['family', 'social'],
    text: "Markette çikolata gördün. İSTİYORSUN! Ama annen 'Hayır' dedi. Yere yatacak mısın?",
    minAge: 2, maxAge: 6, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'market_agla',
        text: "Yere yat, ağla!",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -15, discipline: -8 },
        personalityEffects: [{ axis: 'patience', change: -5 }],
        stressEffect: -10,
        feedback: "AĞLAAA! Herkes baktı, annen utandı. Çikolatayı alamadın ama tüm marketin dikkati senindi.",
      },
      {
        id: 'market_sabret',
        text: "Üzül ama kabul et",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        effect: { familyRelation: 15, discipline: 10, intelligence: 3 },
        personalityEffects: [{ axis: 'patience', change: 10 }],
        stressEffect: 15,
        feedback: "Zor oldu ama sabredebildin! Annen çok şaşırdı ve gururlandı. 'Büyüdün' dedi.",
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
      },
      {
        id: 'market_pazarlik',
        text: "'Lütfen' de, gözlerini aç",
        choiceType: 'NEUTRAL',
        effect: { familyRelation: 5, charisma: 5, money: -5 },
        feedback: "Gözlerini açıp 'Lüüüüüütfen' dedin. Annen yumuşadı. Çikolatayı aldın - kazandın!",
        personalityEffects: [{ axis: 'openness', change: 3 }],
      },
    ],
  },

  {
    id: 'tr_kopek_korkusu',
    tags: ['social', 'family'],
    text: "Sokakta büyük bir köpek! Kuyruğunu sallıyor ama korkuyorsun. Babandaysa yaklaşıyor...",
    minAge: 3, maxAge: 7, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'RISK',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'kopek_kac',
        text: "Ağla ve kaç!",
        choiceType: 'PASSIVE',
        effect: { health: 5, energy: -10 },
        personalityEffects: [{ axis: 'courage', change: -3 }],
        stressEffect: -10,
        feedback: "Kaçtın! Güvendesin. Ama baban 'Korkak' dedi ve üzüldün.",
      },
      {
        id: 'kopek_cesur',
        text: "Babanın elini tut, yaklaş",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { discipline: 8, health: 5 },
        personalityEffects: [{ axis: 'courage', change: 10 }],
        stressEffect: 20,
        feedback: "Titreyerek ama yaklaştın. Köpek senin elini yaladı! Sevimli miymiş! Cesur oldun!",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Korkunu yendin' },
      },
    ],
  },

  {
    id: 'tr_abi_zorbalik',
    tags: ['family', 'social'],
    text: "Ağabeyin/ablan yine oyuncağını aldı. Ağlıyorsun ama o gülüyor. Ne yapacaksın?",
    minAge: 3, maxAge: 7, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'abi_anne_soyle',
        text: "ANNEEEE!",
        choiceType: 'PASSIVE',
        effect: { familyRelation: 5, discipline: -3 },
        personalityEffects: [{ axis: 'courage', change: -3 }],
        stressEffect: -5,
        feedback: "Anne geldi, ağabeyini/ablanı azarladı. Oyuncağı geri aldın ama 'ispiyoncu' dedi sana.",
      },
      {
        id: 'abi_kavga',
        text: "Geri almaya çalış!",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { discipline: 5, health: -5 },
        personalityEffects: [{ axis: 'courage', change: 8 }],
        stressEffect: 10,
        feedback: "Cesurca savaştın! Yenildin ama hiç pes etmedin. Ağabeyin/ablan biraz saygı duydu.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
      {
        id: 'abi_pazarlik',
        text: "Ağla ve 'Lütfen' de",
        choiceType: 'NEUTRAL',
        effect: { charisma: 3 },
        feedback: "Gözyaşlarına dayanamadı. 'Tamam tamam al' dedi. Duygusal zeka kazandın!",
        personalityEffects: [{ axis: 'empathy', change: 3 }],
      },
    ],
  },

  {
    id: 'tr_sofra_konusma',
    tags: ['family', 'social'],
    text: "Yemek masasında büyükler konuşuyor. Söze karışmak istiyorsun ama 'Çocuklar konuşmaz' dediler...",
    minAge: 4, maxAge: 7, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'sofra_sus',
        text: "Sus ve dinle",
        choiceType: 'PASSIVE',
        effect: { discipline: 8, familyRelation: 5 },
        personalityEffects: [{ axis: 'conformity', change: 5 }],
        stressEffect: 10,
        feedback: "Sustun. İçin sıkıldı ama 'Terbiyeli çocuk' dediler. Kuralları öğreniyorsun.",
      },
      {
        id: 'sofra_konus',
        text: "Karış yine de!",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'conformity', max: 40 }],
        effect: { charisma: 5, familyRelation: -10, intelligence: 5 },
        personalityEffects: [{ axis: 'conformity', change: -5 }, { axis: 'courage', change: 5 }],
        stressEffect: -5,
        feedback: "'Sus bakalım!' dediler ama söyleyeceğini söyledin. Cesursun ama 'terbiyesiz' dediler.",
        memory: { emotion: 'REGRET', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'tr_apartman_hopla',
    tags: ['family', 'social'],
    text: "Evde zıplamak çok eğlenceli! Ama alt komşu tavana vurdu. Annen 'Dur' diyor...",
    minAge: 3, maxAge: 7, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'hopla_dur',
        text: "Dur (İstemeye istemeye)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'conformity', max: 50 }],
        effect: { discipline: 10, energy: -10, familyRelation: 8 },
        personalityEffects: [{ axis: 'conformity', change: 5 }, { axis: 'patience', change: 5 }],
        stressEffect: 15,
        feedback: "Enerjin taşıyor ama durdun. Zor oldu! Annen 'İyi çocuk' dedi. Sabır öğreniyorsun.",
      },
      {
        id: 'hopla_devam',
        text: "Devam et!",
        choiceType: 'PASSIVE',
        effect: { energy: 10, familyRelation: -15, discipline: -10 },
        personalityEffects: [{ axis: 'conformity', change: -5 }],
        stressEffect: -10,
        feedback: "ZIIIP ZIIP! Komşu geldi çıldırdı, annen çok kızdı. Ama çok eğlendin!",
      },
    ],
  },

  {
    id: 'tr_komsu_bonbon',
    tags: ['social', 'family'],
    text: "Komşu teyze sana şeker verdi. Ama onu sevmiyorsun, hep öpüyor seni. Almak zorundasın...",
    minAge: 3, maxAge: 6, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'bonbon_al_tesekkur',
        text: "Al ve 'Teşekkür ederim' de",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 50 }],
        effect: { familyRelation: 10, charisma: 5, money: 5 },
        personalityEffects: [{ axis: 'openness', change: 5 }, { axis: 'empathy', change: 3 }],
        stressEffect: 10,
        feedback: "Teyze çok sevindi! Seni öptü, 'Ne tatlı çocuk!' dedi. Annen gurur duydu.",
      },
      {
        id: 'bonbon_red',
        text: "Alma ve kaç",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -15 },
        personalityEffects: [{ axis: 'openness', change: -3 }],
        stressEffect: -5,
        feedback: "Teyze kırıldı, annen çok utandı. 'Terbiyesiz!' diye azarlandın.",
      },
    ],
  },

  {
    id: 'tr_kaybolma_panik',
    tags: ['family', 'social'],
    text: "Çarşıdayken annenle gözgöze gelemedin. Etrafta yabancılar var. KAYBOLMUŞSUN!",
    minAge: 4, maxAge: 7, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'RISK',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'kaybol_agla',
        text: "Ağla ve yerinde dur",
        choiceType: 'PASSIVE',
        effect: { health: -5, energy: -10 },
        personalityEffects: [{ axis: 'courage', change: -5 }],
        stressEffect: 25,
        feedback: "Korkunç bir panik! Ağladın ama sonunda annen buldu seni. Sarıldı, hem ağladı hem azarladı.",
        memory: { emotion: 'REGRET', weight: 'HIGH', customNote: 'Kaybolma korkusu' },
      },
      {
        id: 'kaybol_ara',
        text: "Sakin kal, etrafı ara",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { intelligence: 10, discipline: 10 },
        personalityEffects: [{ axis: 'courage', change: 15 }, { axis: 'patience', change: 8 }],
        stressEffect: 30,
        feedback: "Panik yerine düşündün! Girdiğiniz mağazayı hatırladın ve geri döndün. Anne oradaydı! Çok cesur oldun!",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Kaybolduğunda sakin kaldın' },
      },
      {
        id: 'kaybol_yardim',
        text: "Bir teyzeye 'Annem kayıp' de",
        choiceType: 'NEUTRAL',
        effect: { charisma: 5, intelligence: 5 },
        personalityEffects: [{ axis: 'openness', change: 5 }],
        feedback: "Teyze yardım etti, annen bulundu. Doğru kişiden yardım istemek akıllıca!",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'tr_inat_krizi',
    tags: ['family', 'social'],
    text: "Annen diş fırçalaman gerektiğini söylüyor. Ama sen İNAT EDİYORSUN! Kimse seni zorlayamaz!",
    minAge: 3, maxAge: 6, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'inat_direne',
        text: "İNAT ET! HAYIR!",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -15, discipline: -10, health: -5 },
        personalityEffects: [{ axis: 'conformity', change: -5 }, { axis: 'patience', change: -3 }],
        stressEffect: 5,
        feedback: "HAYIIIIR! Ağladın, bağırdın, yere yattın! Sonunda pes ettin ama herkes yoruldu.",
      },
      {
        id: 'inat_kabul',
        text: "Tamam, kabul et",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        effect: { familyRelation: 15, discipline: 15, health: 10 },
        personalityEffects: [{ axis: 'patience', change: 10 }, { axis: 'conformity', change: 5 }],
        stressEffect: 15,
        feedback: "Zor oldu ama söz dinledin. Dişlerini fırçaladın. 'Büyüdün' dediler! Gurur duydun.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'tr_baskasinin_oyuncak',
    tags: ['social', 'family'],
    text: "Parkta başka çocuğun oyuncağı çok güzel. Sen de istiyorsun. O çocuk seninle oynamıyor...",
    minAge: 3, maxAge: 6, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'oyuncak_cap',
        text: "Çal ve kaç!",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -20, discipline: -15, charisma: -10 },
        personalityEffects: [{ axis: 'empathy', change: -8 }],
        stressEffect: -5,
        feedback: "Çaldın! Çocuk ağladı, annesi geldi ve senin annen çok utandı. Oyuncağı geri verdin.",
        memory: { emotion: 'GUILT', weight: 'HIGH', customNote: 'Başkasının oyuncağını çaldın' },
      },
      {
        id: 'oyuncak_iste',
        text: "'Benimle paylaşır mısın?' diye sor",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 50 }],
        effect: { charisma: 10, intelligence: 5 },
        personalityEffects: [{ axis: 'openness', change: 8 }, { axis: 'empathy', change: 5 }],
        stressEffect: 10,
        feedback: "Nazikçe sordun! Çocuk paylaştı ve beraber oynadınız. Yeni arkadaş edindin!",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: 'oyuncak_vazgec',
        text: "Üzül ama vazgeç",
        choiceType: 'NEUTRAL',
        effect: { discipline: 8, intelligence: 5 },
        personalityEffects: [{ axis: 'patience', change: 5 }],
        feedback: "Herkese her şey ait değil. Zor bir ders ama öğrendin.",
      },
    ],
  },

  {
    id: 'tr_tuvalet_acil',
    tags: ['family', 'social'],
    text: "Parkta tuvalete çok sıkıştın! Ama tuvalet yok. Ne yapacaksın?",
    minAge: 3, maxAge: 6, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'RISK',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'tuvalet_agac',
        text: "Ağacın arkasına gizlen",
        choiceType: 'PASSIVE',
        effect: { health: 10, discipline: -5 },
        personalityEffects: [{ axis: 'conformity', change: -3 }],
        stressEffect: -15,
        feedback: "Ağacın arkasında hallettin! Rahatladın ama annen 'Ayıp!' dedi.",
      },
      {
        id: 'tuvalet_tutma',
        text: "Tut, eve kadar dayan!",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        effect: { discipline: 15, health: 10 },
        personalityEffects: [{ axis: 'patience', change: 10 }],
        stressEffect: 25,
        feedback: "ÇOOOOK zordu ama eve kadar tuttun! Koşa koşa tuvalete gittin. Tam zamanında!",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'tr_tablet_sure',
    tags: ['family', 'social'],
    text: "Çizgi film izliyorsun. Annen 'Tamam süre doldu!' diyor. Ama en heyecanlı yerindeydi!",
    minAge: 3, maxAge: 7, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'tablet_devam',
        text: "'Biraz daha!' diye yalvar",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -10, discipline: -8, intelligence: -3 },
        personalityEffects: [{ axis: 'patience', change: -5 }],
        stressEffect: -5,
        feedback: "Ağladın, yalvardın. Sonunda tableti aldılar. Çizgi filmin sonunu göremedin.",
      },
      {
        id: 'tablet_kapat',
        text: "Kapat ve başka şey yap",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        effect: { familyRelation: 15, discipline: 15, intelligence: 5 },
        personalityEffects: [{ axis: 'patience', change: 12 }, { axis: 'conformity', change: 5 }],
        stressEffect: 20,
        feedback: "Zor oldu! Ama tableti kapattın. Annen çok şaşırdı ve ödül olarak yarın daha fazla izletebilirsin!",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Ekran süresine uygun davrandın' },
      },
    ],
  },

  {
    id: 'tr_dis_fircalama',
    tags: ['family', 'social'],
    text: "Yatma vakti! Ama dişlerini fırçalaman lazım. Üşeniyorsun...",
    minAge: 3, maxAge: 7, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'dis_fircala',
        text: "Fırçala (İstemeye istemeye)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'conformity', max: 50 }],
        effect: { health: 10, discipline: 10, familyRelation: 8 },
        personalityEffects: [{ axis: 'conformity', change: 5 }, { axis: 'patience', change: 3 }],
        stressEffect: 10,
        feedback: "Fırçaladın! Ağzın mis gibi. Annen 'İyi çocuk' dedi ve öpücük verdi.",
      },
      {
        id: 'dis_atla',
        text: "Atla, direk yat!",
        choiceType: 'PASSIVE',
        effect: { health: -5, discipline: -8, familyRelation: -10 },
        personalityEffects: [{ axis: 'conformity', change: -3 }],
        stressEffect: -5,
        feedback: "Fırçalamadan yattın! Annen yakaladı ve azarladı. 'Dişlerin çürüyecek!' dedi.",
      },
    ],
  },

  {
    id: 'tr_park_kavga',
    tags: ['social', 'family'],
    text: "Parkta başka bir çocuk seni itti! Düştün, acıdı. O çocuk kaçıyor...",
    minAge: 4, maxAge: 7, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'kavga_vur',
        text: "Kalk, onun da seni it!",
        choiceType: 'PASSIVE',
        effect: { health: -10, discipline: -15, familyRelation: -10 },
        personalityEffects: [{ axis: 'empathy', change: -5 }, { axis: 'courage', change: 5 }],
        stressEffect: 10,
        feedback: "Kavga başladı! İkiniz de ağladınız, anneler ayırdı. 'Kavgacı çocuk!' dediler.",
        memory: { emotion: 'REGRET', weight: 'MEDIUM' },
      },
      {
        id: 'kavga_agla',
        text: "Ağla, anneye koş",
        choiceType: 'PASSIVE',
        effect: { familyRelation: 5, health: 5 },
        personalityEffects: [{ axis: 'courage', change: -3 }],
        stressEffect: -10,
        feedback: "Ağlayarak anneye koştun. Sarıldı, teselli etti. O çocuğa kızdı.",
      },
      {
        id: 'kavga_affet',
        text: "Acıdı ama affet, devam et",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', min: 40 }],
        effect: { health: 5, charisma: 10, discipline: 10 },
        personalityEffects: [{ axis: 'empathy', change: 10 }, { axis: 'patience', change: 8 }],
        stressEffect: 15,
        feedback: "Affettin! Olgun bir davranış. O çocuk özür diledi ve beraber oynadınız.",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Seni iten çocuğu affettin' },
      },
    ],
  },

  {
    id: 'tr_yemek_inat',
    tags: ['family', 'social'],
    text: "Annen yemek yaptı. Ama beğenmedin! Yemeyeceksin!",
    minAge: 2, maxAge: 6, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'yemek_red',
        text: "HAYIR! İSTEMİYORUM!",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -15, health: -10, discipline: -10 },
        personalityEffects: [{ axis: 'patience', change: -5 }, { axis: 'conformity', change: -3 }],
        stressEffect: -5,
        feedback: "İnat ettin! Saatlerce sofradan kalkmadın. Sonunda aç yattın.",
      },
      {
        id: 'yemek_ye',
        text: "Ye (İstemeye istemeye)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        effect: { familyRelation: 15, health: 15, discipline: 10 },
        personalityEffects: [{ axis: 'patience', change: 10 }],
        stressEffect: 15,
        feedback: "Zor oldu ama yedin. Aslında kötü değilmiş! Annen çok mutlu oldu.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'tr_oyuncak_magazasi',
    tags: ['family', 'money'],
    text: "Oyuncak mağazasındasın! Etraf oyuncak dolu! Bir tane almak istiyorsun AMA...",
    minAge: 4, maxAge: 7, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'magaza_al',
        text: "'Alabilir miyim?' diye sor",
        choiceType: 'NEUTRAL',
        effect: { money: -50, familyRelation: 5 },
        feedback: "Sordun! Annen 'Tamam bir tane' dedi. Seçim yapmak zor oldu ama mutlusun!",
      },
      {
        id: 'magaza_agla',
        text: "Yere yat, ağla!",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -20, discipline: -15 },
        personalityEffects: [{ axis: 'patience', change: -8 }],
        stressEffect: -10,
        feedback: "Dramaaaa! Herkes baktı, annen seni dışarı çıkardı. Oyuncak alamadın.",
        memory: { emotion: 'REGRET', weight: 'MEDIUM' },
      },
      {
        id: 'magaza_sabir',
        text: "Sadece bak ve çık",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        effect: { discipline: 20, intelligence: 10, familyRelation: 20 },
        personalityEffects: [{ axis: 'patience', change: 15 }],
        stressEffect: 25,
        feedback: "İnanılmaz sabır! Baktın, dokundun ama isteğe direnebildin. Annen çok şaşırdı - 'Büyümüşsün' dedi!",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Oyuncak mağazasında sabırlı davrandın' },
      },
    ],
  },

  {
    id: 'tr_bebek_yardim',
    tags: ['family', 'social'],
    text: "Annen bebekle uğraşıyor, çok yorgun. Sana 'Biberon getirir misin?' diyor...",
    minAge: 4, maxAge: 7, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'bebek_yardim_et',
        text: "Yardım et!",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { familyRelation: 20, charisma: 5, discipline: 10 },
        personalityEffects: [{ axis: 'empathy', change: 10 }],
        stressEffect: 5,
        feedback: "Biberon getirdin! Annen çok mutlu oldu. 'Büyük kardeş olmuşsun!' dedi ve sarıldı.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Anneye bebek bakımında yardım ettin' },
      },
      {
        id: 'bebek_red',
        text: "'Oynuyorum!' de, reddet",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -15, discipline: -8 },
        personalityEffects: [{ axis: 'empathy', change: -5 }],
        stressEffect: -5,
        feedback: "Annen üzüldü. 'Bencil çocuk' dedi. Oyununa devam ettin ama için buruk.",
      },
    ],
  },

  {
    id: 'tr_top_cama_vurma',
    tags: ['family', 'social'],
    text: "Top oynuyorsun. Top kaydı ve KOMŞUNUN CAMI! CAAAAAM! Top patladı ama cam kırılmadı...",
    minAge: 5, maxAge: 7, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'cam_kac',
        text: "Kaç saklan!",
        choiceType: 'PASSIVE',
        effect: { health: -5, discipline: -15, familyRelation: -10 },
        personalityEffects: [{ axis: 'courage', change: -8 }, { axis: 'empathy', change: -5 }],
        stressEffect: 5,
        feedback: "Kaçtın! Ama komşu görmüş. Gelip söyledi. Hem azarlandın hem korkak oldun.",
        memory: { emotion: 'GUILT', weight: 'HIGH' },
      },
      {
        id: 'cam_ozur',
        text: "Komşuya git, özür dile",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { familyRelation: 15, charisma: 10, discipline: 15 },
        personalityEffects: [{ axis: 'courage', change: 12 }, { axis: 'empathy', change: 8 }],
        stressEffect: 20,
        feedback: "Çok korkuyordun ama gittin, özür diledin! Komşu affetti - 'Dürüst çocuk' dedi!",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Hatan için sorumluluk aldın' },
      },
    ],
  },

  {
    id: 'tr_ev_yardimi',
    tags: ['family', 'social'],
    text: "Annen evi topluyor. Çok yorgun görünüyor. Oyuncaklarını toplar mısın?",
    minAge: 4, maxAge: 7, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'ev_yardim',
        text: "Yardım et, oyuncakları topla",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { familyRelation: 20, discipline: 15 },
        personalityEffects: [{ axis: 'empathy', change: 8 }, { axis: 'conformity', change: 5 }],
        stressEffect: 10,
        feedback: "Topladın! Annen sana sarıldı - 'Sen benim en büyük yardımcımsın!' dedi.",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: 'ev_oyna',
        text: "Oynamaya devam et",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -10, discipline: -8 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: -5,
        feedback: "Annen tek başına topladı. Üzgün görünüyor. 'Bencil' diyen sesini duydun.",
      },
    ],
  },

  // =================================================================
  // BAYRAMLAR VE GELENEKLER
  // =================================================================

  {
    id: 'tr_bayram_sabahi',
    tags: ['family', 'social'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.openness < 30) {
        return "Bayram sabahı. Herkes erken kalkmış, akrabalar gelecek. Kalabalık düşüncesi bile yorucu...";
      } else if (p.empathy > 70) {
        return "Bayram sabahı! Büyüklerin elini öpüp dualarını almak, o sıcak kucaklaşmalar... En sevdiğin gün!";
      }
      return "Bayram sabahı! Ev mis gibi kokuyor, baklava hazır. Büyüklerin elini öpme zamanı.";
    },
    minAge: 10, maxAge: 18, difficulty: 1, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'bayram_full_respect',
        text: "Tüm büyüklerin elini öp (Zor - İçe kapanık için)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { familyRelation: 15, money: 100, charisma: 5 },
        personalityEffects: [{ axis: 'openness', change: 3 }],
        stressEffect: 15,
        feedback: "Her el öpüşünde içinden 'ne zaman bitecek' dedin. Ama ceplerin harçlıkla doldu ve aile mutlu.",
        memory: { emotion: 'SATISFACTION', weight: 'LOW' },
      },
      {
        id: 'bayram_minimal',
        text: "Sadece anne-babayı öp, köşede otur",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { familyRelation: 5, money: 30, energy: 10 },
        stressEffect: -5,
        feedback: "Minimum etkileşimle atlattın. Harçlık az oldu ama rahatın yerinde.",
        personalityEffects: [{ axis: 'openness', change: -2 }],
      },
      {
        id: 'bayram_social_butterfly',
        text: "Herkesi kucakla, sohbet et!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', min: 60 }],
        effect: { familyRelation: 20, money: 150, charisma: 10, energy: -20 },
        stressEffect: -10,
        feedback: "'Maşallah ne terbiyeli!' Herkes seni sevdi. Ceplerin taştı, ruhun doydu.",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: 'bayram_sleep',
        text: "Uyumaya devam et",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', max: 30 }],
        effect: { familyRelation: -15, energy: 30 },
        personalityEffects: [{ axis: 'conformity', change: -3 }],
        stressEffect: 5,
        feedback: "'Bu çocuk terbiyesiz!' Harçlık alamadın, azarlandın. Ama uyudun en azından.",
        memory: { emotion: 'REGRET', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'tr_ramazan_iftar',
    tags: ['family', 'social'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Ramazan ayı! İftara misafirler geliyor. Annenin yanında yardım etmek istiyorsun - onun yorgunluğunu görüyorsun.";
      } else if (p.patience < 30) {
        return "Ramazan ayı. İftara misafirler geliyor. Beklemek, hazırlık, sohbet... Ne kadar uzun sürecek acaba?";
      }
      return "Ramazan ayı! Akşam iftara misafirler geliyor. Annen mutfakta çorba, pilav, kebap hazırlıyor.";
    },
    minAge: 12, maxAge: 18, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'iftar_help',
        text: "Sofra hazırlamaya yardım et",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', min: 50 }],
        effect: { familyRelation: 15, discipline: 5, charisma: 3 },
        personalityEffects: [{ axis: 'empathy', change: 2 }],
        stressEffect: 5,
        feedback: "Tabakları, bardakları dizedin. Annen gururla baktı. Misafirler 'ne yardımsever' dedi.",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'iftar_fast',
        text: "Oruç tutmayı dene (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        reqStats: { health: 40 },
        effect: { discipline: 15, health: -5, energy: -30 },
        personalityEffects: [
          { axis: 'patience', change: 10 },
        ],
        stressEffect: 20,
        feedback: "Akşama kadar dayandın! Açlık zor ama başardın. Herkes seninle gurur duydu.",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'İlk orucunu tuttun' },
        grantTraits: ['DISCIPLINED'],
      },
      {
        id: 'iftar_avoid',
        text: "Odanda bekle",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', max: 40 }],
        effect: { energy: 10, familyRelation: -5 },
        personalityEffects: [{ axis: 'empathy', change: -2 }],
        stressEffect: -5,
        feedback: "Yardım etmedin ama en azından ayak altında dolaşmadın.",
      },
    ],
  },

  {
    id: 'tr_kurban_bayrami',
    tags: ['family', 'social'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Kurban Bayramı. Etler pay ediliyor. Fakir ailelere dağıtım var - yardım etmek istiyorsun.";
      } else if (p.courage < 30) {
        return "Kurban Bayramı. Kesim var bahçede. Kan, ses... Bakmamaya çalışıyorsun.";
      }
      return "Kurban Bayramı! Baban kurban kestirdi. Etler pay edilecek.";
    },
    minAge: 12, maxAge: 18, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'kurban_distribute',
        text: "Et dağıtımına yardım et",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', min: 40 }],
        effect: { discipline: 8, charisma: 8, familyRelation: 5 },
        personalityEffects: [{ axis: 'empathy', change: 5 }],
        stressEffect: 10,
        feedback: "Fakir ailelere et dağıttın. Teşekkür eden gözler, dualar... İyilik yapmak güzel.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Başkalarına yardım ettin' },
        grantTraits: ['EMPATHETIC'],
      },
      {
        id: 'kurban_cousins',
        text: "Kuzenlerle oyna",
        choiceType: 'NEUTRAL',
        effect: { charisma: 5, health: 3, energy: -15 },
        stressEffect: -5,
        feedback: "Bayramda en güzel şey kuzenlerle oynamak!",
      },
      {
        id: 'kurban_witness',
        text: "Kesime şahit ol (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { discipline: 5, intelligence: 3, health: -5 },
        personalityEffects: [{ axis: 'courage', change: 5 }],
        stressEffect: 20,
        feedback: "Hayatın gerçekleriyle yüzleştin. Zor ama olgunlaştırıcı bir deneyimdi.",
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM' },
      },
    ],
  },

  // =================================================================
  // EĞİTİM SİSTEMİ
  // =================================================================

  {
    id: 'tr_karne_gunu',
    tags: ['karne', 'school'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      const avgGrade = ctx.grades ? Math.round((ctx.grades.math + ctx.grades.science + ctx.grades.language) / 3) : 70;

      if (avgGrade >= 85 && p.openness > 60) {
        return "Karne günü! Elinde pırıl pırıl bir karne, takdir belgesi! Herkese göstermek istiyorsun!";
      } else if (avgGrade < 50 && p.courage < 40) {
        return "Karne günü... Elindeki karneye bakmaya bile korkuyorsun. Baban ne diyecek?";
      } else if (avgGrade < 50) {
        return "Karne günü. Notlar kötü ama... olur böyle şeyler, değil mi?";
      }
      return "Karne günü geldi. Notların ortada - ne çok iyi ne çok kötü.";
    },
    minAge: 12, maxAge: 18, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'SOCIAL',
    choices: [
      {
        id: 'karne_proud',
        text: "Gururla eve git",
        choiceType: 'PASSIVE',
        effect: { familyRelation: 5, charisma: 3 },
        stressEffect: -5,
        feedback: "Karneni masaya koydun. Ailenin tepkisi notlarına bağlı...",
      },
      {
        id: 'karne_compare',
        text: "Arkadaşlarla karşılaştır",
        choiceType: 'NEUTRAL',
        effect: { charisma: 5, intelligence: 2 },
        stressEffect: 10,
        feedback: "Herkes karneleri gösteriyor. Kimi sevinçli, kimi üzgün. Sen neredesin?",
      },
      {
        id: 'karne_hide',
        text: "Karneyi sakla, sonra göster",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'courage', max: 40 }],
        effect: { discipline: -5, familyRelation: -5 },
        personalityEffects: [{ axis: 'courage', change: -2 }],
        stressEffect: 15,
        feedback: "Bir süre sakladın ama eninde sonunda ortaya çıkacak... ve daha kötü olacak.",
        memory: { emotion: 'GUILT', weight: 'LOW' },
      },
      {
        id: 'karne_honest',
        text: "Kötü de olsa hemen göster (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 40 }],
        effect: { discipline: 8, familyRelation: 3 },
        personalityEffects: [{ axis: 'courage', change: 5 }],
        stressEffect: 20,
        feedback: "Korkarak gösterdin ama dürüst oldun. Ailen en azından bunu takdir etti.",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'tr_lgs_hazirlik',
    tags: ['exam', 'study', 'school', 'sinav'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.patience < 30) {
        return "LGS'ye 6 ay kaldı! Herkes dershaneye gidiyor, testler çözüyor. Sen ise... hiçbir şey yapmadın. Panik!";
      } else if (p.patience > 70) {
        return "LGS'ye 6 ay kaldı. Çalışma planın hazır, metodun belli. Adım adım ilerliyorsun.";
      }
      return "LGS'ye 6 ay kaldı. Herkes çalışıyor. Sen ne yapacaksın?";
    },
    minAge: 13, maxAge: 14, difficulty: 4, rarity: 'COMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'lgs_dershane',
        text: "Dershaneye yazıl",
        choiceType: 'NEUTRAL',
        reqFamily: { wealth: ['MIDDLE', 'RICH'] },
        effect: { intelligence: 10, energy: -25, money: -500, familyRelation: 5 },
        gradeUpdates: { math: 10, science: 10 },
        stressEffect: 15,
        feedback: "Dershane yoğun ama etkili. Notların yükselmeye başladı.",
      },
      {
        id: 'lgs_self_study',
        text: "Evde kendi çalış (Zor - Sabırsız için)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        effect: { intelligence: 8, discipline: 12, energy: -20 },
        personalityEffects: [{ axis: 'patience', change: 8 }],
        gradeUpdates: { math: 7, science: 7 },
        stressEffect: 25,
        feedback: "YouTube'dan konuları izledin, testler çözdün. Kendi başına yapmak zor ama öğreniyorsun.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
        grantTraits: ['DISCIPLINED'],
      },
      {
        id: 'lgs_ignore',
        text: "Umurumda değil",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', max: 40 }],
        effect: { discipline: -15, charisma: 5 },
        personalityEffects: [{ axis: 'conformity', change: -5 }],
        stressEffect: -10,
        feedback: "Arkadaşlarınla takıldın. Notlar düştü ama eğlendin. Sonra ne olacak?",
        memory: { emotion: 'REGRET', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'tr_yks_stresi',
    tags: ['exam', 'study', 'school', 'yks', 'sinav'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      const stress = ctx.stress.current;

      if (stress > 60) {
        return "YKS yaklaşıyor ve sen tükenmek üzeresin. Gözlerin yanıyor, kafan çalışmıyor. Herkes 'çalış' diyor ama...";
      } else if (p.patience > 70) {
        return "YKS yaklaşıyor. Planın hazır, günde 8 saat çalışıyorsun. Yorucu ama kontrol sende.";
      }
      return "YKS'ye az kaldı. Türkiye'nin en önemli sınavlarından biri. Hazır mısın?";
    },
    minAge: 17, maxAge: 18, difficulty: 5, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'GROWTH',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'yks_grind',
        text: "Sabahla ve çalış",
        choiceType: 'CHALLENGE',
        effect: { intelligence: 10, health: -15, energy: -40, discipline: 5 },
        gradeUpdates: { math: 10, science: 10, language: 5 },
        stressEffect: 30,
        feedback: "Gözlerin kan çanağı ama paragraflar, formüller kafana girdi. Değer mi? Göreceğiz.",
        memory: { emotion: 'NEUTRAL', weight: 'MEDIUM' },
      },
      {
        id: 'yks_tutor',
        text: "Özel ders al",
        choiceType: 'NEUTRAL',
        reqFamily: { wealth: ['MIDDLE', 'RICH'] },
        effect: { intelligence: 12, money: -400, energy: -20 },
        gradeUpdates: { math: 12, science: 12 },
        stressEffect: 15,
        feedback: "Birebir ders çok etkili. Eksiklerin kapandı.",
      },
      {
        id: 'yks_rest',
        text: "Mola ver, dinlen (Zor - Çalışkanlar için)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', min: 60 }],
        effect: { health: 15, energy: 40, intelligence: -3 },
        personalityEffects: [{ axis: 'patience', change: -3 }],
        stressEffect: -25,
        feedback: "Bir gün hiç çalışmadın. Suçluluk var ama beynin teşekkür ediyor.",
        memory: { emotion: 'SATISFACTION', weight: 'LOW' },
      },
    ],
  },

  // =================================================================
  // AİLE VE AKRABALAR
  // =================================================================

  {
    id: 'tr_akraba_sorgusu',
    tags: ['family', 'social'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.openness < 30) {
        return "'E ne olacak, derslerin nasıl? Kaç alacaksın sınavdan?' Teyzeler yine başladı. Kaçmak istiyorsun.";
      } else if (p.conformity < 30) {
        return "'Derslerin nasıl? Evlenecek misin?' Akrabalar yine saçma sorular soruyor. Patlamak üzeresin.";
      }
      return "Bayramda teyzeler sorguya çekti: 'Derslerin nasıl? Kaç alacaksın?'";
    },
    minAge: 12, maxAge: 18, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'akraba_polite',
        text: "Kibar cevap ver",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', min: 40 }],
        effect: { charisma: 5, discipline: 2, energy: -5 },
        stressEffect: 10,
        feedback: "'Çalışıyorum teyze, inşallah iyi olur.' Klasik ama işe yarıyor.",
      },
      {
        id: 'akraba_snap',
        text: "Sert çık: 'Sizi ilgilendirmez!'",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', max: 40 }],
        effect: { charisma: -8, discipline: 3, familyRelation: -15 },
        personalityEffects: [{ axis: 'conformity', change: -3 }],
        stressEffect: -10,
        feedback: "Ortam buz kesti. Annen sonra fırça attı. Ama içini döktün.",
        memory: { emotion: 'SATISFACTION', weight: 'LOW' },
      },
      {
        id: 'akraba_polite_introvert',
        text: "Kibar cevap ver (Zor - İçe kapanık için)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { charisma: 8, discipline: 5, energy: -15 },
        personalityEffects: [{ axis: 'openness', change: 3 }],
        stressEffect: 20,
        feedback: "Her kelime işkence gibiydi ama başardın. Sosyal becerin gelişiyor.",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'akraba_deflect',
        text: "Konuyu değiştir",
        choiceType: 'NEUTRAL',
        effect: { charisma: 3, intelligence: 2 },
        stressEffect: 5,
        feedback: "Ustalıkla konuyu teyzenin oğluna çevirdin. Taktik işe yaradı.",
      },
    ],
  },

  {
    id: 'tr_evlilik_baskisi',
    tags: ['family', 'social'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.conformity > 70) {
        return "'Sen hâlâ bekâr mısın? Yaş kaç oldu?' Akrabalar üstüne geliyor. Belki de haklılardır?";
      } else if (p.conformity < 30) {
        return "'Evlenecek misin? Çocuk?' Akrabalar yine hayatına karışıyor. Sinirden delirmek üzeresin!";
      }
      return "'Sen hâlâ bekâr mısın?' Akrabalar yine başladı. Nişan, düğün, çocuk derken...";
    },
    minAge: 17, maxAge: 18, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'evlilik_smile',
        text: "Gülerek geçiştir",
        choiceType: 'NEUTRAL',
        effect: { charisma: 5, discipline: 2 },
        stressEffect: 5,
        feedback: "'Önce okul bitsin teyze!' İşe yaradı.",
      },
      {
        id: 'evlilik_boundary',
        text: "Sınır koy: 'Benim hayatım!'",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'conformity', min: 50 }],
        effect: { charisma: -5, discipline: 8, familyRelation: -10 },
        personalityEffects: [{ axis: 'conformity', change: -5 }],
        stressEffect: 15,
        feedback: "Ortam soğudu ama sınırlarını koydun. Herkes seni ciddiye almaya başladı.",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM', customNote: 'Kendini savundun' },
      },
      {
        id: 'evlilik_lie',
        text: "Biri var de (yalan)",
        choiceType: 'PASSIVE',
        effect: { charisma: 3, discipline: -5, familyRelation: 5 },
        stressEffect: -5,
        feedback: "Herkes heyecanlandı! Şimdi her bayram 'ne oldu' diye soracaklar...",
        memory: { emotion: 'GUILT', weight: 'LOW' },
      },
    ],
  },

  // =================================================================
  // MAHALLE VE SOSYAL HAYAT
  // =================================================================

  {
    id: 'tr_mahalle_futbolu',
    tags: ['sport', 'athletic', 'match'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.openness < 30) {
        return "Mahallede çocuklar futbol oynuyor. 'Hadi, bir kişi eksik!' diye bağırıyorlar. Kalabalık...";
      } else if (p.courage > 70) {
        return "Mahallede çocuklar futbol oynuyor. Hadi gösterelim ne yapacağımızı!";
      }
      return "Mahallede çocuklar toplandı. Taşlarla kale yapıldı, takımlar belli. 'Bir kişi eksik!'";
    },
    minAge: 10, maxAge: 16, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'futbol_join',
        text: "Hemen katıl!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', min: 40 }],
        effect: { health: 8, charisma: 5, energy: -25 },
        skillUpdates: { sports: 3 },
        stressEffect: -10,
        feedback: "Toz toprak içinde kaldın ama müthiş eğlendin!",
      },
      {
        id: 'futbol_join_introvert',
        text: "Katıl (Zor seçim)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { health: 8, charisma: 8, energy: -30 },
        personalityEffects: [{ axis: 'openness', change: 5 }],
        skillUpdates: { sports: 3 },
        stressEffect: 15,
        feedback: "Başta garip hissettin ama oyunun içine girince unutun. Eğlendin!",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: 'futbol_goalkeeper',
        text: "Kaleci ol (daha az temas)",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', max: 50 }],
        effect: { health: 5, discipline: 3, energy: -15 },
        skillUpdates: { sports: 2 },
        stressEffect: 5,
        feedback: "Kalecilik zor iş ama daha az koşuşturma. Kritik kurtarışlar yaptın!",
      },
      {
        id: 'futbol_watch',
        text: "İzle sadece",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', max: 30 }],
        effect: { charisma: -3, energy: 5 },
        personalityEffects: [{ axis: 'openness', change: -2 }],
        stressEffect: -5,
        feedback: "Kenarda oturdun. Arkadaşların biraz kırgın.",
        memory: { emotion: 'REGRET', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'tr_internet_kafe',
    tags: ['social', 'group'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.conformity < 30) {
        return "Arkadaşların internet kafeye gece kaçamağı planlıyor. CS oynayacaksınız. Kuralları çiğnemek heyecan verici!";
      } else if (p.conformity > 70) {
        return "Arkadaşların internet kafeye gece kaçamağı planlıyor. Ama... evde haberleri yok. Bu yanlış.";
      }
      return "Arkadaşların internet kafeye gece kaçamağı planlıyor. Evde haberleri yok...";
    },
    minAge: 12, maxAge: 16, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'RISK',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'kafe_go_rebel',
        text: "Git! Kurallar çiğnenmek için var!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', max: 40 }],
        effect: { charisma: 10, discipline: -15, familyRelation: -20, energy: -30 },
        personalityEffects: [{ axis: 'conformity', change: -3 }],
        skillUpdates: { coding: 2 },
        stressEffect: -5,
        feedback: "Sabaha kadar oynadın! Eve gizlice girdin ama anneni uyandırdın. Feci azarlandın. Değdi mi?",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: 'kafe_go_conformist',
        text: "Git (Zor - Uyumcu için)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'conformity', min: 60 }],
        effect: { charisma: 8, discipline: -10, familyRelation: -15, energy: -30 },
        personalityEffects: [{ axis: 'conformity', change: -5 }],
        stressEffect: 25,
        feedback: "Tüm gece suçluluk duygusuyla oynadın. Eğlendin mi? Emin değilsin.",
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
      },
      {
        id: 'kafe_permission',
        text: "Aileden izin iste",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', min: 50 }],
        effect: { discipline: 5, familyRelation: 2 },
        stressEffect: 5,
        feedback: "'Evde kal' dediler. Arkadaşların gitti ama en azından dürüst oldun.",
      },
      {
        id: 'kafe_online',
        text: "Evde online katıl",
        choiceType: 'NEUTRAL',
        effect: { energy: -10, discipline: 3 },
        skillUpdates: { coding: 1 },
        stressEffect: 0,
        feedback: "Evde online katıldın. Aynı değil ama güvendesin.",
      },
    ],
  },

  // =================================================================
  // ERGENLIK VE KİMLİK
  // =================================================================

  {
    id: 'tr_sigara_teklifi',
    tags: ['social', 'group'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.conformity > 70) {
        return "Okulun arkasında büyük çocuklar sigara içiyor. Biri sana uzattı. Her şey sende 'hayır' diyor ama... herkes bakıyor.";
      } else if (p.courage < 30) {
        return "Okulun arkasında sigara teklif ediyorlar. 'Dene, erkek ol!' Reddetsen dalga geçecekler...";
      }
      return "Okulun arkasında büyük çocuklar sigara içiyor. Biri sana uzattı: 'Dene bir tane!'";
    },
    minAge: 12, maxAge: 17, difficulty: 4, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'MORAL',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'sigara_refuse_brave',
        text: "Kesinlikle hayır",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { discipline: 15, health: 5, charisma: -5 },
        personalityEffects: [
          { axis: 'courage', change: 8 },
          { axis: 'conformity', change: -3 },
        ],
        stressEffect: 15,
        feedback: "Baskıya boyun eğmedin. Dalga geçtiler ama doğru olanı yaptın.",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Akran baskısına direndin' },
        grantTraits: ['DISCIPLINED'],
      },
      {
        id: 'sigara_refuse_easy',
        text: "Hayır, bana göre değil",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'courage', min: 50 }],
        effect: { discipline: 10, health: 5 },
        stressEffect: 5,
        feedback: "Rahatça reddettin. Senin tarzın değil, herkes biliyor.",
      },
      {
        id: 'sigara_try',
        text: "Bir tane dene",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', min: 50 }],
        effect: { health: -15, discipline: -10, charisma: 5 },
        personalityEffects: [{ axis: 'conformity', change: 3 }],
        stressEffect: 10,
        feedback: "Öksürdün, gözlerin yaşardı. Pek sevmedin ama 'cool' göründün.",
        memory: { emotion: 'GUILT', weight: 'MEDIUM', customNote: 'Akran baskısına boyun eğdin' },
      },
      {
        id: 'sigara_excuse',
        text: "Bahane uydur ve kaç",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'courage', max: 40 }],
        effect: { discipline: 3, charisma: -2 },
        stressEffect: 5,
        feedback: "'Annem çağırıyor' dedin ve uzaklaştın. Korkak mı, akıllı mı?",
      },
    ],
  },

  {
    id: 'tr_farkli_olmak',
    tags: ['social', 'group'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.conformity < 30) {
        return "Herkes aynı kıyafetleri giyiyor, aynı müzikleri dinliyor. Sen farklısın ve bunu göstermek istiyorsun!";
      } else if (p.conformity > 70) {
        return "Okulda herkes belirli bir 'kalıba' uyuyor. Sen tam uymuyorsun. Değişmeli misin?";
      }
      return "Herkes bir kalıba uyuyor. Sen farklı hissediyorsun. Ne yapacaksın?";
    },
    minAge: 12, maxAge: 18, difficulty: 3, rarity: 'COMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    challengesAxis: 'conformity',
    choices: [
      {
        id: 'farkli_be_yourself',
        text: "Kendin ol, ne derlerse desinler",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'conformity', min: 40 }],
        effect: { charisma: -10, discipline: 10, health: 10, intelligence: 5 },
        personalityEffects: [
          { axis: 'conformity', change: -8 },
          { axis: 'courage', change: 5 },
        ],
        stressEffect: 20,
        feedback: "Bazıları garip buldu, bazıları hayranlık duydu. Yalnız kaldın ama özgürsün.",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Kendini kabul ettin' },
        grantTraits: ['BRAVE'],
      },
      {
        id: 'farkli_conform',
        text: "Uyum sağla, hayat kolaylaşsın",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', min: 40 }],
        effect: { charisma: 10, discipline: -5, health: -5 },
        personalityEffects: [{ axis: 'conformity', change: 5 }],
        stressEffect: -5,
        feedback: "Herkes gibi oldun. Kabul gördün ama aynaya baktığında tanıdığın kişiyi görüyor musun?",
        memory: { emotion: 'REGRET', weight: 'MEDIUM', customNote: 'Kendinden vazgeçtin mi?' },
      },
      {
        id: 'farkli_rebel',
        text: "Tam tersini yap, isyan!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'conformity', max: 40 }],
        effect: { charisma: 5, discipline: -8, familyRelation: -5 },
        personalityEffects: [{ axis: 'conformity', change: -5 }],
        stressEffect: 5,
        feedback: "Herkesin tersine gittin. Dikkat çektin ama... bu gerçekten sen misin yoksa sadece zıtlık mı?",
      },
    ],
  },

  // =================================================================
  // YEMEK VE KÜLTÜR
  // =================================================================

  {
    id: 'tr_anne_yemegi',
    tags: ['family', 'social'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.empathy > 70) {
        return "Dışarıda arkadaşlarla buluştun. McDonald's mı? Ama annen eve yemek hazırlamış, seni bekliyor...";
      }
      return "Dışarıda arkadaşlarla buluştun. McDonald's mı, eve dönüp annenin yemekleri mi?";
    },
    minAge: 12, maxAge: 18, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'yemek_fastfood',
        text: "Fast food! 🍔",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { money: -50, health: -5, charisma: 5, energy: 10 },
        personalityEffects: [{ axis: 'empathy', change: -2 }],
        stressEffect: -5,
        feedback: "Burger, kola, patates... Lezzetli ama annen üzülecek.",
      },
      {
        id: 'yemek_home',
        text: "Eve, annemin yemekleri",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', min: 50 }],
        effect: { health: 10, familyRelation: 10, money: 0 },
        personalityEffects: [{ axis: 'empathy', change: 2 }],
        stressEffect: 0,
        feedback: "Kuru fasulye, pilav, ayran... Hiçbir şey anne yemeği gibi değil.",
        memory: { emotion: 'SATISFACTION', weight: 'LOW' },
      },
      {
        id: 'yemek_home_hard',
        text: "Eve dön (Zor - Bencil için)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 40 }],
        effect: { health: 10, familyRelation: 12, money: 0 },
        personalityEffects: [{ axis: 'empathy', change: 5 }],
        stressEffect: 10,
        feedback: "Arkadaşlarını bırakıp eve döndün. Annen mutlu oldu. Garip bir sıcaklık hissettin.",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
    ],
  },

  // =================================================================
  // MİLLİ GÜNLER VE TOPLUMSAL OLAYLAR
  // =================================================================

  {
    id: 'tr_milli_mac',
    tags: ['sport', 'match', 'athletic'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.openness > 70) {
        return "Türkiye milli maç oynuyor! Tüm mahalle balkona çıkmış. Heyecan dorukta!";
      } else if (p.openness < 30) {
        return "Türkiye milli maç oynuyor. Kornalar, bağırışlar... Gürültü seni rahatsız ediyor.";
      }
      return "Türkiye milli maç oynuyor! Mahalle coşkulu, kornalar çalıyor.";
    },
    minAge: 12, maxAge: 18, difficulty: 1, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'mac_balkon',
        text: "Balkondan izle ve bağır",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', min: 40 }],
        effect: { charisma: 8, health: 3, energy: -15 },
        stressEffect: -10,
        feedback: "'GOOOL!' Tüm mahalle çığlık attı. Birlik duygusu muhteşem.",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: 'mac_kafe',
        text: "Kafede izle",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { charisma: 12, money: -30, energy: -25 },
        personalityEffects: [{ axis: 'openness', change: 5 }],
        stressEffect: 15,
        feedback: "Kafe tıklım tıklıktı. Tanımadığın insanlarla kucaklaştın! Garip ama güzeldi.",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: 'mac_ignore',
        text: "İlgilenmiyorum",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { discipline: 3 },
        personalityEffects: [{ axis: 'openness', change: -2 }],
        stressEffect: 5,
        feedback: "Sessiz bir gece geçirdin. Gürültü rahatsız etti ama kendi halinde kaldın.",
      },
    ],
  },

  {
    id: 'tr_23_nisan',
    tags: ['family', 'social'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.openness < 30) {
        return "23 Nisan kutlaması. Sınıf şiir okuyacak çocuk arıyor. Herkes sana bakıyor...";
      } else if (p.openness > 70) {
        return "23 Nisan Çocuk Bayramı! Okulda kutlama var. Sahne senin olmalı!";
      }
      return "23 Nisan Çocuk Bayramı! Okulda kutlama var. Sınıf şiir okuyacak çocuk arıyor.";
    },
    minAge: 7, maxAge: 12, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: '23nisan_poem',
        text: "Ben okurum! (Zor - İçe kapanık için)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 50 }],
        effect: { charisma: 15, discipline: 5, energy: -20 },
        personalityEffects: [
          { axis: 'openness', change: 8 },
          { axis: 'courage', change: 5 },
        ],
        stressEffect: 25,
        feedback: "'Türk çocuğu her şeyin en iyisine layıktır!' Alkışlar koptu. Başardın!",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Sahneye çıktın' },
        grantTraits: ['BRAVE'],
      },
      {
        id: '23nisan_poem_easy',
        text: "Sahneye çık!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', min: 60 }],
        effect: { charisma: 12, discipline: 3, energy: -10 },
        stressEffect: -5,
        feedback: "Muhteşem bir performans! Bu senin doğal ortamın.",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
      {
        id: '23nisan_flag',
        text: "Bayrak taşıyayım",
        choiceType: 'NEUTRAL',
        effect: { discipline: 5, health: 3, charisma: 3 },
        stressEffect: 5,
        feedback: "Kortejin önünde bayrak taşıdın. Gururla yürüdün.",
      },
      {
        id: '23nisan_watch',
        text: "Seyirci kalayım",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { energy: 5 },
        stressEffect: -5,
        feedback: "Arkadaşlarını izledin. Belki gelecek sene...",
      },
    ],
  },

  // =================================================================
  // ÇOCUKLUK DÖNEMİ (5-10 YAŞ)
  // =================================================================

  {
    id: 'tr_oyun_parki',
    tags: ['social', 'family'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.openness < 30) {
        return "Parkta çocuklar salıncakta oynuyor. Sen kenarda duruyorsun... Katılsan mı?";
      }
      return "Parkta çocuklar oyun oynuyor! Salıncaklar, kaydıraklar, kum havuzu... Hangisine koşsam?";
    },
    minAge: 5, maxAge: 10, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'park_swing',
        text: "Salıncağa koş!",
        choiceType: 'PASSIVE',
        effect: { health: 8, charisma: 3, energy: -15 },
        stressEffect: -10,
        feedback: "Gökyüzüne doğru uçuyorsun! Rüzgar yüzünde, kahkahalar havada.",
      },
      {
        id: 'park_friends',
        text: "Çocuklarla tanış",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { charisma: 10, energy: -20 },
        personalityEffects: [{ axis: 'openness', change: 5 }],
        stressEffect: 15,
        feedback: "'Merhaba, ben senin adın. Oynayalım mı?' İlk adımı attın!",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'park_sandbox',
        text: "Kum havuzunda oyna",
        choiceType: 'NEUTRAL',
        effect: { health: 5, intelligence: 3 },
        stressEffect: -5,
        feedback: "Kum kaleler yaptın. Sanat eserin güneşte parlıyor!",
      },
    ],
  },

  {
    id: 'tr_ilk_bisiklet',
    tags: ['sport', 'athletic'],
    text: "Baban sana bisiklet aldı! Ama binmeyi bilmiyorsun. Yardımcı tekerlekler var... takılsın mı?",
    minAge: 5, maxAge: 8, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'GROWTH',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'bike_helper',
        text: "Yardımcı tekerleklerle başla",
        choiceType: 'PASSIVE',
        effect: { health: 5, discipline: 3 },
        stressEffect: -5,
        feedback: "Güvenli ama eğlenceli! Yavaş yavaş öğreniyorsun.",
      },
      {
        id: 'bike_brave',
        text: "Direk dene! (Zor)",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { health: -5, discipline: 10, charisma: 5 },
        personalityEffects: [{ axis: 'courage', change: 8 }],
        stressEffect: 20,
        feedback: "Birkaç kez düştün, dizlerin sıyrıldı... AMA SÜRDÜÜÜn! Baban alkışlıyor!",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Bisiklet öğrendin' },
        grantTraits: ['BRAVE'],
      },
    ],
  },

  {
    id: 'tr_cizgi_film',
    tags: ['creative', 'art'],
    text: (_ctx: EventContext) => {
      return "Sabah erkenden kalktın. Çizgi filmler başlıyor! Ama annen kahvaltı hazırladı...";
    },
    minAge: 5, maxAge: 12, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'CONFLICT',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'cizgi_tv',
        text: "Önce çizgi film!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        effect: { energy: 10, familyRelation: -5, discipline: -3 },
        stressEffect: -5,
        feedback: "Pokemon kaçmaz! Annen homurdandı ama izin verdi.",
      },
      {
        id: 'cizgi_breakfast',
        text: "Önce kahvaltı",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 40 }],
        effect: { health: 8, familyRelation: 8, discipline: 5 },
        personalityEffects: [{ axis: 'patience', change: 5 }],
        stressEffect: 10,
        feedback: "Zor oldu ama sabrettin. Annen mutlu, karnın tok. Çizgi film de başlamadı daha!",
      },
      {
        id: 'cizgi_both',
        text: "TV önünde ye",
        choiceType: 'NEUTRAL',
        effect: { familyRelation: -2, health: 3 },
        stressEffect: 0,
        feedback: "Tabağı kucağına aldın. Pratik çözüm ama annen pek hoşlanmadı.",
      },
    ],
  },

  {
    id: 'tr_okul_ilk_gun',
    tags: ['school', 'social'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.openness < 30) {
        return "Okulun ilk günü. Tanımadığın yüzler, büyük binalar, gürültü... Annen elini bırakacak.";
      }
      return "Okulun ilk günü! Yeni arkadaşlar, yeni maceralar! Heyecanlı mısın?";
    },
    minAge: 6, maxAge: 7, difficulty: 3, rarity: 'RARE', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'okul_brave',
        text: "Cesurca gir",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { charisma: 10, discipline: 5 },
        personalityEffects: [{ axis: 'openness', change: 8 }, { axis: 'courage', change: 5 }],
        stressEffect: 25,
        feedback: "Ağlamadın, koşmadın. Öğretmen 'aferin' dedi. Bu yeni başlangıç!",
        memory: { emotion: 'PRIDE', weight: 'HIGH', customNote: 'Okula cesurca başladın' },
      },
      {
        id: 'okul_excited',
        text: "Heyecanla koş!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', min: 50 }],
        effect: { charisma: 8, energy: -10 },
        stressEffect: -5,
        feedback: "Sınıfa koştun, herkesle tanıştın. Bu senin ortamın!",
      },
      {
        id: 'okul_cry',
        text: "Ağla ve sarıl",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'courage', max: 30 }],
        effect: { familyRelation: 5, charisma: -5 },
        stressEffect: -10,
        feedback: "Annen seni teselli etti. Herkes ağlar ilk gün, normal.",
      },
    ],
  },

  {
    id: 'tr_harçlık',
    tags: ['money', 'finance'],
    text: "Hafta sonu harçlık günü! Baban sana 20 TL verdi. Ne yapacaksın?",
    minAge: 6, maxAge: 15, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'harçlık_save',
        text: "Kumbaraya at",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        effect: { money: 20, discipline: 8 },
        personalityEffects: [{ axis: 'patience', change: 5 }],
        stressEffect: 10,
        feedback: "Harcamak için elledin titirdi ama koydun. Gelecekte işe yarayacak!",
      },
      {
        id: 'harçlık_candy',
        text: "Bakkalda harca",
        choiceType: 'PASSIVE',
        effect: { health: -3, charisma: 3 },
        stressEffect: -5,
        feedback: "Cips, çikolata, gazoz... Mutlusun ama para gitti!",
      },
      {
        id: 'harçlık_half',
        text: "Yarısını biriktir",
        choiceType: 'NEUTRAL',
        effect: { money: 10, discipline: 3 },
        stressEffect: 0,
        feedback: "Akıllıca! Hem eğlendin hem biriktirdin.",
      },
    ],
  },

  // =================================================================
  // GÜNLÜK HAYAT OLAYLARI
  // =================================================================

  {
    id: 'tr_sabah_uyanis',
    tags: ['family', 'social'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.patience > 60) {
        return "Sabah oldu. Alarm çaldı. Gözlerin açık, zihinin berrak.";
      }
      return "Sabah oldu... Alarm çalıyor. Yataktan çıkmak o kadar zor ki!";
    },
    minAge: 12, maxAge: 18, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'GROWTH',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'sabah_erken',
        text: "Hemen kalk",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        effect: { discipline: 5, energy: 10, health: 3 },
        personalityEffects: [{ axis: 'patience', change: 3 }],
        stressEffect: 10,
        feedback: "Erken kalktın, güne enerjik başladın!",
      },
      {
        id: 'sabah_ertele',
        text: "5 dakika daha...",
        choiceType: 'PASSIVE',
        effect: { energy: 5, discipline: -3 },
        stressEffect: -5,
        feedback: "5 dakika 30 dakika oldu... Yine geç kaldın!",
      },
      {
        id: 'sabah_spor',
        text: "Sabah sporu yap",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 40 }],
        effect: { health: 10, discipline: 8, energy: -10 },
        personalityEffects: [{ axis: 'patience', change: 5 }],
        skillUpdates: { sports: 2 },
        stressEffect: 15,
        feedback: "Şınav, mekik, koşu... Zordu ama harika hissediyorsun!",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'tr_ev_isler',
    tags: ['family', 'social'],
    text: (_ctx: EventContext) => {
      return "Annen senin odanı temizlemeni istiyor. Ama arkadaşların dışarıda bekliyor...";
    },
    minAge: 8, maxAge: 16, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'ev_temizle',
        text: "Önce temizle",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { discipline: 8, familyRelation: 10, charisma: -3 },
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        stressEffect: 10,
        feedback: "Sızlanarak da olsa temizledin. Annen mutlu, vicdan rahat.",
      },
      {
        id: 'ev_sonra',
        text: "Sonra yaparım!",
        choiceType: 'PASSIVE',
        effect: { familyRelation: -8, charisma: 5 },
        stressEffect: -5,
        feedback: "Çıktın ama eve dönünce hesap var...",
      },
      {
        id: 'ev_hizli',
        text: "Hızlıca topla",
        choiceType: 'NEUTRAL',
        effect: { discipline: 3, familyRelation: 3 },
        stressEffect: 5,
        feedback: "Her şeyi yatağın altına tıktın. Sayılır... sanırım?",
      },
    ],
  },

  {
    id: 'tr_bakkal',
    tags: ['social', 'family', 'money'],
    text: "Annen seni bakkala gönderdi. Alışveriş listesi var ama fazla para da verdi...",
    minAge: 7, maxAge: 15, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'bakkal_honest',
        text: "Sadece listedekileri al",
        choiceType: 'PASSIVE',
        effect: { discipline: 5, familyRelation: 5 },
        stressEffect: 0,
        feedback: "Para üstünü eksiksiz verdin. Annen güveniyor sana.",
      },
      {
        id: 'bakkal_snack',
        text: "Bir şeyler de kendine al",
        choiceType: 'PASSIVE',
        effect: { health: -3, familyRelation: -3, discipline: -3 },
        stressEffect: -5,
        feedback: "Cips aldın ama suçluluk duyuyorsun. Annen fark eder mi?",
        memory: { emotion: 'GUILT', weight: 'LOW' },
      },
      {
        id: 'bakkal_save',
        text: "Fazlayı biriktir",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', min: 50 }],
        effect: { discipline: -5, money: 10 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: 5,
        feedback: "Para cebinde... ama bu doğru mu?",
      },
    ],
  },

  {
    id: 'tr_komsu_ziyaret',
    tags: ['social', 'family'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.openness < 30) {
        return "Komşular geldi. Annen seni misafirlere çay servisi yapman için çağırıyor...";
      }
      return "Komşular geldi! Çay, pasta, sohbet. Ne güzel bir kalabalık!";
    },
    minAge: 12, maxAge: 18, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'komsu_servis',
        text: "Çay servisi yap",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { charisma: 8, discipline: 5, familyRelation: 8 },
        personalityEffects: [{ axis: 'openness', change: 3 }],
        stressEffect: 15,
        feedback: "'Maşallah ne terbiyeli!' Herkes seni övdü. Zordu ama değdi.",
      },
      {
        id: 'komsu_sohbet',
        text: "Sohbete katıl",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', min: 50 }],
        effect: { charisma: 10, intelligence: 3, energy: -10 },
        stressEffect: -5,
        feedback: "Büyüklerle sohbet ettin. Dünya hakkında yeni şeyler öğrendin!",
      },
      {
        id: 'komsu_kac',
        text: "Odana kaç",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { energy: 10, familyRelation: -5, charisma: -3 },
        stressEffect: -10,
        feedback: "Sessizce kayboldun. Rahat ama annen kırgın.",
      },
    ],
  },

  {
    id: 'tr_yagmurlu_gun',
    tags: ['creative', 'art'],
    text: "Bugün hava yağmurlu. Dışarı çıkmak mümkün değil. Evde ne yapacaksın?",
    minAge: 9, maxAge: 15, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'GROWTH',
    choices: [
      {
        id: 'yagmur_kitap',
        text: "Kitap oku",
        choiceType: 'NEUTRAL',
        effect: { intelligence: 8, discipline: 3 },
        stressEffect: -5,
        feedback: "Yağmurun sesi ve kitabın kokusu... Huzurlu bir gün.",
      },
      {
        id: 'yagmur_oyun',
        text: "Video oyunu oyna",
        choiceType: 'NEUTRAL',
        effect: { energy: -10, intelligence: 2 },
        skillUpdates: { coding: 1 },
        stressEffect: -10,
        feedback: "Saatlerce oynadın. Eğlenceli ama zaman uçtu!",
      },
      {
        id: 'yagmur_tv',
        text: "Film izle",
        choiceType: 'NEUTRAL',
        effect: { energy: 5 },
        stressEffect: -5,
        feedback: "Aile filmi izlediniz. Güzel bir gün geçirdiniz.",
      },
      {
        id: 'yagmur_yagmur',
        text: "Yağmurda oyna!",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'courage', min: 40 }],
        effect: { health: -5, charisma: 8, discipline: -5 },
        stressEffect: -15,
        feedback: "Sırılsıklam oldun ama çok eğlendin! Annen fırçayı bastı ama gözleri gülüyordu.",
      },
    ],
  },

  {
    id: 'tr_aile_yemegi',
    tags: ['family', 'social'],
    text: (_ctx: EventContext) => {
      return "Akşam yemeği vakti. Aile masada toplandı. Bugün ne konuşulacak?";
    },
    minAge: 10, maxAge: 18, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'SOCIAL',
    choices: [
      {
        id: 'yemek_anlat',
        text: "Gününü anlat",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', min: 40 }],
        effect: { familyRelation: 8, charisma: 3 },
        stressEffect: -5,
        feedback: "Herkes seni dinledi. Aile sohbetleri güzel!",
      },
      {
        id: 'yemek_dinle',
        text: "Sessizce ye",
        choiceType: 'PASSIVE',
        effect: { familyRelation: 2, energy: 5 },
        stressEffect: 0,
        feedback: "Sessiz bir yemek ama huzurluydu.",
      },
      {
        id: 'yemek_soru',
        text: "Sorular sor",
        choiceType: 'NEUTRAL',
        effect: { intelligence: 5, familyRelation: 5, charisma: 3 },
        stressEffect: 0,
        feedback: "'Baba sen küçükken ne yapardın?' Hikayeler dinledin.",
      },
    ],
  },

  {
    id: 'tr_ders_calis',
    tags: ['study', 'school'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.patience > 60) {
        return "Ders çalışma zamanı. Masaya otur ve başla!";
      }
      return "Ders çalışman lazım ama telefon çok çekici görünüyor...";
    },
    minAge: 7, maxAge: 18, difficulty: 2, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'GROWTH',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'ders_fokus',
        text: "Odaklan ve çalış",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        effect: { intelligence: 8, discipline: 8, energy: -20 },
        personalityEffects: [{ axis: 'patience', change: 5 }],
        gradeUpdates: { math: 3, science: 3 },
        stressEffect: 15,
        feedback: "Zordu ama 2 saat çalıştın. Konular oturdu!",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'ders_telefon',
        text: "Biraz telefona bak",
        choiceType: 'PASSIVE',
        effect: { intelligence: -3, discipline: -5, energy: 5 },
        stressEffect: -5,
        feedback: "'5 dakika' 2 saat oldu. Yine erteleme...",
        memory: { emotion: 'GUILT', weight: 'LOW' },
      },
      {
        id: 'ders_pomodoro',
        text: "25dk çalış, 5dk mola",
        choiceType: 'NEUTRAL',
        effect: { intelligence: 5, discipline: 5, energy: -10 },
        gradeUpdates: { math: 2, science: 2 },
        stressEffect: 5,
        feedback: "Pomodoro tekniği işe yaradı! Hem çalıştın hem dinlendin.",
      },
    ],
  },

  {
    id: 'tr_hasta_olma',
    tags: ['family', 'social'],
    text: "Bugün kendini iyi hissetmiyorsun. Boğazın ağrıyor, ateşin var...Okula gitmeli misin?",
    minAge: 6, maxAge: 18, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    choices: [
      {
        id: 'hasta_kal',
        text: "Evde kal",
        choiceType: 'PASSIVE',
        effect: { health: 15, discipline: -5, energy: 20 },
        stressEffect: -15,
        feedback: "Çorba, battaniye, uyku... İyileşiyorsun.",
      },
      {
        id: 'hasta_git',
        text: "Yine de git",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { health: -10, discipline: 10 },
        personalityEffects: [{ axis: 'courage', change: 3 }],
        stressEffect: 20,
        feedback: "Zor bir gün geçirdin ama devamsızlık yapmadın.",
      },
      {
        id: 'hasta_numara',
        text: "Hasta numarası yap",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', max: 40 }],
        effect: { health: 5, discipline: -10, familyRelation: -5 },
        stressEffect: -10,
        feedback: "Aslında o kadar hasta değilsin ama gün boş geçti.",
        memory: { emotion: 'GUILT', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'tr_sinav_gunu',
    tags: ['exam', 'study', 'school', 'sinav'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.patience > 60) {
        return "Bugün sınav var. Çalıştın, hazırsın. Sadece sakin ol ve yap!";
      }
      return "Bugün sınav var! Yeterince çalıştın mı? Stres yapıyorsun...";
    },
    minAge: 7, maxAge: 18, difficulty: 3, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'GROWTH',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'sinav_sakin',
        text: "Sakin ol ve yap",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { intelligence: 5, discipline: 5 },
        personalityEffects: [{ axis: 'courage', change: 3 }],
        stressEffect: 15,
        feedback: "Derin nefes, odaklan, yaz. Sandığından iyi geçti!",
      },
      {
        id: 'sinav_panik',
        text: "Panik yap",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'courage', max: 40 }],
        effect: { intelligence: -5, health: -5 },
        stressEffect: 25,
        feedback: "Aklın karıştı, sorular bulanıklaştı. Keşke sakin olabilseydin...",
        memory: { emotion: 'REGRET', weight: 'LOW' },
      },
      {
        id: 'sinav_kopya',
        text: "Kopya çek",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', max: 40 }],
        effect: { discipline: -15, intelligence: -5 },
        stressEffect: 30,
        feedback: "Yakalanmadın... bu sefer. Ama içindeki ses susmadı.",
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'tr_tatil_plani',
    tags: ['family', 'social'],
    text: "Yaz tatili başlıyor! 3 ay boş zaman. Ne yapacaksın?",
    minAge: 7, maxAge: 17, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'GROWTH',
    choices: [
      {
        id: 'tatil_kamp',
        text: "Yaz kampına git",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 50 }],
        effect: { charisma: 15, health: 10, energy: -20, money: -200 },
        personalityEffects: [{ axis: 'openness', change: 8 }],
        stressEffect: 15,
        feedback: "Yeni arkadaşlar, doğa, macera! Hayatının yazı oldu!",
        memory: { emotion: 'SATISFACTION', weight: 'HIGH' },
      },
      {
        id: 'tatil_kurs',
        text: "Kurs al (yüzme/müzik)",
        choiceType: 'NEUTRAL',
        effect: { money: -150, intelligence: 5 },
        skillUpdates: { music: 5, sports: 3 },
        stressEffect: 5,
        feedback: "Yeni bir yetenek öğrendin. Tatil boşa geçmedi!",
      },
      {
        id: 'tatil_ev',
        text: "Evde takıl",
        choiceType: 'PASSIVE',
        effect: { energy: 20, discipline: -10 },
        stressEffect: -15,
        feedback: "Oyun, uyku, TV... Rahat ama sıkıcı geçti.",
      },
      {
        id: 'tatil_koy',
        text: "Köye git",
        choiceType: 'NEUTRAL',
        effect: { health: 15, familyRelation: 10, energy: 10 },
        stressEffect: -20,
        feedback: "Nine'nin bahçesi, taze meyve, temiz hava. Şehir stresi eridi!",
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      },
    ],
  },

  {
    id: 'tr_kayip_esya',
    tags: ['family', 'social'],
    text: "En sevdiğin kalemini/oyuncağını kaybettin! Ne yapacaksın?",
    minAge: 5, maxAge: 12, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'GROWTH',
    challengesAxis: 'patience',
    choices: [
      {
        id: 'kayip_ara',
        text: "Sabırla ara",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'patience', max: 50 }],
        effect: { discipline: 8, intelligence: 3 },
        personalityEffects: [{ axis: 'patience', change: 5 }],
        stressEffect: 15,
        feedback: "Her yere baktın ve BULDUN! Sabır meyvesini verdi.",
        memory: { emotion: 'SATISFACTION', weight: 'LOW' },
      },
      {
        id: 'kayip_agla',
        text: "Ağla ve vazgeç",
        choiceType: 'PASSIVE',
        effect: { familyRelation: 5, discipline: -5 },
        stressEffect: -5,
        feedback: "Üzüldün ama annen teselli etti. Belki yenisini alır...",
      },
      {
        id: 'kayip_sucla',
        text: "Başkasını suçla",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', max: 40 }],
        effect: { charisma: -5, familyRelation: -5, discipline: -3 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: 5,
        feedback: "'Kardeşim aldı!' dedin ama... gerçekten öyle mi?",
        memory: { emotion: 'GUILT', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'tr_yeni_komsular',
    tags: ['social', 'family'],
    text: "Yan daireye yeni komşular taşındı. Onlarla tanışacak mısın?",
    minAge: 6, maxAge: 16, difficulty: 1, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'komsu_merhaba',
        text: "Git ve tanış",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 50 }],
        effect: { charisma: 10 },
        personalityEffects: [{ axis: 'openness', change: 5 }],
        stressEffect: 15,
        feedback: "'Merhaba, ben komşunuz!' Yeni bir arkadaşlık başlayabilir!",
        memory: { emotion: 'PRIDE', weight: 'LOW' },
      },
      {
        id: 'komsu_bekle',
        text: "Anne babam tanışsın önce",
        choiceType: 'NEUTRAL',
        effect: { charisma: 3 },
        stressEffect: 0,
        feedback: "Aileler tanıştı. Sen de tanıştırıldın. Daha kolaydı böyle.",
      },
      {
        id: 'komsu_kac',
        text: "Uzak dur",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', max: 30 }],
        effect: { charisma: -3 },
        personalityEffects: [{ axis: 'openness', change: -2 }],
        stressEffect: -5,
        feedback: "Tanışmadın. Kim bilir nasıl insanlar...",
      },
    ],
  },

  {
    id: 'tr_kavga_sahit',
    tags: ['social', 'family'],
    text: (_ctx: EventContext) => {
      return "Okulda iki çocuk kavga ediyor. Sen de oradasın. Ne yapacaksın?";
    },
    minAge: 7, maxAge: 16, difficulty: 3, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'courage',
    choices: [
      {
        id: 'kavga_ayir',
        text: "Ayırmaya çalış",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'courage', max: 50 }],
        effect: { health: -5, charisma: 10, discipline: 5 },
        personalityEffects: [{ axis: 'courage', change: 8 }, { axis: 'empathy', change: 3 }],
        stressEffect: 20,
        feedback: "Araya girdin! Birkaç yumruk yedin ama kavga bitti. Kahraman!",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
        grantTraits: ['BRAVE'],
      },
      {
        id: 'kavga_ogretmen',
        text: "Öğretmen çağır",
        choiceType: 'NEUTRAL',
        effect: { discipline: 5, charisma: -3 },
        stressEffect: 5,
        feedback: "Öğretmen geldi, kavga bitti. Doğru olanı yaptın... galiba.",
      },
      {
        id: 'kavga_izle',
        text: "Sadece izle",
        choiceType: 'PASSIVE',
        effect: { charisma: -5 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: 10,
        feedback: "İzledin... Vicdanın rahat değil ama güvendesin.",
        memory: { emotion: 'GUILT', weight: 'LOW' },
      },
    ],
  },

  {
    id: 'tr_sinif_gorev',
    tags: ['school', 'social'],
    text: "Öğretmen sınıf başkanı/temsilci arıyor. Aday olacak mısın?",
    minAge: 8, maxAge: 16, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: false,
    personalityCategory: 'SOCIAL',
    challengesAxis: 'openness',
    choices: [
      {
        id: 'gorev_aday',
        text: "Aday ol!",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'openness', max: 50 }],
        effect: { charisma: 15, discipline: 8, energy: -15 },
        personalityEffects: [{ axis: 'openness', change: 8 }, { axis: 'courage', change: 5 }],
        stressEffect: 25,
        feedback: "Sınıfın önünde konuştun! Seçildin mi bilmiyorsun ama cesaretin alkışlandı!",
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
      },
      {
        id: 'gorev_destek',
        text: "Başkasını destekle",
        choiceType: 'NEUTRAL',
        effect: { charisma: 5, familyRelation: 3 },
        stressEffect: 0,
        feedback: "Arkadaşını destekledin. O kazandı, sen de mutlusun.",
      },
      {
        id: 'gorev_hayir',
        text: "Hayır, teşekkürler",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', max: 40 }],
        effect: { energy: 5 },
        stressEffect: -5,
        feedback: "Sorumluluk istemiyorsun. Rahat ol.",
      },
    ],
  },

  {
    id: 'tr_bos_gun',
    tags: ['social', 'creative'],
    text: (ctx: EventContext) => {
      const p = ctx.personality;
      if (p.openness > 60) {
        return "Bugün ne okul var ne de plan. Boş bir gün! Ne macera yapacaksın?";
      }
      return "Bugün hiçbir planın yok. Evde ne yapacaksın?";
    },
    minAge: 6, maxAge: 16, difficulty: 1, rarity: 'COMMON', isRepeatable: true,
    personalityCategory: 'GROWTH',
    choices: [
      {
        id: 'bos_macera',
        text: "Dışarı çık, keşfet",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'openness', min: 40 }],
        effect: { health: 8, charisma: 5, energy: -20 },
        stressEffect: -10,
        feedback: "Mahallede dolaştın, yeni yerler keşfettin. Güzel bir gün!",
      },
      {
        id: 'bos_hobi',
        text: "Hobi yap",
        choiceType: 'NEUTRAL',
        effect: { intelligence: 5, discipline: 3 },
        skillUpdates: { music: 2, design: 2 },
        stressEffect: -5,
        feedback: "Resim yaptın, müzik dinledin. Yaratıcı bir gün geçti.",
      },
      {
        id: 'bos_uyku',
        text: "Tüm gün uyu",
        choiceType: 'PASSIVE',
        effect: { energy: 30, discipline: -8 },
        stressEffect: -15,
        feedback: "Sabah 6'dan akşam 6'ya uyudun. Dinlendin ama gün kayıp!",
      },
    ],
  },

  {
    id: 'tr_hediye_secimi',
    tags: ['family', 'social', 'money'],
    text: "Annenin doğum günü yaklaşıyor. Bir şey almak istiyorsun ama paran az...",
    minAge: 8, maxAge: 16, difficulty: 2, rarity: 'UNCOMMON', isRepeatable: true,
    personalityCategory: 'MORAL',
    challengesAxis: 'empathy',
    choices: [
      {
        id: 'hediye_el',
        text: "El yapımı bir şey yap",
        choiceType: 'NEUTRAL',
        effect: { familyRelation: 15, charisma: 5, discipline: 5 },
        stressEffect: 10,
        feedback: "Kart yaptın, resim çizdin. Annen ağladı mutluluktan!",
        memory: { emotion: 'PRIDE', weight: 'MEDIUM' },
      },
      {
        id: 'hediye_satin',
        text: "Tüm birikimini harca",
        choiceType: 'CHALLENGE',
        reqPersonality: [{ axis: 'empathy', max: 50 }],
        effect: { familyRelation: 12, money: -100 },
        personalityEffects: [{ axis: 'empathy', change: 5 }],
        stressEffect: 15,
        feedback: "Güzel bir çiçek aldın. Paran bitti ama annenin gözleri parlıyordu.",
      },
      {
        id: 'hediye_unut',
        text: "Unuttum desem?",
        choiceType: 'PASSIVE',
        reqPersonality: [{ axis: 'empathy', max: 30 }],
        effect: { familyRelation: -10 },
        personalityEffects: [{ axis: 'empathy', change: -3 }],
        stressEffect: 5,
        feedback: "Annen üzgün görünmedi ama içten içe kırıldı...",
        memory: { emotion: 'GUILT', weight: 'MEDIUM' },
      },
    ],
  },

];

export default TURKISH_EVENTS;
