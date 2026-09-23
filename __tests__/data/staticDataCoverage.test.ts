import { ENDINGS } from '../../src/data/endings';
import { FLAVOR_TEXTS, getRandomFlavor } from '../../src/data/flavorTexts';
import { LOADING_QUOTES, getLoadingQuoteByAge } from '../../src/data/loadingQuotes';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';

describe('static data coverage', () => {
  it('evaluates ending conditions against baseline state', () => {
    const gameState = getInitialGameState();
    const stats = getInitialStats();

    expect(ENDINGS.length).toBeGreaterThan(0);
    ENDINGS.forEach(ending => {
      expect(typeof ending.id).toBe('string');
      expect(typeof ending.condition(gameState, stats)).toBe('boolean');
    });
  });

  it('returns a loading quote for each age bucket', () => {
    expect(getLoadingQuoteByAge(1)).toEqual(expect.any(String));
    expect(getLoadingQuoteByAge(5)).toEqual(expect.any(String));
    expect(getLoadingQuoteByAge(10)).toEqual(expect.any(String));
    expect(getLoadingQuoteByAge(17)).toEqual(expect.any(String));
    expect(getLoadingQuoteByAge(30)).toEqual(expect.any(String));
    expect(LOADING_QUOTES.GENERAL.length).toBeGreaterThan(0);
  });

  it('returns random flavor text for each defined category', () => {
    (Object.keys(FLAVOR_TEXTS) as (keyof typeof FLAVOR_TEXTS)[]).forEach((category) => {
      const text = getRandomFlavor(category);
      expect(typeof text).toBe('string');
      expect(text.length).toBeGreaterThan(0);
    });
  });
});

