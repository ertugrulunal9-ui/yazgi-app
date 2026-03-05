import type { EventContext, GameEvent } from '../types';

const hasBestFriend = (ctx: EventContext): boolean =>
  ctx.npcs?.some(npc => npc.role === 'BEST_FRIEND') ?? false;

const hasAnyPlayerGroup = (ctx: EventContext): boolean =>
  ctx.gameState?.socialGroups?.some(group => group.isPlayerMember) ?? false;

export const SOCIAL_GROUP_EVENTS: GameEvent[] = [
  {
    id: 'social_group_popular_invite',
    text: 'Populer bir grup seni hafta sonu bulusmasina davet etti.',
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
        feedback: 'Gruba dahil oldun, sosyal cevren genisledi.',
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
        feedback: 'Kendi ritmini korumayi sectin.',
        socialReputationChange: -2,
        choiceType: 'PASSIVE',
      },
    ],
  },
  {
    id: 'social_group_best_friend_plan',
    text: 'En yakin arkadasin birlikte ders grubu kurma fikriyle geldi.',
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
        feedback: 'Planli calisma rutini kurarak grubunu olusturdun.',
        socialGroupAction: {
          type: 'CREATE',
          groupType: 'STUDY_GROUP',
          groupName: 'Calisma Takimi',
          memberRoles: ['BEST_FRIEND', 'FRIEND'],
        },
        socialReputationChange: 5,
        choiceType: 'CHALLENGE',
      },
      {
        id: 'best_friend_postpone_group',
        text: 'Fikri ertele',
        effect: { energy: 2 },
        feedback: 'Su anlik tek basina kalmayi sectin.',
        choiceType: 'PASSIVE',
      },
    ],
  },
  {
    id: 'social_group_internal_conflict',
    text: 'Grubunda tartisma buyudu; liderlik ve uyum testi basladi.',
    minAge: 12,
    maxAge: 18,
    rarity: 'UNCOMMON',
    isRepeatable: true,
    tags: ['social_group', 'conflict'],
    condition: (ctx) => hasAnyPlayerGroup(ctx),
    choices: [
      {
        id: 'group_conflict_mediate',
        text: 'Araya gir ve uzlastir',
        effect: { charisma: 2, discipline: 1, energy: -5 },
        feedback: 'Kriz yonetimiyle grubu dagilmaktan kurtardin.',
        socialGroupAction: { type: 'REPUTATION', reputationDelta: 8 },
        socialReputationChange: 4,
        choiceType: 'CHALLENGE',
      },
      {
        id: 'group_conflict_walk_away',
        text: 'Tartismadan uzaklas',
        effect: { energy: 2, familyRelation: -1 },
        feedback: 'Grubun itibarinda dusus yasandi.',
        socialGroupAction: { type: 'REPUTATION', reputationDelta: -12 },
        socialReputationChange: -6,
        npcRelationChange: -4,
        choiceType: 'PASSIVE',
      },
    ],
  },
  {
    id: 'social_group_club_competition',
    text: 'Kulubun bir yarismaya katiliyor. Takim ruhu ve beceri sinavda.',
    minAge: 13,
    maxAge: 18,
    rarity: 'RARE',
    isRepeatable: true,
    tags: ['social_group', 'competition'],
    condition: (ctx) => hasAnyPlayerGroup(ctx),
    choices: [
      {
        id: 'club_competition_commit',
        text: 'Takimi organize et',
        effect: { intelligence: 2, charisma: 3, discipline: 2, energy: -8 },
        skillUpdates: { teamwork: 3 },
        feedback: 'Yarisma gunu liderlik performansin grubun itibarini yukseltti.',
        socialGroupAction: { type: 'REPUTATION', reputationDelta: 12 },
        socialReputationChange: 7,
        choiceType: 'CHALLENGE',
      },
      {
        id: 'club_competition_skip',
        text: 'Bu tur geri cekil',
        effect: { energy: 4 },
        feedback: 'Takim moralinde hafif bir dusus oldu.',
        socialGroupAction: { type: 'REPUTATION', reputationDelta: -6 },
        socialReputationChange: -3,
        choiceType: 'PASSIVE',
      },
    ],
  },
];
