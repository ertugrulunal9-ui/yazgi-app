import { EventContext, GameEvent, NPCRole } from '../types';

const pickNpcName = (
  ctx: EventContext,
  role: NPCRole,
  fallback: string
): string => {
  const candidates = (ctx.npcs || []).filter(npc => npc.role === role);
  if (candidates.length === 0) return fallback;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index]?.name || fallback;
};

const createNpcCheckInEvent = (config: {
  id: string;
  role: NPCRole;
  minAge: number;
  maxAge: number;
  personalityCategory: GameEvent['personalityCategory'];
  tags?: string[];
  text: (ctx: EventContext, npcName: string) => string;
  choices: GameEvent['choices'];
}): GameEvent => ({
  id: config.id,
  text: (ctx) => config.text(ctx, pickNpcName(ctx, config.role, 'Arkadasin')),
  choices: config.choices,
  minAge: config.minAge,
  maxAge: config.maxAge,
  reqNPCRole: config.role,
  isRepeatable: true,
  rarity: 'COMMON',
  personalityCategory: config.personalityCategory,
  tags: ['npc_checkin', ...(config.tags || [])],
});

export const NPC_CHECKIN_EVENTS: GameEvent[] = [
  createNpcCheckInEvent({
    id: 'npc_checkin_friend_positive_01',
    role: 'FRIEND',
    minAge: 8,
    maxAge: 18,
    personalityCategory: 'SOCIAL',
    text: (_ctx, npcName) => `${npcName} sana "Aksam parkta yuruyus var, gelir misin?" diye yazdi.`,
    choices: [
      { text: 'Giderim, sohbet ederiz', effect: { charisma: 2 }, feedback: 'Sohbet iyi geldi, baginiz guclendi.', npcRelationChange: 8, stressEffect: -4 },
      { text: 'Kisa cevap yaz, ertele', effect: { discipline: 1 }, feedback: 'Plan ertelendi ama iletisimi koparmadin.', npcRelationChange: 2 },
      { text: 'Mesaji gormezden gel', effect: { discipline: 1 }, feedback: 'Arkadasin kirildi.', npcRelationChange: -7, stressEffect: 3 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_friend_study_02',
    role: 'FRIEND',
    minAge: 9,
    maxAge: 18,
    personalityCategory: 'GROWTH',
    text: (_ctx, npcName) => `${npcName} "Yarin sinav var, beraber tekrar yapalim mi?" diye sordu.`,
    choices: [
      { text: 'Beraber calisalim', effect: { intelligence: 2, discipline: 1 }, feedback: 'Ortak tekrar ikinize de iyi geldi.', npcRelationChange: 6 },
      { text: 'Notlarimi yollarim', effect: { intelligence: 1 }, feedback: 'Destek oldun ama bir araya gelmediniz.', npcRelationChange: 3 },
      { text: 'Vaktim yok de', effect: { discipline: 1 }, feedback: 'Onceligini korudun ama mesafe artti.', npcRelationChange: -5 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_friend_problem_03',
    role: 'FRIEND',
    minAge: 10,
    maxAge: 18,
    personalityCategory: 'MORAL',
    text: (_ctx, npcName) => `${npcName} "Bugun moralim cok bozuk" diye yazdi.`,
    choices: [
      { text: 'Dinlemeyi teklif et', effect: { charisma: 2, familyRelation: 1 }, feedback: 'Dinledin, guven artti.', npcRelationChange: 9, stressEffect: -3 },
      { text: 'Kisa bir moral mesaji gonder', effect: { charisma: 1 }, feedback: 'Yine de destek oldun.', npcRelationChange: 4 },
      { text: 'Konuyu degistir', effect: {}, feedback: 'Duygularini ciddiye almadigini dusundu.', npcRelationChange: -8, stressEffect: 4 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_friend_game_04',
    role: 'FRIEND',
    minAge: 8,
    maxAge: 18,
    personalityCategory: 'SOCIAL',
    text: (_ctx, npcName) => `${npcName} sana online oyuna davet atti.`,
    choices: [
      { text: 'Birlikte oynayalim', effect: { energy: -4, charisma: 1 }, feedback: 'Eglenceli bir aksam oldu.', npcRelationChange: 7, stressEffect: -2 },
      { text: 'Yarim saat girerim', effect: { energy: -2 }, feedback: 'Dengeyi korudun.', npcRelationChange: 3 },
      { text: 'Bugun olmaz de', effect: { discipline: 2 }, feedback: 'Programini bozmadin ama biraz soguk kaldi.', npcRelationChange: -4 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_friend_conflict_05',
    role: 'FRIEND',
    minAge: 11,
    maxAge: 18,
    personalityCategory: 'CONFLICT',
    text: (_ctx, npcName) => `${npcName} dedikodular yuzunden sana kirgin oldugunu yazdi.`,
    choices: [
      { text: 'Acilik getirip konusalim', effect: { charisma: 2 }, feedback: 'Acik konusma havayi yumusatti.', npcRelationChange: 10, stressEffect: -5 },
      { text: 'Sakinlesince konusalim', effect: { discipline: 1 }, feedback: 'Acele etmedin, gerginlik biraz azaldi.', npcRelationChange: 2 },
      { text: 'Savunmaya gec', effect: {}, feedback: 'Tartisma buyudu.', npcRelationChange: -10, stressEffect: 6 },
    ],
  }),

  createNpcCheckInEvent({
    id: 'npc_checkin_bestfriend_late_01',
    role: 'BEST_FRIEND',
    minAge: 10,
    maxAge: 18,
    personalityCategory: 'SOCIAL',
    text: (_ctx, npcName) => `${npcName} "Uzun zamandir oturup dertlesemedik" diye yazdi.`,
    choices: [
      { text: 'Bu aksam goruselim', effect: { charisma: 2, familyRelation: 1 }, feedback: 'Yakinlik hissi geri geldi.', npcRelationChange: 10, stressEffect: -5 },
      { text: 'Hafta sonu planlayalim', effect: { discipline: 1 }, feedback: 'Niyetin iyi bulundu.', npcRelationChange: 4 },
      { text: 'Musait degilim de', effect: {}, feedback: 'En iyi arkadasin kendini geri planda hissetti.', npcRelationChange: -8 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_bestfriend_crisis_02',
    role: 'BEST_FRIEND',
    minAge: 11,
    maxAge: 18,
    personalityCategory: 'MORAL',
    text: (_ctx, npcName) => `${npcName} "Sana ihtiyacim var" diye acil mesaj atti.`,
    choices: [
      { text: 'Hemen ara', effect: { charisma: 2 }, feedback: 'Yaninda oldugunu hissettirdin.', npcRelationChange: 12, stressEffect: -4 },
      { text: 'Mesajla destek ol', effect: { charisma: 1 }, feedback: 'Uzak da olsan destek oldun.', npcRelationChange: 5 },
      { text: 'Sonra donerim de', effect: { discipline: 1 }, feedback: 'Gec kaldigin icin guven sarsildi.', npcRelationChange: -9, stressEffect: 5 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_bestfriend_memory_03',
    role: 'BEST_FRIEND',
    minAge: 12,
    maxAge: 18,
    personalityCategory: 'GROWTH',
    text: (_ctx, npcName) => `${npcName} eski bir ani fotografi atip "Tekrar boyle bir gun yapalim" dedi.`,
    choices: [
      { text: 'Hemen tarih belirle', effect: { charisma: 2 }, feedback: 'Plan netlestikce heyecan artti.', npcRelationChange: 9, stressEffect: -3 },
      { text: 'Fikir guzel, bakariz', effect: {}, feedback: 'Niyet var ama belirsizlik de var.', npcRelationChange: 2 },
      { text: 'Simdilik istemiyorum de', effect: { discipline: 1 }, feedback: 'Aranizda soguk bir hava olustu.', npcRelationChange: -7 },
    ],
  }),

  createNpcCheckInEvent({
    id: 'npc_checkin_crush_invite_01',
    role: 'CRUSH',
    minAge: 11,
    maxAge: 18,
    personalityCategory: 'SOCIAL',
    text: (_ctx, npcName) => `${npcName} "Hafta sonu bir kahve?" diye cekingen bir mesaj atti.`,
    choices: [
      { text: 'Evet, bulusalim', effect: { charisma: 3 }, feedback: 'Samimi bir bulusma oldu.', npcRelationChange: 10, stressEffect: -3 },
      { text: 'Arkadaslarla olursa olur', effect: { charisma: 1 }, feedback: 'Guvenli bir cevap verdin.', npcRelationChange: 3 },
      { text: 'Kibarca reddet', effect: {}, feedback: 'Aradaki heyecan azaldi.', npcRelationChange: -6 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_crush_signal_02',
    role: 'CRUSH',
    minAge: 12,
    maxAge: 18,
    personalityCategory: 'RISK',
    text: (_ctx, npcName) => `${npcName} attigin hikayeye kalp birakti ve sohbet baslatmak istedi.`,
    choices: [
      { text: 'Sohbeti surdur', effect: { charisma: 2 }, feedback: 'Iletisim dogal akti.', npcRelationChange: 8 },
      { text: 'Kisa cevap ver', effect: {}, feedback: 'Temkinli kaldin.', npcRelationChange: 2 },
      { text: 'Gormezden gel', effect: {}, feedback: 'Sinyal cevapsiz kaldi.', npcRelationChange: -7 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_crush_mixed_03',
    role: 'CRUSH',
    minAge: 12,
    maxAge: 18,
    personalityCategory: 'CONFLICT',
    text: (_ctx, npcName) => `${npcName} senin hakkinda yanlis bir sey duydugunu yazdi.`,
    choices: [
      { text: 'Sakin acikla', effect: { charisma: 2, discipline: 1 }, feedback: 'Durumu netlestirdin.', npcRelationChange: 9, stressEffect: -2 },
      { text: 'Saka ile gecistir', effect: { charisma: 1 }, feedback: 'Konu dagildi ama tam kapanmadi.', npcRelationChange: 1 },
      { text: 'Sinirli cevap ver', effect: {}, feedback: 'Yanlis anlasilma buyudu.', npcRelationChange: -9, stressEffect: 5 },
    ],
  }),

  createNpcCheckInEvent({
    id: 'npc_checkin_partner_support_01',
    role: 'PARTNER',
    minAge: 13,
    maxAge: 18,
    personalityCategory: 'MORAL',
    text: (_ctx, npcName) => `${npcName} bugunun zor gectigini soyleyip seninle konusmak istedi.`,
    choices: [
      { text: 'Tum dikkatimi veririm', effect: { familyRelation: 2, charisma: 2 }, feedback: 'Destegin iliskiye iyi geldi.', npcRelationChange: 10, stressEffect: -5 },
      { text: 'Kisa konusalim', effect: { discipline: 1 }, feedback: 'Iletisim surdu ama yetersiz kaldi.', npcRelationChange: 2 },
      { text: 'Bugun degil de', effect: {}, feedback: 'Kendini yalniz hissetti.', npcRelationChange: -8, stressEffect: 4 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_partner_plan_02',
    role: 'PARTNER',
    minAge: 13,
    maxAge: 18,
    personalityCategory: 'SOCIAL',
    text: (_ctx, npcName) => `${npcName} birlikte gelecek planlari hakkinda konusmak istiyor.`,
    choices: [
      { text: 'Net bir plan yapalim', effect: { discipline: 2, charisma: 1 }, feedback: 'Birlikte yol cizmek guven verdi.', npcRelationChange: 9 },
      { text: 'Kisa bir plan yap', effect: { discipline: 1 }, feedback: 'Kismen netlestiniz.', npcRelationChange: 3 },
      { text: 'Konuyu ertele', effect: {}, feedback: 'Belirsizlik iliskiyi gerdi.', npcRelationChange: -7, stressEffect: 3 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_partner_argument_03',
    role: 'PARTNER',
    minAge: 14,
    maxAge: 18,
    personalityCategory: 'CONFLICT',
    text: (_ctx, npcName) => `${npcName} son tartismayi kapatmak icin mesaj atti.`,
    choices: [
      { text: 'Ortak nokta bul', effect: { charisma: 2 }, feedback: 'Tonusudu ve toparlandiniz.', npcRelationChange: 11, stressEffect: -6 },
      { text: 'Sakin kal ama mesafeli ol', effect: { discipline: 1 }, feedback: 'Gerilim azaldi ama tam bitmedi.', npcRelationChange: 2 },
      { text: 'Eski konuyu tekrar ac', effect: {}, feedback: 'Tartisma yeniden alevlendi.', npcRelationChange: -10, stressEffect: 7 },
    ],
  }),

  createNpcCheckInEvent({
    id: 'npc_checkin_rival_challenge_01',
    role: 'RIVAL',
    minAge: 10,
    maxAge: 18,
    personalityCategory: 'CONFLICT',
    text: (_ctx, npcName) => `${npcName} "Bir sonraki denemede seni gececegim" diye mesaj atti.`,
    choices: [
      { text: 'Meydan okumayi kabul et', effect: { discipline: 2 }, feedback: 'Rekabet seni motive etti.', npcRelationChange: 1 },
      { text: 'Saygili cevap ver', effect: { charisma: 1 }, feedback: 'Gerilimi kontrollu tuttun.', npcRelationChange: 3 },
      { text: 'Asagilayici cevap ver', effect: {}, feedback: 'Rekabet dusmanliga kaydi.', npcRelationChange: -8, stressEffect: 4 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_rival_result_02',
    role: 'RIVAL',
    minAge: 11,
    maxAge: 18,
    personalityCategory: 'RISK',
    text: (_ctx, npcName) => `${npcName} son sonuclari paylasip seni etiketledi.`,
    choices: [
      { text: 'Kendi sonucunu sakin paylas', effect: { discipline: 1 }, feedback: 'Sakin tavrin etkili oldu.', npcRelationChange: 2 },
      { text: 'Tatli bir rekabet mesaji at', effect: { charisma: 1 }, feedback: 'Rekabet dozunda kaldi.', npcRelationChange: 4 },
      { text: 'Sert cikis yap', effect: {}, feedback: 'Sosyal gerilim artti.', npcRelationChange: -7, stressEffect: 5 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_rival_teamup_03',
    role: 'RIVAL',
    minAge: 12,
    maxAge: 18,
    personalityCategory: 'MORAL',
    text: (_ctx, npcName) => `${npcName} ortak bir proje icin gecici isbirligi teklif etti.`,
    choices: [
      { text: 'Isbirligini kabul et', effect: { intelligence: 1, charisma: 1 }, feedback: 'Rekabetten ogrenmeye gectiniz.', npcRelationChange: 5 },
      { text: 'Sinirli destek ver', effect: { discipline: 1 }, feedback: 'Iliski notr kaldI.', npcRelationChange: 1 },
      { text: 'Reddet', effect: {}, feedback: 'Kopruler biraz daha yandi.', npcRelationChange: -6 },
    ],
  }),

  createNpcCheckInEvent({
    id: 'npc_checkin_enemy_taunt_01',
    role: 'ENEMY',
    minAge: 10,
    maxAge: 18,
    personalityCategory: 'CONFLICT',
    text: (_ctx, npcName) => `${npcName} alayci bir mesajla seni provoke etmeye calisti.`,
    choices: [
      { text: 'Sakin kal, cevap verme', effect: { discipline: 2 }, feedback: 'Provokasyona dusmedin.', npcRelationChange: 0, stressEffect: -2 },
      { text: 'Kisa ve net cevap ver', effect: { charisma: 1 }, feedback: 'Sinir cizdin.', npcRelationChange: -1 },
      { text: 'Ayni sertlikte cevap ver', effect: {}, feedback: 'Gerilim buyudu.', npcRelationChange: -6, stressEffect: 6 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_enemy_rumor_02',
    role: 'ENEMY',
    minAge: 11,
    maxAge: 18,
    personalityCategory: 'MORAL',
    text: (_ctx, npcName) => `${npcName} senin hakkinda yeni bir soylenti yayildigini yazdi.`,
    choices: [
      { text: 'Kanit toplayip sakin cevap ver', effect: { intelligence: 1, discipline: 1 }, feedback: 'Durumu akilla yonettin.', npcRelationChange: 1 },
      { text: 'Destek iste', effect: { charisma: 1 }, feedback: 'Yalniz kalmadin.', npcRelationChange: 0 },
      { text: 'Aninda patla', effect: {}, feedback: 'Duygusal tepki durumu zorlastirdi.', npcRelationChange: -5, stressEffect: 5 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_enemy_boundary_03',
    role: 'ENEMY',
    minAge: 12,
    maxAge: 18,
    personalityCategory: 'GROWTH',
    text: (_ctx, npcName) => `${npcName} beklenmedik sekilde "Bu isi kapatalim mi?" diye yazdi.`,
    choices: [
      { text: 'Sinirli bir baris denemesi yap', effect: { discipline: 1, charisma: 1 }, feedback: 'Gerilim biraz azaldi.', npcRelationChange: 4, stressEffect: -3 },
      { text: 'Mesafeli notr kal', effect: {}, feedback: 'Sorun donduruldu, cozulmedi.', npcRelationChange: 1 },
      { text: 'Kesin reddet', effect: {}, feedback: 'Dusmanlik aynen surdu.', npcRelationChange: -4, stressEffect: 2 },
    ],
  }),
];
