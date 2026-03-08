import type { EventContext, GameEvent } from '../types';

const hasBestFriend = (ctx: EventContext): boolean =>
  ctx.npcs?.some(npc => npc.role === 'BEST_FRIEND') ?? false;

const hasAnyPlayerGroup = (ctx: EventContext): boolean =>
  ctx.gameState?.socialGroups?.some(group => group.isPlayerMember) ?? false;

export const SOCIAL_GROUP_EVENTS: GameEvent[] = [
  {
    id: 'social_group_popular_invite',
    text: 'Popüler bir grup seni hafta sonu buluşmasına davet etti.',
    minAge: 11,
    maxAge: 18,
    rarity: 'UNCOMMON',
    isRepeatable: false,
    tags: ['social_group', 'invite'],
    condition: (ctx) => hasBestFriend(ctx) && !hasAnyPlayerGroup(ctx),
    choices: [
      {
        id: 'popular_invite_join',
        text: 'Daveti kabul et',
        effect: { charisma: 3, energy: -4 },
        feedback: 'Gruba dahil oldun, sosyal çevren genişledi.',
        socialGroupAction: {
          type: 'CREATE',
          groupType: 'CLIQUE',
          groupName: 'Mahalle Clique',
          memberRoles: ['BEST_FRIEND', 'FRIEND'],
        },
        socialReputationChange: 8,
        choiceType: 'NEUTRAL',
      },
      {
        id: 'popular_invite_decline',
        text: 'Kibarca reddet',
        effect: { discipline: 2 },
        feedback: 'Kendi ritmini korumayı seçtin.',
        socialReputationChange: -2,
        choiceType: 'PASSIVE',
      },
    ],
  },
  {
    id: 'social_group_best_friend_plan',
    text: 'En yakın arkadaşın birlikte ders grubu kurma fikriyle geldi.',
    minAge: 10,
    maxAge: 18,
    rarity: 'COMMON',
    isRepeatable: false,
    tags: ['social_group', 'study_group'],
    condition: (ctx) => hasBestFriend(ctx),
    choices: [
      {
        id: 'best_friend_create_group',
        text: 'Ders grubu kur',
        effect: { intelligence: 3, discipline: 2 },
        feedback: 'Planlı çalışma rutini kurarak grubunu oluşturdun.',
        socialGroupAction: {
          type: 'CREATE',
          groupType: 'STUDY_GROUP',
          groupName: 'Çalışma Takımı',
          memberRoles: ['BEST_FRIEND', 'FRIEND'],
        },
        socialReputationChange: 5,
        choiceType: 'CHALLENGE',
      },
      {
        id: 'best_friend_postpone_group',
        text: 'Fikri ertele',
        effect: { energy: 2 },
        feedback: 'Şu anlık tek başına kalmayı seçtin.',
        choiceType: 'PASSIVE',
      },
    ],
  },
  {
    id: 'social_group_internal_conflict',
    text: 'Grubunda tartışma büyüdü; liderlik ve uyum testi başladı.',
    minAge: 12,
    maxAge: 18,
    rarity: 'UNCOMMON',
    isRepeatable: true,
    tags: ['social_group', 'conflict'],
    condition: (ctx) => hasAnyPlayerGroup(ctx),
    choices: [
      {
        id: 'group_conflict_mediate',
        text: 'Araya gir ve uzlaştır',
        effect: { charisma: 2, discipline: 1, energy: -5 },
        feedback: 'Kriz yönetimiyle grubu dağılmaktan kurtardın.',
        socialGroupAction: { type: 'REPUTATION', reputationDelta: 8 },
        socialReputationChange: 4,
        choiceType: 'CHALLENGE',
      },
      {
        id: 'group_conflict_walk_away',
        text: 'Tartışmadan uzaklaş',
        effect: { energy: 2, familyRelation: -1 },
        feedback: 'Grubun itibarında düşüş yaşandı.',
        socialGroupAction: { type: 'REPUTATION', reputationDelta: -12 },
        socialReputationChange: -6,
        npcRelationChange: -4,
        choiceType: 'PASSIVE',
      },
    ],
  },
  {
    id: 'social_group_club_competition',
    text: 'Kulübün bir yarışmaya katılıyor. Takım ruhu ve beceri sınavda.',
    minAge: 13,
    maxAge: 18,
    rarity: 'RARE',
    isRepeatable: true,
    tags: ['social_group', 'competition'],
    condition: (ctx) => hasAnyPlayerGroup(ctx),
    choices: [
      {
        id: 'club_competition_commit',
        text: 'Takımı organize et',
        effect: { intelligence: 2, charisma: 3, discipline: 2, energy: -8 },
        skillUpdates: { teamwork: 3 },
        feedback: 'Yarışma günü liderlik performansın grubun itibarını yükseltti.',
        socialGroupAction: { type: 'REPUTATION', reputationDelta: 12 },
        socialReputationChange: 7,
        choiceType: 'CHALLENGE',
      },
      {
        id: 'club_competition_skip',
        text: 'Bu tur geri çekil',
        effect: { energy: 4 },
        feedback: 'Takım moralinde hafif bir düşüş oldu.',
        socialGroupAction: { type: 'REPUTATION', reputationDelta: -6 },
        socialReputationChange: -3,
        choiceType: 'PASSIVE',
      },
    ],
  },
];
