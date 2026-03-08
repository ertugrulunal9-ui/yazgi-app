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
    text: 'Mentorun sana bir araştırma dosyası teslim tarihi verdi. Planını netleştirmen gerekiyor.',
    minAge: 12,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'GROWTH',
    tags: ['study', 'science', 'research'],
    safeChoice: {
      id: 'goal_academic_research_safe',
      text: 'Planlı çalışma takvimi kur',
      effect: { intelligence: 4, discipline: 3, energy: -5 },
      stressEffect: 2,
      feedback: 'Programlı ilerledin ve temelin sağlamlaştı.',
    },
    boldChoice: {
      id: 'goal_academic_research_bold',
      text: 'Kısa sürede zor deneye gir',
      effect: { intelligence: 6, discipline: 1, health: -1, energy: -7 },
      stressEffect: 8,
      feedback: 'Yüksek tempoda ilerledin; hızlandın ama yoruldun.',
    },
  },
  {
    id: 'goal_academic_science_fair_stage',
    text: 'Okul bilim fuarı için proje seçmeleri başladı. Jüri karşısına çıkacaksın.',
    minAge: 13,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'CONFLICT',
    tags: ['science', 'school', 'competition'],
    safeChoice: {
      id: 'goal_academic_fair_safe',
      text: 'Temel ama güvenli proje sun',
      effect: { intelligence: 5, discipline: 2, charisma: 1, energy: -5 },
      stressEffect: 3,
      feedback: 'Temiz bir sunum yaptın ve güven kazandın.',
    },
    boldChoice: {
      id: 'goal_academic_fair_bold',
      text: 'Riskli prototip ile çık',
      effect: { intelligence: 7, charisma: 1, discipline: 1, energy: -8 },
      stressEffect: 9,
      feedback: 'Prototipin dikkat çekti ama baskı seviyesi yükseldi.',
    },
  },
  {
    id: 'goal_academic_olympiad_selection',
    text: 'Akademik olimpiyat seçmeleri açıldı. Son tur soruları normal sınavın çok üstünde.',
    minAge: 14,
    rarity: 'RARE',
    difficulty: 4,
    personalityCategory: 'RISK',
    tags: ['olympiad', 'exam', 'study'],
    safeChoice: {
      id: 'goal_academic_olympiad_safe',
      text: 'Seçici soru setine adım adım hazırlan',
      effect: { intelligence: 5, discipline: 3, energy: -6 },
      stressEffect: 4,
      feedback: 'Temponu korudun ve hata payını azalttın.',
    },
    boldChoice: {
      id: 'goal_academic_olympiad_bold',
      text: 'Zor sorulara direkt dal',
      effect: { intelligence: 8, discipline: 1, health: -2, energy: -9 },
      stressEffect: 10,
      feedback: 'Sert bir çıkış yaptın; büyük gelişim ama yüksek yorgunluk.',
    },
  },
];

const ATHLETIC_EVENTS: GoalEventTemplate[] = [
  {
    id: 'goal_athletic_camp_invite',
    text: 'Bölgesel antrenman kampına davet edildin. Program kondisyonunu ciddi şekilde zorlayacak.',
    minAge: 12,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'GROWTH',
    tags: ['training', 'athletic', 'sport'],
    safeChoice: {
      id: 'goal_athletic_camp_safe',
      text: 'Planlı yüklenme uygula',
      effect: { health: 5, discipline: 3, energy: -6 },
      stressEffect: 3,
      feedback: 'Temiz bir tempo ile güç topladın.',
    },
    boldChoice: {
      id: 'goal_athletic_camp_bold',
      text: 'Ekstra setlerle kapasiteyi zorla',
      effect: { health: 7, discipline: 2, charisma: 1, energy: -9 },
      stressEffect: 9,
      feedback: 'Kapasiten büyüdü ama yorgunluk birikti.',
    },
  },
  {
    id: 'goal_athletic_tournament_bracket',
    text: 'Turnuva eşleşmeleri açıklandı. Çeyrek finalde favori bir rakiple oynayacaksın.',
    minAge: 13,
    rarity: 'UNCOMMON',
    difficulty: 4,
    personalityCategory: 'CONFLICT',
    tags: ['tournament', 'match', 'training'],
    safeChoice: {
      id: 'goal_athletic_bracket_safe',
      text: 'Rakibe göre taktik hazırla',
      effect: { health: 4, discipline: 3, charisma: 1, energy: -6 },
      stressEffect: 4,
      feedback: 'Okuması güçlü bir maç çıkardın.',
    },
    boldChoice: {
      id: 'goal_athletic_bracket_bold',
      text: 'Yüksek tempo ile baskı kur',
      effect: { health: 6, charisma: 2, discipline: 1, energy: -8 },
      stressEffect: 10,
      feedback: 'Tempoyla oyunu aldın ama bedeni zorladın.',
    },
  },
  {
    id: 'goal_athletic_captain_vote',
    text: 'Takım kaptanlığı oylaması var. Liderlik, performans kadar iletişim de gerektiriyor.',
    minAge: 14,
    rarity: 'RARE',
    difficulty: 4,
    personalityCategory: 'SOCIAL',
    tags: ['team', 'captain', 'sport'],
    safeChoice: {
      id: 'goal_athletic_captain_safe',
      text: 'Takım içi istikrarı öne çıkar',
      effect: { charisma: 3, discipline: 3, familyRelation: 1, energy: -5 },
      stressEffect: 4,
      feedback: 'Takım güvenini kazanarak liderliğe yaklaştın.',
    },
    boldChoice: {
      id: 'goal_athletic_captain_bold',
      text: 'Agresif liderlik çıkışı yap',
      effect: { charisma: 5, health: 3, discipline: 1, energy: -7 },
      stressEffect: 9,
      feedback: 'Görünürlüğün arttı; baskıyı da üstlendin.',
    },
  },
];

