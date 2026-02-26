import type { AppLocale } from '../legacy';
import type { NestedRecord } from '../domains/types';
import { sanitizeKeySegment } from './keyUtils';
import { enEventTranslations } from './en';
import { trEventTranslations } from './tr';
import type {
  EventChoiceTranslation,
  EventOutcomeTranslation,
  EventTranslation,
  EventTranslationCatalog,
} from './types';

const CATALOGS: Record<AppLocale, EventTranslationCatalog> = {
  tr: trEventTranslations,
  en: enEventTranslations,
};

const mapOutcomeNode = (outcome: EventOutcomeTranslation): NestedRecord => {
  const node: NestedRecord = {};
  if (outcome.feedback) {
    node.feedback = outcome.feedback;
  }
  return node;
};

const mapChoiceNode = (choice: EventChoiceTranslation): NestedRecord => {
  const node: NestedRecord = {};
  if (choice.text) {
    node.text = choice.text;
  }
  if (choice.feedback) {
    node.feedback = choice.feedback;
  }
  if (choice.outcomes && Object.keys(choice.outcomes).length > 0) {
    const outcomesNode: NestedRecord = {};
    Object.entries(choice.outcomes).forEach(([outcomeId, outcome]) => {
      outcomesNode[sanitizeKeySegment(outcomeId)] = mapOutcomeNode(outcome);
    });
    node.outcomes = outcomesNode;
  }
  return node;
};

const mapEventNode = (event: EventTranslation): NestedRecord => {
  const node: NestedRecord = {};
  if (event.text) {
    node.text = event.text;
  }
  if (event.choices && Object.keys(event.choices).length > 0) {
    const choicesNode: NestedRecord = {};
    Object.entries(event.choices).forEach(([choiceId, choice]) => {
      choicesNode[sanitizeKeySegment(choiceId)] = mapChoiceNode(choice);
    });
    node.choices = choicesNode;
  }
  return node;
};

export const getEventContentStrings = (locale: AppLocale): NestedRecord => {
  const catalog = CATALOGS[locale];
  const contentNode: NestedRecord = {};

  Object.entries(catalog).forEach(([eventId, event]) => {
    contentNode[sanitizeKeySegment(eventId)] = mapEventNode(event);
  });

  return contentNode;
};
