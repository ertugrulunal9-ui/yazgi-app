/**
 * Mid-Game Sharing Utilities
 * Generates shareable text for milestone moments during gameplay.
 */

import { tRuntime } from '../i18n/strings';

export type ShareMilestoneType =
  | 'TRAIT_ACQUIRED'
  | 'SECRET_ACHIEVEMENT'
  | 'FIRST_ROMANCE'
  | 'FATE_MOMENT'
  | 'LEGENDARY_EVENT';

interface ShareMilestone {
  type: ShareMilestoneType;
  text: string;
  emoji: string;
}

const TRAIT_SHARE_TEMPLATES = [
  "{traitName} trait'ini kazandim! Yazgi'da kaderimi yaziyorum.",
  'Yeni ozellik acildi: {traitName}! Bu hayat farkli olacak.',
  "{traitName} ile gucleniyorum. Yazgi'da her seciminiz onemli.",
];

const ACHIEVEMENT_SHARE_TEMPLATES = [
  "Gizli basarim acildi! Yazgi'da kendi hikayeni yaz.",
  "Bunu bulmak kolay degildi! Yazgi'da gizli sonlar seni bekliyor.",
];

const ROMANCE_SHARE_TEMPLATES = [
  "Ilk ask... Yazgi'da duygusal anlar seni bekliyor.",
  "Kalbim carpti! Yazgi'da her iliski farkli.",
];

const FATE_SHARE_TEMPLATES = [
  "Kader bana {outcome}! Yazgi'da sans faktorunu hisset.",
  "{outcome} - Kader tokeni kazandim! Yazgi'da kaderini sen yaz.",
];

const pickTemplateByIndex = (
  keyBase: string,
  fallbacks: string[]
): string => {
  const index = Math.floor(Math.random() * fallbacks.length);
  return tRuntime(`${keyBase}.${index}`, undefined, fallbacks[index]);
};

export const createTraitShareText = (traitName: string): ShareMilestone => ({
  type: 'TRAIT_ACQUIRED',
  text: pickTemplateByIndex('social.share.traitTemplates', TRAIT_SHARE_TEMPLATES)
    .replace('{traitName}', traitName),
  emoji: '\u26A1',
});

export const createAchievementShareText = (): ShareMilestone => ({
  type: 'SECRET_ACHIEVEMENT',
  text: pickTemplateByIndex('social.share.achievementTemplates', ACHIEVEMENT_SHARE_TEMPLATES),
  emoji: '\u{1F3C6}',
});

export const createRomanceShareText = (): ShareMilestone => ({
  type: 'FIRST_ROMANCE',
  text: pickTemplateByIndex('social.share.romanceTemplates', ROMANCE_SHARE_TEMPLATES),
  emoji: '\u{1F497}',
});

export const createFateShareText = (isPositive: boolean): ShareMilestone => {
  const fallbackOutcome = isPositive ? 'gulumsedi' : 'sirtini dondu';
  const outcome = isPositive
    ? tRuntime('social.share.fatePositiveOutcome', undefined, fallbackOutcome)
    : tRuntime('social.share.fateNegativeOutcome', undefined, fallbackOutcome);

  return {
    type: 'FATE_MOMENT',
    text: pickTemplateByIndex('social.share.fateTemplates', FATE_SHARE_TEMPLATES)
      .replace('{outcome}', outcome),
    emoji: isPositive ? '\u{1F31F}' : '\u{1F327}\uFE0F',
  };
};

/**
 * Creates a plain-text shareable message for any milestone.
 * Can be used with native sharing (expo-sharing) or clipboard.
 */
export const formatShareMessage = (milestone: ShareMilestone): string =>
  `${milestone.emoji} ${milestone.text}\n\nyazgi.app`;
