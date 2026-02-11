import { FamilyWealth, Item } from '../types';

export const ITEMS: Item[] = [
  {
    id: 'item_art_set',
    name: 'Boyama Seti',
    price: 30,
    description: 'Resim calismalari icin temel set. Cizim gelisimini hizlandirir.',
    type: 'PERMANENT',
    requiredForAction: 'arts_draw',
  },
  {
    id: 'item_story_book',
    name: 'Hikaye Kitabi',
    price: 40,
    description: 'Masal saatlerini daha verimli hale getirir, okuma becerisine bonus verir.',
    type: 'PERMANENT',
    requiredForAction: 'study_book',
  },
  {
    id: 'item_football',
    name: 'Futbol Topu',
    price: 50,
    description: 'Futbolu daha erken yasta acmak icin gerekli.',
    type: 'PERMANENT',
    requiredForAction: 'sports_football',
  },
  {
    id: 'item_bicycle',
    name: 'Bisiklet',
    price: 120,
    description: 'Bisiklet surus aksiyonunu acar. Saglik ve cesarete katki verir.',
    type: 'PERMANENT',
    requiredForAction: 'sports_bicycle',
  },
  {
    id: 'item_computer',
    name: 'Bilgisayar',
    price: 300,
    description: 'Kodlama ve tasarim aksiyonlarini acmak icin gerekli.',
    type: 'PERMANENT',
    requiredForAction: 'computer_code',
  },
  {
    id: 'item_instrument',
    name: 'Enstruman',
    price: 250,
    description: 'Enstruman cal aksiyonunu acmak icin gerekli.',
    type: 'PERMANENT',
    requiredForAction: 'arts_instrument',
  },
  {
    id: 'item_sports_gear',
    name: 'Spor Malzemesi',
    price: 150,
    description: 'Tum spor aksiyonlarina bonus saglar.',
    type: 'PERMANENT',
    requiredForAction: 'sports_run',
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
