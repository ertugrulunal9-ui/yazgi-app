import { EVENTS } from '../../src/data/events';
import { validateEventPool } from '../../src/data/eventRegistry';
import { resolveOutcome } from '../../src/systems/ConditionalOutcomeResolver';
import type { Choice, EventContext, GameEvent, Stats } from '../../src/types';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';

/**
 * Şansa bağlı sonuçlar (conditionalOutcomes) için veri sözleşmesi:
 * seçim gerçek bir kumar olmalı (bedeli olan bir kötü sonuç var), ama her karakter
 * için en az bir sonuç seçilebilir olmalı (yoksa seçimin normal sonucuna düşülür).
 */

const buildContext = (statValue: number, personalityValue: number): EventContext => {
  const baseState = getInitialGameState();
  const stats: Stats = {
    ...getInitialStats(),
    health: statValue,
    intelligence: statValue,
    charisma: statValue,
    discipline: statValue,
    energy: statValue,
    familyRelation: statValue,
  };
  const personality = {
    openness: personalityValue,
    courage: personalityValue,
    empathy: personalityValue,
    patience: personalityValue,
    conformity: personalityValue,
  };

  return {
    age: 12,
    traits: [],
    stats,
    family: baseState.family,
    memories: [],
    personality,
    stress: baseState.stress,
    grades: baseState.schoolGrades,
    skills: baseState.skills,
  };
};

const LOW_CONTEXT = buildContext(0, 0);
const MID_CONTEXT = buildContext(50, 50);
const HIGH_CONTEXT = buildContext(100, 100);

interface GambleChoice {
  event: GameEvent;
  choice: Choice;
}

const GAMBLES: GambleChoice[] = EVENTS.flatMap(event => (
  event.choices
    .filter((entry): entry is Choice => typeof entry !== 'function')
    .filter(choice => (choice.conditionalOutcomes?.length ?? 0) > 0)
    .map(choice => ({ event, choice }))
));

const label = ({ event, choice }: GambleChoice): string => `${event.id}/${choice.id ?? '(id yok)'}`;

/** Hata mesajında hangi seçimin bozuk olduğunu göstermek için etiketli doğrulama. */
const expectAll = (check: (gamble: GambleChoice) => boolean): void => {
  const failing = GAMBLES.filter(gamble => !check(gamble)).map(label);
  expect(failing).toEqual([]);
};

describe('conditionalOutcomes (şansa bağlı sonuçlar)', () => {
  it('en az 20 statik seçimde tanımlı', () => {
    expect(GAMBLES.length).toBeGreaterThanOrEqual(20);
  });

  it('her kumar seçiminin id\'si ve geri dönüş (fallback) sonucu var', () => {
    expectAll(({ choice }) => (
      typeof choice.id === 'string'
      && choice.id.length > 0
      && choice.feedback.length > 0
      && Object.keys(choice.effect).length > 0
    ));
  });

  it('her kumar seçimi en az iki sonuç içerir', () => {
    expectAll(({ choice }) => choice.conditionalOutcomes!.length >= 2);
  });

  it('düşük, orta ve yüksek statlı her bağlamda en az bir sonuç seçilebilir', () => {
    for (const ctx of [LOW_CONTEXT, MID_CONTEXT, HIGH_CONTEXT]) {
      expectAll(({ choice }) => choice.conditionalOutcomes!.some(outcome => outcome.condition(ctx)));
    }
  });

  it('zayıf karakter gerçek bir kumarla karşılaşır (en az iki sonuç seçilebilir)', () => {
    expectAll(({ choice }) => (
      choice.conditionalOutcomes!.filter(outcome => outcome.condition(LOW_CONTEXT)).length >= 2
    ));
  });

  it('her kumar seçiminde gerçek bir bedel (negatif stat değişimi) var', () => {
    expectAll(({ choice }) => choice.conditionalOutcomes!.some(outcome => (
      Object.values(outcome.statChanges).some(value => typeof value === 'number' && value < 0)
    )));
  });

  it('sonuç id\'leri seçim içinde dolu ve benzersiz', () => {
    expectAll(({ choice }) => {
      const ids = choice.conditionalOutcomes!.map(outcome => outcome.id);
      return ids.every(id => typeof id === 'string' && id.length > 0) && new Set(ids).size === ids.length;
    });
  });

  it('her sonucun geri bildirimi dolu ve sonuçlar birbirinden farklı okunur', () => {
    expectAll(({ choice }) => {
      const feedbacks = choice.conditionalOutcomes!.map(outcome => outcome.feedback.trim());
      return feedbacks.every(text => text.length > 10) && new Set(feedbacks).size === feedbacks.length;
    });
  });

  it('ilk oturumda karşılaşılacak (maxAge <= 9) ve geç dönem (minAge >= 13) olaylara yayılmış', () => {
    const eventIds = (predicate: (event: GameEvent) => boolean): string[] => (
      Array.from(new Set(GAMBLES.filter(gamble => predicate(gamble.event)).map(gamble => gamble.event.id)))
    );

    expect(eventIds(event => event.maxAge <= 9).length).toBeGreaterThanOrEqual(6);
    expect(eventIds(event => event.minAge >= 13).length).toBeGreaterThanOrEqual(6);
  });

  it('çözümleyici zayıf ve güçlü karakterde de koşullu sonuç döndürür', () => {
    for (const ctx of [LOW_CONTEXT, HIGH_CONTEXT]) {
      expectAll(({ choice }) => resolveOutcome(choice, ctx).source === 'conditional');
    }
  });

  it('geliştirme modundaki şema doğrulaması conditionalOutcomes alanını silmez', () => {
    const events = Array.from(new Set(GAMBLES.map(gamble => gamble.event)));
    const validated = validateEventPool(events);

    const retained = validated
      .flatMap(event => event.choices)
      .filter((entry): entry is Choice => typeof entry !== 'function')
      .filter(choice => (choice.conditionalOutcomes?.length ?? 0) > 0);

    expect(retained.length).toBe(GAMBLES.length);
  });
});
