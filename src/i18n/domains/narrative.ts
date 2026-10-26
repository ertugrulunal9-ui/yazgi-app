import { DomainStrings } from './types';

export const narrativeStrings: DomainStrings = {
  tr: {
    narrative: {
      choiceFallback: {
        text: 'Şu an bu durumda açık bir seçenek yok. Durumu kabul edip devam et.',
        feedback: 'Koşullar netleşene kadar beklemeyi seçtin. Hikaye bir sonraki adıma akıyor.',
      },
      memory: {
        timing: {
          lastYear: 'geçen yıl',
          yearsAgo: '{years} yıl önce',
        },
        agePrefix: {
          current: 'Az önce',
          atAge: '{age} yaşında',
        },
        random: {
          foundWallet: {
            negative: 'Bulduğun o cüzdan sahnesi yeniden zihninde canlanıyor; vicdanın sızlıyor.',
            positive: 'Cüzdanı sahibine teslim ettiğin an aklına geliyor; doğru olanın ağırlığı hafifletiyor.',
          },
          generic: '{timing} verdiğin bir karar yine aklına düşüyor.',
        },
        emotionLine: {
          regret: '{agePrefix} yaptığın bir seçimin gölgesi içini hafifçe yokluyor.',
          guilt: '{agePrefix} yaşadığın bir suçluluk hissi sessizce geri dönüyor.',
          pride: '{agePrefix} gösterdiğin cesaret bugün yine omurganı dikleştiriyor.',
          satisfaction: '{agePrefix} aldığın doğru karar içini yeniden sakinleştiriyor.',
          neutral: '{agePrefix} bir anı zihninde kısa bir iz bırakıyor.',
        },
        decisionNarrative: {
          pride: '{age} yaşında gurur duydun.',
          regret: '{age} yaşında pişman oldun.',
          guilt: '{age} yaşında suçluluk hissettin.',
          satisfaction: '{age} yaşında huzur buldun.',
          neutral: '{age} yaşında bir karar verdin.',
        },
        themeSummary: {
          pridePath: {
            brave: 'Cesaretle dolu bir hayat yaşadın. Korkularını yendin ve iz bıraktın.',
            empath: 'İnsanlara dokunarak hayatını anlamlı kıldın.',
            open: 'Yeni deneyimlere açık bir hayat sürdün ve çok şey öğrendin.',
            default: 'Başarılarla dolu bir yolculuk geçirdin. Her adım seni güçlendirdi.',
          },
          regretPath: {
            brave: 'Hatalar yaptın ama her seferinde ayağa kalktın. Bu cesaret seni tanımlıyor.',
            empath: 'Pişmanlıkların seni daha anlayışlı bir insan yaptı.',
            default: 'Düşüşler ve dersler dolu bir yolculuk. Her hata seni olgunlaştırdı.',
          },
          mixedPath: 'Hem zaferler hem yenilgiler yaşadın. Bu denge seni gerçekten olgunlaştırdı.',
        },
        familyOpening: {
          supportive: '{name} destekçi bir ailede büyüdü. Evin sıcaklığı, ona cesaret ve güven aşıladı.',
          strict: '{name} kurallarla dolu bir evde büyüdü. Disiplin, hayatının ilk dersi oldu.',
          chaotic: '{name} kaotik bir evde büyüdü. Düzensizlik içinde kendi yolunu bulmak zorunda kaldı.',
          default: '{name} bir çocuk olarak hayata başladı. Her gün yeni bir maceraydi.',
        },
        tendency: {
          helpful: 'yardımsever',
          pragmatic: 'pragmatik',
          aggressive: 'savaşçı',
        },
        paragraph: {
          earlyYears: 'İlkokul ve ortaokul yıllarında önemli anlar yaşadı. {lines}',
          teenYears: 'Ergenlik, belirleyici seçimlerle dolu geçti. {lines}',
          personality: 'Yıllar içinde kişiliği netleşti: {archetypeDesc} En belirgin özelliği {highLabel} olması.',
          tendencySuffix: 'Davranışlarında {tendency} eğilim baskın oldu.',
        },
      },
      monologue: {
        npcQuote: '{npcName}: "{line}"',
        identity: {
          tendency: {
            HELPFUL: 'İçindeki yardımsever ruh güçlü.',
            PRAGMATIC: 'İçindeki pragmatik yan her geçen gün netleşiyor.',
            AGGRESSIVE: 'İçindeki savaşçı ruh hâlâ canlı.',
          },
        },
        banks: {
          cliffhanger: [
            '{title}... Aklım ondan çıkmıyor.',
          ],
          crisis: {
            warning: [
              'Son günlerde her şey daha ağır geliyor. Biraz nefes almam lazım.',
            ],
            severe: [
              'Her şey üst üste biniyor. Bir adım geri atmazsam çökebilirim.',
            ],
            critical: [
              'Zihnim bulaniklasiyor. Durup toparlanmam gerek.',
            ],
          },
          mismatch: {
            ACADEMIC: [
              'Akademik hedefimle son seçimlerim uyuşmuyor. Rotamı yeniden düşünmeliyim.',
            ],
            ATHLETIC: [
              'Spor hedefim var ama ritmim düşüyor. Disiplinimi geri kazanmalıyım.',
            ],
            CREATIVE: [
              'Yaratıcı hedefim var ama üretimim azaldı. Yeni bir ateş yakmam gerek.',
            ],
            WEALTH: [
              'Maddi hedef koydum ama adımlarım yetersiz kalıyor. Planı netleştirmeliyim.',
            ],
            SOCIAL: [
              'Sosyal hedefim var ama bağlarım zayıfladı. Daha bilinçli iletişim kurmalıyım.',
            ],
          },
          identity: {
            age7: [
              '{age} yaşına girdin. {highLabel} yanın belirgin, {lowLabel} yanın ise seni zorluyor.',
            ],
            age10: [
              '{age} yaşında kimliğin netleşiyor: {highLabel}, ama aynı zamanda {lowLabel}.',
            ],
            age13: [
              '{age} yaşında seçimlerin ağırlaştı. {highLabel} tarafın güçlü, {lowLabel} tarafın sınavda.',
            ],
            age15: [
              '{age} yaşında kendini daha iyi taniyorsun: {highLabel}, ama hâlâ {lowLabel}.',
            ],
            age17: [
              '{age} yaşında son viraja girdin. {highLabel} seni ileri taşıyor, {lowLabel} iz bırakıyor.',
            ],
            age18: [
              '{age} yaşında hikayen olgunlasti. {highLabel} ve {lowLabel} birlikte seni tanımlıyor.',
            ],
          },
          milestone: {
            age7: [
              'Artık daha büyüksün. Yeni bir dönem başlıyor.',
            ],
            age10: [
              'Tek haneli yaşlar geride kaldı. İçinde bir şeyler değişiyor.',
            ],
            age11: [
              'On ikiye yaklasiyorsun. Ritmin hizlaniyor.',
            ],
            age13: [
              'Ergenliğe girdin. Her şey daha karmaşık hissettiriyor.',
            ],
            age15: [
              'Lise ortasındasın. Kim olacağına dair sorular büyüyor.',
            ],
            age17: [
              'Son bir yılın kaldı. Kararların ağırlığı artıyor.',
            ],
            age18: [
              'On sekizdesin. Yeni bir hayatın eşiğindesin.',
            ],
          },
          fate: {
            BLESSED: [
              'Kader bu turde yanında gibi duruyor.',
            ],
            CURSED: [
              'Kader bu turde sert bir sınav açıyor.',
            ],
          },
          memoryRecall: {
            REGRET: [
              'O karar hâlâ aklından tam çıkmıyor.',
            ],
            GUILT: [
              'O andaki suçluluk hissi geri geliyor.',
            ],
            PRIDE: [
              'O anki doğru duruşun içini tekrar ısıtıyor.',
            ],
            SATISFACTION: [
              'O kararın verdiği huzur hâlâ sende.',
            ],
            NEUTRAL: [
              'Geçmişten bir an kısa bir iz bırakıyor.',
            ],
          },
          trait: {
            progress: [
              '{traitName} tarafın adım adım güçleniyor.',
            ],
            strong: [
              '{traitName} artık kimliğinin merkezine yerleşti.',
            ],
          },
          momentum: {
            HELPFUL: [
              'Yardımsever ritmin güçleniyor.',
            ],
            PRAGMATIC: [
              'Pragmatik ritmin güçleniyor.',
            ],
            AGGRESSIVE: [
              'Agresif ritmin güçleniyor.',
            ],
          },
        },
      },
      causal: {
        pride: 'Geçmişteki cesur karar bugünkü kapıyı açtı.',
        satisfaction: 'Geçmişteki bilinçli adım bugün meyve verdi.',
        regret: 'Geçmişteki seçimin gölgesi bugüne uzandı.',
        guilt: 'Vicdani ağırlık taşıyan an bugün yeniden karşına çıktı.',
        neutral: 'Geçmişteki seçim bugüne bir bağ kurdu.',
      },
      causalTemplates: {
        pride: [
          'Geçmişte verdiğin cesur karar bu kapıyı açtı.',
          'O an doğru olanı yaptın; şimdi o an sana geri dönüyor.',
          'Gururla verdiğin karar bugünü getirdi.',
          'Yıllar önce göğsünü kabartan o an, bugün burada yankılanıyor.',
          'Korkuna rağmen verdiğin karar, şimdi önünde yeni bir yol açıyor.',
          'O günkü cesaretinin meyvesini şimdi topluyorsun.',
        ],
        satisfaction: [
          'Geçmişte aldığın doğru karar bugün meyvesini veriyor.',
          'O seçim boşa gitmemişti. Şimdi anlıyorsun neden.',
          'Bilinçli bir adım atmıştın; sonucu bu.',
          'İçin rahat şekilde verdiğin karar seni bugün bu noktaya taşıdı.',
          'O gün doğru olanı seçmiştin. Bugün bunu anlıyorsun.',
          'Huzurla aldığın karar sessizce köklendi; şimdi filizleniyor.',
        ],
        regret: [
          'Geçmişte verdiğin bir karar bugünü şekillendiriyor.',
          'O an yaptığın seçimin gölgesi hâlâ üzerinde.',
          'Pişmanlığını taşıdığın o karar, bugün karşına çıkıyor.',
          'Farklı seçseydin ne olurdu diye düşündüğün an, bugün seni buluyor.',
          'Geride bıraktığını sandığın karar hiç gitmemişti aslında.',
          'O yolun seni nereye götüreceğini artık görüyorsun.',
        ],
        guilt: [
          'Suçluluk duyduğun o anın ağırlığı bugün geri döndü.',
          'Geçmişte yapamadığın ya da yanlış yaptığın bir şey seni burada buluyor.',
          'O an vicdanını sızlatan seçim bugün karşına çıktı.',
          'Yüzleşmekten kaçtığın an şimdi seni bekliyor.',
          'Vicdanın hiç unutmamıştı; şimdi o anın hesabı soruluyor.',
          'O gün verdiğin karar içinde bir yük bırakmıştı. Şimdi o yük konuşuyor.',
        ],
        neutral: [
          'Geçmişte yaşananlar bugünü buraya getirdi.',
          'O zamanki karar bugün bir kapı araladı.',
          'Hayatının ilerleyen bir noktasında bu anı hatırlayacaksın.',
          'Geçmişin bugünle sessizce konuştuğu anlardan birindesin.',
          'O gün attığın adım, bugünkü yolu döşedi.',
        ],
      },
      family: {
        thoughts: {
          strictLowRelation: 'Babam yine kızacak. Her şeyi doğru yapmam lazım.',
          chaoticTeen: 'Keşke evde biraz daha düzen olsa.',
          supportiveHighRelation: 'Evde hata yapsam bile beni dinleyen biri var.',
          poor: 'Arkadaşlarımın yeni telefonu var... Bizim neden yok?',
          rich: 'Herkes benden bir şey bekliyor gibi.',
          strictWarmth: 'Evdeki ton değişti. Artık sadece emir değil, sohbet de var.',
          crisis: 'Evdeki sessizlik bazen bagirmaktan daha ağır.',
          fallback: {
            strict: 'Evde kurallar net. Hata yaparsam hemen fark edilir.',
            chaotic: 'Evde herkes kendi ritminde. Plan yapmak zor.',
            supportive: 'Ailem yanımda olduğunu hissettiriyor.',
          },
        },
        atmosphere: {
          unknown: 'Belirsiz',
          crisis: 'Gerilimli Sessizlik',
          softening: 'Yumuşayan Otorite',
          secure: 'Güvenli',
          fragile: 'Kırılgan',
          strict: 'Disiplinli',
          chaotic: 'Dağınık',
          supportive: 'Destekleyici',
        },
      },
      eventTeaser: {
        criticalDecision: 'Kritik bir karar yaklaşıyor. Hazır mısın?',
        breakdown: 'Bunaltici bir dönem başlıyor...',
        moral: 'Ahlaki bir ikilem seni bekliyor...',
        risk: 'Riskli bir fırsat kapıda...',
        agePage: '{age} yaşında yeni bir sayfa açılıyor...',
      },
      npcReaction: {
        formatted: '{line}',
        friend: {
          openness: ['Yeni seylere açık yanin dikkat cekiyor, ama dengeyi koru.'],
          courage: ['Cesaretin etkileyici, ama riskin bedelini de dusun.'],
          empathy: ['Empatin çok güçlü, kendine de alan acmayi unutma.'],
          patience: ['Sabrin seni taşıyor, ama bazen hizlanmak da gerekir.'],
          conformity: ['Duzenli tarafin guven veriyor, ama bazen sinirlari test et.'],
        },
        best_friend: {
          openness: ['Seni en iyi ben bilirim: açık fikirlisin ve bu seni buyutuyor.'],
          courage: ['Cesaretin hayranlik uyandiriyor, yine de kendini koru.'],
          empathy: ['Insanlari derinden anliyorsun; bu çok nadir bir güç.'],
          patience: ['Sabirli tarafin krizlerde seni ayakta tutuyor.'],
          conformity: ['Kuralli tarafin istikrar sagliyor; bazen esneklik de iyi gelir.'],
        },
        crush: {
          openness: ['Açık fikirliligin beni sana daha çok cekiyor.'],
          courage: ['Cesaretin etkileyici, yaninda ben de gucleniyorum.'],
          empathy: ['Empatin seni daha da cekici kiliyor.'],
          patience: ['Sakinligin yaninda kendimi guvende hissediyorum.'],
          conformity: ['Dengeyi koruyan tarafin bana huzur veriyor.'],
        },
        rival: {
          openness: ['Çok yonlu olman güç gibi görünüyor, ama kararsizlik da yaratabilir.'],
          courage: ['Cesaretin var, ama bazen hesapsiz risk aliyorsun.'],
          empathy: ['Duygusallik sahada zayiflik yaratabilir.'],
          patience: ['Çok beklemek firsat kacirmana neden olabilir.'],
          conformity: ['Kurallara fazla baglilik seni yavaslatabilir.'],
        },
        enemy: {
          openness: ['Dalda dalga gezmen seni kirilgan yapabilir.'],
          courage: ['Risklerin büyük; bedeli de büyük olabilir.'],
          empathy: ['Bu dunyada asiri empati seni asindirir.'],
          patience: ['Beklemek her zaman kazandirmez.'],
          conformity: ['Kurallara fazla baglilik seni sinirlar icinde tutar.'],
        },
        partner: {
          openness: ['Yeniye açık olman iliskimizi canli tutuyor.'],
          courage: ['Cesaretin bana da güç veriyor.'],
          empathy: ['Empatin iliskimizi daha derin yapiyor.'],
          patience: ['Sabrin zor anlarda en büyük dayanak oluyor.'],
          conformity: ['Dengeyi koruyan tarafin bize guven veriyor.'],
        },
      },
    },
  },
  en: {
    narrative: {
      choiceFallback: {
        text: 'No valid option is available in this state. Accept and move forward.',
        feedback: 'You chose to wait until the conditions are clearer. The story moves to the next beat.',
      },
      memory: {
        timing: {
          lastYear: 'last year',
          yearsAgo: '{years} years ago',
        },
        agePrefix: {
          current: 'this moment',
          atAge: 'age {age}',
        },
        random: {
          foundWallet: {
            negative: 'That wallet moment replays in your head; your conscience aches.',
            positive: 'You remember returning the wallet; doing the right thing still lightens you.',
          },
          generic: 'A decision from {timing} comes back to mind.',
        },
        emotionLine: {
          regret: 'At {agePrefix}, the shadow of a choice quietly brushes your thoughts.',
          guilt: 'At {agePrefix}, a feeling of guilt returns in silence.',
          pride: 'At {agePrefix}, your courage steadies your spine again.',
          satisfaction: 'At {agePrefix}, a right decision calms you once more.',
          neutral: 'At {agePrefix}, a memory leaves a brief trace in your mind.',
        },
        decisionNarrative: {
          pride: 'At age {age}, you felt proud.',
          regret: 'At age {age}, you felt regret.',
          guilt: 'At age {age}, you felt guilt.',
          satisfaction: 'At age {age}, you found peace.',
          neutral: 'At age {age}, you made a choice.',
        },
        themeSummary: {
          pridePath: {
            brave: 'You lived with courage. You faced fear and left a mark.',
            empath: 'You gave your life meaning by reaching other people.',
            open: 'You stayed open to new experiences and learned deeply.',
            default: 'You walked a path of achievements. Each step made you stronger.',
          },
          regretPath: {
            brave: 'You made mistakes but stood up each time. That courage defines you.',
            empath: 'Your regrets made you more understanding.',
            default: 'Your path held falls and lessons. Each mistake matured you.',
          },
          mixedPath: 'You lived both victories and defeats. That balance truly matured you.',
        },
        familyOpening: {
          supportive: '{name} grew up in a supportive family. Warmth gave confidence and courage.',
          strict: '{name} grew up in a house of rules. Discipline was the first lesson.',
          chaotic: '{name} grew up in chaos and had to carve a path alone.',
          default: '{name} started life as a child of possibility. Every day was a new turn.',
        },
        tendency: {
          helpful: 'helpful',
          pragmatic: 'pragmatic',
          aggressive: 'aggressive',
        },
        paragraph: {
          earlyYears: 'In primary and middle school years, key moments stood out. {lines}',
          teenYears: 'Adolescence was full of defining choices. {lines}',
          personality: 'Over the years, personality crystallized: {archetypeDesc} The clearest trait became being {highLabel}.',
          tendencySuffix: 'In behavior, a {tendency} tendency became dominant.',
        },
      },
      monologue: {
        npcQuote: '{npcName}: "{line}"',
        identity: {
          tendency: {
            HELPFUL: 'Your helpful core feels stronger.',
            PRAGMATIC: 'Your pragmatic side is becoming clearer each day.',
            AGGRESSIVE: 'Your fighting edge is still alive.',
          },
        },
        banks: {
          cliffhanger: [
            '{title}... I cannot get it out of my head.',
          ],
          crisis: {
            warning: [
              'Everything feels heavier lately. I need to breathe and reset.',
            ],
            severe: [
              'Everything is piling up. If I do not step back, I may crash.',
            ],
            critical: [
              'My mind is getting blurry. I need to stop and recover now.',
            ],
          },
          mismatch: {
            ACADEMIC: [
              'My recent choices are drifting from my academic goal. I should recalibrate.',
            ],
            ATHLETIC: [
              'I have an athletic goal, but my rhythm is slipping. I need discipline back.',
            ],
            CREATIVE: [
              'I aim to create, but output is fading. I need to reignite that spark.',
            ],
            WEALTH: [
              'I set a wealth goal, but my actions are too weak. The plan needs clarity.',
            ],
            SOCIAL: [
              'I want stronger bonds, but my connections are thinning. I should act with intent.',
            ],
          },
          identity: {
            age7: [
              'At age {age}, your {highLabel} side grows clearer while {lowLabel} still challenges you.',
            ],
            age10: [
              'At age {age}, your identity sharpens: {highLabel}, yet also {lowLabel}.',
            ],
            age13: [
              'At age {age}, choices carry weight. {highLabel} leads, {lowLabel} is tested.',
            ],
            age15: [
              'At age {age}, you know yourself better: {highLabel}, but still {lowLabel}.',
            ],
            age17: [
              'At age {age}, the final stretch begins. {highLabel} pushes you forward, {lowLabel} leaves marks.',
            ],
            age18: [
              'At age {age}, your story matures. {highLabel} and {lowLabel} define you together.',
            ],
          },
          milestone: {
            age7: [
              'You are older now. A new chapter begins.',
            ],
            age10: [
              'Single-digit years are over. Something shifts inside.',
            ],
            age11: [
              'Twelve is close. Your pace is quickening.',
            ],
            age13: [
              'You entered adolescence. Everything feels more complex.',
            ],
            age15: [
              'You are in mid-high school. The question of who you are grows louder.',
            ],
            age17: [
              'Only one year remains. Choices feel heavier now.',
            ],
            age18: [
              'You are eighteen. A new life stands at the threshold.',
            ],
          },
          fate: {
            BLESSED: [
              'Fate seems to stand with you this turn.',
            ],
            CURSED: [
              'Fate opens a harsh test this turn.',
            ],
          },
          memoryRecall: {
            REGRET: [
              'That choice still lingers in your mind.',
            ],
            GUILT: [
              'The guilt from that moment rises again.',
            ],
            PRIDE: [
              'The way you stood then still warms you now.',
            ],
            SATISFACTION: [
              'The calm from that decision is still with you.',
            ],
            NEUTRAL: [
              'A moment from the past leaves a brief trace.',
            ],
          },
          trait: {
            progress: [
              'Your {traitName} side is steadily strengthening.',
            ],
            strong: [
              '{traitName} is now near the center of who you are.',
            ],
          },
          momentum: {
            HELPFUL: [
              'Your helpful rhythm is getting stronger.',
            ],
            PRAGMATIC: [
              'Your pragmatic rhythm is getting stronger.',
            ],
            AGGRESSIVE: [
              'Your aggressive rhythm is getting stronger.',
            ],
          },
        },
      },
      causal: {
        pride: 'A brave decision in the past opened this door today.',
        satisfaction: 'A conscious step in the past pays off now.',
        regret: 'The shadow of an old choice stretches into today.',
        guilt: 'A heavy moment of conscience returns to face you now.',
        neutral: 'A past choice ties directly into this moment.',
      },
      causalTemplates: {
        pride: [
          'A brave decision from your past opened this door.',
          'You did the right thing then, and now it returns to you.',
          'The choice you made with pride led you here.',
          'That moment that once filled your chest with pride echoes here today.',
          'The choice you made despite your fear opens a new path now.',
          'You are finally harvesting the courage you showed that day.',
        ],
        satisfaction: [
          'A right decision from the past is paying off today.',
          'That choice was not wasted. Now you see why.',
          'You took a conscious step, and this is the result.',
          'The calm decision you made then brought you to this point today.',
          'You chose what was right that day. Now you understand it.',
          'A peaceful decision quietly took root, and now it is blooming.',
        ],
        regret: [
          'A decision from your past is shaping today.',
          'The shadow of that choice still lingers over you.',
          'The decision you regret stands before you again.',
          'That moment you kept revisiting returns to find you today.',
          'The decision you thought you left behind never truly left.',
          'You can finally see where that road was taking you.',
        ],
        guilt: [
          'The weight of that guilty moment returned today.',
          'Something you failed to do, or did wrong, finds you here.',
          'The choice that hurt your conscience then stands before you now.',
          'The moment you avoided facing is waiting for you now.',
          'Your conscience never forgot, and now it asks for an answer.',
          'The choice you made that day left a burden inside you. Now it speaks.',
        ],
        neutral: [
          'What happened in the past brought today here.',
          'The decision you made then opened a door now.',
          'At some point later in life, you will remember this moment.',
          'This is one of those moments when the past quietly speaks to the present.',
          'The step you took then laid the road you walk today.',
        ],
      },
      family: {
        thoughts: {
          strictLowRelation: 'Dad is going to get angry again. I have to do everything right.',
          chaoticTeen: 'I wish things were a little more orderly at home.',
          supportiveHighRelation: 'Even when I make mistakes, there is someone at home who listens to me.',
          poor: 'My friends have new phones... why do we not?',
          rich: 'It feels like everyone expects something from me.',
          strictWarmth: 'The tone at home changed. It is not only orders anymore; there is conversation too.',
          crisis: 'The silence at home can feel heavier than shouting.',
          fallback: {
            strict: 'The rules at home are clear. If I slip, it is noticed immediately.',
            chaotic: 'Everyone at home moves at their own rhythm. Planning is hard.',
            supportive: 'My family makes me feel they are with me.',
          },
        },
        atmosphere: {
          unknown: 'Unclear',
          crisis: 'Tense Silence',
          softening: 'Softening Authority',
          secure: 'Secure',
          fragile: 'Fragile',
          strict: 'Disciplined',
          chaotic: 'Messy',
          supportive: 'Supportive',
        },
      },
      eventTeaser: {
        criticalDecision: 'A critical decision is approaching. Are you ready?',
        breakdown: 'An overwhelming period is beginning...',
        moral: 'A moral dilemma is waiting for you...',
        risk: 'A risky opportunity is at the door...',
        agePage: 'A new page is opening at age {age}...',
      },
      npcReaction: {
        formatted: '{line}',
        friend: {
          openness: ['Your open side stands out, but keep your balance.'],
          courage: ['Your courage is clear, but think about the cost of risk too.'],
          empathy: ['Your empathy is strong, but make space for yourself as well.'],
          patience: ['Your patience carries you, yet sometimes speed is needed.'],
          conformity: ['Your orderly side feels safe, but testing boundaries can help.'],
        },
        best_friend: {
          openness: ['I know you best: your openness keeps you growing.'],
          courage: ['Your courage is admirable. Just protect yourself too.'],
          empathy: ['You understand people deeply. That is rare.'],
          patience: ['Your patience keeps you steady in crisis.'],
          conformity: ['Your structure gives stability; flexibility can still matter.'],
        },
        crush: {
          openness: ['Your openness draws me in.'],
          courage: ['Your courage is attractive and makes me braver too.'],
          empathy: ['Your empathy makes you even more magnetic.'],
          patience: ['Your calm makes me feel safe around you.'],
          conformity: ['Your balance gives me peace.'],
        },
        rival: {
          openness: ['Your range looks strong, but it can also look indecisive.'],
          courage: ['You are bold, but sometimes you risk too much.'],
          empathy: ['Too much emotion can become a weakness in competition.'],
          patience: ['Waiting too long can cost opportunities.'],
          conformity: ['Too much rule-following can slow you down.'],
        },
        enemy: {
          openness: ['Jumping across directions can make you fragile.'],
          courage: ['Your risks are large, and so is the price.'],
          empathy: ['In this world, too much empathy wears you down.'],
          patience: ['Waiting does not always win.'],
          conformity: ['Too much conformity keeps you boxed in.'],
        },
        partner: {
          openness: ['Your openness keeps our bond alive.'],
          courage: ['Your courage gives me strength too.'],
          empathy: ['Your empathy makes our connection deeper.'],
          patience: ['Your patience holds us together in hard moments.'],
          conformity: ['Your balance gives us trust and stability.'],
        },
      },
    },
  },
};
