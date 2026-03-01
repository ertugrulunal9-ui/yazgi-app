import { DomainStrings } from './types';

export const narrativeStrings: DomainStrings = {
  tr: {
    narrative: {
      choiceFallback: {
        text: 'Su an bu durumda acik bir secenek yok. Durumu kabul edip devam et.',
        feedback: 'Kosullar netlesene kadar beklemeyi sectin. Hikaye bir sonraki adima akiyor.',
      },
      memory: {
        timing: {
          lastYear: 'gecen yil',
          yearsAgo: '{years} yil once',
        },
        agePrefix: {
          current: 'Az once',
          atAge: '{age} yasinda',
        },
        random: {
          foundWallet: {
            negative: 'Buldugun o cuzdan sahnesi yeniden zihninde canlaniyor; vicdanin sizliyor.',
            positive: 'Cuzdani sahibine teslim ettigin an aklina geliyor; dogru olanin agirligi hafifletiyor.',
          },
          generic: '{timing} verdigin bir karar yine aklina dusuyor.',
        },
        emotionLine: {
          regret: '{agePrefix} yaptigin bir secimin golgesi icini hafifce yokluyor.',
          guilt: '{agePrefix} yasadigin bir sucluluk hissi sessizce geri donuyor.',
          pride: '{agePrefix} gosterdigin cesaret bugun yine omurgani diklestiriyor.',
          satisfaction: '{agePrefix} aldigin dogru karar icini yeniden sakinlestiriyor.',
          neutral: '{agePrefix} bir ani zihninde kisa bir iz birakiyor.',
        },
        decisionNarrative: {
          pride: '{age} yasinda gurur duydun.',
          regret: '{age} yasinda pisman oldun.',
          guilt: '{age} yasinda sucluluk hissettin.',
          satisfaction: '{age} yasinda huzur buldun.',
          neutral: '{age} yasinda bir karar verdin.',
        },
        themeSummary: {
          pridePath: {
            brave: 'Cesaretle dolu bir hayat yasadin. Korkularini yendin ve iz biraktin.',
            empath: 'Insanlara dokunarak hayatini anlamli kildin.',
            open: 'Yeni deneyimlere acik bir hayat surdun ve cok sey ogrendin.',
            default: 'Basarilarla dolu bir yolculuk gecirdin. Her adim seni guclendirdi.',
          },
          regretPath: {
            brave: 'Hatalar yaptin ama her seferinde ayaga kalktin. Bu cesaret seni tanimliyor.',
            empath: 'Pismanliklarin seni daha anlayisli bir insan yapti.',
            default: 'Dususler ve dersler dolu bir yolculuk. Her hata seni olgunlastirdi.',
          },
          mixedPath: 'Hem zaferler hem yenilgiler yasadin. Bu denge seni gercekten olgunlastirdi.',
        },
        familyOpening: {
          supportive: '{name} destekci bir ailede buyudu. Evin sicakligi, ona cesaret ve guven asiladi.',
          strict: '{name} kurallarla dolu bir evde buyudu. Disiplin, hayatinin ilk dersi oldu.',
          chaotic: '{name} kaotik bir evde buyudu. Duzensizlik icinde kendi yolunu bulmak zorunda kaldi.',
          default: '{name} bir cocuk olarak hayata basladi. Her gun yeni bir maceraydi.',
        },
        tendency: {
          helpful: 'yardimsever',
          pragmatic: 'pragmatik',
          aggressive: 'savasci',
        },
        paragraph: {
          earlyYears: 'Ilkokul ve ortaokul yillarinda onemli anlar yasadi. {lines}',
          teenYears: 'Ergenlik, belirleyici secimlerle dolu gecti. {lines}',
          personality: 'Yillar icinde kisiligi netlesti: {archetypeDesc} En belirgin ozelligi {highLabel} olmasi.',
          tendencySuffix: 'Davranislarinda {tendency} egilim baskin oldu.',
        },
      },
      monologue: {
        npcQuote: '{npcName}: "{line}"',
        identity: {
          tendency: {
            HELPFUL: 'Icindeki yardimsever ruh guclu.',
            PRAGMATIC: 'Icindeki pragmatik yan her gecen gun netlesiyor.',
            AGGRESSIVE: 'Icindeki savasci ruh hala canli.',
          },
        },
        banks: {
          cliffhanger: [
            '{title}... Aklim ondan cikmiyor.',
          ],
          crisis: {
            warning: [
              'Son gunlerde her sey daha agir geliyor. Biraz nefes almam lazim.',
            ],
            severe: [
              'Her sey ust uste biniyor. Bir adim geri atmazsam cokebilirim.',
            ],
            critical: [
              'Zihnim bulaniklasiyor. Durup toparlanmam gerek.',
            ],
          },
          mismatch: {
            ACADEMIC: [
              'Akademik hedefimle son secimlerim uyusmuyor. Rotami yeniden dusunmeliyim.',
            ],
            ATHLETIC: [
              'Spor hedefim var ama ritmim dusuyor. Disiplinimi geri kazanmaliyim.',
            ],
            CREATIVE: [
              'Yaratici hedefim var ama uretimim azaldi. Yeni bir ates yakmam gerek.',
            ],
            WEALTH: [
              'Maddi hedef koydum ama adimlarim yetersiz kaliyor. Plani netlestirmeliyim.',
            ],
            SOCIAL: [
              'Sosyal hedefim var ama baglarim zayifladi. Daha bilincli iletisim kurmaliyim.',
            ],
          },
          identity: {
            age7: [
              '{age} yasina girdin. {highLabel} yanin belirgin, {lowLabel} yanin ise seni zorluyor.',
            ],
            age10: [
              '{age} yasinda kimligin netlesiyor: {highLabel}, ama ayni zamanda {lowLabel}.',
            ],
            age13: [
              '{age} yasinda secimlerin agirlasti. {highLabel} tarafin guclu, {lowLabel} tarafin sinavda.',
            ],
            age15: [
              '{age} yasinda kendini daha iyi taniyorsun: {highLabel}, ama hala {lowLabel}.',
            ],
            age17: [
              '{age} yasinda son viraja girdin. {highLabel} seni ileri tasiyor, {lowLabel} iz birakiyor.',
            ],
            age18: [
              '{age} yasinda hikayen olgunlasti. {highLabel} ve {lowLabel} birlikte seni tanimliyor.',
            ],
          },
          milestone: {
            age7: [
              'Artik daha buyuksun. Yeni bir donem basliyor.',
            ],
            age10: [
              'Tek haneli yaslar geride kaldi. Icinde bir seyler degisiyor.',
            ],
            age11: [
              'On ikiye yaklasiyorsun. Ritmin hizlaniyor.',
            ],
            age13: [
              'Ergenlige girdin. Her sey daha karmasik hissettiriyor.',
            ],
            age15: [
              'Lise ortasindasin. Kim olacagina dair sorular buyuyor.',
            ],
            age17: [
              'Son bir yilin kaldi. Kararlarin agirligi artiyor.',
            ],
            age18: [
              'On sekizdesin. Yeni bir hayatin esigindesin.',
            ],
          },
          fate: {
            BLESSED: [
              'Kader bu turde yaninda gibi duruyor.',
            ],
            CURSED: [
              'Kader bu turde sert bir sinav aciyor.',
            ],
          },
          memoryRecall: {
            REGRET: [
              'O karar hala aklindan tam cikmiyor.',
            ],
            GUILT: [
              'O andaki sucluluk hissi geri geliyor.',
            ],
            PRIDE: [
              'O anki dogru durusun icini tekrar isitiyor.',
            ],
            SATISFACTION: [
              'O kararin verdigi huzur hala sende.',
            ],
            NEUTRAL: [
              'Gecmisten bir an kisa bir iz birakiyor.',
            ],
          },
          trait: {
            progress: [
              '{traitName} tarafin adim adim gucleniyor.',
            ],
            strong: [
              '{traitName} artik kimliginin merkezine yerlesti.',
            ],
          },
          momentum: {
            HELPFUL: [
              'Yardimsever ritmin gucleniyor.',
            ],
            PRAGMATIC: [
              'Pragmatik ritmin gucleniyor.',
            ],
            AGGRESSIVE: [
              'Agresif ritmin gucleniyor.',
            ],
          },
        },
      },
      causal: {
        pride: 'Gecmisteki cesur karar bugunku kapiyi acti.',
        satisfaction: 'Gecmisteki bilincli adim bugun meyve verdi.',
        regret: 'Gecmisteki secimin golgesi bugune uzandi.',
        guilt: 'Vicdani agirlik tasiyan an bugun yeniden karsina cikti.',
        neutral: 'Gecmisteki secim bugune bir bag kurdu.',
      },
      npcReaction: {
        formatted: '{line}',
        friend: {
          openness: ['Yeni seylere acik yanin dikkat cekiyor, ama dengeyi koru.'],
          courage: ['Cesaretin etkileyici, ama riskin bedelini de dusun.'],
          empathy: ['Empatin cok guclu, kendine de alan acmayi unutma.'],
          patience: ['Sabrin seni tasiyor, ama bazen hizlanmak da gerekir.'],
          conformity: ['Duzenli tarafin guven veriyor, ama bazen sinirlari test et.'],
        },
        best_friend: {
          openness: ['Seni en iyi ben bilirim: acik fikirlisin ve bu seni buyutuyor.'],
          courage: ['Cesaretin hayranlik uyandiriyor, yine de kendini koru.'],
          empathy: ['Insanlari derinden anliyorsun; bu cok nadir bir guc.'],
          patience: ['Sabirli tarafin krizlerde seni ayakta tutuyor.'],
          conformity: ['Kuralli tarafin istikrar sagliyor; bazen esneklik de iyi gelir.'],
        },
        crush: {
          openness: ['Acik fikirliligin beni sana daha cok cekiyor.'],
          courage: ['Cesaretin etkileyici, yaninda ben de gucleniyorum.'],
          empathy: ['Empatin seni daha da cekici kiliyor.'],
          patience: ['Sakinligin yaninda kendimi guvende hissediyorum.'],
          conformity: ['Dengeyi koruyan tarafin bana huzur veriyor.'],
        },
        rival: {
          openness: ['Cok yonlu olman guc gibi gorunuyor, ama kararsizlik da yaratabilir.'],
          courage: ['Cesaretin var, ama bazen hesapsiz risk aliyorsun.'],
          empathy: ['Duygusallik sahada zayiflik yaratabilir.'],
          patience: ['Cok beklemek firsat kacirmana neden olabilir.'],
          conformity: ['Kurallara fazla baglilik seni yavaslatabilir.'],
        },
        enemy: {
          openness: ['Dalda dalga gezmen seni kirilgan yapabilir.'],
          courage: ['Risklerin buyuk; bedeli de buyuk olabilir.'],
          empathy: ['Bu dunyada asiri empati seni asindirir.'],
          patience: ['Beklemek her zaman kazandirmez.'],
          conformity: ['Kurallara fazla baglilik seni sinirlar icinde tutar.'],
        },
        partner: {
          openness: ['Yeniye acik olman iliskimizi canli tutuyor.'],
          courage: ['Cesaretin bana da guc veriyor.'],
          empathy: ['Empatin iliskimizi daha derin yapiyor.'],
          patience: ['Sabrin zor anlarda en buyuk dayanak oluyor.'],
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
