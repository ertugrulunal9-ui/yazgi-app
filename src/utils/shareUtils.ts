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
  "{traitName} trait'ini kazandım! Yazgı'da kaderimi yazıyorum.",
  'Yeni özellik açıldı: {traitName}! Bu hayat farklı olacak.',
  "{traitName} ile güçleniyorum. Yazgı'da her seçiminiz önemli.",
];

const ACHIEVEMENT_SHARE_TEMPLATES = [
  "Gizli başarım açıldı! Yazgı'da kendi hikayeni yaz.",
  "Bunu bulmak kolay değildi! Yazgı'da gizli sonlar seni bekliyor.",
];

const ROMANCE_SHARE_TEMPLATES = [
  "İlk aşk... Yazgı'da duygusal anlar seni bekliyor.",
  "Kalbim çarptı! Yazgı'da her ilişki farklı.",
];

const FATE_SHARE_TEMPLATES = [
  "Kader bana {outcome}! Yazgı'da şans faktörünü hisset.",
  "{outcome} - Kader tokeni kazandım! Yazgı'da kaderini sen yaz.",
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
  const outcome = isPositive
    ? tRuntime('social.share.fatePositiveOutcome')
    : tRuntime('social.share.fateNegativeOutcome');

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
