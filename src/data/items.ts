import { FamilyWealth, Item } from '../types';
import { tRuntime } from '../i18n/strings';
import { CONSUMABLE_CONFIG } from '../config/gameBalance';

export const ITEMS: Item[] = [
  {
    id: 'item_art_set',
    name: 'Boyama Seti',
    price: 55,
    description: 'Resim calismalari icin temel set. Cizim gelisimini hizlandirir.',
    type: 'PERMANENT',
    requiredForAction: 'arts_draw',
  },
  {
    id: 'item_story_book',
    name: 'Hikaye Kitabi',
    price: 70,
    description: 'Masal saatlerini daha verimli hale getirir, okuma becerisine bonus verir.',
    type: 'PERMANENT',
    requiredForAction: 'study_book',
  },
  {
    id: 'item_football',
    name: 'Futbol Topu',
    price: 90,
    description: 'Futbolu daha erken yasta acmak icin gerekli.',
    type: 'PERMANENT',
    requiredForAction: 'sports_football',
  },
  {
    id: 'item_bicycle',
    name: 'Bisiklet',
    price: 210,
    description: 'Bisiklet surus aksiyonunu acar. Saglik ve cesarete katki verir.',
    type: 'PERMANENT',
    requiredForAction: 'sports_bicycle',
  },
  {
    id: 'item_computer',
    name: 'Bilgisayar',
    price: 480,
    description: 'Kodlama ve tasarim aksiyonlarini acmak icin gerekli.',
    type: 'PERMANENT',
    requiredForAction: 'computer_code',
  },
  {
    id: 'item_instrument',
    name: 'Enstruman',
    price: 390,
    description: 'Enstruman cal aksiyonunu acmak icin gerekli.',
    type: 'PERMANENT',
    requiredForAction: 'arts_instrument',
  },
  {
    id: 'item_sports_gear',
    name: 'Spor Malzemesi',
    price: 240,
    description: 'Tum spor aksiyonlarina bonus saglar.',
    type: 'PERMANENT',
    requiredForAction: 'sports_run',
  },
  {
    id: 'item_energy_drink',
    name: 'Enerji Icecegi',
    price: CONSUMABLE_CONFIG.energyDrink.base,
    description: 'Aninda enerji verir ama sureli kullanim siniri vardir.',
    type: 'CONSUMABLE',
    effect: { energy: CONSUMABLE_CONFIG.energyDrink.effect },
  },
  {
    id: 'item_tutor_session',
    name: 'Ozel Ders',
    price: CONSUMABLE_CONFIG.tutorSession.base,
    description: 'Rastgele bir derste hizli not takviyesi saglar.',
    type: 'CONSUMABLE',
  },
  {
    id: 'item_gym_pass',
    name: 'Spor Salonu Paketi',
    price: CONSUMABLE_CONFIG.gymPass.base,
    description: `${CONSUMABLE_CONFIG.gymPass.duration} tur boyunca saglik kazanimi saglar.`,
    type: 'CONSUMABLE',
    effect: { health: CONSUMABLE_CONFIG.gymPass.healthPerTurn },
  },
  {
    id: 'item_fashion_outfit',
    name: 'Tarz Kombin',
    price: CONSUMABLE_CONFIG.fashionOutfit.base,
    description: `${CONSUMABLE_CONFIG.fashionOutfit.duration} tur boyunca karizma etkisi verir.`,
    type: 'CONSUMABLE',
    effect: { charisma: CONSUMABLE_CONFIG.fashionOutfit.charismaBoost },
  },
  {
    id: 'item_investment',
    name: 'Mini Yatirim',
    price: CONSUMABLE_CONFIG.investment.base,
    description: `${CONSUMABLE_CONFIG.investment.duration} tur sonra geri donus saglar.`,
    type: 'CONSUMABLE',
  },
];

const STARTER_ITEMS_BY_WEALTH: Record<FamilyWealth, string[]> = {
  POOR: [],
  MIDDLE: [],
  RICH: ['item_art_set', 'item_bicycle', 'item_computer'],
};

export const getStarterItemsByWealth = (wealth: FamilyWealth | null | undefined): string[] => {
  if (!wealth) return [];
  return STARTER_ITEMS_BY_WEALTH[wealth] || [];
};

export const getEffectiveOwnedItems = (
  inventory: string[] = [],
  wealth: FamilyWealth | null | undefined
): string[] => {
  const starterItems = getStarterItemsByWealth(wealth);
  return Array.from(new Set([...(inventory || []), ...starterItems]));
};

export const getItem = (itemId: string): Item | undefined => {
  return ITEMS.find(item => item.id === itemId);
};

export const getItemName = (itemId: string): string => {
  return tRuntime(`items.${itemId}.name`, undefined, getItem(itemId)?.name ?? itemId);
};

export const getItemDescription = (itemId: string): string => {
  return tRuntime(`items.${itemId}.description`, undefined, getItem(itemId)?.description ?? '');
};