const CREATIVE_EVENTS: GoalEventTemplate[] = [
  {
    id: 'goal_creative_exhibition_call',
    text: 'Yerel sergi komitesi portfolyo çağrısı açtı. İşlerini seçip hikâyeni anlatman gerekiyor.',
    minAge: 12,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'GROWTH',
    tags: ['art', 'design', 'sergi'],
    safeChoice: {
      id: 'goal_creative_exhibition_safe',
      text: 'Güvenli ama tutarlı seri hazırla',
      effect: { charisma: 4, intelligence: 2, energy: -5 },
      stressEffect: 3,
      feedback: 'Tutarlılık sergiyi güçlendirdi.',
    },
    boldChoice: {
      id: 'goal_creative_exhibition_bold',
      text: 'Deneysel seriyle fark yarat',
      effect: { charisma: 6, intelligence: 2, discipline: -1, energy: -7 },
      stressEffect: 9,
      feedback: 'Dikkat çekici bir dil yakaladın, riskin de arttı.',
    },
  },
  {
    id: 'goal_creative_collective_show',
    text: 'Bir kolektif etkinlikte canlı performans ve tasarım sunumu yapacaksın.',
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
      feedback: 'Sahne uyumu güven verdi.',
    },
    boldChoice: {
      id: 'goal_creative_collective_bold',
      text: 'Tek kişilik vurucu performans dene',
      effect: { charisma: 7, intelligence: 1, energy: -8 },
      stressEffect: 9,
      feedback: 'Performansın akılda kaldı, baskı da yükseldi.',
    },
  },
  {
    id: 'goal_creative_public_release',
    text: 'Portföyünü açık platformda yayınlama şansın var. Gelen geri bildirim sert olabilir.',
    minAge: 14,
    rarity: 'RARE',
    difficulty: 4,
    personalityCategory: 'RISK',
    tags: ['portfolio', 'creative', 'publish'],
    safeChoice: {
      id: 'goal_creative_release_safe',
      text: 'Sınırlı kitle ile pilot yayın yap',
      effect: { charisma: 4, intelligence: 2, discipline: 2, energy: -5 },
      stressEffect: 4,
      feedback: 'Kontrollü geri bildirimle ürününü iyileştirdin.',
    },
    boldChoice: {
      id: 'goal_creative_release_bold',
      text: 'Tam ölçekli yayınla ve ses getir',
      effect: { charisma: 7, money: 80, discipline: 1, energy: -8 },
      stressEffect: 10,
      feedback: 'Büyük etki yarattın; tempo çok yüksekti.',
    },
  },
];

