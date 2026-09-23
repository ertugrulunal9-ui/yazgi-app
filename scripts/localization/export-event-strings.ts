import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

import type { Choice, ConditionalOutcome, EventContext, GameEvent } from '../../src/types/events';
import {
  buildChoiceFeedbackKey,
  buildChoiceTextKey,
  buildEventTextKey,
  buildOutcomeFeedbackKey,
  sanitizeKeySegment,
} from '../../src/i18n/events/keyUtils';

type OutcomeNode = {
  feedback?: string;
};

type ChoiceNode = {
  text?: string;
  feedback?: string;
  outcomes?: Record<string, OutcomeNode>;
};

type EventNode = {
  text?: string;
  choices?: Record<string, ChoiceNode>;
};

type EventCatalog = Record<string, EventNode>;

type ModuleShape = {
  EVENTS?: GameEvent[];
  ALL_CRISIS_EVENTS?: GameEvent[];
  MOMENTUM_EVENT_POOL?: Record<string, GameEvent[]>;
};

type ImportShape = {
  default?: ModuleShape;
  'module.exports'?: ModuleShape;
};

const OUTPUT_PATH = path.resolve('scripts/localization/event-source-catalog.json');

const unwrapModule = (value: ImportShape | ModuleShape): ModuleShape => {
  const withDefault = value as ImportShape;
  return withDefault.default || withDefault['module.exports'] || (value as ModuleShape);
};

const makeMockContext = (
  age: number,
  overrides?: Partial<EventContext>
): EventContext => ({
  age,
  traits: ['DISIPLINLI'],
  stats: {
    health: 70,
    intelligence: 68,
    charisma: 64,
    discipline: 66,
    energy: 72,
    money: 450,
    familyRelation: 62,
  },
  family: {
    wealth: 'MIDDLE',
    dynamic: 'SUPPORTIVE',
    allowance: 40,
  },
  memories: [],
  npcs: [],
  inventory: [],
  personality: {
    openness: 55,
    conscientiousness: 58,
    extraversion: 52,
    agreeableness: 61,
    neuroticism: 45,
    courage: 53,
    patience: 56,
    empathy: 62,
    conformity: 48,
  },
  stress: {
    current: 32,
    trend: 'STABLE',
    history: [],
  },
  grades: {
    math: 62,
    science: 60,
    language: 65,
    history: 58,
    geography: 57,
    english: 61,
    art: 63,
    music: 59,
  },
  skills: {
    coding: 28,
    music: 24,
    sports: 30,
    design: 22,
    athletics: 26,
    logic: 29,
    reading: 31,
    teamwork: 25,
    art: 21,
    writing: 23,
    work_ethic: 27,
    entrepreneurship: 19,
  },
  gameState: {
    age,
    turn: 2,
    phase: 'EVENT',
    currentEvent: null,
    pendingReportCard: false,
    characterInfo: null,
    historyLog: [],
    eventChoiceHistory: [],
    lastResult: null,
    schoolGrades: {
      math: 62,
      science: 60,
      language: 65,
      history: 58,
      geography: 57,
      english: 61,
      art: 63,
      music: 59,
    },
    traits: ['DISIPLINLI'],
    selectedGoal: null,
    maxEnergy: 100,
    memoryStage: 'NONE',
    memoryChoices: [],
    dailyDecisionCount: 0,
    stress: {
      current: 32,
      trend: 'STABLE',
      history: [],
    },
    personality: {
      openness: 55,
      conscientiousness: 58,
      extraversion: 52,
      agreeableness: 61,
      neuroticism: 45,
      courage: 53,
      patience: 56,
      empathy: 62,
      conformity: 48,
    },
    personalityHistory: [],
    personalityState: {
      version: 1,
      HELPFUL: { score: 0, streak: 0, multiplier: 1 },
      PRAGMATIC: { score: 0, streak: 0, multiplier: 1 },
      AGGRESSIVE: { score: 0, streak: 0, multiplier: 1 },
      recentSignals: [],
    },
    family: {
      wealth: 'MIDDLE',
      dynamic: 'SUPPORTIVE',
      allowance: 40,
    },
    familyThoughts: [],
    familyEvolution: {
      silencePoints: 0,
      trustPoints: 0,
      conflictPoints: 0,
      supportPoints: 0,
      milestone: null,
      history: [],
    },
    memories: [],
    npcs: [],
    socialGroups: [],
    activeArcs: [],
    recentEvents: [],
    eventFrequency: {},
    adaptivePacingStreak: 0,
    scheduledEvents: [],
    innerThought: '',
    innerThoughtType: 'NEUTRAL',
    actionCounts: {},
    actionHistory: [],
    unlockedAchievements: [],
    achievementProgress: {},
    inventory: [],
    examsTakenThisYear: [],
    isExamPeriod: false,
    skills: {
      coding: 28,
      music: 24,
      sports: 30,
      design: 22,
      athletics: 26,
      logic: 29,
      reading: 31,
      teamwork: 25,
      art: 21,
      writing: 23,
      work_ethic: 27,
      entrepreneurship: 19,
    },
    experience: 0,
    level: 1,
    selectedSaveSlot: null,
    unlockedSaveSlots: [1],
    saveMetadata: [],
    pendingCliffhanger: null,
    fate: undefined,
    traitProgress: {},
    savedRandomTailEvents: [],
    totalTurns: 2,
    onboarding: undefined,
    firstTurnChoiceMade: false,
    lastSelectedCategoryId: null,
    roleplayFlags: {},
  } as EventContext['gameState'],
  ...overrides,
});

