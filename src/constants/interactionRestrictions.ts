// =================================================================
// SOCIAL INTERACTION AGE RESTRICTIONS
// =================================================================

import { tRuntime } from '../i18n/strings';

export type InteractionType = 'CHAT' | 'HANGOUT' | 'GIFT' | 'STUDY' | 'FLIRT' | 'HELP' | 'COMPETE' | 'GOSSIP';

export interface InteractionRestriction {
  minAge: number;
  maxAge?: number;
  label: string;
  description: string;
  lockedMessage: string;
}

export const INTERACTION_AGE_RESTRICTIONS: Record<InteractionType, InteractionRestriction> = {
  CHAT: {
    minAge: 3,
    label: 'Sohbet Et',
    description: 'Dostca sohbet',
    lockedMessage: 'Henuz konusmayi ogrenmedin',
  },
  HANGOUT: {
    minAge: 5,
    label: 'Takil',
    description: 'Birlikte vakit gecir',
    lockedMessage: 'Henuz disarida takilmak icin kucuksun',
  },
  HELP: {
    minAge: 5,
    label: 'Yardim Et',
    description: 'Ihtiyacinda yardim',
    lockedMessage: 'Henuz yardim edebilecek yasta degilsin',
  },
  GIFT: {
    minAge: 6,
    label: 'Hediye Ver',
    description: 'Ozel hediye',
    lockedMessage: 'Hediye vermeyi henuz ogrenmedin',
  },
  STUDY: {
    minAge: 7,
    label: 'Ders Calis',
    description: 'Birlikte ders',
    lockedMessage: 'Henuz okula baslamadin',
  },
  COMPETE: {
    minAge: 7,
    label: 'Yaris',
    description: 'Rekabet et',
    lockedMessage: 'Yarismak icin biraz daha buyumelisin',
  },
  GOSSIP: {
    minAge: 10,
    label: 'Dedikodu',
    description: 'Baskalari hakkinda',
    lockedMessage: 'Dedikodu yapmak icin cok kucuksun',
  },
  FLIRT: {
    minAge: 12,
    label: 'Flort Et',
    description: 'Romantik ilgi',
    lockedMessage: 'Flort etmek icin ergenlige girmelisin',
  },
};

const INTERACTION_I18N_KEY_MAP: Record<InteractionType, string> = {
  CHAT: 'social.interactions.CHAT',
  HANGOUT: 'social.interactions.HANGOUT',
  GIFT: 'social.interactions.GIFT',
  STUDY: 'social.interactions.STUDY',
  FLIRT: 'social.interactions.FLIRT',
  HELP: 'social.interactions.HELP',
  COMPETE: 'social.interactions.COMPETE',
  GOSSIP: 'social.interactions.GOSSIP',
};

export const getLocalizedInteractionRestriction = (type: InteractionType): InteractionRestriction => {
  const fallback = INTERACTION_AGE_RESTRICTIONS[type];
  const keyBase = INTERACTION_I18N_KEY_MAP[type];

  return {
    ...fallback,
    label: tRuntime(`${keyBase}.label`, undefined, fallback.label),
    description: tRuntime(`${keyBase}.description`, undefined, fallback.description),
    lockedMessage: tRuntime(`${keyBase}.lockedMessage`, undefined, fallback.lockedMessage),
  };
};

export const isInteractionAvailable = (type: InteractionType, playerAge: number): boolean => {
  const restriction = INTERACTION_AGE_RESTRICTIONS[type];
  if (!restriction) return false;
  if (playerAge < restriction.minAge) return false;
  if (restriction.maxAge !== undefined && playerAge > restriction.maxAge) return false;
  return true;
};

export const getAvailableInteractions = (playerAge: number): InteractionType[] => (
  (Object.keys(INTERACTION_AGE_RESTRICTIONS) as InteractionType[])
    .filter(type => isInteractionAvailable(type, playerAge))
);

export const getLockedMessage = (type: InteractionType): string => {
  const fallback = INTERACTION_AGE_RESTRICTIONS[type]?.lockedMessage || 'Bu etkilesim kilitli';
  const keyBase = INTERACTION_I18N_KEY_MAP[type];
  if (!keyBase) {
    return tRuntime('social.interactions.fallbackLocked', undefined, fallback);
  }
  return tRuntime(`${keyBase}.lockedMessage`, undefined, fallback);
};

export const SOCIAL_MENU_MIN_AGE = 3;
