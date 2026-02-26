export interface EventOutcomeTranslation {
  feedback?: string;
}

export interface EventChoiceTranslation {
  text?: string;
  feedback?: string;
  outcomes?: Record<string, EventOutcomeTranslation>;
}

export interface EventTranslation {
  text?: string;
  choices?: Record<string, EventChoiceTranslation>;
}

export type EventTranslationCatalog = Record<string, EventTranslation>;
