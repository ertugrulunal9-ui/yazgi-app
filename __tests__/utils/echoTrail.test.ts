import { countPendingEchoes, recordEchoTrail } from '../../src/utils/echoTrail';
import { buildEchoShareLine, buildEchoTrailItems, EchoTrailItem, pickDefiningEchoes } from '../../src/utils/echoTrailView';
import { TurnMediator } from '../../src/systems/TurnMediator';
import { setRuntimeLocale } from '../../src/i18n/strings';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';
import type { Choice, GameState, ScheduledEvent } from '../../src/types';

const ECHO_LINK = {
  sourceEventId: 'tr_oyuncak_paylasim',
  sourceChoiceId: 'oyuncak_paylas',
  sourceAge: 3,
  targetEventId: 'early_toy_share_cooperation_echo',
  narrativeLine: '',
  emotion: 'NEUTRAL',
};

describe('recordEchoTrail', () => {
  it('records an echo the first time its event is answered', () => {
    expect(recordEchoTrail(undefined, ECHO_LINK, 'early_toy_share_cooperation_echo', 9)).toEqual([{
      sourceEventId: 'tr_oyuncak_paylasim',
      sourceChoiceId: 'oyuncak_paylas',
      sourceAge: 3,
      eventId: 'early_toy_share_cooperation_echo',
      age: 9,
    }]);
  });

  it('leaves the trail untouched for ordinary events, foreign links and repeats', () => {
    const log = recordEchoTrail([], ECHO_LINK, 'early_toy_share_cooperation_echo', 9);

    expect(recordEchoTrail(log, null, 'evt_other', 9)).toBe(log);
    expect(recordEchoTrail(log, { ...ECHO_LINK, sourceChoiceId: undefined }, 'early_toy_share_cooperation_echo', 9)).toBe(log);
    // Araya giren başka bir olay (ör. toparlanma) yankı sayılmaz
    expect(recordEchoTrail(log, ECHO_LINK, 'evt_recovery', 9)).toBe(log);
    expect(recordEchoTrail(log, ECHO_LINK, 'early_toy_share_cooperation_echo', 9)).toBe(log);
  });
});

describe('countPendingEchoes', () => {
  it('counts only scheduled events that come from a player choice', () => {
    const scheduled = [
      { id: 'a', eventId: 'e1', sourceEventId: 's1', sourceChoiceId: 'c1', sourceAge: 2 },
      { id: 'b', eventId: 'e2', sourceEventId: 's2' },
      { id: 'c', eventId: 'e3', sourceEventId: 's3', sourceChoiceId: 'c3', sourceAge: 5 },
    ] as unknown as ScheduledEvent[];

    expect(countPendingEchoes(scheduled)).toBe(2);
    expect(countPendingEchoes(undefined)).toBe(0);
  });
});

describe('buildEchoTrailItems', () => {
  beforeEach(() => setRuntimeLocale('tr'));

  it('shows the original choice and the first sentence of what came back', () => {
    const items = buildEchoTrailItems([{
      sourceEventId: 'tr_oyuncak_paylasim',
      sourceChoiceId: 'oyuncak_paylas',
      sourceAge: 3,
      eventId: 'early_toy_share_cooperation_echo',
      age: 9,
    }]);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      sourceAge: 3,
      age: 9,
      choiceText: 'Paylaş',
      summary: 'Sınıf projesinde tek bir malzeme kutusunu paylaşmanız gerekiyor.',
    });
  });

  it('skips entries whose event or choice no longer exists', () => {
    expect(buildEchoTrailItems([{
      sourceEventId: 'removed_event',
      sourceChoiceId: 'gone',
      sourceAge: 2,
      eventId: 'early_toy_share_cooperation_echo',
      age: 9,
    }])).toEqual([]);
  });
});

describe('pickDefiningEchoes', () => {
  const item = (sourceAge: number, age: number, choiceText = `c${sourceAge}`): EchoTrailItem => ({
    key: `${sourceAge}-${age}`,
    sourceAge,
    age,
    choiceText,
    summary: 's',
  });

  it('keeps the longest-reaching echoes and tells them in age order', () => {
    const items = [item(1, 2), item(3, 9), item(5, 7), item(2, 12), item(10, 11)];

    expect(pickDefiningEchoes(items).map(i => `${i.sourceAge}->${i.age}`)).toEqual(['2->12', '3->9', '5->7']);
  });

  it('builds a one-line share text from the most defining echo, or nothing without echoes', () => {
    setRuntimeLocale('tr');
    expect(buildEchoShareLine([item(1, 2, 'Anne!'), item(3, 9, 'Paylaş')]))
      .toBe('3 yaşındaki “Paylaş” seçimim 9 yaşımda geri döndü.');
    expect(buildEchoShareLine([])).toBeNull();
  });
});

describe('TurnMediator echo trail', () => {
  it('adds the echo to the trail when the player answers the echo event', () => {
    const base = getInitialGameState();
    const gameState: GameState = {
      ...base,
      age: 9,
      turn: 30,
      currentEvent: {
        id: 'early_toy_share_cooperation_echo',
        text: 'Sınıf projesi',
        minAge: 9,
        maxAge: 9,
        rarity: 'UNCOMMON',
        choices: [],
      },
      currentCausalLink: ECHO_LINK,
    };
    const choice: Choice = { id: 'ortak_calis', text: 'Ortak çalış', effect: {}, feedback: '' };

    const result = new TurnMediator().processEventChoice({ choice, gameState, stats: getInitialStats() });

    expect(result.gameStateUpdates.echoLog).toEqual([{
      sourceEventId: 'tr_oyuncak_paylasim',
      sourceChoiceId: 'oyuncak_paylas',
      sourceAge: 3,
      eventId: 'early_toy_share_cooperation_echo',
      age: 9,
    }]);
  });

  it('starts every new life with an empty trail', () => {
    expect(getInitialGameState().echoLog).toEqual([]);
  });
});
