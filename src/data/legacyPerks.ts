import { tRuntime } from '../i18n/strings';

export type LegacyPerkId =
  | 'FAST_START'
  | 'CHOOSE_GENETIC_TRAIT'
  | 'BONUS_STARTING_NPC'
  | 'FREE_STARTING_ITEM'
  | 'UNLOCK_BALANCED_GOAL'
  | 'PRESTIGE_BADGE';

export interface LegacyPerkDefinition {
  id: LegacyPerkId;
  levelRequired: number;
  icon: string;
  title: string;
  description: string;
}

export const LEGACY_PERKS: LegacyPerkDefinition[] = [
  {
    id: 'FAST_START',
    levelRequired: 1,
    icon: '\u23E9',
    title: '',
    description: '',
  },
  {
    id: 'CHOOSE_GENETIC_TRAIT',
    levelRequired: 2,
    icon: '\u{1F9EC}',
    title: '',
    description: '',
  },
  {
    id: 'BONUS_STARTING_NPC',
    levelRequired: 3,
    icon: '\u{1F465}',
    title: '',
    description: '',
  },
  {
    id: 'FREE_STARTING_ITEM',
    levelRequired: 5,
    icon: '\u{1F381}',
    title: '',
    description: '',
  },
  {
    id: 'UNLOCK_BALANCED_GOAL',
    levelRequired: 7,
    icon: '\u2696\uFE0F',
    title: '',
    description: '',
  },
  {
    id: 'PRESTIGE_BADGE',
    levelRequired: 10,
    icon: '\u{1F3C5}',
    title: '',
    description: '',
  },
];

export const getUnlockedLegacyPerks = (legacyLevel: number): LegacyPerkDefinition[] => (
  LEGACY_PERKS.filter(perk => legacyLevel >= perk.levelRequired)
);

export const hasLegacyPerk = (legacyLevel: number, perkId: LegacyPerkId): boolean => (
  LEGACY_PERKS.some(perk => perk.id === perkId && legacyLevel >= perk.levelRequired)
);

export const getLegacyPerkTitle = (perkId: LegacyPerkId): string => {
  const perk = LEGACY_PERKS.find(p => p.id === perkId);
  return tRuntime(`legacyPerks.${perkId}.title`, undefined, perk?.title || perkId);
};

export const getLegacyPerkDescription = (perkId: LegacyPerkId): string => {
  const perk = LEGACY_PERKS.find(p => p.id === perkId);
  return tRuntime(`legacyPerks.${perkId}.description`, undefined, perk?.description || '');
};
