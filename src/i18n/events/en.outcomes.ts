// Hand-written EN for chance-based outcome feedback (conditionalOutcomes).
// Shape: eventId -> choiceId -> outcomeId -> feedback. Merged into the EN
// catalog by en.ts without overwriting the event's existing translations.
export const enOutcomeFeedbackTranslations: Record<string, Record<string, Record<string, string>>> = {
  tr_kopek_korkusu: {
    kopek_cesur: {
      kopek_cesur_success: 'Trembling, you took one more step. The dog nuzzled your palm and wagged its tail, and your fear melted into giggles!',
      kopek_cesur_fail: 'Just as you reached out, the dog barked loudly. You stumbled back, scraped your knee and cried in your dad\'s arms for a long time.',
      kopek_cesur_fail_hard: 'The moment the dog saw you, you screamed and clung to your dad\'s legs. From then on you crossed the street whenever you saw a dog.',
    },
  },
  tr_kaybolma_panik: {
    kaybol_ara: {
      kaybol_ara_success: 'You took a deep breath and thought about where you last were. You remembered the red sign and walked toward it; your mom was right there looking for you!',
      kaybol_ara_fail: 'You tried to stay calm, but every shop looked the same. The more you hurried, the more lost you got; you waited in tears until a staff member found you.',
      kaybol_ara_fail_hard: 'You panicked and started running within the first minute. Lost in the crowd, you sat down and sobbed; when your mom found you, you were both shaking.',
    },
  },
  tr_yks_stresi: {
    yks_grind: {
      yks_grind_success: 'You stayed at your desk all night and every topic clicked into place. By dawn your eyes burned, but your head had never been this clear.',
      yks_grind_fail: 'From lack of sleep the lines started dancing before your eyes. You read the same page three times until morning and nothing stuck; you only wore yourself out.',
      yks_grind_fail_hard: 'Around midnight your head started spinning and you fell asleep at the desk. You woke up with a headache and had to spend most of the day in bed.',
    },
  },
  tr_evlilik_baskisi: {
    evlilik_boundary: {
      evlilik_boundary_success: 'You took a deep breath and said, "It\'s my life, and I\'ll make the decision." There was a moment of silence; then your aunt raised her eyebrows and changed the subject. They take you seriously now.',
      evlilik_boundary_fail: 'The moment you said "It\'s my life!" the whole table went quiet. Your voice rose and you were scolded for talking back to your elders; the mood stayed cold for the rest of the holiday.',
      evlilik_boundary_fail_hard: 'Your voice cracked before you could finish and your eyes filled with tears. The relatives whispered that you were still too young; you left the table and shut yourself in your room.',
    },
  },
  tr_internet_kafe: {
    kafe_go_rebel: {
      kafe_go_rebel_success: 'You played until morning, then tiptoed home with your shoes in your hand. Nobody woke up; at breakfast you could barely hide your grin.',
      kafe_go_rebel_fail: 'As you opened the door, the hallway light came on. Your mom was waiting at the threshold at dawn; for a week you couldn\'t go out or touch the computer.',
    },
  },
  tr_okul_ilk_gun: {
    okul_brave: {
      okul_brave_success: 'You let go of your mom\'s hand and walked into class with your head held high. The teacher sat you in the front row, and the kid next to you asked your name right away.',
      okul_brave_fail: 'You marched bravely to the door, but at the last second your legs froze. You stood there teary-eyed, and everyone stared until the teacher took your hand and led you in.',
      okul_brave_fail_hard: 'You couldn\'t let go of your mom\'s hand and clung to her, crying at the door. The whole class watched until the teacher calmed you down.',
    },
  },
  tr_sinif_gorev: {
    gorev_aday: {
      gorev_aday_success: 'You stood up in front of the class and explained your plan. Your voice shook at first, then you noticed everyone smiling at you; when the votes were counted, you were class rep!',
      gorev_aday_fail: 'When your turn came, everything you meant to say flew out of your head. The class started whispering and you sat down, red-faced; you got very few votes.',
      gorev_aday_fail_hard: 'You stood up but couldn\'t say a single word. Amid the giggles you sat back down, bright red, and couldn\'t look anyone in the eye for a while.',
    },
  },
  pers_yeni_sinif: {
    sinif_cesur: {
      sinif_cesur_success: 'Heart pounding, you said, "Hi, I\'m the new student." A few kids came over right away, and you sat together at lunch.',
      sinif_cesur_fail: 'You said "Hi," but it came out so quietly that nobody heard. The groups went back to their chats, and you spent lunch alone again.',
      sinif_cesur_fail_hard: 'You opened your mouth, but a lump rose in your throat. A few kids gave you odd looks, and walking into class the next day felt like a mountain to climb.',
    },
  },
  pers_korkunc_film: {
    film_izle: {
      film_izle_success: 'When the monster appeared, you squinted but watched to the very end. When the lights came on, your friends slapped your back: "You\'re brave!"',
      film_izle_fail: 'In one scene you jumped and screamed, sending popcorn everywhere. Your friends laughed, and all night you flinched at every shadow and couldn\'t sleep.',
      film_izle_fail_hard: 'Ten minutes in, you couldn\'t look away from the screen and your hands went ice cold. Halfway through you had to leave and wait in the hallway; you slept with the light on.',
    },
  },
  fam_strict_university_choice: {
    strict_rebel_career: {
      strict_rebel_career_success: 'You explained your reasons firmly and calmly. Your father was silent at first, then said, "All right, we\'ll see." For the first time you stood up to him and chose your own path.',
      strict_rebel_career_fail: 'The more you talked, the louder you got, and your father shouted right back. The argument ended with a slammed door; the decision was yours, but the chill at home lasted for weeks.',
      strict_rebel_career_fail_hard: 'Your father cut you off at your first sentence: "This subject is closed." You left the table without finding your voice; you couldn\'t say what you meant, and the gap between you grew wider.',
    },
  },
  tr_doktor_asi: {
    asi_cesur: {
      asi_cesur_success: 'The needle went in; you clenched your teeth and squeezed your eyes shut. You didn\'t cry! The doctor smiled and handed you a sticker.',
      asi_cesur_fail: 'The moment you saw the needle, you yanked your arm away and screamed at the top of your lungs. Your mom held you while they gave the shot; you were still sobbing on the way out.',
      asi_cesur_fail_hard: 'You planted yourself at the exam room door and nobody could talk you in. In the end two people had to hold you for the shot; you fell asleep from exhaustion on the way home.',
    },
  },
  tr_teneffus_yalniz: {
    teneffus_katil: {
      teneffus_katil_success: '"Can I play too?" you asked. There was a moment of silence, then they called out, "Sure, come on!" You walked back into class laughing when recess ended.',
      teneffus_katil_fail: '"Can I play too?" you asked, but your voice didn\'t reach anyone. Everyone kept playing; you went back to the wall and waited alone until recess was over.',
    },
  },
  tr_kopya_iste: {
    kopya_reddet: {
      kopya_reddet_success: '"No, I studied for this myself," you said. Your friend pouted at first, then shrugged and went back to their own paper; after class they came over to you as usual.',
      kopya_reddet_fail: 'You said no, but your friend didn\'t take it well. "You\'re so selfish!" they whispered, and played with other kids at recess.',
    },
  },
  tr_gece_kalma: {
    gece_git: {
      gece_git_success: 'It felt strange at first, but once the movie started you forgot all about it. You had a pillow fight and whispered and talked until midnight!',
      gece_git_fail: 'When the lights went out, you missed home terribly. You tried to hide your tears, but you didn\'t sleep a wink and waited for your mom to pick you up early.',
      gece_git_fail_hard: 'At midnight you couldn\'t hold it in and started crying, and your friend\'s mom called your house. On the way home you felt embarrassed and relieved at the same time.',
    },
  },
  tr_okul_takim_secme: {
    secme_dene: {
      secme_dene_success: 'You ran yourself breathless, caught every pass and put the ball in the net! The coach scribbled something in his notebook and gave you a thumbs-up.',
      secme_dene_fail: 'You ran out of breath during the warm-up, then missed two passes in a row. The coach said nothing, but you felt the stares of the kids waiting on the sideline.',
      secme_dene_fail_hard: 'On the very first sprint a side stitch dropped you to the ground. You left the tryout halfway and sat on the sidelines, watching the others with teary eyes.',
    },
  },
  tr_mahalle_cesaret: {
    cesaret_gir: {
      cesaret_gir_success: 'You stood perfectly still in the dark basement for thirty seconds. When you came out everyone cheered; your heart was in your throat, but you were smiling.',
      cesaret_gir_fail: 'Two steps down the stairs a board creaked and you bolted back up. You tripped on the way out, and the kids burst out laughing: "Scaredy-cat!"',
      cesaret_gir_fail_hard: 'You froze at the doorway and couldn\'t take a single step. The kids teased you for a while, and your face was bright red all the way home.',
    },
  },
  goal_academic_olympiad_selection: {
    goal_academic_olympiad_bold: {
      goal_academic_olympiad_bold_success: 'You got stuck on the first hard problem but tried a different approach instead of giving up. Once it clicked, the rest flowed; you passed the qualifier with a strong score.',
      goal_academic_olympiad_bold_fail: 'Without a plan, you dove into the hardest problems and burned out in the first hour. As time ran out you stared at half-finished solutions; your score wasn\'t enough to qualify.',
      goal_academic_olympiad_bold_fail_hard: 'After the first problem your morale sank and you left three questions blank in a row. You walked out with a headache and couldn\'t shake the result for a while.',
    },
  },
  goal_creative_public_release: {
    goal_creative_release_bold: {
      goal_creative_release_bold_success: 'The day you shared your work publicly, the reposts started pouring in. Most comments were praise, and a few people even wrote asking to buy it.',
      goal_creative_release_bold_fail: 'The first comments on release day were harsh, and the thread blew up fast. For a while you couldn\'t bring yourself to look at your work, but the criticism stuck with you.',
      goal_creative_release_bold_fail_hard: 'A few people reshared your post just to mock it. For a while you wanted to close your account and retreat into your own corner.',
    },
  },
  goal_wealth_investor_round: {
    goal_wealth_investor_bold: {
      goal_wealth_investor_bold_success: 'Your numbers were sharp and the investors found the high valuation reasonable. You won the negotiation and walked away with more backing than you expected.',
      goal_wealth_investor_bold_fail: 'When the investors questioned the valuation, it turned out your numbers didn\'t add up. The meeting ended early, and the money you spent preparing went to waste.',
      goal_wealth_investor_bold_fail_hard: 'Within the first few questions you realized your math was wrong, and you left the meeting empty-handed. Telling your family about it was hard.',
    },
  },
  item_unlock_guitar_jam_session: {
    guitar_open_mic: {
      guitar_open_mic_success: 'Your fingers trembled a little on the first chord, but then the song just flowed. When you finished, the after-school crowd applauded.',
      guitar_open_mic_fail: 'On stage your hands got sweaty and you hit a wrong chord. You stopped halfway and stepped down; the crowd\'s silence rang in your ears.',
      guitar_open_mic_fail_hard: 'The moment you picked up the guitar, you forgot the whole song. After freezing for a few seconds, you quietly stepped down and put the guitar back in its case.',
    },
  },
};
