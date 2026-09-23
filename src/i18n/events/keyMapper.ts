import type { Choice, ConditionalOutcome, EventContext, GameEvent } from '../../types';
import {
  buildChoiceFeedbackKey,
  buildChoiceTextKey,
  buildEventTextKey,
  buildOutcomeFeedbackKey,
  sanitizeKeySegment,
} from './keyUtils';

const getChoiceToken = (choice: Choice, index: number): string => (
  sanitizeKeySegment(choice.id || `choice_${index}`)
);

const getOutcomeToken = (outcome: ConditionalOutcome, index: number): string => (
  sanitizeKeySegment(outcome.id || `outcome_${index}`)
);

const mapConditionalOutcome = (
  eventId: string,
  choiceToken: string,
  outcome: ConditionalOutcome,
  outcomeIndex: number
): ConditionalOutcome => {
  const outcomeToken = getOutcomeToken(outcome, outcomeIndex);
  return {
    ...outcome,
    feedbackKey: outcome.feedbackKey || buildOutcomeFeedbackKey(eventId, choiceToken, outcomeToken),
  };
};

const mapChoice = (
  eventId: string,
  choice: Choice,
  choiceIndex: number
): Choice => {
  const choiceToken = getChoiceToken(choice, choiceIndex);
  return {
    ...choice,
    textKey: choice.textKey || buildChoiceTextKey(eventId, choiceToken),
    feedbackKey: choice.feedbackKey || buildChoiceFeedbackKey(eventId, choiceToken),
    conditionalOutcomes: choice.conditionalOutcomes?.map((outcome, outcomeIndex) => (
      mapConditionalOutcome(eventId, choiceToken, outcome, outcomeIndex)
    )),
  };
};

const mapChoiceEntry = (
  eventId: string,
  choiceEntry: Choice | ((context: EventContext) => Choice),
  choiceIndex: number
): Choice | ((context: EventContext) => Choice) => {
  if (typeof choiceEntry !== 'function') {
    return mapChoice(eventId, choiceEntry, choiceIndex);
  }

  return (context: EventContext): Choice => {
    const resolved = choiceEntry(context);
    return mapChoice(eventId, resolved, choiceIndex);
  };
};

export const withEventLocalizationKeys = (event: GameEvent): GameEvent => ({
  ...event,
  textKey: event.textKey || buildEventTextKey(event.id),
  choices: event.choices.map((choice, choiceIndex) => (
    mapChoiceEntry(event.id, choice, choiceIndex)
  )),
});

export const withEventLocalizationKeysForAll = (events: GameEvent[]): GameEvent[] => (
  events.map(withEventLocalizationKeys)
);
