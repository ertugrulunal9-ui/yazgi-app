import { FamilyWealth, Item } from '../types';
import { AppLocale, t as translate, tRuntime } from '../i18n/strings';
import { CONSUMABLE_CONFIG } from '../config/gameBalance';

export const ITEMS: Item[] = [
  {
    id: 'item_art_set',
    name: '',
    price: 55,
    description: '',
    type: 'PERMANENT',
    requiredForAction: 'arts_draw',
  },
  {
    id: 'item_story_book',
    name: '',
    price: 70,
    description: '',
    type: 'PERMANENT',
    requiredForAction: 'study_book',
  },
  {
    id: 'item_football',
    name: '',
    price: 90,
    description: '',
    type: 'PERMANENT',
    requiredForAction: 'sports_football',
  },
  {
    id: 'item_bicycle',
    name: '',
    price: 210,
    description: '',
    type: 'PERMANENT',
    requiredForAction: 'sports_bicycle',
  },
  {
    id: 'item_computer',
    name: '',
    price: 480,
    description: '',
    type: 'PERMANENT',
    requiredForAction: 'computer_code',
  },
  {
    id: 'item_instrument',
    name: '',
    price: 390,
    description: '',
    type: 'PERMANENT',
    requiredForAction: 'arts_instrument',
  },
  {
    id: 'item_sports_gear',
    name: '',
    price: 240,
    description: '',
    type: 'PERMANENT',
    requiredForAction: 'sports_run',
  },
  {
    id: 'item_energy_drink',
    name: '',
    price: CONSUMABLE_CONFIG.energyDrink.base,
    description: '',
    type: 'CONSUMABLE',
    effect: { energy: CONSUMABLE_CONFIG.energyDrink.effect },
  },
  {
    id: 'item_tutor_session',
    name: '',
    price: CONSUMABLE_CONFIG.tutorSession.base,
    description: '',
    type: 'CONSUMABLE',
  },
  {
    id: 'item_gym_pass',
    name: '',
    price: CONSUMABLE_CONFIG.gymPass.base,
    description: '',
    type: 'CONSUMABLE',
    effect: { health: CONSUMABLE_CONFIG.gymPass.healthPerTurn },
  },
  {
    id: 'item_fashion_outfit',
    name: '',
    price: CONSUMABLE_CONFIG.fashionOutfit.base,
    description: '',
    type: 'CONSUMABLE',
    effect: { charisma: CONSUMABLE_CONFIG.fashionOutfit.charismaBoost },
  },
  {
    id: 'item_investment',
    name: '',
    price: CONSUMABLE_CONFIG.investment.base,
    description: '',
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

export const getItemName = (itemId: string, locale?: AppLocale): string => {
  const key = `items.${itemId}.name`;
  const fallback = getItem(itemId)?.name || itemId;
  return locale
    ? translate(locale, key, undefined, fallback)
    : tRuntime(key, undefined, fallback);
};

export const getItemDescription = (itemId: string, locale?: AppLocale): string => {
  const key = `items.${itemId}.description`;
  const fallback = getItem(itemId)?.description || '';
  return locale
    ? translate(locale, key, undefined, fallback)
    : tRuntime(key, undefined, fallback);
};
