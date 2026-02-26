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
      endDayHint: 'Siradaki tura gecer',
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
        en: 'Ingilizce',
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
        dreamMid: 'Iyi gidiyorsun! {statHint} biraz daha guclendir.',
        dreamStart: 'Yolun basindasin. {statHint} gelistirmeye odaklan.',
        dreamTracker: 'Hayal Takibi',
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
        toggleNotificationsPanel: 'Bildirim panelini ac veya kapat',
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
      fateLabels: {
        CURSED: 'Lanetli',
        UNLUCKY: 'Sanssiz',
        NEUTRAL: 'Notr',
        FORTUNATE: 'Sansli',
        BLESSED: 'Kutsanmis',
      },
      fateTokenUsed: 'Token kullandin: yeni kaderin {outcome}.',
      fateTokenFixed: 'Token kullandin: kader sonucun {outcome} olarak sabitlendi.',
      fateTokenImproved: 'Token sayesinde sansin dondu: {from} -> {to}',
      fateTokenChanged: 'Token etkisi: {from} -> {to}',
      momentum: {
        streakBroken: '{tendency} ritmi kirildi!',
        highMomentum: '+{percent}% Momentum Bonusu!',
        strengthening: '{tendency} ritmi gucleniyor!',
        tendencies: {
          HELPFUL: 'Yardimsever',
          PRAGMATIC: 'Pragmatik',
          AGGRESSIVE: 'Agresif',
        },
        flavor: {
          HELPFUL: 'Yardimsever ruhun gucleniyor!',
          PRAGMATIC: 'Pragmatik ruhun gucleniyor!',
          AGGRESSIVE: 'Agresif ruhun gucleniyor!',
        },
      },
    },

    // ---- ENDINGS ----
    endings: {
      title: 'Yolun Sonu',
      discoveredCount: '{discovered} / {total} son kesfedildi',
      completedAge: '{name} {age} yasini tamamladi',
      noGoalSelected: 'Hedef Secilmedi (Otomatik Rota)',
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
      legacy: 'Miras',
      runLegacyPoints: 'Bu kosu: +{points} legacy puani',
      totalRunsLevel: 'Toplam kosu: {runs} | Seviye: {level}',
      totalLegacyPoints: 'Toplam legacy puani: ',
      remainingLife: 'Hayatinin Geri Kalani',
      in20Years: '20 yil sonra',
      futureMood: 'Gelecek ruh hali: ',
      whatIfDifferent: 'Peki ya farkli secseydin?',
      alternativeEndingTitle: 'Alternatif Son ({goal})',
      secretDiscovered: 'Gizli bir sonla tanistin!',
      influenceGoal: 'Hedef: {goal}',
      influenceCompatibility: 'Hedef uyumu: %{score}',
      influenceErrorDebt: 'Hata borcu: {debt}',
      mismatchNote: 'Beklenmedik yol: Secilen hedefte uyum %{selectedScore}, gelistirdigin rota {inferred} ile %{compatibilityScore} uyum yakaladi.',
      difficultyAdjustment: 'Zorluk duzeltmesi: {value}',
      versatilityPenalty: 'Cesitlilik cezasi: -{penalty} (entropi %{entropy}, baskin kategori %{dominant})',
      routeDeviationPenalty: 'Rota sapmasi cezasi: -{penalty}',
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
        DEFAULT: 'Kendi yolunu kendi biciminde yurudu.',
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
        NORMAL: 'Dengeli',
        FAILURE: 'Basarisiz',
        UNEXPECTED_PATH: 'Beklenmedik Yol',
      },
      catalog: {
        titleTemplate: '{goal} - {tier}',
        mismatchTitle: '{goal} - Beklenmedik Yol',
        goals: {
          ACADEMIC: 'Akademik Yol',
          CREATIVE: 'Yaratici Yol',
          ATHLETIC: 'Atletik Yol',
          SOCIAL: 'Sosyal Yol',
          ENTERPRISE: 'Girisim Yolu',
          BALANCED: 'Dengeli Yol',
        },
        tiers: {
          FAILURE: 'Zor Son',
          NORMAL: 'Dengeli Son',
          SUCCESS: 'Basari Sonu',
          LEGENDARY: 'Efsane Son',
        },
      },
      content: {
        flavor: {
          richSaverDistant: 'Paran var ama paylasim yerine biriktirmeyi seciyorsun; cevren seni mesafeli buluyor.',
          richLonely: 'Paran var ama etrafinda gercekten guvendigin insanlar cok az.',
          heartbreaker: 'Iliskilerde biraktigin kirik izler bugune kadar tasindi.',
          rebel: 'Kurallara direnen tavrin hayatina hem hiz hem bedel getirdi.',
          failureResilience: 'Disiplinli gecmisin, bir sonraki denemede oyunu cevirmen icin guclu bir temel sunuyor.',
          perfectionist: 'Mukemmeliyetci rutinin bu sonucu bir tesaduf olmaktan cikardi.',
        },
        mismatch: {
          title: 'Surpriz Kariyer',
          description: '{selectedGoal} hedefini secmistin; hayat cizgin {inferredGoal} yonune acildi. Yeni rotanda {career} yolunu yakaladin.',
          familyReaction: 'Ailen, rota degisse de dogru ritmi yakaladigini dusunuyor.',
          newRoute: 'Yeni rota: {career}',
        },
        careers: {
          failureUnemployed: {
            title: 'Mezuna Kaldin / Issiz',
            description: 'Sinav sonucun bekledigin gibi gelmedi.',
            familyReaction: 'Evde derin bir sessizlik var.',
          },
          nationalAthlete: {
            title: 'Milli Sporcu',
            description: 'Yillar suren antrenmanlarinin karsiligini aldin. Olimpiyatlara hazirlaniyorsun!',
            familyReaction: 'Ailen kupalarini gururla sergiliyor.',
          },
          rockstarVirtuoso: {
            title: 'Rockstar / Virtuoz',
            description: 'Konservatuari dereceyle bitirdin. Albumlerin yok satiyor.',
            familyReaction: 'Ailen her konserinde en onde.',
            influences: {
              0: 'Muzik notun ({grade}) konservatuar yolunu guclendirdi.',
            },
          },
          medSchool: {
            title: 'Tip Fakultesi',
            description: 'Ulkenin prestijli tip fakultelerinden birini kazandin.',
            familyReaction: 'Ailen herkese doktor olacagini anlatiyor.',
          },
          softwareEngineering: {
            title: 'Yazilim Muhendisligi',
            description: 'Kodlama yetenegin seni teknoloji dunyasina tasidi.',
            familyReaction: 'Ailen bilgisayar basindaki emeginin karsiligini aldigini soyluyor.',
          },
          lawSchool: {
            title: 'Hukuk Fakultesi',
            description: 'Keskin zekan ve hitabetinle hukuk yoluna girdin.',
            familyReaction: 'Ailen hukuktaki gelecegine guveniyor.',
          },
          privateUniversityBusiness: {
            title: 'Ozel Uni - Isletme',
            description: 'Notlarin parlak olmasa da finansal gucunle iyi bir baslangic yaptin.',
            familyReaction: 'Ailen: Diploma diplomadir diyor.',
          },
          rescuePilot: {
            title: 'Kurtarma Pilotu',
            description: 'Cesaretin ve fiziksel gucun seni havacilik yoluna tasidi.',
            familyReaction: 'Ailen cesaretinle hep ovundu.',
          },
          sportsCoach: {
            title: 'Spor Egitmeni',
            description: 'Sabrin ve takim ruhu anlayisin seni genc sporculara yol gosteren bir egitmene donusturdu.',
            familyReaction: 'Ailen ogrencilerinin basarisini seninle birlikte kutluyor.',
          },
          esportsPlayer: {
            title: 'E-Spor Oyuncusu',
            description: 'Dijital reflekslerin ve disiplinli antrenman rutinin seni profesyonel e-spor sahnesine tasidi.',
            familyReaction: 'Ailen bilgisayar basinda gecirdigin saatlerin sonucunu gormeye basliyor.',
          },
          stageMusician: {
            title: 'Sahne Muzisyeni',
            description: 'Sahnede parladin; akademik muzik notlarin konservatuar seviyesine cikamadi.',
            familyReaction: 'Ailen sahnede kendini bulmana seviniyor.',
            influences: {
              0: 'Muzik notun ({grade}) akademik yolu sinirladi.',
            },
          },
          artist: {
            title: 'Sanatci',
            description: 'Sergilerin kapali gise. Eserlerin koleksiyonerler tarafindan kapisiliyor.',
            familyReaction: 'Ailen eserlerini duvarlarina asiyor.',
            influences: {
              0: 'Gorsel sanatlar notun ({grade}) sergi kapilarini acti.',
            },
          },
          atelierArtist: {
            title: 'Atolye Sanatcisi',
            description: 'Uretim disiplininle kendi stilini kurdun; bagimsiz atolyelerde adin duyuluyor.',
            familyReaction: 'Ailen atolyene destek oluyor.',
            influences: {
              0: 'Gorsel sanatlar notun ({grade}) akademik destegi zayiflatti.',
            },
          },
          famousWriter: {
            title: 'Unlu Yazar',
            description: 'Kitaplarin cok satanlar listesinde. Imza gunlerinde uzun kuyruklar var.',
            familyReaction: 'Ailen raflarda adini gormekten gururlu.',
          },
          digitalArtist: {
            title: 'Dijital Sanatci',
            description: 'Yaraticiligin dijital dunyada karsilik buldu; projelerinle fark yaratiyorsun.',
            familyReaction: 'Ailen eserlerini sosyal medyada paylasiyor.',
          },
          contentCreator: {
            title: 'Icerik Uretici',
            description: 'Kameranin onunde dogal bir yetenegin var. Dijital platformlarda kendi kitlesini olusturuyorsun.',
            familyReaction: 'Ailen videolarini izleyip gururlaniyor.',
          },
          fashionDesigner: {
            title: 'Moda Tasarimcisi',
            description: 'Estetik gorusun ve tasarim yetenegin seni moda dunyasina tasidi.',
            familyReaction: 'Ailen koleksiyonlarini merakla takip ediyor.',
          },
          mediaIcon: {
            title: 'Medya Ikonu',
            description: 'Insanlarla kurdugun baglar seni gorunur bir figure donusturdu.',
            familyReaction: 'Ailen herkesin seni tanimasindan gurur duyuyor.',
          },
          psychologist: {
            title: 'Psikolog',
            description: 'Insanlari anlama yetenegin seni psikoloji yoluna tasidi.',
            familyReaction: 'Ailen: Her zaman insanlari anlardi diyor.',
          },
          socialEntrepreneur: {
            title: 'Sosyal Girisimci',
            description: 'Toplumsal sorunlara cozum uretme tutkunla kendi sosyal girisimini kurdun.',
            familyReaction: 'Ailen hem isine hem ideallerine hayran.',
          },
          diplomat: {
            title: 'Diplomat',
            description: 'Sabrin, uzlasma yetenegin ve dil becerilerin seni diplomasi yoluna yoneltti.',
            familyReaction: 'Ailen diplomatik yeteneklerinle gurur duyuyor.',
          },
          entrepreneur: {
            title: 'Girisimci',
            description: 'Ticari zekanla kendi isini kurdun. Fikirlerin para ediyor.',
            familyReaction: 'Ailen isini merakla takip ediyor.',
          },
          financeSpecialist: {
            title: 'Finans Uzmani',
            description: 'Sayilarla aran ve sogukkanliligin seni finans sektorune yonlendirdi.',
            familyReaction: 'Ailen piyasa haberlerini seninle konusmayi seviyor.',
          },
          startupFounder: {
            title: 'Startup Kurucusu',
            description: 'Teknik bilgin ve girisimci ruhun seni kendi teknoloji sirketini kurmaya yoneltti.',
            familyReaction: 'Ailen sirketini heyecanla takip ediyor.',
          },
          engineering: {
            title: 'Muhendislik',
            description: 'Analitik dusuncen seni muhendislik yoluna tasidi.',
            familyReaction: 'Ailen sayilarla olan bagini hep konusuyordu.',
          },
          researcher: {
            title: 'Arastirmaci',
            description: 'Merakli zihnin ve disiplinli calisma aliskanliklarin seni akademik arastirma yoluna tasidi.',
            familyReaction: 'Ailen laboratuvardaki saatlerini saygiyla karsiluyor.',
          },
          teacher: {
            title: 'Ogretmen',
            description: 'Sabrin ve empatin seni genc nesillere bilgi aktaran bir ogretmene donusturdu.',
            familyReaction: 'Ailen ogrencilerinin sevgisini gormeye bayiliyor.',
          },
          versatileProfessional: {
            title: 'Cok Yonlu Profesyonel',
            description: 'Tek bir alana kapanmak yerine bircok beceriyi harmanladin. Farkli sektorlerden teklifler aliyorsun.',
            familyReaction: 'Ailen: Her konuda bi bilgisi var diyor gururla.',
          },
          civicLeader: {
            title: 'Sivil Toplum Lideri',
            description: 'Insanlari bir araya getirme yeteneginle toplumsal degisime oncuulk ediyorsun.',
            familyReaction: 'Ailen topluma katkin icin gururlu.',
          },
          officer: {
            title: 'Subay',
            description: 'Disiplinin ve duzene saygin seni askerlik yoluna yoneltti.',
            familyReaction: 'Ailen: Kurallara hep saygiliydi diyor.',
          },
          economicsPublicAdmin: {
            title: 'Iktisat / Kamu Yonetimi',
            description: 'Dengeli bir profil ile universite yolunu acik tuttun.',
            familyReaction: 'Ailen en azindan iyi bir temel kurdugunu dusunuyor.',
          },
          secretTrueBalance: {
            title: 'Gercek Denge Ustasi',
            description: 'Hayatin her alaninda denge buldun. Bu basari cok az kisiye nasip olur.',
            familyReaction: 'Ailen her alanda dengeli gelisiminden muhtesem gurur duyuyor.',
          },
          secretFamilyLegacy: {
            title: 'Aile Mirasini Geri Kazan',
            description: 'Ailenle kurdugun derin bag hayatinin en degerli mirasi oldu.',
            familyReaction: 'Ailen: Sen bizim en buyuk gururumuzsun.',
          },
          secretFateBreaker: {
            title: 'Kader Kirici',
            description: 'Kaderin sana bictigini kabul etmedin. Kendi yolunu kendin cizdin.',
            familyReaction: 'Ailen: O hep kendi yolunu buldu diyor.',
          },
          secretLoveAndGlory: {
            title: 'Ask ve Zafer',
            description: 'Hem kalbin hem aklin dolu. Ask ve basariyi ayni anda yakaladin.',
            familyReaction: 'Ailen hem iliskinden hem basarindan mutlu.',
          },
          secretSilentLegend: {
            title: 'Sessiz Efsane',
            description: 'Kimseye ihtiyac duymadan kendi yolunda sessizce efsanelesen biri oldun.',
            familyReaction: 'Ailen: O hep kendi halinde ama cok yetenekli diyor.',
          },
        },
        futureVision: {
          defaultName: 'Sen',
          goals: {
            ACADEMIC: {
              at30: {
                v1: '{name}, 30 yasinda arastirma masasinda gecirdigin uzun geceler meyvesini veriyor. Calismalarin seni alaninda guvenilen bir sese donusturuyor.',
                v2: '{name}, 30 yasinda derslik ile laboratuvar arasinda kurdugun denge meyve veriyor. Urettigin fikirler genc zihinlere yeni kapilar aciyor.',
              },
              at50: {
                v1: '{name}, 50 yasinda yetistirdigin ogrenciler senin izini surmeye devam ediyor.',
                v2: '{name}, 50 yasinda adin bilgiyle anilan bir okulun temel taslarindan biri oluyor.',
              },
            },
            CREATIVE: {
              at30: {
                v1: '{name}, 30 yasinda hayal gucun somut projelere donusuyor. Eserlerin izleyicilerde iz birakan bir imzaya sahip oluyor.',
                v2: '{name}, 30 yasinda uretim ritmini buluyorsun. Islerin hem duyguyu hem cesareti ayni anda tasiyor.',
              },
              at50: {
                v1: '{name}, 50 yasinda bir kusagin ilham panosunda adini birakmis oluyorsun.',
                v2: '{name}, 50 yasinda eserlerin yeni sanatcilara yol haritasi olarak gosteriliyor.',
              },
            },
            ATHLETIC: {
              at30: {
                v1: '{name}, 30 yasinda disiplinin bedenine ve zihnine ayni anda yansiyor. Rekabetin icinde kalirken etrafina da tempo veriyorsun.',
                v2: '{name}, 30 yasinda antrenman rutinin hayatinin iskeleti oluyor. Zirve yarislari kadar toparlanma gunlerine de deger veriyorsun.',
              },
              at50: {
                v1: '{name}, 50 yasinda birikiminle genc sporculara yol gosteren bir isim haline geliyorsun.',
                v2: '{name}, 50 yasinda performans kadar saglam kalmanin bilgisini paylasiyorsun.',
              },
            },
            SOCIAL: {
              at30: {
                v1: '{name}, 30 yasinda insanlar arasinda kopru kuran bir role geciyorsun. Guven verdigin icin kapilar once sana aciliyor.',
                v2: '{name}, 30 yasinda iliski agin sadece kalabalik degil, ayni zamanda derin oluyor. Zor anlarda insanlar senden yon buluyor.',
              },
              at50: {
                v1: '{name}, 50 yasinda etrafinda kurdugun guven cemberi hayatinin en buyuk sermayesine donusuyor.',
                v2: '{name}, 50 yasinda bircok insan seni kriz anlarinda ilk aradigi kisi olarak goruyor.',
              },
            },
            ENTERPRISE: {
              at30: {
                v1: '{name}, 30 yasinda risk ile plan arasinda yeni bir denge kuruyorsun. Urettigin deger seni sadece kazanan degil yon veren bir oyuncu yapiyor.',
                v2: '{name}, 30 yasinda firsat kokusunu erken alan bir bakis acisi gelistiriyorsun. Dogru ekiplerle buyumeyi hizlandiriyorsun.',
              },
              at50: {
                v1: '{name}, 50 yasinda kurdugun sistemler senden sonra da islemeye devam ediyor.',
                v2: '{name}, 50 yasinda birikimin hem yatirimlara hem yeni girisimcilere can veriyor.',
              },
            },
            BALANCED: {
              at30: {
                v1: '{name}, 30 yasinda tek bir alana kapanmak yerine hayatini dengede buyutuyorsun. Is, iliski ve ic huzur arasinda kendi olcunu buluyorsun.',
                v2: '{name}, 30 yasinda farkli rolleri tasirken yorulmadan ilerlemeyi ogreniyorsun. Kucuk ama surekli adimlarin buyuk bir denge kuruyor.',
              },
              at50: {
                v1: '{name}, 50 yasinda hayatindaki uyum duygusu en guclu pusulana donusuyor.',
                v2: '{name}, 50 yasinda istikrarli yonden sapmadan ilerlemenin degerini cevrendekilere aktariyorsun.',
              },
            },
          },
          tiers: {
            LEGENDARY: {
              at30: {
                v1: 'Adin ulke sinirlarini asan bir etki alanina ulasiyor.',
                v2: 'Basarin sadece sonuclarla degil, etrafinda kurdugun standartla da konusuluyor.',
              },
              at50: {
                v1: 'Zaman gectikce hikayen bir basari olcusune donusuyor.',
                v2: 'Birakilan etki, yillara ragmen azalmadan buyuyor.',
              },
            },
            SUCCESS: {
              at30: {
                v1: 'Istikrarli adimlarin seni saglam bir zirveye tasiyor.',
                v2: 'Hizli sicramalardan cok, guvenilir ilerlemenin gucunu gostermis oluyorsun.',
              },
              at50: {
                v1: 'Emeginin uzun vadeli getirisi hayatina huzurlu bir genislik katiyor.',
                v2: 'Yillar sonra bakildiginda cizginin ne kadar saglam oldugu netlesiyor.',
              },
            },
            NORMAL: {
              at30: {
                v1: 'Yolun parlak ama olculu; fazla risk almadan yavas yavas gucleniyorsun.',
                v2: 'Buyuk patlamalar yerine duzgun ritim seni ayakta tutuyor.',
              },
              at50: {
                v1: 'Zamanla topladigin deneyim sade ama guvenilir bir hayat kuruyor.',
                v2: 'Dengenin de bir basari bicimi oldugunu en iyi sen kanitliyorsun.',
              },
            },
            FAILURE: {
              at30: {
                v1: 'Hatalarin birikimi omuzlarini zorluyor; yeniden kurmak icin sabir gerekiyor.',
                v2: 'Bazi kapilar gec aciliyor, bu da yolunu yeniden cizmeye zorluyor.',
              },
              at50: {
                v1: 'Yine de gecmisin agirligini anlamlandirdikca daha sakin bir dayaniklilik gelisiyor.',
                v2: 'Acilar silinmiyor ama onlardan dogan bilgelik hayata tutunmana yardim ediyor.',
              },
            },
          },
        },
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
      endDayHint: 'Advance to the next turn',
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
        dreamMid: 'Going well! Strengthen {statHint} a bit more.',
        dreamStart: 'Just getting started. Focus on improving {statHint}.',
        dreamTracker: 'Dream Tracker',
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
        toggleNotificationsPanel: 'Open or close notification panel',
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
      fateLabels: {
        CURSED: 'Cursed',
        UNLUCKY: 'Unlucky',
        NEUTRAL: 'Neutral',
        FORTUNATE: 'Fortunate',
        BLESSED: 'Blessed',
      },
      fateTokenUsed: 'Token used: your new fate is {outcome}.',
      fateTokenFixed: 'Token used: fate locked to {outcome}.',
      fateTokenImproved: 'Token turned your luck around: {from} -> {to}',
      fateTokenChanged: 'Token effect: {from} -> {to}',
      momentum: {
        streakBroken: '{tendency} streak broken!',
        highMomentum: '+{percent}% Momentum Bonus!',
        strengthening: '{tendency} momentum is building!',
        tendencies: {
          HELPFUL: 'Helpful',
          PRAGMATIC: 'Pragmatic',
          AGGRESSIVE: 'Aggressive',
        },
        flavor: {
          HELPFUL: 'Your helpful spirit is growing stronger!',
          PRAGMATIC: 'Your pragmatic spirit is growing stronger!',
          AGGRESSIVE: 'Your aggressive spirit is growing stronger!',
        },
      },
    },

    // ---- ENDINGS ----
    endings: {
      title: 'End of the Road',
      discoveredCount: '{discovered} / {total} endings discovered',
      completedAge: '{name} completed age {age}',
      noGoalSelected: 'No Goal Selected (Auto Path)',
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
      secretDiscovered: 'You discovered a secret ending!',
      influenceGoal: 'Goal: {goal}',
      influenceCompatibility: 'Goal compatibility: {score}%',
      influenceErrorDebt: 'Error debt: {debt}',
      mismatchNote: 'Unexpected path: selected goal compatibility was {selectedScore}%, but your developed route reached {compatibilityScore}% on {inferred}.',
      difficultyAdjustment: 'Difficulty adjustment: {value}',
      versatilityPenalty: 'Versatility penalty: -{penalty} (entropy {entropy}%, dominant category {dominant}%)',
      routeDeviationPenalty: 'Route deviation penalty: -{penalty}',
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
        DEFAULT: 'You walked your own path in your own way.',
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
      catalog: {
        titleTemplate: '{goal}: {tier}',
        mismatchTitle: '{goal} - Unexpected Path',
        goals: {
          ACADEMIC: 'Academic Path',
          CREATIVE: 'Creative Path',
          ATHLETIC: 'Athletic Path',
          SOCIAL: 'Social Path',
          ENTERPRISE: 'Entrepreneur Path',
          BALANCED: 'Balanced Path',
        },
        tiers: {
          FAILURE: 'Hard Ending',
          NORMAL: 'Steady Ending',
          SUCCESS: 'Success Ending',
          LEGENDARY: 'Legendary Ending',
        },
      },
      content: {
        flavor: {
          richSaverDistant: 'You have money, but you choose saving over sharing; people around you see you as distant.',
          richLonely: 'You have money, but very few people around you truly feel trustworthy.',
          heartbreaker: 'The broken traces you left in relationships carried into today.',
          rebel: 'Your resistance to rules brought both speed and a price to your life.',
          failureResilience: 'Your disciplined past gives you a strong foundation to turn the game around next time.',
          perfectionist: 'Your perfectionist routine made this outcome anything but luck.',
        },
        mismatch: {
          title: 'Surprise Career',
          description: 'You had chosen the {selectedGoal} goal, but your life path opened toward {inferredGoal}. On this new route, you found the {career} path.',
          familyReaction: 'Your family thinks you still found the right rhythm, even if the route changed.',
          newRoute: 'New route: {career}',
        },
        careers: {
          failureUnemployed: {
            title: 'Gap Year / Unemployed',
            description: "Your exam result didn't come as expected.",
            familyReaction: 'There is a deep silence at home.',
          },
          nationalAthlete: {
            title: 'National Athlete',
            description: 'Your years of training paid off. You are preparing for the Olympics!',
            familyReaction: 'Your family proudly displays your trophies.',
          },
          rockstarVirtuoso: {
            title: 'Rockstar / Virtuoso',
            description: 'You graduated the conservatory with honors. Your albums are selling out.',
            familyReaction: 'Your family is front row at every concert.',
            influences: {
              0: 'Your music grade ({grade}) strengthened your conservatory path.',
            },
          },
          medSchool: {
            title: 'Medical School',
            description: "You got into one of the country's prestigious medical schools.",
            familyReaction: 'Your family tells everyone you will be a doctor.',
          },
          softwareEngineering: {
            title: 'Software Engineering',
            description: 'Your coding talent carried you into the tech world.',
            familyReaction: 'Your family says your time at the computer finally paid off.',
          },
          lawSchool: {
            title: 'Law School',
            description: 'With your sharp mind and rhetoric, you stepped into law.',
            familyReaction: 'Your family feels confident about your future in law.',
          },
          privateUniversityBusiness: {
            title: 'Private University - Business',
            description: "Even without top grades, your financial power gave you a solid start.",
            familyReaction: 'Your family says: A diploma is still a diploma.',
          },
          rescuePilot: {
            title: 'Rescue Pilot',
            description: 'Your courage and physical strength carried you into aviation.',
            familyReaction: 'Your family has always been proud of your courage.',
          },
          sportsCoach: {
            title: 'Sports Coach',
            description: 'Your patience and team spirit turned you into a coach guiding young athletes.',
            familyReaction: "Your family celebrates your students' achievements with you.",
          },
          esportsPlayer: {
            title: 'Esports Player',
            description: 'Your digital reflexes and disciplined training routine carried you to the professional esports scene.',
            familyReaction: 'Your family is starting to see the results of your long hours at the computer.',
          },
          stageMusician: {
            title: 'Stage Musician',
            description: "You shined on stage, but your academic music grades didn't reach conservatory level.",
            familyReaction: 'Your family is happy to see you finding yourself on stage.',
            influences: {
              0: 'Your music grade ({grade}) limited the academic route.',
            },
          },
          artist: {
            title: 'Artist',
            description: 'Your exhibitions are sold out. Collectors are competing for your work.',
            familyReaction: 'Your family hangs your works on their walls.',
            influences: {
              0: 'Your visual arts grade ({grade}) opened gallery doors.',
            },
          },
          atelierArtist: {
            title: 'Studio Artist',
            description: 'With production discipline, you built your own style; your name is heard in independent studios.',
            familyReaction: 'Your family supports your studio.',
            influences: {
              0: 'Your visual arts grade ({grade}) weakened academic support.',
            },
          },
          famousWriter: {
            title: 'Famous Writer',
            description: 'Your books are on bestseller lists. Long lines form at your signings.',
            familyReaction: 'Your family is proud to see your name on bookshelves.',
          },
          digitalArtist: {
            title: 'Digital Artist',
            description: 'Your creativity found impact in the digital world; your projects stand out.',
            familyReaction: 'Your family shares your work on social media.',
          },
          contentCreator: {
            title: 'Content Creator',
            description: 'You have a natural talent in front of the camera. You are building your own audience on digital platforms.',
            familyReaction: 'Your family watches your videos with pride.',
          },
          fashionDesigner: {
            title: 'Fashion Designer',
            description: 'Your aesthetic eye and design skill carried you into the fashion world.',
            familyReaction: 'Your family follows your collections with curiosity.',
          },
          mediaIcon: {
            title: 'Media Icon',
            description: 'The bonds you built with people turned you into a visible public figure.',
            familyReaction: 'Your family is proud that everyone knows you.',
          },
          psychologist: {
            title: 'Psychologist',
            description: 'Your ability to understand people carried you into psychology.',
            familyReaction: 'Your family says: You always understood people.',
          },
          socialEntrepreneur: {
            title: 'Social Entrepreneur',
            description: 'With your passion for solving social problems, you built your own social venture.',
            familyReaction: 'Your family admires both your work and your ideals.',
          },
          diplomat: {
            title: 'Diplomatic Envoy',
            description: 'Your patience, negotiation skills, and language ability guided you toward diplomacy.',
            familyReaction: 'Your family is proud of your diplomatic talent.',
          },
          entrepreneur: {
            title: 'Entrepreneur',
            description: 'With your business instinct, you started your own business. Your ideas generate value.',
            familyReaction: 'Your family follows your business with curiosity.',
          },
          financeSpecialist: {
            title: 'Finance Specialist',
            description: 'Your calm approach with numbers directed you into the finance sector.',
            familyReaction: 'Your family enjoys discussing market news with you.',
          },
          startupFounder: {
            title: 'Startup Founder',
            description: 'Your technical knowledge and entrepreneurial spirit led you to found your own tech company.',
            familyReaction: 'Your family follows your company with excitement.',
          },
          engineering: {
            title: 'Engineering',
            description: 'Your analytical thinking carried you into engineering.',
            familyReaction: 'Your family always talked about your connection with numbers.',
          },
          researcher: {
            title: 'Researcher',
            description: 'Your curious mind and disciplined work habits carried you into academic research.',
            familyReaction: 'Your family respects the long hours you spend in the lab.',
          },
          teacher: {
            title: 'Teacher',
            description: 'Your patience and empathy turned you into a teacher guiding young minds.',
            familyReaction: 'Your family loves seeing the care your students have for you.',
          },
          versatileProfessional: {
            title: 'Versatile Professional',
            description: 'Instead of narrowing into one field, you blended many skills. Offers come from different sectors.',
            familyReaction: 'Your family proudly says you know a bit of everything.',
          },
          civicLeader: {
            title: 'Civil Society Leader',
            description: 'With your ability to bring people together, you lead social change.',
            familyReaction: 'Your family is proud of your contribution to society.',
          },
          officer: {
            title: 'Officer',
            description: 'Your discipline and respect for order led you toward a military path.',
            familyReaction: 'Your family says: They always respected rules.',
          },
          economicsPublicAdmin: {
            title: 'Economics / Public Administration',
            description: 'With a balanced profile, you kept the university path open.',
            familyReaction: 'Your family thinks you built at least a strong foundation.',
          },
          secretTrueBalance: {
            title: 'Master of True Balance',
            description: 'You found balance in every area of life. Very few people reach this.',
            familyReaction: 'Your family is deeply proud of your balanced growth in every area.',
          },
          secretFamilyLegacy: {
            title: 'Reclaim the Family Legacy',
            description: 'The deep bond you built with your family became the most valuable legacy of your life.',
            familyReaction: 'Your family says: You are our greatest pride.',
          },
          secretFateBreaker: {
            title: 'Fate Breaker',
            description: 'You refused the fate assigned to you. You drew your own path.',
            familyReaction: 'Your family says: They always found their own way.',
          },
          secretLoveAndGlory: {
            title: 'Love and Glory',
            description: 'Both your heart and mind are fulfilled. You captured love and success together.',
            familyReaction: 'Your family is happy with both your relationship and your success.',
          },
          secretSilentLegend: {
            title: 'Silent Legend',
            description: "Without needing anyone, you quietly became a legend on your own path.",
            familyReaction: 'Your family says: Quiet as always, but incredibly talented.',
          },
        },
        futureVision: {
          defaultName: 'You',
          goals: {
            ACADEMIC: {
              at30: {
                v1: '{name}, at age 30, those long nights at the research desk start paying off. Your work makes you a trusted voice in your field.',
                v2: '{name}, at age 30, the balance you built between classroom and lab begins to pay off. Your ideas open new doors for young minds.',
              },
              at50: {
                v1: '{name}, at age 50, the students you raised continue following your path.',
                v2: '{name}, at age 50, your name becomes one of the foundation stones of a school known for knowledge.',
              },
            },
            CREATIVE: {
              at30: {
                v1: '{name}, at age 30, your imagination turns into tangible projects. Your work carries a signature that leaves a mark.',
                v2: '{name}, at age 30, you find your production rhythm. Your work carries both emotion and courage at once.',
              },
              at50: {
                v1: "{name}, at age 50, your name is pinned to a generation's inspiration board.",
                v2: '{name}, at age 50, your works are shown as roadmaps for new artists.',
              },
            },
            ATHLETIC: {
              at30: {
                v1: '{name}, at age 30, your discipline reflects in both body and mind. While staying in competition, you set the pace for others.',
                v2: '{name}, at age 30, your training routine becomes the backbone of your life. You value recovery days as much as peak races.',
              },
              at50: {
                v1: '{name}, at age 50, your experience turns you into a guiding name for younger athletes.',
                v2: '{name}, at age 50, you share the wisdom of staying strong, not just performing well.',
              },
            },
            SOCIAL: {
              at30: {
                v1: '{name}, at age 30, you move into a role that builds bridges between people. Doors open to you first because you inspire trust.',
                v2: '{name}, at age 30, your network is not just wide but deep. In hard times, people look to you for direction.',
              },
              at50: {
                v1: '{name}, at age 50, the circle of trust you built becomes your greatest asset.',
                v2: '{name}, at age 50, many people see you as the first person to call in moments of crisis.',
              },
            },
            ENTERPRISE: {
              at30: {
                v1: '{name}, at age 30, you build a new balance between risk and planning. The value you create makes you not only a winner but a guide.',
                v2: '{name}, at age 30, you develop an eye that senses opportunity early. With the right teams, you accelerate growth.',
              },
              at50: {
                v1: '{name}, at age 50, the systems you built keep running even after you.',
                v2: '{name}, at age 50, your accumulated experience energizes both investments and new entrepreneurs.',
              },
            },
            BALANCED: {
              at30: {
                v1: '{name}, at age 30, instead of locking into one field, you grow your life in balance. You find your own measure between work, relationships, and inner peace.',
                v2: '{name}, at age 30, you learn to carry different roles without burning out. Small but steady steps build a strong balance.',
              },
              at50: {
                v1: '{name}, at age 50, the sense of harmony in your life becomes your strongest compass.',
                v2: '{name}, at age 50, you pass on the value of advancing steadily without drifting off course.',
              },
            },
          },
          tiers: {
            LEGENDARY: {
              at30: {
                v1: 'Your name reaches an influence that crosses national borders.',
                v2: 'Your success is discussed not only through results, but through the standard you set around you.',
              },
              at50: {
                v1: 'As years pass, your story becomes a benchmark of success.',
                v2: 'The impact you left keeps growing without fading over time.',
              },
            },
            SUCCESS: {
              at30: {
                v1: 'Your steady steps carry you to a solid summit.',
                v2: 'More than fast leaps, you prove the strength of reliable progress.',
              },
              at50: {
                v1: 'The long-term return of your effort brings a calm breadth to your life.',
                v2: 'Years later, it becomes clear how solid your line has been.',
              },
            },
            NORMAL: {
              at30: {
                v1: 'Your path is bright but measured; you grow stronger gradually without taking excessive risks.',
                v2: 'Instead of dramatic surges, a stable rhythm keeps you standing.',
              },
              at50: {
                v1: 'Over time, the experience you gather builds a simple but reliable life.',
                v2: 'You prove better than anyone that balance itself is a form of success.',
              },
            },
            FAILURE: {
              at30: {
                v1: 'The weight of accumulated mistakes strains your shoulders; rebuilding takes patience.',
                v2: 'Some doors open late, forcing you to redraw your path.',
              },
              at50: {
                v1: 'Even so, as you make sense of the weight of the past, a calmer resilience grows.',
                v2: "The pain doesn't vanish, but the wisdom born from it helps you hold on to life.",
              },
            },
          },
        },
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

let runtimeLocale: AppLocale = DEFAULT_LOCALE;

export const setRuntimeLocale = (locale: AppLocale): void => {
  runtimeLocale = locale;
};

export const tRuntime = (
  key: string,
  params?: Record<string, Primitive>,
  fallback?: string
): string => t(runtimeLocale, key, params, fallback);
