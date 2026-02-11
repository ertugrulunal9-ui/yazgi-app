// =================================================================
// SOSYAL ETKİLEŞİM YAŞ KISITLAMALARI
// Her etkileşim türü için minimum yaş gereksinimleri
// =================================================================

export type InteractionType = 'CHAT' | 'HANGOUT' | 'GIFT' | 'STUDY' | 'FLIRT' | 'HELP' | 'COMPETE' | 'GOSSIP';

export interface InteractionRestriction {
  minAge: number;
  maxAge?: number;
  label: string;
  description: string;
  lockedMessage: string;
}

// Yaşa göre kademeli açılan etkileşimler
export const INTERACTION_AGE_RESTRICTIONS: Record<InteractionType, InteractionRestriction> = {
  CHAT: {
    minAge: 3,
    label: 'Sohbet Et',
    description: 'Dostça sohbet',
    lockedMessage: 'Henüz konuşmayı öğrenmedin',
  },
  HANGOUT: {
    minAge: 5,
    label: 'Takıl',
    description: 'Birlikte vakit geçir',
    lockedMessage: 'Henüz dışarıda takılmak için küçüksün',
  },
  HELP: {
    minAge: 5,
    label: 'Yardım Et',
    description: 'İhtiyacında yardım',
    lockedMessage: 'Henüz yardım edebilecek yaşta değilsin',
  },
  GIFT: {
    minAge: 6,
    label: 'Hediye Ver',
    description: 'Özel hediye',
    lockedMessage: 'Hediye vermeyi henüz öğrenmedin',
  },
  STUDY: {
    minAge: 7,
    label: 'Ders Çalış',
    description: 'Birlikte ders',
    lockedMessage: 'Henüz okula başlamadın',
  },
  COMPETE: {
    minAge: 7,
    label: 'Yarış',
    description: 'Rekabet et',
    lockedMessage: 'Yarışmak için biraz daha büyümelisin',
  },
  GOSSIP: {
    minAge: 10,
    label: 'Dedikodu',
    description: 'Başkaları hakkında',
    lockedMessage: 'Dedikodu yapmak için çok küçüksün',
  },
  FLIRT: {
    minAge: 12,
    label: 'Flört Et',
    description: 'Romantik ilgi',
    lockedMessage: 'Flört etmek için ergenliğe girmelisin',
  },
};

// Belirli bir yaş için hangi etkileşimlerin açık olduğunu kontrol et
export const isInteractionAvailable = (type: InteractionType, playerAge: number): boolean => {
  const restriction = INTERACTION_AGE_RESTRICTIONS[type];
  if (!restriction) return false;
  if (playerAge < restriction.minAge) return false;
  if (restriction.maxAge !== undefined && playerAge > restriction.maxAge) return false;
  return true;
};

// Belirli bir yaş için tüm açık etkileşimleri getir
export const getAvailableInteractions = (playerAge: number): InteractionType[] => {
  return (Object.keys(INTERACTION_AGE_RESTRICTIONS) as InteractionType[])
    .filter(type => isInteractionAvailable(type, playerAge));
};

// Kilitli etkileşim için mesaj getir
export const getLockedMessage = (type: InteractionType): string => {
  return INTERACTION_AGE_RESTRICTIONS[type]?.lockedMessage || 'Bu etkileşim kilitli';
};

// Sosyal menünün kendisi için minimum yaş (en düşük etkileşim yaşı)
export const SOCIAL_MENU_MIN_AGE = 3;
