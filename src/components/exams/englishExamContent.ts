import type { Difficulty } from './MiniGameContainer';

export type EnglishQuestionType = 'VOCABULARY' | 'TRANSLATION' | 'GRAMMAR' | 'FILL_BLANK';

export interface EnglishQuestion {
  id: string;
  type: EnglishQuestionType;
  question: string;
  options: string[];
  correctIndex: number;
}

export type EnglishAgeGroup = 'YOUNG' | 'MIDDLE' | 'ADVANCED';

type EnglishQuestionBank = Record<EnglishAgeGroup, Record<Difficulty, EnglishQuestion[]>>;

export const ENGLISH_QUESTION_BANK_EN: EnglishQuestionBank = {
  YOUNG: {
    EASY: [
      { id: 'eng_en_y_e_1', type: 'VOCABULARY', question: 'What does "rabbit" mean?', options: ['A small animal with long ears', 'A kind of fruit', 'A school subject', 'A weather season'], correctIndex: 0 },
      { id: 'eng_en_y_e_2', type: 'VOCABULARY', question: 'Which word names a color?', options: ['Table', 'Purple', 'Window', 'Teacher'], correctIndex: 1 },
      { id: 'eng_en_y_e_3', type: 'VOCABULARY', question: 'What is the opposite of "hot"?', options: ['Warm', 'Cold', 'Dry', 'Bright'], correctIndex: 1 },
      { id: 'eng_en_y_e_4', type: 'TRANSLATION', question: 'Choose the best reply: "Thank you."', options: ['Please sit down.', "You're welcome.", 'See you yesterday.', 'I am pencil.'], correctIndex: 1 },
      { id: 'eng_en_y_e_5', type: 'VOCABULARY', question: 'Which word is a family member?', options: ['Uncle', 'Market', 'Cloud', 'Bottle'], correctIndex: 0 },
      { id: 'eng_en_y_e_6', type: 'VOCABULARY', question: 'What does "kitchen" mean?', options: ['A place for sleeping', 'A place for cooking', 'A place for studying', 'A place for driving'], correctIndex: 1 },
      { id: 'eng_en_y_e_7', type: 'VOCABULARY', question: 'Which number is twelve?', options: ['10', '11', '12', '20'], correctIndex: 2 },
      { id: 'eng_en_y_e_8', type: 'TRANSLATION', question: 'Choose the most polite request.', options: ['Open door now.', 'Can you open the door, please?', 'Door open!', 'I door you.'], correctIndex: 1 },
      { id: 'eng_en_y_e_9', type: 'VOCABULARY', question: 'What does "autumn" refer to?', options: ['A school bag', 'A season', 'A pet', 'A number'], correctIndex: 1 },
      { id: 'eng_en_y_e_10', type: 'VOCABULARY', question: 'Which word is a place in a house?', options: ['Bathroom', 'Tuesday', 'Basketball', 'Friendly'], correctIndex: 0 },
      { id: 'eng_en_y_e_11', type: 'FILL_BLANK', question: 'My sister ___ seven years old.', options: ['am', 'is', 'are', 'be'], correctIndex: 1 },
      { id: 'eng_en_y_e_12', type: 'GRAMMAR', question: 'Choose the correct sentence.', options: ['He have a bike.', 'He has a bike.', 'He haves a bike.', 'He is have a bike.'], correctIndex: 1 },
    ],
    MEDIUM: [
      { id: 'eng_en_y_m_1', type: 'FILL_BLANK', question: 'There ___ three books on the desk.', options: ['is', 'am', 'are', 'be'], correctIndex: 2 },
      { id: 'eng_en_y_m_2', type: 'GRAMMAR', question: 'Choose the correct question.', options: ['Where you live?', 'Where do you live?', 'Where does you live?', 'Where living you?'], correctIndex: 1 },
      { id: 'eng_en_y_m_3', type: 'TRANSLATION', question: 'Which sentence asks for help?', options: ['I can run fast.', 'Can you help me, please?', 'This is my notebook.', 'She likes apples.'], correctIndex: 1 },
      { id: 'eng_en_y_m_4', type: 'VOCABULARY', question: 'What does "thirsty" mean?', options: ['Wanting water', 'Feeling sleepy', 'Feeling cold', 'Being angry'], correctIndex: 0 },
      { id: 'eng_en_y_m_5', type: 'FILL_BLANK', question: 'My friends ___ in the garden now.', options: ['play', 'plays', 'are playing', 'is playing'], correctIndex: 2 },
      { id: 'eng_en_y_m_6', type: 'GRAMMAR', question: 'Choose the correct article.', options: ['a umbrella', 'an umbrella', 'the umbrellae', 'some umbrella'], correctIndex: 1 },
      { id: 'eng_en_y_m_7', type: 'VOCABULARY', question: 'Which word means "very afraid"?', options: ['Brave', 'Scared', 'Busy', 'Kind'], correctIndex: 1 },
      { id: 'eng_en_y_m_8', type: 'FILL_BLANK', question: 'She usually ___ up at 7.', options: ['wake', 'wakes', 'woke', 'waking'], correctIndex: 1 },
      { id: 'eng_en_y_m_9', type: 'GRAMMAR', question: 'How ___ oranges do you want?', options: ['much', 'many', 'more', 'most'], correctIndex: 1 },
      { id: 'eng_en_y_m_10', type: 'TRANSLATION', question: 'Choose the best meaning of "What time is it?"', options: ['How old are you?', 'Where are you?', 'Can you drive?', 'What is the hour now?'], correctIndex: 3 },
      { id: 'eng_en_y_m_11', type: 'VOCABULARY', question: 'What does "busy" mean?', options: ['Not doing anything', 'Having a lot to do', 'Feeling sick', 'Being late'], correctIndex: 1 },
      { id: 'eng_en_y_m_12', type: 'FILL_BLANK', question: 'We ___ to school every day.', options: ['go', 'goes', 'going', 'gone'], correctIndex: 0 },
    ],
    HARD: [
      { id: 'eng_en_y_h_1', type: 'GRAMMAR', question: 'Choose the correct sentence.', options: ['She do her homework.', 'She does her homework.', 'She doing her homework.', 'She done her homework.'], correctIndex: 1 },
      { id: 'eng_en_y_h_2', type: 'FILL_BLANK', question: 'We ___ to the park yesterday.', options: ['go', 'goes', 'went', 'going'], correctIndex: 2 },
      { id: 'eng_en_y_h_3', type: 'VOCABULARY', question: 'What does "honest" mean?', options: ['Always telling the truth', 'Very loud', 'Very fast', 'Very lucky'], correctIndex: 0 },
      { id: 'eng_en_y_h_4', type: 'GRAMMAR', question: 'How ___ milk do you need?', options: ['many', 'much', 'more', 'most'], correctIndex: 1 },
      { id: 'eng_en_y_h_5', type: 'TRANSLATION', question: 'Choose the best question for frequency.', options: ['How long?', 'How often?', 'How far?', 'How old?'], correctIndex: 1 },
      { id: 'eng_en_y_h_6', type: 'FILL_BLANK', question: 'My father ___ breakfast at 7 every morning.', options: ['have', 'has', 'having', 'had'], correctIndex: 1 },
      { id: 'eng_en_y_h_7', type: 'GRAMMAR', question: 'Choose the correct phrase.', options: ['a hour ago', 'an hour ago', 'the hour ago', 'one hour agoed'], correctIndex: 1 },
      { id: 'eng_en_y_h_8', type: 'VOCABULARY', question: 'What does "dangerous" mean?', options: ['Safe', 'Risky', 'Cheap', 'Soft'], correctIndex: 1 },
      { id: 'eng_en_y_h_9', type: 'FILL_BLANK', question: 'The children ___ playing outside now.', options: ['is', 'am', 'are', 'be'], correctIndex: 2 },
      { id: 'eng_en_y_h_10', type: 'TRANSLATION', question: 'Choose the best English sentence.', options: ['Where from you come?', 'Where do you come from?', 'From where you are?', 'Where you came from do?'], correctIndex: 1 },
      { id: 'eng_en_y_h_11', type: 'GRAMMAR', question: 'Choose the correct sentence.', options: ['I can sings.', 'I can sing.', 'I can to sing.', 'I can singing.'], correctIndex: 1 },
      { id: 'eng_en_y_h_12', type: 'VOCABULARY', question: 'What does "several" mean?', options: ['Only one', 'A few', 'None', 'All'], correctIndex: 1 },
    ],
  },
  MIDDLE: {
    EASY: [
      { id: 'eng_en_m_e_1', type: 'VOCABULARY', question: 'What does "curious" mean?', options: ['Wanting to learn', 'Feeling angry', 'Being sleepy', 'Being lazy'], correctIndex: 0 },
      { id: 'eng_en_m_e_2', type: 'VOCABULARY', question: 'What does "polite" mean?', options: ['Rude', 'Respectful', 'Noisy', 'Late'], correctIndex: 1 },
      { id: 'eng_en_m_e_3', type: 'GRAMMAR', question: 'Choose the correct sentence.', options: ['She don\'t like tea.', 'She doesn\'t like tea.', 'She doesn\'t likes tea.', 'She not like tea.'], correctIndex: 1 },
      { id: 'eng_en_m_e_4', type: 'FILL_BLANK', question: 'My parents ___ dinner right now.', options: ['cook', 'cooks', 'are cooking', 'cooked'], correctIndex: 2 },
      { id: 'eng_en_m_e_5', type: 'TRANSLATION', question: 'Choose the best equivalent for "I agree with you."', options: ['I am against you.', 'I think you are right.', 'I do not hear you.', 'I will call you.'], correctIndex: 1 },
      { id: 'eng_en_m_e_6', type: 'VOCABULARY', question: 'What does "borrow" mean?', options: ['To give forever', 'To take for a short time', 'To break', 'To hide'], correctIndex: 1 },
      { id: 'eng_en_m_e_7', type: 'GRAMMAR', question: 'I have ___ been to Paris.', options: ['ever', 'never', 'yet', 'already'], correctIndex: 1 },
      { id: 'eng_en_m_e_8', type: 'FILL_BLANK', question: 'We ___ this movie before.', options: ['see', 'seen', 'have seen', 'seeing'], correctIndex: 2 },
      { id: 'eng_en_m_e_9', type: 'VOCABULARY', question: 'What does "exhausted" mean?', options: ['A little tired', 'Very tired', 'Happy', 'Confused'], correctIndex: 1 },
      { id: 'eng_en_m_e_10', type: 'TRANSLATION', question: 'Choose the best request.', options: ['Give me water now.', 'Could I have some water, please?', 'Water me give.', 'I am water.'], correctIndex: 1 },
      { id: 'eng_en_m_e_11', type: 'GRAMMAR', question: 'Choose the correct question.', options: ['Did you ever fly?', 'Have you ever flown?', 'Do you ever flown?', 'Were you ever fly?'], correctIndex: 1 },
      { id: 'eng_en_m_e_12', type: 'VOCABULARY', question: 'What does "ancient" mean?', options: ['Very old', 'Brand new', 'Very expensive', 'Very noisy'], correctIndex: 0 },
    ],
    MEDIUM: [
      { id: 'eng_en_m_m_1', type: 'GRAMMAR', question: 'If it rains, I ___ at home.', options: ['stay', 'will stay', 'stayed', 'would stay'], correctIndex: 1 },
      { id: 'eng_en_m_m_2', type: 'FILL_BLANK', question: 'She ___ English for three years.', options: ['learns', 'learned', 'has been learning', 'is learning'], correctIndex: 2 },
      { id: 'eng_en_m_m_3', type: 'VOCABULARY', question: 'What does "consequence" mean?', options: ['Cause', 'Result', 'Advice', 'Question'], correctIndex: 1 },
      { id: 'eng_en_m_m_4', type: 'GRAMMAR', question: 'Choose the correct sentence.', options: ['I was sleeping while the phone rang.', 'I was sleeping when the phone rang.', 'I slept when the phone was ringing.', 'I sleeping when phone rang.'], correctIndex: 1 },
      { id: 'eng_en_m_m_5', type: 'TRANSLATION', question: 'Choose the best rewrite: "I lost my keys."', options: ['My keys are losing.', 'I have lost my keys.', 'I am lose my keys.', 'My keys lose me.'], correctIndex: 1 },
      { id: 'eng_en_m_m_6', type: 'FILL_BLANK', question: 'You ___ study harder if you want to pass.', options: ['can', 'must', 'may', 'might'], correctIndex: 1 },
      { id: 'eng_en_m_m_7', type: 'VOCABULARY', question: 'What does "obstacle" mean?', options: ['Opportunity', 'Barrier', 'Map', 'Shortcut'], correctIndex: 1 },
      { id: 'eng_en_m_m_8', type: 'GRAMMAR', question: 'The cake ___ by my mother.', options: ['baked', 'was baked', 'is baking', 'has baked'], correctIndex: 1 },
      { id: 'eng_en_m_m_9', type: 'FILL_BLANK', question: 'By the time we arrived, the show ___ started.', options: ['has', 'had', 'was', 'did'], correctIndex: 1 },
      { id: 'eng_en_m_m_10', type: 'TRANSLATION', question: 'Choose the clearest meaning of "I wish you had come earlier."', options: ['You came early and I am happy.', 'You came late and I regret it.', 'You will come tomorrow.', 'You should not come.'], correctIndex: 1 },
      { id: 'eng_en_m_m_11', type: 'VOCABULARY', question: 'What does "investigate" mean?', options: ['To guess quickly', 'To search carefully', 'To forget', 'To cancel'], correctIndex: 1 },
      { id: 'eng_en_m_m_12', type: 'GRAMMAR', question: 'Choose the correct sentence.', options: ['She said she will call me.', 'She said she would call me.', 'She said she calls me.', 'She said she calling me.'], correctIndex: 1 },
    ],
    HARD: [
      { id: 'eng_en_m_h_1', type: 'GRAMMAR', question: 'If I ___ you, I would apologize.', options: ['am', 'was', 'were', 'be'], correctIndex: 2 },
      { id: 'eng_en_m_h_2', type: 'FILL_BLANK', question: 'He asked me where I ___.', options: ['live', 'lived', 'am living', 'have lived'], correctIndex: 1 },
      { id: 'eng_en_m_h_3', type: 'GRAMMAR', question: 'Choose the correct passive structure.', options: ['The bridge built in 1990.', 'The bridge was built in 1990.', 'The bridge was build in 1990.', 'The bridge is builted in 1990.'], correctIndex: 1 },
      { id: 'eng_en_m_h_4', type: 'VOCABULARY', question: 'What does "determination" mean?', options: ['Luck', 'Strong commitment', 'Fear', 'Silence'], correctIndex: 1 },
      { id: 'eng_en_m_h_5', type: 'FILL_BLANK', question: 'The letter ___ already ___ when I arrived.', options: ['was / sent', 'had been / sent', 'has been / sent', 'is / sent'], correctIndex: 1 },
      { id: 'eng_en_m_h_6', type: 'GRAMMAR', question: 'Neither Tom ___ Jerry came to the party.', options: ['or', 'and', 'nor', 'but'], correctIndex: 2 },
      { id: 'eng_en_m_h_7', type: 'TRANSLATION', question: 'Choose the most natural reported form.', options: ['She said: "I can help."', 'She said that she could help.', 'She said she can helped.', 'She says she could helped.'], correctIndex: 1 },
      { id: 'eng_en_m_h_8', type: 'VOCABULARY', question: 'What does "reputation" mean?', options: ['Public opinion about someone', 'A private diary', 'A loud speech', 'A legal document'], correctIndex: 0 },
      { id: 'eng_en_m_h_9', type: 'FILL_BLANK', question: 'I wish I ___ more time to study.', options: ['have', 'had', 'would have', 'having'], correctIndex: 1 },
      { id: 'eng_en_m_h_10', type: 'GRAMMAR', question: 'Choose the correct participle of "choose".', options: ['choosed', 'chose', 'chosen', 'choosing'], correctIndex: 2 },
      { id: 'eng_en_m_h_11', type: 'TRANSLATION', question: 'Choose the best completion.', options: ['Not only she sings, but also dances.', 'Not only does she sing, but she also dances.', 'Not only she sing, but she dance.', 'Not only she is sing, but dance.'], correctIndex: 1 },
      { id: 'eng_en_m_h_12', type: 'VOCABULARY', question: 'What does "remarkable" mean?', options: ['Ordinary', 'Worth noticing', 'Unclear', 'Temporary'], correctIndex: 1 },
    ],
  },
  ADVANCED: {
    EASY: [
      { id: 'eng_en_a_e_1', type: 'VOCABULARY', question: 'What does "ambiguous" mean?', options: ['Clear', 'Uncertain in meaning', 'Aggressive', 'Very detailed'], correctIndex: 1 },
      { id: 'eng_en_a_e_2', type: 'VOCABULARY', question: 'What does "coherent" mean?', options: ['Random', 'Logical and consistent', 'Very loud', 'Weak'], correctIndex: 1 },
      { id: 'eng_en_a_e_3', type: 'GRAMMAR', question: 'I\'d rather ___ than stay home.', options: ['go out', 'going out', 'to go out', 'went out'], correctIndex: 0 },
      { id: 'eng_en_a_e_4', type: 'FILL_BLANK', question: 'She ___ have left already; her car is gone.', options: ['can', 'must', 'should', 'would'], correctIndex: 1 },
      { id: 'eng_en_a_e_5', type: 'VOCABULARY', question: 'What does "obsolete" mean?', options: ['Brand new', 'No longer used', 'Expensive', 'Colorful'], correctIndex: 1 },
      { id: 'eng_en_a_e_6', type: 'GRAMMAR', question: 'Choose the best meaning of "ought to".', options: ['Strong possibility', 'Moral advice', 'Past regret', 'Future plan'], correctIndex: 1 },
      { id: 'eng_en_a_e_7', type: 'VOCABULARY', question: 'What does "scrutinize" mean?', options: ['Ignore quickly', 'Examine closely', 'Summarize briefly', 'Invent creatively'], correctIndex: 1 },
      { id: 'eng_en_a_e_8', type: 'TRANSLATION', question: 'Choose the best paraphrase: "The evidence is tentative."', options: ['The evidence is final.', 'The evidence is temporary and not certain.', 'The evidence is illegal.', 'The evidence is hidden.'], correctIndex: 1 },
      { id: 'eng_en_a_e_9', type: 'FILL_BLANK', question: 'You ___ submit your paper by Friday.', options: ['must', 'might', 'can', 'would'], correctIndex: 0 },
      { id: 'eng_en_a_e_10', type: 'GRAMMAR', question: 'Choose the correct sentence.', options: ['Need he to leave now?', 'Need he leave now?', 'Needs he leave now?', 'Need he leaving now?'], correctIndex: 1 },
      { id: 'eng_en_a_e_11', type: 'VOCABULARY', question: 'What does "versatile" mean?', options: ['Limited to one use', 'Able to adapt to many uses', 'Easy to break', 'Impossible to learn'], correctIndex: 1 },
      { id: 'eng_en_a_e_12', type: 'TRANSLATION', question: 'Choose the most natural rewrite.', options: ['She advocates for change.', 'She advices change.', 'She advocate to change.', 'She is advocate change.'], correctIndex: 0 },
    ],
    MEDIUM: [
      { id: 'eng_en_a_m_1', type: 'GRAMMAR', question: 'If I had studied, I ___ the exam.', options: ['pass', 'passed', 'would pass', 'would have passed'], correctIndex: 3 },
      { id: 'eng_en_a_m_2', type: 'FILL_BLANK', question: 'Not only ___ she smart, but she is also hardworking.', options: ['is', 'does', 'was', 'has'], correctIndex: 0 },
      { id: 'eng_en_a_m_3', type: 'VOCABULARY', question: 'What does "exacerbate" mean?', options: ['Improve', 'Make worse', 'Clarify', 'Remove'], correctIndex: 1 },
      { id: 'eng_en_a_m_4', type: 'GRAMMAR', question: 'Choose the correct inversion.', options: ['Had he known, he would refuse.', 'Had he known, he would have refused.', 'If had he known, he would refused.', 'Had known he, he would have refused.'], correctIndex: 1 },
      { id: 'eng_en_a_m_5', type: 'FILL_BLANK', question: 'He denied ___ the window.', options: ['break', 'broke', 'breaking', 'to break'], correctIndex: 2 },
      { id: 'eng_en_a_m_6', type: 'VOCABULARY', question: 'What does "undermine" mean?', options: ['Strengthen', 'Weaken gradually', 'Decorate', 'Celebrate'], correctIndex: 1 },
      { id: 'eng_en_a_m_7', type: 'TRANSLATION', question: 'Choose the best meaning of "plausible".', options: ['Impossible', 'Reasonably believable', 'Guaranteed', 'Illegal'], correctIndex: 1 },
      { id: 'eng_en_a_m_8', type: 'GRAMMAR', question: 'Lest he ___ late, he left early.', options: ['was', 'be', 'is', 'will be'], correctIndex: 1 },
      { id: 'eng_en_a_m_9', type: 'FILL_BLANK', question: 'She insisted ___ paying for dinner.', options: ['to', 'on', 'for', 'in'], correctIndex: 1 },
      { id: 'eng_en_a_m_10', type: 'VOCABULARY', question: 'What does "vindicate" mean?', options: ['Accuse publicly', 'Clear from blame', 'Delay a process', 'Hide evidence'], correctIndex: 1 },
      { id: 'eng_en_a_m_11', type: 'GRAMMAR', question: 'It was ___ difficult test that nobody passed.', options: ['so', 'such', 'very', 'too'], correctIndex: 1 },
      { id: 'eng_en_a_m_12', type: 'TRANSLATION', question: 'Choose the best paraphrase: "Notwithstanding the rain, we continued."', options: ['Because of rain, we stopped.', 'Despite the rain, we continued.', 'Before the rain, we continued.', 'If it rains, we continue.'], correctIndex: 1 },
    ],
    HARD: [
      { id: 'eng_en_a_h_1', type: 'GRAMMAR', question: 'I wish I ___ attended the meeting yesterday.', options: ['have', 'had', 'would have', 'could'], correctIndex: 1 },
      { id: 'eng_en_a_h_2', type: 'FILL_BLANK', question: 'Seldom ___ such a talented musician.', options: ['I have seen', 'have I seen', 'I saw', 'did I see'], correctIndex: 1 },
      { id: 'eng_en_a_h_3', type: 'VOCABULARY', question: 'What does "ostentatious" mean?', options: ['Modest', 'Showy and attention-seeking', 'Silent', 'Doubtful'], correctIndex: 1 },
      { id: 'eng_en_a_h_4', type: 'GRAMMAR', question: '___ it not been for your help, I would have failed.', options: ['If', 'Had', 'Were', 'Should'], correctIndex: 1 },
      { id: 'eng_en_a_h_5', type: 'TRANSLATION', question: 'Choose the best meaning of "surreptitious".', options: ['Open and honest', 'Secret and sneaky', 'Formal and polite', 'Simple and clear'], correctIndex: 1 },
      { id: 'eng_en_a_h_6', type: 'GRAMMAR', question: 'Scarcely had I spoken ___ he interrupted me.', options: ['when', 'than', 'before', 'as'], correctIndex: 0 },
      { id: 'eng_en_a_h_7', type: 'VOCABULARY', question: 'What does "exonerate" mean?', options: ['Blame strongly', 'Free from guilt', 'Question deeply', 'Punish officially'], correctIndex: 1 },
      { id: 'eng_en_a_h_8', type: 'FILL_BLANK', question: 'It\'s about time the government ___ action.', options: ['takes', 'took', 'take', 'taken'], correctIndex: 1 },
      { id: 'eng_en_a_h_9', type: 'GRAMMAR', question: '___ to rain, the match would be cancelled.', options: ['If it is', 'Were it', 'Should it', 'Had it'], correctIndex: 1 },
      { id: 'eng_en_a_h_10', type: 'VOCABULARY', question: 'What does "vicarious" mean?', options: ['Directly experienced', 'Experienced through someone else', 'Completely imaginary', 'Officially approved'], correctIndex: 1 },
      { id: 'eng_en_a_h_11', type: 'FILL_BLANK', question: 'So ___ was the news that everyone was shocked.', options: ['surprising', 'surprised', 'surprisingly', 'surprise'], correctIndex: 0 },
      { id: 'eng_en_a_h_12', type: 'TRANSLATION', question: 'Choose the best meaning of "paradoxical".', options: ['Completely logical', 'Self-contradictory but possibly true', 'Easy to prove', 'Historically accurate'], correctIndex: 1 },
    ],
  },
};

export const resolveEnglishAgeGroup = (age: number): EnglishAgeGroup => {
  if (age <= 8) return 'YOUNG';
  if (age <= 11) return 'MIDDLE';
  return 'ADVANCED';
};

export const getEnglishQuestionPool = (age: number, difficulty: Difficulty): EnglishQuestion[] => {
  const ageGroup = resolveEnglishAgeGroup(age);
  return ENGLISH_QUESTION_BANK_EN[ageGroup][difficulty] || ENGLISH_QUESTION_BANK_EN[ageGroup].MEDIUM;
};
