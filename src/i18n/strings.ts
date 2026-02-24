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
      turnAdvanceError: 'Tur ilerliyor: HATA - advanceTurn sirasinda bir sorun olustu',
      resetFailed: 'Sifirlarken hata olustu.',
    },
    onboarding: {
      welcome: "Yazgi'ya Hosgeldin!",
      skip: 'Atla',
      next: 'Ileri',
      finish: 'Basla',
    },
    gameOver: {
      title: 'Oyun Bitti',
      subtitle: 'Bir hayat daha tukendi...',
      restart: 'Yeni Hayat',
      viewStats: 'Istatistikleri Gor',
    },

    // ---- LABELS ----
    labels: {
      stats: {
        health: 'Saglik',
        energy: 'Enerji',
        intelligence: 'Zeka',
        charisma: 'Karizma',
        discipline: 'Disiplin',
        money: 'Para',
        familyRelation: 'Aile',
      },
      skills: {
        coding: 'Yazilim',
        music: 'Muzik',
        sports: 'Spor',
        design: 'Tasarim',
        athletics: 'Atletizm',
        logic: 'Mantik',
        reading: 'Okuma',
        teamwork: 'Takim',
        art: 'Sanat',
        writing: 'Yazarlik',
        work_ethic: 'Caliskanlik',
        business: 'Is',
      },
      grades: {
        math: 'Matematik',
        science: 'Fen Bilgisi',
        language: 'Dil',
        turkish: 'Turkce',
        history: 'Tarih',
        geography: 'Cografya',
        art: 'Sanat',
        music: 'Muzik',
      },
      personality: {
        openness: 'Aciklik',
        courage: 'Cesaret',
        empathy: 'Empati',
        patience: 'Sabir',
        conformity: 'Uyum',
      },
      pillars: {
        body: 'Beden',
        mind: 'Zihin',
        soul: 'Ruh',
        wealth: 'Servet',
      },
      choiceTypes: {
        PASSIVE: 'Guvenli tercih',
        CHALLENGE: 'Zorlayici tercih',
        BREAKDOWN: 'Stres patlamasi',
        NEUTRAL: 'Notr tercih',
      },
      fate: {
        CURSED: 'Kotu sans',
        UNLUCKY: 'Sanssiz',
        NEUTRAL: 'Notr sans',
        FORTUNATE: 'Iyi sans',
        BLESSED: 'Mukemmel sans',
      },
      npcRoles: {
        PARTNER: 'Sevgili',
        BEST_FRIEND: 'En Iyi Arkadas',
        FRIEND: 'Arkadas',
        ACQUAINTANCE: 'Tanidik',
        RIVAL: 'Rakip',
        ENEMY: 'Dusman',
        CRUSH: 'Hoslanilan',
      },
    },

    // ---- UI COMPONENTS ----
    ui: {
      statusHeader: {
        stressYellow: 'Yorgunluk birikmeye basliyor.',
        stressOrange: 'Dikkat: Yukunu hafiflet.',
        stressRed: 'Kriz esigindsin! Dur ve nefes al.',
        dreamComplete: 'Hayalin sana acik!',
        dreamAlmost: 'Hedefe cok yakinsin. Son hamleyi dikkatli yap.',
        dreamMid: 'Iyi gidiyorsun! Biraz daha guclendirmelisin.',
        dreamStart: 'Yolun basindasin. Gelistirmeye odaklan.',
        riskCritical: 'Kritik Risk Alarmi',
        riskOpen: 'Risk Alarmi Acik',
        riskNormal: 'Risk Seviyesi Normal',
        riskCriticalHint: 'Kritik risk! Son hamlen cok onemli.',
        riskIncreasingHint: 'Risk artiyor. Kararlarini yavasla.',
        riskNormalHint: 'Risk seviyesi kontrol altinda.',
        moneyFormatK: 'K TL',
        moneyFormat: ' TL',
        openDetails: 'detaylarini ac',
        goalUnlocksAt10: 'Hedef secimi 10 yasinda acilir.',
        selectGoalHint: 'Hedef secince izlenecek statlar burada gorunur.',
        riskAlarm: 'Risk Alarmi',
        playerDefault: 'Oyuncu',
        ageFormat: ' yasinda',
        stressLabel: ' Stres',
        notifications: 'Bildirimler',
        notificationsWithRisk: 'Bildirimler · %{risk} risk',
        viewCrisisNotification: 'Kriz bildirimini goruntule',
        detailsSuffix: ' Detaylari',
        closeDetailPanel: 'Detay panelini kapat',
        crisisApproaching: 'Kriz yaklasiyor!',
      },
      feedbackOverlay: {
        eventType: 'Event tipi: ',
        axisInfluence: ' ekseni sonucu etkiledi',
        choiceType: 'Secim tipi: ',
        statRequirement: 'Stat kosulu: ',
        skillRequirement: 'Beceri kosulu: ',
        personalityRequirement: 'Kisilik kosulu: ',
        fateInfluence: 'Kader etkisi: ',
        dramaticDecision: 'Bu karari hayatini degistirdi.',
        whyThisOutcome: 'Neden bu sonuc?',
        traitChanges: 'Ozellik degisimi',
        hints: 'Ipuclari:',
        statistics: 'Istatistikler',
        skills: 'Beceriler',
        schoolGrades: 'Okul Notlari',
        crisisRecoveryAdButton: 'Kriz toparlanma reklami izle',
        recoverPercentage: 'Stat kaybinin bir kismini geri alir',
        adPreparing: 'Reklam hazirlaniyor...',
        watchAdRecover: 'Reklam Izle: Kaybin %50sini Geri Al',
      },
      adLoading: 'Reklam yukleniyor...',
      cardPreparing: 'Kart Hazirlaniyor...',
    },

    // ---- MESSAGES / TOASTS ----
    messages: {
      adNotShown: 'Reklam gosterilemedi',
      energyGained: '+{amount} enerji kazandin',
      energyFull: 'Enerjin zaten dolu',
      examFocusActive: 'Sinav odagi aktif: +{boost} zeka',
      focusBonusLimitReached: 'Zeka zaten maksimum, odak bonusu sinirda kaldi',
      examFocusEnded: 'Sinav odak takviyesi sona erdi',
      metNPC: '{name} ile tanistin!',
      sharingUnavailable: 'Paylasim kullanilamiyor',
      sharingNotSupported: 'Bu cihazda paylasim desteklenmiyor.',
      sharingNotReady: 'Paylasim hazir degil',
      cardCreationFailed: 'Kart olusturulamadi, tekrar dene.',
      shareTitle: 'Yazgi - Hayatimi Paylas',
      sharingFailed: 'Paylasim basarisiz',
      cardSharingFailed: 'Kart paylasimi tamamlanamadi.',
      tryAgain: 'Lutfen tekrar dene.',
      examFinished: 'Sinav Bitti!',
      examCorrect: 'Dogru: {count}',
      examGradeBonus: 'Not Bonusu: +{bonus}',
      examScore: 'Puan: {score}',
    },

    // ---- DIALOGS ----
    dialogs: {
      examPrep: {
        title: 'Sinav Hazirligi',
        description: 'Sinav oncesi reklam izleyip gecici +15 zeka odagi almak ister misin?',
      },
      outOfEnergy: {
        title: 'Enerjin bitti',
        description: 'Bir reklam izleyerek +25 enerji kazanmak ister misin?',
      },
    },

    // ---- BUTTONS ----
    buttons: {
      startDirect: 'Direkt Basla',
      watchAd: 'Reklam Izle',
      decline: 'Vazgec',
      endDay: 'Gunu Bitir',
      newGame: 'Yeni Oyun',
      shareLife: 'Hayatimi Paylas',
      watchAdAlternativeEnding: 'Reklam Izle: Alternatif Sonu Goster',
    },

    // ---- FEEDBACK / SYSTEM ----
    feedback: {
      fateTokenUsed: 'Token kullandin: yeni kaderin {outcome}.',
      fateTokenFixed: 'Token kullandin: kader sonucun {outcome} olarak sabitlendi.',
      fateTokenImproved: 'Token sayesinde sansin dondu: {from} -> {to}',
      fateTokenChanged: 'Token etkisi: {from} -> {to}',
      momentum: {
        streakBroken: '{tendency} ritmi kirildi!',
        highMomentum: '+{percent}% Momentum Bonusu!',
      },
    },

    // ---- ENDINGS ----
    endings: {
      title: 'Yolun Sonu',
      discoveredCount: '{discovered} / {total} son kesfedildi',
      completedAge: '{name} {age} yasini tamamladi',
      analysisTitle: 'Sonuc Analizi',
      compatibilityScore: 'Hedef Uyumu',
      errorDebt: 'Hata Borcu',
      traits: 'Ozellik',
      goalLabel: 'Hedef',
      activeCalculation: 'Aktif hesaplama: ',
      unexpectedPath: 'Beklenmedik Yol: secilen hedeften farkli olarak {inferred} rotasinda daha guclu bir profil olusturdun.',
      criticalDebts: 'Kritik borclar: ',
      achievementImpact: 'Basarim Etkisi',
      gainedTraits: 'Kazanilan Ozellikler',
      relationships: 'Iliskiler',
      metAtAge: ' yasinda tanistin',
      friendshipYears: ' yillik dostluk',
      neverMadeUp: 'hic barismadin',
      legacy: 'Legacy',
      runLegacyPoints: 'Bu kosu: +{points} legacy puani',
      totalRunsLevel: 'Toplam kosu: {runs} | Seviye: {level}',
      totalLegacyPoints: 'Toplam legacy puani: ',
      remainingLife: 'Hayatinin Geri Kalani',
      in20Years: '20 yil sonra',
      futureMood: 'Gelecek ruh hali: ',
      whatIfDifferent: 'Peki ya farkli secseydin?',
      alternativeEndingTitle: 'Alternatif Son ({goal})',
      goals: {
        ACADEMIC: 'Akademik Hedef',
        CREATIVE: 'Yaratici Hedef',
        ATHLETIC: 'Atletik Hedef',
        SOCIAL: 'Sosyal Hedef',
        ENTERPRISE: 'Girisim Hedefi',
        BALANCED: 'Dengeli Hedef',
      },
      personalities: {
        HELPFUL: 'Insanlarla kurdugu baglari hayatinin her kosesine isledi. Veriverdi, bazen kendine bile firsat birakmadan.',
        PRAGMATIC: 'Hesapli adimlar atti. Her kararinda mantik vardi; duygular geride kalirdi.',
        AGGRESSIVE: 'Sinirlarini sert cizdi. Bu ona hem guc hem bedel getirdi.',
      },
      suggestions: {
        ACADEMIC: '"Sanatci" yolunu denemeyi dusundun mu hic?',
        CREATIVE: '"Sporcu" ruhuyla bambaska bir hikaye seni bekliyor.',
        ATHLETIC: '"Akademisyen" gozlukleriyle dunyayi nasil gorurdun acaba?',
        SOCIAL: '"Girisimci" modunda ne kadar farkli olurdun?',
        ENTERPRISE: '"Sosyal" onceliklerle ne degisirdi?',
        BALANCED: 'Bir hedefi tum kalbinle benimseseydin?',
      },
      errorReasons: {
        healthWeak: 'Saglik dengesi zayif',
        disciplineGap: 'Disiplin acigi var',
        socialLow: 'Sosyal destek dusuk',
        academicWeak: 'Akademik temel zayif',
        financialBuffer: 'Finansal tampon kucuk',
        stressHigh: 'Stres seviyesi yuksek',
        overextensionDebt: 'Asiri tempo hata borcunu buyuttu',
      },
      tiers: {
        LEGENDARY: 'Efsanevi',
        SUCCESS: 'Basarili',
        NORMAL: 'Normal',
        FAILURE: 'Basarisiz',
        UNEXPECTED_PATH: 'Beklenmedik Yol',
      },
    },
  },

  // ================================================================
  // ENGLISH
  // ================================================================
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
      turnAdvanceError: 'Turn error: something went wrong during advanceTurn',
      resetFailed: 'An error occurred while resetting.',
    },
    onboarding: {
      welcome: 'Welcome to Yazgi!',
      skip: 'Skip',
      next: 'Next',
      finish: 'Start',
    },
    gameOver: {
      title: 'Game Over',
      subtitle: 'Another life lived...',
      restart: 'New Life',
      viewStats: 'View Stats',
    },

    // ---- LABELS ----
    labels: {
      stats: {
        health: 'Health',
        energy: 'Energy',
        intelligence: 'Intelligence',
        charisma: 'Charisma',
        discipline: 'Discipline',
        money: 'Money',
        familyRelation: 'Family',
      },
      skills: {
        coding: 'Coding',
        music: 'Music',
        sports: 'Sports',
        design: 'Design',
        athletics: 'Athletics',
        logic: 'Logic',
        reading: 'Reading',
        teamwork: 'Teamwork',
        art: 'Art',
        writing: 'Writing',
        work_ethic: 'Work Ethic',
        business: 'Business',
      },
      grades: {
        math: 'Math',
        science: 'Science',
        language: 'Language',
        turkish: 'Literature',
        history: 'History',
        geography: 'Geography',
        art: 'Art',
        music: 'Music',
      },
      personality: {
        openness: 'Openness',
        courage: 'Courage',
        empathy: 'Empathy',
        patience: 'Patience',
        conformity: 'Conformity',
      },
      pillars: {
        body: 'Body',
        mind: 'Mind',
        soul: 'Soul',
        wealth: 'Wealth',
      },
      choiceTypes: {
        PASSIVE: 'Safe choice',
        CHALLENGE: 'Bold choice',
        BREAKDOWN: 'Stress outburst',
        NEUTRAL: 'Neutral choice',
      },
      fate: {
        CURSED: 'Cursed',
        UNLUCKY: 'Unlucky',
        NEUTRAL: 'Neutral',
        FORTUNATE: 'Fortunate',
        BLESSED: 'Blessed',
      },
      npcRoles: {
        PARTNER: 'Partner',
        BEST_FRIEND: 'Best Friend',
        FRIEND: 'Friend',
        ACQUAINTANCE: 'Acquaintance',
        RIVAL: 'Rival',
        ENEMY: 'Enemy',
        CRUSH: 'Crush',
      },
    },

    // ---- UI COMPONENTS ----
    ui: {
      statusHeader: {
        stressYellow: 'Fatigue is building up.',
        stressOrange: 'Warning: Lighten your load.',
        stressRed: 'On the edge of a crisis! Stop and breathe.',
        dreamComplete: 'Your dream is within reach!',
        dreamAlmost: 'So close to your goal. Make your last move carefully.',
        dreamMid: 'Going well! Push a little harder.',
        dreamStart: 'Just getting started. Focus on growing.',
        riskCritical: 'Critical Risk Alert',
        riskOpen: 'Risk Alert Active',
        riskNormal: 'Risk Level Normal',
        riskCriticalHint: 'Critical risk! Your next move matters most.',
        riskIncreasingHint: 'Risk is rising. Slow down your decisions.',
        riskNormalHint: 'Risk level is under control.',
        moneyFormatK: 'K',
        moneyFormat: '',
        openDetails: 'open details',
        goalUnlocksAt10: 'Goal selection unlocks at age 10.',
        selectGoalHint: 'Stats to track will appear here after selecting a goal.',
        riskAlarm: 'Risk Alarm',
        playerDefault: 'Player',
        ageFormat: ' years old',
        stressLabel: ' Stress',
        notifications: 'Notifications',
        notificationsWithRisk: 'Notifications · {risk}% risk',
        viewCrisisNotification: 'View crisis notification',
        detailsSuffix: ' Details',
        closeDetailPanel: 'Close detail panel',
        crisisApproaching: 'Crisis approaching!',
      },
      feedbackOverlay: {
        eventType: 'Event type: ',
        axisInfluence: ' axis influenced the outcome',
        choiceType: 'Choice type: ',
        statRequirement: 'Stat requirement: ',
        skillRequirement: 'Skill requirement: ',
        personalityRequirement: 'Personality requirement: ',
        fateInfluence: 'Fate influence: ',
        dramaticDecision: 'This decision changed your life.',
        whyThisOutcome: 'Why this outcome?',
        traitChanges: 'Trait changes',
        hints: 'Hints:',
        statistics: 'Statistics',
        skills: 'Skills',
        schoolGrades: 'School Grades',
        crisisRecoveryAdButton: 'Watch ad for crisis recovery',
        recoverPercentage: 'Recover part of your stat loss',
        adPreparing: 'Preparing ad...',
        watchAdRecover: 'Watch Ad: Recover 50% of Loss',
      },
      adLoading: 'Loading ad...',
      cardPreparing: 'Preparing card...',
    },

    // ---- MESSAGES / TOASTS ----
    messages: {
      adNotShown: 'Ad could not be shown',
      energyGained: '+{amount} energy gained',
      energyFull: 'Energy is already full',
      examFocusActive: 'Exam focus active: +{boost} intelligence',
      focusBonusLimitReached: 'Intelligence is maxed, focus bonus capped',
      examFocusEnded: 'Exam focus boost has ended',
      metNPC: 'You met {name}!',
      sharingUnavailable: 'Sharing unavailable',
      sharingNotSupported: 'Sharing is not supported on this device.',
      sharingNotReady: 'Sharing not ready',
      cardCreationFailed: 'Could not create card, try again.',
      shareTitle: 'Yazgi - Share My Life',
      sharingFailed: 'Sharing failed',
      cardSharingFailed: 'Card sharing could not be completed.',
      tryAgain: 'Please try again.',
      examFinished: 'Exam Done!',
      examCorrect: 'Correct: {count}',
      examGradeBonus: 'Grade Bonus: +{bonus}',
      examScore: 'Score: {score}',
    },

    // ---- DIALOGS ----
    dialogs: {
      examPrep: {
        title: 'Exam Preparation',
        description: 'Watch an ad before the exam for a temporary +15 intelligence boost?',
      },
      outOfEnergy: {
        title: 'Out of energy',
        description: 'Watch an ad to gain +25 energy?',
      },
    },

    // ---- BUTTONS ----
    buttons: {
      startDirect: 'Start Now',
      watchAd: 'Watch Ad',
      decline: 'No Thanks',
      endDay: 'End Day',
      newGame: 'New Game',
      shareLife: 'Share My Life',
      watchAdAlternativeEnding: 'Watch Ad: Show Alternate Ending',
    },

    // ---- FEEDBACK / SYSTEM ----
    feedback: {
      fateTokenUsed: 'Token used: your new fate is {outcome}.',
      fateTokenFixed: 'Token used: fate locked to {outcome}.',
      fateTokenImproved: 'Token turned your luck around: {from} -> {to}',
      fateTokenChanged: 'Token effect: {from} -> {to}',
      momentum: {
        streakBroken: '{tendency} streak broken!',
        highMomentum: '+{percent}% Momentum Bonus!',
      },
    },

    // ---- ENDINGS ----
    endings: {
      title: 'End of the Road',
      discoveredCount: '{discovered} / {total} endings discovered',
      completedAge: '{name} completed age {age}',
      analysisTitle: 'Results Analysis',
      compatibilityScore: 'Goal Compatibility',
      errorDebt: 'Error Debt',
      traits: 'Traits',
      goalLabel: 'Goal',
      activeCalculation: 'Active calculation: ',
      unexpectedPath: 'Unexpected Path: instead of your chosen goal, you built a stronger profile on the {inferred} track.',
      criticalDebts: 'Critical debts: ',
      achievementImpact: 'Achievement Impact',
      gainedTraits: 'Traits Gained',
      relationships: 'Relationships',
      metAtAge: ' met at age',
      friendshipYears: ' years of friendship',
      neverMadeUp: 'never reconciled',
      legacy: 'Legacy',
      runLegacyPoints: 'This run: +{points} legacy points',
      totalRunsLevel: 'Total runs: {runs} | Level: {level}',
      totalLegacyPoints: 'Total legacy points: ',
      remainingLife: 'The Rest of Your Life',
      in20Years: '20 years later',
      futureMood: 'Future mood: ',
      whatIfDifferent: 'What if you had chosen differently?',
      alternativeEndingTitle: 'Alternate Ending ({goal})',
      goals: {
        ACADEMIC: 'Academic Path',
        CREATIVE: 'Creative Path',
        ATHLETIC: 'Athletic Path',
        SOCIAL: 'Social Path',
        ENTERPRISE: 'Entrepreneur Path',
        BALANCED: 'Balanced Path',
      },
      personalities: {
        HELPFUL: 'The bonds you built with people seeped into every corner of your life. You gave freely, sometimes without leaving room for yourself.',
        PRAGMATIC: 'You took calculated steps. Logic was in every decision; emotions took a back seat.',
        AGGRESSIVE: 'You drew your boundaries hard. It brought you both power and a price.',
      },
      suggestions: {
        ACADEMIC: 'Ever thought about trying the "Artist" path?',
        CREATIVE: 'A whole different story awaits you with the "Athlete" spirit.',
        ATHLETIC: 'How would you see the world through "Scholar" glasses?',
        SOCIAL: 'How different would you be in "Entrepreneur" mode?',
        ENTERPRISE: 'What would change with "Social" priorities?',
        BALANCED: 'What if you embraced one goal with all your heart?',
      },
      errorReasons: {
        healthWeak: 'Health balance is weak',
        disciplineGap: 'Discipline gap detected',
        socialLow: 'Social support is low',
        academicWeak: 'Academic foundation is weak',
        financialBuffer: 'Financial buffer is small',
        stressHigh: 'Stress level is high',
        overextensionDebt: 'Excessive pace increased error debt',
      },
      tiers: {
        LEGENDARY: 'Legendary',
        SUCCESS: 'Successful',
        NORMAL: 'Normal',
        FAILURE: 'Failed',
        UNEXPECTED_PATH: 'Unexpected Path',
      },
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
