import type { EventContext, GameEvent } from '../types';

const hasCompletedSavingGoal = (ctx: EventContext, goalId: string): boolean =>
  ctx.gameState?.savingGoals?.some(goal => goal.id === goalId && goal.completed) ?? false;

const hasPurchasedItem = (ctx: EventContext, itemId: string): boolean =>
  ctx.gameState?.purchasedItems?.includes(itemId) ?? false;

export const ITEM_UNLOCK_EVENTS: GameEvent[] = [
  {
    id: 'item_unlock_bicycle_social_ride',
    text: 'Bisikletinle mahallede turlarken arkadaslarin sana katildi.',
    minAge: 8,
    maxAge: 18,
    rarity: 'UNCOMMON',
    isRepeatable: false,
    tags: ['item_unlock', 'social', 'bicycle'],
    condition: (ctx) => (
      hasCompletedSavingGoal(ctx, 'saving_bicycle') || hasPurchasedItem(ctx, 'item_bicycle')
    ),
    choices: [
      {
        id: 'bicycle_ride_together',
        text: 'Herkesi birlikte tura cagir',
        effect: { charisma: 3, health: 2, familyRelation: 1 },
        npcRelationChange: 8,
        feedback: 'Tur sonunda grubunla daha da yakinlastin.',
        choiceType: 'NEUTRAL',
      },
    ],
  },
  {
    id: 'item_unlock_phone_message_thread',
    text: 'Telefonuna acilan yeni grup sohbeti sosyal hayati hizlandirdi.',
    minAge: 10,
    maxAge: 18,
    rarity: 'COMMON',
    isRepeatable: false,
    tags: ['item_unlock', 'social', 'phone'],
    condition: (ctx) => hasCompletedSavingGoal(ctx, 'saving_phone'),
    choices: [
      {
        id: 'phone_keep_conversation',
        text: 'Sohbeti sicak tut',
        effect: { charisma: 3, intelligence: 1 },
        npcRelationChange: 6,
        feedback: 'Mesajlasmalar sosyal agini buyuttu.',
        choiceType: 'NEUTRAL',
      },
    ],
  },
  {
    id: 'item_unlock_guitar_jam_session',
    text: 'Gitar birikimini tamamlayinca okul cikisinda mini bir jam session dogdu.',
    minAge: 9,
    maxAge: 18,
    rarity: 'UNCOMMON',
    isRepeatable: false,
    tags: ['item_unlock', 'creative', 'guitar'],
    condition: (ctx) => hasCompletedSavingGoal(ctx, 'saving_guitar'),
    choices: [
      {
        id: 'guitar_open_mic',
        text: 'Sahnede bir parca cal',
        effect: { charisma: 4, intelligence: 1 },
        skillUpdates: { music: 4 },
        feedback: 'Performansin hem cesaretini hem muzikal yetenegini guclendirdi.',
        choiceType: 'CHALLENGE',
      },
    ],
  },
  {
    id: 'item_unlock_computer_internship_window',
    text: 'Bilgisayar hedefini tamamlamanla birlikte bir staj basvuru penceresi acildi.',
    minAge: 12,
    maxAge: 18,
    rarity: 'RARE',
    isRepeatable: false,
    tags: ['item_unlock', 'career', 'computer'],
    condition: (ctx) => (
      hasCompletedSavingGoal(ctx, 'saving_computer') || hasPurchasedItem(ctx, 'item_computer')
    ),
    choices: [
      {
        id: 'computer_apply_internship',
        text: 'Basvuru dosyasi hazirla',
        effect: { intelligence: 4, discipline: 3, charisma: 1 },
        skillUpdates: { coding: 3, work_ethic: 2 },
        feedback: 'Hazirladigin basvuru seni profesyonel dunyaya yaklastirdi.',
        choiceType: 'CHALLENGE',
      },
    ],
  },
  {
    id: 'item_unlock_camera_art_collab',
    text: 'Kamera birikimini bitirdikten sonra yaratici bir ekip seni cekim gunune davet etti.',
    minAge: 13,
    maxAge: 18,
    rarity: 'UNCOMMON',
    isRepeatable: false,
    tags: ['item_unlock', 'creative', 'camera'],
    condition: (ctx) => hasCompletedSavingGoal(ctx, 'saving_camera'),
    choices: [
      {
        id: 'camera_collab_join',
        text: 'Projeye katil',
        effect: { charisma: 3, intelligence: 2 },
        npcRelationChange: 7,
        skillUpdates: { art: 2, design: 2 },
        feedback: 'Yaratici cekim gunu sana yeni sosyal baglar kazandirdi.',
        choiceType: 'NEUTRAL',
      },
    ],
  },
];

