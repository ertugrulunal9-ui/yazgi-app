import {
  ENGLISH_QUESTION_BANK_EN,
  getEnglishQuestionPool,
  resolveEnglishAgeGroup,
} from '../../src/components/exams/englishExamContent';
import type { Difficulty } from '../../src/components/exams/MiniGameContainer';

describe('englishExamContent', () => {
  it('resolves age groups with expected boundaries', () => {
    expect(resolveEnglishAgeGroup(8)).toBe('YOUNG');
    expect(resolveEnglishAgeGroup(9)).toBe('MIDDLE');
    expect(resolveEnglishAgeGroup(11)).toBe('MIDDLE');
    expect(resolveEnglishAgeGroup(12)).toBe('ADVANCED');
  });

  it('keeps at least 12 questions per age+difficulty bucket', () => {
    const difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];
    const groups = Object.keys(ENGLISH_QUESTION_BANK_EN) as Array<keyof typeof ENGLISH_QUESTION_BANK_EN>;

    groups.forEach(group => {
      difficulties.forEach(difficulty => {
        expect(ENGLISH_QUESTION_BANK_EN[group][difficulty].length).toBeGreaterThanOrEqual(12);
      });
    });
  });

  it('ensures question structure and answer indices are valid', () => {
    const difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];
    const groups = Object.keys(ENGLISH_QUESTION_BANK_EN) as Array<keyof typeof ENGLISH_QUESTION_BANK_EN>;

    groups.forEach(group => {
      difficulties.forEach(difficulty => {
        ENGLISH_QUESTION_BANK_EN[group][difficulty].forEach(question => {
          expect(question.options).toHaveLength(4);
          expect(question.correctIndex).toBeGreaterThanOrEqual(0);
          expect(question.correctIndex).toBeLessThan(question.options.length);
          expect(question.question.trim().length).toBeGreaterThan(0);
        });
      });
    });
  });

  it('keeps EN question text free of Turkish-specific characters', () => {
    const trSpecificChars = /[çğıöşüÇĞİÖŞÜ]/;
    const difficulties: Difficulty[] = ['EASY', 'MEDIUM', 'HARD'];
    const groups = Object.keys(ENGLISH_QUESTION_BANK_EN) as Array<keyof typeof ENGLISH_QUESTION_BANK_EN>;

    groups.forEach(group => {
      difficulties.forEach(difficulty => {
        ENGLISH_QUESTION_BANK_EN[group][difficulty].forEach(question => {
          expect(trSpecificChars.test(question.question)).toBe(false);
          question.options.forEach(option => {
            expect(trSpecificChars.test(option)).toBe(false);
          });
        });
      });
    });
  });

  it('returns stable advanced hard samples', () => {
    const advancedHard = getEnglishQuestionPool(14, 'HARD').slice(0, 3).map(question => ({
      id: question.id,
      question: question.question,
      correctOption: question.options[question.correctIndex],
    }));

    expect(advancedHard).toMatchInlineSnapshot(`
      [
        {
          "correctOption": "had",
          "id": "eng_en_a_h_1",
          "question": "I wish I ___ attended the meeting yesterday.",
        },
        {
          "correctOption": "have I seen",
          "id": "eng_en_a_h_2",
          "question": "Seldom ___ such a talented musician.",
        },
        {
          "correctOption": "Showy and attention-seeking",
          "id": "eng_en_a_h_3",
          "question": "What does "ostentatious" mean?",
        },
      ]
    `);
  });
});
