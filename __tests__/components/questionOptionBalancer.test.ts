import { balanceCorrectAnswerDistribution } from '../../src/components/exams/questionOptionBalancer';

interface MockQuestion {
  id: string;
  options: string[];
  correctIndex: number;
}

const buildRandomFromSequence = (values: number[]) => {
  let index = 0;
  return () => {
    const value = values[index % values.length];
    index += 1;
    return value;
  };
};

describe('questionOptionBalancer', () => {
  it('keeps the correct answer text while reordering options', () => {
    const questions: MockQuestion[] = [
      { id: 'q1', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
      { id: 'q2', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
      { id: 'q3', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
      { id: 'q4', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
    ];

    const balanced = balanceCorrectAnswerDistribution(
      questions,
      buildRandomFromSequence([0.2, 0.7, 0.4, 0.9, 0.1])
    );

    expect(balanced).toHaveLength(questions.length);
    balanced.forEach((question, index) => {
      const originalCorrect = questions[index].options[questions[index].correctIndex];
      expect(question.options[question.correctIndex]).toBe(originalCorrect);
    });
  });

  it('distributes correct indices almost evenly for same option count', () => {
    const questions: MockQuestion[] = Array.from({ length: 10 }, (_, index) => ({
      id: `q${index}`,
      options: ['A', 'B', 'C', 'D'],
      correctIndex: 1,
    }));

    const balanced = balanceCorrectAnswerDistribution(
      questions,
      buildRandomFromSequence([0.9, 0.1, 0.7, 0.3, 0.5, 0.2])
    );

    const counts = [0, 0, 0, 0];
    balanced.forEach(question => {
      counts[question.correctIndex] += 1;
    });

    const maxCount = Math.max(...counts);
    const minCount = Math.min(...counts);
    expect(maxCount - minCount).toBeLessThanOrEqual(1);
  });

  it('balances groups separately when option counts differ', () => {
    const questions: MockQuestion[] = [
      { id: 'q1', options: ['A', 'B', 'C'], correctIndex: 1 },
      { id: 'q2', options: ['A', 'B', 'C'], correctIndex: 1 },
      { id: 'q3', options: ['A', 'B', 'C'], correctIndex: 1 },
      { id: 'q4', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
      { id: 'q5', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
      { id: 'q6', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
      { id: 'q7', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
    ];

    const balanced = balanceCorrectAnswerDistribution(
      questions,
      buildRandomFromSequence([0.4, 0.8, 0.6, 0.2, 0.1])
    );

    const counts3 = [0, 0, 0];
    const counts4 = [0, 0, 0, 0];

    balanced.slice(0, 3).forEach(question => {
      counts3[question.correctIndex] += 1;
    });
    balanced.slice(3).forEach(question => {
      counts4[question.correctIndex] += 1;
    });

    expect(Math.max(...counts3) - Math.min(...counts3)).toBeLessThanOrEqual(1);
    expect(Math.max(...counts4) - Math.min(...counts4)).toBeLessThanOrEqual(1);
  });

  it('leaves invalid questions unchanged', () => {
    const questions: MockQuestion[] = [
      { id: 'valid', options: ['A', 'B', 'C', 'D'], correctIndex: 1 },
      { id: 'invalid', options: ['A', 'B', 'C', 'D'], correctIndex: 9 },
    ];

    const balanced = balanceCorrectAnswerDistribution(
      questions,
      buildRandomFromSequence([0.4, 0.2, 0.8])
    );

    expect(balanced[1]).toEqual(questions[1]);
  });
});
