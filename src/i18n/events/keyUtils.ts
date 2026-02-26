const INVALID_SEGMENT_CHARS = /[^a-zA-Z0-9_]+/g;
const MULTI_UNDERSCORE = /_+/g;
const EDGE_UNDERSCORE = /^_+|_+$/g;

export const sanitizeKeySegment = (value: string): string => {
  const normalized = value.trim();
  if (!normalized) return 'unknown';

  const sanitized = normalized
    .replace(INVALID_SEGMENT_CHARS, '_')
    .replace(MULTI_UNDERSCORE, '_')
    .replace(EDGE_UNDERSCORE, '');

  return sanitized || 'unknown';
};

export const buildEventTextKey = (eventId: string): string => (
  `events.content.${sanitizeKeySegment(eventId)}.text`
);

export const buildChoiceTextKey = (eventId: string, choiceToken: string): string => (
  `events.content.${sanitizeKeySegment(eventId)}.choices.${sanitizeKeySegment(choiceToken)}.text`
);

export const buildChoiceFeedbackKey = (eventId: string, choiceToken: string): string => (
  `events.content.${sanitizeKeySegment(eventId)}.choices.${sanitizeKeySegment(choiceToken)}.feedback`
);

export const buildOutcomeFeedbackKey = (
  eventId: string,
  choiceToken: string,
  outcomeToken: string
): string => (
  `events.content.${sanitizeKeySegment(eventId)}.choices.${sanitizeKeySegment(choiceToken)}.outcomes.${sanitizeKeySegment(outcomeToken)}.feedback`
);