const MOCK_CONTEXTS: EventContext[] = [
  makeMockContext(8),
  makeMockContext(13),
  makeMockContext(17),
];

const resolveChoiceWithContexts = (
  choiceLike: Choice | ((context: EventContext) => Choice)
): Choice | null => {
  if (typeof choiceLike !== 'function') return choiceLike;

  for (const ctx of MOCK_CONTEXTS) {
    try {
      const resolved = choiceLike(ctx);
      if (resolved && typeof resolved === 'object') return resolved;
    } catch {
      // Try next context.
    }
  }

  return null;
};

const resolveEventTextWithContexts = (
  textLike: GameEvent['text']
): string | null => {
  if (typeof textLike === 'string') return textLike;

  for (const ctx of MOCK_CONTEXTS) {
    try {
      const resolved = textLike(ctx);
      if (resolved && typeof resolved === 'string') {
        return resolved;
      }
    } catch {
      // Try next context.
    }
  }

  return null;
};

const ensureChoiceNode = (eventNode: EventNode, choiceToken: string): ChoiceNode => {
  if (!eventNode.choices) {
    eventNode.choices = {};
  }

  if (!eventNode.choices[choiceToken]) {
    eventNode.choices[choiceToken] = {};
  }

  return eventNode.choices[choiceToken];
};

const ensureOutcomeNode = (
  choiceNode: ChoiceNode,
  outcomeToken: string
): OutcomeNode => {
  if (!choiceNode.outcomes) {
    choiceNode.outcomes = {};
  }

  if (!choiceNode.outcomes[outcomeToken]) {
    choiceNode.outcomes[outcomeToken] = {};
  }

  return choiceNode.outcomes[outcomeToken];
};

const collectFromChoice = (
  eventId: string,
  eventNode: EventNode,
  choice: Choice,
  choiceIndex: number
): void => {
  const fallbackChoiceToken = `choice_${choiceIndex}`;
  const choiceToken = sanitizeKeySegment(choice.id || fallbackChoiceToken);
  const choiceNode = ensureChoiceNode(eventNode, choiceToken);

  const textKey = choice.textKey || buildChoiceTextKey(eventId, choiceToken);
  const feedbackKey = choice.feedbackKey || buildChoiceFeedbackKey(eventId, choiceToken);

  if (choice.text && typeof choice.text === 'string') {
    choiceNode.text = choice.text;
  }

  if (choice.feedback && typeof choice.feedback === 'string') {
    choiceNode.feedback = choice.feedback;
  }

  if (!choiceNode.text && textKey) {
    choiceNode.text = choice.text;
  }

  if (!choiceNode.feedback && feedbackKey) {
    choiceNode.feedback = choice.feedback;
  }

  if (choice.conditionalOutcomes && choice.conditionalOutcomes.length > 0) {
    choice.conditionalOutcomes.forEach((outcome: ConditionalOutcome, outcomeIndex) => {
      const fallbackOutcomeToken = `outcome_${outcomeIndex}`;
      const outcomeToken = sanitizeKeySegment(outcome.id || fallbackOutcomeToken);
      const outcomeNode = ensureOutcomeNode(choiceNode, outcomeToken);
      const feedbackValue = outcome.feedback;
      const feedbackKeyValue = outcome.feedbackKey || buildOutcomeFeedbackKey(eventId, choiceToken, outcomeToken);

      if (feedbackValue && typeof feedbackValue === 'string') {
        outcomeNode.feedback = feedbackValue;
      } else if (feedbackKeyValue) {
        outcomeNode.feedback = feedbackValue;
      }
    });
  }
};

const collectFromEvent = (catalog: EventCatalog, event: GameEvent): void => {
  const eventId = sanitizeKeySegment(event.id);
  if (!catalog[eventId]) {
    catalog[eventId] = {};
  }
  const eventNode = catalog[eventId];
  const textKey = event.textKey || buildEventTextKey(event.id);
  const resolvedEventText = resolveEventTextWithContexts(event.text);

  if (resolvedEventText && typeof resolvedEventText === 'string') {
    eventNode.text = resolvedEventText;
  } else if (!eventNode.text && textKey) {
    // Keep key path even when source text could not be resolved.
  }

  event.choices.forEach((choiceLike, choiceIndex) => {
    const choice = resolveChoiceWithContexts(choiceLike);
    if (!choice) return;
    collectFromChoice(event.id, eventNode, choice, choiceIndex);
  });
};

const uniqueById = (events: GameEvent[]): GameEvent[] => {
  const map = new Map<string, GameEvent>();
  events.forEach((event) => {
    if (!map.has(event.id)) {
      map.set(event.id, event);
    }
  });
  return Array.from(map.values());
};

const collectAllEvents = async (): Promise<GameEvent[]> => {
  (globalThis as Record<string, unknown>).__DEV__ = false;

  const eventsMod = unwrapModule(await import('../../src/data/events.ts'));
  const crisisMod = unwrapModule(await import('../../src/data/crisisEvents.ts'));
  const momentumMod = unwrapModule(await import('../../src/data/momentumEvents.ts'));

  const momentumPools = Object.values(momentumMod.MOMENTUM_EVENT_POOL || {}).flat();
  const allEvents = [
    ...(eventsMod.EVENTS || []),
    ...(crisisMod.ALL_CRISIS_EVENTS || []),
    ...momentumPools,
  ];

  return uniqueById(allEvents);
};

const main = async (): Promise<void> => {
  const allEvents = await collectAllEvents();
  const catalog: EventCatalog = {};

  allEvents.forEach((event) => collectFromEvent(catalog, event));

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  console.log(`Exported ${Object.keys(catalog).length} events -> ${OUTPUT_PATH}`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
