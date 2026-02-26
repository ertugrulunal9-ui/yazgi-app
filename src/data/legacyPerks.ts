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
    title: 'Hizli Baslangic',
    description: 'Yeni kosulara 7 yasindan baslama secenegi acilir.',
  },
  {
    id: 'CHOOSE_GENETIC_TRAIT',
    levelRequired: 2,
    icon: '\u{1F9EC}',
    title: 'Genetik Secim',
    description: 'Rastgele yerine baslangic genetik traitini secme secenegi acilir.',
  },
  {
    id: 'BONUS_STARTING_NPC',
    levelRequired: 3,
    icon: '\u{1F465}',
    title: 'Ek Baslangic NPC',
    description: 'Oyuna +1 ek baslangic NPC ile baslarsin.',
  },
  {
    id: 'FREE_STARTING_ITEM',
    levelRequired: 5,
    icon: '\u{1F381}',
    title: 'Ucretsiz Baslangic Item',
    description: 'Yeni kosu oncesi 1 ucretsiz item secme secenegi acilir.',
  },
  {
    id: 'UNLOCK_BALANCED_GOAL',
    levelRequired: 7,
    icon: '\u2696\uFE0F',
    title: 'Dengeli Hedef',
    description: 'Karakter olusturma ekraninda Dengeli hedef secenegi acilir.',
  },
  {
    id: 'PRESTIGE_BADGE',
    levelRequired: 10,
    icon: '\u{1F3C5}',
    title: 'Prestij Rozeti',
    description: 'Legacy panelinde prestij rozeti kazanirsin.',
  },
];

export const getUnlockedLegacyPerks = (legacyLevel: number): LegacyPerkDefinition[] => (
  LEGACY_PERKS.filter(perk => legacyLevel >= perk.levelRequired)
);

export const hasLegacyPerk = (legacyLevel: number, perkId: LegacyPerkId): boolean => (
  LEGACY_PERKS.some(perk => perk.id === perkId && legacyLevel >= perk.levelRequired)
);

