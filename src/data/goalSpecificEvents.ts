import { GameEvent, LifeGoal, Stats } from '../types';

interface GoalChoiceTemplate {
  id: string;
  text: string;
  feedback: string;
  effect: Partial<Stats>;
  stressEffect: number;
}

interface GoalEventTemplate {
  id: string;
  text: string;
  minAge: number;
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE';
  difficulty: number;
  personalityCategory: GameEvent['personalityCategory'];
  tags: string[];
  safeChoice: GoalChoiceTemplate;
  boldChoice: GoalChoiceTemplate;
}

const GOAL_TAG: Record<LifeGoal, string> = {
  ACADEMIC: 'goal_academic',
  ATHLETIC: 'goal_athletic',
  CREATIVE: 'goal_creative',
  WEALTH: 'goal_wealth',
  SOCIAL: 'goal_social',
};

const buildGoalEvent = (goal: LifeGoal, template: GoalEventTemplate): GameEvent => ({
  id: template.id,
  text: template.text,
  minAge: template.minAge,
  maxAge: 18,
  rarity: template.rarity,
  isRepeatable: false,
  difficulty: template.difficulty,
  personalityCategory: template.personalityCategory,
  tags: [...template.tags, 'goal_specific', GOAL_TAG[goal]],
  condition: (context) => context.gameState?.selectedGoal === goal,
  choices: [
    {
      id: template.safeChoice.id,
      text: template.safeChoice.text,
      effect: template.safeChoice.effect,
      stressEffect: template.safeChoice.stressEffect,
      feedback: template.safeChoice.feedback,
    },
    {
      id: template.boldChoice.id,
      text: template.boldChoice.text,
      effect: template.boldChoice.effect,
      stressEffect: template.boldChoice.stressEffect,
      feedback: template.boldChoice.feedback,
    },
  ],
});

const ACADEMIC_EVENTS: GoalEventTemplate[] = [
  {
    id: 'goal_academic_research_deadline',
    text: 'Mentorun sana bir arastirma dosyasi teslim tarihi verdi. Planini netlestirmen gerekiyor.',
    minAge: 12,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'GROWTH',
    tags: ['study', 'science', 'research'],
    safeChoice: {
      id: 'goal_academic_research_safe',
      text: 'Planli calisma takvimi kur',
      effect: { intelligence: 4, discipline: 3, energy: -5 },
      stressEffect: 2,
      feedback: 'Programli ilerledin ve temelin saglamlasti.',
    },
    boldChoice: {
      id: 'goal_academic_research_bold',
      text: 'Kisa surede zor deneye gir',
      effect: { intelligence: 6, discipline: 1, health: -1, energy: -7 },
      stressEffect: 8,
      feedback: 'Yuksek tempoda ilerledin; hizlandin ama yoruldun.',
    },
  },
  {
    id: 'goal_academic_science_fair_stage',
    text: 'Okul bilim fuari icin proje secmeleri basladi. Juri karsisina cikacaksin.',
    minAge: 13,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'CONFLICT',
    tags: ['science', 'school', 'competition'],
    safeChoice: {
      id: 'goal_academic_fair_safe',
      text: 'Temel ama guvenli proje sun',
      effect: { intelligence: 5, discipline: 2, charisma: 1, energy: -5 },
      stressEffect: 3,
      feedback: 'Temiz bir sunum yaptin ve guven kazandin.',
    },
    boldChoice: {
      id: 'goal_academic_fair_bold',
      text: 'Riskli prototip ile cik',
      effect: { intelligence: 7, charisma: 1, discipline: 1, energy: -8 },
      stressEffect: 9,
      feedback: 'Prototipin dikkat cekti ama baski seviyesi yukseldi.',
    },
  },
  {
    id: 'goal_academic_olympiad_selection',
    text: 'Akademik olimpiyat secmeleri acildi. Son tur sorulari normal sinavin cok ustunde.',
    minAge: 14,
    rarity: 'RARE',
    difficulty: 4,
    personalityCategory: 'RISK',
    tags: ['olympiad', 'exam', 'study'],
    safeChoice: {
      id: 'goal_academic_olympiad_safe',
      text: 'Secici soru setine adim adim hazirlan',
      effect: { intelligence: 5, discipline: 3, energy: -6 },
      stressEffect: 4,
      feedback: 'Temponu korudun ve hata payini azalttin.',
    },
    boldChoice: {
      id: 'goal_academic_olympiad_bold',
      text: 'Zor sorulara direkt dal',
      effect: { intelligence: 8, discipline: 1, health: -2, energy: -9 },
      stressEffect: 10,
      feedback: 'Sert bir cikis yaptin; buyuk gelisim ama yuksek yorgunluk.',
    },
  },
];

