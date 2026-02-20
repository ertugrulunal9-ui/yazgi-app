export type AppLocale = 'tr' | 'en';

type Primitive = string | number | boolean;
type NestedRecord = {
  [key: string]: Primitive | NestedRecord;
};

export const DEFAULT_LOCALE: AppLocale = 'tr';

export const strings: Record<AppLocale, NestedRecord> = {
  tr: {
    common: {
      continue: 'Devam Et',
      reading: 'Okunuyor...',
      close: 'Kapat',
      back: 'Geri',
      saveLoad: 'Kaydet / Yukle',
    },
    tabs: {
      hub: 'Ana Sayfa',
      character: 'Karakter',
      skilltree: 'Yetenekler',
      social: 'Sosyal',
    },
    game: {
      endDay: 'Gunu Bitir',
      whatDoYouWant: 'Ne yapmak istersin?',
    },
    settings: {
      title: 'Ayarlar',
      theme: 'Tema Secin',
      density: 'Yogunluk',
      motion: 'Hareket',
      audio: 'Ses',
      muteAudio: 'Sesleri Kapat',
      audioMutedState: 'Tum oyun sesleri kapali',
      audioEnabledState: 'Muzik ve efektler acik',
      privacy: 'Gizlilik',
      analyticsOptIn: 'Davranis Analitigi',
      analyticsOptInEnabled: 'Paylasim acik',
      analyticsOptInDisabled: 'Paylasim kapali',
      personalizedAds: 'Kisisellestirilmis Reklam',
      personalizedAdsEnabled: 'Kisisellestirilmis reklam acik',
      personalizedAdsDisabled: 'Kisisellestirilmemis reklam',
      reduceMotion: 'Gecisleri Azalt',
      saves: 'Kayitlar',
      language: 'Dil',
      newLife: 'Yeni Hayata Basla',
      themeOptions: {
        light: 'Acik',
        dark: 'Koyu',
        system: 'Sistem',
      },
      densityOptions: {
        compact: 'Kucuk',
        standard: 'Normal',
        comfort: 'Buyuk',
      },
      languageOptions: {
        tr: 'Turkce',
        en: 'English',
      },
    },
    event: {
      statChanges: 'Istatistikler',
      skillChanges: 'Beceriler',
      gradeChanges: 'Okul Notlari',
      defaultFeedback: 'Devam ediyorsun...',
      choose: 'Bir secenek sec',
    },
    errors: {
      saveFailed: 'Kayit basarisiz oldu. Tekrar denenecek.',
      loadFailed: 'Kayit yuklenemedi. Lutfen tekrar dene.',
      genericError: 'Bir hata olustu. Lutfen uygulamayi yeniden baslat.',
      networkError: 'Baglanti hatasi. Cevrimici ozellikler gecici olarak devre disi.',
    },
    gameOver: {
      title: 'Oyun Bitti',
      subtitle: 'Bir hayat daha tukendi...',
      restart: 'Yeni Hayat',
      viewStats: 'Istatistikleri Gor',
    },
    shop: {
      title: 'Magaza',
      buy: 'Satin Al',
      restore: 'Satin Alimlari Geri Yukle',
      premiumTraits: 'Ozel Ozellikler',
      saveSlots: 'Kayit Slotlari',
      cosmeticsPack: 'Kozmetik Paket',
      energyRefill: 'Enerji Dolumu',
      seasonPass: 'Sezon Pasi',
      removeAds: 'Reklamlari Kaldir',
    },
    onboarding: {
      welcome: "Yazgi'ya Hosgeldin!",
      skip: 'Atla',
      next: 'Ileri',
      finish: 'Basla',
    },
  },
  en: {
    common: {
      continue: 'Continue',
      reading: 'Reading...',
      close: 'Close',
      back: 'Back',
      saveLoad: 'Save / Load',
    },
    tabs: {
      hub: 'Home',
      character: 'Character',
      skilltree: 'Skills',
      social: 'Social',
    },
    game: {
      endDay: 'End Day',
      whatDoYouWant: 'What do you want to do?',
    },
    settings: {
      title: 'Settings',
      theme: 'Theme',
      density: 'Density',
      motion: 'Motion',
      audio: 'Audio',
      muteAudio: 'Mute All Sounds',
      audioMutedState: 'All game audio is muted',
      audioEnabledState: 'Music and effects are enabled',
      privacy: 'Privacy',
      analyticsOptIn: 'Behavior Analytics',
      analyticsOptInEnabled: 'Sharing enabled',
      analyticsOptInDisabled: 'Sharing disabled',
      personalizedAds: 'Personalized Ads',
      personalizedAdsEnabled: 'Personalized ads enabled',
      personalizedAdsDisabled: 'Non-personalized ads',
      reduceMotion: 'Reduce Motion',
      saves: 'Saves',
      language: 'Language',
      newLife: 'Start New Life',
      themeOptions: {
        light: 'Light',
        dark: 'Dark',
        system: 'System',
      },
      densityOptions: {
        compact: 'Compact',
        standard: 'Standard',
        comfort: 'Comfort',
      },
      languageOptions: {
        tr: 'Turkish',
        en: 'English',
      },
    },
    event: {
      statChanges: 'Stat Changes',
      skillChanges: 'Skill Changes',
      gradeChanges: 'School Grades',
      defaultFeedback: 'You continue...',
      choose: 'Choose an option',
    },
    errors: {
      saveFailed: 'Save failed. Retrying...',
      loadFailed: 'Could not load save. Please try again.',
      genericError: 'Something went wrong. Please restart the app.',
      networkError: 'Connection error. Online features are temporarily unavailable.',
    },
    gameOver: {
      title: 'Game Over',
      subtitle: 'Another life lived...',
      restart: 'New Life',
      viewStats: 'View Stats',
    },
    shop: {
      title: 'Shop',
      buy: 'Buy',
      restore: 'Restore Purchases',
      premiumTraits: 'Premium Traits',
      saveSlots: 'Save Slots',
      cosmeticsPack: 'Cosmetics Pack',
      energyRefill: 'Energy Refill',
      seasonPass: 'Season Pass',
      removeAds: 'Remove Ads',
    },
    onboarding: {
      welcome: 'Welcome to Yazgı!',
      skip: 'Skip',
      next: 'Next',
      finish: 'Start',
    },
  },
};

const getByPath = (record: NestedRecord, path: string): Primitive | NestedRecord | undefined => {
  const parts = path.split('.');
  let current: Primitive | NestedRecord | undefined = record;

  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return undefined;
    }
    current = (current as NestedRecord)[part];
  }

  return current;
};

const interpolate = (value: string, params?: Record<string, Primitive>): string => {
  if (!params) return value;

  return value.replace(/\{(\w+)\}/g, (_, token: string) => {
    const raw = params[token];
    return raw === undefined ? `{${token}}` : String(raw);
  });
};

export const t = (
  locale: AppLocale,
  key: string,
  params?: Record<string, Primitive>,
  fallback?: string
): string => {
  const localizedValue = getByPath(strings[locale], key);
  if (typeof localizedValue === 'string') {
    return interpolate(localizedValue, params);
  }

  const fallbackValue = getByPath(strings[DEFAULT_LOCALE], key);
  if (typeof fallbackValue === 'string') {
    return interpolate(fallbackValue, params);
  }

  if (fallback) return interpolate(fallback, params);
  return key;
};
