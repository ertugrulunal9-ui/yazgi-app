import { StoryArc } from '../types';

/**
 * NPC Questline Arc Tanımları
 *
 * 4 ana arc: Dostluk, Aşk, Rekabet, İhanet
 * Her biri mevcut StoryArc altyapısını kullanır.
 * requiresNPC + npcRoleRequirement ile NPC ilişkisine bağlanır.
 */

export const NPC_QUESTLINE_ARCS: StoryArc[] = [
  // ===============================================================
  // ARC 1: DERİN DOSTLUK (Friendship Deepening)
  // ===============================================================
  {
    id: 'arc_npc_friendship_deepening',
    title: 'Derin Dostluk Rotasi',
    ageRange: [8, 18],
    isRepeatable: false,
    requiresNPC: true,
    npcRoleRequirement: ['FRIEND'],
    events: [
      // Stage 1: Sır paylaşımı — güven kararı
      { eventId: 'npcq_friend_secret_share', stage: 1, requiresPrevious: false },
      // Stage 2: Aile tanışması — relationship > 60
      { eventId: 'npcq_friend_family_visit', stage: 2, requiresPrevious: true,
        branchCondition: (ctx) => {
          const npc = ctx.npcs?.find(n => n.role === 'FRIEND' && n.relationship > 60);
          return !!npc;
        } },
      // Stage 2 alternatif: düşük ilişkide daha yüzeysel karşılaşma
      { eventId: 'npcq_friend_casual_hangout', stage: 2, requiresPrevious: true,
        branchCondition: (ctx) => {
          const npc = ctx.npcs?.find(n => n.role === 'FRIEND' && n.relationship <= 60);
          return !!npc;
        } },
      // Stage 3: Birlikte kriz — dışarıdan gelen tehdit
      { eventId: 'npcq_friend_shared_crisis', stage: 3, requiresPrevious: true },
      // Stage 4: Ortak macera — birlikte risk alma
      { eventId: 'npcq_friend_adventure', stage: 4, requiresPrevious: true },
      // Stage 5: Sadakat testi — üçüncü kişi müdahalesi
      { eventId: 'npcq_friend_loyalty_test', stage: 5, requiresPrevious: true },
      // Stage 6: Sonuç — en yakın arkadaş veya uzaklaşma
      { eventId: 'npcq_friend_final_bond', stage: 6, requiresPrevious: true,
        branchCondition: (ctx) => {
          const npc = ctx.npcs?.find(n => n.role === 'FRIEND' || n.role === 'BEST_FRIEND');
          return !!npc && npc.relationship >= 70;
        } },
      { eventId: 'npcq_friend_drift_apart', stage: 6, requiresPrevious: true,
        branchCondition: (ctx) => {
          const npc = ctx.npcs?.find(n => n.role === 'FRIEND');
          return !npc || npc.relationship < 70;
        } },
    ],
  },

  // ===============================================================
  // ARC 2: İLK AŞK (First Love)
  // ===============================================================
  {
    id: 'arc_npc_romance_first_love',
    title: 'Ilk Ask Rotasi',
    ageRange: [13, 18],
    isRepeatable: false,
    requiresNPC: true,
    npcRoleRequirement: ['CRUSH'],
    events: [
      // Stage 1: İlk kıvılcım — farkına varma
      { eventId: 'npcq_romance_first_spark', stage: 1, requiresPrevious: false },
      // Stage 2: İtiraf anı — cesaret kararı
      { eventId: 'npcq_romance_confession', stage: 2, requiresPrevious: true },
      // Stage 3: İlk buluşma — mekan/aktivite seçimi
      { eventId: 'npcq_romance_first_date', stage: 3, requiresPrevious: true },
      // Stage 4: Kıskançlık krizi — NPC trait'ine göre dallanma
      { eventId: 'npcq_romance_jealousy_jealous', stage: 4, requiresPrevious: true,
        branchCondition: (ctx) => {
          const npc = ctx.npcs?.find(n => n.role === 'CRUSH' || n.role === 'PARTNER');
          return !!npc && npc.traits.includes('JEALOUS');
        } },
      { eventId: 'npcq_romance_jealousy_loyal', stage: 4, requiresPrevious: true,
        branchCondition: (ctx) => {
          const npc = ctx.npcs?.find(n => n.role === 'CRUSH' || n.role === 'PARTNER');
          return !!npc && !npc.traits.includes('JEALOUS');
        } },
      // Stage 5: Aile tepkisi
      { eventId: 'npcq_romance_family_reaction', stage: 5, requiresPrevious: true },
      // Stage 6: Bağlılık veya ayrılık
      { eventId: 'npcq_romance_commitment', stage: 6, requiresPrevious: true,
        branchCondition: (ctx) => {
          const npc = ctx.npcs?.find(n => n.role === 'PARTNER' || n.role === 'CRUSH');
          return !!npc && npc.romance >= 70;
        } },
      { eventId: 'npcq_romance_mature_breakup', stage: 6, requiresPrevious: true,
        branchCondition: (ctx) => {
          const npc = ctx.npcs?.find(n => n.role === 'PARTNER' || n.role === 'CRUSH');
          return !npc || npc.romance < 70;
        } },
    ],
  },

  // ===============================================================
  // ARC 3: REKABET (Rivalry Escalation)
  // ===============================================================
  {
    id: 'arc_npc_rivalry_escalation',
    title: 'Rekabet Yolu',
    ageRange: [8, 18],
    isRepeatable: false,
    requiresNPC: true,
    npcRoleRequirement: ['RIVAL'],
    events: [
      // Stage 1: Meydan okuma — ilk kışkırtma
      { eventId: 'npcq_rival_first_challenge', stage: 1, requiresPrevious: false },
      // Stage 2: Kamuoyu — arkadaş grubu taraf seçimi
      { eventId: 'npcq_rival_group_sides', stage: 2, requiresPrevious: true },
      // Stage 3: Doğrudan karşılaşma
      { eventId: 'npcq_rival_showdown', stage: 3, requiresPrevious: true },
      // Stage 4: Sonuçlar — kazanan/kaybeden dinamiği
      { eventId: 'npcq_rival_aftermath', stage: 4, requiresPrevious: true },
      // Stage 5: Barış veya tırmanma
      { eventId: 'npcq_rival_peace_offer', stage: 5, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.empathy >= 45 && ctx.personality.courage >= 40 },
      { eventId: 'npcq_rival_escalation', stage: 5, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.empathy < 45 || ctx.personality.courage < 40 },
      // Stage 6: Saygılı rakip veya düşman
      { eventId: 'npcq_rival_respect', stage: 6, requiresPrevious: true,
        branchCondition: (ctx) => {
          const npc = ctx.npcs?.find(n => n.role === 'RIVAL');
          return !!npc && npc.relationship > -30;
        } },
      { eventId: 'npcq_rival_enemy', stage: 6, requiresPrevious: true,
        branchCondition: (ctx) => {
          const npc = ctx.npcs?.find(n => n.role === 'RIVAL' || n.role === 'ENEMY');
          return !npc || npc.relationship <= -30;
        } },
    ],
  },

  // ===============================================================
  // ARC 4: İHANET (Betrayal)
  // ===============================================================
  {
    id: 'arc_npc_betrayal',
    title: 'Ihanet Yolu',
    ageRange: [12, 18],
    isRepeatable: false,
    requiresNPC: true,
    npcRoleRequirement: ['FRIEND', 'BEST_FRIEND'],
    events: [
      // Stage 1: İlk şüphe — küçük tutarsızlıklar
      { eventId: 'npcq_betray_first_doubt', stage: 1, requiresPrevious: false },
      // Stage 2: Dedikodu duyulması — üçüncü kişiden bilgi
      { eventId: 'npcq_betray_gossip_heard', stage: 2, requiresPrevious: true },
      // Stage 3: Kanıt toplama — araştırma kararı
      { eventId: 'npcq_betray_investigation', stage: 3, requiresPrevious: true },
      // Stage 4: Yüzleşme
      { eventId: 'npcq_betray_confrontation', stage: 4, requiresPrevious: true },
      // Stage 5: NPC'nin tepkisi — trait'e göre dallanma
      { eventId: 'npcq_betray_reaction_manipulative', stage: 5, requiresPrevious: true,
        branchCondition: (ctx) => {
          const npc = ctx.npcs?.find(n => n.traits.includes('MANIPULATIVE'));
          return !!npc;
        } },
      { eventId: 'npcq_betray_reaction_regret', stage: 5, requiresPrevious: true,
        branchCondition: (ctx) => {
          const npc = ctx.npcs?.find(n => !n.traits.includes('MANIPULATIVE'));
          return !!npc;
        } },
      // Stage 6: Sonuç — affetme, mesafe, veya kopuş
      { eventId: 'npcq_betray_forgive', stage: 6, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.empathy >= 55 },
      { eventId: 'npcq_betray_distance', stage: 6, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.empathy >= 35 && ctx.personality.empathy < 55 },
      { eventId: 'npcq_betray_cut_off', stage: 6, requiresPrevious: true,
        branchCondition: (ctx) => ctx.personality.empathy < 35 },
    ],
  },
];