const ATHLETIC_EVENTS: GoalEventTemplate[] = [
  {
    id: 'goal_athletic_camp_invite',
    text: 'Bolgesel antrenman kampina davet edildin. Program kondisyonunu ciddi sekilde zorlayacak.',
    minAge: 12,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'GROWTH',
    tags: ['training', 'athletic', 'sport'],
    safeChoice: {
      id: 'goal_athletic_camp_safe',
      text: 'Planli yuklenme uygula',
      effect: { health: 5, discipline: 3, energy: -6 },
      stressEffect: 3,
      feedback: 'Temiz bir tempo ile guc topladin.',
    },
    boldChoice: {
      id: 'goal_athletic_camp_bold',
      text: 'Ekstra setlerle kapasiteyi zorla',
      effect: { health: 7, discipline: 2, charisma: 1, energy: -9 },
      stressEffect: 9,
      feedback: 'Kapasiten buyudu ama yorgunluk birikti.',
    },
  },
  {
    id: 'goal_athletic_tournament_bracket',
    text: 'Turnuva eslesmeleri aciklandi. Ceyrek finalde favori bir rakiple oynayacaksin.',
    minAge: 13,
    rarity: 'UNCOMMON',
    difficulty: 4,
    personalityCategory: 'CONFLICT',
    tags: ['tournament', 'match', 'training'],
    safeChoice: {
      id: 'goal_athletic_bracket_safe',
      text: 'Rakibe gore taktik hazirla',
      effect: { health: 4, discipline: 3, charisma: 1, energy: -6 },
      stressEffect: 4,
      feedback: 'Okumasi guclu bir mac cikardin.',
    },
    boldChoice: {
      id: 'goal_athletic_bracket_bold',
      text: 'Yuksek tempo ile baski kur',
      effect: { health: 6, charisma: 2, discipline: 1, energy: -8 },
      stressEffect: 10,
      feedback: 'Tempoyla oyunu aldin ama bedeni zorladin.',
    },
  },
  {
    id: 'goal_athletic_captain_vote',
    text: 'Takim kaptanligi oylamasi var. Liderlik, performans kadar iletisim de gerektiriyor.',
    minAge: 14,
    rarity: 'RARE',
    difficulty: 4,
    personalityCategory: 'SOCIAL',
    tags: ['team', 'captain', 'sport'],
    safeChoice: {
      id: 'goal_athletic_captain_safe',
      text: 'Takim ici istikrari one cikar',
      effect: { charisma: 3, discipline: 3, familyRelation: 1, energy: -5 },
      stressEffect: 4,
      feedback: 'Takim guvenini kazanarak liderlige yaklastin.',
    },
    boldChoice: {
      id: 'goal_athletic_captain_bold',
      text: 'Agresif liderlik cikisi yap',
      effect: { charisma: 5, health: 3, discipline: 1, energy: -7 },
      stressEffect: 9,
      feedback: 'Gorunurlugun artti; baskiyi da ustlendin.',
    },
  },
];

