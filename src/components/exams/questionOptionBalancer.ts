export interface ChoiceQuestion {
  options: string[];
  correctIndex: number;
}

type RandomFn = () => number;

const isValidChoiceQuestion = (question: ChoiceQuestion): boolean =>
  Array.isArray(question.options) &&
  question.options.length >= 2 &&
  question.correctIndex >= 0 &&
  question.correctIndex < question.options.length;

const shuffleArray = <T>(items: T[], randomFn: RandomFn): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(randomFn() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const buildBalancedTargetIndices = (
  questionCount: number,
  optionCount: number,
  randomFn: RandomFn
): number[] => {
  const baseTargets = Array.from({ length: questionCount }, (_, index) => index % optionCount);
  return shuffleArray(baseTargets, randomFn);
};

const rebalanceSingleQuestion = <T extends ChoiceQuestion>(
  question: T,
  targetCorrectIndex: number,
  randomFn: RandomFn
): T => {
  if (!isValidChoiceQuestion(question)) {
    return question;
  }

  const correctOption = question.options[question.correctIndex];
  const distractors = question.options.filter((_, index) => index !== question.correctIndex);
  const shuffledDistractors = shuffleArray(distractors, randomFn);

  const nextOptions = [...shuffledDistractors];
  nextOptions.splice(targetCorrectIndex, 0, correctOption);

  return {
    ...question,
    options: nextOptions,
    correctIndex: targetCorrectIndex,
  };
};

export const balanceCorrectAnswerDistribution = <T extends ChoiceQuestion>(
  questions: T[],
  randomFn: RandomFn = Math.random
): T[] => {
  if (questions.length === 0) {
    return questions;
  }

  const balancedQuestions = [...questions];
  const groupsByOptionCount = new Map<number, number[]>();

  balancedQuestions.forEach((question, index) => {
    if (!isValidChoiceQuestion(question)) {
      return;
    }
    const optionCount = question.options.length;
    const group = groupsByOptionCount.get(optionCount) ?? [];
    group.push(index);
    groupsByOptionCount.set(optionCount, group);
  });

  groupsByOptionCount.forEach((indices, optionCount) => {
    const targetIndices = buildBalancedTargetIndices(indices.length, optionCount, randomFn);
    indices.forEach((questionIndex, indexInGroup) => {
      balancedQuestions[questionIndex] = rebalanceSingleQuestion(
        balancedQuestions[questionIndex],
        targetIndices[indexInGroup],
        randomFn
      );
    });
  });

  return balancedQuestions;
};
