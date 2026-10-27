
// Hand-written EN for events that had no English at all (the generated catalog
// and the overrides never covered them, so English mode showed Turkish).
// Same shape as the main catalog: eventId -> text / choices -> choiceId -> text + feedback.
// en.ts merges this on top of generated + overrides WITHOUT replacing any string that
// already has English, so it only ever fills holes. __tests__/i18n/enEventCoverage.test.ts
// keeps the gap count at zero.
//
// Notes for editing:
// - The player is gender-neutral: say "you", never "he"/"she" for the player.
// - Turkish-only terms follow en.overrides.ts: bayram -> "holiday", mahalle -> "neighborhood",
//   karne -> "report card", LGS/YKS stay as they are.
// - Choice ids are the sanitized key tokens (see keyUtils.sanitizeKeySegment); events whose
//   choices have no id use choice_<index>.
export const enEventGapTranslations: Record<string, {
  text: string;
  choices: Record<string, { text: string; feedback: string }>;
}> = {
  // --- Childhood basics (ids that the generated catalog stored under mangled keys) ---
  tr_kres_ilk_gun: {
    text: 'First day of nursery school. Mom is about to leave. New faces, strange sounds...',
    choices: {
      kres_agla: {
        text: 'Cry and cling to Mom',
        feedback: "You cry for a bit, but the teacher calms you down. You'll settle in over time.",
      },
      kres_oyun: {
        text: 'Run to the toys',
        feedback: 'The toys steal your attention. You barely notice Mom leaving.',
      },
    },
  },
  tr_harclik: {
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
  dilemma_vazo_gercek: {
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

  // --- Money and class: the "poor family" arc ---
  econ_poor_breakthrough_moment: {
    text: 'You got the highest grade in your class. Your teacher called you aside and said, "If you ever want my support, I am always here."',
    choices: {
      econ_breakthrough_accept_mentor: {
        text: "Accept your teacher's offer",
        feedback: 'You felt something change that day. Maybe you started to believe in your own future.',
      },
      econ_breakthrough_share_family: {
        text: 'Run home and tell your mom or dad',
        feedback: "You will never forget the look on your mom's face. You cried together.",
      },
    },
  },
  econ_poor_first_own_money: {
    text: 'For the first time you bought something with money you earned yourself. It was small, but it was entirely yours.',
    choices: {
      econ_first_money_keep: {
        text: 'Buy something small for yourself',
        feedback: 'Growing up with little made this moment even more precious. You could feel a quiet flutter inside.',
      },
      econ_first_money_family: {
        text: 'Give the money to the family budget',
        feedback: 'That day you felt like you had truly grown up. The responsibility settled on your shoulders, but it did not feel heavy.',
      },
    },
  },
  econ_poor_prove_them_wrong: {
    text: 'A relative said, "Nothing much ever comes out of your neighborhood." Something tightened inside you.',
    choices: {
      econ_prove_silent_work: {
        text: 'Say nothing and decide to work harder',
        feedback: 'Those words became fuel. Not to prove a point, only to be able to stand on your own two feet.',
      },
      econ_prove_speak_up: {
        text: 'Look them in the eye and say, "You will see."',
        feedback: 'Your voice trembled for a moment, but it did not break. From that day on you knew your own courage in a new way.',
      },
    },
  },

  // --- Long-term goal events (safe / bold) ---
  goal_academic_research_deadline: {
    text: 'Your mentor gave you a deadline for a research file. You need to pin down your plan.',
    choices: {
      goal_academic_research_safe: {
        text: 'Set up a planned work schedule',
        feedback: 'You moved ahead on a schedule and your foundation got stronger.',
      },
      goal_academic_research_bold: {
        text: 'Take on a hard experiment in a short time',
        feedback: 'You worked at a high pace. You sped up, but you got tired.',
      },
    },
  },
  goal_academic_science_fair_stage: {
    text: 'Project selection for the school science fair has begun. You will stand in front of the jury.',
    choices: {
      goal_academic_fair_safe: {
        text: 'Present a basic but safe project',
        feedback: 'You gave a clean presentation and gained confidence.',
      },
      goal_academic_fair_bold: {
        text: 'Go in with a risky prototype',
        feedback: 'Your prototype turned heads, but the pressure went up.',
      },
    },
  },
  goal_academic_olympiad_selection: {
    text: 'Academic olympiad qualifiers are open. The final-round questions are far beyond a normal exam.',
    choices: {
      goal_academic_olympiad_safe: {
        text: 'Prepare step by step for the qualifying problem set',
        feedback: 'You kept your pace and cut down on mistakes.',
      },
      goal_academic_olympiad_bold: {
        text: 'Dive straight into the hard problems',
        feedback: 'You made a hard push: big progress, but heavy fatigue.',
      },
    },
  },
  goal_athletic_camp_invite: {
    text: 'You have been invited to a regional training camp. The program will seriously test your conditioning.',
    choices: {
      goal_athletic_camp_safe: {
        text: 'Follow a planned training load',
        feedback: 'You built up strength at a steady pace.',
      },
      goal_athletic_camp_bold: {
        text: 'Push your limits with extra sets',
        feedback: 'Your capacity grew, but fatigue piled up.',
      },
    },
  },
  goal_athletic_tournament_bracket: {
    text: 'The tournament bracket is out. You will face a favorite in the quarterfinal.',
    choices: {
      goal_athletic_bracket_safe: {
        text: 'Prepare tactics for your opponent',
        feedback: 'You played a smart match and read your opponent well.',
      },
      goal_athletic_bracket_bold: {
        text: 'Pile on the pressure with a high tempo',
        feedback: 'You took the game with tempo, but you pushed your body hard.',
      },
    },
  },
  goal_athletic_captain_vote: {
    text: 'The team captain vote is coming up. Leadership takes communication as much as performance.',
    choices: {
      goal_athletic_captain_safe: {
        text: 'Emphasize stability within the team',
        feedback: "You moved closer to leadership by earning the team's trust.",
      },
      goal_athletic_captain_bold: {
        text: 'Make an aggressive leadership play',
        feedback: 'Your visibility went up, and you took on the pressure too.',
      },
    },
  },
  goal_creative_exhibition_call: {
    text: 'The local exhibition committee has opened a portfolio call. You need to pick your work and tell your story.',
    choices: {
      goal_creative_exhibition_safe: {
        text: 'Prepare a safe but consistent series',
        feedback: 'Consistency made your show stronger.',
      },
      goal_creative_exhibition_bold: {
        text: 'Stand out with an experimental series',
        feedback: 'You found an eye-catching voice, and the risk grew too.',
      },
    },
  },
  goal_creative_collective_show: {
    text: 'You will present a live performance and design showcase at a collective event.',
    choices: {
      goal_creative_collective_safe: {
        text: 'Rehearse in sync with the group',
        feedback: 'Being in sync on stage gave you confidence.',
      },
      goal_creative_collective_bold: {
        text: 'Try a bold solo performance',
        feedback: "Your performance stuck in people's minds, and the pressure rose too.",
      },
    },
  },
  goal_creative_public_release: {
    text: 'You have a chance to publish your portfolio on an open platform. The feedback may be harsh.',
    choices: {
      goal_creative_release_safe: {
        text: 'Do a pilot release for a limited audience',
        feedback: 'You improved your work with controlled feedback.',
      },
      goal_creative_release_bold: {
        text: 'Release at full scale and make some noise',
        feedback: 'You made a big impact, but the pace was very high.',
      },
    },
  },
  goal_wealth_market_simulation: {
    text: 'A local entrepreneurship club is running a market simulation. Choosing the right product will decide your earnings.',
    choices: {
      goal_wealth_market_safe: {
        text: 'Start with a low-risk product',
        feedback: 'The profit margin is low, but the result was steady.',
      },
      goal_wealth_market_bold: {
        text: 'Enter a high-margin niche product',
        feedback: 'The risky move paid off, with some ups and downs along the way.',
      },
    },
  },
  goal_wealth_pitch_day: {
    text: 'Mini business plan pitch day has arrived. The quality of your presentation will be the key to making connections.',
    choices: {
      goal_wealth_pitch_safe: {
        text: 'Pitch around cost and discipline',
        feedback: 'You came across as reliable and gathered support.',
      },
      goal_wealth_pitch_bold: {
        text: 'Come out with a promise of aggressive growth',
        feedback: 'You got attention, and you raised expectations too.',
      },
    },
  },
  goal_wealth_investor_round: {
    text: 'A one-on-one meeting with a small group of investors has come up. Your numbers need to be clear.',
    choices: {
      goal_wealth_investor_safe: {
        text: 'Present a step-by-step growth model',
        feedback: 'With a reliable model, you found long-term backing.',
      },
      goal_wealth_investor_bold: {
        text: 'Negotiate with a high-multiple plan',
        feedback: 'You caught the chance of a big win, and the risk grew too.',
      },
    },
  },
  goal_social_council_election: {
    text: 'The student council election is getting close. You need to explain your platform to people.',
    choices: {
      goal_social_election_safe: {
        text: 'Talk about shared benefits',
        feedback: 'Your balanced message built trust.',
      },
      goal_social_election_bold: {
        text: 'Run on high-impact promises',
        feedback: 'Your visibility rose, but expectations started to weigh on you.',
      },
    },
  },
  goal_social_volunteer_coordination: {
    text: 'You have been asked to coordinate a team for the neighborhood volunteer day. Resources are limited.',
    choices: {
      goal_social_volunteer_safe: {
        text: 'Make a small but sustainable plan',
        feedback: 'Your team finished the job without falling apart.',
      },
      goal_social_volunteer_bold: {
        text: 'Go big with a large team and a large goal',
        feedback: 'Your reach expanded, and the organizing load grew.',
      },
    },
  },
  goal_social_mentorship_network: {
    text: 'You have been offered a lead role in a peer mentoring network. Consistency and empathy will be critical.',
    choices: {
      goal_social_mentor_safe: {
        text: 'Build a gradual mentoring model',
        feedback: 'You made a lasting impact at a safe rhythm.',
      },
      goal_social_mentor_bold: {
        text: 'Expand the scope quickly',
        feedback: 'The network grew fast, and managing the pace got harder.',
      },
    },
  },

  // --- Butterfly effect: irreversible life changes and their echoes ---
  butterfly_friend_moving_away: {
    text: "Your best friend's family is moving to another city. Today is their last day. You are sitting in the park, both of you silent.",
    choices: {
      choice_0: {
        text: 'Hug them, cry, and say everything',
        feedback: 'You said goodbye through tears. You will never forget this moment.',
      },
      choice_1: {
        text: 'Act normal, as if they were not moving at all',
        feedback: 'You played as if nothing had happened. But you both knew.',
      },
    },
  },
  butterfly_school_change: {
    text: 'Your family moved to a new neighborhood. You have to start at a new school. You may never see your old friends again.',
    choices: {
      choice_0: {
        text: 'Get excited, new beginnings are great',
        feedback: 'Your first day at the new school. New faces, new opportunities. You left the past behind.',
      },
      choice_1: {
        text: 'You want to resist, but you have no choice',
        feedback: 'You miss your old friends. At the new school everyone is a stranger. But you will get through it.',
      },
    },
  },
  butterfly_family_divorce: {
    text: 'Mom and Dad will live apart now. They both say they love you, but everything at home is changing.',
    choices: {
      choice_0: {
        text: 'Stay with Mom',
        feedback: 'You decided to stay with your mom. Your dad drifted away, but your bond with your mom grew stronger.',
      },
      choice_1: {
        text: 'Stay with Dad',
        feedback: 'You chose to stay with your dad. Your mom was hurt, but your dad had your back.',
      },
      choice_2: {
        text: 'Talk to both and find the middle ground',
        feedback: 'You listened to both of them and tried to understand each. It was very hard, but it made you grow up.',
      },
    },
  },
  butterfly_best_friend_betrayal: {
    text: 'Your best friend spread your secret to the whole school. Everyone knows. You hear whispers in the hallway.',
    choices: {
      choice_0: {
        text: 'Forgive them, everyone makes mistakes',
        feedback: 'You forgave them, but you did not forget. Things between you will never be the same.',
      },
      choice_1: {
        text: 'Never forgive, end the friendship',
        feedback: 'You cut them out of your life. It hurt, but you kept your self-respect.',
      },
      choice_2: {
        text: 'Take revenge and spread their secret too',
        feedback: 'You hit back. It felt satisfying, but you both ended up wrecked.',
      },
    },
  },
  butterfly_university_or_work: {
    text: 'High school is almost over. Two paths lie ahead: prepare for the university exam or jump straight into working life.',
    choices: {
      choice_0: {
        text: 'Prepare for university',
        feedback: 'It is a long road, but you think it is the right one. Books on your desk, the future uncertain but hopeful.',
      },
      choice_1: {
        text: 'Jump into work',
        feedback: 'You started earning money. Independence feels good, but you are working while your friends have fun on campus.',
      },
    },
  },
  butterfly_post_divorce_adaptation: {
    text: "After the divorce you are trying to get used to the new routine. Weekends are spent at your other parent's place.",
    choices: {
      choice_0: {
        text: 'Find a balance between two homes',
        feedback: 'It is hard, but you learned to keep both sides happy. It made you grow up.',
      },
      choice_1: {
        text: 'Struggle to accept the situation',
        feedback: 'You still have not gotten used to it. Some nights you cry, but you tell no one.',
      },
    },
  },
  butterfly_friend_farewell_open_echo: {
    text: 'A letter arrived from the childhood friend who moved away years ago. They still remember what you said at your goodbye and want to reconnect.',
    choices: {
      friend_open_echo_reply: {
        text: 'Write a long reply',
        feedback: 'Because you did not hide your feelings that day, the bond between you has lasted for years. You started writing to each other again.',
      },
      friend_open_echo_keep_memory: {
        text: 'Put the letter in your memory box',
        feedback: 'You did not reply, but you realized your honest goodbye stayed a good memory.',
      },
    },
  },
  butterfly_friend_farewell_silent_echo: {
    text: 'You found an old photo of the childhood friend who moved away. Having said nothing on the last day sits inside you like an unfinished sentence.',
    choices: {
      friend_silent_echo_reach_out: {
        text: 'Ask their family for a way to get in touch',
        feedback: 'Where you stayed silent years ago, you took the first step this time. Late as it is, you finished your goodbye.',
      },
      friend_silent_echo_avoid: {
        text: 'Put the photo back',
        feedback: 'You closed the subject again. The weight of the unsaid words eased, but it did not vanish completely.',
      },
    },
  },
  butterfly_school_change_embraced_echo: {
    text: 'A new project team is forming in high school. Thanks to the curiosity you showed when you changed schools years ago, entering different circles no longer feels foreign.',
    choices: {
      school_embraced_echo_lead: {
        text: 'Take the lead in forming the team',
        feedback: 'Having turned an old change into an opportunity made it easier to lead among strangers today.',
      },
      school_embraced_echo_join: {
        text: 'Join a team',
        feedback: 'Approaching new people came easily. You used the quiet advantage of being open to change.',
      },
    },
  },
  butterfly_school_change_resisted_echo: {
    text: 'Classes were reshuffled in high school. The strangeness you felt when you changed schools years ago is coming back, and this time you get to choose how you respond.',
    choices: {
      school_resisted_echo_recover: {
        text: 'Meet one person on the first day',
        feedback: 'This time you did not let change run you. With one small step you turned the old fear around.',
      },
      school_resisted_echo_withdraw: {
        text: 'Stay an observer for a while',
        feedback: 'You chose to protect yourself. The old habit felt safe, but it delayed settling into the new crowd.',
      },
    },
  },

  // --- Early-choice echoes (a childhood decision comes back at school) ---
  early_toy_share_cooperation_echo: {
    text: 'In a class project you have to share a single box of supplies. You remember that hard moment at the park when you handed over your toy, and working together comes naturally.',
    choices: {
      toy_share_echo_coordinate: {
        text: 'Suggest taking turns with the supplies',
        feedback: 'The sharing reflex you learned as a little kid held the team together this time. You finished the project together.',
      },
      toy_share_echo_step_back: {
        text: 'Leave the box to the team and take another task',
        feedback: 'You saw that sharing does not only mean using the same thing. You covered what the team was missing in another way.',
      },
    },
  },
  early_toy_keep_boundaries_echo: {
    text: 'A classmate keeps taking your pens without asking. The feeling from the day you refused to give up your toy at the park comes back: you are caught between setting a boundary and being hurtful.',
    choices: {
      toy_keep_echo_boundary: {
        text: 'Calmly ask them to ask first',
        feedback: 'This time you said "mine" without hurting the other person. You turned your childhood reaction into a clear boundary.',
      },
      toy_keep_echo_grab: {
        text: 'Snatch the pens out of their hand',
        feedback: 'You protected your things, but the old harsh reaction crept back between you. Later you thought you could have spoken more calmly.',
      },
    },
  },
  early_night_fear_support_echo: {
    text: 'On a school trip, when the lights go out, the friend next to you is scared. You can now give the support your family gave you when you called out as a little kid.',
    choices: {
      night_support_echo_stay: {
        text: 'Stay beside them and talk',
        feedback: 'You passed on to your friend the reassurance that once calmed you. The dark did not pass, but the loneliness did.',
      },
      night_support_echo_get_help: {
        text: 'Ask the teacher for help',
        feedback: 'You remembered that asking for support is not weakness. The teacher came and put both of you at ease.',
      },
    },
  },
  early_night_fear_courage_echo: {
    text: 'At a night camp you hear a sound outside the tent. The moment you looked under the bed years ago reminds you that fear shrinks when you face it.',
    choices: {
      night_courage_echo_check: {
        text: 'Check from a safe distance with a flashlight',
        feedback: 'You saw that the sound came from a tree branch. Your old courage joined with caution this time.',
      },
      night_courage_echo_wake_friend: {
        text: 'Wake a friend and look together',
        feedback: 'You learned that being brave does not mean being alone. You checked the sound together.',
      },
    },
  },
  early_window_hide_accountability_echo: {
    text: "In class you accidentally break the experiment setup. Like the day you ran off after the neighbor's window, the urge to slip away before anyone sees comes back.",
    choices: {
      window_hide_echo_recover: {
        text: 'Tell the teacher right away this time',
        feedback: 'You did not repeat your old escape. When you owned up, the setup was repaired together and guilt gave way to relief.',
      },
      window_hide_echo_delay: {
        text: 'Leave an anonymous note after class',
        feedback: 'You could not quite face it, but this time you did not run away completely. The note got the problem found; your next step will be speaking openly.',
      },
    },
  },
  early_window_apology_trust_echo: {
    text: 'In the lab you accidentally break a piece of equipment. The day you faced your neighbor and apologized reminds you that speaking up without hiding a mistake can build trust.',
    choices: {
      window_apology_echo_own: {
        text: 'Take responsibility and suggest a fix',
        feedback: 'Thanks to your honesty, the teacher planned the fix with you instead of getting angry. The responsibility you learned early turned into trust.',
      },
      window_apology_echo_report: {
        text: 'Tell it exactly as it happened',
        feedback: 'You told it without making excuses. The honest step you took as a little kid has become a natural habit.',
      },
    },
  },
  early_art_original_voice_echo: {
    text: 'A cover is being designed for the school magazine. The day you drew a spaceship while everyone else drew houses brings your different idea back.',
    choices: {
      art_original_echo_pitch: {
        text: 'Present your original design to the team',
        feedback: 'With the courage that came from your first spaceship, you defended your idea. The team picked your design and developed it together.',
      },
      art_original_echo_merge: {
        text: "Combine your idea with the team's suggestions",
        feedback: "You kept your originality and made room for other people's ideas. Your childhood curiosity grew through teamwork.",
      },
    },
  },
  early_art_safe_pattern_echo: {
    text: 'A cover is being designed for the school magazine. You remember the safe picture you drew like everyone else as a kid. This time it is up to you whether to take the familiar road or a small risk.',
    choices: {
      art_safe_echo_experiment: {
        text: 'Add an unexpected detail to the design',
        feedback: 'You stepped outside the safe pattern without breaking it completely. The small risk helped you find your own visual language.',
      },
      art_safe_echo_refine: {
        text: 'Perfect the classic design',
        feedback: 'You chose the familiar road, but this time you did it on purpose and with care. A safe choice became a study in craft.',
      },
    },
  },

  // --- School and friends echoes ---
  school_new_friend_reunion_echo: {
    text: 'In middle school you landed in the same club as an old classmate. The day you walked up and introduced yourself in primary school still gives you the courage to approach new people.',
    choices: {
      new_friend_reunion_echo_reconnect: {
        text: 'Reconnect with your old friend',
        feedback: 'The courage of your first hello opened the door again years later. This time you talked about a shared future, not the past.',
      },
      new_friend_reunion_echo_greet: {
        text: 'Say hi and focus on the club',
        feedback: 'You did not force the bond, but you did not close the door either. A quick hello was enough to keep you at peace with the past.',
      },
    },
  },
  school_new_friend_distance_echo: {
    text: 'At the new school everyone has pulled into their own group. Like the student you once watched from afar as a kid, someone is now standing near you, waiting for somebody to take the first step.',
    choices: {
      new_friend_distance_echo_step: {
        text: 'This time you go to them',
        feedback: 'You did not repeat the old missed chance. The first step was small, but it was the start of a new friendship.',
      },
      new_friend_distance_echo_wait: {
        text: 'Keep observing',
        feedback: 'Waiting felt safe. You were not alone, but you will have to take a step later for a new bond to form.',
      },
    },
  },
  school_exam_pride_echo: {
    text: "You got a high grade on an important exam in high school. Your urge in primary school to share your joy at home reminds you that you don't have to carry success alone.",
    choices: {
      exam_pride_echo_share: {
        text: 'Share your study method with a friend',
        feedback: 'The pride you felt as a kid turned into sharing, not competition, this time. You both went into the exam better prepared.',
      },
      exam_pride_echo_quiet: {
        text: 'Celebrate quietly',
        feedback: 'Your grade made you happy, but you did not feel you had to prove it. Quiet pride is a strength too.',
      },
    },
  },
  school_exam_hidden_echo: {
    text: 'A new exam result is being announced. The uneasiness of the time you hid a bad grade as a kid comes back. How long will the secret last this time?',
    choices: {
      exam_hidden_echo_tell: {
        text: 'Tell your family the result openly',
        feedback: 'You did not repeat your old habit of hiding. The result was received more calmly than you expected, and you made a plan together.',
      },
      exam_hidden_echo_delay: {
        text: 'Make your own study plan first',
        feedback: 'You put off the conversation, but this time to prepare, not to escape. The next step is still in your hands.',
      },
    },
  },
  school_exam_recovery_echo: {
    text: 'Exam week is here. You will see whether the promise you made as a kid, "I will study next time," has turned into a real study habit.',
    choices: {
      exam_recovery_echo_schedule: {
        text: 'Follow a short but steady plan',
        feedback: 'This time you broke your old promise into small steps. It is not perfect, but you built progress you can sustain.',
      },
      exam_recovery_echo_peer: {
        text: 'Study together with a friend',
        feedback: 'Where you struggled to keep going alone, you got support. You learned there are different ways to keep your word.',
      },
    },
  },
  social_media_presence_echo: {
    text: 'One of your posts unexpectedly reached a lot of people. The excitement of the day you opened your first account comes back. You have to choose between being visible and protecting yourself.',
    choices: {
      social_presence_echo_boundaries: {
        text: 'Adjust your privacy settings and boundaries',
        feedback: 'You took back control without losing your first excitement. As long as you have boundaries, being visible stays your choice.',
      },
      social_presence_echo_delete: {
        text: 'Take the post down and take a break',
        feedback: 'Pulling back gave you room to breathe. You will decide for yourself when to return to the digital world.',
      },
    },
  },
  social_media_boundary_echo: {
    text: 'Your friends want you to switch to a new app. The old day you chose to wait with your family reminds you that you can still decide without rushing.',
    choices: {
      social_boundary_echo_research: {
        text: 'Look into its safety and privacy features first',
        feedback: 'Waiting was not being passive; you gathered information. You made your decision on your own terms, not under pressure.',
      },
      social_boundary_echo_join: {
        text: 'Join together with your friends',
        feedback: 'This time you made the decision knowingly and joined your friend group. You had fun without forgetting to protect your boundaries.',
      },
    },
  },
  social_media_secret_echo: {
    text: 'A screenshot of an old post from your secret account is going around. The fear of getting caught brings back the tension you felt the first time you hid the account.',
    choices: {
      social_secret_echo_tell: {
        text: 'Ask a trusted adult for support',
        feedback: 'You did not carry the old secrecy alone. Asking for support did not fix the account; it helped you take control of the weight on your shoulders.',
      },
      social_secret_echo_hide: {
        text: 'Delete everything and tell no one',
        feedback: 'You closed the trail, but the fear stayed inside. You thought you might ask for support sooner next time.',
      },
    },
  },
  school_project_overwork_echo: {
    text: 'In the last week of a high school project, everyone is leaving the work to you. The day you did everything alone in middle school reminds you how important it is to ask for help before you burn out.',
    choices: {
      school_overwork_echo_delegate: {
        text: 'Redistribute the tasks',
        feedback: 'You broke the old overload cycle. The project was not perfect, but this time everyone took responsibility.',
      },
      school_overwork_echo_finish: {
        text: 'Finish it one last time, then set a limit',
        feedback: 'You finished this project but saw the cost. You decided to state your limits up front with your next team.',
      },
    },
  },
  school_project_leadership_echo: {
    text: 'No one is steering a club project. The small leadership of the day you assigned tasks in middle school could be useful again, now in front of a bigger group.',
    choices: {
      school_leadership_echo_guide: {
        text: 'Volunteer and build the plan',
        feedback: 'Your old, fair way of splitting tasks has grown into clearer leadership. You guided people by listening to them.',
      },
      school_leadership_echo_support: {
        text: 'Back up the person making the plan',
        feedback: 'Being a leader was not always about standing out. By giving the right support, you kept the project moving.',
      },
    },
  },
  school_project_report_echo: {
    text: 'In your new team some members are not working. The relief and the social cost of the day you complained to the teacher in middle school come back at the same time.',
    choices: {
      school_report_echo_direct: {
        text: 'Talk to the team openly first',
        feedback: 'This time you talked to your team before going straight to a complaint. Some of the problems came from unclear tasks.',
      },
      school_report_echo_teacher: {
        text: 'Ask the teacher to mediate',
        feedback: "You chose to ask for help. The teacher clarified everyone's role, and the load did not stay on one person's shoulders.",
      },
    },
  },
  exclusion_stand_echo: {
    text: 'In high school you are asked to exclude someone to get into a friend group. The day you said "this is not right" as a kid now meets you again with more visible pressure.',
    choices: {
      exclusion_stand_echo_include: {
        text: 'Invite the excluded person into the group',
        feedback: 'The decision you made as a kid has become a bigger courage today. The group got smaller, but more honest.',
      },
      exclusion_stand_echo_leave: {
        text: 'Refuse the condition and walk away',
        feedback: 'You protected your own boundary without escalating the argument. You knew you do not have to belong to every group.',
      },
    },
  },
  exclusion_belong_echo: {
    text: 'Your friend group is ignoring another student again. The moment you once stayed silent to belong now asks what kind of friend you want to be.',
    choices: {
      exclusion_belong_echo_apologize: {
        text: 'Apologize to that person and go to them',
        feedback: 'You took responsibility for your old choice to stay silent in order to belong. Even a late apology opened a new door.',
      },
      exclusion_belong_echo_speak: {
        text: 'Tell the group this is not right',
        feedback: 'You did not stay silent this time. Not everyone changed right away, but you know which side you stand on.',
      },
    },
  },
  middle_school_open_echo: {
    text: 'At your new school you have to choose between a club and a new circle of friends. The day you started middle school full of excitement reminds you to see change as an opportunity.',
    choices: {
      middle_open_echo_join: {
        text: 'Join the club you know nothing about',
        feedback: 'The curiosity you carried from middle school helped you enter a new circle today. What you did not know is now an opportunity.',
      },
      middle_open_echo_compare: {
        text: 'Observe both clubs first',
        feedback: 'You did not decide right away. You got to know the options and picked the one that fits you. Being open did not mean rushing.',
      },
    },
  },
  middle_school_fear_echo: {
    text: 'You have your first presentation at the new school. The fear you felt moving up to middle school comes back. This time it is up to you whether to hide it or turn it into something with support.',
    choices: {
      middle_fear_echo_rehearse: {
        text: 'Rehearse with a friend',
        feedback: 'You did not carry the old fear alone. The more you rehearsed, the more your voice settled, and the presentation began.',
      },
      middle_fear_echo_read: {
        text: 'Read your notes and keep it short',
        feedback: 'You did not feel fully ready for the stage, but you chose a method that protected you. The presentation went better than you expected.',
      },
    },
  },
  middle_school_prepare_echo: {
    text: 'Prep for the high school entrance exam is getting intense. The day you started middle school well prepared reminds you that you can build the system again today.',
    choices: {
      middle_prepare_echo_plan: {
        text: 'Make a weekly study plan',
        feedback: 'The steady prep habit you built as a kid has grown. You broke your anxiety into small, measurable steps.',
      },
      middle_prepare_echo_ask: {
        text: 'Ask a teacher for guidance',
        feedback: 'Being prepared did not mean knowing everything alone. By asking the right question, you cleared your path.',
      },
    },
  },
  hobby_music_echo: {
    text: 'A friend wants you to play guitar on a small stage. The chords you started learning in primary school now ask whether you will keep going.',
    choices: {
      hobby_music_echo_play: {
        text: 'Agree to play on stage',
        feedback: 'Your first chords turned into a brave performance today. It was not flawless, but it was real.',
      },
      hobby_music_echo_practice: {
        text: 'Rehearse one more month first',
        feedback: 'You put off the stage but did not give up the music. Patience turned your first enthusiasm into a lasting skill.',
      },
    },
  },
  hobby_coding_echo: {
    text: 'A friend asks you to bring a small app idea to life. The curiosity behind your first "Hello World" program now has a real problem to solve.',
    choices: {
      hobby_coding_echo_build: {
        text: 'Build a simple prototype',
        feedback: 'You turned your childhood curiosity into a small product. The first working prototype was the start of a bigger road.',
      },
      hobby_coding_echo_pair: {
        text: 'Invite your friend to learn together',
        feedback: 'Instead of solving it alone, you learned together. The curiosity from your first course became shared making this time.',
      },
    },
  },
  hobby_sport_echo: {
    text: 'Your team is getting ready for an important match. The tough practices of the sport you picked as a kid now ask how you will support your teammates.',
    choices: {
      hobby_sport_echo_lead: {
        text: 'Motivate the team',
        feedback: 'The old team spirit became leadership today. You saw that keeping each other in the game matters as much as winning.',
      },
      hobby_sport_echo_recover: {
        text: 'Sit on the bench and support your teammates',
        feedback: 'Even off the field, you were part of the team. Your hobby taught you more about solidarity than about competition.',
      },
    },
  },
  hobby_art_echo: {
    text: 'You are preparing a portfolio for a university application. The first day you calmed down with colors in art class comes back, now to make your effort visible.',
    choices: {
      hobby_art_echo_submit: {
        text: 'Use your portfolio in the application',
        feedback: 'The painting you started to calm yourself has become a concrete file for your future.',
      },
      hobby_art_echo_keep: {
        text: 'Keep the portfolio for yourself',
        feedback: "You did not submit your work right away, but you did not stop creating. A hobby can grow without tying its worth to someone else's approval.",
      },
    },
  },
  friend_conflict_repair_echo: {
    text: 'You and a close friend had a serious misunderstanding. The day you apologized and made up as kids now asks how you will protect the friendship this time.',
    choices: {
      friend_repair_echo_talk: {
        text: 'Talk face to face and listen',
        feedback: 'You combined your old courage to make peace with more mature listening. The friendship did not get easier right away, but it got more honest.',
      },
      friend_repair_echo_space: {
        text: 'Give it some time and send a message',
        feedback: 'This time, instead of digging in, you made room to think. Your message was enough to restart the conversation.',
      },
    },
  },
  friend_conflict_distance_echo: {
    text: 'You kept putting off talking to your close friend, and the distance between you has grown. The mark of your old "let them come to me" decision now asks you to take a step before you lose the friendship completely.',
    choices: {
      friend_distance_echo_reach: {
        text: 'Send the first message yourself',
        feedback: 'This time you took the first step you once waited for as a kid. The outcome was not guaranteed, but openness was left instead of regret.',
      },
      friend_distance_echo_release: {
        text: 'Say goodbye without forcing the friendship',
        feedback: 'You accepted that not every friendship lasts the same way. This time, instead of just going silent, you found closure within yourself.',
      },
    },
  },
  bullying_witness_intervene_echo: {
    text: 'A friend is being targeted unfairly. The moment you stepped in as a kid asks you to use your courage again.',
    choices: {
      bullying_intervene_echo_speak: {
        text: 'Step in calmly but clearly',
        feedback: 'The support you gave as a kid has turned into a courage that sets boundaries.',
      },
      bullying_intervene_echo_support: {
        text: 'Stand by the person being targeted',
        feedback: 'Without being a lone hero, you kept someone from being left alone.',
      },
    },
  },
  bullying_witness_report_echo: {
    text: "There is a safe reporting line at school. The day you asked a teacher for help as a kid comes back, now for someone else's safety.",
    choices: {
      bullying_report_echo_document: {
        text: 'Note the incident and report it to an official',
        feedback: 'Asking for help was not stepping back; it was carrying the responsibility to the right place.',
      },
      bullying_report_echo_checkin: {
        text: 'Go with the person who was targeted first',
        feedback: 'Instead of deciding alone, you included them in the process.',
      },
    },
  },
  bullying_witness_ignore_echo: {
    text: 'A group is leaving a quieter student out. The guilt of the time you stayed silent as a kid now waits for a small step.',
    choices: {
      bullying_ignore_echo_apologize: {
        text: 'Apologize to that person and be there for them',
        feedback: 'You could not erase the past, but today you accepted the cost of your silence.',
      },
      bullying_ignore_echo_invite: {
        text: 'Invite them into your own group',
        feedback: 'Without making a big speech, you showed the power of including someone.',
      },
    },
  },
  phone_wait_echo: {
    text: 'It is time to get a new phone. The day you chose to wait as a kid now helps you tell what you actually need.',
    choices: {
      phone_wait_echo_budget: {
        text: 'Prepare a budget and a usage plan',
        feedback: 'Waiting turned into an advantage: you got what you wanted by planning for it.',
      },
      phone_wait_echo_refurbished: {
        text: 'Choose a simpler, refurbished model',
        feedback: 'Instead of the most expensive option, you found the one that meets your needs.',
      },
    },
  },
  phone_conflict_echo: {
    text: 'You are having tension with your family over phone use again. The sentence "everyone has one" that you said as a kid now asks you to talk about boundaries.',
    choices: {
      phone_conflict_echo_listen: {
        text: "Listen to your family's worry and set a shared rule",
        feedback: 'Instead of winning the argument, you set up a rule you can all live with.',
      },
      phone_conflict_echo_pause: {
        text: 'Let things cool down and talk later',
        feedback: 'Before trying to prove you were right, you waited for the tension to drop.',
      },
    },
  },
  phone_bargain_echo: {
    text: 'Your report card is good, but the deal you made about the phone is back on the table. The goal you set as a kid now asks whether you will keep your word.',
    choices: {
      phone_bargain_echo_honor: {
        text: "Accept the deal's responsibilities",
        feedback: 'Beyond what you wanted, you showed that your word has value too.',
      },
      phone_bargain_echo_renegotiate: {
        text: 'Revisit the terms together',
        feedback: 'Instead of breaking the deal, you updated it by talking openly.',
      },
    },
  },
  study_pressure_plan_echo: {
    text: 'Exams and applications are piling up. The study plan you made as a kid reminds you to break big pressure into parts.',
    choices: {
      study_plan_echo_breakdown: {
        text: 'Split the week into small goals',
        feedback: 'The system that worked in childhood helped you carry a bigger load now.',
      },
      study_plan_echo_share: {
        text: 'Share your plan with a friend',
        feedback: 'Without carrying the load alone, you built a rhythm you can follow together.',
      },
    },
  },
  study_pressure_cram_echo: {
    text: 'Studying until morning looks easy in the short run. Your old last-night decision now shows you the limits of your body and your attention.',
    choices: {
      study_cram_echo_sleep: {
        text: 'Set a boundary between sleep and studying',
        feedback: 'Instead of trying to finish everything in one night, you left some energy for tomorrow.',
      },
      study_cram_echo_prioritize: {
        text: 'Pick the most important topics and postpone the rest',
        feedback: 'You chose being effective over being complete. This time you knew what to let go of.',
      },
    },
  },
  study_pressure_together_echo: {
    text: 'A friend asks you for help with a topic they are struggling with. The day you studied together as kids brings back the power of sharing knowledge.',
    choices: {
      study_together_echo_teach: {
        text: 'Reinforce the topic by explaining it to them',
        feedback: 'Your own knowledge got clearer as you explained. Helping moved both of you forward.',
      },
      study_together_echo_resources: {
        text: 'Prepare a list of resources and questions together',
        feedback: 'Instead of hunting for a single right answer, you built a roadmap you could follow together.',
      },
    },
  },
  teacher_unfair_voice_echo: {
    text: 'An authority figure misunderstood you. The day you objected respectfully as a kid now asks you to explain yourself without losing your voice.',
    choices: {
      teacher_voice_echo_facts: {
        text: 'Explain the situation calmly and concretely',
        feedback: 'You showed that you can be firm about unfairness without shouting.',
      },
      teacher_voice_echo_mediator: {
        text: 'Ask someone you trust to mediate',
        feedback: 'Asking for help was not weakness; it moved the situation onto fair ground.',
      },
    },
  },
  teacher_unfair_silence_echo: {
    text: 'You have a chance to speak your mind at a meeting. The unfairness you stayed silent about as a kid now reminds you what staying silent costs.',
    choices: {
      teacher_silence_echo_speak: {
        text: 'Voice your objection in one short sentence',
        feedback: 'This time, without blowing it up, you made your own experience visible.',
      },
      teacher_silence_echo_write: {
        text: 'Send your thoughts in writing',
        feedback: 'You found another way so that your thoughts would not disappear even if you were cut off.',
      },
    },
  },
  teacher_unfair_support_echo: {
    text: 'A friend is about to cry after harsh criticism. The moment you were supported as a kid now asks you to stand by them.',
    choices: {
      teacher_support_echo_listen: {
        text: 'Listen to them first, do not rush to fix it',
        feedback: "You showed that you can make room for someone's feelings without trying to fix them.",
      },
      teacher_support_echo_resource: {
        text: 'Find a trusted adult together',
        feedback: 'You looked for the right support for a burden you could not carry alone.',
      },
    },
  },
  body_change_questions_echo: {
    text: 'You have started to hesitate to ask anyone a new question about your body. The openness you had with your family as a kid opens a door of trust again.',
    choices: {
      body_questions_echo_talk: {
        text: 'Talk openly with someone you trust',
        feedback: 'You were reminded again that you do not have to hide your questions about your body.',
      },
      body_questions_echo_professional: {
        text: 'Ask an expert for accurate information',
        feedback: 'You reduced the uncertainty with reliable information, not guesses.',
      },
    },
  },
  body_change_avoid_echo: {
    text: 'Hiding your worry about the changes in your body feels easy. The questions you ignored as a kid now ask you to be kinder to yourself.',
    choices: {
      body_avoid_echo_journal: {
        text: 'Write down your questions and look into them step by step',
        feedback: 'Instead of suppressing your worry, you turned it into questions you can understand.',
      },
      body_avoid_echo_friend: {
        text: 'Talk to a friend with a similar experience',
        feedback: 'Realizing you are not alone was your first step toward help.',
      },
    },
  },
  body_change_research_echo: {
    text: 'Someone close to you believes something wrong about the changes in their body. The day you looked into it as a kid asks you to share what you know.',
    choices: {
      body_research_echo_share: {
        text: 'Check the source together',
        feedback: 'Instead of lecturing, you verified the information together.',
      },
      body_research_echo_boundary: {
        text: 'Point them to an expert where you do not know',
        feedback: 'Instead of looking for every answer in yourself, you pointed to reliable support.',
      },
    },
  },
  science_fair_demo_echo: {
    text: 'A team asks you to make a complex idea visible. The curiosity you sparked as a kid with a volcano model now turns into a presentation.',
    choices: {
      science_demo_echo_build: {
        text: 'Put together a simple prototype',
        feedback: 'A small experiment made the complex idea easy to understand.',
      },
      science_demo_echo_explain: {
        text: 'Explain the idea with visuals and a short story',
        feedback: 'You turned science from an exam answer into something people will remember.',
      },
    },
  },
  science_fair_patience_echo: {
    text: 'In a long project, the first results are not what you expected. The patience you showed watching a plant for weeks as a kid is being tested again.',
    choices: {
      science_patience_echo_measure: {
        text: 'Track the data and keep the experiment going',
        feedback: 'Not getting results right away was worth no less than following the right question.',
      },
      science_patience_echo_adjust: {
        text: 'Retry with a small change to the method',
        feedback: 'Patience was not repeating the same thing forever; it was adjusting to the evidence.',
      },
    },
  },
  science_fair_last_minute_echo: {
    text: 'A deadline is approaching and the project is incomplete. The poster you left to the last day as a kid now asks you to plan again.',
    choices: {
      science_last_minute_echo_scope: {
        text: 'Narrow the scope and produce a working result',
        feedback: 'Instead of chasing perfection, you designed an experiment you could actually finish.',
      },
      science_last_minute_echo_ask: {
        text: 'Ask the team for help and split the tasks',
        feedback: 'Instead of carrying the last minute alone, you leaned on the strength of the team.',
      },
    },
  },

  // --- Item unlock events ---
  item_unlock_bicycle_social_ride: {
    text: 'While you were riding your bike around the neighborhood, your friends joined you.',
    choices: {
      bicycle_ride_together: {
        text: 'Invite everyone on a ride together',
        feedback: 'By the end of the ride you were even closer with your group.',
      },
    },
  },
  item_unlock_phone_message_thread: {
    text: 'A new group chat on your phone sped up your social life.',
    choices: {
      phone_keep_conversation: {
        text: 'Keep the conversation warm',
        feedback: 'Messaging grew your social circle.',
      },
    },
  },
  item_unlock_guitar_jam_session: {
    text: 'Once you had put in enough guitar practice, a mini jam session started up after school.',
    choices: {
      guitar_open_mic: {
        text: 'Play a piece on stage',
        feedback: 'Your performance strengthened both your courage and your musical ability.',
      },
    },
  },
  item_unlock_computer_internship_window: {
    text: 'With your computer goal complete, an internship application window opened.',
    choices: {
      computer_apply_internship: {
        text: 'Prepare an application file',
        feedback: 'The application you prepared brought you closer to the professional world.',
      },
    },
  },
  item_unlock_camera_art_collab: {
    text: 'After you finished building up your camera skills, a creative team invited you to a shoot day.',
    choices: {
      camera_collab_join: {
        text: 'Join the project',
        feedback: 'The creative shoot day brought you new social connections.',
      },
    },
  },

  // --- Social group events ---
  social_group_popular_invite: {
    text: 'A popular group invited you to their weekend hangout.',
    choices: {
      popular_invite_join: {
        text: 'Accept the invitation',
        feedback: 'You joined the group and your social circle widened.',
      },
      popular_invite_decline: {
        text: 'Politely decline',
        feedback: 'You chose to keep your own rhythm.',
      },
    },
  },
  social_group_best_friend_plan: {
    text: 'Your best friend came to you with the idea of starting a study group together.',
    choices: {
      best_friend_create_group: {
        text: 'Start a study group',
        feedback: 'You formed your group by setting up a planned study routine.',
      },
      best_friend_postpone_group: {
        text: 'Put the idea off',
        feedback: 'For now, you chose to stay on your own.',
      },
    },
  },
  social_group_internal_conflict: {
    text: 'An argument in your group has blown up. A test of leadership and harmony has begun.',
    choices: {
      group_conflict_mediate: {
        text: 'Step in and smooth things over',
        feedback: 'With crisis management, you saved the group from falling apart.',
      },
      group_conflict_walk_away: {
        text: 'Walk away from the argument',
        feedback: "The group's reputation took a hit.",
      },
    },
  },
  social_group_club_competition: {
    text: 'Your club is entering a competition. Team spirit and skill are being tested.',
    choices: {
      club_competition_commit: {
        text: 'Organize the team',
        feedback: "On competition day your leadership raised the group's reputation.",
      },
      club_competition_skip: {
        text: 'Sit this round out',
        feedback: 'Team morale dipped slightly.',
      },
    },
  },
};
