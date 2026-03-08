import { strings, getRuntimeLocale } from '../i18n/strings';

export const FLAVOR_TEXT_CATEGORIES = [
  'SPORT_SUCCESS',
  'CODING_SESSION',
  'MUSIC_PRACTICE',
  'STUDY_MATH',
  'STUDY_VERBAL',
  'GAMING',
  'WORK_GRIND',
  'SOCIAL_FUN',
  'ART_CREATION',
  'BABY_FUN',
] as const;

type FlavorCategory = (typeof FLAVOR_TEXT_CATEGORIES)[number];

export const getRandomFlavor = (category: FlavorCategory): string => {
  const locale = getRuntimeLocale();
  const localeStrings = strings[locale];
  const rawFlavorNode = localeStrings?.flavorTexts;
  const flavorObj = (
    rawFlavorNode
    && typeof rawFlavorNode === 'object'
    && !Array.isArray(rawFlavorNode)
  ) ? (rawFlavorNode as Record<string, unknown>) : undefined;
  const localizedBucket = flavorObj?.[category];

  if (!Array.isArray(localizedBucket) || localizedBucket.length === 0) {
    return '';
  }

  const idx = Math.floor(Math.random() * localizedBucket.length);
  return localizedBucket[idx] as string;
};