const CREATIVE_EVENTS: GoalEventTemplate[] = [
  {
    id: 'goal_creative_exhibition_call',
    text: 'Yerel sergi komitesi portfolyo cagrisi acti. Islerini secip hikayeni anlatman gerekiyor.',
    minAge: 12,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'GROWTH',
    tags: ['art', 'design', 'sergi'],
    safeChoice: {
      id: 'goal_creative_exhibition_safe',
      text: 'Guvenli ama tutarli seri hazirla',
      effect: { charisma: 4, intelligence: 2, energy: -5 },
      stressEffect: 3,
      feedback: 'Tutarlilik sergiyi guclendirdi.',
    },
    boldChoice: {
      id: 'goal_creative_exhibition_bold',
      text: 'Deneysel seriyle fark yarat',
      effect: { charisma: 6, intelligence: 2, discipline: -1, energy: -7 },
      stressEffect: 9,
      feedback: 'Dikkat cekici bir dil yakaladin, riskin de artti.',
    },
  },
  {
    id: 'goal_creative_collective_show',
    text: 'Bir kolektif etkinlikte canli performans ve tasarim sunumu yapacaksin.',
    minAge: 13,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'SOCIAL',
    tags: ['music', 'creative', 'showcase'],
    safeChoice: {
      id: 'goal_creative_collective_safe',
      text: 'Ekiple senkron prova yap',
      effect: { charisma: 4, discipline: 2, familyRelation: 1, energy: -5 },
      stressEffect: 4,
      feedback: 'Sahne uyumu guven verdi.',
    },
    boldChoice: {
      id: 'goal_creative_collective_bold',
      text: 'Tek kisilik vurucu performans dene',
      effect: { charisma: 7, intelligence: 1, energy: -8 },
      stressEffect: 9,
      feedback: 'Performansin akilda kaldi, baski da yukseldi.',
    },
  },
  {
    id: 'goal_creative_public_release',
    text: 'Portfolyonu acik platformda yayinlama sansin var. Gelen geri bildirim sert olabilir.',
    minAge: 14,
    rarity: 'RARE',
    difficulty: 4,
    personalityCategory: 'RISK',
    tags: ['portfolio', 'creative', 'publish'],
    safeChoice: {
      id: 'goal_creative_release_safe',
      text: 'Sinirli kitle ile pilot yayin yap',
      effect: { charisma: 4, intelligence: 2, discipline: 2, energy: -5 },
      stressEffect: 4,
      feedback: 'Kontrollu geri bildirimle urununu iyilestirdin.',
    },
    boldChoice: {
      id: 'goal_creative_release_bold',
      text: 'Tam olcekli yayinla ve ses getir',
      effect: { charisma: 7, money: 80, discipline: 1, energy: -8 },
      stressEffect: 10,
      feedback: 'Buyuk etki yarattin; tempo cok yuksekti.',
    },
  },
];

const WEALTH_EVENTS: GoalEventTemplate[] = [
  {
    id: 'goal_wealth_market_simulation',
    text: 'Yerel bir girisim kulubu pazar simulasyonu aciyor. Dogru urun secimi kazanci belirleyecek.',
    minAge: 13,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'GROWTH',
    tags: ['business', 'market', 'money'],
    safeChoice: {
      id: 'goal_wealth_market_safe',
      text: 'Dusuk riskli urunle basla',
      effect: { money: 80, intelligence: 2, discipline: 2, energy: -4 },
      stressEffect: 3,
      feedback: 'Kar marji dusuk ama istikrarli bir sonuc aldin.',
    },
    boldChoice: {
      id: 'goal_wealth_market_bold',
      text: 'Yuksek marjli nise urune gir',
      effect: { money: 130, intelligence: 2, charisma: 1, energy: -6 },
      stressEffect: 8,
      feedback: 'Riskli hamle kazandirdi, dalgalanma da yasandi.',
    },
  },
  {
    id: 'goal_wealth_pitch_day',
    text: 'Mini is plani pitch gunu geldi. Sunum kalitesi baglanti kurmanin anahtari olacak.',
    minAge: 14,
    rarity: 'UNCOMMON',
    difficulty: 4,
    personalityCategory: 'CONFLICT',
    tags: ['startup', 'pitch', 'networking'],
    safeChoice: {
      id: 'goal_wealth_pitch_safe',
      text: 'Maliyet-disiplin odakli anlat',
      effect: { money: 90, discipline: 3, charisma: 1, energy: -5 },
      stressEffect: 4,
      feedback: 'Guvenli bir profil cizdin ve destek topladin.',
    },
    boldChoice: {
      id: 'goal_wealth_pitch_bold',
      text: 'Agresif buyume vadiyle cik',
      effect: { money: 160, charisma: 3, discipline: 1, energy: -7 },
      stressEffect: 10,
      feedback: 'Dikkat cektin, beklentiyi de buyuttun.',
    },
  },
  {
    id: 'goal_wealth_investor_round',
    text: 'Kucuk yatirimci grubuyla birebir gorusme firsati dogdu. Rakamlarin net olmali.',
    minAge: 15,
    rarity: 'RARE',
    difficulty: 4,
    personalityCategory: 'RISK',
    tags: ['finance', 'investor', 'business'],
    safeChoice: {
      id: 'goal_wealth_investor_safe',
      text: 'Adim adim buyume modeli sun',
      effect: { money: 110, intelligence: 2, discipline: 3, energy: -6 },
      stressEffect: 4,
      feedback: 'Guvenilir bir modelle uzun vadeli destek buldun.',
    },
    boldChoice: {
      id: 'goal_wealth_investor_bold',
      text: 'Yuksek carpanli planla pazarlik et',
      effect: { money: 210, charisma: 2, discipline: 1, familyRelation: -1, energy: -8 },
      stressEffect: 10,
      feedback: 'Buyuk bir kazanc ihtimali yakaladin, riskin de buyudu.',
    },
  },
];

