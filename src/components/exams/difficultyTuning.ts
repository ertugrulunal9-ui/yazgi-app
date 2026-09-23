import { Difficulty } from './MiniGameContainer';

/**
 * Makes HARD mode more approachable by composing mostly medium-level items
 * with a smaller sampled subset of hard-level items.
 */
export const buildFriendlyHardPool = <T extends { id: string }>(
    difficulty: Difficulty,
    mediumPool: T[],
    hardPool: T[],
    hardSamplingStep = 3
): T[] => {
    if (difficulty !== 'HARD') {
        return hardPool;
    }

    const sampledHard = hardPool.filter((_, index) => index % hardSamplingStep === 0);
    return [...mediumPool, ...sampledHard];
};

