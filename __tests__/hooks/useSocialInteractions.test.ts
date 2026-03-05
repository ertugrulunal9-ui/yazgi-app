import { calculateSocialStressEffect } from '../../src/hooks/useSocialInteractions';

describe('calculateSocialStressEffect', () => {
  it('returns baseline stress relief for a social action', () => {
    expect(calculateSocialStressEffect('CHAT', 0)).toBe(-7);
  });

  it('keeps stress effect negative even if NPC outcome adds stress', () => {
    expect(calculateSocialStressEffect('COMPETE', 5)).toBe(-2);
  });

  it('combines relief with additional calming outcomes', () => {
    expect(calculateSocialStressEffect('HANGOUT', -3)).toBe(-13);
  });
});