const SOCIAL_EVENTS: GoalEventTemplate[] = [
  {
    id: 'goal_social_council_election',
    text: 'Ogrenci konseyi secimi yaklasti. Programini insanlara anlatman gerekiyor.',
    minAge: 12,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'SOCIAL',
    tags: ['social', 'group', 'topluluk'],
    safeChoice: {
      id: 'goal_social_election_safe',
      text: 'Ortak fayda odakli konus',
      effect: { charisma: 4, familyRelation: 2, discipline: 1, energy: -4 },
      stressEffect: 3,
      feedback: 'Dengeli mesajin guven olusturdu.',
    },
    boldChoice: {
      id: 'goal_social_election_bold',
      text: 'Yuksek etkili vaatlerle cik',
      effect: { charisma: 6, familyRelation: 1, discipline: -1, energy: -6 },
      stressEffect: 8,
      feedback: 'Gorunurlugun artti ama beklenti baskisi dogdu.',
    },
  },
  {
    id: 'goal_social_volunteer_coordination',
    text: 'Mahalle gonulluluk gunu icin ekip koordinasyonu istendi. Kaynaklar sinirli.',
    minAge: 13,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'GROWTH',
    tags: ['social', 'volunteer', 'community'],
    safeChoice: {
      id: 'goal_social_volunteer_safe',
      text: 'Kucuk ama surdurulebilir plan yap',
      effect: { familyRelation: 4, charisma: 2, discipline: 2, energy: -5 },
      stressEffect: 3,
      feedback: 'Ekibin dagilmadan isi tamamladi.',
    },
    boldChoice: {
      id: 'goal_social_volunteer_bold',
      text: 'Buyuk ekip ve buyuk hedefle ilerle',
      effect: { familyRelation: 5, charisma: 4, money: -40, energy: -7 },
      stressEffect: 9,
      feedback: 'Etki alani genisledi, organizasyon yuku artti.',
    },
  },
  {
    id: 'goal_social_mentorship_network',
    text: 'Akran mentorlugu aginda lider rol teklif edildi. Sureklilik ve empati kritik olacak.',
    minAge: 14,
    rarity: 'RARE',
    difficulty: 4,
    personalityCategory: 'SOCIAL',
    tags: ['mentor', 'relationship', 'social'],
    safeChoice: {
      id: 'goal_social_mentor_safe',
      text: 'Kademeli mentorluk modeli kur',
      effect: { charisma: 4, familyRelation: 4, intelligence: 1, energy: -5 },
      stressEffect: 4,
      feedback: 'Guvenli bir ritimle kalici etki olusturdun.',
    },
    boldChoice: {
      id: 'goal_social_mentor_bold',
      text: 'Kapsami hizla buyut',
      effect: { charisma: 7, familyRelation: 3, discipline: 1, energy: -8 },
      stressEffect: 10,
      feedback: 'Ag hizla buyudu; tempo yonetimi zorlasti.',
    },
  },
];

export const GOAL_SPECIFIC_EVENTS: GameEvent[] = [
  ...ACADEMIC_EVENTS.map(event => buildGoalEvent('ACADEMIC', event)),
  ...ATHLETIC_EVENTS.map(event => buildGoalEvent('ATHLETIC', event)),
  ...CREATIVE_EVENTS.map(event => buildGoalEvent('CREATIVE', event)),
  ...WEALTH_EVENTS.map(event => buildGoalEvent('WEALTH', event)),
  ...SOCIAL_EVENTS.map(event => buildGoalEvent('SOCIAL', event)),
];
