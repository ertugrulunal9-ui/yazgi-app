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
      saveLoad: 'Kaydet / Yükle',
    },
    tabs: {
      hub: 'Ana Sayfa',
      character: 'Karakter',
      skilltree: 'Yetenekler',
      social: 'Sosyal',
    },
    game: {
      endDay: 'Günü Bitir',
      endDayHint: 'Sıradaki tura geçer',
      whatDoYouWant: 'Ne yapmak istersin?',
    },
    settings: {
      title: 'Ayarlar',
      theme: 'Tema Seçin',
      density: 'Yoğunluk',
      motion: 'Hareket',
      audio: 'Ses',
      muteAudio: 'Sesleri Kapat',
      audioMutedState: 'Tüm oyun sesleri kapalı',
      audioEnabledState: 'Müzik ve efektler açık',
      privacy: 'Gizlilik',
      analyticsOptIn: 'Davranış Analitiği',
      analyticsOptInEnabled: 'Paylaşım açık',
      analyticsOptInDisabled: 'Paylaşım kapalı',
      personalizedAds: 'Kişiselleştirilmiş Reklam',
      personalizedAdsEnabled: 'Kişiselleştirilmiş reklam açık',
      personalizedAdsDisabled: 'Kişiselleştirilmemiş reklam',
      consentNote: 'İlk açılışta izin ayarladın. Buradan değiştirebilirsin.',
      privacyPolicy: 'Gizlilik Politikası',
      termsOfService: 'Kullanım Koşulları',
      reduceMotion: 'Geçişleri Azalt',
      haptics: 'Titreşim',
      saves: 'Kayıtlar',
      language: 'Dil',
      newLife: 'Yeni Hayata Başla',
      goPremium: 'Yazgı Premium',
      premiumDesc: 'Reklamsız, sınırsız geri al, özel eventler',
      themeOptions: {
        light: 'Açık',
        dark: 'Koyu',
        system: 'Sistem',
      },
      densityOptions: {
        compact: 'Küçük',
        standard: 'Normal',
        comfort: 'Büyük',
      },
      languageOptions: {
        tr: 'Türkçe',
        en: 'İngilizce',
      },
    },
    event: {
      statChanges: 'İstatistikler',
      skillChanges: 'Beceriler',
      gradeChanges: 'Okul Notları',
      defaultFeedback: 'Devam ediyorsun...',
      choose: 'Bir seçenek seç',
    },
    errors: {
      saveFailed: 'Kayıt başarısız oldu. Tekrar denenecek.',
      loadFailed: 'Kayıt yüklenemedi. Lütfen tekrar dene.',
      genericError: 'Bir hata oluştu. Lütfen uygulamayı yeniden başlat.',
      networkError: 'Bağlantı hatası. Çevrimiçi özellikler geçici olarak devre dışı.',
      turnAdvanceError: 'Tur ilerliyor: HATA - advanceTurn sırasında bir sorun oluştu',
      resetFailed: 'Sıfırlarken hata oluştu.',
    },
    onboarding: {
      welcome: "Yazgı'ya Hoş geldin!",
      skip: 'Atla',
      next: 'İleri',
      finish: 'Başla',
    },
    gameOver: {
      title: 'Oyun Bitti',
      subtitle: 'Bir hayat daha tükendi...',
      restart: 'Yeni Hayat',
      viewStats: 'Istatistikleri Gör',
    },

    // ---- LABELS ----
    labels: {
      stats: {
        health: 'Sağlık',
        energy: 'Enerji',
        intelligence: 'Zekâ',
        charisma: 'Karizma',
        discipline: 'Disiplin',
        money: 'Para',
        familyRelation: 'Aile',
      },
      skills: {
        coding: 'Yazılım',
        music: 'Müzik',
        sports: 'Spor',
        design: 'Tasarım',
        athletics: 'Atletizm',
        logic: 'Mantık',
        reading: 'Okuma',
        teamwork: 'Takım',
        art: 'Sanat',
        writing: 'Yazarlık',
        work_ethic: 'Çalışkanlık',
        business: 'Is',
      },
      grades: {
        math: 'Matematik',
        science: 'Fen Bilgisi',
        language: 'Dil',
        turkish: 'Türkçe',
        history: 'Tarih',
        geography: 'Coğrafya',
        art: 'Sanat',
        music: 'Müzik',
      },
      personality: {
        openness: 'Açıklık',
        courage: 'Cesaret',
        empathy: 'Empati',
        patience: 'Sabır',
        conformity: 'Uyum',
      },
      pillars: {
        body: 'Beden',
        mind: 'Zihin',
        soul: 'Ruh',
        wealth: 'Servet',
      },
      choiceTypes: {
        PASSIVE: 'Güvenli tercih',
        CHALLENGE: 'Zorlayıcı tercih',
        BREAKDOWN: 'Stres patlaması',
        NEUTRAL: 'Nötr tercih',
      },
      fate: {
        CURSED: 'Kötü şans',
        UNLUCKY: 'Şanssız',
        NEUTRAL: 'Nötr şans',
        FORTUNATE: 'İyi şans',
        BLESSED: 'Mükemmel şans',
      },
      npcRoles: {
        PARTNER: 'Sevgili',
        BEST_FRIEND: 'En İyi Arkadaş',
        FRIEND: 'Arkadaş',
        ACQUAINTANCE: 'Tanıdık',
        RIVAL: 'Rakip',
        ENEMY: 'Düşman',
        CRUSH: 'Hoşlanılan',
      },
    },

    // ---- UI COMPONENTS ----
    ui: {
      statusHeader: {
        stressYellow: 'Yorgunluk birikmeye başlıyor.',
        stressOrange: 'Dikkat: Yükünü hafiflet.',
        stressRed: 'Kriz eşiğindesin! Dur ve nefes al.',
        stressReliefActionsHint: 'Ipucu: Sosyal sekmesinde NPC etkileşimleri stresi düşürür.',
        dreamComplete: 'Hayalin sana açık!',
        dreamAlmost: 'Hedefe çok yakınsın. Son hamleyi dikkatli yap.',
        dreamMid: 'İyi gidiyorsun! {statHint} biraz daha güçlendir.',
        dreamStart: 'Yolun başındasın. {statHint} geliştirmeye odaklan.',
        dreamTracker: 'Hayal Takibi',
        riskCritical: 'Kritik Risk Alarmı',
        riskOpen: 'Risk Alarmı Açık',
        riskNormal: 'Risk Seviyesi Normal',
        riskCriticalHint: 'Kritik risk! Son hamlen çok önemli.',
        riskIncreasingHint: 'Risk artıyor. Kararlarını yavaşlat.',
        riskNormalHint: 'Risk seviyesi kontrol altında.',
        moneyFormatK: 'K TL',
        moneyFormat: ' TL',
        openDetails: 'detaylarını aç',
        goalUnlocksAt10: 'Hedef seçimi 10 yaşında açılır.',
        selectGoalHint: 'Hedef seçince izlenecek statlar burada görünür.',
        riskAlarm: 'Risk Alarmı',
        playerDefault: 'Oyuncu',
        ageFormat: ' yaşında',
        stressLabel: ' Stres',
        notifications: 'Bildirimler',
        notificationsWithRisk: 'Bildirimler · %{risk} risk',
        toggleNotificationsPanel: 'Bildirim panelini aç veya kapat',
        viewCrisisNotification: 'Kriz bildirimini görüntüle',
        detailsSuffix: ' Detayları',
        closeDetailPanel: 'Detay panelini kapat',
        crisisApproaching: 'Kriz yaklaşıyor!',
      },
      feedbackOverlay: {
        eventType: 'Olay türü: ',
        axisInfluence: ' ekseni sonucu etkiledi',
        choiceType: 'Seçim tipi: ',
        statRequirement: 'Stat koşulu: ',
        skillRequirement: 'Beceri koşulu: ',
        personalityRequirement: 'Kişilik koşulu: ',
        fateInfluence: 'Kader etkisi: ',
        dramaticDecision: 'Bu karar hayatını değiştirdi.',
        whyThisOutcome: 'Neden bu sonuç?',
        traitChanges: 'Özellik değişimi',
        hints: 'İpuçları:',
        statistics: 'İstatistikler',
        skills: 'Beceriler',
        schoolGrades: 'Okul Notları',
        crisisRecoveryAdButton: 'Kriz toparlanma reklamı izle',
        recoverPercentage: 'Stat kaybının bir kısmını geri alır',
        adPreparing: 'Reklam hazırlanıyor...',
        watchAdRecover: 'Reklam İzle: Kaybın %50sini Geri Al',
      },
      adLoading: 'Reklam yükleniyor...',
      cardPreparing: 'Kart Hazırlanıyor...',
    },

    // ---- MESSAGES / TOASTS ----
    messages: {
      adNotShown: 'Reklam gösterilemedi',
      energyGained: '+{amount} enerji kazandın',
      energyFull: 'Enerjin zaten dolu',
      examFocusActive: 'Sınav odağı aktif: +{boost} zekâ',
      focusBonusLimitReached: 'Zekâ zaten maksimum, odak bonusu sınırda kaldı',
      examFocusEnded: 'Sınav odak takviyesi sona erdi',
      metNPC: '{name} ile tanıştın!',
      sharingUnavailable: 'Paylaşım kullanılamıyor',
      sharingNotSupported: 'Bu cihazda paylaşım desteklenmiyor.',
      sharingNotReady: 'Paylaşım hazır değil',
      cardCreationFailed: 'Kart oluşturulamadı, tekrar dene.',
      shareTitle: 'Yazgı - Hayatımı Paylaş',
      sharingFailed: 'Paylaşım başarısız',
      cardSharingFailed: 'Kart paylaşımı tamamlanamadı.',
      tryAgain: 'Lütfen tekrar dene.',
      examFinished: 'Sınav Bitti!',
      examCorrect: 'Doğru: {count}',
      examGradeBonus: 'Not Bonusu: +{bonus}',
      examScore: 'Puan: {score}',
    },

    // ---- DIALOGS ----
    dialogs: {
      examPrep: {
        title: 'Sınav Hazırlığı',
        description: 'Sınav öncesi reklam izleyip geçici +15 zekâ odağı almak ister misin?',
      },
      outOfEnergy: {
        title: 'Enerjin bitti',
        description: 'Bir reklam izleyerek +25 enerji kazanmak ister misin?',
      },
    },

    // ---- BUTTONS ----
    buttons: {
      startDirect: 'Direkt Başla',
      watchAd: 'Reklam İzle',
      decline: 'Vazgeç',
      endDay: 'Günü Bitir',
      newGame: 'Yeni Oyun',
      shareLife: 'Hayatımı Paylaş',
      watchAdAlternativeEnding: 'Reklam İzle: Alternatif Sonu Göster',
    },

    // ---- FEEDBACK / SYSTEM ----
    feedback: {
      fateLabels: {
        CURSED: 'Lanetli',
        UNLUCKY: 'Şanssız',
        NEUTRAL: 'Nötr',
        FORTUNATE: 'Şanslı',
        BLESSED: 'Kutsanmış',
      },
      fateTokenUsed: 'Token kullandın: yeni kaderin {outcome}.',
      fateTokenFixed: 'Token kullandın: kader sonucun {outcome} olarak sabitlendi.',
      fateTokenImproved: 'Token sayesinde şansın döndü: {from} -> {to}',
      fateTokenChanged: 'Token etkisi: {from} -> {to}',
      momentum: {
        streakBroken: '{tendency} ritmi kırıldı!',
        highMomentum: '+{percent}% İvme Bonusu!',
        strengthening: '{tendency} ritmi güçleniyor!',
        tendencies: {
          HELPFUL: 'Yardımsever',
          PRAGMATIC: 'Pragmatik',
          AGGRESSIVE: 'Agresif',
        },
        flavor: {
          HELPFUL: 'Yardımsever ruhun güçleniyor!',
          PRAGMATIC: 'Pragmatik ruhun güçleniyor!',
          AGGRESSIVE: 'Agresif ruhun güçleniyor!',
        },
      },
    },

    // ---- ENDINGS ----
    endings: {
      title: 'Yolun Sonu',
      discoveredCount: '{discovered} / {total} son keşfedildi',
      completedAge: '{name} {age} yaşını tamamladı',
      noGoalSelected: 'Hedef Seçilmedi (Otomatik Rota)',
      analysisTitle: 'Sonuç Analizi',
      compatibilityScore: 'Hedef Uyumu',
      errorDebt: 'Hata Borcu',
      traits: 'Özellik',
      goalLabel: 'Hedef',
      activeCalculation: 'Aktif hesaplama: ',
      unexpectedPath: 'Beklenmedik Yol: seçilen hedeften farklı olarak {inferred} rotasında daha güçlü bir profil oluşturdun.',
      criticalDebts: 'Kritik borçlar: ',
      achievementImpact: 'Başarım Etkisi',
      gainedTraits: 'Kazanılan Özellikler',
      relationships: 'İlişkiler',
      metAtAge: ' yaşında tanıştın',
      friendshipYears: ' yıllık dostluk',
      neverMadeUp: 'hiç barismadin',
      legacy: 'Miras',
      runLegacyPoints: 'Bu koşu: +{points} miras puanı',
      totalRunsLevel: 'Toplam koşu: {runs} | Seviye: {level}',
      totalLegacyPoints: 'Toplam miras puanı: ',
      remainingLife: 'Hayatının Geri Kalanı',
      in20Years: '20 yıl sonra',
      futureMood: 'Gelecek ruh hali: ',
      whatIfDifferent: 'Peki ya farklı seçseydin?',
      alternativeEndingTitle: 'Alternatif Son ({goal})',
      secretDiscovered: 'Gizli bir sonla tanıştın!',
      influenceGoal: 'Hedef: {goal}',
      influenceCompatibility: 'Hedef uyumu: %{score}',
      influenceErrorDebt: 'Hata borcu: {debt}',
      mismatchNote: 'Beklenmedik yol: Seçilen hedefte uyum %{selectedScore}, geliştirdiğin rota {inferred} ile %{compatibilityScore} uyum yakaladı.',
      difficultyAdjustment: 'Zorluk düzeltmesi: {value}',
      versatilityPenalty: 'Çeşitlilik cezası: -{penalty} (entropi %{entropy}, baskın kategori %{dominant})',
      routeDeviationPenalty: 'Rota sapması cezası: -{penalty}',
      goals: {
        ACADEMIC: 'Akademik Hedef',
        CREATIVE: 'Yaratıcı Hedef',
        ATHLETIC: 'Atletik Hedef',
        SOCIAL: 'Sosyal Hedef',
        ENTERPRISE: 'Girişim Hedefi',
        BALANCED: 'Dengeli Hedef',
      },
      personalities: {
        HELPFUL: 'İnsanlarla kurduğu bağları hayatının her köşesine işledi. Veriverdi, bazen kendine bile fırsat bırakmadan.',
        PRAGMATIC: 'Hesaplı adımlar attı. Her kararında mantık vardı; duygular geride kalırdı.',
        AGGRESSIVE: 'Sınırlarını sert çizdi. Bu ona hem güç hem bedel getirdi.',
        DEFAULT: 'Kendi yolunu kendi biçiminde yürüdü.',
      },
      suggestions: {
        ACADEMIC: '"Sanatçı" yolunu denemeyi düşündün mu hiç?',
        CREATIVE: '"Sporcu" ruhuyla bambaşka bir hikaye seni bekliyor.',
        ATHLETIC: '"Akademisyen" gözlükleriyle dünyayı nasıl görürdün acaba?',
        SOCIAL: '"Girişimci" modunda ne kadar farklı olurdun?',
        ENTERPRISE: '"Sosyal" önceliklerle ne değişirdi?',
        BALANCED: 'Bir hedefi tüm kalbinle benimseseydin?',
      },
      errorReasons: {
        healthWeak: 'Sağlık dengesi zayıf',
        disciplineGap: 'Disiplin açığı var',
        socialLow: 'Sosyal destek düşük',
        academicWeak: 'Akademik temel zayıf',
        financialBuffer: 'Finansal tampon küçük',
        stressHigh: 'Stres seviyesi yüksek',
        overextensionDebt: 'Aşırı tempo hata borcunu büyüttü',
      },
      tiers: {
        LEGENDARY: 'Efsanevi',
        SUCCESS: 'Başarılı',
        NORMAL: 'Dengeli',
        FAILURE: 'Başarısız',
        UNEXPECTED_PATH: 'Beklenmedik Yol',
      },
      catalog: {
        titleTemplate: '{goal} - {tier}',
        mismatchTitle: '{goal} - Beklenmedik Yol',
        goals: {
          ACADEMIC: 'Akademik Yol',
          CREATIVE: 'Yaratıcı Yol',
          ATHLETIC: 'Atletik Yol',
          SOCIAL: 'Sosyal Yol',
          ENTERPRISE: 'Girişim Yolu',
          BALANCED: 'Dengeli Yol',
        },
        tiers: {
          FAILURE: 'Zor Son',
          NORMAL: 'Dengeli Son',
          SUCCESS: 'Başarı Sonu',
          LEGENDARY: 'Efsane Son',
        },
      },
      content: {
        flavor: {
          richSaverDistant: 'Paran var ama paylaşım yerine biriktirmeyi seçiyorsun; çevren seni mesafeli buluyor.',
          richLonely: 'Paran var ama etrafında gerçekten güvendiğin insanlar çok az.',
          heartbreaker: 'İlişkilerde bıraktığın kırık izler bugüne kadar taşındı.',
          rebel: 'Kurallara direnen tavrın hayatına hem hız hem bedel getirdi.',
          failureResilience: 'Disiplinli geçmişin, bir sonraki denemede oyunu çevirmen için güçlü bir temel sunuyor.',
          perfectionist: 'Mükemmeliyetçi rutinin bu sonucu bir tesadüf olmaktan çıkardı.',
        },
        mismatch: {
          title: 'Sürpriz Kariyer',
          description: '{selectedGoal} hedefini seçmiştin; hayat çizgin {inferredGoal} yönüne açıldı. Yeni rotanda {career} yolunu yakaladın.',
          familyReaction: 'Ailen, rota değişse de doğru ritmi yakaladığını düşünüyor.',
          newRoute: 'Yeni rota: {career}',
        },
        careers: {
          failureUnemployed: {
            title: 'Mezuna Kaldın / İşsiz',
            description: 'Sınav sonucun beklediğin gibi gelmedi.',
            familyReaction: 'Evde derin bir sessizlik var.',
          },
          nationalAthlete: {
            title: 'Milli Sporcu',
            description: 'Yıllar süren antrenmanlarının karşılığını aldın. Olimpiyatlara hazırlanıyorsun!',
            familyReaction: 'Ailen kupalarını gururla sergiliyor.',
          },
          rockstarVirtuoso: {
            title: 'Rockstar / Virtüöz',
            description: 'Konservatuvarı dereceyle bitirdin. Albümlerin yok satıyor.',
            familyReaction: 'Ailen her konserinde en önde.',
            influences: {
              0: 'Müzik notun ({grade}) konservatuar yolunu güçlendirdi.',
            },
          },
          medSchool: {
            title: 'Tıp Fakültesi',
            description: 'Ülkenin prestijli tıp fakültelerinden birini kazandın.',
            familyReaction: 'Ailen herkese doktor olacağını anlatıyor.',
          },
          softwareEngineering: {
            title: 'Yazılım Mühendisliği',
            description: 'Kodlama yeteneğin seni teknoloji dünyasına taşıdı.',
            familyReaction: 'Ailen bilgisayar başındaki emeğinin karşılığını aldığını söylüyor.',
          },
          lawSchool: {
            title: 'Hukuk Fakültesi',
            description: 'Keskin zekan ve hitabetinle hukuk yoluna girdin.',
            familyReaction: 'Ailen hukuktaki geleceğine güveniyor.',
          },
          privateUniversityBusiness: {
            title: 'Özel Uni - Isletme',
            description: 'Notların parlak olmasa da finansal gücünle iyi bir başlangıç yaptın.',
            familyReaction: 'Ailen: Diploma diplomadir diyor.',
          },
          rescuePilot: {
            title: 'Kurtarma Pilotu',
            description: 'Cesaretin ve fiziksel gücün seni havacılık yoluna taşıdı.',
            familyReaction: 'Ailen cesaretinle hep övündü.',
          },
          sportsCoach: {
            title: 'Spor Eğitmeni',
            description: 'Sabrın ve takım ruhu anlayışın seni genç sporculara yol gösteren bir eğitmene dönüştürdü.',
            familyReaction: 'Ailen öğrencilerinin başarısını seninle birlikte kutluyor.',
          },
          esportsPlayer: {
            title: 'E-Spor Oyuncusu',
            description: 'Dijital reflekslerin ve disiplinli antrenman rutinin seni profesyonel e-spor sahnesine taşıdı.',
            familyReaction: 'Ailen bilgisayar başında geçirdiğin saatlerin sonucunu görmeye başlıyor.',
          },
          stageMusician: {
            title: 'Sahne Müzisyeni',
            description: 'Sahnede parladın; akademik müzik notların konservatuar seviyesine çıkamadı.',
            familyReaction: 'Ailen sahnede kendini bulmana seviniyor.',
            influences: {
              0: 'Müzik notun ({grade}) akademik yolu sinirladi.',
            },
          },
          artist: {
            title: 'Sanatçı',
            description: 'Sergilerin kapalı gişe. Eserlerin koleksiyonerler tarafından kapışılıyor.',
            familyReaction: 'Ailen eserlerini duvarlarına asıyor.',
            influences: {
              0: 'Görsel sanatlar notun ({grade}) sergi kapılarını açtı.',
            },
          },
          atelierArtist: {
            title: 'Atölye Sanatçısı',
            description: 'Üretim disiplininle kendi stilini kurdun; bağımsız atölyelerde adın duyuluyor.',
            familyReaction: 'Ailen atölyene destek oluyor.',
            influences: {
              0: 'Görsel sanatlar notun ({grade}) akademik desteği zayıflattı.',
            },
          },
          famousWriter: {
            title: 'Ünlü Yazar',
            description: 'Kitaplarin çok satanlar listesinde. Imza gunlerinde uzun kuyruklar var.',
            familyReaction: 'Ailen raflarda adını görmekten gururlu.',
          },
          digitalArtist: {
            title: 'Dijital Sanatçı',
            description: 'Yaratıcılığın dijital dünyada karşılık buldu; projelerinle fark yaratıyorsun.',
            familyReaction: 'Ailen eserlerini sosyal medyada paylaşıyor.',
          },
          contentCreator: {
            title: 'İçerik Üretici',
            description: 'Kameranın önünde doğal bir yeteneğin var. Dijital platformlarda kendi kitlesini oluşturuyorsun.',
            familyReaction: 'Ailen videolarını izleyip gururlanıyor.',
          },
          fashionDesigner: {
            title: 'Moda Tasarımcısı',
            description: 'Estetik görüşün ve tasarım yeteneğin seni moda dünyasına taşıdı.',
            familyReaction: 'Ailen koleksiyonlarını merakla takip ediyor.',
          },
          mediaIcon: {
            title: 'Medya İkonu',
            description: 'İnsanlarla kurduğun bağlar seni görünür bir figüre dönüştürdü.',
            familyReaction: 'Ailen herkesin seni tanımasından gurur duyuyor.',
          },
          psychologist: {
            title: 'Psikolog',
            description: 'İnsanları anlama yeteneğin seni psikoloji yoluna taşıdı.',
            familyReaction: 'Ailen: Her zaman insanları anlardı diyor.',
          },
          socialEntrepreneur: {
            title: 'Sosyal Girişimci',
            description: 'Toplumsal sorunlara çözüm üretme tutkunla kendi sosyal girişimini kurdun.',
            familyReaction: 'Ailen hem işine hem ideallerine hayran.',
          },
          diplomat: {
            title: 'Diplomat',
            description: 'Sabrın, uzlaşma yeteneğin ve dil becerilerin seni diplomasi yoluna yöneltti.',
            familyReaction: 'Ailen diplomatik yeteneklerinle gurur duyuyor.',
          },
          entrepreneur: {
            title: 'Girişimci',
            description: 'Ticari zekanla kendi işini kurdun. Fikirlerin para ediyor.',
            familyReaction: 'Ailen işini merakla takip ediyor.',
          },
          financeSpecialist: {
            title: 'Finans Uzmanı',
            description: 'Sayılarla aran ve soğukkanlılığın seni finans sektörüne yönlendirdi.',
            familyReaction: 'Ailen piyasa haberlerini seninle konuşmayı seviyor.',
          },
          startupFounder: {
            title: 'Startup Kurucusu',
            description: 'Teknik bilgin ve girişimci ruhun seni kendi teknoloji şirketini kurmaya yöneltti.',
            familyReaction: 'Ailen şirketini heyecanla takip ediyor.',
          },
          engineering: {
            title: 'Mühendislik',
            description: 'Analitik düşüncen seni mühendislik yoluna taşıdı.',
            familyReaction: 'Ailen sayılarla olan bağını hep konuşuyordu.',
          },
          researcher: {
            title: 'Araştırmacı',
            description: 'Meraklı zihnin ve disiplinli çalışma alışkanlıkların seni akademik araştırma yoluna taşıdı.',
            familyReaction: 'Ailen laboratuvardaki saatlerini saygıyla karşılıyor.',
          },
          teacher: {
            title: 'Öğretmen',
            description: 'Sabrın ve empatin seni genç nesillere bilgi aktaran bir öğretmene dönüştürdü.',
            familyReaction: 'Ailen öğrencilerinin sevgisini görmeye bayılıyor.',
          },
          versatileProfessional: {
            title: 'Çok Yönlü Profesyonel',
            description: 'Tek bir alana kapanmak yerine birçok beceriyi harmanladın. Farklı sektörlerden teklifler alıyorsun.',
            familyReaction: 'Ailen: Her konuda bi bilgisi var diyor gururla.',
          },
          civicLeader: {
            title: 'Sivil Toplum Lideri',
            description: 'İnsanları bir araya getirme yeteneğinle toplumsal değişime öncülük ediyorsun.',
            familyReaction: 'Ailen topluma katkın için gururlu.',
          },
          officer: {
            title: 'Subay',
            description: 'Disiplinin ve düzene saygın seni askerlik yoluna yöneltti.',
            familyReaction: 'Ailen: Kurallara hep saygılıydı diyor.',
          },
          economicsPublicAdmin: {
            title: 'İktisat / Kamu Yönetimi',
            description: 'Dengeli bir profil ile üniversite yolunu açık tuttun.',
            familyReaction: 'Ailen en azından iyi bir temel kurduğunu düşünüyor.',
          },
          secretTrueBalance: {
            title: 'Gerçek Denge Ustası',
            description: 'Hayatın her alanında denge buldun. Bu başarı çok az kişiye nasip olur.',
            familyReaction: 'Ailen her alanda dengeli gelişiminden muhteşem gurur duyuyor.',
          },
          secretFamilyLegacy: {
            title: 'Aile Mirasını Geri Kazan',
            description: 'Ailenle kurduğun derin bağ hayatının en değerli mirası oldu.',
            familyReaction: 'Ailen: Sen bizim en büyük gururumuzsun.',
          },
          secretFateBreaker: {
            title: 'Kader Kırıcı',
            description: 'Kaderin sana biçtiğini kabul etmedin. Kendi yolunu kendin çizdin.',
            familyReaction: 'Ailen: O hep kendi yolunu buldu diyor.',
          },
          secretLoveAndGlory: {
            title: 'Aşk ve Zafer',
            description: 'Hem kalbin hem aklın dolu. Aşk ve başarıyı aynı anda yakaladın.',
            familyReaction: 'Ailen hem ilişkinden hem başarından mutlu.',
          },
          secretSilentLegend: {
            title: 'Sessiz Efsane',
            description: 'Kimseye ihtiyaç duymadan kendi yolunda sessizce efsaneleşen biri oldun.',
            familyReaction: 'Ailen: O hep kendi halinde ama çok yetenekli diyor.',
          },
        },
        futureVision: {
          defaultName: 'Sen',
          goals: {
            ACADEMIC: {
              at30: {
                v1: '{name}, 30 yaşında araştırma masasında geçirdiğin uzun geceler meyvesini veriyor. Çalışmaların seni alanında güvenilen bir sese dönüştürüyor.',
                v2: '{name}, 30 yaşında derslik ile laboratuvar arasında kurduğun denge meyve veriyor. Ürettiğin fikirler genç zihinlere yeni kapılar açıyor.',
              },
              at50: {
                v1: '{name}, 50 yaşında yetiştirdiğin öğrenciler senin izini sürmeye devam ediyor.',
                v2: '{name}, 50 yaşında adın bilgiyle anılan bir okulun temel taşlarından biri oluyor.',
              },
            },
            CREATIVE: {
              at30: {
                v1: '{name}, 30 yaşında hayal gücün somut projelere dönüşüyor. Eserlerin izleyicilerde iz bırakan bir imzaya sahip oluyor.',
                v2: '{name}, 30 yaşında üretim ritmini buluyorsun. İşlerin hem duyguyu hem cesareti aynı anda taşıyor.',
              },
              at50: {
                v1: '{name}, 50 yaşında bir kuşağın ilham panosunda adını bırakmış oluyorsun.',
                v2: '{name}, 50 yaşında eserlerin yeni sanatçılara yol haritası olarak gösteriliyor.',
              },
            },
            ATHLETIC: {
              at30: {
                v1: '{name}, 30 yaşında disiplinin bedenine ve zihnine aynı anda yansıyor. Rekabetin içinde kalırken etrafına da tempo veriyorsun.',
                v2: '{name}, 30 yaşında antrenman rutinin hayatının iskeleti oluyor. Zirve yarışları kadar toparlanma günlerine de değer veriyorsun.',
              },
              at50: {
                v1: '{name}, 50 yaşında birikiminle genç sporculara yol gösteren bir isim haline geliyorsun.',
                v2: '{name}, 50 yaşında performans kadar sağlam kalmanın bilgisini paylaşıyorsun.',
              },
            },
            SOCIAL: {
              at30: {
                v1: '{name}, 30 yaşında insanlar arasında köprü kuran bir role geçiyorsun. Güven verdiğin için kapılar önce sana açılıyor.',
                v2: '{name}, 30 yaşında ilişki ağın sadece kalabalık değil, aynı zamanda derin oluyor. Zor anlarda insanlar senden yön buluyor.',
              },
              at50: {
                v1: '{name}, 50 yaşında etrafında kurduğun güven çemberi hayatının en büyük sermayesine dönüşüyor.',
                v2: '{name}, 50 yaşında birçok insan seni kriz anlarında ilk aradığı kişi olarak görüyor.',
              },
            },
            ENTERPRISE: {
              at30: {
                v1: '{name}, 30 yaşında risk ile plan arasında yeni bir denge kuruyorsun. Ürettiğin değer seni sadece kazanan değil yön veren bir oyuncu yapıyor.',
                v2: '{name}, 30 yaşında fırsat kokusunu erken alan bir bakış açısı geliştiriyorsun. Doğru ekiplerle büyümeyi hızlandırıyorsun.',
              },
              at50: {
                v1: '{name}, 50 yaşında kurduğun sistemler senden sonra da işlemeye devam ediyor.',
                v2: '{name}, 50 yaşında birikimin hem yatirimlara hem yeni girisimcilere can veriyor.',
              },
            },
            BALANCED: {
              at30: {
                v1: '{name}, 30 yaşında tek bir alana kapanmak yerine hayatını dengede büyütüyorsun. İş, ilişki ve iç huzur arasında kendi ölçünü buluyorsun.',
                v2: '{name}, 30 yaşında farklı rolleri taşırken yorulmadan ilerlemeyi öğreniyorsun. Küçük ama sürekli adımların büyük bir denge kuruyor.',
              },
              at50: {
                v1: '{name}, 50 yaşında hayatındaki uyum duygusu en güçlü pusulana dönüşüyor.',
                v2: '{name}, 50 yaşında istikrarlı yönden sapmadan ilerlemenin değerini çevrendekilere aktarıyorsun.',
              },
            },
          },
          tiers: {
            LEGENDARY: {
              at30: {
                v1: 'Adın ülke sınırlarını aşan bir etki alanına ulaşıyor.',
                v2: 'Başarın sadece sonuçlarla değil, etrafında kurduğun standartla da konuşuluyor.',
              },
              at50: {
                v1: 'Zaman geçtikçe hikayen bir başarı ölçüsüne dönüşüyor.',
                v2: 'Bırakılan etki, yıllara rağmen azalmadan büyüyor.',
              },
            },
            SUCCESS: {
              at30: {
                v1: 'İstikrarlı adımların seni sağlam bir zirveye taşıyor.',
                v2: 'Hızlı sıçramalardan çok, güvenilir ilerlemenin gücünü göstermiş oluyorsun.',
              },
              at50: {
                v1: 'Emeğinin uzun vadeli getirisi hayatına huzurlu bir genişlik katıyor.',
                v2: 'Yıllar sonra bakıldığında çizginin ne kadar sağlam olduğu netleşiyor.',
              },
            },
            NORMAL: {
              at30: {
                v1: 'Yolun parlak ama ölçülü; fazla risk almadan yavaş yavaş gucleniyorsun.',
                v2: 'Büyük patlamalar yerine düzgün ritim seni ayakta tutuyor.',
              },
              at50: {
                v1: 'Zamanla topladığın deneyim sade ama güvenilir bir hayat kuruyor.',
                v2: 'Dengenin de bir başarı biçimi olduğunu en iyi sen kanıtlıyorsun.',
              },
            },
            FAILURE: {
              at30: {
                v1: 'Hataların birikimi omuzlarını zorluyor; yeniden kurmak için sabır gerekiyor.',
                v2: 'Bazı kapılar geç açılıyor, bu da yolunu yeniden çizmeye zorluyor.',
              },
              at50: {
                v1: 'Yine de geçmişin ağırlığını anlamlandırdıkça daha sakin bir dayanıklılık gelişiyor.',
                v2: 'Acılar silinmiyor ama onlardan doğan bilgelik hayata tutunmana yardım ediyor.',
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
      consentNote: 'You set this during first launch. You can change it here.',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      reduceMotion: 'Reduce Motion',
      haptics: 'Vibration',
      saves: 'Saves',
      language: 'Language',
      newLife: 'Start New Life',
      goPremium: 'Yazgi Premium',
      premiumDesc: 'Ad-free, unlimited undo, special events',
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
        stressReliefActionsHint: 'Tip: NPC interactions in the Social tab reduce stress.',
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
