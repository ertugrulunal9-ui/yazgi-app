import { DomainStrings } from './types';

export const storyTextStrings: DomainStrings = {
  tr: {
    storyText: {
      personality: {
        archetypes: {
          INTROVERT_CAUTIOUS: 'İçine kapanık ve temkinli. Güvenli seçimler yapıyor, riskten kaçınıyor.',
          INTROVERT_BRAVE: 'Sessiz ama cesur. Tek başına büyük işler başarabilir.',
          EXTROVERT_CAUTIOUS: 'Sosyal ama dikkatli. İnsanları seviyor ama maceradan kaçınıyor.',
          EXTROVERT_BRAVE: 'Doğal lider. Hem sosyal hem de risk almaktan korkmuyor.',
          EMPATH: 'Derin empatik. Başkalarının acısını kendi acısı gibi hissediyor.',
          PRAGMATIST: 'Pragmatik. Duygulardan çok mantığa göre karar veriyor.',
          REBEL: 'İsyankar ruh. Kurallara ve otoriteye karşı.',
          CONFORMIST: 'Uyumcu. Kurallara saygılı, toplum normlarına bağlı.',
          BALANCED: 'Dengeli kişilik. Duruma göre adapte olabiliyor.',
        },
        innerThoughts: {
          stressHigh: [
            'Kafam çok karışık...',
            'Nefes almakta zorlanıyorum.',
            'Her şey çok fazla...',
            'Biraz yalnız kalmam lazım.',
            'Patlayacak gibi hissediyorum.',
          ],
          social: {
            INTROVERT_CAUTIOUS: 'Keşke evde kalsaydım...',
            INTROVERT_BRAVE: 'İnsanlar yoruyor ama yapılması gereken şey belli.',
            EXTROVERT_CAUTIOUS: 'İnsanlarla olmak güzel ama dikkatli olmalıyım.',
            EXTROVERT_BRAVE: 'Hadi biraz ortamı ısıtalım!',
            EMPATH: 'Herkesin ne hissettiğini anlayabiliyorum.',
            default: 'Bakalım bugün neler olacak.',
          },
          risk: {
            brave: 'Risk almadan kazanılmaz!',
            cautious: 'Bu çok tehlikeli görünüyor...',
            default: 'Düşünmem lazım...',
          },
          moral: {
            empath: 'Doğru olanı yapmalıyım, ne pahasına olursa olsun.',
            selfish: 'Önce kendimi düşünmeliyim.',
            default: 'Bu zor bir karar...',
          },
          daily: {
            default: 'Hayat devam ediyor.',
          },
        },
        levels: {
          openness: {
            low: 'İçe kapanık',
            mid: 'Dengeli sosyal',
            high: 'Dışa dönük',
          },
          courage: {
            low: 'Temkinli',
            mid: 'Dengeli',
            high: 'Cesur',
          },
          empathy: {
            low: 'Pragmatik',
            mid: 'Dengeli',
            high: 'Empatik',
          },
          patience: {
            low: 'Dürtüsel',
            mid: 'Dengeli',
            high: 'Sabırlı',
          },
          conformity: {
            low: 'İsyankar',
            mid: 'Dengeli',
            high: 'Uyumcu',
          },
        },
      },
      school: {
        gradeReactions: {
          supportive: {
            high: "Ailenin seni gördüğü andan itibaren gözlerinde mutluluk çiçeklendi. 'Çok gurur duyuyoruz!' dediler.",
            mid: "Annen seni kucaklamaya gitti. 'İyi çalıştığını biliyoruz, devam et,' dedi.",
            low: "Ailen biraz hayal kırıklığına uğradı ama destek sunmaya devam etti. 'Geçen sene daha iyiydin,'",
          },
          strict: {
            high: "Baban gözlüğünü çıkararak seni inceledi. 'Beklediğim tam bu. Devam et.'",
            mid: "Baban notlara baktı. 'Daha iyisi olabilir. Matematik'e daha çok çalış.'",
            low: "Baban masaya yumruk vurdu. 'Bu notlar beni hüsrana uğratıyor! Derhal çalışmalısın!'",
          },
          chaotic: {
            high: 'Ailen notlara ilgilenmedi bile. Senin başarın senin işin.',
            low: "Ailen havaya girdi. 'Ne yapıyorsun sen? Hiç umrumda değil ama yine de başarısızsın.'",
          },
        },
        yearEnd: {
          excellent: {
            strict: '🎉 Baban sana yeni bir telefon aldı! "Bu başarının ödülü," dedi.',
            supportive: '🎊 Ailen seninle gurur duyuyor! Yaz tatilinde istediğin yere gidebilirsin.',
            chaotic: '👍 Notların iyi. Ailen pek umursamadı ama en azından özgürsün.',
          },
          good: {
            strict: '📚 Baban: "Fena değil ama daha iyisini bekliyordum. Yaz boyunca biraz daha çalış."',
            default: '👍 Ailen notlarından memnun. Normal bir yaz tatili geçireceksin.',
          },
          average: {
            strict: '😤 Baban: "Bu notlar kabul edilemez! Yaz boyunca oyun ve televizyon yasak."',
            supportive: '😟 Annen: "Seneye daha iyi olacak, değil mi? Biraz daha çalışmalısın."',
            chaotic: '🙄 Ailen notlara aldırmadı bile.',
          },
          poor: {
            strict: '😡 Baban masaya yumruk vurdu: "BU NOTLAR NE?! Telefon, bilgisayar, arkadaşlar... Hepsi yasak! Harçlığın da yarıya düşüyor!"',
            supportive: '😢 Annen üzgün bir şekilde: "Seni çok seviyoruz ama bu notlarla bir şeyler değişmeli. Bu yaz biraz kısıtlama olacak."',
            chaotic: '😒 Ailen notlara baktı bile değil. "Senin hayatın, senin sorunun" dediler.',
          },
        },
      },
      traits: {
        negativeGuidance: {
          LAZY: 'Disiplini yüksek tut ve ders/spor rutinini bozma.',
          PROCRASTINATOR: 'Kısa hedefler belirleyip ertelenen görevleri hemen tamamla.',
          BURNOUT_PRONE: 'Düşük enerjiyle yoğun aksiyon yapma, önce dinlen.',
          LONE_WOLF: 'Sosyal aksiyonları artırıp iletişim statini toparla.',
          COWARD: 'Zor anlarda pasif kalmak yerine kontrollü risk al.',
          CHEATER: 'Kısa yol yerine uzun vadeli güvenilir seçimler yap.',
          REBELLIOUS: 'Aile ile çatışma anlarında uzlaşmacı seçenekleri dene.',
          SICKLY: 'Sağlık odaklı rutin kurup enerji düşüşlerini erken toparla.',
          CLUMSY: 'Fiziksel aktiviteleri kademeli artırıp tekrar et.',
          default: 'Bu özelliği azaltmak için ters davranış kalıbını sürdür.',
        },
        gainSummary: '+ {traitName} kazanıldı.',
        removalSummary: '- {traitName} kaldırıldı.',
        removalResolvedSummary: '- {traitName} kaldırıldı (çatışma: {resolverName}).',
      },
      endings: {
        careerNarratives: {
          nationalAthlete: {
            EXTROVERT_BRAVE: 'Cesaretinle sınırlarını zorlayarak zirveye ulaştın.',
            INTROVERT_BRAVE: 'Sessiz ama kararlı antrenmanlarınla herkesin takdirini kazandın.',
            CONFORMIST: 'Disiplinin seni diğerlerinden ayırdı. Her gün, her antrenman mükemmeldi.',
            BALANCED: 'Dengeli yaklaşımın seni uzun vadeli başarıya taşıdı.',
          },
          rockstarVirtuoso: {
            REBEL: 'Kurallara meydan okuyarak müzikte kendi yolunu çizdin.',
            EMPATH: 'Müziğinle insanların duygularına dokunuyorsun.',
            EXTROVERT_BRAVE: 'Sahne senin evin. Binlerce kişiye enerji veriyorsun.',
            BALANCED: 'Müzik yeteneğin seni konservatuvar yoluna taşıdı.',
          },
          famousWriter: {
            INTROVERT_CAUTIOUS: 'İç dünyanın zenginliği sayfalarına yansıdı.',
            EMPATH: 'İnsanları anlamak, onların hikayelerini yazmana olanak tanıdı.',
            REBEL: 'Cesur kalemin toplumun gerçeklerini gözler önüne serdi.',
            BALANCED: 'Yazma yeteneğin seni edebiyat dünyasına taşıdı.',
          },
          medSchool: {
            EMPATH: 'Empatin hastalarını iyileştirmenin en büyük gücü oldu.',
            CONFORMIST: 'Disiplinli çalışman tıp eğitiminin zorluklarını aşmanı sağladı.',
            INTROVERT_CAUTIOUS: 'Dikkatli ve titiz yaklaşımın seni mükemmel bir hekim yapacak.',
            BALANCED: 'Çalışkanlığın ve zekân seni tıp yoluna taşıdı.',
          },
          softwareEngineering: {
            REBEL: "Kurallara isyan ederek kendi startup'ını kurmaya hazırlanıyorsun.",
            INTROVERT_CAUTIOUS: 'Sessiz oturarak büyük sistemler tasarladın.',
            CONFORMIST: 'Sistemli çalışmanla büyük şirketlerin en güvenilir mühendisi olacaksın.',
            EMPATH: 'İnsanlara yardım eden yazılımlar geliştirme hayalin var.',
            BALANCED: 'Kodlama yeteneğin seni teknoloji dünyasına taşıdı.',
          },
          entrepreneur: {
            REBEL: 'Kimsenin cesaret edemediği işlere girişerek fark yarattın.',
            EXTROVERT_BRAVE: 'Liderliğin ve cesaretinle ekip kurup büyüttün.',
            BALANCED: 'Ticari zekânla kendi yolunu çizdin.',
          },
          lawSchool: {
            REBEL: 'Adaletsizliğe karşı savaşmak için hukuk silahını seçtin.',
            EMPATH: 'Ezilenlerin sesi olmak istiyorsun.',
            CONFORMIST: 'Kurallara ve yasalara olan saygın seni hukuk yoluna çekti.',
            BALANCED: 'Keskin zekân ve hitabetin seni hukuk yoluna taşıdı.',
          },
          failureUnemployed: {
            REBEL: 'Sistem seni yıktı ama isyan ateşin sönmedi.',
            INTROVERT_CAUTIOUS: 'Fırsatları kaçırdın. Ama yeni kapılar açılabilir.',
            BALANCED: 'Hayat her zaman planladığın gibi gitmiyor. Ama hikaye burada bitmez.',
          },
        },
        memoryInfluence: {
          prideMajor: 'Başarılarla dolu bir geçmişin sana güç verdi.',
          regretMajor: 'Geçmiş pişmanlıkların seni daha dikkatli ve kararlı yaptı.',
          guiltMajor: 'Vicdanının sesi seni doğru yola yönlendirdi.',
          mixedMajor: 'Hem zaferler hem yenilgiler seni olgunlaştırdı.',
          pride: 'Başarılarının verdiği özgüvenle ilerliyorsun.',
          regret: 'Geçmişten aldığın dersler seni şekillendirdi.',
        },
      },
    },
  },
  en: {
    storyText: {
      personality: {
        archetypes: {
          INTROVERT_CAUTIOUS: 'Introverted and cautious. Makes safe choices and avoids risk.',
          INTROVERT_BRAVE: 'Quiet but brave. Can achieve great things alone.',
          EXTROVERT_CAUTIOUS: 'Social but careful. Loves people but avoids reckless adventure.',
          EXTROVERT_BRAVE: 'A natural leader. Social and unafraid of taking risks.',
          EMPATH: 'Deeply empathetic. Feels others pain almost as their own.',
          PRAGMATIST: 'Pragmatic. Decides by logic more than emotion.',
          REBEL: 'Rebellious spirit. Pushes back against rules and authority.',
          CONFORMIST: 'Conforming. Respects rules and follows social norms.',
          BALANCED: 'Balanced personality. Adapts to the situation well.',
        },
        innerThoughts: {
          stressHigh: [
            'My head is a mess...',
            'I am struggling to breathe.',
            'Everything feels like too much...',
            'I need to be alone for a while.',
            'I feel like I am about to explode.',
          ],
          social: {
            INTROVERT_CAUTIOUS: 'I wish I had stayed home...',
            INTROVERT_BRAVE: 'People are exhausting, but the right move is still obvious.',
            EXTROVERT_CAUTIOUS: 'Being around people is nice, but I need to stay careful.',
            EXTROVERT_BRAVE: 'Let me warm this place up a little!',
            EMPATH: 'I can understand what everyone is feeling.',
            default: 'Let us see what today brings.',
          },
          risk: {
            brave: 'You never win without taking risks!',
            cautious: 'This looks very dangerous...',
            default: 'I need to think...',
          },
          moral: {
            empath: 'I have to do what is right, no matter the cost.',
            selfish: 'I should think about myself first.',
            default: 'This is a hard decision...',
          },
          daily: {
            default: 'Life goes on.',
          },
        },
        levels: {
          openness: {
            low: 'Introverted',
            mid: 'Socially balanced',
            high: 'Extroverted',
          },
          courage: {
            low: 'Cautious',
            mid: 'Balanced',
            high: 'Brave',
          },
          empathy: {
            low: 'Pragmatic',
            mid: 'Balanced',
            high: 'Empathetic',
          },
          patience: {
            low: 'Impulsive',
            mid: 'Balanced',
            high: 'Patient',
          },
          conformity: {
            low: 'Rebellious',
            mid: 'Balanced',
            high: 'Conforming',
          },
        },
      },
      school: {
        gradeReactions: {
          supportive: {
            high: `The moment your family saw you, their eyes lit up. "We're so proud of you!" they said.`,
            mid: `Your mother moved in for a hug. "We know you've worked hard, keep going," she said.`,
            low: `Your family felt a little disappointed, but they still tried to support you. "You were better last year," they said.`,
          },
          strict: {
            high: `Your father removed his glasses and looked you over. "This is exactly what I expected. Keep going."`,
            mid: `Your father looked at the grades. "It could be better. Study more math."`,
            low: `Your father slammed his fist on the table. "These grades are a disgrace! You need to study immediately!"`,
          },
          chaotic: {
            high: 'Your family barely reacted to the grades. Your success feels like your own business.',
            low: `Your family spiraled into chaos. "What are you even doing? I don't care, but you still failed," they said.`,
          },
        },
        yearEnd: {
          excellent: {
            strict: '🎉 Your father bought you a new phone! "This is your reward for succeeding," he said.',
            supportive: '🎊 Your family is proud of you! You can travel wherever you want this summer.',
            chaotic: '👍 Your grades are good. Your family did not care much, but at least you are free.',
          },
          good: {
            strict: '📚 Your father: "Not bad, but I expected better. Study a bit more over the summer."',
            default: '👍 Your family is satisfied with your grades. You will have a normal summer break.',
          },
          average: {
            strict: '😤 Your father: "These grades are unacceptable! Games and TV are banned all summer."',
            supportive: '😟 Your mother: "Next year will be better, right? You should study a little more."',
            chaotic: '🙄 Your family did not even care about the grades.',
          },
          poor: {
            strict: '😡 Your father slammed his fist on the table: "WHAT ARE THESE GRADES?! Phone, computer, friends... all banned! Your allowance is getting cut in half too!"',
            supportive: '😢 Your mother said sadly: "We love you very much, but something has to change with these grades. This summer will come with some restrictions."',
            chaotic: `😒 Your family barely even looked at the grades. "Your life, your problem," they said.`,
          },
        },
      },
      traits: {
        negativeGuidance: {
          LAZY: 'Keep discipline high and protect your study or workout routine.',
          PROCRASTINATOR: 'Set short goals and finish delayed tasks immediately.',
          BURNOUT_PRONE: 'Avoid intense actions on low energy and rest first.',
          LONE_WOLF: 'Increase social actions and rebuild your communication rhythm.',
          COWARD: 'Take controlled risks instead of freezing in hard moments.',
          CHEATER: 'Choose reliable long-term options over shortcuts.',
          REBELLIOUS: 'Try conciliatory choices during conflicts with family.',
          SICKLY: 'Build a health-focused routine and recover from energy dips early.',
          CLUMSY: 'Increase physical activities gradually and repeat them often.',
          default: 'To reduce this trait, keep practicing the opposite behavior pattern.',
        },
        gainSummary: '+ {traitName} gained.',
        removalSummary: '- {traitName} removed.',
        removalResolvedSummary: '- {traitName} removed (conflict: {resolverName}).',
      },
      endings: {
        careerNarratives: {
          nationalAthlete: {
            EXTROVERT_BRAVE: 'You pushed your limits with courage and reached the top.',
            INTROVERT_BRAVE: 'Your quiet but determined training earned everyones respect.',
            CONFORMIST: 'Discipline set you apart. Every day and every workout was sharp.',
            BALANCED: 'Your balanced approach carried you to long-term success.',
          },
          rockstarVirtuoso: {
            REBEL: 'You challenged the rules and carved your own path in music.',
            EMPATH: 'Your music reaches directly into peoples emotions.',
            EXTROVERT_BRAVE: 'The stage is your home. You give energy to thousands.',
            BALANCED: 'Your musical talent carried you toward the conservatory path.',
          },
          famousWriter: {
            INTROVERT_CAUTIOUS: 'The richness of your inner world spilled onto the page.',
            EMPATH: 'Understanding people gave you the power to write their stories.',
            REBEL: 'Your bold pen exposed the truths of society.',
            BALANCED: 'Your gift for writing carried you into the world of literature.',
          },
          medSchool: {
            EMPATH: 'Your empathy became your greatest strength in healing people.',
            CONFORMIST: 'Your disciplined work helped you overcome the demands of medical training.',
            INTROVERT_CAUTIOUS: 'Your careful and meticulous approach will make you an excellent doctor.',
            BALANCED: 'Your diligence and intelligence carried you into medicine.',
          },
          softwareEngineering: {
            REBEL: 'You are preparing to rebel against convention and build your own startup.',
            INTROVERT_CAUTIOUS: 'You sat quietly and designed major systems.',
            CONFORMIST: 'Your systematic work will make you the most reliable engineer in the room.',
            EMPATH: 'You dream of building software that truly helps people.',
            BALANCED: 'Your coding talent carried you into the tech world.',
          },
          entrepreneur: {
            REBEL: 'You stood out by taking on work nobody else dared to try.',
            EXTROVERT_BRAVE: 'You built and grew a team through leadership and courage.',
            BALANCED: 'You carved out your own road with commercial instinct.',
          },
          lawSchool: {
            REBEL: 'You chose law as your weapon against injustice.',
            EMPATH: 'You want to become a voice for the oppressed.',
            CONFORMIST: 'Your respect for rules and law pulled you toward the legal path.',
            BALANCED: 'Your sharp mind and rhetoric carried you into law.',
          },
          failureUnemployed: {
            REBEL: 'The system knocked you down, but your fire of rebellion did not fade.',
            INTROVERT_CAUTIOUS: 'You missed some chances, but new doors may still open.',
            BALANCED: 'Life does not always go the way you planned, but the story does not end here.',
          },
        },
        memoryInfluence: {
          prideMajor: 'A history full of achievements gave you strength.',
          regretMajor: 'Past regrets made you more careful and determined.',
          guiltMajor: 'Your conscience guided you back toward the right path.',
          mixedMajor: 'Both victories and defeats helped you mature.',
          pride: 'You move forward with the confidence your success gave you.',
          regret: 'The lessons you drew from the past shaped you.',
        },
      },
    },
  },
};
