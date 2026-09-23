import type { EventContext, GameEvent, NPCRole } from '../types';

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
  text: (ctx) => config.text(ctx, pickNpcName(ctx, config.role, 'Arkadaşın')),
  choices: config.choices,
  minAge: config.minAge,
  maxAge: config.maxAge,
  reqNPCRole: config.role,
  isRepeatable: true,
  rarity: 'COMMON',
  personalityCategory: config.personalityCategory,
  tags: [
    'npc_checkin',
    `npc_role_${config.role.toLowerCase()}`,
    `tone_${String(config.personalityCategory || 'general').toLowerCase()}`,
    ...(config.tags || []),
  ],
});

export const NPC_CHECKIN_EVENTS: GameEvent[] = [
  createNpcCheckInEvent({
    id: 'npc_checkin_friend_positive_01',
    role: 'FRIEND',
    minAge: 8,
    maxAge: 18,
    personalityCategory: 'SOCIAL',
    text: (_ctx, npcName) => `${npcName} sana "Akşam parkta yürüyüş var, gelir misin?" diye yazdı.`,
    choices: [
      { text: 'Giderim, sohbet ederiz', effect: { charisma: 2 }, feedback: 'Sohbet iyi geldi, bağınız güçlendi.', npcRelationChange: 8, stressEffect: -4 },
      { text: 'Kısa cevap yaz, ertele', effect: { discipline: 1 }, feedback: 'Plan ertelendi ama iletişimi koparmadın.', npcRelationChange: 2 },
      { text: 'Mesajı görmezden gel', effect: { discipline: 1 }, feedback: 'Arkadaşın kırıldı.', npcRelationChange: -7, stressEffect: 3 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_friend_study_02',
    role: 'FRIEND',
    minAge: 9,
    maxAge: 18,
    personalityCategory: 'GROWTH',
    text: (_ctx, npcName) => `${npcName} "Yarın sınav var, beraber tekrar yapalım mı?" diye sordu.`,
    choices: [
      { text: 'Beraber çalışalım', effect: { intelligence: 2, discipline: 1 }, feedback: 'Ortak tekrar ikinize de iyi geldi.', npcRelationChange: 6 },
      { text: 'Notlarımı yollarım', effect: { intelligence: 1 }, feedback: 'Destek oldun ama bir araya gelmediniz.', npcRelationChange: 3 },
      { text: 'Vaktim yok de', effect: { discipline: 1 }, feedback: 'Önceliğini korudun ama mesafe arttı.', npcRelationChange: -5 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_friend_problem_03',
    role: 'FRIEND',
    minAge: 10,
    maxAge: 18,
    personalityCategory: 'MORAL',
    text: (_ctx, npcName) => `${npcName} "Bugün moralim çok bozuk" diye yazdı.`,
    choices: [
      { text: 'Dinlemeyi teklif et', effect: { charisma: 2, familyRelation: 1 }, feedback: 'Dinledin, güven arttı.', npcRelationChange: 9, stressEffect: -3 },
      { text: 'Kısa bir moral mesajı gönder', effect: { charisma: 1 }, feedback: 'Yine de destek oldun.', npcRelationChange: 4 },
      { text: 'Konuyu değiştir', effect: {}, feedback: 'Duygularını ciddiye almadığını düşündü.', npcRelationChange: -8, stressEffect: 4 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_friend_game_04',
    role: 'FRIEND',
    minAge: 8,
    maxAge: 18,
    personalityCategory: 'SOCIAL',
    text: (_ctx, npcName) => `${npcName} sana online oyuna davet attı.`,
    choices: [
      { text: 'Birlikte oynayalım', effect: { energy: -4, charisma: 1 }, feedback: 'Eğlenceli bir akşam oldu.', npcRelationChange: 7, stressEffect: -2 },
      { text: 'Yarım saat girerim', effect: { energy: -2 }, feedback: 'Dengeyi korudun.', npcRelationChange: 3 },
      { text: 'Bugün olmaz de', effect: { discipline: 2 }, feedback: 'Programını bozmadın ama biraz soğuk kaldı.', npcRelationChange: -4 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_friend_conflict_05',
    role: 'FRIEND',
    minAge: 11,
    maxAge: 18,
    personalityCategory: 'CONFLICT',
    text: (_ctx, npcName) => `${npcName} dedikodular yüzünden sana kırgın olduğunu yazdı.`,
    choices: [
      { text: 'Açıklık getirip konuşalım', effect: { charisma: 2 }, feedback: 'Açık konuşma havayı yumuşattı.', npcRelationChange: 10, stressEffect: -5 },
      { text: 'Sakinleşince konuşalım', effect: { discipline: 1 }, feedback: 'Acele etmedin, gerginlik biraz azaldı.', npcRelationChange: 2 },
      { text: 'Savunmaya geç', effect: {}, feedback: 'Tartışma büyüdü.', npcRelationChange: -10, stressEffect: 6 },
    ],
  }),

  createNpcCheckInEvent({
    id: 'npc_checkin_bestfriend_late_01',
    role: 'BEST_FRIEND',
    minAge: 10,
    maxAge: 18,
    personalityCategory: 'SOCIAL',
    text: (_ctx, npcName) => `${npcName} "Uzun zamandır oturup dertleşemedik" diye yazdı.`,
    choices: [
      { text: 'Bu akşam görüşelim', effect: { charisma: 2, familyRelation: 1 }, feedback: 'Yakınlık hissi geri geldi.', npcRelationChange: 10, stressEffect: -5 },
      { text: 'Hafta sonu planlayalım', effect: { discipline: 1 }, feedback: 'Niyetin iyi bulundu.', npcRelationChange: 4 },
      { text: 'Müsait değilim de', effect: {}, feedback: 'En iyi arkadaşın kendini geri planda hissetti.', npcRelationChange: -8 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_bestfriend_crisis_02',
    role: 'BEST_FRIEND',
    minAge: 11,
    maxAge: 18,
    personalityCategory: 'MORAL',
    text: (_ctx, npcName) => `${npcName} "Sana ihtiyacım var" diye acil mesaj attı.`,
    choices: [
      { text: 'Hemen ara', effect: { charisma: 2 }, feedback: 'Yanında olduğunu hissettirdin.', npcRelationChange: 12, stressEffect: -4 },
      { text: 'Mesajla destek ol', effect: { charisma: 1 }, feedback: 'Uzak da olsan destek oldun.', npcRelationChange: 5 },
      { text: 'Sonra dönerim de', effect: { discipline: 1 }, feedback: 'Geç kaldığın için güven sarsıldı.', npcRelationChange: -9, stressEffect: 5 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_bestfriend_memory_03',
    role: 'BEST_FRIEND',
    minAge: 12,
    maxAge: 18,
    personalityCategory: 'GROWTH',
    text: (_ctx, npcName) => `${npcName} eski bir anı fotoğrafı atıp "Tekrar böyle bir gün yapalım" dedi.`,
    choices: [
      { text: 'Hemen tarih belirle', effect: { charisma: 2 }, feedback: 'Plan netleştikçe heyecan arttı.', npcRelationChange: 9, stressEffect: -3 },
      { text: 'Fikir güzel, bakarız', effect: {}, feedback: 'Niyet var ama belirsizlik de var.', npcRelationChange: 2 },
      { text: 'Şimdilik istemiyorum de', effect: { discipline: 1 }, feedback: 'Aranızda soğuk bir hava oluştu.', npcRelationChange: -7 },
    ],
  }),

  createNpcCheckInEvent({
    id: 'npc_checkin_crush_invite_01',
    role: 'CRUSH',
    minAge: 11,
    maxAge: 18,
    personalityCategory: 'SOCIAL',
    text: (_ctx, npcName) => `${npcName} "Hafta sonu bir kahve?" diye çekingen bir mesaj attı.`,
    choices: [
      { text: 'Evet, buluşalım', effect: { charisma: 3 }, feedback: 'Samimi bir buluşma oldu.', npcRelationChange: 10, stressEffect: -3 },
      { text: 'Arkadaşlarla olursa olur', effect: { charisma: 1 }, feedback: 'Güvenli bir cevap verdin.', npcRelationChange: 3 },
      { text: 'Kibarca reddet', effect: {}, feedback: 'Aradaki heyecan azaldı.', npcRelationChange: -6 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_crush_signal_02',
    role: 'CRUSH',
    minAge: 12,
    maxAge: 18,
    personalityCategory: 'RISK',
    text: (_ctx, npcName) => `${npcName} attığın hikayeye kalp bıraktı ve sohbet başlatmak istedi.`,
    choices: [
      { text: 'Sohbeti sürdür', effect: { charisma: 2 }, feedback: 'İletişim doğal aktı.', npcRelationChange: 8 },
      { text: 'Kısa cevap ver', effect: {}, feedback: 'Temkinli kaldın.', npcRelationChange: 2 },
      { text: 'Görmezden gel', effect: {}, feedback: 'Sinyal cevapsız kaldı.', npcRelationChange: -7 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_crush_mixed_03',
    role: 'CRUSH',
    minAge: 12,
    maxAge: 18,
    personalityCategory: 'CONFLICT',
    text: (_ctx, npcName) => `${npcName} senin hakkında yanlış bir şey duyduğunu yazdı.`,
    choices: [
      { text: 'Sakin açıkla', effect: { charisma: 2, discipline: 1 }, feedback: 'Durumu netleştirdin.', npcRelationChange: 9, stressEffect: -2 },
      { text: 'Şaka ile geçiştir', effect: { charisma: 1 }, feedback: 'Konu dağıldı ama tam kapanmadı.', npcRelationChange: 1 },
      { text: 'Sinirli cevap ver', effect: {}, feedback: 'Yanlış anlaşılma büyüdü.', npcRelationChange: -9, stressEffect: 5 },
    ],
  }),

  createNpcCheckInEvent({
    id: 'npc_checkin_partner_support_01',
    role: 'PARTNER',
    minAge: 13,
    maxAge: 18,
    personalityCategory: 'MORAL',
    text: (_ctx, npcName) => `${npcName} bugünün zor geçtiğini söyleyip seninle konuşmak istedi.`,
    choices: [
      { text: 'Tüm dikkatimi veririm', effect: { familyRelation: 2, charisma: 2 }, feedback: 'Desteğin ilişkiye iyi geldi.', npcRelationChange: 10, stressEffect: -5 },
      { text: 'Kısa konuşalım', effect: { discipline: 1 }, feedback: 'İletişim sürdü ama yetersiz kaldı.', npcRelationChange: 2 },
      { text: 'Bugün değil de', effect: {}, feedback: 'Kendini yalnız hissetti.', npcRelationChange: -8, stressEffect: 4 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_partner_plan_02',
    role: 'PARTNER',
    minAge: 13,
    maxAge: 18,
    personalityCategory: 'SOCIAL',
    text: (_ctx, npcName) => `${npcName} birlikte gelecek planları hakkında konuşmak istiyor.`,
    choices: [
      { text: 'Net bir plan yapalım', effect: { discipline: 2, charisma: 1 }, feedback: 'Birlikte yol çizmek güven verdi.', npcRelationChange: 9 },
      { text: 'Kısa bir plan yap', effect: { discipline: 1 }, feedback: 'Kısmen netleştiniz.', npcRelationChange: 3 },
      { text: 'Konuyu ertele', effect: {}, feedback: 'Belirsizlik ilişkiyi gerdi.', npcRelationChange: -7, stressEffect: 3 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_partner_argument_03',
    role: 'PARTNER',
    minAge: 14,
    maxAge: 18,
    personalityCategory: 'CONFLICT',
    text: (_ctx, npcName) => `${npcName} son tartışmayı kapatmak için mesaj attı.`,
    choices: [
      { text: 'Ortak nokta bul', effect: { charisma: 2 }, feedback: 'Tonuşdu ve toparlandınız.', npcRelationChange: 11, stressEffect: -6 },
      { text: 'Sakin kal ama mesafeli ol', effect: { discipline: 1 }, feedback: 'Gerilim azaldı ama tam bitmedi.', npcRelationChange: 2 },
      { text: 'Eski konuyu tekrar aç', effect: {}, feedback: 'Tartışma yeniden alevlendi.', npcRelationChange: -10, stressEffect: 7 },
    ],
  }),

  createNpcCheckInEvent({
    id: 'npc_checkin_rival_challenge_01',
    role: 'RIVAL',
    minAge: 10,
    maxAge: 18,
    personalityCategory: 'CONFLICT',
    text: (_ctx, npcName) => `${npcName} "Bir sonraki denemede seni geçeceğim" diye mesaj attı.`,
    choices: [
      { text: 'Meydan okumayı kabul et', effect: { discipline: 2 }, feedback: 'Rekabet seni motive etti.', npcRelationChange: 1 },
      { text: 'Saygılı cevap ver', effect: { charisma: 1 }, feedback: 'Gerilimi kontrollü tuttun.', npcRelationChange: 3 },
      { text: 'Aşağılayıcı cevap ver', effect: {}, feedback: 'Rekabet düşmanlığa kaydı.', npcRelationChange: -8, stressEffect: 4 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_rival_result_02',
    role: 'RIVAL',
    minAge: 11,
    maxAge: 18,
    personalityCategory: 'RISK',
    text: (_ctx, npcName) => `${npcName} son sonuçları paylaşıp seni etiketledi.`,
    choices: [
      { text: 'Kendi sonucunu sakin paylaş', effect: { discipline: 1 }, feedback: 'Sakin tavrın etkili oldu.', npcRelationChange: 2 },
      { text: 'Tatlı bir rekabet mesajı at', effect: { charisma: 1 }, feedback: 'Rekabet dozunda kaldı.', npcRelationChange: 4 },
      { text: 'Sert çıkış yap', effect: {}, feedback: 'Sosyal gerilim arttı.', npcRelationChange: -7, stressEffect: 5 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_rival_teamup_03',
    role: 'RIVAL',
    minAge: 12,
    maxAge: 18,
    personalityCategory: 'MORAL',
    text: (_ctx, npcName) => `${npcName} ortak bir proje için geçici işbirliği teklif etti.`,
    choices: [
      { text: 'İşbirliğini kabul et', effect: { intelligence: 1, charisma: 1 }, feedback: 'Rekabetten öğrenmeye geçtiniz.', npcRelationChange: 5 },
      { text: 'Sınırlı destek ver', effect: { discipline: 1 }, feedback: 'İlişki nötr kaldı.', npcRelationChange: 1 },
      { text: 'Reddet', effect: {}, feedback: 'Köprüler biraz daha yandı.', npcRelationChange: -6 },
    ],
  }),

  createNpcCheckInEvent({
    id: 'npc_checkin_enemy_taunt_01',
    role: 'ENEMY',
    minAge: 10,
    maxAge: 18,
    personalityCategory: 'CONFLICT',
    text: (_ctx, npcName) => `${npcName} alaycı bir mesajla seni provoke etmeye çalıştı.`,
    choices: [
      { text: 'Sakin kal, cevap verme', effect: { discipline: 2 }, feedback: 'Provokasyona düşmedin.', npcRelationChange: 0, stressEffect: -2 },
      { text: 'Kısa ve net cevap ver', effect: { charisma: 1 }, feedback: 'Sınır çizdin.', npcRelationChange: -1 },
      { text: 'Aynı sertlikte cevap ver', effect: {}, feedback: 'Gerilim büyüdü.', npcRelationChange: -6, stressEffect: 6 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_enemy_rumor_02',
    role: 'ENEMY',
    minAge: 11,
    maxAge: 18,
    personalityCategory: 'MORAL',
    text: (_ctx, npcName) => `${npcName} senin hakkında yeni bir söylenti yayıldığını yazdı.`,
    choices: [
      { text: 'Kanıt toplayıp sakin cevap ver', effect: { intelligence: 1, discipline: 1 }, feedback: 'Durumu akılla yönetttin.', npcRelationChange: 1 },
      { text: 'Destek iste', effect: { charisma: 1 }, feedback: 'Yalnız kalmadın.', npcRelationChange: 0 },
      { text: 'Anında patla', effect: {}, feedback: 'Duygusal tepki durumu zorlaştırdı.', npcRelationChange: -5, stressEffect: 5 },
    ],
  }),
  createNpcCheckInEvent({
    id: 'npc_checkin_enemy_boundary_03',
    role: 'ENEMY',
    minAge: 12,
    maxAge: 18,
    personalityCategory: 'GROWTH',
    text: (_ctx, npcName) => `${npcName} beklenmedik şekilde "Bu işi kapatalım mı?" diye yazdı.`,
    choices: [
      { text: 'Temkinli bir barış denemesi yap', effect: { discipline: 1, charisma: 1 }, feedback: 'Gerilim biraz azaldı.', npcRelationChange: 4, stressEffect: -3 },
      { text: 'Mesafeli nötr kal', effect: {}, feedback: 'Sorun donduruldu, çözülmedi.', npcRelationChange: 1 },
      { text: 'Kesin reddet', effect: {}, feedback: 'Düşmanlık aynen sürdü.', npcRelationChange: -4, stressEffect: 2 },
    ],
  }),
];
