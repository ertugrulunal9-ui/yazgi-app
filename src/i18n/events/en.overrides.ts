import type { EventTranslationCatalog } from './types';
import { enEventTranslationsGenerated } from './en.generated';

// Hand-polished lines for high-visibility events.
export const enEventTranslationsOverrides: EventTranslationCatalog = {
  tr_ilk_adim: {
    text: "You're on your feet. One step... two steps... you're walking! Your mom tears up with joy.",
    choices: {
      adim_devam: {
        text: 'Try to run!',
        feedback: "You tumble, then pop right back up. That's one determined little hero.",
      },
    },
  },
  tr_ilk_kelime: {
    text: "A sound slips out of your mouth... 'Mom?' 'Dad?' Everyone at home holds their breath.",
    choices: {
      kelime_anne: {
        text: 'Mom!',
        feedback: "MOM! Your mother lifts you into the air, eyes full of tears.",
      },
      kelime_baba: {
        text: 'Dad!',
        feedback: "DAD! Your father bursts with pride and tells everyone.",
      },
    },
  },
  tr_oyuncak_paylasim: {
    text: "A child in the park wants your toy. You don't want to give it up, but your mother is watching.",
    choices: {
      oyuncak_paylas: {
        text: 'Share it',
        feedback: 'It was hard, but you shared. The child smiled, and you felt quietly proud.',
      },
      oyuncak_tutma: {
        text: "No! It's mine!",
        feedback: "The other child started crying and your mother looked embarrassed. But yes, it's still your toy.",
      },
    },
  },
  tr_gece_korkusu: {
    text: "Night feels scary. It almost feels like there's something under the bed...",
    choices: {
      korku_anne: {
        text: 'Mom! Dad!',
        feedback: 'Your mother hugs you and sings softly. You calm down and drift to sleep.',
      },
      korku_cesur: {
        text: 'Look under the bed',
        feedback: "Dust and old toys. Nothing to fear. You were brave tonight.",
      },
    },
  },
  tr_el_opme_zorlanma: {
    text: "You're visiting relatives. Your mom says, 'Go kiss your aunt or uncle's hand.' But you really don't want to.",
    choices: {
      el_op_zorla: {
        text: 'Do it reluctantly',
        feedback: "You do it, but only out of pressure. Your family is pleased, even if you're not.",
      },
      el_opme_reddet: {
        text: "Refuse firmly",
        feedback: "You stand your ground. The room gets tense, and your mother looks uncomfortable.",
      },
    },
  },
  tr_kre_ilk_gun: {
    text: 'First day of nursery school. Mom is about to leave. New faces, strange sounds...',
    choices: {
      kres_agla: {
        text: 'Cry and cling to Mom',
        feedback: "You cry for a bit, but the teacher calms you down. You'll settle in over time.",
      },
      kres_oyun: {
        text: 'Run to the toys',
        feedback: "The toys steal your attention. You barely notice Mom leaving.",
      },
    },
  },
  tr_sebze_yemek: {
    text: "Mom puts broccoli on your plate. It looks suspiciously green. You should eat it, but...",
    choices: {
      sebze_ye: {
        text: 'Eat it (with a grimace)',
        feedback: 'It is not as bad as you expected. Mom looks genuinely proud.',
      },
      sebze_tukur: {
        text: 'Spit it out!',
        feedback: "Broccoli hits the wall. Mom loses it. At least you didn't swallow it.",
      },
      sebze_gizle: {
        text: 'Hide it under the napkin',
        feedback: 'No one saw it... or so you think. Clever, or just sneaky?',
      },
    },
  },
  tr_tuvalet_egitimi: {
    text: "No more diapers. It's potty-training time.",
    choices: {
      tuvalet_basari: {
        text: 'Use the potty',
        feedback: "Huge applause, songs, maybe even a reward. You're officially a big kid now.",
      },
    },
  },
  tr_kardes_gelmis: {
    text: "A new baby has arrived at home. You're not the only child anymore, and Mom is busy all day.",
    choices: {
      kardes_sev: {
        text: 'Gently hug the baby',
        feedback: 'You reach out softly. The baby looks right at you. Maybe this is your new best friend.',
      },
      kardes_kiskan: {
        text: 'I want to be the baby too!',
        feedback: 'Jealousy is normal. Mom reminds you that she loves you just as much.',
      },
    },
  },
  tr_misafir_oyuncak: {
    text: 'Guests are over. Their little kid wants your favorite toy, and Mom is watching.',
    choices: {
      misafir_ver: {
        text: 'Give it up (reluctantly)',
        feedback: 'You hand it over even though it stings. The child beams, and Mom hugs you for being generous.',
      },
      misafir_gizle: {
        text: 'Hide the toy',
        feedback: 'You stash it under a pillow. The kid cries, Mom gets upset, but your toy stays yours.',
      },
      misafir_baska: {
        text: 'Offer a different toy',
        feedback: "'This one is even better,' you say. Crisis solved, everyone is happy.",
      },
    },
  },
  tr_market_inat: {
    text: 'You spot chocolate at the market. You want it. Mom says no. Tantrum time?',
    choices: {
      market_agla: {
        text: 'Drop to the floor and cry',
        feedback: "Full meltdown. Everyone stares. No chocolate, but you do get the whole store's attention.",
      },
      market_sabret: {
        text: 'Be upset, but accept it',
        feedback: 'It hurts, but you hold it together. Mom is surprised and proud.',
      },
      market_pazarlik: {
        text: "Say 'please' with puppy eyes",
        feedback: 'You plead dramatically. Mom softens. Chocolate secured.',
      },
    },
  },
  tr_kopek_korkusu: {
    text: "A big dog appears on the street. Its tail is wagging, but you're scared. Dad says, 'Come closer.'",
    choices: {
      kopek_kac: {
        text: 'Cry and run away',
        feedback: 'You bolt to safety. Dad calls you a coward, and that stings.',
      },
      kopek_cesur: {
        text: "Hold Dad's hand and approach",
        feedback: "You're shaking, but you step closer. The dog licks your hand. Okay... maybe it's cute.",
      },
    },
  },
  tr_abi_zorbalik: {
    text: 'Your older sibling grabs your toy again. You cry, they laugh. What now?',
    choices: {
      abi_anne_soyle: {
        text: 'Moooom!',
        feedback: 'Mom steps in and makes them give it back. You win the toy, but get labeled a snitch.',
      },
      abi_kavga: {
        text: 'Try to take it back yourself',
        feedback: "You fight hard. You lose, but you don't back down. Even your sibling respects that.",
      },
      abi_pazarlik: {
        text: "Cry and say 'please'",
        feedback: "They cannot handle the tears and give in. Emotional strategy works.",
      },
    },
  },
  tr_sofra_konusma: {
    text: "Adults are talking at dinner. You want to jump in, but they say, 'Kids don't talk at the table.'",
    choices: {
      sofra_sus: {
        text: 'Stay quiet and listen',
        feedback: 'You keep it in. Boring, but they praise your manners.',
      },
      sofra_konus: {
        text: 'Talk anyway',
        feedback: 'You speak up anyway. Brave move, but they call it rude.',
      },
    },
  },
  tr_apartman_hopla: {
    text: 'Jumping around at home is fun, until the downstairs neighbor bangs on the ceiling. Mom says stop.',
    choices: {
      hopla_dur: {
        text: 'Stop (reluctantly)',
        feedback: 'Your energy is still bursting, but you stop. Hard choice, good self-control.',
      },
      hopla_devam: {
        text: 'Keep jumping',
        feedback: 'You keep going. The neighbor storms upstairs, Mom gets furious, and chaos follows.',
      },
    },
  },
  tr_komsu_bonbon: {
    text: 'The neighbor auntie offers you candy. You do not really like her because she always kisses your cheeks.',
    choices: {
      bonbon_al_tesekkur: {
        text: 'Take it and say thank you',
        feedback: 'Auntie is delighted, kisses your cheek, and calls you sweet. Mom is proud.',
      },
      bonbon_red: {
        text: 'Refuse and run away',
        feedback: 'Auntie feels hurt, Mom is embarrassed, and you get scolded for bad manners.',
      },
    },
  },
  tr_kaybolma_panik: {
    text: "At the market, you lose sight of Mom. Strangers everywhere. You're lost.",
    choices: {
      kaybol_agla: {
        text: 'Cry and stay put',
        feedback: 'Panic hits hard. You cry until Mom finds you, hugging and scolding at the same time.',
      },
      kaybol_ara: {
        text: 'Stay calm and look around',
        feedback: 'You think instead of panicking, retrace your steps, and find Mom. Very brave.',
      },
      kaybol_yardim: {
        text: 'Ask an adult for help',
        feedback: 'A kind woman helps you find Mom. Smart move: ask the right person.',
      },
    },
  },
  tr_inat_krizi: {
    text: "Mom says it's time to brush your teeth. You feel stubborn and refuse.",
    choices: {
      inat_direne: {
        text: "Dig in: 'No!'",
        feedback: 'You cry, yell, and throw a full tantrum. You eventually give in, but everyone is exhausted.',
      },
      inat_kabul: {
        text: 'Accept it and do it',
        feedback: "You do not like it, but you listen and brush. They say you've grown up, and it feels good.",
      },
    },
  },
  tr_baskasinin_oyuncak: {
    text: "Another kid at the park has an amazing toy. You want it, but they won't share.",
    choices: {
      oyuncak_cap: {
        text: 'Grab it and run',
        feedback: 'You snatch it, the child cries, parents step in, and you have to return it.',
      },
      oyuncak_iste: {
        text: 'Ask politely to share',
        feedback: "You ask nicely. They share, and soon you're playing together.",
      },
      oyuncak_vazgec: {
        text: 'Let it go',
        feedback: 'It hurts, but you accept it. Not everything is yours.',
      },
    },
  },
  tr_tuvalet_acil: {
    text: "You really need a bathroom at the park, but there isn't one.",
    choices: {
      tuvalet_agac: {
        text: 'Hide behind a tree',
        feedback: 'Immediate relief, but Mom is not amused.',
      },
      tuvalet_tutma: {
        text: 'Hold it until home',
        feedback: 'It feels impossible, but you make it. Barely.',
      },
    },
  },
  tr_tablet_sure: {
    text: "You're watching a cartoon. Mom says, 'Screen time is over.' But it is the best part.",
    choices: {
      tablet_devam: {
        text: 'Beg for just a little more',
        feedback: 'You plead and protest. The tablet still gets taken away.',
      },
      tablet_kapat: {
        text: 'Turn it off and switch activities',
        feedback: 'Hard, but you do it. Mom is impressed and promises extra time tomorrow.',
      },
    },
  },
  tr_dis_fircalama: {
    text: "Bedtime. You still have to brush your teeth, and you really don't feel like it.",
    choices: {
      dis_fircala: {
        text: 'Brush (reluctantly)',
        feedback: "You do it anyway. Fresh mouth, a goodnight kiss, and a 'well done.'",
      },
      dis_atla: {
        text: 'Skip it and jump into bed',
        feedback: 'You try to get away with it, but Mom catches you and gives a lecture on cavities.',
      },
    },
  },
  tr_park_kavga: {
    text: 'A kid pushes you at the park and runs. It hurts. What do you do?',
    choices: {
      kavga_vur: {
        text: 'Push back',
        feedback: 'It turns into a fight. Both kids cry, and parents separate you.',
      },
      kavga_agla: {
        text: 'Cry and run to Mom',
        feedback: 'Mom hugs you, comforts you, and confronts the other kid.',
      },
      kavga_affet: {
        text: 'Let it go and move on',
        feedback: 'You choose not to escalate. The other kid apologizes, and play resumes.',
      },
    },
  },
  tr_yemek_inat: {
    text: "Mom cooked dinner, but you do not like it and refuse to eat.",
    choices: {
      yemek_red: {
        text: "No! I won't eat it!",
        feedback: 'You hold out for hours and go to bed hungry.',
      },
      yemek_ye: {
        text: 'Eat it anyway',
        feedback: 'You force yourself through it and realize it is not that bad.',
      },
    },
  },
  tr_oyuncak_magazasi: {
    text: "You're in a toy store, surrounded by everything you want. Can you handle it?",
    choices: {
      magaza_al: {
        text: 'Ask politely for one toy',
        feedback: "You ask nicely. Mom agrees to one. Choosing is hard, but you're thrilled.",
      },
      magaza_agla: {
        text: 'Throw a tantrum',
        feedback: 'Big scene. Everyone stares. You leave empty-handed.',
      },
      magaza_sabir: {
        text: 'Look around and leave',
        feedback: 'You resist the urge to buy. Impressive self-control.',
      },
    },
  },
  tr_bebek_yardim: {
    text: 'Mom is exhausted taking care of the baby and asks you to bring a bottle.',
    choices: {
      bebek_yardim_et: {
        text: 'Help out',
        feedback: "You bring it over. Mom hugs you and says you're becoming a great big sibling.",
      },
      bebek_red: {
        text: "'I'm playing,' and refuse",
        feedback: 'Mom is hurt. You keep playing, but it does not feel great.',
      },
    },
  },
  tr_top_cama_vurma: {
    text: "While playing ball, you smack the neighbor's window. Loud bang. The ball pops, but the glass survives.",
    choices: {
      cam_kac: {
        text: 'Run and hide',
        feedback: 'You run, but the neighbor saw everything. You get scolded anyway.',
      },
      cam_ozur: {
        text: 'Go apologize',
        feedback: 'You go over scared and apologize. The neighbor forgives you for being honest.',
      },
    },
  },
  tr_ev_yardimi: {
    text: 'Mom is cleaning and looks exhausted. She asks you to pick up your toys.',
    choices: {
      ev_yardim: {
        text: 'Help and tidy up',
        feedback: 'You help out, and Mom hugs you with a big smile.',
      },
      ev_oyna: {
        text: 'Keep playing',
        feedback: "Mom cleans alone. You can hear disappointment in her voice.",
      },
    },
  },
  tr_bayram_sabahi: {
    ...(enEventTranslationsGenerated.tr_bayram_sabahi ?? {}),
    choices: {
      bayram_full_respect: {
        text: 'Do the full hand-kissing round (Hard - for introverts)',
        feedback: 'Every greeting feels endless, but your pockets fill with holiday money and the family is happy.',
      },
      bayram_minimal: {
        text: 'Just greet your parents, then sit quietly',
        feedback: 'You survive with minimal interaction. Less allowance, more peace.',
      },
      bayram_social_butterfly: {
        text: 'Hug everyone and chat',
        feedback: 'Everyone adores you. Full pockets, full heart.',
      },
      bayram_sleep: {
        text: 'Keep sleeping',
        feedback: 'People call you disrespectful. No holiday money, and you get scolded.',
      },
    },
  },
  tr_ramazan_iftar: {
    ...(enEventTranslationsGenerated.tr_ramazan_iftar ?? {}),
    choices: {
      iftar_help: {
        text: 'Help set the table',
        feedback: 'You line up plates and glasses. Mom looks proud, and guests praise you.',
      },
      iftar_fast: {
        text: 'Try fasting (Hard)',
        feedback: 'You make it to sundown. Hunger is rough, but you did it.',
      },
      iftar_avoid: {
        text: 'Stay in your room',
        feedback: 'You do not help, but at least you stay out of the way.',
      },
    },
  },
  tr_kurban_bayrami: {
    ...(enEventTranslationsGenerated.tr_kurban_bayrami ?? {}),
    choices: {
      kurban_distribute: {
        text: 'Help distribute meat',
        feedback: 'You help deliver meat to families in need. Their gratitude hits deep.',
      },
      kurban_cousins: {
        text: 'Play with your cousins',
        feedback: 'Sometimes the best part of the holiday is just being kids together.',
      },
      kurban_witness: {
        text: 'Watch the sacrifice (Hard)',
        feedback: 'It is intense, but it gives you a sobering sense of life and responsibility.',
      },
    },
  },
  tr_karne_gunu: {
    ...(enEventTranslationsGenerated.tr_karne_gunu ?? {}),
    choices: {
      karne_proud: {
        text: 'Go home proudly',
        feedback: 'You place your report card on the table. The reaction depends on your grades.',
      },
      karne_compare: {
        text: 'Compare with friends',
        feedback: 'Report cards come out, and emotions run high. Where do you stand?',
      },
      karne_hide: {
        text: 'Hide it and show it later',
        feedback: 'You postpone the moment, but delay usually makes it worse.',
      },
      karne_honest: {
        text: "Show it now, even if it's bad (Hard)",
        feedback: 'You face it honestly. Even if they are upset, they respect your courage.',
      },
    },
  },
  tr_lgs_hazirlik: {
    ...(enEventTranslationsGenerated.tr_lgs_hazirlik ?? {}),
    choices: {
      lgs_dershane: {
        text: 'Enroll in prep courses',
        feedback: 'The pace is intense but effective. Your scores start climbing.',
      },
      lgs_self_study: {
        text: 'Study at home on your own (Hard - for impatient players)',
        feedback: 'You learn from videos and grind practice tests. It is tough, but it works.',
      },
      lgs_ignore: {
        text: 'I do not care',
        feedback: 'You hang out and have fun while grades slip. Future-you will deal with it.',
      },
    },
  },
  tr_yks_stresi: {
    ...(enEventTranslationsGenerated.tr_yks_stresi ?? {}),
    choices: {
      yks_grind: {
        text: 'Pull an all-nighter and study',
        feedback: 'Bloodshot eyes, full notebook. You are pushing hard. Worth it? Time will tell.',
      },
      yks_tutor: {
        text: 'Get private tutoring',
        feedback: 'One-on-one support closes your gaps fast.',
      },
      yks_rest: {
        text: 'Take a break and rest (Hard - for workaholics)',
        feedback: 'You do not study for a day. Guilt is loud, but your brain thanks you.',
      },
    },
  },
  tr_akraba_sorgusu: {
    ...(enEventTranslationsGenerated.tr_akraba_sorgusu ?? {}),
    choices: {
      akraba_polite: {
        text: 'Answer politely',
        feedback: "'I am studying, auntie. Hope it goes well.' Classic, but effective.",
      },
      akraba_snap: {
        text: "Snap: 'None of your business!'",
        feedback: 'The room goes cold. Mom scolds you later, but at least you said what you felt.',
      },
      akraba_polite_introvert: {
        text: 'Answer politely (Hard - for introverts)',
        feedback: 'Every word feels heavy, but you get through it. Social stamina +1.',
      },
      akraba_deflect: {
        text: 'Change the subject',
        feedback: 'You skillfully redirect the conversation to someone else. Tactic successful.',
      },
    },
  },
  tr_evlilik_baskisi: {
    ...(enEventTranslationsGenerated.tr_evlilik_baskisi ?? {}),
    choices: {
      evlilik_smile: {
        text: 'Smile and dodge it',
        feedback: "'Let me finish school first, auntie.' Smooth escape.",
      },
      evlilik_boundary: {
        text: "Set a boundary: 'My life, my call.'",
        feedback: 'The mood cools, but people start taking your boundaries seriously.',
      },
      evlilik_lie: {
        text: 'Say you are seeing someone (lie)',
        feedback: 'Everyone gets excited. Now every holiday comes with follow-up questions.',
      },
    },
  },
  tr_mahalle_futbolu: {
    ...(enEventTranslationsGenerated.tr_mahalle_futbolu ?? {}),
    choices: {
      futbol_join: {
        text: 'Jump in immediately',
        feedback: 'Dusty shoes, scraped knees, huge fun.',
      },
      futbol_join_introvert: {
        text: 'Join in (Hard)',
        feedback: 'Awkward at first, then you find your rhythm and enjoy it.',
      },
      futbol_goalkeeper: {
        text: 'Play goalkeeper (less contact)',
        feedback: 'Not easy, but you make a few clutch saves.',
      },
      futbol_watch: {
        text: 'Just watch',
        feedback: 'You stay on the sidelines. Your friends are a little disappointed.',
      },
    },
  },
  tr_internet_kafe: {
    ...(enEventTranslationsGenerated.tr_internet_kafe ?? {}),
    choices: {
      kafe_go_rebel: {
        text: 'Go anyway. Rules are made to be broken.',
        feedback: 'You game all night and sneak home, then wake Mom. The lecture is brutal. Worth it?',
      },
      kafe_go_conformist: {
        text: 'Go (Hard - for rule-followers)',
        feedback: 'You play with a knot of guilt all night. Fun... kind of.',
      },
      kafe_permission: {
        text: 'Ask your family for permission',
        feedback: 'They say no. Your friends go without you, but you stayed honest.',
      },
      kafe_online: {
        text: 'Join online from home',
        feedback: 'Not the same vibe, but safer and still social.',
      },
    },
  },
  tr_sigara_teklifi: {
    ...(enEventTranslationsGenerated.tr_sigara_teklifi ?? {}),
    choices: {
      sigara_refuse_brave: {
        text: 'Hard no',
        feedback: 'You stand your ground under pressure. They tease you, but you made the right call.',
      },
      sigara_refuse_easy: {
        text: 'No thanks, not my thing',
        feedback: 'You refuse calmly. People already know this is not your lane.',
      },
      sigara_try: {
        text: 'Try one',
        feedback: "You cough hard and your eyes water. Not great, but you look 'cool' for five seconds.",
      },
      sigara_excuse: {
        text: 'Make an excuse and leave',
        feedback: "'Mom's calling,' you say and disappear. Cowardly or clever? Maybe both.",
      },
    },
  },
  tr_farkli_olmak: {
    ...(enEventTranslationsGenerated.tr_farkli_olmak ?? {}),
    choices: {
      farkli_be_yourself: {
        text: 'Be yourself, whatever they say',
        feedback: 'Some find you odd, some admire you. It can feel lonely, but it is real.',
      },
      farkli_conform: {
        text: 'Blend in and make life easier',
        feedback: 'You fit in, but the mirror starts feeling unfamiliar.',
      },
      farkli_rebel: {
        text: 'Do the opposite of everyone',
        feedback: 'You draw attention, but are you expressing yourself or just reacting?',
      },
    },
  },
  tr_anne_yemegi: {
    ...(enEventTranslationsGenerated.tr_anne_yemegi ?? {}),
    choices: {
      yemek_fastfood: {
        text: 'Grab fast food',
        feedback: 'Burger, fries, soda. Tasty now, guilt later.',
      },
      yemek_home: {
        text: "Go home for Mom's cooking",
        feedback: 'Beans, rice, yogurt drink. Nothing beats home food.',
      },
      yemek_home_hard: {
        text: 'Go home (Hard - for selfish players)',
        feedback: 'You leave your friends and head back. Mom is happy, and you feel unexpectedly warm.',
      },
    },
  },
  tr_milli_mac: {
    ...(enEventTranslationsGenerated.tr_milli_mac ?? {}),
    choices: {
      mac_balkon: {
        text: 'Watch from the balcony and yell',
        feedback: 'When the goal comes, the whole neighborhood erupts. Pure collective joy.',
      },
      mac_kafe: {
        text: 'Watch at the cafe',
        feedback: 'Packed tables, strangers hugging after goals. Chaotic and beautiful.',
      },
      mac_ignore: {
        text: 'Ignore the match',
        feedback: 'A quieter night for you. The noise is annoying, but your head stays clear.',
      },
    },
  },
  tr_oyun_parki: {
    ...(enEventTranslationsGenerated.tr_oyun_parki ?? {}),
    choices: {
      park_swing: {
        text: 'Run to the swings!',
        feedback: 'You feel like you are flying. Wind on your face, laughter everywhere.',
      },
      park_friends: {
        text: 'Meet the other kids',
        feedback: "You introduce yourself and ask to play. First step taken.",
      },
      park_sandbox: {
        text: 'Play in the sandbox',
        feedback: 'You build sandcastles like a tiny architect.',
      },
    },
  },
  tr_ilk_bisiklet: {
    text: 'Dad bought you a bike, but you do not know how to ride yet. Training wheels are right there...',
    choices: {
      bike_helper: {
        text: 'Start with training wheels',
        feedback: 'Safe and fun. You are learning steadily.',
      },
      bike_brave: {
        text: 'Try without them (Hard)',
        feedback: "You fall a few times and scrape your knees, but then it clicks. You're riding!",
      },
    },
  },
  tr_cizgi_film: {
    ...(enEventTranslationsGenerated.tr_cizgi_film ?? {}),
    choices: {
      cizgi_tv: {
        text: 'Cartoons first',
        feedback: 'Pokemon can wait for no one. Mom grumbles, but lets it slide.',
      },
      cizgi_breakfast: {
        text: 'Breakfast first',
        feedback: 'Not easy, but you do it. Full stomach, happy mom, and the show has not even started yet.',
      },
      cizgi_both: {
        text: 'Eat in front of the TV',
        feedback: 'Efficient solution. Mom is not thrilled, but it works.',
      },
    },
  },
  tr_okul_ilk_gun: {
    ...(enEventTranslationsGenerated.tr_okul_ilk_gun ?? {}),
    choices: {
      okul_brave: {
        text: 'Walk in bravely',
        feedback: 'No tears, no running away. The teacher says well done. A real new beginning.',
      },
      okul_excited: {
        text: 'Run in excitedly',
        feedback: 'You rush into class and meet everyone. This place could be yours.',
      },
      okul_cry: {
        text: 'Cry and hold on',
        feedback: 'Mom comforts you. First-day tears are normal.',
      },
    },
  },
  tr_har_l_k: {
    text: 'Weekend allowance day. Dad gives you 20 TL. What is the move?',
    choices: {
      har_l_k_save: {
        text: 'Put it in the piggy bank',
        feedback: 'You almost spend it, but choose discipline. Future-you will thank you.',
      },
      har_l_k_candy: {
        text: 'Spend it at the corner shop',
        feedback: 'Chips, chocolate, soda. You are happy, and broke.',
      },
      har_l_k_half: {
        text: 'Save half',
        feedback: 'Smart balance. You enjoy today and still save for later.',
      },
    },
  },
  tr_sabah_uyanis: {
    ...(enEventTranslationsGenerated.tr_sabah_uyanis ?? {}),
    choices: {
      sabah_erken: {
        text: 'Get up now',
        feedback: 'You start early and feel surprisingly energetic.',
      },
      sabah_ertele: {
        text: 'Five more minutes...',
        feedback: 'Five minutes becomes thirty. Late again.',
      },
      sabah_spor: {
        text: 'Do morning exercise',
        feedback: 'Push-ups, sit-ups, a little run. Tough start, great payoff.',
      },
    },
  },
  tr_ev_isler: {
    ...(enEventTranslationsGenerated.tr_ev_isler ?? {}),
    choices: {
      ev_temizle: {
        text: 'Clean first',
        feedback: 'You complain, but you do it. Mom is happy and your conscience is clear.',
      },
      ev_sonra: {
        text: "I'll do it later",
        feedback: 'You leave it for later... and later arrives with consequences.',
      },
      ev_hizli: {
        text: 'Speed-clean',
        feedback: 'You shove everything under the bed. Technically cleaner... maybe.',
      },
    },
  },
  tr_bakkal: {
    text: 'Mom sends you to the corner shop with a list and extra money.',
    choices: {
      bakkal_honest: {
        text: 'Buy only what is on the list',
        feedback: 'You return every cent of change. Trust level up.',
      },
      bakkal_snack: {
        text: 'Buy yourself a snack too',
        feedback: 'You grab chips, then feel the guilt kicking in.',
      },
      bakkal_save: {
        text: 'Keep the extra',
        feedback: 'Money stays in your pocket... but it does not feel clean.',
      },
    },
  },
  tr_komsu_ziyaret: {
    ...(enEventTranslationsGenerated.tr_komsu_ziyaret ?? {}),
    choices: {
      komsu_servis: {
        text: 'Serve tea',
        feedback: "Everyone praises your manners. It is tiring, but it pays off.",
      },
      komsu_sohbet: {
        text: 'Join the conversation',
        feedback: 'You chat with adults and pick up unexpected life lessons.',
      },
      komsu_kac: {
        text: 'Disappear into your room',
        feedback: 'Comfortable for you, disappointing for Mom.',
      },
    },
  },
  tr_yagmurlu_gun: {
    text: 'Rain all day. Going out is off the table. What now?',
    choices: {
      yagmur_kitap: {
        text: 'Read a book',
        feedback: 'Rain sounds and book smell. Quiet, perfect day.',
      },
      yagmur_oyun: {
        text: 'Play video games',
        feedback: 'Hours disappear. Fun, but time flies.',
      },
      yagmur_tv: {
        text: 'Watch a movie',
        feedback: 'A cozy family movie day.',
      },
      yagmur_yagmur: {
        text: 'Play in the rain',
        feedback: 'You get soaked and love it. Mom scolds you, but she is smiling too.',
      },
    },
  },
  tr_aile_yemegi: {
    ...(enEventTranslationsGenerated.tr_aile_yemegi ?? {}),
    choices: {
      yemek_anlat: {
        text: 'Talk about your day',
        feedback: 'Everyone listens. Family talks can be surprisingly good.',
      },
      yemek_dinle: {
        text: 'Eat quietly',
        feedback: 'Not lively, but peaceful.',
      },
      yemek_soru: {
        text: 'Ask questions',
        feedback: "You ask about their past and end up with stories you did not expect.",
      },
    },
  },
  tr_ders_calis: {
    ...(enEventTranslationsGenerated.tr_ders_calis ?? {}),
    choices: {
      ders_fokus: {
        text: 'Focus and study',
        feedback: 'It is hard, but two solid hours lock things in.',
      },
      ders_telefon: {
        text: 'Check your phone for a bit',
        feedback: "Five minutes turns into two hours. Procrastination wins again.",
      },
      ders_pomodoro: {
        text: '25 min study, 5 min break',
        feedback: 'Pomodoro works. You study better and burn out less.',
      },
    },
  },
  tr_hasta_olma: {
    text: 'You feel awful today: sore throat, maybe fever. Do you still go to school?',
    choices: {
      hasta_kal: {
        text: 'Stay home',
        feedback: 'Soup, blanket, sleep. You start recovering.',
      },
      hasta_git: {
        text: 'Go anyway',
        feedback: 'Rough day, but no absence on your record.',
      },
      hasta_numara: {
        text: 'Fake being sick',
        feedback: 'You are not that ill, but you spend the day pretending.',
      },
    },
  },
  tr_sinav_gunu: {
    ...(enEventTranslationsGenerated.tr_sinav_gunu ?? {}),
    choices: {
      sinav_sakin: {
        text: 'Stay calm and solve',
        feedback: 'Deep breath, steady focus. It goes better than expected.',
      },
      sinav_panik: {
        text: 'Panic',
        feedback: 'Your mind blurs and the questions blur with it.',
      },
      sinav_kopya: {
        text: 'Cheat',
        feedback: 'You are not caught... this time. Your conscience is louder than usual.',
      },
    },
  },
  tr_tatil_plani: {
    text: 'Summer break begins. Three free months. How do you spend them?',
    choices: {
      tatil_kamp: {
        text: 'Go to summer camp',
        feedback: 'New friends, nature, adventure. A summer to remember.',
      },
      tatil_kurs: {
        text: 'Take a course (swimming/music)',
        feedback: 'You pick up a new skill and avoid wasting the break.',
      },
      tatil_ev: {
        text: 'Stay home',
        feedback: 'Games, sleep, TV. Comfortable, but repetitive.',
      },
      tatil_koy: {
        text: 'Visit the village',
        feedback: 'Grandma, fresh fruit, clean air. City stress melts away.',
      },
    },
  },
  tr_kayip_esya: {
    text: 'You lost your favorite pen or toy. What now?',
    choices: {
      kayip_ara: {
        text: 'Search patiently',
        feedback: 'You look everywhere and finally find it. Patience pays.',
      },
      kayip_agla: {
        text: 'Cry and give up',
        feedback: 'You are upset, but Mom comforts you. Maybe there is a replacement later.',
      },
      kayip_sucla: {
        text: 'Blame someone else',
        feedback: "You point fingers, but deep down you know it is not fair.",
      },
    },
  },
  tr_yeni_komsular: {
    text: 'New neighbors move in next door. Do you go meet them?',
    choices: {
      komsu_merhaba: {
        text: 'Go say hello',
        feedback: "'Hi, I am your neighbor.' This could be the start of a new friendship.",
      },
      komsu_bekle: {
        text: 'Let parents meet first',
        feedback: 'Families connect first, then you are introduced. Easier that way.',
      },
      komsu_kac: {
        text: 'Keep your distance',
        feedback: 'You avoid meeting them and stay in your comfort zone.',
      },
    },
  },
  tr_kavga_sahit: {
    ...(enEventTranslationsGenerated.tr_kavga_sahit ?? {}),
    choices: {
      kavga_ayir: {
        text: 'Try to break it up',
        feedback: 'You step in and take a few hits, but the fight ends.',
      },
      kavga_ogretmen: {
        text: 'Call a teacher',
        feedback: 'A teacher arrives and stops it quickly. Probably the smart move.',
      },
      kavga_izle: {
        text: 'Just watch',
        feedback: 'You stay safe, but your conscience stays noisy.',
      },
    },
  },
  tr_sinif_gorev: {
    text: 'The teacher asks for a class representative. Will you run?',
    choices: {
      gorev_aday: {
        text: 'Run for it',
        feedback: 'You speak in front of everyone. Win or lose, that took courage.',
      },
      gorev_destek: {
        text: 'Support someone else',
        feedback: 'You back your friend, and they win. Team effort feels good.',
      },
      gorev_hayir: {
        text: 'No thanks',
        feedback: 'You skip the responsibility and keep things simple.',
      },
    },
  },
  tr_bos_gun: {
    ...(enEventTranslationsGenerated.tr_bos_gun ?? {}),
    choices: {
      bos_macera: {
        text: 'Go out and explore',
        feedback: 'You wander the neighborhood and discover new corners.',
      },
      bos_hobi: {
        text: 'Do a hobby',
        feedback: 'Drawing, music, creative flow. A good kind of quiet day.',
      },
      bos_uyku: {
        text: 'Sleep all day',
        feedback: 'You recharge hard, but the day disappears.',
      },
    },
  },
  tr_hediye_secimi: {
    text: "Mom's birthday is coming up. You want to get her something, but money is tight.",
    choices: {
      hediye_el: {
        text: 'Make something by hand',
        feedback: 'You craft a card and a drawing. Mom tears up with joy.',
      },
      hediye_satin: {
        text: 'Spend all your savings',
        feedback: 'You buy a beautiful flower. Wallet empty, heart full.',
      },
      hediye_unut: {
        text: 'Pretend you forgot',
        feedback: "She does not show it, but you can tell she is hurt.",
      },
    },
  },
  dilemma_sinav_kopya_gorme: {
    ...(enEventTranslationsGenerated.dilemma_sinav_kopya_gorme ?? {}),
    choices: {
      tell_truth: {
        text: 'Tell the truth (rat your friend out)',
        feedback:
          'Your friend is sent to discipline. Adults call you honest, but classmates keep their distance. That friendship is likely over.',
      },
      protect_friend: {
        text: "Lie: 'I did not see anything, teacher.'",
        feedback:
          'Your friend is grateful, but your teacher stays suspicious and your family starts questioning who you spend time with.',
      },
      stay_silent: {
        text: 'Stay silent and shrug',
        feedback: 'The teacher is not convinced. You protect no one and satisfy no one.',
      },
    },
  },
  dilemma_ispiyoncu_damgasi: {
    ...(enEventTranslationsGenerated.dilemma_ispiyoncu_damgasi ?? {}),
    choices: {
      choice_0: {
        text: "Defend yourself: 'I did what was right.'",
        feedback: 'The class splits in two. A few support you, most keep their distance. The loneliness is heavy.',
      },
      choice_1: {
        text: 'Apologize and show regret',
        feedback: 'You admit fault in front of everyone. Some forgive you, others read it as weakness.',
      },
      choice_2: {
        text: 'Find a new friend group',
        feedback: 'You leave the old crew behind. The new one is steadier, but less fun.',
      },
    },
  },
  dilemma_arkadaslik_testi: {
    ...(enEventTranslationsGenerated.dilemma_arkadaslik_testi ?? {}),
    choices: {
      choice_0: {
        text: "Confront them: 'I saved you that day!'",
        feedback: "They answer, 'Thanks, but we're in different worlds now.' A painful truth lands.",
      },
      choice_1: {
        text: 'Stay quiet and take the lesson',
        feedback: 'You learn that some people stay close only when they need something.',
      },
      choice_2: {
        text: 'Expose that old secret',
        feedback: 'You get revenge, but people stop trusting you.',
      },
    },
  },
  dilemma_aile_beklentisi: {
    ...(enEventTranslationsGenerated.dilemma_aile_beklentisi ?? {}),
    choices: {
      obey_family: {
        text: 'Obey your family (give up your dream)',
        feedback: 'Your father looks proud, but your guitar gathers dust. Something in you goes quiet.',
      },
      follow_dreams: {
        text: 'Follow your dream (clash with family)',
        feedback: 'Doors slam, tears fall, but when you play, the music reminds you that you are alive.',
      },
      compromise: {
        text: 'Compromise (do both halfway)',
        feedback: 'You study and play, but excel at neither. No one is fully satisfied, including you.',
      },
    },
  },
  dilemma_supressed_dreams: {
    ...(enEventTranslationsGenerated.dilemma_supressed_dreams ?? {}),
    choices: {
      choice_0: {
        text: 'Keep going. It is too late now.',
        feedback: 'You bury yourself in books. Grades rise, but the voice inside never shuts up.',
      },
      choice_1: {
        text: 'One last shot: enter secretly',
        feedback: 'You step on stage and do not win, but the judges see potential. At home, the fallout is immediate.',
      },
    },
  },
  dilemma_family_reconciliation: {
    ...(enEventTranslationsGenerated.dilemma_family_reconciliation ?? {}),
    choices: {
      choice_0: {
        text: 'Go and apologize',
        feedback: 'Mom hugs you. Dad stays distant. Still, the door cracks open.',
      },
      choice_1: {
        text: 'Stay away and keep your pride',
        feedback: "You spend your birthday staring at the wall. Being right does not feel warm.",
      },
      choice_2: {
        text: 'Send a gift, do not go',
        feedback: 'Mom cries over the gift. Dad says he wished you came in person. Half a step.',
      },
    },
  },
  dilemma_arkadas_vs_basari: {
    ...(enEventTranslationsGenerated.dilemma_arkadas_vs_basari ?? {}),
    choices: {
      choice_0: {
        text: 'Tell the truth (fairness first)',
        feedback:
          "You tell the teacher what really happened. Your grade is high, your friend's is not. The friendship feels uncertain now.",
      },
      choice_1: {
        text: 'Protect both of you (loyalty first)',
        feedback: 'You say you did it together. You both get average grades. Your friend is grateful, but you gave up your full credit.',
      },
      choice_2: {
        text: 'Talk to the teacher privately',
        feedback: 'You explain everything quietly. The teacher adjusts your grade, your friend never knows. Still... it feels half-true.',
      },
    },
  },
  dilemma_arkadaslik_sirri: {
    ...(enEventTranslationsGenerated.dilemma_arkadaslik_sirri ?? {}),
    choices: {
      sir_anlat: {
        text: 'Tell their family, safety comes first',
        feedback: 'Your friend is furious and calls it betrayal. But they are safe. Maybe one day they will understand.',
      },
      sir_sakla: {
        text: 'Keep the secret to protect trust',
        feedback: 'You stay silent. Your friend runs away and is found three days later. Police questions follow. Everything gets messy.',
      },
      sir_ikna: {
        text: 'Try to talk them out of it',
        feedback: 'You talk for hours. They finally give up. No one else knows, but you may have saved a life.',
      },
    },
  },
  dilemma_best_friend_vs_partner: {
    ...(enEventTranslationsGenerated.dilemma_best_friend_vs_partner ?? {}),
    choices: {
      bff_vs_partner_bff: {
        text: 'Choose your best friend',
        feedback: 'You protect years of friendship, but the romantic side still hurts.',
      },
      bff_vs_partner_partner: {
        text: 'Choose your partner',
        feedback: 'You choose love. Your best friend is deeply hurt, and things may never be the same.',
      },
      bff_vs_partner_neither: {
        text: 'Choose neither',
        feedback: "You refuse the ultimatum. Bold move, lonely outcome.",
      },
    },
  },
  dilemma_bully_karma: {
    ...(enEventTranslationsGenerated.dilemma_bully_karma ?? {}),
    choices: {
      choice_0: {
        text: 'Send an apology message',
        feedback: 'You write a long apology. No reply comes, but at least you stop hiding from yourself.',
      },
      choice_1: {
        text: 'Do nothing',
        feedback: 'You stay silent and watch them succeed. The word "if only" keeps echoing.',
      },
    },
  },
  dilemma_calinti_bulundu: {
    text: "Your friend is searching for their toy, and their mom is asking everyone. What's your move?",
    choices: {
      choice_0: {
        text: 'Return it and apologize',
        feedback: 'Everyone is shocked. You get punished, but the weight on your chest lifts.',
      },
      choice_1: {
        text: 'Throw it away and hide it',
        feedback: 'You dump it so no one finds out. The secret follows you into your sleep.',
      },
    },
  },
  dilemma_caught_spying: {
    ...(enEventTranslationsGenerated.dilemma_caught_spying ?? {}),
    choices: {
      spy_apologize: {
        text: 'Apologize: "I was wrong."',
        feedback: 'Your apology is accepted, but trust is cracked. Repair will take time.',
      },
      spy_justify: {
        text: 'Defend yourself: "I had reasons to doubt."',
        feedback: '"You still do not get it," they say and walk away. The relationship is in real danger.',
      },
    },
  },
  dilemma_cevre_kirliligi: {
    text: 'At the picnic, everyone is littering. What do you do?',
    choices: {
      cevre_topla: {
        text: 'Pick up your trash, and maybe theirs too',
        feedback: 'They mock you, but you protect the place. One day it may make sense to them.',
      },
      cevre_ayni: {
        text: 'Litter too, everyone else is doing it',
        feedback: 'Easy in the moment. Harder when you come back and see the place ruined.',
      },
    },
  },
  dilemma_dark_job_offer: {
    ...(enEventTranslationsGenerated.dilemma_dark_job_offer ?? {}),
    choices: {
      choice_0: {
        text: 'Take it, just this once',
        feedback: 'You do the job, then paranoia kicks in. Money comes, peace leaves.',
      },
      choice_1: {
        text: 'Refuse for good',
        feedback: 'You say do not call again. They threaten, but it sounds hollow. Leaving the past takes courage.',
      },
    },
  },
  dilemma_dedikodu: {
    ...(enEventTranslationsGenerated.dilemma_dedikodu ?? {}),
    choices: {
      dedikodu_paylas: {
        text: 'Share the secret, gain attention',
        feedback: 'You tell it, people listen, you feel popular. Until the wrong person finds out.',
      },
      dedikodu_sus: {
        text: 'Stay quiet, a secret is a secret',
        feedback: 'They push you to talk. You refuse. Your reputation shifts toward trustworthy.',
      },
    },
  },
  dilemma_dedikodu_sonuc: {
    text: 'The person learns the secret spread, and they know it came from you. You meet face to face.',
    choices: {
      choice_0: {
        text: 'Own it and apologize',
        feedback: 'You admit it. They do not forgive you yet, but at least you stop lying to their face.',
      },
      choice_1: {
        text: 'Deny everything',
        feedback: 'You deny it, they do not believe you. Now you look both disloyal and dishonest.',
      },
    },
  },
  dilemma_farkli_olmak: {
    ...(enEventTranslationsGenerated.dilemma_farkli_olmak ?? {}),
    choices: {
      choice_0: {
        text: 'Be yourself, no matter what',
        feedback: 'Some judge, some admire. It can be lonely, but it is yours.',
      },
      choice_1: {
        text: 'Blend in for an easier life',
        feedback: 'You are accepted faster, but the mirror starts asking hard questions.',
      },
      choice_2: {
        text: 'Find a middle path',
        feedback: 'You keep your core and soften the edges. Practical, but still unresolved.',
      },
    },
  },
  dilemma_freelance_etik: {
    ...(enEventTranslationsGenerated.dilemma_freelance_etik ?? {}),
    choices: {
      choice_0: {
        text: 'Accept it, money matters',
        feedback: 'You finish the job and get paid. Now that client sees you as available for darker work too.',
      },
      choice_1: {
        text: 'Reject it, ethics matter',
        feedback: 'You lose the money, keep your sleep.',
      },
    },
  },
  dilemma_hayvan_bulma: {
    ...(enEventTranslationsGenerated.dilemma_hayvan_bulma ?? {}),
    choices: {
      kedi_veteriner: {
        text: 'Empty your savings and take it to a vet',
        feedback: 'You run out of money and get yelled at home. The cat recovers and is adopted. A life was saved.',
      },
      kedi_birak: {
        text: "Feel bad, but walk away",
        feedback: 'You keep walking. That night, the cat returns in your dreams.',
      },
      kedi_sosyal: {
        text: 'Ask for help on social media',
        feedback: 'Someone responds, takes the cat, and pays for treatment. You became the bridge.',
      },
    },
  },
  dilemma_hollow_victory: {
    ...(enEventTranslationsGenerated.dilemma_hollow_victory ?? {}),
    choices: {
      choice_0: {
        text: 'Confess and return the trophy',
        feedback: 'You tell the truth publicly. The trophy is gone, your image takes a hit, but your inner burden drops.',
      },
      choice_1: {
        text: 'Stay silent and move on',
        feedback: 'No one knows, but you do. The thought visits every night.',
      },
    },
  },
  dilemma_iki_kisi: {
    ...(enEventTranslationsGenerated.dilemma_iki_kisi ?? {}),
    choices: {
      choice_0: {
        text: 'Choose the reliable one',
        feedback: 'Stable and calm, family-approved. Still, the "what if" stays.',
      },
      choice_1: {
        text: 'Choose the exciting one',
        feedback: 'Every day feels alive, and exhausting. Full heart, tired mind.',
      },
      choice_2: {
        text: 'Choose neither',
        feedback: 'You stay independent. Maybe the right person is not here yet.',
      },
    },
  },
  dilemma_kardes_firsati: {
    ...(enEventTranslationsGenerated.dilemma_kardes_firsati ?? {}),
    choices: {
      choice_0: {
        text: 'Go to camp (your own path)',
        feedback: 'Camp is amazing and you grow a lot. But your sibling asking "Where were you?" stays with you.',
      },
      choice_1: {
        text: 'Stay with your sibling (sacrifice)',
        feedback: 'You hold their hand through recovery. You miss the opportunity, but your family never forgets the support.',
      },
    },
  },
  dilemma_kardes_hirsizlik: {
    ...(enEventTranslationsGenerated.dilemma_kardes_hirsizlik ?? {}),
    choices: {
      choice_0: {
        text: 'Protect your sibling, stay quiet',
        feedback: 'Your sibling relaxes, but you cannot sleep well. The neighbor keeps asking questions.',
      },
      choice_1: {
        text: 'Push your sibling to confess',
        feedback: "They apologize and return the phone. Problem solved, but now you are the 'traitor' at home.",
      },
      choice_2: {
        text: 'Return it yourself without exposing them',
        feedback: 'You make up a story and pay out of pocket. Situation fixed, truth bent.',
      },
    },
  },
  dilemma_kayip_hayvan: {
    ...(enEventTranslationsGenerated.dilemma_kayip_hayvan ?? {}),
    choices: {
      choice_0: {
        text: 'Take it to a vet no matter the cost',
        feedback: 'Your savings vanish and home gets tense. The dog recovers and waits for a new family. Worth it?',
      },
      choice_1: {
        text: 'Leave it to nature',
        feedback: 'You walk away, then look back and see the dog still there. Sleep does not come easily.',
      },
      choice_2: {
        text: 'Post online and ask for help',
        feedback: 'The post spreads fast. Someone rescues and treats the dog. You sparked the outcome.',
      },
    },
  },
  dilemma_kirik_vazo: {
    ...(enEventTranslationsGenerated.dilemma_kirik_vazo ?? {}),
    choices: {
      vazo_itiraf: {
        text: 'Confess',
        feedback: 'Mom gets upset but values your honesty. The punishment is lighter.',
      },
      vazo_kardes: {
        text: 'Blame your sibling',
        feedback: 'They cry and take the blame. You keep quiet, guilt does not.',
      },
      vazo_gizle: {
        text: 'Hide the pieces',
        feedback: 'You throw the evidence away. The question remains, and so does the secret.',
      },
    },
  },
  dilemma_kopya_satin_alma: {
    text: "Tomorrow's exam key is for sale. 100 TL. Everyone is buying. You?",
    choices: {
      kopya_al: {
        text: "Buy it, everyone else does",
        feedback: 'The exam feels easy, but the result does not feel earned. And now the seller wants favors.',
      },
      kopya_alma: {
        text: 'No, I do it my own way',
        feedback: 'Your score is lower, theirs is higher. But yours is real.',
      },
    },
  },
  dilemma_loyalty_test: {
    ...(enEventTranslationsGenerated.dilemma_loyalty_test ?? {}),
    choices: {
      loyalty_stay: {
        text: 'Stay loyal to your partner',
        feedback: 'You set a clear boundary. The question is whether your own doubts are fully gone.',
      },
      loyalty_breakup: {
        text: 'Break up',
        feedback: 'The breakup hurts. New start, old ache.',
      },
      loyalty_indecisive: {
        text: "Say you cannot decide",
        feedback: 'Indecision hurts both sides. You end up stuck in between.',
      },
    },
  },
  dilemma_outcast_friendship: {
    ...(enEventTranslationsGenerated.dilemma_outcast_friendship ?? {}),
    choices: {
      choice_0: {
        text: 'Step in physically',
        feedback: 'A fight breaks out and both of you get punished. Your friend says no one ever stood up like that for them.',
      },
      choice_1: {
        text: 'Tell a teacher',
        feedback: 'The bullying stops, but the snitch label returns. Right choices can still be costly.',
      },
      choice_2: {
        text: 'Tell your friend to defend themselves',
        feedback: 'They feel abandoned. Trust between you cracks.',
      },
    },
  },
  dilemma_oyuncak_calma: {
    ...(enEventTranslationsGenerated.dilemma_oyuncak_calma ?? {}),
    choices: {
      oyuncak_birak: {
        text: 'Put it back',
        feedback: 'Hard choice, right one. One day you can earn your own.',
      },
      oyuncak_al: {
        text: 'Take it, no one saw',
        feedback: 'You bring it home, but the joy is gone before play even starts.',
      },
    },
  },
  dilemma_para_bulma: {
    ...(enEventTranslationsGenerated.dilemma_para_bulma ?? {}),
    choices: {
      choice_0: {
        text: 'Return the money',
        feedback: 'You return it. No reward, barely a thanks. Still the honest move.',
      },
      choice_1: {
        text: 'Keep it',
        feedback: '500 TL in your pocket. You call it deserved, but that does not settle the ethics.',
      },
      choice_2: {
        text: 'Drop it in lost and found',
        feedback: 'You hand it to school staff. Not yours, not theirs, at least not on your conscience.',
      },
    },
  },
  dilemma_parti_sinav: {
    ...(enEventTranslationsGenerated.dilemma_parti_sinav ?? {}),
    choices: {
      choice_0: {
        text: 'Go to the party',
        feedback: 'Incredible night. Terrible exam.',
      },
      choice_1: {
        text: 'Stay home and study',
        feedback: 'Great exam result, but you feel left out when everyone talks about the night.',
      },
      choice_2: {
        text: 'Show up briefly, then leave early',
        feedback: 'Half party, half study, full ambiguity.',
      },
    },
  },
  dilemma_partner_finds_out: {
    ...(enEventTranslationsGenerated.dilemma_partner_finds_out ?? {}),
    choices: {
      found_out_lie: {
        text: 'Lie: "It is not true."',
        feedback: 'They want to believe you, but suspicion remains.',
      },
      found_out_confess: {
        text: 'Confess: "Yes, I messed up."',
        feedback: 'Honest, but painful. The relationship may end, or continue cracked.',
      },
      found_out_breakup: {
        text: 'End it',
        feedback: 'You cut a tangled knot. It hurts, but it is clear.',
      },
    },
  },
  dilemma_romantic_jealousy_test: {
    ...(enEventTranslationsGenerated.dilemma_romantic_jealousy_test ?? {}),
    choices: {
      jealousy_confront: {
        text: 'Confront and demand answers',
        feedback: 'The argument escalates. "If there is no trust, there is no relationship" lands hard.',
      },
      jealousy_trust: {
        text: 'Choose trust',
        feedback: 'You signal confidence instead of control, and the tone softens.',
      },
      jealousy_spy: {
        text: 'Investigate in secret',
        feedback: 'You start checking everything. Paranoia grows faster than certainty.',
      },
    },
  },
  dilemma_santaj: {
    text: 'The person who sold the answer key now blackmails you: "Do my homework or I talk."',
    choices: {
      choice_0: {
        text: 'Do it, avoid risk',
        feedback: 'You comply. The problem does not end. It grows.',
      },
      choice_1: {
        text: 'Refuse, whatever happens',
        feedback: 'You call their bluff. They report you. You face discipline, but regain control.',
      },
      choice_2: {
        text: 'Collect evidence against them',
        feedback: 'You save the messages. When they report you, you report back. Both pay a price.',
      },
    },
  },
  dilemma_sinif_hirsizi: {
    ...(enEventTranslationsGenerated.dilemma_sinif_hirsizi ?? {}),
    choices: {
      choice_0: {
        text: 'Stay silent (empathy)',
        feedback: 'The thefts continue and class trust collapses. But the kid is still fed.',
      },
      choice_1: {
        text: 'Tell the teacher (rules first)',
        feedback: 'Discipline follows, then family aid arrives. You still carry the snitch label.',
      },
      choice_2: {
        text: 'Talk to the kid and offer help',
        feedback: 'You help quietly from your own allowance. The stealing stops, and a strange deep bond forms.',
      },
    },
  },
  dilemma_sosyal_medya_ifsa: {
    ...(enEventTranslationsGenerated.dilemma_sosyal_medya_ifsa ?? {}),
    choices: {
      ifsa_savun: {
        text: 'Defend the target and report the post',
        feedback: 'They mock you, but the targeted student thanks you. Sometimes one ally is enough.',
      },
      ifsa_gul: {
        text: 'Laugh along and react',
        feedback: 'You stay popular in the group, but their face stays in your head.',
      },
      ifsa_sessiz: {
        text: 'Stay neutral and silent',
        feedback: 'You did not join, but you did not protect either. In-between still has a cost.',
      },
    },
  },
  dilemma_temptation: {
    ...(enEventTranslationsGenerated.dilemma_temptation ?? {}),
    choices: {
      temptation_loyal: {
        text: 'Stay loyal: "I am in a relationship."',
        feedback: 'You draw a clean line. People react however they react.',
      },
      temptation_flirt_back: {
        text: 'Flirt back',
        feedback: 'It feels harmless in the moment, less harmless later.',
      },
      temptation_question: {
        text: 'Question your relationship',
        feedback: 'Maybe this is a signal. Maybe it is just noise. Either way, you cannot ignore it now.',
      },
    },
  },
  dilemma_toxic_relationship: {
    ...(enEventTranslationsGenerated.dilemma_toxic_relationship ?? {}),
    choices: {
      choice_0: {
        text: 'Leave and protect yourself',
        feedback: 'It hurts for weeks, then slowly quiet turns into peace.',
      },
      choice_1: {
        text: 'Give it one more chance',
        feedback: 'You reconcile. A short calm period, then the same cycle returns.',
      },
    },
  },
  dilemma_truth_comes_out: {
    ...(enEventTranslationsGenerated.dilemma_truth_comes_out ?? {}),
    choices: {
      choice_0: {
        text: 'Confess everything',
        feedback: 'The whole truth surfaces. Family and neighbor ties take damage, but the burden drops.',
      },
      choice_1: {
        text: 'Say you did not know',
        feedback: 'Another lie lands flat. Trust declines further.',
      },
    },
  },
  dilemma_vazo_ger_ek: {
    text: "Years later your sibling still mentions the vase: 'I did not break it.' Do you finally tell the truth?",
    choices: {
      choice_0: {
        text: 'Tell the truth and apologize',
        feedback: 'Shock first, then a hug. "I knew it," they say. The old weight lifts.',
      },
      choice_1: {
        text: 'Stay silent, it is too late',
        feedback: 'You say nothing. They walk away hurt again. The secret stays with you.',
      },
    },
  },
  dilemma_yarisma_sabotaj: {
    ...(enEventTranslationsGenerated.dilemma_yarisma_sabotaj ?? {}),
    choices: {
      choice_0: {
        text: 'Steal the file and win',
        feedback: 'You win publicly while knowing exactly what it cost.',
      },
      choice_1: {
        text: 'Compete fairly no matter what',
        feedback: 'You place second, but can still meet their eyes.',
      },
      choice_2: {
        text: 'Withdraw from the competition',
        feedback: 'The pressure breaks you out of the race. Relief and regret arrive together.',
      },
    },
  },
  dilemma_yasli_komsu: {
    ...(enEventTranslationsGenerated.dilemma_yasli_komsu ?? {}),
    choices: {
      komsu_yardim: {
        text: 'Help the elderly neighbor, friends can wait',
        feedback: 'You arrive late, friends are annoyed, neighbor is deeply grateful.',
      },
      komsu_gec: {
        text: 'Apologize and keep going',
        feedback: 'You have fun, then hear they were taken by ambulance. The news hits hard.',
      },
    },
  },
  dilemma_yemek_paylasimi: {
    text: 'Lunch break at school. The student next to you has no food, and you brought extra.',
    choices: {
      yemek_ver: {
        text: 'Share half',
        feedback: 'They thank you quietly. Your stomach is less full, your heart is fuller.',
      },
      yemek_tut: {
        text: 'Keep it for yourself',
        feedback: 'You finish your meal. They sit with nothing.',
      },
    },
  },
  dilemma_zorbalik_populer: {
    ...(enEventTranslationsGenerated.dilemma_zorbalik_populer ?? {}),
    choices: {
      join_bullies: {
        text: 'Join the group and mock the target',
        feedback: 'You gain status fast, but cannot forget that look on their face.',
      },
      reject_group: {
        text: 'Refuse: "This is not me."',
        feedback: 'They call you weak and leave. You stand alone, but clean.',
      },
      passive_observer: {
        text: 'Stay with the group, do not join in',
        feedback: 'You become the silent one in the middle: not with them, not against them.',
      },
    },
  },
  cliff_exam_result_good: {
    text: 'Exam results are out. Questions from your late-night study sessions showed up.',
    choices: {
      choice_0: {
        text: 'Check the result',
        feedback: 'Great score. The extra effort paid off.',
      },
    },
  },
  cliff_exam_result_rested: {
    text: 'Exam results are out. You went in with a rested mind.',
    choices: {
      choice_0: {
        text: 'Check the result',
        feedback: 'Not bad at all. Rest worked too, and you did not burn yourself out.',
      },
    },
  },
  cliff_exam_tomorrow: {
    text: 'Big exam tomorrow. Last-night revision, or proper sleep for a clear mind?',
    choices: {
      choice_0: {
        text: 'Review one more time',
        feedback: 'You study late into the night. Tomorrow will show whether it was worth it.',
      },
      choice_1: {
        text: 'Sleep early for a fresh brain',
        feedback: 'You get real rest and wake up clearer.',
      },
    },
  },
  cliff_family_announcement: {
    ...(enEventTranslationsGenerated.cliff_family_announcement ?? {}),
    choices: {
      choice_0: {
        text: '"What happened? Tell me..."',
        feedback: '"Tomorrow," they say. You barely sleep.',
      },
      choice_1: {
        text: '"Is it good news?"',
        feedback: 'They smile but do not answer. You spend the night wondering.',
      },
    },
  },
  cliff_family_news_reveal: {
    text: 'Your family finally shares the news: a new sibling is on the way.',
    choices: {
      choice_0: {
        text: '"Amazing, I will be a big sibling!"',
        feedback: 'You are excited. Big joy, big responsibility.',
      },
      choice_1: {
        text: '"What if there is less attention for me?"',
        feedback: 'The fear is real. It will take time to adjust.',
      },
    },
  },
  cliff_fate_turning_point: {
    text: 'Everything looks normal, but your gut says tomorrow changes something big.',
    choices: {
      choice_0: {
        text: 'I am ready for change',
        feedback: 'Your inner voice steadies. You do not know what is coming, but you are not hiding.',
      },
      choice_1: {
        text: 'I hope it is not bad',
        feedback: 'You feel uneasy. Sometimes the best shifts arrive without warning.',
      },
    },
  },
  cliff_letter_meetup: {
    text: 'You go to the park and spot an old friend on a bench. "I have been trying to find you," they say.',
    choices: {
      choice_0: {
        text: 'Run in for a hug',
        feedback: 'Life sometimes gives perfect surprises at strange times.',
      },
      choice_1: {
        text: '"Why now?"',
        feedback: 'You keep your distance, but listen. The story starts unfolding.',
      },
    },
  },
  cliff_mysterious_letter: {
    text: 'A note appears in your bag: "Tomorrow, park, 4 PM." Familiar handwriting, but you cannot place it.',
    choices: {
      choice_0: {
        text: "Go and find out who's behind it",
        feedback: 'Bold choice. Tomorrow is waiting.',
      },
      choice_1: {
        text: 'Ignore it, might be a trap',
        feedback: 'Cautious move. Could be smart, could be a missed turning point.',
      },
    },
  },
  cliff_npc_secret_promise: {
    ...(enEventTranslationsGenerated.cliff_npc_secret_promise ?? {}),
    choices: {
      choice_0: {
        text: 'Okay, now I am curious',
        feedback: 'You are left hanging. What are they going to say tomorrow?',
      },
      choice_1: {
        text: 'Tell me now, I cannot wait',
        feedback: 'Your impatience shows. They still say "tomorrow" and leave.',
      },
    },
  },
  cliff_npc_secret_reveal: {
    ...(enEventTranslationsGenerated.cliff_npc_secret_reveal ?? {}),
    choices: {
      choice_0: {
        text: 'No... do not go',
        feedback: 'Some goodbyes are the hardest chapters of growing up.',
      },
      choice_1: {
        text: 'We stay friends even at a distance',
        feedback: 'Distance is hard, but not always final.',
      },
    },
  },
  evt_burden_breakdown_forced: {
    text: 'Your risk level crosses a critical threshold. The accumulated pressure triggers a serious mental breakdown.',
    choices: {
      burden_breakdown_rest: {
        text: 'Take a mandatory break and recover',
        feedback: 'You crash hard. Stepping back is no longer optional, it is necessary.',
      },
    },
  },
  evt_crisis_childhood_overwhelm: {
    text: 'Today was too much: school pressure, hurt feelings, heavy homework. You come home and cry behind a closed door.',
    choices: {
      crisis_child_parent: {
        text: 'Run to your parent for comfort',
        feedback: 'A warm hug and calm words do not fix everything, but they help your heart settle.',
      },
      crisis_child_hide: {
        text: 'Hide and stay alone',
        feedback: 'You wait in the dark until sleep takes over. Morning feels a little better, but you tell no one.',
      },
    },
  },
  evt_crisis_exam_panic: {
    text: 'Exam week hits and you feel unprepared. You try to study all night, but the pages blur and your hands shake.',
    choices: {
      crisis_exam_accept: {
        text: 'Accept the exam as it is',
        feedback: 'You go in underprepared and it goes badly, but you stop tearing yourself apart.',
      },
      crisis_exam_allnighter: {
        text: 'Push one more all-nighter',
        feedback: 'You survive the exam, then your body sends a harsh bill.',
      },
    },
  },
  evt_crisis_failure_spiral: {
    text: 'Everything feels wrong: weak grades, cold friendships, family tension. "I fail at everything" starts looping.',
    choices: {
      crisis_failure_talk: {
        text: 'Open up to someone',
        feedback: 'The words feel simple, but the care feels real. The spiral slows down a little.',
      },
      crisis_failure_bottle: {
        text: 'Keep it all inside',
        feedback: 'You look strong on the outside while chaos builds inside.',
      },
    },
  },
  evt_crisis_family_pressure: {
    text: 'Your parents fight loudly tonight. Doors slam, voices rise, and you hide under the blanket.',
    choices: {
      crisis_family_intervene: {
        text: 'Step in and try to calm them',
        feedback: 'You carry weight no child should carry. It helps a little, but costs you a lot.',
      },
      crisis_family_isolate: {
        text: 'Put on headphones and shut it out',
        feedback: 'Music covers the noise. By morning everyone acts normal, like nothing happened.',
      },
    },
  },
  evt_crisis_identity: {
    text: 'You look in the mirror and feel unfamiliar. Are you living as yourself, or as everyone else expects?',
    choices: {
      crisis_identity_rebel: {
        text: 'Drop expectations and choose your own lane',
        feedback: 'You change your style and shock people. For once, your reflection feels real.',
      },
      crisis_identity_conform: {
        text: 'Keep fitting in for now',
        feedback: 'You keep the mask on. Maybe later, but not today.',
      },
    },
  },
  evt_crisis_insomnia: {
    text: 'Third sleepless night in a row. Burning eyes, pounding head, 4 AM ceiling.',
    choices: {
      crisis_insomnia_rest: {
        text: 'Cancel the day and sleep',
        feedback: 'You sleep for hours. You miss things, but your body finally catches a breath.',
      },
      crisis_insomnia_push: {
        text: 'Drink coffee and keep going',
        feedback: 'You move like a ghost all day. People talk to you, but little sticks.',
      },
    },
  },
  evt_crisis_perfectionism: {
    text: 'You rewrite the same assignment again and again. It still never feels good enough.',
    choices: {
      crisis_perfect_submit: {
        text: 'Call it good enough and submit',
        feedback: 'Not perfect, but done. The world does not end.',
      },
      crisis_perfect_redo: {
        text: 'Redo it one more time',
        feedback: 'Version six, seven, eight... finished, but empty.',
      },
    },
  },
  evt_crisis_physical_collapse: {
    text: 'You get dizzy on the school stairs and grab the rail. You cannot remember your last proper meal or water.',
    choices: {
      crisis_physical_hospital: {
        text: 'Go to the nurse and ask for help',
        feedback: 'You get treated and told to care for your body. Basic advice, deep impact.',
      },
      crisis_physical_ignore: {
        text: 'Ignore it and keep going',
        feedback: 'You push through while everyone notices your pale face. "I am fine" does not make it true.',
      },
    },
  },
  evt_crisis_social_exclusion: {
    text: 'In group chat, you see "do not invite them." The screen darkens, and so does something inside you.',
    choices: {
      crisis_social_confront: {
        text: 'Confront them directly',
        feedback: 'You speak up. Some apologize, some turn away. At least your voice is not silent.',
      },
      crisis_social_withdraw: {
        text: 'Step away quietly',
        feedback: 'You spend the night reading, but none of it lands. Loneliness aches quietly.',
      },
    },
  },
  evt_momentum_aggressive_reputation: {
    text: 'Your hard, direct style spreads around the neighborhood. Some people retreat, others open doors.',
    choices: {
      aggressive_reputation_control: {
        text: 'Control the power and set clear boundaries',
        feedback: 'You shape a line that earns respect, not fear.',
      },
      aggressive_reputation_push: {
        text: 'Push harder with a sharper stance',
        feedback: 'Influence rises, but relationships fracture.',
      },
    },
  },
  evt_momentum_helpful_street_thanks: {
    text: 'Someone you helped earlier stops you on the street: "You helped me stand up again."',
    choices: {
      helpful_street_thanks_accept: {
        text: 'Smile and accept the thanks',
        feedback: 'Trust around you turns into a quiet kind of power.',
      },
      helpful_street_thanks_redirect: {
        text: 'Redirect support to someone else in need',
        feedback: 'The chain of help grows beyond you.',
      },
    },
  },
  evt_momentum_helpful_unexpected_support: {
    text: 'A person you supported in the past now offers unexpected support when you need it.',
    choices: {
      helpful_support_accept: {
        text: 'Accept and thank them',
        feedback: 'Sometimes what you give really does come back stronger.',
      },
      helpful_support_share: {
        text: 'Pass part of that support onward',
        feedback: 'Sharing expands your network of trust.',
      },
    },
  },
  evt_momentum_pragmatic_information_edge: {
    text: 'Your organized notes reveal a critical opportunity before anyone else sees it.',
    choices: {
      pragmatic_info_calm: {
        text: 'Stay calm and move deliberately',
        feedback: 'Right information at the right time puts you one step ahead.',
      },
      pragmatic_info_press: {
        text: 'Accelerate with aggressive timing',
        feedback: 'Fast execution pays off, but raises pressure.',
      },
    },
  },
  evt_momentum_pragmatic_short_offer: {
    text: 'Your consistency gets noticed. Someone nearby offers a short-term, well-paid job.',
    choices: {
      pragmatic_offer_accept: {
        text: 'Accept and make a clear plan',
        feedback: 'You calculate quickly, manage risk, and increase your gain.',
      },
      pragmatic_offer_negotiate: {
        text: 'Negotiate better terms',
        feedback: 'You read the details and tilt the advantage your way.',
      },
    },
  },
  fam_chaotic_no_dinner: {
    text: 'You get home and there is no dinner. Everyone is lost in their own chaos.',
    choices: {
      chaotic_ask_neighbor: {
        text: 'Ask the neighbor for help',
        feedback: 'You knock, ask, and receive both food and warmth.',
      },
      chaotic_cook_self: {
        text: 'Prepare something yourself',
        feedback: 'You make a mess, but you handle it. Responsibility unlocked.',
      },
    },
  },
  fam_chaotic_parent_conflict: {
    text: 'The argument at home is escalating, and you feel trapped in the middle.',
    choices: {
      chaotic_mediate: {
        text: 'Try to mediate',
        feedback: 'No full peace, but you stop complete collapse. Heavy work for one person.',
      },
      chaotic_hide_room: {
        text: 'Retreat to your room',
        feedback: 'You close the door. Noise stays outside, guilt stays inside.',
      },
      chaotic_go_out: {
        text: 'Step outside and breathe',
        feedback: 'A walk clears your head. The problem stays, but you return steadier.',
      },
    },
  },
  fam_chaotic_self_reliance: {
    text: 'Another home fight. This time you stop stepping in and choose to build your own routine.',
    choices: {
      chaotic_self_routine: {
        text: 'Build your own structure',
        feedback: 'Your own meals, schedule, and rules. Independence becomes a skill.',
      },
      chaotic_self_escape: {
        text: 'Stay away from home as much as possible',
        feedback: 'Library, park, friends\' places. Relief grows, distance grows too.',
      },
    },
  },
  fam_evo_family_silence: {
    text: 'No one talks at home anymore. Silence feels like a wall.',
    choices: {
      family_crisis_talk: {
        text: 'Break the silence',
        feedback: 'Hard conversation, but a piece of the wall cracks.',
      },
      family_crisis_withdraw: {
        text: 'Withdraw into your own life',
        feedback: 'You stabilize yourself, while family ties thin out further.',
      },
    },
  },
  fam_evo_strict_softening: {
    text: "For once, your father does not command. He quietly sits next to you and says, 'Want to watch the match?'",
    choices: {
      strict_softening_warm: {
        text: 'Lean into the moment',
        feedback: 'For the first time, closeness appears without rules.',
      },
      strict_softening_guarded: {
        text: 'Stay cautious, but stay there',
        feedback: 'You keep some distance but do not leave. A new balance may be forming.',
      },
    },
  },
  fam_strict_no_permission: {
    text: 'Friends invite you out, but the answer at home is final: no permission.',
    choices: {
      strict_follow_rule: {
        text: 'Follow the rule',
        feedback: 'You stay in. It stings, but the house stays calm.',
      },
      strict_sneak_out: {
        text: 'Sneak out',
        feedback: 'Fun outside, interrogation inside. High risk, high cost.',
      },
      strict_negotiate: {
        text: 'Negotiate',
        feedback: 'Not perfect, but you reach middle ground. For once, they listen to the end.',
      },
    },
  },
  fam_strict_notebook_check: {
    text: "Your father puts your gradebook on the table: 'I want to see every page.'",
    choices: {
      strict_obey_notebook: {
        text: 'Hand it over and explain',
        feedback: 'The questioning is harsh, but you hide nothing. Trust inches up.',
      },
      strict_hide_notebook: {
        text: 'Hide it',
        feedback: 'You dodge this round, but fear follows you all day.',
      },
    },
  },
  fam_strict_rebel_pushback: {
    text: 'Friends are out, you feel trapped at home, and the rules feel unbearable.',
    choices: {
      strict_rebel_confront: {
        text: 'Confront your father head-on',
        feedback: 'Voices rise, doors shake. For once, your voice is undeniable.',
      },
      strict_rebel_plan: {
        text: 'Stay quiet and make your own plan',
        feedback: 'Outwardly calm, inwardly strategic. You decide to wait for your moment.',
      },
    },
  },
  fam_strict_university_choice: {
    text: 'University choices are on the table, and your father pushes one path hard.',
    choices: {
      strict_obey_career: {
        text: 'Obey',
        feedback: 'Family is pleased, doors stay open. You still wonder how much of this is yours.',
      },
      strict_rebel_career: {
        text: 'Choose your own path',
        feedback: 'The table gets loud. You feel alone, but the decision is finally yours.',
      },
      strict_compromise_career: {
        text: 'Seek compromise',
        feedback: 'Not your full dream, not total surrender. This time negotiation works.',
      },
    },
  },
  fam_supportive_calm_foundation: {
    text: 'Your family supports you, but you are not fully sure what you want yet.',
    choices: {
      supportive_explore_slow: {
        text: 'Explore slowly',
        feedback: 'You do not force certainty. Step by step, your direction sharpens.',
      },
      supportive_stay_safe: {
        text: 'Stay on the known path',
        feedback: 'You choose stability. Less risk, steady support.',
      },
    },
  },
  fam_supportive_failure_response: {
    text: 'You fail, and your family says it happens. You still do not feel okay.',
    choices: {
      supportive_push_yourself: {
        text: 'Push hard for the next attempt',
        feedback: 'You build a stronger plan, but your body feels the pressure.',
      },
      supportive_self_compassion: {
        text: 'Recover and reset',
        feedback: 'You take a breath. Slower growth, healthier rhythm.',
      },
    },
  },
  fam_supportive_growth_challenge: {
    text: 'Your family supports you, and now you want to set a bigger target.',
    choices: {
      supportive_big_goal: {
        text: 'Set a bold goal',
        feedback: 'Support behind you, horizon ahead. Hard path, meaningful pull.',
      },
      supportive_share_dream: {
        text: 'Share your dream with family',
        feedback: 'They get emotional and proud. You start planning together.',
      },
    },
  },
  fam_supportive_surprise_day: {
    text: 'Your family plans a surprise day for you. Too much, or just right?',
    choices: {
      supportive_celebrate: {
        text: 'Lean in and celebrate',
        feedback: 'You join with laughter. The bond at home gets stronger.',
      },
      supportive_shy_accept: {
        text: 'Accept shyly',
        feedback: 'You stay quiet but appreciative. A soft harmony settles in.',
      },
    },
  },
  milestone_best_friend_celebration: {
    ...(enEventTranslationsGenerated.milestone_best_friend_celebration ?? {}),
    choices: {
      choice_0: {
        text: '"You matter to me too."',
        feedback: 'You hug tightly. This friendship feels built for years.',
      },
      choice_1: {
        text: 'Give a meaningful gift',
        feedback: 'You offer a keepsake for your bond. Their eyes fill up.',
      },
      choice_2: {
        text: 'Promise lifelong friendship',
        feedback: 'You seal it with words that carry weight.',
      },
    },
  },
  milestone_bff_promise: {
    ...(enEventTranslationsGenerated.milestone_bff_promise ?? {}),
    choices: {
      choice_0: {
        text: 'Wear your half of the necklace',
        feedback: 'You put it on. A small object, a big symbol.',
      },
      choice_1: {
        text: 'Thank them, but decline',
        feedback: 'You refuse gently. They look a little disappointed.',
      },
    },
  },
  milestone_butterflies: {
    ...(enEventTranslationsGenerated.milestone_butterflies ?? {}),
    choices: {
      choice_0: {
        text: 'Accept your feelings',
        feedback: 'You admit what is real. Next step is the hard part.',
      },
      choice_1: {
        text: 'Write it in your journal',
        feedback: 'You empty your thoughts onto paper. Lighter, but still uncertain.',
      },
      choice_2: {
        text: 'Suppress it',
        feedback: 'You try to ignore it. Ignoring is not the same as healing.',
      },
    },
  },
  milestone_enemy_made: {
    ...(enEventTranslationsGenerated.milestone_enemy_made ?? {}),
    choices: {
      choice_0: {
        text: 'Feel the danger',
        feedback: 'You just made an enemy. Watch your back.',
      },
      choice_1: {
        text: '"I am not afraid."',
        feedback: 'You stand tall, but this will not be an easy conflict.',
      },
    },
  },
  milestone_first_crush_feelings: {
    ...(enEventTranslationsGenerated.milestone_first_crush_feelings ?? {}),
    choices: {
      choice_0: {
        text: '"Nothing, I just got warm."',
        feedback: 'You play it off. Nobody buys it.',
      },
      choice_1: {
        text: 'Tell your friends',
        feedback: 'They get excited instantly. You now have unofficial advisors.',
      },
    },
  },
  milestone_first_date: {
    ...(enEventTranslationsGenerated.milestone_first_date ?? {}),
    choices: {
      choice_0: {
        text: 'Go to the movies',
        feedback: 'Great film, better moments between scenes.',
      },
      choice_1: {
        text: 'Take a walk in the park',
        feedback: 'Easy conversation, steady pace, good chemistry.',
      },
      choice_2: {
        text: 'Meet at a cafe',
        feedback: 'Hours pass in conversation. You learn each other for real.',
      },
    },
  },
  milestone_friendship_lost: {
    ...(enEventTranslationsGenerated.milestone_friendship_lost ?? {}),
    choices: {
      choice_0: {
        text: 'Let yourself grieve',
        feedback: 'Some friendships end. Knowing that does not make it painless.',
      },
      choice_1: {
        text: 'Act pragmatic',
        feedback: 'You move on fast outside. Something still feels missing inside.',
      },
    },
  },
  milestone_heartbreak: {
    ...(enEventTranslationsGenerated.milestone_heartbreak ?? {}),
    choices: {
      choice_0: {
        text: 'Cry it out',
        feedback: 'It hurts now. Time will do what time does.',
      },
      choice_1: {
        text: 'Lean into anger',
        feedback: 'Anger feels stronger than sadness, until it burns you too.',
      },
      choice_2: {
        text: 'Hide in music',
        feedback: 'Music dulls the edge, but the ache is still there.',
      },
    },
  },
  milestone_new_friendship: {
    ...(enEventTranslationsGenerated.milestone_new_friendship ?? {}),
    choices: {
      choice_0: {
        text: '"You matter to me too."',
        feedback: 'The friendship deepens into real trust.',
      },
      choice_1: {
        text: 'Smile and hug',
        feedback: 'Warm moment. Solid bond.',
      },
    },
  },
  milestone_new_relationship: {
    ...(enEventTranslationsGenerated.milestone_new_relationship ?? {}),
    choices: {
      choice_0: {
        text: '"I am really happy too."',
        feedback: 'Your first relationship begins. Everything feels brighter.',
      },
      choice_1: {
        text: 'Smile shyly',
        feedback: 'Awkward, sweet, and new.',
      },
    },
  },
  milestone_rivalry_begins: {
    ...(enEventTranslationsGenerated.milestone_rivalry_begins ?? {}),
    choices: {
      choice_0: {
        text: '"I am better."',
        feedback: 'You accept the rivalry. It may sharpen you, or consume you.',
      },
      choice_1: {
        text: 'Offer peace',
        feedback: '"We do not have to be enemies." Maybe it lands, maybe not.',
      },
      choice_2: {
        text: 'Ignore it',
        feedback: 'You stay unbothered, but they are not done yet.',
      },
    },
  },
  lt_budgeting_first_income: {
    text: 'Your first part-time paycheck just landed. Spend it or save it?',
    choices: {
      choice_0: {
        text: 'Make a budget and save part of it',
        feedback: 'You start building healthy money habits early.',
      },
      choice_1: {
        text: 'Spend it all on yourself',
        feedback: 'The instant joy is real, but month-end might be rough.',
      },
    },
  },
  lt_career_fair_day: {
    text: 'Career day at school: booths, people, and too many options.',
    choices: {
      choice_0: {
        text: 'Talk in depth with three different departments',
        feedback: 'Your options feel clearer now.',
      },
      choice_1: {
        text: 'Just walk around with close friends',
        feedback: 'Comfortable day, but limited takeaways.',
      },
    },
  },
  lt_career_internship_offer: {
    text: 'A small team offers you a summer internship.',
    choices: {
      choice_0: {
        text: 'Accept the offer',
        feedback: 'You take your first real professional step.',
      },
      choice_1: {
        text: 'Postpone to focus on exams',
        feedback: 'You set clear priorities for now.',
      },
    },
  },
  lt_career_internship_rejection: {
    text: 'Your internship application was rejected.',
    choices: {
      choice_0: {
        text: 'Ask for feedback',
        feedback: 'You turn rejection into a lesson.',
      },
      choice_1: {
        text: 'Give up completely',
        feedback: 'Your motivation drops hard.',
      },
    },
  },
  lt_career_networking_event: {
    text: 'A mini networking event is happening on campus.',
    choices: {
      choice_0: {
        text: 'Introduce yourself to three people',
        feedback: 'You make valuable new connections.',
      },
      choice_1: {
        text: 'Just listen from the sidelines',
        feedback: 'Safe choice, but mostly passive.',
      },
    },
  },
  lt_career_portfolio_push: {
    text: 'You need a short portfolio for your internship applications.',
    choices: {
      choice_0: {
        text: 'Polish and organize your projects',
        feedback: 'Your application package gets much stronger.',
      },
      choice_1: {
        text: 'Send it as-is',
        feedback: 'You take a risky shortcut.',
      },
    },
  },
  lt_career_public_speaking: {
    text: 'You will give a short class talk about your career goals.',
    choices: {
      choice_0: {
        text: 'Prepare properly',
        feedback: 'You express yourself clearly and confidently.',
      },
      choice_1: {
        text: 'Improvise',
        feedback: 'You survive it, but it feels shaky.',
      },
    },
  },
  lt_career_shadow_day: {
    text: 'You get a chance to shadow a professional for one day.',
    choices: {
      choice_0: {
        text: 'Stay for the full day',
        feedback: 'You see the real rhythm of the job up close.',
      },
      choice_1: {
        text: 'Leave halfway through',
        feedback: 'You miss part of a rare opportunity.',
      },
    },
  },
  lt_career_startup_idea: {
    text: 'After the career fair, a business idea keeps buzzing in your head. Start your own project?',
    choices: {
      startup_build: {
        text: 'Start building now',
        feedback: 'You turn into a late-night builder. Small project, big potential.',
      },
      startup_plan: {
        text: 'Draft a business plan first',
        feedback: 'Market research and cost planning make the dream more concrete.',
      },
    },
  },
  lt_career_teacher_reference: {
    text: 'You are thinking about asking a teacher for a reference letter.',
    choices: {
      choice_0: {
        text: 'Ask politely',
        feedback: 'A simple step that boosts your confidence.',
      },
      choice_1: {
        text: 'Back out',
        feedback: 'Self-doubt keeps you from moving forward.',
      },
    },
  },
  lt_exam_focus_walk: {
    text: 'You consider a short walk to reset focus before studying.',
    choices: {
      choice_0: {
        text: 'Take the walk',
        feedback: 'Your breathing settles and your focus returns.',
      },
      choice_1: {
        text: 'Stay at the desk',
        feedback: 'You keep studying, but your mind feels crowded.',
      },
    },
  },
  lt_exam_group_revision: {
    text: 'Friends invite you to a group revision session.',
    choices: {
      choice_0: {
        text: 'Join and solve questions together',
        feedback: 'The group pace helps you move faster.',
      },
      choice_1: {
        text: 'Study alone at home',
        feedback: 'You stay in solo mode the whole time.',
      },
    },
  },
  lt_exam_last_week_plan: {
    text: 'One week left before the exam. You need a plan for the plan.',
    choices: {
      choice_0: {
        text: 'Create daily target lists',
        feedback: 'You manage the critical week with structure.',
      },
      choice_1: {
        text: 'Wing it day by day',
        feedback: 'Your mental clutter gets worse.',
      },
    },
  },
  lt_exam_library_lockin: {
    text: 'You find a quiet desk for a long library session.',
    choices: {
      choice_0: {
        text: 'Study for two uninterrupted hours',
        feedback: 'It turns into a highly productive block.',
      },
      choice_1: {
        text: 'Leave early',
        feedback: 'At least you avoid overpushing yourself.',
      },
    },
  },
  lt_exam_mock_recovery: {
    text: 'Your latest mock result is below expectations. Time to recover.',
    choices: {
      choice_0: {
        text: 'Analyze your mistakes',
        feedback: 'Your weak spots become crystal clear.',
      },
      choice_1: {
        text: 'Avoid looking at the result',
        feedback: 'Short relief now, bigger stress later.',
      },
    },
  },
  lt_exam_parent_expectation: {
    text: 'Your family expectations are high and pressure is building.',
    choices: {
      choice_0: {
        text: 'Talk openly',
        feedback: 'The pressure eases a little.',
      },
      choice_1: {
        text: 'Keep it all inside',
        feedback: 'Calm outside, tense inside.',
      },
    },
  },
  lt_exam_pomodoro_reset: {
    text: 'You try a Pomodoro routine to regain focus during mock-exam week.',
    choices: {
      choice_0: {
        text: 'Stick to the routine',
        feedback: 'Your rhythm starts to click.',
      },
      choice_1: {
        text: 'Drop the plan',
        feedback: 'Your attention drifts again.',
      },
    },
  },
  lt_exam_sleep_tradeoff: {
    text: 'You are torn between late-night revision and early sleep.',
    choices: {
      choice_0: {
        text: 'Sleep early',
        feedback: 'You wake up with a fresher mind.',
      },
      choice_1: {
        text: 'Pull an all-nighter',
        feedback: 'Short-term gain, heavy fatigue cost.',
      },
    },
  },
  lt_exam_strategic_reset: {
    text: 'Exam week is intense, but you stay calm and think strategically.',
    choices: {
      exam_strategic_schedule: {
        text: 'Build a detailed study schedule',
        feedback: 'You map topics and breaks carefully. The system works.',
      },
      exam_strategic_focus: {
        text: 'Focus only on weak topics',
        feedback: 'You stop chasing perfection and close the most important gaps.',
      },
    },
  },
  lt_exam_week_burnout_signal: {
    text: 'Midweek, sleep loss and mental fog start showing clear burnout signals.',
    choices: {
      choice_0: {
        text: 'Lighten today and prioritize rest',
        feedback: 'Once your rhythm resets, your efficiency returns.',
      },
      choice_1: {
        text: 'Keep pushing at full speed',
        feedback: 'You progress briefly, but pay a heavy price.',
      },
    },
  },
  lt_family_calm_negotiation: {
    text: 'Family meeting tonight. This time you choose calm negotiation over another fight.',
    choices: {
      family_calm_propose: {
        text: 'Present concrete proposals',
        feedback: 'You speak calmly. They listen, and some rules start to loosen.',
      },
      family_calm_listen: {
        text: 'Listen first, then speak',
        feedback: 'Hard at first, but effective. Mutual understanding grows.',
      },
    },
  },
  lt_family_house_rules_reset: {
    text: 'As graduation approaches, house rules are being rewritten.',
    choices: {
      choice_0: {
        text: 'Build shared rules together',
        feedback: 'Trust at home gets stronger.',
      },
      choice_1: {
        text: 'React defensively',
        feedback: 'Tension keeps climbing.',
      },
    },
  },
  lt_family_independence_argument: {
    text: 'Your family limits your curfew, but you want more independence.',
    choices: {
      choice_0: {
        text: 'Revisit the rules calmly',
        feedback: 'The tension drops and you find middle ground.',
      },
      choice_1: {
        text: 'Slam the door and leave',
        feedback: 'You feel relief for a moment, but the relationship strains.',
      },
    },
  },
  lt_family_responsibility_share: {
    text: 'Household responsibilities are being redistributed.',
    choices: {
      choice_0: {
        text: 'Take regular duties',
        feedback: 'You earn more trust at home.',
      },
      choice_1: {
        text: 'Keep postponing everything',
        feedback: 'Trust starts slipping.',
      },
    },
  },
  lt_family_trust_rebuild: {
    text: 'After an old conflict, you get a chance to rebuild trust.',
    choices: {
      choice_0: {
        text: 'Show consistency',
        feedback: 'The relationship begins to recover.',
      },
      choice_1: {
        text: 'Ignore it',
        feedback: 'The distance remains.',
      },
    },
  },
  lt_family_uni_city_conflict: {
    text: 'Choosing a university city creates disagreement in your family.',
    choices: {
      choice_0: {
        text: 'Explain with data and reasons',
        feedback: 'Your decision becomes easier for them to understand.',
      },
      choice_1: {
        text: 'Dig in stubbornly',
        feedback: 'Communication gets harder.',
      },
    },
  },
  lt_family_weekend_argument: {
    text: 'Your weekend outing plan turns into another argument.',
    choices: {
      choice_0: {
        text: 'Negotiate with a clear time plan',
        feedback: 'You find a workable compromise.',
      },
      choice_1: {
        text: 'Leave abruptly',
        feedback: 'The tension spikes.',
      },
    },
  },
  lt_finance_debt_from_friend: {
    text: 'A friend asks to borrow a small amount of money.',
    choices: {
      choice_0: {
        text: 'Lend it with a clear repayment plan',
        feedback: 'You support them while protecting your boundaries.',
      },
      choice_1: {
        text: 'Say no',
        feedback: 'You keep your financial balance intact.',
      },
    },
  },
  lt_finance_emergency_fund: {
    text: 'Starting an emergency fund suddenly makes a lot of sense.',
    choices: {
      choice_0: {
        text: 'Set aside a safety amount',
        feedback: 'You gain a stronger buffer for bad days.',
      },
      choice_1: {
        text: 'Use everything now',
        feedback: 'You choose immediate pleasure.',
      },
    },
  },
  lt_finance_first_salary_plan: {
    text: 'You hear about the 50/30/20 rule for your first steady income.',
    choices: {
      choice_0: {
        text: 'Apply the plan',
        feedback: 'Your money becomes easier to manage.',
      },
      choice_1: {
        text: 'Spend without a plan',
        feedback: 'Month-end gets tight.',
      },
    },
  },
  lt_finance_impulse_buy: {
    text: 'You spot a discounted item you do not need but really want.',
    choices: {
      choice_0: {
        text: 'Wait 24 hours',
        feedback: 'Pausing to think works.',
      },
      choice_1: {
        text: 'Buy it immediately',
        feedback: 'Regret shows up later.',
      },
    },
  },
  lt_finance_micro_investment: {
    text: 'A micro-investing app catches your attention.',
    choices: {
      choice_0: {
        text: 'Learn the basics and start',
        feedback: 'You take your first step with risk awareness.',
      },
      choice_1: {
        text: 'Jump in without research',
        feedback: 'Market swings hit your confidence hard.',
      },
    },
  },
  lt_finance_savings_goal: {
    text: 'You set yourself a three-month savings target.',
    choices: {
      choice_0: {
        text: 'Create a tracking chart',
        feedback: 'Your goal becomes visible and manageable.',
      },
      choice_1: {
        text: 'Keep it in your head only',
        feedback: 'Tracking quickly gets messy.',
      },
    },
  },
  lt_finance_scholarship_search: {
    text: 'You spend a long evening browsing scholarship portals.',
    choices: {
      choice_0: {
        text: 'Complete the applications',
        feedback: 'You make a move that could ease financial pressure.',
      },
      choice_1: {
        text: 'Leave them half-finished',
        feedback: 'The window of opportunity narrows.',
      },
    },
  },
  lt_finance_side_hustle_start: {
    text: 'A side-income idea appears: online design work or tutoring support.',
    choices: {
      choice_0: {
        text: 'Start a trial run',
        feedback: 'You land your first client.',
      },
      choice_1: {
        text: 'Avoid the risk',
        feedback: 'You stay stable, but growth pauses.',
      },
    },
  },
  lt_first_heartbreak: {
    text: 'A single message ends your relationship. The room feels heavier than usual.',
    choices: {
      choice_0: {
        text: 'Open up to someone close',
        feedback: 'Sharing the pain makes it lighter.',
      },
      choice_1: {
        text: 'Bury it and dive into studying',
        feedback: 'You look strong outside, but feel drained inside.',
      },
    },
  },
  lt_first_internship_call: {
    text: 'A startup calls you for an internship interview. Your pulse jumps instantly.',
    choices: {
      choice_0: {
        text: 'Prepare seriously',
        feedback: 'You leave a strong first impression.',
      },
      choice_1: {
        text: 'Ask to postpone',
        feedback: 'You buy time, but risk losing momentum.',
      },
    },
  },
  lt_first_love_confession: {
    text: 'You are tired of writing and deleting that message to your crush.',
    choices: {
      choice_0: {
        text: 'Say how you feel clearly',
        feedback: 'Whatever happens next, that was a brave step.',
      },
      choice_1: {
        text: 'Stay friends',
        feedback: 'You keep things calm and controlled.',
      },
    },
  },
  lt_first_love_deepening: {
    text: 'You confessed and got a positive response, but boundaries and expectations are still unclear.',
    choices: {
      love_deep_communicate: {
        text: 'Talk openly about it',
        feedback: 'Hard conversation, healthier relationship foundation.',
      },
      love_deep_slow: {
        text: 'Take it slow',
        feedback: 'No rush. The pace is slow but steady.',
      },
    },
  },
  lt_identity_crisis_week: {
    text: 'Everyone expects something from you, while you are still figuring out what you want.',
    choices: {
      choice_0: {
        text: 'Journal to clarify your thoughts',
        feedback: 'Writing helps you understand yourself better.',
      },
      choice_1: {
        text: 'Scroll social media and avoid it',
        feedback: 'Nice short escape, same unanswered questions.',
      },
    },
  },
  lt_identity_gap_year_talk: {
    text: 'A gap-year plan starts to make sense for your post-graduation path.',
    choices: {
      choice_0: {
        text: 'Research and plan it properly',
        feedback: 'The uncertainty shrinks.',
      },
      choice_1: {
        text: 'Shut the idea down',
        feedback: 'The decision is postponed again.',
      },
    },
  },
  lt_identity_journal_reflection: {
    text: 'You face your own words while looking in the mirror.',
    choices: {
      choice_0: {
        text: 'Write honestly',
        feedback: 'Getting it onto paper helps you breathe.',
      },
      choice_1: {
        text: 'Leave the page blank',
        feedback: 'The issue stays deferred.',
      },
    },
  },
  lt_identity_new_hobby: {
    text: 'You feel a new hobby might change something in you.',
    choices: {
      choice_0: {
        text: 'Go to a trial class',
        feedback: 'You discover a new side of yourself.',
      },
      choice_1: {
        text: 'Stay in your comfort zone',
        feedback: 'Safe choice, little growth.',
      },
    },
  },
  lt_identity_role_conflict: {
    text: 'Home expectations and school goals keep colliding.',
    choices: {
      choice_0: {
        text: 'Set clear priorities',
        feedback: 'The conflict becomes manageable.',
      },
      choice_1: {
        text: 'Try doing everything at once',
        feedback: 'The pressure keeps stacking.',
      },
    },
  },
  lt_identity_social_mask: {
    text: 'You feel different in crowds than when you are alone.',
    choices: {
      choice_0: {
        text: 'Talk to someone you trust',
        feedback: 'The mask slips down a little.',
      },
      choice_1: {
        text: 'Keep it all inside',
        feedback: 'The weight does not get lighter.',
      },
    },
  },
  lt_identity_value_map: {
    text: 'You decide to list your core values and compare them with how you actually live.',
    choices: {
      choice_0: {
        text: 'Make a detailed list',
        feedback: 'You gain a clearer inner map.',
      },
      choice_1: {
        text: 'Put it off to next week',
        feedback: 'The question marks stay.',
      },
    },
  },
  lt_lgs_mentor_offer: {
    text: 'An older student from your neighborhood offers to mentor you through LGS/YKS prep.',
    choices: {
      choice_0: {
        text: 'Accept the mentorship',
        feedback: 'Good guidance boosts your motivation.',
      },
      choice_1: {
        text: 'Continue on your own',
        feedback: 'More independence, tougher road.',
      },
    },
  },
  lt_love_friend_advice: {
    text: 'Your closest friend gives very direct advice about your relationship.',
    choices: {
      choice_0: {
        text: 'Listen to the advice',
        feedback: 'An outside perspective helps.',
      },
      choice_1: {
        text: 'Do it your own way',
        feedback: 'Independent decision, higher risk.',
      },
    },
  },
  lt_love_long_text_night: {
    text: 'Late at night, you are torn between sending a long message or staying quiet.',
    choices: {
      choice_0: {
        text: 'Trim it down and keep it clear',
        feedback: 'You communicate your point cleanly.',
      },
      choice_1: {
        text: 'Send the emotional version',
        feedback: 'Waiting for the response wears you out.',
      },
    },
  },
  lt_love_mixed_signals: {
    text: 'Your crush keeps sending mixed signals.',
    choices: {
      choice_0: {
        text: 'Ask a direct question',
        feedback: 'Uncertainty gives way to clarity.',
      },
      choice_1: {
        text: 'Keep interpreting signs',
        feedback: 'The ambiguity stretches on.',
      },
    },
  },
  lt_love_new_crush: {
    text: 'After a long time, you feel excited about someone again.',
    choices: {
      choice_0: {
        text: 'Start with a kind greeting',
        feedback: 'A new chapter opens a little.',
      },
      choice_1: {
        text: 'Watch from afar',
        feedback: 'You choose caution over momentum.',
      },
    },
  },
  lt_love_reconciliation_attempt: {
    text: 'After the breakup, an offer comes in to talk again.',
    choices: {
      choice_0: {
        text: 'Set up a calm meeting',
        feedback: 'You handle it with maturity.',
      },
      choice_1: {
        text: 'Decline immediately',
        feedback: 'You protect your boundaries.',
      },
    },
  },
  lt_memory_echo_regret: {
    text: 'A familiar regret comes back and asks what you will do differently this time.',
    choices: {
      choice_0: {
        text: 'Act more consciously this time',
        feedback: 'You carry the lesson forward instead of repeating the pattern.',
      },
      choice_1: {
        text: 'Avoid thinking about it',
        feedback: 'The short escape feels good, but nothing is really resolved.',
      },
    },
  },
  lt_yks_trial_night: {
    text: 'Your YKS mock score comes in lower than expected. You quietly rework your study plan.',
    choices: {
      choice_0: {
        text: 'Plan your weak topics',
        feedback: 'You build a focused revision roadmap.',
      },
      choice_1: {
        text: 'Close the day and rest',
        feedback: 'A short break helps your mind reset.',
      },
    },
  },
  lt_love_boundary_talk: {
    text: 'Your relationship needs a clear conversation about boundaries and expectations.',
    choices: {
      choice_0: {
        text: 'Have an honest talk',
        feedback: 'You set healthier boundaries and built more trust.',
      },
      choice_1: {
        text: 'Avoid the topic',
        feedback: 'The tension does not disappear, it just gets postponed.',
      },
    },
  },
  lt_family_budget_meeting: {
    text: 'At the family budget meeting, you are finally asked to share your view.',
    choices: {
      choice_0: {
        text: 'Offer a practical plan',
        feedback: 'Your idea is taken seriously.',
      },
      choice_1: {
        text: 'Stay quiet',
        feedback: 'You keep the peace, but miss a chance to influence the decision.',
      },
    },
  },
  tr_23_nisan: {
    ...(enEventTranslationsGenerated.tr_23_nisan ?? {}),
    text: "It is April 23rd, National Sovereignty and Children's Day. The school celebration is about to begin.",
  },
  tr_bayram_sabahi_cocuk: {
    ...(enEventTranslationsGenerated.tr_bayram_sabahi_cocuk ?? {}),
    text: 'Holiday morning. You put on new clothes, visit elders, and hope to collect pocket money.',
  },
  tr_aile_yemegi_cocuk: {
    ...(enEventTranslationsGenerated.tr_aile_yemegi_cocuk ?? {}),
    text: 'It is family dinner time. Everyone is at the table and the kitchen smells great.',
  },
  tr_ramazan_iftar_cocuk: {
    ...(enEventTranslationsGenerated.tr_ramazan_iftar_cocuk ?? {}),
    text: 'It is Ramadan, and the house is busy preparing for iftar guests.',
  },
  tr_kurban_bayrami_cocuk: {
    ...(enEventTranslationsGenerated.tr_kurban_bayrami_cocuk ?? {}),
    text: 'It is Eid al-Adha. Your cousins are here, and the day is full of tradition and family activity.',
  },
  tr_karne_gunu_ilkokul: {
    ...(enEventTranslationsGenerated.tr_karne_gunu_ilkokul ?? {}),
    text: 'Report card day at primary school. Your heart pounds while the teacher hands them out one by one.',
  },
  tr_sabah_uyanis_cocuk: {
    ...(enEventTranslationsGenerated.tr_sabah_uyanis_cocuk ?? {}),
    text: 'Morning rush. Mom calls you to get up before you are late for school.',
  },
  tr_milli_mac_cocuk: {
    ...(enEventTranslationsGenerated.tr_milli_mac_cocuk ?? {}),
    text: 'The national team is playing, and the whole neighborhood is buzzing with excitement.',
  },
  tr_mahalle_futbolu_cocuk: {
    ...(enEventTranslationsGenerated.tr_mahalle_futbolu_cocuk ?? {}),
    text: 'Older kids are playing soccer in the neighborhood, and you want to join them.',
  },
  tr_komsu_ziyaret_cocuk: {
    ...(enEventTranslationsGenerated.tr_komsu_ziyaret_cocuk ?? {}),
    text: 'Neighbors come over with a child your age, and your mom encourages you to play together.',
  },
  tr_yagmurlu_gun_cocuk: {
    ...(enEventTranslationsGenerated.tr_yagmurlu_gun_cocuk ?? {}),
    text: 'It is raining all day, so you need an indoor plan.',
  },
  tr_park_salincak: {
    ...(enEventTranslationsGenerated.tr_park_salincak ?? {}),
    text: 'You want the swing at the park, but there is a line.',
  },
  tr_sokak_kedisi: {
    ...(enEventTranslationsGenerated.tr_sokak_kedisi ?? {}),
    text: 'You see a small stray cat on the street. It looks hungry.',
  },
  tr_ilk_dogum_gunu: {
    ...(enEventTranslationsGenerated.tr_ilk_dogum_gunu ?? {}),
    text: 'It is your birthday party: cake, balloons, friends, and big expectations.',
  },
  tr_kirilan_oyuncak: {
    ...(enEventTranslationsGenerated.tr_kirilan_oyuncak ?? {}),
    text: 'Your favorite toy just broke, and it hurts more than you expected.',
  },
  tr_yabanci_seker: {
    ...(enEventTranslationsGenerated.tr_yabanci_seker ?? {}),
    text: 'A stranger in the park offers you candy.',
  },
  tr_doktor_asi: {
    ...(enEventTranslationsGenerated.tr_doktor_asi ?? {}),
    text: 'Today is vaccine day at the clinic, and you are nervous.',
  },
  tr_hayali_arkadas: {
    ...(enEventTranslationsGenerated.tr_hayali_arkadas ?? {}),
    text: 'You keep talking to your imaginary friend in your room.',
  },
  tr_ilk_yalan: {
    ...(enEventTranslationsGenerated.tr_ilk_yalan ?? {}),
    text: 'You broke the vase and no one saw it. Mom asks who did it.',
  },
  tr_anne_yardim_cocuk: {
    ...(enEventTranslationsGenerated.tr_anne_yardim_cocuk ?? {}),
    text: 'Mom is cleaning and asks if you can help.',
  },
  tr_markette_kaybolma: {
    ...(enEventTranslationsGenerated.tr_markette_kaybolma ?? {}),
    text: 'At the market, you lose sight of your mom and panic.',
  },
  tr_resim_yarisma: {
    ...(enEventTranslationsGenerated.tr_resim_yarisma ?? {}),
    text: 'Your class is entering a drawing contest.',
  },
  tr_yatmadan_hikaye: {
    ...(enEventTranslationsGenerated.tr_yatmadan_hikaye ?? {}),
    text: 'Bedtime comes, and mom offers to read you a story.',
  },
  tr_ilk_odev: {
    ...(enEventTranslationsGenerated.tr_ilk_odev ?? {}),
    text: 'You get your first real homework assignment.',
  },
  tr_yeni_arkadas: {
    ...(enEventTranslationsGenerated.tr_yeni_arkadas ?? {}),
    text: 'A new student joins the class and sits alone.',
  },
  tr_sinav_sonucu: {
    ...(enEventTranslationsGenerated.tr_sinav_sonucu ?? {}),
    text: 'Exam papers are being handed back, and your heartbeat gets louder.',
  },
  tr_teneffus_yalniz: {
    ...(enEventTranslationsGenerated.tr_teneffus_yalniz ?? {}),
    text: 'At recess, everyone is grouped up and you are alone.',
  },
  tr_kopya_iste: {
    ...(enEventTranslationsGenerated.tr_kopya_iste ?? {}),
    text: 'During the exam, your friend whispers and asks for your answers.',
  },
  tr_harclik_kaybet: {
    ...(enEventTranslationsGenerated.tr_harclik_kaybet ?? {}),
    text: 'You lose your pocket money before you can spend it.',
  },
  tr_kardes_kavga: {
    ...(enEventTranslationsGenerated.tr_kardes_kavga ?? {}),
    text: 'Your sibling takes your stuff, and the argument starts escalating.',
  },
  tr_gece_kalma: {
    ...(enEventTranslationsGenerated.tr_gece_kalma ?? {}),
    text: 'A friend invites you for your first sleepover away from home.',
  },
  tr_grup_dislanma: {
    ...(enEventTranslationsGenerated.tr_grup_dislanma ?? {}),
    text: 'A popular group will accept you only if you exclude another kid.',
  },
  tr_sosyal_medya_ilk: {
    ...(enEventTranslationsGenerated.tr_sosyal_medya_ilk ?? {}),
    text: 'Your friends ask why you are not on social media yet.',
  },
  tr_takim_kaptan: {
    ...(enEventTranslationsGenerated.tr_takim_kaptan ?? {}),
    text: 'In PE class, your name is suggested for team captain.',
  },
  tr_aile_tatili: {
    ...(enEventTranslationsGenerated.tr_aile_tatili ?? {}),
    text: 'Your family plans a vacation, but you will miss your friends.',
  },
  tr_biriktir_harca: {
    ...(enEventTranslationsGenerated.tr_biriktir_harca ?? {}),
    text: 'You can buy something now, or save longer for what you really want.',
  },
  tr_ortaokul_gecis: {
    ...(enEventTranslationsGenerated.tr_ortaokul_gecis ?? {}),
    text: 'You are moving up to middle school: new classes, new teachers, new pressure.',
  },
  tr_ogretmen_adaletsiz: {
    ...(enEventTranslationsGenerated.tr_ogretmen_adaletsiz ?? {}),
    text: 'A teacher scolds you unfairly in front of the class.',
  },
  tr_zorbalik_tanik: {
    ...(enEventTranslationsGenerated.tr_zorbalik_tanik ?? {}),
    text: 'You witness an older student bullying a younger one during recess.',
  },
  tr_hobi_secimi: {
    ...(enEventTranslationsGenerated.tr_hobi_secimi ?? {}),
    text: 'School club registrations open: music, art, sports, and coding.',
  },
  tr_telefon_isteme: {
    ...(enEventTranslationsGenerated.tr_telefon_isteme ?? {}),
    text: 'Most of your friends have phones now, but your family says it is too early.',
  },
  tr_ders_baskisi: {
    ...(enEventTranslationsGenerated.tr_ders_baskisi ?? {}),
    text: 'Exam week pressure builds at home and at school.',
  },
  tr_sir_saklama: {
    ...(enEventTranslationsGenerated.tr_sir_saklama ?? {}),
    text: 'Your best friend shares a secret, then someone else asks you for it.',
  },
  tr_okul_takim_secme: {
    ...(enEventTranslationsGenerated.tr_okul_takim_secme ?? {}),
    text: 'School team tryouts begin, and competition is tough.',
  },
  tr_mahalle_cesaret: {
    ...(enEventTranslationsGenerated.tr_mahalle_cesaret ?? {}),
    text: 'Neighborhood kids challenge you to a risky dare.',
  },
  tr_kardese_bakma: {
    ...(enEventTranslationsGenerated.tr_kardese_bakma ?? {}),
    text: 'Mom asks you to watch your younger sibling for an hour.',
  },
  tr_grup_projesi: {
    ...(enEventTranslationsGenerated.tr_grup_projesi ?? {}),
    text: 'In a group project, most of the work falls on you.',
  },
  tr_arkadas_kus: {
    ...(enEventTranslationsGenerated.tr_arkadas_kus ?? {}),
    text: 'You and your best friend have not spoken for days after a fight.',
  },
  tr_beden_degisim: {
    ...(enEventTranslationsGenerated.tr_beden_degisim ?? {}),
    text: 'Your body is changing, and adolescence starts to feel very real.',
  },
  tr_bilim_fuari: {
    ...(enEventTranslationsGenerated.tr_bilim_fuari ?? {}),
    text: 'The school science fair is coming, and you need a project idea.',
  },
  tr_konser_izin: {
    ...(enEventTranslationsGenerated.tr_konser_izin ?? {}),
    text: 'Your favorite singer has a weekday concert, and you need permission to go.',
  },
  tr_karne_pazarlik: {
    ...(enEventTranslationsGenerated.tr_karne_pazarlik ?? {}),
    text: 'Report card week is here, and your family tied rewards to your grades.',
  },
  econ_poor_scholarship_offer: {
    ...(enEventTranslationsGenerated.econ_poor_scholarship_offer ?? {}),
    text: 'A local education foundation opens scholarship applications for students with financial need.',
    choices: {
      ...(enEventTranslationsGenerated.econ_poor_scholarship_offer?.choices ?? {}),
      econ_scholarship_careful_apply: {
        ...(enEventTranslationsGenerated.econ_poor_scholarship_offer?.choices?.econ_scholarship_careful_apply ?? {}),
        text: 'Prepare a careful application',
        feedback: 'Your application is approved, and the scholarship eases your school expenses for a while.',
      },
      econ_scholarship_last_minute: {
        ...(enEventTranslationsGenerated.econ_poor_scholarship_offer?.choices?.econ_scholarship_last_minute ?? {}),
        text: 'Submit it at the last minute',
        feedback: 'Your file is incomplete, but you still receive limited support.',
      },
    },
  },
  econ_poor_mentor_support: {
    ...(enEventTranslationsGenerated.econ_poor_mentor_support ?? {}),
    text: 'An older student from your neighborhood invites you to a free mentoring program.',
    choices: {
      ...(enEventTranslationsGenerated.econ_poor_mentor_support?.choices ?? {}),
      econ_mentor_accept_plan: {
        ...(enEventTranslationsGenerated.econ_poor_mentor_support?.choices?.econ_mentor_accept_plan ?? {}),
        text: 'Join the program and study consistently',
        feedback: 'Your mentor helps you find resources and build a study plan. You feel less alone.',
      },
      econ_mentor_weekend_job: {
        ...(enEventTranslationsGenerated.econ_poor_mentor_support?.choices?.econ_mentor_weekend_job ?? {}),
        text: 'Try a weekend mini-job with mentor support',
        feedback: 'It is tiring, but you earn money and gain work experience.',
      },
    },
  },
  econ_poor_community_aid: {
    ...(enEventTranslationsGenerated.econ_poor_community_aid ?? {}),
    text: 'A local association announces a community support package for school and basic needs.',
    choices: {
      ...(enEventTranslationsGenerated.econ_poor_community_aid?.choices ?? {}),
      econ_community_accept_aid: {
        ...(enEventTranslationsGenerated.econ_poor_community_aid?.choices?.econ_community_accept_aid ?? {}),
        text: 'Accept support and focus on school',
        feedback: 'The support eases pressure at home and gives you room to study.',
      },
      econ_community_giveback: {
        ...(enEventTranslationsGenerated.econ_poor_community_aid?.choices?.econ_community_giveback ?? {}),
        text: 'Accept support and volunteer in return',
        feedback: 'You receive help while contributing back. People trust you more.',
      },
    },
  },
  goal_chain_stage1_discovery: {
    ...(enEventTranslationsGenerated.goal_chain_stage1_discovery ?? {}),
    text: 'A chance to pursue your long-term goal appears for the first time.',
    choices: {
      ...(enEventTranslationsGenerated.goal_chain_stage1_discovery?.choices ?? {}),
      goal_chain_s1_safe: {
        ...(enEventTranslationsGenerated.goal_chain_stage1_discovery?.choices?.goal_chain_s1_safe ?? {}),
        text: 'Move forward with a stable plan',
        feedback: 'A mentor notices your potential and opens a structured path for you.',
      },
      goal_chain_s1_risky: {
        ...(enEventTranslationsGenerated.goal_chain_stage1_discovery?.choices?.goal_chain_s1_risky ?? {}),
        text: 'Push hard for fast results',
        feedback: 'You gain momentum quickly, but the pressure and cost rise too.',
      },
    },
  },
  goal_chain_stage2_first_competition: {
    ...(enEventTranslationsGenerated.goal_chain_stage2_first_competition ?? {}),
    text: 'You enter your first serious competition on your goal path.',
    choices: {
      ...(enEventTranslationsGenerated.goal_chain_stage2_first_competition?.choices ?? {}),
      goal_chain_s2_safe: {
        ...(enEventTranslationsGenerated.goal_chain_stage2_first_competition?.choices?.goal_chain_s2_safe ?? {}),
        text: 'Follow your plan and pace yourself',
        feedback: 'Your preparation looks consistent, and your confidence grows steadily.',
      },
      goal_chain_s2_risky: {
        ...(enEventTranslationsGenerated.goal_chain_stage2_first_competition?.choices?.goal_chain_s2_risky ?? {}),
        text: 'Go all-in and force a breakthrough',
        feedback: 'You push hard and get quick gains, but your margin for error shrinks.',
      },
    },
  },
  goal_chain_stage3_grand_final: {
    ...(enEventTranslationsGenerated.goal_chain_stage3_grand_final ?? {}),
    text: 'You reach the grand final where all your preparation is tested.',
    choices: {
      ...(enEventTranslationsGenerated.goal_chain_stage3_grand_final?.choices ?? {}),
      goal_chain_s3_safe: {
        ...(enEventTranslationsGenerated.goal_chain_stage3_grand_final?.choices?.goal_chain_s3_safe ?? {}),
        text: 'Stick to your strategy under pressure',
        feedback: 'You keep composure in the final and deliver a reliable performance.',
      },
      goal_chain_s3_risky: {
        ...(enEventTranslationsGenerated.goal_chain_stage3_grand_final?.choices?.goal_chain_s3_risky ?? {}),
        text: 'Take a bold high-risk approach',
        feedback: 'Your aggressive play can create a huge payoff, but one mistake is costly.',
      },
    },
  },
  npc_new_classmate: {
    ...(enEventTranslationsGenerated.npc_new_classmate ?? {}),
    text: "A new classmate joins your class and sits nearby.",
  },
  npc_homework_together: {
    ...(enEventTranslationsGenerated.npc_homework_together ?? {}),
    text: "A friend asks you for help with homework after class.",
  },
  npc_friend_fight: {
    ...(enEventTranslationsGenerated.npc_friend_fight ?? {}),
    text: "A small argument with your friend turns into real tension.",
  },
  npc_secret_sharing: {
    ...(enEventTranslationsGenerated.npc_secret_sharing ?? {}),
    text: "A close friend shares a private secret with you.",
  },
  npc_secret_revealed: {
    ...(enEventTranslationsGenerated.npc_secret_revealed ?? {}),
    text: "A secret gets out, and your friend realizes trust was broken.",
  },
  npc_group_formation: {
    ...(enEventTranslationsGenerated.npc_group_formation ?? {}),
    text: "Friends suggest creating a tight social group at school.",
  },
  npc_first_crush: {
    ...(enEventTranslationsGenerated.npc_first_crush ?? {}),
    text: "You feel your first real crush and do not know how to act.",
  },
  npc_love_letter_decision: {
    ...(enEventTranslationsGenerated.npc_love_letter_decision ?? {}),
    text: "The letter you wrote is in your bag. Do you hand it over or tear it up?",
  },
  npc_confession: {
    ...(enEventTranslationsGenerated.npc_confession ?? {}),
    text: "Someone finally confesses their feelings to you face-to-face.",
  },
  npc_jealousy: {
    ...(enEventTranslationsGenerated.npc_jealousy ?? {}),
    text: "Jealousy enters the relationship and raises emotional tension.",
  },
  npc_breakup: {
    ...(enEventTranslationsGenerated.npc_breakup ?? {}),
    text: "Your relationship reaches a painful breaking point.",
  },
  npc_bully_encounter: {
    ...(enEventTranslationsGenerated.npc_bully_encounter ?? {}),
    text: "A group of bullies corners you at school and pressures you.",
  },
  npc_bully_return: {
    ...(enEventTranslationsGenerated.npc_bully_return ?? {}),
    text: "The same bullies come back, this time acting more aggressively.",
  },
  npc_rivalry_start: {
    ...(enEventTranslationsGenerated.npc_rivalry_start ?? {}),
    text: "A classmate challenges you, and a rivalry starts to form.",
  },
  npc_gossip_about_you: {
    ...(enEventTranslationsGenerated.npc_gossip_about_you ?? {}),
    text: "You hear that people are spreading rumors about you.",
  },
  npc_group_exclusion: {
    ...(enEventTranslationsGenerated.npc_group_exclusion ?? {}),
    text: "Your friend group leaves you out, and it stings.",
  },
  npc_group_leader_challenge: {
    ...(enEventTranslationsGenerated.npc_group_leader_challenge ?? {}),
    text: "The group leader is becoming controlling, and people look to you.",
  },
  npc_new_friend_opportunity: {
    ...(enEventTranslationsGenerated.npc_new_friend_opportunity ?? {}),
    text: "You notice a chance to meet someone new and potentially become friends.",
  },
  npc_friend_needs_help: {
    ...(enEventTranslationsGenerated.npc_friend_needs_help ?? {}),
    text: "A friend reaches out because they are going through a hard time.",
  },
  npc_checkin_friend_positive_01: {
    ...(enEventTranslationsGenerated.npc_checkin_friend_positive_01 ?? {}),
    text: "A friend sends a warm message and wants to hang out.",
  },
  npc_checkin_friend_study_02: {
    ...(enEventTranslationsGenerated.npc_checkin_friend_study_02 ?? {}),
    text: "A friend asks if you want to study together again.",
  },
  npc_checkin_friend_problem_03: {
    ...(enEventTranslationsGenerated.npc_checkin_friend_problem_03 ?? {}),
    text: "Your friend writes that they are dealing with a personal problem.",
  },
  npc_checkin_friend_game_04: {
    ...(enEventTranslationsGenerated.npc_checkin_friend_game_04 ?? {}),
    text: "A friend invites you to play games tonight.",
  },
  npc_checkin_friend_conflict_05: {
    ...(enEventTranslationsGenerated.npc_checkin_friend_conflict_05 ?? {}),
    text: "A friend says there is unresolved tension between you.",
  },
  npc_checkin_bestfriend_late_01: {
    ...(enEventTranslationsGenerated.npc_checkin_bestfriend_late_01 ?? {}),
    text: "Your best friend says you have been drifting apart lately.",
  },
  npc_checkin_bestfriend_crisis_02: {
    ...(enEventTranslationsGenerated.npc_checkin_bestfriend_crisis_02 ?? {}),
    text: "Your best friend says they are in crisis and need you now.",
  },
  npc_checkin_bestfriend_memory_03: {
    ...(enEventTranslationsGenerated.npc_checkin_bestfriend_memory_03 ?? {}),
    text: "Your best friend suggests recreating an old memory together.",
  },
  npc_checkin_crush_invite_01: {
    ...(enEventTranslationsGenerated.npc_checkin_crush_invite_01 ?? {}),
    text: "Your crush invites you to meet up.",
  },
  npc_checkin_crush_signal_02: {
    ...(enEventTranslationsGenerated.npc_checkin_crush_signal_02 ?? {}),
    text: "Your crush sends a message that feels like a signal.",
  },
  npc_checkin_crush_mixed_03: {
    ...(enEventTranslationsGenerated.npc_checkin_crush_mixed_03 ?? {}),
    text: "A misunderstanding creates mixed signals between you and your crush.",
  },
  npc_checkin_partner_support_01: {
    ...(enEventTranslationsGenerated.npc_checkin_partner_support_01 ?? {}),
    text: "Your partner asks for emotional support after a rough day.",
  },
  npc_checkin_partner_plan_02: {
    ...(enEventTranslationsGenerated.npc_checkin_partner_plan_02 ?? {}),
    text: "Your partner wants to make a concrete plan for the near future.",
  },
  npc_checkin_partner_argument_03: {
    ...(enEventTranslationsGenerated.npc_checkin_partner_argument_03 ?? {}),
    text: "An argument with your partner needs a careful response.",
  },
  npc_checkin_rival_challenge_01: {
    ...(enEventTranslationsGenerated.npc_checkin_rival_challenge_01 ?? {}),
    text: "Your rival throws down a fresh challenge.",
  },
  npc_checkin_rival_result_02: {
    ...(enEventTranslationsGenerated.npc_checkin_rival_result_02 ?? {}),
    text: "A new result in your rivalry sparks another comparison.",
  },
  npc_checkin_rival_teamup_03: {
    ...(enEventTranslationsGenerated.npc_checkin_rival_teamup_03 ?? {}),
    text: "Your rival unexpectedly suggests temporary cooperation.",
  },
  npc_checkin_enemy_taunt_01: {
    ...(enEventTranslationsGenerated.npc_checkin_enemy_taunt_01 ?? {}),
    text: "An enemy tries to provoke you publicly.",
  },
  npc_checkin_enemy_rumor_02: {
    ...(enEventTranslationsGenerated.npc_checkin_enemy_rumor_02 ?? {}),
    text: "A hostile rumor about you starts circulating again.",
  },
  npc_checkin_enemy_boundary_03: {
    ...(enEventTranslationsGenerated.npc_checkin_enemy_boundary_03 ?? {}),
    text: "An enemy tests your boundaries under the cover of \"peace\".",
  },
  npcq_friend_secret_share: {
    ...(enEventTranslationsGenerated.npcq_friend_secret_share ?? {}),
    text: "Your friend trusts you with a heavy personal secret.",
  },
  npcq_friend_family_visit: {
    ...(enEventTranslationsGenerated.npcq_friend_family_visit ?? {}),
    text: "You are invited to spend time with your friend and their family.",
  },
  npcq_friend_casual_hangout: {
    ...(enEventTranslationsGenerated.npcq_friend_casual_hangout ?? {}),
    text: "Your friend suggests an unplanned hangout.",
  },
  npcq_friend_shared_crisis: {
    ...(enEventTranslationsGenerated.npcq_friend_shared_crisis ?? {}),
    text: "A crisis puts your friendship under public pressure.",
  },
  npcq_friend_adventure: {
    ...(enEventTranslationsGenerated.npcq_friend_adventure ?? {}),
    text: "Your friend invites you into a small but risky adventure.",
  },
  npcq_friend_final_bond: {
    ...(enEventTranslationsGenerated.npcq_friend_final_bond ?? {}),
    text: "A defining moment tests whether this friendship is truly lifelong.",
  },
  npcq_friend_drift_apart: {
    ...(enEventTranslationsGenerated.npcq_friend_drift_apart ?? {}),
    text: "Silence grows between you, and the friendship starts fading.",
  },
  npcq_romance_confession: {
    ...(enEventTranslationsGenerated.npcq_romance_confession ?? {}),
    text: "You must decide whether to confess your feelings.",
  },
  npcq_romance_first_date: {
    ...(enEventTranslationsGenerated.npcq_romance_first_date ?? {}),
    text: "You plan your first date and set the tone of the relationship.",
  },
  npcq_romance_jealousy_jealous: {
    ...(enEventTranslationsGenerated.npcq_romance_jealousy_jealous ?? {}),
    text: "Jealousy rises and threatens emotional trust.",
  },
  npcq_romance_jealousy_loyal: {
    ...(enEventTranslationsGenerated.npcq_romance_jealousy_loyal ?? {}),
    text: "Your partner opens up about insecurity and asks for reassurance.",
  },
  npcq_romance_family_reaction: {
    ...(enEventTranslationsGenerated.npcq_romance_family_reaction ?? {}),
    text: "Your family reacts strongly to your relationship.",
  },
  npcq_romance_commitment: {
    ...(enEventTranslationsGenerated.npcq_romance_commitment ?? {}),
    text: "The relationship reaches a clear commitment milestone.",
  },
  npcq_romance_mature_breakup: {
    ...(enEventTranslationsGenerated.npcq_romance_mature_breakup ?? {}),
    text: "You face a mature but painful decision to separate.",
  },
  npcq_rival_first_challenge: {
    ...(enEventTranslationsGenerated.npcq_rival_first_challenge ?? {}),
    text: "Your rival opens a direct challenge in front of everyone.",
  },
  npcq_rival_group_sides: {
    ...(enEventTranslationsGenerated.npcq_rival_group_sides ?? {}),
    text: "Your rivalry starts dividing friend circles into sides.",
  },
  npcq_rival_showdown: {
    ...(enEventTranslationsGenerated.npcq_rival_showdown ?? {}),
    text: "The rivalry reaches a high-stakes public showdown.",
  },
  npcq_rival_aftermath: {
    ...(enEventTranslationsGenerated.npcq_rival_aftermath ?? {}),
    text: "After the showdown, you decide what kind of rival you will be.",
  },
  npcq_rival_peace_offer: {
    ...(enEventTranslationsGenerated.npcq_rival_peace_offer ?? {}),
    text: "A peace offer arrives from your rival.",
  },
  npcq_rival_escalation: {
    ...(enEventTranslationsGenerated.npcq_rival_escalation ?? {}),
    text: "A public clash escalates the rivalry into open hostility.",
  },
  npcq_rival_respect: {
    ...(enEventTranslationsGenerated.npcq_rival_respect ?? {}),
    text: "Unexpected respect appears between former rivals.",
  },
  npcq_betray_first_doubt: {
    ...(enEventTranslationsGenerated.npcq_betray_first_doubt ?? {}),
    text: "Small signs make you question someone you trust.",
  },
  npcq_betray_gossip_heard: {
    ...(enEventTranslationsGenerated.npcq_betray_gossip_heard ?? {}),
    text: "You hear that a trusted person has been talking behind your back.",
  },
  npcq_betray_investigation: {
    ...(enEventTranslationsGenerated.npcq_betray_investigation ?? {}),
    text: "You begin gathering facts before confronting the betrayal.",
  },
  npcq_betray_reaction_regret: {
    ...(enEventTranslationsGenerated.npcq_betray_reaction_regret ?? {}),
    text: "They show regret and ask for a chance to repair the damage.",
  },
  npcq_betray_forgive: {
    ...(enEventTranslationsGenerated.npcq_betray_forgive ?? {}),
    text: "You consider whether forgiveness is possible after betrayal.",
  },
  npcq_betray_distance: {
    ...(enEventTranslationsGenerated.npcq_betray_distance ?? {}),
    text: "You choose distance and a controlled, low-contact relationship.",
  },
  npcq_betray_cut_off: {
    ...(enEventTranslationsGenerated.npcq_betray_cut_off ?? {}),
    text: "You choose to cut ties and protect your boundaries completely.",
  },

  npcq_friend_loyalty_test: {
    ...(enEventTranslationsGenerated.npcq_friend_loyalty_test ?? {}),
    text: "You are forced to choose between your close friend and social status.",
    choices: {
      ...(enEventTranslationsGenerated.npcq_friend_loyalty_test?.choices ?? {}),
      choice_0: {
        ...(enEventTranslationsGenerated.npcq_friend_loyalty_test?.choices?.choice_0 ?? {}),
        text: '"They are my friend. No thanks."',
      },
    },
  },
  npcq_romance_first_spark: {
    ...(enEventTranslationsGenerated.npcq_romance_first_spark ?? {}),
    text: "A subtle moment reveals the first spark of romance.",
    choices: {
      ...(enEventTranslationsGenerated.npcq_romance_first_spark?.choices ?? {}),
      choice_0: {
        ...(enEventTranslationsGenerated.npcq_romance_first_spark?.choices?.choice_0 ?? {}),
        text: 'Smile and hold eye contact',
        feedback: 'You smile, and they smile back. The spark grows quietly.',
      },
      choice_1: {
        ...(enEventTranslationsGenerated.npcq_romance_first_spark?.choices?.choice_1 ?? {}),
        text: 'Look away and stay cautious',
        feedback: 'You avoid the moment, but the feeling does not disappear.',
      },
    },
  },
  npcq_rival_enemy: {
    ...(enEventTranslationsGenerated.npcq_rival_enemy ?? {}),
    text: "You decide whether this rivalry ends or hardens into enmity.",
    choices: {
      ...(enEventTranslationsGenerated.npcq_rival_enemy?.choices ?? {}),
      choice_0: {
        ...(enEventTranslationsGenerated.npcq_rival_enemy?.choices?.choice_0 ?? {}),
        text: 'Let it go and step back',
      },
    },
  },
  npcq_betray_confrontation: {
    ...(enEventTranslationsGenerated.npcq_betray_confrontation ?? {}),
    text: "You confront the person directly and demand the truth.",
    choices: {
      ...(enEventTranslationsGenerated.npcq_betray_confrontation?.choices ?? {}),
      choice_0: {
        ...(enEventTranslationsGenerated.npcq_betray_confrontation?.choices?.choice_0 ?? {}),
        feedback: 'Your voice shakes. They might be scared, they might be regretful, but the truth is now visible.',
      },
      choice_1: {
        ...(enEventTranslationsGenerated.npcq_betray_confrontation?.choices?.choice_1 ?? {}),
        feedback: 'The words hit harder than shouting. Your eyes fill with tears.',
      },
    },
  },
  npcq_betray_reaction_manipulative: {
    ...(enEventTranslationsGenerated.npcq_betray_reaction_manipulative ?? {}),
    text: "They respond with manipulation and denial.",
    choices: {
      ...(enEventTranslationsGenerated.npcq_betray_reaction_manipulative?.choices ?? {}),
      choice_0: {
        ...(enEventTranslationsGenerated.npcq_betray_reaction_manipulative?.choices?.choice_0 ?? {}),
        feedback: 'Their mask slips. You finally see the pattern clearly.',
      },
      choice_1: {
        ...(enEventTranslationsGenerated.npcq_betray_reaction_manipulative?.choices?.choice_1 ?? {}),
        feedback: 'The manipulation works for a moment, and you start doubting your own reality.',
      },
    },
  },

  pers_sosyal_davet: {
    ...(enEventTranslationsGenerated.pers_sosyal_davet ?? {}),
    text: "You are invited to a social gathering, but your comfort zone pulls you the other way.",
  },
  pers_sinif_sunumu: {
    ...(enEventTranslationsGenerated.pers_sinif_sunumu ?? {}),
    text: "You need to present in class, and all eyes will be on you.",
  },
  pers_tehlikeli_teklif: {
    ...(enEventTranslationsGenerated.pers_tehlikeli_teklif ?? {}),
    text: "Friends offer a risky plan that feels exciting and dangerous at once.",
  },
  pers_risk_consequence: {
    ...(enEventTranslationsGenerated.pers_risk_consequence ?? {}),
    text: "The risky choice from before now has real consequences.",
  },
  pers_dilenci_cocuk: {
    ...(enEventTranslationsGenerated.pers_dilenci_cocuk ?? {}),
    text: "On the street, a child asks for help and you hesitate.",
  },
  pers_kopya_verme: {
    ...(enEventTranslationsGenerated.pers_kopya_verme ?? {}),
    text: "During an exam, someone asks to copy from your paper.",
  },
  pers_uzun_kuyruk: {
    ...(enEventTranslationsGenerated.pers_uzun_kuyruk ?? {}),
    text: "A long line tests your patience and impulse control.",
  },
  pers_ani_firsat: {
    ...(enEventTranslationsGenerated.pers_ani_firsat ?? {}),
    text: "A sudden opportunity clashes with your responsibilities.",
  },
  pers_kural_ihlali: {
    ...(enEventTranslationsGenerated.pers_kural_ihlali ?? {}),
    text: "People around you are breaking rules, and you must decide your stance.",
  },
  pers_breakdown_warning: {
    ...(enEventTranslationsGenerated.pers_breakdown_warning ?? {}),
    text: "You feel stress signals building before a possible emotional crash.",
  },
  pers_breakdown_crisis: {
    ...(enEventTranslationsGenerated.pers_breakdown_crisis ?? {}),
    text: "The pressure peaks and you hit a full emotional breakdown.",
  },
  pers_hospital_stress: {
    ...(enEventTranslationsGenerated.pers_hospital_stress ?? {}),
    text: "Your body forces a stop, and you are taken to the hospital for stress burnout.",
  },
  pers_personality_reflection: {
    ...(enEventTranslationsGenerated.pers_personality_reflection ?? {}),
    text: "You pause and reflect on who you are becoming.",
  },
  pers_yeni_sinif: {
    ...(enEventTranslationsGenerated.pers_yeni_sinif ?? {}),
    text: "You enter a new class environment where no one knows you yet.",
  },
  pers_oyun_kaybetme: {
    ...(enEventTranslationsGenerated.pers_oyun_kaybetme ?? {}),
    text: "You lose a competitive game and need to manage the reaction.",
  },
  pers_kardesle_paylasim: {
    ...(enEventTranslationsGenerated.pers_kardesle_paylasim ?? {}),
    text: "A small conflict with your sibling becomes a test of generosity.",
  },
  pers_korkunc_film: {
    ...(enEventTranslationsGenerated.pers_korkunc_film ?? {}),
    text: "Friends want to watch a horror movie, and your fear threshold is tested.",
  },
  pers_sira_beklemek: {
    ...(enEventTranslationsGenerated.pers_sira_beklemek ?? {}),
    text: "Someone cuts the line and you decide whether to speak up.",
  },
  pers_yaratici_proje: {
    ...(enEventTranslationsGenerated.pers_yaratici_proje ?? {}),
    text: "A school project gives you a choice between safe execution and bold creativity.",
  },
  pers_yalanla_kurtulma: {
    ...(enEventTranslationsGenerated.pers_yalanla_kurtulma ?? {}),
    text: "You can avoid trouble with a lie, or accept the cost of honesty.",
    choices: {
      ...(enEventTranslationsGenerated.pers_yalanla_kurtulma?.choices ?? {}),
      yalan_do_ru: {
        ...(enEventTranslationsGenerated.pers_yalanla_kurtulma?.choices?.yalan_do_ru ?? {}),
        text: "Tell the truth",
      },
    },
  },
  pers_uyku_saati: {
    ...(enEventTranslationsGenerated.pers_uyku_saati ?? {}),
    text: "At bedtime, discipline and short-term temptation collide.",
    choices: {
      ...(enEventTranslationsGenerated.pers_uyku_saati?.choices ?? {}),
      uyku_pazarlik: {
        ...(enEventTranslationsGenerated.pers_uyku_saati?.choices?.uyku_pazarlik ?? {}),
        feedback: "Your mom agrees to a short extension. You still keep most of your routine.",
      },
    },
  },
  pers_grup_zorbaligi: {
    ...(enEventTranslationsGenerated.pers_grup_zorbaligi ?? {}),
    text: "You witness group bullying and must choose your response.",
  },
  pers_bir_gun_yalniz: {
    ...(enEventTranslationsGenerated.pers_bir_gun_yalniz ?? {}),
    text: "You spend a full day mostly alone with your own thoughts.",
  },
  pers_balanced_mediator: {
    ...(enEventTranslationsGenerated.pers_balanced_mediator ?? {}),
    text: "Two friends are in conflict, and you can see both sides clearly.",
  },
  pers_balanced_allrounder: {
    ...(enEventTranslationsGenerated.pers_balanced_allrounder ?? {}),
    text: "Your versatility helps in many areas, but choosing a direction is hard.",
  },
  pers_balanced_leadership: {
    ...(enEventTranslationsGenerated.pers_balanced_leadership ?? {}),
    text: "A group needs leadership, but no one wants to step up publicly.",
  },
  pers_balanced_moral_gray: {
    ...(enEventTranslationsGenerated.pers_balanced_moral_gray ?? {}),
    text: "A morally gray exam moment challenges your principles.",
  },
  pers_balanced_hobby_dilemma: {
    ...(enEventTranslationsGenerated.pers_balanced_hobby_dilemma ?? {}),
    text: "You enjoy multiple hobbies but do not have time for all of them.",
  },
  pers_balanced_family_talk: {
    ...(enEventTranslationsGenerated.pers_balanced_family_talk ?? {}),
    text: "Your family asks your opinion, and you decide how directly to speak.",
  },
  pers_balanced_new_student: {
    ...(enEventTranslationsGenerated.pers_balanced_new_student ?? {}),
    text: "A new student arrives, and your first move sets the tone.",
  },
  pers_balanced_competition: {
    ...(enEventTranslationsGenerated.pers_balanced_competition ?? {}),
    text: "You place second in a competition and process the result.",
  },
  pers_balanced_career_talk: {
    ...(enEventTranslationsGenerated.pers_balanced_career_talk ?? {}),
    text: "Career talk intensifies while your interests remain broad.",
  },
  pers_balanced_conflict_resolve: {
    ...(enEventTranslationsGenerated.pers_balanced_conflict_resolve ?? {}),
    text: "In a conflict, you can understand both sides and choose your approach.",
  },
  mem_guilt_apology: {
    ...(enEventTranslationsGenerated.mem_guilt_apology ?? {}),
    text: "A memory of guilt returns and asks whether you will apologize.",
    choices: {
      ...(enEventTranslationsGenerated.mem_guilt_apology?.choices ?? {}),
      guilt_apologize: {
        ...(enEventTranslationsGenerated.mem_guilt_apology?.choices?.guilt_apologize ?? {}),
        feedback: "You apologize. The other person softens, and the weight on your chest gets lighter.",
      },
    },
  },
  mem_pride_confidence: {
    ...(enEventTranslationsGenerated.mem_pride_confidence ?? {}),
    text: "A proud memory boosts your confidence for a new step.",
  },
  mem_regret_second_chance: {
    ...(enEventTranslationsGenerated.mem_regret_second_chance ?? {}),
    text: "A regretful moment returns as a second-chance decision.",
  },
  mem_satisfaction_sharing: {
    ...(enEventTranslationsGenerated.mem_satisfaction_sharing ?? {}),
    text: "A warm memory of sharing tests whether you repeat that generosity.",
  },
  mem_fear_overcome: {
    ...(enEventTranslationsGenerated.mem_fear_overcome ?? {}),
    text: "A fear memory returns and challenges your courage again.",
  },
  mem_school_pride_challenge: {
    ...(enEventTranslationsGenerated.mem_school_pride_challenge ?? {}),
    text: "A school success memory asks if you will step forward once more.",
  },
  mem_friendship_guilt_repair: {
    ...(enEventTranslationsGenerated.mem_friendship_guilt_repair ?? {}),
    text: "A friendship memory tied to guilt asks for repair.",
  },
  mem_exam_regret_study: {
    ...(enEventTranslationsGenerated.mem_exam_regret_study ?? {}),
    text: "A regretful exam memory pushes you toward better preparation.",
  },
  mem_bully_pride_stand: {
    ...(enEventTranslationsGenerated.mem_bully_pride_stand ?? {}),
    text: "A memory of standing up to bullying challenges your current values.",
  },
  mem_talent_show_fear: {
    ...(enEventTranslationsGenerated.mem_talent_show_fear ?? {}),
    text: "A stage-fright memory returns before another performance chance.",
  },
  mem_honesty_reward: {
    ...(enEventTranslationsGenerated.mem_honesty_reward ?? {}),
    text: "A memory of honesty reminds you that truth can pay off.",
  },
  mem_group_project_guilt: {
    ...(enEventTranslationsGenerated.mem_group_project_guilt ?? {}),
    text: "A group project memory stirs guilt about fairness and effort.",
  },
  mem_teacher_conflict_regret: {
    ...(enEventTranslationsGenerated.mem_teacher_conflict_regret ?? {}),
    text: "A conflict memory with a teacher resurfaces for reflection.",
  },
  mem_identity_pride_path: {
    ...(enEventTranslationsGenerated.mem_identity_pride_path ?? {}),
    text: "A core identity memory asks whether you stay true to your path.",
  },
  mem_regret_chain_moral: {
    ...(enEventTranslationsGenerated.mem_regret_chain_moral ?? {}),
    text: "A chain of regrets creates a moral crossroads.",
  },
  mem_betrayal_trust: {
    ...(enEventTranslationsGenerated.mem_betrayal_trust ?? {}),
    text: "A betrayal memory makes trust feel risky again.",
  },
  mem_leadership_echo: {
    ...(enEventTranslationsGenerated.mem_leadership_echo ?? {}),
    text: "An old leadership moment echoes into your current decision.",
  },
  mem_creative_expression: {
    ...(enEventTranslationsGenerated.mem_creative_expression ?? {}),
    text: "A creative memory calls you back to authentic self-expression.",
  },
  mem_peer_pressure_guilt: {
    ...(enEventTranslationsGenerated.mem_peer_pressure_guilt ?? {}),
    text: "Peer-pressure memories trigger guilt and a need for boundaries.",
  },
  mem_family_conflict_growth: {
    ...(enEventTranslationsGenerated.mem_family_conflict_growth ?? {}),
    text: "A family conflict memory offers a chance for maturity.",
  },
  mem_career_pride_vision: {
    ...(enEventTranslationsGenerated.mem_career_pride_vision ?? {}),
    text: "A career-pride memory sharpens your long-term vision.",
  },
  mem_regret_last_chance: {
    ...(enEventTranslationsGenerated.mem_regret_last_chance ?? {}),
    text: "A final-chance memory asks whether you repeat or rewrite the pattern.",
  },
  mem_friendship_satisfaction_deep: {
    ...(enEventTranslationsGenerated.mem_friendship_satisfaction_deep ?? {}),
    text: "A deep friendship memory reminds you what true connection feels like.",
  },
  mem_guilt_confession: {
    ...(enEventTranslationsGenerated.mem_guilt_confession ?? {}),
    text: "A confession memory returns and asks for courage.",
  },
  mem_exam_stress_pride: {
    ...(enEventTranslationsGenerated.mem_exam_stress_pride ?? {}),
    text: "A high-stress exam memory intersects with your sense of pride.",
  },

};