const WEALTH_EVENTS: GoalEventTemplate[] = [
  {
    id: 'goal_wealth_market_simulation',
    text: 'Yerel bir girişim kulübü pazar simülasyonu açıyor. Doğru ürün seçimi kazancı belirleyecek.',
    minAge: 13,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'GROWTH',
    tags: ['business', 'market', 'money'],
    safeChoice: {
      id: 'goal_wealth_market_safe',
      text: 'Düşük riskli ürünle başla',
      effect: { money: 80, intelligence: 2, discipline: 2, energy: -4 },
      stressEffect: 3,
      feedback: 'Kâr marjı düşük ama istikrarlı bir sonuç aldın.',
    },
    boldChoice: {
      id: 'goal_wealth_market_bold',
      text: 'Yüksek marjlı niş ürüne gir',
      effect: { money: 130, intelligence: 2, charisma: 1, energy: -6 },
      stressEffect: 8,
      feedback: 'Riskli hamle kazandırdı, dalgalanma da yaşandı.',
    },
  },
  {
    id: 'goal_wealth_pitch_day',
    text: 'Mini iş planı pitch günü geldi. Sunum kalitesi bağlantı kurmanın anahtarı olacak.',
    minAge: 14,
    rarity: 'UNCOMMON',
    difficulty: 4,
    personalityCategory: 'CONFLICT',
    tags: ['startup', 'pitch', 'networking'],
    safeChoice: {
      id: 'goal_wealth_pitch_safe',
      text: 'Maliyet-disiplin odaklı anlat',
      effect: { money: 90, discipline: 3, charisma: 1, energy: -5 },
      stressEffect: 4,
      feedback: 'Güvenli bir profil çizdin ve destek topladın.',
    },
    boldChoice: {
      id: 'goal_wealth_pitch_bold',
      text: 'Agresif büyüme vadiyle çık',
      effect: { money: 160, charisma: 3, discipline: 1, energy: -7 },
      stressEffect: 10,
      feedback: 'Dikkat çektin, beklentiyi de büyüttün.',
    },
  },
  {
    id: 'goal_wealth_investor_round',
    text: 'Küçük yatırımcı grubuyla birebir görüşme fırsatı doğdu. Rakamların net olmalı.',
    minAge: 15,
    rarity: 'RARE',
    difficulty: 4,
    personalityCategory: 'RISK',
    tags: ['finance', 'investor', 'business'],
    safeChoice: {
      id: 'goal_wealth_investor_safe',
      text: 'Adım adım büyüme modeli sun',
      effect: { money: 110, intelligence: 2, discipline: 3, energy: -6 },
      stressEffect: 4,
      feedback: 'Güvenilir bir modelle uzun vadeli destek buldun.',
    },
    boldChoice: {
      id: 'goal_wealth_investor_bold',
      text: 'Yüksek çarpanlı planla pazarlık et',
      effect: { money: 210, charisma: 2, discipline: 1, familyRelation: -1, energy: -8 },
      stressEffect: 10,
      feedback: 'Büyük bir kazanç ihtimali yakaladın, riskin de büyüdü.',
    },
  },
];

const SOCIAL_EVENTS: GoalEventTemplate[] = [
  {
    id: 'goal_social_council_election',
    text: 'Öğrenci konseyi seçimi yaklaştı. Programını insanlara anlatman gerekiyor.',
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
      feedback: 'Dengeli mesajın güven oluşturdu.',
    },
    boldChoice: {
      id: 'goal_social_election_bold',
      text: 'Yüksek etkili vaatlerle çık',
      effect: { charisma: 6, familyRelation: 1, discipline: -1, energy: -6 },
      stressEffect: 8,
      feedback: 'Görünürlüğün arttı ama beklenti baskısı doğdu.',
    },
  },
  {
    id: 'goal_social_volunteer_coordination',
    text: 'Mahalle gönüllülük günü için ekip koordinasyonu istendi. Kaynaklar sınırlı.',
    minAge: 13,
    rarity: 'UNCOMMON',
    difficulty: 3,
    personalityCategory: 'GROWTH',
    tags: ['social', 'volunteer', 'community'],
    safeChoice: {
      id: 'goal_social_volunteer_safe',
      text: 'Küçük ama sürdürülebilir plan yap',
      effect: { familyRelation: 4, charisma: 2, discipline: 2, energy: -5 },
      stressEffect: 3,
      feedback: 'Ekibin dağılmadan işi tamamladı.',
    },
    boldChoice: {
      id: 'goal_social_volunteer_bold',
      text: 'Büyük ekip ve büyük hedefle ilerle',
      effect: { familyRelation: 5, charisma: 4, money: -40, energy: -7 },
      stressEffect: 9,
      feedback: 'Etki alanı genişledi, organizasyon yükü arttı.',
    },
  },
  {
    id: 'goal_social_mentorship_network',
    text: 'Akran mentörlüğü ağında lider rol teklif edildi. Süreklilik ve empati kritik olacak.',
    minAge: 14,
    rarity: 'RARE',
    difficulty: 4,
    personalityCategory: 'SOCIAL',
    tags: ['mentor', 'relationship', 'social'],
    safeChoice: {
      id: 'goal_social_mentor_safe',
      text: 'Kademeli mentörlük modeli kur',
      effect: { charisma: 4, familyRelation: 4, intelligence: 1, energy: -5 },
      stressEffect: 4,
      feedback: 'Güvenli bir ritimle kalıcı etki oluşturdun.',
    },
    boldChoice: {
      id: 'goal_social_mentor_bold',
      text: 'Kapsamı hızla büyüt',
      effect: { charisma: 7, familyRelation: 3, discipline: 1, energy: -8 },
      stressEffect: 10,
      feedback: 'Ağ hızla büyüdü; tempo yönetimi zorlaştı.',
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
